"use client";
import { useState } from "react";
import { LAW_AREAS } from "@/domains/catalog";

const DOMAINS: { id: string; label: string }[] = [
  { id: "GERMAN", label: "German" },
  { id: "LAW", label: "Law" },
  { id: "CAREER", label: "Career" },
  { id: "LEARNING", label: "Other learning" },
  { id: "SYSTEM", label: "System building" },
  { id: "ADMIN", label: "Admin" },
];

const ACTIVITIES: Record<string, { id: string; label: string }[]> = {
  GERMAN: [
    { id: "speaking", label: "Speaking" },
    { id: "conversation", label: "Conversation" },
    { id: "writing", label: "Writing" },
    { id: "grammar", label: "Grammar" },
    { id: "vocabulary", label: "Vocabulary" },
    { id: "listening", label: "Listening" },
    { id: "reading", label: "Reading" },
    { id: "pronunciation", label: "Pronunciation" },
    { id: "passive_immersion", label: "Passive immersion" },
  ],
  LAW: [
    { id: "questions", label: "Questions" },
    { id: "cases", label: "Cases" },
    { id: "drafting", label: "Drafting" },
    { id: "reading", label: "Reading" },
    { id: "review", label: "Review" },
    { id: "research", label: "Research" },
    { id: "analysis", label: "Analysis" },
    { id: "testing", label: "Mock test" },
  ],
  CAREER: [
    { id: "course", label: "Course" },
    { id: "application", label: "Application" },
    { id: "drafting", label: "Portfolio work" },
    { id: "research", label: "Research" },
  ],
  LEARNING: [
    { id: "reading", label: "Reading" },
    { id: "recall", label: "Recall" },
    { id: "review", label: "Review" },
    { id: "course", label: "Course" },
  ],
  SYSTEM: [
    { id: "system", label: "Improving my system" },
    { id: "planning", label: "Planning" },
  ],
  ADMIN: [{ id: "admin", label: "Admin" }],
};

const LAW_QUICK = ["KC", "KPC", "KK", "KPK", "KPA", "Prawo pracy", "KSH", "UE"];

/** Domain → activity → area, as large chips. Emits plain form fields: domain, activity, area. */
export function SessionPicker({ defaultDomain = "GERMAN", defaultActivity }: { defaultDomain?: string; defaultActivity?: string }) {
  const [domain, setDomain] = useState(DOMAINS.some((d) => d.id === defaultDomain) ? defaultDomain : "GERMAN");
  const acts = ACTIVITIES[domain] ?? [{ id: "other", label: "Other" }];
  const [activity, setActivity] = useState(defaultActivity && acts.some((a) => a.id === defaultActivity) ? defaultActivity : acts[0].id);
  const [area, setArea] = useState("");
  return (
    <div className="space-y-4">
      <div>
        <div className="label mb-2">What are you working on?</div>
        <div className="flex flex-wrap gap-2">
          {DOMAINS.map((d) => (
            <label key={d.id}>
              <input
                type="radio"
                name="domain"
                value={d.id}
                checked={domain === d.id}
                onChange={() => {
                  setDomain(d.id);
                  setActivity((ACTIVITIES[d.id] ?? [{ id: "other" }])[0].id);
                  setArea("");
                }}
                className="peer sr-only"
              />
              <span className="chip">{d.label}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <div className="label mb-2">Activity</div>
        <div className="flex flex-wrap gap-2">
          {acts.map((a) => (
            <label key={a.id}>
              <input type="radio" name="activity" value={a.id} checked={activity === a.id} onChange={() => setActivity(a.id)} className="peer sr-only" />
              <span className="chip">{a.label}</span>
            </label>
          ))}
        </div>
      </div>
      {domain === "LAW" && (
        <div>
          <div className="label mb-2">Area</div>
          <div className="flex flex-wrap items-center gap-2">
            {LAW_QUICK.map((a) => (
              <label key={a}>
                <input type="radio" checked={area === a} onChange={() => setArea(a)} className="peer sr-only" />
                <span className="chip">{a}</span>
              </label>
            ))}
            <select className="input w-44" value={LAW_QUICK.includes(area) ? "" : area} onChange={(e) => setArea(e.target.value)} aria-label="Other law area">
              <option value="">More areas…</option>
              {LAW_AREAS.filter((a) => !LAW_QUICK.includes(a)).map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </div>
        </div>
      )}
      {domain === "GERMAN" && (
        <label className="flex items-center gap-2 text-[14px]">
          <input type="checkbox" checked={area === "Legal German"} onChange={(e) => setArea(e.target.checked ? "Legal German" : "")} /> Legal / professional German
        </label>
      )}
      <input type="hidden" name="area" value={area} />
    </div>
  );
}
