"use client";

import { useState } from "react";
import { ArrowLeft, Check, Plus } from "lucide-react";
import { PageShell, PageTabs } from "@/components/page-blocks/PageShell";
import { BlockFrame } from "@/components/page-blocks/BlockFrame";
import { AddBlockButton, AddBlockDialog } from "@/components/page-blocks/AddBlockDialog";
import { BlockRenderer } from "@/components/page-blocks/BlockRenderer";
import { MetaBar } from "@/components/page-blocks/MetaBar";
import { KpiStrip } from "@/components/page-blocks/blocks/KpiStrip";
import { DonutChart } from "@/components/page-blocks/blocks/DonutChart";
import { InfoCard } from "@/components/page-blocks/blocks/InfoCard";
import { FileList } from "@/components/page-blocks/blocks/FileList";
import { ChecklistPanel } from "@/components/page-blocks/blocks/ChecklistPanel";
import { NotesPanel } from "@/components/page-blocks/blocks/NotesPanel";
import { FlowStrip } from "@/components/page-blocks/blocks/FlowStrip";
import { AssetProgressGrid } from "@/components/page-blocks/blocks/AssetProgressGrid";
import { PersonCard } from "@/components/page-blocks/blocks/PersonCard";
import { Timeline } from "@/components/page-blocks/blocks/Timeline";
import { MediaPreview } from "@/components/page-blocks/blocks/MediaPreview";
import { RichTextEditor } from "@/components/page-blocks/RichTextEditor";
import { BarChart, FunnelChart } from "@/components/page-blocks/blocks/Charts";
import { Button } from "@/components/ui/button";
import { useBlocksState } from "@/lib/use-blocks";
import * as D from "@/components/pages/contenido/centro-data";

const TABS = [
  { value: "resumen", label: "Resumen", icon: "LayoutDashboard" },
  { value: "podcast", label: "Podcast (Episodio Madre)", icon: "Mic" },
  { value: "distribucion", label: "Distribución y Activos", icon: "Share2" },
  { value: "notas", label: "Notas y Documentos", icon: "FileText" },
  { value: "academia", label: "Academia", icon: "GraduationCap" },
  { value: "metricas", label: "Métricas", icon: "BarChart3" },
];

export function CentroContenidoView() {
  const [tab, setTab] = useState("resumen");
  const [createOpen, setCreateOpen] = useState(false);
  const { blocks, addBlock, updateBlock, removeBlock } = useBlocksState([]);

  const extraBlocks = (
    <>
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

  const sidePanel = (
    <>
      <BlockFrame title="Ecosistema de Contenido" icon="PieChart">
        <p className="mb-3 text-xs text-white/40">Progreso de activos derivados de este episodio</p>
        <DonutChart slices={D.ECOSYSTEM_SLICES} centerValue="78%" centerLabel="Completado" showPercent={false} />
      </BlockFrame>

      <BlockFrame title="Notas rápidas" icon="StickyNote">
        <NotesPanel notes={D.QUICK_NOTES} />
      </BlockFrame>

      <BlockFrame title="Recursos y Documentos" icon="FileText">
        <FileList files={D.RESOURCES} />
      </BlockFrame>

      <BlockFrame title="Métricas Proyectadas" icon="TrendingUp">
        <InfoCard rows={D.PROJECTED_METRICS} />
        <p className="mt-3 text-[11px] text-white/30">Las métricas reales se actualizarán después de la publicación.</p>
      </BlockFrame>

      {extraBlocks}
    </>
  );

  return (
    <PageShell
      title={D.WEEK.title}
      description={D.WEEK.description}
      status="en_progreso"
      sidePanel={tab === "resumen" ? sidePanel : undefined}
      headerActions={
        <>
          <Button variant="outline" size="sm" className="border-white/12 bg-white/[0.03] text-white/70 hover:bg-white/[0.06]">
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            Volver al Calendario
          </Button>
          <Button className="border-0 bg-gradient-to-b from-[#f5da93] to-[#c98f1f] font-semibold text-[#241a05] hover:brightness-105">
            <Plus className="mr-1.5 h-4 w-4" />
            Nuevo Activo Derivado
          </Button>
        </>
      }
    >
      <p className="-mt-2 mb-3 text-sm font-medium text-[var(--allpa-gold-300)]">
        Semana {D.WEEK.number} · {D.WEEK.episode} · {D.WEEK.dates}
      </p>

      <MetaBar
        initialFields={[
          { id: "progreso_total", value: 78 },
          { id: "responsable", value: "Diana Bermeo" },
          { id: "fecha_objetivo", value: "2027-03-22" },
          { id: "categoria", value: "Educación" },
          { id: "prioridad", value: "alta" },
        ]}
      />

      <PageTabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === "resumen" && (
        <>
          <BlockFrame title="Invitada" icon="UserRound">
            <PersonCard person={D.GUEST} />
          </BlockFrame>

          <BlockFrame title="Resumen del Episodio" icon="FileText">
            <p className="text-sm leading-relaxed text-white/60">{D.WEEK.description}</p>
            <p className="mb-2 mt-4 text-[11px] font-semibold uppercase tracking-wide text-white/35">Puntos clave</p>
            <ul className="space-y-1.5">
              {D.KEY_POINTS.map((p) => (
                <li key={p} className="flex items-start gap-2 text-sm text-white/70">
                  <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-emerald-400" />
                  {p}
                </li>
              ))}
            </ul>
          </BlockFrame>

          <BlockFrame title="Información General" icon="ClipboardList">
            <InfoCard rows={D.GENERAL_INFO} />
          </BlockFrame>

          <BlockFrame title="Distribución y Activos Generados" icon="Workflow">
            <FlowStrip steps={D.DISTRIBUTION_FLOW} progressValue={78} progressLabel="78% completado (7/9 fases)" />
          </BlockFrame>

          <BlockFrame title="Próximos Pasos" icon="ListChecks">
            <ChecklistPanel lines={D.NEXT_STEPS} />
          </BlockFrame>

          <BlockFrame title="Línea de Tiempo del Episodio" icon="GitCommitHorizontal">
            <Timeline steps={D.TIMELINE} />
          </BlockFrame>
        </>
      )}

      {tab === "podcast" && (
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1fr_340px]">
          <div className="min-w-0 space-y-3">
            <BlockFrame title="Información del Episodio" icon="Mic">
              <p className="mb-1 text-[11px] uppercase tracking-wide text-white/35">Título del episodio</p>
              <p className="mb-4 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white/85">{D.WEEK.title}</p>
              <p className="mb-1 text-[11px] uppercase tracking-wide text-white/35">Descripción</p>
              <p className="mb-4 text-sm leading-relaxed text-white/60">{D.WEEK.description}</p>
              <p className="mb-2 text-[11px] uppercase tracking-wide text-white/35">Palabras clave SEO</p>
              <div className="flex flex-wrap gap-1.5">
                {D.SEO_KEYWORDS.map((k) => (
                  <span key={k} className="rounded-full bg-white/8 px-2.5 py-1 text-xs text-white/60">
                    {k}
                  </span>
                ))}
              </div>
            </BlockFrame>

            <BlockFrame title="Grabación del Episodio" icon="AudioLines">
              <MediaPreview
                media={{
                  kind: "audio",
                  title: `Episodio 12 – ${D.WEEK.title}`,
                  duration: "48:32",
                  meta: "Grabado el 15 mar 2027 · Estudio Principal",
                  actions: true,
                }}
              />
            </BlockFrame>

            <BlockFrame title="Notas del Episodio" icon="NotebookPen">
              <ul className="space-y-1.5">
                {D.EPISODE_NOTES.map((n) => (
                  <li key={n} className="flex items-start gap-2 text-sm text-white/65">
                    <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-[var(--allpa-gold-400)]" />
                    {n}
                  </li>
                ))}
              </ul>
            </BlockFrame>

            {extraBlocks}
          </div>

          <div className="space-y-3">
            <BlockFrame title="Invitada" icon="UserRound">
              <PersonCard person={D.GUEST} />
            </BlockFrame>
            <BlockFrame title="Detalles de Producción" icon="ClipboardList">
              <InfoCard rows={D.PRODUCTION_INFO} />
            </BlockFrame>
            <BlockFrame title="Checklist de Producción" icon="ListChecks">
              <ChecklistPanel lines={D.PRODUCTION_CHECKLIST} />
            </BlockFrame>
            <BlockFrame title="Recursos del Episodio" icon="FileText">
              <FileList files={D.EPISODE_RESOURCES} />
            </BlockFrame>
          </div>
        </div>
      )}

      {tab === "distribucion" && (
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1fr_340px]">
          <div className="min-w-0 space-y-3">
            <BlockFrame title="Flujo de Distribución" icon="Workflow">
              <FlowStrip steps={D.DISTRIBUTION_FLOW} progressValue={78} progressLabel="78% completado (7/9 fases)" />
            </BlockFrame>

            <BlockFrame title="Activos Generados" icon="Boxes">
              <AssetProgressGrid assets={D.ASSETS} />
              <button
                type="button"
                className="mt-3 flex w-full flex-col items-center gap-0.5 rounded-xl border border-dashed border-white/12 py-3 transition-colors hover:border-[var(--allpa-gold-400)]/50"
              >
                <span className="flex items-center gap-1.5 text-sm text-[var(--allpa-gold-300)]">
                  <Plus className="h-4 w-4" />
                  Crear nuevo activo derivado
                </span>
                <span className="text-xs text-white/35">Genera un nuevo activo a partir de este episodio madre.</span>
              </button>
            </BlockFrame>

            {extraBlocks}
          </div>

          <div className="space-y-3">
            <BlockFrame title="KPIs de este Episodio" icon="TrendingUp">
              <InfoCard
                rows={[
                  { label: "Activos generados", value: "7 / 10" },
                  { label: "Alcance estimado", value: "125.000 – 185.000" },
                  { label: "Interacciones estimadas", value: "8.500 – 12.000" },
                  { label: "Descargas potenciales", value: "2.000 – 3.000" },
                ]}
              />
            </BlockFrame>
            <BlockFrame title="Calendario de Publicación" icon="CalendarDays">
              <Timeline
                steps={[
                  { id: "c1", label: "Podcast (Madre)", status: "Publicado", tone: "emerald", date: "16 mar 2027", done: true },
                  { id: "c2", label: "YouTube (Largo)", status: "Publicado", tone: "emerald", date: "17 mar 2027", done: true },
                  { id: "c3", label: "Clips & Shorts", status: "En progreso", tone: "amber", date: "18 – 24 mar" },
                  { id: "c4", label: "Reels Instagram", status: "En progreso", tone: "amber", date: "18 – 25 mar" },
                  { id: "c5", label: "Carrusel", status: "Publicado", tone: "emerald", date: "20 mar 2027", done: true },
                ]}
              />
            </BlockFrame>
            <BlockFrame title="Notas rápidas" icon="StickyNote">
              <NotesPanel notes={D.QUICK_NOTES} />
            </BlockFrame>
          </div>
        </div>
      )}

      {tab === "notas" && (
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1fr_340px]">
          <div className="min-w-0 space-y-3">
            <BlockFrame title="Notas del Episodio" icon="NotebookPen">
              <RichTextEditor
                content={`<h3>Resumen de la conversación</h3><p>Discutimos por qué los Trusts no son solo para personas ricas, cómo funcionan, qué tipos existen y cómo pueden proteger a la familia, evitar el probate y asegurar que los menores y activos estén bien protegidos.</p><h3>Puntos destacados</h3><ul><li>Los Trusts son más accesibles de lo que la mayoría cree.</li><li>Diferencia entre Testamento vs. Trust.</li><li>Beneficios de evitar probate en Florida.</li><li>Protección de activos y privacidad.</li><li>Casos reales y ejemplos prácticos para familias latinas.</li></ul>`}
              />
            </BlockFrame>

            <BlockFrame title="Etiquetas" icon="Tags">
              <div className="flex flex-wrap gap-1.5">
                {["Trusts", "Estate Planning", "Protección Legal", "Familia Hispana", "Probate", "Florida"].map((t) => (
                  <span key={t} className="rounded-full bg-white/8 px-2.5 py-1 text-xs text-white/65">
                    {t}
                  </span>
                ))}
                <button
                  type="button"
                  className="flex items-center gap-1 rounded-full border border-dashed border-white/15 px-2.5 py-1 text-xs text-white/40 transition-colors hover:border-[var(--allpa-gold-400)]/50 hover:text-[var(--allpa-gold-300)]"
                >
                  <Plus className="h-3 w-3" />
                  Agregar etiqueta
                </button>
              </div>
            </BlockFrame>

            <BlockFrame title="Documentos del Episodio" icon="FolderOpen">
              <FileList files={D.DOCUMENTS} downloadable />
            </BlockFrame>

            {extraBlocks}
          </div>

          <div className="space-y-3">
            <BlockFrame title="Notas rápidas" icon="StickyNote">
              <NotesPanel notes={D.QUICK_NOTES} />
            </BlockFrame>
            <BlockFrame title="Checklist de Documentos" icon="ListChecks">
              <ChecklistPanel lines={D.DOCUMENTS_CHECKLIST} />
            </BlockFrame>
          </div>
        </div>
      )}

      {tab === "academia" && (
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1fr_340px]">
          <div className="min-w-0 space-y-3">
            <BlockFrame title="Información de la Clase" icon="GraduationCap">
              <p className="text-[11px] uppercase tracking-wide text-white/35">Clase en la Academia</p>
              <p className="mt-1 font-semibold text-[#f3ecd9]">Los Trusts: protección y tranquilidad para tu familia</p>
              <div className="mt-4">
                <InfoCard
                  rows={[
                    { label: "Nivel", value: "Intermedio" },
                    { label: "Categoría", value: "Protección Legal › Trusts" },
                    { label: "Estado de la clase", value: "En Producción", tone: "amber" },
                    { label: "Publicación estimada", value: "25 mar 2027" },
                    { label: "Duración total", value: "35 – 45 min" },
                    { label: "Lecciones", value: "6" },
                  ]}
                />
              </div>
            </BlockFrame>

            <BlockFrame title="Estructura de la Clase" icon="ListTree">
              <p className="mb-3 text-xs text-white/40">Organiza los módulos y lecciones que compondrán esta clase.</p>
              <ClassStructure />
            </BlockFrame>

            {extraBlocks}
          </div>

          <div className="space-y-3">
            <BlockFrame title="Vista previa de la clase" icon="PlayCircle">
              <MediaPreview
                media={{
                  kind: "video",
                  title: "Los Trusts: protección y tranquilidad para tu familia",
                  subtitle: "con Sonia Muñoz Gallagher",
                }}
              />
            </BlockFrame>
            <BlockFrame title="Estado de producción" icon="Activity">
              <ChecklistPanel lines={D.CLASS_PRODUCTION} />
            </BlockFrame>
            <BlockFrame title="Recursos de la clase" icon="FileText">
              <FileList files={D.CLASS_RESOURCES} downloadable />
            </BlockFrame>
            <BlockFrame title="Métricas proyectadas" icon="TrendingUp">
              <InfoCard
                rows={[
                  { label: "Estudiantes potenciales", value: "1.200 – 1.800" },
                  { label: "Tasa de finalización", value: "65% – 75%" },
                  { label: "Valoración esperada", value: "4.7 / 5" },
                ]}
              />
            </BlockFrame>
          </div>
        </div>
      )}

      {tab === "metricas" && (
        <>
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-white/35">
            Resumen de rendimiento del episodio
          </p>
          <KpiStrip items={D.EPISODE_KPIS} />

          <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
            <BlockFrame title="Rendimiento por plataforma" icon="BarChart3">
              <BarChart
                data={D.PLATFORM_PERFORMANCE}
                categoryKey="platform"
                series={[
                  { key: "alcance", label: "Alcance", color: "#a78bfa" },
                  { key: "interacciones", label: "Interacciones", color: "#22c55e" },
                  { key: "reproducciones", label: "Reproducciones", color: "#3b82f6" },
                ]}
              />
            </BlockFrame>

            <BlockFrame title="Embudo de conversión del episodio" icon="Filter">
              <FunnelChart steps={D.CONVERSION_FUNNEL} />
            </BlockFrame>
          </div>

          <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
            <BlockFrame title="Rendimiento de activos derivados" icon="PieChart">
              <DonutChart
                slices={[
                  { id: "comp", label: "Completados", value: 31, color: "#22c55e" },
                  { id: "prod", label: "En producción", value: 5, color: "#e0a836" },
                  { id: "prog", label: "Programados", value: 4, color: "#3b82f6" },
                  { id: "pend", label: "Pendientes", value: 2, color: "#94a3b8" },
                ]}
                centerValue="42"
                centerLabel="Activos totales"
              />
            </BlockFrame>

            <BlockFrame title="Top contenidos por rendimiento" icon="Trophy">
              <ul className="space-y-2.5">
                {D.TOP_CONTENT.map((c, i) => (
                  <li key={c.id} className="flex items-center gap-2.5 text-sm">
                    <span className="w-4 flex-shrink-0 text-xs text-white/35">{i + 1}.</span>
                    <span className="min-w-0 flex-1 truncate text-white/75">{c.name}</span>
                    <span className="w-16 flex-shrink-0 text-right tabular-nums text-white/60">{c.reach}</span>
                    <span className="w-14 flex-shrink-0 text-right tabular-nums text-white/40">{c.inter}</span>
                  </li>
                ))}
              </ul>
            </BlockFrame>
          </div>

          {extraBlocks}
        </>
      )}

      <AddBlockDialog open={createOpen} onOpenChange={setCreateOpen} onCreate={addBlock} />
    </PageShell>
  );
}

/** Árbol de módulos y lecciones de la clase de Academia. */
function ClassStructure() {
  const [open, setOpen] = useState<string[]>([D.CLASS_MODULES[0].id]);

  const toggle = (id: string) => {
    setOpen((list) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]));
  };

  const TONES = {
    emerald: "bg-emerald-400/12 text-emerald-300",
    amber: "bg-amber-400/12 text-amber-300",
    violet: "bg-violet-400/12 text-violet-300",
    neutral: "bg-white/8 text-white/50",
  } as const;

  return (
    <div className="space-y-2">
      {D.CLASS_MODULES.map((mod) => {
        const isOpen = open.includes(mod.id);
        return (
          <div key={mod.id} className="rounded-xl border border-white/10 bg-white/[0.02]">
            <button
              type="button"
              onClick={() => toggle(mod.id)}
              className="flex w-full flex-wrap items-center gap-2.5 px-3 py-2.5 text-left"
            >
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--allpa-gold-400)]/12 text-xs font-semibold text-[var(--allpa-gold-300)]">
                {mod.index}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-white/85">{mod.title}</span>
              <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${TONES[mod.tone]}`}>{mod.status}</span>
              <span className="hidden flex-shrink-0 text-xs text-white/35 sm:inline">{mod.duration}</span>
              <span className="hidden flex-shrink-0 text-xs text-white/35 sm:inline">{mod.kind}</span>
            </button>

            {isOpen && (
              <ul className="border-t border-white/[0.06] px-3 py-2">
                {mod.lessons.map((lesson) => (
                  <li key={lesson.id} className="flex items-center gap-2.5 py-1.5 text-sm">
                    <span className="w-8 flex-shrink-0 text-xs text-white/35">{lesson.index}</span>
                    <span className="min-w-0 flex-1 truncate text-white/70">{lesson.title}</span>
                    <span className="flex-shrink-0 text-xs tabular-nums text-white/40">{lesson.duration}</span>
                    <span
                      className={`h-3.5 w-3.5 flex-shrink-0 rounded-full border-2 ${
                        lesson.done ? "border-emerald-400 bg-emerald-400/30" : "border-white/20"
                      }`}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}

      <button
        type="button"
        className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-white/12 py-2.5 text-sm text-white/40 transition-colors hover:border-[var(--allpa-gold-400)]/50 hover:text-[var(--allpa-gold-300)]"
      >
        <Plus className="h-4 w-4" />
        Agregar módulo
      </button>
    </div>
  );
}
