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
import { WeekCardGrid, type WeekCardData } from "@/components/page-blocks/blocks/WeekCardGrid";
import { PillarCardGrid, type PillarCardData } from "@/components/page-blocks/blocks/PillarCardGrid";
import { EcosystemHub, type EcosystemSpoke } from "@/components/page-blocks/blocks/EcosystemHub";
import { KpiProgressList, type KpiProgressRow } from "@/components/page-blocks/blocks/KpiProgressList";
import { UpcomingEpisodes, type UpcomingEpisode } from "@/components/page-blocks/blocks/UpcomingEpisodes";
import { ScoreRing } from "@/components/page-blocks/blocks/ScoreRing";
import { TagCloud, type TagChip } from "@/components/page-blocks/blocks/TagCloud";
import { StatTileList, type StatTile } from "@/components/page-blocks/blocks/StatTileList";
import { ActivityFeed, type ActivityEntry } from "@/components/page-blocks/blocks/ActivityFeed";
import { RankedBarList, type RankedBarRow } from "@/components/page-blocks/blocks/RankedBarList";
import { InsightList, type Insight } from "@/components/page-blocks/blocks/InsightList";
import { ProfileHeader, type ProfileHeaderData } from "@/components/page-blocks/blocks/ProfileHeader";
import { LineChart, ColumnChart, type TrendSeries } from "@/components/page-blocks/blocks/TrendCharts";
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
  "score-ring": {
    render: (block) => {
      const cfg = block.config as { value: number } | null;
      return cfg ? (
        <div className="flex justify-center py-2">
          <ScoreRing value={cfg.value} size={72} />
        </div>
      ) : (
        EMPTY_HINT
      );
    },
  },
  "tag-cloud": {
    render: (block) => <TagCloud tags={(block.config as TagChip[]) ?? []} />,
  },
  "stat-tiles": {
    render: (block) => {
      const tiles = (block.config as StatTile[]) ?? [];
      return tiles.length ? <StatTileList tiles={tiles} /> : EMPTY_HINT;
    },
  },
  "activity-feed": {
    render: (block) => {
      const entries = (block.config as ActivityEntry[]) ?? [];
      return entries.length ? <ActivityFeed entries={entries} /> : EMPTY_HINT;
    },
  },
  "ranked-bars": {
    render: (block) => {
      const rows = (block.config as RankedBarRow[]) ?? [];
      return rows.length ? <RankedBarList rows={rows} /> : EMPTY_HINT;
    },
  },
  "insight-list": {
    render: (block) => {
      const insights = (block.config as Insight[]) ?? [];
      return insights.length ? <InsightList insights={insights} /> : EMPTY_HINT;
    },
  },
  "profile-header": {
    render: (block) => {
      const cfg = block.config as ProfileHeaderData | null;
      return cfg ? <ProfileHeader data={cfg} /> : EMPTY_HINT;
    },
  },
  "line-chart": {
    render: (block) => {
      const cfg = block.config as { data: Record<string, unknown>[]; categoryKey: string; series: TrendSeries[] } | null;
      return cfg?.data?.length ? <LineChart data={cfg.data} categoryKey={cfg.categoryKey} series={cfg.series} /> : EMPTY_HINT;
    },
  },
  "column-chart": {
    render: (block) => {
      const cfg = block.config as { data: Record<string, unknown>[]; categoryKey: string; valueKey: string; color?: string } | null;
      return cfg?.data?.length ? (
        <ColumnChart data={cfg.data} categoryKey={cfg.categoryKey} valueKey={cfg.valueKey} color={cfg.color} />
      ) : (
        EMPTY_HINT
      );
    },
  },
  "week-cards": {
    render: (block) => {
      const weeks = (block.config as WeekCardData[]) ?? [];
      return weeks.length ? <WeekCardGrid weeks={weeks} /> : EMPTY_HINT;
    },
  },
  "pillar-cards": {
    render: (block) => {
      const pillars = (block.config as PillarCardData[]) ?? [];
      return pillars.length ? <PillarCardGrid pillars={pillars} /> : EMPTY_HINT;
    },
  },
  "ecosystem-hub": {
    render: (block) => {
      const cfg = block.config as { center: { label: string; sub: string; icon: string }; spokes: EcosystemSpoke[] } | null;
      return cfg?.spokes?.length ? <EcosystemHub center={cfg.center} spokes={cfg.spokes} /> : EMPTY_HINT;
    },
  },
  "kpi-progress": {
    render: (block) => {
      const rows = (block.config as KpiProgressRow[]) ?? [];
      return rows.length ? <KpiProgressList rows={rows} /> : EMPTY_HINT;
    },
  },
  "upcoming-episodes": {
    render: (block) => {
      const episodes = (block.config as UpcomingEpisode[]) ?? [];
      return episodes.length ? <UpcomingEpisodes episodes={episodes} /> : EMPTY_HINT;
    },
  },
  "media-preview": {
    render: (block) => {
      const media = block.config as MediaInfo | null;
      return media ? <MediaPreview media={media} /> : EMPTY_HINT;
    },
  },
};
