/**
 * Datos de demostración del módulo CRM.
 *
 * Solo se siembran en la empresa del super administrador. Una empresa nueva
 * arranca vacía y muestra los estados vacíos de cada página.
 *
 * Se importa dinámicamente desde `lib/services/demo-seed.ts`, así que no
 * entra en el bundle de las páginas.
 */

import type {
  Activity,
  Contact,
  CrmAccount,
  CrmAutomation,
  CrmFamily,
  CrmSegment,
  CrmTag,
  Deal,
} from "@/lib/crm-types";

const AVATAR_COLORS = ["#8b5cf6", "#06b6d4", "#f59e0b", "#64748b", "#3b82f6", "#22c55e", "#f472b6", "#6366f1"];

const SCORE_PARTS = (score: number) => {
  // Reparto verosímil del puntaje en sus cinco componentes de 25 puntos.
  const base = Math.round(score / 5);
  return [
    { label: "Interés", value: Math.min(25, base + 5), max: 25, color: "#a78bfa" },
    { label: "Participación", value: Math.min(25, base), max: 25, color: "#f472b6" },
    { label: "Ajuste ideal", value: Math.min(25, base), max: 25, color: "#22c55e" },
    { label: "Actividad", value: Math.min(25, base), max: 25, color: "#e0a836" },
    { label: "Información", value: Math.min(25, Math.max(0, base - 5)), max: 25, color: "#3b82f6" },
  ];
};

type ContactSeed = [
  string, // nombre
  string, // cargo
  Contact["status"],
  number, // puntaje
  string, // canal
  string, // detalle del canal
  string, // icono
  string, // asesor
  string, // interés principal
  string, // última actividad
  string, // hace…
];

const CONTACT_SEEDS: ContactSeed[] = [
  ["Carlos González", "Empresario", "Lead caliente", 85, "Podcast", "Episodio 12", "Mic", "María López", "Trusts", "Vio email", "hace 2 horas"],
  ["Laura Martínez", "Abogada", "Nuevo", 65, "Descarga PDF", "Guía Trusts", "FileDown", "Andrés Vargas", "Estate Planning", "Descargó PDF", "hace 1 día"],
  ["Javier Rodríguez", "Contador", "En seguimiento", 60, "YouTube", "Video Retiro", "Video", "María López", "Retirement", "Abrió email", "hace 2 días"],
  ["Sofía Herrera", "Médica", "Cita agendada", 78, "Facebook", "Anuncio", "MessageCircle", "Andrés Vargas", "Life Insurance", "Cita agendada", "20 may 2027"],
  ["Ricardo Méndez", "Ingeniero", "Lead frío", 40, "Podcast", "Episodio 8", "Mic", "Camila Torres", "Negocios", "Vio podcast", "hace 5 días"],
  ["Ana Beatriz López", "Empresaria", "Cliente", 92, "Referido", "Cliente actual", "Users", "María López", "Estate Planning", "Reunión", "hace 1 semana"],
  ["Diego Fernández", "Arquitecto", "Propuesta enviada", 70, "Evento", "Seminario", "CalendarDays", "Andrés Vargas", "Trusts", "Propuesta enviada", "hace 3 días"],
  ["María Gabriela Ruiz", "Dentista", "Lead frío", 35, "YouTube", "Short", "Video", "Camila Torres", "Life Insurance", "Vio video", "hace 1 semana"],
  ["Roberto Díaz", "Consultor", "En seguimiento", 68, "LinkedIn", "Publicación", "Briefcase", "María López", "Business Planning", "Abrió email", "hace 4 días"],
  ["Valentina Rojas", "Diseñadora", "Lead caliente", 81, "Instagram", "Reel", "Camera", "Camila Torres", "Trusts", "Agendó consulta", "hace 6 horas"],
  ["Fernando Ruiz", "Comerciante", "Nuevo", 52, "Web", "Formulario", "Globe", "Andrés Vargas", "Life Insurance", "Envió formulario", "hace 2 días"],
  ["Patricia Gómez", "Notaria", "Cita agendada", 74, "Web", "Landing Page", "Globe", "María López", "Estate Planning", "Cita agendada", "28 may 2027"],
];

export const DEMO_CONTACTS: Omit<Contact, "id">[] = CONTACT_SEEDS.map(
  ([name, role, status, score, sourceChannel, sourceDetail, sourceIcon, advisor, mainInterest, lastActivity, lastActivityAt], i) => {
    const slug = name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z]+/g, ".");
    return {
      name,
      email: `${slug}@email.com`,
      phone: `(305) 555-${String(2000 + i * 37).slice(0, 4)}`,
      role,
      location: "Miami, FL, USA",
      status,
      score,
      sourceChannel,
      sourceDetail,
      sourceIcon,
      advisor,
      mainInterest,
      interests: [mainInterest, "Protección Patrimonial", "Retiro y Jubilación"],
      tags: status === "Cliente" ? ["Cliente actual", "High Net Worth"] : ["Prospecto", mainInterest],
      lastActivity,
      lastActivityAt,
      isClient: status === "Cliente",
      owned: i % 3 === 0,
      referred: sourceChannel === "Referido",
      summary: `${name.split(" ")[0]} es ${role.toLowerCase()} y mostró interés en ${mainInterest} tras conocernos por ${sourceChannel}.`,
      personal: [
        { label: "Nombre completo", value: name },
        { label: "Estado civil", value: i % 2 === 0 ? "Casado" : "Soltero" },
        { label: "Teléfono", value: `(305) 555-${String(2000 + i * 37).slice(0, 4)}` },
        { label: "Email", value: `${slug}@email.com` },
        { label: "Dirección", value: "Brickell Ave 1221, Miami, FL 33131" },
      ],
      financial: [
        { label: "Ingreso anual", value: "$450,000 – $500,000" },
        { label: "Patrimonio estimado", value: "$2.5M – $5M" },
        { label: "Liquidez disponible", value: "$750,000 – $1M" },
        { label: "Industria", value: role },
        { label: "Empleados", value: "25 – 50" },
      ],
      scoreBreakdown: SCORE_PARTS(score),
      order: i,
    };
  }
);

// ── Pipeline ───────────────────────────────────────────────────────────────

type DealSeed = [string, string, string, string, string, string, string, number, number, string];

const DEAL_SEEDS: DealSeed[] = [
  ["Carlos Martínez", "nuevos", "Facebook", "Reel", "MessageCircle", "3 errores que destruyen tu patrimonio", "Trust", 92, 25000, "Hace 2 horas"],
  ["María González", "nuevos", "Instagram", "Anuncio", "Camera", "Protege tu familia hoy", "Life Insurance", 78, 15000, "Hace 4 horas"],
  ["José Torres", "nuevos", "TikTok", "Video", "Music2", "¿Qué pasa si no tienes un plan?", "Estate Planning", 65, 10000, "Hace 6 horas"],
  ["Ana López", "contactados", "LinkedIn", "Publicación", "Briefcase", "Planificación patrimonial para empresarios", "Business Planning", 70, 20000, "Hoy, 9:15 AM"],
  ["Diego Ramírez", "contactados", "YouTube", "Video", "Video", "Cómo crear un legado familiar", "Trust", 68, 18000, "Hoy, 11:30 AM"],
  ["Laura Sánchez", "contactados", "Web", "Formulario", "Globe", "Guía: Protección patrimonial", "Life Insurance", 60, 12000, "Ayer, 4:20 PM"],
  ["Pedro Medina", "descubrimiento", "Facebook", "Anuncio", "MessageCircle", "Seguro de vida: mitos y realidades", "Life Insurance", 82, 20000, "Hoy, 10:00 AM"],
  ["Sofía Herrera", "descubrimiento", "Instagram", "Reel", "Camera", "5 razones para tener un Trust", "Estate Planning", 75, 15000, "Ayer, 2:15 PM"],
  ["Andrés Castro", "descubrimiento", "LinkedIn", "Artículo", "Briefcase", "Buy-Sell Agreement explicado", "Business Planning", 60, 30000, "Ayer, 5:45 PM"],
  ["Valentina Rojas", "diagnostico", "Web", "Landing Page", "Globe", "Agenda tu consulta patrimonial", "Trust", 88, 25000, "Hoy, 1:00 PM"],
  ["Roberto Díaz", "diagnostico", "YouTube", "Video", "Video", "Planificación fiscal para familias", "Business Planning", 71, 18000, "Ayer, 11:00 AM"],
  ["Camila Flores", "diagnostico", "Web", "Formulario", "Globe", "Consulta empresarial", "Estate Planning", 69, 15000, "Ayer, 3:30 PM"],
  ["Javier Morales", "estrategia", "LinkedIn", "Mensaje", "Briefcase", "Interés en reunión estratégica", "Business Planning", 85, 40000, "Hoy, 9:30 AM"],
  ["Isabel Paredes", "estrategia", "Instagram", "Anuncio", "Camera", "Protección fiscal y legado", "Life Insurance", 72, 22000, "Ayer, 10:20 AM"],
  ["Fernando Ruiz", "estrategia", "Web", "Formulario", "Globe", "Consulta empresarial", "Buy-Sell", 68, 35000, "Ayer, 2:40 PM"],
  ["Daniela Vela", "propuesta", "Email", "Newsletter", "Mail", "Propuesta de protección patrimonial", "Life Insurance", 90, 25000, "Hoy, 11:00 AM"],
  ["Miguel Ángel", "propuesta", "LinkedIn", "InMail", "Briefcase", "Propuesta Trust familiar", "Trust", 78, 30000, "Ayer, 9:15 AM"],
  ["Patricia Gómez", "propuesta", "Web", "Landing Page", "Globe", "Solución patrimonial completa", "Estate Planning", 72, 28000, "Ayer, 1:45 PM"],
  ["Alejandro Vega", "seguimiento", "Llamada", "Seguimiento", "Phone", "Pendiente decisión final", "Business Planning", 65, 18000, "Hoy, 4:00 PM"],
  ["Carolina Núñez", "seguimiento", "Email", "Seguimiento", "Mail", "Pendiente revisión de propuesta", "Life Insurance", 63, 20000, "Ayer, 6:00 PM"],
  ["Familia Restrepo", "ganado", "Cliente", "Póliza de vida + Trust", "Users", "Plan patrimonial completo", "Life Insurance", 95, 42000, "10 may 2027"],
  ["Empresa Construlux", "ganado", "Cliente", "Buy-Sell Agreement", "Building2", "Acuerdo entre socios", "Business Planning", 93, 35000, "08 may 2027"],
  ["Juan Pablo Ortiz", "ganado", "Cliente", "Plan patrimonial completo", "Users", "Estrategia familiar", "Estate Planning", 91, 28000, "06 may 2027"],
  ["Ricardo Peña", "perdido", "No interesado", "Sin presupuesto", "XCircle", "No es el momento", "Life Insurance", 30, 0, "12 may 2027"],
  ["Lorena Sánchez", "perdido", "Competencia", "Otra aseguradora", "XCircle", "Eligió otra opción", "Trust", 28, 0, "09 may 2027"],
];

export const DEMO_DEALS: Omit<Deal, "id">[] = DEAL_SEEDS.map(
  ([contactName, stageId, sourceChannel, sourceDetail, sourceIcon, headline, interest, score, value, timeLabel], i) => ({
    contactName,
    stageId,
    sourceChannel,
    sourceDetail,
    sourceIcon,
    headline,
    interest,
    score,
    value,
    nextAction: stageId === "seguimiento" ? "Llamar mañana" : "",
    timeLabel,
    closedAt: stageId === "ganado" ? timeLabel : null,
    lostReason: stageId === "perdido" ? sourceDetail : null,
    order: i,
  })
);

// ── Actividad ──────────────────────────────────────────────────────────────

type ActivitySeed = [Activity["kind"], string, string, string, string, string, string, string];

const ACTIVITY_SEEDS: ActivitySeed[] = [
  ["Llamada", "Carlos Martínez", "Trust Planning", "Llamada realizada", "Duración: 12m 45s", "Alejandro V.", "Alejandro Vega", "Hoy, 10:24 AM"],
  ["Email", "Ana López", "Planificación Patrimonial", "Email enviado", "Asunto: Guía Gratuita – Protege tu Legado", "Guía Trust Planning", "Diana Bermeo", "Hoy, 09:18 AM"],
  ["Reunión", "Javier Ramírez", "Seguro de Vida", "Reunión agendada", "Consulta inicial", "Calendly", "María González", "Hoy, 08:47 AM"],
  ["Nota", "María González", "Estate Planning", "Nota agregada", "Cliente interesado en trust irrevocable.", "Diana Bermeo", "Diana Bermeo", "Ayer, 07:36 PM"],
  ["Cambio", "Roberto Díaz", "Planificación Patrimonial", "Clic en enlace", "Enlace: /agendar-consulta", "Página Web", "Sistema", "Ayer, 04:21 PM"],
  ["Tarea", "Laura Sánchez", "Trust Planning", "Tarea completada", "Enviar propuesta de trust", "Diana Bermeo", "Diana Bermeo", "Ayer, 11:03 AM"],
  ["Cambio", "Diego Herrera", "Seguro de Vida", "Recurso descargado", "PDF: 5 Claves para Proteger tu Patrimonio", "Página de Recursos", "Sistema", "12 may, 09:55 PM"],
  ["Cambio", "Fernanda Castro", "Planificación Patrimonial", "Video reproducido", "Video: ¿Qué es un Trust?", "YouTube", "Sistema", "12 may, 06:14 PM"],
  ["Cambio", "Andrés Torres", "Retirement Planning", "Formulario enviado", "Formulario: Consulta Gratuita", "Landing Page", "Sistema", "12 may, 03:32 PM"],
  ["Nota", "Isabella Muñoz", "Estate Planning", "Etiqueta aplicada", "Interesado en Trust", "Diana Bermeo", "Diana Bermeo", "12 may, 01:08 PM"],
  ["Llamada", "Valentina Rojas", "Trusts", "Llamada realizada", "Duración: 8m 12s", "María López", "María López", "11 may, 05:40 PM"],
  ["Email", "Fernando Ruiz", "Life Insurance", "Email enviado", "Asunto: Tu consulta patrimonial", "Secuencia Bienvenida", "Andrés Vargas", "11 may, 02:15 PM"],
];

export const DEMO_ACTIVITIES: Omit<Activity, "id">[] = ACTIVITY_SEEDS.map(
  ([kind, contactName, contactRole, title, detail, source, user, timeLabel], i) => ({
    kind,
    contactName,
    contactRole,
    title,
    detail,
    source,
    user,
    timeLabel,
    order: i,
  })
);

// ── Empresas ───────────────────────────────────────────────────────────────

type AccountSeed = [
  string, // nombre
  string, // industria
  string, // tipo legal
  string, // ubicación
  number, // empleados
  number, // contactos asociados
  CrmAccount["status"],
  string[], // productos principales
  number, // primas anuales
  number, // pólizas activas
  string, // asesor
  string, // última actividad
  string, // hace…
];

const ACCOUNT_SEEDS: AccountSeed[] = [
  ["González Construction LLC", "Construcción", "LLC", "Miami, FL", 42, 8, "Cliente", ["Key Person", "Buy-Sell"], 2850000, 3, "Andrés Vargas", "Llamada", "Hoy"],
  ["Martínez Medical Group", "Salud", "Group", "Coral Gables, FL", 68, 12, "Cliente", ["Key Person", "Executive Bonus"], 3450000, 4, "María López", "Envío de propuesta", "Ayer"],
  ["Rodríguez Holdings LLC", "Inversiones", "Holdings", "Doral, FL", 15, 5, "Prospecto", ["Estate Planning", "Retirement"], 1200000, 2, "Javier Rodríguez", "Reunión", "20 may"],
  ["Herrera Imports Inc.", "Importación / Distribución", "Inc.", "Pembroke Pines, FL", 30, 6, "Cliente", ["Buy-Sell", "Key Person"], 1950000, 3, "Camila Torres", "Llamada", "19 may"],
  ["Méndez Accounting Services", "Servicios financieros", "Services", "Weston, FL", 12, 4, "Cliente", ["Life Insurance", "Disability"], 680000, 2, "Andrés Vargas", "Envío de documentos", "18 may"],
  ["López Real Estate Group", "Bienes raíces", "Group", "Aventura, FL", 24, 7, "Prospecto", ["Key Person", "Estate Planning"], 1100000, 2, "María López", "Reunión", "17 may"],
  ["Fernández Transport Corp.", "Transporte", "Corp.", "Miami Beach, FL", 56, 9, "Cliente", ["Buy-Sell", "Retirement"], 2150000, 4, "Javier Rodríguez", "Llamada", "16 may"],
  ["Ruiz Technology Solutions", "Tecnología", "Solutions", "Kendall, FL", 18, 5, "Sin actividad", ["Key Person"], 950000, 1, "Camila Torres", "Sin actividad", "30 abr"],
];

export const DEMO_ACCOUNTS: Omit<CrmAccount, "id">[] = ACCOUNT_SEEDS.map(
  ([name, industry, legalType, location, employees, contactsCount, status, products, annualPremium, policiesCount, advisor, lastActivity, lastActivityAt], i) => ({
    name,
    color: AVATAR_COLORS[i % AVATAR_COLORS.length],
    industry,
    legalType,
    location,
    employees,
    contactsCount,
    status,
    products,
    annualPremium,
    policiesCount,
    primaryContact: name.split(" ")[0] + " " + (name.split(" ")[1] ?? ""),
    advisor,
    lastActivity,
    lastActivityAt,
    owned: i % 3 === 0,
    order: i,
  })
);

// ── Familias ───────────────────────────────────────────────────────────────

type FamilySeed = [
  string, // apellido
  number, // miembros
  string, // contacto principal
  string, // teléfono
  string, // ubicación
  number, // pólizas activas
  number, // valor anual
  string, // próxima renovación
  number, // días para renovar
  string, // asesor
];

const FAMILY_SEEDS: FamilySeed[] = [
  ["González", 5, "Carlos González", "(305) 555-2345", "Miami, FL", 4, 3250000, "15 jul 2027", 58, "Andrés Vargas"],
  ["Martínez", 4, "Laura Martínez", "(786) 555-9876", "Coral Gables, FL", 3, 2850000, "10 ago 2027", 84, "María López"],
  ["Rodríguez", 6, "Javier Rodríguez", "(305) 555-6677", "Doral, FL", 5, 4120000, "22 sep 2027", 127, "Javier Rodríguez"],
  ["Herrera", 3, "Sofía Herrera", "(786) 555-1122", "Pembroke Pines, FL", 2, 1750000, "05 jun 2027", 18, "Camila Torres"],
  ["Méndez", 4, "Ricardo Méndez", "(305) 555-4433", "Weston, FL", 3, 2650000, "18 jul 2027", 61, "Andrés Vargas"],
  ["López", 5, "Ana Beatriz López", "(786) 555-7788", "Aventura, FL", 4, 3100000, "12 ago 2027", 86, "María López"],
  ["Vargas", 3, "Andrés Vargas", "(305) 555-5566", "Miami Beach, FL", 2, 1280000, "30 may 2027", 12, "Andrés Vargas"],
  ["Cruz", 7, "Patricia Cruz", "(786) 555-8899", "Kendall, FL", 6, 4560000, "28 oct 2027", 163, "Javier Rodríguez"],
];

export const DEMO_FAMILIES: Omit<CrmFamily, "id">[] = FAMILY_SEEDS.map(
  ([surname, members, primaryContact, primaryPhone, location, activePolicies, annualValue, nextRenewal, daysToRenewal, advisor], i) => ({
    name: `Familia ${surname}`,
    color: AVATAR_COLORS[i % AVATAR_COLORS.length],
    members,
    primaryContact,
    primaryEmail: `${surname.toLowerCase()}.family@email.com`,
    primaryPhone,
    location,
    activePolicies,
    annualValue,
    nextRenewal,
    daysToRenewal,
    status: "Activa",
    advisor,
    owned: i % 3 === 0,
    order: i,
  })
);

// ── Catálogos ──────────────────────────────────────────────────────────────

export const DEMO_TAGS: Omit<CrmTag, "id">[] = [
  { name: "Cliente actual", tone: "emerald", entity: "Contacto", category: "Cliente", usedIn: ["C", "E", "N"], records: 438, createdBy: "Diana Bermeo", createdAt: "12 abr 2027", active: true, order: 0 },
  { name: "Prospecto caliente", tone: "rose", entity: "Contacto", category: "Prospecto", usedIn: ["C", "E"], records: 156, createdBy: "Alejandro V.", createdAt: "15 abr 2027", active: true, order: 1 },
  { name: "Seguro de vida", tone: "blue", entity: "Contacto", category: "Producto", usedIn: ["C", "N"], records: 221, createdBy: "Javier Ramírez", createdAt: "10 abr 2027", active: true, order: 2 },
  { name: "Seguro de auto", tone: "blue", entity: "Contacto", category: "Producto", usedIn: ["C", "E", "N"], records: 312, createdBy: "María González", createdAt: "11 abr 2027", active: true, order: 3 },
  { name: "Empresa cliente", tone: "emerald", entity: "Empresa", category: "Cliente", usedIn: ["E"], records: 85, createdBy: "Diana Bermeo", createdAt: "09 abr 2027", active: true, order: 4 },
  { name: "Socio estratégico", tone: "violet", entity: "Empresa", category: "Alianza", usedIn: ["E"], records: 24, createdBy: "Roberto Díaz", createdAt: "08 abr 2027", active: true, order: 5 },
  { name: "Cita agendada", tone: "amber", entity: "Contacto", category: "Interacción", usedIn: ["C"], records: 67, createdBy: "Ana López", createdAt: "07 abr 2027", active: true, order: 6 },
  { name: "Reunión pendiente", tone: "amber", entity: "Contacto", category: "Interacción", usedIn: ["C"], records: 43, createdBy: "Javier Ramírez", createdAt: "06 abr 2027", active: true, order: 7 },
  { name: "Renovación próxima", tone: "rose", entity: "Contacto", category: "Seguimiento", usedIn: ["C"], records: 89, createdBy: "María González", createdAt: "05 abr 2027", active: true, order: 8 },
  { name: "Referido", tone: "violet", entity: "Contacto", category: "Origen", usedIn: ["C"], records: 31, createdBy: "Alejandro V.", createdAt: "04 abr 2027", active: true, order: 9 },
];

export const DEMO_SEGMENTS: Omit<CrmSegment, "id">[] = [
  { name: "Clientes actuales", description: "Todos los clientes con pólizas activas.", entity: "Contacto", icon: "Users", contacts: 1532, accounts: 0, createdBy: "Diana Bermeo", createdAt: "12 abr 2027", active: true, order: 0 },
  { name: "Prospectos calientes", description: "Contactos que han mostrado interés reciente en nuestros productos.", entity: "Contacto", icon: "Flame", contacts: 245, accounts: 0, createdBy: "Alejandro V.", createdAt: "10 abr 2027", active: true, order: 1 },
  { name: "Empresas medianas", description: "Empresas con 50 a 200 empleados.", entity: "Empresa", icon: "Building2", contacts: 0, accounts: 186, createdBy: "Javier Ramírez", createdAt: "09 abr 2027", active: true, order: 2 },
  { name: "Renovaciones próximas", description: "Clientes con pólizas que vencen en los próximos 30 días.", entity: "Contacto", icon: "CalendarClock", contacts: 321, accounts: 0, createdBy: "María González", createdAt: "08 abr 2027", active: true, order: 3 },
  { name: "Referidos del mes", description: "Contactos referidos en el último mes.", entity: "Contacto", icon: "UserPlus", contacts: 156, accounts: 0, createdBy: "Ana López", createdAt: "07 abr 2027", active: true, order: 4 },
  { name: "Empresas grandes", description: "Empresas con más de 200 empleados.", entity: "Empresa", icon: "Building2", contacts: 0, accounts: 92, createdBy: "Roberto Díaz", createdAt: "05 abr 2027", active: true, order: 5 },
  { name: "No contactados 90 días", description: "Contactos sin interacción en los últimos 90 días.", entity: "Contacto", icon: "UserMinus", contacts: 892, accounts: 0, createdBy: "Javier Ramírez", createdAt: "03 abr 2027", active: false, order: 6 },
  { name: "Clientes de auto", description: "Clientes con pólizas de seguro de auto.", entity: "Contacto", icon: "Car", contacts: 1245, accounts: 0, createdBy: "Diana Bermeo", createdAt: "01 abr 2027", active: true, order: 7 },
];

export const DEMO_AUTOMATIONS: Omit<CrmAutomation, "id">[] = [
  { name: "Bienvenida a nuevo contacto", description: "Envía un email de bienvenida cuando se crea un nuevo contacto.", kind: "Comunicación", kindTone: "violet", trigger: "Nuevo contacto", triggerDetail: "(creado)", steps: [{ icon: "Mail", delay: "1d" }, { icon: "Mail" }, { icon: "CheckCircle2" }], active: true, performance: 124, performanceLabel: "Contactos", createdBy: "Diana Bermeo", createdAt: "12 abr 2027", order: 0 },
  { name: "Recordatorio de reunión", description: "Envía un recordatorio 24h antes de una reunión programada.", kind: "Recordatorio", kindTone: "blue", trigger: "Reunión programada", triggerDetail: "(24h antes)", steps: [{ icon: "Mail", delay: "24h" }, { icon: "CheckCircle2" }], active: true, performance: 98, performanceLabel: "Reuniones", createdBy: "Javier Ramírez", createdAt: "10 abr 2027", order: 1 },
  { name: "Seguimiento de propuesta", description: "Crea una tarea de seguimiento 3 días después de enviar una propuesta.", kind: "Tarea", kindTone: "amber", trigger: "Propuesta enviada", triggerDetail: "(3 días después)", steps: [{ icon: "CheckSquare", delay: "3d" }, { icon: "CheckCircle2" }], active: true, performance: 156, performanceLabel: "Tareas", createdBy: "María González", createdAt: "08 abr 2027", order: 2 },
  { name: "Asignar etiqueta por interés", description: "Asigna automáticamente una etiqueta según el interés seleccionado.", kind: "Organización", kindTone: "emerald", trigger: "Campo actualizado", triggerDetail: "(Interés)", steps: [{ icon: "Tag" }, { icon: "CheckCircle2" }], active: true, performance: 342, performanceLabel: "Contactos", createdBy: "Ana López", createdAt: "05 abr 2027", order: 3 },
  { name: "Cliente VIP", description: "Marca como VIP a los clientes con más de 3 pólizas activas.", kind: "Actualización", kindTone: "blue", trigger: "Pólizas activas", triggerDetail: "(más de 3)", steps: [{ icon: "Star" }, { icon: "CheckCircle2" }], active: true, performance: 64, performanceLabel: "Contactos", createdBy: "Alejandro V.", createdAt: "01 abr 2027", order: 4 },
  { name: "Póliza por vencer", description: "Notifica al asesor y al cliente cuando una póliza está por vencer.", kind: "Alerta", kindTone: "rose", trigger: "Póliza por vencer", triggerDetail: "(15 días antes)", steps: [{ icon: "Mail" }, { icon: "Bell" }, { icon: "CheckCircle2" }], active: true, performance: 87, performanceLabel: "Notificaciones", createdBy: "Javier Ramírez", createdAt: "28 mar 2027", order: 5 },
  { name: "Reasignar contacto inactivo", description: "Reasigna contactos inactivos a otro asesor después de 30 días.", kind: "Asignación", kindTone: "neutral", trigger: "Contacto inactivo", triggerDetail: "(30 días)", steps: [{ icon: "Users" }, { icon: "CheckCircle2" }], active: false, performance: 12, performanceLabel: "Contactos", createdBy: "Roberto Díaz", createdAt: "25 mar 2027", order: 6 },
  { name: "Seguir contenido descargado", description: "Envía información relacionada al contenido que descargó el contacto.", kind: "Comunicación", kindTone: "violet", trigger: "Contenido descargado", triggerDetail: "(cualquier contenido)", steps: [{ icon: "Mail", delay: "2d" }, { icon: "CheckCircle2" }], active: true, performance: 71, performanceLabel: "Contactos", createdBy: "María González", createdAt: "22 mar 2027", order: 7 },
];
