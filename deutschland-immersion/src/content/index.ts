/**
 * Content registry. The engine asks this module for data; adding a city means
 * adding a folder under /content/<city> and registering it here.
 */
import type { Dialogue, Location, Mission, NPC as NPCType } from '../engine/types';
import { LOCATIONS } from './berlin/locations';
import { MISSIONS } from './berlin/missions';
import { NPCS } from './berlin/npcs';
import * as hbf from './berlin/dialogues/hbf';
import * as kreuzberg from './berlin/dialogues/kreuzberg';
import * as cafe from './berlin/dialogues/cafe';
import * as kanzlei from './berlin/dialogues/kanzlei';
import * as evening from './berlin/dialogues/evening';
import * as amt from './berlin/dialogues/amt';

function collect(...mods: Record<string, unknown>[]): Record<string, Dialogue> {
  const out: Record<string, Dialogue> = {};
  for (const m of mods)
    for (const v of Object.values(m)) {
      if (v && typeof v === 'object' && 'nodes' in v && 'start' in v) {
        const d = v as Dialogue;
        out[d.id] = d;
      }
    }
  return out;
}

export const DIALOGUES: Record<string, Dialogue> = collect(hbf, kreuzberg, cafe, kanzlei, evening, amt);
export const ALL_LOCATIONS: Location[] = [...LOCATIONS];
export const ALL_MISSIONS: Mission[] = [...MISSIONS];
export const ALL_NPCS: NPCType[] = [...NPCS];

export const LOC = Object.fromEntries(ALL_LOCATIONS.map((l) => [l.id, l])) as Record<string, Location>;
export const MIS = Object.fromEntries(ALL_MISSIONS.map((m) => [m.id, m])) as Record<string, Mission>;
export const NPC = Object.fromEntries(ALL_NPCS.map((n) => [n.id, n])) as Record<string, NPCType>;

export { TARGETS, TARGET_BY_ID } from './shared/targets';
export { RETRIEVAL } from './shared/retrieval';
export { DRILLS, DRILLS_BY_TARGET } from './shared/drills';
export { TERMS, TERM_BY_ID } from './shared/terms';
export { VOCAB, VOCAB_BY_ID, lookupWord } from './shared/vocab';
export { CITIES, ITEMS, EMAILS, ACHIEVEMENTS, CAREER } from './shared/meta';
export { UPCOMING } from './berlin/missions';
