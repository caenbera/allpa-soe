"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ICON_CHOICES } from "@/lib/icon-choices";
import { resolveLucideIcon } from "@/lib/lucide-icon";
import { createBlock, createPage } from "@/lib/services/sidebar";
import { firebaseReady } from "@/lib/firebase";

export function CreateBlockModal({
  open,
  onOpenChange,
  companyId,
  uid,
  nextOrder,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string | null;
  uid: string | null;
  nextOrder: number;
  onCreated: (block: { id: string; name: string; icon: string; order: number }) => void;
}) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState<string>(ICON_CHOICES[0]);
  const [firstPageName, setFirstPageName] = useState("");
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setName("");
    setIcon(ICON_CHOICES[0]);
    setFirstPageName("");
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("Ponle un nombre al bloque.");
      return;
    }
    if (!firebaseReady || !companyId || !uid) {
      toast.error("Conecta tu proyecto de Firebase para crear bloques (ver guía de despliegue).");
      return;
    }
    setSaving(true);
    try {
      const id = await createBlock(companyId, uid, { name: name.trim(), icon, order: nextOrder });
      if (firstPageName.trim()) {
        const slug = firstPageName
          .trim()
          .toLowerCase()
          .normalize("NFD")
          .replace(/[̀-ͯ]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
        await createPage(companyId, id, { name: firstPageName.trim(), slug, icon, order: 0 });
      }
      onCreated({ id, name: name.trim(), icon, order: nextOrder });
      toast.success(`Bloque "${name.trim()}" creado.`);
      reset();
      onOpenChange(false);
    } catch {
      toast.error("No se pudo crear el bloque. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nuevo bloque</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="block-name">Nombre</Label>
            <Input id="block-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej. Recursos Humanos" />
          </div>

          <div className="space-y-1.5">
            <Label>Icono</Label>
            <div className="grid grid-cols-8 gap-1.5 rounded-lg border border-border p-2">
              {ICON_CHOICES.map((iconName) => {
                const Icon = resolveLucideIcon(iconName);
                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setIcon(iconName)}
                    className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
                      icon === iconName ? "bg-[var(--allpa-gold-400)]/20 text-[var(--allpa-gold-300)]" : "text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="block-first-page">Primera página (opcional)</Label>
            <Input
              id="block-first-page"
              value={firstPageName}
              onChange={(e) => setFirstPageName(e.target.value)}
              placeholder="Ej. Resumen"
            />
            <p className="text-xs text-muted-foreground">Puedes agregar más páginas después desde el bloque.</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleCreate}
            disabled={saving}
            className="border-0 bg-gradient-to-b from-[#f5da93] to-[#c98f1f] font-semibold text-[#241a05]"
          >
            {saving ? "Creando..." : "Crear bloque"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
