// usage: node tools/act.js <url-query> <outdir> '<json steps>'
// steps: {w:ms} {c:[x,y]} {k:'Key'} {s:'name'} {e:'js'}
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const path = require('path');
(async () => {
  const [q, out, stepsJson, vw = '1600', vh = '900'] = process.argv.slice(2);
  const steps = JSON.parse(stepsJson);
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const p = await b.newPage({ viewport: { width: +vw, height: +vh }, ignoreHTTPSErrors: true });
  const logs = [];
  p.on('console', (m) => { if (m.type() === 'error' && !/ERR_TOO_MANY|ERR_CERT/.test(m.text())) logs.push('console: ' + m.text()); });
  p.on('pageerror', (e) => logs.push('PAGEERROR: ' + e.message));
  await p.goto('file://' + path.resolve(__dirname, '../index.html') + q);
  for (const st of steps) {
    if (st.w) await p.waitForTimeout(st.w);
    if (st.c) await p.mouse.click(st.c[0], st.c[1]);
    if (st.m) await p.mouse.move(st.m[0], st.m[1]);
    if (st.k) await p.keyboard.press(st.k);
    if (st.e) { const r = await p.evaluate(st.e); if (r !== undefined) console.log('eval:', JSON.stringify(r)); }
    if (st.s) await p.screenshot({ path: `${out}/${st.s}.png` });
  }
  if (logs.length) console.log(logs.join('\n'));
  await b.close();
})();
