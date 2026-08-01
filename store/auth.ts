import { create } from "zustand";
import type { User } from "firebase/auth";
import type { UserRole } from "@/lib/types";

interface AuthState {
  user: User | null;
  role: UserRole | null;
  companyId: string | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setRole: (role: UserRole | null) => void;
  setCompanyId: (companyId: string | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  role: null,
  companyId: null,
  loading: true,
  setUser: (user) => set({ user }),
  setRole: (role) => set({ role }),
  setCompanyId: (companyId) => set({ companyId }),
  setLoading: (loading) => set({ loading }),
}));
