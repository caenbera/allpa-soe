import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { resolveLucideIcon } from "@/lib/lucide-icon";
import { CONTENT_CHANNELS } from "@/lib/content-types";

export interface WeekCardData {
  id: string;
  week: number;
  dateRange: string;
  title: string;
  guest: string;
  guestLabel: string;
  status: string;
  statusClass: string;
  assetsDone: number;
  assetsTotal: number;
  href: string;
  /** Semana enfocada en el carrusel: se resalta con borde dorado. */
  highlighted?: boolean;
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
 * Tarjetas de las semanas visibles alrededor de la seleccionada. Los puntos
 * de "Activos generados" se derivan de `CONTENT_CHANNELS`: uno por canal,
 * encendidos según cuántos activos lleva la semana.
 */
export function WeekCardGrid({ weeks }: { weeks: WeekCardData[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
      {weeks.map((w) => (
        <div
          key={w.id}
          className={`flex flex-col rounded-xl border bg-white/[0.03] p-3 transition-colors ${
            w.highlighted ? "border-[var(--allpa-gold-400)]/60" : "border-white/10 hover:border-white/20"
          }`}
        >
          <div className="mb-2 flex items-baseline justify-between gap-2">
            <span className="text-sm font-semibold text-[#f3ecd9]">Semana {w.week}</span>
            <span className="flex-shrink-0 text-[11px] text-white/35">{w.dateRange}</span>
          </div>

          <p className="mb-3 line-clamp-2 text-sm leading-snug text-white/85">{w.title}</p>

          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#f5da93] to-[#a9760f] text-[10px] font-bold text-[#241a05]">
              {initialsOf(w.guest)}
            </span>
            <span className="min-w-0">
              <span className="block text-[10px] text-white/35">{w.guestLabel}</span>
              <span className="block truncate text-xs text-white/70">{w.guest}</span>
            </span>
          </div>

          <span className={`mb-3 w-fit rounded-full px-2 py-0.5 text-[10px] font-medium ${w.statusClass}`}>{w.status}</span>

          <div className="mt-auto">
            <div className="mb-1.5 flex items-baseline justify-between gap-2">
              <span className="text-[11px] text-white/40">Activos generados</span>
              <span className="text-[11px] tabular-nums text-white/60">
                {w.assetsDone} / {w.assetsTotal}
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {CONTENT_CHANNELS.map((channel, i) => {
                const Icon = resolveLucideIcon(channel.icon);
                const done = i < w.assetsDone;
                return (
                  <span
                    key={channel.id}
                    title={channel.label}
                    className="flex h-5 w-5 items-center justify-center rounded-md"
                    style={
                      done
                        ? { background: `${channel.color}25`, color: channel.color }
                        : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.18)" }
                    }
                  >
                    <Icon className="h-2.5 w-2.5" />
                  </span>
                );
              })}
            </div>
          </div>

          <Link
            href={w.href}
            className="mt-3 flex items-center gap-1 text-xs font-medium text-[var(--allpa-gold-300)] hover:underline"
          >
            Ver detalles
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      ))}
    </div>
  );
}
