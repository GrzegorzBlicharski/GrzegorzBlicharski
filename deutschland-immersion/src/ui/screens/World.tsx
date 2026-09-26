import { useEffect, useMemo } from 'react';
import { useGame } from '../../engine/store';
import { LOC, MIS } from '../../content';
import { checkCondition, timeOfDay, xpLevel } from '../../engine/logic';
import { cefrOf, overallRating } from '../../engine/languageModel';
import { audio } from '../../engine/audio';
import { Scene } from '../scenes/Scene';
import { Dialogue } from '../dialogue/Dialogue';
import type { Hotspot } from '../../engine/types';

const Icon = {
  phone: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="6" y="2" width="12" height="20" rx="3" /><line x1="10" y1="18" x2="14" y2="18" /></svg>
  ),
  map: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3z" /><path d="M9 3v15M15 6v15" /></svg>
  ),
  dossier: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 4h11l5 5v11H4z" /><path d="M8 12h8M8 16h6M8 8h4" /></svg>
  ),
  gear: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1" /></svg>
  ),
};

export function World() {
  const s = useGame();
  const loc = LOC[s.location];
  const tod = timeOfDay(s.time);
  const inDialogue = !!s.ui.dialogue;
  const cond = { flags: s.flags, items: s.items, missions: s.missions, rel: s.rel, lang: s.lang };
  const hotspots = loc ? loc.hotspots.filter((h) => checkCondition(h.condition, cond)) : [];
  const npcIds = hotspots.filter((h) => h.npc && h.kind === 'talk').map((h) => ({ id: h.npc!, x: h.x, y: h.y }));
  const unread = s.messages.filter((m) => !m.read).length + s.emails.filter((m) => !m.read).length;

  // ambience follows location & weather
  useEffect(() => {
    if (loc) audio.setAmbience(loc.ambience, s.weather);
  }, [loc, s.weather]);

  // arrival dialogue when (re)entering the world
  useEffect(() => {
    const t = setTimeout(() => {
      const st = useGame.getState();
      if (st.ui.dialogue || st.ui.overlay || st.ui.travel) return;
      const l = LOC[st.location];
      const ent = l?.onEnter?.find((e) => checkCondition(e.condition, { flags: st.flags, items: st.items, missions: st.missions, rel: st.rel, lang: st.lang }));
      if (ent) st.startDialogue(ent.dialogue);
    }, 700);
    return () => clearTimeout(t);
  }, [s.location]);

  // incoming calls
  useEffect(() => {
    if (!s.pendingCall || s.ui.ringing) return;
    const wait = Math.max(0, s.pendingCall.at - Date.now());
    const id = setTimeout(() => {
      const st = useGame.getState();
      if (st.ui.dialogue || st.ui.travel) return; // retried on next state change
      st.ring();
      audio.sfx('phone');
    }, wait);
    return () => clearTimeout(id);
  }, [s.pendingCall, s.ui.ringing, s.ui.dialogue, s.ui.travel]);

  // play-time
  useEffect(() => {
    const id = setInterval(() => useGame.getState().tick(10000), 10000);
    return () => clearInterval(id);
  }, []);

  const active = useMemo(() => Object.entries(s.missions).filter(([, m]) => m.status === 'active').map(([id, m]) => ({ id, m, def: MIS[id] })), [s.missions]);
  const cur = active[active.length - 1];
  const obj = cur?.def?.objectives.find((o) => !cur.m.done.includes(o.id));
  const objHere = obj?.location && obj.location !== s.location && obj.location !== LOC[s.location]?.parent;
  const lvl = xpLevel(s.xp);
  const cefr = cefrOf(overallRating(s.lang));

  const useHotspot = (h: Hotspot) => {
    audio.sfx('click');
    if (h.effects?.length) {
      s.applyEffects(h.effects, `hotspot.${loc.id}.${h.id}.${Date.now()}`);
      audio.sfx('whoosh');
    }
    if (h.dialogue) s.startDialogue(h.dialogue);
  };

  if (!loc) return null;
  return (
    <>
      <Scene loc={loc} tod={tod} weather={s.weather} npcIds={npcIds} reduceMotion={s.settings.reduceMotion} />
      {!inDialogue && (
        <>
          {hotspots.map((h) => (
            <button key={h.id} className={`hotspot ${h.kind}`} style={{ left: `${h.x}%`, top: `${h.y}%` }} onClick={() => useHotspot(h)} data-testid={`hotspot-${h.id}`}>
              <span className="dot" />
              <span className="label">{h.label}</span>
            </button>
          ))}
          <div className="hud">
            <div className="hud-loc" key={loc.id}>
              <div className="district">{loc.district}</div>
              <div className="name">{loc.name.toUpperCase()}</div>
              <div className="clock">
                <span data-testid="clock">{s.time}</span>
                <span>TAG {s.day}</span>
                <span>{s.weather === 'rain' ? 'Regen' : s.weather === 'overcast' ? 'Bewölkt' : s.weather === 'fog' ? 'Nebel' : 'Klar'}</span>
              </div>
            </div>
            {cur && (
              <div className="hud-obj" data-testid="objective">
                <div className="code">
                  <small>{cur.def.chapter}</small>
                  {cur.def.codename}
                </div>
                {obj && <div className="obj">{obj.text}</div>}
                {objHere && (
                  <button className="tool" style={{ marginTop: 8 }} onClick={() => s.openOverlay('map')}>
                    Auf der Karte zeigen
                  </button>
                )}
              </div>
            )}
            <div className="hud-xp">
              <div>
                <div className="meta">Stufe</div>
                <div className="lvl" data-testid="level">{lvl.level}</div>
              </div>
              <div>
                <div className="meta">
                  {s.xp} XP · <span className="cefr">{cefr}</span>
                </div>
                <div className="bar">
                  <i style={{ width: `${(lvl.into / lvl.next) * 100}%` }} />
                </div>
              </div>
            </div>
            <div className="hud-dock">
              <button className="dock-btn" onClick={() => s.openOverlay('map')} title="Karte (M)" data-testid="open-map">
                {Icon.map}
                <span className="k">KARTE</span>
              </button>
              <button className="dock-btn" onClick={() => s.openOverlay('profile')} title="Dossier (P)" data-testid="open-profile">
                {Icon.dossier}
                <span className="k">DOSSIER</span>
              </button>
              <button className="dock-btn" onClick={() => s.openOverlay('phone', null)} title="Handy (H)" data-testid="open-phone">
                {Icon.phone}
                <span className="k">HANDY</span>
                {unread > 0 && <span className="badge">{unread}</span>}
              </button>
              <button className="dock-btn" onClick={() => s.openOverlay('settings')} title="Einstellungen" data-testid="open-settings">
                {Icon.gear}
                <span className="k">MENÜ</span>
              </button>
            </div>
          </div>
        </>
      )}
      {inDialogue && <div className="dlg-shade" style={{ zIndex: 69, position: 'absolute' }} />}
      {inDialogue && <Dialogue key={`${s.ui.dialogue!.id}.${s.ui.dialogue!.node}.${s.ui.dialogue!.retrievalItem ?? ''}`} />}
    </>
  );
}
