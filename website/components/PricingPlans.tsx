"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { PLANS, priceFor, yearlySaving, type BillingPeriod } from "@/lib/plans";
import { useLang } from "@/contexts/LangContext";
import { NOTIFY_EMAIL } from "@/lib/constants";
import NotifyCTA from "@/components/NotifyCTA";
import UpgradeButton from "@/components/UpgradeButton";
import Reveal from "@/components/motion/Reveal";
import AnimatedNumber from "@/components/motion/AnimatedNumber";

const fmtPrice = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");

// Feature × plan matrix for the expandable comparison (mirrors plan pros).
// Value: true = included, false = not, string = qualifier.
const FEATURE_MATRIX: { label: string; free: boolean | string; premium: boolean | string; pro: boolean | string }[] = [
  { label: "Best card at checkout", free: true, premium: true, pro: true },
  { label: "Compare 195+ cards", free: true, premium: true, pro: true },
  { label: "AI Card Assistant", free: "5/day", premium: "Unlimited", pro: "Unlimited" },
  { label: "Cards in wallet", free: "3", premium: "Unlimited", pro: "Unlimited" },
  { label: "Cloud sync (multi-device)", free: false, premium: true, pro: true },
  { label: "Portfolio Score + gap tips", free: false, premium: true, pro: true },
  { label: "Fee / Welcome / Benefits trackers", free: false, premium: true, pro: true },
  { label: "Missed Savings report", free: false, premium: true, pro: true },
  { label: "PDF statement upload", free: false, premium: true, pro: true },
  { label: "Monthly report email", free: false, premium: true, pro: true },
  { label: "Offer watchlist", free: false, premium: true, pro: true },
  { label: "Priority support", free: false, premium: false, pro: true },
  { label: "Export transactions (CSV)", free: false, premium: false, pro: true },
];

function MatrixCell({ v }: { v: boolean | string }) {
  if (v === true) return <span className="text-green" aria-label="included">✓</span>;
  if (v === false) return <span className="text-muted" aria-label="not included">—</span>;
  return <span className="text-xs font-semibold text-subtle">{v}</span>;
}

export default function PricingPlans() {
  const [period, setPeriod] = useState<BillingPeriod>("monthly");
  const [showMatrix, setShowMatrix] = useState(false);
  const { t } = useLang();
  const maxSaving = Math.max(...PLANS.map(yearlySaving));

  return (
    <div>
      {/* Billing period toggle — sliding pill follows the active option */}
      <div className="mx-auto mb-10 flex w-fit items-center gap-1 rounded-full border border-border bg-surface2 p-1">
        {(["monthly", "yearly"] as BillingPeriod[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`relative rounded-full px-5 py-2 text-sm font-bold transition-colors ${
              period === p ? "text-onaccent" : "text-subtle hover:text-fg"
            }`}
          >
            {period === p && (
              <motion.span
                layoutId="pricing-pill"
                className="absolute inset-0 rounded-full bg-accent"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            )}
            <span className="relative z-10">
              {p === "monthly" ? t("toggle_monthly") : t("toggle_yearly")}
              {p === "yearly" && (
                <span className="ml-1.5 text-xs font-semibold text-green">
                  {t("toggle_save", { n: maxSaving })}
                </span>
              )}
            </span>
          </button>
        ))}
      </div>

      {/* Plan cards */}
      <div className="grid gap-6 lg:grid-cols-3">
        {PLANS.map((plan, i) => {
          const price = priceFor(plan, period);
          const saving = yearlySaving(plan);
          const isFree = plan.monthly === 0;

          return (
            <Reveal key={plan.id} delay={i * 0.08} className="h-full">
            <div
              className={`relative flex h-full flex-col rounded-2xl border p-7 ${
                plan.highlighted
                  ? "border-accent bg-surface2 shadow-2xl lg:-mt-3 lg:mb-3"
                  : "border-border bg-surface2"
              }`}
            >
              {plan.badge && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.7 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.08, type: "spring", stiffness: 400, damping: 20 }}
                  className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-3 py-1 text-xs font-bold text-onaccent"
                >
                  {plan.badge}
                </motion.span>
              )}

              <h3 className="text-lg font-extrabold text-accent">{plan.name}</h3>
              <p className="mt-1 text-sm text-muted">{t(`plan_tag_${plan.id}`)}</p>

              {/* Price (rolls on Monthly↔Yearly toggle) */}
              <div className="mt-5 flex items-end gap-1">
                <AnimatedNumber value={price} format={fmtPrice} className="text-4xl font-black" />
                {!isFree && (
                  <span className="mb-1 text-sm text-muted">
                    /{period === "yearly" ? "year" : "month"}
                  </span>
                )}
              </div>
              <div className="mt-2 h-6">
                {!isFree && period === "yearly" && saving > 0 && (
                  <span className="inline-block rounded-full bg-green/15 px-2.5 py-0.5 text-xs font-bold text-green">
                    {t("plan_save_yr", { n: saving })}
                  </span>
                )}
                {!isFree && period === "monthly" && (
                  <span className="text-xs font-semibold text-subtle">{t("plan_trial")}</span>
                )}
              </div>

              {/* CTA */}
              {plan.cta === "install" ? (
                <div className="mt-6">
                  <NotifyCTA variant="primary" className="w-full" />
                </div>
              ) : plan.id === "premium" ? (
                // Live Razorpay subscription (Premium). Pro stays "notify" until backend supports it.
                <UpgradeButton period={period} className="mt-6" />
              ) : (
                <a
                  href={`mailto:${NOTIFY_EMAIL}?subject=${encodeURIComponent(
                    `CardWiz ${plan.name} — notify me`
                  )}&body=${encodeURIComponent(
                    `Mujhe CardWiz ${plan.name} plan live hone par batana.`
                  )}`}
                  className={`mt-6 rounded-xl px-5 py-3 text-center text-sm font-bold transition-colors ${
                    plan.highlighted
                      ? "bg-accent text-onaccent hover:bg-blue"
                      : "border border-border text-accent hover:border-accent"
                  }`}
                >
                  {t("cta_notify")}
                </a>
              )}

              {/* Pros */}
              <ul className="mt-6 space-y-2.5">
                {plan.pros.map((pro) => (
                  <li key={pro} className="flex items-start gap-2 text-sm text-subtle">
                    <span className="mt-0.5 text-green">✓</span>
                    <span>{t(pro)}</span>
                  </li>
                ))}
              </ul>
            </div>
            </Reveal>
          );
        })}
      </div>

      {/* Expandable feature comparison */}
      <div className="mt-10 text-center">
        <button
          type="button"
          onClick={() => setShowMatrix((v) => !v)}
          aria-expanded={showMatrix}
          className="rounded-xl border border-border px-5 py-2.5 text-sm font-bold text-accent transition-colors hover:border-accent"
        >
          {showMatrix ? t("pp_compare_hide") : t("pp_compare_show")}
        </button>
      </div>

      {showMatrix && (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-border">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border bg-surface2">
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-muted">Feature</th>
                <th className="px-4 py-3 text-center text-sm font-black">Free</th>
                <th className="px-4 py-3 text-center text-sm font-black text-accent">Premium</th>
                <th className="px-4 py-3 text-center text-sm font-black">Pro</th>
              </tr>
            </thead>
            <tbody>
              {FEATURE_MATRIX.map((f, i) => (
                <tr key={f.label} className={i % 2 ? "bg-surface2/40" : ""}>
                  <td className="px-4 py-2.5 text-sm text-subtle">{f.label}</td>
                  <td className="px-4 py-2.5 text-center"><MatrixCell v={f.free} /></td>
                  <td className="px-4 py-2.5 text-center"><MatrixCell v={f.premium} /></td>
                  <td className="px-4 py-2.5 text-center"><MatrixCell v={f.pro} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Payment-not-live note */}
      <p className="mt-10 text-center text-xs text-muted">{t("plan_note")}</p>
    </div>
  );
}
