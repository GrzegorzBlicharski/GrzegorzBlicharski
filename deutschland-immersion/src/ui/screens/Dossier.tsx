import { useState } from 'react';
import { useGame } from '../../engine/store';
import { ACHIEVEMENTS, CAREER, TARGET_BY_ID, TERM_BY_ID, TERMS } from '../../content';
import { CEFR_SCALE, SKILLS, SKILL_LABEL, cefrOf, overallRating, vocabStage, weaknesses } from '../../engine/languageModel';
import { TIER_LABEL } from '../../engine/types';
import type { SkillId } from '../../engine/types';

function Radar({ skills, ghost }: { skills: Record<SkillId, number>; ghost?: Record<SkillId, number> }) {
  const keys = SKILLS;
  const cx = 160;
  const cy = 160;
  const R = 120;
  const pt = (i: number, v: number) => {
    const a = (Math.PI * 2 * i) / keys.length - Math.PI / 2;
    return [cx + Math.cos(a) * R * (v / 1000), cy + Math.sin(a) * R * (v / 1000)];
  };
  const poly = (src: Record<SkillId, number>) => keys.map((k, i) => pt(i, Math.max(40, src[k])).join(',')).join(' ');
  return (
    <svg viewBox="-50 -10 420 340" width="100%" style={{ maxWidth: 420 }}>
      {[0.25, 0.5, 0.75, 1].map((r) => (
        <polygon key={r} points={keys.map((_, i) => pt(i, r * 1000).join(',')).join(' ')} fill="none" stroke="#fff" strokeOpacity="0.08" />
      ))}
      {keys.map((k, i) => {
        const [x, y] = pt(i, 1120);
        return (
          <text key={k} x={x} y={y} fill="#fff" opacity="0.55" fontSize="9" textAnchor="middle" fontFamily="Inter">
            {SKILL_LABEL[k]}
          </text>
        );
      })}
      {ghost && <polygon points={poly(ghost)} fill="none" stroke="#fff" strokeOpacity="0.35" strokeDasharray="3 3" />}
      <polygon points={poly(skills)} fill="rgba(232,176,74,0.22)" stroke="#e8b04a" strokeWidth="2" />
    </svg>
  );
}

export function Dossier() {
  const s = useGame();
  const [tab, setTab] = useState<'profil' | 'schwaechen' | 'fehler' | 'termini' | 'erfolge'>('profil');
  const overall = overallRating(s.lang);
  const level = cefrOf(overall);
  const first = s.lang.snapshots[0];
  const weak = weaknesses(s.lang).slice(0, 12);
  const vocab = Object.values(s.lang.vocab);
  const recog = vocab.filter((v) => vocabStage(v) >= 1).length;
  const prod = vocab.filter((v) => vocabStage(v) >= 3).length;
  const mastered = vocab.filter((v) => vocabStage(v) >= 5).length;
  const tierCount = s.lang.productions.reduce<Record<string, number>>((a, p) => ((a[p.tier] = (a[p.tier] ?? 0) + 1), a), {});
  const early = s.lang.productions.slice(-5);
  const recent = s.lang.productions.slice(0, 5);
  const avg = (xs: { score: number }[]) => (xs.length ? Math.round(xs.reduce((a, x) => a + x.score, 0) / xs.length) : 0);
  const careerStep = CAREER.find((c) => c.rank === s.career);
  const li = CEFR_SCALE.findIndex(([c]) => c === level);

  return (
    <div className="overlay" data-testid="dossier">
      <button className="overlay-close" onClick={s.closeOverlay} data-testid="close">✕</button>
      <div className="dossier">
        <div className="kicker">Dossier · {s.player.first} {s.player.last}</div>
        <h2 className="panel-title">IHR DEUTSCH</h2>
        <div className="tabs">
          {(['profil', 'schwaechen', 'fehler', 'termini', 'erfolge'] as const).map((t) => (
            <button key={t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)} data-testid={`tab-${t}`}>
              {{ profil: 'Profil', schwaechen: 'Schwächen', fehler: 'Fehlerprotokoll', termini: 'Terminologie', erfolge: 'Erfolge' }[t]}
            </button>
          ))}
        </div>

        {tab === 'profil' && (
          <div className="dossier-grid">
            <div className="card">
              <h3>Geschätztes Niveau</h3>
              <div style={{ display: 'flex', gap: 30, alignItems: 'flex-end' }}>
                <div className="cefr-big" data-testid="cefr">{level}</div>
                <div style={{ paddingBottom: 12, color: 'var(--text-dim)', fontSize: 13 }}>
                  Gesamtwert {Math.round(overall)} / 1000
                  <br />
                  Karriere: <b style={{ color: 'var(--amber)' }}>{careerStep?.title}</b>
                  <br />
                  Stufe {Math.floor(Math.sqrt(s.xp / 60)) + 1} · {s.xp} XP
                </div>
              </div>
              <div className="cefr-scale">
                {CEFR_SCALE.map(([c], i) => (
                  <span key={c} className={i === li ? 'on' : i < li ? 'past' : ''}>{c}</span>
                ))}
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 10 }}>
                Das Niveau steigt nur durch gezeigte Leistung (bewertete Antworten, Hör- und Leseverstehen) – nicht durch XP. Endziel: C2 + Juristendeutsch + Übersetzen PL↔DE.
              </p>
              <h3 style={{ marginTop: 18 }}>Kompetenzen {first && <span style={{ color: 'var(--text-faint)', letterSpacing: 0 }}>· gestrichelt = Stand „{first.label}“</span>}</h3>
              {SKILLS.map((k) => {
                const v = s.lang.skills[k];
                const g = first?.skills[k];
                const d = g !== undefined ? v - g : 0;
                return (
                  <div className="skill-row" key={k} data-testid={`skill-${k}`}>
                    <span>{SKILL_LABEL[k]}</span>
                    <div className="track">
                      <i style={{ width: `${v / 10}%` }} />
                      {g !== undefined && <span className="ghost" style={{ left: `${g / 10}%` }} />}
                    </div>
                    <span className="c">{cefrOf(v)}</span>
                    <span className={`delta ${d < 0 ? 'neg' : ''}`}>{d ? `${d > 0 ? '+' : ''}${Math.round(d)}` : ''}</span>
                  </div>
                );
              })}
            </div>
            <div>
              <div className="card" style={{ display: 'grid', placeItems: 'center' }}>
                <Radar skills={s.lang.skills} ghost={first?.skills} />
              </div>
              <div className="card" style={{ marginTop: 20 }}>
                <h3>Wortschatz · passiv vs. aktiv</h3>
                <div className="stat-grid">
                  <div className="stat"><b>{recog}</b><span>gesehen / erkannt</span></div>
                  <div className="stat"><b>{prod}</b><span>aktiv benutzt</span></div>
                  <div className="stat"><b>{mastered}</b><span>beherrscht</span></div>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-faint)' }}>Ein Wort gilt erst als beherrscht, wenn Sie es wiederholt spontan selbst verwendet haben.</p>
              </div>
              <div className="card" style={{ marginTop: 20 }}>
                <h3>Damals vs. heute</h3>
                {s.lang.productions.length >= 4 ? (
                  <div className="stat-grid">
                    <div className="stat"><b>{avg(early)}</b><span>Ø erste 5 Antworten</span></div>
                    <div className="stat"><b style={{ color: 'var(--amber)' }}>{avg(recent)}</b><span>Ø letzte 5 Antworten</span></div>
                    <div className="stat"><b>{s.lang.productions.length}</b><span>Antworten gesamt</span></div>
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-dim)', fontSize: 13 }}>Nach ein paar frei formulierten Antworten sehen Sie hier Ihren Fortschritt.</p>
                )}
                <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-dim)' }}>
                  {Object.entries(tierCount).map(([t, n]) => (
                    <span key={t} style={{ marginRight: 12 }} className={`t-${t}`}>{TIER_LABEL[t as keyof typeof TIER_LABEL]}: {n}</span>
                  ))}
                </div>
                <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-faint)' }}>
                  Hilfen genutzt: {s.stats.hints} · Untertitel aufgedeckt: {s.stats.subtitleReveals} · Wörter nachgeschlagen: {s.stats.lookups}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'schwaechen' && (
          <div className="card" style={{ marginTop: 26 }}>
            <h3>Aktive Schwachstellen · werden unsichtbar in künftige Situationen eingebaut</h3>
            {weak.length === 0 && <p style={{ color: 'var(--text-dim)' }}>Noch keine erkannten Schwächen. Spielen Sie weiter – das System lernt Sie kennen.</p>}
            {weak.map((w) => {
              const t = TARGET_BY_ID[w.id];
              const m = w.state.mastery;
              return (
                <div key={w.id} className="weak-row">
                  <div>
                    {t?.label ?? w.id}
                    <small>{t?.level} · {w.state.errors} Fehler · {w.state.seen}× geübt · nächste Wiederholung {w.state.due <= Date.now() ? 'jetzt fällig' : new Date(w.state.due).toLocaleString('de-DE', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}</small>
                  </div>
                  <div className={`mbar ${m < 0.4 ? 'low' : m < 0.65 ? 'mid' : ''}`}><i style={{ width: `${m * 100}%` }} /></div>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>{Math.round(m * 100)} %</span>
                </div>
              );
            })}
            <button className="btn primary" style={{ marginTop: 18 }} onClick={() => s.openOverlay('training')} data-testid="go-training">
              GEZIELT TRAINIEREN
            </button>
          </div>
        )}

        {tab === 'fehler' && (
          <div className="card" style={{ marginTop: 26 }}>
            <h3>Fehlerprotokoll · Kategorien</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
              {Object.entries(s.lang.categoryErrors)
                .sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))
                .map(([c, n]) => (
                  <span key={c} className="tool">{c} · {n}</span>
                ))}
            </div>
            {s.lang.errors.slice(0, 40).map((e, i) => (
              <div key={i} className="err-row">
                {e.text && <q>{e.text.slice(0, 120)}</q>} — {e.message}
                {e.target && <span style={{ color: 'var(--amber)', marginLeft: 6, fontSize: 11 }}>[{TARGET_BY_ID[e.target]?.label ?? e.target}]</span>}
              </div>
            ))}
            {!s.lang.errors.length && <p style={{ color: 'var(--text-dim)' }}>Noch keine Fehler protokolliert.</p>}
          </div>
        )}

        {tab === 'termini' && (
          <div className="card" style={{ marginTop: 26 }}>
            <h3>Terminologiedatenbank PL ↔ DE · {Object.keys(s.terms).length}/{TERMS.length} gesammelt</h3>
            {TERMS.map((t) => {
              const got = !!s.terms[t.id];
              const tm = s.lang.translationMemory.filter((x) => x.term.toLowerCase().includes(t.de.replace(/^(der|die|das) /, '').toLowerCase().split(' ')[0]));
              return (
                <div key={t.id} className="term" style={{ opacity: got ? 1 : 0.35 }}>
                  <h5>
                    {got ? t.de : '???'}
                    <span className={`eq ${t.equivalence}`}>{t.equivalence === 'full' ? 'ÄQUIVALENT' : t.equivalence === 'partial' ? 'TEILWEISE ÄQUIVALENT' : 'KEIN PENDANT'}</span>
                  </h5>
                  {got && (
                    <>
                      <div className="pl">PL: {t.pl.join(' / ')}</div>
                      <p>{t.context}</p>
                      <p>{t.note}</p>
                      {t.falseFriends && <p style={{ color: '#ff8a8f' }}>⚠ Falsche Freunde: {t.falseFriends}</p>}
                      <div className="coll">Kollokationen: {t.collocations.join(' · ')}</div>
                      <div className="coll" style={{ fontStyle: 'italic', marginTop: 4 }}>„{t.example}“</div>
                      {tm.length > 0 && <div className="coll" style={{ marginTop: 4 }}>Übersetzungsgedächtnis: {tm.filter((x) => x.ok).length}× korrekt, {tm.filter((x) => !x.ok).length}× falsch</div>}
                    </>
                  )}
                </div>
              );
            })}
            <p style={{ fontSize: 12, color: 'var(--text-faint)' }}>{TERM_BY_ID.vertragsstrafe ? 'Begriffe werden im Spiel gesammelt und später in neuen Dokumenten wieder abgefragt.' : ''}</p>
          </div>
        )}

        {tab === 'erfolge' && (
          <div className="dossier-grid">
            <div className="card">
              <h3>Auszeichnungen</h3>
              {ACHIEVEMENTS.map((a) => (
                <div key={a.id} className={`ach ${s.achievements[a.id] ? '' : 'locked'}`}>
                  <span className="i">{a.icon}</span>
                  <div>
                    <b>{a.title}</b>
                    <small>{a.description}</small>
                  </div>
                </div>
              ))}
            </div>
            <div className="card">
              <h3>Karriereleiter</h3>
              <div className="career">
                {CAREER.map((c, i) => {
                  const idx = CAREER.findIndex((x) => x.rank === s.career);
                  return (
                    <div key={c.rank} className={`career-step ${i <= idx ? 'done' : ''}`}>
                      <span className="node" />
                      <div>
                        <b>{c.title}</b>
                        <small>{c.subtitle} — {c.unlocks}</small>
                        {i === idx + 1 &&
                          c.reqs.map((r, k) => {
                            const ok = r.mission ? s.missions[r.mission]?.status === 'completed' : r.skill ? s.lang.skills[r.skill] >= (r.min ?? 0) : r.overall ? overall >= r.overall : false;
                            return <div key={k} className={`req ${ok ? 'ok' : ''}`}>{ok ? '✓' : '○'} {r.label}</div>;
                          })}
                      </div>
                    </div>
                  );
                })}
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-faint)' }}>
                Endstufe „Tłumacz przysięgły“: Prüfungssimulationen werden erst gebaut, nachdem die aktuellen amtlichen Prüfungsregeln (Państwowa Komisja Egzaminacyjna, Ministerstwo Sprawiedliwości) verifiziert sind.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
