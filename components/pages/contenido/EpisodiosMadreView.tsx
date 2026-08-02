"use client";

import { useMemo, useState } from "react";
import { List, Plus } from "lucide-react";
import { PageShell, PageTabs } from "@/components/page-blocks/PageShell";
import { BlockFrame } from "@/components/page-blocks/BlockFrame";
import { AddBlockButton, AddBlockDialog } from "@/components/page-blocks/AddBlockDialog";
import { BlockRenderer } from "@/components/page-blocks/BlockRenderer";
import { KpiStrip } from "@/components/page-blocks/blocks/KpiStrip";
import { FilterToolbar } from "@/components/page-blocks/blocks/FilterToolbar";
import { DataTable, type RowData } from "@/components/page-blocks/blocks/DataTable";
import { DonutChart } from "@/components/page-blocks/blocks/DonutChart";
import { Button } from "@/components/ui/button";
import { useBlocksState } from "@/lib/use-blocks";
import { EPISODES, PILLARS, STATUS_TONE, pillarOf, type EpisodeStatus } from "@/components/pages/contenido/mock-data";

const TABS = [
  { value: "todos", label: "Todos" },
  { value: "Publicado", label: "Publicados" },
  { value: "En producción", label: "En producción" },
  { value: "Planeado", label: "Planeados" },
  { value: "Pausado", label: "Pausados" },
];

export function EpisodiosMadreView() {
  const [tab, setTab] = useState("todos");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [createOpen, setCreateOpen] = useState(false);
  const { blocks, addBlock, updateBlock, removeBlock } = useBlocksState([]);

  const counts = useMemo(() => {
    const by = (s: EpisodeStatus) => EPISODES.filter((e) => e.status === s).length;
    return { total: EPISODES.length, pub: by("Publicado"), prod: by("En producción"), plan: by("Planeado"), pause: by("Pausado") };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return EPISODES.filter((ep) => {
      if (tab !== "todos" && ep.status !== tab) return false;
      const pillarFilter = filters.pillar;
      if (pillarFilter && pillarFilter !== "Todos" && pillarOf(ep.pillarId)?.name !== pillarFilter) return false;
      if (!q) return true;
      return `${ep.title} ${ep.subtitle} ${ep.guest} ${pillarOf(ep.pillarId)?.name ?? ""}`.toLowerCase().includes(q);
    });
  }, [tab, search, filters]);

  const rows: RowData[] = filtered.map((ep) => {
    const pillar = pillarOf(ep.pillarId);
    return {
      id: ep.id,
      cells: {
        index: { kind: "index", value: String(ep.week).padStart(2, "0") },
        episode: { kind: "text", value: ep.title, sub: ep.subtitle, strong: true },
        pillar: { kind: "badge", value: pillar?.name ?? "—", tone: pillar?.tone },
        guest: { kind: "person", name: ep.guest, role: ep.guestRole },
        status: { kind: "status", value: ep.status, tone: STATUS_TONE[ep.status] },
        week: { kind: "text", value: `Semana ${ep.week}` },
        progress: { kind: "progress", value: ep.progress },
        publish: { kind: "text", value: ep.publishDate },
      },
    };
  });

  const pillarSlices = PILLARS.map((p) => ({
    id: p.id,
    label: p.name,
    value: EPISODES.filter((e) => e.pillarId === p.id).length,
    color: p.color,
  })).filter((s) => s.value > 0);

  const sidePanel = (
    <>
      <BlockFrame title="Distribución por pilar" icon="PieChart">
        <DonutChart slices={pillarSlices} centerValue={String(EPISODES.length)} centerLabel="Episodios madre" />
      </BlockFrame>

      <BlockFrame title="Estado general" icon="Activity">
        <ul className="space-y-2.5 text-sm">
          {[
            { label: "Publicados", value: counts.pub, color: "bg-emerald-400" },
            { label: "En producción", value: counts.prod, color: "bg-amber-400" },
            { label: "Planeados", value: counts.plan, color: "bg-blue-400" },
            { label: "Pausados", value: counts.pause, color: "bg-white/40" },
          ].map((r) => (
            <li key={r.label} className="flex items-center gap-2">
              <span className={`h-2 w-2 flex-shrink-0 rounded-full ${r.color}`} />
              <span className="min-w-0 flex-1 truncate text-white/65">{r.label}</span>
              <span className="tabular-nums font-medium text-white/85">{r.value}</span>
              <span className="w-12 text-right tabular-nums text-white/35">
                {((r.value / counts.total) * 100).toFixed(1)}%
              </span>
            </li>
          ))}
        </ul>
      </BlockFrame>

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
      title="Episodios Madre"
      description="Los episodios principales que lideran cada pilar estratégico del plan de contenido."
      icon="Mic"
      starrable={false}
      sidePanel={sidePanel}
      headerActions={
        <>
          <Button variant="outline" size="sm" className="border-white/12 bg-white/[0.03] text-white/70 hover:bg-white/[0.06]">
            <List className="mr-1.5 h-3.5 w-3.5" />
            Vista Lista
          </Button>
          <Button className="border-0 bg-gradient-to-b from-[#f5da93] to-[#c98f1f] font-semibold text-[#241a05] hover:brightness-105">
            <Plus className="mr-1.5 h-4 w-4" />
            Nueva Semana
          </Button>
        </>
      }
    >
      <KpiStrip
        items={[
          { id: "total", label: "Episodios madre", value: String(counts.total), sub: "100% del plan", icon: "Mic", tone: "violet" },
          { id: "pub", label: "Publicados", value: String(counts.pub), sub: `${((counts.pub / counts.total) * 100).toFixed(1)}% del total`, icon: "CheckCircle2", tone: "emerald" },
          { id: "prod", label: "En producción", value: String(counts.prod), sub: `${((counts.prod / counts.total) * 100).toFixed(1)}% del total`, icon: "Clock", tone: "amber" },
          { id: "plan", label: "Planeados", value: String(counts.plan), sub: `${((counts.plan / counts.total) * 100).toFixed(1)}% del total`, icon: "CalendarDays", tone: "blue" },
          { id: "pause", label: "Pausados", value: String(counts.pause), sub: `${((counts.pause / counts.total) * 100).toFixed(1)}% del total`, icon: "Pause", tone: "gold" },
        ]}
      />

      <div className="surface-card mt-3 overflow-hidden">
        <div className="px-4 pt-3">
          <PageTabs tabs={TABS} active={tab} onChange={setTab} />
        </div>
        <div className="px-4 pb-4">
          <div className="mb-4">
            <FilterToolbar
              search={search}
              onSearchChange={setSearch}
              searchPlaceholder="Buscar por tema, pilar o invitado..."
              filters={[{ id: "pillar", label: "Pilar", options: PILLARS.map((p) => p.name) }]}
              values={filters}
              onFilterChange={(id, value) => setFilters((f) => ({ ...f, [id]: value }))}
              onExport={() => undefined}
            />
          </div>
          <DataTable
            columns={[
              { id: "index", header: "#", width: "56px" },
              { id: "episode", header: "Episodio Madre", sortable: true },
              { id: "pillar", header: "Pilar Estratégico", sortable: true, width: "160px" },
              { id: "guest", header: "Invitado Principal", sortable: true, width: "190px" },
              { id: "status", header: "Estado", sortable: true, width: "140px" },
              { id: "week", header: "Semana", sortable: true, width: "110px" },
              { id: "progress", header: "Progreso", sortable: true, width: "150px" },
              { id: "publish", header: "Fecha de Publicación", width: "160px" },
            ]}
            rows={rows}
            onView={() => undefined}
            onEditRow={() => undefined}
            onDeleteRow={() => undefined}
          />
        </div>
      </div>

      <AddBlockDialog open={createOpen} onOpenChange={setCreateOpen} onCreate={addBlock} />
    </PageShell>
  );
}
