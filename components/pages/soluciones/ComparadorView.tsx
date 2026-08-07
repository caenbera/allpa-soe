"use client";

import { useMemo, useState } from "react";
import { Info, Plus, Save, X } from "lucide-react";
import { toast } from "sonner";
import { PageShell, PageTabs } from "@/components/page-blocks/PageShell";
import { AddBlockDialog } from "@/components/page-blocks/AddBlockDialog";
import { useBlockComposer } from "@/components/page-blocks/use-block-composer";
import { BlockFrame } from "@/components/page-blocks/BlockFrame";
import { EmptyState, LoadingState } from "@/components/page-blocks/EmptyState";
import { ComparisonTable, type ComparisonRow } from "@/components/page-blocks/blocks/ComparisonTable";
import { ParameterForm, type ParameterField } from "@/components/page-blocks/blocks/ParameterForm";
import { StatTileList } from "@/components/page-blocks/blocks/StatTileList";
import { QuickActionGrid } from "@/components/page-blocks/blocks/QuickActionGrid";
import { NavTileGrid } from "@/components/page-blocks/blocks/NavTileGrid";
import { InsightList } from "@/components/page-blocks/blocks/InsightList";
import { Button } from "@/components/ui/button";
import { useContent } from "@/lib/use-content";
import { usePageConfig } from "@/lib/use-page-config";
import { ATRIBUTOS_POR_TIPO, dinero, dineroEntero, mejorOpcion, simular } from "@/lib/solution-calc";
import {
  CLIENT_PROFILES,
  COVERAGE_LEVELS,
  SOL_COLLECTIONS,
  type ClientProfileId,
  type CoverageLevel,
  type SolComparison,
  type Solution,
} from "@/lib/solution-types";

const TABS = [
  { value: "comparar", label: "Comparar soluciones" },
  { value: "guardadas", label: "Comparaciones guardadas" },
];

/** Como mucho cuatro columnas: más no cabe sin volverse ilegible. */
const MAXIMO = 4;

const INICIAL = {
  profile: "familia-joven" as ClientProfileId,
  age: 35,
  dependents: 2,
  monthlyIncome: 5000,
  level: "Medio" as CoverageLevel,
};

export function ComparadorView() {
  const solutions = useContent<Solution>(SOL_COLLECTIONS.solutions);
  const comparisons = useContent<SolComparison>(SOL_COLLECTIONS.comparisons);

  const { blocks, addBlock, updateBlock, removeBlock } = usePageConfig("/soluciones/comparador");
  const composer = useBlockComposer(addBlock);

  const [tab, setTab] = useState("comparar");
  const [slugs, setSlugs] = useState<string[] | null>(null);
  const [params, setParams] = useState(INICIAL);

  const planes = useMemo(() => [...solutions.items].sort((a, b) => a.order - b.order), [solutions.items]);

  /** Al entrar se comparan los tres primeros planes del catálogo. */
  const elegidos = useMemo(() => slugs ?? planes.slice(0, 3).map((s) => s.slug), [slugs, planes]);

  const comparadas = useMemo(
    () => elegidos.map((slug) => planes.find((p) => p.slug === slug)).filter((s): s is Solution => Boolean(s)),
    [elegidos, planes]
  );

  /** Una simulación por solución, todas con los mismos supuestos. */
  const resultados = useMemo(
    () => comparadas.map((s) => ({ solution: s, sim: simular(params, s.kind) })),
    [comparadas, params]
  );

  const mejor = useMemo(
    () =>
      mejorOpcion(
        resultados.map((r) => ({ slug: r.solution.slug, cobertura: r.sim.cobertura, primaMensual: r.sim.primaMensual }))
      ),
    [resultados]
  );

  const campos: ParameterField[] = [
    {
      kind: "select",
      id: "profile",
      label: "Perfil del cliente",
      value: params.profile,
      options: CLIENT_PROFILES.map((p) => ({ value: p.id, label: p.label })),
    },
    { kind: "number", id: "age", label: "Edad del titular", value: params.age, min: 18, max: 80, suffix: "años" },
    { kind: "stepper", id: "dependents", label: "Dependientes", value: params.dependents, min: 0, max: 10 },
    { kind: "currency", id: "monthlyIncome", label: "Ingreso mensual del hogar", value: params.monthlyIncome },
    {
      kind: "segmented",
      id: "level",
      label: "Nivel de cobertura deseado",
      value: params.level,
      options: COVERAGE_LEVELS,
    },
  ];

  const quitar = (slug: string) => setSlugs(elegidos.filter((s) => s !== slug));
  const agregar = (slug: string) => {
    if (elegidos.includes(slug)) return;
    if (elegidos.length >= MAXIMO) {
      toast.info(`Se pueden comparar hasta ${MAXIMO} soluciones a la vez.`);
      return;
    }
    setSlugs([...elegidos, slug]);
  };

  const guardar = async () => {
    if (comparadas.length === 0) return;
    await comparisons.add({
      name: `${CLIENT_PROFILES.find((p) => p.id === params.profile)?.label} · ${comparadas.length} soluciones`,
      date: new Date().toLocaleDateString("es", { day: "2-digit", month: "short", year: "numeric" }),
      solutionSlugs: elegidos,
      order: comparisons.items.length,
    } as Omit<SolComparison, "id">);
    toast.success("Comparación guardada.");
  };

  const filas: ComparisonRow[] = [
    {
      id: "prima",
      label: "Prima mensual estimada",
      hint: "Con los mismos supuestos para todas",
      cells: resultados.map((r) => ({ kind: "amount" as const, value: dinero(r.sim.primaMensual) })),
    },
    {
      id: "anual",
      label: "Prima anual",
      cells: resultados.map((r) => ({ kind: "text" as const, value: dinero(r.sim.primaAnual) })),
    },
    {
      id: "cobertura",
      label: "Nivel de cobertura",
      hint: "Parte de la necesidad que cubre",
      cells: resultados.map((r) => ({ kind: "percent" as const, value: r.sim.cobertura, badge: params.level })),
    },
    {
      id: "suma",
      label: "Suma asegurada",
      cells: resultados.map((r) => ({ kind: "text" as const, value: dineroEntero(r.sim.sumaAsegurada) })),
    },
    {
      id: "coberturas",
      label: "Coberturas principales",
      cells: resultados.map((r) => ({ kind: "checks" as const, items: r.sim.coberturas.map((c) => c.label) })),
    },
    {
      id: "beneficios",
      label: "Prestaciones destacadas",
      cells: resultados.map((r) => ({ kind: "checks" as const, items: r.solution.features.slice(0, 3) })),
    },
    {
      id: "rentabilidad",
      label: "Rentabilidad estimada",
      hint: "Atributo declarado del producto",
      cells: resultados.map((r) => {
        const a = ATRIBUTOS_POR_TIPO[r.solution.kind];
        return a.rentabilidad > 0
          ? { kind: "text" as const, value: `${a.rentabilidad}% anual`, badge: a.perfil }
          : { kind: "text" as const, value: "—", badge: a.perfil };
      }),
    },
    {
      id: "liquidez",
      label: "Liquidez",
      cells: resultados.map((r) => {
        const a = ATRIBUTOS_POR_TIPO[r.solution.kind];
        return { kind: "dots" as const, value: a.liquidez, label: NIVEL_TEXTO[a.liquidez] };
      }),
    },
    {
      id: "flexibilidad",
      label: "Flexibilidad",
      cells: resultados.map((r) => {
        const a = ATRIBUTOS_POR_TIPO[r.solution.kind];
        return { kind: "dots" as const, value: a.flexibilidad, label: NIVEL_TEXTO[a.flexibilidad] };
      }),
    },
    {
      id: "complejidad",
      label: "Complejidad del plan",
      cells: resultados.map((r) => ({ kind: "dots" as const, value: r.solution.complexity, label: r.solution.complexityLabel })),
    },
  ];

  const rangoPrima = resultados.length
    ? `${dinero(Math.min(...resultados.map((r) => r.sim.primaMensual)))} – ${dinero(Math.max(...resultados.map((r) => r.sim.primaMensual)))}`
    : "—";

  const planMejor = comparadas.find((s) => s.slug === mejor);

  const hallazgos = useMemo(() => {
    if (resultados.length < 2) return [];
    const barata = [...resultados].sort((a, b) => a.sim.primaMensual - b.sim.primaMensual)[0];
    const cara = [...resultados].sort((a, b) => b.sim.primaMensual - a.sim.primaMensual)[0];
    const out = [
      {
        id: "rango",
        icon: "Wallet",
        color: "#a78bfa",
        text: `${barata.solution.name} es la opción más económica con ${dinero(barata.sim.primaMensual)} al mes; ${cara.solution.name} es la más cara con ${dinero(cara.sim.primaMensual)}.`,
      },
    ];
    if (planMejor) {
      out.push({
        id: "mejor",
        icon: "Star",
        color: "#e0a836",
        text: `${planMejor.name} da la mayor cobertura por cada dólar de prima con estos supuestos, que es el criterio con el que se marca la mejor opción.`,
      });
    }
    return out;
  }, [resultados, planMejor]);

  const sidePanel = (
    <>
      <BlockFrame title="Resumen de la comparación" icon="ClipboardList">
        <StatTileList
          columns={2}
          tiles={[
            { id: "cuantas", icon: "Scale", color: "#a78bfa", value: String(comparadas.length), label: "Soluciones comparadas" },
            { id: "rango", icon: "Wallet", color: "#22c55e", value: rangoPrima, label: "Rango de prima mensual" },
            { id: "cobertura", icon: "ShieldCheck", color: "#3b82f6", value: `${resultados[0]?.sim.cobertura ?? 0}%`, label: "Nivel de cobertura" },
            { id: "nivel", icon: "Gauge", color: "#e0a836", value: params.level, label: "Nivel elegido" },
          ]}
        />
      </BlockFrame>

      {planMejor && (
        <BlockFrame title="Recomendación" icon="Star">
          <div className="flex items-start gap-2.5">
            <span
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
              style={{ background: `${planMejor.color}1f`, color: planMejor.color }}
            >
              <span className="text-sm font-semibold">{planMejor.name.charAt(0)}</span>
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#f3ecd9]">{planMejor.name}</p>
              <p className="mt-1 text-xs leading-relaxed text-white/50">
                Ofrece la mayor cobertura por cada dólar de prima con los supuestos elegidos.
              </p>
            </div>
          </div>
        </BlockFrame>
      )}

      <BlockFrame title="Hallazgos" icon="Lightbulb">
        <InsightList insights={hallazgos} />
      </BlockFrame>

      <BlockFrame title="Acciones rápidas" icon="Zap">
        <QuickActionGrid
          layout="list"
          columns={1}
          actions={[
            { id: "guardar", icon: "Save", label: "Guardar esta comparación" },
            { id: "calc", icon: "Calculator", label: "Abrir la calculadora", href: "/soluciones/calculadora" },
            { id: "planes", icon: "Layers", label: "Ver planes patrimoniales", href: "/soluciones/planes-patrimoniales" },
          ]}
          onSelect={(id) => (id === "guardar" ? guardar() : undefined)}
        />
      </BlockFrame>
    </>
  );

  return (
    <PageShell
      title="Comparador de Soluciones"
      description="Compara diferentes soluciones para encontrar la mejor opción para tus clientes."
      icon="Scale"
      sidePanel={sidePanel}
      blocks={{ items: blocks, onUpdate: updateBlock, onDelete: removeBlock, onAdd: composer.openFor }}
      headerActions={
        <>
          <Button
            variant="outline"
            size="sm"
            className="border-white/12 bg-white/[0.03] text-white/70 hover:bg-white/[0.06]"
            onClick={() => {
              setSlugs(planes.slice(0, 3).map((s) => s.slug));
              setParams(INICIAL);
            }}
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Nueva comparación
          </Button>
          <Button size="sm" onClick={guardar} disabled={comparadas.length === 0}>
            <Save className="mr-1.5 h-3.5 w-3.5" />
            Guardar comparación
          </Button>
        </>
      }
    >
      <PageTabs tabs={TABS} active={tab} onChange={setTab} />

      {solutions.loading ? (
        <div className="surface-card">
          <LoadingState />
        </div>
      ) : planes.length === 0 ? (
        <div className="surface-card">
          <EmptyState
            icon="Scale"
            title="No hay soluciones que comparar"
            description="El comparador necesita al menos dos planes patrimoniales en el catálogo."
          />
        </div>
      ) : tab === "comparar" ? (
        <>
          <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1fr_360px]">
            <BlockFrame title="Soluciones a comparar" icon="Scale">
              <p className="mb-3 text-sm text-white/45">Selecciona hasta {MAXIMO} soluciones.</p>

              <div className="mb-3 flex flex-wrap gap-2">
                {comparadas.map((s) => (
                  <span
                    key={s.slug}
                    className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-sm"
                    style={{ borderColor: `${s.color}59`, background: `${s.color}14`, color: s.color }}
                  >
                    {s.name}
                    <button type="button" onClick={() => quitar(s.slug)} aria-label={`Quitar ${s.name}`}>
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
                {comparadas.length === 0 && <p className="text-sm text-white/35">Ninguna solución seleccionada.</p>}
              </div>

              <NavTileGrid
                columns={2}
                tiles={planes
                  .filter((s) => !elegidos.includes(s.slug))
                  .map((s) => ({
                    id: s.slug,
                    icon: s.icon,
                    color: s.color,
                    title: s.name,
                    subtitle: s.kind,
                  }))}
                onSelect={agregar}
              />
            </BlockFrame>

            <BlockFrame title="Supuestos del escenario" icon="SlidersHorizontal">
              <p className="mb-3 text-sm text-white/45">Se aplican por igual a todas las soluciones comparadas.</p>
              <ParameterForm fields={campos} onChange={(id, value) => setParams((prev) => ({ ...prev, [id]: value }))} columns={1} />
            </BlockFrame>
          </div>

          <BlockFrame title="Comparación" icon="Columns3">
            <ComparisonTable
              columns={comparadas.map((s) => ({ id: s.slug, title: s.name, subtitle: s.tagline, icon: s.icon, color: s.color }))}
              rows={filas}
              highlightId={mejor ?? undefined}
            />
          </BlockFrame>

          <div className="surface-card flex flex-wrap items-center gap-3 px-4 py-3.5">
            <Info className="h-4 w-4 flex-shrink-0 text-white/35" />
            <p className="min-w-0 flex-1 text-sm text-white/55">
              Los resultados son estimados y pueden variar según la aseguradora y las condiciones del cliente. No
              constituyen una oferta vinculante. Las primas salen del mismo motor que la Calculadora.
            </p>
          </div>
        </>
      ) : (
        <BlockFrame title="Comparaciones guardadas" icon="Save">
          {comparisons.items.length === 0 ? (
            <EmptyState
              icon="Save"
              title="Sin comparaciones guardadas"
              description="Arma una comparación y pulsa Guardar comparación para tenerla aquí."
            />
          ) : (
            <NavTileGrid
              columns={2}
              tiles={[...comparisons.items]
                .sort((a, b) => a.order - b.order)
                .map((c) => ({
                  id: c.id,
                  icon: "Scale",
                  color: "#a78bfa",
                  title: c.name,
                  subtitle: c.solutionSlugs
                    .map((s) => planes.find((p) => p.slug === s)?.name ?? s)
                    .join(" · "),
                  meta: c.date,
                }))}
              onSelect={(id) => {
                const guardada = comparisons.items.find((c) => c.id === id);
                if (!guardada) return;
                setSlugs(guardada.solutionSlugs.slice(0, MAXIMO));
                setTab("comparar");
                toast.info(`Comparación "${guardada.name}" cargada.`);
              }}
            />
          )}
        </BlockFrame>
      )}

      <AddBlockDialog {...composer.dialogProps} />
    </PageShell>
  );
}

/** Texto del medidor de puntos de liquidez y flexibilidad. */
const NIVEL_TEXTO: Record<number, string> = {
  1: "Muy baja",
  2: "Baja",
  3: "Media",
  4: "Alta",
  5: "Muy alta",
};
