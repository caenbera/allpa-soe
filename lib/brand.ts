/**
 * Fuente única de verdad para los assets de marca de Allpa SOE.
 * Cuando el usuario entregue fotografía real para el carrusel de auth o
 * contenido de empresa, solo hay que reemplazar los archivos en
 * `public/brand/carousel/` y actualizar `authCarouselSlides` — nada más
 * en la app referencia estas rutas directamente.
 */

export const brandLogos = {
  /** Login / Registro */
  full: "/brand/logo-allpa-soe.png",
  /** Sidebar expandido + cabecera de invitaciones (og:image) */
  mark: "/brand/logo-allpa-01.png",
  /** Sidebar colapsado + favicon */
  icon: "/brand/logo-a.png",
} as const;

export type AuthCarouselSlide = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  /** Ruta a una imagen real en public/brand/carousel/*. null = usar placeholder generado. */
  image: string | null;
};

/**
 * Slides del carrusel de login/registro. Todavía no hay fotografía del
 * cliente, así que `image` queda en null y se renderiza un placeholder
 * en degradado negro/dorado con el monograma "A". En cuanto lleguen las
 * imágenes reales, basta con colocarlas en public/brand/carousel/ y
 * apuntar `image` hacia ese archivo.
 */
export const authCarouselSlides: AuthCarouselSlide[] = [
  {
    id: "control-total",
    eyebrow: "Visión ejecutiva",
    title: "Todo tu negocio, en un solo panel",
    description:
      "Supervisa cada área de tu empresa desde un mismo lugar, con datos en tiempo real y control total sobre quién ve qué.",
    image: null,
  },
  {
    id: "equipos",
    eyebrow: "Colaboración",
    title: "Equipos alineados, procesos claros",
    description:
      "Crea bloques y páginas a la medida de tu operación, con checklists, notas y responsables en cada tarea.",
    image: null,
  },
  {
    id: "seguridad",
    eyebrow: "Seguridad multi-empresa",
    title: "Privacidad garantizada por diseño",
    description:
      "Cada empresa es un espacio aislado. Ni el super administrador accede a tus datos sin tu autorización explícita.",
    image: null,
  },
];
