"use client";

import { useMemo } from "react";
import { Download, Plus } from "lucide-react";
import { PageShell } from "@/components/page-blocks/PageShell";
import { AddBlockDialog } from "@/components/page-blocks/AddBlockDialog";
import { useBlockComposer } from "@/components/page-blocks/use-block-composer";
import { BlockFrame } from "@/components/page-blocks/BlockFrame";
import { EmptyState, LoadingState } from "@/components/page-blocks/EmptyState";
import { KpiStrip } from "@/components/page-blocks/blocks/KpiStrip";
import { DonutChart } from "@/components/page-blocks/blocks/DonutChart";
import { LineChart } from "@/components/page-blocks/blocks/TrendCharts";
import { RankedBarList } from "@/components/page-blocks/blocks/RankedBarList";
import { MetricDeltaList } from "@/components/page-blocks/blocks/MetricDeltaList";
import { StatTileList } from "@/components/page-blocks/blocks/StatTileList";
import { ActivityFeed } from "@/components/page-blocks/blocks/ActivityFeed";
import { QuickActionGrid } from "@/components/page-blocks/blocks/QuickActionGrid";
import { Button } from "@/components/ui/button";
import { useContent } from "@/lib/use-content";
import { usePageConfig } from "@/lib/use-page-config";
import { dayLabel as diaSerie, illustrativeSeries } from "@/lib/crm-analytics";
import { formatearDuracion, medirProcesos, totalizar } from "@/lib/ops-reports";
import {
  OPS_COLLECTIONS,
  slaTone,
  type Implementation,
  type OpsDocument,
  type OpsRenewal,
  type OpsReview,
  type OpsSignature,
  type OpsSpecialCase,
  type OpsTask,
  type SavedReport,
} from "@/lib/ops-types";

const TONE_COLOR: Record<string, string> = { emerald: "#22c55e", amber: "#f59e0b", rose: "#f43f5e", neutral: "#94a3b8" };
const DIAS = 14;

export function ReportesOperativosView() {
  const implementations = useContent<Implementation>(OPS_COLLECTIONS.implementations);
  const tasks = useContent<OpsTask>(OPS_COLLECTIONS.tasks);
  const reviews = useContent<OpsReview>(OPS_COLLECTIONS.reviews);
  const documents = useContent<OpsDocument>(OPS_COLLECTIONS.documents);
  const signatures = useContent<OpsSignature>(OPS_COLLECTIONS.signatures);
  const renewals = useContent<OpsRenewal>(OPS_COLLECTIONS.renewals);
  const specialCases = useContent<OpsSpecialCase>(OPS_COLLECTIONS.specialCases);
  const saved = useContent<SavedReport>(OPS_COLLECTIONS.savedReports);

  const { blocks, addBlock, updateBlock, removeBlock } = usePageConfig("/operaciones/reportes-operativos");
  const composer = useBlockComposer(addBlock);

  const loading =
    implementations.loading || tasks.loading || reviews.loading || documents.loading ||
    signatures.loading || renewals.loading || specialCases.loading || saved.loading;

  const procesos = useMemo(
    () =>
      medirProcesos({
        implementations: implementations.items,
        tasks: tasks.items,
        reviews: reviews.items,
        documents: documents.items,
        signatures: signatures.items,
        renewals: renewals.items,
        specialCases: specialCases.items,
      }),
    [implementations.items, tasks.items, reviews.items, documents.items, signatures.items, renewals.items, specialCases.items]
  );

  const totales = useMemo(() => totalizar(procesos), [procesos]);

  /** Evolución por estado; el módulo aún no guarda histórico (ver crm-analytics). */
  const evolucion = useMemo(
    () =>
      illustrativeSeries(totales.completados, DIAS).map((completados, i) => ({
        dia: diaSerie(i, DIAS),
        completados,
        enProceso: Math.round(completados * 0.35),
        pendientes: Math.round(completados * 0.18),
        incidencias: Math.round(completados * 0.07),
      })),
    [totales.completados]
  );

  const porTipo = procesos.map((p) => ({ id: p.categoria, label: p.categoria, value: p.total, color: p.color }));

  const isEmpty = !loading && totales.total === 0;

  const sidePanel = isEmpty ? null : (
    <>
      <BlockFrame title="Reportes guardados" icon="FileText">
        <ActivityFeed
          entries={saved.items.map((r) => ({
            id: r.id,
            icon: r.icon,
            color: r.color,
            title: r.name,
            detail: `Generado ${r.generatedAt} por ${r.author}`,
            timeLabel: r.kind,
          }))}
          compact
        />
      </BlockFrame>

      <BlockFrame title="Cumplimiento de SLA" icon="ShieldCheck">
        <DonutChart
          slices={[
            { id: "dentro", label: "Dentro de SLA", value: totales.total - totales.conIncidencias, color: "#22c55e" },
            { id: "fuera", label: "Fuera de SLA", value: totales.conIncidencias, color: "#f43f5e" },
          ].filter((s) => s.value > 0)}
          centerValue={`${totales.eficiencia}%`}
          centerLabel="Cumplimiento general"
          showPercent={false}
        />
        <div className="mt-3">
          <StatTileList
            columns={2}
            tiles={[
              { id: "incump", icon: "TriangleAlert", color: "#f43f5e", value: String(totales.conIncidencias), label: "SLA incumplidos" },
              { id: "riesgo", icon: "Clock", color: "#f59e0b", value: String(totales.pendientes), label: "Pendientes" },
            ]}
          />
        </div>
      </BlockFrame>

      <BlockFrame title="Acciones rápidas" icon="Zap">
        <QuickActionGrid
          columns={2}
          actions={[
            { id: "procesos", icon: "GitBranch", label: "Reportes de procesos", href: "/operaciones/reportes-procesos" },
            { id: "sla", icon: "ShieldCheck", label: "SLA y cumplimiento", href: "/operaciones/sla-cumplimiento" },
            { id: "equipo", icon: "Users", label: "Ver equipo", href: "/operaciones/equipo" },
            { id: "config", icon: "Settings", label: "Configurar métricas", href: "/operaciones/configuracion" },
          ]}
        />
      </BlockFrame>
    </>
  );

  return (
    <PageShell
      title="Reportes Operativos"
      description="Consulta y analiza el desempeño operativo con reportes e indicadores clave."
      icon="BarChart3"
      starrable={false}
      sidePanel={sidePanel}
      blocks={{ items: blocks, onUpdate: updateBlock, onDelete: removeBlock, onAdd: composer.openFor }}
      headerActions={
        <>
          <Button variant="outline" size="sm" className="border-white/12 bg-white/[0.03] text-white/70 hover:bg-white/[0.06]">
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Exportar datos
          </Button>
          <Button className="border-0 bg-gradient-to-b from-[#f5da93] to-[#c98f1f] font-semibold text-[#241a05] hover:brightness-105">
            <Plus className="mr-1.5 h-4 w-4" />
            Nuevo reporte
          </Button>
        </>
      }
    >
      {loading ? (
        <div className="surface-card">
          <LoadingState />
        </div>
      ) : isEmpty ? (
        <div className="surface-card">
          <EmptyState
            icon="BarChart3"
            title="Todavía no hay nada que reportar"
            description="Estos reportes resumen lo que ocurre en el resto del módulo. En cuanto haya implementaciones, tareas y bandejas con movimiento, aparecerán aquí."
          />
        </div>
      ) : (
        <>
          <KpiStrip
            layout="inline"
            items={[
              { id: "total", label: "Total de procesos", value: String(totales.total), sub: "en el módulo", icon: "Layers", tone: "violet" },
              { id: "completados", label: "Completados", value: String(totales.completados), sub: `${Math.round((totales.completados / totales.total) * 100)}% del total`, icon: "CheckCircle2", tone: "emerald" },
              { id: "proceso", label: "En progreso", value: String(totales.enProceso), sub: "activos ahora", icon: "Loader", tone: "blue" },
              { id: "pendientes", label: "Pendientes", value: String(totales.pendientes), sub: "sin empezar", icon: "Clock", tone: "amber" },
              { id: "tiempo", label: "Tiempo prom. de resolución", value: formatearDuracion(totales.minutosMedios), sub: "estimado", icon: "Timer", tone: "rose" },
            ]}
          />

          <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
            <BlockFrame title="Procesos por estado en el tiempo" icon="TrendingUp">
              <LineChart
                data={evolucion}
                categoryKey="dia"
                series={[
                  { key: "completados", label: "Completados", color: "#22c55e" },
                  { key: "enProceso", label: "En progreso", color: "#3b82f6" },
                  { key: "pendientes", label: "Pendientes", color: "#f59e0b" },
                  { key: "incidencias", label: "Con incidencias", color: "#f43f5e", dashed: true },
                ]}
              />
            </BlockFrame>

            <BlockFrame title="Procesos por tipo" icon="PieChart">
              <DonutChart slices={porTipo} centerValue={String(totales.total)} centerLabel="Total" />
            </BlockFrame>

            <BlockFrame title="Procesos por categoría" icon="BarChart3">
              <RankedBarList rows={porTipo} />
            </BlockFrame>

            <BlockFrame title="Tiempos de resolución" icon="Timer">
              <MetricDeltaList
                rows={procesos.map((p) => ({
                  id: p.categoria,
                  label: p.categoria,
                  value: formatearDuracion(p.minutosMedios),
                  icon: p.icon,
                  lowerIsBetter: true,
                  dotColor: TONE_COLOR[slaTone(Math.round(((p.total - p.conIncidencias) / p.total) * 100))],
                }))}
              />
            </BlockFrame>
          </div>
        </>
      )}

      <AddBlockDialog {...composer.dialogProps} />
    </PageShell>
  );
}
