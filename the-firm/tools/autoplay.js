// usage: node tools/autoplay.js <chapter> <outdir> [picks] [memo]
// Plays a chapter end to end with dialogue auto-advanced. picks: comma list of choice indexes (default: first enabled),
// memo: 'right' | 'wrong' (answers the work product), all evidence for the chapter is marked found.
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const path = require('path');
(async () => {
  const [ch, out, picks = '', memo = 'right'] = process.argv.slice(2);
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const p = await b.newPage({ viewport: { width: 1600, height: 900 }, ignoreHTTPSErrors: true });
  const logs = [];
  p.on('console', (m) => { if (/^(AP|console)/.test(m.text()) || m.type() === 'error') { if (!/ERR_TOO_MANY|ERR_CERT/.test(m.text())) logs.push(m.text()); } });
  p.on('pageerror', (e) => logs.push('PAGEERROR: ' + e.message));
  await p.goto('file://' + path.resolve(__dirname, '../index.html') + '?scene=void');
  await p.waitForTimeout(800);
  await p.evaluate(({ ch, picks, memo }) => {
    const F = window.F, seq = picks ? picks.split(',').map(Number) : [];
    let n = 0;
    F.ui.say = async (who, text) => { console.log('AP say ' + (who || '—') + ': ' + text.replace(/<[^>]+>/g, '').slice(0, 90)); await new Promise((r) => setTimeout(r, 30)); };
    F.ui.choose = async (opts) => {
      if (!opts.some((o) => !o.disabled)) console.log('AP SOFTLOCK: all options disabled');
      let i = seq.length > n ? seq[n] : opts.findIndex((o) => !o.disabled); n++;
      if (!opts[i] || opts[i].disabled) i = opts.findIndex((o) => !o.disabled);
      console.log('AP choose ' + i + '/' + opts.length + ': ' + opts[i].text.replace(/<[^>]+>/g, '').slice(0, 70));
      return i;
    };
    F.ui.card = async () => {}; F.ui.incomingCall = async () => {};
    const W = { 3: F.WORK3, 4: F.WORK4 }[ch];
    F.state.chapter = +ch;
    F.story[ 'x' ] = 1;
    F['story' + ch].start();
    const findAll = () => Object.keys(F.EVIDENCE).filter((k) => F.EVIDENCE[k].ch === +ch).forEach((k) => (F.state.findings[k] = true));
    const fill = () => { findAll(); F.state['ch' + ch].memo = {}; W.qs.forEach((Q) => { const i = Q.opts.findIndex((o) => (memo === 'right' ? o.ok : !o.ok)); F.state['ch' + ch].memo[Q.id] = { opt: i, sup: Q.support[0] }; }); };
    const poll = setInterval(() => {
      if (+ch === 3 && F.state.stage === 'c3_brief' && F.flag('c3call') && F.scene && F.scene.name === 'office' && !F.inputLocked) { clearInterval(poll); fill(); console.log('AP memo sent'); F.emit('memo3:sent'); }
      if (+ch === 4 && F.state.stage === 'c4_train' && F.scene && F.scene.name === 'train' && !F.inputLocked) { clearInterval(poll); ['where', 'br', 'before', 'who'].forEach((k) => F.flag('i4_' + k, true)); fill(); console.log('AP memo sent'); F.emit('memo4:sent'); }
    }, 300);
  }, { ch, picks, memo });
  for (let i = 0; i < 40; i++) {
    await p.waitForTimeout(5000);
    const done = await p.evaluate(() => !!document.querySelector('.chapter-end'));
    if (done) break;
  }
  await p.screenshot({ path: `${out}/ap_ch${ch}_end.png` });
  await p.evaluate(() => { const b = document.querySelector('.ce-notes-btn'); if (b) b.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); });
  await p.waitForTimeout(1200);
  await p.screenshot({ path: `${out}/ap_ch${ch}_notes.png` });
  console.log(logs.join('\n'));
  await b.close();
})();
