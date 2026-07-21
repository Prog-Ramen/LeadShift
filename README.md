# ManagerFlex

ManagerFlex is an interactive situational-leadership laboratory. It treats management style as a set of independent dials rather than a permanent personality label.

Users can:

- Adjust 10 management dimensions from 0–100.
- See the closest of 16 four-letter management archetypes.
- Compare the current configuration against 30 management situations.
- View explainable weighted fit scores and combination warnings.
- Change one slider while all others remain constant and see the marginal effect.
- Save recurring management modes locally.
- Share a configuration through a compact URL.
- Load presets for humane default, crisis, coaching, senior-team, and turnaround modes.

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Plain CSS with no UI or chart dependency
- Browser `localStorage` for saved modes
- Static, deterministic data and scoring; no backend required

## Requirements

- Node.js 20.9 or newer
- npm 10 or newer recommended

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Production build

```bash
npm run verify
npm start
```

`npm run verify` runs ESLint and a full production build.

## Docker

```bash
docker build -t manager-flex .
docker run --rm -p 3000:3000 manager-flex
```

Then open `http://localhost:3000`.

## How scoring works

Each situation defines:

- An ideal value for every management dimension.
- Extra weights for the dimensions that matter most.
- Suggested actions and a situational warning.

The fit score starts with a weighted root-mean-square distance between the current profile and the situation profile:

```text
raw fit = 100 - weighted RMS distance
```

A small set of explicit combination rules can then apply penalties, such as:

- High challenge with low care.
- High autonomy with low visibility.
- High exploration with strong failure prevention.
- Commanding posture with highly participative decisions.

All scoring logic is in `src/lib/engine.ts`. Situation profiles are in `src/data/situations.ts`.

## Archetype code

The four-letter archetype code uses these primary dimensions:

1. `H` Human-centred / `R` Results-centred
2. `A` Autonomy / `D` Direction
3. `S` Stability / `E` Exploration
4. `I` Incremental / `T` Transformational

Care, challenge, visibility, leadership posture, risk posture, and decision style remain independent modifiers rather than being hidden in the four-letter label.

## Project structure

```text
src/
  app/
    globals.css          Global responsive design system
    layout.tsx           Metadata and root layout
    page.tsx             Main route
  components/
    ManagementLab.tsx    Complete interactive application
    RadarChart.tsx       Dependency-free SVG profile comparison
  data/
    archetypes.ts        16 management archetypes
    dimensions.ts        Slider definitions, defaults, and presets
    situations.ts        30 situational reference profiles
  lib/
    engine.ts            Scoring, matching, warnings, and marginal analysis
    types.ts             Shared TypeScript types
```

## Extending the app

Good next additions include:

- User accounts and cloud-saved profiles.
- Team 360 assessments that compare self-perception with team perception.
- A scenario authoring interface.
- Organization-specific situation libraries and weights.
- An LLM explanation layer that uses the deterministic score as source data.
- Interactive branching simulations for leadership practice.

## Important limitation

ManagerFlex is a reflection and coaching tool. Its scores are not psychometrically validated and should not be used as a clinical assessment, employee-selection test, or automated employment decision system.
