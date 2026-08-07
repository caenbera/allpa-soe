"use client";

import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { PageShell, PageTabs } from "@/components/page-blocks/PageShell";
import { AddBlockDialog } from "@/components/page-blocks/AddBlockDialog";
import { useBlockComposer } from "@/components/page-blocks/use-block-composer";
import { BlockFrame } from "@/components/page-blocks/BlockFrame";
import { EmptyState, LoadingState } from "@/components/page-blocks/EmptyState";
import { KpiStrip } from "@/components/page-blocks/blocks/KpiStrip";
import { DataTable, type RowData } from "@/components/page-blocks/blocks/DataTable";
import { DonutChart } from "@/components/page-blocks/blocks/DonutChart";
import { LineChart, ColumnChart } from "@/components/page-blocks/blocks/TrendCharts";
import { BarChart } from "@/components/page-blocks/blocks/Charts";
import { RankedBarList } from "@/components/page-blocks/blocks/RankedBarList";
import { KpiProgressList } from "@/components/page-blocks/blocks/KpiProgressList";
import { InsightList } from "@/components/page-blocks/blocks/InsightList";
import { ActivityFeed } from "@/components/page-blocks/blocks/ActivityFeed";
import { StatTileList } from "@/components/page-blocks/blocks/StatTileList";
import { Button } from "@/components/ui/button";
import { useContent } from "@/lib/use-content";
import { usePageConfig } from "@/lib/use-page-config";
import {
  cohortesPorMadurez,
  cohortesPorProfundidad,
  money,
  rollupByAdvisor,
  rollupByFamily,
  rollupBySolution,
  share,
  totals,
} from "@/lib/solution-metrics";
import {
  ASSIGNMENT_STATUS_COLOR,
  SOL_ACTIVITY_META,
  SOL_COLLECTIONS,
  type SolActivity,
  type SolAssignment,
  type SolUseCase,
  type Solution,
} from "@/lib/solution-types";

const TABS = [
  { value: "resumen", label: "Resumen" },
  { value: "soluciones", label: "Soluciones" },
  { value: "clientes", label: "Clientes" },
  { value: "rendimiento", label: "Rendimiento" },
  { value: "tendencias", label: "Tendencias" },
  { value: "cohortes", label: "Cohortes" },
];

const MESES = ["Sep", "Oct", "Nov", "Dic", "Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago"];

/**
 * Curva ilustrativa a partir del valor de hoy.
 *
 * El módulo guarda el estado actual, no una serie histórica: no hay de dónde
 * sacar la evolución real. Se genera de forma determinista —no con
 * `Math.random`— para que no baile entre repintados, y todas las pantallas
 * que la usan lo dicen en su encabezado.
 */
function serie(valor: number, puntos: number, arranque = 0.6): number[] {
  const base = Math.max(valor, 1);
  return Array.from({ length: puntos }, (_, i) => {
    const avance = arranque + (1 - arranque) * (i / (puntos - 1));
    const onda = Math.sin(i * 0.85) * 0.04 + Math.sin(i * 0.3) * 0.02;
    return Math.round(base * (avance + onda));
  });
}

const AVISO_SERIE = "Curva ilustrativa: el módulo guarda el estado actual, no una serie histórica.";

export function AnaliticaSolucionesView() {
  const solutions = useContent<Solution>(SOL_COLLECTIONS.solutions);
  const assignments = useContent<SolAssignment>(SOL_COLLECTIONS.assignments);
  const activities = useContent<SolActivity>(SOL_COLLECTIONS.activities);
  const useCases = useContent<SolUseCase>(SOL_COLLECTIONS.useCases);

  const { blocks, addBlock, updateBlock, removeBlock } = usePageConfig("/soluciones/analitica");
  const composer = useBlockComposer(addBlock);

  const [tab, setTab] = useState("resumen");

  const loading = solutions.loading || assignments.loading || activities.loading || useCases.loading;

  const planes = useMemo(() => [...solutions.items].sort((a, b) => a.order - b.order), [solutions.items]);
  const asignaciones = assignments.items;

  const totales = useMemo(() => totals(planes, asignaciones), [planes, asignaciones]);
  const porPlan = useMemo(() => rollupBySolution(asignaciones), [asignaciones]);
  const porAsesor = useMemo(() => rollupByAdvisor(asignaciones), [asignaciones]);
  const porFamilia = useMemo(() => rollupByFamily(asignaciones), [asignaciones]);
  const cohortes = useMemo(() => cohortesPorProfundidad(asignaciones), [asignaciones]);
  const madurez = useMemo(() => cohortesPorMadurez(asignaciones), [asignaciones]);

  const porEstado = useMemo(() => {
    const mapa = new Map<string, number>();
    asignaciones.forEach((a) => mapa.set(a.status, (mapa.get(a.status) ?? 0) + 1));
    return [...mapa.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([label, value]) => ({
        id: label,
        label,
        value,
        color: ASSIGNMENT_STATUS_COLOR[label as keyof typeof ASSIGNMENT_STATUS_COLOR] ?? "#64748b",
      }));
  }, [asignaciones]);

  const masContratadas = useMemo(
    () =>
      planes
        .map((s) => ({ id: s.slug, label: s.name, value: porPlan.get(s.slug)?.assignments ?? 0, color: s.color }))
        .filter((s) => s.value > 0)
        .sort((a, b) => b.value - a.value),
    [planes, porPlan]
  );

  const isEmpty = !loading && asignaciones.length === 0;

  const hallazgos = useMemo(() => {
    if (asignaciones.length === 0) return [];
    const lider = masContratadas[0];
    const mejorAsesor = [...porAsesor].sort((a, b) => b.progress - a.progress)[0];
    const masMadura = madurez[madurez.length - 1];
    const menosMadura = madurez[0];

    const out = [];
    if (lider) {
      out.push({
        id: "lider",
        icon: "Trophy",
        color: "#e0a836",
        text: `${lider.label} es la solución más contratada: ${lider.value} de ${totales.active} planes (${share(lider.value, totales.active)}%).`,
      });
    }
    if (mejorAsesor) {
      out.push({
        id: "asesor",
        icon: "UserRound",
        color: "#a78bfa",
        text: `${mejorAsesor.key} lleva la cartera con más avance: ${mejorAsesor.progress}% de media en ${mejorAsesor.assignments} planes.`,
      });
    }
    if (masMadura && menosMadura && masMadura.id !== menosMadura.id) {
      out.push({
        id: "cohorte",
        icon: "Layers",
        color: "#22c55e",
        text: `${masMadura.families} familias están en fase ${masMadura.label.split(" (")[0].toLowerCase()} y ${menosMadura.families} siguen en ${menosMadura.label.split(" (")[0].toLowerCase()}: ahí está el margen de mejora más claro.`,
      });
    }
    if (totales.stalled > 0) {
      out.push({
        id: "atencion",
        icon: "TriangleAlert",
        color: "#f43f5e",
        text: `${totales.stalled} planes están pausados o requieren atención, un ${share(totales.stalled, totales.active)}% del total.`,
      });
    }
    return out;
  }, [asignaciones, masContratadas, porAsesor, madurez, totales]);

  const sidePanel = (
    <>
      <BlockFrame title="Indicadores del módulo" icon="ClipboardList">
        <StatTileList
          columns={2}
          tiles={[
            { id: "planes", icon: "Layers", color: "#a78bfa", value: String(totales.plans), label: "Planes en catálogo" },
            { id: "activos", icon: "ShieldCheck", color: "#22c55e", value: String(totales.active), label: "Planes contratados" },
            { id: "familias", icon: "Users", color: "#3b82f6", value: String(totales.families), label: "Familias vinculadas" },
            { id: "casos", icon: "Lightbulb", color: "#e0a836", value: String(useCases.items.length), label: "Casos de uso" },
          ]}
        />
      </BlockFrame>

      <BlockFrame title="Hallazgos" icon="Lightbulb">
        <InsightList insights={hallazgos} />
      </BlockFrame>

      <BlockFrame title="Actividad reciente" icon="History">
        <ActivityFeed
          compact
          entries={[...activities.items]
            .sort((a, b) => a.order - b.order)
            .slice(0, 5)
            .map((a) => ({
              id: a.id,
              icon: SOL_ACTIVITY_META[a.kind].icon,
              color: SOL_ACTIVITY_META[a.kind].color,
              title: a.title,
              detail: a.familyName,
              timeLabel: a.dayLabel,
            }))}
        />
      </BlockFrame>
    </>
  );

  // ── Contenido de cada pestaña ────────────────────────────────────────────

  const filasPorPlan: RowData[] = planes.map((s) => {
    const r = porPlan.get(s.slug);
    return {
      id: s.id,
      cells: {
        plan: { kind: "source", icon: s.icon, value: s.name, sub: s.kind },
        familias: { kind: "number", value: String(r?.families ?? 0) },
        planes: { kind: "number", value: String(r?.assignments ?? 0) },
        cobertura: { kind: "text", value: money(r?.coverage ?? 0) },
        avance: { kind: "progress", value: r?.progress ?? 0 },
        completos: { kind: "number", value: String(r?.implemented ?? 0) },
        atencion: { kind: "number", value: String(r?.stalled ?? 0) },
      },
    };
  });

  const filasPorFamilia: RowData[] = porFamilia.map((f) => ({
    id: f.key,
    cells: {
      familia: { kind: "source", icon: "Users", value: f.key },
      planes: { kind: "number", value: String(f.assignments) },
      cobertura: { kind: "text", value: money(f.coverage) },
      avance: { kind: "progress", value: f.progress },
      completos: { kind: "number", value: String(f.implemented) },
      atencion: { kind: "number", value: String(f.stalled) },
    },
  }));

  const filasPorAsesor: RowData[] = porAsesor.map((a) => ({
    id: a.key,
    cells: {
      asesor: { kind: "person", name: a.key, role: `${a.assignments} planes` },
      planes: { kind: "number", value: String(a.assignments) },
      cobertura: { kind: "text", value: money(a.coverage) },
      avance: { kind: "progress", value: a.progress },
      completos: { kind: "number", value: String(a.implemented) },
      atencion: { kind: "number", value: String(a.stalled) },
    },
  }));

  const evolucion = useMemo(() => {
    const contratados = serie(totales.active, MESES.length, 0.55);
    const familias = serie(totales.families, MESES.length, 0.6);
    return MESES.map((mes, i) => ({ mes, contratados: contratados[i], familias: familias[i] }));
  }, [totales.active, totales.families]);

  const comparativo = useMemo(() => {
    const s = serie(totales.coverage / 1000, MESES.length, 0.5);
    return MESES.map((mes, i) => ({ mes, cobertura: s[i] }));
  }, [totales.coverage]);

  return (
    <PageShell
      title="Analítica"
      description="Explora el rendimiento de nuestras soluciones y toma decisiones basadas en datos."
      icon="LineChart"
      sidePanel={sidePanel}
      blocks={{ items: blocks, onUpdate: updateBlock, onDelete: removeBlock, onAdd: composer.openFor }}
      headerActions={
        <Button
          variant="outline"
          size="sm"
          className="border-white/12 bg-white/[0.03] text-white/70 hover:bg-white/[0.06]"
          onClick={() => toast.info("Exportar el reporte llega con la gestión documental.")}
        >
          <Download className="mr-1.5 h-3.5 w-3.5" />
          Exportar reporte
        </Button>
      }
    >
      <PageTabs tabs={TABS} active={tab} onChange={setTab} />

      {loading ? (
        <div className="surface-card">
          <LoadingState />
        </div>
      ) : isEmpty ? (
        <div className="surface-card">
          <EmptyState
            icon="LineChart"
            title="Todavía no hay nada que analizar"
            description="Cuando se asigne el primer plan a una familia, esta pantalla se llenará sola."
          />
        </div>
      ) : (
        <>
          <KpiStrip
            layout="inline"
            items={[
              { id: "familias", label: "Familias vinculadas", value: String(totales.families), sub: "con al menos un plan", icon: "Users", tone: "violet" },
              { id: "contratados", label: "Planes contratados", value: String(totales.active), sub: `${totales.plans} en catálogo`, icon: "ShieldCheck", tone: "blue" },
              { id: "patrimonio", label: "Patrimonio protegido", value: money(totales.coverage), sub: "suma asegurada", icon: "Landmark", tone: "gold" },
              { id: "casos", label: "Casos de uso", value: String(useCases.items.length), sub: "en el catálogo", icon: "Lightbulb", tone: "amber" },
              { id: "implementacion", label: "Tasa de implementación", value: `${totales.progress}%`, sub: `${totales.implemented} completos`, icon: "TrendingUp", tone: "emerald", ring: totales.progress },
            ]}
          />

          {tab === "resumen" && (
            <>
              <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                <BlockFrame title="Evolución de la cartera" icon="TrendingUp">
                  <p className="mb-2 text-xs text-white/35">{AVISO_SERIE}</p>
                  <LineChart
                    data={evolucion}
                    categoryKey="mes"
                    series={[
                      { key: "contratados", label: "Planes contratados", color: "#a78bfa" },
                      { key: "familias", label: "Familias vinculadas", color: "#22c55e", dashed: true },
                    ]}
                  />
                </BlockFrame>

                <BlockFrame title="Soluciones más contratadas" icon="PieChart">
                  <DonutChart slices={masContratadas} centerValue={String(totales.active)} centerLabel="Planes" />
                </BlockFrame>
              </div>

              <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                <BlockFrame title="Estado de los planes contratados" icon="ChartPie">
                  <DonutChart slices={porEstado} centerValue={String(totales.active)} centerLabel="Total" />
                </BlockFrame>

                <BlockFrame title="Patrimonio protegido por plan" icon="BarChart3">
                  <RankedBarList
                    rows={planes
                      .map((s) => ({ id: s.slug, label: s.name, value: porPlan.get(s.slug)?.coverage ?? 0, color: s.color }))
                      .filter((r) => r.value > 0)
                      .sort((a, b) => b.value - a.value)}
                  />
                  <p className="mt-2.5 text-xs text-white/35">Suma asegurada acumulada de cada plan, en dólares.</p>
                </BlockFrame>
              </div>
            </>
          )}

          {tab === "soluciones" && (
            <BlockFrame title="Desempeño por solución" icon="Layers">
              <DataTable
                columns={[
                  { id: "plan", header: "Solución", sortable: true },
                  { id: "familias", header: "Familias", sortable: true, width: "110px" },
                  { id: "planes", header: "Contratados", sortable: true, width: "130px" },
                  { id: "cobertura", header: "Cobertura", sortable: true, width: "130px" },
                  { id: "avance", header: "Avance medio", sortable: true, width: "170px" },
                  { id: "completos", header: "Completos", sortable: true, width: "120px" },
                  { id: "atencion", header: "Con atención", sortable: true, width: "130px" },
                ]}
                rows={filasPorPlan}
              />
            </BlockFrame>
          )}

          {tab === "clientes" && (
            <>
              <BlockFrame title="Cartera por familia" icon="Users">
                <DataTable
                  columns={[
                    { id: "familia", header: "Familia", sortable: true },
                    { id: "planes", header: "Planes contratados", sortable: true, width: "170px" },
                    { id: "cobertura", header: "Cobertura", sortable: true, width: "130px" },
                    { id: "avance", header: "Avance medio", sortable: true, width: "170px" },
                    { id: "completos", header: "Completos", sortable: true, width: "120px" },
                    { id: "atencion", header: "Con atención", sortable: true, width: "130px" },
                  ]}
                  rows={filasPorFamilia}
                />
              </BlockFrame>

              <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                <BlockFrame title="Familias por patrimonio protegido" icon="BarChart3">
                  <RankedBarList
                    rows={porFamilia
                      .filter((f) => f.coverage > 0)
                      .sort((a, b) => b.coverage - a.coverage)
                      .map((f) => ({ id: f.key, label: f.key, value: f.coverage, color: "#a78bfa", person: true }))}
                  />
                </BlockFrame>

                <BlockFrame title="Planes por familia" icon="Layers">
                  <KpiProgressList
                    rows={porFamilia.map((f) => ({
                      id: f.key,
                      label: f.key,
                      icon: "Users",
                      value: `${f.assignments} planes`,
                      percent: share(f.assignments, totales.plans),
                    }))}
                  />
                  <p className="mt-2.5 text-xs text-white/35">
                    El porcentaje es sobre los {totales.plans} planes del catálogo: cuánto del catálogo tiene cada familia.
                  </p>
                </BlockFrame>
              </div>
            </>
          )}

          {tab === "rendimiento" && (
            <>
              <BlockFrame title="Desempeño por asesor" icon="UserRound">
                <DataTable
                  columns={[
                    { id: "asesor", header: "Asesor", sortable: true },
                    { id: "planes", header: "Planes", sortable: true, width: "110px" },
                    { id: "cobertura", header: "Cobertura", sortable: true, width: "130px" },
                    { id: "avance", header: "Avance medio", sortable: true, width: "170px" },
                    { id: "completos", header: "Completos", sortable: true, width: "120px" },
                    { id: "atencion", header: "Con atención", sortable: true, width: "130px" },
                  ]}
                  rows={filasPorAsesor}
                />
              </BlockFrame>

              <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                <BlockFrame title="Volumen por asesor" icon="BarChart3">
                  <BarChart
                    data={porAsesor.map((a) => ({ asesor: a.key, planes: a.assignments, completos: a.implemented }))}
                    categoryKey="asesor"
                    series={[
                      { key: "planes", label: "Planes asignados", color: "#a78bfa" },
                      { key: "completos", label: "Implementados", color: "#22c55e" },
                    ]}
                  />
                </BlockFrame>

                <BlockFrame title="Avance medio por asesor" icon="TrendingUp">
                  <KpiProgressList
                    rows={porAsesor.map((a) => ({
                      id: a.key,
                      label: a.key,
                      icon: "UserRound",
                      value: `${a.implemented} completos`,
                      percent: a.progress,
                    }))}
                  />
                </BlockFrame>
              </div>
            </>
          )}

          {tab === "tendencias" && (
            <>
              <BlockFrame title="Evolución de la cartera" icon="TrendingUp">
                <p className="mb-2 text-xs text-white/35">{AVISO_SERIE}</p>
                <LineChart
                  data={evolucion}
                  categoryKey="mes"
                  series={[
                    { key: "contratados", label: "Planes contratados", color: "#a78bfa" },
                    { key: "familias", label: "Familias vinculadas", color: "#22c55e", dashed: true },
                  ]}
                />
              </BlockFrame>

              <BlockFrame title="Patrimonio protegido por mes" icon="BarChart4">
                <p className="mb-2 text-xs text-white/35">{AVISO_SERIE} Las cifras van en miles de dólares.</p>
                <ColumnChart data={comparativo} categoryKey="mes" valueKey="cobertura" color="#e0a836" />
              </BlockFrame>
            </>
          )}

          {tab === "cohortes" && (
            <>
              <BlockFrame title="Cohortes por madurez de implementación" icon="Gauge">
                <p className="mb-3 text-sm text-white/45">
                  Las familias agrupadas por el avance medio de sus planes: en qué punto del camino está cada una.
                </p>
                <DataTable
                  columns={[
                    { id: "cohorte", header: "Cohorte", sortable: true },
                    { id: "familias", header: "Familias", sortable: true, width: "120px" },
                    { id: "planes", header: "Planes", sortable: true, width: "110px" },
                    { id: "cobertura", header: "Cobertura", sortable: true, width: "140px" },
                    { id: "avance", header: "Avance medio", sortable: true, width: "180px" },
                  ]}
                  rows={madurez.map((c) => ({
                    id: c.id,
                    cells: {
                      cohorte: { kind: "source", icon: "Gauge", value: c.label },
                      familias: { kind: "number", value: String(c.families) },
                      planes: { kind: "number", value: String(c.assignments) },
                      cobertura: { kind: "text", value: money(c.coverage) },
                      avance: { kind: "progress", value: c.progress },
                    },
                  }))}
                />
              </BlockFrame>

              <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                <BlockFrame title="Reparto de familias por madurez" icon="PieChart">
                  <DonutChart
                    slices={madurez.map((c) => ({ id: c.id, label: c.label, value: c.families, color: c.color }))}
                    centerValue={String(totales.families)}
                    centerLabel="Familias"
                  />
                </BlockFrame>

                <BlockFrame title="Avance medio de cada cohorte" icon="TrendingUp">
                  <KpiProgressList
                    rows={madurez.map((c) => ({
                      id: c.id,
                      label: c.label.split(" (")[0],
                      icon: "Gauge",
                      value: `${c.families} familias`,
                      percent: c.progress,
                    }))}
                  />
                  <p className="mt-2.5 text-xs text-white/35">
                    Media ponderada por planes: una familia con seis pesa más que una con uno.
                  </p>
                </BlockFrame>
              </div>

              <BlockFrame title="Cohortes por profundidad de relación" icon="Layers">
                <p className="mb-3 text-sm text-white/45">
                  Las familias agrupadas por cuántos planes tienen contratados. Responde si profundizar la relación
                  acompaña a una mejor implementación, y sale de los mismos datos —el módulo no guarda fecha de alta,
                  así que no se puede cohortar por antigüedad sin inventarla.
                </p>
                <DataTable
                  columns={[
                    { id: "cohorte", header: "Cohorte", sortable: true },
                    { id: "familias", header: "Familias", sortable: true, width: "120px" },
                    { id: "planes", header: "Planes", sortable: true, width: "110px" },
                    { id: "cobertura", header: "Cobertura", sortable: true, width: "140px" },
                    { id: "avance", header: "Avance medio", sortable: true, width: "180px" },
                  ]}
                  rows={cohortes.map((c) => ({
                    id: c.id,
                    cells: {
                      cohorte: { kind: "source", icon: "Layers", value: c.label },
                      familias: { kind: "number", value: String(c.families) },
                      planes: { kind: "number", value: String(c.assignments) },
                      cobertura: { kind: "text", value: money(c.coverage) },
                      avance: { kind: "progress", value: c.progress },
                    },
                  }))}
                />
                {cohortes.length === 1 && (
                  <p className="mt-3 text-xs text-white/35">
                    Toda la cartera cae en un mismo tramo, así que esta lectura no distingue nada por ahora: las
                    familias tienen una relación igual de profunda. La cohorte por madurez, arriba, sí las separa.
                  </p>
                )}
              </BlockFrame>
            </>
          )}
        </>
      )}

      <AddBlockDialog {...composer.dialogProps} />
    </PageShell>
  );
}
