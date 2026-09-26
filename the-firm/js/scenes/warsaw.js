/* THE FIRM — Warsaw at night: establishing shot and the 22:47 conference room */
(function (F) {
  'use strict';
  const U = F.U, G = F.gfx;
  const VW = F.VW, VH = F.VH;

  function warsawLayers(q, o) {
    o = o || {};
    const win = { lit: 0.34, warm: [255, 190, 110], cool: [180, 210, 255], warmth: 0.55, wa: 0.9, cw: 3, ch: 4, gx: 3, gy: 4 };
    const lights = { far: [], mid: [], near: [] };
    const far = G.skyline({ w: VW + 900, h: 1000, base: o.farBase || 700, seed: 301, minW: 30, maxW: 90, minH: 20, maxH: 90, gap: 12, body: 'rgb(20,20,28)', fog: [60, 40, 36], fogBottom: 0.55, fogTop: 0.25, win: Object.assign({}, win, { lit: 0.2 }), q: q * 0.6,
      landmarks: [G.lm.glassTower(1500, 60, 230, 'rgb(22,22,30)', win, lights.far), G.lm.glassTower(260, 50, 180, 'rgb(22,22,30)', win, lights.far)], below: 'rgb(28,20,20)' });
    far.lights = lights.far;
    const mid = G.skyline({ w: VW + 900, h: 1100, base: o.midBase || 780, seed: 313, minW: 40, maxW: 120, minH: 30, maxH: 110, gap: 10, body: 'rgb(12,12,18)', edge: 'rgba(255,170,110,0.18)', fog: [50, 34, 30], fogBottom: 0.4, win, q: q * 0.75,
      landmarks: [
        G.lm.palace(o.palaceX || 820, 560, 'rgb(28,24,26)', o.palaceS || 1.12, lights.mid),
        G.lm.spireTower(1340, 520, 'rgb(14,16,24)', win, 1.05, lights.mid),
        G.lm.curvedTower(1180, 400, 'rgb(14,16,24)', win, 1, lights.mid),
        G.lm.sailTower(1560, 380, 'rgb(14,16,24)', win, 1.05, lights.mid),
        G.lm.glassTower(1680, 70, 300, 'rgb(14,16,24)', win, lights.mid, true),
        G.lm.glassTower(1060, 64, 260, 'rgb(15,16,22)', win, lights.mid),
        G.lm.glassTower(420, 70, 240, 'rgb(15,16,22)', win, lights.mid, true),
        G.lm.glassTower(1840, 60, 200, 'rgb(15,16,22)', win, lights.mid),
      ], groundGlow: [255, 150, 70], groundGlowA: 0.5, below: 'rgb(16,12,12)' });
    mid.lights = lights.mid;
    return { far, mid };
  }

  // ------------------------------------------------------------------ WARSAW ESTABLISHING — 22:47
  F.defineScene('warsaw_wide', {
    enter() {
      const q = F.quality();
      this.L = warsawLayers(q, { palaceX: 900 });
      this.clouds = G.cloudTexture(VW * 2.2, 700, 61, { n: 280, col: [150, 90, 60], a: 0.18, rmin: 80, rmax: 300 });
      this.clouds2 = G.cloudTexture(VW * 2.2, 500, 62, { n: 200, col: [20, 16, 18], a: 0.4, rmin: 100, rmax: 260 });
      const win = { lit: 0.22, warm: [255, 190, 110], wa: 0.85, cw: 5, ch: 4, gx: 9, gy: 10 };
      this.near = F.offscreen(VW + 800, 600, q * 0.85, (g) => {
        const r = U.rng(7);
        // communist-era slab blocks + a pre-war tenement with neon
        [[-100, 240, 190], [180, 300, 150], [980, 320, 170], [1560, 380, 200], [2080, 300, 160]].forEach(([x, w, h]) => {
          g.fillStyle = 'rgb(9,9,12)'; g.fillRect(x, 600 - h, w, h);
          G.windowGrid(g, r, x + 4, 600 - h + 6, w - 8, h - 10, win);
          g.fillStyle = 'rgba(255,170,110,0.15)'; g.fillRect(x, 600 - h, w, 1.5);
        });
      });
      this.neon = [
        { x: 330, y: 440, text: 'KANTOR', col: [255, 60, 70], size: 34 },
        { x: 1580, y: 390, text: 'APTEKA', col: [90, 255, 150], size: 28 },
        { x: 1150, y: 420, text: 'BAR MLECZNY', col: [120, 190, 255], size: 22 },
      ];
      this.rain = new G.Rain(1400, { angle: 0.18, speed: 2000, len: 70, alpha: 0.28, col: [220, 200, 190] });
      this.rain2 = new G.Rain(160, { angle: 0.2, speed: 2600, len: 140, alpha: 0.18, zmin: 0.8, col: [230, 220, 210] });
      this.traffic = [];
      this.tram = -900;
      F.camSet(VW / 2 - 80, VH / 2 + 30, 1.0);
      F.cam.par = 14; F.cam.drift = 0.6;
      F.grade.tint = [170, 90, 50]; F.grade.tintA = 0.22; F.grade.vignette = 0.66;
      F.audio.mix({ rain: 0.4, city: 0.25, pad: 0.4 }, 2);
      F.audio.chord('night');
    },
    start() { F.camTween({ x: VW / 2 + 40, y: VH / 2, z: 1.08 }, 9, U.easeInOut); },
    update(dt, t) {
      this.rain.update(dt); this.rain2.update(dt);
      if (Math.random() < dt * 0.12) { F.grade.flash = 0.6; this.bolt = { t: 0, x: 300 + Math.random() * 1300 }; F.audio.thunder(0.4); }
      if (this.bolt) { this.bolt.t += dt; if (this.bolt.t > 0.3) this.bolt = null; }
      if (Math.random() < dt * 5) this.traffic.push({ x: Math.random() < 0.5 ? -100 : VW + 100, dir: 0, lane: Math.random() });
      this.traffic.forEach((c) => { if (!c.dir) c.dir = c.x < 0 ? 1 : -1; c.x += c.dir * (500 + c.lane * 300) * dt; });
      this.traffic = this.traffic.filter((c) => c.x > -200 && c.x < VW + 200);
      this.tram += 180 * dt;
    },
    draw(g, dt, t) {
      F.layer(0.02, 0.1);
      const sky = g.createLinearGradient(0, -100, 0, 900);
      sky.addColorStop(0, '#07060a'); sky.addColorStop(0.45, '#1c1418'); sky.addColorStop(0.8, '#4a2c22'); sky.addColorStop(1, '#6a3a24');
      g.fillStyle = sky; g.fillRect(-400, -400, VW + 800, VH + 800);
      F.layer(0.04, 0.12);
      G.drawClouds(g, this.clouds, -500, 40, VW * 2.2, 700, t * 16, 1);
      G.drawClouds(g, this.clouds2, -500, -60, VW * 2.2, 500, t * 26 + 200, 0.9);
      if (this.bolt) {
        g.strokeStyle = `rgba(230,230,255,${1 - this.bolt.t / 0.3})`; g.lineWidth = 2.5;
        g.beginPath(); let x = this.bolt.x, y = -50; g.moveTo(x, y);
        const r = U.rng((this.bolt.x | 0));
        while (y < 520) { x += (r() - 0.5) * 60; y += 30 + r() * 40; g.lineTo(x, y); }
        g.stroke();
        G.glow(g, this.bolt.x, 200, 600, [200, 200, 255], 0.4 * (1 - this.bolt.t / 0.3));
      }
      F.layer(0.07, 0.25);
      g.drawImage(this.L.far.canvas, -450, 0, this.L.far.canvas.vw, this.L.far.canvas.vh);
      G.drawLights(g, this.L.far.lights, t, -450, 0);
      F.layer(0.12, 0.4);
      g.drawImage(this.L.mid.canvas, -450, 0, this.L.mid.canvas.vw, this.L.mid.canvas.vh);
      G.drawLights(g, this.L.mid.lights, t, -450, 0);
      // Palace floodlight halo in rain
      G.glow(g, 900, 420, 380, [255, 180, 110], 0.12);
      // avenue with traffic streaks
      F.layer(0.2, 0.55);
      const av = g.createLinearGradient(0, 800, 0, 900);
      av.addColorStop(0, '#1a100c'); av.addColorStop(1, '#0a0707');
      g.fillStyle = av; g.fillRect(-500, 800, VW + 1000, 120);
      this.traffic.forEach((c) => {
        const y = 830 + c.lane * 50;
        const col = c.dir > 0 ? [255, 240, 220] : [255, 40, 30];
        g.strokeStyle = U.rgba(col, 0.7); g.lineWidth = 3;
        g.beginPath(); g.moveTo(c.x, y); g.lineTo(c.x - c.dir * 160, y); g.stroke();
        G.glow(g, c.x, y, 26, col, 0.6);
      });
      // Warsaw tram — yellow & red
      const tx = (this.tram % 3200) - 900;
      g.fillStyle = '#c9a227'; G.roundRect(g, tx, 850, 520, 34, 8); g.fill();
      g.fillStyle = '#a3261f'; g.fillRect(tx, 874, 520, 10);
      for (let k = 0; k < 10; k++) { g.fillStyle = 'rgba(255,245,210,0.95)'; g.fillRect(tx + 16 + k * 50, 856, 34, 12); }
      G.glow(g, tx + 520, 866, 50, [255, 250, 220], 0.7);
      // near blocks & neon
      F.layer(0.3, 0.7);
      g.drawImage(this.near, -400, 480, this.near.vw, this.near.vh);
      this.neon.forEach((n, i) => {
        const flick = i === 0 && Math.sin(t * 13) > 0.97 ? 0.3 : 1;
        g.save();
        g.font = `600 ${n.size}px "Barlow Condensed", sans-serif`;
        g.textAlign = 'center';
        g.shadowColor = U.rgba(n.col, 0.9); g.shadowBlur = 22;
        g.fillStyle = U.rgba(U.mix(n.col, [255, 255, 255], 0.5), flick);
        g.fillText(n.text, n.x, n.y + 480);
        g.restore();
        G.glow(g, n.x, n.y + 470, n.size * 3, n.col, 0.25 * flick);
      });
      F.screen();
      this.rain.draw(g);
      this.rain2.draw(g);
      const mist = g.createLinearGradient(0, 700, 0, 1080);
      mist.addColorStop(0, 'rgba(90,50,40,0)'); mist.addColorStop(1, 'rgba(40,24,20,0.4)');
      g.fillStyle = mist; g.fillRect(0, 700, VW, 380);
    },
    exit() { F.grade.tintA = 0; },
  });

  // ------------------------------------------------------------------ CONFERENCE ROOM — Adler Wendt Warsaw, 30th floor, 22:47
  const VP = [960, 470];
  const W = { x0: 300, x1: 1620, y0: 90, y1: 640 };
  F.defineScene('conference', {
    enter(o) {
      const q = F.quality();
      this.L = warsawLayers(q, { palaceX: 1450, palaceS: 1.3, midBase: 740, farBase: 660 });
      this.clouds = G.cloudTexture(VW * 2.2, 600, 71, { n: 240, col: [150, 90, 60], a: 0.16, rmin: 80, rmax: 280 });
      this.room = F.offscreen(VW + 500, VH + 300, q, (g) => { g.translate(250, 150); paintConf(g); });
      this.table = F.offscreen(VW + 600, 700, q, (g) => { g.translate(300, 0); paintTable(g); });
      this.glass = new G.GlassDrops([{ x: W.x0, y: W.y0, w: W.x1 - W.x0, h: W.y1 - W.y0 }], { beads: 1800, drips: 24, light: [220, 180, 150], dark: [10, 8, 10], seed: 88, scale: 0.95 });
      this.rain = new G.Rain(800, { angle: 0.17, speed: 1800, len: 50, alpha: 0.22, x0: W.x0 - 200, x1: W.x1 + 200, y0: W.y0 - 100, y1: W.y1, col: [230, 200, 180] });
      this.cast = {
        nowicka: { expr: 'cold', turn: 0.1 },
        zielinski: { expr: 'suspicious', turn: -0.3 },
        steinhauer: { expr: 'impatient', turn: -0.4, pose: 'hips' },
        marta: { expr: 'pressure', turn: 0.45 },
      };
      this.shots = {
        wide: { x: VW / 2, y: VH / 2, z: 1 },
        screen: { x: 420, y: 380, z: 1.9 },
        steinhauer: { x: 1470, y: 380, z: 2.0 },
        marta: { x: 1320, y: 560, z: 1.9 },
        window: { x: 1000, y: 360, z: 1.35 },
        table: { x: 900, y: 700, z: 1.5 },
      };
      const s0 = this.shots[(o && o.shot) || 'wide'];
      F.camSet(s0.x, s0.y, s0.z);
      F.cam.par = 16; F.cam.drift = 0.8;
      F.grade.tint = [160, 100, 60]; F.grade.tintA = 0.2; F.grade.vignette = 0.68;
      this.screenOn = 1;
      this.static = 0;
      F.audio.mix({ rain: 0.18, rainGlass: 0.25, room: 0.22, hvac: 0.08, pad: 0.5 }, 2);
      F.audio.chord('tense');
    },
    shot(name, dur) { const s = this.shots[name]; return F.camTween({ x: s.x, y: s.y, z: s.z }, dur == null ? 1.4 : dur, U.easeInOut); },
    cut(name) { const s = this.shots[name]; F.camSet(s.x, s.y, s.z); },
    update(dt, t) {
      this.glass.update(dt); this.rain.update(dt);
      if (Math.random() < dt * 0.06) { F.grade.flash = 0.35; F.audio.thunder(0.6); }
      if (this.static > 0) this.static = Math.max(0, this.static - dt);
    },
    draw(g, dt, t) {
      F.layer(0.03, 0.1);
      const sky = g.createLinearGradient(0, 0, 0, 700);
      sky.addColorStop(0, '#060509'); sky.addColorStop(0.55, '#24171a'); sky.addColorStop(1, '#5a3222');
      g.fillStyle = sky; g.fillRect(-400, -300, VW + 800, VH + 600);
      F.layer(0.05, 0.12);
      G.drawClouds(g, this.clouds, -500, -20, VW * 2.2, 600, t * 14, 1);
      F.layer(0.08, 0.2);
      g.drawImage(this.L.far.canvas, -450, 0, this.L.far.canvas.vw, this.L.far.canvas.vh);
      G.drawLights(g, this.L.far.lights, t, -450, 0);
      F.layer(0.13, 0.3);
      g.drawImage(this.L.mid.canvas, -450, 0, this.L.mid.canvas.vw, this.L.mid.canvas.vh);
      G.drawLights(g, this.L.mid.lights, t, -450, 0);
      G.glow(g, 1000, 380, 420, [255, 180, 110], 0.1);
      F.layer(0.6, 0.75);
      g.save();
      g.beginPath(); g.rect(W.x0, W.y0, W.x1 - W.x0, W.y1 - W.y0); g.clip();
      this.rain.draw(g);
      g.fillStyle = 'rgba(10,8,10,0.2)'; g.fillRect(W.x0, W.y0, W.x1 - W.x0, W.y1 - W.y0);
      // reflections of pendant lights on the glass
      [[760, 300], [960, 300], [1160, 300]].forEach(([x, y]) => G.glow(g, x, y, 70, [255, 200, 140], 0.12));
      this.glass.draw(g, 0.85);
      g.restore();
      g.drawImage(this.room, -250, -150, this.room.vw, this.room.vh);
      // wall clock
      g.fillStyle = 'rgba(255,200,140,0.85)'; g.font = '300 34px "IBM Plex Mono", monospace'; g.textAlign = 'center';
      g.fillText(F.state.time || '22:47', 1780, 170);
      // video wall: Nowicka and Zieliński
      this.drawScreen(g, t);
      // Steinhauer at the window (backlit, city behind)
      F.layer(1);
      const c = this.cast;
      F.people.draw(g, F.people.cast.steinhauer, 1470, 700, 450, {
        pose: c.steinhauer.pose, turn: c.steinhauer.turn, expr: c.steinhauer.expr, talking: F.ui.speaking === 'steinhauer', lookX: -0.7,
        light: { key: [255, 200, 150], keyA: 0.55, dir: -1, amb: [60, 44, 40], rim: [255, 170, 110], rimA: 1, rimSide: 1 },
      });
      // table (foreground plane)
      F.layer(1.05);
      g.drawImage(this.table, -300, 480, this.table.vw, this.table.vh);
      this.drawTableLive(g, t);
      // Marta seated at the near right of the table, lit by her laptop
      F.people.draw(g, F.people.cast.marta, 1330, 1390, 900, {
        crop: 'bust', pose: 'desk', turn: c.marta.turn, expr: c.marta.expr, talking: F.ui.speaking === 'marta', lookX: -0.8,
        light: { key: [185, 205, 250], keyA: 0.7, dir: -1, amb: [66, 50, 46], rim: [255, 180, 120], rimA: 0.9, rimSide: 1 },
      });
      // laptop in front of Marta (occludes her lower half)
      g.fillStyle = '#0d0e11';
      G.quad(g, [[1180, 930], [1420, 930], [1446, 1010], [1156, 1010]], '#15161a');
      G.quad(g, [[1196, 790], [1404, 782], [1416, 930], [1182, 930]], '#08090b');
      G.quad(g, [[1202, 796], [1398, 788], [1408, 924], [1190, 924]], 'rgba(150,180,240,0.1)');
      G.glow(g, 1300, 860, 220, [150, 180, 240], 0.2);
    },
    drawScreen(g, t) {
      // large display on the left wall (trapezoid)
      const s = [[140, 170], [620, 214], [620, 520], [140, 590]];
      g.save();
      G.quad(g, s); g.fillStyle = '#05070b'; g.fill();
      G.quad(g, s); g.clip();
      // video feed background: their conference room, cool light
      const bg = g.createLinearGradient(140, 170, 620, 590);
      bg.addColorStop(0, '#1e2a3c'); bg.addColorStop(1, '#0c121c');
      g.fillStyle = bg; g.fillRect(100, 150, 560, 460);
      g.fillStyle = 'rgba(200,215,240,0.12)'; g.fillRect(150, 230, 470, 3);
      for (let k = 0; k < 6; k++) { g.fillStyle = 'rgba(220,230,250,0.06)'; g.fillRect(170 + k * 78, 240, 50, 120); }
      const c = this.cast;
      F.people.draw(g, F.people.cast.zielinski, 520, 1040, 720, { crop: 'bust', turn: c.zielinski.turn, expr: c.zielinski.expr, talking: F.ui.speaking === 'zielinski', slot: 'vid', light: { key: [200, 220, 255], keyA: 0.75, dir: 1, amb: [60, 70, 90], rim: [140, 170, 230], rimA: 0.4, rimSide: -1 } });
      F.people.draw(g, F.people.cast.nowicka, 330, 1090, 760, { crop: 'bust', turn: c.nowicka.turn, expr: c.nowicka.expr, talking: F.ui.speaking === 'nowicka', slot: 'vid', light: { key: [215, 228, 255], keyA: 0.95, dir: -1, amb: [60, 70, 92], rim: [150, 180, 240], rimA: 0.5, rimSide: 1 } });
      // video compression / scanline texture and static glitches
      g.fillStyle = 'rgba(0,0,0,0.12)';
      for (let y = 170; y < 600; y += 3) g.fillRect(140, y, 480, 1);
      if (this.static > 0 || Math.random() < 0.004) {
        for (let k = 0; k < 8; k++) { g.fillStyle = `rgba(${Math.random() < 0.5 ? 255 : 120},${160 + Math.random() * 90 | 0},255,0.25)`; g.fillRect(140, 170 + Math.random() * 420, 480, 2 + Math.random() * 10); }
      }
      // UI overlay of the call
      g.fillStyle = 'rgba(0,0,0,0.55)'; g.fillRect(150, 540, 250, 26);
      g.fillStyle = 'rgba(255,255,255,0.85)'; g.font = '500 13px Inter, sans-serif'; g.textAlign = 'left';
      g.fillText('Nowicka Bąk Legal — Sala 4', 160, 558);
      g.fillStyle = '#e04040'; g.beginPath(); g.arc(600, 200, 5, 0, U.TAU); g.fill();
      g.restore();
      // bezel + screen glow into room
      g.strokeStyle = '#020203'; g.lineWidth = 10; G.quad(g, s); g.stroke();
      G.glow(g, 380, 380, 380, [140, 170, 230], 0.12);
    },
    drawTableLive(g, t) {
      // pendant light pools and steam from one fresh cup
      G.steam(g, 760, 812, t, 0.5, 0.8);
    },
    exit() { F.grade.tintA = 0; },
  });

  function paintConf(g) {
    // ceiling (dark) with three pendant lights over the table
    G.quad(g, [[-250, -150], [VW + 250, -150], [W.x1, W.y0], [W.x0, W.y0]], '#120e0c');
    [[760, 250], [960, 250], [1160, 250]].forEach(([x, y]) => {
      g.strokeStyle = '#050404'; g.lineWidth = 2; g.beginPath(); g.moveTo(x, -150); g.lineTo(x, y - 20); g.stroke();
      g.fillStyle = '#1a1512'; g.beginPath(); g.moveTo(x - 50, y); g.lineTo(x + 50, y); g.lineTo(x + 30, y - 22); g.lineTo(x - 30, y - 22); g.closePath(); g.fill();
      g.fillStyle = 'rgba(255,214,160,0.95)'; g.fillRect(x - 46, y - 2, 92, 4);
      G.glow(g, x, y + 4, 140, [255, 200, 140], 0.35);
    });
    // window frame and mullions
    g.fillStyle = '#080607';
    g.fillRect(W.x0 - 14, W.y0 - 12, W.x1 - W.x0 + 28, 14); g.fillRect(W.x0 - 14, W.y1 - 4, W.x1 - W.x0 + 28, 16);
    for (let k = 0; k <= 8; k++) { const x = W.x0 + ((W.x1 - W.x0) * k) / 8; g.fillStyle = '#080607'; g.fillRect(x - 5, W.y0, 10, W.y1 - W.y0); g.fillStyle = 'rgba(255,190,140,0.1)'; g.fillRect(x + 3, W.y0, 1.5, W.y1 - W.y0); }
    // left wall (dark oak) with the video wall; right wall with clock and credenza
    G.quad(g, [[-250, -150], [W.x0, W.y0], [W.x0, W.y1], [-250, VH + 150]], '#1c1410');
    G.quad(g, [[W.x1, W.y0], [VW + 250, -150], [VW + 250, VH + 150], [W.x1, W.y1]], '#191210');
    g.strokeStyle = 'rgba(0,0,0,0.35)'; g.lineWidth = 2;
    for (let k = 1; k < 5; k++) { const tt = k / 5; g.beginPath(); g.moveTo(U.lerp(W.x1, VW + 250, tt), U.lerp(W.y0, -150, tt)); g.lineTo(U.lerp(W.x1, VW + 250, tt), U.lerp(W.y1, VH + 150, tt)); g.stroke(); }
    // credenza with water bottles and a closed sandwich platter
    G.quad(g, [[1660, 600], [1900, 560], [1900, 700], [1660, 680]], '#0f0b09');
    g.fillStyle = 'rgba(200,220,240,0.35)'; for (let k = 0; k < 4; k++) g.fillRect(1690 + k * 26, 560 - k * 4, 10, 36);
    // floor
    const fl = g.createLinearGradient(0, W.y1, 0, VH + 150);
    fl.addColorStop(0, '#15100d'); fl.addColorStop(1, '#070504');
    G.quad(g, [[W.x0, W.y1], [W.x1, W.y1], [VW + 250, VH + 150], [-250, VH + 150]], fl);
    // city glow spilling onto the floor
    const sp = g.createLinearGradient(0, W.y1, 0, W.y1 + 240);
    sp.addColorStop(0, 'rgba(255,150,90,0.12)'); sp.addColorStop(1, 'rgba(255,150,90,0)');
    G.quad(g, [[W.x0, W.y1], [W.x1, W.y1], [W.x1 + 300, W.y1 + 240], [W.x0 - 300, W.y1 + 240]], sp);
    // chairs along the far side of the table
    for (let k = 0; k < 5; k++) { const x = 640 + k * 160; g.fillStyle = '#0a0808'; G.roundRect(g, x - 38, 560, 76, 100, 12); g.fill(); g.fillStyle = 'rgba(255,190,130,0.1)'; g.fillRect(x - 34, 560, 68, 2); }
  }

  function paintTable(g) {
    // long walnut table in perspective, the near end at the bottom of frame
    const top = 150; // canvas y (layer y 630)
    const dg = g.createLinearGradient(0, top, 0, 700);
    dg.addColorStop(0, '#3a281b'); dg.addColorStop(1, '#140d08');
    G.quad(g, [[560, top], [1360, top], [2000, 700], [-80, 700]], dg);
    g.fillStyle = 'rgba(255,210,160,0.2)'; g.fillRect(560, top, 800, 2);
    // pendant light pools
    [[760, top + 90], [960, top + 90], [1160, top + 90]].forEach(([x, y]) => G.pool(g, x, y, 260, 60, [255, 200, 140], 0.28));
    // reflections of the window (city) on the lacquer
    const rf = g.createLinearGradient(0, top, 0, top + 200);
    rf.addColorStop(0, 'rgba(255,160,100,0.12)'); rf.addColorStop(1, 'rgba(255,160,100,0)');
    g.fillStyle = rf; G.quad(g, [[600, top + 2], [1320, top + 2], [1500, top + 200], [420, top + 200]], rf);
    // documents everywhere (visual storytelling: the deal is in pieces)
    const r = U.rng(12);
    const piles = [[760, 0.25], [1150, 0.2], [620, 0.55], [1330, 0.5], [900, 0.8]];
    for (let i = 0; i < 20; i++) {
      const pl = piles[i % piles.length];
      const tt = U.clamp(pl[1] + (r() - 0.5) * 0.12, 0, 1);
      const y = U.lerp(top + 20, 620, tt);
      const x = pl[0] + (pl[0] - 960) * tt * 0.6 + (r() - 0.5) * 70;
      const s = U.lerp(0.5, 1.4, tt);
      g.save(); g.translate(x, y); g.rotate((r() - 0.5) * 0.9); g.scale(s, s * 0.55);
      g.fillStyle = 'rgba(0,0,0,0.3)'; g.fillRect(-58, -38, 120, 82);
      g.fillStyle = r() < 0.2 ? '#f1e6c8' : '#ece7dc'; g.fillRect(-60, -40, 120, 80);
      g.fillStyle = 'rgba(40,40,44,0.35)'; for (let k = 0; k < 7; k++) g.fillRect(-50, -32 + k * 10, 80 + (k % 3) * 8, 2.5);
      if (r() < 0.3) { g.fillStyle = 'rgba(179,50,43,0.6)'; g.fillRect(-50, -2, 60, 3); }
      if (r() < 0.15) { g.fillStyle = 'rgba(255,220,90,0.5)'; g.fillRect(-52, 8, 70, 6); }
      g.restore();
    }
    // coffee cups, bottles, a laptop left open (screen glow)
    [[700, top + 150, 0.8], [1210, top + 120, 0.7], [520, top + 360, 1.1], [1500, top + 400, 1.2], [880, top + 470, 1.3]].forEach(([x, y, s]) => {
      G.shadow(g, x, y + 20 * s, 30 * s, 6 * s, 0.5);
      g.fillStyle = '#e9e5dc'; g.beginPath(); g.moveTo(x - 18 * s, y - 20 * s); g.lineTo(x + 18 * s, y - 20 * s); g.lineTo(x + 14 * s, y + 18 * s); g.lineTo(x - 14 * s, y + 18 * s); g.closePath(); g.fill();
      g.fillStyle = '#3a2416'; g.beginPath(); g.ellipse(x, y - 20 * s, 18 * s, 4 * s, 0, 0, U.TAU); g.fill();
    });
    [[1080, top + 60], [860, top + 50]].forEach(([x, y]) => { g.fillStyle = 'rgba(190,210,230,0.4)'; g.fillRect(x, y - 40, 12, 44); g.fillStyle = 'rgba(40,100,160,0.7)'; g.fillRect(x, y - 24, 12, 10); });
    // laptop (left, towards camera) with the SPA open
    g.fillStyle = '#0c0c0f'; G.quad(g, [[380, 470], [640, 470], [660, 560], [360, 560]], '#17181c');
    G.quad(g, [[390, 330], [630, 322], [640, 470], [380, 470]], '#08090b');
    G.quad(g, [[398, 338], [622, 330], [632, 464], [388, 464]], '#e8e3da');
    for (let k = 0; k < 11; k++) { g.fillStyle = k % 4 === 1 ? 'rgba(43,79,168,0.6)' : 'rgba(40,40,44,0.45)'; g.fillRect(410, 350 + k * 10, 160 + (k % 3) * 20, 3); }
    G.glow(g, 510, 400, 220, [200, 210, 255], 0.14);
    // pen, glasses, phone face-down
    g.fillStyle = '#c9a96b'; g.save(); g.translate(760, 600); g.rotate(0.4); g.fillRect(-70, -3, 140, 6); g.restore();
    g.fillStyle = '#0b0b0d'; G.roundRect(g, 1000, 560, 70, 120, 10); g.fill();
  }

  F.warsawLayers = warsawLayers;
})(window.F);
