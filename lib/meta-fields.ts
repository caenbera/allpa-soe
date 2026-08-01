import type { LucideIcon } from "lucide-react";
import { TrendingUp, UserRound, CalendarDays, Flag, Tag, Type, Search, BadgeCheck, Share2, Repeat, Activity } from "lucide-react";

export type MetaFieldType = "progress" | "person" | "date" | "priority" | "status" | "text" | "platform" | "select";

export interface MetaFieldDef {
  id: string;
  label: string;
  type: MetaFieldType;
  icon: LucideIcon;
  options?: string[];
}

/** Catálogo completo de características que un administrador puede mostrar en el bloque superior de una página (máx. 7 a la vez). */
export const META_FIELD_CATALOG: MetaFieldDef[] = [
  { id: "progreso_total", label: "Progreso total", type: "progress", icon: TrendingUp },
  { id: "responsable", label: "Responsable", type: "person", icon: UserRound },
  { id: "fecha_objetivo", label: "Fecha objetivo", type: "date", icon: CalendarDays },
  { id: "prioridad", label: "Prioridad", type: "priority", icon: Flag },
  { id: "categoria", label: "Categoría", type: "select", icon: Tag, options: ["Educación", "Producto", "Promoción", "Institucional"] },
  { id: "palabra_objetivo", label: "Palabra objetivo", type: "text", icon: Type },
  { id: "keyword_principal", label: "Keyword principal", type: "text", icon: Search },
  { id: "estado_seo", label: "Estado SEO", type: "select", icon: BadgeCheck, options: ["Optimizado", "En revisión", "Pendiente"] },
  { id: "plataforma", label: "Plataforma", type: "platform", icon: Share2 },
  { id: "frecuencia", label: "Frecuencia", type: "text", icon: Repeat },
  { id: "estado_general", label: "Estado general", type: "status", icon: Activity },
];

export const META_FIELD_MAX = 7;

export function getMetaFieldDef(id: string): MetaFieldDef | undefined {
  return META_FIELD_CATALOG.find((f) => f.id === id);
}
