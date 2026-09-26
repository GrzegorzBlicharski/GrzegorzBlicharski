import type { CEFR, Condition, FreeInputSpec, MissionStatus, SkillId } from './types';
import { CEFR_RATING, cefrOf, levelAtLeast, overallRating, type LanguageProfile } from './languageModel';

export interface PlayerInfo {
  first: string;
  last: string;
  anrede: 'Herr' | 'Frau' | '';
}

export interface ConditionState {
  flags: Record<string, boolean>;
  items: string[];
  missions: Record<string, { status: MissionStatus }>;
  rel: Record<string, number>;
  lang: LanguageProfile;
}

export function checkCondition(c: Condition | undefined, s: ConditionState): boolean {
  if (!c) return true;
  if ('all' in c) return c.all.every((x) => checkCondition(x, s));
  if ('any' in c) return c.any.some((x) => checkCondition(x, s));
  if ('flag' in c) return !!s.flags[c.flag] === (c.is ?? true);
  if ('item' in c) return s.items.includes(c.item) === (c.has ?? true);
  if ('mission' in c) return (s.missions[c.mission]?.status ?? 'locked') === c.status;
  if ('rel' in c) {
    const v = s.rel[c.rel] ?? 0;
    return (c.min === undefined || v >= c.min) && (c.max === undefined || v <= c.max);
  }
  if ('level' in c) return levelAtLeast(cefrOf(overallRating(s.lang)), c.level);
  return true;
}

/** Replace {first} {last} {name} {anrede} and {g:masc|fem|neutral} in authored text. */
export function interpolate(text: string, p: PlayerInfo): string {
  const g = p.anrede === 'Herr' ? 0 : p.anrede === 'Frau' ? 1 : 2;
  return text
    .replace(/\{g:([^}]*)\}/g, (_, opts: string) => {
      const parts = opts.split('|');
      return parts[g] ?? parts[parts.length - 1] ?? '';
    })
    .replace(/\{first\}/g, p.first || 'Alex')
    .replace(/\{last\}/g, p.last || '')
    .replace(/\{name\}/g, `${p.first} ${p.last}`.trim())
    .replace(/\{anrede\}/g, p.anrede ? `${p.anrede} ${p.last}` : `${p.first} ${p.last}`.trim());
}

const escapeRx = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Interpolate a FreeInputSpec (patterns get regex-escaped values). */
export function interpolateSpec(spec: FreeInputSpec, p: PlayerInfo): FreeInputSpec {
  const safe: PlayerInfo = { first: escapeRx(p.first || 'alex'), last: escapeRx(p.last || 'xxxxxx'), anrede: p.anrede };
  const pat = (x: string) =>
    x.replace(/\{first\}/g, safe.first).replace(/\{last\}/g, safe.last);
  return {
    ...spec,
    task: interpolate(spec.task, p),
    models: spec.models.map((m) => interpolate(m, p)),
    required: spec.required.map((r) => ({ ...r, patterns: r.patterns.map(pat) })),
  };
}

/** Average rating of the targets a task trains (its difficulty). */
export function taskRating(levels: CEFR[]): number {
  if (!levels.length) return 300;
  return levels.reduce((a, l) => a + CEFR_RATING[l], 0) / levels.length + 60;
}

export function xpLevel(xp: number): { level: number; into: number; next: number } {
  const level = Math.floor(Math.sqrt(xp / 60)) + 1;
  const cur = 60 * (level - 1) ** 2;
  const nxt = 60 * level ** 2;
  return { level, into: xp - cur, next: nxt - cur };
}

export const SKILL_FOR_MODE: Record<string, SkillId> = { speak: 'speaking', write: 'writing', translate: 'translation' };

/** Game clock helpers ("HH:MM"). */
export function timeOfDay(t: string): 'dawn' | 'day' | 'evening' | 'night' {
  const h = parseInt(t.split(':')[0], 10);
  if (h < 8) return 'dawn';
  if (h < 17) return 'day';
  if (h < 20) return 'evening';
  return 'night';
}
