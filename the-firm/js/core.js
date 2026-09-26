/* THE FIRM — core: math, canvas, camera, loop, input, scene manager, sequencing */
window.F = window.F || {};
(function (F) {
  'use strict';

  // ------------------------------------------------------------------ math
  const TAU = Math.PI * 2;
  const U = {
    TAU,
    clamp: (v, a, b) => (v < a ? a : v > b ? b : v),
    lerp: (a, b, t) => a + (b - a) * t,
    inv: (a, b, v) => (v - a) / (b - a),
    smooth: (t) => t * t * (3 - 2 * t),
    easeInOut: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    easeOut: (t) => 1 - Math.pow(1 - t, 3),
    easeIn: (t) => t * t * t,
    easeOutQuint: (t) => 1 - Math.pow(1 - t, 5),
    damp: (a, b, lambda, dt) => b + (a - b) * Math.exp(-lambda * dt),
    rng(seed) {
      let s = seed >>> 0;
      return function () {
        s = (s + 0x6d2b79f5) >>> 0;
        let t = s;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    },
    // cheap smooth 1D value noise
    noise(x) {
      const i = Math.floor(x), f = x - i;
      const h = (n) => {
        n = (n << 13) ^ n;
        return 1 - ((n * (n * n * 15731 + 789221) + 1376312589) & 0x7fffffff) / 1073741824;
      };
      const u = f * f * (3 - 2 * f);
      return h(i) * (1 - u) + h(i + 1) * u;
    },
    rgba: (c, a) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`,
    mix: (c1, c2, t) => [c1[0] + (c2[0] - c1[0]) * t, c1[1] + (c2[1] - c1[1]) * t, c1[2] + (c2[2] - c1[2]) * t],
    hex(h) {
      h = h.replace('#', '');
      return [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16)];
    },
  };
  F.U = U;

  // ------------------------------------------------------------------ canvas & view
  const VW = 1920, VH = 1080;
  F.VW = VW; F.VH = VH;
  const cvs = document.getElementById('game');
  const ctx = cvs.getContext('2d', { alpha: false });
  F.cvs = cvs; F.ctx = ctx;

  const view = { w: 0, h: 0, dpr: 1, scale: 1, px: 1 };
  F.view = view;

  function resize() {
    const w = window.innerWidth, h = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    // cap backing store for performance
    const maxW = 2880;
    if (w * dpr > maxW) dpr = maxW / w;
    view.w = w; view.h = h; view.dpr = dpr;
    cvs.width = Math.round(w * dpr);
    cvs.height = Math.round(h * dpr);
    cvs.style.width = w + 'px';
    cvs.style.height = h + 'px';
    view.scale = Math.max(w / VW, h / VH); // cover
    view.px = view.scale * dpr; // device px per virtual px
    F.emit && F.emit('resize');
  }
  window.addEventListener('resize', resize);
  resize();

  // quality factor used when pre-rendering static layers
  F.quality = () => U.clamp(view.px, 0.6, 1.6);

  // ------------------------------------------------------------------ camera
  const cam = {
    x: VW / 2, y: VH / 2, z: 1,         // current
    tx: VW / 2, ty: VH / 2, tz: 1,      // targets (for glide)
    glide: 0,                            // lambda; 0 = manual
    mx: 0, my: 0,                        // smoothed mouse parallax (-1..1)
    par: 22,                             // parallax strength (virtual px at depth 1)
    shake: 0, sx: 0, sy: 0,
    drift: 1,                            // handheld breathing amount
    rot: 0,
  };
  F.cam = cam;

  F.camSet = (x, y, z) => { cam.x = cam.tx = x; cam.y = cam.ty = y; cam.z = cam.tz = z == null ? cam.z : z; };
  F.camTo = (x, y, z, lambda) => { cam.tx = x; cam.ty = y; if (z != null) cam.tz = z; cam.glide = lambda || 2.2; };

  // animate camera between explicit keys over a duration (for shots)
  let camTween = null;
  F.camTween = (to, dur, ease) =>
    new Promise((res) => {
      camTween = { from: { x: cam.x, y: cam.y, z: cam.z }, to, t: 0, dur, ease: ease || U.easeInOut, res };
      cam.glide = 0;
    });

  // Set transform for a layer at parallax depth d. d=1 is the reference plane.
  // zoomDepth controls how much camera zoom affects the layer (dolly feel).
  F.layer = (d, zoomDepth) => {
    const zd = zoomDepth == null ? d : zoomDepth;
    const z = 1 + (cam.z - 1) * zd;
    const tx = (cam.x - VW / 2) * d + (cam.mx * cam.par + cam.sx) * d;
    const ty = (cam.y - VH / 2) * d + (cam.my * cam.par * 0.6 + cam.sy) * d;
    const S = view.px * z;
    ctx.setTransform(S, 0, 0, S, cvs.width / 2 - (VW / 2 + tx) * S, cvs.height / 2 - (VH / 2 + ty) * S);
    return { S, tx, ty, z };
  };
  // screen-fixed virtual space (for overlays), cover-fitted
  F.screen = () => {
    const S = view.px;
    ctx.setTransform(S, 0, 0, S, cvs.width / 2 - (VW / 2) * S, cvs.height / 2 - (VH / 2) * S);
  };
  // virtual coords of layer depth d -> CSS pixels
  F.toCss = (x, y, d) => {
    d = d == null ? 1 : d;
    const z = 1 + (cam.z - 1) * d;
    const tx = (cam.x - VW / 2) * d + (cam.mx * cam.par + cam.sx) * d;
    const ty = (cam.y - VH / 2) * d + (cam.my * cam.par * 0.6 + cam.sy) * d;
    const S = view.scale * z;
    return { x: view.w / 2 + (x - VW / 2 - tx) * S, y: view.h / 2 + (y - VH / 2 - ty) * S, s: S };
  };
  F.fromCss = (cx, cy, d) => {
    d = d == null ? 1 : d;
    const z = 1 + (cam.z - 1) * d;
    const tx = (cam.x - VW / 2) * d + (cam.mx * cam.par + cam.sx) * d;
    const ty = (cam.y - VH / 2) * d + (cam.my * cam.par * 0.6 + cam.sy) * d;
    const S = view.scale * z;
    return { x: (cx - view.w / 2) / S + VW / 2 + tx, y: (cy - view.h / 2) / S + VH / 2 + ty };
  };

  // ------------------------------------------------------------------ offscreen helper
  F.offscreen = (w, h, q, draw) => {
    const c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(w * q));
    c.height = Math.max(1, Math.round(h * q));
    const g = c.getContext('2d');
    g.scale(q, q);
    draw && draw(g, w, h);
    c.vw = w; c.vh = h;
    return c;
  };

  // ------------------------------------------------------------------ events
  const listeners = {};
  F.on = (ev, fn) => ((listeners[ev] = listeners[ev] || []).push(fn), fn);
  F.off = (ev, fn) => { const l = listeners[ev]; if (l) { const i = l.indexOf(fn); if (i >= 0) l.splice(i, 1); } };
  F.emit = (ev, a) => { (listeners[ev] || []).slice().forEach((fn) => fn(a)); };

  // ------------------------------------------------------------------ input
  const mouse = { x: 0, y: 0, nx: 0, ny: 0, down: false, inside: false, moved: 0 };
  F.mouse = mouse;
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX; mouse.y = e.clientY;
    mouse.nx = (e.clientX / view.w) * 2 - 1;
    mouse.ny = (e.clientY / view.h) * 2 - 1;
    mouse.inside = true; mouse.moved = performance.now();
  });
  document.addEventListener('mouseleave', () => { mouse.inside = false; });
  // clicks on the canvas layer (DOM overlays stop propagation themselves)
  cvs.addEventListener('pointerdown', (e) => {
    mouse.x = e.clientX; mouse.y = e.clientY;
    F.emit('advance');
    if (F.scene && F.scene.click && !F.inputLocked && !F.ui.modal) F.scene.click(e.clientX, e.clientY);
  });
  window.addEventListener('keydown', (e) => {
    if (e.repeat) return;
    if (e.key === ' ' || e.key === 'Enter') F.emit('advance');
    F.emit('key', e);
    if (F.scene && F.scene.key) F.scene.key(e);
  });

  // ------------------------------------------------------------------ sequencing
  let skipToken = 0;
  F.on('advance', () => { skipToken++; });
  // wait ms; if skippable, a click/space ends it early
  F.wait = (ms, skippable) =>
    new Promise((res) => {
      const start = skipToken;
      const t0 = performance.now();
      const tick = () => {
        if (performance.now() - t0 >= ms || (skippable && skipToken !== start)) return res();
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  F.waitClick = () => new Promise((res) => { const fn = () => { F.off('advance', fn); res(); }; setTimeout(() => F.on('advance', fn), 60); });

  // ------------------------------------------------------------------ scene manager
  F.scenes = {};
  F.scene = null;
  F.inputLocked = false;
  F.defineScene = (name, def) => { F.scenes[name] = def; def.name = name; };

  F.go = async (name, opts) => {
    opts = opts || {};
    const next = F.scenes[name];
    if (!next) throw new Error('no scene ' + name);
    F.inputLocked = true;
    if (F.scene && !opts.cut) await F.fx.fade(1, opts.fadeOut == null ? 700 : opts.fadeOut);
    if (F.scene && F.scene.exit) F.scene.exit();
    F.hotspots = [];
    F.ui && F.ui.clearHover();
    cam.shake = 0; cam.rot = 0;
    F.scene = next;
    next.t = 0;
    if (next.enter) await next.enter(opts);
    F.inputLocked = false;
    if (!opts.holdBlack) await F.fx.fade(0, opts.fadeIn == null ? 900 : opts.fadeIn);
    if (next.start) next.start(opts);
  };

  // ------------------------------------------------------------------ hotspots
  // {id, x,y,w,h (virtual at depth d) | poly, d, label, sub, onClick, enabled()}
  F.hotspots = [];
  F.hover = null;
  function hitTest(cx, cy) {
    for (let i = F.hotspots.length - 1; i >= 0; i--) {
      const h = F.hotspots[i];
      if (h.enabled && !h.enabled()) continue;
      const p = F.fromCss(cx, cy, h.d == null ? 1 : h.d);
      if (h.poly) {
        if (pointInPoly(p.x, p.y, h.poly)) return h;
      } else if (p.x >= h.x && p.x <= h.x + h.w && p.y >= h.y && p.y <= h.y + h.h) return h;
    }
    return null;
  }
  function pointInPoly(x, y, pts) {
    let inside = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const xi = pts[i][0], yi = pts[i][1], xj = pts[j][0], yj = pts[j][1];
      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  }
  F.hitTest = hitTest;
  F.clickHotspots = (cx, cy) => {
    const h = hitTest(cx, cy);
    if (h && h.onClick) { F.audio && F.audio.click(); h.onClick(h); return true; }
    return false;
  };

  // ------------------------------------------------------------------ loop
  let last = performance.now();
  F.time = 0;
  F.fps = 60;
  function frame(now) {
    let dt = (now - last) / 1000;
    last = now;
    if (dt > 0.1) dt = 0.1;
    F.time += dt;
    F.fps = U.lerp(F.fps, 1 / Math.max(dt, 0.001), 0.05);

    // mouse parallax smoothing
    const tmx = mouse.inside ? mouse.nx : 0, tmy = mouse.inside ? mouse.ny : 0;
    cam.mx = U.damp(cam.mx, tmx, 2.2, dt);
    cam.my = U.damp(cam.my, tmy, 2.2, dt);

    if (camTween) {
      camTween.t += dt;
      const k = camTween.ease(U.clamp(camTween.t / camTween.dur, 0, 1));
      cam.x = U.lerp(camTween.from.x, camTween.to.x, k);
      cam.y = U.lerp(camTween.from.y, camTween.to.y, k);
      cam.z = U.lerp(camTween.from.z, camTween.to.z == null ? camTween.from.z : camTween.to.z, k);
      cam.tx = cam.x; cam.ty = cam.y; cam.tz = cam.z;
      if (camTween.t >= camTween.dur) { const r = camTween.res; camTween = null; r(); }
    } else if (cam.glide > 0) {
      cam.x = U.damp(cam.x, cam.tx, cam.glide, dt);
      cam.y = U.damp(cam.y, cam.ty, cam.glide, dt);
      cam.z = U.damp(cam.z, cam.tz, cam.glide, dt);
    }
    // handheld drift + shake
    const t = F.time;
    const drift = cam.drift;
    cam.sx = (U.noise(t * 0.23) * 5 + U.noise(t * 0.61 + 9) * 1.5) * drift;
    cam.sy = (U.noise(t * 0.19 + 4) * 3.5 + U.noise(t * 0.53 + 2) * 1.2) * drift;
    if (cam.shake > 0) {
      cam.sx += (Math.random() - 0.5) * cam.shake * 14;
      cam.sy += (Math.random() - 0.5) * cam.shake * 14;
      cam.shake = Math.max(0, cam.shake - dt * 1.6);
    }

    const sc = F.scene;
    if (sc) {
      sc.t = (sc.t || 0) + dt;
      if (sc.update) sc.update(dt, sc.t);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
      if (sc.draw) sc.draw(ctx, dt, sc.t);
      F.post && F.post(ctx, dt);
    }

    // hover
    if (!F.inputLocked && mouse.inside && sc && !F.ui.modal) {
      const h = hitTest(mouse.x, mouse.y);
      if (h !== F.hover) {
        F.hover = h;
        cvs.style.cursor = h ? 'pointer' : 'default';
        if (h) F.audio && F.audio.hover();
      }
    } else if (F.hover && (F.inputLocked || F.ui.modal)) {
      F.hover = null; cvs.style.cursor = 'default';
    }
    F.ui && F.ui.updateHover(dt);

    requestAnimationFrame(frame);
  }
  F.startLoop = () => requestAnimationFrame((n) => { last = n; frame(n); });
})(window.F);
