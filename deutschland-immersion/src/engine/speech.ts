/**
 * Speech layer. Text-to-speech uses the browser's speechSynthesis (German voices
 * if the OS provides them). Speech recognition uses the Web Speech API where the
 * browser supports it (Chrome/Edge; audio is processed by the browser vendor's
 * service). Everything degrades gracefully: typed input always works.
 */

type Rec = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: { resultIndex: number; results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
};

let voices: SpeechSynthesisVoice[] = [];

function loadVoices() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  voices = window.speechSynthesis.getVoices();
}
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;
}

export function ttsAvailable(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function germanVoices(): SpeechSynthesisVoice[] {
  return voices.filter((v) => v.lang?.toLowerCase().startsWith('de'));
}

function pickVoice(lang: string, gender: 'f' | 'm' | undefined, seed: number): SpeechSynthesisVoice | undefined {
  const pool = voices.filter((v) => v.lang?.toLowerCase().startsWith(lang.slice(0, 2)));
  if (!pool.length) return undefined;
  const female = /female|anna|helena|katja|marlene|petra|vicki|hedda|amala|sabine|google deutsch$/i;
  const male = /male|markus|yannick|stefan|hans|conrad|killian|daniel/i;
  const byGender = gender ? pool.filter((v) => (gender === 'f' ? female.test(v.name) : male.test(v.name))) : [];
  const list = byGender.length ? byGender : pool;
  return list[seed % list.length];
}

let speakingToken = 0;

export function speak(text: string, opts: { rate?: number; pitch?: number; gender?: 'f' | 'm'; seed?: number; lang?: string; volume?: number } = {}): Promise<void> {
  return new Promise((resolve) => {
    if (!ttsAvailable() || !text.trim()) return resolve();
    const synth = window.speechSynthesis;
    synth.cancel();
    const token = ++speakingToken;
    const clean = text.replace(/[„“”"–—…*]/g, ' ').replace(/§/g, 'Paragraf ').replace(/Abs\./g, 'Absatz');
    const u = new SpeechSynthesisUtterance(clean);
    u.lang = opts.lang ?? 'de-DE';
    const v = pickVoice(u.lang, opts.gender, opts.seed ?? 0);
    if (v) u.voice = v;
    u.rate = opts.rate ?? 1;
    u.pitch = opts.pitch ?? 1;
    u.volume = opts.volume ?? 1;
    const done = () => token === speakingToken && resolve();
    u.onend = done;
    u.onerror = done;
    synth.speak(u);
    // Safety: some engines never fire onend.
    setTimeout(done, Math.max(2500, clean.length * 95));
  });
}

export function stopSpeaking() {
  if (ttsAvailable()) window.speechSynthesis.cancel();
  speakingToken++;
}

export function sttAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  const w = window as unknown as Record<string, unknown>;
  return !!(w.SpeechRecognition || w.webkitSpeechRecognition);
}

export interface Recognizer {
  start: () => void;
  stop: () => void;
}

export function createRecognizer(lang: string, onText: (text: string, final: boolean) => void, onState: (s: 'listening' | 'idle' | 'error', err?: string) => void): Recognizer | null {
  if (!sttAvailable()) return null;
  const w = window as unknown as Record<string, new () => Rec>;
  const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
  const r = new Ctor();
  r.lang = lang;
  r.interimResults = true;
  r.continuous = true;
  r.maxAlternatives = 1;
  let finalText = '';
  r.onresult = (e) => {
    let interim = '';
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const res = e.results[i];
      if (res.isFinal) finalText += res[0].transcript + ' ';
      else interim += res[0].transcript;
    }
    onText((finalText + interim).trim(), !interim);
  };
  r.onerror = (e) => onState('error', e.error);
  r.onend = () => onState('idle');
  return {
    start: () => {
      finalText = '';
      try {
        r.start();
        onState('listening');
      } catch {
        onState('error', 'start');
      }
    },
    stop: () => r.stop(),
  };
}
