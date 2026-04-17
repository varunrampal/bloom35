import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import {
  affiliateProducts,
  type AffiliateProduct,
} from "@/lib/app-data";
import { getHomepageAffiliateProducts } from "@/lib/affiliate-product-store";

const PAGE_SIZE = 9;

type ProductsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const getSingleValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const buildProductsPageHref = ({
  category,
  page,
  query,
}: {
  category?: string;
  page?: number;
  query?: string;
}) => {
  const searchParams = new URLSearchParams();

  if (query) {
    searchParams.set("q", query);
  }

  if (category) {
    searchParams.set("category", category);
  }

  if (page && page > 1) {
    searchParams.set("page", String(page));
  }

  const queryString = searchParams.toString();

  return queryString ? `/products?${queryString}` : "/products";
};

const createPaginationRange = (currentPage: number, totalPages: number) => {
  const windowSize = 5;
  const halfWindow = Math.floor(windowSize / 2);
  let start = Math.max(1, currentPage - halfWindow);
  let end = Math.min(totalPages, start + windowSize - 1);

  start = Math.max(1, end - windowSize + 1);

  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
};

export const metadata: Metadata = {
  title: "Products",
  description:
    "Browse Bloom35 product recommendations with search, category filters, and paginated results.",
};

export const dynamic = "force-dynamic";

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = (await searchParams) ?? {};
  const query = getSingleValue(params.q)?.trim() ?? "";
  const requestedCategory = getSingleValue(params.category)?.trim() ?? "";
  const requestedPage = Number.parseInt(getSingleValue(params.page) ?? "1", 10);

  const fetchedProducts = await getHomepageAffiliateProducts(affiliateProducts);
  const publicProducts = fetchedProducts as AffiliateProduct[];
  const categories = Array.from(new Set(publicProducts.map((product) => product.category)))
    .sort((left, right) => left.localeCompare(right));
  const selectedCategory = categories.includes(requestedCategory)
    ? requestedCategory
    : "";
  const normalizedQuery = query.toLowerCase();
  const queryFilteredProducts = normalizedQuery
    ? publicProducts.filter((product) =>
        [
          product.title,
          product.summary,
          product.category,
          product.bestFor,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery),
      )
    : publicProducts;
  const categoryCounts = queryFilteredProducts.reduce<Record<string, number>>(
    (counts, product) => {
      counts[product.category] = (counts[product.category] ?? 0) + 1;

      return counts;
    },
    {},
  );
  const filteredProducts = selectedCategory
    ? queryFilteredProducts.filter((product) => product.category === selectedCategory)
    : queryFilteredProducts;
  const totalItems = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const currentPage =
    Number.isInteger(requestedPage) && requestedPage > 0
      ? Math.min(requestedPage, totalPages)
      : 1;
  const pageStartIndex = (currentPage - 1) * PAGE_SIZE;
  const paginatedProducts = filteredProducts.slice(
    pageStartIndex,
    pageStartIndex + PAGE_SIZE,
  );
  const paginationRange = createPaginationRange(currentPage, totalPages);
  const visibleStart = totalItems === 0 ? 0 : pageStartIndex + 1;
  const visibleEnd = totalItems === 0 ? 0 : pageStartIndex + paginatedProducts.length;

  return (
    <div className="page-stack">
      <section className="panel section-panel catalog-hero">
        <p className="eyebrow">Products</p>
        <h1 className="section-title">
          Browse every product recommendation in one place.
        </h1>
        <p className="muted catalog-hero-copy">
          Search by symptom support, narrow by category, and page through the
          full Bloom35 product library.
        </p>
      </section>

      <section className="panel section-panel catalog-main catalog-main-full">
          <div className="catalog-toolbar">
            <div className="catalog-search-stack">
              <form action="/products" className="catalog-search-form" method="get">
                {selectedCategory ? (
                  <input name="category" type="hidden" value={selectedCategory} />
                ) : null}
                <input
                  className="input-control"
                  defaultValue={query}
                  name="q"
                  placeholder="Search by name, use case, or category"
                  type="search"
                />
                <button className="button-primary" type="submit">
                  Search
                </button>
                {query || selectedCategory ? (
                  <Link className="button-secondary" href="/products">
                    Clear filters
                  </Link>
                ) : null}
              </form>

              <details className="catalog-filter-popover">
                <summary className="catalog-filter-trigger">
                  <span>Categories</span>
                  <span className="catalog-filter-trigger-value">
                    {selectedCategory || "All categories"}
                  </span>
                </summary>

                <div className="catalog-filter-popover-panel">
                  <p className="catalog-filter-popover-copy">
                    Choose a category to narrow the current results.
                  </p>

                  <nav aria-label="Product categories" className="catalog-filter-list">
                    <Link
                      className={`catalog-filter-link${!selectedCategory ? " catalog-filter-link-active" : ""}`}
                      href={buildProductsPageHref({ query })}
                    >
                      <span>All categories</span>
                      <span className="catalog-filter-count">
                        {queryFilteredProducts.length}
                      </span>
                    </Link>

                    {categories.map((category) => (
                      <Link
                        className={`catalog-filter-link${selectedCategory === category ? " catalog-filter-link-active" : ""}`}
                        href={buildProductsPageHref({ category, query })}
                        key={category}
                      >
                        <span>{category}</span>
                        <span className="catalog-filter-count">
                          {categoryCounts[category] ?? 0}
                        </span>
                      </Link>
                    ))}
                  </nav>
                </div>
              </details>
            </div>

            <div className="catalog-results-bar">
              <p className="muted">
                {totalItems > 0
                  ? `Showing ${visibleStart}-${visibleEnd} of ${totalItems} products`
                  : "No products matched your current filters."}
              </p>
              <p className="catalog-results-detail">
                Page {currentPage} of {totalPages}
              </p>
            </div>
          </div>

          {paginatedProducts.length > 0 ? (
            <div className="catalog-grid">
              {paginatedProducts.map((product) => (
                <article className="product-card catalog-product-card" key={`${product.title}-${product.href}`}>
                  <div className="product-image-frame">
                    <Image
                      alt={product.imageAlt}
                      className="product-image"
                      height={180}
                      priority={false}
                      sizes="(max-width: 780px) 100vw, (max-width: 1080px) 50vw, 24vw"
                      src={product.imageSrc}
                      width={720}
                    />
                  </div>
                  <div className="product-meta">
                    <p className="feature-kicker">{product.category}</p>
                    <span className="chip">{product.bestFor}</span>
                  </div>
                  <h3 className="card-title">{product.title}</h3>
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
          ) : (
            <div className="empty-state catalog-empty-state">
              Try a broader search term or switch back to all categories to see more
              product matches.
            </div>
          )}

          {totalPages > 1 ? (
            <nav aria-label="Product pagination" className="catalog-pagination">
              <Link
                aria-disabled={currentPage === 1}
                className={`catalog-pagination-link${currentPage === 1 ? " catalog-pagination-link-disabled" : ""}`}
                href={buildProductsPageHref({
                  category: selectedCategory,
                  page: Math.max(1, currentPage - 1),
                  query,
                })}
              >
                Previous
              </Link>

              {paginationRange.map((pageNumber) => (
                <Link
                  className={`catalog-pagination-link${pageNumber === currentPage ? " catalog-pagination-link-active" : ""}`}
                  href={buildProductsPageHref({
                    category: selectedCategory,
                    page: pageNumber,
                    query,
                  })}
                  key={pageNumber}
                >
                  {pageNumber}
                </Link>
              ))}

              <Link
                aria-disabled={currentPage === totalPages}
                className={`catalog-pagination-link${currentPage === totalPages ? " catalog-pagination-link-disabled" : ""}`}
                href={buildProductsPageHref({
                  category: selectedCategory,
                  page: Math.min(totalPages, currentPage + 1),
                  query,
                })}
              >
                Next
              </Link>
            </nav>
          ) : null}
      </section>
    </div>
  );
}
