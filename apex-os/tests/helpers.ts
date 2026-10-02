import { openDb, type Db } from "@/data/db";
import { appendEvents } from "@/data/store";
import { buildDataset } from "@/data/facts";
import type { NewEvent } from "@/events/catalog";
import { generateFictional } from "@/data/generator";
import type { Dataset } from "@/core/types";

export function memDb(): Db {
  return openDb(":memory:");
}

export function withEvents(events: NewEvent[]): Db {
  const db = memDb();
  if (events.length) appendEvents(db, events);
  return db;
}

let fiction: { db: Db; ds: Dataset; start: string; end: string } | null = null;
/** Shared fictional 2-year dataset (deterministic). */
export function fictional(): { db: Db; ds: Dataset; start: string; end: string } {
  if (!fiction) {
    const start = "2024-10-01";
    const days = 730;
    const db = withEvents(generateFictional({ start, days, seed: 7 }));
    const end = "2026-09-30";
    fiction = { db, ds: buildDataset(db, end), start, end };
  }
  return fiction;
}

export function logged(id: string, day: string, start: string, minutes: number, extra: Record<string, unknown> = {}): NewEvent {
  const s = `${day}T${start}:00`;
  const [h, m] = start.split(":").map(Number);
  const endMin = h * 60 + m + minutes;
  const e = `${day}T${String(Math.floor(endMin / 60)).padStart(2, "0")}:${String(endMin % 60).padStart(2, "0")}:00`;
  return { type: "SESSION_LOGGED", occurredAt: e, payload: { sessionId: id, domain: "GERMAN", activity: "speaking", start: s, end: e, ...extra } };
}
