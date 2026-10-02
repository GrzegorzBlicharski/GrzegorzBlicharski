/** German telemetry: skill mix, active vs passive, error rates, recurring errors, CEFR evidence. */
import { addDays, monthKey, type Day } from "@/core/dates";
import type { Dataset, DayFacts, TestResult } from "@/core/types";
import { theilSen, confidenceFromN, type Confidence } from "@/core/stats";
import { sliceDays } from "@/metrics/series";
import { CEFR_LEVELS, CEFR_SKILLS, TEST_KIND_RANK, type TestKind } from "@/domains/catalog";

export interface SkillShare {
  skill: string;
  minutes: number;
  share: number;
  target: number | null;
  deviation: number | null; // relative: (share − target)/target
  flag: "under" | "over" | null;
}

export function skillMix(ds: Dataset, windowDays = 30): { skills: SkillShare[]; total: number; active: number; passive: number; activeRatio: number | null; passiveShareFlag: boolean } {
  const days = sliceDays(ds, addDays(ds.asOf, -(windowDays - 1)), ds.asOf);
  const by: Record<string, number> = {};
  let total = 0;
  let active = 0;
  let passive = 0;
  for (const d of days) {
    total += d.german.min;
    active += d.german.active;
    passive += d.german.passive;
    for (const [k, v] of Object.entries(d.german.bySkill)) by[k] = (by[k] ?? 0) + v;
  }
  const mix = ds.settings.germanTargetMix;
  const mixTotal = Object.values(mix).reduce((a, b) => a + b, 0) || 1;
  const keys = new Set([...Object.keys(by), ...Object.keys(mix)]);
  const skills: SkillShare[] = [...keys].map((skill) => {
    const minutes = by[skill] ?? 0;
    const share = total > 0 ? minutes / total : 0;
    const target = mix[skill] != null ? mix[skill] / mixTotal : null;
    const deviation = target ? (share - target) / target : null;
    const flag = total >= 300 && deviation != null ? (deviation <= -0.4 ? "under" : deviation >= 0.6 ? "over" : null) : null;
    return { skill, minutes, share, target, deviation, flag };
  });
  skills.sort((a, b) => b.minutes - a.minutes);
  const passiveShare = total > 0 ? passive / total : 0;
  return { skills, total, active, passive, activeRatio: total > 0 ? active / total : null, passiveShareFlag: total >= 300 && passiveShare > ds.settings.germanMaxPassiveShare };
}

export interface MonthlyRate {
  month: string;
  writtenWords: number;
  writtenErrors: number;
  err100: number | null;
  spokenMin: number;
  spokenErrors: number;
  errPerMin: number | null;
  studyH: number;
  byCat: Record<string, number>;
}

export function monthlyErrorRates(ds: Dataset): MonthlyRate[] {
  const m = new Map<string, MonthlyRate>();
  for (const d of ds.days) {
    const k = monthKey(d.day);
    const e =
      m.get(k) ??
      ({ month: k, writtenWords: 0, writtenErrors: 0, err100: null, spokenMin: 0, spokenErrors: 0, errPerMin: null, studyH: 0, byCat: {} } as MonthlyRate);
    e.writtenWords += d.german.writtenWordsEval;
    e.writtenErrors += d.german.writtenErrors;
    e.spokenMin += d.german.spokenMinEval;
    e.spokenErrors += d.german.spokenErrors;
    e.studyH += d.german.min / 60;
    for (const [c, v] of Object.entries(d.german.errorsByCat)) e.byCat[c] = (e.byCat[c] ?? 0) + v;
    m.set(k, e);
  }
  for (const e of m.values()) {
    e.err100 = e.writtenWords >= 100 ? (e.writtenErrors / e.writtenWords) * 100 : null;
    e.errPerMin = e.spokenMin >= 5 ? e.spokenErrors / e.spokenMin : null;
  }
  return [...m.values()];
}

export interface RateChange {
  perMonth: number | null;
  per100h: number | null;
  months: number;
  first: number | null;
  last: number | null;
  confidence: Confidence;
}

/** Monthly slope (Theil–Sen) and change per 100 study hours for a monthly rate. */
export function rateChange(rows: MonthlyRate[], pick: (r: MonthlyRate) => number | null): RateChange {
  const pts = rows.map((r, i) => ({ i, v: pick(r), h: r.studyH })).filter((p) => p.v != null) as { i: number; v: number; h: number }[];
  if (pts.length < 3) return { perMonth: null, per100h: null, months: pts.length, first: pts[0]?.v ?? null, last: pts[pts.length - 1]?.v ?? null, confidence: "LOW" };
  const slope = theilSen(
    pts.map((p) => p.i),
    pts.map((p) => p.v),
  );
  let cum = 0;
  const hx = pts.map((p) => (cum += p.h));
  const slopeH = theilSen(hx, pts.map((p) => p.v));
  return {
    perMonth: slope,
    per100h: slopeH != null ? slopeH * 100 : null,
    months: pts.length,
    first: pts[0].v,
    last: pts[pts.length - 1].v,
    confidence: confidenceFromN(pts.length, 4, 9),
  };
}

/** Error categories with share ≥ 15% in ≥ 3 of the last 4 months with data. */
export function recurringErrors(rows: MonthlyRate[]): { category: string; months: number; lastShare: number; trend: "falling" | "flat" | "rising" }[] {
  const recent = rows.filter((r) => Object.values(r.byCat).reduce((a, b) => a + b, 0) >= 20).slice(-4);
  if (recent.length < 3) return [];
  const cats = new Set(recent.flatMap((r) => Object.keys(r.byCat)));
  const out: { category: string; months: number; lastShare: number; trend: "falling" | "flat" | "rising" }[] = [];
  for (const c of cats) {
    const shares = recent.map((r) => {
      const tot = Object.values(r.byCat).reduce((a, b) => a + b, 0);
      return tot > 0 ? (r.byCat[c] ?? 0) / tot : 0;
    });
    const months = shares.filter((s) => s >= 0.15).length;
    if (months >= 3) {
      const diff = shares[shares.length - 1] - shares[0];
      out.push({ category: c, months, lastShare: shares[shares.length - 1], trend: diff < -0.03 ? "falling" : diff > 0.03 ? "rising" : "flat" });
    }
  }
  return out.sort((a, b) => b.lastShare - a.lastShare);
}

export interface CefrEvidence {
  skill: string;
  best: { level: string; kind: string; date: Day; name: string } | null;
  latest: { level: string | null; kind: string; date: Day; pct: number; name: string } | null;
  all: TestResult[];
}

/** Evidence ladder per CEFR skill. System estimates are labelled, never certified. */
export function cefrEvidence(ds: Dataset): CefrEvidence[] {
  const german = ds.tests.filter((t) => t.domain === "GERMAN");
  return CEFR_SKILLS.map((skill) => {
    const all = german.filter((t) => t.skill === skill || t.skill === null || t.skill === "Overall");
    const own = german.filter((t) => t.skill === skill);
    const leveled = all.filter((t) => t.level && (CEFR_LEVELS as readonly string[]).includes(t.level));
    let best: CefrEvidence["best"] = null;
    for (const t of leveled) {
      const rank = TEST_KIND_RANK[t.kind as TestKind] ?? 0;
      const lv = CEFR_LEVELS.indexOf(t.level as (typeof CEFR_LEVELS)[number]);
      const cur = best ? [TEST_KIND_RANK[best.kind as TestKind] ?? 0, CEFR_LEVELS.indexOf(best.level as (typeof CEFR_LEVELS)[number])] : [-1, -1];
      if (rank > cur[0] || (rank === cur[0] && lv > cur[1])) best = { level: t.level!, kind: t.kind, date: t.date, name: t.name };
    }
    const latestT = own[own.length - 1] ?? null;
    return {
      skill,
      best,
      latest: latestT ? { level: latestT.level, kind: latestT.kind, date: latestT.date, pct: latestT.pct, name: latestT.name } : null,
      all: own,
    };
  });
}

/** Weakest CEFR dimension by latest test % (requires a test per skill). */
export function weakestSkill(ds: Dataset): { skill: string; pct: number; n: number } | null {
  const ev = cefrEvidence(ds).filter((e) => e.latest);
  if (ev.length < 2) return null;
  ev.sort((a, b) => a.latest!.pct - b.latest!.pct);
  return { skill: ev[0].skill, pct: ev[0].latest!.pct, n: ev.length };
}

/** Score progression per skill (test %), Theil–Sen per month. */
export function testProgression(tests: TestResult[]): { perMonth: number | null; n: number } {
  if (tests.length < 3) return { perMonth: null, n: tests.length };
  const t0 = Date.parse(tests[0].date);
  const xs = tests.map((t) => (Date.parse(t.date) - t0) / (30.44 * 86_400_000));
  return { perMonth: theilSen(xs, tests.map((t) => t.pct)), n: tests.length };
}

export function germanOutputTotals(days: DayFacts[]): Record<string, number> {
  const s = (f: (d: DayFacts) => number) => days.reduce((a, d) => a + f(d), 0);
  return {
    words: s((d) => d.german.words),
    speakingMin: s((d) => d.german.speakingMin),
    conversations: s((d) => d.german.conversations),
    exercises: s((d) => d.german.exercises),
    newWords: s((d) => d.german.newWords),
    vocabReviewed: s((d) => d.german.vocabReviewed),
  };
}
