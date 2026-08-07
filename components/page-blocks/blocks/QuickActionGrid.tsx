"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { resolveLucideIcon } from "@/lib/lucide-icon";

export interface QuickAction {
  id: string;
  icon: string;
  label: string;
  /** Si lleva destino se navega; si no, se avisa al padre con `onSelect`. */
  href?: string;
  /** Segunda línea, solo en `layout="list"`. */
  sub?: string;
  /** Cifra alineada a la derecha, solo en `layout="list"`. */
  meta?: string;
}

/**
 * Atajos de un panel lateral: "Acciones rápidas".
 *
 * Dos formas, porque las pantallas usan las dos:
 *  - `grid`: icono arriba y etiqueta debajo, centrado. Las etiquetas suelen
 *    ser de dos palabras, así que van a dos líneas en vez de truncarse.
 *  - `list`: una fila por acción, con icono a la izquierda y chevron a la
 *    derecha. Admite subtítulo y cifra, y es la que aparece en la mayoría de
 *    los paneles de Soluciones.
 */
export function QuickActionGrid({
  actions,
  columns = 4,
  layout = "grid",
  onSelect,
}: {
  actions: QuickAction[];
  columns?: 1 | 2 | 3 | 4;
  layout?: "grid" | "list";
  onSelect?: (id: string) => void;
}) {
  if (actions.length === 0) {
    return <p className="py-4 text-center text-sm text-white/35">Sin acciones disponibles.</p>;
  }

  if (layout === "list") {
    const gridClass =
      columns === 1 ? "grid-cols-1" : columns === 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3";
    const row =
      "group flex w-full items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2.5 text-left transition-colors hover:border-[var(--allpa-gold-400)]/40 hover:bg-white/[0.05]";

    return (
      <div className={`grid gap-2 ${gridClass}`}>
        {actions.map((action) => {
          const Icon = resolveLucideIcon(action.icon);
          const content = (
            <>
              <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-white/[0.05] text-[var(--allpa-gold-300)]">
                <Icon className="h-3.5 w-3.5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm text-white/70">{action.label}</span>
                {action.sub && <span className="block truncate text-xs text-white/35">{action.sub}</span>}
              </span>
              {action.meta && <span className="flex-shrink-0 text-xs tabular-nums text-white/45">{action.meta}</span>}
              <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 text-white/25 transition-colors group-hover:text-white/50" />
            </>
          );

          return action.href ? (
            <Link key={action.id} href={action.href} className={row}>
              {content}
            </Link>
          ) : (
            <button key={action.id} type="button" onClick={() => onSelect?.(action.id)} className={row}>
              {content}
            </button>
          );
        })}
      </div>
    );
  }

  const gridClass =
    columns === 1 ? "grid-cols-1" : columns === 2 ? "grid-cols-2" : columns === 3 ? "grid-cols-3" : "grid-cols-2 sm:grid-cols-4";
  const inner =
    "flex h-full flex-col items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.02] px-2 py-3 text-center transition-colors hover:border-[var(--allpa-gold-400)]/40 hover:bg-white/[0.05]";

  return (
    <div className={`grid gap-2 ${gridClass}`}>
      {actions.map((action) => {
        const Icon = resolveLucideIcon(action.icon);
        const content = (
          <>
            <Icon className="h-4 w-4 flex-shrink-0 text-[var(--allpa-gold-300)]" />
            <span className="text-[11px] leading-tight text-white/60">{action.label}</span>
          </>
        );

        return action.href ? (
          <Link key={action.id} href={action.href} className={inner}>
            {content}
          </Link>
        ) : (
          <button key={action.id} type="button" onClick={() => onSelect?.(action.id)} className={inner}>
            {content}
          </button>
        );
      })}
    </div>
  );
}
