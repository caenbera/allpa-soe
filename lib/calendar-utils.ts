/**
 * Utilidades de fecha del calendario de Operaciones.
 *
 * Todo se calcula en **hora local**. `toISOString()` convierte a UTC, así que
 * una fecha local de la tarde en un huso al oeste de Greenwich se guardaría
 * con el día siguiente: el evento aparecería en la casilla equivocada. Por eso
 * `localIso` compone la cadena a partir del año, mes y día locales.
 */

/** `YYYY-MM-DD` a partir de la fecha local, no de UTC. */
export function localIso(d: Date): string {
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${dia}`;
}

export const WEEKDAY_LABELS = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"];

/** Lunes de la semana a la que pertenece `d`. La semana empieza en lunes. */
export function startOfWeek(d: Date): Date {
  const out = new Date(d);
  // getDay() da 0 para domingo; se recoloca para que el lunes sea el origen.
  const desdeLunes = (out.getDay() + 6) % 7;
  out.setDate(out.getDate() - desdeLunes);
  out.setHours(0, 0, 0, 0);
  return out;
}

/** Los siete días de la semana de `d`, de lunes a domingo. */
export function weekDays(d: Date): Date[] {
  const lunes = startOfWeek(d);
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(lunes);
    day.setDate(lunes.getDate() + i);
    return day;
  });
}

/**
 * Las 42 casillas de la rejilla mensual: seis semanas completas que empiezan
 * en lunes. Se usa un número fijo para que la rejilla no cambie de alto al
 * pasar de mes.
 */
export function monthGridDays(year: number, month: number): Date[] {
  const primero = new Date(year, month, 1);
  const inicio = startOfWeek(primero);
  return Array.from({ length: 42 }, (_, i) => {
    const day = new Date(inicio);
    day.setDate(inicio.getDate() + i);
    return day;
  });
}

const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

/** "Agosto 2026", con la inicial en mayúscula. */
export function monthLabel(year: number, month: number): string {
  const nombre = MESES[month];
  return `${nombre.charAt(0).toUpperCase()}${nombre.slice(1)} ${year}`;
}

/** "lun 4 de agosto" — encabezado de las vistas de día y semana. */
export function dayLabel(d: Date): string {
  return d.toLocaleDateString("es", { weekday: "short", day: "numeric", month: "long" });
}

export function isSameDay(a: Date, b: Date): boolean {
  return localIso(a) === localIso(b);
}

export function isToday(d: Date): boolean {
  return isSameDay(d, new Date());
}

/** Horas que se dibujan en la rejilla de Día y Semana: jornada laboral amplia. */
export const GRID_HOURS = Array.from({ length: 13 }, (_, i) => i + 7); // 07:00 a 19:00

/** Minutos desde el comienzo de la rejilla; sirve para colocar un evento. */
export function minutesFromGridStart(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return (h - GRID_HOURS[0]) * 60 + (m || 0);
}
