"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Pencil, Plus } from "lucide-react";
import { PageShell, PageTabs } from "@/components/page-blocks/PageShell";
import { BlockFrame } from "@/components/page-blocks/BlockFrame";
import { AddBlockDialog } from "@/components/page-blocks/AddBlockDialog";
import { useBlockComposer } from "@/components/page-blocks/use-block-composer";
import { EmptyState, LoadingState } from "@/components/page-blocks/EmptyState";
import { ProfileHeader } from "@/components/page-blocks/blocks/ProfileHeader";
import { InfoCard } from "@/components/page-blocks/blocks/InfoCard";
import { TagCloud } from "@/components/page-blocks/blocks/TagCloud";
import { DonutChart } from "@/components/page-blocks/blocks/DonutChart";
import { ActivityFeed } from "@/components/page-blocks/blocks/ActivityFeed";
import { RichTextEditor } from "@/components/page-blocks/RichTextEditor";
import { Button } from "@/components/ui/button";
import { useContent } from "@/lib/use-content";
import { usePageConfig } from "@/lib/use-page-config";
import { ACTIVITY_META, CONTACT_STATUS_TONE, CRM_COLLECTIONS, type Activity, type Contact } from "@/lib/crm-types";

const TABS = [
  { value: "resumen", label: "Resumen" },
  { value: "informacion", label: "Información" },
  { value: "intereses", label: "Intereses y necesidades" },
  { value: "actividad", label: "Actividad" },
  { value: "notas", label: "Notas" },
  { value: "documentos", label: "Documentos" },
];

export function ContactoPerfilView({ contactId }: { contactId: string }) {
  const [tab, setTab] = useState("resumen");

  const contacts = useContent<Contact>(CRM_COLLECTIONS.contacts);
  const activities = useContent<Activity>(CRM_COLLECTIONS.activities);
  const { blocks, addBlock, updateBlock, removeBlock } = usePageConfig(`/crm/contactos/${contactId}`);
  const composer = useBlockComposer(addBlock);

  const contact = contacts.items.find((c) => c.id === contactId) ?? null;

  /** Actividades de este contacto; si no hay ninguna suya, se muestran las generales. */
  const feed = useMemo(() => {
    if (!contact) return [];
    const own = activities.items.filter((a) => a.contactName === contact.name);
    const source = own.length > 0 ? own : activities.items.slice(0, 6);
    return source.map((a) => ({
      id: a.id,
      icon: ACTIVITY_META[a.kind].icon,
      color: ACTIVITY_META[a.kind].color,
      title: a.title,
      detail: a.detail,
      timeLabel: a.timeLabel,
    }));
  }, [activities.items, contact]);

  const loading = contacts.loading || activities.loading;

  if (loading) {
    return (
      <PageShell title="Contacto" icon="UserRound" starrable={false}>
        <div className="surface-card">
          <LoadingState />
        </div>
      </PageShell>
    );
  }

  if (!contact) {
    return (
      <PageShell title="Contacto" description="Ficha completa del contacto." icon="UserRound" starrable={false}>
        <div className="surface-card">
          <EmptyState
            icon="UserRound"
            title="No encontramos este contacto"
            description="Puede que se haya eliminado o que el enlace ya no sea válido. Vuelve a la lista para buscarlo."
          />
        </div>
      </PageShell>
    );
  }

  const sidePanel = (
    <>
      <BlockFrame title="Línea de tiempo de actividad" icon="History">
        <ActivityFeed entries={feed} compact />
      </BlockFrame>

      <BlockFrame title="Puntaje y clasificación" icon="Gauge">
        <DonutChart
          slices={contact.scoreBreakdown.map((s, i) => ({ id: `s-${i}`, label: s.label, value: s.value, color: s.color }))}
          centerValue={String(contact.score)}
          centerLabel="Puntaje total"
          showPercent={false}
        />
      </BlockFrame>
    </>
  );

  return (
    <PageShell
      title={contact.name}
      description={contact.role}
      starrable={false}
      sidePanel={sidePanel}
      blocks={{ items: blocks, onUpdate: updateBlock, onDelete: removeBlock, onAdd: composer.openFor }}
      headerActions={
        <>
          <Link
            href="/crm/contactos"
            className="flex h-9 items-center gap-1.5 rounded-lg border border-white/12 bg-white/[0.03] px-3 text-sm text-white/70 transition-colors hover:bg-white/[0.06]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Contactos
          </Link>
          <Button variant="outline" size="sm" className="border-white/12 bg-white/[0.03] text-white/70 hover:bg-white/[0.06]">
            <Pencil className="mr-1.5 h-3.5 w-3.5" />
            Editar
          </Button>
          <Button className="border-0 bg-gradient-to-b from-[#f5da93] to-[#c98f1f] font-semibold text-[#241a05] hover:brightness-105">
            <Plus className="mr-1.5 h-4 w-4" />
            Nueva actividad
          </Button>
        </>
      }
    >
      <BlockFrame title="Ficha del contacto" icon="IdCard">
        <ProfileHeader
          data={{
            name: contact.name,
            chips: [
              { label: contact.status, tone: CONTACT_STATUS_TONE[contact.status] },
              { label: contact.isClient ? "Cliente" : "Prospecto", tone: contact.isClient ? "emerald" : "neutral" },
            ],
            score: contact.score,
            fields: [
              { icon: "Mail", value: contact.email },
              { icon: "Phone", value: contact.phone },
              { icon: "MapPin", value: contact.location },
            ],
            columns: [
              {
                id: "fuente",
                rows: [
                  { label: "Fuente", value: `${contact.sourceChannel} — ${contact.sourceDetail}`, icon: contact.sourceIcon },
                  { label: "Asesor asignado", value: contact.advisor, person: true },
                ],
              },
              {
                id: "estado",
                rows: [
                  { label: "Interés principal", value: contact.mainInterest },
                  { label: "Última actividad", value: `${contact.lastActivity} · ${contact.lastActivityAt}` },
                ],
              },
            ],
          }}
        />
      </BlockFrame>

      <PageTabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === "resumen" && (
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
          <BlockFrame title="Información personal" icon="UserRound">
            <InfoCard rows={contact.personal.map((r) => ({ label: r.label, value: r.value }))} />
          </BlockFrame>
          <BlockFrame title="Información financiera" icon="Landmark">
            <InfoCard rows={contact.financial.map((r) => ({ label: r.label, value: r.value }))} />
          </BlockFrame>
          <BlockFrame title="Intereses principales" icon="Target">
            <TagCloud
              addLabel="Agregar interés"
              tags={contact.interests.map((label, i) => ({ id: `int-${i}`, label, tone: "violet" }))}
              onChange={(tags) => contacts.update(contact.id, { interests: tags.map((t) => t.label) })}
            />
          </BlockFrame>
          <BlockFrame title="Etiquetas" icon="Tags">
            <TagCloud
              tags={contact.tags.map((label, i) => ({ id: `tag-${i}`, label, tone: "emerald" }))}
              onChange={(tags) => contacts.update(contact.id, { tags: tags.map((t) => t.label) })}
            />
          </BlockFrame>
          <div className="xl:col-span-2">
            <BlockFrame title="Resumen del contacto" icon="FileText">
              <RichTextEditor
                content={`<p>${contact.summary}</p>`}
                onChange={(html) => contacts.update(contact.id, { summary: html.replace(/<[^>]+>/g, "") })}
              />
            </BlockFrame>
          </div>
        </div>
      )}

      {tab === "informacion" && (
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
          <BlockFrame title="Información personal" icon="UserRound">
            <InfoCard rows={contact.personal.map((r) => ({ label: r.label, value: r.value }))} />
          </BlockFrame>
          <BlockFrame title="Información financiera" icon="Landmark">
            <InfoCard rows={contact.financial.map((r) => ({ label: r.label, value: r.value }))} />
          </BlockFrame>
        </div>
      )}

      {tab === "intereses" && (
        <BlockFrame title="Intereses y necesidades" icon="Target">
          <TagCloud
            addLabel="Agregar interés"
            tags={contact.interests.map((label, i) => ({ id: `int-${i}`, label, tone: "violet" }))}
            onChange={(tags) => contacts.update(contact.id, { interests: tags.map((t) => t.label) })}
          />
        </BlockFrame>
      )}

      {tab === "actividad" && (
        <BlockFrame title="Actividad del contacto" icon="History">
          <ActivityFeed entries={feed} />
        </BlockFrame>
      )}

      {tab === "notas" && (
        <BlockFrame title="Notas" icon="StickyNote">
          <RichTextEditor content="" />
        </BlockFrame>
      )}

      {tab === "documentos" && (
        <BlockFrame title="Documentos" icon="FolderOpen">
          <p className="py-6 text-center text-sm text-white/35">
            Todavía no hay documentos adjuntos a este contacto.
          </p>
        </BlockFrame>
      )}

      <AddBlockDialog {...composer.dialogProps} />
    </PageShell>
  );
}
