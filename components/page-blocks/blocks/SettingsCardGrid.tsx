"use client";

import Link from "next/link";
import { ChevronRight, Clock } from "lucide-react";
import { resolveLucideIcon } from "@/lib/lucide-icon";

export interface SettingsLink {
  id: string;
  label: string;
  /** Sin destino, la fila se muestra como pendiente en vez de fingir que navega. */
  href?: string;
}

export interface SettingsCard {
  id: string;
  icon: string;
  /** Color del cuadro del icono, para distinguir las tarjetas de un vistazo. */
  color: string;
  title: string;
  description: string;
  links: SettingsLink[];
}

/**
 * Rejilla de tarjetas de configuración: cada una agrupa los ajustes de un
 * área con sus accesos.
 *
 * Las filas sin destino se pintan apagadas y con un reloj, igual que las
 * páginas «Próximamente» del menú: es preferible que se vea qué falta a que
 * un enlace no lleve a ninguna parte.
 */
export function SettingsCardGrid({ cards }: { cards: SettingsCard[] }) {
  if (cards.length === 0) {
    return <p className="py-6 text-center text-sm text-white/35">Sin configuraciones disponibles.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => {
        const Icon = resolveLucideIcon(card.icon);
        return (
          <div key={card.id} className="flex flex-col rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <span
              className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ background: `${card.color}1f`, color: card.color }}
            >
              <Icon className="h-5 w-5" />
            </span>

            <p className="font-semibold text-[#f3ecd9]">{card.title}</p>
            <p className="mt-1 mb-3 text-xs leading-relaxed text-white/45">{card.description}</p>

            <ul className="mt-auto divide-y divide-white/[0.06] border-t border-white/[0.06]">
              {card.links.map((link) =>
                link.href ? (
                  <li key={link.id}>
                    <Link
                      href={link.href}
                      className="flex items-center gap-2 py-2.5 text-sm text-white/70 transition-colors hover:text-[var(--allpa-gold-300)]"
                    >
                      <span className="min-w-0 flex-1 truncate">{link.label}</span>
                      <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 text-white/25" />
                    </Link>
                  </li>
                ) : (
                  <li
                    key={link.id}
                    title="Próximamente"
                    className="flex cursor-not-allowed items-center gap-2 py-2.5 text-sm text-white/30"
                  >
                    <span className="min-w-0 flex-1 truncate">{link.label}</span>
                    <Clock className="h-3 w-3 flex-shrink-0" />
                  </li>
                )
              )}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
