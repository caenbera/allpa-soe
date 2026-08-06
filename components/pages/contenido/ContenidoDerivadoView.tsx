"use client";

import { useMemo, useState } from "react";
import { List, Plus } from "lucide-react";
import { PageShell, PageTabs } from "@/components/page-blocks/PageShell";
import { BlockFrame } from "@/components/page-blocks/BlockFrame";
import { AddBlockDialog } from "@/components/page-blocks/AddBlockDialog";
import { useBlockComposer } from "@/components/page-blocks/use-block-composer";
import { EmptyState, LoadingState } from "@/components/page-blocks/EmptyState";
import { KpiStrip } from "@/components/page-blocks/blocks/KpiStrip";
import { FilterToolbar } from "@/components/page-blocks/blocks/FilterToolbar";
import { DataTable, type RowData } from "@/components/page-blocks/blocks/DataTable";
import { DonutChart, DONUT_COLORS } from "@/components/page-blocks/blocks/DonutChart";
import { Button } from "@/components/ui/button";
import { useContent } from "@/lib/use-content";
import { usePageConfig } from "@/lib/use-page-config";
import {
  CONTENT_COLLECTIONS,
  STATUS_TONE,
  type DerivedContent,
  type EpisodeStatus,
  type Pillar,
} from "@/lib/content-types";

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

  const derived = useContent<DerivedContent>(CONTENT_COLLECTIONS.derivedContent);
  const pillars = useContent<Pillar>(CONTENT_COLLECTIONS.pillars);
  const { blocks, addBlock, updateBlock, removeBlock } = usePageConfig("/contenido/contenido-derivado");
  const composer = useBlockComposer(addBlock);

  const pillarOf = (id: string | null) => pillars.items.find((p) => p.id === id);

  const counts = useMemo(() => {
    const by = (s: EpisodeStatus) => derived.items.filter((d) => d.status === s).length;
    return {
      total: derived.items.length,
      pub: by("Publicado"),
      prod: by("En producción"),
      plan: by("Planeado"),
      pause: by("Pausado"),
    };
  }, [derived.items]);

  const pct = (n: number) => (counts.total > 0 ? `${((n / counts.total) * 100).toFixed(1)}% del total` : "—");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return derived.items.filter((dc) => {
      if (tab !== "todos" && dc.status !== tab) return false;
      if (filters.pillar && filters.pillar !== "Todos" && pillarOf(dc.pillarId)?.name !== filters.pillar) return false;
      if (filters.format && filters.format !== "Todos" && dc.format !== filters.format) return false;
      if (!q) return true;
      return `${dc.title} ${dc.subtitle} ${dc.episodeTitle} ${dc.format}`.toLowerCase().includes(q);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [derived.items, pillars.items, tab, search, filters]);

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
    value: derived.items.filter((d) => d.format === f).length,
    color: DONUT_COLORS[i % DONUT_COLORS.length],
  }))
    .filter((s) => s.value > 0)
    .sort((a, b) => b.value - a.value);

  const loading = derived.loading || pillars.loading;
  const isEmpty = !loading && counts.total === 0;

  const sidePanel = (
    <>
      {!isEmpty && (
        <>
          <BlockFrame title="Distribución por formato" icon="PieChart">
            <DonutChart slices={formatSlices} centerValue={String(counts.total)} centerLabel="Contenidos derivados" />
          </BlockFrame>

          <BlockFrame title="Actividad reciente" icon="Activity">
            <ul className="space-y-3">
              {derived.items.slice(0, 4).map((dc) => (
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
        </>
      )}

    </>
  );

  return (
    <PageShell
      title="Contenido Derivado"
      description="Activos y materiales derivados de los episodios madre para diferentes canales y formatos."
      icon="GitFork"
      starrable={false}
      sidePanel={sidePanel}
      blocks={{ items: blocks, onUpdate: updateBlock, onDelete: removeBlock, onAdd: composer.openFor }}
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
      {loading ? (
        <div className="surface-card">
          <LoadingState />
        </div>
      ) : isEmpty ? (
        <div className="surface-card">
          <EmptyState
            icon="GitFork"
            title="Todavía no hay contenido derivado"
            description="De cada episodio madre nacen reels, artículos, guías y más. Cuando generes activos derivados, aparecerán aquí con su estado y canal."
            actionLabel="Nuevo Activo"
            onAction={() => undefined}
          />
        </div>
      ) : (
        <>
          <KpiStrip
            items={[
              { id: "total", label: "Contenidos derivados", value: String(counts.total), sub: "100% del plan", icon: "GitFork", tone: "violet" },
              { id: "pub", label: "Completados", value: String(counts.pub), sub: pct(counts.pub), icon: "CheckCircle2", tone: "emerald" },
              { id: "prod", label: "En producción", value: String(counts.prod), sub: pct(counts.prod), icon: "Clock", tone: "amber" },
              { id: "plan", label: "Planeados", value: String(counts.plan), sub: pct(counts.plan), icon: "CalendarDays", tone: "blue" },
              { id: "pause", label: "Pausados", value: String(counts.pause), sub: pct(counts.pause), icon: "Pause", tone: "gold" },
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
                    { id: "pillar", label: "Pilar", options: pillars.items.map((p) => p.name) },
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
                onDeleteRow={(id) => derived.remove(id)}
              />
            </div>
          </div>
        </>
      )}

      <AddBlockDialog {...composer.dialogProps} />
    </PageShell>
  );
}
