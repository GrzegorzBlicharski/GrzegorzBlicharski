/** Report assembly: weekly, monthly, 90-day transformation, annual, Date A vs Date B. Only real data. */
import { addDays, addMonths, startOfMonth, type Day } from "@/core/dates";
import type { Dataset } from "@/core/types";
import { ctxOf, metric, rangeAgg, type Aggregate } from "@/metrics/series";
import { generateInsights, type Insight } from "@/coach/insights";
import { cefrEvidence } from "@/modules/german";
import { sustainabilityCheck } from "@/modules/recovery";
import { goalStatus } from "@/forecasting/goals";
import { CEFR_LEVELS, TEST_KIND_RANK, type TestKind } from "@/domains/catalog";

export const REPORT_SECTIONS: { title: string; keys: string[] }[] = [
  { title: "TIME", keys: ["productive.min", "total.min", "value.highShare", "system.share"] },
  { title: "ATTENTION", keys: ["focus.avg", "deep.min", "deep.avgBlock", "interruptions.perHour", "switches.perHour"] },
  { title: "PHONE", keys: ["phone.total", "phone.unproductive", "phone.compliance", "phone.morning", "phone.pickups"] },
  { title: "GERMAN", keys: ["german.min", "german.activeRatio", "german.speakingMin", "german.words", "german.err100", "german.vocabRetention"] },
  { title: "LAW", keys: ["law.min", "law.questions", "law.accuracy", "law.highConfErrors", "law.recallRatio", "law.cases"] },
  { title: "EXECUTION", keys: ["exec.pct", "tasks.completion", "startDelay.median", "consistency.minimumDay", "review.done"] },
];

export const KEY_COMPARE_METRICS = [
  "phone.total",
  "focus.avg",
  "deep.min",
  "exec.pct",
  "german.min",
  "german.activeRatio",
  "german.err100",
  "law.questions",
  "law.accuracy",
  "learning.recallRatio",
  "productive.min",
  "consistency.minimumDay",
];

export interface CompareRow {
  key: string;
  label: string;
  unit: string;
  higherIsBetter: boolean | null;
  a: Aggregate;
  b: Aggregate;
  c?: Aggregate;
  delta: number | null;
  better: boolean | null;
}

export function compareRows(ds: Dataset, keys: string[], a: { from: Day; to: Day }, b: { from: Day; to: Day }, c?: { from: Day; to: Day }): CompareRow[] {
  const ctx = ctxOf(ds);
  return keys.map((k) => {
    const m = metric(k);
    const A = rangeAgg(ds, k, a.from, a.to, ctx);
    const B = rangeAgg(ds, k, b.from, b.to, ctx);
    const C = c ? rangeAgg(ds, k, c.from, c.to, ctx) : undefined;
    const delta = A.value != null && B.value != null ? B.value - A.value : null;
    const better = delta == null || m.higherIsBetter == null || Math.abs(delta) < 1e-9 ? null : m.higherIsBetter ? delta > 0 : delta < 0;
    return { key: k, label: m.label, unit: m.unit, higherIsBetter: m.higherIsBetter, a: A, b: B, c: C, delta, better };
  });
}

export type ReportKind = "week" | "month" | "quarter" | "year";

export interface Report {
  kind: ReportKind;
  title: string;
  current: { from: Day; to: Day };
  previous: { from: Day; to: Day };
  baseline: { from: Day; to: Day };
  sections: { title: string; rows: CompareRow[] }[];
  goals: { title: string; status: string; pct: number | null }[];
  weaknesses: Insight[];
  strengths: Insight[];
  bottlenecks: Insight[];
  sustainability: ReturnType<typeof sustainabilityCheck>;
  biggestChange: CompareRow | null;
  milestones: Dataset["milestones"];
  tests: Dataset["tests"];
}

export function periodRanges(kind: ReportKind, end: Day): { current: { from: Day; to: Day }; previous: { from: Day; to: Day } } {
  if (kind === "week") return { current: { from: addDays(end, -6), to: end }, previous: { from: addDays(end, -13), to: addDays(end, -7) } };
  if (kind === "month") {
    const from = startOfMonth(end);
    const pFrom = addMonths(from, -1);
    return { current: { from, to: end }, previous: { from: pFrom, to: addDays(from, -1) } };
  }
  if (kind === "quarter") return { current: { from: addDays(end, -89), to: end }, previous: { from: addDays(end, -179), to: addDays(end, -90) } };
  return { current: { from: addDays(end, -364), to: end }, previous: { from: addDays(end, -729), to: addDays(end, -365) } };
}

export function buildReport(ds: Dataset, kind: ReportKind, end: Day = ds.asOf, insights: Insight[] = generateInsights(ds)): Report {
  const { current, previous } = periodRanges(kind, end);
  const baseline = { from: addDays(end, -89), to: end };
  const sections = REPORT_SECTIONS.map((s) => ({ title: s.title, rows: compareRows(ds, s.keys, previous, current, baseline) }));
  const all = sections.flatMap((s) => s.rows).filter((r) => r.delta != null && r.a.value);
  const biggestChange = all.length ? all.reduce((best, r) => (Math.abs(r.delta! / r.a.value!) > Math.abs(best.delta! / best.a.value!) ? r : best)) : null;
  return {
    kind,
    title: { week: "Weekly report", month: "Monthly report", quarter: "90-day transformation report", year: "Annual report" }[kind],
    current,
    previous,
    baseline,
    sections,
    goals: ds.goals.filter((g) => g.status === "active").map((g) => {
      const st = goalStatus(ds, g);
      return { title: g.title, status: st.status, pct: st.pct };
    }),
    weaknesses: insights.filter((i) => i.kind === "weakness").slice(0, 5),
    strengths: insights.filter((i) => i.kind === "strength").slice(0, 5),
    bottlenecks: insights.filter((i) => i.kind === "bottleneck" || i.kind === "warning").slice(0, 5),
    sustainability: sustainabilityCheck(ds, end),
    biggestChange,
    milestones: ds.milestones.filter((m) => m.date >= current.from && m.date <= current.to),
    tests: ds.tests.filter((t) => t.date >= current.from && t.date <= current.to),
  };
}

/** Best German CEFR evidence as of a date (for transformation comparisons). */
export function germanEvidenceAt(ds: Dataset, day: Day): string {
  const tests = ds.tests.filter((t) => t.domain === "GERMAN" && t.level && t.date <= day && (CEFR_LEVELS as readonly string[]).includes(t.level));
  if (!tests.length) return "no evidence";
  const best = tests.reduce((a, b) => {
    const ra = [TEST_KIND_RANK[a.kind as TestKind] ?? 0, CEFR_LEVELS.indexOf(a.level as (typeof CEFR_LEVELS)[number])];
    const rb = [TEST_KIND_RANK[b.kind as TestKind] ?? 0, CEFR_LEVELS.indexOf(b.level as (typeof CEFR_LEVELS)[number])];
    return rb[1] > ra[1] || (rb[1] === ra[1] && rb[0] > ra[0]) ? b : a;
  });
  return `${best.level} (${best.kind.toLowerCase()} evidence)`;
}

export { cefrEvidence };
