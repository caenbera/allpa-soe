"use client";

import { useState } from "react";
import { BlockFrame } from "@/components/page-blocks/BlockFrame";
import { EditBlockDialog } from "@/components/page-blocks/EditBlockDialog";
import { blockRegistry } from "@/components/page-blocks/block-registry";
import type { BlockInstance } from "@/lib/block-types";

/**
 * Renderiza un bloque dentro de su marco, con el diálogo de edición ya
 * cableado. Las páginas solo declaran la lista de bloques y este componente
 * se encarga del resto.
 */
export function BlockRenderer({
  block,
  onUpdate,
  onDelete,
}: {
  block: BlockInstance;
  onUpdate?: (patch: { title: string; icon: string }) => void;
  onDelete?: () => void;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const entry = blockRegistry[block.type];

  const body = entry ? (
    entry.render(block)
  ) : (
    <p className="py-6 text-center text-sm text-white/35">Este tipo de bloque aún no está disponible.</p>
  );

  return (
    <>
      <BlockFrame
        title={block.title}
        icon={block.icon}
        bare={block.bare ?? entry?.bare}
        padded={entry?.padded ?? true}
        onEdit={onUpdate ? () => setEditOpen(true) : undefined}
        onDelete={onDelete}
      >
        {body}
      </BlockFrame>

      {editOpen && onUpdate && (
        <EditBlockDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          initialTitle={block.title}
          initialIcon={block.icon}
          onSave={onUpdate}
        />
      )}
    </>
  );
}
