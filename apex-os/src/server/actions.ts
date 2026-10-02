"use server";
/**
 * Server actions — the only write path from the UI. Every action appends validated events; projections and
 * all derived numbers update automatically.
 */
import { revalidatePath } from "next/cache";
import { getDb } from "@/data/db";
import { appendEvents, rebuildProjections, EventValidationError, countEvents } from "@/data/store";
import type { NewEvent } from "@/events/catalog";
import { newId } from "@/core/rng";
import { addDays, nowLocal, isDay } from "@/core/dates";
import { getAnalysis, getDataset, currentDay } from "./context";
import { goalStatus, monteCarlo } from "@/forecasting/goals";
import { activeExperiments } from "@/experiments/evaluate";
import { rangeAgg } from "@/metrics/series";
import { buildPlan, type PlanMode } from "@/coach/planner";
import { importPhoneCsv, restoreBackup, importEvents } from "@/data/backup";
import { generateFictional } from "@/data/generator";
import { OUTPUT_FIELDS } from "@/domains/catalog";

export interface ActionResult {
  ok: boolean;
  message: string;
  at: number;
}

const ok = (message: string): ActionResult => ({ ok: true, message, at: Date.now() });
const fail = (message: string): ActionResult => ({ ok: false, message, at: Date.now() });

function s(fd: FormData, k: string): string | undefined {
  const v = fd.get(k);
  if (v == null) return undefined;
  const t = String(v).trim();
  return t === "" ? undefined : t;
}
function n(fd: FormData, k: string): number | undefined {
  const v = s(fd, k);
  if (v == null) return undefined;
  const x = Number(v.replace(",", "."));
  return Number.isFinite(x) ? x : undefined;
}
function b(fd: FormData, k: string): boolean {
  const v = fd.get(k);
  return v === "on" || v === "true" || v === "1";
}
function dt(day: string | undefined, hm: string | undefined): string | undefined {
  if (!hm) return undefined;
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(hm)) return hm.slice(0, 16);
  return `${day ?? currentDay()}T${hm}`;
}

function uxEvent(fd: FormData, form: string): NewEvent[] {
  const ms = n(fd, "_uxMs");
  return ms != null ? [{ type: "UX_ENTRY_TIMED", payload: { form, durationMs: Math.round(ms), abandoned: false } }] : [];
}

function write(events: NewEvent[], message: string): ActionResult {
  try {
    appendEvents(getDb(), events);
    revalidatePath("/", "layout");
    return ok(message);
  } catch (e) {
    if (e instanceof EventValidationError) return fail(`${e.type}: ${e.errors.join("; ")}`);
    return fail(e instanceof Error ? e.message : String(e));
  }
}

function outputFrom(fd: FormData): Record<string, number> | undefined {
  const out: Record<string, number> = {};
  for (const f of OUTPUT_FIELDS) {
    const v = n(fd, `out_${f}`);
    if (v != null && v > 0) out[f] = v;
  }
  return Object.keys(out).length ? out : undefined;
}

// ───────────────────────── Sessions / timer ─────────────────────────

export async function startSession(_: ActionResult | null, fd: FormData): Promise<ActionResult> {
  const ds = getDataset();
  if (ds.activeSession) return fail("A timer is already running — finish it first.");
  const day = currentDay();
  return write(
    [
      {
        type: "SESSION_STARTED",
        payload: {
          sessionId: newId("s"),
          domain: s(fd, "domain") ?? "GERMAN",
          activity: s(fd, "activity") ?? "other",
          area: s(fd, "area"),
          title: s(fd, "title"),
          plannedStart: dt(day, s(fd, "plannedStart")),
          plannedMinutes: n(fd, "plannedMinutes"),
          mode: s(fd, "mode"),
          depth: s(fd, "depth"),
        },
      },
    ],
    "Timer started",
  );
}

export async function pauseSession(fd: FormData): Promise<void> {
  const id = s(fd, "sessionId");
  if (id) write([{ type: "SESSION_PAUSED", payload: { sessionId: id } }], "Paused");
}

export async function resumeSession(fd: FormData): Promise<void> {
  const id = s(fd, "sessionId");
  if (id) write([{ type: "SESSION_RESUMED", payload: { sessionId: id } }], "Resumed");
}

export async function completeSession(_: ActionResult | null, fd: FormData): Promise<ActionResult> {
  const ds = getDataset();
  const active = ds.activeSession;
  const id = s(fd, "sessionId");
  if (!active || active.id !== id) return fail("No running session.");
  const events: NewEvent[] = [
    {
      type: "SESSION_COMPLETED",
      payload: {
        sessionId: id,
        focus: n(fd, "focus"),
        interruptions: n(fd, "interruptions"),
        contextSwitches: n(fd, "contextSwitches"),
        output: outputFrom(fd),
        notes: s(fd, "notes"),
        unfinished: b(fd, "unfinished"),
        depth: s(fd, "depth"),
      },
    },
  ];
  const qTotal = n(fd, "qTotal");
  if (qTotal && qTotal > 0)
    events.push({
      type: "QUESTION_SET_LOGGED",
      payload: { attemptId: newId("q"), area: active.area ?? s(fd, "qArea") ?? "General", topic: s(fd, "qTopic"), total: qTotal, correct: Math.min(qTotal, n(fd, "qCorrect") ?? 0), wrongConfident: n(fd, "qWrongConf"), correctUnsure: n(fd, "qCorrectUnsure") },
    });
  if (s(fd, "distraction")) events.push({ type: "NOTE_ADDED", payload: { noteId: newId("n"), day: active.day, kind: "distraction", text: s(fd, "distraction")!, sessionId: id } });
  return write([...events, ...uxEvent(fd, "complete-session")], "Session saved");
}

export async function logSession(_: ActionResult | null, fd: FormData): Promise<ActionResult> {
  const day = s(fd, "day") ?? currentDay();
  const start = dt(day, s(fd, "start"));
  const minutes = n(fd, "minutes");
  const end = dt(day, s(fd, "end"));
  if (!start) return fail("Start time is required.");
  const id = newId("s");
  const events: NewEvent[] = [
    {
      type: "SESSION_LOGGED",
      payload: {
        sessionId: id,
        domain: s(fd, "domain") ?? "GERMAN",
        activity: s(fd, "activity") ?? "other",
        area: s(fd, "area"),
        title: s(fd, "title"),
        start,
        end,
        minutes: end ? undefined : minutes,
        plannedStart: dt(day, s(fd, "plannedStart")),
        focus: n(fd, "focus"),
        interruptions: n(fd, "interruptions"),
        contextSwitches: n(fd, "contextSwitches"),
        output: outputFrom(fd),
        notes: s(fd, "notes"),
        unfinished: b(fd, "unfinished"),
        mode: s(fd, "mode"),
        depth: s(fd, "depth"),
      },
    },
  ];
  const qTotal = n(fd, "qTotal");
  if (qTotal && qTotal > 0)
    events.push({
      type: "QUESTION_SET_LOGGED",
      occurredAt: end ? `${end}:00` : undefined,
      payload: { attemptId: newId("q"), area: s(fd, "area") ?? "General", topic: s(fd, "qTopic"), total: qTotal, correct: Math.min(qTotal, n(fd, "qCorrect") ?? 0), wrongConfident: n(fd, "qWrongConf"), minutes: minutes },
    });
  return write([...events, ...uxEvent(fd, "log-session")], "Session logged");
}

export async function updateSession(_: ActionResult | null, fd: FormData): Promise<ActionResult> {
  const id = s(fd, "sessionId");
  if (!id) return fail("Missing session id");
  const patch: Record<string, unknown> = {};
  for (const k of ["domain", "activity", "area", "title", "notes", "depth", "mode"]) {
    const v = fd.get(k);
    if (v != null) patch[k] = String(v);
  }
  for (const k of ["focus", "interruptions", "contextSwitches", "minutes"]) {
    const v = n(fd, k);
    if (v != null) patch[k] = v;
  }
  const day = s(fd, "day");
  const st = s(fd, "start");
  const en = s(fd, "end");
  if (st) patch.start = dt(day, st);
  if (en) patch.end = dt(day, en);
  const out = outputFrom(fd);
  if (out) patch.output = out;
  if (fd.has("unfinished")) patch.unfinished = b(fd, "unfinished");
  return write([{ type: "SESSION_UPDATED", payload: { sessionId: id, patch } }], "Session updated (previous version kept in the event log)");
}

export async function deleteSession(fd: FormData): Promise<void> {
  const id = s(fd, "sessionId");
  if (id) write([{ type: "SESSION_DELETED", payload: { sessionId: id } }], "Deleted");
}

// ───────────────────────── Quick logs ─────────────────────────

export async function addPhoneUsage(_: ActionResult | null, fd: FormData): Promise<ActionResult> {
  const day = s(fd, "day") ?? currentDay();
  const events: NewEvent[] = [];
  // Either a single category entry or a multi-category quick grid (cat_<Category>=minutes).
  for (const [k, v] of fd.entries()) {
    if (!k.startsWith("cat_")) continue;
    const minutes = Number(String(v).replace(",", "."));
    if (!Number.isFinite(minutes) || minutes <= 0) continue;
    events.push({ type: "PHONE_USAGE_ADDED", payload: { usageId: newId("ph"), day, category: k.slice(4), minutes } });
  }
  const minutes = n(fd, "minutes");
  if (minutes != null && minutes > 0) {
    events.push({
      type: "PHONE_USAGE_ADDED",
      payload: { usageId: newId("ph"), day, category: s(fd, "category") ?? "Other", minutes, start: dt(day, s(fd, "start")), end: dt(day, s(fd, "end")), app: s(fd, "app") },
    });
  }
  const pickups = n(fd, "pickups");
  if (pickups != null || s(fd, "firstUse") || s(fd, "lastUse"))
    events.push({ type: "PHONE_DAY_SUMMARY", payload: { day, pickups: pickups != null ? Math.round(pickups) : undefined, firstUse: s(fd, "firstUse"), lastUse: s(fd, "lastUse") } });
  if (!events.length) return fail("Enter minutes for at least one category.");
  return write([...events, ...uxEvent(fd, "phone")], `Phone data saved (${events.length} entr${events.length === 1 ? "y" : "ies"})`);
}

export async function deletePhoneUsage(fd: FormData): Promise<void> {
  const id = s(fd, "usageId");
  if (id) write([{ type: "PHONE_USAGE_DELETED", payload: { usageId: id } }], "Deleted");
}

export async function logQuestionSet(_: ActionResult | null, fd: FormData): Promise<ActionResult> {
  const total = n(fd, "total");
  if (!total) return fail("Total questions required.");
  return write(
    [
      {
        type: "QUESTION_SET_LOGGED",
        payload: {
          attemptId: newId("q"),
          area: s(fd, "area") ?? "KC",
          topic: s(fd, "topic"),
          total,
          correct: n(fd, "correct") ?? 0,
          wrongConfident: n(fd, "wrongConfident"),
          correctUnsure: n(fd, "correctUnsure"),
          minutes: n(fd, "minutes"),
          difficulty: n(fd, "difficulty"),
        },
      },
      ...uxEvent(fd, "questions"),
    ],
    "Question set saved",
  );
}

export async function logGermanEval(_: ActionResult | null, fd: FormData): Promise<ActionResult> {
  const kind = s(fd, "kind") ?? "writing";
  const day = s(fd, "day") ?? currentDay();
  const errors: Record<string, number> = {};
  for (const [k, v] of fd.entries()) {
    if (!k.startsWith("err_")) continue;
    const c = Number(v);
    if (Number.isFinite(c) && c > 0) errors[k.slice(4)] = c;
  }
  const evalId = newId("ge");
  const ev: NewEvent =
    kind === "writing"
      ? { type: "GERMAN_WRITING_EVALUATED", payload: { evalId, day, words: n(fd, "words") ?? 0, errors, ref: s(fd, "ref") } }
      : { type: "GERMAN_SPEAKING_EVALUATED", payload: { evalId, day, minutes: n(fd, "minutes") ?? 0, errors, ref: s(fd, "ref") } };
  return write([ev, ...uxEvent(fd, "german-eval")], "Evaluation saved");
}

export async function logVocab(_: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return write(
    [{ type: "VOCAB_REVIEW_LOGGED", payload: { day: s(fd, "day") ?? currentDay(), reviewed: n(fd, "reviewed") ?? 0, correct: n(fd, "correct") ?? 0, newWords: n(fd, "newWords") } }, ...uxEvent(fd, "vocab")],
    "Vocabulary review saved",
  );
}

export async function logRecovery(_: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return write(
    [
      {
        type: "RECOVERY_LOGGED",
        payload: { day: s(fd, "day") ?? currentDay(), sleepHours: n(fd, "sleepHours"), sleepQuality: n(fd, "sleepQuality"), energy: n(fd, "energy"), fatigue: n(fd, "fatigue"), recovery: n(fd, "recovery") },
      },
      ...uxEvent(fd, "recovery"),
    ],
    "Recovery saved",
  );
}

export async function morningCheckin(_: ActionResult | null, fd: FormData): Promise<ActionResult> {
  const day = currentDay();
  const events: NewEvent[] = [{ type: "MORNING_CHECKIN", payload: { day, wakeTime: s(fd, "wakeTime"), availableMinutes: n(fd, "availableMinutes"), energy: n(fd, "energy") } }];
  return write([...events, ...uxEvent(fd, "morning")], "Check-in saved");
}

export async function eveningReview(_: ActionResult | null, fd: FormData): Promise<ActionResult> {
  const day = s(fd, "day") ?? currentDay();
  const ms = n(fd, "_uxMs");
  return write(
    [
      {
        type: "DAILY_REVIEW_COMPLETED",
        payload: { day, executed: s(fd, "executed") ?? "partial", blocked: s(fd, "blocked"), worked: s(fd, "worked"), tomorrowPriority: s(fd, "tomorrowPriority"), durationSec: ms != null ? Math.round(ms / 1000) : undefined },
      },
      ...uxEvent(fd, "evening-review"),
    ],
    "Review saved",
  );
}

export async function addNote(_: ActionResult | null, fd: FormData): Promise<ActionResult> {
  const text = s(fd, "text");
  if (!text) return fail("Empty note");
  return write([{ type: "NOTE_ADDED", payload: { noteId: newId("n"), day: s(fd, "day") ?? currentDay(), kind: s(fd, "kind") ?? "general", text } }], "Note saved");
}

// ───────────────────────── Plans & tasks ─────────────────────────

export async function acceptPlan(_: ActionResult | null, fd: FormData): Promise<ActionResult> {
  const { ds } = getAnalysis();
  const mode = (s(fd, "mode") as PlanMode) ?? "normal";
  const plan = buildPlan(ds, { availableMinutes: n(fd, "availableMinutes"), energy: n(fd, "energy") ?? null, mode, day: s(fd, "day") });
  const planned = n(fd, "plannedMinutes") ?? plan.totalMinutes;
  const byDomain: Record<string, number> = {};
  for (const b of plan.blocks) byDomain[b.domain] = (byDomain[b.domain] ?? 0) + b.minutes;
  return write(
    [{ type: "DAY_PLANNED", payload: { day: plan.day, plannedMinutes: planned, byDomain, availableMinutes: plan.availableMinutes, energy: n(fd, "energy"), mode, blocks: plan.blocks.map((b) => ({ domain: b.domain, activity: b.activity, start: b.start, minutes: b.minutes, label: b.label })) } }],
    `Plan saved: ${Math.round(planned)} min (${plan.realism.label})`,
  );
}

export async function setDayPlan(_: ActionResult | null, fd: FormData): Promise<ActionResult> {
  const planned = n(fd, "plannedMinutes");
  if (planned == null) return fail("Planned minutes required");
  return write([{ type: "DAY_PLANNED", payload: { day: s(fd, "day") ?? currentDay(), plannedMinutes: planned, availableMinutes: n(fd, "availableMinutes"), energy: n(fd, "energy") } }], "Plan saved");
}

export async function createTask(_: ActionResult | null, fd: FormData): Promise<ActionResult> {
  const title = s(fd, "title");
  if (!title) return fail("Title required");
  return write(
    [{ type: "TASK_CREATED", payload: { taskId: newId("t"), title, domain: s(fd, "domain") ?? "OTHER", plannedDay: s(fd, "plannedDay") ?? currentDay(), estMinutes: n(fd, "estMinutes"), priority: n(fd, "priority") } }],
    "Task added",
  );
}

export async function setTaskStatus(fd: FormData): Promise<void> {
  const id = s(fd, "taskId");
  const status = s(fd, "status");
  if (id && status) write([{ type: "TASK_STATUS_CHANGED", payload: { taskId: id, status, newDay: status === "postponed" ? addDays(currentDay(), 1) : undefined } }], "Task updated");
}

export async function deleteTask(fd: FormData): Promise<void> {
  const id = s(fd, "taskId");
  if (id) write([{ type: "TASK_DELETED", payload: { taskId: id } }], "Task deleted");
}

export async function defineProtocol(_: ActionResult | null, fd: FormData): Promise<ActionResult> {
  const name = s(fd, "name");
  const raw = s(fd, "steps") ?? "";
  const steps = raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l, i) => {
      const m = l.match(/^(\d{1,2}:\d{2})\s+(.*)$/);
      return { id: `st${i + 1}`, time: m ? m[1].padStart(5, "0") : undefined, label: m ? m[2] : l };
    });
  if (!name || !steps.length) return fail("Name and at least one step required");
  return write([{ type: "PROTOCOL_DEFINED", payload: { protocolId: s(fd, "protocolId") ?? newId("p"), name, steps } }], "Protocol saved");
}

export async function logProtocolRun(_: ActionResult | null, fd: FormData): Promise<ActionResult> {
  const id = s(fd, "protocolId");
  if (!id) return fail("Missing protocol");
  const done = fd.getAll("step").map(String);
  return write([{ type: "PROTOCOL_RUN_LOGGED", payload: { day: currentDay(), protocolId: id, completedStepIds: done } }], `Protocol logged (${done.length} steps)`);
}

export async function deleteProtocol(fd: FormData): Promise<void> {
  const id = s(fd, "protocolId");
  if (id) write([{ type: "PROTOCOL_DELETED", payload: { protocolId: id } }], "Deleted");
}

// ───────────────────────── Tests, goals, forecasts ─────────────────────────

export async function recordTest(_: ActionResult | null, fd: FormData): Promise<ActionResult> {
  const score = n(fd, "score");
  const max = n(fd, "maxScore") ?? 100;
  if (score == null) return fail("Score required");
  return write(
    [
      {
        type: "TEST_RECORDED",
        payload: { testId: newId("t"), date: s(fd, "date") ?? currentDay(), domain: s(fd, "domain") ?? "GERMAN", kind: s(fd, "kind") ?? "MOCK", name: s(fd, "name") ?? "Test", skill: s(fd, "skill"), area: s(fd, "area"), score, maxScore: max, level: s(fd, "level"), ref: s(fd, "ref") },
      },
    ],
    "Test recorded",
  );
}

export async function deleteTest(fd: FormData): Promise<void> {
  const id = s(fd, "testId");
  if (id) write([{ type: "TEST_DELETED", payload: { testId: id } }], "Deleted");
}

export async function createGoal(_: ActionResult | null, fd: FormData): Promise<ActionResult> {
  const title = s(fd, "title");
  const target = n(fd, "target");
  if (!title || target == null) return fail("Title and target required");
  const leading = (s(fd, "leading") ?? "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
  return write(
    [
      {
        type: "GOAL_CREATED",
        payload: {
          goalId: newId("g"),
          title,
          domain: s(fd, "domain") ?? "GERMAN",
          kind: s(fd, "kind") ?? "cumulative",
          metricKey: s(fd, "metricKey"),
          target,
          unit: s(fd, "unit") ?? "h",
          startDate: s(fd, "startDate") ?? currentDay(),
          deadline: s(fd, "deadline"),
          weight: n(fd, "weight") ?? 3,
          tier: s(fd, "tier") ?? "PRIMARY",
          leading,
          direction: s(fd, "direction") ?? "up",
        },
      },
    ],
    "Goal created",
  );
}

export async function updateGoal(_: ActionResult | null, fd: FormData): Promise<ActionResult> {
  const id = s(fd, "goalId");
  if (!id) return fail("Missing goal");
  const patch: Record<string, unknown> = {};
  for (const k of ["title", "deadline", "tier", "metricKey", "unit"]) if (s(fd, k)) patch[k] = s(fd, k);
  for (const k of ["target", "weight"]) if (n(fd, k) != null) patch[k] = n(fd, k);
  return write([{ type: "GOAL_UPDATED", payload: { goalId: id, patch } }], "Goal updated");
}

export async function goalProgress(_: ActionResult | null, fd: FormData): Promise<ActionResult> {
  const id = s(fd, "goalId");
  const value = n(fd, "value");
  if (!id || value == null) return fail("Value required");
  return write([{ type: "GOAL_PROGRESS_RECORDED", payload: { goalId: id, date: s(fd, "date") ?? currentDay(), value } }], "Progress recorded");
}

export async function setGoalStatus(fd: FormData): Promise<void> {
  const id = s(fd, "goalId");
  const status = s(fd, "status");
  if (id && status) write([{ type: "GOAL_STATUS_CHANGED", payload: { goalId: id, status } }], "Goal status changed");
}

/** Snapshot current forecasts for every cumulative goal so their accuracy can be measured later. */
export async function recordForecasts(): Promise<void> {
  const ds = getDataset();
  const events: NewEvent[] = [];
  for (const g of ds.goals.filter((x) => x.status === "active" && x.kind === "cumulative" && x.metricKey)) {
    const st = goalStatus(ds, g);
    if (st.current == null || st.rate30 == null) continue;
    const horizon = addDays(ds.asOf, 30);
    const mc = monteCarlo(ds, g);
    events.push({
      type: "FORECAST_RECORDED",
      payload: {
        forecastId: newId("f"),
        goalId: g.id,
        metricKey: g.metricKey!,
        method: "pace-30d",
        horizonDate: horizon,
        projectedValue: Math.round((st.current + st.rate30 * 30) * 10) / 10,
        projectedDate: mc.ok ? (mc.p50 ?? undefined) : (st.projectedDate ?? undefined),
        assumptions: ["30D rate continues for 30 days", ...(mc.ok ? mc.assumptions : [])],
      },
    });
  }
  if (events.length) write(events, "Forecasts recorded");
}

// ───────────────────────── Experiments & coach ─────────────────────────

export async function createExperiment(_: ActionResult | null, fd: FormData): Promise<ActionResult> {
  const ds = getDataset();
  const active = activeExperiments(ds).length;
  const max = ds.settings.maxConcurrentExperiments;
  if (active >= max && !b(fd, "override")) return fail(`${active} experiments already running (limit ${max}). Conclude one first — changing many parameters at once makes results unreadable.`);
  const metrics = fd.getAll("metrics").map(String).filter(Boolean);
  const primary = s(fd, "primaryMetric") ?? metrics[0];
  if (!s(fd, "title") || !s(fd, "hypothesis") || !primary) return fail("Title, hypothesis and primary metric required");
  return write(
    [
      {
        type: "EXPERIMENT_CREATED",
        payload: {
          experimentId: newId("e"),
          title: s(fd, "title"),
          hypothesis: s(fd, "hypothesis"),
          change: s(fd, "change"),
          metrics: metrics.length ? metrics : [primary],
          primaryMetric: primary,
          baselineDays: n(fd, "baselineDays") ?? 30,
          durationDays: n(fd, "durationDays") ?? 30,
          startDate: s(fd, "startDate") ?? currentDay(),
        },
      },
    ],
    "Experiment created",
  );
}

export async function concludeExperiment(fd: FormData): Promise<void> {
  const id = s(fd, "experimentId");
  const decision = s(fd, "decision");
  if (id && decision) write([{ type: "EXPERIMENT_CONCLUDED", payload: { experimentId: id, decision, note: s(fd, "note") } }], "Experiment concluded");
}

export async function startIntervention(_: ActionResult | null, fd: FormData): Promise<ActionResult> {
  return write(
    [
      {
        type: "INTERVENTION_STARTED",
        payload: {
          interventionId: newId("i"),
          bottleneck: s(fd, "bottleneck") ?? "Bottleneck",
          action: s(fd, "action") ?? "",
          metricKey: s(fd, "metricKey") ?? "productive.min",
          direction: s(fd, "direction") ?? "up",
          durationDays: n(fd, "durationDays") ?? 14,
          startDate: s(fd, "startDate") ?? currentDay(),
        },
      },
    ],
    "Intervention started",
  );
}

export async function endIntervention(fd: FormData): Promise<void> {
  const id = s(fd, "interventionId");
  if (id) write([{ type: "INTERVENTION_ENDED", payload: { interventionId: id } }], "Intervention ended");
}

export async function issueRecommendation(fd: FormData): Promise<void> {
  const { ds } = getAnalysis();
  const metricKey = s(fd, "metricKey");
  const baseline = metricKey ? rangeAgg(ds, metricKey, addDays(ds.asOf, -13), ds.asOf).value : null;
  const id = newId("r");
  const events: NewEvent[] = [
    {
      type: "RECOMMENDATION_ISSUED",
      payload: { recId: id, ruleId: s(fd, "ruleId") ?? "manual", title: s(fd, "title") ?? "Recommendation", metricKey, direction: s(fd, "direction"), baselineValue: baseline ?? undefined, horizonDays: n(fd, "horizonDays") ?? 14 },
    },
  ];
  const status = s(fd, "status");
  if (status) events.push({ type: "RECOMMENDATION_STATUS_CHANGED", payload: { recId: id, status } });
  write(events, "Recommendation tracked");
}

export async function setRecommendationStatus(fd: FormData): Promise<void> {
  const id = s(fd, "recId");
  const status = s(fd, "status");
  if (id && status) write([{ type: "RECOMMENDATION_STATUS_CHANGED", payload: { recId: id, status } }], "Updated");
}

// ───────────────────────── Career & timeline ─────────────────────────

export async function addMilestone(_: ActionResult | null, fd: FormData): Promise<ActionResult> {
  const title = s(fd, "title");
  if (!title) return fail("Title required");
  return write([{ type: "MILESTONE_RECORDED", payload: { milestoneId: newId("m"), date: s(fd, "date") ?? currentDay(), kind: s(fd, "kind") ?? "milestone", title, ref: s(fd, "ref"), notes: s(fd, "notes") } }], "Milestone recorded");
}

export async function deleteMilestone(fd: FormData): Promise<void> {
  const id = s(fd, "milestoneId");
  if (id) write([{ type: "MILESTONE_DELETED", payload: { milestoneId: id } }], "Deleted");
}

export async function defineCompetency(_: ActionResult | null, fd: FormData): Promise<ActionResult> {
  const name = s(fd, "name");
  if (!name) return fail("Name required");
  return write([{ type: "COMPETENCY_DEFINED", payload: { competencyId: newId("c"), name, domain: s(fd, "domain") ?? "CAREER" } }], "Competency added");
}

export async function addEvidence(_: ActionResult | null, fd: FormData): Promise<ActionResult> {
  const cid = s(fd, "competencyId");
  const title = s(fd, "title");
  if (!cid || !title) return fail("Competency and title required");
  return write(
    [{ type: "COMPETENCY_EVIDENCE_ADDED", payload: { evidenceId: newId("ev"), competencyId: cid, type: s(fd, "type") ?? "document", title, date: s(fd, "date") ?? currentDay(), score: n(fd, "score"), ref: s(fd, "ref") } }],
    "Evidence added",
  );
}

// ───────────────────────── Settings & data ─────────────────────────

export async function updateSettings(_: ActionResult | null, fd: FormData): Promise<ActionResult> {
  const raw = s(fd, "patch");
  const effectiveFrom = s(fd, "effectiveFrom") ?? currentDay();
  if (!isDay(effectiveFrom)) return fail("Invalid effective date");
  let patch: Record<string, unknown>;
  try {
    patch = JSON.parse(raw ?? "{}");
  } catch {
    return fail("Invalid JSON patch");
  }
  if (!Object.keys(patch).length) return fail("Nothing changed");
  return write([{ type: "SETTINGS_CHANGED", payload: { patch, effectiveFrom } }], `Settings saved as a new version effective ${effectiveFrom} (history kept)`);
}

export async function importPhoneCsvAction(_: ActionResult | null, fd: FormData): Promise<ActionResult> {
  const file = fd.get("file");
  if (!(file instanceof File) || file.size === 0) return fail("Choose a CSV file");
  try {
    const r = importPhoneCsv(getDb(), await file.text());
    revalidatePath("/", "layout");
    return r.errors.length ? { ok: r.imported > 0, message: `Imported ${r.imported} rows; ${r.errors.length} rejected: ${r.errors.slice(0, 3).join("; ")}`, at: Date.now() } : ok(`Imported ${r.imported} rows`);
  } catch (e) {
    return fail(e instanceof Error ? e.message : String(e));
  }
}

export async function restoreBackupAction(_: ActionResult | null, fd: FormData): Promise<ActionResult> {
  const file = fd.get("file");
  if (!(file instanceof File) || file.size === 0) return fail("Choose a backup file");
  if (s(fd, "confirm") !== "RESTORE") return fail('Type RESTORE to confirm replacing all data.');
  try {
    const data = JSON.parse(await file.text());
    const r = restoreBackup(getDb(), data);
    revalidatePath("/", "layout");
    return ok(`Restored ${r.restored} events`);
  } catch (e) {
    return fail(e instanceof Error ? e.message : String(e));
  }
}

export async function mergeEventsAction(_: ActionResult | null, fd: FormData): Promise<ActionResult> {
  const file = fd.get("file");
  if (!(file instanceof File) || file.size === 0) return fail("Choose a JSON export");
  try {
    const r = importEvents(getDb(), JSON.parse(await file.text()));
    revalidatePath("/", "layout");
    return ok(`Imported ${r.imported} events, skipped ${r.skipped} duplicates`);
  } catch (e) {
    return fail(e instanceof Error ? e.message : String(e));
  }
}

export async function rebuildAction(): Promise<void> {
  rebuildProjections(getDb());
  revalidatePath("/", "layout");
}

export async function seedDemoAction(_: ActionResult | null, fd: FormData): Promise<ActionResult> {
  const db = getDb();
  if (countEvents(db) > 0 && s(fd, "confirm") !== "WIPE") return fail("Database is not empty. Type WIPE to replace everything with fictional demo data.");
  const years = Math.min(3, Math.max(0.25, n(fd, "years") ?? 1));
  const days = Math.round(years * 365);
  const end = currentDay();
  db.transaction(() => {
    db.exec("DELETE FROM events");
    rebuildProjections(db);
  });
  const events = generateFictional({ start: addDays(end, -(days - 1)), days, seed: 42 });
  for (let i = 0; i < events.length; i += 20000) appendEvents(db, events.slice(i, i + 20000));
  appendEvents(db, [{ type: "IMPORT_COMPLETED", payload: { source: "fictional-demo", count: events.length, note: "Fictional demo data — wipe before real use" }, source: "system" }]);
  revalidatePath("/", "layout");
  return ok(`Loaded ${events.length} fictional events (${years} y)`);
}

export async function wipeAction(_: ActionResult | null, fd: FormData): Promise<ActionResult> {
  if (s(fd, "confirm") !== "WIPE") return fail("Type WIPE to confirm. Export a backup first.");
  const db = getDb();
  db.transaction(() => {
    db.exec("DELETE FROM events");
    rebuildProjections(db);
  });
  revalidatePath("/", "layout");
  return ok("All data removed");
}

export async function logUx(form: string, durationMs: number, abandoned: boolean): Promise<void> {
  try {
    appendEvents(getDb(), [{ type: "UX_ENTRY_TIMED", payload: { form, durationMs: Math.round(durationMs), abandoned } }]);
  } catch {
    /* non-critical */
  }
}

export async function nowStamp(): Promise<string> {
  return nowLocal();
}

/** Structured settings form → minimal patch of changed values → new versioned SETTINGS_CHANGED event. */
export async function saveSettingsForm(_: ActionResult | null, fd: FormData): Promise<ActionResult> {
  const cur = getDataset().settings;
  const effectiveFrom = s(fd, "effectiveFrom") ?? currentDay();
  if (!isDay(effectiveFrom)) return fail("Invalid effective date");
  const next: Record<string, unknown> = {
    dayStartHour: n(fd, "dayStartHour") ?? cur.dayStartHour,
    phoneLimitMin: n(fd, "phoneLimitMin") ?? cur.phoneLimitMin,
    morningEnd: s(fd, "morningEnd") ?? cur.morningEnd,
    eveningStart: s(fd, "eveningStart") ?? cur.eveningStart,
    productivePhoneCategories: fd.getAll("productivePhoneCategories").map(String),
    germanMaxPassiveShare: (n(fd, "germanMaxPassiveShare") ?? cur.germanMaxPassiveShare * 100) / 100,
    maxConcurrentExperiments: n(fd, "maxConcurrentExperiments") ?? cur.maxConcurrentExperiments,
    deep: { minMinutes: n(fd, "deep_minMinutes") ?? cur.deep.minMinutes, maxInterruptions: n(fd, "deep_maxInterruptions") ?? cur.deep.maxInterruptions, minFocus: n(fd, "deep_minFocus") ?? cur.deep.minFocus },
    budgets: { phone: n(fd, "budget_phone") ?? null, distraction: n(fd, "budget_distraction") ?? null, passiveLearning: n(fd, "budget_passiveLearning") ?? null },
  };
  const targets: Record<string, unknown> = { executionPct: n(fd, "executionPct") ?? cur.targets.executionPct };
  for (const k of ["germanMin", "lawMin", "lawQuestions", "deepMin", "productiveMin"] as const) {
    targets[k] = { floor: n(fd, `${k}_floor`) ?? cur.targets[k].floor, target: n(fd, `${k}_target`) ?? cur.targets[k].target, stretch: n(fd, `${k}_stretch`) ?? cur.targets[k].stretch };
  }
  next.targets = targets;
  const mix: Record<string, number> = {};
  for (const [k, v] of fd.entries()) {
    if (k.startsWith("mix_")) {
      const x = Number(v);
      if (Number.isFinite(x) && x > 0) mix[k.slice(4)] = x / 100;
    }
  }
  if (Object.keys(mix).length) next.germanTargetMix = mix;
  const tiers: Record<string, string> = {};
  for (const [k, v] of fd.entries()) if (k.startsWith("tier_") && v) tiers[k.slice(5)] = String(v);
  next.lawAreaTiers = tiers;
  const weights: Record<string, number> = {};
  for (const [k, v] of fd.entries()) if (k.startsWith("rw_")) weights[k.slice(3)] = Number(v) || 0;
  if (Object.keys(weights).length) next.readinessWeights = weights;
  next.noPhoneWindows = cur.noPhoneWindows.map((w) => ({
    ...w,
    enabled: b(fd, `npw_${w.id}_enabled`),
    minutes: n(fd, `npw_${w.id}_minutes`) ?? w.minutes,
    start: s(fd, `npw_${w.id}_start`) ?? w.start,
    end: s(fd, `npw_${w.id}_end`) ?? w.end,
  }));
  const md = (s(fd, "minimumDay") ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const m = l.match(/^([\w.]+)\s*(?:>=|≥)?\s*([\d.]+)$/);
      return m ? { metricKey: m[1], min: Number(m[2]) } : null;
    });
  if (md.some((x) => x == null)) return fail('Minimum day lines must look like "german.min >= 30"');
  next.minimumDay = md;
  const bf = s(fd, "baseline_from");
  const bt = s(fd, "baseline_to");
  next.phoneBaseline = bf && bt ? { from: bf, to: bt } : null;
  const patch: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(next)) {
    if (stableJson(v) !== stableJson((cur as unknown as Record<string, unknown>)[k])) patch[k] = v;
  }
  if (!Object.keys(patch).length) return fail("Nothing changed");
  return write([{ type: "SETTINGS_CHANGED", payload: { patch, effectiveFrom } }], `Saved ${Object.keys(patch).length} setting group(s) as a new version effective ${effectiveFrom}. Earlier days keep their original targets.`);
}

function stableJson(v: unknown): string {
  if (Array.isArray(v)) return `[${v.map(stableJson).join(",")}]`;
  if (v && typeof v === "object")
    return `{${Object.keys(v as Record<string, unknown>)
      .filter((k) => (v as Record<string, unknown>)[k] !== undefined)
      .sort()
      .map((k) => `${JSON.stringify(k)}:${stableJson((v as Record<string, unknown>)[k])}`)
      .join(",")}}`;
  return JSON.stringify(v ?? null);
}
