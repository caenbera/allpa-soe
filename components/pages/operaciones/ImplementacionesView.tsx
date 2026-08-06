"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
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
import { DonutChart, DONUT_COLORS } from "@/components/page-blocks/blocks/DonutChart";
import { RankedBarList } from "@/components/page-blocks/blocks/RankedBarList";
import { MetricDeltaList } from "@/components/page-blocks/blocks/MetricDeltaList";
import { ScoreRing } from "@/components/page-blocks/blocks/ScoreRing";
import { InfoCard } from "@/components/page-blocks/blocks/InfoCard";
import { AgendaList } from "@/components/page-blocks/blocks/AgendaList";
import { Button } from "@/components/ui/button";
import { useContent } from "@/lib/use-content";
import { usePageConfig } from "@/lib/use-page-config";
import { checklistPath } from "@/lib/page-registry";
import {
  IMPLEMENTATION_STAGES,
  OPS_COLLECTIONS,
  PRIORITY_TONE,
  PROCESS_TONE,
  type Implementation,
  type ImplementationStage,
} from "@/lib/ops-types";

const TABS = [
  { value: "kanban", label: "Kanban" },
  { value: "lista", label: "Lista" },
  { value: "calendario", label: "Calendario" },
  { value: "carga", label: "Carga de trabajo" },
];

export function ImplementacionesView() {
  const [tab, setTab] = useState("kanban");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const implementations = useContent<Implementation>(OPS_COLLECTIONS.implementations);
  const { blocks, addBlock, updateBlock, removeBlock } = usePageConfig("/operaciones/implementaciones");
  const composer = useBlockComposer(addBlock);

  const stats = useMemo(() => {
    const items = implementations.items;
    const abiertas = items.filter((i) => i.stage !== "completado");
    /**
     * Ciclo medio de las cerradas, en pasos completados por día: no hay marcas
     * de tiempo reales, así que se estima con los días transcurridos.
     */
    const completadas = items.filter((i) => i.stage === "completado");
    return {
      enCurso: items.filter((i) => i.stage === "en-proceso" || i.stage === "revision").length,
      enEspera: items.filter((i) => i.stage === "en-espera").length,
      atrasadas: abiertas.filter((i) => i.phases.some((f) => f.steps.some((s) => s.overdue))).length,
      completadas: completadas.length,
      progresoMedio:
        abiertas.length > 0 ? Math.round(abiertas.reduce((sum, i) => sum + i.progress, 0) / abiertas.length) : 0,
    };
  }, [implementations.items]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return implementations.items.filter((i) => {
      if (filters.process && filters.process !== "Todos" && i.process !== filters.process) return false;
      if (filters.owner && filters.owner !== "Todos" && i.owner !== filters.owner) return false;
      if (filters.priority && filters.priority !== "Todas" && i.priority !== filters.priority) return false;
      if (!q) return true;
      return `${i.client} ${i.process} ${i.code}`.toLowerCase().includes(q);
    });
  }, [implementations.items, search, filters]);

  const cargaEquipo = useMemo(() => {
    const porPersona = new Map<string, number>();
    implementations.items
      .filter((i) => i.stage !== "completado")
      .forEach((i) => porPersona.set(i.owner, (porPersona.get(i.owner) ?? 0) + 1));
    return Array.from(porPersona.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([label, value], i) => ({ id: label, label, value, color: DONUT_COLORS[i % DONUT_COLORS.length], person: true }));
  }, [implementations.items]);

  const porProceso = useMemo(() => {
    const counts = new Map<string, number>();
    implementations.items.forEach((i) => counts.set(i.process, (counts.get(i.process) ?? 0) + 1));
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([label, value], i) => ({ id: label, label, value, color: DONUT_COLORS[i % DONUT_COLORS.length] }));
  }, [implementations.items]);

  /** Cuántos pasos le faltan de media a cada proceso: cuanto menos, mejor. */
  const pasosRestantes = useMemo(() => {
    const porProc = new Map<string, { restantes: number; n: number }>();
    implementations.items
      .filter((i) => i.stage !== "completado")
      .forEach((i) => {
        const prev = porProc.get(i.process) ?? { restantes: 0, n: 0 };
        porProc.set(i.process, { restantes: prev.restantes + (i.totalSteps - i.currentStep + 1), n: prev.n + 1 });
      });
    return Array.from(porProc.entries())
      .sort((a, b) => b[1].restantes / b[1].n - a[1].restantes / a[1].n)
      .map(([label, { restantes, n }]) => ({
        id: label,
        label,
        value: `${Math.round(restantes / n)} pasos`,
        lowerIsBetter: true,
      }));
  }, [implementations.items]);

  const rows: RowData[] = filtered.map((i) => ({
    id: i.id,
    cells: {
      impl: { kind: "text", value: i.process, sub: `${i.client} · ${i.code}`, strong: true },
      owner: { kind: "person", name: i.owner },
      stage: {
        kind: "status",
        value: IMPLEMENTATION_STAGES.find((s) => s.id === i.stage)?.name ?? i.stage,
        tone: i.stage === "completado" ? "emerald" : i.stage === "en-espera" ? "amber" : "blue",
      },
      priority: { kind: "badge", value: i.priority, tone: PRIORITY_TONE[i.priority] },
      progress: { kind: "progress", value: i.progress, label: `${i.currentStep}/${i.totalSteps}` },
      start: { kind: "text", value: i.startDate },
      end: { kind: "dateWithSub", value: i.estimatedEndDate, sub: i.completedAt ? "Cerrada" : "Estimada", urgent: false },
    },
  }));

  const selected = implementations.items.find((i) => i.id === selectedId) ?? filtered[0] ?? null;

  const mover = (id: string, toStage: string) => {
    const destino = IMPLEMENTATION_STAGES.find((s) => s.id === toStage);
    implementations.update(id, { stage: toStage as ImplementationStage });
    toast.success(`Movida a ${destino?.name ?? toStage}.`);
  };

  const isEmpty = !implementations.loading && implementations.items.length === 0;

  const sidePanel = isEmpty ? null : (
    <>
      {selected && (
        <>
          <BlockFrame title="Detalle de la implementación" icon="Layers">
            <div className="mb-3 flex items-center gap-3">
              <ScoreRing value={selected.progress} size={56} />
              <div className="min-w-0">
                <p className="truncate font-semibold text-[#f3ecd9]">{selected.process}</p>
                <p className="truncate text-xs text-white/45">
                  {selected.client} · {selected.code}
                </p>
              </div>
            </div>
            <InfoCard
              rows={[
                { label: "Asesor responsable", value: selected.owner, person: true },
                { label: "Fecha de inicio", value: selected.startDate },
                { label: "Fin estimado", value: selected.estimatedEndDate },
                { label: "Paso actual", value: `${selected.currentStep} de ${selected.totalSteps}` },
                { label: "Prioridad", value: selected.priority },
                ...(selected.waitingOn ? [{ label: "En espera de", value: selected.waitingOn }] : []),
              ]}
            />
            <Link
              href={checklistPath(selected.id)}
              className="mt-3 flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-gradient-to-b from-[#f5da93] to-[#c98f1f] text-sm font-semibold text-[#241a05] transition-all hover:brightness-105"
            >
              Ver checklist completo
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </BlockFrame>

          {selected.nextSteps.length > 0 && (
            <BlockFrame title="Próximos pasos" icon="ListChecks">
              <ol className="space-y-2.5">
                {selected.nextSteps.map((paso, i) => (
                  <li key={paso} className="flex items-start gap-2.5 text-sm text-white/70">
                    <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[var(--allpa-gold-400)]/15 text-[10px] font-bold text-[var(--allpa-gold-300)]">
                      {i + 1}
                    </span>
                    {paso}
                  </li>
                ))}
              </ol>
            </BlockFrame>
          )}

          {selected.pendingDocuments.length > 0 && (
            <BlockFrame title="Documentos pendientes" icon="FileText">
              <AgendaList
                entries={selected.pendingDocuments.map((d, i) => ({
                  id: `${selected.id}-doc-${i}`,
                  time: "",
                  title: d.title,
                  done: false,
                  tag: d.detail,
                  tagTone: "amber",
                }))}
              />
            </BlockFrame>
          )}
        </>
      )}
    </>
  );

  return (
    <PageShell
      title="Implementaciones"
      description="Centro de ejecución de procesos y entregas. Gestiona cada implementación de principio a fin."
      icon="Layers"
      starrable={false}
      sidePanel={sidePanel}
      blocks={{ items: blocks, onUpdate: updateBlock, onDelete: removeBlock, onAdd: composer.openFor }}
      headerActions={
        <Button className="border-0 bg-gradient-to-b from-[#f5da93] to-[#c98f1f] font-semibold text-[#241a05] hover:brightness-105">
          <Plus className="mr-1.5 h-4 w-4" />
          Nueva implementación
        </Button>
      }
    >
      {implementations.loading ? (
        <div className="surface-card">
          <LoadingState />
        </div>
      ) : isEmpty ? (
        <div className="surface-card">
          <EmptyState
            icon="Layers"
            title="Todavía no hay implementaciones"
            description="Una implementación es el recorrido completo de un cliente por un proceso, del diagnóstico a la entrega. Cada una lleva su checklist por fases y avanza sola conforme se marcan los pasos."
            actionLabel="Nueva implementación"
            onAction={() => undefined}
          />
        </div>
      ) : (
        <>
          <KpiStrip
            layout="inline"
            items={[
              { id: "curso", label: "En curso", value: String(stats.enCurso), sub: "activas ahora", icon: "Loader", tone: "blue" },
              { id: "espera", label: "En espera", value: String(stats.enEspera), sub: "documentos o terceros", icon: "Clock", tone: "amber" },
              { id: "atrasadas", label: "Con pasos atrasados", value: String(stats.atrasadas), sub: "requieren atención", icon: "TriangleAlert", tone: "rose" },
              { id: "completadas", label: "Completadas", value: String(stats.completadas), sub: "cerradas", icon: "CheckCircle2", tone: "emerald" },
              { id: "progreso", label: "Progreso medio", value: `${stats.progresoMedio}%`, sub: "de las abiertas", icon: "TrendingUp", tone: "gold", ring: stats.progresoMedio },
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
                  searchPlaceholder="Buscar implementaciones, clientes o procesos…"
                  filters={[
                    { id: "process", label: "Proceso", options: [...new Set(implementations.items.map((i) => i.process))] },
                    { id: "owner", label: "Asesor", options: [...new Set(implementations.items.map((i) => i.owner))] },
                    { id: "priority", label: "Prioridad", options: ["Alta", "Media", "Baja"] },
                  ]}
                  values={filters}
                  onFilterChange={(id, value) => setFilters((f) => ({ ...f, [id]: value }))}
                />
              </div>

              {tab === "kanban" && (
                <KanbanBoard
                  columns={IMPLEMENTATION_STAGES.map((s) => ({ id: s.id, name: s.name, color: s.color }))}
                  cards={filtered.map((i) => ({
                    id: i.id,
                    columnId: i.stage,
                    title: i.process,
                    subtitle: i.client,
                    priority: i.priority,
                    priorityTone: PRIORITY_TONE[i.priority],
                    owner: i.owner,
                    progress: i.progress,
                    progressLabel: `Paso ${i.currentStep} de ${i.totalSteps}`,
                    waitingOn: i.waitingOn || undefined,
                    timeLabel: i.completedAt ? `Completada el ${i.completedAt}` : i.estimatedEndDate,
                  }))}
                  onMove={mover}
                />
              )}

              {tab === "lista" && (
                <DataTable
                  columns={[
                    { id: "impl", header: "Implementación", sortable: true },
                    { id: "owner", header: "Asesor", sortable: true, width: "150px" },
                    { id: "stage", header: "Etapa", sortable: true, width: "150px" },
                    { id: "priority", header: "Prioridad", sortable: true, width: "110px" },
                    { id: "progress", header: "Progreso", sortable: true, width: "160px" },
                    { id: "start", header: "Inicio", width: "110px" },
                    { id: "end", header: "Fin estimado", width: "130px" },
                  ]}
                  rows={rows}
                  onView={(id) => setSelectedId(id)}
                  emptyMessage="No hay implementaciones que coincidan con los filtros."
                />
              )}

              {tab === "calendario" && (
                <AgendaList
                  entries={[...filtered]
                    .filter((i) => i.stage !== "completado")
                    .sort((a, b) => a.estimatedEndDate.localeCompare(b.estimatedEndDate))
                    .map((i) => ({
                      id: i.id,
                      time: i.estimatedEndDate,
                      title: `${i.process} — ${i.client}`,
                      done: false,
                      priority: i.priority,
                      priorityTone: PRIORITY_TONE[i.priority],
                      tag: `Paso ${i.currentStep}/${i.totalSteps}`,
                      tagTone: PROCESS_TONE[i.process] ?? "neutral",
                      person: i.owner,
                    }))}
                />
              )}

              {tab === "carga" && (
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                  <div>
                    <p className="mb-2.5 text-sm font-medium text-[#f3ecd9]">Implementaciones abiertas por asesor</p>
                    <RankedBarList rows={cargaEquipo} />
                  </div>
                  <div>
                    <p className="mb-2.5 text-sm font-medium text-[#f3ecd9]">Pasos que faltan de media</p>
                    <MetricDeltaList rows={pasosRestantes} />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
            <BlockFrame title="Procesos más activos" icon="PieChart">
              <DonutChart
                slices={porProceso}
                centerValue={String(implementations.items.length)}
                centerLabel="Total"
              />
            </BlockFrame>

            <BlockFrame title="Carga de trabajo del equipo" icon="Users">
              <RankedBarList rows={cargaEquipo} />
            </BlockFrame>
          </div>
        </>
      )}

      <AddBlockDialog {...composer.dialogProps} />
    </PageShell>
  );
}
