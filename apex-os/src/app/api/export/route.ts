import { getDb } from "@/data/db";
import { exportBackup } from "@/data/backup";

export const dynamic = "force-dynamic";

export function GET() {
  const b = exportBackup(getDb());
  return new Response(JSON.stringify(b), {
    headers: { "content-type": "application/json", "content-disposition": `attachment; filename="apex-os-backup-${b.exportedAt.slice(0, 10)}.json"` },
  });
}
