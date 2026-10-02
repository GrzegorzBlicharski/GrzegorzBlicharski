import { describe, it, expect } from "vitest";
import { classifyTrend, detectAnomalies, velocity, plateauBreakthrough } from "@/analytics/trend";
import { relate, splitCompare } from "@/analytics/relations";
import { sustainedCapacity, sustainabilityCheck } from "@/modules/recovery";
import { buildDataset } from "@/data/facts";
import { withEvents, logged } from "./helpers";
import { addDays } from "@/core/dates";
import type { NewEvent } from "@/events/catalog";

const pts = (ys: number[]) => ys.map((y, x) => ({ x, y }));

describe("trend classification", () => {
  it("improving / declining / stable / volatile / insufficient", () => {
    expect(classifyTrend(pts(Array.from({ length: 30 }, (_, i) => 50 + i)), true).cls).toBe("IMPROVING");
    expect(classifyTrend(pts(Array.from({ length: 30 }, (_, i) => 50 + i)), false).cls).toBe("DECLINING");
    expect(classifyTrend(pts(Array.from({ length: 30 }, (_, i) => 100 + (i % 2))), true).cls).toBe("STABLE");
    expect(classifyTrend(pts(Array.from({ length: 30 }, (_, i) => (i % 2 ? 5 : 200))), true).cls).toBe("VOLATILE");
    expect(classifyTrend(pts([1, 2, 3]), true).cls).toBe("INSUFFICIENT");
  });
});

function series(start: string, values: number[], extra: (i: number) => Record<string, unknown> = () => ({})): NewEvent[] {
  return values.flatMap((v, i) => (v > 0 ? [logged(`s${i}`, addDays(start, i), "09:00", v, extra(i))] : []));
}

describe("dataset analytics", () => {
  it("velocity and acceleration over consecutive windows", () => {
    const vals = [...Array(30).fill(60), ...Array(30).fill(90), ...Array(30).fill(150)];
    const ds = buildDataset(withEvents(series("2026-01-01", vals)), addDays("2026-01-01", 89));
    const v = velocity(ds, "german.min", 30);
    expect(v.current).toBeCloseTo(150);
    expect(v.previous).toBeCloseTo(90);
    expect(v.velocity).toBeCloseTo(60);
    expect(v.acceleration).toBeCloseTo(30);
    expect(v.improving).toBe(true);
  });
  it("detects an unusual day with robust z-scores", () => {
    const vals = Array.from({ length: 40 }, (_, i) => 60 + (i % 5));
    vals[35] = 400;
    const ds = buildDataset(withEvents(series("2026-01-01", vals)), addDays("2026-01-01", 39));
    const a = detectAnomalies(ds, "german.min");
    expect(a.map((x) => x.day)).toEqual([addDays("2026-01-01", 35)]);
    expect(a[0].direction).toBe("high");
  });
  it("plateau followed by sustained rise is a potential breakthrough", () => {
    const vals = [...Array.from({ length: 40 }, (_, i) => 60 + (i % 3)), ...Array.from({ length: 14 }, (_, i) => 90 + (i % 3))];
    const ds = buildDataset(withEvents(series("2026-01-01", vals)), addDays("2026-01-01", vals.length - 1));
    expect(plateauBreakthrough(ds, "german.min").breakthrough).toBe(true);
  });
  it("sustained capacity picks highest rolling window", () => {
    const vals = [...Array(10).fill(100), ...Array(7).fill(400), ...Array(20).fill(100)];
    const ds = buildDataset(withEvents(series("2026-01-01", vals)), addDays("2026-01-01", vals.length - 1));
    const c = sustainedCapacity(ds);
    expect(c.w7?.value).toBe(400);
    expect(c.w30?.value).toBeCloseTo((7 * 400 + 23 * 100) / 30);
    expect(c.w90).toBeNull();
  });
  it("sustainability warning: hours up while focus and completion fall", () => {
    const start = "2026-01-01";
    const evs: NewEvent[] = [];
    for (let i = 0; i < 28; i++) {
      const late = i >= 14;
      evs.push(logged(`s${i}`, addDays(start, i), "09:00", late ? 300 : 200, { focus: late ? 2.5 : 4, unfinished: late && i % 2 === 0 }));
    }
    const ds = buildDataset(withEvents(evs), addDays(start, 27));
    const s = sustainabilityCheck(ds);
    expect(s.warning).toBe(true);
    expect(s.signals.length).toBeGreaterThanOrEqual(2);
  });
  it("relations report n, CI and say when no relationship exists", () => {
    const start = "2026-01-01";
    const evs: NewEvent[] = [];
    for (let i = 0; i < 60; i++) {
      const day = addDays(start, i);
      const ph = 30 + ((i * 37) % 120);
      evs.push({ type: "PHONE_USAGE_ADDED", payload: { usageId: `p${i}`, day, category: "Social Media", minutes: ph } });
      evs.push(logged(`s${i}`, day, "09:00", Math.max(10, 240 - ph), { focus: 4, interruptions: 0 }));
    }
    const ds = buildDataset(withEvents(evs), addDays(start, 59));
    const r = relate(ds, "phone.total", "deep.min");
    expect(r.n).toBe(60);
    expect(r.rho!).toBeLessThan(-0.9);
    expect(r.confidence).toBe("HIGH");
    expect(r.split!.lowMean!).toBeGreaterThan(r.split!.highMean!);
    const none = relate(ds, "phone.total", "sleep.h");
    expect(none.strength).toBe("insufficient");
    expect(none.statement).toMatch(/Not enough/);
  });
  it("split comparison", () => {
    const s = splitCompare([{ x: 1, y: 10 }, { x: 2, y: 12 }, { x: 5, y: 4 }, { x: 6, y: 6 }], 3);
    expect(s.lowMean).toBe(11);
    expect(s.highMean).toBe(5);
    expect(s.diff).toBe(-6);
  });
});
