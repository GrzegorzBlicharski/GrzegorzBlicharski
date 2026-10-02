import { describe, it, expect } from "vitest";
import { addDays, diffDays, logicalDay, isoWeek, isoWeekday, addMonths, isDay, isLocalDateTime, rangeDays, diffMinutes, minutesToHm, hmToMinutes, formatDuration, startOfIsoWeek, daysInMonth } from "@/core/dates";

describe("date logic", () => {
  it("adds and diffs days across month/year/leap boundaries", () => {
    expect(addDays("2024-02-28", 1)).toBe("2024-02-29");
    expect(addDays("2024-02-29", 1)).toBe("2024-03-01");
    expect(addDays("2025-12-31", 1)).toBe("2026-01-01");
    expect(diffDays("2024-01-01", "2025-01-01")).toBe(366);
    expect(diffDays("2026-03-28", "2026-03-30")).toBe(2); // DST-independent
    expect(rangeDays("2026-01-30", "2026-02-02")).toEqual(["2026-01-30", "2026-01-31", "2026-02-01", "2026-02-02"]);
  });
  it("assigns logical day with day start hour", () => {
    expect(logicalDay("2026-10-02T01:30", 4)).toBe("2026-10-01");
    expect(logicalDay("2026-10-02T04:00", 4)).toBe("2026-10-02");
    expect(logicalDay("2026-10-02T03:59:59", 4)).toBe("2026-10-01");
    expect(logicalDay("2026-10-02T00:10", 0)).toBe("2026-10-02");
  });
  it("computes ISO weeks and weekdays", () => {
    expect(isoWeek("2021-01-03")).toBe("2020-W53");
    expect(isoWeek("2026-01-01")).toBe("2026-W01");
    expect(isoWeek("2024-12-30")).toBe("2025-W01");
    expect(isoWeekday("2026-10-04")).toBe(7);
    expect(startOfIsoWeek("2026-10-04")).toBe("2026-09-28");
  });
  it("month arithmetic clamps day", () => {
    expect(addMonths("2026-01-31", 1)).toBe("2026-02-28");
    expect(addMonths("2024-01-31", 1)).toBe("2024-02-29");
    expect(addMonths("2026-03-15", -3)).toBe("2025-12-15");
    expect(daysInMonth("2024-02-10")).toBe(29);
  });
  it("validates formats", () => {
    expect(isDay("2026-02-30")).toBe(false);
    expect(isDay("2026-02-28")).toBe(true);
    expect(isLocalDateTime("2026-02-28T24:00")).toBe(false);
    expect(isLocalDateTime("2026-02-28T23:59:10")).toBe(true);
  });
  it("time helpers", () => {
    expect(diffMinutes("2026-01-01T23:50", "2026-01-02T00:20")).toBe(30);
    expect(minutesToHm(hmToMinutes("07:05") + 60)).toBe("08:05");
    expect(formatDuration(372)).toBe("6h 12m");
    expect(formatDuration(-15)).toBe("−15m");
  });
});
