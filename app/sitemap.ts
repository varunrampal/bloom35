import type { MetadataRoute } from "next";

import { commonConcerns } from "@/lib/app-data";
import { getManagedBlogPosts } from "@/lib/blog-store";
import { absoluteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const blogPosts = getManagedBlogPosts();

  return [
    {
      url: absoluteUrl("/"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: absoluteUrl("/about"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.75,
    },
    {
      url: absoluteUrl("/disclosure"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: absoluteUrl("/library"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/check-in"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    ...commonConcerns.map((concern) => ({
      url: absoluteUrl(concern.href),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...blogPosts.map((post) => ({
      url: absoluteUrl(`/library/${post.slug}`),
      lastModified: new Date(post.createdAt.replace(" ", "T") + "Z"),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
