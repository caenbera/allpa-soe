"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, LayoutDashboard, LogOut, ShieldCheck } from "lucide-react";
import { brandLogos } from "@/lib/brand";
import { useAuthStore } from "@/store/auth";
import { logout } from "@/lib/auth-actions";
import { firebaseReady } from "@/lib/firebase";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NAV = [{ href: "/empresas", label: "Empresas", icon: Building2 }];

export function SuperadminSidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const displayName = user?.displayName ?? (firebaseReady ? "Cuenta" : "Modo demo");

  return (
    <aside className="sticky top-0 hidden h-screen w-64 flex-shrink-0 flex-col border-r border-[var(--sidebar-border)] bg-[var(--sidebar)] text-[var(--sidebar-foreground)] lg:flex">
      <div className="flex items-center gap-3 border-b border-[var(--sidebar-border)] px-4 py-4">
        <Image src={brandLogos.mark} alt="Allpa SOE" width={132} height={32} className="h-8 w-auto object-contain" priority />
      </div>

      <div className="flex items-center gap-2 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[#eec469]">
        <ShieldCheck className="h-3.5 w-3.5" />
        Panel del super administrador
      </div>

      <nav className="flex-1 space-y-0.5 px-2.5">
        {NAV.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors ${
                active ? "bg-[var(--sidebar-accent)] text-[var(--sidebar-accent-foreground)]" : "text-white/75 hover:bg-white/5 hover:text-white/95"
              }`}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}

        <div className="my-2 h-px bg-[var(--sidebar-border)]" />

        <Link
          href="/dashboard"
          className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium text-[var(--sidebar-primary)] transition-colors hover:bg-white/5"
        >
          <LayoutDashboard className="h-4 w-4 flex-shrink-0" />
          Ver mi panel de empresa
        </Link>
      </nav>

      <div className="border-t border-[var(--sidebar-border)] p-3">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex w-full items-center gap-2.5 rounded-xl px-2 py-2 transition-colors hover:bg-white/5">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#f5da93] to-[#a9760f] text-xs font-bold text-[#241a05]">
              {displayName.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1 text-left">
              <p className="truncate text-sm font-semibold text-[#f3ecd9]">{displayName}</p>
              <p className="truncate text-xs text-white/45">Super administrador</p>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => logout().catch(() => undefined)} className="text-red-500 focus:text-red-500">
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
