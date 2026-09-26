import type { EvalIssue, PatternRule } from './types';
import { norm } from './text';

/**
 * Generic German checks applied to every German-language production.
 * They are deliberately conservative: a false alarm destroys trust faster than a missed error.
 */

type G = 'm' | 'f' | 'n';
/** Frequent nouns in the Berlin chapter with genus. `same` = plural identical to singular. */
export const NOUNS: [string, G, boolean?][] = [
  ['Gleis', 'n'], ['Zug', 'm'], ['Bahnhof', 'm'], ['Bahnsteig', 'm'], ['Fahrkarte', 'f'], ['Ticket', 'n'],
  ['Verspätung', 'f'], ['Anschluss', 'm'], ['Richtung', 'f'], ['Haltestelle', 'f'], ['Ausgang', 'm'],
  ['Koffer', 'm', true], ['Schlüssel', 'm', true], ['Wohnung', 'f'], ['Zimmer', 'n', true], ['Miete', 'f'],
  ['Kaution', 'f'], ['Vermieterin', 'f'], ['Vermieter', 'm', true], ['Hausordnung', 'f'], ['Müll', 'm'],
  ['Briefkasten', 'm', true], ['Klingel', 'f'], ['Bestätigung', 'f'], ['Anmeldung', 'f'], ['Termin', 'm'],
  ['Kaffee', 'm'], ['Milch', 'f'], ['Rechnung', 'f'], ['Tisch', 'm'], ['Café', 'n'], ['Croissant', 'n'],
  ['Büro', 'n'], ['Vertrag', 'm'], ['Klausel', 'f'], ['Frist', 'f'], ['Mandant', 'm'], ['Mandantin', 'f'],
  ['Kanzlei', 'f'], ['Besprechung', 'f'], ['Unterschrift', 'f'], ['Summe', 'f'], ['Betrag', 'm'],
  ['Spieler', 'm', true], ['Verein', 'm'], ['Berater', 'm', true], ['Vertragsstrafe', 'f'], ['Kündigung', 'f'],
  ['Problem', 'n'], ['Fehler', 'm', true], ['Unterlage', 'f'], ['Dokument', 'n'], ['Version', 'f'],
  ['Übersetzung', 'f'], ['Restaurant', 'n'], ['Abendessen', 'n', true], ['Straße', 'f'], ['Stadt', 'f'],
  ['Adresse', 'f'], ['Stock', 'm'], ['Aufzug', 'm'], ['Handy', 'n'], ['Nachricht', 'f'], ['Hotel', 'n'],
  ['Arbeit', 'f'], ['Stelle', 'f'], ['Chefin', 'f'], ['Chef', 'm'], ['Kollege', 'm'], ['Kollegin', 'f'],
  ['Bahn', 'f'], ['Linie', 'f'], ['Minute', 'f'], ['Stunde', 'f'], ['Woche', 'f'], ['Jahr', 'n'],
  ['Monat', 'm'], ['Ausweis', 'm'], ['Reisepass', 'm'], ['Formular', 'n'], ['Gesellschaft', 'f'],
];

const ART_BAD: Record<G, string[]> = {
  m: ['das', 'die'],
  f: ['das', 'den', 'dem', 'ein', 'einen', 'einem'],
  n: ['die', 'der', 'den', 'eine', 'einen', 'einer'],
};

const ADJ = String.raw`(?:\s+[a-z]+(?:e|en|er|es|em))?`;

function genderRules(): PatternRule[] {
  const rules: PatternRule[] = [];
  const label: Record<G, string> = { m: 'der', f: 'die', n: 'das' };
  for (const [noun, g, same] of NOUNS) {
    let bad = ART_BAD[g];
    // Plural identical to singular: die/den/der can be plural forms.
    if (same) bad = bad.filter((a) => a !== 'die' && a !== 'den' && a !== 'der');
    // "der" before a feminine noun is valid (Dativ/Genitiv); before neuter it's wrong.
    rules.push({
      pattern: String.raw`\b(${bad.join('|')})${ADJ}\s+${norm(noun)}\b`,
      target: 'genus',
      category: 'gender',
      severity: 2,
      message: `Genus: Es heißt „${label[g]} ${noun}“.`,
      pl: `Rodzaj: ${label[g]} ${noun}.`,
      fix: `${label[g]} ${noun}`,
    });
  }
  return rules;
}

export const GENERIC_RULES: PatternRule[] = [
  {
    pattern: String.raw`\b(mit|nach|bei|seit|von|zu|aus|gegenueber)\s+(die|das|einen|eine)\b`,
    target: 'dativ-praep',
    category: 'cases',
    severity: 2,
    message: 'Nach dieser Präposition steht immer der Dativ (dem / der / einem / einer).',
    pl: 'Po tym przyimku zawsze Dativ.',
  },
  {
    pattern: String.raw`\b(arbeite|arbeitest|arbeitet|arbeiten|wohne|wohnst|wohnt|wohnen|lebe|lebt|leben|bin|bist|ist|sind|studiere|studiert)\s+(jetzt\s+|seit\s+\w+\s+|hier\s+)?in\s+(eine|die|das|einen)\b`,
    target: 'wechselpraep',
    category: 'prepositions',
    severity: 2,
    message: 'Wo? → Dativ: „in einer Kanzlei“, „in der Stadt“, „im Büro“.',
    pl: 'Gdzie? → Dativ: in einer / in der / im.',
  },
  {
    pattern: String.raw`\b(fuer|durch|gegen|ohne)\s+(dem|einem|einer)\b`,
    target: 'akk-praep',
    category: 'cases',
    severity: 2,
    message: 'Nach „für / durch / gegen / ohne“ steht immer der Akkusativ.',
    pl: 'Po für / durch / gegen / ohne zawsze Akkusativ.',
  },
  {
    pattern: String.raw`\b(wegen|trotz|waehrend)\s+(dem|einem)\b`,
    target: 'gen-prep',
    category: 'register',
    severity: 1,
    message: '„wegen dem“ ist umgangssprachlich. Standard und Beruf: „wegen des …“ (Genitiv).',
    pl: 'Potocznie OK, ale w języku standardowym: Genitiv (wegen des …).',
  },
  {
    pattern: String.raw`\b(habe|hab|hast|hat|haben|habt)\b[^.?!]{0,40}\b(gegangen|gekommen|geflogen|gelaufen|angekommen|eingestiegen|umgestiegen|ausgestiegen|geblieben|passiert|gewesen|geworden|aufgestanden|eingezogen|umgezogen)\b`,
    target: 'perfekt-sein',
    category: 'tense',
    severity: 2,
    message: 'Dieses Verb bildet das Perfekt mit „sein“: „ich bin … angekommen / gegangen / gewesen“.',
    pl: 'Perfekt z „sein“ (czasownik ruchu / zmiany stanu).',
  },
  {
    pattern: String.raw`\b(weil|dass|ob|obwohl|wenn|damit|bevor|nachdem|sodass)\s+(ich|du|er|sie|es|wir|ihr|man)\s+(bin|bist|ist|sind|seid|habe|hast|hat|haben|habt|kann|kannst|koennen|muss|musst|muessen|will|willst|wollen|werde|wird|werden|moechte|moechten|war|waren|hatte|hatten|brauche|suche|komme|fahre|weiss)\s+(?![.,!?]|$)`,
    target: 'nebensatz-verbend',
    category: 'wordOrder',
    severity: 2,
    message: 'Im Nebensatz steht das konjugierte Verb am Ende: „…, weil ich neu hier bin.“',
    pl: 'W zdaniu podrzędnym czasownik na końcu.',
  },
];

const V2_RX = /(^|[.!?]\s+)(heute|morgen|dann|danach|jetzt|leider|vielleicht|hier|gestern|spaeter|zuerst|natuerlich|eigentlich|deshalb|trotzdem|ausserdem|gleich|dort|da)\s+(ich|wir|er|sie|du|es|man)\s+[a-z]+/i;

const FORMAL_DU = /\b(du|dich|dir|dein|deine|deinen|deinem|deiner|kannst|hast|bist|willst|musst)\b/i;
const ANGLICISMS: [RegExp, string][] = [
  [/\bmeeting\b/i, 'Besprechung / Termin'],
  [/\bdeadline\b/i, 'Frist'],
  [/\bcall\b/i, 'Telefonat / Gespräch'],
  [/\b(checken|gecheckt|checke)\b/i, 'prüfen / durchsehen'],
  [/\bsorry\b/i, 'Entschuldigung / Es tut mir leid'],
  [/\b(okay|ok)\b/i, 'in Ordnung / einverstanden'],
];

const GENDER_RULES = genderRules();

export interface GenericContext {
  register: 'formal' | 'informal' | 'any';
  mode: 'speak' | 'write' | 'translate';
}

/** Run generic checks on original (non-normalised) text. */
export function genericIssues(original: string, ctx: GenericContext): EvalIssue[] {
  const text = norm(original);
  const issues: EvalIssue[] = [];
  const seen = new Set<string>();
  const push = (i: EvalIssue) => {
    const key = i.message;
    if (seen.has(key)) return;
    seen.add(key);
    issues.push(i);
  };

  for (const r of [...GENERIC_RULES, ...GENDER_RULES]) {
    const m = text.match(new RegExp(r.pattern, 'i'));
    if (m) push({ target: r.target, category: r.category, severity: r.severity, message: r.message, pl: r.pl, match: m[0], fix: r.fix });
  }

  const v2 = text.match(V2_RX);
  if (v2) {
    push({
      target: 'v2-inversion',
      category: 'wordOrder',
      severity: 2,
      message: `Verbzweitstellung: Nach „${cap(v2[2])}“ kommt zuerst das Verb, dann „${v2[3]}“ (z. B. „${cap(v2[2])} komme ich …“).`,
      pl: 'Czasownik musi być na drugiej pozycji.',
      match: v2[0].trim(),
    });
  }

  if (ctx.register === 'formal') {
    // Only flag "du"-forms that address the listener (ignore quoted speech).
    const m = original.replace(/„[^“]*“|"[^"]*"/g, '').match(FORMAL_DU);
    if (m) {
      push({
        target: 'du-sie',
        category: 'register',
        severity: 2,
        message: `„${m[0]}“: In dieser Situation sprechen Sie die Person mit „Sie“ an.`,
        pl: 'W tej sytuacji forma „Sie“.',
        match: m[0],
      });
    }
    for (const [re, alt] of ANGLICISMS) {
      const a = original.match(re);
      if (a) push({ category: 'register', severity: 1, message: `„${a[0]}“ wirkt hier zu salopp / anglizistisch. Besser: ${alt}.`, match: a[0] });
    }
    if (/\b(ich will|ich wuerde gern haben|kann ich haben)\b/i.test(text)) {
      push({ target: 'hoeflichkeit-k2', category: 'register', severity: 1, message: '„Ich will …“ / „Kann ich … haben“ klingt fordernd bzw. wie aus dem Englischen übersetzt. Natürlicher: „Ich hätte gern …“, „Könnten Sie …?“' });
    }
  }
  if (ctx.register === 'informal' && /\b(Ihnen|Ihre[nmrs]?)\b/.test(original)) {
    push({ target: 'du-sie', category: 'register', severity: 1, message: 'Hier sind Sie schon beim „du“ – „Sie/Ihnen“ wirkt distanziert.' });
  }

  if (ctx.mode === 'write') {
    for (const [noun] of NOUNS) {
      const lower = noun.toLowerCase();
      const re = new RegExp(`(^|[^\\p{L}])${lower}([^\\p{L}]|$)`, 'u');
      if (lower !== noun && re.test(original) && !new RegExp(`(^|[^\\p{L}])${noun}([^\\p{L}]|$)`, 'u').test(original)) {
        push({ category: 'writing', severity: 1, message: `Nomen schreibt man groß: „${noun}“.`, fix: noun });
        break;
      }
    }
  }
  return issues;
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
