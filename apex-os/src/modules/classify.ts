/** Read-time classification rules (versioned through settings). */
import type { Settings } from "@/core/settings";
import type { Depth } from "@/core/types";
import { CORE_DOMAINS, type SessionDomain, type ValueClass } from "@/domains/catalog";

export const CLASSIFY_VERSION = 1;

export interface ClassifiableSession {
  domain: string;
  activity: string;
  mode: string;
  minutes: number;
  focus: number | null;
  interruptions: number | null;
  depth?: string | null;
}

/**
 * DEEP: minutes ≥ deep.minMinutes ∧ interruptions ≤ deep.maxInterruptions ∧ (focus ≥ deep.minFocus or unrated & active)
 * LIGHT: minutes < 25 ∨ focus ≤ 2 ∨ passive mode
 * NORMAL otherwise. A user-provided depth always wins.
 */
export function classifyDepth(s: ClassifiableSession, settings: Settings): Depth {
  if (s.depth === "LIGHT" || s.depth === "NORMAL" || s.depth === "DEEP") return s.depth;
  const { minMinutes, maxInterruptions, minFocus } = settings.deep;
  if (s.minutes < 25 || (s.focus != null && s.focus <= 2) || s.mode === "passive") return "LIGHT";
  const okInterruptions = (s.interruptions ?? 0) <= maxInterruptions;
  const okFocus = s.focus == null ? true : s.focus >= minFocus;
  if (s.minutes >= minMinutes && okInterruptions && okFocus) return "DEEP";
  return "NORMAL";
}

export function classifyValue(s: ClassifiableSession, settings: Settings): ValueClass {
  for (const r of settings.classificationRules) {
    if (r.domain && r.domain !== s.domain) continue;
    if (r.activity && r.activity !== s.activity) continue;
    if (!r.domain && !r.activity) continue;
    return r.valueClass;
  }
  if (CORE_DOMAINS.includes(s.domain as SessionDomain)) return s.mode === "passive" ? "maintenance" : "high";
  if (s.domain === "SYSTEM") return "maintenance";
  if (s.domain === "ADMIN") return "admin";
  return "low";
}

/** Map a German session (activity/area) to a German skill bucket. */
export function germanSkillOf(activity: string, area: string | null): string {
  if (area) return area;
  const map: Record<string, string> = {
    reading: "Reading",
    listening: "Listening",
    speaking: "Speaking",
    conversation: "Conversation",
    writing: "Writing",
    grammar: "Grammar",
    vocabulary: "Vocabulary",
    pronunciation: "Pronunciation",
    passive_immersion: "Passive Immersion",
    active_immersion: "Active Immersion",
    testing: "Exam Preparation",
    review: "Vocabulary",
    recall: "Vocabulary",
  };
  return map[activity] ?? "Other";
}
