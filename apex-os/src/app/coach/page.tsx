import { getAnalysis } from "@/server/context";
import { PageHeader, Panel, Grid, Badge, Empty, InsightCard } from "@/components/ui";
import { PRIORITY_FORMULA } from "@/coach/insights";
import { weeklyReview, biggestLever, knowledgeState, howIWorkBest } from "@/coach/weekly";
import { verifyRecommendations } from "@/experiments/evaluate";
import { goalStatus } from "@/forecasting/goals";
import { maturity } from "@/modules/consistency";
import { issueRecommendation, setRecommendationStatus } from "@/server/actions";
import { fmtPct } from "@/components/format";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function CoachPage() {
  const { ds, insights } = getAnalysis();
  const wr = weeklyReview(ds, insights);
  const lever = biggestLever(ds, insights);
  const ks = knowledgeState(ds, insights);
  const how = howIWorkBest(ds);
  const rv = verifyRecommendations(ds);
  const mat = maturity(ds);
  const leverage = insights.filter((i) => i.impact >= 4 && i.effort <= 2 && i.kind !== "strength");
  const goals = ds.goals.filter((g) => g.status === "active");
  return (
    <div className="space-y-3">
      <PageHeader title="Coach engine" subtitle="Rule-based, evidence-first. FACT → INTERPRETATION → ACTION. No grading of the person." />
      <Panel title="Priority formula (visible)">
        <code className="text-2 block text-xs leading-relaxed">{PRIORITY_FORMULA}</code>
        <p className="muted mt-1 text-xs">
          Data maturity: <b>{mat.stage}</b> ({mat.daysTracked} days). Coverage last 30 days: {mat.coverage.map((c) => `${c.label} ${c.pct.toFixed(0)}%`).join(" · ")}
        </p>
      </Panel>
      {lever && (
        <Panel title="One biggest lever for next week" sub="What single change is most likely to improve verified progress next week?">
          <dl className="grid gap-2 text-sm md:grid-cols-[160px_1fr]">
            <dt className="label pt-0.5">Observation</dt>
            <dd className="font-semibold">{lever.observation}</dd>
            <dt className="label pt-0.5">Evidence</dt>
            <dd>{lever.evidence.join(" ")}</dd>
            <dt className="label pt-0.5">Hypothesis</dt>
            <dd>{lever.hypothesis}</dd>
            <dt className="label pt-0.5">Action</dt>
            <dd className="font-medium">{lever.action}</dd>
            <dt className="label pt-0.5">Expected effect</dt>
            <dd>{lever.expectedEffect}</dd>
            <dt className="label pt-0.5">How we test it</dt>
            <dd>{lever.howToTest}</dd>
            <dt className="label pt-0.5">Confidence</dt>
            <dd>
              {lever.confidence} · P{lever.priority}
            </dd>
          </dl>
        </Panel>
      )}
      <Grid cols="lg:grid-cols-3">
        <Panel title="Weekly review" className="lg:col-span-2">
          <div className="grid gap-3 md:grid-cols-2">
            {(Object.keys(wr) as (keyof typeof wr)[]).map((k) => (
              <div key={k}>
                <div className="label mb-1">{k}</div>
                {wr[k].length ? (
                  <ul className="space-y-1 text-sm">
                    {wr[k].map((x, i) => (
                      <li key={i}>• {x}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="muted text-xs">—</p>
                )}
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Goal → biggest limiting factor">
          {goals.length ? (
            <ul className="space-y-2 text-sm">
              {goals.map((g) => {
                const st = goalStatus(ds, g);
                const lim = insights.find((i) => i.kind !== "strength" && (i.domain === g.domain || (i.metricKey && (g.leading.includes(i.metricKey) || g.metricKey === i.metricKey))));
                return (
                  <li key={g.id}>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{g.title}</span>
                      <Badge tone={st.status === "BEHIND" ? "risk" : st.status === "NO DATA" ? "neutral" : "good"}>{st.status}</Badge>
                    </div>
                    <div className="text-2 text-xs">{lim ? `${lim.title} — ${lim.action}` : "No limiting factor detected"}</div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <Empty>No active goals.</Empty>
          )}
        </Panel>
      </Grid>
      <Panel title="High-leverage opportunities" sub="Impact ≥ 4 and effort ≤ 2 — small change, potentially large effect">
        {leverage.length ? <div className="grid gap-2 lg:grid-cols-2">{leverage.map((i) => <InsightCard key={i.id} i={i} compact />)}</div> : <Empty>None detected.</Empty>}
      </Panel>
      <Panel title={`All findings (${insights.length})`} sub="Sorted by priority. Track a finding to verify later whether the advice worked.">
        <div className="grid gap-2 xl:grid-cols-2">
          {insights.map((i) => (
            <InsightCard
              key={i.id}
              i={i}
              actions={
                i.kind !== "strength" ? (
                  <>
                    <form action={issueRecommendation}>
                      <input type="hidden" name="ruleId" value={i.ruleId} />
                      <input type="hidden" name="title" value={i.action.slice(0, 290)} />
                      {i.metricKey && <input type="hidden" name="metricKey" value={i.metricKey} />}
                      {i.direction && <input type="hidden" name="direction" value={i.direction} />}
                      <input type="hidden" name="status" value="accepted" />
                      <button className="btn btn-sm">Accept & track</button>
                    </form>
                    {i.experiment && (
                      <Link className="btn btn-sm" href={`/experiments?from=${encodeURIComponent(i.ruleId)}`}>
                        Turn into experiment
                      </Link>
                    )}
                    <Link className="btn btn-sm" href={`/experiments?intervention=${encodeURIComponent(i.title)}&metric=${i.metricKey ?? ""}&dir=${i.direction ?? "up"}`}>
                      14/30/90-day intervention
                    </Link>
                  </>
                ) : undefined
              }
            />
          ))}
        </div>
      </Panel>
      <Grid cols="lg:grid-cols-2">
        <Panel title="Known · Likely · Unknown · Test next">
          {(
            [
              ["Known (high confidence)", ks.known],
              ["Likely (medium)", ks.likely],
              ["Unknown (low / insufficient)", ks.unknown],
              ["Test next", ks.testNext],
            ] as const
          ).map(([t, xs]) => (
            <div key={t} className="mb-3">
              <div className="label mb-1">{t}</div>
              {xs.length ? (
                <ul className="text-2 space-y-1 text-sm">
                  {xs.slice(0, 6).map((x, i) => (
                    <li key={i}>• {x}</li>
                  ))}
                </ul>
              ) : (
                <p className="muted text-xs">—</p>
              )}
            </div>
          ))}
        </Panel>
        <Panel title="Coach track record" sub="Did the system's recommendations point in the right direction? Unverifiable advice is excluded.">
          <div className="mb-2 text-sm">
            Issued {rv.issued} · accepted {rv.accepted} · verified {rv.verified} · hit rate <b>{fmtPct(rv.hitRate)}</b>
          </div>
          <table className="data">
            <tbody>
              {rv.outcomes.slice(0, 12).map((o) => (
                <tr key={o.rec.id}>
                  <td className="num">{o.rec.issuedDay}</td>
                  <td>{o.rec.title}</td>
                  <td>
                    <Badge>{o.rec.status}</Badge>
                  </td>
                  <td>{o.hit == null ? <span className="muted text-xs">{o.verifiable ? (o.due ? "no data" : "pending") : "unverifiable"}</span> : <Badge tone={o.hit ? "good" : "risk"}>{o.hit ? "hit" : "miss"}</Badge>}</td>
                  <td>
                    {o.rec.status !== "implemented" && (
                      <form action={setRecommendationStatus}>
                        <input type="hidden" name="recId" value={o.rec.id} />
                        <input type="hidden" name="status" value="implemented" />
                        <button className="btn btn-sm">implemented</button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </Grid>
      <Grid cols="lg:grid-cols-2">
        <Panel title="How I work best" sub="Every point with evidence; otherwise insufficient data">
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
        <Panel title="What tends not to work for me">
          {how.notWorking.length ? (
            <table className="data">
              <tbody>
                {how.notWorking.map((h) => (
                  <tr key={h.label}>
                    <td className="font-medium">{h.label}</td>
                    <td>
                      {h.finding}
                      <div className="muted text-[11px]">{h.evidence}</div>
                    </td>
                    <td className="muted text-xs">{h.confidence}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <Empty>No evidence-backed negative patterns yet.</Empty>
          )}
        </Panel>
      </Grid>
    </div>
  );
}
