import { getDb } from "@/data/db";
import { CSV_TABLES, exportTableCsv, exportDailyCsv } from "@/data/backup";
import { getDataset } from "@/server/context";

export const dynamic = "force-dynamic";

export function GET(req: Request) {
  const table = new URL(req.url).searchParams.get("table") ?? "daily";
  let body: string;
  if (table === "daily") body = exportDailyCsv(getDataset());
  else if ((CSV_TABLES as readonly string[]).includes(table)) body = exportTableCsv(getDb(), table as (typeof CSV_TABLES)[number]);
  else return new Response("Unknown table", { status: 400 });
  return new Response(body, { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="apex-${table}.csv"` } });
}
