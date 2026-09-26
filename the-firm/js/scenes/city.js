/* THE FIRM — exterior city scenes: void, Munich establishing, tower tilt */
(function (F) {
  'use strict';
  const U = F.U, G = F.gfx;
  const VW = F.VW, VH = F.VH;

  // ------------------------------------------------------------------ VOID (black with rain ambience)
  F.defineScene('void', {
    draw(g) { g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#000'; g.fillRect(0, 0, F.cvs.width, F.cvs.height); },
  });

  // ------------------------------------------------------------------ HQ tower painter (far)
  // slender glass tower with setback crown; drawn into layer space
  function hqFar(g, x, base, w, h, o) {
    const r = U.rng(99);
    // body: glass with sky reflection, darker toward the shadow side
    const gr = g.createLinearGradient(x, 0, x + w, 0);
    gr.addColorStop(0, U.rgba(o.glassL, 1));
    gr.addColorStop(0.35, U.rgba(o.glassM, 1));
    gr.addColorStop(1, U.rgba(o.glassR, 1));
    g.fillStyle = gr;
    // slight chamfered top
    g.beginPath();
    g.moveTo(x, base); g.lineTo(x, base - h); g.lineTo(x + w * 0.82, base - h - h * 0.03); g.lineTo(x + w, base - h + h * 0.01); g.lineTo(x + w, base); g.closePath(); g.fill();
    // vertical sky reflection gradient
    const vg = g.createLinearGradient(0, base - h, 0, base);
    vg.addColorStop(0, 'rgba(140,160,190,0.22)'); vg.addColorStop(0.5, 'rgba(90,110,140,0.05)'); vg.addColorStop(1, 'rgba(0,0,0,0.3)');
    g.fillStyle = vg; g.fill();
    // floors & window lights (many small bays)
    const floors = 14, fh = h / floors, bays = 10;
    for (let i = 0; i < floors; i++) {
      const y = base - (i + 1) * fh;
      g.fillStyle = 'rgba(0,0,0,0.28)';
      g.fillRect(x, y + fh - 1, w, 1);
      const floorLit = r() < o.lit || i >= floors - 2;
      for (let k = 0; k < bays; k++) {
        if ((floorLit && r() < 0.75) || r() < 0.05) {
          const warm = i >= floors - 2 || r() < 0.55;
          g.fillStyle = U.rgba(warm ? [255, 206, 140] : [205, 228, 255], (0.35 + r() * 0.45) * (i >= floors - 2 ? 1.2 : 1));
          g.fillRect(x + 1 + (k * (w - 2)) / bays, y + fh * 0.22, (w - 2) / bays - 1, fh * 0.62);
        }
      }
    }
    // vertical fins
    for (let k = 1; k < bays; k++) { g.fillStyle = k % 3 === 0 ? 'rgba(0,0,0,0.35)' : 'rgba(0,0,0,0.15)'; g.fillRect(x + (k * w) / bays - 0.5, base - h, 1, h); }
    // lit edge (sky rim)
    g.fillStyle = U.rgba(o.edge, 0.55);
    g.fillRect(x, base - h, 1.2, h);
    // crown mast
    g.fillStyle = U.rgba(o.glassR, 1);
    g.fillRect(x + w * 0.3, base - h - h * 0.09, 2, h * 0.07);
    // brass logo band under the crown
    g.fillStyle = 'rgba(255,205,140,0.95)';
    g.fillRect(x + w * 0.18, base - h + fh * 0.7, w * 0.64, Math.max(1.5, fh * 0.35));
  }

  // ------------------------------------------------------------------ GLIWICE ESTABLISHING — 07:12, rain
  F.defineScene('city_wide', {
    enter() {
      const q = F.quality();
      this.clouds = G.cloudTexture(VW * 2.2, 700, 4, { n: 260, col: [150, 160, 176], a: 0.16, rmin: 80, rmax: 280 });
      this.clouds2 = G.cloudTexture(VW * 2.2, 500, 9, { n: 180, col: [40, 46, 58], a: 0.35, rmin: 100, rmax: 260 });
      const win = { lit: 0.16, warm: [255, 196, 120], wa: 0.75, cw: 3, ch: 4, gx: 4, gy: 5 };
      this.far = G.skyline({
        w: VW + 600, h: 900, base: 792, seed: 21, minW: 30, maxW: 90, minH: 12, maxH: 55, gap: 10, pitched: 0.6,
        body: 'rgb(62,70,84)', fog: [104, 110, 120], fogBottom: 0.55, fogTop: 0.35, win: Object.assign({}, win, { lit: 0.08, wa: 0.4 }),
        landmarks: [ G.lm.headframe(1620, 170, 'rgb(62,70,84)', win, 0.9), G.lm.chimney(1790, 130, 'rgb(62,70,84)', win, 0.8)],
        q: q * 0.7,
      });
      this.mid = G.skyline({
        w: VW + 600, h: 1000, base: 842, seed: 33, minW: 36, maxW: 110, minH: 30, maxH: 95, gap: 8, pitched: 0.75,
        body: 'rgb(38,44,54)', edge: 'rgba(150,160,175,0.25)', fog: [90, 96, 108], fogBottom: 0.45, fogTop: 0.05, win,
        landmarks: [G.lm.radioTower(560, 380, 'rgb(34,40,50)', 1.3), G.lm.townHall(900, 175, 'rgb(40,45,54)', 1.25), G.lm.church(520, 110, 'rgb(38,44,54)', 1.1), G.lm.church(1180, 95, 'rgb(38,44,54)', 1), G.lm.church(1960, 120, 'rgb(38,44,54)', 1.1)],
        groundGlow: [255, 170, 90], groundGlowA: 0.25, below: 'rgb(34,38,46)', q: q * 0.8,
      });
      this.near = G.skyline({
        w: VW + 800, h: 1200, base: 1020, seed: 47, minW: 70, maxW: 190, minH: 60, maxH: 180, gap: 30, pitched: 0.8,
        body: 'rgb(16,19,25)', edge: 'rgba(120,130,150,0.3)', win: Object.assign({}, win, { lit: 0.22, cw: 5, ch: 7, gx: 6, gy: 8, wa: 0.9 }),
        groundGlow: [255, 160, 80], groundGlowA: 0.3, below: 'rgb(10,12,16)', q: q * 0.9,
      });
      this.mid2 = G.skyline({
        w: VW + 700, h: 1100, base: 940, seed: 71, minW: 50, maxW: 140, minH: 40, maxH: 120, gap: 20, pitched: 0.7,
        body: 'rgb(26,30,38)', edge: 'rgba(130,140,160,0.22)', win: Object.assign({}, win, { lit: 0.2, cw: 4, ch: 5, gx: 5, gy: 6 }),
        fog: [70, 76, 88], fogBottom: 0.3, fogTop: 0.0, groundGlow: [255, 160, 80], groundGlowA: 0.28, below: 'rgb(22,25,32)', q: q * 0.85,
      });
      // HQ tower
      this.hq = F.offscreen(260, 900, q, (g) => hqFar(g, 60, 880, 120, 470, { glassL: [70, 84, 104], glassM: [34, 42, 56], glassR: [14, 17, 23], edge: [180, 200, 230], lit: 0.3 }));
      this.rain = new G.Rain(900, { angle: 0.14, speed: 1500, len: 44, alpha: 0.22, col: [190, 200, 215] });
      this.rainNear = new G.Rain(120, { angle: 0.16, speed: 2300, len: 110, alpha: 0.16, zmin: 0.7, col: [210, 220, 235] });
      F.camSet(VW / 2 - 60, VH / 2 + 10, 1.0);
      F.cam.par = 14; F.cam.drift = 0.6;
      F.grade.tint = [70, 100, 140]; F.grade.tintA = 0.35; F.grade.vignette = 0.6; F.grade.grain = 0.08;
      this.flash = 0;
    },
    update(dt, t) {
      this.rain.update(dt); this.rainNear.update(dt);
      if (Math.random() < dt * 0.05) { F.grade.flash = 0.25; F.audio.thunder(0.8); }
    },
    draw(g, dt, t) {
      // sky
      F.layer(0.02, 0.1);
      const sky = g.createLinearGradient(0, -200, 0, 900);
      sky.addColorStop(0, '#0f141d');
      sky.addColorStop(0.45, '#2a3444');
      sky.addColorStop(0.78, '#5d6571');
      sky.addColorStop(1, '#7d7c7a');
      g.fillStyle = sky;
      g.fillRect(-400, -400, VW + 800, VH + 800);
      // faint warm dawn smear behind clouds, lower left
      G.glow(g, 300, 760, 700, [150, 120, 100], 0.25);
      // clouds
      F.layer(0.04, 0.15);
      G.drawClouds(g, this.clouds, -500, 60, VW * 2.2, 700, t * 14, 0.9);
      G.drawClouds(g, this.clouds2, -500, -40, VW * 2.2, 500, t * 22 + 300, 0.9);
      // far city
      F.layer(0.07, 0.3);
      g.drawImage(this.far.canvas, -300, 0, this.far.canvas.vw, this.far.canvas.vh);
      // haze band
      const hz = g.createLinearGradient(0, 700, 0, 860);
      hz.addColorStop(0, 'rgba(110,116,126,0)'); hz.addColorStop(1, 'rgba(110,116,126,0.45)');
      g.fillStyle = hz; g.fillRect(-400, 700, VW + 800, 160);
      // mid city
      F.layer(0.12, 0.45);
      g.drawImage(this.mid.canvas, -300, 0, this.mid.canvas.vw, this.mid.canvas.vh);
      F.layer(0.15, 0.5);
      g.drawImage(this.mid2.canvas, -350, 0, this.mid2.canvas.vw, this.mid2.canvas.vh);
      // HQ tower (between mid & near)
      F.layer(0.16, 0.55);
      g.drawImage(this.hq, 1300, 140, 260 * 1.05, 900 * 1.05);
      G.glow(g, 1300 + 93 * 1.05, 140 + 95 * 1.05, 22, [255, 40, 30], Math.pow(0.5 + 0.5 * Math.sin(t * 3), 3));
      G.glow(g, 1300 + 115 * 1.05, 140 + 170 * 1.05, 120, [255, 200, 140], 0.14);
      // near roofs
      F.layer(0.22, 0.7);
      g.drawImage(this.near.canvas, -400, 0, this.near.canvas.vw, this.near.canvas.vh);
      // street glow haze rising between roofs
      G.glow(g, 700, 1040, 500, [255, 150, 70], 0.18);
      G.glow(g, 1500, 1060, 420, [255, 160, 90], 0.14);
      // rain
      F.screen();
      this.rain.draw(g);
      this.rainNear.draw(g);
      // low mist
      const mist = g.createLinearGradient(0, 820, 0, 1080);
      mist.addColorStop(0, 'rgba(90,98,112,0)'); mist.addColorStop(1, 'rgba(40,46,56,0.35)');
      g.fillStyle = mist; g.fillRect(0, 820, VW, 260);
    },
    exit() { F.grade.tintA = 0; },
  });

  // ------------------------------------------------------------------ TOWER — street level, tilt up the facade
  const TOP = -1500, BASE = 820, ROAD0 = 852, ROAD1 = 1020;
  function towerW(u) { return U.lerp(1180, 560, u); }
  function floorY(u) { return BASE - (BASE - TOP) * (0.55 * u + 0.45 * (1 - (1 - u) * (1 - u))); }

  F.defineScene('tower', {
    enter() {
      const q = F.quality() * 0.85;
      const r = U.rng(5);
      // pre-render the facade (static) as a tall canvas
      const H = BASE - TOP + 200;
      this.facade = F.offscreen(VW, H, q, (g) => {
        g.translate(0, -TOP + 100);
        // left neighbour — Gründerzeit stone facade (converging)
        drawOldFacade(g, r);
        drawRightFacade(g, r);
        // tower body
        const N = 14;
        const cols = 14;
        for (let i = 0; i < N; i++) {
          const u0 = i / N, u1 = (i + 1) / N;
          const y0 = floorY(u0), y1 = floorY(u1);
          const w0 = towerW(u0), w1 = towerW(u1);
          const crown = i >= N - 2;
          for (let k = 0; k < cols; k++) {
            const xa0 = VW / 2 - w0 / 2 + (w0 * k) / cols, xb0 = VW / 2 - w0 / 2 + (w0 * (k + 1)) / cols;
            const xa1 = VW / 2 - w1 / 2 + (w1 * k) / cols, xb1 = VW / 2 - w1 / 2 + (w1 * (k + 1)) / cols;
            // reflection of sky: brighter up high, darker below; slight column variation
            const refl = U.mix([22, 28, 40], [70, 84, 104], Math.pow(u0, 0.8));
            const v = 0.85 + r() * 0.3;
            let col = [refl[0] * v, refl[1] * v, refl[2] * v];
            const lit = !crown && r() < (i < 3 ? 0 : 0.26 + (i === N - 3 ? 0.6 : 0));
            g.beginPath();
            g.moveTo(xa0, y0); g.lineTo(xb0, y0); g.lineTo(xb1, y1); g.lineTo(xa1, y1); g.closePath();
            if (lit) {
              const warm = r() < 0.65;
              const c = warm ? [255, 214, 160] : [205, 225, 250];
              const gr = g.createLinearGradient(0, y0, 0, y1);
              gr.addColorStop(0, U.rgba(U.mix(c, [60, 50, 40], 0.55), 1));
              gr.addColorStop(0.25, U.rgba(c, 0.95));
              gr.addColorStop(1, U.rgba(U.mix(c, [40, 36, 30], 0.3), 1));
              g.fillStyle = gr;
              g.fill();
              // ceiling light strip & silhouettes of furniture
              g.fillStyle = 'rgba(255,255,255,0.5)';
              g.fillRect(xa0 + 3, y0 - (y0 - y1) * 0.82, (xb0 - xa0) - 6, 1.6);
              if (r() < 0.4) { g.fillStyle = 'rgba(20,16,12,0.5)'; g.fillRect(xa0 + (xb0 - xa0) * 0.2, y0 - (y0 - y1) * 0.35, (xb0 - xa0) * 0.5, (y0 - y1) * 0.35); }
            } else {
              const gr = g.createLinearGradient(xa0, y0, xb1, y1);
              gr.addColorStop(0, U.rgba(col, 1));
              gr.addColorStop(1, U.rgba(U.mix(col, [120, 140, 170], 0.18), 1));
              g.fillStyle = gr;
              g.fill();
            }
          }
          // floor slab band
          g.fillStyle = 'rgba(8,10,14,0.9)';
          const sh = Math.max(3, (y0 - y1) * 0.16);
          g.beginPath();
          g.moveTo(VW / 2 - w0 / 2 - 4, y0); g.lineTo(VW / 2 + w0 / 2 + 4, y0); g.lineTo(VW / 2 + w0 / 2 + 4, y0 - sh); g.lineTo(VW / 2 - w0 / 2 - 4, y0 - sh); g.closePath(); g.fill();
          g.fillStyle = 'rgba(160,180,210,0.12)';
          g.fillRect(VW / 2 - w0 / 2 - 4, y0 - sh, w0 + 8, 1);
        }
        // vertical fins (mullions) converging
        for (let k = 0; k <= cols; k++) {
          const xb = VW / 2 - towerW(0) / 2 + (towerW(0) * k) / cols;
          const xt = VW / 2 - towerW(1) / 2 + (towerW(1) * k) / cols;
          g.strokeStyle = k === 0 || k === cols ? 'rgba(10,12,16,1)' : 'rgba(12,14,18,0.85)';
          g.lineWidth = k === 0 || k === cols ? 10 : 3.5;
          g.beginPath(); g.moveTo(xb, BASE); g.lineTo(xt, floorY(1)); g.stroke();
          g.strokeStyle = 'rgba(150,170,200,0.12)';
          g.lineWidth = 1;
          g.beginPath(); g.moveTo(xb + 2, BASE); g.lineTo(xt + 1, floorY(1)); g.stroke();
        }
        // crown: dark band with brass lettering
        const yc = floorY(12 / 14), yt = floorY(1);
        g.fillStyle = '#0b0d11';
        const wc = towerW(12 / 14), wt = towerW(1);
        g.beginPath(); g.moveTo(VW / 2 - wc / 2, yc); g.lineTo(VW / 2 + wc / 2, yc); g.lineTo(VW / 2 + wt / 2, yt - 20); g.lineTo(VW / 2 - wt / 2, yt - 20); g.closePath(); g.fill();
        // parapet highlight
        g.fillStyle = 'rgba(180,195,220,0.25)';
        g.fillRect(VW / 2 - wt / 2, yt - 22, wt, 2);
        // entrance canopy
        g.fillStyle = '#07090c';
        g.fillRect(VW / 2 - 330, BASE - 150, 660, 26);
        g.fillStyle = 'rgba(255,220,170,0.35)';
        g.fillRect(VW / 2 - 330, BASE - 124, 660, 2);
        // lobby glow through base glazing
        const lg = g.createLinearGradient(0, BASE - 124, 0, BASE);
        lg.addColorStop(0, 'rgba(255,214,160,0.9)'); lg.addColorStop(1, 'rgba(200,150,100,0.8)');
        g.fillStyle = lg;
        g.fillRect(VW / 2 - 560, BASE - 124, 1120, 124);
        // lobby interior hints: reception, columns, people
        g.fillStyle = 'rgba(60,40,24,0.7)';
        g.fillRect(VW / 2 - 200, BASE - 56, 400, 56);
        g.fillStyle = 'rgba(255,240,210,0.7)';
        g.fillRect(VW / 2 - 200, BASE - 58, 400, 3);
        for (let k = -4; k <= 4; k++) { g.fillStyle = 'rgba(20,16,12,0.85)'; g.fillRect(VW / 2 + k * 124 - 8, BASE - 124, 16, 124); }
        // doors
        g.strokeStyle = 'rgba(30,24,18,0.8)'; g.lineWidth = 3;
        g.strokeRect(VW / 2 - 90, BASE - 118, 180, 118);
        g.beginPath(); g.moveTo(VW / 2, BASE - 118); g.lineTo(VW / 2, BASE); g.stroke();
        // house number and brass plate
        g.fillStyle = 'rgba(201,169,107,0.95)';
        g.font = '500 28px "Cormorant Garamond", serif';
        g.textAlign = 'center';
        g.fillText('ADLER WENDT  ·  KANCELARIA PRAWNA  ·  RECHTSANWÄLTE', VW / 2, BASE - 132);
      });
      // crown lettering drawn live (glow)
      this.reflect = F.offscreen(VW, 220, q * 0.5, (g) => {
        // blurred vertical smears of the lobby glow for wet asphalt
        g.filter = 'blur(10px)';
        const lg = g.createLinearGradient(0, 0, 0, 220);
        lg.addColorStop(0, 'rgba(255,200,140,0.55)'); lg.addColorStop(1, 'rgba(255,200,140,0)');
        g.fillStyle = lg;
        for (let k = -4; k <= 4; k++) g.fillRect(VW / 2 + k * 124 - 50, 0, 100, 220);
        g.fillStyle = 'rgba(160,180,220,0.18)';
        for (let k = 0; k < 20; k++) g.fillRect(r() * VW, 0, 12, 160);
        g.filter = 'none';
      });
      this.cars = [];
      this.peds = [];
      [[260, 1], [1500, -1], [900, 1]].forEach(([x, d], i) => this.peds.push({ x, v: d * (55 + r() * 25), s: 1.6 + r() * 0.4, ph: r() * 10, hat: i === 1, briefcase: i !== 1 }));
      this.tram = { x: -1800, on: false };
      this.rain = new G.Rain(1100, { angle: 0.1, speed: 1700, len: 70, alpha: 0.25, x0: -200, x1: VW + 200, y0: -300, y1: 1200 });
      this.lampRain = new G.Rain(260, { angle: 0.1, speed: 1700, len: 60, alpha: 0.7, x0: 150, x1: 620, y0: 420, y1: 1150, col: [255, 220, 170] });
      F.camSet(VW / 2, 640, 1.0);
      F.cam.par = 16; F.cam.drift = 0.7;
      F.grade.tint = [70, 100, 140]; F.grade.tintA = 0.3; F.grade.vignette = 0.62;
      this.titleA = 0;
    },
    update(dt, t) {
      this.rain.update(dt); this.lampRain.update(dt);
      if (Math.random() < dt * 0.9 && this.cars.length < 6) {
        const dir = Math.random() < 0.5 ? 1 : -1;
        this.cars.push({ x: dir > 0 ? -300 : VW + 300, dir, v: 420 + Math.random() * 260, lane: dir > 0 ? 0 : 1, taxi: Math.random() < 0.2, col: [[12, 13, 16], [28, 30, 34], [60, 62, 66], [20, 26, 38]][Math.floor(Math.random() * 4)] });
      }
      this.cars.forEach((c) => { c.x += c.dir * c.v * dt; });
      this.cars = this.cars.filter((c) => c.x > -500 && c.x < VW + 500);
      this.peds.forEach((p) => { p.x += p.v * dt; if (p.x < -200) p.x = VW + 200; if (p.x > VW + 200) p.x = -200; });
      if (t > 0.6 && !this.tram.on) { this.tram.on = true; this.tram.x = VW + 200; }
      if (this.tram.on) this.tram.x -= 260 * dt;
    },
    draw(g, dt, t) {
      const cy = F.cam.y;
      // sky
      F.layer(0.12, 0.2);
      const sky = g.createLinearGradient(0, -1200, 0, 1000);
      sky.addColorStop(0, '#0c1119'); sky.addColorStop(0.6, '#263041'); sky.addColorStop(1, '#4b5362');
      g.fillStyle = sky; g.fillRect(-400, -1600, VW + 800, 3200);
      F.layer(1);
      g.drawImage(this.facade, 0, TOP - 100, VW, this.facade.vh);
      // crown lettering
      const yt = floorY(1), yc = floorY(12 / 14);
      g.save();
      g.textAlign = 'center';
      g.font = '500 64px "Cormorant Garamond", serif';
      const ly = (yt + yc) / 2 + 24;
      G.glow(g, VW / 2, ly - 18, 420, [255, 190, 120], 0.25);
      g.fillStyle = '#f0d49a';
      g.shadowColor = 'rgba(255,190,110,0.9)';
      g.shadowBlur = 24;
      g.fillText('A D L E R   W E N D T', VW / 2, ly);
      g.shadowBlur = 0;
      g.restore();
      // aviation light
      G.glow(g, VW / 2 - towerW(1) / 2 + 20, yt - 30, 40, [255, 40, 30], Math.pow(0.5 + 0.5 * Math.sin(t * 3.2), 4));
      G.glow(g, VW / 2 + towerW(1) / 2 - 20, yt - 30, 40, [255, 40, 30], Math.pow(0.5 + 0.5 * Math.sin(t * 3.2), 4));
      // passing cloud/mist around the crown
      const mist = g.createLinearGradient(0, yt - 200, 0, yt + 500);
      mist.addColorStop(0, 'rgba(60,70,86,0)'); mist.addColorStop(0.5, 'rgba(70,80,96,0.35)'); mist.addColorStop(1, 'rgba(60,70,86,0)');
      g.fillStyle = mist; g.fillRect(-200, yt - 200, VW + 400, 700);

      // ---- street
      const road = g.createLinearGradient(0, ROAD0, 0, ROAD1);
      road.addColorStop(0, '#121418'); road.addColorStop(1, '#0a0b0e');
      g.fillStyle = road; g.fillRect(-300, BASE, VW + 600, 500);
      // far sidewalk
      g.fillStyle = '#1a1c20'; g.fillRect(-300, BASE, VW + 600, ROAD0 - BASE);
      g.fillStyle = 'rgba(190,200,220,0.16)'; g.fillRect(-300, ROAD0, VW + 600, 1.5);
      // reflections of the lobby & windows on wet asphalt
      g.globalCompositeOperation = 'lighter';
      g.globalAlpha = 0.75;
      g.drawImage(this.reflect, 0, ROAD0, VW, ROAD1 - ROAD0 + 40);
      g.globalAlpha = 1;
      g.globalCompositeOperation = 'source-over';
      // tram rails
      g.strokeStyle = 'rgba(170,180,200,0.22)'; g.lineWidth = 1.5;
      [884, 900].forEach((yy) => { g.beginPath(); g.moveTo(-300, yy); g.lineTo(VW + 300, yy); g.stroke(); });
      // lane marking
      g.fillStyle = 'rgba(220,220,220,0.18)';
      for (let k = -2; k < 16; k++) g.fillRect(k * 160 + 20, 948, 80, 3);
      // zebra crossing (perspective toward camera)
      g.fillStyle = 'rgba(215,218,224,0.13)';
      for (let k = 0; k < 7; k++) {
        const x0 = 1180 + k * 62;
        g.beginPath(); g.moveTo(x0, ROAD0 + 4); g.lineTo(x0 + 30, ROAD0 + 4); g.lineTo(x0 + 44 + k * 8, ROAD1); g.lineTo(x0 + 6 + k * 8, ROAD1); g.closePath(); g.fill();
      }
      // tram on far lane, cars on both lanes
      if (this.tram.on) drawBus(g, this.tram.x, 900, t);
      this.cars.forEach((c) => drawCar(g, c, c.lane ? 940 : 1000, c.lane ? 0.8 : 1, t));
      // near sidewalk (foreground)
      const sw = g.createLinearGradient(0, ROAD1, 0, 1200);
      sw.addColorStop(0, '#16181c'); sw.addColorStop(1, '#0b0c0f');
      g.fillStyle = sw; g.fillRect(-300, ROAD1, VW + 600, 300);
      g.fillStyle = 'rgba(190,200,220,0.2)'; g.fillRect(-300, ROAD1, VW + 600, 2);
      // puddle reflections on pavement
      g.globalCompositeOperation = 'lighter';
      G.pool(g, 1100, 1080, 260, 16, [255, 200, 140], 0.12);
      G.pool(g, 700, 1110, 200, 12, [160, 180, 220], 0.1);
      g.globalCompositeOperation = 'source-over';
      // pedestrians crossing the foreground
      this.peds.forEach((p) => drawPed(g, p, 1190, t));
      // street lamp foreground
      F.layer(1.25);
      const lx = 380, ly2 = 520;
      g.fillStyle = '#050608';
      g.fillRect(lx - 6, ly2, 12, 700);
      g.beginPath(); g.moveTo(lx, ly2); g.quadraticCurveTo(lx + 10, ly2 - 70, lx + 90, ly2 - 70); g.lineTo(lx + 90, ly2 - 60); g.quadraticCurveTo(lx + 20, ly2 - 60, lx + 6, ly2); g.fill();
      g.fillRect(lx + 60, ly2 - 72, 60, 12);
      G.glow(g, lx + 90, ly2 - 56, 60, [255, 210, 150], 0.9);
      // light cone
      const cone = g.createLinearGradient(0, ly2 - 56, 0, 1150);
      cone.addColorStop(0, 'rgba(255,200,140,0.22)'); cone.addColorStop(1, 'rgba(255,200,140,0.0)');
      g.fillStyle = cone;
      g.beginPath(); g.moveTo(lx + 70, ly2 - 56); g.lineTo(lx + 110, ly2 - 56); g.lineTo(lx + 330, 1150); g.lineTo(lx - 150, 1150); g.closePath(); g.fill();
      g.save(); g.clip();
      this.lampRain.draw(g);
      g.restore();
      // pool of light on the pavement
      G.pool(g, lx + 90, BASE + 30, 260, 40, [255, 190, 120], 0.25);
      // traffic signal
      g.fillStyle = '#060708';
      g.fillRect(1640, 540, 10, 700);
      g.fillRect(1616, 500, 58, 140);
      const red = (t % 8) < 5;
      G.glow(g, 1645, 530, 50, red ? [255, 50, 40] : [60, 60, 60], red ? 0.9 : 0);
      G.glow(g, 1645, 610, 50, red ? [60, 60, 60] : [60, 255, 160], red ? 0 : 0.9);
      g.fillStyle = red ? '#ff5a4a' : '#222'; g.beginPath(); g.arc(1645, 530, 12, 0, U.TAU); g.fill();
      g.fillStyle = !red ? '#6dffb0' : '#222'; g.beginPath(); g.arc(1645, 610, 12, 0, U.TAU); g.fill();
      g.fillStyle = '#222'; g.beginPath(); g.arc(1645, 570, 12, 0, U.TAU); g.fill();
      // rain
      F.screen();
      this.rain.draw(g);
    },
    exit() { F.grade.tintA = 0; },
  });

  function drawOldFacade(g, r) {
    // left neighbour: stone facade with cornices, converging upward (ends at ~ -700)
    const top = -760;
    const bl = -200, br = VW / 2 - 620; // base x range
    const tl = -80, tr = VW / 2 - 470;   // top x range
    g.fillStyle = '#2a2c30';
    g.beginPath(); g.moveTo(bl, BASE); g.lineTo(br, BASE); g.lineTo(tr, top); g.lineTo(tl, top); g.closePath(); g.fill();
    // stone gradient
    const gr = g.createLinearGradient(0, top, 0, BASE);
    gr.addColorStop(0, 'rgba(90,96,108,0.35)'); gr.addColorStop(1, 'rgba(0,0,0,0.2)');
    g.fillStyle = gr; g.fill();
    const floors = 6;
    for (let i = 0; i < floors; i++) {
      const u0 = i / floors, u1 = (i + 1) / floors;
      const y0 = U.lerp(BASE - 40, top + 40, u0), y1 = U.lerp(BASE - 40, top + 40, u1);
      const xl = U.lerp(bl, tl, (BASE - y1) / (BASE - top)) + 20, xr = U.lerp(br, tr, (BASE - y1) / (BASE - top)) - 20;
      // cornice
      g.fillStyle = 'rgba(160,165,175,0.12)';
      g.fillRect(xl - 20, y0 - 8, xr - xl + 40, 5);
      g.fillStyle = 'rgba(0,0,0,0.4)';
      g.fillRect(xl - 20, y0 - 3, xr - xl + 40, 4);
      const nW = 5;
      for (let k = 0; k < nW; k++) {
        const wx = xl + ((xr - xl) * (k + 0.2)) / nW, ww = ((xr - xl) / nW) * 0.55;
        const wy = y1 + (y0 - y1) * 0.22, wh = (y0 - y1) * 0.62;
        const lit = r() < 0.3;
        g.fillStyle = lit ? `rgba(255,${190 + r() * 30 | 0},120,${0.6 + r() * 0.3})` : 'rgba(12,14,18,0.95)';
        g.fillRect(wx, wy, ww, wh);
        g.fillStyle = 'rgba(0,0,0,0.5)';
        g.fillRect(wx + ww / 2 - 1, wy, 2, wh);
        g.fillRect(wx, wy + wh * 0.3, ww, 2);
        // window pediment
        g.fillStyle = 'rgba(150,155,165,0.14)';
        g.fillRect(wx - 4, wy - 7, ww + 8, 4);
      }
    }
    // shopfront at street
    g.fillStyle = 'rgba(255,190,120,0.25)';
    g.fillRect(bl + 60, BASE - 110, br - bl - 120, 80);
    g.fillStyle = '#e9d9b8';
    g.font = '600 20px "Barlow Condensed", sans-serif';
    g.fillText('A P T E K A', bl + 180, BASE - 118);
    G.glow(g, bl + 150, BASE - 125, 30, [60, 255, 120], 0.6);
  }
  function drawRightFacade(g, r) {
    const top = -520;
    const bl = VW / 2 + 620, br = VW + 200;
    const tl = VW / 2 + 500, tr = VW + 100;
    g.fillStyle = '#1c1e22';
    g.beginPath(); g.moveTo(bl, BASE); g.lineTo(br, BASE); g.lineTo(tr, top); g.lineTo(tl, top); g.closePath(); g.fill();
    const floors = 8;
    for (let i = 0; i < floors; i++) {
      const y0 = U.lerp(BASE - 30, top + 20, i / floors), y1 = U.lerp(BASE - 30, top + 20, (i + 1) / floors);
      const k0 = (BASE - y1) / (BASE - top);
      const xl = U.lerp(bl, tl, k0) + 16, xr = U.lerp(br, tr, k0);
      g.fillStyle = 'rgba(0,0,0,0.5)';
      g.fillRect(xl - 16, y0 - 4, xr - xl + 16, 4);
      for (let k = 0; k < 7; k++) {
        const wx = xl + ((xr - xl) * k) / 7 + 6, ww = (xr - xl) / 7 - 12;
        const lit = r() < 0.22;
        g.fillStyle = lit ? `rgba(${200 + r() * 55 | 0},${210 + r() * 30 | 0},${230},0.55)` : 'rgba(26,30,38,0.95)';
        g.fillRect(wx, y1 + 8, ww, y0 - y1 - 16);
      }
    }
  }

  function drawCar(g, c, y, sc, t) {
    const d = c.dir;
    g.save();
    g.translate(c.x, y);
    g.scale(d * sc, sc); // car faces +x in local space
    const col = c.taxi ? [214, 196, 140] : c.col;
    // body silhouette (sedan)
    g.beginPath();
    g.moveTo(-128, -18);
    g.bezierCurveTo(-130, -40, -118, -46, -96, -48);   // rear
    g.lineTo(-70, -50);
    g.bezierCurveTo(-52, -84, -30, -86, 10, -86);        // roof
    g.bezierCurveTo(40, -86, 56, -70, 74, -52);          // windshield
    g.bezierCurveTo(108, -48, 128, -42, 132, -26);       // hood
    g.lineTo(132, -12); g.lineTo(-128, -12); g.closePath();
    const bg = g.createLinearGradient(0, -86, 0, -10);
    bg.addColorStop(0, U.rgba(U.mix(col, [150, 165, 190], 0.25), 1));
    bg.addColorStop(0.45, U.rgba(col, 1));
    bg.addColorStop(1, U.rgba(U.mix(col, [0, 0, 0], 0.5), 1));
    g.fillStyle = bg; g.fill();
    // glasshouse
    g.beginPath();
    g.moveTo(-62, -52); g.bezierCurveTo(-46, -80, -28, -80, 8, -80); g.bezierCurveTo(34, -80, 50, -66, 64, -53); g.closePath();
    g.fillStyle = 'rgba(70,86,110,0.75)'; g.fill();
    g.fillStyle = 'rgba(0,0,0,0.5)'; g.fillRect(-4, -80, 5, 28);
    // shoulder line highlight (wet)
    g.strokeStyle = 'rgba(220,230,245,0.28)'; g.lineWidth = 1.5;
    g.beginPath(); g.moveTo(-118, -44); g.lineTo(122, -40); g.stroke();
    if (c.taxi) { g.fillStyle = '#f5e6a4'; g.fillRect(-10, -96, 34, 10); G.glow(g, 7, -91, 34, [255, 230, 150], 0.55); }
    // wheels
    g.fillStyle = '#040405';
    g.beginPath(); g.arc(-80, -12, 21, 0, U.TAU); g.arc(86, -12, 21, 0, U.TAU); g.fill();
    g.fillStyle = 'rgba(160,170,185,0.25)';
    g.beginPath(); g.arc(-80, -12, 9, 0, U.TAU); g.arc(86, -12, 9, 0, U.TAU); g.fill();
    // lights
    G.glow(g, 130, -30, 60, [255, 246, 228], 0.95);
    G.glow(g, -126, -34, 34, [255, 30, 20], 0.85);
    g.fillStyle = '#fffaf0'; g.fillRect(122, -34, 10, 6);
    g.fillStyle = '#ff3a2a'; g.fillRect(-129, -38, 6, 8);
    // headlight beam in rain
    const beam = g.createLinearGradient(130, 0, 620, 0);
    beam.addColorStop(0, 'rgba(255,246,228,0.2)'); beam.addColorStop(1, 'rgba(255,246,228,0)');
    g.fillStyle = beam;
    g.beginPath(); g.moveTo(130, -34); g.lineTo(620, -80); g.lineTo(620, 30); g.lineTo(130, -20); g.closePath(); g.fill();
    // reflections on the wet road
    g.globalCompositeOperation = 'lighter';
    const rf = g.createLinearGradient(0, -8, 0, 150);
    rf.addColorStop(0, 'rgba(255,240,220,0.35)'); rf.addColorStop(1, 'rgba(255,240,220,0)');
    g.fillStyle = rf; g.fillRect(118, -8, 22, 150);
    const rr = g.createLinearGradient(0, -8, 0, 110);
    rr.addColorStop(0, 'rgba(255,40,30,0.35)'); rr.addColorStop(1, 'rgba(255,40,30,0)');
    g.fillStyle = rr; g.fillRect(-134, -8, 16, 110);
    g.restore();
  }

  function drawBus(g, x, y, t) {
    // articulated city bus (Gliwice runs buses, not trams, since 2009)
    const L = 1100, H = 150;
    g.save();
    const body = g.createLinearGradient(0, y - H, 0, y);
    body.addColorStop(0, '#d7dce2'); body.addColorStop(0.62, '#aeb6c0'); body.addColorStop(0.63, '#1f2a36'); body.addColorStop(1, '#141b24');
    g.fillStyle = body;
    G.roundRect(g, x, y - H, L, H - 22, 14); g.fill();
    g.fillStyle = '#0c0f13'; g.fillRect(x + 540, y - H, 18, H - 22); // articulation bellows
    for (let k = 0; k < 10; k++) {
      const wx = x + 36 + k * 104 + (k > 4 ? 20 : 0);
      const wg = g.createLinearGradient(0, y - H + 14, 0, y - H + 80);
      wg.addColorStop(0, 'rgba(255,248,230,0.95)'); wg.addColorStop(1, 'rgba(236,220,186,0.85)');
      g.fillStyle = wg; g.fillRect(wx, y - H + 14, 84, 64);
      if ((k * 5) % 3 === 0) { g.fillStyle = 'rgba(30,26,22,0.8)'; g.beginPath(); g.arc(wx + 34, y - H + 48, 10, 0, U.TAU); g.fill(); g.fillRect(wx + 22, y - H + 56, 24, 22); }
    }
    g.fillStyle = '#ffb35a'; g.font = '600 22px "Barlow Condensed", sans-serif'; g.textAlign = 'left';
    g.fillText('4  CENTRUM', x + 18, y - H + 8 + 0);
    g.fillStyle = '#050505';
    [x + 160, x + 460, x + 900].forEach((wx) => { g.beginPath(); g.arc(wx, y - 16, 26, 0, U.TAU); g.fill(); });
    G.glow(g, x + 8, y - 40, 90, [255, 250, 230], 0.8);
    g.restore();
    g.save();
    g.globalCompositeOperation = 'lighter';
    const rf = g.createLinearGradient(0, y, 0, y + 110);
    rf.addColorStop(0, 'rgba(255,240,210,0.22)'); rf.addColorStop(1, 'rgba(255,240,210,0)');
    g.fillStyle = rf; g.fillRect(x, y, L, 110);
    g.restore();
  }

  function drawTram(g, x, y, t) {
    const L = 1500, H = 150;
    g.save();
    // body
    const body = g.createLinearGradient(0, y - H, 0, y);
    body.addColorStop(0, '#dfe4ea'); body.addColorStop(0.55, '#b9c2cc'); body.addColorStop(0.56, '#1d5aa6'); body.addColorStop(1, '#123e75');
    g.fillStyle = body;
    G.roundRect(g, x, y - H, L, H - 14, 18); g.fill();
    // lit windows
    for (let k = 0; k < 14; k++) {
      const wx = x + 40 + k * 104;
      const wg = g.createLinearGradient(0, y - H + 18, 0, y - H + 76);
      wg.addColorStop(0, 'rgba(255,248,230,0.95)'); wg.addColorStop(1, 'rgba(240,220,180,0.85)');
      g.fillStyle = wg;
      g.fillRect(wx, y - H + 18, 84, 58);
      // passengers
      if ((k * 7) % 3 === 0) { g.fillStyle = 'rgba(30,26,22,0.8)'; g.beginPath(); g.arc(wx + 30 + (k % 2) * 20, y - H + 50, 10, 0, U.TAU); g.fill(); g.fillRect(wx + 18 + (k % 2) * 20, y - H + 58, 24, 20); }
    }
    G.glow(g, x + 20, y - 40, 90, [255, 250, 230], 0.8);
    // pantograph
    g.strokeStyle = '#08090b'; g.lineWidth = 3;
    g.beginPath(); g.moveTo(x + 400, y - H); g.lineTo(x + 440, y - H - 60); g.lineTo(x + 480, y - H); g.stroke();
    // overhead wire spark
    if (Math.random() < 0.02) G.glow(g, x + 440, y - H - 62, 60, [180, 200, 255], 1);
    g.restore();
    // reflection on road
    g.save();
    g.globalCompositeOperation = 'lighter';
    const rf = g.createLinearGradient(0, y, 0, y + 110);
    rf.addColorStop(0, 'rgba(255,240,210,0.25)'); rf.addColorStop(1, 'rgba(255,240,210,0)');
    g.fillStyle = rf; g.fillRect(x, y, L, 110);
    g.restore();
  }

  // foreground pedestrian silhouette with umbrella (backlit by street light)
  function drawPed(g, p, y, t) {
    const s = p.s;
    const dir = p.v > 0 ? 1 : -1;
    const ph = t * 4.2 + p.ph;
    const step = Math.sin(ph);
    const bob = Math.abs(Math.cos(ph)) * 3;
    g.save();
    g.translate(p.x, y - bob * s);
    g.scale(s * dir, s);
    g.fillStyle = '#030405';
    // legs (trousers) with stride
    const leg = (a, w) => { g.beginPath(); g.moveTo(-9 + a * 2, -92); g.quadraticCurveTo(a * 18 - 4, -46, a * 26 - 5, 0); g.lineTo(a * 26 + 9, 0); g.quadraticCurveTo(a * 18 + 8, -46, 9 + a * 2, -92); g.closePath(); g.fill(); };
    leg(step, 1); leg(-step, 1);
    // shoes
    g.beginPath(); g.ellipse(step * 26 + 6, -2, 13, 5, 0, 0, U.TAU); g.ellipse(-step * 26 + 6, -2, 13, 5, 0, 0, U.TAU); g.fill();
    // long coat
    g.beginPath();
    g.moveTo(-22, -210); g.bezierCurveTo(-34, -200, -34, -150, -30, -90); g.lineTo(-24 - step * 4, -70); g.lineTo(28 + step * 4, -70); g.lineTo(32, -90);
    g.bezierCurveTo(34, -150, 30, -200, 22, -210); g.closePath(); g.fill();
    // shoulders & collar
    g.beginPath(); g.ellipse(0, -206, 30, 12, 0, 0, U.TAU); g.fill();
    // head
    g.beginPath(); g.ellipse(4, -232, 12, 15, 0, 0, U.TAU); g.fill();
    if (p.hat) { g.beginPath(); g.ellipse(4, -244, 22, 4, 0, 0, U.TAU); g.fill(); g.fillRect(-7, -262, 22, 18); }
    // arm holding umbrella
    g.beginPath(); g.moveTo(14, -200); g.quadraticCurveTo(30, -170, 20, -150); g.lineTo(12, -152); g.quadraticCurveTo(18, -170, 6, -196); g.fill();
    // briefcase in the other hand
    if (p.briefcase) { g.fillRect(-36, -124 + step * 3, 34, 24); g.fillRect(-26, -130 + step * 3, 14, 6); }
    // umbrella
    g.save();
    g.translate(16, -150);
    g.rotate(-0.12 * dir);
    g.fillRect(-1.5, -130, 3, 130);
    g.beginPath();
    g.moveTo(-86, -118);
    g.quadraticCurveTo(-70, -170, 0, -178);
    g.quadraticCurveTo(70, -170, 86, -118);
    for (let k = 3; k >= -3; k--) g.quadraticCurveTo(k * 28 + 14, -128, k * 28 - (k > -3 ? 0 : 2), -118 + (k === -3 ? 0 : 0));
    g.closePath();
    g.fill();
    // rim light from street lamp
    g.strokeStyle = 'rgba(255,215,160,0.35)'; g.lineWidth = 2;
    g.beginPath(); g.moveTo(-86, -118); g.quadraticCurveTo(-70, -170, 0, -178); g.quadraticCurveTo(70, -170, 86, -118); g.stroke();
    g.restore();
    // rim light down the coat edge
    g.strokeStyle = 'rgba(160,180,220,0.22)'; g.lineWidth = 1.5;
    g.beginPath(); g.moveTo(24, -206); g.bezierCurveTo(32, -190, 34, -140, 30, -90); g.stroke();
    g.restore();
  }

  F.city = { hqFar };
})(window.F);
