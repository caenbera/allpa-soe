"use client";

import { useMemo, useState } from "react";
import { List, Upload } from "lucide-react";
import { PageShell, PageTabs } from "@/components/page-blocks/PageShell";
import { BlockFrame } from "@/components/page-blocks/BlockFrame";
import { AddBlockButton, AddBlockDialog } from "@/components/page-blocks/AddBlockDialog";
import { BlockRenderer } from "@/components/page-blocks/BlockRenderer";
import { EmptyState, LoadingState } from "@/components/page-blocks/EmptyState";
import { KpiStrip } from "@/components/page-blocks/blocks/KpiStrip";
import { FilterToolbar, type ViewMode } from "@/components/page-blocks/blocks/FilterToolbar";
import { DataTable, type RowData } from "@/components/page-blocks/blocks/DataTable";
import { Button } from "@/components/ui/button";
import { resolveLucideIcon } from "@/lib/lucide-icon";
import { useContent } from "@/lib/use-content";
import { usePageConfig } from "@/lib/use-page-config";
import { CONTENT_COLLECTIONS, type MediaAsset, type MediaKind, type Pillar } from "@/lib/content-types";

const TABS = [
  { value: "todos", label: "Todos los archivos" },
  { value: "Imagen", label: "Imágenes" },
  { value: "Video", label: "Vídeos" },
  { value: "Audio", label: "Audios" },
  { value: "Documento", label: "Documentos" },
  { value: "Plantilla", label: "Plantillas" },
];

const KIND_META: Record<MediaKind, { icon: string; tone: "violet" | "blue" | "amber" | "rose" | "emerald" }> = {
  Imagen: { icon: "FileImage", tone: "violet" },
  Video: { icon: "FileVideo", tone: "blue" },
  Audio: { icon: "FileAudio", tone: "amber" },
  Documento: { icon: "FileText", tone: "rose" },
  Plantilla: { icon: "Folder", tone: "emerald" },
};

export function BibliotecaMultimediaView() {
  const [tab, setTab] = useState("todos");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [view, setView] = useState<ViewMode>("list");
  const [createOpen, setCreateOpen] = useState(false);

  const media = useContent<MediaAsset>(CONTENT_COLLECTIONS.mediaAssets);
  const pillars = useContent<Pillar>(CONTENT_COLLECTIONS.pillars);
  const { blocks, addBlock, updateBlock, removeBlock } = usePageConfig("/contenido/biblioteca-multimedia");

  const pillarOf = (id: string | null) => pillars.items.find((p) => p.id === id);

  const counts = useMemo(() => {
    const by = (k: MediaKind) => media.items.filter((m) => m.kind === k).length;
    return {
      total: media.items.length,
      img: by("Imagen"),
      vid: by("Video"),
      aud: by("Audio"),
      doc: by("Documento"),
      tpl: by("Plantilla"),
    };
  }, [media.items]);

  const pct = (n: number) => (counts.total > 0 ? `${((n / counts.total) * 100).toFixed(1)}% del total` : "—");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return media.items.filter((m) => {
      if (tab !== "todos" && m.kind !== tab) return false;
      if (filters.pillar && filters.pillar !== "Todos" && pillarOf(m.pillarId)?.name !== filters.pillar) return false;
      if (!q) return true;
      return `${m.name} ${m.topic} ${m.episodeTitle ?? ""}`.toLowerCase().includes(q);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [media.items, pillars.items, tab, search, filters]);

  const rows: RowData[] = filtered.map((m) => {
    const pillar = pillarOf(m.pillarId);
    const meta = KIND_META[m.kind];
    return {
      id: m.id,
      cells: {
        file: { kind: "text", value: m.name, sub: m.topic, strong: true },
        kind: { kind: "badge", value: m.kind, tone: meta.tone },
        pillar: { kind: "badge", value: pillar?.name ?? "—", tone: pillar?.tone ?? "neutral" },
        episode: { kind: "text", value: m.episodeTitle ?? "—", sub: m.episodeWeek ? `Semana ${m.episodeWeek}` : undefined },
        uploaded: { kind: "text", value: m.uploadedAt },
        size: { kind: "number", value: m.size },
      },
    };
  });

  const loading = media.loading || pillars.loading;
  const isEmpty = !loading && counts.total === 0;

  const sidePanel = (
    <>
      {!isEmpty && (
        <BlockFrame title="Categorías" icon="Folder">
          <ul className="space-y-2.5">
            {(Object.keys(KIND_META) as MediaKind[]).map((kind) => {
              const Icon = resolveLucideIcon(KIND_META[kind].icon);
              const n = media.items.filter((m) => m.kind === kind).length;
              return (
                <li key={kind}>
                  <button
                    type="button"
                    onClick={() => setTab(kind)}
                    className="flex w-full items-center gap-2.5 rounded-lg px-1.5 py-1 text-left transition-colors hover:bg-white/5"
                  >
                    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--allpa-gold-400)]/12 text-[var(--allpa-gold-300)]">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-white/80">{kind}</span>
                      <span className="block text-xs text-white/35">{n} archivos</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </BlockFrame>
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
      title="Biblioteca Multimedia"
      description="Todos los activos y materiales utilizados en tu plan de contenido, organizados y listos para usar."
      icon="Library"
      starrable={false}
      sidePanel={sidePanel}
      headerActions={
        <>
          <Button variant="outline" size="sm" className="border-white/12 bg-white/[0.03] text-white/70 hover:bg-white/[0.06]">
            <List className="mr-1.5 h-3.5 w-3.5" />
            Vista Lista
          </Button>
          <Button className="border-0 bg-gradient-to-b from-[#f5da93] to-[#c98f1f] font-semibold text-[#241a05] hover:brightness-105">
            <Upload className="mr-1.5 h-4 w-4" />
            Subir Archivo
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
            icon="Library"
            title="Tu biblioteca está vacía"
            description="Aquí se reúnen las imágenes, vídeos, audios y documentos de tu plan de contenido, listos para reutilizar en cualquier canal."
            actionLabel="Subir Archivo"
            onAction={() => undefined}
          />
        </div>
      ) : (
        <>
          <KpiStrip
            items={[
              { id: "total", label: "Archivos totales", value: String(counts.total), sub: "en la biblioteca", icon: "Folder", tone: "violet" },
              { id: "img", label: "Imágenes", value: String(counts.img), sub: pct(counts.img), icon: "FileImage", tone: "emerald" },
              { id: "vid", label: "Vídeos", value: String(counts.vid), sub: pct(counts.vid), icon: "FileVideo", tone: "blue" },
              { id: "aud", label: "Audios", value: String(counts.aud), sub: pct(counts.aud), icon: "FileAudio", tone: "amber" },
              { id: "doc", label: "Documentos", value: String(counts.doc), sub: pct(counts.doc), icon: "FileText", tone: "rose" },
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
                  searchPlaceholder="Buscar por nombre, tema, tipo o etiqueta..."
                  filters={[{ id: "pillar", label: "Pilar", options: pillars.items.map((p) => p.name) }]}
                  values={filters}
                  onFilterChange={(id, value) => setFilters((f) => ({ ...f, [id]: value }))}
                  view={view}
                  onViewChange={setView}
                />
              </div>

              {view === "list" ? (
                <DataTable
                  columns={[
                    { id: "file", header: "Archivo", sortable: true },
                    { id: "kind", header: "Tipo", sortable: true, width: "120px" },
                    { id: "pillar", header: "Pilar", sortable: true, width: "160px" },
                    { id: "episode", header: "Episodio Madre", width: "220px" },
                    { id: "uploaded", header: "Fecha de subida", sortable: true, width: "140px" },
                    { id: "size", header: "Tamaño", sortable: true, width: "100px", align: "right" },
                  ]}
                  rows={rows}
                  onView={() => undefined}
                  onDeleteRow={(id) => media.remove(id)}
                />
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {filtered.map((m) => {
                    const Icon = resolveLucideIcon(KIND_META[m.kind].icon);
                    const pillar = pillarOf(m.pillarId);
                    return (
                      <div key={m.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                        <span className="mb-2.5 flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--allpa-gold-400)]/12 text-[var(--allpa-gold-300)]">
                          <Icon className="h-4 w-4" />
                        </span>
                        <p className="truncate text-sm font-medium text-white/85">{m.name}</p>
                        <p className="mt-0.5 truncate text-xs text-white/35">
                          {m.topic} · {m.size}
                        </p>
                        {pillar && (
                          <span className="mt-2 inline-block rounded-full bg-white/8 px-2 py-0.5 text-[10px] text-white/55">{pillar.name}</span>
                        )}
                      </div>
                    );
                  })}
                  {filtered.length === 0 && (
                    <p className="col-span-full py-10 text-center text-sm text-white/35">No hay archivos que coincidan con los filtros.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <AddBlockDialog open={createOpen} onOpenChange={setCreateOpen} onCreate={addBlock} />
    </PageShell>
  );
}
