/**
 * Date logic. APEX stores local wall-clock strings ("YYYY-MM-DDTHH:mm[:ss]") and logical days ("YYYY-MM-DD").
 * All arithmetic is done in UTC on those naive values so results never depend on the server time zone.
 */

export type Day = string; // YYYY-MM-DD
export type LocalDateTime = string; // YYYY-MM-DDTHH:mm[:ss]

const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;
const DT_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/;
const MS_DAY = 86_400_000;

export function isDay(s: unknown): s is Day {
  if (typeof s !== "string" || !DAY_RE.test(s)) return false;
  const d = new Date(s + "T00:00:00Z");
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

export function isLocalDateTime(s: unknown): s is LocalDateTime {
  if (typeof s !== "string" || !DT_RE.test(s)) return false;
  return isDay(s.slice(0, 10)) && Number(s.slice(11, 13)) < 24 && Number(s.slice(14, 16)) < 60;
}

function dayToMs(d: Day): number {
  return Date.UTC(Number(d.slice(0, 4)), Number(d.slice(5, 7)) - 1, Number(d.slice(8, 10)));
}

function msToDay(ms: number): Day {
  return new Date(ms).toISOString().slice(0, 10);
}

export function addDays(d: Day, n: number): Day {
  return msToDay(dayToMs(d) + n * MS_DAY);
}

/** Whole days from a to b (b − a). */
export function diffDays(a: Day, b: Day): number {
  return Math.round((dayToMs(b) - dayToMs(a)) / MS_DAY);
}

export function dtToMs(dt: LocalDateTime): number {
  const s = dt.length === 16 ? dt + ":00" : dt;
  return Date.parse(s + "Z");
}

export function msToDt(ms: number): LocalDateTime {
  return new Date(ms).toISOString().slice(0, 19);
}

export function addMinutes(dt: LocalDateTime, minutes: number): LocalDateTime {
  return msToDt(dtToMs(dt) + minutes * 60_000);
}

/** Minutes from a to b (b − a), may be fractional. */
export function diffMinutes(a: LocalDateTime, b: LocalDateTime): number {
  return (dtToMs(b) - dtToMs(a)) / 60_000;
}

/** Logical day of a wall-clock time given the configured day start hour (e.g. 4 ⇒ 01:30 belongs to yesterday). */
export function logicalDay(dt: LocalDateTime, dayStartHour = 4): Day {
  const ms = dtToMs(dt) - dayStartHour * 3_600_000;
  return msToDay(ms);
}

export function hourOf(dt: LocalDateTime): number {
  return Number(dt.slice(11, 13));
}

export function minuteOfDay(dt: LocalDateTime): number {
  return Number(dt.slice(11, 13)) * 60 + Number(dt.slice(14, 16));
}

/** "HH:mm" → minutes after midnight. */
export function hmToMinutes(hm: string): number {
  const [h, m] = hm.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function minutesToHm(min: number): string {
  const m = ((Math.round(min) % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}

export function rangeDays(from: Day, to: Day): Day[] {
  const out: Day[] = [];
  const n = diffDays(from, to);
  for (let i = 0; i <= n; i++) out.push(addDays(from, i));
  return out;
}

/** ISO weekday 1 (Mon) .. 7 (Sun). */
export function isoWeekday(d: Day): number {
  const wd = new Date(dayToMs(d)).getUTCDay();
  return wd === 0 ? 7 : wd;
}

export function startOfIsoWeek(d: Day): Day {
  return addDays(d, 1 - isoWeekday(d));
}

/** ISO week label, e.g. 2026-W40. */
export function isoWeek(d: Day): string {
  const thursday = addDays(d, 4 - isoWeekday(d));
  const year = Number(thursday.slice(0, 4));
  const week = Math.floor(diffDays(`${year}-01-01`, thursday) / 7) + 1;
  return `${year}-W${String(week).padStart(2, "0")}`;
}

export function monthKey(d: Day): string {
  return d.slice(0, 7);
}

export function startOfMonth(d: Day): Day {
  return d.slice(0, 7) + "-01";
}

export function addMonths(d: Day, n: number): Day {
  const y = Number(d.slice(0, 4));
  const m = Number(d.slice(5, 7)) - 1 + n;
  const yy = y + Math.floor(m / 12);
  const mm = ((m % 12) + 12) % 12;
  const last = new Date(Date.UTC(yy, mm + 1, 0)).getUTCDate();
  const dd = Math.min(Number(d.slice(8, 10)), last);
  return `${yy}-${String(mm + 1).padStart(2, "0")}-${String(dd).padStart(2, "0")}`;
}

export function daysInMonth(d: Day): number {
  return new Date(Date.UTC(Number(d.slice(0, 4)), Number(d.slice(5, 7)), 0)).getUTCDate();
}

export function maxDay(a: Day, b: Day): Day {
  return a > b ? a : b;
}
export function minDay(a: Day, b: Day): Day {
  return a < b ? a : b;
}

/** Current local wall-clock time of the machine running APEX. */
export function nowLocal(): LocalDateTime {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

export function todayLogical(dayStartHour = 4): Day {
  return logicalDay(nowLocal(), dayStartHour);
}

export function formatDuration(minutes: number | null | undefined): string {
  if (minutes == null || !Number.isFinite(minutes)) return "—";
  const m = Math.round(minutes);
  const sign = m < 0 ? "−" : "";
  const a = Math.abs(m);
  const h = Math.floor(a / 60);
  const r = a % 60;
  if (h === 0) return `${sign}${r}m`;
  return `${sign}${h}h ${String(r).padStart(2, "0")}m`;
}

export const WINDOWS = { "7D": 7, "30D": 30, "90D": 90, "365D": 365 } as const;
export type WindowKey = keyof typeof WINDOWS | "ALL";
export const WINDOW_KEYS: WindowKey[] = ["7D", "30D", "90D", "365D", "ALL"];
