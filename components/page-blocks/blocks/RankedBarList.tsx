export interface RankedBarRow {
  id: string;
  label: string;
  value: number;
  color: string;
  /** Muestra el avatar de iniciales antes de la etiqueta. */
  person?: boolean;
  /** Numera las filas 1, 2, 3… */
  ranked?: boolean;
}

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/**
 * Ranking con barra horizontal proporcional al mayor valor de la lista:
 * actividad por tipo, por usuario, contenidos con más clientes, etc.
 */
export function RankedBarList({ rows, formatValue }: { rows: RankedBarRow[]; formatValue?: (n: number) => string }) {
  if (rows.length === 0) {
    return <p className="py-6 text-center text-sm text-white/35">Sin datos para mostrar.</p>;
  }

  const max = Math.max(...rows.map((r) => r.value), 1);
  const format = formatValue ?? ((n: number) => n.toLocaleString("es"));

  return (
    <ul className="space-y-2.5">
      {rows.map((row, i) => (
        <li key={row.id} className="flex items-center gap-2.5 text-sm">
          {row.ranked && <span className="w-3 flex-shrink-0 text-xs tabular-nums text-white/30">{i + 1}</span>}
          {row.person && (
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#f5da93] to-[#a9760f] text-[9px] font-bold text-[#241a05]">
              {initialsOf(row.label)}
            </span>
          )}
          <span className="w-28 flex-shrink-0 truncate text-white/70">{row.label}</span>
          <span className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-white/8">
            <span
              className="block h-full rounded-full transition-all"
              style={{ width: `${(row.value / max) * 100}%`, background: row.color }}
            />
          </span>
          <span className="w-14 flex-shrink-0 text-right tabular-nums font-medium text-white/85">{format(row.value)}</span>
        </li>
      ))}
    </ul>
  );
}
