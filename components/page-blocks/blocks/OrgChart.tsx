"use client";

import { useMemo, useState } from "react";
import dagre from "@dagrejs/dagre";
import { Minus, Plus } from "lucide-react";
import { resolveLucideIcon } from "@/lib/lucide-icon";

export interface OrgNode {
  key: string;
  label: string;
  sublabel: string;
  /** Valor de la empresa ya formateado, ej. "$180.2M". */
  value: string;
  icon: string;
  color: string;
}

export interface OrgEdge {
  from: string;
  to: string;
  /** Participación en la subsidiaria; se dibuja como etiqueta sobre la arista. */
  ownership: number | null;
}

const NODE_W = 178;
const NODE_H = 76;

/**
 * Organigrama jerárquico de la estructura societaria.
 *
 * El reparto lo calcula `dagre`, que resuelve el problema difícil —repartir
 * los niveles sin que las aristas se crucen—; aquí solo se dibujan las cajas
 * en las posiciones que devuelve, con la participación sobre cada arista.
 */
export function OrgChart({
  nodes,
  edges,
  selectedKey,
  onSelect,
  height = 520,
}: {
  nodes: OrgNode[];
  edges: OrgEdge[];
  selectedKey?: string | null;
  onSelect?: (key: string) => void;
  height?: number;
}) {
  const [zoom, setZoom] = useState(1);

  const layout = useMemo(() => {
    const g = new dagre.graphlib.Graph();
    g.setGraph({ rankdir: "TB", nodesep: 26, ranksep: 62, marginx: 20, marginy: 20 });
    g.setDefaultEdgeLabel(() => ({}));

    const known = new Set(nodes.map((n) => n.key));
    nodes.forEach((n) => g.setNode(n.key, { width: NODE_W, height: NODE_H }));
    edges.filter((e) => known.has(e.from) && known.has(e.to)).forEach((e) => g.setEdge(e.from, e.to));

    dagre.layout(g);

    const positions = new Map<string, { x: number; y: number }>();
    g.nodes().forEach((key) => {
      const { x, y } = g.node(key);
      // dagre da el centro; se guarda la esquina para posicionar la caja.
      positions.set(key, { x: x - NODE_W / 2, y: y - NODE_H / 2 });
    });

    const graph = g.graph();
    return { positions, width: graph.width ?? 800, height: graph.height ?? 600 };
  }, [nodes, edges]);

  if (nodes.length === 0) {
    return <p className="py-16 text-center text-sm text-white/35">Todavía no hay estructura que mostrar.</p>;
  }

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
          aria-label="Alejar"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/12 text-white/60 transition-colors hover:bg-white/5 hover:text-white/90"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <span className="rounded-lg border border-white/12 px-2.5 py-1 text-xs tabular-nums text-white/50">
          {Math.round(zoom * 100)}%
        </span>
        <button
          type="button"
          onClick={() => setZoom((z) => Math.min(1.6, z + 0.1))}
          aria-label="Acercar"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/12 text-white/60 transition-colors hover:bg-white/5 hover:text-white/90"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="overflow-auto rounded-xl border border-white/10 bg-[#0b1020] p-2" style={{ height }}>
        <div
          className="relative"
          style={{
            width: layout.width * zoom,
            height: layout.height * zoom,
            transform: `scale(${zoom})`,
            transformOrigin: "top left",
          }}
        >
          <svg width={layout.width} height={layout.height} className="absolute inset-0">
            {edges.map((edge) => {
              const from = layout.positions.get(edge.from);
              const to = layout.positions.get(edge.to);
              if (!from || !to) return null;

              const x1 = from.x + NODE_W / 2;
              const y1 = from.y + NODE_H;
              const x2 = to.x + NODE_W / 2;
              const y2 = to.y;
              const midY = y1 + (y2 - y1) / 2;

              return (
                <g key={`${edge.from}-${edge.to}`}>
                  <path
                    d={`M${x1},${y1} V${midY} H${x2} V${y2}`}
                    fill="none"
                    stroke="rgba(255,255,255,0.16)"
                    strokeWidth={1.25}
                  />
                  {edge.ownership !== null && (
                    <>
                      <rect x={x2 - 19} y={midY + (y2 - midY) / 2 - 9} width={38} height={18} rx={9} fill="#0e1425" stroke="rgba(34,197,94,0.35)" />
                      <text
                        x={x2}
                        y={midY + (y2 - midY) / 2 + 4}
                        textAnchor="middle"
                        fontSize={10}
                        fontWeight={600}
                        fill="#4ade80"
                      >
                        {edge.ownership}%
                      </text>
                    </>
                  )}
                </g>
              );
            })}
          </svg>

          {nodes.map((n) => {
            const pos = layout.positions.get(n.key);
            if (!pos) return null;
            const Icon = resolveLucideIcon(n.icon);
            const isSelected = selectedKey === n.key;

            return (
              <button
                key={n.key}
                type="button"
                onClick={() => onSelect?.(n.key)}
                className={`absolute flex items-center gap-2.5 rounded-xl border bg-[#111829] px-3 text-left transition-colors hover:bg-white/[0.06] ${
                  isSelected ? "border-[var(--allpa-gold-400)]/70" : "border-white/12"
                }`}
                style={{ left: pos.x, top: pos.y, width: NODE_W, height: NODE_H, borderLeft: `3px solid ${n.color}` }}
              >
                <span
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
                  style={{ background: `${n.color}20`, color: n.color }}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-xs font-semibold text-[#f3ecd9]">{n.label}</span>
                  <span className="block truncate text-[10px] text-white/40">{n.sublabel}</span>
                  {n.value && <span className="mt-0.5 block truncate text-[11px] font-medium text-emerald-400">{n.value}</span>}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
