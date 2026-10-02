/**
 * Durable storage for the browser build.
 * Primary: the artifact's private `db` store (data/users/<id>/…), event log in ≤200 KB chunks.
 * Mirror: IndexedDB in this browser (fast start, offline, fallback when the store is unavailable).
 * The event log is the only thing stored; every projection is rebuilt from it on load.
 */
import type { StoredEvent } from "@/events/catalog";
import { getDb } from "./shims/db";
import { refresh } from "./router";

type ClaudeGlobal = { use?: (name: string) => Promise<unknown> };
interface DocSnap {
  id: string;
  exists: boolean;
  data(): Record<string, unknown> | undefined;
}
interface DocRef {
  get(): Promise<DocSnap>;
  set(d: Record<string, unknown>): Promise<void>;
  delete(): Promise<void>;
}
interface CollRef {
  doc(id: string): DocRef;
  get(): Promise<{ docs: DocSnap[] }>;
}
interface DbApi {
  collection(p: string): CollRef;
}

export type StorageMode = "account" | "browser" | "memory";
export interface StorageStatus {
  mode: StorageMode;
  saving: boolean;
  lastSaved: string | null;
  error: string | null;
}

let status: StorageStatus = { mode: "memory", saving: false, lastSaved: null, error: null };
const statusListeners = new Set<() => void>();
const setStatus = (p: Partial<StorageStatus>) => {
  status = { ...status, ...p };
  statusListeners.forEach((l) => l());
};
export const getStatus = () => status;
export const subscribeStatus = (l: () => void) => {
  statusListeners.add(l);
  return () => statusListeners.delete(l);
};

let coll: CollRef | null = null;
type Row = [number, string, string, number, string, string, string | null, string, Record<string, unknown>];
const toRow = (e: StoredEvent): Row => [e.id, e.eventId, e.type, e.schemaVersion, e.occurredAt, e.recordedAt, e.entityId, e.source, e.payload];
const fromRow = (r: Row): StoredEvent => ({ id: r[0], eventId: r[1], type: r[2] as StoredEvent["type"], schemaVersion: r[3], occurredAt: r[4], recordedAt: r[5], entityId: r[6], source: r[7], payload: r[8] });

const CHUNK_BYTES = 190_000;
interface Chunk {
  id: string;
  rows: Row[];
  bytes: number;
}
let chunks: Chunk[] = [];
let persistedCount = 0;
let persistedLastEventId: string | null = null;

const chunkId = (i: number) => `c${String(i).padStart(5, "0")}`;

// ───────────── IndexedDB mirror ─────────────
function idb(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    try {
      const req = indexedDB.open("apex-os", 1);
      req.onupgradeneeded = () => req.result.createObjectStore("kv");
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}
async function idbGet(key: string): Promise<unknown> {
  const d = await idb();
  if (!d) return null;
  return new Promise((resolve) => {
    try {
      const r = d.transaction("kv").objectStore("kv").get(key);
      r.onsuccess = () => resolve(r.result ?? null);
      r.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}
async function idbSet(key: string, value: unknown): Promise<boolean> {
  const d = await idb();
  if (!d) return false;
  return new Promise((resolve) => {
    try {
      const tx = d.transaction("kv", "readwrite");
      tx.objectStore("kv").put(value, key);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
}

// ───────────── Load ─────────────
export async function connectStore(): Promise<void> {
  const claude = (window as unknown as { claude?: ClaudeGlobal }).claude;
  if (!claude?.use) return;
  try {
    const [db, user] = (await Promise.all([claude.use("db"), claude.use("user")])) as [DbApi | null, { id(): Promise<string | null> } | null];
    const uid = user ? await user.id() : null;
    if (db && uid) coll = db.collection(`data/users/${uid}`);
  } catch {
    coll = null;
  }
}

/** Load the event log: account store first, then the browser mirror. */
export async function loadEvents(): Promise<{ events: StoredEvent[]; source: StorageMode }> {
  if (coll) {
    try {
      const snap = await coll.get();
      const docs = snap.docs.filter((d) => d.exists && d.id.startsWith("c")).sort((a, b) => (a.id < b.id ? -1 : 1));
      if (docs.length) {
        chunks = docs.map((d) => {
          const rows = (d.data()?.rows ?? []) as Row[];
          return { id: d.id, rows, bytes: JSON.stringify(rows).length };
        });
        const events = chunks.flatMap((c) => c.rows.map(fromRow)).sort((a, b) => a.id - b.id);
        persistedCount = events.length;
        persistedLastEventId = events.length ? events[events.length - 1].eventId : null;
        setStatus({ mode: "account" });
        void idbSet("events", events.map(toRow));
        return { events, source: "account" };
      }
      setStatus({ mode: "account" });
    } catch (e) {
      setStatus({ error: `Account store unavailable: ${(e as { message?: string }).message ?? e}` });
      coll = null;
    }
  }
  const local = (await idbGet("events")) as Row[] | null;
  const events = (local ?? []).map(fromRow).sort((a, b) => a.id - b.id);
  if (!coll) setStatus({ mode: (await idb()) ? "browser" : "memory" });
  // First run with an account store but data only in this browser: upload it.
  if (coll && events.length) {
    persistedCount = 0;
    persistedLastEventId = null;
    chunks = [];
    pendingFullUpload = true;
  }
  return { events, source: coll ? "account" : "browser" };
}

let pendingFullUpload = false;

// ───────────── Save ─────────────
let inflight: Promise<void> | null = null;
let dirty = false;

function currentEvents(): StoredEvent[] {
  return getDb()
    .prepare("SELECT * FROM events ORDER BY id")
    .all<Record<string, string | number | null>>()
    .map((r) => ({
      id: r.id as number,
      eventId: r.event_id as string,
      type: r.type as StoredEvent["type"],
      schemaVersion: r.schema_version as number,
      occurredAt: r.occurred_at as string,
      recordedAt: r.recorded_at as string,
      entityId: (r.entity_id as string | null) ?? null,
      source: r.source as string,
      payload: JSON.parse(r.payload as string),
    }));
}

async function writeChunk(c: Chunk): Promise<void> {
  if (!coll) return;
  await coll.doc(c.id).set({ rows: c.rows, n: c.rows.length, updatedAt: new Date().toISOString() });
}

async function persistOnce(): Promise<void> {
  const events = currentEvents();
  const lastPersisted = persistedCount > 0 ? events[persistedCount - 1] : null;
  const appendOnly = !pendingFullUpload && events.length >= persistedCount && (persistedCount === 0 ? chunks.length === 0 : lastPersisted?.eventId === persistedLastEventId);
  setStatus({ saving: true });
  try {
    await idbSet("events", events.map(toRow));
    if (coll) {
      if (appendOnly) {
        const fresh = events.slice(persistedCount);
        const touched = new Set<Chunk>();
        for (const e of fresh) {
          const row = toRow(e);
          const size = JSON.stringify(row).length + 1;
          let last = chunks[chunks.length - 1];
          if (!last || last.bytes + size > CHUNK_BYTES) {
            last = { id: chunkId(chunks.length), rows: [], bytes: 2 };
            chunks.push(last);
          }
          last.rows.push(row);
          last.bytes += size;
          touched.add(last);
        }
        for (const c of touched) await writeChunk(c);
      } else {
        // History was replaced (restore / wipe / demo): rewrite every chunk, then drop leftovers.
        const old = chunks.length;
        chunks = [];
        for (const e of events) {
          const row = toRow(e);
          const size = JSON.stringify(row).length + 1;
          let last = chunks[chunks.length - 1];
          if (!last || last.bytes + size > CHUNK_BYTES) {
            last = { id: chunkId(chunks.length), rows: [], bytes: 2 };
            chunks.push(last);
          }
          last.rows.push(row);
          last.bytes += size;
        }
        for (const c of chunks) await writeChunk(c);
        for (let i = chunks.length; i < old; i++) await coll.doc(chunkId(i)).delete();
        pendingFullUpload = false;
      }
    }
    persistedCount = events.length;
    persistedLastEventId = events.length ? events[events.length - 1].eventId : null;
    setStatus({ saving: false, lastSaved: new Date().toLocaleTimeString(), error: null });
  } catch (e) {
    const code = (e as { code?: string }).code;
    setStatus({
      saving: false,
      error:
        code === "quota_exceeded"
          ? "Account storage is full — export a backup (Data & backup) and remove demo data. Changes are still kept in this browser."
          : `Could not save to your account (${code ?? "error"}). Changes are kept in this browser; they will sync on the next save.`,
    });
    // Force a full rewrite next time so the account copy converges.
    pendingFullUpload = true;
  }
}

function schedulePersist(): void {
  if (inflight) {
    dirty = true;
    return;
  }
  inflight = persistOnce().finally(() => {
    inflight = null;
    if (dirty) {
      dirty = false;
      schedulePersist();
    }
  });
}

/** Called after every write (via the revalidatePath shim). */
export function afterWrite(): void {
  refresh();
  schedulePersist();
}

/** Upload browser-only data on first connection to the account store. */
export function flushPendingUpload(): void {
  if (pendingFullUpload) schedulePersist();
}
