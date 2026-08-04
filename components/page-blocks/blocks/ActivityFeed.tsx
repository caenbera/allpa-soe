import { resolveLucideIcon } from "@/lib/lucide-icon";

export interface ActivityEntry {
  id: string;
  icon: string;
  color: string;
  /** Persona sobre la que ocurre la actividad. */
  person?: string;
  personSub?: string;
  title: string;
  detail?: string;
  source?: string;
  timeLabel: string;
  tag?: string;
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
 * Registro de interacciones: llamadas, emails, reuniones, tareas y cambios.
 * A diferencia de `Timeline`, que muestra hitos planificados, aquí cada línea
 * es algo que ya ocurrió, con su origen y su autor.
 */
export function ActivityFeed({ entries, compact = false }: { entries: ActivityEntry[]; compact?: boolean }) {
  if (entries.length === 0) {
    return <p className="py-6 text-center text-sm text-white/35">Todavía no hay actividad registrada.</p>;
  }

  return (
    <ul className="divide-y divide-white/[0.06]">
      {entries.map((entry) => {
        const Icon = resolveLucideIcon(entry.icon);
        return (
          <li key={entry.id} className={`flex items-start gap-3 ${compact ? "py-2.5" : "py-3"}`}>
            <span
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
              style={{ background: `${entry.color}20`, color: entry.color }}
            >
              <Icon className="h-4 w-4" />
            </span>

            {entry.person && !compact && (
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#f5da93] to-[#a9760f] text-[10px] font-bold text-[#241a05]">
                {initialsOf(entry.person)}
              </span>
            )}

            <span className="min-w-0 flex-1">
              {entry.person && (
                <span className="block truncate text-sm font-medium text-white/85">{entry.person}</span>
              )}
              {entry.personSub && <span className="block truncate text-xs text-white/35">{entry.personSub}</span>}
            </span>

            <span className="hidden min-w-0 flex-1 sm:block">
              <span className="block truncate text-sm text-white/80">{entry.title}</span>
              {entry.detail && <span className="block truncate text-xs text-white/40">{entry.detail}</span>}
              {entry.tag && (
                <span className="mt-1 inline-block rounded-full bg-[var(--allpa-gold-400)]/12 px-2 py-0.5 text-[10px] text-[var(--allpa-gold-300)]">
                  {entry.tag}
                </span>
              )}
            </span>

            {entry.source && (
              <span className="hidden w-36 flex-shrink-0 truncate text-xs text-white/45 lg:block">{entry.source}</span>
            )}

            <span className="flex-shrink-0 text-xs text-white/35">{entry.timeLabel}</span>
          </li>
        );
      })}
    </ul>
  );
}
