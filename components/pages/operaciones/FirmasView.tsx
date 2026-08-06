"use client";

import { BandejaView } from "@/components/pages/operaciones/BandejaView";
import { OPS_COLLECTIONS, type OpsSignature } from "@/lib/ops-types";

export function FirmasView() {
  return (
    <BandejaView<OpsSignature>
      config={{
        title: "Firmas",
        description: "Controla las firmas enviadas y las que siguen esperando al cliente.",
        icon: "PenLine",
        path: "/operaciones/firmas",
        collection: OPS_COLLECTIONS.signatures,
        newLabel: "Enviar a firma",
        searchPlaceholder: "Buscar firmas, clientes o procesos…",
        emptyTitle: "No hay firmas pendientes",
        emptyDescription:
          "Cada documento enviado a firma aparece aquí con su canal y cuántos recordatorios se han mandado, hasta que el cliente lo devuelve firmado.",
        extraColumns: [
          { id: "channel", header: "Canal", sortable: true, width: "130px" },
          { id: "sent", header: "Enviado", width: "120px" },
          { id: "reminders", header: "Recordatorios", sortable: true, width: "130px" },
        ],
        extraCells: (s) => ({
          channel: { kind: "badge", value: s.channel, tone: s.channel === "DocuSign" ? "violet" : s.channel === "Email" ? "blue" : "neutral" },
          sent: { kind: "text", value: s.sentAt },
          reminders: {
            kind: "stacked",
            value: String(s.remindersSent),
            sub: s.remindersSent === 0 ? "sin insistir" : s.remindersSent === 1 ? "enviado" : "enviados",
          },
        }),
        extraKpis: (items) => {
          const abiertas = items.filter((s) => s.status !== "Resuelto" && s.status !== "Completado");
          const sinRecordar = abiertas.filter((s) => s.remindersSent === 0).length;
          return [
            {
              id: "sin-recordar",
              label: "Sin recordatorio",
              value: String(sinRecordar),
              sub: "de las abiertas",
              icon: "BellOff",
              tone: "emerald",
            },
          ];
        },
        extraDetailRows: (s) => [
          { label: "Canal", value: s.channel },
          { label: "Enviado el", value: s.sentAt },
          { label: "Recordatorios", value: String(s.remindersSent) },
        ],
        breakdownTitle: "Firmas por canal",
        breakdown: (items) => {
          const counts = new Map<string, number>();
          items.forEach((s) => counts.set(s.channel, (counts.get(s.channel) ?? 0) + 1));
          const colors = ["#a78bfa", "#3b82f6", "#22c55e", "#94a3b8"];
          return Array.from(counts.entries())
            .sort((a, b) => b[1] - a[1])
            .map(([label, value], i) => ({ id: label, label, value, color: colors[i % colors.length] }));
        },
      }}
    />
  );
}
