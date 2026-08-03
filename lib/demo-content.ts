/**
 * Contenido de demostración del módulo Contenido.
 *
 * Solo se siembra en la empresa del super administrador, para que pueda ver
 * cómo luce la plataforma con información real. Una empresa nueva arranca
 * vacía: sus administradores cargan su propio contenido.
 *
 * Se importa dinámicamente desde `lib/services/demo-seed.ts`, así que no
 * entra en el bundle de las páginas.
 */

import type {
  AcademyClass,
  DerivedContent,
  Downloadable,
  Episode,
  MediaAsset,
  Pillar,
} from "@/lib/content-types";

export const DEMO_PILLARS: Omit<Pillar, "id">[] = [
  { name: "Protección", tone: "violet", color: "#a78bfa", icon: "ShieldCheck", description: "Educamos sobre seguros que protegen lo que más importa: tu familia, tu salud, tu patrimonio y tu negocio.", weeksPlanned: 17, growth: "12% este trimestre", order: 0 },
  { name: "Crecimiento", tone: "emerald", color: "#22c55e", icon: "TrendingUp", description: "Impulsamos tu crecimiento financiero y el de tu negocio con estrategias, herramientas y mentalidad.", weeksPlanned: 13, growth: "8% este trimestre", order: 1 },
  { name: "Protección Legal", tone: "blue", color: "#3b82f6", icon: "Scale", description: "Brindamos información clara sobre tus derechos y tu protección legal personal y empresarial.", weeksPlanned: 13, growth: null, order: 2 },
  { name: "Negocios Familiares", tone: "amber", color: "#e0a836", icon: "Briefcase", description: "Apoyamos a familias empresarias a construir negocios sólidos, exitosos y que trasciendan generaciones.", weeksPlanned: 7, growth: "5% este trimestre", order: 3 },
  { name: "Legado Familiar", tone: "rose", color: "#f472b6", icon: "Users", description: "Te ayudamos a construir tu legado y asegurar el bienestar de las próximas generaciones.", weeksPlanned: 7, growth: "3% este trimestre", order: 4 },
  { name: "Bienestar Integral", tone: "neutral", color: "#94a3b8", icon: "HeartPulse", description: "Promovemos tu bienestar físico, emocional y financiero para una vida plena y equilibrada.", weeksPlanned: 5, growth: null, order: 5 },
];

/** Los episodios referencian los pilares por nombre; el seed los resuelve a IDs reales. */
export const DEMO_EPISODES: (Omit<Episode, "id" | "pillarId"> & { pillarName: string })[] = [
  { week: 1, title: "La verdad sobre el seguro de vida", subtitle: "Mitos y realidades que debes conocer", guest: "Luis Barajas", guestRole: "Asesor financiero", pillarName: "Protección", status: "Publicado", progress: 100, assetsDone: 10, assetsTotal: 10, publishDate: "08 ene 2027", order: 0 },
  { week: 2, title: "¿Necesito un Trust si no soy millonario?", subtitle: "Por qué los Trusts son para todos", guest: "Sonia Muñoz", guestRole: "Abogada de Estate Planning", pillarName: "Protección Legal", status: "En producción", progress: 60, assetsDone: 6, assetsTotal: 10, publishDate: "15 ene 2027", order: 1 },
  { week: 3, title: "Disability Insurance en español", subtitle: "Protege tus ingresos si no puedes trabajar", guest: "Anthony Aguilar", guestRole: "Especialista en seguros", pillarName: "Protección", status: "En producción", progress: 50, assetsDone: 5, assetsTotal: 10, publishDate: "22 ene 2027", order: 2 },
  { week: 4, title: "Long-Term Care: el plan que tu familia necesita", subtitle: "Evita ser una carga financiera", guest: "Clara Rodríguez", guestRole: "Geriatra", pillarName: "Protección", status: "Planeado", progress: 20, assetsDone: 2, assetsTotal: 10, publishDate: "29 ene 2027", order: 3 },
  { week: 5, title: "Annuities: ingresos garantizados para tu retiro", subtitle: "Convierte tu ahorro en pagos de por vida", guest: "Ricardo González", guestRole: "Planificador de retiro", pillarName: "Crecimiento", status: "Planeado", progress: 10, assetsDone: 1, assetsTotal: 10, publishDate: "05 feb 2027", order: 4 },
  { week: 6, title: "Protege tu negocio con Key Person Insurance", subtitle: "Asegura la continuidad de tu empresa", guest: "Carla Rodríguez", guestRole: "Consultora de negocios", pillarName: "Negocios Familiares", status: "En producción", progress: 40, assetsDone: 4, assetsTotal: 10, publishDate: "12 feb 2027", order: 5 },
  { week: 7, title: "Estate Planning: por dónde empezar", subtitle: "Documentos esenciales que necesitas", guest: "Luis Hernández", guestRole: "Abogado patrimonial", pillarName: "Protección Legal", status: "Planeado", progress: 0, assetsDone: 0, assetsTotal: 10, publishDate: "19 feb 2027", order: 6 },
  { week: 8, title: "¿Cómo reducir impuestos legalmente?", subtitle: "Estrategias fiscales para tu familia y negocio", guest: "Mariela Quintero", guestRole: "Contadora pública", pillarName: "Crecimiento", status: "Planeado", progress: 0, assetsDone: 0, assetsTotal: 10, publishDate: "26 feb 2027", order: 7 },
  { week: 9, title: "Educación financiera para tus hijos", subtitle: "Cómo enseñarles a manejar el dinero", guest: "Javier Rivas", guestRole: "Educador financiero", pillarName: "Legado Familiar", status: "Planeado", progress: 0, assetsDone: 0, assetsTotal: 10, publishDate: "05 mar 2027", order: 8 },
  { week: 10, title: "Buy-Sell Agreements: protege tu empresa", subtitle: "Evita conflictos entre socios y familiares", guest: "Miguel Gómez", guestRole: "Abogado corporativo", pillarName: "Negocios Familiares", status: "Pausado", progress: 0, assetsDone: 0, assetsTotal: 10, publishDate: "—", order: 9 },
  { week: 11, title: "Impuestos sobre herencias: lo que debes saber", subtitle: "Planifica antes de que sea tarde", guest: "Pablo Sánchez", guestRole: "Asesor fiscal", pillarName: "Crecimiento", status: "Planeado", progress: 5, assetsDone: 0, assetsTotal: 10, publishDate: "12 mar 2027", order: 10 },
  { week: 12, title: "¿Necesito un Trust si no soy millonario?", subtitle: "Protección legal al alcance de tu familia", guest: "Sonia Muñoz", guestRole: "Abogada de Estate Planning", pillarName: "Protección Legal", status: "En producción", progress: 78, assetsDone: 7, assetsTotal: 10, publishDate: "22 mar 2027", order: 11 },
];

export const DEMO_DERIVED: (Omit<DerivedContent, "id" | "pillarId"> & { pillarName: string })[] = [
  { title: "La verdad sobre el seguro de vida | Reel", subtitle: "Video corto para redes sociales", episodeTitle: "La verdad sobre el seguro de vida", episodeWeek: 1, format: "Video corto", formatMeta: "0:45", channels: ["Camera", "MessageCircle", "Music2"], pillarName: "Protección", status: "Publicado", publishDate: "10 ene 2027", order: 0 },
  { title: "¿Necesito un Trust? | Podcast", subtitle: "Audio para plataformas de podcast", episodeTitle: "¿Necesito un Trust si no soy millonario?", episodeWeek: 12, format: "Podcast", formatMeta: "18:32", channels: ["Mic", "Video"], pillarName: "Protección Legal", status: "En producción", publishDate: "17 ene 2027", order: 1 },
  { title: "Disability Insurance en español | Blog", subtitle: "Artículo completo para el blog", episodeTitle: "Disability Insurance en español", episodeWeek: 3, format: "Artículo / Blog", formatMeta: "1.200 palabras", channels: ["Globe"], pillarName: "Protección", status: "Publicado", publishDate: "22 ene 2027", order: 2 },
  { title: "Long-Term Care: Infografía", subtitle: "Infografía para compartir", episodeTitle: "Long-Term Care: el plan que tu familia necesita", episodeWeek: 4, format: "Infografía", formatMeta: "1 pieza", channels: ["Camera", "Briefcase"], pillarName: "Protección", status: "Planeado", publishDate: "30 ene 2027", order: 3 },
  { title: "Guía: Annuities paso a paso", subtitle: "Guía descargable en PDF", episodeTitle: "Annuities: ingresos garantizados", episodeWeek: 5, format: "PDF / Guía", formatMeta: "8 páginas", channels: ["Globe"], pillarName: "Crecimiento", status: "Publicado", publishDate: "06 feb 2027", order: 4 },
  { title: "Protege tu negocio | Video YouTube", subtitle: "Video educativo para YouTube", episodeTitle: "Protege tu negocio con Key Person Insurance", episodeWeek: 6, format: "Video largo", formatMeta: "6:12", channels: ["Video"], pillarName: "Negocios Familiares", status: "En producción", publishDate: "13 feb 2027", order: 5 },
  { title: "Estate Planning: Presentación", subtitle: "Presentación para seminarios", episodeTitle: "Estate Planning: por dónde empezar", episodeWeek: 7, format: "Presentación", formatMeta: "15 diapositivas", channels: ["Briefcase"], pillarName: "Protección Legal", status: "Planeado", publishDate: "20 feb 2027", order: 6 },
  { title: "Checklist: Sucesión Patrimonial", subtitle: "Lista de verificación descargable", episodeTitle: "Estate Planning: por dónde empezar", episodeWeek: 7, format: "Checklist", formatMeta: "1 página", channels: ["Globe"], pillarName: "Legado Familiar", status: "Publicado", publishDate: "01 mar 2027", order: 7 },
  { title: "Educación financiera | Testimonio", subtitle: "Testimonio en video corto", episodeTitle: "Educación financiera para tus hijos", episodeWeek: 9, format: "Video corto", formatMeta: "1:05", channels: ["Camera", "MessageCircle"], pillarName: "Legado Familiar", status: "En producción", publishDate: "05 mar 2027", order: 8 },
  { title: "Newsletter: Resumen semanal", subtitle: "Email con resumen de contenido", episodeTitle: "Resumen Semanal – Semana 12", episodeWeek: 12, format: "Email / Newsletter", formatMeta: "1 envío", channels: ["Mail"], pillarName: "Crecimiento", status: "Publicado", publishDate: "15 ene 2027", order: 9 },
  { title: "¿Trust vs Testamento? | Carrusel", subtitle: "Carrusel educativo para Instagram", episodeTitle: "¿Necesito un Trust si no soy millonario?", episodeWeek: 12, format: "Carrusel", formatMeta: "8 slides", channels: ["Camera"], pillarName: "Protección Legal", status: "Publicado", publishDate: "20 mar 2027", order: 10 },
  { title: "3 mitos sobre los Trusts | Reel", subtitle: "Video corto de alto alcance", episodeTitle: "¿Necesito un Trust si no soy millonario?", episodeWeek: 12, format: "Video corto", formatMeta: "0:38", channels: ["Camera", "Music2"], pillarName: "Protección Legal", status: "Publicado", publishDate: "21 mar 2027", order: 11 },
];

export const DEMO_MEDIA: (Omit<MediaAsset, "id" | "pillarId"> & { pillarName: string | null })[] = [
  { name: "Protege tu hogar y a los que amas.jpg", kind: "Imagen", topic: "Hogar", pillarName: "Protección", episodeTitle: "Long-Term Care: el plan que tu familia necesita", episodeWeek: 4, uploadedAt: "10 may 2027", size: "2.4 MB", order: 0 },
  { name: "¿Necesito un Trust si no soy millonario?.mp4", kind: "Video", topic: "Educación", pillarName: "Protección Legal", episodeTitle: "¿Necesito un Trust si no soy millonario?", episodeWeek: 12, uploadedAt: "09 may 2027", size: "85.6 MB", order: 1 },
  { name: "Guía: Annuities paso a paso.pdf", kind: "Documento", topic: "Retiro", pillarName: "Crecimiento", episodeTitle: "Annuities: ingresos garantizados", episodeWeek: 5, uploadedAt: "08 may 2027", size: "4.8 MB", order: 2 },
  { name: "Podcast - Disability Insurance en español.mp3", kind: "Audio", topic: "Seguro de ingresos", pillarName: "Protección", episodeTitle: "Disability Insurance en español", episodeWeek: 3, uploadedAt: "07 may 2027", size: "18.7 MB", order: 3 },
  { name: "Infografía - Estate Planning.png", kind: "Imagen", topic: "Planificación", pillarName: "Protección Legal", episodeTitle: "Estate Planning: por dónde empezar", episodeWeek: 7, uploadedAt: "06 may 2027", size: "1.6 MB", order: 4 },
  { name: "Testimonio - Deja más que dinero.mp4", kind: "Video", topic: "Legado", pillarName: "Legado Familiar", episodeTitle: "Educación financiera para tus hijos", episodeWeek: 9, uploadedAt: "05 may 2027", size: "46.3 MB", order: 5 },
  { name: "Plantilla - Calendario de Contenidos.pptx", kind: "Plantilla", topic: "Plantillas", pillarName: null, episodeTitle: null, episodeWeek: null, uploadedAt: "04 may 2027", size: "3.2 MB", order: 6 },
  { name: "Newsletter - Resumen Semanal 12.jpg", kind: "Imagen", topic: "Newsletter", pillarName: null, episodeTitle: "Newsletter: Resumen semanal", episodeWeek: 12, uploadedAt: "03 may 2027", size: "1.1 MB", order: 7 },
  { name: "Checklist - Protección Patrimonial.pdf", kind: "Documento", topic: "Patrimonio", pillarName: "Legado Familiar", episodeTitle: "Estate Planning: por dónde empezar", episodeWeek: 7, uploadedAt: "02 may 2027", size: "0.9 MB", order: 8 },
  { name: "Reel - 3 mitos sobre los Trusts.mp4", kind: "Video", topic: "Educación", pillarName: "Protección Legal", episodeTitle: "¿Necesito un Trust si no soy millonario?", episodeWeek: 12, uploadedAt: "01 may 2027", size: "22.8 MB", order: 9 },
  { name: "Audio - Intro musical Allpa.mp3", kind: "Audio", topic: "Marca", pillarName: null, episodeTitle: null, episodeWeek: null, uploadedAt: "28 abr 2027", size: "3.4 MB", order: 10 },
  { name: "Plantilla - Carrusel Instagram.fig", kind: "Plantilla", topic: "Plantillas", pillarName: null, episodeTitle: null, episodeWeek: null, uploadedAt: "27 abr 2027", size: "12.6 MB", order: 11 },
];

export const DEMO_CLASSES: (Omit<AcademyClass, "id" | "pillarId"> & { pillarName: string })[] = [
  { title: "Los Trusts: protección y tranquilidad para tu familia", subtitle: "Aprende cuándo y cómo crear tu primer Trust", pillarName: "Protección Legal", level: "Intermedio", lessons: 6, duration: "35 – 45 min", students: 0, rating: "—", status: "En producción", progress: 45, episodeWeek: 12, order: 0 },
  { title: "Seguro de vida sin mitos", subtitle: "Todo lo que debes saber antes de contratar", pillarName: "Protección", level: "Básico", lessons: 5, duration: "28 min", students: 1284, rating: "4.8", status: "Publicada", progress: 100, episodeWeek: 1, order: 1 },
  { title: "Protege tus ingresos con Disability Insurance", subtitle: "Qué cubre y cómo elegir la póliza correcta", pillarName: "Protección", level: "Básico", lessons: 4, duration: "22 min", students: 862, rating: "4.6", status: "Publicada", progress: 100, episodeWeek: 3, order: 2 },
  { title: "Annuities: ingresos garantizados de por vida", subtitle: "Convierte tu ahorro en pagos mensuales", pillarName: "Crecimiento", level: "Intermedio", lessons: 7, duration: "42 min", students: 517, rating: "4.7", status: "Publicada", progress: 100, episodeWeek: 5, order: 3 },
  { title: "Estate Planning para familias latinas", subtitle: "Documentos esenciales paso a paso", pillarName: "Protección Legal", level: "Intermedio", lessons: 8, duration: "50 min", students: 0, rating: "—", status: "Planeada", progress: 10, episodeWeek: 7, order: 4 },
  { title: "Key Person Insurance para tu empresa", subtitle: "Asegura la continuidad de tu negocio", pillarName: "Negocios Familiares", level: "Avanzado", lessons: 6, duration: "38 min", students: 0, rating: "—", status: "En producción", progress: 30, episodeWeek: 6, order: 5 },
  { title: "Educación financiera para tus hijos", subtitle: "Enseña a manejar el dinero desde temprano", pillarName: "Legado Familiar", level: "Básico", lessons: 5, duration: "26 min", students: 0, rating: "—", status: "Planeada", progress: 0, episodeWeek: 9, order: 6 },
  { title: "Long-Term Care: planifica a tiempo", subtitle: "Evita ser una carga financiera para los tuyos", pillarName: "Protección", level: "Intermedio", lessons: 6, duration: "34 min", students: 0, rating: "—", status: "Planeada", progress: 15, episodeWeek: 4, order: 7 },
];

export const DEMO_DOWNLOADABLES: (Omit<Downloadable, "id" | "pillarId"> & { pillarName: string })[] = [
  { kind: "PDF", title: "Guía: ¿Necesito un Trust?", description: "Guía completa para entender si un Trust es adecuado para ti.", downloads: 1284, leads: 238, conversion: "18.5%", topic: "Trusts", pillarName: "Protección Legal", episodeWeek: 12, active: true, order: 0 },
  { kind: "Checklist", title: "Checklist: Protección Patrimonial", description: "Lista paso a paso para proteger tu patrimonio y el de tu familia.", downloads: 840, leads: 154, conversion: "18.3%", topic: "Protección Patrimonial", pillarName: "Legado Familiar", episodeWeek: 8, active: true, order: 1 },
  { kind: "Ebook", title: "Ebook: Construye tu Legado", description: "Estrategias para construir un legado sólido para las próximas generaciones.", downloads: 624, leads: 102, conversion: "16.3%", topic: "Legacy Planning", pillarName: "Legado Familiar", episodeWeek: 21, active: true, order: 2 },
  { kind: "Worksheet", title: "Worksheet: Reunión Familiar Efectiva", description: "Plantilla para planificar reuniones familiares productivas y alineadas.", downloads: 512, leads: 96, conversion: "18.8%", topic: "Legacy Planning", pillarName: "Legado Familiar", episodeWeek: 19, active: true, order: 3 },
  { kind: "Guía", title: "Guía: 7 Errores de Sucesión", description: "Evita los errores más comunes que ponen en riesgo el legado familiar.", downloads: 468, leads: 82, conversion: "17.5%", topic: "Sucesión", pillarName: "Legado Familiar", episodeWeek: 16, active: true, order: 4 },
  { kind: "Calculadora", title: "Calculadora de Retiro", description: "Calcula cuánto necesitas para tu retiro y mantén tu estilo de vida.", downloads: 412, leads: 73, conversion: "17.7%", topic: "Retiro", pillarName: "Crecimiento", episodeWeek: 25, active: true, order: 5 },
  { kind: "Plantilla", title: "Plantilla: Plan Patrimonial Familiar", description: "Estructura tu plan patrimonial paso a paso con esta plantilla.", downloads: 300, leads: 65, conversion: "21.7%", topic: "Planificación", pillarName: "Protección Legal", episodeWeek: 14, active: true, order: 6 },
  { kind: "Guía", title: "Guía para Business Owners", description: "Protege y planifica tu negocio para asegurar su continuidad.", downloads: 276, leads: 54, conversion: "19.6%", topic: "Negocios", pillarName: "Negocios Familiares", episodeWeek: 17, active: true, order: 7 },
];
