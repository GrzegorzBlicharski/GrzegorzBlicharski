import { useEffect, useMemo, useRef, useState } from 'react';
import { useGame } from '../../engine/store';
import { ACHIEVEMENTS, CAREER, EMAILS, ITEMS, MIS, NPC, RETRIEVAL, TERM_BY_ID, UPCOMING, VOCAB_BY_ID } from '../../content';
import type { Evaluation, FreeInputSpec } from '../../engine/types';
import { TIER_LABEL } from '../../engine/types';
import { difficulty } from '../../engine/difficulty';
import { overallRating, vocabStage } from '../../engine/languageModel';
import { gradeAnswer } from '../dialogue/Dialogue';
import { audio } from '../../engine/audio';

const APPS = [
  { id: 'messages', label: 'Nachrichten', icon: '💬', bg: 'linear-gradient(160deg,#3ddc84,#1a9e55)' },
  { id: 'mail', label: 'Mail', icon: '✉️', bg: 'linear-gradient(160deg,#4a90ff,#1d4fbf)' },
  { id: 'missions', label: 'Aufträge', icon: '🎯', bg: 'linear-gradient(160deg,#e8b04a,#a86a12)' },
  { id: 'contacts', label: 'Kontakte', icon: '👤', bg: 'linear-gradient(160deg,#8a8f99,#474c55)' },
  { id: 'notes', label: 'Notizen', icon: '📒', bg: 'linear-gradient(160deg,#ffd76a,#d9a520)' },
  { id: 'career', label: 'Karriere', icon: '📈', bg: 'linear-gradient(160deg,#c8323a,#7a1117)' },
  { id: 'map', label: 'Karte', icon: '🗺️', bg: 'linear-gradient(160deg,#5ac8fa,#1d6fa5)' },
  { id: 'training', label: 'Training', icon: '🏋️', bg: 'linear-gradient(160deg,#9b6bff,#5227b0)' },
];

const avatarColor = (id: string) => NPC[id]?.portrait.accent ?? '#888';
const nameOf = (id: string) => NPC[id]?.name ?? id;

export function Phone() {
  const s = useGame();
  const app = s.ui.phoneApp;
  const [thread, setThread] = useState<string | null>(null);
  const unreadMsgs = s.messages.filter((m) => !m.read).length;
  const unreadMail = s.emails.filter((m) => !m.read).length;

  const open = (id: string) => {
    audio.sfx('click');
    if (id === 'map') return s.openOverlay('map');
    if (id === 'training') return s.openOverlay('training');
    s.setPhoneApp(id);
    setThread(null);
  };

  return (
    <div className="phone-overlay" onClick={s.closeOverlay} data-testid="phone">
      <div className="phone" onClick={(e) => e.stopPropagation()}>
        <div className="phone-screen">
          <div className="phone-notch" />
          <div className="phone-status">
            <span>{s.time}</span>
            <span>▂▄▆ 5G 82%</span>
          </div>
          <div className="phone-body">
            {!app && (
              <>
                <div className="phone-clock">
                  <div className="t">{s.time}</div>
                  <div className="d">Tag {s.day} · Berlin</div>
                </div>
                <div className="phone-home">
                  {APPS.map((a) => (
                    <button key={a.id} className="app-icon" onClick={() => open(a.id)} data-testid={`app-${a.id}`}>
                      <span className="ic" style={{ background: a.bg }}>{a.icon}</span>
                      {a.label}
                      {a.id === 'messages' && unreadMsgs > 0 && <span className="badge">{unreadMsgs}</span>}
                      {a.id === 'mail' && unreadMail > 0 && <span className="badge">{unreadMail}</span>}
                    </button>
                  ))}
                </div>
                <div style={{ textAlign: 'center', marginTop: 40, fontSize: 11, color: 'var(--text-faint)' }}>Tippen außerhalb schließt das Handy</div>
              </>
            )}
            {app && (
              <div className="app-bar">
                <button onClick={() => (thread ? setThread(null) : s.setPhoneApp(null))} data-testid="phone-back">‹ Zurück</button>
                <h5>{APPS.find((a) => a.id === app)?.label}</h5>
              </div>
            )}
            {app === 'messages' && (thread ? <Thread from={thread} /> : <Threads onOpen={setThread} />)}
            {app === 'mail' && <Mail />}
            {app === 'missions' && <Missions />}
            {app === 'contacts' && <Contacts />}
            {app === 'notes' && <Notes />}
            {app === 'career' && <Career />}
          </div>
        </div>
      </div>
    </div>
  );
}

function Threads({ onOpen }: { onOpen: (f: string) => void }) {
  const messages = useGame((s) => s.messages);
  const threads = useMemo(() => {
    const by: Record<string, typeof messages> = {};
    for (const m of messages) {
      const key = m.from === 'player' ? '' : m.from;
      if (!key) continue;
      (by[key] ??= []).push(m);
    }
    return Object.entries(by).sort((a, b) => b[1][b[1].length - 1].ts - a[1][a[1].length - 1].ts);
  }, [messages]);
  if (!threads.length) return <div className="list-row">Noch keine Nachrichten.</div>;
  return (
    <>
      {threads.map(([from, list]) => {
        const last = list[list.length - 1];
        const unread = list.some((m) => !m.read);
        return (
          <button key={from} className="thread-item" onClick={() => onOpen(from)} data-testid={`thread-${from}`}>
            <span className="avatar" style={{ background: avatarColor(from), color: '#000' }}>{nameOf(from).split(' ').map((x) => x[0]).slice(0, 2).join('')}</span>
            <span className="p">
              <b>{nameOf(from)}</b>
              <span>{last.text}</span>
            </span>
            {unread && <span className="dotu" />}
          </button>
        );
      })}
    </>
  );
}

function Thread({ from }: { from: string }) {
  const s = useGame();
  const endRef = useRef<HTMLDivElement>(null);
  const all = s.messages;
  // reconstruct conversation: NPC messages from `from` + player replies that directly follow them
  const conv = useMemo(() => {
    const out: typeof all = [];
    let lastWasFrom = false;
    for (const m of all) {
      if (m.from === from) {
        out.push(m);
        lastWasFrom = true;
      } else if (m.from === 'player' && lastWasFrom) out.push(m);
      else lastWasFrom = false;
    }
    return out;
  }, [all, from]);
  useEffect(() => {
    s.markRead(from);
    endRef.current?.scrollIntoView();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conv.length]);
  const pendingMsg = conv.find((m) => m.retrieval && !m.answered);
  const item = pendingMsg ? RETRIEVAL.find((r) => r.id === pendingMsg.retrieval) : undefined;

  return (
    <div className="bubbles">
      {conv.map((m, i) => (
        <div key={m.id} style={{ display: 'contents' }}>
          {(i === 0 || conv[i - 1].day !== m.day) && <div className="bubble-time">Tag {m.day} · {m.time}</div>}
          <div className={`bubble ${m.from === 'player' ? 'out' : 'in'}`}>{m.text}</div>
        </div>
      ))}
      {pendingMsg && item && <RetrievalReply msgId={pendingMsg.id} item={item} />}
      <div ref={endRef} />
    </div>
  );
}

function RetrievalReply({ msgId, item }: { msgId: string; item: (typeof RETRIEVAL)[number] }) {
  const s = useGame();
  const [text, setText] = useState('');
  const [e, setE] = useState<Evaluation | null>(null);
  const [busy, setBusy] = useState(false);
  const diff = difficulty(s.lang, { hints: s.settings.hints });
  const opts = useMemo(() => [...(item.choices ?? [])].sort(() => Math.random() - 0.5), [item]);
  if (item.kind === 'choice') {
    return (
      <div>
        {opts.map((c, i) => (
          <button
            key={i}
            className="opt"
            onClick={() => {
              s.recordRetrievalChoice(item, c.correct);
              s.answerMessage(msgId, c.text, c.correct);
              if (!c.correct && c.feedback) s.toast(c.feedback, 'warn');
            }}
            data-testid={`sms-opt-${i}`}
          >
            {c.text}
          </button>
        ))}
      </div>
    );
  }
  const spec = { ...item.input!, targets: [item.target], mode: 'write', onFail: '', onPartial: '', onSuccess: '' } as FreeInputSpec;
  const send = async () => {
    if (!text.trim()) return;
    setBusy(true);
    const ev = await gradeAnswer(text, spec, diff.strictness, s.settings.aiKey, s.settings.aiModel);
    setE(ev);
    s.recordRetrievalInput(item, ev, text);
    s.answerMessage(msgId, text, ev.tier !== 'incorrect' && ev.tier !== 'understandable');
    setBusy(false);
  };
  return (
    <>
      <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 6 }}>{item.input!.task}</div>
      <div className="reply">
        <input value={text} onChange={(x) => setText(x.target.value)} onKeyDown={(x) => { x.stopPropagation(); if (x.key === 'Enter') void send(); }} placeholder="Nachricht …" data-testid="sms-input" />
        <button onClick={send} disabled={busy}>↑</button>
      </div>
      {e && (
        <div className="mini-eval">
          <b className={`t-${e.tier}`}>{TIER_LABEL[e.tier]}</b> · {e.keyImprovement ?? 'Gut formuliert.'}
        </div>
      )}
    </>
  );
}

function Mail() {
  const s = useGame();
  const [open, setOpen] = useState<string | null>(null);
  const list = [...s.emails].sort((a, b) => b.ts - a.ts);
  const m = open ? EMAILS.find((x) => x.id === open) : null;
  if (m)
    return (
      <div style={{ fontSize: 14 }} data-testid="mail-open">
        <button className="tool" onClick={() => setOpen(null)} style={{ marginBottom: 10 }}>‹ Posteingang</button>
        <div style={{ fontWeight: 600, fontSize: 16 }}>{m.subject}</div>
        <div style={{ color: 'var(--text-dim)', fontSize: 12, margin: '4px 0 12px' }}>{m.fromName} &lt;{m.from}&gt; · {m.time}</div>
        {m.body.map((p, i) => (
          <p key={i} style={{ whiteSpace: 'pre-wrap', userSelect: 'text' }}>{p}</p>
        ))}
        {m.attachment && <div className="list-row">📎 {m.attachment}</div>}
      </div>
    );
  if (!list.length) return <div className="list-row">Keine E-Mails.</div>;
  return (
    <>
      {list.map((x) => {
        const d = EMAILS.find((e) => e.id === x.id);
        if (!d) return null;
        return (
          <button key={x.id} className="thread-item" onClick={() => { setOpen(x.id); s.readEmail(x.id); }} data-testid={`mail-${x.id}`}>
            <span className="p">
              <b style={{ fontWeight: x.read ? 400 : 700 }}>{d.fromName}</b>
              <span>{d.subject}</span>
            </span>
            {!x.read && <span className="dotu" />}
          </button>
        );
      })}
    </>
  );
}

function Missions() {
  const missions = useGame((s) => s.missions);
  const entries = Object.entries(missions).sort((a, b) => (a[1].startedAt ?? 0) - (b[1].startedAt ?? 0));
  return (
    <div data-testid="missions">
      {entries.reverse().map(([id, m]) => {
        const def = MIS[id];
        if (!def) return null;
        return (
          <div key={id} className={`mission-card ${m.status === 'active' ? 'active' : m.status === 'completed' ? 'done' : ''}`}>
            <div style={{ fontSize: 10, letterSpacing: '0.2em', color: 'var(--text-faint)' }}>{def.chapter} · {def.time}{def.boss ? ' · BOSS' : ''}</div>
            <div className="c">{def.codename}</div>
            <div style={{ fontSize: 12, color: 'var(--text-dim)', margin: '4px 0 8px' }}>{def.synopsis}</div>
            {def.objectives.map((o) => (
              <div key={o.id} className={`obj-row ${m.done.includes(o.id) || m.status === 'completed' ? 'ok' : ''}`}>◆ {o.text}</div>
            ))}
            {m.outcome && <div style={{ fontSize: 12, color: 'var(--amber)', marginTop: 6 }}>Ergebnis: {m.outcome}</div>}
          </div>
        );
      })}
      <div style={{ fontSize: 10, letterSpacing: '0.2em', color: 'var(--text-faint)', margin: '16px 0 8px' }}>IN PRODUKTION</div>
      {UPCOMING.map((u) => (
        <div key={u.codename} className="mission-card locked">
          <div style={{ fontSize: 10, letterSpacing: '0.2em', color: 'var(--text-faint)' }}>{u.chapter}</div>
          <div className="c">{u.codename}</div>
          <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>{u.hook}</div>
        </div>
      ))}
    </div>
  );
}

function Contacts() {
  const s = useGame();
  const known = Object.keys(s.rel).filter((id) => NPC[id]);
  const [open, setOpen] = useState<string | null>(null);
  if (!known.length) return <div className="list-row">Noch niemanden kennengelernt.</div>;
  return (
    <>
      {known.map((id) => {
        const n = NPC[id];
        const r = Math.round(s.rel[id]);
        return (
          <div key={id} className="list-row" onClick={() => setOpen(open === id ? null : id)} style={{ cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="avatar" style={{ background: n.portrait.accent, color: '#000' }}>{n.name.split(' ').map((x) => x[0]).slice(0, 2).join('')}</span>
              <div style={{ flex: 1 }}>
                <b>{n.name}</b>
                <small>{n.role}</small>
              </div>
              <span style={{ fontFamily: 'var(--mono)', color: r >= 0 ? 'var(--green)' : 'var(--red)' }}>{r > 0 ? '+' : ''}{r}</span>
            </div>
            {open === id && (
              <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-dim)' }}>
                <p style={{ margin: '4px 0' }}>{n.bio}</p>
                <p style={{ margin: '4px 0', fontStyle: 'italic' }}>{n.personality}</p>
                <div style={{ color: 'var(--amber)', fontSize: 11, marginTop: 6 }}>ERINNERT SICH:</div>
                {(s.memories[id] ?? ['–']).map((m, i) => (
                  <div key={i}>• {m}</div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}

function Notes() {
  const s = useGame();
  const [tab, setTab] = useState<'terms' | 'vocab' | 'items'>('terms');
  const vocab = Object.entries(s.lang.vocab).sort((a, b) => b[1].lookups - a[1].lookups);
  return (
    <div>
      <div className="tabs" style={{ marginTop: 0 }}>
        <button className={tab === 'terms' ? 'on' : ''} onClick={() => setTab('terms')}>Termini</button>
        <button className={tab === 'vocab' ? 'on' : ''} onClick={() => setTab('vocab')}>Wörter</button>
        <button className={tab === 'items' ? 'on' : ''} onClick={() => setTab('items')}>Dinge</button>
      </div>
      {tab === 'terms' &&
        (Object.keys(s.terms).length ? (
          Object.keys(s.terms).map((id) => {
            const t = TERM_BY_ID[id];
            if (!t) return null;
            return (
              <div key={id} className="term">
                <h5>
                  {t.de}
                  <span className={`eq ${t.equivalence}`}>{t.equivalence === 'full' ? 'ÄQUIVALENT' : t.equivalence === 'partial' ? 'TEILWEISE' : 'KEIN PENDANT'}</span>
                </h5>
                <div className="pl">{t.pl.join(' / ')}</div>
                <p>{t.note}</p>
                {t.falseFriends && <p style={{ color: 'var(--red)' }}>⚠ {t.falseFriends}</p>}
                <div className="coll">{t.collocations.join(' · ')}</div>
              </div>
            );
          })
        ) : (
          <div className="list-row">Noch keine Fachbegriffe gesammelt.</div>
        ))}
      {tab === 'vocab' &&
        vocab.slice(0, 60).map(([id, v]) => {
          const e = VOCAB_BY_ID[id];
          if (!e) return null;
          const st = vocabStage(v);
          return (
            <div key={id} className="list-row">
              <b>{e.de}</b> <span style={{ color: 'var(--cold)' }}>— {e.pl}</span>
              <small>
                {['', 'gesehen', 'erkannt', 'aktiv benutzt', 'mehrfach benutzt', 'beherrscht'][st]} · nachgeschlagen {v.lookups}× · aktiv {v.prod}×
              </small>
            </div>
          );
        })}
      {tab === 'items' &&
        (s.items.length ? s.items.map((i) => (
          <div key={i} className="list-row">
            <b>{ITEMS[i]?.name ?? i}</b>
            <small>{ITEMS[i]?.description}</small>
          </div>
        )) : <div className="list-row">Nichts in der Tasche.</div>)}
    </div>
  );
}

function Career() {
  const s = useGame();
  const idx = CAREER.findIndex((c) => c.rank === s.career);
  return (
    <div className="career">
      {CAREER.map((c, i) => (
        <div key={c.rank} className={`career-step ${i < idx ? 'done' : i === idx ? 'done current' : ''}`}>
          <span className="node" />
          <div>
            <b>{c.title}</b>
            <small>{c.subtitle}</small>
            {i === idx + 1 &&
              c.reqs.map((r, k) => {
                const ok = r.mission ? s.missions[r.mission]?.status === 'completed' : r.skill ? s.lang.skills[r.skill] >= (r.min ?? 0) : r.overall ? overallRating(s.lang) >= r.overall : false;
                return (
                  <div key={k} className={`req ${ok ? 'ok' : ''}`}>
                    {ok ? '✓' : '○'} {r.label}
                  </div>
                );
              })}
            {i <= idx && <small style={{ color: 'var(--amber)' }}>Freigeschaltet: {c.unlocks}</small>}
          </div>
        </div>
      ))}
      <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 12 }}>
        Aufstieg nur durch nachgewiesene Kompetenz – nie durch XP allein. {ACHIEVEMENTS.length} Auszeichnungen im Dossier.
      </div>
    </div>
  );
}
