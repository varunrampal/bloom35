import type { BlogArticleContent } from "@/lib/app-data";

const markdownLinkPattern = /\[([^[\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
const rawUrlPattern = /https?:\/\/[^\s)]+/g;

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

const normalizeDescription = (description: string) =>
  description.replace(/\r\n/g, "\n").trim();

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

const isAmazonAffiliateHost = (hostname: string) =>
  hostname === "amzn.to" ||
  hostname.endsWith(".amzn.to") ||
  hostname === "amazon.com" ||
  hostname.endsWith(".amazon.com") ||
  hostname.startsWith("amazon.") ||
  hostname.includes(".amazon.");

export const isAmazonAffiliateUrl = (value: string) => {
  const safeUrl = toSafeUrl(value);

  if (!safeUrl) {
    return false;
  }

  return isAmazonAffiliateHost(new URL(safeUrl).hostname.toLowerCase());
};

export const plainTextFromBlogDescription = (description: string) =>
  normalizeDescription(description)
    .replace(markdownLinkPattern, "$1")
    .replace(/\s+/g, " ")
    .trim();

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
  const rawUrls = normalizeDescription(description).match(rawUrlPattern) ?? [];

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
  .filter(Boolean)
  .join("\n\n");
