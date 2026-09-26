import { useState } from 'react';
import { useGame } from '../../engine/store';
import { ALL_LOCATIONS, CITIES, LOC, MIS } from '../../content';

/** Stylised Berlin map: Spree, Ringbahn, districts, pins. */
export function MapOverlay() {
  const s = useGame();
  const [sel, setSel] = useState<string | null>(null);
  const [view, setView] = useState<'berlin' | 'de'>('berlin');
  const pins = ALL_LOCATIONS.filter((l) => !l.parent);
  const active = Object.entries(s.missions).filter(([, m]) => m.status === 'active').map(([id, m]) => ({ def: MIS[id], m }));
  const objLocs = new Set(active.flatMap(({ def, m }) => def.objectives.filter((o) => !m.done.includes(o.id)).slice(0, 1).map((o) => o.location)));
  const here = LOC[s.location]?.parent ?? s.location;
  const selLoc = sel ? LOC[sel] : null;
  const unlocked = (id: string) => s.unlocked.includes(id);

  return (
    <div className="overlay" data-testid="map">
      <button className="overlay-close" onClick={s.closeOverlay} data-testid="close">✕</button>
      <div className="map-wrap">
        {view === 'berlin' ? (
          <svg className="map-svg" viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid meet">
            <defs>
              <radialGradient id="mapglow" cx="0.55" cy="0.5" r="0.6">
                <stop offset="0" stopColor="#15202e" />
                <stop offset="1" stopColor="#05070a" />
              </radialGradient>
              <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
                <path d="M24 0H0V24" fill="none" stroke="#ffffff" strokeOpacity="0.035" />
              </pattern>
            </defs>
            <rect width="1000" height="700" fill="url(#mapglow)" />
            <rect width="1000" height="700" fill="url(#grid)" />
            {/* city limits */}
            <path d="M120 180 C180 70 420 40 560 60 C760 80 900 160 930 300 C960 450 900 620 700 660 C520 690 300 660 190 560 C100 480 80 280 120 180 Z" fill="none" stroke="#2a3646" strokeWidth="2" strokeDasharray="6 6" />
            {/* Spree */}
            <path d="M960 610 C880 560 820 540 760 470 C720 420 690 400 640 380 C590 360 560 330 520 318 C470 304 440 310 400 300 C340 285 300 330 250 330 C200 330 160 300 60 310" fill="none" stroke="#1d4f7a" strokeWidth="9" strokeLinecap="round" opacity="0.8" />
            <path d="M620 470 C660 470 700 460 740 470" fill="none" stroke="#1d4f7a" strokeWidth="5" opacity="0.6" />
            {/* Ringbahn */}
            <ellipse cx="520" cy="360" rx="250" ry="185" fill="none" stroke="#1b8a3d" strokeWidth="3" opacity="0.55" />
            <text x="760" y="255" fill="#1b8a3d" opacity="0.8" fontSize="12" fontFamily="Inter" letterSpacing="3">RINGBAHN S41/S42</text>
            {/* U/S lines (stylised) */}
            <path d="M432 300 L500 334 L560 350 L640 370 L700 380" stroke="#1d5fae" strokeWidth="2.5" opacity="0.5" fill="none" />
            <path d="M500 150 L500 334 L520 450 L608 452" stroke="#1d5fae" strokeWidth="2.5" opacity="0.5" fill="none" />
            <path d="M574 232 L560 300 L500 334" stroke="#c01d1d" strokeWidth="2" opacity="0.4" fill="none" />
            {/* districts */}
            {[
              ['MITTE', 505, 290],
              ['KREUZBERG', 560, 505],
              ['PRENZLAUER BERG', 580, 190],
              ['FRIEDRICHSHAIN', 700, 340],
              ['CHARLOTTENBURG', 215, 390],
              ['MOABIT', 390, 250],
              ['NEUKÖLLN', 650, 580],
              ['KÖPENICK', 850, 620],
            ].map(([n, x, y]) => (
              <text key={n as string} x={x as number} y={y as number} fill="#fff" opacity="0.13" fontSize="17" fontFamily="Bebas Neue" letterSpacing="6" textAnchor="middle">
                {n}
              </text>
            ))}
            {pins.map((l) => {
              const open = unlocked(l.id);
              const isHere = here === l.id;
              const target = objLocs.has(l.id);
              return (
                <g key={l.id} className="map-pin" transform={`translate(${l.map.x} ${l.map.y})`} onClick={() => setSel(l.id)} data-testid={`pin-${l.id}`} opacity={open ? 1 : 0.45}>
                  {target && (
                    <circle r="22" fill="none" stroke="#e8b04a" strokeWidth="2">
                      <animate attributeName="r" values="12;30;12" dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="1;0;1" dur="2s" repeatCount="indefinite" />
                    </circle>
                  )}
                  <circle className="ring" r="11" fill="#07090d" stroke={isHere ? '#fff' : target ? '#e8b04a' : open ? '#9fb8d6' : '#555'} strokeWidth="2.5" />
                  <circle r="4.5" fill={isHere ? '#fff' : target ? '#e8b04a' : open ? '#9fb8d6' : '#555'} />
                  <text x="18" y="4">{l.name}</text>
                  <text className="sub" x="18" y="19">{open ? l.district : l.locked ?? 'gesperrt'}</text>
                </g>
              );
            })}
            <text x="30" y="670" fill="#fff" opacity="0.3" fontFamily="JetBrains Mono" fontSize="11">BERLIN · 52°31′N 13°24′E</text>
          </svg>
        ) : (
          <svg className="map-svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
            <rect width="100" height="100" fill="#05070a" />
            <path d="M38 5 L55 8 L62 14 L75 18 L80 32 L78 45 L85 60 L78 72 L72 82 L64 95 L45 96 L30 90 L22 80 L25 68 L15 58 L12 45 L18 35 L22 22 L30 15 Z" fill="#0f151d" stroke="#2a3646" strokeWidth="0.5" />
            {CITIES.map((c) => (
              <g key={c.id} opacity={c.available ? 1 : 0.5}>
                <circle cx={c.x} cy={c.y} r={c.available ? 1.8 : 1.1} fill={c.available ? '#e8b04a' : '#556'} />
                <text x={c.x + 2.5} y={c.y + 1} fontSize="2.6" fill="#fff" fontFamily="Inter">{c.name}</text>
                <text x={c.x + 2.5} y={c.y + 4} fontSize="1.7" fill="#999" fontFamily="Inter">{c.available ? c.tagline : 'bald verfügbar'}</text>
              </g>
            ))}
          </svg>
        )}
        <div className="map-side">
          <div className="kicker">{view === 'berlin' ? 'Berlin' : 'Deutschland'}</div>
          <h2 className="panel-title">KARTE</h2>
          <div className="tabs">
            <button className={view === 'berlin' ? 'on' : ''} onClick={() => setView('berlin')}>Berlin</button>
            <button className={view === 'de' ? 'on' : ''} onClick={() => setView('de')}>Deutschland</button>
          </div>
          {view === 'berlin' && !selLoc && <p style={{ color: 'var(--text-dim)', marginTop: 16 }}>Wählen Sie einen Ort. Goldene Markierung = aktuelles Ziel.</p>}
          {view === 'de' && <p style={{ color: 'var(--text-dim)', marginTop: 16 }}>Kapitel 1 spielt in Berlin. Weitere Städte werden freigeschaltet, sobald Berlin abgeschlossen ist.</p>}
          {view === 'berlin' && selLoc && (
            <div className="loc-card" key={selLoc.id}>
              <div className="d">{selLoc.district}</div>
              <h4>{selLoc.name}</h4>
              <p>{selLoc.description}</p>
              {selLoc.transit && <div className="transit">{selLoc.transit}</div>}
              {unlocked(selLoc.id) ? (
                here === selLoc.id ? (
                  <div style={{ color: 'var(--text-dim)', fontSize: 13 }}>Sie sind hier.</div>
                ) : (
                  <button className="btn primary" onClick={() => s.travelTo(selLoc.id)} data-testid="travel">
                    HINFAHREN
                  </button>
                )
              ) : (
                <div style={{ color: 'var(--red)', fontSize: 13 }}>{selLoc.locked ?? 'Noch nicht zugänglich.'}</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function Travel() {
  const tr = useGame((s) => s.ui.travel)!;
  const finish = useGame((s) => s.finishTravel);
  const to = LOC[tr.to];
  const from = LOC[tr.from];
  const lines = (to.transit ?? 'U-Bahn').split('·').map((x) => x.trim()).slice(0, 3);
  return (
    <div className="travel" onClick={finish} data-testid="travel-screen" ref={(el) => { if (el && !el.dataset.t) { el.dataset.t = '1'; setTimeout(finish, 2600); } }}>
      <div className="travel-inner">
        <div className="line-badges">
          {lines.map((l, i) => {
            const k = l.startsWith('U') ? 'u' : l.startsWith('S') ? 's' : 't';
            return <span key={i} className={`lb ${k}`}>{l.split(' ')[0]}</span>;
          })}
        </div>
        <div className="travel-route">
          <span>{(from?.parent ? LOC[from.parent] : from)?.name.toUpperCase()}</span>
          <span className="arrow"><i /></span>
          <span style={{ color: 'var(--amber)' }}>{to.name.toUpperCase()}</span>
        </div>
        <div className="hint">KLICKEN ZUM ÜBERSPRINGEN</div>
      </div>
    </div>
  );
}
