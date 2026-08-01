import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { createCompanyForOwner } from "@/lib/services/companies";
import { seedDefaultSidebar } from "@/lib/services/sidebar";
import { getInvitation, markInvitationAccepted } from "@/lib/services/invitations";

export async function loginWithEmail(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

/**
 * Alta de un nuevo administrador de empresa: crea el usuario en Firebase Auth,
 * su empresa y su perfil (users/{uid}) en una sola operación. Los miembros
 * adicionales de la empresa se dan de alta por invitación, no por este flujo.
 */
export async function registerCompanyOwner(email: string, password: string, name: string, companyName: string) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: name });

  const company = await createCompanyForOwner(cred.user.uid, companyName);
  await seedDefaultSidebar(company.id, cred.user.uid);

  await setDoc(doc(db, "users", cred.user.uid), {
    uid: cred.user.uid,
    email,
    displayName: name,
    photoURL: null,
    role: "company_admin",
    companyId: company.id,
    createdAt: serverTimestamp(),
  });

  return cred;
}

/**
 * Alta de un miembro invitado: crea el usuario en Firebase Auth y lo une
 * directamente a la empresa de la invitación (sin crear una empresa nueva).
 */
export async function acceptInvitationAndJoin(token: string, email: string, password: string, name: string) {
  const invitation = await getInvitation(token);
  if (!invitation || invitation.status !== "pending") {
    throw new Error("invitation-invalid");
  }

  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: name });

  await setDoc(doc(db, "companies", invitation.companyId, "members", cred.user.uid), {
    uid: cred.user.uid,
    role: invitation.role,
    permissions: invitation.role === "admin" ? ["*"] : [],
    invitedBy: invitation.invitedBy,
    joinedAt: serverTimestamp(),
  });

  await setDoc(doc(db, "users", cred.user.uid), {
    uid: cred.user.uid,
    email,
    displayName: name,
    photoURL: null,
    role: invitation.role === "admin" ? "company_admin" : "member",
    companyId: invitation.companyId,
    createdAt: serverTimestamp(),
  });

  await markInvitationAccepted(token);

  return cred;
}

export async function logout() {
  return signOut(auth);
}

export async function resetPassword(email: string) {
  return sendPasswordResetEmail(auth, email);
}
