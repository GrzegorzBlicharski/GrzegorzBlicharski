"use client";
/** Global search / command palette — Cmd/Ctrl + K. */
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { NAV } from "./Nav";

interface Hit {
  kind: string;
  title: string;
  sub?: string;
  href: string;
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [sel, setSel] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 10);
  }, [open]);

  useEffect(() => {
    const nav: Hit[] = NAV.flatMap((g) => g.items.map((i) => ({ kind: "Go to", title: i.label, href: i.href })));
    const ql = q.toLowerCase().trim();
    const navHits = ql ? nav.filter((h) => h.title.toLowerCase().includes(ql)) : nav.slice(0, 8);
    if (ql.length < 2) {
      setHits(navHits);
      setSel(0);
      return;
    }
    const ctrl = new AbortController();
    fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((data: Hit[]) => {
        setHits([...navHits, ...data]);
        setSel(0);
      })
      .catch(() => {});
    return () => ctrl.abort();
  }, [q]);

  const go = (h: Hit | undefined) => {
    if (!h) return;
    setOpen(false);
    setQ("");
    router.push(h.href);
  };

  return (
    <>
      <button className="btn btn-sm" onClick={() => setOpen(true)} aria-label="Search">
        <span className="muted">Search</span>
        <kbd className="muted hidden text-[10px] sm:inline">⌘K</kbd>
      </button>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center p-4 pt-[12vh]" role="dialog" aria-modal>
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="panel relative w-full max-w-xl overflow-hidden shadow-2xl">
            <input
              ref={inputRef}
              className="w-full border-b bg-transparent px-4 py-3 text-base outline-none"
              style={{ borderColor: "var(--border)" }}
              placeholder="Search sessions, tests, notes, goals, milestones, pages…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setSel((s) => Math.min(hits.length - 1, s + 1));
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setSel((s) => Math.max(0, s - 1));
                } else if (e.key === "Enter") go(hits[sel]);
              }}
            />
            <ul className="max-h-[50vh] overflow-y-auto py-1">
              {hits.map((h, i) => (
                <li key={`${h.href}-${i}`}>
                  <button className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm" style={i === sel ? { background: "var(--panel-2)" } : undefined} onMouseEnter={() => setSel(i)} onClick={() => go(h)}>
                    <span className="label w-20 shrink-0">{h.kind}</span>
                    <span className="truncate">{h.title}</span>
                    {h.sub && <span className="muted ml-auto truncate text-xs">{h.sub}</span>}
                  </button>
                </li>
              ))}
              {!hits.length && <li className="muted px-4 py-3 text-sm">No results</li>}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
