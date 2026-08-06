/**
 * Tipos del módulo Operaciones, compartidos por los servicios de Firestore,
 * las vistas y los datos de demostración.
 *
 * Si el CRM responde *con quién* hablamos, Operaciones responde *qué hay que
 * hacer y en qué va*: implementaciones de principio a fin, sus checklists por
 * fase, las tareas del día y las bandejas de lo que está bloqueado.
 */

import type { BadgeTone } from "@/components/page-blocks/blocks/DataTable";

/** Colecciones del módulo bajo `companies/{companyId}/`. */
export const OPS_COLLECTIONS = {
  implementations: "opsImplementations",
  tasks: "opsTasks",
  reviews: "opsReviews",
  documents: "opsDocuments",
  signatures: "opsSignatures",
  renewals: "opsRenewals",
  specialCases: "opsSpecialCases",
  events: "opsEvents",
  team: "opsTeam",
  slaPolicies: "opsSlaPolicies",
} as const;

export type OpsCollection = (typeof OPS_COLLECTIONS)[keyof typeof OPS_COLLECTIONS];

// ── Vocabulario común ──────────────────────────────────────────────────────

export type Priority = "Alta" | "Media" | "Baja";

export const PRIORITY_TONE: Record<Priority, BadgeTone> = {
  Alta: "rose",
  Media: "amber",
  Baja: "blue",
};

/** Procesos de negocio que atraviesan todo el módulo. */
export const OPS_PROCESSES = [
  "Protección Familiar",
  "Retiro Inteligente",
  "Plan Patrimonial",
  "Protección Patrimonial",
  "Educación de Hijos",
  "Revisión Anual",
] as const;

export type OpsProcess = (typeof OPS_PROCESSES)[number];

export const PROCESS_TONE: Record<string, BadgeTone> = {
  "Protección Familiar": "violet",
  "Retiro Inteligente": "emerald",
  "Plan Patrimonial": "blue",
  "Protección Patrimonial": "amber",
  "Educación de Hijos": "rose",
  "Revisión Anual": "gold",
};

// ── Implementaciones ───────────────────────────────────────────────────────

export type ImplementationStage = "por-hacer" | "en-proceso" | "en-espera" | "revision" | "completado";

export interface ImplementationStageDef {
  id: ImplementationStage;
  name: string;
  color: string;
  order: number;
}

export const IMPLEMENTATION_STAGES: ImplementationStageDef[] = [
  { id: "por-hacer", name: "Por hacer", color: "#94a3b8", order: 0 },
  { id: "en-proceso", name: "En proceso", color: "#3b82f6", order: 1 },
  { id: "en-espera", name: "En espera", color: "#f59e0b", order: 2 },
  { id: "revision", name: "Revisión / Validación", color: "#a78bfa", order: 3 },
  { id: "completado", name: "Completado", color: "#22c55e", order: 4 },
];

export type StepStatus = "Completado" | "En proceso" | "Pendiente";

export const STEP_STATUS_TONE: Record<StepStatus, BadgeTone> = {
  Completado: "emerald",
  "En proceso": "blue",
  Pendiente: "neutral",
};

export interface ChecklistStep {
  /** Numeración visible dentro de su fase: "2.3". */
  code: string;
  title: string;
  owner: string;
  status: StepStatus;
  /** Vacío mientras no haya fecha comprometida. */
  dueDate: string;
  /** Vencido sin completar. */
  overdue: boolean;
}

export interface ChecklistPhase {
  id: string;
  /** 1, 2, 3… tal como se numeran en la pantalla. */
  index: number;
  title: string;
  steps: ChecklistStep[];
}

/**
 * Las fases y sus pasos van embebidos: siempre se leen junto a la
 * implementación y son unas decenas por documento, así que separarlos en su
 * propia colección solo añadiría lecturas.
 */
export interface Implementation {
  id: string;
  code: string;
  process: OpsProcess | string;
  client: string;
  owner: string;
  stage: ImplementationStage;
  priority: Priority;
  /** 0-100. */
  progress: number;
  currentStep: number;
  totalSteps: number;
  currentStepTitle: string;
  /** Solo en la etapa "en-espera": Cliente, Documentos, Terceros. */
  waitingOn: string;
  startDate: string;
  estimatedEndDate: string;
  /** Fecha real de cierre; vacío mientras siga abierta. */
  completedAt: string;
  nextSteps: string[];
  pendingDocuments: { title: string; detail: string }[];
  phases: ChecklistPhase[];
  order: number;
}

// ── Tareas ─────────────────────────────────────────────────────────────────

export type TaskStage = "por-hacer" | "en-proceso" | "en-espera" | "completada" | "delegada";

export const TASK_STAGES: { id: TaskStage; name: string; color: string; order: number }[] = [
  { id: "por-hacer", name: "Por hacer", color: "#94a3b8", order: 0 },
  { id: "en-proceso", name: "En proceso", color: "#3b82f6", order: 1 },
  { id: "en-espera", name: "En espera", color: "#f59e0b", order: 2 },
  { id: "completada", name: "Completadas", color: "#22c55e", order: 3 },
  { id: "delegada", name: "Delegadas", color: "#a78bfa", order: 4 },
];

export interface OpsTask {
  id: string;
  title: string;
  process: OpsProcess | string;
  client: string;
  owner: string;
  /** Solo en las delegadas: a quién se delegó. */
  delegatedTo: string;
  stage: TaskStage;
  priority: Priority;
  /** Etiqueta tal como se muestra: "Hoy", "Mañana", "21 May". */
  dueLabel: string;
  /** ISO `YYYY-MM-DD`, para ordenar y contar vencimientos. */
  dueDate: string;
  overdue: boolean;
  subtasksDone: number;
  subtasksTotal: number;
  /** Hora del día cuando la tarea entra en la agenda: "09:00". */
  time: string;
  /** Icono del tipo de acción: Llamada, Email, Reunión, Revisión. */
  kind: string;
  completedNote: string;
  order: number;
}

// ── Bandejas ───────────────────────────────────────────────────────────────

export type InboxStatus = "Pendiente" | "En gestión" | "En espera" | "Resuelto" | "Completado";

export const INBOX_STATUS_TONE: Record<InboxStatus, BadgeTone> = {
  Pendiente: "neutral",
  "En gestión": "blue",
  "En espera": "amber",
  Resuelto: "emerald",
  Completado: "emerald",
};

/** Forma común de las cinco bandejas; cada una añade lo suyo. */
interface InboxItemBase {
  id: string;
  title: string;
  client: string;
  process: OpsProcess | string;
  owner: string;
  status: InboxStatus;
  priority: Priority;
  dueDate: string;
  dueLabel: string;
  overdue: boolean;
  order: number;
}

export interface OpsReview extends InboxItemBase {
  /** Qué se revisa: Documentos, Estrategia, Financiera… */
  kind: string;
  progress: number;
}

export interface OpsDocument extends InboxItemBase {
  /** Tipo de documento pedido. */
  kind: string;
  /** De quién se espera: Cliente, Aseguradora, Interno. */
  waitingOn: string;
  requestedAt: string;
}

export interface OpsSignature extends InboxItemBase {
  /** Canal por el que se pidió la firma. */
  channel: string;
  sentAt: string;
  remindersSent: number;
}

export interface OpsRenewal extends InboxItemBase {
  policy: string;
  annualPremium: number;
  /** Días que faltan para la renovación; negativo si ya venció. */
  daysToRenewal: number;
}

export interface OpsSpecialCase extends InboxItemBase {
  /** Underwriting, Salud médica, Patrimonial, Legal, Internacional… */
  kind: string;
  summary: string;
  progress: number;
  timeline: { date: string; label: string; done: boolean }[];
}

// ── Calendario ─────────────────────────────────────────────────────────────

export type EventKind =
  | "Implementaciones"
  | "Revisiones"
  | "Renovaciones"
  | "Documentos y Firmas"
  | "Casos Especiales"
  | "Tareas y Checklists"
  | "Capacitación"
  | "Otros";

export const EVENT_KIND_COLOR: Record<EventKind, string> = {
  Implementaciones: "#a78bfa",
  Revisiones: "#e0a836",
  Renovaciones: "#8b5cf6",
  "Documentos y Firmas": "#3b82f6",
  "Casos Especiales": "#f43f5e",
  "Tareas y Checklists": "#f59e0b",
  Capacitación: "#06b6d4",
  Otros: "#94a3b8",
};

export interface OpsEvent {
  id: string;
  title: string;
  kind: EventKind;
  /** ISO `YYYY-MM-DD`. */
  date: string;
  /** "09:00" en 24 h; vacío si dura todo el día. */
  time: string;
  /** Duración en minutos, para colocarlo en la rejilla horaria. */
  durationMin: number;
  client: string;
  owner: string;
  location: string;
  order: number;
}

// ── Equipo ─────────────────────────────────────────────────────────────────

export type MemberStatus = "Activo" | "Invitación pendiente" | "Inactivo";

export const MEMBER_STATUS_TONE: Record<MemberStatus, BadgeTone> = {
  Activo: "emerald",
  "Invitación pendiente": "amber",
  Inactivo: "neutral",
};

export interface OpsMember {
  id: string;
  code: string;
  name: string;
  role: string;
  roleTone: BadgeTone;
  department: string;
  email: string;
  status: MemberStatus;
  lastAccess: string;
  /** Tareas asignadas y completadas, para la carga de trabajo. */
  tasksDone: number;
  tasksTotal: number;
  order: number;
}

// ── SLA ────────────────────────────────────────────────────────────────────

export interface SlaPolicy {
  id: string;
  name: string;
  /** 0-100. */
  compliance: number;
  description: string;
  order: number;
}

/** Umbrales con los que se clasifica el cumplimiento de una política o proceso. */
export const SLA_THRESHOLDS = { ok: 95, warning: 90 } as const;

export function slaTone(compliance: number): BadgeTone {
  if (compliance >= SLA_THRESHOLDS.ok) return "emerald";
  if (compliance >= SLA_THRESHOLDS.warning) return "amber";
  return "rose";
}
