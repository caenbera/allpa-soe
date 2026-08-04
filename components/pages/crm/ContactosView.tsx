"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Plus } from "lucide-react";
import { PageShell, PageTabs } from "@/components/page-blocks/PageShell";
import { AddBlockButton, AddBlockDialog } from "@/components/page-blocks/AddBlockDialog";
import { BlockRenderer } from "@/components/page-blocks/BlockRenderer";
import { BlockFrame } from "@/components/page-blocks/BlockFrame";
import { EmptyState, LoadingState } from "@/components/page-blocks/EmptyState";
import { KpiStrip } from "@/components/page-blocks/blocks/KpiStrip";
import { FilterToolbar } from "@/components/page-blocks/blocks/FilterToolbar";
import { DataTable, type RowData } from "@/components/page-blocks/blocks/DataTable";
import { DetailDrawer } from "@/components/page-blocks/blocks/DetailDrawer";
import { TagCloud } from "@/components/page-blocks/blocks/TagCloud";
import { InfoCard } from "@/components/page-blocks/blocks/InfoCard";
import { Button } from "@/components/ui/button";
import { useContent } from "@/lib/use-content";
import { usePageConfig } from "@/lib/use-page-config";
import { contactProfilePath } from "@/lib/page-registry";
import { CRM_COLLECTIONS, CONTACT_STATUS_TONE, type Contact } from "@/lib/crm-types";

const TABS = [
  { value: "todos", label: "Todos los contactos" },
  { value: "mios", label: "Mis contactos" },
  { value: "calientes", label: "Leads calientes" },
  { value: "clientes", label: "Clientes" },
  { value: "referidos", label: "Referidos" },
];

export function ContactosView() {
  const router = useRouter();
  const [tab, setTab] = useState("todos");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const contacts = useContent<Contact>(CRM_COLLECTIONS.contacts);
  const { blocks, addBlock, updateBlock, removeBlock } = usePageConfig("/crm/contactos");

  const counts = useMemo(() => {
    const items = contacts.items;
    return {
      total: items.length,
      nuevos: items.filter((c) => c.status === "Nuevo").length,
      calientes: items.filter((c) => c.status === "Lead caliente").length,
      citas: items.filter((c) => c.status === "Cita agendada").length,
      clientes: items.filter((c) => c.isClient).length,
    };
  }, [contacts.items]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return contacts.items.filter((c) => {
      if (tab === "mios" && !c.owned) return false;
      if (tab === "calientes" && c.status !== "Lead caliente") return false;
      if (tab === "clientes" && !c.isClient) return false;
      if (tab === "referidos" && !c.referred) return false;
      if (filters.source && filters.source !== "Todos" && c.sourceChannel !== filters.source) return false;
      if (filters.status && filters.status !== "Todos" && c.status !== filters.status) return false;
      if (filters.advisor && filters.advisor !== "Todos" && c.advisor !== filters.advisor) return false;
      if (!q) return true;
      return `${c.name} ${c.email} ${c.phone} ${c.mainInterest}`.toLowerCase().includes(q);
    });
  }, [contacts.items, tab, search, filters]);

  const rows: RowData[] = filtered.map((c) => ({
    id: c.id,
    cells: {
      contact: { kind: "initials", value: c.name.slice(0, 2).toUpperCase(), color: "#3b82f6", label: c.name, sub: c.email },
      status: { kind: "badge", value: c.status, tone: CONTACT_STATUS_TONE[c.status] },
      source: { kind: "source", icon: c.sourceIcon, value: c.sourceChannel, sub: c.sourceDetail },
      advisor: { kind: "person", name: c.advisor },
      activity: { kind: "activity", value: c.lastActivity, sub: c.lastActivityAt },
      interest: { kind: "badge", value: c.mainInterest, tone: "violet" },
      score: { kind: "score", value: c.score },
    },
  }));

  const selected = contacts.items.find((c) => c.id === selectedId) ?? null;
  const isEmpty = !contacts.loading && counts.total === 0;

  const sidePanel = (
    <>
      {selected && (
        <DetailDrawer
          data={{
            name: selected.name,
            subtitle: selected.role,
            fields: [
              { icon: "Mail", value: selected.email },
              { icon: "Phone", value: selected.phone },
              { icon: "MapPin", value: selected.location },
            ],
            actions: [
              { icon: "Mail", label: "Enviar email" },
              { icon: "Phone", label: "Llamar" },
              { icon: "CalendarDays", label: "Agendar" },
              { icon: "MessageSquare", label: "Nota" },
            ],
            statusLabel: selected.status,
            statusTone: CONTACT_STATUS_TONE[selected.status],
            score: selected.score,
            ctaLabel: "Ver perfil completo",
            ctaHref: contactProfilePath(selected.id),
          }}
          onClose={() => setSelectedId(null)}
          sections={[
            {
              id: "intereses",
              title: "Intereses principales",
              defaultOpen: true,
              content: (
                <TagCloud
                  editable={false}
                  tags={selected.interests.map((label, i) => ({ id: `${selected.id}-int-${i}`, label, tone: "violet" }))}
                />
              ),
            },
            {
              id: "fuente",
              title: "Fuente",
              content: (
                <p className="text-sm text-white/65">
                  {selected.sourceChannel} — {selected.sourceDetail}
                </p>
              ),
            },
            {
              id: "personal",
              title: "Información personal",
              content: <InfoCard rows={selected.personal.map((r) => ({ label: r.label, value: r.value }))} />,
            },
            {
              id: "financiera",
              title: "Información financiera",
              content: <InfoCard rows={selected.financial.map((r) => ({ label: r.label, value: r.value }))} />,
            },
            {
              id: "etiquetas",
              title: "Etiquetas",
              content: (
                <TagCloud tags={selected.tags.map((label, i) => ({ id: `${selected.id}-tag-${i}`, label, tone: "emerald" }))} />
              ),
            },
          ]}
        />
      )}

      {!selected && !isEmpty && (
        <BlockFrame title="Ficha rápida" icon="IdCard">
          <p className="py-4 text-center text-sm text-white/35">
            Elige un contacto de la tabla para ver su ficha aquí sin salir de la página.
          </p>
        </BlockFrame>
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
      title="Contactos"
      description="Gestiona todas las personas y prospectos en tu CRM."
      icon="UserRound"
      starrable={false}
      sidePanel={sidePanel}
      headerActions={
        <>
          <Button variant="outline" size="sm" className="border-white/12 bg-white/[0.03] text-white/70 hover:bg-white/[0.06]">
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Importar
          </Button>
          <Button className="border-0 bg-gradient-to-b from-[#f5da93] to-[#c98f1f] font-semibold text-[#241a05] hover:brightness-105">
            <Plus className="mr-1.5 h-4 w-4" />
            Nuevo Contacto
          </Button>
        </>
      }
    >
      {contacts.loading ? (
        <div className="surface-card">
          <LoadingState />
        </div>
      ) : isEmpty ? (
        <div className="surface-card">
          <EmptyState
            icon="UserRound"
            title="Todavía no hay contactos"
            description="Los contactos son el corazón del CRM: cada persona con la que hablas, su origen, su interés y su avance. Crea el primero o impórtalos desde una hoja de cálculo."
            actionLabel="Nuevo Contacto"
            onAction={() => undefined}
          />
        </div>
      ) : (
        <>
          <KpiStrip
            items={[
              { id: "total", label: "Contactos totales", value: counts.total.toLocaleString("es"), delta: "12.5%", sub: "vs mes anterior", icon: "Users", tone: "violet" },
              { id: "nuevos", label: "Nuevos este mes", value: String(counts.nuevos), delta: "8.7%", sub: "vs mes anterior", icon: "UserPlus", tone: "blue" },
              { id: "calientes", label: "Leads calientes", value: String(counts.calientes), delta: "15.2%", sub: "vs mes anterior", icon: "Flame", tone: "emerald" },
              { id: "citas", label: "Citas agendadas", value: String(counts.citas), delta: "9.1%", sub: "vs mes anterior", icon: "CalendarDays", tone: "amber" },
              { id: "clientes", label: "Clientes", value: String(counts.clientes), delta: "13.3%", sub: "vs mes anterior", icon: "BadgeCheck", tone: "rose" },
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
                  searchPlaceholder="Buscar por nombre, email, teléfono…"
                  filters={[
                    { id: "source", label: "Fuente", options: [...new Set(contacts.items.map((c) => c.sourceChannel))] },
                    { id: "status", label: "Estado", options: [...new Set(contacts.items.map((c) => c.status))] },
                    { id: "advisor", label: "Asesor", options: [...new Set(contacts.items.map((c) => c.advisor))] },
                  ]}
                  values={filters}
                  onFilterChange={(id, value) => setFilters((f) => ({ ...f, [id]: value }))}
                />
              </div>

              <DataTable
                columns={[
                  { id: "contact", header: "Contacto", sortable: true },
                  { id: "status", header: "Estado", sortable: true, width: "150px" },
                  { id: "source", header: "Fuente", sortable: true, width: "170px" },
                  { id: "advisor", header: "Asesor", sortable: true, width: "160px" },
                  { id: "activity", header: "Última actividad", width: "170px" },
                  { id: "interest", header: "Interés principal", sortable: true, width: "160px" },
                  { id: "score", header: "Puntaje", sortable: true, width: "100px" },
                ]}
                rows={rows}
                onView={(id) => setSelectedId(id)}
                onEditRow={(id) => router.push(contactProfilePath(id))}
                onDeleteRow={(id) => contacts.remove(id)}
              />
            </div>
          </div>
        </>
      )}

      <AddBlockDialog open={createOpen} onOpenChange={setCreateOpen} onCreate={addBlock} />
    </PageShell>
  );
}
