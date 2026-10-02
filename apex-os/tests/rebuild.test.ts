import { describe, it, expect } from "vitest";
import { rebuildProjections } from "@/data/store";
import { PROJECTION_TABLES } from "@/data/migrations";
import { fictional } from "./helpers";

describe("event sourcing", () => {
  it("incremental projection equals full replay on a 2-year fictional dataset", () => {
    const { db } = fictional();
    const snapshot = () =>
      Object.fromEntries(
        PROJECTION_TABLES.filter((t) => t !== "ux_entries" && t !== "imports" && t !== "vocab_reviews" && t !== "goal_progress").map((t) => [t, db.prepare(`SELECT * FROM ${t} ORDER BY 1, 2`).all()]),
      );
    const before = snapshot();
    const counts = Object.fromEntries(PROJECTION_TABLES.map((t) => [t, (db.prepare(`SELECT COUNT(*) n FROM ${t}`).get() as { n: number }).n]));
    rebuildProjections(db);
    expect(snapshot()).toEqual(before);
    expect(Object.fromEntries(PROJECTION_TABLES.map((t) => [t, (db.prepare(`SELECT COUNT(*) n FROM ${t}`).get() as { n: number }).n]))).toEqual(counts);
  });
});
