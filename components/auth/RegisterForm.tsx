"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerCompanyOwner } from "@/lib/auth-actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

const schema = z
  .object({
    name: z.string().min(2, "Mínimo 2 caracteres"),
    companyName: z.string().min(2, "Mínimo 2 caracteres"),
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "Mínimo 6 caracteres"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Las contraseñas no coinciden",
    path: ["confirm"],
  });

type FormData = z.infer<typeof schema>;

export function RegisterForm() {
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      await registerCompanyOwner(data.email, data.password, data.name, data.companyName);
      toast.success("¡Cuenta y empresa creadas! Bienvenido/a.");
      router.push("/dashboard");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "";
      if (msg.includes("email-already-in-use")) {
        toast.error("Este email ya está registrado.");
      } else {
        toast.error("Error al crear la cuenta. Intenta de nuevo.");
      }
    }
  };

  const inputCls =
    "h-11 border-white/10 bg-white/5 text-[#f3ecd9] placeholder:text-white/35 focus-visible:border-[#eec469] focus-visible:ring-[#eec469]/25";
  const labelCls = "text-sm font-semibold text-[#f3ecd9]";

  return (
    <div className="w-full space-y-4">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="name" className={labelCls}>
            Tu nombre
          </Label>
          <Input id="name" placeholder="Nombre y apellido" className={inputCls} {...register("name")} />
          {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="companyName" className={labelCls}>
            Nombre de tu empresa
          </Label>
          <Input id="companyName" placeholder="Mi Empresa S.A." className={inputCls} {...register("companyName")} />
          {errors.companyName && <p className="text-xs text-red-400">{errors.companyName.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email" className={labelCls}>
            Email
          </Label>
          <Input id="email" type="email" placeholder="tu@empresa.com" className={inputCls} {...register("email")} />
          {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password" className={labelCls}>
            Contraseña
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPass ? "text" : "password"}
              placeholder="••••••••"
              className={`${inputCls} pr-10`}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 transition-colors hover:text-[#eec469]"
            >
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirm" className={labelCls}>
            Confirmar contraseña
          </Label>
          <Input id="confirm" type="password" placeholder="••••••••" className={inputCls} {...register("confirm")} />
          {errors.confirm && <p className="text-xs text-red-400">{errors.confirm.message}</p>}
        </div>

        <Button
          type="submit"
          className="mt-1 h-11 w-full rounded-xl border-0 bg-gradient-to-b from-[#f5da93] to-[#c98f1f] font-semibold text-[#241a05] shadow-lg shadow-black/30 transition-all hover:brightness-105"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
        </Button>
      </form>

      <p className="pt-1 text-center text-sm text-white/50">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-semibold text-[#eec469] hover:underline">
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
