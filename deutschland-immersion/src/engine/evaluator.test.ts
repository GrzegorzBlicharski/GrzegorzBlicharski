import { describe, expect, it } from 'vitest';
import { evaluate } from './evaluator';
import { genericIssues } from './genericRules';
import type { FreeInputSpec } from './types';

const askPlatform: FreeInputSpec = {
  task: 'Fragen Sie, von welchem Gleis die S5 Richtung Strausberg fährt.',
  register: 'formal',
  targets: ['w-fragen', 'dativ-praep'],
  required: [
    { id: 'line', label: 'die Linie (S5)', patterns: ['s ?5', 'strausberg'] },
    { id: 'where', label: 'nach dem Gleis fragen', patterns: ['gleis', 'wo (faehrt|fahrt)', 'bahnsteig'] },
  ],
  bonuses: [
    { pattern: 'entschuldigung|entschuldigen sie', dimension: 'register', note: 'Höflicher Einstieg', weight: 10 },
    { pattern: 'koennten sie|wuerden sie', dimension: 'naturalness', note: 'Höfliche Frage mit Konjunktiv II', weight: 20 },
    { pattern: 'von welchem gleis', dimension: 'idiomaticity', note: 'Präzise Frage mit Dativ', weight: 25 },
  ],
  models: ['Entschuldigung, könnten Sie mir sagen, von welchem Gleis die S5 Richtung Strausberg fährt?'],
  onFail: 'a', onPartial: 'b', onSuccess: 'c',
};

describe('evaluator', () => {
  it('rewards a native-like, polite question', () => {
    const e = evaluate('Entschuldigung, könnten Sie mir sagen, von welchem Gleis die S5 nach Strausberg fährt?', askPlatform);
    expect(['professional', 'native']).toContain(e.tier);
  });

  it('flags du with a stranger', () => {
    const e = evaluate('Hallo, kannst du mir sagen, wo die S5 fährt? Welches Gleis?', askPlatform);
    expect(e.tier).toBe('understandable');
    expect(e.issues.some((i) => i.target === 'du-sie')).toBe(true);
  });

  it('flags wrong case after von', () => {
    const e = evaluate('Von welches Gleis fährt die S5? Ist das von die Gleis 16?', askPlatform);
    expect(e.issues.some((i) => i.target === 'dativ-praep' || i.target === 'genus')).toBe(true);
    expect(e.tier).not.toBe('natural');
  });

  it('plain correct answer is only "correct" or natural, not inflated', () => {
    const e = evaluate('Wo fährt die S5 ab? Welches Gleis?', askPlatform);
    expect(['correct', 'natural']).toContain(e.tier);
  });

  it('rejects Polish/English', () => {
    expect(evaluate('Gdzie jest peron dla S5?', askPlatform).tier).toBe('incorrect');
    expect(evaluate('Where is the platform for the S5 please?', askPlatform).tier).toBe('incorrect');
  });

  it('missing content is not success', () => {
    const e = evaluate('Guten Morgen, wie geht es Ihnen?', askPlatform);
    expect(e.tier).toBe('incorrect');
  });

  it('tolerates small typos in key words', () => {
    const spec: FreeInputSpec = { ...askPlatform, required: [{ id: 's', label: 'Straße', patterns: ['Friedrichstraße'] }] };
    const e = evaluate('Ich muss zur Friedrichstrase, bitte.', spec);
    expect(e.missing).toHaveLength(0);
  });
});

describe('generic rules', () => {
  const g = (s: string, register: 'formal' | 'informal' = 'formal') => genericIssues(s, { register, mode: 'write' }).map((i) => i.target ?? i.category);
  it('verb-final in subordinate clauses', () => {
    expect(g('Ich komme später, weil ich bin neu hier.')).toContain('nebensatz-verbend');
    expect(g('Ich komme später, weil ich neu hier bin.')).not.toContain('nebensatz-verbend');
    expect(g('Ich weiß nicht, ob ich hier richtig bin.')).not.toContain('nebensatz-verbend');
  });
  it('V2 inversion', () => {
    expect(g('Heute ich habe keine Zeit.')).toContain('v2-inversion');
    expect(g('Heute habe ich keine Zeit.')).not.toContain('v2-inversion');
  });
  it('perfekt with sein', () => {
    expect(g('Ich habe heute in Berlin angekommen.')).toContain('perfekt-sein');
    expect(g('Ich bin heute in Berlin angekommen.')).not.toContain('perfekt-sein');
  });
  it('gender', () => {
    expect(g('Wo ist die Gleis?')).toContain('genus');
    expect(g('Der Vertrag liegt auf dem Tisch.')).not.toContain('genus');
    expect(g('Ich spreche mit der Vermieterin über die Kaution.')).not.toContain('genus');
    expect(g('Die Koffer sind schwer.')).not.toContain('genus');
  });
  it('genitive prepositions are a register note, not an error', () => {
    const issues = genericIssues('Wegen dem Streik komme ich später.', { register: 'formal', mode: 'write' });
    expect(issues.find((i) => i.target === 'gen-prep')?.severity).toBe(1);
  });
});
