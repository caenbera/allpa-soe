"use client";

import { BandejaView } from "@/components/pages/operaciones/BandejaView";
import { OPS_COLLECTIONS, type OpsDocument } from "@/lib/ops-types";

/** De quién se espera el documento; determina a quién hay que empujar. */
const WAITING_TONE: Record<string, "amber" | "blue" | "violet"> = {
  Cliente: "amber",
  Aseguradora: "blue",
  Terceros: "violet",
};

export function DocumentosPendientesView() {
  return (
    <BandejaView<OpsDocument>
      config={{
        title: "Documentos Pendientes",
        description: "Sigue los documentos que faltan para poder avanzar cada proceso.",
        icon: "FileText",
        path: "/operaciones/documentos-pendientes",
        collection: OPS_COLLECTIONS.documents,
        newLabel: "Solicitar documento",
        searchPlaceholder: "Buscar documentos, clientes o procesos…",
        emptyTitle: "No hay documentos pendientes",
        emptyDescription:
          "Cuando un proceso necesite un documento que todavía no ha llegado, aparecerá aquí con quién lo debe y desde cuándo se pidió.",
        extraColumns: [
          { id: "kind", header: "Tipo", sortable: true, width: "130px" },
          { id: "waitingOn", header: "Se espera de", sortable: true, width: "140px" },
          { id: "requested", header: "Solicitado", width: "120px" },
        ],
        extraCells: (d) => ({
          kind: { kind: "badge", value: d.kind, tone: "blue" },
          waitingOn: { kind: "badge", value: d.waitingOn, tone: WAITING_TONE[d.waitingOn] ?? "neutral" },
          requested: { kind: "text", value: d.requestedAt },
        }),
        extraKpis: (items) => {
          const abiertos = items.filter((d) => d.status !== "Resuelto" && d.status !== "Completado");
          const delCliente = abiertos.filter((d) => d.waitingOn === "Cliente").length;
          return [
            {
              id: "cliente",
              label: "Esperando al cliente",
              value: String(delCliente),
              sub: "de los abiertos",
              icon: "UserRound",
              tone: "emerald",
            },
          ];
        },
        extraDetailRows: (d) => [
          { label: "Tipo de documento", value: d.kind },
          { label: "Se espera de", value: d.waitingOn },
          { label: "Solicitado el", value: d.requestedAt },
        ],
        breakdownTitle: "Documentos por quién los debe",
        breakdown: (items) => {
          const counts = new Map<string, number>();
          items.forEach((d) => counts.set(d.waitingOn, (counts.get(d.waitingOn) ?? 0) + 1));
          const colors = ["#f59e0b", "#3b82f6", "#a78bfa", "#94a3b8"];
          return Array.from(counts.entries())
            .sort((a, b) => b[1] - a[1])
            .map(([label, value], i) => ({ id: label, label, value, color: colors[i % colors.length] }));
        },
      }}
    />
  );
}
