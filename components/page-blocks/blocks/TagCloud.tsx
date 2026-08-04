"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { resolveLucideIcon } from "@/lib/lucide-icon";
import type { BadgeTone } from "@/components/page-blocks/blocks/DataTable";

export interface TagChip {
  id: string;
  label: string;
  tone?: BadgeTone;
  icon?: string;
}

const TONES: Record<BadgeTone, string> = {
  gold: "bg-[var(--allpa-gold-400)]/12 text-[var(--allpa-gold-300)]",
  emerald: "bg-emerald-400/12 text-emerald-300",
  amber: "bg-amber-400/12 text-amber-300",
  blue: "bg-blue-400/12 text-blue-300",
  violet: "bg-violet-400/12 text-violet-300",
  rose: "bg-rose-400/12 text-rose-300",
  neutral: "bg-white/8 text-white/65",
};

const CYCLE: BadgeTone[] = ["violet", "blue", "emerald", "amber", "rose"];

/** Chips que se agregan y quitan: etiquetas, intereses, palabras clave. */
export function TagCloud({
  tags: initialTags,
  addLabel = "Agregar etiqueta",
  editable = true,
  onChange,
}: {
  tags: TagChip[];
  addLabel?: string;
  editable?: boolean;
  onChange?: (tags: TagChip[]) => void;
}) {
  const [tags, setTags] = useState(initialTags);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");

  const commit = (next: TagChip[]) => {
    setTags(next);
    onChange?.(next);
  };

  const add = () => {
    const label = draft.trim();
    if (!label) {
      setAdding(false);
      return;
    }
    commit([...tags, { id: `tag-${Date.now()}`, label, tone: CYCLE[tags.length % CYCLE.length] }]);
    setDraft("");
    setAdding(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {tags.map((tag) => {
        const Icon = tag.icon ? resolveLucideIcon(tag.icon) : null;
        return (
          <span
            key={tag.id}
            className={`group/tag inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${TONES[tag.tone ?? "neutral"]}`}
          >
            {Icon && <Icon className="h-3 w-3" />}
            {tag.label}
            {editable && (
              <button
                type="button"
                onClick={() => commit(tags.filter((t) => t.id !== tag.id))}
                aria-label={`Quitar ${tag.label}`}
                className="opacity-0 transition-opacity hover:text-white group-hover/tag:opacity-60"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </span>
        );
      })}

      {editable &&
        (adding ? (
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") add();
              if (e.key === "Escape") {
                setDraft("");
                setAdding(false);
              }
            }}
            onBlur={add}
            placeholder="Nombre…"
            className="h-7 w-28 rounded-full border border-input bg-transparent px-2.5 text-xs text-white/85 outline-none focus:border-[#eec469]"
          />
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-1 rounded-full border border-dashed border-white/15 px-2.5 py-1 text-xs text-white/40 transition-colors hover:border-[var(--allpa-gold-400)]/50 hover:text-[var(--allpa-gold-300)]"
          >
            <Plus className="h-3 w-3" />
            {addLabel}
          </button>
        ))}
    </div>
  );
}
