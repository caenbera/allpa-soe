"use client";

import { useMemo, useState } from "react";
import { List, Plus } from "lucide-react";
import { PageShell, PageTabs } from "@/components/page-blocks/PageShell";
import { BlockFrame } from "@/components/page-blocks/BlockFrame";
import { AddBlockButton, AddBlockDialog } from "@/components/page-blocks/AddBlockDialog";
import { BlockRenderer } from "@/components/page-blocks/BlockRenderer";
import { KpiStrip } from "@/components/page-blocks/blocks/KpiStrip";
import { FilterToolbar } from "@/components/page-blocks/blocks/FilterToolbar";
import { DataTable, type RowData } from "@/components/page-blocks/blocks/DataTable";
import { DonutChart } from "@/components/page-blocks/blocks/DonutChart";
import { Button } from "@/components/ui/button";
import { useBlocksState } from "@/lib/use-blocks";
import { PILLARS, pillarOf } from "@/components/pages/contenido/mock-data";

type ClassStatus = "Publicada" | "En producción" | "Planeada";

interface AcademyClass {
  id: string;
  title: string;
  subtitle: string;
  pillarId: string;
  level: "Básico" | "Intermedio" | "Avanzado";
  lessons: number;
  duration: string;
  students: number;
  rating: string;
  status: ClassStatus;
  progress: number;
  episodeWeek: number;
}

const CLASSES: AcademyClass[] = [
  { id: "c1", title: "Los Trusts: protección y tranquilidad para tu familia", subtitle: "Aprende cuándo y cómo crear tu primer Trust", pillarId: "proteccion-legal", level: "Intermedio", lessons: 6, duration: "35 – 45 min", students: 0, rating: "—", status: "En producción", progress: 45, episodeWeek: 12 },
  { id: "c2", title: "Seguro de vida sin mitos", subtitle: "Todo lo que debes saber antes de contratar", pillarId: "proteccion", level: "Básico", lessons: 5, duration: "28 min", students: 1284, rating: "4.8", status: "Publicada", progress: 100, episodeWeek: 1 },
  { id: "c3", title: "Protege tus ingresos con Disability Insurance", subtitle: "Qué cubre y cómo elegir la póliza correcta", pillarId: "proteccion", level: "Básico", lessons: 4, duration: "22 min", students: 862, rating: "4.6", status: "Publicada", progress: 100, episodeWeek: 3 },
  { id: "c4", title: "Annuities: ingresos garantizados de por vida", subtitle: "Convierte tu ahorro en pagos mensuales", pillarId: "crecimiento", level: "Intermedio", lessons: 7, duration: "42 min", students: 517, rating: "4.7", status: "Publicada", progress: 100, episodeWeek: 5 },
  { id: "c5", title: "Estate Planning para familias latinas", subtitle: "Documentos esenciales paso a paso", pillarId: "proteccion-legal", level: "Intermedio", lessons: 8, duration: "50 min", students: 0, rating: "—", status: "Planeada", progress: 10, episodeWeek: 7 },
  { id: "c6", title: "Key Person Insurance para tu empresa", subtitle: "Asegura la continuidad de tu negocio", pillarId: "negocios", level: "Avanzado", lessons: 6, duration: "38 min", students: 0, rating: "—", status: "En producción", progress: 30, episodeWeek: 6 },
  { id: "c7", title: "Educación financiera para tus hijos", subtitle: "Enseña a manejar el dinero desde temprano", pillarId: "legado", level: "Básico", lessons: 5, duration: "26 min", students: 0, rating: "—", status: "Planeada", progress: 0, episodeWeek: 9 },
  { id: "c8", title: "Long-Term Care: planifica a tiempo", subtitle: "Evita ser una carga financiera para los tuyos", pillarId: "proteccion", level: "Intermedio", lessons: 6, duration: "34 min", students: 0, rating: "—", status: "Planeada", progress: 15, episodeWeek: 4 },
];

const STATUS_TONE_CLASS = { Publicada: "emerald", "En producción": "amber", Planeada: "blue" } as const;

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
  const { blocks, addBlock, updateBlock, removeBlock } = useBlocksState([]);

  const counts = useMemo(() => {
    const by = (s: ClassStatus) => CLASSES.filter((c) => c.status === s).length;
    return {
      total: CLASSES.length,
      pub: by("Publicada"),
      prod: by("En producción"),
      plan: by("Planeada"),
      students: CLASSES.reduce((sum, c) => sum + c.students, 0),
      lessons: CLASSES.reduce((sum, c) => sum + c.lessons, 0),
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return CLASSES.filter((c) => {
      if (tab !== "todas" && c.status !== tab) return false;
      if (filters.pillar && filters.pillar !== "Todos" && pillarOf(c.pillarId)?.name !== filters.pillar) return false;
      if (filters.level && filters.level !== "Todos" && c.level !== filters.level) return false;
      if (!q) return true;
      return `${c.title} ${c.subtitle}`.toLowerCase().includes(q);
    });
  }, [tab, search, filters]);

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
        rating: { kind: "text", value: c.rating },
        status: { kind: "status", value: c.status, tone: STATUS_TONE_CLASS[c.status] },
        progress: { kind: "progress", value: c.progress },
      },
    };
  });

  const sidePanel = (
    <>
      <BlockFrame title="Clases por estado" icon="PieChart">
        <DonutChart
          slices={[
            { id: "pub", label: "Publicadas", value: counts.pub, color: "#22c55e" },
            { id: "prod", label: "En producción", value: counts.prod, color: "#e0a836" },
            { id: "plan", label: "Planeadas", value: counts.plan, color: "#3b82f6" },
          ]}
          centerValue={String(counts.total)}
          centerLabel="Clases totales"
        />
      </BlockFrame>

      <BlockFrame title="Clases más populares" icon="Trophy">
        <ul className="space-y-2.5">
          {CLASSES.filter((c) => c.students > 0)
            .sort((a, b) => b.students - a.students)
            .map((c, i) => (
              <li key={c.id} className="flex items-center gap-2.5 text-sm">
                <span className="w-4 flex-shrink-0 text-xs text-white/35">{i + 1}.</span>
                <span className="min-w-0 flex-1 truncate text-white/75">{c.title}</span>
                <span className="flex-shrink-0 tabular-nums text-white/55">{c.students.toLocaleString("es")}</span>
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
      <KpiStrip
        items={[
          { id: "total", label: "Clases totales", value: String(counts.total), sub: "en la Academia", icon: "GraduationCap", tone: "violet" },
          { id: "pub", label: "Publicadas", value: String(counts.pub), sub: `${((counts.pub / counts.total) * 100).toFixed(1)}% del total`, icon: "CheckCircle2", tone: "emerald" },
          { id: "prod", label: "En producción", value: String(counts.prod), sub: `${((counts.prod / counts.total) * 100).toFixed(1)}% del total`, icon: "Clock", tone: "amber" },
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
                { id: "pillar", label: "Pilar", options: PILLARS.map((p) => p.name) },
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
            onEditRow={() => undefined}
            onDeleteRow={() => undefined}
          />
        </div>
      </div>

      <AddBlockDialog open={createOpen} onOpenChange={setCreateOpen} onCreate={addBlock} />
    </PageShell>
  );
}
