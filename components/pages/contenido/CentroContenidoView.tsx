"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ChevronDown, LayoutGrid, List, Plus, Search } from "lucide-react";
import { PageShell, PageTabs } from "@/components/page-blocks/PageShell";
import { BlockFrame } from "@/components/page-blocks/BlockFrame";
import { AddBlockButton, AddBlockDialog } from "@/components/page-blocks/AddBlockDialog";
import { BlockRenderer } from "@/components/page-blocks/BlockRenderer";
import { EmptyState, LoadingState } from "@/components/page-blocks/EmptyState";
import { KpiStrip } from "@/components/page-blocks/blocks/KpiStrip";
import { WeekStrip } from "@/components/page-blocks/blocks/WeekStrip";
import { WeekCardGrid, type WeekCardData } from "@/components/page-blocks/blocks/WeekCardGrid";
import { PillarCardGrid } from "@/components/page-blocks/blocks/PillarCardGrid";
import { EcosystemHub } from "@/components/page-blocks/blocks/EcosystemHub";
import { KpiProgressList } from "@/components/page-blocks/blocks/KpiProgressList";
import { UpcomingEpisodes } from "@/components/page-blocks/blocks/UpcomingEpisodes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useContent } from "@/lib/use-content";
import { usePageConfig } from "@/lib/use-page-config";
import { weekDetailPath } from "@/lib/page-registry";
import { CONTENT_COLLECTIONS, type Episode, type EpisodeStatus, type Pillar } from "@/lib/content-types";

const TOTAL_WEEKS = 52;
/** Cuántas tarjetas se muestran alrededor de la semana enfocada. */
const VISIBLE_WEEKS = 5;

/** Las pestañas navegan a las páginas hermanas del módulo. */
const TABS = [
  { value: "resumen", label: "Resumen", href: "/contenido/centro-de-contenido" },
  { value: "calendario", label: "Calendario", href: "/contenido/calendario-maestro" },
  { value: "temas", label: "Temas Estratégicos", href: "/contenido/temas-estrategicos" },
  { value: "episodios", label: "Episodios Madre", href: "/contenido/episodios-madre" },
  { value: "derivado", label: "Contenido Derivado", href: "/contenido/contenido-derivado" },
  { value: "academia", label: "Academia", href: "/contenido/academia" },
  { value: "biblioteca", label: "Biblioteca", href: "/contenido/biblioteca-multimedia" },
];

const STATUS_PILL: Record<EpisodeStatus, string> = {
  Publicado: "bg-emerald-400/12 text-emerald-300",
  "En producción": "bg-amber-400/12 text-amber-300",
  Planeado: "bg-blue-400/12 text-blue-300",
  Pausado: "bg-white/8 text-white/50",
};

const ECOSYSTEM_SPOKES = [
  { id: "youtube", label: "YouTube", sub: "(Largo)", icon: "Video", color: "#ef4444" },
  { id: "clips", label: "Clips & Shorts", sub: "(5-10)", icon: "Scissors", color: "#22c55e" },
  { id: "carrusel", label: "Carrusel", sub: "(1)", icon: "Rows3", color: "#3b82f6" },
  { id: "pdf", label: "PDF / Guía", sub: "(1)", icon: "FileDown", color: "#f472b6" },
  { id: "academia", label: "Academia", sub: "(1 Clase)", icon: "GraduationCap", color: "#a78bfa" },
  { id: "email", label: "Email", sub: "(1)", icon: "Mail", color: "#e0a836" },
  { id: "articulo", label: "Artículo SEO", sub: "(1)", icon: "FileText", color: "#22c55e" },
  { id: "reels", label: "Reels", sub: "(8-12)", icon: "Camera", color: "#f472b6" },
];

export function CentroContenidoView() {
  const router = useRouter();
  const [year, setYear] = useState(2027);
  const [search, setSearch] = useState("");
  const [activeWeek, setActiveWeek] = useState(12);
  const [view, setView] = useState<"semanal" | "lista">("semanal");
  const [createOpen, setCreateOpen] = useState(false);

  const episodes = useContent<Episode>(CONTENT_COLLECTIONS.episodes);
  const pillars = useContent<Pillar>(CONTENT_COLLECTIONS.pillars);
  const { blocks, addBlock, updateBlock, removeBlock } = usePageConfig("/contenido/centro-de-contenido");

  const byWeek = useMemo(() => {
    const map = new Map<number, Episode>();
    episodes.items.forEach((e) => map.set(e.week, e));
    return map;
  }, [episodes.items]);

  const counts = useMemo(() => {
    const by = (s: EpisodeStatus) => episodes.items.filter((e) => e.status === s).length;
    const assetsDone = episodes.items.reduce((sum, e) => sum + e.assetsDone, 0);
    const assetsTotal = episodes.items.reduce((sum, e) => sum + e.assetsTotal, 0);
    // "Programados" son las próximas semanas planeadas a partir de la activa.
    const scheduled = episodes.items.filter((e) => e.status === "Planeado" && e.week >= activeWeek).length;
    return {
      total: episodes.items.length,
      published: by("Publicado"),
      inProduction: by("En producción"),
      scheduled: Math.min(scheduled, 4),
      assetsDone,
      assetsTotal,
      index: assetsTotal > 0 ? Math.round((assetsDone / assetsTotal) * 100) : 0,
    };
  }, [episodes.items, activeWeek]);

  /** Ventana de semanas alrededor de la activa, acotada a los extremos del año. */
  const visibleWeeks: WeekCardData[] = useMemo(() => {
    const half = Math.floor(VISIBLE_WEEKS / 2);
    let from = Math.max(1, activeWeek - half);
    const to = Math.min(TOTAL_WEEKS, from + VISIBLE_WEEKS - 1);
    from = Math.max(1, to - VISIBLE_WEEKS + 1);

    const cards: WeekCardData[] = [];
    for (let w = from; w <= to; w++) {
      const ep = byWeek.get(w);
      if (!ep) continue;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        if (!`${ep.title} ${ep.guest}`.toLowerCase().includes(q)) continue;
      }
      cards.push({
        id: ep.id,
        week: ep.week,
        dateRange: ep.dateRange ?? "—",
        title: ep.title,
        guest: ep.guest,
        guestLabel: "Invitado",
        status: ep.status,
        statusClass: STATUS_PILL[ep.status],
        assetsDone: ep.assetsDone,
        assetsTotal: ep.assetsTotal,
        href: weekDetailPath(ep.week),
        highlighted: ep.week === activeWeek,
      });
    }
    return cards;
  }, [byWeek, activeWeek, search]);

  const pillarCards = useMemo(
    () =>
      pillars.items.map((p) => {
        const eps = episodes.items.filter((e) => e.pillarId === p.id).length;
        return {
          id: p.id,
          name: p.name,
          icon: p.icon,
          color: p.color,
          topics: p.topics ?? [],
          episodes: eps,
          share: counts.total > 0 ? Math.round((eps / counts.total) * 100) : 0,
        };
      }),
    [pillars.items, episodes.items, counts.total]
  );

  const upcoming = useMemo(
    () =>
      episodes.items
        .filter((e) => e.week > activeWeek && e.status !== "Pausado")
        .slice(0, 3)
        .map((e) => ({
          id: e.id,
          week: e.week,
          dateRange: e.dateRange ?? "—",
          title: e.title,
          guest: e.guest,
          guestLabel: "Invitado",
          href: weekDetailPath(e.week),
        })),
    [episodes.items, activeWeek]
  );

  const loading = episodes.loading || pillars.loading;
  const isEmpty = !loading && counts.total === 0;

  const sidePanel = (
    <>
      {!isEmpty && (
        <>
          <BlockFrame title="Ecosistema de Contenido" icon="Share2">
            <p className="mb-2 text-xs text-white/40">De un episodio madre a múltiples activos</p>
            <EcosystemHub
              center={{ label: "Podcast", sub: "(Episodio Madre)", icon: "Mic" }}
              spokes={ECOSYSTEM_SPOKES}
            />
            <Link
              href="/contenido/contenido-derivado"
              className="mt-2 flex items-center justify-center gap-1 text-xs font-medium text-[var(--allpa-gold-300)] hover:underline"
            >
              Ver flujo completo
              <ArrowRight className="h-3 w-3" />
            </Link>
          </BlockFrame>

          <BlockFrame title="KPIs de Contenido" icon="TrendingUp">
            <KpiProgressList
              rows={[
                {
                  id: "pub",
                  label: "Episodios publicados",
                  icon: "CheckCircle2",
                  value: `${counts.published} / ${counts.total}`,
                  percent: counts.total > 0 ? Math.round((counts.published / counts.total) * 100) : 0,
                },
                {
                  id: "assets",
                  label: "Activos generados",
                  icon: "Boxes",
                  value: `${counts.assetsDone} / ${counts.assetsTotal}`,
                  percent: counts.index,
                },
                { id: "audience", label: "Audiencia total", icon: "Users", value: "48,250" },
                { id: "hours", label: "Horas de contenido", icon: "Clock", value: "86h 32m" },
                { id: "downloads", label: "Descargas de recursos", icon: "Download", value: "5,412" },
              ]}
            />
          </BlockFrame>

          <BlockFrame title="Próximos Episodios" icon="CalendarClock">
            <UpcomingEpisodes episodes={upcoming} />
            <Link
              href="/contenido/calendario-maestro"
              className="mt-3 flex items-center justify-center gap-1 text-xs font-medium text-[var(--allpa-gold-300)] hover:underline"
            >
              Ver todos los episodios programados
              <ArrowRight className="h-3 w-3" />
            </Link>
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
      title="Centro de Contenido"
      description="Tu fábrica de contenido que construye educación, confianza y legado."
      icon="Clapperboard"
      starrable={false}
      sidePanel={sidePanel}
      headerActions={
        <>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex h-9 items-center gap-1.5 rounded-lg border border-white/12 bg-white/[0.03] px-3 text-sm text-white/70 transition-colors hover:bg-white/[0.06]">
              Año {year}
              <ChevronDown className="h-3.5 w-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              {[year - 1, year, year + 1].map((y) => (
                <DropdownMenuItem key={y} onClick={() => setYear(y)}>
                  Año {y}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="relative hidden w-56 lg:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar contenido, temas, invitados..."
              className="h-9 bg-muted/40 pl-9"
            />
          </div>

          <Button className="border-0 bg-gradient-to-b from-[#f5da93] to-[#c98f1f] font-semibold text-[#241a05] hover:brightness-105">
            <Plus className="mr-1.5 h-4 w-4" />
            Nuevo Episodio
          </Button>
        </>
      }
    >
      <PageTabs
        tabs={TABS}
        active="resumen"
        onChange={(value) => {
          const tab = TABS.find((t) => t.value === value);
          if (tab && tab.value !== "resumen") router.push(tab.href);
        }}
      />

      {loading ? (
        <div className="surface-card">
          <LoadingState />
        </div>
      ) : isEmpty ? (
        <div className="surface-card">
          <EmptyState
            icon="Clapperboard"
            title="Tu plan de contenido está vacío"
            description="El Centro de Contenido reúne las 52 semanas del año: cada una con su episodio madre, su invitado y los activos que nacen de él. Crea el primero para empezar."
            actionLabel="Nuevo Episodio"
            onAction={() => undefined}
          />
        </div>
      ) : (
        <>
          <KpiStrip
            items={[
              { id: "planned", label: "Episodios planificados", value: String(counts.total), sub: `Año ${year}`, icon: "Mic", tone: "violet" },
              { id: "published", label: "Episodios publicados", value: String(counts.published), sub: `${counts.total > 0 ? Math.round((counts.published / counts.total) * 100) : 0}% del año`, icon: "CheckCircle2", tone: "emerald" },
              { id: "production", label: "En producción", value: String(counts.inProduction), sub: `${counts.total > 0 ? Math.round((counts.inProduction / counts.total) * 100) : 0}% del año`, icon: "Clock", tone: "amber" },
              { id: "scheduled", label: "Programados", value: String(counts.scheduled), sub: "Próximas 4 semanas", icon: "CalendarDays", tone: "blue" },
              { id: "index", label: "Índice de contenido", value: `${counts.index}%`, sub: "Activos generados", icon: "TrendingUp", tone: "gold" },
            ]}
          />

          <BlockFrame
            title={`Calendario Maestro – ${TOTAL_WEEKS} Semanas de Contenido`}
            icon="CalendarDays"
            actions={
              <div className="hidden items-center gap-0.5 rounded-lg border border-white/12 bg-white/[0.03] p-0.5 sm:flex">
                <button
                  type="button"
                  onClick={() => setView("semanal")}
                  className={`flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs transition-colors ${
                    view === "semanal" ? "bg-[var(--allpa-gold-400)]/20 text-[var(--allpa-gold-300)]" : "text-white/45 hover:text-white/75"
                  }`}
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                  Semanal
                </button>
                <button
                  type="button"
                  onClick={() => setView("lista")}
                  className={`flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs transition-colors ${
                    view === "lista" ? "bg-[var(--allpa-gold-400)]/20 text-[var(--allpa-gold-300)]" : "text-white/45 hover:text-white/75"
                  }`}
                >
                  <List className="h-3.5 w-3.5" />
                  Lista
                </button>
              </div>
            }
          >
            <WeekStrip
              weeks={Array.from({ length: TOTAL_WEEKS }, (_, i) => ({ week: i + 1, empty: !byWeek.has(i + 1) }))}
              active={activeWeek}
              onSelect={setActiveWeek}
              onToday={() => setActiveWeek(12)}
            />

            <div className="mt-4">
              {visibleWeeks.length === 0 ? (
                <p className="py-8 text-center text-sm text-white/35">No hay semanas que coincidan con la búsqueda.</p>
              ) : view === "semanal" ? (
                <WeekCardGrid weeks={visibleWeeks} />
              ) : (
                <ul className="divide-y divide-white/[0.06]">
                  {visibleWeeks.map((w) => (
                    <li key={w.id}>
                      <Link href={w.href} className="flex items-center gap-3 py-2.5 transition-colors hover:bg-white/[0.02]">
                        <span className="w-16 flex-shrink-0 text-xs font-semibold text-white/55">Semana {w.week}</span>
                        <span className="min-w-0 flex-1 truncate text-sm text-white/85">{w.title}</span>
                        <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${w.statusClass}`}>{w.status}</span>
                        <span className="w-14 flex-shrink-0 text-right text-xs tabular-nums text-white/45">
                          {w.assetsDone}/{w.assetsTotal}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <Link
              href="/contenido/calendario-maestro"
              className="mt-4 flex items-center justify-center gap-1 text-xs font-medium text-[var(--allpa-gold-300)] hover:underline"
            >
              Ver todo el calendario anual
              <ArrowRight className="h-3 w-3" />
            </Link>
          </BlockFrame>

          <BlockFrame
            title="Pilares de Contenido (Temas Estratégicos)"
            icon="Target"
            actions={
              <Link
                href="/contenido/temas-estrategicos"
                className="hidden items-center gap-1 text-xs font-medium text-[var(--allpa-gold-300)] hover:underline sm:flex"
              >
                Ver todos los temas
                <ArrowRight className="h-3 w-3" />
              </Link>
            }
          >
            <PillarCardGrid pillars={pillarCards} />
            <p className="mt-4 flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2.5 text-xs text-white/45">
              Nuestro enfoque: educar hoy, proteger ahora y construir un legado que dure generaciones.
            </p>
          </BlockFrame>
        </>
      )}

      <AddBlockDialog open={createOpen} onOpenChange={setCreateOpen} onCreate={addBlock} />
    </PageShell>
  );
}
