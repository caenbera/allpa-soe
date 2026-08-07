/**
 * Catálogo de tipos de bloque disponibles para armar las páginas internas.
 * Cada página es una lista de `BlockInstance`; `blockRegistry`
 * (components/page-blocks/block-registry.tsx) mapea cada tipo a su componente.
 *
 * Para agregar un tipo nuevo: añadirlo aquí y registrarlo en el registry.
 * Queda disponible automáticamente en el selector de "Agregar bloque" de
 * todas las páginas.
 *
 * `blockRegistry` está tipado como `Record<BlockType, …>` completo justamente
 * para que olvidarse del registro sea un error de compilación: ofrecer en el
 * selector un tipo que luego no se pinta es peor que no ofrecerlo.
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
  | "family-tree"
  | "agenda-list"
  | "quick-actions"
  | "metric-delta"
  | "phase-checklist"
  | "month-calendar"
  | "time-grid-calendar"
  | "mini-month"
  | "settings-cards"
  | "solution-cards"
  | "step-ladder"
  | "component-picks"
  | "media-cards"
  | "nav-tiles"
  | "parameter-form"
  | "comparison-table";

/** Dónde se pinta un bloque dentro de la página. */
export type BlockPlacement = "main" | "side";

export const BLOCK_PLACEMENTS: { value: BlockPlacement; label: string; description: string; icon: string }[] = [
  { value: "main", label: "Cuerpo de la página", description: "Ancho completo, junto al contenido principal.", icon: "LayoutPanelTop" },
  { value: "side", label: "Panel lateral", description: "Columna estrecha de la derecha.", icon: "PanelRight" },
];

/** Los bloques guardados antes de que existiera la opción viven en el lateral. */
export const DEFAULT_PLACEMENT: BlockPlacement = "side";

export interface BlockInstance<TConfig = unknown> {
  id: string;
  type: BlockType;
  title: string;
  icon: string;
  /** Datos propios del bloque; su forma la define cada componente. */
  config: TConfig;
  /** Oculta el encabezado del marco cuando el bloque ya trae su propio título. */
  bare?: boolean;
  /** Ausente en los bloques creados antes de esta opción: se tratan como `side`. */
  placement?: BlockPlacement;
}

/** Agrupación del selector, para no dar una lista plana de casi cuarenta. */
export type BlockCategory = "indicadores" | "datos" | "graficos" | "contenido" | "personas" | "planificacion" | "relaciones";

export const BLOCK_CATEGORIES: { value: BlockCategory; label: string }[] = [
  { value: "indicadores", label: "Indicadores" },
  { value: "graficos", label: "Gráficos" },
  { value: "datos", label: "Datos y listas" },
  { value: "contenido", label: "Contenido y notas" },
  { value: "personas", label: "Personas y fichas" },
  { value: "planificacion", label: "Planificación" },
  { value: "relaciones", label: "Relaciones" },
];

export interface BlockTypeDef {
  type: BlockType;
  label: string;
  description: string;
  icon: string;
  category: BlockCategory;
}

export const BLOCK_TYPE_CATALOG: BlockTypeDef[] = [
  // Indicadores
  { type: "kpi-strip", label: "Indicadores", description: "Fila de tarjetas con métricas clave.", icon: "LayoutGrid", category: "indicadores" },
  { type: "stat-tiles", label: "Tarjetas de métrica", description: "Cifras apiladas con icono y variación.", icon: "LayoutGrid", category: "indicadores" },
  { type: "kpi-progress", label: "Indicadores con barra", description: "Métricas con su progreso.", icon: "TrendingUp", category: "indicadores" },
  { type: "score-ring", label: "Anillo de puntaje", description: "Puntaje de 0 a 100 con color por tramo.", icon: "Gauge", category: "indicadores" },

  // Gráficos
  { type: "donut-chart", label: "Gráfico de dona", description: "Distribución por categoría con leyenda.", icon: "PieChart", category: "graficos" },
  { type: "bar-chart", label: "Gráfico de barras", description: "Comparativa por categoría.", icon: "BarChart3", category: "graficos" },
  { type: "line-chart", label: "Gráfico de líneas", description: "Evolución en el tiempo.", icon: "TrendingUp", category: "graficos" },
  { type: "column-chart", label: "Gráfico de columnas", description: "Volumen por periodo.", icon: "BarChart4", category: "graficos" },
  { type: "funnel-chart", label: "Embudo", description: "Etapas de conversión.", icon: "Filter", category: "graficos" },
  { type: "ranked-bars", label: "Ranking con barras", description: "Comparativa ordenada de mayor a menor.", icon: "BarChart3", category: "graficos" },
  { type: "insight-list", label: "Hallazgos", description: "Conclusiones en lenguaje llano.", icon: "Lightbulb", category: "graficos" },
  { type: "metric-delta", label: "Métricas con variación", description: "Valor por fila y hacia dónde se mueve.", icon: "ArrowUpDown", category: "graficos" },

  // Datos y listas
  { type: "data-table", label: "Tabla de datos", description: "Listado ordenable con filtros y paginación.", icon: "Table", category: "datos" },
  { type: "filter-toolbar", label: "Barra de filtros", description: "Buscador y filtros desplegables.", icon: "Filter", category: "datos" },
  { type: "kanban-board", label: "Tablero por etapas", description: "Tarjetas arrastrables entre columnas.", icon: "Columns3", category: "datos" },
  { type: "file-list", label: "Lista de archivos", description: "Documentos y recursos adjuntos.", icon: "FileText", category: "datos" },
  { type: "asset-progress", label: "Activos con progreso", description: "Tarjetas de activos y su avance.", icon: "Boxes", category: "datos" },
  { type: "solution-cards", label: "Tarjetas de solución", description: "Plan con sus prestaciones, alcance y acceso.", icon: "LayoutGrid", category: "datos" },
  { type: "component-picks", label: "Lista de componentes", description: "Componentes con su peso, cobertura y si están incluidos.", icon: "Boxes", category: "datos" },
  { type: "media-cards", label: "Tarjetas con cabecera", description: "Fichas con cabecera de color, etiqueta y métricas al pie.", icon: "Images", category: "datos" },
  { type: "nav-tiles", label: "Baldosas de navegación", description: "Accesos con icono, subtítulo y conteo.", icon: "LayoutGrid", category: "datos" },
  { type: "comparison-table", label: "Matriz de comparación", description: "Atributos en filas y opciones en columnas.", icon: "Columns3", category: "datos" },

  // Contenido y notas
  { type: "rich-text", label: "Texto enriquecido", description: "Bloque de redacción libre.", icon: "PenLine", category: "contenido" },
  { type: "notes-panel", label: "Notas", description: "Notas rápidas del equipo.", icon: "StickyNote", category: "contenido" },
  { type: "checklist-panel", label: "Checklist", description: "Lista de verificación con progreso.", icon: "CheckSquare", category: "contenido" },
  { type: "info-card", label: "Ficha de información", description: "Lista de campos y valores.", icon: "ClipboardList", category: "contenido" },
  { type: "media-preview", label: "Vista previa multimedia", description: "Video o audio con reproductor.", icon: "PlayCircle", category: "contenido" },
  { type: "quick-actions", label: "Acciones rápidas", description: "Rejilla de atajos con icono y etiqueta.", icon: "Zap", category: "contenido" },
  { type: "parameter-form", label: "Formulario de parámetros", description: "Campos de simulación: desplegables, importes y tramos.", icon: "SlidersHorizontal", category: "contenido" },
  { type: "settings-cards", label: "Tarjetas de configuración", description: "Ajustes agrupados por área, con sus accesos.", icon: "Settings2", category: "contenido" },
  { type: "tag-cloud", label: "Etiquetas", description: "Chips de colores que se agregan y quitan.", icon: "Tags", category: "contenido" },

  // Personas y fichas
  { type: "person-card", label: "Ficha de persona", description: "Datos de contacto de un invitado o responsable.", icon: "UserRound", category: "personas" },
  { type: "profile-header", label: "Encabezado de ficha", description: "Avatar, estado y datos de un registro.", icon: "IdCard", category: "personas" },
  { type: "detail-drawer", label: "Panel de detalle", description: "Ficha lateral con secciones plegables.", icon: "PanelRight", category: "personas" },
  { type: "activity-feed", label: "Registro de actividad", description: "Llamadas, emails, reuniones y cambios.", icon: "History", category: "personas" },

  // Planificación
  { type: "timeline", label: "Línea de tiempo", description: "Hitos con fecha y estado.", icon: "GitCommitHorizontal", category: "planificacion" },
  { type: "flow-strip", label: "Flujo de pasos", description: "Etapas de un proceso en secuencia.", icon: "Workflow", category: "planificacion" },
  { type: "week-strip", label: "Tira de semanas", description: "Carrusel S01–S52 para saltar entre semanas.", icon: "CalendarRange", category: "planificacion" },
  { type: "week-cards", label: "Tarjetas de semana", description: "Semanas con invitado, estado y activos generados.", icon: "CalendarDays", category: "planificacion" },
  { type: "pillar-cards", label: "Tarjetas de pilar", description: "Pilares estratégicos con sus temas y avance.", icon: "Target", category: "planificacion" },
  { type: "upcoming-episodes", label: "Próximos episodios", description: "Las siguientes semanas del plan.", icon: "CalendarClock", category: "planificacion" },
  { type: "agenda-list", label: "Agenda del día", description: "Acciones por hora, con prioridad y responsable.", icon: "ListChecks", category: "planificacion" },
  { type: "phase-checklist", label: "Checklist por fases", description: "Fases numeradas con su progreso y sus pasos.", icon: "ListTree", category: "planificacion" },
  { type: "step-ladder", label: "Pasos numerados", description: "Metodología paso a paso con el estado de cada uno.", icon: "ListOrdered", category: "planificacion" },
  { type: "month-calendar", label: "Calendario mensual", description: "Rejilla del mes con los eventos de cada día.", icon: "CalendarDays", category: "planificacion" },
  { type: "time-grid-calendar", label: "Calendario por horas", description: "Rejilla horaria de un día o de la semana.", icon: "CalendarRange", category: "planificacion" },
  { type: "mini-month", label: "Mes compacto", description: "Mes reducido para saltar de fecha.", icon: "CalendarCheck", category: "planificacion" },

  // Relaciones
  { type: "relationship-graph", label: "Grafo de relaciones", description: "Personas, empresas y productos conectados.", icon: "Workflow", category: "relaciones" },
  { type: "org-chart", label: "Organigrama", description: "Estructura jerárquica con participación.", icon: "Network", category: "relaciones" },
  { type: "family-tree", label: "Árbol familiar", description: "Miembros de la familia por generación.", icon: "Users2", category: "relaciones" },
  { type: "ecosystem-hub", label: "Ecosistema de contenido", description: "Diagrama radial de un episodio a sus activos.", icon: "Share2", category: "relaciones" },
];

export function getBlockTypeDef(type: BlockType): BlockTypeDef | undefined {
  return BLOCK_TYPE_CATALOG.find((b) => b.type === type);
}
