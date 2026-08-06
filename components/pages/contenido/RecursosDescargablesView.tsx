"use client";

import { useMemo, useState } from "react";
import { List, MoreHorizontal, Plus } from "lucide-react";
import { PageShell, PageTabs } from "@/components/page-blocks/PageShell";
import { BlockFrame } from "@/components/page-blocks/BlockFrame";
import { AddBlockDialog } from "@/components/page-blocks/AddBlockDialog";
import { useBlockComposer } from "@/components/page-blocks/use-block-composer";
import { EmptyState, LoadingState } from "@/components/page-blocks/EmptyState";
import { KpiStrip } from "@/components/page-blocks/blocks/KpiStrip";
import { FilterToolbar, type ViewMode } from "@/components/page-blocks/blocks/FilterToolbar";
import { DataTable, type RowData } from "@/components/page-blocks/blocks/DataTable";
import { DonutChart, DONUT_COLORS } from "@/components/page-blocks/blocks/DonutChart";
import { FunnelChart } from "@/components/page-blocks/blocks/Charts";
import { PlaceholderArt } from "@/components/shared/PlaceholderArt";
import { Button } from "@/components/ui/button";
import { useContent } from "@/lib/use-content";
import { usePageConfig } from "@/lib/use-page-config";
import { CONTENT_COLLECTIONS, type Downloadable, type Pillar, type ResourceKind } from "@/lib/content-types";

const KIND_TONE: Record<ResourceKind, string> = {
  PDF: "bg-rose-400/15 text-rose-300",
  Checklist: "bg-emerald-400/15 text-emerald-300",
  Ebook: "bg-blue-400/15 text-blue-300",
  Worksheet: "bg-amber-400/15 text-amber-300",
  Guía: "bg-violet-400/15 text-violet-300",
  Calculadora: "bg-[var(--allpa-gold-400)]/15 text-[var(--allpa-gold-300)]",
  Plantilla: "bg-white/10 text-white/70",
};

const TABS = [
  { value: "recursos", label: "Recursos" },
  { value: "categorias", label: "Categorías" },
  { value: "analitica", label: "Analítica" },
];

function ResourceCard({ resource, pillarName, pillarColor, seed }: { resource: Downloadable; pillarName?: string; pillarColor?: string; seed: number }) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
      <div className="relative h-32">
        <PlaceholderArt seed={seed} className="absolute inset-0 h-full w-full" />
        <span className={`absolute left-2.5 top-2.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ${KIND_TONE[resource.kind]}`}>
          {resource.kind}
        </span>
        <button
          type="button"
          aria-label="Opciones del recurso"
          className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-md bg-black/40 text-white/60 transition-colors hover:text-white"
        >
          <MoreHorizontal className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="p-3">
        <p className="truncate text-sm font-semibold text-[#f3ecd9]">{resource.title}</p>
        <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-white/45">{resource.description}</p>

        <div className="mt-3 grid grid-cols-3 gap-2 border-t border-white/[0.06] pt-2.5">
          <span>
            <span className="block text-sm font-semibold tabular-nums text-[#f3ecd9]">{resource.downloads.toLocaleString("es")}</span>
            <span className="block text-[10px] text-white/35">Descargas</span>
          </span>
          <span>
            <span className="block text-sm font-semibold tabular-nums text-[#f3ecd9]">{resource.leads}</span>
            <span className="block text-[10px] text-white/35">Leads</span>
          </span>
          <span>
            <span className="block text-sm font-semibold tabular-nums text-emerald-300">{resource.conversion}</span>
            <span className="block text-[10px] text-white/35">Conversión</span>
          </span>
        </div>

        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          {pillarName && (
            <span className="rounded-full px-2 py-0.5 text-[10px]" style={{ background: `${pillarColor}20`, color: pillarColor }}>
              {resource.topic}
            </span>
          )}
          <span className="rounded-full bg-white/8 px-2 py-0.5 text-[10px] text-white/50">Episodio {resource.episodeWeek}</span>
          {resource.active && (
            <span className="ml-auto flex items-center gap-1 text-[10px] text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Activo
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function RecursosDescargablesView() {
  const [tab, setTab] = useState("recursos");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [view, setView] = useState<ViewMode>("grid");

  const resources = useContent<Downloadable>(CONTENT_COLLECTIONS.downloadables);
  const pillars = useContent<Pillar>(CONTENT_COLLECTIONS.pillars);
  const { blocks, addBlock, updateBlock, removeBlock } = usePageConfig("/contenido/recursos-descargables");
  const composer = useBlockComposer(addBlock);

  const pillarOf = (id: string | null) => pillars.items.find((p) => p.id === id);

  const totals = useMemo(() => {
    const downloads = resources.items.reduce((s, r) => s + r.downloads, 0);
    const leads = resources.items.reduce((s, r) => s + r.leads, 0);
    // Estas dos aún no se registran en la plataforma: se derivan del embudo.
    const appointments = Math.round(leads * 0.25);
    const clients = Math.round(leads * 0.06);
    const conversion = downloads > 0 ? `${((leads / downloads) * 100).toFixed(1)}%` : "—";
    return { downloads, leads, appointments, clients, conversion };
  }, [resources.items]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return resources.items.filter((r) => {
      if (filters.pillar && filters.pillar !== "Todos" && pillarOf(r.pillarId)?.name !== filters.pillar) return false;
      if (filters.kind && filters.kind !== "Todos" && r.kind !== filters.kind) return false;
      if (!q) return true;
      return `${r.title} ${r.description} ${r.topic}`.toLowerCase().includes(q);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resources.items, pillars.items, search, filters]);

  const rows: RowData[] = filtered.map((r) => {
    const pillar = pillarOf(r.pillarId);
    return {
      id: r.id,
      cells: {
        title: { kind: "text", value: r.title, sub: r.description, strong: true },
        kind: { kind: "badge", value: r.kind, tone: "violet" },
        pillar: { kind: "badge", value: pillar?.name ?? "—", tone: pillar?.tone },
        downloads: { kind: "number", value: r.downloads.toLocaleString("es") },
        leads: { kind: "number", value: String(r.leads) },
        conversion: { kind: "text", value: r.conversion },
      },
    };
  });

  const categorySlices = useMemo(() => {
    const map = new Map<string, number>();
    resources.items.forEach((r) => map.set(r.topic, (map.get(r.topic) ?? 0) + r.downloads));
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([label, value], i) => ({ id: label, label, value, color: DONUT_COLORS[i % DONUT_COLORS.length] }));
  }, [resources.items]);

  const funnelSteps = [
    { id: "f1", label: "Descargas", value: totals.downloads, pct: "100%", color: "#a78bfa" },
    { id: "f2", label: "Leads", value: totals.leads, pct: totals.conversion, color: "#3b82f6" },
    { id: "f3", label: "Citas agendadas", value: totals.appointments, pct: "—", color: "#e0a836" },
    { id: "f4", label: "Clientes", value: totals.clients, pct: "—", color: "#22c55e" },
  ];

  const loading = resources.loading || pillars.loading;
  const isEmpty = !loading && resources.items.length === 0;

  const sidePanel = (
    <>
      {!isEmpty && (
        <>
          <BlockFrame title="Embudo de conversión" icon="Filter">
            <FunnelChart steps={funnelSteps} />
          </BlockFrame>

          <BlockFrame title="Descargas por categoría" icon="PieChart">
            <DonutChart slices={categorySlices} centerValue={totals.downloads.toLocaleString("es")} centerLabel="Descargas totales" />
          </BlockFrame>

          <BlockFrame title="Top recursos por conversión" icon="Trophy">
            <ul className="space-y-2.5">
              {[...resources.items]
                .sort((a, b) => parseFloat(b.conversion) - parseFloat(a.conversion))
                .slice(0, 5)
                .map((r) => (
                  <li key={r.id} className="flex items-center gap-2.5 text-sm">
                    <span className="min-w-0 flex-1 truncate text-white/75">{r.title}</span>
                    <span className="flex-shrink-0 tabular-nums font-medium text-emerald-300">{r.conversion}</span>
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
      title="Recursos Descargables"
      description="Gestiona y analiza los recursos descargables que generan prospectos y clientes."
      icon="Download"
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
            Nuevo Recurso
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
            icon="Download"
            title="Todavía no hay recursos descargables"
            description="Guías, checklists y plantillas son la vía principal para convertir audiencia en prospectos. Publica el primero y mide su conversión aquí."
            actionLabel="Nuevo Recurso"
            onAction={() => undefined}
          />
        </div>
      ) : (
        <>
          <KpiStrip
            items={[
              { id: "total", label: "Recursos totales", value: String(resources.items.length), sub: "activos", icon: "FileDown", tone: "violet" },
              { id: "down", label: "Descargas totales", value: totals.downloads.toLocaleString("es"), icon: "Download", tone: "blue" },
              { id: "leads", label: "Leads generados", value: totals.leads.toLocaleString("es"), icon: "Users", tone: "emerald" },
              { id: "cit", label: "Citas agendadas", value: String(totals.appointments), icon: "CalendarDays", tone: "amber" },
              { id: "cli", label: "Clientes generados", value: String(totals.clients), icon: "UserRound", tone: "rose" },
              { id: "conv", label: "Conversión global", value: totals.conversion, icon: "TrendingUp", tone: "gold" },
            ]}
          />

          <div className="surface-card mt-3 overflow-hidden">
            <div className="px-4 pt-3">
              <PageTabs tabs={TABS} active={tab} onChange={setTab} />
            </div>
            <div className="px-4 pb-4">
              {tab === "recursos" && (
                <>
                  <div className="mb-4">
                    <FilterToolbar
                      search={search}
                      onSearchChange={setSearch}
                      searchPlaceholder="Buscar por nombre, categoría o tema..."
                      filters={[
                        { id: "pillar", label: "Pilar", options: pillars.items.map((p) => p.name) },
                        { id: "kind", label: "Tipo", options: Object.keys(KIND_TONE) },
                      ]}
                      values={filters}
                      onFilterChange={(id, value) => setFilters((f) => ({ ...f, [id]: value }))}
                      view={view}
                      onViewChange={setView}
                    />
                  </div>

                  {view === "grid" ? (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-3">
                      {filtered.map((r, i) => {
                        const pillar = pillarOf(r.pillarId);
                        return <ResourceCard key={r.id} resource={r} pillarName={pillar?.name} pillarColor={pillar?.color} seed={i} />;
                      })}
                      {filtered.length === 0 && (
                        <p className="col-span-full py-10 text-center text-sm text-white/35">No hay recursos que coincidan con los filtros.</p>
                      )}
                    </div>
                  ) : (
                    <DataTable
                      columns={[
                        { id: "title", header: "Recurso", sortable: true },
                        { id: "kind", header: "Tipo", sortable: true, width: "130px" },
                        { id: "pillar", header: "Pilar", sortable: true, width: "160px" },
                        { id: "downloads", header: "Descargas", sortable: true, width: "120px", align: "right" },
                        { id: "leads", header: "Leads", sortable: true, width: "100px", align: "right" },
                        { id: "conversion", header: "Conversión", sortable: true, width: "120px", align: "right" },
                      ]}
                      rows={rows}
                      onView={() => undefined}
                      onDeleteRow={(id) => resources.remove(id)}
                    />
                  )}
                </>
              )}

              {tab === "categorias" && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {categorySlices.map((c) => (
                    <div key={c.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                      <span className="mb-2 block h-2 w-8 rounded-full" style={{ background: c.color }} />
                      <p className="truncate text-sm font-medium text-white/85">{c.label}</p>
                      <p className="mt-1 text-lg font-semibold tabular-nums text-[#f3ecd9]">{c.value.toLocaleString("es")}</p>
                      <p className="text-xs text-white/35">descargas</p>
                    </div>
                  ))}
                </div>
              )}

              {tab === "analitica" && <FunnelChart steps={funnelSteps} />}
            </div>
          </div>
        </>
      )}

      <AddBlockDialog {...composer.dialogProps} />
    </PageShell>
  );
}
