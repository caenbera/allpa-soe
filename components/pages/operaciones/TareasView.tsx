"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { PageShell, PageTabs } from "@/components/page-blocks/PageShell";
import { AddBlockDialog } from "@/components/page-blocks/AddBlockDialog";
import { useBlockComposer } from "@/components/page-blocks/use-block-composer";
import { BlockFrame } from "@/components/page-blocks/BlockFrame";
import { EmptyState, LoadingState } from "@/components/page-blocks/EmptyState";
import { KpiStrip } from "@/components/page-blocks/blocks/KpiStrip";
import { FilterToolbar } from "@/components/page-blocks/blocks/FilterToolbar";
import { KanbanBoard } from "@/components/page-blocks/blocks/KanbanBoard";
import { DataTable, type RowData } from "@/components/page-blocks/blocks/DataTable";
import { AgendaList } from "@/components/page-blocks/blocks/AgendaList";
import { RankedBarList } from "@/components/page-blocks/blocks/RankedBarList";
import { StatTileList } from "@/components/page-blocks/blocks/StatTileList";
import { Button } from "@/components/ui/button";
import { useContent } from "@/lib/use-content";
import { usePageConfig } from "@/lib/use-page-config";
import {
  OPS_COLLECTIONS,
  PRIORITY_TONE,
  PROCESS_TONE,
  TASK_STAGES,
  type OpsTask,
  type Priority,
  type TaskStage,
} from "@/lib/ops-types";

const TABS = [
  { value: "kanban", label: "Kanban" },
  { value: "lista", label: "Lista" },
  { value: "mi-dia", label: "Mi día" },
  { value: "delegadas", label: "Delegadas" },
  { value: "todas", label: "Todas" },
];

/** Icono del tipo de acción, para la agenda del día. */
const KIND_ICON: Record<string, string> = {
  Llamada: "Phone",
  Email: "Mail",
  Reunión: "CalendarDays",
  Revisión: "ClipboardCheck",
};

const hoyIso = () => new Date().toISOString().slice(0, 10);

export function TareasView() {
  const [tab, setTab] = useState("kanban");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});

  const tasks = useContent<OpsTask>(OPS_COLLECTIONS.tasks);
  const { blocks, addBlock, updateBlock, removeBlock } = usePageConfig("/operaciones/tareas");
  const composer = useBlockComposer(addBlock);

  const hoy = hoyIso();

  const stats = useMemo(() => {
    const items = tasks.items;
    const abiertas = items.filter((t) => t.stage !== "completada");
    return {
      hoy: abiertas.filter((t) => t.dueDate === hoy).length,
      semana: abiertas.filter((t) => t.dueDate >= hoy).length,
      atrasadas: abiertas.filter((t) => t.overdue).length,
      espera: items.filter((t) => t.stage === "en-espera").length,
      completadas: items.filter((t) => t.stage === "completada").length,
      delegadas: items.filter((t) => t.stage === "delegada").length,
    };
  }, [tasks.items, hoy]);

  /** Porcentaje medio de subtareas resueltas entre las tareas que las tienen. */
  const cargaEquipo = useMemo(() => {
    const porPersona = new Map<string, { done: number; total: number }>();
    tasks.items.forEach((t) => {
      const quien = t.delegatedTo || t.owner;
      if (!quien) return;
      const prev = porPersona.get(quien) ?? { done: 0, total: 0 };
      porPersona.set(quien, {
        done: prev.done + (t.stage === "completada" ? 1 : 0),
        total: prev.total + 1,
      });
    });
    return Array.from(porPersona.entries())
      .sort((a, b) => b[1].total - a[1].total)
      .map(([label, { done, total }], i) => ({
        id: label,
        label,
        value: total > 0 ? Math.round((done / total) * 100) : 0,
        color: ["#a78bfa", "#22c55e", "#3b82f6", "#e0a836", "#f472b6"][i % 5],
        person: true,
      }));
  }, [tasks.items]);

  const porPrioridad = useMemo(() => {
    const abiertas = tasks.items.filter((t) => t.stage !== "completada");
    const cuenta = (p: Priority) => abiertas.filter((t) => t.priority === p).length;
    return [
      { id: "alta", icon: "Flame", color: "#f43f5e", value: String(cuenta("Alta")), label: "Alta prioridad" },
      { id: "media", icon: "Circle", color: "#f59e0b", value: String(cuenta("Media")), label: "Prioridad media" },
      { id: "baja", icon: "Circle", color: "#3b82f6", value: String(cuenta("Baja")), label: "Prioridad baja" },
    ];
  }, [tasks.items]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tasks.items.filter((t) => {
      if (tab === "mi-dia" && t.dueDate !== hoy) return false;
      if (tab === "delegadas" && t.stage !== "delegada") return false;
      if (filters.process && filters.process !== "Todos" && t.process !== filters.process) return false;
      if (filters.owner && filters.owner !== "Todos" && (t.delegatedTo || t.owner) !== filters.owner) return false;
      if (filters.priority && filters.priority !== "Todas" && t.priority !== filters.priority) return false;
      if (!q) return true;
      return `${t.title} ${t.client} ${t.process}`.toLowerCase().includes(q);
    });
  }, [tasks.items, tab, hoy, search, filters]);

  /** Las acciones del día, ordenadas por hora. */
  const agenda = useMemo(
    () =>
      tasks.items
        .filter((t) => t.dueDate === hoy && t.stage !== "completada")
        .sort((a, b) => a.time.localeCompare(b.time))
        .map((t) => ({
          id: t.id,
          time: t.time,
          title: t.title,
          done: false,
          priority: t.priority,
          priorityTone: PRIORITY_TONE[t.priority],
          tag: t.process,
          tagTone: PROCESS_TONE[t.process] ?? "neutral",
          person: t.delegatedTo || t.owner,
          kindIcon: KIND_ICON[t.kind] ?? "CircleDot",
          kindLabel: t.kind,
        })),
    [tasks.items, hoy]
  );

  const rows: RowData[] = filtered.map((t) => ({
    id: t.id,
    cells: {
      task: { kind: "text", value: t.title, sub: t.client, strong: true },
      process: { kind: "badge", value: t.process, tone: PROCESS_TONE[t.process] ?? "neutral" },
      owner: { kind: "person", name: t.delegatedTo || t.owner },
      priority: { kind: "badge", value: t.priority, tone: PRIORITY_TONE[t.priority] },
      stage: {
        kind: "status",
        value: TASK_STAGES.find((s) => s.id === t.stage)?.name ?? t.stage,
        tone: t.stage === "completada" ? "emerald" : t.stage === "en-espera" ? "amber" : "blue",
      },
      due: { kind: "dateWithSub", value: t.dueLabel, sub: t.overdue ? "Atrasada" : t.kind, urgent: t.overdue },
      progress:
        t.subtasksTotal > 0
          ? { kind: "progress", value: Math.round((t.subtasksDone / t.subtasksTotal) * 100), label: `${t.subtasksDone}/${t.subtasksTotal}` }
          : { kind: "text", value: "—" },
    },
  }));

  const mover = (taskId: string, toStage: string) => {
    const destino = TASK_STAGES.find((s) => s.id === toStage);
    tasks.update(taskId, { stage: toStage as TaskStage });
    toast.success(`Movida a ${destino?.name ?? toStage}.`);
  };

  const isEmpty = !tasks.loading && tasks.items.length === 0;

  const sidePanel = isEmpty ? null : (
    <>
      <BlockFrame title="Prioridades" icon="Flame">
        <StatTileList tiles={porPrioridad} />
      </BlockFrame>

      <BlockFrame title="Carga del equipo" icon="Users">
        <RankedBarList rows={cargaEquipo} formatValue={(n) => `${n}%`} />
      </BlockFrame>

      <BlockFrame title="Filtros rápidos" icon="Filter">
        <StatTileList
          tiles={[
            { id: "hoy", icon: "CalendarDays", color: "#a78bfa", value: String(stats.hoy), label: "Vencen hoy" },
            { id: "atrasadas", icon: "TriangleAlert", color: "#f43f5e", value: String(stats.atrasadas), label: "Atrasadas" },
            { id: "espera", icon: "Clock", color: "#f59e0b", value: String(stats.espera), label: "En espera" },
            { id: "delegadas", icon: "Users", color: "#3b82f6", value: String(stats.delegadas), label: "Delegadas" },
          ]}
        />
      </BlockFrame>
    </>
  );

  return (
    <PageShell
      title="Tareas"
      description="Administra y ejecuta las tareas operativas de tu equipo."
      icon="ClipboardList"
      starrable={false}
      sidePanel={sidePanel}
      blocks={{ items: blocks, onUpdate: updateBlock, onDelete: removeBlock, onAdd: composer.openFor }}
      headerActions={
        <Button className="border-0 bg-gradient-to-b from-[#f5da93] to-[#c98f1f] font-semibold text-[#241a05] hover:brightness-105">
          <Plus className="mr-1.5 h-4 w-4" />
          Nueva tarea
        </Button>
      }
    >
      {tasks.loading ? (
        <div className="surface-card">
          <LoadingState />
        </div>
      ) : isEmpty ? (
        <div className="surface-card">
          <EmptyState
            icon="ClipboardList"
            title="Todavía no hay tareas"
            description="Aquí vive el trabajo del día: lo que hay que hacer, quién lo lleva y para cuándo. Las tareas también se crean solas desde los checklists de cada implementación."
            actionLabel="Nueva tarea"
            onAction={() => undefined}
          />
        </div>
      ) : (
        <>
          <KpiStrip
            layout="inline"
            items={[
              { id: "hoy", label: "Hoy", value: String(stats.hoy), sub: "tareas", icon: "CalendarDays", tone: "violet" },
              { id: "semana", label: "Esta semana", value: String(stats.semana), sub: "tareas", icon: "CalendarRange", tone: "blue" },
              { id: "atrasadas", label: "Atrasadas", value: String(stats.atrasadas), sub: "requieren atención", icon: "TriangleAlert", tone: "rose" },
              { id: "espera", label: "En espera", value: String(stats.espera), sub: "tareas", icon: "Clock", tone: "amber" },
              { id: "completadas", label: "Completadas", value: String(stats.completadas), sub: "esta semana", icon: "CheckCircle2", tone: "emerald" },
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
                  searchPlaceholder="Buscar tareas…"
                  filters={[
                    { id: "process", label: "Proceso", options: [...new Set(tasks.items.map((t) => t.process))] },
                    { id: "owner", label: "Responsable", options: [...new Set(tasks.items.map((t) => t.delegatedTo || t.owner))] },
                    { id: "priority", label: "Prioridad", options: ["Alta", "Media", "Baja"] },
                  ]}
                  values={filters}
                  onFilterChange={(id, value) => setFilters((f) => ({ ...f, [id]: value }))}
                />
              </div>

              {tab === "kanban" ? (
                <KanbanBoard
                  columns={TASK_STAGES.map((s) => ({ id: s.id, name: s.name, color: s.color }))}
                  cards={filtered.map((t) => ({
                    id: t.id,
                    columnId: t.stage,
                    title: t.title,
                    subtitle: t.client,
                    tag: t.process,
                    tagTone: PROCESS_TONE[t.process] ?? "neutral",
                    priority: t.priority,
                    priorityTone: PRIORITY_TONE[t.priority],
                    owner: t.delegatedTo || t.owner,
                    timeLabel: t.dueLabel,
                    overdue: t.overdue,
                    waitingOn: t.stage === "en-espera" ? "Respuesta" : undefined,
                    footnote: t.completedNote || undefined,
                    ...(t.subtasksTotal > 0
                      ? {
                          progress: Math.round((t.subtasksDone / t.subtasksTotal) * 100),
                          progressLabel: `Subtarea ${t.subtasksDone} de ${t.subtasksTotal}`,
                        }
                      : {}),
                  }))}
                  onMove={mover}
                />
              ) : (
                <DataTable
                  columns={[
                    { id: "task", header: "Tarea", sortable: true },
                    { id: "process", header: "Proceso", sortable: true, width: "160px" },
                    { id: "owner", header: "Responsable", sortable: true, width: "160px" },
                    { id: "priority", header: "Prioridad", sortable: true, width: "110px" },
                    { id: "stage", header: "Estado", sortable: true, width: "130px" },
                    { id: "due", header: "Vence", sortable: true, width: "130px" },
                    { id: "progress", header: "Subtareas", width: "150px" },
                  ]}
                  rows={rows}
                  onDeleteRow={(id) => tasks.remove(id)}
                  emptyMessage="No hay tareas que coincidan con los filtros."
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
            <BlockFrame title="Próximas acciones (Hoy)" icon="ListChecks">
              <AgendaList entries={agenda} />
            </BlockFrame>

            <BlockFrame title="Carga de trabajo del equipo" icon="Users">
              <RankedBarList rows={cargaEquipo} formatValue={(n) => `${n}%`} />
            </BlockFrame>
          </div>
        </>
      )}

      <AddBlockDialog {...composer.dialogProps} />
    </PageShell>
  );
}
