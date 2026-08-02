/**
 * Datos de ejemplo del módulo Contenido.
 *
 * Vive en un solo archivo porque varias páginas comparten los mismos
 * episodios, pilares y activos (Episodios Madre, Contenido Derivado,
 * Calendario y Centro de Contenido son vistas distintas del mismo plan).
 * Cuando se conecte Firestore, este archivo es el único punto a sustituir.
 */

import type { BadgeTone } from "@/components/page-blocks/blocks/DataTable";

export interface Pillar {
  id: string;
  name: string;
  tone: BadgeTone;
  color: string;
}

export const PILLARS: Pillar[] = [
  { id: "proteccion", name: "Protección", tone: "violet", color: "#a78bfa" },
  { id: "crecimiento", name: "Crecimiento", tone: "emerald", color: "#22c55e" },
  { id: "proteccion-legal", name: "Protección Legal", tone: "blue", color: "#3b82f6" },
  { id: "negocios", name: "Negocios Familiares", tone: "amber", color: "#e0a836" },
  { id: "legado", name: "Legado Familiar", tone: "rose", color: "#f472b6" },
  { id: "bienestar", name: "Bienestar Integral", tone: "neutral", color: "#94a3b8" },
];

export type EpisodeStatus = "Publicado" | "En producción" | "Planeado" | "Pausado";

export const STATUS_TONE: Record<EpisodeStatus, BadgeTone> = {
  Publicado: "emerald",
  "En producción": "amber",
  Planeado: "blue",
  Pausado: "neutral",
};

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
}

/** Canales por los que se distribuye cada episodio, en orden del flujo. */
export const CHANNEL_ICONS = ["Mic", "Video", "Camera", "Rows3", "FileText", "Mail", "GraduationCap"];

export const EPISODES: Episode[] = [
  { id: "ep-01", week: 1, title: "La verdad sobre el seguro de vida", subtitle: "Mitos y realidades que debes conocer", guest: "Luis Barajas", guestRole: "Asesor financiero", pillarId: "proteccion", status: "Publicado", progress: 100, assetsDone: 10, assetsTotal: 10, publishDate: "08 ene 2027" },
  { id: "ep-02", week: 2, title: "¿Necesito un Trust si no soy millonario?", subtitle: "Por qué los Trusts son para todos", guest: "Sonia Muñoz", guestRole: "Abogada de Estate Planning", pillarId: "proteccion-legal", status: "En producción", progress: 60, assetsDone: 6, assetsTotal: 10, publishDate: "15 ene 2027" },
  { id: "ep-03", week: 3, title: "Disability Insurance en español", subtitle: "Protege tus ingresos si no puedes trabajar", guest: "Anthony Aguilar", guestRole: "Especialista en seguros", pillarId: "proteccion", status: "En producción", progress: 50, assetsDone: 5, assetsTotal: 10, publishDate: "22 ene 2027" },
  { id: "ep-04", week: 4, title: "Long-Term Care: el plan que tu familia necesita", subtitle: "Evita ser una carga financiera", guest: "Clara Rodríguez", guestRole: "Geriatra", pillarId: "proteccion", status: "Planeado", progress: 20, assetsDone: 2, assetsTotal: 10, publishDate: "29 ene 2027" },
  { id: "ep-05", week: 5, title: "Annuities: ingresos garantizados para tu retiro", subtitle: "Convierte tu ahorro en pagos de por vida", guest: "Ricardo González", guestRole: "Planificador de retiro", pillarId: "crecimiento", status: "Planeado", progress: 10, assetsDone: 1, assetsTotal: 10, publishDate: "05 feb 2027" },
  { id: "ep-06", week: 6, title: "Protege tu negocio con Key Person Insurance", subtitle: "Asegura la continuidad de tu empresa", guest: "Carla Rodríguez", guestRole: "Consultora de negocios", pillarId: "negocios", status: "En producción", progress: 40, assetsDone: 4, assetsTotal: 10, publishDate: "12 feb 2027" },
  { id: "ep-07", week: 7, title: "Estate Planning: por dónde empezar", subtitle: "Documentos esenciales que necesitas", guest: "Luis Hernández", guestRole: "Abogado patrimonial", pillarId: "proteccion-legal", status: "Planeado", progress: 0, assetsDone: 0, assetsTotal: 10, publishDate: "19 feb 2027" },
  { id: "ep-08", week: 8, title: "¿Cómo reducir impuestos legalmente?", subtitle: "Estrategias fiscales para tu familia y negocio", guest: "Mariela Quintero", guestRole: "Contadora pública", pillarId: "crecimiento", status: "Planeado", progress: 0, assetsDone: 0, assetsTotal: 10, publishDate: "26 feb 2027" },
  { id: "ep-09", week: 9, title: "Educación financiera para tus hijos", subtitle: "Cómo enseñarles a manejar el dinero", guest: "Javier Rivas", guestRole: "Educador financiero", pillarId: "legado", status: "Planeado", progress: 0, assetsDone: 0, assetsTotal: 10, publishDate: "05 mar 2027" },
  { id: "ep-10", week: 10, title: "Buy-Sell Agreements: protege tu empresa", subtitle: "Evita conflictos entre socios y familiares", guest: "Miguel Gómez", guestRole: "Abogado corporativo", pillarId: "negocios", status: "Pausado", progress: 0, assetsDone: 0, assetsTotal: 10, publishDate: "—" },
  { id: "ep-11", week: 11, title: "Impuestos sobre herencias: lo que debes saber", subtitle: "Planifica antes de que sea tarde", guest: "Pablo Sánchez", guestRole: "Asesor fiscal", pillarId: "crecimiento", status: "Planeado", progress: 5, assetsDone: 0, assetsTotal: 10, publishDate: "12 mar 2027" },
  { id: "ep-12", week: 12, title: "¿Necesito un Trust si no soy millonario?", subtitle: "Protección legal al alcance de tu familia", guest: "Sonia Muñoz", guestRole: "Abogada de Estate Planning", pillarId: "proteccion-legal", status: "En producción", progress: 78, assetsDone: 7, assetsTotal: 10, publishDate: "22 mar 2027" },
];

export type DerivedFormat = "Video corto" | "Video largo" | "Podcast" | "Artículo / Blog" | "PDF / Guía" | "Infografía" | "Presentación" | "Checklist" | "Email / Newsletter" | "Carrusel";

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
}

export const DERIVED_CONTENT: DerivedContent[] = [
  { id: "dc-01", title: "La verdad sobre el seguro de vida | Reel", subtitle: "Video corto para redes sociales", episodeTitle: "La verdad sobre el seguro de vida", episodeWeek: 1, format: "Video corto", formatMeta: "0:45", channels: ["Camera", "MessageCircle", "Music2"], pillarId: "proteccion", status: "Publicado", publishDate: "10 ene 2027" },
  { id: "dc-02", title: "¿Necesito un Trust? | Podcast", subtitle: "Audio para plataformas de podcast", episodeTitle: "¿Necesito un Trust si no soy millonario?", episodeWeek: 12, format: "Podcast", formatMeta: "18:32", channels: ["Mic", "Video"], pillarId: "proteccion-legal", status: "En producción", publishDate: "17 ene 2027" },
  { id: "dc-03", title: "Disability Insurance en español | Blog", subtitle: "Artículo completo para el blog", episodeTitle: "Disability Insurance en español", episodeWeek: 3, format: "Artículo / Blog", formatMeta: "1.200 palabras", channels: ["Globe"], pillarId: "proteccion", status: "Publicado", publishDate: "22 ene 2027" },
  { id: "dc-04", title: "Long-Term Care: Infografía", subtitle: "Infografía para compartir", episodeTitle: "Long-Term Care: el plan que tu familia necesita", episodeWeek: 4, format: "Infografía", formatMeta: "1 pieza", channels: ["Camera", "Briefcase"], pillarId: "proteccion", status: "Planeado", publishDate: "30 ene 2027" },
  { id: "dc-05", title: "Guía: Annuities paso a paso", subtitle: "Guía descargable en PDF", episodeTitle: "Annuities: ingresos garantizados", episodeWeek: 5, format: "PDF / Guía", formatMeta: "8 páginas", channels: ["Globe"], pillarId: "crecimiento", status: "Publicado", publishDate: "06 feb 2027" },
  { id: "dc-06", title: "Protege tu negocio | Video YouTube", subtitle: "Video educativo para YouTube", episodeTitle: "Protege tu negocio con Key Person Insurance", episodeWeek: 6, format: "Video largo", formatMeta: "6:12", channels: ["Video"], pillarId: "negocios", status: "En producción", publishDate: "13 feb 2027" },
  { id: "dc-07", title: "Estate Planning: Presentación", subtitle: "Presentación para seminarios", episodeTitle: "Estate Planning: por dónde empezar", episodeWeek: 7, format: "Presentación", formatMeta: "15 diapositivas", channels: ["Briefcase"], pillarId: "proteccion-legal", status: "Planeado", publishDate: "20 feb 2027" },
  { id: "dc-08", title: "Checklist: Sucesión Patrimonial", subtitle: "Lista de verificación descargable", episodeTitle: "Estate Planning: por dónde empezar", episodeWeek: 7, format: "Checklist", formatMeta: "1 página", channels: ["Globe"], pillarId: "legado", status: "Publicado", publishDate: "01 mar 2027" },
  { id: "dc-09", title: "Educación financiera | Testimonio", subtitle: "Testimonio en video corto", episodeTitle: "Educación financiera para tus hijos", episodeWeek: 9, format: "Video corto", formatMeta: "1:05", channels: ["Camera", "MessageCircle"], pillarId: "legado", status: "En producción", publishDate: "05 mar 2027" },
  { id: "dc-10", title: "Newsletter: Resumen semanal", subtitle: "Email con resumen de contenido", episodeTitle: "Resumen Semanal – Semana 12", episodeWeek: 12, format: "Email / Newsletter", formatMeta: "1 envío", channels: ["Mail"], pillarId: "crecimiento", status: "Publicado", publishDate: "15 ene 2027" },
  { id: "dc-11", title: "¿Trust vs Testamento? | Carrusel", subtitle: "Carrusel educativo para Instagram", episodeTitle: "¿Necesito un Trust si no soy millonario?", episodeWeek: 12, format: "Carrusel", formatMeta: "8 slides", channels: ["Camera"], pillarId: "proteccion-legal", status: "Publicado", publishDate: "20 mar 2027" },
  { id: "dc-12", title: "3 mitos sobre los Trusts | Reel", subtitle: "Video corto de alto alcance", episodeTitle: "¿Necesito un Trust si no soy millonario?", episodeWeek: 12, format: "Video corto", formatMeta: "0:38", channels: ["Camera", "Music2"], pillarId: "proteccion-legal", status: "Publicado", publishDate: "21 mar 2027" },
];

export type MediaKind = "Imagen" | "Video" | "Audio" | "Documento" | "Plantilla";

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
}

export const MEDIA_ASSETS: MediaAsset[] = [
  { id: "ma-01", name: "Protege tu hogar y a los que amas.jpg", kind: "Imagen", topic: "Hogar", pillarId: "proteccion", episodeTitle: "Long-Term Care: el plan que tu familia necesita", episodeWeek: 4, uploadedAt: "10 may 2027", size: "2.4 MB" },
  { id: "ma-02", name: "¿Necesito un Trust si no soy millonario?.mp4", kind: "Video", topic: "Educación", pillarId: "proteccion-legal", episodeTitle: "¿Necesito un Trust si no soy millonario?", episodeWeek: 12, uploadedAt: "09 may 2027", size: "85.6 MB" },
  { id: "ma-03", name: "Guía: Annuities paso a paso.pdf", kind: "Documento", topic: "Retiro", pillarId: "crecimiento", episodeTitle: "Annuities: ingresos garantizados", episodeWeek: 5, uploadedAt: "08 may 2027", size: "4.8 MB" },
  { id: "ma-04", name: "Podcast - Disability Insurance en español.mp3", kind: "Audio", topic: "Seguro de ingresos", pillarId: "proteccion", episodeTitle: "Disability Insurance en español", episodeWeek: 3, uploadedAt: "07 may 2027", size: "18.7 MB" },
  { id: "ma-05", name: "Infografía - Estate Planning.png", kind: "Imagen", topic: "Planificación", pillarId: "proteccion-legal", episodeTitle: "Estate Planning: por dónde empezar", episodeWeek: 7, uploadedAt: "06 may 2027", size: "1.6 MB" },
  { id: "ma-06", name: "Testimonio - Deja más que dinero.mp4", kind: "Video", topic: "Legado", pillarId: "legado", episodeTitle: "Educación financiera para tus hijos", episodeWeek: 9, uploadedAt: "05 may 2027", size: "46.3 MB" },
  { id: "ma-07", name: "Plantilla - Calendario de Contenidos.pptx", kind: "Plantilla", topic: "Plantillas", pillarId: null, episodeTitle: null, episodeWeek: null, uploadedAt: "04 may 2027", size: "3.2 MB" },
  { id: "ma-08", name: "Newsletter - Resumen Semanal 12.jpg", kind: "Imagen", topic: "Newsletter", pillarId: null, episodeTitle: "Newsletter: Resumen semanal", episodeWeek: 12, uploadedAt: "03 may 2027", size: "1.1 MB" },
  { id: "ma-09", name: "Checklist - Protección Patrimonial.pdf", kind: "Documento", topic: "Patrimonio", pillarId: "legado", episodeTitle: "Estate Planning: por dónde empezar", episodeWeek: 7, uploadedAt: "02 may 2027", size: "0.9 MB" },
  { id: "ma-10", name: "Reel - 3 mitos sobre los Trusts.mp4", kind: "Video", topic: "Educación", pillarId: "proteccion-legal", episodeTitle: "¿Necesito un Trust si no soy millonario?", episodeWeek: 12, uploadedAt: "01 may 2027", size: "22.8 MB" },
  { id: "ma-11", name: "Audio - Intro musical Allpa.mp3", kind: "Audio", topic: "Marca", pillarId: null, episodeTitle: null, episodeWeek: null, uploadedAt: "28 abr 2027", size: "3.4 MB" },
  { id: "ma-12", name: "Plantilla - Carrusel Instagram.fig", kind: "Plantilla", topic: "Plantillas", pillarId: null, episodeTitle: null, episodeWeek: null, uploadedAt: "27 abr 2027", size: "12.6 MB" },
];

export function pillarOf(id: string | null): Pillar | undefined {
  return PILLARS.find((p) => p.id === id);
}
