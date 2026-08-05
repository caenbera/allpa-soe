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
  | "rich-text"
  | "week-strip"
  | "week-cards"
  | "pillar-cards"
  | "ecosystem-hub"
  | "kpi-progress"
  | "upcoming-episodes"
  | "score-ring"
  | "tag-cloud"
  | "stat-tiles"
  | "activity-feed"
  | "ranked-bars"
  | "insight-list"
  | "profile-header"
  | "detail-drawer"
  | "line-chart"
  | "column-chart"
  | "kanban-board"
  | "relationship-graph"
  | "org-chart"
  | "family-tree";

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
  { type: "week-strip", label: "Tira de semanas", description: "Carrusel S01–S52 para saltar entre semanas.", icon: "CalendarRange" },
  { type: "week-cards", label: "Tarjetas de semana", description: "Semanas con invitado, estado y activos generados.", icon: "CalendarDays" },
  { type: "pillar-cards", label: "Tarjetas de pilar", description: "Pilares estratégicos con sus temas y avance.", icon: "Target" },
  { type: "ecosystem-hub", label: "Ecosistema de contenido", description: "Diagrama radial de un episodio a sus activos.", icon: "Share2" },
  { type: "kpi-progress", label: "Indicadores con barra", description: "Métricas con su progreso.", icon: "TrendingUp" },
  { type: "upcoming-episodes", label: "Próximos episodios", description: "Las siguientes semanas del plan.", icon: "CalendarClock" },
  { type: "score-ring", label: "Anillo de puntaje", description: "Puntaje de 0 a 100 con color por tramo.", icon: "Gauge" },
  { type: "tag-cloud", label: "Etiquetas", description: "Chips de colores que se agregan y quitan.", icon: "Tags" },
  { type: "stat-tiles", label: "Tarjetas de métrica", description: "Cifras apiladas con icono y variación.", icon: "LayoutGrid" },
  { type: "activity-feed", label: "Registro de actividad", description: "Llamadas, emails, reuniones y cambios.", icon: "History" },
  { type: "ranked-bars", label: "Ranking con barras", description: "Comparativa ordenada de mayor a menor.", icon: "BarChart3" },
  { type: "insight-list", label: "Hallazgos", description: "Conclusiones en lenguaje llano.", icon: "Lightbulb" },
  { type: "profile-header", label: "Encabezado de ficha", description: "Avatar, estado y datos de un registro.", icon: "IdCard" },
  { type: "detail-drawer", label: "Panel de detalle", description: "Ficha lateral con secciones plegables.", icon: "PanelRight" },
  { type: "line-chart", label: "Gráfico de líneas", description: "Evolución en el tiempo.", icon: "TrendingUp" },
  { type: "column-chart", label: "Gráfico de columnas", description: "Volumen por periodo.", icon: "BarChart4" },
  { type: "kanban-board", label: "Tablero por etapas", description: "Tarjetas arrastrables entre columnas.", icon: "Columns3" },
  { type: "relationship-graph", label: "Grafo de relaciones", description: "Personas, empresas y productos conectados.", icon: "Workflow" },
  { type: "org-chart", label: "Organigrama", description: "Estructura jerárquica con participación.", icon: "Network" },
  { type: "family-tree", label: "Árbol familiar", description: "Miembros de la familia por generación.", icon: "Users2" },
];

export function getBlockTypeDef(type: BlockType): BlockTypeDef | undefined {
  return BLOCK_TYPE_CATALOG.find((b) => b.type === type);
}
