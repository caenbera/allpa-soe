"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Lock, Activity, Users, Layers, Clock3 } from "lucide-react";
import { firebaseReady } from "@/lib/firebase";
import { getCompany } from "@/lib/services/companies";
import type { Company } from "@/lib/types";
import { StatCard } from "@/components/page-blocks/PageShell";

const DEMO_COMPANIES: Record<string, Company> = {
  "demo-1": {
    id: "demo-1",
    name: "Empresa Demo",
    slug: "empresa-demo",
    logoURL: null,
    plan: "pro",
    ownerUid: "demo-owner-1",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 40,
    superadminAccessGrant: { granted: true, grantedAt: Date.now() - 1000 * 60 * 60 * 24 * 2, grantedBy: "demo-owner-1" },
    superadminAccessRequest: null,
  },
  "demo-2": {
    id: "demo-2",
    name: "Bermeo Insurance",
    slug: "bermeo-insurance",
    logoURL: null,
    plan: "free",
    ownerUid: "demo-owner-2",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 12,
    superadminAccessGrant: { granted: false, grantedAt: null, grantedBy: null },
    superadminAccessRequest: { requestedAt: Date.now() - 1000 * 60 * 60 * 5, requestedBy: "superadmin-demo" },
  },
  "demo-3": {
    id: "demo-3",
    name: "Orella Cultivos",
    slug: "orella-cultivos",
    logoURL: null,
    plan: "free",
    ownerUid: "demo-owner-3",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
    superadminAccessGrant: { granted: false, grantedAt: null, grantedBy: null },
    superadminAccessRequest: null,
  },
};

export default function CompanyBehaviorPage({ params }: { params: Promise<{ companyId: string }> }) {
  const { companyId } = use(params);
  const [company, setCompany] = useState<Company | null>(firebaseReady ? null : (DEMO_COMPANIES[companyId] ?? null));

  useEffect(() => {
    if (!firebaseReady) return;
    getCompany(companyId).then(setCompany);
  }, [companyId]);

  if (!company) {
    return <div className="px-4 py-8 text-sm text-white/40 lg:px-8">Cargando…</div>;
  }

  const granted = company.superadminAccessGrant.granted;

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-8 lg:px-8">
      <Link href="/empresas" className="mb-6 inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white/80">
        <ArrowLeft className="h-4 w-4" /> Volver a empresas
      </Link>

      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#f5da93] to-[#a9760f] text-sm font-bold text-[#241a05]">
          {company.name.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <h1 className="font-serif text-2xl font-semibold text-[#f3ecd9]">{company.name}</h1>
          <p className="text-sm text-white/45">
            /{company.slug} · Plan {company.plan} · Creada el {new Date(company.createdAt).toLocaleDateString("es")}
          </p>
        </div>
      </div>

      {!granted && (
        <div className="surface-card flex flex-col items-center gap-3 px-6 py-14 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white/50">
            <Lock className="h-6 w-6" />
          </div>
          <h2 className="font-serif text-lg font-semibold text-[#f3ecd9]">Acceso restringido</h2>
          <p className="max-w-md text-sm text-white/45">
            No tienes permiso para ver los datos internos de esta empresa. Un administrador de {company.name} debe
            otorgarte acceso explícitamente
            {company.superadminAccessRequest ? " — ya se le notificó tu solicitud." : "."}
          </p>
        </div>
      )}

      {granted && (
        <div className="space-y-5">
          <div className="rounded-lg border border-emerald-400/20 bg-emerald-400/5 px-4 py-2.5 text-sm text-emerald-300">
            <ShieldCheck className="mr-1.5 inline h-4 w-4" />
            Acceso otorgado por el administrador de la empresa. Solo ves indicadores de comportamiento, no el
            contenido interno detallado.
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label="Bloques activos" value="1" />
            <StatCard label="Páginas construidas" value="5" />
            <StatCard label="Miembros" value="3" />
            <StatCard label="Última actividad" value="hace 2h" />
          </div>

          <div className="surface-card p-5">
            <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#f3ecd9]">
              <Activity className="h-4 w-4 text-[#eec469]" />
              Actividad reciente
            </p>
            <ul className="space-y-2.5 text-sm text-white/60">
              <li className="flex items-center gap-2">
                <Clock3 className="h-3.5 w-3.5 flex-shrink-0 text-white/30" /> Se completó una tarea en Marketing → Homepage — hace 2h
              </li>
              <li className="flex items-center gap-2">
                <Users className="h-3.5 w-3.5 flex-shrink-0 text-white/30" /> Nuevo miembro se unió al equipo — hace 1 día
              </li>
              <li className="flex items-center gap-2">
                <Layers className="h-3.5 w-3.5 flex-shrink-0 text-white/30" /> Se creó el bloque &quot;Redes Sociales&quot; — hace 3 días
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
