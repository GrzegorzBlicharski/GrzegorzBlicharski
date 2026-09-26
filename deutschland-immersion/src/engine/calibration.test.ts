import { describe, expect, it } from 'vitest';
import { DIALOGUES } from '../content';
import { evaluate } from './evaluator';
import { interpolateSpec } from './logic';

const P = { first: 'Grzegorz', last: 'Nowak', anrede: 'Herr' as const };
const spec = (d: string, n: string) => interpolateSpec(DIALOGUES[d].nodes[n].input!, P);
const tier = (d: string, n: string, text: string) => evaluate(text, spec(d, n)).tier;

describe('calibration on realistic learner answers', () => {
  it('Pohl: simple but fine question is not inflated', () => {
    expect(['correct', 'natural']).toContain(tier('hbf_pohl', 'p2', 'Wo fährt die S5 nach Strausberg ab? Welches Gleis?'));
  });
  it('Pohl: typical case error', () => {
    expect(tier('hbf_pohl', 'p2', 'Entschuldigung, von welches Gleis fährt die S5 nach Strausberg?')).toBe('understandable');
  });
  it('Café: anglicism order is only correct, not natural', () => {
    expect(tier('cafe_order', 'c2', 'Kann ich einen Kaffee und ein Croissant haben?')).toBe('correct');
  });
  it('Café: missing food is not success', () => {
    expect(['understandable', 'incorrect']).toContain(tier('cafe_order', 'c2', 'Einen Kaffee, bitte.'));
  });
  it('Call: halb drei misheard as 15:30 fails', () => {
    expect(tier('call_kessler', 'ca4', 'Ja, ich komme um 15:30 in die Friedrichstraße 148.')).toBe('incorrect');
  });
  it('Email: informal greeting and missing points', () => {
    const t = tier('k_desk', 'm2', 'Hallo Jana, die Vertragsstrafe ist falsch, 25.000 statt 250.000. Das Datum ist auch falsch, 2026 statt 2027. LG Grzegorz');
    expect(['understandable', 'incorrect']).toContain(t);
  });
  it('Translation: odstąpienie is flagged', () => {
    expect(tier('k_desk', 't5', 'Prawo do odstąpienia od umowy z ważnej przyczyny pozostaje nienaruszone.')).toBe('incorrect');
  });
  it('Translation: Geldstrafe is flagged', () => {
    const e = evaluate('Sehr geehrte Frau Kessler, mein Klient hat die polnische Version bereits akzeptiert. Wir erwarten, dass die Geldstrafe wie vereinbart 25.000 Euro beträgt.', spec('k_desk', 't2'));
    expect(e.issues.some((i) => i.message.includes('Geldstrafe'))).toBe(true);
    expect(['understandable', 'incorrect']).toContain(e.tier);
  });
  it('Negotiation: accusation is penalised', () => {
    expect(tier('dinner_main', 'dn8', 'Sie wollen meinen Mandanten betrügen! Die Vertragsstrafe ist falsch, wir müssen das korrigieren.')).toBe('understandable');
  });
  it('Negotiation: solid but plain proposal is at most correct/natural', () => {
    expect(['correct', 'natural', 'professional']).toContain(tier('dinner_main', 'dn8', 'Die polnische Fassung weicht ab: Die Vertragsstrafe ist 25.000 statt 250.000 Euro. Wir sollten das vor der Unterschrift korrigieren.'));
  });
});
