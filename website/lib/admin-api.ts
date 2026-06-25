/*
 * Admin API client — all calls go through authedFetch (Bearer). Backend enforces
 * requireAdmin / requireSuperAdmin; this is just the typed client.
 */
import { authedFetch } from "./auth";
import type { Post, PostLang } from "./posts";

export type AdminPostInput = {
  title: string;
  excerpt?: string;
  coverImage?: string;
  content: string;
  category?: string;
  status: "draft" | "published";
  slug?: string;
  lang?: PostLang;
  translationGroup?: string;
  /** ISO timestamp. Future value = scheduled (auto-goes-live at that time). */
  publishedAt?: string | null;
};

export type ScheduleResult = {
  scheduled: number;
  posts: { id: string; slug: string; title: string; publishedAt: string }[];
};

export type AdminListResponse = {
  superAdmins: string[];
  admins: { email: string; addedBy: string; createdAt: string }[];
};

async function jsonOrThrow(res: Response) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

// ---- Posts ----
export async function adminListPosts(): Promise<Post[]> {
  const data = await jsonOrThrow(await authedFetch("/admin/posts"));
  return data.posts ?? [];
}

export async function adminGetPost(id: string): Promise<Post> {
  const data = await jsonOrThrow(await authedFetch(`/admin/posts/${id}`));
  return data.post;
}

export async function adminCreatePost(input: AdminPostInput): Promise<Post> {
  const data = await jsonOrThrow(
    await authedFetch("/admin/posts", { method: "POST", body: JSON.stringify(input) })
  );
  return data.post;
}

export async function adminUpdatePost(id: string, input: AdminPostInput): Promise<Post> {
  const data = await jsonOrThrow(
    await authedFetch(`/admin/posts/${id}`, { method: "PUT", body: JSON.stringify(input) })
  );
  return data.post;
}

export async function adminDeletePost(id: string): Promise<void> {
  await jsonOrThrow(await authedFetch(`/admin/posts/${id}`, { method: "DELETE" }));
}

/** Bulk-schedule drafts → publish one every `intervalHours` starting at `startAt` (ISO). */
export async function schedulePosts(
  ids: string[],
  startAt: string,
  intervalHours = 24,
): Promise<ScheduleResult> {
  return jsonOrThrow(
    await authedFetch("/admin/posts/schedule", {
      method: "POST",
      body: JSON.stringify({ ids, startAt, intervalHours }),
    })
  );
}

// ---- Admin allowlist (super-admin only) ----
export async function listAdmins(): Promise<AdminListResponse> {
  return jsonOrThrow(await authedFetch("/admin/admins"));
}

export async function addAdmin(email: string): Promise<void> {
  await jsonOrThrow(
    await authedFetch("/admin/admins", { method: "POST", body: JSON.stringify({ email }) })
  );
}

export async function removeAdmin(email: string): Promise<void> {
  await jsonOrThrow(
    await authedFetch(`/admin/admins/${encodeURIComponent(email)}`, { method: "DELETE" })
  );
}
