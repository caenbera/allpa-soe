"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ExternalLink, Plus, X } from "lucide-react";
import { resolveLucideIcon } from "@/lib/lucide-icon";
import { ScoreRing } from "@/components/page-blocks/blocks/ScoreRing";
import { Button } from "@/components/ui/button";
import type { BadgeTone } from "@/components/page-blocks/blocks/DataTable";

const TONES: Record<BadgeTone, string> = {
  gold: "bg-[var(--allpa-gold-400)]/12 text-[var(--allpa-gold-300)]",
  emerald: "bg-emerald-400/12 text-emerald-300",
  amber: "bg-amber-400/12 text-amber-300",
  blue: "bg-blue-400/12 text-blue-300",
  violet: "bg-violet-400/12 text-violet-300",
  rose: "bg-rose-400/12 text-rose-300",
  neutral: "bg-white/8 text-white/65",
};

export interface DrawerSection {
  id: string;
  title: string;
  /** Se pliega por defecto salvo que se marque como abierta. */
  defaultOpen?: boolean;
  content: React.ReactNode;
  /** En vez de plegarse, muestra un botón de agregar. */
  addAction?: () => void;
}

export interface DetailDrawerData {
  name: string;
  subtitle?: string;
  fields: { icon: string; value: string }[];
  actions: { icon: string; label: string }[];
  statusLabel?: string;
  statusTone?: BadgeTone;
  score?: number;
  ctaLabel?: string;
  ctaHref?: string;
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

function Section({ section }: { section: DrawerSection }) {
  const [open, setOpen] = useState(section.defaultOpen ?? false);

  if (section.addAction) {
    return (
      <div className="flex items-center justify-between border-t border-white/[0.06] py-2.5">
        <span className="text-sm text-white/70">{section.title}</span>
        <button
          type="button"
          onClick={section.addAction}
          aria-label={`Agregar en ${section.title}`}
          className="text-white/35 transition-colors hover:text-[var(--allpa-gold-300)]"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="border-t border-white/[0.06]">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between py-2.5 text-left text-sm text-white/70 transition-colors hover:text-white/95"
      >
        {section.title}
        <ChevronDown className={`h-4 w-4 flex-shrink-0 text-white/30 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="pb-3">{section.content}</div>}
    </div>
  );
}

/**
 * Panel lateral con la ficha resumida de un registro: datos de contacto,
 * acciones rápidas, estado y secciones plegables. Se abre desde una tabla
 * sin salir de la página.
 */
export function DetailDrawer({
  data,
  sections,
  onClose,
}: {
  data: DetailDrawerData;
  sections: DrawerSection[];
  onClose?: () => void;
}) {
  return (
    <div className="surface-card p-4">
      <div className="mb-3 flex items-start gap-3">
        <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#f5da93] to-[#a9760f] text-sm font-bold text-[#241a05]">
          {initialsOf(data.name)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-semibold text-[#f3ecd9]">{data.name}</span>
          {data.subtitle && <span className="block truncate text-sm text-white/45">{data.subtitle}</span>}
        </span>
        {onClose && (
          <button type="button" onClick={onClose} aria-label="Cerrar panel" className="text-white/30 hover:text-white/70">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <ul className="mb-3 space-y-1.5">
        {data.fields.map((field) => {
          const Icon = resolveLucideIcon(field.icon);
          return (
            <li key={field.value} className="flex items-center gap-2 text-sm text-white/60">
              <Icon className="h-3.5 w-3.5 flex-shrink-0 text-white/30" />
              <span className="min-w-0 truncate">{field.value}</span>
            </li>
          );
        })}
      </ul>

      {data.actions.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          {data.actions.map((action) => {
            const Icon = resolveLucideIcon(action.icon);
            return (
              <button
                key={action.label}
                type="button"
                aria-label={action.label}
                title={action.label}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-white/50 transition-colors hover:border-[var(--allpa-gold-400)]/40 hover:text-[var(--allpa-gold-300)]"
              >
                <Icon className="h-3.5 w-3.5" />
              </button>
            );
          })}
        </div>
      )}

      {(data.statusLabel || data.score != null) && (
        <div className="mb-3 flex items-end justify-between gap-3 border-t border-white/[0.06] pt-3">
          {data.statusLabel && (
            <span>
              <span className="block text-[11px] uppercase tracking-wide text-white/35">Estado</span>
              <span className={`mt-1 inline-block rounded-full px-2.5 py-1 text-xs font-medium ${TONES[data.statusTone ?? "neutral"]}`}>
                {data.statusLabel}
              </span>
            </span>
          )}
          {data.score != null && (
            <span className="text-right">
              <span className="block text-[11px] uppercase tracking-wide text-white/35">Puntaje</span>
              <span className="mt-1 inline-block">
                <ScoreRing value={data.score} size={38} />
              </span>
            </span>
          )}
        </div>
      )}

      <div>
        {sections.map((section) => (
          <Section key={section.id} section={section} />
        ))}
      </div>

      {data.ctaLabel &&
        (data.ctaHref ? (
          <Link
            href={data.ctaHref}
            className="mt-4 flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-gradient-to-b from-[#f5da93] to-[#c98f1f] text-sm font-semibold text-[#241a05] transition-all hover:brightness-105"
          >
            {data.ctaLabel}
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        ) : (
          <Button className="mt-4 w-full border-0 bg-gradient-to-b from-[#f5da93] to-[#c98f1f] font-semibold text-[#241a05] hover:brightness-105">
            {data.ctaLabel}
          </Button>
        ))}
    </div>
  );
}
