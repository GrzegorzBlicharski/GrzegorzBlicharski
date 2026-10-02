/** Relationship analysis: Spearman with CI, split comparisons with Cohen's d. Correlation ≠ causation. */
import { cohensD, mean, spearman, spearmanCI, type Confidence } from "@/core/stats";
import type { Day } from "@/core/dates";
import type { Dataset } from "@/core/types";
import { ctxOf, dayValue, metric, sliceDays } from "@/metrics/series";

export interface RelationResult {
  xKey: string;
  yKey: string;
  lag: number;
  n: number;
  rho: number | null;
  ci: [number, number] | null;
  strength: "none" | "weak" | "moderate" | "strong" | "insufficient";
  confidence: Confidence;
  split: SplitResult | null;
  statement: string;
  points: { day: Day; x: number; y: number }[];
}

export interface SplitResult {
  threshold: number;
  lowLabel: string;
  highLabel: string;
  lowMean: number | null;
  highMean: number | null;
  lowN: number;
  highN: number;
  diff: number | null;
  d: number | null;
}

function strengthOf(rho: number | null, n: number): RelationResult["strength"] {
  if (rho == null || n < 10) return "insufficient";
  const a = Math.abs(rho);
  return a < 0.1 ? "none" : a < 0.3 ? "weak" : a < 0.5 ? "moderate" : "strong";
}

export function relationConfidence(rho: number | null, ci: [number, number] | null, n: number): Confidence {
  if (rho == null || ci == null || n < 14) return "LOW";
  const excludesZero = ci[0] > 0 || ci[1] < 0;
  if (!excludesZero) return "LOW";
  if (n >= 45 && Math.abs(rho) >= 0.3) return "HIGH";
  if (Math.abs(rho) >= 0.2) return "MEDIUM";
  return "LOW";
}

export function splitCompare(points: { x: number; y: number }[], threshold: number, lowLabel = "≤ threshold", highLabel = "> threshold"): SplitResult {
  const low = points.filter((p) => p.x <= threshold).map((p) => p.y);
  const high = points.filter((p) => p.x > threshold).map((p) => p.y);
  const lm = mean(low);
  const hm = mean(high);
  return {
    threshold,
    lowLabel,
    highLabel,
    lowMean: lm,
    highMean: hm,
    lowN: low.length,
    highN: high.length,
    diff: lm != null && hm != null ? hm - lm : null,
    d: cohensD(low, high),
  };
}

function fmt(x: number | null, digits = 2): string {
  return x == null ? "—" : x.toFixed(digits);
}

/**
 * Relation between metric X (day t) and metric Y (day t + lag) over [from, to].
 * Optional split threshold on X (defaults to median of X).
 */
export function relate(ds: Dataset, xKey: string, yKey: string, opts: { from?: Day; to?: Day; lag?: number; threshold?: number } = {}): RelationResult {
  const ctx = ctxOf(ds);
  const mx = metric(xKey);
  const my = metric(yKey);
  const lag = opts.lag ?? 0;
  const days = sliceDays(ds, opts.from ?? ds.firstDay ?? ds.asOf, opts.to ?? ds.asOf);
  const points: { day: Day; x: number; y: number }[] = [];
  for (let i = 0; i + lag < days.length; i++) {
    const dx = days[i];
    const dy = days[i + lag];
    if (!dx.tracked || !dy.tracked) continue;
    const x = dayValue(mx, dx, ctx);
    const y = dayValue(my, dy, ctx);
    if (x == null || y == null) continue;
    points.push({ day: dx.day, x, y });
  }
  const n = points.length;
  const rho = n >= 10 ? spearman(points.map((p) => p.x), points.map((p) => p.y)) : null;
  const ci = rho != null ? spearmanCI(rho, n) : null;
  const confidence = relationConfidence(rho, ci, n);
  const strength = strengthOf(rho, n);
  let threshold = opts.threshold;
  if (threshold == null && n > 0) {
    const sorted = points.map((p) => p.x).sort((a, b) => a - b);
    threshold = sorted[Math.floor(sorted.length / 2)];
  }
  const split = threshold != null && n >= 6 ? splitCompare(points, threshold, `${mx.label} ≤ ${fmt(threshold, 0)}`, `${mx.label} > ${fmt(threshold, 0)}`) : null;
  let statement: string;
  if (strength === "insufficient") statement = `Not enough paired days (n=${n}) to describe a relationship between ${mx.label} and ${my.label}.`;
  else if (confidence === "LOW" || strength === "none")
    statement = `No reliable relationship detected between ${mx.label} and ${my.label} in ${n} days (ρ=${fmt(rho)}, 95% CI ${ci ? `${fmt(ci[0])}…${fmt(ci[1])}` : "—"}).`;
  else {
    const dir = (rho ?? 0) > 0 ? "higher" : "lower";
    statement = `${strength[0].toUpperCase() + strength.slice(1)} association: days with higher ${mx.label} tend to have ${dir} ${my.label}${lag ? ` ${lag} day(s) later` : ""} (ρ=${fmt(rho)}, n=${n}). Association, not proven cause — consider an experiment.`;
  }
  return { xKey, yKey, lag, n, rho, ci, strength, confidence, split, statement, points };
}

/** Pre-defined relations the system checks routinely. */
export const STANDARD_RELATIONS: { x: string; y: string; lag?: number; label: string }[] = [
  { x: "phone.total", y: "deep.min", label: "Phone time vs Deep work" },
  { x: "phone.total", y: "exec.pct", label: "Phone time vs Plan execution" },
  { x: "phone.total", y: "focus.avg", label: "Phone time vs Focus" },
  { x: "phone.total", y: "german.min", label: "Phone time vs German time" },
  { x: "phone.total", y: "law.min", label: "Phone time vs Law time" },
  { x: "phone.morning", y: "deep.min", label: "Morning phone vs Deep work" },
  { x: "sleep.h", y: "focus.avg", label: "Sleep vs Focus" },
  { x: "sleep.h", y: "law.accuracy", label: "Sleep vs Law accuracy" },
  { x: "switches.perHour", y: "focus.avg", label: "Switches/h vs Focus" },
  { x: "switches.perHour", y: "law.accuracy", label: "Switches/h vs Accuracy" },
  { x: "law.questions", y: "law.accuracy", label: "Questions vs Accuracy" },
  { x: "law.recallRatio", y: "law.accuracy", label: "Active recall vs Accuracy" },
  { x: "german.speakingMin", y: "german.errPerSpeakMin", label: "Speaking vs Speaking errors" },
];
