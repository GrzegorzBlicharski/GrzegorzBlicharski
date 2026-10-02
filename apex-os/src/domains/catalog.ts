/**
 * Static vocabularies. User-facing configuration (targets, mixes, classification overrides) lives in
 * settings; these lists only define the *shape* of the data model so later modules can extend them.
 */

export const SESSION_DOMAINS = ["GERMAN", "LAW", "CAREER", "LEARNING", "SYSTEM", "ADMIN", "OTHER"] as const;
export type SessionDomain = (typeof SESSION_DOMAINS)[number];

export const DOMAIN_LABEL: Record<SessionDomain, string> = {
  GERMAN: "German",
  LAW: "Law",
  CAREER: "Career",
  LEARNING: "Learning (other)",
  SYSTEM: "System building",
  ADMIN: "Admin",
  OTHER: "Other",
};

/** Domains whose time counts as "productive core work" (system building and admin are tracked separately). */
export const CORE_DOMAINS: SessionDomain[] = ["GERMAN", "LAW", "CAREER", "LEARNING"];

export const ACTIVITIES = [
  // consumption
  "reading",
  "listening",
  "passive_immersion",
  // retrieval
  "recall",
  "review",
  "questions",
  "testing",
  "vocabulary",
  // production / practice
  "speaking",
  "conversation",
  "writing",
  "grammar",
  "pronunciation",
  "active_immersion",
  "cases",
  "drafting",
  "research",
  "analysis",
  "negotiation",
  // meta
  "planning",
  "system",
  "admin",
  "course",
  "application",
  "other",
] as const;
export type Activity = (typeof ACTIVITIES)[number];

export type LearningKind = "consumption" | "retrieval" | "production" | "meta";
export const ACTIVITY_KIND: Record<Activity, LearningKind> = {
  reading: "consumption",
  listening: "consumption",
  passive_immersion: "consumption",
  recall: "retrieval",
  review: "retrieval",
  questions: "retrieval",
  testing: "retrieval",
  vocabulary: "retrieval",
  speaking: "production",
  conversation: "production",
  writing: "production",
  grammar: "production",
  pronunciation: "production",
  active_immersion: "production",
  cases: "production",
  drafting: "production",
  research: "production",
  analysis: "production",
  negotiation: "production",
  planning: "meta",
  system: "meta",
  admin: "meta",
  course: "consumption",
  application: "production",
  other: "meta",
};

/** Default learning mode; passive consumption is never equivalent to active production. */
export function defaultMode(activity: Activity): "active" | "passive" {
  return activity === "listening" || activity === "passive_immersion" || activity === "reading" ? "passive" : "active";
}

export const GERMAN_SKILLS = [
  "Reading",
  "Listening",
  "Speaking",
  "Writing",
  "Grammar",
  "Vocabulary",
  "Pronunciation",
  "Conversation",
  "Legal German",
  "Professional German",
  "Exam Preparation",
  "Active Immersion",
  "Passive Immersion",
] as const;
export type GermanSkill = (typeof GERMAN_SKILLS)[number];

/** The four CEFR dimensions used for level evidence. */
export const CEFR_SKILLS = ["Reading", "Listening", "Speaking", "Writing"] as const;
export const CEFR_LEVELS = ["A2", "B1", "B1+", "B2", "B2+", "C1", "C1+", "C2"] as const;
export type CefrLevel = (typeof CEFR_LEVELS)[number];

export const GERMAN_ERROR_CATEGORIES = [
  "articles",
  "cases",
  "adjective endings",
  "verb position",
  "conjugation",
  "tense",
  "prepositions",
  "word order",
  "vocabulary",
  "spelling",
  "punctuation",
  "pronunciation",
  "other",
] as const;

export const LAW_AREAS = [
  "KC",
  "KPC",
  "KK",
  "KPK",
  "KPA",
  "PPSA",
  "KSH",
  "Prawo pracy",
  "Konstytucyjne",
  "UE",
  "Administracyjne",
  "Gospodarcze",
  "Nieruchomości",
  "Budowlane",
  "Sportowe",
  "Energetyczne",
  "Środowiskowe",
  "Compliance",
  "Contracts",
] as const;

export const LAW_SKILLS = [
  "Issue Spotting",
  "Research",
  "Reasoning",
  "Writing",
  "Drafting",
  "Contract Analysis",
  "Risk Analysis",
  "Negotiation",
  "Procedure",
  "Client Communication",
] as const;

export const PHONE_CATEGORIES = [
  "Learning",
  "German",
  "Communication",
  "Work",
  "Utility",
  "Entertainment",
  "Social Media",
  "News",
  "Other",
] as const;
export type PhoneCategory = (typeof PHONE_CATEGORIES)[number];

export const TEST_KINDS = ["OFFICIAL", "EXTERNAL", "MOCK", "SELF", "SYSTEM"] as const;
export type TestKind = (typeof TEST_KINDS)[number];
/** Higher rank = stronger evidence. */
export const TEST_KIND_RANK: Record<TestKind, number> = { OFFICIAL: 5, EXTERNAL: 4, MOCK: 3, SELF: 2, SYSTEM: 1 };

export const VALUE_CLASSES = ["high", "maintenance", "admin", "low"] as const;
export type ValueClass = (typeof VALUE_CLASSES)[number];

export const MILESTONE_KINDS = [
  "strategy",
  "milestone",
  "test",
  "habit",
  "intervention",
  "goal",
  "achievement",
  "certification",
  "exam",
  "project",
  "portfolio",
] as const;

export const EVIDENCE_TYPES = ["test", "project", "exercise", "document", "assessment"] as const;

export const DEFAULT_COMPETENCIES: { name: string; domain: SessionDomain }[] = [
  { name: "German", domain: "GERMAN" },
  { name: "Legal Knowledge", domain: "LAW" },
  { name: "Legal Drafting", domain: "LAW" },
  { name: "Research", domain: "LAW" },
  { name: "Negotiation", domain: "LAW" },
  { name: "Professional Communication", domain: "CAREER" },
];

/** Output fields that a session can carry. */
export const OUTPUT_FIELDS = [
  "words",
  "speakingMin",
  "conversations",
  "exercises",
  "chapters",
  "mockTests",
  "newWords",
  "vocabReviews",
  "questions",
  "questionsCorrect",
  "cases",
  "statutes",
  "pages",
  "memos",
  "contracts",
  "analyses",
  "drafts",
  "research",
  "articles",
  "judgments",
] as const;
export type OutputField = (typeof OUTPUT_FIELDS)[number];
export type SessionOutput = Partial<Record<OutputField, number>>;
