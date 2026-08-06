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
import { RankedBarList } from "@/components/page-blocks/blocks/RankedBarList";
import { Button } from "@/components/ui/button";
import { useContent } from "@/lib/use-content";
import { usePageConfig } from "@/lib/use-page-config";
import { ACCOUNT_STATUS_TONE, CRM_COLLECTIONS, PRODUCT_TAG_TONE, type CrmAccount } from "@/lib/crm-types";

const TABS = [
  { value: "todas", label: "Todas las empresas" },
  { value: "mias", label: "Mis empresas" },
  { value: "activas", label: "Empresas activas" },
  { value: "clientes", label: "Clientes" },
  { value: "prospectos", label: "Prospectos" },
  { value: "sin-actividad", label: "Sin actividad" },
];

const money = (n: number) => `$${n.toLocaleString("es")}`;
const moneyCompact = (n: number) => (n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M` : money(n));

export function EmpresasView() {
  const [tab, setTab] = useState("todas");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const accounts = useContent<CrmAccount>(CRM_COLLECTIONS.accounts);
  const { blocks, addBlock, updateBlock, removeBlock } = usePageConfig("/crm/empresas");
  const composer = useBlockComposer(addBlock);

  const stats = useMemo(() => {
    const items = accounts.items;
    return {
      total: items.length,
      activas: items.filter((a) => a.status !== "Sin actividad").length,
      contactos: items.reduce((sum, a) => sum + a.contactsCount, 0),
      primas: items.reduce((sum, a) => sum + a.annualPremium, 0),
      polizas: items.reduce((sum, a) => sum + a.policiesCount, 0),
    };
  }, [accounts.items]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return accounts.items.filter((a) => {
      if (tab === "mias" && !a.owned) return false;
      if (tab === "activas" && a.status === "Sin actividad") return false;
      if (tab === "clientes" && a.status !== "Cliente") return false;
      if (tab === "prospectos" && a.status !== "Prospecto") return false;
      if (tab === "sin-actividad" && a.status !== "Sin actividad") return false;
      if (filters.industry && filters.industry !== "Todas" && a.industry !== filters.industry) return false;
      if (filters.status && filters.status !== "Todos" && a.status !== filters.status) return false;
      if (filters.advisor && filters.advisor !== "Todos" && a.advisor !== filters.advisor) return false;
      if (!q) return true;
      return `${a.name} ${a.industry} ${a.primaryContact}`.toLowerCase().includes(q);
    });
  }, [accounts.items, tab, search, filters]);

  const byIndustry = useMemo(() => {
    const map = new Map<string, number>();
    accounts.items.forEach((a) => map.set(a.industry, (map.get(a.industry) ?? 0) + 1));
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([label, value], i) => ({ id: label, label, value, color: DONUT_COLORS[i % DONUT_COLORS.length] }));
  }, [accounts.items]);

  const recent = [...accounts.items]
    .sort((a, b) => b.order - a.order)
    .slice(0, 5)
    .map((a) => ({ id: a.id, label: a.name, value: a.contactsCount, color: a.color, person: true }));

  const rows: RowData[] = filtered.map((a) => ({
    id: a.id,
    cells: {
      account: { kind: "initials", value: a.name.slice(0, 2).toUpperCase(), color: a.color, label: a.name, sub: a.location },
      industry: { kind: "text", value: a.industry },
      contacts: { kind: "stacked", value: String(a.contactsCount), sub: "Contactos" },
      status: { kind: "badge", value: a.status, tone: ACCOUNT_STATUS_TONE[a.status] },
      products: { kind: "badgeList", items: a.products.map((p) => ({ label: p, tone: PRODUCT_TAG_TONE[p] ?? "neutral" })) },
      premium: { kind: "number", value: money(a.annualPremium) },
      advisor: { kind: "person", name: a.advisor },
      activity: { kind: "activity", value: a.lastActivity, sub: a.lastActivityAt },
    },
  }));

  const selected = accounts.items.find((a) => a.id === selectedId) ?? null;
  const isEmpty = !accounts.loading && stats.total === 0;

  const sidePanel = (
    <>
      {selected && (
        <DetailDrawer
          data={{
            name: selected.name,
            subtitle: `${selected.industry} · ${selected.legalType}`,
            fields: [
              { icon: "MapPin", value: selected.location },
              { icon: "Users", value: `${selected.employees} empleados` },
              { icon: "UserRound", value: `Contacto principal: ${selected.primaryContact}` },
            ],
            actions: [
              { icon: "Mail", label: "Enviar email" },
              { icon: "Phone", label: "Llamar" },
              { icon: "CalendarDays", label: "Agendar" },
              { icon: "MessageSquare", label: "Nota" },
            ],
            statusLabel: selected.status,
            statusTone: ACCOUNT_STATUS_TONE[selected.status],
          }}
          onClose={() => setSelectedId(null)}
          sections={[
            {
              id: "productos",
              title: "Productos principales",
              defaultOpen: true,
              content: (
                <div className="flex flex-wrap gap-1.5">
                  {selected.products.map((p) => (
                    <span
                      key={p}
                      className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium"
                      style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.75)" }}
                    >
                      {p}
                    </span>
                  ))}
                </div>
              ),
            },
            {
              id: "financiero",
              title: "Información financiera",
              content: (
                <InfoCard
                  rows={[
                    { label: "Primas anuales", value: money(selected.annualPremium) },
                    { label: "Pólizas activas", value: String(selected.policiesCount) },
                    { label: "Contactos asociados", value: String(selected.contactsCount) },
                  ]}
                />
              ),
            },
          ]}
        />
      )}

      {!selected && !isEmpty && (
        <BlockFrame title="Ficha rápida" icon="Building2">
          <p className="py-4 text-center text-sm text-white/35">
            Elige una empresa de la tabla para ver su ficha aquí sin salir de la página.
          </p>
        </BlockFrame>
      )}

      {!isEmpty && (
        <>
          <BlockFrame title="Distribución por industria" icon="PieChart">
            <DonutChart slices={byIndustry} centerValue={String(stats.total)} centerLabel="Total" />
          </BlockFrame>

          <BlockFrame title="Resumen financiero" icon="Landmark">
            <StatTileList
              tiles={[
                { id: "primas", icon: "Landmark", color: "#e0a836", value: moneyCompact(stats.primas), label: "Primas anuales totales" },
                { id: "polizas", icon: "FileText", color: "#3b82f6", value: String(stats.polizas), label: "Pólizas activas" },
                {
                  id: "promedio",
                  icon: "TrendingUp",
                  color: "#22c55e",
                  value: stats.total > 0 ? moneyCompact(stats.primas / stats.total) : "—",
                  label: "Prima promedio por empresa",
                },
              ]}
            />
          </BlockFrame>

          <BlockFrame title="Empresas con más contactos" icon="Users">
            <RankedBarList rows={recent} />
          </BlockFrame>
        </>
      )}

    </>
  );

  return (
    <PageShell
      title="Empresas"
      description="Gestiona las empresas y organizaciones dentro de tu CRM."
      icon="Building2"
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
            Nueva empresa
          </Button>
        </>
      }
    >
      {accounts.loading ? (
        <div className="surface-card">
          <LoadingState />
        </div>
      ) : isEmpty ? (
        <div className="surface-card">
          <EmptyState
            icon="Building2"
            title="Todavía no hay empresas"
            description="Las empresas agrupan a los contactos que trabajan en ellas y a los productos contratados a su nombre. Crea la primera o impórtalas desde una hoja de cálculo."
            actionLabel="Nueva empresa"
            onAction={() => undefined}
          />
        </div>
      ) : (
        <>
          <KpiStrip
            items={[
              { id: "total", label: "Empresas totales", value: stats.total.toLocaleString("es"), delta: "12.4%", sub: "vs mes anterior", icon: "Building2", tone: "violet" },
              { id: "activas", label: "Empresas activas", value: String(stats.activas), delta: "10.8%", sub: "vs mes anterior", icon: "Briefcase", tone: "blue" },
              { id: "contactos", label: "Contactos asociados", value: String(stats.contactos), delta: "15.3%", sub: "vs mes anterior", icon: "Users", tone: "emerald" },
              { id: "primas", label: "Primas anuales", value: moneyCompact(stats.primas), delta: "18.7%", sub: "vs mes anterior", icon: "ShieldCheck", tone: "amber" },
              { id: "polizas", label: "Pólizas activas", value: String(stats.polizas), delta: "9.6%", sub: "vs mes anterior", icon: "FileText", tone: "rose" },
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
                  searchPlaceholder="Buscar por nombre de empresa, industria…"
                  filters={[
                    { id: "industry", label: "Industria", options: [...new Set(accounts.items.map((a) => a.industry))] },
                    { id: "status", label: "Estado", options: [...new Set(accounts.items.map((a) => a.status))] },
                    { id: "advisor", label: "Asesor", options: [...new Set(accounts.items.map((a) => a.advisor))] },
                  ]}
                  values={filters}
                  onFilterChange={(id, value) => setFilters((f) => ({ ...f, [id]: value }))}
                />
              </div>

              <DataTable
                columns={[
                  { id: "account", header: "Empresa", sortable: true },
                  { id: "industry", header: "Industria", sortable: true, width: "160px" },
                  { id: "contacts", header: "Contactos", sortable: true, width: "100px" },
                  { id: "status", header: "Estado", sortable: true, width: "120px" },
                  { id: "products", header: "Productos principales", width: "220px" },
                  { id: "premium", header: "Primas anuales", sortable: true, width: "130px" },
                  { id: "advisor", header: "Asesor", sortable: true, width: "160px" },
                  { id: "activity", header: "Última actividad", width: "160px" },
                ]}
                rows={rows}
                onView={(id) => setSelectedId(id)}
                onDeleteRow={(id) => accounts.remove(id)}
              />
            </div>
          </div>
        </>
      )}

      <AddBlockDialog {...composer.dialogProps} />
    </PageShell>
  );
}
