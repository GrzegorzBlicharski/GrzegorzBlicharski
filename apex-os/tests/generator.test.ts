import { describe, it, expect } from "vitest";
import { generateFictional } from "@/data/generator";
import { withEvents } from "./helpers";
import { buildDataset } from "@/data/facts";
import { generateInsights } from "@/coach/insights";
import { todayView } from "@/coach/today";
import { buildReport } from "@/reports/build";

describe("fictional multi-year data", () => {
  it("is deterministic", () => {
    const a = generateFictional({ start: "2025-01-01", days: 60, seed: 3 });
    const b = generateFictional({ start: "2025-01-01", days: 60, seed: 3 });
    expect(a).toEqual(b);
  });
  it("three fictional years load and analyse within a performance budget", () => {
    const t0 = Date.now();
    const db = withEvents(generateFictional({ start: "2023-10-01", days: 1096, seed: 11 }));
    const t1 = Date.now();
    const ds = buildDataset(db, "2026-09-30");
    const ins = generateInsights(ds);
    todayView(ds, ins);
    buildReport(ds, "year", ds.asOf, ins);
    const t2 = Date.now();
    expect(ds.days).toHaveLength(1096);
    expect(ds.sessions.length).toBeGreaterThan(4000);
    expect(t2 - t1).toBeLessThan(15000);
    expect(t1 - t0).toBeLessThan(60000);
  });
});
