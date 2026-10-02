import { getAnalysis } from "@/server/context";
import { PageHeader, Panel, Grid, Badge, Empty, Field, Delta } from "@/components/ui";
import { ActionForm } from "@/components/ActionForm";
import { createExperiment, concludeExperiment, startIntervention, endIntervention } from "@/server/actions";
import { evaluateExperiment, evaluateIntervention, activeExperiments } from "@/experiments/evaluate";
import { SERIES_METRICS, METRIC_MAP } from "@/metrics/series";
import { fmtUnit, fmtDelta } from "@/components/format";

export const dynamic = "force-dynamic";

export default async function ExperimentsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const { ds, insights } = getAnalysis();
  const fromInsight = sp.from ? insights.find((i) => i.ruleId === sp.from)?.experiment : undefined;
  const phoneTpl = sp.template === "phone" ? { title: `Phone ≤ ${ds.settings.phoneLimitMin} min/day`, hypothesis: `Phone ≤ ${ds.settings.phoneLimitMin} min/day improves productive output.`, primaryMetric: "deep.min", metrics: ["phone.total", "deep.min", "german.min", "law.min", "exec.pct", "focus.avg"], durationDays: 30 } : undefined;
  const tpl = fromInsight ?? phoneTpl ?? (sp.metric ? { title: "", hypothesis: sp.x ? `Changing ${METRIC_MAP.get(sp.x)?.label ?? sp.x} changes ${METRIC_MAP.get(sp.metric)?.label ?? sp.metric}.` : "", primaryMetric: sp.metric, metrics: [sp.metric, ...(sp.x ? [sp.x] : [])], durationDays: 30 } : undefined);
  const active = activeExperiments(ds);
  const evals = ds.experiments.map((e) => evaluateExperiment(ds, e));
  return (
    <div className="space-y-3">
      <PageHeader title="Experiments & interventions" subtitle={`Hypothesis → baseline → change → period → result → confidence → decision. Max ${ds.settings.maxConcurrentExperiments} concurrent experiments (${active.length} running).`} />
      {evals.length ? (
        <div className="grid gap-3 xl:grid-cols-2">
          {evals.map((ev) => (
            <Panel key={ev.experiment.id} title={ev.experiment.status === "concluded" ? `Concluded · ${ev.experiment.decision}` : ev.complete ? "Complete — decision needed" : `Running · day ${ev.dayOf}/${ev.experiment.durationDays}`} right={<Badge tone={ev.suggestion === "adopt" ? "good" : ev.suggestion === "reject" ? "risk" : "neutral"}>{`suggests: ${ev.suggestion}`}</Badge>}>
              <h3 className="font-semibold">{ev.experiment.title}</h3>
              <p className="text-2 text-sm">Hypothesis: {ev.experiment.hypothesis}</p>
              {ev.experiment.change && <p className="text-2 text-sm">Change: {ev.experiment.change}</p>}
              <p className="muted mt-1 text-xs">
                Baseline {ev.baseline.from} → {ev.baseline.to} · Test {ev.test.from} → {ev.test.to}
              </p>
              {ev.comparisons.length ? (
                <table className="data mt-2">
                  <thead>
                    <tr>
                      <th>Metric</th>
                      <th>Baseline</th>
                      <th>During</th>
                      <th>Δ</th>
                      <th>d</th>
                      <th>n</th>
                      <th>Conf.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ev.comparisons.map((c) => {
                      const m = METRIC_MAP.get(c.key)!;
                      return (
                        <tr key={c.key} style={c.key === ev.experiment.primaryMetric ? { fontWeight: 600 } : undefined}>
                          <td>
                            {c.label}
                            {c.key === ev.experiment.primaryMetric ? " ★" : ""}
                          </td>
                          <td>{fmtUnit(c.baseline, m.unit)}</td>
                          <td>{fmtUnit(c.during, m.unit)}</td>
                          <td>
                            <Delta value={c.delta} better={c.better}>
                              {fmtDelta(c.delta, m.unit)}
                            </Delta>
                          </td>
                          <td>{c.d?.toFixed(2) ?? "—"}</td>
                          <td className="muted text-xs">
                            {c.nBase}/{c.nDuring}
                          </td>
                          <td className="muted text-xs">{c.confidence}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <p className="muted mt-2 text-sm">Starts {ev.experiment.startDate}.</p>
              )}
              <p className="muted mt-1 text-[11px]">Decision rule: adopt if the primary metric improves with d ≥ 0.3 and ≥ 14 days each side; before/after comparisons cannot exclude other changes.</p>
              {ev.experiment.status !== "concluded" && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {["adopt", "reject", "extend", "inconclusive"].map((d) => (
                    <form key={d} action={concludeExperiment}>
                      <input type="hidden" name="experimentId" value={ev.experiment.id} />
                      <input type="hidden" name="decision" value={d} />
                      <button className="btn btn-sm">{d}</button>
                    </form>
                  ))}
                </div>
              )}
              {ev.experiment.note && <p className="text-2 mt-1 text-xs">Note: {ev.experiment.note}</p>}
            </Panel>
          ))}
        </div>
      ) : (
        <Empty>No experiments yet.</Empty>
      )}
      <Grid cols="lg:grid-cols-2">
        <Panel title="New experiment" id="new">
          <ActionForm action={createExperiment} submitLabel="Create experiment">
            <div className="grid grid-cols-2 gap-2">
              <Field label="Title" className="col-span-2">
                <input name="title" className="input" defaultValue={tpl?.title} required />
              </Field>
              <Field label="Hypothesis" className="col-span-2">
                <textarea name="hypothesis" className="input" rows={2} defaultValue={tpl?.hypothesis} required />
              </Field>
              <Field label="Change (what you do differently)" className="col-span-2">
                <input name="change" className="input" />
              </Field>
              <Field label="Primary metric">
                <select name="primaryMetric" className="input" defaultValue={tpl?.primaryMetric}>
                  {SERIES_METRICS.map((m) => (
                    <option key={m.key} value={m.key}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Start">
                <input name="startDate" type="date" defaultValue={ds.asOf} className="input" />
              </Field>
              <Field label="Baseline days">
                <input name="baselineDays" type="number" defaultValue={30} min={7} className="input" />
              </Field>
              <Field label="Duration days">
                <input name="durationDays" type="number" defaultValue={tpl?.durationDays ?? 30} min={7} className="input" />
              </Field>
              <Field label="Secondary metrics" className="col-span-2">
                <select name="metrics" multiple className="input h-28" defaultValue={tpl?.metrics}>
                  {SERIES_METRICS.map((m) => (
                    <option key={m.key} value={m.key}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </ActionForm>
        </Panel>
        <Panel title="Interventions (14 / 30 / 90 days)" sub="Attach an action to a bottleneck and measure it">
          <table className="data mb-3">
            <tbody>
              {ds.interventions.map((i) => {
                const ev = evaluateIntervention(ds, i);
                const m = METRIC_MAP.get(i.metricKey);
                return (
                  <tr key={i.id}>
                    <td>
                      <div className="font-medium">{i.bottleneck}</div>
                      <div className="muted text-xs">
                        {i.action} · {i.startDate} · {i.durationDays}d {ev.complete ? "· complete" : `· day ${ev.dayOf}`}
                      </div>
                    </td>
                    <td>
                      {ev.comparison && m ? (
                        <>
                          {fmtUnit(ev.comparison.baseline, m.unit)} → {fmtUnit(ev.comparison.during, m.unit)}{" "}
                          <Delta value={ev.comparison.delta} better={ev.comparison.better}>
                            {fmtDelta(ev.comparison.delta, m.unit)}
                          </Delta>
                        </>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>
                      {!i.endedAt && (
                        <form action={endIntervention}>
                          <input type="hidden" name="interventionId" value={i.id} />
                          <button className="btn btn-sm">end</button>
                        </form>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <ActionForm action={startIntervention} submitLabel="Start intervention">
            <div className="grid grid-cols-2 gap-2">
              <Field label="Bottleneck" className="col-span-2">
                <input name="bottleneck" className="input" defaultValue={sp.intervention} required />
              </Field>
              <Field label="Action" className="col-span-2">
                <input name="action" className="input" required />
              </Field>
              <Field label="Metric">
                <select name="metricKey" className="input" defaultValue={sp.metric || "productive.min"}>
                  {SERIES_METRICS.map((m) => (
                    <option key={m.key} value={m.key}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Direction">
                <select name="direction" className="input" defaultValue={sp.dir ?? "up"}>
                  <option value="up">up</option>
                  <option value="down">down</option>
                </select>
              </Field>
              <Field label="Duration">
                <select name="durationDays" className="input">
                  <option value="14">14 days</option>
                  <option value="30">30 days</option>
                  <option value="90">90 days</option>
                </select>
              </Field>
              <Field label="Start">
                <input name="startDate" type="date" defaultValue={ds.asOf} className="input" />
              </Field>
            </div>
          </ActionForm>
        </Panel>
      </Grid>
    </div>
  );
}
