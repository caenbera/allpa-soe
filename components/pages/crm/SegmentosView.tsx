"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { PageShell } from "@/components/page-blocks/PageShell";
import { AddBlockButton, AddBlockDialog } from "@/components/page-blocks/AddBlockDialog";
import { BlockRenderer } from "@/components/page-blocks/BlockRenderer";
import { BlockFrame } from "@/components/page-blocks/BlockFrame";
import { EmptyState, LoadingState } from "@/components/page-blocks/EmptyState";
import { KpiStrip } from "@/components/page-blocks/blocks/KpiStrip";
import { FilterToolbar } from "@/components/page-blocks/blocks/FilterToolbar";
import { DataTable, type RowData } from "@/components/page-blocks/blocks/DataTable";
import { DonutChart, DONUT_COLORS } from "@/components/page-blocks/blocks/DonutChart";
import { RankedBarList } from "@/components/page-blocks/blocks/RankedBarList";
import { Button } from "@/components/ui/button";
import { useContent } from "@/lib/use-content";
import { usePageConfig } from "@/lib/use-page-config";
import { CRM_COLLECTIONS, type CrmSegment } from "@/lib/crm-types";

export function SegmentosView() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [createOpen, setCreateOpen] = useState(false);

  const segments = useContent<CrmSegment>(CRM_COLLECTIONS.segments);
  const { blocks, addBlock, updateBlock, removeBlock } = usePageConfig("/crm/segmentos");

  const stats = useMemo(() => {
    const items = segments.items;
    return {
      total: items.length,
      activos: items.filter((s) => s.active).length,
      inactivos: items.filter((s) => !s.active).length,
      contactos: items.reduce((sum, s) => sum + s.contacts, 0),
      empresas: items.reduce((sum, s) => sum + s.accounts, 0),
    };
  }, [segments.items]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return segments.items.filter((s) => {
      if (filters.state && filters.state !== "Todos" && (filters.state === "Activo") !== s.active) return false;
      if (filters.entity && filters.entity !== "Todos" && s.entity !== filters.entity) return false;
      if (filters.author && filters.author !== "Todos" && s.createdBy !== filters.author) return false;
      if (!q) return true;
      return `${s.name} ${s.description} ${s.createdBy}`.toLowerCase().includes(q);
    });
  }, [segments.items, search, filters]);

  const byState = [
    { id: "activos", label: "Activos", value: stats.activos, color: "#22c55e" },
    { id: "inactivos", label: "Inactivos", value: stats.inactivos, color: "#94a3b8" },
  ].filter((s) => s.value > 0);

  const byEntity = useMemo(() => {
    const counts = new Map<string, number>();
    segments.items.forEach((s) => counts.set(s.entity, (counts.get(s.entity) ?? 0) + 1));
    return Array.from(counts.entries()).map(([label, value], i) => ({
      id: label,
      label,
      value,
      color: DONUT_COLORS[i % DONUT_COLORS.length],
    }));
  }, [segments.items]);

  const topByContacts = useMemo(
    () =>
      [...segments.items]
        .sort((a, b) => b.contacts + b.accounts - (a.contacts + a.accounts))
        .slice(0, 5)
        .map((s, i) => ({
          id: s.id,
          label: s.name,
          value: s.contacts + s.accounts,
          color: DONUT_COLORS[i % DONUT_COLORS.length],
        })),
    [segments.items]
  );

  const rows: RowData[] = filtered.map((s) => ({
    id: s.id,
    cells: {
      segment: { kind: "source", icon: s.icon, value: s.name, sub: s.entity },
      description: { kind: "text", value: s.description },
      entity: { kind: "badge", value: s.entity, tone: s.entity === "Empresa" ? "blue" : "violet" },
      contacts: { kind: "number", value: s.contacts.toLocaleString("es") },
      accounts: { kind: "number", value: s.accounts.toLocaleString("es") },
      createdBy: { kind: "person", name: s.createdBy },
      createdAt: { kind: "text", value: s.createdAt },
      state: { kind: "status", value: s.active ? "Activo" : "Inactivo", tone: s.active ? "emerald" : "neutral" },
    },
  }));

  const isEmpty = !segments.loading && stats.total === 0;

  const sidePanel = (
    <>
      {!isEmpty && (
        <>
          <BlockFrame title="Resumen de segmentos" icon="PieChart">
            <DonutChart slices={byState} centerValue={String(stats.total)} centerLabel="Total" />
          </BlockFrame>

          <BlockFrame title="Segmentos por tipo" icon="Filter">
            <DonutChart slices={byEntity} centerValue={String(stats.total)} centerLabel="Total" />
          </BlockFrame>

          <BlockFrame title="Top 5 segmentos por alcance" icon="BarChart3">
            <RankedBarList rows={topByContacts} />
          </BlockFrame>
        </>
      )}

      {blocks.map((block) => (
        <BlockRenderer
          key={block.id}
          block={block}
          onUpdate={(patch) => updateBlock(block.id, patch)}
          onDelete={() => removeBlock(block.id)}
        />
      ))}
      <AddBlockButton onClick={() => setCreateOpen(true)} />
    </>
  );

  return (
    <PageShell
      title="Segmentos"
      description="Crea, administra y utiliza segmentos para organizarte y comunicarte con grupos específicos de contactos y empresas."
      icon="Filter"
      starrable={false}
      sidePanel={sidePanel}
      headerActions={
        <Button className="border-0 bg-gradient-to-b from-[#f5da93] to-[#c98f1f] font-semibold text-[#241a05] hover:brightness-105">
          <Plus className="mr-1.5 h-4 w-4" />
          Nuevo segmento
        </Button>
      }
    >
      {segments.loading ? (
        <div className="surface-card">
          <LoadingState />
        </div>
      ) : isEmpty ? (
        <div className="surface-card">
          <EmptyState
            icon="Filter"
            title="Todavía no hay segmentos"
            description="Un segmento es un grupo que se define por un criterio —clientes con renovación próxima, empresas medianas, referidos del mes— y se mantiene solo. Sirve para dirigir campañas sin rehacer el filtro cada vez."
            actionLabel="Nuevo segmento"
            onAction={() => undefined}
          />
        </div>
      ) : (
        <>
          <KpiStrip
            items={[
              { id: "total", label: "Total de segmentos", value: String(stats.total), delta: "20%", sub: "vs mes anterior", icon: "Filter", tone: "violet" },
              { id: "activos", label: "Segmentos activos", value: String(stats.activos), delta: "12.5%", sub: "vs mes anterior", icon: "BadgeCheck", tone: "emerald" },
              { id: "contactos", label: "Contactos en segmentos", value: stats.contactos.toLocaleString("es"), delta: "18.2%", sub: "vs mes anterior", icon: "Users", tone: "blue" },
              { id: "empresas", label: "Empresas en segmentos", value: stats.empresas.toLocaleString("es"), delta: "16.7%", sub: "vs mes anterior", icon: "Building2", tone: "amber" },
              { id: "inactivos", label: "Segmentos inactivos", value: String(stats.inactivos), sub: "sin uso reciente", icon: "PauseCircle", tone: "rose" },
            ]}
          />

          <div className="surface-card mt-3 p-4">
            <div className="mb-4">
              <FilterToolbar
                search={search}
                onSearchChange={setSearch}
                searchPlaceholder="Buscar segmentos…"
                filters={[
                  { id: "state", label: "Estado", options: ["Activo", "Inactivo"] },
                  { id: "entity", label: "Tipo", options: [...new Set(segments.items.map((s) => s.entity))] },
                  { id: "author", label: "Creado por", options: [...new Set(segments.items.map((s) => s.createdBy))] },
                ]}
                values={filters}
                onFilterChange={(id, value) => setFilters((f) => ({ ...f, [id]: value }))}
              />
            </div>

            <DataTable
              columns={[
                { id: "segment", header: "Segmento", sortable: true, width: "200px" },
                { id: "description", header: "Descripción" },
                { id: "entity", header: "Tipo", sortable: true, width: "120px" },
                { id: "contacts", header: "Contactos", sortable: true, width: "110px" },
                { id: "accounts", header: "Empresas", sortable: true, width: "110px" },
                { id: "createdBy", header: "Creado por", sortable: true, width: "160px" },
                { id: "createdAt", header: "Fecha de creación", width: "140px" },
                { id: "state", header: "Estado", sortable: true, width: "110px" },
              ]}
              rows={rows}
              onDeleteRow={(id) => segments.remove(id)}
            />
          </div>
        </>
      )}

      <AddBlockDialog open={createOpen} onOpenChange={setCreateOpen} onCreate={addBlock} />
    </PageShell>
  );
}
