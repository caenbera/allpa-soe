"use client";

import Link from "next/link";
import { resolveLucideIcon } from "@/lib/lucide-icon";

export interface QuickAction {
  id: string;
  icon: string;
  label: string;
  /** Si lleva destino se navega; si no, se avisa al padre con `onSelect`. */
  href?: string;
}

/**
 * Rejilla de atajos de un panel lateral: "Acciones rápidas".
 *
 * Las etiquetas suelen ser de dos palabras, así que van a dos líneas centradas
 * bajo el icono en vez de truncarse.
 */
export function QuickActionGrid({
  actions,
  columns = 4,
  onSelect,
}: {
  actions: QuickAction[];
  columns?: 2 | 3 | 4;
  onSelect?: (id: string) => void;
}) {
  if (actions.length === 0) {
    return <p className="py-4 text-center text-sm text-white/35">Sin acciones disponibles.</p>;
  }

  const gridClass = columns === 2 ? "grid-cols-2" : columns === 3 ? "grid-cols-3" : "grid-cols-2 sm:grid-cols-4";
  const inner = "flex h-full flex-col items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.02] px-2 py-3 text-center transition-colors hover:border-[var(--allpa-gold-400)]/40 hover:bg-white/[0.05]";

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
