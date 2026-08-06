"use client";

import { useMemo, useState } from "react";
import { Download, Plus } from "lucide-react";
import { PageShell, PageTabs } from "@/components/page-blocks/PageShell";
import { AddBlockDialog } from "@/components/page-blocks/AddBlockDialog";
import { useBlockComposer } from "@/components/page-blocks/use-block-composer";
import { BlockFrame } from "@/components/page-blocks/BlockFrame";
import { EmptyState, LoadingState } from "@/components/page-blocks/EmptyState";
import { KpiStrip } from "@/components/page-blocks/blocks/KpiStrip";
import { FilterToolbar } from "@/components/page-blocks/blocks/FilterToolbar";
import { DataTable, type RowData } from "@/components/page-blocks/blocks/DataTable";
import { DetailDrawer } from "@/components/page-blocks/blocks/DetailDrawer";
import { InfoCard } from "@/components/page-blocks/blocks/InfoCard";
import { DonutChart, DONUT_COLORS } from "@/components/page-blocks/blocks/DonutChart";
import { StatTileList } from "@/components/page-blocks/blocks/StatTileList";
import { ActivityFeed } from "@/components/page-blocks/blocks/ActivityFeed";
import { Button } from "@/components/ui/button";
import { useContent } from "@/lib/use-content";
import { usePageConfig } from "@/lib/use-page-config";
import { CRM_COLLECTIONS, FAMILY_STATUS_TONE, type CrmFamily } from "@/lib/crm-types";

const TABS = [
  { value: "todas", label: "Todas las familias" },
  { value: "mias", label: "Mis familias" },
  { value: "activas", label: "Familias activas" },
  { value: "sin-actividad", label: "Sin actividad" },
];

const money = (n: number) => `$${n.toLocaleString("es")}`;
const moneyCompact = (n: number) => (n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M` : money(n));

/** Tamaño de familia agrupado para la dona, igual criterio que la captura de referencia. */
function sizeBucket(members: number) {
  if (members <= 2) return "1 - 2 miembros";
  if (members <= 4) return "3 - 4 miembros";
  if (members <= 6) return "5 - 6 miembros";
  return "7+ miembros";
}

export function FamiliasView() {
  const [tab, setTab] = useState("todas");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const families = useContent<CrmFamily>(CRM_COLLECTIONS.families);
  const { blocks, addBlock, updateBlock, removeBlock } = usePageConfig("/crm/familias");
  const composer = useBlockComposer(addBlock);

  const stats = useMemo(() => {
    const items = families.items;
    return {
      total: items.length,
      miembros: items.reduce((sum, f) => sum + f.members, 0),
      valorAnual: items.reduce((sum, f) => sum + f.annualValue, 0),
      polizas: items.reduce((sum, f) => sum + f.activePolicies, 0),
      renovacionesProximas: items.filter((f) => f.daysToRenewal <= 30).length,
    };
  }, [families.items]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return families.items.filter((f) => {
      if (tab === "mias" && !f.owned) return false;
      if (tab === "activas" && f.status !== "Activa") return false;
      if (tab === "sin-actividad" && f.status !== "Sin actividad") return false;
      if (filters.status && filters.status !== "Todos" && f.status !== filters.status) return false;
      if (filters.location && filters.location !== "Todas" && f.location !== filters.location) return false;
      if (filters.advisor && filters.advisor !== "Todos" && f.advisor !== filters.advisor) return false;
      if (!q) return true;
      return `${f.name} ${f.primaryContact} ${f.primaryEmail} ${f.primaryPhone}`.toLowerCase().includes(q);
    });
  }, [families.items, tab, search, filters]);

  const bySize = useMemo(() => {
    const buckets = ["1 - 2 miembros", "3 - 4 miembros", "5 - 6 miembros", "7+ miembros"];
    const map = new Map<string, number>();
    families.items.forEach((f) => map.set(sizeBucket(f.members), (map.get(sizeBucket(f.members)) ?? 0) + 1));
    return buckets
      .filter((b) => (map.get(b) ?? 0) > 0)
      .map((label, i) => ({ id: label, label, value: map.get(label) ?? 0, color: DONUT_COLORS[i % DONUT_COLORS.length] }));
  }, [families.items]);

  const upcomingRenewals = [...families.items]
    .sort((a, b) => a.daysToRenewal - b.daysToRenewal)
    .slice(0, 5)
    .map((f) => ({
      id: f.id,
      icon: "CalendarClock",
      color: f.daysToRenewal <= 30 ? "#f59e0b" : "#3b82f6",
      title: f.name,
      detail: `en ${f.daysToRenewal} días`,
      timeLabel: money(f.annualValue),
    }));

  const rows: RowData[] = filtered.map((f) => ({
    id: f.id,
    cells: {
      family: { kind: "initials", value: f.name.replace("Familia ", "").slice(0, 2).toUpperCase(), color: f.color, label: f.name, sub: f.primaryEmail },
      members: { kind: "stacked", value: String(f.members), sub: "Miembros" },
      contact: { kind: "person", name: f.primaryContact, role: f.primaryPhone },
      location: { kind: "text", value: f.location },
      policies: { kind: "stacked", value: String(f.activePolicies), sub: "Pólizas" },
      value: { kind: "number", value: money(f.annualValue) },
      renewal: { kind: "dateWithSub", value: f.nextRenewal, sub: `en ${f.daysToRenewal} días`, urgent: f.daysToRenewal <= 30 },
      status: { kind: "badge", value: f.status, tone: FAMILY_STATUS_TONE[f.status] },
      advisor: { kind: "person", name: f.advisor },
    },
  }));

  const selected = families.items.find((f) => f.id === selectedId) ?? null;
  const isEmpty = !families.loading && stats.total === 0;

  const sidePanel = (
    <>
      {selected && (
        <DetailDrawer
          data={{
            name: selected.name,
            subtitle: selected.location,
            fields: [
              { icon: "UserRound", value: `Contacto principal: ${selected.primaryContact}` },
              { icon: "Mail", value: selected.primaryEmail },
              { icon: "Phone", value: selected.primaryPhone },
            ],
            actions: [
              { icon: "Mail", label: "Enviar email" },
              { icon: "Phone", label: "Llamar" },
              { icon: "CalendarDays", label: "Agendar" },
              { icon: "MessageSquare", label: "Nota" },
            ],
            statusLabel: selected.status,
            statusTone: FAMILY_STATUS_TONE[selected.status],
          }}
          onClose={() => setSelectedId(null)}
          sections={[
            {
              id: "polizas",
              title: "Pólizas y valor",
              defaultOpen: true,
              content: (
                <InfoCard
                  rows={[
                    { label: "Miembros", value: String(selected.members) },
                    { label: "Pólizas activas", value: String(selected.activePolicies) },
                    { label: "Valor anual", value: money(selected.annualValue) },
                    { label: "Próxima renovación", value: `${selected.nextRenewal} — en ${selected.daysToRenewal} días` },
                  ]}
                />
              ),
            },
          ]}
        />
      )}

      {!selected && !isEmpty && (
        <BlockFrame title="Ficha rápida" icon="Users2">
          <p className="py-4 text-center text-sm text-white/35">
            Elige una familia de la tabla para ver su ficha aquí sin salir de la página.
          </p>
        </BlockFrame>
      )}

      {!isEmpty && (
        <>
          <BlockFrame title="Distribución por tamaño de familia" icon="PieChart">
            <DonutChart slices={bySize} centerValue={String(stats.total)} centerLabel="Total" />
          </BlockFrame>

          <BlockFrame title="Resumen familiar" icon="Landmark">
            <StatTileList
              tiles={[
                { id: "miembros", icon: "Users2", color: "#3b82f6", value: String(stats.miembros), label: "Miembros totales" },
                { id: "polizas", icon: "FileText", color: "#22c55e", value: String(stats.polizas), label: "Pólizas activas" },
                { id: "valor", icon: "Landmark", color: "#e0a836", value: moneyCompact(stats.valorAnual), label: "Valor anual de pólizas" },
              ]}
            />
          </BlockFrame>

          <BlockFrame title="Próximas renovaciones" icon="CalendarClock">
            <ActivityFeed entries={upcomingRenewals} compact />
          </BlockFrame>
        </>
      )}

    </>
  );

  return (
    <PageShell
      title="Familias"
      description="Gestiona los grupos familiares y sus miembros dentro de tu CRM."
      icon="Users2"
      starrable={false}
      sidePanel={sidePanel}
      blocks={{ items: blocks, onUpdate: updateBlock, onDelete: removeBlock, onAdd: composer.openFor }}
      headerActions={
        <>
          <Button variant="outline" size="sm" className="border-white/12 bg-white/[0.03] text-white/70 hover:bg-white/[0.06]">
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Importar
          </Button>
          <Button className="border-0 bg-gradient-to-b from-[#f5da93] to-[#c98f1f] font-semibold text-[#241a05] hover:brightness-105">
            <Plus className="mr-1.5 h-4 w-4" />
            Nueva familia
          </Button>
        </>
      }
    >
      {families.loading ? (
        <div className="surface-card">
          <LoadingState />
        </div>
      ) : isEmpty ? (
        <div className="surface-card">
          <EmptyState
            icon="Users2"
            title="Todavía no hay familias"
            description="Las familias agrupan a varios contactos bajo un mismo hogar y sus pólizas compartidas. Crea la primera o impórtalas desde una hoja de cálculo."
            actionLabel="Nueva familia"
            onAction={() => undefined}
          />
        </div>
      ) : (
        <>
          <KpiStrip
            items={[
              { id: "total", label: "Familias totales", value: stats.total.toLocaleString("es"), delta: "12.4%", sub: "vs mes anterior", icon: "Users2", tone: "violet" },
              { id: "miembros", label: "Miembros totales", value: String(stats.miembros), delta: "10.8%", sub: "vs mes anterior", icon: "Users", tone: "blue" },
              { id: "valor", label: "Valor anual de pólizas", value: moneyCompact(stats.valorAnual), delta: "18.7%", sub: "vs mes anterior", icon: "ShieldCheck", tone: "emerald" },
              { id: "polizas", label: "Pólizas activas", value: String(stats.polizas), delta: "9.6%", sub: "vs mes anterior", icon: "FileText", tone: "amber" },
              { id: "renovaciones", label: "Renovaciones próximas", value: String(stats.renovacionesProximas), delta: "15.3%", sub: "vs mes anterior", icon: "CalendarClock", tone: "rose" },
            ]}
          />

          <div className="surface-card mt-3 overflow-hidden">
            <div className="px-4 pt-3">
              <PageTabs tabs={TABS} active={tab} onChange={setTab} />
            </div>
            <div className="px-4 pb-4">
              <div className="mb-4">
                <FilterToolbar
                  search={search}
                  onSearchChange={setSearch}
                  searchPlaceholder="Buscar por nombre de familia, email o teléfono…"
                  filters={[
                    { id: "status", label: "Estado", options: [...new Set(families.items.map((f) => f.status))] },
                    { id: "location", label: "Ciudad", options: [...new Set(families.items.map((f) => f.location))] },
                    { id: "advisor", label: "Asesor", options: [...new Set(families.items.map((f) => f.advisor))] },
                  ]}
                  values={filters}
                  onFilterChange={(id, value) => setFilters((f) => ({ ...f, [id]: value }))}
                />
              </div>

              <DataTable
                columns={[
                  { id: "family", header: "Familia", sortable: true },
                  { id: "members", header: "Miembros", sortable: true, width: "100px" },
                  { id: "contact", header: "Contacto principal", sortable: true, width: "170px" },
                  { id: "location", header: "Ubicación", sortable: true, width: "150px" },
                  { id: "policies", header: "Pólizas activas", sortable: true, width: "110px" },
                  { id: "value", header: "Valor anual", sortable: true, width: "120px" },
                  { id: "renewal", header: "Próxima renovación", sortable: true, width: "150px" },
                  { id: "status", header: "Estado", sortable: true, width: "110px" },
                  { id: "advisor", header: "Asesor", sortable: true, width: "150px" },
                ]}
                rows={rows}
                onView={(id) => setSelectedId(id)}
                onDeleteRow={(id) => families.remove(id)}
              />
            </div>
          </div>
        </>
      )}

      <AddBlockDialog {...composer.dialogProps} />
    </PageShell>
  );
}
