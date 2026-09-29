import type { MetadataRoute } from "next";
import { business } from "@/lib/data/business";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/"],
    },
    sitemap: `${business.urls.website}/sitemap.xml`,
    host: business.urls.website,
  };
}
