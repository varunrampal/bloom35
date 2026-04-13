import type { Metadata } from "next";
import Link from "next/link";

import { AdminSectionNav } from "@/components/admin-section-nav";
import { requireAdminSession } from "@/lib/admin-auth";
import { getAffiliateProductOverview } from "@/lib/affiliate-product-store";
import { getBlogOverview } from "@/lib/blog-store";

import {
  logoutAdminAction,
} from "./actions";

type AdminPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const getSingleValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const statusCopy: Record<string, string> = {
  "blog-created": "Blog post saved. It now appears in the public blog and library.",
  "blog-deleted": "Blog post deleted.",
  imported: "Product imported and saved. The homepage Product section will now use the stored database items.",
};

const errorCopy: Record<string, string> = {
  "invalid-blog-post": "That blog action could not be completed.",
  "invalid-blog-layout": "The blog layout payload could not be parsed. Refresh and try again.",
  "missing-blog-description": "Add the article content before saving the blog post.",
  "missing-blog-title": "Add a title for the blog post before saving it.",
  "missing-link": "Paste an Amazon affiliate link to import a product.",
};

export const metadata: Metadata = {
  title: "Admin",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const session = await requireAdminSession();
  const params = (await searchParams) ?? {};
  const blogOverview = getBlogOverview();
  const overview = getAffiliateProductOverview();
  const status = getSingleValue(params.status);
  const error = getSingleValue(params.error);
  const statusMessage = status ? statusCopy[status] : undefined;
  const errorMessage = error ? errorCopy[error] ?? error : undefined;

  return (
    <div className="page-stack admin-stack">
      <section className="panel admin-hero">
        <div className="admin-hero-copy">
          <p className="eyebrow">Admin section</p>
          <h1 className="section-title">Create blog posts and manage affiliate content.</h1>
          <p className="muted">
            Signed in as <strong>{session.email}</strong>. Publish blog content
            with tags and Amazon affiliate links, then import product cards for
            the homepage from the same admin workspace.
          </p>
        </div>

        <form action={logoutAdminAction}>
          <button className="button-secondary" type="submit">
            Sign out
          </button>
        </form>
      </section>

      <AdminSectionNav currentPath="/admin" />

      {statusMessage ? <p className="status-banner">{statusMessage}</p> : null}
      {errorMessage ? (
        <p className="status-banner status-banner-error">{errorMessage}</p>
      ) : null}

      <section className="panel admin-layout">
        <div className="admin-panel admin-panel-list">
          <div className="admin-section-copy">
            <p className="eyebrow">Blog post overview</p>
            <h2 className="card-title card-title-lg">
              Manage blog posts from dedicated pages.
            </h2>
            <p className="muted">
              Create new posts, edit saved articles, and keep the public library
              current from the dedicated blog pages.
            </p>
          </div>

          <div className="admin-overview-grid">
            <article className="admin-stat-card">
              <p className="detail-label">Saved posts</p>
              <p className="detail-value">{blogOverview.totalPosts}</p>
            </article>

            <article className="admin-stat-card">
              <p className="detail-label">Structured posts</p>
              <p className="detail-value">{blogOverview.structuredPosts}</p>
            </article>

            <article className="admin-stat-card">
              <p className="detail-label">Affiliate-ready</p>
              <p className="detail-value">{blogOverview.affiliateLinkedPosts}</p>
            </article>
          </div>

          <div className="admin-action-row">
            <Link className="button-primary" href="/admin/blog/create">
              Create New Post
            </Link>

            <Link className="button-secondary" href="/admin/blog">
              Open blog management
            </Link>
          </div>
        </div>

        <div className="admin-panel admin-panel-list">
          <div className="admin-section-copy">
            <p className="eyebrow">Inventory overview</p>
            <h2 className="card-title card-title-lg">
              Manage products in a dedicated library view.
            </h2>
            <p className="muted">
              Search, paginate, disable, and delete saved products from one
              place.
            </p>
          </div>

          <div className="admin-overview-grid">
            <article className="admin-stat-card">
              <p className="detail-label">Saved products</p>
              <p className="detail-value">{overview.totalProducts}</p>
            </article>

            <article className="admin-stat-card">
              <p className="detail-label">Enabled on site</p>
              <p className="detail-value">{overview.enabledProducts}</p>
            </article>

            <article className="admin-stat-card">
              <p className="detail-label">Featured picks</p>
              <p className="detail-value">{overview.featuredProducts}</p>
            </article>
          </div>

          <Link className="button-secondary" href="/admin/products">
            Open product library
          </Link>

          <Link className="button-primary" href="/admin/products/create">
            Create New Product
          </Link>
        </div>
      </section>
    </div>
  );
}
