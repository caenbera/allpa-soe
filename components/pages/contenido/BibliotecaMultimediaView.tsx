"use client";

import { useMemo, useState } from "react";
import { List, Upload } from "lucide-react";
import { PageShell, PageTabs } from "@/components/page-blocks/PageShell";
import { BlockFrame } from "@/components/page-blocks/BlockFrame";
import { AddBlockButton, AddBlockDialog } from "@/components/page-blocks/AddBlockDialog";
import { BlockRenderer } from "@/components/page-blocks/BlockRenderer";
import { KpiStrip } from "@/components/page-blocks/blocks/KpiStrip";
import { FilterToolbar, type ViewMode } from "@/components/page-blocks/blocks/FilterToolbar";
import { DataTable, type RowData } from "@/components/page-blocks/blocks/DataTable";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { resolveLucideIcon } from "@/lib/lucide-icon";
import { useBlocksState } from "@/lib/use-blocks";
import { MEDIA_ASSETS, PILLARS, pillarOf, type MediaKind } from "@/components/pages/contenido/mock-data";

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
  const { blocks, addBlock, updateBlock, removeBlock } = useBlocksState([]);

  const counts = useMemo(() => {
    const by = (k: MediaKind) => MEDIA_ASSETS.filter((m) => m.kind === k).length;
    return {
      total: MEDIA_ASSETS.length,
      img: by("Imagen"),
      vid: by("Video"),
      aud: by("Audio"),
      doc: by("Documento"),
      tpl: by("Plantilla"),
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return MEDIA_ASSETS.filter((m) => {
      if (tab !== "todos" && m.kind !== tab) return false;
      if (filters.pillar && filters.pillar !== "Todos" && pillarOf(m.pillarId)?.name !== filters.pillar) return false;
      if (!q) return true;
      return `${m.name} ${m.topic} ${m.episodeTitle ?? ""}`.toLowerCase().includes(q);
    });
  }, [tab, search, filters]);

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

  const sidePanel = (
    <>
      <BlockFrame title="Categorías" icon="Folder">
        <ul className="space-y-2.5">
          {(Object.keys(KIND_META) as MediaKind[]).map((kind) => {
            const Icon = resolveLucideIcon(KIND_META[kind].icon);
            const n = MEDIA_ASSETS.filter((m) => m.kind === kind).length;
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

      <BlockFrame title="Almacenamiento" icon="HardDrive">
        <div className="mb-3 flex items-baseline gap-2">
          <span className="text-xl font-semibold text-[#f3ecd9]">24.7 GB</span>
          <span className="text-sm text-white/40">de 36 GB</span>
        </div>
        <Progress value={68} />
        <ul className="mt-3 space-y-1.5 text-xs">
          {[
            { label: "Imágenes", value: "8.4 GB", color: "#a78bfa" },
            { label: "Vídeos", value: "7.9 GB", color: "#3b82f6" },
            { label: "Documentos", value: "5.1 GB", color: "#f472b6" },
            { label: "Audios", value: "2.1 GB", color: "#e0a836" },
            { label: "Otros", value: "1.2 GB", color: "#94a3b8" },
          ].map((r) => (
            <li key={r.label} className="flex items-center gap-2">
              <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ background: r.color }} />
              <span className="min-w-0 flex-1 truncate text-white/60">{r.label}</span>
              <span className="tabular-nums text-white/80">{r.value}</span>
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
      <KpiStrip
        items={[
          { id: "total", label: "Archivos totales", value: String(counts.total), sub: "100% del plan", icon: "Folder", tone: "violet" },
          { id: "img", label: "Imágenes", value: String(counts.img), sub: `${((counts.img / counts.total) * 100).toFixed(1)}% del total`, icon: "FileImage", tone: "emerald" },
          { id: "vid", label: "Vídeos", value: String(counts.vid), sub: `${((counts.vid / counts.total) * 100).toFixed(1)}% del total`, icon: "FileVideo", tone: "blue" },
          { id: "aud", label: "Audios", value: String(counts.aud), sub: `${((counts.aud / counts.total) * 100).toFixed(1)}% del total`, icon: "FileAudio", tone: "amber" },
          { id: "doc", label: "Documentos", value: String(counts.doc), sub: `${((counts.doc / counts.total) * 100).toFixed(1)}% del total`, icon: "FileText", tone: "rose" },
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
              filters={[{ id: "pillar", label: "Pilar", options: PILLARS.map((p) => p.name) }]}
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
              onEditRow={() => undefined}
              onDeleteRow={() => undefined}
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

      <AddBlockDialog open={createOpen} onOpenChange={setCreateOpen} onCreate={addBlock} />
    </PageShell>
  );
}
