import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminBlogComposer } from "@/components/admin-blog-composer";
import { AdminSectionNav } from "@/components/admin-section-nav";
import type { BlogArticleContent, ManagedBlogPost } from "@/lib/app-data";
import { requireAdminSession } from "@/lib/admin-auth";
import { getBlogRecommendedProductOptions } from "@/lib/affiliate-product-store";
import { getManagedBlogPostById } from "@/lib/blog-store";

import { deleteBlogPostAction, updateBlogPostAction } from "../../actions";

type AdminBlogEditPageProps = {
  params: Promise<{
    postId: string;
  }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const getSingleValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const buildInitialEditorContent = (
  post: ManagedBlogPost,
): Partial<BlogArticleContent> =>
  post.structuredContent ?? {
    authorName: post.authorName,
    authorRole: post.authorRole,
    breadcrumb: post.breadcrumb,
    heroImageAlt: "",
    heroImageSrc: "",
    intro: post.description,
    label: post.category,
    recommendedProductIds: [],
    subtitle: post.subtitle || post.summary,
  };

const statusCopy: Record<string, string> = {
  "blog-updated": "Blog post updated.",
};

const errorCopy: Record<string, string> = {
  "invalid-blog-layout": "The blog layout payload could not be parsed. Refresh and try again.",
  "invalid-blog-post": "That blog action could not be completed.",
  "missing-blog-description": "Add the article content before saving the blog post.",
  "missing-blog-title": "Add a title for the blog post before saving it.",
};

export const metadata: Metadata = {
  title: "Edit Blog Post",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

export default async function AdminBlogEditPage({
  params,
  searchParams,
}: AdminBlogEditPageProps) {
  await requireAdminSession();

  const routeParams = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const postId = Number(routeParams.postId);

  if (!Number.isInteger(postId) || postId <= 0) {
    notFound();
  }

  const post = await getManagedBlogPostById(postId);
  const availableProducts = await getBlogRecommendedProductOptions();

  if (!post) {
    notFound();
  }

  const status = getSingleValue(resolvedSearchParams.status);
  const error = getSingleValue(resolvedSearchParams.error);
  const statusMessage = status ? statusCopy[status] : undefined;
  const errorMessage = error ? errorCopy[error] ?? error : undefined;
  const editPath = `/admin/blog/${post.id}`;

  return (
    <div className="page-stack admin-stack">
      <section className="panel admin-hero">
        <div className="admin-hero-copy">
          <p className="eyebrow">Edit blog post</p>
          <h1 className="section-title">{post.title}</h1>
          <p className="muted">
            Update the saved post content, replace the banner image if needed, and
            keep the live article URL at <strong>/library/{post.slug}</strong>.
          </p>
        </div>

        <div className="admin-action-row">
          <Link className="button-secondary" href="/admin/blog">
            Back to blog management
          </Link>
          <Link className="button-secondary" href="/admin/blog/create">
            Create new post
          </Link>
          <Link className="button-secondary" href={post.href}>
            View live post
          </Link>
        </div>
      </section>

      <AdminSectionNav currentPath={editPath} />

      {statusMessage ? <p className="status-banner">{statusMessage}</p> : null}
      {errorMessage ? (
        <p className="status-banner status-banner-error">{errorMessage}</p>
      ) : null}

      <section className="panel admin-products-shell">
        <div className="admin-panel admin-panel-form">
          <div className="admin-section-copy">
            <p className="eyebrow">Article editor</p>
            <h2 className="card-title card-title-lg">Update the saved blog post</h2>
            <p className="muted">
              Edit the article structure, tags, author information, and banner in one
              place. Saving here updates the public post without creating a new one.
            </p>
          </div>

          <form
            action={updateBlogPostAction}
            className="admin-form"
          >
            <input name="postId" type="hidden" value={post.id} />
            <input name="redirectTo" type="hidden" value={editPath} />
            <AdminBlogComposer
              availableProducts={availableProducts}
              initialContent={buildInitialEditorContent(post)}
              initialTags={post.tags}
              initialTitle={post.title}
              submitLabel="Update blog post"
            />
          </form>
          <form action={deleteBlogPostAction} className="admin-delete-form">
            <input name="postId" type="hidden" value={post.id} />
            <input name="redirectTo" type="hidden" value="/admin/blog" />
            <button className="danger-button" type="submit">
              Delete this post
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
