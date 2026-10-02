import { getDataset } from "@/server/context";
import { PageHeader, Panel, Grid, Badge, Kpi, Empty } from "@/components/ui";
import { TrendChart } from "@/components/charts";
import { seriesWithAvg, MetricWindowTable } from "@/components/metricViews";
import { sustainedCapacity, sustainabilityCheck, targetCapacityGap, recoveryCoverage } from "@/modules/recovery";
import { detectAnomalies } from "@/analytics/trend";
import { relate } from "@/analytics/relations";
import { fmtMin, fmtNum, fmtPct } from "@/components/format";
import { addDays } from "@/core/dates";

export const dynamic = "force-dynamic";

export default function RecoveryPage() {
  const ds = getDataset();
  const cap = sustainedCapacity(ds);
  const sc = sustainabilityCheck(ds);
  const gap = targetCapacityGap(ds, ds.settings.targets.productiveMin.target);
  const cov = recoveryCoverage(ds);
  const from = addDays(ds.asOf, -179);
  const rels = [
    relate(ds, "sleep.h", "focus.avg", { from }),
    relate(ds, "sleep.h", "law.accuracy", { from }),
    relate(ds, "sleep.h", "deep.min", { from }),
    relate(ds, "energy", "productive.min", { from }),
  ];
  const anomalies = [...detectAnomalies(ds, "total.min"), ...detectAnomalies(ds, "phone.total"), ...detectAnomalies(ds, "focus.avg")].filter((a) => a.day >= addDays(ds.asOf, -60)).sort((a, b) => (a.day < b.day ? 1 : -1));
  return (
    <div className="space-y-3">
      <PageHeader title="Sustainability" subtitle="Productivity analysis without health diagnosis. The system never recommends chronic sleep restriction or skipping recovery." />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <Kpi label="Status" value={<Badge tone={sc.warning ? "risk" : "good"}>{sc.warning ? "Sustainability warning" : "Within capacity"}</Badge>} sub={sc.warning ? sc.signals.join(", ") : `work ${sc.hoursChangePct != null ? `${sc.hoursChangePct > 0 ? "+" : ""}${sc.hoursChangePct.toFixed(0)}%` : "—"} vs prev 14D`} />
        <Kpi label="Sustained 7D max" value={fmtMin(cap.w7?.value)} sub={cap.w7 ? `ending ${cap.w7.end}` : ""} />
        <Kpi label="Sustained 30D max" value={fmtMin(cap.w30?.value)} sub={cap.w30 ? `ending ${cap.w30.end}` : ""} />
        <Kpi label="Sustained 90D max" value={fmtMin(cap.w90?.value)} sub={cap.w90 ? `ending ${cap.w90.end}` : "needs 90 days"} />
        <Kpi label="Target vs capacity" value={gap.gap != null ? `${gap.gap > 0 ? "+" : ""}${fmtMin(gap.gap)}` : "—"} sub={`target ${fmtMin(gap.target)}/day${gap.aboveEverSustained ? " · above anything sustained" : ""}`} tone={gap.aboveEverSustained ? "warn" : "neutral"} />
      </div>
      <Grid cols="lg:grid-cols-2">
        <Panel title="14D vs previous 14D" sub="Warning = hours +10% with ≥2 quality signals falling">
          <table className="data">
            <thead>
              <tr>
                <th>Signal</th>
                <th>Previous 14D</th>
                <th>Last 14D</th>
              </tr>
            </thead>
            <tbody>
              {sc.details.map((d) => (
                <tr key={d.label}>
                  <td>{d.label}</td>
                  <td>{fmtNum(d.prev, 1)}</td>
                  <td>{fmtNum(d.cur, 1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
        <Panel title="Workload per day (180D)">
          <TrendChart data={seriesWithAvg(ds, "total.min", 180)} unit="min" target={cap.w90?.value ?? null} />
          <p className="muted text-[11px]">Dashed line = highest sustained 90-day average.</p>
        </Panel>
      </Grid>
      <Grid cols="lg:grid-cols-2">
        <Panel title="Optional self-reports vs performance" sub={`Recovery logged on ${fmtPct(cov * 100)} of the last 30 days`}>
          <ul className="text-2 space-y-2 text-sm">
            {rels.map((r) => (
              <li key={r.xKey + r.yKey}>
                <Badge tone={r.confidence === "HIGH" ? "good" : r.confidence === "MEDIUM" ? "accent" : "neutral"}>{r.confidence}</Badge> {r.statement}
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Unusual days (60D)" sub="Robust z ≥ 3 vs trailing 30 days. One unusual day never changes strategy.">
          {anomalies.length ? (
            <table className="data">
              <tbody>
                {anomalies.slice(0, 10).map((a) => (
                  <tr key={a.key + a.day}>
                    <td className="num">{a.day}</td>
                    <td>{a.key}</td>
                    <td>
                      {fmtNum(a.value, 1)} vs baseline {fmtNum(a.baseline, 1)}
                    </td>
                    <td>
                      <Badge>{a.direction}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <Empty>No unusual days detected.</Empty>
          )}
        </Panel>
      </Grid>
      <Panel title="Metrics across windows">
        <MetricWindowTable ds={ds} keys={["total.min", "productive.min", "sleep.h", "sleep.q", "energy", "focus.avg"]} />
      </Panel>
    </div>
  );
}
