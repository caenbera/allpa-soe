import { resolveLucideIcon } from "@/lib/lucide-icon";

export interface InfoRow {
  label: string;
  value: string;
  /** Muestra el valor como pastilla con punto de color. */
  tone?: "emerald" | "amber" | "rose" | "blue" | "violet";
  /** Icono lucide antes del valor (ej. bandera de prioridad). */
  icon?: string;
  /** Muestra el valor con avatar circular de iniciales. */
  person?: boolean;
}

const DOT_TONES = {
  emerald: "bg-emerald-400",
  amber: "bg-amber-400",
  rose: "bg-rose-400",
  blue: "bg-blue-400",
  violet: "bg-violet-400",
} as const;

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/** Lista de campos y valores: "Información General", "Detalles de Producción", etc. */
export function InfoCard({ rows }: { rows: InfoRow[] }) {
  return (
    <dl className="space-y-2.5 text-sm">
      {rows.map((row) => {
        const Icon = row.icon ? resolveLucideIcon(row.icon) : null;
        return (
          <div key={row.label} className="flex items-start justify-between gap-3">
            <dt className="flex-shrink-0 text-white/40">{row.label}</dt>
            <dd className="flex min-w-0 items-center gap-1.5 text-right text-white/85">
              {row.tone && <span className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${DOT_TONES[row.tone]}`} />}
              {Icon && <Icon className="h-3.5 w-3.5 flex-shrink-0 text-white/45" />}
              {row.person && (
                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#f5da93] to-[#a9760f] text-[9px] font-bold text-[#241a05]">
                  {initialsOf(row.value)}
                </span>
              )}
              <span className="truncate">{row.value}</span>
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
