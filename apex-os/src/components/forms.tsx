/** Shared form fragments (server components). */
import { SESSION_DOMAINS, DOMAIN_LABEL, ACTIVITIES, LAW_AREAS, GERMAN_SKILLS, PHONE_CATEGORIES } from "@/domains/catalog";
import { Field } from "./ui";

export function DomainSelect({ name = "domain", defaultValue = "GERMAN" }: { name?: string; defaultValue?: string }) {
  return (
    <select name={name} defaultValue={defaultValue} className="input">
      {SESSION_DOMAINS.map((d) => (
        <option key={d} value={d}>
          {DOMAIN_LABEL[d]}
        </option>
      ))}
    </select>
  );
}

export function ActivitySelect({ name = "activity", defaultValue = "speaking" }: { name?: string; defaultValue?: string }) {
  return (
    <select name={name} defaultValue={defaultValue} className="input">
      {ACTIVITIES.map((a) => (
        <option key={a} value={a}>
          {a.replace("_", " ")}
        </option>
      ))}
    </select>
  );
}

export function AreaInput({ name = "area", defaultValue }: { name?: string; defaultValue?: string }) {
  return (
    <>
      <input name={name} list="area-list" className="input" placeholder="Law area / German skill (optional)" defaultValue={defaultValue} />
      <datalist id="area-list">
        {[...LAW_AREAS, ...GERMAN_SKILLS].map((a) => (
          <option key={a} value={a} />
        ))}
      </datalist>
    </>
  );
}

export function LawAreaSelect({ name = "area", defaultValue = "KC" }: { name?: string; defaultValue?: string }) {
  return (
    <select name={name} defaultValue={defaultValue} className="input">
      {LAW_AREAS.map((a) => (
        <option key={a}>{a}</option>
      ))}
    </select>
  );
}

export function FocusRadio({ name = "focus" }: { name?: string }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((f) => (
        <label key={f} className="flex-1">
          <input type="radio" name={name} value={f} className="peer sr-only" />
          <span className="btn w-full peer-checked:border-[var(--accent)] peer-checked:bg-[var(--accent)] peer-checked:text-white">{f}</span>
        </label>
      ))}
    </div>
  );
}

export function OutputFields() {
  const fields: [string, string][] = [
    ["words", "Words written"],
    ["speakingMin", "Speaking min"],
    ["exercises", "Exercises"],
    ["conversations", "Conversations"],
    ["pages", "Pages"],
    ["cases", "Cases"],
    ["memos", "Memos"],
    ["contracts", "Contracts"],
    ["drafts", "Drafts"],
    ["analyses", "Analyses"],
    ["chapters", "Chapters"],
    ["judgments", "Judgments"],
  ];
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
      {fields.map(([k, l]) => (
        <Field key={k} label={l}>
          <input name={`out_${k}`} type="number" min={0} step="any" className="input" inputMode="decimal" />
        </Field>
      ))}
    </div>
  );
}

export function PhoneGrid() {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
      {PHONE_CATEGORIES.map((c) => (
        <Field key={c} label={c}>
          <input name={`cat_${c}`} type="number" min={0} className="input" inputMode="numeric" placeholder="min" />
        </Field>
      ))}
    </div>
  );
}
