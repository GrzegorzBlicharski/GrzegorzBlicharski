import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Choice, DialogueNode, Effect, Evaluation, FreeInputSpec, InspectSpec, MissionStatus, RetrievalItem, SkillId, Tier, Weather } from './types';
import { TIER_ORDER } from './types';
import {
  newProfile,
  recordIssues,
  recordTarget,
  snapshot,
  TIER_VALUE,
  updateSkill,
  vocabEvent,
  pickRetrieval,
  weaknesses,
  cefrOf,
  overallRating,
  type LanguageProfile,
} from './languageModel';
import { checkCondition, taskRating, type PlayerInfo } from './logic';
import { difficulty } from './difficulty';
import { ACHIEVEMENTS, CAREER, DIALOGUES, EMAILS, LOC, MIS, RETRIEVAL, TARGET_BY_ID, TERM_BY_ID, lookupWord } from '../content';

export const SAVE_KEY = 'deutschland-immersion.save.v1';

export interface Settings {
  hints: 'auto' | 'always' | 'never';
  subtitles: 'auto' | 'always' | 'never';
  tts: boolean;
  volume: number;
  ambience: boolean;
  reduceMotion: boolean;
  aiKey: string;
  aiModel: string;
}

export interface Message {
  id: string;
  from: string; // npc id or 'player'
  text: string;
  time: string;
  day: number;
  ts: number;
  read: boolean;
  retrieval?: string; // RetrievalItem id awaiting reply
  answered?: boolean;
}

export interface MissionState {
  status: MissionStatus;
  done: string[];
  outcome?: string;
  scores: number[];
  startedAt?: number;
  completedAt?: number;
}

export interface Debrief {
  missionId: string;
  xp: number;
  outcome?: string;
  avgScore: number;
  answers: number;
  tiers: Partial<Record<Tier, number>>;
  rel: Record<string, number>;
  before: Record<SkillId, number>;
  after: Record<SkillId, number>;
  unlocked: string[];
  newMission?: string;
  topIssue?: string;
  achievements: string[];
}

export interface DialogueRuntime {
  id: string;
  node: string;
  mode: 'scene' | 'call' | 'announcement';
  retrievalItem?: string;
}

interface Pending {
  listening?: { revealed: boolean };
  reading?: { assisted: boolean };
}

export interface GameData {
  version: number;
  started: boolean;
  player: PlayerInfo & { createdAt: number };
  day: number;
  time: string;
  weather: Weather;
  city: string;
  location: string;
  unlocked: string[];
  missions: Record<string, MissionState>;
  flags: Record<string, boolean>;
  items: string[];
  rel: Record<string, number>;
  memories: Record<string, string[]>;
  xp: number;
  reputation: Record<string, number>;
  achievements: Record<string, number>;
  messages: Message[];
  emails: { id: string; read: boolean; ts: number }[];
  terms: Record<string, { collected: number; ok: number; fail: number }>;
  lang: LanguageProfile;
  settings: Settings;
  awarded: Record<string, true>;
  stats: { answers: number; professional: number; hints: number; subtitleReveals: number; lookups: number; training: number; playMs: number };
  pendingCall: { dialogue: string; from: string; at: number } | null;
  missionAcc: Record<string, { scores: number[]; tiers: Partial<Record<Tier, number>>; rel: Record<string, number>; before: Record<SkillId, number>; issues: string[] }>;
  career: string;
}

export type Overlay = null | 'map' | 'phone' | 'training' | 'profile' | 'debrief' | 'dayEnd' | 'settings' | 'log';

export interface UIState {
  screen: 'menu' | 'newgame' | 'opening' | 'world';
  overlay: Overlay;
  phoneApp: string | null;
  dialogue: DialogueRuntime | null;
  debriefQueue: Debrief[];
  toast: { id: number; text: string; kind: 'info' | 'xp' | 'warn' | 'achievement' } | null;
  chapterCard: { title: string; subtitle?: string } | null;
  travel: { to: string; from: string } | null;
  ringing: boolean;
  pending: Pending;
}

export interface Actions {
  newGame: (p: PlayerInfo, level?: 'B1' | 'B2' | 'C1') => void;
  continueGame: () => void;
  setScreen: (s: UIState['screen']) => void;
  openOverlay: (o: Overlay, app?: string | null) => void;
  closeOverlay: () => void;
  setPhoneApp: (app: string | null) => void;
  startDialogue: (id: string, retrievalItem?: string) => void;
  enterNode: (nodeId: string) => void;
  endDialogue: () => void;
  resolveNext: (node: DialogueNode) => string | null;
  chooseOption: (choice: Choice, node: DialogueNode) => void;
  submitEvaluation: (e: Evaluation, spec: FreeInputSpec, text: string, node: DialogueNode) => void;
  submitInspect: (spec: InspectSpec, marked: string[]) => { found: string[]; missed: string[]; wrong: string[] };
  recordRetrievalChoice: (item: RetrievalItem, correct: boolean) => void;
  recordRetrievalInput: (item: RetrievalItem, e: Evaluation, text: string) => void;
  answerMessage: (msgId: string, text: string, ok: boolean, tier?: Tier) => void;
  applyEffects: (effects: Effect[], key: string) => void;
  travelTo: (loc: string) => void;
  finishTravel: () => void;
  acceptCall: () => void;
  declineCall: () => void;
  ring: () => void;
  revealSubtitle: () => void;
  useGloss: (words?: string[]) => void;
  lookupVocab: (id: string) => void;
  markRead: (from: string) => void;
  readEmail: (id: string) => void;
  toast: (text: string, kind?: 'info' | 'xp' | 'warn' | 'achievement') => void;
  clearToast: () => void;
  shiftDebrief: () => void;
  clearChapter: () => void;
  updateSettings: (s: Partial<Settings>) => void;
  trainingResult: (target: string, correct: boolean) => void;
  finishTraining: (score: number) => void;
  maybeSendRetrievalSMS: (force?: boolean) => void;
  resetAll: () => void;
  tick: (ms: number) => void;
  importSave: (json: string) => boolean;
}

export type Store = GameData & { ui: UIState } & Actions;

const now = () => Date.now();

const DEFAULT_SETTINGS: Settings = {
  hints: 'auto',
  subtitles: 'auto',
  tts: true,
  volume: 0.7,
  ambience: true,
  reduceMotion: false,
  aiKey: '',
  aiModel: 'claude-opus-5',
};

function freshData(p?: PlayerInfo): GameData {
  return {
    version: 1,
    started: false,
    player: { first: p?.first ?? '', last: p?.last ?? '', anrede: p?.anrede ?? '', createdAt: now() },
    day: 1,
    time: '06:42',
    weather: 'overcast',
    city: 'berlin',
    location: 'hbf',
    unlocked: ['hbf'],
    missions: {},
    flags: {},
    items: [],
    rel: {},
    memories: {},
    xp: 0,
    reputation: { berlin: 0 },
    achievements: {},
    messages: [],
    emails: [],
    terms: {},
    lang: newProfile(),
    settings: { ...DEFAULT_SETTINGS },
    awarded: {},
    stats: { answers: 0, professional: 0, hints: 0, subtitleReveals: 0, lookups: 0, training: 0, playMs: 0 },
    pendingCall: null,
    missionAcc: {},
    career: 'NEWCOMER',
  };
}

const freshUI = (): UIState => ({
  screen: 'menu',
  overlay: null,
  phoneApp: null,
  dialogue: null,
  debriefQueue: [],
  toast: null,
  chapterCard: null,
  travel: null,
  ringing: false,
  pending: {},
});

let toastId = 0;

/** Effects that must fire only once per authored position (prevents farming on replays). */
const ONCE: Effect['type'][] = ['xp', 'rel', 'skill', 'reputation', 'memory', 'message', 'email', 'call', 'term', 'vocab', 'item', 'unlockLocation', 'achievement', 'chapterCard'];

export const useGame = create<Store>()(
  persist(
    (set, get) => {
      // ------------------------------------------------------------ helpers
      const cond = () => {
        const s = get();
        return { flags: s.flags, items: s.items, missions: s.missions, rel: s.rel, lang: s.lang };
      };

      const activeMissionId = (): string | undefined => {
        const s = get();
        const act = Object.entries(s.missions).filter(([, m]) => m.status === 'active');
        return act.length ? act[act.length - 1][0] : undefined;
      };

      const bumpAcc = (fn: (a: GameData['missionAcc'][string]) => void) => {
        const id = activeMissionId();
        if (!id) return;
        const s = get();
        const a = s.missionAcc[id];
        if (!a) return;
        const copy = { ...a, scores: [...a.scores], tiers: { ...a.tiers }, rel: { ...a.rel }, issues: [...a.issues] };
        fn(copy);
        set({ missionAcc: { ...s.missionAcc, [id]: copy } });
      };

      const addXp = (amount: number, reason?: string) => {
        if (amount <= 0) return;
        set((s) => ({ xp: s.xp + amount }));
        if (reason) get().toast(`+${amount} XP · ${reason}`, 'xp');
      };

      const unlockAchievement = (id: string) => {
        const s = get();
        if (s.achievements[id]) return;
        const a = ACHIEVEMENTS.find((x) => x.id === id);
        if (!a) return;
        set({ achievements: { ...s.achievements, [id]: now() } });
        get().toast(`${a.icon}  ${a.title}`, 'achievement');
      };

      const checkAchievements = () => {
        const s = get();
        if (s.stats.professional >= 3) unlockAchievement('polite');
        for (const [, t] of Object.entries(s.lang.targets)) if (t.errors >= 2 && t.mastery >= 0.7) unlockAchievement('comeback');
        if (s.flags.found_pl7 && s.flags.found_pl9_1 && s.flags.found_pl9_2 && !s.flags.inspect_false) unlockAchievement('zero_counter');
        if (s.flags.right_train && !s.flags.wrong_train) unlockAchievement('right_platform');
        if (s.flags.dinner_amendment && !s.flags.dinner_overridden && s.missions.m_dinner?.status === 'completed' && !s.flags.dinner_kessler_solved) unlockAchievement('diplomat');
        if (s.missions.m_amt?.status === 'completed' && !s.flags.amt_blocked) unlockAchievement('bureaucrat');
        if (s.flags.day1_done) unlockAchievement('day1');
      };

      const updateCareer = () => {
        const s = get();
        const overall = overallRating(s.lang);
        let rank = 'NEWCOMER';
        for (const step of CAREER) {
          const ok = step.reqs.every((r) =>
            r.mission ? s.missions[r.mission]?.status === 'completed' : r.skill ? s.lang.skills[r.skill] >= (r.min ?? 0) : r.overall ? overall >= r.overall : true,
          );
          if (ok) rank = step.rank;
          else break;
        }
        if (rank !== s.career) {
          set({ career: rank });
          const step = CAREER.find((c) => c.rank === rank);
          if (step) get().toast(`Karriere: ${step.title}`, 'achievement');
        }
      };

      const startMission = (id: string) => {
        const s = get();
        const cur = s.missions[id];
        if (cur && cur.status !== 'locked' && cur.status !== 'available') return;
        set({
          missions: { ...s.missions, [id]: { status: 'active', done: [], scores: [], startedAt: now() } },
          missionAcc: { ...s.missionAcc, [id]: { scores: [], tiers: {}, rel: {}, before: { ...s.lang.skills }, issues: [] } },
        });
        const m = MIS[id];
        if (m) get().toast(`NEUE MISSION · ${m.codename}`, 'info');
      };

      const completeMission = (id: string, outcome?: string) => {
        const s = get();
        const cur = s.missions[id];
        if (!cur || cur.status === 'completed') return;
        const m = MIS[id];
        const a = s.missionAcc[id];
        const avg = a && a.scores.length ? a.scores.reduce((x, y) => x + y, 0) / a.scores.length : 60;
        // XP scales with demonstrated quality, not with clicking through.
        const xp = Math.round((m?.xp ?? 100) * (0.4 + 0.6 * (avg / 100)));
        const unlockedBefore = [...s.unlocked];
        set({
          missions: { ...s.missions, [id]: { ...cur, status: 'completed', outcome, completedAt: now(), scores: a?.scores ?? [] } },
          lang: snapshot(s.lang, m ? m.codename : id),
        });
        addXp(xp);
        get().applyEffects(m?.rewards ?? [], `mission.${id}.rewards`);
        const after = get();
        const newMission = (m?.rewards ?? []).find((e) => e.type === 'startMission') as { mission: string } | undefined;
        const achBefore = Object.keys(s.achievements);
        checkAchievements();
        updateCareer();
        const debrief: Debrief = {
          missionId: id,
          xp,
          outcome,
          avgScore: Math.round(avg),
          answers: a?.scores.length ?? 0,
          tiers: a?.tiers ?? {},
          rel: a?.rel ?? {},
          before: a?.before ?? s.lang.skills,
          after: { ...after.lang.skills },
          unlocked: after.unlocked.filter((l) => !unlockedBefore.includes(l)),
          newMission: newMission?.mission,
          topIssue: a?.issues[0],
          achievements: Object.keys(get().achievements).filter((x) => !achBefore.includes(x)),
        };
        set((st) => ({ ui: { ...st.ui, debriefQueue: [...st.ui.debriefQueue, debrief] } }));
      };

      const pushMessage = (from: string, text: string, extra?: Partial<Message>) => {
        const s = get();
        const msg: Message = { id: `${now()}-${Math.random().toString(36).slice(2, 7)}`, from, text, time: s.time, day: s.day, ts: now(), read: from === 'player', ...extra };
        set({ messages: [...s.messages, msg] });
        if (from !== 'player') get().toast(`Neue Nachricht · ${from === 'kessler' ? 'Dr. Kessler' : from.charAt(0).toUpperCase() + from.slice(1)}`, 'info');
      };

      /** Start the location's arrival scene if one applies and nothing else is on screen. */
      const checkArrival = (delay = 350) => {
        setTimeout(() => {
          const st = get();
          if (st.ui.dialogue || st.ui.overlay || st.ui.travel || st.ui.screen !== 'world') return;
          const loc = LOC[st.location];
          const ent = loc?.onEnter?.find((e) => checkCondition(e.condition, cond()));
          if (ent) st.startDialogue(ent.dialogue);
        }, delay);
      };

      const creditPending = (quality: number) => {
        const s = get();
        const p = s.ui.pending;
        let lang = s.lang;
        if (p.listening) lang = updateSkill(lang, 'listening', quality * (p.listening.revealed ? 0.6 : 1), 300);
        if (p.reading) lang = updateSkill(lang, 'reading', quality * (p.reading.assisted ? 0.6 : 1), 300);
        if (p.listening || p.reading) set({ lang, ui: { ...s.ui, pending: {} } });
      };

      return {
        ...freshData(),
        ui: freshUI(),

        // ---------------------------------------------------------- lifecycle
        newGame: (p, level = 'B1') => {
          const settings = get().settings;
          const data = freshData(p);
          // Self-declared placement only shifts the starting estimate; demonstrated performance decides from here.
          const shift = level === 'C1' ? 400 : level === 'B2' ? 200 : 0;
          if (shift) data.lang = { ...data.lang, skills: Object.fromEntries(Object.entries(data.lang.skills).map(([k, v]) => [k, v + shift])) as typeof data.lang.skills };
          set({ ...data, settings, started: true, ui: { ...freshUI(), screen: 'opening' } });
          startMission('m_platform');
          set((s) => ({ emails: [...s.emails, { id: 'mail_welcome', read: false, ts: now() }] }));
        },
        continueGame: () => set((s) => ({ ui: { ...freshUI(), screen: 'world' }, pendingCall: s.pendingCall })),
        setScreen: (screen) => set((s) => ({ ui: { ...s.ui, screen } })),
        openOverlay: (overlay, app = null) => set((s) => ({ ui: { ...s.ui, overlay, phoneApp: app ?? s.ui.phoneApp } })),
        closeOverlay: () => {
          set((s) => ({ ui: { ...s.ui, overlay: null } }));
          checkArrival();
        },
        setPhoneApp: (phoneApp) => set((s) => ({ ui: { ...s.ui, phoneApp } })),
        resetAll: () => {
          set({ ...freshData(), ui: freshUI() });
        },
        tick: (ms) => set((s) => ({ stats: { ...s.stats, playMs: s.stats.playMs + ms } })),
        importSave: (json) => {
          try {
            const data = JSON.parse(json);
            const st = data.state ?? data;
            if (!st || typeof st !== 'object' || !st.lang) return false;
            set({ ...freshData(), ...st, ui: freshUI() });
            return true;
          } catch {
            return false;
          }
        },

        // ---------------------------------------------------------- dialogue
        startDialogue: (id, retrievalItem) => {
          const d = DIALOGUES[id];
          if (!d) return;
          set((s) => ({ ui: { ...s.ui, overlay: null, dialogue: { id, node: d.start, mode: d.mode ?? 'scene', retrievalItem } } }));
          get().enterNode(d.start);
        },

        enterNode: (nodeId) => {
          const s = get();
          const rt = s.ui.dialogue;
          if (!rt) return;
          let dlgId = rt.id;
          let id = nodeId;
          // follow branches & cross-dialogue jumps
          for (let guard = 0; guard < 20; guard++) {
            if (id.startsWith('@')) {
              dlgId = id.slice(1);
              const d2 = DIALOGUES[dlgId];
              if (!d2) return get().endDialogue();
              id = d2.start;
              continue;
            }
            const d = DIALOGUES[dlgId];
            const node = d?.nodes[id];
            if (!node) return get().endDialogue();
            // Pure routing nodes branch immediately; nodes with content show first and
            // treat `branch` as a conditional `next` (see resolveNext).
            const hasContent = !!(node.text || node.direction || node.document || node.choices || node.input || node.inspect || node.retrieval);
            const hit = !hasContent ? node.branch?.find((b) => checkCondition(b.condition, cond())) : undefined;
            if (hit) {
              if (node.effects?.length) get().applyEffects(node.effects, `${dlgId}.${id}`);
              id = hit.next;
              continue;
            }
            // retrieval slot: inject an adaptive moment or skip
            if (node.retrieval) {
              const known = Object.keys(get().rel);
              const item = pickRetrieval(get().lang, RETRIEVAL, {
                channel: 'dialogue',
                speakers: [node.retrieval.speaker, ...known],
                level: cefrOf(overallRating(get().lang)),
                pool: node.retrieval.pool,
              });
              if (!item) {
                if (node.next) {
                  id = node.next;
                  continue;
                }
                return get().endDialogue();
              }
              set((st) => ({ ui: { ...st.ui, dialogue: { id: dlgId, node: id, mode: DIALOGUES[dlgId].mode ?? 'scene', retrievalItem: item.id } } }));
              set((st) => ({ lang: { ...st.lang, retrievalUsed: { ...st.lang.retrievalUsed, [item.id]: now() } } }));
              return;
            }
            // regular node: apply effects & show
            set((st) => ({ ui: { ...st.ui, dialogue: { id: dlgId, node: id, mode: DIALOGUES[dlgId].mode ?? 'scene' } } }));
            if (node.skill === 'listening' && node.listening) set((st) => ({ ui: { ...st.ui, pending: { ...st.ui.pending, listening: { revealed: false } } } }));
            if (node.skill === 'reading') set((st) => ({ ui: { ...st.ui, pending: { ...st.ui.pending, reading: { assisted: false } } } }));
            if (node.effects?.length) get().applyEffects(node.effects, `${dlgId}.${id}`);
            // vocabulary exposure
            if (node.text && node.speaker !== 'player') {
              const ids = [...new Set(node.text.split(/\s+/).map((w) => lookupWord(w)?.id).filter(Boolean) as string[])];
              if (ids.length) set((st) => ({ lang: vocabEvent(st.lang, ids, 'seen') }));
            }
            return;
          }
        },

        resolveNext: (node) => {
          const hit = node.branch?.find((b) => checkCondition(b.condition, cond()));
          if (hit) return hit.next;
          if (node.end || !node.next) return null;
          return node.next;
        },

        endDialogue: () => {
          set((s) => ({ ui: { ...s.ui, dialogue: null, pending: {} } }));
          const s = get();
          if (s.ui.debriefQueue.length) set((st) => ({ ui: { ...st.ui, overlay: 'debrief' } }));
          checkArrival();
        },

        chooseOption: (choice, node) => {
          const s = get();
          const q = choice.quality ? TIER_VALUE[choice.quality] : undefined;
          if (q !== undefined) {
            let lang = s.lang;
            for (const t of choice.targets ?? []) lang = recordTarget(lang, t, q, 'recognition');
            if (choice.quality && TIER_ORDER.indexOf(choice.quality) < TIER_ORDER.indexOf('correct') && choice.feedback) {
              const cat = choice.targets?.[0] ? TARGET_BY_ID[choice.targets[0]]?.category ?? 'grammar' : 'grammar';
              lang = recordIssues(lang, [{ target: choice.targets?.[0], category: cat, severity: 2, message: choice.feedback }], choice.text, `${s.ui.dialogue?.id}`);
            }
            if (choice.targets?.length) lang = updateSkill(lang, 'grammar', q, 280, 10);
            set({ lang });
            if (choice.quality === 'professional') set((st) => ({ stats: { ...st.stats, professional: st.stats.professional + 1 } }));
            if (q >= 0.85 && !s.awarded[`choice.${s.ui.dialogue?.id}.${node.id}`]) {
              set((st) => ({ awarded: { ...st.awarded, [`choice.${st.ui.dialogue?.id}.${node.id}`]: true } }));
              addXp(q >= 0.95 ? 8 : 5);
            }
            bumpAcc((a) => {
              a.tiers[choice.quality!] = (a.tiers[choice.quality!] ?? 0) + 1;
            });
            creditPending(q);
          } else creditPending(0.7);
          if (choice.effects?.length) get().applyEffects(choice.effects, `${s.ui.dialogue?.id}.${node.id}.${choice.next}`);
          checkAchievements();
        },

        submitEvaluation: (e, spec, text, node) => {
          const s = get();
          const q = TIER_VALUE[e.tier];
          const dlgId = s.ui.dialogue?.id ?? 'sms';
          let lang = s.lang;
          for (const t of spec.targets) {
            const hit = e.issues.some((i) => i.target === t);
            lang = recordTarget(lang, t, hit ? Math.min(q, 0.35) : q, 'production');
          }
          for (const i of e.issues) if (i.target && !spec.targets.includes(i.target)) lang = recordTarget(lang, i.target, 0.2, 'production');
          lang = recordIssues(lang, e.issues, text, dlgId);
          const levels = spec.targets.map((t) => TARGET_BY_ID[t]?.level).filter(Boolean) as never[];
          const tr = taskRating(levels);
          const skill: SkillId = spec.skill ?? (spec.mode === 'write' ? 'writing' : spec.mode === 'translate' ? 'translation' : 'speaking');
          lang = updateSkill(lang, skill, e.score / 100, tr);
          lang = updateSkill(lang, 'grammar', e.dims.correctness / 100, tr, 16);
          if (spec.register === 'formal' && (spec.mode === 'write' || skill === 'negotiation')) lang = updateSkill(lang, 'professional', (e.dims.register + e.score) / 200, tr, 18);
          if (spec.timeLimitSec) lang = updateSkill(lang, 'pressure', e.score / 100, tr, 16);
          if (spec.mode === 'translate' && spec.targets.some((t) => t.startsWith('term-') || t === 'juristendeutsch')) lang = updateSkill(lang, 'legal', e.score / 100, tr, 20);
          // vocabulary production credit
          const produced = [...new Set(text.split(/\s+/).map((w) => lookupWord(w)?.id).filter(Boolean) as string[])];
          if (produced.length) {
            lang = vocabEvent(lang, produced, 'produced');
            lang = updateSkill(lang, 'vocabulary', Math.min(1, 0.55 + produced.length * 0.1), tr, 10);
          }
          lang = { ...lang, productions: [{ t: now(), tier: e.tier, score: e.score, text, context: dlgId }, ...lang.productions].slice(0, 200) };
          // translation memory
          if (spec.terms?.length) {
            const tm = spec.terms.map((t) => ({ t: now(), term: t.term, ok: !e.issues.some((i) => i.category === 'terminology' && i.message.includes(t.term.split(' ')[0])), text }));
            lang = { ...lang, translationMemory: [...tm, ...lang.translationMemory].slice(0, 200) };
          }
          set({ lang, stats: { ...s.stats, answers: s.stats.answers + 1, professional: s.stats.professional + (e.tier === 'professional' || e.tier === 'native' ? 1 : 0) } });
          const key = `eval.${dlgId}.${node.id}`;
          if (!s.awarded[key]) {
            set((st) => ({ awarded: { ...st.awarded, [key]: true } }));
            addXp(Math.round(e.score / 5));
          }
          bumpAcc((a) => {
            a.scores.push(e.score);
            a.tiers[e.tier] = (a.tiers[e.tier] ?? 0) + 1;
            if (e.keyImprovement && e.tier !== 'native') a.issues.push(e.keyImprovement);
          });
          creditPending(q);
          if (e.tier !== 'incorrect') unlockAchievement('first_words');
          if (e.tier === 'native') unlockAchievement('native_moment');
          if (spec.mode === 'translate' && q >= 0.7) unlockAchievement('translator');
          if (s.ui.dialogue?.mode === 'call' && s.ui.pending.listening && !s.ui.pending.listening.revealed && q >= 0.7) unlockAchievement('listener');
          checkAchievements();
          updateCareer();
        },

        submitInspect: (spec, marked) => {
          const found = marked.filter((m) => spec.correct.includes(m));
          const wrong = marked.filter((m) => !spec.correct.includes(m));
          const missed = spec.correct.filter((c) => !marked.includes(c));
          const effects: Effect[] = found.map((f) => ({ type: 'flag', flag: `${spec.flagPrefix}_${f}` }) as Effect);
          if (wrong.length) effects.push({ type: 'flag', flag: 'inspect_false' });
          get().applyEffects(effects, `inspect.${spec.flagPrefix}`);
          const q = Math.max(0, (found.length - wrong.length * 0.5) / spec.correct.length);
          let lang = get().lang;
          for (const t of spec.targets) lang = recordTarget(lang, t, q, 'recognition');
          lang = updateSkill(lang, 'reading', q, 560, 30);
          lang = updateSkill(lang, 'legal', q, 600, 24);
          if (missed.length) lang = recordIssues(lang, missed.map((m) => ({ category: 'reading', severity: 3, message: spec.explain[m] ?? m })), marked.join(','), 'inspect');
          set({ lang });
          addXp(found.length * 15, `${found.length}/${spec.correct.length} Abweichungen`);
          bumpAcc((a) => {
            a.scores.push(Math.round(q * 100));
          });
          checkAchievements();
          return { found, missed, wrong };
        },

        recordRetrievalChoice: (item, correct) => {
          let lang = recordTarget(get().lang, item.target, correct ? 0.85 : 0.1, 'recognition');
          if (!correct) {
            const fb = item.choices?.find((c) => !c.correct)?.feedback ?? '';
            lang = recordIssues(lang, [{ target: item.target, category: TARGET_BY_ID[item.target]?.category ?? 'grammar', severity: 2, message: fb }], item.prompt, `retrieval.${item.id}`);
          }
          lang = updateSkill(lang, 'grammar', correct ? 0.85 : 0.1, 300, 8);
          set({ lang: { ...lang, retrievalUsed: { ...lang.retrievalUsed, [item.id]: now() } } });
          if (correct) addXp(4);
          checkAchievements();
        },

        recordRetrievalInput: (item, e, text) => {
          let lang = recordTarget(get().lang, item.target, TIER_VALUE[e.tier], 'production');
          lang = recordIssues(lang, e.issues, text, `retrieval.${item.id}`);
          lang = updateSkill(lang, 'writing', e.score / 100, 320, 12);
          lang = { ...lang, retrievalUsed: { ...lang.retrievalUsed, [item.id]: now() }, productions: [{ t: now(), tier: e.tier, score: e.score, text, context: `retrieval.${item.id}` }, ...lang.productions].slice(0, 200) };
          set({ lang });
          addXp(Math.round(e.score / 8));
          checkAchievements();
        },

        answerMessage: (msgId, text, ok) => {
          const s = get();
          const msg = s.messages.find((m) => m.id === msgId);
          if (!msg) return;
          set({ messages: s.messages.map((m) => (m.id === msgId ? { ...m, answered: true, read: true } : m)) });
          pushMessage('player', text);
          const replies: Record<string, [string, string]> = {
            kasia: ['Super! 😊👍', 'Hmm, ich glaube, ich weiß, was du meinst 😅'],
            lukas: ['Stark 💪', 'Hä? 😄 Egal, passt schon.'],
            kessler: ['Danke. – J. K.', 'Bitte präziser. – J. K.'],
            emre: ['Haha, top!', 'Häh? 😂'],
            wiesner: ['Gut. – E. Wiesner', 'Wie bitte? – E. Wiesner'],
          };
          const r = replies[msg.from] ?? ['👍', '?'];
          setTimeout(() => pushMessage(msg.from, ok ? r[0] : r[1]), 1400);
        },

        // ---------------------------------------------------------- effects
        applyEffects: (effects, key) => {
          effects.forEach((e, i) => {
            const k = `${key}.${i}`;
            const s = get();
            if (ONCE.includes(e.type)) {
              if (s.awarded[k]) return;
              set((st) => ({ awarded: { ...st.awarded, [k]: true } }));
            }
            switch (e.type) {
              case 'flag':
                set((st) => ({ flags: { ...st.flags, [e.flag]: e.value ?? true } }));
                break;
              case 'item':
                set((st) => ({ items: e.remove ? st.items.filter((x) => x !== e.item) : st.items.includes(e.item) ? st.items : [...st.items, e.item] }));
                break;
              case 'rel': {
                set((st) => ({ rel: { ...st.rel, [e.npc]: Math.max(-100, Math.min(100, (st.rel[e.npc] ?? 0) + e.delta)) } }));
                bumpAcc((a) => {
                  a.rel[e.npc] = (a.rel[e.npc] ?? 0) + e.delta;
                });
                break;
              }
              case 'memory':
                set((st) => ({ memories: { ...st.memories, [e.npc]: [...(st.memories[e.npc] ?? []), e.text] } }));
                break;
              case 'xp':
                addXp(e.amount, e.reason);
                break;
              case 'skill':
                set((st) => ({ lang: { ...st.lang, skills: { ...st.lang.skills, [e.skill]: Math.max(0, Math.min(1000, st.lang.skills[e.skill] + e.delta)) } } }));
                break;
              case 'reputation':
                set((st) => ({ reputation: { ...st.reputation, [e.city]: (st.reputation[e.city] ?? 0) + e.delta } }));
                break;
              case 'unlockLocation':
                set((st) => ({ unlocked: st.unlocked.includes(e.location) ? st.unlocked : [...st.unlocked, e.location] }));
                break;
              case 'startMission':
                startMission(e.mission);
                break;
              case 'objective':
                set((st) => {
                  const m = st.missions[e.mission];
                  if (!m || m.done.includes(e.objective)) return {};
                  return { missions: { ...st.missions, [e.mission]: { ...m, done: [...m.done, e.objective] } } };
                });
                break;
              case 'completeMission':
                completeMission(e.mission, e.outcome);
                break;
              case 'time':
                set({ time: e.set });
                break;
              case 'weather':
                set({ weather: e.weather });
                break;
              case 'message':
                pushMessage(e.from, e.text);
                break;
              case 'email':
                set((st) => ({ emails: st.emails.some((x) => x.id === e.emailId) ? st.emails : [...st.emails, { id: e.emailId, read: false, ts: now() }] }));
                if (EMAILS.find((m) => m.id === e.emailId)) get().toast('Neue E-Mail', 'info');
                break;
              case 'call':
                set({ pendingCall: { dialogue: e.dialogue, from: e.from, at: now() + (e.delayMs ?? 1500) } });
                break;
              case 'term':
                set((st) => ({ terms: { ...st.terms, [e.term]: { ...(st.terms[e.term] ?? { collected: now(), ok: 0, fail: 0 }) } } }));
                if (TERM_BY_ID[e.term]) get().toast(`Terminologie: ${TERM_BY_ID[e.term].de}`, 'info');
                break;
              case 'vocab': {
                const ids = e.words.map((w) => lookupWord(w)?.id).filter(Boolean) as string[];
                set((st) => ({ lang: vocabEvent(st.lang, ids, e.mode === 'produced' ? 'produced' : e.mode === 'recognized' ? 'recognized' : 'seen') }));
                break;
              }
              case 'moveTo':
                set((st) => ({ location: e.location, unlocked: st.unlocked.includes(e.location) || LOC[e.location]?.parent ? st.unlocked : [...st.unlocked, e.location] }));
                break;
              case 'achievement':
                unlockAchievement(e.id);
                break;
              case 'ui':
                if (e.open === 'training') setTimeout(() => get().openOverlay('training'), 50);
                else if (e.open === 'phone') setTimeout(() => get().openOverlay('phone'), 50);
                else setTimeout(() => get().openOverlay(e.open), 50);
                break;
              case 'advanceDay': {
                if (get().flags.day2_started) break;
                set((st) => ({
                  day: st.day + 1,
                  time: '07:40',
                  weather: 'overcast',
                  flags: { ...st.flags, day2_started: true },
                  unlocked: st.unlocked.includes('amt') ? st.unlocked : [...st.unlocked, 'amt'],
                  lang: snapshot(st.lang, `Ende Tag ${st.day}`),
                }));
                startMission('m_amt');
                pushMessage('kasia', 'Guten Morgen! ☀️ Heute ist dein Termin im Bürgeramt – 9:10 Uhr! Hast du alle Unterlagen? Ausweis, Formular, Wohnungsgeberbestätigung…');
                set((st) => ({ ui: { ...st.ui, overlay: 'dayEnd' } }));
                break;
              }
              case 'chapterCard':
                set((st) => ({ ui: { ...st.ui, chapterCard: { title: e.title, subtitle: e.subtitle } } }));
                break;
            }
          });
        },

        // ---------------------------------------------------------- world
        travelTo: (to) => {
          const s = get();
          if (to === s.location) return get().closeOverlay();
          set({ ui: { ...s.ui, overlay: null, travel: { to, from: s.location } } });
        },
        finishTravel: () => {
          const s = get();
          const tr = s.ui.travel;
          if (!tr) return;
          set({ location: tr.to, ui: { ...s.ui, travel: null } });
          const loc = LOC[tr.to];
          const ent = loc?.onEnter?.find((e) => checkCondition(e.condition, cond()));
          if (ent) checkArrival(900);
          else setTimeout(() => get().maybeSendRetrievalSMS(), 2500);
        },

        ring: () => set((s) => ({ ui: { ...s.ui, ringing: true } })),
        acceptCall: () => {
          const s = get();
          const c = s.pendingCall;
          set({ pendingCall: null, ui: { ...s.ui, ringing: false } });
          if (c) get().startDialogue(c.dialogue);
        },
        declineCall: () => {
          const s = get();
          const c = s.pendingCall;
          set({ ui: { ...s.ui, ringing: false }, pendingCall: c ? { ...c, at: now() + 15000 } : null });
          if (c?.from === 'kessler') setTimeout(() => pushMessage('kessler', 'Bitte rufen Sie mich zurück – es ist dringend. J. Kessler'), 1500);
        },
        revealSubtitle: () =>
          set((s) => ({ stats: { ...s.stats, subtitleReveals: s.stats.subtitleReveals + 1 }, ui: { ...s.ui, pending: { ...s.ui.pending, listening: s.ui.pending.listening ? { revealed: true } : undefined } } })),
        useGloss: () =>
          set((s) => ({
            stats: { ...s.stats, hints: s.stats.hints + 1 },
            ui: {
              ...s.ui,
              pending: {
                listening: s.ui.pending.listening ? { revealed: true } : undefined,
                reading: s.ui.pending.reading ? { assisted: true } : undefined,
              },
            },
          })),
        lookupVocab: (id) => set((s) => ({ lang: vocabEvent(s.lang, [id], 'lookup'), stats: { ...s.stats, lookups: s.stats.lookups + 1 } })),
        markRead: (from) => set((s) => ({ messages: s.messages.map((m) => (m.from === from ? { ...m, read: true } : m)) })),
        readEmail: (id) => set((s) => ({ emails: s.emails.map((m) => (m.id === id ? { ...m, read: true } : m)) })),
        toast: (text, kind = 'info') => set((s) => ({ ui: { ...s.ui, toast: { id: ++toastId, text, kind } } })),
        clearToast: () => set((s) => ({ ui: { ...s.ui, toast: null } })),
        shiftDebrief: () => {
          set((s) => {
            const q = s.ui.debriefQueue.slice(1);
            return { ui: { ...s.ui, debriefQueue: q, overlay: q.length ? 'debrief' : null } };
          });
          checkArrival(500);
        },
        clearChapter: () => set((s) => ({ ui: { ...s.ui, chapterCard: null } })),
        updateSettings: (p) => set((s) => ({ settings: { ...s.settings, ...p } })),

        // ---------------------------------------------------------- training & retrieval
        trainingResult: (target, correct) => {
          let lang = recordTarget(get().lang, target, correct ? 0.8 : 0.1, 'recognition');
          lang = updateSkill(lang, 'grammar', correct ? 0.8 : 0.1, 300, 8);
          if (!correct) lang = recordIssues(lang, [{ target, category: TARGET_BY_ID[target]?.category ?? 'grammar', severity: 2, message: `Training: ${TARGET_BY_ID[target]?.label ?? target}` }], '', 'training');
          set({ lang });
        },
        finishTraining: (score) => {
          set((s) => ({ stats: { ...s.stats, training: s.stats.training + 1 } }));
          addXp(Math.round(score / 4), 'Training');
          if (score >= 80) unlockAchievement('trainer');
          checkAchievements();
        },
        maybeSendRetrievalSMS: (force) => {
          const s = get();
          if (s.messages.some((m) => m.retrieval && !m.answered)) return;
          if (!force && Math.random() > 0.55) return;
          const d = difficulty(s.lang);
          const item = pickRetrieval(s.lang, RETRIEVAL, { channel: 'sms', speakers: Object.keys(s.rel).length ? Object.keys(s.rel) : ['kasia'], level: d.level });
          if (!item) return;
          const known = ['kasia', 'lukas', 'kessler', 'emre'].filter((n) => item.speakers.includes(n) || item.speakers.includes('*'));
          const from = known.find((n) => s.rel[n] !== undefined || n === 'kasia') ?? 'kasia';
          set((st) => ({ lang: { ...st.lang, retrievalUsed: { ...st.lang.retrievalUsed, [item.id]: now() } } }));
          pushMessage(from, item.prompt, { retrieval: item.id });
        },
      };
    },
    {
      name: SAVE_KEY,
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { ui, ...rest } = s;
        const out: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(rest)) if (typeof v !== 'function') out[k] = v;
        return out as unknown as Store;
      },
      merge: (persisted, current) => ({ ...current, ...(persisted as object), ui: freshUI() }),
    },
  ),
);

// Exposed for automated end-to-end tests and debugging.
if (typeof window !== 'undefined') (window as unknown as { __game: typeof useGame }).__game = useGame;

// convenience selectors
export const weakTargets = (lang: LanguageProfile) => weaknesses(lang);
