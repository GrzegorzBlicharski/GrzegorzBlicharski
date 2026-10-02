/** Forecast log resolution: the system learns how accurate its own forecasts are. */
import type { Dataset, ForecastRecord } from "@/core/types";
import { diffDays } from "@/core/dates";
import { METRIC_MAP, rangeAgg, windowAgg } from "@/metrics/series";
import { goalStatus } from "./goals";

export interface ResolvedForecast extends ForecastRecord {
  resolved: boolean;
  actual: number | null;
  actualDate: string | null;
  error: number | null;
  absPctError: number | null;
  insideBand: boolean | null;
  dateErrorDays: number | null;
}

export function resolveForecasts(ds: Dataset): { items: ResolvedForecast[]; mape: number | null; bias: number | null; calibration: number | null; resolvedN: number } {
  const items: ResolvedForecast[] = ds.forecasts.map((f) => {
    const due = f.horizonDate <= ds.asOf;
    let actual: number | null = null;
    let actualDate: string | null = null;
    if (due && f.goalId) {
      const g = ds.goals.find((x) => x.id === f.goalId);
      if (g && g.metricKey && METRIC_MAP.has(g.metricKey) && g.kind === "cumulative") {
        actual = (rangeAgg(ds, g.metricKey, g.startDate, f.horizonDate).total ?? 0) * goalStatus(ds, g).unitFactor;
      }
      if (g && f.projectedDate) {
        // completion date error: when did cumulative cross target?
        const st = goalStatus(ds, g);
        if (st.status === "ACHIEVED") actualDate = ds.asOf;
      }
    } else if (due && METRIC_MAP.has(f.metricKey)) {
      actual = windowAgg(ds, f.metricKey, "30D", f.horizonDate).value;
    }
    const error = actual != null && f.projectedValue != null ? actual - f.projectedValue : null;
    return {
      ...f,
      resolved: due && actual != null,
      actual,
      actualDate,
      error,
      absPctError: error != null && actual ? Math.abs(error / actual) * 100 : null,
      insideBand: actual != null && f.p10 != null && f.p90 != null ? actual >= Math.min(f.p10, f.p90) && actual <= Math.max(f.p10, f.p90) : null,
      dateErrorDays: actualDate && f.projectedDate ? diffDays(f.projectedDate, actualDate) : null,
    };
  });
  const res = items.filter((i) => i.resolved);
  const ape = res.map((i) => i.absPctError).filter((x): x is number => x != null);
  const err = res.map((i) => i.error).filter((x): x is number => x != null);
  const band = res.map((i) => i.insideBand).filter((x): x is boolean => x != null);
  return {
    items,
    mape: ape.length ? ape.reduce((a, b) => a + b, 0) / ape.length : null,
    bias: err.length ? err.reduce((a, b) => a + b, 0) / err.length : null,
    calibration: band.length ? (band.filter(Boolean).length / band.length) * 100 : null,
    resolvedN: res.length,
  };
}
