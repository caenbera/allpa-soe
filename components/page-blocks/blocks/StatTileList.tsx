import { resolveLucideIcon } from "@/lib/lucide-icon";

export interface StatTile {
  id: string;
  icon: string;
  color: string;
  value: string;
  label: string;
  delta?: string;
}

/** Tarjetas apiladas para paneles laterales: icono, cifra, etiqueta y variación. */
export function StatTileList({ tiles, columns = 1 }: { tiles: StatTile[]; columns?: 1 | 2 }) {
  return (
    <div className={columns === 2 ? "grid grid-cols-2 gap-2.5" : "space-y-2.5"}>
      {tiles.map((tile) => {
        const Icon = resolveLucideIcon(tile.icon);
        const down = tile.delta?.trim().startsWith("-");
        return (
          <div key={tile.id} className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] p-2.5">
            <span
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg"
              style={{ background: `${tile.color}20`, color: tile.color }}
            >
              <Icon className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <span className="block text-lg font-semibold leading-none text-[#f3ecd9]">{tile.value}</span>
              <span className="mt-1 block truncate text-[11px] text-white/45">{tile.label}</span>
              {tile.delta && (
                <span className={`mt-0.5 block text-[11px] font-medium ${down ? "text-rose-400" : "text-emerald-400"}`}>
                  {down ? "↓" : "↑"} {tile.delta.replace(/^-/, "")}
                </span>
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
}
