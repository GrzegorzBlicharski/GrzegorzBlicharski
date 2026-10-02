import { describe, it, expect } from "vitest";
import { appendEvents, rebuildProjections } from "@/data/store";
import { buildDataset } from "@/data/facts";
import { settingsAt } from "@/core/settings";
import { memDb, logged } from "./helpers";

describe("projector", () => {
  it("timer lifecycle subtracts pauses and computes start delay", () => {
    const db = memDb();
    appendEvents(db, [
      { type: "SESSION_STARTED", occurredAt: "2026-10-01T08:10:00", payload: { sessionId: "s1", domain: "LAW", activity: "questions", area: "KC", plannedStart: "2026-10-01T08:00" } },
      { type: "SESSION_PAUSED", occurredAt: "2026-10-01T08:40:00", payload: { sessionId: "s1" } },
      { type: "SESSION_RESUMED", occurredAt: "2026-10-01T08:55:00", payload: { sessionId: "s1" } },
      { type: "SESSION_COMPLETED", occurredAt: "2026-10-01T09:25:00", payload: { sessionId: "s1", focus: 4, interruptions: 1, output: { questions: 20 } } },
    ]);
    const s = db.prepare("SELECT * FROM sessions WHERE id='s1'").get<Record<string, number | string>>()!;
    expect(s.minutes).toBe(60);
    expect(s.paused_minutes).toBe(15);
    expect(s.start_delay).toBe(10);
    expect(s.status).toBe("completed");
    expect(s.day).toBe("2026-10-01");
  });
  it("completing while paused counts pause until end; double completion ignored", () => {
    const db = memDb();
    appendEvents(db, [
      { type: "SESSION_STARTED", occurredAt: "2026-10-01T10:00:00", payload: { sessionId: "s2", domain: "GERMAN", activity: "writing" } },
      { type: "SESSION_PAUSED", occurredAt: "2026-10-01T10:30:00", payload: { sessionId: "s2" } },
      { type: "SESSION_COMPLETED", occurredAt: "2026-10-01T11:00:00", payload: { sessionId: "s2", unfinished: true } },
      { type: "SESSION_COMPLETED", occurredAt: "2026-10-01T12:00:00", payload: { sessionId: "s2" } },
    ]);
    const s = db.prepare("SELECT minutes, status FROM sessions WHERE id='s2'").get<{ minutes: number; status: string }>()!;
    expect(s).toEqual({ minutes: 30, status: "unfinished" });
  });
  it("updates and deletes via events (history kept)", () => {
    const db = memDb();
    appendEvents(db, [logged("s3", "2026-10-01", "09:00", 50), { type: "SESSION_UPDATED", payload: { sessionId: "s3", patch: { focus: 5, end: "2026-10-01T10:30" } } }]);
    expect(db.prepare("SELECT minutes, focus FROM sessions WHERE id='s3'").get()).toEqual({ minutes: 90, focus: 5 });
    appendEvents(db, [{ type: "SESSION_DELETED", payload: { sessionId: "s3" } }]);
    expect(db.prepare("SELECT COUNT(*) n FROM sessions").get()).toEqual({ n: 0 });
    expect(db.prepare("SELECT COUNT(*) n FROM events").get()).toEqual({ n: 3 });
  });
  it("sessions after midnight belong to the previous logical day", () => {
    const db = memDb();
    appendEvents(db, [logged("late", "2026-10-02", "01:00", 30)]);
    expect(db.prepare("SELECT day FROM sessions").get()).toEqual({ day: "2026-10-01" });
  });
  it("settings are versioned, never overwritten, and backdated patches apply correctly", () => {
    const db = memDb();
    appendEvents(db, [
      { type: "SETTINGS_CHANGED", payload: { patch: { phoneLimitMin: 90 }, effectiveFrom: "2026-01-01" } },
      { type: "SETTINGS_CHANGED", payload: { patch: { phoneLimitMin: 60 }, effectiveFrom: "2026-06-01" } },
      { type: "SETTINGS_CHANGED", payload: { patch: { morningEnd: "09:00" }, effectiveFrom: "2026-03-01" } },
    ]);
    const ds = buildDataset(db, "2026-10-01");
    expect(ds.settingsVersions).toHaveLength(3);
    expect(settingsAt(ds.settingsVersions, "2025-12-31").phoneLimitMin).toBe(60); // default
    expect(settingsAt(ds.settingsVersions, "2026-02-01").phoneLimitMin).toBe(90);
    expect(settingsAt(ds.settingsVersions, "2026-07-01").phoneLimitMin).toBe(60);
    expect(settingsAt(ds.settingsVersions, "2026-07-01").morningEnd).toBe("09:00");
    expect(settingsAt(ds.settingsVersions, "2026-02-01").morningEnd).toBe("10:00");
  });
  it("question sets store confidence quadrants", () => {
    const db = memDb();
    appendEvents(db, [{ type: "QUESTION_SET_LOGGED", occurredAt: "2026-10-01T12:00:00", payload: { attemptId: "q1", area: "KC", total: 30, correct: 24, wrongConfident: 4, correctUnsure: 5 } }]);
    expect(db.prepare("SELECT n, n_correct, n_correct_conf, n_correct_unsure, n_wrong_conf, n_wrong_unsure FROM question_attempts").get()).toEqual({
      n: 30, n_correct: 24, n_correct_conf: 19, n_correct_unsure: 5, n_wrong_conf: 4, n_wrong_unsure: 2,
    });
  });
  it("rebuild is idempotent for small logs", () => {
    const db = memDb();
    appendEvents(db, [logged("a", "2026-10-01", "09:00", 30), { type: "PHONE_USAGE_ADDED", payload: { usageId: "p", day: "2026-10-01", category: "News", minutes: 20 } }]);
    const before = db.prepare("SELECT * FROM sessions").all();
    rebuildProjections(db);
    expect(db.prepare("SELECT * FROM sessions").all()).toEqual(before);
  });
});
