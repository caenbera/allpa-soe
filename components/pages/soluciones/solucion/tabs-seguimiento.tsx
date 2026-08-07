"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { BlockFrame } from "@/components/page-blocks/BlockFrame";
import { EmptyState } from "@/components/page-blocks/EmptyState";
import { KpiStrip } from "@/components/page-blocks/blocks/KpiStrip";
import { DataTable, type RowData } from "@/components/page-blocks/blocks/DataTable";
import { FilterToolbar } from "@/components/page-blocks/blocks/FilterToolbar";
import { DonutChart } from "@/components/page-blocks/blocks/DonutChart";
import { MediaCardGrid } from "@/components/page-blocks/blocks/MediaCardGrid";
import { ActivityFeed } from "@/components/page-blocks/blocks/ActivityFeed";
import { KpiProgressList } from "@/components/page-blocks/blocks/KpiProgressList";
import { StatTileList } from "@/components/page-blocks/blocks/StatTileList";
import { QuickActionGrid } from "@/components/page-blocks/blocks/QuickActionGrid";
import { PageTabs } from "@/components/page-blocks/PageShell";
import { money, share } from "@/lib/solution-metrics";
import {
  ASSIGNMENT_STATUS_COLOR,
  ASSIGNMENT_STATUS_TONE,
  IMPACT_COLOR,
  SOL_ACTIVITY_KINDS,
  SOL_ACTIVITY_META,
  SOL_DOCUMENT_STATUS_TONE,
  type AssignmentStatus,
  type SolDocumentStatus,
} from "@/lib/solution-types";
import type { SolutionContext } from "@/components/pages/soluciones/solucion/context";

const CATEGORIA_COLOR = ["#a78bfa", "#3b82f6", "#22c55e", "#e0a836", "#f97316", "#f472b6", "#64748b"];

/**
 * Plural castellano de las etiquetas de las pestañas.
 *
 * Añadir una "s" a secas dejaba "Reunións" y "Actualizacións": las palabras
 * agudas terminadas en -ón pierden la tilde y toman -ones.
 */
function plural(palabra: string): string {
  return palabra.endsWith("ón") ? `${palabra.slice(0, -2)}ones` : `${palabra}s`;
}

// ── Documentos ─────────────────────────────────────────────────────────────

const FILTROS_DOC: { value: string; label: string; estados?: SolDocumentStatus[] }[] = [
  { value: "todos", label: "Todos" },
  { value: "activos", label: "Activos", estados: ["Activo"] },
  { value: "pendientes", label: "Pendientes de firma", estados: ["Pendiente de Firma"] },
  { value: "revision", label: "Por vencer", estados: ["Revisión Periódica"] },
  { value: "firmados", label: "Firmados", estados: ["Firmado"] },
];

export function DocumentosMain({ ctx }: { ctx: SolutionContext }) {
  const { documents } = ctx;
  const [tab, setTab] = useState("todos");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});

  const visibles = useMemo(() => {
    const q = search.trim().toLowerCase();
    const def = FILTROS_DOC.find((f) => f.value === tab);
    return documents.filter((d) => {
      if (def?.estados && !def.estados.includes(d.status)) return false;
      if (filters.categoria && d.category !== filters.categoria) return false;
      if (filters.formato && d.format !== filters.formato) return false;
      if (!q) return true;
      return d.name.toLowerCase().includes(q) || d.stage.toLowerCase().includes(q);
    });
  }, [documents, tab, filters, search]);

  const activos = documents.filter((d) => d.status === "Activo").length;
  const firma = documents.filter((d) => d.status === "Pendiente de Firma").length;
  const revision = documents.filter((d) => d.status === "Revisión Periódica").length;

  const filas: RowData[] = visibles.map((d) => ({
    id: d.id,
    cells: {
      documento: { kind: "source", icon: "FileText", value: d.name, sub: `${d.format} · ${d.size}` },
      categoria: { kind: "badge", value: d.category, tone: "violet" },
      etapa: { kind: "text", value: d.stage },
      estado: { kind: "status", value: d.status, tone: SOL_DOCUMENT_STATUS_TONE[d.status] },
      actualizado: { kind: "stacked", value: d.updatedAt, sub: d.updatedTime },
    },
  }));

  const conteo = (value: string) => {
    const def = FILTROS_DOC.find((f) => f.value === value);
    return def?.estados ? documents.filter((d) => def.estados!.includes(d.status)).length : documents.length;
  };

  return (
    <>
      <KpiStrip
        layout="inline"
        items={[
          { id: "total", label: "Documentos totales", value: String(documents.length), sub: "de esta solución", icon: "Folder", tone: "violet" },
          { id: "activos", label: "Documentos activos", value: String(activos), sub: `${share(activos, documents.length)}% del total`, icon: "CheckCircle2", tone: "emerald" },
          { id: "firma", label: "Pendientes de firma", value: String(firma), sub: firma > 0 ? "requieren atención" : "todo al día", icon: "PenLine", tone: firma > 0 ? "amber" : "emerald" },
          { id: "revision", label: "Revisión periódica", value: String(revision), sub: "vencen próximamente", icon: "Clock", tone: "blue" },
          { id: "categorias", label: "Categorías", value: String(new Set(documents.map((d) => d.category)).size), sub: "tipos distintos", icon: "Tags", tone: "gold" },
        ]}
      />

      <BlockFrame title="Documentos de la solución" icon="FileText">
        <PageTabs tabs={FILTROS_DOC.map((f) => ({ value: f.value, label: `${f.label} (${conteo(f.value)})` }))} active={tab} onChange={setTab} />

        <FilterToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Buscar documento…"
          filters={[
            { id: "categoria", label: "Categoría", options: [...new Set(documents.map((d) => d.category))] },
            { id: "formato", label: "Formato", options: [...new Set(documents.map((d) => d.format))] },
          ]}
          values={filters}
          onFilterChange={(id, value) => setFilters((prev) => ({ ...prev, [id]: value }))}
        />

        {visibles.length === 0 ? (
          <EmptyState
            icon="FileText"
            title="Sin documentos"
            description="Ningún documento de este plan coincide con lo que buscas."
          />
        ) : (
          <DataTable
            columns={[
              { id: "documento", header: "Documento", sortable: true },
              { id: "categoria", header: "Categoría", sortable: true, width: "150px" },
              { id: "etapa", header: "Etapa del plan", sortable: true },
              { id: "estado", header: "Estado", sortable: true, width: "180px" },
              { id: "actualizado", header: "Última actualización", sortable: true, width: "170px" },
            ]}
            rows={filas}
          />
        )}
      </BlockFrame>
    </>
  );
}

export function DocumentosSide({ ctx }: { ctx: SolutionContext }) {
  const { documents } = ctx;

  const porCategoria = useMemo(() => {
    const mapa = new Map<string, number>();
    documents.forEach((d) => mapa.set(d.category, (mapa.get(d.category) ?? 0) + 1));
    return [...mapa.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([label, value], i) => ({ id: label, label, value, color: CATEGORIA_COLOR[i % CATEGORIA_COLOR.length] }));
  }, [documents]);

  const porEtapa = useMemo(() => {
    const mapa = new Map<string, number>();
    documents.forEach((d) => mapa.set(d.stage, (mapa.get(d.stage) ?? 0) + 1));
    return [...mapa.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([label, value]) => ({
        id: label,
        label,
        icon: "ListOrdered",
        value: String(value),
        percent: share(value, documents.length),
      }));
  }, [documents]);

  const pendientes = documents.filter((d) => d.status === "Pendiente de Firma" || d.status === "Revisión Periódica");

  return (
    <>
      <BlockFrame title="Distribución por categoría" icon="PieChart">
        {porCategoria.length === 0 ? (
          <p className="py-4 text-center text-sm text-white/35">Sin documentos.</p>
        ) : (
          <DonutChart slices={porCategoria} centerValue={String(documents.length)} centerLabel="Total" />
        )}
      </BlockFrame>

      <BlockFrame title="Documentos por etapa" icon="ListOrdered">
        {porEtapa.length === 0 ? (
          <p className="py-4 text-center text-sm text-white/35">Sin documentos.</p>
        ) : (
          <KpiProgressList rows={porEtapa} />
        )}
      </BlockFrame>

      <BlockFrame title="Requieren atención" icon="Clock">
        {pendientes.length === 0 ? (
          <p className="py-4 text-center text-sm text-white/35">Ningún documento pendiente.</p>
        ) : (
          <StatTileList
            tiles={pendientes.slice(0, 4).map((d) => ({
              id: d.id,
              icon: "FileText",
              color: d.status === "Pendiente de Firma" ? "#e0a836" : "#3b82f6",
              value: d.status,
              label: d.name,
            }))}
          />
        )}
      </BlockFrame>

      <BlockFrame title="Acciones rápidas" icon="Zap">
        <QuickActionGrid
          layout="list"
          columns={1}
          actions={[
            { id: "subir", icon: "Upload", label: "Subir nuevo documento" },
            { id: "firma", icon: "PenLine", label: "Solicitar firma" },
            { id: "plantilla", icon: "LayoutTemplate", label: "Crear desde plantilla" },
            { id: "paquete", icon: "Package", label: "Generar paquete de documentos" },
          ]}
          onSelect={() => toast.info("La gestión documental llega con el editor de planes.")}
        />
      </BlockFrame>
    </>
  );
}

// ── Casos de uso ───────────────────────────────────────────────────────────

export function CasosMain({ ctx }: { ctx: SolutionContext }) {
  const { useCases } = ctx;
  const [segmento, setSegmento] = useState("todos");
  const [search, setSearch] = useState("");

  const segmentos = useMemo(() => [...new Set(useCases.map((u) => u.segment))], [useCases]);

  const visibles = useMemo(() => {
    const q = search.trim().toLowerCase();
    return useCases.filter((u) => {
      if (segmento !== "todos" && u.segment !== segmento) return false;
      if (!q) return true;
      return u.name.toLowerCase().includes(q) || u.description.toLowerCase().includes(q);
    });
  }, [useCases, segmento, search]);

  const tabs = [
    { value: "todos", label: `Todos (${useCases.length})` },
    ...segmentos.map((s) => ({ value: s, label: `${s} (${useCases.filter((u) => u.segment === s).length})` })),
  ];

  const masUsado = useMemo(() => [...useCases].sort((a, b) => b.families - a.families)[0], [useCases]);

  return (
    <BlockFrame title="Casos de uso" icon="Lightbulb">
      <p className="mb-3 text-sm text-white/45">
        Situaciones reales donde esta solución genera valor y tranquilidad.
      </p>

      <PageTabs tabs={tabs} active={segmento} onChange={setSegmento} />

      <FilterToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar casos de uso…"
        filters={[]}
        values={{}}
        onFilterChange={() => undefined}
      />

      {visibles.length === 0 ? (
        <EmptyState
          icon="Lightbulb"
          title="Sin casos de uso"
          description="Ningún caso de uso de este plan coincide con lo que buscas."
        />
      ) : (
        <MediaCardGrid
          cards={visibles.map((u) => ({
            id: u.id,
            title: u.name,
            description: u.description,
            icon: u.icon,
            color: u.color,
            ribbon: u.id === masUsado?.id ? "Más utilizado" : undefined,
            tag: u.segment,
            countLabel: `${u.families} familias`,
            metaLabel: `${u.completion}% completado`,
          }))}
        />
      )}
    </BlockFrame>
  );
}

export function CasosSide({ ctx }: { ctx: SolutionContext }) {
  const { useCases } = ctx;

  const porImpacto = useMemo(() => {
    const niveles: (keyof typeof IMPACT_COLOR)[] = ["Muy Alto", "Alto", "Medio", "Bajo"];
    return niveles
      .map((n) => ({
        id: n,
        label: `${n} impacto`,
        value: useCases.filter((u) => u.impact === n).length,
        color: IMPACT_COLOR[n],
      }))
      .filter((s) => s.value > 0);
  }, [useCases]);

  const efectividad = useCases.length
    ? Math.round(useCases.reduce((acc, u) => acc + u.completion, 0) / useCases.length)
    : 0;

  const masAplicados = useMemo(
    () =>
      [...useCases]
        .sort((a, b) => b.families - a.families)
        .slice(0, 5)
        .map((u) => ({ id: u.id, label: u.name, value: u.families, color: u.color, ranked: true })),
    [useCases]
  );

  return (
    <>
      <BlockFrame title="Impacto de los casos de uso" icon="PieChart">
        {porImpacto.length === 0 ? (
          <p className="py-4 text-center text-sm text-white/35">Sin casos de uso.</p>
        ) : (
          <DonutChart slices={porImpacto} centerValue={`${efectividad}%`} centerLabel="Efectividad promedio" />
        )}
      </BlockFrame>

      <BlockFrame title="Casos de uso más aplicados" icon="Trophy">
        {masAplicados.length === 0 ? (
          <p className="py-4 text-center text-sm text-white/35">Sin casos de uso.</p>
        ) : (
          <KpiProgressList
            rows={masAplicados.map((c) => ({
              id: c.id,
              label: c.label,
              icon: "Lightbulb",
              value: `${c.value} familias`,
              percent: share(c.value, Math.max(...masAplicados.map((m) => m.value))),
            }))}
          />
        )}
      </BlockFrame>

      <BlockFrame title="Acciones rápidas" icon="Zap">
        <QuickActionGrid
          layout="list"
          columns={1}
          actions={[
            { id: "nuevo", icon: "Plus", label: "Crear nuevo caso de uso" },
            { id: "clonar", icon: "Copy", label: "Clonar caso existente" },
            { id: "asignar", icon: "UserPlus", label: "Asignar a familias" },
            { id: "catalogo", icon: "Lightbulb", label: "Ver todos los casos", href: "/soluciones/casos-de-uso" },
          ]}
          onSelect={() => toast.info("La gestión de casos de uso llega con su propia página.")}
        />
      </BlockFrame>
    </>
  );
}

// ── Familias asignadas ─────────────────────────────────────────────────────

export function FamiliasMain({ ctx }: { ctx: SolutionContext }) {
  const { assignments, families, rollup } = ctx;
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});

  /** La ficha del CRM, si la familia está cargada allí. */
  const fichaDe = useMemo(() => {
    const mapa = new Map(families.map((f) => [f.name, f]));
    return (nombre: string) => mapa.get(nombre);
  }, [families]);

  const visibles = useMemo(() => {
    const q = search.trim().toLowerCase();
    return assignments.filter((a) => {
      if (filters.estado && a.status !== filters.estado) return false;
      if (filters.asesor && a.advisor !== filters.asesor) return false;
      if (!q) return true;
      const ficha = fichaDe(a.familyName);
      return (
        a.familyName.toLowerCase().includes(q) ||
        (ficha?.primaryContact ?? "").toLowerCase().includes(q) ||
        (ficha?.location ?? "").toLowerCase().includes(q)
      );
    });
  }, [assignments, filters, search, fichaDe]);

  const proximas = assignments.filter((a) => a.daysToReview <= 30).length;

  const filas: RowData[] = visibles.map((a) => {
    const ficha = fichaDe(a.familyName);
    return {
      id: a.id,
      cells: {
        familia: { kind: "stacked", value: a.familyName, sub: ficha?.location ?? "Sin ficha en el CRM" },
        contacto: ficha
          ? { kind: "person", name: ficha.primaryContact, role: ficha.primaryEmail }
          : { kind: "text", value: "—" },
        estado: { kind: "status", value: a.status, tone: ASSIGNMENT_STATUS_TONE[a.status] },
        progreso: { kind: "progress", value: a.progress },
        cobertura: { kind: "text", value: a.coverage > 0 ? money(a.coverage) : "No aplica" },
        actividad: { kind: "stacked", value: a.lastActivity, sub: a.lastActivityNote },
        revision: { kind: "dateWithSub", value: a.nextReview, sub: `En ${a.daysToReview} días`, urgent: a.daysToReview <= 15 },
      },
    };
  });

  return (
    <>
      <KpiStrip
        layout="inline"
        items={[
          { id: "asignadas", label: "Familias asignadas", value: String(rollup.families), sub: "con este plan", icon: "Users", tone: "violet" },
          { id: "implementadas", label: "Implementadas", value: String(rollup.implemented), sub: `${share(rollup.implemented, rollup.assignments)}% del total`, icon: "CheckCircle2", tone: "emerald" },
          { id: "cobertura", label: "Cobertura total", value: money(rollup.coverage), sub: "suma asegurada", icon: "ShieldCheck", tone: "gold" },
          { id: "progreso", label: "Progreso promedio", value: `${rollup.progress}%`, sub: "de implementación", icon: "TrendingUp", tone: "blue", ring: rollup.progress },
          { id: "revisiones", label: "Revisiones próximas", value: String(proximas), sub: "en 30 días", icon: "CalendarClock", tone: "amber" },
          { id: "atencion", label: "Requieren atención", value: String(rollup.stalled), sub: "acciones pendientes", icon: "TriangleAlert", tone: rollup.stalled > 0 ? "rose" : "emerald" },
        ]}
      />

      <BlockFrame title="Familias asignadas a esta solución" icon="Users">
        <p className="mb-3 text-sm text-white/45">
          Los datos de contacto y la ciudad salen de la ficha del CRM: aquí no se copian.
        </p>

        <FilterToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Buscar familia, contacto o ciudad…"
          filters={[
            { id: "estado", label: "Estado", options: [...new Set(assignments.map((a) => a.status))] },
            { id: "asesor", label: "Asesor", options: [...new Set(assignments.map((a) => a.advisor))] },
          ]}
          values={filters}
          onFilterChange={(id, value) => setFilters((prev) => ({ ...prev, [id]: value }))}
        />

        {visibles.length === 0 ? (
          <EmptyState
            icon="Users"
            title="Sin familias"
            description="Ninguna familia con este plan coincide con lo que buscas."
          />
        ) : (
          <DataTable
            columns={[
              { id: "familia", header: "Familia", sortable: true },
              { id: "contacto", header: "Contacto principal", sortable: true },
              { id: "estado", header: "Estado", sortable: true, width: "180px" },
              { id: "progreso", header: "Progreso", sortable: true, width: "150px" },
              { id: "cobertura", header: "Cobertura", sortable: true, width: "130px" },
              { id: "actividad", header: "Última actividad", sortable: true, width: "170px" },
              { id: "revision", header: "Próxima revisión", sortable: true, width: "160px" },
            ]}
            rows={filas}
          />
        )}
      </BlockFrame>
    </>
  );
}

export function FamiliasSide({ ctx }: { ctx: SolutionContext }) {
  const { assignments } = ctx;

  const porEstado = useMemo(() => {
    const estados: AssignmentStatus[] = ["Implementado", "En Implementación", "En Proceso", "Requiere Atención", "Pausado"];
    return estados
      .map((e) => ({
        id: e,
        label: e,
        value: assignments.filter((a) => a.status === e).length,
        color: ASSIGNMENT_STATUS_COLOR[e],
      }))
      .filter((s) => s.value > 0);
  }, [assignments]);

  const porRango = useMemo(() => {
    const rangos = [
      { id: "alto", label: "Más de $1M", test: (v: number) => v > 1_000_000 },
      { id: "medio", label: "$500K – $1M", test: (v: number) => v > 500_000 && v <= 1_000_000 },
      { id: "bajo", label: "Menos de $500K", test: (v: number) => v > 0 && v <= 500_000 },
      { id: "sin", label: "Sin importe", test: (v: number) => v === 0 },
    ];
    return rangos
      .map((r) => ({
        id: r.id,
        label: r.label,
        icon: "ShieldCheck",
        value: String(assignments.filter((a) => r.test(a.coverage)).length),
        percent: share(assignments.filter((a) => r.test(a.coverage)).length, assignments.length),
      }))
      .filter((r) => r.value !== "0");
  }, [assignments]);

  const proximas = useMemo(
    () =>
      [...assignments]
        .sort((a, b) => a.daysToReview - b.daysToReview)
        .slice(0, 5)
        .map((a) => ({
          id: a.id,
          icon: "CalendarClock",
          color: a.daysToReview <= 15 ? "#f43f5e" : "#3b82f6",
          title: a.familyName,
          detail: a.nextReview,
          timeLabel: `En ${a.daysToReview} días`,
        })),
    [assignments]
  );

  return (
    <>
      <BlockFrame title="Distribución por estado" icon="PieChart">
        {porEstado.length === 0 ? (
          <p className="py-4 text-center text-sm text-white/35">Sin familias asignadas.</p>
        ) : (
          <DonutChart slices={porEstado} centerValue={String(assignments.length)} centerLabel="Total" />
        )}
      </BlockFrame>

      <BlockFrame title="Cobertura por rango" icon="BarChart3">
        {porRango.length === 0 ? (
          <p className="py-4 text-center text-sm text-white/35">Sin familias asignadas.</p>
        ) : (
          <KpiProgressList rows={porRango} />
        )}
      </BlockFrame>

      <BlockFrame title="Próximas revisiones" icon="CalendarClock">
        {proximas.length === 0 ? (
          <p className="py-4 text-center text-sm text-white/35">Sin revisiones programadas.</p>
        ) : (
          <ActivityFeed entries={proximas} compact />
        )}
      </BlockFrame>

      <BlockFrame title="Acciones rápidas" icon="Zap">
        <QuickActionGrid
          layout="list"
          columns={1}
          actions={[
            { id: "asignar", icon: "UserPlus", label: "Asignar nueva familia" },
            { id: "recordatorio", icon: "Bell", label: "Enviar recordatorio de revisión" },
            { id: "reporte", icon: "FileText", label: "Generar reporte de familias" },
            { id: "crm", icon: "Users", label: "Ver familias en el CRM", href: "/crm/familias" },
          ]}
          onSelect={() => toast.info("Esta acción llega con el editor de planes.")}
        />
      </BlockFrame>
    </>
  );
}

// ── Actividad ──────────────────────────────────────────────────────────────

export function ActividadMain({ ctx }: { ctx: SolutionContext }) {
  const { activities } = ctx;
  const [tipo, setTipo] = useState("todas");

  const visibles = useMemo(
    () => (tipo === "todas" ? activities : activities.filter((a) => a.kind === tipo)),
    [activities, tipo]
  );

  const tabs = [
    { value: "todas", label: `Todas (${activities.length})` },
    ...SOL_ACTIVITY_KINDS.filter((k) => activities.some((a) => a.kind === k)).map((k) => ({
      value: k,
      label: `${plural(k)} (${activities.filter((a) => a.kind === k).length})`,
    })),
  ];

  return (
    <BlockFrame title="Actividad reciente" icon="History">
      <p className="mb-3 text-sm text-white/45">Historial completo de actividades y actualizaciones de esta solución.</p>

      <PageTabs tabs={tabs} active={tipo} onChange={setTipo} />

      {visibles.length === 0 ? (
        <EmptyState
          icon="History"
          title="Sin actividad"
          description="Todavía no se ha registrado actividad de este tipo en la solución."
        />
      ) : (
        <ActivityFeed
          entries={visibles.map((a) => ({
            id: a.id,
            icon: SOL_ACTIVITY_META[a.kind].icon,
            color: SOL_ACTIVITY_META[a.kind].color,
            person: a.author,
            title: a.title,
            detail: a.detail,
            source: a.familyName,
            timeLabel: `${a.dayLabel} · ${a.time}`,
            tag: a.kind,
          }))}
        />
      )}
    </BlockFrame>
  );
}

export function ActividadSide({ ctx }: { ctx: SolutionContext }) {
  const { activities } = ctx;

  const porTipo = useMemo(
    () =>
      SOL_ACTIVITY_KINDS.map((k) => ({
        id: k,
        label: k,
        value: activities.filter((a) => a.kind === k).length,
        color: SOL_ACTIVITY_META[k].color,
      })).filter((s) => s.value > 0),
    [activities]
  );

  const resumen = useMemo(() => {
    const cuenta = (k: (typeof SOL_ACTIVITY_KINDS)[number]) => activities.filter((a) => a.kind === k).length;
    return [
      { id: "total", icon: "History", color: "#a78bfa", value: String(activities.length), label: "Actividades totales" },
      { id: "tareas", icon: "CheckSquare", color: "#22c55e", value: String(cuenta("Tarea")), label: "Tareas registradas" },
      { id: "docs", icon: "FileText", color: "#3b82f6", value: String(cuenta("Documento")), label: "Documentos movidos" },
      { id: "reuniones", icon: "CalendarDays", color: "#e0a836", value: String(cuenta("Reunión")), label: "Reuniones realizadas" },
    ];
  }, [activities]);

  const porAutor = useMemo(() => {
    const mapa = new Map<string, number>();
    activities.forEach((a) => mapa.set(a.author, (mapa.get(a.author) ?? 0) + 1));
    const max = Math.max(1, ...mapa.values());
    return [...mapa.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([autor, n]) => ({
        id: autor,
        label: autor,
        icon: "UserRound",
        value: String(n),
        percent: share(n, max),
      }));
  }, [activities]);

  return (
    <>
      <BlockFrame title="Resumen de actividad" icon="ClipboardList">
        <StatTileList tiles={resumen} columns={2} />
      </BlockFrame>

      <BlockFrame title="Actividad por tipo" icon="PieChart">
        {porTipo.length === 0 ? (
          <p className="py-4 text-center text-sm text-white/35">Sin actividad registrada.</p>
        ) : (
          <DonutChart slices={porTipo} centerValue={String(activities.length)} centerLabel="Total" />
        )}
      </BlockFrame>

      <BlockFrame title="Quién ha registrado más" icon="Users">
        {porAutor.length === 0 ? (
          <p className="py-4 text-center text-sm text-white/35">Sin actividad registrada.</p>
        ) : (
          <KpiProgressList rows={porAutor} />
        )}
      </BlockFrame>
    </>
  );
}
