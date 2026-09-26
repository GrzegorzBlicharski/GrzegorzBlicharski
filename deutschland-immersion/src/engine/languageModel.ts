import type { CEFR, ErrorCategory, EvalIssue, RetrievalItem, SkillId, Tier } from './types';

/**
 * The player's language model: per-target mastery with spaced-repetition
 * scheduling, separate recognition/production vocabulary, an error log and
 * Elo-style skill ratings. Pure functions over plain data (easy to persist & test).
 */

export interface TargetState {
  seen: number;
  successes: number;
  errors: number;
  streak: number;
  mastery: number; // 0..1 (production weighted)
  recog: number; // 0..1 recognition mastery
  lastSeen: number;
  lastError: number;
  intervalMin: number; // spacing interval in minutes
  due: number; // timestamp
  history: number[]; // last outcomes 0..1
}

export interface VocabState {
  seen: number;
  lookups: number;
  recog: number; // successful recognitions
  prod: number; // spontaneous productions
  lastProd: number;
  firstSeen: number;
}

export interface ErrorRecord {
  t: number;
  target?: string;
  category: ErrorCategory;
  severity: number;
  message: string;
  text: string;
  context: string;
}

export interface Snapshot {
  t: number;
  label: string;
  skills: Record<SkillId, number>;
  avgScore: number;
}

export interface LanguageProfile {
  targets: Record<string, TargetState>;
  vocab: Record<string, VocabState>;
  errors: ErrorRecord[];
  skills: Record<SkillId, number>;
  categoryErrors: Partial<Record<ErrorCategory, number>>;
  productions: { t: number; tier: Tier; score: number; text: string; context: string }[];
  snapshots: Snapshot[];
  retrievalUsed: Record<string, number>;
  translationMemory: { t: number; term: string; ok: boolean; text: string }[];
}

export const SKILLS: SkillId[] = ['speaking', 'listening', 'reading', 'writing', 'grammar', 'vocabulary', 'professional', 'negotiation', 'pressure', 'translation', 'legal'];

export const SKILL_LABEL: Record<SkillId, string> = {
  speaking: 'Sprechen',
  listening: 'Hören',
  reading: 'Lesen',
  writing: 'Schreiben',
  grammar: 'Grammatik',
  vocabulary: 'Wortschatz',
  professional: 'Berufsdeutsch',
  negotiation: 'Verhandeln',
  pressure: 'Unter Druck',
  translation: 'Übersetzen PL↔DE',
  legal: 'Juristendeutsch',
};

/** Rating thresholds (0..1000) for CEFR estimates. */
export const CEFR_SCALE: [CEFR, number][] = [
  ['B1', 0],
  ['B1+', 300],
  ['B2', 420],
  ['B2+', 540],
  ['C1', 660],
  ['C1+', 760],
  ['C2', 860],
  ['C2+', 950],
];

export const CEFR_RATING: Record<CEFR, number> = Object.fromEntries(CEFR_SCALE) as Record<CEFR, number>;

export function cefrOf(rating: number): CEFR {
  let res: CEFR = 'B1';
  for (const [c, r] of CEFR_SCALE) if (rating >= r) res = c;
  return res;
}

export function cefrProgress(rating: number): number {
  const i = CEFR_SCALE.findIndex(([c]) => c === cefrOf(rating));
  const lo = CEFR_SCALE[i][1];
  const hi = CEFR_SCALE[i + 1]?.[1] ?? 1000;
  return Math.max(0, Math.min(1, (rating - lo) / (hi - lo)));
}

export function newProfile(): LanguageProfile {
  const skills = Object.fromEntries(SKILLS.map((s) => [s, 240])) as Record<SkillId, number>;
  // Starting operational level ≈ B1; legal & translation start lower.
  skills.legal = 120;
  skills.translation = 160;
  skills.negotiation = 180;
  skills.pressure = 200;
  return { targets: {}, vocab: {}, errors: [], skills, categoryErrors: {}, productions: [], snapshots: [], retrievalUsed: {}, translationMemory: [] };
}

export const TIER_VALUE: Record<Tier, number> = {
  incorrect: 0,
  understandable: 0.35,
  correct: 0.7,
  natural: 0.85,
  professional: 0.95,
  native: 1,
};

export function overallRating(p: LanguageProfile): number {
  const core: SkillId[] = ['speaking', 'listening', 'reading', 'writing', 'grammar', 'vocabulary'];
  return core.reduce((a, s) => a + p.skills[s], 0) / core.length;
}

function emptyTarget(now: number): TargetState {
  return { seen: 0, successes: 0, errors: 0, streak: 0, mastery: 0.3, recog: 0.3, lastSeen: 0, lastError: 0, intervalMin: 0, due: now, history: [] };
}

/**
 * Record an outcome for a language target.
 * mode 'recognition' (picked the right option) counts less than 'production' (wrote/spoke it).
 */
export function recordTarget(p: LanguageProfile, id: string, q: number, mode: 'recognition' | 'production', now = Date.now()): LanguageProfile {
  const cur = { ...(p.targets[id] ?? emptyTarget(now)) };
  cur.seen++;
  cur.lastSeen = now;
  cur.history = [...cur.history.slice(-9), q];
  if (mode === 'production') cur.mastery += 0.35 * (q - cur.mastery);
  else {
    cur.recog += 0.4 * (q - cur.recog);
    // recognition alone can lift production mastery only a little and never above 0.6
    cur.mastery = Math.min(Math.max(cur.mastery, 0.6), cur.mastery + 0.08 * (q - cur.mastery));
  }
  if (q >= 0.7) {
    cur.successes++;
    cur.streak++;
    // Expanding intervals: 20 min → 1 day → 3 days → 7 days → 16 days …
    cur.intervalMin = cur.intervalMin <= 0 ? 20 : cur.intervalMin < 60 ? 1440 : Math.round(cur.intervalMin * 2.3);
  } else {
    cur.errors++;
    cur.streak = 0;
    cur.lastError = now;
    cur.intervalMin = 10; // bring it back soon, inside the story
  }
  cur.due = now + cur.intervalMin * 60_000;
  return { ...p, targets: { ...p.targets, [id]: cur } };
}

export function recordIssues(p: LanguageProfile, issues: EvalIssue[], text: string, context: string, now = Date.now()): LanguageProfile {
  if (!issues.length) return p;
  const errors = [
    ...issues.map((i) => ({ t: now, target: i.target, category: i.category, severity: i.severity, message: i.message, text, context })),
    ...p.errors,
  ].slice(0, 300);
  const categoryErrors = { ...p.categoryErrors };
  for (const i of issues) categoryErrors[i.category] = (categoryErrors[i.category] ?? 0) + 1;
  return { ...p, errors, categoryErrors };
}

/** Elo-style skill update: performance 0..1 against a task of given difficulty rating. */
export function updateSkill(p: LanguageProfile, skill: SkillId, perf: number, taskRating: number, k = 28): LanguageProfile {
  const r = p.skills[skill];
  const expected = 1 / (1 + Math.pow(10, (taskRating - r) / 250));
  const next = Math.max(0, Math.min(1000, r + k * (perf - expected) * 2));
  return { ...p, skills: { ...p.skills, [skill]: Math.round(next * 10) / 10 } };
}

export function vocabEvent(p: LanguageProfile, ids: string[], kind: 'seen' | 'lookup' | 'recognized' | 'produced', now = Date.now()): LanguageProfile {
  if (!ids.length) return p;
  const vocab = { ...p.vocab };
  for (const id of ids) {
    const v = { ...(vocab[id] ?? { seen: 0, lookups: 0, recog: 0, prod: 0, lastProd: 0, firstSeen: now }) };
    if (kind === 'seen') v.seen++;
    if (kind === 'lookup') v.lookups++;
    if (kind === 'recognized') v.recog++;
    if (kind === 'produced') {
      v.prod++;
      v.lastProd = now;
    }
    vocab[id] = v;
  }
  return { ...p, vocab };
}

/** Vocabulary stage: 0 unseen · 1 seen · 2 recognised · 3 produced once · 4 produced repeatedly over time · 5 mastered. */
export function vocabStage(v?: VocabState): number {
  if (!v) return 0;
  if (v.prod >= 4) return 5;
  if (v.prod >= 2) return 4;
  if (v.prod >= 1) return 3;
  if (v.recog >= 1 && v.recog > v.lookups) return 2;
  return 1;
}

/** Targets ranked by weakness (for retrieval & training). */
export function weaknesses(p: LanguageProfile, now = Date.now()): { id: string; weight: number; state: TargetState }[] {
  return Object.entries(p.targets)
    .filter(([, s]) => s.errors > 0 || s.mastery < 0.55)
    .map(([id, s]) => {
      const recency = s.lastError ? Math.exp(-(now - s.lastError) / (1000 * 60 * 60 * 24 * 7)) : 0.2;
      const overdue = now >= s.due ? 1 : 0.3;
      return { id, state: s, weight: (1 - s.mastery) * (1 + Math.log1p(s.errors)) * (0.5 + recency) * overdue };
    })
    .sort((a, b) => b.weight - a.weight);
}

const LEVEL_ORDER: CEFR[] = CEFR_SCALE.map(([c]) => c);
export function levelAtLeast(have: CEFR, need: CEFR) {
  return LEVEL_ORDER.indexOf(have) >= LEVEL_ORDER.indexOf(need);
}

/**
 * Invisible spaced repetition: choose a retrieval moment for the current context.
 * Prefers overdue weak targets; avoids repeating the same item within 15 minutes.
 */
export function pickRetrieval(
  p: LanguageProfile,
  bank: RetrievalItem[],
  opts: { channel: 'sms' | 'dialogue'; speakers: string[]; level: CEFR; pool?: string[] },
  now = Date.now(),
): RetrievalItem | null {
  const weak = weaknesses(p, now);
  const weightOf = (target: string) => weak.find((w) => w.id === target)?.weight ?? 0;
  const candidates = bank.filter(
    (r) =>
      r.channel === opts.channel &&
      (!opts.pool || opts.pool.includes(r.target)) &&
      (r.speakers.includes('*') || r.speakers.some((s) => opts.speakers.includes(s))) &&
      (!r.minLevel || levelAtLeast(opts.level, r.minLevel)) &&
      now - (p.retrievalUsed[r.id] ?? 0) > 15 * 60_000,
  );
  if (!candidates.length) return null;
  const scored = candidates.map((r) => ({ r, w: weightOf(r.target) + (p.targets[r.target] ? 0 : 0.15) }));
  scored.sort((a, b) => b.w - a.w);
  if (scored[0].w <= 0) return null;
  return scored[0].r;
}

export function snapshot(p: LanguageProfile, label: string, now = Date.now()): LanguageProfile {
  const recent = p.productions.slice(0, 12);
  const avg = recent.length ? recent.reduce((a, x) => a + x.score, 0) / recent.length : 0;
  return { ...p, snapshots: [...p.snapshots, { t: now, label, skills: { ...p.skills }, avgScore: Math.round(avg) }].slice(-60) };
}
