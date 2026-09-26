import type { Dialogue, DialogueNode } from '../engine/types';

/** Build a dialogue from an ordered node list; the first node is the start. */
export function dlg(id: string, nodes: DialogueNode[], mode: Dialogue['mode'] = 'scene'): Dialogue {
  const map: Record<string, DialogueNode> = {};
  for (const n of nodes) {
    if (map[n.id]) throw new Error(`Duplicate node ${id}.${n.id}`);
    map[n.id] = n;
  }
  return { id, mode, start: nodes[0].id, nodes: map };
}
