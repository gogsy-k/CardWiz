"use client";

import { useMemo, useState } from "react";
import { Card, cardCategories, topRate, prettyCategory } from "@/lib/cards";
import CardItem from "./CardItem";

type SortKey = "reward" | "feeLow" | "name";

export default function CardFinder({ cards }: { cards: Card[] }) {
  const [query, setQuery] = useState("");
  const [variant, setVariant] = useState<"all" | "credit" | "debit">("all");
  const [type, setType] = useState<"all" | "cashback" | "points" | "miles">("all");
  const [category, setCategory] = useState<string>("all");
  const [sort, setSort] = useState<SortKey>("reward");

  const banks = useMemo(
    () => [...new Set(cards.map((c) => c.bank))].sort(),
    [cards]
  );
  const [bank, setBank] = useState<string>("all");

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const c of cards) for (const cat of cardCategories(c)) set.add(cat);
    return [...set].sort();
  }, [cards]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let out = cards.filter((c) => {
      if (variant !== "all" && c.cardType !== variant) return false;
      if (type !== "all" && c.type !== type) return false;
      if (bank !== "all" && c.bank !== bank) return false;
      if (category !== "all" && !cardCategories(c).includes(category)) return false;
      if (q && !(`${c.name} ${c.bank} ${c.network}`.toLowerCase().includes(q))) return false;
      return true;
    });
    out = [...out].sort((a, b) => {
      if (sort === "reward") return topRate(b) - topRate(a);
      if (sort === "feeLow") return (a.annualFee || 0) - (b.annualFee || 0);
      return a.name.localeCompare(b.name);
    });
    return out;
  }, [cards, query, variant, type, bank, category, sort]);

  const selectCls =
    "rounded-lg border border-border bg-surface px-3 py-2 text-sm text-fg outline-none focus:border-accent";

  return (
    <div>
      {/* Search */}
      <div className="relative">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Card ya bank search karo — jaise 'HDFC', 'cashback', 'Amazon'…"
          className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-fg outline-none placeholder:text-muted focus:border-accent"
        />
      </div>

      {/* Variant tabs */}
      <div className="mt-4 flex gap-2">
        {(["all", "credit", "debit"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setVariant(v)}
            className={`rounded-lg px-4 py-1.5 text-sm font-semibold capitalize transition-colors ${
              variant === v
                ? "bg-accent text-onaccent"
                : "border border-border bg-surface text-subtle hover:text-fg"
            }`}
          >
            {v === "all" ? "All cards" : v}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="mt-3 flex flex-wrap gap-2.5">
        <select value={type} onChange={(e) => setType(e.target.value as typeof type)} className={selectCls}>
          <option value="all">All reward types</option>
          <option value="cashback">Cashback</option>
          <option value="points">Reward Points</option>
          <option value="miles">Travel Miles</option>
        </select>

        <select value={bank} onChange={(e) => setBank(e.target.value)} className={selectCls}>
          <option value="all">All banks</option>
          {banks.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>

        <select value={category} onChange={(e) => setCategory(e.target.value)} className={selectCls}>
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {prettyCategory(c)}
            </option>
          ))}
        </select>

        <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className={selectCls}>
          <option value="reward">Sort: Highest reward</option>
          <option value="feeLow">Sort: Lowest fee</option>
          <option value="name">Sort: Name (A–Z)</option>
        </select>
      </div>

      {/* Count */}
      <div className="mt-5 text-sm text-muted">
        {filtered.length} {filtered.length === 1 ? "card" : "cards"} mile
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-border py-16 text-center text-muted">
          Koi card nahi mila. Filters badal ke dekho.
        </div>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <CardItem key={c.id} card={c} />
          ))}
        </div>
      )}
    </div>
  );
}
