"use client";

import { useState } from "react";
import { Star, Share2, Download, MoreHorizontal, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/page-blocks/StatusBadge";
import type { SectionStatus } from "@/lib/types";

export function PageShell({
  title,
  description,
  status,
  sidePanel,
  children,
}: {
  title: string;
  description: string;
  status: SectionStatus;
  sidePanel?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [starred, setStarred] = useState(false);

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <button type="button" onClick={() => setStarred((s) => !s)} aria-label="Favorito">
              <Star className={`h-5 w-5 ${starred ? "fill-[var(--allpa-gold-400)] text-[var(--allpa-gold-400)]" : "text-white/25"}`} />
            </button>
            <h1 className="font-serif text-2xl font-semibold text-[#f3ecd9] sm:text-3xl">{title}</h1>
            <StatusBadge status={status} />
          </div>
          <p className="mt-1.5 max-w-2xl text-sm text-white/50">{description}</p>
        </div>

        <div className="flex flex-shrink-0 items-center gap-2">
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
          <Button className="border-0 bg-gradient-to-b from-[#f5da93] to-[#c98f1f] font-semibold text-[#241a05] hover:brightness-105">
            <Plus className="mr-1.5 h-4 w-4" />
            Nuevo Bloque
          </Button>
        </div>
      </div>

      <div className={sidePanel ? "grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]" : ""}>
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
