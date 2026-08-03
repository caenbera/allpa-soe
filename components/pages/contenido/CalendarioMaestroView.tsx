"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, List, Plus, Star } from "lucide-react";
import { PageShell, PageTabs } from "@/components/page-blocks/PageShell";
import { BlockFrame } from "@/components/page-blocks/BlockFrame";
import { AddBlockButton, AddBlockDialog } from "@/components/page-blocks/AddBlockDialog";
import { BlockRenderer } from "@/components/page-blocks/BlockRenderer";
import { EmptyState, LoadingState } from "@/components/page-blocks/EmptyState";
import { DonutChart } from "@/components/page-blocks/blocks/DonutChart";
import { FilterToolbar } from "@/components/page-blocks/blocks/FilterToolbar";
import { Button } from "@/components/ui/button";
import { useContent } from "@/lib/use-content";
import { usePageConfig } from "@/lib/use-page-config";
import { CONTENT_COLLECTIONS, type Episode, type EpisodeStatus, type Pillar } from "@/lib/content-types";

const MONTHS = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

const QUARTER_TABS = [
  { value: "todo", label: "Año completo" },
  { value: "q1", label: "Q1 (Sem 1–13)" },
  { value: "q2", label: "Q2 (Sem 14–26)" },
  { value: "q3", label: "Q3 (Sem 27–39)" },
  { value: "q4", label: "Q4 (Sem 40–52)" },
];

const STATUS_PILL: Record<EpisodeStatus, string> = {
  Publicado: "bg-emerald-400/12 text-emerald-300",
  "En producción": "bg-amber-400/12 text-amber-300",
  Planeado: "bg-blue-400/12 text-blue-300",
  Pausado: "bg-white/8 text-white/50",
};

function WeekCard({ episode, pillar }: { episode: Episode; pillar?: Pillar }) {
  const [starred, setStarred] = useState(false);

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 transition-colors hover:border-[var(--allpa-gold-400)]/40">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-xs font-medium text-white/55">Semana {String(episode.week).padStart(2, "0")}</span>
        <span className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_PILL[episode.status]}`}>
          {episode.status}
        </span>
        <button type="button" onClick={() => setStarred((s) => !s)} aria-label="Marcar semana">
          <Star className={`h-3.5 w-3.5 ${starred ? "fill-[var(--allpa-gold-400)] text-[var(--allpa-gold-400)]" : "text-white/20"}`} />
        </button>
      </div>

      <p className="mb-3 line-clamp-2 text-sm font-medium leading-snug text-white/85">{episode.title}</p>

      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#f5da93] to-[#a9760f] text-[9px] font-bold text-[#241a05]">
          {episode.guest.split(" ").map((p) => p[0]).slice(0, 2).join("")}
        </span>
        <span className="min-w-0">
          <span className="block text-[10px] text-white/35">Invitado</span>
          <span className="block truncate text-xs text-white/65">{episode.guest}</span>
        </span>
      </div>

      {pillar && (
        <span
          className="inline-block rounded-full px-2 py-0.5 text-[10px] font-medium"
          style={{ background: `${pillar.color}20`, color: pillar.color }}
        >
          {pillar.name}
        </span>
      )}
    </div>
  );
}

export function CalendarioMaestroView() {
  const [quarter, setQuarter] = useState("todo");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [year, setYear] = useState(new Date().getFullYear());
  const [createOpen, setCreateOpen] = useState(false);

  const episodes = useContent<Episode>(CONTENT_COLLECTIONS.episodes);
  const pillars = useContent<Pillar>(CONTENT_COLLECTIONS.pillars);
  const { blocks, addBlock, updateBlock, removeBlock } = usePageConfig("/contenido/calendario-maestro");

  const pillarOf = (id: string | null) => pillars.items.find((p) => p.id === id);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const range: Record<string, [number, number]> = { q1: [1, 13], q2: [14, 26], q3: [27, 39], q4: [40, 52] };
    return episodes.items.filter((ep) => {
      if (quarter !== "todo") {
        const [from, to] = range[quarter];
        if (ep.week < from || ep.week > to) return false;
      }
      if (filters.pillar && filters.pillar !== "Todos" && pillarOf(ep.pillarId)?.name !== filters.pillar) return false;
      if (!q) return true;
      return `${ep.title} ${ep.guest}`.toLowerCase().includes(q);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [episodes.items, pillars.items, quarter, search, filters]);

  /** Cada semana cae en el mes que le corresponde (4-5 semanas por mes). */
  const byMonth = useMemo(() => {
    const map = new Map<number, Episode[]>();
    filtered.forEach((ep) => {
      const month = Math.min(11, Math.floor((ep.week - 1) / 4.34));
      const list = map.get(month) ?? [];
      list.push(ep);
      map.set(month, list);
    });
    return map;
  }, [filtered]);

  const pillarSlices = pillars.items
    .map((p) => ({ id: p.id, label: p.name, value: episodes.items.filter((e) => e.pillarId === p.id).length, color: p.color }))
    .filter((s) => s.value > 0);

  const loading = episodes.loading || pillars.loading;
  const isEmpty = !loading && episodes.items.length === 0;

  const sidePanel = (
    <>
      {!isEmpty && (
        <>
          <BlockFrame title="Resumen del Plan Anual" icon="PieChart">
            <DonutChart slices={pillarSlices} centerValue={String(episodes.items.length)} centerLabel="Semanas planificadas" />
          </BlockFrame>

          <BlockFrame title="Estado general" icon="Activity">
            <ul className="space-y-2.5 text-sm">
              {(Object.keys(STATUS_PILL) as EpisodeStatus[]).map((s) => {
                const n = episodes.items.filter((e) => e.status === s).length;
                return (
                  <li key={s} className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_PILL[s]}`}>{s}</span>
                    <span className="ml-auto tabular-nums font-medium text-white/85">{n}</span>
                  </li>
                );
              })}
            </ul>
          </BlockFrame>

          <BlockFrame title="Próximas semanas" icon="CalendarClock">
            <ul className="space-y-3">
              {episodes.items
                .filter((e) => e.status !== "Publicado")
                .slice(0, 3)
                .map((ep) => (
                  <li key={ep.id} className="flex items-start gap-2.5">
                    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--allpa-gold-400)]/12 text-xs font-semibold text-[var(--allpa-gold-300)]">
                      {String(ep.week).padStart(2, "0")}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm text-white/80">{ep.title}</span>
                      <span className="block text-xs text-white/35">{ep.publishDate}</span>
                    </span>
                  </li>
                ))}
            </ul>
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
      title="Calendario Maestro"
      description="Vista anual de las 52 semanas del plan de contenido."
      icon="CalendarDays"
      starrable={false}
      sidePanel={sidePanel}
      headerActions={
        <>
          <span className="flex items-center gap-1 rounded-lg border border-white/12 bg-white/[0.03] px-1">
            <button
              type="button"
              onClick={() => setYear((y) => y - 1)}
              aria-label="Año anterior"
              className="flex h-8 w-8 items-center justify-center rounded-md text-white/45 transition-colors hover:bg-white/5 hover:text-white/80"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="w-12 text-center text-sm font-semibold tabular-nums text-white/85">{year}</span>
            <button
              type="button"
              onClick={() => setYear((y) => y + 1)}
              aria-label="Año siguiente"
              className="flex h-8 w-8 items-center justify-center rounded-md text-white/45 transition-colors hover:bg-white/5 hover:text-white/80"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </span>
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
      {loading ? (
        <div className="surface-card">
          <LoadingState />
        </div>
      ) : isEmpty ? (
        <div className="surface-card">
          <EmptyState
            icon="CalendarDays"
            title="Tu calendario está vacío"
            description="Planifica tu año semana a semana: cada una es un episodio madre con su invitado, su pilar estratégico y sus activos derivados."
            actionLabel="Nueva Semana"
            onAction={() => undefined}
          />
        </div>
      ) : (
        <>
          {pillars.items.length > 0 && (
            <BlockFrame title="Pilares del plan" icon="Target">
              <div className="flex flex-wrap items-center gap-3">
                {pillars.items.map((p) => (
                  <span key={p.id} className="flex items-center gap-1.5 text-xs text-white/60">
                    <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
                    {p.name}
                  </span>
                ))}
              </div>
            </BlockFrame>
          )}

          <div className="surface-card overflow-hidden">
            <div className="px-4 pt-3">
              <PageTabs tabs={QUARTER_TABS} active={quarter} onChange={setQuarter} />
            </div>
            <div className="px-4 pb-4">
              <div className="mb-4">
                <FilterToolbar
                  search={search}
                  onSearchChange={setSearch}
                  searchPlaceholder="Buscar por tema o invitado..."
                  filters={[{ id: "pillar", label: "Pilar", options: pillars.items.map((p) => p.name) }]}
                  values={filters}
                  onFilterChange={(id, value) => setFilters((f) => ({ ...f, [id]: value }))}
                />
              </div>

              {byMonth.size === 0 ? (
                <p className="py-10 text-center text-sm text-white/35">No hay semanas que coincidan con los filtros.</p>
              ) : (
                <div className="space-y-6">
                  {Array.from(byMonth.entries())
                    .sort((a, b) => a[0] - b[0])
                    .map(([month, weeks]) => (
                      <div key={month}>
                        <p className="mb-2.5 text-sm font-semibold text-[#f3ecd9]">{MONTHS[month]}</p>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                          {weeks.map((ep) => (
                            <WeekCard key={ep.id} episode={ep} pillar={pillarOf(ep.pillarId)} />
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              )}

              <p className="mt-5 flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2.5 text-xs text-white/45">
                Cada semana representa un episodio madre y sus activos derivados. Haz clic en cualquier tarjeta para ver los detalles completos.
              </p>
            </div>
          </div>
        </>
      )}

      <AddBlockDialog open={createOpen} onOpenChange={setCreateOpen} onCreate={addBlock} />
    </PageShell>
  );
}
