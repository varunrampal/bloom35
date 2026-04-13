"use client";

import { useState } from "react";

import type { BlogArticleCard, BlogArticleContent } from "@/lib/app-data";

const createEmptyCard = (): BlogArticleCard => ({
  description: "",
  title: "",
});

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
  initialContent?: Partial<BlogArticleContent>;
  initialTags?: string[];
  initialTitle?: string;
  submitLabel?: string;
};

export function AdminBlogComposer({
  initialContent,
  initialTags = [],
  initialTitle = "",
  submitLabel = "Save blog post",
}: AdminBlogComposerProps) {
  const [content, setContent] = useState<BlogArticleContent>(() =>
    createInitialContent(initialContent),
  );

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
        already have an image inside <code>public/</code>, you can still paste a
        path like <code>/blog/my-article-banner.jpg</code>. If both are provided,
        the uploaded file is used. Keep uploads at 5 MB or less.
      </p>

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
