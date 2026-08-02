"use client";

import { useState } from "react";
import { MessageSquare, Plus, MoreHorizontal, Pencil, Send, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { StatusBadge } from "@/components/page-blocks/StatusBadge";
import type { SectionStatus } from "@/lib/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

/**
 * Tabla de checklist controlada: el estado vive en AccordionSection para que
 * el contador del encabezado (hechas/total) siempre refleje altas, bajas y
 * cambios de estado de las tareas.
 */
export function ChecklistTable({
  items,
  onItemsChange,
}: {
  items: DemoChecklistItem[];
  onItemsChange: (updater: (list: DemoChecklistItem[]) => DemoChecklistItem[]) => void;
}) {
  const [newTask, setNewTask] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftText, setDraftText] = useState("");

  const toggleDone = (id: string) => {
    onItemsChange((list) =>
      list.map((it) => (it.id === id ? { ...it, status: it.status === "completado" ? "pendiente" : "completado" } : it))
    );
  };

  const addTask = () => {
    if (!newTask.trim()) return;
    onItemsChange((list) => [
      ...list,
      { id: `${Date.now()}`, text: newTask.trim(), status: "pendiente", assignee: "Sin asignar", dueDate: "—", notes: [] },
    ]);
    setNewTask("");
  };

  const startEdit = (item: DemoChecklistItem) => {
    setEditingId(item.id);
    setDraftText(item.text);
  };

  const commitEdit = (id: string) => {
    const text = draftText.trim();
    if (text) {
      onItemsChange((list) => list.map((it) => (it.id === id ? { ...it, text } : it)));
    }
    setEditingId(null);
  };

  const deleteTask = (id: string) => {
    onItemsChange((list) => list.filter((it) => it.id !== id));
    if (editingId === id) setEditingId(null);
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
              <td className="py-2.5 pr-3">
                {editingId === item.id ? (
                  <input
                    autoFocus
                    value={draftText}
                    onChange={(e) => setDraftText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commitEdit(item.id);
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    onBlur={() => commitEdit(item.id)}
                    className="h-7 w-full rounded-md border border-input bg-transparent px-2 text-sm text-white/85 outline-none focus:border-[#eec469]"
                  />
                ) : (
                  <span className={item.status === "completado" ? "text-white/40 line-through" : "text-white/85"}>{item.text}</span>
                )}
              </td>
              <td className="py-2.5 pr-3">
                <StatusBadge status={item.status} interactive={false} />
              </td>
              <td className="py-2.5 pr-3">
                <NotesPopover item={item} />
              </td>
              <td className="py-2.5 pr-3 text-white/65">{item.assignee}</td>
              <td className="py-2.5 pr-3 text-white/50">{item.dueDate}</td>
              <td className="py-2.5">
                <DropdownMenu>
                  <DropdownMenuTrigger className="text-white/30 transition-colors hover:text-white/60" aria-label="Opciones de la tarea">
                    <MoreHorizontal className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-36">
                    <DropdownMenuItem onClick={() => startEdit(item)}>
                      <Pencil className="mr-2 h-3.5 w-3.5" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => deleteTask(item.id)} className="text-red-500 focus:text-red-500">
                      <Trash2 className="mr-2 h-3.5 w-3.5" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
