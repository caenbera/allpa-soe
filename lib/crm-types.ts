/**
 * Tipos del módulo CRM, compartidos por los servicios de Firestore, las
 * vistas y los datos de demostración.
 *
 * Las colecciones llevan el prefijo `crm` para no confundirlas con la
 * colección raíz `companies`, que son las empresas *inquilinas* de la
 * plataforma y no las empresas del CRM.
 */

import type { BadgeTone } from "@/components/page-blocks/blocks/DataTable";

/** Colecciones del CRM bajo `companies/{companyId}/`. */
export const CRM_COLLECTIONS = {
  contacts: "crmContacts",
  accounts: "crmAccounts",
  families: "crmFamilies",
  relationships: "crmRelationships",
  deals: "crmDeals",
  activities: "crmActivities",
  products: "crmProducts",
  agreements: "crmAgreements",
  tags: "crmTags",
  segments: "crmSegments",
  automations: "crmAutomations",
} as const;

export type CrmCollection = (typeof CRM_COLLECTIONS)[keyof typeof CRM_COLLECTIONS];

// ── Contactos ──────────────────────────────────────────────────────────────

export type ContactStatus =
  | "Nuevo"
  | "Lead frío"
  | "Lead caliente"
  | "En seguimiento"
  | "Cita agendada"
  | "Propuesta enviada"
  | "Cliente";

export const CONTACT_STATUS_TONE: Record<ContactStatus, BadgeTone> = {
  Nuevo: "blue",
  "Lead frío": "neutral",
  "Lead caliente": "amber",
  "En seguimiento": "violet",
  "Cita agendada": "blue",
  "Propuesta enviada": "amber",
  Cliente: "emerald",
};

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  location: string;
  status: ContactStatus;
  /** 0-100; alimenta el anillo de puntaje. */
  score: number;
  /** Canal por el que llegó, ej. "Podcast · Episodio 12". */
  sourceChannel: string;
  sourceDetail: string;
  sourceIcon: string;
  advisor: string;
  mainInterest: string;
  interests: string[];
  tags: string[];
  lastActivity: string;
  lastActivityAt: string;
  isClient: boolean;
  /** Marcado como "mío" por el asesor que lo mira. */
  owned: boolean;
  referred: boolean;
  summary: string;
  personal: { label: string; value: string }[];
  financial: { label: string; value: string }[];
  scoreBreakdown: { label: string; value: number; max: number; color: string }[];
  order: number;
}

// ── Empresas y familias del CRM ────────────────────────────────────────────

export interface CrmAccount {
  id: string;
  name: string;
  industry: string;
  legalType: string;
  location: string;
  employees: number;
  estimatedValue: string;
  status: string;
  primaryContact: string;
  advisor: string;
  order: number;
}

export interface CrmFamily {
  id: string;
  name: string;
  members: number;
  primaryContact: string;
  primaryEmail: string;
  primaryPhone: string;
  location: string;
  activePolicies: number;
  annualValue: string;
  nextRenewal: string;
  daysToRenewal: number;
  status: string;
  advisor: string;
  order: number;
}

// ── Relaciones (aristas del grafo) ─────────────────────────────────────────

export type RelationshipNodeType = "persona" | "empresa" | "trust" | "producto" | "asesor";

export const RELATIONSHIP_NODE_COLOR: Record<RelationshipNodeType, string> = {
  persona: "#3b82f6",
  empresa: "#22c55e",
  trust: "#a78bfa",
  producto: "#e0a836",
  asesor: "#f59e0b",
};

export interface CrmRelationship {
  id: string;
  fromType: RelationshipNodeType;
  fromId: string;
  fromLabel: string;
  toType: RelationshipNodeType;
  toId: string;
  toLabel: string;
  /** Parentesco o vínculo: "Esposa", "Hijo", "Subsidiaria", "Beneficiario"… */
  kind: string;
  /** Porcentaje de participación, cuando aplica (organigrama). */
  ownership: number | null;
  order: number;
}

// ── Pipeline ───────────────────────────────────────────────────────────────

export interface PipelineStage {
  id: string;
  name: string;
  color: string;
  order: number;
}

/** Etapas por defecto del pipeline; el administrador puede ajustarlas. */
export const DEFAULT_PIPELINE_STAGES: PipelineStage[] = [
  { id: "nuevos", name: "Nuevos Leads", color: "#a78bfa", order: 0 },
  { id: "contactados", name: "Contactados", color: "#3b82f6", order: 1 },
  { id: "descubrimiento", name: "Descubrimiento", color: "#22c55e", order: 2 },
  { id: "diagnostico", name: "Diagnóstico", color: "#14b8a6", order: 3 },
  { id: "estrategia", name: "Estrategia", color: "#e0a836", order: 4 },
  { id: "propuesta", name: "Propuesta", color: "#f472b6", order: 5 },
  { id: "seguimiento", name: "Seguimiento", color: "#f59e0b", order: 6 },
  { id: "ganado", name: "Cliente Ganado", color: "#22c55e", order: 7 },
  { id: "perdido", name: "Perdido", color: "#94a3b8", order: 8 },
];

export interface Deal {
  id: string;
  contactName: string;
  stageId: string;
  sourceChannel: string;
  sourceDetail: string;
  sourceIcon: string;
  headline: string;
  interest: string;
  score: number;
  value: number;
  nextAction: string;
  timeLabel: string;
  closedAt: string | null;
  lostReason: string | null;
  order: number;
}

// ── Actividad ──────────────────────────────────────────────────────────────

export type ActivityKind = "Llamada" | "Email" | "Reunión" | "Tarea" | "Nota" | "Cambio";

export const ACTIVITY_META: Record<ActivityKind, { icon: string; color: string }> = {
  Llamada: { icon: "Phone", color: "#22c55e" },
  Email: { icon: "Mail", color: "#3b82f6" },
  Reunión: { icon: "CalendarDays", color: "#a78bfa" },
  Tarea: { icon: "CheckCircle2", color: "#14b8a6" },
  Nota: { icon: "StickyNote", color: "#e0a836" },
  Cambio: { icon: "History", color: "#94a3b8" },
};

export interface Activity {
  id: string;
  kind: ActivityKind;
  contactName: string;
  contactRole: string;
  title: string;
  detail: string;
  source: string;
  user: string;
  timeLabel: string;
  order: number;
}

// ── Catálogos ──────────────────────────────────────────────────────────────

export interface CrmProduct {
  id: string;
  name: string;
  kind: string;
  holder: string;
  annualPremium: string;
  coverage: string;
  status: string;
  renewsAt: string;
  order: number;
}

export interface CrmAgreement {
  id: string;
  name: string;
  kind: string;
  parties: string;
  signedAt: string;
  status: string;
  order: number;
}

export interface CrmTag {
  id: string;
  name: string;
  tone: BadgeTone;
  entity: "Contacto" | "Empresa";
  category: string;
  usedIn: string[];
  records: number;
  createdBy: string;
  createdAt: string;
  active: boolean;
  order: number;
}

export interface CrmSegment {
  id: string;
  name: string;
  description: string;
  entity: "Contacto" | "Empresa";
  icon: string;
  contacts: number;
  accounts: number;
  createdBy: string;
  createdAt: string;
  active: boolean;
  order: number;
}

export interface AutomationStep {
  icon: string;
  /** Espera antes del siguiente paso, ej. "1d", "24h". */
  delay?: string;
}

export interface CrmAutomation {
  id: string;
  name: string;
  description: string;
  kind: string;
  kindTone: BadgeTone;
  trigger: string;
  triggerDetail: string;
  steps: AutomationStep[];
  active: boolean;
  performance: number;
  performanceLabel: string;
  createdBy: string;
  createdAt: string;
  order: number;
}
