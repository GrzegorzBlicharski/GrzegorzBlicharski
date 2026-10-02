import { getAnalysis } from "@/server/context";
import { buildPlan, type PlanMode } from "@/coach/planner";
import { PageHeader, Panel, Badge, Field, Empty, Grid } from "@/components/ui";
import { ActionForm } from "@/components/ActionForm";
import { acceptPlan, setDayPlan, createTask, setTaskStatus, deleteTask, logProtocolRun, defineProtocol } from "@/server/actions";
import { fmtMin } from "@/components/format";
import { DomainSelect } from "@/components/forms";
import { detectOverplanning } from "@/modules/execution";
import { sustainedCapacity } from "@/modules/recovery";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function PlanPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const { ds } = getAnalysis();
  const mode = (sp.mode as PlanMode) ?? "normal";
  const available = sp.available ? Number(sp.available) : undefined;
  const energy = sp.energy ? Number(sp.energy) : undefined;
  const plan = buildPlan(ds, { mode, availableMinutes: available, energy });
  const today = ds.days.find((d) => d.day === ds.asOf);
  const tasks = ds.tasks.filter((t) => t.plannedDay === ds.asOf || (t.plannedDay < ds.asOf && (t.status === "planned" || t.status === "started" || t.status === "postponed")));
  const op = detectOverplanning(ds);
  const cap = sustainedCapacity(ds);
  const realismTone = plan.realism.label === "realistic" ? "good" : plan.realism.label === "stretch" ? "warn" : plan.realism.label === "unlikely" ? "risk" : "neutral";
  return (
    <div className="space-y-3">
      <PageHeader title="Adaptive plan" subtitle="Built from available time, historical execution, sustained capacity, goals, due reviews and best hours. Advice — you decide.">
        {(["minimum", "normal", "high"] as PlanMode[]).map((m) => (
          <Link key={m} href={`/plan?mode=${m}${available ? `&available=${available}` : ""}${energy ? `&energy=${energy}` : ""}`} className={`btn btn-sm ${m === mode ? "btn-primary" : ""}`}>
            {m === "minimum" ? "Minimum day" : m === "normal" ? "Normal day" : "High-capacity day"}
          </Link>
        ))}
      </PageHeader>
      <Grid cols="lg:grid-cols-3">
        <Panel title={`Proposed plan · ${plan.mode}`} className="lg:col-span-2" right={<Badge tone={realismTone}>{plan.realism.label}</Badge>}>
          <form className="mb-3 flex flex-wrap items-end gap-2" method="get">
            <input type="hidden" name="mode" value={mode} />
            <Field label="Available minutes">
              <input name="available" type="number" className="input w-32" defaultValue={plan.availableMinutes} />
            </Field>
            <Field label="Energy 1–5">
              <input name="energy" type="number" min={1} max={5} className="input w-24" defaultValue={energy} />
            </Field>
            <button className="btn">Recalculate</button>
          </form>
          {plan.blocks.length ? (
            <table className="data">
              <thead>
                <tr>
                  <th>Start</th>
                  <th>Block</th>
                  <th>Minutes</th>
                  <th>Why</th>
                </tr>
              </thead>
              <tbody>
                {plan.blocks.map((b, i) => (
                  <tr key={i}>
                    <td className="num">{b.start}</td>
                    <td className="font-medium">
                      {b.label} {b.hard && <span className="muted text-[10px] uppercase">· hard</span>}
                    </td>
                    <td>{fmtMin(b.minutes)}</td>
                    <td className="text-2 text-xs">{b.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <Empty>No blocks — define goals or log sessions first.</Empty>
          )}
          <div className="text-2 mt-3 grid gap-1 text-xs">
            <div>
              Total {fmtMin(plan.totalMinutes)} · capacity {fmtMin(plan.capacity)} · available {fmtMin(plan.availableMinutes)} · historical execution {(plan.executionRatio * 100).toFixed(0)}%
            </div>
            <div>
              Your distribution of actual work (90D): median {fmtMin(plan.realism.p50)}, P85 {fmtMin(plan.realism.p85)} (n={plan.realism.n}) → ≤ median = realistic, ≤ P85 = stretch, above = unlikely.
            </div>
            {plan.notes.map((n, i) => (
              <div key={i}>• {n}</div>
            ))}
          </div>
          <ActionForm action={acceptPlan} submitLabel="Accept as today's plan" resetOnSuccess={false}>
            <input type="hidden" name="mode" value={mode} />
            {available && <input type="hidden" name="availableMinutes" value={available} />}
            {energy && <input type="hidden" name="energy" value={energy} />}
          </ActionForm>
        </Panel>
        <div className="space-y-3">
          <Panel title="Today's plan (stored)">
            {today?.plan ? (
              <div className="text-sm">
                Planned {fmtMin(today.plan.planned)} · actual so far {fmtMin(today.total)} ({((today.total / today.plan.planned) * 100).toFixed(0)}%)
              </div>
            ) : (
              <p className="muted text-sm">No plan stored for today.</p>
            )}
            <details className="mt-2">
              <summary className="link text-sm">Set planned minutes manually</summary>
              <ActionForm action={setDayPlan}>
                <Field label="Planned minutes">
                  <input name="plannedMinutes" type="number" min={0} className="input" />
                </Field>
              </ActionForm>
            </details>
          </Panel>
          <Panel title="Capacity reference">
            <ul className="text-2 space-y-1 text-sm">
              <li>Highest sustained 7D: {fmtMin(cap.w7?.value)}/day</li>
              <li>Highest sustained 30D: {fmtMin(cap.w30?.value)}/day</li>
              <li>Highest sustained 90D: {fmtMin(cap.w90?.value)}/day</li>
              <li>Current 30D: {fmtMin(cap.current30)}/day</li>
            </ul>
            {op.detected && (
              <div className="mt-2">
                <Badge tone="warn">Systematic overplanning</Badge>
                <p className="text-2 mt-1 text-xs">
                  30D planned {fmtMin(op.plannedAvg)} vs actual {fmtMin(op.actualAvg)} ({op.executionPct?.toFixed(1)}%). Suggested base plan ≈ {fmtMin(op.suggestedBaseline)}.
                </p>
              </div>
            )}
          </Panel>
        </div>
      </Grid>
      <Grid cols="lg:grid-cols-2">
        <Panel title="Tasks" sub="Planned → started → completed / postponed / abandoned">
          <ul className="space-y-1">
            {tasks.slice(0, 30).map((t) => (
              <li key={t.id} className="flex flex-wrap items-center gap-2 border-b py-1 text-sm" style={{ borderColor: "var(--border)" }}>
                <span className={t.status === "completed" ? "muted line-through" : ""}>{t.title}</span>
                <span className="muted text-xs">
                  {t.domain} · {t.plannedDay !== ds.asOf ? `from ${t.plannedDay} · ` : ""}
                  {t.status}
                  {t.postponeCount ? ` · postponed ×${t.postponeCount}` : ""}
                </span>
                <span className="ml-auto flex gap-1">
                  {["started", "completed", "postponed", "abandoned"].map((s) => (
                    <form key={s} action={setTaskStatus}>
                      <input type="hidden" name="taskId" value={t.id} />
                      <input type="hidden" name="status" value={s} />
                      <button className="btn btn-sm" title={s}>
                        {s === "started" ? "▶" : s === "completed" ? "✓" : s === "postponed" ? "→" : "✕"}
                      </button>
                    </form>
                  ))}
                  <form action={deleteTask}>
                    <input type="hidden" name="taskId" value={t.id} />
                    <button className="btn btn-sm btn-danger" title="delete">
                      del
                    </button>
                  </form>
                </span>
              </li>
            ))}
            {!tasks.length && <li className="muted text-sm">No tasks for today.</li>}
          </ul>
          <ActionForm action={createTask} submitLabel="Add task">
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Field label="Title" className="col-span-2">
                <input name="title" className="input" required />
              </Field>
              <Field label="Domain">
                <DomainSelect />
              </Field>
              <Field label="Est. min">
                <input name="estMinutes" type="number" className="input" />
              </Field>
            </div>
          </ActionForm>
        </Panel>
        <Panel title="Protocols" sub="Reusable routines — adherence measured, perfection not required">
          {ds.protocols.map((p) => (
            <ActionForm key={p.id} action={logProtocolRun} submitLabel={`Log today: ${p.name}`} submitClass="btn btn-sm">
              <input type="hidden" name="protocolId" value={p.id} />
              <div className="font-medium">{p.name}</div>
              <div className="mt-1 grid gap-1">
                {p.steps.map((s) => (
                  <label key={s.id} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="step" value={s.id} />
                    <span className="num muted w-12">{s.time ?? ""}</span>
                    {s.label}
                  </label>
                ))}
              </div>
            </ActionForm>
          ))}
          <details className="mt-3">
            <summary className="link text-sm">Define a protocol</summary>
            <ActionForm action={defineProtocol}>
              <Field label="Name">
                <input name="name" className="input" required />
              </Field>
              <Field label="Steps (one per line, optional HH:MM prefix)" className="mt-2">
                <textarea name="steps" rows={4} className="input" placeholder={"07:30 Phone in drawer\n08:00 German deep work"} />
              </Field>
            </ActionForm>
          </details>
        </Panel>
      </Grid>
    </div>
  );
}
