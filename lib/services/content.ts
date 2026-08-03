import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { ContentCollection } from "@/lib/content-types";

/**
 * CRUD genérico sobre las colecciones del módulo Contenido. Todas comparten
 * la misma forma (documentos con `order`), así que un solo juego de funciones
 * sirve para episodios, contenido derivado, archivos, clases y recursos.
 */

function colRef(companyId: string, name: ContentCollection) {
  return collection(db, "companies", companyId, name);
}

export async function listContent<T>(companyId: string, name: ContentCollection): Promise<T[]> {
  const snap = await getDocs(query(colRef(companyId, name), orderBy("order")));
  return snap.docs.map((d) => ({ ...d.data(), id: d.id }) as T);
}

export async function createContent<T extends object>(
  companyId: string,
  name: ContentCollection,
  data: T
): Promise<string> {
  const ref = doc(colRef(companyId, name));
  await setDoc(ref, { ...data, createdAt: serverTimestamp() });
  return ref.id;
}

export async function updateContent(
  companyId: string,
  name: ContentCollection,
  id: string,
  patch: Record<string, unknown>
) {
  await updateDoc(doc(colRef(companyId, name), id), patch);
}

export async function deleteContent(companyId: string, name: ContentCollection, id: string) {
  await deleteDoc(doc(colRef(companyId, name), id));
}
