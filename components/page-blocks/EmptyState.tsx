import { resolveLucideIcon } from "@/lib/lucide-icon";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

/**
 * Estado vacío de una página cuya empresa todavía no tiene contenido.
 * Es lo que ve un administrador recién registrado.
 */
export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: {
  icon: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const Icon = resolveLucideIcon(icon);
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--allpa-gold-400)]/10 text-[var(--allpa-gold-300)]">
        {/* eslint-disable-next-line react-hooks/static-components -- selecciona un icono existente por nombre, no crea un componente nuevo */}
        <Icon className="h-7 w-7" />
      </span>
      <p className="font-serif text-lg font-semibold text-[#f3ecd9]">{title}</p>
      <p className="mt-1.5 max-w-md text-sm leading-relaxed text-white/45">{description}</p>
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          className="mt-5 border-0 bg-gradient-to-b from-[#f5da93] to-[#c98f1f] font-semibold text-[#241a05] hover:brightness-105"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

/** Fila de carga mientras se leen los datos de Firestore. */
export function LoadingState({ label = "Cargando…" }: { label?: string }) {
  return <p className="py-16 text-center text-sm text-white/35">{label}</p>;
}
