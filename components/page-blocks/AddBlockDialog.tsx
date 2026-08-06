"use client";

import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconPickerGrid } from "@/components/page-blocks/IconPickerGrid";
import { resolveLucideIcon } from "@/lib/lucide-icon";
import {
  BLOCK_CATEGORIES,
  BLOCK_PLACEMENTS,
  BLOCK_TYPE_CATALOG,
  DEFAULT_PLACEMENT,
  type BlockPlacement,
  type BlockType,
} from "@/lib/block-types";

export interface NewBlockInput {
  type: BlockType;
  title: string;
  icon: string;
  placement: BlockPlacement;
}

export function AddBlockDialog({
  open,
  onOpenChange,
  onCreate,
  placement = DEFAULT_PLACEMENT,
  onPlacementChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (input: NewBlockInput) => void;
  placement?: BlockPlacement;
  onPlacementChange?: (placement: BlockPlacement) => void;
}) {
  const [type, setType] = useState<BlockType | null>(null);
  const [title, setTitle] = useState("");
  const [icon, setIcon] = useState("Layers");
  const [query, setQuery] = useState("");

  const selectType = (t: BlockType) => {
    const def = BLOCK_TYPE_CATALOG.find((b) => b.type === t);
    setType(t);
    if (def) {
      setIcon(def.icon);
      if (!title.trim()) setTitle(def.label);
    }
  };

  /** Catálogo filtrado por el buscador y agrupado por categoría. */
  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matching = q
      ? BLOCK_TYPE_CATALOG.filter((d) => `${d.label} ${d.description}`.toLowerCase().includes(q))
      : BLOCK_TYPE_CATALOG;
    return BLOCK_CATEGORIES.map((cat) => ({
      ...cat,
      items: matching.filter((d) => d.category === cat.value),
    })).filter((g) => g.items.length > 0);
  }, [query]);

  const matchCount = groups.reduce((sum, g) => sum + g.items.length, 0);

  const reset = () => {
    setType(null);
    setTitle("");
    setIcon("Layers");
    setQuery("");
  };

  const handleCreate = () => {
    if (!type) {
      toast.error("Elige un tipo de bloque.");
      return;
    }
    if (!title.trim()) {
      toast.error("Ponle un título al bloque.");
      return;
    }
    onCreate({ type, title: title.trim(), icon, placement });
    const where = placement === "main" ? "el cuerpo de la página" : "el panel lateral";
    toast.success(`Bloque "${title.trim()}" agregado a ${where}.`);
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Agregar bloque</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>¿Dónde va el bloque?</Label>
            <div className="grid grid-cols-2 gap-2">
              {BLOCK_PLACEMENTS.map((option) => {
                const OptionIcon = resolveLucideIcon(option.icon);
                const active = placement === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => onPlacementChange?.(option.value)}
                    disabled={!onPlacementChange}
                    className={`flex items-start gap-2.5 rounded-lg border p-2.5 text-left transition-colors disabled:opacity-60 ${
                      active ? "border-[var(--allpa-gold-400)] bg-[var(--allpa-gold-400)]/10" : "border-border hover:bg-accent"
                    }`}
                  >
                    <OptionIcon
                      className={`mt-0.5 h-4 w-4 flex-shrink-0 ${active ? "text-[var(--allpa-gold-300)]" : "text-muted-foreground"}`}
                    />
                    <span className="min-w-0">
                      <span className="block text-xs font-semibold text-foreground">{option.label}</span>
                      <span className="block text-[11px] leading-snug text-muted-foreground">{option.description}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-baseline justify-between gap-2">
              <Label htmlFor="add-block-search">Tipo de bloque</Label>
              <span className="text-[11px] text-muted-foreground">
                {query ? `${matchCount} de ${BLOCK_TYPE_CATALOG.length}` : `${BLOCK_TYPE_CATALOG.length} disponibles`}
              </span>
            </div>

            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="add-block-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por nombre: tabla, dona, embudo…"
                className="pl-8"
              />
            </div>

            <div className="max-h-[22rem] space-y-3 overflow-y-auto rounded-lg border border-border p-2">
              {groups.length === 0 && (
                <p className="py-6 text-center text-sm text-muted-foreground">Ningún tipo coincide con “{query}”.</p>
              )}

              {groups.map((group) => (
                <div key={group.value}>
                  <p className="mb-1.5 px-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {group.label}
                  </p>
                  <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                    {group.items.map((def) => {
                      const Icon = resolveLucideIcon(def.icon);
                      const active = type === def.type;
                      return (
                        <button
                          key={def.type}
                          type="button"
                          onClick={() => selectType(def.type)}
                          className={`flex items-start gap-2 rounded-lg border p-2 text-left transition-colors ${
                            active
                              ? "border-[var(--allpa-gold-400)] bg-[var(--allpa-gold-400)]/10"
                              : "border-transparent hover:bg-accent"
                          }`}
                        >
                          <Icon
                            className={`mt-0.5 h-4 w-4 flex-shrink-0 ${active ? "text-[var(--allpa-gold-300)]" : "text-muted-foreground"}`}
                          />
                          <span className="min-w-0">
                            <span className="block text-xs font-semibold text-foreground">{def.label}</span>
                            <span className="block text-[11px] leading-snug text-muted-foreground">{def.description}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="add-block-title">Título</Label>
            <Input id="add-block-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej. Resumen de rendimiento" />
          </div>

          <div className="space-y-1.5">
            <Label>Icono</Label>
            <IconPickerGrid value={icon} onChange={setIcon} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleCreate} className="border-0 bg-gradient-to-b from-[#f5da93] to-[#c98f1f] font-semibold text-[#241a05]">
            Agregar bloque
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function AddBlockButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/12 py-3 text-sm text-white/40 transition-colors hover:border-[var(--allpa-gold-400)]/50 hover:text-[var(--allpa-gold-300)]"
    >
      <Plus className="h-4 w-4" />
      Agregar bloque
    </button>
  );
}
