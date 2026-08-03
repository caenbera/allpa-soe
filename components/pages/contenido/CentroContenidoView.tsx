"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, Check, Plus } from "lucide-react";
import { PageShell, PageTabs } from "@/components/page-blocks/PageShell";
import { BlockFrame } from "@/components/page-blocks/BlockFrame";
import { AddBlockButton, AddBlockDialog } from "@/components/page-blocks/AddBlockDialog";
import { BlockRenderer } from "@/components/page-blocks/BlockRenderer";
import { EmptyState, LoadingState } from "@/components/page-blocks/EmptyState";
import { MetaBar } from "@/components/page-blocks/MetaBar";
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
import { Button } from "@/components/ui/button";
import { useContent } from "@/lib/use-content";
import { usePageConfig } from "@/lib/use-page-config";
import { CONTENT_COLLECTIONS, type Episode, type Pillar } from "@/lib/content-types";

const TABS = [
  { value: "resumen", label: "Resumen", icon: "LayoutDashboard" },
  { value: "podcast", label: "Podcast (Episodio Madre)", icon: "Mic" },
  { value: "distribucion", label: "Distribución y Activos", icon: "Share2" },
  { value: "notas", label: "Notas y Documentos", icon: "FileText" },
  { value: "academia", label: "Academia", icon: "GraduationCap" },
  { value: "metricas", label: "Métricas", icon: "BarChart3" },
];

/** Aviso reutilizable cuando una sección del episodio aún no tiene contenido. */
function NotYet({ what }: { what: string }) {
  return <p className="py-6 text-center text-sm text-white/35">Todavía no hay {what} para este episodio.</p>;
}

export function CentroContenidoView() {
  const [tab, setTab] = useState("resumen");
  const [createOpen, setCreateOpen] = useState(false);

  const episodes = useContent<Episode>(CONTENT_COLLECTIONS.episodes);
  const pillars = useContent<Pillar>(CONTENT_COLLECTIONS.pillars);
  const { metaFields, updateMetaFields, blocks, addBlock, updateBlock, removeBlock } = usePageConfig(
    "/contenido/centro-de-contenido",
    [
      { id: "progreso_total", value: 0 },
      { id: "responsable", value: "Sin asignar" },
      { id: "fecha_objetivo", value: new Date().toISOString().slice(0, 10) },
      { id: "prioridad", value: "media" },
    ]
  );

  /** Se muestra el episodio con detalle; si ninguno lo tiene, el primero en producción. */
  const episode = useMemo(() => {
    const withDetail = episodes.items.find((e) => e.detail);
    if (withDetail) return withDetail;
    return episodes.items.find((e) => e.status === "En producción") ?? episodes.items[0] ?? null;
  }, [episodes.items]);

  const detail = episode?.detail ?? null;
  const pillar = pillars.items.find((p) => p.id === episode?.pillarId);

  const loading = episodes.loading || pillars.loading;

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

  if (loading) {
    return (
      <PageShell title="Centro de Contenido" icon="LayoutDashboard" starrable={false}>
        <div className="surface-card">
          <LoadingState />
        </div>
      </PageShell>
    );
  }

  if (!episode) {
    return (
      <PageShell
        title="Centro de Contenido"
        description="El detalle completo de cada semana: episodio madre, activos derivados, notas, clase y métricas."
        icon="LayoutDashboard"
        starrable={false}
      >
        <div className="surface-card">
          <EmptyState
            icon="LayoutDashboard"
            title="Todavía no hay semanas que mostrar"
            description="El Centro de Contenido reúne todo el trabajo de una semana en un solo lugar. Crea tu primer episodio madre desde el Calendario Maestro para empezar."
          />
        </div>
        <AddBlockDialog open={createOpen} onOpenChange={setCreateOpen} onCreate={addBlock} />
      </PageShell>
    );
  }

  const sidePanel = (
    <>
      <BlockFrame title="Ecosistema de Contenido" icon="PieChart">
        <p className="mb-3 text-xs text-white/40">Progreso de activos derivados de este episodio</p>
        <DonutChart
          slices={[
            { id: "done", label: "Completado", value: episode.assetsDone, color: "#22c55e" },
            { id: "left", label: "Pendiente", value: Math.max(0, episode.assetsTotal - episode.assetsDone), color: "#94a3b8" },
          ].filter((s) => s.value > 0)}
          centerValue={`${episode.progress}%`}
          centerLabel="Completado"
          showPercent={false}
        />
      </BlockFrame>

      <BlockFrame title="Notas rápidas" icon="StickyNote">
        <NotesPanel notes={detail?.quickNotes ?? []} />
      </BlockFrame>

      <BlockFrame title="Recursos y Documentos" icon="FileText">
        {detail?.resources?.length ? <FileList files={detail.resources} /> : <NotYet what="recursos" />}
      </BlockFrame>

      {extraBlocks}
    </>
  );

  return (
    <PageShell
      title={episode.title}
      description={detail?.description ?? episode.subtitle}
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
        Semana {episode.week}
        {detail?.episodeLabel ? ` · ${detail.episodeLabel}` : ""}
        {detail?.dates ? ` · ${detail.dates}` : ""}
        {pillar ? ` · ${pillar.name}` : ""}
      </p>

      <MetaBar fields={metaFields} onFieldsChange={updateMetaFields} />

      <PageTabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === "resumen" && (
        <>
          <BlockFrame title="Invitado" icon="UserRound">
            {detail?.guest ? (
              <PersonCard person={detail.guest} />
            ) : (
              <PersonCard person={{ name: episode.guest, role: episode.guestRole }} />
            )}
          </BlockFrame>

          <BlockFrame title="Resumen del Episodio" icon="FileText">
            <p className="text-sm leading-relaxed text-white/60">{detail?.description ?? episode.subtitle}</p>
            {detail?.keyPoints?.length ? (
              <>
                <p className="mb-2 mt-4 text-[11px] font-semibold uppercase tracking-wide text-white/35">Puntos clave</p>
                <ul className="space-y-1.5">
                  {detail.keyPoints.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-sm text-white/70">
                      <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-emerald-400" />
                      {p}
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </BlockFrame>

          <BlockFrame title="Información General" icon="ClipboardList">
            {detail?.generalInfo?.length ? (
              <InfoCard rows={detail.generalInfo} />
            ) : (
              <InfoCard
                rows={[
                  { label: "Estado", value: episode.status },
                  { label: "Semana", value: String(episode.week) },
                  { label: "Invitado", value: episode.guest, person: true },
                  { label: "Publicación", value: episode.publishDate },
                ]}
              />
            )}
          </BlockFrame>

          <BlockFrame title="Distribución y Activos Generados" icon="Workflow">
            {detail?.distributionFlow?.length ? (
              <FlowStrip
                steps={detail.distributionFlow}
                progressValue={episode.progress}
                progressLabel={`${episode.progress}% completado (${episode.assetsDone}/${episode.assetsTotal} activos)`}
              />
            ) : (
              <NotYet what="activos derivados" />
            )}
          </BlockFrame>

          <BlockFrame title="Próximos Pasos" icon="ListChecks">
            {detail?.nextSteps?.length ? <ChecklistPanel lines={detail.nextSteps} /> : <NotYet what="tareas pendientes" />}
          </BlockFrame>

          <BlockFrame title="Línea de Tiempo del Episodio" icon="GitCommitHorizontal">
            {detail?.timeline?.length ? <Timeline steps={detail.timeline} /> : <NotYet what="hitos" />}
          </BlockFrame>
        </>
      )}

      {tab === "podcast" && (
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1fr_340px]">
          <div className="min-w-0 space-y-3">
            <BlockFrame title="Información del Episodio" icon="Mic">
              <p className="mb-1 text-[11px] uppercase tracking-wide text-white/35">Título del episodio</p>
              <p className="mb-4 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white/85">{episode.title}</p>
              <p className="mb-1 text-[11px] uppercase tracking-wide text-white/35">Descripción</p>
              <p className="mb-4 text-sm leading-relaxed text-white/60">{detail?.description ?? episode.subtitle}</p>
              {detail?.seoKeywords?.length ? (
                <>
                  <p className="mb-2 text-[11px] uppercase tracking-wide text-white/35">Palabras clave SEO</p>
                  <div className="flex flex-wrap gap-1.5">
                    {detail.seoKeywords.map((k) => (
                      <span key={k} className="rounded-full bg-white/8 px-2.5 py-1 text-xs text-white/60">
                        {k}
                      </span>
                    ))}
                  </div>
                </>
              ) : null}
            </BlockFrame>

            <BlockFrame title="Grabación del Episodio" icon="AudioLines">
              <MediaPreview
                media={{
                  kind: "audio",
                  title: `Episodio ${episode.week} – ${episode.title}`,
                  duration: "48:32",
                  meta: detail ? "Grabado el 15 mar 2027 · Estudio Principal" : "Aún no hay grabación cargada.",
                  actions: true,
                }}
              />
            </BlockFrame>

            <BlockFrame title="Notas del Episodio" icon="NotebookPen">
              {detail?.episodeNotes?.length ? (
                <ul className="space-y-1.5">
                  {detail.episodeNotes.map((n) => (
                    <li key={n} className="flex items-start gap-2 text-sm text-white/65">
                      <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-[var(--allpa-gold-400)]" />
                      {n}
                    </li>
                  ))}
                </ul>
              ) : (
                <NotYet what="notas" />
              )}
            </BlockFrame>

            {extraBlocks}
          </div>

          <div className="space-y-3">
            <BlockFrame title="Invitado" icon="UserRound">
              <PersonCard person={detail?.guest ?? { name: episode.guest, role: episode.guestRole }} />
            </BlockFrame>
            <BlockFrame title="Detalles de Producción" icon="ClipboardList">
              {detail?.productionInfo?.length ? <InfoCard rows={detail.productionInfo} /> : <NotYet what="detalles de producción" />}
            </BlockFrame>
            <BlockFrame title="Checklist de Producción" icon="ListChecks">
              {detail?.productionChecklist?.length ? <ChecklistPanel lines={detail.productionChecklist} /> : <NotYet what="checklist" />}
            </BlockFrame>
            <BlockFrame title="Recursos del Episodio" icon="FileText">
              {detail?.episodeResources?.length ? <FileList files={detail.episodeResources} /> : <NotYet what="recursos" />}
            </BlockFrame>
          </div>
        </div>
      )}

      {tab === "distribucion" && (
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1fr_340px]">
          <div className="min-w-0 space-y-3">
            <BlockFrame title="Flujo de Distribución" icon="Workflow">
              {detail?.distributionFlow?.length ? (
                <FlowStrip
                  steps={detail.distributionFlow}
                  progressValue={episode.progress}
                  progressLabel={`${episode.progress}% completado (${episode.assetsDone}/${episode.assetsTotal} activos)`}
                />
              ) : (
                <NotYet what="flujo de distribución" />
              )}
            </BlockFrame>

            <BlockFrame title="Activos Generados" icon="Boxes">
              {detail?.assets?.length ? <AssetProgressGrid assets={detail.assets} /> : <NotYet what="activos generados" />}
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
                  { label: "Activos generados", value: `${episode.assetsDone} / ${episode.assetsTotal}` },
                  { label: "Progreso", value: `${episode.progress}%` },
                  { label: "Estado", value: episode.status },
                  { label: "Publicación", value: episode.publishDate },
                ]}
              />
            </BlockFrame>
            <BlockFrame title="Notas rápidas" icon="StickyNote">
              <NotesPanel notes={detail?.quickNotes ?? []} />
            </BlockFrame>
          </div>
        </div>
      )}

      {tab === "notas" && (
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1fr_340px]">
          <div className="min-w-0 space-y-3">
            <BlockFrame title="Notas del Episodio" icon="NotebookPen">
              <RichTextEditor content={detail?.conversationNotes ?? ""} />
            </BlockFrame>

            <BlockFrame title="Documentos del Episodio" icon="FolderOpen">
              {detail?.documents?.length ? <FileList files={detail.documents} downloadable /> : <NotYet what="documentos" />}
            </BlockFrame>

            {extraBlocks}
          </div>

          <div className="space-y-3">
            <BlockFrame title="Notas rápidas" icon="StickyNote">
              <NotesPanel notes={detail?.quickNotes ?? []} />
            </BlockFrame>
            <BlockFrame title="Checklist de Documentos" icon="ListChecks">
              {detail?.documentsChecklist?.length ? <ChecklistPanel lines={detail.documentsChecklist} /> : <NotYet what="checklist" />}
            </BlockFrame>
          </div>
        </div>
      )}

      {tab === "academia" && (
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1fr_340px]">
          <div className="min-w-0 space-y-3">
            <BlockFrame title="Clase en la Academia" icon="GraduationCap">
              <p className="text-sm leading-relaxed text-white/55">
                Convierte este episodio en una clase estructurada por módulos y lecciones. Gestiona el catálogo completo desde la
                página de Academia.
              </p>
            </BlockFrame>
            {extraBlocks}
          </div>

          <div className="space-y-3">
            <BlockFrame title="Vista previa de la clase" icon="PlayCircle">
              <MediaPreview media={{ kind: "video", title: episode.title, subtitle: detail?.guest?.name ?? episode.guest }} />
            </BlockFrame>
          </div>
        </div>
      )}

      {tab === "metricas" && (
        <BlockFrame title="Métricas del episodio" icon="TrendingUp">
          <p className="py-6 text-center text-sm text-white/35">
            Las métricas reales se activarán cuando conectemos las plataformas de publicación.
          </p>
        </BlockFrame>
      )}

      <AddBlockDialog open={createOpen} onOpenChange={setCreateOpen} onCreate={addBlock} />
    </PageShell>
  );
}
