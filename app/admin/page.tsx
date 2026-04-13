import type { Metadata } from "next";
import Link from "next/link";

import { requireAdminSession } from "@/lib/admin-auth";
import { getAffiliateProductOverview } from "@/lib/affiliate-product-store";

import {
  importAffiliateProductAction,
  logoutAdminAction,
} from "./actions";

type AdminPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const getSingleValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const statusCopy: Record<string, string> = {
  imported: "Product imported and saved. The homepage Product section will now use the stored database items.",
};

const errorCopy: Record<string, string> = {
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
          <h1 className="section-title">Import affiliate products from Amazon.</h1>
          <p className="muted">
            Signed in as <strong>{session.email}</strong>. Paste an affiliate
            link, and the app will fetch the title, image, and short
            description before saving the product to the database.
          </p>
        </div>

        <form action={logoutAdminAction}>
          <button className="button-secondary" type="submit">
            Sign out
          </button>
        </form>
      </section>

      {statusMessage ? <p className="status-banner">{statusMessage}</p> : null}
      {errorMessage ? (
        <p className="status-banner status-banner-error">{errorMessage}</p>
      ) : null}

      <section className="panel admin-layout">
        <div className="admin-panel admin-panel-form">
          <div className="admin-section-copy">
            <p className="eyebrow">Product upload</p>
            <h2 className="card-title card-title-lg">Add a new affiliate product</h2>
            <p className="muted">
              Required: an Amazon affiliate link. Optional: add a category,
              audience, and a featured flag to control how the product appears
              on the homepage.
            </p>
          </div>

          <form action={importAffiliateProductAction} className="admin-form">
            <label className="field-stack" htmlFor="affiliateUrl">
              <span className="subsection-label">Amazon affiliate link</span>
              <input
                className="input-control"
                id="affiliateUrl"
                name="affiliateUrl"
                placeholder="https://amzn.to/... or https://www.amazon.com/..."
                required
                type="url"
              />
            </label>

            <div className="field-grid">
              <label className="field-stack" htmlFor="category">
                <span className="subsection-label">Category</span>
                <input
                  className="input-control"
                  id="category"
                  name="category"
                  placeholder="Cooling, Hydration, Tracking..."
                  type="text"
                />
              </label>

              <label className="field-stack" htmlFor="bestFor">
                <span className="subsection-label">Best for</span>
                <input
                  className="input-control"
                  id="bestFor"
                  name="bestFor"
                  placeholder="Hot sleepers, hydration, symptom tracking..."
                  type="text"
                />
              </label>
            </div>

            <label className="checkbox-row" htmlFor="isFeatured">
              <input id="isFeatured" name="isFeatured" type="checkbox" />
              <span>
                Mark this product as the homepage <strong>Featured pick</strong>
              </span>
            </label>

            <button className="button-primary" type="submit">
              Import and save product
            </button>
          </form>
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
        </div>
      </section>
    </div>
  );
}
