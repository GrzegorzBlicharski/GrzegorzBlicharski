/**
 * Browser implementation of the `Db` interface over sql.js (SQLite compiled to WASM).
 * Same SQL, same migrations, same projector as the server build.
 */
import type { Database, SqlJsStatic, Statement as SqlStatement } from "sql.js";
import { migrate } from "@/data/migrations";

export type SqlValue = string | number | null | bigint | Uint8Array;
export type Param = SqlValue | boolean | undefined;
export type Row = Record<string, SqlValue>;

export interface Statement {
  run(...params: Param[]): { changes: number; lastInsertRowid: number };
  get<T = Row>(...params: Param[]): T | undefined;
  all<T = Row>(...params: Param[]): T[];
}

export interface Db {
  exec(sql: string): void;
  prepare(sql: string): Statement;
  transaction<T>(fn: () => T): T;
  close(): void;
  readonly path: string;
}

function norm(p: Param): string | number | null | Uint8Array {
  if (p === undefined || p === null) return null;
  if (typeof p === "boolean") return p ? 1 : 0;
  if (typeof p === "bigint") return Number(p);
  return p;
}

export function wrapSqlJs(raw: Database): Db {
  const cache = new Map<string, SqlStatement>();
  let depth = 0;
  const st = (sql: string) => {
    let s = cache.get(sql);
    if (!s) {
      s = raw.prepare(sql);
      cache.set(sql, s);
    }
    return s;
  };
  const lastId = () => {
    const s = st("SELECT last_insert_rowid() AS id");
    s.step();
    const id = Number(s.getAsObject().id);
    s.reset();
    return id;
  };
  const db: Db = {
    path: "browser (SQLite/WASM) · persisted to your private artifact store",
    exec: (sql) => raw.exec(sql),
    prepare(sql) {
      return {
        run: (...params) => {
          const s = st(sql);
          s.bind(params.map(norm));
          s.step();
          s.reset();
          return { changes: raw.getRowsModified(), lastInsertRowid: lastId() };
        },
        get: <T,>(...params: Param[]) => {
          const s = st(sql);
          s.bind(params.map(norm));
          const row = s.step() ? (s.getAsObject() as T) : undefined;
          s.reset();
          return row;
        },
        all: <T,>(...params: Param[]) => {
          const s = st(sql);
          s.bind(params.map(norm));
          const rows: T[] = [];
          while (s.step()) rows.push(s.getAsObject() as T);
          s.reset();
          return rows;
        },
      };
    },
    transaction<T>(fn: () => T): T {
      const sp = `sp_${depth}`;
      if (depth === 0) raw.exec("BEGIN");
      else raw.exec(`SAVEPOINT ${sp}`);
      depth++;
      try {
        const out = fn();
        depth--;
        if (depth === 0) raw.exec("COMMIT");
        else raw.exec(`RELEASE ${sp}`);
        return out;
      } catch (e) {
        depth--;
        if (depth === 0) raw.exec("ROLLBACK");
        else raw.exec(`ROLLBACK TO ${sp}; RELEASE ${sp}`);
        throw e;
      }
    },
    close: () => raw.close(),
  };
  return db;
}

let singleton: Db | null = null;

export function initBrowserDb(SQL: SqlJsStatic): Db {
  const raw = new SQL.Database();
  raw.exec("PRAGMA foreign_keys = ON;");
  singleton = wrapSqlJs(raw);
  migrate(singleton);
  return singleton;
}

export function getDb(): Db {
  if (!singleton) throw new Error("Database not initialised yet");
  return singleton;
}

export function openDb(): Db {
  return getDb();
}
