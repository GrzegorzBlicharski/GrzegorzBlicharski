import { useEffect, useState } from 'react';
import { useGame, SAVE_KEY } from '../../engine/store';
import { ACHIEVEMENTS, LOC, MIS, NPC } from '../../content';
import { SKILLS, SKILL_LABEL, cefrOf, overallRating } from '../../engine/languageModel';
import { TIER_LABEL, TIER_ORDER } from '../../engine/types';
import { audio } from '../../engine/audio';
import { germanVoices, sttAvailable, ttsAvailable } from '../../engine/speech';
import { Portrait } from '../art/Portrait';

export function Toast() {
  const t = useGame((s) => s.ui.toast);
  const clear = useGame((s) => s.clearToast);
  useEffect(() => {
    if (!t) return;
    if (t.kind === 'achievement') audio.sfx('success');
    else if (t.kind === 'info') audio.sfx('notify');
    const id = setTimeout(clear, 3200);
    return () => clearTimeout(id);
  }, [t, clear]);
  if (!t) return null;
  return <div key={t.id} className={`toast ${t.kind}`} data-testid="toast">{t.text}</div>;
}

export function IncomingCall() {
  const s = useGame();
  const c = s.pendingCall;
  useEffect(() => {
    const id = setInterval(() => audio.sfx('phone'), 2200);
    return () => clearInterval(id);
  }, []);
  if (!c) return null;
  const n = NPC[c.from];
  const known = s.rel[c.from] !== undefined && c.from !== 'kessler' ? true : !!s.flags.briefed || s.missions.m_call?.status === 'completed';
  return (
    <div className="incoming" data-testid="incoming-call">
      <div style={{ width: 110, height: 140, margin: '0 auto' }}>{n && <Portrait spec={n.portrait} id={`call-${n.id}`} />}</div>
      <div className="who">{known && n ? n.name : 'Unbekannt'}</div>
      <div className="num">{c.from === 'kessler' ? '+49 30 2089 4410' : c.from === 'lukas' ? '+49 176 5541 2090' : 'Mobil'}</div>
      <div className="btns">
        <div>
          <button className="round dec" onClick={s.declineCall} data-testid="decline">✕</button>
          <div className="lbl">Ablehnen</div>
        </div>
        <div>
          <button className="round acc" onClick={s.acceptCall} data-testid="accept">✆</button>
          <div className="lbl">Annehmen</div>
        </div>
      </div>
    </div>
  );
}

export function ChapterCard() {
  const c = useGame((s) => s.ui.chapterCard);
  const clear = useGame((s) => s.clearChapter);
  useEffect(() => {
    if (!c) return;
    audio.sfx('boom');
    const id = setTimeout(clear, 5200);
    return () => clearTimeout(id);
  }, [c, clear]);
  if (!c) return null;
  return (
    <div className="chapter" onClick={clear} data-testid="chapter">
      <div>
        <h2>{c.title}</h2>
        {c.subtitle && <p>{c.subtitle}</p>}
      </div>
    </div>
  );
}

export function Debrief() {
  const s = useGame();
  const d = s.ui.debriefQueue[0];
  const [xp, setXp] = useState(0);
  useEffect(() => {
    if (!d) return;
    audio.sfx('boom');
    setXp(0);
    let v = 0;
    const id = setInterval(() => {
      v = Math.min(d.xp, v + Math.ceil(d.xp / 40));
      setXp(v);
      if (v >= d.xp) clearInterval(id);
    }, 30);
    return () => clearInterval(id);
  }, [d]);
  if (!d) return null;
  const m = MIS[d.missionId];
  const total = Object.values(d.tiers).reduce((a, b) => a + (b ?? 0), 0) || 1;
  const moved = SKILLS.filter((k) => Math.abs((d.after[k] ?? 0) - (d.before[k] ?? 0)) >= 0.5);
  return (
    <div className="debrief" data-testid="debrief">
      <div className="debrief-inner">
        <div className="done">MISSION ABGESCHLOSSEN · {m?.chapter}</div>
        <h1>{m?.codename}</h1>
        {d.outcome && <div className="outcome">{d.outcome}</div>}
        <div className="debrief-grid">
          <div className="card">
            <h3>Erfahrung</h3>
            <div className="xp-big">+{xp}</div>
            <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>Ø Leistung {d.avgScore}/100 · {d.answers} bewertete Antworten</div>
            <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 8 }}>XP skaliert mit der Qualität Ihrer Antworten, nicht mit Klicks.</div>
          </div>
          <div className="card">
            <h3>Ihre Antworten</h3>
            <div className="tier-bars">
              {[...TIER_ORDER].reverse().map((t) => (
                <div key={t} className={`tier-bar t-${t}`}>
                  <span>{TIER_LABEL[t]}</span>
                  <span className="t"><i style={{ width: `${((d.tiers[t] ?? 0) / total) * 100}%` }} /></span>
                  <span>{d.tiers[t] ?? 0}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <h3>Beziehungen</h3>
            {Object.entries(d.rel).length === 0 && <div style={{ color: 'var(--text-dim)', fontSize: 13 }}>Keine Veränderung.</div>}
            {Object.entries(d.rel).map(([id, v]) => (
              <div key={id} className="rel-row">
                <span>{NPC[id]?.name ?? id}</span>
                <span className={v >= 0 ? 'up' : 'down'}>{v > 0 ? '+' : ''}{v}</span>
              </div>
            ))}
          </div>
          <div className="card" style={{ gridColumn: 'span 2' }}>
            <h3>Kompetenzen · vorher → nachher</h3>
            {moved.length === 0 && <div style={{ color: 'var(--text-dim)', fontSize: 13 }}>Keine messbare Veränderung in dieser Mission.</div>}
            {moved.map((k) => {
              const a = d.before[k];
              const b = d.after[k];
              return (
                <div key={k} className="skill-row">
                  <span>{SKILL_LABEL[k]}</span>
                  <div className="track">
                    <i style={{ width: `${b / 10}%` }} />
                    <span className="ghost" style={{ left: `${a / 10}%` }} />
                  </div>
                  <span className="c">{cefrOf(b)}</span>
                  <span className={`delta ${b < a ? 'neg' : ''}`}>{b > a ? '+' : ''}{Math.round(b - a)}</span>
                </div>
              );
            })}
          </div>
          <div className="card">
            <h3>Wichtigster Hinweis</h3>
            <div style={{ fontSize: 14 }}>{d.topIssue ?? 'Keine gravierenden Probleme.'}</div>
            {d.unlocked.length > 0 && <div style={{ marginTop: 12, color: 'var(--amber)', fontSize: 13 }}>Neu auf der Karte: {d.unlocked.map((u) => LOC[u]?.name).join(', ')}</div>}
            {d.newMission && <div style={{ marginTop: 6, color: 'var(--amber)', fontSize: 13 }}>Nächste Mission: {MIS[d.newMission]?.codename}</div>}
            {d.achievements.map((a) => {
              const x = ACHIEVEMENTS.find((y) => y.id === a);
              return x ? <div key={a} style={{ marginTop: 6, fontSize: 13 }}>{x.icon} {x.title}</div> : null;
            })}
          </div>
        </div>
        <div style={{ marginTop: 34, display: 'flex', gap: 12 }}>
          <button className="btn primary" onClick={s.shiftDebrief} data-testid="debrief-continue">WEITER</button>
          <span style={{ alignSelf: 'center', fontSize: 12, color: 'var(--text-faint)' }}>Gesamtniveau: {cefrOf(overallRating(s.lang))} · Fortschritt gespeichert</span>
        </div>
      </div>
    </div>
  );
}

export function DayEnd() {
  const s = useGame();
  const [phase, setPhase] = useState(0);
  const snaps = s.lang.snapshots;
  const startSnap = snaps[0];
  const endSnap = snaps[snaps.length - 1];
  useEffect(() => {
    audio.sfx('boom');
  }, [phase]);
  if (phase === 1)
    return (
      <div className="chapter" onClick={s.closeOverlay} data-testid="day2-card">
        <div>
          <p>BERLIN</p>
          <h2>TAG {s.day}</h2>
          <p style={{ fontFamily: 'var(--mono)', letterSpacing: '0.2em' }}>{s.time}</p>
        </div>
      </div>
    );
  return (
    <div className="debrief" data-testid="day-end">
      <div className="debrief-inner">
        <div className="done">TAG {s.day - 1} · BILANZ</div>
        <h1>BERLIN. TAG {s.day - 1}.</h1>
        <div className="outcome">Heute Morgen konnten Sie kaum eine Durchsage verstehen. Heute Abend haben Sie einen Vertrag verhandelt.</div>
        <div className="card" style={{ marginTop: 30 }}>
          <h3>Heute Morgen → jetzt</h3>
          {SKILLS.map((k) => {
            const a = startSnap?.skills[k] ?? 0;
            const b = endSnap?.skills[k] ?? s.lang.skills[k];
            return (
              <div key={k} className="skill-row">
                <span>{SKILL_LABEL[k]}</span>
                <div className="track">
                  <i style={{ width: `${b / 10}%` }} />
                  <span className="ghost" style={{ left: `${a / 10}%` }} />
                </div>
                <span className="c">{cefrOf(b)}</span>
                <span className={`delta ${b < a ? 'neg' : ''}`}>{b !== a ? `${b > a ? '+' : ''}${Math.round(b - a)}` : ''}</span>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 30 }}>
          <button className="btn primary" onClick={() => setPhase(1)} data-testid="day-continue">SCHLAFEN</button>
        </div>
      </div>
    </div>
  );
}

export function Settings() {
  const s = useGame();
  const [confirm, setConfirm] = useState(false);
  const exportSave = () => {
    const raw = localStorage.getItem(SAVE_KEY) ?? '{}';
    const blob = new Blob([raw], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `deutschland-immersion-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };
  const importSave = () => {
    const inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = 'application/json';
    inp.onchange = async () => {
      const f = inp.files?.[0];
      if (!f) return;
      const ok = s.importSave(await f.text());
      s.toast(ok ? 'Spielstand geladen' : 'Ungültige Datei', ok ? 'info' : 'warn');
    };
    inp.click();
  };
  const voices = germanVoices().length;
  return (
    <div className="overlay" data-testid="settings">
      <button className="overlay-close" onClick={s.closeOverlay} data-testid="close">✕</button>
      <div className="settings">
        <div className="kicker">Pause</div>
        <h2 className="panel-title">EINSTELLUNGEN</h2>
        <div style={{ display: 'flex', gap: 10, margin: '20px 0' }}>
          <button className="btn primary" onClick={s.closeOverlay}>WEITERSPIELEN</button>
          <button className="btn" onClick={() => { s.closeOverlay(); s.setScreen('menu'); }} data-testid="to-menu">HAUPTMENÜ</button>
        </div>
        <div className="set-row">
          <div>Polnische Hilfen<p>„Automatisch“ reduziert Hilfe mit steigendem Niveau (B2: kostet Anrechnung, C2: keine).</p></div>
          <select value={s.settings.hints} onChange={(e) => s.updateSettings({ hints: e.target.value as never })}>
            <option value="auto">Automatisch (empfohlen)</option>
            <option value="always">Immer verfügbar</option>
            <option value="never">Nie – nur Deutsch</option>
          </select>
        </div>
        <div className="set-row">
          <div>Untertitel bei Telefonaten & Durchsagen<p>Hörverstehen wird nur voll angerechnet, wenn Sie ohne Text verstehen.</p></div>
          <select value={s.settings.subtitles} onChange={(e) => s.updateSettings({ subtitles: e.target.value as never })}>
            <option value="auto">Automatisch (verborgen, aufdeckbar)</option>
            <option value="always">Immer anzeigen</option>
            <option value="never">Nie</option>
          </select>
        </div>
        <div className="set-row">
          <div>Sprachausgabe (TTS)<p>{ttsAvailable() ? `${voices} deutsche Stimme(n) im System gefunden.` : 'Nicht verfügbar in diesem Browser.'}</p></div>
          <select value={s.settings.tts ? 'on' : 'off'} onChange={(e) => s.updateSettings({ tts: e.target.value === 'on' })}>
            <option value="on">An</option>
            <option value="off">Aus</option>
          </select>
        </div>
        <div className="set-row">
          <div>Spracheingabe<p>{sttAvailable() ? 'Verfügbar (Web Speech API des Browsers; Audio wird vom Browser-Anbieter verarbeitet).' : 'In diesem Browser nicht verfügbar – Chrome oder Edge verwenden.'}</p></div>
          <span style={{ color: sttAvailable() ? 'var(--green)' : 'var(--text-faint)' }}>{sttAvailable() ? 'aktiv' : '—'}</span>
        </div>
        <div className="set-row">
          <div>Lautstärke</div>
          <input type="range" min="0" max="1" step="0.05" value={s.settings.volume} onChange={(e) => { s.updateSettings({ volume: +e.target.value }); audio.setVolume(+e.target.value); }} />
        </div>
        <div className="set-row">
          <div>Atmosphäre (Umgebungsgeräusche)</div>
          <select value={s.settings.ambience ? 'on' : 'off'} onChange={(e) => { s.updateSettings({ ambience: e.target.value === 'on' }); audio.setEnabled(e.target.value === 'on'); }}>
            <option value="on">An</option>
            <option value="off">Aus</option>
          </select>
        </div>
        <div className="set-row">
          <div>Bewegung reduzieren</div>
          <select value={s.settings.reduceMotion ? 'on' : 'off'} onChange={(e) => s.updateSettings({ reduceMotion: e.target.value === 'on' })}>
            <option value="off">Aus</option>
            <option value="on">An</option>
          </select>
        </div>
        <div className="set-row">
          <div>
            KI-Prüfer (optional)
            <p>Mit eigenem Anthropic-API-Schlüssel bewertet Claude Natürlichkeit, Register und Übersetzungen zusätzlich zur Regel-Engine. Der Schlüssel bleibt in diesem Browser und wird nur an api.anthropic.com gesendet.</p>
          </div>
          <div>
            <input type="password" placeholder="sk-ant-…" value={s.settings.aiKey} onChange={(e) => s.updateSettings({ aiKey: e.target.value.trim() })} data-testid="ai-key" />
            <input type="text" style={{ marginTop: 6 }} value={s.settings.aiModel} onChange={(e) => s.updateSettings({ aiModel: e.target.value.trim() })} />
          </div>
        </div>
        <div className="set-row">
          <div>Spielstand<p>Automatisch gespeichert (lokal). Export/Import als Datei für Backups.</p></div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="tool" onClick={exportSave}>Exportieren</button>
            <button className="tool" onClick={importSave}>Importieren</button>
          </div>
        </div>
        <div className="set-row">
          <div>Neu beginnen<p>Löscht den gesamten Fortschritt.</p></div>
          {confirm ? (
            <button className="btn danger" onClick={() => { s.resetAll(); }}>WIRKLICH LÖSCHEN</button>
          ) : (
            <button className="tool" onClick={() => setConfirm(true)}>Fortschritt löschen …</button>
          )}
        </div>
      </div>
    </div>
  );
}
