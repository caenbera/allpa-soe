import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Company, CompanyMember } from "@/lib/types";

function slugify(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48);
}

function toMillis(value: unknown): number {
  if (value instanceof Timestamp) return value.toMillis();
  if (typeof value === "number") return value;
  return Date.now();
}

/** Crea una empresa nueva y registra al usuario que la crea como su admin. */
export async function createCompanyForOwner(ownerUid: string, companyName: string): Promise<Company> {
  const companyId = doc(collection(db, "companies")).id;
  const baseSlug = slugify(companyName) || companyId.slice(0, 8);

  const company: Omit<Company, "createdAt"> & { createdAt: unknown } = {
    id: companyId,
    name: companyName,
    slug: baseSlug,
    logoURL: null,
    plan: "free",
    ownerUid,
    createdAt: serverTimestamp(),
    superadminAccessGrant: { granted: false, grantedAt: null, grantedBy: null },
    superadminAccessRequest: null,
  };

  await setDoc(doc(db, "companies", companyId), company);

  const member: Omit<CompanyMember, "joinedAt"> & { joinedAt: unknown } = {
    uid: ownerUid,
    role: "admin",
    permissions: ["*"],
    invitedBy: null,
    joinedAt: serverTimestamp(),
  };
  await setDoc(doc(db, "companies", companyId, "members", ownerUid), member);

  return { ...company, createdAt: Date.now() } as Company;
}

export async function getCompany(companyId: string): Promise<Company | null> {
  const snap = await getDoc(doc(db, "companies", companyId));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    ...data,
    id: snap.id,
    createdAt: toMillis(data.createdAt),
  } as Company;
}

/**
 * Los miembros de una empresa, para el panel de configuración.
 *
 * `joinedAt` se escribe con `serverTimestamp()`, así que vuelve como
 * `Timestamp` y hay que pasarlo a milisegundos: sin esto la fecha de alta
 * salía como "Invalid Date".
 */
export async function listCompanyMembers(companyId: string): Promise<CompanyMember[]> {
  const snap = await getDocs(collection(db, "companies", companyId, "members"));
  return snap.docs.map((d) => {
    const data = d.data();
    return { ...data, uid: d.id, joinedAt: toMillis(data.joinedAt) } as CompanyMember;
  });
}

export async function listCompaniesByOwner(ownerUid: string): Promise<Company[]> {
  const q = query(collection(db, "companies"), where("ownerUid", "==", ownerUid));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return { ...data, id: d.id, createdAt: toMillis(data.createdAt) } as Company;
  });
}

/** Solo para el panel de super administrador: metadatos de todas las empresas, sin subcolecciones internas. */
export async function listAllCompanies(): Promise<Company[]> {
  const snap = await getDocs(collection(db, "companies"));
  return snap.docs.map((d) => {
    const data = d.data();
    return { ...data, id: d.id, createdAt: toMillis(data.createdAt) } as Company;
  });
}

/**
 * El super administrador deja una solicitud de acceso — el otorgamiento real
 * (superadminAccessGrant.granted) solo lo puede escribir el admin de la
 * empresa, nunca el superadmin (así lo aplican las reglas de Firestore).
 */
export async function requestSuperadminAccess(companyId: string, requestedBy: string, note?: string) {
  await updateDoc(doc(db, "companies", companyId), {
    superadminAccessRequest: { requestedAt: Date.now(), requestedBy, note: note ?? "" },
  });
}

/** Solo puede ejecutarlo el admin de la empresa (lo hacen cumplir las reglas de Firestore). */
export async function grantSuperadminAccess(companyId: string, grantedBy: string) {
  await updateDoc(doc(db, "companies", companyId), {
    superadminAccessGrant: { granted: true, grantedAt: Date.now(), grantedBy },
    superadminAccessRequest: null,
  });
}

/** Solo puede ejecutarlo el admin de la empresa (lo hacen cumplir las reglas de Firestore). */
export async function revokeSuperadminAccess(companyId: string) {
  await updateDoc(doc(db, "companies", companyId), {
    superadminAccessGrant: { granted: false, grantedAt: null, grantedBy: null },
  });
}
