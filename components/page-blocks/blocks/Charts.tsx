"use client";

import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export interface BarSeries {
  key: string;
  label: string;
  color: string;
}

function formatCompact(value: number) {
  if (value >= 1000) return `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}K`;
  return String(value);
}

export function BarChart<T extends Record<string, unknown>>({
  data,
  categoryKey,
  series,
}: {
  data: T[];
  categoryKey: string;
  series: BarSeries[];
}) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ReBarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis
            dataKey={categoryKey}
            tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 11 }}
            axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
            tickLine={false}
            interval={0}
            angle={-25}
            textAnchor="end"
            height={56}
          />
          <YAxis
            tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={formatCompact}
          />
          <Tooltip
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
            contentStyle={{
              background: "var(--popover)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              fontSize: 12,
              color: "var(--popover-foreground)",
            }}
            formatter={(value) => (typeof value === "number" ? value.toLocaleString("es") : String(value ?? ""))}
          />
          <Legend wrapperStyle={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }} iconType="circle" iconSize={8} />
          {series.map((s) => (
            <Bar key={s.key} dataKey={s.key} name={s.label} fill={s.color} radius={[3, 3, 0, 0]} maxBarSize={22} />
          ))}
        </ReBarChart>
      </ResponsiveContainer>
    </div>
  );
}

export interface FunnelStep {
  id: string;
  label: string;
  value: number;
  pct: string;
  color: string;
}

/**
 * Embudo dibujado con anchos proporcionales — recharts no trae un embudo
 * en su build principal y esta versión es más legible en pantallas angostas.
 */
export function FunnelChart({ steps }: { steps: FunnelStep[] }) {
  const max = Math.max(...steps.map((s) => s.value), 1);

  return (
    <ul className="space-y-2">
      {steps.map((step) => {
        const width = Math.max((step.value / max) * 100, 6);
        return (
          <li key={step.id}>
            <div className="mb-1 flex items-center justify-between gap-2 text-xs">
              <span className="min-w-0 truncate text-white/60">{step.label}</span>
              <span className="flex flex-shrink-0 items-center gap-2">
                <span className="tabular-nums text-white/85">{step.value.toLocaleString("es")}</span>
                <span className="w-12 text-right tabular-nums text-white/35">{step.pct}</span>
              </span>
            </div>
            <div className="h-5 w-full overflow-hidden rounded-md bg-white/[0.03]">
              <div
                className="h-full rounded-md transition-all"
                style={{ width: `${width}%`, background: step.color, opacity: 0.85 }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
