import type { ComponentType } from "react";
import { HomepageView } from "@/components/pages/marketing/HomepageView";
import { BlogEnProduccionView } from "@/components/pages/marketing/BlogEnProduccionView";
import { InstagramView } from "@/components/pages/marketing/InstagramView";
import { PodcastProduccionView } from "@/components/pages/marketing/PodcastProduccionView";
import { InvitadosView } from "@/components/pages/marketing/InvitadosView";
import { CentroContenidoView } from "@/components/pages/contenido/CentroContenidoView";
import { EpisodiosMadreView } from "@/components/pages/contenido/EpisodiosMadreView";
import { ContenidoDerivadoView } from "@/components/pages/contenido/ContenidoDerivadoView";
import { BibliotecaMultimediaView } from "@/components/pages/contenido/BibliotecaMultimediaView";
import { CalendarioMaestroView } from "@/components/pages/contenido/CalendarioMaestroView";
import { TemasEstrategicosView } from "@/components/pages/contenido/TemasEstrategicosView";
import { AcademiaView } from "@/components/pages/contenido/AcademiaView";
import { RecursosDescargablesView } from "@/components/pages/contenido/RecursosDescargablesView";

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
};
