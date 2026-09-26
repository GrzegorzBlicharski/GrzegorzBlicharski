/* THE FIRM — Chapter III: Eighty Positions. Gliwice, February. Polish employment law, advising the employer. */
(function (F) {
  'use strict';
  const U = F.U;
  const S = F.state;
  const ui = F.ui;
  const C = F.people.cast;
  const st = {};
  F.story3 = st;

  const say = (id, text, o) => ui.say(C[id] ? C[id].name.replace(/^Dr\. /, '') : id, text, Object.assign({ speaker: id }, o || {}));
  const narr = (text) => ui.say('', text);
  const choose = (opts, o) => ui.choose(opts, o);
  const wait = F.wait;
  const setTime = (t) => { S.time = t; F.save(); };
  const scene = () => F.scene;
  const ch3 = () => S.chapter === 3;
  const has = (k) => !!S.findings[k];
  const W3 = () => F.WORK3;

  // ================================================================== START
  st.start = async () => {
    Object.assign(S, { chapter: 3, stage: 'c3_brief', time: '05:48', ch3: { memo: {} } });
    Object.keys(F.EVIDENCE).filter((k) => F.EVIDENCE[k].ch === 3).forEach((k) => delete S.findings[k]);
    ['c3lis', 'c3wrobel', 'c3wendt', 'c3lis2'].forEach((k) => delete S.readMail[k]);
    ['c3call', 'c3jonas', 'memo3Sent', 'c3authority', 'c3stairs'].forEach((k) => delete S.flags[k]);
    F.save();
    F.inputLocked = true;
    await F.go('void', { cut: true, holdBlack: true });
    F.audio.mix({ city: 0.14, pad: 0.3 }, 3);
    F.audio.chord('night');
    await wait(1600);
    await ui.card([{ text: 'Chapter III', cls: 'c-chapter' }, { text: 'Eighty Positions', cls: 'c-chapname' }], { hold: 3200, stagger: 0.7 });
    await wait(500);
    await ui.card([{ text: 'Gliwice', cls: 'c-city' }, { text: '05:48', cls: 'c-time' }, { text: 'Thursday · 11 February 2027', cls: 'c-day' }], { hold: 3200, stagger: 0.55 });
    await F.go('silform_gate', { cut: true, fadeIn: 2200 });
    F.camTween({ x: F.VW / 2 + 60, y: F.VH / 2 + 10, z: 1.12 }, 10, U.easeInOut);
    await wait(3800, true);
    ui.stamp('Silform sp. z o.o. · Brama 2', '05:48', 'The 06:00 shift');
    await wait(1400, true);
    await narr('Two hundred and forty people work behind this gate. By Friday, someone will have decided which eighty of them are leaving.');
    await narr('Nobody on this shift knows yet. The paper on the notice board says the canteen will close early on Friday.');
    ui.dialogueClose();
    await wait(1600, true);
    st.office(true);
  };

  st.resume = () => {
    if (S.stage === 'c3_consult') return st.consultation();
    if (S.stage === 'c3_director') return st.director();
    return st.office(false);
  };

  // ================================================================== OFFICE — WINTER MORNING
  st.office = async (arrive) => {
    S.stage = 'c3_brief'; setTime('06:31');
    await F.go('office', { mode: 'winter', arrive, fadeOut: 1000, fadeIn: 1200 });
    S.unread = F.unread();
    if (arrive) {
      ui.stamp('9th floor · Employment / PL–DE desk', '06:31', 'One month after Stuttgart');
      await scene().arrive('Agnieszka Wróbel · Silform', 'Calling…');
    }
    if (!F.flag('c3call')) await st.clientCall();
    ui.objective('Read the Silform file. Six answers for mec. Lis by 14:00.');
    F.inputLocked = false;
  };

  st.clientCall = async () => {
    F.flag('c3call', true);
    const sc = scene();
    F.inputLocked = true;
    await ui.incomingCall('Agnieszka Wróbel', 'Silform sp. z o.o. · Gliwice');
    sc.phoneText = null;
    F.fx.bars(true);
    F.camTween({ x: 900, y: 430, z: 1.4 }, 14, U.easeInOut);
    await say('wrobel', 'To znowu ja. <span class="gloss">It’s me again.</span>', { role: 'CEO · Silform · on the phone' });
    await say('wrobel', 'Vogt & Keller is moving the housing to Mexico from April. We kept them as a customer — but not that part. Hall 2 has nothing to cast.');
    await say('wrobel', 'Our CFO wants eighty people out by the end of March, quietly, in small groups. And the supervisory board wants Rudnicki gone by Friday. He shipped L07 to L09 over our own engineer’s hold.');
    await say('wrobel', 'I have his termination on my desk. I can sign it this morning.');
    const c = await choose([
      { text: 'Please don’t sign anything and don’t announce anything yet. Send me the plan, the list, the union letters and Rudnicki’s contracts. You’ll have our opinion by two.' },
      { text: 'Small groups sounds sensible — it keeps the unions out of it.' },
      { text: 'Sign it. The sooner he’s out, the better.' },
    ]);
    S.ch3.call = c;
    if (c === 0) { F.trust('wrobel', 1); await say('wrobel', 'Dobrze. Everything is on the shared drive in ten minutes. Mec. Lis already knows — I called her at six.'); }
    else if (c === 1) { await say('wrobel', 'That’s what Robert says.'); await narr('And Robert is not a lawyer. Splitting a decided redundancy to dodge the procedure is exactly what the unions — and later a labour court — will look for.'); await say('wrobel', 'I’ll put everything on the drive.'); }
    else { await say('wrobel', 'Good. Then I’ll—'); await narr('You stop her before she finishes. A termination signed by the wrong person is a gift to his lawyer. You don’t know who has to sign it yet — and neither does she.'); await say('wrobel', 'Fine. I’ll wait for your opinion.'); }
    ui.dialogueClose();
    F.fx.bars(false);
    await F.camTween({ x: F.VW / 2, y: F.VH / 2, z: 1 }, 1.4);
    await wait(500);
    ui.toast('mec. Barbara Lis', 'Silform — opinia do 14:00');
    await wait(1800);
    ui.toast('Dr. Helena Wendt', 'Barbara runs this one');
  };

  // ------------------------------------------------------------------ office interactions (Chapter III)
  F.on('office:phone', async () => {
    if (!ch3()) return;
    await ui.phone.open('Agnieszka Wróbel', 'Silform · CEO', [{ text: 'Związki już wiedzą. Mazur dzwoniła o 7:10.', time: '07:12' }, { text: '(The unions already know. Mazur called at 7:10.)', time: '07:12' }, { text: 'Spotkanie ze związkami dziś 15:00. Będzie Pani/Pan?', time: '07:14' }], S.time);
  });
  F.on('office:file', () => { if (ch3()) F.openComputer('docs'); });
  F.on('office:coffee', () => { if (!ch3()) return; narr('Coffee. Outside, the snow has turned grey on the ring road.').then(() => ui.dialogueClose()); });
  F.on('office:window', async () => {
    if (!ch3()) return;
    F.inputLocked = true;
    await F.camTween({ x: 900, y: 420, z: 1.45 }, 1.4);
    await narr('Somewhere past the headframes, Hall 2 is running its last full week. The people on that shift have mortgages in Sośnica and kids at school in Łabędy.');
    ui.dialogueClose();
    await F.camTween({ x: F.VW / 2, y: F.VH / 2, z: 1 }, 1.2);
    F.inputLocked = false;
  });
  F.on('office:stairs', async () => {
    if (!ch3()) return;
    F.inputLocked = true;
    if (!F.flag('c3stairs')) {
      F.flag('c3stairs', true);
      await narr('Floor 10. The door with the brass plate — “mec. Barbara Lis, radca prawny” — is open. She doesn’t look up from the file.');
      await say('lis', 'You were in Stuttgart. Good. Here nobody speaks German and nobody is impressed by the CISG.', { role: 'Partner · Employment' });
      await say('lis', 'Employment law is arithmetic and people. Count the heads, count the days, and read every name on that list twice.');
      const c = await choose([{ text: 'What do you want the opinion to do?' }, { text: 'Where do people usually go wrong?' }]);
      if (c === 0) await say('lis', 'Tell the client what the law requires, what it costs, and what she can still decide. In that order.');
      else await say('lis', 'They treat the director like one of the eighty. He isn’t. Two relationships, two acts — and look at who is allowed to sign.');
    } else await say('lis', 'Six answers. Each one with the document behind it. Two o’clock.', { role: 'Partner · Employment' });
    ui.dialogueClose();
    F.inputLocked = false;
  });
  F.on('office:jonas', async () => {
    if (!ch3()) return;
    const sc = scene();
    F.inputLocked = true;
    F.camTween({ x: 1030, y: 400, z: 2.4 }, 1.6);
    for (let i = 0; i <= 20; i++) { sc.jonasTurn = U.lerp(0.75, -0.35, U.easeInOut(i / 20)); await wait(30); }
    if (!F.flag('c3jonas')) {
      F.flag('c3jonas', true);
      await say('jonas', 'Collective redundancy? My condolences. Lis will make you count everything twice.', { role: 'Associate' });
      await say('jonas', 'Tip one: “mutual agreements don’t count” is the most expensive sentence in Polish employment law. Tip two: the HR notes column is where the landmines are.');
      const c = await choose([{ text: 'And the director?' }, { text: 'Thanks. Anything else?' }]);
      if (c === 0) await say('jonas', 'Board member with an employment contract. Who represents the company in a contract with a board member? | Not the other board members.');
      else await say('jonas', 'Mazur has run that union since before you were born. She will know the Act better than the CFO. Probably better than me.');
    } else await say('jonas', 'Count the heads, count the days, read the HR notes. And art. 210.');
    ui.dialogueClose();
    await F.camTween({ x: F.VW / 2, y: F.VH / 2, z: 1 }, 1.3);
    for (let i = 0; i <= 15; i++) { sc.jonasTurn = U.lerp(-0.35, 0.75, U.easeInOut(i / 15)); await wait(30); }
    F.inputLocked = false;
  });
  F.on('memo3:sent', () => { if (ch3()) st.afterMemo(); });

  // ------------------------------------------------------------------ workstation (Chapter III)
  const signature = (name, role) => `<div class="m-sig"><b>${name}</b><br>${role}<br><span>ADLER WENDT sp.k. · Kancelaria Prawna · ul. Zwycięstwa 7 · Gliwice</span></div>`;
  F.mail.push(
    { id: 'c3lis', ch: 3, stage: 0, from: 'mec. Barbara Lis', addr: 'b.lis@adlerwendt.pl', time: '06:20', subject: 'Silform — Hala 2 i p. Rudnicki', body: `<p>Dzień dobry,</p><p>Silform chce zlikwidować 80 stanowisk w Hali 2 i rozstać się z dyrektorem operacyjnym, który jest też członkiem zarządu. Pani Prezes dzwoniła o szóstej.</p><p>Proszę o krótką opinię do 14:00 — sześć pytań: czy ma zastosowanie ustawa o zwolnieniach grupowych, jaka procedura, jakie kryteria, co z osobami chronionymi, jakie odprawy, jak rozstać się z p. Rudnickim. Każda odpowiedź z dokumentem.</p><p>O 15:00 jedzie Pan/Pani ze mną do Silformu. Konsultacje z dwoma związkami.</p><p>B. Lis</p>${signature('mec. Barbara Lis', 'Partner · Prawo pracy · radca prawny')}<details class="m-gloss"><summary>English</summary><p>Silform wants to eliminate 80 positions in Hall 2 and part with its operations director, who is also a board member. Short opinion by 14:00 — six questions: does the collective redundancy act apply, which procedure, which criteria, what about protected employees, what severance, how to part with Mr Rudnicki. Each answer with its document. At 15:00 you come with me to Silform: consultation with two unions.</p></details>` },
    { id: 'c3wrobel', ch: 3, stage: 0, from: 'Agnieszka Wróbel', addr: 'a.wrobel@silform.pl', time: '06:44', subject: 'Dokumenty — Hala 2 / T.R.', body: `<p>W załączeniu plan Roberta, robocza lista z kadr, pisma związków i umowy p. Rudnickiego. Mój projekt wypowiedzenia też — nie podpisałam.</p><p>A. Wróbel</p><details class="m-gloss"><summary>English</summary><p>Attached: Robert’s plan, HR’s working list, the union letters and Mr Rudnicki’s contracts. My draft termination too — I haven’t signed it.</p></details>`, attach: [{ name: 'Plan_restrukturyzacji_Hala2_v2.pdf', open: () => F.openDoc('plan3') }, { name: 'Lista_Hala2_robocza_v3.xlsx', open: () => F.openDoc('lista') }, { name: 'Wypowiedzenie_Rudnicki_PROJEKT.docx', open: () => F.openDoc('wyp') }] },
    { id: 'c3wendt', ch: 3, stage: 0, from: 'Dr. Helena Wendt', addr: 'h.wendt@adlerwendt.de', time: '06:58', subject: 'Silform, again', body: `<p>Silform asked for you by name. That is how practices are built — remember it.</p><p>Barbara runs employment. She has done more collective redundancies than anyone in Silesia and she does not repeat herself. Listen the first time.</p><p>H.W.</p><div class="m-sent">Sent from mobile</div>` },
    { id: 'c3lis2', ch: 3, stage: 1, from: 'mec. Barbara Lis', addr: 'b.lis@adlerwendt.pl', time: '14:02', subject: 'RE: Opinia — Silform', dynamic: () => {
      const s = F.scoreWork(W3());
      const p = s.right === s.total ? '<p>Sześć na sześć. Nie mam poprawek. To się zdarza rzadko.</p>' : s.right >= 4 ? `<p>${s.right} z ${s.total}. Proszę jeszcze raz spojrzeć na: ${s.missed.map((q) => q.q.replace(/^\d · /, '')).join(' · ')}. Omówimy w samochodzie.</p>` : `<p>${s.right} z ${s.total}. Omówimy w samochodzie. Proszę zabrać listę i umowy Rudnickiego.</p>`;
      return `${p}${s.cited >= 5 ? '<p>I dziękuję za źródła przy każdej odpowiedzi.</p>' : '<p>Przy każdej odpowiedzi — dokument. Sąd pracy nie wierzy na słowo, ja też nie.</p>'}<p>Wyjeżdżamy 14:30. B.L.</p><details class="m-gloss"><summary>English</summary><p>${s.right} of ${s.total}. ${s.cited >= 5 ? 'Thank you for citing a source for every answer.' : 'A document for every answer — the labour court doesn’t take anyone’s word for it, and neither do I.'} We leave at 14:30.</p></details>`;
    } },
  );

  F.chapterOS[3] = {
    docs(main, api) {
      main.innerHTML = `<div class="docs"><div class="dh">Documents <span>Silform — Hala 2 / T. Rudnicki · AW-GLI-2027-019</span></div><div class="dgrid">${F.ch3Docs.map(([k, n, f, t]) => `<button class="dcard ${k === 'memo' ? 'memo-card' : ''} ${S.readDocs && S.readDocs[k] ? 'seen' : ''}" data-k="${k}"><i class="t-${t}">${t}</i><b>${n}</b><span>${f}</span></button>`).join('')}</div></div>`;
      main.querySelectorAll('.dcard').forEach((b) => b.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        if (b.dataset.k === 'memo') F.openMemo3().then((sent) => { if (sent) { api.close(); F.emit('memo3:sent'); } });
        else F.openDoc(b.dataset.k).then(() => b.classList.add('seen'));
      }));
    },
    vdr(main) {
      const items = [['plan3', 'Zarząd / Plan restrukturyzacji Hala 2.pdf'], ['lista', 'Kadry / Lista Hala 2 robocza v3.xlsx'], ['hold', 'Jakość / RE Blokada L07–L09.msg'], ['krs3', 'Rejestr / Odpis KRS.pdf']];
      main.innerHTML = `<div class="docs vdr-app"><div class="dh">Silform shared drive <span>read-only · shared with Adler Wendt</span></div><div class="vlist">${items.map(([k, n]) => `<button class="vitem" data-k="${k}"><i>▸</i>${n}</button>`).join('')}</div></div>`;
      main.querySelectorAll('.vitem').forEach((b) => b.addEventListener('pointerdown', (e) => { e.stopPropagation(); F.openDoc(b.dataset.k); }));
    },
    cal(main) {
      main.innerHTML = `<div class="cal"><div class="dh">Thursday, 11 February 2027</div><div class="cal-day">${[['06:31', 'Call — A. Wróbel (Silform)', 'mobile'], ['14:00', 'Opinia due → B. Lis', ''], ['15:00', 'Konsultacje — ZZ Metalowcy · ZZ Inżynierów i Techników', 'Silform, Hala 2']].map(([t, n, r]) => `<div class="cal-e ${t === '15:00' ? 'hot' : ''}"><b>${t}</b><span>${n}</span><i>${r}</i></div>`).join('')}</div><div class="dh sm">Friday, 12 February</div><div class="cal-day"><div class="cal-e hot"><b>16:00</b><span>T. Rudnicki + mec. P. Grabowski</span><i>Silform</i></div></div></div>`;
    },
    law(main) {
      main.innerHTML = `<div class="law"><div class="dh">Research <span>Legalis · ISAP · EUR-Lex</span></div>
        <div class="law-q">zwolnienia grupowe · osoby chronione · odprawa · członek zarządu umowa o pracę</div>
        <article><h3>When is it a collective redundancy? (Act of 13 March 2003, art. 1)</h3><p>The Act applies to employers with at least <b>20 employees</b> who end employment for reasons not attributable to the employees, by notice or by agreement, within a period of up to <b>30 days</b>, affecting at least: 10 employees (employer with fewer than 100), <b>10%</b> (100–299 employees) or 30 employees (300 or more). Terminations by agreement count if there are <b>at least five</b>. The Act implements Directive 98/59/EC; the CJEU ties the duty to consult to redundancies the employer is <b>contemplating</b> (Junk, C-188/03).</p></article>
        <article><h3>Consultation and notification (arts. 2–5)</h3><p>The employer consults the <b>company trade unions</b> (without unions: employee representatives) on ways to avoid or reduce redundancies and on related employment matters, and informs them in writing of the reasons, numbers and groups, the period, the proposed criteria and order, and proposed benefits; a copy goes to the <b>district labour office (PUP)</b>. The parties have <b>up to 20 days</b> to agree; failing that, the employer issues <b>regulations</b>, taking union proposals into account as far as possible. The employer then notifies the PUP; employment may end <b>no earlier than 30 days</b> after that notice.</p></article>
        <article><h3>Protected employees (art. 5) and severance (art. 8)</h3><p>Special protection survives a collective redundancy: outside bankruptcy or liquidation, protected employees (e.g. <b>art. 39 KP</b> pre-retirement, <b>art. 177 KP</b> pregnancy and maternity, <b>art. 186⁸ KP</b> parental leave, <b>art. 32</b> of the Trade Unions Act) may only receive notice changing their terms; if pay falls, a compensatory allowance is paid until the protection ends. Severance: <b>1 / 2 / 3 months’ pay</b> for service with the employer of under 2 / 2–8 / over 8 years, capped at <b>15 × the minimum wage</b>.</p></article>
        <article><h3>Equal treatment (art. 18³a KP)</h3><p>Selection criteria must not discriminate — directly (age) or indirectly (criteria that fall harder on protected groups, such as absences linked to disability: CJEU, Ruiz Conejero, C-270/16). Courts expect criteria that are real, known and applied consistently.</p></article>
        <article><h3>Board member with an employment contract (KSH arts. 203, 210)</h3><p>A management board member of a sp. z o.o. may be removed by shareholders’ resolution at any time; removal <b>does not remove claims</b> under the employment relationship (art. 203 §1). In a contract between the company and a board member — including its termination — the company is represented by the <b>supervisory board or a proxy appointed by shareholders’ resolution</b> (art. 210 §1). The notice must state a concrete reason (<b>art. 30 §4 KP</b>); summary dismissal (<b>art. 52 KP</b>) needs a gross breach and must follow within <b>one month</b> of the employer learning of it. A post-employment non-compete requires compensation of at least <b>25%</b> of prior pay for its duration (<b>art. 101² §3 KP</b>).</p></article></div>`;
    },
  };

  // ================================================================== AFTER THE OPINION — Lis in the car
  st.afterMemo = async () => {
    if (S.stage !== 'c3_brief') return;
    S.stage = 'c3_consult'; setTime('14:02'); F.save();
    F.inputLocked = true;
    await wait(1200);
    ui.toast('mec. Barbara Lis', 'RE: Opinia — Silform');
    await wait(2600);
    await narr('Lis replies in two minutes. At 14:30 her car is idling outside, wipers fighting the sleet.');
    ui.dialogueClose();
    await F.go('taxi', { fadeOut: 1200, fadeIn: 1200 });
    ui.stamp('ul. Zwycięstwa → Bojkowska', '14:34', 'mec. Lis drives herself');
    await wait(1600);
    const s = F.scoreWork(W3());
    await say('lis', 'Your opinion. Before Mazur reads it on your face.', { role: 'Partner · Employment · driving' });
    if (!s.missed.length) await say('lis', 'Nothing to correct. So: Mazur will test you on the list first. Then Bober will ask about himself. Then they will ask what you are offering — that is the real question.');
    else for (const Q of s.missed) { const right = Q.opts.find((o) => o.ok); await say('lis', `${Q.q.replace(/^\d · /, '')} — ${right.why}`); }
    await say('lis', 'Wróbel has the supervisory board’s approval for one extra month’s pay per person. Not a złoty more. And we don’t promise anything we can’t put in writing.');
    ui.dialogueClose();
    await wait(2600, true);
    st.consultation();
  };

  // ================================================================== CONSULTATION — the two unions
  st.consultation = async () => {
    S.stage = 'c3_consult'; setTime('15:04'); F.save();
    await F.go('silform_room', { mode: 'union', shot: 'hall', fadeOut: 1200, fadeIn: 1400 });
    const sc = scene(), K = sc.cast;
    F.inputLocked = true;
    F.fx.bars(true);
    ui.stamp('Silform · sala nad Halą 2', '15:04', 'Consultation · two company unions');
    await wait(2600);
    sc.shot('wide', 3);
    await wait(2000);
    sc.shot('lis');
    await say('lis', 'Pani Przewodnicząca, Panie Przewodniczący — dziękuję. Otwieramy konsultacje. Propozycje zarządu przedstawi nasz prawnik. <span class="gloss">Madam Chair, Mr Chair — thank you. We are opening the consultation. Our lawyer will present the board’s proposals.</span>', { role: 'Partner · for Silform' });
    sc.shot('mazur');
    await say('mazur', 'Zanim zaczniecie: widziałam waszą listę. Wszyscy po pięćdziesiątce na górze. | Tak się w Silformie zwalnia ludzi? <span class="gloss">Before you start: I’ve seen your list. Everyone over fifty at the top. Is that how Silform lets people go?</span>', { role: 'Chair · “Metalowcy Silform”' });
    let cred = 0;
    // ---- round 1: the criteria
    sc.shot('wide', 1.4);
    const r1 = await choose([
      { text: 'Tamten projekt jest wycofany. Proponujemy kryteria obiektywne: kwalifikacje do stanowisk, które zostają, i do nowego gniazda, oceny okresowe, karalność dyscyplinarna — staż jako kryterium rozstrzygające. Wpiszemy je do porozumienia. <span class="gloss">That draft is withdrawn. We propose objective criteria: qualifications for the remaining jobs and the new cell, appraisals, disciplinary record — seniority as the tie-breaker. We’ll write them into the agreement.</span>', tag: has('criteria') ? 'PL · draft list' : 'PL · no evidence', disabled: !has('criteria') },
      { text: 'Wiek to obiektywne kryterium — ci ludzie niedługo przechodzą na emeryturę. <span class="gloss">Age is an objective criterion — these people will retire soon.</span>', tag: 'PL' },
      { text: 'Lista jest poufna. Porozmawiajmy o liczbach. <span class="gloss">The list is confidential. Let’s talk numbers.</span>', tag: 'PL' },
    ]);
    if (r1 === 0) { cred++; sc.shot('mazur'); K.mazur.expr = 'suspicious'; await say('mazur', 'To brzmi inaczej niż w zeszłym tygodniu. <span class="gloss">That sounds different from last week.</span>'); }
    else if (r1 === 1) { cred--; sc.shot('lis'); K.lis.expr = 'cold'; await narr('Lis doesn’t look at you. Age as a selection criterion is direct discrimination (art. 18³a KP) — and Mazur has just been handed her headline.'); }
    else { cred--; sc.shot('mazur'); K.mazur.expr = 'angry'; await say('mazur', 'Kryteria mają być w zawiadomieniu. Znamy ustawę, Panie Mecenasie. <span class="gloss">The criteria have to be in the written notice. We know the Act, counsel.</span>'); }
    // ---- round 2: the protected names
    sc.shot('bober'); K.bober.expr = 'angry';
    await say('bober', 'Marta Kaczmarek jest w ciąży. Pawlakowi zostały dwa lata do emerytury. Nowakowska jest na rodzicielskim. A ja jestem w zarządzie związku. | Też nas zwolnicie? <span class="gloss">Marta Kaczmarek is pregnant. Pawlak has two years to retirement. Nowakowska is on parental leave. And I’m on the union’s board. You’ll let us go too?</span>', { role: 'Chair · Engineers’ & Technicians’ union' });
    sc.shot('wide', 1.4);
    const r2 = await choose([
      { text: 'Nie. Te osoby są pod szczególną ochroną. Przy zwolnieniu grupowym możemy im najwyżej zmienić warunki — a jeśli spadnie wynagrodzenie, dostaną dodatek wyrównawczy do końca ochrony. Zdejmujemy te nazwiska z listy. <span class="gloss">No. These people are specially protected. In a collective redundancy we can at most change their terms — and if pay falls, they get a compensatory allowance until the protection ends. We’re taking those names off the list.</span>', tag: has('protected') ? 'PL · HR notes' : 'PL · no evidence', disabled: !has('protected') },
      { text: 'Przy zwolnieniu grupowym szczególna ochrona nie obowiązuje. <span class="gloss">Special protection doesn’t apply in a collective redundancy.</span>', tag: 'PL' },
      { text: 'Tym zajmie się dział kadr. <span class="gloss">HR will deal with that.</span>', tag: 'PL' },
    ]);
    if (r2 === 0) { cred++; sc.shot('bober'); K.bober.expr = 'neutral'; await say('bober', 'Dobrze. To zapiszcie. <span class="gloss">Good. Then write it down.</span>'); }
    else if (r2 === 1) { cred--; sc.shot('bober'); K.bober.expr = 'amused'; await say('bober', 'To proszę przeczytać artykuł piąty ustawy. Ja przeczytałem. <span class="gloss">Then please read article five of the Act. I have.</span>'); }
    else { sc.shot('bober'); await say('bober', 'Kadry ułożyły tę listę. <span class="gloss">HR drew up this list.</span>'); }
    // ---- round 3: what do you offer?
    sc.shot('mazur'); K.mazur.expr = 'cold';
    await say('mazur', 'Osiemdziesiąt osób. Co proponujecie, żeby było ich mniej? Od tego są konsultacje. <span class="gloss">Eighty people. What do you propose to make it fewer? That’s what consultation is for.</span>');
    sc.shot('wide', 1.4);
    const r3 = await choose([
      { text: 'Dwadzieścia dwa miejsca w nowym gnieździe E-drive od lipca — najpierw przeniesienia i szkolenia dla ludzi z Hali 2. To zmniejsza liczbę do pięćdziesięciu ośmiu. Do tego program dobrowolnych odejść: odprawa ustawowa plus jedna pensja. <span class="gloss">Twenty-two jobs in the new E-drive cell from July — transfers and training for Hall 2 people first. That brings the number down to fifty-eight. Plus a voluntary departure programme: statutory severance plus one month’s pay.</span>', tag: has('newcell') ? 'PL · plan §3' : 'PL · no evidence', disabled: !has('newcell') },
      { text: 'Odprawy ustawowe. Nic więcej. <span class="gloss">Statutory severance. Nothing more.</span>', tag: 'PL' },
      { text: 'Możemy rozłożyć zwolnienia na transze po dwadzieścia osób — wtedy ustawa w ogóle nie ma zastosowania. <span class="gloss">We could spread the exits into tranches of twenty — then the Act doesn’t apply at all.</span>', tag: 'PL' },
    ]);
    if (r3 === 0) { cred += 2; sc.shot('mazur'); K.mazur.expr = 'neutral'; await say('mazur', 'Pięćdziesiąt osiem to nie osiemdziesiąt. | Szkolenia opłaca firma? <span class="gloss">Fifty-eight isn’t eighty. Does the company pay for the training?</span>'); sc.shot('wrobel'); K.wrobel.expr = 'neutral'; await say('wrobel', 'Tak. <span class="gloss">Yes.</span>', { role: 'CEO · Silform' }); }
    else if (r3 === 1) { sc.shot('mazur'); await say('mazur', 'Czyli nic. <span class="gloss">So: nothing.</span>'); }
    else { cred -= 2; sc.shot('lis'); K.lis.expr = 'angry'; await say('lis', 'Proszę tego nie protokołować. <span class="gloss">Please don’t minute that.</span>'); sc.shot('mazur'); K.mazur.expr = 'amused'; await say('mazur', 'Za późno. <span class="gloss">Too late.</span>'); }
    // ---- the proposal
    sc.shot('wide', 1.6);
    const prop = await choose([
      { text: 'Proponujemy porozumienie: kryteria na piśmie, dwadzieścia dwa przeniesienia do E-drive, program dobrowolnych odejść z dodatkową pensją, harmonogram z zawiadomieniem urzędu pracy. Podpiszmy je w ciągu dwudziestu dni. <span class="gloss">We propose an agreement: written criteria, twenty-two transfers to E-drive, a voluntary departure programme with an extra month’s pay, a timetable with notice to the labour office. Let’s sign it within twenty days.</span>', tag: 'PL' },
      { text: 'Jeśli nie będzie zgody, zarząd wyda regulamin. <span class="gloss">If there is no agreement, the board will issue regulations.</span>', tag: 'PL' },
      { text: 'Zarząd gwarantuje, że w tym roku nikt więcej nie zostanie zwolniony. <span class="gloss">The board guarantees that no one else will be dismissed this year.</span>', tag: 'PL' },
    ]);
    let outcome;
    if (prop === 0 && cred >= 2) { sc.shot('mazur'); K.mazur.expr = 'neutral'; await say('mazur', 'Dobrze. W poniedziałek siadamy do tekstu. I chcę komisję, która sprawdzi, jak stosujecie te kryteria. <span class="gloss">All right. On Monday we sit down to the text. And I want a committee that checks how you apply those criteria.</span>'); outcome = 'agreement'; }
    else if (prop === 0) { sc.shot('mazur'); K.mazur.expr = 'suspicious'; await say('mazur', 'Jeszcze wam nie ufam. Wydajcie regulamin — spotkamy się w sądzie pracy. <span class="gloss">I don’t trust you yet. Issue your regulations — we’ll meet in the labour court.</span>'); outcome = 'regulamin'; }
    else if (prop === 1) { sc.shot('mazur'); K.mazur.expr = 'angry'; await say('mazur', 'To nie są konsultacje. To jest ogłoszenie. <span class="gloss">That isn’t consultation. That’s an announcement.</span>'); outcome = 'regulamin'; }
    else { sc.shot('lis'); K.lis.expr = 'angry'; await say('lis', 'Chwileczkę. Tego zarząd nie gwarantuje — i tego nie wpiszemy do żadnego porozumienia. <span class="gloss">One moment. The board guarantees no such thing — and we will not put it in any agreement.</span>'); F.flag('c3authority', true); outcome = 'regulamin'; }
    S.ch3.cred = cred; S.ch3.union = outcome; S.stage = 'c3_director'; F.save();
    ui.dialogueClose();
    F.fx.bars(false);
    await st.director();
  };

  // ================================================================== FRIDAY — the director and his counsel
  st.director = async () => {
    setTime('16:00');
    await F.fx.fade(1, 1200);
    await F.go('void', { cut: true, holdBlack: true });
    await ui.card([{ text: 'Friday · 12 February', cls: 'c-day' }, { text: '16:00', cls: 'c-time' }], { hold: 2400, stagger: 0.5 });
    await F.go('silform_room', { mode: 'director', shot: 'wide', cut: true, fadeIn: 1400 });
    const sc = scene(), K = sc.cast;
    F.inputLocked = true;
    F.fx.bars(true);
    ui.stamp('Silform · sala nad Halą 2', '16:00', 'Tomasz Rudnicki and his counsel');
    await wait(2200);
    const dirOk = F.workOk(W3(), 'director');
    S.ch3.dirOk = dirOk;
    sc.shot('grabowski');
    if (dirOk) {
      K.grabowski.expr = 'neutral';
      await say('grabowski', 'Pani Mecenas, mój klient otrzymał dziś wypowiedzenie. Podpisane przez przewodniczącego rady nadzorczej, na podstawie uchwały rady. Sześć miesięcy. Konkretna przyczyna: zwolnienie partii L07–L09 wbrew blokadzie jakościowej. <span class="gloss">Counsel, my client received notice today. Signed by the chair of the supervisory board, on a board resolution. Six months. A concrete reason: releasing lots L07–L09 against the quality hold.</span>', { role: 'adwokat · for T. Rudnicki' });
      await say('grabowski', 'Dobrze przygotowane. | Porozmawiajmy więc o przyszłości. <span class="gloss">Well prepared. So let’s talk about the future.</span>');
    } else {
      K.grabowski.expr = 'amused';
      await say('grabowski', 'Pani Mecenas, mój klient otrzymał dziś wypowiedzenie podpisane przez Panią Prezes. Artykuł 210 kodeksu spółek handlowych. A przyczyna — „utrata zaufania” — jest niesprawdzalna. <span class="gloss">Counsel, my client received a notice signed by the President. Article 210 of the Commercial Companies Code. And the reason — “loss of trust” — cannot be verified.</span>', { role: 'adwokat · for T. Rudnicki' });
      sc.shot('lis'); K.lis.expr = 'cold';
      await wait(900);
      sc.shot('grabowski');
      await say('grabowski', 'Mój klient pójdzie do sądu pracy. Chyba że porozmawiamy. <span class="gloss">My client will go to the labour court. Unless we talk.</span>');
    }
    sc.shot('rudnicki'); K.rudnicki.expr = 'cold';
    await say('rudnicki', 'Po wypowiedzeniu idę do Odlewni Rybnik. Zwolnijcie mnie z zakazu konkurencji, a zrzeknę się wszystkich roszczeń. <span class="gloss">After my notice I’m going to Odlewnia Rybnik. Release me from the non-compete and I’ll waive all my claims.</span>', { role: 'Operations Director · Silform' });
    sc.shot('wrobel'); K.wrobel.expr = 'pressure';
    await say('wrobel', 'Rybnik robi dokładnie to, co my. On zna nasz proces E-drive. <span class="gloss">Rybnik does exactly what we do. He knows our E-drive process.</span>', { role: 'your client · quietly' });
    sc.shot('wide', 1.4);
    const nc = await choose([
      { text: 'Zakaz konkurencji zostaje. Silform zapłaci odszkodowanie — dwadzieścia pięć procent przez dwanaście miesięcy. Na okres wypowiedzenia proponujemy zwolnienie z obowiązku świadczenia pracy, z zachowaniem wynagrodzenia. <span class="gloss">The non-compete stays. Silform will pay the compensation — twenty-five per cent for twelve months. For the notice period we propose releasing him from work, on full pay.</span>', tag: has('noncompete') ? 'PL · non-compete' : 'PL · no evidence', disabled: !has('noncompete') },
      { text: 'Zgoda — zwalniamy z zakazu w zamian za zrzeczenie się roszczeń. <span class="gloss">Agreed — we release the non-compete in exchange for a waiver of claims.</span>', tag: 'PL' },
      { text: 'Zakaz konkurencji jest nieważny — był członkiem zarządu, nie pracownikiem. <span class="gloss">The non-compete is void — he was a board member, not an employee.</span>', tag: 'PL' },
    ]);
    let dir;
    if (nc === 0) {
      F.flag('c3nc', true);
      sc.shot('grabowski');
      if (dirOk) { K.grabowski.expr = 'neutral'; await say('grabowski', 'Rozumiem. Mój klient przyjmuje to do wiadomości. <span class="gloss">Understood. My client takes note.</span>'); dir = 'clean'; }
      else { K.grabowski.expr = 'amused'; await say('grabowski', 'Zakaz — proszę bardzo. Ale wypowiedzenie i tak nie przetrwa w sądzie. Trzy dodatkowe pensje i mój klient nie składa odwołania. <span class="gloss">The non-compete — fine. But the notice won’t survive in court anyway. Three extra months’ pay and my client won’t appeal.</span>'); dir = 'costly'; }
    } else if (nc === 1) {
      sc.shot('wrobel'); K.wrobel.expr = 'disappointed';
      await narr('Wróbel says nothing. In August, Silform’s E-drive process will walk across the road to Rybnik — and you gave it away for a waiver of claims a clean termination would have made worthless.');
      dir = 'released';
    } else {
      sc.shot('grabowski'); K.grabowski.expr = 'amused';
      await say('grabowski', 'Miał umowę o pracę, Panie Mecenasie. Kodeks pracy stosuje się do niej w całości. <span class="gloss">He had an employment contract, counsel. The Labour Code applies to it in full.</span>');
      dir = 'costly';
    }
    S.ch3.dir = dir; S.stage = 'c3_done'; F.save();
    ui.dialogueClose();
    F.fx.bars(false);
    await st.resolution();
  };

  st.resolution = async () => {
    const sc = scene(), K = sc.cast;
    setTime('17:20');
    await F.fx.fade(1, 900);
    sc.cut('hall');
    await wait(300);
    await F.fx.fade(0, 1400);
    ui.stamp('Silform · Hala 2', '17:20', 'The second shift clocks in');
    const good = S.ch3.union === 'agreement' && S.ch3.dir === 'clean';
    sc.shot('lis'); K.lis.expr = good ? 'impressed' : S.ch3.union === 'agreement' ? 'neutral' : 'cold';
    if (good) await say('lis', 'Fifty-eight people instead of eighty, a signed agreement, and a director who leaves on our terms. | That is what employment law looks like when it is done properly.');
    else if (S.ch3.union === 'agreement') await say('lis', 'The unions will sign. The director will cost us. One of those was avoidable.');
    else if (F.flag('c3authority')) await say('lis', 'Never promise what the client hasn’t authorised. In a union room, a promise is minuted before you finish the sentence.');
    else await say('lis', 'Regulations instead of an agreement. It is legal. It is also how a restructuring becomes forty lawsuits.');
    ui.dialogueClose();
    await st.chapterEnd();
  };

  // ================================================================== CHAPTER END
  st.chapterEnd = async () => {
    await F.fx.fade(1, 1800);
    await F.go('void', { cut: true, holdBlack: true });
    F.audio.mix({ city: 0.15, pad: 0.45 }, 3);
    const u = S.ch3.union || 'regulamin', d = S.ch3.dir || 'costly';
    F.audio.chord(u === 'agreement' && d === 'clean' ? 'resolve' : 'night');
    const m = F.scoreWork(W3());
    const ev = Object.keys(F.EVIDENCE).filter((k) => F.EVIDENCE[k].ch === 3 && S.findings[k]).length;
    const total = Object.keys(F.EVIDENCE).filter((k) => F.EVIDENCE[k].ch === 3).length;
    const epiU = {
      agreement: 'The agreement is signed on the nineteenth day. Twenty-two people start training for the E-drive cell in May; thirty-one take the voluntary programme; twenty-seven receive notice after the thirty-day period. Two appeal to the labour court. Both lose.',
      regulamin: 'The board issues regulations. Fifty-eight notices go out in April. Thirty-four appeals reach the Regional Court in Gliwice; the criteria have to be defended one name at a time. Mazur is re-elected unopposed.',
    }[u];
    const epiD = { clean: 'Tomasz Rudnicki leaves in August on full pay, bound by the non-compete. Odlewnia Rybnik hires him in 2028 — for its aluminium wheels business.', costly: 'Rudnicki’s termination is settled for three extra months’ pay. The supervisory board asks why.', released: 'Rudnicki joins Odlewnia Rybnik in August. In October, Rybnik quotes the E-drive housing at nine per cent below Silform.' }[d];
    const notes = F.curriculum.chapterThreeNotes(S);
    F.curriculum.record(3, notes);
    const p = ui.panel('chapter-end', `
      <div class="ce-inner">
        <div class="c-chapter">Chapter III · Complete</div>
        <div class="c-chapname">Eighty Positions</div>
        <div class="ce-rule"></div>
        <div class="ce-epi">${epiU} ${epiD}</div>
        <div class="ce-file">
          <div><span>Consultation</span><b>${u === 'agreement' ? 'Agreement with both unions' : 'Regulations — no agreement'}</b></div>
          <div><span>The director</span><b>${{ clean: 'Clean exit, non-compete kept', costly: 'Defective notice — settled', released: 'Released to a competitor' }[d]}</b></div>
          <div><span>Opinion</span><b>${m.right} of ${m.total} right · ${m.cited} cited to the right document</b></div>
          <div><span>Evidence</span><b>${ev} of ${total} passages found</b></div>
        </div>
        <button class="ce-btn ce-notes-btn">Practice notes</button>
      </div>
      <div class="ce-notes">
        <div class="c-chapter">Practice notes · Chapter III</div>
        <div class="ce-list">${notes.map((n) => `<div class="ce-note ${n.ok ? 'ok' : 'miss'}"><i>${n.ok ? '✓' : '○'}</i><div><b>${n.t}</b><span class="ce-track">${(F.curriculum.TRACKS[n.track] || {}).name || ''} · Tier ${(F.curriculum.TRACKS[n.track] || {}).tier || ''}</span><p>${n.d}</p></div></div>`).join('')}</div>
        <div class="c-chapter ce-sub">Poland ↔ Germany · the same problem next door</div>
        <div class="ce-compare">${F.curriculum.compareThree.map((r) => `<div><b>${r[0]}</b><span>${r[1]}</span><span>${r[2]}</span></div>`).join('')}</div>
        <div class="c-chapter ce-sub">Career path</div>
        <div class="ce-stages">${F.curriculum.STAGES.map((s, i) => `<div class="${i <= 1 ? 'done' : i === 2 ? 'now' : ''}"><em>${i + 1}</em>${s}</div>`).join('')}</div>
        <div class="ce-next"><i>Next</i> Chapter IV · <b>Oder Crossing</b> · Szczecin ↔ Berlin</div>
        <div class="ce-tease">A dispatcher from Szczecin is dismissed by email by a Berlin logistics company. This time you act for the employee — in a German labour court, in German.</div>
        <button class="ce-btn ce-next-btn">Continue to Chapter IV</button> <button class="ce-btn ce-title-btn">Return to title</button>
      </div>`);
    await F.fx.fade(0, 1600);
    p.node.querySelector('.ce-notes-btn').addEventListener('pointerdown', (e) => { e.stopPropagation(); F.audio.paper(); p.node.classList.add('show-notes'); });
    p.node.querySelector('.ce-next-btn').addEventListener('pointerdown', (e) => { e.stopPropagation(); p.close(); F.story4.start(); });
    p.node.querySelector('.ce-title-btn').addEventListener('pointerdown', (e) => { e.stopPropagation(); location.href = location.pathname; });
  };
})(window.F);
