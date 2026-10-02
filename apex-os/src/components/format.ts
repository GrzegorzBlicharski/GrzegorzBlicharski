import type { Unit } from "@/metrics/series";

export function fmtMin(m: number | null | undefined): string {
  if (m == null || !Number.isFinite(m)) return "—";
  const r = Math.round(m);
  const a = Math.abs(r);
  const h = Math.floor(a / 60);
  const mm = a % 60;
  const sign = r < 0 ? "−" : "";
  return h ? `${sign}${h}h ${String(mm).padStart(2, "0")}m` : `${sign}${mm}m`;
}

export function fmtNum(x: number | null | undefined, digits = 0): string {
  if (x == null || !Number.isFinite(x)) return "—";
  return x.toLocaleString("en-US", { maximumFractionDigits: digits, minimumFractionDigits: digits });
}

export function fmtPct(x: number | null | undefined, digits = 0): string {
  return x == null || !Number.isFinite(x) ? "—" : `${fmtNum(x, digits)}%`;
}

export function fmtUnit(x: number | null | undefined, unit: Unit | string): string {
  if (x == null || !Number.isFinite(x)) return "—";
  switch (unit) {
    case "min":
      return fmtMin(x);
    case "pct":
      return fmtPct(x, 1);
    case "score":
      return fmtNum(x, 2);
    case "per100":
      return fmtNum(x, 2);
    case "perMin":
    case "perHour":
      return fmtNum(x, 2);
    case "h":
      return `${fmtNum(x, 1)}h`;
    default:
      return fmtNum(x, Math.abs(x) < 10 && !Number.isInteger(x) ? 1 : 0);
  }
}

export function fmtDelta(x: number | null | undefined, unit: Unit | string): string {
  if (x == null || !Number.isFinite(x)) return "—";
  const s = x > 0 ? "+" : x < 0 ? "−" : "±";
  const a = Math.abs(x);
  if (unit === "min") return `${s}${fmtMin(a)}`;
  if (unit === "pct") return `${s}${fmtNum(a, 1)} pp`;
  return `${s}${fmtNum(a, a < 10 ? 2 : 0)}`;
}
