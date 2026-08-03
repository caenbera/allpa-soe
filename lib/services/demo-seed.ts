import { collection, doc, getDoc, updateDoc, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CONTENT_COLLECTIONS } from "@/lib/content-types";

/**
 * Siembra el contenido de demostración en la empresa del super administrador.
 *
 * Solo corre una vez por empresa (se marca con `demoSeeded` en el documento
 * de la empresa), así que si el superadmin borra algo no vuelve a aparecer.
 * Las empresas de administradores normales nunca se siembran: arrancan
 * vacías para que carguen su propio contenido.
 */
export async function seedDemoContent(companyId: string): Promise<boolean> {
  const companyRef = doc(db, "companies", companyId);
  const snap = await getDoc(companyRef);
  if (!snap.exists() || snap.data().demoSeeded) return false;

  const demo = await import("@/lib/demo-content");
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
  const { DEMO_EPISODE_DETAIL } = await import("@/lib/demo-episode-detail");
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
  await updateDoc(companyRef, { demoSeeded: true });
  return true;
}
