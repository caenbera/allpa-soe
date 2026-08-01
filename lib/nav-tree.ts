import { defaultSidebarBlocks, type DefaultBlockConfig, type DefaultPageConfig } from "./default-sidebar";

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
