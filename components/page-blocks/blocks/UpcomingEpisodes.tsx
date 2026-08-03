import Link from "next/link";

export interface UpcomingEpisode {
  id: string;
  week: number;
  dateRange: string;
  title: string;
  guest: string;
  guestLabel: string;
  href: string;
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

/** Las próximas semanas del plan, para saltar a ellas desde el panel. */
export function UpcomingEpisodes({ episodes }: { episodes: UpcomingEpisode[] }) {
  if (episodes.length === 0) {
    return <p className="py-4 text-center text-sm text-white/35">No hay episodios programados.</p>;
  }

  return (
    <ul className="space-y-3">
      {episodes.map((ep) => (
        <li key={ep.id}>
          <Link href={ep.href} className="flex items-start gap-2.5 rounded-lg p-1 transition-colors hover:bg-white/5">
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#f5da93] to-[#a9760f] text-[11px] font-bold text-[#241a05]">
              {initialsOf(ep.guest)}
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-baseline justify-between gap-2">
                <span className="text-xs font-semibold text-white/80">Semana {ep.week}</span>
                <span className="flex-shrink-0 text-[10px] text-white/35">{ep.dateRange}</span>
              </span>
              <span className="mt-0.5 line-clamp-2 block text-xs leading-snug text-white/60">{ep.title}</span>
              <span className="mt-0.5 block truncate text-[10px] text-white/35">
                {ep.guestLabel}: {ep.guest}
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
