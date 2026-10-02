"use client";
import { useState, type ReactNode } from "react";

/** Segmented tabs; panels stay mounted (form drafts survive switching). */
export function Tabs({ tabs, initial, children }: { tabs: { id: string; label: string }[]; initial?: string; children: ReactNode[] }) {
  const [active, setActive] = useState(initial && tabs.some((t) => t.id === initial) ? initial : tabs[0].id);
  return (
    <div>
      <div role="tablist" className="-mx-1 mb-4 flex gap-1 overflow-x-auto px-1 pb-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={active === t.id}
            onClick={() => setActive(t.id)}
            className="shrink-0 rounded-full px-4 py-2 text-[14px] font-semibold transition-colors"
            style={active === t.id ? { background: "var(--text)", color: "var(--bg)" } : { background: "var(--panel-2)", color: "var(--text-2)" }}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tabs.map((t, i) => (
        <div key={t.id} role="tabpanel" hidden={active !== t.id}>
          {children[i]}
        </div>
      ))}
    </div>
  );
}
