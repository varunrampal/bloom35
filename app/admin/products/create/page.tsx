import type { Metadata } from "next";
import Link from "next/link";

import { AdminSectionNav } from "@/components/admin-section-nav";
import { requireAdminSession } from "@/lib/admin-auth";

import { importAffiliateProductAction } from "../../actions";

type AdminProductCreatePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const getSingleValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const errorCopy: Record<string, string> = {
  "missing-link": "Paste an Amazon affiliate link to import a product.",
};

export const metadata: Metadata = {
  title: "Create Product",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

export default async function AdminProductCreatePage({
  searchParams,
}: AdminProductCreatePageProps) {
  await requireAdminSession();

  const params = (await searchParams) ?? {};
  const error = getSingleValue(params.error);
  const errorMessage = error ? errorCopy[error] ?? error : undefined;

  return (
    <div className="page-stack admin-stack">
      <section className="panel admin-hero">
        <div className="admin-hero-copy">
          <p className="eyebrow">Create product</p>
          <h1 className="section-title">Import a new affiliate product.</h1>
          <p className="muted">
            Paste an Amazon affiliate link, add optional category details, and
            save the product into your managed library.
          </p>
        </div>

        <Link className="button-secondary" href="/admin/products">
          Back to product management
        </Link>
      </section>

      <AdminSectionNav currentPath="/admin/products/create" />

      {errorMessage ? (
        <p className="status-banner status-banner-error">{errorMessage}</p>
      ) : null}

      <section className="panel admin-products-shell">
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
            <input name="redirectTo" type="hidden" value="/admin/products/create" />
            <input name="successRedirectTo" type="hidden" value="/admin/products" />

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
      </section>
    </div>
  );
}
