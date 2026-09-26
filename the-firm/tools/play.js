// Scripted playthrough with screenshots. usage: node tools/play.js <outdir>
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const path = require('path');
(async () => {
  const out = process.argv[2];
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const p = await b.newPage({ viewport: { width: 1600, height: 900 }, ignoreHTTPSErrors: true });
  const logs = [];
  p.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') logs.push(m.type() + ': ' + m.text()); });
  p.on('pageerror', (e) => logs.push('PAGEERROR: ' + e.message));
  const url = 'file://' + path.resolve(__dirname, '../index.html');
  await p.goto(url);
  let n = 0;
  const shot = async (name) => { await p.screenshot({ path: `${out}/${String(++n).padStart(2, '0')}_${name}.png` }); };
  const W = (ms) => p.waitForTimeout(ms);
  await W(1200); await shot('title');
  await p.mouse.click(800, 450);
  await W(4200); await shot('card_munich');
  await W(5000); await shot('munich_wide');
  await W(5200); await shot('tower_mid');
  await W(4200); await shot('tower_title');
  await W(4400); await shot('lobby');
  await W(6200); await shot('elevator');
  await W(4500); await shot('office_arrive');
  await W(6000); await shot('office_phone');
  console.log(logs.join('\n'));
  await b.close();
})();
