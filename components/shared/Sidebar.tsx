"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, PanelLeftClose, PanelLeftOpen, Plus, LogOut, ChevronsUpDown } from "lucide-react";
import { useUIStore } from "@/store/ui";
import { useAuthStore } from "@/store/auth";
import { brandLogos } from "@/lib/brand";
import { navTree, findActivePath } from "@/lib/nav-tree";
import { NavNodeRenderer, CollapsedNavIcons } from "@/components/shared/SidebarNavTree";
import { logout } from "@/lib/auth-actions";
import { firebaseReady } from "@/lib/firebase";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebarCollapsed, mobileSidebarOpen, setMobileSidebarOpen } = useUIStore();
  const { user, role } = useAuthStore();
  const activeTrail = findActivePath(navTree, pathname) ?? [];

  const displayName = user?.displayName ?? (firebaseReady ? "Cuenta" : "Modo demo");
  const roleLabel = role === "superadmin" ? "Super administrador" : role === "member" ? "Miembro" : "Administrador";

  const handleNewBlock = () => toast.info("El constructor de bloques se habilita en el siguiente paso.");

  const content = (
    <div className={`flex h-full flex-col bg-[var(--sidebar)] text-[var(--sidebar-foreground)]`}>
      {/* Header */}
      <div className={`flex items-center gap-3 border-b border-[var(--sidebar-border)] px-4 py-4 ${sidebarCollapsed ? "justify-center px-2" : ""}`}>
        <Image
          src={sidebarCollapsed ? brandLogos.icon : brandLogos.mark}
          alt="Allpa SOE"
          width={sidebarCollapsed ? 32 : 132}
          height={32}
          className={sidebarCollapsed ? "h-8 w-8 object-contain" : "h-8 w-auto object-contain"}
          priority
        />
        {!sidebarCollapsed && (
          <button
            type="button"
            onClick={toggleSidebarCollapsed}
            className="ml-auto hidden h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-white/5 hover:text-white/80 lg:flex"
            aria-label="Colapsar sidebar"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        )}
      </div>

      {sidebarCollapsed && (
        <button
          type="button"
          onClick={toggleSidebarCollapsed}
          className="mx-auto mt-2 hidden h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-white/5 hover:text-white/80 lg:flex"
          aria-label="Expandir sidebar"
        >
          <PanelLeftOpen className="h-4 w-4" />
        </button>
      )}

      {/* Nav */}
      <div className="flex-1 overflow-y-auto px-2.5 py-3">
        {sidebarCollapsed ? (
          <div className="flex flex-col items-center gap-1">
            <Link
              href="/dashboard"
              className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
                pathname === "/dashboard" ? "bg-[var(--sidebar-accent)] text-[var(--sidebar-accent-foreground)]" : "text-white/60 hover:bg-white/5"
              }`}
            >
              <LayoutDashboard className="h-[18px] w-[18px]" />
            </Link>
            <CollapsedNavIcons nodes={navTree} onExpand={toggleSidebarCollapsed} />
          </div>
        ) : (
          <div className="space-y-3">
            <div className="space-y-0.5">
              <Link
                href="/dashboard"
                className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors ${
                  pathname === "/dashboard"
                    ? "bg-[var(--sidebar-accent)] text-[var(--sidebar-accent-foreground)]"
                    : "text-white/75 hover:bg-white/5 hover:text-white/95"
                }`}
              >
                <LayoutDashboard className="h-4 w-4 flex-shrink-0" />
                Dashboard
              </Link>
            </div>

            <div className="h-px bg-[var(--sidebar-border)]" />

            <div className="space-y-0.5">
              {navTree.map((node) => (
                <NavNodeRenderer key={node.key} node={node} depth={0} activeTrail={activeTrail} />
              ))}
            </div>

            {role !== "member" && (
              <button
                type="button"
                onClick={handleNewBlock}
                className="flex w-full items-center gap-2 rounded-lg border border-dashed border-white/15 px-2.5 py-2 text-sm text-white/45 transition-colors hover:border-[var(--sidebar-primary)]/50 hover:text-[var(--sidebar-primary)]"
              >
                <Plus className="h-4 w-4" />
                Nuevo bloque
              </button>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-[var(--sidebar-border)] p-3">
        <DropdownMenu>
          <DropdownMenuTrigger
            className={`flex w-full items-center gap-2.5 rounded-xl px-2 py-2 transition-colors hover:bg-white/5 ${
              sidebarCollapsed ? "justify-center" : ""
            }`}
          >
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#f5da93] to-[#a9760f] text-xs font-bold text-[#241a05]">
              {displayName.slice(0, 2).toUpperCase()}
            </div>
            {!sidebarCollapsed && (
              <>
                <div className="min-w-0 flex-1 text-left">
                  <p className="truncate text-sm font-semibold text-[#f3ecd9]">{displayName}</p>
                  <p className="truncate text-xs text-white/45">{roleLabel}</p>
                </div>
                <ChevronsUpDown className="h-4 w-4 flex-shrink-0 text-white/30" />
              </>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => logout().catch(() => undefined)} className="text-red-500 focus:text-red-500">
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside
        className={`sticky top-0 hidden h-screen flex-shrink-0 border-r border-[var(--sidebar-border)] transition-[width] duration-200 lg:block ${
          sidebarCollapsed ? "w-[72px]" : "w-64"
        }`}
      >
        {content}
      </aside>

      {/* Mobile drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileSidebarOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72">{content}</aside>
        </div>
      )}
    </>
  );
}
