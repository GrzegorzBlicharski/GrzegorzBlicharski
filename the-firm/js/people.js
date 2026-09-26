/* THE FIRM — character renderer.
   Painted-noir figures: two-tone cel lighting driven by the scene's key / ambient / rim light.
   Local units: figure 1000 units tall, feet at y=0, head top at y=-1000. */
(function (F) {
  'use strict';
  const U = F.U;
  const P = {};
  F.people = P;

  const EXPR = {
    neutral:      { brow: 0, inner: 0, lid: 0.82, mouth: 0, open: 0, asym: 0 },
    amused:       { brow: 0.08, inner: 0, lid: 0.7, mouth: 0.3, open: 0, asym: 0.5 },
    impatient:    { brow: -0.25, inner: -0.2, lid: 0.66, mouth: -0.12, open: 0, asym: 0 },
    angry:        { brow: -0.45, inner: -0.7, lid: 0.72, mouth: -0.3, open: 0.1, asym: 0 },
    suspicious:   { brow: -0.2, inner: -0.2, lid: 0.52, mouth: -0.05, open: 0, asym: -0.6 },
    impressed:    { brow: 0.35, inner: 0.1, lid: 0.95, mouth: 0.14, open: 0, asym: 0.2 },
    disappointed: { brow: 0.1, inner: 0.45, lid: 0.6, mouth: -0.28, open: 0, asym: 0 },
    tired:        { brow: 0.05, inner: 0.3, lid: 0.45, mouth: -0.1, open: 0, asym: 0 },
    pressure:     { brow: -0.1, inner: 0.35, lid: 0.9, mouth: -0.18, open: 0.05, asym: 0 },
    smile:        { brow: 0.1, inner: 0.05, lid: 0.7, mouth: 0.5, open: 0, asym: 0.1 },
    cold:         { brow: -0.12, inner: -0.05, lid: 0.62, mouth: -0.04, open: 0, asym: 0 },
  };
  P.EXPR = EXPR;

  const DEFAULT_LIGHT = { key: [255, 226, 190], keyA: 0.95, dir: -1, amb: [62, 70, 88], rim: [150, 185, 255], rimA: 0.7, rimSide: 1 };

  function shade(c, L, lit, boost) {
    const k = lit ? L.keyA * (boost || 1) : 0;
    return [
      U.clamp(c[0] * (L.amb[0] / 255 + (L.key[0] / 255) * k), 0, 255),
      U.clamp(c[1] * (L.amb[1] / 255 + (L.key[1] / 255) * k), 0, 255),
      U.clamp(c[2] * (L.amb[2] / 255 + (L.key[2] / 255) * k), 0, 255),
    ];
  }
  const css = (c, a) => U.rgba(c, a == null ? 1 : a);
  // skin keeps warmth in shadow (subsurface scattering cheat)
  function shadeSkin(c, L, lit, boost) {
    const b = shade(c, L, lit, boost);
    const w = lit ? 0.05 : 0.16;
    return [U.clamp(b[0] + c[0] * w, 0, 255), U.clamp(b[1] + c[1] * w * 0.45, 0, 255), U.clamp(b[2] + c[2] * w * 0.3, 0, 255)];
  }

  // smooth limb outline from polyline points with widths
  function limb(g, pts) {
    const L = [], R = [];
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
      let dx = b.x - a.x, dy = b.y - a.y;
      const len = Math.hypot(dx, dy) || 1;
      dx /= len; dy /= len;
      L.push([p.x - dy * p.w, p.y + dx * p.w]);
      R.push([p.x + dy * p.w, p.y - dx * p.w]);
    }
    g.beginPath();
    g.moveTo(L[0][0], L[0][1]);
    for (let i = 1; i < L.length; i++) {
      const m = [(L[i - 1][0] + L[i][0]) / 2, (L[i - 1][1] + L[i][1]) / 2];
      g.quadraticCurveTo(L[i - 1][0], L[i - 1][1], m[0], m[1]);
    }
    g.lineTo(L[L.length - 1][0], L[L.length - 1][1]);
    const e = pts[pts.length - 1];
    g.arc(e.x, e.y, e.w, Math.atan2(L[L.length - 1][1] - e.y, L[L.length - 1][0] - e.x), Math.atan2(R[R.length - 1][1] - e.y, R[R.length - 1][0] - e.x), true);
    for (let i = R.length - 1; i > 0; i--) {
      const m = [(R[i - 1][0] + R[i][0]) / 2, (R[i - 1][1] + R[i][1]) / 2];
      g.quadraticCurveTo(R[i][0], R[i][1], m[0], m[1]);
    }
    g.lineTo(R[0][0], R[0][1]);
    g.closePath();
  }

  // ---------------------------------------------------------------- arms per pose
  function armPose(pose, s, side) {
    // side: -1 screen-left arm, +1 screen-right arm. returns points and hand info
    const sh = { x: side * (s - 14), y: -800 };
    let el, wr, hand = 'hang', front = true;
    switch (pose) {
      case 'pockets':
        el = { x: side * (s + 10), y: -640 }; wr = { x: side * (s - 30), y: -500 }; hand = 'none'; break;
      case 'crossed':
        if (side < 0) { el = { x: -(s + 4), y: -632 }; wr = { x: s * 0.62, y: -676 }; hand = 'tuck'; front = true; }
        else { el = { x: s - 4, y: -636 }; wr = { x: -s * 0.5, y: -655 }; hand = 'tuck'; front = true; }
        break;
      case 'coffee':
        if (side > 0) { el = { x: s + 8, y: -620 }; wr = { x: s * 0.42, y: -690 }; hand = 'cup'; front = true; }
        else { el = { x: -s - 6, y: -640 }; wr = { x: -s + 6, y: -470 }; }
        break;
      case 'gesture':
        if (side > 0) { el = { x: s + 14, y: -625 }; wr = { x: s * 0.95 + 18, y: -735 }; hand = 'open'; front = true; }
        else { el = { x: -s - 10, y: -640 }; wr = { x: -s + 30, y: -500 }; hand = 'none'; }
        break;
      case 'phone':
        if (side > 0) { el = { x: s + 20, y: -720 }; wr = { x: s * 0.45, y: -905 }; hand = 'phone'; front = true; }
        else { el = { x: -s - 6, y: -640 }; wr = { x: -s + 6, y: -470 }; }
        break;
      case 'hips':
        el = { x: side * (s + 55), y: -650 }; wr = { x: side * (s - 8), y: -540 }; hand = 'fist'; break;
      case 'desk':
        el = { x: side * (s + 4), y: -610 }; wr = { x: side * s * 0.5, y: -548 }; hand = 'flat'; front = true; break;
      case 'steeple':
        el = { x: side * (s + 6), y: -600 }; wr = { x: side * 16, y: -660 }; hand = 'steeple'; front = true; break;
      case 'behind':
        el = { x: side * (s + 2), y: -645 }; wr = { x: side * (s - 36), y: -500 }; hand = 'none'; front = false; break;
      default:
        el = { x: side * (s + 6), y: -640 }; wr = { x: side * (s - 2), y: -470 };
    }
    return { sh, el, wr, hand, front };
  }

  // ---------------------------------------------------------------- head geometry
  function facePath(g, fem, t, jawW) {
    // head-local coordinates: centre (0,0), top -62, chin +64
    const n = 1 - 0.14 * Math.max(0, t), f = 1 - 0.14 * Math.max(0, -t); // shrink far side
    const jw = (fem ? 31 : 37) * (jawW || 1);
    const cw = fem ? 42 : 45;
    const off = t * 5;
    const R = (x) => off + x * n, Lx = (x) => off - x * f;
    g.beginPath();
    g.moveTo(off, -63);
    g.bezierCurveTo(R(30), -63, R(cw + 2), -42, R(cw + 1), -14);
    g.bezierCurveTo(R(cw), 8, R(jw + 6), 34, R(jw), 44);
    g.bezierCurveTo(R(jw - 8), 56, R(14), 64, off + t * 6, 65);
    g.bezierCurveTo(Lx(14), 64, Lx(jw - 8), 56, Lx(jw), 44);
    g.bezierCurveTo(Lx(jw + 6), 34, Lx(cw), 8, Lx(cw + 1), -14);
    g.bezierCurveTo(Lx(cw + 2), -42, Lx(30), -63, off, -63);
    g.closePath();
  }

  function hairPath(g, style, fem, t, back) {
    const o = t * 4;
    g.beginPath();
    switch (style) {
      case 'bob': // chin-length bob with side-swept fringe
        g.moveTo(o - 52, 52);
        g.bezierCurveTo(o - 62, 10, o - 62, -58, o - 8, -74);
        g.bezierCurveTo(o + 46, -80, o + 64, -40, o + 60, 8);
        g.bezierCurveTo(o + 58, 34, o + 58, 48, o + 50, 56);
        g.lineTo(o + 36, 50);
        if (!back) {
          g.bezierCurveTo(o + 44, 20, o + 44, -8, o + 38, -26);
          g.bezierCurveTo(o + 16, -36, o - 14, -30, o - 38, -12);
          g.bezierCurveTo(o - 42, 10, o - 40, 36, o - 38, 52);
        }
        g.closePath();
        break;
      case 'bun':
        g.moveTo(o - 47, 0);
        g.bezierCurveTo(o - 52, -52, o - 20, -72, o + 4, -71);
        g.bezierCurveTo(o + 40, -70, o + 54, -44, o + 48, 0);
        if (!back) {
          g.bezierCurveTo(o + 44, -18, o + 38, -34, o + 26, -40);
          g.bezierCurveTo(o + 8, -44, o - 14, -44, o - 30, -38);
          g.bezierCurveTo(o - 42, -30, o - 45, -14, o - 47, 0);
        } else { g.bezierCurveTo(o + 40, 40, o - 40, 40, o - 47, 0); }
        g.closePath();
        // bun behind
        g.moveTo(o - t * 40 + 20, -58);
        g.ellipse(o - t * 44, -62, 22, 18, 0, 0, U.TAU);
        break;
      case 'long': // shoulder-length, side part, forehead visible
        g.moveTo(o - 50, 110);
        g.bezierCurveTo(o - 66, 40, o - 66, -62, o - 6, -76);
        g.bezierCurveTo(o + 54, -80, o + 68, -30, o + 60, 30);
        g.bezierCurveTo(o + 58, 70, o + 66, 96, o + 56, 116);
        g.lineTo(o + 40, 100);
        if (!back) {
          g.bezierCurveTo(o + 47, 52, o + 48, -4, o + 41, -28);
          g.bezierCurveTo(o + 30, -50, o + 8, -60, o - 12, -56);
          g.bezierCurveTo(o - 30, -46, o - 42, -30, o - 45, -8);
          g.bezierCurveTo(o - 47, 32, o - 44, 72, o - 38, 104);
        }
        g.closePath();
        break;
      case 'pony': // pulled back, side part, low ponytail
        g.moveTo(o - 48, 4);
        g.bezierCurveTo(o - 54, -52, o - 22, -76, o + 6, -74);
        g.bezierCurveTo(o + 42, -72, o + 56, -44, o + 49, 6);
        if (!back) {
          g.bezierCurveTo(o + 46, -18, o + 40, -34, o + 26, -42);
          g.bezierCurveTo(o + 10, -48, o - 8, -48, o - 20, -52);
          g.bezierCurveTo(o - 34, -44, o - 44, -26, o - 48, 4);
        } else { g.bezierCurveTo(o + 44, 46, o - 44, 46, o - 48, 4); }
        g.closePath();
        break;
      case 'slick': // swept back, older gentleman
        g.moveTo(o - 47, 8);
        g.bezierCurveTo(o - 52, -46, o - 24, -70, o + 6, -70);
        g.bezierCurveTo(o + 40, -69, o + 54, -40, o + 48, 8);
        if (!back) {
          g.bezierCurveTo(o + 46, -12, o + 42, -30, o + 30, -40);
          g.bezierCurveTo(o + 10, -48, o - 16, -48, o - 32, -40);
          g.bezierCurveTo(o - 42, -30, o - 45, -12, o - 47, 8);
        } else { g.bezierCurveTo(o + 44, 46, o - 44, 46, o - 47, 8); }
        g.closePath();
        break;
      case 'receding':
        g.moveTo(o - 47, 6);
        g.bezierCurveTo(o - 50, -40, o - 30, -66, o + 4, -66);
        g.bezierCurveTo(o + 38, -66, o + 52, -40, o + 48, 6);
        if (!back) {
          g.bezierCurveTo(o + 46, -18, o + 44, -34, o + 36, -44);
          g.bezierCurveTo(o + 20, -52, o + 12, -58, o + 4, -58);
          g.bezierCurveTo(o - 6, -58, o - 20, -52, o - 36, -44);
          g.bezierCurveTo(o - 44, -34, o - 46, -18, o - 47, 6);
        } else { g.bezierCurveTo(o + 44, 44, o - 44, 44, o - 47, 6); }
        g.closePath();
        break;
      case 'crop': // short textured top, slightly messy
        g.moveTo(o - 47, 0);
        g.bezierCurveTo(o - 54, -50, o - 30, -80, o + 2, -78);
        g.bezierCurveTo(o + 20, -84, o + 58, -60, o + 49, 0);
        if (!back) {
          g.bezierCurveTo(o + 46, -24, o + 42, -34, o + 30, -38);
          g.lineTo(o + 18, -46); g.lineTo(o + 8, -40); g.lineTo(o - 4, -48); g.lineTo(o - 16, -41);
          g.bezierCurveTo(o - 30, -40, o - 44, -30, o - 47, 0);
        } else { g.bezierCurveTo(o + 44, 44, o - 44, 44, o - 47, 0); }
        g.closePath();
        break;
      case 'side': // classic side part
      default:
        g.moveTo(o - 47, 4);
        g.bezierCurveTo(o - 54, -48, o - 26, -74, o + 4, -73);
        g.bezierCurveTo(o + 40, -72, o + 56, -44, o + 49, 4);
        if (!back) {
          g.bezierCurveTo(o + 46, -18, o + 42, -32, o + 34, -40);
          g.bezierCurveTo(o + 16, -50, o - 6, -46, o - 18, -52);
          g.bezierCurveTo(o - 34, -44, o - 44, -28, o - 47, 4);
        } else { g.bezierCurveTo(o + 44, 46, o - 44, 46, o - 47, 4); }
        g.closePath();
    }
  }

  // ---------------------------------------------------------------- main render into local units
  function paint(g, c, o, L) {
    const fem = c.sex === 'f';
    const s = (fem ? 98 : 116) * (c.build || 1);
    const waist = (fem ? 72 : 90) * (c.build || 1);
    const hip = (fem ? 92 : 92) * (c.build || 1);
    const t = o.back ? 0 : U.clamp(o.turn || 0, -1, 1);
    const pose = o.pose || 'stand';
    const dir = L.dir; // key light side (-1 left, +1 right)
    const bust = o.crop === 'bust';
    const E = Object.assign({}, EXPR[o.expr || 'neutral'] || EXPR.neutral);
    const blink = o.blink ? 0.05 : 1;

    const suitC = c.suit || [40, 42, 48];
    const shirtC = c.shirt || [225, 225, 228];
    const skinC = c.skin || [214, 170, 140];
    const hairC = c.hair || [40, 30, 24];
    const trouC = c.trousers || suitC;
    const outfit = c.outfit || 'suit';

    const litSide = (x) => (dir < 0 ? x < 0 : x > 0);

    // ---------- legs
    if (!bust) {
      const legTop = fem && c.skirt ? -470 : -480;
      const legs = [-1, 1];
      legs.forEach((side) => {
        const lit = side === dir;
        const stance = pose === 'hips' ? 40 : 26;
        if (fem && c.skirt) {
          g.fillStyle = css(shade(c.stockings || [60, 50, 50], L, lit));
          limb(g, [{ x: side * 32, y: -330, w: 22 }, { x: side * (stance + 4), y: -170, w: 17 }, { x: side * (stance + 2), y: -30, w: 11 }]);
          g.fill();
        } else {
          g.fillStyle = css(shade(trouC, L, lit, 0.85));
          limb(g, [{ x: side * 38, y: legTop, w: 44 }, { x: side * (stance + 16), y: -250, w: 34 }, { x: side * (stance + 12), y: -40, w: 27 }]);
          g.fill();
          // crease highlight
          g.strokeStyle = css(shade(trouC, L, true, 1.3), lit ? 0.35 : 0.1);
          g.lineWidth = 2;
          g.beginPath(); g.moveTo(side * 40, legTop + 30); g.lineTo(side * (stance + 12), -44); g.stroke();
        }
        // shoes
        g.fillStyle = css(shade(c.shoes || [22, 18, 16], L, lit));
        g.beginPath();
        g.ellipse(side * (stance + 16) + side * 6, -12, fem ? 26 : 34, 14, 0, 0, U.TAU);
        g.fill();
        g.fillStyle = css([255, 255, 255], lit ? 0.18 : 0.06);
        g.beginPath(); g.ellipse(side * (stance + 20), -20, 12, 3, 0, 0, U.TAU); g.fill();
      });
      if (fem && c.skirt) {
        g.fillStyle = css(shade(trouC, L, false));
        g.beginPath();
        g.moveTo(-hip, -500); g.lineTo(hip, -500); g.lineTo(hip - 10, -300); g.lineTo(-hip + 10, -300); g.closePath(); g.fill();
        g.fillStyle = css(shade(trouC, L, true), 0.9);
        g.beginPath(); g.moveTo(dir * hip, -500); g.lineTo(0, -500); g.lineTo(0, -300); g.lineTo(dir * (hip - 10), -300); g.closePath(); g.fill();
      }
    }

    const bpose = o.back && (pose === 'crossed' || pose === 'steeple' || pose === 'desk') ? 'behind' : pose;
    const arms = [armPose(bpose, s, -1), armPose(bpose, s, 1)];
    const sleeveW = (fem ? 26 : 32) * (c.build || 1);
    const sleeveC = outfit === 'shirt' ? shirtC : suitC;

    function drawArm(a, side) {
      const lit = side === dir;
      const pts = [
        { x: a.sh.x, y: a.sh.y, w: sleeveW + 1 },
        { x: a.el.x, y: a.el.y, w: sleeveW },
        { x: a.wr.x, y: a.wr.y, w: sleeveW * 0.8 },
      ];
      if (outfit === 'shirt') {
        // rolled sleeves: forearm skin
        const mid = { x: U.lerp(a.el.x, a.wr.x, 0.18), y: U.lerp(a.el.y, a.wr.y, 0.18) };
        g.fillStyle = css(shadeSkin(skinC, L, lit));
        limb(g, [{ x: mid.x, y: mid.y, w: sleeveW * 0.72 }, { x: a.wr.x, y: a.wr.y, w: sleeveW * 0.55 }]);
        g.fill();
        g.fillStyle = css(shade(shirtC, L, lit, 0.9));
        limb(g, [pts[0], pts[1], { x: mid.x, y: mid.y, w: sleeveW * 0.95 }]);
        g.fill();
        g.strokeStyle = 'rgba(0,0,0,0.3)'; g.lineWidth = 2.5; g.stroke();
        g.fillStyle = css(shade(shirtC, L, lit, 1.05));
        limb(g, [{ x: U.lerp(a.el.x, mid.x, 0.3), y: U.lerp(a.el.y, mid.y, 0.3), w: sleeveW * 0.98 }, { x: mid.x, y: mid.y, w: sleeveW * 0.98 }]);
        g.fill();
      } else {
        g.fillStyle = css(shade(sleeveC, L, lit, 0.78));
        limb(g, pts);
        g.fill();
        g.strokeStyle = 'rgba(0,0,0,0.55)';
        g.lineWidth = 3;
        g.stroke();
        // sleeve fold highlight near elbow
        g.strokeStyle = css(shade(sleeveC, L, true, 1.3), lit ? 0.3 : 0.12);
        g.lineWidth = 2;
        g.beginPath(); g.moveTo(a.el.x - side * 8, a.el.y - 30); g.quadraticCurveTo(a.el.x + side * 6, a.el.y, a.el.x - side * 4, a.el.y + 30); g.stroke();
        // shirt cuff
        if (a.hand !== 'none' && a.hand !== 'tuck') {
          const dx = a.wr.x - a.el.x, dy = a.wr.y - a.el.y, ln = Math.hypot(dx, dy);
          const cx = a.wr.x + (dx / ln) * 10, cy = a.wr.y + (dy / ln) * 10;
          g.fillStyle = css(shade(shirtC, L, lit));
          g.beginPath(); g.arc(cx, cy, sleeveW * 0.62, 0, U.TAU); g.fill();
        }
      }
      // hand
      const dx = a.wr.x - a.el.x, dy = a.wr.y - a.el.y, ln = Math.hypot(dx, dy) || 1;
      const hx = a.wr.x + (dx / ln) * 26, hy = a.wr.y + (dy / ln) * 26;
      g.fillStyle = css(shadeSkin(skinC, L, lit));
      if (a.hand === 'hang' || a.hand === 'fist' || a.hand === 'flat') {
        g.beginPath(); g.ellipse(hx, hy + 2, 14, 23, Math.atan2(dy, dx) - Math.PI / 2, 0, U.TAU); g.fill();
        g.fillStyle = 'rgba(0,0,0,0.25)'; g.beginPath(); g.ellipse(hx - side * 5, hy + 4, 6, 18, Math.atan2(dy, dx) - Math.PI / 2, 0, U.TAU); g.fill();
      } else if (a.hand === 'open') {
        g.beginPath(); g.ellipse(hx + side * 4, hy - 8, 16, 26, -0.5 * side, 0, U.TAU); g.fill();
        g.fillStyle = css(shadeSkin(skinC, L, false));
        g.beginPath(); g.ellipse(hx + side * 8, hy - 2, 7, 14, -0.5 * side, 0, U.TAU); g.fill();
      } else if (a.hand === 'cup') {
        g.beginPath(); g.ellipse(hx - side * 4, hy, 18, 20, 0, 0, U.TAU); g.fill();
        // paper cup
        g.fillStyle = css(shade([235, 232, 225], L, lit));
        g.beginPath(); g.moveTo(hx - 20, hy - 44); g.lineTo(hx + 20, hy - 44); g.lineTo(hx + 15, hy + 10); g.lineTo(hx - 15, hy + 10); g.closePath(); g.fill();
        g.fillStyle = css(shade([60, 40, 30], L, lit));
        g.fillRect(hx - 18, hy - 28, 36, 16);
        g.fillStyle = css(shadeSkin(skinC, L, lit));
        g.beginPath(); g.ellipse(hx - side * 12, hy - 8, 12, 18, 0, 0, U.TAU); g.fill();
      } else if (a.hand === 'phone') {
        g.fillStyle = css([18, 18, 22]);
        g.fillRect(hx - 10, hy - 34, 18, 56);
        g.fillStyle = css(shadeSkin(skinC, L, lit));
        g.beginPath(); g.ellipse(hx + 2, hy + 6, 16, 22, 0, 0, U.TAU); g.fill();
      } else if (a.hand === 'steeple') {
        g.beginPath(); g.ellipse(hx - side * 2, hy - 16, 13, 30, side * 0.25, 0, U.TAU); g.fill();
      }
    }

    // arms behind torso
    arms.forEach((a, i) => { if (!a.front) drawArm(a, i === 0 ? -1 : 1); });
    const frontArms = () => {
      // crossed: draw lower arm first
      const order = pose === 'crossed' ? [0, 1] : [0, 1];
      order.forEach((i) => { const a = arms[i]; if (a.front) drawArm(a, i === 0 ? -1 : 1); });
    };

    // ---------- torso
    const bt = t * 10; // body turn offset
    const hem = outfit === 'overcoat' ? -250 : fem ? -470 : -445;
    const neckY = -848;
    function torsoPath() {
      g.beginPath();
      g.moveTo(-32 + bt, neckY);
      g.bezierCurveTo(-60, neckY + 6, -s + 10, -842, -s, -822);
      g.bezierCurveTo(-s - 8, -790, -s + 4, -720, -waist - 2, -620);
      g.bezierCurveTo(-waist - 6, -560, -hip - 4, -500, -hip - (outfit === 'overcoat' ? 22 : 2), hem);
      g.lineTo(hip + (outfit === 'overcoat' ? 22 : 2), hem);
      g.bezierCurveTo(hip + 4, -500, waist + 6, -560, waist + 2, -620);
      g.bezierCurveTo(s - 4, -720, s + 8, -790, s, -822);
      g.bezierCurveTo(s - 10, -842, 60, neckY + 6, 32 + bt, neckY);
      g.closePath();
    }
    const topC = outfit === 'shirt' ? shirtC : outfit === 'turtleneck' ? c.shirt : suitC;
    // shadow side base
    g.save();
    torsoPath();
    g.fillStyle = css(shade(topC, L, false));
    g.fill();
    g.clip();
    // lit plane: soft-edged half toward key
    const lx = dir * 10 + bt;
    const gr = g.createLinearGradient(lx - 80, 0, lx + 80, 0);
    const litC = css(shade(topC, L, true, 0.95));
    if (dir < 0) { gr.addColorStop(0, litC); gr.addColorStop(1, css(shade(topC, L, true, 0.95), 0)); }
    else { gr.addColorStop(0, css(shade(topC, L, true, 0.95), 0)); gr.addColorStop(1, litC); }
    g.fillStyle = gr;
    g.fillRect(dir < 0 ? -300 : lx - 80, -900, dir < 0 ? lx + 80 + 300 : 400, 900);
    // chest roundness highlight
    g.fillStyle = css(shade(topC, L, true, 1.25), 0.25);
    g.beginPath(); g.ellipse(dir * s * 0.45 + bt, -760, s * 0.35, 60, 0, 0, U.TAU); g.fill();

    if (o.back) {
      // back view: centre seam, vent, shoulder blades
      g.strokeStyle = 'rgba(0,0,0,0.4)'; g.lineWidth = 2.5;
      g.beginPath(); g.moveTo(bt, neckY + 6); g.lineTo(bt, hem); g.stroke();
      g.fillStyle = css(shade(topC, L, true, 1.1), 0.18);
      g.beginPath(); g.ellipse(dir * s * 0.45, -760, s * 0.3, 50, 0, 0, U.TAU); g.fill();
    } else if (outfit === 'suit' || outfit === 'overcoat' || outfit === 'blazer' || outfit === 'open') {
      // shirt V
      const vBottom = outfit === 'open' ? -600 : fem ? -660 : -620;
      const vW = fem ? 40 : 36;
      g.fillStyle = css(shade(shirtC, L, true, 0.9));
      g.beginPath();
      g.moveTo(-vW + bt, neckY - 2); g.lineTo(vW + bt, neckY - 2); g.lineTo(bt + 2, vBottom); g.closePath(); g.fill();
      // shirt shadow side
      g.fillStyle = css(shade(shirtC, L, false), 0.85);
      g.beginPath();
      if (dir < 0) { g.moveTo(bt + 2, neckY - 2); g.lineTo(vW + bt, neckY - 2); g.lineTo(bt + 2, vBottom); }
      else { g.moveTo(bt + 2, neckY - 2); g.lineTo(-vW + bt, neckY - 2); g.lineTo(bt + 2, vBottom); }
      g.closePath(); g.fill();
      // tie
      if (c.tie) {
        g.fillStyle = css(shade(c.tie, L, true, 0.8));
        g.beginPath();
        g.moveTo(bt - 7, neckY + 12); g.lineTo(bt + 9, neckY + 12); g.lineTo(bt + 13, vBottom + 30); g.lineTo(bt + 1, vBottom + 44); g.lineTo(bt - 11, vBottom + 30); g.closePath(); g.fill();
        g.fillStyle = css(shade(c.tie, L, true, 1.0));
        g.beginPath(); g.moveTo(bt - 8, neckY - 1); g.lineTo(bt + 10, neckY - 1); g.lineTo(bt + 7, neckY + 14); g.lineTo(bt - 5, neckY + 14); g.closePath(); g.fill();
        g.fillStyle = css(shade(c.tie, L, false), 0.6);
        g.fillRect(bt + (dir < 0 ? 1 : -11), neckY + 14, 10, vBottom - neckY + 20);
      }
      // waistcoat
      if (c.waistcoat) {
        g.fillStyle = css(shade(suitC, L, false, 1), 1);
        g.beginPath(); g.moveTo(bt - 30, vBottom - 60); g.lineTo(bt, vBottom + 10); g.lineTo(bt + 30, vBottom - 60); g.lineTo(bt + 26, -540); g.lineTo(bt - 26, -540); g.closePath(); g.fill();
        g.fillStyle = 'rgba(255,255,255,0.25)';
        for (let k = 0; k < 3; k++) { g.beginPath(); g.arc(bt + 1, vBottom + 30 + k * 28, 2.5, 0, U.TAU); g.fill(); }
      }
      // lapels
      const lapC = shade(topC, L, true, 1.1), lapD = shade(topC, L, false, 1);
      [-1, 1].forEach((side) => {
        const lit = side === dir;
        g.fillStyle = css(lit ? lapC : lapD);
        g.beginPath();
        g.moveTo(side * (vW + 4) + bt, neckY - 6);
        g.lineTo(side * (vW + 30) + bt, neckY + 26);
        g.lineTo(side * (vW + 44) + bt, -760);   // notch
        g.lineTo(side * (vW + 30) + bt, -752);
        g.lineTo(bt + side * 4, vBottom + 6);
        g.lineTo(side * (vW - 6) + bt, neckY + 6);
        g.closePath();
        g.fill();
        g.strokeStyle = css([0, 0, 0], 0.35);
        g.lineWidth = 2;
        g.beginPath(); g.moveTo(side * (vW + 30) + bt, -752); g.lineTo(bt + side * 4, vBottom + 6); g.stroke();
      });
      if (outfit !== 'open') {
        // front edge + button
        g.strokeStyle = css([0, 0, 0], 0.45);
        g.lineWidth = 2.5;
        g.beginPath(); g.moveTo(bt + 4, vBottom + 6); g.lineTo(bt - 2, -540); g.quadraticCurveTo(bt - 10, hem + 20, bt - 40, hem); g.stroke();
        g.fillStyle = css(shade([30, 28, 26], L, true));
        g.beginPath(); g.arc(bt + 2, vBottom + 40, 4.5, 0, U.TAU); g.fill();
        if (outfit === 'overcoat') { g.beginPath(); g.arc(bt + 2, -470, 4.5, 0, U.TAU); g.fill(); g.beginPath(); g.arc(bt + 2, -380, 4.5, 0, U.TAU); g.fill(); }
      } else {
        g.fillStyle = css(shade(shirtC, L, true, 0.85));
        g.beginPath(); g.moveTo(bt - 4, vBottom); g.lineTo(bt + 8, vBottom); g.lineTo(bt + 26, hem); g.lineTo(bt - 22, hem); g.closePath(); g.fill();
        g.fillStyle = css(shade(shirtC, L, false), 0.7);
        g.beginPath(); g.moveTo(bt + 2, vBottom); g.lineTo(bt + 2, hem); g.lineTo(bt + (dir < 0 ? 26 : -22), hem); g.closePath(); g.fill();
      }
      // breast pocket + square
      const ps = -dir * 0 + (dir < 0 ? -1 : -1);
      g.strokeStyle = css([0, 0, 0], 0.3);
      g.beginPath(); g.moveTo(-s * 0.62 + bt, -720); g.lineTo(-s * 0.3 + bt, -724); g.stroke();
      if (c.pocketSquare) {
        g.fillStyle = css(shade(c.pocketSquare, L, dir < 0));
        g.beginPath(); g.moveTo(-s * 0.58 + bt, -722); g.lineTo(-s * 0.5 + bt, -738); g.lineTo(-s * 0.42 + bt, -730); g.lineTo(-s * 0.34 + bt, -740); g.lineTo(-s * 0.32 + bt, -723); g.closePath(); g.fill();
      }
      if (c.pin) { g.fillStyle = css(c.pin); g.beginPath(); g.arc(s * 0.5 + bt, -770, 5, 0, U.TAU); g.fill(); }
      // hip pockets flaps
      g.strokeStyle = css([0, 0, 0], 0.28);
      g.beginPath(); g.moveTo(-waist * 0.95 + bt, -520); g.lineTo(-waist * 0.4 + bt, -518); g.stroke();
      g.beginPath(); g.moveTo(waist * 0.4 + bt, -518); g.lineTo(waist * 0.95 + bt, -520); g.stroke();
    } else if (outfit === 'shirt' && !o.back) {
      // placket, loosened tie, collar
      g.strokeStyle = css([0, 0, 0], 0.18);
      g.lineWidth = 2;
      g.beginPath(); g.moveTo(bt, neckY + 10); g.lineTo(bt - 2, hem); g.stroke();
      for (let k = 0; k < 5; k++) { g.fillStyle = 'rgba(255,255,255,0.35)'; g.beginPath(); g.arc(bt, -780 + k * 60, 2.2, 0, U.TAU); g.fill(); }
      if (c.tie) {
        g.fillStyle = css(shade(c.tie, L, true, 0.85));
        g.beginPath(); g.moveTo(bt - 9, neckY + 34); g.lineTo(bt + 9, neckY + 34); g.lineTo(bt + 14, -620); g.lineTo(bt + 2, -600); g.lineTo(bt - 10, -620); g.closePath(); g.fill();
        g.beginPath(); g.moveTo(bt - 10, neckY + 20); g.lineTo(bt + 10, neckY + 20); g.lineTo(bt + 7, neckY + 38); g.lineTo(bt - 7, neckY + 38); g.closePath(); g.fill();
      }
      // folds
      g.strokeStyle = css([0, 0, 0], 0.12);
      g.lineWidth = 3;
      g.beginPath(); g.moveTo(-waist + 10, -600); g.quadraticCurveTo(-30, -560, -20, -490); g.stroke();
      g.beginPath(); g.moveTo(waist - 10, -610); g.quadraticCurveTo(30, -570, 30, -490); g.stroke();
      // belt
      g.fillStyle = css(shade([30, 24, 20], L, false));
      g.fillRect(-hip, hem - 6, hip * 2, 18);
    } else if (outfit === 'turtleneck') {
      g.fillStyle = css(shade(c.shirt, L, false), 0.4);
      g.fillRect(-40 + bt, neckY - 10, 80, 30);
    }
    g.restore();

    // collar for shirt
    if (!o.back && (outfit === 'suit' || outfit === 'shirt' || outfit === 'blazer' || outfit === 'overcoat' || outfit === 'open')) {
      const open = outfit === 'open' || (outfit === 'shirt' && !c.tie) || (fem && !c.tie);
      [-1, 1].forEach((side) => {
        g.fillStyle = css(shade(shirtC, L, side === dir, 1.05));
        g.beginPath();
        g.moveTo(side * 30 + bt, neckY - 18);
        g.lineTo(side * (open ? 44 : 38) + bt, neckY + 14);
        g.lineTo(side * (open ? 16 : 6) + bt, neckY + (open ? 26 : 16));
        g.lineTo(side * 18 + bt, neckY - 8);
        g.closePath();
        g.fill();
      });
    }

    frontArms();

    // ---------- neck
    const hx = t * 6, hy = -937;
    const neckW = fem ? 19 : 24;
    g.fillStyle = css(shadeSkin(skinC, L, false));
    g.beginPath();
    g.moveTo(hx - neckW, hy + 30);
    g.bezierCurveTo(hx - neckW + 2, hy + 60, -neckW - 4 + bt, neckY - 10, -neckW - 10 + bt, neckY + 8);
    g.lineTo(neckW + 10 + bt, neckY + 8);
    g.bezierCurveTo(neckW + 4 + bt, neckY - 10, hx + neckW - 2, hy + 60, hx + neckW, hy + 30);
    g.closePath(); g.fill();
    // lit side of neck (soft)
    g.save();
    g.clip();
    g.filter = `blur(${Math.max(0.5, (o.res || 1) * 4)}px)`;
    g.fillStyle = css(shadeSkin(skinC, L, true, 0.75), 0.8);
    g.fillRect(dir < 0 ? hx - neckW - 10 : hx + 2, hy + 40, neckW, 80);
    // cast shadow of jaw
    g.fillStyle = 'rgba(20,8,6,0.45)';
    g.beginPath(); g.ellipse(hx + t * 8, hy + 62, neckW + 14, 18, 0, 0, U.TAU); g.fill();
    g.filter = 'none';
    g.restore();
    // sternocleidomastoid hint
    g.strokeStyle = css(shadeSkin(skinC, L, false), 0.5);
    g.lineWidth = 1.5;
    g.beginPath(); g.moveTo(hx - dir * (neckW - 6), hy + 60); g.quadraticCurveTo(hx - dir * 6, hy + 80, bt - dir * 4, neckY + 2); g.stroke();
    if (outfit === 'turtleneck') {
      g.fillStyle = css(shade(c.shirt, L, false));
      G.roundRectFill(g, -neckW - 10 + bt, neckY - 46, (neckW + 10) * 2, 58, 14);
      g.fillStyle = css(shade(c.shirt, L, true), 0.7);
      g.fillRect(dir < 0 ? -neckW - 10 + bt : bt, neckY - 46, neckW + 10, 58);
      g.strokeStyle = 'rgba(0,0,0,0.3)'; g.lineWidth = 1.5;
      for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(-neckW - 8 + bt, neckY - 34 + k * 14); g.lineTo(neckW + 8 + bt, neckY - 34 + k * 14); g.stroke(); }
    }

    // ---------- head
    g.save();
    g.translate(hx, hy);
    g.rotate((o.tilt || 0) + (c.tilt || 0));
    const hairStyle = c.hairStyle || 'side';
    const back = o.back;

    // ponytail behind the head, on the side turned away
    if (hairStyle === 'pony') {
      const tx = -t * 58 - (t >= 0 ? 12 : -12);
      g.fillStyle = css(shade(hairC, L, false, 1));
      g.beginPath();
      g.moveTo(tx - 14, 10);
      g.bezierCurveTo(tx - 26, 60, tx - 18, 120, tx - 4, 170);
      g.bezierCurveTo(tx + 12, 120, tx + 18, 60, tx + 12, 8);
      g.closePath(); g.fill();
      g.fillStyle = css(shade(hairC, L, true, 1.2), 0.35);
      g.beginPath(); g.ellipse(tx - 2, 60, 5, 40, 0.1, 0, U.TAU); g.fill();
    }
    // hair behind (long styles)
    if (hairStyle === 'bob' || hairStyle === 'long') {
      g.fillStyle = css(shade(hairC, L, false, 1));
      hairPath(g, hairStyle, fem, t, true);
      g.fill();
    }
    // ears
    if (!(hairStyle === 'bob' || hairStyle === 'long')) {
      [-1, 1].forEach((side) => {
        const far = (side > 0 && t > 0.2) || (side < 0 && t < -0.2);
        const ex = side * (fem ? 43 : 46) * (1 - 0.14 * Math.max(0, side * t)) + t * 5;
        g.fillStyle = css(shadeSkin(skinC, L, side === dir, 0.9));
        g.beginPath(); g.ellipse(ex + side * (far ? -2 : 3), 8, far ? 6 : 9, 16, side * 0.15, 0, U.TAU); g.fill();
        g.fillStyle = css(shadeSkin(skinC, L, false), 0.6);
        g.beginPath(); g.ellipse(ex + side * 3, 10, 3, 9, 0, 0, U.TAU); g.fill();
      });
    }

    // face base (shadow tone)
    const jawW = c.jaw || 1;
    facePath(g, fem, t, jawW);
    g.fillStyle = css(shadeSkin(skinC, L, false, 1));
    g.fill();

    if (!back) {
      g.save();
      facePath(g, fem, t, jawW);
      g.clip();
      // key light shape on face — soft-edged (blurred) lit mask with a Rembrandt patch on the shadow cheek
      const noseX = t * 16;
      const lit = css(shadeSkin(skinC, L, true, 1));
      const bl = Math.max(0.8, (o.res || 1) * 6);
      g.filter = `blur(${bl}px)`;
      // reflected fill on the shadow side (bounce light), keeps the face readable
      g.fillStyle = css(shadeSkin(skinC, L, true, 0.35), 0.8);
      g.beginPath(); g.ellipse(-dir * 18 + t * 10, 10, 30, 46, 0, 0, U.TAU); g.fill();
      g.fillStyle = lit;
      g.beginPath();
      const d = dir;
      g.moveTo(-d * 90, -90); g.lineTo(noseX + d * 3, -90);
      g.bezierCurveTo(noseX + d * 1, -40, noseX - d * 1, -12, noseX - d * 3, 22);
      g.bezierCurveTo(noseX - d * 2, 34, noseX - d * 10, 44, noseX - d * 10, 90);
      g.lineTo(-d * 90, 90);
      g.closePath();
      g.fill();
      // Rembrandt patch
      g.beginPath(); g.ellipse(noseX - d * 17, 17, 10, 8, -d * 0.35, 0, U.TAU); g.fill();
      // shadow side lower jaw shading & temple falloff
      g.fillStyle = css(shadeSkin(skinC, L, false), 0.55);
      g.beginPath(); g.ellipse(d * 50 + t * 4, 10, 10, 50, 0, 0, U.TAU); g.fill(); // lit-side edge falloff (turns away from light)
      g.fillStyle = css(shadeSkin(skinC, L, false, 0.5), 0.5);
      g.beginPath(); g.ellipse(t * 6, 70, 40, 12, 0, 0, U.TAU); g.fill(); // under chin
      // cheekbone shadow under the lit cheekbone
      g.fillStyle = css(shadeSkin(skinC, L, false), 0.25);
      g.beginPath(); g.ellipse(d * 32 + t * 6, 30, 7, 14, d * 0.5, 0, U.TAU); g.fill();
      // forehead / cheek highlights
      g.fillStyle = css(shadeSkin(skinC, L, true, 1.3), 0.35);
      g.beginPath(); g.ellipse(d * 14 + t * 8, -32, 16, 10, 0, 0, U.TAU); g.fill();
      g.beginPath(); g.ellipse(d * 24 + t * 10, 10, 8, 6, 0, 0, U.TAU); g.fill();
      // warm blush
      g.fillStyle = css([220, 100, 80], fem ? 0.1 : 0.06);
      g.beginPath(); g.ellipse(d * 26 + t * 10, 22, 13, 9, 0, 0, U.TAU); g.fill();
      g.beginPath(); g.ellipse(-d * 20 + t * 10, 22, 11, 8, 0, 0, U.TAU); g.fill();
      // hairline shadow on forehead
      g.fillStyle = 'rgba(20,10,8,0.35)';
      g.beginPath(); g.ellipse(t * 4, -58, 50, 14, 0, 0, U.TAU); g.fill();
      g.filter = 'none';

      // stubble / beard shadow
      if (c.stubble) {
        g.fillStyle = css(c.stubbleCol || [40, 38, 44], c.stubble);
        g.beginPath();
        g.moveTo(-44, 16); g.bezierCurveTo(-40, 40, -24, 70, t * 6, 70); g.bezierCurveTo(24, 70, 40, 40, 44, 16);
        g.bezierCurveTo(30, 34, 18, 26, t * 14 + 14, 30); g.lineTo(t * 14 - 14, 30);
        g.bezierCurveTo(-18, 26, -30, 34, -44, 16); g.closePath(); g.fill();
      }
      g.restore();

      // ---- features
      const detail = o.detail;
      const ex = t * 17; // feature centre shift
      const eyeY = 0;
      const eyeSep = fem ? 18 : 19.5;
      const lid = E.lid * blink;
      const featDark = css(shade(U.mix(skinC, [60, 30, 25], 0.7), L, false), 1);
      // eye sockets
      [-1, 1].forEach((side) => {
        const far = side * t > 0;
        const sx = ex + side * eyeSep * (far ? 1 - 0.25 * Math.abs(t) : 1);
        g.fillStyle = css(shadeSkin(skinC, L, false), side === dir ? 0.4 : 0.22);
        g.beginPath(); g.ellipse(sx, eyeY - 2, 13, 9, 0, 0, U.TAU); g.fill();
      });
      if (detail > 0.2) {
        // brows
        const browC = css(shade(c.brow || hairC, L, false), 0.95);
        g.strokeStyle = browC;
        g.lineCap = 'round';
        [-1, 1].forEach((side) => {
          const far = side * t > 0;
          const k = far ? 1 - 0.25 * Math.abs(t) : 1;
          const sx = ex + side * eyeSep * k;
          const asym = E.asym && side === 1 ? E.asym * -0.3 : 0;
          const lift = (E.brow + asym) * 8;
          const inner = E.inner * 6;
          g.lineWidth = fem ? 3.2 : 4.6;
          g.beginPath();
          g.moveTo(sx - side * 9 * k, eyeY - 13 - lift - inner);
          g.quadraticCurveTo(sx + side * 2 * k, eyeY - 18 - lift - inner * 0.3, sx + side * 13 * k, eyeY - 13 - lift + inner * 0.2);
          g.stroke();
        });
        // eyes
        [-1, 1].forEach((side) => {
          const far = side * t > 0;
          const k = far ? 1 - 0.3 * Math.abs(t) : 1;
          const sx = ex + side * eyeSep * k;
          const w = 8.5 * k, h = 4.2 * Math.max(0.12, lid);
          // white (muted, in shade)
          g.fillStyle = css(shade([200, 190, 182], L, side === dir, side === dir ? 0.75 : 0.35));
          g.beginPath(); g.ellipse(sx, eyeY, w, h, 0, 0, U.TAU); g.fill();
          // iris
          if (lid > 0.2) {
            const ix = sx + (o.lookX || 0) * 3 + t * 2, iy = eyeY + (o.lookY || 0) * 1.5;
            g.save();
            g.beginPath(); g.ellipse(sx, eyeY, w, h, 0, 0, U.TAU); g.clip();
            g.fillStyle = css(c.eyes || [70, 55, 40]);
            g.beginPath(); g.arc(ix, iy, 4.2, 0, U.TAU); g.fill();
            g.fillStyle = '#060606';
            g.beginPath(); g.arc(ix, iy, 2, 0, U.TAU); g.fill();
            g.restore();
            if (side === dir || Math.abs(t) < 0.3) { g.fillStyle = 'rgba(255,255,255,0.85)'; g.fillRect(ix + dir * 1.5 - 0.8, iy - 2, 1.6, 1.6); }
          }
          // upper lid line / lashes
          g.strokeStyle = featDark;
          g.lineWidth = fem ? 2.8 : 2.2;
          g.beginPath(); g.ellipse(sx, eyeY + 0.5, w + 0.5, h + 0.6, 0, Math.PI * 1.02, Math.PI * 1.98); g.stroke();
          // lid shadow on eyeball
          g.fillStyle = 'rgba(30,15,10,0.35)';
          g.beginPath(); g.ellipse(sx, eyeY - h * 0.6, w, h * 0.7, 0, 0, U.TAU); g.fill();
          // lid crease
          g.strokeStyle = css(shadeSkin(skinC, L, false), 0.7);
          g.lineWidth = 1.2;
          g.beginPath(); g.ellipse(sx, eyeY - 1, w + 1, h + 3.5, 0, Math.PI * 1.15, Math.PI * 1.85); g.stroke();
          // under-eye (tired / age)
          if ((c.age || 0) > 0.4 || o.expr === 'tired') {
            g.strokeStyle = css(shadeSkin(skinC, L, false), 0.5);
            g.beginPath(); g.ellipse(sx, eyeY + 3, w, h + 3, 0, Math.PI * 0.2, Math.PI * 0.8); g.stroke();
          }
        });
        // glasses
        if (c.glasses) {
          g.strokeStyle = css(c.glassesCol || [20, 20, 22], 0.95);
          g.lineWidth = 2.2;
          [-1, 1].forEach((side) => {
            const far = side * t > 0;
            const k = far ? 1 - 0.3 * Math.abs(t) : 1;
            const sx = ex + side * eyeSep * k;
            G.roundRectPath(g, sx - 13 * k, eyeY - 8, 26 * k, 16, 5);
            g.stroke();
            g.fillStyle = 'rgba(200,220,255,0.06)'; g.fill();
          });
          g.beginPath(); g.moveTo(ex - 6, eyeY - 3); g.quadraticCurveTo(ex, eyeY - 6, ex + 6, eyeY - 3); g.stroke();
          // glint
          g.strokeStyle = 'rgba(255,255,255,0.35)'; g.lineWidth = 1.5;
          g.beginPath(); g.moveTo(ex + dir * eyeSep - 6, eyeY - 5); g.lineTo(ex + dir * eyeSep + 2, eyeY + 3); g.stroke();
        }
        // nose — bridge plane, soft side shadow, wings, tip
        const nx = t * 22;
        const sd = -dir;
        g.save();
        g.filter = `blur(${Math.max(0.5, (o.res || 1) * 1.6)}px)`;
        g.fillStyle = css(shadeSkin(skinC, L, false), 0.75);
        g.beginPath();
        g.moveTo(ex + sd * 5, -4);
        g.quadraticCurveTo(nx + sd * 5, 10, nx + sd * 10, 24);
        g.quadraticCurveTo(nx + sd * 4, 30, nx - sd * 2, 28);
        g.quadraticCurveTo(nx + sd * 1, 12, ex + sd * 1, -4);
        g.closePath(); g.fill();
        // bridge highlight
        g.strokeStyle = css(shadeSkin(skinC, L, true, 1.35), 0.55);
        g.lineWidth = 3;
        g.beginPath(); g.moveTo(ex - sd * 1, -2); g.quadraticCurveTo(nx - sd * 2, 10, nx - sd * 2, 19); g.stroke();
        // shadow under the nose
        g.fillStyle = 'rgba(40,16,12,0.45)';
        g.beginPath(); g.ellipse(nx + sd * 3, 31, 10, 3.5, 0, 0, U.TAU); g.fill();
        g.filter = 'none';
        g.restore();
        // wings
        g.strokeStyle = css(shadeSkin(U.mix(skinC, [90, 40, 30], 0.5), L, false), 0.8);
        g.lineWidth = 1.6;
        [-1, 1].forEach((side) => { g.beginPath(); g.arc(nx + side * 7, 25, 4.5, side < 0 ? Math.PI * 0.4 : Math.PI * -0.1, side < 0 ? Math.PI * 1.1 : Math.PI * 0.6); g.stroke(); });
        g.fillStyle = featDark;
        g.beginPath(); g.ellipse(nx - 4 + t * 2, 27.5, 2.6, 1.3, 0.3, 0, U.TAU); g.fill();
        g.beginPath(); g.ellipse(nx + 4 + t * 2, 27.5, 2.6, 1.3, -0.3, 0, U.TAU); g.fill();
        g.fillStyle = css(shadeSkin(skinC, L, true, 1.35), 0.5);
        g.beginPath(); g.ellipse(nx - sd * 2, 21, 3.2, 2.6, 0, 0, U.TAU); g.fill();
        // nasolabial (age / expression)
        const nl = (c.age || 0) * 0.6 + Math.max(0, E.mouth) * 0.5;
        if (nl > 0.1) {
          g.strokeStyle = css(shadeSkin(skinC, L, false), Math.min(0.7, nl));
          g.lineWidth = 1.6;
          [-1, 1].forEach((side) => {
            g.beginPath(); g.moveTo(nx + side * 12, 24); g.quadraticCurveTo(nx + side * 20, 36, nx + side * 18, 46); g.stroke();
          });
        }
        if ((c.age || 0) > 0.5) {
          g.strokeStyle = css(shadeSkin(skinC, L, false), 0.35);
          g.lineWidth = 1.2;
          for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(ex - 18, -36 + k * 6); g.quadraticCurveTo(ex, -39 + k * 6, ex + 18, -36 + k * 6); g.stroke(); }
        }
        // mouth
        const my = 41, mw = fem ? 12 : 14;
        const curve = E.mouth * 6;
        const talk = o.talk || 0;
        const open = Math.max(E.open, talk) * 6;
        const mx = t * 18;
        const lipC = c.lips || U.mix(skinC, [150, 60, 60], fem ? 0.45 : 0.22);
        // upper lip shadow shape
        g.fillStyle = css(shade(lipC, L, false), 0.9);
        g.beginPath();
        g.moveTo(mx - mw, my - curve * (1 + E.asym));
        g.quadraticCurveTo(mx - 4, my - 5, mx, my - 3);
        g.quadraticCurveTo(mx + 4, my - 5, mx + mw, my - curve * (1 - E.asym));
        g.quadraticCurveTo(mx, my + 1 + open * 0.3, mx - mw, my - curve * (1 + E.asym));
        g.fill();
        // opening
        if (open > 0.5) {
          g.fillStyle = '#1a0c0a';
          g.beginPath(); g.ellipse(mx, my + open * 0.5, mw * 0.7, open * 0.6, 0, 0, U.TAU); g.fill();
        }
        // lower lip lit
        g.fillStyle = css(shade(lipC, L, true, 0.8), 0.9);
        g.beginPath();
        g.moveTo(mx - mw + 3, my - curve * (1 + E.asym) + 1 + open);
        g.quadraticCurveTo(mx, my + 8 + open, mx + mw - 3, my - curve * (1 - E.asym) + 1 + open);
        g.quadraticCurveTo(mx, my + 2 + open, mx - mw + 3, my - curve * (1 + E.asym) + 1 + open);
        g.fill();
        // mouth line
        g.strokeStyle = featDark;
        g.lineWidth = 1.8;
        g.beginPath();
        g.moveTo(mx - mw, my - curve * (1 + E.asym));
        g.quadraticCurveTo(mx, my + 1.5 - curve * 0.2 + open * 0.8, mx + mw, my - curve * (1 - E.asym));
        g.stroke();
        // chin shadow below lip
        g.fillStyle = css(shadeSkin(skinC, L, false), 0.4);
        g.beginPath(); g.ellipse(mx, my + 13 + open, 8, 3, 0, 0, U.TAU); g.fill();
        // earrings
        if (c.earrings) {
          g.fillStyle = css(c.earrings);
          const ear = -dir * 40 + t * 5;
          g.beginPath(); g.arc(ear, 30, 3.5, 0, U.TAU); g.fill();
          g.beginPath(); g.arc(-ear, 30, 3.5, 0, U.TAU); g.fill();
        }
      }
    }

    // hair (front mass)
    if (hairStyle !== 'bald') {
      hairPath(g, hairStyle, fem, t, back);
      g.fillStyle = css(shade(hairC, L, false, 1));
      g.fill();
      g.save();
      g.clip();
      // lit side sheen
      const hl = g.createLinearGradient(dir * 70, -70, -dir * 10, 10);
      hl.addColorStop(0, css(shade(hairC, L, true, 1.5), 0.95));
      hl.addColorStop(0.55, css(shade(hairC, L, true, 1.0), 0.3));
      hl.addColorStop(1, css(shade(hairC, L, true, 1.0), 0));
      g.fillStyle = hl;
      g.fillRect(-90, -100, 180, 240);
      // strand strokes
      g.strokeStyle = css(shade(U.mix(hairC, [255, 255, 255], 0.25), L, true, 1.2), 0.25);
      g.lineWidth = 1.2;
      const r = U.rng(c.seed || 5);
      for (let k = 0; k < 26; k++) {
        const x0 = -50 + r() * 100, y0 = -72 + r() * 16;
        g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(x0 + (r() - 0.5) * 30 + dir * 10, y0 + 30, x0 + (r() - 0.5) * 40, y0 + 40 + r() * 60); g.stroke();
      }
      if (c.grey) {
        g.fillStyle = css(shade([200, 200, 205], L, true, 0.8), c.grey);
        g.beginPath(); g.ellipse(-44, -8, 12, 26, 0, 0, U.TAU); g.ellipse(44, -8, 12, 26, 0, 0, U.TAU); g.fill();
      }
      g.restore();
    }
    g.restore(); // head
  }

  // ---------------------------------------------------------------- public draw with lighting passes & caching
  const cache = new Map();
  let frameNo = 0;
  P.draw = (g, c, x, y, h, o) => {
    o = o || {};
    const L = Object.assign({}, DEFAULT_LIGHT, o.light || {});
    const m = g.getTransform();
    const dev = Math.hypot(m.a, m.b) * (h / 1000); // device px per unit
    const bust = o.crop === 'bust';
    const top = -1090, bottom = bust ? -380 : 20;
    const left = -260, right = 260;
    const Wu = right - left, Hu = bottom - top;
    const res = Math.min(dev, 2200 / Hu); // cap
    const detail = U.clamp(dev * 125 / 40, 0, 1); // head px / 40
    // blink every ~4s
    const tt = o.t == null ? F.time : o.t;
    const seedPh = (c.seed || 1) * 1.37;
    const blink = ((tt + seedPh) % 4.3) < 0.13;
    const talk = o.talking ? Math.round((0.5 + 0.5 * Math.sin(tt * 17 + Math.sin(tt * 5.3) * 2)) * 3) / 3 : 0;
    const key = [c.id, o.pose, (o.turn || 0).toFixed(2), o.expr, blink, talk, o.back, o.crop, Math.round(res * 40), JSON.stringify(L), (o.lookX || 0).toFixed(1), (o.tilt || 0).toFixed(2)].join('|');
    let entry = cache.get(c.id + (o.slot || ''));
    if (!entry || entry.key !== key) {
      const cw = Math.ceil(Wu * res) + 4, ch = Math.ceil(Hu * res) + 4;
      const cnv = (entry && entry.cnv) || document.createElement('canvas');
      if (cnv.width !== cw || cnv.height !== ch) { cnv.width = cw; cnv.height = ch; }
      const cg = cnv.getContext('2d');
      cg.setTransform(1, 0, 0, 1, 0, 0);
      cg.clearRect(0, 0, cw, ch);
      cg.setTransform(res, 0, 0, res, -left * res + 2, -top * res + 2);
      paint(cg, c, Object.assign({}, o, { detail, blink, talk, res }), L);
      // rim light pass
      if (L.rimA > 0) {
        const rim = rimCanvas(cnv, Math.max(2, res * 5), L.rimSide, L.rim);
        cg.setTransform(1, 0, 0, 1, 0, 0);
        cg.globalCompositeOperation = 'source-atop';
        cg.globalAlpha = L.rimA;
        cg.drawImage(rim, 0, 0);
        cg.globalAlpha = 1;
        cg.globalCompositeOperation = 'source-over';
      }
      // grounding: darken toward feet
      if (!bust) {
        cg.setTransform(1, 0, 0, 1, 0, 0);
        cg.globalCompositeOperation = 'source-atop';
        const gr = cg.createLinearGradient(0, ch * 0.55, 0, ch);
        gr.addColorStop(0, 'rgba(0,0,0,0)');
        gr.addColorStop(1, `rgba(0,0,0,${o.footShade == null ? 0.45 : o.footShade})`);
        cg.fillStyle = gr; cg.fillRect(0, 0, cw, ch);
        cg.globalCompositeOperation = 'source-over';
      }
      entry = { key, cnv };
      cache.set(c.id + (o.slot || ''), entry);
    }
    // breathing
    const br = 1 + Math.sin(tt * 1.7 + seedPh) * 0.004;
    const sc = h / 1000;
    const pa = g.globalAlpha;
    if (o.alpha != null) g.globalAlpha = pa * o.alpha;
    if (o.silhouette) {
      // pure silhouette with rim only (backlit against windows)
      g.globalAlpha = (o.alpha == null ? 1 : o.alpha) * pa;
    }
    g.drawImage(entry.cnv, x + (left - 2 / res) * sc, y + (top - 2 / res) * sc * br, (entry.cnv.width / res) * sc, (entry.cnv.height / res) * sc * br);
    g.globalAlpha = pa;
    return { headX: x + (o.turn || 0) * 6 * sc, headY: y - 937 * sc, sc };
  };

  let rimC = null, rimTmp = null;
  function rimCanvas(src, d, side, col) {
    const w = src.width, h = src.height;
    if (!rimC || rimC.width < w || rimC.height < h) {
      rimC = document.createElement('canvas'); rimTmp = document.createElement('canvas');
    }
    rimC.width = w; rimC.height = h; rimTmp.width = w; rimTmp.height = h;
    const g = rimC.getContext('2d');
    g.clearRect(0, 0, w, h);
    g.drawImage(src, 0, 0);
    g.globalCompositeOperation = 'destination-out';
    g.drawImage(src, -side * d, d * 0.6);
    g.globalCompositeOperation = 'source-in';
    g.fillStyle = U.rgba(col, 1);
    g.fillRect(0, 0, w, h);
    g.globalCompositeOperation = 'source-over';
    // soften
    const t = rimTmp.getContext('2d');
    t.clearRect(0, 0, w, h);
    t.filter = `blur(${Math.max(0.6, d * 0.25)}px)`;
    t.drawImage(rimC, 0, 0);
    t.filter = 'none';
    return rimTmp;
  }

  // ---------------------------------------------------------------- tiny helpers used above
  const G = {
    roundRectPath(g, x, y, w, h, r) {
      g.beginPath();
      g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
    },
    roundRectFill(g, x, y, w, h, r) { G.roundRectPath(g, x, y, w, h, r); g.fill(); },
  };

  // ---------------------------------------------------------------- cast
  P.cast = {
    wendt: { id: 'wendt', name: 'Dr. Helena Wendt', role: 'Senior Partner · M&A', sex: 'f', skin: [226, 186, 160], hair: [22, 18, 18], hairStyle: 'bob', suit: [20, 20, 24], shirt: [236, 232, 226], outfit: 'suit', age: 0.45, jaw: 0.95, eyes: [60, 70, 80], lips: [150, 70, 68], earrings: [220, 210, 190], seed: 3, build: 1.0 },
    adler: { id: 'adler', name: 'Konstantin Adler', role: 'Managing Partner', sex: 'm', skin: [220, 178, 152], hair: [200, 200, 204], hairStyle: 'slick', suit: [44, 44, 50], shirt: [232, 234, 240], tie: [70, 24, 30], waistcoat: true, pocketSquare: [230, 230, 235], age: 0.85, jaw: 1.05, glasses: true, glassesCol: [150, 130, 90], seed: 7, build: 1.08 },
    jonas: { id: 'jonas', name: 'Jonas Brenner', role: 'Associate', sex: 'm', skin: [230, 192, 166], hair: [110, 78, 52], hairStyle: 'crop', shirt: [196, 214, 236], tie: [40, 52, 80], outfit: 'shirt', age: 0.05, jaw: 0.95, glasses: true, stubble: 0.12, seed: 11, build: 0.95 },
    marta: { id: 'marta', name: 'Marta Kowalczyk', role: 'Partner · Wrocław', sex: 'f', skin: [232, 196, 172], hair: [132, 62, 36], hairStyle: 'pony', suit: [64, 66, 72], shirt: [28, 28, 32], outfit: 'turtleneck', age: 0.25, eyes: [80, 100, 60], lips: [160, 80, 76], seed: 13, build: 0.98 },
    steinhauer: { id: 'steinhauer', name: 'Falk Steinhauer', role: 'CEO · Steinhauer Sportholding, Stuttgart', sex: 'm', skin: [214, 166, 140], hair: [150, 146, 140], hairStyle: 'side', suit: [36, 40, 58], shirt: [240, 240, 244], tie: [28, 34, 60], outfit: 'suit', age: 0.7, jaw: 1.12, seed: 17, build: 1.15 },
    zielinski: { id: 'zielinski', name: 'Tomasz Zieliński', role: 'President · KS Carbo Gliwice', sex: 'm', skin: [206, 158, 128], hair: [30, 26, 24], hairStyle: 'receding', suit: [24, 30, 44], shirt: [250, 250, 250], outfit: 'open', age: 0.5, jaw: 1.15, stubble: 0.3, pin: [40, 170, 170], seed: 19, build: 1.12 },
    nowicka: { id: 'nowicka', name: 'Aleksandra Nowicka', role: 'Partner · Nowicka Bąk Legal', sex: 'f', skin: [236, 204, 186], hair: [178, 150, 110], hairStyle: 'bun', suit: [26, 32, 52], shirt: [238, 230, 216], outfit: 'suit', age: 0.4, jaw: 0.92, eyes: [70, 90, 110], lips: [140, 60, 64], earrings: [236, 232, 220], seed: 23, build: 0.96 },
    anna: { id: 'anna', name: 'Anna Zielińska', sex: 'f', skin: [236, 200, 176], hair: [200, 170, 120], hairStyle: 'long', suit: [120, 30, 40], shirt: [120, 30, 40], outfit: 'turtleneck', age: 0.35, lips: [170, 60, 70], earrings: [240, 230, 200], seed: 41 },
    guard: { id: 'guard', name: 'Security', sex: 'm', skin: [200, 160, 132], hair: [30, 28, 26], hairStyle: 'side', suit: [22, 22, 26], shirt: [210, 210, 214], tie: [20, 20, 24], seed: 29, build: 1.2 },
    worker: { id: 'worker', name: '', sex: 'm', skin: [220, 180, 150], hair: [60, 44, 30], hairStyle: 'side', suit: [60, 62, 70], shirt: [220, 224, 230], outfit: 'shirt', seed: 31 },
    worker2: { id: 'worker2', name: '', sex: 'f', skin: [230, 196, 170], hair: [40, 30, 26], hairStyle: 'bun', suit: [90, 70, 64], shirt: [230, 220, 210], outfit: 'blazer', seed: 37 },
  };
})(window.F);
