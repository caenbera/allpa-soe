"use client";

import { BandejaView } from "@/components/pages/operaciones/BandejaView";
import { BlockFrame } from "@/components/page-blocks/BlockFrame";
import { Timeline } from "@/components/page-blocks/blocks/Timeline";
import { OPS_COLLECTIONS, type OpsSpecialCase } from "@/lib/ops-types";

export function CasosEspecialesView() {
  return (
    <BandejaView<OpsSpecialCase>
      config={{
        title: "Casos Especiales",
        description: "Gestión de casos que requieren atención prioritaria o un manejo especial.",
        icon: "ShieldAlert",
        path: "/operaciones/casos-especiales",
        collection: OPS_COLLECTIONS.specialCases,
        newLabel: "Nuevo caso especial",
        searchPlaceholder: "Buscar casos, clientes o procesos…",
        emptyTitle: "No hay casos especiales",
        emptyDescription:
          "Los casos que se salen del proceso estándar —un underwriting complejo, un siniestro, una estructura patrimonial— se siguen aquí con su propia línea de tiempo.",
        extraColumns: [
          { id: "kind", header: "Tipo", sortable: true, width: "150px" },
          { id: "progress", header: "Avance", sortable: true, width: "150px" },
        ],
        extraCells: (c) => ({
          kind: { kind: "badge", value: c.kind, tone: "violet" },
          progress: { kind: "progress", value: c.progress },
        }),
        extraKpis: (items) => {
          const abiertos = items.filter((c) => c.status !== "Resuelto" && c.status !== "Completado");
          const alta = abiertos.filter((c) => c.priority === "Alta").length;
          return [
            {
              id: "alta",
              label: "De alta prioridad",
              value: String(alta),
              sub: "de los abiertos",
              icon: "Flame",
              tone: "emerald",
            },
          ];
        },
        extraDetailRows: (c) => [
          { label: "Tipo de caso", value: c.kind },
          { label: "Avance", value: `${c.progress}%` },
        ],
        extraPanel: (c) => (
          <>
            <BlockFrame title="Resumen del caso" icon="FileText">
              <p className="text-sm leading-relaxed text-white/65">{c.summary}</p>
            </BlockFrame>

            <BlockFrame title="Línea de tiempo" icon="History">
              <Timeline
                steps={c.timeline.map((t, i) => ({
                  id: `${c.id}-t-${i}`,
                  label: t.label,
                  status: t.done ? "Hecho" : "Pendiente",
                  tone: t.done ? "emerald" : "neutral",
                  date: t.date,
                  done: t.done,
                }))}
              />
            </BlockFrame>
          </>
        ),
        breakdownTitle: "Casos por tipo",
        breakdown: (items) => {
          const counts = new Map<string, number>();
          items.forEach((c) => counts.set(c.kind, (counts.get(c.kind) ?? 0) + 1));
          const colors = ["#f43f5e", "#a78bfa", "#3b82f6", "#e0a836", "#22c55e", "#94a3b8"];
          return Array.from(counts.entries())
            .sort((a, b) => b[1] - a[1])
            .map(([label, value], i) => ({ id: label, label, value, color: colors[i % colors.length] }));
        },
      }}
    />
  );
}
