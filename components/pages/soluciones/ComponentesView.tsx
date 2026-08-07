"use client";

import { BlockFrame } from "@/components/page-blocks/BlockFrame";
import { RankedBarList } from "@/components/page-blocks/blocks/RankedBarList";
import { CatalogoView } from "@/components/pages/soluciones/CatalogoView";
import {
  CATALOG_STATUS_TONE,
  COMPONENT_CATEGORY_COLOR,
  SOL_COLLECTIONS,
  type SolComponent,
} from "@/lib/solution-types";

/**
 * Catálogo de componentes modulares: las piezas con que se arman los planes.
 */
export function ComponentesCatalogoView() {
  return (
    <CatalogoView<SolComponent>
      config={{
        title: "Componentes",
        description: "Administra y reutiliza componentes modulares para construir soluciones personalizadas.",
        icon: "Box",
        path: "/soluciones/componentes",
        collection: SOL_COLLECTIONS.components,
        newLabel: "Nuevo componente",
        searchPlaceholder: "Buscar componentes…",
        emptyTitle: "Todavía no hay componentes",
        emptyDescription: "Cuando se cree el primer componente modular, aparecerá aquí listo para usarse en un plan.",
        unit: "componentes",
        unitIcon: "Box",

        columns: [
          { id: "componente", header: "Componente", sortable: true },
          { id: "descripcion", header: "Descripción" },
          { id: "categoria", header: "Categoría", sortable: true, width: "140px" },
          { id: "tipo", header: "Tipo", sortable: true, width: "120px" },
          { id: "plan", header: "Plan relacionado", sortable: true },
          { id: "usos", header: "En uso", sortable: true, width: "110px" },
          { id: "estado", header: "Estado", sortable: true, width: "130px" },
          { id: "actualizado", header: "Última actualización", sortable: true, width: "180px" },
        ],
        cells: (c) => ({
          componente: { kind: "source", icon: c.icon, value: c.name },
          descripcion: { kind: "text", value: c.description },
          categoria: { kind: "badge", value: c.category, tone: "violet" },
          tipo: { kind: "text", value: c.type },
          plan: { kind: "text", value: c.relatedPlan },
          usos: { kind: "number", value: String(c.usedIn) },
          estado: { kind: "status", value: c.status, tone: CATALOG_STATUS_TONE[c.status] },
          actualizado: { kind: "stacked", value: c.updatedAt, sub: `por ${c.author}` },
        }),
        searchIn: (c) => [c.name, c.description, c.relatedPlan, c.category, c.type],

        filters: [
          { id: "categoria", label: "Categoría", valueOf: (c) => c.category },
          { id: "tipo", label: "Tipo", valueOf: (c) => c.type },
          { id: "plan", label: "Plan relacionado", valueOf: (c) => c.relatedPlan },
        ],

        breakdownTitle: "Componentes por categoría",
        breakdown: (comps) => {
          const mapa = new Map<string, number>();
          comps.forEach((c) => mapa.set(c.category, (mapa.get(c.category) ?? 0) + 1));
          return [...mapa.entries()]
            .sort((a, b) => b[1] - a[1])
            .map(([label, value]) => ({
              id: label,
              label,
              value,
              color: COMPONENT_CATEGORY_COLOR[label as keyof typeof COMPONENT_CATEGORY_COLOR] ?? "#64748b",
            }));
        },

        extraPanel: (comps) => (
          <BlockFrame title="Componentes más utilizados" icon="Trophy">
            <RankedBarList
              rows={[...comps]
                .sort((a, b) => b.usedIn - a.usedIn)
                .slice(0, 5)
                .map((c) => ({
                  id: c.id,
                  label: c.name,
                  value: c.usedIn,
                  color: COMPONENT_CATEGORY_COLOR[c.category] ?? "#64748b",
                  ranked: true,
                }))}
            />
            <p className="mt-2.5 text-xs text-white/35">Número de soluciones en las que se usa cada componente.</p>
          </BlockFrame>
        ),

        quickActions: [
          { id: "nuevo", icon: "Plus", label: "Crear nuevo componente" },
          { id: "clonar", icon: "Copy", label: "Clonar componente existente" },
          { id: "plantillas", icon: "LayoutTemplate", label: "Ver plantillas de componentes" },
          { id: "categorias", icon: "Tags", label: "Gestionar categorías" },
        ],
      }}
    />
  );
}
