"use client";

import { useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface WeekChip {
  week: number;
  /** Sin episodio planificado: se muestra apagada. */
  empty?: boolean;
}

/**
 * Carrusel de las 52 semanas del plan (S01–S52). La semana activa queda
 * resaltada y siempre visible: al cambiarla, la tira se desplaza sola.
 */
export function WeekStrip({
  weeks,
  active,
  onSelect,
  onToday,
}: {
  weeks: WeekChip[];
  active: number;
  onSelect: (week: number) => void;
  onToday?: () => void;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  // Mantiene la semana activa a la vista cuando cambia desde fuera
  // (flechas, "Hoy" o al abrir la página).
  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [active]);

  const step = (delta: number) => {
    const next = Math.min(weeks.length, Math.max(1, active + delta));
    onSelect(next);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => step(-1)}
        disabled={active <= 1}
        aria-label="Semana anterior"
        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-white/12 text-white/50 transition-colors hover:bg-white/5 hover:text-white/85 disabled:opacity-30"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <div ref={scrollerRef} className="flex min-w-0 flex-1 gap-1.5 overflow-x-auto scroll-smooth py-1">
        {weeks.map((w) => {
          const isActive = w.week === active;
          return (
            <button
              key={w.week}
              ref={isActive ? activeRef : undefined}
              type="button"
              onClick={() => onSelect(w.week)}
              aria-current={isActive ? "true" : undefined}
              className={`flex h-8 w-11 flex-shrink-0 items-center justify-center rounded-full text-xs font-medium transition-colors ${
                isActive
                  ? "bg-[var(--allpa-gold-400)]/20 font-semibold text-[var(--allpa-gold-300)] ring-1 ring-[var(--allpa-gold-400)]/60"
                  : w.empty
                    ? "text-white/25 hover:bg-white/5 hover:text-white/50"
                    : "text-white/60 hover:bg-white/5 hover:text-white/90"
              }`}
            >
              S{String(w.week).padStart(2, "0")}
            </button>
          );
        })}
      </div>

      {onToday && (
        <button
          type="button"
          onClick={onToday}
          className="h-8 flex-shrink-0 rounded-lg border border-white/12 px-3 text-xs font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white/95"
        >
          Hoy
        </button>
      )}

      <button
        type="button"
        onClick={() => step(1)}
        disabled={active >= weeks.length}
        aria-label="Semana siguiente"
        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-white/12 text-white/50 transition-colors hover:bg-white/5 hover:text-white/85 disabled:opacity-30"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
