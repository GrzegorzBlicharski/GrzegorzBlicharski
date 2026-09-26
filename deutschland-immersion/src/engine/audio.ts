import type { AmbienceId, Weather } from './types';

/**
 * Procedural audio. Every sound is synthesised with WebAudio at runtime —
 * no recorded or third-party assets, so there are no licensing questions.
 */

type Layer = { stop: () => void };

class AudioEngine {
  ctx: AudioContext | null = null;
  master: GainNode | null = null;
  ambBus: GainNode | null = null;
  noise: AudioBuffer | null = null;
  brown: AudioBuffer | null = null;
  layers: Layer[] = [];
  timers: number[] = [];
  current = '';
  volume = 0.7;
  enabled = true;

  init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') void this.ctx.resume();
      return;
    }
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.volume;
    this.master.connect(this.ctx.destination);
    this.ambBus = this.ctx.createGain();
    this.ambBus.gain.value = 0;
    this.ambBus.connect(this.master);
    const len = this.ctx.sampleRate * 3;
    this.noise = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    this.brown = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const w = this.noise.getChannelData(0);
    const b = this.brown.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      w[i] = Math.random() * 2 - 1;
      last = (last + 0.02 * w[i]) / 1.02;
      b[i] = last * 3.5;
    }
  }

  setVolume(v: number) {
    this.volume = v;
    if (this.master && this.ctx) this.master.gain.setTargetAtTime(v, this.ctx.currentTime, 0.1);
  }

  setEnabled(on: boolean) {
    this.enabled = on;
    if (!on) this.stopAmbience();
    else if (this.current) {
      const [a, w] = this.current.split('|');
      this.current = '';
      this.setAmbience(a as AmbienceId, w as Weather);
    }
  }

  private src(buf: AudioBuffer | null, dest: AudioNode, opts: { type?: BiquadFilterType; freq?: number; q?: number; gain?: number; rate?: number } = {}) {
    const ctx = this.ctx!;
    const s = ctx.createBufferSource();
    s.buffer = buf;
    s.loop = true;
    s.playbackRate.value = opts.rate ?? 1;
    const f = ctx.createBiquadFilter();
    f.type = opts.type ?? 'lowpass';
    f.frequency.value = opts.freq ?? 1000;
    f.Q.value = opts.q ?? 0.7;
    const g = ctx.createGain();
    g.gain.value = opts.gain ?? 0.2;
    s.connect(f).connect(g).connect(dest);
    s.start(ctx.currentTime + Math.random() * 0.1, Math.random() * 2);
    return { s, f, g, stop: () => { try { s.stop(); } catch { /* already stopped */ } } };
  }

  private lfo(param: AudioParam, rate: number, depth: number) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.frequency.value = rate;
    const g = ctx.createGain();
    g.gain.value = depth;
    o.connect(g).connect(param);
    o.start();
    return { stop: () => { try { o.stop(); } catch { /* noop */ } } };
  }

  private every(minS: number, maxS: number, fn: () => void) {
    const loop = () => {
      const id = window.setTimeout(() => {
        if (this.enabled) fn();
        loop();
      }, (minS + Math.random() * (maxS - minS)) * 1000);
      this.timers.push(id);
    };
    loop();
  }

  tone(freq: number, dur: number, opts: { type?: OscillatorType; gain?: number; delay?: number; dest?: AudioNode; attack?: number } = {}) {
    if (!this.ctx || !this.master) return;
    const ctx = this.ctx;
    const t = ctx.currentTime + (opts.delay ?? 0);
    const o = ctx.createOscillator();
    o.type = opts.type ?? 'sine';
    o.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(opts.gain ?? 0.15, t + (opts.attack ?? 0.01));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(opts.dest ?? this.master);
    o.start(t);
    o.stop(t + dur + 0.05);
  }

  burst(dur: number, opts: { freq?: number; type?: BiquadFilterType; gain?: number; delay?: number; dest?: AudioNode } = {}) {
    if (!this.ctx || !this.master) return;
    const ctx = this.ctx;
    const t = ctx.currentTime + (opts.delay ?? 0);
    const s = ctx.createBufferSource();
    s.buffer = this.noise;
    const f = ctx.createBiquadFilter();
    f.type = opts.type ?? 'bandpass';
    f.frequency.value = opts.freq ?? 2000;
    const g = ctx.createGain();
    g.gain.setValueAtTime(opts.gain ?? 0.2, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f).connect(g).connect(opts.dest ?? this.master);
    s.start(t, Math.random());
    s.stop(t + dur + 0.05);
  }

  stopAmbience() {
    this.layers.forEach((l) => l.stop());
    this.layers = [];
    this.timers.forEach((t) => clearTimeout(t));
    this.timers = [];
  }

  setAmbience(id: AmbienceId, weather: Weather = 'clear') {
    const key = `${id}|${weather}`;
    if (key === this.current) return;
    this.current = key;
    if (!this.ctx || !this.ambBus || !this.enabled) return;
    const ctx = this.ctx;
    const bus = this.ambBus;
    bus.gain.cancelScheduledValues(ctx.currentTime);
    bus.gain.setTargetAtTime(0, ctx.currentTime, 0.25);
    window.setTimeout(() => {
      if (this.current !== key) return;
      this.stopAmbience();
      this.build(id, weather);
      bus.gain.setTargetAtTime(1, ctx.currentTime, 0.8);
    }, 700);
  }

  private build(id: AmbienceId, weather: Weather) {
    const b = this.ambBus!;
    const L = (x: Layer) => this.layers.push(x);
    const exterior = id === 'street' || id === 'rain' || id === 'station';
    const wet = exterior;
    switch (id) {
      case 'station': {
        const hall = this.src(this.brown, b, { freq: 220, gain: 0.5 });
        L(hall);
        const crowd = this.src(this.noise, b, { type: 'bandpass', freq: 700, q: 0.6, gain: 0.05 });
        L(crowd);
        L(this.lfo(crowd.g.gain, 0.13, 0.02));
        // original three-note station chime
        this.every(18, 32, () => {
          [659.3, 523.3, 784].forEach((f, i) => this.tone(f, 1.6, { gain: 0.06, delay: i * 0.45, type: 'triangle', dest: b }));
        });
        // train passing (filtered swell)
        this.every(20, 40, () => {
          if (!this.ctx) return;
          const s = this.src(this.brown, b, { freq: 160, gain: 0 });
          const t = this.ctx.currentTime;
          s.g.gain.linearRampToValueAtTime(0.9, t + 3);
          s.g.gain.linearRampToValueAtTime(0, t + 8);
          window.setTimeout(() => s.stop(), 8500);
        });
        break;
      }
      case 'street': {
        const traffic = this.src(this.brown, b, { freq: 380, gain: 0.45 });
        L(traffic);
        L(this.lfo(traffic.g.gain, 0.07, 0.2));
        this.every(4, 11, () => this.burst(2.5, { freq: 500, type: 'lowpass', gain: 0.12, dest: b }));
        this.every(6, 14, () => {
          const f = 2600 + Math.random() * 1400;
          for (let i = 0; i < 3; i++) this.tone(f + i * 180, 0.09, { gain: 0.025, delay: i * 0.12, dest: b });
        });
        this.every(40, 80, () => [1760, 1760].forEach((f, i) => this.tone(f, 0.5, { gain: 0.03, delay: i * 0.18, type: 'triangle', dest: b })));
        break;
      }
      case 'cafe': {
        const murmur = this.src(this.noise, b, { type: 'bandpass', freq: 520, q: 0.9, gain: 0.09 });
        L(murmur);
        L(this.lfo(murmur.f.frequency, 0.3, 120));
        L(this.src(this.brown, b, { freq: 200, gain: 0.15 }));
        this.every(2, 6, () => this.tone(3200 + Math.random() * 1500, 0.25, { gain: 0.02, dest: b }));
        this.every(15, 30, () => this.burst(3, { freq: 5000, type: 'highpass', gain: 0.05, dest: b }));
        break;
      }
      case 'apartment': {
        L(this.src(this.brown, b, { freq: 160, gain: 0.12 }));
        this.every(25, 50, () => this.burst(3, { freq: 400, type: 'lowpass', gain: 0.05, dest: b }));
        break;
      }
      case 'office': {
        L(this.src(this.brown, b, { freq: 140, gain: 0.18 }));
        const hvac = this.src(this.noise, b, { type: 'lowpass', freq: 900, gain: 0.02 });
        L(hvac);
        this.every(0.6, 4, () => {
          const n = 2 + Math.floor(Math.random() * 6);
          for (let i = 0; i < n; i++) this.burst(0.03, { freq: 3000, gain: 0.03, delay: i * (0.08 + Math.random() * 0.1), dest: b });
        });
        this.every(30, 60, () => [880, 1318.5].forEach((f, i) => this.tone(f, 0.4, { gain: 0.02, delay: i * 0.15, dest: b })));
        break;
      }
      case 'restaurant': {
        const murmur = this.src(this.noise, b, { type: 'bandpass', freq: 420, q: 1, gain: 0.07 });
        L(murmur);
        L(this.lfo(murmur.f.frequency, 0.2, 80));
        // quiet original piano-like pad
        const chords = [[220, 277.2, 329.6], [196, 246.9, 293.7], [174.6, 220, 261.6], [196, 246.9, 329.6]];
        let ci = 0;
        const play = () => {
          chords[ci % chords.length].forEach((f, i) => this.tone(f, 3.6, { gain: 0.018, delay: i * 0.05, type: 'triangle', dest: b, attack: 0.02 }));
          ci++;
        };
        play();
        this.every(3.6, 3.6, play);
        this.every(3, 8, () => this.tone(2800 + Math.random() * 900, 0.3, { gain: 0.015, dest: b }));
        break;
      }
      case 'ubahn': {
        const r = this.src(this.brown, b, { freq: 260, gain: 0.8 });
        L(r);
        L(this.lfo(r.f.frequency, 0.5, 60));
        break;
      }
      case 'rain':
        L(this.src(this.brown, b, { freq: 300, gain: 0.25 }));
        break;
      default:
        break;
    }
    if (weather === 'rain' || id === 'rain') {
      L(this.src(this.noise, b, { type: 'highpass', freq: wet ? 1200 : 2500, gain: wet ? 0.08 : 0.03 }));
      L(this.src(this.noise, b, { type: 'lowpass', freq: 600, gain: wet ? 0.1 : 0.03 }));
      this.every(0.2, 0.9, () => this.tone(1800 + Math.random() * 2500, 0.05, { gain: 0.01, dest: b }));
    }
  }

  // ---------------------------------------------------------------- one-shots
  sfx(name: 'phone' | 'notify' | 'whoosh' | 'click' | 'success' | 'fail' | 'stamp' | 'type' | 'transit' | 'boom') {
    if (!this.ctx || !this.enabled) return;
    switch (name) {
      case 'phone':
        for (let i = 0; i < 2; i++) {
          this.tone(150, 0.35, { type: 'square', gain: 0.05, delay: i * 0.5 });
          this.tone(1318.5, 0.18, { gain: 0.06, delay: i * 0.5 });
          this.tone(1568, 0.18, { gain: 0.05, delay: i * 0.5 + 0.18 });
        }
        break;
      case 'notify':
        this.tone(1046.5, 0.15, { gain: 0.07 });
        this.tone(1568, 0.25, { gain: 0.05, delay: 0.09 });
        break;
      case 'whoosh':
        this.burst(0.6, { freq: 900, type: 'bandpass', gain: 0.12 });
        break;
      case 'click':
        this.burst(0.03, { freq: 4000, gain: 0.08 });
        break;
      case 'success':
        [523.3, 659.3, 784].forEach((f, i) => this.tone(f, 0.5, { gain: 0.06, delay: i * 0.08, type: 'triangle' }));
        break;
      case 'fail':
        this.tone(196, 0.4, { gain: 0.07, type: 'sawtooth' });
        this.tone(185, 0.45, { gain: 0.05, type: 'sawtooth', delay: 0.05 });
        break;
      case 'stamp':
        this.burst(0.15, { freq: 180, type: 'lowpass', gain: 0.5 });
        this.tone(70, 0.3, { gain: 0.2 });
        break;
      case 'type':
        this.burst(0.02, { freq: 3500, gain: 0.03 });
        break;
      case 'transit':
        this.burst(2.2, { freq: 300, type: 'lowpass', gain: 0.35 });
        [659.3, 523.3].forEach((f, i) => this.tone(f, 0.8, { gain: 0.05, delay: 1 + i * 0.35, type: 'triangle' }));
        break;
      case 'boom':
        this.tone(55, 2.5, { gain: 0.35, attack: 0.02 });
        this.burst(1.8, { freq: 120, type: 'lowpass', gain: 0.4 });
        break;
    }
  }

  /** Cinematic drone for menu / openings. Returns stop(). */
  drone(): () => void {
    if (!this.ctx || !this.master || !this.enabled) return () => {};
    const ctx = this.ctx;
    const g = ctx.createGain();
    g.gain.value = 0;
    g.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 4);
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = 400;
    f.connect(g).connect(this.master);
    const oscs = [55, 55.4, 82.4, 110.2].map((fr) => {
      const o = ctx.createOscillator();
      o.type = 'sawtooth';
      o.frequency.value = fr;
      o.connect(f);
      o.start();
      return o;
    });
    const l = this.lfo(f.frequency, 0.05, 250);
    return () => {
      g.gain.setTargetAtTime(0, ctx.currentTime, 0.8);
      window.setTimeout(() => {
        oscs.forEach((o) => { try { o.stop(); } catch { /* noop */ } });
        l.stop();
      }, 3000);
    };
  }
}

export const audio = new AudioEngine();
