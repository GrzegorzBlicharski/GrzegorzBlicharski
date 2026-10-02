/**
 * Event catalog & validation. Every append is validated against a small declarative schema.
 * Keep schemas permissive for optional fields and strict for identity, enums and ranges.
 */
import { isDay, isLocalDateTime } from "@/core/dates";
import {
  ACTIVITIES,
  SESSION_DOMAINS,
  PHONE_CATEGORIES,
  TEST_KINDS,
  MILESTONE_KINDS,
  EVIDENCE_TYPES,
} from "@/domains/catalog";

type Rule =
  | { t: "string"; req?: boolean; enum?: readonly string[]; max?: number }
  | { t: "number"; req?: boolean; min?: number; max?: number; int?: boolean }
  | { t: "boolean"; req?: boolean }
  | { t: "day"; req?: boolean }
  | { t: "datetime"; req?: boolean }
  | { t: "hm"; req?: boolean }
  | { t: "object"; req?: boolean }
  | { t: "array"; req?: boolean };

type Schema = Record<string, Rule>;

const S = (req = false, extra: Partial<{ enum: readonly string[]; max: number }> = {}): Rule => ({ t: "string", req, ...extra });
const N = (req = false, min?: number, max?: number, int = false): Rule => ({ t: "number", req, min, max, int });
const D = (req = false): Rule => ({ t: "day", req });
const DT = (req = false): Rule => ({ t: "datetime", req });
const O = (req = false): Rule => ({ t: "object", req });
const A = (req = false): Rule => ({ t: "array", req });
const B = (req = false): Rule => ({ t: "boolean", req });
const HM = (req = false): Rule => ({ t: "hm", req });

const sessionCore: Schema = {
  sessionId: S(true),
  domain: S(true, { enum: SESSION_DOMAINS }),
  activity: S(true, { enum: ACTIVITIES }),
  area: S(),
  title: S(false, { max: 300 }),
  plannedStart: DT(),
  plannedMinutes: N(false, 0, 1440),
  depth: S(false, { enum: ["LIGHT", "NORMAL", "DEEP"] }),
  mode: S(false, { enum: ["active", "passive"] }),
  taskId: S(),
};

const sessionEnd: Schema = {
  focus: N(false, 1, 5),
  interruptions: N(false, 0, 500, true),
  contextSwitches: N(false, 0, 500, true),
  output: O(),
  notes: S(false, { max: 5000 }),
  unfinished: B(),
  depth: S(false, { enum: ["LIGHT", "NORMAL", "DEEP"] }),
};

export const EVENT_SCHEMAS = {
  SESSION_STARTED: sessionCore,
  SESSION_PAUSED: { sessionId: S(true) },
  SESSION_RESUMED: { sessionId: S(true) },
  SESSION_COMPLETED: { sessionId: S(true), ...sessionEnd },
  SESSION_LOGGED: { ...sessionCore, ...sessionEnd, start: DT(true), end: DT(), minutes: N(false, 0, 1440) },
  SESSION_UPDATED: { sessionId: S(true), patch: O(true) },
  SESSION_DELETED: { sessionId: S(true) },

  DAY_PLANNED: {
    day: D(true),
    plannedMinutes: N(true, 0, 1440),
    byDomain: O(),
    availableMinutes: N(false, 0, 1440),
    energy: N(false, 1, 5),
    mode: S(false, { enum: ["minimum", "normal", "high"] }),
    blocks: A(),
  },
  TASK_CREATED: {
    taskId: S(true),
    title: S(true, { max: 300 }),
    domain: S(true, { enum: SESSION_DOMAINS }),
    plannedDay: D(true),
    estMinutes: N(false, 0, 1440),
    priority: N(false, 1, 5),
  },
  TASK_STATUS_CHANGED: {
    taskId: S(true),
    status: S(true, { enum: ["planned", "started", "completed", "abandoned", "postponed"] }),
    newDay: D(),
  },
  TASK_UPDATED: { taskId: S(true), patch: O(true) },
  TASK_DELETED: { taskId: S(true) },
  MORNING_CHECKIN: { day: D(true), wakeTime: HM(), availableMinutes: N(false, 0, 1440), energy: N(false, 1, 5) },
  DAILY_REVIEW_COMPLETED: {
    day: D(true),
    executed: S(true, { enum: ["yes", "partial", "no"] }),
    blocked: S(false, { max: 1000 }),
    worked: S(false, { max: 1000 }),
    tomorrowPriority: S(false, { max: 300 }),
    durationSec: N(false, 0, 36000),
  },
  PROTOCOL_DEFINED: { protocolId: S(true), name: S(true, { max: 120 }), steps: A(true) },
  PROTOCOL_UPDATED: { protocolId: S(true), patch: O(true) },
  PROTOCOL_DELETED: { protocolId: S(true) },
  PROTOCOL_RUN_LOGGED: { day: D(true), protocolId: S(true), completedStepIds: A(true) },

  PHONE_USAGE_ADDED: {
    usageId: S(true),
    day: D(true),
    category: S(true, { enum: PHONE_CATEGORIES }),
    minutes: N(true, 0, 1440),
    start: DT(),
    end: DT(),
    app: S(false, { max: 120 }),
    pickups: N(false, 0, 2000, true),
  },
  PHONE_USAGE_DELETED: { usageId: S(true) },
  PHONE_DAY_SUMMARY: {
    day: D(true),
    pickups: N(false, 0, 2000, true),
    firstUse: HM(),
    lastUse: HM(),
    longestSessionMin: N(false, 0, 1440),
  },

  GERMAN_WRITING_EVALUATED: { evalId: S(true), day: D(true), words: N(true, 1, 100000, true), errors: O(true), ref: S() },
  GERMAN_SPEAKING_EVALUATED: { evalId: S(true), day: D(true), minutes: N(true, 0.1, 600), errors: O(true), ref: S() },
  VOCAB_REVIEW_LOGGED: {
    day: D(true),
    reviewed: N(true, 0, 100000, true),
    correct: N(true, 0, 100000, true),
    newWords: N(false, 0, 100000, true),
    word: S(false, { max: 200 }),
  },

  QUESTION_ANSWERED: {
    attemptId: S(true),
    area: S(true, { max: 80 }),
    topic: S(false, { max: 200 }),
    correct: B(true),
    confidence: S(true, { enum: ["high", "low"] }),
    responseSec: N(false, 0, 36000),
    difficulty: N(false, 1, 3, true),
    setId: S(),
  },
  QUESTION_SET_LOGGED: {
    attemptId: S(true),
    area: S(true, { max: 80 }),
    topic: S(false, { max: 200 }),
    total: N(true, 1, 100000, true),
    correct: N(true, 0, 100000, true),
    wrongConfident: N(false, 0, 100000, true),
    correctUnsure: N(false, 0, 100000, true),
    minutes: N(false, 0, 1440),
    difficulty: N(false, 1, 3, true),
  },

  TEST_RECORDED: {
    testId: S(true),
    date: D(true),
    domain: S(true, { enum: SESSION_DOMAINS }),
    kind: S(true, { enum: TEST_KINDS }),
    name: S(true, { max: 200 }),
    skill: S(false, { max: 80 }),
    area: S(false, { max: 80 }),
    score: N(true, 0),
    maxScore: N(true, 0.0001),
    level: S(false, { max: 10 }),
    ref: S(false, { max: 1000 }),
  },
  TEST_DELETED: { testId: S(true) },

  GOAL_CREATED: {
    goalId: S(true),
    title: S(true, { max: 200 }),
    domain: S(true, { enum: SESSION_DOMAINS }),
    kind: S(true, { enum: ["cumulative", "rate", "level", "manual"] }),
    metricKey: S(),
    target: N(true),
    unit: S(true, { max: 30 }),
    startDate: D(true),
    deadline: D(),
    weight: N(true, 1, 5),
    tier: S(true, { enum: ["PRIMARY", "SECONDARY", "MAINTENANCE"] }),
    leading: A(),
    direction: S(false, { enum: ["up", "down"] }),
  },
  GOAL_UPDATED: { goalId: S(true), patch: O(true) },
  GOAL_PROGRESS_RECORDED: { goalId: S(true), date: D(true), value: N(true) },
  GOAL_STATUS_CHANGED: { goalId: S(true), status: S(true, { enum: ["active", "achieved", "paused", "dropped"] }) },
  FORECAST_RECORDED: {
    forecastId: S(true),
    goalId: S(),
    metricKey: S(true),
    method: S(true),
    horizonDate: D(true),
    projectedValue: N(),
    projectedDate: D(),
    p10: N(),
    p90: N(),
    assumptions: A(),
  },

  EXPERIMENT_CREATED: {
    experimentId: S(true),
    title: S(true, { max: 200 }),
    hypothesis: S(true, { max: 1000 }),
    change: S(false, { max: 1000 }),
    metrics: A(true),
    primaryMetric: S(true),
    baselineDays: N(true, 7, 365, true),
    durationDays: N(true, 7, 365, true),
    startDate: D(true),
  },
  EXPERIMENT_UPDATED: { experimentId: S(true), patch: O(true) },
  EXPERIMENT_CONCLUDED: {
    experimentId: S(true),
    decision: S(true, { enum: ["adopt", "reject", "extend", "inconclusive"] }),
    note: S(false, { max: 2000 }),
  },
  INTERVENTION_STARTED: {
    interventionId: S(true),
    bottleneck: S(true, { max: 300 }),
    action: S(true, { max: 1000 }),
    metricKey: S(true),
    direction: S(true, { enum: ["up", "down"] }),
    durationDays: N(true, 7, 365, true),
    startDate: D(true),
  },
  INTERVENTION_ENDED: { interventionId: S(true), note: S(false, { max: 2000 }) },
  RECOMMENDATION_ISSUED: {
    recId: S(true),
    ruleId: S(true),
    title: S(true, { max: 300 }),
    metricKey: S(),
    direction: S(false, { enum: ["up", "down"] }),
    baselineValue: N(),
    horizonDays: N(true, 1, 365, true),
  },
  RECOMMENDATION_STATUS_CHANGED: { recId: S(true), status: S(true, { enum: ["accepted", "rejected", "implemented"] }) },

  RECOVERY_LOGGED: {
    day: D(true),
    sleepHours: N(false, 0, 24),
    sleepQuality: N(false, 1, 5),
    energy: N(false, 1, 5),
    fatigue: N(false, 1, 5),
    recovery: N(false, 1, 5),
  },

  COMPETENCY_DEFINED: { competencyId: S(true), name: S(true, { max: 120 }), domain: S(true, { enum: SESSION_DOMAINS }), tier: S() },
  COMPETENCY_EVIDENCE_ADDED: {
    evidenceId: S(true),
    competencyId: S(true),
    type: S(true, { enum: EVIDENCE_TYPES }),
    title: S(true, { max: 300 }),
    date: D(true),
    score: N(),
    ref: S(false, { max: 1000 }),
  },
  MILESTONE_RECORDED: {
    milestoneId: S(true),
    date: D(true),
    kind: S(true, { enum: MILESTONE_KINDS }),
    title: S(true, { max: 300 }),
    ref: S(false, { max: 1000 }),
    notes: S(false, { max: 5000 }),
  },
  MILESTONE_DELETED: { milestoneId: S(true) },
  NOTE_ADDED: {
    noteId: S(true),
    day: D(true),
    kind: S(true, { enum: ["distraction", "insight", "general"] }),
    text: S(true, { max: 10000 }),
    sessionId: S(),
  },

  SETTINGS_CHANGED: { patch: O(true), effectiveFrom: D(true) },
  UX_ENTRY_TIMED: { form: S(true, { max: 60 }), durationMs: N(true, 0), abandoned: B(true) },
  IMPORT_COMPLETED: { source: S(true), count: N(true, 0), note: S() },
} satisfies Record<string, Schema>;

export type EventType = keyof typeof EVENT_SCHEMAS;
export const EVENT_TYPES = Object.keys(EVENT_SCHEMAS) as EventType[];

/** Payload schema versions (bump + add upcaster when a payload shape changes). */
export const SCHEMA_VERSION: Partial<Record<EventType, number>> = {};
export function schemaVersionOf(type: EventType): number {
  return SCHEMA_VERSION[type] ?? 1;
}

/** Entity id field per type — used for the envelope's entity_id column. */
const ENTITY_FIELDS = [
  "sessionId",
  "taskId",
  "usageId",
  "evalId",
  "attemptId",
  "testId",
  "goalId",
  "forecastId",
  "experimentId",
  "interventionId",
  "recId",
  "competencyId",
  "milestoneId",
  "noteId",
  "protocolId",
];

export function entityIdOf(payload: Record<string, unknown>): string | null {
  for (const f of ENTITY_FIELDS) if (typeof payload[f] === "string") return payload[f] as string;
  if (typeof payload.day === "string") return payload.day as string;
  return null;
}

export interface ValidationResult {
  ok: boolean;
  errors: string[];
}

export function validateEvent(type: string, payload: unknown): ValidationResult {
  const errors: string[] = [];
  if (!(type in EVENT_SCHEMAS)) return { ok: false, errors: [`unknown event type: ${type}`] };
  if (typeof payload !== "object" || payload === null || Array.isArray(payload)) {
    return { ok: false, errors: ["payload must be an object"] };
  }
  const schema = EVENT_SCHEMAS[type as EventType] as Schema;
  const p = payload as Record<string, unknown>;
  for (const [key, rule] of Object.entries(schema)) {
    const v = p[key];
    if (v === undefined || v === null) {
      if (rule.req) errors.push(`${key}: required`);
      continue;
    }
    switch (rule.t) {
      case "string":
        if (typeof v !== "string") errors.push(`${key}: must be string`);
        else {
          if (rule.req && v.trim() === "") errors.push(`${key}: must not be empty`);
          if (rule.enum && !rule.enum.includes(v)) errors.push(`${key}: invalid value "${v}"`);
          if (rule.max && v.length > rule.max) errors.push(`${key}: too long`);
        }
        break;
      case "number":
        if (typeof v !== "number" || !Number.isFinite(v)) errors.push(`${key}: must be a finite number`);
        else {
          if (rule.min !== undefined && v < rule.min) errors.push(`${key}: must be ≥ ${rule.min}`);
          if (rule.max !== undefined && v > rule.max) errors.push(`${key}: must be ≤ ${rule.max}`);
          if (rule.int && !Number.isInteger(v)) errors.push(`${key}: must be an integer`);
        }
        break;
      case "boolean":
        if (typeof v !== "boolean") errors.push(`${key}: must be boolean`);
        break;
      case "day":
        if (!isDay(v)) errors.push(`${key}: must be YYYY-MM-DD`);
        break;
      case "datetime":
        if (!isLocalDateTime(v)) errors.push(`${key}: must be YYYY-MM-DDTHH:mm`);
        break;
      case "hm":
        if (typeof v !== "string" || !/^([01]\d|2[0-3]):[0-5]\d$/.test(v)) errors.push(`${key}: must be HH:mm`);
        break;
      case "object":
        if (typeof v !== "object" || Array.isArray(v)) errors.push(`${key}: must be an object`);
        break;
      case "array":
        if (!Array.isArray(v)) errors.push(`${key}: must be an array`);
        break;
    }
  }
  // Cross-field rules
  if (type === "QUESTION_SET_LOGGED" && typeof p.total === "number" && typeof p.correct === "number" && p.correct > p.total) {
    errors.push("correct: cannot exceed total");
  }
  if (type === "VOCAB_REVIEW_LOGGED" && typeof p.reviewed === "number" && typeof p.correct === "number" && p.correct > p.reviewed) {
    errors.push("correct: cannot exceed reviewed");
  }
  if (type === "SESSION_LOGGED" && p.end === undefined && p.minutes === undefined) {
    errors.push("end or minutes: one is required");
  }
  if (type === "SESSION_LOGGED" && typeof p.start === "string" && typeof p.end === "string" && p.end < p.start) {
    errors.push("end: must be after start");
  }
  if (type === "GERMAN_WRITING_EVALUATED" || type === "GERMAN_SPEAKING_EVALUATED") {
    const errs = p.errors as Record<string, unknown> | undefined;
    if (errs && typeof errs === "object") {
      for (const [k, c] of Object.entries(errs)) {
        if (typeof c !== "number" || c < 0 || !Number.isFinite(c)) errors.push(`errors.${k}: must be a non-negative number`);
      }
    }
  }
  if (type === "SESSION_COMPLETED" || type === "SESSION_LOGGED") {
    const out = p.output as Record<string, unknown> | undefined;
    if (out && typeof out === "object") {
      for (const [k, c] of Object.entries(out)) {
        if (typeof c !== "number" || c < 0 || !Number.isFinite(c)) errors.push(`output.${k}: must be a non-negative number`);
      }
    }
  }
  return { ok: errors.length === 0, errors };
}

export interface StoredEvent {
  id: number;
  eventId: string;
  type: EventType;
  schemaVersion: number;
  occurredAt: string;
  recordedAt: string;
  entityId: string | null;
  source: string;
  payload: Record<string, unknown>;
}

export interface NewEvent {
  type: EventType;
  payload: Record<string, unknown>;
  occurredAt?: string;
  source?: string;
  eventId?: string;
}
