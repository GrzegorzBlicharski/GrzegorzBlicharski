/** Server-side metric presentation helpers shared by domain pages. */
import Link from "next/link";
import type { Dataset } from "@/core/types";
import { addDays } from "@/core/dates";
import { dailySeries, metric } from "@/metrics/series";
import { windowTable, metricTrend, velocity } from "@/analytics/trend";
import { fmtUnit, fmtDelta } from "./format";
import { Badge, TypeTag, trendTone, Delta } from "./ui";
import type { TrendPoint } from "./charts";

/** Daily values + trailing 7-day mean over days with data. */
export function seriesWithAvg(ds: Dataset, key: string, days = 90): TrendPoint[] {
  const s = dailySeries(ds, key, addDays(ds.asOf, -(days - 1)), ds.asOf);
  return s.map((p, i) => {
    const win = s.slice(Math.max(0, i - 6), i + 1).map((q) => q.value).filter((x): x is number => x != null);
    return { day: p.day, value: p.value == null ? null : Math.round(p.value * 100) / 100, avg: win.length >= 3 ? Math.round((win.reduce((a, b) => a + b, 0) / win.length) * 100) / 100 : null };
  });
}

/** Table of metrics × standard windows, with trend and velocity. Every row links to its definition. */
export function MetricWindowTable({ ds, keys }: { ds: Dataset; keys: string[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="data">
        <thead>
          <tr>
            <th>Metric</th>
            <th>7D</th>
            <th>30D</th>
            <th>90D</th>
            <th>365D</th>
            <th>All</th>
            <th>Δ 30D vs prev</th>
            <th title="Theil–Sen slope within the last 30 days">Slope within 30D</th>
          </tr>
        </thead>
        <tbody>
          {keys.map((k) => {
            const m = metric(k);
            const w = windowTable(ds, k);
            const t = metricTrend(ds, k, 30);
            const v = velocity(ds, k, 30);
            return (
              <tr key={k}>
                <td>
                  <Link href={`/metrics#${k}`} className="hover:underline">
                    {m.label}
                  </Link>{" "}
                  <TypeTag type={m.type} />
                </td>
                {(["7D", "30D", "90D", "365D", "ALL"] as const).map((wk) => (
                  <td key={wk} title={`n=${w[wk].n} days with data${w[wk].total != null ? ` · total ${fmtUnit(w[wk].total, m.unit)}` : ""}`}>
                    {fmtUnit(w[wk].value, m.unit)}
                  </td>
                ))}
                <td>
                  <Delta value={v.velocity} better={v.improving}>
                    {fmtDelta(v.velocity, m.unit)}
                  </Delta>
                </td>
                <td>
                  <Badge tone={trendTone(t.cls)}>{t.cls}</Badge>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="muted mt-2 text-[11px]">Sum metrics show the per-day mean; hover a cell for n and totals. Ratios are Σnumerator/Σdenominator. Trend: Theil–Sen slope relative to level (±10% threshold).</p>
    </div>
  );
}
