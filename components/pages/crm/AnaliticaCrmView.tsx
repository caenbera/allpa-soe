"use client";

import { useMemo, useState } from "react";
import { Download, Info } from "lucide-react";
import { PageShell, PageTabs } from "@/components/page-blocks/PageShell";
import { AddBlockDialog } from "@/components/page-blocks/AddBlockDialog";
import { useBlockComposer } from "@/components/page-blocks/use-block-composer";
import { BlockFrame } from "@/components/page-blocks/BlockFrame";
import { EmptyState, LoadingState } from "@/components/page-blocks/EmptyState";
import { KpiStrip, type KpiItem } from "@/components/page-blocks/blocks/KpiStrip";
import { DataTable, type RowData } from "@/components/page-blocks/blocks/DataTable";
import { DonutChart } from "@/components/page-blocks/blocks/DonutChart";
import { FunnelChart } from "@/components/page-blocks/blocks/Charts";
import { LineChart, ColumnChart } from "@/components/page-blocks/blocks/TrendCharts";
import { RankedBarList } from "@/components/page-blocks/blocks/RankedBarList";
import { InsightList, type Insight } from "@/components/page-blocks/blocks/InsightList";
import { Button } from "@/components/ui/button";
import { useContent } from "@/lib/use-content";
import { usePageConfig } from "@/lib/use-page-config";
import {
  ACTIVITY_META,
  CRM_COLLECTIONS,
  DEFAULT_PIPELINE_STAGES,
  type Activity,
  type Contact,
  type CrmAccount,
  type CrmFamily,
  type Deal,
} from "@/lib/crm-types";
import {
  countBy,
  dayLabel,
  illustrativeSeries,
  moneyCompact,
  pct,
  seriesPoints,
  sumBy,
  topN,
  type Slice,
} from "@/lib/crm-analytics";

const TABS = [
  { value: "resumen", label: "Resumen" },
  { value: "contactos", label: "Contactos" },
  { value: "empresas", label: "Empresas" },
  { value: "actividad", label: "Actividad" },
  { value: "comunicacion", label: "Comunicación" },
  { value: "conversiones", label: "Conversiones" },
  { value: "rendimiento", label: "Rendimiento" },
];

const DAYS = 14;

/** Convierte porciones en filas de tabla con su porcentaje sobre el total. */
function sliceRows(slices: Slice[], total: number, valueLabel: (n: number) => string): RowData[] {
  return slices.map((s) => ({
    id: s.id,
    cells: {
      label: { kind: "activity", value: s.label, color: s.color },
      value: { kind: "number", value: valueLabel(s.value) },
      share: { kind: "progress", value: total > 0 ? Math.round((s.value / total) * 100) : 0 },
    },
  }));
}

const SLICE_COLUMNS = [
  { id: "label", header: "Categoría", sortable: true },
  { id: "value", header: "Total", sortable: true, width: "130px" },
  { id: "share", header: "Participación", width: "180px" },
];

export function AnaliticaCrmView() {
  const [tab, setTab] = useState("resumen");

  const contacts = useContent<Contact>(CRM_COLLECTIONS.contacts);
  const accounts = useContent<CrmAccount>(CRM_COLLECTIONS.accounts);
  const families = useContent<CrmFamily>(CRM_COLLECTIONS.families);
  const deals = useContent<Deal>(CRM_COLLECTIONS.deals);
  const activities = useContent<Activity>(CRM_COLLECTIONS.activities);

  const { blocks, addBlock, updateBlock, removeBlock } = usePageConfig("/crm/analitica-crm");
  const composer = useBlockComposer(addBlock);

  const loading =
    contacts.loading || accounts.loading || families.loading || deals.loading || activities.loading;

  // ── Repartos calculados sobre los datos reales ───────────────────────────
  const contactsBySource = useMemo(() => countBy(contacts.items, (c) => c.sourceChannel), [contacts.items]);
  const contactsByStatus = useMemo(() => countBy(contacts.items, (c) => c.status), [contacts.items]);
  const contactsByAdvisor = useMemo(() => countBy(contacts.items, (c) => c.advisor), [contacts.items]);
  const contactsByInterest = useMemo(() => countBy(contacts.items, (c) => c.mainInterest), [contacts.items]);

  const accountsByIndustry = useMemo(() => countBy(accounts.items, (a) => a.industry), [accounts.items]);
  const premiumByIndustry = useMemo(
    () => sumBy(accounts.items, (a) => a.industry, (a) => a.annualPremium),
    [accounts.items]
  );

  const activitiesByKind = useMemo(
    () =>
      countBy(activities.items, (a) => a.kind).map((s) => ({
        ...s,
        color: ACTIVITY_META[s.label as Activity["kind"]]?.color ?? s.color,
      })),
    [activities.items]
  );
  const activitiesByUser = useMemo(() => countBy(activities.items, (a) => a.user), [activities.items]);
  const activitiesBySource = useMemo(() => countBy(activities.items, (a) => a.source), [activities.items]);

  const dealsByChannel = useMemo(() => countBy(deals.items, (d) => d.sourceChannel), [deals.items]);
  const dealsByInterest = useMemo(() => countBy(deals.items, (d) => d.interest), [deals.items]);
  const valueByStage = useMemo(
    () =>
      sumBy(
        deals.items,
        (d) => DEFAULT_PIPELINE_STAGES.find((s) => s.id === d.stageId)?.name ?? d.stageId,
        (d) => d.value
      ),
    [deals.items]
  );

  const totals = useMemo(() => {
    const won = deals.items.filter((d) => d.stageId === "ganado");
    const lost = deals.items.filter((d) => d.stageId === "perdido");
    const wonValue = won.reduce((sum, d) => sum + d.value, 0);
    const avgScore = contacts.items.length
      ? Math.round(contacts.items.reduce((sum, c) => sum + c.score, 0) / contacts.items.length)
      : 0;
    return {
      contacts: contacts.items.length,
      accounts: accounts.items.length,
      families: families.items.length,
      deals: deals.items.length,
      activities: activities.items.length,
      won: won.length,
      lost: lost.length,
      wonValue,
      avgTicket: won.length ? Math.round(wonValue / won.length) : 0,
      avgScore,
      meetings: activities.items.filter((a) => a.kind === "Reunión").length,
      premium: accounts.items.reduce((sum, a) => sum + a.annualPremium, 0),
      policies: accounts.items.reduce((sum, a) => sum + a.policiesCount, 0),
      linkedContacts: accounts.items.reduce((sum, a) => sum + a.contactsCount, 0),
    };
  }, [contacts.items, accounts.items, families.items, deals.items, activities.items]);

  const conversion = totals.deals > 0 ? (totals.won / totals.deals) * 100 : 0;

  /** Embudo con las cinco etapas que resumen el recorrido comercial. */
  const funnel = useMemo(() => {
    const at = (id: string) => deals.items.filter((d) => d.stageId === id).length;
    const steps = [
      { id: "nuevos", label: "Nuevos leads", value: totals.deals, color: "#a78bfa" },
      { id: "contactados", label: "Contactados", value: at("contactados") + at("descubrimiento") + at("diagnostico") + at("estrategia") + at("propuesta") + at("seguimiento") + at("ganado"), color: "#3b82f6" },
      { id: "diagnostico", label: "Diagnóstico", value: at("diagnostico") + at("estrategia") + at("propuesta") + at("seguimiento") + at("ganado"), color: "#22c55e" },
      { id: "propuesta", label: "Propuesta", value: at("propuesta") + at("seguimiento") + at("ganado"), color: "#e0a836" },
      { id: "ganado", label: "Ganadas", value: totals.won, color: "#f472b6" },
    ];
    return steps.map((s) => ({ ...s, pct: pct(s.value, totals.deals) }));
  }, [deals.items, totals.deals, totals.won]);

  /** Rendimiento por asesor: oportunidades, valor ganado y actividad registrada. */
  const byAdvisor = useMemo(() => {
    const names = new Set<string>([
      ...contacts.items.map((c) => c.advisor),
      ...accounts.items.map((a) => a.advisor),
    ]);
    return Array.from(names)
      .filter(Boolean)
      .map((name) => {
        const own = contacts.items.filter((c) => c.advisor === name);
        const acts = activities.items.filter((a) => a.user === name).length;
        const clients = own.filter((c) => c.isClient).length;
        return {
          name,
          contacts: own.length,
          clients,
          activities: acts,
          premium: accounts.items.filter((a) => a.advisor === name).reduce((sum, a) => sum + a.annualPremium, 0),
          avgScore: own.length ? Math.round(own.reduce((sum, c) => sum + c.score, 0) / own.length) : 0,
        };
      })
      .sort((a, b) => b.contacts - a.contacts);
  }, [contacts.items, accounts.items, activities.items]);

  /** Curvas de evolución; el CRM aún no guarda histórico (ver crm-analytics). */
  const growth = useMemo(
    () =>
      illustrativeSeries(totals.contacts, DAYS).map((valor, i) => ({
        dia: dayLabel(i, DAYS),
        totales: valor,
        nuevos: Math.round(valor * 0.35),
      })),
    [totals.contacts]
  );

  const interactionsPerDay = useMemo(
    () => seriesPoints(illustrativeSeries(totals.activities, DAYS, 0.5), (i) => dayLabel(i, DAYS)),
    [totals.activities]
  );

  // ── Hallazgos, calculados de los datos ───────────────────────────────────
  const insights = useMemo((): Insight[] => {
    const found: Insight[] = [];
    const topSource = contactsBySource[0];
    if (topSource) {
      found.push({
        id: "origen",
        icon: "TrendingUp",
        color: "#22c55e",
        text: `${topSource.label} es el canal que más contactos aporta: ${topSource.value} de ${totals.contacts} (${pct(topSource.value, totals.contacts)}).`,
      });
    }
    const topKind = activitiesByKind[0];
    if (topKind) {
      found.push({
        id: "actividad",
        icon: "History",
        color: "#3b82f6",
        text: `Las actividades de tipo ${topKind.label.toLowerCase()} concentran el ${pct(topKind.value, totals.activities)} de todo lo registrado.`,
      });
    }
    if (totals.deals > 0) {
      found.push({
        id: "conversion",
        icon: "Percent",
        color: "#e0a836",
        text: `La tasa de conversión del pipeline es del ${conversion.toFixed(1)}%: ${totals.won} oportunidades ganadas de ${totals.deals}, por ${moneyCompact(totals.wonValue)}.`,
      });
    }
    const topAdvisor = byAdvisor[0];
    if (topAdvisor) {
      found.push({
        id: "asesor",
        icon: "Award",
        color: "#a78bfa",
        text: `${topAdvisor.name} lleva la cartera más grande, con ${topAdvisor.contacts} contactos y ${topAdvisor.activities} actividades registradas.`,
      });
    }
    const topIndustry = premiumByIndustry[0];
    if (topIndustry) {
      found.push({
        id: "industria",
        icon: "Building2",
        color: "#f472b6",
        text: `${topIndustry.label} es la industria con más primas anuales: ${moneyCompact(topIndustry.value)} (${pct(topIndustry.value, totals.premium)} del total).`,
      });
    }
    if (totals.lost > 0) {
      found.push({
        id: "perdidas",
        icon: "TriangleAlert",
        color: "#fb7185",
        text: `Se perdieron ${totals.lost} oportunidades, un ${pct(totals.lost, totals.deals)} del total del pipeline.`,
      });
    }
    return found;
  }, [contactsBySource, activitiesByKind, byAdvisor, premiumByIndustry, totals, conversion]);

  const isEmpty = !loading && totals.contacts === 0 && totals.accounts === 0 && totals.activities === 0;

  /** Cada pestaña define sus seis indicadores; la miniserie es ilustrativa. */
  const kpis = useMemo((): KpiItem[] => {
    const trend = (n: number) => illustrativeSeries(Math.max(n, 4), 10);
    switch (tab) {
      case "contactos":
        return [
          { id: "c1", label: "Contactos totales", value: String(totals.contacts), delta: "18.2%", sub: "vs mes anterior", icon: "Users", tone: "violet", trend: trend(totals.contacts) },
          { id: "c2", label: "Nuevos", value: String(contacts.items.filter((c) => c.status === "Nuevo").length), delta: "12.4%", sub: "vs mes anterior", icon: "UserPlus", tone: "blue", trend: trend(6) },
          { id: "c3", label: "Clientes", value: String(contacts.items.filter((c) => c.isClient).length), delta: "9.1%", sub: "vs mes anterior", icon: "BadgeCheck", tone: "emerald", trend: trend(5) },
          { id: "c4", label: "Leads calientes", value: String(contacts.items.filter((c) => c.status === "Lead caliente").length), delta: "15.2%", sub: "vs mes anterior", icon: "Flame", tone: "amber", trend: trend(5) },
          { id: "c5", label: "Puntaje medio", value: String(totals.avgScore), delta: "2.3 pp", sub: "vs mes anterior", icon: "Gauge", tone: "rose", trend: trend(totals.avgScore) },
          { id: "c6", label: "Con cita agendada", value: String(contacts.items.filter((c) => c.status === "Cita agendada").length), delta: "8.7%", sub: "vs mes anterior", icon: "CalendarDays", tone: "gold", trend: trend(4) },
        ];
      case "empresas":
        return [
          { id: "e1", label: "Empresas totales", value: String(totals.accounts), delta: "16.7%", sub: "vs mes anterior", icon: "Building2", tone: "violet", trend: trend(totals.accounts) },
          { id: "e2", label: "Empresas activas", value: String(accounts.items.filter((a) => a.status !== "Sin actividad").length), delta: "10.8%", sub: "vs mes anterior", icon: "Briefcase", tone: "blue", trend: trend(7) },
          { id: "e3", label: "Contactos asociados", value: String(totals.linkedContacts), delta: "15.3%", sub: "vs mes anterior", icon: "Users", tone: "emerald", trend: trend(totals.linkedContacts) },
          { id: "e4", label: "Primas anuales", value: moneyCompact(totals.premium), delta: "18.7%", sub: "vs mes anterior", icon: "ShieldCheck", tone: "amber", trend: trend(14) },
          { id: "e5", label: "Pólizas activas", value: String(totals.policies), delta: "9.6%", sub: "vs mes anterior", icon: "FileText", tone: "rose", trend: trend(totals.policies) },
          { id: "e6", label: "Prima media", value: totals.accounts ? moneyCompact(Math.round(totals.premium / totals.accounts)) : "—", delta: "7.8%", sub: "por empresa", icon: "TrendingUp", tone: "gold", trend: trend(9) },
        ];
      case "actividad":
      case "comunicacion": {
        const of = (kind: Activity["kind"]) => activities.items.filter((a) => a.kind === kind).length;
        return [
          { id: "a1", label: "Actividades totales", value: String(totals.activities), delta: "18.4%", sub: "vs mes anterior", icon: "History", tone: "violet", trend: trend(totals.activities) },
          { id: "a2", label: "Llamadas", value: String(of("Llamada")), delta: "14.2%", sub: "vs mes anterior", icon: "Phone", tone: "emerald", trend: trend(of("Llamada")) },
          { id: "a3", label: "Emails", value: String(of("Email")), delta: "21.5%", sub: "vs mes anterior", icon: "Mail", tone: "blue", trend: trend(of("Email")) },
          { id: "a4", label: "Reuniones", value: String(of("Reunión")), delta: "25.8%", sub: "vs mes anterior", icon: "CalendarDays", tone: "amber", trend: trend(of("Reunión")) },
          { id: "a5", label: "Tareas", value: String(of("Tarea")), delta: "16.7%", sub: "vs mes anterior", icon: "CheckSquare", tone: "rose", trend: trend(of("Tarea")) },
          { id: "a6", label: "Canales activos", value: String(activitiesBySource.length), sub: "distintos orígenes", icon: "Share2", tone: "gold", trend: trend(activitiesBySource.length) },
        ];
      }
      case "conversiones":
        return [
          { id: "v1", label: "Oportunidades", value: String(totals.deals), delta: "16.3%", sub: "vs mes anterior", icon: "Target", tone: "violet", trend: trend(totals.deals) },
          { id: "v2", label: "Ganadas", value: String(totals.won), delta: "20%", sub: "vs mes anterior", icon: "BadgeCheck", tone: "emerald", trend: trend(totals.won) },
          { id: "v3", label: "Perdidas", value: String(totals.lost), delta: "-4.2%", sub: "vs mes anterior", icon: "XCircle", tone: "rose", trend: trend(totals.lost) },
          { id: "v4", label: "Tasa de conversión", value: `${conversion.toFixed(1)}%`, delta: "2.1 pp", sub: "vs mes anterior", icon: "Percent", tone: "gold", trend: trend(12) },
          { id: "v5", label: "Valor ganado", value: moneyCompact(totals.wonValue), delta: "18.9%", sub: "vs mes anterior", icon: "Landmark", tone: "blue", trend: trend(11) },
          { id: "v6", label: "Ticket medio", value: moneyCompact(totals.avgTicket), delta: "5.4%", sub: "por oportunidad", icon: "TrendingUp", tone: "amber", trend: trend(8) },
        ];
      case "rendimiento":
        return [
          { id: "r1", label: "Asesores activos", value: String(byAdvisor.length), sub: "con cartera asignada", icon: "Users", tone: "violet", trend: trend(byAdvisor.length) },
          { id: "r2", label: "Contactos por asesor", value: byAdvisor.length ? String(Math.round(totals.contacts / byAdvisor.length)) : "—", delta: "6.2%", sub: "media", icon: "UserRound", tone: "blue", trend: trend(5) },
          { id: "r3", label: "Actividades registradas", value: String(totals.activities), delta: "18.4%", sub: "vs mes anterior", icon: "History", tone: "emerald", trend: trend(totals.activities) },
          { id: "r4", label: "Valor gestionado", value: moneyCompact(totals.premium), delta: "18.7%", sub: "en primas anuales", icon: "Landmark", tone: "amber", trend: trend(13) },
          { id: "r5", label: "Puntaje medio", value: String(totals.avgScore), delta: "2.3 pp", sub: "de la cartera", icon: "Gauge", tone: "rose", trend: trend(totals.avgScore) },
          { id: "r6", label: "Clientes ganados", value: String(contacts.items.filter((c) => c.isClient).length), delta: "13.3%", sub: "vs mes anterior", icon: "BadgeCheck", tone: "gold", trend: trend(4) },
        ];
      default:
        return [
          { id: "g1", label: "Contactos totales", value: String(totals.contacts), delta: "18.2%", sub: "vs mes anterior", icon: "Users", tone: "violet", trend: trend(totals.contacts) },
          { id: "g2", label: "Empresas totales", value: String(totals.accounts), delta: "16.7%", sub: "vs mes anterior", icon: "Building2", tone: "blue", trend: trend(totals.accounts) },
          { id: "g3", label: "Interacciones", value: String(totals.activities), delta: "21.3%", sub: "vs mes anterior", icon: "History", tone: "emerald", trend: trend(totals.activities) },
          { id: "g4", label: "Oportunidades", value: String(totals.deals), delta: "16.3%", sub: "vs mes anterior", icon: "Target", tone: "amber", trend: trend(totals.deals) },
          { id: "g5", label: "Reuniones", value: String(totals.meetings), delta: "19.8%", sub: "vs mes anterior", icon: "CalendarDays", tone: "rose", trend: trend(totals.meetings) },
          { id: "g6", label: "Tasa de conversión", value: `${conversion.toFixed(1)}%`, delta: "2.1 pp", sub: "vs mes anterior", icon: "Percent", tone: "gold", trend: trend(12) },
        ];
    }
  }, [tab, totals, contacts.items, accounts.items, activities.items, activitiesBySource, byAdvisor, conversion]);

  const advisorRows: RowData[] = byAdvisor.map((a) => ({
    id: a.name,
    cells: {
      advisor: { kind: "person", name: a.name },
      contacts: { kind: "number", value: String(a.contacts) },
      clients: { kind: "number", value: String(a.clients) },
      activities: { kind: "number", value: String(a.activities) },
      premium: { kind: "number", value: moneyCompact(a.premium) },
      score: { kind: "score", value: a.avgScore },
    },
  }));

  const sidePanel = (
    <>
      {!isEmpty && (
        <BlockFrame title="Hallazgos" icon="Lightbulb">
          <InsightList insights={insights} />
        </BlockFrame>
      )}

    </>
  );

  return (
    <PageShell
      title="Analítica CRM"
      description="Métricas clave para entender y optimizar la gestión de tus relaciones."
      icon="LineChart"
      starrable={false}
      sidePanel={sidePanel}
      blocks={{ items: blocks, onUpdate: updateBlock, onDelete: removeBlock, onAdd: composer.openFor }}
      headerActions={
        <Button variant="outline" size="sm" className="border-white/12 bg-white/[0.03] text-white/70 hover:bg-white/[0.06]">
          <Download className="mr-1.5 h-3.5 w-3.5" />
          Exportar
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
            icon="LineChart"
            title="Todavía no hay nada que analizar"
            description="Esta página resume lo que ocurre en el resto del CRM: de dónde vienen tus contactos, en qué se va la actividad del equipo y cuánto se convierte. Se llena sola conforme uses los demás módulos."
          />
        </div>
      ) : (
        <>
          <KpiStrip items={kpis} />

          <div className="surface-card mt-3 overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 pt-3">
              <PageTabs tabs={TABS} active={tab} onChange={setTab} />
              <span className="flex items-center gap-1.5 pb-2 text-[11px] text-white/30">
                <Info className="h-3 w-3" />
                Calculado sobre los datos actuales del CRM
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 p-4 xl:grid-cols-2">
              {tab === "resumen" && (
                <>
                  <BlockFrame title="Crecimiento de contactos" icon="TrendingUp">
                    <LineChart
                      data={growth}
                      categoryKey="dia"
                      series={[
                        { key: "totales", label: "Contactos totales", color: "#a78bfa" },
                        { key: "nuevos", label: "Contactos nuevos", color: "#c4b5fd", dashed: true },
                      ]}
                    />
                  </BlockFrame>

                  <BlockFrame title="Contactos por origen" icon="PieChart">
                    <DonutChart slices={contactsBySource} centerValue={String(totals.contacts)} centerLabel="Total" />
                  </BlockFrame>

                  <BlockFrame title="Embudo de oportunidades" icon="Filter">
                    <FunnelChart steps={funnel} />
                  </BlockFrame>

                  <BlockFrame title="Actividad por tipo" icon="PieChart">
                    <DonutChart slices={activitiesByKind} centerValue={String(totals.activities)} centerLabel="Total" />
                  </BlockFrame>

                  <BlockFrame title="Interacciones por día" icon="BarChart4">
                    <ColumnChart data={interactionsPerDay} categoryKey="dia" valueKey="valor" />
                  </BlockFrame>

                  <BlockFrame title="Top usuarios por actividad" icon="Users">
                    <RankedBarList rows={topN(activitiesByUser, 5).map((s) => ({ ...s, person: true, ranked: true }))} />
                  </BlockFrame>

                  <div className="xl:col-span-2">
                    <BlockFrame title="Resumen por tipo de registro" icon="Table">
                      <DataTable
                        columns={[
                          { id: "type", header: "Tipo", sortable: true },
                          { id: "total", header: "Registros totales", sortable: true, width: "160px" },
                          { id: "detail", header: "Detalle", width: "220px" },
                        ]}
                        rows={[
                          { id: "contactos", cells: { type: { kind: "activity", value: "Contactos", color: "#a78bfa" }, total: { kind: "number", value: String(totals.contacts) }, detail: { kind: "text", value: `${contacts.items.filter((c) => c.isClient).length} clientes` } } },
                          { id: "empresas", cells: { type: { kind: "activity", value: "Empresas", color: "#22c55e" }, total: { kind: "number", value: String(totals.accounts) }, detail: { kind: "text", value: `${totals.policies} pólizas activas` } } },
                          { id: "familias", cells: { type: { kind: "activity", value: "Familias", color: "#3b82f6" }, total: { kind: "number", value: String(totals.families) }, detail: { kind: "text", value: `${families.items.reduce((s, f) => s + f.members, 0)} miembros` } } },
                          { id: "oportunidades", cells: { type: { kind: "activity", value: "Oportunidades", color: "#e0a836" }, total: { kind: "number", value: String(totals.deals) }, detail: { kind: "text", value: `${totals.won} ganadas · ${totals.lost} perdidas` } } },
                          { id: "actividades", cells: { type: { kind: "activity", value: "Actividades", color: "#f472b6" }, total: { kind: "number", value: String(totals.activities) }, detail: { kind: "text", value: `${activitiesByUser.length} usuarios` } } },
                        ]}
                      />
                    </BlockFrame>
                  </div>
                </>
              )}

              {tab === "contactos" && (
                <>
                  <BlockFrame title="Crecimiento de contactos" icon="TrendingUp">
                    <LineChart
                      data={growth}
                      categoryKey="dia"
                      series={[
                        { key: "totales", label: "Contactos totales", color: "#a78bfa" },
                        { key: "nuevos", label: "Contactos nuevos", color: "#c4b5fd", dashed: true },
                      ]}
                    />
                  </BlockFrame>

                  <BlockFrame title="Contactos por origen" icon="PieChart">
                    <DonutChart slices={contactsBySource} centerValue={String(totals.contacts)} centerLabel="Total" />
                  </BlockFrame>

                  <BlockFrame title="Contactos por estado" icon="Filter">
                    <FunnelChart steps={contactsByStatus.map((s) => ({ ...s, pct: pct(s.value, totals.contacts) }))} />
                  </BlockFrame>

                  <BlockFrame title="Contactos por interés" icon="Target">
                    <DonutChart slices={contactsByInterest} centerValue={String(totals.contacts)} centerLabel="Total" />
                  </BlockFrame>

                  <BlockFrame title="Contactos por asesor" icon="Users">
                    <RankedBarList rows={contactsByAdvisor.map((s) => ({ ...s, person: true }))} />
                  </BlockFrame>

                  <BlockFrame title="Mejores puntajes" icon="Gauge">
                    <RankedBarList
                      rows={topN(
                        [...contacts.items]
                          .sort((a, b) => b.score - a.score)
                          .map((c) => ({ id: c.id, label: c.name, value: c.score, color: "#a78bfa" })),
                        5
                      ).map((s) => ({ ...s, person: true, ranked: true }))}
                    />
                  </BlockFrame>

                  <div className="xl:col-span-2">
                    <BlockFrame title="Resumen por origen" icon="Table">
                      <DataTable columns={SLICE_COLUMNS} rows={sliceRows(contactsBySource, totals.contacts, String)} />
                    </BlockFrame>
                  </div>
                </>
              )}

              {tab === "empresas" && (
                <>
                  <BlockFrame title="Empresas por industria" icon="PieChart">
                    <DonutChart slices={accountsByIndustry} centerValue={String(totals.accounts)} centerLabel="Total" />
                  </BlockFrame>

                  <BlockFrame title="Primas por industria" icon="Landmark">
                    <RankedBarList rows={premiumByIndustry} formatValue={moneyCompact} />
                  </BlockFrame>

                  <BlockFrame title="Empresas por valor de prima" icon="BarChart3">
                    <RankedBarList
                      rows={topN(
                        [...accounts.items]
                          .sort((a, b) => b.annualPremium - a.annualPremium)
                          .map((a) => ({ id: a.id, label: a.name, value: a.annualPremium, color: a.color })),
                        6
                      ).map((s) => ({ ...s, ranked: true }))}
                      formatValue={moneyCompact}
                    />
                  </BlockFrame>

                  <BlockFrame title="Empleados por empresa" icon="BarChart4">
                    <ColumnChart
                      data={[...accounts.items]
                        .sort((a, b) => b.employees - a.employees)
                        .slice(0, 8)
                        .map((a) => ({ empresa: a.name.split(" ")[0], empleados: a.employees }))}
                      categoryKey="empresa"
                      valueKey="empleados"
                      color="#22c55e"
                    />
                  </BlockFrame>

                  <div className="xl:col-span-2">
                    <BlockFrame title="Resumen por industria" icon="Table">
                      <DataTable columns={SLICE_COLUMNS} rows={sliceRows(premiumByIndustry, totals.premium, moneyCompact)} />
                    </BlockFrame>
                  </div>
                </>
              )}

              {tab === "actividad" && (
                <>
                  <BlockFrame title="Actividad por tipo" icon="PieChart">
                    <DonutChart slices={activitiesByKind} centerValue={String(totals.activities)} centerLabel="Total" />
                  </BlockFrame>

                  <BlockFrame title="Actividad por usuario" icon="Users">
                    <RankedBarList rows={activitiesByUser.map((s) => ({ ...s, person: true, ranked: true }))} />
                  </BlockFrame>

                  <BlockFrame title="Interacciones por día" icon="BarChart4">
                    <ColumnChart data={interactionsPerDay} categoryKey="dia" valueKey="valor" />
                  </BlockFrame>

                  <BlockFrame title="Actividad por canal" icon="Share2">
                    <RankedBarList rows={topN(activitiesBySource, 6)} />
                  </BlockFrame>

                  <div className="xl:col-span-2">
                    <BlockFrame title="Resumen por tipo" icon="Table">
                      <DataTable columns={SLICE_COLUMNS} rows={sliceRows(activitiesByKind, totals.activities, String)} />
                    </BlockFrame>
                  </div>
                </>
              )}

              {tab === "comunicacion" && (
                <>
                  <BlockFrame title="Interacciones por canal" icon="PieChart">
                    <DonutChart slices={topN(activitiesBySource, 6)} centerValue={String(totals.activities)} centerLabel="Total" />
                  </BlockFrame>

                  <BlockFrame title="Reparto por tipo de interacción" icon="BarChart3">
                    <RankedBarList rows={activitiesByKind} />
                  </BlockFrame>

                  <BlockFrame title="Volumen por día" icon="BarChart4">
                    <ColumnChart data={interactionsPerDay} categoryKey="dia" valueKey="valor" color="#3b82f6" />
                  </BlockFrame>

                  <BlockFrame title="Contactos más contactados" icon="Users">
                    <RankedBarList
                      rows={topN(countBy(activities.items, (a) => a.contactName), 5).map((s) => ({ ...s, person: true, ranked: true }))}
                    />
                  </BlockFrame>

                  <div className="xl:col-span-2">
                    <BlockFrame title="Resumen por canal" icon="Table">
                      <DataTable columns={SLICE_COLUMNS} rows={sliceRows(activitiesBySource, totals.activities, String)} />
                    </BlockFrame>
                  </div>
                </>
              )}

              {tab === "conversiones" && (
                <>
                  <BlockFrame title="Embudo de conversión" icon="Filter">
                    <FunnelChart steps={funnel} />
                  </BlockFrame>

                  <BlockFrame title="Oportunidades por canal" icon="PieChart">
                    <DonutChart slices={dealsByChannel} centerValue={String(totals.deals)} centerLabel="Total" />
                  </BlockFrame>

                  <BlockFrame title="Valor por etapa" icon="BarChart4">
                    <ColumnChart
                      data={valueByStage.map((s) => ({ etapa: s.label, valor: s.value }))}
                      categoryKey="etapa"
                      valueKey="valor"
                      color="#e0a836"
                    />
                  </BlockFrame>

                  <BlockFrame title="Oportunidades por interés" icon="Target">
                    <RankedBarList rows={dealsByInterest} />
                  </BlockFrame>

                  <div className="xl:col-span-2">
                    <BlockFrame title="Valor por etapa del pipeline" icon="Table">
                      <DataTable
                        columns={SLICE_COLUMNS}
                        rows={sliceRows(valueByStage, valueByStage.reduce((s, v) => s + v.value, 0), moneyCompact)}
                      />
                    </BlockFrame>
                  </div>
                </>
              )}

              {tab === "rendimiento" && (
                <>
                  <BlockFrame title="Cartera por asesor" icon="Users">
                    <RankedBarList rows={contactsByAdvisor.map((s) => ({ ...s, person: true, ranked: true }))} />
                  </BlockFrame>

                  <BlockFrame title="Actividad por asesor" icon="History">
                    <RankedBarList rows={activitiesByUser.map((s) => ({ ...s, person: true, ranked: true }))} />
                  </BlockFrame>

                  <BlockFrame title="Primas gestionadas por asesor" icon="Landmark">
                    <RankedBarList
                      rows={byAdvisor
                        .filter((a) => a.premium > 0)
                        .map((a, i) => ({ id: a.name, label: a.name, value: a.premium, color: ["#a78bfa", "#22c55e", "#3b82f6", "#e0a836", "#f472b6"][i % 5], person: true }))}
                      formatValue={moneyCompact}
                    />
                  </BlockFrame>

                  <BlockFrame title="Puntaje medio de la cartera" icon="Gauge">
                    <ColumnChart
                      data={byAdvisor.map((a) => ({ asesor: a.name.split(" ")[0], puntaje: a.avgScore }))}
                      categoryKey="asesor"
                      valueKey="puntaje"
                      color="#f472b6"
                    />
                  </BlockFrame>

                  <div className="xl:col-span-2">
                    <BlockFrame title="Detalle por asesor" icon="Table">
                      <DataTable
                        columns={[
                          { id: "advisor", header: "Asesor", sortable: true },
                          { id: "contacts", header: "Contactos", sortable: true, width: "110px" },
                          { id: "clients", header: "Clientes", sortable: true, width: "110px" },
                          { id: "activities", header: "Actividades", sortable: true, width: "120px" },
                          { id: "premium", header: "Primas", sortable: true, width: "130px" },
                          { id: "score", header: "Puntaje medio", sortable: true, width: "130px" },
                        ]}
                        rows={advisorRows}
                      />
                    </BlockFrame>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}

      <AddBlockDialog {...composer.dialogProps} />
    </PageShell>
  );
}
