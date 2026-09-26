// usage: node tools/shot.js <url> <out.png> [waitMs] [w] [h] [jsBeforeShot]
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async () => {
  const [url, out, wait = '1500', w = '1920', h = '1080', js] = process.argv.slice(2);
  const b = await chromium.launch({ args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--autoplay-policy=no-user-gesture-required'] });
  const p = await b.newPage({ viewport: { width: +w, height: +h }, ignoreHTTPSErrors: true });
  const logs = [];
  p.on('console', (m) => logs.push(m.type() + ': ' + m.text()));
  p.on('pageerror', (e) => logs.push('PAGEERROR: ' + e.message));
  await p.goto(url);
  if (js) { await p.waitForTimeout(300); await p.evaluate(js); }
  await p.waitForTimeout(+wait);
  await p.screenshot({ path: out });
  if (logs.length) console.log(logs.join('\n'));
  await b.close();
})();
