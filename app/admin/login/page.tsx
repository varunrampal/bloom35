import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import {
  getAdminSetupState,
  isAdminAuthenticated,
} from "@/lib/admin-auth";

import { loginAdminAction } from "../actions";

type LoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const getSingleValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const statusCopy: Record<string, string> = {
  "signed-out": "You have been signed out.",
};

const errorCopy: Record<string, string> = {
  "invalid-credentials": "That email and password pair did not match the admin settings.",
  "setup-required": "Admin login is not configured yet. Add the missing environment variables first.",
  "signin-required": "Please sign in to continue to the admin area.",
};

export const metadata: Metadata = {
  title: "Admin Login",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

export default async function AdminLoginPage({
  searchParams,
}: LoginPageProps) {
  if (await isAdminAuthenticated()) {
    redirect("/admin");
  }

  const params = (await searchParams) ?? {};
  const setup = getAdminSetupState();
  const statusMessage = statusCopy[getSingleValue(params.status) ?? ""];
  const errorMessage = errorCopy[getSingleValue(params.error) ?? ""];

  return (
    <div className="auth-shell">
      <section className="panel auth-card">
        <div className="auth-copy">
          <p className="eyebrow">Admin login</p>
          <h1 className="section-title">Sign in to manage affiliate products.</h1>
          <p className="muted">
            Paste an Amazon affiliate link, let the app fetch the product
            details, and publish the saved product cards to the homepage.
          </p>
        </div>

        {statusMessage ? <p className="status-banner">{statusMessage}</p> : null}
        {errorMessage ? (
          <p className="status-banner status-banner-error">{errorMessage}</p>
        ) : null}

        {setup.isConfigured ? (
          <form action={loginAdminAction} className="admin-form auth-form">
            <label className="field-stack" htmlFor="email">
              <span className="subsection-label">Admin email</span>
              <input
                className="input-control"
                id="email"
                name="email"
                placeholder="you@example.com"
                required
                type="email"
              />
            </label>

            <label className="field-stack" htmlFor="password">
              <span className="subsection-label">Password</span>
              <input
                className="input-control"
                id="password"
                name="password"
                placeholder="Enter your admin password"
                required
                type="password"
              />
            </label>

            <button className="button-primary" type="submit">
              Sign in
            </button>
          </form>
        ) : (
          <div className="setup-card">
            <p className="muted">
              Add these variables to your local environment before using the
              admin area:
            </p>
            <ul className="plain-list setup-list">
              {setup.missingItems.map((item) => (
                <li className="chip" key={item}>
                  {item}
                </li>
              ))}
            </ul>
            <p className="muted">
              A starter template is included in <code>.env.example</code>.
            </p>
          </div>
        )}

        <Link className="button-secondary auth-back-link" href="/">
          Back to homepage
        </Link>
      </section>
    </div>
  );
}
