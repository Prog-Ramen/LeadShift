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

A dynamic recommendation combines a curated situation with:

- Team experience
- Team confidence
- Trust level
- Urgency
- Consequence of failure
- Degree of uncertainty
- Decision reversibility
- Need for innovation

Users can save context-specific working profiles for senior engineers, junior employees, cross-functional partners, underperformers, and other recurring contexts.

### History and reflection

- Style snapshots over time.
- Timeline trend summaries.
- A decision journal connecting chosen style, intended outcome, actual outcome, and reflection.

### Team perception

The MVP includes a local anonymous-response preview that compares self-perception with an aggregated team view. A real production deployment would require a secure backend, authentication, minimum response thresholds, and privacy controls.

### Management simulator

Branching scenarios show likely trade-offs across trust, clarity, accountability, and delivery. The simulations are educational models, not predictions about a specific person.

## Technology

- Next.js 16 App Router
- React 19
- TypeScript
- Plain responsive CSS
- Dependency-free SVG radar charts
- Browser `localStorage` persistence
- Deterministic and inspectable recommendation logic
- No database, account, API key, or AI model required for the MVP

## Requirements

- Node.js 20.9 or newer
- Node.js 22 LTS recommended
- npm 10 or newer

The repository contains `.nvmrc`, so with `nvm` installed you can run:

```bash
nvm install
nvm use
```

The project `.npmrc` points to the public npm registry, preventing accidental use of an inaccessible internal registry.

## Run locally

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`.

## Production build

```bash
npm run verify
npm start
```

`npm run verify` runs ESLint, TypeScript checking through the Next.js build, the optimized production build, and preparation of a self-contained standalone runtime.

## Docker production image

The production image uses a multi-stage Node 22 Alpine build, Next.js standalone output, a non-root runtime user, and a container health check.

```bash
docker build -t leadshift .
docker run --rm --name leadshift -p 3000:3000 leadshift
```

Or use Compose:

```bash
docker compose up --build
```

Open `http://localhost:3000`.

## Docker development mode

```bash
docker build -f Dockerfile.dev -t leadshift-dev .
docker run --rm -p 3000:3000 \
  -v "$PWD:/app" \
  -v /app/node_modules \
  -v /app/.next \
  leadshift-dev
```

## Recommendation model

Each curated situation defines an ideal profile and higher weights for dimensions that matter most. Context controls create a second target profile. LeadShift blends the curated target with the context target and then calculates a weighted distance from the current working style.

Explicit rules detect combinations such as:

- High challenge with low visible care
- High autonomy with low context visibility
- Exploration paired with extreme failure prevention
- Commanding posture paired with unclear shared authority
- A temporary crisis adaptation that overshoots or persists too long

The language shown to users comes from transparent action templates. No language model secretly determines the score.

## Main project structure

```text
src/
  app/
    globals.css
    layout.tsx
    page.tsx
  components/
    ManagementLab.tsx
    ProfileSliders.tsx
    ProfileSummary.tsx
    RadarChart.tsx
  data/
    archetypes.ts
    assessment.ts
    context.ts
    dimensions.ts
    simulator.ts
    situations.ts
  lib/
    engine.ts
    types.ts
scripts/
  prepare-standalone.mjs
Dockerfile
Dockerfile.dev
docker-compose.yml
```

## Production next steps

The current MVP intentionally keeps all personal data in the browser. A commercial version should add:

- Secure user accounts and encrypted cloud persistence
- Organization workspaces and role-based access
- Anonymous survey links with minimum response thresholds
- Audit logs, deletion controls, and data-retention policies
- Admin-authored situation libraries
- Exportable coaching reports
- A carefully grounded AI explanation layer using the deterministic engine as its source of truth

## Important limitation

LeadShift is a reflection and coaching tool. Its scores are not psychometrically validated and must not be used as a clinical assessment, employee-selection test, performance rating, or automated employment decision system.
