"use client";

import { useMemo } from "react";
import { CheckCircle2 } from "lucide-react";

export interface FamilyMember {
  key: string;
  label: string;
  /** "Hijo", "Esposa", "Nieta"… */
  role: string;
  badge: string;
  birthYear: number | null;
  deathYear: number | null;
  generation: number;
  beneficiary: boolean;
  color: string;
}

export interface FamilyEdge {
  from: string;
  to: string;
  /** Une a dos personas de la misma generación en vez de padre a hijo. */
  spouse: boolean;
}

const CARD_W = 196;
const CARD_H = 96;
const GAP_X = 26;
const GAP_Y = 60;

const GENERATION_LABEL: Record<number, string> = {
  1: "Abuelos",
  2: "Padres",
  3: "Hijos",
  4: "Nietos",
};

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/**
 * Árbol familiar por generaciones.
 *
 * A diferencia del organigrama, aquí la fila de cada persona ya viene dada por
 * su generación, así que no hace falta un algoritmo de reparto: basta centrar
 * cada fila y unir padres con hijos.
 */
export function FamilyTree({
  members,
  edges,
  selectedKey,
  onSelect,
  /** Limita las generaciones visibles: el selector "4 / 3 / 2" de la cabecera. */
  maxGenerations,
}: {
  members: FamilyMember[];
  edges: FamilyEdge[];
  selectedKey?: string | null;
  onSelect?: (key: string) => void;
  maxGenerations?: number;
}) {
  const visible = useMemo(
    () => (maxGenerations ? members.filter((m) => m.generation <= maxGenerations) : members),
    [members, maxGenerations]
  );

  const layout = useMemo(() => {
    const generations = [...new Set(visible.map((m) => m.generation))].sort((a, b) => a - b);
    const rows = generations.map((g) => visible.filter((m) => m.generation === g));
    const widest = Math.max(1, ...rows.map((r) => r.length * CARD_W + (r.length - 1) * GAP_X));

    const positions = new Map<string, { x: number; y: number }>();
    rows.forEach((row, rowIndex) => {
      const rowWidth = row.length * CARD_W + (row.length - 1) * GAP_X;
      const startX = (widest - rowWidth) / 2;
      row.forEach((member, i) => {
        positions.set(member.key, { x: startX + i * (CARD_W + GAP_X), y: rowIndex * (CARD_H + GAP_Y) });
      });
    });

    return {
      positions,
      generations,
      width: widest,
      height: Math.max(1, rows.length * CARD_H + (rows.length - 1) * GAP_Y),
    };
  }, [visible]);

  if (visible.length === 0) {
    return <p className="py-16 text-center text-sm text-white/35">Todavía no hay miembros en este árbol.</p>;
  }

  const visibleKeys = new Set(visible.map((m) => m.key));

  return (
    <div className="overflow-auto rounded-xl border border-white/10 bg-[#0b1020] p-4">
      <div className="flex gap-6">
        {/* Rótulo de cada generación, alineado con la fila que nombra. */}
        <div className="relative hidden flex-shrink-0 lg:block" style={{ width: 110, height: layout.height }}>
          {layout.generations.map((g, i) => (
            <span key={g} className="absolute left-0" style={{ top: i * (CARD_H + GAP_Y) + 14 }}>
              <span className="block text-xs font-medium text-white/60">Generación {g}</span>
              <span className="block text-[11px] text-white/30">{GENERATION_LABEL[g] ?? ""}</span>
            </span>
          ))}
        </div>

        <div className="relative flex-shrink-0" style={{ width: layout.width, height: layout.height }}>
          <svg width={layout.width} height={layout.height} className="absolute inset-0">
            {edges.map((edge) => {
              if (!visibleKeys.has(edge.from) || !visibleKeys.has(edge.to)) return null;
              const from = layout.positions.get(edge.from);
              const to = layout.positions.get(edge.to);
              if (!from || !to) return null;

              if (edge.spouse) {
                // Cónyuges: línea recta entre las dos tarjetas de la misma fila.
                const [left, right] = from.x <= to.x ? [from, to] : [to, from];
                return (
                  <line
                    key={`${edge.from}-${edge.to}`}
                    x1={left.x + CARD_W}
                    y1={left.y + CARD_H / 2}
                    x2={right.x}
                    y2={right.y + CARD_H / 2}
                    stroke="rgba(167,139,250,0.45)"
                    strokeWidth={1.5}
                  />
                );
              }

              const x1 = from.x + CARD_W / 2;
              const y1 = from.y + CARD_H;
              const x2 = to.x + CARD_W / 2;
              const y2 = to.y;
              const midY = y1 + (y2 - y1) / 2;

              return (
                <path
                  key={`${edge.from}-${edge.to}`}
                  d={`M${x1},${y1} V${midY} H${x2} V${y2}`}
                  fill="none"
                  stroke="rgba(255,255,255,0.16)"
                  strokeWidth={1.25}
                />
              );
            })}
          </svg>

          {visible.map((m) => {
            const pos = layout.positions.get(m.key);
            if (!pos) return null;
            const isSelected = selectedKey === m.key;
            const deceased = m.deathYear !== null;

            return (
              <button
                key={m.key}
                type="button"
                onClick={() => onSelect?.(m.key)}
                className={`absolute flex flex-col justify-center gap-1.5 rounded-xl border bg-[#111829] px-3 text-left transition-colors hover:bg-white/[0.06] ${
                  isSelected ? "border-[var(--allpa-gold-400)]/70" : "border-white/12"
                }`}
                style={{ left: pos.x, top: pos.y, width: CARD_W, height: CARD_H }}
              >
                <span className="flex items-center gap-2.5">
                  <span
                    className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
                    style={{ background: `${m.color}22`, color: m.color, opacity: deceased ? 0.55 : 1 }}
                  >
                    {initialsOf(m.label)}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-semibold text-[#f3ecd9]">{m.label}</span>
                    <span className="block truncate text-[11px] text-white/35">
                      {deceased ? `${m.birthYear} - ${m.deathYear}` : (m.birthYear ?? "")}
                    </span>
                  </span>
                </span>

                <span className="flex items-center gap-1.5">
                  <span
                    className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium"
                    style={{ background: `${m.color}1f`, color: m.color }}
                  >
                    {m.badge || m.role}
                  </span>
                  {m.beneficiary && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" />
                      Beneficiario
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
