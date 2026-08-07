import type { CrmFamily } from "@/lib/crm-types";
import type { SolutionRollup } from "@/lib/solution-metrics";
import type { SolActivity, SolAssignment, SolDocument, SolUseCase, Solution } from "@/lib/solution-types";

/**
 * Lo que cada pestaña de la ficha necesita saber.
 *
 * Las listas llegan **ya filtradas por esta solución**, así que ninguna
 * pestaña puede olvidarse del filtro y enseñar datos de otro plan. El padre
 * es el único que lee de Firestore y el único que escribe.
 */
export interface SolutionContext {
  solution: Solution;
  assignments: SolAssignment[];
  documents: SolDocument[];
  useCases: SolUseCase[];
  activities: SolActivity[];
  /** Todas las familias del CRM; la unión se hace por nombre. */
  families: CrmFamily[];
  rollup: SolutionRollup;
  onToggleStep: (code: string) => void;
  onAddComponent: (id: string) => void;
}
