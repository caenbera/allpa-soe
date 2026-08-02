import { Check } from "lucide-react";
import type { BadgeTone } from "@/components/page-blocks/blocks/DataTable";

export interface TimelineStep {
  id: string;
  label: string;
  status: string;
  tone: BadgeTone;
  date: string;
  done?: boolean;
}

const TONES: Record<BadgeTone, string> = {
  gold: "bg-[var(--allpa-gold-400)]/12 text-[var(--allpa-gold-300)]",
  emerald: "bg-emerald-400/12 text-emerald-300",
  amber: "bg-amber-400/12 text-amber-300",
  blue: "bg-blue-400/12 text-blue-300",
  violet: "bg-violet-400/12 text-violet-300",
  rose: "bg-rose-400/12 text-rose-300",
  neutral: "bg-white/8 text-white/55",
};

export function Timeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <ol className="relative space-y-4">
      {steps.map((step, i) => (
        <li key={step.id} className="relative flex items-center gap-3 pl-1">
          {i < steps.length - 1 && <span className="absolute left-[13px] top-6 h-[calc(100%+0.25rem)] w-px bg-white/10" />}
          <span
            className={`relative z-10 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 ${
              step.done
                ? "border-emerald-400 bg-emerald-400/20 text-emerald-300"
                : "border-white/15 bg-[var(--card)] text-white/25"
            }`}
          >
            {step.done ? <Check className="h-3 w-3" /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
          </span>
          <span className="min-w-0 flex-1 truncate text-sm text-white/80">{step.label}</span>
          <span className={`flex-shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${TONES[step.tone]}`}>{step.status}</span>
          <span className="hidden w-32 flex-shrink-0 text-right text-xs text-white/35 sm:block">{step.date}</span>
        </li>
      ))}
    </ol>
  );
}
