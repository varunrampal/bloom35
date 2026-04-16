import type { Metadata } from "next";
import Link from "next/link";

import { AdminSectionNav } from "@/components/admin-section-nav";
import { requireAdminSession } from "@/lib/admin-auth";
import {
  getStarterGuideEmailOverview,
  getStarterGuideEmailPage,
} from "@/lib/starter-guide-email-store";

type AdminEmailsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const PAGE_SIZE = 20;

const getSingleValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const buildEmailManagementPath = (page: number, query: string) => {
  const searchParams = new URLSearchParams();

  if (query) {
    searchParams.set("q", query);
  }

  if (page > 1) {
    searchParams.set("page", String(page));
  }

  const queryString = searchParams.toString();

  return queryString ? `/admin/emails?${queryString}` : "/admin/emails";
};

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value.replace(" ", "T") + "Z"));

export const metadata: Metadata = {
  title: "Admin Emails",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

export default async function AdminEmailsPage({
  searchParams,
}: AdminEmailsPageProps) {
  await requireAdminSession();

  const params = (await searchParams) ?? {};
  const query = getSingleValue(params.q)?.trim() ?? "";
  const rawPage = Number(getSingleValue(params.page) ?? "1");
  const requestedPage =
    Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;
  const listing = await getStarterGuideEmailPage({
    page: requestedPage,
    pageSize: PAGE_SIZE,
    query,
  });
  const overview = await getStarterGuideEmailOverview();
  const pagePath = buildEmailManagementPath(listing.page, listing.query);
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
          <p className="eyebrow">Starter guide emails</p>
          <h1 className="section-title">View everyone who downloaded the free guide.</h1>
          <p className="muted">
            Search saved email addresses, see when each address was first captured,
            and track repeat downloads from the same contact.
          </p>
        </div>

        <Link className="button-secondary" href="/admin">
          Back to admin home
        </Link>
      </section>

      <AdminSectionNav currentPath="/admin/emails" />

      <section className="panel admin-products-shell">
        <div className="admin-products-topbar">
          <form className="admin-search-form">
            <label className="field-stack admin-search-stack" htmlFor="q">
              <span className="subsection-label">Search by email address</span>
              <div className="admin-search-row">
                <input
                  className="input-control"
                  defaultValue={listing.query}
                  id="q"
                  name="q"
                  placeholder="Search email addresses"
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

        <div className="admin-overview-grid">
          <article className="admin-stat-card">
            <p className="detail-label">Unique emails</p>
            <p className="detail-value">{overview.uniqueEmails}</p>
          </article>

          <article className="admin-stat-card">
            <p className="detail-label">Total downloads</p>
            <p className="detail-value">{overview.totalDownloads}</p>
          </article>

          <article className="admin-stat-card">
            <p className="detail-label">Last 7 days</p>
            <p className="detail-value">{overview.downloadsLast7Days}</p>
          </article>
        </div>

        {listing.leads.length > 0 ? (
          <div className="admin-post-list">
            {listing.leads.map((lead) => (
              <article className="admin-post-card" key={lead.id}>
                <div className="admin-post-meta">
                  <p className="feature-kicker">Starter guide lead</p>
                  <span>{lead.downloadCount} downloads</span>
                  <span>Latest: {formatDateTime(lead.lastDownloadedAt)}</span>
                </div>

                <h2 className="card-title">{lead.email}</h2>
                <p className="muted">
                  First captured on {formatDateTime(lead.createdAt)}.
                </p>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state admin-empty-state">
            {listing.query
              ? "No saved email addresses match that search yet."
              : "No email addresses have been captured from the starter-guide download yet."}
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
                : buildEmailManagementPath(listing.page - 1, listing.query)
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
                : buildEmailManagementPath(listing.page + 1, listing.query)
            }
          >
            Next
          </Link>
        </div>
      </section>
    </div>
  );
}
