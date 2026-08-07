"use client";

import { useMemo, useState } from "react";
import { Info, Plus, Save } from "lucide-react";
import { toast } from "sonner";
import { PageShell, PageTabs } from "@/components/page-blocks/PageShell";
import { AddBlockDialog } from "@/components/page-blocks/AddBlockDialog";
import { useBlockComposer } from "@/components/page-blocks/use-block-composer";
import { BlockFrame } from "@/components/page-blocks/BlockFrame";
import { EmptyState, LoadingState } from "@/components/page-blocks/EmptyState";
import { ParameterForm, type ParameterField } from "@/components/page-blocks/blocks/ParameterForm";
import { ComponentPickList } from "@/components/page-blocks/blocks/ComponentPickList";
import { DonutChart } from "@/components/page-blocks/blocks/DonutChart";
import { StatTileList } from "@/components/page-blocks/blocks/StatTileList";
import { InfoCard } from "@/components/page-blocks/blocks/InfoCard";
import { DataTable, type RowData } from "@/components/page-blocks/blocks/DataTable";
import { ActivityFeed } from "@/components/page-blocks/blocks/ActivityFeed";
import { Button } from "@/components/ui/button";
import { useContent } from "@/lib/use-content";
import { usePageConfig } from "@/lib/use-page-config";
import { dinero, dineroEntero, simular, simularNiveles } from "@/lib/solution-calc";
import {
  CLIENT_PROFILES,
  COVERAGE_LEVELS,
  SOL_COLLECTIONS,
  type ClientProfileId,
  type CoverageLevel,
  type SolSimulation,
  type Solution,
} from "@/lib/solution-types";

const TABS = [
  { value: "calculadora", label: "Calculadora" },
  { value: "escenarios", label: "Escenarios guardados" },
  { value: "supuestos", label: "Supuestos del modelo" },
  { value: "historial", label: "Historial" },
];

const ESTADOS_CIVILES = ["Soltero/a", "Casado/a", "Unión libre", "Divorciado/a", "Viudo/a"];

/** Valores de partida: una familia joven de referencia. */
const INICIAL = {
  profile: "familia-joven" as ClientProfileId,
  age: 35,
  maritalStatus: "Casado/a",
  dependents: 2,
  monthlyIncome: 5000,
  level: "Medio" as CoverageLevel,
};

export function CalculadoraView() {
  const solutions = useContent<Solution>(SOL_COLLECTIONS.solutions);
  const simulations = useContent<SolSimulation>(SOL_COLLECTIONS.simulations);

  const { blocks, addBlock, updateBlock, removeBlock } = usePageConfig("/soluciones/calculadora");
  const composer = useBlockComposer(addBlock);

  const [tab, setTab] = useState("calculadora");
  const [slug, setSlug] = useState<string | null>(null);
  const [params, setParams] = useState(INICIAL);

  const planes = useMemo(() => [...solutions.items].sort((a, b) => a.order - b.order), [solutions.items]);

  // Hasta que carguen los planes no hay nada que simular; en cuanto llegan, se
  // toma el primero como valor por defecto.
  const solucion = useMemo(() => planes.find((s) => s.slug === slug) ?? planes[0], [planes, slug]);

  const resultado = useMemo(
    () => (solucion ? simular(params, solucion.kind) : null),
    [params, solucion]
  );

  const niveles = useMemo(
    () => (solucion ? simularNiveles(params, solucion.kind) : []),
    [params, solucion]
  );

  const campos: ParameterField[] = solucion
    ? [
        {
          kind: "select",
          id: "solucion",
          label: "Solución",
          value: solucion.slug,
          options: planes.map((s) => ({ value: s.slug, label: s.name })),
        },
        {
          kind: "select",
          id: "profile",
          label: "Perfil del cliente",
          value: params.profile,
          options: CLIENT_PROFILES.map((p) => ({ value: p.id, label: p.label })),
        },
        { kind: "number", id: "age", label: "Edad del titular", value: params.age, min: 18, max: 80, suffix: "años" },
        {
          kind: "select",
          id: "maritalStatus",
          label: "Estado civil",
          value: params.maritalStatus,
          options: ESTADOS_CIVILES.map((e) => ({ value: e, label: e })),
        },
        { kind: "stepper", id: "dependents", label: "Número de dependientes", value: params.dependents, min: 0, max: 10 },
        { kind: "currency", id: "monthlyIncome", label: "Ingreso mensual del hogar", value: params.monthlyIncome },
        {
          kind: "segmented",
          id: "level",
          label: "Nivel de cobertura deseado",
          value: params.level,
          options: COVERAGE_LEVELS,
          hint: "Qué parte de la necesidad calculada queda cubierta.",
        },
      ]
    : [];

  const onChange = (id: string, value: string | number) => {
    if (id === "solucion") {
      setSlug(String(value));
      return;
    }
    setParams((prev) => ({ ...prev, [id]: value }));
  };

  const guardar = async () => {
    if (!solucion || !resultado) return;
    await simulations.add({
      name: `${CLIENT_PROFILES.find((p) => p.id === params.profile)?.label} - ${solucion.name}`,
      solutionSlug: solucion.slug,
      profile: params.profile,
      age: params.age,
      maritalStatus: params.maritalStatus,
      dependents: params.dependents,
      monthlyIncome: params.monthlyIncome,
      level: params.level,
      icon: solucion.icon,
      color: solucion.color,
      date: new Date().toLocaleDateString("es", { day: "2-digit", month: "short", year: "numeric" }),
      status: "Completada",
      order: simulations.items.length,
    } as Omit<SolSimulation, "id">);
    toast.success("Escenario guardado.");
  };

  /**
   * Vuelve a montar los parámetros de un escenario guardado. La prima no se
   * guarda: se recalcula al abrirlo, así que un cambio en el modelo se refleja
   * en los escenarios antiguos en vez de dejarlos con una cifra caducada.
   */
  const recuperar = (sim: SolSimulation) => {
    setSlug(sim.solutionSlug);
    setParams({
      profile: sim.profile as ClientProfileId,
      age: sim.age,
      maritalStatus: sim.maritalStatus,
      dependents: sim.dependents,
      monthlyIncome: sim.monthlyIncome,
      level: sim.level,
    });
    setTab("calculadora");
    toast.info(`Escenario "${sim.name}" cargado en la calculadora.`);
  };

  const guardados = useMemo(() => [...simulations.items].sort((a, b) => a.order - b.order), [simulations.items]);

  const filasGuardadas: RowData[] = guardados.map((s) => {
    const plan = planes.find((p) => p.slug === s.solutionSlug);
    const r = plan ? simular({ ...s, profile: s.profile as ClientProfileId }, plan.kind) : null;
    return {
      id: s.id,
      cells: {
        escenario: { kind: "source", icon: s.icon, value: s.name, sub: plan?.name ?? s.solutionSlug },
        perfil: { kind: "text", value: `${s.age} años · ${s.dependents} dependientes` },
        ingreso: { kind: "text", value: dineroEntero(s.monthlyIncome) },
        nivel: { kind: "badge", value: s.level, tone: "violet" },
        prima: { kind: "text", value: r ? dinero(r.primaMensual) : "—", sub: "al mes" },
        fecha: { kind: "text", value: s.date },
      },
    };
  });

  const sidePanel = (
    <>
      <BlockFrame title="Resumen rápido" icon="Gauge">
        {resultado ? (
          <StatTileList
            columns={2}
            tiles={[
              { id: "prima", icon: "Wallet", color: "#a78bfa", value: dinero(resultado.primaMensual), label: "Prima mensual" },
              { id: "cobertura", icon: "ShieldCheck", color: "#22c55e", value: `${resultado.cobertura}%`, label: "Nivel de cobertura" },
              { id: "coberturas", icon: "Boxes", color: "#3b82f6", value: String(resultado.coberturas.length), label: "Coberturas" },
              { id: "suma", icon: "Landmark", color: "#e0a836", value: dineroEntero(resultado.sumaAsegurada), label: "Suma asegurada" },
            ]}
          />
        ) : (
          <p className="py-4 text-center text-sm text-white/35">Elige una solución para simular.</p>
        )}
      </BlockFrame>

      <BlockFrame title="Comparación de niveles" icon="Scale">
        {niveles.length === 0 ? (
          <p className="py-4 text-center text-sm text-white/35">Sin datos.</p>
        ) : (
          <ul className="space-y-1.5">
            {niveles.map((n) => {
              const activo = n.level === params.level;
              return (
                <li
                  key={n.level}
                  className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 ${
                    activo ? "border-[var(--allpa-gold-400)]/40 bg-[var(--allpa-gold-400)]/[0.07]" : "border-white/10 bg-white/[0.02]"
                  }`}
                >
                  <span className="min-w-0 flex-1 truncate text-sm text-white/70">{n.level}</span>
                  <span className="flex-shrink-0 text-sm tabular-nums text-[#f3ecd9]">{dinero(n.primaMensual)}</span>
                  <span className="w-10 flex-shrink-0 text-right text-xs tabular-nums text-white/45">{n.cobertura}%</span>
                </li>
              );
            })}
          </ul>
        )}
      </BlockFrame>

      <BlockFrame title="Simulaciones recientes" icon="History">
        {guardados.length === 0 ? (
          <p className="py-4 text-center text-sm text-white/35">Todavía no has guardado ningún escenario.</p>
        ) : (
          <ActivityFeed
            compact
            entries={guardados
              .slice(-5)
              .reverse()
              .map((s) => ({
                id: s.id,
                icon: s.icon,
                color: s.color,
                title: s.name,
                detail: `${s.age} años · nivel ${s.level}`,
                timeLabel: s.date,
                tag: s.status,
              }))}
          />
        )}
      </BlockFrame>
    </>
  );

  return (
    <PageShell
      title="Calculadora"
      description="Simula escenarios, calcula coberturas y costos para diseñar la mejor solución para tus clientes."
      icon="Calculator"
      sidePanel={sidePanel}
      blocks={{ items: blocks, onUpdate: updateBlock, onDelete: removeBlock, onAdd: composer.openFor }}
      headerActions={
        <>
          <Button
            variant="outline"
            size="sm"
            className="border-white/12 bg-white/[0.03] text-white/70 hover:bg-white/[0.06]"
            onClick={() => setParams(INICIAL)}
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Nueva simulación
          </Button>
          <Button size="sm" onClick={guardar} disabled={!resultado}>
            <Save className="mr-1.5 h-3.5 w-3.5" />
            Guardar escenario
          </Button>
        </>
      }
    >
      <PageTabs tabs={TABS} active={tab} onChange={setTab} />

      {solutions.loading ? (
        <div className="surface-card">
          <LoadingState />
        </div>
      ) : !solucion ? (
        <div className="surface-card">
          <EmptyState
            icon="Calculator"
            title="No hay soluciones que simular"
            description="La calculadora necesita al menos un plan patrimonial en el catálogo."
          />
        </div>
      ) : tab === "calculadora" ? (
        <>
          <div className="grid grid-cols-1 gap-3 xl:grid-cols-[380px_1fr]">
            <BlockFrame title="1. Configura los parámetros" icon="SlidersHorizontal">
              <p className="mb-3 text-sm text-white/45">Ingresa la información para generar la simulación.</p>
              <ParameterForm fields={campos} onChange={onChange} columns={2} />
            </BlockFrame>

            <div className="space-y-3">
              <BlockFrame title="2. Resultados de la simulación" icon="Gauge">
                {resultado && (
                  <>
                    <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-4">
                      <div className="min-w-0">
                        <p className="text-sm text-white/45">Prima mensual estimada</p>
                        <p className="text-3xl font-semibold tabular-nums text-emerald-300">
                          {dinero(resultado.primaMensual)}
                        </p>
                        <p className="mt-1 text-xs text-white/35">
                          Rango estimado: {dinero(resultado.primaMinima)} – {dinero(resultado.primaMaxima)} · {dinero(resultado.primaAnual)} al año
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <DonutChart
                          slices={[
                            { id: "cubierto", label: "Cubierto", value: resultado.cobertura, color: solucion.color },
                            { id: "resto", label: "Sin cubrir", value: 100 - resultado.cobertura, color: "rgba(255,255,255,0.08)" },
                          ]}
                          centerValue={`${resultado.cobertura}%`}
                          centerLabel="Cobertura"
                          showPercent={false}
                        />
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <InfoCard
                        rows={[
                          { label: "Necesidad calculada", value: dineroEntero(resultado.necesidad) },
                          { label: "Suma asegurada", value: dineroEntero(resultado.sumaAsegurada) },
                        ]}
                      />
                      <InfoCard
                        rows={[
                          { label: "Nivel elegido", value: params.level },
                          { label: "Tipo de plan", value: solucion.kind },
                        ]}
                      />
                    </div>
                  </>
                )}
              </BlockFrame>

              <BlockFrame title="Coberturas incluidas" icon="ShieldCheck">
                {resultado && (
                  <ComponentPickList
                    items={resultado.coberturas.map((c) => ({
                      id: c.id,
                      name: c.label,
                      description: c.detail,
                      icon: c.icon,
                      color: solucion.color,
                      tier: solucion.kind,
                      tierTone: "violet",
                      valueLabel: "Suma asegurada",
                      value: dineroEntero(c.amount),
                      included: true,
                    }))}
                  />
                )}
              </BlockFrame>
            </div>
          </div>

          <div className="surface-card flex flex-wrap items-center gap-3 px-4 py-3.5">
            <Info className="h-4 w-4 flex-shrink-0 text-white/35" />
            <p className="min-w-0 flex-1 text-sm text-white/55">
              Los resultados son estimados y pueden variar según la aseguradora y las condiciones del cliente. No
              constituyen una oferta vinculante. Los supuestos del modelo están en su propia pestaña.
            </p>
          </div>
        </>
      ) : tab === "escenarios" ? (
        <BlockFrame title="Escenarios guardados" icon="Save">
          {guardados.length === 0 ? (
            <EmptyState
              icon="Save"
              title="Sin escenarios guardados"
              description="Configura una simulación y pulsa Guardar escenario para tenerla aquí."
            />
          ) : (
            <>
              <p className="mb-3 text-sm text-white/45">
                La prima se recalcula al abrir cada escenario, así que un cambio en el modelo no deja cifras caducadas.
              </p>
              <DataTable
                columns={[
                  { id: "escenario", header: "Escenario", sortable: true },
                  { id: "perfil", header: "Perfil", sortable: true },
                  { id: "ingreso", header: "Ingreso mensual", sortable: true, width: "150px" },
                  { id: "nivel", header: "Nivel", sortable: true, width: "110px" },
                  { id: "prima", header: "Prima mensual", sortable: true, width: "150px" },
                  { id: "fecha", header: "Fecha", sortable: true, width: "140px" },
                ]}
                rows={filasGuardadas}
                onView={(id) => {
                  const sim = guardados.find((s) => s.id === id);
                  if (sim) recuperar(sim);
                }}
                onDeleteRow={(id) => simulations.remove(id)}
              />
            </>
          )}
        </BlockFrame>
      ) : tab === "supuestos" ? (
        <BlockFrame title="Supuestos del modelo" icon="Info">
          <p className="mb-3 text-sm text-white/55">
            El cálculo va en tres pasos: cuánto capital necesita la familia, qué parte cubre el nivel elegido y cuánto
            cuesta al mes esa suma. Estas son las constantes que usa, a la vista para que cualquiera pueda auditarlas.
          </p>
          <InfoCard
            rows={[
              { label: "Años de ingreso a reemplazar", value: "10 años" },
              { label: "Peso de cada dependiente", value: "+15% de necesidad" },
              { label: "Parte cubierta — Básico", value: "48% de la necesidad" },
              { label: "Parte cubierta — Medio", value: "72% de la necesidad" },
              { label: "Parte cubierta — Alto", value: "92% de la necesidad" },
              { label: "Tasa base", value: "$0.22 por cada $1,000 al mes" },
              { label: "Edad de referencia", value: "35 años" },
              { label: "Ajuste por edad", value: "±3.5% por año" },
              { label: "Holgura del rango", value: "±12%" },
              { label: "Factor de este plan", value: `${solucion.kind}` },
            ]}
          />
          <p className="mt-3 text-xs text-white/35">
            Es una estimación calibrada con la banda de un seguro temporal para una persona sana de 35 años, no una
            tarifa. Cuando lleguen las tarifas reales de la aseguradora se sustituyen en un solo archivo
            (lib/solution-calc.ts) y las dos herramientas quedan al día.
          </p>
        </BlockFrame>
      ) : (
        <BlockFrame title="Historial de simulaciones" icon="History">
          {guardados.length === 0 ? (
            <EmptyState
              icon="History"
              title="Sin historial"
              description="Aquí aparecerán las simulaciones a medida que las vayas guardando."
            />
          ) : (
            <ActivityFeed
              entries={[...guardados].reverse().map((s) => ({
                id: s.id,
                icon: s.icon,
                color: s.color,
                title: s.name,
                detail: `${s.age} años · ${s.dependents} dependientes · ${dineroEntero(s.monthlyIncome)} al mes · nivel ${s.level}`,
                timeLabel: s.date,
                tag: s.status,
              }))}
            />
          )}
        </BlockFrame>
      )}

      <AddBlockDialog {...composer.dialogProps} />
    </PageShell>
  );
}
