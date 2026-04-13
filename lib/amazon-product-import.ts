import "server-only";

type ImportedAmazonProduct = {
  affiliateUrl: string;
  bestFor: string;
  category: string;
  ctaLabel: string;
  imageAlt: string;
  imageSrc: string;
  resolvedUrl: string;
  summary: string;
  title: string;
};

type ProductImportOptions = {
  affiliateUrl: string;
  bestFor?: string;
  category?: string;
};

const AMAZON_HOST_PATTERN = /(^|\.)amazon\./i;
const AMAZON_SHORT_HOST_PATTERN = /(^|\.)amzn\.to$/i;
const FETCH_HEADERS = {
  "accept-language": "en-US,en;q=0.9",
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0 Safari/537.36",
};

const normalizeWhitespace = (value: string) =>
  value.replace(/\s+/g, " ").trim();

const decodeHtmlEntities = (value: string) =>
  value
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#x2F;/g, "/")
    .replace(/&#x27;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));

const stripHtml = (value: string) =>
  normalizeWhitespace(
    decodeHtmlEntities(
      value
        .replace(/<script[\s\S]*?<\/script>/gi, " ")
        .replace(/<style[\s\S]*?<\/style>/gi, " ")
        .replace(/<[^>]+>/g, " "),
    ),
  );

const firstMatch = (html: string, patterns: RegExp[]) => {
  for (const pattern of patterns) {
    const match = html.match(pattern);

    if (match?.[1]) {
      return normalizeWhitespace(decodeHtmlEntities(match[1]));
    }
  }

  return "";
};

const trimAmazonTitle = (title: string) =>
  normalizeWhitespace(
    title
      .replace(/\s*:\s*Amazon\.[A-Za-z.]+$/i, "")
      .replace(/\s*-\s*Amazon\.[A-Za-z.]+$/i, ""),
  );

const toShortSummary = (value: string) => {
  const plainText = stripHtml(value);

  if (plainText.length <= 190) {
    return plainText;
  }

  const clipped = plainText.slice(0, 187).trimEnd();
  const boundary = clipped.lastIndexOf(" ");

  return `${clipped.slice(0, boundary > 120 ? boundary : clipped.length)}...`;
};

const sanitizeImageUrl = (value: string) =>
  decodeHtmlEntities(value)
    .replace(/\\u0026/g, "&")
    .replace(/\\\//g, "/")
    .trim();

const extractFeatureBulletSummary = (html: string) => {
  const featureBlockMatch = html.match(
    /<div[^>]+id=["']feature-bullets["'][\s\S]*?<\/div>\s*<\/div>/i,
  );

  if (!featureBlockMatch) {
    return "";
  }

  const bulletMatches = [
    ...featureBlockMatch[0].matchAll(
      /<span[^>]*class=["'][^"']*a-list-item[^"']*["'][^>]*>([\s\S]*?)<\/span>/gi,
    ),
  ];

  const bullets = bulletMatches
    .map((match) => stripHtml(match[1]))
    .filter((value) => value.length > 28)
    .slice(0, 2);

  if (bullets.length === 0) {
    return "";
  }

  return toShortSummary(bullets.join(" "));
};

const extractTitle = (html: string) => {
  const title = firstMatch(html, [
    /<span[^>]+id=["']productTitle["'][^>]*>([\s\S]*?)<\/span>/i,
    /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"]+)["']/i,
    /<title>([^<]+)<\/title>/i,
  ]);

  return trimAmazonTitle(title);
};

const extractImageSrc = (html: string) => {
  const image = firstMatch(html, [
    /<img[^>]+id=["']landingImage["'][^>]+data-old-hires=["']([^"']+)["']/i,
    /"hiRes"\s*:\s*"([^"]+)"/i,
    /"large"\s*:\s*"([^"]+)"/i,
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"]+)["']/i,
    /<img[^>]+id=["']landingImage["'][^>]+src=["']([^"']+)["']/i,
  ]);

  return sanitizeImageUrl(image);
};

const extractSummary = (html: string, title: string) => {
  const featureSummary = extractFeatureBulletSummary(html);

  if (featureSummary) {
    return featureSummary;
  }

  const metaDescription = firstMatch(html, [
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"]+)["']/i,
    /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"]+)["']/i,
  ]);

  if (metaDescription) {
    return toShortSummary(metaDescription);
  }

  if (title) {
    return toShortSummary(`${title} imported from Amazon affiliate link.`);
  }

  return "";
};

const ensureAmazonUrl = (url: URL) => {
  if (
    AMAZON_HOST_PATTERN.test(url.hostname) ||
    AMAZON_SHORT_HOST_PATTERN.test(url.hostname)
  ) {
    return;
  }

  throw new Error("Please use an Amazon product or Amazon short affiliate link.");
};

const inferCategory = (title: string) => {
  const lowerTitle = title.toLowerCase();

  if (
    lowerTitle.includes("blanket") ||
    lowerTitle.includes("cooling") ||
    lowerTitle.includes("fan")
  ) {
    return "Cooling";
  }

  if (
    lowerTitle.includes("bottle") ||
    lowerTitle.includes("mug") ||
    lowerTitle.includes("tumbler")
  ) {
    return "Hydration";
  }

  if (
    lowerTitle.includes("journal") ||
    lowerTitle.includes("notebook") ||
    lowerTitle.includes("planner")
  ) {
    return "Tracking";
  }

  return "Support";
};

const inferBestFor = (title: string) => {
  const lowerTitle = title.toLowerCase();

  if (lowerTitle.includes("blanket") || lowerTitle.includes("fan")) {
    return "Hot sleepers and cooling support";
  }

  if (
    lowerTitle.includes("bottle") ||
    lowerTitle.includes("mug") ||
    lowerTitle.includes("tumbler")
  ) {
    return "Hydration through workdays and warmer afternoons";
  }

  if (
    lowerTitle.includes("journal") ||
    lowerTitle.includes("notebook") ||
    lowerTitle.includes("planner")
  ) {
    return "Tracking symptoms and appointments";
  }

  return "Everyday comfort support";
};

export const importAmazonProductFromAffiliateLink = async ({
  affiliateUrl,
  bestFor,
  category,
}: ProductImportOptions): Promise<ImportedAmazonProduct> => {
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(affiliateUrl);
  } catch {
    throw new Error("Enter a valid Amazon affiliate link.");
  }

  ensureAmazonUrl(parsedUrl);

  const response = await fetch(parsedUrl.toString(), {
    cache: "no-store",
    headers: FETCH_HEADERS,
    redirect: "follow",
  });

  if (!response.ok) {
    throw new Error("Amazon product details could not be fetched right now.");
  }

  const resolvedUrl = response.url;
  const resolvedProductUrl = new URL(resolvedUrl);

  ensureAmazonUrl(resolvedProductUrl);

  const html = await response.text();
  const title = extractTitle(html);
  const imageSrc = extractImageSrc(html);
  const summary = extractSummary(html, title);

  if (!title || !imageSrc || !summary) {
    throw new Error(
      "I could not extract a product title, image, and summary from that Amazon page.",
    );
  }

  return {
    affiliateUrl: parsedUrl.toString(),
    bestFor: bestFor?.trim() || inferBestFor(title),
    category: category?.trim() || inferCategory(title),
    ctaLabel: "View on Amazon",
    imageAlt: `${title} product image`,
    imageSrc,
    resolvedUrl,
    summary,
    title,
  };
};
