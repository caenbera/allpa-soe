"use client";

import { useMemo, useState } from "react";
import { List, Plus } from "lucide-react";
import { PageShell, PageTabs } from "@/components/page-blocks/PageShell";
import { BlockFrame } from "@/components/page-blocks/BlockFrame";
import { AddBlockButton, AddBlockDialog } from "@/components/page-blocks/AddBlockDialog";
import { BlockRenderer } from "@/components/page-blocks/BlockRenderer";
import { EmptyState, LoadingState } from "@/components/page-blocks/EmptyState";
import { KpiStrip } from "@/components/page-blocks/blocks/KpiStrip";
import { FilterToolbar } from "@/components/page-blocks/blocks/FilterToolbar";
import { DataTable, type RowData } from "@/components/page-blocks/blocks/DataTable";
import { DonutChart } from "@/components/page-blocks/blocks/DonutChart";
import { Button } from "@/components/ui/button";
import { useContent } from "@/lib/use-content";
import { usePageConfig } from "@/lib/use-page-config";
import { CONTENT_COLLECTIONS, CLASS_STATUS_TONE, type AcademyClass, type ClassStatus, type Pillar } from "@/lib/content-types";

const TABS = [
  { value: "todas", label: "Todas" },
  { value: "Publicada", label: "Publicadas" },
  { value: "En producción", label: "En producción" },
  { value: "Planeada", label: "Planeadas" },
];

export function AcademiaView() {
  const [tab, setTab] = useState("todas");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [createOpen, setCreateOpen] = useState(false);

  const classes = useContent<AcademyClass>(CONTENT_COLLECTIONS.academyClasses);
  const pillars = useContent<Pillar>(CONTENT_COLLECTIONS.pillars);
  const { blocks, addBlock, updateBlock, removeBlock } = usePageConfig("/contenido/academia");

  const pillarOf = (id: string | null) => pillars.items.find((p) => p.id === id);

  const counts = useMemo(() => {
    const by = (s: ClassStatus) => classes.items.filter((c) => c.status === s).length;
    return {
      total: classes.items.length,
      pub: by("Publicada"),
      prod: by("En producción"),
      plan: by("Planeada"),
      students: classes.items.reduce((sum, c) => sum + c.students, 0),
      lessons: classes.items.reduce((sum, c) => sum + c.lessons, 0),
    };
  }, [classes.items]);

  const pct = (n: number) => (counts.total > 0 ? `${((n / counts.total) * 100).toFixed(1)}% del total` : "—");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return classes.items.filter((c) => {
      if (tab !== "todas" && c.status !== tab) return false;
      if (filters.pillar && filters.pillar !== "Todos" && pillarOf(c.pillarId)?.name !== filters.pillar) return false;
      if (filters.level && filters.level !== "Todos" && c.level !== filters.level) return false;
      if (!q) return true;
      return `${c.title} ${c.subtitle}`.toLowerCase().includes(q);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classes.items, pillars.items, tab, search, filters]);

  const rows: RowData[] = filtered.map((c) => {
    const pillar = pillarOf(c.pillarId);
    return {
      id: c.id,
      cells: {
        title: { kind: "text", value: c.title, sub: c.subtitle, strong: true },
        pillar: { kind: "badge", value: pillar?.name ?? "—", tone: pillar?.tone },
        level: { kind: "badge", value: c.level, tone: "neutral" },
        lessons: { kind: "number", value: `${c.lessons} lecciones` },
        duration: { kind: "text", value: c.duration },
        students: { kind: "number", value: c.students > 0 ? c.students.toLocaleString("es") : "—" },
        status: { kind: "status", value: c.status, tone: CLASS_STATUS_TONE[c.status] },
        progress: { kind: "progress", value: c.progress },
      },
    };
  });

  const loading = classes.loading || pillars.loading;
  const isEmpty = !loading && counts.total === 0;

  const sidePanel = (
    <>
      {!isEmpty && (
        <>
          <BlockFrame title="Clases por estado" icon="PieChart">
            <DonutChart
              slices={[
                { id: "pub", label: "Publicadas", value: counts.pub, color: "#22c55e" },
                { id: "prod", label: "En producción", value: counts.prod, color: "#e0a836" },
                { id: "plan", label: "Planeadas", value: counts.plan, color: "#3b82f6" },
              ].filter((s) => s.value > 0)}
              centerValue={String(counts.total)}
              centerLabel="Clases totales"
            />
          </BlockFrame>

          <BlockFrame title="Clases más populares" icon="Trophy">
            <ul className="space-y-2.5">
              {classes.items
                .filter((c) => c.students > 0)
                .sort((a, b) => b.students - a.students)
                .map((c, i) => (
                  <li key={c.id} className="flex items-center gap-2.5 text-sm">
                    <span className="w-4 flex-shrink-0 text-xs text-white/35">{i + 1}.</span>
                    <span className="min-w-0 flex-1 truncate text-white/75">{c.title}</span>
                    <span className="flex-shrink-0 tabular-nums text-white/55">{c.students.toLocaleString("es")}</span>
                  </li>
                ))}
              {counts.students === 0 && <li className="text-sm text-white/35">Aún no hay estudiantes inscritos.</li>}
            </ul>
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
      title="Academia"
      description="Las clases que transforman cada episodio en formación práctica para tu audiencia."
      icon="GraduationCap"
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
            Nueva Clase
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
            icon="GraduationCap"
            title="Todavía no hay clases"
            description="Convierte tus episodios en clases estructuradas por módulos y lecciones para que tu audiencia aprenda a su ritmo."
            actionLabel="Nueva Clase"
            onAction={() => undefined}
          />
        </div>
      ) : (
        <>
          <KpiStrip
            items={[
              { id: "total", label: "Clases totales", value: String(counts.total), sub: "en la Academia", icon: "GraduationCap", tone: "violet" },
              { id: "pub", label: "Publicadas", value: String(counts.pub), sub: pct(counts.pub), icon: "CheckCircle2", tone: "emerald" },
              { id: "prod", label: "En producción", value: String(counts.prod), sub: pct(counts.prod), icon: "Clock", tone: "amber" },
              { id: "lessons", label: "Lecciones", value: String(counts.lessons), sub: "en total", icon: "ListTree", tone: "blue" },
              { id: "students", label: "Estudiantes", value: counts.students.toLocaleString("es"), sub: "inscritos", icon: "Users", tone: "gold" },
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
                  searchPlaceholder="Buscar clase por título o tema..."
                  filters={[
                    { id: "pillar", label: "Pilar", options: pillars.items.map((p) => p.name) },
                    { id: "level", label: "Nivel", options: ["Básico", "Intermedio", "Avanzado"] },
                  ]}
                  values={filters}
                  onFilterChange={(id, value) => setFilters((f) => ({ ...f, [id]: value }))}
                  onExport={() => undefined}
                />
              </div>
              <DataTable
                columns={[
                  { id: "title", header: "Clase", sortable: true },
                  { id: "pillar", header: "Pilar", sortable: true, width: "160px" },
                  { id: "level", header: "Nivel", sortable: true, width: "120px" },
                  { id: "lessons", header: "Lecciones", sortable: true, width: "120px" },
                  { id: "duration", header: "Duración", width: "110px" },
                  { id: "students", header: "Estudiantes", sortable: true, width: "120px", align: "right" },
                  { id: "status", header: "Estado", sortable: true, width: "140px" },
                  { id: "progress", header: "Progreso", sortable: true, width: "150px" },
                ]}
                rows={rows}
                onView={() => undefined}
                onDeleteRow={(id) => classes.remove(id)}
              />
            </div>
          </div>
        </>
      )}

      <AddBlockDialog open={createOpen} onOpenChange={setCreateOpen} onCreate={addBlock} />
    </PageShell>
  );
}
