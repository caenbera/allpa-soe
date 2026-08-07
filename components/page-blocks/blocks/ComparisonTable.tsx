"use client";

import { Check } from "lucide-react";
import { resolveLucideIcon } from "@/lib/lucide-icon";
import { Badge } from "@/components/ui/badge";
import { DotMeter } from "@/components/page-blocks/DotMeter";

export interface ComparisonColumn {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  color: string;
}

/** Lo que puede aparecer en una celda de la matriz. */
export type ComparisonCell =
  | { kind: "text"; value: string; badge?: string }
  | { kind: "amount"; value: string; badge?: string }
  | { kind: "percent"; value: number; badge?: string }
  | { kind: "checks"; items: string[] }
  | { kind: "dots"; value: number; label: string };

export interface ComparisonRow {
  id: string;
  label: string;
  /** Aclaración bajo la etiqueta de la fila. */
  hint?: string;
  /** Una celda por columna, en el mismo orden. */
  cells: ComparisonCell[];
}

/**
 * Matriz de comparación: atributos en las filas, soluciones en las columnas.
 *
 * No reutiliza `DataTable` porque la orientación es la contraria —aquí manda
 * la fila de atributo y las columnas son entidades, no campos—, y porque la
 * cabecera es una ficha con icono y descripción en vez de un título ordenable.
 *
 * La tabla lleva su propio scroll horizontal: con cuatro soluciones no cabe
 * en un móvil, y es preferible desplazarla a comprimir las cifras.
 */
export function ComparisonTable({
  columns,
  rows,
  highlightId,
  highlightLabel = "Mejor opción",
}: {
  columns: ComparisonColumn[];
  rows: ComparisonRow[];
  /** Columna destacada, por ejemplo la recomendada. */
  highlightId?: string;
  highlightLabel?: string;
}) {
  if (columns.length === 0) {
    return <p className="py-6 text-center text-sm text-white/35">Elige al menos una solución para comparar.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-sm">
        <thead>
          <tr>
            <th className="w-48 border-b border-white/8 px-3 pb-3 text-left align-bottom text-xs font-medium uppercase tracking-wide text-white/35">
              Resumen general
            </th>
            {columns.map((col) => {
              const Icon = resolveLucideIcon(col.icon);
              const destacada = col.id === highlightId;
              return (
                <th
                  key={col.id}
                  className={`border-b border-white/8 px-3 pb-3 text-left align-bottom ${
                    destacada ? "bg-[var(--allpa-gold-400)]/[0.06]" : ""
                  }`}
                >
                  <span className="flex items-start gap-2.5">
                    <span
                      className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
                      style={{ background: `${col.color}1f`, color: col.color }}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-[#f3ecd9]">{col.title}</span>
                      {col.subtitle && <span className="block text-xs font-normal text-white/40">{col.subtitle}</span>}
                      {destacada && (
                        <Badge className="mt-1 border border-[var(--allpa-gold-400)]/30 bg-[var(--allpa-gold-400)]/10 text-[var(--allpa-gold-300)]">
                          {highlightLabel}
                        </Badge>
                      )}
                    </span>
                  </span>
                </th>
              );
            })}
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-white/6 last:border-0">
              <th scope="row" className="px-3 py-3 text-left align-top font-normal">
                <span className="block text-sm text-white/55">{row.label}</span>
                {row.hint && <span className="block text-xs text-white/30">{row.hint}</span>}
              </th>

              {columns.map((col, i) => (
                <td
                  key={col.id}
                  className={`px-3 py-3 align-top ${col.id === highlightId ? "bg-[var(--allpa-gold-400)]/[0.06]" : ""}`}
                >
                  <CellContent cell={row.cells[i]} color={col.color} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CellContent({ cell, color }: { cell: ComparisonCell | undefined; color: string }) {
  if (!cell) return <span className="text-sm text-white/25">—</span>;

  switch (cell.kind) {
    case "amount":
      return (
        <span className="flex flex-wrap items-baseline gap-2">
          <span className="text-lg font-semibold tabular-nums" style={{ color }}>
            {cell.value}
          </span>
          {cell.badge && <Badge className="border border-white/12 bg-white/[0.04] text-white/55">{cell.badge}</Badge>}
        </span>
      );

    case "percent":
      return (
        <span className="flex flex-wrap items-baseline gap-2">
          <span className="text-lg font-semibold tabular-nums text-[#f3ecd9]">{cell.value}%</span>
          {cell.badge && <Badge className="border border-white/12 bg-white/[0.04] text-white/55">{cell.badge}</Badge>}
        </span>
      );

    case "checks":
      return (
        <ul className="space-y-1.5">
          {cell.items.map((item) => (
            <li key={item} className="flex items-start gap-1.5 text-xs text-white/65">
              <Check className="mt-0.5 h-3 w-3 flex-shrink-0" style={{ color }} />
              <span className="min-w-0">{item}</span>
            </li>
          ))}
        </ul>
      );

    case "dots":
      return <DotMeter level={cell.value} color={color} label={cell.label} size="sm" />;

    case "text":
      return (
        <span className="flex flex-wrap items-baseline gap-2">
          <span className="text-sm text-white/70">{cell.value}</span>
          {cell.badge && <Badge className="border border-white/12 bg-white/[0.04] text-white/55">{cell.badge}</Badge>}
        </span>
      );
  }
}
