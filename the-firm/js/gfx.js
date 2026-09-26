/* THE FIRM — graphics library: sky, clouds, skylines, rain, glass droplets, glows, post */
(function (F) {
  'use strict';
  const U = F.U;
  const G = {};
  F.gfx = G;

  // ------------------------------------------------------------------ glow sprites
  const glowCache = {};
  G.glowSprite = (col) => {
    const key = col.join(',');
    if (glowCache[key]) return glowCache[key];
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const g = c.getContext('2d');
    const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, U.rgba(col, 1));
    gr.addColorStop(0.18, U.rgba(col, 0.55));
    gr.addColorStop(0.45, U.rgba(col, 0.14));
    gr.addColorStop(1, U.rgba(col, 0));
    g.fillStyle = gr;
    g.fillRect(0, 0, 128, 128);
    glowCache[key] = c;
    return c;
  };
  G.glow = (g, x, y, r, col, a) => {
    const s = G.glowSprite(col);
    const pa = g.globalAlpha, pc = g.globalCompositeOperation;
    g.globalCompositeOperation = 'lighter';
    g.globalAlpha = a == null ? 1 : a;
    g.drawImage(s, x - r, y - r, r * 2, r * 2);
    g.globalAlpha = pa;
    g.globalCompositeOperation = pc;
  };
  // elliptical light pool (e.g. lamp on desk)
  G.pool = (g, x, y, rx, ry, col, a) => {
    g.save();
    g.translate(x, y);
    g.scale(1, ry / rx);
    const gr = g.createRadialGradient(0, 0, 0, 0, 0, rx);
    gr.addColorStop(0, U.rgba(col, a));
    gr.addColorStop(0.5, U.rgba(col, a * 0.35));
    gr.addColorStop(1, U.rgba(col, 0));
    g.globalCompositeOperation = 'lighter';
    g.fillStyle = gr;
    g.beginPath();
    g.arc(0, 0, rx, 0, U.TAU);
    g.fill();
    g.restore();
  };

  G.vgrad = (g, x0, y0, x1, y1, stops) => {
    const gr = g.createLinearGradient(x0, y0, x1, y1);
    stops.forEach((s) => gr.addColorStop(s[0], typeof s[1] === 'string' ? s[1] : U.rgba(s[1], s[2] == null ? 1 : s[2])));
    return gr;
  };

  // ------------------------------------------------------------------ noise textures
  G.noiseCanvas = (w, h, seed, alpha, mono) => {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const g = c.getContext('2d');
    const id = g.createImageData(w, h);
    const r = U.rng(seed);
    for (let i = 0; i < id.data.length; i += 4) {
      const v = (r() * 255) | 0;
      id.data[i] = v; id.data[i + 1] = mono ? v : (r() * 255) | 0; id.data[i + 2] = mono ? v : (r() * 255) | 0;
      id.data[i + 3] = alpha;
    }
    g.putImageData(id, 0, 0);
    return c;
  };

  // fine surface texture (carpet, wood, concrete) drawn into g within rect
  G.speckle = (g, x, y, w, h, n, col, amin, amax, seed, size) => {
    const r = U.rng(seed || 1);
    size = size || 1.2;
    for (let i = 0; i < n; i++) {
      g.fillStyle = U.rgba(col, amin + r() * (amax - amin));
      g.fillRect(x + r() * w, y + r() * h, size * (0.5 + r()), size * (0.5 + r()));
    }
  };

  // ------------------------------------------------------------------ clouds
  // soft cloud band texture, tileable horizontally
  G.cloudTexture = (w, h, seed, opts) => {
    opts = opts || {};
    const q = 0.5;
    return F.offscreen(w, h, q, (g) => {
      const r = U.rng(seed);
      const n = opts.n || 220;
      for (let i = 0; i < n; i++) {
        const x = r() * w, y = h * (0.15 + Math.pow(r(), 1.4) * 0.8);
        const rad = (opts.rmin || 60) + r() * (opts.rmax || 220);
        const a = (opts.a || 0.12) * (0.3 + r() * 0.7);
        const col = opts.col || [255, 255, 255];
        for (const ox of [-w, 0, w]) {
          const gr = g.createRadialGradient(x + ox, y, 0, x + ox, y, rad);
          gr.addColorStop(0, U.rgba(col, a));
          gr.addColorStop(1, U.rgba(col, 0));
          g.fillStyle = gr;
          g.save();
          g.translate(x + ox, y);
          g.scale(1.9, 0.55);
          g.translate(-(x + ox), -y);
          g.beginPath();
          g.arc(x + ox, y, rad, 0, U.TAU);
          g.fill();
          g.restore();
        }
      }
      g.globalCompositeOperation = 'destination-in';
      const fade = g.createLinearGradient(0, 0, 0, h);
      fade.addColorStop(0, 'rgba(0,0,0,0)'); fade.addColorStop(0.25, 'rgba(0,0,0,1)'); fade.addColorStop(0.75, 'rgba(0,0,0,1)'); fade.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = fade; g.fillRect(0, 0, w, h);
      g.globalCompositeOperation = 'source-over';
    });
  };
  G.drawClouds = (g, tex, x, y, w, h, scroll, alpha, comp) => {
    const s = ((scroll % w) + w) % w;
    g.save();
    g.globalAlpha = alpha;
    if (comp) g.globalCompositeOperation = comp;
    g.drawImage(tex, x - s, y, w, h);
    g.drawImage(tex, x - s + w, y, w, h);
    g.restore();
  };

  // ------------------------------------------------------------------ skylines
  // Buildings are drawn as flat silhouettes with lit windows and atmospheric fade.
  function windowGrid(g, r, x, y, w, h, o) {
    const cw = o.cw || 7, ch = o.ch || 9, gx = o.gx || 4, gy = o.gy || 5;
    const cols = Math.floor((w - gx) / (cw + gx));
    const rows = Math.floor((h - gy) / (ch + gy));
    if (cols < 1 || rows < 1) return;
    const offx = x + (w - cols * (cw + gx) + gx) / 2;
    // some buildings are office towers: lit by whole floors
    const floorMode = o.floorMode;
    for (let j = 0; j < rows; j++) {
      const floorLit = floorMode && r() < o.lit;
      for (let i = 0; i < cols; i++) {
        let lit = floorMode ? floorLit && r() < 0.85 : r() < o.lit;
        if (!lit) {
          if (o.dark) { g.fillStyle = o.dark; g.fillRect(offx + i * (cw + gx), y + gy + j * (ch + gy), cw, ch); }
          continue;
        }
        const warm = r() < (o.warmth == null ? 0.7 : o.warmth);
        const c = warm ? o.warm || [255, 196, 120] : o.cool || [190, 215, 255];
        const a = (o.wa || 0.8) * (0.45 + r() * 0.55);
        g.fillStyle = U.rgba(c, a);
        g.fillRect(offx + i * (cw + gx), y + gy + j * (ch + gy), cw, ch);
      }
    }
  }
  G.windowGrid = windowGrid;

  function fadeOver(g, x, y, w, h, fog, a) {
    if (a <= 0) return;
    g.fillStyle = U.rgba(fog, a);
    g.fillRect(x, y, w, h);
  }

  // generic city skyline layer; returns {canvas, lights}
  G.skyline = (o) => {
    const W = o.w, H = o.h, base = o.base; // base = y of ground line within layer
    const r = U.rng(o.seed || 7);
    const lights = [];
    const q = o.q || F.quality() * 0.9;
    const cnv = F.offscreen(W, H, q, (g) => {
      const body = o.body; // building color
      const edge = o.edge || null; // sky rim color on tops
      const winO = Object.assign({ lit: 0.25 }, o.win || {});
      const list = [];
      // procedural filler blocks
      let x = -40;
      while (x < W + 40) {
        const bw = o.minW + r() * (o.maxW - o.minW);
        const bh = o.minH + Math.pow(r(), o.pow || 1.6) * (o.maxH - o.minH);
        list.push({ x, w: bw, h: bh, kind: 'block', roof: r() });
        x += bw + (r() < 0.3 ? r() * o.gap : 0);
      }
      // landmarks
      (o.landmarks || []).forEach((l) => list.push(l));
      list.sort((a, b) => (a.z || 0) - (b.z || 0));
      list.forEach((b) => {
        const top = base - b.h;
        g.fillStyle = b.col || body;
        if (b.kind === 'block') {
          g.fillRect(b.x, top, b.w, b.h + 2);
          // roofs: pitched (European) or flat with plant
          if (o.pitched && b.roof < o.pitched) {
            g.beginPath();
            const rh = Math.min(18, b.w * 0.25) * (0.6 + b.roof);
            if (b.roof < o.pitched * 0.5) {
              g.moveTo(b.x, top); g.lineTo(b.x + b.w * 0.15, top - rh); g.lineTo(b.x + b.w * 0.85, top - rh); g.lineTo(b.x + b.w, top);
            } else {
              g.moveTo(b.x, top); g.lineTo(b.x + b.w / 2, top - rh * 1.2); g.lineTo(b.x + b.w, top);
            }
            g.fill();
          } else if (b.roof > 0.85) {
            g.fillRect(b.x + b.w * 0.3, top - 6, b.w * 0.25, 6);
          }
          windowGrid(g, r, b.x + 2, top + 3, b.w - 4, b.h - 6, Object.assign({}, winO, { floorMode: b.h > o.maxH * 0.6 && r() < 0.6 }));
          if (edge) { g.fillStyle = edge; g.fillRect(b.x, top, b.w, 1.2); }
        } else if (b.draw) {
          b.draw(g, base, r, winO, lights);
        }
      });
      if (o.fog) {
        // vertical fog gradient: stronger toward ground
        const gr = g.createLinearGradient(0, base - o.maxH * 1.6, 0, base);
        gr.addColorStop(0, U.rgba(o.fog, o.fogTop || 0));
        gr.addColorStop(1, U.rgba(o.fog, o.fogBottom || 0.5));
        g.globalCompositeOperation = 'source-atop';
        g.fillStyle = gr;
        g.fillRect(0, 0, W, H);
        g.globalCompositeOperation = 'source-over';
      }
      if (o.groundGlow) {
        const gr = g.createLinearGradient(0, base - 120, 0, base + 10);
        gr.addColorStop(0, U.rgba(o.groundGlow, 0));
        gr.addColorStop(1, U.rgba(o.groundGlow, o.groundGlowA || 0.35));
        g.globalCompositeOperation = 'lighter';
        g.fillStyle = gr;
        g.fillRect(0, base - 120, W, 130);
        g.globalCompositeOperation = 'source-over';
      }
      if (o.below) { g.fillStyle = o.below; g.fillRect(0, base, W, H - base); }
    });
    return { canvas: cnv, lights };
  };

  // ---------- landmark painters (original stylisations) ----------
  // tower helper with windows
  function towerRect(g, x, top, w, h, col, win, r, floorMode) {
    g.fillStyle = col;
    g.fillRect(x, top, w, h);
    windowGrid(g, r, x + 2, top + 4, w - 4, h - 8, Object.assign({}, win, { floorMode }));
  }
  G.lm = {
    // twin brick towers with onion domes — a Munich cathedral cue
    twinDomes(x, h, col, s) {
      s = s || 1;
      return { z: 5, kind: 'lm', draw(g, base) {
        g.fillStyle = col;
        const nave = 120 * s;
        g.fillRect(x - 10 * s, base - 70 * s, nave, 70 * s);
        g.beginPath(); g.moveTo(x - 10 * s, base - 70 * s); g.lineTo(x + nave / 2 - 10 * s, base - 110 * s); g.lineTo(x + nave - 10 * s, base - 70 * s); g.fill();
        [x, x + 62 * s].forEach((tx) => {
          const tw = 36 * s, th = h * s;
          g.fillRect(tx, base - th, tw, th);
          // onion dome
          const cx = tx + tw / 2, cy = base - th;
          g.beginPath();
          g.moveTo(tx - 1, cy);
          g.bezierCurveTo(tx - 6 * s, cy - 16 * s, cx - 10 * s, cy - 20 * s, cx - 3 * s, cy - 34 * s);
          g.lineTo(cx, cy - 46 * s);
          g.lineTo(cx + 3 * s, cy - 34 * s);
          g.bezierCurveTo(cx + 10 * s, cy - 20 * s, tx + tw + 6 * s, cy - 16 * s, tx + tw + 1, cy);
          g.fill();
          // clock/louvre windows faint
          g.fillStyle = 'rgba(255,190,120,0.35)';
          g.fillRect(cx - 3 * s, cy + 26 * s, 6 * s, 12 * s);
          g.fillStyle = col;
        });
      } };
    },
    // tall concrete TV mast with observation pod
    tvTower(x, h, col, s, lights) {
      s = s || 1;
      return { z: 1, kind: 'lm', draw(g, base) {
        g.fillStyle = col;
        g.beginPath();
        g.moveTo(x - 9 * s, base); g.lineTo(x - 4 * s, base - h * 0.78); g.lineTo(x + 4 * s, base - h * 0.78); g.lineTo(x + 9 * s, base); g.fill();
        // pod
        const py = base - h * 0.8;
        g.beginPath(); g.ellipse(x, py, 22 * s, 7 * s, 0, 0, U.TAU); g.fill();
        g.fillRect(x - 18 * s, py - 14 * s, 36 * s, 10 * s);
        g.beginPath(); g.ellipse(x, py - 14 * s, 18 * s, 5 * s, 0, 0, U.TAU); g.fill();
        g.fillStyle = 'rgba(255,210,150,0.5)';
        g.fillRect(x - 17 * s, py - 10 * s, 34 * s, 2 * s);
        g.fillStyle = col;
        g.fillRect(x - 1.5 * s, base - h, 3 * s, h * 0.2);
        if (lights) lights.push({ x, y: base - h, r: 10 * s, col: [255, 40, 30], blink: 1.3, ph: 0.2 });
      } };
    },
    // Munich-style twin glass slabs joined by bridges
    twinSlabs(x, h, col, win, s, lights) {
      s = s || 1;
      return { z: 3, kind: 'lm', draw(g, base, r) {
        const w = 34 * s;
        towerRect(g, x, base - h, w, h, col, win, r, true);
        towerRect(g, x + w + 16 * s, base - h * 0.84, w, h * 0.84, col, win, r, true);
        g.fillStyle = col;
        for (let k = 0; k < 3; k++) g.fillRect(x + w, base - h * (0.3 + k * 0.2), 16 * s, 5 * s);
        if (lights) { lights.push({ x: x + w / 2, y: base - h - 3, r: 7 * s, col: [255, 40, 30], blink: 1.7, ph: 0.6 }); }
      } };
    },
    cylinderTower(x, h, col, win, s, lights) {
      s = s || 1;
      return { z: 3, kind: 'lm', draw(g, base, r) {
        const w = 44 * s;
        towerRect(g, x, base - h, w, h, col, win, r, true);
        const gr = g.createLinearGradient(x, 0, x + w, 0);
        gr.addColorStop(0, 'rgba(0,0,0,0.35)'); gr.addColorStop(0.45, 'rgba(255,255,255,0.05)'); gr.addColorStop(1, 'rgba(0,0,0,0.45)');
        g.fillStyle = gr; g.fillRect(x, base - h, w, h);
        if (lights) lights.push({ x: x + w / 2, y: base - h - 2, r: 7 * s, col: [255, 40, 30], blink: 2.1, ph: 1.1 });
      } };
    },
    church(x, h, col, s) {
      s = s || 1;
      return { z: 4, kind: 'lm', draw(g, base) {
        g.fillStyle = col;
        g.fillRect(x, base - h * s, 20 * s, h * s);
        g.beginPath(); g.moveTo(x - 2 * s, base - h * s); g.lineTo(x + 10 * s, base - h * s - 44 * s); g.lineTo(x + 22 * s, base - h * s); g.fill();
        g.fillRect(x + 9.2 * s, base - h * s - 56 * s, 1.6 * s, 14 * s);
      } };
    },
    // Warsaw: stepped Stalinist palace with spire (original interpretation)
    palace(x, h, col, s, lights) {
      s = s || 1;
      return { z: 6, kind: 'lm', draw(g, base, r) {
        g.fillStyle = col;
        const W0 = 330 * s;
        // wings
        g.fillRect(x - W0 / 2, base - 70 * s, W0, 70 * s);
        const steps = [[200, 130], [150, 190], [112, 260], [84, 330], [64, 380], [48, 420]];
        steps.forEach(([w, hh], i) => {
          w *= s; hh *= s;
          g.fillRect(x - w / 2, base - hh, w, hh);
          // corner pinnacles
          g.fillRect(x - w / 2 - 3 * s, base - hh - 10 * s, 6 * s, 12 * s);
          g.fillRect(x + w / 2 - 3 * s, base - hh - 10 * s, 6 * s, 12 * s);
          if (i < 4) {
            // attic crenellation
            for (let k = -w / 2; k < w / 2; k += 8 * s) g.fillRect(x + k, base - hh - 4 * s, 4 * s, 4 * s);
          }
        });
        // spire
        g.beginPath();
        g.moveTo(x - 20 * s, base - 420 * s);
        g.lineTo(x - 7 * s, base - 470 * s);
        g.lineTo(x - 2 * s, base - h * s);
        g.lineTo(x + 2 * s, base - h * s);
        g.lineTo(x + 7 * s, base - 470 * s);
        g.lineTo(x + 20 * s, base - 420 * s);
        g.fill();
        // clock faces glowing
        g.fillStyle = 'rgba(255,236,200,0.9)';
        g.beginPath(); g.arc(x, base - 395 * s, 7 * s, 0, U.TAU); g.fill();
        // warm floodlit faces (only the tower body, not a box)
        g.save();
        g.globalCompositeOperation = 'source-atop';
        const fl = g.createLinearGradient(0, base - 470 * s, 0, base);
        fl.addColorStop(0, 'rgba(255,196,130,0.34)'); fl.addColorStop(0.6, 'rgba(255,170,100,0.14)'); fl.addColorStop(1, 'rgba(255,160,90,0.04)');
        g.fillStyle = fl;
        g.fillRect(x - 170 * s, base - h * s, 340 * s, h * s);
        g.restore();
        // window slits
        const win = { lit: 0.3, cw: 3 * s, ch: 6 * s, gx: 5 * s, gy: 7 * s, wa: 0.55 };
        windowGrid(g, r, x - 98 * s, base - 255 * s, 196 * s, 120 * s, win);
        windowGrid(g, r, x - 160 * s, base - 64 * s, 320 * s, 56 * s, win);
        if (lights) lights.push({ x, y: base - h * s, r: 9 * s, col: [255, 40, 30], blink: 1.9, ph: 0 });
      } };
    },
    // tallest tower with needle spire
    spireTower(x, h, col, win, s, lights) {
      s = s || 1;
      return { z: 5, kind: 'lm', draw(g, base, r) {
        const w = 58 * s;
        g.fillStyle = col;
        g.beginPath();
        g.moveTo(x, base); g.lineTo(x, base - h * 0.86); g.lineTo(x + w * 0.35, base - h * 0.9); g.lineTo(x + w, base - h * 0.84); g.lineTo(x + w, base); g.fill();
        windowGrid(g, r, x + 2, base - h * 0.84, w - 4, h * 0.84, Object.assign({}, win, { floorMode: true, cool: [170, 205, 255], warmth: 0.25 }));
        g.fillStyle = col;
        g.fillRect(x + w * 0.35 - 1.5 * s, base - h * 1.12, 3 * s, h * 0.24);
        if (lights) { lights.push({ x: x + w * 0.35, y: base - h * 1.12, r: 10 * s, col: [255, 40, 30], blink: 1.2, ph: 0.4 }); lights.push({ x: x + w * 0.35, y: base - h * 0.98, r: 6 * s, col: [255, 40, 30], blink: 1.2, ph: 0.4 }); }
      } };
    },
    // sail-curved residential tower
    sailTower(x, h, col, win, s, lights) {
      s = s || 1;
      return { z: 4, kind: 'lm', draw(g, base, r) {
        const w = 52 * s;
        g.save();
        g.beginPath();
        g.moveTo(x, base); g.lineTo(x, base - h * 0.78);
        g.quadraticCurveTo(x + w * 0.2, base - h * 1.02, x + w, base - h);
        g.quadraticCurveTo(x + w * 0.95, base - h * 0.4, x + w, base);
        g.closePath();
        g.fillStyle = col; g.fill();
        g.clip();
        windowGrid(g, r, x + 2, base - h, w - 4, h, Object.assign({}, win, { cw: 5 * s, ch: 3 * s, gx: 2 * s, gy: 6 * s }));
        g.restore();
        // diagonal glass grid highlight
        g.strokeStyle = 'rgba(160,190,230,0.12)';
        g.lineWidth = 1;
        for (let k = 0; k < 8; k++) { g.beginPath(); g.moveTo(x, base - h * 0.1 * k); g.lineTo(x + w, base - h * 0.1 * k - 40 * s); g.stroke(); }
        if (lights) lights.push({ x: x + w, y: base - h - 3, r: 8 * s, col: [255, 40, 30], blink: 2.4, ph: 0.8 });
      } };
    },
    // curved glass tower with wings
    curvedTower(x, h, col, win, s, lights) {
      s = s || 1;
      return { z: 4, kind: 'lm', draw(g, base, r) {
        const w = 60 * s;
        g.fillStyle = col;
        g.fillRect(x - 40 * s, base - h * 0.38, 40 * s, h * 0.38);
        g.fillRect(x + w, base - h * 0.38, 40 * s, h * 0.38);
        g.beginPath();
        g.moveTo(x, base); g.lineTo(x, base - h * 0.95); g.quadraticCurveTo(x + w / 2, base - h * 1.04, x + w, base - h * 0.95); g.lineTo(x + w, base); g.fill();
        windowGrid(g, r, x + 2, base - h * 0.93, w - 4, h * 0.93, Object.assign({}, win, { floorMode: true, cool: [180, 215, 255], warmth: 0.3 }));
        windowGrid(g, r, x - 38 * s, base - h * 0.36, 36 * s, h * 0.36, win);
        windowGrid(g, r, x + w + 2, base - h * 0.36, 36 * s, h * 0.36, win);
        const gr = g.createLinearGradient(x, 0, x + w, 0);
        gr.addColorStop(0, 'rgba(120,160,220,0.12)'); gr.addColorStop(1, 'rgba(0,0,0,0.3)');
        g.fillStyle = gr; g.fillRect(x, base - h, w, h);
        if (lights) lights.push({ x: x + w / 2, y: base - h * 1.01, r: 8 * s, col: [255, 40, 30], blink: 1.6, ph: 1.4 });
      } };
    },
    // communist-era slab block
    slab(x, w, h, col, win) {
      return { z: 2, kind: 'lm', draw(g, base, r) {
        g.fillStyle = col;
        g.fillRect(x, base - h, w, h);
        windowGrid(g, r, x + 3, base - h + 3, w - 6, h - 6, Object.assign({}, win, { cw: 6, ch: 5, gx: 5, gy: 6 }));
      } };
    },
    glassTower(x, w, h, col, win, lights, crown) {
      return { z: 3.5, kind: 'lm', draw(g, base, r) {
        g.fillStyle = col;
        g.fillRect(x, base - h, w, h);
        if (crown) { g.fillRect(x + w * 0.2, base - h - 16, w * 0.6, 16); }
        windowGrid(g, r, x + 2, base - h + 4, w - 4, h - 6, Object.assign({}, win, { floorMode: true }));
        if (lights) lights.push({ x: x + w / 2, y: base - h - (crown ? 18 : 2), r: 7, col: [255, 40, 30], blink: 1.4 + (x % 7) * 0.13, ph: x % 3 });
      } };
    },
  };

  // ---------- Upper Silesia / Gliwice (original stylisations) ----------
  // tall wooden lattice radio tower (a Gliwice icon)
  G.lm.radioTower = (x, h, col, s, lights) => {
    s = s || 1;
    return { z: 2, kind: 'lm', draw(g, base) {
      const bw = 34 * s, tw = 3 * s;
      g.strokeStyle = col; g.lineWidth = 2.2 * s; g.lineCap = 'round';
      g.beginPath(); g.moveTo(x - bw, base); g.lineTo(x - tw, base - h); g.moveTo(x + bw, base); g.lineTo(x + tw, base - h); g.stroke();
      g.lineWidth = 1 * s;
      const n = 16;
      for (let i = 0; i < n; i++) {
        const t0 = i / n, t1 = (i + 1) / n;
        const y0 = base - h * t0, y1 = base - h * t1;
        const w0 = U.lerp(bw, tw, t0), w1 = U.lerp(bw, tw, t1);
        g.beginPath(); g.moveTo(x - w0, y0); g.lineTo(x + w1, y1); g.moveTo(x + w0, y0); g.lineTo(x - w1, y1); g.moveTo(x - w1, y1); g.lineTo(x + w1, y1); g.stroke();
      }
      g.fillStyle = col; g.fillRect(x - 1 * s, base - h - 10 * s, 2 * s, 10 * s);
      if (lights) lights.push({ x, y: base - h - 10 * s, r: 9 * s, col: [255, 40, 30], blink: 1.5, ph: 0.3 });
    } };
  };
  // Rynek: row of townhouses around a town hall with a baroque helm
  G.lm.townHall = (x, h, col, s) => {
    s = s || 1;
    return { z: 5, kind: 'lm', draw(g, base, r) {
      g.fillStyle = col;
      for (let k = -4; k <= 4; k++) {
        const hx = x + k * 26 * s, hh = (48 + ((k * 37) % 13)) * s;
        g.fillRect(hx - 12 * s, base - hh, 24 * s, hh);
        g.beginPath(); g.moveTo(hx - 13 * s, base - hh); g.lineTo(hx, base - hh - 14 * s); g.lineTo(hx + 13 * s, base - hh); g.fill();
        g.fillStyle = 'rgba(255,196,120,0.55)';
        for (let w = 0; w < 3; w++) if (r() < 0.45) g.fillRect(hx - 6 * s + (w % 2) * 8 * s, base - hh + 10 * s + w * 12 * s, 4 * s, 6 * s);
        g.fillStyle = col;
      }
      // town hall body and tower
      g.fillRect(x - 30 * s, base - 70 * s, 60 * s, 70 * s);
      g.fillRect(x - 9 * s, base - h * s, 18 * s, h * s);
      const ty = base - h * s;
      g.beginPath(); g.ellipse(x, ty - 6 * s, 11 * s, 9 * s, 0, 0, U.TAU); g.fill();          // helm bulb
      g.fillRect(x - 3 * s, ty - 26 * s, 6 * s, 14 * s);                                        // lantern
      g.beginPath(); g.moveTo(x - 4 * s, ty - 26 * s); g.lineTo(x, ty - 44 * s); g.lineTo(x + 4 * s, ty - 26 * s); g.fill();
      g.fillStyle = 'rgba(255,236,200,0.85)'; g.beginPath(); g.arc(x, ty + 16 * s, 4 * s, 0, U.TAU); g.fill();
    } };
  };
  // mine headframe with twin sheave wheels (Upper Silesian skyline cue); win arg ignored
  G.lm.headframe = (x, h, col, win, s, lights) => {
    s = s || 1;
    return { z: 3, kind: 'lm', draw(g, base) {
      g.strokeStyle = col; g.fillStyle = col; g.lineWidth = 3 * s;
      g.beginPath(); g.moveTo(x - 20 * s, base); g.lineTo(x - 8 * s, base - h); g.moveTo(x + 20 * s, base); g.lineTo(x + 8 * s, base - h); g.moveTo(x + 20 * s, base); g.lineTo(x + 70 * s, base - h * 0.2); g.stroke();
      g.lineWidth = 1.2 * s;
      for (let k = 1; k < 6; k++) { const y = base - (h * k) / 6, w = U.lerp(20, 8, k / 6) * s; g.beginPath(); g.moveTo(x - w, y); g.lineTo(x + w, y); g.stroke(); }
      g.fillRect(x - 14 * s, base - h - 6 * s, 28 * s, 6 * s);
      [-7, 7].forEach((o) => { g.beginPath(); g.arc(x + o * s, base - h - 12 * s, 9 * s, 0, U.TAU); g.lineWidth = 2 * s; g.stroke(); });
      g.fillRect(x + 40 * s, base - 44 * s, 70 * s, 44 * s); // winding house
      if (lights) lights.push({ x, y: base - h - 22 * s, r: 7 * s, col: [255, 40, 30], blink: 2.2, ph: 0.9 });
    } };
  };
  // tall industrial chimney; win arg ignored
  G.lm.chimney = (x, h, col, win, s, lights) => {
    s = s || 1;
    return { z: 2, kind: 'lm', draw(g, base) {
      g.fillStyle = col;
      g.beginPath(); g.moveTo(x - 11 * s, base); g.lineTo(x - 5 * s, base - h); g.lineTo(x + 5 * s, base - h); g.lineTo(x + 11 * s, base); g.fill();
      g.fillStyle = 'rgba(255,255,255,0.08)';
      for (let k = 1; k < 4; k++) g.fillRect(x - 8 * s, base - (h * k) / 4, 16 * s, 2 * s);
      if (lights) lights.push({ x, y: base - h - 2, r: 7 * s, col: [255, 40, 30], blink: 1.8, ph: 1.7 });
    } };
  };
  // ---------- Wrocław (original stylisations) ----------
  // cathedral with twin slender spires on the river island
  G.lm.twinSpires = (x, h, col, s, lights) => {
    s = s || 1;
    return { z: 6, kind: 'lm', draw(g, base) {
      g.fillStyle = col;
      g.fillRect(x - 40 * s, base - 120 * s, 190 * s, 120 * s);
      g.beginPath(); g.moveTo(x - 40 * s, base - 120 * s); g.lineTo(x + 55 * s, base - 170 * s); g.lineTo(x + 150 * s, base - 120 * s); g.fill();
      [x, x + 44 * s].forEach((tx) => {
        const tw = 30 * s, th = h * 0.55 * s;
        g.fillRect(tx - tw / 2, base - th, tw, th);
        g.beginPath(); g.moveTo(tx - tw / 2 - 2 * s, base - th); g.lineTo(tx, base - h * s); g.lineTo(tx + tw / 2 + 2 * s, base - th); g.fill();
        g.fillRect(tx - 1 * s, base - h * s - 14 * s, 2 * s, 14 * s);
        g.fillStyle = 'rgba(255,214,150,0.5)'; g.fillRect(tx - 3 * s, base - th + 14 * s, 6 * s, 20 * s); g.fillStyle = col;
      });
      // floodlight on the facade only
      g.save(); g.globalCompositeOperation = 'source-atop';
      const fl = g.createLinearGradient(0, base - h * s, 0, base);
      fl.addColorStop(0, 'rgba(255,200,130,0.3)'); fl.addColorStop(1, 'rgba(255,170,100,0.08)');
      g.fillStyle = fl; g.fillRect(x - 50 * s, base - h * s - 20 * s, 210 * s, h * s + 20 * s);
      g.restore();
      if (lights) lights.push({ x: x + 22 * s, y: base - 150 * s, r: 1, col: [255, 200, 140], blink: 0 });
    } };
  };
  // the one tall tower: slender shaft with vertical ribs and stepped wings
  G.lm.skyTower = (x, h, col, win, s, lights) => {
    s = s || 1;
    return { z: 4, kind: 'lm', draw(g, base, r) {
      const w = 46 * s;
      g.fillStyle = col;
      g.fillRect(x - 70 * s, base - h * 0.3, 70 * s, h * 0.3);
      g.fillRect(x + w, base - h * 0.24, 80 * s, h * 0.24);
      g.fillRect(x, base - h, w, h);
      G.windowGrid(g, r, x + 2, base - h + 6, w - 4, h - 8, Object.assign({}, win, { floorMode: true, cool: [180, 210, 255], warmth: 0.35 }));
      G.windowGrid(g, r, x - 68 * s, base - h * 0.3, 66 * s, h * 0.3, win);
      g.fillStyle = 'rgba(160,190,230,0.16)'; for (let k = 1; k < 5; k++) g.fillRect(x + (k * w) / 5, base - h, 1, h);
      g.fillStyle = col; g.fillRect(x + w * 0.2, base - h - 26 * s, w * 0.6, 26 * s);
      if (lights) { lights.push({ x: x + w / 2, y: base - h - 28 * s, r: 9 * s, col: [255, 40, 30], blink: 1.3, ph: 0.1 }); }
    } };
  };

  // animated aviation lights over a skyline layer
  G.drawLights = (g, lights, t, ox, oy, sc) => {
    sc = sc || 1;
    lights.forEach((l) => {
      const on = l.blink ? 0.5 + 0.5 * Math.sin((t + l.ph) * Math.PI * 2 / l.blink) : 1;
      const a = Math.pow(on, 3);
      if (a < 0.02) return;
      const x = ox + l.x * sc, y = oy + l.y * sc;
      G.glow(g, x, y, l.r * 3 * sc, l.col, a * 0.9);
      g.fillStyle = U.rgba([255, 200, 190], a);
      g.fillRect(x - 1, y - 1, 2, 2);
    });
  };

  // ------------------------------------------------------------------ rain
  class Rain {
    constructor(n, o) {
      this.o = Object.assign({ angle: 0.12, speed: 1900, len: 60, col: [200, 215, 235], alpha: 0.35, x0: -200, x1: 2120, y0: -200, y1: 1180, zmin: 0.2 }, o || {});
      this.d = [];
      this.intensity = 1;
      for (let i = 0; i < n; i++) this.d.push(this.spawn(true));
    }
    spawn(init) {
      const o = this.o;
      const z = o.zmin + Math.random() * (1 - o.zmin);
      return { x: o.x0 + Math.random() * (o.x1 - o.x0), y: init ? o.y0 + Math.random() * (o.y1 - o.y0) : o.y0 - Math.random() * 300, z, v: o.speed * (0.55 + z * 0.6) * (0.9 + Math.random() * 0.2) };
    }
    update(dt) {
      const o = this.o, sa = Math.sin(o.angle), ca = Math.cos(o.angle);
      for (let i = 0; i < this.d.length; i++) {
        const p = this.d[i];
        p.y += p.v * ca * dt;
        p.x += p.v * sa * dt;
        if (p.y > o.y1 || p.x > o.x1 + 100) this.d[i] = this.spawn(false);
      }
    }
    draw(g, mul) {
      const o = this.o, sa = Math.sin(o.angle), ca = Math.cos(o.angle);
      mul = (mul == null ? 1 : mul) * this.intensity;
      const buckets = 4;
      g.lineCap = 'round';
      for (let b = 0; b < buckets; b++) {
        const zl = b / buckets, zh = (b + 1) / buckets;
        g.beginPath();
        let any = false;
        for (let i = 0; i < this.d.length; i++) {
          const p = this.d[i];
          const zz = (p.z - o.zmin) / (1 - o.zmin);
          if (zz < zl || zz >= zh) continue;
          const L = o.len * (0.35 + p.z * 0.9);
          g.moveTo(p.x, p.y);
          g.lineTo(p.x - sa * L, p.y - ca * L);
          any = true;
        }
        if (!any) continue;
        const zm = (zl + zh) / 2;
        g.strokeStyle = U.rgba(o.col, o.alpha * mul * (0.25 + zm * 0.75));
        g.lineWidth = 0.6 + zm * 1.5;
        g.stroke();
      }
    }
  }
  G.Rain = Rain;

  // ------------------------------------------------------------------ snow
  class Snow {
    constructor(n, o) {
      this.o = Object.assign({ x0: -200, x1: 2120, y0: -100, y1: 1180, speed: 90, wind: 30, col: [235, 240, 250], alpha: 0.8, size: 2.6 }, o || {});
      this.f = [];
      for (let i = 0; i < n; i++) this.f.push(this.spawn(true));
    }
    spawn(init) {
      const o = this.o, z = 0.25 + Math.random() * 0.75;
      return { x: o.x0 + Math.random() * (o.x1 - o.x0), y: init ? o.y0 + Math.random() * (o.y1 - o.y0) : o.y0 - Math.random() * 60, z, ph: Math.random() * 10 };
    }
    update(dt, t) {
      const o = this.o;
      for (let i = 0; i < this.f.length; i++) {
        const p = this.f[i];
        p.y += o.speed * (0.4 + p.z) * dt;
        p.x += (o.wind * p.z + Math.sin(t * 0.8 + p.ph) * 18) * dt;
        if (p.y > o.y1 || p.x > o.x1 + 50) this.f[i] = this.spawn(false);
      }
    }
    draw(g, mul) {
      const o = this.o;
      mul = mul == null ? 1 : mul;
      for (const p of this.f) {
        const r = o.size * (0.4 + p.z * 1.1);
        g.fillStyle = U.rgba(o.col, o.alpha * mul * (0.3 + p.z * 0.7));
        g.beginPath(); g.arc(p.x, p.y, r, 0, U.TAU); g.fill();
      }
    }
  }
  G.Snow = Snow;

  // ------------------------------------------------------------------ glass droplets
  class GlassDrops {
    constructor(rects, o) {
      this.rects = rects; // [{x,y,w,h}]
      this.o = Object.assign({ beads: 900, drips: 14, light: [220, 230, 245], dark: [10, 14, 22], seed: 3, scale: 1 }, o || {});
      this.q = F.quality();
      this.build();
      this.drips = [];
      this.trails = [];
    }
    area() { return this.rects.reduce((a, r) => a + r.w * r.h, 0); }
    randPoint(r) {
      let a = r() * this.area();
      for (const R of this.rects) { const s = R.w * R.h; if (a < s) return [R.x + r() * R.w, R.y + r() * R.h]; a -= s; }
      const R = this.rects[0]; return [R.x, R.y];
    }
    bbox() {
      let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
      this.rects.forEach((R) => { x0 = Math.min(x0, R.x); y0 = Math.min(y0, R.y); x1 = Math.max(x1, R.x + R.w); y1 = Math.max(y1, R.y + R.h); });
      return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
    }
    build() {
      const o = this.o, bb = this.bbox();
      this.bb = bb;
      const r = U.rng(o.seed);
      this.tex = F.offscreen(bb.w, bb.h, this.q, (g) => {
        g.translate(-bb.x, -bb.y);
        for (let i = 0; i < o.beads; i++) {
          const [x, y] = this.randPoint(r);
          const s = o.scale * (r() < 0.9 ? 0.6 + r() * 1.6 : 2 + r() * 2.8);
          G.bead(g, x, y, s, o.light, o.dark, r);
        }
      });
    }
    update(dt) {
      const o = this.o;
      if (this.drips.length < o.drips && Math.random() < dt * 1.4) {
        const [x, y] = this.randPoint(Math.random);
        this.drips.push({ x, y, v: 0, s: o.scale * (2.2 + Math.random() * 2), stick: Math.random() * 1.5, wob: Math.random() * 10 });
      }
      for (let i = this.drips.length - 1; i >= 0; i--) {
        const d = this.drips[i];
        if (d.stick > 0) { d.stick -= dt; continue; }
        d.v = Math.min(d.v + dt * 260, 90 + d.s * 30);
        if (Math.random() < dt * 1.5) d.v *= 0.2; // stutter
        const ny = d.y + d.v * dt;
        const nx = d.x + Math.sin(ny * 0.05 + d.wob) * 0.25;
        this.trails.push({ x: d.x, y: d.y, x2: nx, y2: ny, s: d.s * 0.45, a: 0.9 });
        d.x = nx; d.y = ny;
        if (!this.inside(d.x, d.y)) this.drips.splice(i, 1);
      }
      for (let i = this.trails.length - 1; i >= 0; i--) {
        const tr = this.trails[i];
        tr.a -= dt * 0.35;
        if (tr.a <= 0) this.trails.splice(i, 1);
      }
      if (this.trails.length > 1400) this.trails.splice(0, this.trails.length - 1400);
    }
    inside(x, y) { return this.rects.some((R) => x >= R.x && x <= R.x + R.w && y >= R.y && y <= R.y + R.h); }
    draw(g, alpha) {
      const o = this.o, bb = this.bb;
      alpha = alpha == null ? 1 : alpha;
      g.save();
      g.globalAlpha = alpha;
      g.drawImage(this.tex, bb.x, bb.y, bb.w, bb.h);
      // trails
      g.lineCap = 'round';
      for (const tr of this.trails) {
        g.strokeStyle = U.rgba(o.light, 0.05 * tr.a * alpha);
        g.lineWidth = tr.s * 1.6;
        g.beginPath(); g.moveTo(tr.x, tr.y); g.lineTo(tr.x2, tr.y2); g.stroke();
      }
      for (const d of this.drips) G.bead(g, d.x, d.y, d.s, o.light, o.dark, Math.random, true);
      g.restore();
    }
  }
  G.GlassDrops = GlassDrops;

  // single water bead: dark top rim, bright bottom caustic, tiny specular
  G.bead = (g, x, y, s, light, dark, r, big) => {
    const ry = s * (big ? 1.25 : 1);
    g.fillStyle = U.rgba(dark, 0.22);
    g.beginPath(); g.ellipse(x, y - s * 0.12, s, ry, 0, 0, U.TAU); g.fill();
    g.fillStyle = U.rgba(light, 0.10);
    g.beginPath(); g.ellipse(x, y, s * 0.85, ry * 0.85, 0, 0, U.TAU); g.fill();
    g.fillStyle = U.rgba(light, 0.35);
    g.beginPath(); g.ellipse(x, y + ry * 0.45, s * 0.6, ry * 0.3, 0, 0, U.TAU); g.fill();
    if (s > 1.1) { g.fillStyle = U.rgba([255, 255, 255], 0.7); g.fillRect(x - s * 0.4, y - ry * 0.5, Math.max(0.8, s * 0.28), Math.max(0.8, s * 0.28)); }
  };

  // ------------------------------------------------------------------ post processing
  const grains = [0, 1, 2, 3].map((i) => G.noiseCanvas(256, 256, 11 + i, 255, true));
  let gi = 0, gpat = null, gframe = 0;
  F.grade = { grain: 0.07, vignette: 0.55, tint: null, tintA: 0, flash: 0, lift: null };
  const vigCache = { w: 0, h: 0, a: 0, c: null };
  F.post = (g, dt) => {
    const gr = F.grade;
    const w = F.cvs.width, h = F.cvs.height;
    g.setTransform(1, 0, 0, 1, 0, 0);
    // color grade tint
    if (gr.tint && gr.tintA > 0) {
      g.globalCompositeOperation = 'soft-light';
      g.fillStyle = U.rgba(gr.tint, gr.tintA);
      g.fillRect(0, 0, w, h);
    }
    if (gr.lift) {
      g.globalCompositeOperation = 'screen';
      g.fillStyle = U.rgba(gr.lift, 1);
      g.fillRect(0, 0, w, h);
    }
    // lightning / flash
    if (gr.flash > 0.001) {
      g.globalCompositeOperation = 'screen';
      g.fillStyle = U.rgba([200, 210, 255], gr.flash * 0.55);
      g.fillRect(0, 0, w, h);
      gr.flash *= Math.exp(-dt * 9);
    }
    // vignette
    if (gr.vignette > 0) {
      if (vigCache.w !== w || vigCache.h !== h || vigCache.a !== gr.vignette) {
        vigCache.c = F.offscreen(w / 4, h / 4, 1, (vg) => {
          const rg = vg.createRadialGradient(w / 8, h / 8, Math.min(w, h) / 8 * 0.35, w / 8, h / 8, Math.hypot(w, h) / 8 * 0.62);
          rg.addColorStop(0, 'rgba(0,0,0,0)');
          rg.addColorStop(0.6, `rgba(0,0,0,${gr.vignette * 0.35})`);
          rg.addColorStop(1, `rgba(0,0,0,${gr.vignette})`);
          vg.fillStyle = rg; vg.fillRect(0, 0, w / 4, h / 4);
        });
        vigCache.w = w; vigCache.h = h; vigCache.a = gr.vignette;
      }
      g.globalCompositeOperation = 'source-over';
      g.drawImage(vigCache.c, 0, 0, w, h);
    }
    // film grain
    if (gr.grain > 0) {
      if ((gframe++ & 1) === 0) { gi = (gi + 1) % 4; gpat = g.createPattern(grains[gi], 'repeat'); }
      g.globalCompositeOperation = 'overlay';
      g.globalAlpha = gr.grain;
      g.save();
      const ox = (Math.random() * 256) | 0, oy = (Math.random() * 256) | 0;
      g.translate(-ox, -oy);
      g.fillStyle = gpat;
      g.fillRect(0, 0, w + 256, h + 256);
      g.restore();
      g.globalAlpha = 1;
    }
    g.globalCompositeOperation = 'source-over';
  };

  // ------------------------------------------------------------------ perspective helpers
  // Quad fill with 4 points
  G.quad = (g, p, fill) => {
    g.beginPath();
    g.moveTo(p[0][0], p[0][1]);
    for (let i = 1; i < p.length; i++) g.lineTo(p[i][0], p[i][1]);
    g.closePath();
    if (fill) { g.fillStyle = fill; g.fill(); }
  };
  G.poly = G.quad;
  // point along line toward vanishing point
  G.toVP = (x, y, vp, k) => [x + (vp[0] - x) * k, y + (vp[1] - y) * k];

  G.roundRect = (g, x, y, w, h, r) => {
    g.beginPath();
    g.moveTo(x + r, y);
    g.arcTo(x + w, y, x + w, y + h, r);
    g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r);
    g.arcTo(x, y, x + w, y, r);
    g.closePath();
  };

  // soft shadow blob
  G.shadow = (g, x, y, rx, ry, a) => {
    g.save();
    g.translate(x, y);
    g.scale(1, ry / rx);
    const gr = g.createRadialGradient(0, 0, 0, 0, 0, rx);
    gr.addColorStop(0, `rgba(0,0,0,${a})`);
    gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr;
    g.beginPath(); g.arc(0, 0, rx, 0, U.TAU); g.fill();
    g.restore();
  };

  // steam wisps from a cup
  G.steam = (g, x, y, t, a, s) => {
    s = s || 1;
    g.save();
    g.lineCap = 'round';
    for (let k = 0; k < 3; k++) {
      const ph = t * 0.6 + k * 1.7;
      const life = (ph % 3) / 3;
      g.strokeStyle = `rgba(230,230,235,${a * Math.sin(life * Math.PI) * 0.35})`;
      g.lineWidth = (3 + life * 6) * s;
      g.beginPath();
      const bx = x + (k - 1) * 6 * s;
      for (let i = 0; i <= 12; i++) {
        const yy = y - i * 7 * s - life * 30 * s;
        const xx = bx + Math.sin(i * 0.6 + ph * 2) * (2 + i * 0.9) * s;
        i ? g.lineTo(xx, yy) : g.moveTo(xx, yy);
      }
      g.stroke();
    }
    g.restore();
  };
})(window.F);
