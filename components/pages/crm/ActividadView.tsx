"use client";

import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { PageShell, PageTabs } from "@/components/page-blocks/PageShell";
import { AddBlockDialog } from "@/components/page-blocks/AddBlockDialog";
import { useBlockComposer } from "@/components/page-blocks/use-block-composer";
import { BlockFrame } from "@/components/page-blocks/BlockFrame";
import { EmptyState, LoadingState } from "@/components/page-blocks/EmptyState";
import { KpiStrip } from "@/components/page-blocks/blocks/KpiStrip";
import { FilterToolbar } from "@/components/page-blocks/blocks/FilterToolbar";
import { ActivityFeed } from "@/components/page-blocks/blocks/ActivityFeed";
import { DonutChart, DONUT_COLORS } from "@/components/page-blocks/blocks/DonutChart";
import { RankedBarList } from "@/components/page-blocks/blocks/RankedBarList";
import { Button } from "@/components/ui/button";
import { useContent } from "@/lib/use-content";
import { usePageConfig } from "@/lib/use-page-config";
import { ACTIVITY_META, CRM_COLLECTIONS, type Activity, type ActivityKind } from "@/lib/crm-types";

const TABS = [
  { value: "resumen", label: "Resumen" },
  { value: "todas", label: "Todas las actividades" },
  { value: "Llamada", label: "Llamadas" },
  { value: "Email", label: "Emails" },
  { value: "Reunión", label: "Reuniones" },
  { value: "Tarea", label: "Tareas" },
  { value: "Nota", label: "Notas" },
  { value: "Cambio", label: "Cambios" },
  { value: "historial", label: "Historial" },
];

/**
 * Series de los indicadores.
 *
 * Son ilustrativas, como los porcentajes "vs mes anterior" del resto del
 * módulo: el CRM todavía no guarda histórico por día, así que no hay de dónde
 * calcularlas. En cuanto exista, salen de ahí.
 */
const TREND: Record<string, number[]> = {
  total: [18, 22, 19, 27, 24, 31, 28, 35, 33, 39],
  Llamada: [6, 8, 7, 9, 8, 11, 10, 12, 11, 14],
  Email: [12, 15, 13, 18, 16, 21, 19, 23, 22, 26],
  Reunión: [2, 3, 3, 4, 3, 5, 4, 6, 5, 7],
  Tarea: [4, 5, 4, 7, 6, 8, 7, 9, 8, 10],
  Nota: [3, 4, 5, 4, 6, 5, 7, 6, 5, 4],
};

const KIND_ORDER: ActivityKind[] = ["Llamada", "Email", "Reunión", "Tarea", "Nota", "Cambio"];

const KPI_LABEL: Record<string, string> = {
  Llamada: "Llamadas realizadas",
  Email: "Emails enviados",
  Reunión: "Reuniones realizadas",
  Tarea: "Tareas completadas",
  Nota: "Notas agregadas",
};

const KPI_TONE: Record<string, "gold" | "emerald" | "amber" | "blue" | "violet" | "rose"> = {
  Llamada: "emerald",
  Email: "blue",
  Reunión: "violet",
  Tarea: "amber",
  Nota: "rose",
};

export function ActividadView() {
  const [tab, setTab] = useState("resumen");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});

  const activities = useContent<Activity>(CRM_COLLECTIONS.activities);
  const { blocks, addBlock, updateBlock, removeBlock } = usePageConfig("/crm/actividad");
  const composer = useBlockComposer(addBlock);

  const countByKind = useMemo(() => {
    const counts = new Map<ActivityKind, number>();
    activities.items.forEach((a) => counts.set(a.kind, (counts.get(a.kind) ?? 0) + 1));
    return counts;
  }, [activities.items]);

  /** La pestaña activa puede ser un tipo de actividad; si no, no filtra por tipo. */
  const tabKind = KIND_ORDER.includes(tab as ActivityKind) ? (tab as ActivityKind) : null;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return activities.items.filter((a) => {
      if (tabKind && a.kind !== tabKind) return false;
      if (filters.kind && filters.kind !== "Todos" && a.kind !== filters.kind) return false;
      if (filters.user && filters.user !== "Todos" && a.user !== filters.user) return false;
      if (filters.source && filters.source !== "Todos" && a.source !== filters.source) return false;
      if (!q) return true;
      return `${a.contactName} ${a.title} ${a.detail} ${a.source}`.toLowerCase().includes(q);
    });
  }, [activities.items, tabKind, search, filters]);

  const toEntries = (list: Activity[]) =>
    list.map((a) => ({
      id: a.id,
      icon: ACTIVITY_META[a.kind].icon,
      color: ACTIVITY_META[a.kind].color,
      person: a.contactName,
      personSub: a.contactRole,
      title: a.title,
      detail: a.detail,
      source: a.source,
      timeLabel: a.timeLabel,
    }));

  const byKind = useMemo(
    () =>
      KIND_ORDER.filter((k) => (countByKind.get(k) ?? 0) > 0).map((kind) => ({
        id: kind,
        label: kind === "Cambio" ? "Cambios en CRM" : `${kind}s`,
        value: countByKind.get(kind) ?? 0,
        color: ACTIVITY_META[kind].color,
      })),
    [countByKind]
  );

  const byUser = useMemo(() => {
    const counts = new Map<string, number>();
    activities.items.forEach((a) => counts.set(a.user, (counts.get(a.user) ?? 0) + 1));
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([label, value], i) => ({ id: label, label, value, color: DONUT_COLORS[i % DONUT_COLORS.length], person: true }));
  }, [activities.items]);

  const realtime = activities.items.slice(0, 5).map((a) => ({
    id: `rt-${a.id}`,
    icon: ACTIVITY_META[a.kind].icon,
    color: ACTIVITY_META[a.kind].color,
    title: `${a.contactName} — ${a.title.toLowerCase()}`,
    detail: a.detail,
    timeLabel: a.timeLabel,
  }));

  const total = activities.items.length;
  const isEmpty = !activities.loading && total === 0;

  const sidePanel = (
    <>
      {!isEmpty && (
        <>
          <BlockFrame title="Resumen de actividad" icon="PieChart">
            <DonutChart slices={byKind} centerValue={String(total)} centerLabel="Total" />
          </BlockFrame>

          <BlockFrame title="Actividad por tipo" icon="BarChart3">
            <RankedBarList rows={byKind} />
          </BlockFrame>

          <BlockFrame title="Actividad por usuario" icon="Users">
            <RankedBarList rows={byUser} />
          </BlockFrame>

          <BlockFrame title="Actividad reciente" icon="History">
            <ActivityFeed entries={realtime} compact />
          </BlockFrame>
        </>
      )}

    </>
  );

  return (
    <PageShell
      title="Actividad"
      description="Monitorea todas las interacciones y actividades realizadas en el CRM."
      icon="History"
      starrable={false}
      sidePanel={sidePanel}
      blocks={{ items: blocks, onUpdate: updateBlock, onDelete: removeBlock, onAdd: composer.openFor }}
      headerActions={
        <Button variant="outline" size="sm" className="border-white/12 bg-white/[0.03] text-white/70 hover:bg-white/[0.06]">
          <Download className="mr-1.5 h-3.5 w-3.5" />
          Exportar
        </Button>
      }
    >
      {activities.loading ? (
        <div className="surface-card">
          <LoadingState />
        </div>
      ) : isEmpty ? (
        <div className="surface-card">
          <EmptyState
            icon="History"
            title="Todavía no hay actividad"
            description="Aquí queda registrada cada llamada, email, reunión, tarea y nota del equipo, con quién la hizo y de dónde salió. Se irá llenando sola conforme uses el CRM."
          />
        </div>
      ) : (
        <>
          <KpiStrip
            items={[
              { id: "total", label: "Actividades totales", value: total.toLocaleString("es"), delta: "18.4%", sub: "vs mes anterior", icon: "History", tone: "violet", trend: TREND.total },
              ...KIND_ORDER.filter((k) => k !== "Cambio").map((kind) => ({
                id: kind,
                label: KPI_LABEL[kind],
                value: String(countByKind.get(kind) ?? 0),
                delta: "14.2%",
                sub: "vs mes anterior",
                icon: ACTIVITY_META[kind].icon,
                tone: KPI_TONE[kind],
                trend: TREND[kind],
              })),
            ]}
          />

          <div className="surface-card mt-3 overflow-hidden">
            <div className="px-4 pt-3">
              <PageTabs tabs={TABS} active={tab} onChange={setTab} />
            </div>
            <div className="px-4 pb-4">
              {tab === "resumen" ? (
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                  <div>
                    <p className="mb-2.5 text-sm font-medium text-[#f3ecd9]">Actividad por tipo</p>
                    <RankedBarList rows={byKind} />
                  </div>
                  <div>
                    <p className="mb-2.5 text-sm font-medium text-[#f3ecd9]">Actividad por usuario</p>
                    <RankedBarList rows={byUser} />
                  </div>
                  <div className="xl:col-span-2">
                    <p className="mb-2.5 text-sm font-medium text-[#f3ecd9]">Últimas interacciones</p>
                    <ActivityFeed entries={toEntries(activities.items.slice(0, 8))} />
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <FilterToolbar
                      search={search}
                      onSearchChange={setSearch}
                      searchPlaceholder="Buscar actividades, contactos…"
                      filters={[
                        ...(tabKind
                          ? []
                          : [{ id: "kind", label: "Tipo", options: KIND_ORDER.filter((k) => (countByKind.get(k) ?? 0) > 0) }]),
                        { id: "user", label: "Usuario", options: [...new Set(activities.items.map((a) => a.user))] },
                        { id: "source", label: "Canal", options: [...new Set(activities.items.map((a) => a.source))] },
                      ]}
                      values={filters}
                      onFilterChange={(id, value) => setFilters((f) => ({ ...f, [id]: value }))}
                    />
                  </div>

                  <ActivityFeed entries={toEntries(filtered)} compact={tab === "historial"} />
                </>
              )}
            </div>
          </div>
        </>
      )}

      <AddBlockDialog {...composer.dialogProps} />
    </PageShell>
  );
}
