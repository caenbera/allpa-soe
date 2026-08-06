"use client";

import { GRID_HOURS, isToday, localIso, minutesFromGridStart } from "@/lib/calendar-utils";
import type { CalendarEvent } from "@/components/page-blocks/blocks/MonthCalendar";

/** Alto de una hora en píxeles; de aquí sale la posición de cada evento. */
const HOUR_PX = 56;

const WEEKDAY_SHORT = ["lun", "mar", "mié", "jue", "vie", "sáb", "dom"];

/**
 * Rejilla horaria para las vistas de Semana y Día.
 *
 * Es el mismo componente para las dos: la única diferencia es cuántas
 * columnas recibe, así que no hay dos implementaciones que mantener. Cada
 * evento se coloca por su hora y se estira según su duración.
 */
export function TimeGridCalendar({
  days,
  events,
  onSelectEvent,
}: {
  /** Un día para la vista de Día, siete para la de Semana. */
  days: Date[];
  events: CalendarEvent[];
  onSelectEvent?: (id: string) => void;
}) {
  const porDia = new Map<string, CalendarEvent[]>();
  events.forEach((e) => {
    const list = porDia.get(e.date) ?? [];
    list.push(e);
    porDia.set(e.date, list);
  });

  const altura = GRID_HOURS.length * HOUR_PX;

  return (
    <div className="overflow-x-auto">
      <div className={`${days.length > 1 ? "min-w-[760px]" : ""} overflow-hidden rounded-xl border border-white/10`}>
        {/* Encabezado con los días */}
        <div
          className="grid border-b border-white/10 bg-white/[0.02]"
          style={{ gridTemplateColumns: `56px repeat(${days.length}, minmax(0, 1fr))` }}
        >
          <div />
          {days.map((d) => {
            const hoy = isToday(d);
            return (
              <div key={localIso(d)} className="px-2 py-2 text-center">
                <p className="text-[11px] uppercase tracking-wide text-white/35">
                  {WEEKDAY_SHORT[(d.getDay() + 6) % 7]}
                </p>
                <p
                  className={`mx-auto mt-0.5 flex h-6 w-6 items-center justify-center rounded-full text-xs tabular-nums ${
                    hoy ? "bg-[var(--allpa-gold-400)] font-bold text-[#241a05]" : "text-white/70"
                  }`}
                >
                  {d.getDate()}
                </p>
              </div>
            );
          })}
        </div>

        {/* Cuerpo: franjas horarias y eventos posicionados encima */}
        <div
          className="relative grid"
          style={{ gridTemplateColumns: `56px repeat(${days.length}, minmax(0, 1fr))`, height: altura }}
        >
          <div className="relative border-r border-white/[0.06]">
            {GRID_HOURS.map((h, i) => (
              <span
                key={h}
                className="absolute right-1.5 -translate-y-1/2 text-[10px] tabular-nums text-white/30"
                style={{ top: i * HOUR_PX }}
              >
                {String(h).padStart(2, "0")}:00
              </span>
            ))}
          </div>

          {days.map((d) => {
            const iso = localIso(d);
            const delDia = (porDia.get(iso) ?? []).sort((a, b) => a.time.localeCompare(b.time));

            return (
              <div key={iso} className="relative border-r border-white/[0.06] last:border-r-0">
                {GRID_HOURS.map((h, i) => (
                  <div
                    key={h}
                    className="absolute inset-x-0 border-b border-white/[0.04]"
                    style={{ top: i * HOUR_PX, height: HOUR_PX }}
                  />
                ))}

                {delDia.map((e) => {
                  const desde = minutesFromGridStart(e.time);
                  // Fuera de la franja dibujada: se ancla al borde más cercano.
                  const top = Math.max(0, (desde / 60) * HOUR_PX);
                  const alto = Math.max(22, ((e.durationMin ?? 60) / 60) * HOUR_PX - 3);

                  return (
                    <button
                      key={e.id}
                      type="button"
                      onClick={() => onSelectEvent?.(e.id)}
                      title={`${e.time} · ${e.title}`}
                      className="absolute inset-x-1 overflow-hidden rounded-md px-1.5 py-1 text-left transition-opacity hover:opacity-90"
                      style={{
                        top,
                        height: alto,
                        background: `${e.color}22`,
                        borderLeft: `2px solid ${e.color}`,
                      }}
                    >
                      <span className="block truncate text-[10px] tabular-nums text-white/50">{e.time}</span>
                      <span className="block truncate text-[11px] font-medium text-white/85">{e.title}</span>
                      {e.client && <span className="block truncate text-[10px] text-white/40">{e.client}</span>}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
