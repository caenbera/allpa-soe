"use client";

import { BlockFrame } from "@/components/page-blocks/BlockFrame";
import { ActivityFeed } from "@/components/page-blocks/blocks/ActivityFeed";
import { CatalogoView } from "@/components/pages/soluciones/CatalogoView";
import { CATALOG_STATUS_TONE, SOL_COLLECTIONS, type SolRoute } from "@/lib/solution-types";

/**
 * Rutas de cliente: los recorridos por tipo de familia, cada uno anclado a un
 * plan patrimonial.
 */
export function RutasClienteView() {
  return (
    <CatalogoView<SolRoute>
      config={{
        title: "Rutas de Cliente",
        description: "Diseña y gestiona los recorridos estratégicos para cada tipo de cliente.",
        icon: "Route",
        path: "/soluciones/rutas-de-cliente",
        collection: SOL_COLLECTIONS.routes,
        newLabel: "Nueva ruta",
        searchPlaceholder: "Buscar rutas…",
        emptyTitle: "Todavía no hay rutas",
        emptyDescription: "Cuando se diseñe el primer recorrido de cliente, aparecerá aquí con sus etapas.",
        unit: "rutas",
        unitIcon: "Route",

        columns: [
          { id: "ruta", header: "Ruta", sortable: true },
          { id: "descripcion", header: "Descripción" },
          { id: "plan", header: "Plan relacionado", sortable: true },
          { id: "etapas", header: "Etapas", sortable: true, width: "100px" },
          { id: "estado", header: "Estado", sortable: true, width: "130px" },
          { id: "actualizado", header: "Última actualización", sortable: true, width: "180px" },
        ],
        cells: (r) => ({
          ruta: { kind: "source", icon: r.icon, value: r.name },
          descripcion: { kind: "text", value: r.description },
          plan: { kind: "source", icon: r.relatedPlanIcon, value: r.relatedPlan },
          etapas: { kind: "number", value: String(r.stages) },
          estado: { kind: "status", value: r.status, tone: CATALOG_STATUS_TONE[r.status] },
          actualizado: { kind: "stacked", value: r.updatedAt, sub: `por ${r.author}` },
        }),
        searchIn: (r) => [r.name, r.description, r.relatedPlan, r.author],

        filters: [
          { id: "plan", label: "Plan relacionado", valueOf: (r) => r.relatedPlan },
          { id: "autor", label: "Autor", valueOf: (r) => r.author },
        ],

        breakdownTitle: "Distribución por plan relacionado",
        breakdown: (rutas) => {
          const mapa = new Map<string, { value: number; color: string }>();
          rutas.forEach((r) => {
            const actual = mapa.get(r.relatedPlan);
            mapa.set(r.relatedPlan, { value: (actual?.value ?? 0) + 1, color: r.color });
          });
          return [...mapa.entries()]
            .sort((a, b) => b[1].value - a[1].value)
            .map(([label, { value, color }]) => ({ id: label, label, value, color }));
        },

        extraPanel: (rutas) => (
          <BlockFrame title="Actividad reciente" icon="History">
            <ActivityFeed
              entries={[...rutas]
                .slice(0, 5)
                .map((r) => ({
                  id: r.id,
                  icon: r.icon,
                  color: r.color,
                  title: r.status === "Borrador" ? `Ruta ${r.name} en borrador` : `Ruta ${r.name} actualizada`,
                  detail: `por ${r.author}`,
                  timeLabel: r.updatedAt,
                }))}
              compact
            />
          </BlockFrame>
        ),

        quickActions: [
          { id: "nueva", icon: "Plus", label: "Crear nueva ruta de cliente" },
          { id: "clonar", icon: "Copy", label: "Clonar ruta existente" },
          { id: "plantillas", icon: "LayoutTemplate", label: "Ver plantillas de rutas" },
          { id: "planes", icon: "Layers", label: "Ver planes patrimoniales", href: "/soluciones/planes-patrimoniales" },
        ],
      }}
    />
  );
}
