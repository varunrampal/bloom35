"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  clearAdminSession,
  createAdminSession,
  getAdminSetupState,
  requireAdminSession,
  verifyAdminCredentials,
} from "@/lib/admin-auth";
import {
  deleteAffiliateProduct,
  setAffiliateProductEnabled,
  updateAffiliateProductCategory,
  upsertAffiliateProduct,
} from "@/lib/affiliate-product-store";
import { importAmazonProductFromAffiliateLink } from "@/lib/amazon-product-import";

const sanitizeAdminRedirectPath = (value: string, fallbackPath: string) =>
  value.startsWith("/admin") ? value : fallbackPath;

const redirectWithParams = (
  pathname: string,
  params: Record<string, string | undefined>,
) => {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value) {
      searchParams.set(key, value);
    }
  }

  const queryString = searchParams.toString();

  redirect(queryString ? `${pathname}?${queryString}` : pathname);
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

  if (!affiliateUrl) {
    redirectWithParams("/admin", { error: "missing-link" });
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

    redirectWithParams("/admin", { status: "imported" });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "The product could not be imported.";

    redirectWithParams("/admin", {
      error: message,
    });
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
