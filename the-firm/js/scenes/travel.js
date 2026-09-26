/* THE FIRM — travel transitions: taxi through Munich at night, night flight, approach over Warsaw */
(function (F) {
  'use strict';
  const U = F.U, G = F.gfx;
  const VW = F.VW, VH = F.VH;

  // ------------------------------------------------------------------ TAXI (rear seat, side window, night rain)
  F.defineScene('taxi', {
    enter() {
      this.lights = [];
      const r = U.rng(3);
      for (let i = 0; i < 70; i++) this.lights.push(this.mk(r, true));
      this.glass = new G.GlassDrops([{ x: 260, y: 170, w: 1400, h: 620 }], { beads: 700, drips: 0, light: [180, 170, 170], seed: 77, scale: 1.3 });
      this.streaks = [];
      F.camSet(VW / 2, VH / 2, 1); F.cam.par = 10; F.cam.drift = 1.4;
      F.grade.tint = [150, 110, 80]; F.grade.tintA = 0.18; F.grade.vignette = 0.7;
      F.audio.mix({ cabin: 0.45, rain: 0.14, rainGlass: 0.12, pad: 0.35 }, 1.5);
    },
    mk(r, init) {
      const d = 0.15 + r() * 0.85; // depth: 1 = close/fast
      const k = r();
      const c = k < 0.58 ? [255, 176, 96] : k < 0.84 ? [255, 226, 190] : k < 0.95 ? [255, 60, 40] : [170, 200, 255];
      return { x: init ? r() * 2400 - 200 : 2200 + r() * 300, y: 150 + Math.pow(r(), 1.3) * 600, d, rad: 4 + d * d * 26, c, a: 0.25 + r() * 0.45 };
    },
    update(dt, t) {
      const speed = 900;
      this.lights.forEach((l, i) => { l.x -= speed * (0.2 + l.d) * dt; if (l.x < -200) this.lights[i] = this.mk(Math.random, false); });
      if (Math.random() < dt * 14) this.streaks.push({ x: 1700 + Math.random() * 100, y: 150 + Math.random() * 600, v: 700 + Math.random() * 500, l: 0 });
      this.streaks.forEach((s) => { s.x -= s.v * dt; s.y += s.v * 0.18 * dt; s.l += dt; });
      this.streaks = this.streaks.filter((s) => s.x > 200);
      // passing streetlight wash inside the cabin
      this.wash = Math.pow(Math.max(0, Math.sin(t * 2.3)), 8);
    },
    draw(g, dt, t) {
      F.layer(0.3, 0.3);
      const bg = g.createLinearGradient(0, 0, 0, VH);
      bg.addColorStop(0, '#07080b'); bg.addColorStop(0.6, '#15110e'); bg.addColorStop(1, '#0a0806');
      g.fillStyle = bg; g.fillRect(-300, -300, VW + 600, VH + 600);
      // bokeh city passing
      // passing lights as soft motion trails: wide dim stroke + narrow core + head glow
      g.save();
      g.globalCompositeOperation = 'lighter';
      g.lineCap = 'round';
      this.lights.forEach((l) => {
        const len = 40 + l.d * 260;
        g.strokeStyle = U.rgba(l.c, l.a * 0.22); g.lineWidth = l.rad * 1.6;
        g.beginPath(); g.moveTo(l.x, l.y); g.lineTo(l.x + len, l.y); g.stroke();
        g.strokeStyle = U.rgba(l.c, l.a * 0.45); g.lineWidth = l.rad * 0.5;
        g.beginPath(); g.moveTo(l.x, l.y); g.lineTo(l.x + len * 0.8, l.y); g.stroke();
        G.glow(g, l.x, l.y, l.rad * 2.2, l.c, l.a * 0.4);
      });
      g.restore();
      // wet street reflection band at the bottom of the window
      const refl = g.createLinearGradient(0, 640, 0, 800);
      refl.addColorStop(0, 'rgba(255,170,90,0)'); refl.addColorStop(1, 'rgba(255,170,90,0.12)');
      g.fillStyle = refl; g.fillRect(-300, 640, VW + 600, 160);
      F.layer(1);
      // window streaks (motion rain)
      g.strokeStyle = 'rgba(220,220,230,0.25)'; g.lineWidth = 1.5; g.lineCap = 'round';
      this.streaks.forEach((s) => { g.beginPath(); g.moveTo(s.x, s.y); g.lineTo(s.x + 60, s.y - 11); g.stroke(); });
      this.glass.draw(g, 0.8);
      // car interior frame: door panel, window frame, seat edge
      g.fillStyle = '#050505';
      g.beginPath();
      g.rect(-300, -300, VW + 600, VH + 600);
      g.moveTo(300, 170); g.lineTo(1600, 170); g.quadraticCurveTo(1690, 175, 1700, 300); g.lineTo(1660, 790); g.lineTo(250, 790); g.quadraticCurveTo(220, 400, 300, 170); g.closePath();
      g.fill('evenodd');
      // chrome/rubber seal highlight
      g.strokeStyle = 'rgba(200,190,170,0.18)'; g.lineWidth = 3;
      g.beginPath(); g.moveTo(300, 170); g.lineTo(1600, 170); g.quadraticCurveTo(1690, 175, 1700, 300); g.lineTo(1660, 790); g.stroke();
      // door panel with interior light wash
      const dp = g.createLinearGradient(0, 790, 0, 1100);
      dp.addColorStop(0, '#1b1511'); dp.addColorStop(1, '#070504');
      g.fillStyle = dp; g.fillRect(-300, 790, VW + 600, 400);
      g.fillStyle = 'rgba(255,220,170,0.08)'; g.fillRect(-300, 792, VW + 600, 2);
      g.fillStyle = '#0d0b09'; G.roundRect(g, 1200, 860, 420, 36, 14); g.fill(); // armrest
      g.fillStyle = 'rgba(200,180,150,0.15)'; g.fillRect(1260, 866, 60, 6);
      // B-pillar at left
      g.fillStyle = '#030303'; g.fillRect(-300, -300, 520, 1500);
      // passing sodium light sweeping through the cabin
      G.glow(g, 900 - (t * 700) % 2400 + 1200, 500, 900, [255, 170, 90], 0.12 * this.wash + 0.03);
      F.grade.lift = null;
    },
    exit() { F.grade.tintA = 0; },
  });

  // ------------------------------------------------------------------ FLIGHT (window seat, cruise → approach over Warsaw)
  // moonlit cumulus deck seen from above, rows receding into haze
  function cloudDeck(q) {
    return F.offscreen(VW * 2, 700, q * 0.6, (g) => {
      const r = U.rng(31);
      for (let row = 0; row < 9; row++) {
        const tt = row / 8;                   // 0 far → 1 near
        const y = 40 + Math.pow(tt, 1.6) * 600;
        const sc = 0.25 + tt * 1.3;
        const lit = U.mix([70, 80, 110], [190, 200, 225], 0.4 + tt * 0.6);
        const dark = U.mix([30, 36, 56], [60, 66, 92], tt);
        let x = -100;
        while (x < VW * 2 + 100) {
          const w = (80 + r() * 160) * sc;
          const h = (30 + r() * 40) * sc;
          for (let k = 0; k < 4; k++) {
            const cx = x + (r() - 0.3) * w, cy = y - r() * h * 0.6, rad = w * (0.3 + r() * 0.35);
            const gr = g.createRadialGradient(cx - rad * 0.2, cy - rad * 0.45, rad * 0.1, cx, cy, rad);
            gr.addColorStop(0, U.rgba(lit, 0.95));
            gr.addColorStop(0.55, U.rgba(U.mix(lit, dark, 0.5), 0.9));
            gr.addColorStop(1, U.rgba(dark, 0));
            g.fillStyle = gr;
            g.beginPath(); g.ellipse(cx, cy, rad, rad * 0.55, 0, 0, U.TAU); g.fill();
          }
          x += w * 0.6;
        }
        // distance haze on each row
        g.fillStyle = U.rgba([40, 48, 76], 0.35 * (1 - tt));
        g.fillRect(0, y - 80 * sc, VW * 2, 120 * sc);
      }
      g.globalCompositeOperation = 'destination-in';
      const f = g.createLinearGradient(0, 0, 0, 700);
      f.addColorStop(0, 'rgba(0,0,0,1)'); f.addColorStop(0.8, 'rgba(0,0,0,1)'); f.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = f; g.fillRect(0, 0, VW * 2, 700);
      g.globalCompositeOperation = 'source-over';
    });
  }
  // Warsaw at night from the air: radial avenues, ring roads, dense centre, the river, bridges, the stadium
  function cityFromAbove(q) {
    return F.offscreen(2600, 1600, q * 0.7, (g) => {
      const r = U.rng(9);
      const C = [1150, 820];
      g.fillStyle = '#040406'; g.fillRect(0, 0, 2600, 1600);
      G.glow(g, C[0], C[1], 1100, [255, 150, 70], 0.22);
      G.glow(g, C[0], C[1], 500, [255, 180, 110], 0.25);
      // blocks: dense scatter weighted to the centre
      for (let i = 0; i < 26000; i++) {
        const ang = r() * U.TAU, rad = Math.pow(r(), 0.9) * 1400;
        const x = C[0] + Math.cos(ang) * rad * 1.3, y = C[1] + Math.sin(ang) * rad;
        if (x > 1580 && x < 1760) continue; // river corridor (approx.)
        const dens = Math.exp(-rad / 520);
        if (r() > dens * 0.9 + 0.08) continue;
        const warm = r() < 0.78;
        g.fillStyle = warm ? `rgba(255,${160 + r() * 50 | 0},90,${0.25 + r() * 0.5})` : `rgba(220,230,255,${0.2 + r() * 0.5})`;
        const sz = 1 + r() * 2.2;
        g.fillRect(x, y, sz, sz);
      }
      const road = (pts, w, a, col) => {
        g.strokeStyle = U.rgba(col, a * 0.18); g.lineWidth = w * 6; g.lineCap = 'round'; g.lineJoin = 'round';
        g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.stroke();
        g.strokeStyle = U.rgba(col, a); g.lineWidth = w;
        g.stroke();
      };
      // radial avenues
      for (let k = 0; k < 11; k++) {
        const ang = (k / 11) * U.TAU + 0.2;
        const pts = [];
        for (let d = 60; d < 1300 - (k % 4) * 150; d += 60) pts.push([C[0] + Math.cos(ang + Math.sin(d * 0.004 + k) * 0.14) * d * 1.3, C[1] + Math.sin(ang + Math.sin(d * 0.004 + k) * 0.14) * d]);
        road(pts, 1.8, 0.5, k % 3 ? [255, 170, 80] : [235, 240, 255]);
      }
      // ring roads
      [320, 640, 1050].forEach((R, i) => {
        const pts = [];
        for (let a2 = 0; a2 <= U.TAU + 0.01; a2 += 0.05) pts.push([C[0] + Math.cos(a2) * R * 1.3 * (1 + Math.sin(a2 * 3 + i) * 0.12 + Math.sin(a2 * 7) * 0.04), C[1] + Math.sin(a2) * R * (1 + Math.cos(a2 * 5 + i) * 0.08)]);
        road(pts, 1.4, 0.3, [255, 176, 90]);
      });
      // the Vistula
      g.strokeStyle = '#030305'; g.lineWidth = 110; g.lineCap = 'round';
      g.beginPath(); g.moveTo(1700, -80); g.bezierCurveTo(1560, 380, 1860, 700, 1680, 1050); g.bezierCurveTo(1580, 1300, 1720, 1500, 1690, 1700); g.stroke();
      g.strokeStyle = 'rgba(255,180,110,0.07)'; g.lineWidth = 90; g.stroke();
      // bridges
      [[1500, 360, 1880, 330], [1560, 700, 1930, 720], [1470, 1010, 1860, 960], [1500, 1260, 1880, 1300]].forEach(([a1, b1, c1, d1]) => road([[a1, b1], [c1, d1]], 2.4, 0.9, [255, 200, 130]));
      // national stadium on the east bank: red & white ring
      g.strokeStyle = 'rgba(255,255,255,0.8)'; g.lineWidth = 7; g.beginPath(); g.ellipse(2020, 760, 80, 56, 0, 0, U.TAU); g.stroke();
      g.strokeStyle = 'rgba(230,40,50,0.8)'; g.lineWidth = 5; g.beginPath(); g.ellipse(2020, 760, 92, 66, 0, 0, U.TAU); g.stroke();
      G.glow(g, 2020, 760, 180, [255, 220, 220], 0.25);
      // the centre: towers and the floodlit Palace
      G.glow(g, C[0], C[1], 140, [255, 230, 190], 0.7);
      for (let i = 0; i < 40; i++) { const x = C[0] + (r() - 0.5) * 260, y = C[1] + (r() - 0.5) * 160; g.fillStyle = `rgba(230,240,255,${0.5 + r() * 0.5})`; g.fillRect(x, y, 3, 3); }
      // soft oval mask so the canvas edges never show
      g.globalCompositeOperation = 'destination-in';
      g.save(); g.translate(1300, 800); g.scale(1.6, 1);
      const m = g.createRadialGradient(0, 0, 300, 0, 0, 800);
      m.addColorStop(0, 'rgba(0,0,0,1)'); m.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = m; g.fillRect(-900, -900, 1800, 1800);
      g.restore();
      g.globalCompositeOperation = 'source-over';
    });
  }

  // ------------------------------------------------------------------ TRAIN (InterCity Gliwice → Wrocław, night, window seat)
  F.defineScene('train', {
    enter(o) {
      o = o || {};
      this.stationName = o.station || 'OPOLE GŁÓWNE';
      this.day = !!o.day;
      const q = F.quality();
      const r = U.rng(17);
      // far landscape strip: low hills, villages, a power plant, repeating horizontally
      this.land = F.offscreen(VW * 2, 400, q * 0.6, (g) => {
        g.fillStyle = o.day ? '#3c463e' : '#07080b';
        g.beginPath(); g.moveTo(0, 400);
        for (let x = 0; x <= VW * 2; x += 40) g.lineTo(x, 190 + Math.sin(x * 0.004) * 26 + Math.sin(x * 0.013) * 9);
        g.lineTo(VW * 2, 400); g.closePath(); g.fill();
        for (let v = 0; v < 9; v++) {
          const cx = r() * VW * 2, n = 6 + (r() * 24) | 0;
          for (let k = 0; k < n; k++) { const x = cx + (r() - 0.5) * 220, y = 200 + r() * 40; g.fillStyle = `rgba(255,${170 + r() * 50 | 0},100,${0.4 + r() * 0.5})`; g.fillRect(x, y, 2, 2); }
          G.glow(g, cx, 210, 90, [255, 160, 80], 0.08);
          if (r() < 0.4) { g.fillStyle = '#0a0b0e'; g.fillRect(cx + 40, 150, 10, 60); g.beginPath(); g.moveTo(cx + 40, 150); g.lineTo(cx + 45, 138); g.lineTo(cx + 50, 150); g.fill(); } // village church
        }
        // power-plant cooling tower & chimney with red lights (Silesian night)
        g.fillStyle = '#0b0c10';
        g.beginPath(); g.moveTo(1500, 215); g.quadraticCurveTo(1525, 160, 1512, 110); g.lineTo(1588, 110); g.quadraticCurveTo(1575, 160, 1600, 215); g.fill();
        g.fillRect(1630, 60, 10, 160);
      });
      this.poles = []; for (let i = 0; i < 6; i++) this.poles.push(i * 520);
      this.station = -4000;
      this.glass = new G.GlassDrops([{ x: 300, y: 130, w: 1320, h: 560 }], { beads: 600, drips: 0, light: [170, 170, 190], seed: 5, scale: 1.1 });
      this.streaks = [];
      F.camSet(VW / 2, VH / 2, 1); F.cam.par = 10; F.cam.drift = 1.1;
      F.grade.tint = o.day ? [200, 190, 170] : [90, 110, 150]; F.grade.tintA = o.day ? 0.1 : 0.2; F.grade.vignette = 0.7;
      F.hotspots = o.laptop ? [{ id: 'laptop', d: 1, x: 640, y: 680, w: 440, h: 290, label: 'Laptop', sub: 'Matter file · draft the claim', onClick: () => F.emit('train:laptop') }] : [];
      F.audio.mix({ cabin: 0.5, rain: 0.12, rainGlass: 0.1, pad: 0.35 }, 2);
      F.audio.chord('night');
    },
    update(dt, t) {
      const v = 1900;
      this.poles = this.poles.map((x) => { x -= v * dt; return x < -300 ? x + 3120 : x; });
      this.station -= v * dt * 0.9; if (this.station < -2600) this.station = 5200 + Math.random() * 3000;
      if (Math.random() < dt * 22) this.streaks.push({ x: 1650, y: 140 + Math.random() * 540, v: 900 + Math.random() * 500 });
      this.streaks.forEach((s2) => { s2.x -= s2.v * dt; s2.y += s2.v * 0.06 * dt; });
      this.streaks = this.streaks.filter((s2) => s2.x > 280);
      this.jolt = Math.sin(t * 9.1) * 0.6 + (Math.random() < dt * 0.4 ? 3 : 0);
    },
    draw(g, dt, t) {
      F.layer(0.05, 0.1);
      const sky = g.createLinearGradient(0, 0, 0, VH);
      if (this.day) { sky.addColorStop(0, '#8ea3b8'); sky.addColorStop(0.6, '#c3c8c6'); sky.addColorStop(1, '#d8cdb8'); }
      else { sky.addColorStop(0, '#05060a'); sky.addColorStop(0.6, '#141620'); sky.addColorStop(1, '#241c1c'); }
      g.fillStyle = sky; g.fillRect(-300, -300, VW + 600, VH + 600);
      // far landscape (slow)
      F.layer(0.15, 0.2);
      const off = (t * 60) % (VW * 2);
      g.drawImage(this.land, -off - 200, 330, VW * 2, 400);
      g.drawImage(this.land, -off - 200 + VW * 2, 330, VW * 2, 400);
      G.glow(g, 1600 - off * 0.2, 470, 20, [255, 40, 30], 0.6 * Math.pow(0.5 + 0.5 * Math.sin(t * 3), 3));
      // near embankment + a station platform flashing past
      F.layer(0.6, 0.6);
      g.fillStyle = '#050506'; g.fillRect(-300, 640, VW + 600, 200);
      const st = this.station;
      if (st > -2600 && st < VW + 200) {
        g.fillStyle = '#16171b'; g.fillRect(st, 560, 2400, 90);
        for (let k = 0; k < 12; k++) { const x = st + k * 200; g.fillStyle = '#0b0b0d'; g.fillRect(x, 380, 6, 180); G.glow(g, x + 3, 380, 60, [255, 236, 200], 0.8); }
        g.fillStyle = '#1f4f9a'; g.fillRect(st + 700, 470, 260, 44);
        g.fillStyle = '#fff'; g.font = '600 30px "Barlow Condensed", sans-serif'; g.textAlign = 'left'; g.fillText(this.stationName, st + 718, 503);
      }
      // catenary masts whipping by (motion-blurred)
      F.layer(1.1, 1.1);
      this.poles.forEach((x) => {
        g.fillStyle = 'rgba(10,10,12,0.9)'; g.fillRect(x, 60, 26, 700);
        g.fillStyle = 'rgba(10,10,12,0.5)'; g.fillRect(x + 26, 60, 60, 700);
        g.fillRect(x - 200, 150, 260, 8);
      });
      g.strokeStyle = 'rgba(20,20,24,0.9)'; g.lineWidth = 2; g.beginPath(); g.moveTo(-300, 158); g.lineTo(VW + 300, 162); g.stroke();
      // window: streaks + droplets + faint interior reflection
      F.layer(1);
      g.save(); g.translate(0, this.jolt);
      g.strokeStyle = 'rgba(210,215,230,0.28)'; g.lineWidth = 1.4; g.lineCap = 'round';
      this.streaks.forEach((s2) => { g.beginPath(); g.moveTo(s2.x, s2.y); g.lineTo(s2.x + 90, s2.y - 5); g.stroke(); });
      this.glass.draw(g, 0.8);
      G.glow(g, 780, 500, 260, [255, 220, 170], 0.05);
      // carriage interior frame: wall, window pillar, table, laptop, cup
      g.fillStyle = '#121216';
      g.beginPath(); g.rect(-300, -300, VW + 600, VH + 600);
      { const x = 300, y = 130, w = 1320, h = 560, rr = 36; g.moveTo(x + rr, y); g.arcTo(x + w, y, x + w, y + h, rr); g.arcTo(x + w, y + h, x, y + h, rr); g.arcTo(x, y + h, x, y, rr); g.arcTo(x, y, x + w, y, rr); g.closePath(); }
      g.fill('evenodd');
      g.strokeStyle = 'rgba(200,200,210,0.14)'; g.lineWidth = 3; G.roundRect(g, 300, 130, 1320, 560, 36); g.stroke();
      const wall = g.createLinearGradient(0, 690, 0, 1100);
      wall.addColorStop(0, '#1c1c22'); wall.addColorStop(1, '#0a0a0c');
      g.fillStyle = wall; g.fillRect(-300, 690, VW + 600, 500);
      // table
      G.quad(g, [[200, 800], [1720, 800], [1900, 1100], [20, 1100]], '#23211f');
      g.fillStyle = 'rgba(255,230,200,0.1)'; g.fillRect(200, 800, 1520, 2);
      // laptop with the SPA open, and a PKP InterCity paper cup
      G.quad(g, [[660, 860], [1040, 860], [1070, 960], [630, 960]], '#15161a');
      G.quad(g, [[680, 690], [1020, 682], [1040, 860], [660, 860]], '#0a0a0c');
      G.quad(g, [[690, 700], [1010, 692], [1028, 852], [672, 852]], '#e8e3da');
      for (let k = 0; k < 13; k++) { g.fillStyle = k % 4 === 1 ? 'rgba(43,79,168,0.6)' : k % 5 === 3 ? 'rgba(179,50,43,0.55)' : 'rgba(40,40,44,0.45)'; g.fillRect(712, 716 + k * 10, 210 + (k % 3) * 30, 3); }
      G.glow(g, 850, 780, 280, [210, 220, 255], 0.14);
      g.fillStyle = '#e9e4da'; g.beginPath(); g.moveTo(1240, 820); g.lineTo(1300, 820); g.lineTo(1292, 900); g.lineTo(1248, 900); g.closePath(); g.fill();
      g.fillStyle = '#b3322b'; g.fillRect(1244, 848, 52, 10);
      G.steam(g, 1270, 816, t, 0.5, 0.8);
      g.restore();
      // reading light
      G.glow(g, 960, 80, 520, [255, 220, 170], 0.1);
    },
    exit() { F.grade.tintA = 0; },
  });

  F.defineScene('flight', {
    enter() {
      const q = F.quality();
      this.deck = cloudDeck(q);
      this.city = cityFromAbove(q);
      this.clouds2 = G.cloudTexture(VW * 2.4, 700, 22, { n: 160, col: [120, 130, 160], a: 0.3, rmin: 90, rmax: 260 });
      this.phase = 0;
      this.stars = Array.from({ length: 160 }, () => [Math.random() * VW * 1.4 - 200, Math.random() * 520, Math.random()]);
      F.camSet(VW / 2, VH / 2, 1); F.cam.par = 10; F.cam.drift = 0.5;
      F.grade.tint = [70, 90, 150]; F.grade.tintA = 0.25; F.grade.vignette = 0.7;
      F.audio.mix({ cabin: 0.55, pad: 0.4 }, 2);
      F.audio.chord('night');
    },
    update(dt, t) { this.phase = U.smooth(U.clamp((t - 2.6) / 4.4, 0, 1)); },
    draw(g, dt, t) {
      const ph = this.phase;
      F.layer(0.04, 0.1);
      const sky = g.createLinearGradient(0, 0, 0, VH);
      sky.addColorStop(0, '#02030a'); sky.addColorStop(0.45, U.rgba(U.mix([14, 20, 44], [16, 12, 16], ph), 1)); sky.addColorStop(1, U.rgba(U.mix([54, 64, 100], [70, 40, 24], ph), 1));
      g.fillStyle = sky; g.fillRect(-300, -300, VW + 600, VH + 600);
      this.stars.forEach(([x, y, b]) => { g.fillStyle = `rgba(255,255,255,${(0.2 + b * 0.6) * (1 - ph)})`; g.fillRect(x, y - ph * 200, 1.5, 1.5); });
      // moon, inside the window
      const my = 300 - ph * 320;
      G.glow(g, 1120, my, 260, [210, 222, 255], 0.3 * (1 - ph));
      g.fillStyle = `rgba(240,242,250,${0.95 * (1 - ph)})`; g.beginPath(); g.arc(1120, my, 20, 0, U.TAU); g.fill();
      g.fillStyle = `rgba(200,205,220,${0.4 * (1 - ph)})`; g.beginPath(); g.arc(1114, my - 4, 6, 0, U.TAU); g.arc(1126, my + 6, 4, 0, U.TAU); g.fill();
      // the city (revealed as we descend through the deck and bank left)
      F.layer(0.1, 0.2);
      // night ground below the horizon
      const gy = 560 - ph * 120;
      const gg = g.createLinearGradient(0, gy - 60, 0, gy + 200);
      gg.addColorStop(0, `rgba(8,6,8,0)`); gg.addColorStop(1, `rgba(6,5,6,${ph})`);
      g.fillStyle = gg; g.fillRect(-400, gy - 60, VW + 800, 1200);
      g.save();
      g.globalAlpha = ph;
      g.translate(VW / 2, 820 - ph * 200);
      g.rotate(-0.1 * ph);
      g.scale(1, 0.38);
      g.drawImage(this.city, -1300 - t * 14, -800, 2600, 1600);
      g.restore();
      // haze over the far city
      const hz = g.createLinearGradient(0, 300, 0, 720);
      hz.addColorStop(0, 'rgba(60,36,26,0)'); hz.addColorStop(0.4, `rgba(70,40,26,${0.75 * ph})`); hz.addColorStop(1, 'rgba(60,36,26,0)');
      g.fillStyle = hz; g.fillRect(-300, 300, VW + 600, 420);
      // cloud deck (we sink through it)
      F.layer(0.12, 0.2);
      const scroll = (t * 40) % VW;
      g.save();
      g.globalAlpha = U.clamp(1 - ph * 1.7, 0, 1);
      g.drawImage(this.deck, -scroll - 200, 470 - ph * 600, VW * 2, 700);
      g.restore();
      G.drawClouds(g, this.clouds2, -500, 700 - ph * 900, VW * 2.4, 700, t * 140, 0.6 * Math.sin(ph * Math.PI));
      // wing with moonlit leading edge + nav/strobe lights
      F.layer(0.5, 0.5);
      const wy = ph * 30;
      const wg = g.createLinearGradient(0, 640 + wy, 0, 880 + wy);
      wg.addColorStop(0, '#1a1d26'); wg.addColorStop(1, '#07080b');
      g.fillStyle = wg;
      g.beginPath(); g.moveTo(-200, 770 + wy); g.lineTo(1150, 650 + wy); g.lineTo(1190, 668 + wy); g.lineTo(1100, 690 + wy); g.lineTo(-200, 900 + wy); g.closePath(); g.fill();
      g.strokeStyle = `rgba(190,205,235,${0.35 * (1 - ph) + 0.12})`; g.lineWidth = 2;
      g.beginPath(); g.moveTo(-200, 770 + wy); g.lineTo(1150, 650 + wy); g.stroke();
      // winglet
      g.fillStyle = '#10121a'; g.beginPath(); g.moveTo(1150, 650 + wy); g.lineTo(1188, 560 + wy); g.lineTo(1200, 566 + wy); g.lineTo(1190, 668 + wy); g.closePath(); g.fill();
      const blink = (t % 1.3) < 0.08;
      G.glow(g, 1192, 600 + wy, blink ? 120 : 30, [255, 50, 40], blink ? 1 : 0.5);
      if ((t % 1.3) > 0.2 && (t % 1.3) < 0.26) G.glow(g, 1192, 600 + wy, 220, [255, 255, 255], 0.9);
      // oval window frame
      F.layer(1);
      g.fillStyle = '#16171b';
      g.beginPath(); g.rect(-300, -300, VW + 600, VH + 600); g.ellipse(VW / 2, VH / 2, 430, 380, 0, 0, U.TAU); g.fill('evenodd');
      const inner = g.createRadialGradient(VW / 2, VH / 2, 380, VW / 2, VH / 2, 520);
      inner.addColorStop(0, 'rgba(0,0,0,0.9)'); inner.addColorStop(0.2, 'rgba(46,48,56,0.9)'); inner.addColorStop(1, 'rgba(20,21,24,0)');
      g.fillStyle = inner;
      g.beginPath(); g.ellipse(VW / 2, VH / 2, 520, 470, 0, 0, U.TAU); g.ellipse(VW / 2, VH / 2, 430, 380, 0, 0, U.TAU); g.fill('evenodd');
      // cabin wall panel seams and the window shade edge
      g.strokeStyle = 'rgba(255,255,255,0.05)'; g.lineWidth = 2;
      g.beginPath(); g.ellipse(VW / 2, VH / 2, 560, 510, 0, 0, U.TAU); g.stroke();
      g.fillStyle = '#1d1e23'; g.beginPath(); g.ellipse(VW / 2, VH / 2, 430, 380, 0, Math.PI * 1.08, Math.PI * 1.92); g.lineTo(VW / 2 + 400, VH / 2 - 330); g.closePath();
      g.save(); g.beginPath(); g.ellipse(VW / 2, VH / 2, 430, 380, 0, 0, U.TAU); g.clip();
      g.fillStyle = '#1b1c21'; g.fillRect(VW / 2 - 440, VH / 2 - 390, 880, 36);
      g.fillStyle = 'rgba(255,255,255,0.06)'; g.fillRect(VW / 2 - 440, VH / 2 - 354, 880, 2);
      const refl = g.createLinearGradient(VW / 2 - 400, VH / 2 - 380, VW / 2 + 200, VH / 2 + 380);
      refl.addColorStop(0, 'rgba(255,240,220,0.06)'); refl.addColorStop(0.4, 'rgba(255,255,255,0)');
      g.fillStyle = refl; g.fillRect(0, 0, VW, VH);
      g.restore();
      G.glow(g, 220, 110, 620, [255, 220, 170], 0.08);
    },
    exit() { F.grade.tintA = 0; },
  });
})(window.F);
