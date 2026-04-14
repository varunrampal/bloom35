import { createPageMetadata } from "@/lib/seo";

const jumpLinks = [
  { href: "#medical-disclaimer", label: "Medical disclaimer" },
  { href: "#affiliate-links", label: "Affiliate links" },
  { href: "#sponsored-content", label: "Sponsored content" },
  { href: "#editorial-policy", label: "Editorial policy" },
  { href: "#privacy-data", label: "Privacy & data" },
  { href: "#copyright", label: "Copyright" },
];

const medicalNotes = [
  "We are only speaking to medical topics because something you read here may overlap with your health questions. If you are experiencing a medical emergency, contact your local emergency services immediately.",
  "Individual results vary. Nutrition, exercise, and wellness strategies work differently for each person. What works for one woman may not be appropriate for another.",
  "Supplement recommendations on this site are based on available research and are not a prescription. Consult your doctor before using any supplement, especially if you use medication or have an existing health condition.",
];

const affiliatePrograms = [
  "Amazon Associates. We earn from qualifying purchases on Amazon.com and Amazon.co.uk.",
  "ShareASale and Impact for selected health, nutrition, and wellness partnerships.",
  "Individual brand programs, including supplement, meal planning, and fitness-support services. All individual links are disclosed on relevant pages.",
];

const sponsoredRules = [
  "All sponsored content is clearly labeled with terms like \"Sponsored\", \"Paid partnership\", or \"In collaboration with [brand]\" at the top of the post.",
  "We only accept sponsorships from brands whose products align with our editorial values and that we have personally evaluated.",
  "Sponsored content never replaces editorial content. We retain full rights to write honest opinions, including negative ones, even in paid partnerships.",
  "We decline partnerships with alcohol brands, diet pill companies, products making unsubstantiated health claims, or anything we would not recommend to a friend.",
];

const editorialRules = [
  "Sources: All health claims are supported by peer-reviewed research, published clinical guidance, or established medical consensus. We cite sources within or at the end of every article.",
  "Updates: Articles are reviewed and adjusted when new research changes our guidance. The date of last review is displayed at the top of key articles.",
  "Corrections: If we publish something inaccurate, we correct it promptly and transparently, adding notes that explain what changed and why.",
  "Independence: No advertiser, sponsor, or affiliate partner has any influence over our editorial content, research, or product evaluations.",
];

const privacyRules = [
  "We never sell your personal data to third parties, ever, under any circumstances.",
  "Email addresses collected via our newsletter signup are used only to send Bloom35 content. You can unsubscribe at any time with one click.",
  "App health data, symptom tracking, and check-in notes stay private and are never shared with advertisers or used for targeted marketing.",
  "Cookies are used for analytics and affiliate tracking only. You can opt out via your cookie settings at any time.",
];

export const metadata = createPageMetadata({
  description:
    "Read Bloom35's disclosure statement, including our medical disclaimer, affiliate link policy, sponsored content rules, editorial standards, privacy summary, and copyright policy.",
  path: "/disclosure",
  title: "Disclosure Statement",
});

export default function DisclosurePage() {
  return (
    <div className="disclosure-page">
      <section className="disclosure-hero">
        <p className="eyebrow disclosure-eyebrow">Legal &amp; editorial</p>
        <h1 className="disclosure-title">Disclosure statement</h1>
        <p className="disclosure-subtitle">
          We believe in full transparency. This page explains exactly how
          Bloom35 earns money, how we choose what to recommend, and the limits
          of our content.
        </p>
        <p className="disclosure-updated">Last updated: April 2026</p>
      </section>

      <section className="disclosure-jump-bar" aria-label="Jump to sections">
        {jumpLinks.map((item) => (
          <a className="disclosure-jump-link" href={item.href} key={item.href}>
            {item.label}
          </a>
        ))}
      </section>

      <section className="disclosure-body">
        <article className="disclosure-section" id="medical-disclaimer">
          <div className="disclosure-section-heading">
            <span className="disclosure-section-icon disclosure-section-icon-rose">
              1
            </span>
            <h2 className="disclosure-section-title">Medical disclaimer</h2>
          </div>

          <p className="disclosure-copy">
            Bloom35 provides general health information and wellness education
            only. We are not a medical practice and do not provide medical
            advice, diagnosis, or treatment.
          </p>

          <div className="disclosure-alert disclosure-alert-rose">
            <p className="detail-label">Important. Please read.</p>
            <p className="disclosure-copy">
              The content on Bloom35, including articles, meal plans,
              supplement recommendations, and app features, is intended for
              general educational purposes only. It is not a substitute for
              personalized medical advice, diagnosis, or treatment from a
              qualified healthcare provider. Always seek the advice of your
              physician or another qualified health professional with any
              questions you may have regarding a medical condition.
            </p>
          </div>

          <div className="disclosure-checklist">
            {medicalNotes.map((item) => (
              <article className="disclosure-check-row" key={item}>
                <span className="disclosure-check-bullet disclosure-check-bullet-rose">
                  i
                </span>
                <p>{item}</p>
              </article>
            ))}
          </div>
        </article>

        <article className="disclosure-section" id="affiliate-links">
          <div className="disclosure-section-heading">
            <span className="disclosure-section-icon disclosure-section-icon-gold">
              2
            </span>
            <h2 className="disclosure-section-title">Affiliate links</h2>
          </div>

          <p className="disclosure-copy">
            Bloom35 participates in affiliate marketing programs. This means
            that some links on our website are affiliate links. If you click one
            and make a purchase, we may earn a small commission at no extra cost
            to you.
          </p>

          <div className="disclosure-alert disclosure-alert-gold">
            <p className="detail-label">FTC disclosure required by law</p>
            <p className="disclosure-copy">
              In accordance with the Federal Trade Commission (FTC) guidelines
              and UK ASA regulations, Bloom35 discloses that some posts and
              pages contain affiliate links. These are marked where possible.
              Earning a commission does not influence our recommendations. We
              only link to products we genuinely believe in.
            </p>
          </div>

          <p className="disclosure-copy">
            We are currently affiliated with the following programs:
          </p>

          <div className="disclosure-checklist">
            {affiliatePrograms.map((item) => (
              <article className="disclosure-check-row" key={item}>
                <span className="disclosure-check-bullet disclosure-check-bullet-gold">
                  +
                </span>
                <p>{item}</p>
              </article>
            ))}
          </div>

          <div className="disclosure-commitment">
            <p className="detail-label">Our commitment</p>
            <p className="disclosure-copy">
              We will never recommend a product solely because we earn a
              commission on it. If a product doesn&apos;t meet our quality
              standards, we won&apos;t feature it, regardless of the commission
              rate. Our readers&apos; trust is worth more than any affiliate
              fee.
            </p>
          </div>
        </article>

        <article className="disclosure-section" id="sponsored-content">
          <div className="disclosure-section-heading">
            <span className="disclosure-section-icon disclosure-section-icon-rose">
              3
            </span>
            <h2 className="disclosure-section-title">Sponsored content</h2>
          </div>

          <p className="disclosure-copy">
            Bloom35 occasionally publishes sponsored posts, product reviews, or
            brand partnerships where we are compensated by a company to feature
            their product or service.
          </p>

          <div className="disclosure-checklist">
            {sponsoredRules.map((item) => (
              <article className="disclosure-check-row" key={item}>
                <span className="disclosure-check-bullet disclosure-check-bullet-green">
                  +
                </span>
                <p>{item}</p>
              </article>
            ))}
          </div>
        </article>

        <article className="disclosure-section" id="editorial-policy">
          <div className="disclosure-section-heading">
            <span className="disclosure-section-icon disclosure-section-icon-green">
              4
            </span>
            <h2 className="disclosure-section-title">Editorial policy</h2>
          </div>

          <p className="disclosure-copy">
            Bloom35 is committed to publishing accurate, well-researched, and
            up-to-date health content. Here is how we ensure the quality and
            integrity of everything we publish.
          </p>

          <div className="disclosure-checklist">
            {editorialRules.map((item) => (
              <article className="disclosure-check-row" key={item}>
                <span className="disclosure-check-bullet disclosure-check-bullet-green">
                  +
                </span>
                <p>{item}</p>
              </article>
            ))}
          </div>
        </article>

        <article className="disclosure-section" id="privacy-data">
          <div className="disclosure-section-heading">
            <span className="disclosure-section-icon disclosure-section-icon-blue">
              5
            </span>
            <h2 className="disclosure-section-title">Privacy &amp; data use</h2>
          </div>

          <p className="disclosure-copy">
            We take your privacy seriously. Here is a plain-language summary of
            how we handle your data. For the full details, review our Privacy
            Policy.
          </p>

          <div className="disclosure-checklist">
            {privacyRules.map((item) => (
              <article className="disclosure-check-row" key={item}>
                <span className="disclosure-check-bullet disclosure-check-bullet-blue">
                  +
                </span>
                <p>{item}</p>
              </article>
            ))}
          </div>
        </article>

        <article className="disclosure-section" id="copyright">
          <div className="disclosure-section-heading">
            <span className="disclosure-section-icon disclosure-section-icon-copper">
              6
            </span>
            <h2 className="disclosure-section-title">Copyright</h2>
          </div>

          <p className="disclosure-copy">
            All content on Bloom35, including articles, meal plans, graphics,
            app content, and Pinterest templates, is the original work of
            Bloom35 and is protected by copyright law.
          </p>

          <div className="disclosure-alert disclosure-alert-neutral">
            <p className="detail-label">Usage policy</p>
            <p className="disclosure-copy">
              You may share short excerpts up to 100 words with a clear link
              back to the original article. You may not copy, republish, or
              redistribute full articles, meal plans, or other content without
              written permission. To request permission or licensing, contact us
              at the address below.
            </p>
          </div>
        </article>

        <section className="disclosure-contact-card">
          <div className="disclosure-contact-icon">@</div>
          <div>
            <h2 className="card-title">Questions about this disclosure?</h2>
            <p className="muted">
              If you have any questions about our affiliate relationships,
              sponsored content, editorial process, or how we handle data, you
              can reach us directly. We are committed to being fully transparent.
            </p>
            <p className="disclosure-contact-email">hello@bloom35.com</p>
          </div>
        </section>
      </section>
    </div>
  );
}
