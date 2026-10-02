/** Learning velocity components, effectiveness per hour, low-value detection. */
import { addDays, type Day } from "@/core/dates";
import type { Dataset } from "@/core/types";
import { confidenceFromN, type Confidence } from "@/core/stats";
import { rangeAgg, ctxOf, sliceDays } from "@/metrics/series";
import { velocity } from "@/analytics/trend";
import { monthlyErrorRates, rateChange, testProgression } from "./german";

export interface VelocityComponent {
  key: string;
  label: string;
  current: number | null;
  previous: number | null;
  change: number | null;
  unit: string;
  improving: boolean | null;
  note: string;
}

/** Learning velocity is shown as separate components — never a single number. */
export function learningVelocity(ds: Dataset): VelocityComponent[] {
  const law = velocity(ds, "law.accuracy", 30);
  const ret = velocity(ds, "german.vocabRetention", 30);
  const hce = velocity(ds, "law.highConfErrors", 30);
  const rates = monthlyErrorRates(ds);
  const err = rateChange(rates, (r) => r.err100);
  const lawTests = testProgression(ds.tests.filter((t) => t.domain === "LAW"));
  const deTests = testProgression(ds.tests.filter((t) => t.domain === "GERMAN"));
  return [
    { key: "knowledge", label: "Knowledge (Law accuracy, 30D vs prev)", current: law.current, previous: law.previous, change: law.velocity, unit: "pp", improving: law.improving, note: "Σcorrect/Σanswered" },
    {
      key: "errors",
      label: "Skill (German errors/100 words per month)",
      current: err.last,
      previous: err.first,
      change: err.perMonth,
      unit: "/month",
      improving: err.perMonth == null ? null : err.perMonth < 0,
      note: `${err.months} months · per 100 study h: ${err.per100h?.toFixed(2) ?? "—"}`,
    },
    { key: "retention", label: "Retention (vocab, 30D vs prev)", current: ret.current, previous: ret.previous, change: ret.velocity, unit: "pp", improving: ret.improving, note: "" },
    { key: "hce", label: "High-confidence error reduction", current: hce.current, previous: hce.previous, change: hce.velocity, unit: "pp", improving: hce.improving, note: "lower is better" },
    { key: "lawTests", label: "Law test score progression", current: null, previous: null, change: lawTests.perMonth, unit: "pp/month", improving: lawTests.perMonth == null ? null : lawTests.perMonth > 0, note: `${lawTests.n} tests` },
    { key: "deTests", label: "German test score progression", current: null, previous: null, change: deTests.perMonth, unit: "pp/month", improving: deTests.perMonth == null ? null : deTests.perMonth > 0, note: `${deTests.n} tests` },
  ];
}

export interface EffectivenessRow {
  activity: string;
  hours: number;
  outcome: string;
  before: number | null;
  after: number | null;
  deltaPer10h: number | null;
  n: number;
  confidence: Confidence;
  flag: "low-yield" | "high-yield" | null;
}

/**
 * Development value per hour (not monetary): hours spent per law area in the last 60 days vs the change in
 * that area's accuracy (prior 60D → last 60D). Shown with n and confidence; never a verdict.
 */
export function effectiveness(ds: Dataset, windowDays = 60): EffectivenessRow[] {
  const end = ds.asOf;
  const midStart = addDays(end, -(windowDays - 1));
  const prevStart = addDays(midStart, -windowDays);
  const cur = sliceDays(ds, midStart, end);
  const prev = sliceDays(ds, prevStart, addDays(midStart, -1));
  const areas = new Set<string>();
  for (const d of cur) Object.keys(d.law.byArea).forEach((a) => areas.add(a));
  const rows: EffectivenessRow[] = [];
  for (const area of areas) {
    const sum = (xs: typeof cur, f: (a: { min: number; q: number; c: number }) => number) => xs.reduce((s, d) => s + (d.law.byArea[area] ? f(d.law.byArea[area]) : 0), 0);
    const hours = sum(cur, (a) => a.min) / 60;
    const qC = sum(cur, (a) => a.q);
    const qP = sum(prev, (a) => a.q);
    const before = qP >= 20 ? (sum(prev, (a) => a.c) / qP) * 100 : null;
    const after = qC >= 20 ? (sum(cur, (a) => a.c) / qC) * 100 : null;
    const delta = before != null && after != null && hours >= 2 ? ((after - before) / hours) * 10 : null;
    const n = Math.min(qC, qP);
    rows.push({
      activity: `Law · ${area}`,
      hours,
      outcome: "accuracy pp",
      before,
      after,
      deltaPer10h: delta,
      n,
      confidence: confidenceFromN(n, 60, 200),
      flag: delta == null ? null : hours >= 10 && delta < 0.5 ? "low-yield" : delta >= 2 ? "high-yield" : null,
    });
  }
  return rows.sort((a, b) => b.hours - a.hours);
}

/** High time + low output + no improvement → flag for analysis. */
export function lowValueCandidates(ds: Dataset): { activity: string; hours30: number; note: string }[] {
  const out: { activity: string; hours30: number; note: string }[] = [];
  const days = sliceDays(ds, addDays(ds.asOf, -29), ds.asOf);
  const sum = (f: (d: (typeof days)[number]) => number) => days.reduce((a, d) => a + f(d), 0);
  const total = sum((d) => d.total);
  const low = sum((d) => d.valueMin.low ?? 0);
  if (total > 0 && low / total > 0.15) out.push({ activity: "Low-value classified time", hours30: low / 60, note: `${((low / total) * 100).toFixed(0)}% of tracked work` });
  const passiveDe = sum((d) => d.german.passive);
  const deMin = sum((d) => d.german.min);
  const err = monthlyErrorRates(ds);
  const rc = rateChange(err.slice(-4), (r) => r.err100);
  if (deMin > 600 && passiveDe / deMin > 0.5 && (rc.perMonth == null || rc.perMonth >= 0))
    out.push({ activity: "German passive immersion", hours30: passiveDe / 60, note: "majority of German time; writing error rate not improving" });
  for (const e of effectiveness(ds)) if (e.flag === "low-yield") out.push({ activity: e.activity, hours30: e.hours, note: `${e.deltaPer10h?.toFixed(1)} pp accuracy per 10h (n=${e.n}, ${e.confidence})` });
  return out;
}

/** Share of time in activities most related to key goals. */
export function goalAlignedShare(ds: Dataset, windowDays = 30): { share: number | null; alignedH: number; totalH: number } {
  const goalDomains = new Set(ds.goals.filter((g) => g.status === "active" && g.tier !== "MAINTENANCE").map((g) => g.domain));
  const days = sliceDays(ds, addDays(ds.asOf, -(windowDays - 1)), ds.asOf);
  let aligned = 0;
  let total = 0;
  for (const d of days) {
    total += d.total;
    for (const [dom, m] of Object.entries(d.byDomain)) if (goalDomains.has(dom)) aligned += m;
  }
  return { share: total > 0 ? (aligned / total) * 100 : null, alignedH: aligned / 60, totalH: total / 60 };
}

export function compareRanges(ds: Dataset, keys: string[], a: { from: Day; to: Day }, b: { from: Day; to: Day }) {
  const ctx = ctxOf(ds);
  return keys.map((k) => ({ key: k, a: rangeAgg(ds, k, a.from, a.to, ctx), b: rangeAgg(ds, k, b.from, b.to, ctx) }));
}
