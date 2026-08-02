"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";

export interface ChecklistLine {
  id: string;
  label: string;
  done: boolean;
  /** Fecha o estado a la derecha ("15 Feb", "En progreso", "Pendiente"). */
  meta?: string;
}

/**
 * Checklist compacto de panel lateral, con contador en vivo.
 * Para el checklist completo con responsables y notas, ver `ChecklistTable`.
 */
export function ChecklistPanel({ lines: initialLines }: { lines: ChecklistLine[] }) {
  const [lines, setLines] = useState(initialLines);
  const done = lines.filter((l) => l.done).length;

  const toggle = (id: string) => {
    setLines((list) => list.map((l) => (l.id === id ? { ...l, done: !l.done } : l)));
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-xs">
        <span className="text-white/40">
          {done} de {lines.length} completadas
        </span>
        <span className="font-semibold text-[var(--allpa-gold-300)]">
          {lines.length > 0 ? Math.round((done / lines.length) * 100) : 0}%
        </span>
      </div>

      <ul className="space-y-2.5">
        {lines.map((line) => (
          <li key={line.id} className="flex items-center gap-2.5">
            <Checkbox checked={line.done} onCheckedChange={() => toggle(line.id)} />
            <span className={`min-w-0 flex-1 truncate text-sm ${line.done ? "text-white/40 line-through" : "text-white/80"}`}>
              {line.label}
            </span>
            {line.meta && <span className="flex-shrink-0 text-xs text-white/35">{line.meta}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
