import { useMemo, useState } from 'react';
import { useGame } from '../../engine/store';
import { DRILLS, DRILLS_BY_TARGET, TARGET_BY_ID } from '../../content';
import { weaknesses } from '../../engine/languageModel';
import { looseEqual } from '../../engine/text';
import type { DrillItem } from '../../engine/types';
import { audio } from '../../engine/audio';

/** TRAINING MODE — the desk in your apartment. Focused, but still in-world. */
export function Training() {
  const s = useGame();
  const [session, setSession] = useState<DrillItem[] | null>(null);
  const [i, setI] = useState(0);
  const [answer, setAnswer] = useState('');
  const [res, setRes] = useState<null | boolean>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const weak = useMemo(() => weaknesses(s.lang).filter((w) => DRILLS_BY_TARGET[w.id]), [s.lang]);
  const all = Object.keys(DRILLS_BY_TARGET);

  const start = (targets: string[]) => {
    const pool = DRILLS.filter((d) => targets.includes(d.target));
    const pick = [...pool].sort(() => Math.random() - 0.5).slice(0, 6);
    setSession(pick);
    setI(0);
    setScore(0);
    setDone(false);
    setRes(null);
    setAnswer('');
  };

  const item = session?.[i];
  const check = (val: string) => {
    if (!item || res !== null) return;
    const ok = item.answers.some((a) => looseEqual(a, val));
    setRes(ok);
    if (ok) setScore((x) => x + 1);
    s.trainingResult(item.target, ok);
    audio.sfx(ok ? 'success' : 'fail');
  };
  const next = () => {
    if (!session) return;
    if (i + 1 >= session.length) {
      setDone(true);
      s.finishTraining(Math.round((score / session.length) * 100));
      return;
    }
    setI(i + 1);
    setRes(null);
    setAnswer('');
  };

  return (
    <div className="overlay" data-testid="training">
      <button className="overlay-close" onClick={s.closeOverlay} data-testid="close">✕</button>
      <div className="training">
        <div className="notebook">
          {!session && (
            <>
              <div className="ctx">Schreibtisch · Graefestraße 12</div>
              <h3>TRAINING</h3>
              <p style={{ fontFamily: 'var(--serif)', fontSize: 17 }}>
                Hier arbeiten Sie bewusst an einer Schwäche. Die Welt tut das ohnehin – unsichtbar. Das Training ist für die Tage, an denen Sie es wissen wollen.
              </p>
              {weak.length > 0 && (
                <>
                  <div className="ctx" style={{ marginTop: 18 }}>Empfohlen · Ihre aktuellen Schwachstellen</div>
                  {weak.slice(0, 4).map((w) => (
                    <button key={w.id} className="pick-target" onClick={() => start([w.id])} data-testid={`train-${w.id}`}>
                      <b>{TARGET_BY_ID[w.id]?.label}</b> <small>· Beherrschung {Math.round(w.state.mastery * 100)} % · {w.state.errors} Fehler</small>
                    </button>
                  ))}
                  <button className="pick-target" onClick={() => start(weak.map((w) => w.id))}>
                    <b>Gemischt: alle Schwachstellen</b>
                  </button>
                </>
              )}
              <div className="ctx" style={{ marginTop: 18 }}>Alle Themen</div>
              <div style={{ columns: 2 }}>
                {all.map((t) => (
                  <button key={t} className="pick-target" onClick={() => start([t])} data-testid={`train-all-${t}`}>
                    {TARGET_BY_ID[t]?.label} <small>· {TARGET_BY_ID[t]?.level}</small>
                  </button>
                ))}
              </div>
            </>
          )}
          {session && !done && item && (
            <>
              <div className="ctx">{item.context} · {TARGET_BY_ID[item.target]?.label}</div>
              <h3>{i + 1} / {session.length}</h3>
              <div className="prompt">{item.prompt}</div>
              {item.kind === 'choice' ? (
                <div className="ch">
                  {item.choices!.map((c) => (
                    <button key={c} onClick={() => check(c)} disabled={res !== null} data-testid="drill-choice">{c}</button>
                  ))}
                </div>
              ) : (
                <input
                  autoFocus
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  onKeyDown={(e) => {
                    e.stopPropagation();
                    if (e.key === 'Enter') res === null ? check(answer) : next();
                  }}
                  placeholder={item.kind === 'transform' ? 'Ganzer Satz …' : 'Lücke …'}
                  data-testid="drill-input"
                />
              )}
              {res !== null && (
                <div className={`fb ${res ? 'ok' : 'no'}`}>
                  {res ? 'Richtig. ' : `Richtig wäre: „${item.answers[0]}“. `}
                  {item.explanation}
                </div>
              )}
              <div className="nb-foot">
                <span>{score} richtig</span>
                {res === null ? (
                  item.kind !== 'choice' && <button className="nb-btn" onClick={() => check(answer)} data-testid="drill-check">PRÜFEN</button>
                ) : (
                  <button className="nb-btn" onClick={next} data-testid="drill-next">WEITER</button>
                )}
              </div>
            </>
          )}
          {done && session && (
            <>
              <div className="ctx">Ergebnis</div>
              <h3>{score} / {session.length}</h3>
              <p style={{ fontFamily: 'var(--serif)', fontSize: 18 }}>
                {score === session.length ? 'Sauber. Dieses Muster wird Ihnen demnächst in der Stadt wieder begegnen – dann ohne Hinweis.' : 'Die Fehler sind notiert. Die Welt wird Ihnen diese Strukturen bald wieder vorlegen – in Gesprächen, Mails, Verträgen.'}
              </p>
              <div className="nb-foot">
                <button className="nb-btn" onClick={() => setSession(null)}>NEUES TRAINING</button>
                <button className="nb-btn" onClick={s.closeOverlay} data-testid="training-close">ZURÜCK IN DIE STADT</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
