"use client";

import { useState } from "react";
import { ChevronDown, GripVertical, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { resolveLucideIcon } from "@/lib/lucide-icon";
import { StatusBadge } from "@/components/page-blocks/StatusBadge";
import { PriorityFlag } from "@/components/page-blocks/PriorityFlag";
import { AvatarStack } from "@/components/page-blocks/AvatarStack";
import { ChecklistTable, type DemoChecklistItem } from "@/components/page-blocks/ChecklistTable";
import { RichTextEditor } from "@/components/page-blocks/RichTextEditor";
import { SectionEditDialog } from "@/components/page-blocks/SectionEditDialog";
import type { SectionPriority, SectionStatus } from "@/lib/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface AccordionSectionData {
  id: string;
  title: string;
  icon: string;
  status: SectionStatus;
  priority: SectionPriority;
  assignees: string[];
  checklist: DemoChecklistItem[];
  richContent: string;
}

/**
 * Sección tipo acordeón reutilizada en todas las páginas internas.
 * Empieza siempre cerrada; al abrir muestra el checklist arriba y el
 * editor enriquecido ("Desarrollo del bloque") siempre debajo — nunca
 * al lado, sin importar el ancho de pantalla.
 */
export function AccordionSection({ data: initialData, onDelete }: { data: AccordionSectionData; onDelete?: () => void }) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState(initialData);
  const [editOpen, setEditOpen] = useState(false);
  const Icon = resolveLucideIcon(data.icon);
  const doneCount = data.checklist.filter((i) => i.status === "completado").length;

  return (
    <div className="surface-card overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3">
        <GripVertical className="h-4 w-4 flex-shrink-0 cursor-grab text-white/20" />
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex flex-1 items-center gap-3 text-left"
        >
          <ChevronDown className={`h-4 w-4 flex-shrink-0 text-white/40 transition-transform ${open ? "rotate-0" : "-rotate-90"}`} />
          <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--allpa-gold-400)]/12 text-[var(--allpa-gold-300)]">
            {/* eslint-disable-next-line react-hooks/static-components -- selecciona un icono existente por nombre, no crea un componente nuevo */}
            <Icon className="h-4 w-4" />
          </span>
          <span className="font-semibold text-[#f3ecd9]">{data.title}</span>
          <span className="text-xs text-white/35">
            {doneCount}/{data.checklist.length}
          </span>
        </button>

        <div className="hidden items-center gap-3 sm:flex">
          <StatusBadge status={data.status} />
          <PriorityFlag priority={data.priority} />
          <AvatarStack names={data.assignees} onAdd={() => setEditOpen(true)} />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger className="text-white/30 transition-colors hover:text-white/60" aria-label="Opciones del bloque">
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={() => setEditOpen(true)}>
              <Pencil className="mr-2 h-3.5 w-3.5" />
              Editar bloque
            </DropdownMenuItem>
            {onDelete && (
              <DropdownMenuItem onClick={onDelete} className="text-red-500 focus:text-red-500">
                <Trash2 className="mr-2 h-3.5 w-3.5" />
                Eliminar bloque
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {open && (
        <div className="border-t border-white/[0.06] px-4 py-4">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-white/35">Checklist</p>
          <ChecklistTable
            items={data.checklist}
            onItemsChange={(updater) => setData((d) => ({ ...d, checklist: updater(d.checklist) }))}
          />

          <p className="mb-2 mt-6 text-[11px] font-semibold uppercase tracking-wide text-white/35">Desarrollo del bloque</p>
          <RichTextEditor content={data.richContent} />
        </div>
      )}

      {editOpen && (
        <SectionEditDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          initialValues={{ title: data.title, icon: data.icon, priority: data.priority, assignees: data.assignees }}
          onSave={(values) => setData((d) => ({ ...d, ...values }))}
        />
      )}
    </div>
  );
}

export function AddSectionButton({ onClick }: { onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/12 py-3 text-sm text-white/40 transition-colors hover:border-[var(--allpa-gold-400)]/50 hover:text-[var(--allpa-gold-300)]"
    >
      <Plus className="h-4 w-4" />
      Agregar nuevo bloque
    </button>
  );
}
