# Bloom35

Bloom35 is a Next.js starter for a perimenopause support app. It includes a polished dashboard, a local-first daily check-in flow, and a searchable education library so the project already feels like a product instead of a blank scaffold.

## Included

- App Router + TypeScript project structure
- Responsive landing/dashboard page
- Interactive daily check-in saved to browser local storage
- Searchable content library for symptom support topics
- Custom visual identity with editorial typography and warm gradient styling

## Routes

- `/`: Dashboard overview
- `/check-in`: Daily symptom check-in
- `/library`: Searchable guidance library

## Run locally

1. Install Node.js 20.9 or newer.
2. Install dependencies with `npm install`.
3. Start the dev server with `npm run dev`.
4. Open `http://localhost:3000`.

## Notes

- This workspace did not have Node.js installed when the project was created, so the app was scaffolded manually and not executed yet.
- Check-in entries currently stay in the browser using local storage. This makes it easy to prototype before adding auth or a database.
- Educational copy in this starter is product content, not medical advice.

## Suggested next steps

- Add authentication and profile-based symptom history
- Persist check-ins to a database and graph them over time
- Export a clinician summary for appointments
- Add reminders, notifications, and cycle-aware personalization
- Move educational content into a CMS
