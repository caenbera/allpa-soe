"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { firebaseReady } from "@/lib/firebase";
import { Sidebar } from "@/components/shared/Sidebar";
import { Topbar } from "@/components/shared/Topbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, role, loading } = useAuthStore();

  // Sin proyecto de Firebase configurado (desarrollo local) se permite
  // entrar en modo demo para poder construir y previsualizar el panel;
  // en producción, con Firebase listo, esto exige sesión iniciada.
  const allowed = !firebaseReady || Boolean(user);

  useEffect(() => {
    if (!loading && !allowed) router.replace("/login");
  }, [loading, allowed, router]);

  useEffect(() => {
    if (!loading && firebaseReady && role === "superadmin") router.replace("/superadmin");
  }, [loading, role, router]);

  if (loading || !allowed) {
    return <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">Cargando…</div>;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="app-shell-texture flex-1">{children}</main>
      </div>
    </div>
  );
}
