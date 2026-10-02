import { getDb } from "@/data/db";

export interface ActiveTimer {
  id: string;
  domain: string;
  activity: string;
  area: string | null;
  title: string | null;
  start: string;
  pausedMinutes: number;
  pausedAt: string | null;
  plannedStart: string | null;
}

export function activeTimer(): ActiveTimer | null {
  const r = getDb()
    .prepare("SELECT id, domain, activity, area, title, start, paused_minutes, paused_at, planned_start FROM sessions WHERE status IN ('running','paused') ORDER BY start DESC LIMIT 1")
    .get<Record<string, string | number | null>>();
  if (!r) return null;
  return {
    id: r.id as string,
    domain: r.domain as string,
    activity: r.activity as string,
    area: (r.area as string | null) ?? null,
    title: (r.title as string | null) ?? null,
    start: r.start as string,
    pausedMinutes: (r.paused_minutes as number) ?? 0,
    pausedAt: (r.paused_at as string | null) ?? null,
    plannedStart: (r.planned_start as string | null) ?? null,
  };
}
