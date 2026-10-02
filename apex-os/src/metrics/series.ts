/**
 * Series metric catalog. Every metric is defined once as a per-day (numerator, denominator) pair over
 * DayFacts, which makes windowed aggregation mathematically correct for both sums and ratios.
 * This file is also the source of METRICS.md (see registry.ts / scripts/gen-metrics-doc.ts).
 */
import type { DayFacts, Dataset } from "@/core/types";
import { DEFAULT_SETTINGS, type Settings, type MinimumDayItem } from "@/core/settings";
import { addDays, diffDays, maxDay, type Day, type WindowKey, WINDOWS } from "@/core/dates";
import { median } from "@/core/stats";

export type MetricType = "MEASURED" | "SELF_REPORTED" | "DERIVED" | "ESTIMATED" | "FORECASTED";
export type Agg = "sum" | "ratio" | "mean" | "median" | "max";
export type Unit = "min" | "count" | "pct" | "score" | "per100" | "perMin" | "perHour" | "h" | "ratio";

export interface MetricCtx {
  settingsAt: (day: Day) => Settings;
  minimumDay: MinimumDayItem[];
}

export interface SeriesMetric {
  key: string;
  label: string;
  domain: string;
  type: MetricType;
  agg: Agg;
  unit: Unit;
  /** null = neutral (no good/bad direction) */
  higherIsBetter: boolean | null;
  /** "calendar": a day without data counts as 0; "data": only days with data count. */
  coverage: "calendar" | "data";
  /** Multiplier applied to ratio results (e.g. 100 for percentages). */
  scale?: number;
  pair?: (d: DayFacts, ctx: MetricCtx) => [number, number] | null;
  values?: (d: DayFacts, ctx: MetricCtx) => number[];
  formula: string;
  source: string;
  minSample: number;
  limitations: string;
  version: number;
}

const v = (x: number | null | undefined): [number, number] | null => (x == null ? null : [x, 1]);
const r = (num: number, den: number): [number, number] | null => (den > 0 ? [num, den] : null);

const NEUTRAL_CTX: MetricCtx = { settingsAt: () => DEFAULT_SETTINGS, minimumDay: [] };

function metricValueForMinimum(d: DayFacts, key: string): number {
  const m = METRIC_MAP.get(key);
  if (!m?.pair) return 0;
  const p = m.pair(d, NEUTRAL_CTX);
  if (!p || p[1] === 0) return 0;
  return m.agg === "sum" ? p[0] : (p[0] / p[1]) * (m.agg === "ratio" ? (m.scale ?? 1) : 1);
}

/** A day "keeps momentum" if every minimum-day item is met. Empty definition ⇒ any core work counts. */
export function minimumDayMet(d: DayFacts, items: MinimumDayItem[]): boolean {
  if (!items.length) return d.core >= 15;
  return items.every((it) => metricValueForMinimum(d, it.metricKey) >= it.min);
}

export const SERIES_METRICS: SeriesMetric[] = [
  // ── Time & work ──────────────────────────────────────────
  {
    key: "productive.min",
    label: "Productive time (core)",
    domain: "PRODUCTIVITY",
    type: "MEASURED",
    agg: "sum",
    unit: "min",
    higherIsBetter: true,
    coverage: "calendar",
    pair: (d) => v(d.core),
    formula: "Σ minutes of completed sessions in core domains (German, Law, Career, Learning)",
    source: "sessions",
    minSample: 7,
    limitations: "System building and admin are excluded by design; time ≠ progress.",
    version: 1,
  },
  {
    key: "total.min",
    label: "All tracked work",
    domain: "PRODUCTIVITY",
    type: "MEASURED",
    agg: "sum",
    unit: "min",
    higherIsBetter: null,
    coverage: "calendar",
    pair: (d) => v(d.total),
    formula: "Σ minutes of all completed sessions",
    source: "sessions",
    minSample: 7,
    limitations: "Includes system building and admin.",
    version: 1,
  },
  {
    key: "deep.min",
    label: "Deep work",
    domain: "DEEP WORK",
    type: "DERIVED",
    agg: "sum",
    unit: "min",
    higherIsBetter: true,
    coverage: "calendar",
    pair: (d) => v(d.deepMin),
    formula: "Σ minutes of sessions classified DEEP (see classification rule v1)",
    source: "sessions + settings.deep",
    minSample: 7,
    limitations: "Classification depends on self-rated focus and logged interruptions.",
    version: 1,
  },
  {
    key: "deep.ratio",
    label: "Deep work ratio",
    domain: "DEEP WORK",
    type: "DERIVED",
    agg: "ratio",
    unit: "pct",
    scale: 100,
    higherIsBetter: true,
    coverage: "data",
    pair: (d) => r(d.deepMin, d.total),
    formula: "Σ deep minutes / Σ all work minutes",
    source: "sessions",
    minSample: 7,
    limitations: "Passive sessions are LIGHT by definition.",
    version: 1,
  },
  {
    key: "deep.avgBlock",
    label: "Average deep block",
    domain: "DEEP WORK",
    type: "DERIVED",
    agg: "ratio",
    unit: "min",
    higherIsBetter: true,
    coverage: "data",
    pair: (d) => r(d.deepBlocks.reduce((a, b) => a + b, 0), d.deepBlocks.length),
    formula: "Σ deep block minutes / number of deep blocks",
    source: "sessions",
    minSample: 5,
    limitations: "Pauses inside a timer session are excluded from minutes but do not split blocks.",
    version: 1,
  },
  {
    key: "deep.longest",
    label: "Longest deep block",
    domain: "DEEP WORK",
    type: "DERIVED",
    agg: "max",
    unit: "min",
    higherIsBetter: true,
    coverage: "data",
    values: (d) => d.deepBlocks,
    formula: "max deep block minutes in window",
    source: "sessions",
    minSample: 1,
    limitations: "Single-session record; not a sustained capacity measure.",
    version: 1,
  },
  {
    key: "system.min",
    label: "System building",
    domain: "PERSONAL SYSTEMS",
    type: "MEASURED",
    agg: "sum",
    unit: "min",
    higherIsBetter: null,
    coverage: "calendar",
    pair: (d) => v(d.systemMin),
    formula: "Σ minutes in domain SYSTEM",
    source: "sessions",
    minSample: 7,
    limitations: "Only counts sessions logged as SYSTEM.",
    version: 1,
  },
  {
    key: "system.share",
    label: "System-building share",
    domain: "PERSONAL SYSTEMS",
    type: "DERIVED",
    agg: "ratio",
    unit: "pct",
    scale: 100,
    higherIsBetter: false,
    coverage: "data",
    pair: (d) => r(d.systemMin, d.total),
    formula: "Σ SYSTEM minutes / Σ all work minutes",
    source: "sessions",
    minSample: 7,
    limitations: "Some system work is valuable; the warning triggers only with flat execution.",
    version: 1,
  },
  {
    key: "value.highShare",
    label: "High-value share",
    domain: "PRODUCTIVITY",
    type: "DERIVED",
    agg: "ratio",
    unit: "pct",
    scale: 100,
    higherIsBetter: true,
    coverage: "data",
    pair: (d) => r(d.valueMin.high ?? 0, d.total),
    formula: "Σ minutes classified high-value / Σ all work minutes",
    source: "sessions + settings.classificationRules",
    minSample: 7,
    limitations: "Rule-based classification, user-editable.",
    version: 1,
  },
  // ── Attention ────────────────────────────────────────────
  {
    key: "focus.avg",
    label: "Focus (minute-weighted)",
    domain: "ATTENTION",
    type: "SELF_REPORTED",
    agg: "ratio",
    unit: "score",
    higherIsBetter: true,
    coverage: "data",
    pair: (d) => r(d.focusSum, d.focusMin),
    formula: "Σ(focus × minutes) / Σ minutes of rated sessions (1–5)",
    source: "sessions.focus",
    minSample: 7,
    limitations: "Self-rated; scale drift over months is possible.",
    version: 1,
  },
  {
    key: "interruptions.perHour",
    label: "Interruptions / hour",
    domain: "ATTENTION",
    type: "DERIVED",
    agg: "ratio",
    unit: "perHour",
    higherIsBetter: false,
    coverage: "data",
    pair: (d) => r(d.interruptions, d.total / 60),
    formula: "Σ interruptions / Σ work hours",
    source: "sessions.interruptions",
    minSample: 7,
    limitations: "Unlogged interruptions count as zero.",
    version: 1,
  },
  {
    key: "switches.perHour",
    label: "Context switches / hour",
    domain: "ATTENTION",
    type: "DERIVED",
    agg: "ratio",
    unit: "perHour",
    higherIsBetter: null,
    coverage: "data",
    pair: (d) => r(d.switches, d.switchHours),
    formula: "Σ context switches / Σ hours of sessions where switches were logged",
    source: "sessions.context_switches",
    minSample: 7,
    limitations: "Switching is not assumed to be bad; see relations.",
    version: 1,
  },
  {
    key: "startDelay.median",
    label: "Start delay (median)",
    domain: "EXECUTION",
    type: "DERIVED",
    agg: "median",
    unit: "min",
    higherIsBetter: false,
    coverage: "data",
    values: (d) => d.startDelays,
    formula: "median(actual start − planned start) over sessions with a planned start",
    source: "sessions.planned_start",
    minSample: 5,
    limitations: "Only sessions started from a planned block.",
    version: 1,
  },
  {
    key: "unfinished.rate",
    label: "Unfinished sessions",
    domain: "ATTENTION",
    type: "DERIVED",
    agg: "ratio",
    unit: "pct",
    scale: 100,
    higherIsBetter: false,
    coverage: "data",
    pair: (d) => r(d.unfinishedSessions, d.sessions),
    formula: "unfinished sessions / all sessions",
    source: "sessions.status",
    minSample: 10,
    limitations: "Depends on honest marking of unfinished sessions.",
    version: 1,
  },
  // ── Execution ────────────────────────────────────────────
  {
    key: "exec.pct",
    label: "Plan execution",
    domain: "EXECUTION",
    type: "DERIVED",
    agg: "ratio",
    unit: "pct",
    scale: 100,
    higherIsBetter: true,
    coverage: "data",
    pair: (d) => (d.plan && d.plan.planned > 0 ? [d.total, d.plan.planned] : null),
    formula: "Σ actual work minutes / Σ planned minutes (days with a plan)",
    source: "plans + sessions",
    minSample: 7,
    limitations: "Can exceed 100%. Unplanned days are excluded.",
    version: 1,
  },
  {
    key: "plan.min",
    label: "Planned time",
    domain: "EXECUTION",
    type: "MEASURED",
    agg: "mean",
    unit: "min",
    higherIsBetter: null,
    coverage: "data",
    pair: (d) => (d.plan ? [d.plan.planned, 1] : null),
    formula: "mean planned minutes on days with a plan",
    source: "plans",
    minSample: 7,
    limitations: "",
    version: 1,
  },
  {
    key: "tasks.completion",
    label: "Task completion",
    domain: "EXECUTION",
    type: "DERIVED",
    agg: "ratio",
    unit: "pct",
    scale: 100,
    higherIsBetter: true,
    coverage: "data",
    pair: (d) => r(d.tasks.completed, d.tasks.planned),
    formula: "completed tasks / tasks planned for the day (final planned day)",
    source: "tasks",
    minSample: 7,
    limitations: "Postponed tasks count on their final planned day.",
    version: 1,
  },
  {
    key: "consistency.minimumDay",
    label: "Minimum day kept",
    domain: "EXECUTION",
    type: "DERIVED",
    agg: "ratio",
    unit: "pct",
    scale: 100,
    higherIsBetter: true,
    coverage: "calendar",
    pair: (d, ctx) => [minimumDayMet(d, ctx.minimumDay) ? 1 : 0, 1],
    formula: "days meeting every minimum-day item / calendar days",
    source: "DayFacts + minimum day definition",
    minSample: 14,
    limitations: "Minimum-day definition may be system-suggested; see Settings.",
    version: 1,
  },
  {
    key: "review.done",
    label: "Evening review done",
    domain: "PERSONAL SYSTEMS",
    type: "MEASURED",
    agg: "ratio",
    unit: "pct",
    scale: 100,
    higherIsBetter: true,
    coverage: "calendar",
    pair: (d) => [d.review ? 1 : 0, 1],
    formula: "days with evening review / calendar days",
    source: "reviews",
    minSample: 7,
    limitations: "",
    version: 1,
  },
  // ── German ───────────────────────────────────────────────
  {
    key: "german.min",
    label: "German time",
    domain: "GERMAN",
    type: "MEASURED",
    agg: "sum",
    unit: "min",
    higherIsBetter: true,
    coverage: "calendar",
    pair: (d) => v(d.german.min),
    formula: "Σ German session minutes",
    source: "sessions",
    minSample: 7,
    limitations: "Time is an input, not an outcome.",
    version: 1,
  },
  {
    key: "german.activeMin",
    label: "German active time",
    domain: "GERMAN",
    type: "MEASURED",
    agg: "sum",
    unit: "min",
    higherIsBetter: true,
    coverage: "calendar",
    pair: (d) => v(d.german.active),
    formula: "Σ German minutes in active mode",
    source: "sessions.mode",
    minSample: 7,
    limitations: "Mode defaults by activity; overridable per session.",
    version: 1,
  },
  {
    key: "german.passiveMin",
    label: "German passive time",
    domain: "GERMAN",
    type: "MEASURED",
    agg: "sum",
    unit: "min",
    higherIsBetter: null,
    coverage: "calendar",
    pair: (d) => v(d.german.passive),
    formula: "Σ German minutes in passive mode",
    source: "sessions.mode",
    minSample: 7,
    limitations: "",
    version: 1,
  },
  {
    key: "german.activeRatio",
    label: "German active ratio",
    domain: "GERMAN",
    type: "DERIVED",
    agg: "ratio",
    unit: "pct",
    scale: 100,
    higherIsBetter: true,
    coverage: "data",
    pair: (d) => r(d.german.active, d.german.min),
    formula: "Σ active German minutes / Σ German minutes",
    source: "sessions",
    minSample: 7,
    limitations: "",
    version: 1,
  },
  {
    key: "german.words",
    label: "Words written",
    domain: "GERMAN",
    type: "MEASURED",
    agg: "sum",
    unit: "count",
    higherIsBetter: true,
    coverage: "calendar",
    pair: (d) => v(d.german.words),
    formula: "Σ output.words of German sessions",
    source: "sessions.output",
    minSample: 7,
    limitations: "",
    version: 1,
  },
  {
    key: "german.speakingMin",
    label: "Speaking minutes",
    domain: "GERMAN",
    type: "MEASURED",
    agg: "sum",
    unit: "min",
    higherIsBetter: true,
    coverage: "calendar",
    pair: (d) => v(d.german.speakingMin),
    formula: "Σ output.speakingMin of German sessions",
    source: "sessions.output",
    minSample: 7,
    limitations: "Actual speaking time, not session length.",
    version: 1,
  },
  {
    key: "german.err100",
    label: "Errors / 100 written words",
    domain: "GERMAN",
    type: "MEASURED",
    agg: "ratio",
    unit: "per100",
    scale: 100,
    higherIsBetter: false,
    coverage: "data",
    pair: (d) => r(d.german.writtenErrors, d.german.writtenWordsEval),
    formula: "Σ errors / Σ evaluated words × 100",
    source: "german_evals (writing)",
    minSample: 3,
    limitations: "Depends on evaluator consistency; text difficulty varies.",
    version: 1,
  },
  {
    key: "german.errPerSpeakMin",
    label: "Errors / speaking minute",
    domain: "GERMAN",
    type: "MEASURED",
    agg: "ratio",
    unit: "perMin",
    higherIsBetter: false,
    coverage: "data",
    pair: (d) => r(d.german.spokenErrors, d.german.spokenMinEval),
    formula: "Σ spoken errors / Σ evaluated speaking minutes",
    source: "german_evals (speaking)",
    minSample: 3,
    limitations: "Hard to measure consistently; treat as indicative.",
    version: 1,
  },
  {
    key: "german.vocabRetention",
    label: "Vocabulary retention",
    domain: "GERMAN",
    type: "MEASURED",
    agg: "ratio",
    unit: "pct",
    scale: 100,
    higherIsBetter: true,
    coverage: "data",
    pair: (d) => r(d.german.vocabCorrect, d.german.vocabReviewed),
    formula: "Σ correct reviews / Σ reviews",
    source: "vocab_reviews",
    minSample: 7,
    limitations: "Mixes intervals unless imported item-level.",
    version: 1,
  },
  // ── Law ──────────────────────────────────────────────────
  {
    key: "law.min",
    label: "Law time",
    domain: "LAW",
    type: "MEASURED",
    agg: "sum",
    unit: "min",
    higherIsBetter: true,
    coverage: "calendar",
    pair: (d) => v(d.law.min),
    formula: "Σ Law session minutes",
    source: "sessions",
    minSample: 7,
    limitations: "Time is an input, not an outcome.",
    version: 1,
  },
  {
    key: "law.questions",
    label: "Law questions",
    domain: "LAW",
    type: "MEASURED",
    agg: "sum",
    unit: "count",
    higherIsBetter: true,
    coverage: "calendar",
    pair: (d) => v(d.law.questions),
    formula: "Σ answered questions (singles + sets)",
    source: "question_attempts",
    minSample: 7,
    limitations: "",
    version: 1,
  },
  {
    key: "law.accuracy",
    label: "Law accuracy",
    domain: "LAW",
    type: "MEASURED",
    agg: "ratio",
    unit: "pct",
    scale: 100,
    higherIsBetter: true,
    coverage: "data",
    pair: (d) => r(d.law.correct, d.law.questions),
    formula: "Σ correct / Σ answered",
    source: "question_attempts",
    minSample: 7,
    limitations: "Question difficulty mix affects accuracy.",
    version: 1,
  },
  {
    key: "law.highConfErrors",
    label: "High-confidence errors",
    domain: "LAW",
    type: "MEASURED",
    agg: "ratio",
    unit: "pct",
    scale: 100,
    higherIsBetter: false,
    coverage: "data",
    pair: (d) => r(d.law.wrongConf, d.law.questions),
    formula: "Σ incorrect+confident / Σ answered",
    source: "question_attempts",
    minSample: 7,
    limitations: "Batch logs only include confident errors if entered.",
    version: 1,
  },
  {
    key: "law.qPerHour",
    label: "Questions / hour",
    domain: "LAW",
    type: "DERIVED",
    agg: "ratio",
    unit: "perHour",
    higherIsBetter: null,
    coverage: "data",
    pair: (d) => r(d.law.questions, d.law.qMinutes / 60),
    formula: "Σ questions / Σ logged question minutes",
    source: "question_attempts.minutes",
    minSample: 7,
    limitations: "Speed is only meaningful together with accuracy.",
    version: 1,
  },
  {
    key: "law.recallRatio",
    label: "Law active-recall ratio",
    domain: "LAW",
    type: "DERIVED",
    agg: "ratio",
    unit: "pct",
    scale: 100,
    higherIsBetter: true,
    coverage: "data",
    pair: (d) => r(d.law.retrievalMin, d.law.min),
    formula: "Σ retrieval minutes (recall, review, questions, testing) / Σ Law minutes",
    source: "sessions.activity",
    minSample: 7,
    limitations: "",
    version: 1,
  },
  {
    key: "law.cases",
    label: "Cases solved",
    domain: "LAW",
    type: "MEASURED",
    agg: "sum",
    unit: "count",
    higherIsBetter: true,
    coverage: "calendar",
    pair: (d) => v(d.law.cases),
    formula: "Σ output.cases",
    source: "sessions.output",
    minSample: 7,
    limitations: "",
    version: 1,
  },
  {
    key: "law.pages",
    label: "Pages read",
    domain: "LAW",
    type: "MEASURED",
    agg: "sum",
    unit: "count",
    higherIsBetter: null,
    coverage: "calendar",
    pair: (d) => v(d.law.pages),
    formula: "Σ output.pages",
    source: "sessions.output",
    minSample: 7,
    limitations: "Consumption — not rewarded on its own.",
    version: 1,
  },
  {
    key: "learning.recallRatio",
    label: "Active-recall ratio (all learning)",
    domain: "LEARNING",
    type: "DERIVED",
    agg: "ratio",
    unit: "pct",
    scale: 100,
    higherIsBetter: true,
    coverage: "data",
    pair: (d) => r(d.learning.retrieval, d.learning.consumption + d.learning.retrieval + d.learning.production),
    formula: "Σ retrieval minutes / Σ (consumption + retrieval + production) minutes in core domains",
    source: "sessions.activity",
    minSample: 7,
    limitations: "",
    version: 1,
  },
  // ── Phone ────────────────────────────────────────────────
  {
    key: "phone.total",
    label: "Phone time",
    domain: "DIGITAL",
    type: "MEASURED",
    agg: "mean",
    unit: "min",
    higherIsBetter: false,
    coverage: "data",
    pair: (d) => (d.phone ? [d.phone.total, 1] : null),
    formula: "mean daily phone minutes over days with phone data",
    source: "phone_usage",
    minSample: 7,
    limitations: "Days without data are excluded, not counted as 0.",
    version: 1,
  },
  {
    key: "phone.unproductive",
    label: "Unproductive screen time",
    domain: "DIGITAL",
    type: "DERIVED",
    agg: "mean",
    unit: "min",
    higherIsBetter: false,
    coverage: "data",
    pair: (d) => (d.phone ? [d.phone.unproductive, 1] : null),
    formula: "mean daily phone minutes outside productive categories",
    source: "phone_usage + settings.productivePhoneCategories",
    minSample: 7,
    limitations: "",
    version: 1,
  },
  {
    key: "phone.productive",
    label: "Productive phone time",
    domain: "DIGITAL",
    type: "DERIVED",
    agg: "mean",
    unit: "min",
    higherIsBetter: null,
    coverage: "data",
    pair: (d) => (d.phone ? [d.phone.productive, 1] : null),
    formula: "mean daily phone minutes in productive categories",
    source: "phone_usage",
    minSample: 7,
    limitations: "",
    version: 1,
  },
  {
    key: "phone.compliance",
    label: "Phone limit compliance",
    domain: "DIGITAL",
    type: "DERIVED",
    agg: "ratio",
    unit: "pct",
    scale: 100,
    higherIsBetter: true,
    coverage: "data",
    pair: (d, ctx) => (d.phone ? [d.phone.total <= ctx.settingsAt(d.day).phoneLimitMin ? 1 : 0, 1] : null),
    formula: "days with phone ≤ limit (limit as of that day) / days with phone data",
    source: "phone_usage + settings history",
    minSample: 7,
    limitations: "",
    version: 1,
  },
  {
    key: "phone.morning",
    label: "Morning phone",
    domain: "DIGITAL",
    type: "DERIVED",
    agg: "mean",
    unit: "min",
    higherIsBetter: false,
    coverage: "data",
    pair: (d) => (d.phone?.morning != null ? [d.phone.morning, 1] : null),
    formula: "mean timed phone minutes before settings.morningEnd",
    source: "phone_usage (timed)",
    minSample: 7,
    limitations: "Requires records with start/end.",
    version: 1,
  },
  {
    key: "phone.evening",
    label: "Late phone use",
    domain: "DIGITAL",
    type: "DERIVED",
    agg: "mean",
    unit: "min",
    higherIsBetter: false,
    coverage: "data",
    pair: (d) => (d.phone?.evening != null ? [d.phone.evening, 1] : null),
    formula: "mean timed phone minutes after settings.eveningStart",
    source: "phone_usage (timed)",
    minSample: 7,
    limitations: "Requires records with start/end.",
    version: 1,
  },
  {
    key: "phone.pickups",
    label: "Pickups",
    domain: "DIGITAL",
    type: "MEASURED",
    agg: "mean",
    unit: "count",
    higherIsBetter: false,
    coverage: "data",
    pair: (d) => (d.phone?.pickups != null ? [d.phone.pickups, 1] : null),
    formula: "mean daily pickups/unlocks",
    source: "phone_days / phone_usage.pickups",
    minSample: 7,
    limitations: "",
    version: 1,
  },
  {
    key: "phone.deepInterruptions",
    label: "Phone during deep work",
    domain: "DIGITAL",
    type: "DERIVED",
    agg: "mean",
    unit: "min",
    higherIsBetter: false,
    coverage: "data",
    pair: (d) => (d.phone?.timed ? [d.phone.violations["deep"] ?? 0, 1] : null),
    formula: "mean non-productive timed phone minutes overlapping DEEP sessions",
    source: "phone_usage (timed) × sessions",
    minSample: 7,
    limitations: "Requires timed phone records.",
    version: 1,
  },
  // ── Recovery (optional, self-reported) ───────────────────
  {
    key: "sleep.h",
    label: "Sleep duration",
    domain: "RECOVERY",
    type: "SELF_REPORTED",
    agg: "mean",
    unit: "h",
    higherIsBetter: null,
    coverage: "data",
    pair: (d) => v(d.recovery?.sleepH),
    formula: "mean logged sleep hours",
    source: "recovery",
    minSample: 7,
    limitations: "Not a medical measure.",
    version: 1,
  },
  {
    key: "sleep.q",
    label: "Sleep quality (self)",
    domain: "RECOVERY",
    type: "SELF_REPORTED",
    agg: "mean",
    unit: "score",
    higherIsBetter: true,
    coverage: "data",
    pair: (d) => v(d.recovery?.sleepQ),
    formula: "mean self-rated sleep quality 1–5",
    source: "recovery",
    minSample: 7,
    limitations: "Self-rating.",
    version: 1,
  },
  {
    key: "energy",
    label: "Energy (self)",
    domain: "RECOVERY",
    type: "SELF_REPORTED",
    agg: "mean",
    unit: "score",
    higherIsBetter: true,
    coverage: "data",
    pair: (d) => v(d.recovery?.energy ?? d.checkin?.energy ?? d.plan?.energy),
    formula: "mean self-rated energy 1–5 (recovery log, else check-in, else plan)",
    source: "recovery / checkins / plans",
    minSample: 7,
    limitations: "Self-rating.",
    version: 1,
  },
];

export const METRIC_MAP = new Map(SERIES_METRICS.map((m) => [m.key, m]));

export function metric(key: string): SeriesMetric {
  const m = METRIC_MAP.get(key);
  if (!m) throw new Error(`Unknown metric: ${key}`);
  return m;
}

export interface Aggregate {
  value: number | null;
  total: number | null;
  n: number; // days contributing
  days: number; // calendar days in window
}

export function aggregate(m: SeriesMetric, days: DayFacts[], ctx: MetricCtx): Aggregate {
  if (m.agg === "median" || m.agg === "max") {
    const vals: number[] = [];
    let n = 0;
    for (const d of days) {
      const xs = m.values!(d, ctx);
      if (xs.length) n++;
      vals.push(...xs);
    }
    const value = vals.length ? (m.agg === "median" ? median(vals) : Math.max(...vals)) : null;
    return { value, total: null, n, days: days.length };
  }
  let num = 0;
  let den = 0;
  let n = 0;
  for (const d of days) {
    const p = m.pair!(d, ctx);
    if (p == null) {
      if (m.coverage === "calendar" && m.agg === "sum") den += 1;
      continue;
    }
    num += p[0];
    den += p[1];
    n++;
  }
  if (den === 0) return { value: null, total: m.agg === "sum" ? 0 : null, n, days: days.length };
  const value = (num / den) * (m.agg === "ratio" ? (m.scale ?? 1) : 1);
  return { value, total: m.agg === "sum" ? num : null, n, days: days.length };
}

/** Value of a metric for a single day (null when no data). */
export function dayValue(m: SeriesMetric, d: DayFacts, ctx: MetricCtx): number | null {
  if (m.agg === "median" || m.agg === "max") {
    const xs = m.values!(d, ctx);
    return xs.length ? (m.agg === "median" ? median(xs) : Math.max(...xs)) : null;
  }
  const p = m.pair!(d, ctx);
  if (p == null) return m.coverage === "calendar" && m.agg === "sum" ? 0 : null;
  if (p[1] === 0) return null;
  return (p[0] / p[1]) * (m.agg === "ratio" ? (m.scale ?? 1) : 1);
}

export function ctxOf(ds: Dataset, minimumDay?: MinimumDayItem[]): MetricCtx {
  return { settingsAt: ds.settingsAt, minimumDay: minimumDay ?? ds.settings.minimumDay };
}

/** Days within [from, to] (inclusive). Uses the contiguous days array for O(window) slicing. */
export function sliceDays(ds: Dataset, from: Day, to: Day): DayFacts[] {
  if (!ds.firstDay || to < ds.firstDay) return [];
  const start = Math.max(0, diffDays(ds.firstDay, from));
  const end = Math.min(ds.days.length - 1, diffDays(ds.firstDay, to));
  if (end < start) return [];
  return ds.days.slice(start, end + 1);
}

export function windowRange(ds: Dataset, w: WindowKey, endDay: Day = ds.asOf): { from: Day; to: Day } {
  if (w === "ALL") return { from: ds.firstDay ?? endDay, to: endDay };
  const from = addDays(endDay, -(WINDOWS[w] - 1));
  return { from: ds.firstDay ? maxDay(from, ds.firstDay) : from, to: endDay };
}

export function windowAgg(ds: Dataset, key: string, w: WindowKey, endDay: Day = ds.asOf, ctx = ctxOf(ds)): Aggregate {
  const { from, to } = windowRange(ds, w, endDay);
  return aggregate(metric(key), sliceDays(ds, from, to), ctx);
}

/** Aggregate over an explicit range (not clipped beyond data). */
export function rangeAgg(ds: Dataset, key: string, from: Day, to: Day, ctx = ctxOf(ds)): Aggregate {
  return aggregate(metric(key), sliceDays(ds, from, to), ctx);
}

/** Daily series (day, value) for charts/analytics. */
export function dailySeries(ds: Dataset, key: string, from?: Day, to?: Day, ctx = ctxOf(ds)): { day: Day; value: number | null }[] {
  const m = metric(key);
  const days = from || to ? sliceDays(ds, from ?? ds.firstDay ?? ds.asOf, to ?? ds.asOf) : ds.days;
  return days.map((d) => ({ day: d.day, value: dayValue(m, d, ctx) }));
}
