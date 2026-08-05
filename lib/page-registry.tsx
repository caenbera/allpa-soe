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
