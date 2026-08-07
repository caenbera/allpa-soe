"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Users } from "lucide-react";
import { resolveLucideIcon } from "@/lib/lucide-icon";
import { Badge } from "@/components/ui/badge";

export interface MediaCardData {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  /** Etiqueta de la cabecera ("Más utilizado", "Guía", "Video"). */
  ribbon?: string;
  /** Etiqueta bajo el título: segmento, categoría… */
  tag?: string;
  /** Pie izquierdo: familias, descargas, reproducciones. */
  countLabel?: string;
  /** Pie derecho: porcentaje completado o duración. */
  metaLabel?: string;
  href?: string;
  linkLabel?: string;
}

/**
 * Tarjetas con cabecera visual: casos de uso y recursos destacados.
 *
 * La cabecera es un degradado con el icono del elemento, no una fotografía:
 * la plataforma no tiene banco de imágenes y un hueco gris se vería peor.
 * Cuando lleguen las fotos, se cambia aquí y todas las pantallas que usan el
 * bloque las heredan.
 */
export function MediaCardGrid({
  cards,
  columns = 4,
  onSelect,
}: {
  cards: MediaCardData[];
  columns?: 2 | 3 | 4;
  onSelect?: (id: string) => void;
}) {
  if (cards.length === 0) {
    return <p className="py-6 text-center text-sm text-white/35">No hay nada que mostrar todavía.</p>;
  }

  const gridClass =
    columns === 2
      ? "grid-cols-1 sm:grid-cols-2"
      : columns === 3
        ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
        : "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4";

  return (
    <div className={`grid gap-3 ${gridClass}`}>
      {cards.map((card) => {
        const Icon = resolveLucideIcon(card.icon);
        return (
          <div
            key={card.id}
            className="flex flex-col overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] transition-colors hover:border-white/20"
          >
            <div
              className="relative flex h-24 items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${card.color}33, ${card.color}0d)` }}
            >
              <Icon className="h-8 w-8" style={{ color: card.color }} />
              {card.ribbon && (
                <span className="absolute left-2.5 top-2.5 rounded-md bg-black/45 px-2 py-0.5 text-[10px] font-medium text-white/85 backdrop-blur-sm">
                  {card.ribbon}
                </span>
              )}
            </div>

            <div className="flex flex-1 flex-col p-3">
              <h3 className="text-sm font-semibold leading-snug text-[#f3ecd9]">{card.title}</h3>

              {card.tag && (
                <Badge
                  className="mt-1.5 w-fit border"
                  style={{ borderColor: `${card.color}40`, background: `${card.color}14`, color: card.color }}
                >
                  {card.tag}
                </Badge>
              )}

              <p className="mt-2 text-xs leading-relaxed text-white/45">{card.description}</p>

              <div className="mt-auto pt-3">
                {(card.countLabel || card.metaLabel) && (
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-white/45">
                    {card.countLabel && (
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {card.countLabel}
                      </span>
                    )}
                    {card.metaLabel && (
                      <span className="flex items-center gap-1 text-emerald-300">
                        <CheckCircle2 className="h-3 w-3" />
                        {card.metaLabel}
                      </span>
                    )}
                  </div>
                )}

                {card.href ? (
                  <Link
                    href={card.href}
                    className="mt-2 flex items-center gap-1 text-xs font-medium"
                    style={{ color: card.color }}
                  >
                    {card.linkLabel ?? "Ver más"}
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                ) : onSelect ? (
                  <button
                    type="button"
                    onClick={() => onSelect(card.id)}
                    className="mt-2 flex items-center gap-1 text-xs font-medium"
                    style={{ color: card.color }}
                  >
                    {card.linkLabel ?? "Ver más"}
                    <ArrowRight className="h-3 w-3" />
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
