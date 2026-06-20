import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPost, getPosts, formatDate } from "@/lib/posts";
import PostBody from "@/components/PostBody";

export const revalidate = 300;

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Not found" };
  return {
    title: post.title,
    description: post.excerpt || post.title,
    alternates: { canonical: `/news/${post.slug}` },
    openGraph: post.coverImage
      ? { title: post.title, images: [post.coverImage], type: "article" }
      : { title: post.title, type: "article" },
  };
}

export default async function NewsDetail({ params }: Params) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  return (
    <article className="mx-auto max-w-2xl px-5 py-10">
      <Link href="/news" className="text-sm text-muted hover:text-subtle">
        ← All news
      </Link>

      {post.category && <div className="mt-5 text-xs font-semibold text-green">{post.category}</div>}
      <h1 className="mt-2 text-3xl font-black leading-tight sm:text-4xl">{post.title}</h1>
      <div className="mt-2 text-sm text-muted">
        {post.authorName && <>{post.authorName} · </>}
        {formatDate(post.publishedAt)}
      </div>

      {post.coverImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.coverImage}
          alt=""
          loading="lazy"
          className="mt-6 w-full rounded-2xl border border-border object-cover"
        />
      )}

      <div className="mt-8">
        <PostBody content={post.content} />
      </div>
    </article>
  );
}
