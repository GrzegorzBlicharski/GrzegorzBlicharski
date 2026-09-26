import type { Term } from '../../engine/types';

/**
 * Personal terminology base (PL ↔ DE legal). Terms are collected in play and
 * retrieved later. `equivalence` flags where Polish and German concepts differ.
 */
export const TERMS: Term[] = [
  {
    id: 'vertragsstrafe', de: 'die Vertragsstrafe', pl: ['kara umowna'], equivalence: 'full',
    context: 'Schuldrecht, §§ 339–345 BGB · PL: art. 483–485 KC',
    alternatives: ['Konventionalstrafe (veraltet / AT)'],
    falseFriends: 'Geldstrafe = grzywna (Strafrecht); Bußgeld = grzywna/mandat (Ordnungswidrigkeit)',
    note: 'In beiden Rechtsordnungen pauschalierter Betrag für Pflichtverletzung. Herabsetzung: § 343 BGB ↔ art. 484 § 2 KC.',
    collocations: ['eine Vertragsstrafe vereinbaren', 'die Vertragsstrafe wird fällig', 'die Vertragsstrafe herabsetzen', 'zur Zahlung einer Vertragsstrafe verpflichtet sein'],
    example: 'Verstößt der Spieler schuldhaft gegen § 4, hat er eine Vertragsstrafe in Höhe von 250.000,00 EUR zu zahlen.',
  },
  {
    id: 'kuendigung', de: 'die Kündigung', pl: ['wypowiedzenie (umowy)'], equivalence: 'partial',
    context: 'Beendigung eines Dauerschuldverhältnisses für die Zukunft (Arbeits-, Miet-, Dienstvertrag)',
    alternatives: ['ordentliche Kündigung = wypowiedzenie z zachowaniem okresu wypowiedzenia'],
    falseFriends: 'nicht: odstąpienie (= Rücktritt)',
    note: 'Im polnischen Arbeitsrecht: „rozwiązanie umowy o pracę za wypowiedzeniem“ vs. „bez wypowiedzenia“.',
    collocations: ['fristgerecht kündigen', 'die Kündigung aussprechen', 'die Kündigungsfrist einhalten', 'gegen die Kündigung klagen'],
    example: 'Der Vermieter kann das Mietverhältnis mit einer Frist von drei Monaten kündigen.',
  },
  {
    id: 'ausserordentliche_kuendigung', de: 'die außerordentliche (fristlose) Kündigung', pl: ['rozwiązanie umowy bez zachowania okresu wypowiedzenia', 'wypowiedzenie ze skutkiem natychmiastowym'], equivalence: 'partial',
    context: '§ 626 BGB (Dienst-/Arbeitsvertrag), § 314 BGB (Dauerschuldverhältnisse): „aus wichtigem Grund“',
    falseFriends: '„odstąpienie od umowy“ – falsch, das ist Rücktritt',
    note: 'PL Arbeitsrecht: art. 52 KP (z winy pracownika), art. 55 KP. „aus wichtigem Grund“ = „z ważnej przyczyny“.',
    collocations: ['aus wichtigem Grund kündigen', 'das Recht zur außerordentlichen Kündigung bleibt unberührt'],
    example: 'Das Recht zur außerordentlichen Kündigung aus wichtigem Grund bleibt unberührt.',
  },
  {
    id: 'ruecktritt', de: 'der Rücktritt (vom Vertrag)', pl: ['odstąpienie od umowy'], equivalence: 'partial',
    context: '§§ 346 ff. BGB: Rückabwicklung – empfangene Leistungen werden zurückgewährt',
    falseFriends: 'nicht mit Kündigung verwechseln',
    note: 'Wirkt auf das gesamte Vertragsverhältnis (Rückgewährschuldverhältnis). PL: art. 395, 491–494 KC.',
    collocations: ['vom Vertrag zurücktreten', 'den Rücktritt erklären', 'ein Rücktrittsrecht vereinbaren'],
    example: 'Der Käufer ist berechtigt, vom Vertrag zurückzutreten.',
  },
  {
    id: 'unberuehrt', de: 'bleibt unberührt', pl: ['pozostaje nienaruszone', 'nie narusza'], equivalence: 'full',
    context: 'Vorbehaltsformel in Verträgen und Gesetzen',
    note: 'Standardformel: „Die Vorschriften des … bleiben unberührt“ = „Przepisy … pozostają nienaruszone / nie naruszają …“.',
    collocations: ['bleibt hiervon unberührt', 'unbeschadet des § …'],
    example: 'Weitergehende Ansprüche bleiben unberührt.',
  },
  {
    id: 'massgeblich', de: 'maßgeblich (Sprachfassung)', pl: ['wiążący', 'rozstrzygający'], equivalence: 'full',
    context: 'Sprachklausel in zwei- oder mehrsprachigen Verträgen',
    note: '„Maßgeblich ist die deutsche Fassung“ = „Wiążąca jest wersja niemiecka“ / „W razie rozbieżności rozstrzyga wersja niemiecka“.',
    collocations: ['maßgeblich ist …', 'im Zweifel ist … maßgeblich', 'bei Abweichungen gilt …'],
    example: 'Maßgeblich ist ausschließlich die deutsche Fassung dieses Vertrags.',
  },
  {
    id: 'wohnungsgeberbestaetigung', de: 'die Wohnungsgeberbestätigung', pl: ['zaświadczenie wynajmującego (o wprowadzeniu się)'], equivalence: 'none',
    context: '§ 19 Bundesmeldegesetz (BMG): Pflicht des Wohnungsgebers bei der Anmeldung',
    note: 'Kein polnisches Pendant im Meldewesen – beim Übersetzen umschreiben, ggf. mit Originalbegriff in Klammern.',
    collocations: ['die Wohnungsgeberbestätigung ausstellen', 'die Wohnungsgeberbestätigung vorlegen'],
    example: 'Für die Anmeldung benötigen Sie die Wohnungsgeberbestätigung.',
  },
  {
    id: 'ablosesumme', de: 'die Ablösesumme', pl: ['kwota odstępnego', 'kwota transferu', 'kwota wykupu'], equivalence: 'partial',
    context: 'Sportrecht: Zahlung des aufnehmenden an den abgebenden Verein',
    note: 'In der Sportpraxis PL oft „kwota odstępnego“ oder „klauzula odejścia“ (bei Ausstiegsklauseln). Kontext prüfen.',
    collocations: ['eine Ablösesumme zahlen', 'die festgeschriebene Ablösesumme', 'ablösefrei wechseln'],
    example: 'Der Spieler kann den Vertrag vorzeitig beenden, sofern eine Ablösesumme von mindestens 4.000.000,00 EUR gezahlt wird.',
  },
  {
    id: 'geschaeftsfuehrer', de: 'der Geschäftsführer (GmbH)', pl: ['członek zarządu (sp. z o.o.)', 'prezes zarządu'], equivalence: 'partial',
    context: 'Organ der GmbH (§ 35 GmbHG) ↔ zarząd sp. z o.o. (art. 201 KSH)',
    falseFriends: '„dyrektor“ ist in PL keine Organfunktion',
    note: 'Funktional nächstes Äquivalent: członek zarządu. „dyrektor zarządzający“ nur bei Kontextbedarf.',
    collocations: ['zum Geschäftsführer bestellt werden', 'den Geschäftsführer abberufen', 'Geschäftsführer mit Einzelvertretungsbefugnis'],
    example: 'Die Gesellschaft wird durch zwei Geschäftsführer gemeinsam vertreten.',
  },
  {
    id: 'handelsregister', de: 'das Handelsregister', pl: ['Krajowy Rejestr Sądowy (rejestr przedsiębiorców)'], equivalence: 'partial',
    context: 'Geführt beim Amtsgericht (§ 8 HGB) ↔ KRS (sądy rejonowe)',
    note: 'Nicht wörtlich „rejestr handlowy“ (historisch). In Übersetzungen: „rejestr handlowy (Handelsregister)“ oder funktionales Äquivalent mit Erläuterung.',
    collocations: ['im Handelsregister eingetragen', 'Auszug aus dem Handelsregister', 'HRB 12345 B'],
    example: 'Die Gesellschaft ist im Handelsregister des Amtsgerichts Charlottenburg unter HRB 12345 B eingetragen.',
  },
  {
    id: 'amtsgericht', de: 'das Amtsgericht', pl: ['sąd rejonowy'], equivalence: 'partial',
    context: 'Unterste Instanz der ordentlichen Gerichtsbarkeit',
    note: 'Zuständigkeiten unterscheiden sich; Berlin-Charlottenburg führt das Handelsregister.',
    collocations: ['vor dem Amtsgericht klagen', 'Amtsgericht Charlottenburg'],
    example: 'Zuständig ist das Amtsgericht Mitte.',
  },
  {
    id: 'vollmacht', de: 'die Vollmacht', pl: ['pełnomocnictwo'], equivalence: 'full',
    context: '§§ 164 ff. BGB ↔ art. 98 ff. KC',
    alternatives: ['Prozessvollmacht = pełnomocnictwo procesowe', 'Generalvollmacht = pełnomocnictwo ogólne'],
    note: '„Prokura“ existiert in beiden Systemen (HGB / KC art. 1091).',
    collocations: ['eine Vollmacht erteilen', 'die Vollmacht widerrufen', 'in Vollmacht (i. V.)'],
    example: 'Hiermit erteile ich Frau Dr. Kessler Vollmacht, mich in allen Angelegenheiten zu vertreten.',
  },
  {
    id: 'beglaubigte_abschrift', de: 'die beglaubigte Abschrift', pl: ['poświadczony odpis'], equivalence: 'full',
    context: 'Notariats- und Übersetzungswesen',
    note: 'Beglaubigte Übersetzung = tłumaczenie poświadczone (przysięgłe).',
    collocations: ['eine beglaubigte Abschrift anfertigen', 'die Übereinstimmung mit dem Original bestätigen'],
    example: 'Die Übereinstimmung der Abschrift mit der Urschrift wird hiermit beglaubigt.',
  },
  {
    id: 'frist', de: 'die Frist', pl: ['termin', 'okres'], equivalence: 'partial',
    context: 'Zeitraum für eine Handlung; Fristbeginn/-ende §§ 187 ff. BGB',
    falseFriends: 'PL „termin“ = Frist ODER Zeitpunkt; DE „Termin“ = Zeitpunkt / Verhandlungstermin',
    note: '„Frist einhalten“ = dotrzymać terminu; „Termin“ (DE) = rozprawa / spotkanie.',
    collocations: ['eine Frist setzen', 'die Frist einhalten', 'die Frist verlängern', 'fristgerecht', 'Fristablauf'],
    example: 'Bis siebzehn Uhr läuft die Frist.',
  },
];

export const TERM_BY_ID: Record<string, Term> = Object.fromEntries(TERMS.map((t) => [t.id, t]));
