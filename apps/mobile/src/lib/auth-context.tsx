import { createContext, use, useMemo, useState, type ReactNode } from "react";

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: () => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

/**
 * Placeholder auth state. In-memory only.
 * TODO(Phase 2): replace with the Better Auth client + expo-secure-store session,
 * and a real loading state while the stored session is restored on launch.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const value = useMemo<AuthState>(
    () => ({
      isAuthenticated,
      isLoading: false,
      signIn: () => setIsAuthenticated(true),
      signOut: () => setIsAuthenticated(false),
    }),
    [isAuthenticated]
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth(): AuthState {
  const ctx = use(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
