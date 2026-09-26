/* THE FIRM — Silform, Gliwice: the plant gate at the 06:00 shift change in snow, and the meeting room above Hall 2. */
(function (F) {
  'use strict';
  const U = F.U, G = F.gfx;
  const VW = F.VW, VH = F.VH;

  // ------------------------------------------------------------------ SILFORM GATE — 05:48, February, snow
  F.defineScene('silform_gate', {
    enter() {
      const q = F.quality();
      const r = U.rng(301);
      this.lights = [];
      const win = { lit: 0.2, warm: [255, 190, 120], wa: 0.8, cw: 3, ch: 4, gx: 4, gy: 5 };
      this.far = G.skyline({ w: VW + 800, h: 1000, base: 560, seed: 305, minW: 30, maxW: 90, minH: 10, maxH: 60, gap: 14, pitched: 0.7, body: 'rgb(34,38,50)', edge: 'rgba(220,228,240,0.5)', fog: [70, 76, 94], fogBottom: 0.55, fogTop: 0.2, win,
        landmarks: [G.lm.headframe(420, 190, 'rgb(30,34,46)', win, 1.1, this.lights), G.lm.chimney(1320, 300, 'rgb(30,34,46)', win, 1.2, this.lights), G.lm.radioTower(1720, 280, 'rgb(34,38,50)', 0.8, this.lights)], below: 'rgb(28,31,40)', q: q * 0.6 });
      // the plant: a long die-casting hall with sawtooth roof, warm clerestories, the sign
      this.plant = F.offscreen(VW + 700, 700, q * 0.9, (g) => {
        g.translate(350, 0);
        g.fillStyle = '#12141b'; g.fillRect(-350, 300, VW + 700, 400);
        for (let k = 0; k < 22; k++) {
          const x = -340 + k * 120;
          g.beginPath(); g.moveTo(x, 300); g.lineTo(x + 86, 226); g.lineTo(x + 86, 300); g.closePath(); g.fillStyle = '#151821'; g.fill();
          const cl = g.createLinearGradient(0, 230, 0, 300); cl.addColorStop(0, 'rgba(255,196,120,0.95)'); cl.addColorStop(1, 'rgba(255,150,70,0.6)');
          g.fillStyle = cl; g.beginPath(); g.moveTo(x + 78, 236); g.lineTo(x + 86, 230); g.lineTo(x + 86, 298); g.lineTo(x + 78, 298); g.fill();
          g.fillStyle = 'rgba(238,242,250,0.85)'; g.beginPath(); g.moveTo(x, 300); g.lineTo(x + 86, 226); g.lineTo(x + 86, 231); g.lineTo(x + 5, 302); g.fill();
        }
        // facade: ribbed cladding, dock doors, a lit loading bay
        g.strokeStyle = 'rgba(255,255,255,0.03)'; g.lineWidth = 2; for (let x = -350; x < VW + 350; x += 9) { g.beginPath(); g.moveTo(x, 305); g.lineTo(x, 700); g.stroke(); }
        [[120, 0], [380, 1], [640, 0], [1500, 0], [1760, 0]].forEach(([x, lit]) => {
          g.fillStyle = lit ? '#e8b878' : '#1b1f28'; g.fillRect(x, 470, 150, 150);
          if (lit) { G.glow(g, x + 75, 560, 220, [255, 180, 100], 0.35); g.fillStyle = 'rgba(40,30,20,0.5)'; for (let k = 0; k < 7; k++) g.fillRect(x, 470 + k * 21, 150, 2); g.fillStyle = '#20160e'; g.fillRect(x + 30, 560, 40, 60); g.fillRect(x + 90, 540, 30, 80); }
          else { g.fillStyle = 'rgba(255,255,255,0.04)'; for (let k = 0; k < 10; k++) g.fillRect(x, 470 + k * 15, 150, 1.5); }
        });
        // the sign — cold white letters, one tube flickers in draw()
        g.font = '700 64px "Barlow Condensed", sans-serif'; g.textAlign = 'left';
        g.shadowColor = 'rgba(160,200,255,0.9)'; g.shadowBlur = 22; g.fillStyle = '#e6f0ff';
        g.shadowBlur = 0; g.font = '500 20px "Barlow Condensed", sans-serif'; g.fillStyle = 'rgba(200,215,240,0.7)'; g.fillText('ODLEWNIA CIŚNIENIOWA · HALA 1 · HALA 2', 984, 432);
        // stack
        g.fillStyle = '#0e1016'; g.fillRect(1860, 60, 34, 250); g.fillStyle = 'rgba(255,255,255,0.06)'; g.fillRect(1860, 90, 34, 4); g.fillRect(1860, 150, 34, 4);
      });
      // foreground: gate, guard booth, fence, lamps, cars, the notice board
      this.front = F.offscreen(VW + 600, VH + 200, q, (g) => {
        g.translate(300, 0);
        const gr = g.createLinearGradient(0, 700, 0, VH + 200);
        gr.addColorStop(0, '#9aa1ad'); gr.addColorStop(0.3, '#6e7480'); gr.addColorStop(1, '#2a2d34');
        g.fillStyle = gr; g.beginPath(); g.moveTo(-300, 760); g.lineTo(VW + 300, 740); g.lineTo(VW + 300, VH + 200); g.lineTo(-300, VH + 200); g.fill();
        // tyre tracks through the snow toward the gate
        g.strokeStyle = 'rgba(40,44,52,0.35)'; g.lineWidth = 16;
        [[-40, 0], [60, 0], [360, 1], [460, 1]].forEach(([dx]) => { g.beginPath(); g.moveTo(820 + dx * 0.35, 760); g.bezierCurveTo(840 + dx * 0.6, 850, 700 + dx, 960, 560 + dx * 1.6, VH + 200); g.stroke(); });
        // fence
        g.strokeStyle = 'rgba(20,22,28,0.8)'; g.lineWidth = 3;
        for (let x = -300; x < 640; x += 36) { g.beginPath(); g.moveTo(x, 700); g.lineTo(x, 772); g.stroke(); }
        for (let x = 1180; x < VW + 300; x += 36) { g.beginPath(); g.moveTo(x, 690); g.lineTo(x, 764); g.stroke(); }
        g.lineWidth = 2; [[-300, 640, 704], [1180, VW + 300, 694]].forEach(([a, b, y]) => { g.beginPath(); g.moveTo(a, y); g.lineTo(b, y - 4); g.stroke(); g.beginPath(); g.moveTo(a, y + 30); g.lineTo(b, y + 26); g.stroke(); });
        // guard booth with a lit window
        g.fillStyle = '#1a1d24'; g.fillRect(640, 600, 150, 170); g.fillStyle = '#e7eef2'; g.fillRect(630, 590, 170, 14);
        g.fillStyle = '#f4d9a0'; g.fillRect(660, 632, 110, 64); G.glow(g, 715, 664, 160, [255, 210, 150], 0.45);
        g.fillStyle = '#2a2016'; g.fillRect(700, 650, 22, 46); g.beginPath(); g.arc(711, 646, 10, 0, U.TAU); g.fill();
        g.fillStyle = 'rgba(240,244,250,0.9)'; g.fillRect(630, 586, 170, 6);
        g.fillStyle = '#e04030'; g.font = '600 14px "Barlow Condensed", sans-serif'; g.textAlign = 'center'; g.fillText('PORTIERNIA · BRAMA 2', 715, 620);
        // barrier arm
        g.save(); g.translate(800, 720); g.rotate(-0.02);
        for (let k = 0; k < 10; k++) { g.fillStyle = k % 2 ? '#f0f0f0' : '#d42a20'; g.fillRect(k * 38, -6, 38, 12); }
        g.restore(); g.fillStyle = '#20232a'; g.fillRect(790, 700, 20, 70);
        // notice board with the management communiqué
        g.fillStyle = '#2a2622'; g.fillRect(470, 610, 130, 110); g.fillStyle = '#1c1a17'; g.fillRect(528, 720, 12, 60);
        g.fillStyle = '#efe9dc'; g.fillRect(482, 622, 50, 70); g.fillRect(540, 626, 50, 60);
        g.fillStyle = 'rgba(40,40,44,0.6)'; for (let k = 0; k < 8; k++) g.fillRect(487, 636 + k * 6, 40, 1.6);
        g.fillStyle = '#b3322b'; g.font = '700 7px Inter, sans-serif'; g.textAlign = 'left'; g.fillText('KOMUNIKAT', 487, 631);
        g.fillStyle = 'rgba(240,244,250,0.9)'; g.fillRect(466, 604, 138, 6);
        // parked cars under snow
        [[1260, 800, 1], [1500, 812, 1.08], [1760, 826, 1.16], [-120, 820, 1.1], [120, 808, 1.02]].forEach(([x, y, s]) => {
          g.fillStyle = '#1b1e25'; G.roundRect(g, x, y - 46 * s, 210 * s, 50 * s, 12 * s); g.fill();
          g.beginPath(); g.moveTo(x + 40 * s, y - 46 * s); g.lineTo(x + 70 * s, y - 80 * s); g.lineTo(x + 150 * s, y - 80 * s); g.lineTo(x + 180 * s, y - 46 * s); g.fill();
          g.fillStyle = 'rgba(236,240,248,0.92)'; g.beginPath(); g.moveTo(x + 66 * s, y - 80 * s); g.quadraticCurveTo(x + 110 * s, y - 92 * s, x + 154 * s, y - 80 * s); g.lineTo(x + 150 * s, y - 76 * s); g.lineTo(x + 70 * s, y - 76 * s); g.fill();
          g.fillRect(x + 4 * s, y - 50 * s, 38 * s, 6 * s); g.fillRect(x + 176 * s, y - 50 * s, 30 * s, 6 * s);
          g.fillStyle = '#0b0c10'; g.beginPath(); g.arc(x + 44 * s, y + 4, 18 * s, 0, U.TAU); g.arc(x + 166 * s, y + 4, 18 * s, 0, U.TAU); g.fill();
        });
        // snow banks along the fence
        g.fillStyle = 'rgba(214,220,230,0.9)';
        for (let k = 0; k < 60; k++) { const x = -300 + k * 42 + r() * 20; if (x > 600 && x < 1200) continue; g.beginPath(); g.ellipse(x, 772 + r() * 6 - (x > 1180 ? 8 : 0), 40, 10 + r() * 6, 0, 0, U.TAU); g.fill(); }
      });
      this.lamps = [[250, 520], [980, 500], [1600, 510]];
      this.walkers = Array.from({ length: 9 }, (_, i) => ({ x: 200 + i * 190 + Math.random() * 60, y: 0, v: 26 + Math.random() * 16, ph: Math.random() * 6, dir: i % 3 === 0 ? -1 : 1, s: 0.75 + Math.random() * 0.3 }));
      this.snow = new G.Snow(800, { speed: 70, wind: 36, size: 2.2 });
      this.snowNear = new G.Snow(70, { speed: 150, wind: 60, size: 5, alpha: 0.55 });
      this.steam = [];
      F.camSet(VW / 2, VH / 2 + 30, 1.0); F.cam.par = 14; F.cam.drift = 0.6;
      F.grade.tint = [90, 110, 160]; F.grade.tintA = 0.28; F.grade.vignette = 0.68;
      F.audio.mix({ city: 0.2, hvac: 0.14, pad: 0.38 }, 2.5);
      F.audio.chord('night');
    },
    update(dt, t) {
      this.snow.update(dt, t); this.snowNear.update(dt, t);
      this.walkers.forEach((w) => { w.x += w.v * w.dir * dt * 0.4; if (w.x > VW + 100) w.x = -100; if (w.x < -100) w.x = VW + 100; });
      if (Math.random() < dt * 5) this.steam.push({ x: 0, y: 0, a: 1, s: 1 });
      this.steam.forEach((p) => { p.y -= 36 * dt; p.x += 18 * dt; p.s += dt * 0.8; p.a -= dt * 0.16; });
      this.steam = this.steam.filter((p) => p.a > 0);
    },
    draw(g, dt, t) {
      F.layer(0.02, 0.1);
      const sky = g.createLinearGradient(0, -200, 0, 800);
      sky.addColorStop(0, '#0a0d18'); sky.addColorStop(0.55, '#262c44'); sky.addColorStop(0.85, '#5b5a70'); sky.addColorStop(1, '#8a7270');
      g.fillStyle = sky; g.fillRect(-400, -400, VW + 800, VH + 800);
      G.glow(g, 1300, 620, 700, [255, 170, 120], 0.12);
      F.layer(0.1, 0.25);
      g.drawImage(this.far.canvas, -400, 40, this.far.canvas.vw, this.far.canvas.vh);
      G.drawLights(g, this.far.lights, t, -400, 40);
      F.layer(0.25, 0.5);
      g.drawImage(this.plant, -350, 160, this.plant.vw, this.plant.vh);
      // the flickering O of SILFORM
      const fl = Math.sin(t * 17) > 0.2 || Math.sin(t * 3.1) > 0.6 ? 1 : 0.15;
      g.save(); g.font = '700 64px "Barlow Condensed", sans-serif'; g.textAlign = 'left';
      const w1 = g.measureText('SILF').width, w2 = g.measureText('O').width;
      g.shadowColor = 'rgba(160,200,255,0.9)'; g.shadowBlur = 22; g.fillStyle = '#e6f0ff';
      g.fillText('SILF', 980, 560); g.fillText('RM', 980 + w1 + w2, 560);
      g.shadowColor = `rgba(160,200,255,${0.9 * fl})`; g.shadowBlur = 22 * fl; g.fillStyle = `rgba(230,240,255,${0.2 + 0.8 * fl})`; g.fillText('O', 980 + w1, 560); g.restore();
      this.steam.forEach((p) => { g.fillStyle = `rgba(200,208,224,${0.14 * p.a})`; g.beginPath(); g.arc(1877 + p.x, 210 + p.y, 20 * p.s, 0, U.TAU); g.fill(); });
      F.layer(0.7, 0.85);
      g.drawImage(this.front, -300, 0, this.front.vw, this.front.vh);
      // sodium lamps: pole, head, light cone with snow caught in it
      this.lamps.forEach(([x, y]) => {
        g.fillStyle = '#15171c'; g.fillRect(x - 4, y, 8, 270); g.fillRect(x - 4, y - 4, 60, 8);
        g.fillStyle = '#ffd08a'; g.fillRect(x + 36, y + 4, 26, 6);
        g.save(); g.globalCompositeOperation = 'lighter';
        const cg = g.createLinearGradient(0, y, 0, y + 300); cg.addColorStop(0, 'rgba(255,190,110,0.28)'); cg.addColorStop(1, 'rgba(255,170,90,0)');
        g.fillStyle = cg; g.beginPath(); g.moveTo(x + 40, y + 8); g.lineTo(x + 58, y + 8); g.lineTo(x + 170, y + 300); g.lineTo(x - 70, y + 300); g.closePath(); g.fill();
        g.restore();
        G.glow(g, x + 49, y + 8, 50, [255, 200, 120], 0.8);
        g.fillStyle = 'rgba(255,190,110,0.12)'; g.beginPath(); g.ellipse(x + 50, y + 290, 140, 22, 0, 0, U.TAU); g.fill();
      });
      // workers walking to the 06:00 shift — hoods, hi-vis, breath
      this.walkers.forEach((w) => {
        const x = w.x, y = 790 + (w.s - 0.75) * 120, h = 110 * w.s, bob = Math.abs(Math.sin(t * 5 + w.ph)) * 3;
        G.shadow(g, x, y + 2, 16 * w.s, 4, 0.3);
        g.fillStyle = '#0c0d11';
        g.fillRect(x - 11 * w.s, y - h * 0.62 - bob, 22 * w.s, h * 0.42);
        g.fillRect(x - 8 * w.s, y - h * 0.22, 6 * w.s, h * 0.22); g.fillRect(x + 2 * w.s, y - h * 0.22, 6 * w.s, h * 0.22);
        g.beginPath(); g.arc(x, y - h * 0.7 - bob, 9 * w.s, 0, U.TAU); g.fill();
        g.fillStyle = 'rgba(210,230,90,0.75)'; g.fillRect(x - 11 * w.s, y - h * 0.46 - bob, 22 * w.s, 4 * w.s);
        const br = (t * 0.8 + w.ph) % 2; if (br < 0.7) { g.fillStyle = `rgba(220,226,236,${0.18 * (1 - br / 0.7)})`; g.beginPath(); g.arc(x + w.dir * (14 + br * 20) * w.s, y - h * 0.7 - bob - br * 6, (5 + br * 10) * w.s, 0, U.TAU); g.fill(); }
      });
      F.screen();
      this.snow.draw(g);
      this.snowNear.draw(g, 0.7);
      const mist = g.createLinearGradient(0, 700, 0, 1080);
      mist.addColorStop(0, 'rgba(120,130,160,0)'); mist.addColorStop(1, 'rgba(30,34,46,0.4)');
      g.fillStyle = mist; g.fillRect(0, 700, VW, 380);
    },
    exit() { F.grade.tintA = 0; },
  });

  // ------------------------------------------------------------------ SILFORM — meeting room above Hall 2
  const W = { x0: 300, x1: 1620, y0: 110, y1: 560 };
  const SLOTS = { L1: [560, 1330, 820, 0.8], L2: [310, 1500, 960, 0.8], R1: [1370, 1330, 820, -0.8], R2: [1610, 1500, 960, -0.8] };
  const SHOTS = { L1: { x: 600, y: 690, z: 1.9 }, L2: { x: 360, y: 730, z: 1.8 }, R1: { x: 1340, y: 690, z: 1.9 }, R2: { x: 1560, y: 730, z: 1.8 } };
  F.defineScene('silform_room', {
    enter(o) {
      o = o || {};
      const q = F.quality();
      this.mode = o.mode || 'union';
      this.hall = F.offscreen(VW + 400, 800, q * 0.8, (g) => { g.translate(200, 0); paintHall2(g); });
      this.room = F.offscreen(VW + 500, VH + 300, q, (g) => { g.translate(250, 150); paintRoom(g, this.mode); });
      this.table = F.offscreen(VW + 600, 700, q, (g) => { g.translate(300, 0); paintTable(g, this.mode); });
      const seats = this.mode === 'director' ? { L1: 'grabowski', L2: 'rudnicki', R1: 'lis', R2: 'wrobel' } : { L1: 'mazur', L2: 'bober', R1: 'lis', R2: 'wrobel' };
      this.seats = seats;
      this.cast = {};
      Object.keys(seats).forEach((k) => { this.cast[seats[k]] = { expr: 'neutral', turn: SLOTS[k][3] > 0 ? 0.42 : -0.4, pose: k[0] === 'L' && k === 'L1' ? 'steeple' : 'desk' }; });
      if (this.mode === 'union') { this.cast.mazur.expr = 'cold'; this.cast.bober.expr = 'suspicious'; }
      else { this.cast.grabowski.expr = 'amused'; this.cast.rudnicki.expr = 'cold'; }
      this.shots = { wide: { x: VW / 2, y: VH / 2, z: 1 }, hall: { x: 960, y: 330, z: 1.4 }, board: { x: 1760, y: 380, z: 1.7 } };
      Object.keys(seats).forEach((k) => { this.shots[seats[k]] = SHOTS[k]; });
      const s0 = this.shots[o.shot || 'wide'];
      F.camSet(s0.x, s0.y, s0.z); F.cam.par = 14; F.cam.drift = 0.7;
      F.grade.tint = [120, 140, 130]; F.grade.tintA = 0.2; F.grade.vignette = 0.62;
      F.audio.mix({ room: 0.24, hvac: 0.22, pad: 0.42 }, 2);
      F.audio.chord('tense');
      this.flick = 0;
    },
    shot(name, dur) { const s = this.shots[name]; return F.camTween({ x: s.x, y: s.y, z: s.z }, dur == null ? 1.4 : dur, U.easeInOut); },
    cut(name) { const s = this.shots[name]; F.camSet(s.x, s.y, s.z); },
    update(dt, t) { this.flick = Math.random() < 0.004 ? 1 : Math.max(0, this.flick - dt * 6); },
    draw(g, dt, t) {
      F.layer(0.45, 0.6);
      g.drawImage(this.hall, -200, 40, this.hall.vw, this.hall.vh);
      // furnaces still holding metal: slow orange breathing; idle cells with red stack lights
      [[520, 430], [1180, 440]].forEach(([x, y], i) => G.glow(g, x, y, 150, [255, 120, 40], 0.3 + 0.12 * Math.sin(t * 1.3 + i)));
      [[380, 300], [760, 300], [1050, 296], [1450, 302]].forEach(([x, y], i) => { const on = Math.sin(t * 2 + i) > 0; g.fillStyle = on ? '#ff3b2f' : '#4a1512'; g.fillRect(x - 4, y - 8, 8, 10); if (on) G.glow(g, x, y - 3, 30, [255, 60, 40], 0.5); });
      F.layer(0.6, 0.75);
      g.drawImage(this.room, -250, -150, this.room.vw, this.room.vh);
      // one fluorescent tube that flickers
      if (this.flick > 0) { g.fillStyle = `rgba(10,12,14,${0.35 * this.flick})`; g.fillRect(-250, -150, VW + 500, VH + 300); }
      // wall clock, real seconds
      const cx = 1770, cy = 150, now = new Date();
      g.fillStyle = '#f2f0ea'; g.beginPath(); g.arc(cx, cy, 34, 0, U.TAU); g.fill(); g.strokeStyle = '#222'; g.lineWidth = 3; g.stroke();
      const hand = (a, l, w) => { g.lineWidth = w; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.sin(a) * l, cy - Math.cos(a) * l); g.stroke(); };
      g.strokeStyle = '#1a1a1a'; hand(((14 + now.getMinutes() / 60) / 12) * U.TAU, 18, 3.5); hand((now.getMinutes() / 60) * U.TAU, 26, 2.5); g.strokeStyle = '#c0302a'; hand((now.getSeconds() / 60) * U.TAU, 28, 1.2);
      F.layer(1);
      Object.keys(this.seats).forEach((k) => {
        const id = this.seats[k], c = this.cast[id], s = SLOTS[k];
        F.people.draw(g, F.people.cast[id], s[0], s[1], s[2], { crop: 'bust', pose: c.pose, turn: c.turn, expr: c.expr, talking: F.ui.speaking === id, lookX: s[3], slot: 'sf',
          light: { key: [236, 244, 240], keyA: 0.82, dir: s[3] > 0 ? 1 : -1, amb: [64, 70, 70], rim: [255, 170, 100], rimA: 0.55, rimSide: s[3] > 0 ? -1 : 1 } });
      });
      F.layer(1.05);
      g.drawImage(this.table, -300, 480, this.table.vw, this.table.vh);
    },
    exit() { F.grade.tintA = 0; },
  });

  function paintHall2(g) {
    const bg = g.createLinearGradient(0, 0, 0, 800);
    bg.addColorStop(0, '#15171c'); bg.addColorStop(0.6, '#23262c'); bg.addColorStop(1, '#101114');
    g.fillStyle = bg; g.fillRect(-200, 0, VW + 400, 800);
    // gantry crane rail and hook
    g.fillStyle = '#e0b01e'; g.fillRect(-200, 120, VW + 400, 14); g.fillStyle = '#1a1b1f'; g.fillRect(-200, 134, VW + 400, 6);
    g.fillStyle = '#d0a01a'; g.fillRect(840, 110, 60, 40); g.strokeStyle = '#111'; g.lineWidth = 2; g.beginPath(); g.moveTo(870, 150); g.lineTo(870, 300); g.stroke(); g.fillStyle = '#222'; g.fillRect(860, 300, 20, 14);
    // high-bay lights, half of them off
    for (let row = 0; row < 3; row++) for (let k = 0; k < 10; k++) {
      const y = 60 + row * 40, sc = 0.6 + row * 0.25, x = 960 + (k - 4.5) * 190 * sc, on = (k + row) % 2 === 0;
      g.fillStyle = on ? 'rgba(236,240,230,0.95)' : 'rgba(60,64,70,0.9)'; g.fillRect(x - 16 * sc, y, 32 * sc, 5 * sc);
      if (on) G.glow(g, x, y + 3, 80 * sc, [230, 236, 220], 0.2);
    }
    g.fillStyle = '#262a30'; g.fillRect(-200, 440, VW + 400, 360);
    g.fillStyle = 'rgba(40,160,90,0.4)'; g.fillRect(-200, 600, VW + 400, 5); g.fillStyle = 'rgba(240,200,40,0.5)'; g.fillRect(-200, 700, VW + 400, 6);
    // die-casting machines: long bodies, platens, furnace mouths
    for (let k = 0; k < 6; k++) {
      const x = -60 + k * 340, y = 470;
      g.fillStyle = '#2f3540'; g.fillRect(x, y - 90, 260, 110);
      g.fillStyle = '#3b4250'; g.fillRect(x + 20, y - 150, 70, 170); g.fillRect(x + 170, y - 150, 70, 170);
      g.fillStyle = '#1b1f26'; for (let b = 0; b < 4; b++) g.fillRect(x + 90, y - 140 + b * 40, 80, 8);
      g.fillStyle = 'rgba(240,200,40,0.35)'; g.strokeStyle = 'rgba(240,200,40,0.35)'; g.lineWidth = 2; g.strokeRect(x - 20, y - 170, 300, 200);
      g.fillStyle = '#4a2a18'; g.fillRect(x + 250, y - 20, 50, 40);
    }
    [[520, 450], [1180, 460]].forEach(([x, y]) => { g.fillStyle = '#ff8a2a'; g.fillRect(x - 18, y - 8, 36, 12); });
    // pallets of unshipped housings
    for (let k = 0; k < 8; k++) { const x = 60 + k * 230, y = 660; g.fillStyle = '#6b5236'; g.fillRect(x, y, 120, 10); g.fillStyle = '#8f98a4'; for (let a = 0; a < 3; a++) for (let b = 0; b < 2; b++) g.fillRect(x + 6 + a * 38, y - 26 - b * 26, 32, 24); g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(x, y - 52, 120, 4); }
    g.fillStyle = 'rgba(255,255,255,0.8)'; g.font = '600 18px "Barlow Condensed", sans-serif'; g.textAlign = 'left'; g.fillText('HALA 2 · VK-4471 · WSTRZYMANE', 80, 760);
  }

  function paintRoom(g, mode) {
    G.quad(g, [[-250, -150], [VW + 250, -150], [W.x1, W.y0], [W.x0, W.y0]], '#2a2d2a');
    [[560, 40], [960, 40], [1360, 40]].forEach(([x, y]) => { g.fillStyle = 'rgba(236,244,236,0.95)'; g.fillRect(x - 120, y, 240, 8); G.glow(g, x, y + 4, 180, [226, 240, 226], 0.16); });
    g.fillStyle = '#16181a';
    g.fillRect(W.x0 - 10, W.y0 - 10, W.x1 - W.x0 + 20, 12); g.fillRect(W.x0 - 10, W.y1 - 4, W.x1 - W.x0 + 20, 16);
    for (let k = 0; k <= 5; k++) { const x = W.x0 + ((W.x1 - W.x0) * k) / 5; g.fillRect(x - 5, W.y0, 10, W.y1 - W.y0); }
    g.save(); g.globalCompositeOperation = 'destination-out';
    for (let k = 0; k < 5; k++) { const x0 = W.x0 + ((W.x1 - W.x0) * k) / 5 + 5, x1 = W.x0 + ((W.x1 - W.x0) * (k + 1)) / 5 - 5; g.fillRect(x0, W.y0 + 2, x1 - x0, W.y1 - W.y0 - 6); }
    g.restore();
    g.fillStyle = 'rgba(200,220,210,0.05)'; g.fillRect(W.x0, W.y0, W.x1 - W.x0, W.y1 - W.y0);
    // venetian blinds half down on the left panes
    g.fillStyle = 'rgba(200,196,180,0.55)'; for (let k = 0; k < 9; k++) g.fillRect(W.x0 + 5, W.y0 + 4 + k * 13, (W.x1 - W.x0) / 5 * 2 - 10, 7);
    // side walls, beige
    G.quad(g, [[-250, -150], [W.x0, W.y0], [W.x0, W.y1], [-250, VH + 150]], '#3a3a33');
    G.quad(g, [[W.x1, W.y0], [VW + 250, -150], [VW + 250, VH + 150], [W.x1, W.y1]], '#35352f');
    // whiteboard on the right wall with handwritten numbers
    G.quad(g, [[1650, 240], [1900, 200], [1900, 480], [1650, 470]], '#e9ebe6');
    g.save(); g.strokeStyle = 'rgba(30,60,160,0.8)'; g.lineWidth = 3; g.font = '28px Caveat, cursive'; g.fillStyle = 'rgba(30,60,160,0.85)'; g.textAlign = 'left';
    g.fillText('240 → 160 ?', 1672, 284); g.fillStyle = 'rgba(180,40,40,0.85)'; g.fillText('E-drive: 22 (VII)', 1672, 330); g.fillStyle = 'rgba(30,60,160,0.85)'; g.fillText(mode === 'director' ? 'Zarząd: 2 → 1' : 'kryteria ???', 1672, 378); g.fillText('PUP → 30 dni', 1672, 424);
    g.restore();
    // a union banner on the left wall (union mode) or the company certificate (director mode)
    if (mode === 'union') {
      G.quad(g, [[40, 230], [270, 256], [270, 430], [40, 424]], '#7b1f22');
      g.save(); g.fillStyle = '#f2e7d0'; g.font = '700 26px "Barlow Condensed", sans-serif'; g.textAlign = 'center'; g.translate(155, 330); g.rotate(0.05); g.fillText('ZZ METALOWCY', 0, 0); g.font = '500 16px "Barlow Condensed", sans-serif'; g.fillText('SILFORM · GLIWICE', 0, 28); g.restore();
    } else {
      G.quad(g, [[-100, 250], [150, 270], [150, 420], [-100, 410]], '#1b1d20');
      G.quad(g, [[-86, 264], [136, 282], [136, 406], [-86, 396]], '#ece6d6');
      g.fillStyle = '#2b4fa8'; g.font = '600 13px "Barlow Condensed", sans-serif'; g.textAlign = 'center'; g.fillText('IATF 16949', 25, 320); g.fillStyle = '#555'; g.fillText('Silform sp. z o.o.', 25, 342);
    }
    const fl = g.createLinearGradient(0, W.y1, 0, VH + 150);
    fl.addColorStop(0, '#2a2b28'); fl.addColorStop(1, '#0e0f0e');
    G.quad(g, [[W.x0, W.y1], [W.x1, W.y1], [VW + 250, VH + 150], [-250, VH + 150]], fl);
  }

  function paintTable(g, mode) {
    const top = 170;
    const dg = g.createLinearGradient(0, top, 0, 700);
    dg.addColorStop(0, '#9c8f7c'); dg.addColorStop(1, '#4e463b');
    G.quad(g, [[620, top], [1300, top], [1960, 700], [-40, 700]], dg);
    g.fillStyle = 'rgba(255,255,255,0.25)'; g.fillRect(620, top, 680, 2);
    // thermos, glasses, a plate of biscuits, the union's copy of the list with red marks
    g.fillStyle = '#2b2f36'; G.roundRect(g, 900, top - 36, 30, 70, 8); g.fill(); g.fillStyle = '#b8bec8'; g.fillRect(900, top - 40, 30, 8);
    [[980, top + 20], [1030, top + 26], [860, top + 30]].forEach(([x, y]) => { g.fillStyle = 'rgba(220,230,240,0.45)'; g.fillRect(x, y - 30, 22, 34); g.fillStyle = 'rgba(160,110,60,0.6)'; g.fillRect(x, y - 12, 22, 14); });
    g.fillStyle = '#f0ece2'; g.beginPath(); g.ellipse(960, top + 110, 60, 16, 0, 0, U.TAU); g.fill();
    g.fillStyle = '#c58d4a'; for (let k = 0; k < 7; k++) { g.beginPath(); g.ellipse(930 + (k % 4) * 20, top + 104 + (k > 3 ? 10 : 0), 9, 4, 0, 0, U.TAU); g.fill(); }
    const papers = mode === 'director' ? [[520, 340, 0.15, 'UoP'], [620, 430, -0.1, ''], [1350, 330, 0.12, 'KRS'], [1440, 440, -0.18, 'Wyp.']] : [[500, 340, 0.2, 'LISTA'], [610, 430, -0.12, ''], [1340, 330, 0.15, 'PLAN'], [1440, 440, -0.2, 'ZZ']];
    papers.forEach(([x, y, a, lab]) => {
      g.save(); g.translate(x, y); g.rotate(a);
      g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(-58, -36, 120, 82); g.fillStyle = '#ece7dc'; g.fillRect(-60, -40, 120, 80);
      g.fillStyle = 'rgba(40,40,44,0.35)'; for (let k = 0; k < 7; k++) g.fillRect(-50, -30 + k * 10, 90, 2.5);
      if (lab === 'LISTA') { g.strokeStyle = 'rgba(200,30,30,0.85)'; g.lineWidth = 2; [0, 2, 4].forEach((k) => { g.beginPath(); g.ellipse(-20, -29 + k * 10, 26, 5, 0, 0, U.TAU); g.stroke(); }); }
      if (lab) { g.fillStyle = '#333'; g.font = '600 10px Inter, sans-serif'; g.textAlign = 'right'; g.fillText(lab, 54, 34); }
      g.restore();
    });
    const names = mode === 'director' ? [['mec. P. Grabowski', 720, top + 70], ['T. Rudnicki', 560, top + 130], ['mec. B. Lis', 1200, top + 70], ['A. Wróbel', 1300, top + 130]] : [['H. Mazur', 720, top + 70], ['K. Bober', 560, top + 130], ['mec. B. Lis', 1200, top + 70], ['A. Wróbel', 1300, top + 130]];
    names.forEach(([n, x, y]) => { g.fillStyle = '#f2efe8'; g.fillRect(x - 55, y - 14, 110, 20); g.fillStyle = '#333'; g.font = '500 11px Inter, sans-serif'; g.textAlign = 'center'; g.fillText(n, x, y); });
  }
})(window.F);
