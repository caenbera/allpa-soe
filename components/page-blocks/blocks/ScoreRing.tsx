/**
 * Anillo de puntaje 0-100. El color pasa de rojo a verde según el tramo, para
 * que la calidad de un lead se lea de un vistazo en tablas y tarjetas.
 */
export function ScoreRing({ value, size = 34 }: { value: number; size?: number }) {
  const clamped = Math.max(0, Math.min(100, value));
  const color = clamped >= 80 ? "#22c55e" : clamped >= 60 ? "#e0a836" : clamped >= 40 ? "#f59e0b" : "#ef4444";
  const stroke = size < 30 ? 2.5 : 3;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <span className="relative inline-flex flex-shrink-0 items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - clamped / 100)}
        />
      </svg>
      <span className="absolute text-[10px] font-semibold tabular-nums" style={{ color }}>
        {clamped}
      </span>
    </span>
  );
}
