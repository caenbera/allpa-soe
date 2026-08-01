"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Building2, Eye, KeyRound, ShieldAlert, ShieldCheck, Clock3 } from "lucide-react";
import { firebaseReady } from "@/lib/firebase";
import { useAuthStore } from "@/store/auth";
import { listAllCompanies, requestSuperadminAccess } from "@/lib/services/companies";
import type { Company } from "@/lib/types";
import { Button } from "@/components/ui/button";

const DEMO_COMPANIES: Company[] = [
  {
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
  {
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
  {
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
];

export default function EmpresasPage() {
  const { user } = useAuthStore();
  const [companies, setCompanies] = useState<Company[]>(firebaseReady ? [] : DEMO_COMPANIES);
  const [loading, setLoading] = useState(firebaseReady);

  useEffect(() => {
    if (!firebaseReady) return;
    listAllCompanies()
      .then(setCompanies)
      .finally(() => setLoading(false));
  }, []);

  const handleRequestAccess = async (company: Company) => {
    if (!firebaseReady || !user) {
      toast.info("Solicitud simulada (modo demo). Con Firebase conectado, esto notifica al admin de la empresa.");
      return;
    }
    try {
      await requestSuperadminAccess(company.id, user.uid);
      toast.success(`Solicitud enviada al administrador de ${company.name}.`);
    } catch {
      toast.error("No se pudo enviar la solicitud.");
    }
  };

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 lg:px-8">
      <div className="mb-6 flex items-center gap-2.5">
        <Building2 className="h-6 w-6 text-[#eec469]" />
        <h1 className="font-serif text-2xl font-semibold text-[#f3ecd9] sm:text-3xl">Empresas</h1>
      </div>
      <p className="mb-6 max-w-2xl text-sm text-white/50">
        Puedes ver el comportamiento general de la plataforma en cada empresa. Los datos internos permanecen privados
        hasta que el administrador de esa empresa te otorgue acceso explícito.
      </p>

      <div className="surface-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-[11px] uppercase tracking-wide text-white/35">
              <th className="px-4 py-3 font-medium">Empresa</th>
              <th className="px-4 py-3 font-medium">Plan</th>
              <th className="px-4 py-3 font-medium">Creada</th>
              <th className="px-4 py-3 font-medium">Acceso a datos internos</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {companies.map((c) => (
              <tr key={c.id} className="border-b border-white/[0.06] last:border-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#f5da93] to-[#a9760f] text-[11px] font-bold text-[#241a05]">
                      {c.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-white/85">{c.name}</p>
                      <p className="truncate text-xs text-white/40">/{c.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-white/65 capitalize">{c.plan}</td>
                <td className="px-4 py-3 text-white/50">{new Date(c.createdAt).toLocaleDateString("es")}</td>
                <td className="px-4 py-3">
                  {c.superadminAccessGrant.granted ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/10 px-2.5 py-1 text-xs font-medium text-emerald-300">
                      <ShieldCheck className="h-3.5 w-3.5" /> Otorgado
                    </span>
                  ) : c.superadminAccessRequest ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eec469]/10 px-2.5 py-1 text-xs font-medium text-[#eec469]">
                      <Clock3 className="h-3.5 w-3.5" /> Solicitud enviada
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium text-white/60">
                      <ShieldAlert className="h-3.5 w-3.5" /> Sin acceso
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    {!c.superadminAccessGrant.granted && !c.superadminAccessRequest && (
                      <Button variant="outline" size="sm" onClick={() => handleRequestAccess(c)} className="border-white/12 bg-white/[0.03] text-white/70">
                        <KeyRound className="mr-1.5 h-3.5 w-3.5" />
                        Solicitar acceso
                      </Button>
                    )}
                    <Link href={`/empresas/${c.id}`}>
                      <Button size="sm" variant="outline" className="border-white/12 bg-white/[0.03] text-white/70">
                        <Eye className="mr-1.5 h-3.5 w-3.5" />
                        Ver comportamiento
                      </Button>
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && companies.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-white/35">
                  Todavía no hay empresas registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
