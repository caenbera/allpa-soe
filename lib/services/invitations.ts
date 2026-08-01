import { doc, getDoc, setDoc, serverTimestamp, Timestamp, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Invitation } from "@/lib/types";

function toMillis(value: unknown): number {
  if (value instanceof Timestamp) return value.toMillis();
  if (typeof value === "number") return value;
  return Date.now();
}

function generateToken(): string {
  return crypto.randomUUID().replace(/-/g, "");
}

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export async function createInvitation(data: {
  companyId: string;
  companyName: string;
  role: "admin" | "member";
  invitedBy: string;
  invitedByName: string;
  email?: string | null;
}): Promise<string> {
  const token = generateToken();
  await setDoc(doc(db, "invitations", token), {
    token,
    companyId: data.companyId,
    companyName: data.companyName,
    email: data.email ?? null,
    role: data.role,
    invitedBy: data.invitedBy,
    invitedByName: data.invitedByName,
    status: "pending",
    createdAt: serverTimestamp(),
    expiresAt: Date.now() + SEVEN_DAYS_MS,
  });
  return token;
}

export async function getInvitation(token: string): Promise<Invitation | null> {
  const snap = await getDoc(doc(db, "invitations", token));
  if (!snap.exists()) return null;
  const data = snap.data();
  return { ...data, token: snap.id, createdAt: toMillis(data.createdAt) } as Invitation;
}

export async function markInvitationAccepted(token: string) {
  await updateDoc(doc(db, "invitations", token), { status: "accepted" });
}

export function buildInvitationUrl(token: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return `${base}/join/${token}`;
}

export function buildWhatsAppInviteLink(token: string, companyName: string): string {
  const url = buildInvitationUrl(token);
  const text = `Te invito a unirte a ${companyName} en Allpa SOE 👉 ${url}`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
