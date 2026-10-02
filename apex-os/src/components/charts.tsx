"use client";
/**
 * Chart kit (recharts). Thin marks, recessive grid, one axis, hover tooltips by default.
 * Series colors come from the validated categorical order (--s1, --s2, --s3 …); text never wears series color.
 */
import {
  ResponsiveContainer,
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
  ComposedChart,
  Area,
} from "recharts";
import { useId } from "react";
import { fmtUnit } from "./format";

const legendText = (v: string) => <span style={{ color: "var(--text-2)" }}>{v}</span>;
const axisProps = { stroke: "var(--axis)", tick: { fill: "var(--muted)", fontSize: 11.5, fontFamily: "var(--font-num)" }, tickLine: false } as const;
const tooltipStyle = {
  contentStyle: { background: "var(--panel)", border: "1px solid var(--border-strong)", borderRadius: 10, fontSize: 12.5, color: "var(--text)", boxShadow: "0 8px 24px rgba(0,0,0,.18)", padding: "8px 12px" },
  labelStyle: { color: "var(--text-2)" },
  itemStyle: { color: "var(--text)" },
};

export interface TrendPoint {
  day: string;
  value: number | null;
  avg?: number | null;
}

export function TrendChart({ data, unit, target, height = 220, label = "Daily", avgLabel = "7-day average", showDaily = true }: { data: TrendPoint[]; unit: string; target?: number | null; height?: number; label?: string; avgLabel?: string; showDaily?: boolean }) {
  const rawId = useId();
  if (!data.some((d) => d.value != null)) return <div className="muted py-10 text-center text-sm">No data in this period yet</div>;
  const hasAvg = data.some((d) => d.avg != null);
  const lastIdx = (() => {
    for (let i = data.length - 1; i >= 0; i--) if ((hasAvg ? data[i].avg : data[i].value) != null) return i;
    return -1;
  })();
  const gid = `g${rawId.replace(/[^a-zA-Z0-9]/g, "")}`;
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 10, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--s1)" stopOpacity={0.28} />
              <stop offset="100%" stopColor="var(--s1)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--grid)" strokeDasharray="3 4" vertical={false} />
          <XAxis dataKey="day" {...axisProps} axisLine={false} minTickGap={48} tickFormatter={(d: string) => d.slice(5)} />
          <YAxis {...axisProps} axisLine={false} width={48} tickFormatter={(v: number) => fmtUnit(v, unit)} />
          <Tooltip {...tooltipStyle} formatter={(v: number) => fmtUnit(v, unit)} cursor={{ stroke: "var(--axis)" }} />
          {target != null && <ReferenceLine y={target} stroke="var(--text-2)" strokeOpacity={0.6} strokeDasharray="5 5" label={{ value: "target", fill: "var(--muted)", fontSize: 11, position: "insideTopRight" }} />}
          {hasAvg && <Area type="monotone" dataKey="avg" name={avgLabel} stroke="var(--s1)" strokeWidth={2.25} fill={`url(#${gid})`} connectNulls isAnimationActive={false} dot={(p: { index?: number; cx?: number; cy?: number }) => (p.index === lastIdx && p.cx != null && p.cy != null ? <circle key="end" cx={p.cx} cy={p.cy} r={4.5} fill="var(--s1)" stroke="var(--panel)" strokeWidth={2} /> : <g key={p.index} />)} />}
          {showDaily && <Line type="linear" dataKey="value" name={label} stroke="var(--s1)" strokeOpacity={hasAvg ? 0.3 : 1} strokeWidth={hasAvg ? 1.25 : 2} dot={false} connectNulls={false} isAnimationActive={false} />}
          {showDaily && hasAvg && <Legend wrapperStyle={{ fontSize: 12 }} iconType="plainline" formatter={legendText} />}
        </ComposedChart>
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
          <CartesianGrid stroke="var(--grid)" strokeDasharray="3 4" vertical={false} />
          <XAxis dataKey="label" {...axisProps} axisLine={false} interval="preserveStartEnd" minTickGap={16} />
          <YAxis {...axisProps} axisLine={false} width={48} tickFormatter={(v: number) => fmtUnit(v, unit)} />
          <Tooltip {...tooltipStyle} cursor={{ fill: "var(--panel-2)" }} formatter={(v: number) => fmtUnit(v, unit)} />
          {target != null && <ReferenceLine y={target} stroke="var(--text-2)" strokeDasharray="4 4" />}
          <Bar dataKey="value" name="Value" fill="var(--s1)" radius={[5, 5, 0, 0]} maxBarSize={36} isAnimationActive={false}>
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
          <CartesianGrid stroke="var(--grid)" strokeDasharray="3 4" vertical={false} />
          <XAxis dataKey="label" {...axisProps} axisLine={false} minTickGap={16} />
          <YAxis {...axisProps} axisLine={false} width={48} tickFormatter={(v: number) => fmtUnit(v, unit)} />
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
