"use client";

import Link from "next/link";
import { useLang } from "@/contexts/LangContext";

const CHROME_STORE_URL = "https://chrome.google.com/webstore";

const FEAT_ICONS = ["🛒", "💳", "🏦", "🔔", "🔒", "⭐"];

export default function HomeContent({
  total,
  credit,
  banks,
}: {
  total: number;
  credit: number;
  banks: number;
}) {
  const { t } = useLang();

  const features = FEAT_ICONS.map((icon, i) => ({
    icon,
    title: t(`feat_${i}_title`),
    desc: t(`feat_${i}_desc`),
  }));

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
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(ellipse_60%_60%_at_50%_0%,rgba(203,166,247,0.18),transparent_70%)]" />
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
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <a
              href={CHROME_STORE_URL}
              target="_blank"
              rel="noopener"
              className="rounded-xl bg-accent px-6 py-3.5 text-sm font-bold text-bg transition-colors hover:bg-blue"
            >
              {t("home_add")}
            </a>
            <Link
              href="/cards"
              className="rounded-xl border border-border px-6 py-3.5 text-sm font-bold text-accent transition-colors hover:border-accent"
            >
              {t("home_browse", { n: total })}
            </Link>
          </div>

          {/* Widget demo */}
          <div className="mx-auto mt-16 max-w-xs rounded-2xl border border-border bg-bg p-4 text-left shadow-2xl">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-bold text-accent">💳 CardWiz</span>
              <span className="text-xs text-muted">✕</span>
            </div>
            <div className="mb-2.5 text-xs text-subtle">{t("home_demo_caption")}</div>
            {[
              { name: "⭐ ICICI Coral", val: "≈₹30", tag: "in points", off: "+₹600 instant off", best: true },
              { name: "Axis Magnus", val: "≈₹360", tag: "in miles", off: "", best: false },
              { name: "Amazon Pay ICICI", val: "₹300", tag: "cashback", off: "", best: false },
            ].map((r) => (
              <div
                key={r.name}
                className={`mb-1.5 flex items-center justify-between rounded-lg border px-2.5 py-2 ${
                  r.best ? "border-green bg-green/10" : "border-border bg-surface"
                }`}
              >
                <span className="text-xs font-semibold">{r.name}</span>
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-extrabold text-green">{r.val}</span>
                    <span className="rounded bg-blue px-1.5 py-0.5 text-[8px] font-bold text-bg">
                      {r.tag}
                    </span>
                  </div>
                  {r.off && (
                    <span className="rounded bg-blue px-1.5 py-0.5 text-[10px] font-extrabold text-bg">
                      {r.off}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
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

      {/* FEATURES */}
      <section className="mx-auto max-w-5xl px-5 py-20">
        <h2 className="text-center text-3xl font-extrabold">{t("home_feat_h")}</h2>
        <p className="mt-2 text-center text-muted">{t("home_feat_sub")}</p>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-border bg-surface2 p-6 transition-colors hover:border-border/80"
            >
              <div className="text-3xl">{f.icon}</div>
              <h3 className="mt-3 font-bold">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW */}
      <section id="how" className="mx-auto max-w-5xl px-5 pb-20">
        <h2 className="text-center text-3xl font-extrabold">{t("home_how_h")}</h2>
        <p className="mt-2 text-center text-muted">{t("home_how_sub")}</p>
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="text-center">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border-2 border-accent bg-surface text-lg font-extrabold text-accent">
                {s.n}
              </div>
              <h3 className="mt-4 font-bold">{s.title}</h3>
              <p className="mt-1.5 text-sm text-muted">{s.desc}</p>
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
        <h2 className="text-3xl font-extrabold">
          {t("home_cta_h")}
        </h2>
        <p className="mt-3 text-subtle">
          {t("home_cta_sub", { credit, total })}
        </p>
        <a
          href={CHROME_STORE_URL}
          target="_blank"
          rel="noopener"
          className="mt-7 inline-block rounded-xl bg-accent px-7 py-4 text-sm font-bold text-bg transition-colors hover:bg-blue"
        >
          {t("home_cta_btn")}
        </a>
      </section>
    </>
  );
}
