/**
 * Motor de cálculo de la Calculadora y el Comparador.
 *
 * Es el único sitio donde se calcula una prima. Las dos pantallas llaman a
 * `simular()`: dos motores distintos acabarían dando dos respuestas a la
 * misma pregunta, que es exactamente lo que no puede pasar cuando un asesor
 * enseña la cifra a un cliente.
 *
 * **El modelo está escrito a la vista y es una estimación, no una tarifa.**
 * Cada constante lleva su porqué. El día que lleguen las tarifas reales de la
 * aseguradora, se sustituyen aquí y las dos pantallas quedan al día sin
 * tocarlas. Mientras tanto, ambas pantallas muestran el aviso de que los
 * resultados son estimados y no constituyen una oferta vinculante.
 *
 * El cálculo va en tres pasos:
 *   1. Cuánto capital necesita la familia (necesidad).
 *   2. Qué parte de esa necesidad cubre el nivel elegido (suma asegurada).
 *   3. Cuánto cuesta al mes esa suma (prima).
 */

import { CLIENT_PROFILES, type ClientProfileId, type CoverageLevel, type Solution } from "@/lib/solution-types";

// ── 1. Necesidad de capital ────────────────────────────────────────────────

/**
 * Años de ingreso que el capital debe reemplazar.
 *
 * Diez años es la referencia habitual del sector para dejar a una familia
 * tiempo de reorganizarse sin bajar su nivel de vida.
 */
const ANIOS_DE_REEMPLAZO = 10;

/** Cada dependiente añade un 15% a la necesidad de capital. */
const PESO_POR_DEPENDIENTE = 0.15;

/** Edad de referencia del modelo: las tarifas están calibradas aquí. */
const EDAD_DE_REFERENCIA = 35;

// ── 2. Nivel de cobertura ──────────────────────────────────────────────────

/**
 * Qué parte de la necesidad calculada cubre cada nivel.
 *
 * No llegan al 100% ni siquiera en Alto: un plan que cubriera la necesidad
 * entera saldría de precio para la mayoría de las familias, y el resto se
 * compensa con el patrimonio que ya tienen.
 */
const PARTE_CUBIERTA: Record<CoverageLevel, number> = {
  Básico: 0.48,
  Medio: 0.72,
  Alto: 0.92,
};

// ── 3. Prima ───────────────────────────────────────────────────────────────

/**
 * Coste mensual por cada $1,000 de suma asegurada, a los 35 años y en un plan
 * de protección. Está en la banda de un seguro de vida temporal para una
 * persona sana de esa edad.
 */
const TASA_BASE_POR_MIL = 0.22;

/** Cada año por encima de 35 encarece un 3.5%; por debajo, abarata igual. */
const INCREMENTO_POR_ANIO = 0.035;

/** Topes del factor de edad, para que los extremos no den cifras absurdas. */
const FACTOR_EDAD_MIN = 0.7;
const FACTOR_EDAD_MAX = 2.5;

/**
 * Cuánto encarece o abarata cada familia de producto respecto a un plan de
 * protección puro. Los de acumulación y retiro incluyen aportación al capital,
 * así que la cuota es mayor; los legales y fiscales son honorarios y salen
 * más baratos por suma asegurada.
 */
const FACTOR_POR_TIPO: Record<Solution["kind"], number> = {
  Protección: 1,
  Acumulación: 1.35,
  Retiro: 1.25,
  Legal: 0.6,
  Fiscal: 0.7,
  Sucesión: 0.8,
  Empresarial: 1.5,
  Educación: 0.5,
};

/** La estimación se da como banda, no como cifra exacta: ±12%. */
const HOLGURA = 0.12;

/**
 * Cómo se reparte la suma asegurada entre las coberturas de cada familia de
 * producto. Es una definición de producto, no un cálculo: describe qué
 * incluye cada plan.
 */
const DESGLOSE_POR_TIPO: Record<Solution["kind"], { label: string; detail: string; icon: string; share: number }[]> = {
  Protección: [
    { label: "Fallecimiento por cualquier causa", detail: "Protección económica para tu familia.", icon: "HeartPulse", share: 0.45 },
    { label: "Incapacidad total y permanente", detail: "Respaldo en caso de incapacidad total.", icon: "Accessibility", share: 0.3 },
    { label: "Enfermedades críticas", detail: "Apoyo financiero ante enfermedades graves.", icon: "Activity", share: 0.2 },
    { label: "Gastos funerarios", detail: "Cobertura de gastos funerarios.", icon: "Umbrella", share: 0.05 },
  ],
  Acumulación: [
    { label: "Capital acumulado proyectado", detail: "Valor en efectivo al final del plazo.", icon: "PiggyBank", share: 0.6 },
    { label: "Protección de vida asociada", detail: "Suma asegurada del componente de vida.", icon: "HeartPulse", share: 0.3 },
    { label: "Rescate parcial disponible", detail: "Liquidez accesible antes del vencimiento.", icon: "Wallet", share: 0.1 },
  ],
  Retiro: [
    { label: "Capital de retiro proyectado", detail: "Fondo acumulado al llegar al retiro.", icon: "Landmark", share: 0.65 },
    { label: "Renta garantizada", detail: "Base de la renta vitalicia.", icon: "ShieldCheck", share: 0.25 },
    { label: "Protección de vida asociada", detail: "Cobertura durante la acumulación.", icon: "HeartPulse", share: 0.1 },
  ],
  Legal: [
    { label: "Patrimonio bajo estructura", detail: "Valor de los bienes que quedan protegidos.", icon: "Scroll", share: 0.85 },
    { label: "Cobertura de contingencias", detail: "Respaldo ante disputas o reclamaciones.", icon: "Scale", share: 0.15 },
  ],
  Fiscal: [
    { label: "Base imponible optimizada", detail: "Patrimonio sobre el que se aplica la estrategia.", icon: "Calculator", share: 0.8 },
    { label: "Provisión para impuesto sucesorio", detail: "Reserva para la transferencia.", icon: "Landmark", share: 0.2 },
  ],
  Sucesión: [
    { label: "Patrimonio a transferir", detail: "Valor que pasa a la siguiente generación.", icon: "Share2", share: 0.75 },
    { label: "Liquidez para la sucesión", detail: "Efectivo disponible en el traspaso.", icon: "Wallet", share: 0.25 },
  ],
  Empresarial: [
    { label: "Cobertura de persona clave", detail: "Suma asegurada sobre la persona clave.", icon: "UserRound", share: 0.5 },
    { label: "Financiación del acuerdo entre socios", detail: "Respaldo del buy-sell agreement.", icon: "Handshake", share: 0.4 },
    { label: "Continuidad operativa", detail: "Fondo para sostener la operación.", icon: "Workflow", share: 0.1 },
  ],
  Educación: [
    { label: "Fondo educativo proyectado", detail: "Capital disponible para la formación.", icon: "GraduationCap", share: 0.8 },
    { label: "Protección del aportante", detail: "Garantiza el fondo ante un imprevisto.", icon: "ShieldCheck", share: 0.2 },
  ],
};

/**
 * Atributos declarados de cada familia de producto: no se calculan, describen
 * el producto. Los usa el comparador.
 */
export const ATRIBUTOS_POR_TIPO: Record<
  Solution["kind"],
  { rentabilidad: number; perfil: string; liquidez: number; flexibilidad: number }
> = {
  Protección: { rentabilidad: 0, perfil: "Sin componente de inversión", liquidez: 2, flexibilidad: 3 },
  Acumulación: { rentabilidad: 4.2, perfil: "Moderada", liquidez: 3, flexibilidad: 3 },
  Retiro: { rentabilidad: 5.6, perfil: "Alta", liquidez: 2, flexibilidad: 2 },
  Legal: { rentabilidad: 0, perfil: "Sin componente de inversión", liquidez: 1, flexibilidad: 2 },
  Fiscal: { rentabilidad: 0, perfil: "Sin componente de inversión", liquidez: 2, flexibilidad: 3 },
  Sucesión: { rentabilidad: 3.1, perfil: "Conservadora", liquidez: 1, flexibilidad: 2 },
  Empresarial: { rentabilidad: 3.8, perfil: "Conservadora", liquidez: 2, flexibilidad: 4 },
  Educación: { rentabilidad: 3.8, perfil: "Conservadora", liquidez: 4, flexibilidad: 4 },
};

// ── Entrada y salida ───────────────────────────────────────────────────────

export interface Parametros {
  profile: ClientProfileId;
  age: number;
  dependents: number;
  monthlyIncome: number;
  level: CoverageLevel;
}

export interface CoberturaIncluida {
  id: string;
  label: string;
  detail: string;
  icon: string;
  amount: number;
}

export interface Simulacion {
  /** Capital que haría falta para reemplazar el ingreso del hogar. */
  necesidad: number;
  /** Lo que este nivel cubre de esa necesidad. */
  sumaAsegurada: number;
  /** Porcentaje de la necesidad que queda cubierto, 0-100. */
  cobertura: number;
  primaMensual: number;
  primaMinima: number;
  primaMaxima: number;
  primaAnual: number;
  coberturas: CoberturaIncluida[];
}

const factorPerfil = (id: ClientProfileId) => CLIENT_PROFILES.find((p) => p.id === id)?.factor ?? 1;

/** Encarecimiento por edad, acotado por los dos topes. */
function factorEdad(edad: number): number {
  const bruto = 1 + (edad - EDAD_DE_REFERENCIA) * INCREMENTO_POR_ANIO;
  return Math.min(FACTOR_EDAD_MAX, Math.max(FACTOR_EDAD_MIN, bruto));
}

/** Redondeo a dos decimales, para no arrastrar céntimos de coma flotante. */
const centimos = (n: number) => Math.round(n * 100) / 100;

/**
 * Calcula la necesidad de capital, la suma asegurada del nivel elegido, su
 * desglose por coberturas y la prima mensual estimada.
 */
export function simular(params: Parametros, kind: Solution["kind"]): Simulacion {
  const necesidad = Math.round(
    params.monthlyIncome *
      12 *
      ANIOS_DE_REEMPLAZO *
      factorPerfil(params.profile) *
      (1 + PESO_POR_DEPENDIENTE * params.dependents)
  );

  const parte = PARTE_CUBIERTA[params.level];
  const sumaAsegurada = Math.round(necesidad * parte);

  const prima = centimos((sumaAsegurada / 1000) * TASA_BASE_POR_MIL * factorEdad(params.age) * FACTOR_POR_TIPO[kind]);

  const coberturas = DESGLOSE_POR_TIPO[kind].map((c, i) => ({
    id: `${kind}-${i}`,
    label: c.label,
    detail: c.detail,
    icon: c.icon,
    amount: Math.round(sumaAsegurada * c.share),
  }));

  return {
    necesidad,
    sumaAsegurada,
    cobertura: Math.round(parte * 100),
    primaMensual: prima,
    primaMinima: centimos(prima * (1 - HOLGURA)),
    primaMaxima: centimos(prima * (1 + HOLGURA)),
    primaAnual: centimos(prima * 12),
    coberturas,
  };
}

/**
 * Los tres niveles con los mismos parámetros, para la tabla comparativa.
 * El nivel seleccionado sale de aquí igual que la cifra principal, así que no
 * pueden discrepar.
 */
export function simularNiveles(params: Parametros, kind: Solution["kind"]) {
  return (Object.keys(PARTE_CUBIERTA) as CoverageLevel[]).map((level) => ({
    level,
    ...simular({ ...params, level }, kind),
  }));
}

/** Importe con dos decimales y separador de miles: "$1,234.56". */
export function dinero(valor: number): string {
  return `$${valor.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** Importe redondeado, para sumas aseguradas: "$561,600". */
export function dineroEntero(valor: number): string {
  return `$${Math.round(valor).toLocaleString("en-US")}`;
}

/**
 * Cuál de las soluciones comparadas ofrece el mejor equilibrio.
 *
 * Se queda con la de más cobertura por dólar de prima: es una regla explícita
 * y comprobable, no una recomendación de inversión.
 */
export function mejorOpcion(
  candidatas: { slug: string; cobertura: number; primaMensual: number }[]
): string | null {
  if (candidatas.length === 0) return null;
  return [...candidatas].sort((a, b) => b.cobertura / b.primaMensual - a.cobertura / a.primaMensual)[0].slug;
}
