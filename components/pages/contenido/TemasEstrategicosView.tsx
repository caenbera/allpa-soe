"use client";

import { useMemo, useState } from "react";
import { ArrowRight, List, Plus, TrendingUp } from "lucide-react";
import { PageShell } from "@/components/page-blocks/PageShell";
import { BlockFrame } from "@/components/page-blocks/BlockFrame";
import { AddBlockDialog } from "@/components/page-blocks/AddBlockDialog";
import { useBlockComposer } from "@/components/page-blocks/use-block-composer";
import { EmptyState, LoadingState } from "@/components/page-blocks/EmptyState";
import { KpiStrip } from "@/components/page-blocks/blocks/KpiStrip";
import { DonutChart } from "@/components/page-blocks/blocks/DonutChart";
import { FilterToolbar } from "@/components/page-blocks/blocks/FilterToolbar";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { resolveLucideIcon } from "@/lib/lucide-icon";
import { useContent } from "@/lib/use-content";
import { usePageConfig } from "@/lib/use-page-config";
import { CONTENT_COLLECTIONS, type Episode, type Pillar } from "@/lib/content-types";

export function TemasEstrategicosView() {
  const [search, setSearch] = useState("");

  const pillars = useContent<Pillar>(CONTENT_COLLECTIONS.pillars);
  const episodes = useContent<Episode>(CONTENT_COLLECTIONS.episodes);
  const { blocks, addBlock, updateBlock, removeBlock } = usePageConfig("/contenido/temas-estrategicos");
  const composer = useBlockComposer(addBlock);

  const stats = useMemo(
    () =>
      pillars.items.map((pillar, i) => {
        const eps = episodes.items.filter((e) => e.pillarId === pillar.id);
        const inProduction = eps.filter((e) => e.status === "En producción").length;
        const progress = pillar.weeksPlanned > 0 ? Math.min(100, Math.round((eps.length / pillar.weeksPlanned) * 100)) : 0;
        return { pillar, index: i + 1, episodes: eps.length, inProduction, progress };
      }),
    [pillars.items, episodes.items]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return stats;
    return stats.filter((s) => `${s.pillar.name} ${s.pillar.description}`.toLowerCase().includes(q));
  }, [stats, search]);

  const growing = stats.filter((s) => s.pillar.growth);

  const loading = pillars.loading || episodes.loading;
  const isEmpty = !loading && pillars.items.length === 0;

  const sidePanel = (
    <>
      {!isEmpty && (
        <>
          <BlockFrame title="Distribución por pilar" icon="PieChart">
            <DonutChart
              slices={pillars.items
                .map((p) => ({
                  id: p.id,
                  label: p.name,
                  value: episodes.items.filter((e) => e.pillarId === p.id).length,
                  color: p.color,
                }))
                .filter((s) => s.value > 0)}
              centerValue={String(episodes.items.length)}
              centerLabel="Semanas totales"
            />
          </BlockFrame>

          {growing.length > 0 && (
            <BlockFrame title="Pilares en crecimiento" icon="TrendingUp">
              <ul className="space-y-3">
                {growing.map((s) => {
                  const Icon = resolveLucideIcon(s.pillar.icon);
                  return (
                    <li key={s.pillar.id} className="flex items-center gap-2.5">
                      <span
                        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
                        style={{ background: `${s.pillar.color}20`, color: s.pillar.color }}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm text-white/80">{s.pillar.name}</span>
                        <span className="flex items-center gap-1 text-xs text-emerald-400">
                          <TrendingUp className="h-3 w-3" />
                          {s.pillar.growth}
                        </span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </BlockFrame>
          )}
        </>
      )}

    </>
  );

  return (
    <PageShell
      title="Temas Estratégicos"
      description="Los pilares que guían tu plan de contenido y mantienen todo alineado con la estrategia."
      icon="Target"
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
            Nuevo Pilar
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
            icon="Target"
            title="Todavía no hay pilares estratégicos"
            description="Los pilares son los grandes temas que ordenan tu plan de contenido. Define el primero y cada episodio quedará alineado con tu estrategia."
            actionLabel="Nuevo Pilar"
            onAction={() => undefined}
          />
        </div>
      ) : (
        <>
          <KpiStrip
            items={[
              { id: "pillars", label: "Pilares estratégicos", value: String(pillars.items.length), icon: "Landmark", tone: "violet" },
              { id: "weeks", label: "Semanas cubiertas", value: String(episodes.items.length), sub: "del plan anual", icon: "CalendarDays", tone: "blue" },
              { id: "growing", label: "Pilares en crecimiento", value: String(growing.length), sub: "activos", icon: "TrendingUp", tone: "amber" },
            ]}
          />

          <BlockFrame title="Pilares estratégicos" icon="Target" padded={false}>
            <div className="px-4 pt-3">
              <FilterToolbar search={search} onSearchChange={setSearch} searchPlaceholder="Buscar pilar estratégico..." />
            </div>

            <div className="mt-3 divide-y divide-white/[0.06]">
              {filtered.map((s) => {
                const Icon = resolveLucideIcon(s.pillar.icon);
                return (
                  <div key={s.pillar.id} className="flex flex-col gap-3 px-4 py-4 lg:flex-row lg:items-center">
                    <div className="flex min-w-0 flex-1 items-start gap-3">
                      <span
                        className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl"
                        style={{ background: `${s.pillar.color}20`, color: s.pillar.color }}
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="min-w-0">
                        <span className="flex items-center gap-2">
                          <span className="text-xs tabular-nums text-white/30">{String(s.index).padStart(2, "0")}</span>
                          <span className="font-semibold text-[#f3ecd9]">{s.pillar.name}</span>
                        </span>
                        <span className="mt-0.5 block text-sm leading-snug text-white/50">{s.pillar.description}</span>
                      </span>
                    </div>

                    <div className="flex-shrink-0 lg:w-72">
                      <div className="mb-1.5 flex items-center justify-between text-xs">
                        <span className="text-white/40">Progreso del pilar</span>
                        <span className="font-semibold tabular-nums text-white/75">{s.progress}%</span>
                      </div>
                      <Progress value={s.progress} />
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/45">
                        <span>
                          Semanas <span className="text-white/70">{s.episodes} / {s.pillar.weeksPlanned}</span>
                        </span>
                        <span>
                          En producción <span className="text-white/70">{s.inProduction}</span>
                        </span>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-shrink-0 border-white/12 bg-white/[0.03] text-white/70 hover:bg-white/[0.06]"
                    >
                      Ver semanas
                      <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                    </Button>
                  </div>
                );
              })}
              {filtered.length === 0 && <p className="px-4 py-10 text-center text-sm text-white/35">No hay pilares que coincidan.</p>}
            </div>
          </BlockFrame>
        </>
      )}

      <AddBlockDialog {...composer.dialogProps} />
    </PageShell>
  );
}
