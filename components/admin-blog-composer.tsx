"use client";

import Link from "next/link";
import type { ChangeEvent } from "react";
import { useDeferredValue, useState } from "react";

import type {
  BlogArticleCard,
  BlogArticleContent,
  BlogRecommendedProductOption,
} from "@/lib/app-data";

const createEmptyCard = (): BlogArticleCard => ({
  description: "",
  title: "",
});

const MAX_BLOG_HERO_IMAGE_BYTES = 5 * 1024 * 1024;

const defaultContent: BlogArticleContent = {
  authorName: "Bloom35 Editorial Team",
  authorRole: "Registered Dietitian | Women's Hormonal Health",
  body: "",
  bodyHeading: "Why this happens",
  breadcrumb: "Bloom35 > Metabolism > Weight loss after 30",
  closing: "",
  closingHeading: "The hormone connection",
  ctaDescription: "",
  ctaPrimaryHref: "",
  ctaPrimaryLabel: "Get the plan",
  ctaSecondaryHref: "",
  ctaSecondaryLabel: "Download the guide",
  ctaTitle: "",
  foods: Array.from({ length: 6 }, createEmptyCard),
  foodsHeading: "Foods that support your goals",
  foodsIntro: "",
  heroImageAlt: "",
  heroImageSrc: "",
  intro: "",
  label: "Metabolism",
  recommendedProductIds: [],
  statDescription: "",
  statFootnote: "",
  statValue: "",
  strategies: Array.from({ length: 6 }, createEmptyCard),
  strategiesHeading: "Strategies that actually help",
  strategiesIntro: "",
  subtitle: "",
  takeaway: "",
};

const createInitialContent = (
  initialContent?: Partial<BlogArticleContent>,
): BlogArticleContent => ({
  ...defaultContent,
  ...initialContent,
  foods:
    initialContent?.foods && initialContent.foods.length > 0
      ? initialContent.foods
      : defaultContent.foods,
  strategies:
    initialContent?.strategies && initialContent.strategies.length > 0
      ? initialContent.strategies
      : defaultContent.strategies,
});

type CardListKey = "foods" | "strategies";
type CardFieldKey = keyof BlogArticleCard;

const cardSectionCopy: Record<CardListKey, string> = {
  foods: "Food highlight",
  strategies: "Strategy card",
};

type AdminBlogComposerProps = {
  availableProducts?: BlogRecommendedProductOption[];
  initialContent?: Partial<BlogArticleContent>;
  initialTags?: string[];
  initialTitle?: string;
  submitLabel?: string;
};

export function AdminBlogComposer({
  availableProducts = [],
  initialContent,
  initialTags = [],
  initialTitle = "",
  submitLabel = "Save blog post",
}: AdminBlogComposerProps) {
  const availableProductIdSet = new Set(
    availableProducts.map((product) => product.id),
  );
  const [content, setContent] = useState<BlogArticleContent>(() => {
    const nextContent = createInitialContent(initialContent);

    return {
      ...nextContent,
      recommendedProductIds: nextContent.recommendedProductIds.filter((productId) =>
        availableProductIdSet.has(productId),
      ),
    };
  });
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [heroImageValidationMessage, setHeroImageValidationMessage] = useState("");
  const deferredProductSearchQuery = useDeferredValue(productSearchQuery);

  const handleHeroImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    const nextValidationMessage =
      selectedFile && selectedFile.size > MAX_BLOG_HERO_IMAGE_BYTES
        ? "Banner image must be 5 MB or smaller."
        : "";

    event.target.setCustomValidity(nextValidationMessage);

    if (nextValidationMessage) {
      event.target.reportValidity();
    }

    setHeroImageValidationMessage(nextValidationMessage);
  };

  const updateField = <Key extends keyof BlogArticleContent>(
    key: Key,
    value: BlogArticleContent[Key],
  ) => {
    setContent((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const updateCard = (
    listKey: CardListKey,
    index: number,
    field: CardFieldKey,
    value: string,
  ) => {
    setContent((current) => ({
      ...current,
      [listKey]: current[listKey].map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    }));
  };

  const addCard = (listKey: CardListKey) => {
    setContent((current) => ({
      ...current,
      [listKey]: [...current[listKey], createEmptyCard()],
    }));
  };

  const removeCard = (listKey: CardListKey, index: number) => {
    setContent((current) => ({
      ...current,
      [listKey]:
        current[listKey].length > 1
          ? current[listKey].filter((_, itemIndex) => itemIndex !== index)
          : current[listKey],
    }));
  };

  const toggleRecommendedProduct = (productId: number) => {
    setContent((current) => {
      const hasProduct = current.recommendedProductIds.includes(productId);

      return {
        ...current,
        recommendedProductIds: hasProduct
          ? current.recommendedProductIds.filter((id) => id !== productId)
          : [...current.recommendedProductIds, productId],
      };
    });
  };

  const normalizedProductSearchQuery = deferredProductSearchQuery
    .trim()
    .toLowerCase();
  const availableProductMap = new Map(
    availableProducts.map((product) => [product.id, product]),
  );
  const selectedProductIdSet = new Set(content.recommendedProductIds);
  const selectedProducts = content.recommendedProductIds
    .map((productId) => availableProductMap.get(productId))
    .filter((product): product is BlogRecommendedProductOption => Boolean(product));
  const matchingProducts = availableProducts.filter((product) => {
    if (selectedProductIdSet.has(product.id)) {
      return false;
    }

    if (!normalizedProductSearchQuery) {
      return true;
    }

    const searchableText = [
      product.title,
      product.category,
      product.bestFor,
      product.summary,
    ]
      .join(" ")
      .toLowerCase();

    return searchableText.includes(normalizedProductSearchQuery);
  });
  const visibleMatchingProducts = matchingProducts.slice(0, 12);
  const hiddenMatchingProductsCount = Math.max(
    0,
    matchingProducts.length - visibleMatchingProducts.length,
  );
  const selectedRecommendedProductCount = content.recommendedProductIds.length;

  return (
    <>
      <label className="field-stack">
        <span className="subsection-label">Blog title</span>
        <input
          className="input-control"
          defaultValue={initialTitle}
          name="title"
          placeholder="How to lose weight with a slow metabolism after 30"
          required
          type="text"
        />
      </label>

      <div className="field-grid">
        <label className="field-stack">
          <span className="subsection-label">Article label</span>
          <input
            className="input-control"
            onChange={(event) => updateField("label", event.target.value)}
            placeholder="Metabolism"
            type="text"
            value={content.label}
          />
        </label>

        <label className="field-stack">
          <span className="subsection-label">Tags</span>
          <input
            className="input-control"
            defaultValue={initialTags.join(", ")}
            name="tags"
            placeholder="metabolism, weight loss after 30, hormones"
            type="text"
          />
        </label>
      </div>

      <label className="field-stack">
        <span className="subsection-label">Breadcrumb line</span>
        <input
          className="input-control"
          onChange={(event) => updateField("breadcrumb", event.target.value)}
          placeholder="Bloom35 > Metabolism > Weight loss after 30"
          type="text"
          value={content.breadcrumb}
        />
      </label>

      <label className="field-stack">
        <span className="subsection-label">Subtitle</span>
        <textarea
          className="textarea"
          onChange={(event) => updateField("subtitle", event.target.value)}
          placeholder="Your body changes, but that does not mean progress is impossible. Use this as the article summary shown under the headline and in the library cards."
          rows={3}
          value={content.subtitle}
        />
      </label>

      <div className="field-grid">
        <label className="field-stack">
          <span className="subsection-label">Author name</span>
          <input
            className="input-control"
            onChange={(event) => updateField("authorName", event.target.value)}
            placeholder="Emma Clarke, RD"
            type="text"
            value={content.authorName}
          />
        </label>

        <label className="field-stack">
          <span className="subsection-label">Author role</span>
          <input
            className="input-control"
            onChange={(event) => updateField("authorRole", event.target.value)}
            placeholder="Registered Dietitian | Women's Hormonal Health"
            type="text"
            value={content.authorRole}
          />
        </label>
      </div>

      <div className="field-grid">
        <label className="field-stack">
          <span className="subsection-label">Banner image upload</span>
          <input
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="input-control"
            name="heroImageFile"
            onChange={handleHeroImageChange}
            type="file"
          />
        </label>

        <label className="field-stack">
          <span className="subsection-label">Existing banner image path</span>
          <input
            className="input-control"
            onChange={(event) => updateField("heroImageSrc", event.target.value)}
            placeholder="/blog/my-article-banner.jpg"
            type="text"
            value={content.heroImageSrc}
          />
        </label>

        <label className="field-stack">
          <span className="subsection-label">Banner image alt text</span>
          <input
            className="input-control"
            onChange={(event) => updateField("heroImageAlt", event.target.value)}
            placeholder="Warm editorial image for this article"
            type="text"
            value={content.heroImageAlt}
          />
        </label>
      </div>

      <p className="muted">
        Upload a JPG, PNG, WebP, or AVIF banner while creating the post. If you
        already have an image URL or a file inside <code>public/</code>, you can
        still paste a path like <code>/blog/my-article-banner.jpg</code>. If both
        are provided, the uploaded file is used. Keep uploads at 5 MB or less.
      </p>

      {heroImageValidationMessage ? (
        <p
          aria-live="polite"
          className="status-banner status-banner-error"
        >
          {heroImageValidationMessage}
        </p>
      ) : null}

      <section className="composer-section">
        <div className="composer-section-copy">
          <p className="eyebrow">Recommended products</p>
          <h3 className="card-title">Link saved products to this article</h3>
          <p className="muted">
            Choose from your saved product library while writing the post. Enabled
            products show on the live article page, while disabled ones stay hidden
            until you re-enable them.
          </p>
        </div>

        {availableProducts.length > 0 ? (
          <>
            <div className="composer-linked-products-meta">
              <div>
                <p className="detail-label">Selected products</p>
                <p className="detail-value">{selectedRecommendedProductCount}</p>
              </div>
              <p className="muted">
                Search by title, category, or use case, then add only the products
                you want rendered in the recommended products section on the live
                article page.
              </p>
            </div>

            <div className="composer-product-toolbar">
              <label className="field-stack">
                <span className="subsection-label">Search saved products</span>
                <input
                  className="input-control"
                  onChange={(event) => setProductSearchQuery(event.target.value)}
                  placeholder="Search by title, category, or best-for use"
                  type="search"
                  value={productSearchQuery}
                />
              </label>

              <p className="muted composer-product-results-note">
                {normalizedProductSearchQuery
                  ? `Matching products: ${matchingProducts.length}`
                  : `Showing the most recent products first. Total saved products: ${availableProducts.length}`}
              </p>
            </div>

            <div className="composer-product-picker-layout">
              <section className="composer-product-pane">
                <div className="composer-product-pane-header">
                  <h4 className="card-title">Selected products</h4>
                  <span className="chip">{selectedRecommendedProductCount}</span>
                </div>

                {selectedProducts.length > 0 ? (
                  <div className="composer-product-list">
                    {selectedProducts.map((product) => (
                      <article className="composer-product-row" key={`selected-${product.id}`}>
                        <div className="composer-product-row-copy">
                          <div className="composer-product-row-heading">
                            <p className="feature-kicker">{product.category}</p>
                            <div className="chip-row">
                              <span className="chip">{product.bestFor}</span>
                              <span className="chip">
                                {product.isEnabled ? "Enabled" : "Disabled"}
                              </span>
                            </div>
                          </div>
                          <h4 className="card-title">{product.title}</h4>
                          <p className="muted">{product.summary}</p>
                        </div>

                        <button
                          className="ghost-button"
                          onClick={() => toggleRecommendedProduct(product.id)}
                          type="button"
                        >
                          Remove
                        </button>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state composer-empty-state">
                    Start searching to add products to this article.
                  </div>
                )}
              </section>

              <section className="composer-product-pane">
                <div className="composer-product-pane-header">
                  <h4 className="card-title">
                    {normalizedProductSearchQuery ? "Search results" : "Browse products"}
                  </h4>
                  <span className="chip">{matchingProducts.length}</span>
                </div>

                {visibleMatchingProducts.length > 0 ? (
                  <>
                    <div className="composer-product-list">
                      {visibleMatchingProducts.map((product) => (
                        <article className="composer-product-row" key={`result-${product.id}`}>
                          <div className="composer-product-row-copy">
                            <div className="composer-product-row-heading">
                              <p className="feature-kicker">{product.category}</p>
                              <div className="chip-row">
                                <span className="chip">{product.bestFor}</span>
                                <span className="chip">
                                  {product.isEnabled ? "Enabled" : "Disabled"}
                                </span>
                              </div>
                            </div>
                            <h4 className="card-title">{product.title}</h4>
                            <p className="muted">{product.summary}</p>
                          </div>

                          <button
                            className="button-secondary"
                            onClick={() => toggleRecommendedProduct(product.id)}
                            type="button"
                          >
                            Add
                          </button>
                        </article>
                      ))}
                    </div>

                    {hiddenMatchingProductsCount > 0 ? (
                      <p className="muted composer-product-results-note">
                        Showing the first {visibleMatchingProducts.length} matches. Refine
                        your search to narrow the remaining {hiddenMatchingProductsCount}.
                      </p>
                    ) : null}
                  </>
                ) : (
                  <div className="empty-state composer-empty-state">
                    {normalizedProductSearchQuery
                      ? "No saved products match that search yet."
                      : "All saved products are already linked to this article."}
                  </div>
                )}
              </section>
            </div>
          </>
        ) : (
          <div className="empty-state composer-empty-state">
            <p>
              No saved products are available yet. Create a product first, then come
              back to link it to this article.
            </p>
            <Link className="button-secondary" href="/admin/products/create">
              Create New Product
            </Link>
          </div>
        )}
      </section>

      <section className="composer-section">
        <div className="composer-section-copy">
          <p className="eyebrow">Lead section</p>
          <h3 className="card-title">Intro and key takeaway</h3>
          <p className="muted">
            Use blank lines for paragraphs. Affiliate links work inside any text
            area with markdown syntax like{" "}
            <code>[magnesium](https://amzn.to/...)</code>.
          </p>
        </div>

        <label className="field-stack">
          <span className="subsection-label">Key takeaway</span>
          <textarea
            className="textarea"
            onChange={(event) => updateField("takeaway", event.target.value)}
            placeholder="After 30, your metabolism slows gradually, but targeted nutrition, strength training, and hormone awareness can keep fat loss realistic."
            rows={4}
            value={content.takeaway}
          />
        </label>

        <label className="field-stack">
          <span className="subsection-label">Opening paragraphs</span>
          <textarea
            className="textarea"
            onChange={(event) => updateField("intro", event.target.value)}
            placeholder="Write the opening section here. Separate paragraphs with a blank line."
            rows={8}
            value={content.intro}
          />
        </label>
      </section>

      <section className="composer-section">
        <div className="composer-section-copy">
          <p className="eyebrow">Body section</p>
          <h3 className="card-title">Primary explanation block</h3>
        </div>

        <label className="field-stack">
          <span className="subsection-label">Section heading</span>
          <input
            className="input-control"
            onChange={(event) => updateField("bodyHeading", event.target.value)}
            placeholder="Why your metabolism slows after 30"
            type="text"
            value={content.bodyHeading}
          />
        </label>

        <label className="field-stack">
          <span className="subsection-label">Section content</span>
          <textarea
            className="textarea"
            onChange={(event) => updateField("body", event.target.value)}
            placeholder="Explain the biology here. Separate paragraphs with blank lines."
            rows={8}
            value={content.body}
          />
        </label>
      </section>

      <section className="composer-section">
        <div className="composer-section-copy">
          <p className="eyebrow">Highlight block</p>
          <h3 className="card-title">Stat callout</h3>
        </div>

        <div className="field-grid">
          <label className="field-stack">
            <span className="subsection-label">Stat value</span>
            <input
              className="input-control"
              onChange={(event) => updateField("statValue", event.target.value)}
              placeholder="200-300"
              type="text"
              value={content.statValue}
            />
          </label>

          <label className="field-stack">
            <span className="subsection-label">Stat description</span>
            <input
              className="input-control"
              onChange={(event) =>
                updateField("statDescription", event.target.value)
              }
              placeholder="Extra calories your body burns per day by age 35"
              type="text"
              value={content.statDescription}
            />
          </label>
        </div>

        <label className="field-stack">
          <span className="subsection-label">Stat footnote</span>
          <textarea
            className="textarea"
            onChange={(event) => updateField("statFootnote", event.target.value)}
            placeholder="Add a short line that explains the context of the stat."
            rows={3}
            value={content.statFootnote}
          />
        </label>
      </section>

      <section className="composer-section">
        <div className="composer-section-copy">
          <p className="eyebrow">Card grid</p>
          <h3 className="card-title">Strategies section</h3>
        </div>

        <label className="field-stack">
          <span className="subsection-label">Strategies heading</span>
          <input
            className="input-control"
            onChange={(event) =>
              updateField("strategiesHeading", event.target.value)
            }
            placeholder="7 proven strategies that actually work"
            type="text"
            value={content.strategiesHeading}
          />
        </label>

        <label className="field-stack">
          <span className="subsection-label">Strategies intro</span>
          <textarea
            className="textarea"
            onChange={(event) =>
              updateField("strategiesIntro", event.target.value)
            }
            placeholder="Add a short setup sentence before the cards."
            rows={3}
            value={content.strategiesIntro}
          />
        </label>

        <div className="composer-card-grid">
          {content.strategies.map((item, index) => (
            <article className="composer-card" key={`strategy-${index + 1}`}>
              <div className="composer-card-header">
                <span className="composer-card-index">{index + 1}</span>
                <button
                  className="ghost-button composer-remove-button"
                  onClick={() => removeCard("strategies", index)}
                  type="button"
                >
                  Remove
                </button>
              </div>

              <label className="field-stack">
                <span className="subsection-label">
                  {cardSectionCopy.strategies} title
                </span>
                <input
                  className="input-control"
                  onChange={(event) =>
                    updateCard("strategies", index, "title", event.target.value)
                  }
                  placeholder="Prioritize protein at every meal"
                  type="text"
                  value={item.title}
                />
              </label>

              <label className="field-stack">
                <span className="subsection-label">
                  {cardSectionCopy.strategies} description
                </span>
                <textarea
                  className="textarea"
                  onChange={(event) =>
                    updateCard(
                      "strategies",
                      index,
                      "description",
                      event.target.value,
                    )
                  }
                  placeholder="Explain why this strategy matters."
                  rows={4}
                  value={item.description}
                />
              </label>
            </article>
          ))}
        </div>

        <button
          className="button-secondary"
          onClick={() => addCard("strategies")}
          type="button"
        >
          Add strategy card
        </button>
      </section>

      <section className="composer-section">
        <div className="composer-section-copy">
          <p className="eyebrow">Food grid</p>
          <h3 className="card-title">Supportive foods section</h3>
        </div>

        <label className="field-stack">
          <span className="subsection-label">Foods heading</span>
          <input
            className="input-control"
            onChange={(event) => updateField("foodsHeading", event.target.value)}
            placeholder="Foods that specifically boost metabolism after 30"
            type="text"
            value={content.foodsHeading}
          />
        </label>

        <label className="field-stack">
          <span className="subsection-label">Foods intro</span>
          <textarea
            className="textarea"
            onChange={(event) => updateField("foodsIntro", event.target.value)}
            placeholder="Add a short paragraph above the food cards."
            rows={3}
            value={content.foodsIntro}
          />
        </label>

        <div className="composer-card-grid composer-card-grid-compact">
          {content.foods.map((item, index) => (
            <article className="composer-card" key={`food-${index + 1}`}>
              <div className="composer-card-header">
                <span className="composer-card-index">{index + 1}</span>
                <button
                  className="ghost-button composer-remove-button"
                  onClick={() => removeCard("foods", index)}
                  type="button"
                >
                  Remove
                </button>
              </div>

              <label className="field-stack">
                <span className="subsection-label">
                  {cardSectionCopy.foods} title
                </span>
                <input
                  className="input-control"
                  onChange={(event) =>
                    updateCard("foods", index, "title", event.target.value)
                  }
                  placeholder="Greek yogurt"
                  type="text"
                  value={item.title}
                />
              </label>

              <label className="field-stack">
                <span className="subsection-label">
                  {cardSectionCopy.foods} description
                </span>
                <textarea
                  className="textarea"
                  onChange={(event) =>
                    updateCard("foods", index, "description", event.target.value)
                  }
                  placeholder="Why this food helps."
                  rows={4}
                  value={item.description}
                />
              </label>
            </article>
          ))}
        </div>

        <button
          className="button-secondary"
          onClick={() => addCard("foods")}
          type="button"
        >
          Add food card
        </button>
      </section>

      <section className="composer-section">
        <div className="composer-section-copy">
          <p className="eyebrow">Closing section</p>
          <h3 className="card-title">Hormone connection and CTA</h3>
        </div>

        <label className="field-stack">
          <span className="subsection-label">Closing heading</span>
          <input
            className="input-control"
            onChange={(event) => updateField("closingHeading", event.target.value)}
            placeholder="The hormone connection most women miss"
            type="text"
            value={content.closingHeading}
          />
        </label>

        <label className="field-stack">
          <span className="subsection-label">Closing content</span>
          <textarea
            className="textarea"
            onChange={(event) => updateField("closing", event.target.value)}
            placeholder="Wrap up the article here."
            rows={7}
            value={content.closing}
          />
        </label>

        <label className="field-stack">
          <span className="subsection-label">CTA title</span>
          <input
            className="input-control"
            onChange={(event) => updateField("ctaTitle", event.target.value)}
            placeholder="Get your free hormone-reset meal plan"
            type="text"
            value={content.ctaTitle}
          />
        </label>

        <label className="field-stack">
          <span className="subsection-label">CTA description</span>
          <textarea
            className="textarea"
            onChange={(event) => updateField("ctaDescription", event.target.value)}
            placeholder="Describe the offer or next step."
            rows={4}
            value={content.ctaDescription}
          />
        </label>

        <div className="field-grid">
          <label className="field-stack">
            <span className="subsection-label">Primary CTA label</span>
            <input
              className="input-control"
              onChange={(event) =>
                updateField("ctaPrimaryLabel", event.target.value)
              }
              placeholder="Get the meal plan"
              type="text"
              value={content.ctaPrimaryLabel}
            />
          </label>

          <label className="field-stack">
            <span className="subsection-label">Primary CTA URL</span>
            <input
              className="input-control"
              onChange={(event) =>
                updateField("ctaPrimaryHref", event.target.value)
              }
              placeholder="https://..."
              type="url"
              value={content.ctaPrimaryHref}
            />
          </label>
        </div>

        <div className="field-grid">
          <label className="field-stack">
            <span className="subsection-label">Secondary CTA label</span>
            <input
              className="input-control"
              onChange={(event) =>
                updateField("ctaSecondaryLabel", event.target.value)
              }
              placeholder="Download the guide"
              type="text"
              value={content.ctaSecondaryLabel}
            />
          </label>

          <label className="field-stack">
            <span className="subsection-label">Secondary CTA URL</span>
            <input
              className="input-control"
              onChange={(event) =>
                updateField("ctaSecondaryHref", event.target.value)
              }
              placeholder="https://..."
              type="url"
              value={content.ctaSecondaryHref}
            />
          </label>
        </div>
      </section>

      <textarea
        hidden
        name="contentJson"
        readOnly
        value={JSON.stringify(content)}
      />

      <button className="button-primary" type="submit">
        {submitLabel}
      </button>
    </>
  );
}
