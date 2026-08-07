"use client";

import { useMemo } from "react";
import { Download, Plus } from "lucide-react";
import { PageShell } from "@/components/page-blocks/PageShell";
import { AddBlockDialog } from "@/components/page-blocks/AddBlockDialog";
import { useBlockComposer } from "@/components/page-blocks/use-block-composer";
import { BlockFrame } from "@/components/page-blocks/BlockFrame";
import { EmptyState, LoadingState } from "@/components/page-blocks/EmptyState";
import { KpiStrip } from "@/components/page-blocks/blocks/KpiStrip";
import { DataTable, type RowData } from "@/components/page-blocks/blocks/DataTable";
import { DonutChart } from "@/components/page-blocks/blocks/DonutChart";
import { LineChart, ColumnChart } from "@/components/page-blocks/blocks/TrendCharts";
import { RankedBarList } from "@/components/page-blocks/blocks/RankedBarList";
import { InsightList, type Insight } from "@/components/page-blocks/blocks/InsightList";
import { QuickActionGrid } from "@/components/page-blocks/blocks/QuickActionGrid";
import { Button } from "@/components/ui/button";
import { useContent } from "@/lib/use-content";
import { usePageConfig } from "@/lib/use-page-config";
import { dayLabel as diaSerie, illustrativeSeries } from "@/lib/crm-analytics";
import { formatearDuracion, medirPorAsesor, medirProcesos, totalizar } from "@/lib/ops-reports";
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
} from "@/lib/ops-types";

const TONE_COLOR: Record<string, string> = { emerald: "#22c55e", amber: "#f59e0b", rose: "#f43f5e", neutral: "#94a3b8" };
const DIAS = 14;
const MESES = ["Ene", "Feb", "Mar", "Abr", "May"];

export function ReportesProcesosView() {
  const implementations = useContent<Implementation>(OPS_COLLECTIONS.implementations);
  const tasks = useContent<OpsTask>(OPS_COLLECTIONS.tasks);
  const reviews = useContent<OpsReview>(OPS_COLLECTIONS.reviews);
  const documents = useContent<OpsDocument>(OPS_COLLECTIONS.documents);
  const signatures = useContent<OpsSignature>(OPS_COLLECTIONS.signatures);
  const renewals = useContent<OpsRenewal>(OPS_COLLECTIONS.renewals);
  const specialCases = useContent<OpsSpecialCase>(OPS_COLLECTIONS.specialCases);

  const { blocks, addBlock, updateBlock, removeBlock } = usePageConfig("/operaciones/reportes-procesos");
  const composer = useBlockComposer(addBlock);

  const loading =
    implementations.loading || tasks.loading || reviews.loading || documents.loading ||
    signatures.loading || renewals.loading || specialCases.loading;

  const fuentes = useMemo(
    () => ({
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

  const procesos = useMemo(() => medirProcesos(fuentes), [fuentes]);
  const totales = useMemo(() => totalizar(procesos), [procesos]);
  const porAsesor = useMemo(() => medirPorAsesor(fuentes), [fuentes]);

  const evolucion = useMemo(
    () =>
      illustrativeSeries(totales.completados, DIAS).map((completados, i) => ({
        dia: diaSerie(i, DIAS),
        completados,
        enProceso: Math.round(completados * 0.4),
        incidencias: Math.round(completados * 0.08),
      })),
    [totales.completados]
  );

  /** Comparativo mensual: los meses previos se estiman por la misma razón. */
  const comparativo = useMemo(() => {
    const serie = illustrativeSeries(totales.total, MESES.length, 0.4);
    return MESES.map((mes, i) => ({ mes, procesos: serie[i] }));
  }, [totales.total]);

  const filas: RowData[] = procesos.map((p) => {
    const eficiencia = Math.round(((p.total - p.conIncidencias) / p.total) * 100);
    return {
      id: p.categoria,
      cells: {
        proceso: { kind: "source", icon: p.icon, value: p.categoria },
        total: { kind: "number", value: String(p.total) },
        completados: { kind: "number", value: String(p.completados) },
        eficiencia: { kind: "progress", value: eficiencia },
        tiempo: { kind: "text", value: formatearDuracion(p.minutosMedios) },
        incidencias: { kind: "number", value: String(p.conIncidencias) },
      },
    };
  });

  const estadoActual = [
    { id: "completados", label: "Completados", value: totales.completados, color: "#22c55e" },
    { id: "proceso", label: "En proceso", value: totales.enProceso, color: "#3b82f6" },
    { id: "pendientes", label: "Pendientes", value: totales.pendientes, color: "#f59e0b" },
  ].filter((s) => s.value > 0);

  const hallazgos = useMemo((): Insight[] => {
    const out: Insight[] = [];
    const conEficiencia = procesos.map((p) => ({
      ...p,
      eficiencia: Math.round(((p.total - p.conIncidencias) / p.total) * 100),
    }));
    const mejores = [...conEficiencia].sort((a, b) => b.eficiencia - a.eficiencia).slice(0, 2);
    const peor = [...conEficiencia].sort((a, b) => a.eficiencia - b.eficiencia)[0];

    if (mejores.length === 2 && peor) {
      out.push({
        id: "eficiencia",
        icon: "Lightbulb",
        color: "#e0a836",
        text: `${mejores[0].categoria} y ${mejores[1].categoria} muestran la mayor eficiencia (${mejores[0].eficiencia}% y ${mejores[1].eficiencia}%), mientras que ${peor.categoria} requiere atención con un ${peor.eficiencia}%.`,
      });
    }
    const lento = [...procesos].sort((a, b) => b.minutosMedios - a.minutosMedios)[0];
    if (lento) {
      out.push({
        id: "lento",
        icon: "Timer",
        color: "#f43f5e",
        text: `${lento.categoria} es lo que más tarda en resolverse: ${formatearDuracion(lento.minutosMedios)} de media.`,
      });
    }
    const top = porAsesor[0];
    if (top) {
      out.push({
        id: "asesor",
        icon: "Users",
        color: "#a78bfa",
        text: `${top.owner} lleva el mayor volumen: ${top.total} procesos con un ${top.eficiencia}% de eficiencia.`,
      });
    }
    return out;
  }, [procesos, porAsesor]);

  const isEmpty = !loading && totales.total === 0;

  const sidePanel = isEmpty ? null : (
    <>
      <BlockFrame title="Tiempo promedio por proceso" icon="Timer">
        <RankedBarList
          rows={procesos.map((p) => ({ id: p.categoria, label: p.categoria, value: p.minutosMedios, color: p.color }))}
          formatValue={formatearDuracion}
        />
      </BlockFrame>

      <BlockFrame title="Top asesores por volumen" icon="Users">
        <RankedBarList
          rows={porAsesor.slice(0, 5).map((a) => ({
            id: a.owner,
            label: a.owner,
            value: a.total,
            color: TONE_COLOR[slaTone(a.eficiencia)],
            person: true,
            ranked: true,
          }))}
        />
      </BlockFrame>

      <BlockFrame title="Hallazgos" icon="Lightbulb">
        <InsightList insights={hallazgos} />
      </BlockFrame>

      <BlockFrame title="Acciones rápidas" icon="Zap">
        <QuickActionGrid
          columns={2}
          actions={[
            { id: "operativos", icon: "BarChart3", label: "Reportes operativos", href: "/operaciones/reportes-operativos" },
            { id: "impl", icon: "Layers", label: "Implementaciones", href: "/operaciones/implementaciones" },
            { id: "sla", icon: "ShieldCheck", label: "SLA y cumplimiento", href: "/operaciones/sla-cumplimiento" },
            { id: "config", icon: "Settings", label: "Configurar", href: "/operaciones/configuracion" },
          ]}
        />
      </BlockFrame>
    </>
  );

  return (
    <PageShell
      title="Reportes de Procesos"
      description="Analiza el desempeño y la eficiencia de los procesos operativos de punta a punta."
      icon="GitBranch"
      starrable={false}
      sidePanel={sidePanel}
      blocks={{ items: blocks, onUpdate: updateBlock, onDelete: removeBlock, onAdd: composer.openFor }}
      headerActions={
        <>
          <Button variant="outline" size="sm" className="border-white/12 bg-white/[0.03] text-white/70 hover:bg-white/[0.06]">
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Exportar
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
            icon="GitBranch"
            title="Todavía no hay procesos que analizar"
            description="Esta página compara las categorías de trabajo entre sí: cuánto se completa, con cuánta fricción y en cuánto tiempo. Se llena conforme el módulo tenga movimiento."
          />
        </div>
      ) : (
        <>
          <KpiStrip
            layout="inline"
            items={[
              { id: "total", label: "Total de procesos", value: String(totales.total), sub: "en el módulo", icon: "Layers", tone: "violet" },
              { id: "completados", label: "Procesos completados", value: String(totales.completados), sub: `${Math.round((totales.completados / totales.total) * 100)}% del total`, icon: "CheckCircle2", tone: "emerald" },
              { id: "tiempo", label: "Tiempo promedio", value: formatearDuracion(totales.minutosMedios), sub: "estimado", icon: "Timer", tone: "amber" },
              { id: "eficiencia", label: "Eficiencia", value: `${totales.eficiencia}%`, sub: "sin incidencias", icon: "TrendingUp", tone: "gold", ring: totales.eficiencia },
              { id: "incidencias", label: "Procesos con incidencias", value: String(totales.conIncidencias), sub: "requieren atención", icon: "TriangleAlert", tone: "rose" },
            ]}
          />

          <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
            <BlockFrame title="Evolución de procesos en el tiempo" icon="TrendingUp">
              <LineChart
                data={evolucion}
                categoryKey="dia"
                series={[
                  { key: "completados", label: "Completados", color: "#22c55e" },
                  { key: "enProceso", label: "En proceso", color: "#3b82f6" },
                  { key: "incidencias", label: "Con incidencias", color: "#f43f5e", dashed: true },
                ]}
              />
            </BlockFrame>

            <BlockFrame title="Distribución por tipo de proceso" icon="PieChart">
              <DonutChart
                slices={procesos.map((p) => ({ id: p.categoria, label: p.categoria, value: p.total, color: p.color }))}
                centerValue={String(totales.total)}
                centerLabel="Total"
              />
            </BlockFrame>

            <BlockFrame title="Estado actual de procesos" icon="Activity">
              <DonutChart slices={estadoActual} centerValue={String(totales.total)} centerLabel="Total" />
            </BlockFrame>

            <BlockFrame title="Comparativo mensual" icon="BarChart4">
              <ColumnChart data={comparativo} categoryKey="mes" valueKey="procesos" color="#a78bfa" />
            </BlockFrame>
          </div>

          <BlockFrame title="Desempeño por proceso" icon="Table">
            <DataTable
              columns={[
                { id: "proceso", header: "Proceso", sortable: true },
                { id: "total", header: "Total", sortable: true, width: "100px" },
                { id: "completados", header: "Completados", sortable: true, width: "130px" },
                { id: "eficiencia", header: "Eficiencia", sortable: true, width: "170px" },
                { id: "tiempo", header: "Tiempo prom.", sortable: true, width: "130px" },
                { id: "incidencias", header: "Incidencias", sortable: true, width: "120px" },
              ]}
              rows={filas}
            />
          </BlockFrame>
        </>
      )}

      <AddBlockDialog {...composer.dialogProps} />
    </PageShell>
  );
}
