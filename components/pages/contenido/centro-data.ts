/** Datos de ejemplo del Centro de Contenido (detalle de la Semana 12). */

import type { FlowStep } from "@/components/page-blocks/blocks/FlowStrip";
import type { AssetCard } from "@/components/page-blocks/blocks/AssetProgressGrid";
import type { TimelineStep } from "@/components/page-blocks/blocks/Timeline";
import type { PersonInfo } from "@/components/page-blocks/blocks/PersonCard";
import type { InfoRow } from "@/components/page-blocks/blocks/InfoCard";
import type { FileEntry } from "@/components/page-blocks/blocks/FileList";
import type { ChecklistLine } from "@/components/page-blocks/blocks/ChecklistPanel";
import type { NoteEntry } from "@/components/page-blocks/blocks/NotesPanel";

export const WEEK = {
  number: 12,
  episode: "Ep. 12",
  title: "¿Necesito un Trust si no soy millonario?",
  description:
    "Muchas familias creen que los Trusts son solo para personas ricas. En este episodio desmitificamos los Trusts y explicamos cuándo, por qué y cómo pueden proteger a tu familia, aunque no seas millonario.",
  dates: "22 – 28 mar 2027",
  pillar: "Protección Legal",
};

export const GUEST: PersonInfo = {
  name: "Sonia Muñoz Gallagher",
  role: "Abogada de Estate Planning",
  org: "Socia en Gallagher Law Group",
  location: "Miami, FL",
  email: "sonia@gallagherlawgroup.com",
  phone: "(305) 555-0123",
  website: "GallagherLawGroup.com",
  actionLabel: "Ver ficha completa",
};

export const KEY_POINTS = [
  "Los Trusts no son solo para millonarios.",
  "Protección de la familia y de los menores.",
  "Evitar el probate y ahorrar tiempo y dinero.",
  "Flexibilidad y control de tus bienes.",
  "Pasos prácticos para crear tu primer Trust.",
];

export const GENERAL_INFO: InfoRow[] = [
  { label: "Estado", value: "En Producción", tone: "amber" },
  { label: "Tipo de episodio", value: "Educativo" },
  { label: "Duración estimada", value: "45 – 60 min" },
  { label: "Grabación", value: "15 mar 2027" },
  { label: "Publicación podcast", value: "22 mar 2027" },
  { label: "Responsable", value: "Diana Bermeo", person: true },
  { label: "Productor", value: "Anthony Aguilar", person: true },
  { label: "Prioridad", value: "Alta", icon: "Flag" },
];

export const PRODUCTION_INFO: InfoRow[] = [
  { label: "Estado", value: "En Producción", tone: "amber" },
  { label: "Etapa actual", value: "Edición" },
  { label: "Fecha de grabación", value: "15 mar 2027" },
  { label: "Publicado en podcast", value: "—" },
  { label: "Duración estimada", value: "45 – 60 min" },
  { label: "Productor", value: "Anthony Aguilar", person: true },
  { label: "Editor", value: "Carla Rodríguez", person: true },
  { label: "Diseñador", value: "Luis Hernández", person: true },
  { label: "Prioridad", value: "Alta", icon: "Flag" },
];

export const EPISODE_INFO: InfoRow[] = [
  { label: "Temporada", value: "2" },
  { label: "Número de episodio", value: "12" },
  { label: "Duración estimada", value: "55 min" },
  { label: "Idioma", value: "Español" },
  { label: "Tipo de episodio", value: "Educativo" },
  { label: "Publicado el", value: "—" },
];

export const DISTRIBUTION_FLOW: FlowStep[] = [
  { id: "podcast", label: "Podcast", sub: "Episodio madre", icon: "Mic", color: "#a78bfa", status: "En Producción" },
  { id: "youtube", label: "YouTube", sub: "Video largo", icon: "Video", color: "#ef4444", status: "En Producción" },
  { id: "reels", label: "Reels", sub: "10 videos", icon: "Camera", color: "#f472b6", status: "En Producción" },
  { id: "shorts", label: "Shorts", sub: "5 videos", icon: "Music2", color: "#3b82f6", status: "Pendiente" },
  { id: "carrusel", label: "Carrusel", sub: "Instagram", icon: "Rows3", color: "#22c55e", status: "En Producción" },
  { id: "articulo", label: "Artículo", sub: "Blog / SEO", icon: "FileText", color: "#e0a836", status: "En Producción" },
  { id: "pdf", label: "PDF / Guía", sub: "Descargable", icon: "FileDown", color: "#a78bfa", status: "Pendiente" },
  { id: "email", label: "Email", sub: "Secuencia", icon: "Mail", color: "#22c55e", status: "Pendiente" },
  { id: "academia", label: "Academia", sub: "Clase", icon: "GraduationCap", color: "#3b82f6", status: "No Iniciado" },
];

export const ASSETS: AssetCard[] = [
  {
    id: "a1", index: 1, title: "Podcast (Madre)", icon: "Mic", color: "#a78bfa", progress: 100,
    lines: [{ label: "Grabación", done: true }, { label: "Edición de audio", done: true }, { label: "Mastering", done: true }, { label: "Publicación", done: true }],
    footerNote: "Publicado: 16 mar 2027", footerAction: "Ver activo",
  },
  {
    id: "a2", index: 2, title: "YouTube (Largo)", icon: "Video", color: "#ef4444", progress: 100,
    lines: [{ label: "Edición de video", done: true }, { label: "Miniatura", done: true }, { label: "Descripción & SEO", done: true }, { label: "Publicado en YouTube", done: true }],
    footerNote: "Publicado: 17 mar 2027", footerAction: "Ver en YouTube",
  },
  {
    id: "a3", index: 3, title: "Clips & Shorts", icon: "Scissors", color: "#f472b6", progress: 70,
    lines: [{ label: "Clips generados 10/15", done: true }, { label: "Edición vertical 7/15", done: true }, { label: "Subtítulos 7/15", done: true }, { label: "Programación 5/15", done: false }],
    footerNote: "En progreso", footerAction: "Ver clips",
  },
  {
    id: "a4", index: 4, title: "Reels Instagram", icon: "Camera", color: "#ef4444", progress: 60,
    lines: [{ label: "Guiones 6/10", done: true }, { label: "Edición 4/10", done: true }, { label: "Diseño portada 4/10", done: false }, { label: "Programación 3/15", done: false }],
    footerNote: "En progreso", footerAction: "Ver reels",
  },
  {
    id: "a5", index: 5, title: "Carrusel", icon: "Rows3", color: "#3b82f6", progress: 100,
    lines: [{ label: "Diseño", done: true }, { label: "Copywriting", done: true }, { label: "Revisión", done: true }, { label: "Publicado", done: true }],
    footerNote: "Publicado: 20 mar 2027", footerAction: "Ver carrusel",
  },
  {
    id: "a6", index: 6, title: "Artículo SEO", icon: "FileText", color: "#22c55e", progress: 80,
    lines: [{ label: "Investigación keywords", done: true }, { label: "Outline", done: true }, { label: "Redacción", done: true }, { label: "Optimización SEO", done: true }, { label: "Publicado", done: false }],
    footerNote: "En revisión final", footerAction: "Ver borrador",
  },
  {
    id: "a7", index: 7, title: "PDF / Guía", icon: "FileDown", color: "#a78bfa", progress: 60,
    lines: [{ label: "Diseño", done: true }, { label: "Contenido", done: true }, { label: "Revisión", done: false }, { label: "Aprobación", done: false }],
    footerNote: "En diseño", footerAction: "Ver borrador",
  },
  {
    id: "a8", index: 8, title: "Email (Secuencia)", icon: "Mail", color: "#22c55e", progress: 30,
    lines: [{ label: "Estrategia", done: true }, { label: "Redacción emails", done: false }, { label: "Diseño", done: false }, { label: "Programación", done: false }],
    footerNote: "Inicia: 22 mar 2027", footerAction: "Ver detalle",
  },
  {
    id: "a9", index: 9, title: "Academia (Clase)", icon: "GraduationCap", color: "#3b82f6", progress: 20,
    lines: [{ label: "Guion de la clase", done: true }, { label: "Presentación", done: false }, { label: "Grabación", done: false }, { label: "Publicación", done: false }],
    footerNote: "Inicia: 25 mar 2027", footerAction: "Ver detalle",
  },
  {
    id: "a10", index: 10, title: "Biblioteca", icon: "Library", color: "#94a3b8", progress: 0,
    lines: [{ label: "Organizar archivos", done: false }, { label: "Etiquetas", done: false }, { label: "Descripción", done: false }, { label: "Archivo final", done: false }],
    footerNote: "Pendiente", footerAction: "Ver biblioteca",
  },
];

export const TIMELINE: TimelineStep[] = [
  { id: "t1", label: "Planeación del episodio", status: "Completado", tone: "emerald", date: "01 mar 2027", done: true },
  { id: "t2", label: "Confirmación de invitada", status: "Completado", tone: "emerald", date: "05 mar 2027", done: true },
  { id: "t3", label: "Guion y preguntas", status: "En Revisión", tone: "amber", date: "08 mar 2027" },
  { id: "t4", label: "Grabación", status: "Programado", tone: "blue", date: "15 mar 2027" },
  { id: "t5", label: "Edición y postproducción", status: "En Producción", tone: "amber", date: "16 – 20 mar 2027" },
  { id: "t6", label: "Publicación Podcast", status: "Programado", tone: "blue", date: "22 mar 2027" },
  { id: "t7", label: "Distribución a plataformas", status: "Programado", tone: "blue", date: "22 – 24 mar 2027" },
];

export const NEXT_STEPS: ChecklistLine[] = [
  { id: "n1", label: "Finalizar edición del podcast", done: false, meta: "15 mar" },
  { id: "n2", label: "Grabar clips para Reels y Shorts", done: false, meta: "16 mar" },
  { id: "n3", label: "Crear outline del artículo SEO", done: false, meta: "16 mar" },
  { id: "n4", label: "Diseñar carrusel para Instagram", done: false, meta: "17 mar" },
  { id: "n5", label: "Preparar guía descargable (PDF)", done: false, meta: "18 mar" },
];

export const PRODUCTION_CHECKLIST: ChecklistLine[] = [
  { id: "p1", label: "Guion y preguntas", done: true, meta: "15 feb" },
  { id: "p2", label: "Confirmación de invitada", done: true, meta: "01 mar" },
  { id: "p3", label: "Investigación y notas", done: true, meta: "05 mar" },
  { id: "p4", label: "Grabación", done: true, meta: "15 mar" },
  { id: "p5", label: "Edición de audio/video", done: false, meta: "En progreso" },
  { id: "p6", label: "Revisión final", done: false, meta: "Pendiente" },
  { id: "p7", label: "Aprobación", done: false, meta: "Pendiente" },
  { id: "p8", label: "Publicación", done: false, meta: "Pendiente" },
];

export const DOCUMENTS_CHECKLIST: ChecklistLine[] = [
  { id: "d1", label: "Guion del episodio", done: true },
  { id: "d2", label: "Investigación y estadísticas", done: true },
  { id: "d3", label: "Preguntas para la invitada", done: true },
  { id: "d4", label: "Recursos y referencias", done: true },
  { id: "d5", label: "Descargos legales revisados", done: true },
  { id: "d6", label: "Aprobación de guion", done: false },
  { id: "d7", label: "Material visual / presentación", done: false },
  { id: "d8", label: "Checklist final de publicación", done: false },
  { id: "d9", label: "Permisos y autorizaciones", done: false },
];

export const RESOURCES: FileEntry[] = [
  { id: "r1", name: "Guion_Ep12_v1.docx", kind: "doc", meta: "DOCX · 48 KB", tag: "Guion" },
  { id: "r2", name: "Investigacion_Trusts.pdf", kind: "pdf", meta: "PDF · 1.2 MB", tag: "Investigación" },
  { id: "r3", name: "Checklist_Trusts.docx", kind: "doc", meta: "DOCX · 38 KB", tag: "Recurso" },
  { id: "r4", name: "Plantilla_Trust_Basico.docx", kind: "doc", meta: "DOCX · 52 KB", tag: "Recurso" },
  { id: "r5", name: "Presentacion_Slides.pdf", kind: "pdf", meta: "PDF · 2.4 MB", tag: "Recurso" },
];

export const EPISODE_RESOURCES: FileEntry[] = [
  { id: "er1", name: "Brief del episodio.pdf", kind: "pdf", meta: "PDF · 245 KB" },
  { id: "er2", name: "Guion_Ep12_v1.docx", kind: "doc", meta: "DOCX · 48 KB" },
  { id: "er3", name: "Research_Trusts.docx", kind: "doc", meta: "DOCX · 92 KB" },
  { id: "er4", name: "Plan de promoción.pdf", kind: "pdf", meta: "PDF · 320 KB" },
];

export const DOCUMENTS: FileEntry[] = [
  { id: "doc1", name: "Guion_Ep12_v1.docx", kind: "doc", meta: "Diana Bermeo · 05 mar 2027", tag: "Guion" },
  { id: "doc2", name: "Investigacion_Trusts.xlsx", kind: "sheet", meta: "Anthony Aguilar · 05 mar 2027", tag: "Investigación" },
  { id: "doc3", name: "Estadisticas_Probate_FL.pdf", kind: "pdf", meta: "Carla Rodríguez · 06 mar 2027", tag: "Referencia" },
  { id: "doc4", name: "Presentacion_Visuales.pptx", kind: "image", meta: "Luis Hernández · 06 mar 2027", tag: "Recurso" },
  { id: "doc5", name: "Checklist_Trusts.docx", kind: "doc", meta: "Diana Bermeo · 07 mar 2027", tag: "Recurso" },
  { id: "doc6", name: "Ejemplos_Casos_Reales.pdf", kind: "pdf", meta: "Sonia M. Gallagher · 08 mar 2027", tag: "Referencia" },
  { id: "doc7", name: "Notas_Invitada.docx", kind: "doc", meta: "Diana Bermeo · 10 mar 2027", tag: "Notas" },
  { id: "doc8", name: "Recursos_Adicionales", kind: "folder", meta: "Anthony Aguilar · 10 mar 2027", tag: "Carpeta" },
];

export const QUICK_NOTES: NoteEntry[] = [
  { id: "q1", icon: "Pin", title: "Enfoque principal", text: "Explicar en lenguaje simple qué es un Trust y por qué sí es para familias promedio.", meta: "10 mar 2027 · Diana Bermeo" },
  { id: "q2", icon: "Flag", title: "Ejemplo clave a incluir", text: "Caso de familia latina en Miami que evitó probate y protegió a sus hijos.", meta: "11 mar 2027 · Anthony Aguilar" },
  { id: "q3", icon: "Lightbulb", title: "Idea para CTA", text: "Ofrecer evaluación gratuita de plan patrimonial + guía descargable.", meta: "12 mar 2027 · Diana Bermeo" },
];

export const EPISODE_NOTES = [
  "Explicar qué es un Trust en lenguaje simple.",
  "Comparar Trust vs Testamento.",
  "Hablar de probate: tiempo, costo y estrés.",
  "Mostrar casos reales (anonimizados).",
  "Incluir opciones para menores y familias mixtas.",
  "Finalizar con próximos pasos concretos.",
];

export const SEO_KEYWORDS = ["Trusts", "Living Trust", "Planificación Patrimonial", "Protección de Activos", "Probate", "Sucesión", "Familia Hispana", "Estado de Florida"];

export const ECOSYSTEM_SLICES = [
  { id: "comp", label: "Completado", value: 7, color: "#22c55e" },
  { id: "prod", label: "En Producción", value: 3, color: "#e0a836" },
  { id: "pend", label: "Pendiente", value: 1, color: "#a78bfa" },
  { id: "noini", label: "No Iniciado", value: 1, color: "#94a3b8" },
];

export const PROJECTED_METRICS: InfoRow[] = [
  { label: "Reproducciones podcast", value: "2.500 – 3.500" },
  { label: "Visualizaciones YouTube", value: "4.000 – 6.000" },
  { label: "Alcance en redes", value: "15.000 – 20.000" },
  { label: "Descargas del PDF", value: "1.000 – 1.500" },
  { label: "Leads generados", value: "150 – 250" },
  { label: "Nuevos estudiantes (Academia)", value: "50 – 100" },
];

export const EPISODE_KPIS = [
  { id: "reach", label: "Alcance total", value: "125.430", delta: "18.7%", sub: "vs. episodio anterior", icon: "Headphones", tone: "violet" as const },
  { id: "inter", label: "Interacciones totales", value: "8.942", delta: "23.4%", sub: "vs. episodio anterior", icon: "Users", tone: "blue" as const },
  { id: "plays", label: "Reproducciones", value: "42.871", delta: "15.3%", sub: "vs. episodio anterior", icon: "Play", tone: "rose" as const },
  { id: "down", label: "Descargas", value: "3.216", delta: "28.9%", sub: "vs. episodio anterior", icon: "Download", tone: "emerald" as const },
  { id: "acad", label: "Inscripciones Academia", value: "217", delta: "34.2%", sub: "vs. episodio anterior", icon: "GraduationCap", tone: "amber" as const },
  { id: "leads", label: "Leads generados", value: "126", delta: "19.0%", sub: "vs. episodio anterior", icon: "Sparkles", tone: "gold" as const },
];

export const PLATFORM_PERFORMANCE = [
  { platform: "YouTube", alcance: 42100, interacciones: 3200, reproducciones: 16800 },
  { platform: "Instagram", alcance: 31400, interacciones: 2800, reproducciones: 9600 },
  { platform: "Facebook", alcance: 18700, interacciones: 1600, reproducciones: 6300 },
  { platform: "TikTok", alcance: 15200, interacciones: 2300, reproducciones: 4100 },
  { platform: "Podcast", alcance: 9800, interacciones: 1100, reproducciones: 6000 },
  { platform: "Email", alcance: 6400, interacciones: 700, reproducciones: 0 },
  { platform: "Blog / SEO", alcance: 2600, interacciones: 400, reproducciones: 0 },
];

export const CONVERSION_FUNNEL = [
  { id: "f1", label: "Personas alcanzadas", value: 125430, pct: "100%", color: "#a78bfa" },
  { id: "f2", label: "Interesados (clics / vistas)", value: 18247, pct: "14.5%", color: "#3b82f6" },
  { id: "f3", label: "Interacciones", value: 8942, pct: "7.1%", color: "#22c55e" },
  { id: "f4", label: "Descargas / Recursos", value: 3216, pct: "2.6%", color: "#e0a836" },
  { id: "f5", label: "Leads generados", value: 126, pct: "0.10%", color: "#f472b6" },
  { id: "f6", label: "Consultas agendadas", value: 34, pct: "0.03%", color: "#94a3b8" },
];

export const TOP_CONTENT = [
  { id: "tc1", name: "Reel: 3 mitos sobre los Trusts", icon: "Camera", reach: "23.412", inter: "2.134" },
  { id: "tc2", name: "YouTube: Episodio completo", icon: "Video", reach: "16.842", inter: "1.652" },
  { id: "tc3", name: "Carrusel: ¿Trust vs Testamento?", icon: "Rows3", reach: "12.741", inter: "1.025" },
  { id: "tc4", name: "Artículo SEO: ¿Necesito un Trust?", icon: "FileText", reach: "8.912", inter: "712" },
  { id: "tc5", name: "Email: Guía gratuita de Trusts", icon: "Mail", reach: "6.428", inter: "468" },
];

export const CLASS_MODULES = [
  {
    id: "m1", index: 1, title: "¿Qué es un Trust y por qué existe?", status: "Publicado", tone: "emerald" as const, duration: "7 – 8 min", kind: "Video",
    lessons: [
      { id: "l1", index: "1.1", title: "¿Qué es un Trust en palabras simples?", duration: "3:15", done: true },
      { id: "l2", index: "1.2", title: "Diferencia entre Trust vs Testamento", duration: "2:45", done: true },
      { id: "l3", index: "1.3", title: "Mitos comunes sobre los Trusts", duration: "2:00", done: true },
    ],
  },
  {
    id: "m2", index: 2, title: "Beneficios clave para la familia", status: "En edición", tone: "amber" as const, duration: "7 – 7 min", kind: "Video",
    lessons: [
      { id: "l4", index: "2.1", title: "Evitar el proceso de probate", duration: "2:10", done: false },
      { id: "l5", index: "2.2", title: "Privacidad y control de tus bienes", duration: "2:05", done: false },
      { id: "l6", index: "2.3", title: "Protección para menores y familias mixtas", duration: "2:00", done: false },
    ],
  },
  {
    id: "m3", index: 3, title: "¿Necesito un Trust si no soy millonario?", status: "Guion aprobado", tone: "violet" as const, duration: "6 – 7 min", kind: "Video",
    lessons: [
      { id: "l7", index: "3.1", title: "Qué activos puede poner un Trust", duration: "2:20", done: false },
      { id: "l8", index: "3.2", title: "¿Cuándo sí y cuándo no es necesario?", duration: "2:10", done: false },
      { id: "l9", index: "3.3", title: "Ejemplos reales de familias latinas", duration: "2:00", done: false },
    ],
  },
  {
    id: "m4", index: 4, title: "Pasos para crear tu Trust", status: "Por producir", tone: "neutral" as const, duration: "5 – 6 min", kind: "Video",
    lessons: [
      { id: "l10", index: "4.1", title: "Documentos necesarios", duration: "2:00", done: false },
      { id: "l11", index: "4.2", title: "Elegir al Trustee adecuado", duration: "2:10", done: false },
      { id: "l12", index: "4.3", title: "Errores que debes evitar", duration: "1:40", done: false },
    ],
  },
  {
    id: "m5", index: 5, title: "Preguntas frecuentes", status: "Por producir", tone: "neutral" as const, duration: "4 – 5 min", kind: "Video",
    lessons: [{ id: "l13", index: "5.1", title: "Respuestas a las dudas más comunes", duration: "4:20", done: false }],
  },
  {
    id: "m6", index: 6, title: "Recursos y próximos pasos", status: "Por producir", tone: "neutral" as const, duration: "3 – 4 min", kind: "Descargable",
    lessons: [{ id: "l14", index: "6.1", title: "Checklist + Recursos descargables", duration: "—", done: false }],
  },
];

export const CLASS_PRODUCTION: ChecklistLine[] = [
  { id: "cp1", label: "Guion y estructura", done: true, meta: "Completado" },
  { id: "cp2", label: "Grabación del contenido", done: true, meta: "Completado" },
  { id: "cp3", label: "Edición de video", done: false, meta: "En progreso" },
  { id: "cp4", label: "Diseño y materiales", done: false, meta: "Pendiente" },
  { id: "cp5", label: "Revisión final", done: false, meta: "Pendiente" },
  { id: "cp6", label: "Publicación en la Academia", done: false, meta: "Pendiente" },
];

export const CLASS_RESOURCES: FileEntry[] = [
  { id: "cr1", name: "Guion completo (DOCX)", kind: "doc", meta: "245 KB" },
  { id: "cr2", name: "Presentación (PPTX)", kind: "image", meta: "3.2 MB" },
  { id: "cr3", name: "Checklist: ¿Necesito un Trust? (PDF)", kind: "pdf", meta: "1.1 MB" },
  { id: "cr4", name: "Guía: Tipos de Trusts (PDF)", kind: "pdf", meta: "1.4 MB" },
];
