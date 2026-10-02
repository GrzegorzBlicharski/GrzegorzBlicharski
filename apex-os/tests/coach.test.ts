import { describe, it, expect } from "vitest";
import { priorityScore, generateInsights } from "@/coach/insights";
import { todayView } from "@/coach/today";
import { buildPlan } from "@/coach/planner";
import { weeklyReview, biggestLever, howIWorkBest, knowledgeState } from "@/coach/weekly";
import { sustainedCapacity } from "@/modules/recovery";
import { evaluateExperiment, verifyRecommendations } from "@/experiments/evaluate";
import { buildDataset } from "@/data/facts";
import { fictional, withEvents, logged } from "./helpers";
import { addDays } from "@/core/dates";
import type { NewEvent } from "@/events/catalog";

describe("coach engine", () => {
  it("priority formula is monotonic and bounded", () => {
    const base = { impact: 4, urgency: 3, effort: 2, confidence: "HIGH" as const, goalRelevance: 1 };
    const p = priorityScore(base);
    expect(p).toBeGreaterThan(0);
    expect(p).toBeLessThanOrEqual(100);
    expect(priorityScore({ ...base, confidence: "LOW" })).toBeLessThan(p);
    expect(priorityScore({ ...base, effort: 5 })).toBeLessThan(p);
    expect(priorityScore({ ...base, goalRelevance: 0.3 })).toBeLessThan(p);
  });
  it("baseline-gathering stage emits only descriptive output", () => {
    const evs: NewEvent[] = [];
    for (let i = 0; i < 5; i++) evs.push(logged(`s${i}`, addDays("2026-09-01", i), "09:00", 60));
    const ins = generateInsights(buildDataset(withEvents(evs), "2026-09-05"));
    expect(ins).toHaveLength(1);
    expect(ins[0].ruleId).toBe("maturity.baseline");
  });
  it("today shows at most 3 priorities and insights carry evidence", () => {
    const { ds } = fictional();
    const ins = generateInsights(ds);
    const tv = todayView(ds, ins);
    expect(tv.priorities.length).toBeLessThanOrEqual(3);
    for (const i of ins) {
      expect(i.facts.length).toBeGreaterThan(0);
      expect(i.action.length).toBeGreaterThan(0);
      expect(i.evidence.n).toBeGreaterThanOrEqual(0);
      expect(["LOW", "MEDIUM", "HIGH"]).toContain(i.confidence);
    }
    expect(ins.map((i) => i.priority)).toEqual([...ins.map((i) => i.priority)].sort((a, b) => b - a));
  });
  it("planner never exceeds sustained capacity caps", () => {
    const { ds } = fictional();
    const cap = sustainedCapacity(ds);
    const normal = buildPlan(ds, { availableMinutes: 900 });
    expect(normal.capacity).toBeLessThanOrEqual(Math.ceil(cap.w30!.value * 1.1));
    const high = buildPlan(ds, { availableMinutes: 900, mode: "high" });
    expect(high.capacity).toBeLessThanOrEqual(540);
    const min = buildPlan(ds, { mode: "minimum" });
    expect(min.totalMinutes).toBeLessThan(normal.totalMinutes);
    const low = buildPlan(ds, { availableMinutes: 300, energy: 1 });
    expect(low.notes.join(" ")).toMatch(/Low energy/);
    expect(normal.blocks.every((b) => b.start)).toBe(true);
  });
  it("weekly review, lever, knowledge state and how-I-work produce structured output", () => {
    const { ds } = fictional();
    const ins = generateInsights(ds);
    const wr = weeklyReview(ds, ins);
    expect(Object.keys(wr)).toEqual(["keep", "increase", "reduce", "stop", "start", "test"]);
    const lever = biggestLever(ds, ins);
    expect(lever).not.toBeNull();
    expect(lever!.evidence.length).toBeGreaterThan(0);
    const ks = knowledgeState(ds, ins);
    expect(ks.relations.length).toBeGreaterThan(5);
    const how = howIWorkBest(ds);
    expect(how.best.find((b) => b.label === "Sustainable weekly load")!.finding).not.toBeNull();
  });
  it("experiment evaluation compares baseline and test windows with effect size", () => {
    const { ds } = fictional();
    const e = ds.experiments.find((x) => x.id === "e-phone")!;
    const ev = evaluateExperiment(ds, e);
    expect(ev.complete).toBe(true);
    const phone = ev.comparisons.find((c) => c.key === "phone.total")!;
    expect(phone.delta!).toBeLessThan(-50);
    expect(phone.better).toBe(true);
    expect(["adopt", "inconclusive", "extend", "reject"]).toContain(ev.suggestion);
  });
  it("recommendations are verified against their baseline", () => {
    const { ds } = fictional();
    const v = verifyRecommendations(ds);
    expect(v.issued).toBe(1);
    expect(v.verified).toBe(1);
    expect(v.outcomes[0].hit).toBe(true);
  });
});
