/** Boot: SQLite (WASM) → load event log → replay projections → render. */
import { createRoot } from "react-dom/client";
import initSqlJs from "sql.js/dist/sql-wasm-browser.js";
import wasm from "../node_modules/sql.js/dist/sql-wasm-browser.wasm";
import { initBrowserDb } from "./shims/db";
import { insertStoredEvents } from "@/data/store";
import { exportBackup, exportDailyCsv, exportTableCsv, CSV_TABLES } from "@/data/backup";
import { getDataset } from "@/server/context";
import { GET as searchGET } from "@/app/api/search/route";
import { connectStore, loadEvents, flushPendingUpload } from "./persistence";
import { navigate } from "./router";
import { App } from "./App";

type ClaudeGlobal = { use?: (name: string) => Promise<unknown> };

function setBoot(text: string) {
  const el = document.getElementById("boot-msg");
  if (el) el.textContent = text;
}

/** Downloads go through the viewer's `downloads` capability (the frame blocks direct downloads). */
async function offerDownload(filename: string, data: string) {
  const claude = (window as unknown as { claude?: ClaudeGlobal }).claude;
  const dl = (await claude?.use?.("downloads")) as { save(r: { filename: string; data: string }): Promise<unknown> } | null;
  if (!dl) {
    showToast("Downloads are not available in this view.");
    return;
  }
  try {
    await dl.save({ filename, data });
  } catch (e) {
    const code = (e as { code?: string }).code;
    if (code !== "declined") showToast(`Download failed (${code ?? "error"}).`);
  }
}

function showToast(msg: string) {
  const t = document.createElement("div");
  t.textContent = msg;
  t.className = "panel fixed bottom-20 left-1/2 z-[70] -translate-x-1/2 px-4 py-2 text-sm shadow-xl";
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 4000);
}

function handleApi(href: string): boolean {
  const u = new URL(href, "https://apex.local");
  if (u.pathname === "/api/export") {
    const b = exportBackup(getDbSafe());
    void offerDownload(`apex-os-backup-${b.exportedAt.slice(0, 10)}.json`, JSON.stringify(b));
    return true;
  }
  if (u.pathname === "/api/export/csv") {
    const table = u.searchParams.get("table") ?? "daily";
    const body = table === "daily" ? exportDailyCsv(getDataset()) : (CSV_TABLES as readonly string[]).includes(table) ? exportTableCsv(getDbSafe(), table as (typeof CSV_TABLES)[number]) : "";
    void offerDownload(`apex-${table}.csv`, body);
    return true;
  }
  return false;
}

import { getDb as getDbSafe } from "./shims/db";

function installInterceptors() {
  // Internal links → in-memory router; /api links → local handlers.
  document.addEventListener("click", (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const a = (e.target as HTMLElement).closest("a");
    if (!a) return;
    const href = a.getAttribute("href");
    if (!href || href.startsWith("http") || href.startsWith("mailto:")) return;
    e.preventDefault();
    if (href.startsWith("/api/")) {
      handleApi(href);
      return;
    }
    if (href.startsWith("#")) {
      document.getElementById(href.slice(1))?.scrollIntoView({ block: "start" });
      return;
    }
    navigate(href);
  });
  // GET forms (filters) → router with query string.
  document.addEventListener(
    "submit",
    (e) => {
      const f = e.target as HTMLFormElement;
      if ((f.getAttribute("method") ?? "").toLowerCase() !== "get") return;
      e.preventDefault();
      const params = new URLSearchParams();
      new FormData(f).forEach((v, k) => {
        if (typeof v === "string" && v !== "") params.set(k, v);
      });
      const action = f.getAttribute("action");
      const base = action && action.startsWith("/") ? action : ((window as unknown as { __apexPath?: string }).__apexPath ?? "/");
      navigate(`${base}?${params.toString()}`);
    },
    true,
  );
  // fetch('/api/search') from the command palette → local route handler.
  const origFetch = window.fetch.bind(window);
  window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    if (url.startsWith("/api/search")) return Promise.resolve(searchGET(new Request(new URL(url, "https://apex.local"))));
    return origFetch(input, init);
  };
}

async function boot() {
  try {
    setBoot("Starting database…");
    const SQL = await initSqlJs({ wasmBinary: wasm });
    const db = initBrowserDb(SQL);
    setBoot("Connecting to your private storage…");
    await connectStore();
    setBoot("Loading your event log…");
    const { events } = await loadEvents();
    if (events.length) {
      setBoot(`Rebuilding ${events.length.toLocaleString()} events…`);
      await new Promise((r) => setTimeout(r, 20));
      db.transaction(() => insertStoredEvents(db, events));
    }
    installInterceptors();
    let start = "/";
    try {
      start = sessionStorage.getItem("apex-route") ?? "/";
    } catch {
      /* optional */
    }
    const hash = location.hash.replace(/^#/, "");
    if (/^[a-z]+$/.test(hash)) start = `/${hash === "today" ? "" : hash}`;
    navigate(start);
    document.getElementById("boot")?.remove();
    createRoot(document.getElementById("root")!).render(<App />);
    flushPendingUpload();
  } catch (e) {
    setBoot(`Could not start: ${(e as Error)?.message ?? e}`);
  }
}

void boot();
