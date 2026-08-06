"use client";

import { useCallback, useState } from "react";
import type { NewBlockInput } from "@/components/page-blocks/AddBlockDialog";
import { DEFAULT_PLACEMENT, type BlockPlacement } from "@/lib/block-types";

/**
 * Estado compartido entre las dos ranuras de bloques y el diálogo de agregar.
 *
 * Recuerda desde qué ranura se abrió el diálogo para preseleccionar ahí la
 * ubicación, sin quitarle al usuario la opción de cambiarla antes de confirmar.
 */
export function useBlockComposer(addBlock: (input: NewBlockInput) => void) {
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState<BlockPlacement>(DEFAULT_PLACEMENT);

  const openFor = useCallback((next: BlockPlacement) => {
    setPlacement(next);
    setOpen(true);
  }, []);

  return {
    openFor,
    dialogProps: {
      open,
      onOpenChange: setOpen,
      placement,
      onPlacementChange: setPlacement,
      onCreate: addBlock,
    },
  };
}
