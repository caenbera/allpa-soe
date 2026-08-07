"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { resolveLucideIcon } from "@/lib/lucide-icon";

export interface NavTile {
  id: string;
  icon: string;
  color: string;
  title: string;
  /** Segunda línea: para qué sirve la categoría. */
  subtitle?: string;
  /** Tercera línea o cifra a la derecha, según la disposición. */
  meta?: string;
  href?: string;
  /** Resalta la baldosa activa. */
  active?: boolean;
}

/**
 * Baldosas de navegación: icono, título, subtítulo, cifra y chevron.
 *
 * Sirve en rejilla —las categorías de la biblioteca— y en columna —el
 * "explora por solución" del panel—, que es la razón de que exista en vez de
 * ampliar `QuickActionGrid`: aquella es una acción de una línea, esta es un
 * destino con contexto.
 */
export function NavTileGrid({
  tiles,
  columns = 3,
  onSelect,
}: {
  tiles: NavTile[];
  columns?: 1 | 2 | 3;
  onSelect?: (id: string) => void;
}) {
  if (tiles.length === 0) {
    return <p className="py-6 text-center text-sm text-white/35">No hay categorías que mostrar.</p>;
  }

  const gridClass =
    columns === 1 ? "grid-cols-1" : columns === 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3";

  return (
    <div className={`grid gap-2.5 ${gridClass}`}>
      {tiles.map((tile) => {
        const Icon = resolveLucideIcon(tile.icon);
        const inner = (
          <>
            <span
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg"
              style={{ background: `${tile.color}1f`, color: tile.color }}
            >
              <Icon className="h-4 w-4" />
            </span>

            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-[#f3ecd9]">{tile.title}</span>
              {tile.subtitle && <span className="block truncate text-xs text-white/40">{tile.subtitle}</span>}
              {tile.meta && columns > 1 && <span className="mt-0.5 block text-xs text-white/55">{tile.meta}</span>}
            </span>

            {tile.meta && columns === 1 && (
              <span className="flex-shrink-0 text-xs tabular-nums text-white/45">{tile.meta}</span>
            )}
            <ChevronRight className="h-4 w-4 flex-shrink-0 text-white/25 transition-colors group-hover:text-white/55" />
          </>
        );

        const clase = `group flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors ${
          tile.active
            ? "border-[var(--allpa-gold-400)]/40 bg-[var(--allpa-gold-400)]/[0.07]"
            : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05]"
        }`;

        return tile.href ? (
          <Link key={tile.id} href={tile.href} className={clase}>
            {inner}
          </Link>
        ) : (
          <button key={tile.id} type="button" onClick={() => onSelect?.(tile.id)} className={clase}>
            {inner}
          </button>
        );
      })}
    </div>
  );
}
