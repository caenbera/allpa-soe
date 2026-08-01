import Image from "next/image";
import { AuthCarousel } from "@/components/auth/AuthCarousel";
import { LoginForm } from "@/components/auth/LoginForm";
import { brandLogos } from "@/lib/brand";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen bg-[#06070c]">
      <div className="hidden flex-shrink-0 lg:block lg:w-[56%] xl:w-[58%]">
        <AuthCarousel />
      </div>

      <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-[#06070c] px-8 py-12">
        <div
          className="pointer-events-none absolute top-0 right-0 h-72 w-72 opacity-30"
          style={{
            background: "radial-gradient(circle, rgba(238,196,105,0.16), transparent 70%)",
          }}
        />

        <div className="relative z-10 w-full max-w-sm">
          <div className="mb-10 flex justify-center">
            <Image src={brandLogos.full} alt="Allpa SOE" width={220} height={90} className="h-auto w-52 object-contain" priority />
          </div>

          <div className="mb-8 text-center">
            <p className="mb-1 text-sm font-medium text-[#eec469]">Bienvenido de vuelta</p>
            <h1 className="font-serif text-3xl font-semibold text-[#f3ecd9]">Inicia sesión</h1>
            <p className="mt-2 text-sm text-white/50">Accede al panel de tu empresa</p>
          </div>

          <LoginForm />
        </div>
      </div>
    </div>
  );
}
