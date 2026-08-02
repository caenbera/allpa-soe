"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconPickerGrid } from "@/components/page-blocks/IconPickerGrid";
import { PriorityPicker } from "@/components/page-blocks/PriorityPicker";
import { ICON_CHOICES } from "@/lib/icon-choices";
import type { SectionPriority } from "@/lib/types";

export function CreateSectionDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (input: { title: string; icon: string; priority: SectionPriority }) => void;
}) {
  const [title, setTitle] = useState("");
  const [icon, setIcon] = useState<string>(ICON_CHOICES[0]);
  const [priority, setPriority] = useState<SectionPriority>("media");

  const reset = () => {
    setTitle("");
    setIcon(ICON_CHOICES[0]);
    setPriority("media");
  };

  const handleCreate = () => {
    if (!title.trim()) {
      toast.error("Ponle un título al bloque.");
      return;
    }
    onCreate({ title: title.trim(), icon, priority });
    toast.success(`Bloque "${title.trim()}" creado.`);
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nuevo bloque</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="new-section-title">Título</Label>
            <Input id="new-section-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej. Revisión final" />
          </div>

          <div className="space-y-1.5">
            <Label>Icono</Label>
            <IconPickerGrid value={icon} onChange={setIcon} />
          </div>

          <div className="space-y-1.5">
            <Label>Prioridad</Label>
            <PriorityPicker value={priority} onChange={setPriority} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleCreate} className="border-0 bg-gradient-to-b from-[#f5da93] to-[#c98f1f] font-semibold text-[#241a05]">
            Crear bloque
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
