import Image from "next/image";
import Link from "next/link";

import {
  affiliateProducts,
  allAffiliateProductsHref,
  commonConcerns,
  resourceTopics,
} from "@/lib/app-data";
import { getHomepageAffiliateProducts } from "@/lib/affiliate-product-store";
import { getHomepageBlogPreviews } from "@/lib/blog-store";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = getHomepageAffiliateProducts(affiliateProducts);
  const blogPosts = getHomepageBlogPreviews(resourceTopics);
  const hasManagedProducts = products.some((product) => "id" in product);
  const featuredProduct = hasManagedProducts
    ? products.find(
        (product) => "isFeatured" in product && product.isFeatured,
      ) ?? null
    : (products[0] ?? null);
  const secondaryProducts = featuredProduct
    ? products.filter((product) => product.href !== featuredProduct.href)
    : products;
  const productCategories = Array.from(
    new Set(products.map((product) => product.category)),
  );

  return (
    <div className="page-stack">
      <section id="about">
        <div className="panel hero-primary">
          <p className="eyebrow">Perimenopause companion</p>
          <h1 className="hero-title">
            Perimenopause care that feels calm, current, and personal.
          </h1>
          <p className="hero-copy">
           Explore practical articles, symptom-based support, trusted product recommendations, and helpful tools designed to make perimenopause feel less confusing.
          </p>

          <div className="cta-row">
            <Link className="button-primary" href="/check-in">
             Products
            </Link>
            <Link className="button-secondary" href="/library">
              Explore Guide
            </Link>
          </div>

          {/* <div className="detail-grid">
            {weeklyPulse.map((item) => (
              <div className="detail-tile" key={item.label}>
                <p className="detail-label">{item.label}</p>
                <p className="detail-value">{item.value}</p>
              </div>
            ))}
          </div> */}
        </div>
      </section>

      <section className="panel section-panel blog-section" id="blog">
        <div className="blog-header">
          <div className="blog-copy">
            <p className="eyebrow">Blog</p>
            <h2 className="section-title">
              Fresh reads for sleep, heat, focus, and care conversations.
            </h2>
            <p className="muted">
              Symptom-based articles, practical guides, and supportive everyday routines.
            </p>
          </div>

          <Link className="button-secondary" href="/library">
            Browse all articles
          </Link>
        </div>

        <div className="blog-grid">
          {blogPosts.map((resource) => (
            <article className="blog-card" id={resource.slug} key={resource.slug}>
              <div className="blog-meta">
                <p className="feature-kicker">{resource.category}</p>
                <span>{resource.readTime}</span>
              </div>
              <h3 className="card-title card-title-lg">{resource.title}</h3>
              <p className="muted">{resource.summary}</p>
              {resource.tags.length > 0 ? (
                <div className="tag-row">
                  {resource.tags.map((tag) => (
                    <span className="tag" key={tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
              <Link className="blog-link" href={resource.href}>
                {resource.source === "managed" ? "Read article" : "Open topic"}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="panel section-panel">
        <p className="eyebrow">Common concerns</p>
        <h2 className="section-title">
          The concerns people often want help with first.
        </h2>
        <p className="muted">
          Explore approachable, everyday support for some of the most commonly searched perimenopause concerns.
        </p>

        <div className="concern-grid">
          {commonConcerns.map((concern) => (
            <article className="concern-card" key={concern.name}>
              <div className="signal-head">
                <h3 className="card-title">{concern.name}</h3>
                <span className="badge">Common</span>
              </div>
              <p className="muted">{concern.summary}</p>
              <p className="concern-detail">
                <strong>Often looks like:</strong> {concern.signal}
              </p>
              <p className="concern-detail">
                <strong>Helpful first support:</strong> {concern.support}
              </p>
              <Link className="concern-link" href={concern.href}>
                Learn more -&gt;
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="panel product-showcase" id="products">
        <div className="product-shell">
          <div className="product-header" id="disclosure">
            <div className="product-intro">
              <p className="eyebrow">Product section</p>
              <h2 className="section-title">
                Comfort-first picks for sleep, cooling, hydration, and simple
                tracking.
              </h2>
              <p className="muted">
               Connecting products to symptoms, comfort, and daily routines.
              </p>

              {productCategories.length > 0 ? (
                <div aria-label="Product categories" className="chip-row">
                  {productCategories.map((category) => (
                    <span className="chip" key={category}>
                      {category}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          {featuredProduct ? (
            <article className="featured-product-card">
              <div className="featured-product-copy">
                <p className="detail-label">Featured pick</p>
                <div className="product-meta">
                  <p className="feature-kicker">{featuredProduct.category}</p>
                  <span className="chip">{featuredProduct.bestFor}</span>
                </div>
                <h3 className="section-title product-feature-title">
                  {featuredProduct.title}
                </h3>
                <p className="muted">{featuredProduct.summary}</p>
                <a
                  className="product-link product-link-strong"
                  href={featuredProduct.href}
                  rel="noopener noreferrer sponsored nofollow"
                  target="_blank"
                >
                  {featuredProduct.ctaLabel}
                </a>
              </div>

              <div className="product-image-frame featured-product-image-frame">
                <Image
                  alt={featuredProduct.imageAlt}
                  className="product-image"
                  height={480}
                  priority={false}
                  sizes="(max-width: 1080px) 100vw, 42vw"
                  src={featuredProduct.imageSrc}
                  width={720}
                />
              </div>
            </article>
          ) : null}

          {secondaryProducts.length > 0 ? (
            <div className="secondary-product-grid">
              {secondaryProducts.map((product) => (
                <article className="product-card" key={`${product.title}-${product.href}`}>
                  <div className="product-image-frame">
                    <Image
                      alt={product.imageAlt}
                      className="product-image"
                      height={480}
                      priority={false}
                      sizes="(max-width: 780px) 100vw, (max-width: 1080px) 50vw, 28vw"
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
          ) : null}

          {products.length === 0 ? (
            <div className="empty-state admin-empty-state">
              No enabled products are live right now. Re-enable a saved product
              in the admin area to show it here again.
            </div>
          ) : null}

          <div className="product-footer">
            <a
              className="button-secondary"
              href={allAffiliateProductsHref}
              rel="noopener noreferrer sponsored nofollow"
              target="_blank"
            >
              View all products
            </a>
          </div>
        </div>
      </section>

      <section className="panel cta-banner">
        <div>
          <p className="eyebrow">Starter guide</p>
          <h2 className="section-title">
            Get a perimenopause starter guide delivered to your inbox.
          </h2>
        </div>

        <div className="guide-signup">
          <form className="guide-form">
            <input
              aria-label="Email address"
              autoComplete="email"
              className="guide-input"
              name="email"
              placeholder="Enter your email"
              type="email"
            />
            <button className="button-primary" type="button">
              Get the free guide
            </button>
          </form>
          <p className="guide-note">
            Practical support, gentle guidance, and no clutter.
          </p>
        </div>
      </section>
    </div>
  );
}
