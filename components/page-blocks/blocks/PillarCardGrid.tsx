import { resolveLucideIcon } from "@/lib/lucide-icon";
import { Progress } from "@/components/ui/progress";

export interface PillarCardData {
  id: string;
  name: string;
  icon: string;
  color: string;
  topics: string[];
  episodes: number;
  share: number;
}

/** Los pilares estratégicos con sus temas, episodios y peso dentro del plan. */
export function PillarCardGrid({ pillars }: { pillars: PillarCardData[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
      {pillars.map((p) => {
        const Icon = resolveLucideIcon(p.icon);
        return (
          <div key={p.id} className="flex flex-col rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <p className="mb-2.5 flex items-center gap-2">
              <span
                className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg"
                style={{ background: `${p.color}20`, color: p.color }}
              >
                <Icon className="h-3.5 w-3.5" />
              </span>
              <span className="min-w-0 truncate text-sm font-semibold text-[#f3ecd9]">{p.name}</span>
            </p>

            <ul className="mb-3 space-y-1">
              {p.topics.map((topic) => (
                <li key={topic} className="flex items-start gap-1.5 text-xs text-white/60">
                  <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full" style={{ background: p.color }} />
                  <span className="min-w-0">{topic}</span>
                </li>
              ))}
              {p.topics.length === 0 && <li className="text-xs text-white/30">Sin temas definidos.</li>}
            </ul>

            <div className="mt-auto">
              <div className="mb-1.5 flex items-baseline justify-between gap-2">
                <span className="text-[11px] text-white/45">{p.episodes} episodios</span>
                <span className="text-[11px] tabular-nums text-white/60">{p.share}%</span>
              </div>
              <Progress value={p.share} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
