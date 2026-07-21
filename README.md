# LeadShift

LeadShift is an adaptive-management laboratory for practicing situational leadership. It treats management as a set of movable dials rather than a fixed personality label, and separates a manager's instinctive style from the style they deliberately choose for a particular team or moment.

## Included product areas

### Style lab

- Ten independent management dimensions.
- Natural, current working, and situation-recommended profiles.
- Three-way archetype blends instead of one rigid type.
- Thirty curated management situations with explainable fit scoring.
- Best-fit situation ranking.
- One-slider marginal analysis while every other slider stays constant.
- Behavior-level action recommendations.
- Direct, supportive, concise, and collaborative conversation examples.
- Combination and overcorrection warnings.
- Shareable working-style URLs.

### Scenario assessment

Six scenario-based questions estimate a natural style from choices rather than relying only on self-selected slider positions.

### Situation builder

A dynamic recommendation combines a curated situation with team experience, confidence, trust, urgency, failure consequence, uncertainty, reversibility, and the need for innovation.

### History, team comparison, journal, and simulator

LeadShift includes temporary style snapshots, context profiles, a local team-perception preview, a decision journal, and branching management simulations.

## Privacy and browser storage

LeadShift v0.3.0 separates temporary management data from optional product analytics:

- Management profiles, assessments, snapshots, team-perception entries, journal entries, and simulator progress are stored in `sessionStorage`.
- The workspace survives refreshes in the same tab but is removed when that browser tab/session ends.
- A visible **Reset session** control immediately clears the workspace.
- The application removes the old v0.2.0 `localStorage` workspace automatically.
- A share URL can still contain a working-style profile when the user explicitly chooses **Share working style**.
- Only the analytics consent preference persists in `localStorage`.

This prevents one person using a shared browser from automatically seeing the previous person's management workspace.

## Optional anonymous analytics

Visitors receive a clear opt-in choice. No usage events are sent until they select **Allow anonymous analytics**.

Collected events can include:

- Sections viewed
- Assessment start and completion
- Situation selection
- Debounced slider adjustments using broad 20-point bands
- Recommendation or preset adoption
- Snapshot, profile, perception, and journal feature use
- Simulation start and completion

The analytics client and endpoint intentionally do **not** send:

- Journal text
- Team comments
- Names or email addresses
- Employer or team names
- Exact complete slider profiles
- Raw assessment answers
- Conversation text
- IP addresses or user-agent strings added by the application

The API validates event names, limits payload size and property counts, and truncates strings. Analytics failures never block the product.

### Analytics output modes

Configure with `LEADSHIFT_ANALYTICS_MODE`:

- `disabled`: accept no stored analytics
- `console`: write sanitized events to application logs
- `file`: append NDJSON records to a file
- `webhook`: send sanitized events to `LEADSHIFT_ANALYTICS_WEBHOOK_URL`

Docker Compose defaults to `file` mode and stores records in a named volume at:

```text
/app/data/analytics/events.ndjson
```

View recent records:

```bash
docker compose exec leadshift sh -lc 'tail -n 20 /app/data/analytics/events.ndjson'
```

View an aggregate summary without exposing journal or feedback content:

```bash
docker compose exec leadshift \
  node scripts/summarize-analytics.mjs /app/data/analytics/events.ndjson
```

Disable collection server-side regardless of browser consent:

```bash
LEADSHIFT_ANALYTICS_MODE=disabled docker compose up --build
```

Use a webhook instead:

```bash
LEADSHIFT_ANALYTICS_MODE=webhook \
LEADSHIFT_ANALYTICS_WEBHOOK_URL=https://analytics.example.com/events \
docker compose up --build
```

## Technology

- Next.js 16 App Router
- React 19
- TypeScript
- Plain responsive CSS
- Dependency-free SVG radar charts
- Deterministic and inspectable recommendation logic
- Node-based analytics route with no added runtime dependency

## Requirements

- Node.js 20.9 or newer
- Node.js 22 LTS recommended
- npm 10 or newer

```bash
nvm install
nvm use
```

## Run locally

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`.

Local development defaults to `console` analytics mode. Events are emitted only after opt-in.

## Production build

```bash
npm run verify
npm start
```

## Docker

The Dockerfile avoids BuildKit-only `RUN --mount` syntax, so it works with both legacy builders and BuildKit. The production image uses Node 22 Alpine, Next.js standalone output, a non-root runtime user, and a health check.

```bash
docker compose up --build -d
docker compose ps
docker compose logs -f leadshift
```

Open `http://localhost:3000` or `http://<server-ip>:3000`.

The service binds to `0.0.0.0:3000` inside the container and publishes host port 3000.

## Main project structure

```text
src/
  app/
    api/events/route.ts
    globals.css
    layout.tsx
    page.tsx
  components/
    ManagementLab.tsx
    ProfileSliders.tsx
    ProfileSummary.tsx
    RadarChart.tsx
  data/
  lib/
    analytics.ts
    engine.ts
    session-storage.ts
    types.ts
scripts/
  prepare-standalone.mjs
  summarize-analytics.mjs
Dockerfile
Dockerfile.dev
docker-compose.yml
```

## Production considerations

For a commercial deployment, add a privacy notice reviewed for the jurisdictions where the product is offered, a documented retention period, deletion and export controls, rate limiting, CSRF/origin controls as appropriate, and authenticated organization features before collecting identifiable data.

Do not silently collect decision-journal text or team feedback as product analytics. If those features later become cloud-backed, provide explicit purpose-specific consent, access controls, encryption, retention limits, and deletion controls.

## Important limitation

LeadShift is a reflection and coaching tool. Its scores are not psychometrically validated and must not be used as a clinical assessment, employee-selection test, performance rating, or automated employment decision system.
