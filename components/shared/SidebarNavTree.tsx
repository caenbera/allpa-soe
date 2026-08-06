"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Clock } from "lucide-react";
import { resolveLucideIcon } from "@/lib/lucide-icon";
import type { NavNode } from "@/lib/nav-tree";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

function ComingSoonLink({ node, depth }: { node: NavNode; depth: number }) {
  return (
    <div
      className="flex cursor-not-allowed items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm text-white/30"
      style={{ paddingLeft: `${depth * 14 + 10}px` }}
      title="Próximamente"
    >
      <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-white/20" />
      <span className="truncate">{node.name}</span>
      <Clock className="ml-auto h-3 w-3 flex-shrink-0" />
    </div>
  );
}

function NavLeaf({ node, depth }: { node: NavNode; depth: number }) {
  const pathname = usePathname();
  const active = pathname === node.href;

  if (!node.built) return <ComingSoonLink node={node} depth={depth} />;

  return (
    <Link
      href={node.href ?? "#"}
      className={`group flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm transition-colors ${
        active
          ? "bg-[var(--sidebar-accent)] font-semibold text-[var(--sidebar-accent-foreground)]"
          : "text-white/60 hover:bg-white/5 hover:text-white/90"
      }`}
      style={{ paddingLeft: `${depth * 14 + 10}px` }}
    >
      <span
        className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${
          active ? "bg-[var(--sidebar-primary)]" : "bg-white/25 group-hover:bg-white/50"
        }`}
      />
      <span className="truncate">{node.name}</span>
    </Link>
  );
}

function NavGroup({ node, depth }: { node: NavNode; depth: number }) {
  // Todos los desplegables arrancan cerrados, también el del módulo en el que
  // estás: el menú es largo y se prefiere entrar a una lista corta y abrir lo
  // que haga falta, antes que encontrarla ya desplegada.
  const [open, setOpen] = useState(false);
  const Icon = depth === 0 ? resolveLucideIcon(node.icon) : null;

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors ${
          depth === 0
            ? open
              ? "bg-[var(--sidebar-accent)] text-[var(--sidebar-accent-foreground)]"
              : "text-white/75 hover:bg-white/5 hover:text-white/95"
            : "text-white/55 hover:text-white/85"
        }`}
        style={{ paddingLeft: `${depth * 14 + 10}px` }}
      >
        {/* eslint-disable-next-line react-hooks/static-components -- selecciona un icono existente por nombre, no crea un componente nuevo */}
        {Icon && <Icon className="h-4 w-4 flex-shrink-0" />}
        <span className="truncate">{node.name}</span>
        <ChevronRight className={`ml-auto h-3.5 w-3.5 flex-shrink-0 transition-transform ${open ? "rotate-90" : ""}`} />
      </button>
      {open && (
        <div className="mt-0.5 space-y-0.5">
          {node.children.map((child) => (
            <NavNodeRenderer key={child.key} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function NavNodeRenderer({ node, depth }: { node: NavNode; depth: number }) {
  if (node.children.length > 0) {
    return <NavGroup node={node} depth={depth} />;
  }
  return <NavLeaf node={node} depth={depth} />;
}

export function CollapsedNavIcons({ nodes, onExpand }: { nodes: NavNode[]; onExpand: () => void }) {
  return (
    <div className="flex flex-col items-center gap-1.5 py-2">
      {nodes.map((node) => {
        const Icon = resolveLucideIcon(node.icon);
        return (
          <Tooltip key={node.key}>
            <TooltipTrigger
              onClick={onExpand}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-white/60 transition-colors hover:bg-white/5 hover:text-[var(--sidebar-primary)]"
            >
              <Icon className="h-[18px] w-[18px]" />
            </TooltipTrigger>
            <TooltipContent side="right">{node.name}</TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}
