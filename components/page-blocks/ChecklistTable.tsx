"use client";

import { useState } from "react";
import { CalendarDays, MessageSquare, Plus, MoreHorizontal, Pencil, Send, Trash2, UserRound } from "lucide-react";
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
  /** Fecha ISO (YYYY-MM-DD). Se aceptan textos libres de datos antiguos. */
  dueDate: string;
  notes: DemoNote[];
}

const UNASSIGNED = "Sin asignar";

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/** Muestra una fecha ISO en formato corto; cualquier otro texto se deja tal cual. */
function formatDue(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return value || "—";
  const d = new Date(`${value}T00:00:00`);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("es", { day: "2-digit", month: "short" });
}

function NotesPopover({
  item,
  onNotesChange,
}: {
  item: DemoChecklistItem;
  onNotesChange: (notes: DemoNote[]) => void;
}) {
  const [draft, setDraft] = useState("");
  const notes = item.notes;

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    onNotesChange([...notes, { id: `${Date.now()}`, author: "Tú", text, time: "ahora" }]);
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
            <div key={n.id} className="group/note text-sm">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{n.author}</span>
                <span className="text-[11px] text-muted-foreground">{n.time}</span>
                <button
                  type="button"
                  onClick={() => onNotesChange(notes.filter((x) => x.id !== n.id))}
                  aria-label="Eliminar nota"
                  className="ml-auto text-muted-foreground opacity-0 transition-opacity hover:text-red-500 group-hover/note:opacity-100"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
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
          <button
            type="button"
            onClick={send}
            aria-label="Enviar nota"
            className="flex h-8 w-8 items-center justify-center rounded-md text-[#eec469] hover:bg-[#eec469]/10"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function AssigneeCell({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [draft, setDraft] = useState(value);
  const assigned = value && value !== UNASSIGNED;

  return (
    <Popover>
      <PopoverTrigger className="flex items-center gap-1.5 text-left text-sm hover:text-white/95">
        {assigned ? (
          <>
            <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#f5da93] to-[#a9760f] text-[9px] font-bold text-[#241a05]">
              {initialsOf(value)}
            </span>
            <span className="truncate text-white/65">{value}</span>
          </>
        ) : (
          <span className="inline-flex items-center gap-1 text-white/35">
            <UserRound className="h-3.5 w-3.5" />
            Asignar
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-56">
        <p className="mb-2 text-xs font-semibold text-foreground">Responsable</p>
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onChange(draft.trim() || UNASSIGNED);
          }}
          onBlur={() => onChange(draft.trim() || UNASSIGNED)}
          placeholder="Nombre del responsable"
          className="h-9 w-full rounded-md border border-input bg-transparent px-2 text-sm outline-none focus:border-[#eec469]"
        />
        {assigned && (
          <button
            type="button"
            onClick={() => {
              setDraft("");
              onChange(UNASSIGNED);
            }}
            className="mt-2 text-xs text-muted-foreground hover:text-red-500"
          >
            Quitar responsable
          </button>
        )}
      </PopoverContent>
    </Popover>
  );
}

function DueDateCell({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const isoValue = /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : "";

  return (
    <Popover>
      <PopoverTrigger className="flex items-center gap-1.5 text-left text-sm hover:text-white/95">
        {value && value !== "—" ? (
          <span className="text-white/50">{formatDue(value)}</span>
        ) : (
          <span className="inline-flex items-center gap-1 text-white/35">
            <CalendarDays className="h-3.5 w-3.5" />
            Fecha
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-56">
        <p className="mb-2 text-xs font-semibold text-foreground">Fecha límite</p>
        <input
          type="date"
          value={isoValue}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-full rounded-md border border-input bg-transparent px-2 text-sm outline-none focus:border-[#eec469]"
        />
        {value && value !== "—" && (
          <button type="button" onClick={() => onChange("—")} className="mt-2 text-xs text-muted-foreground hover:text-red-500">
            Quitar fecha
          </button>
        )}
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

  const patchItem = (id: string, patch: Partial<DemoChecklistItem>) => {
    onItemsChange((list) => list.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  };

  const toggleDone = (id: string) => {
    onItemsChange((list) =>
      list.map((it) => (it.id === id ? { ...it, status: it.status === "completado" ? "pendiente" : "completado" } : it))
    );
  };

  const addTask = () => {
    const text = newTask.trim();
    if (!text) return;
    onItemsChange((list) => [
      ...list,
      { id: `${Date.now()}`, text, status: "pendiente", assignee: UNASSIGNED, dueDate: "—", notes: [] },
    ]);
    setNewTask("");
  };

  const startEdit = (item: DemoChecklistItem) => {
    setEditingId(item.id);
    setDraftText(item.text);
  };

  const commitEdit = (id: string) => {
    const text = draftText.trim();
    if (text) patchItem(id, { text });
    setEditingId(null);
  };

  const deleteTask = (id: string) => {
    onItemsChange((list) => list.filter((it) => it.id !== id));
    if (editingId === id) setEditingId(null);
  };

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] text-sm">
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
                    <button
                      type="button"
                      onClick={() => startEdit(item)}
                      className={`text-left ${item.status === "completado" ? "text-white/40 line-through" : "text-white/85"}`}
                    >
                      {item.text}
                    </button>
                  )}
                </td>
                <td className="py-2.5 pr-3">
                  <StatusBadge status={item.status} onChange={(status) => patchItem(item.id, { status })} />
                </td>
                <td className="py-2.5 pr-3">
                  <NotesPopover item={item} onNotesChange={(notes) => patchItem(item.id, { notes })} />
                </td>
                <td className="py-2.5 pr-3">
                  <AssigneeCell value={item.assignee} onChange={(assignee) => patchItem(item.id, { assignee })} />
                </td>
                <td className="py-2.5 pr-3">
                  <DueDateCell value={item.dueDate} onChange={(dueDate) => patchItem(item.id, { dueDate })} />
                </td>
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
      </div>

      {/* Mismo estilo punteado que "Agregar nuevo bloque", para que se lea
          como una acción y no como texto suelto. */}
      <div className="mt-3 flex items-center gap-2 rounded-xl border border-dashed border-white/12 px-3 py-2 transition-colors focus-within:border-[var(--allpa-gold-400)]/60 hover:border-white/25">
        <Plus className="h-4 w-4 flex-shrink-0 text-[var(--allpa-gold-300)]" />
        <input
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTask()}
          placeholder="Agregar tarea"
          className="h-7 min-w-0 flex-1 bg-transparent text-sm text-white/85 outline-none placeholder:text-white/45"
        />
        <button
          type="button"
          onClick={addTask}
          disabled={!newTask.trim()}
          className="flex-shrink-0 rounded-lg bg-[var(--allpa-gold-400)]/15 px-2.5 py-1 text-xs font-semibold text-[var(--allpa-gold-300)] transition-colors hover:bg-[var(--allpa-gold-400)]/25 disabled:cursor-not-allowed disabled:bg-white/5 disabled:text-white/25"
        >
          Agregar
        </button>
      </div>
    </div>
  );
}
