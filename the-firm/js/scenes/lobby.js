/* THE FIRM — HQ lobby (Munich) and the glass elevator ascent */
(function (F) {
  'use strict';
  const U = F.U, G = F.gfx;
  const VW = F.VW, VH = F.VH;

  // ------------------------------------------------------------------ LOBBY
  const VP = [1010, 500];
  F.defineScene('lobby', {
    enter() {
      const q = F.quality();
      const r = U.rng(8);
      // outside the glass: blurred street bokeh
      this.outside = F.offscreen(700, 1100, q * 0.5, (g) => {
        const gr = g.createLinearGradient(0, 0, 0, 1100);
        gr.addColorStop(0, '#0d1219'); gr.addColorStop(0.6, '#1c2430'); gr.addColorStop(1, '#0c0f14');
        g.fillStyle = gr; g.fillRect(0, 0, 700, 1100);
        g.filter = 'blur(14px)';
        // facade of the building across the street
        for (let i = 0; i < 40; i++) {
          const warm = r() < 0.7;
          g.fillStyle = warm ? `rgba(255,${180 + r() * 40 | 0},110,${0.3 + r() * 0.4})` : `rgba(170,200,255,${0.2 + r() * 0.3})`;
          g.fillRect(r() * 700, 100 + r() * 500, 30 + r() * 30, 40 + r() * 20);
        }
        // street lamps and car lights bokeh
        for (let i = 0; i < 26; i++) {
          const x = r() * 700, y = 640 + r() * 180, rr = 10 + r() * 26;
          g.fillStyle = r() < 0.3 ? 'rgba(255,60,40,0.55)' : `rgba(255,${200 + r() * 40 | 0},150,0.5)`;
          g.beginPath(); g.arc(x, y, rr, 0, U.TAU); g.fill();
        }
        g.filter = 'none';
      });
      this.lobby = F.offscreen(VW + 400, VH + 200, q, (g) => { g.translate(200, 100); paintLobby(g, r); });
      this.glass = new G.GlassDrops([{ x: 0, y: 40, w: 330, h: 900 }], { beads: 500, drips: 8, light: [200, 214, 235], seed: 12 });
      this.rain = new G.Rain(260, { angle: 0.1, speed: 1500, len: 50, alpha: 0.25, x0: -100, x1: 420, y0: -100, y1: 1100 });
      this.cars = [];
      F.camSet(VW / 2 - 40, VH / 2, 1.0);
      F.cam.par = 20; F.cam.drift = 0.9;
      F.grade.tint = [120, 100, 80]; F.grade.tintA = 0.15; F.grade.vignette = 0.6;
    },
    start() { F.camTween({ x: VW / 2 + 190, y: VH / 2 + 20, z: 1.22 }, 6.5, U.easeInOut); },
    update(dt, t) {
      this.glass.update(dt); this.rain.update(dt);
      if (Math.random() < dt * 0.6) this.cars.push({ x: -100, v: 500 + Math.random() * 300, y: 760 + Math.random() * 40 });
      this.cars.forEach((c) => (c.x += c.v * dt));
      this.cars = this.cars.filter((c) => c.x < 800);
    },
    draw(g, dt, t) {
      // outside view through the glass facade (left wall)
      F.layer(0.55);
      g.drawImage(this.outside, -150, -20, 700, 1100);
      this.cars.forEach((c) => { G.glow(g, c.x - 150, c.y, 60, [255, 240, 220], 0.4); G.glow(g, c.x - 250, c.y + 5, 30, [255, 40, 30], 0.4); });
      this.rain.draw(g, 0.7);
      F.layer(1);
      g.drawImage(this.lobby, -200, -100, VW + 400, VH + 200);
      // glass & droplets on the facade
      g.save();
      g.beginPath(); g.moveTo(-200, -60); g.lineTo(360, 110); g.lineTo(360, 790); g.lineTo(-200, 1140); g.closePath(); g.clip();
      this.glass.draw(g, 0.9);
      g.restore();
      // live elements: elevator floor indicators
      const ind = [[1512, 332], [1640, 300], [1790, 262]];
      ind.forEach(([x, y], i) => {
        const floorNum = i === 0 ? 'EG' : String((((t * 0.7 + i * 4) | 0) % 26) + 1);
        g.fillStyle = '#ffb35a';
        g.font = '500 20px "IBM Plex Mono", monospace';
        g.textAlign = 'center';
        g.fillText(floorNum, x, y);
        G.glow(g, x, y - 7, 30, [255, 170, 80], 0.35);
      });
      // guard (seated, behind reception)
      F.people.draw(g, F.people.cast.guard, 1010, 910, 390, { crop: 'bust', pose: 'desk', turn: -0.35, expr: 'neutral', light: { key: [255, 214, 170], keyA: 0.85, dir: 1, amb: [70, 62, 60], rim: [150, 175, 220], rimA: 0.45, rimSide: -1 }, lookX: -0.6 });
      // desk front (occludes guard's lower half)
      paintDeskFront(g, t);
      // lamp flicker-free warm glows
      G.glow(g, 1010, 250, 380, [255, 200, 140], 0.08);
    },
  });

  function paintLobby(g, r) {
    // ceiling
    g.fillStyle = '#0e0d0c';
    G.quad(g, [[-100, -100], [VW + 100, -100], [1560, 150], [420, 150]], '#141210');
    // linear light slots converging
    for (let k = 0; k < 7; k++) {
      const xb = -200 + k * 360, xt = 470 + k * 175;
      g.strokeStyle = 'rgba(255,236,205,0.85)'; g.lineWidth = 3;
      g.beginPath(); g.moveTo(xb, -100); g.lineTo(xt, 150); g.stroke();
      g.strokeStyle = 'rgba(255,220,170,0.12)'; g.lineWidth = 16;
      g.beginPath(); g.moveTo(xb, -100); g.lineTo(xt, 150); g.stroke();
    }
    // back wall: dark travertine / stone slabs
    const bw = g.createLinearGradient(0, 150, 0, 760);
    bw.addColorStop(0, '#2a2521'); bw.addColorStop(1, '#1a1714');
    g.fillStyle = bw; g.fillRect(420, 150, 1140, 610);
    g.strokeStyle = 'rgba(0,0,0,0.35)'; g.lineWidth = 2;
    for (let k = 1; k < 6; k++) { g.beginPath(); g.moveTo(420 + k * 190, 150); g.lineTo(420 + k * 190, 760); g.stroke(); }
    for (let k = 1; k < 4; k++) { g.beginPath(); g.moveTo(420, 150 + k * 152); g.lineTo(1560, 150 + k * 152); g.stroke(); }
    G.speckle(g, 420, 150, 1140, 610, 5000, [255, 240, 220], 0.01, 0.05, 3, 1.5);
    // wall wash lights (grazing)
    for (let k = 0; k < 5; k++) {
      const x = 560 + k * 220;
      const wg = g.createRadialGradient(x, 150, 0, x, 150, 320);
      wg.addColorStop(0, 'rgba(255,210,150,0.28)'); wg.addColorStop(1, 'rgba(255,210,150,0)');
      g.fillStyle = wg;
      g.beginPath(); g.moveTo(x - 20, 150); g.lineTo(x + 20, 150); g.lineTo(x + 110, 520); g.lineTo(x - 110, 520); g.closePath(); g.fill();
    }
    // brass logo
    g.save();
    g.textAlign = 'center';
    g.font = '500 78px "Cormorant Garamond", serif';
    g.fillStyle = '#d8b878';
    g.shadowColor = 'rgba(255,190,110,0.6)'; g.shadowBlur = 30;
    g.fillText('A D L E R   W E N D T', 1000, 420);
    g.shadowBlur = 0;
    g.font = '500 18px "Barlow Condensed", sans-serif';
    g.fillStyle = 'rgba(216,184,120,0.8)';
    g.fillText('R E C H T S A N W Ä L T E   ·   M Ü N C H E N   ·   W A R S Z A W A   ·   F R A N K F U R T', 1000, 462);
    g.restore();
    // left wall = glass facade in perspective (window area kept transparent)
    g.save();
    g.globalCompositeOperation = 'destination-out';
    g.beginPath(); g.moveTo(-200, -60); g.lineTo(360, 110); g.lineTo(360, 790); g.lineTo(-200, 1140); g.closePath(); g.fill();
    g.restore();
    // mullions of the facade
    g.fillStyle = '#0a0a0b';
    [[-200, 0], [60, 0.46], [240, 0.78], [360, 1]].forEach(([x]) => {
      const tt = (x + 200) / 560;
      const yt = U.lerp(-60, 110, tt), yb = U.lerp(1140, 790, tt);
      g.fillRect(x - 6, yt, 12 * (1 - tt * 0.5), yb - yt);
    });
    g.fillRect(360, 110, 60, 680);
    // glass tint + reflection of interior lights
    g.save();
    g.beginPath(); g.moveTo(-200, -60); g.lineTo(360, 110); g.lineTo(360, 790); g.lineTo(-200, 1140); g.closePath();
    g.fillStyle = 'rgba(30,40,55,0.25)'; g.fill();
    g.clip();
    g.strokeStyle = 'rgba(255,230,190,0.1)'; g.lineWidth = 10;
    for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(-200, 200 + k * 60); g.lineTo(360, 280 + k * 40); g.stroke(); }
    g.restore();
    // right wall: walnut panelling + elevator bank
    const rw = g.createLinearGradient(1560, 0, VW + 100, 0);
    rw.addColorStop(0, '#2c1d13'); rw.addColorStop(1, '#3d2819');
    G.quad(g, [[1560, 150], [VW + 400, -220], [VW + 400, 1300], [1560, 760]], rw);
    // panel grooves
    g.strokeStyle = 'rgba(0,0,0,0.35)'; g.lineWidth = 2;
    for (let k = 1; k < 8; k++) {
      const tt = k / 8; const x = U.lerp(1560, VW + 200, tt);
      g.beginPath(); g.moveTo(x, U.lerp(150, -120, tt)); g.lineTo(x, U.lerp(760, 1200, tt)); g.stroke();
    }
    // elevator doors (brass) in perspective
    const doors = [[1460, 1570], [1590, 1720], [1740, 1900]];
    doors.forEach(([x0, x1], i) => {
      const t0 = (x0 - 1560) / (VW + 200 - 1560), t1 = (x1 - 1560) / (VW + 200 - 1560);
      const X0 = x0 + 50, X1 = x1 + 50;
      const top0 = U.lerp(360, 300, i / 3) , top1 = top0 - 30;
      const bot0 = U.lerp(780, 830, i / 3) + 10, bot1 = bot0 + 40;
      const dg = g.createLinearGradient(X0, 0, X1, 0);
      dg.addColorStop(0, '#6b5230'); dg.addColorStop(0.5, '#b8955a'); dg.addColorStop(1, '#5a4326');
      G.quad(g, [[X0, top0], [X1, top1], [X1, bot1], [X0, bot0]], dg);
      g.strokeStyle = 'rgba(0,0,0,0.6)'; g.lineWidth = 2;
      g.beginPath(); g.moveTo((X0 + X1) / 2, (top0 + top1) / 2); g.lineTo((X0 + X1) / 2, (bot0 + bot1) / 2); g.stroke();
      // frame
      g.strokeStyle = '#1b130c'; g.lineWidth = 8;
      g.beginPath(); g.moveTo(X0, bot0); g.lineTo(X0, top0); g.lineTo(X1, top1); g.lineTo(X1, bot1); g.stroke();
      // reflected highlight
      g.fillStyle = 'rgba(255,230,180,0.15)';
      G.quad(g, [[X0 + 10, top0 + 10], [X0 + 24, top0 + 8], [X0 + 24, bot0 - 10], [X0 + 10, bot0 - 8]], 'rgba(255,230,180,0.18)');
      // indicator housing
      g.fillStyle = '#0c0a08';
      g.fillRect((X0 + X1) / 2 - 36, top0 - 60, 72, 34);
    });
    // floor: polished dark stone
    const fl = g.createLinearGradient(0, 760, 0, VH);
    fl.addColorStop(0, '#1d1a17'); fl.addColorStop(1, '#0b0a09');
    G.quad(g, [[420, 760], [1560, 760], [VW + 200, 1200], [-200, 1200]], fl);
    // floor seams in perspective
    g.strokeStyle = 'rgba(0,0,0,0.4)'; g.lineWidth = 1.5;
    for (let k = -6; k <= 6; k++) { g.beginPath(); g.moveTo(VP[0] + k * 95, 760); g.lineTo(VP[0] + k * 420, VH + 100); g.stroke(); }
    [790, 840, 920, 1040].forEach((y) => { g.beginPath(); g.moveTo(-200, y); g.lineTo(VW + 200, y); g.stroke(); });
    // reflections on floor: logo glow, desk glow, ceiling lines
    g.save();
    g.globalCompositeOperation = 'lighter';
    const rf = g.createLinearGradient(0, 760, 0, 1080);
    rf.addColorStop(0, 'rgba(255,210,150,0.22)'); rf.addColorStop(1, 'rgba(255,210,150,0)');
    g.fillStyle = rf;
    g.fillRect(700, 770, 620, 310);
    for (let k = 0; k < 7; k++) {
      const xt = 470 + k * 175;
      const rg = g.createLinearGradient(0, 760, 0, 1080);
      rg.addColorStop(0, 'rgba(255,236,205,0.14)'); rg.addColorStop(1, 'rgba(255,236,205,0)');
      g.strokeStyle = rg; g.lineWidth = 5;
      g.beginPath(); g.moveTo(xt, 770); g.lineTo(xt + (xt - VP[0]) * 0.8, 1080); g.stroke();
    }
    g.restore();
    // sculpture — tall bronze abstract form, left-center
    g.save();
    g.translate(560, 800);
    const sg = g.createLinearGradient(-60, 0, 60, 0);
    sg.addColorStop(0, '#2a1c10'); sg.addColorStop(0.3, '#8a6a3c'); sg.addColorStop(1, '#130c06');
    g.fillStyle = sg;
    g.beginPath();
    g.moveTo(-20, 0); g.bezierCurveTo(-70, -120, 40, -220, -10, -360); g.bezierCurveTo(60, -250, -10, -140, 30, 0); g.closePath(); g.fill();
    g.fillStyle = '#0f0d0b'; g.fillRect(-60, 0, 120, 30);
    g.fillStyle = 'rgba(255,220,170,0.12)'; g.fillRect(-60, 0, 120, 2);
    g.restore();
    G.shadow(g, 560, 832, 90, 14, 0.6);
  }

  function paintDeskFront(g, t) {
    // reception desk: backlit onyx panel
    const x0 = 700, x1 = 1320, y0 = 650, y1 = 800;
    const og = g.createLinearGradient(0, y0, 0, y1);
    og.addColorStop(0, '#f3c98a'); og.addColorStop(0.5, '#d49a58'); og.addColorStop(1, '#8a5a2c');
    g.fillStyle = og;
    g.fillRect(x0, y0 + 16, x1 - x0, y1 - y0 - 16);
    // onyx veins
    g.save();
    g.beginPath(); g.rect(x0, y0 + 16, x1 - x0, y1 - y0 - 16); g.clip();
    g.strokeStyle = 'rgba(120,70,30,0.35)'; g.lineWidth = 3;
    for (let k = 0; k < 14; k++) { g.beginPath(); g.moveTo(x0 + k * 50, y0 + 16); g.bezierCurveTo(x0 + k * 50 + 40, y0 + 60, x0 + k * 50 - 30, y0 + 100, x0 + k * 50 + 20, y1); g.stroke(); }
    g.strokeStyle = 'rgba(255,240,210,0.35)'; g.lineWidth = 1.5;
    for (let k = 0; k < 10; k++) { g.beginPath(); g.moveTo(x0 + k * 70 + 20, y0 + 16); g.bezierCurveTo(x0 + k * 70 - 20, y0 + 70, x0 + k * 70 + 50, y0 + 110, x0 + k * 70, y1); g.stroke(); }
    g.restore();
    // top slab
    g.fillStyle = '#0f0c0a'; g.fillRect(x0 - 16, y0, x1 - x0 + 32, 18);
    g.fillStyle = 'rgba(255,230,190,0.3)'; g.fillRect(x0 - 16, y0, x1 - x0 + 32, 1.5);
    G.glow(g, (x0 + x1) / 2, y1, 420, [255, 180, 100], 0.2);
    // monitor glow on guard
    G.glow(g, 1060, 640, 90, [160, 200, 255], 0.2);
  }

  // ------------------------------------------------------------------ ELEVATOR (glass cab on the facade)
  F.defineScene('elevator', {
    enter(o) {
      const q = F.quality();
      const win = { lit: 0.18, warm: [255, 196, 120], wa: 0.8, cw: 3, ch: 4, gx: 4, gy: 5 };
      this.far = G.skyline({ w: VW + 800, h: 1400, base: 1000, seed: 21, minW: 30, maxW: 90, minH: 12, maxH: 60, gap: 10, pitched: 0.6, body: 'rgb(58,66,80)', fog: [100, 106, 118], fogBottom: 0.5, fogTop: 0.3, win: Object.assign({}, win, { lit: 0.1 }), landmarks: [G.lm.tvTower(520, 380, 'rgb(60,68,82)', 1.1), G.lm.twinSlabs(1700, 180, 'rgb(58,66,80)', win, 0.95)], below: 'rgb(70,76,88)', q: q * 0.7 });
      this.mid = G.skyline({ w: VW + 800, h: 1500, base: 1060, seed: 33, minW: 36, maxW: 110, minH: 30, maxH: 110, gap: 8, pitched: 0.75, body: 'rgb(34,40,50)', edge: 'rgba(150,160,175,0.25)', fog: [80, 88, 100], fogBottom: 0.4, win, landmarks: [G.lm.twinDomes(1000, 185, 'rgb(36,41,50)', 1.35), G.lm.church(640, 120, 'rgb(34,40,50)', 1.1)], groundGlow: [255, 170, 90], groundGlowA: 0.3, below: 'rgb(30,34,42)', q: q * 0.8 });
      this.near = G.skyline({ w: VW + 900, h: 1800, base: 1300, seed: 47, minW: 90, maxW: 220, minH: 80, maxH: 260, gap: 30, pitched: 0.8, body: 'rgb(15,18,24)', edge: 'rgba(120,130,150,0.3)', win: Object.assign({}, win, { lit: 0.25, cw: 6, ch: 8, gx: 7, gy: 9, wa: 0.9 }), groundGlow: [255, 160, 80], groundGlowA: 0.35, below: 'rgb(12,14,18)', q: q * 0.85 });
      this.clouds = G.cloudTexture(VW * 2.2, 700, 4, { n: 240, col: [150, 160, 176], a: 0.16, rmin: 80, rmax: 280 });
      this.glass = new G.GlassDrops([{ x: 330, y: 60, w: 1260, h: 860 }], { beads: 1300, drips: 16, light: [205, 215, 232], seed: 21, scale: 1.2 });
      this.rain = new G.Rain(700, { angle: 0.14, speed: 1400, len: 40, alpha: 0.2 });
      this.alt = 0; // 0..1 ascent
      this.floor = 0;
      this.target = (o && o.floor) || 22;
      this.dur = 6.2;
      F.camSet(VW / 2, VH / 2, 1.0);
      F.cam.par = 12; F.cam.drift = 0.35;
      F.grade.tint = [70, 100, 140]; F.grade.tintA = 0.3; F.grade.vignette = 0.66;
      this.lastFloor = -1;
    },
    update(dt, t) {
      this.glass.update(dt); this.rain.update(dt);
      const k = U.clamp(t / this.dur, 0, 1);
      this.alt = U.easeInOut(k);
      this.floor = Math.round(this.alt * this.target);
      if (this.floor !== this.lastFloor) { this.lastFloor = this.floor; if (this.floor > 0) F.audio.tone(2200, 0.04, 0.006); }
    },
    draw(g, dt, t) {
      const a = this.alt;
      const lift = (1 - a); // at street level the city towers above; at altitude it settles below the horizon
      F.layer(0.02, 0.1);
      const sky = g.createLinearGradient(0, -300, 0, 1100);
      sky.addColorStop(0, '#111823'); sky.addColorStop(0.5, '#2d3848'); sky.addColorStop(1, '#6a6f78');
      g.fillStyle = sky; g.fillRect(-400, -400, VW + 800, VH + 800);
      G.glow(g, 400, 800, 700, [150, 120, 100], 0.22);
      F.layer(0.04, 0.1);
      G.drawClouds(g, this.clouds, -500, -60 - lift * 40, VW * 2.2, 700, t * 18, 0.85);
      F.layer(0.1, 0.2);
      g.drawImage(this.far.canvas, -400, -300 - lift * 160, this.far.canvas.vw, this.far.canvas.vh);
      F.layer(0.16, 0.3);
      g.drawImage(this.mid.canvas, -400, -300 - lift * 420, this.mid.canvas.vw, this.mid.canvas.vh);
      F.layer(0.24, 0.4);
      g.drawImage(this.near.canvas, -450, -300 - lift * 900, this.near.canvas.vw, this.near.canvas.vh);
      // passing facade fins (motion cue) at the glass edges
      F.layer(1);
      const speed = Math.sin(Math.min(1, t / this.dur) * Math.PI);
      const off = (a * this.target * 180) % 180;
      g.fillStyle = 'rgba(10,12,16,0.9)';
      for (let k = -1; k < 8; k++) {
        const y = k * 180 + off;
        g.fillRect(250, y, 90, 16 + speed * 10);
        g.fillRect(1580, y, 90, 16 + speed * 10);
      }
      F.screen();
      this.rain.draw(g, 0.8);
      F.layer(1);
      // glass tint & droplets
      g.fillStyle = 'rgba(20,30,44,0.18)';
      g.fillRect(330, 60, 1260, 860);
      this.glass.draw(g, 0.95);
      // glass panel joints + ceiling strip reflection
      g.fillStyle = 'rgba(8,10,12,0.9)';
      g.fillRect(746, 60, 8, 860); g.fillRect(1166, 60, 8, 860);
      g.fillStyle = 'rgba(255,240,215,0.07)';
      g.fillRect(330, 118, 1260, 3);
      const sheen = g.createLinearGradient(330, 60, 900, 900);
      sheen.addColorStop(0, 'rgba(200,215,235,0.06)'); sheen.addColorStop(0.5, 'rgba(200,215,235,0)');
      g.fillStyle = sheen; g.fillRect(330, 60, 1260, 860);
      // cab frame: steel posts, brass rail, ceiling
      const post = g.createLinearGradient(0, 0, 330, 0);
      post.addColorStop(0, '#07080a'); post.addColorStop(0.8, '#1a1c20'); post.addColorStop(1, '#2d3036');
      g.fillStyle = post; g.fillRect(-200, -100, 530, 1300);
      const post2 = g.createLinearGradient(1590, 0, VW, 0);
      post2.addColorStop(0, '#2d3036'); post2.addColorStop(0.2, '#15171a'); post2.addColorStop(1, '#060708');
      g.fillStyle = post2; g.fillRect(1590, -100, 530, 1300);
      g.fillStyle = '#0b0c0e'; g.fillRect(-200, -100, VW + 400, 160);
      // ceiling light strip
      g.fillStyle = 'rgba(255,240,215,0.9)'; g.fillRect(420, 40, 1080, 4);
      G.glow(g, 960, 50, 600, [255, 230, 190], 0.12);
      // floor
      g.fillStyle = '#0a0a0b'; g.fillRect(-200, 920, VW + 400, 300);
      g.fillStyle = 'rgba(200,200,210,0.12)'; g.fillRect(330, 920, 1260, 2);
      // brass handrail
      const rail = g.createLinearGradient(0, 812, 0, 836);
      rail.addColorStop(0, '#f2d59a'); rail.addColorStop(0.5, '#a57f45'); rail.addColorStop(1, '#3a2a14');
      g.fillStyle = rail; g.fillRect(300, 812, 1320, 22);
      g.fillStyle = '#20180e'; g.fillRect(420, 834, 14, 90); g.fillRect(1486, 834, 14, 90);
      // floor indicator panel on the right post
      g.fillStyle = '#050506'; g.fillRect(1660, 360, 150, 210);
      g.strokeStyle = 'rgba(200,170,110,0.4)'; g.lineWidth = 1.5; g.strokeRect(1660, 360, 150, 210);
      g.textAlign = 'center';
      g.fillStyle = '#ffb35a';
      g.font = '500 76px "IBM Plex Mono", monospace';
      const fl = this.floor === 0 ? 'EG' : String(this.floor).padStart(2, '0');
      g.fillText(fl, 1735, 470);
      G.glow(g, 1735, 445, 90, [255, 160, 70], 0.3);
      g.font = '500 16px "Barlow Condensed", sans-serif';
      g.fillStyle = 'rgba(255,179,90,0.7)';
      g.fillText(a < 0.98 ? '▲  AUFWÄRTS' : '●  ' + this.target + '. OG', 1735, 540);
      // button column
      for (let k = 0; k < 6; k++) {
        const lit = k === 1;
        g.fillStyle = lit ? '#ffcf8a' : '#2a2c30';
        g.beginPath(); g.arc(1735, 620 + k * 44, 12, 0, U.TAU); g.fill();
        if (lit) G.glow(g, 1735, 620 + k * 44, 30, [255, 190, 110], 0.5);
      }
    },
  });
})(window.F);
