/** Consistency, minimum day, streaks (secondary), baselines, behaviour stability, records, data maturity. */
import { addDays, isoWeek, diffDays, type Day } from "@/core/dates";
import type { Dataset, DayFacts } from "@/core/types";
import type { MinimumDayItem } from "@/core/settings";
import { median, percentile } from "@/core/stats";
import { minimumDayMet, metric, dayValue, ctxOf, sliceDays } from "@/metrics/series";

/**
 * Minimum day = user definition if set, otherwise suggested from data: for each primary-goal domain metric,
 * ~P25 of active days over the last 60 days (rounded), bounded to stay small. Never hard-coded content.
 */
export function minimumDay(ds: Dataset): { items: MinimumDayItem[]; source: "user" | "suggested" | "default" } {
  if (ds.settings.minimumDay.length) return { items: ds.settings.minimumDay, source: "user" };
  const primaryKeys = new Set<string>();
  for (const g of ds.goals.filter((g) => g.status === "active" && g.tier === "PRIMARY")) {
    if (g.metricKey) primaryKeys.add(g.metricKey);
  }
  const candidates = [...primaryKeys].filter((k) => {
    try {
      const m = metric(k);
      return m.agg === "sum" && m.higherIsBetter === true;
    } catch {
      return false;
    }
  });
  const days = sliceDays(ds, addDays(ds.asOf, -59), addDays(ds.asOf, -1));
  const items: MinimumDayItem[] = [];
  const ctx = ctxOf(ds);
  for (const k of candidates.slice(0, 3)) {
    const all = days.map((d) => dayValue(metric(k), d, ctx) ?? 0);
    const vals = all.filter((v) => v > 0);
    // Only behaviours that already happen on most days can be a "minimum" — otherwise it is a new habit, not momentum.
    if (vals.length < 10 || vals.length / Math.max(1, all.length) < 0.7) continue;
    const p25 = percentile(vals, 25)!;
    const unit = metric(k).unit;
    const step = unit === "min" ? 5 : 5;
    const v = Math.max(step, Math.round(p25 / 2 / step) * step);
    items.push({ metricKey: k, min: v });
  }
  if (items.length) return { items, source: "suggested" };
  return { items: [], source: "default" };
}

export interface StreakInfo {
  current: number;
  longest: number;
  todayMet: boolean;
  consistency30: number | null;
  consistency90: number | null;
  activeDays30: number;
}

/** Streak counts consecutive days meeting the minimum day; today never breaks it while in progress. */
export function streaks(ds: Dataset, items: MinimumDayItem[]): StreakInfo {
  const met = ds.days.map((d) => minimumDayMet(d, items));
  const n = met.length;
  const todayMet = n > 0 && met[n - 1];
  let current = 0;
  for (let i = todayMet ? n - 1 : n - 2; i >= 0; i--) {
    if (!met[i]) break;
    current++;
  }
  let longest = 0;
  let run = 0;
  for (const m of met) {
    run = m ? run + 1 : 0;
    longest = Math.max(longest, run);
  }
  const share = (w: number) => {
    const xs = met.slice(-w);
    return xs.length ? (xs.filter(Boolean).length / xs.length) * 100 : null;
  };
  return { current, longest, todayMet, consistency30: share(30), consistency90: share(90), activeDays30: ds.days.slice(-30).filter((d) => d.core > 0).length };
}

/** Productive hours/week baseline per period (median of complete weeks). */
export function baselineEvolution(ds: Dataset, by: "quarter" | "year" = "quarter"): { period: string; medianWeeklyH: number | null; weeks: number }[] {
  const weeks = new Map<string, { min: number; days: number; firstDay: Day }>();
  for (const d of ds.days) {
    const k = isoWeek(d.day);
    const e = weeks.get(k) ?? { min: 0, days: 0, firstDay: d.day };
    e.min += d.core;
    e.days++;
    weeks.set(k, e);
  }
  const groups = new Map<string, number[]>();
  for (const e of weeks.values()) {
    if (e.days < 7) continue;
    const y = e.firstDay.slice(0, 4);
    const q = Math.floor((Number(e.firstDay.slice(5, 7)) - 1) / 3) + 1;
    const key = by === "year" ? y : `${y}-Q${q}`;
    const arr = groups.get(key) ?? [];
    arr.push(e.min / 60);
    groups.set(key, arr);
  }
  return [...groups.entries()].map(([period, xs]) => ({ period, medianWeeklyH: median(xs), weeks: xs.length }));
}

/** How many consecutive recent weeks a metric has stayed at/above 90% of its current 8-week median level. */
export function behaviourStability(ds: Dataset, key: string): { weeks: number; level: number | null } {
  const m = metric(key);
  const ctx = ctxOf(ds);
  const weekly: number[] = [];
  for (let k = 0; k < 104; k++) {
    const to = addDays(ds.asOf, -7 * k);
    const from = addDays(to, -6);
    if (!ds.firstDay || from < ds.firstDay) break;
    const vals = sliceDays(ds, from, to).map((d) => dayValue(m, d, ctx)).filter((x): x is number => x != null);
    if (!vals.length) break;
    weekly.push(vals.reduce((a, b) => a + b, 0) / vals.length);
  }
  if (weekly.length < 4) return { weeks: 0, level: null };
  const level = median(weekly.slice(0, 8))!;
  let weeks = 0;
  for (const w of weekly) {
    const ok = m.higherIsBetter === false ? w <= level * 1.1 : w >= level * 0.9;
    if (!ok) break;
    weeks++;
  }
  return { weeks, level };
}

export interface RecordRow {
  label: string;
  value: number;
  unit: string;
  date: string;
}

export function records(ds: Dataset): RecordRow[] {
  const out: RecordRow[] = [];
  const maxBy = (label: string, unit: string, f: (d: DayFacts) => number | null) => {
    let best: DayFacts | null = null;
    let bv = -Infinity;
    for (const d of ds.days) {
      const v = f(d);
      if (v != null && v > bv) {
        bv = v;
        best = d;
      }
    }
    if (best && bv > 0) out.push({ label, value: bv, unit, date: best.day });
  };
  maxBy("Deep work (day)", "min", (d) => d.deepMin);
  maxBy("German (day)", "min", (d) => d.german.min);
  maxBy("Law (day)", "min", (d) => d.law.min);
  maxBy("Questions (day)", "q", (d) => d.law.questions);
  maxBy("Longest deep block", "min", (d) => (d.deepBlocks.length ? Math.max(...d.deepBlocks) : null));
  maxBy("Words written (day)", "words", (d) => d.german.words);
  maxBy("Plan execution (day)", "%", (d) => (d.plan && d.plan.planned >= 120 ? Math.min(150, (d.total / d.plan.planned) * 100) : null));
  maxBy("Focus (day, ≥2h rated)", "/5", (d) => (d.focusMin >= 120 ? d.focusSum / d.focusMin : null));
  const phoneDays = ds.days.filter((d) => d.phone);
  if (phoneDays.length) {
    const low = phoneDays.reduce((a, b) => (b.phone!.total < a.phone!.total ? b : a));
    out.push({ label: "Lowest phone day", value: low.phone!.total, unit: "min", date: low.day });
  }
  // weekly records
  const wk = new Map<string, { deep: number; core: number; q: number; end: Day }>();
  for (const d of ds.days) {
    const k = isoWeek(d.day);
    const e = wk.get(k) ?? { deep: 0, core: 0, q: 0, end: d.day };
    e.deep += d.deepMin;
    e.core += d.core;
    e.q += d.law.questions;
    e.end = d.day;
    wk.set(k, e);
  }
  const wkMax = (label: string, unit: string, f: (e: { deep: number; core: number; q: number }) => number, scale = 1) => {
    let best: [string, { deep: number; core: number; q: number; end: Day }] | null = null;
    for (const entry of wk.entries()) if (!best || f(entry[1]) > f(best[1])) best = entry;
    if (best && f(best[1]) > 0) out.push({ label, value: f(best[1]) * scale, unit, date: best[0] });
  };
  wkMax("Deep work (week)", "h", (e) => e.deep, 1 / 60);
  wkMax("Productive (week)", "h", (e) => e.core, 1 / 60);
  wkMax("Questions (week)", "q", (e) => e.q);
  const st = streaks(ds, minimumDay(ds).items);
  if (st.longest > 0) out.push({ label: "Longest minimum-day streak", value: st.longest, unit: "days", date: "" });
  return out;
}

export type MaturityStage = "Baseline gathering" | "Basic patterns" | "Adaptive recommendations" | "Personal optimisation" | "Long-term intelligence";

export interface Maturity {
  daysTracked: number;
  stage: MaturityStage;
  stageIndex: number;
  nextAt: number | null;
  coverage: { label: string; pct: number }[];
}

/** Reliability of the *system* (data depth/coverage) — never a rating of the user. */
export function maturity(ds: Dataset): Maturity {
  const n = ds.firstDay ? diffDays(ds.firstDay, ds.asOf) + 1 : 0;
  const stages: [number, MaturityStage][] = [
    [15, "Baseline gathering"],
    [31, "Basic patterns"],
    [91, "Adaptive recommendations"],
    [366, "Personal optimisation"],
    [Infinity, "Long-term intelligence"],
  ];
  const i = stages.findIndex(([lim]) => n < lim);
  const last30 = ds.days.slice(-30);
  const pct = (f: (d: DayFacts) => boolean) => (last30.length ? (last30.filter(f).length / last30.length) * 100 : 0);
  return {
    daysTracked: n,
    stage: stages[i][1],
    stageIndex: i,
    nextAt: Number.isFinite(stages[i][0]) ? stages[i][0] : null,
    coverage: [
      { label: "Sessions", pct: pct((d) => d.sessions > 0) },
      { label: "Phone data", pct: pct((d) => !!d.phone) },
      { label: "Timed phone", pct: pct((d) => !!d.phone?.timed) },
      { label: "Focus ratings", pct: pct((d) => d.focusMin > 0) },
      { label: "Day plans", pct: pct((d) => !!d.plan) },
      { label: "Evening review", pct: pct((d) => !!d.review) },
      { label: "Recovery log", pct: pct((d) => !!d.recovery) },
    ],
  };
}
