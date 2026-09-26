import type { ReactNode } from 'react';

/** Shared drawing kit for scene art. All art is original, generated in code. */

export type TOD = 'dawn' | 'day' | 'evening' | 'night';

export function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export const SKY: Record<TOD, [string, string, string]> = {
  dawn: ['#141b2b', '#4b5068', '#c98e6a'],
  day: ['#56667a', '#8e9aa8', '#c3c8cc'],
  evening: ['#161a33', '#6a3f55', '#e0875a'],
  night: ['#03050b', '#0a1224', '#1b2742'],
};

export const WINDOW_LIT: Record<TOD, number> = { dawn: 0.35, day: 0.08, evening: 0.55, night: 0.62 };

export function Defs({ id, tod }: { id: string; tod: TOD }) {
  const [a, b, c] = SKY[tod];
  return (
    <defs>
      <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={a} />
        <stop offset="0.6" stopColor={b} />
        <stop offset="1" stopColor={c} />
      </linearGradient>
      <filter id={`${id}-glow`} x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="10" />
      </filter>
      <filter id={`${id}-soft`} x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3" />
      </filter>
      <filter id={`${id}-bokeh`} x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="22" />
      </filter>
      <radialGradient id={`${id}-warm`}>
        <stop offset="0" stopColor="#ffcf8a" stopOpacity="0.9" />
        <stop offset="1" stopColor="#ff9a3c" stopOpacity="0" />
      </radialGradient>
      <radialGradient id={`${id}-cold`}>
        <stop offset="0" stopColor="#cfe3ff" stopOpacity="0.8" />
        <stop offset="1" stopColor="#6fa8ff" stopOpacity="0" />
      </radialGradient>
      <linearGradient id={`${id}-floor`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#15181d" />
        <stop offset="1" stopColor="#050608" />
      </linearGradient>
      <linearGradient id={`${id}-fade`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#000" stopOpacity="0" />
        <stop offset="1" stopColor="#000" stopOpacity="0.85" />
      </linearGradient>
    </defs>
  );
}

export function Svg({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      {children}
    </svg>
  );
}

/** Procedural skyline with lit windows and the Fernsehturm. */
export function Skyline({ seed, y, h, color, tod, tower, lit = 1, scale = 1 }: { seed: number; y: number; h: number; color: string; tod: TOD; tower?: number; lit?: number; scale?: number }) {
  const r = rng(seed);
  const blds: ReactNode[] = [];
  let x = -40;
  let i = 0;
  while (x < 1640) {
    const w = (50 + r() * 110) * scale;
    const bh = h * (0.35 + r() * 0.65);
    const top = y - bh;
    blds.push(<rect key={`b${i}`} x={x} y={top} width={w + 1} height={bh + 400} fill={color} />);
    if (r() > 0.6) blds.push(<rect key={`r${i}`} x={x + w * 0.3} y={top - 12 * scale} width={w * 0.2} height={12 * scale} fill={color} />);
    const cols = Math.floor(w / (14 * scale));
    const rows = Math.floor(bh / (18 * scale));
    for (let cx = 0; cx < cols; cx++)
      for (let ry = 0; ry < rows; ry++) {
        if (r() < WINDOW_LIT[tod] * lit * 0.5)
          blds.push(<rect key={`w${i}-${cx}-${ry}`} x={x + 5 * scale + cx * 14 * scale} y={top + 8 * scale + ry * 18 * scale} width={6 * scale} height={8 * scale} fill={r() > 0.8 ? '#bcd3ff' : '#ffc873'} opacity={0.5 + r() * 0.5} />);
      }
    x += w;
    i++;
  }
  return (
    <g>
      {blds}
      {tower !== undefined && <Fernsehturm x={tower} base={y} h={h * 2.4} color={color} night={tod === 'night' || tod === 'evening' || tod === 'dawn'} />}
    </g>
  );
}

export function Fernsehturm({ x, base, h, color, night }: { x: number; base: number; h: number; color: string; night: boolean }) {
  const sphereY = base - h * 0.62;
  const r = h * 0.07;
  return (
    <g>
      <path d={`M${x - h * 0.03} ${base} L${x - h * 0.012} ${sphereY} L${x + h * 0.012} ${sphereY} L${x + h * 0.03} ${base} Z`} fill={color} />
      <circle cx={x} cy={sphereY} r={r} fill={color} />
      <rect x={x - h * 0.008} y={base - h} width={h * 0.016} height={h * 0.38 - r} fill={color} />
      <rect x={x - h * 0.004} y={base - h * 1.08} width={h * 0.008} height={h * 0.1} fill={color} />
      {night && (
        <>
          <circle cx={x} cy={base - h * 1.08} r={3} fill="#ff3b30">
            <animate attributeName="opacity" values="1;0.1;1" dur="2.4s" repeatCount="indefinite" />
          </circle>
          <rect x={x - r * 0.9} y={sphereY - 2} width={r * 1.8} height={3} fill="#ffd9a0" opacity="0.7" />
        </>
      )}
    </g>
  );
}

/** Standing figure silhouette with rim light. */
export function Figure({ x, y, s = 1, coat = '#15181f', rim = '#e8b04a', hair = '#111', hairStyle = 'short', facing = 1, idle = true }: { x: number; y: number; s?: number; coat?: string; rim?: string; hair?: string; hairStyle?: string; facing?: number; idle?: boolean }) {
  const body = 'M-26 -150 C-30 -120 -34 -80 -32 -40 L-28 30 L-22 170 L-6 170 L-2 50 L2 50 L6 170 L22 170 L28 30 L32 -40 C34 -80 30 -120 26 -150 C18 -162 -18 -162 -26 -150 Z';
  return (
    <g transform={`translate(${x} ${y}) scale(${s * facing} ${s})`}>
      <ellipse cx="0" cy="172" rx="46" ry="8" fill="#000" opacity="0.5" />
      <g>
        {idle && <animateTransform attributeName="transform" type="translate" values="0 0;0 -1.5;0 0" dur="4s" repeatCount="indefinite" />}
        <path d={body} fill={coat} />
        <path d={body} fill="none" stroke={rim} strokeWidth="2.5" opacity="0.55" strokeDasharray="0 40 400" />
        <rect x="-7" y="-172" width="14" height="16" fill={coat} />
        <ellipse cx="0" cy="-190" rx="17" ry="21" fill="#0d0f13" />
        <path d="M14 -205 C19 -190 18 -178 12 -170" stroke={rim} strokeWidth="2.5" fill="none" opacity="0.8" />
        {hairStyle === 'long' && <path d="M-18 -196 C-20 -222 20 -222 18 -196 L20 -150 L-20 -150 Z" fill={hair} />}
        {hairStyle === 'bun' && <circle cx="-4" cy="-214" r="10" fill={hair} />}
        {hairStyle === 'cap' && <path d="M-19 -198 C-18 -218 18 -218 19 -198 L30 -196 L-19 -196 Z" fill="#b3141c" />}
        {(hairStyle === 'short' || hairStyle === 'curly' || hairStyle === 'bob') && <path d="M-18 -194 C-19 -216 19 -216 18 -194 C10 -204 -10 -204 -18 -194 Z" fill={hair} />}
      </g>
    </g>
  );
}

export function Crowd({ seed, y, count, s = 0.5, spread = [0, 1600], tint = '#0b0d11' }: { seed: number; y: number; count: number; s?: number; spread?: [number, number]; tint?: string }) {
  const r = rng(seed);
  const out: ReactNode[] = [];
  for (let i = 0; i < count; i++) {
    const x = spread[0] + r() * (spread[1] - spread[0]);
    const sc = s * (0.8 + r() * 0.4);
    out.push(<Figure key={i} x={x} y={y + r() * 20} s={sc} coat={tint} rim="#9fb8d6" idle={false} facing={r() > 0.5 ? 1 : -1} hairStyle={['short', 'long', 'bun', 'curly'][Math.floor(r() * 4)]} />);
  }
  return <g opacity="0.9">{out}</g>;
}

export function Glow({ x, y, r, color = 'warm', id, opacity = 1 }: { x: number; y: number; r: number; color?: 'warm' | 'cold'; id: string; opacity?: number }) {
  return <circle cx={x} cy={y} r={r} fill={`url(#${id}-${color})`} opacity={opacity} />;
}

export function Lamp({ x, y, h, id, on }: { x: number; y: number; h: number; id: string; on: boolean }) {
  return (
    <g>
      <rect x={x - 3} y={y - h} width={6} height={h} fill="#0a0b0e" />
      <path d={`M${x} ${y - h} q 30 -10 40 6`} stroke="#0a0b0e" strokeWidth="6" fill="none" />
      <rect x={x + 30} y={y - h + 4} width={22} height={8} fill="#0a0b0e" />
      {on && (
        <>
          <Glow x={x + 41} y={y - h + 14} r={90} id={id} />
          <path d={`M${x + 32} ${y - h + 12} L${x + 50} ${y - h + 12} L${x + 120} ${y} L${x - 40} ${y} Z`} fill="#ffcf8a" opacity="0.06" />
        </>
      )}
    </g>
  );
}
