"use client";

import { useState } from "react";
import { Search, Filter, Download, UserPlus, Mail, Phone, Globe, ArrowLeft } from "lucide-react";
import { PageShell, StatCard } from "@/components/page-blocks/PageShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/page-blocks/StatusBadge";
import type { SectionStatus } from "@/lib/types";

interface Guest {
  id: string;
  name: string;
  role: string;
  area: string;
  priority: "Alta" | "Media" | "Baja";
  status: SectionStatus;
  nextStep: string;
  eta: string;
  bio: string;
  expertise: string[];
}

const GUESTS: Guest[] = [
  { id: "1", name: "Carla Gómez", role: "Especialista en operaciones", area: "Escalamiento", priority: "Alta", status: "en_progreso", nextStep: "Enviar propuesta", eta: "20 may", bio: "Más de 12 años ayudando a empresas a ordenar su operación mientras crecen.", expertise: ["Operaciones", "Procesos", "Liderazgo"] },
  { id: "2", name: "Marco Iturri", role: "Fundador de una scale-up", area: "Cultura organizacional", priority: "Media", status: "pendiente", nextStep: "Enviar email", eta: "25 may", bio: "Construyó un equipo de 80 personas en tres años sin perder la cultura fundacional.", expertise: ["Cultura", "Equipos"] },
  { id: "3", name: "Renata Solís", role: "Consultora financiera", area: "Finanzas para pymes", priority: "Alta", status: "completado", nextStep: "Coordinar grabación", eta: "5 jun", expertise: ["Finanzas", "Pymes"], bio: "Ayuda a negocios en crecimiento a mantener sanas sus finanzas." },
  { id: "4", name: "Dr. Iván Prado", role: "Asesor de gobierno corporativo", area: "Gobernanza", priority: "Media", status: "en_progreso", nextStep: "Llamada de seguimiento", eta: "7 jun", expertise: ["Gobernanza", "Compliance"], bio: "Especialista en estructuras de gobierno para empresas familiares." },
];

export function InvitadosView() {
  const [selected, setSelected] = useState<Guest>(GUESTS[0]);
  const [mobileDetail, setMobileDetail] = useState(false);

  return (
    <PageShell title="Invitados" description="Gestiona prospectos, confirmaciones y todo el proceso de invitados para el podcast." status="en_progreso">
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Total prospectos" value="42" />
        <StatCard label="En conversación" value="12" />
        <StatCard label="Pendientes" value="6" />
        <StatCard label="Confirmados" value="8" />
        <StatCard label="Grabados" value="5" />
        <StatCard label="Publicados" value="7" />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_360px]">
        <div className={`surface-card p-4 ${mobileDetail ? "hidden xl:block" : ""}`}>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Buscar invitado..." className="h-9 bg-muted/40 pl-9" />
            </div>
            <Button variant="outline" size="sm" className="border-white/12 bg-white/[0.03] text-white/70">
              <Filter className="mr-1.5 h-3.5 w-3.5" /> Filtros
            </Button>
            <Button variant="outline" size="sm" className="border-white/12 bg-white/[0.03] text-white/70">
              <Download className="mr-1.5 h-3.5 w-3.5" /> Exportar
            </Button>
            <Button size="sm" className="border-0 bg-gradient-to-b from-[#f5da93] to-[#c98f1f] font-semibold text-[#241a05]">
              <UserPlus className="mr-1.5 h-3.5 w-3.5" /> Nuevo Invitado
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-[11px] uppercase tracking-wide text-white/35">
                  <th className="py-2 pr-3 font-medium">Invitado</th>
                  <th className="py-2 pr-3 font-medium">Estado</th>
                  <th className="py-2 pr-3 font-medium">Área / Tema</th>
                  <th className="py-2 pr-3 font-medium">Próximo paso</th>
                  <th className="py-2 pr-3 font-medium">Fecha estimada</th>
                </tr>
              </thead>
              <tbody>
                {GUESTS.map((g) => (
                  <tr
                    key={g.id}
                    onClick={() => {
                      setSelected(g);
                      setMobileDetail(true);
                    }}
                    className={`cursor-pointer border-b border-white/[0.06] last:border-0 hover:bg-white/[0.03] ${
                      selected.id === g.id ? "bg-[var(--allpa-gold-400)]/[0.06]" : ""
                    }`}
                  >
                    <td className="py-2.5 pr-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#f5da93] to-[#a9760f] text-[11px] font-bold text-[#241a05]">
                          {g.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-white/85">{g.name}</p>
                          <p className="truncate text-xs text-white/40">{g.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 pr-3">
                      <StatusBadge status={g.status} interactive={false} />
                    </td>
                    <td className="py-2.5 pr-3 text-white/65">{g.area}</td>
                    <td className="py-2.5 pr-3 text-white/65">{g.nextStep}</td>
                    <td className="py-2.5 pr-3 text-white/50">{g.eta}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className={`space-y-4 ${mobileDetail ? "" : "hidden xl:block"}`}>
          <button
            type="button"
            onClick={() => setMobileDetail(false)}
            className="flex items-center gap-1.5 text-sm text-white/50 xl:hidden"
          >
            <ArrowLeft className="h-4 w-4" /> Volver a la lista
          </button>

          <div className="surface-card p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#f5da93] to-[#a9760f] text-base font-bold text-[#241a05]">
                {selected.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold text-[#f3ecd9]">{selected.name}</p>
                <p className="truncate text-sm text-white/45">{selected.role}</p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="icon" className="h-8 w-8 border-white/12 bg-white/[0.03]"><Mail className="h-3.5 w-3.5" /></Button>
              <Button variant="outline" size="icon" className="h-8 w-8 border-white/12 bg-white/[0.03]"><Phone className="h-3.5 w-3.5" /></Button>
              <Button variant="outline" size="icon" className="h-8 w-8 border-white/12 bg-white/[0.03]"><Globe className="h-3.5 w-3.5" /></Button>
            </div>
          </div>

          <div className="surface-card p-5">
            <p className="mb-2 text-sm font-semibold text-[#f3ecd9]">Sobre el invitado</p>
            <p className="text-sm leading-relaxed text-white/60">{selected.bio}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {selected.expertise.map((tag) => (
                <span key={tag} className="rounded-full bg-[var(--allpa-gold-400)]/10 px-2.5 py-1 text-xs text-[#eec469]">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="surface-card p-5">
            <p className="mb-3 text-sm font-semibold text-[#f3ecd9]">Estado y logística</p>
            <dl className="grid grid-cols-2 gap-y-2.5 text-sm">
              <dt className="text-white/40">Estado</dt>
              <dd className="text-right"><StatusBadge status={selected.status} interactive={false} /></dd>
              <dt className="text-white/40">Prioridad</dt>
              <dd className="text-right text-white/80">{selected.priority}</dd>
              <dt className="text-white/40">Próximo paso</dt>
              <dd className="text-right text-white/80">{selected.nextStep}</dd>
              <dt className="text-white/40">Fecha estimada</dt>
              <dd className="text-right text-white/80">{selected.eta}</dd>
            </dl>
            <Button className="mt-4 w-full border-0 bg-gradient-to-b from-[#f5da93] to-[#c98f1f] font-semibold text-[#241a05]">
              Marcar como confirmado
            </Button>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
