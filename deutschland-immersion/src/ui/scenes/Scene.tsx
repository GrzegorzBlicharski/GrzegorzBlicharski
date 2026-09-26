import { useEffect, useMemo, useRef, useState } from 'react';
import type { Location, Weather } from '../../engine/types';
import { sceneLayers } from '../art/scenes';
import type { TOD } from '../art/kit';
import { NPC } from '../../content';

/** Layered parallax scene with weather and lighting effects. */
export function Scene({ loc, tod, weather, npcIds, reduceMotion }: { loc: Location; tod: TOD; weather: Weather; npcIds: { id: string; x: number; y: number }[]; reduceMotion: boolean }) {
  const [m, setM] = useState({ x: 0, y: 0 });
  const npcs = npcIds.map((n) => {
    const p = NPC[n.id]?.portrait;
    return { id: n.id, x: n.x, y: n.y, coat: p?.coat ?? '#111', rim: p?.accent ?? '#e8b04a', hair: p?.hairColor ?? '#111', hairStyle: p?.hair ?? 'short' };
  });
  const key = `${loc.id}-${tod}-${weather}-${npcIds.map((n) => n.id).join(',')}`;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const layers = useMemo(() => sceneLayers(loc.art, { tod, weather, npcs }), [key]);

  useEffect(() => {
    if (reduceMotion) return;
    const on = (e: MouseEvent) => setM({ x: e.clientX / window.innerWidth - 0.5, y: e.clientY / window.innerHeight - 0.5 });
    window.addEventListener('mousemove', on);
    return () => window.removeEventListener('mousemove', on);
  }, [reduceMotion]);

  const exterior = ['street', 'spree', 'hauptbahnhof'].includes(loc.art);
  const rain = weather === 'rain';

  return (
    <div className="scene" key={loc.id}>
      <div className={reduceMotion ? '' : 'scene-enter'} style={{ position: 'absolute', inset: 0 }}>
        {layers.map((l, i) => (
          <div key={i} className="scene-layer" style={{ transform: `translate3d(${-m.x * l.depth * 34}px, ${-m.y * l.depth * 16}px, 0)` }}>
            {l.node}
          </div>
        ))}
      </div>
      {((rain && exterior) || weather === 'fog') && <div className="fog" />}
      {rain && exterior && <Rain intensity={1} />}
      {tod === 'night' && <div className="scene-fx" style={{ background: 'radial-gradient(ellipse at 50% 120%, rgba(40,60,110,0.25), transparent 60%)' }} />}
      {tod === 'dawn' && <div className="scene-fx" style={{ background: 'linear-gradient(180deg, rgba(255,170,110,0.08), transparent 50%)' }} />}
    </div>
  );
}

function Rain({ intensity }: { intensity: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    let raf = 0;
    const resize = () => {
      c.width = window.innerWidth;
      c.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    const n = Math.floor(260 * intensity);
    const drops = Array.from({ length: n }, () => ({ x: Math.random() * c.width, y: Math.random() * c.height, l: 10 + Math.random() * 22, v: 12 + Math.random() * 14, a: 0.12 + Math.random() * 0.3 }));
    const splashes: { x: number; y: number; t: number }[] = [];
    const tick = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.lineCap = 'round';
      for (const d of drops) {
        ctx.strokeStyle = `rgba(190,210,235,${d.a})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - d.l * 0.18, d.y + d.l);
        ctx.stroke();
        d.y += d.v;
        d.x -= d.v * 0.18;
        if (d.y > c.height) {
          if (Math.random() < 0.3) splashes.push({ x: d.x, y: c.height - Math.random() * 120, t: 0 });
          d.y = -20;
          d.x = Math.random() * (c.width + 100);
        }
      }
      for (let i = splashes.length - 1; i >= 0; i--) {
        const s = splashes[i];
        s.t += 1;
        ctx.strokeStyle = `rgba(190,210,235,${0.25 - s.t * 0.025})`;
        ctx.beginPath();
        ctx.ellipse(s.x, s.y, s.t * 1.6, s.t * 0.5, 0, 0, Math.PI * 2);
        ctx.stroke();
        if (s.t > 10) splashes.splice(i, 1);
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [intensity]);
  return <canvas ref={ref} className="rain-canvas" />;
}
