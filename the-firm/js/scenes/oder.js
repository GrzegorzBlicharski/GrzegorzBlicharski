/* THE FIRM — the Oder corridor: Szczecin's Wały Chrobrego at sunrise, Berlin on the Spree, and a courtroom of the Arbeitsgericht Berlin. */
(function (F) {
  'use strict';
  const U = F.U, G = F.gfx;
  const VW = F.VW, VH = F.VH;

  // ------------------------------------------------------------------ SZCZECIN — Wały Chrobrego, 07:40, April, sunrise over the port
  F.defineScene('szczecin_wide', {
    enter(o) {
      o = o || {};
      const q = F.quality();
      const r = U.rng(401);
      this.meet = !!o.meet;
      this.clouds = G.cloudTexture(VW * 2.2, 500, 41, { n: 160, col: [255, 214, 176], a: 0.16, rmin: 70, rmax: 220 });
      // far bank: the port — gantry cranes, warehouses, silos, backlit by the sun
      this.port = F.offscreen(VW + 800, 600, q * 0.8, (g) => {
        g.translate(400, 0);
        const col = '#3b3440';
        g.fillStyle = col; g.fillRect(-400, 420, VW + 800, 180);
        for (let k = 0; k < 16; k++) { const x = -380 + k * 150 + r() * 40, w = 80 + r() * 120, h = 20 + r() * 40; g.fillRect(x, 420 - h, w, h); }
        g.fillRect(1500, 300, 70, 120); g.fillRect(1575, 320, 60, 100); g.beginPath(); g.arc(1535, 300, 35, Math.PI, 0); g.fill(); // silos
        // gantry cranes, legs astride the quay, booms raised or lowered
        const crane = (x, s, up) => {
          g.strokeStyle = col; g.fillStyle = col; g.lineWidth = 5 * s;
          g.beginPath(); g.moveTo(x - 30 * s, 420); g.lineTo(x - 18 * s, 250 * 1 + (1 - s) * 120); g.moveTo(x + 30 * s, 420); g.lineTo(x + 18 * s, 250 + (1 - s) * 120); g.stroke();
          const topY = 250 + (1 - s) * 120;
          g.fillRect(x - 36 * s, topY - 16 * s, 72 * s, 16 * s);
          g.lineWidth = 6 * s; g.beginPath();
          if (up) { g.moveTo(x, topY - 8 * s); g.lineTo(x + 60 * s, topY - 150 * s); } else { g.moveTo(x - 60 * s, topY - 8 * s); g.lineTo(x + 170 * s, topY - 8 * s); }
          g.stroke(); g.lineWidth = 1.5 * s; g.beginPath(); g.moveTo(x, topY - 60 * s); g.lineTo(up ? x + 60 * s : x + 170 * s, up ? topY - 150 * s : topY - 8 * s); g.stroke();
          g.fillRect(x - 6 * s, topY - 60 * s, 12 * s, 44 * s);
        };
        [[80, 0.8, 1], [300, 0.9, 0], [560, 0.85, 1], [820, 1, 0], [1100, 0.9, 1], [1320, 0.8, 0], [1760, 0.95, 1]].forEach(([x, s, u]) => crane(x, s, u));
      });
      // near: the terrace — balustrade, lamp posts, the tower of the great building on the left
      this.terrace = F.offscreen(VW + 600, VH + 200, q, (g) => {
        g.translate(300, 0);
        // the monumental building with its tower (left), warm sandstone catching the sun
        const sand = g.createLinearGradient(-300, 0, 520, 0); sand.addColorStop(0, '#3a3130'); sand.addColorStop(1, '#8a6c56');
        g.fillStyle = sand; g.fillRect(-300, 380, 760, 520);
        g.fillStyle = '#2a3a36'; g.beginPath(); g.moveTo(-320, 390); g.lineTo(80, 260); g.lineTo(480, 390); g.fill(); // copper roof
        g.fillStyle = sand; g.fillRect(40, 110, 120, 290);
        g.fillStyle = '#2f4640'; g.beginPath(); g.moveTo(30, 116); g.lineTo(100, -20); g.lineTo(170, 116); g.fill(); g.fillRect(96, -80, 8, 70);
        g.fillStyle = 'rgba(255,220,170,0.35)'; g.fillRect(150, 110, 10, 290); g.fillRect(450, 380, 10, 520); // sunlit edges
        g.fillStyle = 'rgba(30,24,22,0.7)'; for (let row = 0; row < 4; row++) for (let k = 0; k < 7; k++) g.fillRect(-270 + k * 100, 440 + row * 100, 34, 60);
        for (let k = 0; k < 3; k++) g.fillRect(80, 150 + k * 70, 40, 44);
        g.fillStyle = 'rgba(255,210,150,0.5)'; g.fillRect(390, 440, 34, 60); g.fillRect(290, 540, 34, 60);
        // terrace floor
        const fl = g.createLinearGradient(0, 860, 0, VH + 200); fl.addColorStop(0, '#6e5d52'); fl.addColorStop(1, '#2a2320');
        g.fillStyle = fl; g.fillRect(-300, 860, VW + 600, 400);
        g.strokeStyle = 'rgba(0,0,0,0.18)'; g.lineWidth = 2; for (let k = 0; k < 14; k++) { g.beginPath(); g.moveTo(960 + (k - 7) * 60, 860); g.lineTo(960 + (k - 7) * 260, VH + 200); g.stroke(); }
        // balustrade
        g.fillStyle = '#7a6a5e'; g.fillRect(-300, 760, VW + 600, 22); g.fillStyle = '#5a4d44'; g.fillRect(-300, 846, VW + 600, 18);
        for (let x = -290; x < VW + 300; x += 34) {
          g.fillStyle = '#6a5b50'; g.beginPath(); g.moveTo(x, 782); g.bezierCurveTo(x - 10, 800, x - 10, 830, x, 846); g.lineTo(x + 18, 846); g.bezierCurveTo(x + 28, 830, x + 28, 800, x + 18, 782); g.fill();
          g.fillStyle = 'rgba(255,214,170,0.25)'; g.fillRect(x + 12, 786, 4, 56);
        }
        g.fillStyle = 'rgba(255,220,180,0.45)'; g.fillRect(-300, 760, VW + 600, 3);
        // lamp posts with globes
        [520, 1400].forEach((x) => { g.fillStyle = '#1e1b1a'; g.fillRect(x - 6, 470, 12, 300); g.fillRect(x - 40, 480, 80, 8); [-34, 34].forEach((d) => { g.fillStyle = '#e9e1d2'; g.beginPath(); g.arc(x + d, 468, 16, 0, U.TAU); g.fill(); }); g.fillStyle = '#1e1b1a'; g.fillRect(x - 14, 752, 28, 20); });
      });
      this.gulls = Array.from({ length: 7 }, () => ({ x: Math.random() * VW, y: 200 + Math.random() * 260, v: 40 + Math.random() * 60, ph: Math.random() * 6, s: 0.6 + Math.random() * 0.8 }));
      this.barge = -300;
      this.shots = { wide: { x: VW / 2, y: VH / 2, z: 1 }, kamil: { x: 1230, y: 560, z: 1.9 }, river: { x: 1200, y: 560, z: 1.35 } };
      const s0 = this.shots[o.shot || 'wide'];
      F.camSet(s0.x, s0.y, s0.z); F.cam.par = 16; F.cam.drift = 0.8;
      this.kamil = { expr: 'tired', turn: -0.35 };
      F.grade.tint = [255, 180, 120]; F.grade.tintA = 0.14; F.grade.vignette = 0.6;
      F.audio.mix({ city: 0.18, pad: 0.4, room: 0.05 }, 2.5);
      F.audio.chord('warm');
    },
    shot(name, dur) { const s = this.shots[name]; return F.camTween({ x: s.x, y: s.y, z: s.z }, dur == null ? 1.4 : dur, U.easeInOut); },
    update(dt, t) {
      this.gulls.forEach((b) => { b.x += b.v * dt; if (b.x > VW + 100) { b.x = -100; b.y = 200 + Math.random() * 260; } });
      this.barge += dt * 22; if (this.barge > VW + 400) this.barge = -500;
    },
    draw(g, dt, t) {
      F.layer(0.02, 0.1);
      const sky = g.createLinearGradient(0, -200, 0, 700);
      sky.addColorStop(0, '#44587a'); sky.addColorStop(0.45, '#b69a98'); sky.addColorStop(0.8, '#f2b98a'); sky.addColorStop(1, '#ffd7a0');
      g.fillStyle = sky; g.fillRect(-400, -400, VW + 800, VH + 800);
      // the sun just above the cranes
      G.glow(g, 1180, 560, 720, [255, 190, 120], 0.45); G.glow(g, 1180, 560, 160, [255, 236, 200], 0.9);
      g.fillStyle = '#fff4dc'; g.beginPath(); g.arc(1180, 560, 34, 0, U.TAU); g.fill();
      G.drawClouds(g, this.clouds, -500, 20, VW * 2.2, 500, t * 8, 0.9);
      F.layer(0.12, 0.3);
      g.drawImage(this.port, -400, 150, this.port.vw, this.port.vh);
      const haze = g.createLinearGradient(0, 400, 0, 580); haze.addColorStop(0, 'rgba(255,200,150,0)'); haze.addColorStop(1, 'rgba(255,200,150,0.45)');
      g.fillStyle = haze; g.fillRect(-400, 400, VW + 800, 180);
      // the Oder: wide, glittering path of the sun, a barge drifting downstream
      F.layer(0.2, 0.4);
      const wg = g.createLinearGradient(0, 570, 0, 860); wg.addColorStop(0, '#d9a57e'); wg.addColorStop(0.3, '#6b5d6a'); wg.addColorStop(1, '#2a2a36');
      g.fillStyle = wg; g.fillRect(-400, 570, VW + 800, 320);
      for (let k = 0; k < 90; k++) {
        const y = 580 + Math.pow(k / 90, 1.4) * 280, w = 30 + (k / 90) * 220, ph = Math.sin(t * 1.8 + k * 1.7);
        g.fillStyle = `rgba(255,${220 + ph * 20 | 0},170,${0.1 + 0.28 * (1 - k / 90) * (0.6 + 0.4 * ph)})`;
        g.fillRect(1180 - w / 2 + Math.sin(k * 3.1 + t) * 30, y, w * (0.4 + 0.6 * Math.abs(ph)), 2);
      }
      const bx = this.barge;
      g.fillStyle = '#1e1c22'; g.beginPath(); g.moveTo(bx, 640); g.lineTo(bx + 260, 640); g.lineTo(bx + 240, 656); g.lineTo(bx + 16, 656); g.fill(); g.fillRect(bx + 200, 614, 40, 26);
      g.fillStyle = 'rgba(255,220,180,0.3)'; g.fillRect(bx + 20, 658, 220, 2);
      F.layer(0.28, 0.45);
      this.gulls.forEach((b) => { const f = Math.sin(t * 7 + b.ph) * 8 * b.s; g.strokeStyle = 'rgba(40,34,40,0.8)'; g.lineWidth = 2 * b.s; g.beginPath(); g.moveTo(b.x - 14 * b.s, b.y - f); g.quadraticCurveTo(b.x - 5 * b.s, b.y - 4 * b.s, b.x, b.y); g.quadraticCurveTo(b.x + 5 * b.s, b.y - 4 * b.s, b.x + 14 * b.s, b.y - f); g.stroke(); });
      F.layer(0.75, 0.9);
      g.drawImage(this.terrace, -300, 0, this.terrace.vw, this.terrace.vh);
      if (this.meet) {
        F.layer(0.85, 0.95);
        const k = this.kamil;
        F.people.draw(g, F.people.cast.kamil, 1230, 1000, 560, { pose: 'pockets', turn: k.turn, expr: k.expr, talking: F.ui.speaking === 'kamil', lookX: -0.5,
          light: { key: [255, 214, 170], keyA: 0.55, dir: 1, amb: [80, 70, 84], rim: [255, 200, 140], rimA: 1, rimSide: 1 } });
      }
      F.screen();
      G.glow(g, VW * 0.62, VH * 0.52, 900, [255, 190, 130], 0.08);
    },
    exit() { F.grade.tintA = 0; },
  });

  // Berlin's TV tower: a tapering shaft, the sphere, the red-and-white antenna
  function berlinTower(g, x, base, h, col) {
    g.fillStyle = col;
    g.beginPath(); g.moveTo(x - 16, base); g.lineTo(x - 7, base - h * 0.6); g.lineTo(x + 7, base - h * 0.6); g.lineTo(x + 16, base); g.fill();
    const sy = base - h * 0.64;
    const sg = g.createRadialGradient(x - 14, sy - 14, 4, x, sy, 46); sg.addColorStop(0, '#c9d4e2'); sg.addColorStop(0.5, '#6f7c90'); sg.addColorStop(1, '#2d3442');
    g.fillStyle = sg; g.beginPath(); g.arc(x, sy, 44, 0, U.TAU); g.fill();
    g.fillStyle = 'rgba(30,36,46,0.85)'; g.fillRect(x - 44, sy - 3, 88, 6);
    g.fillStyle = col; g.fillRect(x - 7, sy - h * 0.1 - 40, 14, h * 0.1);
    for (let k = 0; k < 6; k++) { g.fillStyle = k % 2 ? '#e8e8ea' : '#c8302a'; g.fillRect(x - 3, sy - 40 - h * 0.1 - (k + 1) * (h * 0.26 / 6), 6, h * 0.26 / 6); }
  }

  // ------------------------------------------------------------------ BERLIN — on the Spree, 08:50, spring after rain
  F.defineScene('berlin_wide', {
    enter() {
      const q = F.quality();
      this.lights = [];
      this.clouds = G.cloudTexture(VW * 2.4, 600, 57, { n: 220, col: [236, 240, 248], a: 0.35, rmin: 80, rmax: 260 });
      const win = { lit: 0.05, warm: [255, 220, 160], wa: 0.5, cw: 3, ch: 4, gx: 4, gy: 5 };
      this.city = G.skyline({ w: VW + 800, h: 1000, base: 640, seed: 407, minW: 40, maxW: 120, minH: 40, maxH: 120, gap: 10, pitched: 0.4, body: 'rgb(118,124,138)', edge: 'rgba(255,255,255,0.35)', fog: [190, 200, 214], fogBottom: 0.35, fogTop: 0.1, win,
        landmarks: [G.lm.glassTower(1500, 80, 230, 'rgb(96,108,128)', win, this.lights), G.lm.slab(320, 110, 170, 'rgb(110,116,130)', win), G.lm.church(1180, 140, 'rgb(100,106,118)', 1.2)], below: 'rgb(90,96,108)', q: q * 0.75 });
      // the Oberbaum-style double-deck brick bridge with two towers; the U-Bahn crosses on top
      this.bridge = F.offscreen(VW + 600, 500, q, (g) => {
        g.translate(300, 0);
        const brick = g.createLinearGradient(0, 180, 0, 420); brick.addColorStop(0, '#9a4a36'); brick.addColorStop(1, '#5a2a20');
        g.fillStyle = brick; g.fillRect(-300, 250, VW + 600, 60);
        for (let k = 0; k < 9; k++) {
          const x = -240 + k * 280;
          g.fillStyle = brick; g.fillRect(x, 250, 50, 170);
          g.fillStyle = '#6a3226'; g.beginPath(); g.moveTo(x + 50, 310); g.bezierCurveTo(x + 90, 380, x + 190, 380, x + 230, 310); g.lineTo(x + 230, 300); g.bezierCurveTo(x + 190, 366, x + 90, 366, x + 50, 300); g.fill();
        }
        // upper deck arcade for the U-Bahn
        g.fillStyle = brick; g.fillRect(-300, 186, VW + 600, 18);
        for (let x = -290; x < VW + 300; x += 60) { g.fillStyle = brick; g.fillRect(x, 204, 14, 46); g.fillStyle = 'rgba(40,20,16,0.5)'; g.beginPath(); g.arc(x + 37, 222, 23, Math.PI, 0); g.fill(); }
        // the two towers
        [760, 1060].forEach((x) => {
          g.fillStyle = brick; g.fillRect(x, 60, 70, 190);
          g.fillStyle = '#3e4a4c'; g.beginPath(); g.moveTo(x - 6, 62); g.lineTo(x + 35, -30); g.lineTo(x + 76, 62); g.fill();
          g.fillStyle = 'rgba(30,20,16,0.6)'; for (let k = 0; k < 3; k++) g.fillRect(x + 25, 90 + k * 44, 20, 28);
          g.fillStyle = 'rgba(255,230,200,0.25)'; g.fillRect(x + 62, 60, 8, 190);
        });
        g.fillStyle = 'rgba(255,255,255,0.18)'; g.fillRect(-300, 250, VW + 600, 3);
      });
      this.train = -900;
      this.shimmer = 0;
      F.camSet(VW / 2, VH / 2 + 20, 1.0); F.cam.par = 14; F.cam.drift = 0.6;
      F.grade.tint = [200, 214, 240]; F.grade.tintA = 0.08; F.grade.vignette = 0.5;
      F.audio.mix({ city: 0.34, pad: 0.35 }, 2);
      F.audio.chord('warm');
    },
    start() { F.camTween({ x: VW / 2 - 80, y: VH / 2, z: 1.08 }, 9, U.easeInOut); },
    update(dt) { this.train += dt * 260; if (this.train > VW + 1400) this.train = -2400; },
    draw(g, dt, t) {
      F.layer(0.02, 0.1);
      const sky = g.createLinearGradient(0, -200, 0, 800);
      sky.addColorStop(0, '#3f6aa6'); sky.addColorStop(0.6, '#8fb0d6'); sky.addColorStop(1, '#d8e2ea');
      g.fillStyle = sky; g.fillRect(-400, -400, VW + 800, VH + 800);
      G.drawClouds(g, this.clouds, -600, -40, VW * 2.4, 600, t * 10, 0.95);
      G.glow(g, 300, 120, 600, [255, 244, 220], 0.3);
      F.layer(0.1, 0.3);
      berlinTower(g, 700, 660, 640, '#8a92a0');
      G.glow(g, 700, 660 - 640 * 0.64 - 18, 30, [255, 255, 255], 0.5);
      F.layer(0.14, 0.35);
      g.drawImage(this.city.canvas, -400, 20, this.city.canvas.vw, this.city.canvas.vh);
      // the Spree
      F.layer(0.3, 0.5);
      const wg = g.createLinearGradient(0, 660, 0, 1000); wg.addColorStop(0, '#9fb3c8'); wg.addColorStop(1, '#3c4c5e');
      g.fillStyle = wg; g.fillRect(-400, 660, VW + 800, 440);
      for (let k = 0; k < 70; k++) { const y = 670 + Math.pow(k / 70, 1.3) * 330; g.fillStyle = `rgba(255,255,255,${0.05 + 0.1 * Math.abs(Math.sin(t * 1.4 + k))})`; g.fillRect(-400 + ((k * 211 + t * 20) % (VW + 800)), y, 60 + k * 2, 2); }
      F.layer(0.4, 0.6);
      g.drawImage(this.bridge, -300, 400, this.bridge.vw, this.bridge.vh);
      // the yellow U-Bahn crossing the upper deck
      const tx = this.train;
      for (let c = 0; c < 4; c++) { const x = tx + c * 230; g.fillStyle = '#f2c230'; g.fillRect(x, 548, 220, 40); g.fillStyle = '#2a2a2e'; for (let w = 0; w < 5; w++) g.fillRect(x + 14 + w * 42, 556, 28, 16); g.fillStyle = '#c89a18'; g.fillRect(x, 582, 220, 6); }
      // reflection of the bridge in the water
      g.save(); g.globalAlpha = 0.18; g.translate(0, 1640); g.scale(1, -1); g.drawImage(this.bridge, -300, 400, this.bridge.vw, this.bridge.vh); g.restore();
      // embankment railing and fresh leaves, foreground
      F.layer(0.95, 1);
      g.fillStyle = '#23262c'; g.fillRect(-300, 960, VW + 600, 160);
      g.strokeStyle = '#15171b'; g.lineWidth = 4; g.beginPath(); g.moveTo(-300, 930); g.lineTo(VW + 300, 930); g.stroke();
      for (let x = -300; x < VW + 300; x += 44) { g.beginPath(); g.moveTo(x, 930); g.lineTo(x, 962); g.stroke(); }
      // a street lamp on the embankment and a pair of bollards
      g.fillStyle = '#16181c'; g.fillRect(1640, 420, 12, 520); g.beginPath(); g.moveTo(1646, 424); g.quadraticCurveTo(1646, 380, 1700, 384); g.lineTo(1700, 392); g.quadraticCurveTo(1656, 390, 1654, 424); g.fill();
      g.fillStyle = '#20232a'; g.fillRect(1686, 390, 34, 14); g.fillStyle = '#16181c'; [300, 360].forEach((x) => { g.fillRect(x, 900, 22, 40); g.beginPath(); g.arc(x + 11, 900, 11, Math.PI, 0); g.fill(); });
    },
    exit() { F.grade.tintA = 0; },
  });

  // ------------------------------------------------------------------ ARBEITSGERICHT BERLIN — Saal 312, Güteverhandlung
  const SEAT = { albers: [960, 950, 620, 0], brandauer: [520, 1330, 820, 0.8], kamil: [1380, 1330, 820, -0.8], wendt: [1620, 1500, 960, -0.8] };
  F.defineScene('arbg_room', {
    enter(o) {
      o = o || {};
      const q = F.quality();
      this.room = F.offscreen(VW + 500, VH + 300, q, (g) => { g.translate(250, 150); paintCourt(g); });
      this.bench = F.offscreen(VW + 400, 400, q, (g) => { g.translate(200, 0); paintBench(g); });
      this.tables = F.offscreen(VW + 600, 700, q, (g) => { g.translate(300, 0); paintCourtTables(g); });
      this.cast = { albers: { expr: 'neutral', turn: 0 }, brandauer: { expr: 'amused', turn: 0.45, pose: 'steeple' }, kamil: { expr: 'pressure', turn: -0.4, pose: 'desk' }, wendt: { expr: 'neutral', turn: -0.4, pose: 'desk' } };
      this.shots = { wide: { x: VW / 2, y: VH / 2, z: 1 }, albers: { x: 960, y: 470, z: 1.9 }, brandauer: { x: 560, y: 690, z: 1.9 }, kamil: { x: 1350, y: 690, z: 1.9 }, wendt: { x: 1570, y: 730, z: 1.8 }, window: { x: 1600, y: 360, z: 1.5 } };
      const s0 = this.shots[o.shot || 'wide'];
      F.camSet(s0.x, s0.y, s0.z); F.cam.par = 12; F.cam.drift = 0.6;
      F.grade.tint = [230, 220, 200]; F.grade.tintA = 0.1; F.grade.vignette = 0.58;
      this.motes = Array.from({ length: 60 }, () => ({ x: 1300 + Math.random() * 600, y: 100 + Math.random() * 700, v: 4 + Math.random() * 8, ph: Math.random() * 6 }));
      F.audio.mix({ room: 0.2, hvac: 0.12, city: 0.06, pad: 0.36 }, 2);
      F.audio.chord('tense');
    },
    shot(name, dur) { const s = this.shots[name]; return F.camTween({ x: s.x, y: s.y, z: s.z }, dur == null ? 1.4 : dur, U.easeInOut); },
    cut(name) { const s = this.shots[name]; F.camSet(s.x, s.y, s.z); },
    update(dt, t) { this.motes.forEach((m) => { m.y -= m.v * dt; m.x += Math.sin(t + m.ph) * 3 * dt; if (m.y < 80) m.y = 800; }); },
    draw(g, dt, t) {
      F.layer(0.6, 0.75);
      g.drawImage(this.room, -250, -150, this.room.vw, this.room.vh);
      // daylight shafts from the tall windows on the right, dust in the light
      g.save(); g.globalCompositeOperation = 'lighter';
      [[1500, 0.16], [1720, 0.12]].forEach(([x, a]) => { const sg = g.createLinearGradient(x, 120, x - 700, 1000); sg.addColorStop(0, `rgba(255,240,210,${a})`); sg.addColorStop(1, 'rgba(255,240,210,0)'); g.fillStyle = sg; g.beginPath(); g.moveTo(x, 120); g.lineTo(x + 160, 120); g.lineTo(x - 400, 1100); g.lineTo(x - 820, 1100); g.closePath(); g.fill(); });
      this.motes.forEach((m) => { g.fillStyle = `rgba(255,240,210,${0.25 + 0.2 * Math.sin(t * 2 + m.ph)})`; g.fillRect(m.x, m.y, 2, 2); });
      g.restore();
      // the judge behind the raised bench
      F.layer(0.8, 0.85);
      const c = this.cast, P = F.people;
      const dayLight = (dir) => ({ key: [255, 244, 226], keyA: 0.85, dir, amb: [86, 80, 78], rim: [255, 236, 200], rimA: 0.6, rimSide: -dir });
      P.draw(g, P.cast.albers, SEAT.albers[0], SEAT.albers[1], SEAT.albers[2], { crop: 'bust', pose: 'desk', turn: c.albers.turn, expr: c.albers.expr, talking: F.ui.speaking === 'albers', lookX: 0, light: dayLight(1) });
      g.drawImage(this.bench, -200, 470, this.bench.vw, this.bench.vh);
      F.layer(1);
      ['brandauer', 'kamil', 'wendt'].forEach((id) => { const s = SEAT[id], k = c[id]; P.draw(g, P.cast[id], s[0], s[1], s[2], { crop: 'bust', pose: k.pose, turn: k.turn, expr: k.expr, talking: F.ui.speaking === id, lookX: s[3], slot: 'ag', light: dayLight(s[3] > 0 ? 1 : -1) }); });
      F.layer(1.05);
      g.drawImage(this.tables, -300, 480, this.tables.vw, this.tables.vh);
    },
    exit() { F.grade.tintA = 0; },
  });

  function paintCourt(g) {
    // pale wood panelling, a high ceiling, tall windows on the right wall
    G.quad(g, [[-250, -150], [VW + 250, -150], [1560, 60], [360, 60]], '#d6d0c4');
    const wall = g.createLinearGradient(0, 60, 0, 700); wall.addColorStop(0, '#cfc6b4'); wall.addColorStop(1, '#a89a82');
    G.quad(g, [[360, 60], [1560, 60], [1560, 700], [360, 700]], wall);
    g.strokeStyle = 'rgba(90,70,50,0.25)'; g.lineWidth = 2; for (let x = 360; x <= 1560; x += 100) { g.beginPath(); g.moveTo(x, 300); g.lineTo(x, 700); g.stroke(); }
    g.fillStyle = 'rgba(120,96,70,0.35)'; g.fillRect(360, 300, 1200, 6);
    // the court's name and the coat-of-arms shield above the bench
    g.fillStyle = '#2a2622'; g.font = '600 26px "Cormorant Garamond", serif'; g.textAlign = 'center'; g.fillText('ARBEITSGERICHT BERLIN', 960, 150);
    g.fillStyle = '#f4f1ea'; g.beginPath(); g.moveTo(930, 175); g.lineTo(990, 175); g.lineTo(990, 225); g.quadraticCurveTo(960, 262, 930, 225); g.closePath(); g.fill();
    g.strokeStyle = '#1b1b1b'; g.lineWidth = 2; g.stroke();
    g.fillStyle = '#1b1b1b'; g.beginPath(); g.ellipse(960, 212, 14, 18, 0, 0, U.TAU); g.fill(); g.beginPath(); g.arc(960, 190, 8, 0, U.TAU); g.fill(); // the bear, abstracted
    // clock and the room sign
    g.fillStyle = '#f4f2ee'; g.beginPath(); g.arc(520, 200, 30, 0, U.TAU); g.fill(); g.strokeStyle = '#333'; g.lineWidth = 3; g.stroke();
    g.strokeStyle = '#222'; g.lineWidth = 3; g.beginPath(); g.moveTo(520, 200); g.lineTo(520, 180); g.moveTo(520, 200); g.lineTo(535, 204); g.stroke();
    // left wall, right wall with windows
    G.quad(g, [[-250, -150], [360, 60], [360, 700], [-250, VH + 150]], '#b2a692');
    G.quad(g, [[1560, 60], [VW + 250, -150], [VW + 250, VH + 150], [1560, 700]], '#bdb19c');
    [[1600, 120, 1720, 90], [1780, 70, 1920, 30]].forEach(([x0, y0, x1, y1]) => {
      const sky = g.createLinearGradient(0, y0, 0, 600); sky.addColorStop(0, '#dfe9f2'); sky.addColorStop(1, '#f4efe2');
      G.quad(g, [[x0, y0], [x1, y1], [x1, 620 + (x1 - 1560) * 0.4], [x0, 620 + (x0 - 1560) * 0.4]], sky);
      g.strokeStyle = 'rgba(120,110,100,0.8)'; g.lineWidth = 6; g.beginPath(); g.moveTo((x0 + x1) / 2, (y0 + y1) / 2); g.lineTo((x0 + x1) / 2, 620 + ((x0 + x1) / 2 - 1560) * 0.4); g.stroke();
      g.fillStyle = 'rgba(120,150,110,0.5)'; g.beginPath(); g.ellipse((x0 + x1) / 2, 500, 70, 80, 0, 0, U.TAU); g.fill(); // a tree outside
    });
    // public benches, back left
    for (let k = 0; k < 3; k++) { g.fillStyle = '#8a7658'; g.fillRect(20 - k * 90, 560 + k * 50, 300, 16); g.fillStyle = '#6e5c44'; g.fillRect(20 - k * 90, 520 + k * 50, 300, 40); }
    const fl = g.createLinearGradient(0, 700, 0, VH + 150); fl.addColorStop(0, '#8e8272'); fl.addColorStop(1, '#3e372f');
    G.quad(g, [[360, 700], [1560, 700], [VW + 250, VH + 150], [-250, VH + 150]], fl);
    g.fillStyle = 'rgba(40,40,44,0.8)'; g.font = '600 14px Inter, sans-serif'; g.textAlign = 'left'; g.fillText('Saal 312', 380, 94);
  }

  function paintBench(g) {
    // raised judges' bench: the chair's seat in the middle, lay-judge seats empty at a Güteverhandlung
    const bg = g.createLinearGradient(0, 0, 0, 400); bg.addColorStop(0, '#b89c74'); bg.addColorStop(1, '#6e5a40');
    g.fillStyle = bg; g.fillRect(440, 60, 1040, 260);
    g.fillStyle = '#d8c29c'; g.fillRect(430, 50, 1060, 16);
    g.strokeStyle = 'rgba(60,44,28,0.35)'; g.lineWidth = 2; for (let x = 440; x <= 1480; x += 130) { g.beginPath(); g.moveTo(x, 70); g.lineTo(x, 320); g.stroke(); }
    // name plates and files on the bench top
    [['Vorsitzende', 960]].forEach(([n, x]) => { g.fillStyle = '#f2eee4'; g.fillRect(x - 80, 22, 160, 26); g.fillStyle = '#2a2622'; g.font = '500 12px Inter, sans-serif'; g.textAlign = 'center'; g.fillText(n, x, 40); });
    g.fillStyle = '#d9cbb0'; g.fillRect(1080, 26, 110, 22); g.fillStyle = '#a2422e'; g.fillRect(1080, 26, 110, 5);
    g.fillStyle = '#e8e4da'; g.fillRect(780, 30, 70, 18);
    // the two empty lay-judge chairs: at a conciliation hearing the presiding judge sits alone
    [640, 1280].forEach((x) => { g.fillStyle = '#3a2e22'; g.fillRect(x - 40, -70, 80, 96); g.fillStyle = 'rgba(255,255,255,0.06)'; g.fillRect(x - 36, -66, 72, 8); });
  }

  function paintCourtTables(g) {
    const top = 170;
    const dg = g.createLinearGradient(0, top, 0, 700); dg.addColorStop(0, '#c4ab84'); dg.addColorStop(1, '#6a5638');
    // two parties' tables, angled toward the bench
    G.quad(g, [[120, 260], [760, 272], [820, 700], [-200, 700]], dg);
    G.quad(g, [[1160, 272], [1560, 300], [2120, 700], [1100, 700]], dg);
    g.fillStyle = 'rgba(255,240,210,0.25)'; g.fillRect(120, 260, 640, 2);
    // files, a laptop on the employer's side, a water jug, microphones
    G.quad(g, [[200, 330], [380, 334], [390, 400], [190, 396]], '#15171b');
    G.quad(g, [[210, 296], [370, 300], [380, 334], [200, 330]], 'rgba(120,140,170,0.6)');
    [[520, 440, 0.1], [1320, 450, -0.08], [1560, 520, 0.12]].forEach(([x, y, a]) => { g.save(); g.translate(x, y); g.rotate(a); g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(-58, -36, 120, 82); g.fillStyle = '#ece7dc'; g.fillRect(-60, -40, 120, 80); g.fillStyle = 'rgba(40,40,44,0.35)'; for (let k = 0; k < 7; k++) g.fillRect(-50, -30 + k * 10, 90, 2.5); g.restore(); });
    [[700, 320], [1230, 330]].forEach(([x, y]) => { g.fillStyle = '#1a1a1e'; g.fillRect(x - 3, y - 40, 6, 44); g.beginPath(); g.arc(x, y - 44, 7, 0, U.TAU); g.fill(); g.fillStyle = '#222'; g.fillRect(x - 20, y, 40, 8); });
    g.fillStyle = 'rgba(200,220,240,0.5)'; g.fillRect(1440, 340, 22, 48);
    [['Beklagte', 560, 320], ['Kläger', 1300, 330]].forEach(([n, x, y]) => { g.fillStyle = '#f2efe8'; g.fillRect(x - 50, y - 14, 100, 20); g.fillStyle = '#333'; g.font = '600 11px Inter, sans-serif'; g.textAlign = 'center'; g.fillText(n, x, y); });
  }
})(window.F);
