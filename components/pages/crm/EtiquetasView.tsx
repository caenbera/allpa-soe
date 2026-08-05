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
import { CRM_COLLECTIONS, type CrmTag } from "@/lib/crm-types";

/** Las iniciales de "Usada en" que trae cada etiqueta: C=Contactos, E=Empresas, N=Negocios. */
const USED_IN_LABEL: Record<string, string> = { C: "Contactos", E: "Empresas", N: "Negocios" };

export function EtiquetasView() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [createOpen, setCreateOpen] = useState(false);

  const tags = useContent<CrmTag>(CRM_COLLECTIONS.tags);
  const { blocks, addBlock, updateBlock, removeBlock } = usePageConfig("/crm/etiquetas");

  const stats = useMemo(() => {
    const items = tags.items;
    return {
      total: items.length,
      activas: items.filter((t) => t.active).length,
      aplicadas: items.reduce((sum, t) => sum + t.records, 0),
      contactos: items.filter((t) => t.entity === "Contacto").reduce((sum, t) => sum + t.records, 0),
      empresas: items.filter((t) => t.entity === "Empresa").reduce((sum, t) => sum + t.records, 0),
    };
  }, [tags.items]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tags.items.filter((t) => {
      if (filters.entity && filters.entity !== "Todos" && t.entity !== filters.entity) return false;
      if (filters.category && filters.category !== "Todas" && t.category !== filters.category) return false;
      if (filters.state && filters.state !== "Todas" && (filters.state === "Activa") !== t.active) return false;
      if (!q) return true;
      return `${t.name} ${t.category} ${t.createdBy}`.toLowerCase().includes(q);
    });
  }, [tags.items, search, filters]);

  const byCategory = useMemo(() => {
    const counts = new Map<string, number>();
    tags.items.forEach((t) => counts.set(t.category, (counts.get(t.category) ?? 0) + 1));
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([label, value], i) => ({ id: label, label, value, color: DONUT_COLORS[i % DONUT_COLORS.length] }));
  }, [tags.items]);

  const mostUsed = useMemo(
    () =>
      [...tags.items]
        .sort((a, b) => b.records - a.records)
        .slice(0, 5)
        .map((t, i) => ({ id: t.id, label: t.name, value: t.records, color: DONUT_COLORS[i % DONUT_COLORS.length] })),
    [tags.items]
  );

  const rows: RowData[] = filtered.map((t) => ({
    id: t.id,
    cells: {
      tag: { kind: "badge", value: t.name, tone: t.tone },
      entity: { kind: "source", icon: t.entity === "Empresa" ? "Building2" : "UserRound", value: t.entity },
      category: { kind: "text", value: t.category },
      usedIn: { kind: "badgeList", items: t.usedIn.map((letter) => ({ label: USED_IN_LABEL[letter] ?? letter, tone: "neutral" as const })) },
      records: { kind: "number", value: t.records.toLocaleString("es") },
      createdBy: { kind: "person", name: t.createdBy },
      createdAt: { kind: "text", value: t.createdAt },
      state: { kind: "status", value: t.active ? "Activa" : "Inactiva", tone: t.active ? "emerald" : "neutral" },
    },
  }));

  const isEmpty = !tags.loading && stats.total === 0;

  const sidePanel = (
    <>
      {!isEmpty && (
        <>
          <BlockFrame title="Etiquetas por categoría" icon="PieChart">
            <DonutChart slices={byCategory} centerValue={String(stats.total)} centerLabel="Total" />
          </BlockFrame>

          <BlockFrame title="Etiquetas más usadas" icon="BarChart3">
            <RankedBarList rows={mostUsed} />
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
      title="Etiquetas"
      description="Crea, organiza y gestiona etiquetas para categorizar tus contactos, empresas y negocios."
      icon="Tags"
      starrable={false}
      sidePanel={sidePanel}
      headerActions={
        <Button className="border-0 bg-gradient-to-b from-[#f5da93] to-[#c98f1f] font-semibold text-[#241a05] hover:brightness-105">
          <Plus className="mr-1.5 h-4 w-4" />
          Nueva etiqueta
        </Button>
      }
    >
      {tags.loading ? (
        <div className="surface-card">
          <LoadingState />
        </div>
      ) : isEmpty ? (
        <div className="surface-card">
          <EmptyState
            icon="Tags"
            title="Todavía no hay etiquetas"
            description="Las etiquetas agrupan contactos y empresas por lo que tienen en común —un interés, un producto, una fase— para que luego puedas filtrarlos y crear segmentos."
            actionLabel="Nueva etiqueta"
            onAction={() => undefined}
          />
        </div>
      ) : (
        <>
          <KpiStrip
            items={[
              { id: "total", label: "Total de etiquetas", value: String(stats.total), delta: "12.5%", sub: "vs mes anterior", icon: "Tags", tone: "violet" },
              { id: "activas", label: "Etiquetas activas", value: String(stats.activas), delta: "14.3%", sub: "vs mes anterior", icon: "BadgeCheck", tone: "emerald" },
              { id: "aplicadas", label: "Etiquetas aplicadas", value: stats.aplicadas.toLocaleString("es"), delta: "18.7%", sub: "vs mes anterior", icon: "Tag", tone: "amber" },
              { id: "contactos", label: "Contactos etiquetados", value: stats.contactos.toLocaleString("es"), delta: "16.1%", sub: "vs mes anterior", icon: "Users", tone: "blue" },
              { id: "empresas", label: "Empresas etiquetadas", value: stats.empresas.toLocaleString("es"), delta: "10.8%", sub: "vs mes anterior", icon: "Building2", tone: "rose" },
            ]}
          />

          <div className="surface-card mt-3 p-4">
            <div className="mb-4">
              <FilterToolbar
                search={search}
                onSearchChange={setSearch}
                searchPlaceholder="Buscar etiquetas…"
                filters={[
                  { id: "entity", label: "Tipo", options: [...new Set(tags.items.map((t) => t.entity))] },
                  { id: "category", label: "Categoría", options: [...new Set(tags.items.map((t) => t.category))] },
                  { id: "state", label: "Estado", options: ["Activa", "Inactiva"] },
                ]}
                values={filters}
                onFilterChange={(id, value) => setFilters((f) => ({ ...f, [id]: value }))}
              />
            </div>

            <DataTable
              columns={[
                { id: "tag", header: "Etiqueta", sortable: true, width: "180px" },
                { id: "entity", header: "Tipo", sortable: true, width: "140px" },
                { id: "category", header: "Categoría", sortable: true, width: "130px" },
                { id: "usedIn", header: "Usada en", width: "210px" },
                { id: "records", header: "Registros", sortable: true, width: "110px" },
                { id: "createdBy", header: "Creada por", sortable: true, width: "160px" },
                { id: "createdAt", header: "Fecha de creación", width: "140px" },
                { id: "state", header: "Estado", sortable: true, width: "110px" },
              ]}
              rows={rows}
              onDeleteRow={(id) => tags.remove(id)}
            />
          </div>
        </>
      )}

      <AddBlockDialog open={createOpen} onOpenChange={setCreateOpen} onCreate={addBlock} />
    </PageShell>
  );
}
