import Link from "next/link";
import { getCards } from "@/lib/cards";

const CHROME_STORE_URL = "https://chrome.google.com/webstore";

const features = [
  {
    icon: "🛒",
    title: "Auto Checkout Detection",
    desc: "Amazon, Flipkart, Myntra + 13 aur sites pe cart khulte hi best card suggest — bina kuch kiye.",
  },
  {
    icon: "💳",
    title: "195+ Indian Cards",
    desc: "HDFC, SBI, ICICI, Axis se lekar neobanks (OneCard, Slice, Scapia) tak — credit aur debit dono.",
  },
  {
    icon: "🏦",
    title: "Instant Bank Offers",
    desc: "Checkout pe dikhne wale instant discounts padhta hai aur reward ke saath jodke best card chunta hai.",
  },
  {
    icon: "🔔",
    title: "Bill Reminders",
    desc: "Bill due date daalo — CardWiz 3 din pehle remind karega. Kabhi late payment nahi.",
  },
  {
    icon: "🔒",
    title: "100% Privacy",
    desc: "Data sirf aapke device pe. Card number ya CVV kabhi nahi maangte. Koi bank login nahi.",
  },
  {
    icon: "⭐",
    title: "Free + Premium",
    desc: "Core features bilkul free. Premium mein unlimited cards, cloud sync, analytics.",
  },
];

const steps = [
  { n: 1, title: "Extension install karo", desc: "Chrome Web Store se free. 30 seconds." },
  { n: 2, title: "Apne cards add karo", desc: "Sirf last 4 digits se — poora number kabhi nahi." },
  { n: 3, title: "Shopping karo, bachao", desc: "Checkout pe automatically best card + savings dikhega." },
];

export default async function Home() {
  const cards = await getCards();
  const total = cards.length || 195;
  const credit = cards.filter((c) => c.cardType === "credit").length || 138;
  const banks = new Set(cards.map((c) => c.bank)).size || 50;

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(ellipse_60%_60%_at_50%_0%,rgba(203,166,247,0.18),transparent_70%)]" />
        <div className="mx-auto max-w-4xl px-5 pb-16 pt-20 text-center sm:pt-28">
          <span className="inline-block rounded-full border border-border bg-surface px-4 py-1.5 text-xs font-semibold text-green">
            🇮🇳 India-first · Free Chrome Extension
          </span>
          <h1 className="mt-6 text-4xl font-black leading-tight sm:text-6xl">
            Checkout pe <span className="text-accent">sabse zyada</span>
            <br /> bachat wala card batao
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-subtle sm:text-lg">
            Amazon, Flipkart, Myntra — jahan bhi kharido, CardWiz automatically batata hai kaun
            sa credit ya debit card use karein. Plus instant bank offers aur bill reminders.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <a
              href={CHROME_STORE_URL}
              target="_blank"
              rel="noopener"
              className="rounded-xl bg-accent px-6 py-3.5 text-sm font-bold text-bg transition-colors hover:bg-blue"
            >
              ⚡ Add to Chrome — Free
            </a>
            <Link
              href="/cards"
              className="rounded-xl border border-border px-6 py-3.5 text-sm font-bold text-accent transition-colors hover:border-accent"
            >
              Browse {total} Cards →
            </Link>
          </div>

          {/* Widget demo */}
          <div className="mx-auto mt-16 max-w-xs rounded-2xl border border-border bg-bg p-4 text-left shadow-2xl">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-bold text-accent">💳 CardWiz</span>
              <span className="text-xs text-muted">✕</span>
            </div>
            <div className="mb-2.5 text-xs text-subtle">Is ₹5,999 Amazon purchase pe:</div>
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
            [total + "+", "Cards"],
            [banks + "+", "Banks"],
            ["16", "Shopping Sites"],
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
        <h2 className="text-center text-3xl font-extrabold">Kya kya milta hai?</h2>
        <p className="mt-2 text-center text-muted">Ek extension, bahut fayde</p>
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
        <h2 className="text-center text-3xl font-extrabold">Kaise kaam karta hai?</h2>
        <p className="mt-2 text-center text-muted">3 simple steps</p>
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
          <h3 className="text-2xl font-extrabold text-green">🔒 Privacy-first, hamesha</h3>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-subtle">
            Aapka poora data sirf aapke device pe rehta hai. Hum kabhi bhi aapka full card number,
            CVV, ya bank login nahi maangte aur nahi store karte. Ye humara core principle hai.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {["❌ No card number", "❌ No CVV ever", "❌ No bank login", "✅ Local device only", "✅ Read-only"].map(
              (p) => (
                <span
                  key={p}
                  className="rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs text-fg"
                >
                  {p}
                </span>
              )
            )}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="mx-auto max-w-3xl px-5 pb-24 text-center">
        <h2 className="text-3xl font-extrabold">
          Har purchase pe <span className="text-accent">bachao</span>.
        </h2>
        <p className="mt-3 text-subtle">
          Free Chrome extension. {credit}+ credit cards, {total} total. 30 second setup.
        </p>
        <a
          href={CHROME_STORE_URL}
          target="_blank"
          rel="noopener"
          className="mt-7 inline-block rounded-xl bg-accent px-7 py-4 text-sm font-bold text-bg transition-colors hover:bg-blue"
        >
          ⚡ CardWiz Chrome mein add karo
        </a>
      </section>
    </>
  );
}
