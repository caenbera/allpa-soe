"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconPickerGrid } from "@/components/page-blocks/IconPickerGrid";

/**
 * Edita el título y el icono de un bloque. Se monta solo mientras está
 * abierto, así que los valores iniciales siempre reflejan el estado actual
 * (mismo criterio que `SectionEditDialog`).
 */
export function EditBlockDialog({
  open,
  onOpenChange,
  initialTitle,
  initialIcon,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTitle: string;
  initialIcon: string;
  onSave: (values: { title: string; icon: string }) => void;
}) {
  const [title, setTitle] = useState(initialTitle);
  const [icon, setIcon] = useState(initialIcon);

  const handleSave = () => {
    if (!title.trim()) {
      toast.error("Ponle un título al bloque.");
      return;
    }
    onSave({ title: title.trim(), icon });
    toast.success("Bloque actualizado.");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar bloque</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="edit-block-title">Título</Label>
            <Input id="edit-block-title" value={title} onChange={(e) => setTitle(e.target.value)} />
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
          <Button onClick={handleSave} className="border-0 bg-gradient-to-b from-[#f5da93] to-[#c98f1f] font-semibold text-[#241a05]">
            Guardar cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
