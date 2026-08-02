"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconPickerGrid } from "@/components/page-blocks/IconPickerGrid";
import { PriorityPicker } from "@/components/page-blocks/PriorityPicker";
import type { SectionPriority } from "@/lib/types";

export interface SectionEditValues {
  title: string;
  icon: string;
  priority: SectionPriority;
  assignees: string[];
}

export function SectionEditDialog({
  open,
  onOpenChange,
  initialValues,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues: SectionEditValues;
  onSave: (values: SectionEditValues) => void;
}) {
  // El componente se monta de nuevo cada vez que se abre (ver AccordionSection,
  // que solo lo renderiza mientras `editOpen` es true), así que estos valores
  // iniciales siempre reflejan el estado actual del bloque sin necesidad de
  // sincronizarlos en un efecto.
  const [title, setTitle] = useState(initialValues.title);
  const [icon, setIcon] = useState(initialValues.icon);
  const [priority, setPriority] = useState(initialValues.priority);
  const [assignees, setAssignees] = useState(initialValues.assignees);
  const [newAssignee, setNewAssignee] = useState("");

  const addAssignee = () => {
    const name = newAssignee.trim();
    if (!name) return;
    setAssignees((list) => [...list, name]);
    setNewAssignee("");
  };

  const removeAssignee = (name: string) => {
    setAssignees((list) => list.filter((a) => a !== name));
  };

  const handleSave = () => {
    if (!title.trim()) {
      toast.error("Ponle un título al bloque.");
      return;
    }
    onSave({ title: title.trim(), icon, priority, assignees });
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
            <Label htmlFor="edit-section-title">Título</Label>
            <Input id="edit-section-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej. Revisión final" />
          </div>

          <div className="space-y-1.5">
            <Label>Icono</Label>
            <IconPickerGrid value={icon} onChange={setIcon} />
          </div>

          <div className="space-y-1.5">
            <Label>Prioridad</Label>
            <PriorityPicker value={priority} onChange={setPriority} />
          </div>

          <div className="space-y-1.5">
            <Label>Responsables</Label>
            {assignees.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {assignees.map((name) => (
                  <span key={name} className="flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground">
                    {name}
                    <button type="button" onClick={() => removeAssignee(name)} className="text-muted-foreground hover:text-foreground">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Input
                value={newAssignee}
                onChange={(e) => setNewAssignee(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addAssignee();
                  }
                }}
                placeholder="Nombre del responsable"
                className="h-9"
              />
              <Button type="button" variant="outline" onClick={addAssignee}>
                Agregar
              </Button>
            </div>
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
