/**
 * Iconos de marcas de redes sociales en el mismo estilo (stroke, 24x24) que
 * lucide-react, que dejó de incluir logos de marcas en sus versiones
 * recientes. Se usan donde la app necesita identificar una plataforma
 * específica (campo "Plataforma", selector de redes, etc.).
 */
import type { SVGProps } from "react";

export type BrandKey = "instagram" | "facebook" | "tiktok" | "youtube" | "linkedin";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function Instagram(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect width="18" height="18" x="3" y="3" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <path d="M17.5 6.5h.01" />
    </svg>
  );
}

function Facebook(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M15 4h-2a4 4 0 0 0-4 4v3H7v4h2v7h4v-7h2.5l.5-4H13V8a1 1 0 0 1 1-1h2z" />
    </svg>
  );
}

function TikTok(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M15 3v10.5a3.5 3.5 0 1 1-3-3.46" />
      <path d="M15 3c0 2.5 2 4.5 4.5 4.5" />
    </svg>
  );
}

function YouTube(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect width="18" height="14" x="3" y="5" rx="4" />
      <path d="M11 9.5v5l4-2.5z" fill="currentColor" stroke="none" />
    </svg>
  );
}

function LinkedIn(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect width="18" height="18" x="3" y="3" rx="3" />
      <line x1="7.5" x2="7.5" y1="10" y2="16.5" />
      <circle cx="7.5" cy="7" r="0.6" fill="currentColor" />
      <path d="M11.5 16.5V10" />
      <path d="M11.5 12.8c0-1.5 1-2.5 2.3-2.5s2.2 1 2.2 2.5v3.7" />
    </svg>
  );
}

export const BRAND_ICONS: Record<BrandKey, (props: IconProps) => React.JSX.Element> = {
  instagram: Instagram,
  facebook: Facebook,
  tiktok: TikTok,
  youtube: YouTube,
  linkedin: LinkedIn,
};

export const BRAND_LABELS: Record<BrandKey, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  youtube: "YouTube",
  linkedin: "LinkedIn",
};

export function BrandIcon({ brand, ...props }: { brand: BrandKey } & IconProps) {
  const Icon = BRAND_ICONS[brand] ?? Instagram;
  return <Icon {...props} />;
}
