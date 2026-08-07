"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Download, LayoutGrid, List, Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { PageShell } from "@/components/page-blocks/PageShell";
import { AddBlockDialog } from "@/components/page-blocks/AddBlockDialog";
import { useBlockComposer } from "@/components/page-blocks/use-block-composer";
import { BlockFrame } from "@/components/page-blocks/BlockFrame";
import { EmptyState, LoadingState } from "@/components/page-blocks/EmptyState";
import { KpiStrip } from "@/components/page-blocks/blocks/KpiStrip";
import { SolutionCardGrid } from "@/components/page-blocks/blocks/SolutionCardGrid";
import { DataTable, type RowData } from "@/components/page-blocks/blocks/DataTable";
import { KpiProgressList } from "@/components/page-blocks/blocks/KpiProgressList";
import { RankedBarList } from "@/components/page-blocks/blocks/RankedBarList";
import { ActivityFeed } from "@/components/page-blocks/blocks/ActivityFeed";
import { QuickActionGrid } from "@/components/page-blocks/blocks/QuickActionGrid";
import { Button } from "@/components/ui/button";
import { useContent } from "@/lib/use-content";
import { usePageConfig } from "@/lib/use-page-config";
import { money, rollupBySolution, share, totals } from "@/lib/solution-metrics";
import { solutionDetailPath } from "@/lib/page-registry";
import {
  SOL_ACTIVITY_META,
  SOL_COLLECTIONS,
  type SolActivity,
  type SolAssignment,
  type Solution,
} from "@/lib/solution-types";

/**
 * Miniserie de la tira de indicadores.
 *
 * Es **ilustrativa**: el módulo guarda el estado de hoy, no una serie
 * histórica, así que no hay de dónde sacar la curva real. Se genera de forma
 * determinista a partir del valor actual —no con `Math.random`— para que no
 * cambie en cada repintado y se note que es decorativa.
 */
function serieIlustrativa(valor: number, puntos = 12): number[] {
  const base = Math.max(valor, 1);
  return Array.from({ length: puntos }, (_, i) => {
    const onda = Math.sin(i * 1.1) * 0.06 + Math.sin(i * 0.4) * 0.04;
    const tendencia = (i / (puntos - 1)) * 0.12;
    return Math.round(base * (0.86 + tendencia + onda));
  });
}

export function SolucionesDashboardView() {
  const solutions = useContent<Solution>(SOL_COLLECTIONS.solutions);
  const assignments = useContent<SolAssignment>(SOL_COLLECTIONS.assignments);
  const activities = useContent<SolActivity>(SOL_COLLECTIONS.activities);

  const { blocks, addBlock, updateBlock, removeBlock } = usePageConfig("/soluciones/dashboard");
  const composer = useBlockComposer(addBlock);

  const [view, setView] = useState<"cards" | "list">("cards");

  const loading = solutions.loading || assignments.loading || activities.loading;

  const planes = useMemo(() => [...solutions.items].sort((a, b) => a.order - b.order), [solutions.items]);

  const totales = useMemo(() => totals(planes, assignments.items), [planes, assignments.items]);
  const porPlan = useMemo(() => rollupBySolution(assignments.items), [assignments.items]);

  const tarjetas = useMemo(
    () =>
      planes.map((s) => ({
        id: s.id,
        name: s.name,
        icon: s.icon,
        color: s.color,
        features: s.features,
        count: porPlan.get(s.slug)?.families ?? 0,
        countLabel: s.kind === "Empresarial" ? "empresas" : "familias",
        href: solutionDetailPath(s.slug),
      })),
    [planes, porPlan]
  );

  const filas: RowData[] = useMemo(
    () =>
      planes.map((s) => {
        const r = porPlan.get(s.slug);
        return {
          id: s.id,
          cells: {
            plan: { kind: "source", icon: s.icon, value: s.name, sub: s.audience },
            tipo: { kind: "badge", value: s.kind, tone: "violet" },
            familias: { kind: "number", value: String(r?.families ?? 0) },
            cobertura: { kind: "text", value: money(r?.coverage ?? 0) },
            avance: { kind: "progress", value: r?.progress ?? 0 },
            complejidad: { kind: "text", value: s.complexityLabel },
          },
        };
      }),
    [planes, porPlan]
  );

  const masUtilizadas = useMemo(
    () =>
      [...planes]
        .map((s) => ({ s, r: porPlan.get(s.slug) }))
        .sort((a, b) => (b.r?.assignments ?? 0) - (a.r?.assignments ?? 0))
        .slice(0, 5)
        .map(({ s, r }) => ({
          id: s.slug,
          label: s.name,
          value: r?.assignments ?? 0,
          color: s.color,
          ranked: true,
        })),
    [planes, porPlan]
  );

  const recientes = useMemo(
    () =>
      [...activities.items]
        .sort((a, b) => a.order - b.order)
        .slice(0, 5)
        .map((a) => ({
          id: a.id,
          icon: SOL_ACTIVITY_META[a.kind].icon,
          color: SOL_ACTIVITY_META[a.kind].color,
          title: a.title,
          detail: `${a.familyName} · ${a.detail}`,
          timeLabel: a.dayLabel,
        })),
    [activities.items]
  );

  const sidePanel = (
    <>
      <BlockFrame title="Progreso de implementación" icon="TrendingUp">
        <KpiProgressList
          rows={planes.map((s) => ({
            id: s.slug,
            label: s.name,
            icon: s.icon,
            // El bloque ya pinta el porcentaje al lado de la barra; aquí va
            // el dato que no se repite.
            value: `${porPlan.get(s.slug)?.families ?? 0} familias`,
            percent: porPlan.get(s.slug)?.progress ?? 0,
          }))}
        />
        <div className="mt-3 flex items-center justify-between border-t border-white/8 pt-3">
          <span className="text-sm text-white/55">Promedio general</span>
          <span className="rounded-lg bg-[var(--allpa-gold-400)]/12 px-2 py-0.5 text-sm font-semibold tabular-nums text-[var(--allpa-gold-300)]">
            {totales.progress}%
          </span>
        </div>
      </BlockFrame>

      <BlockFrame title="Soluciones más utilizadas" icon="Trophy">
        <RankedBarList rows={masUtilizadas} />
      </BlockFrame>

      <BlockFrame title="Actividad reciente" icon="History">
        <ActivityFeed entries={recientes} compact />
      </BlockFrame>

      <BlockFrame title="Acciones rápidas" icon="Zap">
        <QuickActionGrid
          layout="list"
          columns={1}
          actions={[
            { id: "planes", icon: "Layers", label: "Ver todos los planes", href: "/soluciones/planes-patrimoniales" },
            { id: "rutas", icon: "Route", label: "Rutas de cliente", href: "/soluciones/rutas-de-cliente" },
            { id: "calc", icon: "Calculator", label: "Abrir la calculadora", href: "/soluciones/calculadora" },
            { id: "comp", icon: "Scale", label: "Comparar soluciones", href: "/soluciones/comparador" },
          ]}
        />
      </BlockFrame>
    </>
  );

  return (
    <PageShell
      title="Soluciones"
      description="Arquitecturas patrimoniales para familias y empresarios."
      icon="ShieldCheck"
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
          <Button size="sm" onClick={() => toast.info("Crear una solución llegará al construir el editor de planes.")}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Nueva solución
          </Button>
        </>
      }
    >
      {loading ? (
        <div className="surface-card">
          <LoadingState />
        </div>
      ) : planes.length === 0 ? (
        <div className="surface-card">
          <EmptyState
            icon="ShieldCheck"
            title="Todavía no hay soluciones"
            description="Cuando se cree el primer plan patrimonial, aparecerá aquí con su alcance y su avance."
          />
        </div>
      ) : (
        <>
          <KpiStrip
            layout="inline"
            items={[
              {
                id: "activas",
                label: "Soluciones activas",
                value: String(totales.active),
                sub: "planes contratados",
                icon: "ShieldCheck",
                tone: "violet",
                trend: serieIlustrativa(totales.active),
              },
              {
                id: "planes",
                label: "Plantillas patrimoniales",
                value: String(totales.plans),
                sub: "en el catálogo",
                icon: "Layers",
                tone: "blue",
                trend: serieIlustrativa(totales.plans),
              },
              {
                id: "familias",
                label: "Familias vinculadas",
                value: String(totales.families),
                sub: "con al menos un plan",
                icon: "Users",
                tone: "emerald",
                trend: serieIlustrativa(totales.families),
              },
              {
                id: "patrimonio",
                label: "Patrimonio protegido",
                value: money(totales.coverage),
                sub: "suma asegurada",
                icon: "ShieldCheck",
                tone: "gold",
                trend: serieIlustrativa(Math.round(totales.coverage / 1000)),
              },
              {
                id: "avance",
                label: "Implementación promedio",
                value: `${totales.progress}%`,
                sub: `${totales.implemented} completadas`,
                icon: "TrendingUp",
                tone: "emerald",
                ring: totales.progress,
              },
              {
                id: "empresas",
                label: "Planes empresariales",
                value: String(totales.business),
                sub: `${share(totales.business, totales.active)}% del total`,
                icon: "Briefcase",
                tone: "amber",
                trend: serieIlustrativa(totales.business),
              },
            ]}
          />

          <BlockFrame
            title="Biblioteca de soluciones patrimoniales"
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
            <p className="mb-3 text-sm text-white/45">
              Nuestros planes integrados para proteger, crecer y transferir el patrimonio familiar.
            </p>

            {view === "cards" ? (
              <SolutionCardGrid solutions={tarjetas} />
            ) : (
              <DataTable
                columns={[
                  { id: "plan", header: "Plan", sortable: true },
                  { id: "tipo", header: "Tipo", sortable: true, width: "140px" },
                  { id: "familias", header: "Familias", sortable: true, width: "110px" },
                  { id: "cobertura", header: "Cobertura", sortable: true, width: "130px" },
                  { id: "avance", header: "Avance", sortable: true, width: "170px" },
                  { id: "complejidad", header: "Complejidad", sortable: true, width: "130px" },
                ]}
                rows={filas}
              />
            )}
          </BlockFrame>

          <div className="surface-card flex flex-wrap items-center gap-3 px-4 py-3.5">
            <Sparkles className="h-4 w-4 flex-shrink-0 text-[var(--allpa-gold-300)]" />
            <p className="min-w-0 flex-1 text-sm text-white/55">
              <span className="font-medium text-[#f3ecd9]">¿No sabes por dónde empezar?</span> Compara los planes y simula
              una cobertura para recomendar la mejor solución a cada familia.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="border-white/12 bg-white/[0.03] text-white/70 hover:bg-white/[0.06]"
              onClick={() => toast.info("El diagnóstico guiado llega con la Calculadora.")}
            >
              Iniciar diagnóstico
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </div>
        </>
      )}

      <AddBlockDialog {...composer.dialogProps} />
    </PageShell>
  );
}
