import "server-only";

import type {
  AffiliateProduct,
  BlogRecommendedProductOption,
} from "@/lib/app-data";
import {
  executeStatement,
  getDatabase,
  queryRow,
  queryRows,
} from "@/lib/database";

type StoredAffiliateProductRow = {
  affiliate_url: string;
  best_for: string;
  category: string;
  created_at: string;
  cta_label: string;
  id: number;
  image_alt: string;
  image_src: string;
  is_enabled: number;
  is_featured: number;
  resolved_url: string;
  summary: string;
  title: string;
};

export type StoredAffiliateProduct = AffiliateProduct & {
  createdAt: string;
  id: number;
  isEnabled: boolean;
  isFeatured: boolean;
  resolvedUrl: string;
};

export type HomepageAffiliateProducts = AffiliateProduct[] | StoredAffiliateProduct[];

type ImportedAffiliateProductInput = {
  affiliateUrl: string;
  bestFor: string;
  category: string;
  ctaLabel: string;
  imageAlt: string;
  imageSrc: string;
  resolvedUrl: string;
  summary: string;
  title: string;
  isFeatured: boolean;
};

type ProductListingOptions = {
  page: number;
  pageSize: number;
  query: string;
};

type ProductListingResult = {
  page: number;
  pageSize: number;
  products: StoredAffiliateProduct[];
  query: string;
  totalItems: number;
  totalPages: number;
};

const mapStoredProduct = (
  row: StoredAffiliateProductRow,
): StoredAffiliateProduct => ({
  bestFor: row.best_for,
  category: row.category,
  createdAt: row.created_at,
  ctaLabel: row.cta_label,
  href: row.affiliate_url,
  id: row.id,
  imageAlt: row.image_alt,
  imageSrc: row.image_src,
  isEnabled: Boolean(row.is_enabled),
  isFeatured: Boolean(row.is_featured),
  resolvedUrl: row.resolved_url,
  summary: row.summary,
  title: row.title,
});

const normalizeProductIds = (productIds: number[]) =>
  Array.from(
    new Set(productIds.filter((productId) => Number.isInteger(productId) && productId > 0)),
  );

export const getStoredAffiliateProducts = async () =>
  queryRows<StoredAffiliateProductRow>(`
    SELECT
      id,
      affiliate_url,
      resolved_url,
      title,
      summary,
      image_src,
      image_alt,
      category,
      best_for,
      is_featured,
      is_enabled,
      cta_label,
      created_at
    FROM affiliate_products
    ORDER BY id DESC;
  `);

export const getManagedAffiliateProducts = async () =>
  (await getStoredAffiliateProducts()).map(mapStoredProduct);

export const getManagedAffiliateProductsByIds = async (
  productIds: number[],
  { includeDisabled = false }: { includeDisabled?: boolean } = {},
) => {
  const normalizedIds = normalizeProductIds(productIds);

  if (normalizedIds.length === 0) {
    return [];
  }

  const products = await getManagedAffiliateProducts();
  const productMap = new Map(products.map((product) => [product.id, product]));

  return normalizedIds
    .map((productId) => productMap.get(productId))
    .filter((product): product is StoredAffiliateProduct => Boolean(product))
    .filter((product) => includeDisabled || product.isEnabled);
};

export const getBlogRecommendedProductOptions = async (): Promise<
  BlogRecommendedProductOption[]
> =>
  (await getManagedAffiliateProducts()).map((product) => ({
    bestFor: product.bestFor,
    category: product.category,
    id: product.id,
    isEnabled: product.isEnabled,
    summary: product.summary,
    title: product.title,
  }));

export const getHomepageAffiliateProducts = async (
  fallbackProducts: AffiliateProduct[],
): Promise<HomepageAffiliateProducts> => {
  const managedProducts = await getManagedAffiliateProducts();

  if (managedProducts.length === 0) {
    return fallbackProducts;
  }

  return managedProducts.filter((product) => product.isEnabled);
};

export const getAffiliateProductOverview = async () => {
  const products = await getManagedAffiliateProducts();

  return {
    enabledProducts: products.filter((product) => product.isEnabled).length,
    featuredProducts: products.filter((product) => product.isFeatured).length,
    totalProducts: products.length,
  };
};

export const getAffiliateProductsPage = async ({
  page,
  pageSize,
  query,
}: ProductListingOptions): Promise<ProductListingResult> => {
  const trimmedQuery = query.trim();
  const searchValue = `%${trimmedQuery}%`;
  const filters = trimmedQuery
    ? `
      WHERE title LIKE ?
    `
    : "";
  const countRow = await queryRow<{ count: number }>(`
    SELECT COUNT(*) as count
    FROM affiliate_products
    ${filters};
  `, trimmedQuery ? [searchValue] : undefined);
  const totalItems = countRow?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const offset = (currentPage - 1) * pageSize;
  const rows = await queryRows<StoredAffiliateProductRow>(`
    SELECT
      id,
      affiliate_url,
      resolved_url,
      title,
      summary,
      image_src,
      image_alt,
      category,
      best_for,
      is_featured,
      is_enabled,
      cta_label,
      created_at
    FROM affiliate_products
    ${filters}
    ORDER BY is_featured DESC, is_enabled DESC, id DESC
    LIMIT ? OFFSET ?;
  `, trimmedQuery ? [searchValue, pageSize, offset] : [pageSize, offset]);

  return {
    page: currentPage,
    pageSize,
    products: rows.map(mapStoredProduct),
    query: trimmedQuery,
    totalItems,
    totalPages,
  };
};

export const upsertAffiliateProduct = async ({
  affiliateUrl,
  bestFor,
  category,
  ctaLabel,
  imageAlt,
  imageSrc,
  resolvedUrl,
  summary,
  title,
  isFeatured,
}: ImportedAffiliateProductInput) => {
  const database = await getDatabase();

  await database.batch(
    [
      ...(isFeatured ? ["UPDATE affiliate_products SET is_featured = 0;"] : []),
      {
        sql: `
          INSERT INTO affiliate_products (
            affiliate_url,
            resolved_url,
            title,
            summary,
            image_src,
            image_alt,
            category,
            best_for,
            is_featured,
            is_enabled,
            cta_label
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(affiliate_url) DO UPDATE SET
            resolved_url = excluded.resolved_url,
            title = excluded.title,
            summary = excluded.summary,
            image_src = excluded.image_src,
            image_alt = excluded.image_alt,
            category = excluded.category,
            best_for = excluded.best_for,
            is_featured = excluded.is_featured,
            is_enabled = excluded.is_enabled,
            cta_label = excluded.cta_label;
        `,
        args: [
          affiliateUrl,
          resolvedUrl,
          title,
          summary,
          imageSrc,
          imageAlt,
          category,
          bestFor,
          isFeatured ? 1 : 0,
          1,
          ctaLabel,
        ],
      },
    ],
    "write",
  );
};

export const setAffiliateProductEnabled = (
  productId: number,
  isEnabled: boolean,
) =>
  executeStatement(
    `
      UPDATE affiliate_products
      SET is_enabled = ?
      WHERE id = ?;
    `,
    [isEnabled ? 1 : 0, productId],
  );

export const deleteAffiliateProduct = (productId: number) =>
  executeStatement(
    `
      DELETE FROM affiliate_products
      WHERE id = ?;
    `,
    [productId],
  );

export const updateAffiliateProductCategory = (
  productId: number,
  category: string,
) =>
  executeStatement(
    `
      UPDATE affiliate_products
      SET category = ?
      WHERE id = ?;
    `,
    [category, productId],
  );
