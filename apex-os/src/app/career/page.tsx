import { getDataset } from "@/server/context";
import { PageHeader, Panel, Grid, Field, Empty, Badge } from "@/components/ui";
import { ActionForm } from "@/components/ActionForm";
import { defineCompetency, addEvidence } from "@/server/actions";
import { DomainSelect } from "@/components/forms";
import { EVIDENCE_TYPES } from "@/domains/catalog";
import { fmtNum } from "@/components/format";
import { goalAlignedShare } from "@/modules/learning";
import { specialization } from "@/modules/law";

export const dynamic = "force-dynamic";

export default function CareerPage() {
  const ds = getDataset();
  const ga = goalAlignedShare(ds);
  const careerH = ds.days.reduce((a, d) => a + (d.byDomain.CAREER ?? 0), 0) / 60;
  const spec = specialization(ds).slice(0, 5);
  return (
    <div className="space-y-3">
      <PageHeader title="Career development" subtitle="Competencies backed by evidence: tests, projects, exercises, documents, assessments." />
      <Grid cols="md:grid-cols-3">
        <Panel title="Goal-aligned time (30D)">
          <div className="text-2xl font-semibold">{ga.share != null ? `${ga.share.toFixed(0)}%` : "—"}</div>
          <div className="muted text-xs">
            {fmtNum(ga.alignedH, 1)} of {fmtNum(ga.totalH, 1)} h in domains of active primary/secondary goals
          </div>
        </Panel>
        <Panel title="Career-domain hours (all time)">
          <div className="text-2xl font-semibold">{fmtNum(careerH, 1)} h</div>
          <div className="muted text-xs">courses, applications, portfolio, projects</div>
        </Panel>
        <Panel title="Deepest specializations">
          <ul className="text-sm">
            {spec.map((s) => (
              <li key={s.area}>
                {s.area}: {fmtNum(s.hours, 0)} h · {fmtNum(s.questions)} q
              </li>
            ))}
          </ul>
        </Panel>
      </Grid>
      <Panel title="Competency map">
        {ds.competencies.length ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {ds.competencies.map((c) => (
              <div key={c.id} className="rounded border p-3" style={{ borderColor: "var(--border)" }}>
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{c.name}</span>
                  <span className="muted text-xs">
                    {c.domain} · {c.evidence.length} evidence
                  </span>
                </div>
                <ul className="mt-2 space-y-1 text-sm">
                  {c.evidence.slice(0, 5).map((e) => (
                    <li key={e.id} className="flex gap-2">
                      <Badge>{e.type}</Badge>
                      <span className="truncate">{e.title}</span>
                      <span className="muted ml-auto text-xs">
                        {e.date}
                        {e.score != null ? ` · ${e.score}` : ""}
                      </span>
                    </li>
                  ))}
                  {!c.evidence.length && <li className="muted text-xs">No evidence yet — a competency without evidence is a claim, not a fact.</li>}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <Empty>Define competencies (German, Legal Knowledge, Legal Drafting, Research, Negotiation, Professional Communication…).</Empty>
        )}
      </Panel>
      <Grid cols="lg:grid-cols-2">
        <Panel title="Add evidence">
          <ActionForm action={addEvidence} submitLabel="Add evidence">
            <div className="grid grid-cols-2 gap-2">
              <Field label="Competency">
                <select name="competencyId" className="input" required>
                  {ds.competencies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Type">
                <select name="type" className="input">
                  {EVIDENCE_TYPES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </Field>
              <Field label="Title" className="col-span-2">
                <input name="title" className="input" required />
              </Field>
              <Field label="Date">
                <input name="date" type="date" defaultValue={ds.asOf} className="input" />
              </Field>
              <Field label="Score (optional)">
                <input name="score" type="number" step="any" className="input" />
              </Field>
              <Field label="Link / reference" className="col-span-2">
                <input name="ref" className="input" placeholder="path, URL or document reference" />
              </Field>
            </div>
          </ActionForm>
        </Panel>
        <Panel title="Define competency">
          <ActionForm action={defineCompetency} submitLabel="Add competency">
            <div className="grid grid-cols-2 gap-2">
              <Field label="Name">
                <input name="name" className="input" required />
              </Field>
              <Field label="Domain">
                <DomainSelect defaultValue="CAREER" />
              </Field>
            </div>
          </ActionForm>
        </Panel>
      </Grid>
    </div>
  );
}
