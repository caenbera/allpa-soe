"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, ChevronRight, Menu, Search } from "lucide-react";
import { useUIStore } from "@/store/ui";
import { navTree, buildBreadcrumb } from "@/lib/nav-tree";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuthStore } from "@/store/auth";

export function Topbar() {
  const pathname = usePathname();
  const { setMobileSidebarOpen } = useUIStore();
  const { user } = useAuthStore();
  const crumbs = pathname === "/dashboard" ? [{ name: "Dashboard", href: null }] : buildBreadcrumb(navTree, pathname) ?? [{ name: "Inicio", href: null }];

  const initials = (user?.displayName ?? "AS").slice(0, 2).toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex items-center gap-4 border-b border-border bg-background/80 px-4 py-3 backdrop-blur lg:px-6">
      <button
        type="button"
        onClick={() => setMobileSidebarOpen(true)}
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent lg:hidden"
        aria-label="Abrir menú"
      >
        <Menu className="h-5 w-5" />
      </button>

      <nav className="hidden min-w-0 flex-1 items-center gap-1.5 text-sm md:flex">
        {crumbs.map((c, i) => (
          <span key={`${c.name}-${i}`} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />}
            {c.href && i < crumbs.length - 1 ? (
              <Link href={c.href} className="truncate text-muted-foreground hover:text-foreground">
                {c.name}
              </Link>
            ) : (
              <span className={`truncate ${i === crumbs.length - 1 ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{c.name}</span>
            )}
          </span>
        ))}
      </nav>

      <div className="relative ml-auto hidden max-w-xs flex-1 md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Buscar en Allpa SOE..." className="h-9 border-border/70 bg-muted/40 pl-9" />
      </div>

      <button
        type="button"
        className="relative flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent"
        aria-label="Notificaciones"
      >
        <Bell className="h-[18px] w-[18px]" />
        <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[var(--allpa-gold-400)]" />
      </button>

      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarFallback className="bg-gradient-to-br from-[#f5da93] to-[#a9760f] text-[11px] font-bold text-[#241a05]">
          {initials}
        </AvatarFallback>
      </Avatar>
    </header>
  );
}
