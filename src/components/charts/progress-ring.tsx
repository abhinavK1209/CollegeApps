const SIZE = 52;
const STROKE = 5;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * Server-renderable SVG ring. Colour tracks meaning rather than magnitude:
 * green only once work is genuinely confirmed complete.
 */
export function ProgressRing({ value }: { value: number }) {
  const clamped = Math.max(0, Math.min(100, value));
  const stroke =
    clamped >= 100 ? "var(--success)" : clamped > 0 ? "var(--accent)" : "var(--border)";

  return (
    <div className="relative" style={{ width: SIZE, height: SIZE }}>
      <svg width={SIZE} height={SIZE} className="-rotate-90" aria-hidden>
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="var(--border)"
          strokeWidth={STROKE}
        />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke={stroke}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - clamped / 100)}
          style={{ transition: "stroke-dashoffset 320ms cubic-bezier(.32,.72,0,1)" }}
        />
      </svg>
      <span
        className="text-fg absolute inset-0 grid place-items-center font-mono text-[12px] font-semibold tabular-nums"
        role="img"
        aria-label={`${clamped} percent complete`}
      >
        {clamped}
      </span>
    </div>
  );
}
