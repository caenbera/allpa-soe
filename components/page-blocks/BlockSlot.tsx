"use client";

import { Plus } from "lucide-react";
import { BlockRenderer } from "@/components/page-blocks/BlockRenderer";
import { DEFAULT_PLACEMENT, type BlockInstance, type BlockPlacement } from "@/lib/block-types";

export interface BlockSlotProps {
  items: BlockInstance[];
  onUpdate: (id: string, patch: { title: string; icon: string }) => void;
  onDelete: (id: string) => void;
  onAdd: (placement: BlockPlacement) => void;
}

/**
 * Una de las dos zonas donde el administrador puede colocar bloques: el cuerpo
 * de la página o el panel lateral.
 *
 * Cada ranura pinta los bloques que le tocan y su propio botón de agregar, así
 * que basta con pulsar el botón de la zona donde se quiere el bloque. El
 * selector del diálogo permite además cambiarlo antes de confirmar.
 */
export function BlockSlot({ placement, items, onUpdate, onDelete, onAdd }: BlockSlotProps & { placement: BlockPlacement }) {
  const mine = items.filter((b) => (b.placement ?? DEFAULT_PLACEMENT) === placement);

  return (
    <>
      {mine.map((block) => (
        <BlockRenderer
          key={block.id}
          block={block}
          onUpdate={(patch) => onUpdate(block.id, patch)}
          onDelete={() => onDelete(block.id)}
        />
      ))}

      <button
        type="button"
        onClick={() => onAdd(placement)}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/12 py-3 text-sm text-white/40 transition-colors hover:border-[var(--allpa-gold-400)]/50 hover:text-[var(--allpa-gold-300)]"
      >
        <Plus className="h-4 w-4" />
        {placement === "main" ? "Agregar bloque al cuerpo" : "Agregar bloque al panel"}
      </button>
    </>
  );
}
