"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { resolveLucideIcon } from "@/lib/lucide-icon";
import { ScoreRing } from "@/components/page-blocks/blocks/ScoreRing";
import type { BadgeTone } from "@/components/page-blocks/blocks/DataTable";

export interface KanbanColumn {
  id: string;
  name: string;
  color: string;
}

/**
 * Tarjeta del tablero.
 *
 * Solo `id`, `columnId` y `title` son obligatorios: el resto son piezas que se
 * pintan si vienen. Así el mismo tablero sirve para una oportunidad del CRM
 * —con su anillo de puntaje y su importe— y para una tarea de Operaciones
 * —con prioridad, responsable y barra de avance—, sin duplicar la lógica de
 * arrastre, que es la parte delicada.
 */
export interface KanbanCard {
  id: string;
  columnId: string;
  title: string;
  /** Momento o vencimiento: "Hoy", "hace 2 horas", "21 may". */
  timeLabel?: string;
  /** Se pinta en ámbar cuando la fecha ya pasó. */
  overdue?: boolean;
  /** Etiqueta principal: interés, proceso… */
  tag?: string;
  tagTone?: BadgeTone;

  // Origen del registro (CRM)
  sourceChannel?: string;
  sourceDetail?: string;
  sourceIcon?: string;
  headline?: string;

  // Valor comercial (CRM)
  score?: number;
  value?: number;
  valueLabel?: string;
  nextAction?: string;

  // Trabajo en curso (Operaciones)
  /** Cliente o cuenta a la que pertenece la tarjeta. */
  subtitle?: string;
  /** Persona responsable; se muestra con su avatar de iniciales. */
  owner?: string;
  priority?: string;
  priorityTone?: BadgeTone;
  /** 0-100. */
  progress?: number;
  /** Pie de la barra: "Paso 6 de 10", "Subtarea 3 de 5". */
  progressLabel?: string;
  /** Motivo por el que la tarjeta está detenida: "Cliente", "Documentos". */
  waitingOn?: string;
  /** Nota bajo el título en las tarjetas ya cerradas. */
  footnote?: string;
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

const money = (n: number) => `$${n.toLocaleString("es")}`;

const TONES: Record<BadgeTone, string> = {
  gold: "bg-[var(--allpa-gold-400)]/12 text-[var(--allpa-gold-300)]",
  emerald: "bg-emerald-400/12 text-emerald-300",
  amber: "bg-amber-400/12 text-amber-300",
  blue: "bg-blue-400/12 text-blue-300",
  violet: "bg-violet-400/12 text-violet-300",
  rose: "bg-rose-400/12 text-rose-300",
  neutral: "bg-white/8 text-white/60",
};

/**
 * Tablero por etapas con tarjetas arrastrables.
 *
 * Usa la API de arrastre nativa del navegador en vez de una librería: basta
 * para mover una tarjeta entre columnas y evita sumar peso al bundle. El
 * cambio de etapa se comunica al padre, que lo persiste.
 */
export function KanbanBoard({
  columns,
  cards,
  onMove,
  onAddCard,
}: {
  columns: KanbanColumn[];
  cards: KanbanCard[];
  onMove: (cardId: string, toColumnId: string) => void;
  onAddCard?: (columnId: string) => void;
}) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overColumn, setOverColumn] = useState<string | null>(null);

  // El id viaja en el propio evento de arrastre, no en el estado de React:
  // así el soltar funciona aunque no haya habido un re-render entremedias.
  const drop = (e: React.DragEvent, columnId: string) => {
    const cardId = e.dataTransfer.getData("text/plain") || draggingId;
    if (cardId) {
      const card = cards.find((c) => c.id === cardId);
      if (card && card.columnId !== columnId) onMove(cardId, columnId);
    }
    setDraggingId(null);
    setOverColumn(null);
  };

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex min-w-max gap-3">
        {columns.map((column) => {
          const columnCards = cards.filter((c) => c.columnId === column.id);
          const total = columnCards.reduce((sum, c) => sum + (c.value ?? 0), 0);
          const isOver = overColumn === column.id;

          return (
            <section
              key={column.id}
              onDragOver={(e) => {
                e.preventDefault();
                setOverColumn(column.id);
              }}
              onDragLeave={() => setOverColumn((c) => (c === column.id ? null : c))}
              onDrop={(e) => drop(e, column.id)}
              className={`flex w-64 flex-shrink-0 flex-col rounded-xl border bg-white/[0.02] transition-colors ${
                isOver ? "border-[var(--allpa-gold-400)]/60 bg-[var(--allpa-gold-400)]/[0.04]" : "border-white/10"
              }`}
            >
              <header className="rounded-t-xl border-b border-white/[0.06] px-3 py-2.5" style={{ borderTop: `2px solid ${column.color}` }}>
                <p className="flex items-center gap-2 text-sm font-semibold text-[#f3ecd9]">
                  <span className="min-w-0 flex-1 truncate">{column.name}</span>
                  <span className="flex-shrink-0 text-xs font-normal text-white/40">{columnCards.length}</span>
                </p>
                {total > 0 && (
                  <p className="mt-0.5 text-[11px] tabular-nums text-white/40">{money(total)}</p>
                )}
              </header>

              <div className="flex-1 space-y-2 p-2">
                {columnCards.map((card) => {
                  const SourceIcon = card.sourceIcon ? resolveLucideIcon(card.sourceIcon) : null;
                  return (
                    <article
                      key={card.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/plain", card.id);
                        e.dataTransfer.effectAllowed = "move";
                        setDraggingId(card.id);
                      }}
                      onDragEnd={() => {
                        setDraggingId(null);
                        setOverColumn(null);
                      }}
                      className={`cursor-grab rounded-lg border border-white/10 bg-white/[0.04] p-2.5 transition-opacity active:cursor-grabbing ${
                        draggingId === card.id ? "opacity-40" : ""
                      }`}
                    >
                      <div className="mb-2 flex items-center gap-2">
                        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#f5da93] to-[#a9760f] text-[9px] font-bold text-[#241a05]">
                          {initialsOf(card.title)}
                        </span>
                        <span className="min-w-0 truncate text-sm font-medium text-white/90">{card.title}</span>
                      </div>

                      {SourceIcon && (
                        <p className="mb-1.5 flex items-center gap-1.5 text-[11px] text-white/40">
                          <SourceIcon className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">
                            {[card.sourceChannel, card.sourceDetail].filter(Boolean).join(" · ")}
                          </span>
                        </p>
                      )}

                      {card.subtitle && <p className="mb-1.5 truncate text-[11px] text-white/45">{card.subtitle}</p>}

                      {card.headline && <p className="mb-2 line-clamp-2 text-xs leading-snug text-white/60">{card.headline}</p>}

                      {(card.tag || card.priority) && (
                        <div className="mb-2 flex flex-wrap items-center gap-1.5">
                          {card.tag && (
                            <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] ${TONES[card.tagTone ?? "gold"]}`}>
                              {card.tag}
                            </span>
                          )}
                          {card.priority && (
                            <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${TONES[card.priorityTone ?? "neutral"]}`}>
                              {card.priority}
                            </span>
                          )}
                        </div>
                      )}

                      {card.waitingOn && (
                        <p className="mb-2 inline-block rounded-md bg-amber-400/10 px-2 py-0.5 text-[10px] text-amber-300">
                          En espera: {card.waitingOn}
                        </p>
                      )}

                      {card.owner && (
                        <p className="mb-2 flex items-center gap-1.5 text-[11px] text-white/55">
                          <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-white/10 text-[9px] font-bold text-white/70">
                            {initialsOf(card.owner)}
                          </span>
                          <span className="truncate">{card.owner}</span>
                        </p>
                      )}

                      {card.progress !== undefined && (
                        <div className="mb-2">
                          <div className="h-1 w-full overflow-hidden rounded-full bg-white/8">
                            <div className="h-full rounded-full bg-[var(--allpa-gold-400)]" style={{ width: `${card.progress}%` }} />
                          </div>
                          <p className="mt-1 flex items-center justify-between text-[10px] text-white/35">
                            <span className="tabular-nums">{card.progress}%</span>
                            {card.progressLabel && <span className="truncate">{card.progressLabel}</span>}
                          </p>
                        </div>
                      )}

                      {card.score !== undefined && (
                        <div className="flex items-center gap-2 border-t border-white/[0.06] pt-2">
                          <ScoreRing value={card.score} size={28} />
                          {card.value !== undefined && (
                            <span className="min-w-0">
                              <span className="block text-[10px] text-white/35">{card.valueLabel}</span>
                              <span className="block truncate text-xs font-medium tabular-nums text-white/85">{money(card.value)}</span>
                            </span>
                          )}
                        </div>
                      )}

                      {card.nextAction && (
                        <p className="mt-2 text-[10px] text-white/40">
                          Próxima acción: <span className="text-white/60">{card.nextAction}</span>
                        </p>
                      )}

                      {card.footnote && <p className="mt-1.5 text-[10px] text-white/35">{card.footnote}</p>}

                      {card.timeLabel && (
                        <p className={`mt-1.5 text-[10px] ${card.overdue ? "font-medium text-amber-400" : "text-white/30"}`}>
                          {card.timeLabel}
                        </p>
                      )}
                    </article>
                  );
                })}

                <button
                  type="button"
                  onClick={() => onAddCard?.(column.id)}
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-white/12 py-2 text-[11px] text-white/35 transition-colors hover:border-[var(--allpa-gold-400)]/50 hover:text-[var(--allpa-gold-300)]"
                >
                  <Plus className="h-3 w-3" />
                  Agregar prospecto
                </button>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
