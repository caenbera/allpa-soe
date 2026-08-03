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
  { name: "Protección", tone: "violet", color: "#a78bfa", icon: "ShieldCheck", description: "Educamos sobre seguros que protegen lo que más importa: tu familia, tu salud, tu patrimonio y tu negocio.", weeksPlanned: 17, growth: "12% este trimestre", order: 0, topics: ["Life Insurance", "Disability Insurance", "Long-Term Care"] },
  { name: "Crecimiento", tone: "emerald", color: "#22c55e", icon: "TrendingUp", description: "Impulsamos tu crecimiento financiero y el de tu negocio con estrategias, herramientas y mentalidad.", weeksPlanned: 13, growth: "8% este trimestre", order: 1, topics: ["Inversiones", "Retiro", "Annuities"] },
  { name: "Protección Legal", tone: "blue", color: "#3b82f6", icon: "Scale", description: "Brindamos información clara sobre tus derechos y tu protección legal personal y empresarial.", weeksPlanned: 13, growth: null, order: 2, topics: ["Trusts", "Wills & Estate Planning", "Power of Attorney"] },
  { name: "Negocios Familiares", tone: "amber", color: "#e0a836", icon: "Briefcase", description: "Apoyamos a familias empresarias a construir negocios sólidos, exitosos y que trasciendan generaciones.", weeksPlanned: 7, growth: "5% este trimestre", order: 3, topics: ["Planificación para Negocios", "Buy-Sell Agreements", "Sucesión Empresarial"] },
  { name: "Legado Familiar", tone: "rose", color: "#f472b6", icon: "Users", description: "Te ayudamos a construir tu legado y asegurar el bienestar de las próximas generaciones.", weeksPlanned: 7, growth: "3% este trimestre", order: 4, topics: ["Educación Financiera para Hijos", "Valores y Mentalidad", "Filantropía e Impacto"] },
  { name: "Bienestar Integral", tone: "neutral", color: "#94a3b8", icon: "HeartPulse", description: "Promovemos tu bienestar físico, emocional y financiero para una vida plena y equilibrada.", weeksPlanned: 5, growth: null, order: 5, topics: ["Salud y Prevención", "Equilibrio Financiero", "Bienestar Emocional"] },
];

const MONTHS_ES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

/** La semana 1 del plan 2027 arranca el lunes 4 de enero. */
function weekStart(week: number) {
  return new Date(Date.UTC(2027, 0, 4 + (week - 1) * 7));
}

function shortDate(d: Date) {
  return `${d.getUTCDate()} ${MONTHS_ES[d.getUTCMonth()]}`;
}

/** Rango de la semana, ej. "22 – 28 mar". */
function weekRange(week: number) {
  const start = weekStart(week);
  const end = new Date(start.getTime() + 6 * 86_400_000);
  return `${shortDate(start)} – ${shortDate(end)}`;
}

/** Los episodios se publican el viernes de su semana. */
function publishDateOf(week: number) {
  const d = new Date(weekStart(week).getTime() + 4 * 86_400_000);
  return `${String(d.getUTCDate()).padStart(2, "0")} ${MONTHS_ES[d.getUTCMonth()]} 2027`;
}

/**
 * Las 52 semanas del plan, en forma compacta para que la lista siga siendo
 * legible: [semana, título, subtítulo, invitado, cargo, pilar, estado, activos generados].
 * El progreso, el rango de fechas y la fecha de publicación se derivan.
 */
type EpisodeSeed = [number, string, string, string, string, string, Episode["status"], number];

const EPISODE_SEEDS: EpisodeSeed[] = [
  [1, "La verdad sobre el seguro de vida", "Mitos y realidades que debes conocer", "Luis Barajas", "Asesor financiero", "Protección", "Publicado", 9],
  [2, "Disability Insurance en español", "Protege tus ingresos si no puedes trabajar", "Anthony Aguilar", "Especialista en seguros", "Protección", "Publicado", 9],
  [3, "Long-Term Care: el plan que tu familia necesita", "Evita ser una carga financiera", "Clara Rodríguez", "Geriatra", "Protección", "Publicado", 9],
  [4, "Annuities: ingresos garantizados para tu retiro", "Convierte tu ahorro en pagos de por vida", "Ricardo González", "Planificador de retiro", "Crecimiento", "Publicado", 9],
  [5, "Estate Planning: por dónde empezar", "Documentos esenciales que necesitas", "Luis Hernández", "Abogado patrimonial", "Protección Legal", "Publicado", 9],
  [6, "Protege tu negocio con Key Person Insurance", "Asegura la continuidad de tu empresa", "Carla Rodríguez", "Consultora de negocios", "Negocios Familiares", "Publicado", 9],
  [7, "¿Cómo reducir impuestos legalmente?", "Estrategias fiscales para tu familia y negocio", "Mariela Quintero", "Contadora pública", "Crecimiento", "Publicado", 9],
  [8, "Educación financiera para tus hijos", "Cómo enseñarles a manejar el dinero", "Javier Rivas", "Educador financiero", "Legado Familiar", "Publicado", 9],
  [9, "Buy-Sell Agreements: protege tu empresa", "Evita conflictos entre socios y familiares", "Miguel Gómez", "Abogado corporativo", "Negocios Familiares", "Publicado", 9],
  [10, "Impuestos sobre herencias: lo que debes saber", "Planifica antes de que sea tarde", "Pablo Sánchez", "Asesor fiscal", "Crecimiento", "Publicado", 9],
  [11, "La verdad sobre el seguro de vida", "Mitos y realidades que debes conocer", "Luis Barajas", "Asesor financiero", "Protección", "En producción", 9],
  [12, "¿Necesito un Trust si no soy millonario?", "Protección legal al alcance de tu familia", "Sonia Muñoz Gallagher", "Abogada de Estate Planning", "Protección Legal", "En producción", 6],
  [13, "Protege tu ingreso: Disability Insurance", "Qué cubre y cómo elegir la póliza correcta", "Anthony Aguilar", "Especialista en seguros", "Protección", "En producción", 2],
  [14, "Long-Term Care: el plan que tu familia necesita", "Cuándo contratarlo y cuánto cuesta", "Clara Rodríguez", "Geriatra", "Protección", "En producción", 1],
  [15, "Annuities: ingresos garantizados para tu retiro", "Convierte tu ahorro en pagos de por vida", "Ricardo González", "Planificador de retiro", "Crecimiento", "En producción", 0],
  [16, "Wills vs Trusts: cuál necesita tu familia", "Diferencias que casi nadie explica bien", "Sonia Muñoz Gallagher", "Abogada de Estate Planning", "Protección Legal", "En producción", 3],
  [17, "Power of Attorney: quién decide por ti", "El documento que todos posponen", "Luis Hernández", "Abogado patrimonial", "Protección Legal", "En producción", 2],
  [18, "Sucesión empresarial sin pleitos familiares", "Cómo preparar el relevo generacional", "Miguel Gómez", "Abogado corporativo", "Negocios Familiares", "En producción", 1],
  [19, "Inversiones para latinos: por dónde empezar", "Primeros pasos sin miedo ni tecnicismos", "Pablo Sánchez", "Asesor fiscal", "Crecimiento", "Planeado", 0],
  [20, "Plan de retiro: construye tu libertad financiera", "Cuánto necesitas realmente para retirarte", "Ricardo González", "Planificador de retiro", "Crecimiento", "Planeado", 0],
  [21, "Deja más que dinero: construye un legado", "Valores que trascienden generaciones", "Javier Rivas", "Educador financiero", "Legado Familiar", "Planeado", 0],
  [22, "Seguro de salud: elige sin equivocarte", "Cómo comparar planes de verdad", "Clara Rodríguez", "Geriatra", "Protección", "Planeado", 0],
  [23, "Protege tu patrimonio de demandas", "Estructuras legales que sí funcionan", "Sonia Muñoz Gallagher", "Abogada de Estate Planning", "Protección Legal", "Planeado", 0],
  [24, "Cómo financiar tu negocio familiar", "Opciones reales más allá del banco", "Carla Rodríguez", "Consultora de negocios", "Negocios Familiares", "Planeado", 0],
  [25, "Calculadora de retiro: los números que importan", "Aterriza tu plan con cifras concretas", "Ricardo González", "Planificador de retiro", "Crecimiento", "Planeado", 0],
  [26, "Filantropía familiar: dar con propósito", "Convierte tu éxito en impacto", "Javier Rivas", "Educador financiero", "Legado Familiar", "Planeado", 0],
  [27, "Seguros para dueños de negocio", "Qué cubrir primero y por qué", "Carla Rodríguez", "Consultora de negocios", "Negocios Familiares", "Planeado", 0],
  [28, "Bienestar financiero y salud mental", "El costo invisible del estrés económico", "Clara Rodríguez", "Geriatra", "Bienestar Integral", "Planeado", 0],
  [29, "Herencias: evita el probate en Florida", "Tiempo, costo y estrés que puedes ahorrar", "Luis Hernández", "Abogado patrimonial", "Protección Legal", "Planeado", 0],
  [30, "Educación universitaria: cómo pagarla", "Planes de ahorro que sí rinden", "Javier Rivas", "Educador financiero", "Legado Familiar", "Planeado", 0],
  [31, "Diversificación: no pongas todo en un lugar", "Reparte el riesgo con cabeza", "Pablo Sánchez", "Asesor fiscal", "Crecimiento", "Planeado", 0],
  [32, "Life Insurance como herramienta de ahorro", "Más allá de la protección", "Luis Barajas", "Asesor financiero", "Protección", "Planeado", 0],
  [33, "Trusts revocables e irrevocables", "Cuál conviene según tu caso", "Sonia Muñoz Gallagher", "Abogada de Estate Planning", "Protección Legal", "Planeado", 0],
  [34, "Cómo proteger a un hijo con discapacidad", "Special Needs Trust explicado", "Luis Hernández", "Abogado patrimonial", "Protección Legal", "Planeado", 0],
  [35, "Emprender después de los 50", "Nunca es tarde para construir", "Carla Rodríguez", "Consultora de negocios", "Negocios Familiares", "Planeado", 0],
  [36, "Seguro de vida para padres mayores", "Opciones cuando la edad avanza", "Luis Barajas", "Asesor financiero", "Protección", "Planeado", 0],
  [37, "Impuestos: deducciones que sí puedes usar", "Aprovecha lo que la ley permite", "Mariela Quintero", "Contadora pública", "Crecimiento", "Planeado", 0],
  [38, "Hábitos de bienestar para familias ocupadas", "Salud sostenible sin culpa", "Clara Rodríguez", "Geriatra", "Bienestar Integral", "Planeado", 0],
  [39, "Reunión familiar patrimonial: cómo hacerla", "Conversaciones difíciles bien llevadas", "Javier Rivas", "Educador financiero", "Legado Familiar", "Planeado", 0],
  [40, "Compra de vivienda: prepárate financieramente", "Del enganche al cierre", "Pablo Sánchez", "Asesor fiscal", "Crecimiento", "Planeado", 0],
  [41, "Protección de activos para profesionales", "Médicos, abogados y consultores", "Sonia Muñoz Gallagher", "Abogada de Estate Planning", "Protección Legal", "Planeado", 0],
  [42, "Cómo elegir a tu Trustee", "La decisión que define tu plan", "Luis Hernández", "Abogado patrimonial", "Protección Legal", "Planeado", 0],
  [43, "Sociedades familiares: ventajas y riesgos", "Estructura tu negocio con visión", "Miguel Gómez", "Abogado corporativo", "Negocios Familiares", "Planeado", 0],
  [44, "Retiro anticipado: ¿es posible?", "Los números detrás del sueño", "Ricardo González", "Planificador de retiro", "Crecimiento", "Planeado", 0],
  [45, "Mentalidad de abundancia con los pies en la tierra", "Psicología del dinero para familias", "Javier Rivas", "Educador financiero", "Bienestar Integral", "Planeado", 0],
  [46, "Seguro de negocio: interrupción y continuidad", "Qué pasa si tu empresa para", "Carla Rodríguez", "Consultora de negocios", "Negocios Familiares", "Planeado", 0],
  [47, "Planificación fiscal de fin de año", "Movimientos antes del 31 de diciembre", "Mariela Quintero", "Contadora pública", "Crecimiento", "Planeado", 0],
  [48, "Cuidado de padres mayores: el plan financiero", "La generación sándwich", "Clara Rodríguez", "Geriatra", "Protección", "Planeado", 0],
  [49, "Documenta tu legado: cartas y valores", "Lo que el dinero no transmite", "Javier Rivas", "Educador financiero", "Legado Familiar", "Planeado", 0],
  [50, "Revisión anual de tu plan patrimonial", "Qué actualizar cada año", "Sonia Muñoz Gallagher", "Abogada de Estate Planning", "Protección Legal", "Planeado", 0],
  [51, "Balance vida-trabajo para emprendedores", "Sostener el negocio sin perderte", "Carla Rodríguez", "Consultora de negocios", "Bienestar Integral", "Pausado", 0],
  [52, "Cierre de año: celebra y proyecta", "Balance del año y metas del siguiente", "Luis Barajas", "Asesor financiero", "Bienestar Integral", "Pausado", 0],
];

/** Los episodios referencian los pilares por nombre; el seed los resuelve a IDs reales. */
export const DEMO_EPISODES: (Omit<Episode, "id" | "pillarId"> & { pillarName: string })[] = EPISODE_SEEDS.map(
  ([week, title, subtitle, guest, guestRole, pillarName, status, assetsDone], i) => ({
    week,
    title,
    subtitle,
    guest,
    guestRole,
    pillarName,
    status,
    progress: Math.round((assetsDone / 9) * 100),
    assetsDone,
    assetsTotal: 9,
    dateRange: weekRange(week),
    publishDate: status === "Pausado" ? "—" : publishDateOf(week),
    order: i,
  })
);

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
