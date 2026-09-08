import type { MetadataRoute } from "next";

import { getAllCategories, getAllSteps } from "@/lib/content";
import { absoluteUrl } from "@/lib/seo";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/search", "/about", "/privacy", "/terms"];
  return [
    ...staticRoutes.map((path) => ({
      url: absoluteUrl(path || "/"),
      changeFrequency: "monthly" as const,
      priority: path ? 0.6 : 1,
    })),
    ...getAllCategories().map((category) => ({
      url: absoluteUrl(`/categories/${category.id}`),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...getAllSteps().map((step) => ({
      url: absoluteUrl(`/steps/${step.id}`),
      lastModified: new Date(`${step.lastReviewed}T00:00:00Z`),
      changeFrequency: "monthly" as const,
      priority: step.status === "coming-soon" ? 0.4 : 0.9,
    })),
  ];
}
