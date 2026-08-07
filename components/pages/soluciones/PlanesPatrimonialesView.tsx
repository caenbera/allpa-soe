"use client";

import { useMemo, useState } from "react";
import { Download, LayoutGrid, List, Plus } from "lucide-react";
import { toast } from "sonner";
import { PageShell, PageTabs } from "@/components/page-blocks/PageShell";
import { AddBlockDialog } from "@/components/page-blocks/AddBlockDialog";
import { useBlockComposer } from "@/components/page-blocks/use-block-composer";
import { BlockFrame } from "@/components/page-blocks/BlockFrame";
import { EmptyState, LoadingState } from "@/components/page-blocks/EmptyState";
import { KpiStrip } from "@/components/page-blocks/blocks/KpiStrip";
import { SolutionCardGrid } from "@/components/page-blocks/blocks/SolutionCardGrid";
import { DataTable, type RowData } from "@/components/page-blocks/blocks/DataTable";
import { FilterToolbar } from "@/components/page-blocks/blocks/FilterToolbar";
import { DonutChart } from "@/components/page-blocks/blocks/DonutChart";
import { StepLadder } from "@/components/page-blocks/blocks/StepLadder";
import { QuickActionGrid } from "@/components/page-blocks/blocks/QuickActionGrid";
import { Button } from "@/components/ui/button";
import { useContent } from "@/lib/use-content";
import { usePageConfig } from "@/lib/use-page-config";
import { money, rollupBySolution, share, totals } from "@/lib/solution-metrics";
import { solutionDetailPath } from "@/lib/page-registry";
import { SOL_COLLECTIONS, type SolAssignment, type Solution } from "@/lib/solution-types";

const TABS = [
  { value: "todos", label: "Todos los planes" },
  { value: "mios", label: "Mis planes" },
  { value: "plantillas", label: "Plantillas" },
  { value: "archivados", label: "Planes archivados" },
];

/** Los nueve pasos son los mismos para todos los planes: es la metodología. */
const ETAPAS = [
  { code: "1", title: "Diagnóstico", icon: "Search" },
  { code: "2", title: "Diseño del Plan", icon: "PenLine" },
  { code: "3", title: "Presentación", icon: "FileText" },
  { code: "4", title: "Implementación", icon: "CheckSquare" },
  { code: "5", title: "Revisión y Seguimiento", icon: "RefreshCw" },
];

export function PlanesPatrimonialesView() {
  const solutions = useContent<Solution>(SOL_COLLECTIONS.solutions);
  const assignments = useContent<SolAssignment>(SOL_COLLECTIONS.assignments);

  const { blocks, addBlock, updateBlock, removeBlock } = usePageConfig("/soluciones/planes-patrimoniales");
  const composer = useBlockComposer(addBlock);

  const [tab, setTab] = useState("todos");
  const [view, setView] = useState<"cards" | "list">("cards");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});

  const loading = solutions.loading || assignments.loading;

  const porPlan = useMemo(() => rollupBySolution(assignments.items), [assignments.items]);
  const ordenados = useMemo(() => [...solutions.items].sort((a, b) => a.order - b.order), [solutions.items]);
  const totales = useMemo(() => totals(ordenados, assignments.items), [ordenados, assignments.items]);

  const visibles = useMemo(() => {
    const q = search.trim().toLowerCase();
    return ordenados.filter((s) => {
      if (tab === "archivados" && s.status !== "Archivado") return false;
      if (tab !== "archivados" && s.status === "Archivado") return false;
      // "Mis planes" son los que lleva el asesor que ha iniciado sesión; hasta
      // que el módulo tenga propietario por plan, se muestran los activos.
      if (tab === "plantillas" && s.status !== "Activo") return false;
      if (filters.kind && s.kind !== filters.kind) return false;
      if (filters.complexity && s.complexityLabel !== filters.complexity) return false;
      if (!q) return true;
      return s.name.toLowerCase().includes(q) || s.tagline.toLowerCase().includes(q) || s.audience.toLowerCase().includes(q);
    });
  }, [ordenados, tab, filters, search]);

  const tarjetas = useMemo(
    () =>
      visibles.map((s, i) => ({
        id: s.id,
        index: i + 1,
        name: s.name,
        icon: s.icon,
        color: s.color,
        description: s.tagline,
        features: s.features,
        count: porPlan.get(s.slug)?.families ?? 0,
        countLabel: s.kind === "Empresarial" ? "empresas" : "familias",
        href: solutionDetailPath(s.slug),
        ctaLabel: "Ver plan",
      })),
    [visibles, porPlan]
  );

  const filas: RowData[] = useMemo(
    () =>
      visibles.map((s) => {
        const r = porPlan.get(s.slug);
        return {
          id: s.id,
          cells: {
            plan: { kind: "source", icon: s.icon, value: s.name, sub: s.tagline },
            tipo: { kind: "badge", value: s.kind, tone: "violet" },
            publico: { kind: "text", value: s.audience },
            familias: { kind: "number", value: String(r?.families ?? 0) },
            cobertura: { kind: "text", value: money(r?.coverage ?? 0) },
            avance: { kind: "progress", value: r?.progress ?? 0 },
          },
        };
      }),
    [visibles, porPlan]
  );

  /** Estado de implementación general: cada asignación cae en un tramo. */
  const estado = useMemo(() => {
    const completado = assignments.items.filter((a) => a.progress === 100).length;
    const enProceso = assignments.items.filter((a) => a.progress > 0 && a.progress < 100).length;
    const pendiente = assignments.items.filter((a) => a.progress === 0).length;
    return [
      { id: "completado", label: "Completado", value: completado, color: "#22c55e" },
      { id: "proceso", label: "En proceso", value: enProceso, color: "#3b82f6" },
      { id: "pendiente", label: "Pendiente", value: pendiente, color: "#f97316" },
    ].filter((s) => s.value > 0);
  }, [assignments.items]);

  const porTipo = useMemo(
    () =>
      ordenados
        .map((s) => ({
          id: s.slug,
          label: s.name,
          value: porPlan.get(s.slug)?.assignments ?? 0,
          color: s.color,
        }))
        .filter((s) => s.value > 0),
    [ordenados, porPlan]
  );

  /**
   * Cuántas asignaciones han llegado a cada etapa. El avance se reparte en los
   * cinco tramos de la metodología: al 20% se ha pasado el diagnóstico, al 40%
   * el diseño, y así. Es una lectura del mismo dato, no un dato nuevo.
   */
  const etapas = useMemo(
    () =>
      ETAPAS.map((e, i) => {
        const umbral = i * 20;
        const alcanzadas = assignments.items.filter((a) => a.progress > umbral).length;
        return {
          code: e.code,
          title: e.title,
          done: i === 0,
          statusLabel: "",
          // Cuenta planes, no familias: una misma familia aparece en varios.
          meta: `${alcanzadas} planes`,
        };
      }),
    [assignments.items]
  );

  const sidePanel = (
    <>
      <BlockFrame title="Estado de implementación general" icon="PieChart">
        <DonutChart slices={estado} centerValue={`${totales.progress}%`} centerLabel="Promedio" />
      </BlockFrame>

      <BlockFrame title="Distribución por tipo de plan" icon="ChartPie">
        <DonutChart slices={porTipo} centerValue={String(totales.active)} centerLabel="Total" />
      </BlockFrame>

      <BlockFrame title="Etapas de implementación" icon="ListOrdered">
        <StepLadder steps={etapas} />
      </BlockFrame>

      <BlockFrame title="Accesos rápidos" icon="Zap">
        <QuickActionGrid
          layout="list"
          columns={1}
          actions={[
            { id: "cero", icon: "Plus", label: "Crear plan desde cero" },
            { id: "plantilla", icon: "LayoutTemplate", label: "Usar plantilla prediseñada" },
            { id: "importar", icon: "Download", label: "Importar plan existente" },
            { id: "metodologia", icon: "BookOpen", label: "Ver metodología completa" },
          ]}
          onSelect={() => toast.info("Esta acción llega con el editor de planes.")}
        />
      </BlockFrame>
    </>
  );

  return (
    <PageShell
      title="Planes Patrimoniales"
      description="Arquitecturas integrales para proteger, crecer y transferir el patrimonio familiar."
      icon="Layers"
      sidePanel={sidePanel}
      blocks={{ items: blocks, onUpdate: updateBlock, onDelete: removeBlock, onAdd: composer.openFor }}
      headerActions={
        <>
          <Button
            variant="outline"
            size="sm"
            className="border-white/12 bg-white/[0.03] text-white/70 hover:bg-white/[0.06]"
            onClick={() => toast.info("Importar plantilla llegará con el catálogo de plantillas.")}
          >
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Importar plantilla
          </Button>
          <Button size="sm" onClick={() => toast.info("Crear un plan llegará al construir el editor.")}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Nuevo plan
          </Button>
        </>
      }
    >
      <PageTabs tabs={TABS} active={tab} onChange={setTab} />

      {loading ? (
        <div className="surface-card">
          <LoadingState />
        </div>
      ) : solutions.items.length === 0 ? (
        <div className="surface-card">
          <EmptyState
            icon="Layers"
            title="Todavía no hay planes"
            description="Cuando se cree el primer plan patrimonial aparecerá aquí, con su metodología y sus componentes."
          />
        </div>
      ) : (
        <>
          <KpiStrip
            layout="inline"
            items={[
              { id: "planes", label: "Planes patrimoniales", value: String(totales.plans), sub: "en el catálogo", icon: "Layers", tone: "violet" },
              { id: "familias", label: "Familias involucradas", value: String(totales.families), sub: "con al menos un plan", icon: "Users", tone: "emerald" },
              { id: "patrimonio", label: "Patrimonio protegido", value: money(totales.coverage), sub: "suma asegurada", icon: "ShieldCheck", tone: "gold" },
              { id: "avance", label: "Implementación promedio", value: `${totales.progress}%`, sub: `${totales.implemented} completadas`, icon: "TrendingUp", tone: "blue", ring: totales.progress },
              {
                id: "proceso",
                label: "Planes en proceso",
                value: String(totales.active - totales.implemented),
                sub: `${share(totales.active - totales.implemented, totales.active)}% del total`,
                icon: "Clock",
                tone: "amber",
              },
            ]}
          />

          <BlockFrame
            title="Nuestros planes patrimoniales"
            icon="Library"
            actions={
              <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.02] p-0.5">
                <button
                  type="button"
                  onClick={() => setView("cards")}
                  className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs transition-colors ${
                    view === "cards" ? "bg-[var(--allpa-gold-400)]/15 text-[var(--allpa-gold-300)]" : "text-white/50 hover:text-white/70"
                  }`}
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                  Tarjetas
                </button>
                <button
                  type="button"
                  onClick={() => setView("list")}
                  className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs transition-colors ${
                    view === "list" ? "bg-[var(--allpa-gold-400)]/15 text-[var(--allpa-gold-300)]" : "text-white/50 hover:text-white/70"
                  }`}
                >
                  <List className="h-3.5 w-3.5" />
                  Lista
                </button>
              </div>
            }
          >
            <FilterToolbar
              search={search}
              onSearchChange={setSearch}
              searchPlaceholder="Buscar planes patrimoniales…"
              filters={[
                { id: "kind", label: "Tipo", options: [...new Set(ordenados.map((s) => s.kind))] },
                { id: "complexity", label: "Complejidad", options: [...new Set(ordenados.map((s) => s.complexityLabel))] },
              ]}
              values={filters}
              onFilterChange={(id, value) => setFilters((prev) => ({ ...prev, [id]: value }))}
            />

            {visibles.length === 0 ? (
              <EmptyState
                icon="SearchX"
                title="Ningún plan coincide"
                description="Prueba con otro término o quita alguno de los filtros."
              />
            ) : view === "cards" ? (
              <SolutionCardGrid solutions={tarjetas} />
            ) : (
              <DataTable
                columns={[
                  { id: "plan", header: "Plan", sortable: true },
                  { id: "tipo", header: "Tipo", sortable: true, width: "140px" },
                  { id: "publico", header: "Público objetivo", sortable: true },
                  { id: "familias", header: "Familias", sortable: true, width: "110px" },
                  { id: "cobertura", header: "Cobertura", sortable: true, width: "130px" },
                  { id: "avance", header: "Avance", sortable: true, width: "170px" },
                ]}
                rows={filas}
              />
            )}
          </BlockFrame>
        </>
      )}

      <AddBlockDialog {...composer.dialogProps} />
    </PageShell>
  );
}
