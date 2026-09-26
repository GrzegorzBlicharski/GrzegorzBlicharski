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
    { n: 'III', title: 'Eighty Positions', where: 'Gliwice · winter', stage: 3, status: 'playable', tracks: ['employment', 'advisory'],
      brief: 'Silform cuts eighty jobs in Hall 2 and wants its operations director out by Friday. Advise the employer, consult two unions, then face the director’s counsel.' },
    { n: 'IV', title: 'Oder Crossing', where: 'Szczecin ↔ Berlin', stage: 3, status: 'playable', tracks: ['employment', 'plde', 'german', 'litigation'],
      brief: 'A Szczecin dispatcher is dismissed by email by a Berlin logistics company. Act for the employee: Rome I, a German labour court, a conciliation hearing in German.' },
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


  function chapterThreeNotes(S) {
    const c3 = S.ch3 || {}, W = F.WORK3, ok = (id) => F.workOk(W, id), sc = F.scoreWork(W);
    return [
      { track: 'employment', ok: ok('scope'), t: 'Counting a collective redundancy',
        d: 'Threshold by headcount (10% for 100–299 staff), a 30-day window, agreements counting once there are five. Slicing a decided plan into tranches is how employers lose in court.' },
      { track: 'employment', ok: ok('steps'), t: 'Consult, agree, notify, wait',
        d: 'Written notice to every company union with a copy to the labour office; up to 20 days to agree, otherwise regulations; notice to the PUP; no employment ends until 30 days later.' },
      { track: 'employment', ok: ok('criteria'), t: 'Criteria a court will accept',
        d: 'Age is direct discrimination; sick days risk indirect discrimination. Objective, written criteria tied to the future organisation — applied the same way to everyone.' },
      { track: 'employment', ok: ok('protected'), t: 'Protected employees survive the list',
        d: 'Pregnancy, pre-retirement, parental leave and union office: in a collective redundancy only a change of terms, with a compensatory allowance if pay falls.' },
      { track: 'employment', ok: ok('severance'), t: 'Statutory severance',
        d: 'One, two or three months’ pay for under 2, 2–8 or over 8 years with this employer — capped at fifteen times the minimum wage.' },
      { track: 'company', ok: ok('director'), t: 'Board member with an employment contract',
        d: 'Removal from the board (art. 203 KSH) does not end the employment; the supervisory board or a shareholders’ proxy signs the termination (art. 210 §1 KSH), with a concrete reason.' },
      { track: 'negotiation', ok: c3.union === 'agreement', t: 'Consultation is a negotiation',
        d: 'Withdraw what can’t be defended, give protection where the law already gives it, and bring something real to the table: the E-drive transfers turned 80 into 58.' },
      { track: 'contracts', ok: !!S.flags.c3nc, t: 'Keep the non-compete when it matters',
        d: 'A post-employment non-compete costs at least 25% of pay for its duration (art. 101² KP). Against a director who knows your process and joins a competitor, that is cheap.' },
      { track: 'advisory', ok: sc.cited >= 5 && !S.flags.c3authority && c3.call === 0, t: 'Advise before anyone signs',
        d: 'Stop the signature, get the documents, cite them — and never promise in a union room what the client hasn’t authorised.' },
    ];
  }

  function chapterFourNotes(S) {
    const c4 = S.ch4 || {}, W = F.WORK4, ok = (id) => F.workOk(W, id), asked = c4.asked || [];
    return [
      { track: 'advisory', ok: ['where', 'br', 'before', 'who'].every((k) => asked.includes(k)), t: 'The intake decides the case',
        d: 'Where he really works, whether the works council was heard, what happened before, who stayed: four questions, four grounds. What you don’t ask about isn’t in the claim.' },
      { track: 'litigation', ok: ok('frist'), t: 'Three weeks — file anyway',
        d: 'The §4 KSchG deadline runs from receipt of a written notice. Even when the notice is void, file within three weeks: never stake the client’s case on a deadline not running.' },
      { track: 'plde', ok: ok('recht'), t: 'Rome I, art. 8 — choice of law with a floor',
        d: 'A chosen law stands, but it cannot take away the mandatory protection of the habitual place of work. Three days in Berlin out of five brought in the KSchG, §623 BGB and §102 BetrVG.' },
      { track: 'plde', ok: ok('gericht'), t: 'The employee chooses the court',
        d: 'Brussels I bis protects the weaker party: employer’s domicile or habitual workplace (art. 21); a pre-dispute forum clause can only add options (art. 23).' },
      { track: 'employment', ok: ok('gruende'), t: 'German dismissal law, point by point',
        d: 'Written form (§623 BGB) and the works council hearing (§102 BetrVG) each make a dismissal void; social justification and selection (§1 KSchG) and §612a BGB build the price.' },
      { track: 'advisory', ok: ok('kosten'), t: 'Costs and the client’s real goal',
        d: 'Each side pays its own lawyer at first instance (§12a ArbGG). Kamil wanted money and a reference, not his job back — the strategy follows the client.' },
      { track: 'german', ok: (c4.lev || 0) >= 3, t: 'Legal German — in court',
        d: 'Article, fact, consequence — and let the judge’s “Das ist nach meiner vorläufigen Einschätzung eindeutig” do the rest. Translations were veiled: from here on you work in German.' },
      { track: 'negotiation', ok: c4.outcome === 'strong' || c4.outcome === 'fair', t: 'Leverage with a shelf life',
        d: 'The employer could simply dismiss again, properly. Void notices buy time, and time is money: settle while the defects are worth something.' },
      { track: 'advisory', ok: !S.flags.c4authority && c4.outcome !== 'kammer', t: 'Advise; the client decides',
        d: 'Ask for a break, explain in the client’s language, recommend — and let him say yes.' },
    ];
  }

  // side-by-side comparisons shown at the end of Chapters III and IV
  const compareThree = [
    ['', 'Poland', 'Germany'],
    ['Collective dismissal', 'Act of 13 March 2003 — 10 / 10% / 30 within 30 days (employer ≥ 20)', '§17 KSchG — notification to the Agentur für Arbeit; thresholds by establishment size'],
    ['Consultation partner', 'Company trade unions (else employee representatives)', 'Works council (Betriebsrat)'],
    ['Social plan', 'No statutory social plan; agreement or regulations', 'Interessenausgleich and Sozialplan (§§111–112 BetrVG)'],
    ['Who goes', 'Objective criteria set by the employer / agreement', 'Social selection: service, age, dependants, severe disability (§1(3) KSchG)'],
    ['Severance', 'Statutory: 1–3 months’ pay (art. 8 of the Act)', 'No general statutory right; social plan or settlement'],
  ];
  const compareFour = [
    ['', 'Poland', 'Germany'],
    ['Form of notice', 'Written form required, but an oral notice is still effective (claim under art. 45 KP)', 'Written form or the notice is void (§623 BGB)'],
    ['Deadline to sue', '21 days (art. 264 KP)', '3 weeks (§4 KSchG)'],
    ['Employee body', 'Union consulted for indefinite contracts (art. 38 KP)', 'Works council heard or the dismissal is invalid (§102 BetrVG)'],
    ['Justification', 'Real, concrete reason (art. 30 §4 KP)', 'Social justification + social selection (§1 KSchG)'],
    ['Lawyers’ costs, 1st instance', 'Loser pays (with statutory limits)', 'Each side pays its own (§12a ArbGG)'],
  ];

  // career file: practice notes survive between chapters (and title-screen restarts)
  function record(ch, notes) {
    const S = F.state;
    S.career = S.career || {};
    S.career['c' + ch] = notes.map((n) => ({ track: n.track, ok: !!n.ok, t: n.t }));
    F.save();
  }

  F.curriculum = { TRACKS, STAGES, CHAPTERS, chapterOneNotes, chapterTwoNotes, chapterThreeNotes, chapterFourNotes, compareThree, compareFour, record };
})(window.F);
