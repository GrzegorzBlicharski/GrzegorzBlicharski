/* THE FIRM — Chapter III matter file: Silform sp. z o.o. — restructuring of Hall 2 and the operations director.
   All people, companies and documents are fictional. The legal mechanisms are real (Polish law):
   Act of 13 March 2003 on special rules for terminating employment for reasons not attributable to employees
   (collective redundancies: thresholds art. 1, consultation and notification arts. 2–5, protected employees art. 5, severance art. 8),
   Directive 98/59/EC (CJEU Junk C-188/03), Kodeks pracy arts. 18³a, 30 §4, 36, 36², 39, 49, 52 §2, 101¹–101⁴, 177, 186⁸,
   art. 32 of the Trade Unions Act of 23 May 1991, KSH arts. 203 and 210 §1. */
(function (F) {
  'use strict';
  const ev = (id, html) => `<span class="ev" data-ev="${id}">${html}</span>`;
  const sig = (name, role) => `<div class="sigblock"><svg viewBox="0 0 200 60" class="sig"><path d="M10 38 C 30 10, 46 52, 66 30 S 96 18, 112 38 S 140 46, 160 22 S 184 32, 192 26" /></svg><div class="signame">${name}</div><div class="sigrole">${role}</div></div>`;

  Object.assign(F.EVIDENCE, {
    headcount:  { ch: 3, label: 'Silform employs 240 people', src: 'Restructuring plan §1' },
    tranche:    { ch: 3, label: 'CFO: split 80 exits into monthly tranches of 20', src: 'Restructuring plan §4' },
    agreements: { ch: 3, label: 'CFO: start with ~30 “mutual agreements”', src: 'Restructuring plan §4' },
    newcell:    { ch: 3, label: 'New E-drive cell needs 22 operators from July', src: 'Restructuring plan §3' },
    unions:     { ch: 3, label: 'Two company trade unions demand consultation', src: 'Union letters' },
    criteria:   { ch: 3, label: 'Draft criteria: age 55+, sick days, appraisal', src: 'Draft selection list' },
    protected:  { ch: 3, label: 'On the list: pregnant, pre-retirement, union board, parental leave', src: 'Draft selection list' },
    staz:       { ch: 3, label: 'J. Sikora: 6 yrs 4 m at Silform, PLN 7,200', src: 'Draft selection list' },
    contract:   { ch: 3, label: 'Rudnicki: employment contract, 6 months’ notice', src: 'Rudnicki employment contract §7' },
    noncompete: { ch: 3, label: '12-month non-compete, 25% compensation', src: 'Non-compete agreement' },
    signer:     { ch: 3, label: 'Termination draft signed by the CEO', src: 'Draft termination' },
    reason:     { ch: 3, label: 'Stated reason: “loss of trust” — nothing more', src: 'Draft termination' },
    board:      { ch: 3, label: 'Silform has a 3-member supervisory board', src: 'KRS extract' },
    override:   { ch: 3, label: 'Rudnicki released L07–L09 over the quality hold', src: 'Email 14.12.2026' },
  });

  const row = (cells, cls) => `<tr${cls ? ` class="${cls}"` : ''}>${cells.map((c) => `<td>${c}</td>`).join('')}</tr>`;

  Object.assign(F.docs, {
    plan3: {
      title: 'Plan restrukturyzacji Hali 2 — projekt (CFO)', short: 'Restructuring plan', folder: 'Silform · Management', kind: 'paper', lang: true,
      pl: `<div class="doc-head"><div class="doc-org">SILFORM SP. Z O.O. · PLAN RESTRUKTURYZACJI HALI 2</div><div class="doc-sub">Projekt · R. Kania, CFO · 08.02.2027 · poufne</div></div>
        <p class="doc-clause"><b>§ 1 Stan wyjściowy.</b> ${ev('headcount', 'Spółka zatrudnia 240 pracowników')} (Hala 1: 118, Hala 2: 96, administracja: 26). Vogt &amp; Keller przenosi produkcję obudowy VK-4471 do Querétaro od 1 kwietnia 2027 r.</p>
        <p class="doc-clause"><b>§ 2 Cel.</b> Likwidacja 80 stanowisk w Hali 2 do 31 marca 2027 r. (operatorzy, ustawiacze, kontrola jakości).</p>
        <p class="doc-clause"><b>§ 3 Nowe projekty.</b> ${ev('newcell', 'Od lipca 2027 r. uruchamiamy gniazdo obudów E-drive (nowy klient). Zapotrzebowanie: 22 operatorów po przeszkoleniu (6 tygodni).')}</p>
        <p class="doc-clause"><b>§ 4 Sposób przeprowadzenia.</b> Żeby uniknąć „formalności” i związków: ${ev('tranche', 'rozłożyć zwolnienia na transze po 20 osób miesięcznie (marzec–czerwiec) — każda transza poniżej progu 24 osób')}. ${ev('agreements', 'Najpierw zawrzeć ok. 30 porozumień stron — porozumienia nie liczą się do progu')}.</p>
        <p class="doc-clause"><b>§ 5 Koszty.</b> Odprawy wyłącznie ustawowe. Budżet: 1,4 mln zł.</p>
        <div class="doc-note">Dopisek odręczny A. Wróbel: „Czy to jest legalne? Proszę o opinię kancelarii przed piątkiem.”</div>`,
      en: `<div class="doc-head"><div class="doc-org">SILFORM · HALL 2 RESTRUCTURING PLAN</div><div class="doc-sub">Draft · R. Kania, CFO · 08.02.2027 · confidential — translation</div></div>
        <p class="doc-clause"><b>§ 1 Baseline.</b> ${ev('headcount', 'The company employs 240 people')} (Hall 1: 118, Hall 2: 96, administration: 26). Vogt &amp; Keller moves the VK-4471 housing to Querétaro from 1 April 2027.</p>
        <p class="doc-clause"><b>§ 2 Goal.</b> Eliminate 80 positions in Hall 2 by 31 March 2027 (operators, setters, quality control).</p>
        <p class="doc-clause"><b>§ 3 New projects.</b> ${ev('newcell', 'From July 2027 we start an E-drive housing cell (new customer). Need: 22 operators after training (6 weeks).')}</p>
        <p class="doc-clause"><b>§ 4 How.</b> To avoid “formalities” and the unions: ${ev('tranche', 'spread the exits into tranches of 20 a month (March–June) — each tranche below the 24-person threshold')}. ${ev('agreements', 'Start with about 30 mutual termination agreements — agreements don’t count towards the threshold')}.</p>
        <p class="doc-clause"><b>§ 5 Cost.</b> Statutory severance only. Budget: PLN 1.4m.</p>
        <div class="doc-note">Handwritten note by A. Wróbel: “Is this legal? Please get the firm’s opinion before Friday.”</div>`,
    },
    lista: {
      title: 'Projekt listy pracowników do zwolnienia — Hala 2', short: 'Draft selection list', folder: 'Silform · HR', kind: 'form', lang: true,
      pl: `<div class="doc-head"><div class="doc-org">PROJEKT LISTY — HALA 2</div><div class="doc-sub">Dział Kadr · wersja robocza 3 · 09.02.2027 · wyciąg (10 z 80)</div></div>
        <p class="doc-clause"><b>Kryteria doboru (propozycja CFO):</b> ${ev('criteria', '1) wiek 55+ („najbliżej emerytury”), 2) liczba dni absencji chorobowej w 2026 r., 3) ocena okresowa')}.</p>
        <table class="form-t"><tr><th>Nr</th><th>Pracownik</th><th>Stanowisko</th><th>Staż w Silform</th><th>Wynagrodzenie</th><th>Uwagi kadr</th></tr>
        ${row(['1', 'Marta Kaczmarek', 'operator', '4 l.', '6 400 zł', ev('protected', 'w ciąży — zaświadczenie z 20.01.2027')])}
        ${row(['2', 'Zbigniew Pawlak', 'ustawiacz', '22 l.', '8 100 zł', ev('protected', 'ur. 03.05.1964 — do wieku emerytalnego ok. 2 lata')])}
        ${row(['3', 'Krzysztof Bober', 'technik utrzymania ruchu', '6 l.', '7 600 zł', ev('protected', 'członek zarządu ZZ Inżynierów i Techników (uchwała z 2025 r.)')])}
        ${row(['4', 'Ewa Nowakowska', 'kontroler jakości', '9 l.', '7 000 zł', ev('protected', 'urlop rodzicielski do 30.06.2027')])}
        ${row(['5', 'Jan Sikora', 'operator', ev('staz', '6 l. 4 mies.'), ev('staz', '7 200 zł'), 'wcześniej 5 lat w Odlewni Rybnik'])}
        ${row(['6', 'Adam Wilk', 'operator', '1 r. 8 mies.', '6 100 zł', '—'])}
        ${row(['7', 'Grażyna Stolarczyk', 'operator', '19 l.', '6 900 zł', 'wiek 57 — kryterium 1'])}
        ${row(['8', 'Paweł Mróz', 'ustawiacz', '11 l.', '7 900 zł', '38 dni L4 w 2026 — kryterium 2'])}
        ${row(['9', 'Dorota Lis', 'kontroler jakości', '3 l.', '6 600 zł', '—'])}
        ${row(['10', 'Łukasz Nowicki', 'operator', '2 l. 2 mies.', '6 200 zł', '—'])}
        </table>
        <div class="doc-note">Uwaga kadr: „Kryteria 1 i 2 dają najszybszy efekt kosztowy.”</div>`,
      en: `<div class="doc-head"><div class="doc-org">DRAFT LIST — HALL 2</div><div class="doc-sub">HR · working draft 3 · 09.02.2027 · extract (10 of 80) — translation</div></div>
        <p class="doc-clause"><b>Selection criteria (CFO proposal):</b> ${ev('criteria', '1) age 55+ (“closest to retirement”), 2) number of sick-leave days in 2026, 3) performance appraisal')}.</p>
        <table class="form-t"><tr><th>No</th><th>Employee</th><th>Position</th><th>Years at Silform</th><th>Monthly pay</th><th>HR notes</th></tr>
        ${row(['1', 'Marta Kaczmarek', 'operator', '4 y', 'PLN 6,400', ev('protected', 'pregnant — medical certificate of 20.01.2027')])}
        ${row(['2', 'Zbigniew Pawlak', 'setter', '22 y', 'PLN 8,100', ev('protected', 'born 03.05.1964 — about 2 years to retirement age')])}
        ${row(['3', 'Krzysztof Bober', 'maintenance technician', '6 y', 'PLN 7,600', ev('protected', 'board member, Engineers’ & Technicians’ union (resolution of 2025)')])}
        ${row(['4', 'Ewa Nowakowska', 'quality inspector', '9 y', 'PLN 7,000', ev('protected', 'on parental leave until 30.06.2027')])}
        ${row(['5', 'Jan Sikora', 'operator', ev('staz', '6 y 4 m'), ev('staz', 'PLN 7,200'), 'previously 5 years at Odlewnia Rybnik'])}
        ${row(['6', 'Adam Wilk', 'operator', '1 y 8 m', 'PLN 6,100', '—'])}
        ${row(['7', 'Grażyna Stolarczyk', 'operator', '19 y', 'PLN 6,900', 'age 57 — criterion 1'])}
        ${row(['8', 'Paweł Mróz', 'setter', '11 y', 'PLN 7,900', '38 sick days in 2026 — criterion 2'])}
        ${row(['9', 'Dorota Lis', 'quality inspector', '3 y', 'PLN 6,600', '—'])}
        ${row(['10', 'Łukasz Nowicki', 'operator', '2 y 2 m', 'PLN 6,200', '—'])}
        </table>
        <div class="doc-note">HR note: “Criteria 1 and 2 give the fastest cost effect.”</div>`,
    },
    zz: {
      title: 'Pisma związków zawodowych — 10.02.2027', short: 'Union letters', folder: 'Correspondence', kind: 'letter', lang: true,
      pl: `<div class="lt-from">ZAKŁADOWA ORGANIZACJA ZWIĄZKOWA „METALOWCY SILFORM” · 61 członków<br>ul. Bojkowska 37 · 44-100 Gliwice</div>
        <div class="lt-to">Zarząd Silform sp. z o.o.<br>Gliwice, 10.02.2027</div>
        <p>Dotarły do nas informacje o planowanych zwolnieniach w Hali 2. ${ev('unions', 'Żądamy niezwłocznego przekazania informacji i rozpoczęcia konsultacji zgodnie z ustawą z 13 marca 2003 r.')} Nie zgodzimy się na zwalnianie ludzi „po cichu” ani na listy układane według wieku.</p>
        <p>Z poważaniem<br>Halina Mazur, Przewodnicząca</p>
        <hr>
        <div class="lt-from">ZWIĄZEK ZAWODOWY INŻYNIERÓW I TECHNIKÓW SILFORM · 12 członków</div>
        <p>Przyłączamy się do stanowiska. ${ev('unions', 'Jako zakładowa organizacja związkowa oczekujemy udziału w konsultacjach')} i propozycji przeniesień do nowych projektów.</p>
        <p>Krzysztof Bober, Przewodniczący</p>`,
      en: `<div class="lt-from">COMPANY TRADE UNION “METALOWCY SILFORM” · 61 members</div>
        <div class="lt-to">Management Board, Silform sp. z o.o.<br>Gliwice, 10.02.2027 — translation</div>
        <p>We have heard about planned dismissals in Hall 2. ${ev('unions', 'We demand the information without delay and the start of consultation under the Act of 13 March 2003.')} We will not accept people being let go “quietly”, nor lists drawn up by age.</p>
        <p>Halina Mazur, Chair</p>
        <hr>
        <div class="lt-from">SILFORM ENGINEERS’ AND TECHNICIANS’ TRADE UNION · 12 members</div>
        <p>We join this position. ${ev('unions', 'As a company trade union we expect to take part in the consultation')} and proposals for transfers to new projects.</p>
        <p>Krzysztof Bober, Chair</p>`,
    },
    uop: {
      title: 'Umowa o pracę — Tomasz Rudnicki (01.09.2017) + umowa o zakazie konkurencji', short: 'Rudnicki: contracts', folder: 'Silform · Board', kind: 'paper', lang: true,
      pl: `<div class="doc-head"><div class="doc-org">UMOWA O PRACĘ NA CZAS NIEOKREŚLONY</div><div class="doc-sub">zawarta 01.09.2017 r. w Gliwicach między Silform sp. z o.o. („Pracodawca”), reprezentowaną przez Radę Nadzorczą, a Tomaszem Rudnickim („Pracownik”)</div></div>
        <p class="doc-clause"><b>§ 1.</b> Pracownik zostaje zatrudniony na stanowisku Dyrektora Operacyjnego w pełnym wymiarze czasu pracy. Pracownik pełni jednocześnie funkcję Członka Zarządu na podstawie odrębnego powołania.</p>
        <p class="doc-clause"><b>§ 3.</b> Wynagrodzenie zasadnicze: 38 000 zł brutto miesięcznie.</p>
        <p class="doc-clause"><b>§ 7.</b> ${ev('contract', 'Strony ustalają okres wypowiedzenia na 6 miesięcy.')}</p>
        <div class="sigrow">${sig('J. Olbrycht', 'Przewodniczący Rady Nadzorczej')}${sig('T. Rudnicki', 'Pracownik')}</div>
        <hr>
        <div class="doc-head"><div class="doc-org">UMOWA O ZAKAZIE KONKURENCJI PO USTANIU STOSUNKU PRACY</div><div class="doc-sub">01.09.2017 · art. 101² Kodeksu pracy</div></div>
        <p class="doc-clause"><b>§ 1.</b> ${ev('noncompete', 'Przez 12 miesięcy od ustania zatrudnienia Pracownik nie podejmie działalności konkurencyjnej wobec Pracodawcy (odlewnictwo ciśnieniowe aluminium, Polska i Niemcy).')}</p>
        <p class="doc-clause"><b>§ 2.</b> ${ev('noncompete', 'Z tego tytułu Pracownikowi przysługuje odszkodowanie w wysokości 25% wynagrodzenia otrzymanego przed ustaniem stosunku pracy, przez okres 12 miesięcy, płatne miesięcznie.')}</p>`,
      en: `<div class="doc-head"><div class="doc-org">EMPLOYMENT CONTRACT FOR AN INDEFINITE PERIOD</div><div class="doc-sub">made on 01.09.2017 in Gliwice between Silform sp. z o.o. (“Employer”), represented by the Supervisory Board, and Tomasz Rudnicki (“Employee”) — translation</div></div>
        <p class="doc-clause"><b>§ 1.</b> The Employee is employed full-time as Operations Director. He also serves as a Member of the Management Board under a separate appointment.</p>
        <p class="doc-clause"><b>§ 3.</b> Base salary: PLN 38,000 gross per month.</p>
        <p class="doc-clause"><b>§ 7.</b> ${ev('contract', 'The parties agree a notice period of 6 months.')}</p>
        <hr>
        <div class="doc-head"><div class="doc-org">POST-EMPLOYMENT NON-COMPETE AGREEMENT</div><div class="doc-sub">01.09.2017 · art. 101² of the Labour Code</div></div>
        <p class="doc-clause"><b>§ 1.</b> ${ev('noncompete', 'For 12 months after employment ends the Employee will not compete with the Employer (aluminium high-pressure die casting, Poland and Germany).')}</p>
        <p class="doc-clause"><b>§ 2.</b> ${ev('noncompete', 'In return the Employee receives compensation of 25% of the remuneration received before employment ended, for 12 months, paid monthly.')}</p>`,
    },
    wyp: {
      title: 'Wypowiedzenie umowy o pracę — projekt (A. Wróbel)', short: 'Draft termination', folder: 'Silform · Board', kind: 'letter', lang: true,
      pl: `<div class="lt-from">Silform sp. z o.o. · ul. Bojkowska 37 · 44-100 Gliwice</div>
        <div class="lt-to">Pan Tomasz Rudnicki<br>Gliwice, 12.02.2027 (projekt)</div>
        <h3 class="lt-subj">Wypowiedzenie umowy o pracę</h3>
        <p>Działając w imieniu Silform sp. z o.o., wypowiadam umowę o pracę zawartą 01.09.2017 r. z zachowaniem trzymiesięcznego okresu wypowiedzenia.</p>
        <p>${ev('reason', 'Przyczyna wypowiedzenia: utrata zaufania.')}</p>
        <p>Pouczenie: od wypowiedzenia przysługuje odwołanie do sądu pracy w terminie 21 dni od jego doręczenia.</p>
        <div class="sigrow">${ev('signer', sig('Agnieszka Wróbel', 'Prezes Zarządu'))}</div>`,
      en: `<div class="lt-from">Silform sp. z o.o. · Gliwice</div>
        <div class="lt-to">Mr Tomasz Rudnicki<br>Gliwice, 12.02.2027 (draft) — translation</div>
        <h3 class="lt-subj">Notice of termination of employment</h3>
        <p>Acting on behalf of Silform sp. z o.o., I terminate the employment contract of 01.09.2017 with three months’ notice.</p>
        <p>${ev('reason', 'Reason for termination: loss of trust.')}</p>
        <p>Instruction: you may appeal to the labour court within 21 days of delivery.</p>
        <div class="sigrow">${ev('signer', sig('Agnieszka Wróbel', 'President of the Management Board'))}</div>`,
    },
    krs3: {
      title: 'Odpis aktualny z KRS — Silform sp. z o.o.', short: 'KRS extract', folder: 'Public registry', kind: 'registry',
      en: `<div class="reg-h"><b>KRAJOWY REJESTR SĄDOWY</b> · Odpis aktualny · Rejestr przedsiębiorców · KRS 0000412233</div>
        <table class="reg"><tr><th colspan="2">Dział 1 — Dane podmiotu</th></tr><tr><td>Firma</td><td>SILFORM SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ</td></tr><tr><td>Siedziba</td><td>Gliwice</td></tr>
        <tr><th colspan="2">Dział 2 — Organ uprawniony do reprezentacji: ZARZĄD</th></tr><tr><td>Sposób reprezentacji</td><td>Dwóch członków zarządu łącznie albo członek zarządu łącznie z prokurentem.</td></tr>
        <tr><td>Prezes Zarządu</td><td>WRÓBEL AGNIESZKA</td></tr><tr><td>Członek Zarządu</td><td>RUDNICKI TOMASZ</td></tr>
        <tr><th colspan="2">Organ nadzoru: RADA NADZORCZA</th></tr><tr><td colspan="2">${ev('board', 'OLBRYCHT JERZY (Przewodniczący) · SZULC MONIKA · WEBER KLAUS')}</td></tr></table>
        <div class="doc-note">Translation: management board — Wróbel (President), Rudnicki (member); representation: two board members jointly or one with a commercial proxy. Supervisory board: Olbrycht (Chair), Szulc, Weber.</div>`,
    },
    hold: {
      title: 'RE: Blokada jakościowa L07–L09 — 14.12.2026', short: 'Email 14 Dec', folder: 'Silform · Quality', kind: 'mailprint', lang: true,
      pl: `<div class="mp-h"><b>Od:</b> Tomasz Rudnicki &lt;t.rudnicki@silform.pl&gt;<br><b>Do:</b> Tomasz Pietrzyk; Magazyn<br><b>Wysłano:</b> 14.12.2026 06:41<br><b>Temat:</b> RE: Blokada jakościowa L07–L09</div>
        <p>${ev('override', 'Zwalniam partie L07–L09 do wysyłki mimo blokady. Klient czeka, zgoda V&amp;K obejmuje ryzyko.')} Proszę ładować dziś.</p><p>T.R.</p>
        <div class="mp-q">&gt; Od: Tomasz Pietrzyk · 13.12.2026 22:10<br>&gt; Blokuję L07–L09. Zgoda V&amp;K obejmowała tylko pierwsze 5 000 sztuk. Te partie są poza nią. Proszę nie wysyłać bez RTG.</div>`,
      en: `<div class="mp-h"><b>From:</b> Tomasz Rudnicki<br><b>To:</b> Tomasz Pietrzyk; Warehouse<br><b>Sent:</b> 14.12.2026 06:41<br><b>Subject:</b> RE: Quality hold L07–L09 — translation</div>
        <p>${ev('override', 'I am releasing lots L07–L09 for shipment despite the hold. The customer is waiting; V&amp;K’s acceptance covers the risk.')} Load them today.</p><p>T.R.</p>
        <div class="mp-q">&gt; From: Tomasz Pietrzyk · 13.12.2026 22:10<br>&gt; I am holding L07–L09. V&amp;K’s acceptance covered only the first 5,000 units. These lots are outside it. Please don’t ship without X-ray.</div>`,
    },
  });

  F.ch3Docs = [
    ['memo', 'Opinia prawna — Hala 2 / T. Rudnicki', 'Your work product', 'MEMO'],
    ['plan3', 'Plan_restrukturyzacji_Hala2_v2.pdf', 'Silform · Management', 'PDF'],
    ['lista', 'Lista_Hala2_robocza_v3.xlsx', 'Silform · HR', 'XLSX'],
    ['zz', 'Pisma_ZZ_2027-02-10.pdf', 'Correspondence', 'PDF'],
    ['uop', 'Rudnicki_UoP_zakaz_konkurencji.pdf', 'Silform · Board', 'PDF'],
    ['wyp', 'Wypowiedzenie_Rudnicki_PROJEKT.docx', 'Silform · Board', 'DOCX'],
    ['krs3', 'KRS_0000412233_odpis.pdf', 'Public registry', 'PDF'],
    ['hold', 'RE_Blokada_L07-L09.msg', 'Silform · Quality', 'MSG'],
  ];

  // ------------------------------------------------------------------ the opinion: six questions
  F.WORK3 = {
    key: 'ch3', ch: 3, flag: 'memo3Sent', folder: 'Your work product', send: 'Send to mec. Lis',
    title: 'Opinia prawna — Silform: Hala 2 / T. Rudnicki',
    heading: 'OPINIA PRAWNA <span>/ LEGAL OPINION — privileged</span>',
    meta: '<div><b>Klient</b> Silform sp. z o.o.</div><div><b>Sygn.</b> AW-GLI-2027-019</div><div><b>Do</b> mec. Barbara Lis · A. Wróbel</div><div><b>Data</b> 11.02.2027</div>',
    qs: [
      { id: 'scope', q: '1 · Does the collective redundancy procedure apply?', hint: 'Restructuring plan §1, §4',
        opts: [
          { t: 'No. Split the exits into monthly tranches of 20 — each below the threshold of 24 — and start with mutual agreements, which don’t count.', ok: false, why: 'Two errors. Terminations by mutual agreement count towards the threshold once there are at least five of them. And the decision to cut eighty is already taken: under Directive 98/59, which the Act implements, the duty to consult arises when the employer is contemplating collective redundancies (CJEU, Junk, C-188/03). Slicing a decided plan into tranches invites litigation.' },
          { t: 'Yes. Eighty exits out of 240 employees is far above the threshold (10% — 24 people — for employers with 100 to 299 staff). Mutual agreements count too once there are at least five. Don’t split the plan to avoid the procedure.', ok: true, why: 'Right. The Act applies to employers with at least 20 staff; the threshold depends on headcount; agreements initiated by the employer count once there are five or more.' },
          { t: 'Only if all eighty notices are handed over on the same day.', ok: false, why: 'The Act looks at a period of up to 30 days, not a single day — and the plan already fixes eighty exits by the end of March.' },
        ], support: ['headcount', 'tranche', 'agreements'] },
      { id: 'steps', q: '2 · What is the procedure, step by step?', hint: 'Union letters · the Act of 13 March 2003',
        opts: [
          { t: 'Inform the employee council, wait 30 days, then hand out the notices.', ok: false, why: 'In Poland the consultation partner for collective redundancies is the company trade unions — here there are two. Without unions, the employer consults employee representatives.' },
          { t: 'Written notice to both unions — reasons, numbers and groups affected, period, proposed criteria, order of dismissals, proposed benefits — with a copy to the district labour office (PUP). Up to 20 days to agree. No agreement → the employer issues regulations, taking union proposals into account as far as possible. Then notify the PUP; the terminations may take effect no earlier than 30 days after that notice.', ok: true, why: 'Right. Consult → agreement or regulations → notify the labour office → the 30-day waiting period before any employment actually ends.' },
          { t: 'Finalise the list of names first, then consult the unions about the list.', ok: false, why: 'Consultation must cover ways to avoid or reduce the redundancies and the criteria — before names are fixed, not after.' },
        ], support: ['unions'] },
      { id: 'criteria', q: '3 · Which selection criteria?', hint: 'Draft selection list',
        opts: [
          { t: 'Keep the CFO’s order: age 55+ first — they will have a pension soon.', ok: false, why: 'Direct age discrimination (art. 18³a of the Labour Code). It also hands the unions their best argument.' },
          { t: 'Sick-leave days in 2026 as the main criterion — it is objective and measurable.', ok: false, why: 'Measurable, but risky: absences can be linked to disability or pregnancy, which exposes the employer to indirect-discrimination claims (see the CJEU in Ruiz Conejero, C-270/16).' },
          { t: 'Objective, verifiable criteria linked to the future organisation — qualifications for the remaining and new jobs, appraisal results, disciplinary record, seniority as tie-breaker — written down and applied the same way to everyone.', ok: true, why: 'Right. In court the employer must show why this person and not another; the criteria have to be real, known and applied consistently.' },
        ], support: ['criteria'] },
      { id: 'protected', q: '4 · The protected employees on the list', hint: 'Draft selection list — HR notes',
        opts: [
          { t: 'They can go too: a collective redundancy overrides special protection.', ok: false, why: 'The reverse. The Act keeps special protection: unless the employer is bankrupt or in liquidation, protected employees can only be given notice changing their terms, not notice ending their employment.' },
          { t: 'They stay. The employer may only change their terms; if pay falls, they receive a compensatory allowance until the protection ends. Pregnancy (art. 177 KP), pre-retirement (art. 39 KP), union board member (art. 32 of the Trade Unions Act), parental leave (art. 186⁸ KP).', ok: true, why: 'Right. Four names come off the termination list; the list and the numbers must be rebuilt.' },
          { t: 'Only the pregnant employee is protected.', ok: false, why: 'Pre-retirement protection (art. 39 KP), union board members (art. 32 of the Trade Unions Act) and employees on parental leave (art. 186⁸ KP) are protected too.' },
        ], support: ['protected'] },
      { id: 'severance', q: '5 · Statutory severance for Jan Sikora', hint: 'Draft selection list, row 5',
        opts: [
          { t: 'PLN 7,200 — one month’s pay.', ok: false, why: 'One month is for less than two years with this employer.' },
          { t: 'PLN 14,400 — two months’ pay (2 to 8 years at Silform), within the cap of 15 × the minimum wage.', ok: true, why: 'Right. Severance under art. 8 of the Act depends on service with this employer: 1 month (<2 years), 2 months (2–8 years), 3 months (>8 years), capped at fifteen times the minimum wage.' },
          { t: 'PLN 21,600 — three months, counting his five years at Odlewnia Rybnik.', ok: false, why: 'The Act counts service with this employer only (outside special cases such as a transfer of the undertaking).' },
        ], support: ['staz'] },
      { id: 'director', q: '6 · How does Rudnicki leave?', hint: 'Contracts · draft termination · KRS · email 14.12',
        opts: [
          { t: 'Ms Wróbel signs the termination today; removing him from the board ends the employment anyway.', ok: false, why: 'Removal from the board (art. 203 KSH) leaves his employment claims intact, and a CEO cannot represent the company in a contract with a fellow board member — art. 210 §1 KSH gives that to the supervisory board or a proxy appointed by the shareholders.' },
          { t: 'Two separate acts. The shareholders remove him from the board (art. 203 KSH). The supervisory board — or a proxy appointed by shareholders’ resolution — terminates the employment (art. 210 §1 KSH), with the contractual six months’ notice and a concrete, true reason (art. 30 §4 KP): the release of L07–L09 over the quality hold.', ok: true, why: 'Right. Two relationships, two acts, the right signatory, a reason a court can check.' },
          { t: 'Dismiss him summarily for “loss of trust” (art. 52 KP) — no notice, no pay.', ok: false, why: 'Summary dismissal needs a gross breach of basic duties and must happen within one month of the employer learning of it (art. 52 §2 KP). The board has known since the lab report of 10 January.' },
        ], support: ['signer', 'board', 'reason', 'override', 'contract'] },
    ],
  };
  F.openMemo3 = () => F.workMemo(F.WORK3);
})(window.F);
