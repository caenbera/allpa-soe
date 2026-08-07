"use client";

import { useMemo } from "react";
import { Info, RotateCcw } from "lucide-react";
import { PageShell } from "@/components/page-blocks/PageShell";
import { AddBlockDialog } from "@/components/page-blocks/AddBlockDialog";
import { useBlockComposer } from "@/components/page-blocks/use-block-composer";
import { BlockFrame } from "@/components/page-blocks/BlockFrame";
import { LoadingState } from "@/components/page-blocks/EmptyState";
import { SettingsCardGrid, type SettingsCard } from "@/components/page-blocks/blocks/SettingsCardGrid";
import { InfoCard } from "@/components/page-blocks/blocks/InfoCard";
import { ActivityFeed } from "@/components/page-blocks/blocks/ActivityFeed";
import { QuickActionGrid } from "@/components/page-blocks/blocks/QuickActionGrid";
import { Button } from "@/components/ui/button";
import { useContent } from "@/lib/use-content";
import { usePageConfig } from "@/lib/use-page-config";
import { OPS_COLLECTIONS, type OpsMember, type SavedReport, type SlaPolicy } from "@/lib/ops-types";

/**
 * Centro de ajustes del módulo.
 *
 * Las filas que ya tienen una página construida enlazan a ella; el resto se
 * pintan como pendientes. Es preferible que se vea qué falta a inventar
 * destinos que no llevan a ninguna parte.
 */
const CARDS_PRINCIPALES: SettingsCard[] = [
  {
    id: "usuarios",
    icon: "Users",
    color: "#a78bfa",
    title: "Usuarios y Roles",
    description: "Gestiona usuarios, roles y permisos dentro del módulo de operaciones.",
    links: [
      { id: "u1", label: "Gestionar usuarios", href: "/operaciones/equipo" },
      { id: "u2", label: "Gestionar roles" },
      { id: "u3", label: "Matriz de permisos" },
    ],
  },
  {
    id: "departamentos",
    icon: "Building2",
    color: "#3b82f6",
    title: "Departamentos y Equipos",
    description: "Configura los departamentos y equipos que intervienen en los procesos.",
    links: [
      { id: "d1", label: "Departamentos", href: "/operaciones/equipo" },
      { id: "d2", label: "Equipos" },
      { id: "d3", label: "Asignación de responsables" },
    ],
  },
  {
    id: "procesos",
    icon: "Workflow",
    color: "#22c55e",
    title: "Procesos y Flujos",
    description: "Administra los procesos operativos y sus flujos de trabajo.",
    links: [
      { id: "p1", label: "Catálogo de procesos", href: "/operaciones/implementaciones" },
      { id: "p2", label: "Flujos de trabajo", href: "/operaciones/checklists" },
      { id: "p3", label: "Estados y transiciones" },
    ],
  },
  {
    id: "documentos",
    icon: "FileText",
    color: "#e0a836",
    title: "Documentos y Plantillas",
    description: "Configura plantillas, tipos de documentos y requisitos por proceso.",
    links: [
      { id: "doc1", label: "Tipos de documento", href: "/operaciones/documentos-pendientes" },
      { id: "doc2", label: "Plantillas" },
      { id: "doc3", label: "Requisitos por proceso" },
    ],
  },
  {
    id: "calendario",
    icon: "CalendarDays",
    color: "#06b6d4",
    title: "Calendario y Recordatorios",
    description: "Define eventos, recordatorios y frecuencias del calendario operativo.",
    links: [
      { id: "c1", label: "Tipos de eventos", href: "/operaciones/calendario" },
      { id: "c2", label: "Recordatorios" },
      { id: "c3", label: "Días festivos" },
    ],
  },
  {
    id: "notificaciones",
    icon: "Bell",
    color: "#8b5cf6",
    title: "Notificaciones",
    description: "Personaliza las notificaciones y alertas del módulo de operaciones.",
    links: [
      { id: "n1", label: "Tipos de notificaciones" },
      { id: "n2", label: "Canales de notificación" },
      { id: "n3", label: "Reglas de notificación" },
    ],
  },
];

const CARDS_AVANZADAS: SettingsCard[] = [
  {
    id: "sla",
    icon: "ShieldCheck",
    color: "#64748b",
    title: "SLA y Cumplimiento",
    description: "Configura políticas, métricas y parámetros de SLA y cumplimiento.",
    links: [
      { id: "s1", label: "Políticas de SLA", href: "/operaciones/sla-cumplimiento" },
      { id: "s2", label: "Métricas" },
      { id: "s3", label: "Parámetros y umbrales" },
    ],
  },
  {
    id: "reportes",
    icon: "BarChart3",
    color: "#f97316",
    title: "Reportes",
    description: "Personaliza reportes, indicadores y visualizaciones del módulo.",
    links: [
      { id: "r1", label: "Indicadores clave (KPIs)", href: "/operaciones/reportes-operativos" },
      { id: "r2", label: "Plantillas de reportes", href: "/operaciones/reportes-procesos" },
      { id: "r3", label: "Programación de reportes" },
    ],
  },
  {
    id: "seguridad",
    icon: "Lock",
    color: "#22c55e",
    title: "Seguridad y Accesos",
    description: "Configura políticas de seguridad y accesos al sistema.",
    links: [
      { id: "sec1", label: "Políticas de contraseña" },
      { id: "sec2", label: "Sesiones activas" },
      { id: "sec3", label: "Historial de accesos" },
    ],
  },
];

export function ConfiguracionOperacionesView() {
  const team = useContent<OpsMember>(OPS_COLLECTIONS.team);
  const policies = useContent<SlaPolicy>(OPS_COLLECTIONS.slaPolicies);
  const saved = useContent<SavedReport>(OPS_COLLECTIONS.savedReports);

  const { blocks, addBlock, updateBlock, removeBlock } = usePageConfig("/operaciones/configuracion");
  const composer = useBlockComposer(addBlock);

  const loading = team.loading || policies.loading || saved.loading;

  /**
   * Los "cambios recientes" salen de lo que hay: quién entró último y qué
   * reportes se generaron. No se inventa un registro de auditoría que el
   * módulo todavía no guarda.
   */
  const cambios = useMemo(() => {
    const accesos = [...team.items]
      .filter((m) => m.status === "Activo" && m.lastAccess !== "—")
      .slice(0, 2)
      .map((m) => ({
        id: `acc-${m.id}`,
        icon: "LogIn",
        color: "#a78bfa",
        title: `${m.name} accedió al módulo`,
        detail: `${m.role} · ${m.department}`,
        timeLabel: m.lastAccess,
      }));

    const reportes = saved.items.slice(0, 3).map((r) => ({
      id: `rep-${r.id}`,
      icon: r.icon,
      color: r.color,
      title: `Reporte generado: ${r.name}`,
      detail: `por ${r.author}`,
      timeLabel: r.generatedAt,
    }));

    return [...accesos, ...reportes];
  }, [team.items, saved.items]);

  const sidePanel = (
    <>
      <BlockFrame title="Acciones rápidas" icon="Zap">
        <QuickActionGrid
          columns={2}
          actions={[
            { id: "equipo", icon: "UserPlus", label: "Invitar usuario", href: "/operaciones/equipo" },
            { id: "sla", icon: "ShieldCheck", label: "Políticas de SLA", href: "/operaciones/sla-cumplimiento" },
            { id: "reporte", icon: "BarChart3", label: "Programar reporte", href: "/operaciones/reportes-operativos" },
            { id: "cal", icon: "CalendarDays", label: "Calendario", href: "/operaciones/calendario" },
          ]}
        />
      </BlockFrame>

      <BlockFrame title="Información del módulo" icon="Info">
        <InfoCard
          rows={[
            { label: "Páginas construidas", value: "15 de 15" },
            { label: "Colecciones de datos", value: String(Object.keys(OPS_COLLECTIONS).length) },
            { label: "Miembros del equipo", value: String(team.items.length) },
            { label: "Políticas de SLA", value: String(policies.items.length) },
            { label: "Reportes guardados", value: String(saved.items.length) },
          ]}
        />
      </BlockFrame>

      <BlockFrame title="Movimiento reciente" icon="History">
        <ActivityFeed entries={cambios} compact />
      </BlockFrame>
    </>
  );

  return (
    <PageShell
      title="Configuración"
      description="Administra y personaliza las configuraciones del módulo de operaciones."
      icon="Settings"
      starrable={false}
      sidePanel={sidePanel}
      blocks={{ items: blocks, onUpdate: updateBlock, onDelete: removeBlock, onAdd: composer.openFor }}
      headerActions={
        <Button variant="outline" size="sm" className="border-white/12 bg-white/[0.03] text-white/70 hover:bg-white/[0.06]">
          <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
          Restaurar por defecto
        </Button>
      }
    >
      {loading ? (
        <div className="surface-card">
          <LoadingState />
        </div>
      ) : (
        <>
          <BlockFrame title="Configuraciones principales" icon="Settings2">
            <SettingsCardGrid cards={CARDS_PRINCIPALES} />
          </BlockFrame>

          <BlockFrame title="Configuraciones avanzadas" icon="SlidersHorizontal">
            <SettingsCardGrid cards={CARDS_AVANZADAS} />
          </BlockFrame>

          <div className="surface-card flex flex-wrap items-center gap-3 px-4 py-3.5">
            <Info className="h-4 w-4 flex-shrink-0 text-white/35" />
            <p className="min-w-0 flex-1 text-sm text-white/55">
              Los ajustes marcados con un reloj todavía no tienen pantalla propia. Los demás llevan a la página del
              módulo donde ya se gestionan.
            </p>
          </div>
        </>
      )}

      <AddBlockDialog {...composer.dialogProps} />
    </PageShell>
  );
}
