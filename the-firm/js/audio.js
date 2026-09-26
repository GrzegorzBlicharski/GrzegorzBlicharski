/* THE FIRM — procedural audio: rain, city, room tone, score pad, foley */
(function (F) {
  'use strict';
  const A = { ctx: null, on: false };
  F.audio = A;
  let master, beds = {}, noiseBuf, brownBuf;

  function makeNoise(ac, seconds, brown) {
    const len = ac.sampleRate * seconds;
    const b = ac.createBuffer(2, len, ac.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = b.getChannelData(ch);
      let last = 0;
      for (let i = 0; i < len; i++) {
        const w = Math.random() * 2 - 1;
        if (brown) { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; } else d[i] = w;
      }
    }
    return b;
  }

  A.init = () => {
    if (A.ctx) { if (A.ctx.state === 'suspended') A.ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ac = new AC();
    A.ctx = ac;
    master = ac.createGain();
    master.gain.value = 0.9;
    const comp = ac.createDynamicsCompressor();
    comp.threshold.value = -18; comp.ratio.value = 3;
    master.connect(comp).connect(ac.destination);
    noiseBuf = makeNoise(ac, 4, false);
    brownBuf = makeNoise(ac, 6, true);
    A.on = true;

    // --- beds (all start silent) ---
    beds.rain = bed(noiseBuf, [['highpass', 400, 0.3], ['lowpass', 5200, 0.2]]);
    beds.rainGlass = bed(noiseBuf, [['bandpass', 2400, 0.8]]); // closer, brighter patter (modulated)
    beds.city = bed(brownBuf, [['lowpass', 220, 0.5]]);
    beds.room = bed(brownBuf, [['bandpass', 130, 1.4]]);
    beds.hvac = bed(noiseBuf, [['lowpass', 700, 0.4]]);
    beds.cabin = bed(brownBuf, [['lowpass', 380, 0.7]]);
    // patter modulation (random gain wobble) for glass rain
    const lfo = ac.createOscillator();
    lfo.frequency.value = 7.3;
    const lg = ac.createGain(); lg.gain.value = 0.25;
    lfo.connect(lg).connect(beds.rainGlass.out.gain);
    lfo.start();

    // --- score pad ---
    beds.pad = padVoice();
    setInterval(tickDrops, 60);
  };

  function bed(buf, filters) {
    const ac = A.ctx;
    const src = ac.createBufferSource();
    src.buffer = buf; src.loop = true;
    src.playbackRate.value = 0.9 + Math.random() * 0.2;
    let node = src;
    filters.forEach(([type, f, q]) => { const b = ac.createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = q; node.connect(b); node = b; });
    const out = ac.createGain(); out.gain.value = 0;
    node.connect(out).connect(master);
    src.start(0, Math.random() * 2);
    return { src, out, level: 0 };
  }

  function padVoice() {
    const ac = A.ctx;
    const out = ac.createGain(); out.gain.value = 0;
    const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 520; lp.Q.value = 0.7;
    const delay = ac.createDelay(1.5); delay.delayTime.value = 0.42;
    const fb = ac.createGain(); fb.gain.value = 0.35;
    lp.connect(out); lp.connect(delay); delay.connect(fb).connect(delay); delay.connect(out);
    out.connect(master);
    const oscs = [];
    const mk = (f, det, type, g) => {
      const o = ac.createOscillator(); o.type = type; o.frequency.value = f; o.detune.value = det;
      const gg = ac.createGain(); gg.gain.value = g;
      o.connect(gg).connect(lp); o.start(); oscs.push(o); return o;
    };
    // D minor-ish cluster, very low
    const notes = [73.42, 110, 146.83, 174.61];
    notes.forEach((n, i) => { mk(n, -7, 'sawtooth', 0.05); mk(n, 6, 'sawtooth', 0.05); if (i === 0) mk(n / 2, 0, 'sine', 0.25); });
    // slow filter breathing
    const lfo = ac.createOscillator(); lfo.frequency.value = 0.05;
    const lg = ac.createGain(); lg.gain.value = 220;
    lfo.connect(lg).connect(lp.frequency); lfo.start();
    return { out, lp, oscs, level: 0 };
  }

  A.chord = (set) => {
    if (!A.ctx) return;
    const sets = {
      dm: [73.42, 110, 146.83, 174.61],
      tense: [69.3, 103.83, 146.83, 155.56],
      warm: [65.41, 98, 130.81, 164.81],
      night: [61.74, 92.5, 123.47, 146.83],
      resolve: [73.42, 110, 146.83, 185],
    };
    const n = sets[set] || sets.dm;
    const t = A.ctx.currentTime;
    beds.pad.oscs.forEach((o, i) => {
      // oscillators were created as: [n0a,n0b,n0sub,n1a,n1b,n2a,n2b,n3a,n3b]
      const map = [0, 0, -1, 1, 1, 2, 2, 3, 3];
      const idx = map[i];
      const f = idx === -1 ? n[0] / 2 : n[idx];
      o.frequency.setTargetAtTime(f, t, 1.2);
    });
  };

  // set bed levels: {rain:0.5, city:0.3, ...}; fade seconds
  A.mix = (levels, fade) => {
    if (!A.ctx) { A.pending = levels; return; }
    const t = A.ctx.currentTime;
    fade = fade == null ? 2 : fade;
    Object.keys(beds).forEach((k) => {
      const target = levels[k] || 0;
      beds[k].level = target;
      const g = beds[k].out.gain;
      g.cancelScheduledValues(t);
      g.setValueAtTime(g.value, t);
      g.linearRampToValueAtTime(target * (k === 'pad' ? 0.55 : 1), t + fade);
    });
  };
  A.muffle = (freq) => {
    // lowpass world beds (e.g. inside elevator) — applied to rain bed filter
    if (!A.ctx) return;
    const f = beds.rain.src; // no-op placeholder for simplicity
  };

  // glass drop ticks
  function tickDrops() {
    if (!A.ctx || !beds.rainGlass || beds.rainGlass.level < 0.02) return;
    if (Math.random() < 0.35 * beds.rainGlass.level * 2) blip(2000 + Math.random() * 3000, 0.012 * beds.rainGlass.level * 3, 0.015);
  }
  function blip(f, g, d) {
    const ac = A.ctx, t = ac.currentTime;
    const o = ac.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * 0.6, t + d);
    const gg = ac.createGain(); gg.gain.setValueAtTime(g, t); gg.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(gg).connect(master); o.start(t); o.stop(t + d + 0.02);
  }
  function tone(f, dur, g, type, when, attack) {
    const ac = A.ctx; if (!ac) return;
    const t = ac.currentTime + (when || 0);
    const o = ac.createOscillator(); o.type = type || 'sine'; o.frequency.value = f;
    const gg = ac.createGain();
    gg.gain.setValueAtTime(0.0001, t);
    gg.gain.exponentialRampToValueAtTime(g, t + (attack || 0.01));
    gg.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(gg).connect(master); o.start(t); o.stop(t + dur + 0.05);
  }
  function noiseHit(dur, g, ftype, f, q, when, sweepTo) {
    const ac = A.ctx; if (!ac) return;
    const t = ac.currentTime + (when || 0);
    const s = ac.createBufferSource(); s.buffer = brownBuf;
    const b = ac.createBiquadFilter(); b.type = ftype; b.frequency.value = f; b.Q.value = q || 0.7;
    if (sweepTo) b.frequency.exponentialRampToValueAtTime(sweepTo, t + dur);
    const gg = ac.createGain(); gg.gain.setValueAtTime(0.0001, t); gg.gain.exponentialRampToValueAtTime(g, t + 0.05); gg.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(b).connect(gg).connect(master); s.start(t, Math.random() * 3); s.stop(t + dur + 0.1);
  }

  // --- foley ---
  A.click = () => tone(1800, 0.05, 0.03, 'sine');
  A.hover = () => tone(2600, 0.04, 0.008, 'sine');
  A.ding = () => { tone(1318.5, 1.6, 0.08, 'sine', 0, 0.005); tone(1046.5, 2.0, 0.07, 'sine', 0.28, 0.005); };
  A.buzz = (n) => {
    if (!A.ctx) return;
    n = n || 2;
    for (let i = 0; i < n; i++) {
      const ac = A.ctx, t = ac.currentTime + i * 0.55;
      const o = ac.createOscillator(); o.type = 'square'; o.frequency.value = 150;
      const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 400;
      const g = ac.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.09, t + 0.02); g.gain.setValueAtTime(0.09, t + 0.33); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.38);
      o.connect(lp).connect(g).connect(master); o.start(t); o.stop(t + 0.4);
    }
  };
  A.ring = () => { for (let i = 0; i < 2; i++) { tone(880, 0.35, 0.03, 'triangle', i * 0.45); tone(660, 0.35, 0.02, 'triangle', i * 0.45 + 0.02); } };
  A.thunder = (dist) => { dist = dist == null ? 0.5 : dist; noiseHit(4 + dist * 2, 0.5 * (1 - dist * 0.6), 'lowpass', 600 - dist * 300, 0.5, dist * 1.2, 60); };
  A.whoosh = () => noiseHit(1.2, 0.2, 'bandpass', 300, 0.8, 0, 2400);
  A.boom = () => { noiseHit(3.5, 0.6, 'lowpass', 180, 0.8, 0, 40); tone(49, 3, 0.25, 'sine', 0, 0.02); };
  A.paper = () => noiseHit(0.25, 0.12, 'highpass', 2500, 0.5);
  A.type = () => tone(4000 + Math.random() * 1500, 0.02, 0.012, 'square');
  A.door = () => { noiseHit(0.6, 0.15, 'lowpass', 400, 1); tone(90, 0.3, 0.05, 'sine'); };
  A.stinger = () => { tone(146.83, 5, 0.08, 'sawtooth', 0, 0.5); tone(220, 5, 0.05, 'sawtooth', 0, 0.8); noiseHit(4, 0.12, 'lowpass', 300, 1, 0, 100); };
  A.connect = () => { tone(523.25, 0.6, 0.04, 'sine'); tone(784, 0.9, 0.03, 'sine', 0.08); };
  A.reveal = () => { tone(293.66, 3, 0.05, 'sine', 0, 0.1); tone(440, 3, 0.04, 'sine', 0.15, 0.1); tone(587.33, 3.5, 0.035, 'sine', 0.3, 0.1); };
  A.wrong = () => tone(180, 0.25, 0.04, 'triangle');
  A.chime = () => { tone(987.77, 0.5, 0.035, 'sine'); tone(1318.5, 0.7, 0.03, 'sine', 0.09); };
  A.plane = () => noiseHit(6, 0.2, 'lowpass', 900, 0.5, 0, 150);
  A.tone = tone;
})(window.F);
