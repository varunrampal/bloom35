"use client";

import { useState, useTransition } from "react";

import type { CheckInField } from "@/lib/app-data";

type DailyCheckInProps = {
  fields: CheckInField[];
  supportTracks: string[];
};

type StoredEntry = {
  focus: string;
  note: string;
  savedAt: string | null;
  scores: Record<string, number>;
};

const storageKey = "bloom35-check-in";
const intensityLabels = ["steady", "mild", "noticeable", "high", "very high"];
const guidanceByField: Record<string, string> = {
  energy:
    "Favor gentle pacing and a simpler evening agenda so low energy does not turn into full depletion.",
  focus:
    "If concentration feels noisy, the product can steer toward shorter tasks and fewer context switches.",
  mood:
    "Mood variability often feels easier to describe when tied to time of day, sleep, or cycle changes.",
  sleep:
    "A small bedtime reset is more realistic than a perfect routine. Track what lowered friction, not what looked ideal.",
  temperature:
    "Cooling cues are especially useful when symptoms cluster late in the day or interrupt sleep.",
};

function buildDefaultScores(fields: CheckInField[]) {
  return Object.fromEntries(fields.map((field) => [field.id, 2]));
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function readStoredEntry(
  fields: CheckInField[],
  supportTracks: string[],
): StoredEntry {
  const defaultEntry: StoredEntry = {
    focus: supportTracks[0] ?? "Cooling plan",
    note: "",
    savedAt: null,
    scores: buildDefaultScores(fields),
  };

  if (typeof window === "undefined") {
    return defaultEntry;
  }

  const rawEntry = window.localStorage.getItem(storageKey);

  if (!rawEntry) {
    return defaultEntry;
  }

  try {
    const parsed = JSON.parse(rawEntry) as Partial<StoredEntry>;

    return {
      focus:
        typeof parsed.focus === "string" ? parsed.focus : defaultEntry.focus,
      note: typeof parsed.note === "string" ? parsed.note : defaultEntry.note,
      savedAt:
        typeof parsed.savedAt === "string" ? parsed.savedAt : defaultEntry.savedAt,
      scores:
        parsed.scores && typeof parsed.scores === "object"
          ? {
              ...defaultEntry.scores,
              ...parsed.scores,
            }
          : defaultEntry.scores,
    };
  } catch {
    window.localStorage.removeItem(storageKey);

    return defaultEntry;
  }
}

export function DailyCheckIn({ fields, supportTracks }: DailyCheckInProps) {
  const [initialEntry] = useState(() =>
    readStoredEntry(fields, supportTracks),
  );
  const [scores, setScores] = useState<Record<string, number>>(
    initialEntry.scores,
  );
  const [note, setNote] = useState(initialEntry.note);
  const [focus, setFocus] = useState(initialEntry.focus);
  const [savedAt, setSavedAt] = useState<string | null>(initialEntry.savedAt);
  const [isPending, startTransition] = useTransition();

  const highestField = fields[0]
    ? fields.reduce<{ field: CheckInField; value: number }>(
        (current, field) => {
          const value = scores[field.id] ?? 0;

          if (value > current.value) {
            return {
              field,
              value,
            };
          }

          return current;
        },
        {
          field: fields[0],
          value: scores[fields[0].id] ?? 0,
        },
      )
    : null;

  const handleSave = () => {
    const timestamp = formatTime(new Date());

    const entry: StoredEntry = {
      focus,
      note,
      savedAt: timestamp,
      scores,
    };

    window.localStorage.setItem(storageKey, JSON.stringify(entry));

    startTransition(() => {
      setSavedAt(timestamp);
    });
  };

  const handleReset = () => {
    setScores(buildDefaultScores(fields));
    setNote("");
    setFocus(supportTracks[0] ?? "Cooling plan");
    setSavedAt(null);
    window.localStorage.removeItem(storageKey);
  };

  return (
    <article className="panel checkin-form">
      <div className="checkin-header">
        <p className="eyebrow">Today at a glance</p>
        <div className="summary-grid">
          <div>
            <p className="summary-score">
              {highestField ? intensityLabels[highestField.value] : "steady"}
            </p>
            <p className="detail-label">Strongest signal right now</p>
          </div>

          <p className="summary-copy">
            {highestField
              ? guidanceByField[highestField.field.id]
              : "Use the sliders to sketch out the day."}
          </p>
        </div>
      </div>

      <div className="form-grid">
        {fields.map((field) => (
          <label className="score-row" htmlFor={field.id} key={field.id}>
            <div className="score-topline">
              <div>
                <p className="card-title">{field.label}</p>
                <p className="muted">{field.hint}</p>
              </div>
              <span className="score-value">
                {intensityLabels[scores[field.id] ?? 0]}
              </span>
            </div>

            <input
              className="range-input"
              id={field.id}
              max="4"
              min="0"
              onChange={(event) =>
                setScores((currentScores) => ({
                  ...currentScores,
                  [field.id]: Number(event.target.value),
                }))
              }
              type="range"
              value={scores[field.id] ?? 0}
            />

            <div className="score-scale">
              <span>{field.lowLabel}</span>
              <span>{field.highLabel}</span>
            </div>
          </label>
        ))}
      </div>

      <section>
        <p className="subsection-label">Support track for tonight</p>
        <div className="focus-options">
          {supportTracks.map((track) => (
            <button
              className={`focus-button${focus === track ? " active" : ""}`}
              key={track}
              onClick={() => setFocus(track)}
              type="button"
            >
              {track}
            </button>
          ))}
        </div>
      </section>

      <section>
        <p className="subsection-label">Notes</p>
        <textarea
          className="textarea"
          onChange={(event) => setNote(event.target.value)}
          placeholder="What stood out today? Think timing, triggers, what helped, and what you want to remember tomorrow."
          value={note}
        />
      </section>

      <div className="button-row">
        <button className="save-button" onClick={handleSave} type="button">
          {isPending ? "Saving..." : "Save check-in"}
        </button>
        <button className="ghost-button" onClick={handleReset} type="button">
          Reset form
        </button>
      </div>

      <p className="save-status">
        {savedAt
          ? `Last saved locally at ${savedAt}.`
          : "Nothing saved yet. Entries stay in this browser for now."}
      </p>
    </article>
  );
}
