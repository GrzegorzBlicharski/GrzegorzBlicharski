/** Digital hygiene: phone budget, compliance, windows, distraction cost, reclaimed time. */
import { addDays, diffMinutes, dtToMs, hmToMinutes, minuteOfDay, type Day } from "@/core/dates";
import type { Dataset, DayFacts } from "@/core/types";
import { ctxOf, rangeAgg, sliceDays, windowAgg, windowRange } from "@/metrics/series";
import { confidenceFromN, type Confidence } from "@/core/stats";

export interface PhoneToday {
  day: Day;
  hasData: boolean;
  total: number;
  limit: number;
  remaining: number;
  overBy: number;
  productive: number;
  unproductive: number;
  byCategory: Record<string, number>;
  pickups: number | null;
  first: string | null;
  last: string | null;
  longest: number | null;
  avgSession: number | null;
  morning: number | null;
  evening: number | null;
}

export function phoneToday(ds: Dataset, day: Day = ds.asOf): PhoneToday {
  const d = ds.days.find((x) => x.day === day);
  const limit = ds.settingsAt(day).phoneLimitMin;
  const p = d?.phone;
  const total = p?.total ?? 0;
  return {
    day,
    hasData: !!p,
    total,
    limit,
    remaining: Math.max(0, limit - total),
    overBy: Math.max(0, total - limit),
    productive: p?.productive ?? 0,
    unproductive: p?.unproductive ?? 0,
    byCategory: p?.byCategory ?? {},
    pickups: p?.pickups ?? null,
    first: p?.first ?? null,
    last: p?.last ?? null,
    longest: p?.longest ?? null,
    avgSession: p && p.sessions > 0 ? Math.round((total / p.sessions) * 10) / 10 : null,
    morning: p?.morning ?? null,
    evening: p?.evening ?? null,
  };
}

export interface ComplianceSummary {
  window: number;
  dataDays: number;
  under: number;
  over: number;
  pct: number | null;
  avg: number | null;
  cumulativeOverage: number;
}

export function phoneCompliance(ds: Dataset, windowDays: number, endDay: Day = ds.asOf): ComplianceSummary {
  const days = sliceDays(ds, addDays(endDay, -(windowDays - 1)), endDay).filter((d) => d.phone);
  let under = 0;
  let over = 0;
  let sum = 0;
  let overage = 0;
  for (const d of days) {
    const lim = ds.settingsAt(d.day).phoneLimitMin;
    sum += d.phone!.total;
    if (d.phone!.total <= lim) under++;
    else {
      over++;
      overage += d.phone!.total - lim;
    }
  }
  return {
    window: windowDays,
    dataDays: days.length,
    under,
    over,
    pct: days.length ? (under / days.length) * 100 : null,
    avg: days.length ? sum / days.length : null,
    cumulativeOverage: overage,
  };
}

export interface WindowCompliance {
  id: string;
  label: string;
  trackedDays: number;
  cleanDays: number;
  pct: number | null;
  avgViolationMin: number | null;
}

/** No-phone window compliance over days that have timed phone data. */
export function noPhoneCompliance(ds: Dataset, windowDays = 30): WindowCompliance[] {
  const days = sliceDays(ds, addDays(ds.asOf, -(windowDays - 1)), ds.asOf).filter((d) => d.phone?.timed);
  return ds.settings.noPhoneWindows
    .filter((w) => w.enabled)
    .map((w) => {
      const relevant = w.kind === "afterWake" ? days.filter((d) => d.checkin?.wake) : w.kind === "deepWork" ? days.filter((d) => d.deepMin > 0) : days;
      const viol = relevant.map((d) => d.phone!.violations[w.id] ?? 0);
      const clean = viol.filter((v) => v < 1).length;
      return {
        id: w.id,
        label: w.label,
        trackedDays: relevant.length,
        cleanDays: clean,
        pct: relevant.length ? (clean / relevant.length) * 100 : null,
        avgViolationMin: relevant.length ? viol.reduce((a, b) => a + b, 0) / relevant.length : null,
      };
    });
}

export interface DistractionEvent {
  sessionId: string;
  day: Day;
  plannedStart: string;
  actualStart: string;
  delay: number;
  phoneMinutes: number;
  categories: string[];
}

/**
 * Possible distraction-related start delays: sessions with planned start and delay > 5 min where timed
 * non-productive phone use overlaps [plannedStart − 10 min, actualStart]. No causality is claimed.
 */
export function distractionCost(ds: Dataset, windowDays = 30): { events: DistractionEvent[]; totalDelay: number; checked: number } {
  const from = addDays(ds.asOf, -(windowDays - 1));
  const phoneByDay = new Map<string, typeof ds.phoneTimed>();
  for (const p of ds.phoneTimed) {
    if (p.productive || p.day < addDays(from, -1)) continue;
    const arr = phoneByDay.get(p.day) ?? [];
    arr.push(p);
    phoneByDay.set(p.day, arr);
  }
  const events: DistractionEvent[] = [];
  let checked = 0;
  for (const s of ds.sessions) {
    if (s.day < from || !s.plannedStart || s.startDelay == null) continue;
    checked++;
    if (s.startDelay <= 5) continue;
    const a = dtToMs(s.plannedStart) - 10 * 60_000;
    const b = dtToMs(s.start);
    let overlap = 0;
    const cats = new Set<string>();
    for (const p of phoneByDay.get(s.day) ?? []) {
      const o = Math.max(0, Math.min(b, dtToMs(p.end)) - Math.max(a, dtToMs(p.start))) / 60_000;
      if (o > 0) {
        overlap += o;
        cats.add(p.category);
      }
    }
    if (overlap >= 1)
      events.push({
        sessionId: s.id,
        day: s.day,
        plannedStart: s.plannedStart,
        actualStart: s.start,
        delay: Math.round(diffMinutes(s.plannedStart, s.start)),
        phoneMinutes: Math.round(overlap),
        categories: [...cats],
      });
  }
  return { events: events.reverse(), totalDelay: events.reduce((a, e) => a + e.delay, 0), checked };
}

export interface ReclaimedTime {
  baselineFrom: Day | null;
  baselineTo: Day | null;
  baselinePerDay: number | null;
  currentPerDay: number | null;
  reclaimedPerDay: number | null;
  reclaimedPerMonthH: number | null;
  productiveBaseline: number | null;
  productiveCurrent: number | null;
  productiveDelta: number | null;
  conversionPct: number | null;
  baselineN: number;
  currentN: number;
  confidence: Confidence;
}

/** Pure arithmetic: baseline phone/day − current 30D phone/day; plus co-occurring change in productive time. */
export function reclaimedTime(ds: Dataset): ReclaimedTime {
  const phoneDays = ds.days.filter((d) => d.phone);
  let from: Day | null = null;
  let to: Day | null = null;
  if (ds.settings.phoneBaseline) {
    from = ds.settings.phoneBaseline.from;
    to = ds.settings.phoneBaseline.to;
  } else if (phoneDays.length) {
    from = phoneDays[0].day;
    to = addDays(from, 29);
  }
  const ctx = ctxOf(ds);
  const empty: ReclaimedTime = {
    baselineFrom: from,
    baselineTo: to,
    baselinePerDay: null,
    currentPerDay: null,
    reclaimedPerDay: null,
    reclaimedPerMonthH: null,
    productiveBaseline: null,
    productiveCurrent: null,
    productiveDelta: null,
    conversionPct: null,
    baselineN: 0,
    currentN: 0,
    confidence: "LOW",
  };
  if (!from || !to) return empty;
  const curRange = windowRange(ds, "30D");
  if (curRange.from <= to) return { ...empty, baselinePerDay: rangeAgg(ds, "phone.total", from, to, ctx).value };
  const base = rangeAgg(ds, "phone.total", from, to, ctx);
  const cur = windowAgg(ds, "phone.total", "30D");
  const pBase = rangeAgg(ds, "productive.min", from, to, ctx);
  const pCur = windowAgg(ds, "productive.min", "30D");
  const reclaimed = base.value != null && cur.value != null ? Math.max(0, base.value - cur.value) : null;
  const pDelta = pBase.value != null && pCur.value != null ? pCur.value - pBase.value : null;
  return {
    baselineFrom: from,
    baselineTo: to,
    baselinePerDay: base.value,
    currentPerDay: cur.value,
    reclaimedPerDay: reclaimed,
    reclaimedPerMonthH: reclaimed != null ? (reclaimed * 30) / 60 : null,
    productiveBaseline: pBase.value,
    productiveCurrent: pCur.value,
    productiveDelta: pDelta,
    conversionPct: reclaimed && reclaimed > 5 && pDelta != null ? Math.max(0, Math.min(100, (pDelta / reclaimed) * 100)) : null,
    baselineN: base.n,
    currentN: cur.n,
    confidence: confidenceFromN(Math.min(base.n, cur.n), 14, 28),
  };
}

export interface BudgetAlert {
  id: string;
  message: string;
  severity: "info" | "warn" | "risk";
}

/** Rule-based budget alerts for the current day. */
export function budgetAlerts(ds: Dataset, nowHm?: string): BudgetAlert[] {
  const t = phoneToday(ds);
  const out: BudgetAlert[] = [];
  if (!t.hasData) return out;
  const now = nowHm ? hmToMinutes(nowHm) : null;
  if (t.total > t.limit) out.push({ id: "over", message: `Phone budget exceeded by ${Math.round(t.overBy)} min today.`, severity: "risk" });
  else if (t.total >= t.limit * 0.75 && (now == null || now < hmToMinutes("15:00")))
    out.push({ id: "early-burn", message: `${Math.round(t.total)} of ${t.limit} min used before 15:00 — ${Math.round(t.remaining)} min left for the rest of the day.`, severity: "warn" });
  const b = ds.settings.budgets;
  const d = ds.days.find((x) => x.day === ds.asOf);
  if (b.distraction != null && d?.phone && d.phone.unproductive > b.distraction)
    out.push({ id: "distraction", message: `Distraction budget: ${Math.round(d.phone.unproductive)} / ${b.distraction} min non-productive phone.`, severity: "warn" });
  if (b.passiveLearning != null && d && d.german.passive + d.law.readingMin > b.passiveLearning)
    out.push({
      id: "passive",
      message: `Passive learning budget: ${Math.round(d.german.passive + d.law.readingMin)} / ${b.passiveLearning} min.`,
      severity: "info",
    });
  return out;
}

/** Morning discipline: share of days (with timed data) with < 5 min phone before morningEnd. */
export function morningDiscipline(ds: Dataset, windowDays = 30): { pct: number | null; n: number } {
  const days = sliceDays(ds, addDays(ds.asOf, -(windowDays - 1)), ds.asOf).filter((d) => d.phone?.morning != null);
  if (!days.length) return { pct: null, n: 0 };
  return { pct: (days.filter((d) => (d.phone!.morning ?? 0) < 5).length / days.length) * 100, n: days.length };
}

/** Hour-of-day distribution of timed phone use (minutes per hour) over a window. */
export function phoneByHour(ds: Dataset, windowDays = 30): number[] {
  const from = addDays(ds.asOf, -(windowDays - 1));
  const hours = new Array(24).fill(0);
  for (const p of ds.phoneTimed) {
    if (p.day < from || p.productive) continue;
    let s = minuteOfDay(p.start);
    const e = s + p.minutes;
    while (s < e) {
      const h = Math.floor(s / 60) % 24;
      const next = Math.min(e, (Math.floor(s / 60) + 1) * 60);
      hours[h] += next - s;
      s = next;
    }
  }
  const nDays = new Set(ds.phoneTimed.filter((p) => p.day >= from).map((p) => p.day)).size || 1;
  return hours.map((m) => m / nDays);
}

export function phoneDays(ds: Dataset, windowDays = 90): DayFacts[] {
  return sliceDays(ds, addDays(ds.asOf, -(windowDays - 1)), ds.asOf);
}
