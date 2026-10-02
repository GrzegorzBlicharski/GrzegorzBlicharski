/** Execution: plan vs actual, overplanning, task flow, planning-replacing-execution guard, protocols. */
import { addDays, isoWeek, monthKey, type Day } from "@/core/dates";
import type { Dataset, DayFacts } from "@/core/types";
import { median, mean, confidenceFromN, type Confidence } from "@/core/stats";
import { sliceDays } from "@/metrics/series";

export interface PlanActual {
  key: string;
  planned: number;
  actual: number;
  pct: number | null;
  plannedDays: number;
}

function planActualOf(key: string, days: DayFacts[]): PlanActual {
  const withPlan = days.filter((d) => d.plan && d.plan.planned > 0);
  const planned = withPlan.reduce((a, d) => a + d.plan!.planned, 0);
  const actual = withPlan.reduce((a, d) => a + d.total, 0);
  return { key, planned, actual, pct: planned > 0 ? (actual / planned) * 100 : null, plannedDays: withPlan.length };
}

export function planVsActualToday(ds: Dataset): PlanActual {
  const d = ds.days.find((x) => x.day === ds.asOf);
  return planActualOf(ds.asOf, d ? [d] : []);
}

export function planVsActualBy(ds: Dataset, unit: "week" | "month", count: number): PlanActual[] {
  const groups = new Map<string, DayFacts[]>();
  for (const d of ds.days) {
    const k = unit === "week" ? isoWeek(d.day) : monthKey(d.day);
    const arr = groups.get(k) ?? [];
    arr.push(d);
    groups.set(k, arr);
  }
  return [...groups.entries()].slice(-count).map(([k, days]) => planActualOf(k, days));
}

export interface Overplanning {
  detected: boolean;
  plannedAvg: number | null;
  actualAvg: number | null;
  executionPct: number | null;
  n: number;
  suggestedBaseline: number | null;
  confidence: Confidence;
}

/** SYSTEMATIC OVERPLANNING: ≥ 10 planned days in window and execution < 85%. */
export function detectOverplanning(ds: Dataset, windowDays = 30): Overplanning {
  const days = sliceDays(ds, addDays(ds.asOf, -(windowDays - 1)), addDays(ds.asOf, -1)).filter((d) => d.plan && d.plan.planned > 0);
  const n = days.length;
  if (n === 0) return { detected: false, plannedAvg: null, actualAvg: null, executionPct: null, n, suggestedBaseline: null, confidence: "LOW" };
  const plannedAvg = mean(days.map((d) => d.plan!.planned))!;
  const actualAvg = mean(days.map((d) => d.total))!;
  const pct = (days.reduce((a, d) => a + d.total, 0) / days.reduce((a, d) => a + d.plan!.planned, 0)) * 100;
  const med = median(days.map((d) => d.total));
  return {
    detected: n >= 10 && pct < 85,
    plannedAvg,
    actualAvg,
    executionPct: pct,
    n,
    suggestedBaseline: med != null ? Math.round((med * 1.05) / 15) * 15 : null,
    confidence: confidenceFromN(n, 10, 25),
  };
}

export interface TaskFlow {
  planned: number;
  started: number;
  completed: number;
  abandoned: number;
  postponed: number;
  open: number;
  completionRate: number | null;
}

export function taskFlow(ds: Dataset, windowDays = 30): TaskFlow {
  const from = addDays(ds.asOf, -(windowDays - 1));
  const ts = ds.tasks.filter((t) => t.plannedDay >= from && t.plannedDay <= ds.asOf);
  const completed = ts.filter((t) => t.status === "completed").length;
  const abandoned = ts.filter((t) => t.status === "abandoned").length;
  const postponed = ts.reduce((a, t) => a + t.postponeCount, 0);
  const openPast = ts.filter((t) => (t.status === "planned" || t.status === "started" || t.status === "postponed") && t.plannedDay < ds.asOf).length;
  const denom = completed + abandoned + openPast + postponed;
  return {
    planned: ts.length,
    started: ts.filter((t) => t.status === "started").length,
    completed,
    abandoned,
    postponed,
    open: ts.filter((t) => t.status === "planned" || t.status === "started" || t.status === "postponed").length,
    completionRate: denom > 0 ? (completed / denom) * 100 : null,
  };
}

export interface PlanningGuard {
  warning: boolean;
  systemShare14: number | null;
  systemMin14: number;
  systemMinPrev14: number;
  coreMin14: number;
  coreMinPrev14: number;
  message: string | null;
}

/** PLANNING MAY BE REPLACING EXECUTION. */
export function planningGuard(ds: Dataset): PlanningGuard {
  const cur = sliceDays(ds, addDays(ds.asOf, -13), ds.asOf);
  const prev = sliceDays(ds, addDays(ds.asOf, -27), addDays(ds.asOf, -14));
  const s = (xs: DayFacts[], f: (d: DayFacts) => number) => xs.reduce((a, d) => a + f(d), 0);
  const sys = s(cur, (d) => d.systemMin);
  const sysPrev = s(prev, (d) => d.systemMin);
  const core = s(cur, (d) => d.core);
  const corePrev = s(prev, (d) => d.core);
  const total = s(cur, (d) => d.total);
  const share = total > 0 ? (sys / total) * 100 : null;
  const rising = sysPrev > 0 ? sys / sysPrev >= 1.25 : sys >= 120;
  const coreFlat = core <= corePrev * 1.05;
  const warning = (rising && coreFlat && sys >= 120) || (share != null && share >= 25 && sys >= 120);
  return {
    warning,
    systemShare14: share,
    systemMin14: sys,
    systemMinPrev14: sysPrev,
    coreMin14: core,
    coreMinPrev14: corePrev,
    message: warning
      ? `PLANNING MAY BE REPLACING EXECUTION — last 14 days: ${Math.round(sys / 60)}h system building vs ${Math.round(core / 60)}h core work (${share?.toFixed(0)}% of tracked time).`
      : null,
  };
}

export function protocolAdherence(ds: Dataset, windowDays = 30): { pct: number | null; days: number } {
  const days = sliceDays(ds, addDays(ds.asOf, -(windowDays - 1)), ds.asOf).filter((d) => d.protocol && d.protocol.total > 0);
  if (!days.length) return { pct: null, days: 0 };
  const done = days.reduce((a, d) => a + d.protocol!.done, 0);
  const total = days.reduce((a, d) => a + d.protocol!.total, 0);
  return { pct: (done / total) * 100, days: days.length };
}

/** Historical distribution of actual work on planned days, used to label plans realistic/stretch/unlikely. */
export function planRealism(ds: Dataset, plannedMinutes: number): { label: "realistic" | "stretch" | "unlikely" | "unknown"; p50: number | null; p85: number | null; n: number } {
  const days = sliceDays(ds, addDays(ds.asOf, -90), addDays(ds.asOf, -1)).filter((d) => d.total > 0);
  const xs = days.map((d) => d.total).sort((a, b) => a - b);
  if (xs.length < 10) return { label: "unknown", p50: null, p85: null, n: xs.length };
  const p = (q: number) => xs[Math.min(xs.length - 1, Math.floor(q * (xs.length - 1)))];
  const p50 = p(0.5);
  const p85 = p(0.85);
  return { label: plannedMinutes <= p50 ? "realistic" : plannedMinutes <= p85 ? "stretch" : "unlikely", p50, p85, n: xs.length };
}

export type { Day };
