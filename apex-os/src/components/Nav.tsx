"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  PenLine,
  CalendarRange,
  History,
  Languages,
  Scale,
  Smartphone,
  Crosshair,
  CheckCircle2,
  HeartPulse,
  Briefcase,
  Sparkles,
  Target,
  LineChart,
  FlaskConical,
  FileText,
  Milestone,
  Sigma,
  Database,
  Settings,
  Menu,
  X,
  type LucideIcon,
} from "lucide-react";

export const NAV: { group: string; items: { href: string; label: string; icon: LucideIcon }[] }[] = [
  {
    group: "Daily",
    items: [
      { href: "/", label: "Today", icon: LayoutDashboard },
      { href: "/log", label: "Quick log", icon: PenLine },
      { href: "/plan", label: "Plan", icon: CalendarRange },
      { href: "/sessions", label: "Sessions", icon: History },
    ],
  },
  {
    group: "Domains",
    items: [
      { href: "/german", label: "German", icon: Languages },
      { href: "/law", label: "Law", icon: Scale },
      { href: "/digital", label: "Phone hygiene", icon: Smartphone },
      { href: "/attention", label: "Deep work", icon: Crosshair },
      { href: "/execution", label: "Execution", icon: CheckCircle2 },
      { href: "/recovery", label: "Sustainability", icon: HeartPulse },
      { href: "/career", label: "Career", icon: Briefcase },
    ],
  },
  {
    group: "Insight",
    items: [
      { href: "/coach", label: "Coach", icon: Sparkles },
      { href: "/goals", label: "Goals & forecasts", icon: Target },
      { href: "/analyze", label: "Analyze", icon: LineChart },
      { href: "/experiments", label: "Experiments", icon: FlaskConical },
      { href: "/reports", label: "Reports", icon: FileText },
      { href: "/timeline", label: "Timeline", icon: Milestone },
    ],
  },
  {
    group: "System",
    items: [
      { href: "/metrics", label: "How it's calculated", icon: Sigma },
      { href: "/data", label: "Data & backup", icon: Database },
      { href: "/settings", label: "Settings", icon: Settings },
    ],
  },
];

function NavLinks({ path, onNavigate }: { path: string; onNavigate?: () => void }) {
  return (
    <nav className="space-y-5 text-[14px]">
      {NAV.map((g) => (
        <div key={g.group}>
          <div className="eyebrow mb-1.5 px-3">{g.group}</div>
          <div className="space-y-0.5">
            {g.items.map((i) => {
              const active = i.href === "/" ? path === "/" : path.startsWith(i.href);
              const Icon = i.icon;
              return (
                <Link
                  key={i.href}
                  href={i.href}
                  onClick={onNavigate}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 transition-colors"
                  style={active ? { background: "var(--accent-soft)", color: "var(--text)", fontWeight: 600 } : { color: "var(--text-2)" }}
                >
                  <Icon size={17} strokeWidth={active ? 2.2 : 1.8} style={{ color: active ? "var(--accent)" : "var(--muted)" }} aria-hidden />
                  {i.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-2.5 px-3">
      <span aria-hidden className="flex h-8 w-8 items-center justify-center rounded-lg text-[13px] font-bold" style={{ background: "var(--accent)", color: "var(--accent-ink)" }}>
        A
      </span>
      <span>
        <span className="block text-[14px] font-bold tracking-[0.14em]">APEX OS</span>
        <span className="muted block text-[11px] leading-tight">Performance intelligence</span>
      </span>
    </Link>
  );
}

export function Nav() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 overflow-y-auto border-r px-3 py-5 lg:block" style={{ borderColor: "var(--border)", background: "color-mix(in srgb, var(--panel) 55%, transparent)" }}>
        <Brand />
        <div className="mt-6">
          <NavLinks path={path} />
        </div>
      </aside>
      <button className="btn btn-sm btn-ghost fixed left-2 z-40 lg:hidden" style={{ top: "calc(env(safe-area-inset-top, 0px) + 8px)" }} onClick={() => setOpen(true)} aria-label="Open navigation">
        <Menu size={20} />
      </button>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 overflow-y-auto px-3 py-5 shadow-2xl" style={{ background: "var(--panel)" }}>
            <div className="mb-6 flex items-center justify-between">
              <Brand />
              <button className="btn btn-sm btn-ghost" onClick={() => setOpen(false)} aria-label="Close navigation">
                <X size={18} />
              </button>
            </div>
            <NavLinks path={path} onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}

export function MobileTabs() {
  const path = usePathname();
  const tabs = [
    { href: "/", label: "Today", icon: LayoutDashboard },
    { href: "/log", label: "Log", icon: PenLine },
    { href: "/plan", label: "Plan", icon: CalendarRange },
    { href: "/coach", label: "Coach", icon: Sparkles },
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 grid grid-cols-4 border-t backdrop-blur lg:hidden" style={{ background: "color-mix(in srgb, var(--panel) 92%, transparent)", borderColor: "var(--border)", paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
      {tabs.map((t) => {
        const active = t.href === "/" ? path === "/" : path.startsWith(t.href);
        const Icon = t.icon;
        return (
          <Link key={t.href} href={t.href} className="flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-semibold" style={{ color: active ? "var(--accent)" : "var(--muted)" }}>
            <Icon size={20} strokeWidth={active ? 2.3 : 1.8} aria-hidden />
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
