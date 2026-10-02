/**
 * Adaptive planner. Optimises the user's real day, not an ideal one:
 * capacity = min(available × historical execution, sustained30 × 1.1); high-capacity ≤ sustained7 × 1.15 and ≤ 9h.
 * Never schedules sleep reduction; the plan is advice.
 */
import { addDays, hmToMinutes, isoWeekday, minutesToHm, type Day } from "@/core/dates";
import type { Dataset } from "@/core/types";
import { median } from "@/core/stats";
import { windowAgg } from "@/metrics/series";
import { sustainedCapacity } from "@/modules/recovery";
import { planRealism } from "@/modules/execution";
import { bestHours } from "@/modules/attention";
import { dueTopics } from "@/modules/law";
import { skillMix } from "@/modules/german";
import { minimumDay } from "@/modules/consistency";
import { goalStatus } from "@/forecasting/goals";
import { METRIC_MAP } from "@/metrics/series";
import { CORE_DOMAINS, type SessionDomain } from "@/domains/catalog";

export type PlanMode = "minimum" | "normal" | "high";

export interface PlanBlock {
  domain: string;
  activity: string;
  area?: string;
  label: string;
  minutes: number;
  start: string | null; // HH:mm
  reason: string;
  hard: boolean;
}

export interface DayPlan {
  day: Day;
  mode: PlanMode;
  availableMinutes: number;
  capacity: number;
  totalMinutes: number;
  executionRatio: number;
  blocks: PlanBlock[];
  realism: ReturnType<typeof planRealism>;
  notes: string[];
}

const TIER_FACTOR: Record<string, number> = { PRIMARY: 1, SECONDARY: 0.7, MAINTENANCE: 0.4 };
const MAX_HIGH = 9 * 60;

export function typicalAvailable(ds: Dataset, day: Day): number {
  const wd = isoWeekday(day);
  const same = ds.days.slice(-84).filter((d) => isoWeekday(d.day) === wd && d.total > 0);
  const m = median(same.map((d) => d.plan?.available ?? d.total));
  return m != null ? Math.round(m / 15) * 15 : ds.settings.targets.productiveMin.target;
}

export function buildPlan(ds: Dataset, opts: { day?: Day; availableMinutes?: number; energy?: number | null; mode?: PlanMode; startAt?: string } = {}): DayPlan {
  const day = opts.day ?? ds.asOf;
  const mode = opts.mode ?? "normal";
  const notes: string[] = [];
  const checkin = ds.days.find((d) => d.day === day)?.checkin;
  const available = opts.availableMinutes ?? checkin?.available ?? typicalAvailable(ds, day);
  const energy = opts.energy ?? checkin?.energy ?? null;
  const exec = windowAgg(ds, "exec.pct", "30D");
  const ratio = exec.value != null && exec.n >= 7 ? Math.min(1, exec.value / 100) : 0.85;
  const cap = sustainedCapacity(ds);
  let capacity = available * ratio;
  if (cap.w30) {
    const ceiling = cap.w30.value * 1.1;
    if (capacity > ceiling) {
      notes.push(`Capped at ${Math.round(ceiling)} min — 110% of your highest sustained 30-day average.`);
      capacity = ceiling;
    }
  }
  if (mode === "high") {
    const hc = Math.min(MAX_HIGH, cap.w7 ? cap.w7.value * 1.15 : available, available);
    capacity = Math.max(capacity, hc);
    notes.push(`High-capacity day: ≤ ${Math.round(hc)} min (115% of best sustained week, max 9h). Not a reason to cut sleep.`);
  }
  if (energy != null && energy <= 2 && mode !== "minimum") {
    capacity *= 0.8;
    notes.push("Low energy: capacity −20%, easier blocks first, minimum day protected.");
  }

  const blocks: PlanBlock[] = [];
  if (mode === "minimum") {
    const md = minimumDay(ds);
    for (const it of md.items) {
      const m = METRIC_MAP.get(it.metricKey);
      const domain = it.metricKey.startsWith("german") ? "GERMAN" : it.metricKey.startsWith("law") ? "LAW" : "LEARNING";
      blocks.push({
        domain,
        activity: it.metricKey === "law.questions" ? "questions" : it.metricKey.includes("speaking") ? "speaking" : "review",
        label: `${m?.label ?? it.metricKey} ≥ ${it.min}${m?.unit === "min" ? " min" : ""}`,
        minutes: m?.unit === "min" ? it.min : Math.max(15, Math.round(it.min * 1.2)),
        start: null,
        reason: `Minimum day (${md.source})`,
        hard: false,
      });
    }
    if (!blocks.length) blocks.push({ domain: "LEARNING", activity: "review", label: "15 min critical review", minutes: 15, start: null, reason: "Default minimum day", hard: false });
    capacity = blocks.reduce((a, b) => a + b.minutes, 0);
  } else {
    // 1) reserve spaced review for at-risk topics
    const due = dueTopics(ds);
    const atRisk = due.filter((d) => d.risk === "at-risk");
    let remaining = capacity;
    if (due.length) {
      const rv = Math.min(Math.round(capacity * 0.2), Math.max(15, Math.min(60, atRisk.length * 2 + 10)));
      const areas = [...new Set(due.slice(0, 12).map((d) => d.area))].slice(0, 3);
      blocks.push({ domain: "LAW", activity: "review", label: `Spaced review: ${areas.join(", ")}`, minutes: rv, start: null, reason: `${due.length} topics due (${atRisk.length} at risk)`, hard: false });
      remaining -= rv;
    }
    // 2) allocate across active goals by weight × tier × (1 + deficit)
    const goals = ds.goals.filter((g) => g.status === "active" && g.tier !== "MAINTENANCE" && CORE_DOMAINS.includes(g.domain as SessionDomain));
    const weights = new Map<string, { w: number; reason: string }>();
    for (const g of goals) {
      const st = goalStatus(ds, g);
      const deficit = st.pace != null ? Math.max(0, Math.min(1, 1 - st.pace)) : 0;
      const w = g.weight * (TIER_FACTOR[g.tier] ?? 0.5) * (1 + deficit);
      const prev = weights.get(g.domain);
      const reason = `${g.title}${st.status === "BEHIND" ? " (behind pace)" : ""}`;
      weights.set(g.domain, { w: (prev?.w ?? 0) + w, reason: prev ? `${prev.reason}; ${reason}` : reason });
    }
    if (!weights.size) {
      weights.set("GERMAN", { w: 1, reason: "Default split (no goals defined)" });
      weights.set("LAW", { w: 1, reason: "Default split (no goals defined)" });
    }
    const wsum = [...weights.values()].reduce((a, b) => a + b.w, 0);
    const mix = skillMix(ds, 30);
    const underSkills = mix.skills.filter((s) => s.flag === "under").map((s) => s.skill);
    for (const [domain, { w, reason }] of [...weights.entries()].sort((a, b) => b[1].w - a[1].w)) {
      let mins = Math.round(((remaining * w) / wsum) / 5) * 5;
      if (mins < 20) continue;
      // split into blocks of ≤ 90 min
      let part = 0;
      while (mins > 0) {
        const len = Math.min(90, mins);
        let activity = "questions";
        let label = `${domain[0]}${domain.slice(1).toLowerCase()} deep block`;
        if (domain === "GERMAN") {
          const skill = underSkills[part % Math.max(1, underSkills.length)] ?? (part === 0 ? "Speaking" : "Writing");
          activity = skill.toLowerCase().includes("speak") ? "speaking" : skill.toLowerCase().includes("writ") ? "writing" : "grammar";
          label = `German · ${skill}`;
        } else if (domain === "LAW") {
          activity = part === 0 ? "cases" : "questions";
          label = part === 0 ? "Law · cases / drafting" : "Law · question set";
        }
        blocks.push({ domain, activity, label, minutes: len, start: null, reason, hard: part === 0 });
        mins -= len;
        part++;
      }
    }
  }

  // 3) place hard blocks into best hours (or after wake), easier first on low energy
  const bh = bestHours(ds);
  const startBase = opts.startAt ?? (bh.bestBlock ? `${String(bh.bestBlock.start).padStart(2, "0")}:00` : checkin?.wake ? minutesToHm(hmToMinutes(checkin.wake) + 60) : "08:00");
  const ordered = energy != null && energy <= 2 ? [...blocks].sort((a, b) => Number(a.hard) - Number(b.hard)) : [...blocks].sort((a, b) => Number(b.hard) - Number(a.hard));
  let t = hmToMinutes(startBase);
  for (const b of ordered) {
    b.start = minutesToHm(t);
    t += b.minutes + 15;
  }
  if (bh.bestBlock && mode !== "minimum") notes.push(`Hard blocks start in your best hours (${bh.bestBlock.start}:00–${bh.bestBlock.end}:00, ${bh.confidence} confidence).`);
  const total = ordered.reduce((a, b) => a + b.minutes, 0);
  return {
    day,
    mode,
    availableMinutes: available,
    capacity: Math.round(capacity),
    totalMinutes: total,
    executionRatio: ratio,
    blocks: ordered,
    realism: planRealism(ds, total),
    notes,
  };
}

export function tomorrow(ds: Dataset): Day {
  return addDays(ds.asOf, 1);
}
