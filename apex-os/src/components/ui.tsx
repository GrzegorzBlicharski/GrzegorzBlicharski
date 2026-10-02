import Link from "next/link";
import type { ReactNode } from "react";
import type { Confidence } from "@/core/stats";
import type { Insight } from "@/coach/insights";

export function PageHeader({ title, subtitle, children }: { title: string; subtitle?: string; children?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-[26px] font-bold leading-tight">{title}</h1>
        {subtitle && <p className="text-2 mt-1 max-w-3xl text-[14px]">{subtitle}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}

export function Panel({ title, sub, right, children, className = "", id }: { title?: string; sub?: string; right?: ReactNode; children: ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={`panel min-w-0 scroll-mt-20 p-5 ${className}`}>
      {(title || right) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            {title && <h2 className="text-[15px] font-semibold">{title}</h2>}
            {sub && <p className="muted mt-0.5 text-[12.5px] leading-snug">{sub}</p>}
          </div>
          {right && <div className="shrink-0">{right}</div>}
        </div>
      )}
      <div className="min-w-0 overflow-x-auto">{children}</div>
    </section>
  );
}

export type Tone = "good" | "warn" | "risk" | "neutral" | "accent";
const TONE_COLOR: Record<Tone, string> = { good: "var(--good)", warn: "var(--warn)", risk: "var(--risk)", neutral: "var(--muted)", accent: "var(--accent)" };
const TONE_INK: Record<Tone, string> = { good: "var(--good-ink)", warn: "var(--warn-ink)", risk: "var(--risk-ink)", neutral: "var(--text-2)", accent: "var(--accent)" };
const TONE_SOFT: Record<Tone, string> = { good: "var(--good-soft)", warn: "var(--warn-soft)", risk: "var(--risk-soft)", neutral: "var(--panel-2)", accent: "var(--accent-soft)" };
const TONE_ICON: Record<Tone, string> = { good: "▲", warn: "●", risk: "■", neutral: "", accent: "◆" };

/** Soft status pill: tint + icon + label (never color alone). */
export function Badge({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span className="inline-flex max-w-full items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[12px] font-semibold leading-snug" style={{ color: TONE_INK[tone], background: TONE_SOFT[tone] }}>
      {TONE_ICON[tone] && (
        <span aria-hidden style={{ color: TONE_COLOR[tone], fontSize: 8 }}>
          {TONE_ICON[tone]}
        </span>
      )}
      {children}
    </span>
  );
}

export function ConfidenceBadge({ c, n }: { c: Confidence; n?: number }) {
  const bars = c === "HIGH" ? 3 : c === "MEDIUM" ? 2 : 1;
  return (
    <span className="muted inline-flex items-center gap-1.5 text-[12px]" title={`Confidence ${c}${n != null ? ` · n=${n}` : ""} — how solid the evidence is, not a rating of you`}>
      <span aria-hidden className="inline-flex items-end gap-[2px]">
        {[1, 2, 3].map((b) => (
          <span key={b} className="w-[3px] rounded-sm" style={{ height: 4 + b * 3, background: b <= bars ? "var(--text-2)" : "var(--panel-3)" }} />
        ))}
      </span>
      {c.toLowerCase()}
      {n != null ? ` · n=${n.toLocaleString("en-US")}` : ""}
    </span>
  );
}

export function TypeTag({ type }: { type: string }) {
  return <span className="muted rounded-md px-1.5 py-px text-[10.5px] font-semibold tracking-wide" style={{ background: "var(--panel-2)" }}>{type.replace("_", "-").toLowerCase()}</span>;
}

/** KPI tile: big figure, context line, status dot, drill-down and "how calculated". */
export function Kpi({ label, value, sub, tone, href, metricKey, children }: { label: string; value: ReactNode; sub?: ReactNode; tone?: Tone; href?: string; metricKey?: string; children?: ReactNode }) {
  const body = (
    <div className="panel flex h-full flex-col p-4 transition-colors hover:border-[var(--border-strong)]">
      <div className="flex items-center justify-between gap-2">
        <span className="text-2 text-[13px] font-medium">{label}</span>
        {tone && tone !== "neutral" && <span aria-hidden className="h-2 w-2 rounded-full" style={{ background: TONE_COLOR[tone], boxShadow: `0 0 0 4px ${TONE_SOFT[tone]}` }} />}
      </div>
      <div className="num mt-2 text-[28px] font-semibold leading-none">{value}</div>
      {sub && <div className="muted mt-2 text-[12.5px] leading-snug">{sub}</div>}
      {children && <div className="mt-auto pt-3">{children}</div>}
    </div>
  );
  return (
    <div className="group relative min-w-0">
      {href ? (
        <Link href={href} className="block h-full">
          {body}
        </Link>
      ) : (
        body
      )}
      {metricKey && (
        <Link href={`/metrics#${metricKey}`} className="muted absolute right-3 top-3 hidden text-[11px] hover:underline group-hover:inline" title="How is this calculated?">
          ⓘ
        </Link>
      )}
    </div>
  );
}

export function Progress({ value, max, tone = "accent", marker }: { value: number; max: number; tone?: Tone; marker?: number }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="bar-track relative" role="progressbar" aria-valuenow={Math.round(value)} aria-valuemax={max}>
      <div style={{ width: `${pct}%`, background: TONE_COLOR[tone], height: "100%", borderRadius: 999, transition: "width .4s" }} />
      {marker != null && max > 0 && <div className="absolute top-0 h-full w-[2px]" style={{ left: `${Math.min(99.5, (marker / max) * 100)}%`, background: "var(--text)", opacity: 0.55 }} title="target" />}
    </div>
  );
}

/** Circular progress for headline targets. */
export function Ring({ value, max, size = 64, tone = "accent", children }: { value: number; max: number; size?: number; tone?: Tone; children?: ReactNode }) {
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  const pct = max > 0 ? Math.min(1, value / max) : 0;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--panel-3)" strokeWidth={6} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={TONE_COLOR[tone]} strokeWidth={6} strokeLinecap="round" strokeDasharray={`${c * pct} ${c}`} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="muted rounded-xl border border-dashed px-4 py-6 text-center text-[13.5px]" style={{ borderColor: "var(--border-strong)" }}>{children}</div>;
}

export function Delta({ value, better, children }: { value?: number | null; better: boolean | null; children: ReactNode }) {
  const tone: Tone = better == null ? "neutral" : better ? "good" : "risk";
  return (
    <span className="num whitespace-nowrap text-[12.5px] font-semibold" style={{ color: TONE_INK[tone] }}>
      {better != null && (value ?? 0) !== 0 ? (better ? "▲ " : "▼ ") : ""}
      {children}
    </span>
  );
}

const KIND_TONE: Record<string, Tone> = { weakness: "warn", bottleneck: "risk", warning: "risk", opportunity: "accent", strength: "good", pattern: "neutral", lowValue: "neutral" };
const KIND_LABEL: Record<string, string> = { weakness: "Weakness", bottleneck: "Bottleneck", warning: "Warning", opportunity: "Opportunity", strength: "Strength", pattern: "Pattern", lowValue: "Review value" };

/** Insight: headline + one fact + highlighted action; full evidence on demand. */
export function InsightCard({ i, compact = false, actions }: { i: Insight; compact?: boolean; actions?: ReactNode }) {
  return (
    <article className="rounded-xl border p-4" style={{ borderColor: "var(--border)", background: "var(--panel)" }}>
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={KIND_TONE[i.kind] ?? "neutral"}>{KIND_LABEL[i.kind] ?? i.kind}</Badge>
        <span className="ml-auto flex items-center gap-3">
          <ConfidenceBadge c={i.confidence} n={i.evidence.n} />
          <span className="num rounded-md px-1.5 py-0.5 text-[11.5px] font-semibold" style={{ background: "var(--panel-2)" }} title="Priority score — formula on the Coach page">
            P{i.priority}
          </span>
        </span>
      </div>
      <h3 className="mt-2 text-[15.5px] font-semibold leading-snug">{i.title}</h3>
      <p className="text-2 mt-1 text-[13.5px] leading-relaxed">{i.facts[0]}</p>
      <div className="mt-3 flex gap-2 rounded-lg px-3 py-2.5 text-[13.5px] font-medium leading-snug" style={{ background: "var(--accent-soft)" }}>
        <span aria-hidden style={{ color: "var(--accent)" }}>→</span>
        <span>{i.action}</span>
      </div>
      {!compact && (i.facts.length > 1 || i.interpretation) && (
        <details className="mt-2 text-[13px]">
          <summary className="muted py-1 hover:underline">Evidence & scoring</summary>
          <div className="text-2 mt-1 space-y-1.5">
            {i.facts.slice(1).map((f, k) => (
              <p key={k}>• {f}</p>
            ))}
            <p className="italic">{i.interpretation}</p>
            <p className="muted text-[12px]">
              Impact {i.impact}/5 · urgency {i.urgency}/5 · effort {i.effort}/5 · goal alignment {i.goalRelevance.toFixed(2)} · severity {i.severity}/5{i.trend ? ` · trend ${i.trend.toLowerCase()}` : ""} · window {i.evidence.window}
            </p>
          </div>
        </details>
      )}
      {actions && <div className="mt-3 flex flex-wrap gap-2">{actions}</div>}
    </article>
  );
}

export function Grid({ children, cols = "md:grid-cols-2 xl:grid-cols-3" }: { children: ReactNode; cols?: string }) {
  return <div className={`grid grid-cols-1 gap-4 ${cols}`}>{children}</div>;
}

export function Field({ label, children, className = "", group = false }: { label: string; children: ReactNode; className?: string; group?: boolean }) {
  if (group)
    return (
      <div role="group" aria-label={label} className={`block min-w-0 ${className}`}>
        <span className="label mb-1.5 block">{label}</span>
        {children}
      </div>
    );
  return (
    <label className={`block min-w-0 ${className}`}>
      <span className="label mb-1.5 block">{label}</span>
      {children}
    </label>
  );
}

export function trendTone(cls: string | null | undefined): Tone {
  return cls === "IMPROVING" ? "good" : cls === "DECLINING" ? "risk" : cls === "VOLATILE" ? "warn" : "neutral";
}

/** Group of selectable chips backed by radio inputs — large touch targets, works with plain FormData. */
export function ChipGroup({ name, options, defaultValue }: { name: string; options: { value: string; label: string }[]; defaultValue?: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <label key={o.value}>
          <input type="radio" name={name} value={o.value} defaultChecked={o.value === defaultValue} className="peer sr-only" />
          <span className="chip">{o.label}</span>
        </label>
      ))}
    </div>
  );
}
