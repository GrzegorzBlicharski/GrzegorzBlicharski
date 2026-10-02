import type { Day } from "./dates";
import type { PhoneCategory, SessionDomain, Activity, ValueClass } from "@/domains/catalog";

/** Floor / target / stretch for one daily metric. */
export interface Ladder {
  floor: number;
  target: number;
  stretch: number;
}

export interface NoPhoneWindow {
  id: string;
  label: string;
  /** "afterWake" (first N minutes after wake), "beforeSleep" (N minutes before lastUse cut-off), "deepWork", "custom" */
  kind: "afterWake" | "beforeSleep" | "deepWork" | "custom";
  minutes?: number;
  start?: string; // HH:mm (custom)
  end?: string; // HH:mm (custom)
  enabled: boolean;
}

export interface MinimumDayItem {
  metricKey: string;
  min: number;
}

export interface ClassificationRule {
  domain?: SessionDomain;
  activity?: Activity;
  valueClass: ValueClass;
}

export interface Settings {
  dayStartHour: number;
  /** Phone */
  phoneLimitMin: number;
  productivePhoneCategories: PhoneCategory[];
  morningEnd: string; // HH:mm — phone use before this counts as "morning"
  eveningStart: string; // HH:mm — after this counts as "evening / late"
  noPhoneWindows: NoPhoneWindow[];
  /** Daily ladders (minutes unless noted) */
  targets: {
    germanMin: Ladder;
    lawMin: Ladder;
    lawQuestions: Ladder;
    deepMin: Ladder;
    productiveMin: Ladder;
    executionPct: number; // e.g. 85
  };
  /** German skill target mix (shares, normalised at use). */
  germanTargetMix: Record<string, number>;
  /** Max share of passive German time considered healthy for current goals. */
  germanMaxPassiveShare: number;
  /** Optional budgets (minutes/day), null = disabled. */
  budgets: { phone: number | null; distraction: number | null; passiveLearning: number | null };
  /** User-defined minimum day; empty = system-suggested. */
  minimumDay: MinimumDayItem[];
  /** Deep work classification thresholds. */
  deep: { minMinutes: number; maxInterruptions: number; minFocus: number };
  maxConcurrentExperiments: number;
  /** Phone baseline window for reclaimed time (null = first 30 days of phone data). */
  phoneBaseline: { from: Day; to: Day } | null;
  classificationRules: ClassificationRule[];
  /** Law areas tagged by priority. */
  lawAreaTiers: Record<string, "PRIMARY" | "SECONDARY" | "MAINTENANCE">;
  /** Law readiness composite weights (visible). */
  readinessWeights: Record<string, number>;
  weeklyReviewDay: number; // ISO weekday
  theme: "dark" | "light" | "system";
}

export const DEFAULT_SETTINGS: Settings = {
  dayStartHour: 4,
  phoneLimitMin: 60,
  productivePhoneCategories: ["Learning", "German", "Work"],
  morningEnd: "10:00",
  eveningStart: "21:30",
  noPhoneWindows: [
    { id: "wake", label: "After waking", kind: "afterWake", minutes: 60, enabled: true },
    { id: "deep", label: "During deep work", kind: "deepWork", enabled: true },
    { id: "sleep", label: "Before sleep", kind: "custom", start: "22:30", end: "23:59", enabled: true },
  ],
  targets: {
    germanMin: { floor: 30, target: 120, stretch: 180 },
    lawMin: { floor: 30, target: 120, stretch: 180 },
    lawQuestions: { floor: 20, target: 60, stretch: 100 },
    deepMin: { floor: 60, target: 180, stretch: 240 },
    productiveMin: { floor: 90, target: 300, stretch: 390 },
    executionPct: 85,
  },
  germanTargetMix: {
    Speaking: 0.2,
    Writing: 0.15,
    Listening: 0.15,
    Reading: 0.1,
    Grammar: 0.1,
    Vocabulary: 0.1,
    Conversation: 0.1,
    "Legal German": 0.1,
  },
  germanMaxPassiveShare: 0.35,
  budgets: { phone: 60, distraction: 30, passiveLearning: 60 },
  minimumDay: [],
  deep: { minMinutes: 45, maxInterruptions: 1, minFocus: 4 },
  maxConcurrentExperiments: 2,
  phoneBaseline: null,
  classificationRules: [
    { domain: "SYSTEM", valueClass: "maintenance" },
    { domain: "ADMIN", valueClass: "admin" },
    { activity: "passive_immersion", valueClass: "low" },
    { domain: "OTHER", valueClass: "low" },
  ],
  lawAreaTiers: {},
  readinessWeights: { coverage: 0.15, accuracy: 0.15, recentAccuracy: 0.2, retention: 0.2, mock: 0.2, volume: 0.05, balance: 0.05 },
  weeklyReviewDay: 7,
  theme: "dark",
};

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** Deep-merge a partial patch into settings (arrays replace). */
export function mergeSettings<T>(base: T, patch: unknown): T {
  if (!isPlainObject(patch)) return base;
  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const [k, v] of Object.entries(patch)) {
    const cur = out[k];
    out[k] = isPlainObject(v) && isPlainObject(cur) ? mergeSettings(cur, v) : v;
  }
  return out as T;
}

export interface SettingsVersion {
  id: number;
  effectiveFrom: Day;
  recordedAt: string;
  /** The partial patch recorded by SETTINGS_CHANGED. Snapshots are computed, never stored, so backdated changes stay correct. */
  patch: Partial<Settings> | Record<string, unknown>;
}

/**
 * Settings valid on a given day: all patches with effectiveFrom ≤ day applied onto defaults in recording order.
 * Earlier versions are never overwritten — history stays reproducible.
 */
export function settingsAt(versions: SettingsVersion[], day: Day): Settings {
  let cur: Settings = DEFAULT_SETTINGS;
  const sorted = [...versions].sort((a, b) => a.id - b.id);
  for (const v of sorted) {
    if (v.effectiveFrom <= day) cur = mergeSettings(cur, v.patch);
  }
  return cur;
}

/** Memoising resolver for per-day lookups across long histories. */
export function settingsResolver(versions: SettingsVersion[]): (day: Day) => Settings {
  if (versions.length === 0) return () => DEFAULT_SETTINGS;
  const cache = new Map<string, Settings>();
  const sorted = [...versions].sort((a, b) => a.id - b.id);
  return (day: Day) => {
    // key = set of versions applicable on that day
    const key = sorted.filter((v) => v.effectiveFrom <= day).map((v) => v.id).join(",");
    let s = cache.get(key);
    if (!s) {
      s = settingsAt(sorted, day);
      cache.set(key, s);
    }
    return s;
  };
}
