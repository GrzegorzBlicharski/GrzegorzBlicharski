/** Shared view types consumed by the pure intelligence layer. Produced by `data/facts.ts`. */
import type { Day } from "./dates";
import type { Settings, SettingsVersion } from "./settings";

export type Depth = "LIGHT" | "NORMAL" | "DEEP";

export interface PhoneFacts {
  total: number;
  productive: number;
  unproductive: number;
  byCategory: Record<string, number>;
  /** null when no timed records exist for the day. */
  morning: number | null;
  evening: number | null;
  pickups: number | null;
  longest: number | null;
  sessions: number;
  first: string | null; // HH:mm
  last: string | null; // HH:mm
  /** Minutes of non-productive timed use inside enabled no-phone windows, by window id. */
  violations: Record<string, number>;
  /** Whether violation tracking was possible (timed data present). */
  timed: boolean;
}

export interface AreaFacts {
  min: number;
  q: number;
  c: number;
}

export interface DayFacts {
  day: Day;
  tracked: boolean;
  /** Minutes */
  total: number;
  core: number;
  byDomain: Record<string, number>;
  byActivity: Record<string, number>;
  sessions: number;
  completedSessions: number;
  unfinishedSessions: number;
  deepMin: number;
  normalMin: number;
  lightMin: number;
  deepBlocks: number[];
  deepInterruptions: number;
  /** Minute-weighted focus: avg = focusSum / focusMin */
  focusSum: number;
  focusMin: number;
  interruptions: number;
  switches: number;
  switchHours: number;
  startDelays: number[];
  valueMin: Record<string, number>;
  learning: { consumption: number; retrieval: number; production: number; meta: number };
  systemMin: number;
  adminMin: number;
  german: {
    min: number;
    active: number;
    passive: number;
    bySkill: Record<string, number>;
    words: number;
    speakingMin: number;
    conversations: number;
    exercises: number;
    newWords: number;
    vocabReviewed: number;
    vocabCorrect: number;
    writtenWordsEval: number;
    writtenErrors: number;
    spokenMinEval: number;
    spokenErrors: number;
    errorsByCat: Record<string, number>;
  };
  law: {
    min: number;
    readingMin: number;
    retrievalMin: number;
    productionMin: number;
    byArea: Record<string, AreaFacts>;
    questions: number;
    correct: number;
    correctConf: number;
    correctUnsure: number;
    wrongConf: number;
    wrongUnsure: number;
    qMinutes: number;
    pages: number;
    cases: number;
    memos: number;
    contracts: number;
    analyses: number;
    drafts: number;
  };
  phone: PhoneFacts | null;
  plan: { planned: number; available: number | null; energy: number | null; mode: string | null } | null;
  tasks: { planned: number; completed: number; abandoned: number; postponed: number; started: number };
  recovery: { sleepH: number | null; sleepQ: number | null; energy: number | null; fatigue: number | null; recovery: number | null } | null;
  review: { executed: string; durationSec: number | null } | null;
  checkin: { wake: string | null; available: number | null; energy: number | null } | null;
  protocol: { done: number; total: number } | null;
}

export interface SessionLite {
  id: string;
  day: Day;
  domain: string;
  activity: string;
  area: string | null;
  title: string | null;
  mode: string;
  depth: Depth;
  depthSource: "user" | "auto";
  start: string;
  end: string | null;
  minutes: number;
  plannedStart: string | null;
  startDelay: number | null;
  focus: number | null;
  interruptions: number | null;
  switches: number | null;
  status: string;
  words: number;
  speakingMin: number;
  questions: number;
  pages: number;
  cases: number;
  valueClass: string;
  notes: string | null;
}

export interface PhoneTimed {
  id: string;
  day: Day;
  category: string;
  minutes: number;
  start: string;
  end: string;
  productive: boolean;
}

export interface Goal {
  id: string;
  title: string;
  domain: string;
  kind: "cumulative" | "rate" | "level" | "manual";
  metricKey: string | null;
  target: number;
  unit: string;
  startDate: Day;
  deadline: Day | null;
  weight: number;
  tier: "PRIMARY" | "SECONDARY" | "MAINTENANCE";
  leading: string[];
  direction: "up" | "down";
  status: string;
  progress: { date: Day; value: number }[];
}

export interface TestResult {
  id: string;
  date: Day;
  domain: string;
  kind: string;
  name: string;
  skill: string | null;
  area: string | null;
  score: number;
  maxScore: number;
  pct: number;
  level: string | null;
  ref: string | null;
}

export interface Experiment {
  id: string;
  title: string;
  hypothesis: string;
  change: string | null;
  metrics: string[];
  primaryMetric: string;
  baselineDays: number;
  durationDays: number;
  startDate: Day;
  status: string;
  decision: string | null;
  note: string | null;
}

export interface Intervention {
  id: string;
  bottleneck: string;
  action: string;
  metricKey: string;
  direction: "up" | "down";
  durationDays: number;
  startDate: Day;
  endedAt: Day | null;
  note: string | null;
}

export interface Recommendation {
  id: string;
  issuedDay: Day;
  ruleId: string;
  title: string;
  metricKey: string | null;
  direction: "up" | "down" | null;
  baselineValue: number | null;
  horizonDays: number;
  status: string;
  statusDay: Day | null;
}

export interface ForecastRecord {
  id: string;
  createdAt: string;
  goalId: string | null;
  metricKey: string;
  method: string;
  horizonDate: Day;
  projectedValue: number | null;
  projectedDate: Day | null;
  p10: number | null;
  p90: number | null;
  assumptions: string[];
}

export interface Milestone {
  id: string;
  date: Day;
  kind: string;
  title: string;
  ref: string | null;
  notes: string | null;
}

export interface Competency {
  id: string;
  name: string;
  domain: string;
  tier: string | null;
  evidence: { id: string; type: string; title: string; date: Day; score: number | null; ref: string | null }[];
}

export interface Protocol {
  id: string;
  name: string;
  steps: { id: string; time?: string; label: string }[];
  active: boolean;
}

export interface TaskRow {
  id: string;
  title: string;
  domain: string;
  plannedDay: Day;
  estMinutes: number | null;
  priority: number | null;
  status: string;
  postponeCount: number;
}

export interface RetentionBucket {
  area: string;
  bucket: string; // first | same | 1D | 7D | 30D | 90D | 180D
  n: number;
  c: number;
  n90: number;
  c90: number;
}

export interface TopicStat {
  area: string;
  topic: string;
  lastDay: Day;
  reviewDays: number;
  n: number;
  c: number;
  lastN: number;
  lastC: number;
}

export interface HourStat {
  hour: number;
  n: number;
  c: number;
}

export interface VocabWord {
  word: string;
  reviewed: number;
  correct: number;
}

export interface Dataset {
  asOf: Day;
  firstDay: Day | null;
  days: DayFacts[];
  sessions: SessionLite[];
  phoneTimed: PhoneTimed[];
  settings: Settings;
  settingsVersions: SettingsVersion[];
  settingsAt: (day: Day) => Settings;
  goals: Goal[];
  tests: TestResult[];
  experiments: Experiment[];
  interventions: Intervention[];
  recommendations: Recommendation[];
  forecasts: ForecastRecord[];
  milestones: Milestone[];
  competencies: Competency[];
  protocols: Protocol[];
  tasks: TaskRow[];
  retention: RetentionBucket[];
  topics: TopicStat[];
  hourAccuracy: HourStat[];
  vocabWords: VocabWord[];
  activeSession: SessionLite | null;
  ux: { entries: number; medianMs: number | null; abandoned: number };
  lastEventId: number;
}
