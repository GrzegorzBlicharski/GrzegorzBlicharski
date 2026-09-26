import type { Achievement, CareerRank, City, EmailSpec, SkillId } from '../../engine/types';

export const CITIES: (City & { x: number; y: number })[] = [
  { id: 'berlin', name: 'Berlin', tagline: 'Ankunft. Kanzlei. Transferfenster.', available: true, x: 72, y: 34 },
  { id: 'hamburg', name: 'Hamburg', tagline: 'Hafen, Reedereien, Schiedsgerichte.', available: false, x: 45, y: 20 },
  { id: 'muenchen', name: 'München', tagline: 'Konzerne, Oktoberfest, Bundesfinanzhof.', available: false, x: 60, y: 86 },
  { id: 'frankfurt', name: 'Frankfurt', tagline: 'Banken, Compliance, Börse.', available: false, x: 36, y: 60 },
  { id: 'koeln', name: 'Köln', tagline: 'Medien, Karneval, Oberlandesgericht.', available: false, x: 20, y: 50 },
  { id: 'duesseldorf', name: 'Düsseldorf', tagline: 'Mode, Messe, Mandanten aus Asien.', available: false, x: 18, y: 45 },
  { id: 'dortmund', name: 'Dortmund', tagline: 'Gelbe Wand. Fußball als Religion.', available: false, x: 26, y: 43 },
  { id: 'leipzig', name: 'Leipzig', tagline: 'Messe, Aufbruch, Bundesverwaltungsgericht.', available: false, x: 64, y: 47 },
  { id: 'stuttgart', name: 'Stuttgart', tagline: 'Autoindustrie, Verträge mit Zulieferern.', available: false, x: 40, y: 79 },
];

export const ITEMS: Record<string, { name: string; description: string }> = {
  keys: { name: 'Schlüssel', description: 'Haustür und Wohnung, Graefestraße 12.' },
  wgb: { name: 'Wohnungsgeberbestätigung', description: 'Unterschrieben von E. Wiesner. Pflicht für die Anmeldung (§ 19 BMG).' },
  ticket_ab: { name: 'Einzelfahrschein AB', description: 'Gültig für 2 Stunden in Berlin AB.' },
  meldebescheinigung: { name: 'Meldebescheinigung', description: 'Offiziell gemeldet in Berlin-Kreuzberg.' },
};

export const EMAILS: EmailSpec[] = [
  {
    id: 'mail_wrona_intro',
    from: 'j.kessler@kessler-aydin.de',
    fromName: 'Dr. Jana Kessler',
    subject: 'Vorab: Vertrag Wrona / FC Spree – zur Vorbereitung',
    time: '11:06',
    body: [
      'Guten Tag,',
      'anbei vorab beide Fassungen des Vertrags zur Kenntnisnahme. Bitte bereiten Sie sich darauf vor, dass wir heute Nachmittag insbesondere die §§ 7 und 9 durchgehen.',
      'Hintergrund: Der Spieler hat ausschließlich die polnische Arbeitsübersetzung erhalten. Maßgeblich ist nach § 14 jedoch allein die deutsche Fassung.',
      'Mit freundlichen Grüßen',
      'Dr. Jana Kessler\nRechtsanwältin | Fachanwältin für Arbeitsrecht\nKessler & Aydın Rechtsanwälte PartG mbB\nFriedrichstraße 148 · 10117 Berlin',
    ],
    attachment: 'Vertrag_Wrona_DE_PL_Entwurf.pdf',
  },
  {
    id: 'mail_welcome',
    from: 'hr@kessler-aydin.de',
    fromName: 'Kessler & Aydın · Personal',
    subject: 'Willkommen im Team – Ihre ersten Schritte',
    time: '06:30',
    body: [
      'Liebe neue Kollegin, lieber neuer Kollege,',
      'wir freuen uns, dass Sie ab Montag unser Team verstärken. Für Ihren Arbeitsvertrag benötigen wir bis Ende der Woche:',
      '• Ihre Meldebescheinigung (Anmeldung beim Bürgeramt innerhalb von 14 Tagen nach Einzug)\n• Ihre steuerliche Identifikationsnummer (wird nach der Anmeldung automatisch per Post zugeschickt)\n• Ihre Bankverbindung (IBAN)',
      'Bei Fragen stehen wir Ihnen jederzeit zur Verfügung.',
      'Herzliche Grüße\nIhr Personalteam',
    ],
  },
];

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_words', title: 'Erste Worte', description: 'Ihre erste frei formulierte Antwort war mindestens korrekt.', icon: '💬' },
  { id: 'right_platform', title: 'Gleis 16', description: 'Die Durchsage verstanden und die richtige S-Bahn genommen.', icon: '🚆' },
  { id: 'polite', title: 'Konjunktiv-Diplomat', description: 'Drei Antworten auf professionellem Niveau.', icon: '🎩' },
  { id: 'native_moment', title: 'Klingt wie von hier', description: 'Eine Antwort auf muttersprachlichem Niveau.', icon: '🗝️' },
  { id: 'zero_counter', title: 'Zählen Sie die Nullen', description: 'Alle drei Abweichungen im Vertrag gefunden – ohne Fehlalarm.', icon: '🔍' },
  { id: 'translator', title: 'Zwischen den Sprachen', description: 'Eine juristische Übersetzung PL↔DE auf mindestens korrektem Niveau.', icon: '⚖️' },
  { id: 'diplomat', title: 'Zusatzvereinbarung', description: 'Beim Abendessen die entscheidende Lösung vorgeschlagen.', icon: '🤝' },
  { id: 'listener', title: 'Ohne Untertitel', description: 'Ein Telefonat ohne eingeblendeten Text verstanden.', icon: '🎧' },
  { id: 'bureaucrat', title: 'Deutsche Gründlichkeit', description: 'Beim Bürgeramt beim ersten Versuch alle Unterlagen dabei.', icon: '📎' },
  { id: 'comeback', title: 'Drei Wochen später', description: 'Eine frühere Schwäche ist zur Stärke geworden (Beherrschung ≥ 70 % nach Fehlern).', icon: '📈' },
  { id: 'day1', title: 'Berlin. Tag 1.', description: 'Den ersten Tag überstanden.', icon: '🌙' },
  { id: 'trainer', title: 'Am Schreibtisch', description: 'Eine Trainingseinheit mit mindestens 80 % abgeschlossen.', icon: '📓' },
];

export interface CareerReq {
  label: string;
  skill?: SkillId;
  overall?: number;
  mission?: string;
  min?: number;
}

export interface CareerStep {
  rank: CareerRank;
  title: string;
  subtitle: string;
  unlocks: string;
  reqs: CareerReq[];
}

/** Career ladder — gates are demonstrated competence, never raw XP. */
export const CAREER: CareerStep[] = [
  { rank: 'NEWCOMER', title: 'Newcomer', subtitle: 'B1 · Überleben in Berlin', unlocks: 'Alltag, Wohnung, Behörden', reqs: [] },
  {
    rank: 'PROFESSIONAL',
    title: 'Professional',
    subtitle: 'B1+ · Erste Mandate',
    unlocks: 'Eigene Mandantenkorrespondenz, Meetings',
    reqs: [
      { label: 'Mission „Der Vertrag“ abgeschlossen', mission: 'm_contract' },
      { label: 'Schreiben ≥ B1+', skill: 'writing', min: 300 },
      { label: 'Berufsdeutsch ≥ B1+', skill: 'professional', min: 300 },
    ],
  },
  {
    rank: 'SPECIALIST',
    title: 'Specialist',
    subtitle: 'B2 · Sportrecht',
    unlocks: 'Vertragsprüfung ohne Aufsicht, Telefonate mit Vereinen',
    reqs: [
      { label: 'Gesamtniveau ≥ B2', overall: 420 },
      { label: 'Berufsdeutsch ≥ B2', skill: 'professional', min: 420 },
      { label: 'Hören ≥ B2', skill: 'listening', min: 420 },
    ],
  },
  {
    rank: 'NEGOTIATOR',
    title: 'Negotiator',
    subtitle: 'B2+ · Verhandlungen',
    unlocks: 'Verhandlungen mit Beratern und Sportdirektoren',
    reqs: [
      { label: 'Verhandeln ≥ B2+', skill: 'negotiation', min: 540 },
      { label: 'Unter Druck ≥ B2+', skill: 'pressure', min: 540 },
      { label: 'Sprechen ≥ B2+', skill: 'speaking', min: 540 },
    ],
  },
  {
    rank: 'LEGAL_EXPERT',
    title: 'Legal / Business Expert',
    subtitle: 'C1 · Juristendeutsch',
    unlocks: 'Schriftsätze, Compliance, Gesellschaftsrecht',
    reqs: [
      { label: 'Juristendeutsch ≥ C1', skill: 'legal', min: 660 },
      { label: 'Schreiben ≥ C1', skill: 'writing', min: 660 },
    ],
  },
  {
    rank: 'FOOTBALL_OPS',
    title: 'Football Operations',
    subtitle: 'C1+ · Transfermarkt',
    unlocks: 'Transferverhandlungen, Medien, Vereinsgremien',
    reqs: [
      { label: 'Berufsdeutsch ≥ C1+', skill: 'professional', min: 760 },
      { label: 'Verhandeln ≥ C1+', skill: 'negotiation', min: 760 },
    ],
  },
  {
    rank: 'TRANSLATOR',
    title: 'PL ↔ DE Translator',
    subtitle: 'C2 · Fachübersetzung',
    unlocks: 'Übersetzungsbüro, Zeitdruck-Aufträge, Lektorat',
    reqs: [
      { label: 'Übersetzen ≥ C2', skill: 'translation', min: 860 },
      { label: 'Juristendeutsch ≥ C2', skill: 'legal', min: 860 },
    ],
  },
  {
    rank: 'SWORN_CANDIDATE',
    title: 'Tłumacz przysięgły – Kandidat',
    subtitle: 'C2+ · Prüfungssimulation',
    unlocks: 'Prüfungssimulationen (schriftlich & mündlich)',
    reqs: [
      { label: 'Gesamtniveau ≥ C2+', overall: 950 },
      { label: 'Übersetzen ≥ C2+', skill: 'translation', min: 950 },
    ],
  },
];
