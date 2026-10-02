import { describe, it, expect } from "vitest";
import { exportBackup, restoreBackup, validateBackup, importPhoneCsv, parsePhoneCsv, importEvents, integrityReport } from "@/data/backup";
import { countEvents } from "@/data/store";
import { memDb, withEvents, logged } from "./helpers";

describe("backup & import", () => {
  it("export → restore round trip reproduces projections exactly", () => {
    const src = withEvents([logged("a", "2026-09-01", "09:00", 60, { focus: 4 }), { type: "SETTINGS_CHANGED", payload: { patch: { phoneLimitMin: 45 }, effectiveFrom: "2026-09-01" } }]);
    const backup = JSON.parse(JSON.stringify(exportBackup(src)));
    const dst = memDb();
    expect(restoreBackup(dst, backup).restored).toBe(2);
    expect(dst.prepare("SELECT * FROM sessions").all()).toEqual(src.prepare("SELECT * FROM sessions").all());
    expect(dst.prepare("SELECT patch FROM settings_versions").all()).toEqual(src.prepare("SELECT patch FROM settings_versions").all());
  });
  it("corrupted backups are rejected without touching existing data", () => {
    const db = withEvents([logged("keep", "2026-09-01", "09:00", 60)]);
    const good = exportBackup(db);
    const bad = JSON.parse(JSON.stringify(good));
    bad.events[0].payload.domain = "HACKING";
    expect(validateBackup(bad).ok).toBe(false);
    expect(() => restoreBackup(db, bad)).toThrow(/rejected/);
    expect(() => restoreBackup(db, { format: "x" })).toThrow();
    expect(() => restoreBackup(db, { ...good, eventCount: 99 })).toThrow(/truncated/);
    expect(countEvents(db)).toBe(1);
    expect(db.prepare("SELECT id FROM sessions").all()).toEqual([{ id: "keep" }]);
  });
  it("import merges and deduplicates by event id", () => {
    const a = withEvents([logged("x", "2026-09-01", "09:00", 30)]);
    const b = exportBackup(a);
    expect(importEvents(a, b)).toEqual({ imported: 0, skipped: 1 });
    const c = memDb();
    expect(importEvents(c, b).imported).toBe(1);
  });
  it("phone CSV import validates rows and normalises categories", () => {
    const csv = "date,category,minutes,start,end,pickups\n2026-09-01,Social Networking,30,07:55,08:25,12\n2026-09-01,Education,15,,,\n2026-13-01,News,5,,,\n2026-09-02,News,abc,,,\n";
    const parsed = parsePhoneCsv(csv);
    expect(parsed.events).toHaveLength(2);
    expect(parsed.errors).toHaveLength(2);
    expect(parsed.events[0].payload).toMatchObject({ category: "Social Media", start: "2026-09-01T07:55:00", pickups: 12 });
    expect(parsed.events[1].payload).toMatchObject({ category: "Learning" });
    const db = memDb();
    expect(importPhoneCsv(db, csv).imported).toBe(2);
    importPhoneCsv(db, csv); // idempotent
    expect(db.prepare("SELECT COUNT(*) n FROM phone_usage").get()).toEqual({ n: 2 });
  });
  it("integrity report passes on a clean database", () => {
    const db = withEvents([logged("x", "2026-09-01", "09:00", 30)]);
    expect(integrityReport(db).every((c) => c.ok)).toBe(true);
  });
});
