import { describe, it, expect } from "vitest";
import { buildDataset } from "@/data/facts";
import { goalStatus, monteCarlo, hoursScenarios, phoneScenarios } from "@/forecasting/goals";
import { resolveForecasts } from "@/forecasting/log";
import { withEvents, logged } from "./helpers";
import { addDays } from "@/core/dates";
import type { NewEvent } from "@/events/catalog";

function base(days: number, minutes: number): NewEvent[] {
  const evs: NewEvent[] = [
    { type: "GOAL_CREATED", payload: { goalId: "g", title: "German 100h", domain: "GERMAN", kind: "cumulative", metricKey: "german.min", target: 100, unit: "h", startDate: "2026-01-01", deadline: "2026-04-10", weight: 5, tier: "PRIMARY" } },
  ];
  for (let i = 0; i < days; i++) evs.push(logged(`s${i}`, addDays("2026-01-01", i), "09:00", minutes));
  return evs;
}

describe("forecasting", () => {
  it("pace: on track / behind / ahead", () => {
    const g = (minutes: number) => {
      const ds = buildDataset(withEvents(base(50, minutes)), addDays("2026-01-01", 49));
      return goalStatus(ds, ds.goals[0]);
    };
    expect(g(60).status).toBe("ON TRACK"); // 50h of 100h at day 50/99
    expect(g(40).status).toBe("BEHIND");
    expect(g(80).status).toBe("AHEAD");
    const s = g(60);
    expect(s.current).toBeCloseTo(50);
    expect(s.rate30).toBeCloseTo(1);
    expect(s.projectedDate).toBe(addDays(addDays("2026-01-01", 49), 50));
  });
  it("Monte Carlo is reproducible, bounded and honest", () => {
    const ds = buildDataset(withEvents(base(50, 60)), addDays("2026-01-01", 49));
    const a = monteCarlo(ds, ds.goals[0]);
    const b = monteCarlo(ds, ds.goals[0]);
    expect(a).toEqual(b);
    expect(a.ok).toBe(true);
    expect(a.probabilityByDeadline!).toBeGreaterThanOrEqual(0.05);
    expect(a.probabilityByDeadline!).toBeLessThanOrEqual(0.95);
    expect((a.probabilityByDeadline! * 20) % 1).toBeCloseTo(0, 6); // multiples of 5%
    expect(a.p50).not.toBeNull();
    expect(a.assumptions.length).toBeGreaterThan(0);
  });
  it("Monte Carlo refuses with insufficient history", () => {
    const ds = buildDataset(withEvents(base(10, 60)), addDays("2026-01-01", 9));
    expect(monteCarlo(ds, ds.goals[0]).ok).toBe(false);
  });
  it("scenarios use execution ratio and flag above-capacity", () => {
    const evs = base(40, 120);
    for (let i = 0; i < 40; i++) evs.push({ type: "DAY_PLANNED", payload: { day: addDays("2026-01-01", i), plannedMinutes: 150 } });
    const ds = buildDataset(withEvents(evs), addDays("2026-01-01", 39));
    const sc = hoursScenarios(ds, ds.goals[0], [3, 5], "german.min");
    expect(sc[0].realisticPerDay).toBeCloseTo(180 * 0.8);
    expect(sc[1].aboveCapacity).toBe(true);
    expect(phoneScenarios(ds, [60])[0].current).toBeNull();
  });
  it("forecast log resolves and reports error", () => {
    const evs = base(60, 60);
    evs.unshift({ type: "FORECAST_RECORDED", occurredAt: "2026-01-20T10:00:00", payload: { forecastId: "f", goalId: "g", metricKey: "german.min", method: "pace", horizonDate: "2026-02-19", projectedValue: 40, p10: 35, p90: 55 } });
    const ds = buildDataset(withEvents(evs), addDays("2026-01-01", 59));
    const r = resolveForecasts(ds);
    expect(r.resolvedN).toBe(1);
    expect(r.items[0].actual).toBeCloseTo(50);
    expect(r.items[0].error).toBeCloseTo(10);
    expect(r.calibration).toBe(100);
  });
});
