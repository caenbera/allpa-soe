"use client";

import { useMemo, useState } from "react";
import { Download, Plus } from "lucide-react";
import { toast } from "sonner";
import { PageShell, PageTabs } from "@/components/page-blocks/PageShell";
import { AddBlockDialog } from "@/components/page-blocks/AddBlockDialog";
import { useBlockComposer } from "@/components/page-blocks/use-block-composer";
import { BlockFrame } from "@/components/page-blocks/BlockFrame";
import { EmptyState, LoadingState } from "@/components/page-blocks/EmptyState";
import { StatTileList } from "@/components/page-blocks/blocks/StatTileList";
import { FilterToolbar } from "@/components/page-blocks/blocks/FilterToolbar";
import { DataTable, type Cell, type ColumnDef } from "@/components/page-blocks/blocks/DataTable";
import { DonutChart } from "@/components/page-blocks/blocks/DonutChart";
import { QuickActionGrid, type QuickAction } from "@/components/page-blocks/blocks/QuickActionGrid";
import { Button } from "@/components/ui/button";
import { useContent } from "@/lib/use-content";
import { usePageConfig } from "@/lib/use-page-config";
import type { CatalogStatus, SolCollection } from "@/lib/solution-types";

/** Lo mínimo que comparten los tres catálogos del módulo. */
export interface CatalogItem {
  id: string;
  name: string;
  status: CatalogStatus;
  updatedAt: string;
  order: number;
}

const TABS = [
  { value: "todos", label: "Todos" },
  { value: "Activo", label: "Activos" },
  { value: "Borrador", label: "Borradores" },
  { value: "Archivado", label: "Archivados" },
];

export interface CatalogoConfig<T extends CatalogItem> {
  title: string;
  description: string;
  icon: string;
  /** Ruta de la página, para guardar sus bloques. */
  path: string;
  collection: SolCollection;
  newLabel: string;
  searchPlaceholder: string;
  emptyTitle: string;
  emptyDescription: string;
  /** Etiqueta del elemento en plural, para el resumen ("rutas", "componentes"). */
  unit: string;
  /** Icono de la tarjeta de total del panel. */
  unitIcon: string;
  /** Columnas de la tabla y las celdas de cada fila. */
  columns: ColumnDef[];
  cells: (item: T) => Record<string, Cell>;
  /** Campos por los que busca la caja de búsqueda. */
  searchIn: (item: T) => string[];
  /** Filtros desplegables: etiqueta, opciones y de qué campo salen. */
  filters?: { id: string; label: string; valueOf: (item: T) => string }[];
  /** Reparto del gráfico de dona del panel. */
  breakdownTitle: string;
  breakdown: (items: T[]) => { id: string; label: string; value: number; color: string }[];
  /** Bloques propios del panel, bajo la dona. */
  extraPanel?: (items: T[]) => React.ReactNode;
  quickActions: QuickAction[];
}

/**
 * Armazón común de los catálogos de Soluciones —rutas de cliente,
 * componentes y casos de uso—.
 *
 * Las tres pantallas comparten forma: pestañas por estado de publicación,
 * buscador con filtros, tabla y un panel con el resumen, un reparto en dona y
 * las acciones rápidas. Se escribe una vez y cada página aporta sus columnas,
 * sus filtros y su reparto, en vez de repetir tres veces el mismo esqueleto.
 */
export function CatalogoView<T extends CatalogItem>({ config }: { config: CatalogoConfig<T> }) {
  const data = useContent<T>(config.collection);
  const { blocks, addBlock, updateBlock, removeBlock } = usePageConfig(config.path);
  const composer = useBlockComposer(addBlock);

  const [tab, setTab] = useState("todos");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});

  const items = useMemo(() => [...data.items].sort((a, b) => a.order - b.order), [data.items]);

  const visibles = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((item) => {
      if (tab !== "todos" && item.status !== tab) return false;
      for (const f of config.filters ?? []) {
        if (filters[f.id] && f.valueOf(item) !== filters[f.id]) return false;
      }
      if (!q) return true;
      return config.searchIn(item).some((campo) => campo.toLowerCase().includes(q));
    });
  }, [items, tab, filters, search, config]);

  const cuenta = (estado: string) => (estado === "todos" ? items.length : items.filter((i) => i.status === estado).length);

  const resumen = useMemo(
    () => [
      { id: "total", icon: config.unitIcon, color: "#a78bfa", value: String(items.length), label: `Total de ${config.unit}` },
      { id: "activos", icon: "CheckCircle2", color: "#22c55e", value: String(cuenta("Activo")), label: "Activos" },
      { id: "borradores", icon: "PenLine", color: "#e0a836", value: String(cuenta("Borrador")), label: "Borradores" },
      { id: "archivados", icon: "Archive", color: "#64748b", value: String(cuenta("Archivado")), label: "Archivados" },
    ],
    // `cuenta` se recalcula con `items`, así que no hace falta en la lista.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items, config.unit, config.unitIcon]
  );

  const reparto = useMemo(() => config.breakdown(items), [items, config]);

  const sidePanel = (
    <>
      <BlockFrame title={`Resumen de ${config.unit}`} icon="ClipboardList">
        <StatTileList tiles={resumen} columns={2} />
      </BlockFrame>

      <BlockFrame title={config.breakdownTitle} icon="PieChart">
        {reparto.length === 0 ? (
          <p className="py-4 text-center text-sm text-white/35">Todavía no hay datos que repartir.</p>
        ) : (
          <DonutChart slices={reparto} centerValue={String(items.length)} centerLabel="Total" />
        )}
      </BlockFrame>

      {config.extraPanel?.(items)}

      <BlockFrame title="Acciones rápidas" icon="Zap">
        <QuickActionGrid
          layout="list"
          columns={1}
          actions={config.quickActions}
          onSelect={() => toast.info("Esta acción llega con el editor del catálogo.")}
        />
      </BlockFrame>
    </>
  );

  return (
    <PageShell
      title={config.title}
      description={config.description}
      icon={config.icon}
      sidePanel={sidePanel}
      blocks={{ items: blocks, onUpdate: updateBlock, onDelete: removeBlock, onAdd: composer.openFor }}
      headerActions={
        <>
          <Button
            variant="outline"
            size="sm"
            className="border-white/12 bg-white/[0.03] text-white/70 hover:bg-white/[0.06]"
            onClick={() => toast.info("Importar llegará con el editor del catálogo.")}
          >
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Importar
          </Button>
          <Button size="sm" onClick={() => toast.info("Crear llegará con el editor del catálogo.")}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            {config.newLabel}
          </Button>
        </>
      }
    >
      <PageTabs tabs={TABS.map((t) => ({ ...t, label: `${t.label} (${cuenta(t.value)})` }))} active={tab} onChange={setTab} />

      {data.loading ? (
        <div className="surface-card">
          <LoadingState />
        </div>
      ) : items.length === 0 ? (
        <div className="surface-card">
          <EmptyState icon={config.icon} title={config.emptyTitle} description={config.emptyDescription} />
        </div>
      ) : (
        <BlockFrame title={config.title} icon={config.icon}>
          <FilterToolbar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder={config.searchPlaceholder}
            filters={(config.filters ?? []).map((f) => ({
              id: f.id,
              label: f.label,
              options: [...new Set(items.map(f.valueOf))].sort(),
            }))}
            values={filters}
            onFilterChange={(id, value) => setFilters((prev) => ({ ...prev, [id]: value }))}
          />

          {visibles.length === 0 ? (
            <EmptyState
              icon="SearchX"
              title="Nada coincide"
              description="Prueba con otro término o quita alguno de los filtros."
            />
          ) : (
            // `DataTable` ya lleva su propio pie con la paginación; añadir aquí
            // otro contador dejaba dos cifras distintas hablando de lo mismo.
            <DataTable columns={config.columns} rows={visibles.map((item) => ({ id: item.id, cells: config.cells(item) }))} />
          )}
        </BlockFrame>
      )}

      <AddBlockDialog {...composer.dialogProps} />
    </PageShell>
  );
}
