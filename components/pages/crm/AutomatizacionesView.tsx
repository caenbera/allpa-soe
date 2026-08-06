"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { PageShell, PageTabs } from "@/components/page-blocks/PageShell";
import { AddBlockDialog } from "@/components/page-blocks/AddBlockDialog";
import { useBlockComposer } from "@/components/page-blocks/use-block-composer";
import { BlockFrame } from "@/components/page-blocks/BlockFrame";
import { EmptyState, LoadingState } from "@/components/page-blocks/EmptyState";
import { FilterToolbar } from "@/components/page-blocks/blocks/FilterToolbar";
import { DataTable, type RowData } from "@/components/page-blocks/blocks/DataTable";
import { DonutChart } from "@/components/page-blocks/blocks/DonutChart";
import { StatTileList } from "@/components/page-blocks/blocks/StatTileList";
import { ActivityFeed } from "@/components/page-blocks/blocks/ActivityFeed";
import { Button } from "@/components/ui/button";
import { useContent } from "@/lib/use-content";
import { usePageConfig } from "@/lib/use-page-config";
import { CRM_COLLECTIONS, type CrmAutomation } from "@/lib/crm-types";

const TABS = [
  { value: "todas", label: "Todas" },
  { value: "activas", label: "Activas" },
  { value: "inactivas", label: "Inactivas" },
];

/** Icono representativo de cada tipo de automatización. */
const KIND_ICON: Record<string, string> = {
  Comunicación: "Mail",
  Recordatorio: "CalendarDays",
  Tarea: "CheckSquare",
  Organización: "Tag",
  Actualización: "Star",
  Alerta: "TriangleAlert",
  Asignación: "Users",
};

export function AutomatizacionesView() {
  const [tab, setTab] = useState("todas");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});

  const automations = useContent<CrmAutomation>(CRM_COLLECTIONS.automations);
  const { blocks, addBlock, updateBlock, removeBlock } = usePageConfig("/crm/automatizaciones");
  const composer = useBlockComposer(addBlock);

  const stats = useMemo(() => {
    const items = automations.items;
    const activas = items.filter((a) => a.active);
    /** El rendimiento se suma solo de las activas: las apagadas no producen nada. */
    const sumFor = (label: string) =>
      activas.filter((a) => a.performanceLabel === label).reduce((sum, a) => sum + a.performance, 0);
    return {
      total: items.length,
      activas: activas.length,
      inactivas: items.length - activas.length,
      contactos: sumFor("Contactos"),
      reuniones: sumFor("Reuniones"),
      tareas: sumFor("Tareas"),
      notificaciones: sumFor("Notificaciones"),
    };
  }, [automations.items]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return automations.items.filter((a) => {
      if (tab === "activas" && !a.active) return false;
      if (tab === "inactivas" && a.active) return false;
      if (filters.kind && filters.kind !== "Todos" && a.kind !== filters.kind) return false;
      if (filters.author && filters.author !== "Todos" && a.createdBy !== filters.author) return false;
      if (!q) return true;
      return `${a.name} ${a.description} ${a.trigger}`.toLowerCase().includes(q);
    });
  }, [automations.items, tab, search, filters]);

  const toggle = (automation: CrmAutomation, next: boolean) => {
    automations.update(automation.id, { active: next });
    toast.success(next ? `"${automation.name}" activada.` : `"${automation.name}" pausada.`);
  };

  const rows: RowData[] = filtered.map((a) => ({
    id: a.id,
    cells: {
      automation: { kind: "source", icon: KIND_ICON[a.kind] ?? "Zap", value: a.name, sub: a.description },
      kind: { kind: "badge", value: a.kind, tone: a.kindTone },
      trigger: { kind: "text", value: a.trigger, sub: a.triggerDetail },
      actions: { kind: "actionChain", steps: a.steps },
      state: { kind: "toggle", value: a.active, onChange: (next) => toggle(a, next) },
      performance: { kind: "stacked", value: a.performance.toLocaleString("es"), sub: a.performanceLabel },
      createdBy: { kind: "person", name: a.createdBy },
      createdAt: { kind: "text", value: a.createdAt },
    },
  }));

  const byState = [
    { id: "activas", label: "Activas", value: stats.activas, color: "#22c55e" },
    { id: "inactivas", label: "Inactivas", value: stats.inactivas, color: "#94a3b8" },
  ].filter((s) => s.value > 0);

  const templates = automations.items.slice(0, 5).map((a) => ({
    id: `tpl-${a.id}`,
    icon: KIND_ICON[a.kind] ?? "Zap",
    color: a.active ? "#22c55e" : "#94a3b8",
    title: a.name,
    detail: a.kind,
    timeLabel: a.active ? "Activa" : "Pausada",
  }));

  const isEmpty = !automations.loading && stats.total === 0;

  const sidePanel = (
    <>
      {!isEmpty && (
        <>
          <BlockFrame title="Resumen de automatizaciones" icon="PieChart">
            <DonutChart slices={byState} centerValue={String(stats.total)} centerLabel="Total" />
          </BlockFrame>

          <BlockFrame title="Rendimiento general" icon="TrendingUp">
            <StatTileList
              tiles={[
                { id: "contactos", icon: "Users", color: "#a78bfa", value: stats.contactos.toLocaleString("es"), label: "Contactos alcanzados", delta: "18.5%" },
                { id: "tareas", icon: "CheckSquare", color: "#e0a836", value: stats.tareas.toLocaleString("es"), label: "Tareas creadas", delta: "16.3%" },
                { id: "reuniones", icon: "CalendarDays", color: "#3b82f6", value: stats.reuniones.toLocaleString("es"), label: "Reuniones recordadas", delta: "22.1%" },
                { id: "notificaciones", icon: "Bell", color: "#22c55e", value: stats.notificaciones.toLocaleString("es"), label: "Notificaciones enviadas", delta: "12.7%" },
              ]}
            />
          </BlockFrame>

          <BlockFrame title="Plantillas populares" icon="Layers">
            <ActivityFeed entries={templates} compact />
          </BlockFrame>
        </>
      )}

    </>
  );

  return (
    <PageShell
      title="Automatizaciones"
      description="Crea, gestiona y monitorea automatizaciones para optimizar tus procesos y comunicaciones."
      icon="Zap"
      starrable={false}
      sidePanel={sidePanel}
      blocks={{ items: blocks, onUpdate: updateBlock, onDelete: removeBlock, onAdd: composer.openFor }}
      headerActions={
        <Button className="border-0 bg-gradient-to-b from-[#f5da93] to-[#c98f1f] font-semibold text-[#241a05] hover:brightness-105">
          <Plus className="mr-1.5 h-4 w-4" />
          Nueva automatización
        </Button>
      }
    >
      {automations.loading ? (
        <div className="surface-card">
          <LoadingState />
        </div>
      ) : isEmpty ? (
        <div className="surface-card">
          <EmptyState
            icon="Zap"
            title="Todavía no hay automatizaciones"
            description="Una automatización hace sola el trabajo repetitivo: enviar la bienvenida a un contacto nuevo, recordar una reunión, crear la tarea de seguimiento tras una propuesta. Cada una arranca con un disparador y encadena sus acciones."
            actionLabel="Nueva automatización"
            onAction={() => undefined}
          />
        </div>
      ) : (
        <div className="surface-card overflow-hidden">
          <div className="px-4 pt-3">
            <PageTabs tabs={TABS} active={tab} onChange={setTab} />
          </div>
          <div className="px-4 pb-4">
            <div className="mb-4">
              <FilterToolbar
                search={search}
                onSearchChange={setSearch}
                searchPlaceholder="Buscar automatizaciones…"
                filters={[
                  { id: "kind", label: "Tipo", options: [...new Set(automations.items.map((a) => a.kind))] },
                  { id: "author", label: "Creado por", options: [...new Set(automations.items.map((a) => a.createdBy))] },
                ]}
                values={filters}
                onFilterChange={(id, value) => setFilters((f) => ({ ...f, [id]: value }))}
              />
            </div>

            <DataTable
              columns={[
                { id: "automation", header: "Automatización", sortable: true, width: "260px" },
                { id: "kind", header: "Tipo", sortable: true, width: "130px" },
                { id: "trigger", header: "Disparador", sortable: true, width: "170px" },
                // "Flujo" y no "Acciones": la tabla ya reserva esa cabecera
                // para el menú de cada fila, y dos columnas iguales confunden.
                { id: "actions", header: "Flujo", width: "180px" },
                { id: "state", header: "Estado", sortable: true, width: "90px" },
                { id: "performance", header: "Rendimiento", sortable: true, width: "120px" },
                { id: "createdBy", header: "Creado por", sortable: true, width: "160px" },
                { id: "createdAt", header: "Fecha de creación", width: "140px" },
              ]}
              rows={rows}
              onDeleteRow={(id) => automations.remove(id)}
              emptyMessage="No hay automatizaciones que coincidan con los filtros."
            />
          </div>
        </div>
      )}

      <AddBlockDialog {...composer.dialogProps} />
    </PageShell>
  );
}
