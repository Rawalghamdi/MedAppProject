import { create } from "zustand";
import type { User } from "@/types/api";

interface AuthState {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
}

// global auth store — keeps the logged in user in memory and localStorage
export const useAuth = create<AuthState>((set) => ({

  // load from localStorage so the user stays logged in after a page refresh
  user: (() => {
    try {
      const raw = localStorage.getItem("medapp-user");
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  })(),
  token: localStorage.getItem("medapp-token"),

  login: (user, token) => {
    localStorage.setItem("medapp-user", JSON.stringify(user));
    localStorage.setItem("medapp-token", token);
    localStorage.setItem("medapp-user-id", String(user.id)); // the API reads this header
    set({ user, token });
  },

  logout: () => {
    localStorage.removeItem("medapp-user");
    localStorage.removeItem("medapp-token");
    localStorage.removeItem("medapp-user-id");
    set({ user: null, token: null });
  },
}));
