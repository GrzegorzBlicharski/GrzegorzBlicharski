/** Experiment, intervention and recommendation evaluation — transparent effect sizes with n. */
import { addDays, diffDays, minDay, type Day } from "@/core/dates";
import type { Dataset, Experiment, Intervention, Recommendation } from "@/core/types";
import { cohensD, mean, type Confidence } from "@/core/stats";
import { ctxOf, dayValue, metric, METRIC_MAP, rangeAgg, sliceDays } from "@/metrics/series";

export interface MetricComparison {
  key: string;
  label: string;
  baseline: number | null;
  during: number | null;
  delta: number | null;
  deltaPct: number | null;
  d: number | null;
  nBase: number;
  nDuring: number;
  better: boolean | null;
  confidence: Confidence;
}

export function compareWindows(ds: Dataset, key: string, base: { from: Day; to: Day }, test: { from: Day; to: Day }): MetricComparison {
  const m = metric(key);
  const ctx = ctxOf(ds);
  const vals = (from: Day, to: Day) =>
    sliceDays(ds, from, to)
      .filter((d) => d.tracked)
      .map((d) => dayValue(m, d, ctx))
      .filter((x): x is number => x != null);
  const a = vals(base.from, base.to);
  const b = vals(test.from, test.to);
  const aggA = rangeAgg(ds, key, base.from, base.to, ctx).value;
  const aggB = rangeAgg(ds, key, test.from, test.to, ctx).value;
  const baseline = aggA ?? mean(a);
  const during = aggB ?? mean(b);
  const delta = baseline != null && during != null ? during - baseline : null;
  const d = cohensD(a, b);
  const better = delta == null || m.higherIsBetter == null ? null : m.higherIsBetter ? delta > 0 : delta < 0;
  const n = Math.min(a.length, b.length);
  const confidence: Confidence = d == null || n < 10 ? "LOW" : n >= 28 && Math.abs(d) >= 0.5 ? "HIGH" : n >= 14 && Math.abs(d) >= 0.3 ? "MEDIUM" : "LOW";
  return {
    key,
    label: m.label,
    baseline,
    during,
    delta,
    deltaPct: delta != null && baseline ? (delta / Math.abs(baseline)) * 100 : null,
    d,
    nBase: a.length,
    nDuring: b.length,
    better,
    confidence,
  };
}

export interface ExperimentEvaluation {
  experiment: Experiment;
  baseline: { from: Day; to: Day };
  test: { from: Day; to: Day };
  dayOf: number;
  complete: boolean;
  comparisons: MetricComparison[];
  primary: MetricComparison | null;
  suggestion: "adopt" | "reject" | "extend" | "inconclusive" | "running";
  summary: string;
}

export function evaluateExperiment(ds: Dataset, e: Experiment): ExperimentEvaluation {
  const baseline = { from: addDays(e.startDate, -e.baselineDays), to: addDays(e.startDate, -1) };
  const end = addDays(e.startDate, e.durationDays - 1);
  const test = { from: e.startDate, to: minDay(end, ds.asOf) };
  const dayOf = Math.max(0, diffDays(e.startDate, ds.asOf) + 1);
  const complete = ds.asOf >= end;
  const keys = [...new Set([e.primaryMetric, ...e.metrics])].filter((k) => METRIC_MAP.has(k));
  const comparisons = test.from <= ds.asOf ? keys.map((k) => compareWindows(ds, k, baseline, test)) : [];
  const primary = comparisons.find((c) => c.key === e.primaryMetric) ?? null;
  let suggestion: ExperimentEvaluation["suggestion"] = "running";
  if (complete && primary) {
    const n = Math.min(primary.nBase, primary.nDuring);
    const ad = primary.d != null ? (primary.better ? Math.abs(primary.d) : -Math.abs(primary.d)) : null;
    if (n < 14 || ad == null) suggestion = "extend";
    else if (ad >= 0.3) suggestion = "adopt";
    else if (ad <= -0.3) suggestion = "reject";
    else suggestion = "inconclusive";
  }
  const summary = primary
    ? `${primary.label}: ${fmt(primary.baseline)} → ${fmt(primary.during)} (Δ ${fmt(primary.delta)}, d=${primary.d?.toFixed(2) ?? "—"}, n=${primary.nBase}/${primary.nDuring}, ${primary.confidence})`
    : "Not started or no data yet.";
  return { experiment: e, baseline, test, dayOf, complete, comparisons, primary, suggestion, summary };
}

function fmt(x: number | null): string {
  return x == null ? "—" : Math.abs(x) >= 100 ? x.toFixed(0) : x.toFixed(1);
}

export function evaluateIntervention(ds: Dataset, i: Intervention): { intervention: Intervention; comparison: MetricComparison | null; dayOf: number; complete: boolean } {
  const end = addDays(i.startDate, i.durationDays - 1);
  const test = { from: i.startDate, to: minDay(end, i.endedAt ?? ds.asOf) };
  const base = { from: addDays(i.startDate, -Math.max(14, i.durationDays)), to: addDays(i.startDate, -1) };
  const comparison = METRIC_MAP.has(i.metricKey) && test.from <= ds.asOf ? compareWindows(ds, i.metricKey, base, test) : null;
  return { intervention: i, comparison, dayOf: Math.max(0, diffDays(i.startDate, ds.asOf) + 1), complete: ds.asOf >= end || !!i.endedAt };
}

export interface RecommendationOutcome {
  rec: Recommendation;
  verifiable: boolean;
  due: boolean;
  after: number | null;
  hit: boolean | null;
}

/** Hit = metric moved ≥ 5% in the intended direction within the horizon after acceptance/implementation. */
export function verifyRecommendations(ds: Dataset): { outcomes: RecommendationOutcome[]; hitRate: number | null; verified: number; issued: number; accepted: number } {
  const outcomes = ds.recommendations.map((rec) => {
    const verifiable = !!(rec.metricKey && METRIC_MAP.has(rec.metricKey) && rec.direction && rec.baselineValue != null);
    const startDay = rec.statusDay ?? rec.issuedDay;
    const endDay = addDays(startDay, rec.horizonDays);
    const active = rec.status === "accepted" || rec.status === "implemented";
    const due = active && endDay <= ds.asOf;
    let after: number | null = null;
    let hit: boolean | null = null;
    if (verifiable && due) {
      after = rangeAgg(ds, rec.metricKey!, addDays(startDay, 1), endDay).value;
      if (after != null) {
        const base = rec.baselineValue!;
        const change = base !== 0 ? (after - base) / Math.abs(base) : after - base;
        hit = rec.direction === "up" ? change >= 0.05 : change <= -0.05;
      }
    }
    return { rec, verifiable, due, after, hit };
  });
  const judged = outcomes.filter((o) => o.hit != null);
  return {
    outcomes,
    hitRate: judged.length ? (judged.filter((o) => o.hit).length / judged.length) * 100 : null,
    verified: judged.length,
    issued: ds.recommendations.length,
    accepted: ds.recommendations.filter((r) => r.status === "accepted" || r.status === "implemented").length,
  };
}

export function activeExperiments(ds: Dataset): Experiment[] {
  return ds.experiments.filter((e) => e.status === "active" && addDays(e.startDate, e.durationDays - 1) >= addDays(ds.asOf, -0) && e.startDate <= addDays(ds.asOf, 365));
}
