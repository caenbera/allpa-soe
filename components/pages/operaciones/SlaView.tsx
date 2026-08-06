"use client";

import { useMemo, useState } from "react";
import { Download, Info } from "lucide-react";
import { PageShell, PageTabs } from "@/components/page-blocks/PageShell";
import { AddBlockDialog } from "@/components/page-blocks/AddBlockDialog";
import { useBlockComposer } from "@/components/page-blocks/use-block-composer";
import { BlockFrame } from "@/components/page-blocks/BlockFrame";
import { EmptyState, LoadingState } from "@/components/page-blocks/EmptyState";
import { KpiStrip } from "@/components/page-blocks/blocks/KpiStrip";
import { DataTable, type RowData } from "@/components/page-blocks/blocks/DataTable";
import { DonutChart } from "@/components/page-blocks/blocks/DonutChart";
import { RankedBarList } from "@/components/page-blocks/blocks/RankedBarList";
import { MetricDeltaList } from "@/components/page-blocks/blocks/MetricDeltaList";
import { InsightList, type Insight } from "@/components/page-blocks/blocks/InsightList";
import { QuickActionGrid } from "@/components/page-blocks/blocks/QuickActionGrid";
import { Button } from "@/components/ui/button";
import { useContent } from "@/lib/use-content";
import { usePageConfig } from "@/lib/use-page-config";
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
  type SlaPolicy,
} from "@/lib/ops-types";

const TABS = [
  { value: "resumen", label: "Resumen" },
  { value: "proceso", label: "SLA por proceso" },
  { value: "asesor", label: "SLA por asesor" },
  { value: "incumplimientos", label: "Incumplimientos" },
  { value: "politicas", label: "Políticas y controles" },
];

const TONE_COLOR: Record<string, string> = { emerald: "#22c55e", amber: "#f59e0b", rose: "#f43f5e", neutral: "#94a3b8" };

/** Cualquier cosa con dueño, fecha y marca de atraso cuenta para el SLA. */
interface Medible {
  owner: string;
  overdue: boolean;
  cerrado: boolean;
}

export function SlaView() {
  const [tab, setTab] = useState("resumen");

  const tasks = useContent<OpsTask>(OPS_COLLECTIONS.tasks);
  const implementations = useContent<Implementation>(OPS_COLLECTIONS.implementations);
  const reviews = useContent<OpsReview>(OPS_COLLECTIONS.reviews);
  const documents = useContent<OpsDocument>(OPS_COLLECTIONS.documents);
  const signatures = useContent<OpsSignature>(OPS_COLLECTIONS.signatures);
  const renewals = useContent<OpsRenewal>(OPS_COLLECTIONS.renewals);
  const specialCases = useContent<OpsSpecialCase>(OPS_COLLECTIONS.specialCases);
  const policies = useContent<SlaPolicy>(OPS_COLLECTIONS.slaPolicies);

  const { blocks, addBlock, updateBlock, removeBlock } = usePageConfig("/operaciones/sla-cumplimiento");
  const composer = useBlockComposer(addBlock);

  const loading =
    tasks.loading || implementations.loading || reviews.loading || documents.loading || signatures.loading ||
    renewals.loading || specialCases.loading || policies.loading;

  /**
   * El cumplimiento se **calcula** de las demás colecciones en vez de
   * guardarse: la proporción de lo que no está fuera de plazo. Así no puede
   * quedar desfasado respecto a lo que muestran las bandejas.
   */
  const porCategoria = useMemo(() => {
    const cerrado = (s: string) => s === "Resuelto" || s === "Completado";

    const grupos: { categoria: string; items: Medible[] }[] = [
      {
        categoria: "Implementaciones",
        items: implementations.items.map((i) => ({
          owner: i.owner,
          overdue: i.phases.some((f) => f.steps.some((s) => s.overdue && s.status !== "Completado")),
          cerrado: i.stage === "completado",
        })),
      },
      { categoria: "Tareas", items: tasks.items.map((t) => ({ owner: t.delegatedTo || t.owner, overdue: t.overdue, cerrado: t.stage === "completada" })) },
      { categoria: "Revisiones", items: reviews.items.map((r) => ({ owner: r.owner, overdue: r.overdue, cerrado: cerrado(r.status) })) },
      { categoria: "Documentos y Firmas", items: [...documents.items, ...signatures.items].map((d) => ({ owner: d.owner, overdue: d.overdue, cerrado: cerrado(d.status) })) },
      { categoria: "Renovaciones", items: renewals.items.map((r) => ({ owner: r.owner, overdue: r.overdue, cerrado: cerrado(r.status) })) },
      { categoria: "Casos Especiales", items: specialCases.items.map((c) => ({ owner: c.owner, overdue: c.overdue, cerrado: cerrado(c.status) })) },
    ];

    return grupos
      .filter((g) => g.items.length > 0)
      .map((g) => {
        const fuera = g.items.filter((i) => i.overdue && !i.cerrado).length;
        const total = g.items.length;
        return {
          categoria: g.categoria,
          total,
          fuera,
          dentro: total - fuera,
          cumplimiento: total > 0 ? Math.round(((total - fuera) / total) * 100) : 100,
          items: g.items,
        };
      });
  }, [implementations.items, tasks.items, reviews.items, documents.items, signatures.items, renewals.items, specialCases.items]);

  const totales = useMemo(() => {
    const total = porCategoria.reduce((s, c) => s + c.total, 0);
    const fuera = porCategoria.reduce((s, c) => s + c.fuera, 0);
    return {
      total,
      fuera,
      dentro: total - fuera,
      cumplimiento: total > 0 ? Math.round(((total - fuera) / total) * 100) : 100,
      politicaMedia:
        policies.items.length > 0
          ? Math.round(policies.items.reduce((s, p) => s + p.compliance, 0) / policies.items.length)
          : 0,
    };
  }, [porCategoria, policies.items]);

  /** Mismo cálculo, agrupando por quién lleva cada cosa. */
  const porAsesor = useMemo(() => {
    const map = new Map<string, { total: number; fuera: number }>();
    porCategoria.forEach((c) =>
      c.items.forEach((i) => {
        if (!i.owner) return;
        const prev = map.get(i.owner) ?? { total: 0, fuera: 0 };
        map.set(i.owner, { total: prev.total + 1, fuera: prev.fuera + (i.overdue && !i.cerrado ? 1 : 0) });
      })
    );
    return Array.from(map.entries())
      .map(([owner, { total, fuera }]) => ({
        owner,
        total,
        fuera,
        cumplimiento: Math.round(((total - fuera) / total) * 100),
      }))
      .sort((a, b) => b.cumplimiento - a.cumplimiento);
  }, [porCategoria]);

  const incumplimientos = useMemo(
    () => porCategoria.filter((c) => c.fuera > 0).sort((a, b) => b.fuera - a.fuera),
    [porCategoria]
  );

  const hallazgos = useMemo((): Insight[] => {
    const out: Insight[] = [];
    const peor = [...porCategoria].sort((a, b) => a.cumplimiento - b.cumplimiento)[0];
    if (peor) {
      out.push({
        id: "peor",
        icon: "TriangleAlert",
        color: "#f43f5e",
        text: `${peor.categoria} es la categoría con menor cumplimiento: ${peor.cumplimiento}%, con ${peor.fuera} de ${peor.total} fuera de plazo.`,
      });
    }
    const flojo = porAsesor[porAsesor.length - 1];
    if (flojo && flojo.fuera > 0) {
      out.push({
        id: "asesor",
        icon: "UserRound",
        color: "#f59e0b",
        text: `${flojo.owner} acumula ${flojo.fuera} elementos fuera de plazo de ${flojo.total} asignados (${flojo.cumplimiento}% al día).`,
      });
    }
    const politicaFloja = [...policies.items].sort((a, b) => a.compliance - b.compliance)[0];
    if (politicaFloja) {
      out.push({
        id: "politica",
        icon: "ShieldAlert",
        color: "#a78bfa",
        text: `La política con menor cumplimiento es «${politicaFloja.name}», al ${politicaFloja.compliance}%.`,
      });
    }
    out.push({
      id: "global",
      icon: "ShieldCheck",
      color: "#22c55e",
      text: `En conjunto, ${totales.dentro} de ${totales.total} elementos están dentro de plazo (${totales.cumplimiento}%).`,
    });
    return out;
  }, [porCategoria, porAsesor, policies.items, totales]);

  const filasProceso: RowData[] = porCategoria.map((c) => ({
    id: c.categoria,
    cells: {
      categoria: { kind: "activity", value: c.categoria, color: TONE_COLOR[slaTone(c.cumplimiento)] },
      total: { kind: "number", value: String(c.total) },
      dentro: { kind: "number", value: String(c.dentro) },
      fuera: { kind: "number", value: String(c.fuera) },
      cumplimiento: { kind: "progress", value: c.cumplimiento },
      estado: { kind: "status", value: c.cumplimiento >= 95 ? "Dentro de SLA" : c.cumplimiento >= 90 ? "Advertencia" : "Fuera de SLA", tone: slaTone(c.cumplimiento) },
    },
  }));

  const filasAsesor: RowData[] = porAsesor.map((a) => ({
    id: a.owner,
    cells: {
      asesor: { kind: "person", name: a.owner },
      total: { kind: "number", value: String(a.total) },
      fuera: { kind: "number", value: String(a.fuera) },
      cumplimiento: { kind: "progress", value: a.cumplimiento },
      estado: { kind: "status", value: a.cumplimiento >= 95 ? "Dentro de SLA" : a.cumplimiento >= 90 ? "Advertencia" : "Fuera de SLA", tone: slaTone(a.cumplimiento) },
    },
  }));

  const isEmpty = !loading && totales.total === 0;

  const sidePanel = isEmpty ? null : (
    <>
      <BlockFrame title="Estado general" icon="ShieldCheck">
        <DonutChart
          slices={[
            { id: "dentro", label: "Dentro de plazo", value: totales.dentro, color: "#22c55e" },
            { id: "fuera", label: "Fuera de plazo", value: totales.fuera, color: "#f43f5e" },
          ].filter((s) => s.value > 0)}
          centerValue={String(totales.total)}
          centerLabel="Elementos"
        />
      </BlockFrame>

      <BlockFrame title="Hallazgos" icon="Lightbulb">
        <InsightList insights={hallazgos} />
      </BlockFrame>

      <BlockFrame title="Políticas con menor cumplimiento" icon="ShieldAlert">
        <MetricDeltaList
          rows={[...policies.items]
            .sort((a, b) => a.compliance - b.compliance)
            .slice(0, 5)
            .map((p) => ({
              id: p.id,
              label: p.name,
              value: `${p.compliance}%`,
              dotColor: TONE_COLOR[slaTone(p.compliance)],
            }))}
        />
      </BlockFrame>

      <BlockFrame title="Acciones rápidas" icon="Zap">
        <QuickActionGrid
          actions={[
            { id: "incump", icon: "TriangleAlert", label: "Ver incumplimientos" },
            { id: "reporte", icon: "Download", label: "Descargar reporte" },
            { id: "alertas", icon: "Bell", label: "Configurar alertas" },
            { id: "historial", icon: "History", label: "Historial de SLA" },
          ]}
        />
      </BlockFrame>
    </>
  );

  return (
    <PageShell
      title="SLA y Cumplimiento"
      description="Monitorea el cumplimiento de los acuerdos de servicio y políticas internas."
      icon="ShieldCheck"
      starrable={false}
      sidePanel={sidePanel}
      blocks={{ items: blocks, onUpdate: updateBlock, onDelete: removeBlock, onAdd: composer.openFor }}
      headerActions={
        <Button variant="outline" size="sm" className="border-white/12 bg-white/[0.03] text-white/70 hover:bg-white/[0.06]">
          <Download className="mr-1.5 h-3.5 w-3.5" />
          Exportar reporte
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
            icon="ShieldCheck"
            title="Todavía no hay nada que medir"
            description="El cumplimiento se calcula de lo que ocurre en el resto del módulo: implementaciones, tareas, revisiones, documentos y renovaciones. En cuanto haya trabajo en curso, aparecerá aquí."
          />
        </div>
      ) : (
        <>
          <KpiStrip
            layout="inline"
            items={[
              { id: "global", label: "Cumplimiento general", value: `${totales.cumplimiento}%`, sub: "dentro de plazo", icon: "ShieldCheck", tone: "gold", ring: totales.cumplimiento },
              { id: "dentro", label: "Dentro de plazo", value: String(totales.dentro), sub: `de ${totales.total}`, icon: "CheckCircle2", tone: "emerald" },
              { id: "fuera", label: "Fuera de plazo", value: String(totales.fuera), sub: `de ${totales.total}`, icon: "TriangleAlert", tone: "rose" },
              { id: "categorias", label: "Categorías medidas", value: String(porCategoria.length), sub: "del módulo", icon: "Layers", tone: "blue" },
              { id: "politicas", label: "Cumplimiento de políticas", value: `${totales.politicaMedia}%`, sub: "media de las internas", icon: "ClipboardCheck", tone: "violet" },
            ]}
          />

          <div className="surface-card mt-3 overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 pt-3">
              <PageTabs tabs={TABS} active={tab} onChange={setTab} />
              <span className="flex items-center gap-1.5 pb-2 text-[11px] text-white/30">
                <Info className="h-3 w-3" />
                Calculado sobre el trabajo registrado
              </span>
            </div>

            <div className="px-4 pb-4">
              {tab === "resumen" && (
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                  <div>
                    <p className="mb-2.5 text-sm font-medium text-[#f3ecd9]">Cumplimiento por categoría</p>
                    <RankedBarList
                      rows={porCategoria.map((c) => ({
                        id: c.categoria,
                        label: c.categoria,
                        value: c.cumplimiento,
                        color: TONE_COLOR[slaTone(c.cumplimiento)],
                      }))}
                      formatValue={(n) => `${n}%`}
                    />
                  </div>
                  <div>
                    <p className="mb-2.5 text-sm font-medium text-[#f3ecd9]">Cumplimiento por asesor</p>
                    <RankedBarList
                      rows={porAsesor.map((a) => ({
                        id: a.owner,
                        label: a.owner,
                        value: a.cumplimiento,
                        color: TONE_COLOR[slaTone(a.cumplimiento)],
                        person: true,
                      }))}
                      formatValue={(n) => `${n}%`}
                    />
                  </div>
                </div>
              )}

              {tab === "proceso" && (
                <DataTable
                  columns={[
                    { id: "categoria", header: "Categoría", sortable: true },
                    { id: "total", header: "Total", sortable: true, width: "100px" },
                    { id: "dentro", header: "Dentro", sortable: true, width: "100px" },
                    { id: "fuera", header: "Fuera", sortable: true, width: "100px" },
                    { id: "cumplimiento", header: "Cumplimiento", sortable: true, width: "170px" },
                    { id: "estado", header: "Estado", width: "150px" },
                  ]}
                  rows={filasProceso}
                />
              )}

              {tab === "asesor" && (
                <DataTable
                  columns={[
                    { id: "asesor", header: "Asesor", sortable: true },
                    { id: "total", header: "Asignados", sortable: true, width: "120px" },
                    { id: "fuera", header: "Fuera de plazo", sortable: true, width: "140px" },
                    { id: "cumplimiento", header: "Cumplimiento", sortable: true, width: "170px" },
                    { id: "estado", header: "Estado", width: "150px" },
                  ]}
                  rows={filasAsesor}
                />
              )}

              {tab === "incumplimientos" && (
                <>
                  {incumplimientos.length === 0 ? (
                    <p className="py-10 text-center text-sm text-white/45">
                      No hay nada fuera de plazo ahora mismo.
                    </p>
                  ) : (
                    <MetricDeltaList
                      rows={incumplimientos.map((c) => ({
                        id: c.categoria,
                        label: c.categoria,
                        value: `${c.fuera} de ${c.total}`,
                        dotColor: TONE_COLOR[slaTone(c.cumplimiento)],
                      }))}
                    />
                  )}
                </>
              )}

              {tab === "politicas" && (
                <DataTable
                  columns={[
                    { id: "politica", header: "Política", sortable: true },
                    { id: "descripcion", header: "Qué exige" },
                    { id: "cumplimiento", header: "Cumplimiento", sortable: true, width: "170px" },
                    { id: "estado", header: "Estado", width: "150px" },
                  ]}
                  rows={[...policies.items]
                    .sort((a, b) => a.compliance - b.compliance)
                    .map((p) => ({
                      id: p.id,
                      cells: {
                        politica: { kind: "text", value: p.name, strong: true },
                        descripcion: { kind: "text", value: p.description },
                        cumplimiento: { kind: "progress", value: p.compliance },
                        estado: {
                          kind: "status",
                          value: p.compliance >= 95 ? "Cumple" : p.compliance >= 90 ? "Advertencia" : "Por debajo",
                          tone: slaTone(p.compliance),
                        },
                      },
                    }))}
                />
              )}
            </div>
          </div>
        </>
      )}

      <AddBlockDialog {...composer.dialogProps} />
    </PageShell>
  );
}
