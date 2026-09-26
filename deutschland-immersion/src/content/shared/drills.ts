import type { DrillItem } from '../../engine/types';

/**
 * TRAINING MODE drill bank. Items are always framed in the world (a note, a
 * message, a clause) — never a naked worksheet line.
 */
const d = (target: string, items: Omit<DrillItem, 'target' | 'id'>[]): DrillItem[] =>
  items.map((x, i) => ({ ...x, target, id: `${target}_${i}` }));

export const DRILLS: DrillItem[] = [
  ...d('perfekt-sein', [
    { kind: 'cloze', context: 'Nachricht an Kasia', prompt: 'Ich ___ gestern um 6:42 in Berlin angekommen.', answers: ['bin'], explanation: 'ankommen → Perfekt mit sein.' },
    { kind: 'cloze', context: 'Protokoll, Lukas', prompt: 'Herr Wrona ___ um 21:10 im Restaurant erschienen.', answers: ['ist'], explanation: 'erscheinen (Ortsveränderung) → sein.' },
    { kind: 'choice', context: 'E-Mail an Frau Wiesner', prompt: 'Leider ___ ich gestern in die falsche S-Bahn eingestiegen.', answers: ['bin'], choices: ['bin', 'habe', 'war'], explanation: 'einsteigen → Perfekt mit sein.' },
    { kind: 'transform', context: 'Tagebuch · ins Perfekt setzen', prompt: 'Ich bleibe lange im Büro.', answers: ['Ich bin lange im Büro geblieben.', 'ich bin lange im buero geblieben'], explanation: 'bleiben → sein + geblieben.' },
  ]),
  ...d('nebensatz-verbend', [
    { kind: 'transform', context: 'SMS an Lukas · mit „weil“ verbinden', prompt: 'Ich komme später. Die U8 fällt aus.', answers: ['Ich komme später, weil die U8 ausfällt.'], explanation: 'Im Nebensatz steht das Verb am Ende; trennbare Verben bleiben zusammen: ausfällt.' },
    { kind: 'choice', context: 'Frage an Herrn Schulze', prompt: 'Können Sie mir sagen, ___?', answers: ['wann die Steuer-ID kommt'], choices: ['wann die Steuer-ID kommt', 'wann kommt die Steuer-ID', 'wann die Steuer-ID kommen'], explanation: 'Indirekte Frage = Nebensatz → Verb am Ende.' },
    { kind: 'cloze', context: 'Mail an Dr. Kessler', prompt: 'Ich habe festgestellt, dass die polnische Fassung in § 7 ___. (abweichen)', answers: ['abweicht'], explanation: 'Nebensatz mit „dass“: trennbares Verb bleibt zusammen am Ende.' },
  ]),
  ...d('v2-inversion', [
    { kind: 'choice', context: 'Small Talk mit Fink', prompt: 'Heute Morgen ___ in die falsche S-Bahn eingestiegen.', answers: ['bin ich'], choices: ['bin ich', 'ich bin', 'ich'], explanation: 'Adverbial auf Position 1 → Verb auf 2 → Subjekt danach.' },
    { kind: 'transform', context: 'Notiz · mit „Leider“ beginnen', prompt: 'Ich habe keine Wohnungsgeberbestätigung.', answers: ['Leider habe ich keine Wohnungsgeberbestätigung.'], explanation: 'Leider + Verb + Subjekt.' },
    { kind: 'cloze', context: 'SMS an Emre', prompt: 'Morgen ___ ich die 7,80 € vorbei. (bringen)', answers: ['bringe'], explanation: 'Morgen (Pos. 1) – bringe (Pos. 2) – ich … vorbei.' },
  ]),
  ...d('dativ-praep', [
    { kind: 'cloze', context: 'Wegbeschreibung', prompt: 'Fahren Sie mit ___ U6 bis Friedrichstraße.', answers: ['der'], explanation: 'mit + Dativ, die U6 → der U6.' },
    { kind: 'cloze', context: 'Durchsage', prompt: 'Die S5 fährt heute von ___ Gleis 16.', answers: ['dem'], explanation: 'von + Dativ, das Gleis → dem Gleis.' },
    { kind: 'choice', context: 'Nachricht an Kasia', prompt: 'Ich wohne seit ___ Woche in Kreuzberg.', answers: ['einer'], choices: ['einer', 'eine', 'einem'], explanation: 'seit + Dativ, die Woche → einer Woche.' },
    { kind: 'cloze', context: 'Büro-Chat', prompt: 'Ich gehe kurz ___ Bäcker. (zu + der)', answers: ['zum'], explanation: 'zu + dem = zum.' },
  ]),
  ...d('akk-praep', [
    { kind: 'cloze', context: 'Notiz', prompt: 'Das Formular ist für ___ Mandanten. (der Mandant)', answers: ['den'], explanation: 'für + Akkusativ, n-Deklination: für den Mandanten.' },
    { kind: 'choice', context: 'Kessler', prompt: 'Ohne ___ Zusatzvereinbarung unterschreibt er nicht.', answers: ['eine'], choices: ['eine', 'einer', 'einen'], explanation: 'ohne + Akkusativ, die Zusatzvereinbarung → eine.' },
  ]),
  ...d('wechselpraep', [
    { kind: 'choice', context: 'Frau Wiesner', prompt: 'Das Glas bringen Sie bitte ___ Container.', answers: ['zum'], choices: ['zum', 'im', 'in den'], explanation: 'bringen zu + Dativ: zum Container. (Achtung: „in den Container“ wäre auch möglich – wohin?)' },
    { kind: 'cloze', context: 'Lukas', prompt: 'Die Mappe liegt auf ___ Tisch.', answers: ['dem'], explanation: 'liegen = Wo? → Dativ.' },
    { kind: 'cloze', context: 'Lukas', prompt: 'Leg die Mappe bitte auf ___ Tisch.', answers: ['den'], explanation: 'legen = Wohin? → Akkusativ.' },
  ]),
  ...d('genus', [
    { kind: 'choice', context: 'Hauptbahnhof', prompt: '___ Gleis 16 ist ganz oben.', answers: ['Das'], choices: ['Das', 'Der', 'Die'], explanation: 'das Gleis.' },
    { kind: 'choice', context: 'Kanzlei', prompt: '___ Frist endet um 17 Uhr.', answers: ['Die'], choices: ['Die', 'Der', 'Das'], explanation: 'die Frist.' },
    { kind: 'choice', context: 'Kanzlei', prompt: '___ Vertrag hat 11 Seiten.', answers: ['Der'], choices: ['Der', 'Das', 'Die'], explanation: 'der Vertrag.' },
  ]),
  ...d('hoeflichkeit-k2', [
    { kind: 'transform', context: 'Am DB-Schalter · höflicher', prompt: 'Sagen Sie mir das Gleis!', answers: ['Könnten Sie mir bitte das Gleis sagen?', 'Koennten Sie mir bitte das Gleis sagen?', 'Könnten Sie mir das Gleis sagen?'], explanation: 'Konjunktiv II + bitte.' },
    { kind: 'choice', context: 'Café', prompt: '___ einen Cappuccino, bitte.', answers: ['Ich hätte gern'], choices: ['Ich hätte gern', 'Ich will', 'Kann ich haben'], explanation: '„Ich hätte gern“ – Standard im Service-Kontext.' },
  ]),
  ...d('gen-prep', [
    { kind: 'cloze', context: 'Pressemitteilung', prompt: 'Wegen ___ Streiks fällt die S-Bahn aus. (der Streik)', answers: ['des'], explanation: 'wegen + Genitiv: des Streiks.' },
    { kind: 'cloze', context: 'Protokoll', prompt: 'Während ___ Besprechung wurde die Frist verlängert.', answers: ['der'], explanation: 'während + Genitiv, die Besprechung → der.' },
    { kind: 'choice', context: 'Mail an den Verein', prompt: 'Trotz ___ Frist ist die Prüfung vollständig.', answers: ['der kurzen'], choices: ['der kurzen', 'die kurze', 'dem kurzen'], explanation: 'trotz + Genitiv feminin: der kurzen Frist.' },
  ]),
  ...d('uhrzeit', [
    { kind: 'choice', context: 'Anruf von Dr. Kessler', prompt: '„um halb drei“ =', answers: ['14:30'], choices: ['14:30', '15:30', '13:30'], explanation: 'halb drei = halbe Stunde vor drei.' },
    { kind: 'choice', context: 'Lukas', prompt: '„Viertel nach acht“ =', answers: ['8:15'], choices: ['8:15', '7:45', '8:45'], explanation: 'Viertel nach = +15 Minuten.' },
    { kind: 'choice', context: 'Emre', prompt: '„fünf vor halb zehn“ =', answers: ['9:25'], choices: ['9:25', '9:35', '10:25'], explanation: 'halb zehn = 9:30; fünf vor = 9:25.' },
  ]),
  ...d('adj-endungen', [
    { kind: 'cloze', context: 'Café', prompt: 'Ich hätte gern einen groß___ Milchkaffee.', answers: ['en'], explanation: 'einen + mask. Akk.: -en.' },
    { kind: 'cloze', context: 'Mail', prompt: 'Anbei finden Sie die korrigiert___ Fassung.', answers: ['e'], explanation: 'die + fem. Akk.: -e.' },
    { kind: 'cloze', context: 'Fink', prompt: 'Das ist ein wichtig___ Termin.', answers: ['er'], explanation: 'ein + mask. Nom.: -er.' },
  ]),
  ...d('trennbare-verben', [
    { kind: 'cloze', context: 'Ansage', prompt: 'Bitte ___ Sie am Alexanderplatz ___. (umsteigen) – Antwort: zwei Wörter mit Leerzeichen', answers: ['steigen um'], explanation: 'Imperativ: Steigen Sie … um.' },
    { kind: 'transform', context: 'SMS · Präsens', prompt: 'ich / morgen / anfangen', answers: ['Ich fange morgen an.', 'Morgen fange ich an.'], explanation: 'Präfix ans Satzende.' },
  ]),
  ...d('passiv', [
    { kind: 'transform', context: 'Protokoll · ins Passiv', prompt: 'Wir prüfen den Vertrag heute.', answers: ['Der Vertrag wird heute geprüft.', 'Der Vertrag wird heute von uns geprüft.'], explanation: 'werden + Partizip II.' },
    { kind: 'cloze', context: 'Bürgeramt', prompt: 'Die Steuer-ID ___ Ihnen per Post zugeschickt.', answers: ['wird'], explanation: 'Vorgangspassiv Präsens: wird zugeschickt.' },
    { kind: 'choice', context: 'Kessler', prompt: 'Der Vertrag muss heute noch ___.', answers: ['geprüft werden'], choices: ['geprüft werden', 'werden geprüft', 'geprüft sein'], explanation: 'Modalverb + Passiv-Infinitiv: geprüft werden.' },
  ]),
  ...d('term-vertragsstrafe', [
    { kind: 'choice', context: 'Übersetzung PL → DE', prompt: 'kara umowna =', answers: ['Vertragsstrafe'], choices: ['Vertragsstrafe', 'Geldstrafe', 'Bußgeld'], explanation: 'Geldstrafe (Strafrecht) und Bußgeld (Ordnungswidrigkeit) sind etwas anderes.' },
    { kind: 'cloze', context: 'Vertragsklausel', prompt: 'Der Spieler hat eine ___ in Höhe von 250.000,00 EUR zu zahlen.', answers: ['Vertragsstrafe'], explanation: '§§ 339 ff. BGB.' },
  ]),
  ...d('term-kuendigung-ruecktritt', [
    { kind: 'choice', context: 'Übersetzung DE → PL', prompt: 'außerordentliche Kündigung =', answers: ['rozwiązanie umowy bez zachowania okresu wypowiedzenia'], choices: ['rozwiązanie umowy bez zachowania okresu wypowiedzenia', 'odstąpienie od umowy', 'unieważnienie umowy'], explanation: 'odstąpienie = Rücktritt, unieważnienie ≈ Nichtigerklärung.' },
    { kind: 'choice', context: 'Übersetzung PL → DE', prompt: 'odstąpienie od umowy =', answers: ['Rücktritt vom Vertrag'], choices: ['Rücktritt vom Vertrag', 'Kündigung des Vertrags', 'Aufhebung des Vertrags'], explanation: 'Aufhebung = einvernehmliche Beendigung (rozwiązanie za porozumieniem stron).' },
  ]),
  ...d('uebersetzung-zahlen', [
    { kind: 'choice', context: 'Vertrag DE', prompt: '38 500,00 EUR (PL) =', answers: ['38.500,00 EUR'], choices: ['38.500,00 EUR', '38,500.00 EUR', '38 500.00 EUR'], explanation: 'Deutsch: Punkt = Tausender, Komma = Dezimal.' },
    { kind: 'choice', context: 'Vertrag DE', prompt: '30 czerwca 2027 r. =', answers: ['30. Juni 2027'], choices: ['30. Juni 2027', '30 Juni 2027 r.', 'Juni 30, 2027'], explanation: 'Deutsches Datumsformat mit Punkt nach der Zahl.' },
  ]),
  ...d('du-sie', [
    { kind: 'choice', context: 'Erste Mail an Dr. Kessler', prompt: 'Anrede:', answers: ['Sehr geehrte Frau Dr. Kessler,'], choices: ['Sehr geehrte Frau Dr. Kessler,', 'Hallo Jana,', 'Hi Frau Kessler,'], explanation: 'Formell, mit Titel.' },
    { kind: 'choice', context: 'Lukas (hat das du angeboten)', prompt: '___ du kurz Zeit?', answers: ['Hast'], choices: ['Hast', 'Haben Sie', 'Habt'], explanation: 'Angebotenes du annehmen.' },
  ]),
];

export const DRILLS_BY_TARGET = DRILLS.reduce<Record<string, DrillItem[]>>((acc, x) => {
  (acc[x.target] ??= []).push(x);
  return acc;
}, {});
