import Image from "next/image";

import { createPageMetadata } from "@/lib/seo";

const contentPrinciples = [
  "All articles are researched against current peer-reviewed studies and public medical guidance.",
  "We clearly separate established evidence from emerging research, and we never overstate what is known.",
  "Nutrition recommendations align with established everyday guidance for women's health and hormone support.",
  "We use careful, plain language because more clarity should reduce confusion, not add to it.",
  "We only recommend products or patterns with a plausible reason for being useful in real life.",
];

const valueCards = [
  {
    badge: "01",
    description:
      "Every recommendation is grounded in research we can explain, not hype we cannot defend.",
    title: "Evidence first",
  },
  {
    badge: "02",
    description:
      "We tell women what is actually happening in their bodies, not a softened version designed to avoid discomfort.",
    title: "Radical honesty",
  },
  {
    badge: "03",
    description:
      "Women's health has not always been treated as a priority. We build with that reality in mind.",
    title: "Woman-first always",
  },
  {
    badge: "04",
    description:
      "Practical beats perfect. Our advice has to work for real mornings, real jobs, and real low-energy days.",
    title: "Practical, not perfect",
  },
  {
    badge: "05",
    description:
      "Weight gain, mood swings, sleep disruption, and brain fog are not moral failures. We write without judgment.",
    title: "No shame, no blame",
  },
  {
    badge: "06",
    description:
      "We choose clarity and usefulness over empty reach. If it does not help women, it does not belong here.",
    title: "Community over clicks",
  },
];

const trustSignals = [
  {
    label: "Women centered in our audience and point of view.",
    value: "1000+",
  },
  {
    label: "Place to bring research, nutrition, and symptom support together.",
    value: "1 place",
  },
  {
    label: "Shame, blame, and fear-based wellness language.",
    value: "0",
  },
  {
    label: "Written for real daily life, not an idealized routine.",
    value: "Real life",
  },
];

const promiseItems = [
  {
    description:
      "We link our guidance back to evidence, explain our reasoning, and update it when the science changes.",
    title: "All content is thoroughly researched and sourced",
  },
  {
    description:
      "We only recommend products with a symptom-based reason for being there, not because they are trendy.",
    title: "Affiliate relationships are always disclosed",
  },
  {
    description:
      "We treat symptom tracking as a tool for insight and pattern-spotting, never as a reason for shame.",
    title: "Your data is yours",
  },
  {
    description:
      "When new evidence shifts the guidance, we revise our content and say what changed.",
    title: "We update with the science",
  },
];

export const metadata = createPageMetadata({
  description:
    "Learn why Bloom35 exists, how we research and write our content, and the values guiding our approach to perimenopause support.",
  path: "/about",
  title: "About Bloom35",
});

export default function AboutPage() {
  return (
    <div className="about-page">
      <section className="about-hero">
        <div className="about-hero-copy">
          <p className="eyebrow">Our story</p>
          <h1 className="about-hero-title">
            The resource we wished had{" "}
            <span className="about-hero-accent">existed</span>
          </h1>
          <p className="about-hero-text">
            Bloom35 was created for women who are tired of being dismissed,
            confused, and left to figure out their changing bodies alone. We
            bring together research, nutrition, and community in one place.
          </p>
        </div>

        <div className="about-hero-art">
          <Image
            alt="A group of women standing together to represent support and community."
            className="about-hero-image"
            fill
            priority
            sizes="(max-width: 1080px) 100vw, 48vw"
            src="/about/about-hero.jpg"
          />
        </div>
      </section>

      <section className="about-mission-band">
        <p className="eyebrow about-eyebrow-light">Our mission</p>
        <h2 className="about-mission-title">
          To give every woman over 35 the knowledge and tools to{" "}
          <span className="about-mission-accent">thrive</span> through hormonal
          change, not just survive it.
        </h2>
        <p className="about-mission-text">
          Perimenopause is not a disease. It is a transition. And with the right
          support, it can be navigated with clarity and confidence.
        </p>
      </section>

      <section className="about-story-section">
        <div className="about-section-head">
          <p className="eyebrow">How it started</p>
          <h2 className="section-title">Why we built Bloom35</h2>
        </div>

        <div className="about-story-copy">
          <p>
            Too many women spend years cycling through doctors, being told their
            symptoms are &quot;normal&quot; or &quot;just stress&quot;, all while
            their sleep, weight, mood, and energy quietly deteriorate. The
            information that could help them exists. It is just scattered,
            technical, and rarely written with real women&apos;s lives in mind.
          </p>
          <p>
            Bloom35 was built to change that. We take the latest research in
            women&apos;s hormonal health and translate it into practical,
            compassionate guidance, real symptom support, and tools to help you
            track patterns and feel more in control.
          </p>
        </div>

        <blockquote className="about-quote">
          &quot;We believe that understanding your body is the most powerful
          thing you can do for your health. When women have access to the right
          information at the right time, everything changes.&quot;
        </blockquote>

        <p className="about-story-close">
          Everything in Bloom35 is thoroughly researched, clearly sourced, and
          written with one woman in mind: someone who wants real answers, not
          vague reassurance. We cover perimenopause, hormonal weight loss,
          nutrition, sleep, mental health, and more, all through the lens of
          what the science actually says.
        </p>
      </section>

      <section className="about-content-section">
        <div className="about-section-head">
          <p className="eyebrow">Medical editorial view</p>
          <h2 className="section-title">About our content</h2>
        </div>

        <div className="about-standards-card">
          <div className="about-standards-intro">
            <div className="about-icon-chip">R</div>
            <div>
              <h3 className="card-title">How we research and write our content</h3>
              <p className="muted">
                A content platform for women over 35 should be shaped by clarity,
                not guesswork. That means we write with current evidence, plain
                language, and careful sourcing.
              </p>
            </div>
          </div>

          <div className="about-checklist">
            {contentPrinciples.map((item) => (
              <article className="about-check-row" key={item}>
                <span aria-hidden="true" className="about-check-mark">
                  +
                </span>
                <p>{item}</p>
              </article>
            ))}
          </div>

          <aside className="about-note-card">
            Bloom35 content is educational and supportive. It is not a
            substitute for personalized medical guidance, diagnosis, or
            treatment. If your symptoms are severe, persistent, or affecting
            your quality of life, bring them to a clinician you trust.
          </aside>
        </div>
      </section>

      <section className="about-values-section">
        <div className="about-section-head about-section-head-center">
          <p className="eyebrow">What we stand for</p>
          <h2 className="section-title">Our values</h2>
        </div>

        <div className="about-values-grid">
          {valueCards.map((item) => (
            <article className="about-value-card" key={item.title}>
              <span className="about-value-badge">{item.badge}</span>
              <h3 className="card-title">{item.title}</h3>
              <p className="muted">{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-stats-strip">
        {trustSignals.map((item) => (
          <article className="about-stat-item" key={item.value}>
            <p className="about-stat-value">{item.value}</p>
            <p className="about-stat-label">{item.label}</p>
          </article>
        ))}
      </section>

      <section className="about-promise-section">
        <div className="about-section-head">
          <p className="eyebrow">Our commitment</p>
          <h2 className="section-title">The Bloom35 promise</h2>
        </div>

        <div className="about-promise-list">
          {promiseItems.map((item) => (
            <article className="about-promise-row" key={item.title}>
              <span aria-hidden="true" className="about-promise-dot">
                +
              </span>
              <div>
                <h3 className="about-promise-title">{item.title}</h3>
                <p className="muted">{item.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
