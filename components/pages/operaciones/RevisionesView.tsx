"use client";

import { BandejaView } from "@/components/pages/operaciones/BandejaView";
import { OPS_COLLECTIONS, type OpsReview } from "@/lib/ops-types";

export function RevisionesView() {
  return (
    <BandejaView<OpsReview>
      config={{
        title: "Revisiones",
        description: "Controla las revisiones pendientes de documentos, estrategias y propuestas.",
        icon: "ClipboardCheck",
        path: "/operaciones/revisiones",
        collection: OPS_COLLECTIONS.reviews,
        newLabel: "Nueva revisión",
        searchPlaceholder: "Buscar revisiones, clientes o procesos…",
        emptyTitle: "Todavía no hay revisiones",
        emptyDescription:
          "Aquí se acumula lo que alguien tiene que revisar antes de seguir: documentos, estrategias, propuestas. Cada revisión lleva su responsable y su fecha límite.",
        extraColumns: [
          { id: "kind", header: "Tipo", sortable: true, width: "140px" },
          { id: "progress", header: "Avance", sortable: true, width: "150px" },
        ],
        extraCells: (r) => ({
          kind: { kind: "badge", value: r.kind, tone: "violet" },
          progress: { kind: "progress", value: r.progress },
        }),
        extraDetailRows: (r) => [
          { label: "Tipo de revisión", value: r.kind },
          { label: "Avance", value: `${r.progress}%` },
        ],
        breakdownTitle: "Revisiones por tipo",
        breakdown: (items) => {
          const counts = new Map<string, number>();
          items.forEach((r) => counts.set(r.kind, (counts.get(r.kind) ?? 0) + 1));
          const colors = ["#a78bfa", "#22c55e", "#3b82f6", "#e0a836", "#f472b6", "#94a3b8"];
          return Array.from(counts.entries())
            .sort((a, b) => b[1] - a[1])
            .map(([label, value], i) => ({ id: label, label, value, color: colors[i % colors.length] }));
        },
      }}
    />
  );
}
