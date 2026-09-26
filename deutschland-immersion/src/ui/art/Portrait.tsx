import type { PortraitSpec } from '../../engine/types';

/** Noir bust portrait: silhouette, rim light, a hint of face — memorable without uncanny detail. */
export function Portrait({ spec, id, talking }: { spec: PortraitSpec; id: string; talking?: boolean }) {
  const g = `pt-${id}`;
  const { hair, hairColor, skin, coat, accent, glasses, beard } = spec;
  return (
    <svg viewBox="0 0 400 600" preserveAspectRatio="xMidYMax meet">
      <defs>
        <radialGradient id={`${g}-bg`} cx="0.6" cy="0.35" r="0.6">
          <stop offset="0" stopColor={accent} stopOpacity="0.28" />
          <stop offset="1" stopColor={accent} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${g}-face`} x1="1" y1="0" x2="0" y2="0">
          <stop offset="0" stopColor={skin} stopOpacity="0.55" />
          <stop offset="0.35" stopColor={skin} stopOpacity="0.16" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${g}-coat`} x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={coat} />
          <stop offset="1" stopColor="#030405" />
        </linearGradient>
        <filter id={`${g}-rim`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.5" />
        </filter>
      </defs>
      <ellipse cx="240" cy="220" rx="220" ry="260" fill={`url(#${g}-bg)`} />
      <g>
        {/* shoulders */}
        <path d="M30 600 C40 470 110 430 170 410 L230 410 C290 430 360 470 372 600 Z" fill={`url(#${g}-coat)`} />
        <path d="M230 410 C290 430 360 470 372 600" fill="none" stroke={accent} strokeWidth="4" opacity="0.7" filter={`url(#${g}-rim)`} />
        <path d="M170 410 L200 470 L230 410" fill="#0a0b0e" />
        {/* neck */}
        <path d="M172 330 L170 415 L232 415 L228 330 Z" fill="#0c0d10" />
        <path d="M228 330 L232 415" stroke={accent} strokeWidth="3" opacity="0.5" filter={`url(#${g}-rim)`} />
        {/* head */}
        <ellipse cx="200" cy="255" rx="78" ry="98" fill="#0e0f12" />
        <ellipse cx="200" cy="255" rx="78" ry="98" fill={`url(#${g}-face)`} />
        <path d="M262 190 C284 230 284 290 256 332" stroke={accent} strokeWidth="5" fill="none" opacity="0.85" filter={`url(#${g}-rim)`} />
        {/* ear */}
        <ellipse cx="276" cy="262" rx="10" ry="20" fill="#0d0e11" />
        {/* eyes */}
        <g>
          <ellipse cx="176" cy="250" rx="7" ry="3" fill="#fff" opacity="0.18" />
          <ellipse cx="226" cy="250" rx="7" ry="3" fill="#fff" opacity="0.32" />
          <animate attributeName="opacity" values="1;1;0;1;1" keyTimes="0;0.92;0.94;0.96;1" dur="5.5s" repeatCount="indefinite" />
        </g>
        {/* nose/mouth planes */}
        <path d="M206 258 L214 296 L202 300" stroke={skin} strokeOpacity="0.25" strokeWidth="3" fill="none" />
        <path d="M184 322 Q204 328 222 320" stroke={skin} strokeOpacity={talking ? 0.4 : 0.2} strokeWidth="3" fill="none">
          {talking && <animate attributeName="d" values="M184 322 Q204 328 222 320;M184 322 Q204 334 222 320;M184 322 Q204 328 222 320" dur="0.35s" repeatCount="indefinite" />}
        </path>
        {beard && <path d="M136 290 C140 350 170 360 200 362 C230 360 262 350 266 290 C250 330 150 330 136 290 Z" fill={hairColor} opacity="0.9" />}
        {glasses && (
          <g stroke={accent} strokeOpacity="0.7" strokeWidth="3" fill="none">
            <rect x="152" y="236" width="44" height="28" rx="8" />
            <rect x="206" y="236" width="44" height="28" rx="8" />
            <line x1="196" y1="248" x2="206" y2="248" />
            <line x1="240" y1="232" x2="248" y2="244" stroke="#fff" strokeOpacity="0.8" />
          </g>
        )}
        {/* hair */}
        {hair === 'short' && <path d="M122 245 C118 160 170 140 208 142 C258 144 286 180 280 238 C270 200 240 186 200 188 C160 190 134 210 122 245 Z" fill={hairColor} />}
        {hair === 'curly' && (
          <g fill={hairColor}>
            {Array.from({ length: 11 }).map((_, i) => (
              <circle key={i} cx={128 + i * 14} cy={178 - Math.sin((i / 10) * Math.PI) * 32} r="22" />
            ))}
          </g>
        )}
        {hair === 'long' && <path d="M118 250 C110 150 170 128 206 130 C262 132 292 170 286 250 L292 400 L262 400 C274 330 272 250 262 210 C240 190 170 188 140 212 C130 250 132 330 142 400 L110 400 Z" fill={hairColor} />}
        {hair === 'bun' && (
          <g fill={hairColor}>
            <path d="M122 240 C118 165 168 142 206 144 C256 146 284 180 280 238 C266 196 236 182 200 184 C162 186 136 206 122 240 Z" />
            <circle cx="188" cy="140" r="30" />
          </g>
        )}
        {hair === 'bob' && <path d="M116 300 C104 160 168 138 204 138 C258 140 298 170 288 300 L272 300 C276 240 266 206 244 196 C210 186 170 188 150 204 C132 230 132 270 136 300 Z" fill={hairColor} />}
        {hair === 'cap' && (
          <g>
            <path d="M120 222 C120 150 170 132 206 132 C250 134 284 160 284 222 Z" fill="#b3141c" />
            <path d="M200 222 L316 226 L300 206 L200 204 Z" fill="#8f141b" />
            <rect x="120" y="214" width="166" height="12" fill="#6a0f15" />
          </g>
        )}
        {hair === 'bald' && <path d="M126 220 C130 170 170 152 204 152 C240 152 274 172 278 220" stroke={accent} strokeOpacity="0.35" strokeWidth="4" fill="none" />}
      </g>
    </svg>
  );
}
