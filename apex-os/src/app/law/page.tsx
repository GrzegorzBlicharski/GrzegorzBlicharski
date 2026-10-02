import { getAnalysis } from "@/server/context";
import { PageHeader, Panel, Grid, Badge, Empty, Kpi, Field, InsightCard, Progress } from "@/components/ui";
import { TrendChart, Bars } from "@/components/charts";
import { seriesWithAvg, MetricWindowTable } from "@/components/metricViews";
import { areaMap, confidenceMatrix, retentionCurve, dueTopics, readiness, readingRetentionCheck, specialization } from "@/modules/law";
import { effectiveness } from "@/modules/learning";
import { fmtPct, fmtNum } from "@/components/format";
import { sliceDays, windowAgg } from "@/metrics/series";
import { addDays } from "@/core/dates";
import { TEST_KINDS, LAW_SKILLS } from "@/domains/catalog";
import { ActionForm } from "@/components/ActionForm";
import { recordTest } from "@/server/actions";
import { LawAreaSelect } from "@/components/forms";

export const dynamic = "force-dynamic";

export default function LawPage() {
  const { ds, insights } = getAnalysis();
  const areas = areaMap(ds);
  const cm = confidenceMatrix(sliceDays(ds, addDays(ds.asOf, -29), ds.asOf));
  const curve = retentionCurve(ds);
  const due = dueTopics(ds);
  const rd = readiness(ds);
  const rr = readingRetentionCheck(ds);
  const eff = effectiveness(ds);
  const spec = specialization(ds).slice(0, 8);
  const own = insights.filter((i) => i.domain === "LAW");
  const q30 = windowAgg(ds, "law.questions", "30D");
  const acc30 = windowAgg(ds, "law.accuracy", "30D");
  const tests = ds.tests.filter((t) => t.domain === "LAW").slice(-15).reverse();
  return (
    <div className="space-y-3">
      <PageHeader title="Law" subtitle="What you know, what you are forgetting, and how ready you are — measured from answers and tests, not hours." />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Kpi label="Questions 30D" value={fmtNum(q30.total)} sub={`${fmtNum(q30.value, 0)}/day`} metricKey="law.questions" />
        <Kpi label="Accuracy 30D" value={fmtPct(acc30.value, 1)} metricKey="law.accuracy" />
        <Kpi label="High-confidence errors" value={fmtPct(cm.total ? (cm.wrongConf / cm.total) * 100 : null, 1)} sub="30D, of all answers" tone={cm.total && cm.wrongConf / cm.total > 0.08 ? "warn" : "neutral"} metricKey="law.highConfErrors" />
        <Kpi label="Topics due" value={fmtNum(due.length)} sub={`${due.filter((d) => d.risk === "at-risk").length} at risk`} tone={due.length > 20 ? "warn" : "neutral"} href="#due" />
        <Kpi label="Active-recall ratio" value={fmtPct(rr.recallRatio)} sub={`reading ${fmtPct(rr.readingShare)} of law time`} tone={rr.flag ? "risk" : "neutral"} metricKey="law.recallRatio" />
        <Kpi label="Readiness (est.)" value={rd.composite != null ? fmtNum(rd.composite, 0) : "—"} sub={`components below · ${rd.confidence} conf.`} />
      </div>
      {rr.flag && (
        <Badge tone="risk">Reading a lot, retaining little: reading {fmtPct(rr.readingShare)} of law time, spaced retention {fmtPct(rr.retention)}</Badge>
      )}
      <Grid cols="lg:grid-cols-3">
        <Panel title="Accuracy per day (90D)" className="lg:col-span-2">
          <TrendChart data={seriesWithAvg(ds, "law.accuracy", 90)} unit="pct" />
        </Panel>
        <Panel title="Readiness components" sub="ESTIMATED · weights visible & editable in Settings">
          <div className="space-y-2">
            {rd.components.map((c) => (
              <div key={c.key}>
                <div className="flex justify-between text-sm">
                  <span>{c.label}</span>
                  <span className="num">{c.value != null ? fmtNum(c.value, 0) : "—"}</span>
                </div>
                <Progress value={c.value ?? 0} max={100} tone={c.value == null ? "neutral" : c.value >= 75 ? "good" : c.value >= 55 ? "accent" : "warn"} />
                <div className="muted text-[11px]">
                  {c.detail} · weight {c.weight}
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </Grid>
      <Panel title="Area map" sub="All-time + 30D accuracy, spaced retention (≥4-day gaps, 90D), last review. Regression = 3 consecutive weekly declines.">
        <div className="overflow-x-auto">
          <table className="data">
            <thead>
              <tr>
                <th>Area</th>
                <th>Tier</th>
                <th>Hours</th>
                <th>Questions</th>
                <th>Accuracy</th>
                <th>Recent 30D</th>
                <th>Retention</th>
                <th>Last reviewed</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {areas.map((a) => (
                <tr key={a.area}>
                  <td className="font-medium">{a.area}</td>
                  <td className="muted text-xs">{a.tier}</td>
                  <td>{fmtNum(a.minutes / 60, 1)}</td>
                  <td>{fmtNum(a.questions)}</td>
                  <td>{fmtPct(a.accuracy, 1)}</td>
                  <td>
                    {fmtPct(a.recentAccuracy, 1)} <span className="muted text-[10px]">n={a.recentN}</span>
                  </td>
                  <td>
                    {fmtPct(a.retention, 1)} <span className="muted text-[10px]">n={a.retentionN}</span>
                  </td>
                  <td className="num">{a.lastReviewed ? `${a.lastReviewed} (${a.daysSince}d)` : <span className="muted">never</span>}</td>
                  <td>{a.regression && <Badge tone="risk">regressing</Badge>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
      <Grid cols="lg:grid-cols-3">
        <Panel title="Confidence matrix (30D)" sub="Incorrect + confident = misconception">
          <div className="grid grid-cols-2 gap-2 text-center">
            {[
              ["Correct · confident", cm.correctConf, "good"],
              ["Correct · uncertain", cm.correctUnsure, "neutral"],
              ["Incorrect · uncertain", cm.wrongUnsure, "warn"],
              ["Incorrect · confident", cm.wrongConf, "risk"],
            ].map(([l, v, t]) => (
              <div key={l as string} className="rounded border p-3" style={{ borderColor: t === "risk" ? "var(--risk)" : "var(--border)" }}>
                <div className="num text-xl font-semibold">{fmtNum(v as number)}</div>
                <div className="muted text-xs">{l}</div>
                <div className="muted text-[11px]">{cm.total ? fmtPct(((v as number) / cm.total) * 100, 1) : "—"}</div>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Retention by review interval" sub="Accuracy when a topic is revisited after a gap (all-time)">
          <Bars data={curve.map((c) => ({ label: c.bucket, value: c.accuracy == null ? null : Math.round(c.accuracy * 10) / 10 }))} unit="pct" height={180} />
          <div className="muted text-[11px]">n: {curve.map((c) => `${c.bucket} ${c.n}`).join(" · ")}</div>
        </Panel>
        <Panel title="Topics at risk of forgetting" id="due" sub="Expanding schedule 1·7·30·90·180 days">
          {due.length ? (
            <table className="data">
              <tbody>
                {due.slice(0, 12).map((d) => (
                  <tr key={d.area + d.topic}>
                    <td>
                      {d.area} · {d.topic}
                    </td>
                    <td className="num">{d.daysSince}d / {d.interval}d</td>
                    <td>
                      <Badge tone={d.risk === "at-risk" ? "risk" : "warn"}>{d.risk}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <Empty>Nothing due. Log questions with a topic to enable scheduling.</Empty>
          )}
        </Panel>
      </Grid>
      <Grid cols="lg:grid-cols-2">
        <Panel title="Development value per hour (60D vs prior 60D)" sub="Accuracy change per 10 h in each area. Uncertain by nature — flags are prompts for analysis, not verdicts.">
          <table className="data">
            <thead>
              <tr>
                <th>Activity</th>
                <th>Hours</th>
                <th>Before → after</th>
                <th>Δ/10h</th>
                <th>Conf.</th>
              </tr>
            </thead>
            <tbody>
              {eff.map((e) => (
                <tr key={e.activity}>
                  <td>
                    {e.activity} {e.flag && <Badge tone={e.flag === "high-yield" ? "good" : "warn"}>{e.flag}</Badge>}
                  </td>
                  <td>{fmtNum(e.hours, 1)}</td>
                  <td>
                    {fmtPct(e.before, 1)} → {fmtPct(e.after, 1)}
                  </td>
                  <td>{e.deltaPer10h != null ? `${e.deltaPer10h > 0 ? "+" : ""}${e.deltaPer10h.toFixed(1)} pp` : "—"}</td>
                  <td className="muted text-xs">
                    {e.confidence} n={e.n}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
        <Panel title="Specialization depth (cumulative)" sub="Breadth vs depth of professional capital">
          <table className="data">
            <thead>
              <tr>
                <th>Area</th>
                <th>Hours</th>
                <th>Questions</th>
                <th>Tests</th>
              </tr>
            </thead>
            <tbody>
              {spec.map((s) => (
                <tr key={s.area}>
                  <td>{s.area}</td>
                  <td>{fmtNum(s.hours, 1)}</td>
                  <td>{fmtNum(s.questions)}</td>
                  <td>{s.tests}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="muted mt-2 text-[11px]">Practical skills tracked via sessions & competencies: {LAW_SKILLS.join(", ")}.</p>
        </Panel>
      </Grid>
      <Panel title="Metrics across windows">
        <MetricWindowTable ds={ds} keys={["law.min", "law.questions", "law.accuracy", "law.highConfErrors", "law.qPerHour", "law.recallRatio", "law.cases", "law.pages", "learning.recallRatio"]} />
      </Panel>
      <Grid cols="lg:grid-cols-2">
        <Panel title="Law findings">{own.length ? <div className="space-y-2">{own.map((i) => <InsightCard key={i.id} i={i} />)}</div> : <Empty>No law findings with current data.</Empty>}</Panel>
        <Panel title="Tests & mock exams" id="tests">
          <ActionForm action={recordTest} submitLabel="Record test">
            <input type="hidden" name="domain" value="LAW" />
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              <Field label="Name">
                <input name="name" className="input" required />
              </Field>
              <Field label="Kind">
                <select name="kind" className="input">
                  {TEST_KINDS.map((k) => (
                    <option key={k}>{k}</option>
                  ))}
                </select>
              </Field>
              <Field label="Area (optional)">
                <LawAreaSelect />
              </Field>
              <Field label="Score">
                <input name="score" type="number" step="any" className="input" required />
              </Field>
              <Field label="Max">
                <input name="maxScore" type="number" step="any" defaultValue={100} className="input" />
              </Field>
              <Field label="Date">
                <input name="date" type="date" defaultValue={ds.asOf} className="input" />
              </Field>
            </div>
          </ActionForm>
          <table className="data mt-3">
            <tbody>
              {tests.map((t) => (
                <tr key={t.id}>
                  <td className="num">{t.date}</td>
                  <td>{t.name}</td>
                  <td>{t.kind}</td>
                  <td>{t.pct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </Grid>
    </div>
  );
}
