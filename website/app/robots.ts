import type { MetadataRoute } from "next";

// AI answer-engine crawlers we explicitly welcome (GEO): OpenAI, Perplexity,
// Anthropic, Google Gemini/AI Overviews, Apple, Amazon, Cohere. They're already
// covered by the "*" rule, but naming them is clearer + future-proof.
const AI_BOTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "PerplexityBot",
  "Perplexity-User",
  "ClaudeBot",
  "Claude-User",
  "anthropic-ai",
  "Google-Extended",
  "Applebot-Extended",
  "Amazonbot",
  "cohere-ai",
];

export default function robots(): MetadataRoute.Robots {
  const disallow = ["/account", "/admin"]; // private areas — out of every index

  return {
    rules: [
      { userAgent: "*", allow: "/", disallow },
      { userAgent: AI_BOTS, allow: "/", disallow },
    ],
    sitemap: "https://cardwiz.in/sitemap.xml",
    host: "https://cardwiz.in",
  };
}
