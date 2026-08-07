"use client";

import { useCallback, useMemo, useState } from "react";
import { Copy, MoreHorizontal, PenLine, Plus } from "lucide-react";
import { toast } from "sonner";
import { PageShell, PageTabs } from "@/components/page-blocks/PageShell";
import { AddBlockDialog } from "@/components/page-blocks/AddBlockDialog";
import { useBlockComposer } from "@/components/page-blocks/use-block-composer";
import { EmptyState, LoadingState } from "@/components/page-blocks/EmptyState";
import { Button } from "@/components/ui/button";
import { useContent } from "@/lib/use-content";
import { usePageConfig } from "@/lib/use-page-config";
import { rollupFor } from "@/lib/solution-metrics";
import { CRM_COLLECTIONS, type CrmFamily } from "@/lib/crm-types";
import {
  SOL_COLLECTIONS,
  type SolActivity,
  type SolAssignment,
  type SolDocument,
  type SolUseCase,
  type Solution,
} from "@/lib/solution-types";
import {
  ActividadMain,
  ActividadSide,
  AnalisisMain,
  AnalisisSide,
  ComponentesMain,
  ComponentesSide,
  ConstructorMain,
  ConstructorSide,
  DocumentosMain,
  DocumentosSide,
  CasosMain,
  CasosSide,
  FamiliasMain,
  FamiliasSide,
  ResumenMain,
  ResumenSide,
  type SolutionContext,
} from "@/components/pages/soluciones/solucion/tabs";

const TABS = [
  { value: "resumen", label: "Resumen" },
  { value: "constructor", label: "Constructor de Solución" },
  { value: "componentes", label: "Componentes" },
  { value: "analisis", label: "Análisis" },
  { value: "documentos", label: "Documentos" },
  { value: "casos", label: "Casos de Uso" },
  { value: "familias", label: "Familias Asignadas" },
  { value: "actividad", label: "Actividad" },
];

const VISTAS: Record<string, { Main: (p: { ctx: SolutionContext }) => React.ReactNode; Side: (p: { ctx: SolutionContext }) => React.ReactNode }> = {
  resumen: { Main: ResumenMain, Side: ResumenSide },
  constructor: { Main: ConstructorMain, Side: ConstructorSide },
  componentes: { Main: ComponentesMain, Side: ComponentesSide },
  analisis: { Main: AnalisisMain, Side: AnalisisSide },
  documentos: { Main: DocumentosMain, Side: DocumentosSide },
  casos: { Main: CasosMain, Side: CasosSide },
  familias: { Main: FamiliasMain, Side: FamiliasSide },
  actividad: { Main: ActividadMain, Side: ActividadSide },
};

export function SolucionDetalleView({ slug }: { slug: string }) {
  const solutions = useContent<Solution>(SOL_COLLECTIONS.solutions);
  const assignments = useContent<SolAssignment>(SOL_COLLECTIONS.assignments);
  const documents = useContent<SolDocument>(SOL_COLLECTIONS.documents);
  const useCases = useContent<SolUseCase>(SOL_COLLECTIONS.useCases);
  const activities = useContent<SolActivity>(SOL_COLLECTIONS.activities);
  const families = useContent<CrmFamily>(CRM_COLLECTIONS.families);

  const [tab, setTab] = useState("resumen");

  const { blocks, addBlock, updateBlock, removeBlock } = usePageConfig(`/soluciones/planes-patrimoniales/${slug}`);
  const composer = useBlockComposer(addBlock);

  const loading = solutions.loading || assignments.loading || documents.loading || useCases.loading || activities.loading;

  const solution = useMemo(() => solutions.items.find((s) => s.slug === slug), [solutions.items, slug]);

  const propias = useMemo(
    () => assignments.items.filter((a) => a.solutionSlug === slug).sort((a, b) => a.order - b.order),
    [assignments.items, slug]
  );

  const { update: updateSolution } = solutions;

  /** Marca o desmarca un paso del constructor y lo guarda. */
  const onToggleStep = useCallback(
    (code: string) => {
      if (!solution) return;
      const steps = solution.steps.map((s) => (s.code === code ? { ...s, done: !s.done } : s));
      updateSolution(solution.id, { steps });
    },
    [solution, updateSolution]
  );

  /**
   * Incorporar un componente recomendado al plan: pasa de pendiente a en
   * configuración. Es el estado real que le corresponde —queda dentro del
   * plan pero todavía no implementado—, no un salto directo a activo.
   */
  const onAddComponent = useCallback(
    (id: string) => {
      if (!solution) return;
      const componente = solution.components.find((c) => c.id === id);
      if (!componente) return;
      const components = solution.components.map((c) =>
        c.id === id ? { ...c, status: "En Proceso" as const, statusNote: "En configuración" } : c
      );
      updateSolution(solution.id, { components });
      toast.success(`${componente.name} se agregó al plan.`);
    },
    [solution, updateSolution]
  );

  const ctx: SolutionContext | null = useMemo(() => {
    if (!solution) return null;
    return {
      solution,
      assignments: propias,
      documents: documents.items.filter((d) => d.solutionSlug === slug).sort((a, b) => a.order - b.order),
      useCases: useCases.items.filter((u) => u.relatedPlan === solution.name).sort((a, b) => a.order - b.order),
      activities: activities.items.filter((a) => a.solutionSlug === slug).sort((a, b) => a.order - b.order),
      families: families.items,
      rollup: rollupFor(slug, propias),
      onToggleStep,
      onAddComponent,
    };
  }, [solution, propias, documents.items, useCases.items, activities.items, families.items, slug, onToggleStep, onAddComponent]);

  const migas = [
    { label: "Soluciones", href: "/soluciones/dashboard" },
    { label: "Planes Patrimoniales", href: "/soluciones/planes-patrimoniales" },
    { label: solution?.name ?? "Plan" },
  ];

  if (loading) {
    return (
      <PageShell title="Cargando…" breadcrumb={migas} starrable={false}>
        <div className="surface-card">
          <LoadingState />
        </div>
      </PageShell>
    );
  }

  if (!solution || !ctx) {
    return (
      <PageShell title="Plan no encontrado" breadcrumb={migas} starrable={false}>
        <div className="surface-card">
          <EmptyState
            icon="SearchX"
            title="Este plan no existe"
            description="Puede que se haya archivado o que el enlace esté mal. Vuelve al catálogo para ver los planes disponibles."
          />
        </div>
      </PageShell>
    );
  }

  const { Main, Side } = VISTAS[tab];

  return (
    <PageShell
      title={solution.name}
      description={solution.tagline}
      icon={solution.icon}
      breadcrumb={migas}
      sidePanel={<Side ctx={ctx} />}
      blocks={{ items: blocks, onUpdate: updateBlock, onDelete: removeBlock, onAdd: composer.openFor }}
      headerActions={
        <>
          <Button
            variant="outline"
            size="sm"
            className="border-white/12 bg-white/[0.03] text-white/70 hover:bg-white/[0.06]"
            onClick={() => toast.info("Editar la información del plan llega con el editor.")}
          >
            <PenLine className="mr-1.5 h-3.5 w-3.5" />
            Editar información
          </Button>
          <Button size="sm" onClick={() => toast.info("Crear una solución llega con el editor de planes.")}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Nueva solución
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-white/12 bg-white/[0.03] text-white/70 hover:bg-white/[0.06]"
            onClick={() => toast.info("Duplicar el plan llega con el editor.")}
          >
            <Copy className="mr-1.5 h-3.5 w-3.5" />
            Duplicar plan
          </Button>
          <Button variant="outline" size="icon" className="h-9 w-9 border-white/12 bg-white/[0.03] text-white/70 hover:bg-white/[0.06]">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </>
      }
    >
      <PageTabs tabs={TABS} active={tab} onChange={setTab} />
      <Main ctx={ctx} />
      <AddBlockDialog {...composer.dialogProps} />
    </PageShell>
  );
}
