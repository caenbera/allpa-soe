import { resolveLucideIcon } from "@/lib/lucide-icon";
import { Sparkline } from "@/components/page-blocks/blocks/TrendCharts";

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

export function KpiStrip({ items }: { items: KpiItem[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
      {items.map((item) => {
        const Icon = resolveLucideIcon(item.icon);
        const down = item.delta?.trim().startsWith("-");
        return (
          <div key={item.id} className="surface-card px-4 py-3.5">
            <span className={`mb-2.5 flex h-9 w-9 items-center justify-center rounded-xl ${TONE_CLASSES[item.tone ?? "gold"]}`}>
              <Icon className="h-[18px] w-[18px]" />
            </span>
            <p className="text-2xl font-semibold leading-none text-[#f3ecd9]">{item.value}</p>
            <p className="mt-1.5 truncate text-xs text-white/55">{item.label}</p>
            {(item.sub || item.delta) && (
              <p className="mt-1 flex items-center gap-1.5 text-[11px]">
                {item.delta && (
                  <span className={down ? "font-medium text-rose-400" : "font-medium text-emerald-400"}>
                    {down ? "↓" : "↑"} {item.delta.replace(/^-/, "")}
                  </span>
                )}
                {item.sub && <span className="truncate text-white/35">{item.sub}</span>}
              </p>
            )}
            {item.trend && item.trend.length > 1 && (
              <div className="mt-2">
                <Sparkline data={item.trend} color={TONE_STROKE[item.tone ?? "gold"]} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
