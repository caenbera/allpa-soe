"use client";

import { Check, Plus } from "lucide-react";
import { resolveLucideIcon } from "@/lib/lucide-icon";
import { Badge } from "@/components/ui/badge";
import type { BadgeTone } from "@/components/page-blocks/blocks/DataTable";

const TIER_CLASS: Record<string, string> = {
  violet: "border-violet-400/30 bg-violet-400/10 text-violet-300",
  emerald: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  amber: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  blue: "border-blue-400/30 bg-blue-400/10 text-blue-300",
  rose: "border-rose-400/30 bg-rose-400/10 text-rose-300",
  gold: "border-[var(--allpa-gold-400)]/30 bg-[var(--allpa-gold-400)]/10 text-[var(--allpa-gold-300)]",
  neutral: "border-white/12 bg-white/[0.04] text-white/55",
};

export interface ComponentPick {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  /** Esencial, Recomendado, Opcional. */
  tier: string;
  tierTone: BadgeTone;
  /** Etiqueta de la columna derecha: "Cobertura", "Meta", "Estado". */
  valueLabel: string;
  /** Importe o texto; sin él solo se muestra el estado. */
  value?: string;
  /** Ya forma parte del plan: se marca como incluido en vez de ofrecer agregar. */
  included: boolean;
  /** Texto del estado cuando no está incluido ("No incluido", "Programado"). */
  statusLabel?: string;
}

/**
 * Los componentes recomendados de una solución: qué son, cuánto cubren y si
 * ya están dentro del plan.
 *
 * Es distinto de `FileList` o `AssetProgressGrid` en algo que importa: la
 * columna derecha decide entre una acción y un estado, y ese es el punto de
 * la pantalla —qué falta por incorporar.
 */
export function ComponentPickList({
  items,
  onAdd,
  onSelect,
}: {
  items: ComponentPick[];
  /** Sin este manejador, los no incluidos solo muestran su estado. */
  onAdd?: (id: string) => void;
  onSelect?: (id: string) => void;
}) {
  if (items.length === 0) {
    return <p className="py-6 text-center text-sm text-white/35">Este plan todavía no tiene componentes.</p>;
  }

  return (
    <ul className="space-y-2">
      {items.map((item) => {
        const Icon = resolveLucideIcon(item.icon);
        return (
          <li
            key={item.id}
            className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3 transition-colors hover:border-white/20"
          >
            <span
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg"
              style={{ background: `${item.color}1f`, color: item.color }}
            >
              <Icon className="h-4 w-4" />
            </span>

            <div className="min-w-0 flex-1">
              <p className="flex flex-wrap items-center gap-2">
                {onSelect ? (
                  <button
                    type="button"
                    onClick={() => onSelect(item.id)}
                    className="text-left text-sm font-medium text-[#f3ecd9] hover:underline"
                  >
                    {item.name}
                  </button>
                ) : (
                  <span className="text-sm font-medium text-[#f3ecd9]">{item.name}</span>
                )}
                <Badge className={`border ${TIER_CLASS[item.tierTone] ?? TIER_CLASS.neutral}`}>{item.tier}</Badge>
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-white/45">{item.description}</p>
            </div>

            <div className="flex flex-shrink-0 flex-col items-end gap-1 text-right">
              <span className="text-[11px] text-white/35">{item.valueLabel}</span>
              {item.value && <span className="text-sm font-semibold text-[#f3ecd9]">{item.value}</span>}

              {item.included ? (
                <span className="flex items-center gap-1 text-xs text-emerald-300">
                  <Check className="h-3 w-3" />
                  Incluido
                </span>
              ) : onAdd ? (
                <button
                  type="button"
                  onClick={() => onAdd(item.id)}
                  className="flex items-center gap-1 rounded-lg border border-white/12 bg-white/[0.04] px-2 py-1 text-xs text-white/70 transition-colors hover:border-[var(--allpa-gold-400)]/40 hover:text-white"
                >
                  <Plus className="h-3 w-3" />
                  Agregar
                </button>
              ) : (
                <span className="text-xs text-white/45">{item.statusLabel ?? "No incluido"}</span>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
