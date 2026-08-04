"use client";

import {
  LineChart as ReLineChart,
  Line,
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export interface TrendSeries {
  key: string;
  label: string;
  color: string;
  /** Línea punteada, para series secundarias como "nuevos". */
  dashed?: boolean;
}

const AXIS = { stroke: "rgba(255,255,255,0.25)", fontSize: 11 } as const;

const TOOLTIP_STYLE = {
  background: "#141b2e",
  border: "1px solid rgba(238,196,105,0.2)",
  borderRadius: 12,
  fontSize: 12,
} as const;

function formatCompact(value: number) {
  if (value >= 1000) return `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}K`;
  return String(value);
}

/** Series temporales con una o varias líneas y su leyenda propia. */
export function LineChart<T extends Record<string, unknown>>({
  data,
  categoryKey,
  series,
  height = 260,
}: {
  data: T[];
  categoryKey: string;
  series: TrendSeries[];
  height?: number;
}) {
  return (
    <div>
      <div className="mb-2 flex flex-wrap gap-4">
        {series.map((s) => (
          <span key={s.key} className="flex items-center gap-1.5 text-xs text-white/55">
            <span className="h-0.5 w-4 rounded-full" style={{ background: s.color }} />
            {s.label}
          </span>
        ))}
      </div>
      <div style={{ height }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ReLineChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey={categoryKey} tickLine={false} axisLine={false} tick={AXIS} />
            <YAxis tickLine={false} axisLine={false} tick={AXIS} tickFormatter={formatCompact} />
            <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ stroke: "rgba(255,255,255,0.12)" }} />
            {series.map((s) => (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.label}
                stroke={s.color}
                strokeWidth={2}
                strokeDasharray={s.dashed ? "4 4" : undefined}
                dot={{ r: 3, fill: s.color, strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            ))}
          </ReLineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/** Barras verticales de una sola serie, para volumen por día. */
export function ColumnChart<T extends Record<string, unknown>>({
  data,
  categoryKey,
  valueKey,
  color = "#a78bfa",
  height = 240,
}: {
  data: T[];
  categoryKey: string;
  valueKey: string;
  color?: string;
  height?: number;
}) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ReBarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis dataKey={categoryKey} tickLine={false} axisLine={false} tick={AXIS} interval="preserveStartEnd" />
          <YAxis tickLine={false} axisLine={false} tick={AXIS} tickFormatter={formatCompact} />
          <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
          <Bar dataKey={valueKey} fill={color} radius={[4, 4, 0, 0]} />
        </ReBarChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Miniserie sin ejes, para incrustar en una tarjeta de indicador. */
export function Sparkline({ data, color = "#a78bfa" }: { data: number[]; color?: string }) {
  const points = data.map((value, i) => ({ i, value }));
  return (
    <div className="h-9 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ReLineChart data={points} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
          <Line type="monotone" dataKey="value" stroke={color} strokeWidth={1.5} dot={false} />
        </ReLineChart>
      </ResponsiveContainer>
    </div>
  );
}
