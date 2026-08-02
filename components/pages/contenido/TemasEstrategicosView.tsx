"use client";

import { useMemo, useState } from "react";
import { ArrowRight, List, Plus, TrendingUp } from "lucide-react";
import { PageShell } from "@/components/page-blocks/PageShell";
import { BlockFrame } from "@/components/page-blocks/BlockFrame";
import { AddBlockButton, AddBlockDialog } from "@/components/page-blocks/AddBlockDialog";
import { BlockRenderer } from "@/components/page-blocks/BlockRenderer";
import { KpiStrip } from "@/components/page-blocks/blocks/KpiStrip";
import { DonutChart } from "@/components/page-blocks/blocks/DonutChart";
import { FilterToolbar } from "@/components/page-blocks/blocks/FilterToolbar";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { resolveLucideIcon } from "@/lib/lucide-icon";
import { useBlocksState } from "@/lib/use-blocks";
import { EPISODES, PILLARS } from "@/components/pages/contenido/mock-data";

const PILLAR_DETAIL: Record<string, { icon: string; description: string; weeksPlanned: number; growth?: string }> = {
  proteccion: { icon: "ShieldCheck", description: "Educamos sobre seguros que protegen lo que más importa: tu familia, tu salud, tu patrimonio y tu negocio.", weeksPlanned: 17, growth: "12% este trimestre" },
  crecimiento: { icon: "TrendingUp", description: "Impulsamos tu crecimiento financiero y el de tu negocio con estrategias, herramientas y mentalidad.", weeksPlanned: 13, growth: "8% este trimestre" },
  "proteccion-legal": { icon: "Scale", description: "Brindamos información clara sobre tus derechos y tu protección legal personal y empresarial.", weeksPlanned: 13 },
  negocios: { icon: "Briefcase", description: "Apoyamos a familias empresarias a construir negocios sólidos, exitosos y que trasciendan generaciones.", weeksPlanned: 7, growth: "5% este trimestre" },
  legado: { icon: "Users", description: "Te ayudamos a construir tu legado y asegurar el bienestar de las próximas generaciones.", weeksPlanned: 7, growth: "3% este trimestre" },
  bienestar: { icon: "HeartPulse", description: "Promovemos tu bienestar físico, emocional y financiero para una vida plena y equilibrada.", weeksPlanned: 5 },
};

export function TemasEstrategicosView() {
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const { blocks, addBlock, updateBlock, removeBlock } = useBlocksState([]);

  const stats = useMemo(
    () =>
      PILLARS.map((p, i) => {
        const detail = PILLAR_DETAIL[p.id];
        const episodes = EPISODES.filter((e) => e.pillarId === p.id);
        const inProduction = episodes.filter((e) => e.status === "En producción").length;
        const weeksDone = episodes.length;
        const progress = detail.weeksPlanned > 0 ? Math.round((weeksDone / detail.weeksPlanned) * 100) : 0;
        return { pillar: p, detail, index: i + 1, episodes: episodes.length, inProduction, weeksDone, progress };
      }),
    []
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return stats;
    return stats.filter((s) => `${s.pillar.name} ${s.detail.description}`.toLowerCase().includes(q));
  }, [stats, search]);

  const growing = stats.filter((s) => s.detail.growth);

  const sidePanel = (
    <>
      <BlockFrame title="Distribución por pilar" icon="PieChart">
        <DonutChart
          slices={PILLARS.map((p) => ({
            id: p.id,
            label: p.name,
            value: EPISODES.filter((e) => e.pillarId === p.id).length,
            color: p.color,
          })).filter((s) => s.value > 0)}
          centerValue={String(EPISODES.length)}
          centerLabel="Semanas totales"
        />
      </BlockFrame>

      <BlockFrame title="Pilares en crecimiento" icon="TrendingUp">
        <ul className="space-y-3">
          {growing.map((s) => {
            const Icon = resolveLucideIcon(s.detail.icon);
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
                    {s.detail.growth}
                  </span>
                </span>
              </li>
            );
          })}
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
      title="Temas Estratégicos"
      description={`Explora los ${PILLARS.length} pilares estratégicos que guían nuestro plan de contenido.`}
      icon="Target"
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
            Nuevo Pilar
          </Button>
        </>
      }
    >
      <KpiStrip
        items={[
          { id: "pillars", label: "Pilares estratégicos", value: String(PILLARS.length), icon: "Landmark", tone: "violet" },
          { id: "weeks", label: "Semanas cubiertas", value: String(EPISODES.length), sub: "del plan anual", icon: "CalendarDays", tone: "blue" },
          { id: "aligned", label: "Contenido alineado", value: "98%", sub: "con la estrategia", icon: "Target", tone: "emerald" },
          { id: "growing", label: "Pilares en crecimiento", value: String(growing.length), sub: "activos", icon: "TrendingUp", tone: "amber" },
        ]}
      />

      <BlockFrame title="Pilares estratégicos" icon="Target" padded={false}>
        <div className="px-4 pt-3">
          <FilterToolbar search={search} onSearchChange={setSearch} searchPlaceholder="Buscar pilar estratégico..." />
        </div>

        <div className="mt-3 divide-y divide-white/[0.06]">
          {filtered.map((s) => {
            const Icon = resolveLucideIcon(s.detail.icon);
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
                    <span className="mt-0.5 block text-sm leading-snug text-white/50">{s.detail.description}</span>
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
                      Semanas <span className="text-white/70">{s.weeksDone} / {s.detail.weeksPlanned}</span>
                    </span>
                    <span>
                      Episodios <span className="text-white/70">{s.episodes}</span>
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

      <AddBlockDialog open={createOpen} onOpenChange={setCreateOpen} onCreate={addBlock} />
    </PageShell>
  );
}
