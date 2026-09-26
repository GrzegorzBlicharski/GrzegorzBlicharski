/* THE FIRM — documents: tactile paper viewer, data-room records (PL/EN), evidence capture, SPA redline */
(function (F) {
  'use strict';
  const el = F.el;

  // ------------------------------------------------------------------ evidence registry
  F.EVIDENCE = {
    factoring: { label: 'Factoring agreement with Odra Capital', src: 'Board minutes, item 3' },
    abstain:   { label: 'Zieliński left the room — conflict of interest', src: 'Board minutes, item 5' },
    anna:      { label: 'Odra Capital — 100% owned by Anna Zielińska', src: 'KRS extract' },
    newco:     { label: 'Odra Capital registered 18.09.2026', src: 'KRS extract' },
    spouse:    { label: 'Anna is Tomasz Zieliński’s wife', src: 'Press clipping' },
    lease:     { label: 'City may terminate the stadium lease on change of control', src: 'Lease §14.2' },
    revoked:   { label: 'Folder 7.3 “Financing” closed at 03:12', src: 'Data room index' },
    general:   { label: 'Entire data room deemed “Disclosed”', src: 'Disclosure letter' },
    cfo:       { label: 'CFO: 7.3 “not relevant for the purchaser”', src: 'Email thread, folder 12.1' },
  };

  const ev = (id, html) => `<span class="ev" data-ev="${id}">${html}</span>`;
  const sig = (name, role) => `<div class="sigblock"><svg viewBox="0 0 200 60" class="sig"><path d="M8 42 C 30 10, 42 58, 60 30 S 90 12, 104 38 S 130 50, 150 22 S 180 30, 192 26" /></svg><div class="signame">${name}</div><div class="sigrole">${role}</div></div>`;

  // ------------------------------------------------------------------ data-room documents
  F.docs = {
    minutes: {
      title: 'Protokół — Rada Nadzorcza · 02.10.2026', short: 'Board minutes 02.10', folder: '4.2 Corporate', kind: 'paper', lang: true,
      pl: `<div class="doc-head"><div class="doc-org">KS CARBO GLIWICE SPÓŁKA AKCYJNA</div><div class="doc-sub">ul. Kopalniana 1 · 44-100 Gliwice · KRS 0000071123</div></div>
        <h1 class="doc-title">PROTOKÓŁ<br><span>z posiedzenia Rady Nadzorczej z dnia 2 października 2026 r.</span></h1>
        <p class="doc-meta">Miejsce: siedziba Spółki, sala konferencyjna „Loża”. Godzina rozpoczęcia: 18:30.<br>Obecni: Jerzy Malinowski (Przewodniczący), Ewa Dąbrowska, Paweł Sikora, Marek Olszewski. Zaproszeni: Tomasz Zieliński (Prezes Zarządu), Krzysztof Wrona (Członek Zarządu ds. finansowych).</p>
        <ol class="doc-list">
          <li><b>Otwarcie posiedzenia</b> i stwierdzenie prawomocności obrad.</li>
          <li><b>Przyjęcie porządku obrad.</b> Porządek obrad przyjęto jednogłośnie.</li>
          <li><b>Wyrażenie zgody na zawarcie umowy faktoringu.</b> Rada Nadzorcza wyraża zgodę na zawarcie przez Spółkę ${ev('factoring', 'umowy faktoringu z Odra Capital sp. z o.o. z siedzibą we Wrocławiu, obejmującej wierzytelności Spółki z tytułu praw medialnych za sezony 2027/28–2029/30')}, za cenę nabycia wynoszącą 61% wartości nominalnej wierzytelności.</li>
          <li><b>Informacja Prezesa Zarządu</b> w sprawie rozmów z Miastem Gliwice dotyczących umowy dzierżawy Stadionu Miejskiego. Rada przyjęła informację do wiadomości.</li>
          <li><b>Głosowanie.</b> Uchwały w pkt 3 podjęto jednogłośnie (4 głosy „za”). ${ev('abstain', 'Obecny na posiedzeniu Prezes Zarządu Tomasz Zieliński opuścił salę na czas omawiania pkt 3, powołując się na art. 377 k.s.h.')}</li>
          <li><b>Zamknięcie posiedzenia</b> o godz. 19:05.</li>
        </ol>
        <div class="sigrow">${sig('Jerzy Malinowski', 'Przewodniczący Rady Nadzorczej')}${sig('Ewa Dąbrowska', 'Sekretarz posiedzenia')}</div>
        <div class="stamp-round">KS CARBO<br>GLIWICE S.A.<br><small>★ 1926 ★</small></div>`,
      en: `<div class="doc-head"><div class="doc-org">KS CARBO GLIWICE JOINT-STOCK COMPANY</div><div class="doc-sub">Translation for information purposes — Adler Wendt Gliwice</div></div>
        <h1 class="doc-title">MINUTES<br><span>of the meeting of the Supervisory Board held on 2 October 2026</span></h1>
        <p class="doc-meta">Venue: registered office, conference room “Loża”. Start: 18:30.<br>Present: Jerzy Malinowski (Chair), Ewa Dąbrowska, Paweł Sikora, Marek Olszewski. Invited: Tomasz Zieliński (President of the Management Board), Krzysztof Wrona (CFO).</p>
        <ol class="doc-list">
          <li><b>Opening</b> of the meeting; quorum confirmed.</li>
          <li><b>Adoption of the agenda.</b> Adopted unanimously.</li>
          <li><b>Consent to a factoring agreement.</b> The Supervisory Board consents to the Company entering into ${ev('factoring', 'a factoring agreement with Odra Capital sp. z o.o., Wrocław, covering the Company’s receivables from media rights for seasons 2027/28–2029/30')}, at a purchase price of 61% of the receivables’ nominal value.</li>
          <li><b>Report of the President</b> on talks with the City of Gliwice concerning the lease of the Municipal Stadium. Noted.</li>
          <li><b>Voting.</b> The resolution under item 3 was adopted unanimously (4 votes in favour). ${ev('abstain', 'President Tomasz Zieliński, attending as a guest, left the room while item 3 was discussed, citing Art. 377 of the Commercial Companies Code (conflict of interest).')}</li>
          <li><b>Close</b> of the meeting at 19:05.</li>
        </ol>
        <div class="sigrow">${sig('Jerzy Malinowski', 'Chair of the Supervisory Board')}${sig('Ewa Dąbrowska', 'Secretary')}</div>`,
    },
    krs: {
      title: 'Odpis aktualny KRS — Odra Capital sp. z o.o.', short: 'KRS extract — Odra', folder: 'Public registry', kind: 'registry', lang: true,
      pl: `<div class="reg-head"><div class="reg-emblem">⚜</div><div><div class="reg-t1">CENTRALNA INFORMACJA KRAJOWEGO REJESTRU SĄDOWEGO</div><div class="reg-t2">ODPIS AKTUALNY Z REJESTRU PRZEDSIĘBIORCÓW</div></div></div>
        <div class="reg-meta">Stan na dzień 12.10.2026 godz. 07:58:12 · Numer KRS: 0000981234</div>
        <table class="reg"><tr><th colspan="2">Dział 1 — Dane podmiotu</th></tr>
        <tr><td>1. Oznaczenie formy prawnej</td><td>SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ</td></tr>
        <tr><td>2. Firma</td><td>ODRA CAPITAL SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ</td></tr>
        <tr><td>3. Siedziba</td><td>WROCŁAW, ul. Ruska 41 lok. 7</td></tr>
        <tr><td>4. Data wpisu do rejestru</td><td>${ev('newco', '18.09.2026')}</td></tr>
        <tr><td>5. Kapitał zakładowy</td><td>5 000,00 ZŁ</td></tr>
        <tr><th colspan="2">Dział 1 — Rubryka 7: Wspólnicy</th></tr>
        <tr><td>1. Nazwisko / Imię</td><td>${ev('anna', 'ZIELIŃSKA ANNA — posiada 100 udziałów o łącznej wysokości 5 000,00 ZŁ')}</td></tr>
        <tr><th colspan="2">Dział 2 — Zarząd</th></tr>
        <tr><td>1. Prezes Zarządu</td><td>ZIELIŃSKA ANNA</td></tr>
        <tr><td>2. Sposób reprezentacji</td><td>JEDNOOSOBOWO PREZES ZARZĄDU</td></tr></table>
        <div class="reg-foot">Dokument wygenerowany z systemu teleinformatycznego — ma moc dokumentu urzędowego (art. 4 ust. 4aa ustawy o KRS).</div>`,
      en: `<div class="reg-head"><div class="reg-emblem">⚜</div><div><div class="reg-t1">CENTRAL INFORMATION OF THE NATIONAL COURT REGISTER</div><div class="reg-t2">CURRENT EXTRACT — REGISTER OF ENTREPRENEURS</div></div></div>
        <div class="reg-meta">As at 12.10.2026 07:58:12 · KRS No.: 0000981234</div>
        <table class="reg"><tr><th colspan="2">Section 1 — Entity</th></tr>
        <tr><td>1. Legal form</td><td>LIMITED LIABILITY COMPANY</td></tr>
        <tr><td>2. Name</td><td>ODRA CAPITAL SP. Z O.O.</td></tr>
        <tr><td>3. Seat</td><td>WROCŁAW, ul. Ruska 41 apt. 7</td></tr>
        <tr><td>4. Date of registration</td><td>${ev('newco', '18.09.2026')}</td></tr>
        <tr><td>5. Share capital</td><td>PLN 5,000.00</td></tr>
        <tr><th colspan="2">Section 1 — Item 7: Shareholders</th></tr>
        <tr><td>1. Surname / Name</td><td>${ev('anna', 'ZIELIŃSKA ANNA — holds 100 shares with a total value of PLN 5,000.00')}</td></tr>
        <tr><th colspan="2">Section 2 — Management Board</th></tr>
        <tr><td>1. President of the Board</td><td>ZIELIŃSKA ANNA</td></tr>
        <tr><td>2. Representation</td><td>PRESIDENT ACTING ALONE</td></tr></table>`,
    },
    clipping: {
      title: 'Kurier Gliwicki — Sport · 11.05.2026', short: 'Press clipping', folder: 'Open sources', kind: 'news', lang: true,
      pl: `<div class="news-mast">Kurier Gliwicki <span>SPORT</span></div><div class="news-date">Poniedziałek, 11 maja 2026 · str. 14</div>
        <h1 class="news-h">Sto lat Carbo: gala na Kopalnianej</h1>
        <div class="news-photo"><canvas data-portrait="zielinski,anna"></canvas></div>
        <div class="news-cap">${ev('spouse', 'Prezes Carbo Tomasz Zieliński z żoną Anną podczas sobotniej gali stulecia klubu.')} Fot. M. Kwiatkowski</div>
        <p class="news-p">Blisko tysiąc gości, pokaz sztucznych ogni nad stadionem i zapowiedź „nowego rozdziału” — tak Carbo świętowało swoje stulecie. Prezes Zieliński nie wykluczył wejścia zagranicznego inwestora: „Carbo potrzebuje kapitału, ale nie odda duszy”.</p>`,
      en: `<div class="news-mast">Kurier Gliwicki <span>SPORT</span></div><div class="news-date">Monday, 11 May 2026 · p. 14</div>
        <h1 class="news-h">A hundred years of Carbo: gala at the stadium</h1>
        <div class="news-photo"><canvas data-portrait="zielinski,anna"></canvas></div>
        <div class="news-cap">${ev('spouse', 'Carbo president Tomasz Zieliński with his wife Anna at Saturday’s centenary gala.')} Photo: M. Kwiatkowski</div>
        <p class="news-p">Nearly a thousand guests, fireworks over the stadium and the promise of “a new chapter” — Carbo celebrated its centenary. President Zieliński did not rule out a foreign investor: “Carbo needs capital, but it will not sell its soul.”</p>`,
    },
    lease: {
      title: 'Umowa dzierżawy Stadionu Miejskiego (wyciąg)', short: 'Stadium lease §14', folder: '6.1 Real estate', kind: 'paper', lang: true,
      pl: `<div class="doc-head"><div class="doc-org">UMOWA DZIERŻAWY NR 41/SP/2019</div><div class="doc-sub">zawarta w Gliwicach pomiędzy Miastem Gliwice („Wydzierżawiający”) a KS Carbo Gliwice S.A. („Dzierżawca”)</div></div>
        <p class="doc-clause"><b>§ 14. Rozwiązanie Umowy</b></p>
        <p class="doc-clause">1. Każda ze Stron może rozwiązać Umowę z zachowaniem dwunastomiesięcznego okresu wypowiedzenia ze skutkiem na koniec sezonu rozgrywkowego.</p>
        <p class="doc-clause">2. ${ev('lease', 'Wydzierżawiający może rozwiązać Umowę ze skutkiem natychmiastowym w przypadku zmiany kontroli nad Dzierżawcą, dokonanej bez uprzedniej pisemnej zgody Wydzierżawiającego.')} Przez zmianę kontroli rozumie się nabycie przez podmiot trzeci akcji uprawniających do wykonywania ponad 50% głosów na walnym zgromadzeniu Dzierżawcy.</p>
        <p class="doc-clause">3. Zgoda, o której mowa w ust. 2, wymaga uchwały Rady Miasta Gliwice.</p>
        <div class="doc-page">— 17 —</div>`,
      en: `<div class="doc-head"><div class="doc-org">LEASE AGREEMENT No. 41/SP/2019</div><div class="doc-sub">made in Gliwice between the City of Gliwice (“Lessor”) and KS Carbo Gliwice S.A. (“Lessee”)</div></div>
        <p class="doc-clause"><b>§ 14. Termination</b></p>
        <p class="doc-clause">1. Either Party may terminate the Agreement on twelve months’ notice effective at the end of a playing season.</p>
        <p class="doc-clause">2. ${ev('lease', 'The Lessor may terminate the Agreement with immediate effect in the event of a change of control over the Lessee made without the Lessor’s prior written consent.')} A change of control means acquisition by a third party of shares carrying more than 50% of the votes at the Lessee’s general meeting.</p>
        <p class="doc-clause">3. The consent referred to in para. 2 requires a resolution of the Gliwice City Council.</p>
        <div class="doc-page">— 17 —</div>`,
    },
    disclosure: {
      title: 'Disclosure Letter — draft 3', short: 'Disclosure letter', folder: '1.2 Transaction', kind: 'letter',
      en: `<div class="lh"><div class="lh-firm">NOWICKA BĄK <span>LEGAL</span></div><div class="lh-addr">pl. Solny 14 · 50-062 Wrocław · +48 22 000 41 00</div></div>
        <div class="letter-date">Wrocław, 12 October 2026</div>
        <div class="letter-to">Steinhauer Sportholding GmbH<br>c/o Adler Wendt, Gliwice</div>
        <p class="letter-re"><b>Re: Project Carbo — Disclosure Letter</b></p>
        <p>1. This letter is the Disclosure Letter referred to in the Share Purchase Agreement. Capitalised terms have the meanings given in the Agreement.</p>
        <p>2. <b>General disclosures.</b> ${ev('general', 'Each document and item of information made available to the Purchaser or its advisers in the Virtual Data Room is deemed to be Disclosed against each of the Warranties.')}</p>
        <p>3. <b>Specific disclosures.</b> Warranty 7.4 (<i>Title; no Encumbrances</i>): none.</p>
        <p class="letter-sig">Yours faithfully,</p>${sig('Aleksandra Nowicka', 'Partner, Nowicka Bąk Legal')}`,
    },
    dataroom: {
      title: 'Virtual Data Room — Index', short: 'Data room index', folder: 'VDR', kind: 'index',
      en: `<div class="vdr-head"><b>CARBO</b> · Virtual Data Room · hosted by DataVault PL</div>
        <table class="vdr"><tr><th>Folder</th><th>Title</th><th>Docs</th><th>Status</th></tr>
        <tr><td>1.1</td><td>Transaction documents</td><td>6</td><td>open</td></tr>
        <tr><td>1.2</td><td>Disclosure</td><td>2</td><td>open</td></tr>
        <tr><td>4.2</td><td>Corporate — board minutes</td><td>31</td><td>open</td></tr>
        <tr><td>5.1</td><td>Players &amp; transfer agreements</td><td>88</td><td>open</td></tr>
        <tr><td>6.1</td><td>Real estate — stadium</td><td>4</td><td>open</td></tr>
        <tr><td>7.1</td><td>Banking</td><td>9</td><td>open</td></tr>
        <tr class="vdr-x"><td>7.3</td><td>Financing arrangements</td><td>—</td><td>${ev('revoked', 'access revoked by NB Legal · 12.10.2026 03:12')}</td></tr>
        <tr><td>9.4</td><td>Media rights (Ekstraklasa)</td><td>12</td><td>open</td></tr>
        <tr><td>12.1</td><td>Correspondence</td><td>3</td><td>open</td></tr></table>
        <div class="vdr-log">Last Q&amp;A: “Please confirm there are no factoring or receivables finance arrangements.” — <i>Answer pending (Seller)</i></div>`,
    },
    cfomail: {
      title: 'FW: 7.3 — email thread (folder 12.1)', short: 'Email thread 12.1', folder: '12.1 Correspondence', kind: 'mailprint',
      en: `<div class="mp-h"><b>From:</b> Krzysztof Wrona &lt;k.wrona@kscarbo.pl&gt;<br><b>To:</b> Aleksandra Nowicka<br><b>Cc:</b> Tomasz Zieliński<br><b>Sent:</b> 12.10.2026 03:05<br><b>Subject:</b> RE: VDR 7.3</div>
        <p>Aleksandra,</p><p>${ev('cfo', 'folder 7.3 — as discussed, not relevant for the purchaser. I’ve closed it.')} The Odra paperwork is signed; funds expected Friday.</p><p>KW</p>
        <div class="mp-q">&gt; Krzysztof — please make sure the VDR reflects what we agreed. — AN</div>
        <div class="mp-foot">Printed from VDR · document 12.1.3 · uploaded 12.10.2026 03:07 by k.wrona</div>`,
    },
  };

  // ------------------------------------------------------------------ SPA redline
  F.SPA = [
    { id: 'mac', ref: '1.1', title: 'Material Adverse Change', correct: ['reject'], ok: ['flag'],
      pre: '“<b>Material Adverse Change</b>” means any event or circumstance which has a material adverse effect on the business, assets or financial condition of the Company, ',
      ins: 'provided that no event arising from sporting results, including relegation from the Ekstraklasa or loss of a UEFA licence, shall constitute a Material Adverse Change', post: '.',
      comment: 'Sporting results are inherent in the business. Non-negotiable.' },
    { id: 'leak', ref: '3.4', title: 'Permitted Leakage', correct: ['reject'], ok: ['flag'],
      pre: '“<b>Permitted Leakage</b>” means (a) salaries paid in the ordinary course; (b) payments set out in Schedule 5', ins: '; and (c) any payment made in the ordinary course of business to a Related Party of the Seller', post: '.',
      comment: 'Clarification only.' },
    { id: 'lease', ref: '6.3', title: 'Stadium Lease', correct: ['reject'], ok: [],
      pre: 'The Seller shall use reasonable endeavours to procure the consent of the City of Gliwice to the change of control under the Stadium Lease. ', ins: 'The Purchaser acknowledges that such consent is not a condition to Completion and that any termination of the Stadium Lease shall be at the Purchaser’s sole risk.', post: '',
      comment: 'Purchaser has had full access to the Lease.' },
    { id: 'title', ref: '7.4', title: 'Title; no Encumbrances', correct: ['reject', 'flag'], ok: [],
      pre: 'The Company is the sole legal and beneficial owner of its assets and receivables, free from any Encumbrance', ins: ', save as Disclosed', post: '. No receivables of the Company have been assigned, factored or sold.',
      comment: 'Standard.' },
    { id: 'cap', ref: '9.1', title: 'Limitation — Cap', correct: ['reject'], ok: [],
      pre: 'The aggregate liability of the Seller for all Claims shall not exceed ', del: 'thirty per cent. (30%)', ins: 'five per cent. (5%)', post: ' of the Purchase Price.',
      comment: 'Our client’s position on the cap is final.' },
    { id: 'time', ref: '9.4', title: 'Time limit for Claims', correct: ['accept'], ok: ['flag'],
      pre: 'The Seller shall not be liable for any Claim unless notified within ', del: 'twenty-four (24)', ins: 'eighteen (18)', post: ' months of Completion.',
      comment: 'Aligned with the season calendar.' },
    { id: 'arb', ref: '12.2', title: 'Arbitration', correct: ['accept'], ok: ['flag'],
      pre: 'Any dispute shall be finally resolved by arbitration under the Rules of ', del: 'the German Arbitration Institute (DIS), seat Gliwice', ins: 'the Court of Arbitration at the Polish Chamber of Commerce, seat Wrocław', post: '. The language of the arbitration shall be English.',
      comment: 'Assets and management are in Poland.' },
  ];

  // ------------------------------------------------------------------ viewer
  let open = null;
  function renderPortraits(root) {
    root.querySelectorAll('canvas[data-portrait]').forEach((c) => {
      const ids = c.dataset.portrait.split(',');
      c.width = 560; c.height = 340;
      const g = c.getContext('2d');
      const bg = g.createLinearGradient(0, 0, 0, 340);
      bg.addColorStop(0, '#3b3b3b'); bg.addColorStop(1, '#161616');
      g.fillStyle = bg; g.fillRect(0, 0, 560, 340);
      // gala bokeh
      for (let i = 0; i < 30; i++) { g.fillStyle = `rgba(255,${200 + Math.random() * 40 | 0},150,${0.05 + Math.random() * 0.12})`; g.beginPath(); g.arc(Math.random() * 560, Math.random() * 200, 8 + Math.random() * 20, 0, 6.28); g.fill(); }
      ids.forEach((id, i) => {
        const ch = F.people.cast[id];
        F.people.draw(g, ch, 190 + i * 190, 1150, 1000, { crop: 'bust', turn: i ? -0.25 : 0.25, expr: 'smile', slot: 'photo' + i, light: { key: [255, 250, 240], keyA: 0.6, dir: i ? 1 : -1, amb: [150, 148, 150], rimA: 0.15 } });
      });
      // halftone / newsprint desaturation
      const id = g.getImageData(0, 0, 560, 340);
      for (let k = 0; k < id.data.length; k += 4) { const v = id.data[k] * 0.3 + id.data[k + 1] * 0.59 + id.data[k + 2] * 0.11; const n = (Math.random() - 0.5) * 18; id.data[k] = id.data[k + 1] = id.data[k + 2] = Math.min(255, v * 1.05 + n); }
      g.putImageData(id, 0, 0);
    });
  }

  function wireEvidence(root) {
    root.querySelectorAll('.ev').forEach((s) => {
      const id = s.dataset.ev;
      if (F.state.findings[id]) s.classList.add('found');
      s.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        if (F.find(id)) {
          root.querySelectorAll(`.ev[data-ev="${id}"]`).forEach((x) => x.classList.add('found', 'just'));
          F.audio.connect();
          noteToast(F.EVIDENCE[id].label);
        }
      });
    });
  }
  function noteToast(text) {
    const t = el('div', 'note-toast', `<i>Noted for the case board</i><b>${text}</b>`);
    document.getElementById('ui').appendChild(t);
    setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 700); }, 2600);
  }

  F.openDoc = (key) => new Promise((res) => {
    const d = F.docs[key];
    if (!d) return res();
    F.state.readDocs = F.state.readDocs || {};
    F.state.readDocs[key] = true;
    let lang = d.lang ? 'pl' : 'en';
    const p = F.ui.panel('docview', `
      <div class="dv-dim"></div>
      <div class="dv-top"><span class="dv-folder">${d.folder}</span><span class="dv-title">${d.title}</span>
        ${d.lang ? `<button class="dv-lang"><b>${(d.langs || ['PL'])[0]}</b> / EN</button>` : ''}
        <button class="dv-close">Put down <kbd>Esc</kbd></button></div>
      <div class="dv-scroll"><div class="paper kind-${d.kind}"><div class="paper-inner"></div></div></div>
      <div class="dv-hint">Click passages that matter — they go to the case board.</div>`);
    const inner = p.node.querySelector('.paper-inner');
    const render = () => { inner.innerHTML = d[lang] || d.en; renderPortraits(inner); wireEvidence(inner); };
    render();
    F.audio.paper();
    const lb = p.node.querySelector('.dv-lang');
    if (lb) lb.addEventListener('pointerdown', (e) => { e.stopPropagation(); lang = lang === 'pl' ? 'en' : 'pl'; const L0 = (d.langs || ['PL'])[0]; lb.innerHTML = lang === 'pl' ? `<b>${L0}</b> / EN` : `${L0} / <b>EN</b>`; inner.parentElement.classList.add('flip'); setTimeout(() => { render(); inner.parentElement.classList.remove('flip'); }, 220); F.audio.paper(); });
    const close = () => { F.off('key', onKey); p.close(); F.audio.paper(); setTimeout(res, 300); };
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    F.on('key', onKey);
    p.node.querySelector('.dv-close').addEventListener('pointerdown', (e) => { e.stopPropagation(); close(); });
    p.node.querySelector('.dv-dim').addEventListener('pointerdown', (e) => { e.stopPropagation(); close(); });
  });

  // ------------------------------------------------------------------ redline workspace
  F.openRedline = () => new Promise((res) => {
    const dec = F.state.redlines;
    const clauseHtml = (c) => {
      const d = dec[c.id];
      let body = c.pre;
      if (c.del) body += d === 'accept' ? '' : `<del class="${d === 'reject' ? 'restored' : 'nb'}">${c.del}</del>`;
      if (c.ins) body += d === 'accept' ? `<span class="merged">${c.ins}</span>` : `<ins class="${d === 'reject' ? 'rejected' : 'nb'}">${c.ins}</ins>`;
      body += c.post;
      return `<div class="clause ${d ? 'dec-' + d : ''}" data-id="${c.id}">
        <div class="cl-num">${c.ref}</div>
        <div class="cl-body"><div class="cl-title">${c.title}</div><p>${body}</p>
          ${d === 'flag' ? '<div class="cl-flag">⚑ Flagged — raise with client before signing</div>' : ''}
          ${d === 'reject' ? '<div class="cl-aw">Rejected — AW</div>' : ''}</div>
        <div class="cl-comment"><b>A. Nowicka</b>${c.comment}</div>
        <div class="cl-actions"><button data-a="accept">Accept</button><button data-a="reject">Reject</button><button data-a="flag">Flag</button></div>
      </div>`;
    };
    const p = F.ui.panel('redline', `
      <div class="dv-dim"></div>
      <div class="rl-nav"><div class="rl-navh">Clauses changed by seller</div><div class="rl-list"></div>
        <button class="rl-send" disabled>Send redline to Dr. Wendt</button><div class="rl-left"></div></div>
      <div class="dv-top"><span class="dv-folder">1.1 Transaction</span><span class="dv-title">SPA — Nowicka Bąk mark-up v7 (12.10 · 02:40)</span><button class="dv-close">Put down <kbd>Esc</kbd></button></div>
      <div class="dv-scroll"><div class="paper kind-spa"><div class="paper-inner">
        <div class="spa-draft">DRAFT — NB MARK-UP 12.10.2026 — SUBJECT TO CONTRACT — PRIVILEGED</div>
        <h1 class="spa-h">SHARE PURCHASE AGREEMENT</h1>
        <div class="spa-sub">relating to 75 per cent. of the issued share capital of<br><b>KS CARBO GLIWICE S.A.</b></div>
        <div class="spa-parties">between <b>Carbo Holding sp. z o.o.</b> as Seller and <b>Steinhauer Sportholding GmbH</b> as Purchaser</div>
        <div class="spa-legend"><span><ins class="nb">insertion</ins> / <del class="nb">deletion</del> by Seller’s counsel</span><span>your decisions appear in brass</span></div>
        <div class="clauses"></div>
        <div class="doc-page">— draft · page 1 of 64 —</div>
      </div></div></div>`);
    const list = p.node.querySelector('.rl-list'), wrap = p.node.querySelector('.clauses'), send = p.node.querySelector('.rl-send'), left = p.node.querySelector('.rl-left');
    const render = () => {
      wrap.innerHTML = F.SPA.map(clauseHtml).join('');
      list.innerHTML = F.SPA.map((c) => `<button class="rl-item ${dec[c.id] ? 'done-' + dec[c.id] : ''}" data-id="${c.id}"><span>§${c.ref}</span>${c.title}<i></i></button>`).join('');
      const n = F.SPA.filter((c) => dec[c.id]).length;
      send.disabled = n < F.SPA.length;
      left.textContent = n < F.SPA.length ? `${F.SPA.length - n} open` : 'All clauses decided';
      wrap.querySelectorAll('.cl-actions button').forEach((b) => b.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        const id = b.closest('.clause').dataset.id;
        dec[id] = b.dataset.a; F.save();
        F.audio.tone(b.dataset.a === 'reject' ? 330 : b.dataset.a === 'flag' ? 440 : 523, 0.25, 0.03);
        F.audio.paper();
        render();
        const cl = wrap.querySelector(`.clause[data-id="${id}"]`);
        cl.classList.add('pulse');
      }));
      list.querySelectorAll('.rl-item').forEach((b) => b.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        const cl = wrap.querySelector(`.clause[data-id="${b.dataset.id}"]`);
        cl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        cl.classList.add('focus'); setTimeout(() => cl.classList.remove('focus'), 1200);
      }));
    };
    render();
    F.audio.paper();
    let sent = false;
    const close = () => { F.off('key', onKey); p.close(); F.audio.paper(); setTimeout(() => res(sent), 300); };
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    F.on('key', onKey);
    p.node.querySelector('.dv-close').addEventListener('pointerdown', (e) => { e.stopPropagation(); close(); });
    send.addEventListener('pointerdown', (e) => { e.stopPropagation(); if (send.disabled) return; sent = true; F.flag('redlineSent', true); F.audio.whoosh(); close(); });
  });

  // score the redline: {right, ok, wrong, missed:[refs]}
  F.scoreRedline = () => {
    const d = F.state.redlines; let right = 0, ok = 0; const missed = [];
    F.SPA.forEach((c) => { if (c.correct.includes(d[c.id])) right++; else if (c.ok.includes(d[c.id])) ok++; else missed.push(c); });
    return { right, ok, missed };
  };
})(window.F);
