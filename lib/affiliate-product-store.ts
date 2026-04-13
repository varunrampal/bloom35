import "server-only";

import type { AffiliateProduct } from "@/lib/app-data";
import { getDatabase } from "@/lib/database";

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

export const getStoredAffiliateProducts = () => {
  const database = getDatabase();
  const statement = database.prepare(`
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

  return statement.all() as StoredAffiliateProductRow[];
};

export const getManagedAffiliateProducts = () =>
  getStoredAffiliateProducts().map(mapStoredProduct);

export const getHomepageAffiliateProducts = (
  fallbackProducts: AffiliateProduct[],
): HomepageAffiliateProducts => {
  const managedProducts = getManagedAffiliateProducts();

  if (managedProducts.length === 0) {
    return fallbackProducts;
  }

  return managedProducts.filter((product) => product.isEnabled);
};

export const getAffiliateProductOverview = () => {
  const products = getManagedAffiliateProducts();

  return {
    enabledProducts: products.filter((product) => product.isEnabled).length,
    featuredProducts: products.filter((product) => product.isFeatured).length,
    totalProducts: products.length,
  };
};

export const getAffiliateProductsPage = ({
  page,
  pageSize,
  query,
}: ProductListingOptions): ProductListingResult => {
  const database = getDatabase();
  const trimmedQuery = query.trim();
  const searchValue = `%${trimmedQuery}%`;
  const filters = trimmedQuery
    ? `
      WHERE title LIKE ?
    `
    : "";
  const countStatement = database.prepare(`
    SELECT COUNT(*) as count
    FROM affiliate_products
    ${filters};
  `);
  const countRow = trimmedQuery
    ? (countStatement.get(searchValue) as { count: number })
    : (countStatement.get() as { count: number });
  const totalItems = countRow.count;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const offset = (currentPage - 1) * pageSize;
  const listingStatement = database.prepare(`
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
  `);
  const rows = trimmedQuery
    ? (listingStatement.all(searchValue, pageSize, offset) as StoredAffiliateProductRow[])
    : (listingStatement.all(pageSize, offset) as StoredAffiliateProductRow[]);

  return {
    page: currentPage,
    pageSize,
    products: rows.map(mapStoredProduct),
    query: trimmedQuery,
    totalItems,
    totalPages,
  };
};

export const upsertAffiliateProduct = ({
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
  const database = getDatabase();

  if (isFeatured) {
    database.exec("UPDATE affiliate_products SET is_featured = 0;");
  }

  database
    .prepare(`
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
    `)
    .run(
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
    );
};

export const setAffiliateProductEnabled = (
  productId: number,
  isEnabled: boolean,
) => {
  const database = getDatabase();

  database
    .prepare(`
      UPDATE affiliate_products
      SET is_enabled = ?
      WHERE id = ?;
    `)
    .run(isEnabled ? 1 : 0, productId);
};

export const deleteAffiliateProduct = (productId: number) => {
  const database = getDatabase();

  database
    .prepare(`
      DELETE FROM affiliate_products
      WHERE id = ?;
    `)
    .run(productId);
};

export const updateAffiliateProductCategory = (
  productId: number,
  category: string,
) => {
  const database = getDatabase();

  database
    .prepare(`
      UPDATE affiliate_products
      SET category = ?
      WHERE id = ?;
    `)
    .run(category, productId);
};
