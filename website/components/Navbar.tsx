"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { track } from "@vercel/analytics";
import { useLang } from "@/contexts/LangContext";
import { useAuth } from "@/contexts/AuthContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import AuthButton from "@/components/AuthButton";
import { INSTALL_HREF, INSTALL_CTA_KEY } from "@/lib/constants";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { t } = useLang();
  const { user } = useAuth();
  const pathname = usePathname();

  const links = [
    { href: "/", key: "nav_home" },
    { href: "/cards", key: "nav_cards" },
    { href: "/find-my-card", key: "nav_findcard" },
    { href: "/ai", key: "nav_ai" },
    { href: "/offers", key: "nav_offers" },
    { href: "/news", key: "nav_news" },
    { href: "/pricing", key: "nav_pricing" },
  ];

  // Active link: "/" exact, baaki nested routes ke liye prefix match.
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
        <Link href="/" className="text-xl font-extrabold tracking-tight text-accent">
          💳 CardWiz
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-5 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={isActive(l.href) ? "page" : undefined}
              className={`text-sm transition-colors ${
                isActive(l.href)
                  ? "font-bold text-accent"
                  : "font-medium text-subtle hover:text-fg"
              }`}
            >
              {t(l.key)}
            </Link>
          ))}
          {user && (
            <Link href="/account" className="text-sm font-medium text-accent transition-colors hover:text-accent/80">
              {t("nav_account")}
            </Link>
          )}
          {user?.isAdmin && (
            <Link href="/admin" className="text-sm font-bold text-pink transition-colors hover:text-pink/80">
              {t("nav_admin")}
            </Link>
          )}
          <LanguageSwitcher compact />
          <AuthButton />
          <a
            href={INSTALL_HREF}
            target="_blank"
            rel="noopener"
            onClick={() => track("install_cta", { location: "navbar" })}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-bold text-bg transition-colors hover:bg-blue"
          >
            {t(INSTALL_CTA_KEY)}
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="text-2xl text-subtle md:hidden"
          aria-label="Menu"
        >
          {open ? "✕" : "☰"}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="flex flex-col gap-1 border-t border-border px-5 py-3 md:hidden">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              aria-current={isActive(l.href) ? "page" : undefined}
              className={`rounded-lg px-2 py-2 text-sm hover:bg-surface ${
                isActive(l.href) ? "font-bold text-accent" : "font-medium text-subtle hover:text-fg"
              }`}
            >
              {t(l.key)}
            </Link>
          ))}
          {user && (
            <Link
              href="/account"
              onClick={() => setOpen(false)}
              className="rounded-lg px-2 py-2 text-sm font-medium text-accent hover:bg-surface"
            >
              {t("nav_account")}
            </Link>
          )}
          {user?.isAdmin && (
            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              className="rounded-lg px-2 py-2 text-sm font-bold text-pink hover:bg-surface"
            >
              {t("nav_admin")}
            </Link>
          )}
          <div className="mt-2 flex items-center justify-between px-2">
            <LanguageSwitcher />
            <AuthButton />
          </div>
          <a
            href={INSTALL_HREF}
            target="_blank"
            rel="noopener"
            className="mt-1 rounded-lg bg-accent px-4 py-2 text-center text-sm font-bold text-bg"
          >
            {t(INSTALL_CTA_KEY)}
          </a>
        </div>
      )}
    </header>
  );
}
