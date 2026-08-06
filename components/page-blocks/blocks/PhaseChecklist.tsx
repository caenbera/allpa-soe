"use client";

import { Fragment, useState } from "react";
import { ChevronDown, CircleDashed, CircleDot, Plus } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

export type PhaseStepStatus = "Completado" | "En proceso" | "Pendiente";

export interface PhaseStep {
  /** Numeración visible dentro de su fase: "2.3". */
  code: string;
  title: string;
  owner: string;
  status: PhaseStepStatus;
  /** Vacío mientras no haya fecha comprometida. */
  dueDate: string;
  overdue: boolean;
}

export interface ChecklistPhaseData {
  id: string;
  index: number;
  title: string;
  steps: PhaseStep[];
}

const STATUS_TEXT: Record<PhaseStepStatus, string> = {
  Completado: "text-emerald-400",
  "En proceso": "text-blue-400",
  Pendiente: "text-white/40",
};

/** Barra de avance de la fase; su color acompaña a lo completa que esté. */
function phaseColor(pct: number): string {
  if (pct === 100) return "#22c55e";
  if (pct >= 50) return "#3b82f6";
  return "#a78bfa";
}

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/**
 * Checklist de una implementación, agrupado en fases numeradas.
 *
 * Cada fase muestra cuánto lleva hecho, calculado de sus propios pasos, así
 * que marcar una casilla siempre deja el porcentaje y la barra en el mismo
 * sitio que la realidad. A diferencia de `ChecklistPanel`, que es una lista
 * suelta de panel lateral, aquí cada paso tiene responsable, estado y fecha.
 */
export function PhaseChecklist({
  phases,
  selectedCode,
  onSelectStep,
  onToggleStep,
  onAddStep,
}: {
  phases: ChecklistPhaseData[];
  selectedCode?: string | null;
  onSelectStep?: (code: string) => void;
  /** Sin este callback la casilla se marca, pero solo en pantalla. */
  onToggleStep?: (code: string, done: boolean) => void;
  onAddStep?: () => void;
}) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  if (phases.length === 0) {
    return <p className="py-10 text-center text-sm text-white/35">Esta implementación todavía no tiene pasos.</p>;
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-[11px] uppercase tracking-wide text-white/35">
              <th className="py-2.5 pr-3 font-medium">Paso</th>
              <th className="w-40 py-2.5 pr-3 font-medium">Responsable</th>
              <th className="w-32 py-2.5 pr-3 font-medium">Estado</th>
              <th className="w-32 py-2.5 pr-3 font-medium">Fecha límite</th>
              <th className="w-24 py-2.5 font-medium">Progreso</th>
            </tr>
          </thead>

          <tbody>
            {phases.map((phase) => {
              const done = phase.steps.filter((s) => s.status === "Completado").length;
              const pct = phase.steps.length > 0 ? Math.round((done / phase.steps.length) * 100) : 0;
              const isOpen = !collapsed[phase.id];

              return (
                <Fragment key={phase.id}>
                  <tr className="border-b border-white/[0.06]">
                    <td colSpan={4} className="py-2.5 pr-3">
                      <button
                        type="button"
                        onClick={() => setCollapsed((c) => ({ ...c, [phase.id]: isOpen }))}
                        aria-expanded={isOpen}
                        className="flex items-center gap-2.5 text-left"
                      >
                        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[var(--allpa-gold-400)]/15 text-[11px] font-bold text-[var(--allpa-gold-300)]">
                          {phase.index}
                        </span>
                        <span className="font-semibold text-[#f3ecd9]">{phase.title}</span>
                        <ChevronDown className={`h-3.5 w-3.5 text-white/30 transition-transform ${isOpen ? "" : "-rotate-90"}`} />
                      </button>
                    </td>
                    <td className="py-2.5">
                      <span className="flex items-center gap-2">
                        <span className="text-xs tabular-nums text-white/60">{pct}%</span>
                        <span className="h-1.5 w-16 overflow-hidden rounded-full bg-white/8">
                          <span className="block h-full rounded-full" style={{ width: `${pct}%`, background: phaseColor(pct) }} />
                        </span>
                      </span>
                    </td>
                  </tr>

                  {isOpen &&
                    phase.steps.map((step) => {
                      const isDone = step.status === "Completado";
                      const isSelected = selectedCode === step.code;

                      return (
                        <tr
                          key={step.code}
                          onClick={() => onSelectStep?.(step.code)}
                          className={`cursor-pointer border-b border-white/[0.04] last:border-0 transition-colors ${
                            isSelected ? "bg-[var(--allpa-gold-400)]/[0.06]" : "hover:bg-white/[0.02]"
                          }`}
                        >
                          <td className="py-2.5 pr-3">
                            <span className="flex items-center gap-2.5">
                              <span onClick={(e) => e.stopPropagation()} className="flex-shrink-0">
                                <Checkbox
                                  checked={isDone}
                                  onCheckedChange={() => onToggleStep?.(step.code, !isDone)}
                                  aria-label={step.title}
                                />
                              </span>
                              <span className="w-8 flex-shrink-0 text-xs tabular-nums text-white/35">{step.code}</span>
                              <span className={`min-w-0 truncate ${isDone ? "text-white/40 line-through" : "text-white/85"}`}>
                                {step.title}
                              </span>
                              {step.overdue && !isDone && (
                                <span className="flex-shrink-0 rounded-full bg-rose-400/12 px-2 py-0.5 text-[10px] font-medium text-rose-300">
                                  Atrasado
                                </span>
                              )}
                            </span>
                          </td>

                          <td className="py-2.5 pr-3">
                            <span className="flex min-w-0 items-center gap-2">
                              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-white/10 text-[9px] font-bold text-white/70">
                                {initialsOf(step.owner)}
                              </span>
                              <span className="truncate text-xs text-white/65">{step.owner}</span>
                            </span>
                          </td>

                          <td className={`py-2.5 pr-3 text-xs ${STATUS_TEXT[step.status]}`}>{step.status}</td>

                          <td className="py-2.5 pr-3 text-xs text-white/50">{step.dueDate || "—"}</td>

                          <td className="py-2.5">
                            {isDone ? (
                              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-400">
                                ✓
                              </span>
                            ) : step.status === "En proceso" ? (
                              <CircleDot className="h-4 w-4 text-blue-400" />
                            ) : (
                              <CircleDashed className="h-4 w-4 text-white/20" />
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {onAddStep && (
        <button
          type="button"
          onClick={onAddStep}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-white/12 py-2.5 text-xs text-white/35 transition-colors hover:border-[var(--allpa-gold-400)]/50 hover:text-[var(--allpa-gold-300)]"
        >
          <Plus className="h-3.5 w-3.5" />
          Agregar paso
        </button>
      )}
    </div>
  );
}
