import type { ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Fraunces, Manrope } from "next/font/google";

import { JsonLd } from "@/components/json-ld";
import {
  createSiteStructuredData,
  defaultKeywords,
  siteConfig,
  siteUrl,
} from "@/lib/seo";

import "quill/dist/quill.snow.css";
import "./globals.css";

const headingFont = Fraunces({
  subsets: ["latin"],
  variable: "--font-heading",
});

const bodyFont = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
});

const navItems = [
  { href: "/perimenopause", label: "Perimenopause" },
  { href: "/about", label: "About" },
  { href: "/#blog", label: "Blog" },
  { href: "/#products", label: "Products" },
  { href: "/disclosure", label: "Disclosure" },
];

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteConfig.name} | ${siteConfig.defaultTitle}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: defaultKeywords,
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  category: "health",
  formatDetection: {
    address: false,
    email: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: `${siteConfig.name} | ${siteConfig.defaultTitle}`,
    description: siteConfig.description,
    url: "/",
    siteName: siteConfig.name,
    locale: "en_US",
    type: "website",
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} preview image`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} | ${siteConfig.defaultTitle}`,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const siteStructuredData = createSiteStructuredData();

  return (
    <html lang="en">
      <body className={`${headingFont.variable} ${bodyFont.variable}`}>
        <JsonLd data={siteStructuredData} />
        <div className="app-shell">
          <header className="site-header">
            <Link className="brand" href="/">
              <span className="brand-mark" aria-hidden="true">
                B
              </span>
              Bloom35
            </Link>

            <nav aria-label="Primary" className="site-nav">
              {navItems.map((item) => (
                <Link className="nav-link" href={item.href} key={item.href}>
                  {item.label}
                </Link>
              ))}
            </nav>
          </header>

          <main className="site-main">{children}</main>

          <footer className="site-footer">
            <p>
              Bloom35 is a supportive perimenopause initiative. It is not a
              replacement for medical care.
            </p>
          </footer>
        </div>
      </body>
    </html>
  );
}
