import type { VerdictLevel } from "@/engine/types";

// The verdict, printed like a rubber stamp. The edges are roughened with an svg filter so
// it looks pressed onto paper. Colours: red STOP, amber HIGH RISK, blue CANNOT VERIFY,
// and a dashed grey outline for NO RED FLAGS. That last one must never look like an approval,
// so it is grey (not green or white) and is always followed by "check it yourself first".

const LOOK: Record<VerdictLevel, { color: string; dash?: string; english: string }> = {
  stop: { color: "#c4301c", english: "STOP" },
  high: { color: "#b9740a", english: "HIGH RISK" },
  cannot_verify: { color: "#2b4472", english: "CANNOT VERIFY" },
  no_flags: { color: "#6b6659", dash: "7 5", english: "NO RED FLAGS FOUND" },
};

export function Stamp({ level, title }: { level: VerdictLevel; title: string }) {
  const look = LOOK[level];
  const id = `rough-${level}`;
  // long titles (like Hindi "कोई चेतावनी नहीं मिली") need a smaller size to fit
  const size = title.length > 14 ? 26 : title.length > 8 ? 36 : 54;

  return (
    <div className={`stamp ${level === "stop" ? "shake" : ""}`} role="img" aria-label={`${title} (${look.english})`}>
      <svg viewBox="0 0 340 160" width="100%" style={{ maxWidth: 340, display: "block" }} aria-hidden="true">
        <defs>
          <filter id={id} x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="3" result="warp" />
            <feDisplacementMap in="SourceGraphic" in2="warp" scale="3.2" result="bent" />
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="1" seed="9" result="grain" />
            <feColorMatrix
              in="grain"
              type="matrix"
              values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.4 2.7"
              result="holes"
            />
            <feComposite in="bent" in2="holes" operator="in" />
          </filter>
        </defs>
        <g filter={`url(#${id})`} fill="none" stroke={look.color} color={look.color}>
          <rect x="8" y="8" width="324" height="144" rx="14" strokeWidth="7" strokeDasharray={look.dash} />
          <rect x="22" y="22" width="296" height="116" rx="8" strokeWidth="2.5" strokeDasharray={look.dash} />
          <text
            x="170"
            y={size > 40 ? 90 : 84}
            textAnchor="middle"
            fill={look.color}
            stroke="none"
            fontSize={size}
            fontWeight="900"
            fontFamily="var(--font-serif)"
          >
            {title}
          </text>
          <text
            x="170"
            y="122"
            textAnchor="middle"
            fill={look.color}
            stroke="none"
            fontSize="17"
            fontWeight="800"
            letterSpacing="5"
            fontFamily="var(--font-sans)"
          >
            {look.english}
          </text>
        </g>
      </svg>
    </div>
  );
}
