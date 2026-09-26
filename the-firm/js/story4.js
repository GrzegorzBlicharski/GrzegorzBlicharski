/* THE FIRM — Chapter IV: Oder Crossing. Szczecin → Berlin, April. Cross-border employment, acting for the employee.
   Assistance fades: from this chapter on, translations are veiled — hover (or hold G) to reveal. */
(function (F) {
  'use strict';
  const U = F.U;
  const S = F.state;
  const ui = F.ui;
  const C = F.people.cast;
  const st = {};
  F.story4 = st;

  const say = (id, text, o) => ui.say(C[id] ? C[id].name.replace(/^Dr\. /, '') : id, text, Object.assign({ speaker: id }, o || {}));
  const narr = (text) => ui.say('', text);
  const choose = (opts, o) => ui.choose(opts, o);
  const wait = F.wait;
  const setTime = (t) => { S.time = t; F.save(); };
  const scene = () => F.scene;
  const ch4 = () => S.chapter === 4;
  const has = (k) => !!S.findings[k];
  const W4 = () => F.WORK4;
  const veil = (on) => document.body.classList.toggle('veil', on);
  window.addEventListener('keydown', (e) => { if (e.key === 'g' || e.key === 'G') document.body.classList.add('reveal'); });
  window.addEventListener('keyup', (e) => { if (e.key === 'g' || e.key === 'G') document.body.classList.remove('reveal'); });

  // ================================================================== START
  st.start = async () => {
    Object.assign(S, { chapter: 4, stage: 'c4_intake', time: '07:40', ch4: { memo: {} } });
    Object.keys(F.EVIDENCE).filter((k) => F.EVIDENCE[k].ch === 4).forEach((k) => delete S.findings[k]);
    ['c4wendt', 'c4kamil', 'c4wendt2'].forEach((k) => delete S.readMail[k]);
    ['i4_where', 'i4_br', 'i4_before', 'i4_who', 'i4_signed', 'memo4Sent', 'c4authority'].forEach((k) => delete S.flags[k]);
    F.save();
    veil(true);
    F.inputLocked = true;
    await F.go('void', { cut: true, holdBlack: true });
    F.audio.mix({ city: 0.12, pad: 0.32 }, 3);
    F.audio.chord('warm');
    await wait(1600);
    await ui.card([{ text: 'Chapter IV', cls: 'c-chapter' }, { text: 'Oder Crossing', cls: 'c-chapname' }], { hold: 3200, stagger: 0.7 });
    await wait(500);
    await ui.card([{ text: 'Szczecin', cls: 'c-city' }, { text: '07:40', cls: 'c-time' }, { text: 'Tuesday · 13 April 2027', cls: 'c-day' }], { hold: 3200, stagger: 0.55 });
    await F.go('szczecin_wide', { cut: true, fadeIn: 2400, shot: 'river' });
    F.camTween({ x: F.VW / 2, y: F.VH / 2, z: 1.0 }, 9, U.easeInOut);
    await wait(4200, true);
    ui.stamp('Wały Chrobrego · Szczecin', '07:40', 'Sunrise over the port');
    await wait(1800, true);
    await narr('Szczecin is closer to Berlin than to Gliwice. Every morning a few thousand people from here cross the Oder to work in Germany.');
    await narr('One of them was dismissed two weeks ago — by email, at 22:14 on a Monday. He is waiting for you by the balustrade.');
    ui.dialogueClose();
    await F.fx.fade(1, 700);
    scene().meet = true;
    F.camSet(scene().shots.kamil.x, scene().shots.kamil.y, scene().shots.kamil.z);
    await F.fx.fade(0, 900);
    st.intake();
  };

  st.resume = () => {
    veil(true);
    if (S.stage === 'c4_train') return st.train();
    if (S.stage === 'c4_court') return st.court();
    return st.start();
  };

  // ================================================================== THE INTAKE — Mandantengespräch on the embankment
  const QUESTIONS = [
    { k: 'where', text: 'Where do you actually work — how many days in Berlin, how many here?', gloss: 'Gdzie Pan faktycznie pracuje — ile dni w Berlinie, ile tutaj?',
      a: ['Poniedziałek do środy w hubie w Marienfelde. Czwartek i piątek z domu, tutaj. Tak od 2021. Mam to w systemie czasu pracy. <span class="gloss">Monday to Wednesday at the hub in Marienfelde. Thursday and Friday from home, here. Since 2021. It’s in the time-recording system.</span>'] },
    { k: 'br', text: 'Is there a works council at the hub — and did anyone from it know?', gloss: 'Czy w hubie jest rada zakładowa — i czy ktoś z niej wiedział?',
      a: ['Betriebsrat? Tak, Dilek Aydın jest przewodniczącą. Napisałem do niej. Odpisała, że nikt ich nie pytał. <span class="gloss">The works council? Yes, Dilek Aydın is the chair. I wrote to her. She replied that nobody asked them.</span>'] },
    { k: 'before', text: 'Did anything happen in the weeks before? An argument, a complaint?', gloss: 'Czy coś się wydarzyło w tygodniach wcześniej? Kłótnia, skarga?',
      a: ['W marcu napisałem do kadr, że nasi kierowcy na trasach po Niemczech dostają mniej niż płaca minimalna. Odpisali, że to nie moja sprawa. Cztery tygodnie później — ten mail. <span class="gloss">In March I wrote to HR that our drivers on German routes get less than the minimum wage. They replied it’s none of my business. Four weeks later — that email.</span>'] },
    { k: 'who', text: 'Who else does your job — and who stayed?', gloss: 'Kto jeszcze wykonuje Pana pracę — i kto został?',
      a: ['Jest nas czterech dyspozytorów. Zwolnili tylko mnie. Został Schulz — dwadzieścia sześć lat, dwa lata w firmie. Ja mam siedem lat i dwoje dzieci. Spisałem to. <span class="gloss">There are four dispatchers. Only I was let go. Schulz stayed — twenty-six, two years with the company. I have seven years and two kids. I wrote it down.</span>'] },
    { k: 'signed', text: 'Have you signed anything since — a receipt, an agreement?', gloss: 'Czy coś Pan podpisał od tamtej pory — potwierdzenie, porozumienie?',
      a: ['Nie. Pohl chciał, żebym potwierdził odbiór. Nie odpisałem. <span class="gloss">No. Pohl wanted me to confirm receipt. I didn’t reply.</span>'] },
    { k: 'blame', text: 'Be honest with me — did you do something wrong?', gloss: 'Proszę być szczerym — zrobił Pan coś nie tak?',
      a: ['…Nie. Siedem lat bez jednego upomnienia. <span class="gloss">…No. Seven years without a single warning.</span>'] },
  ];

  st.intake = async () => {
    const sc = scene();
    F.inputLocked = true;
    F.fx.bars(true);
    ui.stamp('Wały Chrobrego · Szczecin', '07:52', 'Your client, for the first time');
    await wait(1400);
    sc.kamil.expr = 'tired';
    await say('kamil', 'Dzień dobry. Dziękuję, że Pan/Pani przyjechał/a aż tutaj. Tomek Pietrzyk z Silformu powiedział, że Państwo znają Niemców. <span class="gloss">Good morning. Thank you for coming all the way here. Tomek Pietrzyk from Silform said your firm knows the Germans.</span>', { role: 'Dispatcher · Havel Logistik, Berlin' });
    await say('kamil', 'Siedem lat. I jeden mail o dziesiątej wieczorem. <span class="gloss">Seven years. And one email at ten at night.</span>');
    await narr('You have time for four questions before he has to take his daughter to school. Choose them well: the facts you don’t ask about won’t be in the claim.');
    ui.dialogueClose();
    const asked = {};
    for (let i = 0; i < 4; i++) {
      const left = QUESTIONS.filter((q) => !asked[q.k]);
      const pick = await choose(left.map((q) => ({ text: `${q.text} <span class="gloss">${q.gloss}</span>`, tag: `Question ${i + 1} of 4` })));
      const q = left[pick]; asked[q.k] = true; F.flag('i4_' + q.k, true);
      sc.kamil.expr = q.k === 'blame' ? 'disappointed' : q.k === 'before' ? 'pressure' : 'neutral';
      await say('kamil', q.a[0]);
      if (q.k === 'blame') { F.trust('kamil', -1); await narr('A fair question, badly timed. Clients remember the first time you doubted them.'); }
      else if (q.k !== 'signed') await narr('He forwards it to you before you finish your sentence. It will be in your file on the train.');
    }
    sc.kamil.expr = 'neutral';
    await say('kamil', 'Nie chcę tam wracać. Chcę tego, co uczciwe — i dobrego świadectwa pracy. Muszę znaleźć nową pracę, w Berlinie albo tutaj. <span class="gloss">I don’t want to go back there. I want what’s fair — and a good reference. I have to find a new job, in Berlin or here.</span>');
    S.ch4.asked = Object.keys(asked);
    ui.dialogueClose();
    F.fx.bars(false);
    await wait(600);
    ui.toast('Dr. Helena Wendt', '10:12 to Berlin — draft the claim on the train');
    await wait(2600, true);
    st.train();
  };

  // ================================================================== THE TRAIN — drafting the Klage
  st.train = async () => {
    S.stage = 'c4_train'; setTime('10:12'); F.save();
    await F.go('train', { station: 'ANGERMÜNDE', day: true, laptop: true, fadeOut: 1200, fadeIn: 1400 });
    ui.stamp('Szczecin Główny → Berlin', '10:12', 'Regional train via Angermünde');
    await wait(1600);
    ui.objective('Open the laptop. Draft the claim for Dr. Wendt before Berlin.');
    F.inputLocked = false;
  };
  F.on('train:laptop', () => { if (ch4() && S.stage === 'c4_train') F.openComputer('mail', { noCam: true }); });
  F.on('memo4:sent', () => { if (ch4()) st.afterMemo(); });

  st.afterMemo = async () => {
    if (S.stage !== 'c4_train') return;
    S.stage = 'c4_court'; setTime('12:02'); F.save();
    F.inputLocked = true;
    await wait(1200);
    ui.toast('Dr. Helena Wendt', 'RE: Klage Sobczak');
    await wait(2600);
    await narr('Wendt signs at 13:10 and files through the lawyers’ electronic mailbox at 13:24 — six days inside the deadline.');
    await narr('The court sets the conciliation hearing for Tuesday, 27 April. Two weeks: in dismissal cases, the law wants the parties in front of a judge fast.');
    ui.dialogueClose();
    await wait(800);
    st.court();
  };

  // ================================================================== BERLIN — before the hearing
  st.court = async () => {
    S.stage = 'c4_court'; F.save();
    F.inputLocked = true;
    await F.go('void', { fadeOut: 1400, holdBlack: true });
    setTime('09:08');
    await ui.card([{ text: 'Berlin', cls: 'c-city' }, { text: '09:08', cls: 'c-time' }, { text: 'Tuesday · 27 April 2027', cls: 'c-day' }], { hold: 3000, stagger: 0.55 });
    await F.go('berlin_wide', { cut: true, fadeIn: 2000 });
    await wait(3600, true);
    const s = F.scoreWork(W4());
    await say('wendt', 'Twenty minutes. Let’s go through your draft once more, before Brandauer does.', { role: 'Senior Partner · on the embankment' });
    if (!s.missed.length) await say('wendt', 'Nothing to correct. Brandauer will open with the choice of Polish law. Then he will tell the judge they can simply dismiss again — properly. He is right about that. Our leverage has a shelf life.');
    else for (const Q of s.missed) { const right = Q.opts.find((o) => o.ok); await say('wendt', `${Q.q.replace(/^\d · /, '')} — ${right.why}`); }
    await say('wendt', 'In there, you lead. I sit next to you. | And nothing is agreed until Kamil says yes.');
    ui.dialogueClose();
    await wait(1200, true);
    st.hearing();
  };

  // ================================================================== ARBEITSGERICHT BERLIN — Güteverhandlung
  st.hearing = async () => {
    await F.go('arbg_room', { fadeOut: 1200, fadeIn: 1400, shot: 'wide' });
    const sc = scene(), K = sc.cast;
    F.inputLocked = true;
    F.fx.bars(true);
    ui.stamp('Arbeitsgericht Berlin · Saal 312', '09:30', 'Güteverhandlung · Sobczak ./. Havel Logistik GmbH');
    await wait(2600);
    sc.shot('albers');
    await say('albers', 'Wir sind in der Güteverhandlung in der Sache Sobczak gegen Havel Logistik GmbH. Ich habe die Akte gelesen. Ich sage Ihnen offen, wo ich Probleme sehe – und dann sprechen wir über eine Einigung. <span class="gloss">We are in the conciliation hearing in Sobczak v Havel Logistik GmbH. I have read the file. I will tell you openly where I see problems — and then we talk about a settlement.</span>', { role: 'Vorsitzende Richterin' });
    sc.shot('brandauer');
    await say('brandauer', 'Frau Vorsitzende, die Parteien haben polnisches Recht vereinbart. Das Kündigungsschutzgesetz findet keine Anwendung. <span class="gloss">Madam Chair, the parties chose Polish law. The Dismissal Protection Act does not apply.</span>', { role: 'Rechtsanwalt · for Havel Logistik' });
    let lev = 0;
    // ---- round 1: which law
    sc.shot('wide', 1.4);
    const r1ok = has('choice') && (has('workplace') || has('split'));
    const r1 = await choose([
      { text: 'Die Rechtswahl ist wirksam – aber nach Artikel 8 Rom I darf sie dem Kläger nicht den Schutz der zwingenden Vorschriften des Rechts am gewöhnlichen Arbeitsort entziehen. Das ist Berlin: drei von fünf Tagen, seit 2021. <span class="gloss">The choice of law is valid — but under article 8 Rome I it cannot deprive the claimant of the protection of the mandatory rules of his habitual place of work. That is Berlin: three days out of five, since 2021.</span>', tag: r1ok ? 'DE · contract §3, §12' : 'DE · no evidence', disabled: !r1ok },
      { text: 'Polnisches Recht ist für den Kläger ohnehin günstiger. <span class="gloss">Polish law is more favourable to the claimant anyway.</span>', tag: 'DE' },
      { text: 'Es gilt deutsches Recht, weil die Beklagte eine deutsche GmbH ist. <span class="gloss">German law applies because the defendant is a German GmbH.</span>', tag: 'DE' },
    ]);
    sc.shot('albers');
    if (r1 === 0) { lev++; K.albers.expr = 'neutral'; await say('albers', 'So sehe ich das auch. Der Schwerpunkt der Tätigkeit liegt in Berlin. Das Kündigungsschutzgesetz ist anwendbar. <span class="gloss">That is how I see it too. The centre of the work is in Berlin. The Dismissal Protection Act applies.</span>'); }
    else if (r1 === 1) { lev--; K.albers.expr = 'suspicious'; await say('albers', 'Günstiger? Nach polnischem Recht wäre eine Kündigung ohne Schriftform wirksam. Das sollten Sie sich noch einmal überlegen. <span class="gloss">More favourable? Under Polish law a notice without written form would be effective. You may want to reconsider that.</span>'); }
    else { K.albers.expr = 'cold'; await say('albers', 'Der Sitz der Arbeitgeberin allein trägt das nicht. Entscheidend ist Artikel 8 Rom I. <span class="gloss">The employer’s seat alone does not carry that. Article 8 Rome I is what matters.</span>'); }
    // ---- rounds 2–4: the notice itself
    sc.shot('albers');
    await say('albers', 'Kommen wir zur Kündigung selbst. <span class="gloss">Let us turn to the notice itself.</span>');
    const used = {};
    const pool = () => [
      { k: 'form', need: has('email'), tag: 'email 29.03',
        text: 'Die Kündigung wurde per E-Mail als eingescannte PDF-Datei übermittelt. Das wahrt die Schriftform des § 623 BGB nicht – die Kündigung ist nichtig. <span class="gloss">The notice was sent by email as a scanned PDF. That does not meet the written form of §623 BGB — the notice is void.</span>' },
      { k: 'br', need: has('nohearing'), tag: 'works council email',
        text: 'Der Betriebsrat wurde vor der Kündigung nicht angehört. Nach § 102 Absatz 1 Satz 3 BetrVG ist die Kündigung unwirksam. <span class="gloss">The works council was not heard before the notice. Under §102(1) sentence 3 BetrVG the notice is invalid.</span>' },
      { k: 'mass', need: has('complaint'), tag: 'emails 2–3 March',
        text: 'Vier Wochen vor der Kündigung hat der Kläger schriftlich beanstandet, dass Fahrer unter dem Mindestlohn bezahlt werden. Die Antwort der Personalleitung liegt vor. Wir sehen eine Maßregelung nach § 612a BGB. <span class="gloss">Four weeks before the notice the claimant complained in writing that drivers are paid below the minimum wage. HR’s reply is in the file. We see victimisation under §612a BGB.</span>' },
      { k: 'sozial', need: has('sozial'), tag: 'Kamil’s notes',
        text: 'Eine Sozialauswahl hat nicht stattgefunden: Ein vergleichbarer Disponent – 26 Jahre, zwei Jahre Betriebszugehörigkeit, keine Unterhaltspflichten – wird weiterbeschäftigt. <span class="gloss">No social selection took place: a comparable dispatcher — 26, two years’ service, no dependants — is kept on.</span>' },
      { k: 'frist', need: has('tenure'), tag: 'contract §1',
        text: 'Auch die Frist ist falsch: Nach sieben Jahren beträgt sie zwei Monate zum Monatsende, § 622 Absatz 2 BGB. <span class="gloss">The notice period is wrong too: after seven years it is two months to the end of a month, §622(2) BGB.</span>' },
      { k: 'wohn', need: true, tag: 'the easy one',
        text: 'Die Kündigung ist schon deshalb unwirksam, weil der Kläger in Polen wohnt. <span class="gloss">The notice is invalid simply because the claimant lives in Poland.</span>' },
    ].filter((a) => !used[a.k]).concat(used.general ? [] : [{ k: 'general', need: true, tag: 'no specifics',
        text: 'Wir halten die Kündigung insgesamt für unwirksam und verweisen auf unseren Schriftsatz. <span class="gloss">We consider the notice invalid as a whole and refer to our written submission.</span>' }]);
    for (let round = 0; round < 3; round++) {
      sc.shot('wide', 1.3);
      const opts = pool();
      const pick = await choose(opts.map((a) => ({ text: a.text, tag: 'DE · ' + (a.need ? a.tag : 'no evidence'), disabled: !a.need })));
      const a = opts[pick]; used[a.k] = true;
      if (a.k === 'form') {
        lev++; sc.shot('albers'); K.albers.expr = 'neutral';
        await say('albers', 'Das ist nach meiner vorläufigen Einschätzung eindeutig. <span class="gloss">On my provisional assessment that is clear.</span>');
        sc.shot('brandauer'); K.brandauer.expr = 'cold';
        await say('brandauer', 'Meine Mandantin kann jederzeit formgerecht nachkündigen. <span class="gloss">My client can re-issue a notice in proper form at any time.</span>');
      } else if (a.k === 'br') {
        lev++; sc.shot('brandauer'); K.brandauer.expr = 'pressure';
        await say('brandauer', 'Das … prüfen wir. <span class="gloss">We are … looking into that.</span>');
      } else if (a.k === 'mass') {
        lev++; sc.shot('brandauer'); K.brandauer.expr = 'angry';
        await say('brandauer', 'Das ist eine Unterstellung. <span class="gloss">That is an insinuation.</span>');
        sc.shot('albers'); K.albers.expr = 'suspicious';
        await say('albers', 'Das müsste der Kläger beweisen. Aber die zeitliche Nähe ist auffällig. <span class="gloss">The claimant would have to prove it. But the timing is striking.</span>');
      } else if (a.k === 'sozial') {
        lev++; sc.shot('albers');
        await say('albers', 'Das wäre im Kammertermin zu klären – mit Beweisaufnahme. <span class="gloss">That would have to be decided at the full hearing — with evidence taken.</span>');
      } else if (a.k === 'frist') {
        sc.shot('albers');
        await say('albers', 'Richtig. Aber eine zu kurze Frist macht die Kündigung nicht unwirksam – sie wirkt dann zum nächsten zulässigen Termin. <span class="gloss">Correct. But a period that is too short does not make the notice invalid — it takes effect at the next permissible date.</span>');
      } else if (a.k === 'general') {
        sc.shot('albers'); K.albers.expr = 'cold';
        await say('albers', 'Das hilft mir nicht weiter. Was genau? <span class="gloss">That doesn’t help me. What exactly?</span>');
      } else {
        lev--; sc.shot('albers'); K.albers.expr = 'cold';
        await say('albers', 'Der Wohnsitz des Klägers spielt dafür keine Rolle. <span class="gloss">The claimant’s residence plays no part in that.</span>');
        sc.shot('wendt'); K.wendt.expr = 'disappointed'; await wait(900);
      }
    }
    // ---- the judge's proposal
    sc.shot('albers'); K.albers.expr = 'neutral';
    await say('albers', 'Mein Vorschlag: Beendigung zum 31. Juli 2027 auf Veranlassung der Arbeitgeberin, bis dahin bezahlte Freistellung, ein wohlwollendes qualifiziertes Zeugnis – und eine Abfindung von einem halben Bruttomonatsgehalt pro Beschäftigungsjahr. Das wären 15.050 Euro. <span class="gloss">My proposal: employment ends on 31 July 2027 at the employer’s instigation, paid garden leave until then, a favourable detailed reference — and severance of half a gross monthly salary per year of service. That would be €15,050.</span>');
    sc.shot('kamil'); K.kamil.expr = 'pressure';
    await say('kamil', 'Piętnaście tysięcy… Co Pan/Pani radzi? <span class="gloss">Fifteen thousand… What do you advise?</span>', { role: 'your client · quietly, in Polish' });
    sc.shot('wide', 1.4);
    const c = await choose([
      { text: 'Frau Vorsitzende, ich bitte um eine kurze Unterbrechung – ich möchte das mit meinem Mandanten besprechen. <span class="gloss">Madam Chair, I ask for a short break — I would like to discuss this with my client.</span>', tag: 'DE' },
      { text: 'Mein Mandant nimmt den Vorschlag an. <span class="gloss">My client accepts the proposal.</span>', tag: 'DE' },
      { text: 'Mein Mandant verlangt die Weiterbeschäftigung und 80.000 Euro. <span class="gloss">My client demands reinstatement and €80,000.</span>', tag: 'DE' },
    ]);
    let outcome;
    if (c === 0) {
      sc.shot('kamil'); K.kamil.expr = 'neutral';
      await narr('In the corridor, by the window. You explain in Polish: what the judge said about the form and the works council, what Brandauer said about dismissing again, and what that does to the price.');
      const adv = await choose([
        { text: 'Radzę zażądać współczynnika 1,0 — około trzydziestu tysięcy — i świadectwa z oceną „bardzo dobry”. Mamy do tego argumenty. Ale decyzja jest Pana. <span class="gloss">I advise asking for a factor of 1.0 — about thirty thousand — and a reference graded “very good”. We have the arguments for it. But the decision is yours.</span>', tag: 'PL · advice' },
        { text: 'Radzę przyjąć propozycję sędzi. Pewne pieniądze dziś, bez ryzyka. <span class="gloss">I advise accepting the judge’s proposal. Certain money today, no risk.</span>', tag: 'PL · advice' },
      ]);
      await say('kamil', adv === 0 ? 'Dobrze. Niech Pan/Pani spróbuje. <span class="gloss">All right. Give it a try.</span>' : 'Dobrze. Jeśli Pan/Pani tak uważa. <span class="gloss">All right. If you think so.</span>');
      sc.shot('wide', 1.4);
      if (adv === 0) {
        await narr('Back in Saal 312.');
        await choose([{ text: 'Mein Mandant wäre mit einem Faktor von 1,0 einverstanden – 30.100 Euro – und einem Zeugnis mit der Gesamtnote „sehr gut“. <span class="gloss">My client would agree to a factor of 1.0 — €30,100 — and a reference with the overall grade “very good”.</span>', tag: 'DE' }]);
        sc.shot('brandauer');
        if (lev >= 3) { K.brandauer.expr = 'cold'; await say('brandauer', 'Ich habe mit meiner Mandantin telefoniert. 27.000 Euro, Freistellung bis 31. Juli, Zeugnis „sehr gut“. Das ist unser letztes Wort. <span class="gloss">I have phoned my client. €27,000, garden leave until 31 July, a “very good” reference. That is our final word.</span>'); outcome = 'strong'; }
        else { K.brandauer.expr = 'amused'; await say('brandauer', 'Null Komma fünfundsiebzig. 22.575 Euro. Mehr nicht. <span class="gloss">Zero point seven five. €22,575. No more.</span>'); outcome = 'fair'; }
        sc.shot('kamil'); K.kamil.expr = 'smile';
        await say('kamil', 'Zgadzam się. <span class="gloss">I agree.</span>');
      } else outcome = 'standard';
    } else if (c === 1) {
      F.flag('c4authority', true);
      sc.shot('wendt'); K.wendt.expr = 'angry';
      await say('wendt', 'Einen Moment, bitte. | Wir hätten gern zwei Minuten mit unserem Mandanten. <span class="gloss">One moment, please. We would like two minutes with our client.</span>', { role: 'Senior Partner' });
      await narr('Wendt takes over. Kamil agrees in the corridor — but he heard you accept for him before he was asked.');
      outcome = 'standard';
    } else {
      sc.shot('albers'); K.albers.expr = 'cold';
      await say('albers', 'Dann ist eine Einigung heute nicht möglich. Ich bestimme Termin zur Kammerverhandlung. <span class="gloss">Then a settlement is not possible today. I will set a date for the full hearing.</span>');
      sc.shot('kamil'); K.kamil.expr = 'disappointed';
      await narr('Kamil told you on the embankment that he does not want to go back. Now he has a court date in the autumn and no severance.');
      outcome = 'kammer';
    }
    S.ch4.lev = lev; S.ch4.outcome = outcome; S.stage = 'c4_done'; F.save();
    if (outcome !== 'kammer') {
      const sum = { strong: '27.000', fair: '22.575', standard: '15.050' }[outcome];
      sc.shot('albers'); K.albers.expr = 'neutral';
      await say('albers', `Ich diktiere: „Die Parteien schließen folgenden Vergleich. Erstens: Das Arbeitsverhältnis endet auf Veranlassung der Beklagten aus betriebsbedingten Gründen mit Ablauf des 31. Juli 2027. Zweitens: Die Beklagte zahlt eine Abfindung in Höhe von ${sum} Euro brutto.“ <span class="gloss">I dictate: “The parties conclude the following settlement. First: the employment ends at the defendant’s instigation for operational reasons at the end of 31 July 2027. Second: the defendant pays severance of €${sum} gross.”</span>`);
    }
    ui.dialogueClose();
    F.fx.bars(false);
    await st.resolution(outcome);
  };

  st.resolution = async (outcome) => {
    await F.go('berlin_wide', { fadeOut: 1200, fadeIn: 1400 });
    setTime('10:41');
    ui.stamp('Berlin · on the Spree', '10:41', 'After the hearing');
    await wait(2200);
    if (outcome === 'strong') {
      await say('kamil', 'Dwadzieścia siedem tysięcy. I świadectwo. | Moja żona nie uwierzy. <span class="gloss">Twenty-seven thousand. And the reference. My wife won’t believe it.</span>', { role: 'your client' });
      await say('wendt', 'You found the facts on the embankment, you wrote them down on the train, and you let him decide. | That is the whole job.');
    } else if (outcome === 'fair') {
      await say('kamil', 'Dziękuję. To więcej, niż myślałem. <span class="gloss">Thank you. It’s more than I thought.</span>', { role: 'your client' });
      await say('wendt', 'A good result. The points you didn’t have were worth about five thousand euros to him.');
    } else if (outcome === 'standard') {
      await say('wendt', F.flag('c4authority') ? 'You don’t accept for a client. Ever. You advise; he decides.' : 'The judge’s number. Safe — and it left his best arguments unused.');
    } else {
      await say('wendt', 'A lawyer who fights for what the client does not want is not brave. Just expensive.');
    }
    ui.dialogueClose();
    await st.chapterEnd(outcome);
  };

  // ================================================================== CHAPTER END
  st.chapterEnd = async (outcome) => {
    await F.fx.fade(1, 1800);
    await F.go('void', { cut: true, holdBlack: true });
    veil(false);
    F.audio.mix({ city: 0.15, pad: 0.45 }, 3);
    F.audio.chord(outcome === 'strong' ? 'resolve' : 'night');
    const m = F.scoreWork(W4());
    const ev = Object.keys(F.EVIDENCE).filter((k) => F.EVIDENCE[k].ch === 4 && S.findings[k]).length;
    const total = Object.keys(F.EVIDENCE).filter((k) => F.EVIDENCE[k].ch === 4).length;
    const epi = {
      strong: 'Kamil starts as operations lead at a Szczecin logistics firm in August. In September, the customs authority’s minimum-wage unit opens an audit of Havel’s Polish drivers. In November, Kamil sends two colleagues to Adler Wendt.',
      fair: 'Kamil finds a new job in Szczecin in September. Havel Logistik re-drafts its contracts for cross-border staff — with German law and German forms.',
      standard: 'Kamil takes the €15,050 and a new job in Gorzów. When a colleague asks him for a lawyer, he hesitates before giving your name.',
      kammer: 'The full hearing is set for November. Havel dismisses Kamil again in May — in writing, after hearing the works council. The case settles in December for less than the judge proposed in April.',
    }[outcome];
    const verdict = { strong: 'Settlement well above the benchmark', fair: 'Settlement above the benchmark', standard: 'Settlement at the benchmark', kammer: 'No settlement — full hearing in November' }[outcome];
    const notes = F.curriculum.chapterFourNotes(S);
    F.curriculum.record(4, notes);
    const p = ui.panel('chapter-end', `
      <div class="ce-inner">
        <div class="c-chapter">Chapter IV · Complete</div>
        <div class="c-chapname">Oder Crossing</div>
        <div class="ce-rule"></div>
        <div class="ce-epi">${epi}</div>
        <div class="ce-file">
          <div><span>Outcome</span><b>${verdict}</b></div>
          <div><span>Klage</span><b>${m.right} of ${m.total} right · ${m.cited} cited to the right document</b></div>
          <div><span>Intake</span><b>${(S.ch4.asked || []).filter((k) => ['where', 'br', 'before', 'who'].includes(k)).length} of 4 decisive facts uncovered</b></div>
          <div><span>Evidence</span><b>${ev} of ${total} passages found</b></div>
        </div>
        <button class="ce-btn ce-notes-btn">Practice notes</button>
      </div>
      <div class="ce-notes">
        <div class="c-chapter">Practice notes · Chapter IV</div>
        <div class="ce-list">${notes.map((n) => `<div class="ce-note ${n.ok ? 'ok' : 'miss'}"><i>${n.ok ? '✓' : '○'}</i><div><b>${n.t}</b><span class="ce-track">${(F.curriculum.TRACKS[n.track] || {}).name || ''} · Tier ${(F.curriculum.TRACKS[n.track] || {}).tier || ''}</span><p>${n.d}</p></div></div>`).join('')}</div>
        <div class="c-chapter ce-sub">Dismissal · Poland ↔ Germany</div>
        <div class="ce-compare">${F.curriculum.compareFour.map((r) => `<div><b>${r[0]}</b><span>${r[1]}</span><span>${r[2]}</span></div>`).join('')}</div>
        <div class="c-chapter ce-sub">Career path</div>
        <div class="ce-stages">${F.curriculum.STAGES.map((s, i) => `<div class="${i <= 2 ? 'done' : i === 3 ? 'now' : ''}"><em>${i + 1}</em>${s}</div>`).join('')}</div>
        <div class="ce-next"><i>Next</i> Chapter V · <b>Fair Trade</b> · Poznań ↔ Berlin <em class="ce-soon">in development</em></div>
        <div class="ce-tease">A family distributor from Poznań is terminated by its German principal after fourteen years. Distribution or agency? The answer decides the money.</div>
        <button class="ce-btn ce-title-btn">Return to title</button>
      </div>`);
    await F.fx.fade(0, 1600);
    p.node.querySelector('.ce-notes-btn').addEventListener('pointerdown', (e) => { e.stopPropagation(); F.audio.paper(); p.node.classList.add('show-notes'); });
    p.node.querySelector('.ce-title-btn').addEventListener('pointerdown', (e) => { e.stopPropagation(); location.href = location.pathname; });
  };

  // ------------------------------------------------------------------ workstation (Chapter IV — the laptop on the train)
  const signature = (name, role) => `<div class="m-sig"><b>${name}</b><br>${role}<br><span>ADLER WENDT · Rechtsanwälte · Friedrichstraße 88 · Berlin</span></div>`;
  F.mail.push(
    { id: 'c4wendt', ch: 4, stage: 0, from: 'Dr. Helena Wendt', addr: 'h.wendt@adlerwendt.de', time: '06:40', subject: 'Sobczak ./. Havel — Klage today', body: `<p>You met him. Now write it down.</p><p>Draft the claim for the Arbeitsgericht Berlin on the train: deadline, which law, which court, why the dismissal fails, and what we tell him about costs. I sign in Berlin at 13:00 and file through beA.</p><p>Everything he forwarded you this morning is in the matter file. What you didn’t ask about, you don’t have.</p><p>H.W.</p><div class="m-sent">Sent from mobile</div>` },
    { id: 'c4kamil', ch: 4, stage: 0, from: 'Kamil Sobczak', addr: 'k.sobczak@poczta.pl', time: '08:31', subject: 'Dokumenty', body: `<p>Dzień dobry, w załączeniu umowa i ten mail. Resztę przesłałem, o co Pan/Pani pytał/a.</p><p>Kamil Sobczak</p><details class="m-gloss"><summary>English</summary><p>Attached: the contract and that email. I’ve sent the rest you asked about.</p></details>`, attach: [{ name: 'Arbeitsvertrag_Sobczak_2020.pdf', open: () => F.openDoc('av4') }, { name: 'Kuendigung_2027-03-29.eml', open: () => F.openDoc('kmail') }] },
    { id: 'c4wendt2', ch: 4, stage: 2, from: 'Dr. Helena Wendt', addr: 'h.wendt@adlerwendt.de', time: '12:02', subject: 'RE: Klage Sobczak', dynamic: () => {
      const s = F.scoreWork(W4());
      return `<p>${s.right === s.total ? 'Clean. I’ll sign it as it is.' : `${s.right} of ${s.total}. I’ll fix it before I sign — we’ll go through it in Berlin.`}</p><p>${s.cited >= 4 ? 'Every answer with its document. Good.' : 'More sources next time. Brandauer will ask for every one.'}</p><p>H.W.</p>`;
    } },
  );

  F.chapterOS[4] = {
    docs(main, api) {
      main.innerHTML = `<div class="docs"><div class="dh">Documents <span>Sobczak ./. Havel Logistik GmbH · AW-BER-2027-031</span></div><div class="dgrid">${F.ch4Docs().map(([k, n, f, t]) => `<button class="dcard ${k === 'memo' ? 'memo-card' : ''} ${S.readDocs && S.readDocs[k] ? 'seen' : ''}" data-k="${k}"><i class="t-${t}">${t}</i><b>${n}</b><span>${f}</span></button>`).join('')}</div></div>`;
      main.querySelectorAll('.dcard').forEach((b) => b.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        if (b.dataset.k === 'memo') F.openMemo4().then((sent) => { if (sent) { api.close(); F.emit('memo4:sent'); } });
        else F.openDoc(b.dataset.k).then(() => b.classList.add('seen'));
      }));
    },
    vdr(main) {
      const items = F.ch4Docs().filter(([k]) => k !== 'memo');
      main.innerHTML = `<div class="docs vdr-app"><div class="dh">Client uploads <span>K. Sobczak · via secure link</span></div><div class="vlist">${items.map(([k, n]) => `<button class="vitem" data-k="${k}"><i>▸</i>${n}</button>`).join('')}</div>${S.ch4 && S.ch4.asked && S.ch4.asked.length ? '' : ''}</div>`;
      main.querySelectorAll('.vitem').forEach((b) => b.addEventListener('pointerdown', (e) => { e.stopPropagation(); F.openDoc(b.dataset.k); }));
    },
    cal(main) {
      main.innerHTML = `<div class="cal"><div class="dh">Tuesday, 13 April 2027</div><div class="cal-day">${[['07:45', 'K. Sobczak — Wały Chrobrego', 'Szczecin'], ['10:12', 'Szczecin Gł. → Berlin', 'via Angermünde'], ['13:00', 'Klage — signature H. Wendt, filing via beA', 'Berlin office']].map(([t, n, r]) => `<div class="cal-e ${t === '13:00' ? 'hot' : ''}"><b>${t}</b><span>${n}</span><i>${r}</i></div>`).join('')}</div><div class="dh sm">Monday, 19 April</div><div class="cal-day"><div class="cal-e hot"><b>24:00</b><span>Three weeks from receipt — §4 KSchG</span><i></i></div></div></div>`;
    },
    law(main) {
      main.innerHTML = `<div class="law"><div class="dh">Research <span>beck-online · EUR-Lex · gesetze-im-internet.de</span></div>
        <div class="law-q">Rom I Art. 8 · Brüssel Ia Art. 21, 23 · Kündigungsschutzklage · Schriftform · Betriebsrat</div>
        <article><h3>Which law governs an employment contract? (Rome I, art. 8)</h3><p>The parties may choose the law, but the choice <b>may not deprive the employee of the protection of mandatory rules</b> of the law that would apply without it: the law of the country where (or from which) the employee <b>habitually works</b>; for work in several states the CJEU looks to where the employee performs the bulk of the obligations (<b>Koelzsch, C-29/10</b>). German courts compare the protection issue by issue; the chosen law still applies where it is more favourable.</p></article>
        <article><h3>Which court? (Brussels I bis, arts. 20–23)</h3><p>An employee may sue the employer in the state of the employer’s domicile, or where the employee <b>habitually carries out the work</b> (art. 21). The employer may sue the employee only where the employee lives (art. 22). A forum clause binds the employee only if it was agreed <b>after the dispute arose</b> or <b>adds</b> fora for the employee (art. 23).</p></article>
        <article><h3>Dismissal protection in Germany</h3><p>The <b>KSchG</b> applies after six months’ employment in establishments with more than ten employees (§§1, 23): dismissal must be socially justified — for personal, conduct or operational reasons, with a <b>social selection</b> among comparable employees for operational dismissals (§1(3): length of service, age, maintenance obligations, severe disability). A claim must reach the labour court <b>within three weeks</b> of receipt of the written notice (§4), or the notice is treated as valid (§7). Notice must be in <b>written form</b> — an email or a scan is not enough (<b>§623 BGB</b>). The <b>works council</b> must be heard before every dismissal; a dismissal without hearing is invalid (<b>§102(1) BetrVG</b>). Employer notice periods grow with service (<b>§622(2) BGB</b>: e.g. two months to the end of a month after five years). An employer may not disadvantage an employee for lawfully exercising his rights (<b>§612a BGB</b>).</p></article>
        <article><h3>Procedure and costs (ArbGG)</h3><p>Every case begins with a <b>conciliation hearing</b> before the presiding judge alone (§54); in dismissal cases it should take place within <b>two weeks</b> of filing (§61a). At first instance each party bears its <b>own lawyer’s fees</b>, whatever the outcome (§12a). Severance is not a statutory entitlement in general; settlements often start from a rule of thumb of <b>half a gross monthly salary per year of service</b>.</p></article>
        <article><h3>The Polish comparison</h3><p>A notice must state the reason for an indefinite contract (art. 30 §4 KP) and should be in writing (art. 30 §3) — but a notice without written form is still <b>effective</b>; the employee claims reinstatement or compensation (art. 45 KP). Appeal within <b>21 days</b> of delivery (art. 264 §1 KP).</p></article></div>`;
    },
  };
})(window.F);
