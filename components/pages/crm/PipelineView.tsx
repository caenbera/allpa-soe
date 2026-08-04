"use client";

import { useMemo, useState } from "react";
import { Download, Plus } from "lucide-react";
import { toast } from "sonner";
import { PageShell, PageTabs } from "@/components/page-blocks/PageShell";
import { BlockFrame } from "@/components/page-blocks/BlockFrame";
import { AddBlockButton, AddBlockDialog } from "@/components/page-blocks/AddBlockDialog";
import { BlockRenderer } from "@/components/page-blocks/BlockRenderer";
import { EmptyState, LoadingState } from "@/components/page-blocks/EmptyState";
import { KpiStrip } from "@/components/page-blocks/blocks/KpiStrip";
import { FilterToolbar } from "@/components/page-blocks/blocks/FilterToolbar";
import { KanbanBoard } from "@/components/page-blocks/blocks/KanbanBoard";
import { FunnelChart } from "@/components/page-blocks/blocks/Charts";
import { DonutChart, DONUT_COLORS } from "@/components/page-blocks/blocks/DonutChart";
import { RankedBarList } from "@/components/page-blocks/blocks/RankedBarList";
import { ActivityFeed } from "@/components/page-blocks/blocks/ActivityFeed";
import { Button } from "@/components/ui/button";
import { useContent } from "@/lib/use-content";
import { usePageConfig } from "@/lib/use-page-config";
import { ACTIVITY_META, CRM_COLLECTIONS, DEFAULT_PIPELINE_STAGES, type Activity, type Deal } from "@/lib/crm-types";

const TABS = [
  { value: "pipeline", label: "Pipeline" },
  { value: "origen", label: "Origen de Leads" },
  { value: "contenido", label: "Contenido que Convierte" },
  { value: "embudos", label: "Embudos" },
];

export function PipelineView() {
  const [tab, setTab] = useState("pipeline");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [createOpen, setCreateOpen] = useState(false);

  const deals = useContent<Deal>(CRM_COLLECTIONS.deals);
  const activities = useContent<Activity>(CRM_COLLECTIONS.activities);
  const { blocks, addBlock, updateBlock, removeBlock } = usePageConfig("/crm/pipeline");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return deals.items.filter((d) => {
      if (filters.interest && filters.interest !== "Todos" && d.interest !== filters.interest) return false;
      if (!q) return true;
      return `${d.contactName} ${d.headline} ${d.interest}`.toLowerCase().includes(q);
    });
  }, [deals.items, search, filters]);

  const stats = useMemo(() => {
    const at = (id: string) => deals.items.filter((d) => d.stageId === id).length;
    const nuevos = at("nuevos");
    const contactados = at("contactados");
    const consultas = at("descubrimiento") + at("diagnostico");
    const propuestas = at("propuesta");
    const ganados = at("ganado");
    const totalLeads = deals.items.length;
    return {
      nuevos,
      contactados,
      consultas,
      propuestas,
      ganados,
      conversion: totalLeads > 0 ? `${((ganados / totalLeads) * 100).toFixed(1)}%` : "—",
      totalLeads,
    };
  }, [deals.items]);

  const funnelSteps = [
    { id: "f1", label: "Leads nuevos", value: stats.totalLeads, pct: "100%", color: "#a78bfa" },
    { id: "f2", label: "Contactados", value: stats.contactados, pct: "—", color: "#3b82f6" },
    { id: "f3", label: "Consultas", value: stats.consultas, pct: "—", color: "#22c55e" },
    { id: "f4", label: "Propuestas", value: stats.propuestas, pct: "—", color: "#e0a836" },
    { id: "f5", label: "Clientes", value: stats.ganados, pct: stats.conversion, color: "#f472b6" },
  ];

  const byChannel = useMemo(() => {
    const map = new Map<string, number>();
    deals.items.forEach((d) => map.set(d.sourceChannel, (map.get(d.sourceChannel) ?? 0) + 1));
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([label, value], i) => ({ id: label, label, value, color: DONUT_COLORS[i % DONUT_COLORS.length] }));
  }, [deals.items]);

  const recent = activities.items.slice(0, 4).map((a) => ({
    id: a.id,
    icon: ACTIVITY_META[a.kind].icon,
    color: ACTIVITY_META[a.kind].color,
    title: a.title,
    detail: a.contactName,
    timeLabel: a.timeLabel,
  }));

  const isEmpty = !deals.loading && deals.items.length === 0;

  const sidePanel = (
    <>
      {!isEmpty && (
        <>
          <BlockFrame title="Conversión general" icon="Filter">
            <FunnelChart steps={funnelSteps} />
          </BlockFrame>

          <BlockFrame title="Leads por canal" icon="PieChart">
            <DonutChart slices={byChannel} centerValue={String(stats.totalLeads)} centerLabel="Leads totales" />
          </BlockFrame>

          <BlockFrame title="Contenido con más clientes" icon="BarChart3">
            <RankedBarList
              rows={byChannel.slice(0, 5).map((c) => ({ id: c.id, label: c.label, value: c.value, color: c.color }))}
            />
          </BlockFrame>

          <BlockFrame title="Actividad reciente" icon="History">
            <ActivityFeed entries={recent} compact />
          </BlockFrame>
        </>
      )}

      {blocks.map((block) => (
        <BlockRenderer
          key={block.id}
          block={block}
          onUpdate={(patch) => updateBlock(block.id, patch)}
          onDelete={() => removeBlock(block.id)}
        />
      ))}
      <AddBlockButton onClick={() => setCreateOpen(true)} />
    </>
  );

  return (
    <PageShell
      title="Pipeline de Prospectos"
      description="Gestiona y da seguimiento al recorrido de tus prospectos hasta convertirse en clientes."
      icon="BarChart3"
      starrable={false}
      sidePanel={sidePanel}
      headerActions={
        <>
          <Button variant="outline" size="sm" className="border-white/12 bg-white/[0.03] text-white/70 hover:bg-white/[0.06]">
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Exportar
          </Button>
          <Button className="border-0 bg-gradient-to-b from-[#f5da93] to-[#c98f1f] font-semibold text-[#241a05] hover:brightness-105">
            <Plus className="mr-1.5 h-4 w-4" />
            Nuevo prospecto
          </Button>
        </>
      }
    >
      {deals.loading ? (
        <div className="surface-card">
          <LoadingState />
        </div>
      ) : isEmpty ? (
        <div className="surface-card">
          <EmptyState
            icon="BarChart3"
            title="Tu pipeline está vacío"
            description="Aquí verás cada prospecto avanzando por sus etapas, desde el primer contacto hasta convertirse en cliente. Agrega el primero para empezar."
            actionLabel="Nuevo prospecto"
            onAction={() => undefined}
          />
        </div>
      ) : (
        <>
          <KpiStrip
            items={[
              { id: "nuevos", label: "Leads nuevos", value: String(stats.nuevos), delta: "12.5%", sub: "vs mes anterior", icon: "UserPlus", tone: "violet" },
              { id: "contactados", label: "Contactados", value: String(stats.contactados), delta: "8.1%", sub: "vs mes anterior", icon: "Phone", tone: "blue" },
              { id: "consultas", label: "Consultas", value: String(stats.consultas), delta: "15.7%", sub: "vs mes anterior", icon: "TrendingUp", tone: "emerald" },
              { id: "propuestas", label: "Propuestas", value: String(stats.propuestas), delta: "6.3%", sub: "vs mes anterior", icon: "FileText", tone: "amber" },
              { id: "ganados", label: "Clientes ganados", value: String(stats.ganados), delta: "20%", sub: "vs mes anterior", icon: "BadgeCheck", tone: "emerald" },
              { id: "conv", label: "Tasa de conversión", value: stats.conversion, sub: "del total de leads", icon: "Percent", tone: "gold" },
            ]}
          />

          <div className="surface-card mt-3 overflow-hidden">
            <div className="px-4 pt-3">
              <PageTabs tabs={TABS} active={tab} onChange={setTab} />
            </div>
            <div className="px-4 pb-4">
              {tab === "pipeline" && (
                <>
                  <div className="mb-4">
                    <FilterToolbar
                      search={search}
                      onSearchChange={setSearch}
                      searchPlaceholder="Buscar prospecto…"
                      filters={[{ id: "interest", label: "Interés", options: [...new Set(deals.items.map((d) => d.interest))] }]}
                      values={filters}
                      onFilterChange={(id, value) => setFilters((f) => ({ ...f, [id]: value }))}
                    />
                  </div>

                  <KanbanBoard
                    columns={DEFAULT_PIPELINE_STAGES.map((s) => ({ id: s.id, name: s.name, color: s.color }))}
                    cards={filtered.map((d) => ({
                      id: d.id,
                      columnId: d.stageId,
                      title: d.contactName,
                      sourceChannel: d.sourceChannel,
                      sourceDetail: d.sourceDetail,
                      sourceIcon: d.sourceIcon,
                      headline: d.headline,
                      tag: d.interest,
                      score: d.score,
                      value: d.value,
                      valueLabel: d.stageId === "ganado" ? "Valor del cliente" : "Valor potencial",
                      timeLabel: d.timeLabel,
                      nextAction: d.nextAction || undefined,
                    }))}
                    onMove={(cardId, toColumnId) => {
                      const stage = DEFAULT_PIPELINE_STAGES.find((s) => s.id === toColumnId);
                      deals.update(cardId, { stageId: toColumnId });
                      toast.success(`Movido a ${stage?.name ?? toColumnId}.`);
                    }}
                  />
                </>
              )}

              {tab === "origen" && (
                <DonutChart slices={byChannel} centerValue={String(stats.totalLeads)} centerLabel="Leads totales" />
              )}

              {tab === "contenido" && (
                <RankedBarList
                  rows={byChannel.map((c) => ({ id: c.id, label: c.label, value: c.value, color: c.color, ranked: true }))}
                />
              )}

              {tab === "embudos" && <FunnelChart steps={funnelSteps} />}
            </div>
          </div>
        </>
      )}

      <AddBlockDialog open={createOpen} onOpenChange={setCreateOpen} onCreate={addBlock} />
    </PageShell>
  );
}
