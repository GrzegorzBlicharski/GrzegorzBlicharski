/* Seed fictional multi-year data. Usage: npm run seed [-- --years=2 --large --reset --db=path] */
import { openDb } from "../src/data/db";
import { appendEvents, countEvents, rebuildProjections } from "../src/data/store";
import { generateFictional } from "../src/data/generator";
import { addDays, todayLogical } from "../src/core/dates";
import path from "node:path";

const args = Object.fromEntries(process.argv.slice(2).map((a) => { const [k, v] = a.replace(/^--/, "").split("="); return [k, v ?? "true"]; }));
const years = Number(args.years ?? 1);
const dbPath = args.db ?? process.env.APEX_DB_PATH ?? path.join(process.cwd(), "data", "apex.db");
const db = openDb(dbPath);
if (args.reset === "true" || args.reset === undefined) {
  if (countEvents(db) > 0 && args.reset !== "true") {
    console.error(`Database ${dbPath} already has events. Re-run with --reset=true to wipe it (fictional seed data).`);
    process.exit(1);
  }
  db.exec("DELETE FROM events");
}
const days = Math.round(years * 365);
const end = todayLogical();
const start = addDays(end, -(days - 1));
const t0 = Date.now();
const events = generateFictional({ start, days, seed: 42, large: args.large === "true" });
const t1 = Date.now();
const CHUNK = 20000;
// rebuild projections from scratch to keep it clean
for (let i = 0; i < events.length; i += CHUNK) {
  appendEvents(db, events.slice(i, i + CHUNK));
  process.stdout.write(`\r${Math.min(i + CHUNK, events.length)}/${events.length} events`);
}
rebuildProjections(db);
const sessions = db.prepare("SELECT COUNT(*) n FROM sessions").get() as { n: number };
const attempts = db.prepare("SELECT COUNT(*) rows, SUM(n) answers FROM question_attempts").get() as { rows: number; answers: number };
console.log(`\nSeeded ${events.length} events (${years}y, ${start} → ${end}) into ${dbPath} in ${((Date.now() - t0) / 1000).toFixed(1)}s (generate ${((t1 - t0) / 1000).toFixed(1)}s).`);
console.log(`sessions=${sessions.n} attemptRows=${attempts.rows} answers=${attempts.answers}`);
