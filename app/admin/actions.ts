"use server";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";

import type { BlogArticleContent } from "@/lib/app-data";
import {
  clearAdminSession,
  createAdminSession,
  getAdminSetupState,
  requireAdminSession,
  verifyAdminCredentials,
} from "@/lib/admin-auth";
import {
  deleteAffiliateProduct,
  getManagedAffiliateProductsByIds,
  setAffiliateProductEnabled,
  updateAffiliateProductCategory,
  upsertAffiliateProduct,
} from "@/lib/affiliate-product-store";
import { importAmazonProductFromAffiliateLink } from "@/lib/amazon-product-import";
import {
  createBlogPost,
  deleteBlogPost,
  getManagedBlogPostById,
  parseBlogTagsInput,
  updateBlogPost,
} from "@/lib/blog-store";

const MAX_BLOG_IMAGE_FILE_SIZE = 5 * 1024 * 1024;
const blogImageDirectory = path.join(process.cwd(), "public", "blog");
const allowedBlogImageMimeTypes = new Map<string, string>([
  ["image/avif", ".avif"],
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
]);
const allowedBlogImageExtensions = new Set([".avif", ".jpeg", ".jpg", ".png", ".webp"]);

const createUploadSlugBase = (value: string) =>
  value
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "") || "article";

const normalizeImageExtension = (value: string) =>
  value === ".jpeg" ? ".jpg" : value;

const getBlogImageExtension = (file: File) => {
  const mimeExtension = allowedBlogImageMimeTypes.get(file.type);

  if (mimeExtension) {
    return mimeExtension;
  }

  const fileExtension = normalizeImageExtension(path.extname(file.name).toLowerCase());

  return allowedBlogImageExtensions.has(fileExtension) ? fileExtension : null;
};

const saveUploadedBlogHeroImage = async ({
  file,
  title,
}: {
  file: File;
  title: string;
}) => {
  if (file.size <= 0) {
    return "";
  }

  if (file.size > MAX_BLOG_IMAGE_FILE_SIZE) {
    throw new Error("Banner image must be 5 MB or smaller.");
  }

  const extension = getBlogImageExtension(file);

  if (!extension) {
    throw new Error("Upload a JPG, PNG, WebP, or AVIF banner image.");
  }

  if (process.env.VERCEL) {
    throw new Error(
      "Banner image uploads are not supported on this Vercel setup. Use an existing image path or move uploads to persistent storage.",
    );
  }

  await mkdir(blogImageDirectory, { recursive: true });

  const filename = `${createUploadSlugBase(title)}-${Date.now()}${extension}`;
  const filePath = path.join(blogImageDirectory, filename);
  const bytes = Buffer.from(await file.arrayBuffer());

  await writeFile(filePath, bytes);

  return `/blog/${filename}`;
};

const sanitizeAdminRedirectPath = (value: string, fallbackPath: string) =>
  value.startsWith("/admin") ? value : fallbackPath;

const redirectWithParams = (
  pathname: string,
  params: Record<string, string | undefined>,
): never => {
  const [basePath, existingQuery = ""] = pathname.split("?");
  const searchParams = new URLSearchParams(existingQuery);

  for (const [key, value] of Object.entries(params)) {
    if (value) {
      searchParams.set(key, value);
    }
  }

  const queryString = searchParams.toString();

  redirect(queryString ? `${basePath}?${queryString}` : basePath);
};

const revalidateBlogPaths = (slug?: string, postId?: number) => {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/blog");
  revalidatePath("/library");

  if (slug) {
    revalidatePath(`/library/${slug}`);
  }

  if (postId) {
    revalidatePath(`/admin/blog/${postId}`);
  }
};

const sanitizeRecommendedProductIds = (value: unknown) => {
  const rawIds = Array.isArray(value)
    ? value
        .map((item) => {
          if (typeof item === "number") {
            return item;
          }

          if (typeof item === "string") {
            return Number.parseInt(item, 10);
          }

          return Number.NaN;
        })
        .filter((item): item is number => Number.isInteger(item) && item > 0)
    : [];

  return getManagedAffiliateProductsByIds(rawIds, { includeDisabled: true }).map(
    (product) => product.id,
  );
};

export const loginAdminAction = async (formData: FormData) => {
  const setup = getAdminSetupState();

  if (!setup.isConfigured) {
    redirectWithParams("/admin/login", { error: "setup-required" });
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password || !verifyAdminCredentials(email, password)) {
    redirectWithParams("/admin/login", { error: "invalid-credentials" });
  }

  await createAdminSession(email);

  redirect("/admin");
};

export const logoutAdminAction = async () => {
  await clearAdminSession();

  redirectWithParams("/admin/login", { status: "signed-out" });
};

export const importAffiliateProductAction = async (formData: FormData) => {
  await requireAdminSession();

  const affiliateUrl = String(formData.get("affiliateUrl") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const bestFor = String(formData.get("bestFor") ?? "").trim();
  const isFeatured = formData.get("isFeatured") === "on";
  const redirectTo = sanitizeAdminRedirectPath(
    String(formData.get("redirectTo") ?? "/admin/products/create"),
    "/admin/products/create",
  );
  const successRedirectTo = sanitizeAdminRedirectPath(
    String(formData.get("successRedirectTo") ?? "/admin/products"),
    "/admin/products",
  );

  if (!affiliateUrl) {
    redirectWithParams(redirectTo, { error: "missing-link" });
  }

  try {
    const importedProduct = await importAmazonProductFromAffiliateLink({
      affiliateUrl,
      bestFor,
      category,
    });

    upsertAffiliateProduct({
      ...importedProduct,
      isFeatured,
    });

    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/products");
    revalidatePath("/admin/products/create");

    redirectWithParams(successRedirectTo, { status: "imported" });
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    const message =
      error instanceof Error
        ? error.message
        : "The product could not be imported.";

    redirectWithParams(redirectTo, {
      error: message,
    });
  }
};

export const createBlogPostAction = async (formData: FormData) => {
  await requireAdminSession();

  const title = String(formData.get("title") ?? "").trim();
  const tags = parseBlogTagsInput(String(formData.get("tags") ?? ""));
  const contentJson = String(formData.get("contentJson") ?? "").trim();
  const heroImageFile = formData.get("heroImageFile");
  const redirectTo = sanitizeAdminRedirectPath(
    String(formData.get("redirectTo") ?? "/admin/blog/create"),
    "/admin/blog/create",
  );
  const successRedirectTo = sanitizeAdminRedirectPath(
    String(formData.get("successRedirectTo") ?? "/admin/blog"),
    "/admin/blog",
  );
  let content: BlogArticleContent | null = null;

  if (!title) {
    redirectWithParams(redirectTo, { error: "missing-blog-title" });
  }

  if (!contentJson) {
    redirectWithParams(redirectTo, { error: "missing-blog-description" });
  }

  try {
    const parsedContent = JSON.parse(contentJson) as unknown;

    if (!parsedContent || typeof parsedContent !== "object") {
      redirectWithParams(redirectTo, { error: "invalid-blog-layout" });
    }

    content = parsedContent as BlogArticleContent;
  } catch {
    redirectWithParams(redirectTo, { error: "invalid-blog-layout" });
  }

  if (!content) {
    redirectWithParams(redirectTo, { error: "invalid-blog-layout" });
  }

  const validatedContent = content as BlogArticleContent;

  try {
    const uploadedHeroImageSrc =
      heroImageFile instanceof File && heroImageFile.size > 0
        ? await saveUploadedBlogHeroImage({
            file: heroImageFile,
            title,
          })
        : "";
    const contentWithHeroImage: BlogArticleContent = {
      ...validatedContent,
      heroImageSrc: uploadedHeroImageSrc || validatedContent.heroImageSrc,
      recommendedProductIds: sanitizeRecommendedProductIds(
        validatedContent.recommendedProductIds,
      ),
    };

    if (
      !String(contentWithHeroImage.subtitle ?? "").trim() &&
      !String(contentWithHeroImage.intro ?? "").trim() &&
      !String(contentWithHeroImage.body ?? "").trim() &&
      !String(contentWithHeroImage.closing ?? "").trim()
    ) {
      redirectWithParams(redirectTo, { error: "missing-blog-description" });
    }

    const post = createBlogPost({
      content: contentWithHeroImage,
      description: String(contentWithHeroImage.subtitle ?? ""),
      tags,
      title,
    });

    revalidateBlogPaths(post.slug, post.id);
    redirectWithParams(successRedirectTo, { status: "blog-created" });
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    const message =
      error instanceof Error ? error.message : "The blog post could not be saved.";

    redirectWithParams(redirectTo, { error: message });
  }
};

export const deleteBlogPostAction = async (formData: FormData) => {
  await requireAdminSession();

  const postId = Number(formData.get("postId"));
  const redirectTo = sanitizeAdminRedirectPath(
    String(formData.get("redirectTo") ?? "/admin"),
    "/admin",
  );

  if (!Number.isInteger(postId) || postId <= 0) {
    redirectWithParams(redirectTo, { error: "invalid-blog-post" });
  }

  const deletedPost = deleteBlogPost(postId);

  if (deletedPost) {
    revalidateBlogPaths(deletedPost.slug, deletedPost.id);
    redirectWithParams(redirectTo, { status: "blog-deleted" });
  }

  redirectWithParams(redirectTo, { error: "invalid-blog-post" });
};

export const updateBlogPostAction = async (formData: FormData) => {
  await requireAdminSession();

  const postId = Number(formData.get("postId"));
  const title = String(formData.get("title") ?? "").trim();
  const tags = parseBlogTagsInput(String(formData.get("tags") ?? ""));
  const contentJson = String(formData.get("contentJson") ?? "").trim();
  const heroImageFile = formData.get("heroImageFile");
  const redirectTo = sanitizeAdminRedirectPath(
    String(formData.get("redirectTo") ?? `/admin/blog/${postId}`),
    `/admin/blog/${postId}`,
  );
  let content: BlogArticleContent | null = null;

  if (!Number.isInteger(postId) || postId <= 0) {
    redirectWithParams("/admin/blog", { error: "invalid-blog-post" });
  }

  if (!title) {
    redirectWithParams(redirectTo, { error: "missing-blog-title" });
  }

  if (!contentJson) {
    redirectWithParams(redirectTo, { error: "missing-blog-description" });
  }

  try {
    const parsedContent = JSON.parse(contentJson) as unknown;

    if (!parsedContent || typeof parsedContent !== "object") {
      redirectWithParams(redirectTo, { error: "invalid-blog-layout" });
    }

    content = parsedContent as BlogArticleContent;
  } catch {
    redirectWithParams(redirectTo, { error: "invalid-blog-layout" });
  }

  if (!content) {
    redirectWithParams(redirectTo, { error: "invalid-blog-layout" });
  }

  const existingPost = getManagedBlogPostById(postId);
  const existingPostSlug = existingPost
    ? existingPost.slug
    : redirectWithParams("/admin/blog", { error: "invalid-blog-post" });

  const validatedContent = content as BlogArticleContent;

  try {
    const uploadedHeroImageSrc =
      heroImageFile instanceof File && heroImageFile.size > 0
        ? await saveUploadedBlogHeroImage({
            file: heroImageFile,
            title,
          })
        : "";
    const contentWithHeroImage: BlogArticleContent = {
      ...validatedContent,
      heroImageSrc: uploadedHeroImageSrc || validatedContent.heroImageSrc,
      recommendedProductIds: sanitizeRecommendedProductIds(
        validatedContent.recommendedProductIds,
      ),
    };

    if (
      !String(contentWithHeroImage.subtitle ?? "").trim() &&
      !String(contentWithHeroImage.intro ?? "").trim() &&
      !String(contentWithHeroImage.body ?? "").trim() &&
      !String(contentWithHeroImage.closing ?? "").trim()
    ) {
      redirectWithParams(redirectTo, { error: "missing-blog-description" });
    }

    const post = updateBlogPost({
      content: contentWithHeroImage,
      description: String(contentWithHeroImage.subtitle ?? ""),
      postId,
      tags,
      title,
    });

    if (!post) {
      redirectWithParams("/admin/blog", { error: "invalid-blog-post" });
    }

    revalidateBlogPaths(existingPostSlug, postId);
    redirectWithParams(redirectTo, { status: "blog-updated" });
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    const message =
      error instanceof Error ? error.message : "The blog post could not be saved.";

    redirectWithParams(redirectTo, { error: message });
  }
};

export const toggleAffiliateProductEnabledAction = async (formData: FormData) => {
  await requireAdminSession();

  const productId = Number(formData.get("productId"));
  const nextEnabledState = formData.get("nextEnabledState") === "true";
  const redirectTo = sanitizeAdminRedirectPath(
    String(formData.get("redirectTo") ?? "/admin/products"),
    "/admin/products",
  );

  if (!Number.isInteger(productId) || productId <= 0) {
    redirect(`${redirectTo}${redirectTo.includes("?") ? "&" : "?"}error=invalid-product`);
  }

  setAffiliateProductEnabled(productId, nextEnabledState);

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/products");

  redirect(
    `${redirectTo}${redirectTo.includes("?") ? "&" : "?"}status=${
      nextEnabledState ? "enabled" : "disabled"
    }`,
  );
};

export const updateAffiliateProductCategoryAction = async (formData: FormData) => {
  await requireAdminSession();

  const productId = Number(formData.get("productId"));
  const category = String(formData.get("category") ?? "").trim();
  const redirectTo = sanitizeAdminRedirectPath(
    String(formData.get("redirectTo") ?? "/admin/products"),
    "/admin/products",
  );

  if (!Number.isInteger(productId) || productId <= 0) {
    redirect(`${redirectTo}${redirectTo.includes("?") ? "&" : "?"}error=invalid-product`);
  }

  if (!category) {
    redirect(`${redirectTo}${redirectTo.includes("?") ? "&" : "?"}error=invalid-category`);
  }

  updateAffiliateProductCategory(productId, category);

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/products");

  redirect(
    `${redirectTo}${redirectTo.includes("?") ? "&" : "?"}status=category-updated`,
  );
};

export const deleteAffiliateProductAction = async (formData: FormData) => {
  await requireAdminSession();

  const productId = Number(formData.get("productId"));
  const redirectTo = sanitizeAdminRedirectPath(
    String(formData.get("redirectTo") ?? "/admin/products"),
    "/admin/products",
  );

  if (!Number.isInteger(productId) || productId <= 0) {
    redirect(`${redirectTo}${redirectTo.includes("?") ? "&" : "?"}error=invalid-product`);
  }

  deleteAffiliateProduct(productId);

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/products");

  redirect(
    `${redirectTo}${redirectTo.includes("?") ? "&" : "?"}status=deleted`,
  );
};
