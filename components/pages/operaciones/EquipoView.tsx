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
import { DonutChart, DONUT_COLORS } from "@/components/page-blocks/blocks/DonutChart";
import { RankedBarList } from "@/components/page-blocks/blocks/RankedBarList";
import { StatTileList } from "@/components/page-blocks/blocks/StatTileList";
import { QuickActionGrid } from "@/components/page-blocks/blocks/QuickActionGrid";
import { Button } from "@/components/ui/button";
import { useContent } from "@/lib/use-content";
import { usePageConfig } from "@/lib/use-page-config";
import { MEMBER_STATUS_TONE, OPS_COLLECTIONS, type OpsMember } from "@/lib/ops-types";

const TABS = [
  { value: "todos", label: "Todos los miembros" },
  { value: "Activo", label: "Activos" },
  { value: "Invitación pendiente", label: "Invitaciones pendientes" },
  { value: "Inactivo", label: "Inactivos" },
];

export function EquipoView() {
  const [tab, setTab] = useState("todos");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});

  const team = useContent<OpsMember>(OPS_COLLECTIONS.team);
  const { blocks, addBlock, updateBlock, removeBlock } = usePageConfig("/operaciones/equipo");
  const composer = useBlockComposer(addBlock);

  const stats = useMemo(() => {
    const items = team.items;
    return {
      total: items.length,
      activos: items.filter((m) => m.status === "Activo").length,
      invitaciones: items.filter((m) => m.status === "Invitación pendiente").length,
      inactivos: items.filter((m) => m.status === "Inactivo").length,
      departamentos: new Set(items.map((m) => m.department)).size,
      roles: new Set(items.map((m) => m.role)).size,
    };
  }, [team.items]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return team.items.filter((m) => {
      if (tab !== "todos" && m.status !== tab) return false;
      if (filters.department && filters.department !== "Todos" && m.department !== filters.department) return false;
      if (filters.role && filters.role !== "Todos" && m.role !== filters.role) return false;
      if (!q) return true;
      return `${m.name} ${m.email} ${m.role}`.toLowerCase().includes(q);
    });
  }, [team.items, tab, search, filters]);

  const porDepartamento = useMemo(() => {
    const counts = new Map<string, number>();
    team.items.forEach((m) => counts.set(m.department, (counts.get(m.department) ?? 0) + 1));
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([label, value], i) => ({ id: label, label, value, color: DONUT_COLORS[i % DONUT_COLORS.length] }));
  }, [team.items]);

  const porRol = useMemo(() => {
    const counts = new Map<string, number>();
    team.items.forEach((m) => counts.set(m.role, (counts.get(m.role) ?? 0) + 1));
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([label, value], i) => ({ id: label, label, value, color: DONUT_COLORS[i % DONUT_COLORS.length] }));
  }, [team.items]);

  /** Cuánto lleva resuelto cada quien de lo que tiene asignado. */
  const carga = useMemo(
    () =>
      team.items
        .filter((m) => m.tasksTotal > 0)
        .sort((a, b) => b.tasksTotal - a.tasksTotal)
        .map((m, i) => ({
          id: m.id,
          label: m.name,
          value: Math.round((m.tasksDone / m.tasksTotal) * 100),
          color: DONUT_COLORS[i % DONUT_COLORS.length],
          person: true,
        })),
    [team.items]
  );

  const rows: RowData[] = filtered.map((m) => ({
    id: m.id,
    cells: {
      member: { kind: "person", name: m.name, role: m.code },
      role: { kind: "badge", value: m.role, tone: m.roleTone },
      department: { kind: "text", value: m.department },
      email: { kind: "text", value: m.email },
      status: { kind: "status", value: m.status, tone: MEMBER_STATUS_TONE[m.status] },
      workload:
        m.tasksTotal > 0
          ? { kind: "progress", value: Math.round((m.tasksDone / m.tasksTotal) * 100), label: `${m.tasksDone}/${m.tasksTotal}` }
          : { kind: "text", value: "—" },
      lastAccess: { kind: "text", value: m.lastAccess },
    },
  }));

  const isEmpty = !team.loading && stats.total === 0;

  const sidePanel = isEmpty ? null : (
    <>
      <BlockFrame title="Resumen del equipo" icon="Users">
        <StatTileList
          tiles={[
            { id: "total", icon: "Users", color: "#a78bfa", value: String(stats.total), label: "Total de miembros" },
            { id: "activos", icon: "CheckCircle2", color: "#22c55e", value: String(stats.activos), label: "Activos" },
            { id: "invit", icon: "Clock", color: "#f59e0b", value: String(stats.invitaciones), label: "Invitaciones pendientes" },
            { id: "inactivos", icon: "UserMinus", color: "#94a3b8", value: String(stats.inactivos), label: "Inactivos" },
          ]}
        />
      </BlockFrame>

      <BlockFrame title="Distribución por departamento" icon="PieChart">
        <DonutChart slices={porDepartamento} centerValue={String(stats.total)} centerLabel="Total" />
      </BlockFrame>

      <BlockFrame title="Distribución por rol" icon="BarChart3">
        <RankedBarList rows={porRol} />
      </BlockFrame>

      <BlockFrame title="Acciones rápidas" icon="Zap">
        <QuickActionGrid
          actions={[
            { id: "invitar", icon: "UserPlus", label: "Invitar miembro" },
            { id: "roles", icon: "ShieldCheck", label: "Gestionar roles" },
            { id: "tareas", icon: "ClipboardList", label: "Ver tareas", href: "/operaciones/tareas" },
            { id: "exportar", icon: "Download", label: "Exportar lista" },
          ]}
        />
      </BlockFrame>
    </>
  );

  return (
    <PageShell
      title="Equipo"
      description="Gestiona los miembros del equipo de operaciones y sus roles."
      icon="Users"
      starrable={false}
      sidePanel={sidePanel}
      blocks={{ items: blocks, onUpdate: updateBlock, onDelete: removeBlock, onAdd: composer.openFor }}
      headerActions={
        <>
          <Button variant="outline" size="sm" className="border-white/12 bg-white/[0.03] text-white/70 hover:bg-white/[0.06]">
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Exportar
          </Button>
          <Button className="border-0 bg-gradient-to-b from-[#f5da93] to-[#c98f1f] font-semibold text-[#241a05] hover:brightness-105">
            <Plus className="mr-1.5 h-4 w-4" />
            Invitar miembro
          </Button>
        </>
      }
    >
      {team.loading ? (
        <div className="surface-card">
          <LoadingState />
        </div>
      ) : isEmpty ? (
        <div className="surface-card">
          <EmptyState
            icon="Users"
            title="Todavía no hay nadie en el equipo"
            description="Invita a las personas que van a operar el día a día y asígnales su rol y departamento."
            actionLabel="Invitar miembro"
            onAction={() => undefined}
          />
        </div>
      ) : (
        <>
          <KpiStrip
            layout="inline"
            items={[
              { id: "total", label: "Total de miembros", value: String(stats.total), sub: "en operaciones", icon: "Users", tone: "violet" },
              { id: "activos", label: "Activos", value: String(stats.activos), sub: `${Math.round((stats.activos / stats.total) * 100)}% del total`, icon: "CheckCircle2", tone: "emerald" },
              { id: "invit", label: "Invitaciones pendientes", value: String(stats.invitaciones), sub: "sin aceptar", icon: "Clock", tone: "amber" },
              { id: "dep", label: "Departamentos", value: String(stats.departamentos), sub: "distintos", icon: "Building2", tone: "blue" },
              { id: "roles", label: "Roles", value: String(stats.roles), sub: "distintos", icon: "ShieldCheck", tone: "rose" },
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
                  searchPlaceholder="Buscar miembro, correo o rol…"
                  filters={[
                    { id: "department", label: "Departamento", options: [...new Set(team.items.map((m) => m.department))] },
                    { id: "role", label: "Rol", options: [...new Set(team.items.map((m) => m.role))] },
                  ]}
                  values={filters}
                  onFilterChange={(id, value) => setFilters((f) => ({ ...f, [id]: value }))}
                />
              </div>

              <DataTable
                columns={[
                  { id: "member", header: "Miembro", sortable: true },
                  { id: "role", header: "Rol", sortable: true, width: "170px" },
                  { id: "department", header: "Departamento", sortable: true, width: "160px" },
                  { id: "email", header: "Correo", width: "220px" },
                  { id: "status", header: "Estado", sortable: true, width: "160px" },
                  { id: "workload", header: "Carga", sortable: true, width: "150px" },
                  { id: "lastAccess", header: "Último acceso", width: "140px" },
                ]}
                rows={rows}
                emptyMessage="No hay miembros que coincidan con los filtros."
              />
            </div>
          </div>

          <BlockFrame title="Carga de trabajo del equipo" icon="BarChart3">
            <RankedBarList rows={carga} formatValue={(n) => `${n}%`} />
          </BlockFrame>
        </>
      )}

      <AddBlockDialog {...composer.dialogProps} />
    </PageShell>
  );
}
