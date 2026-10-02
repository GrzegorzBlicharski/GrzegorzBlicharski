/**
 * Documentation registry: every series metric plus composite analyses. Source for /metrics and METRICS.md.
 */
import { SERIES_METRICS, type MetricType } from "./series";
import { CLASSIFY_VERSION } from "@/modules/classify";

export interface RegistryEntry {
  key: string;
  name: string;
  domain: string;
  type: MetricType;
  formula: string;
  source: string;
  minSample: string;
  limitations: string;
  version: number;
  aggregation: string;
}

const COMPOSITE: RegistryEntry[] = [
  { key: "classify.depth", name: "Session depth classification", domain: "DEEP WORK", type: "DERIVED", formula: "DEEP if minutes ≥ deep.minMinutes ∧ interruptions ≤ deep.maxInterruptions ∧ (focus ≥ deep.minFocus ∨ unrated & active); LIGHT if minutes < 25 ∨ focus ≤ 2 ∨ passive; else NORMAL; user override wins", source: "sessions + settings (as of session day)", minSample: "—", limitations: "Self-rated focus.", version: CLASSIFY_VERSION, aggregation: "per session" },
  { key: "trend.class", name: "Trend class", domain: "ANALYTICS", type: "DERIVED", formula: "Theil–Sen slope × window / |median|, oriented; VOLATILE if cv>0.8 ∧ |rel|<cv/2; IMPROVING ≥ +10%; DECLINING ≤ −10%", source: "daily series", minSample: "metric.minSample", limitations: "Window-dependent.", version: 1, aggregation: "window" },
  { key: "velocity", name: "Velocity & acceleration", domain: "ANALYTICS", type: "DERIVED", formula: "v = agg(last W) − agg(prev W); a = v − (agg(prev W) − agg(prev-prev W))", source: "daily series", minSample: "3W days", limitations: "Sensitive to seasonality.", version: 1, aggregation: "window" },
  { key: "relation", name: "Relationship (Spearman + split)", domain: "ANALYTICS", type: "DERIVED", formula: "ρ over paired tracked days (lag optional); 95% CI via Fisher z (SE 1.06/√(n−3)); split means + Cohen's d", source: "daily series", minSample: "10 (14 for MEDIUM, 45 for HIGH)", limitations: "Association only.", version: 1, aggregation: "window" },
  { key: "anomaly", name: "Unusual day", domain: "ANALYTICS", type: "DERIVED", formula: "|x − median₃₀| / (1.4826·MAD₃₀) ≥ 3", source: "daily series", minSample: "14 baseline days", limitations: "Not a strategy trigger.", version: 1, aggregation: "day" },
  { key: "capacity.sustained", name: "Highest sustained workload", domain: "RECOVERY", type: "DERIVED", formula: "max rolling mean of core minutes/day over complete 7/30/90-day windows", source: "DayFacts", minSample: "window length", limitations: "", version: 1, aggregation: "rolling" },
  { key: "sustainability.warning", name: "Sustainability warning", domain: "RECOVERY", type: "DERIVED", formula: "14D vs prev 14D: work hours ≥ +10% ∧ ≥2 of {focus −0.3, accuracy −3pp, completion −5pp, sleep −0.5h}", source: "DayFacts", minSample: "28 days", limitations: "Behavioural, not medical.", version: 1, aggregation: "window" },
  { key: "exec.overplanning", name: "Systematic overplanning", domain: "EXECUTION", type: "DERIVED", formula: "≥10 planned days in 30D ∧ Σactual/Σplanned < 85%; suggested base = round15(median actual × 1.05)", source: "plans + sessions", minSample: "10 planned days", limitations: "", version: 1, aggregation: "30D" },
  { key: "planning.guard", name: "Planning may be replacing execution", domain: "PERSONAL SYSTEMS", type: "DERIVED", formula: "(SYSTEM 14D ≥ 1.25× prev ∧ core 14D ≤ 1.05× prev ∧ SYSTEM ≥ 120 min) ∨ SYSTEM share ≥ 25%", source: "sessions", minSample: "28 days", limitations: "", version: 1, aggregation: "14D" },
  { key: "phone.distraction", name: "Possible distraction-related start delay", domain: "DIGITAL", type: "DERIVED", formula: "planned session started > 5 min late with ≥1 min non-productive timed phone use overlapping [planned − 10 min, actual start]", source: "sessions × phone_usage (timed)", minSample: "—", limitations: "Not causal.", version: 1, aggregation: "event" },
  { key: "phone.reclaimed", name: "Reclaimed time", domain: "DIGITAL", type: "DERIVED", formula: "max(0, baseline phone/day − current 30D phone/day); monthly = ×30; conversion = Δ productive/day ÷ reclaimed", source: "phone_usage + sessions", minSample: "14 days each window", limitations: "Arithmetic; co-occurrence only.", version: 1, aggregation: "window" },
  { key: "law.retention.bucket", name: "Retention by review interval", domain: "LAW", type: "DERIVED", formula: "accuracy of attempts grouped by gap since previous attempt on same (area, topic): 1D 1–3, 7D 4–14, 30D 15–60, 90D 61–135, 180D 136+", source: "question_attempts (SQL LAG)", minSample: "20 per bucket", limitations: "Batch sets share one timestamp.", version: 1, aggregation: "all-time / 90D" },
  { key: "law.due", name: "Forgetting risk", domain: "LAW", type: "DERIVED", formula: "interval = [1,7,30,90,180][review days − 1] (one step shorter if last accuracy < 70%); due if days since ≥ interval; at-risk if overdue ≥ 50% of interval or last accuracy < 70%", source: "question_attempts", minSample: "1 review", limitations: "Topic granularity depends on logging.", version: 1, aggregation: "per topic" },
  { key: "law.readiness", name: "Law readiness components", domain: "LAW", type: "ESTIMATED", formula: "coverage, accuracy, recent accuracy, spaced retention, mock %, volume vs target, balance (entropy); composite = weighted mean of ≥4 available components (weights in settings)", source: "question_attempts + tests", minSample: "see components", limitations: "Not a pass probability.", version: 1, aggregation: "window" },
  { key: "german.cefr", name: "CEFR evidence", domain: "GERMAN", type: "MEASURED", formula: "best level per skill ranked by evidence kind OFFICIAL > EXTERNAL > MOCK > SELF > SYSTEM", source: "tests", minSample: "1 test", limitations: "System estimates labelled; never certified.", version: 1, aggregation: "latest" },
  { key: "german.rateChange", name: "Error-rate change", domain: "GERMAN", type: "DERIVED", formula: "Theil–Sen slope of monthly errors/100 words per month; per 100 study hours = slope vs cumulative hours × 100", source: "german_evals + sessions", minSample: "3 months (4 for MEDIUM)", limitations: "", version: 1, aggregation: "monthly" },
  { key: "goal.pace", name: "Goal pace", domain: "GOALS", type: "DERIVED", formula: "pace = actual / (target × elapsed/total); AHEAD > 1.10 ≥ ON TRACK ≥ 0.90 > BEHIND", source: "goals + metric", minSample: "—", limitations: "Linear expectation.", version: 1, aggregation: "cumulative" },
  { key: "goal.montecarlo", name: "Monte Carlo completion", domain: "GOALS", type: "FORECASTED", formula: "2 000 runs of 7-day block bootstrap from last 60 days; P10/P50/P90 dates; P(by deadline) rounded to 5%, clamped 5–95%; seed = hash(goal+asOf)", source: "daily series", minSample: "21 days", limitations: "Assumes no structural change.", version: 1, aggregation: "simulation" },
  { key: "coach.priority", name: "Priority score", domain: "COACH", type: "DERIVED", formula: "100 × Impact/5 × Alignment × Conf(0.4/0.7/1) × (0.6 + 0.4·Urgency/5) / √(Effort/3)", source: "insights + goals", minSample: "—", limitations: "Rule-based scores.", version: 1, aggregation: "per insight" },
  { key: "coach.hitRate", name: "Coach hit rate", domain: "COACH", type: "DERIVED", formula: "hits / verified implemented-or-accepted recommendations; hit = metric moved ≥ 5% in intended direction within horizon", source: "recommendations + metric", minSample: "1 verified", limitations: "Unverifiable advice excluded.", version: 1, aggregation: "all-time" },
  { key: "bestHours", name: "Best working hours", domain: "ATTENTION", type: "DERIVED", formula: "per clock hour (minutes spread): weighted focus, completion, accuracy; score = mean z across qualifying hours (≥5 sessions, ≥300 min); best contiguous 3h block", source: "sessions + question timestamps", minSample: "6 qualifying hours", limitations: "", version: 1, aggregation: "180D" },
  { key: "consistency.minimumDay.suggest", name: "Suggested minimum day", domain: "EXECUTION", type: "DERIVED", formula: "per PRIMARY goal sum metric present on ≥70% of last 60 days: round5(P25 of active days ÷ 2)", source: "DayFacts + goals", minSample: "10 active days", limitations: "Overridable in settings.", version: 1, aggregation: "60D" },
];

export function registry(): RegistryEntry[] {
  return [
    ...SERIES_METRICS.map((m) => ({
      key: m.key,
      name: m.label,
      domain: m.domain,
      type: m.type,
      formula: m.formula,
      source: m.source,
      minSample: `${m.minSample} days`,
      limitations: m.limitations || "—",
      version: m.version,
      aggregation: `${m.agg} · ${m.coverage === "calendar" ? "calendar days" : "days with data"}${m.scale ? ` · ×${m.scale}` : ""}`,
    })),
    ...COMPOSITE,
  ];
}
