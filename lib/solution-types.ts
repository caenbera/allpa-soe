/**
 * Tipos del módulo Soluciones, compartidos por los servicios de Firestore,
 * las vistas y los datos de demostración.
 *
 * Los otros módulos responden *qué publicamos* (Contenido), *con quién
 * hablamos* (CRM) y *qué hay que hacer* (Operaciones). Soluciones responde
 * **qué vendemos y cómo se arma**: los planes patrimoniales, los componentes
 * modulares con que se construyen, las rutas por tipo de cliente y las
 * herramientas para simular y comparar.
 */

import type { BadgeTone } from "@/components/page-blocks/blocks/DataTable";

/** Colecciones del módulo bajo `companies/{companyId}/`. */
export const SOL_COLLECTIONS = {
  solutions: "solSolutions",
  components: "solComponents",
  routes: "solRoutes",
  useCases: "solUseCases",
  resources: "solResources",
  documents: "solDocuments",
  assignments: "solAssignments",
  activities: "solActivities",
  simulations: "solSimulations",
  comparisons: "solComparisons",
} as const;

export type SolCollection = (typeof SOL_COLLECTIONS)[keyof typeof SOL_COLLECTIONS];

// ── Vocabulario común ──────────────────────────────────────────────────────

/**
 * Estado de publicación, compartido por soluciones, componentes, rutas y
 * casos de uso: los cuatro catálogos se filtran por lo mismo.
 */
export type CatalogStatus = "Activo" | "Borrador" | "Archivado";

export const CATALOG_STATUS_TONE: Record<CatalogStatus, BadgeTone> = {
  Activo: "emerald",
  Borrador: "amber",
  Archivado: "neutral",
};

/** Peso de un componente dentro de un plan. */
export type ComponentTier = "Esencial" | "Recomendado" | "Opcional";

export const TIER_TONE: Record<ComponentTier, BadgeTone> = {
  Esencial: "violet",
  Recomendado: "emerald",
  Opcional: "amber",
};

/** Nivel de 1 a 5 que pinta el medidor de puntos (complejidad, prioridad…). */
export type DotLevel = 1 | 2 | 3 | 4 | 5;

// ── Soluciones ─────────────────────────────────────────────────────────────

/**
 * Un paso del constructor de solución. Son los mismos nueve para todos los
 * planes —es la metodología de la casa—, pero cada plan avanza a su ritmo,
 * así que el estado vive en la solución.
 */
export interface BuilderStep {
  code: string;
  title: string;
  description: string;
  done: boolean;
}

/**
 * Un componente tal como está montado dentro de un plan concreto: además del
 * componente en sí, su papel, su estado de implementación y su cobertura.
 *
 * Va embebido en la solución y no en colección aparte porque nunca se lee sin
 * ella y son menos de diez por plan; separarlos solo añadiría lecturas.
 */
export interface SolutionComponent {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  tier: ComponentTier;
  /** Papel dentro del plan: "Protección Principal", "Monitoreo y Ajuste"… */
  role: string;
  status: "Activo" | "En Proceso" | "Programado" | "Pendiente";
  statusNote: string;
  /** Cobertura o meta; los componentes de servicio no llevan importe. */
  coverage?: string;
  coverageLabel?: string;
  priority: DotLevel;
  priorityLabel: string;
}

export interface Solution {
  id: string;
  /**
   * Identificador estable escrito a mano ("proteccion-familiar").
   *
   * El `id` lo pone Firestore al crear el documento, así que no sirve para
   * enlazar desde los datos sembrados: todo lo que apunta a una solución
   * —documentos, asignaciones, actividad, rutas— lo hace por este slug.
   */
  slug: string;
  name: string;
  /** Orden de presentación: los planes se numeran del 1 al 8 en las tarjetas. */
  order: number;
  icon: string;
  color: string;
  /** Una frase: lo que el plan promete al cliente. */
  tagline: string;
  /** Las prestaciones que se listan en la tarjeta del catálogo. */
  features: string[];
  status: CatalogStatus;
  /** Familia, Empresa o Educación: agrupa los planes en la analítica. */
  kind: "Protección" | "Acumulación" | "Retiro" | "Legal" | "Fiscal" | "Sucesión" | "Empresarial" | "Educación";
  audience: string;
  complexity: DotLevel;
  complexityLabel: string;
  reviewCadence: string;
  objective: string;
  steps: BuilderStep[];
  components: SolutionComponent[];
}

// ── Componentes del catálogo ───────────────────────────────────────────────

export const COMPONENT_CATEGORIES = ["Protección", "Ahorro", "Salud", "Educación", "Beneficios", "Otros"] as const;
export type ComponentCategory = (typeof COMPONENT_CATEGORIES)[number];

export const COMPONENT_CATEGORY_COLOR: Record<ComponentCategory, string> = {
  Protección: "#a78bfa",
  Ahorro: "#3b82f6",
  Salud: "#22c55e",
  Educación: "#e0a836",
  Beneficios: "#f97316",
  Otros: "#64748b",
};

/** Componente reutilizable del catálogo, del que beben los planes. */
export interface SolComponent {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: ComponentCategory;
  /** Cobertura, Ahorro, Beneficio o Meta. */
  type: string;
  /** Nombre del plan en el que se usa principalmente, y su slug. */
  relatedPlan: string;
  relatedSlug: string;
  status: CatalogStatus;
  updatedAt: string;
  author: string;
  /** En cuántas soluciones se usa; alimenta "Componentes más utilizados". */
  usedIn: number;
  order: number;
}

// ── Rutas de cliente ───────────────────────────────────────────────────────

export interface SolRoute {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  relatedPlan: string;
  relatedPlanIcon: string;
  stages: number;
  status: CatalogStatus;
  updatedAt: string;
  author: string;
  order: number;
}

// ── Casos de uso ───────────────────────────────────────────────────────────

export interface SolUseCase {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  relatedPlan: string;
  /** Segmento al que aplica: "Familias Jóvenes", "Cuidadores Principales"… */
  segment: string;
  owner: string;
  status: CatalogStatus;
  updatedAt: string;
  /** Familias en las que se ha aplicado y qué parte está completada. */
  families: number;
  completion: number;
  /** Impacto declarado, de mayor a menor. */
  impact: "Muy Alto" | "Alto" | "Medio" | "Bajo";
  order: number;
}

export const IMPACT_COLOR: Record<SolUseCase["impact"], string> = {
  "Muy Alto": "#a78bfa",
  Alto: "#3b82f6",
  Medio: "#22c55e",
  Bajo: "#e0a836",
};

// ── Biblioteca ─────────────────────────────────────────────────────────────

export const RESOURCE_KINDS = ["Guía", "Plantilla", "Video", "Webinar", "Artículo", "Herramienta"] as const;
export type ResourceKind = (typeof RESOURCE_KINDS)[number];

export const RESOURCE_KIND_META: Record<ResourceKind, { icon: string; color: string }> = {
  Guía: { icon: "BookOpen", color: "#a78bfa" },
  Plantilla: { icon: "LayoutTemplate", color: "#22c55e" },
  Video: { icon: "PlayCircle", color: "#f472b6" },
  Webinar: { icon: "MonitorPlay", color: "#3b82f6" },
  Artículo: { icon: "FileText", color: "#06b6d4" },
  Herramienta: { icon: "Wrench", color: "#e0a836" },
};

export interface SolResource {
  id: string;
  title: string;
  description: string;
  kind: ResourceKind;
  relatedPlan: string;
  /** "PDF · 2.4 MB", "12 min lectura", "18 min"… tal como se muestra. */
  meta: string;
  date: string;
  featured: boolean;
  /** Descargas, reproducciones o lecturas, según el tipo. */
  uses: number;
  usesLabel: string;
  order: number;
}

// ── Documentos de una solución ─────────────────────────────────────────────

export type SolDocumentStatus = "Activo" | "Pendiente de Firma" | "Firmado" | "Revisión Periódica" | "Archivado";

export const SOL_DOCUMENT_STATUS_TONE: Record<SolDocumentStatus, BadgeTone> = {
  Activo: "emerald",
  "Pendiente de Firma": "amber",
  Firmado: "blue",
  "Revisión Periódica": "gold",
  Archivado: "neutral",
};

export interface SolDocument {
  id: string;
  name: string;
  /** Guías, Checklists, Herramientas, Análisis, Propuestas, Legales… */
  category: string;
  format: "PDF" | "DOCX" | "XLSX" | "PPTX";
  size: string;
  solutionSlug: string;
  /** Paso del constructor al que pertenece. */
  stage: string;
  status: SolDocumentStatus;
  updatedAt: string;
  updatedTime: string;
  order: number;
}

// ── Familias asignadas ─────────────────────────────────────────────────────

export type AssignmentStatus = "Implementado" | "En Implementación" | "En Proceso" | "Requiere Atención" | "Pausado";

export const ASSIGNMENT_STATUS_TONE: Record<AssignmentStatus, BadgeTone> = {
  Implementado: "blue",
  "En Implementación": "emerald",
  "En Proceso": "amber",
  "Requiere Atención": "rose",
  Pausado: "neutral",
};

export const ASSIGNMENT_STATUS_COLOR: Record<AssignmentStatus, string> = {
  Implementado: "#3b82f6",
  "En Implementación": "#22c55e",
  "En Proceso": "#e0a836",
  "Requiere Atención": "#f43f5e",
  Pausado: "#64748b",
};

/**
 * Vínculo entre una familia del CRM y una solución.
 *
 * `familyName` es la clave de unión con `crmFamilies`: los datos de contacto
 * y la ciudad se leen de allí y no se copian aquí. Duplicarlos garantizaría
 * que un día el CRM diga una cosa y esta pantalla otra.
 */
export interface SolAssignment {
  id: string;
  solutionSlug: string;
  /** Presente solo en asignaciones creadas desde la aplicación. */
  familyId?: string;
  familyName: string;
  status: AssignmentStatus;
  progress: number;
  coverage: number;
  lastActivity: string;
  lastActivityNote: string;
  nextReview: string;
  daysToReview: number;
  advisor: string;
  order: number;
}

// ── Actividad ──────────────────────────────────────────────────────────────

export const SOL_ACTIVITY_KINDS = ["Tarea", "Reunión", "Llamada", "Email", "Documento", "Actualización"] as const;
export type SolActivityKind = (typeof SOL_ACTIVITY_KINDS)[number];

export const SOL_ACTIVITY_META: Record<SolActivityKind, { icon: string; color: string; tone: BadgeTone }> = {
  Tarea: { icon: "CheckSquare", color: "#a78bfa", tone: "violet" },
  Reunión: { icon: "CalendarDays", color: "#3b82f6", tone: "blue" },
  Llamada: { icon: "Phone", color: "#e0a836", tone: "gold" },
  Email: { icon: "Mail", color: "#06b6d4", tone: "blue" },
  Documento: { icon: "FileText", color: "#22c55e", tone: "emerald" },
  Actualización: { icon: "RefreshCw", color: "#f97316", tone: "amber" },
};

export interface SolActivity {
  id: string;
  kind: SolActivityKind;
  title: string;
  detail: string;
  solutionSlug: string;
  familyName: string;
  author: string;
  date: string;
  time: string;
  dayLabel: string;
  order: number;
}

// ── Herramientas ───────────────────────────────────────────────────────────

/** Nivel de cobertura que elige el asesor en la calculadora. */
export type CoverageLevel = "Básico" | "Medio" | "Alto";

export const COVERAGE_LEVELS: CoverageLevel[] = ["Básico", "Medio", "Alto"];

/** Parámetros de una simulación; los consume `lib/solution-calc.ts`. */
export interface SimulationParams {
  solutionSlug: string;
  profile: string;
  age: number;
  maritalStatus: string;
  dependents: number;
  monthlyIncome: number;
  level: CoverageLevel;
}

export interface SolSimulation extends SimulationParams {
  id: string;
  name: string;
  icon: string;
  color: string;
  date: string;
  status: "Completada" | "Borrador";
  order: number;
}

export interface SolComparison {
  id: string;
  name: string;
  date: string;
  solutionSlugs: string[];
  order: number;
}

// ── Perfiles de cliente ────────────────────────────────────────────────────

/**
 * Perfiles que ofrece la calculadora. El factor multiplica la necesidad de
 * cobertura: una familia joven con hijos necesita más capital que una pareja
 * en pre-retiro con el patrimonio ya formado.
 */
export const CLIENT_PROFILES = [
  { id: "familia-joven", label: "Familia Joven", factor: 1 },
  { id: "familia-con-hijos", label: "Familia con Hijos", factor: 1.25 },
  { id: "ejecutivo", label: "Ejecutivo", factor: 1.15 },
  { id: "empresario", label: "Empresario", factor: 1.4 },
  { id: "pre-retiro", label: "Pre-Retiro", factor: 0.85 },
] as const;

export type ClientProfileId = (typeof CLIENT_PROFILES)[number]["id"];
