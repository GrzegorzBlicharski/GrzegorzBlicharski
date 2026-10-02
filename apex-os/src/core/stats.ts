/** Small, transparent statistics toolkit. Prefer robust, explainable measures over formal tests. */

export function sum(xs: number[]): number {
  let s = 0;
  for (const x of xs) s += x;
  return s;
}

export function mean(xs: number[]): number | null {
  return xs.length ? sum(xs) / xs.length : null;
}

export function median(xs: number[]): number | null {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

/** Linear-interpolated percentile, p in [0,100]. */
export function percentile(xs: number[], p: number): number | null {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  const idx = (p / 100) * (s.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  return s[lo] + (s[hi] - s[lo]) * (idx - lo);
}

export function variance(xs: number[]): number | null {
  if (xs.length < 2) return null;
  const m = sum(xs) / xs.length;
  let v = 0;
  for (const x of xs) v += (x - m) ** 2;
  return v / (xs.length - 1);
}

export function stdev(xs: number[]): number | null {
  const v = variance(xs);
  return v == null ? null : Math.sqrt(v);
}

/** Median absolute deviation (unscaled). */
export function mad(xs: number[]): number | null {
  const m = median(xs);
  if (m == null) return null;
  return median(xs.map((x) => Math.abs(x - m)));
}

/** Robust SD estimate: 1.4826 × MAD. */
export function robustSd(xs: number[]): number | null {
  const d = mad(xs);
  return d == null ? null : 1.4826 * d;
}

/** Theil–Sen slope over (x, y) pairs. O(n²) — inputs are daily series (≤ a few hundred points). */
export function theilSen(xs: number[], ys: number[]): number | null {
  const n = Math.min(xs.length, ys.length);
  if (n < 2) return null;
  const slopes: number[] = [];
  // Subsample deterministically for very long series to bound cost.
  const step = n > 400 ? Math.ceil(n / 400) : 1;
  for (let i = 0; i < n; i += step) {
    for (let j = i + step; j < n; j += step) {
      const dx = xs[j] - xs[i];
      if (dx !== 0) slopes.push((ys[j] - ys[i]) / dx);
    }
  }
  return median(slopes);
}

/** Ordinary least squares slope & intercept. */
export function ols(xs: number[], ys: number[]): { slope: number; intercept: number } | null {
  const n = Math.min(xs.length, ys.length);
  if (n < 2) return null;
  const mx = sum(xs.slice(0, n)) / n;
  const my = sum(ys.slice(0, n)) / n;
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - mx) * (ys[i] - my);
    den += (xs[i] - mx) ** 2;
  }
  if (den === 0) return null;
  const slope = num / den;
  return { slope, intercept: my - slope * mx };
}

function ranks(xs: number[]): number[] {
  const idx = xs.map((x, i) => [x, i] as const).sort((a, b) => a[0] - b[0]);
  const r = new Array<number>(xs.length);
  let i = 0;
  while (i < idx.length) {
    let j = i;
    while (j + 1 < idx.length && idx[j + 1][0] === idx[i][0]) j++;
    const avg = (i + j) / 2 + 1;
    for (let k = i; k <= j; k++) r[idx[k][1]] = avg;
    i = j + 1;
  }
  return r;
}

export function pearson(xs: number[], ys: number[]): number | null {
  const n = Math.min(xs.length, ys.length);
  if (n < 3) return null;
  const mx = sum(xs) / n;
  const my = sum(ys) / n;
  let sxy = 0;
  let sxx = 0;
  let syy = 0;
  for (let i = 0; i < n; i++) {
    sxy += (xs[i] - mx) * (ys[i] - my);
    sxx += (xs[i] - mx) ** 2;
    syy += (ys[i] - my) ** 2;
  }
  if (sxx === 0 || syy === 0) return null;
  return sxy / Math.sqrt(sxx * syy);
}

export function spearman(xs: number[], ys: number[]): number | null {
  if (xs.length !== ys.length || xs.length < 3) return null;
  return pearson(ranks(xs), ranks(ys));
}

/** Approximate 95% CI for Spearman rho via Fisher z (SE = 1.06/√(n−3)). */
export function spearmanCI(rho: number, n: number): [number, number] | null {
  if (n < 5) return null;
  const r = Math.max(-0.999, Math.min(0.999, rho));
  const z = 0.5 * Math.log((1 + r) / (1 - r));
  const se = 1.06 / Math.sqrt(n - 3);
  const t = (v: number) => (Math.exp(2 * v) - 1) / (Math.exp(2 * v) + 1);
  return [t(z - 1.96 * se), t(z + 1.96 * se)];
}

/** Cohen's d with pooled SD (b − a). */
export function cohensD(a: number[], b: number[]): number | null {
  if (a.length < 2 || b.length < 2) return null;
  const va = variance(a)!;
  const vb = variance(b)!;
  const pooled = Math.sqrt(((a.length - 1) * va + (b.length - 1) * vb) / (a.length + b.length - 2));
  if (pooled === 0) return null;
  return (sum(b) / b.length - sum(a) / a.length) / pooled;
}

/** Normalised Shannon entropy in [0,1] — 1 = perfectly balanced. */
export function normalizedEntropy(weights: number[]): number | null {
  const pos = weights.filter((w) => w > 0);
  const total = sum(pos);
  if (pos.length === 0 || total === 0) return null;
  if (weights.length <= 1) return 1;
  let h = 0;
  for (const w of pos) {
    const p = w / total;
    h -= p * Math.log(p);
  }
  return h / Math.log(weights.length);
}

export function clamp(x: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, x));
}

export function round(x: number | null | undefined, digits = 1): number | null {
  if (x == null || !Number.isFinite(x)) return null;
  const f = 10 ** digits;
  return Math.round(x * f) / f;
}

/** Round a probability to the nearest 5% and clamp to [5%, 95%] — the models cannot justify more precision. */
export function honestProbability(p: number): number {
  return clamp(Math.round(p * 20) / 20, 0.05, 0.95);
}

export type Confidence = "LOW" | "MEDIUM" | "HIGH";
export const CONFIDENCE_FACTOR: Record<Confidence, number> = { LOW: 0.4, MEDIUM: 0.7, HIGH: 1 };

/** Generic sample-size based confidence for descriptive findings. */
export function confidenceFromN(n: number, medium = 14, high = 45): Confidence {
  return n >= high ? "HIGH" : n >= medium ? "MEDIUM" : "LOW";
}
