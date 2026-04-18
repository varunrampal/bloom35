import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BlogDescription } from "@/components/blog-description";
import { JsonLd } from "@/components/json-ld";
import type { ManagedBlogPost } from "@/lib/app-data";
import { resourceTopics } from "@/lib/app-data";
import {
  getManagedAffiliateProductsByIds,
  type StoredAffiliateProduct,
} from "@/lib/affiliate-product-store";
import { isAmazonAffiliateUrl } from "@/lib/blog-content";
import { getManagedBlogPostBySlug, getRelatedBlogPreviews } from "@/lib/blog-store";
import {
  absoluteMediaUrl,
  absoluteUrl,
  createBreadcrumbJsonLd,
  defaultKeywords,
  siteConfig,
  siteUrl,
} from "@/lib/seo";

type BlogArticlePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const formatPublishedDate = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
  }).format(parseStoredDate(value));

const parseStoredDate = (value: string) => new Date(value.replace(" ", "T") + "Z");

const getAuthorInitials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "B";

const getExternalRel = (href: string) =>
  isAmazonAffiliateUrl(href)
    ? "noopener noreferrer sponsored nofollow"
    : "noopener noreferrer nofollow";

const isInternalHref = (href: string) => href.startsWith("/");

const getSchemaAuthor = (name: string) =>
  name.trim().toLowerCase().includes("team") || name.trim() === siteConfig.name
    ? {
        "@type": "Organization",
        name,
      }
    : {
        "@type": "Person",
        name,
      };

const defaultArticleHero = {
  alt: "Illustrated journal, tea, and soft botanicals for a Bloom35 article banner.",
  src: "/blog/article-banner-default.svg",
};

const getArticleHeroImage = (post: ManagedBlogPost) => {
  const customSrc = post.structuredContent?.heroImageSrc?.trim();
  const customAlt = post.structuredContent?.heroImageAlt?.trim();

  if (customSrc) {
    return {
      alt: customAlt || `${post.title} banner image`,
      src: customSrc,
    };
  }

  return defaultArticleHero;
};

function ArticleHeroBanner({ post }: { post: ManagedBlogPost }) {
  const heroImage = getArticleHeroImage(post);

  return (
    <section className="article-hero-banner">
      <div aria-hidden="true" className="article-hero-art">
        <span className="article-orb article-orb-one" />
        <span className="article-orb article-orb-two" />
        <span className="article-orb article-orb-three" />
        <span className="article-orb article-orb-four" />
      </div>

      <div className="article-hero-media-shell">
        <div className="article-hero-media-frame">
          <Image
            alt={heroImage.alt}
            className="article-hero-image"
            fill
            priority
            sizes="(max-width: 768px) calc(100vw - 40px), 760px"
            src={heroImage.src}
          />
        </div>
      </div>
    </section>
  );
}

function RecommendedArticleProducts({
  products,
}: {
  products: StoredAffiliateProduct[];
}) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="article-section article-product-section">
      <div className="article-product-copy">
        <h2 className="article-section-title">Recommended products</h2>
        <p className="article-section-intro">
          These saved Bloom35 product picks are linked to this article because they
          support the routines or symptoms discussed here. Product links may be
          affiliate links.
        </p>
      </div>

      <div className="article-product-grid">
        {products.map((product) => (
          <article className="product-card article-product-card" key={product.id}>
            <div className="product-image-frame">
              <Image
                alt={product.imageAlt}
                className="product-image"
                height={480}
                priority={false}
                sizes="(max-width: 780px) 100vw, (max-width: 1200px) 50vw, 420px"
                src={product.imageSrc}
                width={720}
              />
            </div>

            <div className="product-meta">
              <p className="feature-kicker">{product.category}</p>
              <span className="chip">{product.bestFor}</span>
            </div>

            <h3 className="card-title">{product.title}</h3>
            <p className="muted">{product.summary}</p>

            <a
              className="product-link"
              href={product.href}
              rel="noopener noreferrer sponsored nofollow"
              target="_blank"
            >
              {product.ctaLabel}
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}

function PerimenopauseGuideCta() {
  return (
    <section className="article-cta-card">
      <h2 className="card-title card-title-lg">
        Start with the full perimenopause guide
      </h2>
      <p className="muted">
        Put this article in context with Bloom35&apos;s main guide to perimenopause
        support after 35, including sleep issues, brain fog, hot flashes, and
        symptom tracking.
      </p>
      <div className="article-cta-actions">
        <Link className="button-primary" href="/perimenopause">
          Read perimenopause guide
        </Link>
        <Link className="button-secondary" href="/check-in">
          Open symptom tracker
        </Link>
      </div>
    </section>
  );
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: BlogArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getManagedBlogPostBySlug(slug);

  if (!post) {
    return {
      title: "Article not found",
    };
  }

  const heroImage = getArticleHeroImage(post);
  const publishedAt = parseStoredDate(post.createdAt).toISOString();

  return {
    title: post.title,
    description: post.summary,
    authors: [{ name: post.authorName }],
    keywords: Array.from(new Set([...defaultKeywords, ...post.tags])),
    alternates: {
      canonical: `/library/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.summary,
      url: `/library/${post.slug}`,
      siteName: siteConfig.name,
      type: "article",
      publishedTime: publishedAt,
      authors: [post.authorName],
      tags: post.tags,
      section: post.category,
      images: [
        {
          alt: heroImage.alt,
          url: absoluteMediaUrl(heroImage.src),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.summary,
      images: [absoluteMediaUrl(heroImage.src)],
    },
  };
}

export default async function BlogArticlePage({
  params,
}: BlogArticlePageProps) {
  const { slug } = await params;
  const post = await getManagedBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = await getRelatedBlogPreviews(
    post.slug,
    post.tags,
    resourceTopics,
  );
  const recommendedProducts = await getManagedAffiliateProductsByIds(
    post.structuredContent?.recommendedProductIds ?? [],
  );
  const heroImage = getArticleHeroImage(post);
  const articlePath = `/library/${post.slug}`;
  const publishedAt = parseStoredDate(post.createdAt).toISOString();
  const articleStructuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    articleSection: post.category,
    author: getSchemaAuthor(post.authorName),
    dateModified: publishedAt,
    datePublished: publishedAt,
    description: post.summary,
    headline: post.title,
    image: [absoluteMediaUrl(heroImage.src)],
    isPartOf: {
      "@type": "Blog",
      name: `${siteConfig.name} Library`,
      url: absoluteUrl("/library"),
    },
    keywords: post.tags,
    mainEntityOfPage: absoluteUrl(articlePath),
    publisher: {
      "@type": "Organization",
      logo: {
        "@type": "ImageObject",
        url: absoluteMediaUrl("/icon.svg"),
      },
      name: siteConfig.name,
      url: siteUrl,
    },
    url: absoluteUrl(articlePath),
  };
  const breadcrumbStructuredData = createBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Library", path: "/library" },
    { name: post.title, path: articlePath },
  ]);
  const articlePageStructuredData = [
    articleStructuredData,
    breadcrumbStructuredData,
  ];

  if (post.structuredContent) {
    const content = post.structuredContent;
    const breadcrumb =
      content.breadcrumb || `Bloom35 > ${content.label} > ${post.title}`;
    const hasStatBlock = Boolean(
      content.statValue || content.statDescription || content.statFootnote,
    );
    const hasStrategySection = Boolean(
      content.strategiesHeading ||
        content.strategiesIntro ||
        content.strategies.length > 0,
    );
    const hasFoodsSection = Boolean(
      content.foodsHeading || content.foodsIntro || content.foods.length > 0,
    );
    const hasCta = Boolean(content.ctaTitle || content.ctaDescription);
    const authorInitials = getAuthorInitials(post.authorName);

    return (
      <>
        <JsonLd data={articlePageStructuredData} />

        <div className="article-page-stack">
          <ArticleHeroBanner post={post} />

          <section className="panel article-shell article-shell-rich">
            <div className="article-header article-header-rich">
            <p className="article-breadcrumb">{breadcrumb}</p>
            <div className="article-pill-row">
              <span className="article-topic-pill">{content.label || post.category}</span>
            </div>
            <h1 className="section-title article-title article-title-rich">{post.title}</h1>
            <BlogDescription
              className="article-subtitle"
              description={content.subtitle || post.subtitle || post.summary}
              paragraphClassName="article-subtitle-paragraph"
            />

            <div className="article-author-row">
              <div className="article-author-badge">{authorInitials}</div>
              <div className="article-author-copy">
                <p className="article-author-name">{post.authorName}</p>
                <p className="article-author-role">{post.authorRole}</p>
              </div>
              <div className="article-meta article-meta-rich">
                <span>{formatPublishedDate(post.createdAt)}</span>
                <span>{post.readTime}</span>
              </div>
            </div>
            </div>

            {content.takeaway ? (
              <aside className="article-takeaway-card">
                <p className="detail-label">Key takeaway</p>
                <BlogDescription
                  className="article-takeaway-copy"
                  description={content.takeaway}
                  paragraphClassName="article-takeaway-paragraph"
                />
              </aside>
            ) : null}

            {content.intro ? (
              <BlogDescription
                className="article-copy-block"
                description={content.intro}
              />
            ) : null}

            {content.bodyHeading || content.body ? (
              <section className="article-section">
                {content.bodyHeading ? (
                  <h2 className="article-section-title">{content.bodyHeading}</h2>
                ) : null}
                {content.body ? (
                  <BlogDescription
                    className="article-copy-block"
                    description={content.body}
                  />
                ) : null}
              </section>
            ) : null}

            {hasStatBlock ? (
              <section className="article-stat-card">
                {content.statValue ? (
                  <p className="article-stat-value">{content.statValue}</p>
                ) : null}
                {content.statDescription ? (
                  <p className="article-stat-description">{content.statDescription}</p>
                ) : null}
                {content.statFootnote ? (
                  <BlogDescription
                    className="article-stat-footnote-rich"
                    description={content.statFootnote}
                    paragraphClassName="article-stat-footnote-paragraph"
                  />
                ) : null}
              </section>
            ) : null}

            {hasStrategySection ? (
              <section className="article-section">
                {content.strategiesHeading ? (
                  <h2 className="article-section-title">
                    {content.strategiesHeading}
                  </h2>
                ) : null}
                {content.strategiesIntro ? (
                  <BlogDescription
                    className="article-section-intro"
                    description={content.strategiesIntro}
                    paragraphClassName="article-section-intro-paragraph"
                  />
                ) : null}

                {content.strategies.length > 0 ? (
                  <div className="article-card-grid">
                    {content.strategies.map((strategy, index) => (
                      <article className="article-info-card" key={`${strategy.title}-${index}`}>
                        <span className="article-card-index">{index + 1}</span>
                        <h3 className="article-card-title">{strategy.title}</h3>
                        <BlogDescription
                          className="article-card-copy"
                          description={strategy.description}
                          paragraphClassName="article-card-paragraph"
                        />
                      </article>
                    ))}
                  </div>
                ) : null}
              </section>
            ) : null}

            {hasFoodsSection ? (
              <section className="article-section">
                {content.foodsHeading ? (
                  <h2 className="article-section-title">{content.foodsHeading}</h2>
                ) : null}
                {content.foodsIntro ? (
                  <BlogDescription
                    className="article-section-intro"
                    description={content.foodsIntro}
                    paragraphClassName="article-section-intro-paragraph"
                  />
                ) : null}

                {content.foods.length > 0 ? (
                  <div className="article-food-grid">
                    {content.foods.map((food, index) => (
                      <article className="article-food-card" key={`${food.title}-${index}`}>
                        <span className="article-food-dot" />
                        <h3 className="article-food-title">{food.title}</h3>
                        <BlogDescription
                          className="article-food-copy"
                          description={food.description}
                          paragraphClassName="article-food-paragraph"
                        />
                      </article>
                    ))}
                  </div>
                ) : null}
              </section>
            ) : null}

            {content.closingHeading || content.closing ? (
              <section className="article-section">
                {content.closingHeading ? (
                  <h2 className="article-section-title">{content.closingHeading}</h2>
                ) : null}
                {content.closing ? (
                  <BlogDescription
                    className="article-copy-block"
                    description={content.closing}
                  />
                ) : null}
              </section>
            ) : null}

            {hasCta ? (
              <section className="article-cta-card">
                {content.ctaTitle ? (
                  <h2 className="card-title card-title-lg">{content.ctaTitle}</h2>
                ) : null}
                {content.ctaDescription ? (
                  <BlogDescription
                    className="article-cta-copy"
                    description={content.ctaDescription}
                    paragraphClassName="article-cta-paragraph"
                  />
                ) : null}
                <div className="article-cta-actions">
                  {content.ctaPrimaryLabel && content.ctaPrimaryHref ? (
                    isInternalHref(content.ctaPrimaryHref) ? (
                      <Link className="button-primary" href={content.ctaPrimaryHref}>
                        {content.ctaPrimaryLabel}
                      </Link>
                    ) : (
                      <a
                        className="button-primary"
                        href={content.ctaPrimaryHref}
                        rel={getExternalRel(content.ctaPrimaryHref)}
                        target="_blank"
                      >
                        {content.ctaPrimaryLabel}
                      </a>
                    )
                  ) : null}
                  {content.ctaSecondaryLabel && content.ctaSecondaryHref ? (
                    isInternalHref(content.ctaSecondaryHref) ? (
                      <Link className="button-secondary" href={content.ctaSecondaryHref}>
                        {content.ctaSecondaryLabel}
                      </Link>
                    ) : (
                      <a
                        className="button-secondary"
                        href={content.ctaSecondaryHref}
                        rel={getExternalRel(content.ctaSecondaryHref)}
                        target="_blank"
                      >
                        {content.ctaSecondaryLabel}
                      </a>
                    )
                  ) : null}
                </div>
              </section>
            ) : null}

            <RecommendedArticleProducts products={recommendedProducts} />

            {post.tags.length > 0 ? (
              <div className="tag-row article-tag-row">
                {post.tags.map((tag) => (
                  <span className="tag" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}

            <PerimenopauseGuideCta />

            {relatedPosts.length > 0 ? (
              <section className="article-related-section">
                <h2 className="article-section-title">Keep reading</h2>
                <div className="article-related-grid">
                  {relatedPosts.map((relatedPost) => (
                    <article className="article-related-card" key={relatedPost.slug}>
                      <span className="article-related-dot" />
                      <p className="feature-kicker">{relatedPost.category}</p>
                      <h3 className="card-title">{relatedPost.title}</h3>
                      <p className="muted">{relatedPost.summary}</p>
                      <Link className="blog-link" href={relatedPost.href}>
                        {relatedPost.source === "managed" ? "Read article" : "Open topic"}
                      </Link>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}
          </section>
        </div>
      </>
    );
  }

  return (
    <>
      <JsonLd data={articlePageStructuredData} />

      <div className="article-page-stack">
        <ArticleHeroBanner post={post} />

        <section className="panel article-shell article-shell-rich">
          <div className="article-header">
          <p className="eyebrow">Bloom35 blog</p>
          <div className="article-meta">
            <span>{formatPublishedDate(post.createdAt)}</span>
            <span>{post.readTime}</span>
            {post.hasAffiliateLinks ? <span>Includes affiliate links</span> : null}
          </div>
          <h1 className="section-title article-title">{post.title}</h1>
          <p className="muted article-summary">{post.summary}</p>

          {post.tags.length > 0 ? (
            <div className="tag-row">
              {post.tags.map((tag) => (
                <span className="tag" key={tag}>
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
          </div>

          <BlogDescription description={post.description} />

          {post.hasAffiliateLinks ? (
            <p className="article-note">
              Product links inside this article may be Amazon affiliate links.
            </p>
          ) : null}

          <RecommendedArticleProducts products={recommendedProducts} />

          <div className="article-actions">
            <Link className="button-secondary" href="/library">
              Back to library
            </Link>
          </div>

          <PerimenopauseGuideCta />

          {relatedPosts.length > 0 ? (
            <section className="article-related-section">
              <h2 className="article-section-title">Keep reading</h2>
              <div className="article-related-grid">
                {relatedPosts.map((relatedPost) => (
                  <article className="article-related-card" key={relatedPost.slug}>
                    <span className="article-related-dot" />
                    <p className="feature-kicker">{relatedPost.category}</p>
                    <h3 className="card-title">{relatedPost.title}</h3>
                    <p className="muted">{relatedPost.summary}</p>
                    <Link className="blog-link" href={relatedPost.href}>
                      {relatedPost.source === "managed" ? "Read article" : "Open topic"}
                    </Link>
                  </article>
                ))}
              </div>
            </section>
          ) : null}
        </section>
      </div>
    </>
  );
}
