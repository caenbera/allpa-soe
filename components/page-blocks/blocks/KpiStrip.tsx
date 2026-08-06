import { resolveLucideIcon } from "@/lib/lucide-icon";
import { Sparkline } from "@/components/page-blocks/blocks/TrendCharts";
import { ScoreRing } from "@/components/page-blocks/blocks/ScoreRing";

export interface KpiItem {
  id: string;
  label: string;
  value: string;
  icon: string;
  /** Texto secundario: porcentaje del total, comparativa, etc. */
  sub?: string;
  /** Delta con signo; verde si sube, rojo si baja. */
  delta?: string;
  tone?: "gold" | "emerald" | "amber" | "blue" | "violet" | "rose";
  /** Serie corta que se dibuja bajo la cifra, sin ejes. */
  trend?: number[];
  /** Sustituye el icono por un anillo de progreso 0-100. */
  ring?: number;
}

const TONE_CLASSES: Record<NonNullable<KpiItem["tone"]>, string> = {
  gold: "bg-[var(--allpa-gold-400)]/12 text-[var(--allpa-gold-300)]",
  emerald: "bg-emerald-400/12 text-emerald-300",
  amber: "bg-amber-400/12 text-amber-300",
  blue: "bg-blue-400/12 text-blue-300",
  violet: "bg-violet-400/12 text-violet-300",
  rose: "bg-rose-400/12 text-rose-300",
};

/** Color de trazo de la miniserie, a juego con el tono de la tarjeta. */
const TONE_STROKE: Record<NonNullable<KpiItem["tone"]>, string> = {
  gold: "#e0a836",
  emerald: "#22c55e",
  amber: "#f59e0b",
  blue: "#3b82f6",
  violet: "#a78bfa",
  rose: "#f472b6",
};

/**
 * Tira de indicadores.
 *
 * `stacked` apila icono, cifra y etiqueta —lo que usan Contenido y CRM—; en
 * `inline` el icono va a la izquierda con la etiqueta encima de la cifra, que
 * es como se leen los indicadores de Operaciones. La cuadrícula se ajusta
 * sola al número de tarjetas para que nunca quede una fila coja.
 */
export function KpiStrip({
  items,
  layout = "stacked",
}: {
  items: KpiItem[];
  layout?: "stacked" | "inline";
}) {
  const columns =
    items.length <= 4
      ? "sm:grid-cols-2 xl:grid-cols-4"
      : items.length === 5
        ? "sm:grid-cols-3 xl:grid-cols-5"
        : "sm:grid-cols-3 xl:grid-cols-6";

  return (
    <div className={`grid grid-cols-2 gap-3 ${columns}`}>
      {items.map((item) => {
        const Icon = resolveLucideIcon(item.icon);
        const down = item.delta?.trim().startsWith("-");
        const tone = item.tone ?? "gold";

        const mark =
          item.ring !== undefined ? (
            <ScoreRing value={item.ring} size={44} />
          ) : (
            <span className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${TONE_CLASSES[tone]}`}>
              <Icon className="h-[18px] w-[18px]" />
            </span>
          );

        const meta = (item.sub || item.delta) && (
          <p className="mt-1 flex items-center gap-1.5 text-[11px]">
            {item.delta && (
              <span className={down ? "font-medium text-rose-400" : "font-medium text-emerald-400"}>
                {down ? "↓" : "↑"} {item.delta.replace(/^-/, "")}
              </span>
            )}
            {item.sub && <span className="truncate text-white/35">{item.sub}</span>}
          </p>
        );

        const trend = item.trend && item.trend.length > 1 && (
          <div className="mt-2">
            <Sparkline data={item.trend} color={TONE_STROKE[tone]} />
          </div>
        );

        if (layout === "inline") {
          return (
            <div key={item.id} className="surface-card px-4 py-3.5">
              <div className="flex items-center gap-3">
                {mark}
                <div className="min-w-0">
                  <p className="truncate text-xs text-white/55">{item.label}</p>
                  <p className="mt-0.5 text-2xl font-semibold leading-none text-[#f3ecd9]">{item.value}</p>
                </div>
              </div>
              {meta}
              {trend}
            </div>
          );
        }

        return (
          <div key={item.id} className="surface-card px-4 py-3.5">
            <span className="mb-2.5 inline-flex">{mark}</span>
            <p className="text-2xl font-semibold leading-none text-[#f3ecd9]">{item.value}</p>
            <p className="mt-1.5 truncate text-xs text-white/55">{item.label}</p>
            {meta}
            {trend}
          </div>
        );
      })}
    </div>
  );
}
