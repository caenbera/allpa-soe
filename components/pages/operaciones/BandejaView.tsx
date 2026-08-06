"use client";

import { useMemo, useState } from "react";
import { Download, Plus } from "lucide-react";
import { PageShell, PageTabs } from "@/components/page-blocks/PageShell";
import { AddBlockDialog } from "@/components/page-blocks/AddBlockDialog";
import { useBlockComposer } from "@/components/page-blocks/use-block-composer";
import { BlockFrame } from "@/components/page-blocks/BlockFrame";
import { EmptyState, LoadingState } from "@/components/page-blocks/EmptyState";
import { KpiStrip, type KpiItem } from "@/components/page-blocks/blocks/KpiStrip";
import { FilterToolbar } from "@/components/page-blocks/blocks/FilterToolbar";
import { DataTable, type Cell, type ColumnDef, type RowData } from "@/components/page-blocks/blocks/DataTable";
import { DonutChart, DONUT_COLORS } from "@/components/page-blocks/blocks/DonutChart";
import { ColumnChart } from "@/components/page-blocks/blocks/TrendCharts";
import { InfoCard, type InfoRow } from "@/components/page-blocks/blocks/InfoCard";
import { QuickActionGrid } from "@/components/page-blocks/blocks/QuickActionGrid";
import { Button } from "@/components/ui/button";
import { useContent } from "@/lib/use-content";
import { usePageConfig } from "@/lib/use-page-config";
import {
  INBOX_STATUS_TONE,
  PRIORITY_TONE,
  PROCESS_TONE,
  type InboxStatus,
  type OpsCollection,
  type Priority,
} from "@/lib/ops-types";

/**
 * Lo mínimo que comparten las cinco bandejas. Cada una añade lo suyo por las
 * ranuras de configuración.
 */
export interface BandejaItem {
  id: string;
  title: string;
  client: string;
  process: string;
  owner: string;
  status: InboxStatus;
  priority: Priority;
  dueDate: string;
  dueLabel: string;
  overdue: boolean;
  order: number;
}

const TABS = [
  { value: "todos", label: "Todos" },
  { value: "Pendiente", label: "Pendientes" },
  { value: "En gestión", label: "En gestión" },
  { value: "En espera", label: "En espera" },
  { value: "cerrados", label: "Resueltos" },
];

const CERRADOS: InboxStatus[] = ["Resuelto", "Completado"];

/** Sigue abierto mientras no esté resuelto ni completado. */
const abierto = (item: { status: InboxStatus }) => !CERRADOS.includes(item.status);

export interface BandejaConfig<T extends BandejaItem> {
  title: string;
  description: string;
  icon: string;
  /** Ruta de la página, para guardar sus bloques. */
  path: string;
  collection: OpsCollection;
  newLabel: string;
  searchPlaceholder: string;
  emptyTitle: string;
  emptyDescription: string;
  /** Columnas propias, que se insertan antes de prioridad y estado. */
  extraColumns?: ColumnDef[];
  extraCells?: (item: T) => Record<string, Cell>;
  /** Indicadores propios, además de los cuatro comunes. */
  extraKpis?: (items: T[]) => KpiItem[];
  /** Campos propios de la ficha de detalle. */
  extraDetailRows?: (item: T) => InfoRow[];
  /** Contenido adicional del panel lateral: línea de tiempo, avance… */
  extraPanel?: (item: T) => React.ReactNode;
  /** Título de la dona del pie; por defecto reparte por proceso. */
  breakdownTitle?: string;
  breakdown?: (items: T[]) => { id: string; label: string; value: number; color: string }[];
}

/**
 * Armazón común de las bandejas de Operaciones —revisiones, documentos,
 * firmas, renovaciones y casos especiales—.
 *
 * Las cinco pantallas comparten forma: indicadores, pestañas por estado,
 * filtros, tabla, ficha de detalle y gráficos al pie. Se escribe una vez y
 * cada página aporta sus columnas, sus indicadores y sus campos propios, en
 * vez de repetir cinco veces el mismo esqueleto.
 */
export function BandejaView<T extends BandejaItem>({ config }: { config: BandejaConfig<T> }) {
  const [tab, setTab] = useState("todos");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const items = useContent<T>(config.collection);
  const { blocks, addBlock, updateBlock, removeBlock } = usePageConfig(config.path);
  const composer = useBlockComposer(addBlock);

  const stats = useMemo(() => {
    const list = items.items;
    return {
      abiertos: list.filter(abierto).length,
      gestion: list.filter((i) => i.status === "En gestión").length,
      espera: list.filter((i) => i.status === "En espera").length,
      cerrados: list.filter((i) => CERRADOS.includes(i.status)).length,
      atrasados: list.filter((i) => i.overdue && abierto(i)).length,
    };
  }, [items.items]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.items.filter((i) => {
      if (tab === "cerrados" && !CERRADOS.includes(i.status)) return false;
      if (tab !== "todos" && tab !== "cerrados" && i.status !== tab) return false;
      if (filters.process && filters.process !== "Todos" && i.process !== filters.process) return false;
      if (filters.owner && filters.owner !== "Todos" && i.owner !== filters.owner) return false;
      if (filters.priority && filters.priority !== "Todas" && i.priority !== filters.priority) return false;
      if (!q) return true;
      return `${i.title} ${i.client} ${i.process}`.toLowerCase().includes(q);
    });
  }, [items.items, tab, search, filters]);

  const porProceso = useMemo(() => {
    if (config.breakdown) return config.breakdown(items.items);
    const counts = new Map<string, number>();
    items.items.forEach((i) => counts.set(i.process, (counts.get(i.process) ?? 0) + 1));
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([label, value], i) => ({ id: label, label, value, color: DONUT_COLORS[i % DONUT_COLORS.length] }));
  }, [items.items, config]);

  const porPrioridad = useMemo(() => {
    const abiertos = items.items.filter(abierto);
    return (["Alta", "Media", "Baja"] as Priority[]).map((p) => ({
      prioridad: p,
      total: abiertos.filter((i) => i.priority === p).length,
    }));
  }, [items.items]);

  const rows: RowData[] = filtered.map((item) => ({
    id: item.id,
    cells: {
      item: { kind: "text", value: item.title, sub: item.client, strong: true },
      process: { kind: "badge", value: item.process, tone: PROCESS_TONE[item.process] ?? "neutral" },
      ...(config.extraCells?.(item) ?? {}),
      priority: { kind: "badge", value: item.priority, tone: PRIORITY_TONE[item.priority] },
      status: { kind: "status", value: item.status, tone: INBOX_STATUS_TONE[item.status] },
      owner: { kind: "person", name: item.owner },
      due: {
        kind: "dateWithSub",
        value: item.dueLabel,
        sub: item.overdue && abierto(item) ? "Atrasado" : "Fecha límite",
        urgent: item.overdue && abierto(item),
      },
    },
  }));

  const columns: ColumnDef[] = [
    { id: "item", header: "Asunto", sortable: true },
    { id: "process", header: "Proceso", sortable: true, width: "160px" },
    ...(config.extraColumns ?? []),
    { id: "priority", header: "Prioridad", sortable: true, width: "110px" },
    { id: "status", header: "Estado", sortable: true, width: "130px" },
    { id: "owner", header: "Responsable", sortable: true, width: "160px" },
    { id: "due", header: "Fecha límite", sortable: true, width: "140px" },
  ];

  const selected = items.items.find((i) => i.id === selectedId) ?? filtered[0] ?? null;
  const isEmpty = !items.loading && items.items.length === 0;

  const sidePanel = isEmpty ? null : (
    <>
      {selected && (
        <>
          <BlockFrame title="Detalle" icon={config.icon}>
            <p className="mb-1 font-semibold text-[#f3ecd9]">{selected.title}</p>
            <p className="mb-3 text-xs text-white/45">{selected.client}</p>
            <InfoCard
              rows={[
                { label: "Proceso", value: selected.process },
                { label: "Responsable", value: selected.owner, person: true },
                { label: "Estado", value: selected.status },
                { label: "Prioridad", value: selected.priority },
                { label: "Fecha límite", value: selected.dueLabel },
                ...(selected.overdue && abierto(selected)
                  ? [{ label: "Atención", value: "Fuera de plazo", tone: "rose" as const }]
                  : []),
                ...(config.extraDetailRows?.(selected) ?? []),
              ]}
            />
          </BlockFrame>

          {config.extraPanel?.(selected)}
        </>
      )}

      <BlockFrame title="Acciones rápidas" icon="Zap">
        <QuickActionGrid
          actions={[
            { id: "tareas", icon: "ClipboardList", label: "Ver tareas", href: "/operaciones/tareas" },
            { id: "impl", icon: "Layers", label: "Implementaciones", href: "/operaciones/implementaciones" },
            { id: "cal", icon: "CalendarDays", label: "Calendario", href: "/operaciones/calendario" },
            { id: "panel", icon: "LayoutDashboard", label: "Panel", href: "/operaciones/dashboard" },
          ]}
        />
      </BlockFrame>
    </>
  );

  return (
    <PageShell
      title={config.title}
      description={config.description}
      icon={config.icon}
      starrable={false}
      sidePanel={sidePanel}
      blocks={{ items: blocks, onUpdate: updateBlock, onDelete: removeBlock, onAdd: composer.openFor }}
      headerActions={
        <>
          <Button variant="outline" size="sm" className="border-white/12 bg-white/[0.03] text-white/70 hover:bg-white/[0.06]">
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Exportar
          </Button>
          <Button className="border-0 bg-gradient-to-b from-[#f5da93] to-[#c98f1f] font-semibold text-[#241a05] hover:brightness-105">
            <Plus className="mr-1.5 h-4 w-4" />
            {config.newLabel}
          </Button>
        </>
      }
    >
      {items.loading ? (
        <div className="surface-card">
          <LoadingState />
        </div>
      ) : isEmpty ? (
        <div className="surface-card">
          <EmptyState
            icon={config.icon}
            title={config.emptyTitle}
            description={config.emptyDescription}
            actionLabel={config.newLabel}
            onAction={() => undefined}
          />
        </div>
      ) : (
        <>
          <KpiStrip
            layout="inline"
            items={[
              { id: "abiertos", label: "Abiertos", value: String(stats.abiertos), sub: "sin cerrar", icon: "Inbox", tone: "violet" },
              { id: "gestion", label: "En gestión", value: String(stats.gestion), sub: "en curso", icon: "Loader", tone: "blue" },
              { id: "espera", label: "En espera", value: String(stats.espera), sub: "de un tercero", icon: "Clock", tone: "amber" },
              { id: "atrasados", label: "Atrasados", value: String(stats.atrasados), sub: "fuera de plazo", icon: "TriangleAlert", tone: "rose" },
              ...(config.extraKpis?.(items.items) ?? [
                { id: "cerrados", label: "Resueltos", value: String(stats.cerrados), sub: "cerrados", icon: "CheckCircle2", tone: "emerald" as const },
              ]),
            ]}
          />

          <div className="surface-card mt-3 overflow-hidden">
            <div className="px-4 pt-3">
              <PageTabs tabs={TABS} active={tab} onChange={setTab} />
            </div>
            <div className="px-4 pb-4">
              <div className="mb-4">
                <FilterToolbar
                  search={search}
                  onSearchChange={setSearch}
                  searchPlaceholder={config.searchPlaceholder}
                  filters={[
                    { id: "process", label: "Proceso", options: [...new Set(items.items.map((i) => i.process))] },
                    { id: "owner", label: "Responsable", options: [...new Set(items.items.map((i) => i.owner))] },
                    { id: "priority", label: "Prioridad", options: ["Alta", "Media", "Baja"] },
                  ]}
                  values={filters}
                  onFilterChange={(id, value) => setFilters((f) => ({ ...f, [id]: value }))}
                />
              </div>

              <DataTable
                columns={columns}
                rows={rows}
                onView={(id) => setSelectedId(id)}
                onDeleteRow={(id) => items.remove(id)}
                emptyMessage="No hay elementos que coincidan con los filtros."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
            <BlockFrame title={config.breakdownTitle ?? "Reparto por proceso"} icon="PieChart">
              <DonutChart slices={porProceso} centerValue={String(items.items.length)} centerLabel="Total" />
            </BlockFrame>

            <BlockFrame title="Abiertos por prioridad" icon="BarChart4">
              <ColumnChart data={porPrioridad} categoryKey="prioridad" valueKey="total" color="#f59e0b" />
            </BlockFrame>
          </div>
        </>
      )}

      <AddBlockDialog {...composer.dialogProps} />
    </PageShell>
  );
}
