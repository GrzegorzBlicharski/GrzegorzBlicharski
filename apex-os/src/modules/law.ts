/** Law telemetry: area map, confidence matrix, retention by interval, forgetting risk, readiness components. */
import { addDays, diffDays, type Day } from "@/core/dates";
import type { Dataset, DayFacts } from "@/core/types";
import { normalizedEntropy, confidenceFromN, type Confidence } from "@/core/stats";
import { sliceDays } from "@/metrics/series";
import { LAW_AREAS } from "@/domains/catalog";
import { weeklyValuesCustom } from "./util";

export interface AreaRow {
  area: string;
  tier: string;
  minutes: number;
  questions: number;
  accuracy: number | null;
  recentAccuracy: number | null;
  recentN: number;
  retention: number | null;
  retentionN: number;
  lastReviewed: Day | null;
  daysSince: number | null;
  regression: boolean;
}

function areaAgg(days: DayFacts[]) {
  const m = new Map<string, { min: number; q: number; c: number; last: Day | null }>();
  for (const d of days) {
    for (const [a, v] of Object.entries(d.law.byArea)) {
      const e = m.get(a) ?? { min: 0, q: 0, c: 0, last: null };
      e.min += v.min;
      e.q += v.q;
      e.c += v.c;
      if (v.q > 0 || v.min > 0) e.last = d.day;
      m.set(a, e);
    }
  }
  return m;
}

/** Retention for an area = accuracy on attempts whose gap since the previous attempt on the same topic ≥ 4 days. */
function retentionOf(ds: Dataset, area: string, recent = true): { value: number | null; n: number } {
  let n = 0;
  let c = 0;
  for (const b of ds.retention) {
    if (b.area !== area || !["7D", "30D", "90D", "180D"].includes(b.bucket)) continue;
    n += recent ? b.n90 : b.n;
    c += recent ? b.c90 : b.c;
  }
  return { value: n >= 10 ? (c / n) * 100 : null, n };
}

export function areaMap(ds: Dataset): AreaRow[] {
  const all = areaAgg(ds.days);
  const recent = areaAgg(sliceDays(ds, addDays(ds.asOf, -29), ds.asOf));
  const areas = new Set<string>([...LAW_AREAS, ...all.keys()]);
  const rows: AreaRow[] = [];
  for (const area of areas) {
    const a = all.get(area);
    const r = recent.get(area);
    const ret = retentionOf(ds, area);
    rows.push({
      area,
      tier: ds.settings.lawAreaTiers[area] ?? "—",
      minutes: a?.min ?? 0,
      questions: a?.q ?? 0,
      accuracy: a && a.q >= 10 ? (a.c / a.q) * 100 : null,
      recentAccuracy: r && r.q >= 10 ? (r.c / r.q) * 100 : null,
      recentN: r?.q ?? 0,
      retention: ret.value,
      retentionN: ret.n,
      lastReviewed: a?.last ?? null,
      daysSince: a?.last ? diffDays(a.last, ds.asOf) : null,
      regression: areaRegression(ds, area).alert,
    });
  }
  return rows.sort((x, y) => y.questions - x.questions || y.minutes - x.minutes);
}

export function confidenceMatrix(days: DayFacts[]): { correctConf: number; correctUnsure: number; wrongUnsure: number; wrongConf: number; total: number } {
  const s = (f: (d: DayFacts) => number) => days.reduce((a, d) => a + f(d), 0);
  return {
    correctConf: s((d) => d.law.correctConf),
    correctUnsure: s((d) => d.law.correctUnsure),
    wrongUnsure: s((d) => d.law.wrongUnsure),
    wrongConf: s((d) => d.law.wrongConf),
    total: s((d) => d.law.questions),
  };
}

export const RETENTION_BUCKETS = ["1D", "7D", "30D", "90D", "180D"] as const;

export function retentionCurve(ds: Dataset): { bucket: string; n: number; accuracy: number | null }[] {
  return RETENTION_BUCKETS.map((bucket) => {
    const rows = ds.retention.filter((r) => r.bucket === bucket);
    const n = rows.reduce((a, r) => a + r.n, 0);
    const c = rows.reduce((a, r) => a + r.c, 0);
    return { bucket, n, accuracy: n >= 20 ? (c / n) * 100 : null };
  });
}

const SCHEDULE = [1, 7, 30, 90, 180];

export interface DueTopic {
  area: string;
  topic: string;
  lastDay: Day;
  daysSince: number;
  interval: number;
  overdueBy: number;
  lastAccuracy: number | null;
  accuracy: number;
  risk: "due" | "at-risk";
}

/** Forgetting risk via expanding schedule [1,7,30,90,180] by number of review days. */
export function dueTopics(ds: Dataset): DueTopic[] {
  const out: DueTopic[] = [];
  for (const t of ds.topics) {
    const stage = Math.min(SCHEDULE.length - 1, Math.max(0, t.reviewDays - 1));
    const lastAcc = t.lastN ? t.lastC / t.lastN : null;
    // A weak last review resets to a shorter interval.
    const interval = lastAcc != null && lastAcc < 0.7 ? SCHEDULE[Math.max(0, stage - 1)] : SCHEDULE[stage];
    const since = diffDays(t.lastDay, ds.asOf);
    if (since < interval) continue;
    const overdue = since - interval;
    out.push({
      area: t.area,
      topic: t.topic,
      lastDay: t.lastDay,
      daysSince: since,
      interval,
      overdueBy: overdue,
      lastAccuracy: lastAcc != null ? lastAcc * 100 : null,
      accuracy: t.n ? (t.c / t.n) * 100 : 0,
      risk: overdue >= interval * 0.5 || (lastAcc != null && lastAcc < 0.7) ? "at-risk" : "due",
    });
  }
  return out.sort((a, b) => b.overdueBy / b.interval - a.overdueBy / a.interval);
}

/** Regression alert: 3 consecutive worsening weeks, last below 8-week median, previously established (≥ 75%). */
export function areaRegression(ds: Dataset, area: string): { alert: boolean; weeks: (number | null)[] } {
  const weeks = weeklyValuesCustom(ds, 8, (days) => {
    let q = 0;
    let c = 0;
    for (const d of days) {
      const a = d.law.byArea[area];
      if (a) {
        q += a.q;
        c += a.c;
      }
    }
    return q >= 10 ? (c / q) * 100 : null;
  });
  const vals = weeks.filter((x): x is number => x != null);
  if (vals.length < 6) return { alert: false, weeks };
  const last4 = weeks.slice(-4);
  if (last4.some((x) => x == null)) return { alert: false, weeks };
  const [a, b, c, d] = last4 as number[];
  const declining = b < a && c < b && d < c;
  const sorted = [...vals].sort((x, y) => x - y);
  const med = sorted[Math.floor(sorted.length / 2)];
  const established = (vals.slice(0, -3).reduce((x, y) => x + y, 0) / Math.max(1, vals.length - 3)) >= 75;
  return { alert: declining && d < med && established, weeks };
}

export interface Readiness {
  components: { key: string; label: string; value: number | null; weight: number; detail: string }[];
  composite: number | null;
  confidence: Confidence;
}

/** Readiness ≠ hours. Components shown separately; composite optional with visible weights (ESTIMATED). */
export function readiness(ds: Dataset): Readiness {
  const areas = areaMap(ds);
  const tiers = ds.settings.lawAreaTiers;
  const required = Object.keys(tiers).length ? areas.filter((a) => tiers[a.area] === "PRIMARY" || tiers[a.area] === "SECONDARY") : areas.filter((a) => a.questions > 0);
  const last90 = sliceDays(ds, addDays(ds.asOf, -89), ds.asOf);
  const last30 = sliceDays(ds, addDays(ds.asOf, -29), ds.asOf);
  const q90ByArea = areaAgg(last90);
  const covered = required.filter((a) => (q90ByArea.get(a.area)?.q ?? 0) >= 20).length;
  const s = (xs: DayFacts[], f: (d: DayFacts) => number) => xs.reduce((a, d) => a + f(d), 0);
  const qAll = s(ds.days, (d) => d.law.questions);
  const cAll = s(ds.days, (d) => d.law.correct);
  const q30 = s(last30, (d) => d.law.questions);
  const c30 = s(last30, (d) => d.law.correct);
  const q90 = s(last90, (d) => d.law.questions);
  let rn = 0;
  let rc = 0;
  for (const b of ds.retention) if (["7D", "30D", "90D", "180D"].includes(b.bucket)) {
    rn += b.n90;
    rc += b.c90;
  }
  const mocks = ds.tests.filter((t) => t.domain === "LAW" && (t.kind === "MOCK" || t.kind === "OFFICIAL" || t.kind === "EXTERNAL")).slice(-3);
  const target90 = ds.settings.targets.lawQuestions.target * 90;
  const balance = normalizedEntropy(required.map((a) => q90ByArea.get(a.area)?.q ?? 0));
  const w = ds.settings.readinessWeights;
  const components = [
    { key: "coverage", label: "Coverage", value: required.length ? (covered / required.length) * 100 : null, weight: w.coverage ?? 0, detail: `${covered}/${required.length} areas with ≥20 questions in 90D` },
    { key: "accuracy", label: "Accuracy (all-time)", value: qAll >= 50 ? (cAll / qAll) * 100 : null, weight: w.accuracy ?? 0, detail: `${qAll} questions` },
    { key: "recentAccuracy", label: "Recent accuracy (30D)", value: q30 >= 30 ? (c30 / q30) * 100 : null, weight: w.recentAccuracy ?? 0, detail: `${q30} questions` },
    { key: "retention", label: "Retention (≥4-day gaps, 90D)", value: rn >= 30 ? (rc / rn) * 100 : null, weight: w.retention ?? 0, detail: `${rn} spaced attempts` },
    { key: "mock", label: "Mock performance", value: mocks.length ? mocks.reduce((a, t) => a + t.pct, 0) / mocks.length : null, weight: w.mock ?? 0, detail: `last ${mocks.length} mock/official` },
    { key: "volume", label: "Question volume (90D vs target)", value: target90 > 0 ? Math.min(100, (q90 / target90) * 100) : null, weight: w.volume ?? 0, detail: `${q90} / ${target90}` },
    { key: "balance", label: "Subject balance", value: balance != null ? balance * 100 : null, weight: w.balance ?? 0, detail: "normalised entropy of 90D questions across required areas" },
  ];
  const avail = components.filter((c) => c.value != null && c.weight > 0);
  const wsum = avail.reduce((a, c) => a + c.weight, 0);
  const composite = avail.length >= 4 && wsum > 0 ? avail.reduce((a, c) => a + c.value! * c.weight, 0) / wsum : null;
  return { components, composite, confidence: confidenceFromN(q90, 300, 1500) };
}

/** "Reading a lot, retaining little." */
export function readingRetentionCheck(ds: Dataset): { flag: boolean; readingShare: number | null; retention: number | null; recallRatio: number | null } {
  const days = sliceDays(ds, addDays(ds.asOf, -29), ds.asOf);
  const law = days.reduce((a, d) => a + d.law.min, 0);
  const reading = days.reduce((a, d) => a + d.law.readingMin, 0);
  const retrieval = days.reduce((a, d) => a + d.law.retrievalMin, 0);
  let rn = 0;
  let rc = 0;
  for (const b of ds.retention) if (["7D", "30D", "90D", "180D"].includes(b.bucket)) {
    rn += b.n90;
    rc += b.c90;
  }
  const retention = rn >= 30 ? (rc / rn) * 100 : null;
  const readingShare = law > 0 ? (reading / law) * 100 : null;
  const recallRatio = law > 0 ? (retrieval / law) * 100 : null;
  const flag = law >= 600 && readingShare != null && readingShare >= 50 && ((retention != null && retention < 70) || (recallRatio != null && recallRatio < 30));
  return { flag, readingShare, retention, recallRatio };
}

/** Cumulative specialization depth per area. */
export function specialization(ds: Dataset): { area: string; hours: number; questions: number; cases: number; tests: number }[] {
  const agg = areaAgg(ds.days);
  return [...agg.entries()]
    .map(([area, a]) => ({ area, hours: a.min / 60, questions: a.q, cases: 0, tests: ds.tests.filter((t) => t.area === area).length }))
    .sort((a, b) => b.hours + b.questions / 30 - (a.hours + a.questions / 30));
}
