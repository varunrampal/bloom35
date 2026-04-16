import type { Metadata } from "next";
import Link from "next/link";

import { AdminSectionNav } from "@/components/admin-section-nav";
import { requireAdminSession } from "@/lib/admin-auth";
import { getManagedBlogPostsPage } from "@/lib/blog-store";

import { deleteBlogPostAction } from "../actions";

type AdminBlogManagementPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const PAGE_SIZE = 8;

const getSingleValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const buildBlogManagementPath = (page: number, query: string) => {
  const searchParams = new URLSearchParams();

  if (query) {
    searchParams.set("q", query);
  }

  if (page > 1) {
    searchParams.set("page", String(page));
  }

  const queryString = searchParams.toString();

  return queryString ? `/admin/blog?${queryString}` : "/admin/blog";
};

const formatPublishedDate = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(new Date(value.replace(" ", "T") + "Z"));

const statusCopy: Record<string, string> = {
  "blog-deleted": "Blog post deleted.",
};

const errorCopy: Record<string, string> = {
  "invalid-blog-post": "That blog action could not be completed.",
};

export const metadata: Metadata = {
  title: "Admin Blog",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

export default async function AdminBlogManagementPage({
  searchParams,
}: AdminBlogManagementPageProps) {
  await requireAdminSession();

  const params = (await searchParams) ?? {};
  const query = getSingleValue(params.q)?.trim() ?? "";
  const rawPage = Number(getSingleValue(params.page) ?? "1");
  const requestedPage =
    Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;
  const listing = await getManagedBlogPostsPage({
    page: requestedPage,
    pageSize: PAGE_SIZE,
    query,
  });
  const status = getSingleValue(params.status);
  const error = getSingleValue(params.error);
  const statusMessage = status ? statusCopy[status] : undefined;
  const errorMessage = error ? errorCopy[error] ?? error : undefined;
  const pagePath = buildBlogManagementPath(listing.page, listing.query);
  const showingFrom =
    listing.totalItems === 0 ? 0 : (listing.page - 1) * listing.pageSize + 1;
  const showingTo = Math.min(listing.page * listing.pageSize, listing.totalItems);

  return (
    <div className="page-stack admin-stack">
      <section className="panel admin-hero">
        <div className="admin-hero-copy">
          <p className="eyebrow">Blog management</p>
          <h1 className="section-title">Search, review, and update saved blog posts.</h1>
          <p className="muted">
            Open any article in a dedicated editor, update its banner and content,
            and keep your public library current without recreating posts.
          </p>
        </div>

        <Link className="button-primary" href="/admin/blog/create">
          Create New Post
        </Link>
      </section>

      <AdminSectionNav currentPath="/admin/blog" />

      {statusMessage ? <p className="status-banner">{statusMessage}</p> : null}
      {errorMessage ? (
        <p className="status-banner status-banner-error">{errorMessage}</p>
      ) : null}

      <section className="panel admin-products-shell">
        <div className="admin-products-topbar">
          <form className="admin-search-form">
            <label className="field-stack admin-search-stack" htmlFor="q">
              <span className="subsection-label">Search by blog title or tag</span>
              <div className="admin-search-row">
                <input
                  className="input-control"
                  defaultValue={listing.query}
                  id="q"
                  name="q"
                  placeholder="Search saved posts"
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

        {listing.posts.length > 0 ? (
          <div className="admin-post-list">
            {listing.posts.map((post) => (
              <article className="admin-post-card" key={post.id}>
                <div className="admin-post-meta">
                  <p className="feature-kicker">{post.category}</p>
                  <span>{post.readTime}</span>
                  <span>{formatPublishedDate(post.createdAt)}</span>
                </div>

                <h2 className="card-title">{post.title}</h2>
                <p className="muted">{post.summary}</p>

                {post.tags.length > 0 ? (
                  <div className="tag-row">
                    {post.tags.map((tag) => (
                      <span className="tag" key={`${post.id}-${tag}`}>
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}

                <div className="admin-action-row">
                  <Link className="button-primary" href={`/admin/blog/${post.id}`}>
                    Edit post
                  </Link>
                  <Link className="button-secondary" href={post.href}>
                    View live post
                  </Link>
                  <form action={deleteBlogPostAction}>
                    <input name="postId" type="hidden" value={post.id} />
                    <input name="redirectTo" type="hidden" value={pagePath} />
                    <button className="danger-button" type="submit">
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
              ? "No saved blog posts match that search yet."
              : "No saved blog posts yet. Create your first one from the Create New Post page."}
          </div>
        )}

        <div className="pagination-row">
          <Link
            aria-disabled={listing.page <= 1}
            className={`button-secondary pagination-link ${
              listing.page <= 1 ? "pagination-link-disabled" : ""
            }`}
            href={
              listing.page <= 1
                ? pagePath
                : buildBlogManagementPath(listing.page - 1, listing.query)
            }
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
                : buildBlogManagementPath(listing.page + 1, listing.query)
            }
          >
            Next
          </Link>
        </div>
      </section>
    </div>
  );
}
