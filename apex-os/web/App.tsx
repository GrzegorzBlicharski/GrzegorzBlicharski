/** Browser shell: same pages and components as the server build, routed in memory. */
import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { Nav, MobileTabs } from "@/components/Nav";
import { CommandPalette } from "@/components/CommandPalette";
import { ThemeToggle } from "@/components/ThemeToggle";
import { TimerBadge } from "@/components/TimerBadge";
import { activeTimer } from "@/server/active";
import { getDb } from "./shims/db";
import { getRoute, snapshotKey, subscribe } from "./router";
import { getStatus, subscribeStatus } from "./persistence";

import Today from "@/app/page";
import LogPage from "@/app/log/page";
import PlanPage from "@/app/plan/page";
import SessionsPage from "@/app/sessions/page";
import GermanPage from "@/app/german/page";
import LawPage from "@/app/law/page";
import DigitalPage from "@/app/digital/page";
import AttentionPage from "@/app/attention/page";
import ExecutionPage from "@/app/execution/page";
import RecoveryPage from "@/app/recovery/page";
import CareerPage from "@/app/career/page";
import CoachPage from "@/app/coach/page";
import GoalsPage from "@/app/goals/page";
import AnalyzePage from "@/app/analyze/page";
import ExperimentsPage from "@/app/experiments/page";
import ReportsPage from "@/app/reports/page";
import TimelinePage from "@/app/timeline/page";
import MetricsPage from "@/app/metrics/page";
import DataPage from "@/app/data/page";
import SettingsPage from "@/app/settings/page";

type PageFn = (props: { searchParams: Promise<Record<string, string | undefined>> }) => ReactNode | Promise<ReactNode>;
const ROUTES: Record<string, PageFn> = {
  "/": Today as PageFn,
  "/log": LogPage as PageFn,
  "/plan": PlanPage as PageFn,
  "/sessions": SessionsPage as PageFn,
  "/german": GermanPage as PageFn,
  "/law": LawPage as PageFn,
  "/digital": DigitalPage as PageFn,
  "/attention": AttentionPage as PageFn,
  "/execution": ExecutionPage as PageFn,
  "/recovery": RecoveryPage as PageFn,
  "/career": CareerPage as PageFn,
  "/coach": CoachPage as PageFn,
  "/goals": GoalsPage as PageFn,
  "/analyze": AnalyzePage as PageFn,
  "/experiments": ExperimentsPage as PageFn,
  "/reports": ReportsPage as PageFn,
  "/timeline": TimelinePage as PageFn,
  "/metrics": MetricsPage as PageFn,
  "/data": DataPage as PageFn,
  "/settings": SettingsPage as PageFn,
};

function StorageBadge() {
  const s = useSyncExternalStore(subscribeStatus, getStatus);
  const label = s.mode === "account" ? (s.saving ? "Saving…" : "Saved to your account") : s.mode === "browser" ? "Saved in this browser only" : "Not saved";
  const tone = s.error ? "var(--risk)" : s.mode === "account" ? "var(--good)" : "var(--warn)";
  return (
    <span className="muted hidden items-center gap-1.5 text-[12px] md:inline-flex" title={s.error ?? (s.lastSaved ? `Last saved ${s.lastSaved}` : "")}>
      <span aria-hidden className="h-2 w-2 rounded-full" style={{ background: tone }} />
      {s.error ? "Save problem — see Data" : label}
    </span>
  );
}

export function App() {
  const key = useSyncExternalStore(subscribe, snapshotKey);
  const [page, setPage] = useState<ReactNode>(null);
  const [error, setError] = useState<string | null>(null);
  const route = getRoute();
  useEffect(() => {
    let alive = true;
    const fn = ROUTES[route.path] ?? ROUTES["/"];
    try {
      const out = fn({ searchParams: Promise.resolve(route.query) });
      Promise.resolve(out).then(
        (el) => {
          if (!alive) return;
          setError(null);
          setPage(el);
          if (route.hash) requestAnimationFrame(() => document.getElementById(route.hash)?.scrollIntoView({ block: "start" }));
        },
        (e) => alive && setError(String(e?.stack ?? e)),
      );
    } catch (e) {
      setError(String((e as Error)?.stack ?? e));
    }
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  const t = activeTimer();
  const demo = getDb().prepare("SELECT 1 AS x FROM imports WHERE source = 'fictional-demo' LIMIT 1").get();
  return (
    <div className="flex min-h-screen">
      <Nav />
      <div className="min-w-0 flex-1">
        <header className="sticky z-30 flex items-center gap-3 px-4 py-3 backdrop-blur-md lg:px-8" style={{ top: "env(safe-area-inset-top, 0px)", background: "color-mix(in srgb, var(--bg) 80%, transparent)" }}>
          <span className="pl-10 text-[13px] font-bold tracking-[0.14em] lg:hidden">APEX</span>
          {demo && (
            <a href="/data#demo" className="rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold" style={{ background: "var(--warn-soft)", color: "var(--warn-ink)" }}>
              Demo data
            </a>
          )}
          <StorageBadge />
          <div className="ml-auto flex items-center gap-2">
            {t && <TimerBadge start={t.start} pausedMinutes={t.pausedMinutes} pausedAt={t.pausedAt} label={`${t.domain} · ${t.activity}`} />}
            <CommandPalette />
            <ThemeToggle />
          </div>
        </header>
        <main className="mx-auto max-w-[1440px] px-4 pb-28 pt-2 lg:px-8 lg:pb-12">
          {error ? (
            <div className="panel p-4 text-sm">
              <div className="font-semibold" style={{ color: "var(--risk-ink)" }}>
                This screen failed to render.
              </div>
              <pre className="muted mt-2 overflow-x-auto text-xs">{error}</pre>
            </div>
          ) : (
            page
          )}
        </main>
      </div>
      <MobileTabs />
    </div>
  );
}
