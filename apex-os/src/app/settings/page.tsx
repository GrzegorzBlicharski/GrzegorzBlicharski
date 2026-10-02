import { getDataset } from "@/server/context";
import { PageHeader, Panel, Grid, Field } from "@/components/ui";
import { ActionForm } from "@/components/ActionForm";
import { saveSettingsForm, updateSettings } from "@/server/actions";
import { PHONE_CATEGORIES, LAW_AREAS, GERMAN_SKILLS } from "@/domains/catalog";
import { minimumDay } from "@/modules/consistency";

export const dynamic = "force-dynamic";

const LADDERS: [string, string][] = [
  ["germanMin", "German (min/day)"],
  ["lawMin", "Law (min/day)"],
  ["lawQuestions", "Law questions/day"],
  ["deepMin", "Deep work (min/day)"],
  ["productiveMin", "Productive (min/day)"],
];

export default function SettingsPage() {
  const ds = getDataset();
  const st = ds.settings;
  const md = minimumDay(ds);
  const mixTotal = Object.values(st.germanTargetMix).reduce((a, b) => a + b, 0) || 1;
  return (
    <div className="space-y-3">
      <PageHeader title="Settings" subtitle="Changes apply from the date you choose. Past days keep the targets that were in force then." />
      <ActionForm action={saveSettingsForm} submitLabel="Save as new settings version" resetOnSuccess={false}>
        <div className="space-y-3">
          <Panel title="Version">
            <div className="flex flex-wrap items-end gap-3">
              <Field label="Effective from">
                <input type="date" name="effectiveFrom" defaultValue={ds.asOf} className="input" />
              </Field>
              <p className="muted text-xs">{ds.settingsVersions.length} versions recorded.</p>
            </div>
          </Panel>
          <Grid cols="lg:grid-cols-2">
            <Panel title="Digital hygiene">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <Field label="Phone limit (min/day)">
                  <input name="phoneLimitMin" type="number" min={0} defaultValue={st.phoneLimitMin} className="input" />
                </Field>
                <Field label="Morning ends">
                  <input name="morningEnd" type="time" defaultValue={st.morningEnd} className="input" />
                </Field>
                <Field label="Evening starts">
                  <input name="eveningStart" type="time" defaultValue={st.eveningStart} className="input" />
                </Field>
                <Field label="Day starts at (h)">
                  <input name="dayStartHour" type="number" min={0} max={8} defaultValue={st.dayStartHour} className="input" />
                </Field>
              </div>
              <div className="label mt-3">Productive phone categories</div>
              <div className="mt-1 flex flex-wrap gap-3 text-sm">
                {PHONE_CATEGORIES.map((c) => (
                  <label key={c} className="flex items-center gap-1">
                    <input type="checkbox" name="productivePhoneCategories" value={c} defaultChecked={st.productivePhoneCategories.includes(c)} /> {c}
                  </label>
                ))}
              </div>
              <div className="label mt-3">No-phone windows</div>
              <div className="mt-1 space-y-2">
                {st.noPhoneWindows.map((w) => (
                  <div key={w.id} className="flex flex-wrap items-center gap-2 text-sm">
                    <label className="flex w-40 items-center gap-1">
                      <input type="checkbox" name={`npw_${w.id}_enabled`} defaultChecked={w.enabled} /> {w.label}
                    </label>
                    {w.kind === "afterWake" && (
                      <input name={`npw_${w.id}_minutes`} type="number" defaultValue={w.minutes} className="input w-24" title="minutes after wake" />
                    )}
                    {w.kind === "custom" && (
                      <>
                        <input name={`npw_${w.id}_start`} type="time" defaultValue={w.start} className="input w-28" />
                        <input name={`npw_${w.id}_end`} type="time" defaultValue={w.end} className="input w-28" />
                      </>
                    )}
                    {w.kind === "deepWork" && <span className="muted text-xs">during sessions classified DEEP</span>}
                  </div>
                ))}
              </div>
              <div className="label mt-3">Budgets (min/day, empty = off)</div>
              <div className="mt-1 grid grid-cols-3 gap-2">
                <Field label="Phone">
                  <input name="budget_phone" type="number" defaultValue={st.budgets.phone ?? undefined} className="input" />
                </Field>
                <Field label="Distraction">
                  <input name="budget_distraction" type="number" defaultValue={st.budgets.distraction ?? undefined} className="input" />
                </Field>
                <Field label="Passive learning">
                  <input name="budget_passiveLearning" type="number" defaultValue={st.budgets.passiveLearning ?? undefined} className="input" />
                </Field>
              </div>
              <div className="label mt-3">Phone baseline window for reclaimed time (empty = first 30 days)</div>
              <div className="mt-1 grid grid-cols-2 gap-2">
                <input name="baseline_from" type="date" defaultValue={st.phoneBaseline?.from} className="input" />
                <input name="baseline_to" type="date" defaultValue={st.phoneBaseline?.to} className="input" />
              </div>
            </Panel>
            <Panel title="Targets — floor / target / stretch">
              <table className="data">
                <thead>
                  <tr>
                    <th>Metric</th>
                    <th>Floor</th>
                    <th>Target</th>
                    <th>Stretch</th>
                  </tr>
                </thead>
                <tbody>
                  {LADDERS.map(([k, l]) => {
                    const v = st.targets[k as keyof typeof st.targets] as { floor: number; target: number; stretch: number };
                    return (
                      <tr key={k}>
                        <td>{l}</td>
                        {(["floor", "target", "stretch"] as const).map((x) => (
                          <td key={x}>
                            <input name={`${k}_${x}`} type="number" min={0} defaultValue={v[x]} className="input w-20" />
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Field label="Execution target %">
                  <input name="executionPct" type="number" defaultValue={st.targets.executionPct} className="input" />
                </Field>
                <Field label="Max concurrent experiments">
                  <input name="maxConcurrentExperiments" type="number" min={1} max={10} defaultValue={st.maxConcurrentExperiments} className="input" />
                </Field>
              </div>
              <div className="label mt-3">Deep work classification</div>
              <div className="mt-1 grid grid-cols-3 gap-2">
                <Field label="Min minutes">
                  <input name="deep_minMinutes" type="number" defaultValue={st.deep.minMinutes} className="input" />
                </Field>
                <Field label="Max interruptions">
                  <input name="deep_maxInterruptions" type="number" defaultValue={st.deep.maxInterruptions} className="input" />
                </Field>
                <Field label="Min focus">
                  <input name="deep_minFocus" type="number" min={1} max={5} defaultValue={st.deep.minFocus} className="input" />
                </Field>
              </div>
              <Field label={`Minimum day (one per line, "metric.key >= value"; empty = ${md.source === "suggested" ? "system suggestion" : "default"})`} className="mt-3">
                <textarea name="minimumDay" rows={3} className="input" defaultValue={st.minimumDay.map((m) => `${m.metricKey} >= ${m.min}`).join("\n")} placeholder={md.items.map((m) => `${m.metricKey} >= ${m.min}`).join("\n") || "german.speakingMin >= 30\nlaw.questions >= 30"} />
              </Field>
            </Panel>
          </Grid>
          <Grid cols="lg:grid-cols-2">
            <Panel title="German target mix (%)" sub="Flags (too little / too much) are computed only against this mix">
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {GERMAN_SKILLS.map((k) => (
                  <Field key={k} label={k}>
                    <input name={`mix_${k}`} type="number" min={0} max={100} defaultValue={st.germanTargetMix[k] != null ? Math.round((st.germanTargetMix[k] / mixTotal) * 100) : undefined} className="input" />
                  </Field>
                ))}
                <Field label="Max passive share %">
                  <input name="germanMaxPassiveShare" type="number" min={0} max={100} defaultValue={Math.round(st.germanMaxPassiveShare * 100)} className="input" />
                </Field>
              </div>
            </Panel>
            <Panel title="Law areas & readiness weights">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {LAW_AREAS.map((a) => (
                  <Field key={a} label={a}>
                    <select name={`tier_${a}`} defaultValue={st.lawAreaTiers[a] ?? ""} className="input">
                      <option value="">—</option>
                      <option>PRIMARY</option>
                      <option>SECONDARY</option>
                      <option>MAINTENANCE</option>
                    </select>
                  </Field>
                ))}
              </div>
              <div className="label mt-3">Readiness weights</div>
              <div className="mt-1 grid grid-cols-4 gap-2">
                {Object.entries(st.readinessWeights).map(([k, v]) => (
                  <Field key={k} label={k}>
                    <input name={`rw_${k}`} type="number" step="0.05" min={0} max={1} defaultValue={v} className="input" />
                  </Field>
                ))}
              </div>
            </Panel>
          </Grid>
        </div>
      </ActionForm>
      <Grid cols="lg:grid-cols-2">
        <Panel title="Version history">
          <table className="data">
            <tbody>
              {[...ds.settingsVersions].reverse().map((v) => (
                <tr key={v.id}>
                  <td className="num">{v.effectiveFrom}</td>
                  <td className="muted text-xs">recorded {v.recordedAt.slice(0, 16)}</td>
                  <td className="text-xs">
                    <code>{JSON.stringify(v.patch).slice(0, 160)}</code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
        <Panel title="Advanced: raw JSON patch" sub="Classification rules, etc. Deep-merged; arrays replace.">
          <ActionForm action={updateSettings} submitLabel="Apply patch">
            <Field label="Effective from">
              <input type="date" name="effectiveFrom" defaultValue={ds.asOf} className="input" />
            </Field>
            <Field label="Patch" className="mt-2">
              <textarea name="patch" rows={6} className="input font-mono text-xs" defaultValue={JSON.stringify({ classificationRules: st.classificationRules }, null, 2)} />
            </Field>
          </ActionForm>
        </Panel>
      </Grid>
    </div>
  );
}
