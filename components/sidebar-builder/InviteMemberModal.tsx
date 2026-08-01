"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Copy, MessageCircleMore } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createInvitation, buildInvitationUrl, buildWhatsAppInviteLink } from "@/lib/services/invitations";
import { firebaseReady } from "@/lib/firebase";

export function InviteMemberModal({
  open,
  onOpenChange,
  companyId,
  companyName,
  uid,
  inviterName,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string | null;
  companyName: string;
  uid: string | null;
  inviterName: string;
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "member">("member");
  const [saving, setSaving] = useState(false);
  const [link, setLink] = useState<string | null>(null);
  const [waLink, setWaLink] = useState<string | null>(null);

  const reset = () => {
    setEmail("");
    setRole("member");
    setLink(null);
    setWaLink(null);
  };

  const handleGenerate = async () => {
    if (!firebaseReady || !companyId || !uid) {
      toast.error("Conecta tu proyecto de Firebase para invitar miembros (ver guía de despliegue).");
      return;
    }
    setSaving(true);
    try {
      const token = await createInvitation({
        companyId,
        companyName,
        role,
        invitedBy: uid,
        invitedByName: inviterName,
        email: email.trim() || null,
      });
      setLink(buildInvitationUrl(token));
      setWaLink(buildWhatsAppInviteLink(token, companyName));
    } catch {
      toast.error("No se pudo generar la invitación.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) reset();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invitar miembro</DialogTitle>
        </DialogHeader>

        {!link ? (
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="invite-email">Email (opcional)</Label>
              <Input id="invite-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nombre@empresa.com" />
            </div>
            <div className="space-y-1.5">
              <Label>Rol</Label>
              <Select value={role} onValueChange={(v) => setRole(v as "admin" | "member")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Miembro</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : (
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">Comparte este enlace con la persona que quieres invitar:</p>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm">
              <span className="flex-1 truncate">{link}</span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(link);
                  toast.success("Enlace copiado.");
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
            <a href={waLink ?? "#"} target="_blank" rel="noopener noreferrer">
              <Button className="w-full border-0 bg-[#25D366] text-white hover:brightness-105">
                <MessageCircleMore className="mr-2 h-4 w-4" />
                Enviar por WhatsApp
              </Button>
            </a>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {link ? "Cerrar" : "Cancelar"}
          </Button>
          {!link && (
            <Button
              onClick={handleGenerate}
              disabled={saving}
              className="border-0 bg-gradient-to-b from-[#f5da93] to-[#c98f1f] font-semibold text-[#241a05]"
            >
              {saving ? "Generando..." : "Generar invitación"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
