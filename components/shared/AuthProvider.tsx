"use client";

import { useEffect } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, firebaseReady } from "@/lib/firebase";
import { useAuthStore } from "@/store/auth";
import { createCompanyForOwner } from "@/lib/services/companies";
import type { UserRole } from "@/lib/types";

interface ResolvedProfile {
  role: UserRole;
  companyId: string | null;
}

async function ensureUserDoc(user: User): Promise<ResolvedProfile> {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    const data = snap.data();
    return {
      role: (data.role as UserRole) ?? "company_admin",
      companyId: data.companyId ?? null,
    };
  }

  // Perfil ausente (p.ej. alta manual en Firebase Auth): se crea una
  // empresa propia por defecto para que el usuario nunca quede huérfano.
  const company = await createCompanyForOwner(user.uid, user.displayName ?? "Mi empresa");
  await setDoc(ref, {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    role: "company_admin",
    companyId: company.id,
    createdAt: serverTimestamp(),
  });
  return { role: "company_admin", companyId: company.id };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setRole, setCompanyId, setLoading } = useAuthStore();

  useEffect(() => {
    if (!firebaseReady) {
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const { role, companyId } = await ensureUserDoc(user);
        setRole(role);
        setCompanyId(companyId);
      } else {
        setRole(null);
        setCompanyId(null);
      }
      setLoading(false);
    });
    return unsub;
  }, [setUser, setRole, setCompanyId, setLoading]);

  return <>{children}</>;
}
