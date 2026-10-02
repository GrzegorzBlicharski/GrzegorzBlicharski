import Link from "next/link";
import { getDataset } from "@/server/context";
import { PageHeader, Panel, Grid, Badge, Field, Delta } from "@/components/ui";
import { ScatterPlot, TrendChart } from "@/components/charts";
import { seriesWithAvg } from "@/components/metricViews";
import { relate } from "@/analytics/relations";
import { compareRows, KEY_COMPARE_METRICS, germanEvidenceAt, type CompareRow } from "@/reports/build";
import { SERIES_METRICS, METRIC_MAP } from "@/metrics/series";
import { addDays, addMonths, isDay } from "@/core/dates";
import { fmtUnit, fmtDelta } from "@/components/format";
import { velocity, metricTrend, plateauBreakthrough } from "@/analytics/trend";
import { records } from "@/modules/consistency";

export const dynamic = "force-dynamic";

const TABS = [
  ["explore", "Explore relations"],
  ["compare", "Date A vs Date B"],
  ["now", "30 days ago vs now"],
  ["horizons", "Velocity & horizons"],
  ["year", "Year over year"],
] as const;

function MetricSelect({ name, value }: { name: string; value: string }) {
  return (
    <select name={name} defaultValue={value} className="input">
      {SERIES_METRICS.map((m) => (
        <option key={m.key} value={m.key}>
          {m.domain} · {m.label}
        </option>
      ))}
    </select>
  );
}

function CompareTable({ rows, aLabel, bLabel }: { rows: CompareRow[]; aLabel: string; bLabel: string }) {
  return (
    <div className="overflow-x-auto">
      <table className="data">
        <thead>
          <tr>
            <th>Metric</th>
            <th>{aLabel}</th>
            <th>{bLabel}</th>
            <th>Change</th>
            <th>n</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key}>
              <td>
                <Link href={`/metrics#${r.key}`} className="hover:underline">
                  {r.label}
                </Link>
              </td>
              <td>{fmtUnit(r.a.value, r.unit)}</td>
              <td className="font-semibold">{fmtUnit(r.b.value, r.unit)}</td>
              <td>
                <Delta value={r.delta} better={r.better}>
                  {fmtDelta(r.delta, r.unit)}
                </Delta>
              </td>
              <td className="muted text-xs">
                {r.a.n}/{r.b.n}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="muted mt-2 text-[11px]">Only recorded data — no values are generated. n = days with data in each window.</p>
    </div>
  );
}

export default async function AnalyzePage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const ds = getDataset();
  const tab = sp.tab ?? "explore";
  return (
    <div className="space-y-3">
      <PageHeader title="Analyze & compare" subtitle="Metric · dimension · aggregation · period · comparison. Correlation ≠ causation — relationships worth acting on become experiments." />
      <div className="flex flex-wrap gap-1">
        {TABS.map(([k, l]) => (
          <Link key={k} href={`/analyze?tab=${k}`} className={`btn btn-sm ${tab === k ? "btn-primary" : ""}`}>
            {l}
          </Link>
        ))}
      </div>
      {tab === "explore" && <Explore ds={ds} sp={sp} />}
      {tab === "compare" && <CompareDates ds={ds} sp={sp} />}
      {tab === "now" && (
        <Panel title="30 days ago vs now" sub={`${addDays(ds.asOf, -59)} → ${addDays(ds.asOf, -30)} vs ${addDays(ds.asOf, -29)} → ${ds.asOf}`}>
          <CompareTable rows={compareRows(ds, [...KEY_COMPARE_METRICS, "law.highConfErrors", "german.vocabRetention", "phone.compliance"], { from: addDays(ds.asOf, -59), to: addDays(ds.asOf, -30) }, { from: addDays(ds.asOf, -29), to: ds.asOf })} aLabel="30 days ago" bLabel="Now" />
          <p className="text-2 mt-2 text-sm">German evidence: {germanEvidenceAt(ds, addDays(ds.asOf, -30))} → {germanEvidenceAt(ds, ds.asOf)}</p>
        </Panel>
      )}
      {tab === "horizons" && <Horizons ds={ds} />}
      {tab === "year" && (
        <Panel title="Year over year" sub="Same 30-day window one year earlier">
          <CompareTable rows={compareRows(ds, KEY_COMPARE_METRICS, { from: addDays(ds.asOf, -394), to: addDays(ds.asOf, -365) }, { from: addDays(ds.asOf, -29), to: ds.asOf })} aLabel={`${addDays(ds.asOf, -365).slice(0, 7)}`} bLabel={ds.asOf.slice(0, 7)} />
          <p className="text-2 mt-2 text-sm">German evidence: {germanEvidenceAt(ds, addDays(ds.asOf, -365))} → {germanEvidenceAt(ds, ds.asOf)}</p>
        </Panel>
      )}
    </div>
  );
}

function Explore({ ds, sp }: { ds: ReturnType<typeof getDataset>; sp: Record<string, string | undefined> }) {
  const x = sp.x && METRIC_MAP.has(sp.x) ? sp.x : "phone.total";
  const y = sp.y && METRIC_MAP.has(sp.y) ? sp.y : "deep.min";
  const period = Number(sp.period ?? 180);
  const lag = Number(sp.lag ?? 0);
  const threshold = sp.threshold ? Number(sp.threshold) : undefined;
  const from = period > 0 ? addDays(ds.asOf, -(period - 1)) : undefined;
  const r = relate(ds, x, y, { from, lag, threshold });
  const mx = METRIC_MAP.get(x)!;
  const my = METRIC_MAP.get(y)!;
  const presets = [
    ["phone.total", "deep.min"],
    ["phone.total", "exec.pct"],
    ["sleep.h", "focus.avg"],
    ["german.speakingMin", "german.errPerSpeakMin"],
    ["law.questions", "law.accuracy"],
    ["law.recallRatio", "law.accuracy"],
  ];
  return (
    <>
      <Panel title="Explorer">
        <form method="get" className="grid grid-cols-2 items-end gap-2 md:grid-cols-6">
          <input type="hidden" name="tab" value="explore" />
          <Field label="X (day t)" className="col-span-2">
            <MetricSelect name="x" value={x} />
          </Field>
          <Field label="Y (day t + lag)" className="col-span-2">
            <MetricSelect name="y" value={y} />
          </Field>
          <Field label="Period">
            <select name="period" defaultValue={String(period)} className="input">
              <option value="30">30D</option>
              <option value="90">90D</option>
              <option value="180">180D</option>
              <option value="365">365D</option>
              <option value="0">All</option>
            </select>
          </Field>
          <Field label="Lag (days)">
            <input name="lag" type="number" min={0} max={7} defaultValue={lag} className="input" />
          </Field>
          <Field label="Split threshold (X)">
            <input name="threshold" type="number" step="any" defaultValue={threshold} placeholder="median" className="input" />
          </Field>
          <button className="btn btn-primary">Analyze</button>
        </form>
        <div className="mt-2 flex flex-wrap gap-1">
          {presets.map(([a, b]) => (
            <Link key={a + b} href={`/analyze?tab=explore&x=${a}&y=${b}`} className="btn btn-sm">
              {METRIC_MAP.get(a)!.label} vs {METRIC_MAP.get(b)!.label}
            </Link>
          ))}
        </div>
      </Panel>
      <Grid cols="lg:grid-cols-3">
        <Panel title={`${mx.label} vs ${my.label}`} className="lg:col-span-2">
          <ScatterPlot points={r.points} xLabel={mx.label} yLabel={my.label} xUnit={mx.unit} yUnit={my.unit} />
        </Panel>
        <Panel title="Result">
          <div className="space-y-2 text-sm">
            <div>
              <Badge tone={r.confidence === "HIGH" ? "good" : r.confidence === "MEDIUM" ? "accent" : "neutral"}>{r.confidence} confidence</Badge> <span className="muted">strength: {r.strength}</span>
            </div>
            <p>{r.statement}</p>
            <dl className="text-2 grid grid-cols-2 gap-1 text-xs">
              <dt>n (paired days)</dt>
              <dd>{r.n}</dd>
              <dt>Spearman ρ</dt>
              <dd>{r.rho?.toFixed(3) ?? "—"}</dd>
              <dt>95% CI</dt>
              <dd>{r.ci ? `${r.ci[0].toFixed(2)} … ${r.ci[1].toFixed(2)}` : "—"}</dd>
              {r.split && (
                <>
                  <dt>{r.split.lowLabel}</dt>
                  <dd>
                    {fmtUnit(r.split.lowMean, my.unit)} (n={r.split.lowN})
                  </dd>
                  <dt>{r.split.highLabel}</dt>
                  <dd>
                    {fmtUnit(r.split.highMean, my.unit)} (n={r.split.highN})
                  </dd>
                  <dt>Cohen&apos;s d</dt>
                  <dd>{r.split.d?.toFixed(2) ?? "—"}</dd>
                </>
              )}
            </dl>
            <Link href={`/experiments?metric=${y}&x=${x}`} className="btn btn-sm">
              Interested? Test it as an experiment →
            </Link>
          </div>
        </Panel>
      </Grid>
    </>
  );
}

function CompareDates({ ds, sp }: { ds: ReturnType<typeof getDataset>; sp: Record<string, string | undefined> }) {
  const b = sp.b && isDay(sp.b) ? sp.b : ds.asOf;
  const a = sp.a && isDay(sp.a) ? sp.a : addMonths(b, -12);
  const w = Number(sp.w ?? 30);
  const ra = { from: addDays(a, -(w - 1)), to: a };
  const rb = { from: addDays(b, -(w - 1)), to: b };
  const keys = [...KEY_COMPARE_METRICS, "law.highConfErrors", "german.speakingMin", "german.words", "law.cases", "phone.morning", "deep.avgBlock", "tasks.completion", "sleep.h"];
  const between = ds.milestones.filter((m) => m.date > a && m.date <= b);
  return (
    <>
      <Panel title="Select dates">
        <form method="get" className="flex flex-wrap items-end gap-2">
          <input type="hidden" name="tab" value="compare" />
          <Field label="Date A">
            <input type="date" name="a" defaultValue={a} className="input" />
          </Field>
          <Field label="Date B">
            <input type="date" name="b" defaultValue={b} className="input" />
          </Field>
          <Field label="Window ending at each date">
            <select name="w" defaultValue={String(w)} className="input">
              <option value="7">7 days</option>
              <option value="30">30 days</option>
              <option value="90">90 days</option>
            </select>
          </Field>
          <button className="btn btn-primary">Compare</button>
        </form>
      </Panel>
      <Grid cols="lg:grid-cols-3">
        <Panel title={`${a} vs ${b} (${w}-day windows)`} className="lg:col-span-2">
          <CompareTable rows={compareRows(ds, keys, ra, rb)} aLabel={a} bLabel={b} />
          <p className="text-2 mt-2 text-sm">
            German evidence: {germanEvidenceAt(ds, a)} → {germanEvidenceAt(ds, b)}
          </p>
        </Panel>
        <Panel title="What happened in between" sub="Strategy changes, milestones, tests, interventions">
          <ul className="space-y-1 text-sm">
            {between.slice(0, 20).map((m) => (
              <li key={m.id}>
                <span className="num muted">{m.date}</span> <Badge>{m.kind}</Badge> {m.title}
              </li>
            ))}
            {!between.length && <li className="muted">No milestones recorded in this range.</li>}
          </ul>
          <p className="muted mt-2 text-[11px]">
            {ds.experiments.filter((e) => e.startDate > a && e.startDate <= b).length} experiments and {ds.interventions.filter((i) => i.startDate > a && i.startDate <= b).length} interventions started in this range.
          </p>
        </Panel>
      </Grid>
    </>
  );
}

function Horizons({ ds }: { ds: ReturnType<typeof getDataset> }) {
  const keys = KEY_COMPARE_METRICS;
  const horizons: [string, number][] = [
    ["1 month", 30],
    ["3 months", 91],
    ["6 months", 182],
    ["1 year", 365],
    ["3 years", 1095],
  ];
  const rec = records(ds);
  return (
    <>
      <Panel title="Performance, velocity, acceleration" sub="Velocity = last window − previous window; acceleration = change in velocity">
        <div className="overflow-x-auto">
          <table className="data">
            <thead>
              <tr>
                <th>Metric</th>
                <th>Last 30D</th>
                <th>Prev 30D</th>
                <th>Velocity 30</th>
                <th>Accel. 30</th>
                <th>Last 90D</th>
                <th>Prev 90D</th>
                <th>Velocity 90</th>
                <th>Trend</th>
                <th>Plateau / breakthrough</th>
              </tr>
            </thead>
            <tbody>
              {keys.map((k) => {
                const m = METRIC_MAP.get(k)!;
                const v30 = velocity(ds, k, 30);
                const v90 = velocity(ds, k, 90);
                const t = metricTrend(ds, k, 60);
                const pb = plateauBreakthrough(ds, k);
                return (
                  <tr key={k}>
                    <td>{m.label}</td>
                    <td>{fmtUnit(v30.current, m.unit)}</td>
                    <td>{fmtUnit(v30.previous, m.unit)}</td>
                    <td>
                      <Delta value={v30.velocity} better={v30.improving}>
                        {fmtDelta(v30.velocity, m.unit)}
                      </Delta>
                    </td>
                    <td className="muted">{fmtDelta(v30.acceleration, m.unit)}</td>
                    <td>{fmtUnit(v90.current, m.unit)}</td>
                    <td>{fmtUnit(v90.previous, m.unit)}</td>
                    <td>
                      <Delta value={v90.velocity} better={v90.improving}>
                        {fmtDelta(v90.velocity, m.unit)}
                      </Delta>
                    </td>
                    <td>
                      <Badge tone={t.cls === "IMPROVING" ? "good" : t.cls === "DECLINING" ? "risk" : "neutral"}>{t.cls}</Badge>
                    </td>
                    <td>{pb.breakthrough ? <Badge tone="good">potential breakthrough</Badge> : pb.plateau ? <Badge>plateau</Badge> : <span className="muted text-xs">—</span>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
      <Panel title="Change over horizons" sub="30-day window now vs the 30-day window ending N ago">
        <div className="overflow-x-auto">
          <table className="data">
            <thead>
              <tr>
                <th>Metric</th>
                <th>Now</th>
                {horizons.map(([l]) => (
                  <th key={l}>{l} ago</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {keys.map((k) => {
                const m = METRIC_MAP.get(k)!;
                const rows = horizons.map(([, d]) => compareRows(ds, [k], { from: addDays(ds.asOf, -d - 29), to: addDays(ds.asOf, -d) }, { from: addDays(ds.asOf, -29), to: ds.asOf })[0]);
                return (
                  <tr key={k}>
                    <td>{m.label}</td>
                    <td className="font-semibold">{fmtUnit(rows[0].b.value, m.unit)}</td>
                    {rows.map((r, i) => (
                      <td key={i}>
                        {fmtUnit(r.a.value, m.unit)}{" "}
                        {r.delta != null && (
                          <Delta value={r.delta} better={r.better}>
                            {fmtDelta(r.delta, m.unit)}
                          </Delta>
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
      <Grid cols="lg:grid-cols-2">
        <Panel title="Productive time (365D)">
          <TrendChart data={seriesWithAvg(ds, "productive.min", 365)} unit="min" showDaily={false} avgLabel="7-day average" />
        </Panel>
        <Panel title="Personal records">
          <table className="data">
            <tbody>
              {rec.map((r) => (
                <tr key={r.label}>
                  <td>{r.label}</td>
                  <td className="font-semibold">
                    {r.unit === "min" ? fmtUnit(r.value, "min") : `${r.value.toFixed(r.unit === "/5" || r.unit === "h" ? 1 : 0)} ${r.unit}`}
                  </td>
                  <td className="num muted">{r.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </Grid>
    </>
  );
}
