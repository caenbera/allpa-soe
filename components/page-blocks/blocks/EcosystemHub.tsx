import { resolveLucideIcon } from "@/lib/lucide-icon";

export interface EcosystemSpoke {
  id: string;
  label: string;
  sub: string;
  icon: string;
  color: string;
}

/**
 * Diagrama radial "de un episodio madre a múltiples activos": el podcast al
 * centro y los canales derivados alrededor, unidos por radios.
 *
 * Se dibuja con posicionamiento porcentual sobre un contenedor cuadrado, así
 * que se adapta al ancho del panel sin depender de una librería de gráficos.
 */
export function EcosystemHub({ center, spokes }: { center: { label: string; sub: string; icon: string }; spokes: EcosystemSpoke[] }) {
  const CenterIcon = resolveLucideIcon(center.icon);
  const radius = 38; // % desde el centro

  const positionOf = (index: number) => {
    // Se arranca arriba y se reparten en círculo.
    const angle = (index / spokes.length) * 2 * Math.PI - Math.PI / 2;
    return { left: 50 + radius * Math.cos(angle), top: 50 + radius * Math.sin(angle) };
  };

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[300px]">
      {/* Radios */}
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" aria-hidden="true">
        {spokes.map((spoke, i) => {
          const { left, top } = positionOf(i);
          return <line key={spoke.id} x1="50" y1="50" x2={left} y2={top} stroke="rgba(255,255,255,0.10)" strokeWidth="0.4" />;
        })}
        <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.4" strokeDasharray="1.5 1.5" />
      </svg>

      {/* Centro */}
      <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--allpa-gold-400)]/15 text-[var(--allpa-gold-300)] ring-1 ring-[var(--allpa-gold-400)]/40">
          {/* eslint-disable-next-line react-hooks/static-components -- selecciona un icono existente por nombre, no crea un componente nuevo */}
          <CenterIcon className="h-5 w-5" />
        </span>
        <span className="mt-1 text-center text-[10px] font-semibold leading-tight text-[#f3ecd9]">{center.label}</span>
        <span className="text-center text-[9px] leading-tight text-white/35">{center.sub}</span>
      </div>

      {/* Radios exteriores */}
      {spokes.map((spoke, i) => {
        const { left, top } = positionOf(i);
        const Icon = resolveLucideIcon(spoke.icon);
        return (
          <div
            key={spoke.id}
            className="absolute flex w-16 -translate-x-1/2 -translate-y-1/2 flex-col items-center"
            style={{ left: `${left}%`, top: `${top}%` }}
          >
            <span
              className="flex h-7 w-7 items-center justify-center rounded-lg"
              style={{ background: `${spoke.color}25`, color: spoke.color }}
            >
              <Icon className="h-3.5 w-3.5" />
            </span>
            <span className="mt-0.5 text-center text-[9px] font-medium leading-tight text-white/75">{spoke.label}</span>
            <span className="text-center text-[9px] leading-tight text-white/30">{spoke.sub}</span>
          </div>
        );
      })}
    </div>
  );
}
