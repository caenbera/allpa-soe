"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginWithEmail, resetPassword } from "@/lib/auth-actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

const schema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

type FormData = z.infer<typeof schema>;

export function LoginForm() {
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);
  const [resetting, setResetting] = useState(false);
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      await loginWithEmail(data.email, data.password);
      router.push("/dashboard");
    } catch {
      toast.error("Credenciales incorrectas. Intenta de nuevo.");
    }
  };

  const handleReset = async () => {
    const email = getValues("email");
    if (!email) {
      toast.error("Ingresa tu email primero.");
      return;
    }
    setResetting(true);
    try {
      await resetPassword(email);
      toast.success("Email de recuperación enviado.");
    } catch {
      toast.error("No se pudo enviar el email.");
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="w-full space-y-5">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-sm font-semibold text-[#f3ecd9]">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="tu@empresa.com"
            className="h-11 border-white/10 bg-white/5 text-[#f3ecd9] placeholder:text-white/35 focus-visible:border-[#eec469] focus-visible:ring-[#eec469]/25"
            {...register("email")}
          />
          {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-sm font-semibold text-[#f3ecd9]">
            Contraseña
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPass ? "text" : "password"}
              placeholder="••••••••"
              className="h-11 border-white/10 bg-white/5 pr-10 text-[#f3ecd9] placeholder:text-white/35 focus-visible:border-[#eec469] focus-visible:ring-[#eec469]/25"
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

        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={handleReset}
            disabled={resetting}
            className="text-xs text-[#eec469] transition-colors hover:underline"
          >
            {resetting ? "Enviando..." : "¿Olvidaste tu contraseña?"}
          </button>
        </div>

        <Button
          type="submit"
          className="h-11 w-full rounded-xl border-0 bg-gradient-to-b from-[#f5da93] to-[#c98f1f] font-semibold text-[#241a05] shadow-lg shadow-black/30 transition-all hover:brightness-105"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Ingresando..." : "Iniciar sesión"}
        </Button>
      </form>

      <p className="pt-1 text-center text-sm text-white/50">
        ¿No tienes una cuenta?{" "}
        <Link href="/register" className="font-semibold text-[#eec469] hover:underline">
          Regístrate
        </Link>
      </p>
    </div>
  );
}
