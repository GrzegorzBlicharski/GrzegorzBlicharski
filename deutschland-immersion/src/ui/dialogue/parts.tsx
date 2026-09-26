import { useEffect, useRef, useState } from 'react';
import type { DocumentSpec, Evaluation, FreeInputSpec, InspectSpec } from '../../engine/types';
import { TIER_LABEL } from '../../engine/types';
import { lookupWord } from '../../content';
import { useGame } from '../../engine/store';
import { createRecognizer, sttAvailable, type Recognizer } from '../../engine/speech';
import { audio } from '../../engine/audio';

// ------------------------------------------------------------ clickable German line
export function WordLine({ text, allowLookup, hidden, className = 'line' }: { text: string; allowLookup: boolean; hidden?: boolean; className?: string }) {
  const lookupVocab = useGame((s) => s.lookupVocab);
  const [pop, setPop] = useState<{ x: number; y: number; de: string; pl: string; level: string } | null>(null);
  useEffect(() => {
    if (!pop) return;
    const t = setTimeout(() => setPop(null), 4000);
    return () => clearTimeout(t);
  }, [pop]);
  const tokens = text.split(/(\s+)/);
  return (
    <div className={`${className}${hidden ? ' hidden-sub' : ''}`} data-testid="npc-line">
      {tokens.map((tok, i) => {
        if (/^\s+$/.test(tok)) return tok;
        const v = allowLookup && !hidden ? lookupWord(tok) : null;
        return (
          <span
            key={i}
            className={`w${v ? ' known' : ''}`}
            onClick={(e) => {
              if (!v) return;
              e.stopPropagation();
              lookupVocab(v.id);
              const r = (e.target as HTMLElement).getBoundingClientRect();
              setPop({ x: Math.min(r.left, window.innerWidth - 300), y: r.top - 76, de: v.de, pl: v.pl, level: v.level });
            }}
          >
            {tok}
          </span>
        );
      })}
      {pop && (
        <div className="word-pop" style={{ left: pop.x, top: pop.y }}>
          <b>{pop.de}</b> — {pop.pl}
          <small>{pop.level} · Nachschlagen zählt nicht als Beherrschung</small>
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------ in-world documents
export function DocView({ doc, pick }: { doc: DocumentSpec; pick?: { marked: string[]; toggle: (id: string) => void; result?: Record<string, 'r-found' | 'r-missed' | 'r-wrong'>; explain?: Record<string, string> } }) {
  const cls = doc.kind === 'board' ? 'doc-board' : doc.kind === 'sms' ? 'doc-sms' : doc.kind === 'sign' ? 'doc-sign' : 'doc-paper';
  return (
    <div className={`doc ${cls}`} data-testid={`doc-${doc.kind}`}>
      <h4>{doc.title}</h4>
      {doc.lines.map((l, i) => {
        const pickable = pick && l.id && !l.small;
        const res = l.id ? pick?.result?.[l.id] : undefined;
        return (
          <div key={i}>
            <div
              className={['l', l.highlight ? 'hl' : '', l.small ? 'sm' : '', pickable ? 'pickable' : '', l.id && pick?.marked.includes(l.id) && !pick.result ? 'marked' : '', res ?? ''].join(' ')}
              onClick={() => pickable && !pick!.result && l.id && pick!.toggle(l.id)}
              data-line={l.id}
            >
              {l.text}
            </div>
            {res && l.id && pick?.explain?.[l.id] && <div className="explain">{pick.explain[l.id]}</div>}
          </div>
        );
      })}
      {doc.footer && <div className="foot">{doc.footer}</div>}
    </div>
  );
}

// ------------------------------------------------------------ inspection (contract comparison)
export function Inspect({ spec, onDone }: { spec: InspectSpec; onDone: () => void }) {
  const submitInspect = useGame((s) => s.submitInspect);
  const [marked, setMarked] = useState<string[]>([]);
  const [result, setResult] = useState<Record<string, 'r-found' | 'r-missed' | 'r-wrong'> | null>(null);
  const [summary, setSummary] = useState('');
  const toggle = (id: string) => {
    audio.sfx('click');
    setMarked((m) => (m.includes(id) ? m.filter((x) => x !== id) : [...m, id]));
  };
  const submit = () => {
    const r = submitInspect(spec, marked);
    const map: Record<string, 'r-found' | 'r-missed' | 'r-wrong'> = {};
    r.found.forEach((x) => (map[x] = 'r-found'));
    r.missed.forEach((x) => (map[x] = 'r-missed'));
    r.wrong.forEach((x) => (map[x] = 'r-wrong'));
    setResult(map);
    setSummary(`${r.found.length} von ${spec.correct.length} Abweichungen gefunden${r.wrong.length ? ` · ${r.wrong.length} Fehlalarm` : ''}${r.missed.length ? ` · ${r.missed.length} übersehen` : ''}.`);
    audio.sfx(r.missed.length ? 'fail' : 'stamp');
  };
  return (
    <div className="inspect-view" data-testid="inspect">
      <div className="inspect-head">
        <h3>DOKUMENTENPRÜFUNG</h3>
        <p>{spec.instruction}</p>
      </div>
      <div className="inspect-docs">
        <DocView doc={spec.docs[0]} />
        <DocView doc={spec.docs[1]} pick={{ marked, toggle, result: result ?? undefined, explain: spec.explain }} />
      </div>
      <div className="inspect-foot">
        {!result ? (
          <>
            <span style={{ color: 'var(--text-dim)', fontSize: 13 }}>Markiert: {marked.length} Zeile(n) · Klicken Sie auf eine Zeile der polnischen Fassung, um sie zu markieren.</span>
            <button className="continue" onClick={submit} data-testid="inspect-submit">
              PRÜFUNG ABSCHLIESSEN
            </button>
          </>
        ) : (
          <>
            <span style={{ fontSize: 15 }}>{summary}</span>
            <button className="continue" onClick={onDone} data-testid="continue">
              WEITER
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ------------------------------------------------------------ free input (speak / write / translate / compose)
export function FreeInput({ spec, compose, onSubmit, busy }: { spec: FreeInputSpec; compose?: { to: string; subject: string }; onSubmit: (text: string, late: boolean) => void; busy: boolean }) {
  const [text, setText] = useState('');
  const [live, setLive] = useState(false);
  const [err, setErr] = useState('');
  const rec = useRef<Recognizer | null>(null);
  const [left, setLeft] = useState(spec.timeLimitSec ?? 0);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const lang = spec.source?.lang === 'de' ? 'pl-PL' : 'de-DE';
  const canSpeak = sttAvailable();

  useEffect(() => {
    taRef.current?.focus();
  }, []);
  useEffect(() => {
    if (!spec.timeLimitSec) return;
    const t = setInterval(() => setLeft((l) => l - 1), 1000);
    return () => clearInterval(t);
  }, [spec.timeLimitSec]);
  useEffect(() => () => rec.current?.stop(), []);

  const toggleMic = () => {
    if (live) {
      rec.current?.stop();
      return;
    }
    rec.current = createRecognizer(
      lang,
      (t) => setText(t),
      (s, e) => {
        setLive(s === 'listening');
        if (s === 'error') setErr(e === 'not-allowed' ? 'Mikrofon nicht erlaubt.' : 'Spracherkennung nicht verfügbar – bitte tippen.');
      },
    );
    rec.current?.start();
  };

  const submit = () => {
    if (!text.trim() || busy) return;
    rec.current?.stop();
    onSubmit(text.trim(), !!spec.timeLimitSec && left < 0);
  };
  const mm = (n: number) => `${n < 0 ? '-' : ''}${String(Math.floor(Math.abs(n) / 60)).padStart(2, '0')}:${String(Math.abs(n) % 60).padStart(2, '0')}`;
  const modeLabel = spec.mode === 'translate' ? (spec.source?.lang === 'pl' ? 'ÜBERSETZUNG PL → DE' : 'ÜBERSETZUNG DE → PL') : spec.mode === 'write' ? 'SCHREIBEN' : 'SPRECHEN';

  const onKey = (e: React.KeyboardEvent) => {
    e.stopPropagation();
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey || (!compose && !e.shiftKey && spec.mode !== 'write'))) {
      e.preventDefault();
      submit();
    }
  };

  const countdown = spec.timeLimitSec ? <span className={`countdown ${left < 60 ? 'late' : ''}`}>⏱ {mm(left)}{left < 0 ? ' · Frist überschritten' : ''}</span> : null;

  return (
    <div data-testid="free-input">
      <div className="task">
        <span className="mode">{modeLabel}</span>
        {spec.register === 'formal' ? 'Register: formell (Sie)' : spec.register === 'informal' ? 'Register: locker (du)' : ''}
        {countdown}
      </div>
      <div className="task-text">{spec.task}</div>
      {spec.source && (
        <div className="source-doc">
          <small>AUSGANGSTEXT · {spec.source.lang === 'pl' ? 'POLNISCH' : 'DEUTSCH'}</small>
          {spec.source.text}
        </div>
      )}
      {compose ? (
        <div className="mail">
          <div className="mail-head">
            <span>An:</span>
            <b>{compose.to}</b>
            <span>Betreff:</span>
            <b>{compose.subject}</b>
          </div>
          <textarea ref={taRef} value={text} onChange={(e) => setText(e.target.value)} onKeyDown={onKey} placeholder="Sehr geehrte …" spellCheck={false} data-testid="answer" />
          <div className="mail-foot">
            <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>{text.trim().split(/\s+/).filter(Boolean).length} Wörter · Strg+Enter senden</span>
            <button className="send" style={{ marginLeft: 'auto', padding: '8px 22px' }} disabled={!text.trim() || busy} onClick={submit} data-testid="submit">
              {busy ? 'PRÜFE …' : 'SENDEN'}
            </button>
          </div>
        </div>
      ) : (
        <div className="input-row">
          <textarea
            ref={taRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKey}
            placeholder={spec.placeholder ?? (spec.mode === 'translate' ? 'Ihre Übersetzung …' : 'Auf Deutsch antworten …')}
            spellCheck={false}
            data-testid="answer"
          />
          {canSpeak && (
            <button className={`mic ${live ? 'live' : ''}`} onClick={toggleMic} title={live ? 'Aufnahme beenden' : 'Sprechen (Spracherkennung des Browsers)'} data-testid="mic">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="2" width="6" height="12" rx="3" />
                <path d="M5 11a7 7 0 0 0 14 0M12 18v4" />
              </svg>
            </button>
          )}
          <button className="send" disabled={!text.trim() || busy} onClick={submit} data-testid="submit">
            {busy ? '…' : '↵'}
          </button>
        </div>
      )}
      {err && <div className="feedback-flash bad">{err}</div>}
      {!canSpeak && spec.mode === 'speak' && <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 6 }}>Spracheingabe in diesem Browser nicht verfügbar (Chrome/Edge unterstützen sie) – tippen Sie Ihre gesprochene Antwort.</div>}
    </div>
  );
}

// ------------------------------------------------------------ evaluation card
const DIM_LABEL: Record<string, string> = { correctness: 'Korrektheit', naturalness: 'Natürlichkeit', precision: 'Präzision', register: 'Register', style: 'Stil', idiomaticity: 'Idiomatik' };

export function EvalCard({ e, text, onContinue, compact }: { e: Evaluation; text: string; onContinue: () => void; compact?: boolean }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    audio.sfx(e.tier === 'incorrect' ? 'fail' : e.tier === 'understandable' ? 'click' : 'stamp');
  }, [e.tier]);
  return (
    <div className="eval" data-testid="evaluation" data-tier={e.tier}>
      <div className="eval-head">
        <div className={`stamp t-${e.tier}`}>{TIER_LABEL[e.tier].toUpperCase()}</div>
        <div style={{ flex: 1 }}>
          <div className="you">„{text}“</div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-faint)', marginTop: 4 }}>
            Punktzahl {e.score}/100 · Bewertung: {e.source === 'rules' ? 'Regel-Engine' : 'Regel-Engine + KI-Prüfer'}
          </div>
        </div>
        <button className="continue" onClick={onContinue} data-testid="continue">
          WEITER <kbd>↵</kbd>
        </button>
      </div>
      {e.keyImprovement && <div className="key">{e.keyImprovement}</div>}
      {!!e.strengths.length && (
        <div className="strengths">
          {e.strengths.slice(0, 4).map((s, i) => (
            <span key={i}>{s}</span>
          ))}
        </div>
      )}
      {!compact && (
        <>
          <div className="dims">
            {Object.entries(e.dims).map(([k, v]) => (
              <div className="dim" key={k}>
                {DIM_LABEL[k]}
                <div className="b">
                  <i style={{ width: `${v}%`, background: v >= 80 ? 'var(--green)' : v >= 55 ? 'var(--amber)' : 'var(--red)' }} />
                </div>
              </div>
            ))}
          </div>
          <button className="tool" onClick={() => setOpen((o) => !o)}>
            {open ? 'Details ausblenden' : `Details (${e.issues.length} Hinweise) & Musterlösung`}
          </button>
          {open && (
            <>
              <ul className="issues">
                {e.issues.map((i, k) => (
                  <li key={k}>
                    <span className={`sev s${i.severity}`}>{'!'.repeat(i.severity)}</span>
                    <span>
                      {i.message}
                      {i.pl && <span className="pl">{i.pl}</span>}
                    </span>
                  </li>
                ))}
                {!!e.missing.length && (
                  <li>
                    <span className="sev">!!!</span>
                    <span>Fehlt: {e.missing.join(' · ')}</span>
                  </li>
                )}
              </ul>
              <div className="model">{e.model}</div>
            </>
          )}
        </>
      )}
    </div>
  );
}
