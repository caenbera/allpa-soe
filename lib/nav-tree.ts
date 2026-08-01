import { defaultSidebarBlocks, type DefaultBlockConfig, type DefaultPageConfig } from "./default-sidebar";
import type { SidebarBlock, SidebarPage } from "./types";

function slugifyName(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export interface NavNode {
  key: string;
  name: string;
  icon: string;
  /** null = solo agrupador (no navegable), string = ruta destino */
  href: string | null;
  built: boolean;
  children: NavNode[];
}

function pageToNode(page: DefaultPageConfig, basePath: string): NavNode {
  const path = `${basePath}/${page.slug}`;
  const children = (page.children ?? []).map((c) => pageToNode(c, path));
  return {
    key: path,
    name: page.name,
    icon: page.icon,
    href: children.length ? null : path,
    built: page.built,
    children,
  };
}

function blockToNode(block: DefaultBlockConfig): NavNode {
  const basePath = `/${block.slug}`;
  const children = block.pages.map((p) => pageToNode(p, basePath));
  return {
    key: block.slug,
    name: block.name,
    icon: block.icon,
    href: children.length ? null : basePath,
    built: children.length > 0,
    children,
  };
}

export const navTree: NavNode[] = defaultSidebarBlocks.map(blockToNode);

/**
 * Convierte los bloques/páginas personalizados creados en Firestore (los que
 * el admin agrega desde el sidebar) en nodos de navegación, para anexarlos
 * después de los bloques por defecto. Sus páginas todavía no tienen una
 * vista propia implementada, así que enlazan al estado "en camino" del
 * catch-all hasta que se construya su contenido.
 */
export function customBlocksToNavNodes(blocks: SidebarBlock[], pagesByBlock: Record<string, SidebarPage[]>): NavNode[] {
  return blocks.map((block) => {
    const basePath = `/${slugifyName(block.name)}-${block.id.slice(0, 6)}`;
    const pages = pagesByBlock[block.id] ?? [];
    const children: NavNode[] = pages
      .filter((p) => !p.parentPageId)
      .map((p) => ({
        key: `${basePath}/${p.slug}`,
        name: p.name,
        icon: p.icon,
        href: `${basePath}/${p.slug}`,
        built: false,
        children: [],
      }));
    return {
      key: block.id,
      name: block.name,
      icon: block.icon,
      href: children.length ? null : basePath,
      built: false,
      children,
    };
  });
}

/** Devuelve las keys de todos los ancestros (incluida ella misma) de un nodo cuyo href coincide con `pathname`. */
export function findActivePath(nodes: NavNode[], pathname: string, trail: string[] = []): string[] | null {
  for (const node of nodes) {
    const nextTrail = [...trail, node.key];
    if (node.href === pathname) return nextTrail;
    if (node.children.length) {
      const found = findActivePath(node.children, pathname, nextTrail);
      if (found) return found;
    }
  }
  return null;
}

export interface BreadcrumbItem {
  name: string;
  href: string | null;
}

/** Reconstruye el breadcrumb (nombres legibles) para la ruta activa. */
export function buildBreadcrumb(nodes: NavNode[], pathname: string, trail: BreadcrumbItem[] = []): BreadcrumbItem[] | null {
  for (const node of nodes) {
    const nextTrail = [...trail, { name: node.name, href: node.href }];
    if (node.href === pathname) return nextTrail;
    if (node.children.length) {
      const found = buildBreadcrumb(node.children, pathname, nextTrail);
      if (found) return found;
    }
  }
  return null;
}
