import type { ComponentType } from "react";
import { HomepageView } from "@/components/pages/marketing/HomepageView";
import { BlogEnProduccionView } from "@/components/pages/marketing/BlogEnProduccionView";
import { InstagramView } from "@/components/pages/marketing/InstagramView";
import { PodcastProduccionView } from "@/components/pages/marketing/PodcastProduccionView";
import { InvitadosView } from "@/components/pages/marketing/InvitadosView";
import { CentroContenidoView } from "@/components/pages/contenido/CentroContenidoView";
import { SemanaDetalleView } from "@/components/pages/contenido/SemanaDetalleView";
import { EpisodiosMadreView } from "@/components/pages/contenido/EpisodiosMadreView";
import { ContenidoDerivadoView } from "@/components/pages/contenido/ContenidoDerivadoView";
import { BibliotecaMultimediaView } from "@/components/pages/contenido/BibliotecaMultimediaView";
import { CalendarioMaestroView } from "@/components/pages/contenido/CalendarioMaestroView";
import { TemasEstrategicosView } from "@/components/pages/contenido/TemasEstrategicosView";
import { AcademiaView } from "@/components/pages/contenido/AcademiaView";
import { RecursosDescargablesView } from "@/components/pages/contenido/RecursosDescargablesView";
import { ContactosView } from "@/components/pages/crm/ContactosView";
import { ContactoPerfilView } from "@/components/pages/crm/ContactoPerfilView";
import { PipelineView } from "@/components/pages/crm/PipelineView";
import { EmpresasView } from "@/components/pages/crm/EmpresasView";
import { FamiliasView } from "@/components/pages/crm/FamiliasView";
import { RelacionesView } from "@/components/pages/crm/RelacionesView";
import { ActividadView } from "@/components/pages/crm/ActividadView";
import { EtiquetasView } from "@/components/pages/crm/EtiquetasView";
import { SegmentosView } from "@/components/pages/crm/SegmentosView";
import { AutomatizacionesView } from "@/components/pages/crm/AutomatizacionesView";
import { AnaliticaCrmView } from "@/components/pages/crm/AnaliticaCrmView";
import { OperacionesDashboardView } from "@/components/pages/operaciones/DashboardView";
import { TareasView } from "@/components/pages/operaciones/TareasView";
import { ImplementacionesView } from "@/components/pages/operaciones/ImplementacionesView";
import { ChecklistsView } from "@/components/pages/operaciones/ChecklistsView";
import { RevisionesView } from "@/components/pages/operaciones/RevisionesView";
import { DocumentosPendientesView } from "@/components/pages/operaciones/DocumentosPendientesView";
import { FirmasView } from "@/components/pages/operaciones/FirmasView";
import { RenovacionesView } from "@/components/pages/operaciones/RenovacionesView";
import { CasosEspecialesView } from "@/components/pages/operaciones/CasosEspecialesView";
import { CalendarioView } from "@/components/pages/operaciones/CalendarioView";
import { EquipoView } from "@/components/pages/operaciones/EquipoView";
import { SlaView } from "@/components/pages/operaciones/SlaView";
import { ReportesOperativosView } from "@/components/pages/operaciones/ReportesOperativosView";
import { ReportesProcesosView } from "@/components/pages/operaciones/ReportesProcesosView";
import { ConfiguracionOperacionesView } from "@/components/pages/operaciones/ConfiguracionView";
import { SolucionesDashboardView } from "@/components/pages/soluciones/DashboardView";
import { PlanesPatrimonialesView } from "@/components/pages/soluciones/PlanesPatrimonialesView";
import { SolucionDetalleView } from "@/components/pages/soluciones/solucion/SolucionDetalleView";
import { RutasClienteView } from "@/components/pages/soluciones/RutasClienteView";
import { ComponentesCatalogoView } from "@/components/pages/soluciones/ComponentesView";
import { CasosDeUsoView } from "@/components/pages/soluciones/CasosDeUsoView";
import { BibliotecaView } from "@/components/pages/soluciones/BibliotecaView";
import { CalculadoraView } from "@/components/pages/soluciones/CalculadoraView";
import { ComparadorView } from "@/components/pages/soluciones/ComparadorView";

/** Mapa ruta → componente para las páginas internas ya construidas. */
export const pageRegistry: Record<string, ComponentType> = {
  "/marketing/sitio-web/homepage": HomepageView,
  "/marketing/blog/en-produccion": BlogEnProduccionView,
  "/marketing/redes-sociales/instagram": InstagramView,
  "/marketing/podcast/produccion": PodcastProduccionView,
  "/marketing/podcast/invitados": InvitadosView,

  "/contenido/centro-de-contenido": CentroContenidoView,
  "/contenido/calendario-maestro": CalendarioMaestroView,
  "/contenido/temas-estrategicos": TemasEstrategicosView,
  "/contenido/episodios-madre": EpisodiosMadreView,
  "/contenido/contenido-derivado": ContenidoDerivadoView,
  "/contenido/academia": AcademiaView,
  "/contenido/biblioteca-multimedia": BibliotecaMultimediaView,
  "/contenido/recursos-descargables": RecursosDescargablesView,

  "/crm/contactos": ContactosView,
  "/crm/empresas": EmpresasView,
  "/crm/familias": FamiliasView,
  "/crm/relaciones": RelacionesView,
  "/crm/pipeline": PipelineView,
  "/crm/actividad": ActividadView,
  "/crm/etiquetas": EtiquetasView,
  "/crm/segmentos": SegmentosView,
  "/crm/automatizaciones": AutomatizacionesView,
  "/crm/analitica-crm": AnaliticaCrmView,

  "/operaciones/dashboard": OperacionesDashboardView,
  "/operaciones/tareas": TareasView,
  "/operaciones/implementaciones": ImplementacionesView,
  "/operaciones/checklists": ChecklistsView,
  "/operaciones/revisiones": RevisionesView,
  "/operaciones/documentos-pendientes": DocumentosPendientesView,
  "/operaciones/firmas": FirmasView,
  "/operaciones/renovaciones": RenovacionesView,
  "/operaciones/casos-especiales": CasosEspecialesView,
  "/operaciones/calendario": CalendarioView,
  "/operaciones/equipo": EquipoView,
  "/operaciones/sla-cumplimiento": SlaView,
  "/operaciones/reportes-operativos": ReportesOperativosView,
  "/operaciones/reportes-procesos": ReportesProcesosView,
  "/operaciones/configuracion": ConfiguracionOperacionesView,

  "/soluciones/dashboard": SolucionesDashboardView,
  "/soluciones/planes-patrimoniales": PlanesPatrimonialesView,
  "/soluciones/rutas-de-cliente": RutasClienteView,
  "/soluciones/componentes": ComponentesCatalogoView,
  "/soluciones/casos-de-uso": CasosDeUsoView,
  "/soluciones/biblioteca": BibliotecaView,
  "/soluciones/calculadora": CalculadoraView,
  "/soluciones/comparador": ComparadorView,
};

/**
 * Rutas con parámetro, para las páginas de detalle que cuelgan de otra.
 * Se consultan cuando el mapa exacto no encuentra nada.
 */
const dynamicRoutes: { pattern: RegExp; render: (m: RegExpMatchArray) => React.ReactNode }[] = [
  {
    pattern: /^\/contenido\/calendario-maestro\/semana-(\d{1,2})$/,
    render: (m) => <SemanaDetalleView week={Number(m[1])} />,
  },
  {
    pattern: /^\/crm\/contactos\/([A-Za-z0-9_-]+)$/,
    render: (m) => <ContactoPerfilView contactId={m[1]} />,
  },
  {
    pattern: /^\/operaciones\/checklists\/([A-Za-z0-9_-]+)$/,
    render: (m) => <ChecklistsView implementationId={m[1]} />,
  },
  {
    pattern: /^\/soluciones\/planes-patrimoniales\/([a-z0-9-]+)$/,
    render: (m) => <SolucionDetalleView slug={m[1]} />,
  },
];

/** Resuelve una ruta a su contenido, o `null` si todavía no existe la página. */
export function resolvePage(path: string): React.ReactNode | null {
  const Exact = pageRegistry[path];
  if (Exact) return <Exact />;

  for (const route of dynamicRoutes) {
    const match = path.match(route.pattern);
    if (match) return route.render(match);
  }
  return null;
}

/** Ruta del detalle de una semana; la usan las tarjetas de calendario. */
export function weekDetailPath(week: number) {
  return `/contenido/calendario-maestro/semana-${week}`;
}

/** Ruta del perfil de un contacto; la usan la tabla y el panel lateral. */
export function contactProfilePath(contactId: string) {
  return `/crm/contactos/${contactId}`;
}

/** Ruta del checklist de una implementación concreta. */
export function checklistPath(implementationId: string) {
  return `/operaciones/checklists/${implementationId}`;
}

/**
 * Ruta de la ficha de una solución. Va por `slug` y no por el id de Firestore
 * porque el slug lo escribimos nosotros y sobrevive a una resiembra.
 */
export function solutionDetailPath(slug: string) {
  return `/soluciones/planes-patrimoniales/${slug}`;
}
