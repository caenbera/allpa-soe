"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { firebaseReady } from "@/lib/firebase";
import { SuperadminSidebar } from "@/components/superadmin/SuperadminSidebar";

export default function SuperadminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, role, loading } = useAuthStore();

  // Igual que el dashboard de empresa: sin Firebase configurado se permite
  // el modo demo para poder construir y previsualizar el panel.
  const allowed = !firebaseReady || (Boolean(user) && role === "superadmin");

  useEffect(() => {
    if (loading) return;
    if (!user && firebaseReady) router.replace("/login");
    else if (firebaseReady && role && role !== "superadmin") router.replace("/dashboard");
  }, [loading, user, role, router]);

  if (loading || !allowed) {
    return <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">Cargando…</div>;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <SuperadminSidebar />
      <main className="app-shell-texture flex-1">{children}</main>
    </div>
  );
}
