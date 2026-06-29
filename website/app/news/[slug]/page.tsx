import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPost, getPosts, formatDate, HREFLANG, LANG_LABEL } from "@/lib/posts";
import PostBody from "@/components/PostBody";
import ArticleLangBar from "@/components/ArticleLangBar";
import JsonLd from "@/components/JsonLd";

export const revalidate = 300;

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const data = await getPost(slug);
  if (!data) return { title: "Not found" };
  const { post, translations } = data;

  // hreflang alternates: self + every published translation (self-referential).
  const languages: Record<string, string> = {
    [HREFLANG[post.lang]]: `/news/${post.slug}`,
  };
  for (const t of translations) languages[HREFLANG[t.lang]] = `/news/${t.slug}`;

  return {
    title: post.title,
    description: post.excerpt || post.title,
    alternates: { canonical: `/news/${post.slug}`, languages },
    openGraph: post.coverImage
      ? { title: post.title, images: [post.coverImage], type: "article", locale: HREFLANG[post.lang] }
      : { title: post.title, type: "article", locale: HREFLANG[post.lang] },
  };
}

export default async function NewsDetail({ params }: Params) {
  const { slug } = await params;
  const data = await getPost(slug);
  if (!data) notFound();
  const { post, translations } = data;

  return (
    <article className="mx-auto max-w-2xl px-5 py-10">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "NewsArticle",
          headline: post.title,
          description: post.excerpt || post.title,
          inLanguage: HREFLANG[post.lang],
          ...(post.publishedAt ? { datePublished: new Date(post.publishedAt).toISOString() } : {}),
          author: { "@type": post.authorName ? "Person" : "Organization", name: post.authorName || "CardWiz" },
          publisher: {
            "@type": "Organization",
            name: "CardWiz",
            logo: { "@type": "ImageObject", url: "https://cardwiz.in/opengraph-image" },
          },
          mainEntityOfPage: `https://cardwiz.in/news/${post.slug}`,
          ...(post.coverImage ? { image: [post.coverImage] } : {}),
        }}
      />
      <Link href="/news" className="text-sm text-muted hover:text-subtle">
        ← All news
      </Link>

      {post.category && <div className="mt-5 text-xs font-semibold capitalize text-green">{post.category}</div>}
      <h1 className="mt-2 text-3xl font-black leading-tight sm:text-4xl">{post.title}</h1>
      <div className="mt-2 text-sm text-muted">
        {post.authorName && <>{post.authorName} · </>}
        {formatDate(post.publishedAt)} · {LANG_LABEL[post.lang]}
      </div>

      {/* Auto-syncs article language with the navbar + manual "Read in" links */}
      <ArticleLangBar currentLang={post.lang} currentSlug={post.slug} translations={translations} />

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
