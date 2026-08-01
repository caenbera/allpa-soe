/**
 * Fondo decorativo en degradado negro/dorado, usado mientras no hay
 * fotografía real de cliente (ver lib/brand.ts). Genera un patrón
 * distinto mediante `seed` para que cada slide/tarjeta se vea única.
 */
export function PlaceholderArt({ seed = 0, className = "" }: { seed?: number; className?: string }) {
  const hueShift = (seed * 37) % 40;

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at ${20 + hueShift}% 15%, rgba(238,196,105,0.35), transparent 55%),
            radial-gradient(circle at 85% 85%, rgba(167,139,250,0.18), transparent 50%),
            linear-gradient(160deg, #0a0e1a 0%, #141b2e 55%, #06070c 100%)`,
        }}
      />
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.07]"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id={`allpa-grid-${seed}`} width="42" height="42" patternUnits="userSpaceOnUse">
            <path d="M42 0H0V42" fill="none" stroke="#eec469" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#allpa-grid-${seed})`} />
      </svg>
      <svg
        viewBox="0 0 200 200"
        className="absolute -bottom-10 -right-10 h-72 w-72 opacity-[0.12]"
        aria-hidden="true"
      >
        <path
          d="M100 15 L175 175 L140 175 L100 95 L60 175 L25 175 Z"
          fill="none"
          stroke="#eec469"
          strokeWidth="3"
        />
      </svg>
    </div>
  );
}
