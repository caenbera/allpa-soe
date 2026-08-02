"use client";

import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { resolveLucideIcon } from "@/lib/lucide-icon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * Marco común de todo bloque de una página: tarjeta, encabezado con icono y
 * título, acciones propias del bloque y menú de tres puntos con Editar /
 * Eliminar. Mismo patrón de edición que `AccordionSection`.
 */
export function BlockFrame({
  title,
  icon,
  actions,
  onEdit,
  onDelete,
  bare = false,
  padded = true,
  className = "",
  children,
}: {
  title: string;
  icon: string;
  /** Controles propios del bloque, a la izquierda del menú de tres puntos. */
  actions?: React.ReactNode;
  onEdit?: () => void;
  onDelete?: () => void;
  /** Sin encabezado: para bloques que ya traen su propio título. */
  bare?: boolean;
  padded?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const Icon = resolveLucideIcon(icon);
  const menu = (onEdit || onDelete) && (
    <DropdownMenu>
      <DropdownMenuTrigger className="text-white/30 transition-colors hover:text-white/60" aria-label="Opciones del bloque">
        <MoreHorizontal className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {onEdit && (
          <DropdownMenuItem onClick={onEdit}>
            <Pencil className="mr-2 h-3.5 w-3.5" />
            Editar bloque
          </DropdownMenuItem>
        )}
        {onDelete && (
          <DropdownMenuItem onClick={onDelete} className="text-red-500 focus:text-red-500">
            <Trash2 className="mr-2 h-3.5 w-3.5" />
            Eliminar bloque
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  if (bare) {
    return (
      <div className={`relative ${className}`}>
        {menu && <div className="absolute right-0 top-0 z-10">{menu}</div>}
        {children}
      </div>
    );
  }

  return (
    <div className={`surface-card overflow-hidden ${className}`}>
      <div className="flex items-center gap-2.5 border-b border-white/[0.06] px-4 py-3">
        <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--allpa-gold-400)]/12 text-[var(--allpa-gold-300)]">
          {/* eslint-disable-next-line react-hooks/static-components -- selecciona un icono existente por nombre, no crea un componente nuevo */}
          <Icon className="h-4 w-4" />
        </span>
        <h3 className="min-w-0 flex-1 truncate font-semibold text-[#f3ecd9]">{title}</h3>
        {actions}
        {menu}
      </div>
      <div className={padded ? "px-4 py-4" : ""}>{children}</div>
    </div>
  );
}
