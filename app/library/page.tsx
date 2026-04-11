import type { Metadata } from "next";

import { ResourceLibrary } from "@/components/resource-library";
import { resourceTopics } from "@/lib/app-data";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Perimenopause Blog and Support Library",
  description:
    "Browse Bloom35's perimenopause blog and support library for practical guides on sleep issues, hot flashes, brain fog, mood shifts, and care conversations.",
  path: "/library",
});

export default function LibraryPage() {
  return (
    <div className="page-stack">
      <section className="page-hero">
        <p className="eyebrow">Support library</p>
        <h1 className="section-title page-title">
          Practical content for symptoms, routines, and care conversations.
        </h1>
        <p className="muted">
          This library is set up as a product-content starter. It is designed so
          you can later swap static entries for CMS-backed content.
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

        <ResourceLibrary resources={resourceTopics} />
      </section>
    </div>
  );
}
