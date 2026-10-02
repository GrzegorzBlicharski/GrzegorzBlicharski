"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export const NAV: { group: string; items: { href: string; label: string }[] }[] = [
  { group: "Operate", items: [{ href: "/", label: "Today" }, { href: "/log", label: "Quick log" }, { href: "/plan", label: "Plan" }, { href: "/sessions", label: "Sessions" }] },
  {
    group: "Domains",
    items: [
      { href: "/german", label: "German" },
      { href: "/law", label: "Law" },
      { href: "/digital", label: "Digital hygiene" },
      { href: "/attention", label: "Attention & deep work" },
      { href: "/execution", label: "Execution" },
      { href: "/recovery", label: "Sustainability" },
      { href: "/career", label: "Career" },
    ],
  },
  {
    group: "Intelligence",
    items: [
      { href: "/coach", label: "Coach" },
      { href: "/goals", label: "Goals & forecasts" },
      { href: "/analyze", label: "Analyze & compare" },
      { href: "/experiments", label: "Experiments" },
      { href: "/reports", label: "Reports" },
      { href: "/timeline", label: "Timeline & records" },
    ],
  },
  { group: "System", items: [{ href: "/metrics", label: "Metrics registry" }, { href: "/data", label: "Data & backup" }, { href: "/settings", label: "Settings" }] },
];

export function Nav() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const links = (
    <nav className="space-y-4 text-sm">
      {NAV.map((g) => (
        <div key={g.group}>
          <div className="label mb-1 px-2">{g.group}</div>
          {g.items.map((i) => {
            const active = i.href === "/" ? path === "/" : path.startsWith(i.href);
            return (
              <Link
                key={i.href}
                href={i.href}
                onClick={() => setOpen(false)}
                className="block rounded px-2 py-1.5"
                style={active ? { background: "var(--panel-2)", color: "var(--text)", fontWeight: 600, boxShadow: "inset 2px 0 0 var(--accent)" } : { color: "var(--text-2)" }}
              >
                {i.label}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-56 shrink-0 overflow-y-auto border-r p-3 lg:block" style={{ borderColor: "var(--border)" }}>
        <Link href="/" className="mb-4 block px-2">
          <div className="text-sm font-bold tracking-[0.2em]">APEX OS</div>
          <div className="muted text-[10px]">Personal performance intelligence</div>
        </Link>
        {links}
      </aside>
      <button className="btn btn-sm fixed left-3 top-2 z-40 lg:hidden" onClick={() => setOpen(true)} aria-label="Open navigation">
        ☰
      </button>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal>
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-64 overflow-y-auto p-4" style={{ background: "var(--panel)" }}>
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-bold tracking-[0.2em]">APEX OS</span>
              <button className="btn btn-sm" onClick={() => setOpen(false)}>
                ✕
              </button>
            </div>
            {links}
          </div>
        </div>
      )}
    </>
  );
}

export function MobileTabs() {
  const path = usePathname();
  const tabs = [
    { href: "/", label: "Today" },
    { href: "/log", label: "Log" },
    { href: "/plan", label: "Plan" },
    { href: "/coach", label: "Coach" },
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 grid grid-cols-4 border-t lg:hidden" style={{ background: "var(--panel)", borderColor: "var(--border)" }}>
      {tabs.map((t) => {
        const active = t.href === "/" ? path === "/" : path.startsWith(t.href);
        return (
          <Link key={t.href} href={t.href} className="py-3 text-center text-xs font-semibold" style={{ color: active ? "var(--accent)" : "var(--text-2)" }}>
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
