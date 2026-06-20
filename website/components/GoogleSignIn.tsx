"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

// Same Web OAuth client id as the extension (audience must match the backend).
const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  "792822617409-42qs5ac2f1v4ud48rjek7a1cugbkgobb.apps.googleusercontent.com";

const GSI_SRC = "https://accounts.google.com/gsi/client";

// Minimal typing for the GIS surface we use (avoids `any`).
type GsiId = {
  initialize: (cfg: {
    client_id: string;
    callback: (resp: { credential?: string }) => void;
  }) => void;
  renderButton: (parent: HTMLElement, opts: Record<string, unknown>) => void;
};
declare global {
  interface Window {
    google?: { accounts?: { id?: GsiId } };
  }
}

function loadGsi(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return reject(new Error("no window"));
    if (window.google?.accounts?.id) return resolve();
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${GSI_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("GSI load failed")));
      if (window.google?.accounts?.id) resolve();
      return;
    }
    const s = document.createElement("script");
    s.src = GSI_SRC;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("GSI load failed"));
    document.head.appendChild(s);
  });
}

export default function GoogleSignIn({ onSignedIn }: { onSignedIn?: () => void }) {
  const { signIn } = useAuth();
  const btnRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Keep latest handlers for the (non-React) GIS callback to avoid stale closures.
  const handlersRef = useRef({ signIn, onSignedIn });
  handlersRef.current = { signIn, onSignedIn };

  useEffect(() => {
    let cancelled = false;
    loadGsi()
      .then(() => {
        const id = window.google?.accounts?.id;
        if (cancelled || !id || !btnRef.current) return;
        id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (resp) => {
            if (!resp.credential) {
              setError("No credential from Google");
              return;
            }
            setBusy(true);
            setError(null);
            try {
              await handlersRef.current.signIn(resp.credential);
              handlersRef.current.onSignedIn?.();
            } catch (e) {
              setError(e instanceof Error ? e.message : "Sign-in failed");
            } finally {
              setBusy(false);
            }
          },
        });
        id.renderButton(btnRef.current, {
          theme: "filled_black",
          size: "large",
          shape: "pill",
          text: "signin_with",
          width: 220,
        });
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Google load failed");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-2">
      <div ref={btnRef} aria-busy={busy} />
      {busy && <span className="text-xs text-muted">…</span>}
      {error && <span className="text-center text-xs text-pink">{error}</span>}
    </div>
  );
}
