import { describe, it, expect } from "vitest";
import { median, mad, theilSen, spearman, spearmanCI, cohensD, percentile, normalizedEntropy, honestProbability, mean, stdev } from "@/core/stats";

describe("stats", () => {
  it("basic robust measures", () => {
    expect(median([3, 1, 2])).toBe(2);
    expect(median([4, 1, 2, 3])).toBe(2.5);
    expect(median([])).toBeNull();
    expect(mad([1, 1, 2, 2, 4, 6, 9])).toBe(1);
    expect(percentile([1, 2, 3, 4, 5], 25)).toBe(2);
    expect(mean([2, 4])).toBe(3);
    expect(stdev([2, 4, 4, 4, 5, 5, 7, 9])).toBeCloseTo(2.138, 3);
  });
  it("Theil–Sen is robust to an outlier", () => {
    const xs = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    const ys = xs.map((x) => 2 * x + 1);
    ys[9] = 1000;
    expect(theilSen(xs, ys)).toBeCloseTo(2, 6);
  });
  it("Spearman handles monotonic and tied data", () => {
    expect(spearman([1, 2, 3, 4, 5], [10, 20, 30, 40, 1000])).toBeCloseTo(1, 10);
    expect(spearman([1, 2, 3, 4, 5], [5, 4, 3, 2, 1])).toBeCloseTo(-1, 10);
    expect(spearman([1, 1, 2, 2], [1, 2, 1, 2])).toBeCloseTo(0, 10);
    const ci = spearmanCI(0.5, 50)!;
    expect(ci[0]).toBeGreaterThan(0.2);
    expect(ci[1]).toBeLessThan(0.75);
  });
  it("Cohen's d sign and magnitude", () => {
    expect(cohensD([1, 2, 3, 4], [3, 4, 5, 6])).toBeCloseTo(1.549, 2);
    expect(cohensD([1], [2, 3])).toBeNull();
  });
  it("entropy and honest probability", () => {
    expect(normalizedEntropy([1, 1, 1, 1])).toBeCloseTo(1);
    expect(normalizedEntropy([1, 0, 0, 0])).toBeCloseTo(0);
    expect(honestProbability(0.834721)).toBe(0.85);
    expect(honestProbability(0.999)).toBe(0.95);
    expect(honestProbability(0.001)).toBe(0.05);
  });
});
