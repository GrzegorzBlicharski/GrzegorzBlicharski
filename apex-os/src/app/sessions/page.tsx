import { getDataset } from "@/server/context";
import { PageHeader, Panel, Badge, Empty, Field } from "@/components/ui";
import { fmtMin } from "@/components/format";
import { deleteSession, updateSession } from "@/server/actions";
import { ActionForm } from "@/components/ActionForm";
import { DOMAIN_LABEL, SESSION_DOMAINS, type SessionDomain } from "@/domains/catalog";
import Link from "next/link";
import { addDays } from "@/core/dates";

export const dynamic = "force-dynamic";

export default async function SessionsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const ds = getDataset();
  const day = sp.day;
  const domain = sp.domain;
  const depth = sp.depth;
  let list = day ? ds.sessions.filter((s) => s.day === day) : ds.sessions.filter((s) => s.day >= addDays(ds.asOf, -13));
  if (domain) list = list.filter((s) => s.domain === domain);
  if (depth) list = list.filter((s) => s.depth === depth);
  list = [...list].reverse().slice(0, 300);
  const total = list.reduce((a, s) => a + s.minutes, 0);
  return (
    <div className="space-y-3">
      <PageHeader title="Sessions" subtitle={day ? `Day ${day}` : "Last 14 days"}>
        <form className="flex flex-wrap items-end gap-2" method="get">
          <input type="date" name="day" defaultValue={day} className="input w-40" />
          <select name="domain" defaultValue={domain ?? ""} className="input w-36">
            <option value="">All domains</option>
            {SESSION_DOMAINS.map((d) => (
              <option key={d} value={d}>
                {DOMAIN_LABEL[d]}
              </option>
            ))}
          </select>
          <select name="depth" defaultValue={depth ?? ""} className="input w-28">
            <option value="">Any depth</option>
            <option>DEEP</option>
            <option>NORMAL</option>
            <option>LIGHT</option>
          </select>
          <button className="btn">Filter</button>
          <Link href="/sessions" className="btn">
            Reset
          </Link>
        </form>
      </PageHeader>
      <Panel title={`${list.length} sessions · ${fmtMin(total)}`}>
        {list.length ? (
          <div className="overflow-x-auto">
            <table className="data">
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Time</th>
                  <th>Domain</th>
                  <th>Activity / area</th>
                  <th>Min</th>
                  <th>Depth</th>
                  <th>Focus</th>
                  <th>Int.</th>
                  <th>Delay</th>
                  <th>Value</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {list.map((s) => (
                  <tr key={s.id} id={s.id}>
                    <td className="num">
                      <Link href={`/sessions?day=${s.day}`} className="hover:underline">
                        {s.day}
                      </Link>
                    </td>
                    <td className="num">
                      {s.start.slice(11, 16)}–{s.end?.slice(11, 16) ?? ""}
                    </td>
                    <td>{DOMAIN_LABEL[s.domain as SessionDomain] ?? s.domain}</td>
                    <td>
                      {s.activity}
                      {s.area ? <span className="muted"> · {s.area}</span> : null}
                      {s.mode === "passive" && <span className="muted"> · passive</span>}
                      {s.notes && <div className="muted text-xs">{s.notes}</div>}
                    </td>
                    <td>{fmtMin(s.minutes)}</td>
                    <td>
                      <Badge tone={s.depth === "DEEP" ? "good" : "neutral"}>{s.depth}</Badge>
                      {s.depthSource === "user" && <span className="muted text-[10px]"> set</span>}
                    </td>
                    <td>{s.focus ?? "—"}</td>
                    <td>{s.interruptions ?? "—"}</td>
                    <td>{s.startDelay != null ? `${Math.round(s.startDelay)}m` : "—"}</td>
                    <td className="muted text-xs">{s.valueClass}</td>
                    <td>
                      <details>
                        <summary className="link text-xs">edit</summary>
                        <div className="panel absolute right-4 z-20 mt-1 w-80 p-3 shadow-xl">
                          <ActionForm action={updateSession} submitLabel="Save edit" resetOnSuccess={false}>
                            <input type="hidden" name="sessionId" value={s.id} />
                            <input type="hidden" name="day" value={s.day} />
                            <div className="grid grid-cols-2 gap-2">
                              <Field label="Start">
                                <input name="start" type="time" defaultValue={s.start.slice(11, 16)} className="input" />
                              </Field>
                              <Field label="End">
                                <input name="end" type="time" defaultValue={s.end?.slice(11, 16)} className="input" />
                              </Field>
                              <Field label="Focus">
                                <input name="focus" type="number" min={1} max={5} defaultValue={s.focus ?? undefined} className="input" />
                              </Field>
                              <Field label="Interruptions">
                                <input name="interruptions" type="number" min={0} defaultValue={s.interruptions ?? undefined} className="input" />
                              </Field>
                              <Field label="Depth override">
                                <select name="depth" defaultValue={s.depthSource === "user" ? s.depth : ""} className="input">
                                  <option value="">auto</option>
                                  <option>DEEP</option>
                                  <option>NORMAL</option>
                                  <option>LIGHT</option>
                                </select>
                              </Field>
                              <Field label="Area">
                                <input name="area" defaultValue={s.area ?? ""} className="input" />
                              </Field>
                            </div>
                          </ActionForm>
                          <form action={deleteSession} className="mt-2">
                            <input type="hidden" name="sessionId" value={s.id} />
                            <button className="btn btn-sm btn-danger">Delete session</button>
                          </form>
                          <p className="muted mt-1 text-[10px]">Edits and deletes are stored as new events; history is never overwritten.</p>
                        </div>
                      </details>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty>No sessions match.</Empty>
        )}
      </Panel>
    </div>
  );
}
