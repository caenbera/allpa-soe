"use client";

import { useState } from "react";
import { resolveLucideIcon } from "@/lib/lucide-icon";
import { Checkbox } from "@/components/ui/checkbox";
import type { BadgeTone } from "@/components/page-blocks/blocks/DataTable";

const BADGE_TONES: Record<BadgeTone, string> = {
  gold: "bg-[var(--allpa-gold-400)]/12 text-[var(--allpa-gold-300)]",
  emerald: "bg-emerald-400/12 text-emerald-300",
  amber: "bg-amber-400/12 text-amber-300",
  blue: "bg-blue-400/12 text-blue-300",
  violet: "bg-violet-400/12 text-violet-300",
  rose: "bg-rose-400/12 text-rose-300",
  neutral: "bg-white/8 text-white/60",
};

export interface AgendaEntry {
  id: string;
  /** Hora de la acción, ya formateada: "09:00 AM". */
  time: string;
  title: string;
  done: boolean;
  /** Prioridad u otra etiqueta destacada. */
  priority?: string;
  priorityTone?: BadgeTone;
  /** Proceso o categoría a la que pertenece. */
  tag?: string;
  tagTone?: BadgeTone;
  /** Persona responsable. */
  person?: string;
  /** Icono del tipo de acción: llamada, email, reunión… */
  kindIcon?: string;
  kindLabel?: string;
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
 * Las acciones del día en orden de hora: "Próximas acciones – Hoy".
 *
 * A diferencia de `ChecklistPanel`, que es una lista de verificación suelta,
 * aquí cada línea es un compromiso con hora, prioridad y responsable.
 */
export function AgendaList({
  entries,
  onToggle,
}: {
  entries: AgendaEntry[];
  /** Sin este callback las casillas siguen marcándose, pero solo en pantalla. */
  onToggle?: (id: string, done: boolean) => void;
}) {
  const [local, setLocal] = useState<Record<string, boolean>>({});

  if (entries.length === 0) {
    return <p className="py-6 text-center text-sm text-white/35">No hay acciones programadas para hoy.</p>;
  }

  const isDone = (entry: AgendaEntry) => local[entry.id] ?? entry.done;

  const toggle = (entry: AgendaEntry) => {
    const next = !isDone(entry);
    setLocal((prev) => ({ ...prev, [entry.id]: next }));
    onToggle?.(entry.id, next);
  };

  return (
    <ul className="divide-y divide-white/[0.06]">
      {entries.map((entry) => {
        const KindIcon = entry.kindIcon ? resolveLucideIcon(entry.kindIcon) : null;
        const done = isDone(entry);

        return (
          <li key={entry.id} className="flex items-center gap-3 py-2.5">
            <Checkbox checked={done} onCheckedChange={() => toggle(entry)} aria-label={entry.title} />

            <span className="w-16 flex-shrink-0 text-xs tabular-nums text-white/40">{entry.time}</span>

            <span className={`min-w-0 flex-1 truncate text-sm ${done ? "text-white/30 line-through" : "text-white/85"}`}>
              {entry.title}
            </span>

            {entry.priority && (
              <span className={`hidden flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium sm:inline ${BADGE_TONES[entry.priorityTone ?? "neutral"]}`}>
                {entry.priority}
              </span>
            )}

            {entry.tag && (
              <span className={`hidden flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium lg:inline ${BADGE_TONES[entry.tagTone ?? "neutral"]}`}>
                {entry.tag}
              </span>
            )}

            {entry.person && (
              <span className="hidden flex-shrink-0 items-center gap-1.5 text-xs text-white/45 lg:flex">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-[#f5da93] to-[#a9760f] text-[9px] font-bold text-[#241a05]">
                  {initialsOf(entry.person)}
                </span>
                <span className="max-w-24 truncate">{entry.person}</span>
              </span>
            )}

            {KindIcon && (
              <span className="hidden flex-shrink-0 items-center gap-1 text-xs text-white/35 xl:flex">
                <KindIcon className="h-3.5 w-3.5" />
                {entry.kindLabel}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
