import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { ChecklistItem, ChecklistNote, PageSection } from "@/lib/types";

function sectionsRef(companyId: string, pageId: string) {
  return collection(db, "companies", companyId, "pages", pageId, "sections");
}

export async function listSections(companyId: string, pageId: string): Promise<PageSection[]> {
  const q = query(sectionsRef(companyId, pageId), orderBy("order"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as PageSection);
}

export async function createSection(
  companyId: string,
  pageId: string,
  data: Pick<PageSection, "title" | "icon" | "order">
): Promise<string> {
  const ref = doc(sectionsRef(companyId, pageId));
  await setDoc(ref, {
    ...data,
    status: "pendiente",
    priority: "media",
    assignees: [],
    isExpanded: false,
    richContent: "",
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateSection(companyId: string, pageId: string, sectionId: string, data: Partial<PageSection>) {
  await updateDoc(doc(sectionsRef(companyId, pageId), sectionId), data);
}

function checklistRef(companyId: string, pageId: string, sectionId: string) {
  return collection(db, "companies", companyId, "pages", pageId, "sections", sectionId, "checklistItems");
}

export async function listChecklistItems(companyId: string, pageId: string, sectionId: string): Promise<ChecklistItem[]> {
  const q = query(checklistRef(companyId, pageId, sectionId), orderBy("order"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as ChecklistItem);
}

export async function createChecklistItem(
  companyId: string,
  pageId: string,
  sectionId: string,
  data: { text: string; order: number; assignee?: string | null; dueDate?: number | null }
): Promise<string> {
  const ref = doc(checklistRef(companyId, pageId, sectionId));
  await setDoc(ref, {
    text: data.text,
    order: data.order,
    done: false,
    assignee: data.assignee ?? null,
    dueDate: data.dueDate ?? null,
    noteCount: 0,
  });
  return ref.id;
}

export async function toggleChecklistItem(companyId: string, pageId: string, sectionId: string, itemId: string, done: boolean) {
  await updateDoc(doc(checklistRef(companyId, pageId, sectionId), itemId), { done });
}

export async function deleteChecklistItem(companyId: string, pageId: string, sectionId: string, itemId: string) {
  await deleteDoc(doc(checklistRef(companyId, pageId, sectionId), itemId));
}

function notesRef(companyId: string, pageId: string, sectionId: string, itemId: string) {
  return collection(
    db,
    "companies",
    companyId,
    "pages",
    pageId,
    "sections",
    sectionId,
    "checklistItems",
    itemId,
    "notes"
  );
}

export async function listNotes(companyId: string, pageId: string, sectionId: string, itemId: string): Promise<ChecklistNote[]> {
  const q = query(notesRef(companyId, pageId, sectionId, itemId), orderBy("createdAt"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as ChecklistNote);
}

export async function addNote(
  companyId: string,
  pageId: string,
  sectionId: string,
  itemId: string,
  data: { authorUid: string; authorName: string; text: string }
) {
  const ref = doc(notesRef(companyId, pageId, sectionId, itemId));
  await setDoc(ref, { ...data, createdAt: serverTimestamp() });
}
