import { getAnalysis } from "@/server/context";
import { PageHeader, Panel, Grid, Badge, Kpi } from "@/components/ui";
import { Bars, TrendChart } from "@/components/charts";
import { seriesWithAvg, MetricWindowTable } from "@/components/metricViews";
import { planVsActualToday, planVsActualBy, detectOverplanning, taskFlow, planningGuard, protocolAdherence } from "@/modules/execution";
import { minimumDay, streaks, baselineEvolution, behaviourStability } from "@/modules/consistency";
import { fmtMin, fmtPct, fmtNum } from "@/components/format";
import { METRIC_MAP } from "@/metrics/series";

export const dynamic = "force-dynamic";

export default function ExecutionPage() {
  const { ds } = getAnalysis();
  const today = planVsActualToday(ds);
  const weeks = planVsActualBy(ds, "week", 16);
  const months = planVsActualBy(ds, "month", 12);
  const op = detectOverplanning(ds);
  const tf = taskFlow(ds);
  const pg = planningGuard(ds);
  const pa = protocolAdherence(ds);
  const md = minimumDay(ds);
  const st = streaks(ds, md.items);
  const base = baselineEvolution(ds, "quarter");
  const stab = behaviourStability(ds, "productive.min");
  return (
    <div className="space-y-3">
      <PageHeader title="Execution" subtitle="Planned versus done, and whether your plans match what you can really sustain." />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Kpi label="Today" value={fmtPct(today.pct, 1)} sub={today.plannedDays ? `planned ${fmtMin(today.planned)} · actual ${fmtMin(today.actual)}` : "no plan"} metricKey="exec.pct" />
        <Kpi label="Execution 30D" value={fmtPct(op.executionPct, 1)} sub={`planned ${fmtMin(op.plannedAvg)} · actual ${fmtMin(op.actualAvg)}`} tone={op.detected ? "warn" : "neutral"} />
        <Kpi label="Task completion 30D" value={fmtPct(tf.completionRate)} sub={`${tf.completed} done · ${tf.postponed} postponed · ${tf.abandoned} abandoned`} metricKey="tasks.completion" />
        <Kpi label="Consistency" value={`${fmtPct(st.consistency30)} / ${fmtPct(st.consistency90)}`} sub="minimum day kept 30D / 90D" metricKey="consistency.minimumDay" />
        <Kpi label="Streak (secondary)" value={`${st.current} d`} sub={`longest ${st.longest} d`} />
        <Kpi label="Protocol adherence" value={fmtPct(pa.pct)} sub={`${pa.days} days logged`} />
      </div>
      <div className="flex flex-wrap gap-2">
        {op.detected && <Badge tone="warn">{`SYSTEMATIC OVERPLANNING — plan ${fmtMin(op.plannedAvg)} vs actual ${fmtMin(op.actualAvg)} (${fmtPct(op.executionPct, 1)}). Base plan ≈ ${fmtMin(op.suggestedBaseline)}`}</Badge>}
        {pg.warning && <Badge tone="risk">{pg.message}</Badge>}
      </div>
      <Grid cols="lg:grid-cols-2">
        <Panel title="Weekly execution (actual / planned)">
          <Bars data={weeks.map((w) => ({ label: w.key.slice(5), value: w.pct == null ? null : Math.round(w.pct * 10) / 10 }))} unit="pct" target={ds.settings.targets.executionPct} />
        </Panel>
        <Panel title="Planned vs actual per month">
          <table className="data">
            <thead>
              <tr>
                <th>Month</th>
                <th>Planned</th>
                <th>Actual</th>
                <th>Execution</th>
                <th>Days</th>
              </tr>
            </thead>
            <tbody>
              {months.map((m) => (
                <tr key={m.key}>
                  <td className="num">{m.key}</td>
                  <td>{fmtNum(m.planned / 60, 1)} h</td>
                  <td>{fmtNum(m.actual / 60, 1)} h</td>
                  <td>{fmtPct(m.pct, 1)}</td>
                  <td>{m.plannedDays}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </Grid>
      <Grid cols="lg:grid-cols-3">
        <Panel title="Minimum day" sub={`Keeps momentum on hard days · ${md.source === "user" ? "your definition" : md.source === "suggested" ? "suggested from your data (P25 of active days ÷ 2)" : "default: any core work ≥ 15 min"}`}>
          <ul className="space-y-1 text-sm">
            {md.items.length ? md.items.map((i) => <li key={i.metricKey}>• {METRIC_MAP.get(i.metricKey)?.label ?? i.metricKey} ≥ {i.min}</li>) : <li>• ≥ 15 min of core work</li>}
          </ul>
          <p className="muted mt-2 text-xs">A missed target is not a failed day — the percentage and context matter. Edit in Settings.</p>
        </Panel>
        <Panel title="Normal baseline (productive h/week, median per quarter)" className="lg:col-span-2">
          <Bars data={base.map((b) => ({ label: b.period, value: b.medianWeeklyH == null ? null : Math.round(b.medianWeeklyH * 10) / 10 }))} unit="h" height={180} />
          <p className="text-2 mt-1 text-xs">
            Current level {stab.level != null ? `${fmtNum((stab.level * 7) / 60, 1)} h/week` : "—"} has been held for {stab.weeks} consecutive weeks (observable behaviour, not identity).
          </p>
        </Panel>
      </Grid>
      <Panel title="Productive time per day (90D)">
        <TrendChart data={seriesWithAvg(ds, "productive.min", 90)} unit="min" target={ds.settings.targets.productiveMin.target} />
      </Panel>
      <Panel title="Metrics across windows">
        <MetricWindowTable ds={ds} keys={["exec.pct", "plan.min", "productive.min", "tasks.completion", "startDelay.median", "consistency.minimumDay", "review.done", "system.share", "value.highShare"]} />
      </Panel>
    </div>
  );
}
