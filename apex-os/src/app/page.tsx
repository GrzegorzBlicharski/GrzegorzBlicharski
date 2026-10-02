import Link from "next/link";
import { getAnalysis } from "@/server/context";
import { todayView } from "@/coach/today";
import { Kpi, Panel, Badge, Progress, Empty, InsightCard, type Tone } from "@/components/ui";
import { fmtMin, fmtPct, fmtNum } from "@/components/format";
import { METRIC_MAP } from "@/metrics/series";

export const dynamic = "force-dynamic";

const paceTone = (s: string): Tone => (s === "BEHIND" ? "risk" : s === "AHEAD" || s === "ACHIEVED" ? "good" : s === "ON TRACK" ? "good" : "neutral");

export default function TodayPage() {
  const { ds, insights } = getAnalysis();
  if (!ds.firstDay) return <Onboarding />;
  const v = todayView(ds, insights);
  const execTone: Tone = v.execution.pct == null ? "neutral" : v.execution.pct >= ds.settings.targets.executionPct ? "good" : v.execution.pct >= 60 ? "warn" : "risk";
  const phoneTone: Tone = !v.phone.hasData ? "neutral" : v.phone.total > v.phone.limit ? "risk" : v.phone.total > v.phone.limit * 0.75 ? "warn" : "good";
  const ladderTone = (val: number, floor: number, target: number): Tone => (val >= target ? "good" : val >= floor ? "warn" : "neutral");
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-xl font-semibold">Today · {v.day}</h1>
        <span className="muted text-xs">
          System reliability: {v.maturity.stage} ({v.maturity.daysTracked} days tracked)
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
        <Kpi label="German" value={`${fmtMin(v.german.value)}`} sub={`target ${fmtMin(v.german.target)} · floor ${fmtMin(v.german.floor)}`} tone={ladderTone(v.german.value, v.german.floor, v.german.target)} href="/german" metricKey="german.min">
          <Progress value={v.german.value} max={v.german.stretch} marker={v.german.target} tone={ladderTone(v.german.value, v.german.floor, v.german.target) === "good" ? "good" : "accent"} />
        </Kpi>
        <Kpi label="Law" value={fmtMin(v.law.value)} sub={`${v.law.questions}/${v.law.qTarget} questions · target ${fmtMin(v.law.target)}`} tone={ladderTone(v.law.value, ds.settings.targets.lawMin.floor, v.law.target)} href="/law" metricKey="law.min">
          <Progress value={v.law.value} max={ds.settings.targets.lawMin.stretch} marker={v.law.target} />
        </Kpi>
        <Kpi label="Deep work" value={fmtMin(v.deep.value)} sub={`target ${fmtMin(v.deep.target)}`} tone={ladderTone(v.deep.value, ds.settings.targets.deepMin.floor, v.deep.target)} href="/attention" metricKey="deep.min" />
        <Kpi
          label="Phone"
          value={v.phone.hasData ? `${Math.round(v.phone.total)} / ${v.phone.limit}` : `— / ${v.phone.limit}`}
          sub={v.phone.hasData ? (v.phone.overBy > 0 ? `over by ${Math.round(v.phone.overBy)} min` : `${Math.round(v.phone.remaining)} min remaining`) : "no phone data yet today"}
          tone={phoneTone}
          href="/digital"
          metricKey="phone.total"
        >
          {v.phone.hasData && <Progress value={v.phone.total} max={v.phone.limit} tone={phoneTone === "good" ? "good" : phoneTone} />}
        </Kpi>
        <Kpi label="Plan execution" value={fmtPct(v.execution.pct)} sub={v.execution.plannedDays ? `${fmtMin(v.execution.actual)} of ${fmtMin(v.execution.planned)} planned` : "no plan for today"} tone={execTone} href="/execution" metricKey="exec.pct" />
        <Kpi label="Goal pace" value={<Badge tone={paceTone(v.goalPace.status)}>{v.goalPace.status}</Badge>} sub={<span className="line-clamp-2">{v.goalPace.detail}</span>} href="/goals" />
        <Kpi label="Consistency 30D" value={fmtPct(v.streak.consistency30)} sub={`streak ${v.streak.current}d · longest ${v.streak.longest}d`} href="/execution" metricKey="consistency.minimumDay" />
        <Kpi label="Review due" value={fmtNum(v.reviewDue)} sub="law topics on schedule" tone={v.reviewDue > 20 ? "warn" : "neutral"} href="/law#due" />
      </div>

      {v.alerts.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {v.alerts.map((a) => (
            <Badge key={a.id} tone={a.severity === "risk" ? "risk" : a.severity === "warn" ? "warn" : "neutral"}>
              {a.message}
            </Badge>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
        <Panel title="Top 3 priorities today" sub="Ranked by priority score; one per domain" right={<Link className="link text-xs" href="/plan">Plan the day →</Link>}>
          {v.priorities.length ? (
            <ol className="space-y-2">
              {v.priorities.map((p) => (
                <li key={p.rank} className="flex gap-3">
                  <span className="num flex h-6 w-6 shrink-0 items-center justify-center rounded text-xs font-bold" style={{ background: "var(--accent)", color: "var(--accent-ink)" }}>
                    {p.rank}
                  </span>
                  <div className="min-w-0">
                    <div className="font-medium">
                      {p.label}
                      {p.minutes ? <span className="muted"> · {fmtMin(p.minutes)}</span> : null}
                    </div>
                    <div className="muted text-xs">{p.reason}</div>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <Empty>No priorities — define goals to let the system rank actions.</Empty>
          )}
        </Panel>
        <Panel title="Most important action" right={<Link className="link text-xs" href="/coach">Coach →</Link>}>
          {v.mostImportantAction ? (
            <div>
              <div className="text-lg font-semibold leading-snug">{v.mostImportantAction.action}</div>
              <div className="text-2 mt-2 text-sm">{v.mostImportantAction.facts[0]}</div>
              <div className="muted mt-1 text-xs">
                From: {v.mostImportantAction.title} · P{v.mostImportantAction.priority} · {v.mostImportantAction.confidence} confidence
              </div>
            </div>
          ) : (
            <Empty>Nothing actionable detected.</Empty>
          )}
        </Panel>
        <Panel title="Sustainability" right={<Link className="link text-xs" href="/recovery">Details →</Link>}>
          <div className="flex items-center gap-2">
            <Badge tone={v.sustainability.warning ? "risk" : "good"}>{v.sustainability.warning ? "Warning" : "Within capacity"}</Badge>
          </div>
          <p className="text-2 mt-2 text-sm">{v.sustainability.text}</p>
          <p className="muted mt-2 text-xs">Behavioural indicator only — never a medical assessment. Sleep is not a resource to cut.</p>
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
        <Panel title="Current bottleneck">{v.bottleneck ? <InsightCard i={v.bottleneck} compact /> : <Empty>No bottleneck detected with current data.</Empty>}</Panel>
        <Panel title="Top weakness">{v.topWeakness ? <InsightCard i={v.topWeakness} compact /> : <Empty>No weakness detected with current data.</Empty>}</Panel>
        <Panel title="Momentum" sub="Last 7 days vs previous 28 days">
          <div className="space-y-3">
            {v.momentum.map((m) => {
              const met = METRIC_MAP.get(m.key)!;
              const tone: Tone = m.direction === "up" ? "good" : m.direction === "down" ? "risk" : "neutral";
              return (
                <div key={m.key} className="flex items-center justify-between gap-2">
                  <div>
                    <div className="font-medium">{m.label}</div>
                    <div className="muted text-xs">{met.label}</div>
                  </div>
                  <div className="text-right">
                    <Badge tone={tone}>{m.direction === "up" ? "rising" : m.direction === "down" ? "falling" : m.direction === "flat" ? "stable" : "n/a"}</Badge>
                    <div className="num muted mt-0.5 text-xs">
                      {met.unit === "pct" ? `${fmtPct(m.prev28)} → ${fmtPct(m.last7)}` : met.unit === "min" ? `${fmtMin(m.prev28)} → ${fmtMin(m.last7)}/day` : `${fmtNum(m.prev28, 0)} → ${fmtNum(m.last7, 0)}/day`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        <Link href="/log" className="btn btn-primary">
          Start / log session
        </Link>
        <Link href="/log#phone" className="btn">
          Log phone
        </Link>
        <Link href="/log#review" className="btn">
          Evening review (60 s)
        </Link>
        <Link href="/reports?kind=week" className="btn">
          Weekly report
        </Link>
      </div>
    </div>
  );
}

function Onboarding() {
  return (
    <div className="mx-auto max-w-2xl space-y-4 py-8">
      <h1 className="text-2xl font-semibold">APEX OS</h1>
      <p className="text-2">
        A private, local-first system for measuring and improving long-term progress per sustainable hour. No data yet. The first 14 days are <b>baseline gathering</b>: log what you do; the system computes totals,
        averages, streaks and forecasts itself.
      </p>
      <Panel title="Start in under 2 minutes a day">
        <ol className="list-decimal space-y-2 pl-5 text-sm">
          <li>
            <Link className="link" href="/goals">Define 1–3 goals</Link> (e.g. German study hours, Law question volume, phone ≤ 60 min).
          </li>
          <li>
            <Link className="link" href="/log">Start a timer or log a session</Link> — domain, activity, focus rating.
          </li>
          <li>
            <Link className="link" href="/log#phone">Log phone time</Link> once a day (or import a Screen Time CSV in <Link className="link" href="/data">Data</Link>).
          </li>
          <li>Evening review: 4 questions, 30–60 seconds.</li>
        </ol>
      </Panel>
      <Panel title="Explore with fictional data">
        <p className="text-2 text-sm">Load a deterministic fictional persona (clearly labelled) to see every screen with multi-year history. Wipe it before real use.</p>
        <Link href="/data#demo" className="btn mt-3">
          Load fictional demo data
        </Link>
      </Panel>
    </div>
  );
}
