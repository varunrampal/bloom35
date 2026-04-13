import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const ADMIN_SESSION_COOKIE = "bloom35-admin-session";
const ADMIN_SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

type AdminSession = {
  email: string;
  expiresAt: number;
};

const getAdminConfig = () => {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase() ?? "";
  const password = process.env.ADMIN_PASSWORD ?? "";
  const secret = process.env.ADMIN_SESSION_SECRET ?? "";

  return {
    email,
    password,
    secret,
    isConfigured: Boolean(email && password && secret),
  };
};

const safeEqual = (left: string, right: string) => {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
};

const signSessionValue = (value: string, secret: string) =>
  createHmac("sha256", secret).update(value).digest("base64url");

const createSessionToken = (session: AdminSession, secret: string) => {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  const signature = signSessionValue(payload, secret);

  return `${payload}.${signature}`;
};

const parseSessionToken = (token: string, secret: string): AdminSession | null => {
  const [payload, signature] = token.split(".");

  if (!payload || !signature) {
    return null;
  }

  const expectedSignature = signSessionValue(payload, secret);

  if (!safeEqual(signature, expectedSignature)) {
    return null;
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as AdminSession;

    if (!parsed.email || typeof parsed.expiresAt !== "number") {
      return null;
    }

    if (parsed.expiresAt <= Date.now()) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
};

export const getAdminSetupState = () => {
  const config = getAdminConfig();

  return {
    isConfigured: config.isConfigured,
    missingItems: [
      !config.email ? "ADMIN_EMAIL" : null,
      !config.password ? "ADMIN_PASSWORD" : null,
      !config.secret ? "ADMIN_SESSION_SECRET" : null,
    ].filter(Boolean) as string[],
  };
};

export const verifyAdminCredentials = (email: string, password: string) => {
  const config = getAdminConfig();

  if (!config.isConfigured) {
    return false;
  }

  return (
    safeEqual(email.trim().toLowerCase(), config.email) &&
    safeEqual(password, config.password)
  );
};

export const createAdminSession = async (email: string) => {
  const config = getAdminConfig();

  if (!config.isConfigured) {
    throw new Error("Admin login is not configured yet.");
  }

  const expiresAt = Date.now() + ADMIN_SESSION_TTL_SECONDS * 1000;
  const token = createSessionToken(
    {
      email: email.trim().toLowerCase(),
      expiresAt,
    },
    config.secret,
  );

  const cookieStore = await cookies();

  cookieStore.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    maxAge: ADMIN_SESSION_TTL_SECONDS,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
};

export const clearAdminSession = async () => {
  const cookieStore = await cookies();

  cookieStore.delete(ADMIN_SESSION_COOKIE);
};

export const readAdminSession = async () => {
  const config = getAdminConfig();

  if (!config.isConfigured) {
    return null;
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  const session = parseSessionToken(token, config.secret);

  if (!session) {
    cookieStore.delete(ADMIN_SESSION_COOKIE);
    return null;
  }

  return session;
};

export const isAdminAuthenticated = async () =>
  (await readAdminSession()) !== null;

export const requireAdminSession = async () => {
  const session = await readAdminSession();

  if (!session) {
    redirect("/admin/login?error=signin-required");
  }

  return session;
};
