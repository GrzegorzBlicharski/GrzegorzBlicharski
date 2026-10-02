import { getDataset } from "@/server/context";
import { PageHeader, Panel, Grid, Badge, Kpi, Empty } from "@/components/ui";
import { TrendChart, Bars } from "@/components/charts";
import { seriesWithAvg, MetricWindowTable } from "@/components/metricViews";
import { deepSummary, deepCapacityByMonth, bestHours, sessionLengthProfile, startDelayStats } from "@/modules/attention";
import { relate } from "@/analytics/relations";
import { fmtMin, fmtPct, fmtNum } from "@/components/format";
import { addDays } from "@/core/dates";

export const dynamic = "force-dynamic";

export default function AttentionPage() {
  const ds = getDataset();
  const deep = deepSummary(ds);
  const months = deepCapacityByMonth(ds).slice(-18);
  const bh = bestHours(ds);
  const sl = sessionLengthProfile(ds);
  const sd = startDelayStats(ds);
  const sw1 = relate(ds, "switches.perHour", "focus.avg", { from: addDays(ds.asOf, -179) });
  const sw2 = relate(ds, "switches.perHour", "law.accuracy", { from: addDays(ds.asOf, -179) });
  const q = bh.hours.filter((h) => h.minutes > 0);
  return (
    <div className="space-y-3">
      <PageHeader title="Attention & deep work" subtitle="Attention treated as a resource. Best hours are computed from your data — never asked." />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Kpi label="Deep today" value={fmtMin(deep.todayMin)} metricKey="deep.min" />
        <Kpi label="Deep / day (7D)" value={fmtMin(deep.perDay7)} sub={`${fmtNum(deep.perWeek / 60, 1)} h this week`} />
        <Kpi label="Deep ratio 30D" value={fmtPct(deep.ratio30)} metricKey="deep.ratio" />
        <Kpi label="Avg deep block 30D" value={fmtMin(deep.avgBlock30)} metricKey="deep.avgBlock" />
        <Kpi label="Longest block" value={fmtMin(deep.longest30)} sub={`all-time ${fmtMin(deep.longestAll)}`} metricKey="deep.longest" />
        <Kpi label="Start delay (median)" value={fmtMin(sd["30D"].median)} sub={`30D n=${sd["30D"].n} · 7D ${fmtMin(sd["7D"].median)} · 90D ${fmtMin(sd["90D"].median)}`} metricKey="startDelay.median" />
      </div>
      <Grid cols="lg:grid-cols-2">
        <Panel title="Deep work per day (90D)">
          <TrendChart data={seriesWithAvg(ds, "deep.min", 90)} unit="min" target={ds.settings.targets.deepMin.target} />
        </Panel>
        <Panel title="Capacity for uninterrupted work" sub="Average deep block length by month">
          <Bars data={months.map((m) => ({ label: m.month.slice(2), value: m.avgBlock == null ? null : Math.round(m.avgBlock) }))} unit="min" />
          {months.length >= 2 && months[0].avgBlock != null && months[months.length - 1].avgBlock != null && (
            <p className="text-2 mt-1 text-xs">
              {months[0].month}: avg deep block {fmtMin(months[0].avgBlock)} → {months[months.length - 1].month}: {fmtMin(months[months.length - 1].avgBlock)}
            </p>
          )}
        </Panel>
      </Grid>
      <Panel title="Best working hours" sub={`Per clock hour (180D): focus, completion, question accuracy. Qualifying = ≥5 sessions & ≥300 min. Score = mean z-score. Confidence ${bh.confidence}.`} right={bh.bestBlock ? <Badge tone="good">{`Best block ${bh.bestBlock.start}:00–${bh.bestBlock.end}:00`}</Badge> : <Badge>Insufficient data</Badge>}>
        {q.length ? (
          <div className="overflow-x-auto">
            <table className="data">
              <thead>
                <tr>
                  <th>Hour</th>
                  <th>Minutes</th>
                  <th>Sessions</th>
                  <th>Focus</th>
                  <th>Completion</th>
                  <th>Accuracy</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {q.map((h) => (
                  <tr key={h.hour} style={bh.bestBlock && h.hour >= bh.bestBlock.start && h.hour < bh.bestBlock.end ? { boxShadow: "inset 3px 0 0 var(--good)" } : undefined}>
                    <td className="num">{String(h.hour).padStart(2, "0")}:00</td>
                    <td>{fmtMin(h.minutes)}</td>
                    <td>{h.sessions}</td>
                    <td>{h.focus != null ? h.focus.toFixed(2) : "—"}</td>
                    <td>{fmtPct(h.completion)}</td>
                    <td>
                      {fmtPct(h.accuracy, 1)} <span className="muted text-[10px]">{h.accuracyN ? `n=${h.accuracyN}` : ""}</span>
                    </td>
                    <td>{h.qualifies ? (h.score != null ? h.score.toFixed(2) : "—") : <span className="muted text-xs">not enough data</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty>Log sessions with times to compute best hours.</Empty>
        )}
        {bh.bestBlock && <p className="text-2 mt-2 text-sm">Recommendation: place the hardest work (speaking, legal cases, drafting) in {bh.bestBlock.start}:00–{bh.bestBlock.end}:00; reading and reviews outside it.</p>}
      </Panel>
      <Grid cols="lg:grid-cols-2">
        <Panel title="Session length vs focus (active sessions, 180D)">
          <table className="data">
            <thead>
              <tr>
                <th>Length</th>
                <th>n</th>
                <th>Avg focus</th>
                <th>Completed</th>
              </tr>
            </thead>
            <tbody>
              {sl.map((b) => (
                <tr key={b.bucket}>
                  <td>{b.bucket} min</td>
                  <td>{b.n}</td>
                  <td>{b.focus != null ? b.focus.toFixed(2) : "—"}</td>
                  <td>{fmtPct(b.completion)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
        <Panel title="Context switching" sub="Not assumed to be bad — measured against what follows">
          <ul className="text-2 space-y-2 text-sm">
            <li>{sw1.statement}</li>
            <li>{sw2.statement}</li>
          </ul>
        </Panel>
      </Grid>
      <Panel title="Metrics across windows">
        <MetricWindowTable ds={ds} keys={["deep.min", "deep.ratio", "deep.avgBlock", "focus.avg", "interruptions.perHour", "switches.perHour", "unfinished.rate", "startDelay.median", "phone.deepInterruptions"]} />
      </Panel>
    </div>
  );
}
