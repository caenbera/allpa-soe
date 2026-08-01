import type { ComponentType } from "react";
import { HomepageView } from "@/components/pages/marketing/HomepageView";
import { BlogEnProduccionView } from "@/components/pages/marketing/BlogEnProduccionView";
import { InstagramView } from "@/components/pages/marketing/InstagramView";
import { PodcastProduccionView } from "@/components/pages/marketing/PodcastProduccionView";
import { InvitadosView } from "@/components/pages/marketing/InvitadosView";

/** Mapa ruta → componente para las páginas internas ya construidas. */
export const pageRegistry: Record<string, ComponentType> = {
  "/marketing/sitio-web/homepage": HomepageView,
  "/marketing/blog/en-produccion": BlogEnProduccionView,
  "/marketing/redes-sociales/instagram": InstagramView,
  "/marketing/podcast/produccion": PodcastProduccionView,
  "/marketing/podcast/invitados": InvitadosView,
};
