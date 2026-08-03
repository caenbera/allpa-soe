"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconPickerGrid } from "@/components/page-blocks/IconPickerGrid";
import { resolveLucideIcon } from "@/lib/lucide-icon";
import { BLOCK_TYPE_CATALOG, type BlockType } from "@/lib/block-types";

export interface NewBlockInput {
  type: BlockType;
  title: string;
  icon: string;
}

export function AddBlockDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (input: NewBlockInput) => void;
}) {
  const [type, setType] = useState<BlockType | null>(null);
  const [title, setTitle] = useState("");
  const [icon, setIcon] = useState("Layers");

  const selectType = (t: BlockType) => {
    const def = BLOCK_TYPE_CATALOG.find((b) => b.type === t);
    setType(t);
    if (def) {
      setIcon(def.icon);
      if (!title.trim()) setTitle(def.label);
    }
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
    onCreate({ type, title: title.trim(), icon });
    toast.success(`Bloque "${title.trim()}" agregado.`);
    setType(null);
    setTitle("");
    setIcon("Layers");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Agregar bloque</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Tipo de bloque</Label>
            <div className="grid max-h-64 grid-cols-1 gap-1.5 overflow-y-auto rounded-lg border border-border p-2 sm:grid-cols-2">
              {BLOCK_TYPE_CATALOG.map((def) => {
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
                    <Icon className={`mt-0.5 h-4 w-4 flex-shrink-0 ${active ? "text-[var(--allpa-gold-300)]" : "text-muted-foreground"}`} />
                    <span className="min-w-0">
                      <span className="block text-xs font-semibold text-foreground">{def.label}</span>
                      <span className="block text-[11px] leading-snug text-muted-foreground">{def.description}</span>
                    </span>
                  </button>
                );
              })}
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
