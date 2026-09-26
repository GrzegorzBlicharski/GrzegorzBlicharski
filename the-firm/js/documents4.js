/* THE FIRM — Chapter IV matter file: Kamil Sobczak (Szczecin) ./. Havel Logistik GmbH (Berlin).
   All people, companies and documents are fictional. The legal mechanisms are real:
   Rome I art. 8 (CJEU Koelzsch C-29/10), Brussels I bis arts. 21 and 23, KSchG §§1, 4, 7, 23, BGB §§612a, 622, 623,
   BetrVG §102, ArbGG §§12a, 54, 61a; Polish comparison: Kodeks pracy arts. 30, 45, 264. */
(function (F) {
  'use strict';
  const ev = (id, html) => `<span class="ev" data-ev="${id}">${html}</span>`;

  Object.assign(F.EVIDENCE, {
    tenure:    { ch: 4, label: 'Employed since 01.03.2020 — seven years', src: 'Arbeitsvertrag §1' },
    workplace: { ch: 4, label: 'Workplace: Berlin hub + up to 2 days remote in Poland', src: 'Arbeitsvertrag §3' },
    salary:    { ch: 4, label: '€4,300 gross per month', src: 'Arbeitsvertrag §4' },
    choice:    { ch: 4, label: '“Polish law applies”', src: 'Arbeitsvertrag §12' },
    forum4:    { ch: 4, label: '“Place of jurisdiction: Szczecin”', src: 'Arbeitsvertrag §13' },
    email:     { ch: 4, label: 'Notice sent as a scanned PDF by email', src: 'Email 29.03.2027' },
    short:     { ch: 4, label: 'Notice “to 30.04.2027” — one month', src: 'Email 29.03.2027' },
    nohearing: { ch: 4, label: 'Works council was never heard', src: 'Betriebsrat email' },
    split:     { ch: 4, label: '3 days Berlin, 2 days Szczecin (60/40)', src: 'Time records Q1' },
    complaint: { ch: 4, label: 'Minimum-wage complaint 4 weeks before the notice', src: 'Emails 2–3 March' },
    sozial:    { ch: 4, label: 'Colleague: 26, 2 years, no children — kept', src: 'Kamil’s notes' },
  });

  Object.assign(F.docs, {
    av4: {
      title: 'Arbeitsvertrag — Havel Logistik GmbH / Kamil Sobczak', short: 'Employment contract', folder: 'Client documents', kind: 'paper', lang: true, langs: ['DE', 'EN'],
      pl: `<div class="doc-head"><div class="doc-org">ARBEITSVERTRAG</div><div class="doc-sub">zwischen der Havel Logistik GmbH, Berlin („Arbeitgeberin“) und Herrn Kamil Sobczak, Szczecin („Arbeitnehmer“)</div></div>
        <p class="doc-clause"><b>§ 1 Beginn.</b> ${ev('tenure', 'Das Arbeitsverhältnis beginnt am 01.03.2020')} und wird auf unbestimmte Zeit geschlossen.</p>
        <p class="doc-clause"><b>§ 2 Tätigkeit.</b> Der Arbeitnehmer wird als Disponent (Team Polen) eingestellt.</p>
        <p class="doc-clause"><b>§ 3 Arbeitsort.</b> ${ev('workplace', 'Arbeitsort ist der Hub Berlin-Marienfelde. Nach Absprache kann der Arbeitnehmer bis zu zwei Tage pro Woche mobil von Polen aus arbeiten.')}</p>
        <p class="doc-clause"><b>§ 4 Vergütung.</b> ${ev('salary', 'Der Arbeitnehmer erhält ein Bruttomonatsgehalt von EUR 4.300.')}</p>
        <p class="doc-clause"><b>§ 10 Kündigung.</b> Es gelten die gesetzlichen Kündigungsfristen.</p>
        <p class="doc-clause"><b>§ 12 Rechtswahl.</b> ${ev('choice', 'Auf dieses Arbeitsverhältnis findet polnisches Recht Anwendung.')}</p>
        <p class="doc-clause"><b>§ 13 Gerichtsstand.</b> ${ev('forum4', 'Gerichtsstand ist Szczecin.')}</p>
        <div class="doc-note">Vorlage einer polnischen Personalagentur, 2020. Keine weiteren Nachträge.</div>`,
      en: `<div class="doc-head"><div class="doc-org">EMPLOYMENT CONTRACT</div><div class="doc-sub">between Havel Logistik GmbH, Berlin (“Employer”) and Mr Kamil Sobczak, Szczecin (“Employee”) — translation</div></div>
        <p class="doc-clause"><b>§ 1 Start.</b> ${ev('tenure', 'Employment starts on 01.03.2020')} for an indefinite period.</p>
        <p class="doc-clause"><b>§ 2 Role.</b> The Employee is hired as a dispatcher (Poland team).</p>
        <p class="doc-clause"><b>§ 3 Place of work.</b> ${ev('workplace', 'The place of work is the Berlin-Marienfelde hub. By arrangement the Employee may work remotely from Poland up to two days a week.')}</p>
        <p class="doc-clause"><b>§ 4 Pay.</b> ${ev('salary', 'The Employee receives a gross monthly salary of EUR 4,300.')}</p>
        <p class="doc-clause"><b>§ 10 Termination.</b> The statutory notice periods apply.</p>
        <p class="doc-clause"><b>§ 12 Governing law.</b> ${ev('choice', 'This employment relationship is governed by Polish law.')}</p>
        <p class="doc-clause"><b>§ 13 Jurisdiction.</b> ${ev('forum4', 'Place of jurisdiction is Szczecin.')}</p>
        <div class="doc-note">Template from a Polish staffing agency, 2020. No amendments.</div>`,
    },
    kmail: {
      title: 'E-Mail „Kündigung“ — 29.03.2027, 22:14', short: 'Dismissal email', folder: 'Client documents', kind: 'mailprint', lang: true, langs: ['DE', 'EN'],
      pl: `<div class="mp-h"><b>Von:</b> Jens Pohl &lt;j.pohl@havel-logistik.de&gt; · Standortleiter Hub Berlin<br><b>An:</b> Kamil Sobczak<br><b>Gesendet:</b> Montag, 29.03.2027 22:14<br><b>Betreff:</b> Kündigung<br><b>Anhang:</b> Kuendigung_Sobczak.pdf (Scan)</div>
        <p>Hallo Kamil,</p><p>${ev('email', 'anbei deine Kündigung als PDF. Ein Original schicken wir nicht, bitte bestätige kurz den Empfang.')}</p><p>Jens</p>
        <div class="mp-q">Anhang, Seite 1 (eingescannt, Unterschrift J. Pohl):<br>„Sehr geehrter Herr Sobczak, hiermit kündigen wir das Arbeitsverhältnis ${ev('short', 'fristgerecht zum 30.04.2027')} aus betrieblichen Gründen.“</div>`,
      en: `<div class="mp-h"><b>From:</b> Jens Pohl · Site manager, Berlin hub<br><b>To:</b> Kamil Sobczak<br><b>Sent:</b> Monday, 29.03.2027 22:14<br><b>Subject:</b> Dismissal<br><b>Attachment:</b> Kuendigung_Sobczak.pdf (scan) — translation</div>
        <p>Hi Kamil,</p><p>${ev('email', 'attached is your notice of dismissal as a PDF. We won’t send an original; please confirm receipt.')}</p><p>Jens</p>
        <div class="mp-q">Attachment, page 1 (scanned, signed J. Pohl):<br>“Dear Mr Sobczak, we hereby terminate the employment relationship ${ev('short', 'with due notice to 30.04.2027')} for operational reasons.”</div>`,
    },
    br4: {
      title: 'Betriebsrat Hub Berlin — Antwort vom 31.03.2027', short: 'Works council email', folder: 'From the intake', kind: 'mailprint', lang: true, langs: ['DE', 'EN'],
      pl: `<div class="mp-h"><b>Von:</b> Dilek Aydın · Betriebsratsvorsitzende, Hub Berlin (140 Beschäftigte)<br><b>An:</b> Kamil Sobczak<br><b>Gesendet:</b> 31.03.2027 07:02<br><b>Betreff:</b> AW: Meine Kündigung</div>
        <p>Lieber Kamil,</p><p>${ev('nohearing', 'der Betriebsrat ist zu deiner Kündigung nicht angehört worden. Wir haben davon erst durch dich erfahren.')}</p><p>Wir sprechen das in der nächsten Sitzung an. Lass dich beraten, und zwar schnell.</p><p>Viele Grüße<br>Dilek</p>`,
      en: `<div class="mp-h"><b>From:</b> Dilek Aydın · Works council chair, Berlin hub (140 employees)<br><b>To:</b> Kamil Sobczak<br><b>Sent:</b> 31.03.2027 07:02<br><b>Subject:</b> RE: My dismissal — translation</div>
        <p>Dear Kamil,</p><p>${ev('nohearing', 'the works council was not heard about your dismissal. We only found out from you.')}</p><p>We will raise it at the next meeting. Get advice, and quickly.</p><p>Best<br>Dilek</p>`,
    },
    zeit4: {
      title: 'Zeiterfassung Q1/2027 — K. Sobczak', short: 'Time records', folder: 'From the intake', kind: 'form',
      en: `<div class="doc-head"><div class="doc-org">ZEITERFASSUNG · Q1 2027</div><div class="doc-sub">Havel Logistik GmbH · Export aus dem Mitarbeiterportal</div></div>
        <table class="form-t"><tr><th>Monat</th><th>Hub Berlin</th><th>Mobil (PL)</th><th>Anteil Berlin</th></tr>
        <tr><td>Januar</td><td>12 Tage</td><td>8 Tage</td><td>60 %</td></tr><tr><td>Februar</td><td>12 Tage</td><td>8 Tage</td><td>60 %</td></tr><tr><td>März</td><td>13 Tage</td><td>9 Tage</td><td>59 %</td></tr></table>
        <div class="doc-note">${ev('split', 'Muster seit 2021: Montag bis Mittwoch im Hub Berlin, Donnerstag und Freitag mobil aus Szczecin.')} <br>(Pattern since 2021: Monday–Wednesday at the Berlin hub, Thursday–Friday remote from Szczecin.)</div>`,
    },
    mlw: {
      title: 'Mindestlohn — E-Mails vom 02. und 03.03.2027', short: 'Minimum-wage emails', folder: 'From the intake', kind: 'mailprint', lang: true, langs: ['DE', 'EN'],
      pl: `<div class="mp-h"><b>Von:</b> Sabine Wolter · Leiterin Personal<br><b>An:</b> Kamil Sobczak<br><b>Gesendet:</b> 03.03.2027 08:15<br><b>Betreff:</b> AW: Mindestlohn Fahrer Touren Berlin</div>
        <p>Herr Sobczak,</p><p>das ist nicht Ihre Aufgabe. Bitte unterlassen Sie solche E-Mails.</p><p>S. Wolter</p>
        <div class="mp-q">&gt; Von: Kamil Sobczak · 02.03.2027 19:40<br>&gt; Frau Wolter, ${ev('complaint', 'unsere polnischen Fahrer auf den innerdeutschen Touren ab Berlin bekommen weniger als den gesetzlichen Mindestlohn. Ich habe die Abrechnungen gesehen. Bitte prüfen Sie das.')}</div>`,
      en: `<div class="mp-h"><b>From:</b> Sabine Wolter · Head of HR<br><b>To:</b> Kamil Sobczak<br><b>Sent:</b> 03.03.2027 08:15<br><b>Subject:</b> RE: Minimum wage, drivers on Berlin routes — translation</div>
        <p>Mr Sobczak,</p><p>this is not your job. Please stop sending such emails.</p><p>S. Wolter</p>
        <div class="mp-q">&gt; From: Kamil Sobczak · 02.03.2027 19:40<br>&gt; Ms Wolter, ${ev('complaint', 'our Polish drivers on domestic German routes out of Berlin are paid less than the statutory minimum wage. I have seen the payslips. Please look into it.')}</div>`,
    },
    notes4: {
      title: 'Notatki Kamila — kto został', short: 'Kamil’s notes', folder: 'From the intake', kind: 'paper', lang: true,
      pl: `<div class="doc-head"><div class="doc-org">NOTATKI — K. SOBCZAK</div><div class="doc-sub">zdjęcie kartki z notesu · 12.04.2027</div></div>
        <p class="doc-clause">Dyspozytorzy w hubie: 4 osoby. Zwolniony tylko ja.</p>
        <p class="doc-clause">${ev('sozial', 'Zostaje M. Schulz — 26 lat, w firmie 2 lata, bez dzieci. Ja: 38 lat, 7 lat w firmie, dwoje dzieci.')}</p>
        <p class="doc-clause">Mój zakres (Team Polen) przejęła agencja z Poznania?</p>`,
      en: `<div class="doc-head"><div class="doc-org">NOTES — K. SOBCZAK</div><div class="doc-sub">photo of a notebook page · 12.04.2027 — translation</div></div>
        <p class="doc-clause">Dispatchers at the hub: 4. Only I was dismissed.</p>
        <p class="doc-clause">${ev('sozial', 'M. Schulz stays — 26, two years with the company, no children. Me: 38, seven years, two children.')}</p>
        <p class="doc-clause">My work (Poland team) taken over by an agency in Poznań?</p>`,
    },
  });

  // documents available on the laptop: base + what the intake uncovered
  F.ch4Docs = () => {
    const f = F.state.flags;
    return [
      ['memo', 'Klage — Entwurf (Arbeitsgericht Berlin)', 'Your work product', 'MEMO'],
      ['av4', 'Arbeitsvertrag_Sobczak_2020.pdf', 'Client documents', 'PDF'],
      ['kmail', 'Kuendigung_2027-03-29.eml', 'Client documents', 'EML'],
    ].concat(f.i4_where ? [['zeit4', 'Zeiterfassung_Q1_2027.pdf', 'From the intake', 'PDF']] : [])
      .concat(f.i4_br ? [['br4', 'AW_Meine_Kuendigung_BR.eml', 'From the intake', 'EML']] : [])
      .concat(f.i4_before ? [['mlw', 'Mindestlohn_Fahrer_Maerz.eml', 'From the intake', 'EML']] : [])
      .concat(f.i4_who ? [['notes4', 'Notatki_Kamil.jpg', 'From the intake', 'JPG']] : []);
  };

  F.WORK4 = {
    key: 'ch4', ch: 4, flag: 'memo4Sent', folder: 'Your work product · for Dr. Wendt to sign', send: 'Send to Dr. Wendt',
    lh: 'Berlin office · Friedrichstraße 88 · 10117 Berlin',
    title: 'Klage — Sobczak ./. Havel Logistik GmbH',
    heading: 'KLAGE <span>/ STATEMENT OF CLAIM — draft</span>',
    meta: '<div><b>An das</b> Arbeitsgericht Berlin</div><div><b>Kläger</b> Kamil Sobczak, Szczecin</div><div><b>Beklagte</b> Havel Logistik GmbH, Berlin</div><div><b>wegen</b> Kündigungsschutz</div>',
    extra: '<div class="memo-antrag"><b>Antrag</b> — Wir beantragen, festzustellen, dass das Arbeitsverhältnis der Parteien durch die Kündigung vom 29.03.2027 nicht aufgelöst worden ist.<span class="m-gloss">We ask the court to declare that the employment relationship was not ended by the notice of 29.03.2027 — the standard wording of a claim under §4 KSchG.</span></div>',
    qs: [
      { id: 'frist', q: '1 · Frist — by when must we file?', hint: 'Email 29.03.2027 · Arbeitsvertrag §1',
        opts: [
          { t: 'No hurry. An email is not a valid notice, so no deadline runs.', ok: false, why: 'Probably true in law — the three weeks of §4 KSchG run from receipt of a written notice — but you never stake a client’s case on a deadline not running. File within three weeks anyway.' },
          { t: 'By Monday 19 April — three weeks from receipt (§4 KSchG; the Polish 21 days of art. 264 KP land on the same day). We file even though the email is void.', ok: true, why: 'Right. If the claim is late, the notice is treated as valid from the start (§7 KSchG): the works-council and social-selection points would be lost with it.' },
          { t: 'Within three months — the usual limitation period for employment claims.', ok: false, why: 'There is no such general rule. The three-week deadline of §4 KSchG is short and strict.' },
        ], support: ['email', 'tenure'] },
      { id: 'recht', q: '2 · Anwendbares Recht — which law?', hint: 'Arbeitsvertrag §3, §12 · time records',
        opts: [
          { t: 'Polish law — the contract chooses it, so the German Kündigungsschutzgesetz does not apply.', ok: false, why: 'The choice is valid, but under art. 8(1) Rome I it cannot take away the mandatory protection of the law that would apply without it — here German law, where he habitually works.' },
          { t: 'German law entirely — a choice of Polish law is invalid for work done in Germany.', ok: false, why: 'Too strong. The choice stays valid; German mandatory rules apply on top of it, and Polish law still applies where it is more favourable.' },
          { t: 'The choice of Polish law is valid, but under art. 8 Rome I it cannot deprive him of the mandatory protection of the law of his habitual place of work: Berlin, three days out of five (for work in several states the CJEU looks to where the bulk of the work is done — Koelzsch, C-29/10). So the KSchG, §623 BGB and §102 BetrVG protect him; Polish law applies where it is more favourable.', ok: true, why: 'Right. Choice of law + mandatory protection of the habitual workplace, compared point by point.' },
        ], support: ['choice', 'workplace', 'split'] },
      { id: 'gericht', q: '3 · Gericht — which court?', hint: 'Arbeitsvertrag §13',
        opts: [
          { t: 'Only Szczecin — the contract says so.', ok: false, why: 'A forum clause agreed before the dispute cannot take away the employee’s options; it can only add one (art. 23 Brussels I bis).' },
          { t: 'Berlin — the employer’s seat and his habitual place of work (art. 21 Brussels I bis). The Szczecin clause only adds an option for him (art. 23). We file at the Arbeitsgericht Berlin, where the KSchG is applied every day.', ok: true, why: 'Right. The employee can choose; the employer could only sue him in Poland, where he lives (art. 22).' },
          { t: 'Berlin, because German courts always hear cases against German companies’ employees.', ok: false, why: 'Right court, wrong reason. Jurisdiction comes from Brussels I bis: the employer’s domicile and the habitual place of work.' },
        ], support: ['forum4', 'workplace'] },
      { id: 'gruende', q: '4 · Why is the dismissal invalid?', hint: 'Email · works council · colleagues · March emails',
        opts: [
          { t: 'The notice is effective but defective — as in Poland, he can claim compensation.', ok: false, why: 'That is the Polish logic (a notice without written form is still effective; the employee claims under art. 45 KP). In German law a notice without written form is void (§623 BGB).' },
          { t: 'Void for lack of written form — an email with a scan is not Schriftform (§623 BGB). Void because the works council was not heard (§102(1) BetrVG). Not socially justified without a proper social selection (§1(3) KSchG). The notice period is too short in any case — two months to the end of a month after seven years (§622(2) BGB). And the timing suggests victimisation for his minimum-wage complaint (§612a BGB).', ok: true, why: 'Right. Two grounds each make it void; the rest build leverage.' },
          { t: 'Only the notice period is wrong, so employment simply ends a month later.', ok: false, why: 'The form and works-council defects make the notice void, not just late.' },
        ], support: ['email', 'nohearing', 'sozial', 'complaint', 'short', 'tenure'] },
      { id: 'kosten', q: '5 · Costs and the goal — what do you tell Kamil?', hint: 'Arbeitsvertrag §4 · what he told you',
        opts: [
          { t: 'If we win, Havel pays all our fees.', ok: false, why: 'Not at first instance before German labour courts: each side bears its own lawyer’s fees, win or lose (§12a ArbGG). He must hear that before he instructs you.' },
          { t: 'At first instance each side bears its own lawyer’s fees, win or lose (§12a ArbGG), and court fees fall away if we settle. Realistic goal: a settlement — a proper end date, severance, paid garden leave, a good reference. Benchmark: half a gross monthly salary per year of service; our points justify more.', ok: true, why: 'Right. The benchmark is a rule of thumb, not a statute — leverage moves it.' },
          { t: 'Aim for reinstatement at any cost.', ok: false, why: 'He told you he does not want to go back. The claim protects his position; the goal is his, not yours.' },
        ], support: ['salary', 'tenure'] },
    ],
  };
  F.openMemo4 = () => F.workMemo(F.WORK4);
})(window.F);
