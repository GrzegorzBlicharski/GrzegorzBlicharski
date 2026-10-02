import { NextResponse } from "next/server";
import { getDb } from "@/data/db";

export const dynamic = "force-dynamic";

/** Global search across sessions, tests, notes, goals, milestones, experiments, phone days, question areas. */
export function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json([]);
  const db = getDb();
  const like = `%${q}%`;
  const hits: { kind: string; title: string; sub?: string; href: string }[] = [];
  for (const r of db
    .prepare("SELECT id, day, domain, activity, area, title, notes, minutes FROM sessions WHERE domain LIKE ? OR activity LIKE ? OR area LIKE ? OR title LIKE ? OR notes LIKE ? OR day LIKE ? ORDER BY start DESC LIMIT 12")
    .all<Record<string, string | number>>(like, like, like, like, like, like))
    hits.push({ kind: "Session", title: `${r.domain} · ${r.activity}${r.area ? ` · ${r.area}` : ""}${r.title ? ` — ${r.title}` : ""}`, sub: `${r.day} · ${Math.round(r.minutes as number)} min`, href: `/sessions?day=${r.day}#${r.id}` });
  for (const r of db.prepare("SELECT id, date, name, domain, kind, pct, level FROM tests WHERE name LIKE ? OR domain LIKE ? OR skill LIKE ? OR area LIKE ? OR level LIKE ? ORDER BY date DESC LIMIT 8").all<Record<string, string | number>>(like, like, like, like, like))
    hits.push({ kind: "Test", title: `${r.name} (${r.kind})`, sub: `${r.date} · ${r.pct}%${r.level ? ` · ${r.level}` : ""}`, href: r.domain === "LAW" ? "/law#tests" : "/german#tests" });
  for (const r of db.prepare("SELECT id, day, kind, text FROM notes WHERE text LIKE ? ORDER BY day DESC LIMIT 8").all<Record<string, string>>(like))
    hits.push({ kind: "Note", title: r.text.slice(0, 80), sub: `${r.day} · ${r.kind}`, href: `/sessions?day=${r.day}` });
  for (const r of db.prepare("SELECT id, title, status FROM goals WHERE title LIKE ? LIMIT 5").all<Record<string, string>>(like)) hits.push({ kind: "Goal", title: r.title, sub: r.status, href: "/goals" });
  for (const r of db.prepare("SELECT id, date, title, kind FROM milestones WHERE title LIKE ? OR notes LIKE ? ORDER BY date DESC LIMIT 6").all<Record<string, string>>(like, like))
    hits.push({ kind: "Milestone", title: r.title, sub: `${r.date} · ${r.kind}`, href: "/timeline" });
  for (const r of db.prepare("SELECT id, title, status FROM experiments WHERE title LIKE ? OR hypothesis LIKE ? LIMIT 5").all<Record<string, string>>(like, like))
    hits.push({ kind: "Experiment", title: r.title, sub: r.status, href: "/experiments" });
  for (const r of db.prepare("SELECT area, SUM(n) n FROM question_attempts WHERE area LIKE ? OR topic LIKE ? GROUP BY area LIMIT 5").all<Record<string, string | number>>(like, like))
    hits.push({ kind: "Law area", title: String(r.area), sub: `${r.n} questions`, href: "/law" });
  if (/^\d{4}-\d{2}-\d{2}$/.test(q)) {
    hits.push({ kind: "Phone", title: `Phone data ${q}`, href: `/digital?day=${q}` });
    hits.push({ kind: "Day", title: `Sessions on ${q}`, href: `/sessions?day=${q}` });
  }
  for (const r of db.prepare("SELECT title, rule_id FROM recommendations WHERE title LIKE ? LIMIT 5").all<Record<string, string>>(like)) hits.push({ kind: "Insight", title: r.title, sub: r.rule_id, href: "/coach" });
  return NextResponse.json(hits);
}
