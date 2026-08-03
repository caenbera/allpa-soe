"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuthStore } from "@/store/auth";
import { firebaseReady } from "@/lib/firebase";
import { getPageConfig, savePageConfig, pageKeyFromPath, type PageConfig } from "@/lib/services/page-config";
import type { BlockInstance, BlockType } from "@/lib/block-types";
import type { MetaFieldState } from "@/components/page-blocks/MetaBar";
import type { AccordionSectionData } from "@/components/page-blocks/AccordionSection";
import type { SectionPriority } from "@/lib/types";

const NO_FIELDS: MetaFieldState[] = [];
const NO_SECTIONS: AccordionSectionData[] = [];

/** Ventana de agrupado de escrituras; evita una escritura por tecla en el editor. */
const PERSIST_DELAY_MS = 700;

export interface NewSectionInput {
  title: string;
  icon: string;
  priority: SectionPriority;
}

/**
 * Personalización de una página persistida en Firestore: características de
 * la barra superior, bloques agregados y secciones tipo acordeón con sus
 * checklists y notas.
 *
 * Los cambios se ven al instante y se escriben agrupados en segundo plano.
 * Sin Firebase configurado sigue funcionando en memoria para previsualizar.
 */
export function usePageConfig(
  path: string,
  defaultMetaFields: MetaFieldState[] = NO_FIELDS,
  defaultSections: AccordionSectionData[] = NO_SECTIONS
) {
  const { companyId } = useAuthStore();
  const pageKey = pageKeyFromPath(path);

  // Lo leído de Firestore y lo editado en esta sesión se guardan por separado:
  // la edición manda, y el estado de carga se deriva en vez de almacenarse.
  const [fetched, setFetched] = useState<PageConfig | null>(null);
  const [localMeta, setLocalMeta] = useState<MetaFieldState[] | null>(null);
  const [localBlocks, setLocalBlocks] = useState<BlockInstance[] | null>(null);
  const [localSections, setLocalSections] = useState<AccordionSectionData[] | null>(null);

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
  const sections = useMemo(
    () => localSections ?? fetched?.sections ?? defaultSections,
    // `defaultSections` es una constante por página.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [localSections, fetched]
  );

  // Escritura agrupada: se acumulan los cambios y se envían juntos.
  const pendingRef = useRef<Partial<PageConfig>>({});
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // El destino de escritura se guarda en una ref para que `flush` siga siendo
  // estable y pueda ejecutarse también al desmontar.
  const targetRef = useRef({ companyId, pageKey, ready });
  useEffect(() => {
    targetRef.current = { companyId, pageKey, ready };
  }, [companyId, pageKey, ready]);

  const flush = useCallback(() => {
    const { companyId: cid, pageKey: key, ready: isReady } = targetRef.current;
    const patch = pendingRef.current;
    pendingRef.current = {};
    if (!isReady || !cid || Object.keys(patch).length === 0) return;
    savePageConfig(cid, key, patch).catch(() => undefined);
  }, []);

  const persist = useCallback(
    (patch: Partial<PageConfig>) => {
      if (!targetRef.current.ready) return;
      Object.assign(pendingRef.current, patch);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(flush, PERSIST_DELAY_MS);
    },
    [flush]
  );

  // Al salir de la página se envía lo que quede pendiente.
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      flush();
    };
  }, [flush]);

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

  const commitSections = useCallback(
    (next: AccordionSectionData[]) => {
      setLocalSections(next);
      persist({ sections: next });
    },
    [persist]
  );

  const addSection = useCallback(
    ({ title, icon, priority }: NewSectionInput) => {
      commitSections([
        ...sections,
        {
          id: `section-${Date.now()}`,
          title,
          icon,
          priority,
          status: "pendiente",
          assignees: [],
          checklist: [],
          richContent: "",
        },
      ]);
    },
    [sections, commitSections]
  );

  const updateSection = useCallback(
    (id: string, patch: Partial<AccordionSectionData>) => {
      commitSections(sections.map((s) => (s.id === id ? { ...s, ...patch } : s)));
    },
    [sections, commitSections]
  );

  const removeSection = useCallback(
    (id: string) => {
      commitSections(sections.filter((s) => s.id !== id));
    },
    [sections, commitSections]
  );

  return {
    metaFields,
    updateMetaFields,
    blocks,
    addBlock,
    updateBlock,
    removeBlock,
    sections,
    addSection,
    updateSection,
    removeSection,
    loading: ready && fetched === null,
  };
}
