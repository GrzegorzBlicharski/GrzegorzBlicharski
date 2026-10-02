/** Attention & deep work: capacity evolution, best hours, session-length effects, start delays. */
import { addDays, dtToMs, monthKey, type Day } from "@/core/dates";
import type { Dataset, SessionLite } from "@/core/types";
import { mean, median, percentile, stdev, confidenceFromN, type Confidence } from "@/core/stats";
import { sliceDays } from "@/metrics/series";

export interface DeepSummary {
  todayMin: number;
  perDay7: number;
  perWeek: number;
  ratio30: number | null;
  avgBlock30: number | null;
  longest30: number | null;
  longestAll: number | null;
}

export function deepSummary(ds: Dataset): DeepSummary {
  const d7 = sliceDays(ds, addDays(ds.asOf, -6), ds.asOf);
  const d30 = sliceDays(ds, addDays(ds.asOf, -29), ds.asOf);
  const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
  const blocks30 = d30.flatMap((d) => d.deepBlocks);
  const total30 = sum(d30.map((d) => d.total));
  const allBlocks = ds.days.flatMap((d) => d.deepBlocks);
  return {
    todayMin: ds.days.length ? ds.days[ds.days.length - 1].deepMin : 0,
    perDay7: d7.length ? sum(d7.map((d) => d.deepMin)) / d7.length : 0,
    perWeek: sum(d7.map((d) => d.deepMin)),
    ratio30: total30 > 0 ? (sum(d30.map((d) => d.deepMin)) / total30) * 100 : null,
    avgBlock30: mean(blocks30),
    longest30: blocks30.length ? Math.max(...blocks30) : null,
    longestAll: allBlocks.length ? Math.max(...allBlocks) : null,
  };
}

/** Monthly evolution of deep-work capacity (avg & P90 block length, deep h/week). */
export function deepCapacityByMonth(ds: Dataset): { month: string; avgBlock: number | null; p90Block: number | null; blocks: number; deepHPerWeek: number }[] {
  const byMonth = new Map<string, { blocks: number[]; deep: number; days: number }>();
  for (const d of ds.days) {
    const k = monthKey(d.day);
    const e = byMonth.get(k) ?? { blocks: [], deep: 0, days: 0 };
    e.blocks.push(...d.deepBlocks);
    e.deep += d.deepMin;
    e.days++;
    byMonth.set(k, e);
  }
  return [...byMonth.entries()].map(([month, e]) => ({
    month,
    avgBlock: mean(e.blocks),
    p90Block: percentile(e.blocks, 90),
    blocks: e.blocks.length,
    deepHPerWeek: (e.deep / 60 / e.days) * 7,
  }));
}

export interface HourProfile {
  hour: number;
  minutes: number;
  sessions: number;
  focus: number | null;
  completion: number | null;
  accuracy: number | null;
  accuracyN: number;
  qualifies: boolean;
  score: number | null;
}

/**
 * Best working hours computed from data (never asked). Minutes are spread over covered clock hours.
 * Per hour: weighted focus, completion rate, question accuracy (from answer timestamps).
 * Composite score = mean of available z-scores across qualifying hours (min 5 sessions & 300 min).
 */
export function bestHours(ds: Dataset, windowDays = 180): { hours: HourProfile[]; bestBlock: { start: number; end: number } | null; confidence: Confidence; qualifying: number } {
  const from = addDays(ds.asOf, -(windowDays - 1));
  const acc = new Array(24).fill(null).map(() => ({ min: 0, sessions: new Set<string>(), fSum: 0, fMin: 0, done: 0, all: 0 }));
  for (const s of ds.sessions) {
    if (s.day < from || !s.end || s.minutes <= 0) continue;
    const startMs = dtToMs(s.start);
    const endMs = Math.max(startMs, dtToMs(s.end));
    const span = endMs - startMs || 1;
    let t = startMs;
    while (t < endMs) {
      const h = new Date(t).getUTCHours();
      const next = Math.min(endMs, t - (t % 3_600_000) + 3_600_000);
      const portion = ((next - t) / span) * s.minutes;
      const a = acc[h];
      a.min += portion;
      if (!a.sessions.has(s.id)) {
        a.sessions.add(s.id);
        a.all++;
        if (s.status === "completed") a.done++;
      }
      if (s.focus != null) {
        a.fSum += s.focus * portion;
        a.fMin += portion;
      }
      t = next;
    }
  }
  const accByHour = new Map(ds.hourAccuracy.map((h) => [h.hour, h]));
  const hours: HourProfile[] = acc.map((a, hour) => {
    const qa = accByHour.get(hour);
    return {
      hour,
      minutes: a.min,
      sessions: a.sessions.size,
      focus: a.fMin > 0 ? a.fSum / a.fMin : null,
      completion: a.all > 0 ? (a.done / a.all) * 100 : null,
      accuracy: qa && qa.n >= 30 ? (qa.c / qa.n) * 100 : null,
      accuracyN: qa?.n ?? 0,
      qualifies: a.sessions.size >= 5 && a.min >= 300,
      score: null,
    };
  });
  const q = hours.filter((h) => h.qualifies);
  const z = (vals: (number | null)[]) => {
    const xs = vals.filter((x): x is number => x != null);
    const m = mean(xs);
    const s = stdev(xs);
    return (x: number | null) => (x == null || m == null || !s ? null : (x - m) / s);
  };
  const zf = z(q.map((h) => h.focus));
  const zc = z(q.map((h) => h.completion));
  const za = z(q.map((h) => h.accuracy));
  for (const h of q) {
    const parts = [zf(h.focus), zc(h.completion), za(h.accuracy)].filter((x): x is number => x != null);
    h.score = parts.length ? parts.reduce((a, b) => a + b, 0) / parts.length : null;
  }
  let bestBlock: { start: number; end: number } | null = null;
  if (q.length >= 6) {
    let best = -Infinity;
    for (let h = 0; h < 22; h++) {
      const trio = [hours[h], hours[h + 1], hours[h + 2]];
      if (!trio.every((x) => x.qualifies && x.score != null)) continue;
      const s = trio.reduce((a, b) => a + (b.score ?? 0), 0);
      if (s > best) {
        best = s;
        bestBlock = { start: h, end: h + 3 };
      }
    }
  }
  const totalSessions = ds.sessions.filter((s) => s.day >= from).length;
  return { hours, bestBlock, confidence: confidenceFromN(totalSessions, 60, 200), qualifying: q.length };
}

/** Session-length buckets vs focus & output — informs "best session length". */
export function sessionLengthProfile(ds: Dataset, windowDays = 180): { bucket: string; n: number; focus: number | null; completion: number | null }[] {
  const from = addDays(ds.asOf, -(windowDays - 1));
  const buckets: [string, number, number][] = [
    ["<25", 0, 25],
    ["25–44", 25, 45],
    ["45–74", 45, 75],
    ["75–104", 75, 105],
    ["105+", 105, 10_000],
  ];
  return buckets.map(([bucket, lo, hi]) => {
    const ss = ds.sessions.filter((s: SessionLite) => s.day >= from && s.minutes >= lo && s.minutes < hi && s.mode === "active");
    const rated = ss.filter((s) => s.focus != null);
    return {
      bucket,
      n: ss.length,
      focus: rated.length ? rated.reduce((a, s) => a + (s.focus ?? 0), 0) / rated.length : null,
      completion: ss.length ? (ss.filter((s) => s.status === "completed").length / ss.length) * 100 : null,
    };
  });
}

export function startDelayStats(ds: Dataset): Record<"7D" | "30D" | "90D", { median: number | null; n: number; onTimePct: number | null }> {
  const out = {} as Record<"7D" | "30D" | "90D", { median: number | null; n: number; onTimePct: number | null }>;
  for (const [k, w] of [
    ["7D", 7],
    ["30D", 30],
    ["90D", 90],
  ] as const) {
    const from = addDays(ds.asOf, -(w - 1));
    const delays = ds.sessions.filter((s) => s.day >= from && s.startDelay != null).map((s) => s.startDelay!);
    out[k] = { median: median(delays), n: delays.length, onTimePct: delays.length ? (delays.filter((d) => d <= 5).length / delays.length) * 100 : null };
  }
  return out;
}

export function recentSessions(ds: Dataset, day?: Day, limit = 50): SessionLite[] {
  const list = day ? ds.sessions.filter((s) => s.day === day) : ds.sessions;
  return list.slice(-limit).reverse();
}
