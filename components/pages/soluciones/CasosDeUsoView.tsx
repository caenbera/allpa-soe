"use client";

import { BlockFrame } from "@/components/page-blocks/BlockFrame";
import { KpiProgressList } from "@/components/page-blocks/blocks/KpiProgressList";
import { CatalogoView } from "@/components/pages/soluciones/CatalogoView";
import { CATALOG_STATUS_TONE, IMPACT_COLOR, SOL_COLLECTIONS, type SolUseCase } from "@/lib/solution-types";

/**
 * Catálogo de casos de uso: las situaciones reales que justifican cada plan.
 */
export function CasosDeUsoView() {
  return (
    <CatalogoView<SolUseCase>
      config={{
        title: "Casos de Uso",
        description: "Explora y gestiona los casos de uso que impulsan el valor de nuestras soluciones.",
        icon: "Lightbulb",
        path: "/soluciones/casos-de-uso",
        collection: SOL_COLLECTIONS.useCases,
        newLabel: "Nuevo caso de uso",
        searchPlaceholder: "Buscar casos de uso…",
        emptyTitle: "Todavía no hay casos de uso",
        emptyDescription: "Cuando se registre la primera situación real, aparecerá aquí con su alcance e impacto.",
        unit: "casos de uso",
        unitIcon: "Lightbulb",

        columns: [
          { id: "caso", header: "Caso de uso", sortable: true },
          { id: "solucion", header: "Solución relacionada", sortable: true },
          { id: "descripcion", header: "Descripción" },
          { id: "segmento", header: "Segmento", sortable: true, width: "170px" },
          { id: "familias", header: "Familias", sortable: true, width: "110px" },
          { id: "avance", header: "Completado", sortable: true, width: "150px" },
          { id: "estado", header: "Estado", sortable: true, width: "130px" },
          { id: "actualizado", header: "Última actualización", sortable: true, width: "180px" },
        ],
        cells: (u) => ({
          caso: { kind: "source", icon: u.icon, value: u.name, sub: u.code },
          solucion: { kind: "badge", value: u.relatedPlan, tone: "violet" },
          descripcion: { kind: "text", value: u.description },
          segmento: { kind: "text", value: u.segment },
          familias: { kind: "number", value: String(u.families) },
          avance: { kind: "progress", value: u.completion },
          estado: { kind: "status", value: u.status, tone: CATALOG_STATUS_TONE[u.status] },
          actualizado: { kind: "stacked", value: u.updatedAt, sub: `por ${u.owner}` },
        }),
        searchIn: (u) => [u.name, u.code, u.description, u.relatedPlan, u.segment, u.owner],

        filters: [
          { id: "solucion", label: "Solución", valueOf: (u) => u.relatedPlan },
          { id: "segmento", label: "Segmento", valueOf: (u) => u.segment },
          { id: "impacto", label: "Impacto", valueOf: (u) => u.impact },
        ],

        breakdownTitle: "Casos de uso por solución",
        breakdown: (casos) => {
          const mapa = new Map<string, { value: number; color: string }>();
          casos.forEach((u) => {
            const actual = mapa.get(u.relatedPlan);
            mapa.set(u.relatedPlan, { value: (actual?.value ?? 0) + 1, color: u.color });
          });
          return [...mapa.entries()]
            .sort((a, b) => b[1].value - a[1].value)
            .map(([label, { value, color }]) => ({ id: label, label, value, color }));
        },

        extraPanel: (casos) => {
          const niveles: (keyof typeof IMPACT_COLOR)[] = ["Muy Alto", "Alto", "Medio", "Bajo"];
          const filas = niveles
            .map((n) => {
              const cuantos = casos.filter((u) => u.impact === n).length;
              return {
                id: n,
                label: `Impacto ${n.toLowerCase()}`,
                icon: "Gauge",
                value: `${cuantos} ${cuantos === 1 ? "caso" : "casos"}`,
                percent: casos.length ? Math.round((cuantos / casos.length) * 100) : 0,
                cuantos,
              };
            })
            .filter((f) => f.cuantos > 0);

          const masAplicados = [...casos]
            .sort((a, b) => b.families - a.families)
            .slice(0, 5)
            .map((u) => ({
              id: u.id,
              label: u.name,
              icon: u.icon,
              value: `${u.families} familias`,
              percent: casos.length ? Math.round((u.families / Math.max(...casos.map((c) => c.families), 1)) * 100) : 0,
            }));

          return (
            <>
              <BlockFrame title="Reparto por impacto" icon="Gauge">
                <KpiProgressList rows={filas} />
              </BlockFrame>

              <BlockFrame title="Casos más aplicados" icon="Trophy">
                <KpiProgressList rows={masAplicados} />
              </BlockFrame>
            </>
          );
        },

        quickActions: [
          { id: "nuevo", icon: "Plus", label: "Crear nuevo caso de uso" },
          { id: "clonar", icon: "Copy", label: "Clonar caso existente" },
          { id: "plantilla", icon: "LayoutTemplate", label: "Ver plantilla de caso de uso" },
          { id: "planes", icon: "Layers", label: "Ver planes patrimoniales", href: "/soluciones/planes-patrimoniales" },
        ],
      }}
    />
  );
}
