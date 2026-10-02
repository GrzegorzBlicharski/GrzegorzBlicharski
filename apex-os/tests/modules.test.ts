import { describe, it, expect } from "vitest";
import { buildDataset } from "@/data/facts";
import { withEvents, logged, fictional } from "./helpers";
import { addDays } from "@/core/dates";
import type { NewEvent } from "@/events/catalog";
import { windowAgg } from "@/metrics/series";
import { monthlyErrorRates, rateChange, skillMix, cefrEvidence } from "@/modules/german";
import { confidenceMatrix, retentionCurve, dueTopics, areaRegression, readiness } from "@/modules/law";
import { detectOverplanning, planningGuard } from "@/modules/execution";
import { distractionCost, reclaimedTime, noPhoneCompliance } from "@/modules/digital";
import { bestHours } from "@/modules/attention";

describe("german", () => {
  it("errors per 100 words and per speaking minute", () => {
    const db = withEvents([
      { type: "GERMAN_WRITING_EVALUATED", payload: { evalId: "w1", day: "2026-09-01", words: 200, errors: { cases: 6, articles: 4 } } },
      { type: "GERMAN_WRITING_EVALUATED", payload: { evalId: "w2", day: "2026-09-02", words: 300, errors: { cases: 5 } } },
      { type: "GERMAN_SPEAKING_EVALUATED", payload: { evalId: "s1", day: "2026-09-02", minutes: 10, errors: { tense: 8 } } },
    ]);
    const ds = buildDataset(db, "2026-09-02");
    expect(windowAgg(ds, "german.err100", "7D").value).toBeCloseTo(3); // 15/500*100
    expect(windowAgg(ds, "german.errPerSpeakMin", "7D").value).toBeCloseTo(0.8);
    expect(ds.days[0].german.errorsByCat).toEqual({ cases: 6, articles: 4 });
  });
  it("monthly error rate slope is negative when improving", () => {
    const evs: NewEvent[] = [];
    for (let m = 0; m < 6; m++) evs.push({ type: "GERMAN_WRITING_EVALUATED", payload: { evalId: `w${m}`, day: `2026-0${m + 1}-10`, words: 1000, errors: { cases: 80 - m * 10 } } });
    const ds = buildDataset(withEvents(evs), "2026-06-30");
    const rc = rateChange(monthlyErrorRates(ds), (r) => r.err100);
    expect(rc.perMonth).toBeCloseTo(-1, 6);
    expect(rc.months).toBe(6);
  });
  it("skill mix flags undertrained skills relative to target mix only", () => {
    const evs: NewEvent[] = [];
    for (let i = 0; i < 10; i++) {
      evs.push(logged(`l${i}`, addDays("2026-09-01", i), "09:00", 60, { activity: "listening" }));
      evs.push(logged(`w${i}`, addDays("2026-09-01", i), "11:00", 30, { activity: "writing" }));
    }
    const ds = buildDataset(withEvents(evs), "2026-09-10");
    const mix = skillMix(ds);
    expect(mix.skills.find((s) => s.skill === "Speaking")!.flag).toBe("under");
    expect(mix.skills.find((s) => s.skill === "Listening")!.flag).toBe("over");
    expect(mix.passiveShareFlag).toBe(true);
  });
  it("CEFR evidence prefers stronger evidence kinds and never invents levels", () => {
    const db = withEvents([
      { type: "TEST_RECORDED", payload: { testId: "a", date: "2026-03-01", domain: "GERMAN", kind: "SELF", name: "self", skill: "Writing", score: 1, maxScore: 1, level: "C1" } },
      { type: "TEST_RECORDED", payload: { testId: "b", date: "2026-04-01", domain: "GERMAN", kind: "OFFICIAL", name: "Goethe", skill: "Writing", score: 70, maxScore: 100, level: "B2" } },
    ]);
    const ev = cefrEvidence(buildDataset(db, "2026-05-01"));
    expect(ev.find((e) => e.skill === "Writing")!.best).toMatchObject({ level: "B2", kind: "OFFICIAL" });
    expect(ev.find((e) => e.skill === "Speaking")!.best).toBeNull();
  });
});

describe("law", () => {
  it("confidence matrix and retention buckets via spaced attempts", () => {
    const db = withEvents([
      { type: "QUESTION_ANSWERED", occurredAt: "2026-09-01T10:00:00", payload: { attemptId: "1", area: "KC", topic: "T", correct: false, confidence: "high" } },
      { type: "QUESTION_ANSWERED", occurredAt: "2026-09-02T10:00:00", payload: { attemptId: "2", area: "KC", topic: "T", correct: true, confidence: "low" } },
      { type: "QUESTION_ANSWERED", occurredAt: "2026-09-12T10:00:00", payload: { attemptId: "3", area: "KC", topic: "T", correct: true, confidence: "high" } },
    ]);
    const ds = buildDataset(db, "2026-09-12");
    expect(confidenceMatrix(ds.days)).toEqual({ correctConf: 1, correctUnsure: 1, wrongUnsure: 0, wrongConf: 1, total: 3 });
    const buckets = Object.fromEntries(ds.retention.map((b) => [b.bucket, b.n]));
    expect(buckets).toEqual({ first: 1, "1D": 1, "7D": 1 });
    expect(retentionCurve(ds).find((c) => c.bucket === "7D")!.n).toBe(1);
  });
  it("due topics follow the expanding schedule", () => {
    const db = withEvents([
      { type: "QUESTION_SET_LOGGED", occurredAt: "2026-09-01T10:00:00", payload: { attemptId: "a", area: "KPC", topic: "appeal", total: 10, correct: 9 } },
      { type: "QUESTION_SET_LOGGED", occurredAt: "2026-09-02T10:00:00", payload: { attemptId: "b", area: "KPC", topic: "appeal", total: 10, correct: 9 } },
    ]);
    expect(dueTopics(buildDataset(db, "2026-09-05"))).toHaveLength(0); // stage 2 → 7 days
    const due = dueTopics(buildDataset(db, "2026-09-20"));
    expect(due).toHaveLength(1);
    expect(due[0]).toMatchObject({ topic: "appeal", interval: 7, risk: "at-risk" });
  });
  it("regression alert after three consecutive weekly declines in an established area", () => {
    const evs: NewEvent[] = [];
    const accs = [0.85, 0.86, 0.84, 0.85, 0.83, 0.78, 0.72, 0.66];
    accs.forEach((a, w) => {
      for (let d = 0; d < 7; d++) {
        const day = addDays("2026-08-03", w * 7 + d);
        evs.push({ type: "QUESTION_SET_LOGGED", occurredAt: `${day}T10:00:00`, payload: { attemptId: `${w}-${d}`, area: "KPC", total: 100, correct: Math.round(100 * a) } });
      }
    });
    const ds = buildDataset(withEvents(evs), addDays("2026-08-03", 55));
    expect(areaRegression(ds, "KPC").alert).toBe(true);
  });
  it("readiness is components, not hours", () => {
    const { ds } = fictional();
    const r = readiness(ds);
    expect(r.components.map((c) => c.key)).toEqual(["coverage", "accuracy", "recentAccuracy", "retention", "mock", "volume", "balance"]);
    expect(r.composite).not.toBeNull();
  });
});

describe("execution & attention", () => {
  it("detects systematic overplanning with suggested baseline", () => {
    const evs: NewEvent[] = [];
    for (let i = 0; i < 20; i++) {
      const day = addDays("2026-09-01", i);
      evs.push({ type: "DAY_PLANNED", payload: { day, plannedMinutes: 444 } });
      evs.push(logged(`s${i}`, day, "08:00", 336));
    }
    const ds = buildDataset(withEvents(evs), "2026-09-21");
    const op = detectOverplanning(ds);
    expect(op.detected).toBe(true);
    expect(op.executionPct).toBeCloseTo(75.7, 1);
    expect(op.suggestedBaseline).toBe(360); // round15(336 × 1.05)
  });
  it("warns when system building replaces execution", () => {
    const evs: NewEvent[] = [];
    for (let i = 0; i < 28; i++) {
      const day = addDays("2026-09-01", i);
      evs.push(logged(`c${i}`, day, "08:00", 120));
      if (i >= 14) evs.push(logged(`sys${i}`, day, "14:00", 120, { domain: "SYSTEM", activity: "system" }));
    }
    const g = planningGuard(buildDataset(withEvents(evs), addDays("2026-09-01", 27)));
    expect(g.warning).toBe(true);
    expect(g.message).toMatch(/PLANNING MAY BE REPLACING EXECUTION/);
  });
  it("flags possible distraction-related start delay only with overlapping phone use", () => {
    const db = withEvents([
      { type: "PHONE_USAGE_ADDED", payload: { usageId: "p1", day: "2026-09-01", category: "Social Media", minutes: 26, start: "2026-09-01T07:55", end: "2026-09-01T08:21" } },
      logged("s1", "2026-09-01", "08:29", 60, { plannedStart: "2026-09-01T08:00" }),
      logged("s2", "2026-09-01", "14:20", 60, { plannedStart: "2026-09-01T14:00" }),
    ]);
    const dc = distractionCost(buildDataset(db, "2026-09-01"));
    expect(dc.checked).toBe(2);
    expect(dc.events).toHaveLength(1);
    expect(dc.events[0]).toMatchObject({ sessionId: "s1", delay: 29, phoneMinutes: 26 });
  });
  it("no-phone windows: deep work violations measured from timed data", () => {
    const db = withEvents([
      logged("d", "2026-09-01", "09:00", 90, { focus: 5, interruptions: 0 }),
      { type: "PHONE_USAGE_ADDED", payload: { usageId: "p", day: "2026-09-01", category: "News", minutes: 10, start: "2026-09-01T09:30", end: "2026-09-01T09:40" } },
    ]);
    const ds = buildDataset(db, "2026-09-01");
    expect(ds.days[0].phone!.violations.deep).toBe(10);
    expect(noPhoneCompliance(ds).find((w) => w.id === "deep")!.pct).toBe(0);
  });
  it("reclaimed time is arithmetic against the baseline window", () => {
    const evs: NewEvent[] = [];
    for (let i = 0; i < 90; i++) {
      const day = addDays("2026-01-01", i);
      evs.push({ type: "PHONE_USAGE_ADDED", payload: { usageId: `p${i}`, day, category: "Social Media", minutes: i < 30 ? 168 : 52 } });
      evs.push(logged(`s${i}`, day, "09:00", i < 30 ? 200 : 260));
    }
    const r = reclaimedTime(buildDataset(withEvents(evs), addDays("2026-01-01", 89)));
    expect(r.baselinePerDay).toBe(168);
    expect(r.currentPerDay).toBe(52);
    expect(r.reclaimedPerDay).toBe(116);
    expect(r.reclaimedPerMonthH).toBeCloseTo(58);
    expect(r.productiveDelta).toBe(60);
    expect(r.conversionPct).toBeCloseTo((60 / 116) * 100);
  });
  it("best hours are derived from data", () => {
    const { ds } = fictional();
    const bh = bestHours(ds);
    expect(bh.qualifying).toBeGreaterThan(5);
    expect(bh.bestBlock).not.toBeNull();
    expect(bh.bestBlock!.start).toBeGreaterThanOrEqual(7);
    expect(bh.bestBlock!.start).toBeLessThanOrEqual(10);
  });
});
