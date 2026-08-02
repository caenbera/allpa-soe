/**
 * Estructura de bloques/páginas por defecto para una empresa nueva.
 * Sirve dos propósitos:
 *  1) Es la fuente que usa el script de seed (lib/services/seed.ts) para
 *     poblar Firestore cuando se crea una empresa.
 *  2) Es el fallback de demostración que usa el Sidebar cuando todavía no
 *     hay conexión a Firebase (desarrollo local sin proyecto configurado).
 *
 * `built: true` marca las páginas que ya tienen contenido real
 * implementado; el resto aparecen en el menú pero enlazan a un estado
 * "Próximamente" — se irán integrando según avance el proyecto.
 */

export interface DefaultPageConfig {
  slug: string;
  name: string;
  icon: string;
  built: boolean;
  children?: DefaultPageConfig[];
}

export interface DefaultBlockConfig {
  slug: string;
  name: string;
  icon: string;
  pages: DefaultPageConfig[];
}

export const defaultSidebarBlocks: DefaultBlockConfig[] = [
  {
    slug: "marketing",
    name: "Marketing",
    icon: "Megaphone",
    pages: [
      {
        slug: "sitio-web",
        name: "Sitio Web",
        icon: "Globe",
        built: false,
        children: [
          { slug: "homepage", name: "Homepage", icon: "Home", built: true },
          { slug: "about-us", name: "About Us", icon: "Building2", built: false },
          { slug: "products", name: "Products", icon: "Package", built: false },
          { slug: "services", name: "Services", icon: "Briefcase", built: false },
          { slug: "landing-pages", name: "Landing Pages", icon: "PanelsTopLeft", built: false },
          { slug: "seo", name: "SEO", icon: "SearchCheck", built: false },
        ],
      },
      {
        slug: "blog",
        name: "Blog",
        icon: "Newspaper",
        built: false,
        children: [
          { slug: "ideas", name: "Ideas de Artículos", icon: "Lightbulb", built: false },
          { slug: "en-produccion", name: "Artículos en Producción", icon: "PenLine", built: true },
          { slug: "publicados", name: "Artículos Publicados", icon: "CheckCircle2", built: false },
          { slug: "calendario-editorial", name: "Calendario Editorial", icon: "CalendarDays", built: false },
          { slug: "categorias", name: "Categorías", icon: "Tags", built: false },
          { slug: "keywords-seo", name: "Keywords SEO", icon: "SearchCheck", built: false },
        ],
      },
      {
        slug: "redes-sociales",
        name: "Redes Sociales",
        icon: "Share2",
        built: false,
        children: [
          { slug: "facebook", name: "Facebook", icon: "MessageCircle", built: false },
          { slug: "instagram", name: "Instagram", icon: "Camera", built: true },
          { slug: "linkedin", name: "LinkedIn", icon: "Briefcase", built: false },
          { slug: "tiktok", name: "TikTok", icon: "Music2", built: false },
          { slug: "youtube-shorts", name: "YouTube Shorts", icon: "Video", built: false },
        ],
      },
      { slug: "campanas", name: "Campañas", icon: "Target", built: false },
      {
        slug: "podcast",
        name: "Podcast",
        icon: "Mic",
        built: false,
        children: [
          { slug: "produccion", name: "Producción", icon: "Radio", built: true },
          { slug: "invitados", name: "Invitados", icon: "Users", built: true },
          { slug: "contenido", name: "Contenido", icon: "FileText", built: false },
          { slug: "calendario", name: "Calendario", icon: "CalendarDays", built: false },
        ],
      },
    ],
  },
  {
    slug: "contenido",
    name: "Contenido",
    icon: "Share2",
    pages: [
      { slug: "centro-de-contenido", name: "Centro de Contenido", icon: "LayoutDashboard", built: true },
      { slug: "calendario-maestro", name: "Calendario Maestro", icon: "CalendarDays", built: true },
      { slug: "temas-estrategicos", name: "Temas Estratégicos", icon: "Target", built: true },
      { slug: "episodios-madre", name: "Episodios Madre", icon: "Mic", built: true },
      { slug: "contenido-derivado", name: "Contenido Derivado", icon: "GitFork", built: true },
      { slug: "academia", name: "Academia", icon: "GraduationCap", built: true },
      { slug: "biblioteca-multimedia", name: "Biblioteca Multimedia", icon: "Library", built: true },
      { slug: "recursos-descargables", name: "Recursos Descargables", icon: "Download", built: true },
    ],
  },
  { slug: "ventas", name: "Ventas", icon: "ShoppingCart", pages: [] },
  { slug: "clientes", name: "Clientes", icon: "UserRound", pages: [] },
  { slug: "productos", name: "Productos", icon: "Package2", pages: [] },
  { slug: "operaciones", name: "Operaciones", icon: "Cog", pages: [] },
  { slug: "equipo", name: "Equipo", icon: "Users2", pages: [] },
  { slug: "calendario", name: "Calendario", icon: "CalendarDays", pages: [] },
  { slug: "finanzas", name: "Finanzas", icon: "Landmark", pages: [] },
  { slug: "analitica", name: "Analítica", icon: "LineChart", pages: [] },
  { slug: "automatizaciones", name: "Automatizaciones", icon: "Workflow", pages: [] },
  { slug: "configuracion", name: "Configuración", icon: "Settings", pages: [] },
];
