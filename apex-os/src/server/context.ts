/** Request-side context: dataset + insights memoised per (last event id, as-of day). Any write invalidates. */
import { getDb } from "@/data/db";
import { buildDataset } from "@/data/facts";
import { lastEventId } from "@/data/store";
import type { Dataset } from "@/core/types";
import { generateInsights, type Insight } from "@/coach/insights";
import { todayLogical, type Day } from "@/core/dates";
import { settingsResolver } from "@/core/settings";

interface Cached {
  key: string;
  ds: Dataset;
  insights: Insight[] | null;
}

let cache: Cached | null = null;

export function currentDay(): Day {
  const db = getDb();
  const rows = db.prepare("SELECT id, effective_from, recorded_at, patch FROM settings_versions ORDER BY id").all<{ id: number; effective_from: string; recorded_at: string; patch: string }>();
  const resolve = settingsResolver(rows.map((r) => ({ id: r.id, effectiveFrom: r.effective_from, recordedAt: r.recorded_at, patch: JSON.parse(r.patch) })));
  return todayLogical(resolve("9999-12-31").dayStartHour);
}

export function getDataset(asOf?: Day): Dataset {
  const db = getDb();
  const day = asOf ?? currentDay();
  const key = `${lastEventId(db)}|${day}`;
  if (cache?.key === key) return cache.ds;
  const ds = buildDataset(db, day);
  cache = { key, ds, insights: null };
  return ds;
}

export function getAnalysis(asOf?: Day): { ds: Dataset; insights: Insight[] } {
  const ds = getDataset(asOf);
  if (!cache || cache.ds !== ds) return { ds, insights: generateInsights(ds) };
  if (!cache.insights) cache.insights = generateInsights(ds);
  return { ds, insights: cache.insights };
}
