"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/store/auth";
import { firebaseReady } from "@/lib/firebase";
import { getPageConfig, savePageConfig, pageKeyFromPath, type PageConfig } from "@/lib/services/page-config";
import type { BlockInstance, BlockType } from "@/lib/block-types";
import type { MetaFieldState } from "@/components/page-blocks/MetaBar";

const NO_FIELDS: MetaFieldState[] = [];

/**
 * Personalización de una página (características de la barra superior y
 * bloques agregados por el administrador), persistida en Firestore.
 *
 * Sustituye a `useBlocksState`, que solo guardaba en memoria. Los cambios se
 * ven al instante y se escriben en segundo plano; si todavía no hay Firebase
 * configurado, sigue funcionando en memoria para poder previsualizar.
 */
export function usePageConfig(path: string, defaultMetaFields: MetaFieldState[] = NO_FIELDS) {
  const { companyId } = useAuthStore();
  const pageKey = pageKeyFromPath(path);

  // Lo leído de Firestore y lo editado en esta sesión se guardan por separado:
  // la edición manda, y el estado de carga se deriva en vez de almacenarse.
  const [fetched, setFetched] = useState<PageConfig | null>(null);
  const [localMeta, setLocalMeta] = useState<MetaFieldState[] | null>(null);
  const [localBlocks, setLocalBlocks] = useState<BlockInstance[] | null>(null);

  const ready = firebaseReady && Boolean(companyId);

  useEffect(() => {
    if (!ready || !companyId) return;
    let cancelled = false;
    getPageConfig(companyId, pageKey).then((cfg) => {
      if (!cancelled) setFetched(cfg);
    });
    return () => {
      cancelled = true;
    };
  }, [ready, companyId, pageKey]);

  const metaFields = localMeta ?? fetched?.metaFields ?? defaultMetaFields;
  const blocks = useMemo(() => localBlocks ?? fetched?.blocks ?? [], [localBlocks, fetched]);

  const persist = useCallback(
    (patch: Partial<PageConfig>) => {
      if (!ready || !companyId) return;
      savePageConfig(companyId, pageKey, patch).catch(() => undefined);
    },
    [ready, companyId, pageKey]
  );

  const updateMetaFields = useCallback(
    (next: MetaFieldState[]) => {
      setLocalMeta(next);
      persist({ metaFields: next });
    },
    [persist]
  );

  const commitBlocks = useCallback(
    (next: BlockInstance[]) => {
      setLocalBlocks(next);
      persist({ blocks: next });
    },
    [persist]
  );

  const addBlock = useCallback(
    ({ type, title, icon }: { type: BlockType; title: string; icon: string }) => {
      commitBlocks([...blocks, { id: `block-${Date.now()}`, type, title, icon, config: null }]);
    },
    [blocks, commitBlocks]
  );

  const updateBlock = useCallback(
    (id: string, patch: Partial<Pick<BlockInstance, "title" | "icon">>) => {
      commitBlocks(blocks.map((b) => (b.id === id ? { ...b, ...patch } : b)));
    },
    [blocks, commitBlocks]
  );

  const removeBlock = useCallback(
    (id: string) => {
      commitBlocks(blocks.filter((b) => b.id !== id));
    },
    [blocks, commitBlocks]
  );

  return {
    metaFields,
    updateMetaFields,
    blocks,
    addBlock,
    updateBlock,
    removeBlock,
    loading: ready && fetched === null,
  };
}
