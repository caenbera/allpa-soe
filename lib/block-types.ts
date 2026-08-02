/**
 * Catálogo de tipos de bloque disponibles para armar las páginas internas.
 * Cada página es una lista de `BlockInstance`; `blockRegistry`
 * (components/page-blocks/block-registry.tsx) mapea cada tipo a su componente.
 *
 * Para agregar un tipo nuevo: añadirlo aquí y registrarlo en el registry.
 * Queda disponible automáticamente en el selector de "Agregar bloque" de
 * todas las páginas.
 */

export type BlockType =
  | "kpi-strip"
  | "data-table"
  | "filter-toolbar"
  | "donut-chart"
  | "info-card"
  | "file-list"
  | "checklist-panel"
  | "notes-panel"
  | "asset-progress"
  | "flow-strip"
  | "person-card"
  | "media-preview"
  | "timeline"
  | "progress-rows"
  | "resource-grid"
  | "nested-tree"
  | "calendar-grid"
  | "bar-chart"
  | "funnel-chart"
  | "rich-text";

export interface BlockInstance<TConfig = unknown> {
  id: string;
  type: BlockType;
  title: string;
  icon: string;
  /** Datos propios del bloque; su forma la define cada componente. */
  config: TConfig;
  /** Oculta el encabezado del marco cuando el bloque ya trae su propio título. */
  bare?: boolean;
}

export interface BlockTypeDef {
  type: BlockType;
  label: string;
  description: string;
  icon: string;
}

export const BLOCK_TYPE_CATALOG: BlockTypeDef[] = [
  { type: "kpi-strip", label: "Indicadores", description: "Fila de tarjetas con métricas clave.", icon: "LayoutGrid" },
  { type: "data-table", label: "Tabla de datos", description: "Listado ordenable con filtros y paginación.", icon: "Table" },
  { type: "filter-toolbar", label: "Barra de filtros", description: "Buscador, filtros y exportación.", icon: "Filter" },
  { type: "donut-chart", label: "Gráfico de dona", description: "Distribución por categoría con leyenda.", icon: "PieChart" },
  { type: "info-card", label: "Ficha de información", description: "Lista de campos y valores.", icon: "ClipboardList" },
  { type: "file-list", label: "Lista de archivos", description: "Documentos y recursos adjuntos.", icon: "FileText" },
  { type: "checklist-panel", label: "Checklist", description: "Lista de verificación con progreso.", icon: "CheckSquare" },
  { type: "notes-panel", label: "Notas", description: "Notas rápidas del equipo.", icon: "StickyNote" },
  { type: "asset-progress", label: "Activos con progreso", description: "Tarjetas de activos y su avance.", icon: "Boxes" },
  { type: "flow-strip", label: "Flujo de pasos", description: "Etapas de un proceso en secuencia.", icon: "Workflow" },
  { type: "person-card", label: "Ficha de persona", description: "Datos de contacto de un invitado o responsable.", icon: "UserRound" },
  { type: "media-preview", label: "Vista previa multimedia", description: "Video o audio con reproductor.", icon: "PlayCircle" },
  { type: "timeline", label: "Línea de tiempo", description: "Hitos con fecha y estado.", icon: "GitCommitHorizontal" },
  { type: "progress-rows", label: "Filas de progreso", description: "Elementos con barra de avance y métricas.", icon: "BarChart3" },
  { type: "resource-grid", label: "Rejilla de recursos", description: "Tarjetas con portada y métricas.", icon: "Grid3x3" },
  { type: "nested-tree", label: "Estructura por módulos", description: "Módulos y lecciones anidadas.", icon: "ListTree" },
  { type: "calendar-grid", label: "Calendario", description: "Vista de semanas agrupadas por mes.", icon: "CalendarDays" },
  { type: "bar-chart", label: "Gráfico de barras", description: "Comparativa por categoría.", icon: "BarChart3" },
  { type: "funnel-chart", label: "Embudo", description: "Etapas de conversión.", icon: "Filter" },
  { type: "rich-text", label: "Texto enriquecido", description: "Bloque de redacción libre.", icon: "PenLine" },
];

export function getBlockTypeDef(type: BlockType): BlockTypeDef | undefined {
  return BLOCK_TYPE_CATALOG.find((b) => b.type === type);
}
