/**
 * Cálculos de la página de Analítica CRM.
 *
 * Son funciones puras sobre las colecciones que ya tiene el CRM: así la vista
 * se ocupa solo de componer bloques y toda la aritmética queda en un sitio.
 */

import { DONUT_COLORS } from "@/components/page-blocks/blocks/DonutChart";

export interface Slice {
  id: string;
  label: string;
  value: number;
  color: string;
}

/** Cuenta cuántos elementos caen en cada clave, de mayor a menor. */
export function countBy<T>(items: T[], key: (item: T) => string, colors: string[] = DONUT_COLORS): Slice[] {
  const counts = new Map<string, number>();
  items.forEach((item) => {
    const k = key(item);
    if (!k) return;
    counts.set(k, (counts.get(k) ?? 0) + 1);
  });
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([label, value], i) => ({ id: label, label, value, color: colors[i % colors.length] }));
}

/** Suma una magnitud agrupando por clave, de mayor a menor. */
export function sumBy<T>(
  items: T[],
  key: (item: T) => string,
  value: (item: T) => number,
  colors: string[] = DONUT_COLORS
): Slice[] {
  const totals = new Map<string, number>();
  items.forEach((item) => {
    const k = key(item);
    if (!k) return;
    totals.set(k, (totals.get(k) ?? 0) + value(item));
  });
  return Array.from(totals.entries())
    .filter(([, total]) => total > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([label, total], i) => ({ id: label, label, value: total, color: colors[i % colors.length] }));
}

/** Recorta a los primeros `n` y les reasigna el color por posición. */
export function topN(slices: Slice[], n: number, colors: string[] = DONUT_COLORS): Slice[] {
  return slices.slice(0, n).map((s, i) => ({ ...s, color: colors[i % colors.length] }));
}

export function pct(part: number, total: number, digits = 1): string {
  if (total <= 0) return "—";
  return `${((part / total) * 100).toFixed(digits)}%`;
}

export function moneyCompact(n: number): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toLocaleString("es")}`;
}

/**
 * Serie diaria **ilustrativa**.
 *
 * El CRM guarda el estado actual de cada registro, no un histórico por día,
 * así que las curvas de evolución no se pueden calcular todavía. Esta serie
 * es determinista —el mismo total da siempre la misma curva, sin parpadeos
 * entre renders— y solo sirve para que los gráficos de tendencia tengan
 * forma. En cuanto se guarden marcas de tiempo, se sustituye por el dato real.
 */
export function illustrativeSeries(total: number, days: number, growth = 0.35): number[] {
  const start = Math.max(1, Math.round(total * (1 - growth)));
  const step = (total - start) / Math.max(1, days - 1);
  return Array.from({ length: days }, (_, i) => {
    // Ondulación fija a partir del índice: evita `Math.random`, que cambiaría
    // el gráfico en cada render.
    const wobble = Math.sin(i * 1.7) * step * 0.6;
    return Math.max(0, Math.round(start + step * i + wobble));
  });
}

/** Puntos `{ label, value }` para los gráficos de línea y columnas. */
export function seriesPoints(values: number[], labelFor: (i: number) => string) {
  return values.map((value, i) => ({ dia: labelFor(i), valor: value }));
}

/** Etiqueta de día para un eje de N puntos dentro de un mes. */
export function dayLabel(index: number, count: number): string {
  const day = Math.round(1 + (index * 30) / Math.max(1, count - 1));
  return `${day}`;
}
