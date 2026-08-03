"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { SectionStatus } from "@/lib/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const STATUS_CONFIG: Record<SectionStatus, { label: string; dot: string; text: string; bg: string }> = {
  pendiente: { label: "Pendiente", dot: "bg-white/40", text: "text-white/70", bg: "bg-white/10" },
  en_progreso: { label: "En Progreso", dot: "bg-emerald-400", text: "text-emerald-300", bg: "bg-emerald-400/10" },
  en_revision: { label: "En Revisión", dot: "bg-[#eec469]", text: "text-[#eec469]", bg: "bg-[#eec469]/10" },
  completado: { label: "Completado", dot: "bg-emerald-400", text: "text-emerald-300", bg: "bg-emerald-400/10" },
};

/**
 * Pastilla de estado. Si se le pasa `onChange` funciona controlada — el
 * estado lo manda el padre, así el badge siempre refleja cambios externos
 * (por ejemplo, marcar la casilla de una tarea). Sin `onChange` mantiene su
 * propio estado para los usos sueltos.
 */
export function StatusBadge({
  status,
  onChange,
  interactive = true,
}: {
  status: SectionStatus;
  onChange?: (status: SectionStatus) => void;
  interactive?: boolean;
}) {
  const [local, setLocal] = useState(status);
  const current = onChange ? status : local;
  const cfg = STATUS_CONFIG[current];

  const pill = (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${cfg.bg} ${cfg.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
      {interactive && <ChevronDown className="h-3 w-3 opacity-60" />}
    </span>
  );

  if (!interactive) return pill;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="cursor-pointer outline-none">{pill}</DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {(Object.keys(STATUS_CONFIG) as SectionStatus[]).map((s) => (
          <DropdownMenuItem
            key={s}
            onClick={() => {
              setLocal(s);
              onChange?.(s);
            }}
          >
            <span className={`mr-2 h-1.5 w-1.5 rounded-full ${STATUS_CONFIG[s].dot}`} />
            {STATUS_CONFIG[s].label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
