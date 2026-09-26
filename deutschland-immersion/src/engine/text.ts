/** Text normalisation & fuzzy helpers shared by the evaluator and the drills. */

const UMLAUT: Record<string, string> = { ä: 'ae', ö: 'oe', ü: 'ue', ß: 'ss', Ä: 'ae', Ö: 'oe', Ü: 'ue', ẞ: 'ss' };

/** Lower-case, fold German umlauts to ae/oe/ue/ss, unify quotes & whitespace. Polish letters are kept. */
export function norm(s: string): string {
  return s
    .replace(/[äöüßÄÖÜẞ]/g, (c) => UMLAUT[c])
    .toLowerCase()
    .replace(/[„“”«»]/g, '"')
    .replace(/[‘’‚]/g, "'")
    .replace(/[–—]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Compile an authored pattern (may contain umlauts) against normalised text. */
export function rx(pattern: string, flags = 'i'): RegExp {
  return new RegExp(norm(pattern).replace(/\\ /g, ' '), flags);
}

export function words(s: string): string[] {
  return norm(s)
    .replace(/[^a-z0-9ąćęłńóśźż\s-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[b.length];
}

/** Allowed typo distance for a word of given length. */
export function typoBudget(len: number): number {
  if (len >= 10) return 2;
  if (len >= 6) return 1;
  return 0;
}

/** Find a token in text within typo budget of `word`; returns the matched token or null. */
export function fuzzyFind(text: string, word: string): string | null {
  const w = norm(word);
  const budget = typoBudget(w.length);
  if (budget === 0) return null;
  for (const t of words(text)) {
    if (Math.abs(t.length - w.length) > budget) continue;
    if (levenshtein(t, w) <= budget) return t;
  }
  return null;
}

/** Token-set similarity (Dice) between two texts, 0..1. */
export function similarity(a: string, b: string): number {
  const A = new Set(words(a));
  const B = new Set(words(b));
  if (!A.size || !B.size) return 0;
  let inter = 0;
  for (const x of A) if (B.has(x)) inter++;
  return (2 * inter) / (A.size + B.size);
}

/** Loose equality for cloze answers: normalised, punctuation-insensitive. */
export function looseEqual(a: string, b: string): boolean {
  const clean = (s: string) => norm(s).replace(/[.,!?;:"']/g, '').replace(/\s+/g, ' ').trim();
  return clean(a) === clean(b);
}

export function splitSentences(s: string): string[] {
  return s
    .split(/(?<=[.!?])\s+|\n+/)
    .map((x) => x.trim())
    .filter(Boolean);
}

const POLISH_CHARS = /[ąćęłńśźż]/i;
const POLISH_WORDS = /^(jest|nie|tak|dzień|dobry|dziękuję|dzięki|proszę|gdzie|który|która|jestem|mam|chcę|czy|się|że|już|jak|co|od|w|z)$/i;
const ENGLISH_WORDS = /\b(the|is|are|where|please|thank|you|what|which|train|platform|hello|would|can i|i am|i'm)\b/gi;

/** Detect answers written (mostly) in Polish or English. Isolated Polish names/terms are fine. */
export function detectForeign(s: string): 'pl' | 'en' | null {
  const toks = s.replace(/„[^“]*“|"[^"]*"|\([^)]*\)/g, ' ').split(/\s+/).filter(Boolean);
  if (toks.length) {
    const plChars = toks.filter((t) => POLISH_CHARS.test(t)).length;
    const plWords = toks.filter((t) => POLISH_WORDS.test(t.replace(/[^\p{L}]/gu, ''))).length;
    if (plWords >= 2 || plChars / toks.length > 0.25) return 'pl';
  }
  const en = s.match(ENGLISH_WORDS);
  if (en && en.length >= 2) return 'en';
  return null;
}
