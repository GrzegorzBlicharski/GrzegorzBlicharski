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
      for (let i = 0; i < 90; i++) this.lights.push(this.mk(r, true));
      this.glass = new G.GlassDrops([{ x: 260, y: 170, w: 1400, h: 620 }], { beads: 700, drips: 0, light: [180, 170, 170], seed: 77, scale: 1.3 });
      this.streaks = [];
      F.camSet(VW / 2, VH / 2, 1); F.cam.par = 10; F.cam.drift = 1.4;
      F.grade.tint = [150, 110, 80]; F.grade.tintA = 0.18; F.grade.vignette = 0.7;
      F.audio.mix({ cabin: 0.45, rain: 0.14, rainGlass: 0.12, pad: 0.35 }, 1.5);
    },
    mk(r, init) {
      const d = 0.2 + r() * 0.8; // depth: 1 = close/fast
      const pal = [[255, 190, 110], [255, 220, 170], [255, 60, 40], [150, 190, 255], [255, 160, 60], [120, 255, 170]];
      return { x: init ? r() * 2400 - 200 : 2200 + r() * 300, y: 140 + r() * 640, d, rad: 8 + d * 44, c: pal[(r() * pal.length) | 0], a: 0.2 + r() * 0.5 };
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
      this.lights.forEach((l) => {
        G.glow(g, l.x, l.y, l.rad * 2.2, l.c, l.a * 0.55);
        g.fillStyle = U.rgba(l.c, l.a * 0.35);
        g.beginPath(); g.arc(l.x, l.y, l.rad, 0, U.TAU); g.fill();
      });
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
  F.defineScene('flight', {
    enter() {
      const q = F.quality();
      this.clouds = G.cloudTexture(VW * 2.4, 900, 21, { n: 320, col: [140, 150, 180], a: 0.2, rmin: 90, rmax: 300 });
      this.clouds2 = G.cloudTexture(VW * 2.4, 700, 22, { n: 200, col: [90, 100, 130], a: 0.28, rmin: 90, rmax: 260 });
      // Warsaw at night from altitude: grid of sodium lights, river, stadium ring, the Palace glow
      this.city = F.offscreen(2600, 1300, q * 0.6, (g) => {
        const r = U.rng(9);
        g.fillStyle = '#050608'; g.fillRect(0, 0, 2600, 1300);
        // light grid (perspective handled at draw time by vertical squash)
        for (let i = 0; i < 9000; i++) {
          const x = r() * 2600, y = r() * 1300;
          const avenue = (Math.abs(((x + y * 0.3) % 160) - 80) < 3) || (Math.abs((y % 120) - 60) < 2);
          if (!avenue && r() < 0.55) continue;
          const c = r() < 0.75 ? [255, 176, 90] : [210, 225, 255];
          g.fillStyle = U.rgba(c, 0.25 + r() * 0.6);
          g.fillRect(x, y, 1.6 + r() * 1.6, 1.6 + r() * 1.6);
        }
        // the Vistula — dark sinuous ribbon with bridges
        g.strokeStyle = '#030305'; g.lineWidth = 70; g.lineCap = 'round';
        g.beginPath(); g.moveTo(1500, -50); g.bezierCurveTo(1380, 300, 1700, 600, 1550, 900); g.bezierCurveTo(1450, 1100, 1600, 1250, 1580, 1400); g.stroke();
        g.strokeStyle = 'rgba(255,190,110,0.5)'; g.lineWidth = 3;
        [[1290, 320, 1620, 300], [1380, 620, 1760, 640], [1320, 960, 1700, 900]].forEach(([a, b, c, d]) => { g.beginPath(); g.moveTo(a, b); g.lineTo(c, d); g.stroke(); });
        // stadium ring on the east bank
        g.strokeStyle = 'rgba(255,255,255,0.6)'; g.lineWidth = 6;
        g.beginPath(); g.ellipse(1840, 700, 60, 40, 0, 0, U.TAU); g.stroke();
        // centre: bright cluster (towers) and the palace glow
        G.glow(g, 1000, 640, 420, [255, 180, 100], 0.35);
        G.glow(g, 1000, 640, 90, [255, 230, 190], 0.8);
      });
      this.phase = 0;
      this.stars = Array.from({ length: 160 }, () => [Math.random() * VW * 1.4 - 200, Math.random() * 500, Math.random()]);
      F.camSet(VW / 2, VH / 2, 1); F.cam.par = 10; F.cam.drift = 0.5;
      F.grade.tint = [70, 90, 150]; F.grade.tintA = 0.25; F.grade.vignette = 0.7;
      F.audio.mix({ cabin: 0.55, pad: 0.4 }, 2);
      F.audio.chord('night');
    },
    update(dt, t) { this.phase = U.smooth(U.clamp((t - 2.2) / 4.2, 0, 1)); },
    draw(g, dt, t) {
      const ph = this.phase;
      // sky & stars
      F.layer(0.04, 0.1);
      const sky = g.createLinearGradient(0, 0, 0, VH);
      sky.addColorStop(0, '#02030a'); sky.addColorStop(0.5, U.rgba(U.mix([12, 18, 40], [20, 14, 16], ph), 1)); sky.addColorStop(1, U.rgba(U.mix([40, 50, 80], [60, 34, 20], ph), 1));
      g.fillStyle = sky; g.fillRect(-300, -300, VW + 600, VH + 600);
      this.stars.forEach(([x, y, b]) => { g.fillStyle = `rgba(255,255,255,${(0.2 + b * 0.6) * (1 - ph)})`; g.fillRect(x, y - ph * 200, 1.5, 1.5); });
      // moon
      G.glow(g, 1450, 180 - ph * 250, 160, [220, 230, 255], 0.35 * (1 - ph));
      g.fillStyle = `rgba(240,242,250,${0.9 * (1 - ph)})`; g.beginPath(); g.arc(1450, 180 - ph * 250, 22, 0, U.TAU); g.fill();
      // city below (appears as we descend and bank)
      F.layer(0.1, 0.2);
      g.save();
      g.globalAlpha = ph;
      g.translate(VW / 2, 900 - ph * 260);
      g.rotate(-0.08);
      g.scale(1, 0.42);
      g.drawImage(this.city, -1300 - t * 12, -650, 2600, 1300);
      g.restore();
      // cloud deck (parts as we descend)
      F.layer(0.12, 0.2);
      G.drawClouds(g, this.clouds, -500, 520 - ph * 520, VW * 2.4, 900, t * 60, 0.85 * (1 - ph * 0.8));
      G.drawClouds(g, this.clouds2, -500, 700 - ph * 700, VW * 2.4, 700, t * 110, 0.7 * (1 - ph));
      // wing + nav light
      F.layer(0.5, 0.5);
      g.fillStyle = '#0a0b0f';
      g.beginPath(); g.moveTo(-200, 760 + ph * 20); g.lineTo(1150, 640 + ph * 30); g.lineTo(1190, 660 + ph * 30); g.lineTo(-200, 880 + ph * 20); g.closePath(); g.fill();
      g.fillStyle = 'rgba(150,170,210,0.18)'; g.beginPath(); g.moveTo(-200, 760 + ph * 20); g.lineTo(1150, 640 + ph * 30); g.lineTo(1150, 643 + ph * 30); g.lineTo(-200, 764 + ph * 20); g.fill();
      const blink = (t % 1.3) < 0.08;
      G.glow(g, 1175, 648 + ph * 30, blink ? 120 : 30, [255, 50, 40], blink ? 1 : 0.5);
      if ((t % 1.3) > 0.2 && (t % 1.3) < 0.26) G.glow(g, 1175, 648 + ph * 30, 200, [255, 255, 255], 0.9);
      // oval window frame
      F.layer(1);
      g.fillStyle = '#16171b';
      g.beginPath();
      g.rect(-300, -300, VW + 600, VH + 600);
      g.ellipse(VW / 2, VH / 2, 430, 380, 0, 0, U.TAU);
      g.fill('evenodd');
      const inner = g.createRadialGradient(VW / 2, VH / 2, 380, VW / 2, VH / 2, 520);
      inner.addColorStop(0, 'rgba(0,0,0,0.9)'); inner.addColorStop(0.2, 'rgba(40,42,48,0.9)'); inner.addColorStop(1, 'rgba(20,21,24,0)');
      g.fillStyle = inner;
      g.beginPath(); g.ellipse(VW / 2, VH / 2, 520, 470, 0, 0, U.TAU); g.ellipse(VW / 2, VH / 2, 430, 380, 0, 0, U.TAU); g.fill('evenodd');
      // cabin panel texture
      g.fillStyle = 'rgba(255,255,255,0.03)';
      g.beginPath(); g.ellipse(VW / 2, VH / 2 - 20, 560, 510, 0, Math.PI * 1.1, Math.PI * 1.9); g.lineWidth = 2; g.strokeStyle = 'rgba(255,255,255,0.05)'; g.stroke();
      // window scratches & reflection
      g.save();
      g.beginPath(); g.ellipse(VW / 2, VH / 2, 430, 380, 0, 0, U.TAU); g.clip();
      const refl = g.createLinearGradient(VW / 2 - 400, VH / 2 - 380, VW / 2 + 200, VH / 2 + 380);
      refl.addColorStop(0, 'rgba(255,240,220,0.06)'); refl.addColorStop(0.4, 'rgba(255,255,255,0)');
      g.fillStyle = refl; g.fillRect(0, 0, VW, VH);
      g.restore();
      // cabin reading light wash
      G.glow(g, 200, 100, 600, [255, 220, 170], 0.08);
    },
    exit() { F.grade.tintA = 0; },
  });
})(window.F);
