import { getDataset } from "@/server/context";
import { PageHeader, Panel, Grid, Badge, Field, Empty } from "@/components/ui";
import { ActionForm } from "@/components/ActionForm";
import { addMilestone, deleteMilestone } from "@/server/actions";
import { MILESTONE_KINDS } from "@/domains/catalog";
import { records } from "@/modules/consistency";
import { fmtUnit } from "@/components/format";

export const dynamic = "force-dynamic";

interface Item {
  date: string;
  kind: string;
  title: string;
  ref?: string | null;
  id?: string;
  deletable?: boolean;
}

export default function TimelinePage() {
  const ds = getDataset();
  const items: Item[] = [
    ...ds.milestones.map((m) => ({ date: m.date, kind: m.kind, title: m.title, ref: m.ref, id: m.id, deletable: true })),
    ...ds.experiments.map((e) => ({ date: e.startDate, kind: "experiment", title: `${e.title}${e.decision ? ` → ${e.decision}` : ""}` })),
    ...ds.interventions.map((i) => ({ date: i.startDate, kind: "intervention", title: `${i.bottleneck}: ${i.action}` })),
    ...ds.settingsVersions.map((v) => ({ date: v.effectiveFrom, kind: "settings", title: `Settings changed: ${Object.keys(v.patch).join(", ")}` })),
    ...ds.goals.map((g) => ({ date: g.startDate, kind: "goal", title: `Goal: ${g.title}` })),
    ...ds.tests.filter((t) => t.kind === "OFFICIAL" || t.kind === "EXTERNAL").map((t) => ({ date: t.date, kind: "test", title: `${t.name} · ${t.pct}%${t.level ? ` · ${t.level}` : ""}`, ref: t.ref })),
  ].sort((a, b) => (a.date < b.date ? 1 : -1));
  const achievements = ds.milestones.filter((m) => ["certification", "exam", "project", "portfolio", "achievement"].includes(m.kind));
  const rec = records(ds);
  return (
    <div className="space-y-3">
      <PageHeader title="Timeline & records" subtitle="Strategy changes, milestones, tests, interventions — a document of transformation over years." />
      <Grid cols="lg:grid-cols-3">
        <Panel title="Timeline" className="lg:col-span-2">
          {items.length ? (
            <ol className="relative space-y-2 border-l pl-4" style={{ borderColor: "var(--border)" }}>
              {items.slice(0, 150).map((i, k) => (
                <li key={k} className="text-sm">
                  <span className="absolute -left-[5px] mt-1.5 h-2.5 w-2.5 rounded-full" style={{ background: i.kind === "intervention" || i.kind === "experiment" ? "var(--accent)" : "var(--axis)" }} />
                  <span className="num muted mr-2">{i.date}</span>
                  <Badge>{i.kind}</Badge> <span className="ml-1">{i.title}</span>
                  {i.ref && (
                    <span className="muted ml-2 text-xs">
                      evidence: {i.ref}
                    </span>
                  )}
                  {i.deletable && i.id && (
                    <form action={deleteMilestone} className="ml-2 inline">
                      <input type="hidden" name="milestoneId" value={i.id} />
                      <button className="muted text-[10px] hover:underline">remove</button>
                    </form>
                  )}
                </li>
              ))}
            </ol>
          ) : (
            <Empty>Nothing on the timeline yet.</Empty>
          )}
        </Panel>
        <div className="space-y-3">
          <Panel title="Record milestone / achievement">
            <ActionForm action={addMilestone} submitLabel="Add">
              <div className="grid grid-cols-2 gap-2">
                <Field label="Title" className="col-span-2">
                  <input name="title" className="input" required />
                </Field>
                <Field label="Kind">
                  <select name="kind" className="input">
                    {MILESTONE_KINDS.map((k) => (
                      <option key={k}>{k}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Date">
                  <input name="date" type="date" defaultValue={ds.asOf} className="input" />
                </Field>
                <Field label="Evidence link / reference" className="col-span-2">
                  <input name="ref" className="input" />
                </Field>
                <Field label="Notes" className="col-span-2">
                  <input name="notes" className="input" />
                </Field>
              </div>
            </ActionForm>
          </Panel>
          <Panel title="Achievements" sub="Certifications, exams, projects, portfolio — with evidence">
            <ul className="space-y-1 text-sm">
              {achievements.map((a) => (
                <li key={a.id}>
                  <Badge tone="good">{a.kind}</Badge> {a.title} <span className="muted text-xs">{a.date}</span>
                </li>
              ))}
              {!achievements.length && <li className="muted">None yet.</li>}
            </ul>
          </Panel>
          <Panel title="Personal records (automatic)">
            <table className="data">
              <tbody>
                {rec.map((r) => (
                  <tr key={r.label}>
                    <td>{r.label}</td>
                    <td className="font-semibold">{r.unit === "min" ? fmtUnit(r.value, "min") : `${r.value.toFixed(r.unit === "/5" || r.unit === "h" ? 1 : 0)} ${r.unit}`}</td>
                    <td className="num muted">{r.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        </div>
      </Grid>
    </div>
  );
}
