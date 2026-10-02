import Link from "next/link";
import { getAnalysis } from "@/server/context";
import { PageHeader, Panel, Grid, Badge, Empty, Delta } from "@/components/ui";
import { buildReport, compareRows, KEY_COMPARE_METRICS, germanEvidenceAt, type ReportKind } from "@/reports/build";
import { biggestLever, howIWorkBest, weeklyReview } from "@/coach/weekly";
import { fmtUnit, fmtDelta, fmtMin, fmtNum } from "@/components/format";
import { PrintButton } from "@/components/PrintButton";
import { reclaimedTime } from "@/modules/digital";
import { baselineEvolution } from "@/modules/consistency";
import { learningVelocity } from "@/modules/learning";
import { addDays } from "@/core/dates";

export const dynamic = "force-dynamic";

const KINDS: [ReportKind, string][] = [
  ["week", "Weekly"],
  ["month", "Monthly"],
  ["quarter", "90-day transformation"],
  ["year", "Annual review"],
];

export default async function ReportsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const { ds, insights } = getAnalysis();
  const kind = (sp.kind as ReportKind) ?? "week";
  if (!ds.firstDay) return <Empty>No data yet.</Empty>;
  const r = buildReport(ds, kind, ds.asOf, insights);
  const lever = biggestLever(ds, insights);
  const wr = weeklyReview(ds, insights);
  const how = howIWorkBest(ds);
  const rt = reclaimedTime(ds);
  const base = baselineEvolution(ds, "year");
  const lv = learningVelocity(ds);
  const first = { from: ds.firstDay, to: ds.days.length > 30 ? ds.days[29].day : ds.asOf };
  return (
    <div className="space-y-3">
      <PageHeader title={r.title} subtitle={`${r.current.from} → ${r.current.to} vs ${r.previous.from} → ${r.previous.to} · 90-day average as reference`}>
        {KINDS.map(([k, l]) => (
          <Link key={k} href={`/reports?kind=${k}`} className={`btn btn-sm ${k === kind ? "btn-primary" : ""}`}>
            {l}
          </Link>
        ))}
        <PrintButton />
      </PageHeader>
      <Grid cols="lg:grid-cols-3">
        <Panel title="Biggest change">{r.biggestChange ? <div className="text-sm"><b>{r.biggestChange.label}</b>: {fmtUnit(r.biggestChange.a.value, r.biggestChange.unit)} → {fmtUnit(r.biggestChange.b.value, r.biggestChange.unit)} <Delta value={r.biggestChange.delta} better={r.biggestChange.better}>{fmtDelta(r.biggestChange.delta, r.biggestChange.unit)}</Delta></div> : <Empty>—</Empty>}</Panel>
        <Panel title="Biggest bottleneck">{r.bottlenecks[0] ? <div className="text-sm"><b>{r.bottlenecks[0].title}</b> — {r.bottlenecks[0].facts[0]}</div> : <Empty>None detected</Empty>}</Panel>
        <Panel title="Biggest opportunity">{lever ? <div className="text-sm"><b>{lever.observation}</b> — {lever.action}</div> : <Empty>—</Empty>}</Panel>
      </Grid>
      <div className="grid gap-3 xl:grid-cols-2">
        {r.sections.map((s) => (
          <Panel key={s.title} title={s.title}>
            <table className="data">
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>Previous</th>
                  <th>Current</th>
                  <th>Change</th>
                  <th>90D avg</th>
                </tr>
              </thead>
              <tbody>
                {s.rows.map((row) => (
                  <tr key={row.key}>
                    <td>{row.label}</td>
                    <td>{fmtUnit(row.a.value, row.unit)}</td>
                    <td className="font-semibold">{fmtUnit(row.b.value, row.unit)}</td>
                    <td>
                      <Delta value={row.delta} better={row.better}>
                        {fmtDelta(row.delta, row.unit)}
                      </Delta>
                    </td>
                    <td className="muted">{fmtUnit(row.c?.value, row.unit)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        ))}
      </div>
      <Grid cols="lg:grid-cols-3">
        <Panel title="Goals">
          <ul className="space-y-1 text-sm">
            {r.goals.map((g) => (
              <li key={g.title} className="flex justify-between gap-2">
                <span>{g.title}</span>
                <Badge tone={g.status === "BEHIND" ? "risk" : "good"}>{`${g.status}${g.pct != null ? ` · ${g.pct.toFixed(0)}%` : ""}`}</Badge>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Weaknesses">
          <ul className="space-y-1 text-sm">{r.weaknesses.length ? r.weaknesses.map((i) => <li key={i.id}>• {i.title}: {i.facts[0]}</li>) : <li className="muted">None detected</li>}</ul>
        </Panel>
        <Panel title="Strengths">
          <ul className="space-y-1 text-sm">{r.strengths.length ? r.strengths.map((i) => <li key={i.id}>• {i.title}: {i.facts[0]}</li>) : <li className="muted">None detected</li>}</ul>
        </Panel>
      </Grid>
      <Grid cols="lg:grid-cols-2">
        <Panel title="Sustainability">
          <Badge tone={r.sustainability.warning ? "risk" : "good"}>{r.sustainability.warning ? "Warning" : "OK"}</Badge>
          <p className="text-2 mt-1 text-sm">{r.sustainability.signals.length ? r.sustainability.signals.join(", ") : "No falling quality signals."}</p>
        </Panel>
        <Panel title="Milestones & tests in period">
          <ul className="space-y-1 text-sm">
            {r.milestones.map((m) => (
              <li key={m.id}>
                <span className="num muted">{m.date}</span> {m.title}
              </li>
            ))}
            {r.tests.slice(-8).map((t) => (
              <li key={t.id}>
                <span className="num muted">{t.date}</span> {t.name} · {t.kind} · {t.pct}%
              </li>
            ))}
            {!r.milestones.length && !r.tests.length && <li className="muted">None</li>}
          </ul>
        </Panel>
      </Grid>
      {(kind === "quarter" || kind === "year") && (
        <>
          <Panel title="Transformation: first 30 days of tracking vs last 30 days" sub="How thousands of small actions translated into observable change">
            <table className="data">
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>{first.from}</th>
                  <th>Now</th>
                  <th>Change</th>
                </tr>
              </thead>
              <tbody>
                {compareRows(ds, KEY_COMPARE_METRICS, first, { from: addDays(ds.asOf, -29), to: ds.asOf }).map((row) => (
                  <tr key={row.key}>
                    <td>{row.label}</td>
                    <td>{fmtUnit(row.a.value, row.unit)}</td>
                    <td className="font-semibold">{fmtUnit(row.b.value, row.unit)}</td>
                    <td>
                      <Delta value={row.delta} better={row.better}>
                        {fmtDelta(row.delta, row.unit)}
                      </Delta>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-2 mt-2 text-sm">
              German evidence: {germanEvidenceAt(ds, first.to)} → {germanEvidenceAt(ds, ds.asOf)} · Phone reclaimed: {rt.reclaimedPerDay != null ? `${fmtMin(rt.reclaimedPerDay)}/day (~${fmtNum(rt.reclaimedPerMonthH, 0)} h/month)` : "—"} · Productive baseline by year: {base.map((b) => `${b.period}: ${fmtNum(b.medianWeeklyH, 1)} h/week`).join(" · ")}
            </p>
          </Panel>
          <Grid cols="lg:grid-cols-2">
            <Panel title="Learning velocity components">
              <table className="data">
                <tbody>
                  {lv.map((c) => (
                    <tr key={c.key}>
                      <td>{c.label}</td>
                      <td>
                        {c.change != null ? (
                          <Delta value={c.change} better={c.improving}>
                            {c.change > 0 ? "+" : ""}
                            {c.change.toFixed(2)} {c.unit}
                          </Delta>
                        ) : (
                          <span className="muted">insufficient data</span>
                        )}
                      </td>
                      <td className="muted text-xs">{c.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Panel>
            <Panel title="What works · what doesn't · next 90 days">
              <div className="label">Keep</div>
              <ul className="mb-2 text-sm">{wr.keep.map((x, i) => <li key={i}>• {x}</li>)}</ul>
              <div className="label">Does not work (evidence)</div>
              <ul className="mb-2 text-sm">{how.notWorking.length ? how.notWorking.map((h) => <li key={h.label}>• {h.finding}</li>) : <li className="muted">—</li>}</ul>
              <div className="label">Next 90 days</div>
              <ul className="text-sm">{[...wr.increase.slice(0, 2), ...wr.start.slice(0, 1), ...wr.test.slice(0, 1)].map((x, i) => <li key={i}>• {x}</li>)}</ul>
            </Panel>
          </Grid>
          <Panel title="How I work best (generated)">
            <table className="data">
              <tbody>
                {how.best.map((h) => (
                  <tr key={h.label}>
                    <td className="font-medium">{h.label}</td>
                    <td>
                      {h.finding ?? <span className="muted">insufficient data</span>}
                      <div className="muted text-[11px]">{h.evidence}</div>
                    </td>
                    <td className="muted text-xs">{h.confidence}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        </>
      )}
    </div>
  );
}
