import "server-only";

import type {
  BlogArticleCard,
  BlogArticleContent,
  BlogPreview,
  ManagedBlogPost,
  ResourceTopic,
} from "@/lib/app-data";
import {
  collectBlogArticleTextContent,
  createBlogSummary,
  estimateReadTime,
  hasAmazonAffiliateLinks,
} from "@/lib/blog-content";
import { resourceTopics } from "@/lib/app-data";
import { executeStatement, queryRow, queryRows } from "@/lib/database";

type StoredBlogPostRow = {
  author_name: string;
  author_role: string;
  breadcrumb: string;
  content_json: string;
  created_at: string;
  description: string;
  id: number;
  label: string;
  slug: string;
  subtitle: string;
  tags: string;
  title: string;
};

type CreateBlogPostInput = {
  content: BlogArticleContent | null;
  description: string;
  tags: string[];
  title: string;
};

type UpdateBlogPostInput = CreateBlogPostInput & {
  postId: number;
};

type BlogListingOptions = {
  page: number;
  pageSize: number;
  query: string;
};

type BlogListingResult = {
  page: number;
  pageSize: number;
  posts: ManagedBlogPost[];
  query: string;
  totalItems: number;
  totalPages: number;
};

const DEFAULT_LABEL = "Guide";
const DEFAULT_AUTHOR_NAME = "Bloom35 Editorial Team";
const DEFAULT_AUTHOR_ROLE = "Bloom35 editorial";

const starterSlugs = new Set(resourceTopics.map((topic) => topic.slug));

const createStarterPreview = (topic: ResourceTopic): BlogPreview => ({
  category: topic.category,
  href: `/library#${topic.slug}`,
  readTime: topic.readTime,
  slug: topic.slug,
  source: "starter",
  summary: topic.summary,
  tags: topic.tags,
  title: topic.title,
});

const parseStoredTags = (value: string) => {
  try {
    const parsed = JSON.parse(value) as unknown;

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
};

const normalizeTag = (tag: string) =>
  tag.trim().toLowerCase().replace(/\s+/g, " ");

const normalizeString = (value: unknown, fallback = "") =>
  typeof value === "string" ? value.trim() || fallback : fallback;

const normalizeCard = (value: unknown): BlogArticleCard | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  const title = normalizeString(record.title);
  const description = normalizeString(record.description);

  if (!title && !description) {
    return null;
  }

  return {
    description,
    title,
  };
};

const normalizeCards = (value: unknown) =>
  Array.isArray(value)
    ? value
        .map(normalizeCard)
        .filter((item): item is BlogArticleCard => item !== null)
    : [];

const normalizePositiveIntegerList = (value: unknown) =>
  Array.isArray(value)
    ? Array.from(
        new Set(
          value
            .map((item) => {
              if (typeof item === "number") {
                return item;
              }

              if (typeof item === "string") {
                return Number.parseInt(item, 10);
              }

              return Number.NaN;
            })
            .filter((item): item is number => Number.isInteger(item) && item > 0),
        ),
      )
    : [];

const hasMeaningfulStructuredContent = (content: BlogArticleContent) =>
  Boolean(
    content.subtitle ||
      content.takeaway ||
      content.intro ||
      content.body ||
      content.statValue ||
      content.strategies.length > 0 ||
      content.foods.length > 0 ||
      content.recommendedProductIds.length > 0 ||
      content.closing ||
      content.ctaTitle ||
      content.ctaDescription,
  );

const parseStructuredContent = (value: string) => {
  try {
    const parsed = JSON.parse(value) as unknown;

    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    const record = parsed as Record<string, unknown>;
    const content: BlogArticleContent = {
      authorName: normalizeString(record.authorName, DEFAULT_AUTHOR_NAME),
      authorRole: normalizeString(record.authorRole, DEFAULT_AUTHOR_ROLE),
      body: normalizeString(record.body),
      bodyHeading: normalizeString(record.bodyHeading),
      breadcrumb: normalizeString(record.breadcrumb),
      closing: normalizeString(record.closing),
      closingHeading: normalizeString(record.closingHeading),
      ctaDescription: normalizeString(record.ctaDescription),
      ctaPrimaryHref: normalizeString(record.ctaPrimaryHref),
      ctaPrimaryLabel: normalizeString(record.ctaPrimaryLabel),
      ctaSecondaryHref: normalizeString(record.ctaSecondaryHref),
      ctaSecondaryLabel: normalizeString(record.ctaSecondaryLabel),
      ctaTitle: normalizeString(record.ctaTitle),
      foods: normalizeCards(record.foods),
      foodsHeading: normalizeString(record.foodsHeading),
      foodsIntro: normalizeString(record.foodsIntro),
      heroImageAlt: normalizeString(record.heroImageAlt),
      heroImageSrc: normalizeString(record.heroImageSrc),
      intro: normalizeString(record.intro),
      label: normalizeString(record.label, DEFAULT_LABEL),
      recommendedProductIds: normalizePositiveIntegerList(record.recommendedProductIds),
      statDescription: normalizeString(record.statDescription),
      statFootnote: normalizeString(record.statFootnote),
      statValue: normalizeString(record.statValue),
      strategies: normalizeCards(record.strategies),
      strategiesHeading: normalizeString(record.strategiesHeading),
      strategiesIntro: normalizeString(record.strategiesIntro),
      subtitle: normalizeString(record.subtitle),
      takeaway: normalizeString(record.takeaway),
    };

    return hasMeaningfulStructuredContent(content) ? content : null;
  } catch {
    return null;
  }
};

export const parseBlogTagsInput = (value: string) =>
  Array.from(
    new Set(
      value
        .split(",")
        .map(normalizeTag)
        .filter(Boolean),
    ),
  );

const createSlugBase = (title: string) =>
  title
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "") || "article";

const getUniqueSlug = async (title: string) => {
  const baseSlug = createSlugBase(title);
  let suffix = 1;
  let candidate = baseSlug;

  while (
    starterSlugs.has(candidate) ||
    (await queryRow<{ slug_exists: number }>(
      `
        SELECT 1 as slug_exists
        FROM blog_posts
        WHERE slug = ?
        LIMIT 1;
      `,
      [candidate],
    ))
  ) {
    suffix += 1;
    candidate = `${baseSlug}-${suffix}`;
  }

  return candidate;
};

const buildDescriptionSource = (
  description: string,
  content: BlogArticleContent | null,
) => {
  const structuredText = content ? collectBlogArticleTextContent(content) : "";
  const fallbackText = description.trim();

  return structuredText || fallbackText || "Blog article";
};

const buildAffiliateDetectionSource = (
  description: string,
  content: BlogArticleContent | null,
) =>
  [
    buildDescriptionSource(description, content),
    content?.ctaPrimaryHref ?? "",
    content?.ctaSecondaryHref ?? "",
  ]
    .filter(Boolean)
    .join("\n\n");

const mapStoredBlogPost = (row: StoredBlogPostRow): ManagedBlogPost => {
  const structuredContent = parseStructuredContent(row.content_json);
  const descriptionSource = buildDescriptionSource(row.description, structuredContent);
  const affiliateDetectionSource = buildAffiliateDetectionSource(
    row.description,
    structuredContent,
  );
  const subtitle = structuredContent?.subtitle || row.subtitle.trim();
  const label = structuredContent?.label || row.label.trim() || DEFAULT_LABEL;
  const authorName =
    structuredContent?.authorName || row.author_name.trim() || DEFAULT_AUTHOR_NAME;
  const authorRole =
    structuredContent?.authorRole || row.author_role.trim() || DEFAULT_AUTHOR_ROLE;
  const breadcrumb = structuredContent?.breadcrumb || row.breadcrumb.trim();
  const hasRecommendedProducts =
    (structuredContent?.recommendedProductIds.length ?? 0) > 0;

  return {
    authorName,
    authorRole,
    breadcrumb,
    category: label,
    createdAt: row.created_at,
    description: row.description,
    hasAffiliateLinks:
      hasRecommendedProducts || hasAmazonAffiliateLinks(affiliateDetectionSource),
    href: `/library/${row.slug}`,
    id: row.id,
    readTime: estimateReadTime(descriptionSource),
    slug: row.slug,
    source: "managed",
    structuredContent,
    subtitle,
    summary: subtitle || createBlogSummary(descriptionSource),
    tags: parseStoredTags(row.tags),
    title: row.title,
  };
};

const selectBlogPostsSql = `
  SELECT
    id,
    slug,
    title,
    description,
    breadcrumb,
    label,
    subtitle,
    author_name,
    author_role,
    content_json,
    tags,
    created_at
  FROM blog_posts
`;

export const getManagedBlogPosts = async () => {
  const rows = await queryRows<StoredBlogPostRow>(`
      ${selectBlogPostsSql}
      ORDER BY datetime(created_at) DESC, id DESC;
    `);

  return rows.map(mapStoredBlogPost);
};

export const getManagedBlogPostBySlug = async (slug: string) => {
  const row = await queryRow<StoredBlogPostRow>(`
      ${selectBlogPostsSql}
      WHERE slug = ?
      LIMIT 1;
    `, [slug]);

  return row ? mapStoredBlogPost(row) : null;
};

export const getManagedBlogPostById = async (postId: number) => {
  const row = await queryRow<StoredBlogPostRow>(`
      ${selectBlogPostsSql}
      WHERE id = ?
      LIMIT 1;
    `, [postId]);

  return row ? mapStoredBlogPost(row) : null;
};

export const createBlogPost = async ({
  content,
  description,
  tags,
  title,
}: CreateBlogPostInput) => {
  const slug = await getUniqueSlug(title);
  const normalizedContent = content
    ? parseStructuredContent(JSON.stringify(content))
    : null;
  const descriptionSource = buildDescriptionSource(description, normalizedContent);

  await executeStatement(
    `
      INSERT INTO blog_posts (
        slug,
        title,
        description,
        breadcrumb,
        label,
        subtitle,
        author_name,
        author_role,
        content_json,
        tags
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `,
    [
      slug,
      title.trim(),
      descriptionSource,
      normalizedContent?.breadcrumb ?? "",
      normalizedContent?.label ?? DEFAULT_LABEL,
      normalizedContent?.subtitle ?? "",
      normalizedContent?.authorName ?? DEFAULT_AUTHOR_NAME,
      normalizedContent?.authorRole ?? DEFAULT_AUTHOR_ROLE,
      JSON.stringify(normalizedContent ?? {}),
      JSON.stringify(tags),
    ],
  );

  const createdPost = await getManagedBlogPostBySlug(slug);

  if (!createdPost) {
    throw new Error("The blog post could not be saved.");
  }

  return createdPost;
};

export const updateBlogPost = async ({
  content,
  description,
  postId,
  tags,
  title,
}: UpdateBlogPostInput) => {
  const existingPost = await getManagedBlogPostById(postId);

  if (!existingPost) {
    return null;
  }

  const normalizedContent = content
    ? parseStructuredContent(JSON.stringify(content))
    : null;
  const descriptionSource = buildDescriptionSource(description, normalizedContent);

  await executeStatement(
    `
      UPDATE blog_posts
      SET
        title = ?,
        description = ?,
        breadcrumb = ?,
        label = ?,
        subtitle = ?,
        author_name = ?,
        author_role = ?,
        content_json = ?,
        tags = ?
      WHERE id = ?;
    `,
    [
      title.trim(),
      descriptionSource,
      normalizedContent?.breadcrumb ?? "",
      normalizedContent?.label ?? DEFAULT_LABEL,
      normalizedContent?.subtitle ?? "",
      normalizedContent?.authorName ?? DEFAULT_AUTHOR_NAME,
      normalizedContent?.authorRole ?? DEFAULT_AUTHOR_ROLE,
      JSON.stringify(normalizedContent ?? {}),
      JSON.stringify(tags),
      postId,
    ],
  );

  return getManagedBlogPostById(postId);
};

export const deleteBlogPost = async (postId: number) => {
  const row = await queryRow<StoredBlogPostRow>(`
      ${selectBlogPostsSql}
      WHERE id = ?
      LIMIT 1;
    `, [postId]);

  if (!row) {
    return null;
  }

  await executeStatement(
    `
      DELETE FROM blog_posts
      WHERE id = ?;
    `,
    [postId],
  );

  return mapStoredBlogPost(row);
};

export const getRecentBlogPosts = async (limit = 5) =>
  (await getManagedBlogPosts()).slice(0, limit);

export const getManagedBlogPostsPage = async ({
  page,
  pageSize,
  query,
}: BlogListingOptions): Promise<BlogListingResult> => {
  const trimmedQuery = query.trim();
  const searchValue = `%${trimmedQuery}%`;
  const filters = trimmedQuery
    ? `
      WHERE title LIKE ? OR subtitle LIKE ? OR tags LIKE ?
    `
    : "";
  const countRow = await queryRow<{ count: number }>(`
    SELECT COUNT(*) as count
    FROM blog_posts
    ${filters};
  `, trimmedQuery ? [searchValue, searchValue, searchValue] : undefined);
  const totalItems = countRow?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const offset = (currentPage - 1) * pageSize;
  const rows = await queryRows<StoredBlogPostRow>(`
    ${selectBlogPostsSql}
    ${filters}
    ORDER BY datetime(created_at) DESC, id DESC
    LIMIT ? OFFSET ?;
  `, trimmedQuery
    ? [searchValue, searchValue, searchValue, pageSize, offset]
    : [pageSize, offset]);

  return {
    page: currentPage,
    pageSize,
    posts: rows.map(mapStoredBlogPost),
    query: trimmedQuery,
    totalItems,
    totalPages,
  };
};

export const getBlogOverview = async () => {
  const posts = await getManagedBlogPosts();

  return {
    affiliateLinkedPosts: posts.filter((post) => post.hasAffiliateLinks).length,
    structuredPosts: posts.filter((post) => post.structuredContent !== null).length,
    totalPosts: posts.length,
  };
};

export const getHomepageBlogPreviews = async (
  fallbackTopics: ResourceTopic[],
  limit = 4,
): Promise<BlogPreview[]> => {
  const posts = await getManagedBlogPosts();
  const managedPosts = posts.slice(0, limit);

  if (managedPosts.length >= limit) {
    return managedPosts;
  }

  return [
    ...managedPosts,
    ...fallbackTopics
      .slice(0, limit - managedPosts.length)
      .map(createStarterPreview),
  ];
};

export const getLibraryBlogPreviews = async (
  fallbackTopics: ResourceTopic[],
): Promise<BlogPreview[]> => [
  ...(await getManagedBlogPosts()),
  ...fallbackTopics.map(createStarterPreview),
];

export const getRelatedBlogPreviews = async (
  currentSlug: string,
  currentTags: string[],
  fallbackTopics: ResourceTopic[],
  limit = 3,
) => {
  const libraryPreviews = await getLibraryBlogPreviews(fallbackTopics);
  const previews = libraryPreviews.filter(
    (preview) => preview.slug !== currentSlug,
  );
  const tagSet = new Set(currentTags);

  return previews
    .map((preview) => ({
      preview,
      sharedTags: preview.tags.filter((tag) => tagSet.has(tag)).length,
    }))
    .sort((left, right) => {
      if (right.sharedTags !== left.sharedTags) {
        return right.sharedTags - left.sharedTags;
      }

      if (left.preview.source !== right.preview.source) {
        return left.preview.source === "managed" ? -1 : 1;
      }

      return left.preview.title.localeCompare(right.preview.title);
    })
    .slice(0, limit)
    .map((entry) => entry.preview);
};
