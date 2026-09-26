/* THE FIRM — 22nd floor, M&A group, Gliwice. Environment-first hub: the desk IS the interface.
   Two lighting states: morning (07:19, rain, cold dawn) and evening (18:52, warm lamps, dark glass). */
(function (F) {
  'use strict';
  const U = F.U, G = F.gfx;
  const VW = F.VW, VH = F.VH;
  const VP = [900, 470];
  const WIN = { x0: 230, x1: 1570, y0: 110, y1: 640 };
  const D_ROOM = 0.55, D_DESK = 1.18, D_JONAS = 0.6;

  const LIGHT = {
    morning: {
      sky: ['#101722', '#2b3647', '#5d6674', '#8a8784'], cloud: [150, 160, 176], cityBody: [34, 40, 50],
      ceil: '#1a1d22', wall: '#262a31', floor: ['#1c1f25', '#0d0f12'], ceilLight: [225, 235, 250], ceilA: 0.55,
      amb: [70, 80, 98], key: [205, 220, 245], rim: [170, 195, 235], tint: [80, 110, 150], tintA: 0.28, lampA: 0.85,
      winLit: 0.14, reflA: 0.05, desk: ['#2a2420', '#15110e'],
    },
    winter: {
      sky: ['#1a1f29', '#3e4654', '#7d838c', '#a9a8a6'], cloud: [190, 196, 206], cityBody: [44, 50, 60],
      ceil: '#1b1e23', wall: '#282c33', floor: ['#1d2026', '#0e1013'], ceilLight: [230, 238, 250], ceilA: 0.6,
      amb: [78, 86, 102], key: [215, 226, 245], rim: [200, 215, 240], tint: [90, 120, 160], tintA: 0.3, lampA: 0.9,
      winLit: 0.16, reflA: 0.05, desk: ['#2a2521', '#15110e'],
    },
    evening: {
      sky: ['#05070b', '#0b1019', '#1a1c26', '#3a2e2c'], cloud: [130, 96, 76], cityBody: [16, 19, 26],
      ceil: '#14110e', wall: '#231d18', floor: ['#1a1613', '#0a0908'], ceilLight: [255, 214, 160], ceilA: 0.35,
      amb: [70, 58, 50], key: [255, 206, 150], rim: [120, 150, 210], tint: [150, 105, 60], tintA: 0.2, lampA: 1,
      winLit: 0.34, reflA: 0.16, desk: ['#2c2119', '#120d09'],
    },
  };

  F.defineScene('office', {
    enter(o) {
      o = o || {};
      this.mode = o.mode || F.state.officeMode || 'morning';
      F.state.officeMode = this.mode;
      const L = (this.L = LIGHT[this.mode]);
      const q = F.quality();
      const eve = this.mode === 'evening';
      const win = { lit: L.winLit, warm: [255, 196, 120], wa: eve ? 0.95 : 0.75, cw: 3, ch: 4, gx: 4, gy: 5 };
      this.clouds = G.cloudTexture(VW * 2.2, 600, eve ? 12 : 4, { n: 220, col: L.cloud, a: eve ? 0.14 : 0.16, rmin: 80, rmax: 260 });
      const body = (k) => U.rgba(U.mix(L.cityBody, eve ? [8, 10, 14] : [90, 96, 108], k), 1);
      this.far = G.skyline({ w: VW + 800, h: 1000, base: 520, seed: 21, minW: 26, maxW: 80, minH: 8, maxH: 44, gap: 10, pitched: 0.6, body: body(0.55), fog: eve ? [26, 30, 40] : [100, 106, 118], fogBottom: 0.45, fogTop: 0.3, win: Object.assign({}, win, { lit: L.winLit * 0.6 }), landmarks: [G.lm.radioTower(1180, 300, body(0.5), 0.95, []), G.lm.headframe(1560, 150, body(0.55), win, 0.8)], below: body(0.6), q: q * 0.6 });
      this.mid = G.skyline({ w: VW + 800, h: 1000, base: 590, seed: 33, minW: 30, maxW: 95, minH: 20, maxH: 90, gap: 8, pitched: 0.75, body: body(0.3), edge: eve ? 'rgba(90,100,120,0.2)' : this.mode === 'winter' ? 'rgba(236,240,248,0.7)' : 'rgba(150,160,175,0.22)', fog: eve ? [20, 24, 32] : [84, 90, 102], fogBottom: 0.35, win, landmarks: [G.lm.townHall(1240, 150, body(0.3), 1.05), G.lm.church(1560, 90, body(0.3), 0.9), G.lm.church(1780, 80, body(0.3), 0.9)], groundGlow: [255, 170, 90], groundGlowA: eve ? 0.45 : 0.25, below: body(0.35), q: q * 0.7 });
      this.near = G.skyline({ w: VW + 900, h: 1100, base: 700, seed: 47, minW: 60, maxW: 170, minH: 30, maxH: 150, gap: 30, pitched: 0.8, body: body(0), edge: this.mode === 'winter' ? 'rgba(236,240,248,0.8)' : 'rgba(120,130,150,0.25)', win: Object.assign({}, win, { lit: L.winLit * 1.4, cw: 5, ch: 6, gx: 6, gy: 7, wa: 0.9 }), groundGlow: [255, 160, 80], groundGlowA: eve ? 0.5 : 0.3, below: body(0.05), q: q * 0.75 });
      this.lights = [];
      this.room = F.offscreen(VW + 500, VH + 300, q, (g) => { g.translate(250, 150); paintRoom(g, L, eve); });
      this.desk = F.offscreen(VW + 600, 520, q, (g) => { g.translate(300, 0); paintDesk(g, L, eve, F.state); });
      this.glass = new G.GlassDrops([{ x: WIN.x0, y: WIN.y0, w: WIN.x1 - WIN.x0, h: WIN.y1 - WIN.y0 }], { beads: 1500, drips: 18, light: eve ? [150, 160, 190] : [205, 215, 232], dark: [8, 10, 16], seed: 31, scale: 0.9 });
      this.winter = this.mode === 'winter';
      if (this.winter) this.snow = new G.Snow(420, { x0: WIN.x0 - 200, x1: WIN.x1 + 100, y0: WIN.y0 - 60, y1: WIN.y1 + 20, speed: 70, wind: 40, size: 2.2 });
      this.rain = new G.Rain(eve ? 500 : 650, { angle: 0.13, speed: 1300, len: 34, alpha: eve ? 0.12 : 0.18, x0: WIN.x0 - 200, x1: WIN.x1 + 200, y0: WIN.y0 - 100, y1: WIN.y1 + 40, col: eve ? [140, 150, 175] : [200, 210, 225] });
      F.camSet(VW / 2, VH / 2, 1.0);
      F.cam.par = 26; F.cam.drift = 0.7;
      F.grade.tint = L.tint; F.grade.tintA = L.tintA; F.grade.vignette = 0.62; F.grade.grain = 0.07;
      this.sit = o.arrive ? 0 : 1;           // 0 = standing (desk below frame), 1 = seated
      this.monitor = o.arrive ? 0 : 1;       // 0 asleep → 1 awake
      this.phoneBuzz = 0;
      this.phoneLit = 0;
      this.phoneText = null;
      this.hoverA = {};
      this.jonas = (this.mode === 'morning' && !F.flag('jonasLeft')) || this.mode === 'winter';
      this.monitorText = eve ? 'doc' : 'login';
      this.buildHotspots();
      if (this.winter) F.audio.mix({ city: 0.12, room: 0.25, hvac: 0.16, pad: 0.35 }, 2.5); else F.audio.mix(eve ? { rain: 0.1, rainGlass: 0.14, room: 0.28, hvac: 0.1, city: 0.08, pad: 0.4 } : { rain: 0.14, rainGlass: 0.2, room: 0.25, hvac: 0.12, city: 0.1, pad: 0.35 }, 2.5);
      F.audio.chord(eve ? 'warm' : 'dm');
    },
    buildHotspots() {
      const self = this;
      const deskY = () => (1 - self.sit) * 420;
      F.hotspots = [
        { id: 'window', d: D_ROOM, x: WIN.x0 + 40, y: WIN.y0 + 20, w: 520, h: 330, label: 'Window', sub: 'Look out over the city', onClick: () => F.emit('office:window') },
        { id: 'stairs', d: D_ROOM, poly: [[1600, 740], [1640, 120], [1860, 60], [1900, 760]], label: 'Stairs · 10th floor', sub: this.mode === 'morning' ? 'Partner floor' : 'Partner floor', onClick: () => F.emit('office:stairs') },
        { id: 'monitor', d: D_DESK, x: 360, y: 430, w: 520, h: 330, label: 'Workstation', sub: 'Mail · Documents · Research', onClick: () => F.emit('office:computer') },
        { id: 'phone', d: D_DESK, poly: [[1050, 895], [1150, 895], [1160, 1000], [1040, 1000]], label: 'Phone', sub: 'Messages', onClick: () => F.emit('office:phone') },
        { id: 'file', d: D_DESK, poly: [[1230, 850], [1540, 850], [1600, 975], [1210, 975]], label: 'Case File', sub: 'Projekt CARBO', onClick: () => F.emit('office:file') },
        { id: 'coffee', d: D_DESK, x: 905, y: 800, w: 100, h: 110, label: 'Coffee', sub: 'Still hot', onClick: () => F.emit('office:coffee') },
      ];
      if (this.jonas) F.hotspots.push({ id: 'jonas', d: D_JONAS, x: 930, y: 300, w: 140, h: 370, label: 'Jonas Brenner', sub: 'Associate · Talk', onClick: () => F.emit('office:jonas') });
      if (this.mode === 'evening') {
        F.hotspots.push({ id: 'board', d: D_ROOM, poly: [[-40, 60], [210, 150], [210, 690], [-40, 820]], label: 'Project Room 22.3', sub: 'The case board', onClick: () => F.emit('office:board') });
        F.hotspots.push({ id: 'jonasEve', d: D_JONAS, x: 250, y: 330, w: 170, h: 420, label: 'Jonas Brenner', sub: 'Still here · Talk', onClick: () => F.emit('office:jonasEve') });
      }
    },
    // cinematic arrival: sit down, monitor wakes, phone buzzes
    async arrive(who, text) {
      F.inputLocked = true;
      await F.wait(600);
      this.sitTween = { from: 0, to: 1, t: 0, dur: 2.6 };
      F.camTween({ x: VW / 2, y: VH / 2 + 10, z: 1.0 }, 2.8);
      await F.wait(2400);
      F.audio.tone(90, 0.3, 0.05);
      await F.wait(500);
      this.wake = { t: 0 };
      F.audio.tone(660, 0.3, 0.02); F.audio.tone(990, 0.4, 0.015, 'sine', 0.12);
      await F.wait(2600);
      this.buzz(who || 'Albrecht · Office Dr. Wendt', text || 'Partner wants you upstairs.');
      await F.wait(1800);
      F.inputLocked = false;
    },
    buzz(who, text) {
      this.phoneBuzz = 1.4;
      this.phoneLit = 1;
      this.phoneText = { who, text };
      F.audio.buzz(2);
    },
    update(dt, t) {
      this.glass.update(dt); this.rain.update(dt);
      if (this.snow) this.snow.update(dt, t);
      if (this.sitTween) {
        const s = this.sitTween; s.t += dt;
        this.sit = U.easeInOut(U.clamp(s.t / s.dur, 0, 1));
        if (s.t >= s.dur) this.sitTween = null;
      }
      if (this.wake) { this.wake.t += dt; this.monitor = U.clamp(this.wake.t / 1.6, 0, 1); if (this.monitor >= 1) this.wake = null; }
      if (this.phoneBuzz > 0) this.phoneBuzz = Math.max(0, this.phoneBuzz - dt);
      if (this.phoneLit > 0 && !this.phoneText) this.phoneLit = Math.max(0, this.phoneLit - dt * 0.5);
      Object.keys(this.hoverA).forEach((k) => { this.hoverA[k] = U.damp(this.hoverA[k], F.hover && F.hover.id === k ? 1 : 0, 10, dt); });
      if (F.hover && this.hoverA[F.hover.id] == null) this.hoverA[F.hover.id] = 0;
    },
    draw(g, dt, t) {
      const L = this.L, eve = this.mode === 'evening';
      // ---------------- beyond the glass
      F.layer(0.03, 0.08);
      const sky = g.createLinearGradient(0, 0, 0, 700);
      L.sky.forEach((c, i) => sky.addColorStop(i / (L.sky.length - 1), c));
      g.fillStyle = sky; g.fillRect(-400, -300, VW + 800, VH + 600);
      if (!eve) G.glow(g, 300, 600, 600, [150, 120, 100], 0.2);
      else { G.glow(g, 700, 620, 900, [255, 140, 70], 0.16); G.glow(g, 1400, 640, 700, [255, 150, 80], 0.12); }
      F.layer(0.05, 0.1);
      G.drawClouds(g, this.clouds, -500, -40, VW * 2.2, 600, t * 12, 0.9);
      F.layer(0.08, 0.15);
      g.drawImage(this.far.canvas, -400, 0, this.far.canvas.vw, this.far.canvas.vh);
      F.layer(0.12, 0.2);
      g.drawImage(this.mid.canvas, -400, 0, this.mid.canvas.vw, this.mid.canvas.vh);
      F.layer(0.18, 0.28);
      g.drawImage(this.near.canvas, -450, 0, this.near.canvas.vw, this.near.canvas.vh);
      if (eve) G.glow(g, 900, 760, 900, [255, 150, 70], 0.12);
      // rain beyond glass
      F.layer(D_ROOM);
      g.save();
      g.beginPath(); g.rect(WIN.x0, WIN.y0, WIN.x1 - WIN.x0, WIN.y1 - WIN.y0); g.clip();
      if (this.snow) this.snow.draw(g); else this.rain.draw(g);
      // glass: tint + interior reflections (stronger at night)
      g.fillStyle = eve ? 'rgba(10,12,18,0.25)' : 'rgba(30,40,56,0.12)';
      g.fillRect(WIN.x0, WIN.y0, WIN.x1 - WIN.x0, WIN.y1 - WIN.y0);
      paintReflections(g, L, eve, t);
      if (this.winter) {
        // frost creeping in from the pane corners
        for (let k = 0; k <= 10; k++) {
          const x = WIN.x0 + ((WIN.x1 - WIN.x0) * k) / 10;
          [WIN.y0, WIN.y1].forEach((y) => { const fg = g.createRadialGradient(x, y, 0, x, y, 90); fg.addColorStop(0, 'rgba(225,235,248,0.28)'); fg.addColorStop(1, 'rgba(225,235,248,0)'); g.fillStyle = fg; g.fillRect(x - 90, y - 90, 180, 180); });
        }
      } else this.glass.draw(g, eve ? 0.7 : 0.9);
      g.restore();
      if (this.winter) {
        // snow on the outside ledge
        g.fillStyle = 'rgba(232,238,246,0.85)';
        g.beginPath(); g.moveTo(WIN.x0, WIN.y1 - 2);
        for (let x = WIN.x0; x <= WIN.x1; x += 30) g.lineTo(x, WIN.y1 - 6 - Math.sin(x * 0.05) * 2.5 - ((x * 7) % 5));
        g.lineTo(WIN.x1, WIN.y1 + 2); g.lineTo(WIN.x0, WIN.y1 + 2); g.closePath(); g.fill();
      }
      // ---------------- room
      g.drawImage(this.room, -250, -150, this.room.vw, this.room.vh);
      // live room lights: blinking standby LEDs, monitor flicker in the rows
      paintRoomLive(g, L, eve, t);
      // hover glow for room objects
      if (this.hoverA.window > 0.01) { g.strokeStyle = `rgba(201,169,107,${0.35 * this.hoverA.window})`; g.lineWidth = 2; g.strokeRect(WIN.x0 + 4, WIN.y0 + 4, WIN.x1 - WIN.x0 - 8, WIN.y1 - WIN.y0 - 8); }
      if (this.hoverA.stairs > 0.01) G.glow(g, 1760, 300, 260, [255, 200, 140], 0.25 * this.hoverA.stairs);
      if (this.hoverA.board > 0.01) G.glow(g, 110, 440, 240, [255, 200, 140], 0.2 * this.hoverA.board);
      // Jonas at the window (backlit)
      if (this.jonas) {
        F.layer(D_JONAS);
        G.shadow(g, 1000, 664, 70, 9, 0.5);
        const hj = this.hoverA.jonas || 0;
        const tj = this.jonasTurn == null ? 0.75 : this.jonasTurn;
        F.people.draw(g, F.people.cast.jonas, 1000, 664, 356, {
          pose: 'coffee', turn: tj, expr: 'tired', lookX: tj > 0 ? 0.8 : -0.4,
          light: { key: [180, 195, 225], keyA: 0.22, dir: -1, amb: [40, 46, 60], rim: L.rim, rimA: 1.0 + hj * 0.4, rimSide: 1 },
        });
        G.steam(g, 1030, 432, t, 0.7, 0.7);
      }
      if (eve) {
        F.layer(D_JONAS);
        G.shadow(g, 330, 740, 90, 12, 0.5);
        F.people.draw(g, F.people.cast.jonas, 330, 740, 420, {
          pose: 'crossed', turn: 0.35, expr: 'tired', lookX: 0.5, slot: 'eve',
          light: { key: [255, 200, 150], keyA: 0.55, dir: 1, amb: [60, 50, 44], rim: [255, 190, 130], rimA: 0.7 + (this.hoverA.jonasEve || 0) * 0.5, rimSide: -1 },
        });
      }
      // ---------------- desk (foreground)
      const dy = (1 - this.sit) * 420;
      F.layer(D_DESK);
      g.save();
      g.translate(0, dy);
      g.drawImage(this.desk, -300, 560, this.desk.vw, this.desk.vh);
      this.drawDeskLive(g, t, L, eve);
      g.restore();
    },
    drawDeskLive(g, t, L, eve) {
      const h = this.hoverA;
      // desk lamp pool
      G.pool(g, 1520, 900, 420, 110, [255, 205, 150], 0.18 * L.lampA);
      // monitor screen
      const m = this.monitor;
      const scr = [[392, 462], [852, 470], [850, 734], [394, 742]];
      g.save();
      G.quad(g, scr);
      g.clip();
      g.fillStyle = '#050608'; g.fillRect(380, 450, 490, 300);
      if (m > 0) {
        g.globalAlpha = m;
        const sg = g.createLinearGradient(392, 462, 850, 742);
        sg.addColorStop(0, '#16202e'); sg.addColorStop(1, '#0b1018');
        g.fillStyle = sg; g.fillRect(380, 450, 490, 300);
        if (this.monitorText === 'login') {
          g.textAlign = 'center';
          g.fillStyle = 'rgba(216,184,120,0.9)';
          g.font = '500 17px "Cormorant Garamond", serif';
          g.fillText('A D L E R   W E N D T', 622, 560);
          g.fillStyle = 'rgba(240,236,228,0.92)';
          g.font = '300 54px "Cormorant Garamond", serif';
          g.fillText(F.state.time || '07:19', 622, 622);
          g.font = 'italic 400 20px "Cormorant Garamond", serif';
          g.fillStyle = 'rgba(240,236,228,0.6)';
          g.fillText('Guten Morgen.', 622, 654);
          if (F.state.unread) {
            g.font = '500 12px "Barlow Condensed", sans-serif';
            g.fillStyle = 'rgba(216,184,120,0.85)';
            g.fillText(`●  ${F.state.unread} NEW`, 622, 700);
          }
        } else {
          // a contract in a document editor, lines of text + redline marks
          g.fillStyle = '#e9e4da'; g.fillRect(470, 478, 300, 270);
          for (let i = 0; i < 16; i++) {
            g.fillStyle = i % 5 === 0 ? 'rgba(179,50,43,0.7)' : 'rgba(40,40,44,0.5)';
            g.fillRect(490, 500 + i * 14, 200 + ((i * 37) % 60), 3);
          }
          g.fillStyle = 'rgba(179,50,43,0.25)'; g.fillRect(488, 552, 250, 12);
        }
        g.globalAlpha = 1;
      }
      // screen glass reflection
      const rg = g.createLinearGradient(392, 462, 700, 742);
      rg.addColorStop(0, 'rgba(255,255,255,0.06)'); rg.addColorStop(0.5, 'rgba(255,255,255,0)');
      g.fillStyle = rg; g.fillRect(380, 450, 490, 300);
      g.restore();
      if (m > 0) {
        G.glow(g, 622, 610, 380, eve ? [140, 170, 220] : [120, 150, 200], 0.12 * m);
        // screen light spill on desk/keyboard
        G.pool(g, 622, 880, 360, 60, [130, 160, 210], 0.08 * m);
      }
      if (h.monitor > 0.01) { g.strokeStyle = `rgba(201,169,107,${0.6 * h.monitor})`; g.lineWidth = 2; G.quad(g, [[386, 456], [858, 464], [856, 740], [388, 748]]); g.stroke(); }
      // phone lying on the desk
      const bz = this.phoneBuzz > 0 ? Math.sin(t * 90) * 2.2 * Math.min(1, this.phoneBuzz) : 0;
      g.save();
      g.translate(bz, 0);
      const ph = [[1066, 906], [1132, 906], [1142, 988], [1058, 988]];
      G.shadow(g, 1100, 992, 64, 8, 0.55);
      G.quad(g, [[1062, 902], [1136, 902], [1147, 992], [1053, 992]], '#2a2c31');
      G.quad(g, ph, this.phoneLit > 0 ? '#0e1420' : '#08090b');
      if (this.phoneLit > 0) {
        g.globalAlpha = this.phoneLit;
        const pg = g.createLinearGradient(0, 896, 0, 1004);
        pg.addColorStop(0, '#1d2a3f'); pg.addColorStop(1, '#0e1522');
        G.quad(g, ph, pg);
        if (this.phoneText) {
          g.fillStyle = 'rgba(40,52,70,0.95)';
          G.quad(g, [[1070, 924], [1128, 924], [1132, 958], [1067, 958]], 'rgba(46,58,78,0.95)');
          g.fillStyle = '#fff'; g.font = '600 7px Inter, sans-serif'; g.textAlign = 'left';
          g.fillText(this.phoneText.who.split(' ')[0].toUpperCase(), 1073, 934);
          g.fillStyle = 'rgba(255,255,255,0.85)'; g.font = '400 6.5px Inter, sans-serif';
          const words = this.phoneText.text.split(' '), half = Math.ceil(words.length / 2);
          g.fillText(words.slice(0, half).join(' '), 1073, 944);
          g.fillText(words.slice(half).join(' '), 1073, 953);
        }
        g.globalAlpha = 1;
        G.glow(g, 1098, 950, 150, [120, 160, 230], 0.25 * this.phoneLit);
      }
      // glass reflection
      g.strokeStyle = 'rgba(255,255,255,0.12)'; g.lineWidth = 1;
      G.quad(g, ph); g.stroke();
      g.fillStyle = 'rgba(0,0,0,0.6)'; g.fillRect(1092, 909, 14, 2);
      g.restore();
      if (h.phone > 0.01) G.glow(g, 1098, 950, 120, [255, 210, 150], 0.25 * h.phone);
      // coffee steam
      G.steam(g, 952, 832, t, eve ? 0.2 : 0.9, 0.9);
      if (h.coffee > 0.01) G.glow(g, 952, 860, 70, [255, 210, 150], 0.25 * h.coffee);
      // case file highlight
      if (h.file > 0.01) { g.strokeStyle = `rgba(201,169,107,${0.7 * h.file})`; g.lineWidth = 2; G.quad(g, [[1232, 852], [1538, 852], [1598, 973], [1212, 973]]); g.stroke(); }
    },
    click(cx, cy) { F.clickHotspots(cx, cy); },
    exit() { F.grade.tintA = 0; },
  });

  // ------------------------------------------------------------------ room painter (static)
  function paintRoom(g, L, eve) {
    // ceiling
    const cg = g.createLinearGradient(0, -150, 0, WIN.y0);
    cg.addColorStop(0, L.ceil); cg.addColorStop(1, U.rgba(U.hex(L.ceil), 1));
    G.quad(g, [[-250, -150], [VW + 250, -150], [WIN.x1, WIN.y0], [WIN.x0, WIN.y0]], L.ceil);
    // ceiling panels grid in perspective
    g.strokeStyle = 'rgba(0,0,0,0.3)'; g.lineWidth = 1.2;
    for (let k = -8; k <= 8; k++) { g.beginPath(); g.moveTo(VP[0] + k * 90, WIN.y0); g.lineTo(VP[0] + k * 420, -150); g.stroke(); }
    [WIN.y0 - 14, WIN.y0 - 34, WIN.y0 - 64, WIN.y0 - 110, WIN.y0 - 180].forEach((y) => { g.beginPath(); g.moveTo(-250, y); g.lineTo(VW + 250, y); g.stroke(); });
    // recessed light panels (rows of trapezoids in perspective)
    const ceilY = (d) => WIN.y0 - (WIN.y0 + 150) * d; // d: 0 at far wall → 1 at camera
    [-1.25, 0, 1.25].forEach((k) => {
      for (let i = 0; i < 4; i++) {
        const d0 = 0.12 + i * 0.22, d1 = d0 + 0.08;
        const y0 = WIN.y0 - (WIN.y0 - (-150)) * d0, y1 = WIN.y0 - (WIN.y0 - (-150)) * d1;
        const sc0 = 1 + d0 * 3.2, sc1 = 1 + d1 * 3.2;
        const cx0 = VP[0] + k * 250 * sc0, cx1 = VP[0] + k * 250 * sc1;
        const hw0 = 40 * sc0, hw1 = 40 * sc1;
        G.quad(g, [[cx0 - hw0, y0], [cx0 + hw0, y0], [cx1 + hw1, y1], [cx1 - hw1, y1]], U.rgba(L.ceilLight, 0.35 + L.ceilA * 0.6));
        G.glow(g, (cx0 + cx1) / 2, (y0 + y1) / 2, 120 * sc0, L.ceilLight, 0.06 + L.ceilA * 0.05);
      }
    });
    // window frame/mullions (window area stays transparent)
    g.fillStyle = '#0b0c0e';
    g.fillRect(WIN.x0 - 14, WIN.y0 - 12, WIN.x1 - WIN.x0 + 28, 14);   // head
    g.fillRect(WIN.x0 - 14, WIN.y1 - 4, WIN.x1 - WIN.x0 + 28, 16);    // sill
    const panes = 10;
    for (let k = 0; k <= panes; k++) {
      const x = WIN.x0 + ((WIN.x1 - WIN.x0) * k) / panes;
      g.fillStyle = '#0a0b0d';
      g.fillRect(x - 5, WIN.y0, 10, WIN.y1 - WIN.y0);
      g.fillStyle = 'rgba(160,180,210,0.12)';
      g.fillRect(x - 5, WIN.y0, 1.5, WIN.y1 - WIN.y0);
    }
    // blinds half-raised on a few panes (visual storytelling / variety)
    [1, 2, 7].forEach((k) => {
      const x = WIN.x0 + ((WIN.x1 - WIN.x0) * k) / panes + 5, w = (WIN.x1 - WIN.x0) / panes - 10;
      const h = k === 7 ? 140 : 60;
      for (let y = 0; y < h; y += 7) { g.fillStyle = 'rgba(20,22,26,0.92)'; g.fillRect(x, WIN.y0 + y, w, 5); g.fillStyle = 'rgba(180,190,210,0.08)'; g.fillRect(x, WIN.y0 + y, w, 1); }
    });
    // left wall — glass meeting room with frosted band
    G.quad(g, [[-250, -150], [WIN.x0, WIN.y0], [WIN.x0, WIN.y1], [-250, VH + 150]], L.wall);
    // meeting-room glazing
    const mg = g.createLinearGradient(-250, 0, WIN.x0, 0);
    mg.addColorStop(0, eve ? 'rgba(255,200,140,0.10)' : 'rgba(170,190,220,0.08)'); mg.addColorStop(1, 'rgba(0,0,0,0.2)');
    G.quad(g, [[-40, 60], [WIN.x0 - 20, WIN.y0 + 40], [WIN.x0 - 20, WIN.y1 - 10], [-40, 820]], mg);
    if (eve) {
      // the project room is lit: the case board glows through the glass
      G.quad(g, [[-30, 90], [WIN.x0 - 26, WIN.y0 + 48], [WIN.x0 - 26, WIN.y1 - 14], [-30, 800]], 'rgba(255,190,120,0.16)');
      G.quad(g, [[-10, 200], [150, 232], [150, 470], [-10, 470]], 'rgba(70,48,30,0.85)');
      const pr = U.rng(71);
      for (let k = 0; k < 14; k++) { const x = -4 + pr() * 140, y = 214 + pr() * 230; g.fillStyle = pr() < 0.3 ? 'rgba(240,220,140,0.75)' : 'rgba(236,230,218,0.75)'; g.fillRect(x, y + (x + 10) * 0.2, 16, 12); }
      g.strokeStyle = 'rgba(200,40,40,0.8)'; g.lineWidth = 1.2;
      [[10, 240, 90, 330], [90, 330, 60, 420], [30, 260, 120, 280], [60, 420, 130, 360]].forEach(([a, b, c, d]) => { g.beginPath(); g.moveTo(a, b + (a + 10) * 0.2); g.quadraticCurveTo((a + c) / 2, (b + d) / 2 + 20, c, d + (c + 10) * 0.2); g.stroke(); });
      G.glow(g, 70, 260, 160, [255, 200, 140], 0.25);
    }
    // frosted band with firm pattern
    G.quad(g, [[-40, 360], [WIN.x0 - 20, 380], [WIN.x0 - 20, 420], [-40, 450]], 'rgba(220,225,235,0.12)');
    // meeting room interior hints: table, chairs, screen (dim)
    g.fillStyle = eve ? 'rgba(255,190,120,0.15)' : 'rgba(40,46,56,0.8)';
    G.quad(g, [[0, 560], [180, 590], [180, 620], [0, 610]], eve ? 'rgba(120,90,60,0.6)' : 'rgba(30,34,40,0.9)');
    G.quad(g, [[20, 220], [170, 250], [170, 330], [20, 320]], eve ? 'rgba(60,80,120,0.7)' : 'rgba(18,22,30,0.9)');
    // door frame
    g.strokeStyle = '#08090a'; g.lineWidth = 6;
    [[-40, 60, 820], [120, 132, 700]].forEach(([x, y0, y1]) => { g.beginPath(); g.moveTo(x, y0); g.lineTo(x, y1); g.stroke(); });
    // right side — corridor opening with floating staircase to 23
    G.quad(g, [[WIN.x1, WIN.y0], [VW + 250, -150], [VW + 250, VH + 150], [WIN.x1, WIN.y1]], U.rgba(U.mix(U.hex(L.wall), [0, 0, 0], 0.25), 1));
    // opening
    const og = g.createLinearGradient(0, -100, 0, 760);
    og.addColorStop(0, eve ? 'rgba(255,196,130,0.35)' : 'rgba(230,220,200,0.28)'); og.addColorStop(1, 'rgba(20,18,16,0.2)');
    G.quad(g, [[1600, 40], [VW + 250, -120], [VW + 250, 820], [1600, 710]], eve ? '#1d1712' : '#1a1a19');
    G.quad(g, [[1600, 40], [VW + 250, -120], [VW + 250, 820], [1600, 710]], og);
    // light from the partner floor above
    const lg = g.createRadialGradient(1800, -40, 0, 1800, -40, 520);
    lg.addColorStop(0, eve ? 'rgba(255,200,140,0.6)' : 'rgba(255,236,210,0.45)'); lg.addColorStop(1, 'rgba(255,220,180,0)');
    g.fillStyle = lg; g.fillRect(1600, -150, 400, 700);
    // cantilevered oak treads rising toward the partner floor, LED strip under each
    for (let k = 12; k >= 0; k--) {
      const tt = k / 13;
      const x = U.lerp(1650, 1900, tt), y = U.lerp(700, 70, tt);
      const tw = 150 - tt * 40, th = 16 - tt * 5, tdp = 14 - tt * 6;
      // tread top
      G.quad(g, [[x - tw, y - tdp], [x, y - tdp], [x + 10, y], [x - tw + 10, y]], eve ? '#6b4f33' : '#5b4630');
      // tread front face
      const fg2 = g.createLinearGradient(0, y, 0, y + th);
      fg2.addColorStop(0, eve ? '#4a3522' : '#3e2f21'); fg2.addColorStop(1, '#1f170f');
      g.fillStyle = fg2; g.fillRect(x - tw + 10, y, tw, th);
      g.fillStyle = eve ? 'rgba(255,220,170,0.5)' : 'rgba(255,240,215,0.35)'; g.fillRect(x - tw, y - tdp, tw, 1.2);
      // LED under-glow
      G.glow(g, x - tw / 2 + 10, y + th + 4, 60, [255, 200, 140], eve ? 0.22 : 0.14);
    }
    // wall behind the stair gets the up-light wash
    const wash = g.createLinearGradient(1640, 700, 1900, 60);
    wash.addColorStop(0, 'rgba(255,200,140,0.0)'); wash.addColorStop(1, eve ? 'rgba(255,200,140,0.16)' : 'rgba(255,236,210,0.12)');
    g.fillStyle = wash; g.fillRect(1600, -150, 400, 900);
    // glass balustrade with steel cap rail
    g.fillStyle = 'rgba(180,200,230,0.07)';
    g.beginPath(); g.moveTo(1560, 720); g.lineTo(1560, 610); g.lineTo(1830, -40); g.lineTo(1830, 40); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(210,220,235,0.45)'; g.lineWidth = 3;
    g.beginPath(); g.moveTo(1560, 610); g.lineTo(1830, -40); g.stroke();
    g.strokeStyle = 'rgba(210,220,235,0.12)'; g.lineWidth = 1;
    g.beginPath(); g.moveTo(1560, 720); g.lineTo(1830, 40); g.stroke();
    // sign
    g.fillStyle = 'rgba(216,184,120,0.9)'; g.font = '600 15px "Barlow Condensed", sans-serif'; g.textAlign = 'left';
    g.fillText('10 · PARTNER', 1636, 560);
    g.fillStyle = 'rgba(216,184,120,0.5)'; g.fillRect(1636, 568, 70, 1);
    // floor: carpet
    const fg = g.createLinearGradient(0, WIN.y1, 0, VH + 150);
    fg.addColorStop(0, L.floor[0]); fg.addColorStop(1, L.floor[1]);
    G.quad(g, [[WIN.x0, WIN.y1], [WIN.x1, WIN.y1], [VW + 250, VH + 150], [-250, VH + 150]], fg);
    G.speckle(g, -250, WIN.y1, VW + 500, 600, 9000, [255, 255, 255], 0.01, 0.04, 17, 1.4);
    // window light spilling on the floor
    const spill = g.createLinearGradient(0, WIN.y1, 0, WIN.y1 + 260);
    spill.addColorStop(0, eve ? 'rgba(90,110,160,0.10)' : 'rgba(170,190,220,0.16)'); spill.addColorStop(1, 'rgba(170,190,220,0)');
    G.quad(g, [[WIN.x0, WIN.y1], [WIN.x1, WIN.y1], [WIN.x1 + 300, WIN.y1 + 260], [WIN.x0 - 300, WIN.y1 + 260]], spill);
    // workstations: two rows in perspective
    paintWorkstations(g, L, eve);
    // left wall painting (abstract, dark)
    G.quad(g, [[-220, 260], [-80, 250], [-80, 520], [-220, 560]], '#14161a');
  }

  // perspective scale: px per metre at floor line y (far wall floor = 640, horizon = VP.y)
  const PPM = (y) => (177 * (y - VP[1])) / (WIN.y1 - VP[1]);
  function paintWorkstations(g, L, eve) {
    const r = U.rng(eve ? 5 : 4);
    // desk units: [centre x at far wall, floor y]
    const units = [[330, 650], [1470, 650]];
    units.sort((a, b) => a[1] - b[1]);
    units.forEach(([x0, fy]) => {
      const m = PPM(fy);
      const cx = VP[0] + (x0 - VP[0]) * (m / 177);
      const w = 1.5 * m, depth = 0.16 * m, top = fy - 0.74 * m;
      // legs
      g.fillStyle = '#0b0c0e';
      g.fillRect(cx - w / 2 + 4, top, 5, fy - top); g.fillRect(cx + w / 2 - 9, top, 5, fy - top);
      // modesty panel
      G.quad(g, [[cx - w / 2 + 4, top + depth * 0.6], [cx + w / 2 - 4, top + depth * 0.6], [cx + w / 2 - 4, top + 0.42 * m], [cx - w / 2 + 4, top + 0.42 * m]], eve ? '#1a1511' : '#15171b');
      // desk top slab (seen slightly from above)
      G.quad(g, [[cx - w / 2 + 6, top - depth], [cx + w / 2 - 6, top - depth], [cx + w / 2, top], [cx - w / 2, top]], eve ? '#2d241b' : '#262a31');
      g.fillStyle = '#0e0f12'; g.fillRect(cx - w / 2, top, w, 0.03 * m);
      g.fillStyle = eve ? 'rgba(255,210,160,0.12)' : 'rgba(200,215,240,0.1)'; g.fillRect(cx - w / 2 + 6, top - depth, w - 12, 1.2);
      // privacy screen between desk pairs
      g.fillStyle = eve ? 'rgba(40,34,30,0.9)' : 'rgba(34,38,46,0.92)';
      g.fillRect(cx - w / 2 + 6, top - depth - 0.3 * m, w - 12, 0.3 * m);
      // monitors
      const lit = r() < (eve ? 0.45 : 0.25);
      [-0.22, 0.22].forEach((o, k) => {
        const mw = 0.55 * m, mh = 0.33 * m, mx = cx + o * w;
        g.fillStyle = '#07080a';
        g.fillRect(mx - mw / 2, top - depth - 0.12 * m - mh, mw, mh);
        g.fillRect(mx - 2, top - depth - 0.12 * m, 4, 0.12 * m);
        if (lit && k === 0) {
          g.fillStyle = eve ? 'rgba(150,180,230,0.6)' : 'rgba(120,150,200,0.4)';
          g.fillRect(mx - mw / 2 + 2, top - depth - 0.12 * m - mh + 2, mw - 4, mh - 4);
          G.glow(g, mx, top - depth - 0.12 * m - mh / 2, mw * 1.3, [130, 160, 220], 0.18);
        }
      });
      // chair backs (in front of desk, toward camera)
      [-0.25, 0.25].forEach((o) => {
        const chx = cx + o * w, chy = fy + 0.18 * m;
        g.fillStyle = '#0a0b0d';
        G.roundRect(g, chx - 0.22 * m, chy - 0.95 * m, 0.44 * m, 0.55 * m, 0.08 * m); g.fill();
        g.fillStyle = 'rgba(160,175,200,0.08)'; g.fillRect(chx - 0.2 * m, chy - 0.95 * m, 0.4 * m, 1.5);
        g.fillRect(chx - 2, chy - 0.4 * m, 4, 0.3 * m);
        if (eve && r() < 0.45) {
          // jacket slung over the chair
          g.fillStyle = '#1c1d24';
          g.beginPath(); g.moveTo(chx - 0.24 * m, chy - 0.96 * m); g.lineTo(chx + 0.25 * m, chy - 0.94 * m); g.lineTo(chx + 0.2 * m, chy - 0.3 * m); g.lineTo(chx - 0.18 * m, chy - 0.28 * m); g.closePath(); g.fill();
        }
      });
      // clutter
      const papers = eve ? 3 : 1;
      for (let k = 0; k < papers; k++) { g.fillStyle = 'rgba(230,226,215,0.55)'; g.fillRect(cx - w * 0.4 + r() * w * 0.6, top - depth * 0.7, 0.2 * m, 0.08 * m); }
      if (eve) { g.fillStyle = 'rgba(240,238,230,0.6)'; g.fillRect(cx + w * 0.35, top - depth - 0.1 * m, 0.07 * m, 0.1 * m); }
      if (eve && r() < 0.6) { G.pool(g, cx + w * 0.3, top - depth * 0.5, 0.5 * m, 0.08 * m, [255, 200, 140], 0.3); G.glow(g, cx + w * 0.34, top - depth - 0.35 * m, 0.14 * m, [255, 210, 150], 0.7); }
    });
    // tall plants in planters
    [[150, 690]].forEach(([x, fy]) => {
      const m = PPM(fy);
      g.fillStyle = '#121110'; g.fillRect(x - 0.22 * m, fy - 0.5 * m, 0.44 * m, 0.5 * m);
      g.fillStyle = 'rgba(255,255,255,0.05)'; g.fillRect(x - 0.22 * m, fy - 0.5 * m, 0.44 * m, 1.5);
      g.fillStyle = '#0e1411';
      for (let k = 0; k < 11; k++) { g.beginPath(); g.ellipse(x + (k - 5) * 0.06 * m, fy - 0.9 * m - (k % 3) * 0.18 * m, 0.08 * m, 0.34 * m, (k - 5) * 0.22, 0, U.TAU); g.fill(); }
    });
  }

  function paintReflections(g, L, eve, t) {
    // soft reflections of interior practicals on the glass (stronger at night)
    g.save();
    g.globalCompositeOperation = 'lighter';
    [[520, 150], [900, 150], [1280, 150]].forEach(([x, y]) => G.glow(g, x, y + 30, 160, L.ceilLight, L.reflA * 0.9));
    G.glow(g, 1450, 560, 90, [255, 200, 140], L.reflA * 2.2);
    G.glow(g, 620, 590, 160, [130, 160, 220], L.reflA * 1.6);
    if (eve) { for (let k = 0; k < 6; k++) G.glow(g, 330 + k * 230, 520, 60, [255, 200, 140], 0.08); }
    g.restore();
  }

  function paintRoomLive(g, L, eve, t) {
    // small standby LEDs, distant screens breathing
    const led = 0.5 + 0.5 * Math.sin(t * 2);
    G.glow(g, 172, 300, 10, [80, 255, 140], 0.4 * led);
    G.glow(g, 1478, 606, 6, [255, 80, 60], 0.5);
  }

  // ------------------------------------------------------------------ desk painter (static foreground)
  function paintDesk(g, L, eve, S) {
    const y0 = 800 - 560; // desk top edge in canvas coords (layer y 800)
    // desk surface (dark walnut) with perspective sheen
    const dg = g.createLinearGradient(0, y0, 0, 520);
    dg.addColorStop(0, L.desk[0]); dg.addColorStop(1, L.desk[1]);
    G.quad(g, [[-300, y0 + 20], [VW + 300, y0 + 20], [VW + 300, 520], [-300, 520]], dg);
    // top edge highlight (window reflection)
    g.fillStyle = eve ? 'rgba(255,210,160,0.16)' : 'rgba(190,210,240,0.2)';
    g.fillRect(-300, y0 + 20, VW + 600, 2);
    // wood grain
    const r = U.rng(3);
    g.strokeStyle = 'rgba(0,0,0,0.18)'; g.lineWidth = 1;
    for (let i = 0; i < 60; i++) { const y = y0 + 30 + r() * 480; g.beginPath(); g.moveTo(-300, y); g.bezierCurveTo(400, y + r() * 8 - 4, 1200, y + r() * 8 - 4, VW + 300, y + r() * 6 - 3); g.stroke(); }
    // reflection of the window on the desk surface
    const wr = g.createLinearGradient(0, y0 + 22, 0, y0 + 200);
    wr.addColorStop(0, eve ? 'rgba(80,100,140,0.08)' : 'rgba(160,180,210,0.12)'); wr.addColorStop(1, 'rgba(160,180,210,0)');
    g.fillStyle = wr; g.fillRect(230, y0 + 22, 1340, 180);
    // leather desk pad
    G.quad(g, [[330, y0 + 60], [1000, y0 + 60], [1030, y0 + 250], [300, y0 + 250]], '#0e0f11');
    g.strokeStyle = 'rgba(255,255,255,0.05)'; g.lineWidth = 1.5; G.quad(g, [[336, y0 + 66], [994, y0 + 66], [1023, y0 + 244], [306, y0 + 244]]); g.stroke();
    // monitor (stand + bezel), screen drawn live
    // (bezel in layer coordinates offset by -560)
    const o = -560;
    G.quad(g, [[382, 452 + o], [862, 460 + o], [860, 752 + o], [384, 760 + o]], '#08090b');
    g.fillStyle = 'rgba(255,255,255,0.08)'; g.fillRect(382, 452 + o, 480, 1.5);
    g.fillStyle = '#121316';
    G.quad(g, [[600, 760 + o], [650, 758 + o], [660, 820 + o], [590, 822 + o]], '#101114');
    G.quad(g, [[540, 818 + o], [710, 816 + o], [730, 836 + o], [520, 838 + o]], '#16171a');
    G.shadow(g, 625, 840 + o, 140, 14, 0.5);
    // keyboard + mouse
    G.quad(g, [[470, 858 + o], [800, 856 + o], [812, 900 + o], [458, 902 + o]], '#1b1c20');
    g.fillStyle = 'rgba(255,255,255,0.05)';
    for (let rr = 0; rr < 4; rr++) for (let k = 0; k < 18; k++) g.fillRect(476 + k * 18 + rr * 1.5, 862 + rr * 9 + o, 14, 6);
    g.fillStyle = '#1b1c20'; G.roundRect(g, 850, 868 + o, 34, 50, 16); g.fill();
    // notepad & pen
    G.quad(g, [[160, 900 + o], [330, 896 + o], [352, 1000 + o], [150, 1006 + o]], '#e6e0d3');
    g.strokeStyle = 'rgba(120,130,160,0.35)'; g.lineWidth = 1;
    for (let k = 0; k < 7; k++) { g.beginPath(); g.moveTo(165, 918 + k * 12 + o); g.lineTo(336 + k * 2, 914 + k * 12 + o); g.stroke(); }
    g.strokeStyle = 'rgba(30,40,70,0.7)'; g.lineWidth = 1.4;
    g.beginPath(); g.moveTo(178, 930 + o); g.bezierCurveTo(200, 922 + o, 220, 936 + o, 250, 926 + o); g.stroke();
    g.beginPath(); g.moveTo(178, 954 + o); g.bezierCurveTo(210, 948 + o, 240, 958 + o, 290, 950 + o); g.stroke();
    g.fillStyle = '#b8955a'; g.save(); g.translate(300, 960 + o); g.rotate(-0.5); g.fillRect(-60, -3, 120, 6); g.restore();
    // coffee cup (ceramic, white)
    G.shadow(g, 955, 905 + o, 55, 10, 0.5);
    const cup = g.createLinearGradient(920, 0, 990, 0);
    cup.addColorStop(0, '#f2efe8'); cup.addColorStop(0.6, '#d8d3c9'); cup.addColorStop(1, '#8e8a83');
    g.fillStyle = cup;
    g.beginPath(); g.moveTo(918, 842 + o); g.lineTo(988, 842 + o); g.lineTo(982, 898 + o); g.quadraticCurveTo(953, 910 + o, 924, 898 + o); g.closePath(); g.fill();
    g.strokeStyle = '#cfc9be'; g.lineWidth = 6; g.beginPath(); g.arc(992, 866 + o, 13, -1.2, 1.2); g.stroke();
    g.fillStyle = '#2a1a10'; g.beginPath(); g.ellipse(953, 843 + o, 35, 7, 0, 0, U.TAU); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.4)'; g.beginPath(); g.ellipse(940, 842 + o, 10, 2, 0, 0, U.TAU); g.fill();
    // case file folder (manila/oxblood), sealed
    const fo = [[1232, 852 + o], [1538, 852 + o], [1598, 973 + o], [1212, 973 + o]];
    G.shadow(g, 1405, 980 + o, 210, 18, 0.55);
    G.quad(g, fo, '#5e2a22');
    const fsh = g.createLinearGradient(0, 852 + o, 0, 973 + o);
    fsh.addColorStop(0, 'rgba(255,220,180,0.12)'); fsh.addColorStop(1, 'rgba(0,0,0,0.25)');
    G.quad(g, fo, fsh);
    // pages edge
    g.fillStyle = '#e8e2d4'; G.quad(g, [[1214, 973 + o], [1598, 973 + o], [1600, 979 + o], [1212, 979 + o]], '#e8e2d4');
    // label + stamp
    G.quad(g, [[1280, 872 + o], [1420, 872 + o], [1428, 900 + o], [1276, 900 + o]], '#efe8d8');
    g.fillStyle = '#2a2320'; g.font = '600 14px "Barlow Condensed", sans-serif'; g.textAlign = 'left';
    g.fillText(({ 2: 'SILFORM ./. V&K', 3: 'SILFORM · HALA 2' })[S.chapter] || 'PROJEKT  CARBO', 1290, 892 + o);
    g.save(); g.translate(1470, 930 + o); g.rotate(-0.12);
    g.strokeStyle = 'rgba(200,60,50,0.85)'; g.lineWidth = 2; g.strokeRect(-64, -16, 128, 30);
    g.fillStyle = 'rgba(200,60,50,0.85)'; g.font = '700 12px "Barlow Condensed", sans-serif'; g.textAlign = 'center';
    g.fillText('ŚCIŚLE POUFNE', 0, 4);
    g.restore();
    // desk lamp (right)
    g.fillStyle = '#0d0e10';
    G.quad(g, [[1650, 900 + o], [1760, 898 + o], [1770, 918 + o], [1640, 920 + o]], '#101114');
    g.strokeStyle = '#141518'; g.lineWidth = 8; g.lineCap = 'round';
    g.beginPath(); g.moveTo(1705, 900 + o); g.lineTo(1740, 720 + o); g.lineTo(1610, 640 + o); g.stroke();
    // lamp head
    g.fillStyle = '#16171a';
    g.beginPath(); g.moveTo(1560, 626 + o); g.lineTo(1640, 626 + o); g.lineTo(1660, 670 + o); g.lineTo(1540, 670 + o); g.closePath(); g.fill();
    G.glow(g, 1600, 672 + o, 90, [255, 214, 160], 0.7 * L.lampA);
    const beam = g.createLinearGradient(0, 670 + o, 0, 920 + o);
    beam.addColorStop(0, `rgba(255,214,160,${0.14 * L.lampA})`); beam.addColorStop(1, 'rgba(255,214,160,0)');
    g.fillStyle = beam;
    g.beginPath(); g.moveTo(1545, 670 + o); g.lineTo(1655, 670 + o); g.lineTo(1790, 930 + o); g.lineTo(1380, 930 + o); g.closePath(); g.fill();
    // evening: second cup, papers spread, reading glasses, takeaway box
    if (eve) {
      [[820, 930], [880, 960]].forEach(([x, y], i) => { g.save(); g.translate(x, y + o); g.rotate(-0.1 + i * 0.15); g.fillStyle = '#ece6d8'; g.fillRect(-90, -60, 180, 120); g.fillStyle = 'rgba(60,60,66,0.35)'; for (let k = 0; k < 9; k++) g.fillRect(-76, -46 + k * 11, 120 + (k % 3) * 10, 2.5); g.fillStyle = 'rgba(179,50,43,0.6)'; g.fillRect(-76, -2, 90, 2.5); g.restore(); });
      g.fillStyle = '#d9d4ca'; g.beginPath(); g.moveTo(1080, 842 + o); g.lineTo(1122, 842 + o); g.lineTo(1118, 884 + o); g.lineTo(1084, 884 + o); g.closePath(); g.fill();
      g.fillStyle = '#6b4a2b'; g.fillRect(1082, 850 + o, 38, 12);
      g.fillStyle = '#2c2a26'; G.quad(g, [[1700, 960 + o], [1840, 956 + o], [1860, 1020 + o], [1690, 1026 + o]], '#2c2a26');
    }
    // nameplate / business cards holder
    G.quad(g, [[40, 860 + o], [150, 858 + o], [156, 880 + o], [34, 882 + o]], '#b8955a');
    g.fillStyle = 'rgba(0,0,0,0.6)'; g.font = '600 9px "Barlow Condensed", sans-serif'; g.textAlign = 'center'; g.fillText(S.chapter >= 3 ? 'EMPL · 9.14' : 'M&A · 9.14', 95, 874 + o);
    // succulent
    g.fillStyle = '#1a1a1c'; g.fillRect(40, 800 + o, 60, 50);
    g.fillStyle = '#2d3b2c';
    for (let k = 0; k < 7; k++) { g.beginPath(); g.ellipse(70 + (k - 3) * 8, 796 + o - (k % 2) * 8, 7, 18, (k - 3) * 0.35, 0, U.TAU); g.fill(); }
  }

  F.office = { WIN, D_DESK, D_ROOM };
})(window.F);
