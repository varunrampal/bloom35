import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { AdminSectionNav } from "@/components/admin-section-nav";
import { requireAdminSession } from "@/lib/admin-auth";
import { getAffiliateProductsPage } from "@/lib/affiliate-product-store";

import {
  deleteAffiliateProductAction,
  toggleAffiliateProductEnabledAction,
  updateAffiliateProductCategoryAction,
} from "../actions";

type AdminProductsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const PAGE_SIZE = 8;
const defaultCategoryOptions = [
  "Cooling",
  "Bedroom",
  "Hydration",
  "Tracking",
  "Support",
];

const getSingleValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const getCategoryOptions = (currentCategory: string) =>
  Array.from(new Set([currentCategory, ...defaultCategoryOptions].filter(Boolean)));

const buildProductsPath = (page: number, query: string) => {
  const searchParams = new URLSearchParams();

  if (query) {
    searchParams.set("q", query);
  }

  if (page > 1) {
    searchParams.set("page", String(page));
  }

  const queryString = searchParams.toString();

  return queryString ? `/admin/products?${queryString}` : "/admin/products";
};

const statusCopy: Record<string, string> = {
  "category-updated": "Product category updated.",
  deleted: "Product deleted from the database.",
  disabled: "Product disabled. It will no longer appear on the homepage.",
  enabled: "Product enabled and available for the homepage again.",
  imported: "Product imported and saved.",
};

const errorCopy: Record<string, string> = {
  "invalid-category": "Pick a category before updating the product card.",
  "invalid-product": "That product action could not be completed.",
};

export const metadata: Metadata = {
  title: "Admin Products",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

export default async function AdminProductsPage({
  searchParams,
}: AdminProductsPageProps) {
  await requireAdminSession();

  const params = (await searchParams) ?? {};
  const query = getSingleValue(params.q)?.trim() ?? "";
  const rawPage = Number(getSingleValue(params.page) ?? "1");
  const requestedPage =
    Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;
  const listing = await getAffiliateProductsPage({
    page: requestedPage,
    pageSize: PAGE_SIZE,
    query,
  });
  const status = getSingleValue(params.status);
  const error = getSingleValue(params.error);
  const statusMessage = status ? statusCopy[status] : undefined;
  const errorMessage = error ? errorCopy[error] ?? error : undefined;
  const pagePath = buildProductsPath(listing.page, listing.query);
  const showingFrom =
    listing.totalItems === 0 ? 0 : (listing.page - 1) * listing.pageSize + 1;
  const showingTo = Math.min(
    listing.page * listing.pageSize,
    listing.totalItems,
  );

  return (
    <div className="page-stack admin-stack">
      <section className="panel admin-hero">
        <div className="admin-hero-copy">
          <p className="eyebrow">Saved products</p>
          <h1 className="section-title">Search and manage your affiliate library.</h1>
          <p className="muted">
            Browse saved products in a gallery view, search by product name,
            and manage what stays live on the homepage.
          </p>
        </div>

        <div className="admin-action-row">
          <Link className="button-primary" href="/admin/products/create">
            Create New Product
          </Link>
          <Link className="button-secondary" href="/admin">
            Back to admin home
          </Link>
        </div>
      </section>

      <AdminSectionNav currentPath="/admin/products" />

      {statusMessage ? <p className="status-banner">{statusMessage}</p> : null}
      {errorMessage ? (
        <p className="status-banner status-banner-error">{errorMessage}</p>
      ) : null}

      <section className="panel admin-products-shell">
        <div className="admin-products-topbar">
          <form className="admin-search-form">
            <label className="field-stack admin-search-stack" htmlFor="q">
              <span className="subsection-label">Search by product name</span>
              <div className="admin-search-row">
                <input
                  className="input-control"
                  defaultValue={listing.query}
                  id="q"
                  name="q"
                  placeholder="Search with product name"
                  type="search"
                />
                <button className="button-primary" type="submit">
                  Search
                </button>
              </div>
            </label>
          </form>

          <div className="admin-results-card">
            <p className="detail-label">Results</p>
            <p className="detail-value">{listing.totalItems}</p>
            <p className="muted">
              Showing {showingFrom}-{showingTo} of {listing.totalItems}
            </p>
          </div>
        </div>

        {listing.products.length > 0 ? (
          <div className="admin-products-grid">
            {listing.products.map((product) => (
              <article className="admin-product-card" key={product.id}>
                <div className="admin-product-image">
                  <Image
                    alt={product.imageAlt}
                    className="product-image"
                    height={480}
                    sizes="(max-width: 780px) 100vw, 30vw"
                    src={product.imageSrc}
                    width={720}
                  />
                </div>

                <div className="admin-status-row">
                  <span
                    className={`status-pill ${
                      product.isEnabled
                        ? "status-pill-enabled"
                        : "status-pill-disabled"
                    }`}
                  >
                    {product.isEnabled ? "Enabled" : "Disabled"}
                  </span>
                  {product.isFeatured ? (
                    <span className="status-pill status-pill-featured">
                      Featured pick
                    </span>
                  ) : null}
                </div>

                <h2 className="admin-product-title">{product.title}</h2>

                <form action={updateAffiliateProductCategoryAction} className="admin-category-form">
                  <input name="productId" type="hidden" value={product.id} />
                  <input name="redirectTo" type="hidden" value={pagePath} />
                  <label className="sr-only" htmlFor={`category-${product.id}`}>
                    Category
                  </label>
                  <select
                    className="select-control"
                    defaultValue={product.category}
                    id={`category-${product.id}`}
                    name="category"
                  >
                    {getCategoryOptions(product.category).map((category) => (
                      <option key={`${product.id}-${category}`} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  <button className="button-secondary admin-card-button" type="submit">
                    Update
                  </button>
                </form>

                <div className="admin-card-button-grid">
                  <a
                    className="button-secondary admin-card-button"
                    href={product.href}
                    rel="noopener noreferrer sponsored nofollow"
                    target="_blank"
                  >
                    View
                  </a>

                  <form action={toggleAffiliateProductEnabledAction}>
                    <input name="productId" type="hidden" value={product.id} />
                    <input
                      name="nextEnabledState"
                      type="hidden"
                      value={product.isEnabled ? "false" : "true"}
                    />
                    <input name="redirectTo" type="hidden" value={pagePath} />
                    <button className="button-secondary admin-card-button" type="submit">
                      {product.isEnabled ? "Disable" : "Enable"}
                    </button>
                  </form>

                  <form action={deleteAffiliateProductAction} className="admin-delete-form">
                    <input name="productId" type="hidden" value={product.id} />
                    <input name="redirectTo" type="hidden" value={pagePath} />
                    <button className="danger-button admin-card-button admin-card-button-full" type="submit">
                      Delete
                    </button>
                  </form>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state admin-empty-state">
            {listing.query
              ? "No saved products match that search yet."
              : "No saved products yet. Create your first one from the Create New Product page."}
          </div>
        )}

        <div className="pagination-row">
          <Link
            aria-disabled={listing.page <= 1}
            className={`button-secondary pagination-link ${
              listing.page <= 1 ? "pagination-link-disabled" : ""
            }`}
            href={listing.page <= 1 ? pagePath : buildProductsPath(listing.page - 1, listing.query)}
          >
            Previous
          </Link>

          <p className="muted pagination-label">
            Page {listing.page} of {listing.totalPages}
          </p>

          <Link
            aria-disabled={listing.page >= listing.totalPages}
            className={`button-secondary pagination-link ${
              listing.page >= listing.totalPages ? "pagination-link-disabled" : ""
            }`}
            href={
              listing.page >= listing.totalPages
                ? pagePath
                : buildProductsPath(listing.page + 1, listing.query)
            }
          >
            Next
          </Link>
        </div>
      </section>
    </div>
  );
}
