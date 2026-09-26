/* THE FIRM — the workstation: camera pushes into the monitor, the OS takes over, and returns to the desk. */
(function (F) {
  'use strict';
  const el = F.el;
  const STAGES = { 1: ['arrive', 'review', 'evening', 'wroclaw'], 2: ['c2_call', 'c2_travel', 'c2_done'], 3: ['c3_brief', 'c3_consult', 'c3_done'], 4: ['c4_intake', 'c4_train', 'c4_court', 'c4_done'] };
  F.chapterOS = F.chapterOS || {}; // per-chapter app overrides: { docs(main, api), vdr, cal, law }
  const override = (app) => { const X = F.chapterOS[ch()]; return X && X[app]; };
  const ch = () => F.state.chapter || 1;
  const stageIdx = () => Math.max(0, STAGES[ch()].indexOf(F.state.stage || STAGES[ch()][0]));
  const inCh = (m) => (m.ch || 1) === ch() && m.stage <= stageIdx();

  const signature = (name, role, tel) => `<div class="m-sig"><b>${name}</b><br>${role}<br><span>ADLER WENDT sp.k. · Kancelaria Prawna</span><br><span>ul. Zwycięstwa 7 · 44-100 Gliwice · ${tel}</span></div><div class="m-disc">This e-mail may contain privileged and confidential information. If you are not the intended recipient, please notify the sender and delete it.</div>`;

  F.mail = [
    { id: 'it', stage: 0, from: 'IT Service Desk', addr: 'servicedesk@adlerwendt.de', time: '06:02', subject: 'Willkommen bei Adler Wendt — Ihre Zugänge', body: `<p>Guten Morgen,</p><p>your accounts are active: document management (iManage), the Carbo data room (DataVault PL) and the time recording system. Please record time in six-minute units from today.</p><p>Your badge opens floors 8–9. Floor 10 is partner floor: <i>by invitation.</i></p><p><i>Hinweis: Die Kanzleisprache im Dokumentenmanagement ist Deutsch.</i> Your system language is German — our Stuttgart and Berlin teams work in the same files.</p>${signature('IT Service Desk', 'Gliwice', '+48 32 000 40 00')}` },
    { id: 'wendt1', stage: 0, from: 'Dr. Helena Wendt', addr: 'h.wendt@adlerwendt.de', time: '06:47', subject: 'Carbo', body: `<p>Come up when you're in.</p><p>H.W.</p><div class="m-sent">Sent from mobile</div>` },
    { id: 'jonas1', stage: 1, from: 'Jonas Brenner', addr: 'j.brenner@adlerwendt.de', time: '08:07', subject: 'Carbo — VDR access + NB mark-up v7', body: `<p>Hi — welcome to the circus.</p><p>Attached: Nowicka's mark-up of the SPA (came in at 02:40, obviously) and the draft disclosure letter. The VDR is in <b>Documents → Data Room</b>. I've pulled the board minutes, the stadium lease and a KRS extract that looked odd.</p><p>Wendt wants the redline by five. Accept / reject / flag, clause by clause. Don't accept anything just because it says “standard”.</p><p>Coffee machine on 9 is broken. Use the one on 8.</p><p>J.</p>${signature('Jonas Brenner', 'Associate · Corporate/M&A', '+48 32 000 41 27')}`, attach: [{ name: 'SPA_NB_markup_v7.docx', open: () => F.openRedline().then((sent) => sent && F.emit('redline:sent')) }, { name: 'Disclosure_Letter_draft3.pdf', open: () => F.openDoc('disclosure') }] },
    { id: 'kraus', stage: 1, from: 'Dr. Ines Kraus', addr: 'i.kraus@steinhauer-sport.de', time: '07:58', subject: 'Projekt Carbo – Haftungsbegrenzung / Garantiekatalog', body: `<p>Sehr geehrte Damen und Herren,</p><p>anbei unsere Anmerkungen aus Stuttgart. Herr Steinhauer legt großen Wert darauf, dass die Unterzeichnung am Mittwoch stattfindet.</p><p>Aus unserer Sicht sind drei Punkte kritisch:</p><p>1. die Absenkung des <b>Haftungshöchstbetrags</b> auf 5&nbsp;% des Kaufpreises,<br>2. die Ausnahme sportlicher Ergebnisse (Abstieg) aus der <b>MAC-Klausel</b>,<br>3. die pauschale Offenlegung des gesamten Datenraums gegenüber den <b>Garantien</b>.</p><p>Wir bitten um Ihre Einschätzung bis heute, 17:00 Uhr. Die Stellungnahme kann gern auf Englisch erfolgen; Herr Steinhauer selbst liest lieber Deutsch.</p><p>Mit freundlichen Grüßen<br>Dr. Ines Kraus</p><div class="m-sig"><b>Dr. Ines Kraus</b><br>Syndikusrechtsanwältin · Leiterin Recht<br><span>Steinhauer Sportholding GmbH · Stuttgart</span></div><details class="m-gloss"><summary>Glossary (PL · EN)</summary><p><b>Haftungshöchstbetrag</b> — limit odpowiedzialności · liability cap<br><b>Garantie(n)</b> — zapewnienia i gwarancje · warranties<br><b>Offenlegung</b> — ujawnienie · disclosure<br><b>Stellungnahme</b> — opinia / stanowisko · written opinion<br><b>Syndikusrechtsanwältin</b> — in-house lawyer admitted to the bar</p></details>` },
    { id: 'nowicka', stage: 1, from: 'Aleksandra Nowicka', addr: 'a.nowicka@nowickabak.pl', time: '02:40', subject: 'Project Carbo — Seller comments on SPA', body: `<p>Dear Colleagues,</p><p>Please find attached our client's comments on the Share Purchase Agreement. Our client has shown considerable flexibility on price. In return, its positions on the <b>liability cap</b> and the <b>MAC definition</b> are final.</p><p>Our client remains committed to signing on Wednesday. We would, however, not be in a position to extend exclusivity beyond that date.</p><p>Kind regards,<br>Aleksandra Nowicka</p><div class="m-sig"><b>Aleksandra Nowicka</b><br>Partner<br><span>NOWICKA BĄK LEGAL sp.k. · pl. Solny 14 · Wrocław</span></div>` },
    { id: 'wendt2', stage: 2, from: 'Dr. Helena Wendt', addr: 'h.wendt@adlerwendt.de', time: '17:22', subject: 'RE: Carbo — redline', dynamic: true },
    { id: 'marta', stage: 2, from: 'Marta Kowalczyk', addr: 'm.kowalczyk@adlerwendt.pl', time: '18:31', subject: 'Wrocław — tonight', body: `<p>Hi,</p><p>Helena says you're the one reading the data room properly. Good — someone should.</p><p>I'll call you after seven. Keep your phone close. And put everything you've found on the board in the project room, Jonas has started it.</p><p>Marta</p><div class="m-sig"><b>Marta Kowalczyk</b><br>Partner · Head of Wrocław office<br><span>ADLER WENDT sp.k. · pl. Nowy Targ 30 · Wrocław</span></div>` },
  ];

  F.mail.push(
    { id: 'c2wrobel', ch: 2, stage: 0, from: 'Agnieszka Wróbel', addr: 'a.wrobel@silform.pl', time: '06:34', subject: 'FW: Mängelrüge + pismo Hartmann Schulte — PILNE', body: `<p>Dzień dobry,</p><p>w załączeniu reklamacja Vogt &amp; Keller i wezwanie od ich kancelarii. 18,4 mln euro. Termin: piątek.</p><p>Nasz dział jakości przygotował raport RTG i wątek mailowy o zmianie ECN-0417 — są na naszym dysku, udostępniłam go Państwu.</p><p>Proszę o telefon, jak tylko będzie Pan/Pani w biurze.</p><p>Agnieszka Wróbel<br>Prezes Zarządu · Silform sp. z o.o.</p><details class="m-gloss"><summary>English</summary><p>Attached: V&amp;K’s defect notice and their lawyers’ demand. €18.4m, deadline Friday. Our quality team’s X-ray report and the ECN-0417 email thread are on our shared drive. Please call as soon as you’re in.</p></details>`, attach: [{ name: 'Maengelruege_2027-01-08.pdf', open: () => F.openDoc('ruege') }, { name: 'HartmannSchulte_Anspruch.pdf', open: () => F.openDoc('claim') }] },
    { id: 'c2wendt', ch: 2, stage: 0, from: 'Dr. Helena Wendt', addr: 'h.wendt@adlerwendt.de', time: '07:14', subject: 'Silform — five questions by noon', body: `<p>This one is yours. I’m in Munich until two.</p><p>Write me a short Stellungnahme. Five questions: which law, which court, what the contract actually says, what EU law changes, and what the client should do. Cite the document for each answer.</p><p>Remember Carbo: read the documents, not the letters.</p><p>H.W.</p><div class="m-sent">Sent from mobile</div>` },
    { id: 'c2hartmann', ch: 2, stage: 0, from: 'Dr. Jan Hartmann', addr: 'hartmann@hartmann-schulte.de', time: '07:40', subject: 'Vogt & Keller ./. Silform — Besprechung heute, 18:30 Uhr', body: `<p>Sehr geehrte Frau Kollegin Dr. Wendt,</p><p>wir nehmen zur Kenntnis, dass Sie die Silform sp. z o.o. vertreten. Unsere Mandantin ist zu einem Gespräch heute um 18:30 Uhr in Stuttgart-Feuerbach bereit. An unserer Frist zum 15.01.2027 halten wir fest.</p><p>Mit freundlichen kollegialen Grüßen<br>Dr. Jan Hartmann</p><div class="m-sig"><b>Dr. Jan Hartmann</b><br>Rechtsanwalt · Partner<br><span>HARTMANN SCHULTE Rechtsanwälte · Königstraße 20 · Stuttgart</span></div><details class="m-gloss"><summary>Glossary</summary><p><b>Frau Kollegin</b> — the customary address between German lawyers · <b>zur Kenntnis nehmen</b> — to note · <b>an der Frist festhalten</b> — to keep the deadline · <b>mit kollegialen Grüßen</b> — sign-off used between lawyers</p></details>` },
    { id: 'c2cfo', ch: 2, stage: 0, from: 'Robert Kania', addr: 'r.kania@silform.pl', time: '06:58', subject: 'Before you advise us', body: `<p>Please see the note on our shared drive before you write anything to Stuttgart.</p><p>Robert Kania · CFO · Silform</p>`, attach: [{ name: 'CFO_note.msg', open: () => F.openDoc('cfo2') }] },
    { id: 'c2wendt2', ch: 2, stage: 1, from: 'Dr. Helena Wendt', addr: 'h.wendt@adlerwendt.de', time: '12:31', subject: 'RE: Stellungnahme', dynamic: 'memo' },
  );

  function memoReply() {
    const s = F.scoreMemo();
    let p;
    if (s.right === 5) p = `<p>Five out of five. And you saw that the notice point is a trap before Hartmann could set it. Good.</p>`;
    else if (s.right >= 3) p = `<p>${s.right} of 5. Look again at: ${s.missed.map((q) => q.q.replace(/^\d · /, '')).join(' · ')}. I’d rather you find it now than Hartmann finds it tonight.</p>`;
    else p = `<p>${s.right} of 5. We will go through it on the plane. Bring the QSV, the ECN and the email thread.</p>`;
    const c = s.cited >= 4 ? '<p>And you cited your sources. That is the habit that makes partners.</p>' : '<p>Next time, cite the document for every answer. An opinion without a source is a guess with a letterhead.</p>';
    return `${p}${c}<p>15:10 from Katowice. Hartmann expects us at 18:30. You will present our position — in German. I’ll be next to you.</p><p>H.W.</p>`;
  }

  function wendtReply() {
    const s = F.scoreRedline();
    const miss = s.missed.map((c) => '§' + c.ref).join(', ');
    let p;
    if (s.missed.length === 0) p = `<p>Clean. You rejected the cap, the MAC carve-out, the leakage clause and the lease risk-shift, and you let the arbitration seat go. That's the right instinct: fight the money, not the flags.</p>`;
    else if (s.missed.length <= 2) p = `<p>Mostly right. Look again at ${miss}. Nowicka doesn't write “standard” next to things that are standard.</p>`;
    else p = `<p>We need to talk about ${miss}. I've corrected it myself. Next time read the clause, not the comment.</p>`;
    return `${p}<p>Something else. The disclosure letter says the whole data room is “disclosed”, and someone closed folder 7.3 at three in the morning. Find out what was in it.</p><p>H.W.</p><div class="m-sent">Sent from mobile</div>`;
  }

  const ICONS = {
    mail: '<svg viewBox="0 0 24 24"><path d="M3 6h18v12H3z M3 6l9 7 9-7"/></svg>',
    docs: '<svg viewBox="0 0 24 24"><path d="M6 3h8l4 4v14H6z M14 3v4h4 M9 12h6 M9 16h6"/></svg>',
    vdr: '<svg viewBox="0 0 24 24"><path d="M4 7h6l2 2h8v10H4z M12 13v3 M10.5 13h3"/></svg>',
    cal: '<svg viewBox="0 0 24 24"><path d="M4 6h16v14H4z M4 10h16 M8 3v5 M16 3v5"/></svg>',
    law: '<svg viewBox="0 0 24 24"><path d="M12 3v18 M5 21h14 M4 8h16 M7 8l-3 7h6z M17 8l-3 7h6z"/></svg>',
    power: '<svg viewBox="0 0 24 24"><path d="M12 3v8 M6.3 6.3a8 8 0 1 0 11.4 0"/></svg>',
  };

  F.unread = () => F.mail.filter((m) => inCh(m) && !F.state.readMail[m.id]).length;

  F.openComputer = async (app, opt) => {
    opt = opt || {};
    F.inputLocked = true;
    F.audio.tone(880, 0.12, 0.01);
    if (!opt.noCam) await F.camTween({ x: 674, y: 591, z: 3.1 }, 0.85, F.U.easeInOut);
    const p = F.ui.panel('os', `
      <div class="os-bg"></div>
      <div class="os-top"><span class="os-brand">ADLER WENDT</span><span class="os-app">Workspace</span><span class="os-sp"></span><span class="os-user">${ch() >= 3 ? 'Associate · Employment · PL–DE' : 'Associate · M&amp;A · 9.14'}</span><span class="os-clock">${F.state.time || '08:07'}</span></div>
      <div class="os-rail">
        <button data-app="mail" title="Mail">${ICONS.mail}<i class="badge"></i></button>
        <button data-app="docs" title="Documents">${ICONS.docs}</button>
        <button data-app="vdr" title="Data Room">${ICONS.vdr}</button>
        <button data-app="cal" title="Calendar">${ICONS.cal}</button>
        <button data-app="law" title="Research">${ICONS.law}</button>
        <span class="os-sp"></span>
        <button data-app="off" title="Back to desk (Esc)">${ICONS.power}</button>
      </div>
      <div class="os-main"></div>`);
    p.node.classList.add('boot');
    setTimeout(() => p.node.classList.remove('boot'), 40);
    const main = p.node.querySelector('.os-main');
    const rail = p.node.querySelectorAll('.os-rail button');
    const badge = p.node.querySelector('.badge');
    const refreshBadge = () => { const n = F.unread(); badge.textContent = n || ''; badge.style.display = n ? '' : 'none'; };

    const apps = {
      mail() {
        const list = F.mail.filter(inCh).slice().reverse();
        main.innerHTML = `<div class="mail"><div class="mail-list"><div class="ml-h">Inbox <span>${list.length}</span></div>${list.map((m) => `<button class="ml-item ${F.state.readMail[m.id] ? '' : 'unread'}" data-id="${m.id}"><b>${m.from}</b><span class="ml-t">${m.time}</span><div>${m.subject}</div></button>`).join('')}</div><div class="mail-read"><div class="mr-empty">Select a message</div></div></div>`;
        const read = main.querySelector('.mail-read');
        const show = (id) => {
          const m = F.mail.find((x) => x.id === id);
          F.state.readMail[id] = true; F.save();
          main.querySelectorAll('.ml-item').forEach((b) => b.classList.toggle('sel', b.dataset.id === id));
          main.querySelector(`.ml-item[data-id="${id}"]`).classList.remove('unread');
          read.innerHTML = `<div class="mr-subj">${m.subject}</div><div class="mr-from"><div class="mr-av">${m.from.split(' ').map((w) => w[0]).join('').slice(-2)}</div><div><b>${m.from}</b> &lt;${m.addr}&gt;<br><span>to me · ${m.time}</span></div></div>${m.attach ? `<div class="mr-att">${m.attach.map((a, i) => `<button data-i="${i}"><i>${a.name.split('.').pop().toUpperCase()}</i>${a.name}</button>`).join('')}</div>` : ''}<div class="mr-body">${typeof m.dynamic === 'function' ? m.dynamic() : m.dynamic === 'memo' ? memoReply() : m.dynamic ? wendtReply() : m.body}</div>`;
          read.querySelectorAll('.mr-att button').forEach((b) => b.addEventListener('pointerdown', (e) => { e.stopPropagation(); m.attach[+b.dataset.i].open(); }));
          refreshBadge();
          F.audio.click();
        };
        main.querySelectorAll('.ml-item').forEach((b) => b.addEventListener('pointerdown', (e) => { e.stopPropagation(); show(b.dataset.id); }));
        const firstUnread = list.find((m) => !F.state.readMail[m.id]);
        if (firstUnread) show(firstUnread.id);
      },
      docs() {
        if (override('docs')) return override('docs')(main, { close: () => closeOS() });
        if (ch() === 2) {
          main.innerHTML = `<div class="docs"><div class="dh">Documents <span>Silform ./. Vogt &amp; Keller · AW-GLI-2027-004</span></div><div class="dgrid">${F.ch2Docs.map(([k, n, f, t]) => `<button class="dcard ${k === 'memo' ? 'memo-card' : ''} ${F.state.readDocs && F.state.readDocs[k] ? 'seen' : ''}" data-k="${k}"><i class="t-${t}">${t}</i><b>${n}</b><span>${f}</span></button>`).join('')}</div></div>`;
          main.querySelectorAll('.dcard').forEach((b) => b.addEventListener('pointerdown', (e) => {
            e.stopPropagation();
            if (b.dataset.k === 'memo') F.openMemo().then((sent) => { if (sent) { closeOS(); F.emit('memo:sent'); } });
            else F.openDoc(b.dataset.k).then(() => b.classList.add('seen'));
          }));
          return;
        }
        const items = stageIdx() >= 1 ? [['spa', 'SPA_NB_markup_v7.docx', '1.1 Transaction', 'DOCX'], ['disclosure', 'Disclosure_Letter_draft3.pdf', '1.2 Disclosure', 'PDF'], ['minutes', 'RN_protokol_2026-10-02.pdf', '4.2 Corporate', 'PDF'], ['lease', 'Umowa_dzierzawy_41_SP_2019.pdf', '6.1 Real estate', 'PDF'], ['krs', 'KRS_0000981234_odpis.pdf', 'Public registry', 'PDF'], ['clipping', 'GazetaStoleczna_2026-05-11.pdf', 'Open sources', 'PDF']] : [];
        main.innerHTML = `<div class="docs"><div class="dh">Documents <span>Project Carbo</span></div>${items.length ? '' : '<div class="dz">No matter documents yet. Talk to Dr. Wendt.</div>'}<div class="dgrid">${items.map(([k, n, f, t]) => `<button class="dcard ${F.state.readDocs && F.state.readDocs[k] ? 'seen' : ''}" data-k="${k}"><i class="t-${t}">${t}</i><b>${n}</b><span>${f}</span></button>`).join('')}</div></div>`;
        main.querySelectorAll('.dcard').forEach((b) => b.addEventListener('pointerdown', (e) => {
          e.stopPropagation();
          const k = b.dataset.k;
          if (k === 'spa') F.openRedline().then((sent) => { if (sent) { closeOS(); F.emit('redline:sent'); } });
          else F.openDoc(k).then(() => b.classList.add('seen'));
        }));
      },
      vdr() {
        if (override('vdr')) return override('vdr')(main, { close: () => closeOS() });
        if (ch() === 2) {
          const items = [['thread', 'Quality / RE ECN-0417 rib B.msg'], ['rtg', 'Laboratorium / QL-2027-006 RTG.pdf'], ['cfo2', 'Zarząd / CFO note.msg']];
          main.innerHTML = `<div class="docs vdr-app"><div class="dh">Silform shared drive <span>read-only · shared with Adler Wendt</span></div><div class="vlist">${items.map(([k, n]) => `<button class="vitem" data-k="${k}"><i>▸</i>${n}</button>`).join('')}</div></div>`;
          main.querySelectorAll('.vitem').forEach((b) => b.addEventListener('pointerdown', (e) => { e.stopPropagation(); F.openDoc(b.dataset.k); }));
          return;
        }
        const items = stageIdx() >= 1 ? [['dataroom', 'Index & audit log'], ['minutes', '4.2 · RN protokół 02.10.2026'], ['lease', '6.1 · Umowa dzierżawy (wyciąg)'], ['cfomail', '12.1 · RE: VDR 7.3']] : [];
        main.innerHTML = `<div class="docs vdr-app"><div class="dh">DataVault PL <span>CARBO · read-only · watermarked</span></div>${items.length ? '' : '<div class="dz">Access pending.</div>'}<div class="vlist">${items.map(([k, n]) => `<button class="vitem" data-k="${k}"><i>▸</i>${n}</button>`).join('')}</div><div class="vwm">Watermark: ADLER WENDT · ${new Date(2026, 9, 12).toLocaleDateString('de-DE')} · every page view is logged</div></div>`;
        main.querySelectorAll('.vitem').forEach((b) => b.addEventListener('pointerdown', (e) => { e.stopPropagation(); F.openDoc(b.dataset.k); }));
      },
      cal() {
        if (override('cal')) return override('cal')(main, { close: () => closeOS() });
        if (ch() === 2) {
          main.innerHTML = `<div class="cal"><div class="dh">Tuesday, 12 January 2027</div><div class="cal-day">${[['06:50', 'Call — A. Wróbel (Silform)', 'mobile'], ['12:00', 'Stellungnahme due → H. Wendt', ''], ['15:10', 'KTW → STR', 'Katowice Airport'], ['18:30', 'Meeting — Hartmann Schulte / Vogt &amp; Keller', 'Stuttgart-Feuerbach']].map(([t, n, r]) => `<div class="cal-e ${t === '18:30' ? 'hot' : ''}"><b>${t}</b><span>${n}</span><i>${r}</i></div>`).join('')}</div><div class="dh sm">Friday, 15 January</div><div class="cal-day"><div class="cal-e hot"><b>24:00</b><span>Hartmann deadline — €18.4m</span><i></i></div></div></div>`;
          return;
        }
        main.innerHTML = `<div class="cal"><div class="dh">Monday, 12 October</div>
          <div class="cal-day">${[['08:00', 'Dr. Wendt — Carbo kick-off', '10.01'], ['12:30', 'Lunch (unlikely)', ''], ['17:00', 'Redline due → H. Wendt', ''], ['19:00', 'Call — M. Kowalczyk (Wrocław)', 'mobile']].map(([t, n, r]) => `<div class="cal-e"><b>${t}</b><span>${n}</span><i>${r}</i></div>`).join('')}</div>
          <div class="dh sm">Wednesday, 14 October</div><div class="cal-day"><div class="cal-e hot"><b>10:00</b><span>SIGNING — Project Carbo</span><i>Wrocław</i></div></div></div>`;
      },
      law() {
        if (override('law')) return override('law')(main, { close: () => closeOS() });
        if (ch() === 2) {
          main.innerHTML = `<div class="law"><div class="dh">Research <span>beck-online · Legalis · EUR-Lex</span></div>
            <div class="law-q">CISG · Rechtswahl deutsches Recht · Gerichtsstand · Rügeobliegenheit</div>
            <article><h3>Choosing “German law” does not switch off the CISG</h3><p>Poland and Germany are both contracting states of the UN Convention on Contracts for the International Sale of Goods. Between them it applies automatically to sales of goods, and a clause choosing German law is read as choosing the CISG, which is part of German law. To apply the BGB and HGB instead, the parties must <b>exclude the CISG expressly</b> (art. 6 CISG). Matters the CISG doesn’t govern, such as whether standard terms are valid, go to the chosen national law.</p></article>
            <article><h3>Strict liability under the CISG</h3><p>A seller is liable for non-conforming goods regardless of fault; it is exempt only for impediments beyond its control (art. 79). A party cannot rely on the other side’s failure to the extent it was caused by its own act or omission (<b>art. 80</b>). Damages are limited to what was foreseeable when the contract was made (<b>art. 74</b>).</p></article>
            <article><h3>Inspection and notice — three systems, one logic</h3><p><b>CISG</b> arts. 38–39: examine within as short a period as practicable; give notice within a reasonable time after the defect was or ought to have been discovered (two-year long-stop). <b>HGB §377</b>: a merchant buyer must inspect without undue delay and notify, or the goods are deemed approved. <b>Polish KC art. 563 §2</b>: between businesses, the buyer loses warranty rights if it fails to inspect in the usual way and notify promptly. Automotive quality agreements often narrow the incoming inspection — read them first.</p></article>
            <article><h3>Jurisdiction under Brussels I bis (Reg. 1215/2012)</h3><p>A defendant domiciled in an EU state may be sued there (<b>art. 4</b>). For a sale of goods, it may also be sued where the goods were or should have been delivered under the contract (<b>art. 7(1)(b)</b>); the CJEU has held that agreed delivery terms such as Incoterms can fix that place (Car Trim, C-381/08; Electrosteel, C-87/10). A choice-of-court agreement (<b>art. 25</b>) needs real consensus — conflicting forum clauses in each side’s standard terms usually show none.</p></article>
            <article><h3>Liability caps in standard terms (German law)</h3><p>If a cap is a standard term (AGB), German courts test it under <b>§307 BGB</b> even between businesses; caps that don’t cover the typical, foreseeable damage, or that reach gross negligence, are at risk. An individually negotiated cap is not subject to that test.</p></article></div>`;
          return;
        }
        main.innerHTML = `<div class="law"><div class="dh">Research <span>beck-online · Legalis</span></div>
          <div class="law-q">change of control · municipal lease · consent</div>
          <article><h3>Change-of-control clauses in leases of municipal property</h3><p>Where a municipality leases a sports facility, the lease commonly allows termination if control of the tenant changes without consent. Because consent may require a <b>resolution of the city council</b>, buyers typically make consent a <b>condition precedent</b> to completion rather than accepting the risk after signing.</p></article>
          <article><h3>Art. 377 KSH — conflict of interest of a management board member</h3><p>A board member whose interests conflict with the company's must abstain from deciding the matter. An abstention recorded in the minutes is often the first visible trace of a <b>related-party transaction</b>.</p></article>
          <article><h3>Locked box &amp; “permitted leakage”</h3><p>In a locked-box deal the price is fixed on a past balance sheet; the seller promises no value leaves the company afterwards. Allowing “ordinary course” payments to <b>related parties</b> can open a door wide enough to drive a factoring deal through.</p></article></div>`;
      },
    };
    let current = null;
    const go = (a) => {
      if (a === 'off') return closeOS();
      current = a;
      rail.forEach((b) => b.classList.toggle('on', b.dataset.app === a));
      main.classList.remove('in'); void main.offsetWidth; main.classList.add('in');
      apps[a]();
    };
    rail.forEach((b) => b.addEventListener('pointerdown', (e) => { e.stopPropagation(); F.audio.click(); go(b.dataset.app); }));
    refreshBadge();
    go(app || 'mail');
    let closed = false;
    const onKey = (e) => { if (e.key === 'Escape' && !document.querySelector('.docview, .redline')) closeOS(); };
    F.on('key', onKey);
    async function closeOS() {
      if (closed) return; closed = true;
      F.off('key', onKey);
      p.close();
      F.audio.tone(440, 0.1, 0.01);
      await F.wait(250);
      if (!opt.noCam) await F.camTween({ x: F.VW / 2, y: F.VH / 2, z: 1 }, 0.8, F.U.easeInOut);
      F.inputLocked = false;
      F.state.unread = F.unread();
      F.emit('computer:closed');
    }
    F.inputLocked = false;
  };
})(window.F);
