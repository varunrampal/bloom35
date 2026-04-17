import sanitizeHtml from "sanitize-html";

import type { BlogArticleContent } from "@/lib/app-data";

const markdownLinkPattern = /\[([^[\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
const rawUrlPattern = /https?:\/\/[^\s)]+/g;
const htmlHrefPattern = /<a\b[^>]*href=(?:"([^"]+)"|'([^']+)')[^>]*>/gi;
const richTextTagPattern = /<\/?[a-z][\s\S]*>/i;
const richTextAllowedTags = [
  "a",
  "blockquote",
  "br",
  "em",
  "li",
  "ol",
  "p",
  "s",
  "strong",
  "u",
  "ul",
];
const richTextAllowedSchemes = ["http", "https"];

type BlogContentTextSegment = {
  text: string;
  type: "text";
};

type BlogContentLinkSegment = {
  href: string;
  isAffiliate: boolean;
  text: string;
  type: "link";
};

export type BlogContentSegment =
  | BlogContentTextSegment
  | BlogContentLinkSegment;

const richTextBaseOptions = {
  allowedAttributes: {
    a: ["href"],
  },
  allowedSchemes: richTextAllowedSchemes,
  allowedTags: richTextAllowedTags,
  disallowedTagsMode: "discard" as const,
};

const normalizeDescription = (description: string) =>
  description.replace(/\r\n/g, "\n").trim();

const encodeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const decodeHtmlEntities = (value: string) =>
  value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) =>
      String.fromCodePoint(Number.parseInt(code, 16)),
    )
    .replace(/&#(\d+);/g, (_, code: string) =>
      String.fromCodePoint(Number.parseInt(code, 10)),
    );

const toSafeUrl = (value: string) => {
  try {
    const url = new URL(value);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
};

const isInternalHref = (value: string) =>
  value.startsWith("/") || value.startsWith("#");

const normalizeLinkHref = (value: string) => {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return null;
  }

  if (isInternalHref(normalizedValue)) {
    return normalizedValue;
  }

  return toSafeUrl(normalizedValue);
};

const isAmazonAffiliateHost = (hostname: string) =>
  hostname === "amzn.to" ||
  hostname.endsWith(".amzn.to") ||
  hostname === "amazon.com" ||
  hostname.endsWith(".amazon.com") ||
  hostname.startsWith("amazon.") ||
  hostname.includes(".amazon.");

const legacyParagraphToHtml = (paragraph: string) => {
  const compactParagraph = paragraph.replace(/\n+/g, " ").trim();

  if (!compactParagraph) {
    return "";
  }

  let cursor = 0;
  let html = "";

  for (const match of compactParagraph.matchAll(markdownLinkPattern)) {
    const fullMatch = match[0];
    const linkLabel = match[1];
    const rawHref = match[2];
    const safeHref = normalizeLinkHref(rawHref);
    const startIndex = match.index ?? 0;

    if (startIndex > cursor) {
      html += encodeHtml(compactParagraph.slice(cursor, startIndex));
    }

    if (safeHref) {
      html += `<a href="${encodeHtml(safeHref)}">${encodeHtml(linkLabel)}</a>`;
    } else {
      html += encodeHtml(fullMatch);
    }

    cursor = startIndex + fullMatch.length;
  }

  if (cursor < compactParagraph.length) {
    html += encodeHtml(compactParagraph.slice(cursor));
  }

  return html ? `<p>${html}</p>` : "";
};

const richTextHtmlToPlainText = (value: string) => {
  const withLineBreaks = value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|blockquote)>/gi, "\n\n")
    .replace(/<(ul|ol)\b[^>]*>/gi, "\n")
    .replace(/<\/(ul|ol)>/gi, "\n\n")
    .replace(/<li\b[^>]*>/gi, "- ")
    .replace(/<\/li>/gi, "\n");
  const withoutTags = sanitizeHtml(withLineBreaks, {
    allowedAttributes: {},
    allowedTags: [],
  });

  return decodeHtmlEntities(withoutTags)
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
};

export const isAmazonAffiliateUrl = (value: string) => {
  const safeUrl = toSafeUrl(value);

  if (!safeUrl) {
    return false;
  }

  return isAmazonAffiliateHost(new URL(safeUrl).hostname.toLowerCase());
};

export const isRichTextHtml = (description: string) =>
  richTextTagPattern.test(description);

export const sanitizeBlogRichText = (description: string) => {
  const normalizedDescription = normalizeDescription(description);

  if (!normalizedDescription) {
    return "";
  }

  if (!isRichTextHtml(normalizedDescription)) {
    return normalizedDescription;
  }

  const sanitizedDescription = sanitizeHtml(
    normalizedDescription,
    richTextBaseOptions,
  ).trim();

  return richTextHtmlToPlainText(sanitizedDescription)
    ? sanitizedDescription
    : "";
};

export const hasMeaningfulBlogDescription = (description: string) =>
  Boolean(plainTextFromBlogDescription(description));

export const getEditorRichTextHtml = (description: string) => {
  const normalizedDescription = normalizeDescription(description);

  if (!normalizedDescription) {
    return "";
  }

  if (isRichTextHtml(normalizedDescription)) {
    return sanitizeBlogRichText(normalizedDescription);
  }

  return normalizedDescription
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map(legacyParagraphToHtml)
    .join("");
};

export const renderBlogRichTextHtml = (
  description: string,
  paragraphClassName?: string,
) => {
  const richTextDescription = sanitizeBlogRichText(description);

  if (!richTextDescription || !isRichTextHtml(richTextDescription)) {
    return "";
  }

  const paragraphClass = paragraphClassName
    ? `blog-paragraph ${paragraphClassName}`
    : "blog-paragraph";
  const listClass = paragraphClassName
    ? `blog-rich-list ${paragraphClassName}`
    : "blog-rich-list";
  const blockquoteClass = paragraphClassName
    ? `blog-rich-blockquote ${paragraphClassName}`
    : "blog-rich-blockquote";

  return sanitizeHtml(richTextDescription, {
    ...richTextBaseOptions,
    allowedAttributes: {
      ...richTextBaseOptions.allowedAttributes,
      a: ["class", "href", "rel", "target"],
      blockquote: ["class"],
      li: ["class"],
      ol: ["class"],
      p: ["class"],
      ul: ["class"],
    },
    transformTags: {
      a: (_tagName, attribs) => {
        const href = normalizeLinkHref(String(attribs.href ?? ""));

        if (!href) {
          return {
            attribs: {
              class: "blog-inline-link",
            },
            tagName: "span",
          } as { attribs: Record<string, string>; tagName: string };
        }

        if (isInternalHref(href)) {
          return {
            attribs: {
              class: "blog-inline-link",
              href,
            },
            tagName: "a",
          } as { attribs: Record<string, string>; tagName: string };
        }

        return {
          attribs: {
            class: "blog-inline-link",
            href,
            rel: isAmazonAffiliateUrl(href)
              ? "noopener noreferrer sponsored nofollow"
              : "noopener noreferrer nofollow",
            target: "_blank",
          },
          tagName: "a",
        } as { attribs: Record<string, string>; tagName: string };
      },
      blockquote: sanitizeHtml.simpleTransform("blockquote", {
        class: blockquoteClass,
      }),
      li: sanitizeHtml.simpleTransform("li", {
        class: "blog-rich-list-item",
      }),
      ol: sanitizeHtml.simpleTransform("ol", {
        class: listClass,
      }),
      p: sanitizeHtml.simpleTransform("p", {
        class: paragraphClass,
      }),
      ul: sanitizeHtml.simpleTransform("ul", {
        class: listClass,
      }),
    },
  }).trim();
};

export const plainTextFromBlogDescription = (description: string) => {
  const normalizedDescription = normalizeDescription(description);

  if (!normalizedDescription) {
    return "";
  }

  if (isRichTextHtml(normalizedDescription)) {
    return richTextHtmlToPlainText(sanitizeBlogRichText(normalizedDescription))
      .replace(/\s+/g, " ")
      .trim();
  }

  return normalizedDescription
    .replace(markdownLinkPattern, "$1")
    .replace(/\s+/g, " ")
    .trim();
};

export const createBlogSummary = (description: string, maxLength = 180) => {
  const plainText = plainTextFromBlogDescription(description);

  if (plainText.length <= maxLength) {
    return plainText;
  }

  return `${plainText.slice(0, maxLength - 3).trimEnd()}...`;
};

export const estimateReadTime = (description: string) => {
  const wordCount = plainTextFromBlogDescription(description)
    .split(/\s+/)
    .filter(Boolean).length;

  return `${Math.max(1, Math.ceil(wordCount / 180))} min read`;
};

export const hasAmazonAffiliateLinks = (description: string) => {
  const normalizedDescription = normalizeDescription(description);

  if (!normalizedDescription) {
    return false;
  }

  if (isRichTextHtml(normalizedDescription)) {
    const rawLinks = Array.from(
      sanitizeBlogRichText(normalizedDescription).matchAll(htmlHrefPattern),
    )
      .map((match) => match[1] ?? match[2] ?? "")
      .filter(Boolean);

    return rawLinks.some((url) => isAmazonAffiliateUrl(url));
  }

  const rawUrls = normalizedDescription.match(rawUrlPattern) ?? [];

  return rawUrls.some((url) => isAmazonAffiliateUrl(url));
};

export const parseBlogDescription = (
  description: string,
): BlogContentSegment[][] => {
  const normalizedDescription = normalizeDescription(description);

  if (!normalizedDescription) {
    return [];
  }

  return normalizedDescription
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => {
      const compactParagraph = paragraph.replace(/\n+/g, " ");
      const segments: BlogContentSegment[] = [];
      let cursor = 0;

      for (const match of compactParagraph.matchAll(markdownLinkPattern)) {
        const fullMatch = match[0];
        const linkLabel = match[1];
        const rawHref = match[2];
        const safeHref = toSafeUrl(rawHref);
        const startIndex = match.index ?? 0;

        if (startIndex > cursor) {
          segments.push({
            text: compactParagraph.slice(cursor, startIndex),
            type: "text",
          });
        }

        if (safeHref) {
          segments.push({
            href: safeHref,
            isAffiliate: isAmazonAffiliateUrl(safeHref),
            text: linkLabel,
            type: "link",
          });
        } else {
          segments.push({
            text: fullMatch,
            type: "text",
          });
        }

        cursor = startIndex + fullMatch.length;
      }

      if (cursor < compactParagraph.length) {
        segments.push({
          text: compactParagraph.slice(cursor),
          type: "text",
        });
      }

      return segments.length > 0
        ? segments
        : [
            {
              text: compactParagraph,
              type: "text",
            },
          ];
    });
};

export const collectBlogArticleTextContent = (
  content: BlogArticleContent,
) => [
  content.breadcrumb,
  content.label,
  content.subtitle,
  content.authorName,
  content.authorRole,
  content.takeaway,
  content.intro,
  content.bodyHeading,
  content.body,
  content.statValue,
  content.statDescription,
  content.statFootnote,
  content.strategiesHeading,
  content.strategiesIntro,
  ...content.strategies.flatMap((item) => [item.title, item.description]),
  content.foodsHeading,
  content.foodsIntro,
  ...content.foods.flatMap((item) => [item.title, item.description]),
  content.closingHeading,
  content.closing,
  content.ctaTitle,
  content.ctaDescription,
  content.ctaPrimaryLabel,
  content.ctaSecondaryLabel,
]
  .map((value) => plainTextFromBlogDescription(value))
  .filter(Boolean)
  .join("\n\n");
