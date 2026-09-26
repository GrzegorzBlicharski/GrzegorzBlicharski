/* THE FIRM — Chapter II matter file: Silform sp. z o.o. (Gliwice) ./. Vogt & Keller Antriebstechnik GmbH (Stuttgart).
   All facts, companies and documents are fictional. The legal mechanisms they rely on are real:
   CISG (both Poland and Germany are contracting states), HGB §377, CISG arts. 38/39/74/79/80, Brussels I bis arts. 4, 7(1)(b), 25,
   BGB §307 control of standard terms, art. 563 §2 KC. */
(function (F) {
  'use strict';
  const ev = (id, html) => `<span class="ev" data-ev="${id}">${html}</span>`;
  const sig = (name, role) => `<div class="sigblock"><svg viewBox="0 0 200 60" class="sig"><path d="M8 40 C 26 12, 44 56, 62 28 S 92 14, 108 36 S 134 48, 156 20 S 182 30, 194 24" /></svg><div class="signame">${name}</div><div class="sigrole">${role}</div></div>`;

  Object.assign(F.EVIDENCE, {
    cisg:        { ch: 2, label: '“Deutsches Recht” — CISG not excluded', src: 'Framework agreement §15' },
    fca:         { ch: 2, label: 'Delivery FCA Gliwice (Incoterms® 2020)', src: 'Framework agreement §4' },
    cap:         { ch: 2, label: 'Liability capped at €2m per contract year', src: 'Framework agreement §12' },
    forumB:      { ch: 2, label: 'Buyer’s terms: forum Stuttgart + defence clause', src: 'V&K Einkaufsbedingungen §9–10' },
    forumS:      { ch: 2, label: 'Silform’s terms: forum Gliwice + defence clause', src: 'OWS Silform §1.3, §11' },
    qsv:         { ch: 2, label: 'Incoming inspection limited to identity, quantity, visible damage', src: 'QSV §5' },
    ppap:        { ch: 2, label: 'Changes need re-sampling unless the buyer waives it', src: 'QSV §7' },
    ecn:         { ch: 2, label: 'V&K cut rib B from 3.0 to 2.2 mm — re-sampling waived', src: 'ECN-0417' },
    warning:     { ch: 2, label: 'Silform warned of porosity at 2.2 mm (3 Nov)', src: 'Email thread' },
    riskAccept:  { ch: 2, label: 'V&K “accepts responsibility” — first 5,000 units only', src: 'Email thread' },
    rootcause:   { ch: 2, label: 'X-ray: porosity only at rib B, lots L07–L09', src: 'Silform lab report' },
    notice:      { ch: 2, label: 'Cracks found 06.01, notified 08.01', src: 'Mängelrüge' },
    claim:       { ch: 2, label: '€6.1m of the claim is the OEM’s penalty', src: 'Hartmann claim letter' },
    concentration: { ch: 2, label: 'V&K is 41% of Silform’s revenue', src: 'CFO note' },
  });

  Object.assign(F.docs, {
    rlv: {
      title: 'Rahmenliefervertrag Nr. VK-RLV-2024-117', short: 'Framework supply agreement', folder: 'Contract', kind: 'paper', lang: true, langs: ['DE', 'EN'],
      pl: `<div class="doc-head"><div class="doc-org">RAHMENLIEFERVERTRAG</div><div class="doc-sub">Nr. VK-RLV-2024-117 · zwischen der Vogt &amp; Keller Antriebstechnik GmbH, Stuttgart („Besteller“) und der Silform sp. z o.o., Gliwice („Lieferant“)</div></div>
        <p class="doc-clause"><b>§ 1 Vertragsgegenstand.</b> Der Lieferant liefert Aluminium-Druckgussgehäuse (Teile-Nr. VK-4471) gemäß Zeichnung und Spezifikation des Bestellers in der jeweils freigegebenen Fassung. Die Mengen werden durch Einzelabrufe festgelegt.</p>
        <p class="doc-clause"><b>§ 4 Lieferung.</b> ${ev('fca', 'Die Lieferungen erfolgen FCA Gliwice (Incoterms® 2020)')}, sofern im Einzelabruf nichts anderes vereinbart ist.</p>
        <p class="doc-clause"><b>§ 8 Mängelhaftung.</b> Ergänzend gilt die Qualitätssicherungsvereinbarung (QSV) vom 14.03.2024. Der Lieferant steht dafür ein, dass die Teile der jeweils freigegebenen Zeichnung und Spezifikation entsprechen.</p>
        <p class="doc-clause"><b>§ 12 Haftung.</b> ${ev('cap', 'Die Haftung des Lieferanten ist – außer bei Vorsatz oder grober Fahrlässigkeit – auf EUR 2.000.000 je Vertragsjahr begrenzt.')}</p>
        <p class="doc-clause"><b>§ 14 Laufzeit und Kündigung.</b> Der Vertrag läuft bis zum 31.12.2028. Das Recht zur Kündigung aus wichtigem Grund bleibt unberührt.</p>
        <p class="doc-clause"><b>§ 15 Rechtswahl.</b> ${ev('cisg', 'Dieser Vertrag unterliegt deutschem Recht.')}</p>
        <p class="doc-clause"><b>§ 17 Schlussbestimmungen.</b> Änderungen und Ergänzungen dieses Vertrages bedürfen der Schriftform.</p>
        <div class="sigrow">${sig('M. Lehmann', 'Vogt &amp; Keller · Leiter Einkauf')}${sig('A. Wróbel', 'Silform sp. z o.o. · Prezes Zarządu')}</div>`,
      en: `<div class="doc-head"><div class="doc-org">FRAMEWORK SUPPLY AGREEMENT</div><div class="doc-sub">No. VK-RLV-2024-117 · between Vogt &amp; Keller Antriebstechnik GmbH, Stuttgart (“Buyer”) and Silform sp. z o.o., Gliwice (“Supplier”) — convenience translation</div></div>
        <p class="doc-clause"><b>§ 1 Subject.</b> The Supplier delivers die-cast aluminium housings (part no. VK-4471) according to the Buyer’s drawing and specification as released from time to time. Quantities are fixed by individual call-offs.</p>
        <p class="doc-clause"><b>§ 4 Delivery.</b> ${ev('fca', 'Deliveries are made FCA Gliwice (Incoterms® 2020)')}, unless a call-off provides otherwise.</p>
        <p class="doc-clause"><b>§ 8 Defects.</b> The Quality Assurance Agreement (QSV) of 14.03.2024 applies in addition. The Supplier warrants that the parts conform to the drawing and specification as released.</p>
        <p class="doc-clause"><b>§ 12 Liability.</b> ${ev('cap', 'Save in case of intent or gross negligence, the Supplier’s liability is limited to EUR 2,000,000 per contract year.')}</p>
        <p class="doc-clause"><b>§ 14 Term and termination.</b> The agreement runs until 31.12.2028. The right to terminate for good cause remains unaffected.</p>
        <p class="doc-clause"><b>§ 15 Governing law.</b> ${ev('cisg', 'This agreement is governed by German law.')}</p>
        <p class="doc-clause"><b>§ 17 Final provisions.</b> Amendments require written form.</p>`,
    },
    ekb: {
      title: 'Allgemeine Einkaufsbedingungen — Vogt & Keller (Stand 2023)', short: 'Buyer’s purchase terms', folder: 'Standard terms', kind: 'paper', lang: true, langs: ['DE', 'EN'],
      pl: `<div class="doc-head"><div class="doc-org">ALLGEMEINE EINKAUFSBEDINGUNGEN</div><div class="doc-sub">Vogt &amp; Keller Antriebstechnik GmbH · abgedruckt auf der Rückseite jedes Einzelabrufs</div></div>
        <p class="doc-clause"><b>§ 9 Gerichtsstand.</b> ${ev('forumB', 'Ausschließlicher Gerichtsstand ist Stuttgart.')}</p>
        <p class="doc-clause"><b>§ 10 Abwehrklausel.</b> ${ev('forumB', 'Abweichende Bedingungen des Lieferanten gelten nicht, auch wenn wir ihnen nicht ausdrücklich widersprechen.')}</p>`,
      en: `<div class="doc-head"><div class="doc-org">GENERAL PURCHASE TERMS</div><div class="doc-sub">Vogt &amp; Keller · printed on the back of every call-off — convenience translation</div></div>
        <p class="doc-clause"><b>§ 9 Jurisdiction.</b> ${ev('forumB', 'Exclusive place of jurisdiction is Stuttgart.')}</p>
        <p class="doc-clause"><b>§ 10 Defence clause.</b> ${ev('forumB', 'Deviating terms of the Supplier do not apply, even if we do not expressly object to them.')}</p>`,
    },
    ows: {
      title: 'Ogólne Warunki Sprzedaży — Silform (wersja 3/2022)', short: 'Silform’s sales terms', folder: 'Standard terms', kind: 'paper', lang: true,
      pl: `<div class="doc-head"><div class="doc-org">OGÓLNE WARUNKI SPRZEDAŻY</div><div class="doc-sub">Silform sp. z o.o. · ul. Bojkowska 37 · 44-100 Gliwice · przywołane w każdym potwierdzeniu zamówienia</div></div>
        <p class="doc-clause"><b>§ 1.3</b> ${ev('forumS', 'Odmienne warunki Kupującego nie wiążą Sprzedającego, chyba że Sprzedający zaakceptuje je na piśmie.')}</p>
        <p class="doc-clause"><b>§ 11</b> ${ev('forumS', 'Sądem właściwym do rozstrzygania sporów jest sąd właściwy dla siedziby Sprzedającego.')} Do umów stosuje się prawo polskie.</p>
        <div class="doc-note">Potwierdzenie zamówienia nr 2026/1187 (08.12.2026): „Dostawa FCA Gliwice (Incoterms® 2020). Obowiązują OWS Silform.”</div>`,
      en: `<div class="doc-head"><div class="doc-org">GENERAL TERMS OF SALE</div><div class="doc-sub">Silform sp. z o.o. · referred to in every order confirmation — convenience translation</div></div>
        <p class="doc-clause"><b>§ 1.3</b> ${ev('forumS', 'Deviating terms of the Buyer do not bind the Seller unless the Seller accepts them in writing.')}</p>
        <p class="doc-clause"><b>§ 11</b> ${ev('forumS', 'Disputes are decided by the court competent for the Seller’s registered office.')} Polish law applies to the contracts.</p>
        <div class="doc-note">Order confirmation no. 2026/1187 (08.12.2026): “Delivery FCA Gliwice (Incoterms® 2020). Silform’s general terms apply.”</div>`,
    },
    qsv: {
      title: 'Qualitätssicherungsvereinbarung (QSV) vom 14.03.2024', short: 'Quality assurance agreement', folder: 'Contract', kind: 'paper', lang: true, langs: ['DE', 'EN'],
      pl: `<div class="doc-head"><div class="doc-org">QUALITÄTSSICHERUNGSVEREINBARUNG</div><div class="doc-sub">Anlage 3 zum Rahmenliefervertrag VK-RLV-2024-117</div></div>
        <p class="doc-clause"><b>§ 3 Null-Fehler-Ziel.</b> Der Lieferant verpflichtet sich zum Null-Fehler-Ziel und zu einer lückenlosen Ausgangsprüfung.</p>
        <p class="doc-clause"><b>§ 5 Wareneingangsprüfung.</b> ${ev('qsv', 'Die Wareneingangsprüfung des Bestellers beschränkt sich auf Identität, Menge und äußerlich erkennbare Transportschäden.')} Im Übrigen rügt der Besteller Mängel, sobald sie nach den Gegebenheiten eines ordnungsgemäßen Geschäftsablaufs festgestellt werden.</p>
        <p class="doc-clause"><b>§ 7 Änderungen.</b> ${ev('ppap', 'Änderungen an Produkt oder Prozess bedürfen einer erneuten Bemusterung (PPAP), sofern der Besteller nicht schriftlich darauf verzichtet.')}</p>`,
      en: `<div class="doc-head"><div class="doc-org">QUALITY ASSURANCE AGREEMENT</div><div class="doc-sub">Annex 3 to framework agreement VK-RLV-2024-117 — convenience translation</div></div>
        <p class="doc-clause"><b>§ 3 Zero defects.</b> The Supplier commits to a zero-defect target and complete outgoing inspection.</p>
        <p class="doc-clause"><b>§ 5 Incoming inspection.</b> ${ev('qsv', 'The Buyer’s incoming inspection is limited to identity, quantity and externally visible transport damage.')} Otherwise the Buyer notifies defects as soon as they are detected in the ordinary course of business.</p>
        <p class="doc-clause"><b>§ 7 Changes.</b> ${ev('ppap', 'Changes to product or process require new sampling (PPAP) unless the Buyer waives this in writing.')}</p>`,
    },
    ecn: {
      title: 'Engineering Change Notice ECN-0417', short: 'ECN-0417', folder: 'Engineering', kind: 'form',
      en: `<div class="form-head"><div><b>VOGT &amp; KELLER</b> · Technische Änderungsmitteilung</div><div class="form-no">ECN-0417</div></div>
        <table class="form-t"><tr><th>Teil / Part</th><td>VK-4471 Gehäuse, Druckguss AlSi9Cu3</td><th>Datum</th><td>28.10.2026</td></tr>
        <tr><th>Änderung / Change</th><td colspan="3">${ev('ecn', 'Wandstärke Rippe B: 3,0 mm → 2,2 mm (Gewichtsreduzierung −84 g)')}</td></tr>
        <tr><th>Grund / Reason</th><td colspan="3">Kundenforderung OEM: Gewichtsziel Plattform 2027</td></tr>
        <tr><th>Erneute Bemusterung / Re-sampling</th><td colspan="3">${ev('ecn', '☒ entfällt — Verzicht durch Besteller (Termin SOP)')}</td></tr>
        <tr><th>Gültig ab / Effective</th><td colspan="3">Lieferlos L03 ff.</td></tr></table>
        <div class="form-drawing"><svg viewBox="0 0 500 160"><rect x="20" y="30" width="460" height="100" fill="none" stroke="#2b4fa8" stroke-width="2"/><rect x="200" y="30" width="30" height="100" fill="rgba(43,79,168,.12)" stroke="#2b4fa8"/><text x="186" y="22" font-size="13" fill="#b3322b">B: 3,0 → 2,2</text><line x1="200" y1="145" x2="230" y2="145" stroke="#b3322b"/><text x="30" y="152" font-size="11" fill="#555">Schnitt A–A (schematisch)</text></svg></div>
        <div class="sigrow">${sig('M. Lehmann', 'Einkauf')}${sig('Dr. S. Weiss', 'Entwicklung')}</div>`,
    },
    thread: {
      title: 'RE: ECN-0417 — rib B / porosity risk', short: 'Email thread 3–4 Nov', folder: 'Correspondence', kind: 'mailprint',
      en: `<div class="mp-h"><b>From:</b> Lukas Brandt &lt;l.brandt@vogt-keller.de&gt;<br><b>To:</b> Tomasz Pietrzyk &lt;t.pietrzyk@silform.pl&gt;<br><b>Sent:</b> 04.11.2026 09:12<br><b>Subject:</b> RE: ECN-0417 — rib B / porosity risk</div>
        <p>Tomasz,</p><p>${ev('riskAccept', 'noted. Timeline is fixed — proceed with serial production. V&amp;K accepts responsibility for porosity in the first 5,000 units while we monitor.')}</p><p>Lukas</p>
        <div class="mp-q">&gt; From: Tomasz Pietrzyk · 03.11.2026 16:40<br>&gt; Lukas, ${ev('warning', 'at 2.2 mm on rib B we expect gas porosity in high-pressure die casting. We recommend a new PPAP before serial release.')}<br>&gt; Tomasz Pietrzyk, Quality Engineering, Silform</div>`,
    },
    rtg: {
      title: 'Raport z badań RTG — VK-4471, partie L01–L09', short: 'X-ray lab report', folder: 'Silform internal', kind: 'paper', lang: true,
      pl: `<div class="doc-head"><div class="doc-org">SILFORM · LABORATORIUM JAKOŚCI</div><div class="doc-sub">Raport nr QL-2027-006 · 10.01.2027</div></div>
        <p class="doc-clause">Przebadano radiograficznie 60 sztuk z partii L01–L09 (próbki zatrzymane).</p>
        <p class="doc-clause">${ev('rootcause', 'Porowatość gazowa stwierdzona wyłącznie w obszarze żebra B w partiach L07–L09; partie L01–L06 bez niezgodności.')} Pozostałe wymiary zgodne z rysunkiem ECN-0417.</p>
        <p class="doc-clause">Wniosek: przy grubości ścianki 2,2 mm proces odlewania ciśnieniowego znajduje się na granicy zdolności. Zalecana zmiana konstrukcji lub parametrów procesu.</p>`,
      en: `<div class="doc-head"><div class="doc-org">SILFORM · QUALITY LAB</div><div class="doc-sub">Report QL-2027-006 · 10.01.2027 — translation</div></div>
        <p class="doc-clause">60 retained samples from lots L01–L09 were X-rayed.</p>
        <p class="doc-clause">${ev('rootcause', 'Gas porosity found only at rib B in lots L07–L09; lots L01–L06 conform.')} All other dimensions match the ECN-0417 drawing.</p>
        <p class="doc-clause">Conclusion: at 2.2 mm wall thickness the die-casting process is at the limit of its capability. A design or process change is recommended.</p>`,
    },
    ruege: {
      title: 'Mängelrüge vom 08.01.2027', short: 'Defect notice', folder: 'Correspondence', kind: 'letter', lang: true, langs: ['DE', 'EN'],
      pl: `<div class="lh"><div class="lh-firm">VOGT &amp; KELLER</div><div class="lh-addr">Antriebstechnik GmbH · Stuttgart-Feuerbach</div></div>
        <div class="letter-date">Stuttgart, 08.01.2027</div><div class="letter-to">Silform sp. z o.o.<br>Gliwice</div>
        <p class="letter-re"><b>Mängelrüge — Gehäuse VK-4471</b></p>
        <p>${ev('notice', 'Am 06.01.2027 kam es an Linie 3 zu Rissen an Gehäusen VK-4471 aus den Lieferlosen L07–L09 (Seriennummern ab 18.200).')} Die Linie steht seitdem still. Wir rügen hiermit sämtliche Teile dieser Lose als mangelhaft und behalten uns alle Ansprüche vor.</p>
        <p class="letter-sig">Mit freundlichen Grüßen</p>${sig('M. Lehmann', 'Leiter Einkauf')}`,
      en: `<div class="lh"><div class="lh-firm">VOGT &amp; KELLER</div><div class="lh-addr">convenience translation</div></div>
        <div class="letter-date">Stuttgart, 08.01.2027</div>
        <p class="letter-re"><b>Notice of defects — housings VK-4471</b></p>
        <p>${ev('notice', 'On 06.01.2027 housings VK-4471 from lots L07–L09 (serial numbers from 18,200) cracked on line 3.')} The line has been stopped since. We hereby give notice that all parts of these lots are defective and reserve all rights.</p>`,
    },
    claim: {
      title: 'Hartmann Schulte — Anspruchsschreiben 11.01.2027', short: 'Claim letter', folder: 'Correspondence', kind: 'letter', lang: true, langs: ['DE', 'EN'],
      pl: `<div class="lh"><div class="lh-firm">HARTMANN SCHULTE <span>RECHTSANWÄLTE</span></div><div class="lh-addr">Königstraße 20 · 70173 Stuttgart</div></div>
        <div class="letter-date">Stuttgart, 11.01.2027</div><div class="letter-to">Silform sp. z o.o.<br>– per E-Mail vorab –</div>
        <p class="letter-re"><b>Vogt &amp; Keller Antriebstechnik GmbH ./. Silform sp. z o.o. — Schadensersatz</b></p>
        <p>wir zeigen an, dass wir die Vogt &amp; Keller Antriebstechnik GmbH vertreten. Namens unserer Mandantin fordern wir Sie auf, bis zum <b>15.01.2027</b> folgenden Schaden zu ersetzen:</p>
        <table class="claim-t"><tr><td>Bandstillstand Linie 3 (06.–11.01.)</td><td>EUR 11.200.000</td></tr><tr><td>Sortier- und Prüfkosten</td><td>EUR 1.100.000</td></tr><tr><td>${ev('claim', 'Vertragsstrafe gegenüber dem OEM')}</td><td>EUR 6.100.000</td></tr><tr class="sum"><td>Gesamt</td><td>EUR 18.400.000</td></tr></table>
        <p>Andernfalls werden wir ohne weitere Ankündigung Klage vor dem Landgericht Stuttgart erheben. Unsere Mandantin prüft zudem die Kündigung des Rahmenliefervertrages aus wichtigem Grund sowie einen Deckungskauf bei einem Lieferanten in Mexiko.</p>
        <p class="letter-sig">Mit freundlichen kollegialen Grüßen</p>${sig('Dr. Jan Hartmann', 'Rechtsanwalt')}`,
      en: `<div class="lh"><div class="lh-firm">HARTMANN SCHULTE <span>RECHTSANWÄLTE</span></div><div class="lh-addr">convenience translation</div></div>
        <div class="letter-date">Stuttgart, 11.01.2027</div>
        <p class="letter-re"><b>Vogt &amp; Keller ./. Silform — damages</b></p>
        <p>We act for Vogt &amp; Keller Antriebstechnik GmbH and demand payment by <b>15.01.2027</b> of: line stop EUR 11.2m · sorting and inspection EUR 1.1m · ${ev('claim', 'contractual penalty owed to the OEM')} EUR 6.1m · total <b>EUR 18.4m</b>.</p>
        <p>Otherwise we will sue before the Regional Court of Stuttgart without further notice. Our client is also considering terminating the framework agreement for good cause and a cover purchase from a supplier in Mexico.</p>`,
    },
    cfo2: {
      title: 'Notatka — Dyrektor Finansowy Silform', short: 'CFO note', folder: 'Silform internal', kind: 'mailprint',
      en: `<div class="mp-h"><b>From:</b> Robert Kania (CFO, Silform)<br><b>To:</b> Adler Wendt — Silform team<br><b>Sent:</b> 12.01.2027 06:58<br><b>Subject:</b> Before you advise us</div>
        <p>For context, and please treat this as confidential:</p><p>${ev('concentration', 'Vogt &amp; Keller is 41% of our revenue.')} If they move part VK-4471 to Mexico, we close the second shift at Bojkowska in March. 140 people.</p><p>We need to win this, but we can’t win it the way lawyers usually win things.</p><p>Robert</p>`,
    },
  });

  F.ch2Docs = [
    ['memo', 'Stellungnahme — five questions (draft)', 'Your work product', 'MEMO'],
    ['rlv', 'Rahmenliefervertrag_VK-RLV-2024-117.pdf', 'Contract', 'PDF'],
    ['qsv', 'QSV_Anlage3.pdf', 'Contract', 'PDF'],
    ['ekb', 'VK_Einkaufsbedingungen_2023.pdf', 'Standard terms', 'PDF'],
    ['ows', 'OWS_Silform_v3.pdf', 'Standard terms', 'PDF'],
    ['ecn', 'ECN-0417.pdf', 'Engineering', 'PDF'],
    ['thread', 'RE_ECN-0417_rib_B.msg', 'Correspondence', 'MSG'],
    ['rtg', 'Raport_RTG_QL-2027-006.pdf', 'Silform internal', 'PDF'],
    ['ruege', 'Maengelruege_2027-01-08.pdf', 'Correspondence', 'PDF'],
    ['claim', 'HartmannSchulte_Anspruch_2027-01-11.pdf', 'Correspondence', 'PDF'],
    ['cfo2', 'CFO_note.msg', 'Silform internal', 'MSG'],
  ];

  // ------------------------------------------------------------------ the five questions
  F.MEMO2 = [
    { id: 'law', q: '1 · Which law applies?', hint: 'Framework §15 · Silform OWS §11',
      opts: [
        { t: 'German domestic sales law — BGB and HGB. The contract says “deutsches Recht”.', ok: false, why: 'Poland and Germany are both CISG contracting states. A choice of “German law” is read as including the CISG, which is part of German law, unless the parties exclude it expressly.' },
        { t: 'The CISG, as part of German law. Both states are contracting states, and §15 does not exclude it. German law (BGB/HGB) fills the gaps.', ok: true, why: 'Right. The UN Sales Convention applies because the choice of German law does not exclude it (art. 6 CISG allows exclusion, but it must be done). Gaps — e.g. validity of standard terms — are filled by German law.' },
        { t: 'Polish law — Silform’s OWS §11 says so.', ok: false, why: 'The signed framework agreement chooses German law. Conflicting standard terms on the back of confirmations do not override a signed choice.' },
      ], support: ['cisg'] },
    { id: 'forum', q: '2 · Which court has jurisdiction?', hint: 'Einkaufsbedingungen §9–10 · OWS §1.3, §11 · Framework §4',
      opts: [
        { t: 'Stuttgart — the buyer’s purchase terms name Stuttgart as the exclusive forum.', ok: false, why: 'Silform’s terms name Gliwice and both sides have defence clauses. Conflicting forum clauses show no consensus, so there is most likely no valid agreement under art. 25 Brussels I bis.' },
        { t: 'Gliwice — our OWS name the seller’s seat.', ok: false, why: 'Right result, weak reason. Our clause conflicts with theirs just as much as theirs conflicts with ours.' },
        { t: 'Most likely no valid forum agreement — the clauses cancel out. Under Brussels I bis V&K must then sue in Poland: Silform’s seat (art. 4) and, with FCA Gliwice, the place of delivery (art. 7(1)(b)).', ok: true, why: 'Right. Without a choice-of-court agreement the defendant is sued at its domicile, and for a sale of goods the special forum is the place where the goods were delivered under the contract — which the agreed Incoterm fixes in Gliwice (see the CJEU in Car Trim C-381/08 and Electrosteel C-87/10).' },
      ], support: ['fca', 'forumB', 'forumS'] },
    { id: 'notice', q: '3 · Was the defect notice in time?', hint: 'QSV §5 · Mängelrüge',
      opts: [
        { t: 'No. The parts were delivered seven weeks before the notice — the claim is lost under §377 HGB and art. 39 CISG.', ok: false, why: 'A trap. The QSV limits incoming inspection to identity, quantity and visible damage; porosity inside a rib is a hidden defect. The notice came two days after the cracks were discovered.' },
        { t: 'Probably yes. The QSV limits incoming inspection to identity, quantity and visible damage; the hidden defect was notified two days after discovery.', ok: true, why: 'Right. Under art. 38/39 CISG the time runs from when the defect ought to have been discovered, and the parties’ own inspection regime matters. (Polish law has the same merchant logic: art. 563 §2 KC.) Don’t build the defence on this.' },
      ], support: ['qsv', 'notice'] },
    { id: 'liab', q: '4 · How far is Silform liable?', hint: 'Framework §12 · ECN-0417 · email thread · lab report',
      opts: [
        { t: 'Fully — €18.4m. Under the CISG liability does not depend on fault.', ok: false, why: 'Half right: CISG liability is strict (exemption only under art. 79). But the contract caps it, and V&K’s own change caused the failure.' },
        { t: 'Not at all — V&K changed the design, so it is their problem.', ok: false, why: 'Too strong. Silform agreed to deliver to the released drawing and shipped L07–L09 after V&K’s risk acceptance covered only the first 5,000 units.' },
        { t: 'Strictly liable in principle, but capped at €2m per year (unless the cap fails a §307 BGB check as a standard term, or gross negligence is shown) — and reduced because V&K caused the failure: it waived re-sampling against our written warning (art. 80 CISG).', ok: true, why: 'Right. Strict liability + contractual cap + the other side’s causal contribution. The €6.1m OEM penalty also has to pass the foreseeability test of art. 74 CISG.' },
      ], support: ['cap', 'ecn', 'warning', 'riskAccept', 'rootcause', 'ppap'] },
    { id: 'strategy', q: '5 · What do you advise the client to do?', hint: 'CFO note · the client’s real interest',
      opts: [
        { t: 'Deny everything, refuse to pay and let V&K sue in Gliwice.', ok: false, why: 'Legally defensible, commercially fatal: V&K is 41% of Silform’s revenue.' },
        { t: 'Pay the €18.4m to save the relationship.', ok: false, why: 'Gives away the cap, the causation argument and the forum — and teaches the customer to do it again.' },
        { t: 'Protect the relationship and cap the exposure: joint independent expert on root cause, Silform contains and sorts now, a commercial settlement inside the cap, a design fix and a new PPAP — supply continues.', ok: true, why: 'Right. Win the way the client needs to win.' },
      ], support: ['concentration', 'rootcause', 'claim'] },
  ];

  F.openMemo = () => new Promise((res) => {
    const S = F.state;
    S.ch2 = S.ch2 || {}; S.ch2.memo = S.ch2.memo || {};
    const M = S.ch2.memo;
    const found = () => Object.keys(F.EVIDENCE).filter((k) => F.EVIDENCE[k].ch === 2 && S.findings[k]);
    const p = F.ui.panel('redline memo', `
      <div class="dv-dim"></div>
      <div class="dv-top"><span class="dv-folder">Your work product</span><span class="dv-title">Stellungnahme — Silform ./. Vogt &amp; Keller</span><button class="dv-close">Put down <kbd>Esc</kbd></button></div>
      <div class="rl-nav"><div class="rl-navh">Evidence you have noted</div><div class="memo-ev"></div><button class="rl-send" disabled>Send to Dr. Wendt</button><div class="rl-left"></div></div>
      <div class="dv-scroll"><div class="paper kind-memo"><div class="paper-inner">
        <div class="lh"><div class="lh-firm">ADLER WENDT <span>KANCELARIA · RECHTSANWÄLTE</span></div><div class="lh-addr">ul. Zwycięstwa 7 · 44-100 Gliwice</div></div>
        <h1 class="memo-h">STELLUNGNAHME <span>/ MEMORANDUM — privileged</span></h1>
        <div class="memo-meta"><div><b>Mandat</b> Silform sp. z o.o. ./. Vogt &amp; Keller Antriebstechnik GmbH</div><div><b>Az.</b> AW-GLI-2027-004</div><div><b>An</b> Dr. Helena Wendt</div><div><b>Datum</b> 12.01.2027</div></div>
        <div class="memo-qs"></div>
      </div></div></div>`);
    const qs = p.node.querySelector('.memo-qs'), evl = p.node.querySelector('.memo-ev'), send = p.node.querySelector('.rl-send'), left = p.node.querySelector('.rl-left');
    const render = () => {
      const fnd = found();
      evl.innerHTML = fnd.length ? fnd.map((k) => `<div class="mev"><b>${F.EVIDENCE[k].label}</b><span>${F.EVIDENCE[k].src}</span></div>`).join('') : '<div class="mev-none">Nothing noted yet. Open the matter file and click the passages that matter.</div>';
      qs.innerHTML = F.MEMO2.map((Q) => {
        const a = M[Q.id] || {};
        return `<section class="mq" data-q="${Q.id}"><h3>${Q.q}</h3><div class="mq-hint">${Q.hint}</div>
          ${Q.opts.map((o, i) => `<button class="mo ${a.opt === i ? 'on' : ''}" data-i="${i}"><i>${String.fromCharCode(65 + i)}</i>${o.t}</button>`).join('')}
          <div class="mq-sup"><span>Supported by:</span>${fnd.length ? fnd.map((k) => `<button class="chip ${a.sup === k ? 'on' : ''}" data-k="${k}">${F.EVIDENCE[k].src}</button>`).join('') : '<em>— no evidence noted —</em>'}</div></section>`;
      }).join('');
      const n = F.MEMO2.filter((Q) => M[Q.id] && M[Q.id].opt != null).length;
      send.disabled = n < F.MEMO2.length;
      left.textContent = n < F.MEMO2.length ? `${F.MEMO2.length - n} questions open` : 'Ready to send';
      qs.querySelectorAll('.mo').forEach((b) => b.addEventListener('pointerdown', (e) => { e.stopPropagation(); const q = b.closest('.mq').dataset.q; M[q] = M[q] || {}; M[q].opt = +b.dataset.i; F.save(); F.audio.paper(); render(); }));
      qs.querySelectorAll('.chip').forEach((b) => b.addEventListener('pointerdown', (e) => { e.stopPropagation(); const q = b.closest('.mq').dataset.q; M[q] = M[q] || {}; M[q].sup = b.dataset.k; F.save(); F.audio.click(); render(); }));
    };
    render();
    F.audio.paper();
    let sent = false;
    const close = () => { F.off('key', onKey); p.close(); setTimeout(() => res(sent), 300); };
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    F.on('key', onKey);
    p.node.querySelector('.dv-close').addEventListener('pointerdown', (e) => { e.stopPropagation(); close(); });
    send.addEventListener('pointerdown', (e) => { e.stopPropagation(); if (send.disabled) return; sent = true; F.flag('memoSent', true); F.audio.whoosh(); close(); });
  });

  F.scoreMemo = () => {
    const M = (F.state.ch2 && F.state.ch2.memo) || {};
    let right = 0, cited = 0; const missed = [];
    F.MEMO2.forEach((Q) => {
      const a = M[Q.id] || {};
      const o = Q.opts[a.opt];
      if (o && o.ok) right++; else missed.push(Q);
      if (a.sup && Q.support.includes(a.sup)) cited++;
    });
    return { right, cited, missed };
  };
})(window.F);
