import { describe, expect, it } from 'vitest';
import { newProfile, pickRetrieval, recordTarget, vocabEvent, vocabStage, weaknesses, updateSkill, cefrOf } from './languageModel';
import { RETRIEVAL } from '../content';

describe('language model', () => {
  it('recognition alone cannot push mastery above 60 %', () => {
    let p = newProfile();
    for (let i = 0; i < 30; i++) p = recordTarget(p, 'genus', 1, 'recognition');
    expect(p.targets.genus.mastery).toBeLessThanOrEqual(0.6);
    for (let i = 0; i < 10; i++) p = recordTarget(p, 'genus', 1, 'production');
    expect(p.targets.genus.mastery).toBeGreaterThan(0.8);
  });

  it('errors schedule a near-term retrieval, successes expand the interval', () => {
    const t0 = 1_000_000;
    let p = recordTarget(newProfile(), 'perfekt-sein', 0, 'production', t0);
    expect(p.targets['perfekt-sein'].due - t0).toBe(10 * 60_000);
    p = recordTarget(p, 'perfekt-sein', 1, 'production', t0);
    expect(p.targets['perfekt-sein'].intervalMin).toBe(180);
    p = recordTarget(p, 'perfekt-sein', 1, 'production', t0);
    expect(p.targets['perfekt-sein'].intervalMin).toBe(1440);
  });

  it('invisible SRS picks a moment for the weakest due target', () => {
    const t0 = Date.now();
    let p = newProfile();
    p = recordTarget(p, 'perfekt-sein', 0, 'production', t0 - 3600_000);
    p = recordTarget(p, 'perfekt-sein', 0.35, 'production', t0 - 3000_000);
    p = recordTarget(p, 'uhrzeit', 1, 'production', t0 - 3000_000);
    expect(weaknesses(p, t0)[0].id).toBe('perfekt-sein');
    const sms = pickRetrieval(p, RETRIEVAL, { channel: 'sms', speakers: ['kasia'], level: 'B1' }, t0);
    expect(sms?.target).toBe('perfekt-sein');
    const talk = pickRetrieval(p, RETRIEVAL, { channel: 'dialogue', speakers: ['emre'], level: 'B1' }, t0);
    expect(talk?.target).toBe('perfekt-sein');
    // not repeated within 15 minutes
    p = { ...p, retrievalUsed: { [talk!.id]: t0 } };
    expect(pickRetrieval(p, RETRIEVAL, { channel: 'dialogue', speakers: ['emre'], level: 'B1' }, t0)?.id).not.toBe(talk!.id);
  });

  it('vocabulary: lookups do not count as mastery; production does', () => {
    let p = vocabEvent(newProfile(), ['gleis'], 'seen');
    p = vocabEvent(p, ['gleis'], 'lookup');
    expect(vocabStage(p.vocab.gleis)).toBe(1);
    const t = Date.now();
    p = vocabEvent(p, ['gleis', 'gleis'], 'produced', t);
    p = vocabEvent(p, ['gleis'], 'produced', t + 60_000);
    expect(vocabStage(p.vocab.gleis)).toBe(3); // same session counts once
    p = vocabEvent(p, ['gleis'], 'produced', t + 3600_000);
    expect(vocabStage(p.vocab.gleis)).toBe(4);
  });

  it('skills move with performance relative to task difficulty', () => {
    const p = newProfile();
    const up = updateSkill(p, 'writing', 0.95, 300);
    const down = updateSkill(p, 'writing', 0.1, 300);
    expect(up.skills.writing).toBeGreaterThan(p.skills.writing);
    expect(down.skills.writing).toBeLessThan(p.skills.writing);
    expect(cefrOf(240)).toBe('B1');
    expect(cefrOf(700)).toBe('C1');
  });
});
