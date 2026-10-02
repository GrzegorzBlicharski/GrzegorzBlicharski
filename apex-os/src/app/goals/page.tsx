import { getDataset } from "@/server/context";
import { PageHeader, Panel, Grid, Badge, Empty, Field, Progress } from "@/components/ui";
import { ActionForm } from "@/components/ActionForm";
import { createGoal, goalProgress, setGoalStatus, recordForecasts } from "@/server/actions";
import { goalStatus, monteCarlo, hoursScenarios, phoneScenarios, trendExtrapolation } from "@/forecasting/goals";
import { resolveForecasts } from "@/forecasting/log";
import { DomainSelect } from "@/components/forms";
import { SERIES_METRICS, windowAgg, METRIC_MAP } from "@/metrics/series";
import { fmtNum, fmtPct, fmtMin, fmtUnit } from "@/components/format";
import { targetCapacityGap } from "@/modules/recovery";

export const dynamic = "force-dynamic";

export default function GoalsPage() {
  const ds = getDataset();
  const goals = ds.goals;
  const fl = resolveForecasts(ds);
  const german = goals.find((g) => g.status === "active" && g.metricKey === "german.min" && g.kind === "cumulative") ?? null;
  const law = goals.find((g) => g.status === "active" && g.metricKey === "law.min" && g.kind === "cumulative") ?? null;
  const t = ds.settings.targets;
  const targets = [
    { label: "Phone ≤", key: "phone.total", target: ds.settings.phoneLimitMin, down: true },
    { label: "German", key: "german.min", target: t.germanMin.target },
    { label: "Law", key: "law.min", target: t.lawMin.target },
    { label: "Law questions", key: "law.questions", target: t.lawQuestions.target },
    { label: "Deep work", key: "deep.min", target: t.deepMin.target },
    { label: "Execution", key: "exec.pct", target: t.executionPct },
  ];
  return (
    <div className="space-y-3">
      <PageHeader title="Goals & forecasts" subtitle="Progress against each goal, the pace you need, and realistic forecasts — each one checked later for accuracy.">
        <form action={recordForecasts}>
          <button className="btn">Record forecast snapshot</button>
        </form>
      </PageHeader>
      <Panel title="Current vs target (30D average per day)">
        <div className="overflow-x-auto">
          <table className="data">
            <thead>
              <tr>
                <th>Target</th>
                <th>Current 30D</th>
                <th>Target</th>
                <th>Gap</th>
                <th>Sustained capacity check</th>
              </tr>
            </thead>
            <tbody>
              {targets.map((x) => {
                const m = METRIC_MAP.get(x.key)!;
                const cur = windowAgg(ds, x.key, "30D").value;
                const ok = cur != null && (x.down ? cur <= x.target : cur >= x.target);
                return (
                  <tr key={x.key}>
                    <td>{x.label}</td>
                    <td>{fmtUnit(cur, m.unit)}</td>
                    <td>{fmtUnit(x.target, m.unit)}</td>
                    <td>
                      <Badge tone={cur == null ? "neutral" : ok ? "good" : "warn"}>{cur == null ? "no data" : ok ? "met" : fmtUnit(Math.abs(x.target - cur), m.unit)}</Badge>
                    </td>
                    <td className="muted text-xs">{x.key === "german.min" || x.key === "law.min" ? "" : ""}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {(() => {
            const g = targetCapacityGap(ds, t.productiveMin.target);
            return (
              <p className="text-2 mt-2 text-xs">
                Productive target {fmtMin(g.target)}/day vs highest sustained 30D {fmtMin(g.sustained30)} · 90D {fmtMin(g.sustained90)}.{g.aboveEverSustained ? " The target is higher than anything sustained so far — treat it as stretch." : ""}
              </p>
            );
          })()}
        </div>
      </Panel>
      {goals.length ? (
        <div className="grid gap-3 xl:grid-cols-2">
          {goals.map((g) => {
            const st = goalStatus(ds, g);
            const mc = g.kind === "cumulative" ? monteCarlo(ds, g) : null;
            const tone = st.status === "BEHIND" ? "risk" : st.status === "NO DATA" || st.status === "NO DEADLINE" ? "neutral" : "good";
            return (
              <Panel key={g.id} title={`${g.tier} · weight ${g.weight}`} right={<Badge tone={tone}>{st.status}</Badge>}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-lg font-semibold">{g.title}</h3>
                  <span className="muted text-xs">
                    {g.kind} · {g.metricKey ?? "manual"} · {g.startDate} → {g.deadline ?? "no deadline"} · {g.status}
                  </span>
                </div>
                <div className="num mt-1 text-sm">
                  {fmtNum(st.current, 1)} / {fmtNum(g.target)} {g.unit} ({fmtPct(st.pct)}){st.expected != null && <span className="muted"> · expected today {fmtNum(st.expected, 1)}</span>}
                </div>
                <Progress value={st.current ?? 0} max={g.target} marker={st.expected ?? undefined} tone={tone === "risk" ? "risk" : "accent"} />
                <dl className="text-2 mt-2 grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs">
                  <dt>Current rate (30D)</dt>
                  <dd>{st.rate30 != null ? `${fmtNum(st.rate30, 2)} ${g.unit}/day` : "—"}</dd>
                  <dt>Required rate</dt>
                  <dd>{st.requiredRate != null ? `${fmtNum(st.requiredRate, 2)} ${g.unit}/day` : "—"}</dd>
                  <dt>Projected at current rate</dt>
                  <dd>{st.projectedDate ?? "—"}</dd>
                  <dt>Days left</dt>
                  <dd>{st.daysLeft ?? "—"}</dd>
                  {g.leading.length > 0 && (
                    <>
                      <dt>Leading indicators</dt>
                      <dd>{g.leading.map((k) => `${METRIC_MAP.get(k)?.label ?? k}: ${fmtUnit(windowAgg(ds, k, "30D").value, METRIC_MAP.get(k)?.unit ?? "count")}`).join(" · ")}</dd>
                    </>
                  )}
                </dl>
                {mc && (
                  <div className="mt-2 rounded border p-2 text-xs" style={{ borderColor: "var(--border)" }}>
                    {mc.ok ? (
                      <>
                        <div>
                          <b>Monte Carlo</b> ({mc.runs} runs, {mc.historyDays}-day history, seed {mc.seed}): completion P10 {mc.p10 ?? "—"} · P50 {mc.p50 ?? "—"} · P90 {mc.p90 ?? "beyond horizon"}
                          {mc.probabilityByDeadline != null && <> · P(by deadline) ≈ {(mc.probabilityByDeadline * 100).toFixed(0)}%</>}
                        </div>
                        <div className="muted mt-1">Assumptions: {mc.assumptions.join(" ")}</div>
                      </>
                    ) : (
                      <span className="muted">Monte Carlo: {mc.reason}</span>
                    )}
                  </div>
                )}
                <div className="mt-2 flex flex-wrap gap-2">
                  {(g.kind === "manual" || g.kind === "level") && (
                    <ActionForm action={goalProgress} submitLabel="Record value" submitClass="btn btn-sm">
                      <input type="hidden" name="goalId" value={g.id} />
                      <input name="value" type="number" step="any" className="input w-28" placeholder="value" />
                    </ActionForm>
                  )}
                  {["achieved", "paused", "dropped", "active"]
                    .filter((s) => s !== g.status)
                    .map((s) => (
                      <form key={s} action={setGoalStatus}>
                        <input type="hidden" name="goalId" value={g.id} />
                        <input type="hidden" name="status" value={s} />
                        <button className="btn btn-sm">{s}</button>
                      </form>
                    ))}
                </div>
              </Panel>
            );
          })}
        </div>
      ) : (
        <Empty>No goals yet.</Empty>
      )}
      <Grid cols="lg:grid-cols-3">
        <Panel title="Scenario: German hours/day" sub="Realistic = scenario × your historical execution">
          <ScenarioTable rows={hoursScenarios(ds, german, [3, 5, 7], "german.min")} />
        </Panel>
        <Panel title="Scenario: Law hours/day">
          <ScenarioTable rows={hoursScenarios(ds, law, [1, 2, 3], "law.min")} />
        </Panel>
        <Panel title="Scenario: phone limit" sub="Arithmetic vs current 30D phone average">
          <table className="data">
            <thead>
              <tr>
                <th>Limit</th>
                <th>Δ/day</th>
                <th>h/month</th>
              </tr>
            </thead>
            <tbody>
              {phoneScenarios(ds, [30, 60, 90]).map((p) => (
                <tr key={p.limit}>
                  <td>{p.limit} min</td>
                  <td>{fmtMin(p.deltaPerDay)}</td>
                  <td>{fmtNum(p.hoursPerMonth, 1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {(() => {
            const te = trendExtrapolation(ds, "phone.total", 90);
            return <p className="muted mt-2 text-[11px]">{te.value != null ? `If the current 30D trend continued: ~${fmtMin(Math.max(0, te.value))}/day in 90 days. ${te.note}` : te.note}</p>;
          })()}
        </Panel>
      </Grid>
      <Panel title="Forecast log & model error" sub="Every recorded forecast is scored after its horizon">
        <div className="mb-2 text-sm">
          Resolved {fl.resolvedN} · MAPE {fl.mape != null ? `${fl.mape.toFixed(1)}%` : "—"} · bias {fl.bias != null ? fl.bias.toFixed(1) : "—"} · calibration (inside P10–P90) {fl.calibration != null ? `${fl.calibration.toFixed(0)}%` : "—"}
        </div>
        {fl.items.length ? (
          <table className="data">
            <thead>
              <tr>
                <th>Recorded</th>
                <th>Metric</th>
                <th>Horizon</th>
                <th>Projected</th>
                <th>Actual</th>
                <th>Error</th>
              </tr>
            </thead>
            <tbody>
              {fl.items.slice(0, 20).map((f) => (
                <tr key={f.id}>
                  <td className="num">{f.createdAt.slice(0, 10)}</td>
                  <td>{f.metricKey}</td>
                  <td className="num">{f.horizonDate}</td>
                  <td>{fmtNum(f.projectedValue, 1)}</td>
                  <td>{f.resolved ? fmtNum(f.actual, 1) : <span className="muted">pending</span>}</td>
                  <td>{f.error != null ? `${f.error > 0 ? "+" : ""}${fmtNum(f.error, 1)} (${fmtNum(f.absPctError, 1)}%)` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <Empty>No forecasts recorded yet. Use “Record forecast snapshot”.</Empty>
        )}
      </Panel>
      <Panel title="New goal">
        <ActionForm action={createGoal} submitLabel="Create goal">
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            <Field label="Title" className="col-span-2">
              <input name="title" className="input" required placeholder="e.g. German C1 / 600 study hours" />
            </Field>
            <Field label="Domain">
              <DomainSelect />
            </Field>
            <Field label="Kind">
              <select name="kind" className="input">
                <option value="cumulative">cumulative (sum of metric)</option>
                <option value="rate">rate (30D average)</option>
                <option value="manual">manual / level (recorded values)</option>
              </select>
            </Field>
            <Field label="Metric">
              <select name="metricKey" className="input">
                <option value="">— (manual)</option>
                {SERIES_METRICS.map((m) => (
                  <option key={m.key} value={m.key}>
                    {m.label} ({m.key})
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Target">
              <input name="target" type="number" step="any" className="input" required />
            </Field>
            <Field label="Unit">
              <input name="unit" className="input" defaultValue="h" />
            </Field>
            <Field label="Direction">
              <select name="direction" className="input">
                <option value="up">higher is progress</option>
                <option value="down">lower is progress</option>
              </select>
            </Field>
            <Field label="Start">
              <input name="startDate" type="date" defaultValue={ds.asOf} className="input" />
            </Field>
            <Field label="Deadline">
              <input name="deadline" type="date" className="input" />
            </Field>
            <Field label="Weight 1–5">
              <input name="weight" type="number" min={1} max={5} defaultValue={3} className="input" />
            </Field>
            <Field label="Tier">
              <select name="tier" className="input">
                <option>PRIMARY</option>
                <option>SECONDARY</option>
                <option>MAINTENANCE</option>
              </select>
            </Field>
            <Field label="Leading indicators (metric keys, comma separated)" className="col-span-2 md:col-span-4">
              <input name="leading" className="input" placeholder="german.speakingMin, german.words" />
            </Field>
          </div>
        </ActionForm>
      </Panel>
    </div>
  );
}

function ScenarioTable({ rows }: { rows: ReturnType<typeof hoursScenarios> }) {
  return (
    <table className="data">
      <thead>
        <tr>
          <th>Scenario</th>
          <th>Realistic/day</th>
          <th>Goal reached</th>
          <th />
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.label}>
            <td>{r.label}</td>
            <td>{fmtMin(r.realisticPerDay)}</td>
            <td>{r.completion ?? "—"}</td>
            <td>{r.aboveCapacity && <Badge tone="warn">above sustained capacity</Badge>}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
