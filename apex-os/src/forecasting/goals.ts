/** Goal progress, pace, Monte Carlo and scenario simulation. Models only what can reasonably be modelled. */
import { addDays, diffDays, type Day } from "@/core/dates";
import type { Dataset, Goal } from "@/core/types";
import { hashString, mulberry32 } from "@/core/rng";
import { honestProbability, percentile, mean } from "@/core/stats";
import { ctxOf, dayValue, metric, METRIC_MAP, rangeAgg, sliceDays, windowAgg } from "@/metrics/series";
import { sustainedCapacity } from "@/modules/recovery";

export type PaceStatus = "AHEAD" | "ON TRACK" | "BEHIND" | "ACHIEVED" | "NO DEADLINE" | "NO DATA";

export interface GoalStatus {
  goal: Goal;
  current: number | null;
  target: number;
  pct: number | null;
  expected: number | null;
  pace: number | null;
  status: PaceStatus;
  rate30: number | null; // goal units per day
  requiredRate: number | null;
  projectedDate: Day | null;
  daysLeft: number | null;
  unitFactor: number;
}

/** Conversion from metric units to goal units (minutes → hours when the goal is in hours). */
export function unitFactor(goal: Goal): number {
  const m = goal.metricKey ? METRIC_MAP.get(goal.metricKey) : null;
  if (m?.unit === "min" && goal.unit.toLowerCase() === "h") return 1 / 60;
  return 1;
}

export function goalStatus(ds: Dataset, goal: Goal): GoalStatus {
  const f = unitFactor(goal);
  const daysLeft = goal.deadline ? diffDays(ds.asOf, goal.deadline) : null;
  const base: GoalStatus = {
    goal,
    current: null,
    target: goal.target,
    pct: null,
    expected: null,
    pace: null,
    status: "NO DATA",
    rate30: null,
    requiredRate: null,
    projectedDate: null,
    daysLeft,
    unitFactor: f,
  };
  const ctx = ctxOf(ds);
  if (goal.kind === "cumulative" && goal.metricKey && METRIC_MAP.has(goal.metricKey)) {
    const tot = rangeAgg(ds, goal.metricKey, goal.startDate, ds.asOf, ctx);
    const current = (tot.total ?? 0) * f;
    const r30 = windowAgg(ds, goal.metricKey, "30D");
    const rate = r30.value != null ? r30.value * f : null;
    const remaining = Math.max(0, goal.target - current);
    const res: GoalStatus = { ...base, current, pct: (current / goal.target) * 100, rate30: rate };
    if (current >= goal.target) return { ...res, status: "ACHIEVED" };
    res.projectedDate = rate && rate > 0 ? addDays(ds.asOf, Math.ceil(remaining / rate)) : null;
    if (!goal.deadline) return { ...res, status: "NO DEADLINE" };
    const total = Math.max(1, diffDays(goal.startDate, goal.deadline));
    const elapsed = Math.min(total, Math.max(0, diffDays(goal.startDate, ds.asOf) + 1));
    const expected = (goal.target * elapsed) / total;
    const pace = expected > 0 ? current / expected : null;
    res.expected = expected;
    res.pace = pace;
    res.requiredRate = daysLeft != null && daysLeft > 0 ? remaining / daysLeft : null;
    res.status = pace == null ? "NO DATA" : pace > 1.1 ? "AHEAD" : pace >= 0.9 ? "ON TRACK" : "BEHIND";
    return res;
  }
  if (goal.kind === "rate" && goal.metricKey && METRIC_MAP.has(goal.metricKey)) {
    const a = windowAgg(ds, goal.metricKey, "30D");
    if (a.value == null) return base;
    const current = a.value * f;
    const ok = goal.direction === "down" ? current <= goal.target : current >= goal.target;
    const near = goal.direction === "down" ? current <= goal.target * 1.1 : current >= goal.target * 0.9;
    return {
      ...base,
      current,
      pct: goal.direction === "down" ? (current > 0 ? Math.min(100, (goal.target / current) * 100) : 100) : (current / goal.target) * 100,
      status: ok ? "ON TRACK" : near ? "ON TRACK" : "BEHIND",
      pace: goal.direction === "down" ? (current > 0 ? goal.target / current : null) : current / goal.target,
    };
  }
  // level / manual: latest recorded value; linear expectation from first record to target by deadline
  const pr = goal.progress;
  if (!pr.length) return base;
  const first = pr[0];
  const last = pr[pr.length - 1];
  const current = last.value;
  const res: GoalStatus = { ...base, current, pct: goal.target ? (current / goal.target) * 100 : null };
  if ((goal.direction === "down" && current <= goal.target) || (goal.direction !== "down" && current >= goal.target)) return { ...res, status: "ACHIEVED" };
  if (!goal.deadline) return { ...res, status: "NO DEADLINE" };
  const total = Math.max(1, diffDays(first.date, goal.deadline));
  const elapsed = Math.min(total, Math.max(0, diffDays(first.date, ds.asOf)));
  const expected = first.value + ((goal.target - first.value) * elapsed) / total;
  const span = expected - first.value;
  const pace = span !== 0 ? (current - first.value) / span : null;
  return { ...res, expected, pace, status: pace == null ? "ON TRACK" : pace > 1.1 ? "AHEAD" : pace >= 0.9 ? "ON TRACK" : "BEHIND" };
}

export interface MonteCarloResult {
  ok: boolean;
  reason?: string;
  runs: number;
  historyDays: number;
  probabilityByDeadline: number | null;
  p10: Day | null;
  p50: Day | null;
  p90: Day | null;
  assumptions: string[];
  seed: number;
}

/** Block-bootstrap Monte Carlo for cumulative goals. Deterministic seed ⇒ reproducible. */
export function monteCarlo(ds: Dataset, goal: Goal, runs = 2000, historyDays = 60): MonteCarloResult {
  const seed = hashString(goal.id + ds.asOf);
  const assumptions = [
    `Future days resemble the last ${historyDays} days (7-day blocks resampled).`,
    "No structural change in routine, goals or obligations.",
    "Days without sessions count as zero work.",
  ];
  const fail = (reason: string): MonteCarloResult => ({ ok: false, reason, runs: 0, historyDays: 0, probabilityByDeadline: null, p10: null, p50: null, p90: null, assumptions, seed });
  if (goal.kind !== "cumulative" || !goal.metricKey || !METRIC_MAP.has(goal.metricKey)) return fail("Monte Carlo applies to cumulative quantitative goals only.");
  const st = goalStatus(ds, goal);
  if (st.status === "ACHIEVED") return fail("Goal already achieved.");
  const m = metric(goal.metricKey);
  const ctx = ctxOf(ds);
  const hist = sliceDays(ds, addDays(ds.asOf, -historyDays), addDays(ds.asOf, -1)).map((d) => (dayValue(m, d, ctx) ?? 0) * st.unitFactor);
  if (hist.length < 21) return fail(`Needs ≥ 21 days of history (have ${hist.length}).`);
  if ((mean(hist) ?? 0) <= 0) return fail("No progress in the history window — cannot simulate.");
  const rand = mulberry32(seed);
  const remaining = goal.target - (st.current ?? 0);
  const maxDays = goal.deadline ? Math.max(diffDays(ds.asOf, goal.deadline) * 3, 365) : 1095;
  const daysToDone: number[] = [];
  let hits = 0;
  const deadlineDays = goal.deadline ? diffDays(ds.asOf, goal.deadline) : null;
  for (let r = 0; r < runs; r++) {
    let acc = 0;
    let day = 0;
    while (acc < remaining && day < maxDays) {
      const start = Math.floor(rand() * Math.max(1, hist.length - 6));
      for (let k = 0; k < 7 && acc < remaining; k++) {
        acc += hist[Math.min(hist.length - 1, start + k)];
        day++;
      }
    }
    daysToDone.push(acc >= remaining ? day : Infinity);
    if (deadlineDays != null && acc >= remaining && day <= deadlineDays + 1) hits++;
  }
  const finite = daysToDone.filter(Number.isFinite);
  const pd = (p: number) => {
    if (finite.length < runs * (p / 100)) return null;
    const v = percentile(daysToDone.map((x) => (Number.isFinite(x) ? x : 1e9)), p);
    return v != null && v < 1e9 ? addDays(ds.asOf, Math.round(v)) : null;
  };
  return {
    ok: true,
    runs,
    historyDays: hist.length,
    probabilityByDeadline: deadlineDays != null ? honestProbability(hits / runs) : null,
    p10: pd(10),
    p50: pd(50),
    p90: pd(90),
    assumptions,
    seed,
  };
}

export interface Scenario {
  label: string;
  perDay: number;
  realisticPerDay: number;
  daysToTarget: number | null;
  completion: Day | null;
  aboveCapacity: boolean;
  note: string;
}

/** "What if" for hours per day; realistic = scenario × historical execution ratio. */
export function hoursScenarios(ds: Dataset, goal: Goal | null, hoursOptions: number[], domainMetric: string): Scenario[] {
  const exec = windowAgg(ds, "exec.pct", "90D").value;
  const ratio = exec != null ? Math.min(1, exec / 100) : 0.8;
  const cap = sustainedCapacity(ds).w30?.value ?? null;
  const st = goal ? goalStatus(ds, goal) : null;
  const remaining = st && st.current != null ? Math.max(0, goal!.target - st.current) : null;
  const toGoalUnits = goal ? unitFactor(goal) : 1 / 60;
  return hoursOptions.map((h) => {
    const realistic = h * 60 * ratio;
    const perDayGoal = realistic * toGoalUnits;
    const days = remaining != null && perDayGoal > 0 && goal?.metricKey === domainMetric ? Math.ceil(remaining / perDayGoal) : null;
    return {
      label: `${h} h/day`,
      perDay: h * 60,
      realisticPerDay: realistic,
      daysToTarget: days,
      completion: days != null ? addDays(ds.asOf, days) : null,
      aboveCapacity: cap != null && h * 60 > cap * 1.1,
      note: `realistic ≈ ${(realistic / 60).toFixed(1)} h/day at ${(ratio * 100).toFixed(0)}% historical execution`,
    };
  });
}

export function phoneScenarios(ds: Dataset, options: number[]): { limit: number; current: number | null; deltaPerDay: number | null; hoursPerMonth: number | null }[] {
  const cur = windowAgg(ds, "phone.total", "30D").value;
  return options.map((limit) => ({
    limit,
    current: cur,
    deltaPerDay: cur != null ? cur - limit : null,
    hoursPerMonth: cur != null ? ((cur - limit) * 30) / 60 : null,
  }));
}

/** "If current 30D trend continues…" — linear extrapolation of a metric's 30D mean, with explicit caveat. */
export function trendExtrapolation(ds: Dataset, key: string, days: number): { value: number | null; note: string } {
  const cur = windowAgg(ds, key, "30D").value;
  const prev = rangeAgg(ds, key, addDays(ds.asOf, -59), addDays(ds.asOf, -30)).value;
  if (cur == null || prev == null) return { value: null, note: "insufficient data" };
  const perDay = (cur - prev) / 30;
  return { value: cur + perDay * days, note: "If the current 30D trend continued linearly — not a prediction of what will happen." };
}
