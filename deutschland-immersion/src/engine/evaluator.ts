import type { Dimension, EvalIssue, Evaluation, FreeInputSpec, Tier } from './types';
import { detectForeign, fuzzyFind, norm, rx, similarity, words } from './text';
import { genericIssues } from './genericRules';

/**
 * Rule-based multi-dimensional evaluator.
 *
 * Honest by design: it grades what it can verify (content coverage, known error
 * patterns, register markers, terminology, numbers) and never inflates praise.
 * A plain correct answer is "Korrekt" — "Natürlich" and above require positive
 * evidence (idiomatic markers or closeness to a native model answer).
 * An optional AI reviewer (see aiReviewer.ts) can refine the result.
 */

export interface EvalContext {
  /** Difficulty multiplier from the difficulty engine: >1 = stricter. */
  strictness?: number;
}

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

export function evaluate(input: string, spec: FreeInputSpec, ctx: EvalContext = {}): Evaluation {
  const strict = ctx.strictness ?? 1;
  const raw = input.trim();
  const text = norm(raw);
  const targetLang = spec.source?.lang === 'de' ? 'pl' : 'de';
  const mode = spec.mode ?? 'write';
  const issues: EvalIssue[] = [];
  const strengths: string[] = [];
  const bestModel = spec.models[0] ?? '';

  const base: Evaluation = {
    tier: 'incorrect',
    score: 0,
    dims: { correctness: 0, naturalness: 0, precision: 0, register: 0, style: 0, idiomaticity: 0 },
    issues,
    strengths,
    missing: spec.required.map((r) => r.label),
    model: bestModel,
    source: 'rules',
  };

  // ---- guard rails
  if (words(raw).length < Math.max(1, spec.minWords ?? 2)) {
    issues.push({ category: 'writing', severity: 3, message: 'Die Antwort ist zu kurz, um verstanden zu werden.' });
    base.keyImprovement = 'Formulieren Sie einen vollständigen Satz.';
    return base;
  }
  if (targetLang === 'de') {
    const foreign = detectForeign(raw);
    if (foreign) {
      issues.push({
        category: 'vocabulary',
        severity: 3,
        message: foreign === 'pl' ? 'Das ist Polnisch – Ihr Gegenüber versteht Sie nicht.' : 'Das ist (teilweise) Englisch – in Berlin klappt das manchmal, aber hier nicht.',
      });
      base.keyImprovement = 'Antworten Sie auf Deutsch – auch einfach ist besser als gar nicht.';
      return base;
    }
  }

  // ---- content coverage
  const missing: string[] = [];
  let found = 0;
  for (const el of spec.required) {
    let hit = el.patterns.some((p) => rx(p).test(text));
    if (!hit) {
      // typo tolerance for plain single-word patterns
      for (const p of el.patterns) {
        if (/^[\p{L}ß-]+$/u.test(p) && p.length >= 6) {
          const t = fuzzyFind(raw, p);
          if (t) {
            hit = true;
            issues.push({ category: 'writing', severity: 1, message: `Rechtschreibung: „${t}“ → „${p}“.`, fix: p });
            break;
          }
        }
      }
    }
    if (hit) found++;
    else missing.push(el.label);
  }
  const coverage = spec.required.length ? found / spec.required.length : 1;

  // ---- terminology (translation)
  let termPenalty = 0;
  for (const t of spec.terms ?? []) {
    const ok = t.accept.some((p) => rx(p).test(text));
    if (!ok) {
      termPenalty += 1;
      issues.push({ target: undefined, category: 'terminology', severity: 3, message: `Terminologie: „${t.term}“ wurde nicht fachgerecht wiedergegeben.` });
    }
    for (const r of t.reject ?? []) {
      if (rx(r.pattern).test(text)) {
        termPenalty += 1;
        issues.push({ category: 'terminology', severity: 3, message: r.message });
      }
    }
  }

  // ---- numbers must survive translation
  if (spec.source && spec.checkNumbers !== false) {
    const nums = (spec.source.text.match(/\d[\d.,\s]*\d|\d/g) ?? []).map((n) => n.replace(/[^\d]/g, ''));
    const outNums = (raw.match(/\d[\d.,\s]*\d|\d/g) ?? []).map((n) => n.replace(/[^\d]/g, ''));
    for (const n of nums) {
      const okNum = outNums.some((o) => o === n || o.replace(/0+$/, '') === n.replace(/0+$/, ''));
      if (!okNum) issues.push({ target: 'uebersetzung-zahlen', category: 'translation', severity: 3, message: `Zahl/Datum „${n}“ aus dem Ausgangstext fehlt oder wurde verändert.` });
    }
  }

  // ---- spec-specific error patterns
  for (const r of spec.errors ?? []) {
    const m = text.match(rx(r.pattern));
    if (m) issues.push({ target: r.target, category: r.category, severity: r.severity, message: r.message, pl: r.pl, match: m[0], fix: r.fix });
  }

  // ---- generic German checks
  if (targetLang === 'de') {
    const gi = genericIssues(raw, { register: spec.register, mode });
    for (const g of gi) if (!issues.some((i) => i.message === g.message)) issues.push(g);
  }

  // ---- bonuses (positive evidence)
  const bonus: Record<Dimension, number> = { correctness: 0, naturalness: 0, precision: 0, register: 0, style: 0, idiomaticity: 0 };
  for (const b of spec.bonuses ?? []) {
    if (rx(b.pattern).test(text)) {
      bonus[b.dimension] += b.weight ?? 15;
      strengths.push(b.note);
    }
  }
  const sim = Math.max(0, ...spec.models.map((m) => similarity(raw, m)));
  if (sim >= 0.75) strengths.push('Sehr nah an einer muttersprachlichen Formulierung.');

  // ---- dimension scores
  const sev = (cats: string[] | null, s: 1 | 2 | 3) =>
    issues.filter((i) => i.severity === s && (cats === null || cats.includes(i.category))).length;
  const gram = ['grammar', 'cases', 'gender', 'articles', 'tense', 'wordOrder', 'syntax', 'adjectiveEndings', 'prepositions'];
  const correctness = 100 - (sev(gram, 3) * 30 + sev(gram, 2) * 16 + sev(gram, 1) * 6) * strict;
  const registerScore = 80 - (sev(['register'], 2) * 35 + sev(['register'], 1) * 12) * strict + bonus.register;
  const precision = coverage * 85 - termPenalty * 25 - sev(['translation', 'terminology'], 3) * 10 + bonus.precision + (coverage === 1 ? 10 : 0);
  const naturalness = 55 + bonus.naturalness + sim * 35 - sev(['idioms', 'collocation', 'register'], 1) * 8 * strict;
  const idiomaticity = 45 + bonus.idiomaticity + sim * 40;
  const style = 65 + bonus.style - sev(['writing', 'professional'], 1) * 8 - sev(['writing', 'professional'], 2) * 15;

  const dims: Record<Dimension, number> = {
    correctness: clamp(correctness),
    naturalness: clamp(naturalness),
    precision: clamp(precision),
    register: clamp(registerScore),
    style: clamp(style),
    idiomaticity: clamp(idiomaticity),
  };

  // ---- tier
  const major = issues.filter((i) => i.severity >= 2).length;
  const critical = issues.filter((i) => i.severity === 3).length;
  let tier: Tier;
  if (coverage < 0.5 || (critical >= 1 && coverage < 1) || critical >= 2) tier = 'incorrect';
  else if (coverage < 1 || major >= 1 || critical >= 1) tier = 'understandable';
  else if (issues.some((i) => i.severity === 1)) tier = 'correct';
  else if (dims.naturalness >= 75 || dims.idiomaticity >= 75) {
    tier = 'natural';
    if (spec.register === 'formal' && dims.register >= 90) tier = 'professional';
    if (dims.idiomaticity >= 85 && dims.naturalness >= 85) tier = 'native';
  } else tier = 'correct';

  // The score never contradicts the tier.
  const CAP: Record<Tier, [number, number]> = { incorrect: [0, 35], understandable: [36, 60], correct: [61, 78], natural: [79, 89], professional: [90, 95], native: [96, 100] };
  const raw100 = tier === 'incorrect' ? (dims.correctness + dims.precision) / 5 : dims.correctness * 0.3 + dims.precision * 0.3 + dims.register * 0.15 + dims.naturalness * 0.15 + dims.idiomaticity * 0.1;
  const score = clamp(Math.max(CAP[tier][0], Math.min(CAP[tier][1], raw100)));

  // ---- the one most important improvement
  const sorted = [...issues].sort((a, b) => b.severity - a.severity);
  let keyImprovement: string | undefined;
  if (missing.length) keyImprovement = `Inhalt fehlt: ${missing[0]}.`;
  else if (sorted[0]) keyImprovement = sorted[0].message;
  else if (tier === 'correct') keyImprovement = `Korrekt. Natürlicher klingt es so: „${bestModel}“`;

  const pick = spec.models.map((m) => ({ m, s: similarity(raw, m) })).sort((a, b) => b.s - a.s)[0];

  return { tier, score, dims, issues: sorted, strengths, missing, keyImprovement, model: tier === 'native' ? pick?.m ?? bestModel : bestModel, source: 'rules' };
}

export function tierBucket(t: Tier): 'fail' | 'partial' | 'success' {
  if (t === 'incorrect') return 'fail';
  if (t === 'understandable') return 'partial';
  return 'success';
}
