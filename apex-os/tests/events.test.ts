import { describe, it, expect } from "vitest";
import { validateEvent } from "@/events/catalog";
import { appendEvent, EventValidationError, countEvents } from "@/data/store";
import { memDb } from "./helpers";

describe("event validation", () => {
  it("accepts valid payloads", () => {
    expect(validateEvent("PHONE_USAGE_ADDED", { usageId: "u1", day: "2026-10-01", category: "News", minutes: 12 }).ok).toBe(true);
  });
  it("rejects malformed payloads", () => {
    expect(validateEvent("NOPE", {}).ok).toBe(false);
    expect(validateEvent("PHONE_USAGE_ADDED", { usageId: "u1", day: "2026-13-01", category: "News", minutes: 12 }).errors[0]).toMatch(/day/);
    expect(validateEvent("PHONE_USAGE_ADDED", { usageId: "u1", day: "2026-10-01", category: "Casino", minutes: 12 }).ok).toBe(false);
    expect(validateEvent("PHONE_USAGE_ADDED", { usageId: "u1", day: "2026-10-01", category: "News", minutes: -1 }).ok).toBe(false);
    expect(validateEvent("QUESTION_SET_LOGGED", { attemptId: "a", area: "KC", total: 5, correct: 6 }).ok).toBe(false);
    expect(validateEvent("SESSION_LOGGED", { sessionId: "s", domain: "LAW", activity: "reading", start: "2026-10-01T10:00" }).ok).toBe(false);
    expect(validateEvent("GERMAN_WRITING_EVALUATED", { evalId: "e", day: "2026-10-01", words: 100, errors: { cases: -2 } }).ok).toBe(false);
  });
  it("store refuses invalid events atomically", () => {
    const db = memDb();
    expect(() => appendEvent(db, { type: "PHONE_USAGE_ADDED", payload: { usageId: "x", day: "bad", category: "News", minutes: 1 } })).toThrow(EventValidationError);
    expect(countEvents(db)).toBe(0);
  });
});
