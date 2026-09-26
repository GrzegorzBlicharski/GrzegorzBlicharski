import type { CEFR } from './types';
import { cefrOf, levelAtLeast, overallRating, type LanguageProfile } from './languageModel';

/**
 * Difficulty engine. The world adapts to demonstrated level:
 * B1 — help is available; B2 — help costs credit; C1 — subtitles off in calls,
 * stricter grading, faster speech; C2 — the world stops adapting.
 */
export interface Difficulty {
  level: CEFR;
  strictness: number;
  ttsRate: number;
  glossPolicy: 'free' | 'costly' | 'none';
  callSubtitles: 'shown' | 'hidden' | 'none';
  timerFactor: number;
  label: string;
}

export function difficulty(p: LanguageProfile, overrides?: { hints?: 'auto' | 'always' | 'never'; subtitles?: 'auto' | 'always' | 'never' }): Difficulty {
  const level = cefrOf(overallRating(p));
  let d: Difficulty;
  if (levelAtLeast(level, 'C2')) d = { level, strictness: 1.6, ttsRate: 1.2, glossPolicy: 'none', callSubtitles: 'none', timerFactor: 0.7, label: 'Die Welt passt sich nicht mehr an.' };
  else if (levelAtLeast(level, 'C1')) d = { level, strictness: 1.4, ttsRate: 1.12, glossPolicy: 'costly', callSubtitles: 'hidden', timerFactor: 0.8, label: 'Hilfe nur noch begrenzt.' };
  else if (levelAtLeast(level, 'B2')) d = { level, strictness: 1.2, ttsRate: 1.02, glossPolicy: 'costly', callSubtitles: 'hidden', timerFactor: 0.9, label: 'Hilfe kostet Punkte.' };
  else d = { level, strictness: 1, ttsRate: 0.94, glossPolicy: 'free', callSubtitles: 'hidden', timerFactor: 1, label: 'Die Welt hilft Ihnen noch.' };

  if (overrides?.hints === 'always') d.glossPolicy = 'free';
  if (overrides?.hints === 'never') d.glossPolicy = 'none';
  if (overrides?.subtitles === 'always') d.callSubtitles = 'shown';
  if (overrides?.subtitles === 'never') d.callSubtitles = 'none';
  return d;
}
