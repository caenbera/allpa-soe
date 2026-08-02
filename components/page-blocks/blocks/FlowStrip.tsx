import { ChevronRight } from "lucide-react";
import { resolveLucideIcon } from "@/lib/lucide-icon";
import { Progress } from "@/components/ui/progress";

export interface FlowStep {
  id: string;
  label: string;
  sub: string;
  icon: string;
  color: string;
  status: "Completado" | "En Producción" | "Pendiente" | "No Iniciado";
}

const STATUS_STYLE: Record<FlowStep["status"], string> = {
  Completado: "bg-emerald-400/12 text-emerald-300",
  "En Producción": "bg-amber-400/12 text-amber-300",
  Pendiente: "bg-white/8 text-white/50",
  "No Iniciado": "bg-white/5 text-white/35",
};

/** Pasos horizontales de un proceso; en móvil hace scroll lateral propio. */
export function FlowStrip({
  steps,
  progressLabel,
  progressValue,
}: {
  steps: FlowStep[];
  progressLabel?: string;
  progressValue?: number;
}) {
  return (
    <div>
      <div className="-mx-1 overflow-x-auto px-1 pb-1">
        <div className="flex min-w-max items-stretch gap-1">
          {steps.map((step, i) => {
            const Icon = resolveLucideIcon(step.icon);
            return (
              <div key={step.id} className="flex items-center gap-1">
                <div className="flex w-[104px] flex-col items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-2 py-2.5 text-center">
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-xl"
                    style={{ background: `${step.color}20`, color: step.color }}
                  >
                    <Icon className="h-[18px] w-[18px]" />
                  </span>
                  <span className="text-xs font-medium leading-tight text-white/85">{step.label}</span>
                  <span className="text-[10px] leading-tight text-white/35">{step.sub}</span>
                  <span className={`mt-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${STATUS_STYLE[step.status]}`}>
                    {step.status}
                  </span>
                </div>
                {i < steps.length - 1 && <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 text-white/20" />}
              </div>
            );
          })}
        </div>
      </div>

      {progressValue !== undefined && (
        <div className="mt-3">
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="text-white/45">Progreso general de distribución</span>
            <span className="font-medium text-white/75">{progressLabel ?? `${progressValue}%`}</span>
          </div>
          <Progress value={progressValue} />
        </div>
      )}
    </div>
  );
}
