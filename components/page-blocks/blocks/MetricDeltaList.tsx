import { resolveLucideIcon } from "@/lib/lucide-icon";

export interface MetricDeltaRow {
  id: string;
  label: string;
  /** Valor ya formateado: "16 días", "90%", "2h 35m". */
  value: string;
  /** Variación con signo: "-2 días", "+1 día", "6%". Vacío u omitido = sin cambio. */
  delta?: string;
  /**
   * Si bajar es mejor —tiempos de ciclo, tiempos de respuesta— una variación
   * negativa se pinta en verde en vez de en rojo.
   */
  lowerIsBetter?: boolean;
  /** Punto de color a la derecha, para estados de cumplimiento. */
  dotColor?: string;
  icon?: string;
}

/**
 * Lista compacta de métrica, valor y variación, para paneles laterales:
 * "Tiempo de ciclo por proceso", "Políticas con menor cumplimiento".
 *
 * A diferencia de `RankedBarList`, que compara magnitudes entre sí con una
 * barra, aquí lo que importa es el valor de cada fila y hacia dónde se mueve.
 */
export function MetricDeltaList({ rows }: { rows: MetricDeltaRow[] }) {
  if (rows.length === 0) {
    return <p className="py-6 text-center text-sm text-white/35">Sin datos para mostrar.</p>;
  }

  return (
    <ul className="divide-y divide-white/[0.06]">
      {rows.map((row) => {
        const Icon = row.icon ? resolveLucideIcon(row.icon) : null;
        const trimmed = row.delta?.trim() ?? "";
        const down = trimmed.startsWith("-") || trimmed.startsWith("↓");
        // Con `lowerIsBetter`, bajar es la buena noticia.
        const good = row.lowerIsBetter ? down : !down;

        return (
          <li key={row.id} className="flex items-center gap-2.5 py-2.5 text-sm">
            {Icon && <Icon className="h-3.5 w-3.5 flex-shrink-0 text-white/35" />}
            <span className="min-w-0 flex-1 truncate text-white/70">{row.label}</span>
            <span className="flex-shrink-0 tabular-nums font-medium text-white/85">{row.value}</span>

            {trimmed ? (
              <span className={`w-16 flex-shrink-0 text-right text-xs font-medium ${good ? "text-emerald-400" : "text-rose-400"}`}>
                {down ? "↓" : "↑"} {trimmed.replace(/^[-+↑↓]\s*/, "")}
              </span>
            ) : (
              <span className="w-16 flex-shrink-0 text-right text-xs text-white/25">—</span>
            )}

            {row.dotColor && (
              <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ background: row.dotColor }} />
            )}
          </li>
        );
      })}
    </ul>
  );
}
