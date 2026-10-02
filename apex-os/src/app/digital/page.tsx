import { getDataset } from "@/server/context";
import { PageHeader, Panel, Grid, Badge, Empty, Kpi, Progress } from "@/components/ui";
import { TrendChart, Bars, StackedBars } from "@/components/charts";
import { seriesWithAvg, MetricWindowTable } from "@/components/metricViews";
import { phoneToday, phoneCompliance, noPhoneCompliance, distractionCost, reclaimedTime, morningDiscipline, phoneByHour, budgetAlerts } from "@/modules/digital";
import { relate } from "@/analytics/relations";
import { fmtMin, fmtPct, fmtNum } from "@/components/format";
import { sliceDays, windowAgg } from "@/metrics/series";
import { addDays } from "@/core/dates";
import { PHONE_CATEGORIES } from "@/domains/catalog";
import { deletePhoneUsage } from "@/server/actions";
import { getDb } from "@/data/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DigitalPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const ds = getDataset();
  const day = sp.day ?? ds.asOf;
  const t = phoneToday(ds, day);
  const c7 = phoneCompliance(ds, 7);
  const c30 = phoneCompliance(ds, 30);
  const c90 = phoneCompliance(ds, 90);
  const windows = noPhoneCompliance(ds);
  const dc = distractionCost(ds);
  const rt = reclaimedTime(ds);
  const md = morningDiscipline(ds);
  const byHour = phoneByHour(ds);
  const alerts = budgetAlerts(ds);
  const from = addDays(ds.asOf, -89);
  const rels = [
    ["deep.min", "Deep work"],
    ["exec.pct", "Plan execution"],
    ["focus.avg", "Focus"],
    ["german.min", "German time"],
    ["law.min", "Law time"],
  ].map(([k, l]) => ({ l, r: relate(ds, "phone.total", k, { from, threshold: ds.settings.phoneLimitMin }) }));
  const days30 = sliceDays(ds, addDays(ds.asOf, -29), ds.asOf);
  const catRows = days30.filter((d) => d.phone).map((d) => ({ label: d.day.slice(5), ...Object.fromEntries(PHONE_CATEGORIES.map((c) => [c, Math.round(d.phone!.byCategory[c] ?? 0)])) }));
  const usedCats = PHONE_CATEGORIES.filter((c) => catRows.some((r) => (r as Record<string, number | string>)[c]));
  const entries = getDb().prepare("SELECT id, category, minutes, start, end, source FROM phone_usage WHERE day = ? ORDER BY start").all<Record<string, string | number | null>>(day);
  const tone = !t.hasData ? "neutral" : t.total > t.limit ? "risk" : t.total > t.limit * 0.75 ? "warn" : "good";
  return (
    <div className="space-y-3">
      <PageHeader title="Digital hygiene" subtitle={`Phone budget ${t.limit} min/day (configurable, versioned). Separate indicators — no magic number.`}>
        <form method="get" className="flex gap-2">
          <input type="date" name="day" defaultValue={day} className="input w-40" />
          <button className="btn">Show day</button>
        </form>
      </PageHeader>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Kpi label={day === ds.asOf ? "Today" : day} value={t.hasData ? `${Math.round(t.total)} / ${t.limit} min` : "no data"} sub={t.hasData ? (t.overBy ? `over by ${Math.round(t.overBy)} min` : `remaining ${Math.round(t.remaining)} min`) : ""} tone={tone} metricKey="phone.total">
          {t.hasData && <Progress value={t.total} max={t.limit} tone={tone === "good" ? "good" : tone} />}
        </Kpi>
        <Kpi label="7-day average" value={fmtMin(c7.avg)} sub={`${c7.under}/${c7.dataDays} days under limit`} />
        <Kpi label="30-day average" value={fmtMin(c30.avg)} sub={`compliance ${fmtPct(c30.pct)} · over on ${c30.over} days`} metricKey="phone.compliance" />
        <Kpi label="90-day compliance" value={fmtPct(c90.pct)} sub={`cumulative overage ${fmtMin(c90.cumulativeOverage)}`} />
        <Kpi label="Unproductive 30D" value={fmtMin(windowAgg(ds, "phone.unproductive", "30D").value)} sub="per day" metricKey="phone.unproductive" />
        <Kpi label="Morning discipline" value={fmtPct(md.pct)} sub={`phone-free mornings · n=${md.n}`} metricKey="phone.morning" />
      </div>
      {alerts.length > 0 && <div className="flex flex-wrap gap-2">{alerts.map((a) => <Badge key={a.id} tone={a.severity === "risk" ? "risk" : "warn"}>{a.message}</Badge>)}</div>}
      <Grid cols="lg:grid-cols-3">
        <Panel title={`Day detail · ${day}`}>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
            <dt className="muted">Total</dt>
            <dd>{fmtMin(t.total)}</dd>
            <dt className="muted">Productive</dt>
            <dd>{fmtMin(t.productive)}</dd>
            <dt className="muted">Non-productive</dt>
            <dd>{fmtMin(t.unproductive)}</dd>
            <dt className="muted">Morning</dt>
            <dd>{fmtMin(t.morning)}</dd>
            <dt className="muted">Evening</dt>
            <dd>{fmtMin(t.evening)}</dd>
            <dt className="muted">Pickups</dt>
            <dd>{t.pickups ?? "—"}</dd>
            <dt className="muted">First / last use</dt>
            <dd>
              {t.first ?? "—"} / {t.last ?? "—"}
            </dd>
            <dt className="muted">Longest / avg session</dt>
            <dd>
              {fmtMin(t.longest)} / {fmtMin(t.avgSession)}
            </dd>
          </dl>
          <table className="data mt-3">
            <tbody>
              {entries.map((e) => (
                <tr key={e.id as string}>
                  <td>{e.category}</td>
                  <td>{fmtMin(e.minutes as number)}</td>
                  <td className="num muted">{e.start ? `${String(e.start).slice(11, 16)}–${String(e.end ?? "").slice(11, 16)}` : ""}</td>
                  <td>
                    <form action={deletePhoneUsage}>
                      <input type="hidden" name="usageId" value={e.id as string} />
                      <button className="btn btn-sm btn-danger">del</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Link href="/log?tab=phone" className="btn mt-2">
            Add phone data
          </Link>
        </Panel>
        <Panel title="Phone per day (90D)" className="lg:col-span-2">
          <TrendChart data={seriesWithAvg(ds, "phone.total", 90)} unit="min" target={ds.settings.phoneLimitMin} />
        </Panel>
      </Grid>
      <Grid cols="lg:grid-cols-2">
        <Panel title="Categories (30D)">
          <StackedBars data={catRows} keys={usedCats.map((c) => ({ key: c, label: c }))} unit="min" />
        </Panel>
        <Panel title="When non-productive phone use happens (30D, min/day per hour)">
          <Bars data={byHour.map((m, h) => ({ label: String(h).padStart(2, "0"), value: Math.round(m * 10) / 10 }))} unit="min" />
        </Panel>
      </Grid>
      <Grid cols="lg:grid-cols-3">
        <Panel title="No-phone windows (30D)" sub="Days with timed data; non-productive use inside the window counts as a violation">
          {windows.length ? (
            <table className="data">
              <thead>
                <tr>
                  <th>Window</th>
                  <th>Clean days</th>
                  <th>Avg violation</th>
                </tr>
              </thead>
              <tbody>
                {windows.map((w) => (
                  <tr key={w.id}>
                    <td>{w.label}</td>
                    <td>
                      {w.cleanDays}/{w.trackedDays} ({fmtPct(w.pct)})
                    </td>
                    <td>{fmtMin(w.avgViolationMin)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <Empty>No windows enabled (Settings).</Empty>
          )}
        </Panel>
        <Panel title="Distraction cost (30D)" sub="Possible distraction-related start delays — overlap of non-productive phone use with the gap before a late start. Not proof of cause.">
          <div className="text-sm">
            <b>{dc.events.length}</b> of {dc.checked} planned starts flagged · {fmtMin(dc.totalDelay)} total delay
          </div>
          <table className="data mt-2">
            <tbody>
              {dc.events.slice(0, 8).map((e) => (
                <tr key={e.sessionId}>
                  <td className="num">{e.day}</td>
                  <td className="num">
                    plan {e.plannedStart.slice(11, 16)} → start {e.actualStart.slice(11, 16)}
                  </td>
                  <td>+{e.delay}m</td>
                  <td className="muted text-xs">
                    phone {e.phoneMinutes}m ({e.categories.join(", ")})
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
        <Panel title="Reclaimed time" sub="Pure arithmetic — not a claim that all reclaimed time is productive">
          {rt.reclaimedPerDay != null ? (
            <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
              <dt className="muted">Baseline ({rt.baselineFrom} → {rt.baselineTo})</dt>
              <dd>{fmtMin(rt.baselinePerDay)}/day</dd>
              <dt className="muted">Current 30D</dt>
              <dd>{fmtMin(rt.currentPerDay)}/day</dd>
              <dt className="muted">Difference</dt>
              <dd className="font-semibold">{fmtMin(rt.reclaimedPerDay)}/day</dd>
              <dt className="muted">Monthly reclaimed</dt>
              <dd className="font-semibold">~{fmtNum(rt.reclaimedPerMonthH, 0)} h</dd>
              <dt className="muted">Productive time then → now</dt>
              <dd>
                {fmtMin(rt.productiveBaseline)} → {fmtMin(rt.productiveCurrent)}/day
              </dd>
              <dt className="muted">Coincided with productive gain</dt>
              <dd>{rt.conversionPct != null ? `${fmtPct(rt.conversionPct)} of reclaimed` : "—"}</dd>
            </dl>
          ) : (
            <Empty>Needs a baseline window and a later 30-day window of phone data.</Empty>
          )}
          <p className="muted mt-2 text-[11px]">Confidence {rt.confidence} · n baseline {rt.baselineN}, current {rt.currentN}. Co-occurrence only.</p>
        </Panel>
      </Grid>
      <Panel title="Phone vs outcomes (90D)" sub={`Split at your limit (${ds.settings.phoneLimitMin} min). If the data shows no relationship, it says so.`}>
        <table className="data">
          <thead>
            <tr>
              <th>Outcome</th>
              <th>Days ≤ limit</th>
              <th>Days &gt; limit</th>
              <th>Effect size d</th>
              <th>Spearman ρ (95% CI)</th>
              <th>Conf.</th>
              <th>Reading</th>
            </tr>
          </thead>
          <tbody>
            {rels.map(({ l, r }) => (
              <tr key={l}>
                <td>{l}</td>
                <td>
                  {r.split?.lowMean != null ? fmtNum(r.split.lowMean, 1) : "—"} <span className="muted text-[10px]">n={r.split?.lowN ?? 0}</span>
                </td>
                <td>
                  {r.split?.highMean != null ? fmtNum(r.split.highMean, 1) : "—"} <span className="muted text-[10px]">n={r.split?.highN ?? 0}</span>
                </td>
                <td>{r.split?.d != null ? r.split.d.toFixed(2) : "—"}</td>
                <td>
                  {r.rho != null ? r.rho.toFixed(2) : "—"} {r.ci ? <span className="muted text-[10px]">({r.ci[0].toFixed(2)}…{r.ci[1].toFixed(2)})</span> : null}
                </td>
                <td>
                  <Badge tone={r.confidence === "HIGH" ? "good" : r.confidence === "MEDIUM" ? "accent" : "neutral"}>{r.confidence}</Badge>
                </td>
                <td className="text-2 text-xs">{r.statement}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <Link href="/experiments?template=phone" className="link mt-2 inline-block text-sm">
          Test it properly: start a phone experiment →
        </Link>
      </Panel>
      <Panel title="Metrics across windows">
        <MetricWindowTable ds={ds} keys={["phone.total", "phone.unproductive", "phone.productive", "phone.compliance", "phone.morning", "phone.evening", "phone.pickups", "phone.deepInterruptions"]} />
      </Panel>
    </div>
  );
}
