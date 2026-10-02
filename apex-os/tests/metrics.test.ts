import { describe, it, expect } from "vitest";
import { buildDataset } from "@/data/facts";
import { windowAgg, rangeAgg, metric, aggregate, ctxOf } from "@/metrics/series";
import { streaks } from "@/modules/consistency";
import { phoneCompliance } from "@/modules/digital";
import { planVsActualToday } from "@/modules/execution";
import { withEvents, logged } from "./helpers";
import type { NewEvent } from "@/events/catalog";

function phone(day: string, minutes: number, category = "Social Media"): NewEvent {
  return { type: "PHONE_USAGE_ADDED", payload: { usageId: `p-${day}-${minutes}-${category}`, day, category, minutes } };
}

describe("metrics & facts", () => {
  it("ratio metrics aggregate as Σnum/Σden, not mean of daily ratios", () => {
    const db = withEvents([
      { type: "QUESTION_SET_LOGGED", occurredAt: "2026-09-01T10:00:00", payload: { attemptId: "a", area: "KC", total: 100, correct: 90 } },
      { type: "QUESTION_SET_LOGGED", occurredAt: "2026-09-02T10:00:00", payload: { attemptId: "b", area: "KC", total: 10, correct: 1 } },
    ]);
    const ds = buildDataset(db, "2026-09-02");
    expect(windowAgg(ds, "law.accuracy", "7D").value).toBeCloseTo((91 / 110) * 100, 6); // not (90+10)/2
    expect(windowAgg(ds, "law.questions", "7D").total).toBe(110);
  });
  it("sum metrics average over calendar days, phone over data days only", () => {
    const db = withEvents([logged("s1", "2026-09-01", "09:00", 60), logged("s2", "2026-09-03", "09:00", 120), phone("2026-09-01", 30), phone("2026-09-03", 90)]);
    const ds = buildDataset(db, "2026-09-03");
    expect(windowAgg(ds, "german.min", "7D").value).toBeCloseTo(60, 6); // 180 / 3 calendar days
    expect(windowAgg(ds, "phone.total", "7D").value).toBe(60); // (30+90)/2 data days — missing ≠ 0
    expect(windowAgg(ds, "phone.total", "7D").n).toBe(2);
  });
  it("phone compliance uses the limit valid on each day", () => {
    const db = withEvents([
      { type: "SETTINGS_CHANGED", payload: { patch: { phoneLimitMin: 90 }, effectiveFrom: "2026-09-01" } },
      { type: "SETTINGS_CHANGED", payload: { patch: { phoneLimitMin: 60 }, effectiveFrom: "2026-09-03" } },
      phone("2026-09-01", 80),
      phone("2026-09-02", 85),
      phone("2026-09-03", 80),
      phone("2026-09-04", 50),
    ]);
    const ds = buildDataset(db, "2026-09-04");
    const c = phoneCompliance(ds, 7);
    expect(c.under).toBe(3);
    expect(c.over).toBe(1);
    expect(c.cumulativeOverage).toBe(20);
    expect(windowAgg(ds, "phone.compliance", "7D").value).toBe(75);
  });
  it("execution % = actual / planned on planned days", () => {
    const db = withEvents([
      { type: "DAY_PLANNED", payload: { day: "2026-09-01", plannedMinutes: 480 } },
      logged("a", "2026-09-01", "08:00", 200),
      logged("b", "2026-09-01", "13:00", 172),
      logged("c", "2026-09-02", "08:00", 100),
    ]);
    const ds = buildDataset(db, "2026-09-02");
    expect(windowAgg(ds, "exec.pct", "7D").value).toBeCloseTo(77.5, 6);
    const ds1 = buildDataset(db, "2026-09-01");
    expect(planVsActualToday(ds1).pct).toBeCloseTo(77.5, 6);
  });
  it("deep work classification respects thresholds and user override", () => {
    const db = withEvents([
      logged("deep", "2026-09-01", "08:00", 60, { focus: 4, interruptions: 0 }),
      logged("normal", "2026-09-01", "10:00", 60, { focus: 3, interruptions: 0 }),
      logged("light", "2026-09-01", "12:00", 20, { focus: 5 }),
      logged("passive", "2026-09-01", "14:00", 90, { activity: "listening", focus: 5 }),
      logged("override", "2026-09-01", "16:00", 30, { depth: "DEEP" }),
    ]);
    const ds = buildDataset(db, "2026-09-01");
    const d = ds.days[0];
    expect(d.deepMin).toBe(90);
    expect(d.normalMin).toBe(60);
    expect(d.lightMin).toBe(110);
    expect(d.german.passive).toBe(90);
    expect(windowAgg(ds, "german.activeRatio", "7D").value).toBeCloseTo((170 / 260) * 100, 6);
  });
  it("streak: today in progress never breaks it; consistency shown separately", () => {
    const evs: NewEvent[] = [];
    for (const d of ["2026-09-01", "2026-09-02", "2026-09-03", "2026-09-05", "2026-09-06"]) evs.push(logged(`s-${d}`, d, "09:00", 30));
    const db = withEvents(evs);
    const ds = buildDataset(db, "2026-09-07");
    const st = streaks(ds, []);
    expect(st.current).toBe(2); // 05,06 — today (07) not yet done
    expect(st.longest).toBe(3);
    expect(st.todayMet).toBe(false);
    expect(st.consistency30).toBeCloseTo((5 / 7) * 100, 6);
    expect(streaks(buildDataset(db, "2026-09-08"), []).current).toBe(0);
  });
  it("median/max aggregation", () => {
    const db = withEvents([
      logged("a", "2026-09-01", "08:00", 60, { plannedStart: "2026-09-01T07:50", focus: 4 }),
      logged("b", "2026-09-01", "11:00", 90, { plannedStart: "2026-09-01T11:00", focus: 4 }),
      logged("c", "2026-09-02", "08:00", 50, { plannedStart: "2026-09-01T07:30", focus: 4 }),
    ]);
    const ds = buildDataset(db, "2026-09-02");
    expect(windowAgg(ds, "startDelay.median", "7D").value).toBe(10);
    expect(windowAgg(ds, "deep.longest", "7D").value).toBe(90);
    expect(aggregate(metric("deep.min"), [], ctxOf(ds)).value).toBeNull();
    expect(rangeAgg(ds, "german.min", "2026-01-01", "2026-01-05").value).toBeNull();
  });
  it("empty database yields an empty but valid dataset", () => {
    const ds = buildDataset(withEvents([]), "2026-09-02");
    expect(ds.days).toHaveLength(0);
    expect(windowAgg(ds, "german.min", "30D").value).toBeNull();
    expect(windowAgg(ds, "german.min", "30D").total).toBe(0);
  });
});
