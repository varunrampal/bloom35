import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd } from "@/components/json-ld";
import { commonConcerns } from "@/lib/app-data";
import {
  absoluteUrl,
  createBreadcrumbJsonLd,
  defaultKeywords,
  siteConfig,
  siteUrl,
} from "@/lib/seo";

const pageTitle =
  "Perimenopause Support After 35: Symptoms, Sleep, Brain Fog, and Tracking";
const pageDescription =
  "A source-backed Bloom35 guide to perimenopause support after 35, including sleep issues, brain fog, hot flashes at night, symptom tracking, and care conversations.";

const medicalSources = [
  {
    href: "https://www.mayoclinic.org/diseases-conditions/perimenopause/symptoms-causes/syc-20354666",
    name: "Mayo Clinic: Perimenopause symptoms and causes",
  },
  {
    href: "https://www.mayoclinic.org/diseases-conditions/perimenopause/diagnosis-treatment/drc-20354671",
    name: "Mayo Clinic: Perimenopause diagnosis and treatment",
  },
  {
    href: "https://my.clevelandclinic.org/health/diseases/21608-perimenopause",
    name: "Cleveland Clinic: Perimenopause age, symptoms, and treatment",
  },
  {
    href: "https://menopause.org/patient-education/menopause-topics/perimenopause",
    name: "The Menopause Society: Perimenopause patient education",
  },
  {
    href: "https://www.acog.org/womens-health/faqs/the-menopause-years",
    name: "ACOG: The menopause years",
  },
];

const supportPaths = [
  {
    description:
      "Start here if 3 AM wakeups, night sweats, or less restorative rest are the symptom cluster you notice first.",
    href: "/concerns/sleep-issues",
    keyword: "perimenopause sleep issues",
    title: "Sleep issues",
  },
  {
    description:
      "Use this when recall, concentration, word-finding, or context switching feels less reliable than usual.",
    href: "/concerns/brain-fog",
    keyword: "perimenopause brain fog",
    title: "Brain fog",
  },
  {
    description:
      "Plan for sudden warmth, night sweats, and heat spikes with cooling routines that are easier to repeat.",
    href: "/concerns/hot-flashes",
    keyword: "perimenopause hot flashes at night",
    title: "Hot flashes at night",
  },
  {
    description:
      "Capture sleep, temperature, mood, focus, and energy without turning your whole day into symptom homework.",
    href: "/check-in",
    keyword: "perimenopause symptom tracker",
    title: "Symptom tracker",
  },
];

const trustSignals = [
  "Educational content, not diagnosis or treatment.",
  "Plain-language summaries checked against public medical resources.",
  "Clear affiliate disclosure when product links appear.",
  "Internal links to symptom-specific pages so readers can go deeper.",
];

const faqs = [
  {
    answer:
      "Perimenopause is the transition before menopause. It can include cycle changes, hot flashes, night sweats, sleep disruption, mood shifts, brain fog, vaginal dryness, and other symptoms. A clinician can help rule out other causes when symptoms are severe, unusual, or affecting daily life.",
    question: "What is perimenopause?",
  },
  {
    answer:
      "Many people notice changes in their 40s, and some notice changes earlier. If symptoms start before age 40, or bleeding changes are heavy, persistent, or concerning, it is worth speaking with a healthcare professional.",
    question: "Can perimenopause start after 35?",
  },
  {
    answer:
      "Tracking sleep, cycle timing, hot flashes or night sweats, mood, focus, energy, and what changed around harder days can make care conversations more useful. Bloom35 offers a lightweight check-in tool for this purpose.",
    question: "What should I track during perimenopause?",
  },
  {
    answer:
      "Yes. Sleep issues, hot flashes at night, mood changes, and brain fog are commonly discussed during the menopause transition, but they can also have other causes. Bring persistent or disruptive symptoms to a qualified clinician.",
    question: "Are sleep problems and brain fog related to perimenopause?",
  },
];

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  keywords: Array.from(
    new Set([
      ...defaultKeywords,
      "perimenopause",
      "perimenopause after 35",
      "perimenopause support after 35",
      "perimenopause sleep issues",
      "perimenopause brain fog",
      "perimenopause hot flashes at night",
      "perimenopause symptom tracker",
    ]),
  ),
  alternates: {
    canonical: "/perimenopause",
  },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: "/perimenopause",
    siteName: siteConfig.name,
    type: "article",
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} perimenopause guide preview image`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: pageTitle,
    description: pageDescription,
    images: [siteConfig.ogImage],
  },
};

export default function PerimenopausePage() {
  const pagePath = "/perimenopause";
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "MedicalWebPage",
      about: [
        {
          "@type": "MedicalCondition",
          name: "Perimenopause",
        },
      ],
      audience: {
        "@type": "PeopleAudience",
        suggestedMinAge: 35,
      },
      citation: medicalSources.map((source) => source.href),
      description: pageDescription,
      isPartOf: {
        "@type": "WebSite",
        name: siteConfig.name,
        url: siteUrl,
      },
      lastReviewed: "2026-04-18",
      name: pageTitle,
      reviewedBy: {
        "@type": "Organization",
        name: "Bloom35 Editorial Team",
      },
      url: absoluteUrl(pagePath),
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
        name: faq.question,
      })),
    },
    createBreadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Perimenopause", path: pagePath },
    ]),
  ];

  return (
    <>
      <JsonLd data={structuredData} />

      <div className="page-stack">
        <section className="page-hero">
          <p className="eyebrow">Start here</p>
          <h1 className="section-title page-title">{pageTitle}</h1>
          <p className="muted">
            Perimenopause can feel confusing because sleep, temperature, mood,
            focus, cycle timing, and energy can all start shifting at once. This
            guide gives Bloom35 a clear hub for the broad topic while helping
            readers move into the more specific support paths they are actually
            searching for.
          </p>
          <div className="cta-row">
            <Link className="button-primary" href="/check-in">
              Open symptom tracker
            </Link>
            <Link className="button-secondary" href="/library">
              Browse support library
            </Link>
          </div>
        </section>

        <section className="panel section-panel">
          <p className="eyebrow">Quick answer</p>
          <h2 className="section-title">What perimenopause means in daily life.</h2>
          <p className="muted">
            Perimenopause is the transition leading up to menopause. It often
            involves fluctuating estrogen and progesterone, which can affect
            menstrual patterns and everyday symptoms. Some people mainly notice
            cycle changes. Others first notice sleep disruption, hot flashes or
            night sweats, mood shifts, lower stress tolerance, brain fog, or
            changes in energy.
          </p>
          <p className="muted">
            Bloom35 focuses on practical support after 35: noticing patterns,
            preparing better care conversations, and lowering friction around
            the symptoms that interrupt normal days.
          </p>
        </section>

        <section className="panel section-panel">
          <p className="eyebrow">Long-tail support paths</p>
          <h2 className="section-title">
            Start with the symptom you are searching for.
          </h2>
          <div className="concern-grid">
            {supportPaths.map((path) => (
              <article className="concern-card" key={path.href}>
                <p className="feature-kicker">{path.keyword}</p>
                <h3 className="card-title">{path.title}</h3>
                <p className="muted">{path.description}</p>
                <Link className="concern-link" href={path.href}>
                  Open support path -&gt;
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="panel section-panel">
          <p className="eyebrow">Common concerns</p>
          <h2 className="section-title">Explore the concern cluster.</h2>
          <div className="concern-grid">
            {commonConcerns.map((concern) => (
              <article className="concern-card" key={concern.href}>
                <h3 className="card-title">{concern.name}</h3>
                <p className="muted">{concern.summary}</p>
                <p className="concern-detail">
                  <strong>Often looks like:</strong> {concern.signal}
                </p>
                <Link className="concern-link" href={concern.href}>
                  Learn more -&gt;
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="panel section-panel">
          <p className="eyebrow">Tracking</p>
          <h2 className="section-title">
            A lightweight perimenopause symptom tracker can make patterns easier
            to explain.
          </h2>
          <p className="muted">
            You do not need to track everything forever. A short daily check-in
            can help you notice whether symptoms cluster around sleep, heat,
            stress, cycle timing, meals, or workload. That makes it easier to
            describe impact clearly if you choose to bring symptoms to a
            clinician.
          </p>
          <ul className="plain-list">
            <li className="list-row">
              Sleep quality, wakeups, night sweats, and morning energy.
            </li>
            <li className="list-row">
              Hot flashes, warmth surges, or temperature symptoms by time of
              day.
            </li>
            <li className="list-row">
              Mood variability, focus, brain fog, and context that may have
              raised the load.
            </li>
            <li className="list-row">
              Cycle timing, skipped periods, heavier bleeding, or symptoms that
              feel unusual for you.
            </li>
          </ul>
          <div className="cta-row">
            <Link className="button-primary" href="/check-in">
              Try the check-in
            </Link>
          </div>
        </section>

        <section className="panel section-panel">
          <p className="eyebrow">Trust and sourcing</p>
          <h2 className="section-title">How this guide is positioned.</h2>
          <div className="concern-grid">
            {trustSignals.map((signal) => (
              <article className="concern-card" key={signal}>
                <p className="muted">{signal}</p>
              </article>
            ))}
          </div>
          <p className="article-note">
            Bloom35 is educational and supportive. It is not a replacement for
            personalized medical advice, diagnosis, or treatment. If symptoms
            are severe, persistent, unusual, or affecting quality of life, speak
            with a qualified healthcare professional.
          </p>
        </section>

        <section className="panel section-panel">
          <p className="eyebrow">Medical sources</p>
          <h2 className="section-title">References used for this page.</h2>
          <ul className="plain-list">
            {medicalSources.map((source) => (
              <li className="list-row" key={source.href}>
                <a
                  className="blog-inline-link"
                  href={source.href}
                  rel="noopener noreferrer nofollow"
                  target="_blank"
                >
                  {source.name}
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel cta-banner">
          <div>
            <p className="eyebrow">Next step</p>
            <h2 className="section-title">
              Build from the broad topic into focused symptom support.
            </h2>
          </div>
          <div className="cta-row">
            <Link className="button-primary" href="/library">
              Read the library
            </Link>
            <Link className="button-secondary" href="/products">
              Browse comfort products
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
