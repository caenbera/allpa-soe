"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { XCircle } from "lucide-react";
import { brandLogos } from "@/lib/brand";
import { acceptInvitationAndJoin } from "@/lib/auth-actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { Invitation } from "@/lib/types";

const schema = z
  .object({
    name: z.string().min(2, "Mínimo 2 caracteres"),
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "Mínimo 6 caracteres"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { message: "Las contraseñas no coinciden", path: ["confirm"] });

type FormData = z.infer<typeof schema>;

export function JoinClient({ token, invitation }: { token: string; invitation: Invitation | null }) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { email: invitation?.email ?? "" } });

  const [done, setDone] = useState(false);

  const onSubmit = async (data: FormData) => {
    try {
      await acceptInvitationAndJoin(token, data.email, data.password, data.name);
      setDone(true);
      toast.success("¡Bienvenido/a! Ya formas parte del equipo.");
      setTimeout(() => router.push("/dashboard"), 1200);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "";
      if (msg.includes("email-already-in-use")) toast.error("Este email ya está registrado. Inicia sesión.");
      else toast.error("No se pudo completar el registro. Intenta de nuevo.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#06070c] px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Image src={brandLogos.full} alt="Allpa SOE" width={200} height={82} className="h-auto w-44 object-contain" priority />
        </div>

        {!invitation || invitation.status !== "pending" ? (
          <div className="surface-card flex flex-col items-center gap-3 px-6 py-10 text-center">
            <XCircle className="h-8 w-8 text-white/30" />
            <p className="font-serif text-lg font-semibold text-[#f3ecd9]">Invitación no disponible</p>
            <p className="text-sm text-white/45">Este enlace expiró, ya fue usado o no existe. Pide un nuevo enlace de invitación.</p>
            <Link href="/login" className="mt-2 text-sm font-semibold text-[#eec469] hover:underline">
              Ir a iniciar sesión
            </Link>
          </div>
        ) : done ? (
          <div className="surface-card flex flex-col items-center gap-2 px-6 py-10 text-center">
            <p className="font-serif text-lg font-semibold text-[#f3ecd9]">¡Listo!</p>
            <p className="text-sm text-white/45">Entrando a {invitation.companyName}…</p>
          </div>
        ) : (
          <>
            <div className="mb-6 text-center">
              <p className="mb-1 text-sm font-medium text-[#eec469]">{invitation.invitedByName} te invitó a</p>
              <h1 className="font-serif text-2xl font-semibold text-[#f3ecd9]">{invitation.companyName}</h1>
              <p className="mt-2 text-sm text-white/50">Crea tu cuenta para unirte al equipo en Allpa SOE.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-sm font-semibold text-[#f3ecd9]">
                  Tu nombre
                </Label>
                <Input id="name" placeholder="Nombre y apellido" className="h-11 border-white/10 bg-white/5 text-[#f3ecd9]" {...register("name")} />
                {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-semibold text-[#f3ecd9]">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  readOnly={Boolean(invitation.email)}
                  className="h-11 border-white/10 bg-white/5 text-[#f3ecd9] read-only:opacity-60"
                  {...register("email")}
                />
                {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-semibold text-[#f3ecd9]">
                  Contraseña
                </Label>
                <Input id="password" type="password" className="h-11 border-white/10 bg-white/5 text-[#f3ecd9]" {...register("password")} />
                {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirm" className="text-sm font-semibold text-[#f3ecd9]">
                  Confirmar contraseña
                </Label>
                <Input id="confirm" type="password" className="h-11 border-white/10 bg-white/5 text-[#f3ecd9]" {...register("confirm")} />
                {errors.confirm && <p className="text-xs text-red-400">{errors.confirm.message}</p>}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-11 w-full rounded-xl border-0 bg-gradient-to-b from-[#f5da93] to-[#c98f1f] font-semibold text-[#241a05]"
              >
                {isSubmitting ? "Uniéndote..." : `Unirme a ${invitation.companyName}`}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
