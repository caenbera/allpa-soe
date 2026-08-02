"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

export interface DonutSlice {
  id: string;
  label: string;
  value: number;
  color: string;
}

/** Paleta por defecto, alineada con los tokens del sistema de diseño. */
export const DONUT_COLORS = ["#a78bfa", "#22c55e", "#3b82f6", "#e0a836", "#f472b6", "#94a3b8"];

export function DonutChart({
  slices,
  centerValue,
  centerLabel,
  showPercent = true,
}: {
  slices: DonutSlice[];
  centerValue: string;
  centerLabel: string;
  showPercent?: boolean;
}) {
  const total = slices.reduce((sum, s) => sum + s.value, 0);

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <div className="relative h-36 w-36 flex-shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={slices} dataKey="value" innerRadius={46} outerRadius={68} paddingAngle={2} stroke="none">
              {slices.map((slice) => (
                <Cell key={slice.id} fill={slice.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-semibold leading-none text-[#f3ecd9]">{centerValue}</span>
          <span className="mt-1 max-w-[72px] text-center text-[10px] leading-tight text-white/40">{centerLabel}</span>
        </div>
      </div>

      <ul className="min-w-0 flex-1 space-y-1.5">
        {slices.map((slice) => (
          <li key={slice.id} className="flex items-center gap-2 text-xs">
            <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ background: slice.color }} />
            <span className="min-w-0 flex-1 truncate text-white/65">{slice.label}</span>
            <span className="tabular-nums font-medium text-white/85">{slice.value}</span>
            {showPercent && total > 0 && (
              <span className="w-12 text-right tabular-nums text-white/35">{((slice.value / total) * 100).toFixed(1)}%</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
