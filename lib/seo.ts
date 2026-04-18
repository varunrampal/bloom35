import type { Metadata } from "next";

const rawSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.VERCEL_PROJECT_PRODUCTION_URL ||
  process.env.VERCEL_URL ||
  "http://localhost:3000";

export const siteUrl = rawSiteUrl.startsWith("http")
  ? rawSiteUrl
  : `https://${rawSiteUrl}`;

export const siteConfig = {
  name: "Bloom35",
  defaultTitle: "Perimenopause Support, Symptom Guides, and Relief Tools",
  description:
    "Bloom35 offers perimenopause support through symptom guides, practical articles, comfort-product picks, and simple tools for sleep, hot flashes, mood changes, and brain fog.",
  ogImage: "/opengraph-image",
};

export const defaultKeywords = [
  "perimenopause support",
  "perimenopause symptom tracker",
  "perimenopause blog",
  "perimenopause tools",
  "hot flashes support",
  "sleep issues in perimenopause",
  "brain fog in perimenopause",
  "mood swings in perimenopause",
  "perimenopause product recommendations",
  "menopause support guides",
];

export function absoluteUrl(path = "/") {
  return new URL(path, siteUrl).toString();
}

export function absoluteMediaUrl(path: string) {
  return path.startsWith("http://") || path.startsWith("https://")
    ? path
    : absoluteUrl(path);
}

export function createBreadcrumbJsonLd(
  items: Array<{
    name: string;
    path: string;
  }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      item: absoluteUrl(item.path),
      name: item.name,
      position: index + 1,
    })),
  };
}

export function createSiteStructuredData() {
  return [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      description: siteConfig.description,
      logo: absoluteMediaUrl("/icon.svg"),
      name: siteConfig.name,
      url: siteUrl,
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      description: siteConfig.description,
      name: siteConfig.name,
      publisher: {
        "@type": "Organization",
        name: siteConfig.name,
        url: siteUrl,
      },
      url: siteUrl,
    },
  ];
}

type PageMetadataOptions = {
  description: string;
  path: string;
  title: string;
};

export function createPageMetadata({
  description,
  path,
  title,
}: PageMetadataOptions): Metadata {
  return {
    title,
    description,
    keywords: defaultKeywords,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title,
      description,
      url: path,
      siteName: siteConfig.name,
      type: "website",
      images: [
        {
          url: siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: `${siteConfig.name} preview image`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [siteConfig.ogImage],
    },
  };
}
