"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getReviews, postReview, deleteReview, type Review, type ReviewsResponse } from "@/lib/reviews-api";
import Link from "next/link";
import Skeleton from "@/components/Skeleton";

function StarPicker({
  value,
  onChange,
  readOnly = false,
  size = "text-xl",
}: {
  value: number;
  onChange?: (n: number) => void;
  readOnly?: boolean;
  size?: string;
}) {
  const [hover, setHover] = useState(0);
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(n)}
          onMouseEnter={() => !readOnly && setHover(n)}
          onMouseLeave={() => !readOnly && setHover(0)}
          className={`${size} leading-none transition-opacity ${
            readOnly ? "cursor-default" : "cursor-pointer"
          } ${n <= (hover || value) ? "opacity-100" : "opacity-25"}`}
          aria-label={`${n} star${n !== 1 ? "s" : ""}`}
        >
          ⭐
        </button>
      ))}
    </span>
  );
}

function ReviewCard({ review, onDelete }: { review: Review; onDelete?: () => void }) {
  const ago = (() => {
    const ms = Date.now() - new Date(review.createdAt).getTime();
    const days = Math.floor(ms / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 30) return `${days}d ago`;
    if (days < 365) return `${Math.floor(days / 30)}mo ago`;
    return `${Math.floor(days / 365)}y ago`;
  })();

  return (
    <div className="rounded-xl border border-border bg-surface2 p-4 space-y-2">
      <div className="flex items-center gap-2">
        {review.userPicture ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={review.userPicture} alt="" className="h-7 w-7 rounded-full" referrerPolicy="no-referrer" />
        ) : (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-xs font-black text-onaccent">
            {(review.userName || "?").charAt(0).toUpperCase()}
          </span>
        )}
        <span className="text-sm font-semibold truncate">{review.userName || "Anonymous"}</span>
        {(review.userPlan === "premium" || review.userPlan === "pro") && (
          <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-bold text-accent">
            ✨ {review.userPlan === "pro" ? "Pro" : "Premium"}
          </span>
        )}
        <span className="ml-auto text-xs text-muted shrink-0">{ago}</span>
      </div>

      <StarPicker value={review.rating} readOnly size="text-base" />

      {review.title && <div className="text-sm font-bold">{review.title}</div>}
      {review.body && <p className="text-sm text-muted leading-relaxed">{review.body}</p>}

      {onDelete && (
        <button
          onClick={onDelete}
          className="text-xs text-red-400 hover:underline pt-1"
        >
          Delete my review
        </button>
      )}
    </div>
  );
}

function WriteReviewForm({
  cardId,
  existingReview,
  onSaved,
}: {
  cardId: string;
  existingReview: Review | null;
  onSaved: (r: Review) => void;
}) {
  const [rating, setRating] = useState(existingReview?.rating ?? 0);
  const [title, setTitle] = useState(existingReview?.title ?? "");
  const [body, setBody] = useState(existingReview?.body ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!rating) { setError("Please select a star rating."); return; }
    setSubmitting(true);
    setError("");
    try {
      const saved = await postReview({ cardId, rating, title: title || undefined, body: body || undefined });
      onSaved(saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save review.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-border bg-surface2 p-4">
      <div className="text-sm font-bold">{existingReview ? "Edit your review" : "Write a review"}</div>

      <div>
        <div className="mb-1 text-xs text-muted">Rating *</div>
        <StarPicker value={rating} onChange={setRating} size="text-2xl" />
      </div>

      <input
        className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent"
        placeholder="Title (optional)"
        value={title}
        maxLength={120}
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent min-h-[80px] resize-y"
        placeholder="Your experience with this card... (optional)"
        value={body}
        maxLength={1000}
        onChange={(e) => setBody(e.target.value)}
      />

      {error && <p className="text-xs text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-lg bg-accent px-4 py-2 text-sm font-bold text-onaccent transition-opacity disabled:opacity-50"
      >
        {submitting ? "Saving…" : existingReview ? "Update review" : "Post review"}
      </button>
    </form>
  );
}

export default function CardReviews({ cardId }: { cardId: string }) {
  const { user } = useAuth();
  const [data, setData] = useState<ReviewsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await getReviews(cardId));
    } finally {
      setLoading(false);
    }
  }, [cardId]);

  useEffect(() => { load(); }, [load]);

  const myReview = data?.reviews.find((r) => r.userId === user?.id) ?? null;

  async function handleDelete() {
    if (!confirm("Delete your review?")) return;
    try {
      await deleteReview(cardId);
      await load();
    } catch {
      alert("Couldn't delete — try again.");
    }
  }

  function handleSaved(r: Review) {
    setShowForm(false);
    setData((prev) => {
      if (!prev) return { reviews: [r], avgRating: r.rating, count: 1 };
      const others = prev.reviews.filter((x) => x.userId !== r.userId);
      const all = [r, ...others];
      const avg = Math.round((all.reduce((s, x) => s + x.rating, 0) / all.length) * 10) / 10;
      return { reviews: all, avgRating: avg, count: all.length };
    });
  }

  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-black">User Reviews</h2>
        {data && data.count > 0 && (
          <div className="flex items-center gap-1.5 text-sm text-muted">
            <StarPicker value={Math.round(data.avgRating ?? 0)} readOnly size="text-sm" />
            <span className="font-semibold text-text">{data.avgRating?.toFixed(1)}</span>
            <span>({data.count})</span>
          </div>
        )}
      </div>

      {/* Write / Edit review CTA */}
      {user ? (
        myReview && !showForm ? (
          <div className="space-y-3">
            <ReviewCard review={myReview} onDelete={handleDelete} />
            <button
              onClick={() => setShowForm(true)}
              className="text-sm text-accent hover:underline"
            >
              Edit your review
            </button>
          </div>
        ) : showForm || !myReview ? (
          <WriteReviewForm
            cardId={cardId}
            existingReview={showForm ? myReview : null}
            onSaved={handleSaved}
          />
        ) : null
      ) : (
        <p className="text-sm text-muted">
          <Link href="/sign-in" className="text-accent hover:underline font-medium">Sign in</Link>
          {" "}to leave a review.
        </p>
      )}

      {/* Reviews list */}
      {loading ? (
        <div className="space-y-3">
          {[0, 1].map((i) => (
            <div key={i} className="rounded-xl border border-border bg-surface2 p-4">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="mt-2 h-3 w-full" />
              <Skeleton className="mt-1.5 h-3 w-2/3" />
            </div>
          ))}
        </div>
      ) : data && data.count > 0 ? (
        <div className="space-y-3">
          {data.reviews
            .filter((r) => r.userId !== user?.id)
            .map((r) => (
              <ReviewCard key={r.id} review={r} />
            ))}
        </div>
      ) : !user ? null : (
        <p className="text-sm text-muted py-2">No reviews yet — be the first!</p>
      )}
    </section>
  );
}
