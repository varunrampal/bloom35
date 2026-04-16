import "server-only";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { del, put } from "@vercel/blob";

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

const isManagedBlobUrl = (value: string) => {
  try {
    const url = new URL(value);

    return url.hostname.includes(".blob.vercel-storage.com");
  } catch {
    return false;
  }
};

export const saveUploadedBlogHeroImage = async ({
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

  const filename = `${createUploadSlugBase(title)}-${Date.now()}${extension}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  const saveLocally = async () => {
    await mkdir(blogImageDirectory, { recursive: true });
    await writeFile(path.join(blogImageDirectory, filename), bytes);

    return `/blog/${filename}`;
  };

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const blob = await put(`blog/${filename}`, bytes, {
        access: "public",
        addRandomSuffix: false,
        contentType: file.type || undefined,
      });

      return blob.url;
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("Cannot use public access on a private store")
      ) {
        if (!process.env.VERCEL) {
          return saveLocally();
        }

        throw new Error(
          "Your Vercel Blob store is private, but blog banner images need a public Blob store. Switch the store access to public or use a public-store token for uploads.",
        );
      }

      throw error;
    }
  }

  if (process.env.VERCEL) {
    throw new Error(
      "Banner image uploads require Vercel Blob on this deployment. Add BLOB_READ_WRITE_TOKEN in Vercel to enable them.",
    );
  }

  return saveLocally();
};

export const deleteManagedBlogHeroImage = async (imageSrc: string | null | undefined) => {
  const normalizedImageSrc = imageSrc?.trim();

  if (!normalizedImageSrc || !process.env.BLOB_READ_WRITE_TOKEN) {
    return;
  }

  if (isManagedBlobUrl(normalizedImageSrc)) {
    await del(normalizedImageSrc);
  }
};
