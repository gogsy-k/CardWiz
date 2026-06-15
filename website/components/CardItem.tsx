import Link from "next/link";
import { Card, topRate, formatFee, TYPE_LABEL, cardCategories, prettyCategory } from "@/lib/cards";

const TYPE_BADGE: Record<Card["type"], string> = {
  cashback: "bg-green text-bg",
  points: "bg-blue text-bg",
  miles: "bg-yellow text-bg",
};

export default function CardItem({ card }: { card: Card }) {
  const cats = cardCategories(card).slice(0, 3);

  return (
    <Link
      href={`/cards/${card.id}`}
      className="group flex flex-col rounded-2xl border border-border bg-surface2 p-5 transition-colors hover:border-accent"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted">
            {card.bank} · {card.network}
          </div>
          <h3 className="mt-1 font-bold leading-snug group-hover:text-accent">{card.name}</h3>
        </div>
        <span
          className={`shrink-0 rounded-md px-2 py-1 text-[10px] font-bold ${TYPE_BADGE[card.type]}`}
        >
          {card.cardType}
        </span>
      </div>

      <div className="mt-4 flex items-end justify-between">
        <div>
          <div className="text-2xl font-black text-green">{topRate(card)}%</div>
          <div className="text-[11px] text-muted">top reward · {TYPE_LABEL[card.type]}</div>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold text-subtle">{formatFee(card)}</div>
          <div className="text-[11px] text-muted">annual fee</div>
        </div>
      </div>

      {cats.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {cats.map((c) => (
            <span
              key={c}
              className="rounded-full border border-border bg-surface px-2.5 py-0.5 text-[10px] text-subtle"
            >
              {prettyCategory(c)}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
