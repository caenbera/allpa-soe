"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { resolveLucideIcon } from "@/lib/lucide-icon";

export interface NoteEntry {
  id: string;
  icon: string;
  title: string;
  text: string;
  meta: string;
}

export function NotesPanel({ notes: initialNotes }: { notes: NoteEntry[] }) {
  const [notes, setNotes] = useState(initialNotes);
  const [draft, setDraft] = useState("");
  const [adding, setAdding] = useState(false);

  const add = () => {
    const text = draft.trim();
    if (!text) {
      setAdding(false);
      return;
    }
    setNotes((list) => [
      ...list,
      { id: `note-${Date.now()}`, icon: "StickyNote", title: "Nota rápida", text, meta: "ahora · Tú" },
    ]);
    setDraft("");
    setAdding(false);
  };

  return (
    <div className="space-y-2.5">
      {notes.map((note) => {
        const Icon = resolveLucideIcon(note.icon);
        return (
          <div key={note.id} className="rounded-xl bg-white/[0.03] p-3">
            <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-[var(--allpa-gold-300)]">
              <Icon className="h-3.5 w-3.5" />
              {note.title}
            </p>
            <p className="text-sm leading-relaxed text-white/65">{note.text}</p>
            <p className="mt-1.5 text-[11px] text-white/30">{note.meta}</p>
          </div>
        );
      })}

      {adding ? (
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
          placeholder="Escribe la nota y pulsa Enter..."
          className="h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm text-white/85 outline-none focus:border-[#eec469]"
        />
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-white/12 py-2 text-xs text-white/40 transition-colors hover:border-[var(--allpa-gold-400)]/50 hover:text-[var(--allpa-gold-300)]"
        >
          <Plus className="h-3.5 w-3.5" />
          Nueva nota rápida
        </button>
      )}
    </div>
  );
}
