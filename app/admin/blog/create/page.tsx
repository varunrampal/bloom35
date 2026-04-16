import type { Metadata } from "next";
import Link from "next/link";

import { AdminBlogComposer } from "@/components/admin-blog-composer";
import { AdminSectionNav } from "@/components/admin-section-nav";
import { requireAdminSession } from "@/lib/admin-auth";
import { getBlogRecommendedProductOptions } from "@/lib/affiliate-product-store";

import { createBlogPostAction } from "../../actions";

type AdminBlogCreatePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const getSingleValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const errorCopy: Record<string, string> = {
  "invalid-blog-layout": "The blog layout payload could not be parsed. Refresh and try again.",
  "missing-blog-description": "Add the article content before saving the blog post.",
  "missing-blog-title": "Add a title for the blog post before saving it.",
};

export const metadata: Metadata = {
  title: "Create Blog Post",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

export default async function AdminBlogCreatePage({
  searchParams,
}: AdminBlogCreatePageProps) {
  await requireAdminSession();
  const availableProducts = getBlogRecommendedProductOptions();

  const params = (await searchParams) ?? {};
  const error = getSingleValue(params.error);
  const errorMessage = error ? errorCopy[error] ?? error : undefined;

  return (
    <div className="page-stack admin-stack">
      <section className="panel admin-hero">
        <div className="admin-hero-copy">
          <p className="eyebrow">Create blog post</p>
          <h1 className="section-title">Write and publish a new article.</h1>
          <p className="muted">
            Build the banner, intro, cards, supporting sections, and CTA in one
            place, then send the finished post to your public library.
          </p>
        </div>

        <Link className="button-secondary" href="/admin/blog">
          Back to blog management
        </Link>
      </section>

      <AdminSectionNav currentPath="/admin/blog/create" />

      {errorMessage ? (
        <p className="status-banner status-banner-error">{errorMessage}</p>
      ) : null}

      <section className="panel admin-products-shell">
        <div className="admin-panel admin-panel-form">
          <div className="admin-section-copy">
            <p className="eyebrow">Article editor</p>
            <h2 className="card-title card-title-lg">Create a new blog post</h2>
            <p className="muted">
              Use the structured editor to build a complete article without leaving
              the admin workflow.
            </p>
          </div>

          <form
            action={createBlogPostAction}
            className="admin-form"
            encType="multipart/form-data"
          >
            <input name="redirectTo" type="hidden" value="/admin/blog/create" />
            <input name="successRedirectTo" type="hidden" value="/admin/blog" />
            <AdminBlogComposer availableProducts={availableProducts} />
          </form>
        </div>
      </section>
    </div>
  );
}
