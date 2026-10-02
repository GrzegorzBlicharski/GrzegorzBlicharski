import { ActionForm } from "@/components/ActionForm";
import { LiveClock } from "@/components/TimerBadge";
import { PageHeader, Panel, Field, Grid } from "@/components/ui";
import { DomainSelect, ActivitySelect, AreaInput, FocusRadio, OutputFields, PhoneGrid, LawAreaSelect } from "@/components/forms";
import { activeTimer } from "@/server/active";
import { currentDay } from "@/server/context";
import {
  startSession,
  pauseSession,
  resumeSession,
  completeSession,
  logSession,
  addPhoneUsage,
  logQuestionSet,
  logGermanEval,
  logVocab,
  logRecovery,
  morningCheckin,
  eveningReview,
  addNote,
} from "@/server/actions";
import { GERMAN_ERROR_CATEGORIES, PHONE_CATEGORIES } from "@/domains/catalog";

export const dynamic = "force-dynamic";

export default function LogPage() {
  const t = activeTimer();
  const today = currentDay();
  return (
    <div className="space-y-3">
      <PageHeader title="Quick log" subtitle="Designed for < 2 minutes of manual input per day. Everything else is derived." />
      <Grid cols="lg:grid-cols-2">
        <Panel title={t ? "Running session" : "Start session"} id="timer">
          {t ? (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <LiveClock start={t.start} pausedMinutes={t.pausedMinutes} pausedAt={t.pausedAt} />
                <div className="text-2 text-sm">
                  {t.domain} · {t.activity}
                  {t.area ? ` · ${t.area}` : ""}
                  <div className="muted text-xs">started {t.start.slice(11, 16)}{t.plannedStart ? ` (planned ${t.plannedStart.slice(11, 16)})` : ""}</div>
                </div>
                <form action={t.pausedAt ? resumeSession : pauseSession} className="ml-auto">
                  <input type="hidden" name="sessionId" value={t.id} />
                  <button className="btn">{t.pausedAt ? "Resume" : "Pause"}</button>
                </form>
              </div>
              <ActionForm action={completeSession} submitLabel="Finish session">
                <input type="hidden" name="sessionId" value={t.id} />
                <div className="grid gap-3">
                  <Field label="Focus (1–5)">
                    <FocusRadio />
                  </Field>
                  <div className="grid grid-cols-2 gap-2">
                    <Field label="Interruptions">
                      <input name="interruptions" type="number" min={0} className="input" inputMode="numeric" />
                    </Field>
                    <Field label="Context switches">
                      <input name="contextSwitches" type="number" min={0} className="input" inputMode="numeric" />
                    </Field>
                  </div>
                  {t.domain === "LAW" && (
                    <div className="grid grid-cols-3 gap-2">
                      <Field label="Questions">
                        <input name="qTotal" type="number" min={0} className="input" inputMode="numeric" />
                      </Field>
                      <Field label="Correct">
                        <input name="qCorrect" type="number" min={0} className="input" inputMode="numeric" />
                      </Field>
                      <Field label="Wrong & confident">
                        <input name="qWrongConf" type="number" min={0} className="input" inputMode="numeric" />
                      </Field>
                    </div>
                  )}
                  <details>
                    <summary className="link text-sm">Output (words, speaking min, cases…)</summary>
                    <div className="mt-2">
                      <OutputFields />
                    </div>
                  </details>
                  <Field label="Notes / what blocked me (optional)">
                    <input name="distraction" className="input" placeholder="e.g. checked messages before starting" />
                  </Field>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="unfinished" /> Unfinished (stopped before the intended end)
                  </label>
                </div>
              </ActionForm>
            </div>
          ) : (
            <ActionForm action={startSession} submitLabel="Start timer">
              <div className="grid grid-cols-2 gap-2">
                <Field label="Domain">
                  <DomainSelect />
                </Field>
                <Field label="Activity">
                  <ActivitySelect />
                </Field>
                <Field label="Area / skill" className="col-span-2">
                  <AreaInput />
                </Field>
                <Field label="Planned start (optional)">
                  <input name="plannedStart" type="time" className="input" />
                </Field>
                <Field label="Title (optional)">
                  <input name="title" className="input" />
                </Field>
              </div>
            </ActionForm>
          )}
        </Panel>

        <Panel title="Phone (today)" id="phone" sub="Minutes per category from Screen Time; or import CSV in Data">
          <ActionForm action={addPhoneUsage} submitLabel="Save phone data">
            <input type="hidden" name="day" value={today} />
            <PhoneGrid />
            <div className="mt-2 grid grid-cols-3 gap-2">
              <Field label="Pickups">
                <input name="pickups" type="number" min={0} className="input" inputMode="numeric" />
              </Field>
              <Field label="First use">
                <input name="firstUse" type="time" className="input" />
              </Field>
              <Field label="Last use">
                <input name="lastUse" type="time" className="input" />
              </Field>
            </div>
            <details className="mt-2">
              <summary className="link text-sm">Add a timed phone session (enables morning/evening & distraction analysis)</summary>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <Field label="Category">
                  <select name="category" className="input">
                    {PHONE_CATEGORIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Minutes">
                  <input name="minutes" type="number" min={0} className="input" />
                </Field>
                <Field label="Start">
                  <input name="start" type="time" className="input" />
                </Field>
                <Field label="End">
                  <input name="end" type="time" className="input" />
                </Field>
              </div>
            </details>
          </ActionForm>
        </Panel>

        <Panel title="Law question set" id="questions">
          <ActionForm action={logQuestionSet} submitLabel="Save set">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Field label="Area">
                <LawAreaSelect />
              </Field>
              <Field label="Topic">
                <input name="topic" className="input" placeholder="e.g. art. 415" />
              </Field>
              <Field label="Total">
                <input name="total" type="number" min={1} required className="input" inputMode="numeric" />
              </Field>
              <Field label="Correct">
                <input name="correct" type="number" min={0} required className="input" inputMode="numeric" />
              </Field>
              <Field label="Wrong & confident">
                <input name="wrongConfident" type="number" min={0} className="input" inputMode="numeric" />
              </Field>
              <Field label="Correct but unsure">
                <input name="correctUnsure" type="number" min={0} className="input" inputMode="numeric" />
              </Field>
              <Field label="Minutes">
                <input name="minutes" type="number" min={0} className="input" inputMode="numeric" />
              </Field>
              <Field label="Difficulty 1–3">
                <input name="difficulty" type="number" min={1} max={3} className="input" />
              </Field>
            </div>
          </ActionForm>
        </Panel>

        <Panel title="Evening review" id="review" sub="30–60 seconds">
          <ActionForm action={eveningReview} submitLabel="Save review">
            <input type="hidden" name="day" value={today} />
            <Field label="Did I execute?">
              <div className="flex gap-2">
                {["yes", "partial", "no"].map((x) => (
                  <label key={x} className="flex-1">
                    <input type="radio" name="executed" value={x} className="peer sr-only" defaultChecked={x === "partial"} />
                    <span className="btn w-full capitalize peer-checked:border-[var(--accent)] peer-checked:bg-[var(--accent)] peer-checked:text-white">{x}</span>
                  </label>
                ))}
              </div>
            </Field>
            <div className="mt-2 grid gap-2">
              <Field label="What blocked me?">
                <input name="blocked" className="input" />
              </Field>
              <Field label="What worked?">
                <input name="worked" className="input" />
              </Field>
              <Field label="Main priority tomorrow">
                <input name="tomorrowPriority" className="input" />
              </Field>
            </div>
          </ActionForm>
        </Panel>

        <Panel title="German output evaluation" id="german">
          <ActionForm action={logGermanEval} submitLabel="Save evaluation">
            <div className="grid grid-cols-3 gap-2">
              <Field label="Type">
                <select name="kind" className="input">
                  <option value="writing">Writing</option>
                  <option value="speaking">Speaking</option>
                </select>
              </Field>
              <Field label="Words (writing)">
                <input name="words" type="number" min={1} className="input" />
              </Field>
              <Field label="Minutes (speaking)">
                <input name="minutes" type="number" min={0} step="any" className="input" />
              </Field>
            </div>
            <div className="label mt-3">Errors by category</div>
            <div className="mt-1 grid grid-cols-3 gap-2 sm:grid-cols-4">
              {GERMAN_ERROR_CATEGORIES.map((c) => (
                <Field key={c} label={c}>
                  <input name={`err_${c}`} type="number" min={0} className="input" inputMode="numeric" />
                </Field>
              ))}
            </div>
          </ActionForm>
          <div className="mt-4 border-t pt-3" style={{ borderColor: "var(--border)" }}>
            <ActionForm action={logVocab} submitLabel="Save vocab review">
              <div className="grid grid-cols-3 gap-2">
                <Field label="Reviewed">
                  <input name="reviewed" type="number" min={0} className="input" />
                </Field>
                <Field label="Correct">
                  <input name="correct" type="number" min={0} className="input" />
                </Field>
                <Field label="New words">
                  <input name="newWords" type="number" min={0} className="input" />
                </Field>
              </div>
            </ActionForm>
          </div>
        </Panel>

        <Panel title="Morning check-in & recovery (optional)" id="recovery" sub="Used for planning and sustainability analysis — never for medical conclusions">
          <ActionForm action={morningCheckin} submitLabel="Save check-in">
            <div className="grid grid-cols-3 gap-2">
              <Field label="Wake time">
                <input name="wakeTime" type="time" className="input" />
              </Field>
              <Field label="Available min">
                <input name="availableMinutes" type="number" min={0} className="input" />
              </Field>
              <Field label="Energy 1–5">
                <input name="energy" type="number" min={1} max={5} className="input" />
              </Field>
            </div>
          </ActionForm>
          <div className="mt-4 border-t pt-3" style={{ borderColor: "var(--border)" }}>
            <ActionForm action={logRecovery} submitLabel="Save recovery">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                <Field label="Sleep h">
                  <input name="sleepHours" type="number" step="0.1" min={0} max={24} className="input" />
                </Field>
                <Field label="Sleep quality">
                  <input name="sleepQuality" type="number" min={1} max={5} className="input" />
                </Field>
                <Field label="Energy">
                  <input name="energy" type="number" min={1} max={5} className="input" />
                </Field>
                <Field label="Fatigue">
                  <input name="fatigue" type="number" min={1} max={5} className="input" />
                </Field>
                <Field label="Recovery">
                  <input name="recovery" type="number" min={1} max={5} className="input" />
                </Field>
              </div>
            </ActionForm>
          </div>
        </Panel>

        <Panel title="Log a past session" id="retro">
          <ActionForm action={logSession} submitLabel="Log session">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              <Field label="Day">
                <input name="day" type="date" defaultValue={today} className="input" />
              </Field>
              <Field label="Domain">
                <DomainSelect />
              </Field>
              <Field label="Activity">
                <ActivitySelect />
              </Field>
              <Field label="Start">
                <input name="start" type="time" required className="input" />
              </Field>
              <Field label="End">
                <input name="end" type="time" className="input" />
              </Field>
              <Field label="or Minutes">
                <input name="minutes" type="number" min={0} className="input" />
              </Field>
              <Field label="Area / skill">
                <AreaInput />
              </Field>
              <Field label="Planned start">
                <input name="plannedStart" type="time" className="input" />
              </Field>
              <Field label="Interruptions">
                <input name="interruptions" type="number" min={0} className="input" />
              </Field>
            </div>
            <div className="mt-2">
              <Field label="Focus">
                <FocusRadio />
              </Field>
            </div>
            <details className="mt-2">
              <summary className="link text-sm">Output & questions</summary>
              <div className="mt-2 grid grid-cols-3 gap-2">
                <Field label="Questions">
                  <input name="qTotal" type="number" min={0} className="input" />
                </Field>
                <Field label="Correct">
                  <input name="qCorrect" type="number" min={0} className="input" />
                </Field>
                <Field label="Wrong & confident">
                  <input name="qWrongConf" type="number" min={0} className="input" />
                </Field>
              </div>
              <div className="mt-2">
                <OutputFields />
              </div>
            </details>
          </ActionForm>
        </Panel>

        <Panel title="Note" id="note">
          <ActionForm action={addNote} submitLabel="Save note">
            <div className="grid grid-cols-3 gap-2">
              <Field label="Kind">
                <select name="kind" className="input">
                  <option value="distraction">Distraction</option>
                  <option value="insight">Insight</option>
                  <option value="general">General</option>
                </select>
              </Field>
              <Field label="Text" className="col-span-2">
                <input name="text" className="input" required />
              </Field>
            </div>
          </ActionForm>
        </Panel>
      </Grid>
    </div>
  );
}
