import type { ReactNode } from 'react';
import type { SceneArt, Weather } from '../../engine/types';
import { Crowd, Defs, Fernsehturm, Figure, Glow, Lamp, Skyline, Svg, rng, type TOD } from './kit';

export interface Layer {
  depth: number; // 0 = far (little parallax) … 1 = near
  node: ReactNode;
}

export interface SceneProps {
  tod: TOD;
  weather: Weather;
  npcs: { id: string; x: number; y: number; coat: string; rim: string; hair: string; hairStyle: string }[];
}

const L = (depth: number, id: string, tod: TOD, children: ReactNode): Layer => ({
  depth,
  node: (
    <Svg>
      <Defs id={id} tod={tod} />
      {children}
    </Svg>
  ),
});

function npcFigures(p: SceneProps, scale: number, yFloor?: number) {
  return p.npcs.map((n) => (
    <Figure key={n.id} x={(n.x / 100) * 1600} y={yFloor ?? (n.y / 100) * 900 + 20} s={scale} coat={n.coat} rim={n.rim} hair={n.hair} hairStyle={n.hairStyle} />
  ));
}

// ============================================================ HAUPTBAHNHOF
function hauptbahnhof(p: SceneProps): Layer[] {
  const { tod } = p;
  const id = 'hbf';
  const vp = { x: 800, y: 330 };
  const arches: ReactNode[] = [];
  for (let i = 0; i < 11; i++) {
    const k = Math.pow(0.74, i);
    const w = 1900 * k;
    const h = 520 * k;
    const baseY = vp.y + 340 * k;
    arches.push(<path key={i} d={`M${vp.x - w / 2} ${baseY} C${vp.x - w / 2} ${baseY - h * 1.25} ${vp.x + w / 2} ${baseY - h * 1.25} ${vp.x + w / 2} ${baseY}`} fill="none" stroke="#1b232e" strokeWidth={10 * k + 1} />);
  }
  const ribs: ReactNode[] = [];
  for (let i = 0; i <= 16; i++) {
    const t = i / 16;
    const ang = Math.PI * t;
    const ox = vp.x - Math.cos(ang) * 950;
    const oy = vp.y + 340 - Math.sin(ang) * 650;
    ribs.push(<line key={i} x1={ox} y1={oy} x2={vp.x} y2={vp.y} stroke="#1b232e" strokeWidth="3" />);
  }
  const light = tod === 'night' ? '#1a2a44' : tod === 'dawn' ? '#d99a73' : tod === 'evening' ? '#c9754f' : '#b8c4cf';
  return [
    L(0, id, tod, (
      <>
        <rect width="1600" height="900" fill={`url(#${id}-sky)`} />
        <ellipse cx={vp.x} cy={vp.y - 80} rx="900" ry="360" fill={light} opacity="0.35" />
        <g opacity="0.9">{ribs}</g>
        {arches}
        {/* far end: bright opening */}
        <ellipse cx={vp.x} cy={vp.y + 10} rx="120" ry="70" fill={light} opacity="0.7" filter={`url(#${id}-glow)`} />
      </>
    )),
    L(0.3, id, tod, (
      <>
        {/* upper gallery levels */}
        <path d={`M0 470 L${vp.x - 90} ${vp.y + 60} L${vp.x + 90} ${vp.y + 60} L1600 470 L1600 520 L0 520 Z`} fill="#0e1218" />
        {Array.from({ length: 14 }).map((_, i) => (
          <rect key={i} x={i * 120 - 20} y="478" width="60" height="8" fill="#ffd79a" opacity={0.35} />
        ))}
        {/* hanging clock */}
        <line x1="800" y1="120" x2="800" y2="200" stroke="#111" strokeWidth="3" />
        <circle cx="800" cy="222" r="26" fill="#f1ede4" stroke="#111" strokeWidth="5" />
        <line x1="800" y1="222" x2="800" y2="204" stroke="#111" strokeWidth="3" />
        <line x1="800" y1="222" x2="812" y2="230" stroke="#111" strokeWidth="2.5" />
        {/* departure board */}
        <g>
          <rect x="330" y="200" width="330" height="150" fill="#050505" stroke="#2a2a2a" strokeWidth="4" />
          {Array.from({ length: 6 }).map((_, i) => (
            <g key={i} opacity={i === 2 ? 1 : 0.75}>
              <rect x="345" y={216 + i * 21} width="46" height="9" fill={i === 2 ? '#fff0b8' : '#ffc45c'} />
              <rect x="400" y={216 + i * 21} width="26" height="9" fill="#ffc45c" />
              <rect x="436" y={216 + i * 21} width={110 + ((i * 37) % 60)} height="9" fill="#ffc45c" />
              <rect x="610" y={216 + i * 21} width="34" height="9" fill={i === 2 ? '#ff6a4a' : '#ffc45c'} />
            </g>
          ))}
          <rect x="330" y="200" width="330" height="150" fill="#ffb347" opacity="0.06" filter={`url(#${id}-glow)`} />
        </g>
        {/* platform floor */}
        <path d={`M0 620 L${vp.x - 60} ${vp.y + 90} L${vp.x + 60} ${vp.y + 90} L1600 620 L1600 900 L0 900 Z`} fill={`url(#${id}-floor)`} />
        {Array.from({ length: 9 }).map((_, i) => (
          <line key={i} x1={i * 200} y1="900" x2={vp.x + (i - 4) * 12} y2={vp.y + 90} stroke="#222a33" strokeWidth="2" />
        ))}
        <Crowd seed={7} y={520} count={18} s={0.32} spread={[200, 1400]} tint="#0a0c10" />
      </>
    )),
    L(0.65, id, tod, (
      <>
        {/* S-Bahn train, right */}
        <path d="M1270 470 L1600 430 L1600 690 L1270 610 Z" fill="#8f1a1f" />
        <path d="M1270 520 L1600 490 L1600 540 L1270 560 Z" fill="#e6b52e" />
        {Array.from({ length: 4 }).map((_, i) => (
          <path key={i} d={`M${1290 + i * 78} ${478 - i * 9} l52 -6 l0 38 l-52 5 Z`} fill="#26313d" opacity="0.9" />
        ))}
        {/* DB info booth */}
        <g>
          <rect x="1080" y="470" width="200" height="190" fill="#8f141b" />
          <rect x="1080" y="470" width="200" height="34" fill="#b3141c" />
          <rect x="1096" y="518" width="168" height="80" fill="#f6d7a8" opacity="0.85" />
          <Glow x={1180} y={560} r={150} id={id} />
          <circle cx="1255" cy="487" r="12" fill="#fff" />
          <text x="1250" y="493" fontFamily="Inter" fontWeight="800" fontSize="16" fill="#b3141c">i</text>
          <text x="1096" y="494" fontFamily="Inter" fontWeight="700" fontSize="15" fill="#fff" letterSpacing="2">DB INFORMATION</text>
        </g>
        {/* escalator */}
        <g>
          <path d="M700 900 L760 600 L840 600 L900 900 Z" fill="#101419" />
          {Array.from({ length: 12 }).map((_, i) => (
            <line key={i} x1={700 + i * 5} y1={900 - i * 25} x2={900 - i * 5} y2={900 - i * 25} stroke="#1d242c" strokeWidth="3" />
          ))}
          <path d="M690 900 L752 598" stroke="#3a4552" strokeWidth="8" />
          <path d="M910 900 L848 598" stroke="#3a4552" strokeWidth="8" />
          <rect x="735" y="540" width="130" height="38" fill="#1d5fae" />
          <text x="748" y="566" fontFamily="Inter" fontWeight="700" fontSize="19" fill="#fff">Gleis 15/16 ↑</text>
        </g>
        {npcFigures(p, 0.42, 690)}
      </>
    )),
    L(1, id, tod, (
      <>
        {tod !== 'night' && (
          <g opacity="0.22">
            <path d="M420 0 L560 0 L980 900 L720 900 Z" fill="#ffe2b0" filter={`url(#${id}-glow)`} />
            <path d="M980 0 L1060 0 L1330 900 L1180 900 Z" fill="#ffe2b0" filter={`url(#${id}-glow)`} />
          </g>
        )}
        <Figure x={180} y={770} s={1.25} coat="#07080a" rim="#8aa4c4" facing={-1} idle />
        <rect width="1600" height="900" fill={`url(#${id}-fade)`} opacity="0.5" />
      </>
    )),
  ];
}

// ============================================================ STREET (Kreuzberg)
function facade(x: number, w: number, color: string, tod: TOD, seed: number, id: string): ReactNode {
  const r = rng(seed);
  const floors = 5;
  const top = 150 + r() * 40;
  const fh = (620 - top) / floors;
  const wins: ReactNode[] = [];
  const cols = Math.max(3, Math.floor(w / 80));
  for (let f = 0; f < floors - 0; f++) {
    for (let c = 0; c < cols; c++) {
      const wx = x + 24 + c * ((w - 48) / cols);
      const wy = top + 20 + f * fh;
      const lit = r() < (tod === 'day' ? 0.05 : tod === 'dawn' ? 0.3 : 0.55);
      wins.push(
        <g key={`${f}-${c}`}>
          <rect x={wx} y={wy} width={34} height={fh * 0.6} fill={lit ? (r() > 0.7 ? '#ffe3a8' : '#ffb95c') : '#1a2029'} opacity={lit ? 0.85 : 1} />
          <rect x={wx - 4} y={wy - 8} width={42} height={6} fill="#000" opacity="0.25" />
          <line x1={wx + 17} y1={wy} x2={wx + 17} y2={wy + fh * 0.6} stroke="#000" strokeOpacity="0.4" strokeWidth="2" />
        </g>,
      );
    }
    if (f > 0 && r() > 0.55) wins.push(<rect key={`bal${f}`} x={x + w * 0.35} y={top + f * fh + fh * 0.62} width={w * 0.3} height={10} fill="#0b0d10" />);
  }
  return (
    <g key={seed}>
      <rect x={x} y={top} width={w} height={900 - top} fill={color} />
      <rect x={x} y={top} width={w} height={14} fill="#000" opacity="0.25" />
      {Array.from({ length: floors }).map((_, i) => <rect key={`c${i}`} x={x} y={top + i * fh - 3} width={w} height={4} fill="#000" opacity="0.18" />)}
      {wins}
      <rect x={x} y={top} width={w} height={900 - top} fill={`url(#${id}-fade)`} opacity="0.35" />
    </g>
  );
}

function street(p: SceneProps): Layer[] {
  const { tod } = p;
  const id = 'st';
  const night = tod === 'night' || tod === 'evening';
  const dim = tod === 'day' ? 1 : tod === 'dawn' ? 0.8 : 0.55;
  const tone = (c: string) => c;
  return [
    L(0, id, tod, (
      <>
        <rect width="1600" height="900" fill={`url(#${id}-sky)`} />
        <Skyline seed={3} y={430} h={140} color="#1c2331" tod={tod} tower={1260} lit={0.6} scale={0.8} />
      </>
    )),
    L(0.35, id, tod, (
      <g opacity={dim + 0.3}>
        {facade(-20, 360, tone('#6b6150'), tod, 11, id)}
        {facade(340, 330, tone('#556158'), tod, 12, id)}
        {facade(670, 320, tone('#7a6560'), tod, 13, id)}
        {facade(990, 330, tone('#5d6470'), tod, 14, id)}
        {facade(1320, 320, tone('#6e6a58'), tod, 15, id)}
        <rect x="-20" y="0" width="1660" height="900" fill="#0a0d14" opacity={1 - dim} />
      </g>
    )),
    L(0.6, id, tod, (
      <>
        {/* ground floor shops */}
        <rect x="0" y="600" width="1600" height="300" fill="#0d1015" />
        {/* café */}
        <rect x="150" y="610" width="270" height="150" fill="#ffcf8a" opacity={night ? 0.85 : 0.45} />
        <rect x="150" y="610" width="270" height="150" fill="none" stroke="#1a1410" strokeWidth="10" />
        <line x1="285" y1="610" x2="285" y2="760" stroke="#1a1410" strokeWidth="6" />
        <path d="M130 600 L440 600 L420 640 L150 640 Z" fill="#2f4f3a" />
        <text x="190" y="628" fontFamily="Bebas Neue" fontSize="26" fill="#f3e6c8" letterSpacing="4">CAFÉ KIEZBOHNE</text>
        <Glow x={285} y={690} r={200} id={id} opacity={night ? 1 : 0.5} />
        {/* door no. 12 */}
        <path d="M790 780 L790 640 Q832 598 874 640 L874 780 Z" fill="#2a1f18" />
        <path d="M800 780 L800 645 Q832 612 864 645 L864 780 Z" fill="#3b2c21" />
        <rect x="818" y="604" width="28" height="18" fill="#dcd2bd" />
        <text x="824" y="618" fontFamily="Inter" fontWeight="700" fontSize="13" fill="#222">12</text>
        {/* Späti */}
        <rect x="1180" y="620" width="230" height="140" fill="#9cf2c6" opacity={night ? 0.55 : 0.3} />
        <rect x="1190" y="585" width="210" height="34" fill="#0b0d10" stroke="#2df58f" strokeWidth="2" />
        <text x="1240" y="611" fontFamily="Bebas Neue" fontSize="28" fill="#5dffb0" letterSpacing="6" style={{ filter: 'drop-shadow(0 0 6px #2df58f)' }}>SPÄTI 24/7</text>
        <Glow x={1295} y={690} r={170} color="cold" id={id} opacity={night ? 0.8 : 0.4} />
        {/* U-Bahn sign */}
        <rect x="1470" y="430" width="46" height="46" fill="#1d5fae" />
        <text x="1481" y="468" fontFamily="Inter" fontWeight="800" fontSize="36" fill="#fff">U</text>
        {p.npcs.map((n) => <Figure key={n.id} x={930} y={700} s={0.5} coat={n.coat} rim={n.rim} hair={n.hair} hairStyle={n.hairStyle} facing={-1} />)}
      </>
    )),
    L(1, id, tod, (
      <>
        {/* street & cobbles */}
        <path d="M0 780 L1600 780 L1600 900 L0 900 Z" fill="#0a0b0d" />
        {Array.from({ length: 40 }).map((_, i) => (
          <rect key={i} x={(i * 41) % 1600} y={800 + (i % 4) * 24} width={36} height={10} fill="#16191e" rx="3" />
        ))}
        {night && <rect x="120" y="790" width="340" height="110" fill="#ffb95c" opacity="0.07" filter={`url(#${id}-glow)`} />}
        {/* trees */}
        {[60, 560, 1060, 1520].map((x, i) => (
          <g key={i}>
            <rect x={x - 8} y="520" width="16" height="280" fill="#0a0907" />
            <circle cx={x} cy="430" r="140" fill="#0b120c" opacity="0.95" />
            <circle cx={x - 90} cy="480" r="90" fill="#0d160f" opacity="0.95" />
            <circle cx={x + 90} cy="470" r="100" fill="#0a110b" opacity="0.95" />
          </g>
        ))}
        <Lamp x={960} y={800} h={330} id={id} on={tod !== 'day'} />
        {/* bikes */}
        {[420, 470, 1450].map((x, i) => (
          <g key={i} stroke="#050506" strokeWidth="5" fill="none" opacity="0.95">
            <circle cx={x} cy="810" r="26" />
            <circle cx={x + 70} cy="810" r="26" />
            <path d={`M${x} 810 L${x + 30} 770 L${x + 70} 810 M${x + 30} 770 L${x + 60} 770`} />
          </g>
        ))}
      </>
    )),
  ];
}

// ============================================================ APARTMENT
function apartment(p: SceneProps): Layer[] {
  const { tod } = p;
  const id = 'ap';
  const night = tod === 'night' || tod === 'evening';
  return [
    L(0, id, tod, (
      <>
        <rect width="1600" height="900" fill={`url(#${id}-sky)`} />
        <Skyline seed={21} y={520} h={200} color="#121826" tod={tod} tower={980} lit={1.2} />
      </>
    )),
    L(0.4, id, tod, (
      <>
        {/* wall with window opening */}
        <path d="M0 0 H1600 V900 H0 Z M660 120 V560 H1100 V120 Z" fill={night ? '#1d1a18' : '#4a443c'} fillRule="evenodd" />
        <rect x="650" y="110" width="460" height="460" fill="none" stroke="#e8e0cf" strokeWidth="16" opacity={night ? 0.5 : 0.8} />
        <line x1="880" y1="120" x2="880" y2="560" stroke="#e8e0cf" strokeWidth="10" opacity={night ? 0.5 : 0.8} />
        <line x1="660" y1="330" x2="1100" y2="330" stroke="#e8e0cf" strokeWidth="10" opacity={night ? 0.5 : 0.8} />
        <path d="M600 90 C640 300 610 480 640 620 L560 620 C540 400 580 240 560 90 Z" fill="#6b2a2a" opacity="0.9" />
        <path d="M1160 90 C1120 300 1150 480 1120 620 L1200 620 C1220 400 1180 240 1200 90 Z" fill="#6b2a2a" opacity="0.9" />
        {/* tile stove */}
        <rect x="1290" y="300" width="160" height="420" fill="#2c3b3c" />
        {Array.from({ length: 7 }).map((_, i) => <line key={i} x1="1290" y1={300 + i * 60} x2="1450" y2={300 + i * 60} stroke="#1a2324" strokeWidth="3" />)}
        <rect x="1280" y="290" width="180" height="16" fill="#1a2324" />
        {/* floor */}
        <path d="M0 720 H1600 V900 H0 Z" fill="#2a1d14" />
        {Array.from({ length: 14 }).map((_, i) => <line key={i} x1={i * 130 - 200} y1="900" x2={i * 115 - 20} y2="720" stroke="#1a120c" strokeWidth="3" />)}
        <rect x="0" y="712" width="1600" height="10" fill="#140e0a" />
      </>
    )),
    L(0.75, id, tod, (
      <>
        {/* desk + lamp */}
        <rect x="140" y="560" width="400" height="18" fill="#3a2a1e" />
        <rect x="160" y="578" width="14" height="170" fill="#2a1d14" />
        <rect x="506" y="578" width="14" height="170" fill="#2a1d14" />
        <rect x="300" y="500" width="150" height="60" fill="#111" />
        <rect x="306" y="505" width="138" height="48" fill={night ? '#6f9dd8' : '#27364a'} opacity="0.8" />
        <path d="M200 560 L220 470 L250 450" stroke="#111" strokeWidth="6" fill="none" />
        <path d="M232 440 L280 440 L262 470 L246 470 Z" fill="#111" />
        {night && <><Glow x={256} y={500} r={220} id={id} /><path d="M246 470 L262 470 L330 560 L180 560 Z" fill="#ffcf8a" opacity="0.18" /></>}
        <rect x="460" y="520" width="18" height="40" fill="#7a3a2a" />
        <rect x="480" y="528" width="14" height="32" fill="#2f4f6a" />
        {/* bed */}
        <rect x="1120" y="620" width="400" height="120" fill="#23262e" />
        <path d="M1120 620 C1220 590 1420 600 1520 620 L1520 660 L1120 660 Z" fill="#c9c2b3" opacity="0.8" />
        <rect x="1130" y="600" width="110" height="40" rx="12" fill="#e2dccd" opacity="0.8" />
        {/* door */}
        <rect x="20" y="230" width="150" height="490" fill="#3a2c20" />
        <circle cx="150" cy="480" r="7" fill="#b89a5a" />
        {/* plant */}
        <rect x="1000" y="640" width="60" height="80" fill="#6a3a24" />
        <path d="M1030 640 C980 560 990 520 1030 480 C1060 520 1080 560 1030 640 Z" fill="#1f3a22" />
        <path d="M1030 640 C1080 580 1110 570 1130 560 C1100 610 1070 630 1030 640 Z" fill="#244428" />
      </>
    )),
  ];
}

// ============================================================ CAFE
function cafe(p: SceneProps): Layer[] {
  const { tod } = p;
  const id = 'cf';
  return [
    L(0, id, tod, (
      <>
        <rect width="1600" height="900" fill="#2b1c14" />
        {/* shelves */}
        {[220, 320, 420].map((y, i) => (
          <g key={i}>
            <rect x="760" y={y} width="760" height="10" fill="#1a110b" />
            {Array.from({ length: 16 }).map((_, j) => (
              <rect key={j} x={780 + j * 46} y={y - 40 - ((j * 7 + i * 3) % 22)} width={22} height={40 + ((j * 7 + i * 3) % 22)} fill={['#5b3a26', '#2f4f3a', '#8a6a3a', '#3a3a5a', '#6a2a2a'][(j + i) % 5]} opacity="0.85" />
            ))}
          </g>
        ))}
        {/* chalkboard */}
        <rect x="360" y="170" width="300" height="220" fill="#1a1f1b" stroke="#5b3a26" strokeWidth="12" />
        <text x="390" y="215" fontFamily="Bebas Neue" fontSize="30" fill="#e8e2d0" letterSpacing="3">KAFFEE</text>
        {['Espresso 2,20', 'Cappuccino 3,60', 'Milchkaffee 3,90', 'Franzbrötchen 2,80', 'Simit 2,50'].map((t, i) => (
          <text key={i} x="390" y={250 + i * 27} fontFamily="Inter" fontSize="17" fill="#d9d2bf">{t}</text>
        ))}
        {/* window left */}
        <rect x="0" y="120" width="300" height="520" fill={`url(#${id}-sky)`} />
        <rect x="0" y="120" width="300" height="520" fill="#9fb8d6" opacity="0.15" />
        <line x1="150" y1="120" x2="150" y2="640" stroke="#1a110b" strokeWidth="12" />
        <rect x="0" y="110" width="310" height="540" fill="none" stroke="#1a110b" strokeWidth="18" />
      </>
    )),
    L(0.5, id, tod, (
      <>
        {/* pendant lamps */}
        {[500, 820, 1140, 1400].map((x, i) => (
          <g key={i}>
            <line x1={x} y1="0" x2={x} y2="120" stroke="#111" strokeWidth="2" />
            <path d={`M${x - 26} 150 L${x + 26} 150 L${x + 14} 120 L${x - 14} 120 Z`} fill="#141414" />
            <circle cx={x} cy="154" r="9" fill="#fff2cf" />
            <Glow x={x} y={170} r={170} id={id} />
          </g>
        ))}
        {/* counter */}
        <rect x="780" y="520" width="820" height="260" fill="#3a2418" />
        <rect x="770" y="505" width="840" height="22" fill="#1e140e" />
        {npcFigures(p, 0.9, 640)}
        <rect x="780" y="520" width="820" height="260" fill="#3a2418" opacity="0" />
        {/* espresso machine */}
        <g>
          <rect x="1180" y="395" width="230" height="115" fill="#9aa3ad" />
          <rect x="1180" y="395" width="230" height="16" fill="#c8d0d8" />
          <rect x="1210" y="460" width="30" height="40" fill="#222" />
          <rect x="1300" y="460" width="30" height="40" fill="#222" />
          <circle cx="1380" cy="440" r="14" fill="#1a1a1a" stroke="#c8d0d8" strokeWidth="3" />
          <path d="M1225 505 q-10 -30 5 -50 q15 -25 0 -45" stroke="#fff" strokeOpacity="0.25" strokeWidth="6" fill="none">
            <animate attributeName="stroke-opacity" values="0.05;0.3;0.05" dur="3s" repeatCount="indefinite" />
          </path>
        </g>
        {/* counter front on top of figure */}
        <rect x="780" y="560" width="820" height="220" fill="#3f281b" />
        {Array.from({ length: 10 }).map((_, i) => <line key={i} x1={800 + i * 82} y1="560" x2={800 + i * 82} y2="780" stroke="#2a1a11" strokeWidth="4" />)}
      </>
    )),
    L(0.9, id, tod, (
      <>
        <path d="M0 760 H1600 V900 H0 Z" fill="#1a110b" />
        {/* table + chairs left */}
        <ellipse cx="210" cy="690" rx="140" ry="22" fill="#4a2f1f" />
        <rect x="200" y="690" width="16" height="120" fill="#1a110b" />
        <rect x="180" y="650" width="34" height="40" fill="#e8e0cf" />
        <path d="M214 660 q16 0 16 14 q0 12 -16 12" stroke="#e8e0cf" strokeWidth="5" fill="none" />
        <path d="M40 620 L90 620 L90 820 M40 700 L110 700" stroke="#0e0906" strokeWidth="10" fill="none" />
        <path d="M400 620 L360 620 L360 820 M400 700 L330 700" stroke="#0e0906" strokeWidth="10" fill="none" />
        <Figure x={520} y={690} s={1.05} coat="#1e2b22" rim="#ffb35c" hairStyle="long" hair="#3a2618" facing={-1} idle />
      </>
    )),
  ];
}

// ============================================================ OFFICE
function office(p: SceneProps): Layer[] {
  const { tod } = p;
  const id = 'of';
  const night = tod === 'night' || tod === 'evening';
  return [
    L(0, id, tod, (
      <>
        <rect width="1600" height="900" fill={`url(#${id}-sky)`} />
        {/* opposite facade (Friedrichstraße) */}
        <rect x="0" y="60" width="1600" height="600" fill="#2a3038" />
        {Array.from({ length: 22 }).map((_, c) =>
          Array.from({ length: 8 }).map((__, r) => (
            <rect key={`${c}-${r}`} x={24 + c * 72} y={90 + r * 70} width={40} height={34} fill={(c * 7 + r * 3) % 11 === 0 || (night && (c + r) % 4 === 0) ? '#ffd79a' : '#333c48'} opacity={0.55} />
          )),
        )}
        <rect x="0" y="0" width="1600" height="900" fill="#0b0f15" opacity="0.45" />
        <path d="M200 0 L420 0 L120 700 L-100 700 Z" fill="#fff" opacity="0.035" />
        <path d="M900 0 L980 0 L700 700 L620 700 Z" fill="#fff" opacity="0.03" />
      </>
    )),
    L(0.35, id, tod, (
      <>
        {/* window mullions + ceiling */}
        {Array.from({ length: 9 }).map((_, i) => <rect key={i} x={i * 200 - 10} y="0" width="18" height="700" fill="#0d1116" />)}
        <rect x="0" y="0" width="1600" height="70" fill="#101419" />
        {[260, 640, 1020, 1400].map((x, i) => <rect key={i} x={x - 90} y="60" width="180" height="8" fill="#e8f1ff" opacity="0.9" />)}
        <rect x="0" y="650" width="1600" height="250" fill="#14181d" />
        {/* meeting room glass box */}
        <rect x="600" y="230" width="460" height="440" fill="#9fb8d6" opacity="0.1" stroke="#b9c9dc" strokeOpacity="0.5" strokeWidth="3" />
        <line x1="600" y1="380" x2="1060" y2="380" stroke="#b9c9dc" strokeOpacity="0.2" strokeWidth="14" />
        <rect x="660" y="560" width="340" height="14" fill="#23262d" />
        <rect x="690" y="574" width="10" height="96" fill="#23262d" />
        <rect x="960" y="574" width="10" height="96" fill="#23262d" />
        {npcFigures(p, 0.75, 630)}
        <text x="620" y="260" fontFamily="Inter" fontSize="13" fill="#cfe0f2" opacity="0.7" letterSpacing="3">BESPRECHUNG 4.02</text>
      </>
    )),
    L(0.75, id, tod, (
      <>
        {/* reception */}
        <rect x="80" y="560" width="380" height="140" fill="#1a1e24" />
        <rect x="70" y="545" width="400" height="18" fill="#2a3038" />
        <text x="130" y="640" fontFamily="Bebas Neue" fontSize="44" fill="#c8323a" letterSpacing="6">K&amp;A</text>
        <text x="220" y="636" fontFamily="Inter" fontSize="12" fill="#cfd6de" letterSpacing="3">KESSLER &amp; AYDIN</text>
        {/* desks right */}
        <rect x="1180" y="600" width="420" height="16" fill="#2a3038" />
        <rect x="1250" y="500" width="150" height="96" fill="#0b0d10" />
        <rect x="1256" y="506" width="138" height="84" fill="#7fa8d8" opacity={night ? 0.85 : 0.55} />
        {Array.from({ length: 6 }).map((_, i) => <rect key={i} x="1266" y={516 + i * 12} width={40 + ((i * 29) % 80)} height="4" fill="#fff" opacity="0.6" />)}
        <Glow x={1325} y={560} r={180} color="cold" id={id} opacity={0.6} />
        <rect x="1440" y="560" width="120" height="40" fill="#e8e2d0" />
        <rect x="1446" y="552" width="110" height="40" fill="#f3eee2" />
        {/* plant */}
        <rect x="520" y="620" width="50" height="80" fill="#222" />
        <path d="M545 620 C500 540 520 500 545 460 C570 500 590 540 545 620 Z" fill="#1d3a22" />
      </>
    )),
  ];
}

// ============================================================ RESTAURANT
function restaurant(p: SceneProps): Layer[] {
  const { tod } = p;
  const id = 'rs';
  return [
    L(0, id, tod, (
      <>
        <rect width="1600" height="900" fill="#140c08" />
        {/* window to Kollwitzplatz */}
        <rect x="380" y="90" width="840" height="400" fill="#0a1020" />
        <Skyline seed={33} y={440} h={120} color="#0e1422" tod="night" lit={1.1} scale={0.7} />
        {[520, 800, 1080].map((x, i) => <Glow key={i} x={x} y={330} r={60} id={id} />)}
        <rect x="370" y="80" width="860" height="420" fill="none" stroke="#2a1a10" strokeWidth="22" />
        <line x1="800" y1="90" x2="800" y2="490" stroke="#2a1a10" strokeWidth="14" />
        {/* wood panels */}
        <rect x="0" y="0" width="370" height="900" fill="#24160e" />
        <rect x="1230" y="0" width="370" height="900" fill="#24160e" />
        <rect x="0" y="500" width="1600" height="400" fill="#1e120b" />
        {Array.from({ length: 8 }).map((_, i) => <rect key={i} x={i * 210} y="520" width="190" height="200" fill="none" stroke="#2c1c12" strokeWidth="6" />)}
      </>
    )),
    L(0.45, id, tod, (
      <g filter={`url(#${id}-bokeh)`} opacity="0.8">
        {Array.from({ length: 18 }).map((_, i) => (
          <circle key={i} cx={(i * 97) % 1600} cy={180 + ((i * 53) % 380)} r={20 + (i % 4) * 12} fill={i % 3 ? '#ffb95c' : '#ffd79a'} opacity="0.45" />
        ))}
      </g>
    )),
    L(0.7, id, tod, (
      <>
        {npcFigures(p, 0.8, 470)}
        <Figure x={560} y={480} s={0.78} coat="#15181f" rim="#c8323a" hair="#20160f" hairStyle="bun" facing={1} />
        {/* table */}
        <path d="M430 640 L1170 640 L1260 760 L340 760 Z" fill="#e9e3d6" />
        <rect x="340" y="760" width="920" height="140" fill="#cfc7b6" />
        {[640, 800, 960].map((x, i) => (
          <g key={i}>
            <path d={`M${x - 14} 600 L${x + 14} 600 L${x + 8} 632 L${x - 8} 632 Z`} fill="#fff" opacity="0.35" />
            <rect x={x - 1.5} y="632" width="3" height="18" fill="#fff" opacity="0.4" />
          </g>
        ))}
        <rect x="793" y="600" width="14" height="44" fill="#f3eee2" />
        <path d="M800 588 q6 -8 0 -16 q-6 8 0 16 Z" fill="#ffcf5a">
          <animate attributeName="opacity" values="1;0.7;1;0.85;1" dur="1.6s" repeatCount="indefinite" />
        </path>
        <Glow x={800} y={600} r={260} id={id} />
      </>
    )),
  ];
}

// ============================================================ NIGHT STREET (rain)
function spree(_p: SceneProps): Layer[] {
  const id = 'sp';
  const vp = { x: 820, y: 470 };
  return [
    L(0, id, 'night', (
      <>
        <rect width="1600" height="900" fill={`url(#${id}-sky)`} />
        <Fernsehturm x={870} base={470} h={330} color="#0b1020" night />
        <rect width="1600" height="900" fill="#1b2742" opacity="0.15" />
      </>
    )),
    L(0.4, id, 'night', (
      <>
        {/* buildings in perspective */}
        <path d={`M0 0 L${vp.x - 120} ${vp.y - 200} L${vp.x - 120} ${vp.y + 40} L0 900 Z`} fill="#121720" />
        <path d={`M1600 0 L${vp.x + 120} ${vp.y - 200} L${vp.x + 120} ${vp.y + 40} L1600 900 Z`} fill="#10141c" />
        {Array.from({ length: 30 }).map((_, i) => {
          const t = (i % 10) / 10;
          const side = i < 15 ? -1 : 1;
          const x = side < 0 ? 40 + t * (vp.x - 200) : 1560 - t * (1560 - vp.x - 200);
          const y = 120 + Math.floor(i / 10) * 140 + t * 120;
          return <rect key={i} x={x} y={y} width={40 * (1 - t * 0.7)} height={50 * (1 - t * 0.7)} fill="#ffb95c" opacity={(i * 13) % 5 === 0 ? 0.8 : 0.12} />;
        })}
        <text x="140" y="360" fontFamily="Bebas Neue" fontSize="54" fill="#ff4d8d" style={{ filter: 'drop-shadow(0 0 10px #ff4d8d)' }} transform="skewY(8)">BAR</text>
      </>
    )),
    L(0.75, id, 'night', (
      <>
        {/* wet road */}
        <path d={`M0 900 L${vp.x - 40} ${vp.y + 40} L${vp.x + 40} ${vp.y + 40} L1600 900 Z`} fill="#07090d" />
        {/* tram tracks */}
        {[-1, 1].map((s) => <line key={s} x1={vp.x + s * 10} y1={vp.y + 40} x2={800 + s * 260} y2="900" stroke="#3a4250" strokeWidth="3" />)}
        {/* reflections */}
        {[300, 520, 1100, 1320].map((x, i) => <rect key={i} x={x - 8} y="640" width="16" height="260" fill={i % 2 ? '#ffb95c' : '#ff4d8d'} opacity="0.18" filter={`url(#${id}-soft)`} />)}
        {/* tram */}
        <g>
          <rect x={vp.x - 60} y={vp.y - 40} width="120" height="90" fill="#e6c02e" />
          <rect x={vp.x - 50} y={vp.y - 30} width="100" height="36" fill="#2b3340" />
          <circle cx={vp.x - 38} cy={vp.y + 34} r="6" fill="#fff" />
          <circle cx={vp.x + 38} cy={vp.y + 34} r="6" fill="#fff" />
          <Glow x={vp.x - 38} y={vp.y + 34} r={60} color="cold" id={id} />
          <Glow x={vp.x + 38} y={vp.y + 34} r={60} color="cold" id={id} />
          <text x={vp.x - 16} y={vp.y - 44} fontFamily="Inter" fontWeight="800" fontSize="16" fill="#ffd400">M1</text>
        </g>
        <Lamp x={340} y={860} h={460} id={id} on />
        <Lamp x={1260} y={860} h={460} id={id} on />
      </>
    )),
    L(1, id, 'night', (
      <>
        <Figure x={1380} y={780} s={1.3} coat="#08090c" rim="#ffb95c" facing={-1} idle />
        <path d="M1330 540 Q1390 470 1450 540 Z" fill="#111" />
        <line x1="1390" y1="540" x2="1390" y2="640" stroke="#111" strokeWidth="4" />
      </>
    )),
  ];
}

// ============================================================ BÜRGERAMT
function buergeramt(p: SceneProps): Layer[] {
  const { tod } = p;
  const id = 'ba';
  return [
    L(0, id, tod, (
      <>
        <rect width="1600" height="900" fill="#c9cbc2" />
        <rect width="1600" height="900" fill="#20252b" opacity="0.55" />
        {Array.from({ length: 5 }).map((_, i) => (
          <g key={i}>
            <rect x={120 + i * 300} y="40" width="220" height="26" fill="#f4fbff" />
            <Glow x={230 + i * 300} y={60} r={140} color="cold" id={id} opacity={0.4} />
          </g>
        ))}
        {/* number display */}
        <rect x="380" y="190" width="300" height="130" fill="#0a0a0a" stroke="#3a3a3a" strokeWidth="6" />
        <text x="400" y="240" fontFamily="JetBrains Mono" fontSize="30" fill="#ff3b2f" style={{ filter: 'drop-shadow(0 0 6px #ff3b2f)' }}>B-217 → 4</text>
        <text x="400" y="290" fontFamily="JetBrains Mono" fontSize="26" fill="#ff3b2f" opacity="0.6">B-215 → 7</text>
        {/* posters */}
        <rect x="760" y="200" width="120" height="160" fill="#e8e4d8" />
        <rect x="772" y="215" width="96" height="10" fill="#1d5fae" />
        <rect x="900" y="210" width="110" height="150" fill="#f3efe2" />
        <rect x="912" y="226" width="86" height="8" fill="#c01d1d" />
      </>
    )),
    L(0.5, id, tod, (
      <>
        <rect x="0" y="620" width="1600" height="280" fill="#6e6f68" />
        <rect x="0" y="620" width="1600" height="280" fill="#15181c" opacity="0.6" />
        {/* counters */}
        {[860, 1100, 1340].map((x, i) => (
          <g key={i}>
            <rect x={x} y="420" width="200" height="220" fill="#d8d6cc" opacity="0.9" />
            <rect x={x} y="420" width="200" height="220" fill="#1a1e24" opacity="0.4" />
            <rect x={x + 70} y="380" width="60" height="40" fill="#1d5fae" />
            <text x={x + 90} y="410" fontFamily="Inter" fontWeight="800" fontSize="28" fill="#fff">{[2, 4, 7][i]}</text>
            <rect x={x + 30} y="520" width="140" height="12" fill="#999" />
          </g>
        ))}
        {npcFigures(p, 0.72, 600)}
        <rect x="1100" y="535" width="200" height="105" fill="#bdbab0" />
        {/* rubber plant */}
        <rect x="620" y="560" width="60" height="80" fill="#6a4a2a" />
        {Array.from({ length: 7 }).map((_, i) => (
          <ellipse key={i} cx={650 + Math.cos(i) * 40} cy={500 - i * 24} rx="30" ry="14" fill="#1f4a2a" transform={`rotate(${i * 25 - 60} ${650 + Math.cos(i) * 40} ${500 - i * 24})`} />
        ))}
      </>
    )),
    L(0.85, id, tod, (
      <>
        {/* chairs row */}
        {Array.from({ length: 6 }).map((_, i) => (
          <g key={i}>
            <rect x={60 + i * 95} y="690" width="78" height="14" fill="#3a5a8a" />
            <rect x={60 + i * 95} y="620" width="78" height="70" rx="8" fill="#3a5a8a" />
            <rect x={70 + i * 95} y="704" width="6" height="90" fill="#222" />
          </g>
        ))}
        <Figure x={260} y={690} s={0.9} coat="#2a2a2a" rim="#9fb8d6" hairStyle="long" hair="#6a4a2a" />
      </>
    )),
  ];
}

function placeholder(p: SceneProps, id: string): Layer[] {
  return [L(0, id, p.tod, <><rect width="1600" height="900" fill={`url(#${id}-sky)`} /><Skyline seed={9} y={620} h={260} color="#10141c" tod={p.tod} tower={900} /></>)];
}

export function sceneLayers(art: SceneArt, p: SceneProps): Layer[] {
  switch (art) {
    case 'hauptbahnhof':
    case 'platform':
      return hauptbahnhof(p);
    case 'street':
      return street(p);
    case 'apartment':
      return apartment(p);
    case 'cafe':
      return cafe(p);
    case 'office':
      return office(p);
    case 'restaurant':
      return restaurant(p);
    case 'spree':
      return spree(p);
    case 'buergeramt':
      return buergeramt(p);
    default:
      return placeholder(p, art);
  }
}
