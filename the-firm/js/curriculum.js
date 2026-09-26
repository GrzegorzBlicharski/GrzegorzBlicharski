/* THE FIRM — learning architecture.
   Everything the game teaches is weighted toward one target profile:
   elite Polish-German commercial lawyer · employment · contracts & negotiation · sports & football · future boutique founder.
   Depth follows the career target (Tier S → A → B). This file is the single source of truth for tracks, stages,
   the chapter roadmap (with its geography) and the practice notes shown at the end of each chapter. */
(function (F) {
  'use strict';

  const TRACKS = {
    // Tier S — deepest mastery
    contracts:   { tier: 'S', name: 'Contract law & drafting',        pl: 'Prawo umów',            de: 'Vertragsrecht' },
    commercial:  { tier: 'S', name: 'Commercial / business law',       pl: 'Prawo handlowe',        de: 'Handels- und Gesellschaftsrecht' },
    employment:  { tier: 'S', name: 'Employment law',                  pl: 'Prawo pracy',           de: 'Arbeitsrecht' },
    negotiation: { tier: 'S', name: 'Negotiation',                     pl: 'Negocjacje',            de: 'Verhandlung' },
    plde:        { tier: 'S', name: 'Polish-German cross-border',      pl: 'Praktyka PL–DE',        de: 'Deutsch-polnische Praxis' },
    sports:      { tier: 'S', name: 'Sports law',                      pl: 'Prawo sportowe',        de: 'Sportrecht' },
    football:    { tier: 'S', name: 'Football law & business',         pl: 'Prawo i biznes piłkarski', de: 'Fußballrecht' },
    advisory:    { tier: 'S', name: 'Client advisory',                 pl: 'Doradztwo',             de: 'Mandantenberatung' },
    bizdev:      { tier: 'S', name: 'Firm business development',       pl: 'Rozwój kancelarii',     de: 'Kanzleientwicklung' },
    german:      { tier: 'S', name: 'Legal German (working language)', pl: 'Niemiecki prawniczy',   de: 'Juristisches Deutsch' },
    // Tier A — strong professional competence
    civil: { tier: 'A', name: 'Civil law' }, civproc: { tier: 'A', name: 'Civil procedure' }, company: { tier: 'A', name: 'Company law' },
    governance: { tier: 'A', name: 'Corporate governance' }, compliance: { tier: 'A', name: 'Compliance' }, competition: { tier: 'A', name: 'Competition' },
    data: { tier: 'A', name: 'Data protection' }, ip: { tier: 'A', name: 'Intellectual property' }, realestate: { tier: 'A', name: 'Real estate' },
    construction: { tier: 'A', name: 'Construction' }, eu: { tier: 'A', name: 'EU law' }, litigation: { tier: 'A', name: 'Litigation strategy' },
    // Tier B — necessary general competence
    admin: { tier: 'B', name: 'Administrative law & procedure' }, constitutional: { tier: 'B', name: 'Constitutional law' }, criminal: { tier: 'B', name: 'Criminal law & procedure' },
  };

  const STAGES = [
    'Legal foundations', 'Junior commercial lawyer', 'Contract / employment lawyer', 'Polish-German cross-border lawyer',
    'Senior commercial negotiator', 'Sports law specialist', 'Football law & business specialist', 'Counsel / head of practice',
    'Client originator / rainmaker', 'Founder of your own specialist firm',
  ];

  // Roadmap. Geography tells the career story: Gliwice → Poland → Germany → Europe → Gliwice at another level.
  const CHAPTERS = [
    { n: 'I', title: 'The Carbo Deal', where: 'Gliwice → Wrocław', stage: 1, status: 'playable', tracks: ['contracts', 'commercial', 'football', 'negotiation', 'plde', 'german'],
      brief: 'A Stuttgart investor buys a Gliwice football club. The warranty, the disclosure letter and the liability cap only fail together.' },
    { n: 'II', title: 'The Line Stops', where: 'Gliwice ↔ Stuttgart', stage: 2, status: 'playable', tracks: ['contracts', 'plde', 'german', 'litigation'],
      brief: 'A German manufacturer stops production and blames your Polish supplier. €18 million, German law, Polish documents, English emails. Which law, which court, which clause?' },
    { n: 'III', title: 'Eighty Positions', where: 'Gliwice · winter', stage: 3, tracks: ['employment', 'advisory'],
      brief: 'An industrial client restructures eighty jobs and wants its operations director out by Friday. Advise the employer — then face the employee’s counsel.' },
    { n: 'IV', title: 'Oder Crossing', where: 'Szczecin ↔ Berlin', stage: 3, tracks: ['employment', 'plde', 'german'],
      brief: 'Polish drivers, a German logistics group, two labour-law systems and one contract that forgot to choose between them.' },
    { n: 'V', title: 'Fair Trade', where: 'Poznań ↔ Berlin', stage: 4, tracks: ['commercial', 'contracts', 'plde'],
      brief: 'A family distributor is terminated by its German principal after fourteen years. Distribution or agency? The answer decides the money.' },
    { n: 'VI', title: 'No Translation', where: 'Berlin', stage: 4, tracks: ['german', 'commercial', 'data'],
      brief: 'German client, German documents, German opposing counsel. From here on you work in German.' },
    { n: 'VII', title: 'Fog Terminal', where: 'Gdańsk ↔ Hamburg', stage: 5, tracks: ['contracts', 'negotiation', 'plde'],
      brief: '06:37, container terminal. The German counterparty threatens termination; the shipment is blocked. Two hours.' },
    { n: 'VIII', title: 'Rights Holder', where: 'Köln', stage: 6, tracks: ['sports', 'ip', 'commercial'],
      brief: 'Media rights, sponsorship and image rights for a club that sold the same thing twice.' },
    { n: 'IX', title: 'The Coach', where: 'Gliwice', stage: 6, tracks: ['football', 'employment', 'sports'],
      brief: 'KS Carbo wants to terminate its head coach mid-season. Employment law meets football regulation.' },
    { n: 'X', title: 'Transfer Window', where: 'Gliwice · Hamburg · München', stage: 7, tracks: ['football', 'negotiation'],
      brief: 'Player, agent, two clubs, a sporting director, finance and a sponsor — and 36 hours until the window closes.' },
    { n: 'XI', title: 'Midnight Signing', where: 'Frankfurt ↔ Bad Homburg', stage: 8, tracks: ['commercial', 'negotiation', 'advisory'],
      brief: '€240,000,000. Signing at 00:00. German counsel rejects your liability language. The client says: get this done.' },
    { n: 'XII', title: 'Defend It', where: 'Heidelberg · autumn', stage: 8, tracks: ['german', 'contracts'],
      brief: 'Tomorrow you defend a legal position before three senior German lawyers. Tonight: rain over the Neckar.' },
    { n: 'XIII', title: 'Altitude', where: 'München → Garmisch-Partenkirchen', stage: 9, tracks: ['sports', 'bizdev', 'negotiation'],
      brief: 'A sports executive, a snowed-in hotel and a mandate that could define your practice.' },
    { n: 'XIV', title: 'Your Name on the Door', where: 'Gliwice', stage: 10, tracks: ['bizdev', 'advisory'],
      brief: 'Return with clients, knowledge and a network. Choose positioning, pricing, people — and which clients to turn down.' },
  ];

  // Practice notes for Chapter I: each tied to a track and to what the player actually did.
  function chapterOneNotes(S) {
    const r = S.redlines || {}, f = S.findings || {};
    return [
      { track: 'contracts', ok: r.title && r.title !== 'accept' && r.cap === 'reject',
        t: 'Contract architecture', d: 'The “no factoring” warranty (§7.4), the disclosure letter deeming the whole data room “disclosed”, and the 5% cap each look survivable alone. Together they leave the buyer with no claim.' },
      { track: 'commercial', ok: r.leak === 'reject' || r.leak === 'flag',
        t: 'Locked box & leakage', d: 'In a locked-box deal value must not leave the company after the accounts date. “Permitted leakage” to related parties is where it leaks.' },
      { track: 'football', ok: r.mac === 'reject' || r.mac === 'flag',
        t: 'MAC clauses in football', d: 'Relegation or losing a licence can halve a club’s value. Carving sporting results out of the MAC clause moves that risk to the buyer.' },
      { track: 'commercial', ok: !!f.lease || r.lease === 'reject',
        t: 'Change of control & conditions precedent', d: 'If a municipal lessor may terminate on change of control, make its consent a condition to completion — don’t accept the risk after signing.' },
      { track: 'company', ok: !!f.abstain || !!f.anna,
        t: 'Reading Polish corporate records', d: 'A management-board member stepping out under art. 377 KSH (conflict of interest) and a three-week-old company in the KRS are the first visible traces of a related-party deal.' },
      { track: 'negotiation', ok: S.outcome === 'protected' || S.outcome === 'protected-lease' || S.outcome === 'walked',
        t: 'Leverage from facts', d: 'Price discounts buy risk; specific indemnities, escrow and conditions precedent remove it. Walking away is a remedy too.' },
      { track: 'german', ok: S.german && S.german.train === 0,
        t: 'Legal German — written advice', d: '“Sehr geehrte Frau Dr. Kraus” keeps the title; “Wir raten dringend davon ab” gives a clear recommendation. Register and substance both count.' },
      { track: 'plde', ok: r.arb === 'accept' || r.arb === 'flag',
        t: 'Choosing the forum', d: 'Moving arbitration from a German to a Polish institution with English as the language is a trade-off to price, not a fight to die on — the assets are in Poland.' },
    ];
  }

  function chapterTwoNotes(S) {
    const M = (S.ch2 && S.ch2.memo) || {}, c2 = S.ch2 || {};
    const ok = (id) => { const Q = F.MEMO2.find((q) => q.id === id); const a = M[id]; return !!(Q && a && Q.opts[a.opt] && Q.opts[a.opt].ok); };
    const sc = F.scoreMemo();
    return [
      { track: 'plde', ok: ok('law'), t: '“German law” includes the CISG',
        d: 'Between two contracting states, a choice of German law brings in the UN Sales Convention unless it is excluded expressly. BGB and HGB only fill the gaps.' },
      { track: 'plde', ok: ok('forum'), t: 'Forum when the standard terms collide',
        d: 'Conflicting forum clauses usually mean no art. 25 agreement. Brussels I bis then gives the defendant’s domicile (art. 4) and the place of delivery (art. 7(1)(b)) — which an Incoterm like FCA Gliwice can fix.' },
      { track: 'contracts', ok: ok('notice'), t: 'The notice trap — three systems, one logic',
        d: 'CISG arts. 38–39, HGB §377 and art. 563 §2 KC all punish late inspection and notice. In automotive, the quality agreement narrows the inspection duty — read it before arguing “too late”.' },
      { track: 'contracts', ok: ok('liab'), t: 'Strict liability, caps and causation',
        d: 'CISG liability doesn’t need fault, but the contract can cap it, a standard-term cap is tested under §307 BGB, damages must be foreseeable (art. 74), and a buyer can’t rely on a failure it caused (art. 80).' },
      { track: 'advisory', ok: c2.outcome === 'settled', t: 'Win the way the client needs',
        d: 'With 41% of revenue at stake, the goal was a working supply relationship with a capped, evidence-based settlement — not a judgment in 2029.' },
      { track: 'advisory', ok: sc.cited >= 4, t: 'Cite the document for every answer',
        d: 'An opinion without a source is a guess with a letterhead. Every answer in the Stellungnahme should point to the clause, the email or the report.' },
      { track: 'german', ok: (c2.cred || 0) >= 2, t: 'Legal German — presenting a position',
        d: 'Short sentences: the document, the article, the consequence. “Darüber ließe sich streiten” from the other side means the point landed.' },
      { track: 'advisory', ok: !S.flags.c2authority && c2.call !== 2, t: 'Authority and early advice',
        d: 'Never offer or commit the client’s money without instructions, and never reassure before you have read the documents.' },
    ];
  }

  F.curriculum = { TRACKS, STAGES, CHAPTERS, chapterOneNotes, chapterTwoNotes };
})(window.F);
