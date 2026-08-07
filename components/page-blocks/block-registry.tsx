"use client";

// Los bloques son todos interactivos y, además, los tres de grafo se cargan con
// `next/dynamic` + `ssr: false`, que solo es válido en un módulo de cliente.

import { useState } from "react";
import dynamic from "next/dynamic";
import { RichTextEditor } from "@/components/page-blocks/RichTextEditor";
import { DataTable, type ColumnDef, type RowData } from "@/components/page-blocks/blocks/DataTable";
import { FilterToolbar, type FilterDef } from "@/components/page-blocks/blocks/FilterToolbar";
import { BarChart, FunnelChart, type BarSeries, type FunnelStep } from "@/components/page-blocks/blocks/Charts";
import { WeekStrip, type WeekChip } from "@/components/page-blocks/blocks/WeekStrip";
import { DetailDrawer, type DetailDrawerData } from "@/components/page-blocks/blocks/DetailDrawer";
import { KanbanBoard, type KanbanCard, type KanbanColumn } from "@/components/page-blocks/blocks/KanbanBoard";
import { AgendaList, type AgendaEntry } from "@/components/page-blocks/blocks/AgendaList";
import { QuickActionGrid, type QuickAction } from "@/components/page-blocks/blocks/QuickActionGrid";
import { MetricDeltaList, type MetricDeltaRow } from "@/components/page-blocks/blocks/MetricDeltaList";
import { PhaseChecklist, type ChecklistPhaseData } from "@/components/page-blocks/blocks/PhaseChecklist";
import { MonthCalendar, type CalendarEvent } from "@/components/page-blocks/blocks/MonthCalendar";
import { TimeGridCalendar } from "@/components/page-blocks/blocks/TimeGridCalendar";
import { MiniMonth } from "@/components/page-blocks/blocks/MiniMonth";
import { SettingsCardGrid, type SettingsCard } from "@/components/page-blocks/blocks/SettingsCardGrid";
import { SolutionCardGrid, type SolutionCardData } from "@/components/page-blocks/blocks/SolutionCardGrid";
import { StepLadder, type LadderStep } from "@/components/page-blocks/blocks/StepLadder";
import { ComponentPickList, type ComponentPick } from "@/components/page-blocks/blocks/ComponentPickList";
import { MediaCardGrid, type MediaCardData } from "@/components/page-blocks/blocks/MediaCardGrid";
import { NavTileGrid, type NavTile } from "@/components/page-blocks/blocks/NavTileGrid";
import { ComparisonTable, type ComparisonColumn, type ComparisonRow } from "@/components/page-blocks/blocks/ComparisonTable";
import { ParameterForm, type ParameterField } from "@/components/page-blocks/blocks/ParameterForm";
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
import type { GraphLink, GraphNode } from "@/components/page-blocks/blocks/RelationshipGraph";
import type { OrgEdge, OrgNode } from "@/components/page-blocks/blocks/OrgChart";
import type { FamilyEdge, FamilyMember } from "@/components/page-blocks/blocks/FamilyTree";
import type { BlockInstance, BlockType } from "@/lib/block-types";

// Los bloques de grafo arrastran d3-force y dagre; se cargan solo cuando una
// página los pinta de verdad, no por el hecho de importar el registro.
const LazyRelationshipGraph = dynamic(
  () => import("@/components/page-blocks/blocks/RelationshipGraph").then((m) => m.RelationshipGraph),
  { ssr: false }
);
const LazyOrgChart = dynamic(() => import("@/components/page-blocks/blocks/OrgChart").then((m) => m.OrgChart), {
  ssr: false,
});
const LazyFamilyTree = dynamic(() => import("@/components/page-blocks/blocks/FamilyTree").then((m) => m.FamilyTree), {
  ssr: false,
});

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
 * Algunos bloques son interactivos y, cuando se agregan desde el selector, no
 * tienen una página que les lleve el estado. Estos envoltorios se lo dan.
 */
function StandaloneFilterToolbar({ config }: { config: { placeholder?: string; filters?: FilterDef[] } | null }) {
  const [search, setSearch] = useState("");
  const [values, setValues] = useState<Record<string, string>>({});
  return (
    <FilterToolbar
      search={search}
      onSearchChange={setSearch}
      searchPlaceholder={config?.placeholder ?? "Buscar…"}
      filters={config?.filters ?? []}
      values={values}
      onFilterChange={(id, value) => setValues((prev) => ({ ...prev, [id]: value }))}
    />
  );
}

/**
 * El formulario de parámetros es controlado. Cuando se agrega suelto desde el
 * selector no hay página que le lleve el estado, así que se lo damos aquí para
 * que al menos se pueda trastear con él.
 */
function StandaloneParameterForm({ fields }: { fields: ParameterField[] }) {
  const [valores, setValores] = useState<Record<string, string | number>>({});
  const actuales = fields.map((f) => (valores[f.id] !== undefined ? { ...f, value: valores[f.id] } : f)) as ParameterField[];
  return <ParameterForm fields={actuales} onChange={(id, value) => setValores((prev) => ({ ...prev, [id]: value }))} />;
}

function StandaloneWeekStrip({ weeks }: { weeks: WeekChip[] }) {
  const [active, setActive] = useState(weeks[0]?.week ?? 1);
  return <WeekStrip weeks={weeks} active={active} onSelect={setActive} />;
}

function StandaloneKanban({ columns, cards }: { columns: KanbanColumn[]; cards: KanbanCard[] }) {
  const [items, setItems] = useState(cards);
  return (
    <KanbanBoard
      columns={columns}
      cards={items}
      onMove={(cardId, toColumnId) =>
        setItems((prev) => prev.map((c) => (c.id === cardId ? { ...c, columnId: toColumnId } : c)))
      }
    />
  );
}

/**
 * Mapa tipo de bloque → cómo renderizarlo. Mismo patrón que
 * `lib/page-registry.tsx` para las páginas.
 *
 * El `Record` es completo a propósito: si se añade un tipo al catálogo y se
 * olvida registrarlo aquí, TypeScript no compila. Antes era `Partial` y por
 * eso llegaron a ofrecerse doce tipos que solo pintaban "no disponible".
 */
export const blockRegistry: Record<BlockType, BlockRegistryEntry> = {
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
  "agenda-list": {
    render: (block) => {
      const entries = (block.config as AgendaEntry[]) ?? [];
      return entries.length ? <AgendaList entries={entries} /> : EMPTY_HINT;
    },
  },
  "quick-actions": {
    render: (block) => {
      const actions = (block.config as QuickAction[]) ?? [];
      return actions.length ? <QuickActionGrid actions={actions} /> : EMPTY_HINT;
    },
  },
  "solution-cards": {
    render: (block) => {
      const solutions = (block.config as SolutionCardData[]) ?? [];
      return solutions.length ? <SolutionCardGrid solutions={solutions} /> : EMPTY_HINT;
    },
  },
  "step-ladder": {
    render: (block) => {
      const steps = (block.config as LadderStep[]) ?? [];
      return steps.length ? <StepLadder steps={steps} showProgress /> : EMPTY_HINT;
    },
  },
  "component-picks": {
    render: (block) => {
      const items = (block.config as ComponentPick[]) ?? [];
      return items.length ? <ComponentPickList items={items} /> : EMPTY_HINT;
    },
  },
  "media-cards": {
    render: (block) => {
      const cards = (block.config as MediaCardData[]) ?? [];
      return cards.length ? <MediaCardGrid cards={cards} /> : EMPTY_HINT;
    },
  },
  "nav-tiles": {
    render: (block) => {
      const tiles = (block.config as NavTile[]) ?? [];
      return tiles.length ? <NavTileGrid tiles={tiles} /> : EMPTY_HINT;
    },
  },
  "comparison-table": {
    render: (block) => {
      const cfg = block.config as { columns: ComparisonColumn[]; rows: ComparisonRow[] } | null;
      return cfg?.columns?.length ? <ComparisonTable columns={cfg.columns} rows={cfg.rows ?? []} /> : EMPTY_HINT;
    },
  },
  "parameter-form": {
    render: (block) => {
      const fields = (block.config as ParameterField[]) ?? [];
      return fields.length ? <StandaloneParameterForm fields={fields} /> : EMPTY_HINT;
    },
  },
  "settings-cards": {
    render: (block) => {
      const cards = (block.config as SettingsCard[]) ?? [];
      return cards.length ? <SettingsCardGrid cards={cards} /> : EMPTY_HINT;
    },
  },
  "month-calendar": {
    render: (block) => {
      const cfg = block.config as { year?: number; month?: number; events?: CalendarEvent[] } | null;
      const hoy = new Date();
      return <MonthCalendar year={cfg?.year ?? hoy.getFullYear()} month={cfg?.month ?? hoy.getMonth()} events={cfg?.events ?? []} />;
    },
  },
  "time-grid-calendar": {
    render: (block) => {
      const cfg = block.config as { days?: string[]; events?: CalendarEvent[] } | null;
      // Sin días configurados se muestra hoy.
      const days = cfg?.days?.length ? cfg.days.map((d) => new Date(`${d}T12:00:00`)) : [new Date()];
      return <TimeGridCalendar days={days} events={cfg?.events ?? []} />;
    },
  },
  "mini-month": {
    render: (block) => {
      const cfg = block.config as { year?: number; month?: number } | null;
      const hoy = new Date();
      return <MiniMonth year={cfg?.year ?? hoy.getFullYear()} month={cfg?.month ?? hoy.getMonth()} />;
    },
  },
  "phase-checklist": {
    render: (block) => {
      const phases = (block.config as ChecklistPhaseData[]) ?? [];
      return phases.length ? <PhaseChecklist phases={phases} /> : EMPTY_HINT;
    },
  },
  "metric-delta": {
    render: (block) => {
      const rows = (block.config as MetricDeltaRow[]) ?? [];
      return rows.length ? <MetricDeltaList rows={rows} /> : EMPTY_HINT;
    },
  },
  "data-table": {
    render: (block) => {
      const cfg = block.config as { columns: ColumnDef[]; rows: RowData[] } | null;
      return cfg?.columns?.length ? <DataTable columns={cfg.columns} rows={cfg.rows ?? []} /> : EMPTY_HINT;
    },
  },
  "filter-toolbar": {
    render: (block) => <StandaloneFilterToolbar config={block.config as { placeholder?: string; filters?: FilterDef[] } | null} />,
  },
  timeline: {
    render: (block) => {
      const steps = (block.config as TimelineStep[]) ?? [];
      return steps.length ? <Timeline steps={steps} /> : EMPTY_HINT;
    },
  },
  "bar-chart": {
    render: (block) => {
      const cfg = block.config as { data: Record<string, unknown>[]; categoryKey: string; series: BarSeries[] } | null;
      return cfg?.data?.length ? <BarChart data={cfg.data} categoryKey={cfg.categoryKey} series={cfg.series ?? []} /> : EMPTY_HINT;
    },
  },
  "funnel-chart": {
    render: (block) => {
      const steps = (block.config as FunnelStep[]) ?? [];
      return steps.length ? <FunnelChart steps={steps} /> : EMPTY_HINT;
    },
  },
  "week-strip": {
    render: (block) => {
      const weeks = (block.config as WeekChip[]) ?? [];
      return weeks.length ? <StandaloneWeekStrip weeks={weeks} /> : EMPTY_HINT;
    },
  },
  "detail-drawer": {
    render: (block) => {
      const data = block.config as DetailDrawerData | null;
      // Sin `onClose`: agregado como bloque es una ficha fija, no un panel
      // que se abre y se cierra desde una tabla.
      return data ? <DetailDrawer data={data} sections={[]} /> : EMPTY_HINT;
    },
  },
  "kanban-board": {
    render: (block) => {
      const cfg = block.config as { columns: KanbanColumn[]; cards: KanbanCard[] } | null;
      return cfg?.columns?.length ? <StandaloneKanban columns={cfg.columns} cards={cfg.cards ?? []} /> : EMPTY_HINT;
    },
  },
  "relationship-graph": {
    render: (block) => {
      const cfg = block.config as { nodes: GraphNode[]; links: GraphLink[] } | null;
      return cfg?.nodes?.length ? <LazyRelationshipGraph nodes={cfg.nodes} links={cfg.links ?? []} /> : EMPTY_HINT;
    },
  },
  "org-chart": {
    render: (block) => {
      const cfg = block.config as { nodes: OrgNode[]; edges: OrgEdge[] } | null;
      return cfg?.nodes?.length ? <LazyOrgChart nodes={cfg.nodes} edges={cfg.edges ?? []} /> : EMPTY_HINT;
    },
  },
  "family-tree": {
    render: (block) => {
      const cfg = block.config as { members: FamilyMember[]; edges: FamilyEdge[] } | null;
      return cfg?.members?.length ? <LazyFamilyTree members={cfg.members} edges={cfg.edges ?? []} /> : EMPTY_HINT;
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
