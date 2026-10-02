import Link from "next/link";
import type { ReactNode } from "react";
import type { Confidence } from "@/core/stats";
import type { Insight } from "@/coach/insights";

export function PageHeader({ title, subtitle, children }: { title: string; subtitle?: string; children?: ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="text-2 mt-0.5 text-sm">{subtitle}</p>}
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}

export function Panel({ title, sub, right, children, className = "", id }: { title?: string; sub?: string; right?: ReactNode; children: ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={`panel min-w-0 p-4 ${className}`}>
      {(title || right) && (
        <div className="mb-3 flex items-start justify-between gap-2">
          <div>
            {title && <h2 className="label">{title}</h2>}
            {sub && <p className="muted mt-0.5 text-xs">{sub}</p>}
          </div>
          {right}
        </div>
      )}
      <div className="min-w-0 overflow-x-auto">{children}</div>
    </section>
  );
}

export type Tone = "good" | "warn" | "risk" | "neutral" | "accent";
const TONE_COLOR: Record<Tone, string> = { good: "var(--good)", warn: "var(--warn)", risk: "var(--risk)", neutral: "var(--muted)", accent: "var(--accent)" };
const TONE_INK: Record<Tone, string> = { good: "var(--good-ink)", warn: "var(--warn-ink)", risk: "var(--risk-ink)", neutral: "var(--text-2)", accent: "var(--accent)" };
const TONE_ICON: Record<Tone, string> = { good: "▲", warn: "●", risk: "■", neutral: "–", accent: "◆" };

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide" style={{ color: TONE_INK[tone], border: `1px solid ${TONE_COLOR[tone]}` }}>
      <span aria-hidden style={{ color: TONE_COLOR[tone], fontSize: 8 }}>
        {TONE_ICON[tone]}
      </span>
      {children}
    </span>
  );
}

export function ConfidenceBadge({ c, n }: { c: Confidence; n?: number }) {
  return (
    <span className="muted text-[11px] font-medium" title="Confidence of this finding (data volume / effect clarity) — not a rating of you">
      {c} conf.{n != null ? ` · n=${n}` : ""}
    </span>
  );
}

export function TypeTag({ type }: { type: string }) {
  return <span className="muted rounded border px-1 text-[10px] uppercase tracking-wide" style={{ borderColor: "var(--border)" }}>{type.replace("_", "-")}</span>;
}

/** KPI tile: value, context, tone, drill-down and "how calculated" link. */
export function Kpi({ label, value, sub, tone, href, metricKey, children }: { label: string; value: ReactNode; sub?: ReactNode; tone?: Tone; href?: string; metricKey?: string; children?: ReactNode }) {
  const body = (
    <div className="panel h-full p-3 transition-colors hover:border-[var(--axis)]">
      <div className="flex items-center justify-between gap-2">
        <span className="label">{label}</span>
        {tone && tone !== "neutral" && <span aria-hidden className="h-2 w-2 rounded-full" style={{ background: TONE_COLOR[tone] }} />}
      </div>
      <div className="mt-1 text-2xl font-semibold leading-tight">{value}</div>
      {sub && <div className="text-2 mt-0.5 text-xs">{sub}</div>}
      {children}
    </div>
  );
  return (
    <div className="relative">
      {href ? (
        <Link href={href} className="block h-full">
          {body}
        </Link>
      ) : (
        body
      )}
      {metricKey && (
        <Link href={`/metrics#${metricKey}`} className="muted absolute bottom-2 right-2 text-[10px] hover:underline" title="How is this calculated?">
          how?
        </Link>
      )}
    </div>
  );
}

export function Progress({ value, max, tone = "accent", marker }: { value: number; max: number; tone?: Tone; marker?: number }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="bar-track relative mt-2" role="progressbar" aria-valuenow={Math.round(value)} aria-valuemax={max}>
      <div style={{ width: `${pct}%`, background: TONE_COLOR[tone], height: "100%", borderRadius: 4 }} />
      {marker != null && max > 0 && <div className="absolute top-[-2px] h-[10px] w-[2px]" style={{ left: `${Math.min(100, (marker / max) * 100)}%`, background: "var(--text-2)" }} />}
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="muted rounded border border-dashed p-4 text-center text-sm" style={{ borderColor: "var(--border)" }}>{children}</div>;
}

export function Delta({ value, better, children }: { value?: number | null; better: boolean | null; children: ReactNode }) {
  const tone: Tone = better == null ? "neutral" : better ? "good" : "risk";
  return (
    <span className="num text-xs font-semibold" style={{ color: TONE_INK[tone] }}>
      {better != null && (value ?? 0) !== 0 ? (better ? "▲ " : "▼ ") : ""}
      {children}
    </span>
  );
}

const KIND_TONE: Record<string, Tone> = { weakness: "warn", bottleneck: "risk", warning: "risk", opportunity: "accent", strength: "good", pattern: "neutral", lowValue: "neutral" };

export function InsightCard({ i, compact = false, actions }: { i: Insight; compact?: boolean; actions?: ReactNode }) {
  return (
    <div className="rounded-lg border p-3" style={{ borderColor: "var(--border)", background: "var(--panel)" }}>
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={KIND_TONE[i.kind] ?? "neutral"}>{i.kind}</Badge>
        <span className="font-semibold">{i.title}</span>
        <span className="ml-auto flex items-center gap-2">
          <ConfidenceBadge c={i.confidence} n={i.evidence.n} />
          <span className="num rounded px-1.5 text-xs font-semibold" style={{ background: "var(--panel-2)" }} title="Priority score (formula on the Coach page)">
            P{i.priority}
          </span>
        </span>
      </div>
      <dl className="mt-2 grid gap-1 text-sm">
        {i.facts.map((f, k) => (
          <div key={k} className="flex gap-2">
            <dt className="label w-28 shrink-0 pt-0.5">Fact</dt>
            <dd>{f}</dd>
          </div>
        ))}
        {!compact && (
          <div className="flex gap-2">
            <dt className="label w-28 shrink-0 pt-0.5">Interpretation</dt>
            <dd className="text-2">{i.interpretation}</dd>
          </div>
        )}
        <div className="flex gap-2">
          <dt className="label w-28 shrink-0 pt-0.5">Action</dt>
          <dd className="font-medium">{i.action}</dd>
        </div>
      </dl>
      {!compact && (
        <div className="muted mt-2 flex flex-wrap gap-3 text-[11px]">
          <span>Impact {i.impact}/5</span>
          <span>Urgency {i.urgency}/5</span>
          <span>Effort {i.effort}/5</span>
          <span>Goal alignment {i.goalRelevance.toFixed(2)}</span>
          <span>Severity {i.severity}/5</span>
          {i.trend && <span>Trend {i.trend}</span>}
          <span>Window {i.evidence.window}</span>
        </div>
      )}
      {actions && <div className="mt-2 flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Grid({ children, cols = "md:grid-cols-2 xl:grid-cols-3" }: { children: ReactNode; cols?: string }) {
  return <div className={`grid grid-cols-1 gap-3 ${cols}`}>{children}</div>;
}

export function Field({ label, children, className = "" }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="label mb-1 block">{label}</span>
      {children}
    </label>
  );
}

export function trendTone(cls: string | null | undefined): Tone {
  return cls === "IMPROVING" ? "good" : cls === "DECLINING" ? "risk" : cls === "VOLATILE" ? "warn" : "neutral";
}
