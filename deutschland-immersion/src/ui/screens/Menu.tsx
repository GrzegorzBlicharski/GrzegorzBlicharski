import { useEffect, useState } from 'react';
import { useGame } from '../../engine/store';
import { LOC, MIS } from '../../content';
import { Scene } from '../scenes/Scene';
import { audio } from '../../engine/audio';
import { cefrOf, overallRating } from '../../engine/languageModel';

export function Menu() {
  const s = useGame();
  const hasSave = s.started;
  const active = Object.entries(s.missions).find(([, m]) => m.status === 'active');
  useEffect(() => {
    const stop = audio.drone();
    audio.setAmbience('rain', 'rain');
    return stop;
  }, []);
  return (
    <div className="menu" data-testid="menu">
      <Scene loc={LOC.spree} tod="night" weather="rain" npcIds={[]} reduceMotion={s.settings.reduceMotion} />
      <div className="scene-fx" style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 45%, transparent 70%)', zIndex: 45 }} />
      <div className="menu-content">
        <h1 className="menu-title">
          DEUTSCHLAND<span>:</span>
          <br />
          IMMERSION
        </h1>
        <div className="menu-sub">Kapitel 1 · Berlin</div>
        <div className="menu-items">
          {hasSave && (
            <button className="menu-item" onClick={() => { audio.sfx('whoosh'); s.continueGame(); }} data-testid="continue-game">
              FORTSETZEN
              <small>
                Tag {s.day} · {s.time} · {LOC[s.location]?.name}
                {active ? ` · ${MIS[active[0]]?.codename}` : ''} · {cefrOf(overallRating(s.lang))}
              </small>
            </button>
          )}
          <button className="menu-item" onClick={() => { audio.sfx('whoosh'); s.setScreen('newgame'); }} data-testid="new-game">
            NEUES SPIEL
            {hasSave && <small>überschreibt den aktuellen Spielstand</small>}
          </button>
          <button className="menu-item" onClick={() => s.openOverlay('settings')} data-testid="menu-settings">EINSTELLUNGEN</button>
        </div>
      </div>
      <div className="menu-foot">
        B1 → B2 → C1 → C2 → JURISTENDEUTSCH → PL ↔ DE
        <br />
        Alle Figuren, Firmen und Vereine sind frei erfunden.
      </div>
    </div>
  );
}

export function NewGame() {
  const s = useGame();
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [anrede, setAnrede] = useState<'Herr' | 'Frau' | ''>('Herr');
  const [level, setLevel] = useState<'B1' | 'B2' | 'C1'>('B1');
  const ok = first.trim().length > 0 && last.trim().length > 0;
  const mrz = `P<POL${last.toUpperCase().replace(/\W/g, '')}<<${first.toUpperCase().replace(/\W/g, '')}`.padEnd(44, '<').slice(0, 44);
  const cap = (x: string) => x.trim().charAt(0).toUpperCase() + x.trim().slice(1);
  return (
    <div className="newgame" data-testid="newgame">
      <div className="passport">
        <div className="cover">
          <div className="eagle">🦅</div>
          <b>RZECZPOSPOLITA POLSKA</b>
          <span style={{ fontSize: 11, letterSpacing: '0.3em' }}>PASZPORT · PASSPORT</span>
        </div>
        <div className="page">
          <h3>ANKUNFT IN BERLIN</h3>
          <div className="hint">Ihre Daten. NPCs sprechen Sie damit an – auf Deutsch.</div>
          <div className="field">
            <label>Vorname / Imię</label>
            <input value={first} onChange={(e) => setFirst(e.target.value)} autoFocus data-testid="first" />
          </div>
          <div className="field">
            <label>Nachname / Nazwisko</label>
            <input value={last} onChange={(e) => setLast(e.target.value)} data-testid="last" />
          </div>
          <div className="field">
            <label>Anrede</label>
            <div className="seg">
              {(['Herr', 'Frau', ''] as const).map((a) => (
                <button key={a || 'n'} className={anrede === a ? 'on' : ''} onClick={() => setAnrede(a)}>{a || 'Ohne Anrede (Vor- + Nachname)'}</button>
              ))}
            </div>
          </div>
          <div className="field">
            <label>Einstufung – aktuelles Niveau</label>
            <div className="seg">
              {(['B1', 'B2', 'C1'] as const).map((l) => (
                <button key={l} className={level === l ? 'on' : ''} onClick={() => setLevel(l)} data-testid={`level-${l}`}>{l}</button>
              ))}
            </div>
            <div className="hint" style={{ marginTop: 6 }}>Nur der Startwert – danach zählt ausschließlich Ihre gezeigte Leistung.</div>
          </div>
          <div className="mrz">{mrz}</div>
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button className="btn" style={{ color: '#1c1a16', borderColor: '#1c1a16' }} onClick={() => s.setScreen('menu')}>ZURÜCK</button>
            <button
              className="btn"
              style={{ background: '#1c1a16', color: '#efe8d8', opacity: ok ? 1 : 0.4 }}
              disabled={!ok}
              onClick={() => { audio.sfx('stamp'); s.newGame({ first: cap(first), last: cap(last), anrede }, level); }}
              data-testid="start"
            >
              EINREISEN
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** BERLIN — 06:42 — TAG 1. */
export function Opening() {
  const setScreen = useGame((s) => s.setScreen);
  const [step, setStep] = useState(0);
  useEffect(() => {
    audio.setAmbience('station', 'overcast');
    const stop = audio.drone();
    const times = [400, 3800, 6600, 9400, 12400];
    const ids = times.map((t, i) => setTimeout(() => setStep(i + 1), t));
    const end = setTimeout(() => setScreen('world'), 13600);
    return () => {
      ids.forEach(clearTimeout);
      clearTimeout(end);
      stop();
    };
  }, [setScreen]);
  return (
    <div className="opening" data-testid="opening">
      {step === 1 && <div className="big">BERLIN</div>}
      {step === 2 && <div className="time">06:42</div>}
      {step === 3 && <div className="day">TAG 1</div>}
      {step >= 4 && <div className="caption">Hauptbahnhof. Sie sind angekommen. Ab jetzt: nur Deutsch.</div>}
      <button className="skip" onClick={() => setScreen('world')} data-testid="skip">ÜBERSPRINGEN ›</button>
    </div>
  );
}
