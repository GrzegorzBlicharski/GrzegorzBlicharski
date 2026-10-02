/** Sustainability: sustained capacity, behavioural sustainability warnings. Not medical. */
import { addDays, type Day } from "@/core/dates";
import type { Dataset, DayFacts } from "@/core/types";
import { sliceDays } from "@/metrics/series";

export interface SustainedCapacity {
  w7: { value: number; end: Day } | null;
  w30: { value: number; end: Day } | null;
  w90: { value: number; end: Day } | null;
  current30: number | null;
}

/** Highest rolling mean of productive minutes/day over complete windows. */
export function sustainedCapacity(ds: Dataset, field: (d: DayFacts) => number = (d) => d.core): SustainedCapacity {
  const xs = ds.days.map(field);
  const best = (w: number) => {
    if (xs.length < w) return null;
    let s = 0;
    for (let i = 0; i < w; i++) s += xs[i];
    let bestV = s;
    let bestI = w - 1;
    for (let i = w; i < xs.length; i++) {
      s += xs[i] - xs[i - w];
      if (s > bestV) {
        bestV = s;
        bestI = i;
      }
    }
    return { value: bestV / w, end: ds.days[bestI].day };
  };
  const last30 = xs.slice(-30);
  return { w7: best(7), w30: best(30), w90: best(90), current30: last30.length ? last30.reduce((a, b) => a + b, 0) / last30.length : null };
}

export interface SustainabilityCheck {
  warning: boolean;
  signals: string[];
  hoursChangePct: number | null;
  details: { label: string; prev: number | null; cur: number | null }[];
}

/** Hours rising while focus/accuracy/completion/sleep fall (14D vs previous 14D). */
export function sustainabilityCheck(ds: Dataset, endDay: Day = ds.asOf): SustainabilityCheck {
  const cur = sliceDays(ds, addDays(endDay, -13), endDay);
  const prev = sliceDays(ds, addDays(endDay, -27), addDays(endDay, -14));
  const sum = (xs: DayFacts[], f: (d: DayFacts) => number) => xs.reduce((a, d) => a + f(d), 0);
  const ratio = (xs: DayFacts[], n: (d: DayFacts) => number, dd: (d: DayFacts) => number) => {
    const den = sum(xs, dd);
    return den > 0 ? sum(xs, n) / den : null;
  };
  const meanOf = (xs: DayFacts[], f: (d: DayFacts) => number | null | undefined) => {
    const v = xs.map(f).filter((x): x is number => x != null);
    return v.length >= 5 ? v.reduce((a, b) => a + b, 0) / v.length : null;
  };
  const hCur = sum(cur, (d) => d.total);
  const hPrev = sum(prev, (d) => d.total);
  const change = hPrev > 0 ? ((hCur - hPrev) / hPrev) * 100 : null;
  const focus = [ratio(prev, (d) => d.focusSum, (d) => d.focusMin), ratio(cur, (d) => d.focusSum, (d) => d.focusMin)];
  const acc = [ratio(prev, (d) => d.law.correct, (d) => d.law.questions), ratio(cur, (d) => d.law.correct, (d) => d.law.questions)];
  const comp = [ratio(prev, (d) => d.completedSessions, (d) => d.sessions), ratio(cur, (d) => d.completedSessions, (d) => d.sessions)];
  const sleep = [meanOf(prev, (d) => d.recovery?.sleepH), meanOf(cur, (d) => d.recovery?.sleepH)];
  const signals: string[] = [];
  if (focus[0] != null && focus[1] != null && focus[1] <= focus[0] - 0.3) signals.push(`focus ${focus[0].toFixed(1)} → ${focus[1].toFixed(1)}`);
  if (acc[0] != null && acc[1] != null && acc[1] <= acc[0] - 0.03) signals.push(`accuracy ${(acc[0] * 100).toFixed(0)}% → ${(acc[1] * 100).toFixed(0)}%`);
  if (comp[0] != null && comp[1] != null && comp[1] <= comp[0] - 0.05) signals.push(`completion ${(comp[0] * 100).toFixed(0)}% → ${(comp[1] * 100).toFixed(0)}%`);
  if (sleep[0] != null && sleep[1] != null && sleep[1] <= sleep[0] - 0.5) signals.push(`sleep ${sleep[0].toFixed(1)}h → ${sleep[1].toFixed(1)}h`);
  const warning = change != null && change >= 10 && signals.length >= 2;
  return {
    warning,
    signals,
    hoursChangePct: change,
    details: [
      { label: "Work h/14d", prev: hPrev / 60, cur: hCur / 60 },
      { label: "Focus", prev: focus[0], cur: focus[1] },
      { label: "Accuracy %", prev: acc[0] != null ? acc[0] * 100 : null, cur: acc[1] != null ? acc[1] * 100 : null },
      { label: "Completion %", prev: comp[0] != null ? comp[0] * 100 : null, cur: comp[1] != null ? comp[1] * 100 : null },
      { label: "Sleep h", prev: sleep[0], cur: sleep[1] },
    ],
  };
}

/** Compare a daily target with historically sustained capacity. */
export function targetCapacityGap(ds: Dataset, targetMinPerDay: number): { target: number; sustained90: number | null; sustained30: number | null; gap: number | null; aboveEverSustained: boolean } {
  const c = sustainedCapacity(ds);
  const s90 = c.w90?.value ?? null;
  const s30 = c.w30?.value ?? null;
  const ref = s90 ?? s30;
  return { target: targetMinPerDay, sustained90: s90, sustained30: s30, gap: ref != null ? targetMinPerDay - ref : null, aboveEverSustained: ref != null && targetMinPerDay > (s30 ?? ref) };
}

export function recoveryCoverage(ds: Dataset, windowDays = 30): number {
  const days = sliceDays(ds, addDays(ds.asOf, -(windowDays - 1)), ds.asOf);
  return days.length ? days.filter((d) => d.recovery).length / days.length : 0;
}
