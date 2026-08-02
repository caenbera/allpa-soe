"use client";

import { useState } from "react";
import type { BlockInstance, BlockType } from "@/lib/block-types";

export interface NewBlockInput {
  type: BlockType;
  title: string;
  icon: string;
}

/**
 * Estado local (por página) de la lista de bloques: crear, editar y eliminar.
 * Hermano de `useSectionsState` (lib/use-sections.ts), que hace lo mismo para
 * los bloques tipo acordeón de las páginas de Marketing.
 */
export function useBlocksState(initial: BlockInstance[]) {
  const [blocks, setBlocks] = useState<BlockInstance[]>(initial);

  const addBlock = ({ type, title, icon }: NewBlockInput) => {
    setBlocks((list) => [...list, { id: `block-${Date.now()}`, type, title, icon, config: null }]);
  };

  const updateBlock = (id: string, patch: Partial<Pick<BlockInstance, "title" | "icon">>) => {
    setBlocks((list) => list.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  };

  const removeBlock = (id: string) => {
    setBlocks((list) => list.filter((b) => b.id !== id));
  };

  return { blocks, addBlock, updateBlock, removeBlock };
}
