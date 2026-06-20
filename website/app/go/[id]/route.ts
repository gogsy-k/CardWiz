import { NextResponse } from "next/server";

/*
 * Tracked "Apply" redirect.  /go/[id]  →  the card's apply destination.
 *
 * Single source of truth for where Apply goes. Today it 302s to the on-site card
 * detail page; when affiliate deep-links go live, change ONLY `applyTarget()` —
 * the quiz and every Apply button stay untouched and attribution is preserved.
 * (Affiliate programmes require routing through THEIR tracked link, so raw bank
 * URLs are deliberately not stored.) This is also the natural place to log clicks.
 */
function applyTarget(id: string): string {
  // TODO(affiliate): return AFFILIATE_LINKS[id] ?? `/cards/${id}` once live.
  return `/cards/${encodeURIComponent(id)}`;
}

export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> } // Next 16: params is async
) {
  const { id } = await ctx.params;
  // Future hook: record the click here (id, timestamp, referrer) for attribution.
  return NextResponse.redirect(new URL(applyTarget(id), req.url), 302);
}
