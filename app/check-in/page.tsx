import type { Metadata } from "next";

import { DailyCheckIn } from "@/components/daily-check-in";
import {
  checkInFields,
  clinicianPrep,
  journalPrompts,
  supportTracks,
} from "@/lib/app-data";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Perimenopause Symptom Check-in Tool",
  description:
    "Use Bloom35's daily perimenopause check-in tool to track sleep, temperature symptoms, mood variability, focus, and energy in a lightweight routine.",
  path: "/check-in",
});

export default function CheckInPage() {
  return (
    <div className="page-stack">
      <section className="page-hero">
        <p className="eyebrow">Daily check-in</p>
        <h1 className="section-title page-title">
          Capture today without turning it into homework.
        </h1>
        <p className="muted">
          This prototype stores entries in local browser storage so the flow can
          be evaluated before adding accounts, APIs, or a database.
        </p>
      </section>

      <section className="interactive-shell">
        <DailyCheckIn fields={checkInFields} supportTracks={supportTracks} />

        <div className="support-column">
          <article className="panel info-card">
            <p className="eyebrow">Reflection prompts</p>
            <h2 className="card-title card-title-lg">Helpful questions for the notes box.</h2>

            <ul className="plain-list">
              {journalPrompts.map((prompt) => (
                <li className="list-row" key={prompt}>
                  {prompt}
                </li>
              ))}
            </ul>
          </article>

          <article className="panel info-card">
            <p className="eyebrow">Appointment prep</p>
            <h2 className="card-title card-title-lg">Questions worth bringing to care visits.</h2>

            <ul className="plain-list">
              {clinicianPrep.map((prompt) => (
                <li className="list-row" key={prompt}>
                  {prompt}
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>
    </div>
  );
}
