"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { StatCard } from "@/components/page-blocks/PageShell";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const firstName = (user?.displayName ?? "").split(" ")[0];

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 lg:px-8">
      <p className="text-sm font-medium text-[#eec469]">Bienvenido{firstName ? `, ${firstName}` : ""}</p>
      <h1 className="mt-1 font-serif text-3xl font-semibold text-[#f3ecd9]">Panel general</h1>
      <p className="mt-2 max-w-xl text-sm text-white/50">
        Este es tu resumen ejecutivo. A medida que actives más bloques, aquí aparecerán los indicadores clave de cada área.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Bloques activos" value="1" />
        <StatCard label="Páginas construidas" value="5" />
        <StatCard label="Tareas abiertas" value="18" />
        <StatCard label="Miembros del equipo" value="1" />
      </div>

      <div className="mt-8">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-white/35">Empieza por aquí</p>
        <Link
          href="/marketing/sitio-web/homepage"
          className="surface-card flex items-center justify-between px-5 py-4 transition-colors hover:border-[var(--allpa-gold-400)]/40"
        >
          <div>
            <p className="font-semibold text-[#f3ecd9]">Marketing → Homepage</p>
            <p className="mt-0.5 text-sm text-white/45">Revisa el plan de la página principal de tu sitio web.</p>
          </div>
          <ArrowRight className="h-4 w-4 flex-shrink-0 text-white/30" />
        </Link>
      </div>
    </div>
  );
}
