"use client";

import { useMemo } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { PageShell } from "@/components/page-blocks/PageShell";
import { AddBlockDialog } from "@/components/page-blocks/AddBlockDialog";
import { useBlockComposer } from "@/components/page-blocks/use-block-composer";
import { BlockFrame } from "@/components/page-blocks/BlockFrame";
import { EmptyState, LoadingState } from "@/components/page-blocks/EmptyState";
import { KpiStrip } from "@/components/page-blocks/blocks/KpiStrip";
import { KanbanBoard } from "@/components/page-blocks/blocks/KanbanBoard";
import { AgendaList } from "@/components/page-blocks/blocks/AgendaList";
import { StatTileList } from "@/components/page-blocks/blocks/StatTileList";
import { ActivityFeed } from "@/components/page-blocks/blocks/ActivityFeed";
import { QuickActionGrid } from "@/components/page-blocks/blocks/QuickActionGrid";
import { Button } from "@/components/ui/button";
import { useContent } from "@/lib/use-content";
import { usePageConfig } from "@/lib/use-page-config";
import {
  OPS_COLLECTIONS,
  PRIORITY_TONE,
  PROCESS_TONE,
  TASK_STAGES,
  type Implementation,
  type OpsDocument,
  type OpsRenewal,
  type OpsReview,
  type OpsSignature,
  type OpsTask,
  type TaskStage,
} from "@/lib/ops-types";

const KIND_ICON: Record<string, string> = {
  Llamada: "Phone",
  Email: "Mail",
  Reunión: "CalendarDays",
  Revisión: "ClipboardCheck",
};

/** El tablero del panel principal resume: las delegadas no salen aquí. */
const BOARD_STAGES = TASK_STAGES.filter((s) => s.id !== "delegada");

const hoyIso = () => new Date().toISOString().slice(0, 10);

function saludo(): string {
  const h = new Date().getHours();
  if (h < 12) return "Buenos días";
  if (h < 20) return "Buenas tardes";
  return "Buenas noches";
}

export function OperacionesDashboardView() {
  const tasks = useContent<OpsTask>(OPS_COLLECTIONS.tasks);
  const implementations = useContent<Implementation>(OPS_COLLECTIONS.implementations);
  const documents = useContent<OpsDocument>(OPS_COLLECTIONS.documents);
  const signatures = useContent<OpsSignature>(OPS_COLLECTIONS.signatures);
  const reviews = useContent<OpsReview>(OPS_COLLECTIONS.reviews);
  const renewals = useContent<OpsRenewal>(OPS_COLLECTIONS.renewals);

  const { blocks, addBlock, updateBlock, removeBlock } = usePageConfig("/operaciones/dashboard");
  const composer = useBlockComposer(addBlock);

  const hoy = hoyIso();

  const loading =
    tasks.loading || implementations.loading || documents.loading || signatures.loading || reviews.loading || renewals.loading;

  const stats = useMemo(() => {
    const abiertas = tasks.items.filter((t) => t.stage !== "completada");
    const pendiente = (estado: string) => estado !== "Resuelto" && estado !== "Completado";
    return {
      tareasHoy: abiertas.filter((t) => t.dueDate === hoy).length,
      implementacionesActivas: implementations.items.filter((i) => i.stage !== "completado").length,
      firmas: signatures.items.filter((s) => pendiente(s.status)).length,
      documentos: documents.items.filter((d) => pendiente(d.status)).length,
      revisiones: reviews.items.filter((r) => pendiente(r.status)).length,
      detenidas: implementations.items.filter((i) => i.stage === "en-espera").length,
    };
  }, [tasks.items, implementations.items, signatures.items, documents.items, reviews.items, hoy]);

  /**
   * Cumplimiento a partir de lo que hay: qué proporción del trabajo abierto no
   * está atrasado. Es una medida real, no una constante.
   */
  const sla = useMemo(() => {
    const abiertas = tasks.items.filter((t) => t.stage !== "completada");
    if (abiertas.length === 0) return 100;
    return Math.round(((abiertas.length - abiertas.filter((t) => t.overdue).length) / abiertas.length) * 100);
  }, [tasks.items]);

  const renovaciones = useMemo(() => {
    const dentro = (min: number, max: number) =>
      renewals.items.filter((r) => r.daysToRenewal >= min && r.daysToRenewal <= max).length;
    return [
      { id: "r30", icon: "CalendarClock", color: "#f43f5e", value: String(dentro(0, 30)), label: "Próximos 30 días" },
      { id: "r60", icon: "CalendarClock", color: "#f59e0b", value: String(dentro(31, 60)), label: "Entre 31 y 60 días" },
      { id: "r90", icon: "CalendarClock", color: "#22c55e", value: String(dentro(61, 90)), label: "Entre 61 y 90 días" },
    ];
  }, [renewals.items]);

  const alertas = useMemo(
    () => [
      { id: "docs", icon: "FileText", color: "#3b82f6", value: String(stats.documentos), label: "Documentos pendientes", delta: undefined },
      { id: "firmas", icon: "PenLine", color: "#a78bfa", value: String(stats.firmas), label: "Firmas esperando al cliente" },
      { id: "detenidas", icon: "ShieldAlert", color: "#f43f5e", value: String(stats.detenidas), label: "Implementaciones detenidas" },
      { id: "atrasadas", icon: "TriangleAlert", color: "#f59e0b", value: String(tasks.items.filter((t) => t.overdue && t.stage !== "completada").length), label: "Tareas atrasadas" },
    ],
    [stats, tasks.items]
  );

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

  /** Lo último que se movió, derivado de las tareas ya cerradas. */
  const actividad = useMemo(
    () =>
      tasks.items
        .filter((t) => t.stage === "completada")
        .slice(0, 5)
        .map((t) => ({
          id: t.id,
          icon: "CheckCircle2",
          color: "#22c55e",
          title: t.completedNote || `${t.owner} completó una tarea`,
          detail: t.title,
          timeLabel: t.dueLabel,
        })),
    [tasks.items]
  );

  const mover = (taskId: string, toStage: string) => {
    const destino = TASK_STAGES.find((s) => s.id === toStage);
    tasks.update(taskId, { stage: toStage as TaskStage });
    toast.success(`Movida a ${destino?.name ?? toStage}.`);
  };

  const isEmpty = !loading && tasks.items.length === 0 && implementations.items.length === 0;

  const sidePanel = isEmpty ? null : (
    <>
      <BlockFrame title="Alertas y cuellos de botella" icon="ShieldAlert">
        <StatTileList tiles={alertas} />
      </BlockFrame>

      <BlockFrame title="Renovaciones próximas" icon="CalendarClock">
        <StatTileList tiles={renovaciones} />
      </BlockFrame>

      <BlockFrame title="Actividad reciente" icon="History">
        <ActivityFeed entries={actividad} compact />
      </BlockFrame>

      <BlockFrame title="Acciones rápidas" icon="Zap">
        <QuickActionGrid
          actions={[
            { id: "tareas", icon: "ClipboardList", label: "Ver tareas", href: "/operaciones/tareas" },
            { id: "impl", icon: "Layers", label: "Implementaciones", href: "/operaciones/implementaciones" },
            { id: "docs", icon: "FileText", label: "Documentos", href: "/operaciones/documentos-pendientes" },
            { id: "cal", icon: "CalendarDays", label: "Calendario", href: "/operaciones/calendario" },
          ]}
        />
      </BlockFrame>
    </>
  );

  return (
    <PageShell
      title={`${saludo()} 👋`}
      description="Centro de control operativo. Enfocados en ejecutar con excelencia."
      icon="LayoutDashboard"
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
      {loading ? (
        <div className="surface-card">
          <LoadingState />
        </div>
      ) : isEmpty ? (
        <div className="surface-card">
          <EmptyState
            icon="LayoutDashboard"
            title="Tu centro de operaciones está vacío"
            description="Esta página resume lo que el equipo tiene entre manos: tareas del día, implementaciones en curso y lo que está detenido esperando a alguien. Se llena sola conforme uses el resto del módulo."
          />
        </div>
      ) : (
        <>
          <KpiStrip
            layout="inline"
            items={[
              { id: "tareas", label: "Tareas pendientes hoy", value: String(stats.tareasHoy), icon: "ClipboardList", tone: "violet" },
              { id: "impl", label: "Implementaciones activas", value: String(stats.implementacionesActivas), icon: "Layers", tone: "blue" },
              { id: "firmas", label: "Firmas pendientes", value: String(stats.firmas), icon: "PenLine", tone: "amber" },
              { id: "docs", label: "Documentos pendientes", value: String(stats.documentos), icon: "FileText", tone: "emerald" },
              { id: "revisiones", label: "Revisiones pendientes", value: String(stats.revisiones), icon: "ClipboardCheck", tone: "rose" },
              { id: "sla", label: "Trabajo al día", value: `${sla}%`, sub: "sin atrasos", icon: "ShieldCheck", tone: "gold", ring: sla },
            ]}
          />

          <BlockFrame title="Tablero de operaciones" icon="Columns3">
            <KanbanBoard
              columns={BOARD_STAGES.map((s) => ({ id: s.id, name: s.name, color: s.color }))}
              cards={tasks.items
                .filter((t) => t.stage !== "delegada")
                .map((t) => ({
                  id: t.id,
                  columnId: t.stage,
                  title: t.title,
                  subtitle: t.client,
                  tag: t.process,
                  tagTone: PROCESS_TONE[t.process] ?? "neutral",
                  priority: t.priority,
                  priorityTone: PRIORITY_TONE[t.priority],
                  owner: t.owner,
                  timeLabel: t.dueLabel,
                  overdue: t.overdue,
                  footnote: t.completedNote || undefined,
                }))}
              onMove={mover}
            />
          </BlockFrame>

          <BlockFrame title="Próximas acciones — Hoy" icon="ListChecks">
            <AgendaList entries={agenda} />
          </BlockFrame>
        </>
      )}

      <AddBlockDialog {...composer.dialogProps} />
    </PageShell>
  );
}
