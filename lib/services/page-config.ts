import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { BlockInstance } from "@/lib/block-types";
import type { MetaFieldState } from "@/components/page-blocks/MetaBar";

/**
 * Personalización que el administrador hace sobre una página: qué
 * características muestra la barra superior y qué bloques agregó.
 *
 * Se guarda en un único documento por página
 * (`companies/{companyId}/pageConfig/{pageKey}`) para que abrir una página
 * cueste una sola lectura.
 */
export interface PageConfig {
  metaFields: MetaFieldState[] | null;
  blocks: BlockInstance[] | null;
}

const EMPTY: PageConfig = { metaFields: null, blocks: null };

/** Clave estable por página; la ruta sin la barra inicial. Ej. "contenido/episodios-madre". */
export function pageKeyFromPath(path: string) {
  return path.replace(/^\//, "").replace(/\//g, "__");
}

export async function getPageConfig(companyId: string, pageKey: string): Promise<PageConfig> {
  const snap = await getDoc(doc(db, "companies", companyId, "pageConfig", pageKey));
  if (!snap.exists()) return EMPTY;
  const data = snap.data();
  return {
    metaFields: (data.metaFields as MetaFieldState[]) ?? null,
    blocks: (data.blocks as BlockInstance[]) ?? null,
  };
}

export async function savePageConfig(companyId: string, pageKey: string, patch: Partial<PageConfig>) {
  await setDoc(doc(db, "companies", companyId, "pageConfig", pageKey), patch, { merge: true });
}
