"use client";

import { useMemo } from "react";
import { Info, RotateCcw } from "lucide-react";
import { PageShell } from "@/components/page-blocks/PageShell";
import { AddBlockDialog } from "@/components/page-blocks/AddBlockDialog";
import { useBlockComposer } from "@/components/page-blocks/use-block-composer";
import { BlockFrame } from "@/components/page-blocks/BlockFrame";
import { LoadingState } from "@/components/page-blocks/EmptyState";
import { SettingsCardGrid, type SettingsCard } from "@/components/page-blocks/blocks/SettingsCardGrid";
import { InfoCard } from "@/components/page-blocks/blocks/InfoCard";
import { KpiProgressList } from "@/components/page-blocks/blocks/KpiProgressList";
import { QuickActionGrid } from "@/components/page-blocks/blocks/QuickActionGrid";
import { Button } from "@/components/ui/button";
import { useContent } from "@/lib/use-content";
import { usePageConfig } from "@/lib/use-page-config";
import { share } from "@/lib/solution-metrics";
import {
  COMPONENT_CATEGORIES,
  RESOURCE_KINDS,
  SOL_COLLECTIONS,
  type SolComponent,
  type SolResource,
  type SolRoute,
  type SolUseCase,
  type Solution,
} from "@/lib/solution-types";

/**
 * Ajustes propios del módulo Soluciones.
 *
 * La configuración de la plataforma —usuarios, roles, integraciones,
 * seguridad— vive en su propio bloque al final del menú. Aquí solo está lo
 * que es de este módulo, para que no haya dos sitios donde tocar lo mismo.
 *
 * Las filas que ya tienen pantalla enlazan a ella; el resto se pintan
 * atenuadas. Es preferible que se vea qué falta a fingir un destino.
 */
const CARDS_CATALOGO: SettingsCard[] = [
  {
    id: "planes",
    icon: "Layers",
    color: "#a78bfa",
    title: "Planes Patrimoniales",
    description: "Administra el catálogo de planes, su metodología y sus componentes.",
    links: [
      { id: "p1", label: "Catálogo de planes", href: "/soluciones/planes-patrimoniales" },
      { id: "p2", label: "Plantillas de plan" },
      { id: "p3", label: "Pasos de la metodología" },
    ],
  },
  {
    id: "componentes",
    icon: "Box",
    color: "#3b82f6",
    title: "Componentes",
    description: "Gestiona los componentes modulares y sus categorías.",
    links: [
      { id: "c1", label: "Catálogo de componentes", href: "/soluciones/componentes" },
      { id: "c2", label: "Categorías de componentes" },
      { id: "c3", label: "Tipos de componente" },
    ],
  },
  {
    id: "rutas",
    icon: "Route",
    color: "#22c55e",
    title: "Rutas y Casos de Uso",
    description: "Define los recorridos de cliente y las situaciones que atienden.",
    links: [
      { id: "r1", label: "Rutas de cliente", href: "/soluciones/rutas-de-cliente" },
      { id: "r2", label: "Casos de uso", href: "/soluciones/casos-de-uso" },
      { id: "r3", label: "Segmentos de cliente" },
    ],
  },
  {
    id: "biblioteca",
    icon: "BookOpen",
    color: "#e0a836",
    title: "Biblioteca",
    description: "Configura los tipos de recurso y su clasificación.",
    links: [
      { id: "b1", label: "Recursos de la biblioteca", href: "/soluciones/biblioteca" },
      { id: "b2", label: "Tipos de recurso" },
      { id: "b3", label: "Permisos de descarga" },
    ],
  },
];

const CARDS_HERRAMIENTAS: SettingsCard[] = [
  {
    id: "calculadora",
    icon: "Calculator",
    color: "#06b6d4",
    title: "Calculadora",
    description: "Revisa los supuestos del modelo de cálculo y los perfiles de cliente.",
    links: [
      { id: "cal1", label: "Supuestos del modelo", href: "/soluciones/calculadora" },
      { id: "cal2", label: "Perfiles de cliente" },
      { id: "cal3", label: "Tarifas de la aseguradora" },
    ],
  },
  {
    id: "comparador",
    icon: "Scale",
    color: "#f97316",
    title: "Comparador",
    description: "Ajusta qué atributos se comparan y cómo se elige la mejor opción.",
    links: [
      { id: "com1", label: "Abrir el comparador", href: "/soluciones/comparador" },
      { id: "com2", label: "Atributos comparables" },
      { id: "com3", label: "Criterio de recomendación" },
    ],
  },
  {
    id: "analitica",
    icon: "LineChart",
    color: "#f472b6",
    title: "Analítica",
    description: "Personaliza los indicadores y las cohortes del módulo.",
    links: [
      { id: "a1", label: "Ver la analítica", href: "/soluciones/analitica" },
      { id: "a2", label: "Indicadores clave" },
      { id: "a3", label: "Definición de cohortes" },
    ],
  },
];

export function ConfiguracionSolucionesView() {
  const solutions = useContent<Solution>(SOL_COLLECTIONS.solutions);
  const components = useContent<SolComponent>(SOL_COLLECTIONS.components);
  const routes = useContent<SolRoute>(SOL_COLLECTIONS.routes);
  const useCases = useContent<SolUseCase>(SOL_COLLECTIONS.useCases);
  const resources = useContent<SolResource>(SOL_COLLECTIONS.resources);

  const { blocks, addBlock, updateBlock, removeBlock } = usePageConfig("/soluciones/configuracion");
  const composer = useBlockComposer(addBlock);

  const loading = solutions.loading || components.loading || routes.loading || useCases.loading || resources.loading;

  /** Cuántos componentes hay en cada categoría del catálogo. */
  const categorias = useMemo(
    () =>
      COMPONENT_CATEGORIES.map((cat) => {
        const cuantos = components.items.filter((c) => c.category === cat).length;
        return {
          id: cat,
          label: cat,
          icon: "Box",
          value: `${cuantos} ${cuantos === 1 ? "componente" : "componentes"}`,
          percent: share(cuantos, components.items.length),
        };
      }).filter((c) => !c.value.startsWith("0 ")),
    [components.items]
  );

  const tipos = useMemo(
    () =>
      RESOURCE_KINDS.map((k) => {
        const cuantos = resources.items.filter((r) => r.kind === k).length;
        return {
          id: k,
          label: k,
          icon: "BookOpen",
          value: `${cuantos} ${cuantos === 1 ? "recurso" : "recursos"}`,
          percent: share(cuantos, resources.items.length),
        };
      }).filter((t) => !t.value.startsWith("0 ")),
    [resources.items]
  );

  const sidePanel = (
    <>
      <BlockFrame title="Acciones rápidas" icon="Zap">
        <QuickActionGrid
          layout="list"
          columns={1}
          actions={[
            { id: "planes", icon: "Layers", label: "Planes patrimoniales", href: "/soluciones/planes-patrimoniales" },
            { id: "comp", icon: "Box", label: "Componentes", href: "/soluciones/componentes" },
            { id: "calc", icon: "Calculator", label: "Calculadora", href: "/soluciones/calculadora" },
            { id: "global", icon: "Settings", label: "Configuración de la plataforma", href: "/configuracion/general" },
          ]}
        />
      </BlockFrame>

      <BlockFrame title="Contenido del módulo" icon="Info">
        <InfoCard
          rows={[
            { label: "Páginas construidas", value: "10 de 10" },
            { label: "Colecciones de datos", value: String(Object.keys(SOL_COLLECTIONS).length) },
            { label: "Planes patrimoniales", value: String(solutions.items.length) },
            { label: "Componentes", value: String(components.items.length) },
            { label: "Rutas de cliente", value: String(routes.items.length) },
            { label: "Casos de uso", value: String(useCases.items.length) },
            { label: "Recursos", value: String(resources.items.length) },
          ]}
        />
      </BlockFrame>

      <BlockFrame title="Componentes por categoría" icon="Tags">
        <KpiProgressList rows={categorias} />
      </BlockFrame>

      <BlockFrame title="Recursos por tipo" icon="Library">
        <KpiProgressList rows={tipos} />
      </BlockFrame>
    </>
  );

  return (
    <PageShell
      title="Configuración de Soluciones"
      description="Administra los catálogos y las herramientas propias del módulo."
      icon="Settings"
      starrable={false}
      sidePanel={sidePanel}
      blocks={{ items: blocks, onUpdate: updateBlock, onDelete: removeBlock, onAdd: composer.openFor }}
      headerActions={
        <Button variant="outline" size="sm" className="border-white/12 bg-white/[0.03] text-white/70 hover:bg-white/[0.06]">
          <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
          Restaurar por defecto
        </Button>
      }
    >
      {loading ? (
        <div className="surface-card">
          <LoadingState />
        </div>
      ) : (
        <>
          <BlockFrame title="Catálogos del módulo" icon="Library">
            <SettingsCardGrid cards={CARDS_CATALOGO} />
          </BlockFrame>

          <BlockFrame title="Herramientas y analítica" icon="SlidersHorizontal">
            <SettingsCardGrid cards={CARDS_HERRAMIENTAS} />
          </BlockFrame>

          <div className="surface-card flex flex-wrap items-center gap-3 px-4 py-3.5">
            <Info className="h-4 w-4 flex-shrink-0 text-white/35" />
            <p className="min-w-0 flex-1 text-sm text-white/55">
              Los ajustes de usuarios, roles, integraciones y seguridad son de toda la plataforma y viven en{" "}
              <span className="text-white/75">Configuración</span>, al final del menú. Aquí solo está lo propio de
              Soluciones.
            </p>
          </div>
        </>
      )}

      <AddBlockDialog {...composer.dialogProps} />
    </PageShell>
  );
}
