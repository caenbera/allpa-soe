import { MapPin, Mail, Phone, Globe, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface PersonInfo {
  name: string;
  role: string;
  org?: string;
  location?: string;
  email?: string;
  phone?: string;
  website?: string;
  bullets?: string[];
  actionLabel?: string;
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

export function PersonCard({ person }: { person: PersonInfo }) {
  const contacts = [
    person.location && { icon: MapPin, text: person.location },
    person.email && { icon: Mail, text: person.email },
    person.phone && { icon: Phone, text: person.phone },
    person.website && { icon: Globe, text: person.website },
    person.org && { icon: Briefcase, text: person.org },
  ].filter(Boolean) as { icon: typeof MapPin; text: string }[];

  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#f5da93] to-[#a9760f] text-base font-bold text-[#241a05]">
          {initialsOf(person.name)}
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold text-[#f3ecd9]">{person.name}</p>
          <p className="truncate text-sm text-white/50">{person.role}</p>
          {person.org && <p className="truncate text-xs text-white/35">{person.org}</p>}
        </div>
      </div>

      {contacts.length > 0 && (
        <ul className="mt-4 space-y-2">
          {contacts.map((c) => (
            <li key={c.text} className="flex items-center gap-2 text-sm text-white/60">
              <c.icon className="h-3.5 w-3.5 flex-shrink-0 text-white/35" />
              <span className="min-w-0 truncate">{c.text}</span>
            </li>
          ))}
        </ul>
      )}

      {person.bullets && person.bullets.length > 0 && (
        <ul className="mt-4 space-y-1.5">
          {person.bullets.map((b) => (
            <li key={b} className="flex items-start gap-2 text-sm text-white/60">
              <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-[var(--allpa-gold-400)]" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      )}

      {person.actionLabel && (
        <Button variant="outline" className="mt-4 w-full border-white/12 bg-white/[0.03] text-white/75 hover:bg-white/[0.06]">
          {person.actionLabel}
        </Button>
      )}
    </div>
  );
}
