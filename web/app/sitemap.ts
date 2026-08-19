import type { MetadataRoute } from "next";
import { SITE_URL, STATS } from "@/lib/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      // The page is a view onto the catalog, so it is only as new as the
      // catalog the build shipped with.
      lastModified: new Date(STATS.generatedAt),
      changeFrequency: "daily",
      priority: 1,
    },
  ];
}
