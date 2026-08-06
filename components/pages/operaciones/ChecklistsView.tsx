"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageShell } from "@/components/page-blocks/PageShell";
import { AddBlockDialog } from "@/components/page-blocks/AddBlockDialog";
import { useBlockComposer } from "@/components/page-blocks/use-block-composer";
import { BlockFrame } from "@/components/page-blocks/BlockFrame";
import { EmptyState, LoadingState } from "@/components/page-blocks/EmptyState";
import { KpiStrip } from "@/components/page-blocks/blocks/KpiStrip";
import { PhaseChecklist } from "@/components/page-blocks/blocks/PhaseChecklist";
import { InfoCard } from "@/components/page-blocks/blocks/InfoCard";
import { NotesPanel } from "@/components/page-blocks/blocks/NotesPanel";
import { useContent } from "@/lib/use-content";
import { usePageConfig } from "@/lib/use-page-config";
import {
  OPS_COLLECTIONS,
  type ChecklistPhase,
  type Implementation,
  type StepStatus,
} from "@/lib/ops-types";

/** Recalcula progreso y paso actual a partir de las fases, que son la verdad. */
function derivarAvance(phases: ChecklistPhase[]) {
  const steps = phases.flatMap((f) => f.steps);
  const done = steps.filter((s) => s.status === "Completado").length;
  const actual = steps.find((s) => s.status !== "Completado");
  return {
    progress: steps.length > 0 ? Math.round((done / steps.length) * 100) : 0,
    currentStep: Math.min(done + 1, steps.length),
    totalSteps: steps.length,
    currentStepTitle: actual?.title ?? "Proceso completado",
  };
}

export function ChecklistsView({ implementationId }: { implementationId?: string }) {
  const [selectedCode, setSelectedCode] = useState<string | null>(null);

  const implementations = useContent<Implementation>(OPS_COLLECTIONS.implementations);
  const { blocks, addBlock, updateBlock, removeBlock } = usePageConfig(
    implementationId ? `/operaciones/checklists/${implementationId}` : "/operaciones/checklists"
  );
  const composer = useBlockComposer(addBlock);

  /** Sin implementación en la ruta se abre la primera que siga en curso. */
  const impl = useMemo(() => {
    if (implementationId) return implementations.items.find((i) => i.id === implementationId) ?? null;
    return implementations.items.find((i) => i.stage !== "completado") ?? implementations.items[0] ?? null;
  }, [implementations.items, implementationId]);

  const pasos = useMemo(() => impl?.phases.flatMap((f) => f.steps) ?? [], [impl]);

  const stats = useMemo(() => {
    const done = pasos.filter((s) => s.status === "Completado").length;
    const enProceso = pasos.filter((s) => s.status === "En proceso").length;
    const atrasados = pasos.filter((s) => s.overdue && s.status !== "Completado").length;
    return {
      progreso: pasos.length > 0 ? Math.round((done / pasos.length) * 100) : 0,
      done,
      enProceso,
      pendientes: pasos.length - done - enProceso,
      atrasados,
      total: pasos.length,
    };
  }, [pasos]);

  const pasoActual = useMemo(
    () => pasos.find((s) => s.code === selectedCode) ?? pasos.find((s) => s.status !== "Completado") ?? null,
    [pasos, selectedCode]
  );

  /**
   * Marcar un paso reescribe las fases enteras del documento y vuelve a
   * derivar el avance: así el porcentaje de la fase, el de la implementación
   * y el paso actual nunca se separan de lo que muestran las casillas.
   */
  const alternarPaso = (code: string, done: boolean) => {
    if (!impl) return;
    const phases = impl.phases.map((f) => ({
      ...f,
      steps: f.steps.map((s) =>
        s.code === code ? { ...s, status: (done ? "Completado" : "Pendiente") as StepStatus, overdue: done ? false : s.overdue } : s
      ),
    }));
    implementations.update(impl.id, { phases, ...derivarAvance(phases) });
  };

  const loading = implementations.loading;
  const isEmpty = !loading && !impl;

  const sidePanel = isEmpty ? null : (
    <>
      {pasoActual && (
        <BlockFrame title="Paso seleccionado" icon="ListChecks">
          <p className="mb-1 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--allpa-gold-400)]/15 text-[11px] font-bold text-[var(--allpa-gold-300)]">
              {pasoActual.code}
            </span>
            <span className="min-w-0 truncate font-semibold text-[#f3ecd9]">{pasoActual.title}</span>
          </p>
          <div className="mt-3">
            <InfoCard
              rows={[
                { label: "Responsable", value: pasoActual.owner, person: true },
                { label: "Estado", value: pasoActual.status },
                { label: "Fecha límite", value: pasoActual.dueDate || "Sin fecha" },
                ...(pasoActual.overdue && pasoActual.status !== "Completado"
                  ? [{ label: "Atención", value: "Paso atrasado", tone: "rose" as const }]
                  : []),
              ]}
            />
          </div>
        </BlockFrame>
      )}

      {impl && (
        <BlockFrame title="Notas del proceso" icon="StickyNote">
          <NotesPanel notes={[]} />
        </BlockFrame>
      )}
    </>
  );

  return (
    <PageShell
      title="Checklist"
      description="Sigue cada paso del proceso y asegura una implementación perfecta."
      icon="ListChecks"
      starrable={false}
      sidePanel={sidePanel}
      blocks={{ items: blocks, onUpdate: updateBlock, onDelete: removeBlock, onAdd: composer.openFor }}
      headerActions={
        <Link
          href="/operaciones/implementaciones"
          className="flex h-9 items-center gap-1.5 rounded-lg border border-white/12 bg-white/[0.03] px-3 text-sm text-white/70 transition-colors hover:bg-white/[0.06]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Implementaciones
        </Link>
      }
    >
      {loading ? (
        <div className="surface-card">
          <LoadingState />
        </div>
      ) : isEmpty ? (
        <div className="surface-card">
          <EmptyState
            icon="ListChecks"
            title="Todavía no hay ningún checklist"
            description="Cada implementación trae su checklist por fases. Crea una implementación y aquí podrás seguir sus pasos uno a uno."
          />
        </div>
      ) : (
        impl && (
          <>
            <KpiStrip
              layout="inline"
              items={[
                { id: "progreso", label: "Progreso general", value: `${stats.progreso}%`, sub: `${stats.done} de ${stats.total} pasos`, icon: "TrendingUp", tone: "gold", ring: stats.progreso },
                { id: "done", label: "Pasos completados", value: String(stats.done), sub: "del total", icon: "CheckCircle2", tone: "emerald" },
                { id: "proceso", label: "En proceso", value: String(stats.enProceso), sub: "ahora mismo", icon: "Loader", tone: "blue" },
                { id: "pendientes", label: "Pendientes", value: String(stats.pendientes), sub: "por empezar", icon: "Clock", tone: "amber" },
                { id: "atrasados", label: "Atrasados", value: String(stats.atrasados), sub: "requieren atención", icon: "TriangleAlert", tone: "rose" },
              ]}
            />

            <BlockFrame title={`Implementación: ${impl.process}`} icon="Layers">
              <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-white/45">
                <span>
                  Cliente: <span className="text-white/75">{impl.client}</span>
                </span>
                <span>
                  Asesor: <span className="text-white/75">{impl.owner}</span>
                </span>
                <span>
                  Iniciada: <span className="text-white/75">{impl.startDate}</span>
                </span>
                <span>
                  Paso actual: <span className="text-white/75">{impl.currentStep} de {impl.totalSteps}</span>
                </span>
              </div>

              <PhaseChecklist
                phases={impl.phases}
                selectedCode={pasoActual?.code ?? null}
                onSelectStep={setSelectedCode}
                onToggleStep={alternarPaso}
              />
            </BlockFrame>
          </>
        )
      )}

      <AddBlockDialog {...composer.dialogProps} />
    </PageShell>
  );
}
