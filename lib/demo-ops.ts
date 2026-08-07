/**
 * Datos de demostración del módulo Operaciones.
 *
 * Solo se siembran en la empresa del super administrador. Una empresa nueva
 * arranca vacía y muestra los estados vacíos de cada página.
 *
 * Se importa dinámicamente desde `lib/services/demo-seed.ts`, así que no entra
 * en el bundle de las páginas.
 */

import { localIso } from "@/lib/calendar-utils";
import type {
  ChecklistPhase,
  Implementation,
  OpsDocument,
  OpsEvent,
  OpsMember,
  OpsRenewal,
  OpsReview,
  OpsSignature,
  OpsSpecialCase,
  OpsTask,
  SavedReport,
  SlaPolicy,
} from "@/lib/ops-types";

/**
 * Fecha base de los datos de demostración.
 *
 * Todo lo fechado cuelga de aquí en vez de llevar fechas fijas, así el
 * calendario y los vencimientos siguen teniendo sentido con el paso del
 * tiempo: "hoy" siempre es hoy.
 */
const HOY = new Date();

/**
 * `YYYY-MM-DD` a `n` días de hoy (negativo para el pasado).
 *
 * Usa la fecha **local**: con `toISOString()` una tarde en un huso al oeste de
 * Greenwich se guardaría con el día siguiente y el evento caería en la casilla
 * equivocada del calendario.
 */
function iso(offsetDays: number): string {
  const d = new Date(HOY);
  d.setDate(d.getDate() + offsetDays);
  return localIso(d);
}

/** Etiqueta corta que se muestra en las tarjetas: "Hoy", "Mañana", "23 may". */
function label(offsetDays: number): string {
  if (offsetDays === 0) return "Hoy";
  if (offsetDays === 1) return "Mañana";
  if (offsetDays === -1) return "Ayer";
  const d = new Date(HOY);
  d.setDate(d.getDate() + offsetDays);
  return d.toLocaleDateString("es", { day: "numeric", month: "short" });
}

// ── Implementaciones ───────────────────────────────────────────────────────

/**
 * Las cuatro fases estándar de una implementación. Se generan a partir de
 * cuántos pasos van completados, de modo que el progreso de cada fase y el de
 * la implementación siempre cuadran entre sí.
 */
function buildPhases(owner: string, secondOwner: string, done: number): ChecklistPhase[] {
  const plantilla: [string, string[]][] = [
    ["Diagnóstico y Planeación", ["Reunión de diagnóstico", "Recopilar información personal y financiera", "Definir objetivos y necesidades"]],
    ["Diseño de Estrategia", ["Análisis financiero y de riesgos", "Diseñar estrategia y soluciones", "Presentación de propuesta", "Ajustes a la propuesta"]],
    ["Implementación", ["Recibir aplicación firmada", "Revisión y envío a aseguradora", "Underwriting", "Emisión de póliza"]],
    ["Entrega y Seguimiento", ["Entrega de póliza y documentos", "Explicación y capacitación al cliente", "Programar revisión anual"]],
  ];

  let n = 0;
  return plantilla.map(([title, steps], phaseIndex) => ({
    id: `fase-${phaseIndex + 1}`,
    index: phaseIndex + 1,
    title,
    steps: steps.map((stepTitle, stepIndex) => {
      n += 1;
      const status = n <= done ? "Completado" : n === done + 1 ? "En proceso" : "Pendiente";
      const diasDesdeInicio = n * 2 - 14;
      return {
        code: `${phaseIndex + 1}.${stepIndex + 1}`,
        title: stepTitle,
        // Los pasos con la aseguradora no los lleva el asesor.
        owner: stepTitle.includes("aseguradora") || stepTitle === "Underwriting" || stepTitle.includes("Emisión") ? "Aseguradora" : stepIndex % 2 === 0 ? owner : secondOwner,
        status: status as ChecklistPhase["steps"][number]["status"],
        dueDate: status === "Pendiente" ? "" : label(diasDesdeInicio),
        overdue: status === "En proceso" && diasDesdeInicio < 0,
      };
    }),
  }));
}

type ImplSeed = [
  string, // código
  string, // proceso
  string, // cliente
  string, // responsable
  Implementation["stage"],
  Implementation["priority"],
  number, // pasos completados de 14
  string, // en espera de
  number, // días desde el inicio
];

const IMPL_SEEDS: ImplSeed[] = [
  ["IMP-2024-018", "Protección Familiar", "Familia Rodríguez", "Ana López", "por-hacer", "Alta", 0, "", -3],
  ["IMP-2024-019", "Plan Patrimonial", "Familia Gómez", "Luis Navarro", "por-hacer", "Media", 0, "", -2],
  ["IMP-2024-020", "Educación de Hijos", "Familia Martínez", "María Pérez", "por-hacer", "Media", 0, "", -1],
  ["IMP-2024-012", "Retiro Inteligente", "Familia Castillo", "Diego Martínez", "en-proceso", "Alta", 9, "", -21],
  ["IMP-2024-013", "Protección Patrimonial", "Empresa NovaTech", "Ana López", "en-proceso", "Media", 6, "", -18],
  ["IMP-2024-014", "Protección Familiar", "Empresa Andina S.A.", "Luis Navarro", "en-proceso", "Media", 4, "", -15],
  ["IMP-2024-008", "Plan Patrimonial", "Familia Pérez", "María Pérez", "en-espera", "Alta", 7, "Cliente", -26],
  ["IMP-2024-009", "Protección Patrimonial", "Empresa Constructora", "Diego Martínez", "en-espera", "Media", 3, "Documentos", -24],
  ["IMP-2024-010", "Protección Familiar", "Familia Torres", "Ana López", "en-espera", "Baja", 2, "Terceros", -22],
  ["IMP-2024-005", "Retiro Inteligente", "Familia Ramírez", "Luis Navarro", "revision", "Media", 11, "", -32],
  ["IMP-2024-006", "Plan Patrimonial", "Familia Ortega", "María Pérez", "revision", "Alta", 12, "", -30],
  ["IMP-2024-007", "Protección Familiar", "Familia Suárez", "Ana López", "revision", "Media", 11, "", -28],
  ["IMP-2024-001", "Protección Familiar", "Familia López", "Ana López", "completado", "Media", 14, "", -45],
  ["IMP-2024-002", "Plan Patrimonial", "Familia Vargas", "Luis Navarro", "completado", "Alta", 14, "", -42],
  ["IMP-2024-003", "Retiro Inteligente", "Familia Benavides", "Diego Martínez", "completado", "Media", 14, "", -40],
];

const SEGUNDO_RESPONSABLE: Record<string, string> = {
  "Ana López": "Luis Navarro",
  "Luis Navarro": "Ana López",
  "María Pérez": "Diego Martínez",
  "Diego Martínez": "María Pérez",
};

export const DEMO_IMPLEMENTATIONS: Omit<Implementation, "id">[] = IMPL_SEEDS.map(
  ([code, process, client, owner, stage, priority, done, waitingOn, startOffset], i) => {
    const phases = buildPhases(owner, SEGUNDO_RESPONSABLE[owner] ?? "María Pérez", done);
    const total = phases.reduce((sum, f) => sum + f.steps.length, 0);
    const actual = phases.flatMap((f) => f.steps).find((s) => s.status === "En proceso");
    return {
      code,
      process,
      client,
      owner,
      stage,
      priority,
      progress: Math.round((done / total) * 100),
      currentStep: Math.min(done + 1, total),
      totalSteps: total,
      currentStepTitle: actual?.title ?? "Proceso completado",
      waitingOn,
      startDate: label(startOffset),
      estimatedEndDate: label(startOffset + 40),
      completedAt: stage === "completado" ? label(startOffset + 38) : "",
      nextSteps:
        stage === "completado"
          ? []
          : ["Esperar feedback del cliente", "Ajustes a la propuesta", "Enviar propuesta final"],
      pendingDocuments:
        stage === "completado"
          ? []
          : [
              { title: "Estados financieros", detail: "Pendiente por cliente" },
              { title: "Formulario de salud", detail: "Pendiente por cliente" },
            ],
      phases,
      order: i,
    };
  }
);

// ── Tareas ─────────────────────────────────────────────────────────────────

type TaskSeed = [
  string, // título
  string, // proceso
  string, // cliente
  string, // responsable
  OpsTask["stage"],
  OpsTask["priority"],
  number, // días para vencer
  number, // subtareas hechas
  number, // subtareas totales
  string, // hora
  string, // tipo
];

const TASK_SEEDS: TaskSeed[] = [
  ["Recibir firma de aplicación", "Protección Familiar", "Familia Rodríguez", "Ana López", "por-hacer", "Alta", 0, 0, 0, "09:00", "Llamada"],
  ["Solicitar documento faltante", "Retiro Inteligente", "Familia Pérez", "Luis Navarro", "por-hacer", "Alta", 0, 0, 0, "11:00", "Email"],
  ["Enviar propuesta final", "Plan Patrimonial", "Familia Gómez", "Ana López", "por-hacer", "Media", 1, 0, 0, "13:30", "Revisión"],
  ["Programar entrega de póliza", "Protección Familiar", "Familia Castillo", "Diego Martínez", "por-hacer", "Media", 1, 0, 0, "15:00", "Reunión"],
  // Dos tareas abiertas ya vencidas: sin ellas el estado "atrasada" —y el
  // aviso en ámbar que lo acompaña— no se vería nunca en la demostración.
  ["Validar datos financieros", "Retiro Inteligente", "Familia Suárez", "María Pérez", "por-hacer", "Alta", -2, 0, 0, "16:30", "Revisión"],
  ["Reenviar solicitud a aseguradora", "Plan Patrimonial", "Familia Ramírez", "Luis Navarro", "en-proceso", "Alta", -1, 1, 3, "09:15", "Email"],
  ["Revisión de estrategia", "Protección Patrimonial", "Empresa NovaTech", "Ana López", "en-proceso", "Alta", 5, 3, 5, "10:00", "Revisión"],
  ["Preparar documentos Trust", "Plan Patrimonial", "Familia Ortega", "Luis Navarro", "en-proceso", "Media", 6, 2, 4, "11:30", "Email"],
  ["Underwriting en proceso", "Plan Patrimonial", "Familia López", "María Pérez", "en-proceso", "Media", 8, 4, 6, "09:30", "Revisión"],
  ["Análisis financiero complementario", "Retiro Inteligente", "Familia Martínez", "Diego Martínez", "en-proceso", "Media", 9, 2, 5, "14:00", "Revisión"],
  ["Cliente pendiente de firma", "Educación de Hijos", "Familia Vargas", "Ana López", "en-espera", "Alta", 5, 0, 0, "10:30", "Email"],
  ["Información del cliente", "Protección Familiar", "Familia Torres", "Luis Navarro", "en-espera", "Media", 6, 0, 0, "12:00", "Llamada"],
  ["Respuesta de aseguradora", "Plan Patrimonial", "Familia Ramírez", "María Pérez", "en-espera", "Media", 8, 0, 0, "15:30", "Email"],
  ["Confirmación de beneficiarios", "Retiro Inteligente", "Familia Suárez", "Diego Martínez", "en-espera", "Baja", 7, 0, 0, "16:00", "Llamada"],
  ["Reunión de diagnóstico", "Protección Familiar", "Familia Rodríguez", "Ana López", "completada", "Media", -1, 3, 3, "10:00", "Reunión"],
  ["Recopilar información personal", "Protección Patrimonial", "Empresa NovaTech", "Luis Navarro", "completada", "Media", -2, 4, 4, "14:00", "Email"],
  ["Análisis financiero inicial", "Retiro Inteligente", "Familia Castillo", "María Pérez", "completada", "Alta", -3, 5, 5, "11:45", "Revisión"],
  ["Presentar propuesta", "Plan Patrimonial", "Familia Gómez", "Diego Martínez", "completada", "Media", -4, 3, 3, "16:20", "Reunión"],
  ["Enviar estado de cuenta", "Retiro Inteligente", "Familia Benavides", "María Pérez", "delegada", "Media", 5, 0, 0, "09:00", "Email"],
  ["Preparar presentación", "Plan Patrimonial", "Familia Vargas", "Luis Navarro", "delegada", "Media", 6, 1, 3, "10:00", "Revisión"],
  ["Actualizar información legal", "Protección Patrimonial", "Empresa Constructora", "Sofía Castillo", "delegada", "Alta", 7, 0, 2, "11:00", "Revisión"],
  ["Dar seguimiento a cliente", "Protección Familiar", "Familia Pérez", "Ana López", "delegada", "Media", 5, 0, 0, "12:30", "Llamada"],
  ["Revisar documentos recibidos", "Retiro Inteligente", "Familia Ortega", "Carlos Bermeo", "delegada", "Baja", 6, 0, 0, "17:00", "Revisión"],
];

export const DEMO_TASKS: Omit<OpsTask, "id">[] = TASK_SEEDS.map(
  ([title, process, client, owner, stage, priority, due, done, total, time, kind], i) => ({
    title,
    process,
    client,
    owner: stage === "delegada" ? "Carlos Bermeo" : owner,
    delegatedTo: stage === "delegada" ? owner : "",
    stage,
    priority,
    dueLabel: label(due),
    dueDate: iso(due),
    overdue: due < 0 && stage !== "completada",
    subtasksDone: done,
    subtasksTotal: total,
    time,
    kind,
    completedNote: stage === "completada" ? `Completada por ${owner}` : "",
    order: i,
  })
);

// ── Bandejas ───────────────────────────────────────────────────────────────

const BASE_INBOX = (i: number, due: number) => ({
  dueDate: iso(due),
  dueLabel: label(due),
  overdue: due < 0,
  order: i,
});

export const DEMO_REVIEWS: Omit<OpsReview, "id">[] = [
  ["Revisión de documentos", "Familia Rodríguez", "Protección Familiar", "Ana López", "En gestión", "Alta", "Documentos", 60, 1],
  ["Revisión financiera", "Familia Castillo", "Retiro Inteligente", "Diego Martínez", "Pendiente", "Alta", "Financiera", 20, 0],
  ["Revisión de estrategia", "Empresa NovaTech", "Protección Patrimonial", "Luis Navarro", "En gestión", "Media", "Estrategia", 75, 3],
  ["Validación de propuesta", "Familia Ortega", "Plan Patrimonial", "María Pérez", "En espera", "Media", "Propuesta", 40, 4],
  ["Revisión de SLA", "Familia Pérez", "Plan Patrimonial", "Ana López", "Pendiente", "Baja", "Cumplimiento", 10, 6],
  ["Revisión anual de póliza", "Familia López", "Revisión Anual", "Luis Navarro", "Resuelto", "Media", "Anual", 100, -2],
].map(([title, client, process, owner, status, priority, kind, progress, due], i) => ({
  title: title as string,
  client: client as string,
  process: process as string,
  owner: owner as string,
  status: status as OpsReview["status"],
  priority: priority as OpsReview["priority"],
  kind: kind as string,
  progress: progress as number,
  ...BASE_INBOX(i, due as number),
}));

export const DEMO_DOCUMENTS: Omit<OpsDocument, "id">[] = [
  ["Estados financieros", "Familia Pérez", "Plan Patrimonial", "María Pérez", "En espera", "Alta", "Financiero", "Cliente", -2, 0],
  ["Formulario de salud", "Familia Castillo", "Retiro Inteligente", "Diego Martínez", "En espera", "Alta", "Médico", "Cliente", 0, 1],
  ["Acta de nacimiento", "Familia Martínez", "Educación de Hijos", "Ana López", "Pendiente", "Media", "Legal", "Cliente", 1, 2],
  ["Escritura de propiedad", "Empresa Constructora", "Protección Patrimonial", "Luis Navarro", "En espera", "Media", "Legal", "Terceros", 3, 3],
  ["Declaración de impuestos", "Familia Torres", "Protección Familiar", "Ana López", "Pendiente", "Media", "Financiero", "Cliente", 4, 4],
  ["Identificación oficial", "Familia Gómez", "Plan Patrimonial", "María Pérez", "Pendiente", "Baja", "Identidad", "Cliente", 5, 5],
  ["Reporte médico ampliado", "Familia Suárez", "Retiro Inteligente", "Diego Martínez", "En espera", "Alta", "Médico", "Aseguradora", 2, 6],
  ["Comprobante de domicilio", "Familia Ramírez", "Protección Familiar", "Luis Navarro", "Completado", "Baja", "Identidad", "Cliente", -4, 7],
].map(([title, client, process, owner, status, priority, kind, waitingOn, due], i) => ({
  title: title as string,
  client: client as string,
  process: process as string,
  owner: owner as string,
  status: status as OpsDocument["status"],
  priority: priority as OpsDocument["priority"],
  kind: kind as string,
  waitingOn: waitingOn as string,
  requestedAt: label((due as number) - 7),
  ...BASE_INBOX(i, due as number),
}));

export const DEMO_SIGNATURES: Omit<OpsSignature, "id">[] = [
  ["Aplicación de seguro", "Familia Rodríguez", "Protección Familiar", "Ana López", "En espera", "Alta", "DocuSign", 2, -1, 0],
  ["Acuerdo de trust", "Familia Pérez", "Plan Patrimonial", "María Pérez", "En espera", "Alta", "DocuSign", 1, 0, 1],
  ["Formulario de beneficiarios", "Familia Vargas", "Educación de Hijos", "Luis Navarro", "Pendiente", "Media", "Email", 0, 1, 2],
  ["Autorización médica", "Familia Castillo", "Retiro Inteligente", "Diego Martínez", "En espera", "Media", "DocuSign", 1, 2, 3],
  ["Contrato corporativo", "Empresa NovaTech", "Protección Patrimonial", "Ana López", "Pendiente", "Media", "Presencial", 0, 4, 4],
  ["Anexo de cobertura", "Familia Torres", "Protección Familiar", "Luis Navarro", "Pendiente", "Baja", "Email", 0, 5, 5],
  ["Renovación firmada", "Familia López", "Revisión Anual", "María Pérez", "Completado", "Media", "DocuSign", 1, -3, 6],
].map(([title, client, process, owner, status, priority, channel, reminders, due], i) => ({
  title: title as string,
  client: client as string,
  process: process as string,
  owner: owner as string,
  status: status as OpsSignature["status"],
  priority: priority as OpsSignature["priority"],
  channel: channel as string,
  remindersSent: reminders as number,
  sentAt: label((due as number) - 5),
  ...BASE_INBOX(i, due as number),
}));

export const DEMO_RENEWALS: Omit<OpsRenewal, "id">[] = [
  ["Renovación de póliza de vida", "Familia González", "Protección Familiar", "Ana López", "En gestión", "Alta", "POL-2021-118", 3_250_000, 12],
  ["Renovación patrimonial", "Familia Martínez", "Plan Patrimonial", "María Pérez", "En gestión", "Alta", "POL-2020-076", 2_850_000, 18],
  ["Renovación de retiro", "Familia Rodríguez", "Retiro Inteligente", "Luis Navarro", "Pendiente", "Media", "POL-2019-244", 4_120_000, 27],
  ["Renovación corporativa", "Empresa NovaTech", "Protección Patrimonial", "Diego Martínez", "Pendiente", "Media", "POL-2022-031", 1_750_000, 45],
  ["Renovación educativa", "Familia Herrera", "Educación de Hijos", "Ana López", "Pendiente", "Media", "POL-2021-402", 2_650_000, 58],
  ["Renovación anual", "Familia López", "Revisión Anual", "María Pérez", "Pendiente", "Baja", "POL-2020-511", 3_100_000, 74],
  ["Renovación patrimonial II", "Familia Cruz", "Plan Patrimonial", "Luis Navarro", "Pendiente", "Baja", "POL-2019-093", 1_280_000, 88],
  ["Renovación vencida", "Familia Suárez", "Protección Familiar", "Diego Martínez", "En espera", "Alta", "POL-2021-777", 980_000, -5],
].map(([title, client, process, owner, status, priority, policy, premium, days], i) => ({
  title: title as string,
  client: client as string,
  process: process as string,
  owner: owner as string,
  status: status as OpsRenewal["status"],
  priority: priority as OpsRenewal["priority"],
  policy: policy as string,
  annualPremium: premium as number,
  daysToRenewal: days as number,
  ...BASE_INBOX(i, days as number),
}));

export const DEMO_SPECIAL_CASES: Omit<OpsSpecialCase, "id">[] = [
  ["Underwriting complejo", "Familia Castillo", "Protección Familiar", "Sofía Castillo", "En gestión", "Alta", "Underwriting", 70, 9, "Caso con antecedentes médicos delicados. Requiere análisis adicional por parte del equipo de underwriting."],
  ["Caso médico delicado", "Familia López", "Protección Familiar", "Diego Martínez", "En espera", "Alta", "Salud médica", 40, 13, "Pendiente de valoración por especialista externo antes de continuar."],
  ["Estructura patrimonial", "Familia Rodríguez", "Plan Patrimonial", "María Pérez", "En gestión", "Media", "Patrimonial", 60, 15, "Diseño de estructura con trust irrevocable y varias jurisdicciones."],
  ["Reunificación de pólizas", "Familia Gómez", "Protección Patrimonial", "Carlos Bermeo", "Resuelto", "Media", "Corporativo", 100, 5, "Consolidación de cuatro pólizas en un único contrato corporativo."],
  ["Cambio de beneficiarios", "Familia Suárez", "Protección Familiar", "Ana López", "En espera", "Alta", "Legal", 50, 11, "Requiere consentimiento de dos partes y validación legal."],
  ["Riqueza internacional", "Familia Torres", "Plan Patrimonial", "Luis Navarro", "En gestión", "Media", "Internacional", 30, 18, "Activos en tres países; se coordina con asesoría fiscal externa."],
  ["Siniestro en trámite", "Familia Ramírez", "Protección Familiar", "María Pérez", "En gestión", "Alta", "Siniestros", 40, 13, "Reclamación en curso, a la espera del dictamen de la aseguradora."],
  ["Cumplimiento regulatorio", "Plan Vida S.A.", "Protección Patrimonial", "Carlos Bermeo", "En espera", "Media", "Legal", 80, 21, "Adecuación a la nueva normativa antes del cierre del trimestre."],
].map(([title, client, process, owner, status, priority, kind, progress, due, summary], i) => ({
  title: title as string,
  client: client as string,
  process: process as string,
  owner: owner as string,
  status: status as OpsSpecialCase["status"],
  priority: priority as OpsSpecialCase["priority"],
  kind: kind as string,
  progress: progress as number,
  summary: summary as string,
  timeline: [
    { date: label((due as number) - 9), label: "Documentación enviada", done: true },
    { date: label((due as number) - 6), label: "Reunión con especialista", done: true },
    { date: label(due as number), label: "Decisión pendiente", done: false },
  ],
  ...BASE_INBOX(i, due as number),
}));

// ── Calendario ─────────────────────────────────────────────────────────────

type EventSeed = [string, OpsEvent["kind"], number, string, number, string, string, string];

/**
 * Se reparten a lo largo de cinco semanas alrededor de hoy para que el mes
 * siempre se vea poblado, sea cual sea el día en que se abra.
 */
const EVENT_SEEDS: EventSeed[] = [
  ["Revisión de póliza", "Revisiones", -14, "10:00", 60, "Familia Rodríguez", "Ana López", "Sala 2"],
  ["Acta de nacimiento", "Documentos y Firmas", -14, "11:30", 30, "Familia Martínez", "Luis Navarro", ""],
  ["Renovación próxima", "Renovaciones", -13, "09:30", 45, "Familia González", "María Pérez", ""],
  ["Checklist - Vida", "Tareas y Checklists", -13, "14:00", 60, "Familia Pérez", "Diego Martínez", ""],
  ["Envío de documentos", "Documentos y Firmas", -12, "11:00", 30, "Familia Castillo", "Ana López", ""],
  ["Revisión financiera", "Revisiones", -12, "15:00", 90, "Familia Suárez", "Luis Navarro", "Sala 1"],
  ["Implementación", "Implementaciones", -7, "09:00", 120, "Familia López", "Ana López", "Oficina"],
  ["Capacitación equipo", "Capacitación", -7, "14:00", 90, "", "Carlos Bermeo", "Zoom"],
  ["Firma pendiente", "Documentos y Firmas", -6, "11:00", 30, "Familia Vargas", "María Pérez", ""],
  ["Seguimiento caso", "Casos Especiales", -6, "16:00", 45, "Familia Castillo", "Sofía Castillo", ""],
  ["Renovación vencida", "Renovaciones", -5, "09:30", 45, "Familia Suárez", "Diego Martínez", ""],
  ["Actualización docs.", "Documentos y Firmas", -5, "14:00", 30, "Empresa Constructora", "Luis Navarro", ""],
  ["Revisión de caso", "Casos Especiales", -4, "10:00", 60, "Familia Ramírez", "María Pérez", "Sala 1"],
  ["Llamada con cliente", "Tareas y Checklists", -4, "13:00", 30, "Familia Torres", "Ana López", ""],
  ["Checklist - Salud", "Tareas y Checklists", -3, "09:00", 60, "Familia Castillo", "Diego Martínez", ""],
  ["Envío de póliza", "Documentos y Firmas", -3, "15:00", 30, "Familia Gómez", "Luis Navarro", ""],
  ["Reunión interna de equipo", "Capacitación", 0, "09:00", 60, "", "Carlos Bermeo", "Sala 2"],
  ["Presentación a cliente", "Implementaciones", 0, "11:00", 90, "Familia Gómez", "Ana López", "Sala 1"],
  ["Capacitación de producto", "Capacitación", 0, "14:00", 120, "", "María Pérez", "Zoom"],
  ["Revisión de casos especiales", "Casos Especiales", 0, "16:00", 60, "Familia Castillo", "Sofía Castillo", "Sala 1"],
  ["Revisión de póliza", "Revisiones", 1, "10:00", 60, "Familia Rodríguez", "Ana López", "Sala 2"],
  ["Checklist - Vida", "Tareas y Checklists", 1, "14:00", 45, "Familia Pérez", "Diego Martínez", ""],
  ["Envío de documentos", "Documentos y Firmas", 2, "11:00", 30, "Familia Castillo", "Luis Navarro", ""],
  ["Implementación", "Implementaciones", 3, "09:00", 120, "Familia Ortega", "María Pérez", "Oficina"],
  ["Revisión de SLA", "Revisiones", 3, "14:30", 60, "", "Carlos Bermeo", "Sala 2"],
  ["Documento pendiente", "Documentos y Firmas", 4, "09:30", 30, "Familia Torres", "Ana López", ""],
  ["Firma electrónica", "Documentos y Firmas", 4, "15:00", 30, "Familia Vargas", "Luis Navarro", ""],
  ["Renovación próxima", "Renovaciones", 7, "09:30", 45, "Familia Martínez", "María Pérez", ""],
  ["Llamada de seguimiento", "Tareas y Checklists", 7, "14:00", 30, "Familia Benavides", "Diego Martínez", ""],
  ["Checklist - Auto", "Tareas y Checklists", 8, "10:00", 45, "Familia Herrera", "Ana López", ""],
  ["Caso especial", "Casos Especiales", 9, "16:00", 60, "Familia López", "Sofía Castillo", "Sala 1"],
  ["Capacitación equipo", "Capacitación", 11, "09:00", 90, "", "Carlos Bermeo", "Zoom"],
  ["Revisión de póliza", "Revisiones", 11, "14:30", 60, "Familia Cruz", "Luis Navarro", "Sala 2"],
  ["Renovación vencida", "Renovaciones", 14, "09:00", 45, "Familia Suárez", "Diego Martínez", ""],
  ["Seguimiento caso", "Casos Especiales", 14, "14:00", 45, "Familia Ramírez", "María Pérez", ""],
  ["Implementación", "Implementaciones", 18, "10:00", 120, "Familia Benavides", "Ana López", "Oficina"],
  ["Envío de documentos", "Documentos y Firmas", 18, "14:00", 30, "Familia Gómez", "Luis Navarro", ""],
];

export const DEMO_EVENTS: Omit<OpsEvent, "id">[] = EVENT_SEEDS.map(
  ([title, kind, offset, time, durationMin, client, owner, location], i) => ({
    title,
    kind,
    date: iso(offset),
    time,
    durationMin,
    client,
    owner,
    location,
    order: i,
  })
);

// ── Equipo ─────────────────────────────────────────────────────────────────

export const DEMO_TEAM: Omit<OpsMember, "id">[] = [
  ["OP-001", "Luis Navarro", "Director de Operaciones", "violet", "Operaciones", "Activo", "Hoy, 9:15 AM", 6, 10],
  ["OP-002", "María Pérez", "Gerente Senior", "violet", "Operaciones", "Activo", "Hoy, 8:42 AM", 7, 10],
  ["OP-003", "Diego Martínez", "Coordinador", "blue", "Implementaciones", "Activo", "Ayer, 4:30 PM", 9, 12],
  ["OP-004", "Sofía Castillo", "Coordinadora", "blue", "Renovaciones", "Activo", "Ayer, 3:22 PM", 4, 8],
  ["OP-005", "Ana López", "Especialista", "emerald", "Implementaciones", "Activo", "Hoy, 11:05 AM", 8, 10],
  ["OP-006", "Javier Torres", "Analista", "emerald", "Revisiones", "Activo", "Hoy, 10:12 AM", 5, 9],
  ["OP-007", "Carolina Gómez", "Analista", "emerald", "Documentos y Firmas", "Activo", "Ayer, 5:45 PM", 6, 9],
  ["OP-008", "Andrés Ramírez", "Asesor", "amber", "Casos Especiales", "Activo", "Hoy, 9:50 AM", 3, 7],
  ["OP-009", "Valeria Suárez", "Asesora", "amber", "Renovaciones", "Activo", "Ayer, 2:18 PM", 5, 8],
  ["OP-010", "Miguel Ángel Ruiz", "Soporte", "neutral", "Implementaciones", "Invitación pendiente", "—", 0, 0],
  ["OP-011", "Carlos Bermeo", "Fundador", "gold", "Operaciones", "Activo", "Hoy, 8:05 AM", 4, 6],
  ["OP-012", "Paula Andrade", "Soporte", "neutral", "Revisiones", "Invitación pendiente", "—", 0, 0],
].map(([code, name, role, roleTone, department, status, lastAccess, done, total], i) => ({
  code: code as string,
  name: name as string,
  role: role as string,
  roleTone: roleTone as OpsMember["roleTone"],
  department: department as string,
  email: `${(name as string).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z]+/g, ".")}@bermeo.com`,
  status: status as OpsMember["status"],
  lastAccess: lastAccess as string,
  tasksDone: done as number,
  tasksTotal: total as number,
  order: i,
}));

// ── Políticas de SLA ───────────────────────────────────────────────────────

export const DEMO_SLA_POLICIES: Omit<SlaPolicy, "id">[] = [
  { name: "Política de tiempos de respuesta", compliance: 90, description: "Responder a cualquier solicitud del cliente en menos de 4 horas hábiles.", order: 0 },
  { name: "Política de documentación", compliance: 93, description: "Todo documento recibido queda registrado y clasificado el mismo día.", order: 1 },
  { name: "Política de comunicación", compliance: 94, description: "El cliente recibe una actualización de su proceso al menos cada semana.", order: 2 },
  { name: "Política de calidad de datos", compliance: 95, description: "Los datos del cliente se validan antes de enviar cualquier propuesta.", order: 3 },
  { name: "Política de seguridad", compliance: 98, description: "La información sensible se comparte solo por canales cifrados.", order: 4 },
  { name: "Política de escalamiento", compliance: 88, description: "Todo caso detenido más de 72 horas se escala a un coordinador.", order: 5 },
];

// ── Reportes guardados ─────────────────────────────────────────────────────

export const DEMO_SAVED_REPORTS: Omit<SavedReport, "id">[] = [
  ["Resumen Ejecutivo Mensual", "Ejecutivo", "FileText", "#a78bfa", "Carlos Bermeo", -1],
  ["Desempeño por Asesor", "Desempeño", "Users", "#22c55e", "Luis Navarro", -1],
  ["SLA y Cumplimiento", "SLA", "ShieldCheck", "#3b82f6", "María Pérez", -2],
  ["Embudo de Procesos", "Embudo", "Filter", "#e0a836", "Carlos Bermeo", -3],
  ["Tiempos de Resolución", "Tiempos", "Clock", "#f472b6", "Diego Martínez", -7],
].map(([name, kind, icon, color, author, offset], i) => ({
  name: name as string,
  kind: kind as string,
  icon: icon as string,
  color: color as string,
  author: author as string,
  generatedAt: label(offset as number),
  order: i,
}));
