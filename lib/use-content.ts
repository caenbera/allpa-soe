"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth";
import { firebaseReady } from "@/lib/firebase";
import { listContent, createContent, updateContent, deleteContent } from "@/lib/services/content";
import type { CompanyCollection } from "@/lib/services/content";

export interface ContentState<T> {
  items: T[];
  loading: boolean;
  /** Sin Firebase configurado o sin empresa: la página muestra el estado vacío. */
  unavailable: boolean;
  reload: () => void;
  add: (data: Omit<T, "id">) => Promise<void>;
  update: (id: string, patch: Partial<T>) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

/** Lee una colección del módulo Contenido de la empresa activa. */
export function useContent<T extends { id: string }>(name: CompanyCollection): ContentState<T> {
  const { companyId } = useAuthStore();
  // `null` = todavía no se ha leído; así el estado de carga se deriva en vez
  // de guardarse, y el efecto no llama a setState de forma síncrona.
  const [fetched, setFetched] = useState<T[] | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const ready = firebaseReady && Boolean(companyId);

  useEffect(() => {
    if (!ready || !companyId) return;
    let cancelled = false;
    listContent<T>(companyId, name).then((data) => {
      if (!cancelled) setFetched(data);
    });
    return () => {
      cancelled = true;
    };
  }, [ready, companyId, name, refreshKey]);

  const reload = useCallback(() => setRefreshKey((k) => k + 1), []);

  const add = useCallback(
    async (data: Omit<T, "id">) => {
      if (!companyId) return;
      await createContent(companyId, name, data as object);
      reload();
    },
    [companyId, name, reload]
  );

  const update = useCallback(
    async (id: string, patch: Partial<T>) => {
      if (!companyId) return;
      setFetched((list) => (list ? list.map((it) => (it.id === id ? { ...it, ...patch } : it)) : list));
      await updateContent(companyId, name, id, patch as Record<string, unknown>);
    },
    [companyId, name]
  );

  const remove = useCallback(
    async (id: string) => {
      if (!companyId) return;
      setFetched((list) => (list ? list.filter((it) => it.id !== id) : list));
      await deleteContent(companyId, name, id);
    },
    [companyId, name]
  );

  return {
    items: fetched ?? [],
    loading: ready && fetched === null,
    unavailable: !ready,
    reload,
    add,
    update,
    remove,
  };
}
