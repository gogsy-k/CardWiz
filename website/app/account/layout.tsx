"use client";

import type { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import GoogleSignIn from "@/components/GoogleSignIn";

export default function AccountLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  // Must handle loading separately — collapsing with !user would redirect
  // authenticated users whose session is still resolving.
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-border border-t-accent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-sm flex-col items-center justify-center gap-5 px-5 text-center">
        <div className="text-5xl">🔐</div>
        <h1 className="text-xl font-black">Sign in to view your account</h1>
        <p className="text-sm text-muted leading-relaxed">
          Sync your plan and access premium features across all your devices.
          We only use your name and email — never your card number or CVV.
        </p>
        <GoogleSignIn />
      </div>
    );
  }

  return <>{children}</>;
}
