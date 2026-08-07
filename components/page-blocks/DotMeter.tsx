/**
 * Medidor de cinco puntos: complejidad de un plan, prioridad de un
 * componente, liquidez o flexibilidad en el comparador.
 *
 * Los puntos apagados también se dibujan, para que el nivel se lea de un
 * vistazo sin tener que contar los encendidos.
 */
export function DotMeter({
  level,
  color = "#a78bfa",
  label,
  size = "md",
}: {
  /** De 1 a 5; se recorta si llega algo fuera de rango. */
  level: number;
  color?: string;
  /** Texto a la derecha ("Alta", "Moderado"…). */
  label?: string;
  size?: "sm" | "md";
}) {
  const filled = Math.max(0, Math.min(5, Math.round(level)));
  const dot = size === "sm" ? "h-1.5 w-1.5" : "h-2 w-2";

  return (
    <span className="flex items-center gap-2">
      <span className="flex flex-shrink-0 items-center gap-1" role="img" aria-label={`Nivel ${filled} de 5`}>
        {Array.from({ length: 5 }, (_, i) => (
          <span
            key={i}
            className={`${dot} rounded-full`}
            style={{ background: i < filled ? color : "rgba(255,255,255,0.12)" }}
          />
        ))}
      </span>
      {label && <span className="truncate text-xs text-white/55">{label}</span>}
    </span>
  );
}
