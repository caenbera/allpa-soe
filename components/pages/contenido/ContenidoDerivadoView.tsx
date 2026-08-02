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
import { DonutChart, DONUT_COLORS } from "@/components/page-blocks/blocks/DonutChart";
import { Button } from "@/components/ui/button";
import { useBlocksState } from "@/lib/use-blocks";
import { DERIVED_CONTENT, PILLARS, STATUS_TONE, pillarOf, type EpisodeStatus } from "@/components/pages/contenido/mock-data";

const TABS = [
  { value: "todos", label: "Todos" },
  { value: "Publicado", label: "Completados" },
  { value: "En producción", label: "En producción" },
  { value: "Planeado", label: "Planeados" },
  { value: "Pausado", label: "Pausados" },
];

const FORMATS = ["Video corto", "Video largo", "Podcast", "Artículo / Blog", "PDF / Guía", "Infografía", "Presentación", "Checklist", "Email / Newsletter", "Carrusel"];

export function ContenidoDerivadoView() {
  const [tab, setTab] = useState("todos");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [createOpen, setCreateOpen] = useState(false);
  const { blocks, addBlock, updateBlock, removeBlock } = useBlocksState([]);

  const counts = useMemo(() => {
    const by = (s: EpisodeStatus) => DERIVED_CONTENT.filter((d) => d.status === s).length;
    return { total: DERIVED_CONTENT.length, pub: by("Publicado"), prod: by("En producción"), plan: by("Planeado"), pause: by("Pausado") };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return DERIVED_CONTENT.filter((dc) => {
      if (tab !== "todos" && dc.status !== tab) return false;
      if (filters.pillar && filters.pillar !== "Todos" && pillarOf(dc.pillarId)?.name !== filters.pillar) return false;
      if (filters.format && filters.format !== "Todos" && dc.format !== filters.format) return false;
      if (!q) return true;
      return `${dc.title} ${dc.subtitle} ${dc.episodeTitle} ${dc.format}`.toLowerCase().includes(q);
    });
  }, [tab, search, filters]);

  const rows: RowData[] = filtered.map((dc) => {
    const pillar = pillarOf(dc.pillarId);
    return {
      id: dc.id,
      cells: {
        content: { kind: "text", value: dc.title, sub: dc.subtitle, strong: true },
        episode: { kind: "text", value: dc.episodeTitle, sub: `Semana ${dc.episodeWeek}` },
        format: { kind: "text", value: dc.format, sub: dc.formatMeta },
        channels: { kind: "icons", icons: dc.channels },
        pillar: { kind: "badge", value: pillar?.name ?? "General", tone: pillar?.tone },
        status: { kind: "status", value: dc.status, tone: STATUS_TONE[dc.status] },
        publish: { kind: "text", value: dc.publishDate },
      },
    };
  });

  const formatSlices = FORMATS.map((f, i) => ({
    id: f,
    label: f,
    value: DERIVED_CONTENT.filter((d) => d.format === f).length,
    color: DONUT_COLORS[i % DONUT_COLORS.length],
  }))
    .filter((s) => s.value > 0)
    .sort((a, b) => b.value - a.value);

  const sidePanel = (
    <>
      <BlockFrame title="Distribución por formato" icon="PieChart">
        <DonutChart slices={formatSlices} centerValue={String(counts.total)} centerLabel="Contenidos derivados" />
      </BlockFrame>

      <BlockFrame title="Actividad reciente" icon="Activity">
        <ul className="space-y-3">
          {DERIVED_CONTENT.slice(0, 4).map((dc) => (
            <li key={dc.id} className="flex items-start gap-2.5">
              <span
                className={`mt-1 h-2 w-2 flex-shrink-0 rounded-full ${
                  dc.status === "Publicado" ? "bg-emerald-400" : dc.status === "En producción" ? "bg-amber-400" : "bg-blue-400"
                }`}
              />
              <span className="min-w-0">
                <span className="block truncate text-sm text-white/80">{dc.title}</span>
                <span className="block text-xs text-white/35">
                  {dc.status} · {dc.publishDate}
                </span>
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
      title="Contenido Derivado"
      description="Activos y materiales derivados de los episodios madre para diferentes canales y formatos."
      icon="GitFork"
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
            Nuevo Activo
          </Button>
        </>
      }
    >
      <KpiStrip
        items={[
          { id: "total", label: "Contenidos derivados", value: String(counts.total), sub: "100% del plan", icon: "GitFork", tone: "violet" },
          { id: "pub", label: "Completados", value: String(counts.pub), sub: `${((counts.pub / counts.total) * 100).toFixed(1)}% del total`, icon: "CheckCircle2", tone: "emerald" },
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
              searchPlaceholder="Buscar por tema, episodio, formato o canal..."
              filters={[
                { id: "pillar", label: "Pilar", options: PILLARS.map((p) => p.name) },
                { id: "format", label: "Formato", options: FORMATS },
              ]}
              values={filters}
              onFilterChange={(id, value) => setFilters((f) => ({ ...f, [id]: value }))}
              onExport={() => undefined}
            />
          </div>
          <DataTable
            columns={[
              { id: "content", header: "Contenido derivado", sortable: true },
              { id: "episode", header: "Episodio madre", sortable: true, width: "220px" },
              { id: "format", header: "Formato", sortable: true, width: "150px" },
              { id: "channels", header: "Canal", width: "120px" },
              { id: "pillar", header: "Pilar", sortable: true, width: "160px" },
              { id: "status", header: "Estado", sortable: true, width: "140px" },
              { id: "publish", header: "Fecha de publicación", width: "150px" },
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
