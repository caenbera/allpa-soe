"use client";

import { useMemo, useState } from "react";
import { Plus, Upload } from "lucide-react";
import { toast } from "sonner";
import { PageShell, PageTabs } from "@/components/page-blocks/PageShell";
import { AddBlockDialog } from "@/components/page-blocks/AddBlockDialog";
import { useBlockComposer } from "@/components/page-blocks/use-block-composer";
import { BlockFrame } from "@/components/page-blocks/BlockFrame";
import { EmptyState, LoadingState } from "@/components/page-blocks/EmptyState";
import { StatTileList } from "@/components/page-blocks/blocks/StatTileList";
import { FilterToolbar } from "@/components/page-blocks/blocks/FilterToolbar";
import { DataTable, type RowData } from "@/components/page-blocks/blocks/DataTable";
import { MediaCardGrid } from "@/components/page-blocks/blocks/MediaCardGrid";
import { NavTileGrid } from "@/components/page-blocks/blocks/NavTileGrid";
import { RankedBarList } from "@/components/page-blocks/blocks/RankedBarList";
import { Button } from "@/components/ui/button";
import { useContent } from "@/lib/use-content";
import { usePageConfig } from "@/lib/use-page-config";
import { solutionDetailPath } from "@/lib/page-registry";
import {
  RESOURCE_KINDS,
  RESOURCE_KIND_META,
  SOL_COLLECTIONS,
  type ResourceKind,
  type SolResource,
  type Solution,
} from "@/lib/solution-types";

/** Icono y color de cada forma de consumir un recurso. */
const USES_META: Record<string, { icon: string; color: string }> = {
  descargas: { icon: "Download", color: "#3b82f6" },
  reproducciones: { icon: "PlayCircle", color: "#f472b6" },
  lecturas: { icon: "BookOpen", color: "#22c55e" },
  usos: { icon: "Wrench", color: "#e0a836" },
};

/** Qué es cada tipo de recurso, para el subtítulo de su baldosa. */
const KIND_SUBTITLE: Record<ResourceKind, string> = {
  Guía: "Material educativo detallado",
  Plantilla: "Herramientas prácticas",
  Video: "Capacitación en formato audiovisual",
  Webinar: "Charlas con expertos",
  Artículo: "Análisis y tendencias",
  Herramienta: "Calculadoras y comparadores",
};

export function BibliotecaView() {
  const resources = useContent<SolResource>(SOL_COLLECTIONS.resources);
  const solutions = useContent<Solution>(SOL_COLLECTIONS.solutions);

  const { blocks, addBlock, updateBlock, removeBlock } = usePageConfig("/soluciones/biblioteca");
  const composer = useBlockComposer(addBlock);

  const [tipo, setTipo] = useState("todos");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});

  const loading = resources.loading || solutions.loading;
  const items = useMemo(() => [...resources.items].sort((a, b) => a.order - b.order), [resources.items]);

  const visibles = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((r) => {
      if (tipo !== "todos" && r.kind !== tipo) return false;
      if (filters.plan && r.relatedPlan !== filters.plan) return false;
      if (!q) return true;
      return r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q) || r.relatedPlan.toLowerCase().includes(q);
    });
  }, [items, tipo, filters, search]);

  const destacados = useMemo(() => items.filter((r) => r.featured), [items]);

  const tabs = [
    { value: "todos", label: `Todos (${items.length})` },
    ...RESOURCE_KINDS.filter((k) => items.some((r) => r.kind === k)).map((k) => ({
      value: k,
      label: `${k} (${items.filter((r) => r.kind === k).length})`,
      icon: RESOURCE_KIND_META[k].icon,
    })),
  ];

  const categorias = useMemo(
    () =>
      RESOURCE_KINDS.filter((k) => items.some((r) => r.kind === k)).map((k) => ({
        id: k,
        icon: RESOURCE_KIND_META[k].icon,
        color: RESOURCE_KIND_META[k].color,
        title: k,
        subtitle: KIND_SUBTITLE[k],
        meta: `${items.filter((r) => r.kind === k).length} recursos`,
        active: tipo === k,
      })),
    [items, tipo]
  );

  /**
   * "Explora por solución" apunta a la ficha de cada plan, que es donde el
   * asesor va a usar el material. El conteo sale de los recursos, no de una
   * cifra guardada aparte.
   */
  const porSolucion = useMemo(
    () =>
      [...solutions.items]
        .sort((a, b) => a.order - b.order)
        .map((s) => ({
          id: s.slug,
          icon: s.icon,
          color: s.color,
          title: s.name,
          meta: `${items.filter((r) => r.relatedPlan === s.name).length} recursos`,
          href: solutionDetailPath(s.slug),
        }))
        .filter((t) => t.meta !== "0 recursos"),
    [solutions.items, items]
  );

  const populares = useMemo(
    () =>
      [...items]
        .sort((a, b) => b.uses - a.uses)
        .slice(0, 5)
        .map((r) => ({
          id: r.id,
          label: r.title,
          value: r.uses,
          color: RESOURCE_KIND_META[r.kind].color,
          ranked: true,
        })),
    [items]
  );

  /**
   * Las cifras salen de las etiquetas de uso que existan de verdad, no de una
   * lista fija: si hubiera una sola con etiqueta escrita a mano y no la
   * contáramos, el panel enseñaría menos de lo que hay sin decirlo.
   */
  const estadisticas = useMemo(() => {
    const porEtiqueta = new Map<string, number>();
    items.forEach((r) => porEtiqueta.set(r.usesLabel, (porEtiqueta.get(r.usesLabel) ?? 0) + r.uses));

    return [
      { id: "total", icon: "Library", color: "#a78bfa", value: String(items.length), label: "Recursos totales" },
      ...[...porEtiqueta.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([etiqueta, total]) => ({
          id: etiqueta,
          icon: USES_META[etiqueta]?.icon ?? "Activity",
          color: USES_META[etiqueta]?.color ?? "#64748b",
          value: total.toLocaleString("es"),
          label: etiqueta.charAt(0).toUpperCase() + etiqueta.slice(1),
        })),
    ];
  }, [items]);

  const filas: RowData[] = visibles.map((r) => ({
    id: r.id,
    cells: {
      titulo: { kind: "source", icon: RESOURCE_KIND_META[r.kind].icon, value: r.title, sub: r.meta },
      tipo: { kind: "badge", value: r.kind, tone: "violet" },
      solucion: { kind: "text", value: r.relatedPlan },
      usos: { kind: "stacked", value: String(r.uses), sub: r.usesLabel },
      fecha: { kind: "text", value: r.date },
    },
  }));

  const sidePanel = (
    <>
      <BlockFrame title="Estadísticas de la biblioteca" icon="ChartBar">
        <StatTileList tiles={estadisticas} columns={2} />
      </BlockFrame>

      <BlockFrame title="Recursos más populares" icon="Trophy">
        {populares.length === 0 ? (
          <p className="py-4 text-center text-sm text-white/35">Sin recursos todavía.</p>
        ) : (
          <RankedBarList rows={populares} />
        )}
      </BlockFrame>

      <BlockFrame title="Explora por solución" icon="ShieldCheck">
        {porSolucion.length === 0 ? (
          <p className="py-4 text-center text-sm text-white/35">Ningún plan tiene material asociado.</p>
        ) : (
          <NavTileGrid tiles={porSolucion} columns={1} />
        )}
      </BlockFrame>
    </>
  );

  return (
    <PageShell
      title="Biblioteca"
      description="Accede a los recursos, materiales y conocimientos para fortalecer tu labor como asesor."
      icon="BookOpen"
      sidePanel={sidePanel}
      blocks={{ items: blocks, onUpdate: updateBlock, onDelete: removeBlock, onAdd: composer.openFor }}
      headerActions={
        <>
          <Button
            variant="outline"
            size="sm"
            className="border-white/12 bg-white/[0.03] text-white/70 hover:bg-white/[0.06]"
            onClick={() => toast.info("Cargar archivos llega con la gestión documental.")}
          >
            <Upload className="mr-1.5 h-3.5 w-3.5" />
            Cargar archivo
          </Button>
          <Button size="sm" onClick={() => toast.info("Crear recursos llega con la gestión documental.")}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Nuevo recurso
          </Button>
        </>
      }
    >
      <PageTabs tabs={tabs} active={tipo} onChange={setTipo} />

      {loading ? (
        <div className="surface-card">
          <LoadingState />
        </div>
      ) : items.length === 0 ? (
        <div className="surface-card">
          <EmptyState
            icon="BookOpen"
            title="La biblioteca está vacía"
            description="Cuando se cargue el primer recurso, aparecerá aquí clasificado por tipo y por solución."
          />
        </div>
      ) : (
        <>
          {tipo === "todos" && destacados.length > 0 && (
            <BlockFrame title="Recursos destacados" icon="Star">
              <MediaCardGrid
                cards={destacados.map((r) => ({
                  id: r.id,
                  title: r.title,
                  description: r.description,
                  icon: RESOURCE_KIND_META[r.kind].icon,
                  color: RESOURCE_KIND_META[r.kind].color,
                  ribbon: r.kind,
                  tag: r.relatedPlan,
                  countLabel: `${r.uses} ${r.usesLabel}`,
                  metaLabel: r.meta,
                  linkLabel: "Abrir recurso",
                }))}
                onSelect={() => toast.info("Abrir el recurso llega con la gestión documental.")}
              />
            </BlockFrame>
          )}

          <BlockFrame title="Categorías de recursos" icon="LayoutGrid">
            <NavTileGrid tiles={categorias} columns={3} onSelect={(id) => setTipo(tipo === id ? "todos" : id)} />
          </BlockFrame>

          <BlockFrame title={tipo === "todos" ? "Todos los recursos" : `Recursos: ${tipo}`} icon="Library">
            <FilterToolbar
              search={search}
              onSearchChange={setSearch}
              searchPlaceholder="Buscar recursos…"
              filters={[{ id: "plan", label: "Solución", options: [...new Set(items.map((r) => r.relatedPlan))].sort() }]}
              values={filters}
              onFilterChange={(id, value) => setFilters((prev) => ({ ...prev, [id]: value }))}
            />

            {visibles.length === 0 ? (
              <EmptyState
                icon="SearchX"
                title="Nada coincide"
                description="Prueba con otro término, otro tipo de recurso o quita el filtro de solución."
              />
            ) : (
              <DataTable
                columns={[
                  { id: "titulo", header: "Recurso", sortable: true },
                  { id: "tipo", header: "Tipo", sortable: true, width: "130px" },
                  { id: "solucion", header: "Solución", sortable: true },
                  { id: "usos", header: "Uso", sortable: true, width: "130px" },
                  { id: "fecha", header: "Fecha", sortable: true, width: "140px" },
                ]}
                rows={filas}
              />
            )}
          </BlockFrame>
        </>
      )}

      <AddBlockDialog {...composer.dialogProps} />
    </PageShell>
  );
}
