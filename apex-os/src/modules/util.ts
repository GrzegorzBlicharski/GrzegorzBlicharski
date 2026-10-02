import { addDays, type Day } from "@/core/dates";
import type { Dataset, DayFacts } from "@/core/types";
import { sliceDays } from "@/metrics/series";

/** Weekly values computed by a custom reducer over each 7-day block (most recent last). */
export function weeklyValuesCustom(ds: Dataset, weeks: number, f: (days: DayFacts[]) => number | null, endDay: Day = ds.asOf): (number | null)[] {
  const out: (number | null)[] = [];
  for (let k = weeks - 1; k >= 0; k--) {
    const to = addDays(endDay, -7 * k);
    out.push(f(sliceDays(ds, addDays(to, -6), to)));
  }
  return out;
}
