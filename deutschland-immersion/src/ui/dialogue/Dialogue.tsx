import { useCallback, useEffect, useMemo, useState } from 'react';
import { useGame } from '../../engine/store';
import { DIALOGUES, NPC, RETRIEVAL } from '../../content';
import type { Choice, DialogueNode, Evaluation, FreeInputSpec, RetrievalItem } from '../../engine/types';
import { TIER_ORDER } from '../../engine/types';
import { interpolate, interpolateSpec } from '../../engine/logic';
import { difficulty } from '../../engine/difficulty';
import { evaluate, tierBucket } from '../../engine/evaluator';
import { aiReview } from '../../engine/aiReviewer';
import { germanVoices, speak, stopSpeaking, ttsAvailable } from '../../engine/speech';
import { audio } from '../../engine/audio';
import { Portrait } from '../art/Portrait';
import { DocView, EvalCard, FreeInput, Inspect, WordLine } from './parts';

export async function gradeAnswer(text: string, spec: FreeInputSpec, strictness: number, aiKey: string, aiModel: string, late = false): Promise<Evaluation> {
  let e = evaluate(text, spec, { strictness });
  if (late) e = { ...e, issues: [{ category: 'professional', severity: 1, message: 'Frist überschritten – im Berufsleben zählt auch Pünktlichkeit.' }, ...e.issues] };
  if (aiKey) {
    const ai = await aiReview(text, spec, e, aiKey, aiModel);
    if (ai) e = ai;
  }
  return e;
}

function retrievalSpec(item: RetrievalItem): FreeInputSpec {
  return { ...item.input!, targets: [item.target], mode: 'write', onFail: '', onPartial: '', onSuccess: '' } as FreeInputSpec;
}

let lastNpcId: string | null = null;

export function Dialogue() {
  const rt = useGame((s) => s.ui.dialogue)!;
  const player = useGame((s) => s.player);
  const lang = useGame((s) => s.lang);
  const settings = useGame((s) => s.settings);
  const rel = useGame((s) => s.rel);
  const pending = useGame((s) => s.ui.pending);
  const { enterNode, endDialogue, resolveNext, chooseOption, submitEvaluation, revealSubtitle, useGloss, recordRetrievalChoice, recordRetrievalInput } = useGame.getState();

  const d = DIALOGUES[rt.id];
  const node: DialogueNode | undefined = d?.nodes[rt.node];
  const diff = useMemo(() => difficulty(lang, { hints: settings.hints, subtitles: settings.subtitles }), [lang, settings.hints, settings.subtitles]);
  const retrieval = rt.retrievalItem ? RETRIEVAL.find((r) => r.id === rt.retrievalItem) : undefined;

  const [gloss, setGloss] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [flash, setFlash] = useState<{ text: string; bad: boolean; next: string } | null>(null);
  const [evalState, setEvalState] = useState<{ e: Evaluation; text: string; next: string | null } | null>(null);
  const [busy, setBusy] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [talking, setTalking] = useState(false);

  const t = (s?: string) => (s ? interpolate(s, player) : '');
  const speakerId = retrieval ? node?.retrieval?.speaker : node?.speaker;
  const npc = speakerId ? NPC[speakerId] : undefined;
  const npcChanged = !!npc && npc.id !== lastNpcId;
  if (npc) lastNpcId = npc.id;
  const portraitNpc = npc ?? (lastNpcId ? NPC[lastNpcId] : undefined);
  const hasVoice = ttsAvailable() && germanVoices().length > 0;
  const hideSub = !!node?.listening && (rt.mode === 'call' || node.speaker === 'announce') && diff.callSubtitles !== 'shown' && hasVoice && !revealed;

  // reset per node
  useEffect(() => {
    setGloss(false);
    setRevealed(false);
    setFlash(null);
    setEvalState(null);
    setBusy(false);
    setTimeLeft(node?.timer ? Math.round(node.timer * diff.timerFactor) : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rt.id, rt.node, rt.retrievalItem]);

  // pure-effect nodes advance automatically
  useEffect(() => {
    if (!node || retrieval) return;
    const hasContent = node.text || node.direction || node.choices || node.input || node.document || node.inspect;
    if (!hasContent) {
      const id = setTimeout(() => {
        const nx = resolveNext(node);
        return nx ? enterNode(nx) : endDialogue();
      }, 60);
      return () => clearTimeout(id);
    }
  }, [node, retrieval, endDialogue, enterNode, resolveNext]);

  const say = useCallback(
    (rateMul = 1) => {
      const txt = retrieval ? retrieval.prompt : node?.text;
      if (!txt || !settings.tts || node?.audio === false || retrieval?.channel === 'sms') return;
      const sp = retrieval ? node?.retrieval?.speaker : node?.speaker;
      if (sp === 'player' || sp === 'narrator') return;
      const v = sp ? NPC[sp]?.voice : undefined;
      const lng = /[ąęłńśźż]/i.test(txt) && !/[äöüß]/i.test(txt) ? 'pl-PL' : 'de-DE';
      setTalking(true);
      void speak(t(txt), {
        rate: diff.ttsRate * (v?.rate ?? 1) * (node?.rate ?? 1) * rateMul,
        pitch: v?.pitch ?? (sp === 'announce' ? 1.05 : 1),
        gender: v?.gender ?? 'f',
        seed: sp ? sp.length : 0,
        lang: lng,
        volume: settings.volume,
      }).then(() => setTalking(false));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [node, retrieval, settings.tts, settings.volume, diff.ttsRate],
  );

  useEffect(() => {
    say();
    return () => stopSpeaking();
  }, [say]);

  const advance = useCallback(() => {
    if (!node) return;
    stopSpeaking();
    audio.sfx('click');
    if (flash) {
      const n = flash.next;
      setFlash(null);
      return enterNode(n);
    }
    if (evalState) {
      if (evalState.next === null) {
        const nx = resolveNext(node);
        return nx ? enterNode(nx) : endDialogue();
      }
      return enterNode(evalState.next);
    }
    if (node.choices || node.input || node.inspect || retrieval) return;
    const nx = resolveNext(node);
    return nx ? enterNode(nx) : endDialogue();
  }, [node, flash, evalState, retrieval, enterNode, endDialogue, resolveNext]);

  const choose = useCallback(
    (c: Choice) => {
      if (!node) return;
      stopSpeaking();
      audio.sfx('click');
      chooseOption(c, node);
      const weak = c.quality && TIER_ORDER.indexOf(c.quality) < TIER_ORDER.indexOf('natural');
      if (c.feedback && weak) setFlash({ text: c.feedback, bad: c.quality === 'incorrect' || c.quality === 'understandable', next: c.next });
      else enterNode(c.next);
    },
    [node, chooseOption, enterNode],
  );

  // choice timer
  useEffect(() => {
    if (timeLeft === null || !node?.timeoutNext || flash) return;
    if (timeLeft <= 0) {
      enterNode(node.timeoutNext);
      return;
    }
    const id = setTimeout(() => setTimeLeft((x) => (x === null ? null : x - 0.1)), 100);
    return () => clearTimeout(id);
  }, [timeLeft, node, flash, enterNode]);

  // keyboard
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'TEXTAREA' || (e.target as HTMLElement)?.tagName === 'INPUT') return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        advance();
      }
      const n = parseInt(e.key, 10);
      if (!flash && !evalState && node?.choices && n >= 1) {
        const visible = node.choices;
        if (visible[n - 1]) choose(visible[n - 1]);
      }
    };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  }, [advance, choose, node, flash, evalState]);

  if (!d || !node) return null;

  const onSubmit = async (text: string, late: boolean) => {
    if (!node.input) return;
    setBusy(true);
    const spec = interpolateSpec(node.input, player);
    const e = await gradeAnswer(text, spec, diff.strictness, settings.aiKey, settings.aiModel, late);
    submitEvaluation(e, spec, text, node);
    const b = tierBucket(e.tier);
    setEvalState({ e, text, next: b === 'fail' ? node.input.onFail : b === 'partial' ? node.input.onPartial : node.input.onSuccess });
    setBusy(false);
  };

  const onRetrievalSubmit = async (text: string) => {
    if (!retrieval) return;
    setBusy(true);
    const spec = retrievalSpec(retrieval);
    const e = await gradeAnswer(text, spec, diff.strictness, settings.aiKey, settings.aiModel);
    recordRetrievalInput(retrieval, e, text);
    setEvalState({ e, text, next: null });
    setBusy(false);
  };

  if (node.inspect) {
    return <Inspect spec={node.inspect} onDone={() => enterNode(node.inspect!.next)} />;
  }

  const lookup = diff.glossPolicy !== 'none';
  const glossText = retrieval ? retrieval.gloss : node.gloss;
  const lineText = retrieval ? retrieval.prompt : node.text;
  const isNpcLine = !!lineText && speakerId !== 'player';
  const showPortrait = !!portraitNpc && speakerId !== 'narrator' && !node.document && !(node.input && (node.compose || node.input.mode === 'translate'));
  const callMode = rt.mode === 'call';
  const r = portraitNpc ? rel[portraitNpc.id] ?? portraitNpc.startRel : 0;

  return (
    <div className="dlg" data-testid="dialogue" data-node={`${rt.id}.${rt.node}`}>
      {showPortrait && (
        <div className="dlg-portrait" style={npcChanged ? undefined : { animation: 'none' }}>
          <Portrait spec={portraitNpc!.portrait} id={portraitNpc!.id} talking={talking && speakerId === portraitNpc!.id} />
        </div>
      )}
      <div className={`dlg-panel ${showPortrait ? '' : 'wide'}`} style={{ animationDuration: '0.3s' }}>
        {callMode && (
          <div className="call-banner">
            <div className="wave">
              {[0, 1, 2, 3, 4].map((i) => (
                <i key={i} style={{ animationDelay: `${i * 0.12}s`, animationPlayState: talking ? 'running' : 'paused' }} />
              ))}
            </div>
            TELEFONAT · {portraitNpc?.name ?? 'Unbekannt'}
          </div>
        )}

        {node.document && <DocView doc={{ ...node.document, lines: node.document.lines.map((l) => ({ ...l, text: t(l.text) })) }} />}

        {isNpcLine && (
          <>
            <div className="speaker">
              <span className="n">{node.speakerName ?? npc?.name ?? (speakerId === 'announce' ? 'Durchsage' : '')}</span>
              {npc && <span className="r">{npc.role}</span>}
              {npc && <span className="rel">Vertrauen {r > 0 ? '+' : ''}{Math.round(r)}</span>}
            </div>
            <WordLine text={t(lineText)} allowLookup={lookup} hidden={hideSub} />
            {!hasVoice && node.listening && <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 4 }}>Keine deutsche Stimme im System gefunden – der Hörtext wird angezeigt.</div>}
          </>
        )}
        {node.direction && !retrieval && <div className="direction" style={{ marginTop: isNpcLine ? 10 : 0 }}>{t(node.direction)}</div>}

        {gloss && glossText && <div className="gloss">{t(glossText)}</div>}
        {flash && <div className={`feedback-flash ${flash.bad ? 'bad' : ''}`}>{flash.text}</div>}

        {/* player responses */}
        {!flash && !evalState && node.choices && !retrieval && (
          <div className="choices">
            {node.choices.map((c, i) => (
              <button key={i} className="choice" style={{ animationDelay: `${i * 60}ms` }} onClick={() => choose(c)} data-testid={`choice-${i}`}>
                <span className="num">{i + 1}</span>
                <span>{t(c.text)}</span>
              </button>
            ))}
            {timeLeft !== null && node.timer && (
              <div className="timer">
                <i style={{ width: `${Math.max(0, (timeLeft / (node.timer * diff.timerFactor)) * 100)}%` }} />
              </div>
            )}
          </div>
        )}
        {!evalState && node.input && !retrieval && <FreeInput key={rt.node} spec={interpolateSpec(node.input, player)} compose={node.compose} onSubmit={onSubmit} busy={busy} />}

        {/* adaptive retrieval moment */}
        {retrieval && !evalState && retrieval.kind === 'choice' && (
          <RetrievalChoices item={retrieval} onDone={(ok) => { recordRetrievalChoice(retrieval, ok); }} onContinue={() => { const nx = resolveNext(node); return nx ? enterNode(nx) : endDialogue(); }} />
        )}
        {retrieval && !evalState && retrieval.kind === 'input' && <FreeInput key={retrieval.id} spec={retrievalSpec(retrieval)} onSubmit={(x) => onRetrievalSubmit(x)} busy={busy} />}

        {evalState && <div style={{ marginTop: 12 }}><EvalCard e={evalState.e} text={evalState.text} onContinue={advance} /></div>}

        {!evalState && (
          <div className="dlg-tools">
            {isNpcLine && settings.tts && ttsAvailable() && (
              <>
                <button className="tool" onClick={() => say()} data-testid="replay">↻ Nochmal</button>
                <button className="tool" onClick={() => say(0.75)}>Langsamer</button>
              </>
            )}
            {hideSub && (
              <button className="tool" onClick={() => { setRevealed(true); revealSubtitle(); }} data-testid="reveal">
                Untertitel anzeigen
              </button>
            )}
            {glossText && diff.glossPolicy !== 'none' && (
              <button className={`tool ${gloss ? 'on' : ''}`} onClick={() => { if (!gloss) useGloss(); setGloss((g) => !g); }} title={diff.glossPolicy === 'costly' ? 'Hilfe reduziert die Anrechnung' : 'Polnische Hilfe'} data-testid="gloss">
                PL {diff.glossPolicy === 'costly' ? '· kostet' : ''}
              </button>
            )}
            {pending.listening?.revealed && <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>Hilfe genutzt – Hörverstehen zählt weniger</span>}
            {(flash || (!node.choices && !node.input && !retrieval)) && (
              <button className="continue" onClick={advance} data-testid="continue">
                WEITER <kbd>↵</kbd>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function RetrievalChoices({ item, onDone, onContinue }: { item: RetrievalItem; onDone: (ok: boolean) => void; onContinue: () => void }) {
  const [picked, setPicked] = useState<number | null>(null);
  const opts = useMemo(() => [...(item.choices ?? [])].sort(() => Math.random() - 0.5), [item]);
  if (picked !== null) {
    const c = opts[picked];
    return (
      <>
        <div className={`feedback-flash ${c.correct ? '' : 'bad'}`}>{c.correct ? 'Passt.' : c.feedback ?? 'Nicht ganz.'}</div>
        <div className="dlg-tools">
          <button className="continue" onClick={onContinue} data-testid="continue">WEITER <kbd>↵</kbd></button>
        </div>
      </>
    );
  }
  return (
    <div className="choices">
      {opts.map((c, i) => (
        <button key={i} className="choice" onClick={() => { setPicked(i); onDone(c.correct); audio.sfx(c.correct ? 'success' : 'fail'); }} data-testid={`choice-${i}`}>
          <span className="num">{i + 1}</span>
          <span>{c.text}</span>
        </button>
      ))}
    </div>
  );
}
