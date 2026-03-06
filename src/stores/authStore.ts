import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Championship {
  code: string;
  name: string;
}

interface AuthState {
  isAuthenticated: boolean;
  championship: Championship | null;
  username: string | null;
  _hasHydrated: boolean;
  login: (username: string, code: string, name: string) => void;
  logout: () => void;
  updateUsername: (newUsername: string) => void;
  setHasHydrated: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      championship: null,
      username: null,
      _hasHydrated: false,

      login: (user, code, name) =>
        set({
          isAuthenticated: true,
          championship: { code, name },
          username: user,
        }),

      logout: () =>
        set({
          isAuthenticated: false,
          championship: null,
          username: null,
        }),

      updateUsername: (newUsername) => set({ username: newUsername }),

      setHasHydrated: (value) => set({ _hasHydrated: value }),
    }),
    {
      name: "f1_admin_session",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        championship: state.championship,
        username: state.username,
      }),
    }
  )
);

export const useAuth = () => {
  const { isAuthenticated, championship, username, login, logout, updateUsername } = useAuthStore();
  return { isAuthenticated, championship, username, login, logout, updateUsername };
};
