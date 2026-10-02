"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

/** Live elapsed time of the running session (persisted server-side; survives navigation and reloads). */
export function TimerBadge({ start, pausedMinutes, pausedAt, label }: { start: string; pausedMinutes: number; pausedAt: string | null; label: string }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const toMs = (s: string) => new Date(s.length === 16 ? s + ":00" : s).getTime();
  const end = pausedAt ? toMs(pausedAt) : now ?? toMs(start);
  const sec = Math.max(0, Math.floor((end - toMs(start)) / 1000 - pausedMinutes * 60));
  const hh = Math.floor(sec / 3600);
  const mm = Math.floor((sec % 3600) / 60);
  const ss = sec % 60;
  return (
    <Link href="/log" className="btn btn-sm" style={{ borderColor: "var(--accent)" }} title="Running session">
      <span aria-hidden className="h-2 w-2 rounded-full" style={{ background: pausedAt ? "var(--warn)" : "var(--good)" }} />
      <span className="num">
        {hh}:{String(mm).padStart(2, "0")}:{String(ss).padStart(2, "0")}
      </span>
      <span className="muted hidden max-w-32 truncate sm:inline">{pausedAt ? "paused · " : ""}{label}</span>
    </Link>
  );
}

export function LiveClock({ start, pausedMinutes, pausedAt }: { start: string; pausedMinutes: number; pausedAt: string | null }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const toMs = (s: string) => new Date(s.length === 16 ? s + ":00" : s).getTime();
  const end = pausedAt ? toMs(pausedAt) : now ?? toMs(start);
  const sec = Math.max(0, Math.floor((end - toMs(start)) / 1000 - pausedMinutes * 60));
  return (
    <span className="num text-4xl font-semibold">
      {Math.floor(sec / 3600)}:{String(Math.floor((sec % 3600) / 60)).padStart(2, "0")}:{String(sec % 60).padStart(2, "0")}
    </span>
  );
}
