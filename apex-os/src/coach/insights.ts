/**
 * Coach engine — rule-based detectors producing evidence-backed insights (FACT → INTERPRETATION → ACTION).
 * No motivational filler, no judgement of the person.
 */
import { addDays, formatDuration } from "@/core/dates";
import type { Dataset } from "@/core/types";
import { CONFIDENCE_FACTOR, clamp, confidenceFromN, type Confidence } from "@/core/stats";
import { windowAgg, METRIC_MAP } from "@/metrics/series";
import { metricTrend, velocity, type TrendClass } from "@/analytics/trend";
import { relate } from "@/analytics/relations";
import { detectOverplanning, planningGuard } from "@/modules/execution";
import { phoneCompliance, morningDiscipline } from "@/modules/digital";
import { startDelayStats, bestHours } from "@/modules/attention";
import { skillMix, monthlyErrorRates, rateChange, recurringErrors, weakestSkill } from "@/modules/german";
import { areaMap, dueTopics, readiness, readingRetentionCheck, retentionCurve } from "@/modules/law";
import { sustainabilityCheck, targetCapacityGap } from "@/modules/recovery";
import { lowValueCandidates } from "@/modules/learning";
import { maturity } from "@/modules/consistency";
import { goalStatus } from "@/forecasting/goals";

export type InsightKind = "weakness" | "strength" | "bottleneck" | "opportunity" | "warning" | "pattern" | "lowValue";

export interface Insight {
  id: string;
  ruleId: string;
  domain: string;
  kind: InsightKind;
  title: string;
  facts: string[];
  interpretation: string;
  action: string;
  evidence: { n: number; window: string };
  severity: number;
  confidence: Confidence;
  trend: TrendClass | null;
  impact: number;
  urgency: number;
  effort: number;
  goalRelevance: number;
  metricKey?: string;
  direction?: "up" | "down";
  /** Optional experiment template derived from this insight. */
  experiment?: { title: string; hypothesis: string; primaryMetric: string; metrics: string[]; durationDays: number };
  /** Daily actionable step (used by Today/top-3). */
  todayAction?: { label: string; domain: string; minutes?: number };
  priority: number;
}

export const PRIORITY_FORMULA =
  "Priority = 100 × (Impact/5) × GoalAlignment × ConfidenceFactor × (0.6 + 0.4 × Urgency/5) / √(Effort/3)   ·   ConfidenceFactor: LOW 0.4 · MEDIUM 0.7 · HIGH 1.0";

export function priorityScore(i: Pick<Insight, "impact" | "urgency" | "effort" | "confidence" | "goalRelevance">): number {
  const p = (100 * (i.impact / 5) * i.goalRelevance * CONFIDENCE_FACTOR[i.confidence] * (0.6 + (0.4 * i.urgency) / 5)) / Math.sqrt(i.effort / 3);
  return Math.round(clamp(p, 0, 100));
}

const TIER_FACTOR: Record<string, number> = { PRIMARY: 1, SECONDARY: 0.7, MAINTENANCE: 0.4 };

/** Goal alignment: max over active goals touching the insight's domain or metric; otherwise 0.3. */
export function goalAlignment(ds: Dataset, domain: string, metricKey?: string): number {
  let best = 0;
  for (const g of ds.goals) {
    if (g.status !== "active") continue;
    const touches = g.domain === domain || (metricKey && (g.metricKey === metricKey || g.leading.includes(metricKey)));
    if (touches) best = Math.max(best, (g.weight / 5) * (TIER_FACTOR[g.tier] ?? 0.5));
  }
  return best > 0 ? Math.max(0.3, best) : 0.3;
}

const f0 = (x: number | null | undefined) => (x == null ? "—" : x.toFixed(0));
const f1 = (x: number | null | undefined) => (x == null ? "—" : Math.abs(x) >= 100 ? Math.round(x).toLocaleString("en-US") : x.toFixed(1));

type Draft = Omit<Insight, "priority" | "goalRelevance" | "id"> & { goalRelevance?: number };

export function generateInsights(ds: Dataset): Insight[] {
  const drafts: Draft[] = [];
  const mat = maturity(ds);
  if (mat.stageIndex === 0) {
    drafts.push({
      ruleId: "maturity.baseline",
      domain: "PERSONAL SYSTEMS",
      kind: "pattern",
      title: "Baseline gathering",
      facts: [`${mat.daysTracked} days tracked (recommendations start at 15).`],
      interpretation: "Patterns and recommendations need a baseline; only descriptive figures are shown.",
      action: "Log sessions and phone time daily (< 2 min). Keep the plan close to what you normally do.",
      evidence: { n: mat.daysTracked, window: "ALL" },
      severity: 1,
      confidence: "HIGH",
      trend: null,
      impact: 2,
      urgency: 2,
      effort: 1,
    });
    return finalize(ds, drafts);
  }

  // ── Execution ───────────────────────────────────────────
  const op = detectOverplanning(ds);
  if (op.detected)
    drafts.push({
      ruleId: "exec.overplanning",
      domain: "EXECUTION",
      kind: "bottleneck",
      title: "Systematic overplanning",
      facts: [`Last 30 days: planned average ${formatDuration(op.plannedAvg)}, actual ${formatDuration(op.actualAvg)}.`, `Historical execution ${f1(op.executionPct)}% (n=${op.n} planned days).`],
      interpretation: "Plans are consistently larger than the capacity you actually sustain, which turns normal days into apparent failures.",
      action: `Set the base plan near ${formatDuration(op.suggestedBaseline)} (median actual +5%) and use stretch blocks for anything above.`,
      evidence: { n: op.n, window: "30D" },
      severity: op.executionPct! < 70 ? 4 : 3,
      confidence: op.confidence,
      trend: null,
      impact: 4,
      urgency: 3,
      effort: 1,
      metricKey: "exec.pct",
      direction: "up",
      experiment: { title: "Capacity-based planning", hypothesis: "Planning at historical capacity raises execution % without reducing total work.", primaryMetric: "exec.pct", metrics: ["exec.pct", "productive.min", "focus.avg"], durationDays: 14 },
    });
  const pg = planningGuard(ds);
  if (pg.warning)
    drafts.push({
      ruleId: "exec.planningReplacing",
      domain: "PERSONAL SYSTEMS",
      kind: "warning",
      title: "Planning may be replacing execution",
      facts: [pg.message!, `Previous 14 days: ${f0(pg.systemMinPrev14 / 60)}h system vs ${f0(pg.coreMinPrev14 / 60)}h core.`],
      interpretation: "System-building time is rising while core work is flat. Improving the system is not the same as learning.",
      action: "Cap system building at 30 min/day for 14 days; batch improvements into one weekly slot.",
      evidence: { n: 28, window: "14D vs prev 14D" },
      severity: 4,
      confidence: "HIGH",
      trend: null,
      impact: 4,
      urgency: 4,
      effort: 1,
      metricKey: "system.share",
      direction: "down",
    });
  const sd = startDelayStats(ds);
  if (sd["30D"].n >= 8 && (sd["30D"].median ?? 0) > 10)
    drafts.push({
      ruleId: "exec.startDelay",
      domain: "EXECUTION",
      kind: "weakness",
      title: "Late starts on planned sessions",
      facts: [`Median start delay 30D: ${f0(sd["30D"].median)} min (n=${sd["30D"].n}); 90D: ${f0(sd["90D"].median)} min.`, `On-time (≤5 min) share: ${f0(sd["30D"].onTimePct)}%.`],
      interpretation: "A consistent delay before planned blocks reduces available deep time and pushes work later in the day.",
      action: "Use a start protocol: phone out of reach 10 min before the first planned block; start with a 2-minute task.",
      evidence: { n: sd["30D"].n, window: "30D" },
      severity: 3,
      confidence: confidenceFromN(sd["30D"].n, 10, 30),
      trend: metricTrend(ds, "startDelay.median", 60).cls,
      impact: 3,
      urgency: 3,
      effort: 1,
      metricKey: "startDelay.median",
      direction: "down",
    });

  // ── Phone & attention ───────────────────────────────────
  const pc7 = phoneCompliance(ds, 7);
  const pc30 = phoneCompliance(ds, 30);
  const limit = ds.settings.phoneLimitMin;
  if (pc30.dataDays >= 7 && pc30.avg != null && pc30.avg > limit) {
    const rel = relate(ds, "phone.total", "deep.min", { from: addDays(ds.asOf, -89) });
    const facts = [
      `Phone 30D average ${f0(pc30.avg)} min vs limit ${limit} (7D: ${f0(pc7.avg)}).`,
      `Under limit on ${pc30.under}/${pc30.dataDays} days (${f0(pc30.pct)}%); cumulative overage ${f0(pc30.cumulativeOverage)} min.`,
    ];
    if (rel.confidence !== "LOW" && (rel.rho ?? 0) < 0 && rel.split?.lowMean != null && rel.split.highMean != null)
      facts.push(`Days with phone ≤ ${f0(rel.split.threshold)} min averaged ${f0(rel.split.lowMean)} min deep work vs ${f0(rel.split.highMean)} min (n=${rel.n}, ${rel.confidence}).`);
    drafts.push({
      ruleId: "phone.overBudget",
      domain: "DIGITAL",
      kind: "weakness",
      title: "Phone above budget",
      facts,
      interpretation: rel.confidence !== "LOW" && (rel.rho ?? 0) < 0 ? "Higher phone days co-occur with less deep work in your data (association, not proof)." : "Your data does not (yet) show a reliable link to deep work, but the budget you set is exceeded.",
      action: "Enable one no-phone window during your first deep block and track compliance for 14 days.",
      evidence: { n: pc30.dataDays, window: "30D" },
      severity: pc30.avg > limit * 1.5 ? 4 : 3,
      confidence: confidenceFromN(pc30.dataDays, 14, 28),
      trend: metricTrend(ds, "phone.total", 30).cls,
      impact: 3,
      urgency: 3,
      effort: 2,
      metricKey: "phone.total",
      direction: "down",
      experiment: { title: `Phone ≤ ${limit} min/day`, hypothesis: `Phone ≤ ${limit} min/day improves productive output.`, primaryMetric: "deep.min", metrics: ["phone.total", "deep.min", "german.min", "law.min", "exec.pct", "focus.avg"], durationDays: 30 },
      todayAction: { label: `Stay within ${limit} min phone (no-phone first deep block)`, domain: "DIGITAL" },
    });
  }
  const md = morningDiscipline(ds);
  if (md.n >= 10 && md.pct != null && md.pct < 50)
    drafts.push({
      ruleId: "phone.morning",
      domain: "DIGITAL",
      kind: "weakness",
      title: "Morning phone use",
      facts: [`Phone-free mornings (<5 min before ${ds.settings.morningEnd}): ${f0(md.pct)}% of ${md.n} days.`, `Average morning phone: ${f0(windowAgg(ds, "phone.morning", "30D").value)} min.`],
      interpretation: "Morning is typically when planned deep work starts; phone use there competes directly with it.",
      action: "Keep the phone out of the room until the first block is started.",
      evidence: { n: md.n, window: "30D" },
      severity: 2,
      confidence: confidenceFromN(md.n, 14, 28),
      trend: null,
      impact: 3,
      urgency: 2,
      effort: 2,
      metricKey: "phone.morning",
      direction: "down",
    });
  const blk = metricTrend(ds, "deep.avgBlock", 60);
  if (blk.cls === "DECLINING" && blk.n >= 15)
    drafts.push({
      ruleId: "attention.blockFalling",
      domain: "DEEP WORK",
      kind: "weakness",
      title: "Deep blocks getting shorter",
      facts: [`Average deep block trend (60D): ${f0((blk.relChange ?? 0) * 100)}% (level ${f0(blk.level)} min, n=${blk.n}).`],
      interpretation: "Capacity for uninterrupted work is moving down.",
      action: "Protect one 75-minute block per day with interruptions logged.",
      evidence: { n: blk.n, window: "60D" },
      severity: 3,
      confidence: blk.confidence,
      trend: blk.cls,
      impact: 3,
      urgency: 2,
      effort: 2,
      metricKey: "deep.avgBlock",
      direction: "up",
    });

  // ── German ──────────────────────────────────────────────
  const mix = skillMix(ds, 30);
  const weakest = weakestSkill(ds);
  for (const s of mix.skills.filter((x) => x.flag === "under")) {
    const isWeakest = weakest?.skill === s.skill;
    drafts.push({
      ruleId: `german.under.${s.skill}`,
      domain: "GERMAN",
      kind: isWeakest ? "bottleneck" : "weakness",
      title: `${s.skill} undertrained`,
      facts: [
        `${s.skill} = ${f1(s.share * 100)}% of German time (target ${f0((s.target ?? 0) * 100)}%) over 30D (${f0(mix.total / 60)}h total).`,
        ...(isWeakest ? [`${s.skill} is the lowest CEFR dimension in latest tests (${f0(weakest!.pct)}%).`] : []),
      ],
      interpretation: isWeakest ? "The weakest measured skill also receives the least practice relative to your target." : "Time allocation deviates from the mix you defined for your goal.",
      action: `Increase ${s.skill} share toward ${f0((s.target ?? 0) * 100)}% for the next 14 days.`,
      evidence: { n: Math.round(mix.total), window: "30D minutes" },
      severity: isWeakest ? 4 : 3,
      confidence: mix.total >= 900 ? "HIGH" : "MEDIUM",
      trend: null,
      impact: isWeakest ? 5 : 3,
      urgency: 3,
      effort: 2,
      metricKey: s.skill === "Speaking" ? "german.speakingMin" : "german.activeMin",
      direction: "up",
      experiment:
        s.skill === "Speaking"
          ? { title: "60 min Speaking/day", hypothesis: "60 min Speaking/day improves Speaking performance faster than the existing strategy.", primaryMetric: "german.errPerSpeakMin", metrics: ["german.speakingMin", "german.errPerSpeakMin", "german.min"], durationDays: 30 }
          : undefined,
      todayAction: { label: `German ${s.skill}`, domain: "GERMAN", minutes: 45 },
    });
  }
  if (mix.passiveShareFlag)
    drafts.push({
      ruleId: "german.passive",
      domain: "GERMAN",
      kind: "weakness",
      title: "Passive German dominates",
      facts: [`Passive = ${f0((mix.passive / Math.max(1, mix.total)) * 100)}% of German time (your max: ${f0(ds.settings.germanMaxPassiveShare * 100)}%).`],
      interpretation: "Passive consumption is not equivalent to active production for speaking/writing goals.",
      action: "Convert one passive block per day into output (speaking, writing, shadowing).",
      evidence: { n: Math.round(mix.total), window: "30D minutes" },
      severity: 3,
      confidence: "MEDIUM",
      trend: null,
      impact: 3,
      urgency: 2,
      effort: 2,
      metricKey: "german.activeRatio",
      direction: "up",
    });
  const rates = monthlyErrorRates(ds);
  const err = rateChange(rates.slice(-6), (r) => r.err100);
  if (err.months >= 4 && err.perMonth != null && err.perMonth >= 0)
    drafts.push({
      ruleId: "german.errorsFlat",
      domain: "GERMAN",
      kind: "weakness",
      title: "Writing error rate not improving",
      facts: [`Errors/100 words: ${f1(err.first)} → ${f1(err.last)} over ${err.months} months (slope ${f1(err.perMonth)}/month).`],
      interpretation: "Writing volume is not translating into accuracy; feedback loops may be missing.",
      action: "Add error-targeted drills for the top recurring category and re-write corrected texts.",
      evidence: { n: err.months, window: "months" },
      severity: 3,
      confidence: err.confidence,
      trend: "STABLE",
      impact: 4,
      urgency: 2,
      effort: 3,
      metricKey: "german.err100",
      direction: "down",
    });
  for (const re of recurringErrors(rates).slice(0, 2))
    drafts.push({
      ruleId: `german.recurring.${re.category}`,
      domain: "GERMAN",
      kind: "weakness",
      title: `Recurring error: ${re.category}`,
      facts: [`${re.category} = ${f0(re.lastShare * 100)}% of errors; ≥15% share in ${re.months} of last 4 months (${re.trend}).`],
      interpretation: "A stable error category signals a specific grammar gap rather than general level.",
      action: `Daily 10-minute targeted drill on ${re.category} for 14 days; track category share.`,
      evidence: { n: re.months, window: "4 months" },
      severity: re.trend === "rising" ? 3 : 2,
      confidence: "MEDIUM",
      trend: null,
      impact: 3,
      urgency: 2,
      effort: 1,
      metricKey: "german.err100",
      direction: "down",
    });
  const lastWriting = [...ds.days].reverse().find((d) => d.german.writtenWordsEval > 0);
  if (ds.goals.some((g) => g.domain === "GERMAN" && g.status === "active") && (!lastWriting || lastWriting.day < addDays(ds.asOf, -30)))
    drafts.push({
      ruleId: "german.noFeedback",
      domain: "GERMAN",
      kind: "opportunity",
      title: "No evaluated German writing in 30 days",
      facts: [lastWriting ? `Last evaluated text: ${lastWriting.day}.` : "No evaluated writing samples recorded."],
      interpretation: "Without evaluated output, skill progress cannot be verified.",
      action: "Write and evaluate one short text this week (errors by category).",
      evidence: { n: 0, window: "30D" },
      severity: 2,
      confidence: "HIGH",
      trend: null,
      impact: 3,
      urgency: 2,
      effort: 1,
    });

  // ── Law ─────────────────────────────────────────────────
  const hce = windowAgg(ds, "law.highConfErrors", "30D");
  const q30 = windowAgg(ds, "law.questions", "30D").total ?? 0;
  if (q30 >= 100 && (hce.value ?? 0) >= 8)
    drafts.push({
      ruleId: "law.highConfidenceErrors",
      domain: "LAW",
      kind: "weakness",
      title: "High-confidence errors",
      facts: [`${f1(hce.value)}% of answers in 30D were wrong while confident (${f0(q30)} questions).`],
      interpretation: "Confident errors indicate misconceptions — more dangerous than gaps you know about.",
      action: "Review every confident error the same day; write the correct rule in one sentence.",
      evidence: { n: q30, window: "30D" },
      severity: 4,
      confidence: confidenceFromN(q30, 150, 500),
      trend: metricTrend(ds, "law.highConfErrors", 30).cls,
      impact: 4,
      urgency: 3,
      effort: 1,
      metricKey: "law.highConfErrors",
      direction: "down",
    });
  const due = dueTopics(ds);
  const atRisk = due.filter((d) => d.risk === "at-risk");
  if (atRisk.length >= 5) {
    const areas = [...new Set(atRisk.slice(0, 10).map((d) => d.area))].slice(0, 3).join(", ");
    drafts.push({
      ruleId: "law.forgetting",
      domain: "LAW",
      kind: "bottleneck",
      title: "Topics at risk of forgetting",
      facts: [`${atRisk.length} topics overdue by ≥ 50% of their interval (${due.length} due in total). Areas: ${areas}.`],
      interpretation: "Retention decays without spaced review; reviewing now is cheaper than relearning.",
      action: `Review the ${Math.min(15, atRisk.length)} most overdue topics today.`,
      evidence: { n: due.length, window: "schedule" },
      severity: atRisk.length >= 20 ? 4 : 3,
      confidence: "HIGH",
      trend: null,
      impact: 4,
      urgency: 4,
      effort: 2,
      todayAction: { label: `Review ${Math.min(15, atRisk.length)} at-risk topics (${areas})`, domain: "LAW", minutes: Math.min(60, 10 + atRisk.length * 2) },
    });
  }
  for (const a of areaMap(ds).filter((x) => x.regression).slice(0, 3))
    drafts.push({
      ruleId: `law.regression.${a.area}`,
      domain: "LAW",
      kind: "warning",
      title: `${a.area} accuracy regressing`,
      facts: [`${a.area} accuracy fell three weeks in a row; 30D: ${f0(a.recentAccuracy)}% vs all-time ${f0(a.accuracy)}%.`],
      interpretation: "A previously established area is slipping.",
      action: `Schedule a focused ${a.area} review set (30 questions) within 3 days.`,
      evidence: { n: a.recentN, window: "8 weeks" },
      severity: 3,
      confidence: confidenceFromN(a.recentN, 40, 120),
      trend: "DECLINING",
      impact: 3,
      urgency: 4,
      effort: 2,
      todayAction: { label: `${a.area} review set (30 q)`, domain: "LAW", minutes: 40 },
    });
  const rd = readiness(ds);
  const cov = rd.components.find((c) => c.key === "coverage");
  if (cov?.value != null && cov.value < 60)
    drafts.push({
      ruleId: "law.coverage",
      domain: "LAW",
      kind: "weakness",
      title: "Low subject coverage",
      facts: [`Coverage ${f0(cov.value)}% — ${cov.detail}.`],
      interpretation: "Readiness depends on breadth; uncovered areas carry unmeasured risk.",
      action: "Add 20 questions/week in each uncovered required area.",
      evidence: { n: 90, window: "90D" },
      severity: 3,
      confidence: rd.confidence,
      trend: null,
      impact: 3,
      urgency: 2,
      effort: 2,
    });
  const rr = readingRetentionCheck(ds);
  if (rr.flag)
    drafts.push({
      ruleId: "law.readingRetention",
      domain: "LAW",
      kind: "bottleneck",
      title: "Reading a lot, retaining little",
      facts: [`Reading = ${f0(rr.readingShare)}% of Law time (30D); active-recall ratio ${f0(rr.recallRatio)}%; spaced retention ${f0(rr.retention)}%.`],
      interpretation: "Consumption is not converting into retrievable knowledge.",
      action: "Follow each reading block with 15 minutes of questions on the same material.",
      evidence: { n: 30, window: "30D" },
      severity: 4,
      confidence: "MEDIUM",
      trend: null,
      impact: 5,
      urgency: 3,
      effort: 2,
      metricKey: "law.recallRatio",
      direction: "up",
      experiment: { title: "Read → recall pairing", hypothesis: "Pairing each reading block with immediate questions improves spaced retention.", primaryMetric: "law.accuracy", metrics: ["law.recallRatio", "law.accuracy", "law.min"], durationDays: 30 },
    });

  // ── Goals ───────────────────────────────────────────────
  for (const g of ds.goals.filter((x) => x.status === "active")) {
    const st = goalStatus(ds, g);
    if (st.status !== "BEHIND") continue;
    drafts.push({
      ruleId: `goal.behind.${g.id}`,
      domain: g.domain,
      kind: "bottleneck",
      title: `Behind pace: ${g.title}`,
      facts: [
        `Progress ${f1(st.current)} / ${g.target} ${g.unit} (${f0(st.pct)}%), expected ${f1(st.expected)} by today (pace ${f0((st.pace ?? 0) * 100)}%).`,
        ...(st.requiredRate != null ? [`Required ${f1(st.requiredRate)} ${g.unit}/day vs current ${f1(st.rate30)} ${g.unit}/day (30D).`] : []),
      ],
      interpretation: "At the current rate the deadline will be missed unless the rate or the target changes.",
      action:
        st.requiredRate == null
          ? "Book the next mock test and put this week's practice into the weakest component it measures."
          : st.rate30 != null && st.requiredRate > st.rate30 * 1.5
            ? "Required rate is far above current: re-scope the target or deadline, or protect a daily block."
            : `Raise daily ${g.unit} toward ${f1(st.requiredRate)} for the next 14 days.`,
      evidence: { n: 30, window: "30D" },
      severity: (st.pace ?? 1) < 0.7 ? 5 : 4,
      confidence: "HIGH",
      trend: null,
      impact: 4,
      urgency: st.daysLeft != null && st.daysLeft < 60 ? 5 : 3,
      effort: 3,
      goalRelevance: Math.max(0.3, (g.weight / 5) * (TIER_FACTOR[g.tier] ?? 0.5)),
      metricKey: g.metricKey ?? undefined,
      direction: g.direction,
      todayAction: g.metricKey ? { label: `${g.title}: ${f1(st.requiredRate)} ${g.unit}`, domain: g.domain } : undefined,
    });
  }
  const gap = targetCapacityGap(ds, ds.settings.targets.productiveMin.target);
  if (gap.aboveEverSustained && gap.sustained30 != null)
    drafts.push({
      ruleId: "capacity.targetGap",
      domain: "RECOVERY",
      kind: "pattern",
      title: "Daily target above sustained capacity",
      facts: [`Target ${formatDuration(gap.target)}/day; highest sustained 30-day average ${formatDuration(gap.sustained30)}/day${gap.sustained90 != null ? `, 90-day ${formatDuration(gap.sustained90)}` : ""}.`],
      interpretation: "The target exceeds anything sustained so far; treat it as a stretch level, not the daily baseline.",
      action: "Set the daily target near the sustained level and raise it gradually (+10% per month) if execution holds.",
      evidence: { n: ds.days.length, window: "ALL" },
      severity: 2,
      confidence: "HIGH",
      trend: null,
      impact: 3,
      urgency: 2,
      effort: 1,
    });
  const sc = sustainabilityCheck(ds);
  if (sc.warning)
    drafts.push({
      ruleId: "sustainability.warning",
      domain: "RECOVERY",
      kind: "warning",
      title: "SUSTAINABILITY WARNING",
      facts: [`Work hours +${f0(sc.hoursChangePct)}% (14D vs prev 14D) while ${sc.signals.join(", ")}.`],
      interpretation: "Behavioural pattern: more hours with lower quality. This is not a medical assessment.",
      action: "Hold workload at the previous level for 7 days; protect sleep and recovery time.",
      evidence: { n: 28, window: "14D vs prev 14D" },
      severity: 4,
      confidence: "MEDIUM",
      trend: null,
      impact: 4,
      urgency: 4,
      effort: 1,
    });

  // ── Low value ───────────────────────────────────────────
  for (const lv of lowValueCandidates(ds).slice(0, 3))
    drafts.push({
      ruleId: `lowvalue.${lv.activity}`,
      domain: "PRODUCTIVITY",
      kind: "lowValue",
      title: `Possible low-value activity: ${lv.activity}`,
      facts: [`${f1(lv.hours30)}h in 30D — ${lv.note}.`],
      interpretation: "High time with little measurable improvement. Flagged for analysis, not for automatic removal.",
      action: "Decide: keep (with a reason), reduce, or test a replacement for 14 days.",
      evidence: { n: 30, window: "30D" },
      severity: 2,
      confidence: "LOW",
      trend: null,
      impact: 2,
      urgency: 1,
      effort: 2,
    });

  // ── Strengths ───────────────────────────────────────────
  const strengthKeys = ["law.accuracy", "deep.min", "exec.pct", "german.activeMin", "focus.avg", "phone.total", "law.questions", "german.err100"];
  const vs = strengthKeys
    .map((k) => ({ k, v: velocity(ds, k, 30) }))
    .filter((x) => x.v.improving && x.v.previous && x.v.velocity != null)
    .map((x) => ({ ...x, rel: Math.abs(x.v.velocity! / x.v.previous!) }))
    .sort((a, b) => b.rel - a.rel);
  for (const s of vs.slice(0, 2)) {
    const m = METRIC_MAP.get(s.k)!;
    drafts.push({
      ruleId: `strength.velocity.${s.k}`,
      domain: m.domain,
      kind: "strength",
      title: `Improving: ${m.label}`,
      facts: [`${m.label}: ${f1(s.v.previous)} → ${f1(s.v.current)} (30D vs previous 30D, ${f0(s.rel * 100)}% change).`],
      interpretation: "One of your fastest-improving metrics right now.",
      action: "Keep the current practice; avoid changing several parameters here at once.",
      evidence: { n: 60, window: "60D" },
      severity: 1,
      confidence: "MEDIUM",
      trend: "IMPROVING",
      impact: 2,
      urgency: 1,
      effort: 1,
      metricKey: s.k,
    });
  }
  const curve = retentionCurve(ds).filter((c) => c.accuracy != null);
  const bestArea = areaMap(ds)
    .filter((a) => a.retention != null && a.retentionN >= 30)
    .sort((a, b) => b.retention! - a.retention!)[0];
  if (bestArea)
    drafts.push({
      ruleId: "strength.retention",
      domain: "LAW",
      kind: "strength",
      title: `Highest retention: ${bestArea.area}`,
      facts: [`${bestArea.area} spaced retention ${f0(bestArea.retention)}% (n=${bestArea.retentionN}).${curve.length ? ` Overall curve: ${curve.map((c) => `${c.bucket} ${f0(c.accuracy)}%`).join(" · ")}` : ""}`],
      interpretation: "The review approach used here works; it can be transferred to weaker areas.",
      action: "Reuse the same review cadence for the weakest area.",
      evidence: { n: bestArea.retentionN, window: "90D" },
      severity: 1,
      confidence: confidenceFromN(bestArea.retentionN, 50, 200),
      trend: null,
      impact: 2,
      urgency: 1,
      effort: 1,
    });
  const bh = bestHours(ds);
  if (bh.bestBlock)
    drafts.push({
      ruleId: "strength.bestHours",
      domain: "ATTENTION",
      kind: "strength",
      title: `Best working hours ${String(bh.bestBlock.start).padStart(2, "0")}:00–${String(bh.bestBlock.end).padStart(2, "0")}:00`,
      facts: [`Highest composite of focus, completion and accuracy among ${bh.qualifying} qualifying hours (180D).`],
      interpretation: "Derived from your data — not from a chronotype questionnaire.",
      action: "Place the hardest work (speaking, cases, drafting) in this window.",
      evidence: { n: bh.qualifying, window: "180D" },
      severity: 1,
      confidence: bh.confidence,
      trend: null,
      impact: 3,
      urgency: 1,
      effort: 1,
    });
  return finalize(ds, drafts);
}

function finalize(ds: Dataset, drafts: Draft[]): Insight[] {
  return drafts
    .map((d, i) => {
      const goalRelevance = d.goalRelevance ?? goalAlignment(ds, d.domain, d.metricKey);
      const ins: Insight = { ...d, id: `${d.ruleId}#${i}`, goalRelevance, priority: 0 };
      ins.priority = d.kind === "strength" ? Math.round(priorityScore(ins) * 0.5) : priorityScore(ins);
      return ins;
    })
    .sort((a, b) => b.priority - a.priority);
}
