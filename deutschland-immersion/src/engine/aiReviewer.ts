import type { Evaluation, FreeInputSpec, Tier } from './types';

/**
 * OPTIONAL AI reviewer (Claude). Only active when the player enters their own
 * Anthropic API key in Einstellungen. The key stays in this browser (localStorage)
 * and is sent only to api.anthropic.com. Without a key the rule engine grades alone.
 *
 * The AI refines the rule-based verdict — especially naturalness, register,
 * idiomaticity and translation quality, which rules cannot judge well.
 */

const makeReview = (z: typeof import('zod').z) => z.object({
  tier: z.enum(['incorrect', 'understandable', 'correct', 'natural', 'professional', 'native']),
  correctness: z.number(),
  naturalness: z.number(),
  precision: z.number(),
  register: z.number(),
  style: z.number(),
  idiomaticity: z.number(),
  key_improvement: z.string(),
  issues: z.array(z.object({ category: z.string(), severity: z.number(), message: z.string(), fix: z.string() })),
  better_version: z.string(),
});

const SYSTEM = `Du bist ein strenger, fairer Prüfer für Deutsch als Fremdsprache (Niveau B1 bis C2, Schwerpunkt Beruf, Recht, Übersetzung Polnisch↔Deutsch).
Bewerte die Antwort des Lernenden im gegebenen Spielkontext. Kein falsches Lob.
Stufen: incorrect (Inhalt nicht vermittelt / unverständlich), understandable (verständlich, aber mit deutlichen Fehlern oder unpassendem Register), correct (korrekt, aber nicht so, wie es Muttersprachler sagen würden), natural (so würde es ein Muttersprachler sagen), professional (natürlich und im Register exakt passend für berufliche Kontexte), native (idiomatisch, präzise, stilsicher).
Eine grammatisch korrekte Antwort ist höchstens "correct", wenn Muttersprachler sie anders formulieren würden.
Bei Übersetzungen: Bedeutungserhalt, Terminologie, rechtliche Äquivalenz, Vollständigkeit (Zahlen, Daten), Register – nie Wort-für-Wort belohnen.
Dimensionen jeweils 0–100. Erklärungen kurz und auf Deutsch. "better_version" = eine muttersprachliche Formulierung.`;

export async function aiReview(input: string, spec: FreeInputSpec, rules: Evaluation, apiKey: string, model: string): Promise<Evaluation | null> {
  if (!apiKey.trim()) return null;
  try {
    const [{ default: Anthropic }, { zodOutputFormat }, { z }] = await Promise.all([import('@anthropic-ai/sdk'), import('@anthropic-ai/sdk/helpers/zod'), import('zod')]);
    const Review = makeReview(z);
    // The key belongs to the player and never leaves their browser except to Anthropic.
    const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
    const context = [
      `Aufgabe: ${spec.task}`,
      `Register: ${spec.register}`,
      spec.source ? `Ausgangstext (${spec.source.lang}): ${spec.source.text}` : '',
      `Erforderliche Inhalte: ${spec.required.map((r) => r.label).join('; ')}`,
      `Referenzlösung(en): ${spec.models.join(' | ')}`,
      `Regelbasierte Vorbewertung: ${rules.tier}; Probleme: ${rules.issues.map((i) => i.message).join(' / ') || 'keine'}`,
      `Antwort des Lernenden: """${input}"""`,
    ]
      .filter(Boolean)
      .join('\n');
    const res = await client.messages.parse({
      model,
      max_tokens: 4000,
      system: SYSTEM,
      messages: [{ role: 'user', content: context }],
      output_config: { format: zodOutputFormat(Review), effort: 'low' },
    });
    if (res.stop_reason === 'refusal' || !res.parsed_output) return null;
    const r = res.parsed_output;
    const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
    const cats = new Set(['grammar', 'vocabulary', 'syntax', 'wordOrder', 'cases', 'gender', 'register', 'collocation', 'idioms', 'terminology', 'translation', 'writing', 'professional']);
    const dims = {
      correctness: clamp(r.correctness),
      naturalness: clamp(r.naturalness),
      precision: clamp(r.precision),
      register: clamp(r.register),
      style: clamp(r.style),
      idiomaticity: clamp(r.idiomaticity),
    };
    return {
      ...rules,
      tier: r.tier as Tier,
      dims,
      score: (() => {
        const cap: Record<Tier, [number, number]> = { incorrect: [0, 35], understandable: [36, 60], correct: [61, 78], natural: [79, 89], professional: [90, 95], native: [96, 100] };
        const raw = dims.correctness * 0.3 + dims.precision * 0.3 + dims.register * 0.15 + dims.naturalness * 0.15 + dims.idiomaticity * 0.1;
        const [lo, hi] = cap[r.tier as Tier];
        return clamp(Math.max(lo, Math.min(hi, raw)));
      })(),
      issues: [
        ...rules.issues,
        ...r.issues
          .filter((i) => !rules.issues.some((x) => x.message === i.message))
          .map((i) => ({ category: (cats.has(i.category) ? i.category : 'grammar') as never, severity: Math.max(1, Math.min(3, Math.round(i.severity))) as 1 | 2 | 3, message: i.message, fix: i.fix })),
      ],
      keyImprovement: r.key_improvement || rules.keyImprovement,
      model: r.better_version || rules.model,
      source: 'rules+ai',
    };
  } catch (e) {
    console.warn('AI review unavailable:', e);
    return null;
  }
}
