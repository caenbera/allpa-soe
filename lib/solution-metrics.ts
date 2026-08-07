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
