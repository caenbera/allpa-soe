import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { SidebarBlock, SidebarPage } from "@/lib/types";

function toMillis(value: unknown): number {
  if (value instanceof Timestamp) return value.toMillis();
  if (typeof value === "number") return value;
  return Date.now();
}

export async function listBlocks(companyId: string): Promise<SidebarBlock[]> {
  const q = query(collection(db, "companies", companyId, "blocks"), orderBy("order"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as SidebarBlock);
}

export async function listPages(companyId: string, blockId: string): Promise<SidebarPage[]> {
  const q = query(collection(db, "companies", companyId, "blocks", blockId, "pages"), orderBy("order"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as SidebarPage);
}

export async function createBlock(
  companyId: string,
  createdBy: string,
  data: { name: string; icon: string; order: number }
): Promise<string> {
  const ref = doc(collection(db, "companies", companyId, "blocks"));
  await setDoc(ref, { ...data, isDefault: false, createdBy, createdAt: serverTimestamp() });
  return ref.id;
}

export async function createPage(
  companyId: string,
  blockId: string,
  data: { name: string; slug: string; icon: string; order: number; parentPageId?: string | null }
): Promise<string> {
  const ref = doc(collection(db, "companies", companyId, "blocks", blockId, "pages"));
  await setDoc(ref, {
    blockId,
    parentPageId: data.parentPageId ?? null,
    isDefault: false,
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

/** Escribe en lote los bloques/páginas por defecto de lib/default-sidebar.ts para una empresa nueva. */
export async function seedDefaultSidebar(companyId: string, ownerUid: string) {
  const { defaultSidebarBlocks } = await import("@/lib/default-sidebar");
  const batch = writeBatch(db);

  defaultSidebarBlocks.forEach((block, blockIndex) => {
    const blockRef = doc(collection(db, "companies", companyId, "blocks"));
    batch.set(blockRef, {
      name: block.name,
      icon: block.icon,
      order: blockIndex,
      isDefault: true,
      createdBy: ownerUid,
      createdAt: toMillis(undefined),
    });

    const writePages = (pages: typeof block.pages, parentPageId: string | null) => {
      pages.forEach((page, pageIndex) => {
        const pageRef = doc(collection(db, "companies", companyId, "blocks", blockRef.id, "pages"));
        batch.set(pageRef, {
          blockId: blockRef.id,
          name: page.name,
          slug: page.slug,
          icon: page.icon,
          order: pageIndex,
          isDefault: true,
          built: page.built,
          parentPageId,
          createdAt: toMillis(undefined),
        });
        if (page.children?.length) writePages(page.children, pageRef.id);
      });
    };
    writePages(block.pages, null);
  });

  await batch.commit();
}
