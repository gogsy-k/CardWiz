import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getCard,
  getCards,
  topRate,
  formatFee,
  TYPE_LABEL,
  prettyCategory,
} from "@/lib/cards";

const CHROME_STORE_URL = "https://chrome.google.com/webstore";

export async function generateStaticParams() {
  const cards = await getCards();
  return cards.map((c) => ({ id: c.id }));
}

export async function generateMetadata(props: PageProps<"/cards/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  const card = await getCard(id);
  if (!card) return { title: "Card not found" };
  return {
    title: `${card.name} — rewards, fees & benefits`,
    description: `${card.name} (${card.bank}) ki poori detail — top ${topRate(card)}% reward, annual fee ${formatFee(card)}, ${TYPE_LABEL[card.type]}. Categories aur reward rates compare karo CardWiz pe.`,
  };
}

export default async function CardDetail(props: PageProps<"/cards/[id]">) {
  const { id } = await props.params;
  const card = await getCard(id);
  if (!card) notFound();

  const all = await getCards();
  const related = all
    .filter((c) => c.bank === card.bank && c.id !== card.id)
    .slice(0, 3);

  const stats: [string, string][] = [
    [`${topRate(card)}%`, "Top reward rate"],
    [formatFee(card), "Annual fee"],
    [TYPE_LABEL[card.type], "Reward type"],
    [card.network, "Network"],
  ];

  return (
    <div className="mx-auto max-w-4xl px-5 py-10">
      <Link href="/cards" className="text-sm text-muted hover:text-subtle">
        ← All cards
      </Link>

      {/* Header */}
      <div className="mt-4 rounded-2xl border border-border bg-surface2 p-7">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-accent px-2.5 py-1 text-[11px] font-bold uppercase text-bg">
            {card.cardType}
          </span>
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">
            {card.bank} · {card.network}
          </span>
        </div>
        <h1 className="mt-3 text-3xl font-black sm:text-4xl">{card.name}</h1>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map(([v, l]) => (
            <div key={l} className="rounded-xl border border-border bg-surface p-3">
              <div className="text-lg font-extrabold text-green">{v}</div>
              <div className="mt-0.5 text-[11px] text-muted">{l}</div>
            </div>
          ))}
        </div>

        {card.feeWaiverSpend > 0 && (
          <p className="mt-4 text-sm text-subtle">
            💡 Annual fee waiver: ₹{card.feeWaiverSpend.toLocaleString("en-IN")}/year spend karne
            pe fee maaf.
          </p>
        )}
      </div>

      {/* Reward rules */}
      <h2 className="mt-10 text-xl font-extrabold">Reward rates</h2>
      <div className="mt-4 space-y-3">
        {card.rules.map((rule, i) => (
          <div key={i} className="rounded-xl border border-border bg-surface2 p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-wrap gap-1.5">
                {rule.categories.map((c) => (
                  <span
                    key={c}
                    className="rounded-full border border-border bg-surface px-2.5 py-0.5 text-[11px] text-subtle"
                  >
                    {prettyCategory(c)}
                  </span>
                ))}
              </div>
              <span className="shrink-0 text-lg font-black text-green">
                {rule.effectiveRate}%
              </span>
            </div>
            <p className="mt-2 text-sm text-muted">{rule.rawRate}</p>
            {rule.monthlyCapValue && (
              <p className="mt-1 text-xs text-yellow">
                Monthly cap: ₹{rule.monthlyCapValue.toLocaleString("en-IN")} reward
              </p>
            )}
          </div>
        ))}
        {/* Base rate */}
        <div className="rounded-xl border border-dashed border-border p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-subtle">Baaki sabhi spends (base rate)</span>
            <span className="text-lg font-black text-subtle">{card.baseRate}%</span>
          </div>
        </div>
      </div>

      {/* Exclusions */}
      {card.exclusions.length > 0 && (
        <>
          <h2 className="mt-10 text-xl font-extrabold">Reward nahi milta in pe</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {card.exclusions.map((e) => (
              <span
                key={e}
                className="rounded-full border border-pink/40 bg-surface px-3 py-1 text-xs text-pink"
              >
                {prettyCategory(e)}
              </span>
            ))}
          </div>
        </>
      )}

      {/* CTA */}
      <div className="mt-10 rounded-2xl border border-border bg-surface2 p-6 text-center">
        <p className="text-sm text-subtle">
          Ye card aapke paas hai? CardWiz checkout pe automatically batayega ki kab is card se
          sabse zyada bachat hogi.
        </p>
        <a
          href={CHROME_STORE_URL}
          target="_blank"
          rel="noopener"
          className="mt-4 inline-block rounded-xl bg-accent px-6 py-3 text-sm font-bold text-bg transition-colors hover:bg-blue"
        >
          ⚡ CardWiz free mein add karo
        </a>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <>
          <h2 className="mt-12 text-xl font-extrabold">{card.bank} ke aur cards</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {related.map((c) => (
              <Link
                key={c.id}
                href={`/cards/${c.id}`}
                className="rounded-xl border border-border bg-surface2 p-4 transition-colors hover:border-accent"
              >
                <div className="text-sm font-bold">{c.name}</div>
                <div className="mt-2 text-green">{topRate(c)}% top reward</div>
              </Link>
            ))}
          </div>
        </>
      )}

      {card.lastVerified && (
        <p className="mt-10 text-center text-xs text-muted">
          Data last verified: {card.lastVerified} · Offers bank ki terms pe depend karte hain,
          apne issuer se confirm karein.
        </p>
      )}
    </div>
  );
}
