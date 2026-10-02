import { ActionForm } from "@/components/ActionForm";
import { LiveClock } from "@/components/TimerBadge";
import { Tabs } from "@/components/Tabs";
import { SessionPicker } from "@/components/SessionPicker";
import { PageHeader, Field, ChipGroup } from "@/components/ui";
import { OutputFields, LawAreaSelect, DomainSelect, ActivitySelect, AreaInput } from "@/components/forms";
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

const FOCUS = [
  { value: "1", label: "1 · scattered" },
  { value: "2", label: "2" },
  { value: "3", label: "3 · ok" },
  { value: "4", label: "4" },
  { value: "5", label: "5 · locked in" },
];
const SCALE = ["1", "2", "3", "4", "5"].map((v) => ({ value: v, label: v }));

function Card({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <section className="panel max-w-3xl p-5 sm:p-6">
      <h2 className="text-[18px] font-semibold">{title}</h2>
      {sub && <p className="muted mt-1 text-[13px]">{sub}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

const num = (name: string, placeholder?: string) => <input name={name} type="number" min={0} inputMode="numeric" placeholder={placeholder} className="input num" />;

export default async function LogPage({ searchParams }: { searchParams?: Promise<Record<string, string | undefined>> }) {
  const sp = (await searchParams) ?? {};
  const t = activeTimer();
  const today = currentDay();
  const tabs = [
    { id: "session", label: t ? "● Session running" : "Session" },
    { id: "phone", label: "Phone" },
    { id: "questions", label: "Law questions" },
    { id: "review", label: "Evening review" },
    { id: "german", label: "German output" },
    { id: "energy", label: "Energy & sleep" },
    { id: "past", label: "Past session" },
    { id: "note", label: "Note" },
  ];
  return (
    <div>
      <PageHeader title="Quick log" subtitle="A minute or two a day. Totals, averages, streaks and forecasts are calculated for you." />
      <Tabs tabs={tabs} initial={sp.tab ?? (sp.domain ? "session" : undefined)}>
        {/* Session */}
        {t ? (
          <Card title={`${t.domain === "LAW" ? "Law" : t.domain === "GERMAN" ? "German" : t.domain} · ${t.activity.replace("_", " ")}${t.area ? ` · ${t.area}` : ""}`} sub={`Started ${t.start.slice(11, 16)}${t.plannedStart ? ` · planned ${t.plannedStart.slice(11, 16)}` : ""}`}>
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl p-5" style={{ background: "var(--panel-2)" }}>
              <div>
                <div className="muted text-[12px] font-semibold">{t.pausedAt ? "Paused" : "Elapsed"}</div>
                <LiveClock start={t.start} pausedMinutes={t.pausedMinutes} pausedAt={t.pausedAt} />
              </div>
              <form action={t.pausedAt ? resumeSession : pauseSession}>
                <input type="hidden" name="sessionId" value={t.id} />
                <button className="btn btn-lg">{t.pausedAt ? "Resume" : "Pause"}</button>
              </form>
            </div>
            <ActionForm action={completeSession} submitLabel="Finish & save session" submitClass="btn btn-primary btn-lg w-full sm:w-auto">
              <input type="hidden" name="sessionId" value={t.id} />
              <div className="mt-5 space-y-5">
                <Field group label="How focused were you?">
                  <ChipGroup name="focus" options={FOCUS} />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Interruptions">{num("interruptions", "0")}</Field>
                  <Field label="Task switches">{num("contextSwitches", "0")}</Field>
                </div>
                {t.domain === "LAW" && (
                  <div className="grid grid-cols-3 gap-3">
                    <Field label="Questions">{num("qTotal")}</Field>
                    <Field label="Correct">{num("qCorrect")}</Field>
                    <Field label="Wrong but sure">{num("qWrongConf")}</Field>
                  </div>
                )}
                {t.domain === "GERMAN" && (
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Words written">{num("out_words")}</Field>
                    <Field label="Minutes actually speaking">{num("out_speakingMin")}</Field>
                  </div>
                )}
                <details>
                  <summary className="link text-[14px]">More output (pages, cases, drafts…)</summary>
                  <div className="mt-3">
                    <OutputFields />
                  </div>
                </details>
                <Field label="What got in the way? (optional)">
                  <input name="distraction" className="input" placeholder="e.g. checked messages before starting" />
                </Field>
                <label className="flex items-center gap-2 text-[14px]">
                  <input type="checkbox" name="unfinished" /> I stopped before I meant to
                </label>
              </div>
            </ActionForm>
          </Card>
        ) : (
          <Card title="Start a session" sub="The timer keeps running if you leave this page or close the tab.">
            <ActionForm action={startSession} submitLabel="Start timer" submitClass="btn btn-primary btn-lg w-full sm:w-auto">
              <SessionPicker defaultDomain={sp.domain} defaultActivity={sp.activity} />
              <details className="mt-4">
                <summary className="link text-[14px]">Was this planned for a specific time?</summary>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <Field label="Planned start">
                    <input name="plannedStart" type="time" className="input" />
                  </Field>
                  <Field label="Title (optional)">
                    <input name="title" className="input" />
                  </Field>
                </div>
              </details>
            </ActionForm>
          </Card>
        )}

        {/* Phone */}
        <Card title="Phone time today" sub="Copy minutes per category from Screen Time / Digital Wellbeing. Leave empty what you didn't use.">
          <ActionForm action={addPhoneUsage} submitLabel="Save phone time" submitClass="btn btn-primary btn-lg w-full sm:w-auto">
            <input type="hidden" name="day" value={today} />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {PHONE_CATEGORIES.map((c) => (
                <Field key={c} label={c}>
                  <div className="relative">
                    <input name={`cat_${c}`} type="number" min={0} inputMode="numeric" className="input num pr-12" />
                    <span className="muted pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[12px]">min</span>
                  </div>
                </Field>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <Field label="Pickups">{num("pickups")}</Field>
              <Field label="First use">
                <input name="firstUse" type="time" className="input" />
              </Field>
              <Field label="Last use">
                <input name="lastUse" type="time" className="input" />
              </Field>
            </div>
            <details className="mt-4">
              <summary className="link text-[14px]">Add one timed phone session (unlocks morning/evening & distraction analysis)</summary>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Field label="Category">
                  <select name="category" className="input">
                    {PHONE_CATEGORIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Minutes">{num("minutes")}</Field>
                <Field label="From">
                  <input name="start" type="time" className="input" />
                </Field>
                <Field label="To">
                  <input name="end" type="time" className="input" />
                </Field>
              </div>
            </details>
          </ActionForm>
        </Card>

        {/* Questions */}
        <Card title="Law question set" sub="Log a batch in one go. Confidence matters: a wrong answer you were sure about signals a misconception.">
          <ActionForm action={logQuestionSet} submitLabel="Save set" submitClass="btn btn-primary btn-lg w-full sm:w-auto">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Area">
                <LawAreaSelect />
              </Field>
              <Field label="Topic (optional)">
                <input name="topic" className="input" placeholder="e.g. art. 415 KC" />
              </Field>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Field label="Answered">
                <input name="total" type="number" min={1} required inputMode="numeric" className="input num" />
              </Field>
              <Field label="Correct">
                <input name="correct" type="number" min={0} required inputMode="numeric" className="input num" />
              </Field>
              <Field label="Wrong but sure">{num("wrongConfident")}</Field>
              <Field label="Right but unsure">{num("correctUnsure")}</Field>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Field label="Minutes spent">{num("minutes")}</Field>
              <Field group label="Difficulty">
                <ChipGroup name="difficulty" options={[{ value: "1", label: "Easy" }, { value: "2", label: "Medium" }, { value: "3", label: "Hard" }]} />
              </Field>
            </div>
          </ActionForm>
        </Card>

        {/* Review */}
        <Card title="Evening review" sub="Four questions. Under a minute.">
          <ActionForm action={eveningReview} submitLabel="Save review" submitClass="btn btn-primary btn-lg w-full sm:w-auto">
            <input type="hidden" name="day" value={today} />
            <Field group label="Did I execute my plan?">
              <ChipGroup name="executed" defaultValue="partial" options={[{ value: "yes", label: "Yes" }, { value: "partial", label: "Partly" }, { value: "no", label: "No" }]} />
            </Field>
            <div className="mt-4 grid gap-3">
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
        </Card>

        {/* German */}
        <Card title="German output" sub="Count errors in a text or a recorded conversation. This is what shows whether practice is turning into accuracy.">
          <ActionForm action={logGermanEval} submitLabel="Save evaluation" submitClass="btn btn-primary btn-lg w-full sm:w-auto">
            <Field group label="What did you evaluate?">
              <ChipGroup name="kind" defaultValue="writing" options={[{ value: "writing", label: "A written text" }, { value: "speaking", label: "Speaking" }]} />
            </Field>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Field label="Words (text)">{num("words")}</Field>
              <Field label="Minutes (speaking)">
                <input name="minutes" type="number" min={0} step="any" inputMode="decimal" className="input num" />
              </Field>
            </div>
            <div className="label mb-2 mt-4">Errors by type</div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {GERMAN_ERROR_CATEGORIES.map((c) => (
                <Field key={c} label={c[0].toUpperCase() + c.slice(1)}>
                  {num(`err_${c}`)}
                </Field>
              ))}
            </div>
          </ActionForm>
          <div className="mt-6 border-t pt-5" style={{ borderColor: "var(--border)" }}>
            <h3 className="text-[15px] font-semibold">Vocabulary review</h3>
            <ActionForm action={logVocab} submitLabel="Save vocabulary" submitClass="btn">
              <div className="mt-3 grid grid-cols-3 gap-3">
                <Field label="Reviewed">{num("reviewed")}</Field>
                <Field label="Correct">{num("correct")}</Field>
                <Field label="New words">{num("newWords")}</Field>
              </div>
            </ActionForm>
          </div>
        </Card>

        {/* Energy */}
        <Card title="Energy & sleep (optional)" sub="Helps plan realistic days and spot overload. Never used for medical conclusions.">
          <ActionForm action={morningCheckin} submitLabel="Save morning check-in" submitClass="btn btn-primary">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Woke up at">
                <input name="wakeTime" type="time" className="input" />
              </Field>
              <Field label="Time available today (min)">{num("availableMinutes", "e.g. 360")}</Field>
            </div>
            <div className="mt-3">
              <Field group label="Energy">
                <ChipGroup name="energy" options={SCALE} />
              </Field>
            </div>
          </ActionForm>
          <div className="mt-6 border-t pt-5" style={{ borderColor: "var(--border)" }}>
            <ActionForm action={logRecovery} submitLabel="Save sleep & recovery" submitClass="btn">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Sleep (hours)">
                  <input name="sleepHours" type="number" step="0.25" min={0} max={24} inputMode="decimal" className="input num" />
                </Field>
                <Field group label="Sleep quality">
                  <ChipGroup name="sleepQuality" options={SCALE} />
                </Field>
              </div>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field group label="Fatigue">
                  <ChipGroup name="fatigue" options={SCALE} />
                </Field>
                <Field group label="Recovery feeling">
                  <ChipGroup name="recovery" options={SCALE} />
                </Field>
              </div>
            </ActionForm>
          </div>
        </Card>

        {/* Past session */}
        <Card title="Log a past session" sub="Forgot the timer? Add it afterwards.">
          <ActionForm action={logSession} submitLabel="Save session" submitClass="btn btn-primary btn-lg w-full sm:w-auto">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Field label="Day">
                <input name="day" type="date" defaultValue={today} className="input" />
              </Field>
              <Field label="From">
                <input name="start" type="time" required className="input" />
              </Field>
              <Field label="To">
                <input name="end" type="time" className="input" />
              </Field>
              <Field label="or minutes">{num("minutes")}</Field>
              <Field label="Domain">
                <DomainSelect />
              </Field>
              <Field label="Activity">
                <ActivitySelect />
              </Field>
              <Field label="Area / skill" className="col-span-2">
                <AreaInput />
              </Field>
            </div>
            <div className="mt-4">
              <Field group label="Focus">
                <ChipGroup name="focus" options={FOCUS} />
              </Field>
            </div>
            <details className="mt-4">
              <summary className="link text-[14px]">Questions & output</summary>
              <div className="mt-3 grid grid-cols-3 gap-3">
                <Field label="Questions">{num("qTotal")}</Field>
                <Field label="Correct">{num("qCorrect")}</Field>
                <Field label="Wrong but sure">{num("qWrongConf")}</Field>
              </div>
              <div className="mt-3">
                <OutputFields />
              </div>
            </details>
          </ActionForm>
        </Card>

        {/* Note */}
        <Card title="Quick note">
          <ActionForm action={addNote} submitLabel="Save note" submitClass="btn btn-primary">
            <Field group label="Type">
              <ChipGroup name="kind" defaultValue="insight" options={[{ value: "distraction", label: "Distraction" }, { value: "insight", label: "Insight" }, { value: "general", label: "General" }]} />
            </Field>
            <div className="mt-3">
              <Field label="Note">
                <textarea name="text" rows={3} className="input" required />
              </Field>
            </div>
          </ActionForm>
        </Card>
      </Tabs>
    </div>
  );
}
