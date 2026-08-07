"use client";

import { useMemo } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { BlockFrame } from "@/components/page-blocks/BlockFrame";
import { EmptyState } from "@/components/page-blocks/EmptyState";
import { KpiStrip } from "@/components/page-blocks/blocks/KpiStrip";
import { StepLadder } from "@/components/page-blocks/blocks/StepLadder";
import { ComponentPickList } from "@/components/page-blocks/blocks/ComponentPickList";
import { MediaCardGrid } from "@/components/page-blocks/blocks/MediaCardGrid";
import { DataTable, type RowData } from "@/components/page-blocks/blocks/DataTable";
import { DonutChart } from "@/components/page-blocks/blocks/DonutChart";
import { LineChart } from "@/components/page-blocks/blocks/TrendCharts";
import { InfoCard } from "@/components/page-blocks/blocks/InfoCard";
import { KpiProgressList } from "@/components/page-blocks/blocks/KpiProgressList";
import { QuickActionGrid } from "@/components/page-blocks/blocks/QuickActionGrid";
import { FileList, type FileKind } from "@/components/page-blocks/blocks/FileList";
import { InsightList } from "@/components/page-blocks/blocks/InsightList";
import { money, share } from "@/lib/solution-metrics";
import { TIER_TONE, type SolutionComponent } from "@/lib/solution-types";
import type { SolutionContext } from "@/components/pages/soluciones/solucion/context";

/** Un componente cuenta como incorporado al plan mientras no esté pendiente. */
const incorporado = (c: SolutionComponent) => c.status !== "Pendiente";

const ESTADO_TONE: Record<SolutionComponent["status"], "emerald" | "amber" | "blue" | "neutral"> = {
  Activo: "emerald",
  "En Proceso": "amber",
  Programado: "blue",
  Pendiente: "neutral",
};

/**
 * Curva ilustrativa: el módulo guarda el estado de hoy, no una serie
 * histórica. Determinista a partir del valor actual, para que no baile entre
 * repintados y se lea como lo que es —decoración con la escala correcta.
 */
function serie(valor: number, puntos: number, arranque = 0.55): number[] {
  const base = Math.max(valor, 1);
  return Array.from({ length: puntos }, (_, i) => {
    const avance = arranque + (1 - arranque) * (i / (puntos - 1));
    const onda = Math.sin(i * 0.9) * 0.03;
    return Math.round(base * (avance + onda));
  });
}

const MESES = ["Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic", "Ene", "Feb", "Mar", "Abr", "May"];

// ── Resumen ────────────────────────────────────────────────────────────────

export function ResumenMain({ ctx }: { ctx: SolutionContext }) {
  const { solution, rollup, useCases } = ctx;

  const destacados = useMemo(
    () =>
      [...useCases]
        .sort((a, b) => b.families - a.families)
        .slice(0, 4)
        .map((u, i) => ({
          id: u.id,
          title: u.name,
          description: u.description,
          icon: u.icon,
          color: u.color,
          ribbon: i === 0 ? "Más utilizado" : undefined,
          tag: u.segment,
          countLabel: `${u.families} familias`,
          metaLabel: `${u.completion}% completado`,
        })),
    [useCases]
  );

  return (
    <>
      <KpiStrip
        layout="inline"
        items={[
          { id: "familias", label: "Familias protegidas", value: String(rollup.families), sub: "con este plan", icon: "Users", tone: "violet" },
          { id: "cobertura", label: "Cobertura total", value: money(rollup.coverage), sub: "suma asegurada", icon: "ShieldCheck", tone: "gold" },
          { id: "avance", label: "Índice de implementación", value: `${rollup.progress}%`, sub: "promedio del plan", icon: "TrendingUp", tone: "emerald", ring: rollup.progress },
          { id: "completas", label: "Implementaciones completas", value: String(rollup.implemented), sub: `${share(rollup.implemented, rollup.assignments)}% del total`, icon: "CheckCircle2", tone: "blue" },
          { id: "atencion", label: "Requieren atención", value: String(rollup.stalled), sub: "pausadas o bloqueadas", icon: "TriangleAlert", tone: rollup.stalled > 0 ? "rose" : "emerald" },
        ]}
      />

      <BlockFrame title="Objetivo del plan" icon="Target">
        <p className="text-sm leading-relaxed text-white/70">{solution.objective}</p>
        <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {solution.features.map((f) => (
            <li key={f} className="flex items-start gap-2 rounded-lg border border-white/8 bg-white/[0.02] px-2.5 py-2 text-xs text-white/65">
              <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ background: solution.color }} />
              <span className="min-w-0">{f}</span>
            </li>
          ))}
        </ul>
      </BlockFrame>

      <BlockFrame title="Casos de uso más aplicados" icon="Lightbulb">
        {destacados.length === 0 ? (
          <EmptyState
            icon="Lightbulb"
            title="Sin casos de uso"
            description="Cuando se registre el primer caso de uso de este plan, aparecerá aquí."
          />
        ) : (
          <MediaCardGrid cards={destacados} />
        )}
      </BlockFrame>
    </>
  );
}

export function ResumenSide({ ctx }: { ctx: SolutionContext }) {
  const { solution, useCases, documents, rollup } = ctx;

  const populares = useMemo(() => {
    const total = useCases.reduce((acc, u) => acc + u.families, 0);
    return [...useCases]
      .sort((a, b) => b.families - a.families)
      .slice(0, 5)
      // `KpiProgressList` ya escribe el porcentaje junto a la barra: el valor
      // de la izquierda tiene que aportar otra cosa, no repetirlo.
      .map((u) => ({
        id: u.id,
        label: u.name,
        icon: u.icon,
        value: `${u.families} familias`,
        percent: share(u.families, total),
      }));
  }, [useCases]);

  const clave = useMemo(
    () =>
      documents.slice(0, 4).map((d) => ({
        id: d.id,
        name: d.name,
        kind: (d.format === "XLSX" ? "sheet" : d.format === "PDF" ? "pdf" : "doc") as FileKind,
        meta: `${d.format} · ${d.size}`,
        tag: d.category,
      })),
    [documents]
  );

  return (
    <>
      <BlockFrame title="Resumen de la solución" icon="Info">
        <InfoCard
          rows={[
            { label: "Estado", value: solution.status, tone: solution.status === "Activo" ? "emerald" : "amber" },
            { label: "Tipo de plan", value: solution.kind },
            { label: "Nivel de complejidad", value: solution.complexityLabel, dots: solution.complexity, dotsColor: solution.color },
            { label: "Duración recomendada", value: solution.reviewCadence },
            { label: "Público objetivo", value: solution.audience },
            { label: "Familias con el plan", value: String(rollup.families) },
          ]}
        />
      </BlockFrame>

      <BlockFrame title="Casos de uso populares" icon="Lightbulb">
        {populares.length === 0 ? (
          <p className="py-4 text-center text-sm text-white/35">Sin casos de uso registrados.</p>
        ) : (
          <KpiProgressList rows={populares} />
        )}
      </BlockFrame>

      <BlockFrame title="Acciones rápidas" icon="Zap">
        <QuickActionGrid
          layout="list"
          columns={1}
          actions={[
            { id: "version", icon: "Copy", label: "Crear nueva versión del plan" },
            { id: "asignar", icon: "UserPlus", label: "Asignar a una familia" },
            { id: "propuesta", icon: "FileText", label: "Generar propuesta" },
            { id: "comparar", icon: "Scale", label: "Comparar con otro plan", href: "/soluciones/comparador" },
          ]}
          onSelect={() => toast.info("Esta acción llega con el editor de planes.")}
        />
      </BlockFrame>

      <BlockFrame title="Documentos clave" icon="FileText">
        {clave.length === 0 ? (
          <p className="py-4 text-center text-sm text-white/35">Este plan aún no tiene documentos.</p>
        ) : (
          <FileList files={clave} />
        )}
      </BlockFrame>
    </>
  );
}

// ── Constructor de Solución ────────────────────────────────────────────────

export function ConstructorMain({ ctx }: { ctx: SolutionContext }) {
  const { solution, onToggleStep, onAddComponent } = ctx;

  const recomendados = useMemo(
    () =>
      solution.components.map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        icon: c.icon,
        color: c.color,
        tier: c.tier,
        tierTone: TIER_TONE[c.tier],
        valueLabel: c.coverageLabel ?? "Estado",
        value: c.coverage,
        included: incorporado(c),
        statusLabel: c.statusNote,
      })),
    [solution.components]
  );

  return (
    <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1fr_400px]">
      <BlockFrame title="Constructor de solución" icon="ListOrdered">
        <p className="mb-3 text-sm text-white/45">
          La metodología paso a paso para diseñar la mejor estrategia para cada familia.
        </p>
        <StepLadder steps={solution.steps} showProgress onToggle={onToggleStep} />
      </BlockFrame>

      <BlockFrame title="Componentes recomendados" icon="Boxes">
        <p className="mb-3 text-sm text-white/45">Herramientas y estrategias que conforman esta solución.</p>
        <ComponentPickList items={recomendados} onAdd={onAddComponent} />
      </BlockFrame>
    </div>
  );
}

export const ConstructorSide = ResumenSide;

// ── Componentes ────────────────────────────────────────────────────────────

export function ComponentesMain({ ctx }: { ctx: SolutionContext }) {
  const { solution, rollup, onAddComponent } = ctx;
  const componentes = solution.components;

  const activos = componentes.filter((c) => c.status === "Activo").length;
  const dentro = componentes.filter(incorporado).length;
  const esenciales = componentes.filter((c) => c.tier === "Esencial").length;

  const filas: RowData[] = componentes.map((c) => ({
    id: c.id,
    cells: {
      componente: { kind: "source", icon: c.icon, value: c.name, sub: c.description },
      tipo: { kind: "badge", value: c.tier, tone: TIER_TONE[c.tier] },
      rol: { kind: "text", value: c.role },
      estado: { kind: "status", value: c.status, tone: ESTADO_TONE[c.status] },
      cobertura: c.coverage
        ? { kind: "stacked", value: c.coverage, sub: c.coverageLabel ?? "" }
        : { kind: "text", value: "No aplica", sub: c.coverageLabel ?? "" },
      prioridad: { kind: "dots", value: c.priority, label: c.priorityLabel, color: solution.color },
    },
  }));

  return (
    <>
      <KpiStrip
        layout="inline"
        items={[
          { id: "total", label: "Componentes totales", value: String(componentes.length), sub: `${esenciales} esenciales`, icon: "Boxes", tone: "violet" },
          { id: "activos", label: "Componentes activos", value: String(activos), sub: `${share(activos, componentes.length)}% del plan`, icon: "CheckCircle2", tone: "emerald" },
          { id: "dentro", label: "Incorporados al plan", value: String(dentro), sub: `${componentes.length - dentro} pendientes`, icon: "PackageCheck", tone: "blue" },
          { id: "cobertura", label: "Cobertura total", value: money(rollup.coverage), sub: "suma asegurada", icon: "ShieldCheck", tone: "gold" },
          { id: "familias", label: "Familias con el plan", value: String(rollup.families), sub: `${rollup.progress}% de avance`, icon: "Users", tone: "amber" },
        ]}
      />

      <BlockFrame title="Componentes del plan" icon="Boxes">
        <p className="mb-3 text-sm text-white/45">
          Los componentes que conforman la estrategia de {solution.name}, con su papel y su estado.
        </p>
        <DataTable
          columns={[
            { id: "componente", header: "Componente", sortable: true },
            { id: "tipo", header: "Tipo", sortable: true, width: "130px" },
            { id: "rol", header: "Rol en el plan", sortable: true },
            { id: "estado", header: "Estado", sortable: true, width: "140px" },
            { id: "cobertura", header: "Cobertura / Valor", sortable: true, width: "160px" },
            { id: "prioridad", header: "Prioridad", sortable: true, width: "160px" },
          ]}
          rows={filas}
        />

        <div className="mt-3 flex flex-wrap items-center gap-3 rounded-xl border border-dashed border-white/12 px-4 py-3.5">
          <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white/[0.05] text-[var(--allpa-gold-300)]">
            <Plus className="h-4 w-4" />
          </span>
          <p className="min-w-0 flex-1 text-sm text-white/55">
            <span className="font-medium text-[#f3ecd9]">Agregar componente.</span> Los pendientes se incorporan desde la
            pestaña Constructor de Solución.
          </p>
          <span className="text-xs tabular-nums text-white/35">
            {dentro} de {componentes.length} componentes utilizados
          </span>
        </div>
      </BlockFrame>

      {componentes.some((c) => !incorporado(c)) && (
        <BlockFrame title="Todavía fuera del plan" icon="PackagePlus">
          <ComponentPickList
            items={componentes
              .filter((c) => !incorporado(c))
              .map((c) => ({
                id: c.id,
                name: c.name,
                description: c.description,
                icon: c.icon,
                color: c.color,
                tier: c.tier,
                tierTone: TIER_TONE[c.tier],
                valueLabel: c.coverageLabel ?? "Estado",
                value: c.coverage,
                included: false,
                statusLabel: c.statusNote,
              }))}
            onAdd={onAddComponent}
          />
        </BlockFrame>
      )}
    </>
  );
}

export function ComponentesSide({ ctx }: { ctx: SolutionContext }) {
  const { solution, rollup } = ctx;
  const componentes = solution.components;

  const porEstado = useMemo(() => {
    const cuenta = (estado: SolutionComponent["status"]) => componentes.filter((c) => c.status === estado).length;
    return [
      { id: "activos", label: "Activos", value: cuenta("Activo"), color: "#22c55e" },
      { id: "proceso", label: "En proceso", value: cuenta("En Proceso"), color: "#e0a836" },
      { id: "programados", label: "Programados", value: cuenta("Programado"), color: "#3b82f6" },
      { id: "pendientes", label: "Pendientes", value: cuenta("Pendiente"), color: "#a78bfa" },
    ].filter((s) => s.value > 0);
  }, [componentes]);

  const activos = componentes.filter((c) => c.status === "Activo").length;

  const porRol = useMemo(
    () =>
      componentes
        .filter((c) => c.status === "Activo")
        .map((c) => ({
          id: c.id,
          label: c.role,
          icon: c.icon,
          value: c.priorityLabel,
          percent: c.priority * 20,
        })),
    [componentes]
  );

  return (
    <>
      <BlockFrame title="Progreso por componente" icon="PieChart">
        <DonutChart
          slices={porEstado}
          centerValue={`${share(activos, componentes.length)}%`}
          centerLabel="Implementado"
        />
      </BlockFrame>

      <BlockFrame title="Peso de cada rol" icon="Scale">
        {porRol.length === 0 ? (
          <p className="py-4 text-center text-sm text-white/35">Ningún componente está activo todavía.</p>
        ) : (
          <KpiProgressList rows={porRol} />
        )}
      </BlockFrame>

      <BlockFrame title="Información clave" icon="Info">
        <InfoCard
          rows={[
            { label: "Cobertura total", value: money(rollup.coverage) },
            { label: "Próxima revisión", value: solution.reviewCadence },
            { label: "Nivel de complejidad", value: solution.complexityLabel, dots: solution.complexity, dotsColor: solution.color },
            { label: "Componentes esenciales", value: String(componentes.filter((c) => c.tier === "Esencial").length) },
            { label: "Familias con el plan", value: String(rollup.families) },
          ]}
        />
      </BlockFrame>
    </>
  );
}

// ── Análisis ───────────────────────────────────────────────────────────────

/** Tramos del índice de cobertura, según lo implementado en cada familia. */
const TRAMOS = [
  { id: "excelente", label: "Excelente (90%+)", min: 90, color: "#22c55e" },
  { id: "bueno", label: "Bueno (70% – 89%)", min: 70, color: "#3b82f6" },
  { id: "regular", label: "Regular (50% – 69%)", min: 50, color: "#e0a836" },
  { id: "bajo", label: "Bajo (menos de 50%)", min: 0, color: "#f43f5e" },
];

function tramoDe(progreso: number) {
  return TRAMOS.find((t) => progreso >= t.min) ?? TRAMOS[TRAMOS.length - 1];
}

export function AnalisisMain({ ctx }: { ctx: SolutionContext }) {
  const { solution, assignments, rollup } = ctx;

  const cobertura = useMemo(
    () =>
      TRAMOS.map((t) => ({
        id: t.id,
        label: t.label,
        value: assignments.filter((a) => tramoDe(a.progress).id === t.id).length,
        color: t.color,
      })).filter((s) => s.value > 0),
    [assignments]
  );

  const media = rollup.assignments ? Math.round(rollup.coverage / rollup.assignments) : 0;

  const evolucion = useMemo(() => {
    const familias = serie(rollup.families, MESES.length, 0.5);
    const avance = serie(rollup.progress, MESES.length, 0.7);
    return MESES.map((mes, i) => ({ mes, familias: familias[i], avance: avance[i] }));
  }, [rollup.families, rollup.progress]);

  /** Las brechas del plan son sus componentes sin activar. */
  const brechas: RowData[] = useMemo(
    () =>
      solution.components
        .filter((c) => c.status !== "Activo")
        .map((c) => ({
          id: c.id,
          cells: {
            hallazgo: { kind: "source", icon: c.icon, value: c.name },
            descripcion: { kind: "text", value: c.description },
            rol: { kind: "text", value: c.role },
            estado: { kind: "status", value: c.status, tone: ESTADO_TONE[c.status] },
            prioridad: { kind: "dots", value: c.priority, label: c.priorityLabel, color: solution.color },
          },
        })),
    [solution.components, solution.color]
  );

  return (
    <>
      <KpiStrip
        layout="inline"
        items={[
          { id: "analizadas", label: "Familias analizadas", value: String(rollup.families), sub: "con este plan", icon: "Users", tone: "violet" },
          { id: "media", label: "Cobertura promedio", value: money(media), sub: "por familia", icon: "ShieldCheck", tone: "blue" },
          { id: "indice", label: "Índice de cobertura", value: `${rollup.progress}%`, sub: "promedio del plan", icon: "Gauge", tone: "emerald", ring: rollup.progress },
          { id: "criticas", label: "Casos con brechas", value: String(rollup.stalled), sub: "requieren atención", icon: "TriangleAlert", tone: rollup.stalled > 0 ? "rose" : "emerald" },
          { id: "recomendaciones", label: "Componentes por activar", value: String(solution.components.filter((c) => c.status !== "Activo").length), sub: "oportunidades", icon: "Lightbulb", tone: "amber" },
        ]}
      />

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        <BlockFrame title="Evolución del plan" icon="TrendingUp">
          <p className="mb-2 text-xs text-white/35">
            Curva ilustrativa: el módulo guarda el estado actual, no una serie histórica.
          </p>
          <LineChart
            data={evolucion}
            categoryKey="mes"
            series={[
              { key: "familias", label: "Familias con el plan", color: solution.color },
              { key: "avance", label: "Avance medio (%)", color: "#22c55e", dashed: true },
            ]}
          />
        </BlockFrame>

        <BlockFrame title="Distribución del índice de cobertura" icon="PieChart">
          <p className="mb-2 text-sm text-white/45">¿Qué tan implementado está el plan en cada familia?</p>
          {cobertura.length === 0 ? (
            <EmptyState icon="PieChart" title="Sin familias asignadas" description="Este plan todavía no se ha aplicado a ninguna familia." />
          ) : (
            <DonutChart slices={cobertura} centerValue={String(rollup.assignments)} centerLabel="Familias" />
          )}
        </BlockFrame>
      </div>

      <BlockFrame title="Brechas identificadas en el plan" icon="Search">
        {brechas.length === 0 ? (
          <EmptyState
            icon="CheckCircle2"
            title="Sin brechas"
            description="Todos los componentes de este plan están activos."
          />
        ) : (
          <DataTable
            columns={[
              { id: "hallazgo", header: "Componente", sortable: true },
              { id: "descripcion", header: "Descripción" },
              { id: "rol", header: "Rol en el plan", sortable: true },
              { id: "estado", header: "Estado", sortable: true, width: "140px" },
              { id: "prioridad", header: "Prioridad", sortable: true, width: "160px" },
            ]}
            rows={brechas}
          />
        )}
      </BlockFrame>
    </>
  );
}

export function AnalisisSide({ ctx }: { ctx: SolutionContext }) {
  const { solution, assignments, rollup } = ctx;

  const resumen = useMemo(() => {
    const conBrechas = assignments.filter((a) => a.progress < 70).length;
    const criticas = assignments.filter((a) => a.status === "Requiere Atención").length;
    const mejora = assignments.filter((a) => a.status === "En Implementación").length;
    const sinBrechas = assignments.filter((a) => a.progress >= 90).length;
    return [
      { id: "brechas", label: "Familias con brechas", icon: "TriangleAlert", value: `${conBrechas} (${share(conBrechas, assignments.length)}%)` },
      { id: "criticas", label: "Brechas críticas", icon: "OctagonAlert", value: `${criticas} (${share(criticas, assignments.length)}%)` },
      { id: "mejora", label: "En proceso de mejora", icon: "TrendingUp", value: `${mejora} (${share(mejora, assignments.length)}%)` },
      { id: "sin", label: "Sin brechas", icon: "CheckCircle2", value: `${sinBrechas} (${share(sinBrechas, assignments.length)}%)` },
    ];
  }, [assignments]);

  const porActivar = useMemo(
    () =>
      solution.components
        .filter((c) => c.status !== "Activo")
        .map((c) => ({
          id: c.id,
          label: c.name,
          icon: c.icon,
          value: c.priorityLabel,
          percent: c.priority * 20,
        })),
    [solution.components]
  );

  const hallazgos = useMemo(() => {
    const out = [];
    const peor = [...assignments].sort((a, b) => a.progress - b.progress)[0];
    if (peor) {
      out.push({
        id: "peor",
        icon: "TriangleAlert",
        color: "#f43f5e",
        text: `${peor.familyName} es la que menos ha avanzado con este plan: ${peor.progress}% (${peor.lastActivityNote.toLowerCase()}).`,
      });
    }
    const pendientes = solution.components.filter((c) => c.status === "Pendiente").length;
    if (pendientes > 0) {
      out.push({
        id: "pendientes",
        icon: "Boxes",
        color: "#e0a836",
        text: `Quedan ${pendientes} componentes sin incorporar al plan; activarlos subiría la cobertura ofrecida.`,
      });
    }
    if (rollup.assignments > 0) {
      out.push({
        id: "avance",
        icon: "Gauge",
        color: "#22c55e",
        text: `El plan está implementado al ${rollup.progress}% de media, con ${rollup.implemented} de ${rollup.assignments} familias completas.`,
      });
    }
    return out;
  }, [assignments, solution.components, rollup]);

  return (
    <>
      <BlockFrame title="Resumen del análisis" icon="ClipboardList">
        <KpiProgressList rows={resumen} />
      </BlockFrame>

      <BlockFrame title="Componentes por activar" icon="Boxes">
        {porActivar.length === 0 ? (
          <p className="py-4 text-center text-sm text-white/35">Todos los componentes están activos.</p>
        ) : (
          <KpiProgressList rows={porActivar} />
        )}
      </BlockFrame>

      <BlockFrame title="Hallazgos" icon="Lightbulb">
        <InsightList insights={hallazgos} />
      </BlockFrame>

      <BlockFrame title="Acciones sugeridas" icon="Zap">
        <QuickActionGrid
          layout="list"
          columns={1}
          actions={[
            { id: "revisar", icon: "Search", label: "Revisar familias con brechas" },
            { id: "activar", icon: "Boxes", label: "Activar componentes pendientes" },
            { id: "presentar", icon: "FileText", label: "Presentar recomendaciones" },
            { id: "seguimiento", icon: "CalendarClock", label: "Programar seguimiento" },
          ]}
          onSelect={() => toast.info("Esta acción llega con el editor de planes.")}
        />
      </BlockFrame>
    </>
  );
}
