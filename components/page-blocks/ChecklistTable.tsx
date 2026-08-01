"use client";

import { useState } from "react";
import { MessageSquare, Plus, MoreHorizontal, Send } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { StatusBadge } from "@/components/page-blocks/StatusBadge";
import type { SectionStatus } from "@/lib/types";

export interface DemoNote {
  id: string;
  author: string;
  text: string;
  time: string;
}

export interface DemoChecklistItem {
  id: string;
  text: string;
  status: SectionStatus;
  assignee: string;
  dueDate: string;
  notes: DemoNote[];
}

function NotesPopover({ item }: { item: DemoChecklistItem }) {
  const [draft, setDraft] = useState("");
  const [notes, setNotes] = useState(item.notes);

  const send = () => {
    if (!draft.trim()) return;
    setNotes((n) => [...n, { id: `${Date.now()}`, author: "Tú", text: draft.trim(), time: "ahora" }]);
    setDraft("");
  };

  return (
    <Popover>
      <PopoverTrigger
        className={`inline-flex items-center gap-1 text-xs ${notes.length ? "text-[#eec469]" : "text-white/35"} hover:text-[#eec469]`}
      >
        <MessageSquare className="h-3.5 w-3.5" />
        {notes.length > 0 ? `Ver nota (${notes.length})` : "Agregar nota"}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 p-0">
        <div className="border-b border-border px-3 py-2 text-sm font-semibold">Nota — {item.text}</div>
        <div className="max-h-56 space-y-3 overflow-y-auto px-3 py-2.5">
          {notes.length === 0 && <p className="text-xs text-muted-foreground">Sin notas todavía.</p>}
          {notes.map((n) => (
            <div key={n.id} className="text-sm">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{n.author}</span>
                <span className="text-[11px] text-muted-foreground">{n.time}</span>
              </div>
              <p className="mt-0.5 text-muted-foreground">{n.text}</p>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 border-t border-border p-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Escribe un comentario..."
            className="h-8 flex-1 rounded-md border border-input bg-transparent px-2 text-sm outline-none focus:border-[#eec469]"
          />
          <button type="button" onClick={send} className="flex h-8 w-8 items-center justify-center rounded-md text-[#eec469] hover:bg-[#eec469]/10">
            <Send className="h-4 w-4" />
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function ChecklistTable({ items: initialItems }: { items: DemoChecklistItem[] }) {
  const [items, setItems] = useState(initialItems);
  const [newTask, setNewTask] = useState("");

  const toggleDone = (id: string) => {
    setItems((list) =>
      list.map((it) => (it.id === id ? { ...it, status: it.status === "completado" ? "pendiente" : "completado" } : it))
    );
  };

  const addTask = () => {
    if (!newTask.trim()) return;
    setItems((list) => [
      ...list,
      { id: `${Date.now()}`, text: newTask.trim(), status: "pendiente", assignee: "Sin asignar", dueDate: "—", notes: [] },
    ]);
    setNewTask("");
  };

  return (
    <div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10 text-left text-[11px] uppercase tracking-wide text-white/35">
            <th className="w-8 py-2" />
            <th className="py-2 pr-3 font-medium">Tarea</th>
            <th className="w-36 py-2 pr-3 font-medium">Estado</th>
            <th className="w-28 py-2 pr-3 font-medium">Nota</th>
            <th className="w-36 py-2 pr-3 font-medium">Responsable</th>
            <th className="w-28 py-2 pr-3 font-medium">Fecha límite</th>
            <th className="w-8 py-2" />
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b border-white/[0.06] last:border-0">
              <td className="py-2.5">
                <Checkbox checked={item.status === "completado"} onCheckedChange={() => toggleDone(item.id)} />
              </td>
              <td className={`py-2.5 pr-3 ${item.status === "completado" ? "text-white/40 line-through" : "text-white/85"}`}>{item.text}</td>
              <td className="py-2.5 pr-3">
                <StatusBadge status={item.status} interactive={false} />
              </td>
              <td className="py-2.5 pr-3">
                <NotesPopover item={item} />
              </td>
              <td className="py-2.5 pr-3 text-white/65">{item.assignee}</td>
              <td className="py-2.5 pr-3 text-white/50">{item.dueDate}</td>
              <td className="py-2.5">
                <button type="button" className="text-white/30 hover:text-white/60">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-2 flex items-center gap-2">
        <Plus className="h-3.5 w-3.5 text-white/35" />
        <input
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTask()}
          placeholder="Agregar tarea"
          className="h-7 flex-1 rounded-md bg-transparent text-sm text-white/70 outline-none placeholder:text-white/30"
        />
      </div>
    </div>
  );
}
