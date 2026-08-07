"use client";

import { useEffect, useMemo, useState } from "react";
import { Info } from "lucide-react";
import { PageShell, PageTabs } from "@/components/page-blocks/PageShell";
import { AddBlockDialog } from "@/components/page-blocks/AddBlockDialog";
import { useBlockComposer } from "@/components/page-blocks/use-block-composer";
import { BlockFrame } from "@/components/page-blocks/BlockFrame";
import { EmptyState, LoadingState } from "@/components/page-blocks/EmptyState";
import { InfoCard } from "@/components/page-blocks/blocks/InfoCard";
import { StatTileList } from "@/components/page-blocks/blocks/StatTileList";
import { SettingsCardGrid } from "@/components/page-blocks/blocks/SettingsCardGrid";
import { DataTable, type RowData } from "@/components/page-blocks/blocks/DataTable";
import { QuickActionGrid } from "@/components/page-blocks/blocks/QuickActionGrid";
import { usePageConfig } from "@/lib/use-page-config";
import { useAuthStore } from "@/store/auth";
import { firebaseReady } from "@/lib/firebase";
import { getCompany, listCompanyMembers } from "@/lib/services/companies";
import { navTree } from "@/lib/nav-tree";
import { BLOCK_TYPE_CATALOG } from "@/lib/block-types";
import type { Company, CompanyMember } from "@/lib/types";

const TABS = [
  { value: "general", label: "General" },
  { value: "usuarios", label: "Usuarios" },
  { value: "roles", label: "Roles y permisos" },
  { value: "personalizacion", label: "Personalización" },
  { value: "seguridad", label: "Seguridad" },
  { value: "integraciones", label: "Integraciones" },
];

const PLAN_LABEL: Record<Company["plan"], string> = {
  free: "Gratuito",
  pro: "Profesional",
  enterprise: "Empresarial",
};

/**
 * Los dos roles que la plataforma reconoce hoy, con lo que puede hacer cada
 * uno. Sale de cómo están escritas las reglas de Firestore, no de un catálogo
 * aparte que pudiera desincronizarse.
 */
const ROLES = [
  {
    id: "admin",
    name: "Administrador",
    description: "Control total sobre la empresa: menú, páginas, contenido e invitaciones.",
    permisos: ["Crear y editar bloques y páginas", "Escribir en todas las colecciones", "Invitar y gestionar miembros", "Conceder acceso al superadministrador"],
  },
  {
    id: "member",
    name: "Miembro",
    description: "Trabaja con el contenido de la empresa sin tocar su estructura.",
    permisos: ["Leer y escribir el contenido de los módulos", "Ver todas las páginas construidas", "Sin acceso a la gestión de miembros"],
  },
];

export function ConfiguracionGeneralView() {
  const { companyId } = useAuthStore();
  const { blocks, addBlock, updateBlock, removeBlock } = usePageConfig("/configuracion/general");
  const composer = useBlockComposer(addBlock);

  const [tab, setTab] = useState("general");
  const [company, setCompany] = useState<Company | null>(null);
  const [members, setMembers] = useState<CompanyMember[] | null>(null);

  useEffect(() => {
    if (!firebaseReady || !companyId) return;
    let cancelado = false;
    getCompany(companyId).then((c) => !cancelado && setCompany(c));
    listCompanyMembers(companyId).then((m) => !cancelado && setMembers(m));
    return () => {
      cancelado = true;
    };
  }, [companyId]);

  const loading = Boolean(companyId) && (company === null || members === null);

  /** Cuántos bloques y páginas tiene el menú, y cuántas están construidas. */
  const menu = useMemo(() => {
    const paginas = navTree.flatMap((b) => b.children.flatMap((p) => (p.children.length ? p.children : [p])));
    return {
      bloques: navTree.length,
      paginas: paginas.length,
      construidas: paginas.filter((p) => p.built).length,
    };
  }, []);

  const filasRoles: RowData[] = ROLES.map((r) => ({
    id: r.id,
    cells: {
      rol: { kind: "source", icon: r.id === "admin" ? "ShieldCheck" : "UserRound", value: r.name, sub: r.description },
      miembros: { kind: "number", value: String(members?.filter((m) => m.role === r.id).length ?? 0) },
      permisos: { kind: "icons", icons: r.permisos.map(() => "Check") },
    },
  }));

  const sidePanel = (
    <>
      <BlockFrame title="Información del sistema" icon="Info">
        <InfoCard
          rows={[
            { label: "Estado", value: firebaseReady ? "Operativo" : "Sin conexión", tone: firebaseReady ? "emerald" : "rose" },
            { label: "Autenticación", value: "Firebase Auth" },
            { label: "Base de datos", value: "Cloud Firestore" },
            { label: "Aislamiento", value: "Por empresa" },
            { label: "Tipos de bloque", value: String(BLOCK_TYPE_CATALOG.length) },
          ]}
        />
      </BlockFrame>

      <BlockFrame title="Menú de la empresa" icon="LayoutDashboard">
        <StatTileList
          columns={2}
          tiles={[
            { id: "bloques", icon: "Blocks", color: "#a78bfa", value: String(menu.bloques), label: "Bloques" },
            { id: "paginas", icon: "Files", color: "#3b82f6", value: String(menu.paginas), label: "Páginas" },
            { id: "construidas", icon: "CheckCircle2", color: "#22c55e", value: String(menu.construidas), label: "Construidas" },
            { id: "miembros", icon: "Users", color: "#e0a836", value: String(members?.length ?? 0), label: "Miembros" },
          ]}
        />
      </BlockFrame>

      <BlockFrame title="Accesos" icon="Zap">
        <QuickActionGrid
          layout="list"
          columns={1}
          actions={[
            { id: "empresas", icon: "Building2", label: "Panel de super administrador", href: "/empresas" },
            { id: "soluciones", icon: "Settings", label: "Configuración de Soluciones", href: "/soluciones/configuracion" },
            { id: "operaciones", icon: "Cog", label: "Configuración de Operaciones", href: "/operaciones/configuracion" },
          ]}
        />
      </BlockFrame>
    </>
  );

  return (
    <PageShell
      title="Configuración"
      description="Administra los ajustes generales de la plataforma y personaliza tu experiencia."
      icon="Settings"
      starrable={false}
      sidePanel={sidePanel}
      blocks={{ items: blocks, onUpdate: updateBlock, onDelete: removeBlock, onAdd: composer.openFor }}
      headerActions={<span />}
    >
      <PageTabs tabs={TABS} active={tab} onChange={setTab} />

      {loading ? (
        <div className="surface-card">
          <LoadingState />
        </div>
      ) : !company ? (
        <div className="surface-card">
          <EmptyState
            icon="Building2"
            title="Sin empresa activa"
            description="Inicia sesión con una cuenta que pertenezca a una empresa para ver su configuración."
          />
        </div>
      ) : (
        <>
          {tab === "general" && (
            <>
              <BlockFrame title="Información de la empresa" icon="Building2">
                <InfoCard
                  rows={[
                    { label: "Nombre", value: company.name },
                    { label: "Identificador", value: company.slug },
                    { label: "Plan contratado", value: PLAN_LABEL[company.plan] },
                    { label: "Creada el", value: new Date(company.createdAt).toLocaleDateString("es", { day: "2-digit", month: "long", year: "numeric" }) },
                    { label: "Miembros", value: String(members?.length ?? 0) },
                  ]}
                />
              </BlockFrame>

              <BlockFrame title="Comportamiento de la plataforma" icon="SlidersHorizontal">
                <p className="mb-3 text-sm text-white/45">
                  Cómo se comporta la plataforma hoy. Poder cambiarlo desde aquí llega con el editor de ajustes.
                </p>
                <InfoCard
                  rows={[
                    { label: "Página de inicio", value: "Dashboard" },
                    { label: "Tema", value: "Oscuro" },
                    { label: "Idioma", value: "Español" },
                    { label: "Formato de fecha", value: "DD/MM/YYYY" },
                    { label: "Secciones del menú al abrir", value: "Cerradas" },
                    { label: "Datos de demostración", value: "Solo en la empresa del superadministrador" },
                  ]}
                />
              </BlockFrame>
            </>
          )}

          {tab === "usuarios" && (
            <BlockFrame title="Miembros de la empresa" icon="Users">
              {!members || members.length === 0 ? (
                <EmptyState
                  icon="Users"
                  title="Sin miembros"
                  description="Invita a alguien desde el menú lateral para que aparezca aquí."
                />
              ) : (
                <>
                  <p className="mb-3 text-sm text-white/45">
                    Los datos de contacto de cada persona viven en su cuenta, no en la empresa; aquí se ve su papel y
                    desde cuándo pertenece.
                  </p>
                  <DataTable
                    columns={[
                      { id: "uid", header: "Identificador", sortable: true },
                      { id: "rol", header: "Rol", sortable: true, width: "170px" },
                      { id: "alta", header: "Se unió el", sortable: true, width: "180px" },
                      { id: "permisos", header: "Permisos propios", sortable: true, width: "160px" },
                    ]}
                    rows={members.map((m) => ({
                      id: m.uid,
                      cells: {
                        uid: { kind: "text", value: m.uid },
                        rol: { kind: "badge", value: m.role === "admin" ? "Administrador" : "Miembro", tone: m.role === "admin" ? "violet" : "blue" },
                        alta: { kind: "text", value: new Date(m.joinedAt).toLocaleDateString("es", { day: "2-digit", month: "short", year: "numeric" }) },
                        permisos: { kind: "number", value: String(m.permissions?.length ?? 0) },
                      },
                    }))}
                  />
                </>
              )}
            </BlockFrame>
          )}

          {tab === "roles" && (
            <>
              <BlockFrame title="Roles definidos" icon="ShieldCheck">
                <DataTable
                  columns={[
                    { id: "rol", header: "Rol", sortable: true },
                    { id: "miembros", header: "Miembros", sortable: true, width: "120px" },
                    { id: "permisos", header: "Permisos", width: "180px" },
                  ]}
                  rows={filasRoles}
                />
              </BlockFrame>

              {ROLES.map((r) => (
                <BlockFrame key={r.id} title={`Permisos de ${r.name.toLowerCase()}`} icon="KeyRound">
                  <ul className="space-y-1.5">
                    {r.permisos.map((p) => (
                      <li key={p} className="flex items-start gap-2 text-sm text-white/65">
                        <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--allpa-gold-400)]" />
                        <span className="min-w-0">{p}</span>
                      </li>
                    ))}
                  </ul>
                </BlockFrame>
              ))}
            </>
          )}

          {tab === "personalizacion" && (
            <>
              <BlockFrame title="Estructura del menú" icon="LayoutDashboard">
                <p className="mb-3 text-sm text-white/45">
                  El menú se edita desde la propia barra lateral, con el botón de nuevo bloque y el menú de cada
                  elemento. Esto es solo el recuento.
                </p>
                <InfoCard
                  rows={[
                    { label: "Bloques", value: String(menu.bloques) },
                    { label: "Páginas", value: String(menu.paginas) },
                    { label: "Páginas construidas", value: `${menu.construidas} de ${menu.paginas}` },
                    { label: "Tipos de bloque de contenido", value: String(BLOCK_TYPE_CATALOG.length) },
                  ]}
                />
              </BlockFrame>

              <BlockFrame title="Bloques del menú" icon="Blocks">
                <DataTable
                  columns={[
                    { id: "bloque", header: "Bloque", sortable: true },
                    { id: "paginas", header: "Páginas", sortable: true, width: "120px" },
                    { id: "construidas", header: "Construidas", sortable: true, width: "150px" },
                  ]}
                  rows={navTree.map((b) => {
                    const paginas = b.children.flatMap((p) => (p.children.length ? p.children : [p]));
                    return {
                      id: b.key,
                      cells: {
                        bloque: { kind: "source", icon: b.icon, value: b.name },
                        paginas: { kind: "number", value: String(paginas.length) },
                        construidas: { kind: "progress", value: paginas.length ? Math.round((paginas.filter((p) => p.built).length / paginas.length) * 100) : 0 },
                      },
                    };
                  })}
                />
              </BlockFrame>
            </>
          )}

          {tab === "seguridad" && (
            <>
              <BlockFrame title="Cómo se protegen los datos" icon="Lock">
                <InfoCard
                  rows={[
                    { label: "Autenticación", value: "Firebase Auth (correo y contraseña)" },
                    { label: "Aislamiento", value: "Cada empresa en su propia rama" },
                    { label: "Reglas", value: "Firestore, comprobadas en el servidor" },
                    { label: "Lectura de datos", value: "Solo miembros de la empresa" },
                    { label: "Acceso del superadministrador", value: company.superadminAccessGrant ? "Concedido" : "No concedido", tone: company.superadminAccessGrant ? "amber" : "emerald" },
                  ]}
                />
              </BlockFrame>

              <BlockFrame title="Acceso del superadministrador" icon="ShieldAlert">
                <p className="text-sm leading-relaxed text-white/60">
                  El superadministrador no entra en los datos de una empresa salvo que esta se lo conceda. La concesión
                  se pide y se revoca desde el panel de empresas, y queda registrada en el documento de la empresa.
                </p>
              </BlockFrame>
            </>
          )}

          {tab === "integraciones" && (
            <BlockFrame title="Integraciones" icon="Plug">
              <SettingsCardGrid
                cards={[
                  {
                    id: "correo",
                    icon: "Mail",
                    color: "#3b82f6",
                    title: "Correo y mensajería",
                    description: "Envío de invitaciones y notificaciones por correo.",
                    links: [
                      { id: "i1", label: "Proveedor de correo" },
                      { id: "i2", label: "Plantillas de mensaje" },
                    ],
                  },
                  {
                    id: "calendario",
                    icon: "CalendarDays",
                    color: "#22c55e",
                    title: "Calendarios externos",
                    description: "Sincronización con calendarios del equipo.",
                    links: [
                      { id: "i3", label: "Google Calendar" },
                      { id: "i4", label: "Outlook" },
                    ],
                  },
                  {
                    id: "almacenamiento",
                    icon: "HardDrive",
                    color: "#e0a836",
                    title: "Almacenamiento de documentos",
                    description: "Dónde se guardan los archivos que sube el equipo.",
                    links: [
                      { id: "i5", label: "Proveedor de almacenamiento" },
                      { id: "i6", label: "Política de retención" },
                    ],
                  },
                ]}
              />
              <div className="mt-3 flex flex-wrap items-center gap-3 rounded-xl border border-white/10 px-4 py-3">
                <Info className="h-4 w-4 flex-shrink-0 text-white/35" />
                <p className="min-w-0 flex-1 text-sm text-white/55">
                  Ninguna integración está conectada todavía: las filas aparecen atenuadas a propósito, para que no
                  parezca que hay algo funcionando que no existe.
                </p>
              </div>
            </BlockFrame>
          )}
        </>
      )}

      <AddBlockDialog {...composer.dialogProps} />
    </PageShell>
  );
}
