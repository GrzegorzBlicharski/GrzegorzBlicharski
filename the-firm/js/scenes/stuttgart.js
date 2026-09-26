/* THE FIRM — Stuttgart: the valley at dusk in snow, and the Vogt & Keller meeting room above the stopped line. */
(function (F) {
  'use strict';
  const U = F.U, G = F.gfx;
  const VW = F.VW, VH = F.VH;

  // hill silhouette with house lights, snow patches and vineyard terraces
  function paintHill(g, pts, r, o) {
    g.save();
    g.beginPath(); g.moveTo(pts[0][0], 1200); pts.forEach((p) => g.lineTo(p[0], p[1])); g.lineTo(pts[pts.length - 1][0], 1200); g.closePath();
    const hg = g.createLinearGradient(0, 300, 0, 900);
    hg.addColorStop(0, o.top); hg.addColorStop(1, o.bottom);
    g.fillStyle = hg; g.fill();
    g.clip();
    // vineyard terraces
    g.strokeStyle = 'rgba(210,220,240,0.06)'; g.lineWidth = 1.5;
    for (let k = 0; k < 26; k++) { const y = 380 + k * 18; g.beginPath(); g.moveTo(o.x0, y + (k % 3) * 4); g.bezierCurveTo(o.x0 + 300, y - 10, o.x1 - 300, y + 14, o.x1, y); g.stroke(); }
    // snow patches
    for (let k = 0; k < 140; k++) { g.fillStyle = `rgba(215,225,240,${0.05 + r() * 0.08})`; g.beginPath(); g.ellipse(o.x0 + r() * (o.x1 - o.x0), 360 + r() * 520, 20 + r() * 60, 4 + r() * 6, 0, 0, U.TAU); g.fill(); }
    // house lights, denser lower down
    for (let k = 0; k < o.n; k++) {
      const x = o.x0 + r() * (o.x1 - o.x0), y = 380 + Math.pow(r(), 0.7) * 540;
      g.fillStyle = r() < 0.8 ? `rgba(255,${180 + r() * 50 | 0},110,${0.35 + r() * 0.55})` : `rgba(210,225,255,${0.3 + r() * 0.4})`;
      g.fillRect(x, y, 2 + r() * 2, 2 + r() * 2);
    }
    g.restore();
  }

  // ------------------------------------------------------------------ STUTTGART ESTABLISHING — 18:40, snow
  F.defineScene('stuttgart_wide', {
    enter() {
      const q = F.quality();
      const r = U.rng(91);
      this.lights = [];
      this.hills = F.offscreen(VW + 600, 1200, q * 0.8, (g) => {
        g.translate(300, 0);
        const ridge = (x0, x1, f) => { const pts = []; for (let x = x0; x <= x1; x += 20) pts.push([x, f(x) + Math.sin(x * 0.011) * 14 + Math.sin(x * 0.037) * 5]); return pts; };
        const lf = (x) => (x < 350 ? 436 + (350 - x) * 0.06 : 430 + 340 * Math.pow(U.clamp((x - 350) / 730, 0, 1), 1.6));
        paintHill(g, ridge(-300, 1080, lf), r, { top: '#1a1d28', bottom: '#0c0d12', x0: -300, x1: 1080, n: 1100 });
        paintHill(g, ridge(820, 2300, (x) => 470 + 300 * Math.pow(1 - U.smooth(U.clamp((x - 860) / 1100, 0, 1)), 1.3)), r, { top: '#171a24', bottom: '#0b0c10', x0: 820, x1: 2300, n: 1100 });
        // the TV tower on the left hill, forest line around its foot
        G.lm.tvTower(350, 300, 'rgb(46,50,64)', 1.1, this.lights).draw(g, 436, r);
        g.fillStyle = '#0b0c11'; for (let k = 0; k < 44; k++) { const x = 200 + k * 7, y = lf(x) + 4 + Math.abs(Math.sin(k)) * 4; g.beginPath(); g.moveTo(x - 6, y + 10); g.lineTo(x, y - 12); g.lineTo(x + 6, y + 10); g.fill(); }
      });
      const win = { lit: 0.3, warm: [255, 196, 120], wa: 0.85, cw: 3, ch: 4, gx: 4, gy: 5 };
      this.city = G.skyline({ w: VW + 800, h: 1100, base: 860, seed: 93, minW: 34, maxW: 100, minH: 26, maxH: 110, gap: 8, pitched: 0.7, body: 'rgb(18,20,27)', edge: 'rgba(230,236,246,0.6)', win, fog: [50, 56, 72], fogBottom: 0.3, q: q * 0.75,
        landmarks: [G.lm.church(700, 150, 'rgb(20,22,28)', 1.3), G.lm.church(760, 110, 'rgb(20,22,28)', 1.1), G.lm.glassTower(1080, 70, 190, 'rgb(18,20,27)', win, this.lights), G.lm.glassTower(520, 56, 150, 'rgb(18,20,27)', win, this.lights)],
        groundGlow: [255, 170, 90], groundGlowA: 0.45, below: 'rgb(14,15,20)' });
      // the Vogt & Keller plant: sawtooth halls, clerestory light, logo, chimney
      this.plant = F.offscreen(1200, 500, q * 0.9, (g) => {
        g.fillStyle = '#0d0f14'; g.fillRect(0, 220, 1200, 280);
        for (let k = 0; k < 12; k++) {
          const x = k * 100;
          g.beginPath(); g.moveTo(x, 220); g.lineTo(x + 70, 160); g.lineTo(x + 70, 220); g.closePath(); g.fillStyle = '#10131a'; g.fill();
          g.fillStyle = 'rgba(210,230,255,0.75)'; g.beginPath(); g.moveTo(x + 64, 170); g.lineTo(x + 70, 166); g.lineTo(x + 70, 218); g.lineTo(x + 64, 218); g.fill();
          g.fillStyle = 'rgba(236,240,248,0.8)'; g.beginPath(); g.moveTo(x, 220); g.lineTo(x + 70, 160); g.lineTo(x + 70, 164); g.lineTo(x + 4, 222); g.fill(); // snow on the roof
        }
        for (let k = 0; k < 30; k++) { g.fillStyle = `rgba(200,220,255,${0.3 + (k % 3) * 0.15})`; g.fillRect(20 + k * 39, 300, 24, 14); }
        g.font = '600 38px "Barlow Condensed", sans-serif'; g.textAlign = 'left';
        g.shadowColor = 'rgba(90,150,255,0.9)'; g.shadowBlur = 18; g.fillStyle = '#d6e6ff';
        g.fillText('VOGT & KELLER', 60, 272); g.shadowBlur = 0;
        g.fillStyle = '#0b0d12'; g.fillRect(1080, 40, 26, 200);
      });
      this.snow = new G.Snow(700, { speed: 80, wind: 50, size: 2.4 });
      this.snowNear = new G.Snow(60, { speed: 160, wind: 80, size: 5, alpha: 0.6 });
      this.steam = [];
      F.camSet(VW / 2 - 60, VH / 2 + 20, 1.0); F.cam.par = 14; F.cam.drift = 0.6;
      F.grade.tint = [90, 110, 170]; F.grade.tintA = 0.3; F.grade.vignette = 0.66;
      F.audio.mix({ city: 0.28, hvac: 0.18, pad: 0.4 }, 2);
      F.audio.chord('tense');
    },
    start() { F.camTween({ x: VW / 2 + 90, y: VH / 2 + 30, z: 1.1 }, 9, U.easeInOut); },
    update(dt, t) {
      this.snow.update(dt, t); this.snowNear.update(dt, t);
      if (Math.random() < dt * 6) this.steam.push({ x: 0, y: 0, a: 1, s: 1 });
      this.steam.forEach((p) => { p.y -= 40 * dt; p.x += 22 * dt; p.s += dt * 0.9; p.a -= dt * 0.18; });
      this.steam = this.steam.filter((p) => p.a > 0);
    },
    draw(g, dt, t) {
      F.layer(0.02, 0.1);
      const sky = g.createLinearGradient(0, -200, 0, 900);
      sky.addColorStop(0, '#0b0d18'); sky.addColorStop(0.5, '#262a42'); sky.addColorStop(1, '#5a5870');
      g.fillStyle = sky; g.fillRect(-400, -400, VW + 800, VH + 800);
      G.glow(g, 960, 820, 900, [255, 160, 90], 0.12);
      F.layer(0.08, 0.2);
      g.drawImage(this.hills, -300, 0, this.hills.vw, this.hills.vh);
      G.drawLights(g, this.lights, t, -300, 0);
      F.layer(0.14, 0.35);
      g.drawImage(this.city.canvas, -400, 0, this.city.canvas.vw, this.city.canvas.vh);
      // the plant, lower right, with steam from its chimney
      F.layer(0.22, 0.5);
      g.drawImage(this.plant, 1020, 560, 1200, 500);
      this.steam.forEach((p) => { g.fillStyle = `rgba(200,210,230,${0.12 * p.a})`; g.beginPath(); g.arc(1020 + 1093 + p.x, 590 + p.y, 18 * p.s, 0, U.TAU); g.fill(); });
      G.glow(g, 1400, 820, 400, [120, 170, 255], 0.1);
      F.screen();
      this.snow.draw(g);
      this.snowNear.draw(g, 0.7);
      const mist = g.createLinearGradient(0, 760, 0, 1080);
      mist.addColorStop(0, 'rgba(120,130,160,0)'); mist.addColorStop(1, 'rgba(40,44,60,0.45)');
      g.fillStyle = mist; g.fillRect(0, 760, VW, 320);
    },
    exit() { F.grade.tintA = 0; },
  });

  // ------------------------------------------------------------------ VOGT & KELLER — meeting room above line 3
  const W = { x0: 260, x1: 1660, y0: 80, y1: 600 };
  F.defineScene('vk_room', {
    enter(o) {
      const q = F.quality();
      this.hall = F.offscreen(VW + 400, 900, q * 0.8, (g) => { g.translate(200, 0); paintHall(g); });
      this.room = F.offscreen(VW + 500, VH + 300, q, (g) => { g.translate(250, 150); paintRoom(g); });
      this.table = F.offscreen(VW + 600, 700, q, (g) => { g.translate(300, 0); paintTable(g); });
      this.cast = {
        hartmann: { expr: 'cold', turn: 0.45 },
        lehmann: { expr: 'impatient', turn: -0.35, pose: 'crossed' },
        wendt: { expr: 'neutral', turn: -0.4 },
        wrobel: { expr: 'pressure', turn: -0.3 },
      };
      this.shots = {
        wide: { x: VW / 2, y: VH / 2, z: 1 },
        hartmann: { x: 600, y: 690, z: 1.9 },
        lehmann: { x: 1300, y: 390, z: 1.9 },
        wendt: { x: 1340, y: 690, z: 1.9 },
        wrobel: { x: 1560, y: 730, z: 1.8 },
        hall: { x: 960, y: 330, z: 1.4 },
        part: { x: 960, y: 800, z: 2.2 },
      };
      const s0 = this.shots[(o && o.shot) || 'wide'];
      F.camSet(s0.x, s0.y, s0.z); F.cam.par = 14; F.cam.drift = 0.7;
      F.grade.tint = [110, 130, 170]; F.grade.tintA = 0.22; F.grade.vignette = 0.62;
      this.downtime = 6 * 86400 + 12 * 3600 + 18 * 60 + 40; // since 06.01, 06:12
      F.audio.mix({ room: 0.22, hvac: 0.2, pad: 0.45 }, 2);
      F.audio.chord('tense');
      this.beepT = 0;
    },
    shot(name, dur) { const s = this.shots[name]; return F.camTween({ x: s.x, y: s.y, z: s.z }, dur == null ? 1.4 : dur, U.easeInOut); },
    cut(name) { const s = this.shots[name]; F.camSet(s.x, s.y, s.z); },
    update(dt, t) {
      this.downtime += dt;
      this.beepT += dt;
      if (this.beepT > 2.4) { this.beepT = 0; F.audio.tone(740, 0.12, 0.006, 'square'); }
    },
    draw(g, dt, t) {
      // the production hall beyond the glass
      F.layer(0.45, 0.6);
      g.drawImage(this.hall, -200, 0, this.hall.vw, this.hall.vh);
      // andon beacons turning orange, and the downtime board
      [[420, 300], [860, 290], [1290, 300], [1640, 310]].forEach(([x, y], i) => {
        const a = 0.5 + 0.5 * Math.sin(t * 5 + i);
        g.fillStyle = '#ff8a1e'; g.fillRect(x - 5, y - 10, 10, 12);
        G.glow(g, x, y - 4, 60, [255, 140, 40], 0.35 + a * 0.5);
        const sweep = (t * 3 + i) % U.TAU;
        g.save(); g.globalCompositeOperation = 'lighter';
        const bx = Math.cos(sweep) * 220;
        const bg = g.createLinearGradient(x, y, x + bx, y + 40);
        bg.addColorStop(0, 'rgba(255,150,50,0.25)'); bg.addColorStop(1, 'rgba(255,150,50,0)');
        g.fillStyle = bg; g.beginPath(); g.moveTo(x, y - 4); g.lineTo(x + bx, y - 30); g.lineTo(x + bx, y + 60); g.closePath(); g.fill();
        g.restore();
      });
      // the room
      F.layer(0.6, 0.75);
      g.drawImage(this.room, -250, -150, this.room.vw, this.room.vh);
      const d = Math.floor(this.downtime), dd = Math.floor(d / 86400), hh = Math.floor((d % 86400) / 3600), mm = Math.floor((d % 3600) / 60), ss = d % 60;
      g.fillStyle = '#050607'; g.fillRect(752, 132, 416, 118); g.strokeStyle = '#1b1d22'; g.lineWidth = 6; g.strokeRect(752, 132, 416, 118); g.fillStyle = '#0a0b0e'; g.fillRect(956, 60, 8, 72);
      g.fillStyle = '#ff3b2f'; g.font = '600 20px "IBM Plex Mono", monospace'; g.textAlign = 'center';
      g.fillText('LINIE 3 — STILLSTAND', 960, 180);
      g.font = '500 40px "IBM Plex Mono", monospace';
      g.fillText(`${dd}T ${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`, 960, 228);
      G.glow(g, 960, 200, 240, [255, 50, 40], 0.18);
      // Lehmann at the glass, backlit by the hall
      F.layer(1);
      const c = this.cast;
      F.people.draw(g, F.people.cast.lehmann, 1310, 700, 470, { pose: c.lehmann.pose, turn: c.lehmann.turn, expr: c.lehmann.expr, talking: F.ui.speaking === 'lehmann', lookX: -0.6,
        light: { key: [255, 220, 190], keyA: 0.4, dir: -1, amb: [56, 60, 72], rim: [255, 170, 90], rimA: 1, rimSide: 1 } });
      // Hartmann seated at the left side of the table
      F.people.draw(g, F.people.cast.hartmann, 560, 1330, 820, { crop: 'bust', pose: 'steeple', turn: c.hartmann.turn, expr: c.hartmann.expr, talking: F.ui.speaking === 'hartmann', lookX: 0.8,
        light: { key: [236, 240, 250], keyA: 0.85, dir: 1, amb: [64, 66, 78], rim: [255, 170, 90], rimA: 0.6, rimSide: -1 } });
      // Wendt and Wróbel seated on the right
      F.people.draw(g, F.people.cast.wendt, 1370, 1330, 820, { crop: 'bust', pose: 'desk', turn: c.wendt.turn, expr: c.wendt.expr, talking: F.ui.speaking === 'wendt', lookX: -0.8, slot: 'vk',
        light: { key: [236, 240, 250], keyA: 0.8, dir: -1, amb: [62, 64, 76], rim: [255, 170, 90], rimA: 0.7, rimSide: 1 } });
      F.people.draw(g, F.people.cast.wrobel, 1600, 1500, 960, { crop: 'bust', pose: 'desk', turn: c.wrobel.turn, expr: c.wrobel.expr, talking: F.ui.speaking === 'wrobel', lookX: -0.8,
        light: { key: [236, 240, 250], keyA: 0.75, dir: -1, amb: [62, 64, 76], rim: [255, 170, 90], rimA: 0.6, rimSide: 1 } });
      // table (foreground)
      F.layer(1.05);
      g.drawImage(this.table, -300, 480, this.table.vw, this.table.vh);
    },
    exit() { F.grade.tintA = 0; },
  });

  function paintHall(g) {
    // high bay, seen from the mezzanine: cold bay lights in rows, machines, yellow lanes, idle conveyor
    const bg = g.createLinearGradient(0, 0, 0, 900);
    bg.addColorStop(0, '#12151c'); bg.addColorStop(0.6, '#1d222c'); bg.addColorStop(1, '#0c0e12');
    g.fillStyle = bg; g.fillRect(-200, 0, VW + 400, 900);
    // roof trusses
    g.strokeStyle = 'rgba(40,46,58,0.9)'; g.lineWidth = 3;
    for (let k = 0; k < 14; k++) { const x = -200 + k * 170; g.beginPath(); g.moveTo(x, 0); g.lineTo(960 + (x - 960) * 0.3, 260); g.stroke(); }
    // bay lights in perspective rows
    for (let row = 0; row < 4; row++) for (let k = 0; k < 12; k++) {
      const y = 70 + row * 55, sc = 0.5 + row * 0.25, x = 960 + (k - 5.5) * 160 * sc;
      g.fillStyle = 'rgba(235,242,255,0.95)'; g.fillRect(x - 14 * sc, y, 28 * sc, 5 * sc);
      G.glow(g, x, y + 3, 70 * sc, [220, 232, 255], 0.22);
    }
    // floor with yellow lanes
    g.fillStyle = '#23272f'; g.fillRect(-200, 440, VW + 400, 460);
    g.fillStyle = 'rgba(240,200,40,0.55)';
    [[-200, 520], [-200, 700]].forEach(([x, y]) => g.fillRect(x, y, VW + 400, 6));
    for (let k = 0; k < 30; k++) g.fillRect(-180 + k * 80, 606, 40, 5);
    // conveyor line 3 with housings standing still
    g.fillStyle = '#3a404c'; g.fillRect(-200, 560, VW + 400, 22);
    g.fillStyle = '#15181e'; for (let k = 0; k < 40; k++) g.fillRect(-190 + k * 60, 582, 6, 40);
    g.fillStyle = '#9aa3b0'; for (let k = 0; k < 28; k++) { g.fillRect(-160 + k * 84, 536, 34, 24); g.fillStyle = 'rgba(0,0,0,0.3)'; g.fillRect(-160 + k * 84, 552, 34, 8); g.fillStyle = '#9aa3b0'; }
    // robot cells (silhouettes) and fencing
    for (let k = 0; k < 6; k++) {
      const x = 80 + k * 330;
      g.strokeStyle = 'rgba(240,200,40,0.35)'; g.lineWidth = 2; g.strokeRect(x - 90, 380, 180, 160);
      g.strokeStyle = '#0b0d11'; g.lineWidth = 16; g.lineCap = 'round';
      g.beginPath(); g.moveTo(x, 540); g.lineTo(x, 470); g.lineTo(x + 50 - (k % 2) * 100, 420); g.lineTo(x + 70 - (k % 2) * 140, 470); g.stroke();
      g.fillStyle = '#0b0d11'; g.fillRect(x - 30, 530, 60, 14);
    }
    // idle workers in the lane
    [[340, 690], [380, 700], [1180, 690], [1560, 695]].forEach(([x, y]) => {
      g.fillStyle = '#0a0b0e';
      g.fillRect(x - 7, y - 50, 14, 40); g.beginPath(); g.arc(x, y - 58, 8, 0, U.TAU); g.fill();
      g.fillStyle = 'rgba(255,190,40,0.7)'; g.fillRect(x - 7, y - 46, 14, 5); // hi-vis stripe
    });
  }

  function paintRoom(g) {
    // ceiling, window frame, side walls, carpet — clean German corporate
    G.quad(g, [[-250, -150], [VW + 250, -150], [W.x1, W.y0], [W.x0, W.y0]], '#1c1f24');
    [[640, 30], [960, 30], [1280, 30]].forEach(([x, y]) => { g.fillStyle = 'rgba(240,245,255,0.9)'; g.fillRect(x - 90, y, 180, 6); G.glow(g, x, y + 4, 160, [230, 238, 255], 0.14); });
    g.fillStyle = '#0c0d10';
    g.fillRect(W.x0 - 12, W.y0 - 10, W.x1 - W.x0 + 24, 12); g.fillRect(W.x0 - 12, W.y1 - 4, W.x1 - W.x0 + 24, 16);
    for (let k = 0; k <= 7; k++) { const x = W.x0 + ((W.x1 - W.x0) * k) / 7; g.fillStyle = '#0c0d10'; g.fillRect(x - 4, W.y0, 8, W.y1 - W.y0); }
    // glass reflection of the room lights
    g.fillStyle = 'rgba(230,238,255,0.04)'; G.quad(g, [[W.x0, W.y0], [W.x0 + 500, W.y0], [W.x0 + 200, W.y1], [W.x0, W.y1]], 'rgba(230,238,255,0.04)');
    // cut the window area out so the hall shows
    g.save(); g.globalCompositeOperation = 'destination-out';
    for (let k = 0; k < 7; k++) { const x0 = W.x0 + ((W.x1 - W.x0) * k) / 7 + 4, x1 = W.x0 + ((W.x1 - W.x0) * (k + 1)) / 7 - 4; g.fillRect(x0, W.y0 + 2, x1 - x0, W.y1 - W.y0 - 6); }
    g.restore();
    g.fillStyle = 'rgba(160,190,230,0.05)'; g.fillRect(W.x0, W.y0, W.x1 - W.x0, W.y1 - W.y0);
    G.quad(g, [[-250, -150], [W.x0, W.y0], [W.x0, W.y1], [-250, VH + 150]], '#262a31');
    G.quad(g, [[W.x1, W.y0], [VW + 250, -150], [VW + 250, VH + 150], [W.x1, W.y1]], '#23262c');
    // a framed product photo and the company values on the left wall (flavour)
    G.quad(g, [[-120, 250], [120, 270], [120, 420], [-120, 440]], '#15171b');
    g.fillStyle = 'rgba(200,215,240,0.25)'; G.quad(g, [[-100, 272], [100, 288], [100, 404], [-100, 420]], 'rgba(200,215,240,0.12)');
    g.fillStyle = 'rgba(220,230,245,0.55)'; g.font = '600 16px "Barlow Condensed", sans-serif'; g.textAlign = 'left';
    g.fillText('QUALITÄT · VERLÄSSLICHKEIT · TEMPO', 1700, 250);
    const fl = g.createLinearGradient(0, W.y1, 0, VH + 150);
    fl.addColorStop(0, '#1f2229'); fl.addColorStop(1, '#0b0c0f');
    G.quad(g, [[W.x0, W.y1], [W.x1, W.y1], [VW + 250, VH + 150], [-250, VH + 150]], fl);
    // orange andon spill on the floor near the glass
    const sp = g.createLinearGradient(0, W.y1, 0, W.y1 + 200);
    sp.addColorStop(0, 'rgba(255,140,50,0.10)'); sp.addColorStop(1, 'rgba(255,140,50,0)');
    G.quad(g, [[W.x0, W.y1], [W.x1, W.y1], [W.x1 + 300, W.y1 + 200], [W.x0 - 300, W.y1 + 200]], sp);
  }

  function paintTable(g) {
    const top = 170;
    const dg = g.createLinearGradient(0, top, 0, 700);
    dg.addColorStop(0, '#cfc7b8'); dg.addColorStop(1, '#6e6659');
    G.quad(g, [[640, top], [1280, top], [1960, 700], [-40, 700]], dg);
    g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(640, top, 640, 2);
    G.quad(g, [[640, top], [1280, top], [1960, 700], [-40, 700]], 'rgba(20,24,34,0.35)');
    // the cracked housing on a cloth, red paint-marker circle around the crack
    const cx = 960, cy = 320;
    G.shadow(g, cx, cy + 50, 150, 22, 0.5);
    G.quad(g, [[cx - 150, cy + 30], [cx + 150, cy + 30], [cx + 170, cy + 80], [cx - 170, cy + 80]], '#1b2a4a');
    const part = g.createLinearGradient(cx - 120, cy - 60, cx + 120, cy + 40);
    part.addColorStop(0, '#d7dce4'); part.addColorStop(0.5, '#9aa2ae'); part.addColorStop(1, '#5e6571');
    g.fillStyle = part;
    g.beginPath(); g.moveTo(cx - 120, cy + 40); g.lineTo(cx - 110, cy - 30); g.lineTo(cx - 40, cy - 60); g.lineTo(cx + 100, cy - 50); g.lineTo(cx + 120, cy + 40); g.closePath(); g.fill();
    g.fillStyle = '#7e8591'; for (let k = 0; k < 5; k++) g.fillRect(cx - 80 + k * 38, cy - 44, 10, 70);
    g.strokeStyle = '#1a1c20'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(cx - 4, cy - 40); g.lineTo(cx + 2, cy - 20); g.lineTo(cx - 3, cy - 2); g.lineTo(cx + 4, cy + 18); g.stroke();
    g.strokeStyle = 'rgba(220,40,40,0.9)'; g.lineWidth = 3; g.beginPath(); g.ellipse(cx, cy - 10, 26, 38, 0.1, 0, U.TAU); g.stroke();
    g.fillStyle = '#e8e2d4'; g.fillRect(cx + 70, cy + 44, 60, 18); g.fillStyle = '#b3322b'; g.font = '600 11px "IBM Plex Mono", monospace'; g.textAlign = 'center'; g.fillText('L08 · 19.044', cx + 100, cy + 57);
    // papers, bottles, a laptop on Hartmann's side, name cards
    [[520, 340, 0.2], [610, 420, -0.1], [1340, 330, 0.15], [1430, 440, -0.2]].forEach(([x, y, a]) => { g.save(); g.translate(x, y); g.rotate(a); g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(-58, -36, 120, 82); g.fillStyle = '#ece7dc'; g.fillRect(-60, -40, 120, 80); g.fillStyle = 'rgba(40,40,44,0.35)'; for (let k = 0; k < 7; k++) g.fillRect(-50, -30 + k * 10, 90, 2.5); g.restore(); });
    [[860, top + 30], [1060, top + 30]].forEach(([x, y]) => { g.fillStyle = 'rgba(190,215,240,0.5)'; g.fillRect(x, y - 44, 14, 48); g.fillStyle = 'rgba(40,110,180,0.7)'; g.fillRect(x, y - 26, 14, 10); });
    [['Dr. J. Hartmann', 700, top + 70], ['M. Lehmann', 780, top + 20], ['Dr. H. Wendt', 1200, top + 70], ['A. Wróbel', 1290, top + 130]].forEach(([n, x, y]) => { g.fillStyle = '#f2efe8'; g.fillRect(x - 50, y - 14, 100, 20); g.fillStyle = '#333'; g.font = '500 11px Inter, sans-serif'; g.textAlign = 'center'; g.fillText(n, x, y); });
  }
})(window.F);
