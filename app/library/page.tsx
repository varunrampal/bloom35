import type { Metadata } from "next";

import { JsonLd } from "@/components/json-ld";
import { ResourceLibrary } from "@/components/resource-library";
import { resourceTopics } from "@/lib/app-data";
import { getLibraryBlogPreviews } from "@/lib/blog-store";
import { absoluteUrl, createPageMetadata, siteConfig, siteUrl } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Perimenopause Blog and Support Library",
  description:
    "Browse Bloom35's perimenopause blog and support library for practical guides on sleep issues, hot flashes, brain fog, mood shifts, and care conversations.",
  path: "/library",
});

export const dynamic = "force-dynamic";

export default async function LibraryPage() {
  const libraryResources = await getLibraryBlogPreviews(resourceTopics);
  const libraryPageStructuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    description:
      "A searchable Bloom35 library of perimenopause guides, articles, and supportive routines.",
    isPartOf: {
      "@type": "WebSite",
      name: siteConfig.name,
      url: siteUrl,
    },
    name: "Bloom35 Support Library",
    url: absoluteUrl("/library"),
  };

  return (
    <>
      <JsonLd data={libraryPageStructuredData} />

      <div className="page-stack">
        <section className="page-hero">
        <p className="eyebrow">Support library</p>
        <h1 className="section-title page-title">
          Practical content for symptoms, routines, and care conversations.
        </h1>
        <p className="muted">
          This library combines the starter guidance content with any custom
          blog posts you publish from the admin area.
        </p>
        </section>

        <section className="library-layout">
        <div className="panel info-card">
          <p className="eyebrow">Content principles</p>
          <h2 className="card-title card-title-lg">What this library is optimized for.</h2>

          <ul className="plain-list">
            <li className="list-row">Short, low-shame guidance for noisy days</li>
            <li className="list-row">
              Language that supports care conversations instead of replacing them
            </li>
            <li className="list-row">
              Searchable topics that can grow into editorial collections later
            </li>
          </ul>
        </div>

        <ResourceLibrary resources={libraryResources} />
        </section>
      </div>
    </>
  );
}
