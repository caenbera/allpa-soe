"use client";

import { Check, Circle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export interface LadderStep {
  code: string;
  title: string;
  description?: string;
  done: boolean;
  /** Sustituye el texto de estado por defecto ("Completado" / "Pendiente"). */
  statusLabel?: string;
  /** Cifra a la derecha, para las etapas con volumen ("156 familias"). */
  meta?: string;
}

/**
 * Pasos numerados en vertical con su estado a la derecha.
 *
 * `PhaseChecklist` cubre el caso anidado —fases plegables con pasos dentro—;
 * este cubre el plano, que es el del constructor de solución y el de las
 * etapas de implementación. Mantenerlos separados evita un bloque que hace
 * dos cosas a medias.
 */
export function StepLadder({
  steps,
  showProgress = false,
  selectedCode,
  onSelect,
  onToggle,
}: {
  steps: LadderStep[];
  /** Barra de avance y contador "n de m completados" sobre la lista. */
  showProgress?: boolean;
  selectedCode?: string;
  onSelect?: (code: string) => void;
  onToggle?: (code: string) => void;
}) {
  if (steps.length === 0) {
    return <p className="py-6 text-center text-sm text-white/35">Sin pasos definidos.</p>;
  }

  const done = steps.filter((s) => s.done).length;
  const percent = Math.round((done / steps.length) * 100);

  return (
    <div>
      {showProgress && (
        <div className="mb-3">
          <div className="mb-2 flex items-center justify-end gap-1.5 text-xs">
            <span className="tabular-nums text-white/55">
              {done} de {steps.length} completados
            </span>
            {done === steps.length && <Check className="h-3.5 w-3.5 text-emerald-400" />}
          </div>
          <Progress value={percent} className="w-full" />
        </div>
      )}

      <ul className="divide-y divide-white/6">
        {steps.map((step) => {
          const selected = step.code === selectedCode;
          const status = step.statusLabel ?? (step.done ? "Completado" : "Pendiente");

          return (
            <li key={step.code}>
              <div
                className={`flex items-center gap-3 px-1 py-2.5 transition-colors ${selected ? "bg-white/[0.04]" : ""}`}
              >
                <span
                  className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold tabular-nums ${
                    step.done
                      ? "bg-[var(--allpa-gold-400)]/15 text-[var(--allpa-gold-300)]"
                      : "bg-white/[0.06] text-white/40"
                  }`}
                >
                  {step.code}
                </span>

                {onSelect ? (
                  <button type="button" onClick={() => onSelect(step.code)} className="min-w-0 flex-1 text-left">
                    <StepText step={step} />
                  </button>
                ) : (
                  <span className="min-w-0 flex-1">
                    <StepText step={step} />
                  </span>
                )}

                {step.meta && <span className="flex-shrink-0 text-xs tabular-nums text-white/45">{step.meta}</span>}

                <span className="flex flex-shrink-0 items-center gap-1.5">
                  <span className={`text-xs ${step.done ? "text-emerald-300" : "text-violet-300"}`}>{status}</span>
                  {onToggle ? (
                    <button
                      type="button"
                      onClick={() => onToggle(step.code)}
                      aria-label={step.done ? `Marcar ${step.title} como pendiente` : `Marcar ${step.title} como completado`}
                    >
                      <StepMark done={step.done} />
                    </button>
                  ) : (
                    <StepMark done={step.done} />
                  )}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function StepText({ step }: { step: LadderStep }) {
  return (
    <>
      <span className="block truncate text-sm font-medium text-[#f3ecd9]">{step.title}</span>
      {step.description && <span className="block truncate text-xs text-white/40">{step.description}</span>}
    </>
  );
}

function StepMark({ done }: { done: boolean }) {
  return done ? (
    <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-emerald-400/15">
      <Check className="h-3 w-3 text-emerald-300" />
    </span>
  ) : (
    <Circle className="h-4.5 w-4.5 text-violet-300/50" />
  );
}
