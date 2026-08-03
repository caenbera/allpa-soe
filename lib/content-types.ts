/**
 * Tipos del módulo Contenido, compartidos por los servicios de Firestore,
 * las vistas y los datos de demostración.
 */

import type { BadgeTone } from "@/components/page-blocks/blocks/DataTable";

export type EpisodeStatus = "Publicado" | "En producción" | "Planeado" | "Pausado";
export type ClassStatus = "Publicada" | "En producción" | "Planeada";
export type MediaKind = "Imagen" | "Video" | "Audio" | "Documento" | "Plantilla";
export type ResourceKind = "PDF" | "Checklist" | "Ebook" | "Worksheet" | "Guía" | "Calculadora" | "Plantilla";
export type DerivedFormat =
  | "Video corto"
  | "Video largo"
  | "Podcast"
  | "Artículo / Blog"
  | "PDF / Guía"
  | "Infografía"
  | "Presentación"
  | "Checklist"
  | "Email / Newsletter"
  | "Carrusel";

export interface Pillar {
  id: string;
  name: string;
  tone: BadgeTone;
  color: string;
  icon: string;
  description: string;
  weeksPlanned: number;
  growth: string | null;
  order: number;
  /** Temas que cubre el pilar; se muestran como viñetas en su tarjeta. */
  topics?: string[];
}

/**
 * Los nueve canales por los que se distribuye cada episodio madre.
 * Las tarjetas de semana pintan un punto por canal y lo rellenan según
 * cuántos activos lleva generados el episodio, así que no hace falta
 * guardar el desglose en cada documento.
 */
export const CONTENT_CHANNELS = [
  { id: "youtube", label: "YouTube (Largo)", icon: "Video", color: "#ef4444" },
  { id: "clips", label: "Clips & Shorts", icon: "Scissors", color: "#22c55e" },
  { id: "carrusel", label: "Carrusel", icon: "Rows3", color: "#3b82f6" },
  { id: "pdf", label: "PDF / Guía", icon: "FileDown", color: "#f472b6" },
  { id: "academia", label: "Academia", icon: "GraduationCap", color: "#a78bfa" },
  { id: "email", label: "Email", icon: "Mail", color: "#e0a836" },
  { id: "articulo", label: "Artículo SEO", icon: "FileText", color: "#22c55e" },
  { id: "reels", label: "Reels", icon: "Camera", color: "#f472b6" },
  { id: "podcast", label: "Podcast", icon: "Mic", color: "#a78bfa" },
] as const;

import type { FlowStep } from "@/components/page-blocks/blocks/FlowStrip";
import type { AssetCard } from "@/components/page-blocks/blocks/AssetProgressGrid";
import type { TimelineStep } from "@/components/page-blocks/blocks/Timeline";
import type { PersonInfo } from "@/components/page-blocks/blocks/PersonCard";
import type { InfoRow } from "@/components/page-blocks/blocks/InfoCard";
import type { FileEntry } from "@/components/page-blocks/blocks/FileList";
import type { ChecklistLine } from "@/components/page-blocks/blocks/ChecklistPanel";
import type { NoteEntry } from "@/components/page-blocks/blocks/NotesPanel";

/**
 * Detalle profundo de un episodio: lo que muestra el Centro de Contenido en
 * sus seis pestañas. Es opcional — un episodio recién creado no lo tiene y
 * la pantalla muestra los bloques vacíos, listos para llenarse.
 */
export interface EpisodeDetail {
  description: string;
  dates: string;
  episodeLabel: string;
  guest: PersonInfo | null;
  keyPoints: string[];
  generalInfo: InfoRow[];
  productionInfo: InfoRow[];
  distributionFlow: FlowStep[];
  assets: AssetCard[];
  timeline: TimelineStep[];
  nextSteps: ChecklistLine[];
  productionChecklist: ChecklistLine[];
  documentsChecklist: ChecklistLine[];
  resources: FileEntry[];
  episodeResources: FileEntry[];
  documents: FileEntry[];
  quickNotes: NoteEntry[];
  episodeNotes: string[];
  seoKeywords: string[];
  conversationNotes: string;
}

export interface Episode {
  id: string;
  week: number;
  title: string;
  subtitle: string;
  guest: string;
  guestRole: string;
  pillarId: string;
  status: EpisodeStatus;
  progress: number;
  assetsDone: number;
  assetsTotal: number;
  publishDate: string;
  order: number;
  /** Rango de la semana, ej. "22 – 28 mar". */
  dateRange?: string;
  detail?: EpisodeDetail | null;
}

export interface DerivedContent {
  id: string;
  title: string;
  subtitle: string;
  episodeTitle: string;
  episodeWeek: number;
  format: DerivedFormat;
  formatMeta: string;
  channels: string[];
  pillarId: string;
  status: EpisodeStatus;
  publishDate: string;
  order: number;
}

export interface MediaAsset {
  id: string;
  name: string;
  kind: MediaKind;
  topic: string;
  pillarId: string | null;
  episodeTitle: string | null;
  episodeWeek: number | null;
  uploadedAt: string;
  size: string;
  order: number;
}

export interface AcademyClass {
  id: string;
  title: string;
  subtitle: string;
  pillarId: string;
  level: "Básico" | "Intermedio" | "Avanzado";
  lessons: number;
  duration: string;
  students: number;
  rating: string;
  status: ClassStatus;
  progress: number;
  episodeWeek: number;
  order: number;
}

export interface Downloadable {
  id: string;
  kind: ResourceKind;
  title: string;
  description: string;
  downloads: number;
  leads: number;
  conversion: string;
  topic: string;
  pillarId: string;
  episodeWeek: number;
  active: boolean;
  order: number;
}

/** Colecciones del módulo Contenido bajo `companies/{companyId}/`. */
export const CONTENT_COLLECTIONS = {
  pillars: "pillars",
  episodes: "episodes",
  derivedContent: "derivedContent",
  mediaAssets: "mediaAssets",
  academyClasses: "academyClasses",
  downloadables: "downloadables",
} as const;

export type ContentCollection = (typeof CONTENT_COLLECTIONS)[keyof typeof CONTENT_COLLECTIONS];

export const STATUS_TONE: Record<EpisodeStatus, BadgeTone> = {
  Publicado: "emerald",
  "En producción": "amber",
  Planeado: "blue",
  Pausado: "neutral",
};

export const CLASS_STATUS_TONE: Record<ClassStatus, BadgeTone> = {
  Publicada: "emerald",
  "En producción": "amber",
  Planeada: "blue",
};
