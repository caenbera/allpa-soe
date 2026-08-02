import { Check, Circle, ExternalLink } from "lucide-react";
import { resolveLucideIcon } from "@/lib/lucide-icon";
import { Progress } from "@/components/ui/progress";

export interface AssetLine {
  label: string;
  done: boolean;
}

export interface AssetCard {
  id: string;
  index: number;
  title: string;
  icon: string;
  color: string;
  progress: number;
  lines: AssetLine[];
  footerNote?: string;
  footerAction?: string;
  status?: string;
}

/** Rejilla de tarjetas de activo con avance y mini-checklist. */
export function AssetProgressGrid({ assets }: { assets: AssetCard[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {assets.map((asset) => {
        const Icon = resolveLucideIcon(asset.icon);
        return (
          <div key={asset.id} className="flex flex-col rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <div className="mb-2.5 flex items-center gap-2">
              <span
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
                style={{ background: `${asset.color}20`, color: asset.color }}
              >
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-white/85">
                {asset.index}. {asset.title}
              </span>
              <span className="flex-shrink-0 text-xs font-semibold tabular-nums text-white/70">{asset.progress}%</span>
            </div>

            <Progress value={asset.progress} className="mb-3" />

            <ul className="mb-3 space-y-1.5">
              {asset.lines.map((line) => (
                <li key={line.label} className="flex items-center gap-1.5 text-xs">
                  {line.done ? (
                    <Check className="h-3 w-3 flex-shrink-0 text-emerald-400" />
                  ) : (
                    <Circle className="h-3 w-3 flex-shrink-0 text-white/20" />
                  )}
                  <span className={line.done ? "text-white/65" : "text-white/35"}>{line.label}</span>
                </li>
              ))}
            </ul>

            <div className="mt-auto flex items-center justify-between gap-2 border-t border-white/[0.06] pt-2.5">
              <span className="min-w-0 truncate text-[11px] text-white/35">{asset.footerNote ?? asset.status ?? ""}</span>
              {asset.footerAction && (
                <button
                  type="button"
                  className="flex flex-shrink-0 items-center gap-1 text-[11px] text-[var(--allpa-gold-300)] transition-colors hover:underline"
                >
                  {asset.footerAction}
                  <ExternalLink className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
