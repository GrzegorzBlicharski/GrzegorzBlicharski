import Link from "next/link";
import { getAnalysis } from "@/server/context";
import { todayView, type TodayPriority } from "@/coach/today";
import { Badge, Empty, Ring, Progress, ConfidenceBadge, type Tone } from "@/components/ui";
import { fmtMin, fmtPct, fmtNum } from "@/components/format";
import { METRIC_MAP } from "@/metrics/series";
import { hourOf, nowLocal } from "@/core/dates";

export const dynamic = "force-dynamic";

const paceTone = (s: string): Tone => (s === "BEHIND" ? "risk" : s === "AHEAD" || s === "ACHIEVED" || s === "ON TRACK" ? "good" : "neutral");
const DOMAIN_START: Record<string, string> = { GERMAN: "/log?domain=GERMAN&activity=speaking", LAW: "/log?domain=LAW&activity=questions", "DEEP WORK": "/log", DIGITAL: "/log?tab=phone" };

function greeting(): string {
  const h = hourOf(nowLocal());
  return h < 5 ? "Late night" : h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

function PriorityRow({ p }: { p: TodayPriority }) {
  return (
    <li className="flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-[var(--panel-2)]">
      <span className="num flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>
        {p.rank}
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[15px] font-semibold">{p.label}</div>
        <div className="muted truncate text-[12.5px]">
          {p.minutes ? `${fmtMin(p.minutes)} · ` : ""}
          {p.reason}
        </div>
      </div>
      <Link href={DOMAIN_START[p.domain] ?? "/log"} className="btn btn-sm shrink-0">
        Start
      </Link>
    </li>
  );
}

function GlanceRing({ label, value, max, sub, tone, href }: { label: string; value: number; max: number; sub: string; tone: Tone; href: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-[var(--panel-2)]">
      <Ring value={value} max={max} tone={tone} size={58}>
        <span className="num text-[11px] font-semibold">{max > 0 ? `${Math.min(999, Math.round((value / max) * 100))}%` : "—"}</span>
      </Ring>
      <div className="min-w-0">
        <div className="text-2 text-[13px] font-medium">{label}</div>
        <div className="num text-[19px] font-semibold leading-tight">{fmtMin(value)}</div>
        <div className="muted truncate text-[12px]">{sub}</div>
      </div>
    </Link>
  );
}

export default function TodayPage() {
  const { ds, insights } = getAnalysis();
  if (!ds.firstDay) return <Onboarding />;
  const v = todayView(ds, insights);
  const t = ds.settings.targets;
  const ladder = (val: number, floor: number, target: number): Tone => (val >= target ? "good" : val >= floor ? "accent" : "neutral");
  const phoneTone: Tone = !v.phone.hasData ? "neutral" : v.phone.total > v.phone.limit ? "risk" : v.phone.total > v.phone.limit * 0.75 ? "warn" : "good";
  const execTone: Tone = v.execution.pct == null ? "neutral" : v.execution.pct >= t.executionPct ? "good" : v.execution.pct >= 60 ? "warn" : "risk";
  const mia = v.mostImportantAction;
  const miaHref = mia?.todayAction ? (DOMAIN_START[mia.todayAction.domain] ?? "/log") : "/log";
  const dateLabel = new Date(v.day + "T12:00:00").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="muted text-[13px] font-medium">{dateLabel}</div>
          <h1 className="text-[28px] font-bold leading-tight">{greeting()}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/log" className="btn btn-primary">
            Start session
          </Link>
          <Link href="/log?tab=phone" className="btn">
            Log phone
          </Link>
          <Link href="/log?tab=review" className="btn">
            Evening review
          </Link>
        </div>
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

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        <section className="panel p-6 xl:col-span-3">
          <div className="eyebrow">Do this next</div>
          {mia ? (
            <>
              <p className="mt-2 text-[22px] font-semibold leading-snug">{mia.action}</p>
              <p className="text-2 mt-2 text-[14px] leading-relaxed">{mia.facts[0]}</p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Link href={miaHref} className="btn btn-primary">
                  Start now
                </Link>
                <Link href="/coach" className="btn btn-ghost">
                  Why this? →
                </Link>
                <span className="ml-auto">
                  <ConfidenceBadge c={mia.confidence} n={mia.evidence.n} />
                </span>
              </div>
            </>
          ) : (
            <p className="text-2 mt-2">Nothing urgent detected. Follow your plan.</p>
          )}
          <div className="mt-6 border-t pt-4" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-center justify-between">
              <div className="eyebrow">Top priorities today</div>
              <Link href="/plan" className="link text-[13px]">
                Full plan →
              </Link>
            </div>
            {v.priorities.length ? (
              <ol className="-mx-3 mt-2">
                {v.priorities.map((p) => (
                  <PriorityRow key={p.rank} p={p} />
                ))}
              </ol>
            ) : (
              <div className="mt-3">
                <Empty>Define goals to let the system rank today&apos;s actions.</Empty>
              </div>
            )}
          </div>
        </section>

        <section className="panel p-5 xl:col-span-2">
          <div className="eyebrow mb-2">Today at a glance</div>
          <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
            <GlanceRing label="German" value={v.german.value} max={v.german.target} sub={`target ${fmtMin(v.german.target)}`} tone={ladder(v.german.value, v.german.floor, v.german.target)} href="/german" />
            <GlanceRing label="Law" value={v.law.value} max={v.law.target} sub={`${v.law.questions}/${v.law.qTarget} questions`} tone={ladder(v.law.value, t.lawMin.floor, v.law.target)} href="/law" />
            <GlanceRing label="Deep work" value={v.deep.value} max={v.deep.target} sub={`target ${fmtMin(v.deep.target)}`} tone={ladder(v.deep.value, t.deepMin.floor, v.deep.target)} href="/attention" />
            <Link href="/digital" className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-[var(--panel-2)]">
              <Ring value={v.phone.total} max={v.phone.limit} tone={phoneTone} size={58}>
                <span className="num text-[11px] font-semibold">{v.phone.hasData ? Math.round(v.phone.total) : "—"}</span>
              </Ring>
              <div className="min-w-0">
                <div className="text-2 text-[13px] font-medium">Phone</div>
                <div className="num text-[19px] font-semibold leading-tight">
                  {v.phone.hasData ? Math.round(v.phone.total) : "—"}
                  <span className="muted text-[14px]"> / {v.phone.limit} min</span>
                </div>
                <div className="truncate text-[12px]" style={{ color: phoneTone === "risk" ? "var(--risk-ink)" : "var(--muted)" }}>
                  {v.phone.hasData ? (v.phone.overBy > 0 ? `${Math.round(v.phone.overBy)} min over budget` : `${Math.round(v.phone.remaining)} min left`) : "not logged yet"}
                </div>
              </div>
            </Link>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 border-t pt-4" style={{ borderColor: "var(--border)" }}>
            <Link href="/execution" className="rounded-xl p-2 hover:bg-[var(--panel-2)]">
              <div className="text-2 text-[13px] font-medium">Plan execution</div>
              <div className="num mt-0.5 text-[19px] font-semibold" style={{ color: execTone === "risk" ? "var(--risk-ink)" : undefined }}>
                {fmtPct(v.execution.pct)}
              </div>
              <div className="mt-1.5">
                <Progress value={v.execution.pct ?? 0} max={100} tone={execTone === "neutral" ? "accent" : execTone} />
              </div>
              <div className="muted mt-1 text-[12px]">{v.execution.plannedDays ? `${fmtMin(v.execution.actual)} of ${fmtMin(v.execution.planned)}` : "no plan today"}</div>
            </Link>
            <Link href="/goals" className="rounded-xl p-2 hover:bg-[var(--panel-2)]">
              <div className="text-2 text-[13px] font-medium">Goal pace</div>
              <div className="mt-1.5">
                <Badge tone={paceTone(v.goalPace.status)}>{v.goalPace.status}</Badge>
              </div>
              <div className="muted mt-1.5 line-clamp-2 text-[12px]">{v.goalPace.detail}</div>
            </Link>
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <section className="panel p-5">
          <div className="eyebrow">Current bottleneck</div>
          {v.bottleneck ? (
            <>
              <div className="mt-2 text-[15px] font-semibold leading-snug">{v.bottleneck.title}</div>
              <p className="text-2 mt-1 line-clamp-3 text-[13px]">{v.bottleneck.facts[0]}</p>
            </>
          ) : (
            <p className="muted mt-2 text-[13px]">None detected.</p>
          )}
        </section>
        <section className="panel p-5">
          <div className="eyebrow">Top weakness</div>
          {v.topWeakness ? (
            <>
              <div className="mt-2 text-[15px] font-semibold leading-snug">{v.topWeakness.title}</div>
              <p className="text-2 mt-1 line-clamp-3 text-[13px]">{v.topWeakness.facts[0]}</p>
            </>
          ) : (
            <p className="muted mt-2 text-[13px]">None detected.</p>
          )}
        </section>
        <section className="panel p-5">
          <div className="eyebrow">Momentum · 7 days vs previous 28</div>
          <ul className="mt-2 space-y-2.5">
            {v.momentum.map((m) => {
              const met = METRIC_MAP.get(m.key)!;
              const tone: Tone = m.direction === "up" ? "good" : m.direction === "down" ? "risk" : "neutral";
              const fmt = (x: number | null) => (met.unit === "pct" ? fmtPct(x) : met.unit === "min" ? fmtMin(x) : fmtNum(x, 0));
              return (
                <li key={m.key} className="flex items-center justify-between gap-2">
                  <span className="text-[14px] font-medium">{m.label}</span>
                  <span className="flex items-center gap-2">
                    <span className="num muted text-[12px]">
                      {fmt(m.prev28)} → {fmt(m.last7)}
                    </span>
                    <Badge tone={tone}>{m.direction === "up" ? "rising" : m.direction === "down" ? "falling" : m.direction === "flat" ? "steady" : "n/a"}</Badge>
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
        <section className="panel p-5">
          <div className="flex items-center justify-between">
            <div className="eyebrow">Sustainability</div>
            <Badge tone={v.sustainability.warning ? "risk" : "good"}>{v.sustainability.warning ? "Warning" : "OK"}</Badge>
          </div>
          <p className="text-2 mt-2 text-[13px] leading-relaxed">{v.sustainability.text}</p>
          <div className="muted mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t pt-3 text-[12.5px]" style={{ borderColor: "var(--border)" }}>
            <span>
              Consistency 30D <b className="num text-2">{fmtPct(v.streak.consistency30)}</b>
            </span>
            <span>
              Streak <b className="num text-2">{v.streak.current}d</b>
            </span>
            <Link href="/law#due" className="hover:underline">
              Reviews due <b className="num text-2">{v.reviewDue}</b>
            </Link>
          </div>
        </section>
      </div>

      <p className="muted text-center text-[12px]">
        {v.maturity.stage} · {v.maturity.daysTracked} days of data · every number links to how it is calculated
      </p>
    </div>
  );
}

function Onboarding() {
  return (
    <div className="mx-auto max-w-2xl space-y-5 py-8">
      <div>
        <div className="eyebrow">Welcome</div>
        <h1 className="mt-1 text-[30px] font-bold leading-tight">Measure what moves you forward.</h1>
        <p className="text-2 mt-2 text-[15px] leading-relaxed">
          APEX OS turns a minute or two of logging a day into a clear picture of your German, Law, focus and phone habits — and tells you what to do next. The first 14 days build your baseline.
        </p>
      </div>
      <section className="panel p-6">
        <h2 className="text-[16px] font-semibold">Get started</h2>
        <ol className="mt-3 space-y-3 text-[14px]">
          {[
            ["Set 1–3 goals", "/goals", "e.g. German study hours, Law question volume, phone ≤ 60 min"],
            ["Start your first session", "/log", "pick a domain and activity, press start"],
            ["Log today's phone time", "/log?tab=phone", "minutes per category from Screen Time"],
            ["Do the evening review", "/log?tab=review", "four quick questions, under a minute"],
          ].map(([title, href, sub], i) => (
            <li key={href} className="flex items-start gap-3">
              <span className="num flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>
                {i + 1}
              </span>
              <div>
                <Link className="link" href={href}>
                  {title}
                </Link>
                <div className="muted text-[13px]">{sub}</div>
              </div>
            </li>
          ))}
        </ol>
      </section>
      <section className="panel p-6">
        <h2 className="text-[16px] font-semibold">Just exploring?</h2>
        <p className="text-2 mt-1 text-[14px]">Load a clearly labelled fictional history to see every screen with real-looking data. Remove it before you start for real.</p>
        <Link href="/data#demo" className="btn mt-4">
          Load demo data
        </Link>
      </section>
    </div>
  );
}
