import { RichTextEditor } from "@/components/page-blocks/RichTextEditor";
import { KpiStrip, type KpiItem } from "@/components/page-blocks/blocks/KpiStrip";
import { DonutChart, type DonutSlice } from "@/components/page-blocks/blocks/DonutChart";
import { InfoCard, type InfoRow } from "@/components/page-blocks/blocks/InfoCard";
import { FileList, type FileEntry } from "@/components/page-blocks/blocks/FileList";
import { ChecklistPanel, type ChecklistLine } from "@/components/page-blocks/blocks/ChecklistPanel";
import { NotesPanel, type NoteEntry } from "@/components/page-blocks/blocks/NotesPanel";
import { FlowStrip, type FlowStep } from "@/components/page-blocks/blocks/FlowStrip";
import { AssetProgressGrid, type AssetCard } from "@/components/page-blocks/blocks/AssetProgressGrid";
import { PersonCard, type PersonInfo } from "@/components/page-blocks/blocks/PersonCard";
import { Timeline, type TimelineStep } from "@/components/page-blocks/blocks/Timeline";
import { MediaPreview, type MediaInfo } from "@/components/page-blocks/blocks/MediaPreview";
import type { BlockInstance, BlockType } from "@/lib/block-types";

export interface BlockRegistryEntry {
  render: (block: BlockInstance) => React.ReactNode;
  /** El bloque trae su propio encabezado y no necesita el del marco. */
  bare?: boolean;
  /** El bloque gestiona su propio espaciado interno. */
  padded?: boolean;
}

/** Configuración por defecto para los bloques creados desde el selector. */
const EMPTY_HINT = <p className="py-6 text-center text-sm text-white/35">Bloque vacío — edítalo para agregar contenido.</p>;

/**
 * Mapa tipo de bloque → cómo renderizarlo. Mismo patrón que
 * `lib/page-registry.tsx` para las páginas.
 *
 * Los tipos que aún no están aquí muestran un aviso de "no disponible" en
 * lugar de romper la página.
 */
export const blockRegistry: Partial<Record<BlockType, BlockRegistryEntry>> = {
  "rich-text": {
    render: (block) => <RichTextEditor content={(block.config as string) ?? ""} />,
  },
  "kpi-strip": {
    bare: true,
    render: (block) => {
      const items = (block.config as KpiItem[]) ?? [];
      return items.length ? <KpiStrip items={items} /> : EMPTY_HINT;
    },
  },
  "donut-chart": {
    render: (block) => {
      const cfg = block.config as { slices: DonutSlice[]; centerValue: string; centerLabel: string } | null;
      return cfg ? <DonutChart slices={cfg.slices} centerValue={cfg.centerValue} centerLabel={cfg.centerLabel} /> : EMPTY_HINT;
    },
  },
  "info-card": {
    render: (block) => {
      const rows = (block.config as InfoRow[]) ?? [];
      return rows.length ? <InfoCard rows={rows} /> : EMPTY_HINT;
    },
  },
  "file-list": {
    render: (block) => {
      const cfg = block.config as { files: FileEntry[]; downloadable?: boolean } | null;
      return cfg?.files?.length ? <FileList files={cfg.files} downloadable={cfg.downloadable} /> : EMPTY_HINT;
    },
  },
  "checklist-panel": {
    render: (block) => {
      const lines = (block.config as ChecklistLine[]) ?? [];
      return lines.length ? <ChecklistPanel lines={lines} /> : EMPTY_HINT;
    },
  },
  "notes-panel": {
    render: (block) => <NotesPanel notes={(block.config as NoteEntry[]) ?? []} />,
  },
  "flow-strip": {
    render: (block) => {
      const cfg = block.config as { steps: FlowStep[]; progressValue?: number; progressLabel?: string } | null;
      return cfg?.steps?.length ? (
        <FlowStrip steps={cfg.steps} progressValue={cfg.progressValue} progressLabel={cfg.progressLabel} />
      ) : (
        EMPTY_HINT
      );
    },
  },
  "asset-progress": {
    render: (block) => {
      const assets = (block.config as AssetCard[]) ?? [];
      return assets.length ? <AssetProgressGrid assets={assets} /> : EMPTY_HINT;
    },
  },
  "person-card": {
    render: (block) => {
      const person = block.config as PersonInfo | null;
      return person ? <PersonCard person={person} /> : EMPTY_HINT;
    },
  },
  timeline: {
    render: (block) => {
      const steps = (block.config as TimelineStep[]) ?? [];
      return steps.length ? <Timeline steps={steps} /> : EMPTY_HINT;
    },
  },
  "media-preview": {
    render: (block) => {
      const media = block.config as MediaInfo | null;
      return media ? <MediaPreview media={media} /> : EMPTY_HINT;
    },
  },
};
