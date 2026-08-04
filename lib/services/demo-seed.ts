import { collection, doc, getDoc, getDocs, updateDoc, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CONTENT_COLLECTIONS } from "@/lib/content-types";
import type { Episode, Pillar } from "@/lib/content-types";
import { CRM_COLLECTIONS } from "@/lib/crm-types";

/**
 * Versión actual del contenido de demostración. Al subirla, las empresas ya
 * sembradas reciben un complemento con lo que falte, sin perder lo editado.
 *
 * 1 → siembra inicial (12 semanas).
 * 2 → plan anual completo (52 semanas) y temas por pilar.
 * 3 → módulo CRM: contactos, oportunidades, actividades y catálogos.
 */
const DEMO_SEED_VERSION = 3;

/**
 * Siembra el contenido de demostración en la empresa del super administrador,
 * para que pueda ver cómo luce la plataforma con información real. Las
 * empresas de administradores normales nunca se siembran: arrancan vacías.
 *
 * El complemento entre versiones es estrictamente **aditivo**: solo escribe
 * lo que no existe, así que si el superadmin borró o editó algo, se respeta.
 */
export async function seedDemoContent(companyId: string): Promise<boolean> {
  const companyRef = doc(db, "companies", companyId);
  const snap = await getDoc(companyRef);
  if (!snap.exists()) return false;

  const data = snap.data();
  // `demoSeeded` es la marca booleana anterior; equivale a la versión 1.
  const currentVersion: number = data.demoSeedVersion ?? (data.demoSeeded ? 1 : 0);
  if (currentVersion >= DEMO_SEED_VERSION) return false;

  if (currentVersion === 0) {
    await seedFromScratch(companyId);
  } else if (currentVersion < 3) {
    await topUpToLatest(companyId);
  }

  // El CRM llegó en la versión 3: se siembra si la empresa aún no lo tiene,
  // tanto en la siembra inicial como en el complemento.
  if (currentVersion < 3) await seedCrm(companyId);

  await updateDoc(companyRef, { demoSeedVersion: DEMO_SEED_VERSION, demoSeeded: true });
  return true;
}

/** Siembra el CRM solo si sus colecciones están vacías, para no duplicar. */
async function seedCrm(companyId: string) {
  const existing = await getDocs(collection(db, "companies", companyId, CRM_COLLECTIONS.contacts));
  if (!existing.empty) return;

  const demo = await import("@/lib/demo-crm");
  const batch = writeBatch(db);

  const write = (name: string, rows: object[]) => {
    rows.forEach((row) => batch.set(doc(collection(db, "companies", companyId, name)), row));
  };

  write(CRM_COLLECTIONS.contacts, demo.DEMO_CONTACTS);
  write(CRM_COLLECTIONS.deals, demo.DEMO_DEALS);
  write(CRM_COLLECTIONS.activities, demo.DEMO_ACTIVITIES);
  write(CRM_COLLECTIONS.tags, demo.DEMO_TAGS);
  write(CRM_COLLECTIONS.segments, demo.DEMO_SEGMENTS);
  write(CRM_COLLECTIONS.automations, demo.DEMO_AUTOMATIONS);

  await batch.commit();
}

async function seedFromScratch(companyId: string) {
  const demo = await import("@/lib/demo-content");
  const { DEMO_EPISODE_DETAIL } = await import("@/lib/demo-episode-detail");
  const batch = writeBatch(db);

  // Los pilares se escriben primero porque el resto los referencia por id.
  const pillarIdByName = new Map<string, string>();
  demo.DEMO_PILLARS.forEach((pillar) => {
    const ref = doc(collection(db, "companies", companyId, CONTENT_COLLECTIONS.pillars));
    pillarIdByName.set(pillar.name, ref.id);
    batch.set(ref, pillar);
  });

  const resolve = (name: string | null) => (name ? (pillarIdByName.get(name) ?? null) : null);

  // Solo la semana 12 trae el detalle completo del Centro de Contenido.
  demo.DEMO_EPISODES.forEach(({ pillarName, ...rest }) => {
    batch.set(doc(collection(db, "companies", companyId, CONTENT_COLLECTIONS.episodes)), {
      ...rest,
      pillarId: resolve(pillarName),
      detail: rest.week === 12 ? DEMO_EPISODE_DETAIL : null,
    });
  });

  demo.DEMO_DERIVED.forEach(({ pillarName, ...rest }) => {
    batch.set(doc(collection(db, "companies", companyId, CONTENT_COLLECTIONS.derivedContent)), {
      ...rest,
      pillarId: resolve(pillarName),
    });
  });

  demo.DEMO_MEDIA.forEach(({ pillarName, ...rest }) => {
    batch.set(doc(collection(db, "companies", companyId, CONTENT_COLLECTIONS.mediaAssets)), {
      ...rest,
      pillarId: resolve(pillarName),
    });
  });

  demo.DEMO_CLASSES.forEach(({ pillarName, ...rest }) => {
    batch.set(doc(collection(db, "companies", companyId, CONTENT_COLLECTIONS.academyClasses)), {
      ...rest,
      pillarId: resolve(pillarName),
    });
  });

  demo.DEMO_DOWNLOADABLES.forEach(({ pillarName, ...rest }) => {
    batch.set(doc(collection(db, "companies", companyId, CONTENT_COLLECTIONS.downloadables)), {
      ...rest,
      pillarId: resolve(pillarName),
    });
  });

  await batch.commit();
}

/**
 * Complemento para una empresa ya sembrada: añade las semanas que falten y
 * rellena los campos nuevos de pilares y episodios existentes que estén
 * vacíos. Nunca sobrescribe un valor que ya tenga contenido.
 */
async function topUpToLatest(companyId: string) {
  const demo = await import("@/lib/demo-content");
  const batch = writeBatch(db);

  const pillarsSnap = await getDocs(collection(db, "companies", companyId, CONTENT_COLLECTIONS.pillars));
  const pillarIdByName = new Map<string, string>();
  pillarsSnap.docs.forEach((d) => {
    const pillar = d.data() as Pillar;
    pillarIdByName.set(pillar.name, d.id);

    // Los temas del pilar son nuevos en la versión 2.
    if (!pillar.topics?.length) {
      const seed = demo.DEMO_PILLARS.find((p) => p.name === pillar.name);
      if (seed?.topics?.length) batch.update(d.ref, { topics: seed.topics });
    }
  });

  const episodesRef = collection(db, "companies", companyId, CONTENT_COLLECTIONS.episodes);
  const episodesSnap = await getDocs(episodesRef);
  const existingWeeks = new Set<number>();
  episodesSnap.docs.forEach((d) => {
    const ep = d.data() as Episode;
    existingWeeks.add(ep.week);

    // El rango de fechas es nuevo en la versión 2.
    if (!ep.dateRange) {
      const seed = demo.DEMO_EPISODES.find((e) => e.week === ep.week);
      if (seed?.dateRange) batch.update(d.ref, { dateRange: seed.dateRange });
    }
  });

  demo.DEMO_EPISODES.filter((e) => !existingWeeks.has(e.week)).forEach(({ pillarName, ...rest }) => {
    batch.set(doc(episodesRef), {
      ...rest,
      pillarId: pillarIdByName.get(pillarName) ?? null,
      detail: null,
    });
  });

  await batch.commit();
}
