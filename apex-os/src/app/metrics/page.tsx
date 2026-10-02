import { registry } from "@/metrics/registry";
import { PageHeader, Panel, TypeTag } from "@/components/ui";

export default function MetricsPage() {
  const rows = registry();
  const domains = [...new Set(rows.map((r) => r.domain))];
  return (
    <div className="space-y-3">
      <PageHeader title="Metrics registry" subtitle="The formula, source and limits behind every number in the app." />
      {domains.map((d) => (
        <Panel key={d} title={d}>
          <div className="overflow-x-auto">
            <table className="data">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Formula</th>
                  <th>Aggregation</th>
                  <th>Source</th>
                  <th>Min sample</th>
                  <th>Limitations</th>
                  <th>v</th>
                </tr>
              </thead>
              <tbody>
                {rows
                  .filter((r) => r.domain === d)
                  .map((r) => (
                    <tr key={r.key} id={r.key} className="target:bg-[var(--panel-2)]">
                      <td>
                        <div className="font-medium">{r.name}</div>
                        <code className="muted text-[11px]">{r.key}</code>
                      </td>
                      <td>
                        <TypeTag type={r.type} />
                      </td>
                      <td className="max-w-md">{r.formula}</td>
                      <td className="text-2 text-xs">{r.aggregation}</td>
                      <td className="text-2 text-xs">{r.source}</td>
                      <td className="text-xs">{r.minSample}</td>
                      <td className="text-2 max-w-xs text-xs">{r.limitations}</td>
                      <td>{r.version}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </Panel>
      ))}
    </div>
  );
}
