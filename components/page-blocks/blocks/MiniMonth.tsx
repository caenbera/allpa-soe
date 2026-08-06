"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { WEEKDAY_LABELS, isToday, localIso, monthGridDays, monthLabel } from "@/lib/calendar-utils";

/**
 * Mes compacto para paneles laterales: sirve para saltar de fecha y para ver
 * de un vistazo qué días tienen algo. Los puntos bajo cada número son los
 * tipos de evento de ese día, hasta tres.
 */
export function MiniMonth({
  year,
  month,
  selectedDate,
  eventColorsByDate,
  onSelectDate,
  onChangeMonth,
}: {
  year: number;
  /** 0-11, como en `Date`. */
  month: number;
  selectedDate?: string | null;
  /** ISO del día → colores de sus eventos. */
  eventColorsByDate?: Map<string, string[]>;
  onSelectDate?: (iso: string) => void;
  onChangeMonth?: (delta: number) => void;
}) {
  const days = monthGridDays(year, month);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          onClick={() => onChangeMonth?.(-1)}
          aria-label="Mes anterior"
          className="flex h-6 w-6 items-center justify-center rounded text-white/40 transition-colors hover:bg-white/5 hover:text-white/80"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
        <span className="text-xs font-medium text-white/70">{monthLabel(year, month)}</span>
        <button
          type="button"
          onClick={() => onChangeMonth?.(1)}
          aria-label="Mes siguiente"
          className="flex h-6 w-6 items-center justify-center rounded text-white/40 transition-colors hover:bg-white/5 hover:text-white/80"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {WEEKDAY_LABELS.map((d) => (
          <span key={d} className="py-1 text-center text-[9px] uppercase text-white/25">
            {d.slice(0, 1)}
          </span>
        ))}

        {days.map((day) => {
          const iso = localIso(day);
          const delMes = day.getMonth() === month;
          const hoy = isToday(day);
          const seleccionado = selectedDate === iso;
          const colores = (eventColorsByDate?.get(iso) ?? []).slice(0, 3);

          return (
            <button
              key={iso}
              type="button"
              onClick={() => onSelectDate?.(iso)}
              className={`flex h-8 flex-col items-center justify-center rounded transition-colors ${
                seleccionado
                  ? "bg-[var(--allpa-gold-400)]/20"
                  : hoy
                    ? "bg-[var(--allpa-gold-400)] text-[#241a05]"
                    : "hover:bg-white/5"
              } ${delMes ? "" : "opacity-30"}`}
            >
              <span className={`text-[11px] tabular-nums ${hoy && !seleccionado ? "font-bold" : "text-white/65"}`}>
                {day.getDate()}
              </span>
              <span className="flex h-1 items-center gap-0.5">
                {colores.map((c, i) => (
                  <span key={i} className="h-1 w-1 rounded-full" style={{ background: c }} />
                ))}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
