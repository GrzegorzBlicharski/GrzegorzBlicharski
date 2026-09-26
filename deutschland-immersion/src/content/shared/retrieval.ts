import type { RetrievalItem } from '../../engine/types';

/**
 * Invisible spaced repetition. Each item is a tiny in-world moment that re-tests
 * one language target. The engine injects them into SMS threads and NPC small
 * talk when that target is weak and due — the player just experiences life.
 */
export const RETRIEVAL: RetrievalItem[] = [
  // ------------------------------------------------ perfekt-sein
  {
    id: 'r_perf_1', target: 'perfekt-sein', channel: 'sms', speakers: ['kasia'],
    prompt: 'Na, wie war die Fahrt gestern? Alles gut gegangen? 🙂', kind: 'input',
    input: {
      task: 'Antworten Sie Kasia: Erzählen Sie in 1–2 Sätzen, wie Sie gestern gefahren sind.', register: 'informal',
      required: [{ id: 'verb', label: 'ein Bewegungsverb im Perfekt', patterns: ['gefahren', 'angekommen', 'umgestiegen', 'eingestiegen', 'gegangen', 'gelaufen'] }],
      errors: [], bonuses: [{ pattern: String.raw`bin [^.]*(gefahren|angekommen|umgestiegen|eingestiegen)`, dimension: 'idiomaticity', note: 'Perfekt mit „sein“', weight: 25 }],
      models: ['Ja, alles gut! Ich bin zuerst in die falsche S-Bahn eingestiegen, aber dann bin ich pünktlich angekommen.'],
    },
  },
  {
    id: 'r_perf_2', target: 'perfekt-sein', channel: 'dialogue', speakers: ['emre', 'lukas'],
    prompt: 'Und, was ist gestern noch passiert?', kind: 'choice',
    choices: [
      { text: 'Ich bin noch lange im Büro geblieben.', correct: true },
      { text: 'Ich habe noch lange im Büro geblieben.', correct: false, feedback: '„bleiben“ → Perfekt mit „sein“: Ich bin geblieben.' },
      { text: 'Ich bin noch lange im Büro gebleibt.', correct: false, feedback: 'Partizip von „bleiben“: geblieben.' },
    ],
  },
  // ------------------------------------------------ nebensatz
  {
    id: 'r_ns_1', target: 'nebensatz-verbend', channel: 'sms', speakers: ['lukas'],
    prompt: 'Kommst du heute zum Kicken in den Görli? 18 Uhr ⚽', kind: 'input',
    input: {
      task: 'Sagen Sie ab und nennen Sie einen Grund mit „weil“.', register: 'informal',
      required: [{ id: 'weil', label: 'Begründung mit „weil“', patterns: [String.raw`\bweil\b`] }, { id: 'no', label: 'Absage', patterns: ['leider', 'nicht', 'kann nicht', 'schaffe', 'keine zeit', 'sorry'] }],
      errors: [], bonuses: [{ pattern: String.raw`weil [^.,!?]* (muss|habe|bin|kann|will|arbeite|lerne|treffe)\b[.!?]?$`, dimension: 'idiomaticity', note: 'Verb am Ende des Nebensatzes', weight: 20 }],
      models: ['Heute leider nicht, weil ich noch die Zusatzvereinbarung fertig machen muss. Nächstes Mal!'],
    },
  },
  {
    id: 'r_ns_2', target: 'nebensatz-verbend', channel: 'dialogue', speakers: ['*'],
    prompt: 'Weißt du eigentlich, ob der FC Spree am Samstag spielt?', kind: 'choice',
    choices: [
      { text: 'Ich weiß nicht, ob sie am Samstag spielen.', correct: true },
      { text: 'Ich weiß nicht, ob spielen sie am Samstag.', correct: false, feedback: 'Nach „ob“: Verb ans Ende → „…, ob sie am Samstag spielen.“' },
      { text: 'Ich weiß nicht, ob sie spielen am Samstag.', correct: false, feedback: 'Im Nebensatz steht das Verb ganz am Ende.' },
    ],
  },
  // ------------------------------------------------ v2
  {
    id: 'r_v2_1', target: 'v2-inversion', channel: 'sms', speakers: ['kasia', 'lukas'],
    prompt: 'Was machst du morgen Abend? 🍻', kind: 'input',
    input: {
      task: 'Antworten Sie – und beginnen Sie Ihren Satz mit „Morgen Abend …“.', register: 'informal',
      required: [{ id: 'start', label: 'Satzanfang „Morgen Abend“', patterns: [String.raw`^morgen abend`] }],
      errors: [], bonuses: [{ pattern: String.raw`^morgen abend (bin|habe|gehe|treffe|arbeite|muss|will|kann|fahre|mache|schaue|lerne)\b`, dimension: 'idiomaticity', note: 'Verb auf Position 2', weight: 30 }],
      models: ['Morgen Abend gehe ich mit Emre ins Kino. Kommst du mit?'],
    },
  },
  {
    id: 'r_v2_2', target: 'v2-inversion', channel: 'dialogue', speakers: ['*'],
    prompt: 'Und, wann fängst du offiziell an?', kind: 'choice',
    choices: [
      { text: 'Am Montag fange ich offiziell an.', correct: true },
      { text: 'Am Montag ich fange offiziell an.', correct: false, feedback: 'Verbzweitstellung: „Am Montag fange ich …“' },
      { text: 'Am Montag ich anfange offiziell.', correct: false, feedback: 'V2 + trennbares Verb: „Am Montag fange ich offiziell an.“' },
    ],
  },
  // ------------------------------------------------ dativ
  {
    id: 'r_dat_1', target: 'dativ-praep', channel: 'dialogue', speakers: ['*'],
    prompt: 'Wie kommst du eigentlich zur Arbeit?', kind: 'choice',
    choices: [
      { text: 'Mit der U8 bis Alexanderplatz, dann mit der S-Bahn.', correct: true },
      { text: 'Mit die U8 bis Alexanderplatz, dann mit die S-Bahn.', correct: false, feedback: '„mit“ + Dativ: mit der U8 (die U-Bahn → der).' },
      { text: 'Mit den U8 bis Alexanderplatz.', correct: false, feedback: 'Die Linie ist feminin (die U8) → mit der U8.' },
    ],
  },
  {
    id: 'r_dat_2', target: 'dativ-praep', channel: 'sms', speakers: ['kasia'],
    prompt: 'Wo arbeitest du jetzt genau? Schick mal die Adresse, ich komm mal vorbei 😊', kind: 'input',
    input: {
      task: 'Beschreiben Sie den Weg: Mit welcher Linie fahren Sie zu Ihrem Büro?', register: 'informal',
      required: [{ id: 'mit', label: '„mit“ + Verkehrsmittel', patterns: [String.raw`\bmit (der|dem)\b`] }, { id: 'where', label: 'das Ziel', patterns: ['friedrichstr', 'buero', 'kanzlei', 'mitte'] }],
      errors: [], bonuses: [{ pattern: String.raw`zum|zur|bis zur|bis zum`, dimension: 'idiomaticity', note: 'zum/zur korrekt', weight: 20 }],
      models: ['Friedrichstraße 148! Ich fahre mit der U8 bis Alexanderplatz und dann mit der S-Bahn bis zur Friedrichstraße.'],
    },
  },
  // ------------------------------------------------ akk
  {
    id: 'r_akk_1', target: 'akk-praep', channel: 'dialogue', speakers: ['*'],
    prompt: 'Für wen ist denn der zweite Kaffee?', kind: 'choice',
    choices: [
      { text: 'Für meinen Kollegen, er arbeitet heute ohne Pause.', correct: true },
      { text: 'Für meinem Kollegen, er arbeitet heute ohne Pause.', correct: false, feedback: '„für“ + Akkusativ: für meinen Kollegen.' },
      { text: 'Für mein Kollege.', correct: false, feedback: 'für + Akkusativ + n-Deklination: für meinen Kollegen.' },
    ],
  },
  // ------------------------------------------------ wechselpräp
  {
    id: 'r_wp_1', target: 'wechselpraep', channel: 'sms', speakers: ['lukas'],
    prompt: 'Wo hast du die Mappe mit dem Vertrag hingelegt?? Jana sucht sie 😬', kind: 'choice',
    choices: [
      { text: 'Ich habe sie auf deinen Schreibtisch gelegt.', correct: true },
      { text: 'Ich habe sie auf deinem Schreibtisch gelegt.', correct: false, feedback: 'legen = Wohin? → Akkusativ: auf deinen Schreibtisch.' },
      { text: 'Sie liegt auf deinen Schreibtisch.', correct: false, feedback: 'liegen = Wo? → Dativ: auf deinem Schreibtisch.' },
    ],
  },
  {
    id: 'r_wp_2', target: 'wechselpraep', channel: 'dialogue', speakers: ['*'],
    prompt: 'Wo warst du denn heute Morgen?', kind: 'choice',
    choices: [
      { text: 'Im Bürgeramt. Anmeldung.', correct: true },
      { text: 'Ins Bürgeramt. Anmeldung.', correct: false, feedback: 'Wo? → Dativ: im (= in dem) Bürgeramt. „ins“ = Wohin?' },
    ],
  },
  // ------------------------------------------------ gen-prep (B2)
  {
    id: 'r_gen_1', target: 'gen-prep', channel: 'sms', speakers: ['kessler'],
    prompt: 'Warum ist die Unterschrift gestern später erfolgt? Ich brauche einen Satz für das Protokoll.', kind: 'input',
    input: {
      task: 'Formulieren Sie einen Satz für das Protokoll mit „wegen“ oder „aufgrund“ (Grund: die Abweichungen in der Übersetzung).', register: 'formal',
      required: [{ id: 'prep', label: '„wegen“ / „aufgrund“', patterns: [String.raw`\bwegen\b`, 'aufgrund'] }, { id: 'reason', label: 'der Grund', patterns: ['abweichung', 'uebersetzung', 'fassung', 'fehler'] }],
      errors: [{ pattern: String.raw`wegen (dem|den)\b`, target: 'gen-prep', category: 'cases', severity: 2, message: 'Im Protokoll: Genitiv – „wegen der Abweichungen“ / „wegen des Übersetzungsfehlers“.' }],
      bonuses: [{ pattern: String.raw`(wegen|aufgrund) (der|des) `, dimension: 'idiomaticity', note: 'Genitiv – Protokollstil', weight: 30 }],
      models: ['Die Unterzeichnung erfolgte aufgrund der Abweichungen zwischen der deutschen und der polnischen Fassung später als geplant.'],
    },
  },
  {
    id: 'r_gen_2', target: 'gen-prep', channel: 'dialogue', speakers: ['lukas', 'kessler'],
    prompt: 'Wie formulieren wir das in der Pressemitteilung?', kind: 'choice', minLevel: 'B1',
    choices: [
      { text: 'Trotz der kurzen Frist wurde der Vertrag vollständig geprüft.', correct: true },
      { text: 'Trotz die kurze Frist wurde der Vertrag vollständig geprüft.', correct: false, feedback: '„trotz“ + Genitiv: trotz der kurzen Frist.' },
      { text: 'Trotz dem kurzen Frist wurde der Vertrag geprüft.', correct: false, feedback: 'die Frist → trotz der kurzen Frist (Genitiv feminin).' },
    ],
  },
  // ------------------------------------------------ höflichkeit
  {
    id: 'r_k2_1', target: 'hoeflichkeit-k2', channel: 'dialogue', speakers: ['emre'],
    prompt: 'Was darf’s heute sein?', kind: 'input',
    input: {
      task: 'Bestellen Sie – diesmal etwas anderes als gestern.', register: 'any',
      required: [{ id: 'item', label: 'eine Bestellung', patterns: ['kaffee', 'cappuccino', 'tee', 'espresso', 'latte', 'kuchen', 'croissant', 'franzbroetchen', 'wasser', 'saft', 'mate', 'chai', 'broetchen'] }],
      errors: [{ pattern: String.raw`kann ich [^.?!]* haben`, target: 'hoeflichkeit-k2', category: 'idioms', severity: 1, message: '„Kann ich … haben?“ → natürlicher: „Ich hätte gern …“ / „Ich nehme …“' }],
      bonuses: [{ pattern: String.raw`haette gerne?|ich nehme`, dimension: 'naturalness', note: 'Natürlich bestellt', weight: 25 }],
      models: ['Heute nehme ich einen Chai Latte und ein Stück Käsekuchen, bitte.'],
    },
  },
  {
    id: 'r_k2_2', target: 'hoeflichkeit-k2', channel: 'sms', speakers: ['kessler'],
    prompt: 'Können Sie morgen um 8 Uhr ins Büro kommen? Wir haben einen Termin mit dem Berater.', kind: 'choice',
    choices: [
      { text: 'Selbstverständlich. Wäre es in Ordnung, wenn ich die Unterlagen schon heute Abend vorbereite?', correct: true },
      { text: 'Ja. Ich will die Unterlagen heute vorbereiten.', correct: false, feedback: '„Ich will“ wirkt gegenüber der Chefin fordernd. „Wäre es in Ordnung, wenn …?“' },
      { text: 'Ja klar, kein Stress!', correct: false, feedback: 'Zu salopp für Dr. Kessler. „Selbstverständlich“ / „Sehr gern“.' },
    ],
  },
  // ------------------------------------------------ du/sie
  {
    id: 'r_du_1', target: 'du-sie', channel: 'dialogue', speakers: ['lukas'],
    prompt: 'Sag mal, hast du morgen Zeit für ein kurzes Update zum Fall Wrona?', kind: 'choice',
    choices: [
      { text: 'Klar, hast du um zehn Zeit?', correct: true },
      { text: 'Natürlich, haben Sie um zehn Zeit?', correct: false, feedback: 'Mit Lukas sind Sie beim „du“.' },
    ],
  },
  {
    id: 'r_du_2', target: 'du-sie', channel: 'sms', speakers: ['kessler'],
    prompt: 'Haben Sie die korrigierte polnische Fassung schon an Herrn Mazur geschickt?', kind: 'choice',
    choices: [
      { text: 'Ja, heute um 9:12 Uhr. Soll ich Ihnen die Mail weiterleiten?', correct: true },
      { text: 'Ja, heute um 9:12. Soll ich dir die Mail weiterleiten?', correct: false, feedback: 'Dr. Kessler hat Ihnen das „du“ nicht angeboten → „Ihnen“.' },
    ],
  },
  // ------------------------------------------------ uhrzeit
  {
    id: 'r_uhr_1', target: 'uhrzeit', channel: 'sms', speakers: ['lukas', 'kasia'],
    prompt: 'Treffen wir uns um Viertel vor sieben am Kotti?', kind: 'choice',
    choices: [
      { text: 'Okay, 18:45 am Kotti!', correct: true },
      { text: 'Okay, 19:15 am Kotti!', correct: false, feedback: '„Viertel vor sieben“ = 18:45.' },
      { text: 'Okay, 17:45 am Kotti!', correct: false, feedback: '„Viertel vor sieben“ = 6:45 / 18:45.' },
    ],
  },
  {
    id: 'r_uhr_2', target: 'uhrzeit', channel: 'dialogue', speakers: ['*'],
    prompt: 'Das Spiel ist um halb vier. Schaffst du das?', kind: 'choice',
    choices: [
      { text: 'Ja, um 15:30 bin ich da.', correct: true },
      { text: 'Ja, um 16:30 bin ich da.', correct: false, feedback: '„halb vier“ = 15:30 – eine halbe Stunde vor vier.' },
    ],
  },
  // ------------------------------------------------ genus
  {
    id: 'r_gen_n_1', target: 'genus', channel: 'dialogue', speakers: ['*'],
    prompt: 'Hast du schon Möbel für die Wohnung?', kind: 'choice',
    choices: [
      { text: 'Nur ein Bett und einen Tisch. Das Sofa kommt am Freitag.', correct: true },
      { text: 'Nur ein Bett und ein Tisch. Der Sofa kommt am Freitag.', correct: false, feedback: 'der Tisch → einen Tisch (Akk.); das Sofa.' },
    ],
  },
  // ------------------------------------------------ adj
  {
    id: 'r_adj_1', target: 'adj-endungen', channel: 'dialogue', speakers: ['emre'],
    prompt: 'Wie immer? Großer Cappuccino?', kind: 'choice',
    choices: [
      { text: 'Heute lieber einen kleinen Espresso, bitte.', correct: true },
      { text: 'Heute lieber einen kleine Espresso, bitte.', correct: false, feedback: 'einen + Adjektiv (mask. Akk.) → -en: einen kleinen Espresso.' },
      { text: 'Heute lieber ein kleinen Espresso, bitte.', correct: false, feedback: 'der Espresso → einen kleinen Espresso.' },
    ],
  },
  // ------------------------------------------------ trennbare verben
  {
    id: 'r_trenn_1', target: 'trennbare-verben', channel: 'sms', speakers: ['kessler'],
    prompt: 'Herr Mazur hat angerufen. Bitte melden Sie sich bei ihm.', kind: 'choice',
    choices: [
      { text: 'Ich rufe ihn sofort zurück.', correct: true },
      { text: 'Ich zurückrufe ihn sofort.', correct: false, feedback: 'Trennbares Verb: Präfix ans Ende → „Ich rufe ihn sofort zurück.“' },
    ],
  },
  // ------------------------------------------------ passiv
  {
    id: 'r_pass_1', target: 'passiv', channel: 'sms', speakers: ['kessler'],
    prompt: 'Status Zusatzvereinbarung? Ein Satz genügt.', kind: 'input', minLevel: 'B1',
    input: {
      task: 'Antworten Sie im Passiv: Die Zusatzvereinbarung … (unterschreiben / prüfen / übersetzen).', register: 'formal',
      required: [{ id: 'passiv', label: 'Passiv (wird/wurde … + Partizip II)', patterns: [String.raw`(wird|wurde|ist|werden|wurden) [^.]*(unterschrieben|unterzeichnet|geprueft|uebersetzt|verschickt|gesendet|korrigiert)`] }],
      errors: [], bonuses: [{ pattern: String.raw`wurde bereits|ist bereits|wird heute noch|wird gerade`, dimension: 'idiomaticity', note: 'Präzise Zeitangabe im Passiv', weight: 20 }],
      models: ['Die Zusatzvereinbarung wurde bereits von beiden Seiten unterzeichnet; die polnische Fassung wird heute noch korrigiert.'],
    },
  },
  // ------------------------------------------------ verb-präp
  {
    id: 'r_vp_1', target: 'verb-praep', channel: 'dialogue', speakers: ['lukas', 'kessler'],
    prompt: 'Wer kümmert sich um die Pressefrage?', kind: 'choice',
    choices: [
      { text: 'Ich kümmere mich darum.', correct: true },
      { text: 'Ich kümmere mich dafür.', correct: false, feedback: 'sich kümmern um → „darum“.' },
      { text: 'Ich kümmere darum.', correct: false, feedback: 'reflexiv: sich kümmern → „Ich kümmere mich darum.“' },
    ],
  },
  // ------------------------------------------------ n-deklination
  {
    id: 'r_nd_1', target: 'n-deklination', channel: 'dialogue', speakers: ['kessler', 'lukas'],
    prompt: 'Mit wem hast du heute telefoniert?', kind: 'choice',
    choices: [
      { text: 'Mit dem Mandanten und mit seinem Berater.', correct: true },
      { text: 'Mit dem Mandant und mit seinem Berater.', correct: false, feedback: 'n-Deklination: dem Mandanten.' },
    ],
  },
  // ------------------------------------------------ legal terms
  {
    id: 'r_term_vs_1', target: 'term-vertragsstrafe', channel: 'sms', speakers: ['kasia'],
    prompt: 'Hej, schnelle Frage für eine Übersetzung: „kara umowna“ – wie sagt man das im deutschen Vertrag?', kind: 'choice',
    choices: [
      { text: 'Vertragsstrafe.', correct: true },
      { text: 'Geldstrafe.', correct: false, feedback: 'Geldstrafe = Strafrecht (grzywna). kara umowna = Vertragsstrafe.' },
      { text: 'Vertragsbuße.', correct: false, feedback: 'Kein deutscher Rechtsbegriff. Richtig: Vertragsstrafe (§§ 339 ff. BGB).' },
    ],
  },
  {
    id: 'r_term_kr_1', target: 'term-kuendigung-ruecktritt', channel: 'sms', speakers: ['kasia', 'kessler'],
    prompt: 'Wie übersetzt man „fristlose Kündigung des Arbeitsvertrags“ ins Polnische?', kind: 'choice',
    choices: [
      { text: 'rozwiązanie umowy o pracę bez wypowiedzenia', correct: true },
      { text: 'odstąpienie od umowy o pracę', correct: false, feedback: 'odstąpienie = Rücktritt. Arbeitsverträge werden gekündigt, nicht „zurückgetreten“.' },
      { text: 'wypowiedzenie umowy o pracę z zachowaniem okresu wypowiedzenia', correct: false, feedback: 'Das wäre die ordentliche Kündigung. „fristlos“ = bez wypowiedzenia.' },
    ],
  },
  {
    id: 'r_zahl_1', target: 'uebersetzung-zahlen', channel: 'sms', speakers: ['kasia'],
    prompt: 'Test 😄 Wie schreibt man „1,5 mln zł“ in einem deutschen Vertrag?', kind: 'choice',
    choices: [
      { text: '1.500.000,00 PLN', correct: true },
      { text: '1,500,000.00 PLN', correct: false, feedback: 'Deutsches Format: Punkt für Tausender, Komma für Dezimalstellen.' },
      { text: '1,5 Mrd. PLN', correct: false, feedback: 'mln = Million(en), Mrd. = Milliarde(n)! Ein teurer Fehler.' },
    ],
  },
];
