/**
 * Cuentas del módulo Soluciones.
 *
 * Todo se **deriva de las asignaciones**, nunca se guarda: cuántas familias
 * tiene un plan, cuánto lleva implementado y cuánto patrimonio protege salen
 * de contar `solAssignments`. Guardar esas cifras junto a la solución sería
 * garantizar que un día la tarjeta diga 128 y la tabla de abajo enseñe 7.
 *
 * Lo comparten el Dashboard, el catálogo de Planes, la ficha de cada solución
 * y la Analítica, así que una pantalla no puede contradecir a otra.
 */

import type { SolAssignment, Solution } from "@/lib/solution-types";

export interface SolutionRollup {
  slug: string;
  /** Familias distintas con este plan. */
  families: number;
  /** Asignaciones: una familia puede tener el plan una sola vez, pero se cuenta aparte por claridad. */
  assignments: number;
  /** Media de avance de implementación, 0-100. */
  progress: number;
  /** Suma asegurada de las asignaciones que llevan importe. */
  coverage: number;
  /** Cuántas están completamente implementadas. */
  implemented: number;
  /** Cuántas piden atención o están pausadas. */
  stalled: number;
}

/** Resumen por solución, indexado por slug. */
export function rollupBySolution(assignments: SolAssignment[]): Map<string, SolutionRollup> {
  const out = new Map<string, SolutionRollup & { _families: Set<string>; _sum: number }>();

  for (const a of assignments) {
    let r = out.get(a.solutionSlug);
    if (!r) {
      r = {
        slug: a.solutionSlug,
        families: 0,
        assignments: 0,
        progress: 0,
        coverage: 0,
        implemented: 0,
        stalled: 0,
        _families: new Set<string>(),
        _sum: 0,
      };
      out.set(a.solutionSlug, r);
    }
    r.assignments += 1;
    r._families.add(a.familyName);
    r._sum += a.progress;
    r.coverage += a.coverage;
    if (a.status === "Implementado") r.implemented += 1;
    if (a.status === "Requiere Atención" || a.status === "Pausado") r.stalled += 1;
  }

  const clean = new Map<string, SolutionRollup>();
  for (const [slug, r] of out) {
    clean.set(slug, {
      slug,
      families: r._families.size,
      assignments: r.assignments,
      progress: r.assignments ? Math.round(r._sum / r.assignments) : 0,
      coverage: r.coverage,
      implemented: r.implemented,
      stalled: r.stalled,
    });
  }
  return clean;
}

/** Resumen de una sola solución; devuelve ceros si todavía no tiene familias. */
export function rollupFor(slug: string, assignments: SolAssignment[]): SolutionRollup {
  return (
    rollupBySolution(assignments).get(slug) ?? {
      slug,
      families: 0,
      assignments: 0,
      progress: 0,
      coverage: 0,
      implemented: 0,
      stalled: 0,
    }
  );
}

export interface SolutionTotals {
  /** Asignaciones vivas: el número de "soluciones activas" del panel. */
  active: number;
  /** Planes distintos del catálogo. */
  plans: number;
  /** Familias distintas con al menos un plan. */
  families: number;
  /** Suma asegurada de todo el módulo. */
  coverage: number;
  /** Media de implementación de todas las asignaciones. */
  progress: number;
  /** Asignaciones de planes empresariales. */
  business: number;
  implemented: number;
  stalled: number;
}

export function totals(solutions: Solution[], assignments: SolAssignment[]): SolutionTotals {
  const empresariales = new Set(solutions.filter((s) => s.kind === "Empresarial").map((s) => s.slug));
  const families = new Set(assignments.map((a) => a.familyName));
  const sum = assignments.reduce((acc, a) => acc + a.progress, 0);

  return {
    active: assignments.length,
    plans: solutions.length,
    families: families.size,
    coverage: assignments.reduce((acc, a) => acc + a.coverage, 0),
    progress: assignments.length ? Math.round(sum / assignments.length) : 0,
    business: assignments.filter((a) => empresariales.has(a.solutionSlug)).length,
    implemented: assignments.filter((a) => a.status === "Implementado").length,
    stalled: assignments.filter((a) => a.status === "Requiere Atención" || a.status === "Pausado").length,
  };
}

/**
 * Importe en formato corto: "$48.2M", "$980K", "$1,250".
 *
 * Las coberturas del módulo van de miles a decenas de millones y el ancho de
 * una tarjeta no da para escribirlas enteras.
 */
export function money(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 10_000) return `$${Math.round(value / 1000)}K`;
  return `$${value.toLocaleString("en-US")}`;
}

/** Porcentaje entero sobre un total; 0 si el total es 0, para no dividir por cero. */
export function share(part: number, total: number): number {
  return total ? Math.round((part / total) * 100) : 0;
}

// ── Repartos de la analítica ───────────────────────────────────────────────

export interface GrupoRollup {
  /** Nombre del asesor o de la familia. */
  key: string;
  assignments: number;
  progress: number;
  coverage: number;
  implemented: number;
  stalled: number;
}

/** Agrupa las asignaciones por el campo que se le indique. */
function agrupar(assignments: SolAssignment[], claveDe: (a: SolAssignment) => string): GrupoRollup[] {
  const mapa = new Map<string, { suma: number; g: GrupoRollup }>();

  for (const a of assignments) {
    const key = claveDe(a);
    let entrada = mapa.get(key);
    if (!entrada) {
      entrada = { suma: 0, g: { key, assignments: 0, progress: 0, coverage: 0, implemented: 0, stalled: 0 } };
      mapa.set(key, entrada);
    }
    entrada.g.assignments += 1;
    entrada.g.coverage += a.coverage;
    entrada.suma += a.progress;
    if (a.status === "Implementado") entrada.g.implemented += 1;
    if (a.status === "Requiere Atención" || a.status === "Pausado") entrada.g.stalled += 1;
  }

  return [...mapa.values()]
    .map(({ suma, g }) => ({ ...g, progress: g.assignments ? Math.round(suma / g.assignments) : 0 }))
    .sort((a, b) => b.assignments - a.assignments);
}

/** Qué lleva cada asesor. */
export function rollupByAdvisor(assignments: SolAssignment[]): GrupoRollup[] {
  return agrupar(assignments, (a) => a.advisor);
}

/** Qué tiene contratado cada familia. */
export function rollupByFamily(assignments: SolAssignment[]): GrupoRollup[] {
  return agrupar(assignments, (a) => a.familyName);
}

/**
 * Cohortes por profundidad de relación: cuántos planes tiene contratados cada
 * familia. Es la pregunta que de verdad importa —si una familia con más
 * planes avanza mejor o peor que una con uno solo—, y sale de los mismos
 * datos sin inventar fechas de alta que el módulo no guarda.
 */
export interface Cohorte {
  id: string;
  label: string;
  color: string;
  /** Familias en este grupo. */
  families: number;
  /** Planes contratados en total por el grupo. */
  assignments: number;
  progress: number;
  coverage: number;
}

const TRAMOS_COHORTE = [
  { id: "1", label: "1 plan", color: "#64748b", min: 1, max: 1 },
  { id: "2-3", label: "2 a 3 planes", color: "#3b82f6", min: 2, max: 3 },
  { id: "4-5", label: "4 a 5 planes", color: "#22c55e", min: 4, max: 5 },
  { id: "6+", label: "6 o más planes", color: "#a78bfa", min: 6, max: Infinity },
];

/**
 * Cohortes por madurez: en qué punto de la implementación está cada familia,
 * según el avance medio de sus planes.
 *
 * Es la otra cara de la misma moneda que `cohortesPorProfundidad`, y la que
 * discrimina cuando toda la cartera tiene una relación igual de profunda: dos
 * familias con seis planes cada una pueden estar en sitios muy distintos.
 */
const TRAMOS_MADUREZ = [
  { id: "inicial", label: "Fase inicial (menos del 50%)", color: "#f43f5e", min: 0, max: 49 },
  { id: "media", label: "En curso (50% – 74%)", color: "#e0a836", min: 50, max: 74 },
  { id: "avanzada", label: "Avanzada (75% – 89%)", color: "#3b82f6", min: 75, max: 89 },
  { id: "consolidada", label: "Consolidada (90% o más)", color: "#22c55e", min: 90, max: 100 },
];

export function cohortesPorMadurez(assignments: SolAssignment[]): Cohorte[] {
  const porFamilia = rollupByFamily(assignments);

  return TRAMOS_MADUREZ.map((tramo) => {
    const dentro = porFamilia.filter((f) => f.progress >= tramo.min && f.progress <= tramo.max);
    const planes = dentro.reduce((acc, f) => acc + f.assignments, 0);
    const sumaAvance = dentro.reduce((acc, f) => acc + f.progress * f.assignments, 0);
    return {
      id: tramo.id,
      label: tramo.label,
      color: tramo.color,
      families: dentro.length,
      assignments: planes,
      progress: planes ? Math.round(sumaAvance / planes) : 0,
      coverage: dentro.reduce((acc, f) => acc + f.coverage, 0),
    };
  }).filter((c) => c.families > 0);
}

export function cohortesPorProfundidad(assignments: SolAssignment[]): Cohorte[] {
  const porFamilia = rollupByFamily(assignments);

  return TRAMOS_COHORTE.map((tramo) => {
    const dentro = porFamilia.filter((f) => f.assignments >= tramo.min && f.assignments <= tramo.max);
    const planes = dentro.reduce((acc, f) => acc + f.assignments, 0);
    const sumaAvance = dentro.reduce((acc, f) => acc + f.progress * f.assignments, 0);
    return {
      id: tramo.id,
      label: tramo.label,
      color: tramo.color,
      families: dentro.length,
      assignments: planes,
      // Media ponderada por planes: una familia con seis pesa más que una con uno.
      progress: planes ? Math.round(sumaAvance / planes) : 0,
      coverage: dentro.reduce((acc, f) => acc + f.coverage, 0),
    };
  }).filter((c) => c.families > 0);
}
