/* THE FIRM — Chapter I: The Carbo Deal. Direction, dialogue and flow. */
(function (F) {
  'use strict';
  const U = F.U;
  const S = F.state;
  const ui = F.ui;
  const story = {};
  F.story = story;

  const C = F.people.cast;
  const say = (id, text, o) => {
    const c = C[id];
    return ui.say(c ? c.name.replace(/^Dr\. /, '') : id, text, Object.assign({ speaker: id }, o || {}));
  };
  const narr = (text) => ui.say('', text);
  const choose = (opts, o) => ui.choose(opts, o);
  const wait = F.wait;
  const setTime = (t) => { S.time = t; F.save(); };
  const scene = () => F.scene;

  // ================================================================== TITLE
  story.title = () => {
    F.go('void', { cut: true, holdBlack: true });
    const hasSave = F.loadSave() && S.stage && S.stage !== 'arrive';
    const t = F.el('div', 'title-screen', `
      <div class="ts-mark"></div>
      <div class="ts-title">THE FIRM</div>
      <div class="ts-sub">Chapter I · The Carbo Deal</div>
      <div class="ts-begin">${hasSave ? 'Click to continue' : 'Click to begin'}</div>
      ${hasSave ? '<button class="ts-new">New game</button>' : ''}
      <div class="ts-note">Headphones recommended · Mouse &amp; keyboard · Tab recalls your objective</div>`);
    document.body.appendChild(t);
    let started = false;
    const begin = (fresh) => {
      if (started) return; started = true;
      F.audio.init();
      t.classList.add('out');
      setTimeout(() => t.remove(), 1500);
      if (fresh || !hasSave) { F.resetSave(); Object.assign(S, { flags: {}, trust: { wendt: 0, jonas: 0, marta: 0, steinhauer: 0 }, findings: {}, redlines: {}, links: {}, readMail: {}, readDocs: {}, stage: 'arrive', time: '07:12' }); story.opening(); }
      else story.resume();
    };
    t.addEventListener('pointerdown', (e) => { if (e.target.classList.contains('ts-new')) begin(true); else begin(false); });
  };

  story.resume = () => {
    const st = S.stage;
    if (st === 'review') return story.officeReview();
    if (st === 'evening') return story.officeEvening();
    if (st === 'wroclaw') return story.travel();
    return story.officeMorning(false);
  };

  // ================================================================== OPENING CINEMATIC
  story.opening = async () => {
    await F.go('void', { cut: true, holdBlack: true });
    F.audio.mix({ rain: 0.5, city: 0.22, rainGlass: 0.05 }, 3);
    F.audio.chord('dm');
    await wait(2200);
    await ui.card([{ text: 'Gliwice', cls: 'c-city' }, { text: '07:12', cls: 'c-time' }, { text: 'Monday · 12 October', cls: 'c-day' }], { hold: 3600, stagger: 0.55 });
    F.audio.mix({ rain: 0.45, city: 0.3, pad: 0.35 }, 3);
    await F.go('city_wide', { fadeIn: 2400, cut: true });
    F.camTween({ x: F.VW / 2 + 120, y: F.VH / 2 - 10, z: 1.1 }, 8, U.easeInOut);
    await wait(6500, true);
    await F.go('tower', { fadeOut: 900, fadeIn: 900 });
    F.audio.mix({ rain: 0.55, city: 0.4, pad: 0.4 }, 1);
    await wait(1600, true);
    F.camTween({ x: F.VW / 2, y: -1260, z: 1.0 }, 7.5, U.easeInOut);
    await wait(5600, true);
    F.audio.stinger();
    ui.card([{ text: 'THE FIRM', cls: 'c-title' }, { text: 'Chapter I · The Carbo Deal', cls: 'c-title-sub' }], { hold: 3800, stagger: 0.9, cls: 'top' });
    await wait(4800, true);
    await F.go('lobby', { fadeOut: 1100, fadeIn: 900 });
    F.audio.mix({ room: 0.3, rain: 0.12, city: 0.1, pad: 0.35 }, 1.5);
    ui.stamp('Adler Wendt · Kancelaria Prawna', 'ul. Zwycięstwa 7', 'Gliwice · Polish-German practice');
    await wait(5600, true);
    await F.go('elevator', { fadeOut: 700, fadeIn: 700, floor: 9 });
    F.audio.mix({ room: 0.15, rain: 0.2, rainGlass: 0.2, city: 0.1, pad: 0.35 }, 1);
    await wait(6400);
    F.audio.ding();
    await wait(900);
    story.officeMorning(true);
  };

  // ================================================================== OFFICE — MORNING
  story.officeMorning = async (arrive) => {
    S.stage = 'arrive'; setTime('07:19');
    await F.go('office', { mode: 'morning', arrive, fadeOut: 700, fadeIn: 1100 });
    S.unread = F.unread();
    if (arrive) {
      ui.stamp('9th floor · Commercial / M&A · PL–DE desk', '07:19', 'Your first day');
      await scene().arrive();
    } else {
      scene().buzz('Albrecht · Office Dr. Wendt', 'Partner wants you upstairs.');
    }
    ui.objective('Dr. Wendt wants you upstairs.');
  };

  // office interactions (dispatch by stage)
  F.on('office:phone', async () => {
    const sc = scene();
    if (S.stage === 'arrive') {
      await ui.phone.open('Albrecht', 'Office of Dr. Helena Wendt', [{ text: 'Guten Morgen, and welcome to Adler Wendt.', time: '07:18' }, { text: 'Partner wants you upstairs.', time: '07:19' }, { text: '23rd floor. The stairs by the window.', time: '07:19' }], '07:20');
      sc.phoneText = null;
      F.flag('readMsg', true);
      ui.objective('Take the stairs to the 23rd floor.');
    } else if (S.stage === 'review') {
      await ui.phone.open('Jonas Brenner', 'Associate', [{ text: 'VDR link is in your inbox.', time: '08:06' }, { text: 'Board minutes are in Polish. There’s a translate button. Use it.', time: '08:07' }, { text: 'Wendt wants the redline by 17:00 👀', time: '08:07' }], S.time);
    } else if (S.stage === 'evening') {
      await ui.phone.open('Marta Kowalczyk', 'Wrocław', [{ text: 'Calling you after 7. Put what you found on the board first.', time: '18:40' }], S.time);
    }
  });
  F.on('office:computer', () => F.openComputer());
  F.on('computer:closed', () => { if (scene() && scene().name === 'office') { scene().monitorText = S.stage === 'evening' ? 'doc' : 'login'; } });
  F.on('office:coffee', () => {
    const lines = ['Machine coffee. Bitter enough to count as a decision.', 'Still hot. The only thing on this floor that hasn’t been negotiated.', 'Cold now. You didn’t notice when that happened.'];
    F.audio.tone(200, 0.2, 0.02);
    narr(lines[S.stage === 'evening' ? 2 : (F.time | 0) % 2]).then(() => ui.dialogueClose());
  });
  F.on('office:window', async () => {
    F.inputLocked = true;
    await F.camTween({ x: 900, y: 420, z: 1.45 }, 1.4);
    if (S.stage === 'evening') await narr('Gliwice after dark. The radio tower’s red light, the ring road, somewhere a late bus. People are going home.');
    else await narr('Gliwice, nine floors down. The Rynek’s town-hall tower, the old wooden radio tower, pit-heads beyond — all half-swallowed by rain.');
    ui.dialogueClose();
    await F.camTween({ x: F.VW / 2, y: F.VH / 2, z: 1 }, 1.2);
    F.inputLocked = false;
  });
  F.on('office:file', async () => {
    if (S.stage === 'arrive') { await narr('A sealed folder. PROJEKT CARBO — ŚCIŚLE POUFNE · STRENG VERTRAULICH. Not yours to open. Not yet.'); ui.dialogueClose(); return; }
    const sent = await F.openRedline();
    if (sent) F.emit('redline:sent');
  });
  F.on('office:stairs', async () => {
    if (S.stage === 'arrive') {
      if (!F.flag('readMsg')) { await narr('Floor 10 is partner floor. Nobody goes up there uninvited. Your phone buzzed a moment ago.'); ui.dialogueClose(); return; }
      story.partner();
    } else { await narr(S.stage === 'evening' ? 'The partner floor is dark. Dr. Wendt left at six. Her light is still on.' : 'She said by five. Going back up empty-handed is not a plan.'); ui.dialogueClose(); }
  });
  F.on('office:jonas', () => story.jonas());
  F.on('office:jonasEve', async () => {
    F.inputLocked = true;
    await F.camTween({ x: 560, y: 420, z: 1.9 }, 1.4);
    if (!F.flag('jonasEveTalk')) {
      F.flag('jonasEveTalk', true);
      await say('jonas', 'Wendt forwarded me her reply to your redline. | That’s either very good or very bad for you.', { role: 'Associate' });
      await say('jonas', 'I pinned everything on the board in 22.3. The minutes, the lease, that registry thing. It doesn’t add up yet.');
      const c = await choose([{ text: 'Go home, Jonas.' }, { text: 'Show me.' }]);
      if (c === 0) { F.trust('jonas', 1); await say('jonas', 'Home. Right. I’ve heard of it.'); }
      else await say('jonas', 'Be my guest. Red string’s in the drawer. I’m told it’s tradition.');
    } else {
      await say('jonas', 'If you find the thread, pull it. I’ll be here pretending to proofread.');
    }
    ui.dialogueClose();
    await F.camTween({ x: F.VW / 2, y: F.VH / 2, z: 1 }, 1.2);
    F.inputLocked = false;
  });
  F.on('office:board', async () => {
    await F.openBoard();
    if (F.flag('boardSolved') && !F.flag('martaCalled')) story.martaCall();
  });

  // ------------------------------------------------------------------ Jonas (morning)
  story.jonas = async () => {
    const sc = scene();
    F.inputLocked = true;
    F.camTween({ x: 1030, y: 400, z: 2.4 }, 1.6);
    for (let i = 0; i <= 20; i++) { sc.jonasTurn = U.lerp(0.75, -0.35, U.easeInOut(i / 20)); await wait(30); }
    F.people.cast.jonas._expr = 'tired';
    if (!F.flag('metJonas')) {
      await say('jonas', 'Morning. You must be the one Wendt poached from Katowice. Wendt only hires people she can’t afford to lose to Stuttgart.', { role: 'Associate' });
      const c = await choose([{ text: '“Poached” is a strong word.' }, { text: 'Is that what she told you?' }, { text: 'And you are?' }]);
      if (c === 0) { F.trust('jonas', 1); await say('jonas', 'Strong words are the house style. You’ll get used to it.'); }
      else if (c === 1) { await say('jonas', 'She didn’t tell anyone anything. That’s how we knew it was serious.'); }
      else { F.trust('jonas', -1); await say('jonas', 'Jonas Brenner. Third year. I sort of live here now.'); }
      await say('jonas', 'Free advice: when she asks a question, she already knows the answer. | She’s checking whether *you* do.');
      await say('jonas', 'Go on up. She hates waiting more than she hates bad drafts.');
      F.flag('metJonas', true);
    } else {
      await say('jonas', 'Stairs are behind you. Don’t take the elevator to 10 — the elevator is for clients.');
    }
    ui.dialogueClose();
    await F.camTween({ x: F.VW / 2, y: F.VH / 2, z: 1 }, 1.3);
    for (let i = 0; i <= 15; i++) { sc.jonasTurn = U.lerp(-0.35, 0.75, U.easeInOut(i / 15)); await wait(30); }
    F.inputLocked = false;
  };

  // ================================================================== PARTNER OFFICE — WENDT
  story.partner = async () => {
    F.inputLocked = true;
    await F.go('partner', { fadeOut: 900, fadeIn: 1200 });
    const sc = scene();
    const W = sc.wendt;
    F.fx.bars(true);
    ui.stamp('10th floor · Partner', '07:26', 'Dr. Helena Wendt');
    sc.shot('window', 5);
    await wait(2600);
    await say('wendt', 'You took the stairs. Good. | The elevator is for clients.', { role: 'Senior Partner' });
    // she turns — cut to medium
    W.back = false; W.turn = 0.35; W.expr = 'cold';
    sc.cut('med');
    F.audio.tone(110, 0.8, 0.03);
    await say('wendt', 'Helena Wendt. You’ll have heard things about me. | Most of them are true.');
    let c = await choose([{ text: 'Only the good things.' }, { text: 'I heard you don’t lose.' }, { text: 'I came here to work, not to listen to rumours.' }]);
    if (c === 0) { W.expr = 'amused'; await say('wendt', 'Then someone has been lying to you. We’ll fix that.'); }
    else if (c === 1) { W.expr = 'cold'; F.trust('wendt', 1); await say('wendt', 'I lose all the time. I just don’t lose the things that matter.'); }
    else { W.expr = 'impressed'; F.trust('wendt', 1); await say('wendt', 'Good. Then let’s work.'); }
    W.expr = 'cold';
    sc.shot('close', 2.4);
    await say('wendt', 'Steinhauer Sportholding is buying seventy-five per cent of KS Carbo Gliwice. A football club.');
    await say('wendt', 'Polish top flight. A stadium the city owns. And a president who believes contracts are opening offers.');
    W.pose = 'gesture';
    await say('wendt', 'Signing is Wednesday, in Wrocław. Falk Steinhauer wants to hold a scarf over his head on television by Friday.');
    await say('wendt', 'The seller’s counsel sent her mark-up at two-forty this morning. Aleksandra Nowicka. | She doesn’t send anything at two-forty by accident.');
    W.pose = 'crossed';
    sc.shot('med', 1.8);
    await say('wendt', 'I want the redline by five. Every clause that moves risk onto our client. Accept, reject, flag.');
    await say('wendt', 'And read the data room. Someone has been very generous with what they left out.');
    c = await choose([{ text: 'Why me? It’s my first day.' }, { text: 'What’s the price?' }, { text: 'Understood. By five.' }]);
    if (c === 0) { W.expr = 'amused'; await say('wendt', 'Precisely. You don’t yet know what we’re supposed to ignore.'); }
    else if (c === 1) { W.expr = 'cold'; await say('wendt', 'One hundred and eighteen million złoty for the shares. | Plus whatever debt nobody has shown us yet.'); }
    else { W.expr = 'impressed'; F.trust('wendt', 1); await say('wendt', 'Good.'); }
    W.expr = 'cold';
    await say('wendt', 'Jonas will get you into the data room. Marta Kowalczyk runs our Wrocław office — she’ll call you tonight.');
    sc.shot('close', 2.2);
    W.expr = 'neutral';
    await say('wendt', 'One more thing.');
    await wait(500);
    W.expr = 'cold';
    await say('wendt', 'In this building a deal that closes badly is worse than a deal that doesn’t close. | Remember that when the client starts shouting.');
    ui.dialogueClose();
    F.fx.bars(false);
    await wait(600);
    story.officeReview(true);
  };

  // ================================================================== OFFICE — REVIEW (day)
  story.officeReview = async (fromPartner) => {
    S.stage = 'review'; setTime('08:06');
    F.flag('jonasLeft', true);
    await F.go('office', { mode: 'morning', fadeOut: fromPartner ? 1100 : 700, fadeIn: 1100 });
    S.unread = F.unread();
    scene().monitorText = 'login';
    await wait(700);
    ui.toast('Jonas Brenner', 'Carbo — VDR access + NB mark-up v7');
    await wait(400);
    scene().buzz('Jonas Brenner', 'VDR link is in your inbox.');
    scene().phoneText = null;
    ui.objective('Redline the SPA — and read the data room.');
    F.inputLocked = false;
  };

  F.on('redline:sent', () => story.timeLapse());

  story.timeLapse = async () => {
    if (S.stage !== 'review') return;
    F.inputLocked = true;
    await F.fx.fade(1, 1200);
    F.audio.mix({ room: 0.1, pad: 0.3 }, 1);
    await ui.card([{ text: 'Nine hours later', cls: 'c-city' }, { text: '18:52', cls: 'c-time' }], { hold: 2600, stagger: 0.5 });
    story.officeEvening(true);
  };

  // ================================================================== OFFICE — EVENING
  story.officeEvening = async (fresh) => {
    S.stage = 'evening'; setTime('18:52');
    await F.go('office', { mode: 'evening', cut: true, fadeIn: 1600 });
    S.unread = F.unread();
    scene().monitorText = 'doc';
    if (fresh) {
      await wait(900);
      ui.toast('Dr. Helena Wendt', 'RE: Carbo — redline');
      await wait(2200);
      ui.toast('Marta Kowalczyk', 'Wrocław — tonight');
    }
    ui.objective('Read Dr. Wendt’s reply. Then the project room — put it on the board.');
    F.inputLocked = false;
  };

  // ------------------------------------------------------------------ Marta's call
  story.martaCall = async () => {
    F.flag('martaCalled', true);
    const sc = scene();
    F.inputLocked = true;
    await wait(1200);
    sc.buzz('Marta Kowalczyk', 'Calling…');
    await ui.incomingCall('Marta Kowalczyk', 'Wrocław · mobile');
    sc.phoneText = null;
    F.fx.bars(true);
    F.camTween({ x: 900, y: 430, z: 1.5 }, 14, U.easeInOut);
    F.audio.chord('night');
    await say('marta', 'It’s Marta. Are you sitting down? | Don’t answer that.', { role: 'on the phone · Wrocław' });
    await say('marta', 'Nowicka just moved the signing. Tomorrow, ten a.m., here in Wrocław — or exclusivity ends at midnight and Zieliński starts returning calls from a fund in Düsseldorf.');
    await say('marta', 'Steinhauer is flying in tonight. He wants to sign. He says he didn’t buy a football club to read footnotes.');
    await choose([{ text: 'The president is selling the club’s TV money to a company his wife set up three weeks ago.' }]);
    await wait(700);
    await say('marta', '…Say that again. | Slowly.');
    const proof = [];
    if (S.findings.factoring) proof.push('the board minutes');
    if (S.findings.anna) proof.push('a registry extract');
    if (S.findings.spouse) proof.push('a newspaper photo');
    if (S.findings.cfo) proof.push('an email their CFO forgot to delete');
    const list = proof.length > 1 ? proof.slice(0, -1).join(', ') + ' and ' + proof[proof.length - 1] : proof[0] || 'what I have';
    await choose([{ text: `Factoring deal, approved 2 October. Odra Capital, 100% Anna Zielińska. I have ${list}.` }]);
    await say('marta', 'Then you are not explaining this over the phone.');
    await say('marta', 'There’s a car downstairs. The eight o’clock InterCity to Wrocław — Helena has already approved it. | Bring everything.');
    await say('marta', 'And — welcome to Adler Wendt.');
    ui.dialogueClose();
    F.fx.bars(false);
    await wait(600);
    ui.toast('Dr. Helena Wendt', 'Bring the board. — H.W.', '✆');
    await wait(2400);
    S.stage = 'wroclaw'; F.save();
    story.travel();
  };

  // ================================================================== TRAVEL
  story.travel = async () => {
    F.inputLocked = true;
    setTime('19:31');
    await F.go('taxi', { fadeOut: 1200, fadeIn: 1200 });
    ui.stamp('Gliwice · ul. Zwycięstwa', '19:31', 'To the station');
    await wait(6200, true);
    setTime('20:52');
    await F.go('train', { fadeOut: 1000, fadeIn: 1400 });
    ui.stamp('IC 3812 · Gliwice → Wrocław Główny', '20:02', 'Coach 7, seat 64');
    await wait(4200, true);
    await story.germanOnTrain();
    await wait(2500, true);
    await F.go('void', { fadeOut: 1400, holdBlack: true });
    setTime('22:47');
    F.audio.mix({ rain: 0.55, city: 0.3 }, 2);
    await ui.card([{ text: 'Wrocław', cls: 'c-city' }, { text: '22:47', cls: 'c-time' }, { text: 'Monday · 12 October', cls: 'c-day' }], { hold: 3400, stagger: 0.55 });
    await F.go('wroclaw_wide', { cut: true, fadeIn: 2000 });
    await wait(7200, true);
    story.negotiation();
  };

  // ------------------------------------------------------------------ Legal German: first written advice to a German in-house lawyer
  story.germanOnTrain = async () => {
    F.inputLocked = true;
    scene().name === 'train' && F.audio.buzz(2);
    await ui.phone.open('Dr. Ines Kraus', 'Syndikusrechtsanwältin · Steinhauer Sportholding GmbH, Stuttgart', [
      { text: 'Guten Abend. Herr Steinhauer ist bereits auf dem Weg nach Breslau und möchte morgen um 10 Uhr unterschreiben.', time: '20:41' },
      { text: 'Können Sie mir kurz schriftlich bestätigen, ob aus Ihrer Sicht Bedenken gegen die Unterzeichnung bestehen?', time: '20:41' },
    ], '20:42');
    await narr('Your first written advice to the client — in German. Register counts. Substance counts more.');
    const c = await choose([
      { text: 'Sehr geehrte Frau Dr. Kraus, vielen Dank für Ihre Nachricht. Aus unserer Sicht bestehen derzeit erhebliche Bedenken: Die Medienerlöse der Saisons 2027/28 bis 2029/30 wurden offenbar an eine dem Verkäufer nahestehende Gesellschaft verkauft. Wir raten dringend davon ab, den Vertrag in der jetzigen Fassung zu unterzeichnen. Einzelheiten erläutern wir heute Abend in Breslau.', tag: 'DE' },
      { text: 'Hallo Ines, alles gut – das kriegen wir morgen schon hin! LG', tag: 'DE' },
      { text: 'Sehr geehrte Frau Dr. Kraus, es bestehen keine Bedenken. Der Vertrag kann wie vorgesehen unterzeichnet werden.', tag: 'DE' },
    ]);
    S.german = S.german || {}; S.german.train = c; F.save();
    if (c === 0) {
      F.trust('steinhauer', 1);
      await ui.phone.open('Dr. Ines Kraus', 'Stuttgart', [{ text: 'Verstanden. Ich informiere Herrn Steinhauer. Danke für die klare Einschätzung.', time: '20:47' }], '20:47');
      await narr('Formal salutation with the doctorate kept — standard in German professional correspondence. A clear recommendation (“wir raten dringend davon ab”), the reason in one sentence, no promises you cannot keep.');
    } else if (c === 1) {
      F.trust('steinhauer', -1);
      await ui.phone.open('Dr. Ines Kraus', 'Stuttgart', [{ text: 'Wir kennen uns noch nicht. Ich würde beim „Sie“ bleiben. Und ich bitte um eine inhaltliche Einschätzung.', time: '20:46' }], '20:46');
      await narr('Wrong register — you don’t switch to “du” and first names with a client’s lawyer you have never met. Worse: she asked for an assessment and got none.');
    } else {
      F.flag('toldClientNoConcerns', true);
      await ui.phone.open('Dr. Ines Kraus', 'Stuttgart', [{ text: 'Danke. Dann gebe ich grünes Licht.', time: '20:45' }], '20:45');
      await narr('Formally perfect. Substantively wrong — and in writing. You have just told the client there is nothing to worry about.');
    }
    ui.dialogueClose();
  };

  // ================================================================== WROCŁAW — THE NEGOTIATION
  story.negotiation = async () => {
    await F.go('conference', { fadeOut: 1200, fadeIn: 1400, shot: 'window' });
    const sc = scene();
    const K = sc.cast;
    F.inputLocked = true;
    F.fx.bars(true);
    ui.stamp('Adler Wendt · pl. Nowy Targ 30 · 14th floor', '22:47', 'The deal is dying');
    sc.shot('wide', 4);
    await wait(3000);
    sc.shot('screen');
    await say('nowicka', 'Let me be precise, since it is late. The cap stays at five per cent. The MAC exclusion stays.', { role: 'Seller’s counsel · on screen' });
    await say('nowicka', 'Signing tomorrow at ten. Otherwise my client considers exclusivity ended at midnight.');
    sc.shot('steinhauer');
    K.steinhauer.expr = 'angry';
    await say('steinhauer', 'I’ve heard enough percentages for one lifetime. I have a stadium, a board, a television contract.', { role: 'Client' });
    await say('steinhauer', 'Unterschreiben Sie das Ding endlich. <span class="gloss">Just sign the thing.</span>');
    if (F.flag('toldClientNoConcerns')) await say('steinhauer', 'Your own message said there were no concerns. So why are we still here?');
    sc.shot('marta');
    K.marta.expr = 'neutral';
    await say('marta', 'Your move.', { role: 'Partner · Wrocław' });
    let opts = [
      { text: 'Herr Steinhauer, Sie haben keinen Fernsehvertrag – jedenfalls nicht für die nächsten drei Spielzeiten. <span class="gloss">You don’t have a TV contract — not for the next three seasons.</span>', tag: 'the board · DE' },
      { text: 'Ms. Nowicka, our client might live with a lower cap if the MAC clause goes.' },
      { text: 'Let’s take ten minutes.' },
    ];
    let c = await choose(opts);
    if (c === 2) {
      sc.shot('steinhauer'); K.steinhauer.expr = 'impatient';
      await say('steinhauer', 'No. We have taken ten minutes nine times tonight. Now.');
      c = await choose(opts.slice(0, 2));
    }
    let outcome;
    if (c === 1) {
      // the weak path
      sc.shot('screen'); K.nowicka.expr = 'amused';
      await say('nowicka', 'The MAC clause is not for sale. The cap is not for sale. | I thought we had established that.');
      sc.shot('steinhauer');
      await say('steinhauer', 'Enough. We sign at ten. Put it in whatever language you people need.');
      outcome = 'signed';
    } else {
      sc.shot('steinhauer'); K.steinhauer.expr = 'suspicious'; K.steinhauer.turn = -0.2;
      await say('steinhauer', '…What?');
      sc.shot('screen'); K.nowicka.expr = 'cold';
      await say('nowicka', 'I am not sure what my colleague is implying.');
      await choose([{ text: 'On 2 October your client’s board approved a factoring agreement: media receivables through 2030, sold at sixty-one per cent.' }]);
      await say('nowicka', 'An ordinary financing decision, taken by an independent board.');
      await choose([{ text: 'With Odra Capital. Registered on 18 September. Five thousand złoty of capital. Its only shareholder is Anna Zielińska.' }]);
      K.zielinski.expr = 'angry'; sc.static = 0.4;
      await say('zielinski', 'To jest skandal! My wife has nothing to do with—', { role: 'President · KS Carbo' });
      K.nowicka.expr = 'impatient';
      await say('nowicka', 'Tomasz. | Proszę.');
      if (S.findings.cfo) {
        await choose([{ text: 'And your CFO wrote at 03:05 that folder 7.3 was “not relevant for the purchaser”. He uploaded that email to the data room himself.' }]);
        sc.static = 1.2; F.audio.tone(80, 1.5, 0.05);
        await wait(1400);
      }
      K.nowicka.expr = 'cold';
      sc.shot('screen', 2.5);
      await wait(900);
      await say('nowicka', 'What do you want.');
      const terms = [];
      const leaseKnown = S.findings.lease || S.redlines.lease === 'reject';
      terms.push({ text: `The factoring unwound before signing, a specific indemnity, twenty million złoty in escrow${leaseKnown ? ' — and the City’s consent to the stadium lease as a condition to completion' : ''}.`, tag: leaseKnown ? 'full protection' : 'protection' });
      terms.push({ text: 'Thirty million off the price, and we sign tomorrow as drafted.' });
      terms.push({ text: 'Nothing. Our client walks away tonight.' });
      const t = await choose(terms);
      if (t === 0) {
        K.nowicka.expr = 'pressure';
        await wait(800);
        await say('nowicka', '…I will need to speak with my client. | Give us one hour.');
        sc.static = 0.8;
        sc.screenOn = 0;
        outcome = leaseKnown ? 'protected' : 'protected-lease';
      } else if (t === 1) {
        K.nowicka.expr = 'amused';
        await say('nowicka', 'Twenty. And the drafting stays as it is.');
        outcome = 'discount';
      } else {
        sc.shot('steinhauer'); K.steinhauer.expr = 'angry';
        await say('steinhauer', 'Walk away? I flew here to buy a club, not to—');
        K.steinhauer.expr = 'suspicious';
        await say('steinhauer', '…No. No, you’re right. Not like this.');
        outcome = 'walked';
      }
    }
    S.outcome = outcome; F.save();
    await story.resolution(outcome);
  };

  story.resolution = async (outcome) => {
    const sc = scene();
    const K = sc.cast;
    if (outcome === 'protected' || outcome === 'protected-lease') {
      setTime('00:41');
      await F.fx.fade(1, 900);
      sc.cut('wide');
      await wait(400);
      await F.fx.fade(0, 1400);
      ui.stamp('Adler Wendt · Wrocław', '00:41', 'One hour later — and a half');
      sc.shot('marta', 2);
      K.marta.expr = 'smile';
      await say('marta', 'They agreed. All of it. The factoring goes, the escrow stays.', { role: 'Partner · Wrocław' });
      sc.shot('steinhauer'); K.steinhauer.expr = 'impressed'; K.steinhauer.pose = 'stand';
      await say('steinhauer', 'Who are you, exactly?');
      const c = await choose([{ text: 'Your lawyer, Mr. Steinhauer.' }, { text: 'The one who read the footnotes.' }]);
      K.steinhauer.expr = 'amused';
      await say('steinhauer', c === 0 ? 'Then I’m glad I’m paying for you.' : 'Hm. | Keep reading them.');
      if (outcome === 'protected-lease') {
        sc.shot('marta'); K.marta.expr = 'pressure';
        await say('marta', 'One thing still bothers me. The stadium lease. If the City objects to the change of control, we’ll find out the hard way.');
      }
      sc.shot('window', 3);
      await wait(1200);
      ui.toast('Dr. Helena Wendt', 'Good.', '✆');
      await wait(2400);
    } else if (outcome === 'discount') {
      sc.shot('marta'); K.marta.expr = 'disappointed';
      await say('marta', 'Twenty million is a lot of money. | It’s not enough to buy back three seasons of television.');
      sc.shot('window', 3);
      await wait(1500);
    } else if (outcome === 'walked') {
      sc.shot('marta'); K.marta.expr = 'impressed';
      await say('marta', 'Helena will be furious for about four minutes. Then she’ll be proud of you for the rest of the year.');
      sc.shot('window', 3);
      await wait(1500);
    } else {
      sc.shot('marta'); K.marta.expr = 'disappointed';
      await say('marta', 'We did our job. We told him. | Didn’t we?');
      sc.shot('window', 3);
      await wait(1500);
    }
    ui.dialogueClose();
    F.fx.bars(false);
    await story.chapterEnd(outcome);
  };

  story.chapterEnd = async (outcome) => {
    await F.fx.fade(1, 1800);
    await F.go('void', { cut: true, holdBlack: true });
    F.audio.mix({ rain: 0.3, pad: 0.45 }, 3);
    F.audio.chord(outcome && outcome.startsWith('protected') ? 'resolve' : 'night');
    const r = F.scoreRedline();
    const ev = Object.keys(F.EVIDENCE).filter((k) => S.findings[k]).length;
    const epi = {
      protected: 'The Carbo deal signs at 10:14. Six months later, the City of Gliwice consents to the lease. The TV money arrives on time.',
      'protected-lease': 'The Carbo deal signs at 10:14. In March, the City of Gliwice opens a review of the stadium lease. Nobody at Adler Wendt is surprised.',
      discount: 'The deal signs at a discount. In the spring, Odra Capital collects the first instalment of the club’s television money. The discount does not cover it.',
      walked: 'Steinhauer walks. Three weeks later, a Düsseldorf fund announces it is acquiring KS Carbo. Its lawyers never ask about folder 7.3.',
      signed: 'The deal signs at 10:00 as drafted. In the spring, Odra Capital collects the club’s television money. The warranty claim fails: everything was “disclosed”.',
    }[outcome] || '';
    const verdict = { protected: 'Client protected', 'protected-lease': 'Client protected — one risk open', discount: 'Deal closed — risk priced, not removed', walked: 'Client walked away', signed: 'Deal closed badly' }[outcome] || '';
    const p = ui.panel('chapter-end', `
      <div class="ce-inner">
        <div class="c-chapter">Chapter I · Complete</div>
        <div class="c-chapname">The Carbo Deal</div>
        <div class="ce-rule"></div>
        <div class="ce-epi">${epi}</div>
        <div class="ce-file">
          <div><span>Outcome</span><b>${verdict}</b></div>
          <div><span>Redline</span><b>${r.right} of ${F.SPA.length} clauses called right${r.ok ? ` · ${r.ok} flagged` : ''}</b></div>
          <div><span>Evidence</span><b>${ev} of ${Object.keys(F.EVIDENCE).length} passages found</b></div>
          <div><span>Case board</span><b>${F.boardLinksCount()} connections</b></div>
        </div>
        <button class="ce-btn ce-notes-btn">Practice notes</button>
      </div>
      <div class="ce-notes">
        <div class="c-chapter">Practice notes · Chapter I</div>
        <div class="ce-list">${F.curriculum.chapterOneNotes(S).map((n) => `<div class="ce-note ${n.ok ? 'ok' : 'miss'}"><i>${n.ok ? '✓' : '○'}</i><div><b>${n.t}</b><span class="ce-track">${(F.curriculum.TRACKS[n.track] || {}).name || ''} · Tier ${(F.curriculum.TRACKS[n.track] || {}).tier || ''}</span><p>${n.d}</p></div></div>`).join('')}</div>
        <div class="c-chapter ce-sub">Career path</div>
        <div class="ce-stages">${F.curriculum.STAGES.map((st, i) => `<div class="${i === 0 ? 'done' : i === 1 ? 'now' : ''}"><em>${i + 1}</em>${st}</div>`).join('')}</div>
        <div class="c-chapter ce-sub">The road ahead</div>
        <div class="ce-road">${F.curriculum.CHAPTERS.slice(1, 7).map((c) => `<div><em>${c.n}</em><b>${c.title}</b><span>${c.where}</span></div>`).join('')}<div class="more"><em>…</em><b>XIV · Your Name on the Door</b><span>Gliwice</span></div></div>
        <div class="ce-next"><i>Next</i> Chapter II · <b>The Line Stops</b> · Gliwice ↔ Stuttgart</div>
        <div class="ce-tease">A German manufacturer stops its line and blames your Silesian supplier. €18 million. German law, Polish documents, English emails — and Dr. Kraus has asked for you by name.</div>
        <button class="ce-btn ce-title-btn">Return to title</button>
      </div>`);
    await F.fx.fade(0, 1600);
    p.node.querySelector('.ce-notes-btn').addEventListener('pointerdown', (e) => { e.stopPropagation(); F.audio.paper(); p.node.classList.add('show-notes'); });
    p.node.querySelector('.ce-title-btn').addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      F.resetSave();
      location.href = location.pathname;
    });
  };
})(window.F);
