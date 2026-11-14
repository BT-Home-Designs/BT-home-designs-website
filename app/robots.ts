import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // /admin is private. Customer quote links (/q/...) are kept out of
      // search via X-Robots-Tag: noindex (see middleware.ts) and are
      // never listed in the sitemap.
      disallow: ["/api/", "/admin"],
    },
    sitemap: "https://www.bthomedesigns.com/sitemap.xml",
  };
}
