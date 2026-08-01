import * as Icons from "lucide-react";
import { Layers, type LucideIcon } from "lucide-react";

/** Resuelve un nombre de icono en PascalCase (ej. "Building2") al componente de lucide-react. */
export function resolveLucideIcon(name: string | undefined, fallback: LucideIcon = Layers): LucideIcon {
  if (!name) return fallback;
  return (Icons as unknown as Record<string, LucideIcon>)[name] ?? fallback;
}
