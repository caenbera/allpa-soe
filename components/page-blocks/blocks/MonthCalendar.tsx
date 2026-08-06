"use client";

import { useState } from "react";
import { WEEKDAY_LABELS, isToday, localIso, monthGridDays } from "@/lib/calendar-utils";

export interface CalendarEvent {
  id: string;
  title: string;
  /** ISO `YYYY-MM-DD` en hora local. */
  date: string;
  /** "09:00"; vacío si dura todo el día. */
  time: string;
  color: string;
  kind: string;
  client?: string;
  /** Duración en minutos; la usa la rejilla horaria para estirar el evento. */
  durationMin?: number;
}

/** Cuántos eventos caben en una casilla antes de resumir el resto. */
const VISIBLE_PER_DAY = 3;

/**
 * Rejilla mensual con los eventos de cada día.
 *
 * Siempre dibuja seis semanas para que la altura no salte al cambiar de mes,
 * y las casillas de los meses vecinos se atenúan en vez de ocultarse, que es
 * como se lee un calendario de pared.
 */
export function MonthCalendar({
  year,
  month,
  events,
  selectedDate,
  onSelectDate,
  onSelectEvent,
}: {
  year: number;
  /** 0-11, como en `Date`. */
  month: number;
  events: CalendarEvent[];
  selectedDate?: string | null;
  onSelectDate?: (iso: string) => void;
  onSelectEvent?: (id: string) => void;
}) {
  // Qué días tienen la lista desplegada tras pulsar «+N más».
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const days = monthGridDays(year, month);
  const porDia = new Map<string, CalendarEvent[]>();
  events.forEach((e) => {
    const list = porDia.get(e.date) ?? [];
    list.push(e);
    porDia.set(e.date, list);
  });
  porDia.forEach((list) => list.sort((a, b) => a.time.localeCompare(b.time)));

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[720px] overflow-hidden rounded-xl border border-white/10">
        <div className="grid grid-cols-7 border-b border-white/10 bg-white/[0.02]">
          {WEEKDAY_LABELS.map((d) => (
            <div key={d} className="px-2 py-2 text-center text-[11px] font-medium uppercase tracking-wide text-white/35">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {days.map((day) => {
            const iso = localIso(day);
            const delMes = day.getMonth() === month;
            const hoy = isToday(day);
            const seleccionado = selectedDate === iso;
            const delDia = porDia.get(iso) ?? [];
            const abierto = expanded[iso];
            const visibles = abierto ? delDia : delDia.slice(0, VISIBLE_PER_DAY);
            const ocultos = delDia.length - visibles.length;

            return (
              <div
                key={iso}
                onClick={() => onSelectDate?.(iso)}
                className={`min-h-[112px] cursor-pointer border-b border-r border-white/[0.06] p-1.5 transition-colors last:border-r-0 ${
                  seleccionado ? "bg-[var(--allpa-gold-400)]/[0.07]" : "hover:bg-white/[0.02]"
                } ${delMes ? "" : "opacity-40"}`}
              >
                <div className="mb-1 flex items-center justify-between">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs tabular-nums ${
                      hoy ? "bg-[var(--allpa-gold-400)] font-bold text-[#241a05]" : "text-white/60"
                    }`}
                  >
                    {day.getDate()}
                  </span>
                </div>

                <div className="space-y-1">
                  {visibles.map((e) => (
                    <button
                      key={e.id}
                      type="button"
                      onClick={(ev) => {
                        ev.stopPropagation();
                        onSelectEvent?.(e.id);
                      }}
                      title={`${e.time} ${e.title}`}
                      className="flex w-full items-center gap-1 rounded px-1 py-0.5 text-left text-[10px] transition-colors hover:bg-white/10"
                      style={{ background: `${e.color}14` }}
                    >
                      <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ background: e.color }} />
                      {e.time && <span className="flex-shrink-0 tabular-nums text-white/45">{e.time}</span>}
                      <span className="min-w-0 truncate text-white/75">{e.title}</span>
                    </button>
                  ))}

                  {ocultos > 0 && (
                    <button
                      type="button"
                      onClick={(ev) => {
                        ev.stopPropagation();
                        setExpanded((prev) => ({ ...prev, [iso]: true }));
                      }}
                      className="px-1 text-[10px] text-white/35 transition-colors hover:text-[var(--allpa-gold-300)]"
                    >
                      +{ocultos} más
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
