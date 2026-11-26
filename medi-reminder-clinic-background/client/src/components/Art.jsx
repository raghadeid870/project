// رسومات SVG بسيطة للزينة (الكبسولات، التقويم، شعار القلب)
const P = '#168B83', P2 = '#35AAA0', L = '#CBE8E3';

export function PillsArt() {
  return (
    <svg viewBox="0 0 130 70" width="130" aria-hidden="true">
      <g transform="rotate(-28 45 36)">
        <rect x="8" y="22" width="74" height="30" rx="15" fill="#fff" stroke="#E2DAFA" />
        <path d="M23 22H45V52H23A15 15 0 0 1 23 22Z" fill={P2} />
      </g>
      <circle cx="104" cy="48" r="13" fill="#fff" stroke="#E2DAFA" />
      <path d="M95 48h18" stroke="#E2DAFA" strokeWidth="2" />
    </svg>
  );
}

export function CalendarArt() {
  return (
    <svg viewBox="0 0 140 120" width="150" aria-hidden="true">
      <g transform="rotate(8 60 60)">
        <rect x="15" y="20" width="90" height="80" rx="12" fill="#fff" stroke={P} strokeWidth="3" />
        <path d="M15 34a14 14 0 0 1 14-14h62a14 14 0 0 1 14 14v6H15z" fill={P2} />
        <rect x="36" y="10" width="8" height="20" rx="4" fill={P} />
        <rect x="76" y="10" width="8" height="20" rx="4" fill={P} />
        {[0, 1, 2].map((r) => [0, 1, 2].map((c) => (
          <rect key={`${r}${c}`} x={30 + c * 22} y={52 + r * 15} width="12" height="9" rx="3" fill={L} />
        )))}
      </g>
      <circle cx="106" cy="88" r="22" fill="#fff" stroke={P} strokeWidth="4" />
      <path d="M106 75v13l9 5" stroke={P} strokeWidth="4" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function BigCapsule() {
  return (
    <svg viewBox="0 0 90 90" width="84" aria-hidden="true">
      <g transform="rotate(-35 45 45)">
        <rect x="8" y="28" width="74" height="34" rx="17" fill="#fff" stroke="#E2DAFA" />
        <path d="M25 28H45V62H25A17 17 0 0 1 25 28Z" fill={P2} />
      </g>
    </svg>
  );
}

export function HeartLogo() {
  return (
    <svg viewBox="0 0 64 60" width="52" aria-hidden="true">
      <path d="M32 56C8 40 4 22 15 12c8-7 17-3 17 5 0-8 9-12 17-5 11 10 7 28-17 44z" fill="#fff" stroke={P} strokeWidth="3.5" strokeLinejoin="round" />
      <g transform="rotate(-35 32 30)">
        <rect x="18" y="24" width="28" height="13" rx="6.5" fill={L} stroke={P} strokeWidth="2" />
        <path d="M24.500 24H32V37H24.500A6.500 6.500 0 0 1 24.500 24Z" fill={P2} />
      </g>
    </svg>
  );
}
