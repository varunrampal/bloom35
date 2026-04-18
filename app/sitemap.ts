import type { MetadataRoute } from "next";

import { commonConcerns } from "@/lib/app-data";
import { getManagedBlogPosts } from "@/lib/blog-store";
import { absoluteUrl } from "@/lib/seo";

const parseStoredDate = (value: string) => new Date(value.replace(" ", "T") + "Z");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const blogPosts = await getManagedBlogPosts();
  const latestBlogDate =
    blogPosts.length > 0
      ? blogPosts
          .map((post) => parseStoredDate(post.createdAt))
          .sort((left, right) => right.getTime() - left.getTime())[0]
      : undefined;

  return [
    {
      url: absoluteUrl("/"),
      lastModified: latestBlogDate,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: absoluteUrl("/about"),
      changeFrequency: "monthly",
      priority: 0.75,
    },
    {
      url: absoluteUrl("/disclosure"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: absoluteUrl("/library"),
      lastModified: latestBlogDate,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/products"),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/check-in"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    ...commonConcerns.map((concern) => ({
      url: absoluteUrl(concern.href),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...blogPosts.map((post) => ({
      url: absoluteUrl(`/library/${post.slug}`),
      lastModified: parseStoredDate(post.createdAt),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
