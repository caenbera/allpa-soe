import { Flag } from "lucide-react";
import type { SectionPriority } from "@/lib/types";

const PRIORITY_CONFIG: Record<SectionPriority, { label: string; color: string }> = {
  alta: { label: "Alta", color: "#ef4444" },
  media: { label: "Media", color: "#eab308" },
  baja: { label: "Baja", color: "#22c55e" },
};

export function PriorityFlag({ priority }: { priority: SectionPriority }) {
  const cfg = PRIORITY_CONFIG[priority];
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-white/70">
      <Flag className="h-3.5 w-3.5" style={{ color: cfg.color, fill: cfg.color }} />
      {cfg.label}
    </span>
  );
}
