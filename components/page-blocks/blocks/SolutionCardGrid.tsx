"use client";

import Link from "next/link";
import { ArrowRight, Check, Users } from "lucide-react";
import { resolveLucideIcon } from "@/lib/lucide-icon";

export interface SolutionCardData {
  id: string;
  name: string;
  icon: string;
  color: string;
  /** Se muestra bajo el título; en el catálogo de planes, no en el dashboard. */
  description?: string;
  /** Las prestaciones, con su check del color de la tarjeta. */
  features: string[];
  /** Cifra del pie: familias o empresas que tienen el plan. */
  count: number;
  countLabel: string;
  href?: string;
  ctaLabel?: string;
  /** Numera la tarjeta ("1. Protección Familiar"), como el catálogo de planes. */
  index?: number;
}

/**
 * Las tarjetas del catálogo de soluciones.
 *
 * Se parece a `PillarCardGrid`, pero no lo reutiliza: aquella describe pilares
 * de contenido con su peso dentro del plan anual, y esta un producto con sus
 * prestaciones y una llamada a la acción. Fundirlas pedía media docena de
 * props opcionales y un modo, que es peor que dos bloques que se explican
 * solos.
 */
export function SolutionCardGrid({
  solutions,
  columns = 4,
  onOpen,
}: {
  solutions: SolutionCardData[];
  columns?: 2 | 3 | 4;
  onOpen?: (id: string) => void;
}) {
  if (solutions.length === 0) {
    return <p className="py-6 text-center text-sm text-white/35">Todavía no hay soluciones en el catálogo.</p>;
  }

  const gridClass =
    columns === 2
      ? "grid-cols-1 sm:grid-cols-2"
      : columns === 3
        ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
        : "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4";

  return (
    <div className={`grid gap-3 ${gridClass}`}>
      {solutions.map((s) => {
        const Icon = resolveLucideIcon(s.icon);
        const cta = s.ctaLabel ?? "Abrir Solución";
        const ctaInner = (
          <>
            {cta}
            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </>
        );

        return (
          <div
            key={s.id}
            className="flex flex-col rounded-xl border border-white/10 bg-white/[0.03] p-3.5 transition-colors hover:border-white/20"
          >
            <div className="mb-2.5 flex items-start gap-2.5">
              <span
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
                style={{ background: `${s.color}1f`, color: s.color }}
              >
                <Icon className="h-4.5 w-4.5" />
              </span>
              <h3 className="min-w-0 pt-0.5 text-sm font-semibold leading-snug text-[#f3ecd9]">
                {s.index != null && <span className="text-white/40">{s.index}. </span>}
                {s.name}
              </h3>
            </div>

            {s.description && <p className="mb-3 text-xs leading-relaxed text-white/45">{s.description}</p>}

            <ul className="mb-3.5 space-y-1.5">
              {s.features.map((f) => (
                <li key={f} className="flex items-start gap-1.5 text-xs text-white/65">
                  <Check className="mt-0.5 h-3 w-3 flex-shrink-0" style={{ color: s.color }} />
                  <span className="min-w-0">{f}</span>
                </li>
              ))}
            </ul>

            <div className="mt-auto flex items-center justify-between gap-2 border-t border-white/8 pt-3">
              <span className="flex min-w-0 items-baseline gap-1.5">
                <Users className="h-3.5 w-3.5 flex-shrink-0 self-center text-white/30" />
                <span className="text-sm font-semibold tabular-nums text-[#f3ecd9]">{s.count}</span>
                <span className="truncate text-[11px] text-white/40">{s.countLabel}</span>
              </span>

              {s.href ? (
                <Link
                  href={s.href}
                  className="flex flex-shrink-0 items-center rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors"
                  style={{ borderColor: `${s.color}59`, color: s.color }}
                >
                  {ctaInner}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => onOpen?.(s.id)}
                  className="flex flex-shrink-0 items-center rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors"
                  style={{ borderColor: `${s.color}59`, color: s.color }}
                >
                  {ctaInner}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
