"use client";

import { useState } from "react";
import { Star, Share2, Download, MoreHorizontal, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/page-blocks/StatusBadge";
import { resolveLucideIcon } from "@/lib/lucide-icon";
import type { SectionStatus } from "@/lib/types";

export function PageShell({
  title,
  description,
  icon,
  status,
  starrable = true,
  headerActions,
  headerAside,
  sidePanel,
  onNewBlock,
  newBlockLabel = "Nuevo Bloque",
  children,
}: {
  title: string;
  description?: string;
  /** Nombre de icono lucide mostrado junto al título. */
  icon?: string;
  status?: SectionStatus;
  starrable?: boolean;
  /** Sustituye los botones por defecto del encabezado. */
  headerActions?: React.ReactNode;
  /** Tira de datos a la derecha del título (responsable, fechas, etc.). */
  headerAside?: React.ReactNode;
  sidePanel?: React.ReactNode;
  onNewBlock?: () => void;
  newBlockLabel?: string;
  children: React.ReactNode;
}) {
  const [starred, setStarred] = useState(false);
  const Icon = icon ? resolveLucideIcon(icon) : null;

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            {starrable && (
              <button type="button" onClick={() => setStarred((s) => !s)} aria-label="Favorito">
                <Star className={`h-5 w-5 ${starred ? "fill-[var(--allpa-gold-400)] text-[var(--allpa-gold-400)]" : "text-white/25"}`} />
              </button>
            )}
            {Icon && (
              <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-[var(--allpa-gold-400)]/12 text-[var(--allpa-gold-300)]">
                {/* eslint-disable-next-line react-hooks/static-components -- selecciona un icono existente por nombre, no crea un componente nuevo */}
                <Icon className="h-5 w-5" />
              </span>
            )}
            <h1 className="font-serif text-2xl font-semibold text-[#f3ecd9] sm:text-3xl">{title}</h1>
            {status && <StatusBadge status={status} />}
          </div>
          {description && <p className="mt-1.5 max-w-2xl text-sm text-white/50">{description}</p>}
        </div>

        <div className="flex flex-shrink-0 items-center gap-2">
          {headerActions ?? (
            <>
              <Button variant="outline" size="sm" className="border-white/12 bg-white/[0.03] text-white/70 hover:bg-white/[0.06]">
                <Share2 className="mr-1.5 h-3.5 w-3.5" />
                Compartir
              </Button>
              <Button variant="outline" size="sm" className="border-white/12 bg-white/[0.03] text-white/70 hover:bg-white/[0.06]">
                <Download className="mr-1.5 h-3.5 w-3.5" />
                Exportar
              </Button>
              <Button variant="outline" size="icon" className="h-9 w-9 border-white/12 bg-white/[0.03] text-white/70 hover:bg-white/[0.06]">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
              {onNewBlock && (
                <Button
                  onClick={onNewBlock}
                  className="border-0 bg-gradient-to-b from-[#f5da93] to-[#c98f1f] font-semibold text-[#241a05] hover:brightness-105"
                >
                  <Plus className="mr-1.5 h-4 w-4" />
                  {newBlockLabel}
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {headerAside && <div className="mb-5">{headerAside}</div>}

      <div className={sidePanel ? "grid grid-cols-1 gap-6 xl:grid-cols-[1fr_340px]" : ""}>
        <div className="min-w-0 space-y-3">{children}</div>
        {sidePanel && <div className="space-y-4">{sidePanel}</div>}
      </div>
    </div>
  );
}

export function StatCard({ label, value, trend }: { label: string; value: string; trend?: string }) {
  return (
    <div className="surface-card px-4 py-3">
      <p className="text-[11px] uppercase tracking-wide text-white/35">{label}</p>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-lg font-semibold text-[#f3ecd9]">{value}</span>
        {trend && <span className="text-xs font-medium text-emerald-400">{trend}</span>}
      </div>
    </div>
  );
}

/** Barra de pestañas reutilizada en las páginas con secciones internas. */
export function PageTabs({
  tabs,
  active,
  onChange,
}: {
  tabs: { value: string; label: string; icon?: string }[];
  active: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="mb-5 flex flex-wrap gap-1 border-b border-white/[0.06]">
      {tabs.map((tab) => {
        const TabIcon = tab.icon ? resolveLucideIcon(tab.icon) : null;
        const isActive = active === tab.value;
        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={`-mb-px flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm transition-colors ${
              isActive
                ? "border-[var(--allpa-gold-400)] font-semibold text-[var(--allpa-gold-300)]"
                : "border-transparent text-white/50 hover:text-white/80"
            }`}
          >
            {TabIcon && <TabIcon className="h-3.5 w-3.5" />}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
