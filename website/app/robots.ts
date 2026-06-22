import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Account/admin private areas — search index se bahar.
      disallow: ["/account", "/admin"],
    },
    sitemap: "https://cardwiz.in/sitemap.xml",
    host: "https://cardwiz.in",
  };
}
