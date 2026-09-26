/* THE FIRM — Chapter II: The Line Stops. Gliwice ↔ Stuttgart. */
(function (F) {
  'use strict';
  const U = F.U;
  const S = F.state;
  const ui = F.ui;
  const C = F.people.cast;
  const st = {};
  F.story2 = st;

  const say = (id, text, o) => ui.say(C[id] ? C[id].name.replace(/^Dr\. /, '') : id, text, Object.assign({ speaker: id }, o || {}));
  const narr = (text) => ui.say('', text);
  const choose = (opts, o) => ui.choose(opts, o);
  const wait = F.wait;
  const setTime = (t) => { S.time = t; F.save(); };
  const scene = () => F.scene;
  const ch2 = () => S.chapter === 2;
  const has = (k) => !!S.findings[k];

  // ================================================================== START
  st.start = async () => {
    Object.assign(S, { chapter: 2, stage: 'c2_call', time: '06:50', ch2: { memo: {} } });
    ['cisg', 'fca', 'cap', 'forumB', 'forumS', 'qsv', 'ppap', 'ecn', 'warning', 'riskAccept', 'rootcause', 'notice', 'claim', 'concentration'].forEach((k) => delete S.findings[k]);
    ['c2wrobel', 'c2wendt', 'c2hartmann', 'c2cfo', 'c2wendt2'].forEach((k) => delete S.readMail[k]);
    delete S.flags.memoSent;
    F.save();
    F.inputLocked = true;
    await F.go('void', { cut: true, holdBlack: true });
    F.audio.mix({ city: 0.18, hvac: 0.12 }, 3);
    F.audio.chord('night');
    await wait(1600);
    await ui.card([{ text: 'Chapter II', cls: 'c-chapter' }, { text: 'The Line Stops', cls: 'c-chapname' }], { hold: 3200, stagger: 0.7 });
    await wait(500);
    await ui.card([{ text: 'Gliwice', cls: 'c-city' }, { text: '06:50', cls: 'c-time' }, { text: 'Tuesday · 12 January 2027', cls: 'c-day' }], { hold: 3200, stagger: 0.55 });
    await F.go('city_wide', { cut: true, fadeIn: 2200, snow: true });
    F.camTween({ x: F.VW / 2 + 120, y: F.VH / 2 - 10, z: 1.1 }, 8, U.easeInOut);
    await wait(6200, true);
    st.office(true);
  };

  st.resume = () => {
    if (S.stage === 'c2_travel') return st.flight();
    return st.office(false);
  };

  // ================================================================== OFFICE — WINTER MORNING
  st.office = async (arrive) => {
    S.stage = 'c2_call'; setTime('06:52');
    await F.go('office', { mode: 'winter', arrive, fadeOut: 900, fadeIn: 1200 });
    S.unread = F.unread();
    if (arrive) {
      ui.stamp('9th floor · Commercial / PL–DE desk', '06:52', 'Three months later');
      await scene().arrive('Agnieszka Wróbel · Silform', 'Calling…');
    }
    if (!F.flag('c2call')) await st.clientCall();
    ui.objective('Read the matter file. Answer the five questions — by noon.');
    F.inputLocked = false;
  };

  st.clientCall = async () => {
    F.flag('c2call', true);
    const sc = scene();
    F.inputLocked = true;
    await ui.incomingCall('Agnieszka Wróbel', 'Silform sp. z o.o. · Gliwice');
    sc.phoneText = null;
    F.fx.bars(true);
    F.camTween({ x: 900, y: 430, z: 1.4 }, 14, U.easeInOut);
    await say('wrobel', 'Dzień dobry, przepraszam, że tak wcześnie. <span class="gloss">Good morning — sorry it’s so early.</span>', { role: 'CEO · Silform · on the phone' });
    await say('wrobel', 'Stuttgart stopped their line on Wednesday. They say our housings cracked. Their lawyers want eighteen point four million euros by Friday.');
    await say('wrobel', 'Eighteen million. Our whole year is thirty. | What do I do?');
    const c = await choose([
      { text: 'First, nobody at Silform writes to Stuttgart or admits anything. Send me everything: the contract, the quality agreement, the change notices, every email with their engineers.' },
      { text: 'Don’t worry. They can’t sue you in Germany anyway.' },
      { text: 'Offer them something now — it will calm them down.' },
    ]);
    S.ch2.call = c;
    if (c === 0) { F.trust('wrobel', 1); await say('wrobel', 'Dobrze. Everything is on our shared drive — the lab has X-rays from the weekend. And our CFO wants you to read his note before anything else.'); }
    else if (c === 1) { await say('wrobel', 'You’re sure?'); await narr('You aren’t. Not yet. An early reassurance is the most expensive sentence a lawyer can say.'); await say('wrobel', 'I’ll put everything on the shared drive.'); }
    else { await say('wrobel', 'Offer what? We don’t even know what happened.'); await narr('She is right. Money offered before the facts are known is money given away — and it can read like an admission.'); await say('wrobel', 'I’ll send you the documents.'); }
    ui.dialogueClose();
    F.fx.bars(false);
    await F.camTween({ x: F.VW / 2, y: F.VH / 2, z: 1 }, 1.4);
    await wait(500);
    ui.toast('Dr. Helena Wendt', 'Silform — five questions by noon');
    await wait(1800);
    ui.toast('Dr. Jan Hartmann', 'Besprechung heute, 18:30 Uhr');
  };

  // ------------------------------------------------------------------ office interactions (Chapter II)
  F.on('office:phone', async () => {
    if (!ch2()) return;
    await ui.phone.open('Agnieszka Wróbel', 'Silform · CEO', [{ text: 'Wszystko jest na dysku. Hala 2 stoi, ludzie pytają.', time: '07:20' }, { text: '(Everything is on the drive. Hall 2 is idle, people are asking.)', time: '07:20' }], S.time);
  });
  F.on('office:file', () => { if (ch2()) F.openComputer('docs'); });
  F.on('office:stairs', async () => { if (!ch2()) return; await narr('Floor 10 is dark. Dr. Wendt is in Munich until two.'); ui.dialogueClose(); });
  F.on('office:coffee', () => { if (!ch2()) return; narr('Coffee, and snow on the window ledge. The radio tower has disappeared into the white.').then(() => ui.dialogueClose()); });
  F.on('office:window', async () => {
    if (!ch2()) return;
    F.inputLocked = true;
    await F.camTween({ x: 900, y: 420, z: 1.45 }, 1.4);
    await narr('Gliwice under snow. Somewhere past the headframes, Silform’s second shift is standing around a stopped die-casting cell, waiting for a lawyer in Stuttgart.');
    ui.dialogueClose();
    await F.camTween({ x: F.VW / 2, y: F.VH / 2, z: 1 }, 1.2);
    F.inputLocked = false;
  });
  F.on('office:jonas', async () => {
    if (!ch2()) return;
    const sc = scene();
    F.inputLocked = true;
    F.camTween({ x: 1030, y: 400, z: 2.4 }, 1.6);
    for (let i = 0; i <= 20; i++) { sc.jonasTurn = U.lerp(0.75, -0.35, U.easeInOut(i / 20)); await wait(30); }
    if (!F.flag('c2jonas')) {
      F.flag('c2jonas', true);
      await say('jonas', 'Stuttgart. Automotive. Bring gloves and read the QSV before you believe anything about notice periods.', { role: 'Associate' });
      await say('jonas', 'Everyone’s first instinct is “they complained too late”. In automotive that’s almost never true. The quality agreement rewrites the inspection duty.');
      const c = await choose([{ text: 'And the governing law? It says “deutsches Recht”.' }, { text: 'Thanks. Anything else?' }]);
      if (c === 0) await say('jonas', 'Then ask yourself whether German law includes a UN convention. | Spoiler: it does, unless someone switched it off.');
      else await say('jonas', 'Hartmann. He speaks slowly on purpose. Don’t fill his silences.');
    } else await say('jonas', 'QSV. Then the ECN. Then the emails. In that order.');
    ui.dialogueClose();
    await F.camTween({ x: F.VW / 2, y: F.VH / 2, z: 1 }, 1.3);
    for (let i = 0; i <= 15; i++) { sc.jonasTurn = U.lerp(-0.35, 0.75, U.easeInOut(i / 15)); await wait(30); }
    F.inputLocked = false;
  });
  F.on('memo:sent', () => { if (ch2()) st.afterMemo(); });

  st.afterMemo = async () => {
    if (S.stage !== 'c2_call') return;
    S.stage = 'c2_travel'; setTime('12:31'); F.save();
    F.inputLocked = true;
    await wait(1200);
    ui.toast('Dr. Helena Wendt', 'RE: Stellungnahme');
    await wait(2600);
    await narr('Her answer is short. It usually is. 15:10 from Katowice — and tonight, you present in German.');
    ui.dialogueClose();
    st.flight();
  };

  // ================================================================== FLIGHT — Wendt's debrief
  st.flight = async () => {
    F.inputLocked = true;
    setTime('15:10');
    await F.go('flight', { fadeOut: 1200, fadeIn: 1400 });
    ui.stamp('Katowice → Stuttgart', '15:10', 'Dr. Wendt, one row back');
    F.audio.plane();
    await wait(1800);
    const s = F.scoreMemo();
    await say('wendt', 'Your Stellungnahme. Let’s go through it before Hartmann does.', { role: 'Senior Partner · in flight' });
    if (!s.missed.length) {
      await say('wendt', 'Nothing to correct. So let me tell you what he will try instead: the notice point first, to see if you bite. Then the cap — he’ll call it an AGB and wave § 307 at you.');
    } else {
      for (const Q of s.missed) {
        const right = Q.opts.find((o) => o.ok);
        await say('wendt', `${Q.q.replace(/^\d · /, '')} — ${right.why}`);
      }
    }
    await say('wendt', 'One more thing. Hartmann will open in German to see if you flinch. | Don’t flinch. Short sentences. The document, the article, the consequence.');
    ui.dialogueClose();
    await wait(4200, true);
    await F.go('void', { fadeOut: 1400, holdBlack: true });
    setTime('18:40');
    F.audio.mix({ city: 0.25, hvac: 0.15 }, 2);
    await ui.card([{ text: 'Stuttgart', cls: 'c-city' }, { text: '18:40', cls: 'c-time' }, { text: 'Tuesday · 12 January 2027', cls: 'c-day' }], { hold: 3200, stagger: 0.55 });
    await F.go('stuttgart_wide', { cut: true, fadeIn: 2000 });
    await wait(7000, true);
    st.meeting();
  };

  // ================================================================== STUTTGART-FEUERBACH — THE MEETING
  st.meeting = async () => {
    await F.go('vk_room', { fadeOut: 1200, fadeIn: 1400, shot: 'hall' });
    const sc = scene();
    const K = sc.cast;
    F.inputLocked = true;
    F.fx.bars(true);
    ui.stamp('Vogt & Keller · Stuttgart-Feuerbach · Werk 1', '18:32', 'Line 3 has been down for six days');
    await wait(2600);
    sc.shot('wide', 3);
    await wait(2200);
    sc.shot('hartmann');
    await say('hartmann', 'Frau Kollegin Dr. Wendt, danke, dass Sie so kurzfristig kommen konnten. <span class="gloss">Dr. Wendt, thank you for coming at such short notice.</span>', { role: 'Counsel for Vogt & Keller' });
    sc.shot('wendt');
    await say('wendt', 'Herr Dr. Hartmann. Unser Associate trägt unsere Position vor – auf Deutsch. <span class="gloss">Our associate will present our position — in German.</span>', { role: 'Senior Partner' });
    sc.shot('hartmann');
    K.hartmann.expr = 'amused';
    await say('hartmann', 'Gut. Dann machen wir es kurz. Ihre Mandantin hat mangelhafte Teile geliefert, die Linie steht seit sechs Tagen still, der Schaden beträgt 18,4 Millionen Euro. | Zahlen Sie bis Freitag – oder wir klagen in Stuttgart. <span class="gloss">Your client delivered defective parts, the line has been down for six days, the damage is €18.4m. Pay by Friday — or we sue in Stuttgart.</span>');
    K.hartmann.expr = 'cold';
    sc.shot('lehmann');
    await say('lehmann', 'Jeder Tag kostet uns fast zwei Millionen. <span class="gloss">Every day costs us almost two million.</span>', { role: 'Head of Purchasing · Vogt & Keller' });
    let cred = 0;
    const used = {};
    // ---- round 1: the forum
    sc.shot('wide', 1.6);
    const r1 = await choose([
      { text: 'Herr Dr. Hartmann, eine Klage in Stuttgart wäre unzulässig: Es gibt keine wirksame Gerichtsstandsvereinbarung, und nach der Brüssel-Ia-Verordnung liegen der Sitz unserer Mandantin und der Lieferort – FCA Gliwice – in Polen. <span class="gloss">A claim in Stuttgart would be inadmissible: there is no valid choice of court, and under Brussels I bis both our client’s seat and the place of delivery — FCA Gliwice — are in Poland.</span>', tag: has('fca') ? 'DE · framework §4' : 'DE · no evidence', disabled: !has('fca') },
      { text: 'Ihre Einkaufsbedingungen gelten nicht. <span class="gloss">Your purchase terms don’t apply.</span>', tag: 'DE' },
      { text: 'Wir sind bereit, vor dem Landgericht Stuttgart zu verhandeln. <span class="gloss">We are prepared to litigate before the Regional Court of Stuttgart.</span>', tag: 'DE' },
    ]);
    sc.shot('hartmann');
    if (r1 === 0) { cred++; used.forum = true; K.hartmann.expr = 'suspicious'; await say('hartmann', 'Darüber ließe sich streiten. | Aber ich habe verstanden. <span class="gloss">That could be argued. But I understand.</span>'); }
    else if (r1 === 1) { K.hartmann.expr = 'amused'; await say('hartmann', 'Und Ihre auch nicht. Weiter. <span class="gloss">And neither do yours. Next.</span>'); }
    else { cred--; K.hartmann.expr = 'amused'; sc.shot('wendt'); K.wendt.expr = 'cold'; await narr('Wendt doesn’t move. She doesn’t have to. You just gave away the forum — the one question on which Stuttgart had nothing.'); }
    // ---- rounds 2 & 3: the merits
    const pool = () => [
      { k: 'ecn', need: has('ecn') && has('warning'), tag: 'ECN-0417 · email 3 Nov',
        text: 'Die Risse gehen auf Ihre eigene Änderung ECN-0417 zurück. Ihre Mandantin hat auf eine neue Bemusterung verzichtet – trotz unserer schriftlichen Warnung vom 3. November. <span class="gloss">The cracks go back to your own change ECN-0417. Your client waived re-sampling — despite our written warning of 3 November.</span>' },
      { k: 'cap', need: has('cap'), tag: 'framework §12',
        text: 'Selbst wenn Ihre Mandantin recht hätte: § 12 des Rahmenliefervertrags begrenzt die Haftung auf zwei Millionen Euro pro Vertragsjahr. <span class="gloss">Even if your client were right: §12 of the framework agreement caps liability at two million euros per contract year.</span>' },
      { k: 'penalty', need: has('claim'), tag: 'claim letter',
        text: 'Die Vertragsstrafe gegenüber Ihrem OEM war für unsere Mandantin bei Vertragsschluss nicht vorhersehbar. <span class="gloss">The penalty owed to your OEM was not foreseeable for our client when the contract was made.</span>' },
      { k: 'notice', need: true, tag: 'the obvious one',
        text: 'Ihre Mängelrüge kam zu spät – sieben Wochen nach der Lieferung. <span class="gloss">Your notice of defects came too late — seven weeks after delivery.</span>' },
    ].filter((a) => !used[a.k]);
    for (let round = 0; round < 2; round++) {
      sc.shot('wide', 1.4);
      const opts = pool();
      const pick = await choose(opts.map((a) => ({ text: a.text, tag: 'DE · ' + (a.need ? a.tag : 'no evidence'), disabled: !a.need })));
      const a = opts[pick]; used[a.k] = true;
      if (a.k === 'ecn') {
        cred++;
        sc.shot('lehmann'); K.lehmann.expr = 'pressure';
        await say('lehmann', 'Die Freigabe galt für die ersten fünftausend Stück. <span class="gloss">The release covered the first five thousand units.</span>');
        if (has('rootcause')) {
          cred++;
          sc.shot('wendt'); K.wendt.expr = 'cold';
          await say('wendt', 'Und die Röntgenbilder zeigen Porosität ausschließlich an Rippe B – genau dort, wo Sie die Wand auf 2,2 Millimeter reduziert haben. <span class="gloss">And the X-rays show porosity only at rib B — exactly where you reduced the wall to 2.2 millimetres.</span>');
        }
      } else if (a.k === 'cap') {
        cred++;
        sc.shot('hartmann'); K.hartmann.expr = 'cold';
        await say('hartmann', 'Wenn es sich um AGB handelt, hält die Klausel einer Prüfung nach § 307 BGB womöglich nicht stand. <span class="gloss">If it is a standard term, the clause may not survive review under §307 BGB.</span>');
        sc.shot('wendt');
        await say('wendt', 'Das müssten Sie erst einmal darlegen. Und grobe Fahrlässigkeit sehe ich hier nicht. <span class="gloss">You would have to show that first. And I see no gross negligence here.</span>');
      } else if (a.k === 'penalty') {
        sc.shot('hartmann'); K.hartmann.expr = 'amused';
        await say('hartmann', 'Im Automobilbereich? Vertragsstrafen in der Lieferkette sind dort branchenüblich. <span class="gloss">In automotive? Penalties along the supply chain are standard in the industry.</span>');
        await narr('Arguable — but weak in this industry. Foreseeability (art. 74 CISG) is a lever for the negotiation, not a wall.');
      } else {
        cred--;
        sc.shot('hartmann'); K.hartmann.expr = 'amused';
        await say('hartmann', 'Lesen Sie § 5 der QSV. Die Wareneingangsprüfung ist beschränkt. Gerügt haben wir zwei Tage nach der Entdeckung. <span class="gloss">Read §5 of the QSV. Incoming inspection is limited. We gave notice two days after discovery.</span>');
        sc.shot('wendt'); K.wendt.expr = 'disappointed';
        await wait(900);
      }
    }
    // ---- the client, quietly
    sc.shot('wrobel');
    K.wrobel.expr = 'pressure';
    await say('wrobel', 'Nie możemy ich stracić. To czterdzieści jeden procent naszej sprzedaży. Sto czterdzieści osób. <span class="gloss">We can’t lose them. They are forty-one per cent of our sales. A hundred and forty people.</span>', { role: 'your client · quietly, in Polish' });
    // ---- the proposal
    sc.shot('wide', 1.6);
    const prop = await choose([
      { text: 'Wir schlagen vor: Ein unabhängiger Sachverständiger klärt die Ursache. Unsere Mandantin übernimmt ab morgen die Sortierung auf eigene Kosten. Über den Schaden verhandeln wir im Rahmen der vertraglichen Haftungsgrenze – und die Lieferbeziehung läuft weiter. <span class="gloss">We propose: an independent expert establishes the cause. From tomorrow our client sorts at its own cost. We negotiate the damage within the contractual cap — and supply continues.</span>', tag: 'DE' },
      { text: 'Wir lehnen jede Haftung ab. Wenn Sie klagen wollen, dann in Gliwice. <span class="gloss">We reject all liability. If you want to sue, do it in Gliwice.</span>', tag: 'DE' },
      { text: 'Unsere Mandantin zahlt, was Sie fordern – bitte kündigen Sie den Vertrag nicht. <span class="gloss">Our client will pay what you demand — please don’t terminate the contract.</span>', tag: 'DE' },
    ]);
    let outcome;
    if (prop === 0) {
      sc.shot('hartmann'); K.hartmann.expr = 'neutral';
      await wait(900);
      await say('hartmann', 'Einen Moment, bitte. <span class="gloss">One moment, please.</span>');
      sc.shot('lehmann'); K.lehmann.expr = cred >= 2 ? 'neutral' : 'impatient';
      if (cred >= 2) { await say('lehmann', 'Einverstanden – wenn ab Montag wieder geprüfte Teile laufen. <span class="gloss">Agreed — if checked parts are running again from Monday.</span>'); outcome = 'settled'; }
      else { await say('lehmann', 'Sachverständiger ja. Aber unter fünf Millionen reden wir nicht. <span class="gloss">An expert, yes. But we won’t talk below five million.</span>'); outcome = 'settledHigh'; }
    } else if (prop === 1) {
      sc.shot('lehmann'); K.lehmann.expr = 'angry';
      await say('lehmann', 'Dann reden wir ab morgen mit Mexiko. <span class="gloss">Then from tomorrow we talk to Mexico.</span>');
      outcome = 'war';
    } else {
      sc.shot('wendt'); K.wendt.expr = 'angry';
      await say('wendt', 'Moment. | Das hat unser Associate nicht zu entscheiden – und ohne Weisung unserer Mandantin schon gar nicht. <span class="gloss">One moment. That is not for our associate to decide — and certainly not without instructions from our client.</span>');
      F.flag('c2authority', true);
      outcome = 'settledHigh';
    }
    S.ch2.cred = cred; S.ch2.outcome = outcome; F.save();
    ui.dialogueClose();
    F.fx.bars(false);
    await st.resolution(outcome);
  };

  st.resolution = async (outcome) => {
    const sc = scene();
    const K = sc.cast;
    setTime('21:14');
    await F.fx.fade(1, 900);
    sc.cut('hall');
    await wait(300);
    await F.fx.fade(0, 1400);
    ui.stamp('Stuttgart-Feuerbach', '21:14', 'The line is still down. For now.');
    if (outcome === 'settled') {
      sc.shot('wendt'); K.wendt.expr = 'impressed';
      await say('wendt', 'You presented in German, you cited the documents, and you remembered who the client is. | Most associates need three years for that.');
      sc.shot('wrobel'); K.wrobel.expr = 'smile';
      await say('wrobel', 'Dziękuję. Naprawdę. <span class="gloss">Thank you. Really.</span>');
    } else if (outcome === 'settledHigh') {
      sc.shot('wendt'); K.wendt.expr = F.flag('c2authority') ? 'cold' : 'neutral';
      if (F.flag('c2authority')) await say('wendt', 'Never commit the client’s money without instructions. Not a euro. Not in any language.');
      else await say('wendt', 'We kept the customer. We paid for every argument we didn’t make.');
    } else {
      sc.shot('wendt'); K.wendt.expr = 'disappointed';
      await say('wendt', 'You may well win that case in Gliwice in two years. | By then there will be no second shift to go back to.');
    }
    ui.dialogueClose();
    await st.chapterEnd(outcome);
  };

  // ================================================================== CHAPTER END
  st.chapterEnd = async (outcome) => {
    await F.fx.fade(1, 1800);
    await F.go('void', { cut: true, holdBlack: true });
    F.audio.mix({ city: 0.15, pad: 0.45 }, 3);
    F.audio.chord(outcome === 'settled' ? 'resolve' : 'night');
    const m = F.scoreMemo();
    const ev = Object.keys(F.EVIDENCE).filter((k) => F.EVIDENCE[k].ch === 2 && S.findings[k]).length;
    const total = Object.keys(F.EVIDENCE).filter((k) => F.EVIDENCE[k].ch === 2).length;
    const epi = {
      settled: 'The independent expert confirms the cause at rib B within three weeks. The parties settle at €1.4 million. The wall goes back to 2.6 mm, a new PPAP is run, and line 3 restarts on Monday. In March, Vogt & Keller extends the framework agreement to 2030.',
      settledHigh: 'Silform settles at €4.2 million, above the cap it never tested. Supply continues, but Vogt & Keller’s purchasing department opens a “second source” project in Querétaro.',
      war: 'Vogt & Keller terminates the framework agreement and moves VK-4471 to Mexico. In 2029 the Regional Court in Gliwice largely dismisses the claim. Silform’s second shift closed in 2027.',
    }[outcome];
    const verdict = { settled: 'Client and customer kept — exposure inside the cap', settledHigh: 'Customer kept — at a price', war: 'Argument won, customer lost' }[outcome];
    const notes = F.curriculum.chapterTwoNotes(S);
    const p = ui.panel('chapter-end', `
      <div class="ce-inner">
        <div class="c-chapter">Chapter II · Complete</div>
        <div class="c-chapname">The Line Stops</div>
        <div class="ce-rule"></div>
        <div class="ce-epi">${epi}</div>
        <div class="ce-file">
          <div><span>Outcome</span><b>${verdict}</b></div>
          <div><span>Stellungnahme</span><b>${m.right} of 5 right · ${m.cited} cited to the right document</b></div>
          <div><span>Evidence</span><b>${ev} of ${total} passages found</b></div>
          <div><span>Credibility in Stuttgart</span><b>${S.ch2.cred >= 3 ? 'Strong' : S.ch2.cred >= 1 ? 'Holding' : 'Damaged'}</b></div>
        </div>
        <button class="ce-btn ce-notes-btn">Practice notes</button>
      </div>
      <div class="ce-notes">
        <div class="c-chapter">Practice notes · Chapter II</div>
        <div class="ce-list">${notes.map((n) => `<div class="ce-note ${n.ok ? 'ok' : 'miss'}"><i>${n.ok ? '✓' : '○'}</i><div><b>${n.t}</b><span class="ce-track">${(F.curriculum.TRACKS[n.track] || {}).name || ''} · Tier ${(F.curriculum.TRACKS[n.track] || {}).tier || ''}</span><p>${n.d}</p></div></div>`).join('')}</div>
        <div class="c-chapter ce-sub">Career path</div>
        <div class="ce-stages">${F.curriculum.STAGES.map((s, i) => `<div class="${i <= 1 ? 'done' : i === 2 ? 'now' : ''}"><em>${i + 1}</em>${s}</div>`).join('')}</div>
        <div class="c-chapter ce-sub">The road ahead</div>
        <div class="ce-road">${F.curriculum.CHAPTERS.slice(2, 8).map((c) => `<div><em>${c.n}</em><b>${c.title}</b><span>${c.where}</span></div>`).join('')}<div class="more"><em>…</em><b>XIV · Your Name on the Door</b><span>Gliwice</span></div></div>
        <div class="ce-next"><i>Next</i> Chapter III · <b>Eighty Positions</b> · Gliwice, winter</div>
        <div class="ce-tease">An industrial client restructures eighty jobs and wants its operations director gone by Friday. This time you advise the employer — and then you meet the employee’s counsel.</div>
        <button class="ce-btn ce-title-btn">Return to title</button>
      </div>`);
    await F.fx.fade(0, 1600);
    p.node.querySelector('.ce-notes-btn').addEventListener('pointerdown', (e) => { e.stopPropagation(); F.audio.paper(); p.node.classList.add('show-notes'); });
    p.node.querySelector('.ce-title-btn').addEventListener('pointerdown', (e) => { e.stopPropagation(); location.href = location.pathname; });
  };
})(window.F);
