"use client";
/**
 * Chart kit (recharts). Thin marks, recessive grid, one axis, hover tooltips by default.
 * Series colors come from the validated categorical order (--s1, --s2, --s3 …); text never wears series color.
 */
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  ZAxis,
  Legend,
  Cell,
} from "recharts";
import { fmtUnit } from "./format";

const legendText = (v: string) => <span style={{ color: "var(--text-2)" }}>{v}</span>;
const axisProps = { stroke: "var(--axis)", tick: { fill: "var(--muted)", fontSize: 11 }, tickLine: false } as const;
const tooltipStyle = {
  contentStyle: { background: "var(--panel)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12, color: "var(--text)" },
  labelStyle: { color: "var(--text-2)" },
  itemStyle: { color: "var(--text)" },
};

export interface TrendPoint {
  day: string;
  value: number | null;
  avg?: number | null;
}

export function TrendChart({ data, unit, target, height = 200, label = "Daily", avgLabel = "7-day average", showDaily = true }: { data: TrendPoint[]; unit: string; target?: number | null; height?: number; label?: string; avgLabel?: string; showDaily?: boolean }) {
  if (!data.some((d) => d.value != null)) return <div className="muted py-8 text-center text-sm">No data in this period</div>;
  const hasAvg = data.some((d) => d.avg != null);
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 6, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="var(--grid)" vertical={false} />
          <XAxis dataKey="day" {...axisProps} minTickGap={40} tickFormatter={(d: string) => d.slice(5)} />
          <YAxis {...axisProps} width={44} tickFormatter={(v: number) => fmtUnit(v, unit)} />
          <Tooltip {...tooltipStyle} formatter={(v: number) => fmtUnit(v, unit)} />
          {target != null && <ReferenceLine y={target} stroke="var(--text-2)" strokeDasharray="4 4" label={{ value: "target", fill: "var(--muted)", fontSize: 10, position: "insideTopRight" }} />}
          {showDaily && <Line type="linear" dataKey="value" name={label} stroke="var(--s1)" strokeOpacity={hasAvg ? 0.35 : 1} strokeWidth={hasAvg ? 1.5 : 2} dot={false} connectNulls={false} isAnimationActive={false} />}
          {hasAvg && <Line type="monotone" dataKey="avg" name={avgLabel} stroke="var(--s1)" strokeWidth={2} dot={false} connectNulls isAnimationActive={false} />}
          {showDaily && hasAvg && <Legend wrapperStyle={{ fontSize: 11 }} iconType="plainline" formatter={legendText} />}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function Bars({ data, unit, height = 200, target, colorBy }: { data: { label: string; value: number | null; tone?: "good" | "warn" | "risk" }[]; unit: string; height?: number; target?: number | null; colorBy?: "tone" }) {
  if (!data.some((d) => d.value != null)) return <div className="muted py-8 text-center text-sm">No data in this period</div>;
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 6, right: 8, bottom: 0, left: 0 }} barCategoryGap={2}>
          <CartesianGrid stroke="var(--grid)" vertical={false} />
          <XAxis dataKey="label" {...axisProps} interval="preserveStartEnd" minTickGap={16} />
          <YAxis {...axisProps} width={44} tickFormatter={(v: number) => fmtUnit(v, unit)} />
          <Tooltip {...tooltipStyle} cursor={{ fill: "var(--panel-2)" }} formatter={(v: number) => fmtUnit(v, unit)} />
          {target != null && <ReferenceLine y={target} stroke="var(--text-2)" strokeDasharray="4 4" />}
          <Bar dataKey="value" name="Value" fill="var(--s1)" radius={[4, 4, 0, 0]} isAnimationActive={false}>
            {colorBy === "tone" && data.map((d, i) => <Cell key={i} fill={d.tone ? `var(--${d.tone === "good" ? "good" : d.tone === "warn" ? "warn" : "risk"})` : "var(--s1)"} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function StackedBars({ data, keys, unit, height = 220 }: { data: Record<string, string | number | null>[]; keys: { key: string; label: string }[]; unit: string; height?: number }) {
  if (!data.length) return <div className="muted py-8 text-center text-sm">No data in this period</div>;
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 6, right: 8, bottom: 0, left: 0 }} barCategoryGap={2}>
          <CartesianGrid stroke="var(--grid)" vertical={false} />
          <XAxis dataKey="label" {...axisProps} minTickGap={16} />
          <YAxis {...axisProps} width={44} tickFormatter={(v: number) => fmtUnit(v, unit)} />
          <Tooltip {...tooltipStyle} cursor={{ fill: "var(--panel-2)" }} formatter={(v: number) => fmtUnit(v, unit)} />
          <Legend wrapperStyle={{ fontSize: 11 }} iconType="square" formatter={legendText} />
          {keys.slice(0, 8).map((k, i) => (
            <Bar key={k.key} dataKey={k.key} name={k.label} stackId="a" fill={`var(--s${i + 1})`} stroke="var(--panel)" strokeWidth={1} isAnimationActive={false} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ScatterPlot({ points, xLabel, yLabel, xUnit, yUnit, height = 260 }: { points: { x: number; y: number; day: string }[]; xLabel: string; yLabel: string; xUnit: string; yUnit: string; height?: number }) {
  if (!points.length) return <div className="muted py-8 text-center text-sm">No paired days</div>;
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 8, right: 12, bottom: 16, left: 0 }}>
          <CartesianGrid stroke="var(--grid)" />
          <XAxis type="number" dataKey="x" name={xLabel} {...axisProps} tickFormatter={(v: number) => fmtUnit(v, xUnit)} label={{ value: xLabel, position: "insideBottom", offset: -8, fill: "var(--muted)", fontSize: 11 }} />
          <YAxis type="number" dataKey="y" name={yLabel} {...axisProps} width={48} tickFormatter={(v: number) => fmtUnit(v, yUnit)} />
          <ZAxis range={[40, 40]} />
          <Tooltip
            {...tooltipStyle}
            content={({ payload }) => {
              const p = payload?.[0]?.payload as { x: number; y: number; day: string } | undefined;
              if (!p) return null;
              return (
                <div className="panel p-2 text-xs">
                  <div className="text-2">{p.day}</div>
                  <div>
                    {xLabel}: {fmtUnit(p.x, xUnit)}
                  </div>
                  <div>
                    {yLabel}: {fmtUnit(p.y, yUnit)}
                  </div>
                </div>
              );
            }}
          />
          <Scatter data={points} fill="var(--s1)" fillOpacity={0.65} stroke="var(--panel)" strokeWidth={1} isAnimationActive={false} />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
