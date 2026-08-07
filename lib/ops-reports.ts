/**
 * Cálculos compartidos por las dos páginas de reportes de Operaciones.
 *
 * Nada de esto se almacena: se deriva de las colecciones del módulo, igual
 * que en SLA y Cumplimiento, para que un reporte no pueda contradecir a la
 * bandeja de la que sale.
 */

import type {
  Implementation,
  OpsDocument,
  OpsRenewal,
  OpsReview,
  OpsSignature,
  OpsSpecialCase,
  OpsTask,
} from "@/lib/ops-types";

/** Un "proceso" a efectos de reporte: cualquier unidad de trabajo del módulo. */
export interface ProcesoMedible {
  categoria: string;
  color: string;
  icon: string;
  total: number;
  completados: number;
  enProceso: number;
  pendientes: number;
  conIncidencias: number;
  /** Minutos de resolución estimados; ver `estimarMinutos`. */
  minutosMedios: number;
}

export const CATEGORIA_META: Record<string, { color: string; icon: string }> = {
  Implementaciones: { color: "#a78bfa", icon: "Layers" },
  Renovaciones: { color: "#22c55e", icon: "CalendarClock" },
  Revisiones: { color: "#e0a836", icon: "ClipboardCheck" },
  "Documentos y Firmas": { color: "#3b82f6", icon: "FileText" },
  "Casos Especiales": { color: "#f43f5e", icon: "ShieldAlert" },
  Tareas: { color: "#94a3b8", icon: "ClipboardList" },
};

const cerrado = (estado: string) => estado === "Resuelto" || estado === "Completado";

/**
 * Tiempo medio de resolución **estimado**.
 *
 * El módulo no guarda marcas de tiempo de apertura y cierre, así que no hay
 * un tiempo real que medir. Se aproxima a partir de cuánto trabajo queda
 * abierto y cuánto de él va con retraso: más atasco, más tiempo. En cuanto se
 * guarden esas marcas, esta función se sustituye por el dato de verdad.
 */
function estimarMinutos(total: number, abiertos: number, incidencias: number): number {
  if (total === 0) return 0;
  const base = 90;
  const carga = (abiertos / total) * 60;
  const friccion = (incidencias / total) * 120;
  return Math.round(base + carga + friccion);
}

export function formatearDuracion(minutos: number): string {
  if (minutos <= 0) return "—";
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return h > 0 ? `${h}h ${String(m).padStart(2, "0")}m` : `${m}m`;
}

export interface FuentesDeReporte {
  implementations: Implementation[];
  tasks: OpsTask[];
  reviews: OpsReview[];
  documents: OpsDocument[];
  signatures: OpsSignature[];
  renewals: OpsRenewal[];
  specialCases: OpsSpecialCase[];
}

/** Agrupa todo el trabajo del módulo en categorías comparables entre sí. */
export function medirProcesos(f: FuentesDeReporte): ProcesoMedible[] {
  const construir = (
    categoria: string,
    items: { completado: boolean; enProceso: boolean; incidencia: boolean }[]
  ): ProcesoMedible => {
    const completados = items.filter((i) => i.completado).length;
    const enProceso = items.filter((i) => !i.completado && i.enProceso).length;
    const conIncidencias = items.filter((i) => i.incidencia && !i.completado).length;
    const total = items.length;
    return {
      categoria,
      color: CATEGORIA_META[categoria]?.color ?? "#94a3b8",
      icon: CATEGORIA_META[categoria]?.icon ?? "Circle",
      total,
      completados,
      enProceso,
      pendientes: total - completados - enProceso,
      conIncidencias,
      minutosMedios: estimarMinutos(total, total - completados, conIncidencias),
    };
  };

  return [
    construir(
      "Implementaciones",
      f.implementations.map((i) => ({
        completado: i.stage === "completado",
        enProceso: i.stage === "en-proceso" || i.stage === "revision",
        incidencia: i.phases.some((p) => p.steps.some((s) => s.overdue && s.status !== "Completado")),
      }))
    ),
    construir(
      "Tareas",
      f.tasks.map((t) => ({
        completado: t.stage === "completada",
        enProceso: t.stage === "en-proceso",
        incidencia: t.overdue,
      }))
    ),
    construir(
      "Revisiones",
      f.reviews.map((r) => ({ completado: cerrado(r.status), enProceso: r.status === "En gestión", incidencia: r.overdue }))
    ),
    construir(
      "Documentos y Firmas",
      [...f.documents, ...f.signatures].map((d) => ({
        completado: cerrado(d.status),
        enProceso: d.status === "En gestión",
        incidencia: d.overdue,
      }))
    ),
    construir(
      "Renovaciones",
      f.renewals.map((r) => ({ completado: cerrado(r.status), enProceso: r.status === "En gestión", incidencia: r.overdue }))
    ),
    construir(
      "Casos Especiales",
      f.specialCases.map((c) => ({ completado: cerrado(c.status), enProceso: c.status === "En gestión", incidencia: c.overdue }))
    ),
  ].filter((p) => p.total > 0);
}

export interface TotalesDeReporte {
  total: number;
  completados: number;
  enProceso: number;
  pendientes: number;
  conIncidencias: number;
  eficiencia: number;
  minutosMedios: number;
}

export function totalizar(procesos: ProcesoMedible[]): TotalesDeReporte {
  const suma = (k: keyof ProcesoMedible) => procesos.reduce((s, p) => s + (p[k] as number), 0);
  const total = suma("total");
  const completados = suma("completados");
  // Media ponderada por volumen: una categoría con dos casos no pesa lo mismo
  // que una con cuarenta.
  const minutosMedios = total > 0 ? Math.round(procesos.reduce((s, p) => s + p.minutosMedios * p.total, 0) / total) : 0;
  return {
    total,
    completados,
    enProceso: suma("enProceso"),
    pendientes: suma("pendientes"),
    conIncidencias: suma("conIncidencias"),
    eficiencia: total > 0 ? Math.round(((total - suma("conIncidencias")) / total) * 100) : 100,
    minutosMedios,
  };
}

/** Volumen y eficiencia por responsable, sumando todas las categorías. */
export function medirPorAsesor(f: FuentesDeReporte) {
  const map = new Map<string, { total: number; incidencias: number }>();
  const anotar = (owner: string, incidencia: boolean) => {
    if (!owner) return;
    const prev = map.get(owner) ?? { total: 0, incidencias: 0 };
    map.set(owner, { total: prev.total + 1, incidencias: prev.incidencias + (incidencia ? 1 : 0) });
  };

  f.implementations.forEach((i) =>
    anotar(i.owner, i.phases.some((p) => p.steps.some((s) => s.overdue && s.status !== "Completado")))
  );
  f.tasks.forEach((t) => anotar(t.delegatedTo || t.owner, t.overdue));
  [...f.reviews, ...f.renewals, ...f.specialCases].forEach((r) => anotar(r.owner, r.overdue && !cerrado(r.status)));
  [...f.documents, ...f.signatures].forEach((d) => anotar(d.owner, d.overdue && !cerrado(d.status)));

  return Array.from(map.entries())
    .map(([owner, { total, incidencias }]) => ({
      owner,
      total,
      incidencias,
      eficiencia: Math.round(((total - incidencias) / total) * 100),
    }))
    .sort((a, b) => b.total - a.total);
}
