import { resolveLucideIcon } from "@/lib/lucide-icon";
import { Progress } from "@/components/ui/progress";

export interface KpiProgressRow {
  id: string;
  label: string;
  icon: string;
  value: string;
  /** Con porcentaje se dibuja la barra; sin él, solo la cifra. */
  percent?: number;
}

/** Indicadores del panel lateral: cifra a la derecha y barra cuando aplica. */
export function KpiProgressList({ rows }: { rows: KpiProgressRow[] }) {
  return (
    <ul className="space-y-3">
      {rows.map((row) => {
        const Icon = resolveLucideIcon(row.icon);
        return (
          <li key={row.id}>
            <div className="flex items-center gap-2 text-sm">
              <Icon className="h-3.5 w-3.5 flex-shrink-0 text-white/35" />
              <span className="min-w-0 flex-1 truncate text-white/65">{row.label}</span>
              <span className="flex-shrink-0 tabular-nums font-medium text-[#f3ecd9]">{row.value}</span>
              {row.percent != null && (
                <span className="w-9 flex-shrink-0 text-right text-xs tabular-nums text-white/35">{row.percent}%</span>
              )}
            </div>
            {row.percent != null && <Progress value={row.percent} className="mt-1.5" />}
          </li>
        );
      })}
    </ul>
  );
}
