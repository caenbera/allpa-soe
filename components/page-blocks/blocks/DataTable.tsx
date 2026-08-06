"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, ChevronsUpDown, Eye, MoreHorizontal } from "lucide-react";
import { resolveLucideIcon } from "@/lib/lucide-icon";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { ScoreRing } from "@/components/page-blocks/blocks/ScoreRing";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/** Celdas tipadas: cubren todas las variantes que aparecen en las pantallas. */
export type Cell =
  | { kind: "text"; value: string; sub?: string; strong?: boolean }
  | { kind: "number"; value: string }
  | { kind: "badge"; value: string; tone?: BadgeTone }
  | { kind: "status"; value: string; tone?: BadgeTone }
  | { kind: "person"; name: string; role?: string }
  | { kind: "progress"; value: number; label?: string }
  | { kind: "icons"; icons: string[]; muted?: boolean }
  | { kind: "index"; value: string }
  | { kind: "score"; value: number }
  | { kind: "toggle"; value: boolean; onChange?: (next: boolean) => void }
  | { kind: "initials"; value: string; color: string; label: string; sub?: string }
  | { kind: "stacked"; value: string; sub: string }
  | { kind: "dateWithSub"; value: string; sub: string; urgent?: boolean }
  /** Cadena de pasos de una automatización, con su espera entre ellos. */
  | { kind: "actionChain"; steps: { icon: string; delay?: string }[] }
  /** Icono con etiqueta, ej. la fuente por la que llegó un contacto. */
  | { kind: "source"; icon: string; value: string; sub?: string }
  /** Punto de color + texto, ej. la última actividad. */
  | { kind: "activity"; value: string; sub?: string; color?: string }
  /** Varias etiquetas en una celda, ej. los productos principales de una empresa. */
  | { kind: "badgeList"; items: { label: string; tone?: BadgeTone }[] }
  /**
   * Columna de tendencia: "6%", "-2 días", o vacío para "sin cambio".
   * Con `lowerIsBetter` —tiempos de ciclo, de respuesta— bajar se pinta verde.
   */
  | { kind: "delta"; value: string; lowerIsBetter?: boolean };

export type BadgeTone = "gold" | "emerald" | "amber" | "blue" | "violet" | "rose" | "neutral";

const BADGE_TONES: Record<BadgeTone, string> = {
  gold: "bg-[var(--allpa-gold-400)]/12 text-[var(--allpa-gold-300)]",
  emerald: "bg-emerald-400/12 text-emerald-300",
  amber: "bg-amber-400/12 text-amber-300",
  blue: "bg-blue-400/12 text-blue-300",
  violet: "bg-violet-400/12 text-violet-300",
  rose: "bg-rose-400/12 text-rose-300",
  neutral: "bg-white/8 text-white/60",
};

export interface ColumnDef {
  id: string;
  header: string;
  sortable?: boolean;
  width?: string;
  align?: "left" | "right";
}

export interface RowData {
  id: string;
  cells: Record<string, Cell>;
}

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/** Valor comparable de una celda, para ordenar. */
function sortValue(cell: Cell | undefined): string | number {
  if (!cell) return "";
  switch (cell.kind) {
    case "progress":
      return cell.value;
    case "person":
      return cell.name.toLowerCase();
    case "icons":
      return cell.icons.length;
    case "score":
      return cell.value;
    case "toggle":
      return cell.value ? 1 : 0;
    case "actionChain":
      return cell.steps.length;
    case "badgeList":
      return cell.items.length;
    case "initials":
      return cell.label.toLowerCase();
    case "number":
    case "stacked": {
      const n = Number(cell.value.replace(/[^\d.-]/g, ""));
      return Number.isNaN(n) ? cell.value.toLowerCase() : n;
    }
    default:
      return String(cell.value).toLowerCase();
  }
}

function CellView({ cell }: { cell: Cell | undefined }) {
  if (!cell) return <span className="text-white/25">—</span>;

  switch (cell.kind) {
    case "index":
      return (
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--allpa-gold-400)]/12 text-xs font-semibold text-[var(--allpa-gold-300)]">
          {cell.value}
        </span>
      );
    case "text":
      return (
        <span className="block min-w-0">
          <span className={`block truncate ${cell.strong ? "font-medium text-white/90" : "text-white/75"}`}>{cell.value}</span>
          {cell.sub && <span className="block truncate text-xs text-white/35">{cell.sub}</span>}
        </span>
      );
    case "number":
      return <span className="tabular-nums text-white/75">{cell.value}</span>;
    case "badge":
    case "status":
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${BADGE_TONES[cell.tone ?? "neutral"]}`}>
          {cell.kind === "status" && <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />}
          {cell.value}
        </span>
      );
    case "person":
      return (
        <span className="flex min-w-0 items-center gap-2">
          <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#f5da93] to-[#a9760f] text-[10px] font-bold text-[#241a05]">
            {initialsOf(cell.name)}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-white/80">{cell.name}</span>
            {cell.role && <span className="block truncate text-xs text-white/35">{cell.role}</span>}
          </span>
        </span>
      );
    case "progress":
      return (
        <span className="flex items-center gap-2">
          <Progress value={cell.value} className="w-20" />
          <span className="w-9 text-right text-xs tabular-nums text-white/60">{cell.label ?? `${cell.value}%`}</span>
        </span>
      );
    case "icons":
      return (
        <span className="flex flex-wrap items-center gap-1">
          {cell.icons.map((name, i) => {
            const Icon = resolveLucideIcon(name);
            return (
              <span
                key={`${name}-${i}`}
                className={`flex h-6 w-6 items-center justify-center rounded-md ${
                  cell.muted ? "bg-white/5 text-white/20" : "bg-[var(--allpa-gold-400)]/12 text-[var(--allpa-gold-300)]"
                }`}
              >
                <Icon className="h-3 w-3" />
              </span>
            );
          })}
        </span>
      );
    case "score":
      return <ScoreRing value={cell.value} />;
    case "toggle":
      return <Switch checked={cell.value} onCheckedChange={(next) => cell.onChange?.(Boolean(next))} />;
    case "initials":
      return (
        <span className="flex min-w-0 items-center gap-2.5">
          <span
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-[11px] font-bold text-white"
            style={{ background: cell.color }}
          >
            {cell.value}
          </span>
          <span className="min-w-0">
            <span className="block truncate font-medium text-white/90">{cell.label}</span>
            {cell.sub && <span className="block truncate text-xs text-white/35">{cell.sub}</span>}
          </span>
        </span>
      );
    case "stacked":
      return (
        <span className="block min-w-0">
          <span className="block truncate tabular-nums text-white/85">{cell.value}</span>
          <span className="block truncate text-xs text-white/35">{cell.sub}</span>
        </span>
      );
    case "dateWithSub":
      return (
        <span className="block min-w-0">
          <span className="block truncate text-white/80">{cell.value}</span>
          <span className={`block truncate text-xs ${cell.urgent ? "text-amber-400" : "text-white/35"}`}>{cell.sub}</span>
        </span>
      );
    case "actionChain":
      return (
        <span className="flex items-center gap-1">
          {cell.steps.map((step, i) => {
            const Icon = resolveLucideIcon(step.icon);
            return (
              <span key={`${step.icon}-${i}`} className="flex items-center gap-1">
                {i > 0 && <span className="text-white/20">→</span>}
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white/8 text-white/60">
                  <Icon className="h-3 w-3" />
                </span>
                {step.delay && <span className="text-[10px] text-white/35">{step.delay}</span>}
              </span>
            );
          })}
        </span>
      );
    case "source": {
      const Icon = resolveLucideIcon(cell.icon);
      return (
        <span className="flex min-w-0 items-center gap-2">
          <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-white/8 text-white/55">
            {/* eslint-disable-next-line react-hooks/static-components -- selecciona un icono existente por nombre, no crea un componente nuevo */}
            <Icon className="h-3 w-3" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-white/75">{cell.value}</span>
            {cell.sub && <span className="block truncate text-xs text-white/35">{cell.sub}</span>}
          </span>
        </span>
      );
    }
    case "activity":
      return (
        <span className="flex min-w-0 items-start gap-2">
          <span
            className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full"
            style={{ background: cell.color ?? "#22c55e" }}
          />
          <span className="min-w-0">
            <span className="block truncate text-white/75">{cell.value}</span>
            {cell.sub && <span className="block truncate text-xs text-white/35">{cell.sub}</span>}
          </span>
        </span>
      );
    case "delta": {
      const trimmed = cell.value.trim();
      if (!trimmed) return <span className="text-white/25">—</span>;
      const down = trimmed.startsWith("-") || trimmed.startsWith("↓");
      const good = cell.lowerIsBetter ? down : !down;
      return (
        <span className={`text-xs font-medium ${good ? "text-emerald-400" : "text-rose-400"}`}>
          {down ? "↓" : "↑"} {trimmed.replace(/^[-+↑↓]\s*/, "")}
        </span>
      );
    }
    case "badgeList":
      return (
        <span className="flex flex-wrap items-center gap-1">
          {cell.items.map((item, i) => (
            <span
              key={`${item.label}-${i}`}
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${BADGE_TONES[item.tone ?? "neutral"]}`}
            >
              {item.label}
            </span>
          ))}
        </span>
      );
  }
}

export function DataTable({
  columns,
  rows,
  pageSize = 10,
  onView,
  onEditRow,
  onDeleteRow,
  emptyMessage = "No hay elementos que coincidan con los filtros.",
}: {
  columns: ColumnDef[];
  rows: RowData[];
  pageSize?: number;
  onView?: (id: string) => void;
  onEditRow?: (id: string) => void;
  onDeleteRow?: (id: string) => void;
  emptyMessage?: string;
}) {
  const [sort, setSort] = useState<{ id: string; dir: "asc" | "desc" } | null>(null);
  const [page, setPage] = useState(0);

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const copy = [...rows];
    copy.sort((a, b) => {
      const av = sortValue(a.cells[sort.id]);
      const bv = sortValue(b.cells[sort.id]);
      if (av === bv) return 0;
      const res = av > bv ? 1 : -1;
      return sort.dir === "asc" ? res : -res;
    });
    return copy;
  }, [rows, sort]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  // Al filtrar, la página actual puede quedar fuera de rango: se acota al
  // renderizar en vez de guardar un índice inválido en el estado.
  const safePage = Math.min(page, pageCount - 1);
  const visible = sorted.slice(safePage * pageSize, safePage * pageSize + pageSize);

  const toggleSort = (id: string) => {
    setSort((s) => (s?.id === id ? { id, dir: s.dir === "asc" ? "desc" : "asc" } : { id, dir: "asc" }));
    setPage(0);
  };

  const hasActions = Boolean(onView || onEditRow || onDeleteRow);

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-[11px] uppercase tracking-wide text-white/35">
              {columns.map((col) => (
                <th key={col.id} className={`py-2.5 pr-3 font-medium ${col.align === "right" ? "text-right" : ""}`} style={{ width: col.width }}>
                  {col.sortable ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(col.id)}
                      className={`inline-flex items-center gap-1 transition-colors hover:text-white/70 ${
                        sort?.id === col.id ? "text-[var(--allpa-gold-300)]" : ""
                      }`}
                    >
                      {col.header}
                      <ChevronsUpDown className="h-3 w-3" />
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              ))}
              {hasActions && <th className="w-20 py-2.5 font-medium">Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <tr key={row.id} className="border-b border-white/[0.06] last:border-0 hover:bg-white/[0.02]">
                {columns.map((col) => (
                  <td key={col.id} className={`py-2.5 pr-3 ${col.align === "right" ? "text-right" : ""}`}>
                    <CellView cell={row.cells[col.id]} />
                  </td>
                ))}
                {hasActions && (
                  <td className="py-2.5">
                    <span className="flex items-center gap-1">
                      {onView && (
                        <button
                          type="button"
                          onClick={() => onView(row.id)}
                          aria-label="Ver detalle"
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-white/35 transition-colors hover:bg-white/5 hover:text-white/70"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {(onEditRow || onDeleteRow) && (
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-white/35 transition-colors hover:bg-white/5 hover:text-white/70"
                            aria-label="Opciones de la fila"
                          >
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-36">
                            {onEditRow && <DropdownMenuItem onClick={() => onEditRow(row.id)}>Editar</DropdownMenuItem>}
                            {onDeleteRow && (
                              <DropdownMenuItem onClick={() => onDeleteRow(row.id)} className="text-red-500 focus:text-red-500">
                                Eliminar
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </span>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {visible.length === 0 && <p className="py-10 text-center text-sm text-white/35">{emptyMessage}</p>}

      {sorted.length > pageSize && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-white/45">
          <span>
            Mostrando {safePage * pageSize + 1} a {Math.min((safePage + 1) * pageSize, sorted.length)} de {sorted.length}
          </span>
          <span className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage(Math.max(0, safePage - 1))}
              disabled={safePage === 0}
              aria-label="Página anterior"
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 transition-colors hover:bg-white/5 disabled:opacity-30"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            {Array.from({ length: pageCount }, (_, i) => i)
              .filter((i) => i === 0 || i === pageCount - 1 || Math.abs(i - safePage) <= 1)
              .map((i, idx, arr) => (
                <span key={i} className="flex items-center gap-1">
                  {idx > 0 && arr[idx - 1] !== i - 1 && <span className="px-0.5 text-white/25">…</span>}
                  <button
                    type="button"
                    onClick={() => setPage(i)}
                    className={`flex h-7 min-w-7 items-center justify-center rounded-lg px-1.5 transition-colors ${
                      i === safePage
                        ? "bg-[var(--allpa-gold-400)]/20 font-semibold text-[var(--allpa-gold-300)]"
                        : "border border-white/10 hover:bg-white/5"
                    }`}
                  >
                    {i + 1}
                  </button>
                </span>
              ))}
            <button
              type="button"
              onClick={() => setPage(Math.min(pageCount - 1, safePage + 1))}
              disabled={safePage >= pageCount - 1}
              aria-label="Página siguiente"
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 transition-colors hover:bg-white/5 disabled:opacity-30"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </span>
        </div>
      )}
    </div>
  );
}
