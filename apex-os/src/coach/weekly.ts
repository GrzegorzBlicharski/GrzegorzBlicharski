/** Weekly review (KEEP/INCREASE/REDUCE/STOP/START/TEST), one biggest lever, known/likely/unknown, how I work best. */
import type { Dataset } from "@/core/types";
import type { Confidence } from "@/core/stats";
import { relate, STANDARD_RELATIONS, type RelationResult } from "@/analytics/relations";
import { generateInsights, type Insight } from "./insights";
import { bestHours, sessionLengthProfile } from "@/modules/attention";
import { retentionCurve } from "@/modules/law";
import { sustainedCapacity } from "@/modules/recovery";
import { skillMix, monthlyErrorRates } from "@/modules/german";
import { sliceDays } from "@/metrics/series";
import { addDays } from "@/core/dates";
import { mean } from "@/core/stats";

export interface WeeklyReview {
  keep: string[];
  increase: string[];
  reduce: string[];
  stop: string[];
  start: string[];
  test: string[];
}

export function weeklyReview(ds: Dataset, insights: Insight[] = generateInsights(ds)): WeeklyReview {
  const r: WeeklyReview = { keep: [], increase: [], reduce: [], stop: [], start: [], test: [] };
  for (const i of insights) {
    if (i.kind === "strength") r.keep.push(`${i.title} — ${i.facts[0]}`);
    else if (i.kind === "lowValue") r.reduce.push(`${i.title} — review whether it earns its time`);
    else if (i.ruleId.startsWith("german.under") || i.ruleId.startsWith("goal.behind") || i.ruleId === "law.forgetting") r.increase.push(`${i.title}: ${i.action}`);
    else if (i.ruleId === "exec.planningReplacing" || i.ruleId === "german.passive") r.reduce.push(`${i.title}: ${i.action}`);
    else if (i.ruleId === "phone.overBudget" || i.ruleId === "phone.morning") r.stop.push(`${i.title}: ${i.action}`);
    else if (i.kind === "opportunity" || i.ruleId === "law.coverage") r.start.push(`${i.title}: ${i.action}`);
    else if (i.kind !== "pattern") r.increase.push(`${i.title}: ${i.action}`);
    if (i.experiment) r.test.push(`${i.experiment.title} — ${i.experiment.hypothesis}`);
  }
  for (const k of Object.keys(r) as (keyof WeeklyReview)[]) r[k] = [...new Set(r[k])].slice(0, 4);
  return r;
}

export interface Lever {
  observation: string;
  evidence: string[];
  hypothesis: string;
  action: string;
  expectedEffect: string;
  howToTest: string;
  confidence: Confidence;
  priority: number;
  insightId: string;
}

/** WHAT SINGLE CHANGE IS MOST LIKELY TO IMPROVE MY VERIFIED PROGRESS NEXT WEEK? */
export function biggestLever(ds: Dataset, insights: Insight[] = generateInsights(ds)): Lever | null {
  const i = insights.find((x) => x.kind !== "strength" && x.kind !== "pattern" && x.kind !== "lowValue");
  if (!i) return null;
  return {
    observation: i.title,
    evidence: i.facts,
    hypothesis: i.experiment?.hypothesis ?? `${i.interpretation} Addressing it should move ${i.metricKey ?? "the linked metric"} ${i.direction === "down" ? "down" : "up"}.`,
    action: i.action,
    expectedEffect: i.metricKey ? `${i.metricKey} ${i.direction === "down" ? "decreases" : "increases"} vs the previous 7 days, without lowering other core metrics.` : "Measurable change in the linked domain within 7–14 days.",
    howToTest: i.metricKey ? `Compare ${i.metricKey} next 7 days vs the previous 14 days (effect size + n); log as a recommendation to verify.` : "Track the action daily and review next week.",
    confidence: i.confidence,
    priority: i.priority,
    insightId: i.id,
  };
}

export interface KnowledgeState {
  known: string[];
  likely: string[];
  unknown: string[];
  testNext: string[];
  relations: RelationResult[];
}

export function knowledgeState(ds: Dataset, insights: Insight[] = generateInsights(ds)): KnowledgeState {
  const relations = STANDARD_RELATIONS.map((r) => relate(ds, r.x, r.y, { lag: r.lag, from: addDays(ds.asOf, -179) }));
  const out: KnowledgeState = { known: [], likely: [], unknown: [], testNext: [], relations };
  for (const r of relations) {
    if (r.strength === "insufficient") out.unknown.push(`${r.xKey} vs ${r.yKey}: not enough data (n=${r.n})`);
    else if (r.confidence === "HIGH") out.known.push(r.statement);
    else if (r.confidence === "MEDIUM") out.likely.push(r.statement);
    else out.unknown.push(r.statement);
  }
  for (const i of insights) {
    if (i.kind === "pattern") continue;
    const line = `${i.title}: ${i.facts[0]}`;
    if (i.confidence === "HIGH") out.known.push(line);
    else if (i.confidence === "MEDIUM") out.likely.push(line);
    if (i.experiment) out.testNext.push(`${i.experiment.title}: ${i.experiment.hypothesis}`);
  }
  for (const r of relations.filter((x) => x.confidence === "MEDIUM").slice(0, 2)) out.testNext.push(`Test causality: ${r.statement.split(" (")[0]}`);
  out.testNext = [...new Set(out.testNext)].slice(0, 5);
  return out;
}

export interface HowItem {
  label: string;
  finding: string | null;
  evidence: string;
  confidence: Confidence;
}

/** "How I work best" / "What tends not to work for me" — every point with evidence; otherwise insufficient data. */
export function howIWorkBest(ds: Dataset): { best: HowItem[]; notWorking: HowItem[] } {
  const best: HowItem[] = [];
  const notWorking: HowItem[] = [];
  const bh = bestHours(ds, 365);
  best.push({
    label: "Best working hours",
    finding: bh.bestBlock ? `${bh.bestBlock.start}:00–${bh.bestBlock.end}:00` : null,
    evidence: `${bh.qualifying} hours with ≥5 sessions & ≥300 min; composite of focus/completion/accuracy z-scores`,
    confidence: bh.bestBlock ? bh.confidence : "LOW",
  });
  const sl = sessionLengthProfile(ds, 365).filter((b) => b.n >= 10 && b.focus != null);
  const slBest = [...sl].sort((a, b) => (b.focus ?? 0) - (a.focus ?? 0))[0];
  const slWorst = [...sl].sort((a, b) => (a.focus ?? 0) - (b.focus ?? 0))[0];
  best.push({ label: "Best session length", finding: slBest ? `${slBest.bucket} min (focus ${slBest.focus!.toFixed(2)})` : null, evidence: sl.map((b) => `${b.bucket}: ${b.focus?.toFixed(2)} (n=${b.n})`).join(" · ") || "—", confidence: sl.length >= 3 ? "MEDIUM" : "LOW" });
  if (slWorst && slBest && slWorst !== slBest && (slBest.focus ?? 0) - (slWorst.focus ?? 0) >= 0.3)
    notWorking.push({ label: "Session length", finding: `${slWorst.bucket} min sessions have the lowest focus (${slWorst.focus!.toFixed(2)})`, evidence: `n=${slWorst.n}`, confidence: "MEDIUM" });
  const rc = retentionCurve(ds).filter((c) => c.accuracy != null);
  const goodInterval = [...rc].reverse().find((c) => (c.accuracy ?? 0) >= 80);
  best.push({ label: "Best review intervals", finding: goodInterval ? `Retention stays ≥ 80% up to ${goodInterval.bucket} gaps` : null, evidence: rc.map((c) => `${c.bucket}: ${c.accuracy!.toFixed(0)}% (n=${c.n})`).join(" · ") || "—", confidence: rc.length >= 3 ? "MEDIUM" : "LOW" });
  // Phone threshold: deep work by phone bucket
  const days = sliceDays(ds, addDays(ds.asOf, -364), ds.asOf).filter((d) => d.phone && d.tracked);
  const buckets: [string, number, number][] = [
    ["≤30", 0, 30],
    ["31–60", 30.01, 60],
    ["61–90", 60.01, 90],
    ["91–150", 90.01, 150],
    [">150", 150.01, 1e9],
  ];
  const pb = buckets
    .map(([l, lo, hi]) => {
      const ds2 = days.filter((d) => d.phone!.total >= lo && d.phone!.total <= hi);
      return { l, n: ds2.length, deep: mean(ds2.map((d) => d.deepMin)) };
    })
    .filter((b) => b.n >= 7);
  let threshold: string | null = null;
  for (let i = 0; i + 1 < pb.length; i++) {
    if (pb[i].deep != null && pb[i + 1].deep != null && pb[i].deep! - pb[i + 1].deep! >= 20) {
      threshold = pb[i].l;
      break;
    }
  }
  best.push({ label: "Phone threshold", finding: threshold ? `Deep work drops noticeably once phone time exceeds the ${threshold} min/day bucket` : null, evidence: pb.map((b) => `${b.l}: ${b.deep?.toFixed(0)} min deep (n=${b.n})`).join(" · ") || "—", confidence: pb.length >= 3 ? "MEDIUM" : "LOW" });
  if (threshold) notWorking.push({ label: "Phone", finding: `Days beyond the ${threshold} min phone bucket have less deep work`, evidence: "association across bucketed days", confidence: "MEDIUM" });
  const cap = sustainedCapacity(ds);
  best.push({ label: "Sustainable weekly load", finding: cap.w90 ? `${((cap.w90.value * 7) / 60).toFixed(1)} h/week (best 90-day average)` : null, evidence: cap.w90 ? `90-day window ending ${cap.w90.end}` : "needs 90 days", confidence: cap.w90 ? "HIGH" : "LOW" });
  // Planning accuracy by plan size
  const planned = ds.days.filter((d) => d.plan && d.plan.planned > 0);
  const pbk = [
    [0, 240],
    [240, 360],
    [360, 480],
    [480, 2000],
  ].map(([lo, hi]) => {
    const xs = planned.filter((d) => d.plan!.planned >= lo && d.plan!.planned < hi);
    const p = xs.reduce((a, d) => a + d.plan!.planned, 0);
    return { label: `${lo / 60}–${hi >= 2000 ? "+" : hi / 60}h`, n: xs.length, exec: p > 0 ? (xs.reduce((a, d) => a + d.total, 0) / p) * 100 : null };
  }).filter((b) => b.n >= 7);
  const bestPlan = [...pbk].sort((a, b) => Math.abs(100 - (a.exec ?? 0)) - Math.abs(100 - (b.exec ?? 0)))[0];
  best.push({ label: "Best planning accuracy", finding: bestPlan ? `Plans of ${bestPlan.label} are executed at ${bestPlan.exec!.toFixed(0)}%` : null, evidence: pbk.map((b) => `${b.label}: ${b.exec?.toFixed(0)}% (n=${b.n})`).join(" · ") || "—", confidence: pbk.length >= 2 ? "MEDIUM" : "LOW" });
  const worstPlan = [...pbk].sort((a, b) => (a.exec ?? 0) - (b.exec ?? 0))[0];
  if (worstPlan && (worstPlan.exec ?? 100) < 75) notWorking.push({ label: "Planning", finding: `Plans of ${worstPlan.label} reach only ${worstPlan.exec!.toFixed(0)}% execution`, evidence: `n=${worstPlan.n}`, confidence: "MEDIUM" });
  const mix = skillMix(ds, 180);
  const rates = monthlyErrorRates(ds).filter((r) => r.err100 != null);
  best.push({
    label: "Best German mix",
    finding: rates.length >= 6 ? `Current 180D mix: ${mix.skills.slice(0, 4).map((s) => `${s.skill} ${(s.share * 100).toFixed(0)}%`).join(", ")}` : null,
    evidence: rates.length >= 6 ? `${rates.length} months of evaluated writing; causal mix effects require an experiment` : "needs ≥ 6 months of evaluated output",
    confidence: "LOW",
  });
  return { best, notWorking };
}
