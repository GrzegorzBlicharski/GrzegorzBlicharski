import { writeFileSync } from "node:fs";
import path from "node:path";
import { registry } from "../src/metrics/registry";

const rows = registry();
const byDomain = new Map<string, typeof rows>();
for (const r of rows) byDomain.set(r.domain, [...(byDomain.get(r.domain) ?? []), r]);
let md = `# APEX OS — Metrics Registry\n\nGenerated from \`src/metrics/registry.ts\` (\`npm run docs:metrics\`). Do not edit by hand.\n\nEvery number in APEX OS is reproducible from the event log plus the metric version below.\nTypes: MEASURED · SELF-REPORTED · DERIVED · ESTIMATED · FORECASTED.\n\nWindows for every series metric: 7D · 30D · 90D · 365D · ALL (inclusive of the as-of day, clipped to the first tracked day).\n\n`;
for (const [domain, list] of byDomain) {
  md += `## ${domain}\n\n`;
  for (const r of list) {
    md += `### ${r.name} \`${r.key}\`\n\n| Field | Value |\n|---|---|\n| DOMAIN | ${r.domain} |\n| TYPE | ${r.type} |\n| FORMULA | ${r.formula.replace(/\|/g, "\\|")} |\n| AGGREGATION | ${r.aggregation} |\n| SOURCE | ${r.source} |\n| MIN SAMPLE | ${r.minSample} |\n| LIMITATIONS | ${r.limitations.replace(/\|/g, "\\|")} |\n| VERSION | ${r.version} |\n\n`;
  }
}
writeFileSync(path.join(process.cwd(), "docs", "METRICS.md"), md);
console.log(`Wrote ${rows.length} metrics to docs/METRICS.md`);
