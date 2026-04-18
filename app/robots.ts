import type { MetadataRoute } from "next";

import { absoluteUrl, siteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    host: siteUrl,
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/starter-guide/download"],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
