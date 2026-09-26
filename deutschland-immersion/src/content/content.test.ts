import { describe, expect, it } from 'vitest';
import { DIALOGUES, LOC, MIS, NPC, RETRIEVAL, DRILLS, TERM_BY_ID, TARGET_BY_ID, ALL_LOCATIONS, ALL_MISSIONS } from './index';
import { evaluate, tierBucket } from '../engine/evaluator';
import { interpolateSpec } from '../engine/logic';
import { rx } from '../engine/text';
import type { Effect, FreeInputSpec } from '../engine/types';

const player = { first: 'Grzegorz', last: 'Nowak', anrede: 'Herr' as const };

function targetsOf(effects: Effect[] | undefined): string[] {
  const out: string[] = [];
  for (const e of effects ?? []) {
    if (e.type === 'call') out.push(`dlg:${e.dialogue}`);
    if (e.type === 'startMission' || e.type === 'completeMission' || e.type === 'objective') out.push(`mis:${e.mission}`);
    if (e.type === 'moveTo' || e.type === 'unlockLocation') out.push(`loc:${e.location}`);
    if (e.type === 'term') out.push(`term:${e.term}`);
    if (e.type === 'rel' || e.type === 'memory') out.push(`npc:${e.npc}`);
  }
  return out;
}

function checkRef(ref: string) {
  const [kind, id] = ref.split(':');
  if (kind === 'dlg') expect(DIALOGUES[id], ref).toBeTruthy();
  if (kind === 'mis') expect(MIS[id], ref).toBeTruthy();
  if (kind === 'loc') expect(LOC[id], ref).toBeTruthy();
  if (kind === 'term') expect(TERM_BY_ID[id], ref).toBeTruthy();
  if (kind === 'npc') expect(NPC[id], ref).toBeTruthy();
}

describe('content integrity', () => {
  it('all dialogue links resolve', () => {
    for (const d of Object.values(DIALOGUES)) {
      expect(d.nodes[d.start], `${d.id}.start`).toBeTruthy();
      for (const n of Object.values(d.nodes)) {
        const nexts = [n.next, n.timeoutNext, ...(n.branch ?? []).map((b) => b.next), ...(n.choices ?? []).map((c) => c.next), n.input?.onFail, n.input?.onPartial, n.input?.onSuccess, n.inspect?.next].filter(Boolean) as string[];
        for (const x of nexts) {
          if (x.startsWith('@')) expect(DIALOGUES[x.slice(1)], `${d.id}.${n.id} → ${x}`).toBeTruthy();
          else expect(d.nodes[x], `${d.id}.${n.id} → ${x}`).toBeTruthy();
        }
        const terminal = n.end || n.next || n.choices || n.input || n.inspect || n.branch?.length || n.retrieval;
        expect(terminal, `${d.id}.${n.id} is a dead end`).toBeTruthy();
        if (n.speaker && !['player', 'narrator', 'announce'].includes(n.speaker) && !n.speakerName) expect(NPC[n.speaker], `${d.id}.${n.id} speaker ${n.speaker}`).toBeTruthy();
        for (const r of targetsOf(n.effects)) checkRef(r);
        for (const c of n.choices ?? []) for (const r of targetsOf(c.effects)) checkRef(r);
        for (const t of [...(n.input?.targets ?? []), ...(n.choices ?? []).flatMap((c) => c.targets ?? []), ...(n.inspect?.targets ?? [])]) expect(TARGET_BY_ID[t], `target ${t}`).toBeTruthy();
      }
    }
  });

  it('locations, hotspots and missions reference existing data', () => {
    for (const l of ALL_LOCATIONS) {
      for (const h of l.hotspots) {
        if (h.dialogue) expect(DIALOGUES[h.dialogue], `${l.id}.${h.id}`).toBeTruthy();
        for (const r of targetsOf(h.effects)) checkRef(r);
      }
      for (const e of l.onEnter ?? []) expect(DIALOGUES[e.dialogue], `${l.id} onEnter`).toBeTruthy();
    }
    for (const m of ALL_MISSIONS) {
      for (const r of targetsOf(m.rewards)) checkRef(r);
      for (const t of m.targets) expect(TARGET_BY_ID[t], `${m.id} target ${t}`).toBeTruthy();
    }
  });

  it('every mission objective can be ticked by some effect', () => {
    const ticked = new Set<string>();
    for (const d of Object.values(DIALOGUES))
      for (const n of Object.values(d.nodes)) for (const e of [...(n.effects ?? []), ...(n.choices ?? []).flatMap((c) => c.effects ?? [])]) if (e.type === 'objective') ticked.add(`${e.mission}.${e.objective}`);
    for (const m of ALL_MISSIONS) for (const o of m.objectives) expect(ticked.has(`${m.id}.${o.id}`), `${m.id}.${o.id}`).toBe(true);
  });

  it('every mission can be completed', () => {
    const completed = new Set<string>();
    for (const d of Object.values(DIALOGUES)) for (const n of Object.values(d.nodes)) for (const e of n.effects ?? []) if (e.type === 'completeMission') completed.add(e.mission);
    for (const m of ALL_MISSIONS) expect(completed.has(m.id), m.id).toBe(true);
  });

  const specs: [string, FreeInputSpec][] = [];
  for (const d of Object.values(DIALOGUES)) for (const n of Object.values(d.nodes)) if (n.input) specs.push([`${d.id}.${n.id}`, n.input]);

  it('all regexes compile', () => {
    for (const [id, s] of specs) {
      for (const r of s.required) for (const p of r.patterns) expect(() => rx(p), `${id} ${p}`).not.toThrow();
      for (const e of s.errors ?? []) expect(() => rx(e.pattern), `${id} ${e.pattern}`).not.toThrow();
      for (const b of s.bonuses ?? []) expect(() => rx(b.pattern), `${id} ${b.pattern}`).not.toThrow();
    }
  });

  it.each(specs)('model answer for %s passes its own evaluator at a high tier', (_id, raw) => {
    const spec = interpolateSpec(raw, player);
    for (const model of spec.models) {
      const e = evaluate(model, spec);
      expect(tierBucket(e.tier), `${model}\n→ ${e.tier} ${JSON.stringify(e.issues.map((i) => i.message))} missing=${e.missing}`).toBe('success');
      expect(['natural', 'professional', 'native'], `${model} → ${e.tier}`).toContain(e.tier);
    }
  });

  it('retrieval items are well-formed', () => {
    for (const r of RETRIEVAL) {
      expect(TARGET_BY_ID[r.target], r.id).toBeTruthy();
      if (r.kind === 'choice') expect(r.choices?.filter((c) => c.correct)).toHaveLength(1);
      if (r.kind === 'input') {
        const spec = { ...r.input!, targets: [r.target], onFail: '', onPartial: '', onSuccess: '' } as FreeInputSpec;
        for (const m of spec.models) expect(tierBucket(evaluate(m, spec).tier), `${r.id}: ${m}`).toBe('success');
      }
    }
  });

  it('drills are well-formed', () => {
    for (const d of DRILLS) {
      expect(TARGET_BY_ID[d.target], d.id).toBeTruthy();
      expect(d.answers.length, d.id).toBeGreaterThan(0);
      if (d.kind === 'choice') expect(d.choices, d.id).toContain(d.answers[0]);
    }
  });
});
