import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { commonConcerns, getCommonConcernBySlug } from "@/lib/app-data";
import { siteConfig } from "@/lib/seo";

type CommonConcernDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return commonConcerns.map((concern) => ({
    slug: concern.slug,
  }));
}

export async function generateMetadata({
  params,
}: CommonConcernDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const concern = getCommonConcernBySlug(slug);

  if (!concern) {
    return {
      title: "Concern not found",
    };
  }

  return {
    title: concern.name,
    description: concern.summary,
    alternates: {
      canonical: `/concerns/${concern.slug}`,
    },
    openGraph: {
      title: `${concern.name} | ${siteConfig.name}`,
      description: concern.summary,
      url: `/concerns/${concern.slug}`,
      siteName: siteConfig.name,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${concern.name} | ${siteConfig.name}`,
      description: concern.summary,
    },
  };
}

export default async function CommonConcernDetailPage({
  params,
}: CommonConcernDetailPageProps) {
  const { slug } = await params;
  const concern = getCommonConcernBySlug(slug);

  if (!concern) {
    notFound();
  }

  return (
    <div className="page-stack concern-detail-shell">
      <section className="panel concern-detail-hero">
        <div className="concern-detail-hero-copy">
          <p className="eyebrow">Common concern</p>
          <h1 className="section-title concern-detail-title">{concern.name}</h1>
          <p className="concern-detail-summary">{concern.summary}</p>
        </div>

        <div className="concern-detail-callout-grid">
          <article className="concern-detail-callout">
            <p className="detail-label">Often looks like</p>
            <p className="concern-detail-callout-copy">{concern.signal}</p>
          </article>

          <article className="concern-detail-callout">
            <p className="detail-label">Helpful first support</p>
            <p className="concern-detail-callout-copy">{concern.support}</p>
          </article>
        </div>
      </section>

      <section className="panel concern-detail-section">
        <div className="concern-detail-section-copy">
          <p className="eyebrow">What may be happening</p>
          <h2 className="section-title">A calmer way to understand this pattern.</h2>
        </div>

        <div className="concern-detail-copy">
          {concern.overview.map((paragraph) => (
            <p className="concern-detail-paragraph" key={paragraph}>
              {paragraph}
            </p>
          ))}
        </div>
      </section>

      <section className="panel concern-detail-section">
        <div className="concern-detail-section-copy">
          <p className="eyebrow">What this can feel like</p>
          <h2 className="section-title">Common ways this shows up day to day.</h2>
        </div>

        <div className="concern-detail-grid">
          {concern.patterns.map((pattern) => (
            <article className="concern-detail-card" key={pattern}>
              <span className="concern-detail-card-dot" />
              <p className="concern-detail-card-copy">{pattern}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="panel concern-detail-section">
        <div className="concern-detail-section-copy">
          <p className="eyebrow">Helpful first support</p>
          <h2 className="section-title">Small moves that can lower friction first.</h2>
        </div>

        <div className="concern-detail-grid">
          {concern.firstSteps.map((step, index) => (
            <article className="concern-detail-card" key={`${concern.slug}-step-${index + 1}`}>
              <p className="detail-label">Step {index + 1}</p>
              <p className="concern-detail-card-copy">{step}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="panel concern-detail-section">
        <div className="concern-detail-section-copy">
          <p className="eyebrow">What to track</p>
          <h2 className="section-title">Patterns worth noticing.</h2>
        </div>

        <div className="concern-detail-list">
          {concern.trackTips.map((tip) => (
            <article className="concern-detail-list-item" key={tip}>
              <span className="concern-detail-list-dot" />
              <p className="concern-detail-card-copy">{tip}</p>
            </article>
          ))}
        </div>
      </section>

      {/* <section className="panel concern-detail-cta">
        <div className="concern-detail-section-copy">
          <p className="eyebrow">Next step</p>
          <h2 className="section-title">Keep going with a focused support path.</h2>
          <p className="muted">
            You do not have to solve this all at once. Use the support library for a
            deeper guide, or start tracking the pattern so it becomes easier to work
            with over time.
          </p>
        </div>

        <div className="cta-row">
          <Link className="button-primary" href={concern.guideHref}>
            Read the guide
          </Link>
          <Link className="button-secondary" href="/check-in">
            Open daily check-in
          </Link>
        </div>
      </section> */}
    </div>
  );
}
