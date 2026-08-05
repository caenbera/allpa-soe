"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  type Simulation,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
} from "d3-force";
import { Crosshair, Maximize2, Minus, Plus, Search } from "lucide-react";
import { resolveLucideIcon } from "@/lib/lucide-icon";

export interface GraphNode {
  key: string;
  type: string;
  label: string;
  sublabel: string;
  badge: string;
  icon: string;
  root: boolean;
  color: string;
}

export interface GraphLink {
  source: string;
  target: string;
  /** Vínculo no directo: se dibuja punteado y en gris. */
  indirect: boolean;
  color: string;
}

/** Lienzo lógico: el SVG se escala al ancho disponible con `viewBox`. */
const W = 900;
const H = 560;

const ZOOM_MIN = 0.4;
const ZOOM_MAX = 2.4;

/**
 * Iteraciones que se corren de golpe antes de pintar.
 *
 * El temporizador de d3 va sobre `requestAnimationFrame`, que no dispara en
 * pestañas en segundo plano: si dependiéramos solo de él, el grafo se vería
 * amontonado en el origen hasta que la pestaña pasara a primer plano. Así el
 * reparto ya está resuelto en el primer pintado, pase lo que pase.
 */
const SETTLE_TICKS = 300;

interface SimNode extends SimulationNodeDatum, GraphNode {}
interface SimLink extends SimulationLinkDatum<SimNode> {
  indirect: boolean;
  color: string;
}

const radiusOf = (n: GraphNode) => (n.root ? 52 : 38);

function initialsOf(name: string) {
  return name
    .replace(/,.*$/, "")
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/** Parte el nombre en como mucho dos líneas para que quepa bajo el nodo. */
function wrapLabel(label: string): string[] {
  const words = label.split(" ");
  if (words.length === 1 || label.length <= 14) return [label];
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(" "), words.slice(mid).join(" ")];
}

/**
 * Grafo de relaciones con simulación física.
 *
 * Usa `d3-force` para acomodar los nodos y se dibuja en SVG a mano en vez de
 * con una librería de lienzo: los nodos son circulares, con anillo de color por
 * tipo y etiqueta debajo, y eso es más directo de controlar así.
 *
 * El nodo raíz queda anclado en el centro; los que el usuario arrastra se
 * quedan donde los suelte —así puede ordenar el grafo a mano— y "Recentrar"
 * suelta todos los anclajes y deja que la simulación los reacomode.
 */
export function RelationshipGraph({
  nodes,
  links,
  selectedKey,
  onSelect,
  height = 560,
}: {
  nodes: GraphNode[];
  links: GraphLink[];
  selectedKey?: string | null;
  onSelect?: (key: string) => void;
  height?: number;
}) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const simRef = useRef<Simulation<SimNode, SimLink> | null>(null);
  const simNodesRef = useRef<SimNode[]>([]);
  const simLinksRef = useRef<SimLink[]>([]);
  const draggingRef = useRef<string | null>(null);
  const panRef = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);

  // La simulación muta los nodos en su sitio; este contador fuerza el repintado
  // sin copiar el array en cada tick.
  const [, repaint] = useReducer((n: number) => n + 1, 0);

  const [view, setView] = useState({ k: 1, tx: 0, ty: 0 });
  const [search, setSearch] = useState("");
  const [hovered, setHovered] = useState<string | null>(null);

  // Identidad estable del conjunto: solo se rehace la simulación si cambia.
  const graphId = useMemo(
    () => `${nodes.map((n) => n.key).join(",")}|${links.map((l) => `${l.source}>${l.target}`).join(",")}`,
    [nodes, links]
  );

  useEffect(() => {
    if (nodes.length === 0) return;

    const simNodes: SimNode[] = nodes.map((n) => ({ ...n }));
    const byKey = new Map(simNodes.map((n) => [n.key, n]));
    const simLinks: SimLink[] = links
      .filter((l) => byKey.has(l.source) && byKey.has(l.target))
      .map((l) => ({ ...l }));

    // El nodo raíz arranca anclado en el centro para que el grafo se lea
    // siempre igual al entrar.
    const root = simNodes.find((n) => n.root);
    if (root) {
      root.fx = W / 2;
      root.fy = H / 2;
    }

    const sim = forceSimulation<SimNode>(simNodes)
      .force(
        "link",
        forceLink<SimNode, SimLink>(simLinks)
          .id((d) => d.key)
          .distance((l) => (l.indirect ? 210 : 165))
          .strength(0.35)
      )
      .force("charge", forceManyBody<SimNode>().strength(-950))
      .force("center", forceCenter(W / 2, H / 2))
      .force("collide", forceCollide<SimNode>((d) => radiusOf(d) + 28));

    // Se resuelve el reparto de una vez y solo después se engancha el
    // temporizador, que a partir de aquí únicamente sirve para que arrastrar
    // un nodo reacomode a los demás con animación.
    sim.stop();
    sim.tick(SETTLE_TICKS);
    sim.on("tick", repaint);

    simNodesRef.current = simNodes;
    simLinksRef.current = simLinks;
    simRef.current = sim;
    repaint();

    return () => {
      sim.stop();
    };
  }, [graphId, nodes, links]);

  /**
   * Cómo encaja el `viewBox` dentro del elemento.
   *
   * Con `preserveAspectRatio` (el valor por defecto) el lienzo se escala por el
   * lado que primero se queda corto y se centra en el otro, dejando franjas.
   * Sin descontarlas, el punto del cursor no cae donde el usuario cree.
   */
  const fit = useCallback(() => {
    const svg = svgRef.current;
    if (!svg) return { scale: 1, offsetX: 0, offsetY: 0, rect: null as DOMRect | null };
    const rect = svg.getBoundingClientRect();
    const scale = Math.min(rect.width / W, rect.height / H);
    return { scale, offsetX: (rect.width - W * scale) / 2, offsetY: (rect.height - H * scale) / 2, rect };
  }, []);

  /** Punto del cliente → coordenadas del lienzo lógico. */
  const toGraph = useCallback(
    (clientX: number, clientY: number) => {
      const { scale, offsetX, offsetY, rect } = fit();
      if (!rect || scale === 0) return { x: 0, y: 0 };
      const px = (clientX - rect.left - offsetX) / scale;
      const py = (clientY - rect.top - offsetY) / scale;
      return { x: (px - view.tx) / view.k, y: (py - view.ty) / view.k };
    },
    [view, fit]
  );

  const onNodePointerDown = (e: React.PointerEvent, key: string) => {
    e.stopPropagation();
    draggingRef.current = key;
    simRef.current?.alphaTarget(0.3).restart();

    // La captura es solo una comodidad —evita perder el nodo si el cursor se
    // sale de él—, así que va después de marcar el arrastre y sin dejar que
    // un rechazo del navegador lo cancele.
    try {
      e.currentTarget.setPointerCapture?.(e.pointerId);
    } catch {
      /* El arrastre se sigue atendiendo desde el propio SVG. */
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const key = draggingRef.current;
    if (key) {
      const node = simNodesRef.current.find((n) => n.key === key);
      if (node) {
        const { x, y } = toGraph(e.clientX, e.clientY);
        // `fx`/`fy` es lo que respeta la simulación, pero solo los copia a
        // `x`/`y` en el siguiente tick. Se asignan también aquí para que el
        // nodo siga al cursor al instante, sin depender del temporizador.
        node.fx = x;
        node.fy = y;
        node.x = x;
        node.y = y;
        repaint();
      }
      return;
    }

    const pan = panRef.current;
    if (pan) {
      const { scale } = fit();
      if (scale === 0) return;
      setView((v) => ({ ...v, tx: pan.tx + (e.clientX - pan.x) / scale, ty: pan.ty + (e.clientY - pan.y) / scale }));
    }
  };

  const endDrag = () => {
    // El nodo se queda anclado donde lo soltaron: `fx`/`fy` no se limpian.
    draggingRef.current = null;
    panRef.current = null;
    simRef.current?.alphaTarget(0);
  };

  const onBackgroundPointerDown = (e: React.PointerEvent) => {
    panRef.current = { x: e.clientX, y: e.clientY, tx: view.tx, ty: view.ty };
  };

  const zoomBy = (factor: number, cx = W / 2, cy = H / 2) => {
    setView((v) => {
      const k = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, v.k * factor));
      if (k === v.k) return v;
      return { k, tx: cx - (cx - v.tx) * (k / v.k), ty: cy - (cy - v.ty) * (k / v.k) };
    });
  };

  const onWheel = (e: React.WheelEvent) => {
    const { scale, offsetX, offsetY, rect } = fit();
    if (!rect || scale === 0) return;
    zoomBy(
      e.deltaY < 0 ? 1.12 : 1 / 1.12,
      (e.clientX - rect.left - offsetX) / scale,
      (e.clientY - rect.top - offsetY) / scale
    );
  };

  /** Suelta todos los anclajes salvo el de la raíz y reacomoda. */
  const recenter = () => {
    simNodesRef.current.forEach((n) => {
      if (!n.root) {
        n.fx = null;
        n.fy = null;
      }
    });
    setView({ k: 1, tx: 0, ty: 0 });

    const sim = simRef.current;
    if (sim) {
      // Igual que al montar: se resuelve de golpe para que no dependa del
      // temporizador y el resultado sea el mismo en cualquier pestaña.
      sim.alpha(0.9);
      sim.tick(SETTLE_TICKS);
      repaint();
    }
  };

  const query = search.trim().toLowerCase();
  const matches = (n: GraphNode) => query.length > 0 && n.label.toLowerCase().includes(query);

  const simNodes = simNodesRef.current;
  const simLinks = simLinksRef.current;

  // Extremos reales para encajar el minimapa, sea cual sea la dispersión.
  const bounds = useMemo(() => {
    if (simNodes.length === 0) return { minX: 0, minY: 0, w: W, h: H };
    const xs = simNodes.map((n) => n.x ?? 0);
    const ys = simNodes.map((n) => n.y ?? 0);
    const minX = Math.min(...xs) - 60;
    const minY = Math.min(...ys) - 60;
    return { minX, minY, w: Math.max(1, Math.max(...xs) + 60 - minX), h: Math.max(1, Math.max(...ys) + 60 - minY) };
    // Se recalcula en cada repintado, que es justo lo que queremos mientras corre la simulación.
  }, [simNodes]);

  if (nodes.length === 0) {
    return <p className="py-16 text-center text-sm text-white/35">Todavía no hay relaciones que dibujar.</p>;
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => zoomBy(1.2)}
          aria-label="Acercar"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/12 text-white/60 transition-colors hover:bg-white/5 hover:text-white/90"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => zoomBy(1 / 1.2)}
          aria-label="Alejar"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/12 text-white/60 transition-colors hover:bg-white/5 hover:text-white/90"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={recenter}
          aria-label="Recentrar"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/12 text-white/60 transition-colors hover:bg-white/5 hover:text-white/90"
        >
          <Maximize2 className="h-3.5 w-3.5" />
        </button>

        <span className="relative min-w-0 flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar en el grafo…"
            className="h-8 w-full rounded-lg border border-white/12 bg-white/[0.03] pl-8 pr-2 text-sm text-white/80 outline-none placeholder:text-white/25 focus:border-[var(--allpa-gold-400)]/50"
          />
        </span>

        <span className="ml-auto rounded-lg border border-white/12 px-2.5 py-1 text-xs tabular-nums text-white/50">
          {Math.round(view.k * 100)}%
        </span>
      </div>

      <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#0b1020]">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          style={{ height, touchAction: "none" }}
          className="w-full cursor-grab active:cursor-grabbing"
          onPointerDown={onBackgroundPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerLeave={endDrag}
          onWheel={onWheel}
        >
          <g transform={`translate(${view.tx},${view.ty}) scale(${view.k})`}>
            {simLinks.map((link, i) => {
              const s = link.source as SimNode;
              const t = link.target as SimNode;
              if (typeof s !== "object" || typeof t !== "object") return null;
              return (
                <line
                  key={`${s.key}-${t.key}-${i}`}
                  x1={s.x ?? 0}
                  y1={s.y ?? 0}
                  x2={t.x ?? 0}
                  y2={t.y ?? 0}
                  stroke={link.indirect ? "rgba(255,255,255,0.14)" : link.color}
                  strokeWidth={link.indirect ? 1 : 1.75}
                  strokeDasharray={link.indirect ? "5 5" : undefined}
                  strokeOpacity={link.indirect ? 1 : 0.75}
                />
              );
            })}

            {simNodes.map((n) => {
              const r = radiusOf(n);
              const x = n.x ?? 0;
              const y = n.y ?? 0;
              const Icon = resolveLucideIcon(n.icon);
              const isSelected = selectedKey === n.key;
              const isMatch = matches(n);
              const dimmed = query.length > 0 && !isMatch;
              const lines = wrapLabel(n.label);

              return (
                <g
                  key={n.key}
                  transform={`translate(${x},${y})`}
                  opacity={dimmed ? 0.25 : 1}
                  className="cursor-pointer"
                  onPointerDown={(e) => onNodePointerDown(e, n.key)}
                  onPointerEnter={() => setHovered(n.key)}
                  onPointerLeave={() => setHovered((h) => (h === n.key ? null : h))}
                  onClick={() => onSelect?.(n.key)}
                >
                  <circle r={r} fill="#0e1425" stroke={n.color} strokeWidth={isSelected || isMatch ? 3.5 : 2} />
                  {(isSelected || isMatch || hovered === n.key) && (
                    <circle r={r + 6} fill="none" stroke={n.color} strokeWidth={1} strokeOpacity={0.35} />
                  )}

                  {n.type === "persona" ? (
                    <text textAnchor="middle" dy={6} fontSize={r > 45 ? 20 : 15} fontWeight={600} fill={n.color}>
                      {initialsOf(n.label)}
                    </text>
                  ) : (
                    <g transform={`translate(${-r / 3},${-r / 3})`} color={n.color}>
                      <Icon width={(r / 3) * 2} height={(r / 3) * 2} />
                    </g>
                  )}

                  {lines.map((line, i) => (
                    <text
                      key={line + i}
                      textAnchor="middle"
                      y={r + 18 + i * 14}
                      fontSize={12}
                      fontWeight={500}
                      fill="rgba(255,255,255,0.88)"
                    >
                      {line}
                    </text>
                  ))}
                  {n.sublabel && (
                    <text textAnchor="middle" y={r + 18 + lines.length * 14} fontSize={10.5} fill={n.color} fillOpacity={0.85}>
                      {n.sublabel}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        {/* Minimapa: sitúa el conjunto de un vistazo cuando se ha hecho zoom. */}
        <div className="pointer-events-none absolute bottom-3 left-3 hidden rounded-lg border border-white/10 bg-black/40 p-1.5 backdrop-blur-sm sm:block">
          <svg width={112} height={72} viewBox={`${bounds.minX} ${bounds.minY} ${bounds.w} ${bounds.h}`}>
            {simNodes.map((n) => (
              <circle key={n.key} cx={n.x ?? 0} cy={n.y ?? 0} r={n.root ? 26 : 17} fill={n.color} fillOpacity={0.85} />
            ))}
          </svg>
        </div>

        <button
          type="button"
          onClick={recenter}
          className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-lg border border-white/12 bg-black/50 px-2.5 py-1.5 text-xs text-white/65 backdrop-blur-sm transition-colors hover:bg-white/10 hover:text-white/90"
        >
          <Crosshair className="h-3.5 w-3.5" />
          Recentrar
        </button>
      </div>
    </div>
  );
}
