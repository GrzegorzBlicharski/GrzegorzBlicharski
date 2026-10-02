import { getAnalysis } from "@/server/context";
import { PageHeader, Panel, Grid, Badge, Empty, Kpi, Field, InsightCard } from "@/components/ui";
import { TrendChart, Bars, StackedBars } from "@/components/charts";
import { seriesWithAvg, MetricWindowTable } from "@/components/metricViews";
import { skillMix, monthlyErrorRates, rateChange, recurringErrors, cefrEvidence, germanOutputTotals } from "@/modules/german";
import { fmtMin, fmtPct, fmtNum } from "@/components/format";
import { sliceDays } from "@/metrics/series";
import { addDays } from "@/core/dates";
import { CEFR_LEVELS, TEST_KINDS } from "@/domains/catalog";
import { ActionForm } from "@/components/ActionForm";
import { recordTest } from "@/server/actions";

export const dynamic = "force-dynamic";

export default function GermanPage() {
  const { ds, insights } = getAnalysis();
  const mix30 = skillMix(ds, 30);
  const rates = monthlyErrorRates(ds);
  const err = rateChange(rates, (r) => r.err100);
  const spk = rateChange(rates, (r) => r.errPerMin);
  const recurring = recurringErrors(rates);
  const cefr = cefrEvidence(ds);
  const out30 = germanOutputTotals(sliceDays(ds, addDays(ds.asOf, -29), ds.asOf));
  const cats = [...new Set(rates.slice(-12).flatMap((r) => Object.keys(r.byCat)))].slice(0, 8);
  const own = insights.filter((i) => i.domain === "GERMAN");
  const tests = ds.tests.filter((t) => t.domain === "GERMAN").slice(-12).reverse();
  return (
    <div className="space-y-3">
      <PageHeader title="German" subtitle="Where your German time goes, what it produces, and whether accuracy is actually improving." />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Kpi label="Time 30D" value={fmtMin(mix30.total / 30)} sub="per day" metricKey="german.min" />
        <Kpi label="Active ratio 30D" value={fmtPct((mix30.activeRatio ?? 0) * 100)} sub={`active ${fmtMin(mix30.active)} · passive ${fmtMin(mix30.passive)}`} tone={mix30.passiveShareFlag ? "warn" : "neutral"} metricKey="german.activeRatio" />
        <Kpi label="Speaking 30D" value={fmtMin(out30.speakingMin)} sub="actual speaking minutes" metricKey="german.speakingMin" />
        <Kpi label="Words 30D" value={fmtNum(out30.words)} sub={`${fmtNum(out30.exercises)} exercises`} metricKey="german.words" />
        <Kpi label="Errors / 100 words" value={fmtNum(err.last, 2)} sub={err.perMonth != null ? `${err.perMonth > 0 ? "+" : ""}${err.perMonth.toFixed(2)} / month (${err.months} mo)` : "needs ≥3 months"} tone={err.perMonth == null ? "neutral" : err.perMonth < 0 ? "good" : "warn"} metricKey="german.err100" />
        <Kpi label="Errors / speaking min" value={fmtNum(spk.last, 2)} sub={spk.perMonth != null ? `${spk.perMonth > 0 ? "+" : ""}${spk.perMonth.toFixed(2)} / month` : "needs ≥3 months"} tone={spk.perMonth == null ? "neutral" : spk.perMonth < 0 ? "good" : "warn"} metricKey="german.errPerSpeakMin" />
      </div>
      <Grid cols="lg:grid-cols-2">
        <Panel title="German time per day (90D)">
          <TrendChart data={seriesWithAvg(ds, "german.min", 90)} unit="min" target={ds.settings.targets.germanMin.target} />
        </Panel>
        <Panel title="Skill mix vs your target mix (30D)" sub="Flags only relative to the mix you defined in Settings">
          <table className="data">
            <thead>
              <tr>
                <th>Skill</th>
                <th>Time</th>
                <th>Share</th>
                <th>Target</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {mix30.skills.map((s) => (
                <tr key={s.skill}>
                  <td>{s.skill}</td>
                  <td>{fmtMin(s.minutes)}</td>
                  <td>{fmtPct(s.share * 100, 1)}</td>
                  <td>{s.target != null ? fmtPct(s.target * 100) : "—"}</td>
                  <td>{s.flag && <Badge tone="warn">{s.flag === "under" ? "too little" : "too much"}</Badge>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
        <Panel title="Written error rate by month" sub={`Change per 100 study hours: ${err.per100h != null ? err.per100h.toFixed(2) : "—"} · confidence ${err.confidence}`}>
          <Bars data={rates.slice(-18).map((r) => ({ label: r.month.slice(2), value: r.err100 == null ? null : Math.round(r.err100 * 100) / 100 }))} unit="per100" />
        </Panel>
        <Panel title="Error categories by month" sub="Recurring = ≥15% share in ≥3 of the last 4 months">
          <StackedBars data={rates.slice(-12).map((r) => ({ label: r.month.slice(2), ...Object.fromEntries(cats.map((c) => [c, r.byCat[c] ?? 0])) }))} keys={cats.map((c) => ({ key: c, label: c }))} unit="count" />
          <div className="mt-2 flex flex-wrap gap-2">
            {recurring.length ? recurring.map((r) => <Badge key={r.category} tone="warn">{`${r.category} ${(r.lastShare * 100).toFixed(0)}% · ${r.trend}`}</Badge>) : <span className="muted text-xs">No recurring category detected.</span>}
          </div>
        </Panel>
      </Grid>
      <Panel title="CEFR evidence ladder" sub="OFFICIAL > EXTERNAL > MOCK > SELF > SYSTEM. A system estimate is never presented as a certified level.">
        <div className="overflow-x-auto">
          <table className="data">
            <thead>
              <tr>
                <th>Skill</th>
                {CEFR_LEVELS.map((l) => (
                  <th key={l}>{l}</th>
                ))}
                <th>Best evidence</th>
                <th>Latest</th>
              </tr>
            </thead>
            <tbody>
              {cefr.map((c) => (
                <tr key={c.skill}>
                  <td className="font-medium">{c.skill}</td>
                  {CEFR_LEVELS.map((l) => {
                    const ev = c.all.filter((t) => t.level === l);
                    const best = ev.sort((a, b) => TEST_KINDS.indexOf(a.kind as never) - TEST_KINDS.indexOf(b.kind as never))[0];
                    return (
                      <td key={l} title={ev.map((t) => `${t.date} ${t.kind} ${t.pct}%`).join("\n")}>
                        {best ? <span className="text-[10px] font-semibold" style={{ color: best.kind === "OFFICIAL" ? "var(--good-ink)" : "var(--text-2)" }}>{best.kind}</span> : ""}
                      </td>
                    );
                  })}
                  <td>{c.best ? `${c.best.level} (${c.best.kind.toLowerCase()}, ${c.best.date})` : "no evidence"}</td>
                  <td>{c.latest ? `${c.latest.pct}% ${c.latest.kind.toLowerCase()} · ${c.latest.date}` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
      <Panel title="Metrics across windows">
        <MetricWindowTable ds={ds} keys={["german.min", "german.activeMin", "german.passiveMin", "german.activeRatio", "german.speakingMin", "german.words", "german.err100", "german.errPerSpeakMin", "german.vocabRetention"]} />
      </Panel>
      <Grid cols="lg:grid-cols-2">
        <Panel title="German findings">{own.length ? <div className="space-y-2">{own.map((i) => <InsightCard key={i.id} i={i} />)}</div> : <Empty>No German-specific findings with current data.</Empty>}</Panel>
        <Panel title="Tests" id="tests">
          <ActionForm action={recordTest} submitLabel="Record test">
            <input type="hidden" name="domain" value="GERMAN" />
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Field label="Name">
                <input name="name" className="input" required />
              </Field>
              <Field label="Kind">
                <select name="kind" className="input">
                  {TEST_KINDS.map((k) => (
                    <option key={k}>{k}</option>
                  ))}
                </select>
              </Field>
              <Field label="Skill">
                <select name="skill" className="input">
                  {["Reading", "Listening", "Speaking", "Writing", "Overall"].map((k) => (
                    <option key={k}>{k}</option>
                  ))}
                </select>
              </Field>
              <Field label="Level">
                <select name="level" className="input">
                  <option value="">—</option>
                  {CEFR_LEVELS.map((k) => (
                    <option key={k}>{k}</option>
                  ))}
                </select>
              </Field>
              <Field label="Score">
                <input name="score" type="number" step="any" className="input" required />
              </Field>
              <Field label="Max">
                <input name="maxScore" type="number" step="any" defaultValue={100} className="input" />
              </Field>
              <Field label="Date">
                <input name="date" type="date" defaultValue={ds.asOf} className="input" />
              </Field>
              <Field label="Evidence link/ref">
                <input name="ref" className="input" />
              </Field>
            </div>
          </ActionForm>
          <table className="data mt-3">
            <tbody>
              {tests.map((t) => (
                <tr key={t.id}>
                  <td className="num">{t.date}</td>
                  <td>{t.name}</td>
                  <td>
                    <Badge tone={t.kind === "OFFICIAL" ? "good" : "neutral"}>{t.kind}</Badge>
                  </td>
                  <td>{t.pct}%</td>
                  <td>{t.level ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </Grid>
    </div>
  );
}
