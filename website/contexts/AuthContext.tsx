"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  type AuthUser,
  type StoredAuth,
  getStoredAuth,
  setStoredAuth,
  clearStoredAuth,
  googleLogin,
  getMe,
} from "@/lib/auth";

type AuthCtx = {
  user: AuthUser | null;
  loading: boolean; // true until the initial localStorage + /auth/me check completes
  signIn: (idToken: string) => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<AuthCtx>({
  user: null,
  loading: true,
  signIn: async () => {},
  signOut: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount: optimistic from localStorage, then validate/refresh via /auth/me.
  useEffect(() => {
    const stored = getStoredAuth();
    if (!stored) {
      setLoading(false);
      return;
    }
    setUser(stored.user); // optimistic — instant UI
    let alive = true;
    getMe(stored.token, stored.user)
      .then((fresh) => {
        if (!alive) return;
        if (fresh) {
          setUser(fresh);
          setStoredAuth({ token: stored.token, user: fresh }); // refresh cached plan
        } else {
          clearStoredAuth(); // 401 → token dead → sign out
          setUser(null);
        }
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  async function signIn(idToken: string) {
    const auth: StoredAuth = await googleLogin(idToken);
    setStoredAuth(auth);
    setUser(auth.user);
  }

  function signOut() {
    clearStoredAuth();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
