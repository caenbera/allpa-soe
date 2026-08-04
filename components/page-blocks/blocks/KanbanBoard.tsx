"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { resolveLucideIcon } from "@/lib/lucide-icon";
import { ScoreRing } from "@/components/page-blocks/blocks/ScoreRing";

export interface KanbanColumn {
  id: string;
  name: string;
  color: string;
}

export interface KanbanCard {
  id: string;
  columnId: string;
  title: string;
  sourceChannel: string;
  sourceDetail: string;
  sourceIcon: string;
  headline: string;
  tag: string;
  score: number;
  value: number;
  valueLabel: string;
  timeLabel: string;
  nextAction?: string;
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
          const total = columnCards.reduce((sum, c) => sum + c.value, 0);
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
                <p className="truncate text-sm font-semibold text-[#f3ecd9]">{column.name}</p>
                <p className="mt-0.5 flex items-center gap-2 text-[11px] text-white/40">
                  <span>{columnCards.length} leads</span>
                  <span className="tabular-nums">{money(total)}</span>
                </p>
              </header>

              <div className="flex-1 space-y-2 p-2">
                {columnCards.map((card) => {
                  const SourceIcon = resolveLucideIcon(card.sourceIcon);
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

                      <p className="mb-1.5 flex items-center gap-1.5 text-[11px] text-white/40">
                        <SourceIcon className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">
                          {card.sourceChannel} · {card.sourceDetail}
                        </span>
                      </p>

                      <p className="mb-2 line-clamp-2 text-xs leading-snug text-white/60">{card.headline}</p>

                      {card.tag && (
                        <span className="mb-2 inline-block rounded-full bg-[var(--allpa-gold-400)]/12 px-2 py-0.5 text-[10px] text-[var(--allpa-gold-300)]">
                          {card.tag}
                        </span>
                      )}

                      <div className="flex items-center gap-2 border-t border-white/[0.06] pt-2">
                        <ScoreRing value={card.score} size={28} />
                        <span className="min-w-0">
                          <span className="block text-[10px] text-white/35">{card.valueLabel}</span>
                          <span className="block truncate text-xs font-medium tabular-nums text-white/85">{money(card.value)}</span>
                        </span>
                      </div>

                      {card.nextAction && (
                        <p className="mt-2 text-[10px] text-white/40">
                          Próxima acción: <span className="text-white/60">{card.nextAction}</span>
                        </p>
                      )}

                      <p className="mt-1.5 text-[10px] text-white/30">{card.timeLabel}</p>
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
