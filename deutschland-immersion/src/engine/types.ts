/**
 * Core data model. The engine only knows these shapes; all Berlin (and future city)
 * content lives in /content and is plain data built on top of them.
 */

export type CEFR = 'B1' | 'B1+' | 'B2' | 'B2+' | 'C1' | 'C1+' | 'C2' | 'C2+';

export type SkillId =
  | 'speaking'
  | 'listening'
  | 'reading'
  | 'writing'
  | 'grammar'
  | 'vocabulary'
  | 'professional'
  | 'negotiation'
  | 'pressure'
  | 'translation'
  | 'legal';

export type ErrorCategory =
  | 'grammar'
  | 'vocabulary'
  | 'syntax'
  | 'wordOrder'
  | 'articles'
  | 'gender'
  | 'cases'
  | 'prepositions'
  | 'adjectiveEndings'
  | 'tense'
  | 'idioms'
  | 'register'
  | 'listening'
  | 'reading'
  | 'writing'
  | 'professional'
  | 'collocation'
  | 'terminology'
  | 'translation';

/** A learnable language target (grammar point, pattern, register rule, term...). */
export interface LanguageTarget {
  id: string;
  label: string; // German label, e.g. "wegen + Genitiv"
  level: CEFR;
  category: ErrorCategory;
  /** Short explanation shown only when the player asks for it / after errors. */
  explanation: string;
  /** Polish support note (progressively hidden). */
  pl?: string;
  examples: string[];
}

export type Tier = 'incorrect' | 'understandable' | 'correct' | 'natural' | 'professional' | 'native';

export const TIER_ORDER: Tier[] = ['incorrect', 'understandable', 'correct', 'natural', 'professional', 'native'];

export const TIER_LABEL: Record<Tier, string> = {
  incorrect: 'Falsch',
  understandable: 'Verständlich, aber unnatürlich',
  correct: 'Korrekt',
  natural: 'Natürlich',
  professional: 'Professionell',
  native: 'Muttersprachlich',
};

export type Dimension = 'correctness' | 'naturalness' | 'precision' | 'register' | 'style' | 'idiomaticity';

export interface EvalIssue {
  target?: string;
  category: ErrorCategory;
  severity: 1 | 2 | 3; // 1 minor/stylistic, 2 noticeable, 3 blocks meaning or badly wrong
  message: string; // German-first explanation
  pl?: string;
  match?: string;
  fix?: string;
}

export interface Evaluation {
  tier: Tier;
  score: number; // 0..100
  dims: Record<Dimension, number>;
  issues: EvalIssue[];
  strengths: string[];
  missing: string[]; // labels of required content not found
  keyImprovement?: string;
  model: string; // best reference answer
  source: 'rules' | 'ai' | 'rules+ai';
}

// ---------------------------------------------------------------- conditions & effects

export type Condition =
  | { flag: string; is?: boolean }
  | { item: string; has?: boolean }
  | { mission: string; status: MissionStatus }
  | { rel: string; min?: number; max?: number }
  | { level: CEFR; atLeast: true }
  | { any: Condition[] }
  | { all: Condition[] };

export type Effect =
  | { type: 'flag'; flag: string; value?: boolean }
  | { type: 'item'; item: string; remove?: boolean }
  | { type: 'rel'; npc: string; delta: number; note?: string }
  | { type: 'memory'; npc: string; text: string }
  | { type: 'xp'; amount: number; reason?: string }
  | { type: 'skill'; skill: SkillId; delta: number }
  | { type: 'reputation'; city: string; delta: number }
  | { type: 'unlockLocation'; location: string }
  | { type: 'startMission'; mission: string }
  | { type: 'objective'; mission: string; objective: string }
  | { type: 'completeMission'; mission: string; outcome?: string }
  | { type: 'time'; set: string } // "HH:MM"
  | { type: 'message'; from: string; text: string; gloss?: string; replyRetrieval?: boolean }
  | { type: 'email'; emailId: string }
  | { type: 'call'; dialogue: string; from: string; delayMs?: number }
  | { type: 'term'; term: string } // add to terminology notebook
  | { type: 'vocab'; words: string[]; mode: 'seen' | 'recognized' | 'produced' }
  | { type: 'weather'; weather: Weather }
  | { type: 'moveTo'; location: string }
  | { type: 'achievement'; id: string }
  | { type: 'ui'; open: 'training' | 'map' | 'phone' | 'profile' }
  | { type: 'advanceDay' }
  | { type: 'chapterCard'; title: string; subtitle?: string };

export type Weather = 'clear' | 'overcast' | 'rain' | 'fog';

// ---------------------------------------------------------------- dialogue

export type SpeakerId = string; // npc id | 'player' | 'narrator' | 'announce' | 'system'

export interface Choice {
  text: string; // German
  gloss?: string;
  next: string;
  condition?: Condition;
  effects?: Effect[];
  /** Linguistic quality of this option (for recognition tracking). */
  quality?: Tier;
  targets?: string[];
  /** Short feedback shown after choosing (only for non-natural choices). */
  feedback?: string;
}

export interface RequiredElement {
  id: string;
  label: string; // what the player must communicate (German)
  /** Regex sources (case-insensitive, normalised umlauts). Any one matches. */
  patterns: string[];
}

export interface PatternRule {
  pattern: string; // regex source
  target?: string;
  category: ErrorCategory;
  severity: 1 | 2 | 3;
  message: string;
  pl?: string;
  fix?: string;
}

export interface BonusRule {
  pattern: string;
  dimension: Dimension;
  note: string;
  weight?: number;
}

export interface FreeInputSpec {
  /** Task instruction, in German. */
  task: string;
  taskGloss?: string;
  placeholder?: string;
  register: 'formal' | 'informal' | 'any';
  targets: string[];
  required: RequiredElement[];
  errors?: PatternRule[];
  bonuses?: BonusRule[];
  models: string[];
  /** Words the player gets production credit for when used. */
  vocab?: string[];
  mode?: 'speak' | 'write' | 'translate';
  /** Source text for translation tasks. */
  source?: { lang: 'pl' | 'de'; text: string };
  /** Terminology that must be rendered: term id -> accepted target renderings (regex). */
  terms?: { term: string; accept: string[]; reject?: { pattern: string; message: string }[] }[];
  /** Branching by tier bucket. */
  onFail: string;
  onPartial: string;
  onSuccess: string;
  timeLimitSec?: number;
  /** Verify that numbers from `source` survive (default true). */
  checkNumbers?: boolean;
  skill?: SkillId;
  minWords?: number;
}

export interface DocumentSpec {
  kind: 'board' | 'contract' | 'email' | 'letter' | 'note' | 'sms' | 'sign';
  title: string;
  lines: { text: string; highlight?: boolean; id?: string; small?: boolean; mono?: boolean }[];
  footer?: string;
}

export type DialogueNode = {
  id: string;
  speaker?: SpeakerId;
  /** Display name for ad-hoc speakers without an NPC record. */
  speakerName?: string;
  /** TTS rate override (e.g. an NPC repeating slowly). */
  rate?: number;
  text?: string; // German
  gloss?: string; // Polish support
  /** Stage direction / narration shown in italics (German). */
  direction?: string;
  next?: string;
  choices?: Choice[];
  input?: FreeInputSpec;
  document?: DocumentSpec;
  effects?: Effect[];
  /** Conditional jump: first matching branch wins, else `next`. */
  branch?: { condition: Condition; next: string }[];
  /** Inject an adaptive retrieval moment (invisible SRS), then continue to `next`. */
  retrieval?: { channel: 'dialogue'; speaker: SpeakerId; pool?: string[] };
  /** Speak with TTS (default true for NPC lines). */
  audio?: boolean;
  /** For phone calls & announcements: text hidden until revealed (listening). */
  listening?: boolean;
  /** Interactive document inspection: the player marks lines they believe are wrong. */
  inspect?: InspectSpec;
  /** Render the free input as an e-mail composer. */
  compose?: { to: string; subject: string };
  /** Seconds before the choice times out (pressure). */
  timer?: number;
  timeoutNext?: string;
  /** Skill credited for understanding this line (listening/reading). */
  skill?: SkillId;
  end?: boolean;
};

export interface InspectSpec {
  instruction: string;
  docs: DocumentSpec[];
  /** Ids of lines that really contain a problem. */
  correct: string[];
  explain: Record<string, string>;
  /** Flag set per found problem: `${flagPrefix}_${id}`. */
  flagPrefix: string;
  targets: string[];
  next: string;
}

export interface Dialogue {
  id: string;
  mode?: 'scene' | 'call' | 'announcement';
  start: string;
  nodes: Record<string, DialogueNode>;
}

// ---------------------------------------------------------------- world

export interface NPC {
  id: string;
  name: string;
  role: string; // German
  roleGloss?: string;
  personality: string;
  register: 'formal' | 'informal' | 'mixed';
  voice: { pitch: number; rate: number; gender: 'f' | 'm' };
  portrait: PortraitSpec;
  bio: string;
  startRel: number; // -100..100
}

export interface PortraitSpec {
  hair: 'short' | 'long' | 'bun' | 'bald' | 'curly' | 'bob' | 'cap';
  hairColor: string;
  skin: string;
  coat: string;
  accent: string; // rim light colour
  glasses?: boolean;
  beard?: boolean;
}

export type SceneArt =
  | 'hauptbahnhof'
  | 'platform'
  | 'street'
  | 'apartment'
  | 'cafe'
  | 'office'
  | 'restaurant'
  | 'ubahn'
  | 'buergeramt'
  | 'stadium'
  | 'hotel'
  | 'spree';

export interface Hotspot {
  id: string;
  label: string; // German action label
  /** Position in % of the scene. */
  x: number;
  y: number;
  kind: 'talk' | 'inspect' | 'exit' | 'use';
  dialogue?: string;
  npc?: string;
  condition?: Condition;
  effects?: Effect[];
}

export interface Location {
  id: string;
  city: string;
  name: string;
  district: string;
  art: SceneArt;
  ambience: AmbienceId;
  description: string; // German establishing text
  map: { x: number; y: number };
  hotspots: Hotspot[];
  /** Dialogues that auto-start on arrival (first matching, once per condition). */
  onEnter?: { id: string; condition?: Condition; dialogue: string }[];
  startsUnlocked?: boolean;
  locked?: string; // teaser text for locations not yet in production
  /** Sub-location (entered via a hotspot, not shown on the map). */
  parent?: string;
  transit?: string; // e.g. "S5 · U8"
}

export type AmbienceId = 'station' | 'street' | 'cafe' | 'apartment' | 'office' | 'restaurant' | 'ubahn' | 'rain' | 'silence';

export interface Objective {
  id: string;
  text: string; // German
  location?: string; // where it happens (for map markers)
}

export interface Mission {
  id: string;
  city: string;
  chapter: string; // e.g. "TAG 1"
  title: string; // German title
  titleEn: string;
  codename: string; // e.g. "DAS FALSCHE GLEIS"
  time: string;
  synopsis: string;
  objectives: Objective[];
  targets: string[]; // language focus (invisible to the player)
  xp: number;
  requires?: Condition;
  /** Effects when mission completes. */
  rewards?: Effect[];
  boss?: boolean;
  career?: CareerRank;
}

export type MissionStatus = 'locked' | 'available' | 'active' | 'completed';

export interface City {
  id: string;
  name: string;
  tagline: string;
  available: boolean;
  mapBounds?: { w: number; h: number };
}

export type CareerRank =
  | 'NEWCOMER'
  | 'PROFESSIONAL'
  | 'SPECIALIST'
  | 'NEGOTIATOR'
  | 'LEGAL_EXPERT'
  | 'FOOTBALL_OPS'
  | 'TRANSLATOR'
  | 'SWORN_CANDIDATE'
  | 'ELITE';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  hidden?: boolean;
}

export interface VocabEntry {
  id: string; // lemma
  de: string; // display with article
  pl: string;
  en?: string;
  level: CEFR;
  forms?: string[]; // surface forms for matching in text
  domain?: 'alltag' | 'reise' | 'wohnen' | 'arbeit' | 'recht' | 'fussball' | 'verwaltung' | 'gastro';
}

export interface Term {
  id: string;
  de: string;
  pl: string[];
  context: string; // legal context (German)
  alternatives?: string[];
  falseFriends?: string;
  equivalence: 'full' | 'partial' | 'none';
  note: string;
  collocations: string[];
  example: string;
}

export interface EmailSpec {
  id: string;
  from: string;
  fromName: string;
  subject: string;
  body: string[];
  time: string;
  attachment?: string;
}

/** Adaptive retrieval item: a tiny narrative moment testing one target. */
export interface RetrievalItem {
  id: string;
  target: string;
  channel: 'sms' | 'dialogue';
  /** NPC ids allowed to deliver it ('*' = any known). */
  speakers: string[];
  prompt: string; // NPC line (German) — may contain {name}
  gloss?: string;
  kind: 'choice' | 'input';
  choices?: { text: string; correct: boolean; feedback?: string }[];
  input?: Pick<FreeInputSpec, 'task' | 'required' | 'errors' | 'bonuses' | 'models' | 'register'>;
  minLevel?: CEFR;
}

export interface DrillItem {
  id: string;
  target: string;
  kind: 'cloze' | 'choice' | 'transform' | 'produce';
  context: string; // in-world framing (German)
  prompt: string; // with ___ for cloze
  answers: string[]; // accepted (normalised compare) for cloze/transform
  choices?: string[];
  explanation: string;
}
