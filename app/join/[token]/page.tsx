import type { Metadata } from "next";
import { getInvitation } from "@/lib/services/invitations";
import { JoinClient } from "./JoinClient";

function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export async function generateMetadata({ params }: { params: Promise<{ token: string }> }): Promise<Metadata> {
  const { token } = await params;
  const invitation = await getInvitation(token).catch(() => null);
  const companyName = invitation?.companyName ?? "Allpa SOE";
  const title = invitation ? `Únete a ${companyName} en Allpa SOE` : "Invitación · Allpa SOE";
  const description = invitation
    ? `${invitation.invitedByName} te invitó a colaborar en ${companyName}, el Sistema Operativo Empresarial.`
    : "Esta invitación ya no está disponible.";
  // Imagen absoluta para que WhatsApp/redes generen la tarjeta de vista previa con el logo Allpa arriba.
  const ogImage = `${siteUrl()}/brand/logo-allpa-01.png`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630 }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function JoinPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const invitation = await getInvitation(token).catch(() => null);
  return <JoinClient token={token} invitation={invitation} />;
}
