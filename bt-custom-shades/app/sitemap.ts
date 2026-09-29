import type { MetadataRoute } from "next";
import { services } from "@/lib/data/services";
import { cities } from "@/lib/data/cities";
import { business } from "@/lib/data/business";

const siteUrl = business.urls.website;

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/about", "/services", "/gallery", "/quote", "/contact", "/service-area", "/warranty"].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.8,
  }));

  const serviceRoutes = services.map((s) => ({
    url: `${siteUrl}/services/${s.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.9,
  }));

  const cityRoutes = cities.map((c) => ({
    url: `${siteUrl}/service-area/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...serviceRoutes, ...cityRoutes];
}
