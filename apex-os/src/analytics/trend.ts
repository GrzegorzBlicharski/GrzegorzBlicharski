/** Trend classification, velocity/acceleration, anomalies, plateaus, breakthroughs. Pure functions. */
import { median, robustSd, theilSen, mean, type Confidence, confidenceFromN } from "@/core/stats";
import { addDays, type Day, type WindowKey } from "@/core/dates";
import type { Dataset } from "@/core/types";
import { dailySeries, metric, rangeAgg, windowAgg, ctxOf } from "@/metrics/series";

export type TrendClass = "IMPROVING" | "STABLE" | "DECLINING" | "VOLATILE" | "INSUFFICIENT";

export interface TrendResult {
  cls: TrendClass;
  slopePerDay: number | null;
  relChange: number | null; // oriented: + = better (or up, when neutral)
  level: number | null;
  cv: number | null;
  n: number;
  confidence: Confidence;
}

/**
 * Classify a series of (x = day index, y) points.
 * higherIsBetter = null → orientation "up is positive" (reported as IMPROVING = rising).
 */
export function classifyTrend(points: { x: number; y: number }[], higherIsBetter: boolean | null, minSample = 10, span?: number): TrendResult {
  const n = points.length;
  if (n < minSample) return { cls: "INSUFFICIENT", slopePerDay: null, relChange: null, level: null, cv: null, n, confidence: "LOW" };
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const b = theilSen(xs, ys) ?? 0;
  const m = median(ys)!;
  const s = robustSd(ys) ?? 0;
  const denom = Math.max(Math.abs(m), Math.abs(mean(ys) ?? 0), 1e-9);
  const width = span ?? xs[xs.length - 1] - xs[0];
  const rawRel = (b * width) / denom;
  const rel = higherIsBetter === false ? -rawRel : rawRel;
  const cv = s / denom;
  let cls: TrendClass;
  if (cv > 0.8 && Math.abs(rel) < cv / 2) cls = "VOLATILE";
  else if (rel >= 0.1) cls = "IMPROVING";
  else if (rel <= -0.1) cls = "DECLINING";
  else cls = "STABLE";
  return { cls, slopePerDay: b, relChange: rel, level: m, cv, n, confidence: confidenceFromN(n, 21, 60) };
}

/** Trend of a metric over a window ending at asOf, using days with data. */
export function metricTrend(ds: Dataset, key: string, windowDays = 30, endDay: Day = ds.asOf): TrendResult {
  const m = metric(key);
  const from = addDays(endDay, -(windowDays - 1));
  const series = dailySeries(ds, key, from, endDay);
  const pts: { x: number; y: number }[] = [];
  series.forEach((p, i) => {
    if (p.value != null) pts.push({ x: i, y: p.value });
  });
  // For calendar sum metrics include zeros only for tracked days to avoid pre-history noise.
  return classifyTrend(pts, m.higherIsBetter, Math.min(m.minSample + 3, Math.max(5, Math.floor(windowDays / 3))), windowDays - 1);
}

export interface Velocity {
  current: number | null;
  previous: number | null;
  prePrevious: number | null;
  velocity: number | null;
  acceleration: number | null;
  /** oriented: true when moving in the "good" direction */
  improving: boolean | null;
}

/** Window-over-window change. velocity = cur − prev; acceleration = velocity − (prev − prePrev). */
export function velocity(ds: Dataset, key: string, windowDays = 30, endDay: Day = ds.asOf): Velocity {
  const ctx = ctxOf(ds);
  const m = metric(key);
  const a = (k: number) => rangeAgg(ds, key, addDays(endDay, -(windowDays * (k + 1) - 1)), addDays(endDay, -windowDays * k), ctx).value;
  const cur = a(0);
  const prev = a(1);
  const pp = a(2);
  const vel = cur != null && prev != null ? cur - prev : null;
  const prevVel = prev != null && pp != null ? prev - pp : null;
  const acc = vel != null && prevVel != null ? vel - prevVel : null;
  const improving = vel == null || m.higherIsBetter == null ? null : m.higherIsBetter ? vel > 0 : vel < 0;
  return { current: cur, previous: prev, prePrevious: pp, velocity: vel, acceleration: acc, improving };
}

export interface Anomaly {
  day: Day;
  key: string;
  value: number;
  baseline: number;
  z: number;
  direction: "high" | "low";
}

/** Robust z-score of a day against the trailing 30 days (needs ≥ 14 baseline points and MAD > 0). */
export function detectAnomalies(ds: Dataset, key: string, lookbackDays = 30, threshold = 3): Anomaly[] {
  const series = dailySeries(ds, key);
  const out: Anomaly[] = [];
  for (let i = 14; i < series.length; i++) {
    const p = series[i];
    if (p.value == null) continue;
    const base = series
      .slice(Math.max(0, i - lookbackDays), i)
      .map((q) => q.value)
      .filter((x): x is number => x != null);
    if (base.length < 14) continue;
    const med = median(base)!;
    const s = robustSd(base) ?? 0;
    if (s <= 0) continue;
    const z = (p.value - med) / s;
    if (Math.abs(z) >= threshold) out.push({ day: p.day, key, value: p.value, baseline: med, z, direction: z > 0 ? "high" : "low" });
  }
  return out;
}

export interface PlateauState {
  plateau: boolean;
  breakthrough: boolean;
  plateauMean: number | null;
  recentMean: number | null;
  n: number;
}

/**
 * Plateau: 28 data points with |rel| < 0.05 and cv < 0.5.
 * Potential breakthrough: plateau ending 14 days ago, then 14 days with mean > plateau mean by
 * max(10%, 1.5·robustSD) and ≥ 10 of 14 days above the plateau mean (oriented by higherIsBetter).
 */
export function plateauBreakthrough(ds: Dataset, key: string, endDay: Day = ds.asOf): PlateauState {
  const m = metric(key);
  const sign = m.higherIsBetter === false ? -1 : 1;
  const vals = (from: Day, to: Day) =>
    dailySeries(ds, key, from, to)
      .map((p) => p.value)
      .filter((x): x is number => x != null);
  const recent = vals(addDays(endDay, -13), endDay);
  const prior = vals(addDays(endDay, -41), addDays(endDay, -14));
  const last28 = vals(addDays(endDay, -27), endDay);
  const isPlateau = (xs: number[]) => {
    if (xs.length < 20) return false;
    const t = classifyTrend(
      xs.map((y, x) => ({ x, y })),
      m.higherIsBetter,
      20,
    );
    return t.relChange != null && Math.abs(t.relChange) < 0.05 && (t.cv ?? 1) < 0.5;
  };
  const plateauNow = isPlateau(last28);
  let breakthrough = false;
  const pm = mean(prior);
  const rm = mean(recent);
  if (isPlateau(prior) && pm != null && rm != null && recent.length >= 10) {
    const s = robustSd(prior) ?? 0;
    const margin = Math.max(Math.abs(pm) * 0.1, 1.5 * s);
    const above = recent.filter((x) => sign * (x - pm) > 0).length;
    breakthrough = sign * (rm - pm) > margin && above >= 10;
  }
  return { plateau: plateauNow, breakthrough, plateauMean: pm, recentMean: rm, n: last28.length };
}

/** Value of a metric for each standard window. */
export function windowTable(ds: Dataset, key: string, endDay: Day = ds.asOf): Record<WindowKey, { value: number | null; n: number; total: number | null }> {
  const out = {} as Record<WindowKey, { value: number | null; n: number; total: number | null }>;
  for (const w of ["7D", "30D", "90D", "365D", "ALL"] as WindowKey[]) {
    const a = windowAgg(ds, key, w, endDay);
    out[w] = { value: a.value, n: a.n, total: a.total };
  }
  return out;
}

/** Weekly values of a metric (ISO weeks ending at endDay), most recent last. */
export function weeklyValues(ds: Dataset, key: string, weeks: number, endDay: Day = ds.asOf): { end: Day; value: number | null; n: number }[] {
  const out: { end: Day; value: number | null; n: number }[] = [];
  const ctx = ctxOf(ds);
  for (let k = weeks - 1; k >= 0; k--) {
    const to = addDays(endDay, -7 * k);
    const a = rangeAgg(ds, key, addDays(to, -6), to, ctx);
    out.push({ end: to, value: a.value, n: a.n });
  }
  return out;
}
