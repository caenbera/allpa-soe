/**
 * Datos de demostración del módulo Soluciones.
 *
 * Solo se siembran en la empresa del super administrador. Una empresa nueva
 * arranca vacía y muestra los estados vacíos de cada página.
 *
 * Se importa dinámicamente desde `lib/services/demo-seed.ts`, así que no entra
 * en el bundle de las páginas.
 *
 * Las familias que se asignan a una solución son **las ocho del CRM**: la
 * unión se hace por nombre, y así cada fila de "Familias Asignadas" lleva a
 * una familia que existe de verdad. El precio es que las cifras son menores
 * que en un despacho real —ocho familias, no ciento cincuenta y seis—, pero
 * cuadran entre sí, que es lo que importa para saber si la pantalla miente.
 */

import type {
  BuilderStep,
  SolActivity,
  SolAssignment,
  SolComparison,
  SolComponent,
  SolDocument,
  SolResource,
  SolRoute,
  SolSimulation,
  SolUseCase,
  Solution,
  SolutionComponent,
} from "@/lib/solution-types";

/** Fecha base: todo lo fechado cuelga de aquí, así "hoy" siempre es hoy. */
const HOY = new Date();

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

/** "28 may 2026" a `n` días de hoy (negativo para el pasado). */
function fecha(offset: number): string {
  const d = new Date(HOY);
  d.setDate(d.getDate() + offset);
  return `${String(d.getDate()).padStart(2, "0")} ${MESES[d.getMonth()]} ${d.getFullYear()}`;
}

/** "Hoy", "Ayer", "Hace 3 días" o la fecha, según lo lejos que quede. */
function cuando(offset: number): string {
  if (offset === 0) return "Hoy";
  if (offset === -1) return "Ayer";
  if (offset > -7 && offset < 0) return `Hace ${Math.abs(offset)} días`;
  return fecha(offset);
}

// ── Los nueve pasos de la metodología ──────────────────────────────────────

const PASOS: Omit<BuilderStep, "done">[] = [
  { code: "1", title: "Diagnóstico Inicial", description: "Conoce la situación actual de la familia y sus objetivos." },
  { code: "2", title: "Calcular Necesidad de Protección", description: "Calculamos el capital necesario para proteger su estilo de vida." },
  { code: "3", title: "Evaluar Ingresos y Obligaciones", description: "Analizamos fuentes de ingresos y deudas actuales." },
  { code: "4", title: "Evaluar Dependientes y Beneficiarios", description: "Identificamos a quienes dependen de ti económicamente." },
  { code: "5", title: "Diseñar Estrategia", description: "Definimos la combinación ideal de herramientas de protección." },
  { code: "6", title: "Seleccionar Componentes", description: "Elegimos los componentes adecuados para su plan." },
  { code: "7", title: "Presentar Propuesta", description: "Preparamos y presentamos la propuesta personalizada." },
  { code: "8", title: "Implementar Plan", description: "Gestionamos la implementación y documentación." },
  { code: "9", title: "Revisar y Actualizar Anualmente", description: "Aseguramos que el plan evolucione con la familia." },
];

/** Los primeros `completados` pasos quedan hechos; el resto, pendientes. */
function pasos(completados: number): BuilderStep[] {
  return PASOS.map((p, i) => ({ ...p, done: i < completados }));
}

// ── Los componentes montados en cada plan ──────────────────────────────────

type CompSeed = [
  name: string,
  description: string,
  icon: string,
  color: string,
  tier: SolutionComponent["tier"],
  role: string,
  status: SolutionComponent["status"],
  statusNote: string,
  coverage: string | undefined,
  coverageLabel: string | undefined,
  priority: SolutionComponent["priority"],
  priorityLabel: string,
];

/**
 * Firestore rechaza los campos con valor `undefined`, así que los opcionales
 * solo se escriben cuando el componente los tiene. Escribirlos como `null`
 * funcionaría, pero obligaría a comprobar dos ausencias distintas al leer.
 */
function componentes(slug: string, seeds: CompSeed[]): SolutionComponent[] {
  return seeds.map((s, i) => ({
    id: `${slug}-c${i + 1}`,
    name: s[0],
    description: s[1],
    icon: s[2],
    color: s[3],
    tier: s[4],
    role: s[5],
    status: s[6],
    statusNote: s[7],
    ...(s[8] !== undefined ? { coverage: s[8] } : {}),
    ...(s[9] !== undefined ? { coverageLabel: s[9] } : {}),
    priority: s[10],
    priorityLabel: s[11],
  }));
}

// ── Las ocho soluciones ────────────────────────────────────────────────────

export const DEMO_SOLUTIONS: Omit<Solution, "id">[] = [
  {
    slug: "proteccion-familiar",
    name: "Protección Familiar",
    order: 0,
    icon: "ShieldCheck",
    color: "#a78bfa",
    tagline: "Protegemos los ingresos y el bienestar financiero de tu familia ante lo inesperado.",
    features: ["Análisis de Riesgos", "Protección de Ingresos", "Life Insurance", "Disability", "Long-Term Care", "Fondo de Emergencia"],
    status: "Activo",
    kind: "Protección",
    audience: "Familias, Padres, Empresarios",
    complexity: 4,
    complexityLabel: "Alta",
    reviewCadence: "Revisión Anual",
    objective:
      "Proteger los ingresos y el bienestar financiero de la familia ante fallecimiento, invalidez o enfermedades críticas.",
    steps: pasos(8),
    components: componentes("proteccion-familiar", [
      ["Life Insurance", "Protege el futuro financiero de tu familia ante tu ausencia.", "HeartPulse", "#a78bfa", "Esencial", "Protección Principal", "Activo", "Implementado", "$1,000,000", "Suma asegurada", 5, "Crítica"],
      ["Disability Insurance", "Protege tus ingresos si no puedes trabajar por enfermedad o lesión.", "Accessibility", "#3b82f6", "Esencial", "Protección de Ingresos", "Activo", "Implementado", "$7,500 / mes", "Ingreso mensual", 4, "Alta"],
      ["Long-Term Care", "Protección para gastos de cuidado a largo plazo.", "Hospital", "#22c55e", "Recomendado", "Protección de Patrimonio", "Activo", "Implementado", "$200 / día", "Beneficio diario", 4, "Alta"],
      ["Fondo de Emergencia", "Reserva de liquidez para imprevistos familiares.", "Umbrella", "#f97316", "Recomendado", "Estabilidad Financiera", "Activo", "Implementado", "$25,000", "Fondo objetivo", 3, "Media"],
      ["Trust Protector", "Protege y gestiona la distribución de activos para tu familia.", "Scroll", "#e0a836", "Opcional", "Planificación Patrimonial", "En Proceso", "En configuración", undefined, "Patrimonio", 3, "Media"],
      ["Revisión Anual", "Ajuste y optimización anual del plan según cambios de vida.", "CalendarCheck", "#06b6d4", "Esencial", "Monitoreo y Ajuste", "Programado", `Próxima: ${fecha(45)}`, undefined, "Servicio", 3, "Media"],
      ["Educación Financiera Familiar", "Formación financiera para toda la familia.", "GraduationCap", "#f472b6", "Opcional", "Empoderamiento Familiar", "Pendiente", "No iniciado", undefined, "Programa", 1, "Baja"],
    ]),
  },
  {
    slug: "acumulacion-patrimonial",
    name: "Acumulación Patrimonial",
    order: 1,
    icon: "TrendingUp",
    color: "#3b82f6",
    tagline: "Construimos y aceleramos tu patrimonio de forma eficiente y con ventajas fiscales.",
    features: ["Estrategia de Ahorro", "Cash Value Life Insurance", "IUL (Indexed Universal Life)", "Anualidades", "Inversión Complementaria"],
    status: "Activo",
    kind: "Acumulación",
    audience: "Profesionales, Ejecutivos, Familias",
    complexity: 4,
    complexityLabel: "Alta",
    reviewCadence: "Revisión Semestral",
    objective: "Construir patrimonio de forma sostenida aprovechando el crecimiento con ventajas fiscales.",
    steps: pasos(7),
    components: componentes("acumulacion-patrimonial", [
      ["Cash Value Life Insurance", "Seguro con valor en efectivo que acumula capital.", "PiggyBank", "#3b82f6", "Esencial", "Acumulación Principal", "Activo", "Implementado", "$500,000", "Suma asegurada", 5, "Crítica"],
      ["IUL", "Indexed Universal Life: crecimiento ligado a un índice con piso garantizado.", "LineChart", "#a78bfa", "Esencial", "Crecimiento Indexado", "Activo", "Implementado", "$350,000", "Suma asegurada", 4, "Alta"],
      ["Anualidades", "Instrumento de acumulación con renta futura garantizada.", "Landmark", "#22c55e", "Recomendado", "Renta Futura", "Activo", "Implementado", "$120,000", "Aporte acumulado", 4, "Alta"],
      ["Estrategia de Ahorro", "Plan de aportes periódicos ajustado a la capacidad de ahorro.", "Wallet", "#e0a836", "Esencial", "Disciplina de Aporte", "Activo", "Implementado", "$1,500 / mes", "Aporte mensual", 4, "Alta"],
      ["Inversión Complementaria", "Cartera complementaria para diversificar el crecimiento.", "ChartCandlestick", "#06b6d4", "Opcional", "Diversificación", "En Proceso", "En configuración", undefined, "Cartera", 2, "Media"],
      ["Revisión Semestral", "Reajuste de aportes y rendimiento dos veces al año.", "CalendarCheck", "#f97316", "Esencial", "Monitoreo y Ajuste", "Programado", `Próxima: ${fecha(70)}`, undefined, "Servicio", 3, "Media"],
    ]),
  },
  {
    slug: "retiro-inteligente",
    name: "Retiro Inteligente",
    order: 2,
    icon: "Umbrella",
    color: "#22c55e",
    tagline: "Diseñamos ingresos de por vida para que disfrutes tu retiro con tranquilidad.",
    features: ["Diagnóstico de Retiro", "Ingresos Garantizados", "Social Security Optimization", "Anualidades de Retiro", "Distribución Patrimonial"],
    status: "Activo",
    kind: "Retiro",
    audience: "Pre-retiro, Profesionales, Empresarios",
    complexity: 3,
    complexityLabel: "Media",
    reviewCadence: "Revisión Anual",
    objective: "Asegurar un ingreso estable y suficiente durante toda la etapa de retiro.",
    steps: pasos(6),
    components: componentes("retiro-inteligente", [
      ["Anualidad de Retiro", "Renta vitalicia que asegura ingreso mensual de por vida.", "Landmark", "#22c55e", "Esencial", "Ingreso Vitalicio", "Activo", "Implementado", "$4,200 / mes", "Renta mensual", 5, "Crítica"],
      ["Ingresos Garantizados", "Piso de ingreso garantizado independiente del mercado.", "ShieldCheck", "#3b82f6", "Esencial", "Piso de Ingreso", "Activo", "Implementado", "$2,800 / mes", "Ingreso mínimo", 4, "Alta"],
      ["Social Security Optimization", "Estrategia de cuándo y cómo reclamar la pensión pública.", "Calculator", "#a78bfa", "Recomendado", "Optimización", "Activo", "Implementado", undefined, "Asesoría", 3, "Media"],
      ["Diagnóstico de Retiro", "Proyección de la brecha entre lo que hay y lo que hará falta.", "Gauge", "#e0a836", "Esencial", "Diagnóstico", "Activo", "Implementado", undefined, "Análisis", 4, "Alta"],
      ["Distribución Patrimonial", "Orden de retiro de cada cuenta para minimizar impuestos.", "Share2", "#06b6d4", "Recomendado", "Eficiencia Fiscal", "En Proceso", "En configuración", undefined, "Estrategia", 3, "Media"],
      ["Revisión Anual", "Ajuste del plan a la inflación y a los cambios de vida.", "CalendarCheck", "#f97316", "Esencial", "Monitoreo y Ajuste", "Programado", `Próxima: ${fecha(120)}`, undefined, "Servicio", 3, "Media"],
    ]),
  },
  {
    slug: "proteccion-juridica",
    name: "Protección Jurídica",
    order: 3,
    icon: "Scale",
    color: "#e0a836",
    tagline: "Aseguramos que tu patrimonio esté protegido legalmente y bien estructurado.",
    features: ["Living Trust", "Will (Testamento)", "Power of Attorney", "Healthcare Directive", "Titulación de Activos"],
    status: "Activo",
    kind: "Legal",
    audience: "Familias con patrimonio, Empresarios",
    complexity: 5,
    complexityLabel: "Muy Alta",
    reviewCadence: "Revisión Anual",
    objective: "Estructurar legalmente el patrimonio para que se transfiera sin conflictos ni sucesión judicial.",
    steps: pasos(6),
    components: componentes("proteccion-juridica", [
      ["Living Trust", "Fideicomiso en vida que evita el proceso sucesorio.", "Scroll", "#e0a836", "Esencial", "Estructura Principal", "Activo", "Implementado", undefined, "Instrumento", 5, "Crítica"],
      ["Will (Testamento)", "Documento que ordena la voluntad sobre los bienes.", "FileText", "#a78bfa", "Esencial", "Voluntad Sucesoria", "Activo", "Implementado", undefined, "Instrumento", 5, "Crítica"],
      ["Power of Attorney", "Poder para actuar en tu nombre si no puedes hacerlo.", "UserCheck", "#3b82f6", "Esencial", "Representación", "Activo", "Implementado", undefined, "Instrumento", 4, "Alta"],
      ["Healthcare Directive", "Instrucciones médicas anticipadas.", "HeartPulse", "#22c55e", "Recomendado", "Decisiones Médicas", "Activo", "Implementado", undefined, "Instrumento", 3, "Media"],
      ["Titulación de Activos", "Revisión de cómo está titulado cada bien.", "KeyRound", "#06b6d4", "Recomendado", "Ordenamiento", "En Proceso", "En revisión legal", undefined, "Proceso", 4, "Alta"],
      ["Revisión Anual", "Actualización ante cambios legales o familiares.", "CalendarCheck", "#f97316", "Esencial", "Monitoreo y Ajuste", "Programado", `Próxima: ${fecha(95)}`, undefined, "Servicio", 3, "Media"],
    ]),
  },
  {
    slug: "proteccion-fiscal",
    name: "Protección Fiscal",
    order: 4,
    icon: "Landmark",
    color: "#06b6d4",
    tagline: "Optimizamos tu situación fiscal y minimizamos la carga tributaria de tu patrimonio.",
    features: ["Diagnóstico Tributario", "Estrategias CPA", "Estate Tax Planning", "Business Tax Planning", "Coordinación Legal-Fiscal"],
    status: "Activo",
    kind: "Fiscal",
    audience: "Empresarios, Altos ingresos",
    complexity: 5,
    complexityLabel: "Muy Alta",
    reviewCadence: "Revisión Trimestral",
    objective: "Reducir la carga tributaria del patrimonio dentro del marco legal, hoy y en la transferencia.",
    steps: pasos(5),
    components: componentes("proteccion-fiscal", [
      ["Diagnóstico Tributario", "Radiografía de la carga fiscal actual del patrimonio.", "Calculator", "#06b6d4", "Esencial", "Diagnóstico", "Activo", "Implementado", undefined, "Análisis", 5, "Crítica"],
      ["Estate Tax Planning", "Estrategia para el impuesto sucesorio.", "Landmark", "#a78bfa", "Esencial", "Transferencia", "Activo", "Implementado", undefined, "Estrategia", 5, "Crítica"],
      ["Estrategias CPA", "Trabajo coordinado con el contador de la familia.", "Users", "#3b82f6", "Recomendado", "Coordinación", "Activo", "Implementado", undefined, "Asesoría", 4, "Alta"],
      ["Business Tax Planning", "Optimización fiscal de la empresa familiar.", "Briefcase", "#f97316", "Opcional", "Empresa", "En Proceso", "En configuración", undefined, "Estrategia", 3, "Media"],
      ["Coordinación Legal-Fiscal", "Alineación entre la estructura legal y la fiscal.", "GitMerge", "#22c55e", "Recomendado", "Alineación", "Pendiente", "No iniciado", undefined, "Proceso", 3, "Media"],
    ]),
  },
  {
    slug: "sucesion-patrimonial",
    name: "Sucesión Patrimonial",
    order: 5,
    icon: "Users",
    color: "#f472b6",
    tagline: "Garantizamos una transferencia eficiente y armoniosa del legado a futuras generaciones.",
    features: ["Transferencia Patrimonial", "Legacy Planning", "Gobernanza Familiar", "Estrategia para Herederos", "Continuidad Generacional"],
    status: "Activo",
    kind: "Sucesión",
    audience: "Familias multigeneracionales",
    complexity: 4,
    complexityLabel: "Alta",
    reviewCadence: "Revisión Anual",
    objective: "Transferir el patrimonio a la siguiente generación sin conflicto y con el propósito familiar intacto.",
    steps: pasos(5),
    components: componentes("sucesion-patrimonial", [
      ["Transferencia Patrimonial", "Mecanismo y calendario de traspaso de los bienes.", "Share2", "#f472b6", "Esencial", "Transferencia", "Activo", "Implementado", undefined, "Estrategia", 5, "Crítica"],
      ["Legacy Planning", "El propósito y los valores que acompañan al patrimonio.", "Sparkles", "#a78bfa", "Recomendado", "Propósito", "Activo", "Implementado", undefined, "Programa", 3, "Media"],
      ["Gobernanza Familiar", "Reglas de decisión y consejo de familia.", "Network", "#3b82f6", "Recomendado", "Gobernanza", "En Proceso", "En configuración", undefined, "Programa", 4, "Alta"],
      ["Estrategia para Herederos", "Preparación de quienes recibirán el patrimonio.", "GraduationCap", "#22c55e", "Opcional", "Preparación", "Pendiente", "No iniciado", undefined, "Programa", 2, "Media"],
      ["Continuidad Generacional", "Plan para que el patrimonio sobreviva tres generaciones.", "Infinity", "#e0a836", "Recomendado", "Continuidad", "Pendiente", "No iniciado", undefined, "Estrategia", 3, "Media"],
    ]),
  },
  {
    slug: "planificacion-empresarial",
    name: "Planificación Empresarial",
    order: 6,
    icon: "Briefcase",
    color: "#f97316",
    tagline: "Protegemos y fortalecemos tu empresa para asegurar su continuidad y crecimiento.",
    features: ["Key Person Insurance", "Buy-Sell Agreement", "Executive Bonus", "Asset Protection", "Business Continuity"],
    status: "Activo",
    kind: "Empresarial",
    audience: "Empresarios, Socios, Directivos",
    complexity: 5,
    complexityLabel: "Muy Alta",
    reviewCadence: "Revisión Anual",
    objective: "Asegurar que la empresa sobreviva a la ausencia de cualquiera de sus personas clave.",
    steps: pasos(6),
    components: componentes("planificacion-empresarial", [
      ["Key Person Insurance", "Cobertura sobre la persona clave del negocio.", "UserRound", "#f97316", "Esencial", "Protección del Negocio", "Activo", "Implementado", "$2,000,000", "Suma asegurada", 5, "Crítica"],
      ["Buy-Sell Agreement", "Acuerdo de compraventa entre socios, financiado.", "Handshake", "#a78bfa", "Esencial", "Continuidad Societaria", "Activo", "Implementado", "$1,500,000", "Valor pactado", 5, "Crítica"],
      ["Executive Bonus", "Beneficio para retener al equipo directivo.", "Award", "#3b82f6", "Recomendado", "Retención de Talento", "Activo", "Implementado", "$60,000 / año", "Beneficio anual", 3, "Media"],
      ["Asset Protection", "Blindaje de los activos de la empresa.", "ShieldCheck", "#22c55e", "Recomendado", "Blindaje", "En Proceso", "En configuración", undefined, "Estructura", 4, "Alta"],
      ["Business Continuity", "Plan de continuidad operativa ante una ausencia.", "Workflow", "#e0a836", "Esencial", "Continuidad Operativa", "Programado", `Próxima: ${fecha(60)}`, undefined, "Plan", 4, "Alta"],
    ]),
  },
  {
    slug: "educacion-financiera",
    name: "Educación Financiera Familiar",
    order: 7,
    icon: "GraduationCap",
    color: "#a78bfa",
    tagline: "Educamos a cada generación para que tome decisiones financieras inteligentes.",
    features: ["Educación para Niños", "Educación para Jóvenes", "Educación para Padres", "Educación para Empresarios", "Educación para Abuelos"],
    status: "Activo",
    kind: "Educación",
    audience: "Toda la familia",
    complexity: 2,
    complexityLabel: "Baja",
    reviewCadence: "Programa Continuo",
    objective: "Que cada miembro de la familia entienda el plan patrimonial y sepa sostenerlo.",
    steps: pasos(6),
    components: componentes("educacion-financiera", [
      ["Educación para Niños", "Primeros conceptos de ahorro y valor del dinero.", "Baby", "#a78bfa", "Esencial", "Base Temprana", "Activo", "Implementado", undefined, "Programa", 3, "Media"],
      ["Educación para Jóvenes", "Crédito, primer empleo y primeras decisiones.", "Backpack", "#3b82f6", "Esencial", "Formación Juvenil", "Activo", "Implementado", undefined, "Programa", 3, "Media"],
      ["Educación para Padres", "Presupuesto familiar y planificación del hogar.", "Users", "#22c55e", "Esencial", "Gestión del Hogar", "Activo", "Implementado", undefined, "Programa", 4, "Alta"],
      ["Educación para Empresarios", "Separación de finanzas personales y del negocio.", "Briefcase", "#f97316", "Recomendado", "Formación Empresarial", "En Proceso", "En configuración", undefined, "Programa", 3, "Media"],
      ["Educación para Abuelos", "Transmisión del legado y planificación del cuidado.", "HeartHandshake", "#e0a836", "Opcional", "Legado", "Pendiente", "No iniciado", undefined, "Programa", 2, "Media"],
    ]),
  },
];

/** Atajo para enlazar por slug desde el resto de datos. */
const SLUG = DEMO_SOLUTIONS.map((s) => s.slug);
const NOMBRE = Object.fromEntries(DEMO_SOLUTIONS.map((s) => [s.slug, s.name]));

// ── Catálogo de componentes ────────────────────────────────────────────────

type CatSeed = [
  name: string,
  description: string,
  icon: string,
  category: SolComponent["category"],
  type: string,
  slug: string,
  status: SolComponent["status"],
  dias: number,
  author: string,
  usedIn: number,
];

const COMPONENT_SEEDS: CatSeed[] = [
  ["Cobertura por Fallecimiento", "Protección económica en caso de fallecimiento del titular.", "HeartPulse", "Protección", "Cobertura", "proteccion-familiar", "Activo", -9, "Ana López", 18],
  ["Cobertura por Invalidez Total y Permanente", "Indemnización en caso de invalidez total del asegurado.", "Accessibility", "Protección", "Cobertura", "proteccion-familiar", "Activo", -13, "Luis Navarro", 12],
  ["Cobertura de Enfermedades Críticas", "Apoyo financiero ante diagnóstico de enfermedades críticas.", "Activity", "Salud", "Cobertura", "proteccion-familiar", "Activo", -17, "María Pérez", 9],
  ["Ahorro Programado", "Acumulación de capital mediante aportes periódicos.", "PiggyBank", "Ahorro", "Ahorro", "acumulacion-patrimonial", "Activo", -19, "Carlos Bermeo", 14],
  ["Renta por Hospitalización", "Ingreso diario por cada día de hospitalización.", "Hospital", "Salud", "Beneficio", "proteccion-familiar", "Activo", -22, "Sofía Castillo", 7],
  ["Educación de Hijos", "Asegura los recursos para la educación futura de tus hijos.", "GraduationCap", "Educación", "Meta", "educacion-financiera", "Activo", -25, "Ana López", 10],
  ["Devolución de Primas", "Devolución de primas pagadas al finalizar el plazo contratado.", "RotateCcw", "Ahorro", "Beneficio", "acumulacion-patrimonial", "Borrador", -27, "Luis Navarro", 3],
  ["Gastos Médicos Mayores", "Cobertura de gastos médicos por accidentes o enfermedades.", "Stethoscope", "Salud", "Cobertura", "proteccion-familiar", "Activo", -29, "María Pérez", 8],
  ["Fondo de Emergencia", "Reserva de liquidez para imprevistos familiares.", "Umbrella", "Ahorro", "Meta", "proteccion-familiar", "Activo", -31, "Carlos Bermeo", 11],
  ["Anualidad Vitalicia", "Renta mensual garantizada durante toda la vida.", "Landmark", "Ahorro", "Ahorro", "retiro-inteligente", "Activo", -33, "Diego Martínez", 9],
  ["Indexed Universal Life", "Crecimiento ligado a un índice con piso garantizado.", "LineChart", "Ahorro", "Ahorro", "acumulacion-patrimonial", "Activo", -35, "Ana López", 12],
  ["Living Trust", "Fideicomiso en vida que evita el proceso sucesorio.", "Scroll", "Protección", "Cobertura", "proteccion-juridica", "Activo", -37, "Luis Navarro", 6],
  ["Power of Attorney", "Poder legal para actuar en nombre del titular.", "UserCheck", "Protección", "Beneficio", "proteccion-juridica", "Activo", -39, "María Pérez", 6],
  ["Healthcare Directive", "Instrucciones médicas anticipadas del titular.", "HeartHandshake", "Salud", "Beneficio", "proteccion-juridica", "Activo", -41, "Sofía Castillo", 5],
  ["Key Person Insurance", "Cobertura sobre la persona clave del negocio.", "UserRound", "Protección", "Cobertura", "planificacion-empresarial", "Activo", -43, "Carlos Bermeo", 4],
  ["Buy-Sell Agreement", "Acuerdo de compraventa entre socios, financiado.", "Handshake", "Beneficios", "Beneficio", "planificacion-empresarial", "Activo", -45, "Diego Martínez", 4],
  ["Executive Bonus", "Beneficio para retener al equipo directivo.", "Award", "Beneficios", "Beneficio", "planificacion-empresarial", "Borrador", -47, "Ana López", 2],
  ["Estate Tax Planning", "Estrategia frente al impuesto sucesorio.", "Calculator", "Otros", "Beneficio", "proteccion-fiscal", "Activo", -49, "Luis Navarro", 5],
  ["Social Security Optimization", "Estrategia de cuándo reclamar la pensión pública.", "Gauge", "Otros", "Beneficio", "retiro-inteligente", "Activo", -51, "María Pérez", 7],
  ["Gobernanza Familiar", "Reglas de decisión y consejo de familia.", "Network", "Educación", "Meta", "sucesion-patrimonial", "Activo", -53, "Sofía Castillo", 3],
  ["Legacy Planning", "El propósito y los valores que acompañan al patrimonio.", "Sparkles", "Educación", "Meta", "sucesion-patrimonial", "Borrador", -55, "Carlos Bermeo", 2],
  ["Long-Term Care", "Protección para gastos de cuidado a largo plazo.", "Hospital", "Salud", "Cobertura", "proteccion-familiar", "Activo", -57, "Diego Martínez", 8],
  ["Asset Protection", "Blindaje legal de los activos frente a terceros.", "ShieldCheck", "Protección", "Cobertura", "planificacion-empresarial", "Activo", -59, "Ana López", 5],
  ["Inversión Complementaria", "Cartera complementaria para diversificar el crecimiento.", "ChartCandlestick", "Ahorro", "Ahorro", "acumulacion-patrimonial", "Archivado", -61, "Luis Navarro", 1],
];

export const DEMO_COMPONENTS: Omit<SolComponent, "id">[] = COMPONENT_SEEDS.map(
  ([name, description, icon, category, type, slug, status, dias, author, usedIn], i) => ({
    name,
    description,
    icon,
    category,
    type,
    relatedPlan: NOMBRE[slug],
    relatedSlug: slug,
    status,
    updatedAt: fecha(dias),
    author,
    usedIn,
    order: i,
  })
);

// ── Rutas de cliente ───────────────────────────────────────────────────────

type RouteSeed = [name: string, description: string, icon: string, color: string, slug: string, stages: number, status: SolRoute["status"], dias: number, author: string];

const ROUTE_SEEDS: RouteSeed[] = [
  ["Familias Jóvenes", "Diseñada para familias en crecimiento que buscan proteger su futuro financiero.", "Users", "#a78bfa", "proteccion-familiar", 7, "Activo", -9, "Ana López"],
  ["Familias con Hijos", "Ruta enfocada en la educación y bienestar integral de los hijos.", "Baby", "#3b82f6", "educacion-financiera", 6, "Activo", -13, "Luis Navarro"],
  ["Familias con Hipoteca", "Protección y estabilidad financiera ante compromisos hipotecarios.", "Home", "#f97316", "proteccion-familiar", 6, "Activo", -17, "María Pérez"],
  ["Emprendedores", "Diseñada para dueños de negocio y profesionales independientes.", "Briefcase", "#06b6d4", "planificacion-empresarial", 7, "Activo", -19, "Carlos Bermeo"],
  ["Abuelos Cuidadores", "Protección para abuelos que cuidan activamente a sus nietos.", "HeartHandshake", "#f472b6", "proteccion-familiar", 5, "Borrador", -22, "Sofía Castillo"],
  ["Madres Solteras", "Pensada para madres que buscan seguridad y apoyo para sus hijos.", "UserRound", "#22c55e", "proteccion-familiar", 6, "Activo", -25, "Ana López"],
  ["Planeación Sucesoria", "Asegura la transferencia de patrimonio y reduce conflictos familiares.", "Share2", "#a78bfa", "sucesion-patrimonial", 7, "Activo", -27, "Luis Navarro"],
  ["Situaciones Críticas", "Respuesta rápida ante eventos inesperados que afectan la estabilidad familiar.", "TriangleAlert", "#f43f5e", "proteccion-familiar", 5, "Borrador", -29, "María Pérez"],
  ["Pre-Retiro", "Acompaña los últimos años antes del retiro y ordena la transición.", "Umbrella", "#22c55e", "retiro-inteligente", 6, "Activo", -33, "Diego Martínez"],
  ["Alto Patrimonio", "Estructura legal y fiscal para patrimonios complejos.", "Landmark", "#e0a836", "proteccion-juridica", 8, "Activo", -37, "Carlos Bermeo"],
  ["Profesionales Independientes", "Protección de ingresos para quien no tiene nómina.", "Stethoscope", "#06b6d4", "proteccion-familiar", 5, "Activo", -41, "Sofía Castillo"],
  ["Segunda Generación", "Preparación de los herederos antes de la transferencia.", "GraduationCap", "#f472b6", "sucesion-patrimonial", 6, "Archivado", -45, "Ana López"],
];

export const DEMO_ROUTES: Omit<SolRoute, "id">[] = ROUTE_SEEDS.map(
  ([name, description, icon, color, slug, stages, status, dias, author], i) => ({
    name,
    description,
    icon,
    color,
    relatedPlan: NOMBRE[slug],
    relatedPlanIcon: DEMO_SOLUTIONS.find((s) => s.slug === slug)!.icon,
    stages,
    status,
    updatedAt: fecha(dias),
    author,
    order: i,
  })
);

// ── Casos de uso ───────────────────────────────────────────────────────────

type UseCaseSeed = [
  name: string,
  description: string,
  icon: string,
  color: string,
  slug: string,
  segment: string,
  owner: string,
  status: SolUseCase["status"],
  dias: number,
  families: number,
  completion: number,
  impact: SolUseCase["impact"],
];

const USE_CASE_SEEDS: UseCaseSeed[] = [
  ["Protección para Familias Jóvenes", "Asegura el futuro de tu familia en las primeras etapas, creando una base sólida de protección y ahorro.", "Users", "#a78bfa", "proteccion-familiar", "Familias Jóvenes", "Ana López", "Activo", -9, 6, 92, "Muy Alto"],
  ["Ingreso Protegido ante Incapacidad", "Reemplaza tu ingreso si una enfermedad o accidente te impide trabajar.", "Accessibility", "#3b82f6", "proteccion-familiar", "Cuidadores Principales", "Luis Navarro", "Activo", -13, 5, 89, "Muy Alto"],
  ["Protección de Hipoteca y Deudas", "Evita que tu familia pierda su hogar ante imprevistos que afecten tus ingresos.", "Home", "#f97316", "proteccion-familiar", "Familias con Hipoteca", "María Pérez", "Activo", -17, 5, 89, "Muy Alto"],
  ["Independientes y Dueños de Negocio", "Protege tu capacidad de generar ingresos y la continuidad de tu negocio.", "Briefcase", "#06b6d4", "planificacion-empresarial", "Emprendedores", "Carlos Bermeo", "Activo", -19, 4, 86, "Alto"],
  ["Protección para Abuelos Cuidadores", "Asegura tu bienestar y el de tus nietos si asumes el rol de cuidador principal.", "HeartHandshake", "#f472b6", "proteccion-familiar", "Cuidadores Principales", "Sofía Castillo", "Activo", -22, 4, 84, "Alto"],
  ["Madres Solteras Protegidas", "Diseñada para brindar estabilidad financiera y emocional a tus hijos.", "UserRound", "#22c55e", "proteccion-familiar", "Familias con Hijos", "Ana López", "Activo", -25, 3, 91, "Muy Alto"],
  ["Planeación para Fallecimiento Prematuro", "Garantiza que tu familia esté protegida financieramente.", "ShieldCheck", "#a78bfa", "proteccion-familiar", "Todas las Familias", "Luis Navarro", "Activo", -27, 3, 97, "Muy Alto"],
  ["Complemento a Plan Patrimonial", "Integra la protección familiar como pilar clave de tu plan patrimonial integral.", "Layers", "#e0a836", "sucesion-patrimonial", "Todas las Familias", "María Pérez", "Activo", -29, 3, 85, "Alto"],
  ["Educación de los Hijos", "Garantizar los recursos necesarios para la formación académica de los hijos.", "GraduationCap", "#3b82f6", "educacion-financiera", "Familias con Hijos", "Luis Navarro", "Activo", -31, 4, 88, "Alto"],
  ["Cobertura de Enfermedades Críticas", "Brindar apoyo económico ante el diagnóstico de enfermedades críticas.", "Activity", "#22c55e", "proteccion-familiar", "Todas las Familias", "Carlos Rodríguez", "Activo", -33, 3, 82, "Alto"],
  ["Cuidado en la Tercera Edad", "Asegurar recursos para el cuidado y bienestar en la tercera edad.", "Hospital", "#f472b6", "retiro-inteligente", "Pre-Retiro", "Sofía Castillo", "Activo", -35, 3, 79, "Medio"],
  ["Crecimiento Patrimonial", "Hacer crecer el patrimonio familiar mediante inversiones seguras y rentables.", "TrendingUp", "#06b6d4", "acumulacion-patrimonial", "Profesionales", "Diego Martínez", "Borrador", -37, 2, 64, "Medio"],
  ["Fondo de Emergencia Familiar", "Contar con liquidez inmediata ante emergencias o gastos inesperados.", "Umbrella", "#f97316", "proteccion-familiar", "Todas las Familias", "Ana López", "Activo", -39, 4, 87, "Alto"],
  ["Planificación Sucesoria", "Asegurar una transferencia eficiente del patrimonio y minimizar conflictos familiares.", "Share2", "#a78bfa", "sucesion-patrimonial", "Familias con patrimonio", "Luis Navarro", "Activo", -41, 3, 81, "Alto"],
  ["Optimización Fiscal del Patrimonio", "Reducir la carga tributaria del patrimonio dentro del marco legal.", "Landmark", "#e0a836", "proteccion-fiscal", "Altos ingresos", "María Pérez", "Activo", -43, 2, 76, "Medio"],
  ["Continuidad del Negocio Familiar", "Asegurar que la empresa sobreviva a la ausencia de una persona clave.", "Workflow", "#22c55e", "planificacion-empresarial", "Emprendedores", "Carlos Bermeo", "Archivado", -45, 1, 58, "Bajo"],
];

export const DEMO_USE_CASES: Omit<SolUseCase, "id">[] = USE_CASE_SEEDS.map(
  ([name, description, icon, color, slug, segment, owner, status, dias, families, completion, impact], i) => ({
    code: `CU-${String(i + 1).padStart(3, "0")}`,
    name,
    description,
    icon,
    color,
    relatedPlan: NOMBRE[slug],
    segment,
    owner,
    status,
    updatedAt: fecha(dias),
    families,
    completion,
    impact,
    order: i,
  })
);

// ── Biblioteca ─────────────────────────────────────────────────────────────

type ResourceSeed = [
  title: string,
  description: string,
  kind: SolResource["kind"],
  slug: string,
  meta: string,
  dias: number,
  featured: boolean,
  uses: number,
  usesLabel: string,
];

const RESOURCE_SEEDS: ResourceSeed[] = [
  ["Guía Completa: Protección Familiar", "Todo lo que necesitas saber para asesorar y proteger a las familias de tus clientes.", "Guía", "proteccion-familiar", "PDF · 12 min lectura", -9, true, 342, "descargas"],
  ["Plantilla de Análisis de Necesidades Familiares", "Herramienta práctica para identificar y evaluar las necesidades de cada familia.", "Plantilla", "proteccion-familiar", "Excel · Descargable", -11, true, 298, "descargas"],
  ["Cómo Presentar Protección Familiar de Forma Efectiva", "Estrategias y consejos para comunicar el valor de la protección familiar.", "Video", "proteccion-familiar", "Video · 18 min", -13, true, 245, "reproducciones"],
  ["Tendencias en Protección Familiar", "Conoce las principales tendencias y oportunidades del mercado.", "Artículo", "proteccion-familiar", "Artículo · 5 min lectura", -15, true, 220, "lecturas"],
  ["Checklist de Protección Familiar", "Los puntos que no se pueden pasar por alto en una implementación.", "Guía", "proteccion-familiar", "PDF · 6 min lectura", -17, false, 186, "descargas"],
  ["Webinar: Protege lo que Más Importa", "Sesión grabada con casos reales de protección familiar.", "Webinar", "proteccion-familiar", "Webinar · 52 min", -19, false, 276, "reproducciones"],
  ["Calculadora de Cobertura Familiar", "Determina el capital necesario según ingresos y dependientes.", "Herramienta", "proteccion-familiar", "Herramienta · En línea", -21, false, 220, "usos"],
  ["Los 5 Beneficios de la Protección Familiar", "Los argumentos que mejor funcionan en la primera conversación.", "Artículo", "proteccion-familiar", "Artículo · 4 min lectura", -23, false, 158, "lecturas"],
  ["Guía de Acumulación Patrimonial", "Cómo construir patrimonio con ventajas fiscales.", "Guía", "acumulacion-patrimonial", "PDF · 15 min lectura", -25, false, 174, "descargas"],
  ["Plantilla de Proyección de Ahorro", "Proyecta el capital acumulado a 10, 20 y 30 años.", "Plantilla", "acumulacion-patrimonial", "Excel · Descargable", -27, false, 141, "descargas"],
  ["IUL Explicado en 10 Minutos", "Qué es, cuándo conviene y cuándo no.", "Video", "acumulacion-patrimonial", "Video · 10 min", -29, false, 198, "reproducciones"],
  ["Guía de Retiro Inteligente", "Diseño de ingresos de por vida, paso a paso.", "Guía", "retiro-inteligente", "PDF · 18 min lectura", -31, false, 163, "descargas"],
  ["Calculadora de Brecha de Retiro", "Cuánto falta entre lo que hay y lo que hará falta.", "Herramienta", "retiro-inteligente", "Herramienta · En línea", -33, false, 152, "usos"],
  ["Webinar: Social Security Sin Errores", "Cuándo reclamar y por qué la fecha lo cambia todo.", "Webinar", "retiro-inteligente", "Webinar · 45 min", -35, false, 137, "reproducciones"],
  ["Guía de Protección Jurídica", "Living Trust, testamento y poderes explicados sin jerga.", "Guía", "proteccion-juridica", "PDF · 20 min lectura", -37, false, 129, "descargas"],
  ["Plantilla de Inventario Patrimonial", "Todo lo que hay que listar antes de estructurar.", "Plantilla", "proteccion-juridica", "Excel · Descargable", -39, false, 118, "descargas"],
  ["Artículo: Evitar el Proceso Sucesorio", "Por qué un fideicomiso ahorra tiempo y conflicto.", "Artículo", "proteccion-juridica", "Artículo · 7 min lectura", -41, false, 104, "lecturas"],
  ["Guía de Optimización Fiscal", "Estrategias legales para reducir la carga tributaria.", "Guía", "proteccion-fiscal", "PDF · 16 min lectura", -43, false, 96, "descargas"],
  ["Plantilla de Diagnóstico Tributario", "Radiografía fiscal del patrimonio en una hoja.", "Plantilla", "proteccion-fiscal", "Excel · Descargable", -45, false, 88, "descargas"],
  ["Guía de Sucesión Patrimonial", "Cómo transferir sin romper la familia.", "Guía", "sucesion-patrimonial", "PDF · 14 min lectura", -47, false, 112, "descargas"],
  ["Video: La Conversación Difícil", "Cómo hablar de herencia con los hijos.", "Video", "sucesion-patrimonial", "Video · 22 min", -49, false, 145, "reproducciones"],
  ["Guía de Planificación Empresarial", "Key person, buy-sell y continuidad operativa.", "Guía", "planificacion-empresarial", "PDF · 19 min lectura", -51, false, 87, "descargas"],
  ["Plantilla de Valoración de Negocio", "Base para el acuerdo de compraventa entre socios.", "Plantilla", "planificacion-empresarial", "Excel · Descargable", -53, false, 74, "descargas"],
  ["Programa de Educación Financiera Familiar", "El plan completo por edades, listo para usar.", "Guía", "educacion-financiera", "PDF · 24 min lectura", -55, false, 121, "descargas"],
];

export const DEMO_RESOURCES: Omit<SolResource, "id">[] = RESOURCE_SEEDS.map(
  ([title, description, kind, slug, meta, dias, featured, uses, usesLabel], i) => ({
    title,
    description,
    kind,
    relatedPlan: NOMBRE[slug],
    meta,
    date: fecha(dias),
    featured,
    uses,
    usesLabel,
    order: i,
  })
);

// ── Documentos de solución ─────────────────────────────────────────────────

type DocSeed = [
  name: string,
  category: string,
  format: SolDocument["format"],
  size: string,
  slug: string,
  stage: string,
  status: SolDocument["status"],
  dias: number,
  hora: string,
];

const DOC_SEEDS: DocSeed[] = [
  ["Guía del Cliente - Protección Familiar", "Guías", "PDF", "2.4 MB", "proteccion-familiar", "1. Diagnóstico Inicial", "Activo", -9, "10:30 AM"],
  ["Checklist de Implementación", "Checklists", "DOCX", "1.1 MB", "proteccion-familiar", "2. Calcular Necesidad", "Activo", -13, "03:15 PM"],
  ["Calculadora de Necesidad de Vida", "Herramientas", "XLSX", "985 KB", "proteccion-familiar", "2. Calcular Necesidad", "Activo", -17, "09:45 AM"],
  ["Análisis de Riesgos Familiar", "Análisis", "PDF", "3.2 MB", "proteccion-familiar", "1. Diagnóstico Inicial", "Pendiente de Firma", -10, "11:20 AM"],
  ["Propuesta de Protección Familiar", "Propuestas", "DOCX", "1.8 MB", "proteccion-familiar", "7. Presentar Propuesta", "Pendiente de Firma", -11, "02:10 PM"],
  ["Ilustración Life Insurance", "Propuestas", "PDF", "4.7 MB", "proteccion-familiar", "7. Presentar Propuesta", "Activo", -12, "04:22 PM"],
  ["Acuerdo de Servicio", "Legales", "DOCX", "1.3 MB", "proteccion-familiar", "7. Presentar Propuesta", "Firmado", -15, "01:05 PM"],
  ["Disclosure Anual", "Compliance", "PDF", "2.1 MB", "proteccion-familiar", "8. Implementar Plan", "Revisión Periódica", -19, "10:12 AM"],
  ["Presentación Comercial", "Propuestas", "PPTX", "6.2 MB", "proteccion-familiar", "7. Presentar Propuesta", "Activo", -21, "05:40 PM"],
  ["Guía del Cliente - Acumulación", "Guías", "PDF", "2.8 MB", "acumulacion-patrimonial", "1. Diagnóstico Inicial", "Activo", -14, "09:05 AM"],
  ["Proyección de Acumulación a 20 años", "Análisis", "XLSX", "1.4 MB", "acumulacion-patrimonial", "5. Diseñar Estrategia", "Activo", -16, "03:50 PM"],
  ["Propuesta IUL", "Propuestas", "PDF", "3.9 MB", "acumulacion-patrimonial", "7. Presentar Propuesta", "Pendiente de Firma", -18, "11:35 AM"],
  ["Guía del Cliente - Retiro", "Guías", "PDF", "3.1 MB", "retiro-inteligente", "1. Diagnóstico Inicial", "Activo", -20, "08:55 AM"],
  ["Diagnóstico de Brecha de Retiro", "Análisis", "XLSX", "1.2 MB", "retiro-inteligente", "2. Calcular Necesidad", "Activo", -23, "02:30 PM"],
  ["Acta de Constitución de Trust", "Legales", "PDF", "5.4 MB", "proteccion-juridica", "8. Implementar Plan", "Firmado", -26, "12:15 PM"],
  ["Inventario Patrimonial", "Análisis", "XLSX", "2.2 MB", "proteccion-juridica", "3. Evaluar Ingresos", "Activo", -28, "10:40 AM"],
  ["Diagnóstico Tributario", "Análisis", "PDF", "2.6 MB", "proteccion-fiscal", "1. Diagnóstico Inicial", "Activo", -30, "04:05 PM"],
  ["Acuerdo de Gobernanza Familiar", "Legales", "DOCX", "1.7 MB", "sucesion-patrimonial", "5. Diseñar Estrategia", "Pendiente de Firma", -32, "09:20 AM"],
  ["Buy-Sell Agreement", "Legales", "PDF", "3.3 MB", "planificacion-empresarial", "8. Implementar Plan", "Firmado", -34, "01:45 PM"],
  ["Programa de Educación por Edades", "Guías", "PDF", "4.1 MB", "educacion-financiera", "5. Diseñar Estrategia", "Activo", -36, "11:00 AM"],
];

export const DEMO_SOL_DOCUMENTS: Omit<SolDocument, "id">[] = DOC_SEEDS.map(
  ([name, category, format, size, slug, stage, status, dias, hora], i) => ({
    name,
    category,
    format,
    size,
    solutionSlug: slug,
    stage,
    status,
    updatedAt: fecha(dias),
    updatedTime: hora,
    order: i,
  })
);

// ── Familias asignadas ─────────────────────────────────────────────────────

/**
 * Las ocho familias del CRM (`lib/demo-crm.ts`). Se enlazan por nombre: si el
 * CRM está sembrado, la fila muestra su contacto y su ciudad; si no, se queda
 * con el nombre y ya.
 */
const FAMILIAS = [
  "Familia González",
  "Familia Martínez",
  "Familia Rodríguez",
  "Familia Herrera",
  "Familia Méndez",
  "Familia López",
  "Familia Vargas",
  "Familia Cruz",
];

const ASESORES = ["Andrés Vargas", "María López", "Javier Rodríguez", "Camila Torres"];

type AsigSeed = [familia: number, plan: number, status: SolAssignment["status"], progress: number, coverage: number, nota: string];

/**
 * Sesenta asignaciones: cada familia tiene entre 6 y 8 planes contratados,
 * que es la historia real de una familia bien atendida. El estado y el avance
 * están escritos a mano para que las pantallas tengan de todo —implementado,
 * en curso, atascado— y no una nube uniforme.
 */
const ASIGNACIONES: AsigSeed[] = [
  [0, 0, "Implementado", 100, 1250000, "Plan implementado"],
  [0, 1, "En Implementación", 82, 480000, "Actualización de pólizas"],
  [0, 2, "En Implementación", 74, 620000, "Revisión de necesidades"],
  [0, 3, "Implementado", 100, 0, "Trust constituido"],
  [0, 4, "En Proceso", 45, 0, "Diagnóstico tributario"],
  [0, 5, "En Implementación", 68, 0, "Gobernanza en diseño"],
  [0, 7, "En Implementación", 60, 0, "Programa iniciado"],

  [1, 0, "En Implementación", 88, 980000, "Revisión de necesidades"],
  [1, 1, "En Implementación", 71, 350000, "Aportes ajustados"],
  [1, 2, "En Proceso", 38, 410000, "Contacto inicial"],
  [1, 3, "En Implementación", 64, 0, "Testamento en revisión"],
  [1, 5, "Requiere Atención", 32, 0, "Documentos pendientes"],
  [1, 7, "Implementado", 100, 0, "Programa completado"],

  [2, 0, "Implementado", 100, 1850000, "Plan implementado"],
  [2, 1, "Implementado", 100, 720000, "Plan implementado"],
  [2, 2, "En Implementación", 79, 890000, "Anualidad contratada"],
  [2, 3, "En Implementación", 85, 0, "Poderes firmados"],
  [2, 4, "En Implementación", 62, 0, "Estrategia CPA en curso"],
  [2, 5, "En Implementación", 70, 0, "Consejo de familia formado"],
  [2, 6, "En Implementación", 66, 1500000, "Buy-sell firmado"],
  [2, 7, "En Implementación", 58, 0, "Programa en curso"],

  [3, 0, "En Implementación", 72, 760000, "Análisis de riesgo"],
  [3, 1, "En Proceso", 41, 210000, "Propuesta enviada"],
  [3, 2, "Pausado", 24, 0, "En espera del cliente"],
  [3, 3, "En Implementación", 56, 0, "Testamento en borrador"],
  [3, 7, "En Implementación", 62, 0, "Programa iniciado"],

  [4, 0, "En Implementación", 78, 890000, "Propuesta enviada"],
  [4, 1, "En Implementación", 69, 340000, "Aportes al día"],
  [4, 2, "En Implementación", 73, 520000, "Diagnóstico completado"],
  [4, 3, "En Proceso", 44, 0, "Inventario en curso"],
  [4, 4, "En Proceso", 36, 0, "Diagnóstico iniciado"],
  [4, 6, "Requiere Atención", 28, 800000, "Valoración pendiente"],
  [4, 7, "En Implementación", 55, 0, "Programa en curso"],

  [5, 0, "Implementado", 100, 1320000, "Revisión anual"],
  [5, 1, "En Implementación", 84, 560000, "Aportes ajustados"],
  [5, 2, "Implementado", 100, 1100000, "Renta activa"],
  [5, 3, "Implementado", 100, 0, "Estructura completa"],
  [5, 4, "En Implementación", 67, 0, "Estrategia aplicada"],
  [5, 5, "En Implementación", 76, 0, "Transferencia en curso"],
  [5, 7, "Implementado", 100, 0, "Programa completado"],

  [6, 0, "En Proceso", 45, 550000, "Contacto inicial"],
  [6, 1, "En Proceso", 33, 180000, "Propuesta enviada"],
  [6, 2, "Pausado", 18, 0, "En espera del cliente"],
  [6, 3, "En Proceso", 40, 0, "Diagnóstico legal"],
  [6, 7, "En Implementación", 52, 0, "Programa iniciado"],

  [7, 0, "Requiere Atención", 60, 680000, "Documentos pendientes"],
  [7, 1, "En Implementación", 77, 640000, "Aportes al día"],
  [7, 2, "En Implementación", 81, 960000, "Anualidad contratada"],
  [7, 3, "En Implementación", 88, 0, "Trust en constitución"],
  [7, 4, "En Implementación", 71, 0, "Estrategia aplicada"],
  [7, 5, "En Implementación", 74, 0, "Herederos en formación"],
  [7, 6, "Implementado", 100, 2000000, "Continuidad asegurada"],
  [7, 7, "En Implementación", 64, 0, "Programa en curso"],

  [1, 6, "En Proceso", 35, 600000, "Valoración en curso"],
  [3, 5, "En Proceso", 29, 0, "Primera reunión"],
  [4, 5, "Pausado", 22, 0, "En espera del cliente"],
  [6, 4, "Requiere Atención", 26, 0, "Documentos pendientes"],
  [5, 6, "En Implementación", 59, 950000, "Acuerdo en revisión"],
  [2, 4, "En Implementación", 63, 0, "Coordinación con CPA"],
  [0, 6, "En Proceso", 42, 700000, "Propuesta enviada"],
];

export const DEMO_ASSIGNMENTS: Omit<SolAssignment, "id">[] = ASIGNACIONES.map(
  ([familia, plan, status, progress, coverage, nota], i) => {
    // Los días hasta la revisión se reparten para que la lista tenga algunas
    // urgentes y otras lejanas, sin recurrir al azar.
    const dias = 3 + ((i * 7) % 90);
    return {
      solutionSlug: SLUG[plan],
      familyName: FAMILIAS[familia],
      status,
      progress,
      coverage,
      lastActivity: fecha(-(2 + (i % 26))),
      lastActivityNote: nota,
      nextReview: fecha(dias),
      daysToReview: dias,
      advisor: ASESORES[(familia + plan) % ASESORES.length],
      order: i,
    };
  }
);

// ── Actividad ──────────────────────────────────────────────────────────────

type ActSeed = [kind: SolActivity["kind"], title: string, detail: string, plan: number, familia: number, author: string, dias: number, hora: string];

const ACTIVIDADES: ActSeed[] = [
  ["Tarea", "Tarea completada", 'María Pérez completó la tarea "Revisión de Necesidades"', 0, 1, "María Pérez", 0, "10:30 AM"],
  ["Reunión", "Reunión realizada", "Reunión de seguimiento con la Familia Rodríguez", 0, 2, "Luis Navarro", 0, "09:15 AM"],
  ["Documento", "Documento subido", "Propuesta de Life Insurance v2.pdf", 0, 5, "Ana López", -1, "04:45 PM"],
  ["Tarea", "Tarea asignada", 'Luis Navarro asignó la tarea "Presentar Propuesta" a María Pérez', 0, 1, "Luis Navarro", -1, "02:20 PM"],
  ["Llamada", "Llamada realizada", "Llamada con la Familia López", 0, 5, "Ana López", -3, "11:30 AM"],
  ["Email", "Email enviado", "Propuesta de protección familiar enviada", 0, 6, "Carlos Bermeo", -4, "03:10 PM"],
  ["Actualización", "Actualización del Plan", "Se actualizó la estrategia de cobertura y componentes seleccionados", 0, 7, "Sofía Castillo", -5, "09:00 AM"],
  ["Tarea", "Tarea completada", 'Daniel Sánchez completó la tarea "Análisis de Riesgos"', 0, 3, "Diego Martínez", -6, "05:25 PM"],
  ["Documento", "Documento subido", "Análisis de Riesgos Familiar.pdf", 0, 4, "María Pérez", -7, "01:40 PM"],
  ["Reunión", "Reunión programada", "Reunión inicial con la Familia Martínez", 0, 1, "Ana López", -8, "10:05 AM"],
  ["Actualización", "Nueva solución creada", "Se creó el plan para la Familia Rodríguez", 0, 2, "Carlos Bermeo", -2, "12:30 PM"],
  ["Actualización", "Plan actualizado", "Acumulación Patrimonial: aportes ajustados", 1, 0, "Luis Navarro", -2, "05:10 PM"],
  ["Documento", "Componente agregado", "IUL Strategy incorporado al plan", 1, 4, "Ana López", -3, "10:50 AM"],
  ["Tarea", "Revisión anual completada", "Revisión anual de la Familia López cerrada", 2, 5, "Diego Martínez", -4, "04:00 PM"],
  ["Reunión", "Reunión realizada", "Presentación de la estrategia de retiro", 2, 7, "María Pérez", -6, "11:15 AM"],
  ["Llamada", "Llamada realizada", "Seguimiento de documentos pendientes", 3, 1, "Sofía Castillo", -8, "02:45 PM"],
  ["Documento", "Documento firmado", "Acta de constitución del Trust", 3, 2, "Luis Navarro", -9, "09:35 AM"],
  ["Email", "Email enviado", "Resumen del diagnóstico tributario", 4, 0, "Carlos Bermeo", -11, "03:25 PM"],
  ["Actualización", "Plan actualizado", "Gobernanza familiar: consejo constituido", 5, 2, "Ana López", -12, "10:20 AM"],
  ["Reunión", "Reunión realizada", "Acuerdo de compraventa entre socios", 6, 7, "Diego Martínez", -14, "01:00 PM"],
  ["Tarea", "Tarea completada", "Programa de educación financiera iniciado", 7, 5, "María Pérez", -15, "08:50 AM"],
  ["Llamada", "Llamada realizada", "Confirmación de la próxima revisión", 1, 6, "Sofía Castillo", -17, "04:35 PM"],
];

export const DEMO_SOL_ACTIVITIES: Omit<SolActivity, "id">[] = ACTIVIDADES.map(
  ([kind, title, detail, plan, familia, author, dias, hora], i) => ({
    kind,
    title,
    detail,
    solutionSlug: SLUG[plan],
    familyName: FAMILIAS[familia],
    author,
    date: fecha(dias),
    time: hora,
    dayLabel: cuando(dias),
    order: i,
  })
);

// ── Herramientas ───────────────────────────────────────────────────────────

export const DEMO_SIMULATIONS: Omit<SolSimulation, "id">[] = [
  ["Familia Joven - Protección Familiar", "proteccion-familiar", "familia-joven", 35, "Casado/a", 2, 5000, "Medio", -2],
  ["Familia con Hijos - Educación de Hijos", "educacion-financiera", "familia-con-hijos", 41, "Casado/a", 3, 7200, "Alto", -6],
  ["Ejecutivo - Protección Patrimonial", "acumulacion-patrimonial", "ejecutivo", 47, "Casado/a", 2, 12000, "Alto", -10],
  ["Retiro - Plan de Retiro", "retiro-inteligente", "pre-retiro", 58, "Casado/a", 0, 9500, "Medio", -12],
  ["Empresario - Continuidad", "planificacion-empresarial", "empresario", 52, "Casado/a", 3, 18000, "Alto", -15],
].map(([name, slug, profile, age, maritalStatus, dependents, monthlyIncome, level, dias], i) => ({
  name: name as string,
  solutionSlug: slug as string,
  profile: profile as string,
  age: age as number,
  maritalStatus: maritalStatus as string,
  dependents: dependents as number,
  monthlyIncome: monthlyIncome as number,
  level: level as SolSimulation["level"],
  icon: DEMO_SOLUTIONS.find((s) => s.slug === slug)!.icon,
  color: DEMO_SOLUTIONS.find((s) => s.slug === slug)!.color,
  date: fecha(dias as number),
  status: "Completada",
  order: i,
}));

export const DEMO_COMPARISONS: Omit<SolComparison, "id">[] = [
  { name: "Familia Joven", date: fecha(-2), solutionSlugs: ["proteccion-familiar", "educacion-financiera", "retiro-inteligente"], order: 0 },
  { name: "Familia con Hijos", date: fecha(-6), solutionSlugs: ["proteccion-familiar", "educacion-financiera", "acumulacion-patrimonial"], order: 1 },
  { name: "Ejecutivo", date: fecha(-10), solutionSlugs: ["acumulacion-patrimonial", "proteccion-fiscal", "retiro-inteligente", "proteccion-juridica"], order: 2 },
  { name: "Pre-Retiro", date: fecha(-12), solutionSlugs: ["retiro-inteligente", "sucesion-patrimonial", "proteccion-juridica"], order: 3 },
];
