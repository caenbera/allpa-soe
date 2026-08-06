"use client";

import { BandejaView } from "@/components/pages/operaciones/BandejaView";
import { OPS_COLLECTIONS, type OpsRenewal } from "@/lib/ops-types";

const money = (n: number) => `$${n.toLocaleString("es")}`;

/** Tramos con los que se prioriza una renovación. */
function tramo(dias: number): string {
  if (dias < 0) return "Vencidas";
  if (dias <= 30) return "Próximos 30 días";
  if (dias <= 60) return "Entre 31 y 60 días";
  if (dias <= 90) return "Entre 61 y 90 días";
  return "Más de 90 días";
}

const TRAMO_COLOR: Record<string, string> = {
  Vencidas: "#f43f5e",
  "Próximos 30 días": "#f59e0b",
  "Entre 31 y 60 días": "#e0a836",
  "Entre 61 y 90 días": "#22c55e",
  "Más de 90 días": "#3b82f6",
};

export function RenovacionesView() {
  return (
    <BandejaView<OpsRenewal>
      config={{
        title: "Renovaciones",
        description: "Anticipa las pólizas que vencen y evita que ninguna se pase de fecha.",
        icon: "CalendarClock",
        path: "/operaciones/renovaciones",
        collection: OPS_COLLECTIONS.renewals,
        newLabel: "Nueva renovación",
        searchPlaceholder: "Buscar renovaciones, clientes o pólizas…",
        emptyTitle: "No hay renovaciones registradas",
        emptyDescription:
          "Cada póliza con fecha de vencimiento aparece aquí ordenada por lo que falta, para que ninguna se pase de largo.",
        extraColumns: [
          { id: "policy", header: "Póliza", sortable: true, width: "150px" },
          { id: "premium", header: "Prima anual", sortable: true, width: "140px" },
          { id: "days", header: "Faltan", sortable: true, width: "130px" },
        ],
        extraCells: (r) => ({
          policy: { kind: "text", value: r.policy },
          premium: { kind: "number", value: money(r.annualPremium) },
          days: {
            kind: "stacked",
            value: r.daysToRenewal < 0 ? `${Math.abs(r.daysToRenewal)}` : String(r.daysToRenewal),
            sub: r.daysToRenewal < 0 ? "días vencida" : "días",
          },
        }),
        extraKpis: (items) => {
          const abiertas = items.filter((r) => r.status !== "Resuelto" && r.status !== "Completado");
          const total = abiertas.reduce((sum, r) => sum + r.annualPremium, 0);
          return [
            {
              id: "valor",
              label: "Prima en juego",
              value: total >= 1_000_000 ? `$${(total / 1_000_000).toFixed(1)}M` : money(total),
              sub: "de las abiertas",
              icon: "Landmark",
              tone: "emerald",
            },
          ];
        },
        extraDetailRows: (r) => [
          { label: "Póliza", value: r.policy },
          { label: "Prima anual", value: money(r.annualPremium) },
          {
            label: r.daysToRenewal < 0 ? "Vencida hace" : "Renueva en",
            value: `${Math.abs(r.daysToRenewal)} días`,
          },
        ],
        breakdownTitle: "Renovaciones por tramo",
        breakdown: (items) => {
          const counts = new Map<string, number>();
          items.forEach((r) => counts.set(tramo(r.daysToRenewal), (counts.get(tramo(r.daysToRenewal)) ?? 0) + 1));
          // Orden fijo por urgencia, no por cantidad: leerlo así es lo útil.
          return ["Vencidas", "Próximos 30 días", "Entre 31 y 60 días", "Entre 61 y 90 días", "Más de 90 días"]
            .filter((t) => (counts.get(t) ?? 0) > 0)
            .map((label) => ({ id: label, label, value: counts.get(label) ?? 0, color: TRAMO_COLOR[label] }));
        },
      }}
    />
  );
}
