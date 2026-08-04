import { resolveLucideIcon } from "@/lib/lucide-icon";

export interface Insight {
  id: string;
  icon: string;
  color: string;
  text: string;
}

/** Hallazgos en lenguaje llano bajo los gráficos de analítica. */
export function InsightList({ insights }: { insights: Insight[] }) {
  if (insights.length === 0) {
    return <p className="py-6 text-center text-sm text-white/35">Aún no hay suficientes datos para sacar conclusiones.</p>;
  }

  return (
    <ul className="space-y-3">
      {insights.map((insight) => {
        const Icon = resolveLucideIcon(insight.icon);
        return (
          <li key={insight.id} className="flex items-start gap-2.5">
            <span
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
              style={{ background: `${insight.color}20`, color: insight.color }}
            >
              <Icon className="h-4 w-4" />
            </span>
            <p className="text-sm leading-relaxed text-white/65">{insight.text}</p>
          </li>
        );
      })}
    </ul>
  );
}
