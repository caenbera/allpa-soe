"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Download, Plus } from "lucide-react";
import { PageShell, PageTabs } from "@/components/page-blocks/PageShell";
import { AddBlockDialog } from "@/components/page-blocks/AddBlockDialog";
import { useBlockComposer } from "@/components/page-blocks/use-block-composer";
import { BlockFrame } from "@/components/page-blocks/BlockFrame";
import { EmptyState, LoadingState } from "@/components/page-blocks/EmptyState";
import { KpiStrip } from "@/components/page-blocks/blocks/KpiStrip";
import { DataTable, type RowData } from "@/components/page-blocks/blocks/DataTable";
import { InfoCard } from "@/components/page-blocks/blocks/InfoCard";
import { DonutChart, DONUT_COLORS } from "@/components/page-blocks/blocks/DonutChart";
import { StatTileList } from "@/components/page-blocks/blocks/StatTileList";
import { RankedBarList } from "@/components/page-blocks/blocks/RankedBarList";
import { ActivityFeed } from "@/components/page-blocks/blocks/ActivityFeed";
import { Button } from "@/components/ui/button";
import { useContent } from "@/lib/use-content";
import { usePageConfig } from "@/lib/use-page-config";
import {
  CRM_COLLECTIONS,
  RELATIONSHIP_NODE_COLOR,
  type CrmNode,
  type CrmRelationship,
  type RelationshipNodeType,
} from "@/lib/crm-types";

// Los tres bloques de grafo arrastran d3-force y dagre: se cargan solo al
// entrar en esta página para no engordar el resto.
const LOADING = (
  <div className="flex h-[420px] items-center justify-center text-sm text-white/35">Cargando la vista…</div>
);

const RelationshipGraph = dynamic(
  () => import("@/components/page-blocks/blocks/RelationshipGraph").then((m) => m.RelationshipGraph),
  { ssr: false, loading: () => LOADING }
);
const OrgChart = dynamic(() => import("@/components/page-blocks/blocks/OrgChart").then((m) => m.OrgChart), {
  ssr: false,
  loading: () => LOADING,
});
const FamilyTree = dynamic(() => import("@/components/page-blocks/blocks/FamilyTree").then((m) => m.FamilyTree), {
  ssr: false,
  loading: () => LOADING,
});

const TABS = [
  { value: "grafo", label: "Vista grafo" },
  { value: "familias", label: "Familias" },
  { value: "empresas", label: "Empresas" },
  { value: "profesionales", label: "Profesionales" },
  { value: "productos", label: "Productos" },
  { value: "patrimonio", label: "Patrimonio" },
];

const TYPE_LABEL: Record<RelationshipNodeType, string> = {
  persona: "Persona",
  empresa: "Empresa",
  trust: "Trust",
  producto: "Producto",
  asesor: "Asesor / Profesional",
};

function moneyCompact(n: number) {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  return `$${n.toLocaleString("es")}`;
}

/** Icono del nodo: por tipo, afinado por su subetiqueta cuando aporta. */
function iconForNode(node: CrmNode) {
  if (node.type === "empresa") return "Building2";
  if (node.type === "trust") return "ShieldCheck";
  if (node.type === "producto") return node.sublabel === "Seguro" ? "ShieldCheck" : "FileText";
  if (node.type === "asesor") return node.sublabel === "Attorney" ? "Scale" : "UserRound";
  return "UserRound";
}

export function RelacionesView() {
  const [tab, setTab] = useState("grafo");
  const [graphSelected, setGraphSelected] = useState<string | null>(null);
  const [orgSelected, setOrgSelected] = useState<string | null>(null);
  const [familySelected, setFamilySelected] = useState<string | null>(null);
  const [generations, setGenerations] = useState(4);

  const nodes = useContent<CrmNode>(CRM_COLLECTIONS.nodes);
  const relationships = useContent<CrmRelationship>(CRM_COLLECTIONS.relationships);
  const { blocks, addBlock, updateBlock, removeBlock } = usePageConfig("/crm/relaciones");
  const composer = useBlockComposer(addBlock);

  const byKey = useMemo(() => new Map(nodes.items.map((n) => [n.key, n])), [nodes.items]);

  const rootPerson = useMemo(() => nodes.items.find((n) => n.root && n.type === "persona") ?? null, [nodes.items]);
  const rootCompany = useMemo(() => nodes.items.find((n) => n.root && n.type === "empresa") ?? null, [nodes.items]);

  /** Aristas válidas: ambas puntas tienen que existir como nodo. */
  const edges = useMemo(
    () => relationships.items.filter((r) => byKey.has(r.fromKey) && byKey.has(r.toKey)),
    [relationships.items, byKey]
  );

  const stats = useMemo(() => {
    const of = (type: RelationshipNodeType) => nodes.items.filter((n) => n.type === type);
    const patrimonio = nodes.items
      .filter((n) => n.type === "trust" || n.type === "producto")
      .reduce((sum, n) => sum + (n.value ?? 0), 0);
    return {
      total: edges.length,
      personas: of("persona").length,
      empresas: of("empresa").length,
      asesores: of("asesor").length,
      trusts: of("trust").length,
      productos: of("producto").length,
      patrimonio,
      valorEmpresarial: of("empresa").reduce((sum, n) => sum + (n.value ?? 0), 0),
    };
  }, [nodes.items, edges]);

  // ── Vista grafo: la red directa del cliente ──────────────────────────────
  // Se dibuja el entorno inmediato de la raíz —lo que de verdad se consulta—
  // y no las subsidiarias de tercer nivel, que viven en el organigrama.
  const graph = useMemo(() => {
    if (!rootPerson) return { nodes: [], links: [] };

    const keys = new Set<string>([rootPerson.key]);
    edges.forEach((e) => {
      if (e.fromKey === rootPerson.key) keys.add(e.toKey);
      if (e.toKey === rootPerson.key) keys.add(e.fromKey);
    });

    const graphNodes = nodes.items
      .filter((n) => keys.has(n.key))
      .map((n) => ({
        key: n.key,
        type: n.type,
        label: n.label,
        sublabel: n.sublabel,
        badge: n.badge,
        icon: iconForNode(n),
        root: n.key === rootPerson.key,
        color: RELATIONSHIP_NODE_COLOR[n.type],
      }));

    const graphLinks = edges
      .filter((e) => keys.has(e.fromKey) && keys.has(e.toKey))
      .map((e) => ({
        source: e.fromKey,
        target: e.toKey,
        indirect: e.indirect,
        color: RELATIONSHIP_NODE_COLOR[byKey.get(e.toKey)?.type ?? "persona"],
      }));

    return { nodes: graphNodes, links: graphLinks };
  }, [nodes.items, edges, byKey, rootPerson]);

  const graphNode = byKey.get(graphSelected ?? rootPerson?.key ?? "") ?? null;

  /** Aristas del nodo seleccionado, para su ficha y su resumen. */
  const graphNodeEdges = useMemo(
    () => (graphNode ? edges.filter((e) => e.fromKey === graphNode.key || e.toKey === graphNode.key) : []),
    [edges, graphNode]
  );

  const byCategory = useMemo(() => {
    const counts = new Map<string, number>();
    graphNodeEdges.forEach((e) => {
      const other = byKey.get(e.fromKey === graphNode?.key ? e.toKey : e.fromKey);
      if (!other) return;
      counts.set(TYPE_LABEL[other.type], (counts.get(TYPE_LABEL[other.type]) ?? 0) + 1);
    });
    return Array.from(counts.entries()).map(([label, value], i) => ({
      id: label,
      label,
      value,
      color: DONUT_COLORS[i % DONUT_COLORS.length],
    }));
  }, [graphNodeEdges, byKey, graphNode]);

  const recentLinks = useMemo(
    () =>
      [...graphNodeEdges]
        .sort((a, b) => b.order - a.order)
        .slice(0, 4)
        .map((e) => {
          const other = byKey.get(e.fromKey === graphNode?.key ? e.toKey : e.fromKey);
          return {
            id: e.id,
            icon: other ? iconForNode(other) : "Link",
            color: RELATIONSHIP_NODE_COLOR[other?.type ?? "persona"],
            title: e.kind,
            detail: other?.label ?? "",
            timeLabel: e.indirect ? "Indirecta" : "Directa",
          };
        }),
    [graphNodeEdges, byKey, graphNode]
  );

  // ── Familias: árbol por generaciones ─────────────────────────────────────
  const family = useMemo(() => {
    const members = nodes.items
      .filter((n) => n.generation !== null)
      .map((n) => ({
        key: n.key,
        label: n.label,
        role: n.sublabel,
        badge: n.badge,
        birthYear: n.birthYear,
        deathYear: n.deathYear,
        generation: n.generation as number,
        beneficiary: n.badge.startsWith("Beneficiari"),
        color: n.deathYear ? "#94a3b8" : RELATIONSHIP_NODE_COLOR.persona,
      }));

    const memberKeys = new Set(members.map((m) => m.key));
    const familyEdges = edges
      .filter((e) => e.category === "familia" && memberKeys.has(e.fromKey) && memberKeys.has(e.toKey))
      .map((e) => ({
        from: e.fromKey,
        to: e.toKey,
        spouse: e.kind === "Cónyuge" || e.kind === "Esposa" || e.kind === "Esposo",
      }));

    return { members, edges: familyEdges };
  }, [nodes.items, edges]);

  const familyNode = byKey.get(familySelected ?? rootPerson?.key ?? "") ?? null;

  const wealthByGeneration = useMemo(() => {
    const totals = new Map<number, number>();
    family.members.forEach((m) => {
      const owned = edges
        .filter((e) => e.fromKey === m.key && e.ownership !== null)
        .reduce((sum, e) => sum + ((byKey.get(e.toKey)?.value ?? 0) * (e.ownership ?? 0)) / 100, 0);
      totals.set(m.generation, (totals.get(m.generation) ?? 0) + owned);
    });
    return Array.from(totals.entries())
      .filter(([, value]) => value > 0)
      .sort((a, b) => a[0] - b[0])
      .map(([gen, value], i) => ({
        id: `gen-${gen}`,
        label: `Generación ${gen}`,
        value: Math.round(value),
        color: DONUT_COLORS[i % DONUT_COLORS.length],
      }));
  }, [family.members, edges, byKey]);

  // ── Empresas: organigrama y subsidiarias ─────────────────────────────────
  const org = useMemo(() => {
    // La jerarquía societaria son las aristas entre entidades no personales.
    const structural = edges.filter((e) => {
      const from = byKey.get(e.fromKey);
      const to = byKey.get(e.toKey);
      return from && to && from.type !== "persona" && from.type !== "asesor" && to.type !== "persona" && to.type !== "asesor";
    });

    const keys = new Set<string>();
    structural.forEach((e) => {
      keys.add(e.fromKey);
      keys.add(e.toKey);
    });
    if (rootCompany) keys.add(rootCompany.key);

    const orgNodes = nodes.items
      .filter((n) => keys.has(n.key) && n.type !== "producto")
      .map((n) => ({
        key: n.key,
        label: n.label,
        sublabel: n.sublabel,
        value: n.value ? moneyCompact(n.value) : "",
        icon: iconForNode(n),
        color: RELATIONSHIP_NODE_COLOR[n.type],
      }));

    const orgKeys = new Set(orgNodes.map((n) => n.key));
    const orgEdges = structural
      .filter((e) => orgKeys.has(e.fromKey) && orgKeys.has(e.toKey))
      .map((e) => ({ from: e.fromKey, to: e.toKey, ownership: e.ownership }));

    return { nodes: orgNodes, edges: orgEdges, structural };
  }, [nodes.items, edges, byKey, rootCompany]);

  const orgNode = byKey.get(orgSelected ?? rootCompany?.key ?? "") ?? null;

  /** Reparto de la propiedad del holding entre las personas de la familia. */
  const ownership = useMemo(() => {
    if (!rootCompany) return [];
    return edges
      .filter((e) => e.toKey === rootCompany.key && e.ownership !== null && byKey.get(e.fromKey)?.type === "persona")
      .sort((a, b) => (b.ownership ?? 0) - (a.ownership ?? 0))
      .map((e, i) => ({
        id: e.id,
        label: byKey.get(e.fromKey)?.label ?? e.fromKey,
        value: e.ownership ?? 0,
        color: DONUT_COLORS[i % DONUT_COLORS.length],
      }));
  }, [edges, byKey, rootCompany]);

  /** Cada empresa con la arista que la cuelga de su matriz. */
  const subsidiaries = useMemo(() => {
    const parentEdge = new Map<string, CrmRelationship>();
    org.structural.forEach((e) => parentEdge.set(e.toKey, e));
    return nodes.items
      .filter((n) => n.type === "empresa" && !n.root)
      .map((n) => ({ node: n, edge: parentEdge.get(n.key) ?? null }));
  }, [nodes.items, org.structural]);

  const subsidiaryRows: RowData[] = subsidiaries.map(({ node, edge }) => ({
    id: node.id,
    cells: {
      company: { kind: "text", value: node.label, sub: node.location, strong: true },
      industry: { kind: "text", value: node.industry },
      relation: { kind: "badge", value: edge?.kind ?? "Sin vínculo", tone: "violet" },
      ownership: { kind: "number", value: edge?.ownership !== null && edge?.ownership !== undefined ? `${edge.ownership}%` : "—" },
      employees: { kind: "number", value: String(node.employees ?? 0) },
      value: { kind: "number", value: node.value ? moneyCompact(node.value) : "—" },
      status: { kind: "status", value: node.badge || "Activa", tone: "emerald" },
    },
  }));

  // ── Profesionales y productos ────────────────────────────────────────────
  const professionalRows: RowData[] = nodes.items
    .filter((n) => n.type === "asesor")
    .map((n) => {
      const link = edges.find((e) => e.toKey === n.key && byKey.get(e.fromKey)?.type === "persona");
      return {
        id: n.id,
        cells: {
          person: { kind: "person", name: n.label, role: n.sublabel },
          role: { kind: "badge", value: n.sublabel, tone: "amber" },
          link: { kind: "text", value: link?.kind ?? "—", sub: link ? byKey.get(link.fromKey)?.label : undefined },
          email: { kind: "text", value: n.email || "—" },
          phone: { kind: "text", value: n.phone || "—" },
          location: { kind: "text", value: n.location || "—" },
        },
      };
    });

  const productRows: RowData[] = nodes.items
    .filter((n) => n.type === "producto")
    .map((n) => {
      const link = edges.find((e) => e.toKey === n.key);
      return {
        id: n.id,
        cells: {
          product: { kind: "text", value: n.label, sub: n.sublabel, strong: true },
          type: { kind: "badge", value: n.sublabel, tone: "blue" },
          holder: { kind: "text", value: link ? (byKey.get(link.fromKey)?.label ?? "—") : "—", sub: link?.kind },
          value: { kind: "number", value: n.value ? moneyCompact(n.value) : "—" },
        },
      };
    });

  const companiesByValue = useMemo(
    () =>
      nodes.items
        .filter((n) => n.type === "empresa" && n.value)
        .sort((a, b) => (b.value ?? 0) - (a.value ?? 0))
        .slice(0, 8)
        .map((n, i) => ({ id: n.id, label: n.label, value: n.value ?? 0, color: DONUT_COLORS[i % DONUT_COLORS.length] })),
    [nodes.items]
  );

  const valueByType = useMemo(() => {
    const totals = new Map<RelationshipNodeType, number>();
    nodes.items.forEach((n) => {
      if (n.value) totals.set(n.type, (totals.get(n.type) ?? 0) + n.value);
    });
    return Array.from(totals.entries()).map(([type, value]) => ({
      id: type,
      label: TYPE_LABEL[type],
      value,
      color: RELATIONSHIP_NODE_COLOR[type],
    }));
  }, [nodes.items]);

  const loading = nodes.loading || relationships.loading;
  const isEmpty = !loading && nodes.items.length === 0;

  // ── Panel lateral, distinto en cada pestaña ──────────────────────────────
  // Vacía muestra solo la ranura de bloques que añade PageShell.
  const sidePanel = isEmpty ? null : (
    <>
      {tab === "grafo" && graphNode && (
        <>
          <BlockFrame title="Detalle del nodo" icon="IdCard">
            <p className="mb-2 text-base font-semibold text-[#f3ecd9]">{graphNode.label}</p>
            {graphNode.badge && (
              <span
                className="mb-3 inline-block rounded-full px-2.5 py-1 text-xs font-medium"
                style={{
                  background: `${RELATIONSHIP_NODE_COLOR[graphNode.type]}1f`,
                  color: RELATIONSHIP_NODE_COLOR[graphNode.type],
                }}
              >
                {graphNode.badge}
              </span>
            )}
            <InfoCard
              rows={[
                { label: "Tipo", value: TYPE_LABEL[graphNode.type] },
                ...(graphNode.sublabel ? [{ label: "Vínculo", value: graphNode.sublabel }] : []),
                ...(graphNode.email ? [{ label: "Email", value: graphNode.email }] : []),
                ...(graphNode.phone ? [{ label: "Teléfono", value: graphNode.phone }] : []),
                ...(graphNode.location ? [{ label: "Ubicación", value: graphNode.location }] : []),
                ...(graphNode.value ? [{ label: "Valor asociado", value: moneyCompact(graphNode.value) }] : []),
                { label: "Relaciones", value: String(graphNodeEdges.length) },
              ]}
            />
          </BlockFrame>

          <BlockFrame title="Resumen de relaciones" icon="Workflow">
            <StatTileList
              tiles={[
                { id: "personas", icon: "Users", color: RELATIONSHIP_NODE_COLOR.persona, value: String(stats.personas), label: "Personas conectadas" },
                { id: "empresas", icon: "Building2", color: RELATIONSHIP_NODE_COLOR.empresa, value: String(stats.empresas), label: "Empresas conectadas" },
                { id: "asesores", icon: "UserRound", color: RELATIONSHIP_NODE_COLOR.asesor, value: String(stats.asesores), label: "Profesionales conectados" },
                { id: "patrimonio", icon: "Landmark", color: RELATIONSHIP_NODE_COLOR.trust, value: moneyCompact(stats.patrimonio), label: "Valor patrimonial" },
              ]}
            />
          </BlockFrame>

          <BlockFrame title="Relaciones por categoría" icon="PieChart">
            <DonutChart slices={byCategory} centerValue={String(graphNodeEdges.length)} centerLabel="Total" />
          </BlockFrame>

          <BlockFrame title="Vínculos del nodo" icon="History">
            <ActivityFeed entries={recentLinks} compact />
          </BlockFrame>
        </>
      )}

      {tab === "familias" && familyNode && (
        <>
          <BlockFrame title="Información de miembro" icon="UserRound">
            <p className="mb-3 text-base font-semibold text-[#f3ecd9]">{familyNode.label}</p>
            <InfoCard
              rows={[
                { label: "Rol en la familia", value: familyNode.sublabel },
                { label: "Generación", value: String(familyNode.generation ?? "—") },
                {
                  label: familyNode.deathYear ? "Años" : "Nacimiento",
                  value: familyNode.deathYear ? `${familyNode.birthYear} - ${familyNode.deathYear}` : String(familyNode.birthYear ?? "—"),
                },
                ...(familyNode.email ? [{ label: "Email", value: familyNode.email }] : []),
                ...(familyNode.phone ? [{ label: "Teléfono", value: familyNode.phone }] : []),
                ...(familyNode.location ? [{ label: "Ubicación", value: familyNode.location }] : []),
              ]}
            />
          </BlockFrame>

          <BlockFrame title="Estadísticas familiares" icon="Users2">
            <StatTileList
              tiles={[
                { id: "miembros", icon: "Users2", color: "#3b82f6", value: String(family.members.length), label: "Miembros totales" },
                { id: "benef", icon: "BadgeCheck", color: "#22c55e", value: String(family.members.filter((m) => m.beneficiary).length), label: "Miembros beneficiarios" },
                { id: "gen", icon: "Layers", color: "#a78bfa", value: String(new Set(family.members.map((m) => m.generation)).size), label: "Generaciones" },
              ]}
            />
          </BlockFrame>

          {wealthByGeneration.length > 0 && (
            <BlockFrame title="Patrimonio por generación" icon="BarChart3">
              <RankedBarList rows={wealthByGeneration} formatValue={moneyCompact} />
            </BlockFrame>
          )}
        </>
      )}

      {tab === "empresas" && orgNode && (
        <>
          <BlockFrame title="Detalle de la empresa" icon="Building2">
            <p className="mb-3 text-base font-semibold text-[#f3ecd9]">{orgNode.label}</p>
            <InfoCard
              rows={[
                { label: "Tipo", value: orgNode.sublabel || "—" },
                { label: "Estatus legal", value: orgNode.legalType || "—" },
                { label: "Industria", value: orgNode.industry || "—" },
                { label: "Jurisdicción", value: orgNode.location || "—" },
                { label: "Valor empresarial", value: orgNode.value ? moneyCompact(orgNode.value) : "—" },
                { label: "Empleados", value: String(orgNode.employees ?? "—") },
              ]}
            />
          </BlockFrame>

          {ownership.length > 0 && (
            <BlockFrame title="Distribución de propiedad" icon="PieChart">
              <DonutChart
                slices={ownership}
                centerValue={`${ownership.reduce((s, o) => s + o.value, 0)}%`}
                centerLabel="Total"
                showPercent={false}
              />
            </BlockFrame>
          )}

          <BlockFrame title="Resumen de la estructura" icon="Network">
            <StatTileList
              columns={2}
              tiles={[
                { id: "empresas", icon: "Building2", color: "#3b82f6", value: String(stats.empresas), label: "Empresas totales" },
                { id: "subs", icon: "Network", color: "#22c55e", value: String(subsidiaries.length), label: "Subsidiarias" },
                {
                  id: "empleados",
                  icon: "Users",
                  color: "#a78bfa",
                  value: String(nodes.items.reduce((sum, n) => sum + (n.employees ?? 0), 0)),
                  label: "Empleados totales",
                },
                { id: "valor", icon: "Landmark", color: "#e0a836", value: moneyCompact(stats.valorEmpresarial), label: "Valor empresarial" },
              ]}
            />
          </BlockFrame>
        </>
      )}

      {tab === "patrimonio" && (
        <BlockFrame title="Valor por tipo de activo" icon="PieChart">
          <DonutChart
            slices={valueByType}
            centerValue={moneyCompact(valueByType.reduce((s, v) => s + v.value, 0))}
            centerLabel="Valor total"
          />
        </BlockFrame>
      )}

    </>
  );

  return (
    <PageShell
      title="Relaciones"
      description="Visualiza y gestiona todas las conexiones personales, familiares, empresariales y patrimoniales."
      icon="Workflow"
      starrable={false}
      sidePanel={sidePanel}
      blocks={{ items: blocks, onUpdate: updateBlock, onDelete: removeBlock, onAdd: composer.openFor }}
      headerActions={
        <>
          <Button variant="outline" size="sm" className="border-white/12 bg-white/[0.03] text-white/70 hover:bg-white/[0.06]">
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Exportar
          </Button>
          <Button className="border-0 bg-gradient-to-b from-[#f5da93] to-[#c98f1f] font-semibold text-[#241a05] hover:brightness-105">
            <Plus className="mr-1.5 h-4 w-4" />
            Nueva relación
          </Button>
        </>
      }
    >
      {loading ? (
        <div className="surface-card">
          <LoadingState />
        </div>
      ) : isEmpty ? (
        <div className="surface-card">
          <EmptyState
            icon="Workflow"
            title="Todavía no hay relaciones"
            description="Aquí se dibuja cómo se conectan tus contactos entre sí: su familia, las empresas que controlan, sus productos y los profesionales que los asesoran. Crea la primera relación para empezar."
            actionLabel="Nueva relación"
            onAction={() => undefined}
          />
        </div>
      ) : (
        <>
          <KpiStrip
            items={[
              { id: "total", label: "Relaciones totales", value: String(stats.total), delta: "15.8%", sub: "vs mes anterior", icon: "Workflow", tone: "violet" },
              { id: "personas", label: "Personas conectadas", value: String(stats.personas), delta: "12.3%", sub: "vs mes anterior", icon: "Users", tone: "blue" },
              { id: "empresas", label: "Empresas vinculadas", value: String(stats.empresas), delta: "11.7%", sub: "vs mes anterior", icon: "Building2", tone: "emerald" },
              { id: "asesores", label: "Profesionales externos", value: String(stats.asesores), delta: "8.9%", sub: "vs mes anterior", icon: "UserRound", tone: "amber" },
              { id: "trusts", label: "Trusts relacionados", value: String(stats.trusts), delta: "9.4%", sub: "vs mes anterior", icon: "ShieldCheck", tone: "rose" },
            ]}
          />

          <div className="surface-card mt-3 overflow-hidden">
            <div className="px-4 pt-3">
              <PageTabs tabs={TABS} active={tab} onChange={setTab} />
            </div>
            <div className="px-4 pb-4">
              {tab === "grafo" && (
                <>
                  <RelationshipGraph
                    nodes={graph.nodes}
                    links={graph.links}
                    selectedKey={graphNode?.key ?? null}
                    onSelect={setGraphSelected}
                  />
                  <div className="mt-3 flex flex-wrap justify-center gap-4 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-2.5">
                    {(Object.keys(TYPE_LABEL) as RelationshipNodeType[]).map((type) => (
                      <span key={type} className="flex items-center gap-1.5 text-xs text-white/55">
                        <span className="h-2 w-2 rounded-full" style={{ background: RELATIONSHIP_NODE_COLOR[type] }} />
                        {TYPE_LABEL[type]}
                      </span>
                    ))}
                  </div>
                </>
              )}

              {tab === "familias" && (
                <>
                  <div className="mb-3 flex items-center gap-2">
                    <span className="text-xs text-white/40">Generaciones:</span>
                    {[4, 3, 2].map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGenerations(g)}
                        className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs transition-colors ${
                          generations === g
                            ? "bg-[var(--allpa-gold-400)]/20 font-semibold text-[var(--allpa-gold-300)]"
                            : "border border-white/10 text-white/50 hover:bg-white/5"
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                  <FamilyTree
                    members={family.members}
                    edges={family.edges}
                    selectedKey={familyNode?.key ?? null}
                    onSelect={setFamilySelected}
                    maxGenerations={generations}
                  />
                </>
              )}

              {tab === "empresas" && (
                <>
                  <OrgChart
                    nodes={org.nodes}
                    edges={org.edges}
                    selectedKey={orgNode?.key ?? null}
                    onSelect={setOrgSelected}
                  />
                  <p className="mb-2 mt-5 text-sm font-medium text-[#f3ecd9]">Subsidiarias y compañías relacionadas</p>
                  <DataTable
                    columns={[
                      { id: "company", header: "Empresa", sortable: true },
                      { id: "industry", header: "Industria", sortable: true, width: "140px" },
                      { id: "relation", header: "Tipo de relación", width: "160px" },
                      { id: "ownership", header: "Participación", sortable: true, width: "120px" },
                      { id: "employees", header: "Empleados", sortable: true, width: "110px" },
                      { id: "value", header: "Valor estimado", sortable: true, width: "130px" },
                      { id: "status", header: "Estatus", width: "120px" },
                    ]}
                    rows={subsidiaryRows}
                    onView={(id) => {
                      const found = nodes.items.find((n) => n.id === id);
                      if (found) setOrgSelected(found.key);
                    }}
                  />
                </>
              )}

              {tab === "profesionales" && (
                <DataTable
                  columns={[
                    { id: "person", header: "Profesional", sortable: true },
                    { id: "role", header: "Rol", sortable: true, width: "140px" },
                    { id: "link", header: "Vínculo", width: "170px" },
                    { id: "email", header: "Email", width: "200px" },
                    { id: "phone", header: "Teléfono", width: "140px" },
                    { id: "location", header: "Ubicación", width: "150px" },
                  ]}
                  rows={professionalRows}
                  emptyMessage="Todavía no hay profesionales vinculados."
                />
              )}

              {tab === "productos" && (
                <DataTable
                  columns={[
                    { id: "product", header: "Producto", sortable: true },
                    { id: "type", header: "Tipo", sortable: true, width: "140px" },
                    { id: "holder", header: "Titular", sortable: true, width: "220px" },
                    { id: "value", header: "Valor asegurado", sortable: true, width: "160px" },
                  ]}
                  rows={productRows}
                  emptyMessage="Todavía no hay productos vinculados."
                />
              )}

              {tab === "patrimonio" && (
                <div className="space-y-4">
                  <StatTileList
                    columns={2}
                    tiles={[
                      { id: "empresarial", icon: "Building2", color: "#22c55e", value: moneyCompact(stats.valorEmpresarial), label: "Valor empresarial total" },
                      { id: "trust", icon: "ShieldCheck", color: "#a78bfa", value: moneyCompact(nodes.items.filter((n) => n.type === "trust").reduce((s, n) => s + (n.value ?? 0), 0)), label: "Valor en trusts" },
                      { id: "productos", icon: "FileText", color: "#e0a836", value: moneyCompact(nodes.items.filter((n) => n.type === "producto").reduce((s, n) => s + (n.value ?? 0), 0)), label: "Valor en productos" },
                      { id: "entidades", icon: "Network", color: "#3b82f6", value: String(stats.empresas + stats.trusts), label: "Entidades patrimoniales" },
                    ]}
                  />
                  <div>
                    <p className="mb-2.5 text-sm font-medium text-[#f3ecd9]">Empresas por valor estimado</p>
                    <RankedBarList rows={companiesByValue} formatValue={moneyCompact} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <AddBlockDialog {...composer.dialogProps} />
    </PageShell>
  );
}
