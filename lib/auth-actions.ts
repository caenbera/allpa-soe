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

export async function logout() {
  return signOut(auth);
}

export async function resetPassword(email: string) {
  return sendPasswordResetEmail(auth, email);
}
