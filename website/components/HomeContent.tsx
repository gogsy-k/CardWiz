"use client";

import Link from "next/link";
import { useLang } from "@/contexts/LangContext";
import QuizTeaser from "@/components/QuizTeaser";
import PostCard from "@/components/PostCard";
import { pickPostsForLang, type Post } from "@/lib/posts";
import type { Card } from "@/lib/cards";
import NotifyCTA from "@/components/NotifyCTA";
import SavingsCalculator from "@/components/SavingsCalculator";

const FEAT_ICONS = ["🛒", "💳", "🏦", "🔔", "🔒", "⭐"];

export default function HomeContent({
  total,
  credit,
  banks,
  posts = [],
  calcCards = [],
}: {
  total: number;
  credit: number;
  banks: number;
  posts?: Post[];
  calcCards?: Card[];
}) {
  const { t, lang } = useLang();
  // One card per article in the selected language (dedupes translations).
  const newsPosts = pickPostsForLang(posts, lang).slice(0, 3);

  const features = FEAT_ICONS.map((icon, i) => ({
    icon,
    title: t(`feat_${i}_title`),
    desc: t(`feat_${i}_desc`),
  }));

  // Live entry points — har card ek real page pe le jaata hai (no dead text).
  const explore = [
    { icon: "🤖", href: "/ai",           tk: "ai" },
    { icon: "🏷️", href: "/offers",       tk: "offers" },
    { icon: "🎯", href: "/find-my-card", tk: "find" },
    { icon: "💳", href: "/cards",        tk: "cards" },
    { icon: "📊", href: "/account",      tk: "acct" },
    { icon: "📰", href: "/news",         tk: "news" },
  ];

  const steps = [
    { n: 1, title: t("step_1_title"), desc: t("step_1_desc") },
    { n: 2, title: t("step_2_title"), desc: t("step_2_desc") },
    { n: 3, title: t("step_3_title"), desc: t("step_3_desc") },
  ];

  const privBadges = [
    t("priv_0"),
    t("priv_1"),
    t("priv_2"),
    t("priv_3"),
    t("priv_4"),
  ];

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(ellipse_60%_60%_at_50%_0%,rgba(99,102,241,0.18),transparent_70%)]" />
        <div className="mx-auto max-w-4xl px-5 pb-16 pt-20 text-center sm:pt-28">
          <span className="inline-block rounded-full border border-border bg-surface px-4 py-1.5 text-xs font-semibold text-green">
            {t("home_badge")}
          </span>
          <h1 className="mt-6 text-4xl font-black leading-tight sm:text-6xl">
            {t("home_h1")}
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-subtle sm:text-lg">
            {t("home_sub")}
          </p>
          <div id="notify" className="mt-9 flex flex-wrap items-start justify-center gap-3">
            <NotifyCTA variant="primary" />
            <Link
              href="/cards"
              className="rounded-xl border border-border px-6 py-3.5 text-sm font-bold text-accent transition-colors hover:border-accent"
            >
              {t("home_browse", { n: total })}
            </Link>
          </div>

          {/* Interactive Savings Calculator — live proof, not a static mockup */}
          {calcCards.length > 0 && (
            <div className="mt-14">
              <SavingsCalculator cards={calcCards} />
            </div>
          )}
        </div>
      </section>

      {/* STATS */}
      <section className="border-y border-border bg-surface2">
        <div className="mx-auto grid max-w-4xl grid-cols-3 gap-4 px-5 py-8 text-center">
          {[
            [total + "+", t("stat_cards")],
            [banks + "+", t("stat_banks")],
            ["16", t("stat_sites")],
          ].map(([num, label]) => (
            <div key={label}>
              <div className="text-3xl font-black text-accent">{num}</div>
              <div className="mt-1 text-xs text-muted">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* EXPLORE — live entry points (har card clickable) */}
      <section className="mx-auto max-w-5xl px-5 py-20">
        <h2 className="text-center text-2xl sm:text-3xl font-extrabold">{t("explore_h")}</h2>
        <p className="mt-2 text-center text-subtle">{t("explore_sub")}</p>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {explore.map((x) => (
            <Link
              key={x.href + x.tk}
              href={x.href}
              className="group flex flex-col rounded-2xl border border-accent/40 bg-surface2 p-6 transition hover:-translate-y-0.5 hover:border-accent"
            >
              <div className="text-3xl">{x.icon}</div>
              <h3 className="mt-3 font-bold">{t(`xp_${x.tk}_t`)}</h3>
              <p className="mt-1.5 flex-1 text-sm leading-relaxed text-subtle">{t(`xp_${x.tk}_d`)}</p>
              <span className="mt-4 text-sm font-bold text-accent transition-transform group-hover:translate-x-0.5">
                {t("xp_open")}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* WHY CardWiz — value prop (descriptive) */}
      <section className="mx-auto max-w-5xl px-5 pb-4">
        <h2 className="text-center text-2xl sm:text-3xl font-extrabold">{t("home_feat_h")}</h2>
        <p className="mt-2 text-center text-subtle">{t("home_feat_sub")}</p>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-border bg-surface2 p-6 transition-colors hover:border-border/80"
            >
              <div className="text-3xl">{f.icon}</div>
              <h3 className="mt-3 font-bold">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-subtle">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* QUIZ TEASER */}
      <QuizTeaser />

      {/* LATEST NEWS */}
      {newsPosts.length > 0 && (
        <section className="mx-auto max-w-5xl px-5 py-16">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold">{t("home_news_h")}</h2>
              <p className="mt-2 text-subtle">{t("home_news_sub")}</p>
            </div>
            <Link href="/news" className="shrink-0 text-sm font-semibold text-accent hover:underline">
              {t("home_news_all")} →
            </Link>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {newsPosts.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        </section>
      )}

      {/* HOW */}
      <section id="how" className="mx-auto max-w-5xl px-5 pb-20">
        <h2 className="text-center text-2xl sm:text-3xl font-extrabold">{t("home_how_h")}</h2>
        <p className="mt-2 text-center text-subtle">{t("home_how_sub")}</p>
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="text-center">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border-2 border-accent bg-surface text-lg font-extrabold text-accent">
                {s.n}
              </div>
              <h3 className="mt-4 font-bold">{s.title}</h3>
              <p className="mt-1.5 text-sm text-subtle">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRIVACY */}
      <section className="mx-auto max-w-3xl px-5 pb-20">
        <div className="rounded-2xl border border-border bg-surface2 p-9 text-center">
          <h3 className="text-2xl font-extrabold text-green">{t("home_priv_h")}</h3>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-subtle">
            {t("home_priv_p")}
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {privBadges.map((p) => (
              <span
                key={p}
                className="rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs text-fg"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="mx-auto max-w-3xl px-5 pb-24 text-center">
        <h2 className="text-2xl sm:text-3xl font-extrabold">
          {t("home_cta_h")}
        </h2>
        <p className="mt-3 text-subtle">
          {t("home_cta_sub", { credit, total })}
        </p>
        <div className="mt-7 flex justify-center">
          <NotifyCTA variant="primary" />
        </div>
      </section>
    </>
  );
}
