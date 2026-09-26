const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const path = require('path');
(async () => {
  const scenes = process.argv.slice(2);
  const b = await chromium.launch({ args: ['--enable-gpu-rasterization'] });
  for (const sc of scenes) {
    const p = await b.newPage({ viewport: { width: 1600, height: 900 }, ignoreHTTPSErrors: true });
    await p.goto('file://' + path.resolve(__dirname, '../index.html') + '?' + sc);
    await p.waitForTimeout(2500);
    const r = await p.evaluate(() => new Promise((res) => {
      const s = F.scene; const orig = s.draw.bind(s); const times = [];
      s.draw = (g, dt, t) => { const a = performance.now(); orig(g, dt, t); F.post(g, dt); times.push(performance.now() - a); };
      setTimeout(() => { times.sort((a, b) => a - b); res({ n: times.length, med: times[times.length >> 1].toFixed(1), p90: times[(times.length * 0.9) | 0].toFixed(1) }); }, 3000);
    }));
    console.log(sc.padEnd(34), JSON.stringify(r));
    await p.close();
  }
  await b.close();
})();
