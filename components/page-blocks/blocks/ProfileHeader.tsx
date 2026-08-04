"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { resolveLucideIcon } from "@/lib/lucide-icon";
import { ScoreRing } from "@/components/page-blocks/blocks/ScoreRing";
import type { BadgeTone } from "@/components/page-blocks/blocks/DataTable";

const TONES: Record<BadgeTone, string> = {
  gold: "bg-[var(--allpa-gold-400)]/12 text-[var(--allpa-gold-300)]",
  emerald: "bg-emerald-400/12 text-emerald-300",
  amber: "bg-amber-400/12 text-amber-300",
  blue: "bg-blue-400/12 text-blue-300",
  violet: "bg-violet-400/12 text-violet-300",
  rose: "bg-rose-400/12 text-rose-300",
  neutral: "bg-white/8 text-white/65",
};

export interface ProfileField {
  icon: string;
  value: string;
}

export interface ProfileColumn {
  id: string;
  rows: { label: string; value: string; icon?: string; person?: boolean }[];
}

export interface ProfileHeaderData {
  name: string;
  avatarText?: string;
  chips: { label: string; tone: BadgeTone }[];
  score?: number;
  fields: ProfileField[];
  columns: ProfileColumn[];
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

/** Encabezado rico de una ficha: avatar grande, estado, datos y columnas de contexto. */
export function ProfileHeader({ data }: { data: ProfileHeaderData }) {
  const [starred, setStarred] = useState(false);

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <div className="flex min-w-0 flex-1 gap-4">
        <span className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f5da93] to-[#a9760f] text-2xl font-bold text-[#241a05]">
          {data.avatarText ?? initialsOf(data.name)}
        </span>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-serif text-2xl font-semibold text-[#f3ecd9]">{data.name}</h2>
            <button type="button" onClick={() => setStarred((s) => !s)} aria-label="Favorito">
              <Star className={`h-4 w-4 ${starred ? "fill-[var(--allpa-gold-400)] text-[var(--allpa-gold-400)]" : "text-white/25"}`} />
            </button>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {data.chips.map((chip) => (
              <span key={chip.label} className={`rounded-full px-2.5 py-1 text-xs font-medium ${TONES[chip.tone]}`}>
                {chip.label}
              </span>
            ))}
            {data.score != null && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/8 px-2 py-1 text-xs text-white/65">
                Score
                <ScoreRing value={data.score} size={26} />
              </span>
            )}
          </div>

          <ul className="mt-3 space-y-1.5">
            {data.fields.map((field) => {
              const Icon = resolveLucideIcon(field.icon);
              return (
                <li key={field.value} className="flex items-center gap-2 text-sm text-white/65">
                  <Icon className="h-3.5 w-3.5 flex-shrink-0 text-white/35" />
                  <span className="min-w-0 truncate">{field.value}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="grid flex-shrink-0 grid-cols-1 gap-6 border-white/[0.06] sm:grid-cols-2 lg:border-l lg:pl-6 xl:grid-cols-3">
        {data.columns.map((col) => (
          <dl key={col.id} className="space-y-2.5 text-sm">
            {col.rows.map((row) => {
              const RowIcon = row.icon ? resolveLucideIcon(row.icon) : null;
              return (
                <div key={row.label}>
                  <dt className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-white/35">
                    {RowIcon && <RowIcon className="h-3 w-3" />}
                    {row.label}
                  </dt>
                  <dd className="mt-0.5 flex items-center gap-1.5 text-white/85">
                    {row.person && (
                      <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#f5da93] to-[#a9760f] text-[9px] font-bold text-[#241a05]">
                        {initialsOf(row.value)}
                      </span>
                    )}
                    <span className="truncate">{row.value}</span>
                  </dd>
                </div>
              );
            })}
          </dl>
        ))}
      </div>
    </div>
  );
}
