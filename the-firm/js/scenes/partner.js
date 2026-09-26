/* THE FIRM — Dr. Helena Wendt's corner office, 23rd floor. Dialogue-driven scene with shot framing. */
(function (F) {
  'use strict';
  const U = F.U, G = F.gfx;
  const VW = F.VW, VH = F.VH;
  const VP = [820, 470];
  const BW = { x0: 180, x1: 1230, y0: 80, y1: 668 }; // back window
  const CORNER = 1262;

  F.defineScene('partner', {
    enter(o) {
      o = o || {};
      const q = F.quality();
      const win = { lit: 0.14, warm: [255, 196, 120], wa: 0.75, cw: 3, ch: 4, gx: 4, gy: 5 };
      const body = (k) => U.rgba(U.mix([34, 40, 50], [90, 96, 108], k), 1);
      this.clouds = G.cloudTexture(VW * 2.2, 600, 5, { n: 220, col: [150, 160, 176], a: 0.16, rmin: 80, rmax: 260 });
      this.far = G.skyline({ w: VW + 1000, h: 900, base: 540, seed: 121, minW: 26, maxW: 80, minH: 8, maxH: 40, gap: 10, pitched: 0.6, body: body(0.55), fog: [100, 106, 118], fogBottom: 0.45, fogTop: 0.3, win: Object.assign({}, win, { lit: 0.08 }), landmarks: [G.lm.radioTower(1500, 300, body(0.55), 0.95)], below: body(0.6), q: q * 0.6 });
      this.mid = G.skyline({ w: VW + 1000, h: 900, base: 610, seed: 133, minW: 30, maxW: 95, minH: 20, maxH: 80, gap: 8, pitched: 0.75, body: body(0.3), edge: 'rgba(150,160,175,0.22)', fog: [84, 90, 102], fogBottom: 0.35, win, landmarks: [G.lm.townHall(640, 175, body(0.3), 1.25), G.lm.church(380, 100, body(0.3), 1), G.lm.church(1020, 90, body(0.3), 0.9)], groundGlow: [255, 170, 90], groundGlowA: 0.25, below: body(0.35), q: q * 0.7 });
      this.room = F.offscreen(VW + 500, VH + 300, q, (g) => { g.translate(250, 150); paintOffice(g); });
      this.fore = F.offscreen(VW + 600, VH + 300, q, (g) => { g.translate(300, 150); paintForeground(g); });
      this.glass = new G.GlassDrops([{ x: BW.x0, y: BW.y0, w: BW.x1 - BW.x0, h: BW.y1 - BW.y0 }], { beads: 1100, drips: 14, light: [205, 215, 232], seed: 51, scale: 0.9 });
      this.rain = new G.Rain(500, { angle: 0.13, speed: 1300, len: 34, alpha: 0.17, x0: 0, x1: VW + 300, y0: -100, y1: 700 });
      this.wendt = { back: o.back !== false && o.back !== '0', turn: 0.35, expr: 'cold', pose: 'crossed' };
      this.shots = {
        wide: { x: VW / 2, y: VH / 2, z: 1.0 },
        med: { x: 1080, y: 360, z: 1.65 },
        close: { x: 1105, y: 250, z: 2.35 },
        window: { x: 900, y: 420, z: 1.25 },
      };
      const s0 = this.shots[o.shot || 'wide'];
      F.camSet(s0.x, s0.y, s0.z);
      F.cam.par = 18; F.cam.drift = 0.8;
      F.grade.tint = [120, 110, 100]; F.grade.tintA = 0.18; F.grade.vignette = 0.66;
      F.audio.mix({ rain: 0.1, rainGlass: 0.16, room: 0.2, city: 0.06, pad: 0.45 }, 2);
      F.audio.chord('tense');
    },
    shot(name, dur) { const s = this.shots[name]; return F.camTween({ x: s.x, y: s.y, z: s.z }, dur == null ? 1.6 : dur, U.easeInOut); },
    cut(name) { const s = this.shots[name]; F.camSet(s.x, s.y, s.z); },
    update(dt) { this.glass.update(dt); this.rain.update(dt); },
    draw(g, dt, t) {
      F.layer(0.03, 0.1);
      const sky = g.createLinearGradient(0, 0, 0, 700);
      sky.addColorStop(0, '#121924'); sky.addColorStop(0.5, '#2d3848'); sky.addColorStop(1, '#8a8784');
      g.fillStyle = sky; g.fillRect(-500, -400, VW + 1000, VH + 800);
      G.glow(g, 500, 640, 700, [160, 130, 105], 0.2);
      F.layer(0.05, 0.12);
      G.drawClouds(g, this.clouds, -500, -30, VW * 2.2, 600, t * 10, 0.9);
      F.layer(0.09, 0.2);
      g.drawImage(this.far.canvas, -500, 0, this.far.canvas.vw, this.far.canvas.vh);
      F.layer(0.14, 0.3);
      g.drawImage(this.mid.canvas, -500, 0, this.mid.canvas.vw, this.mid.canvas.vh);
      F.layer(0.6, 0.75);
      g.save();
      g.beginPath();
      g.rect(BW.x0, BW.y0, BW.x1 - BW.x0, BW.y1 - BW.y0);
      g.moveTo(CORNER + 30, BW.y0); g.lineTo(VW + 250, -150); g.lineTo(VW + 250, 900); g.lineTo(CORNER + 30, BW.y1); g.closePath();
      g.clip();
      this.rain.draw(g);
      g.fillStyle = 'rgba(30,40,56,0.12)'; g.fillRect(0, -200, VW + 300, 1000);
      G.glow(g, 620, 420, 200, [255, 200, 140], 0.07);
      this.glass.draw(g, 0.9);
      g.restore();
      g.drawImage(this.room, -250, -150, this.room.vw, this.room.vh);
      // live: lamp glow flicker-free, decanter glint
      G.glow(g, 450, 505, 110, [255, 210, 150], 0.55);
      G.glow(g, 210, 560, 16, [255, 240, 220], 0.4 + 0.2 * Math.sin(t * 1.3));
      // Wendt
      F.layer(1);
      const w = this.wendt;
      G.shadow(g, 1100, 736, 110, 14, 0.5);
      F.people.draw(g, F.people.cast.wendt, 1100, 736, 610, {
        back: w.back, turn: w.turn, expr: w.expr, pose: w.pose, talking: F.ui.speaking === 'wendt', lookX: -0.5,
        light: { key: [255, 214, 170], keyA: 0.95, dir: -1, amb: [66, 72, 88], rim: [175, 200, 240], rimA: 0.9, rimSide: 1 },
      });
      // foreground armchair & desk corner (parallax)
      F.layer(1.3, 1.3);
      g.drawImage(this.fore, -300, -150, this.fore.vw, this.fore.vh);
    },
    exit() { F.grade.tintA = 0; },
  });

  function paintOffice(g) {
    // ceiling — warm plaster with cove light
    G.quad(g, [[-250, -150], [VW + 250, -150], [CORNER, BW.y0], [BW.x0, BW.y0]], '#1c1814');
    const cove = g.createLinearGradient(0, BW.y0 - 30, 0, BW.y0);
    cove.addColorStop(0, 'rgba(255,210,150,0)'); cove.addColorStop(1, 'rgba(255,210,150,0.18)');
    g.fillStyle = cove; g.fillRect(BW.x0, BW.y0 - 30, CORNER - BW.x0, 30);
    // downlights
    [[480, 30], [900, 30], [1500, -20]].forEach(([x, y]) => { g.fillStyle = 'rgba(255,236,200,0.9)'; g.beginPath(); g.ellipse(x, y, 16, 5, 0, 0, U.TAU); g.fill(); G.glow(g, x, y + 4, 70, [255, 220, 170], 0.25); });
    // back window frame (window area transparent) + mullions
    g.fillStyle = '#0b0a09';
    g.fillRect(BW.x0 - 12, BW.y0 - 10, BW.x1 - BW.x0 + 24, 12);
    g.fillRect(BW.x0 - 12, BW.y1 - 4, BW.x1 - BW.x0 + 24, 14);
    for (let k = 0; k <= 7; k++) { const x = BW.x0 + ((BW.x1 - BW.x0) * k) / 7; g.fillStyle = '#0a0908'; g.fillRect(x - 5, BW.y0, 10, BW.y1 - BW.y0); g.fillStyle = 'rgba(200,190,170,0.1)'; g.fillRect(x - 5, BW.y0, 1.5, BW.y1 - BW.y0); }
    // corner column
    const cc = g.createLinearGradient(BW.x1, 0, CORNER + 30, 0);
    cc.addColorStop(0, '#1a1511'); cc.addColorStop(1, '#0c0a08');
    g.fillStyle = cc; g.fillRect(BW.x1, BW.y0 - 10, CORNER + 30 - BW.x1, BW.y1 - BW.y0 + 24);
    // right window wall mullions (perspective)
    for (let k = 0; k < 5; k++) {
      const tt = k / 4;
      const x = U.lerp(CORNER + 30, VW + 250, Math.pow(tt, 1.6));
      const yt = U.lerp(BW.y0, -150, Math.pow(tt, 1.6)), yb = U.lerp(BW.y1, 900, Math.pow(tt, 1.6));
      g.fillStyle = '#0a0908'; g.fillRect(x - 6 - tt * 10, yt, 12 + tt * 20, yb - yt);
    }
    // sill of right window
    G.quad(g, [[CORNER + 30, BW.y1 - 4], [VW + 250, 880], [VW + 250, 910], [CORNER + 30, BW.y1 + 10]], '#0b0a09');
    // left wall: floor-to-ceiling bookshelves (walnut) in perspective
    G.quad(g, [[-250, -150], [BW.x0, BW.y0], [BW.x0, BW.y1], [-250, VH + 150]], '#1d140d');
    const r = U.rng(4);
    for (let row = 0; row < 7; row++) {
      const t0 = row / 7, t1 = (row + 1) / 7;
      const yl0 = U.lerp(-150, VH + 150, t0), yl1 = U.lerp(-150, VH + 150, t1);
      const yr0 = U.lerp(BW.y0, BW.y1, t0), yr1 = U.lerp(BW.y0, BW.y1, t1);
      // shelf board
      G.quad(g, [[-250, yl1 - 10], [BW.x0, yr1 - 3], [BW.x0, yr1], [-250, yl1]], '#3a2717');
      // books
      let x = -250;
      while (x < BW.x0 - 6) {
        const tt = (x + 250) / (BW.x0 + 250);
        const bw = (22 - tt * 14) * (0.7 + r() * 0.6);
        const yb = U.lerp(yl1 - 10, yr1 - 3, tt), ytop = U.lerp(yl0 + 6, yr0 + 2, tt) + (yb - U.lerp(yl0 + 6, yr0 + 2, tt)) * r() * 0.25;
        const cols = [[70, 24, 20], [30, 40, 60], [50, 38, 26], [24, 44, 34], [80, 64, 40]];
        const c = cols[(r() * cols.length) | 0];
        g.fillStyle = U.rgba(c, 1);
        g.fillRect(x, ytop, bw - 1, yb - ytop);
        if (r() < 0.6) { g.fillStyle = 'rgba(210,175,110,0.55)'; g.fillRect(x + 1, ytop + (yb - ytop) * 0.2, bw - 3, 1.2); g.fillRect(x + 1, ytop + (yb - ytop) * 0.7, bw - 3, 1.2); }
        x += bw;
      }
    }
    // warm shelf lighting falloff
    const sl = g.createLinearGradient(-250, 0, BW.x0, 0);
    sl.addColorStop(0, 'rgba(0,0,0,0.55)'); sl.addColorStop(1, 'rgba(0,0,0,0)');
    G.quad(g, [[-250, -150], [BW.x0, BW.y0], [BW.x0, BW.y1], [-250, VH + 150]], sl);
    // floor: herringbone parquet
    const fl = g.createLinearGradient(0, BW.y1, 0, VH + 150);
    fl.addColorStop(0, '#2a1d13'); fl.addColorStop(1, '#0f0a07');
    G.quad(g, [[-250, VH + 150], [BW.x0, BW.y1], [CORNER + 30, BW.y1 + 10], [VW + 250, 910], [VW + 250, VH + 150]], fl);
    g.strokeStyle = 'rgba(0,0,0,0.25)'; g.lineWidth = 1;
    for (let k = -10; k <= 14; k++) { g.beginPath(); g.moveTo(VP[0] + k * 70, BW.y1 + 4); g.lineTo(VP[0] + k * 300, VH + 150); g.stroke(); }
    // window light on the floor
    const sp = g.createLinearGradient(0, BW.y1, 0, BW.y1 + 300);
    sp.addColorStop(0, 'rgba(170,190,220,0.18)'); sp.addColorStop(1, 'rgba(170,190,220,0)');
    G.quad(g, [[BW.x0, BW.y1], [BW.x1, BW.y1], [BW.x1 + 400, BW.y1 + 300], [BW.x0 - 300, BW.y1 + 300]], sp);
    // rug
    G.quad(g, [[300, 720], [1180, 720], [1330, 900], [150, 900]], '#2a1616');
    g.strokeStyle = 'rgba(200,160,110,0.18)'; g.lineWidth = 2; G.quad(g, [[318, 728], [1164, 728], [1304, 892], [174, 892]]); g.stroke();
    // sideboard with decanter (left, under window)
    G.quad(g, [[190, 560], [330, 560], [330, 668], [190, 668]], '#1a120b');
    g.fillStyle = 'rgba(255,220,170,0.12)'; g.fillRect(190, 560, 140, 1.5);
    g.fillStyle = 'rgba(180,120,60,0.55)'; g.beginPath(); g.ellipse(212, 545, 12, 16, 0, 0, U.TAU); g.fill(); g.fillRect(208, 520, 8, 14);
    g.fillStyle = 'rgba(255,240,220,0.35)'; g.fillRect(206, 534, 2, 14);
    // executive desk — walnut, leather inlay, brass edge
    const dk = g.createLinearGradient(0, 610, 0, 790);
    dk.addColorStop(0, '#3e2c1d'); dk.addColorStop(1, '#170f09');
    G.quad(g, [[360, 612], [940, 612], [1000, 660], [300, 660]], '#4a3523');
    G.quad(g, [[400, 618], [900, 618], [950, 654], [350, 654]], '#2a1c12');          // leather inlay
    g.fillStyle = 'rgba(210,170,100,0.55)'; g.fillRect(300, 659, 700, 2);              // brass edge
    g.fillStyle = 'rgba(255,220,170,0.22)'; g.fillRect(360, 612, 580, 1.5);
    G.quad(g, [[300, 661], [1000, 661], [1000, 790], [300, 790]], dk);
    // front panel insets + grain
    g.strokeStyle = 'rgba(0,0,0,0.45)'; g.lineWidth = 2;
    [[318, 676, 300, 98], [682, 676, 300, 98]].forEach(([x, y, w, h]) => { g.strokeRect(x, y, w, h); g.strokeStyle = 'rgba(255,210,160,0.08)'; g.strokeRect(x + 2, y + 2, w, h); g.strokeStyle = 'rgba(0,0,0,0.45)'; });
    const gr0 = U.rng(22);
    g.strokeStyle = 'rgba(0,0,0,0.16)'; g.lineWidth = 1;
    for (let k = 0; k < 18; k++) { const y = 666 + gr0() * 120; g.beginPath(); g.moveTo(300, y); g.bezierCurveTo(500, y + 4, 800, y - 4, 1000, y + 2); g.stroke(); }
    // lamp light raking the desk front
    const rk = g.createRadialGradient(470, 640, 10, 470, 660, 320);
    rk.addColorStop(0, 'rgba(255,200,140,0.18)'); rk.addColorStop(1, 'rgba(255,200,140,0)');
    g.fillStyle = rk; g.fillRect(300, 612, 700, 180);
    // blotter, contract with tabs, fountain pen, frame, stacked files
    G.quad(g, [[520, 622], [760, 622], [780, 650], [500, 650]], '#12100e');
    G.quad(g, [[560, 626], [650, 626], [656, 646], [552, 646]], '#e9e3d6');
    ['#b3322b', '#2b4fa8', '#c9a96b'].forEach((c, i) => { g.fillStyle = c; g.fillRect(650, 628 + i * 5, 6, 3); });
    g.fillStyle = '#0d0d0f'; g.fillRect(680, 632, 60, 3); g.fillStyle = '#c9a96b'; g.fillRect(730, 632, 12, 3);
    G.quad(g, [[850, 596], [900, 596], [902, 628], [848, 628]], '#15120f');
    g.fillStyle = 'rgba(200,190,170,0.3)'; g.fillRect(854, 600, 42, 24);
    [0, 1, 2, 3].forEach((k) => { g.fillStyle = k % 2 ? '#e3dccd' : '#d8d0bf'; G.quad(g, [[790, 624 - k * 5], [840, 624 - k * 5], [846, 634 - k * 5], [786, 634 - k * 5]], k % 2 ? '#e3dccd' : '#5e2a22'); });
    // chair — tufted leather, backlit rim
    g.fillStyle = '#0c0907';
    G.roundRect(g, 556, 455, 138, 165, 24); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.03)';
    for (let r2 = 0; r2 < 3; r2++) for (let c2 = 0; c2 < 3; c2++) { g.beginPath(); g.arc(584 + c2 * 41, 490 + r2 * 40, 3, 0, U.TAU); g.fill(); }
    g.strokeStyle = 'rgba(190,205,230,0.2)'; g.lineWidth = 2;
    g.beginPath(); g.moveTo(580, 456); g.lineTo(670, 456); g.stroke();
    g.strokeStyle = 'rgba(190,205,230,0.12)';
    g.beginPath(); g.moveTo(694, 470); g.lineTo(694, 600); g.stroke();
    // brass desk lamp
    g.strokeStyle = '#8a6a3a'; g.lineWidth = 4;
    g.beginPath(); g.moveTo(430, 625); g.lineTo(440, 530); g.lineTo(470, 505); g.stroke();
    g.fillStyle = '#8a6a3a'; g.beginPath(); g.ellipse(430, 626, 26, 6, 0, 0, U.TAU); g.fill();
    g.fillStyle = '#2c2116'; g.beginPath(); g.moveTo(438, 492); g.lineTo(492, 492); g.lineTo(502, 516); g.lineTo(428, 516); g.closePath(); g.fill();
    G.pool(g, 470, 622, 180, 22, [255, 205, 150], 0.4);
    // abstract painting over the bookshelf edge? — small framed print on column
    G.quad(g, [[1236, 280], [1258, 282], [1258, 380], [1236, 382]], '#20180f');
  }

  function paintForeground(g) {
    // leather armchair silhouette, right foreground
    g.fillStyle = '#0d0907';
    G.roundRect(g, 1540, 720, 420, 420, 60); g.fill();
    G.roundRect(g, 1500, 820, 90, 320, 30); g.fill();
    g.fillStyle = 'rgba(255,210,160,0.1)';
    g.fillRect(1560, 722, 380, 2);
    const rim = g.createLinearGradient(1540, 0, 1640, 0);
    rim.addColorStop(0, 'rgba(255,210,160,0.12)'); rim.addColorStop(1, 'rgba(255,210,160,0)');
    g.fillStyle = rim; g.fillRect(1540, 730, 100, 400);
    // side table + whisky glass
    g.fillStyle = '#080606'; g.fillRect(-120, 860, 260, 16); g.fillRect(0, 876, 12, 300);
    g.fillStyle = 'rgba(200,150,80,0.35)'; g.fillRect(40, 820, 40, 40);
    g.strokeStyle = 'rgba(255,240,220,0.35)'; g.lineWidth = 1.5; g.strokeRect(40, 812, 40, 48);
  }
})(window.F);
