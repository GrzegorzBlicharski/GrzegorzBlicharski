/** Today view model: < 10-second status. Max 3 priorities. */
import { addDays, type Day } from "@/core/dates";
import type { Dataset } from "@/core/types";
import { rangeAgg, windowAgg, ctxOf } from "@/metrics/series";
import { phoneToday, budgetAlerts } from "@/modules/digital";
import { planVsActualToday } from "@/modules/execution";
import { minimumDay, streaks, maturity } from "@/modules/consistency";
import { sustainabilityCheck, sustainedCapacity } from "@/modules/recovery";
import { goalStatus, type PaceStatus } from "@/forecasting/goals";
import { generateInsights, type Insight } from "./insights";
import { dueTopics } from "@/modules/law";

export interface Momentum {
  label: string;
  key: string;
  last7: number | null;
  prev28: number | null;
  direction: "up" | "flat" | "down" | "n/a";
}

export interface TodayPriority {
  rank: number;
  label: string;
  domain: string;
  minutes?: number;
  reason: string;
  priority: number;
}

export interface TodayView {
  day: Day;
  german: { value: number; target: number; floor: number; stretch: number };
  law: { value: number; target: number; questions: number; qTarget: number };
  deep: { value: number; target: number };
  phone: ReturnType<typeof phoneToday>;
  execution: ReturnType<typeof planVsActualToday>;
  streak: ReturnType<typeof streaks>;
  minimumDay: ReturnType<typeof minimumDay>;
  goalPace: { status: PaceStatus | "—"; detail: string };
  bottleneck: Insight | null;
  topWeakness: Insight | null;
  mostImportantAction: Insight | null;
  priorities: TodayPriority[];
  sustainability: { warning: boolean; text: string };
  momentum: Momentum[];
  alerts: ReturnType<typeof budgetAlerts>;
  maturity: ReturnType<typeof maturity>;
  insights: Insight[];
  reviewDue: number;
}

function momentum(ds: Dataset, label: string, key: string, higherIsBetter = true): Momentum {
  const ctx = ctxOf(ds);
  const last7 = rangeAgg(ds, key, addDays(ds.asOf, -6), ds.asOf, ctx).value;
  const prev28 = rangeAgg(ds, key, addDays(ds.asOf, -34), addDays(ds.asOf, -7), ctx).value;
  let direction: Momentum["direction"] = "n/a";
  if (last7 != null && prev28 != null) {
    const rel = prev28 !== 0 ? (last7 - prev28) / Math.abs(prev28) : last7 > 0 ? 1 : 0;
    const oriented = higherIsBetter ? rel : -rel;
    direction = oriented > 0.08 ? "up" : oriented < -0.08 ? "down" : "flat";
  }
  return { label, key, last7, prev28, direction };
}

export function todayView(ds: Dataset, insights: Insight[] = generateInsights(ds)): TodayView {
  const t = ds.settings.targets;
  const d = ds.days.find((x) => x.day === ds.asOf);
  const md = minimumDay(ds);
  // Goal pace: worst status across PRIMARY goals with deadlines.
  const primary = ds.goals.filter((g) => g.status === "active" && g.tier === "PRIMARY");
  const statuses = primary.map((g) => ({ g, s: goalStatus(ds, g) }));
  const order: PaceStatus[] = ["BEHIND", "ON TRACK", "AHEAD", "ACHIEVED", "NO DEADLINE", "NO DATA"];
  statuses.sort((a, b) => order.indexOf(a.s.status) - order.indexOf(b.s.status));
  const goalPace = statuses.length
    ? { status: statuses[0].s.status, detail: statuses.map((x) => `${x.g.title}: ${x.s.status}`).join(" · ") }
    : { status: "—" as const, detail: "No primary goals defined" };
  const actionable = insights.filter((i) => i.kind !== "strength" && i.kind !== "pattern");
  const bottleneck = insights.find((i) => i.kind === "bottleneck") ?? actionable.find((i) => i.kind === "warning") ?? null;
  const topWeakness = insights.find((i) => i.kind === "weakness") ?? null;
  // Top-3: daily-actionable steps ranked by priority, one per domain.
  const priorities: TodayPriority[] = [];
  const seen = new Set<string>();
  for (const i of actionable) {
    if (!i.todayAction || seen.has(i.todayAction.domain)) continue;
    seen.add(i.todayAction.domain);
    priorities.push({ rank: priorities.length + 1, label: i.todayAction.label, domain: i.todayAction.domain, minutes: i.todayAction.minutes, reason: i.title, priority: i.priority });
    if (priorities.length === 3) break;
  }
  // Fill with goal-target gaps (primary goals) if fewer than 3.
  if (priorities.length < 3) {
    const gaps = [
      { domain: "GERMAN", label: "German active practice", gap: t.germanMin.target - (d?.german.min ?? 0), minutes: Math.max(0, t.germanMin.target - (d?.german.min ?? 0)) },
      { domain: "LAW", label: `Law questions (${Math.max(0, t.lawQuestions.target - (d?.law.questions ?? 0))} left)`, gap: t.lawMin.target - (d?.law.min ?? 0), minutes: Math.max(0, t.lawMin.target - (d?.law.min ?? 0)) },
      { domain: "DEEP WORK", label: "Protected deep block", gap: t.deepMin.target - (d?.deepMin ?? 0), minutes: 75 },
    ].filter((g) => g.gap > 0 && !seen.has(g.domain));
    for (const g of gaps) {
      if (priorities.length >= 3) break;
      seen.add(g.domain);
      priorities.push({ rank: priorities.length + 1, label: g.label, domain: g.domain, minutes: Math.round(g.minutes), reason: "Remaining to today's target", priority: 0 });
    }
  }
  const sc = sustainabilityCheck(ds);
  const cap = sustainedCapacity(ds);
  const sustainability = sc.warning
    ? { warning: true, text: `SUSTAINABILITY WARNING — hours +${sc.hoursChangePct?.toFixed(0)}% with ${sc.signals.join(", ")}` }
    : {
        warning: false,
        text:
          cap.current30 != null && cap.w90
            ? `30D load ${Math.round(cap.current30)} min/day vs sustained 90D max ${Math.round(cap.w90.value)} min/day${d?.recovery?.sleepH ? ` · sleep ${d.recovery.sleepH}h` : ""}`
            : "Not enough history for capacity comparison",
      };
  return {
    day: ds.asOf,
    german: { value: d?.german.min ?? 0, target: t.germanMin.target, floor: t.germanMin.floor, stretch: t.germanMin.stretch },
    law: { value: d?.law.min ?? 0, target: t.lawMin.target, questions: d?.law.questions ?? 0, qTarget: t.lawQuestions.target },
    deep: { value: d?.deepMin ?? 0, target: t.deepMin.target },
    phone: phoneToday(ds),
    execution: planVsActualToday(ds),
    streak: streaks(ds, md.items),
    minimumDay: md,
    goalPace,
    bottleneck,
    topWeakness,
    mostImportantAction: actionable[0] ?? null,
    priorities,
    sustainability,
    momentum: [momentum(ds, "German", "german.activeMin"), momentum(ds, "Law", "law.questions"), momentum(ds, "Execution", "exec.pct")],
    alerts: budgetAlerts(ds),
    maturity: maturity(ds),
    insights,
    reviewDue: dueTopics(ds).length,
  };
}

/** Week-to-date helper for the weekly/morning briefs. */
export function weekToDate(ds: Dataset, key: string) {
  return windowAgg(ds, key, "7D");
}
