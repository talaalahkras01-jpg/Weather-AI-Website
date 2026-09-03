# Weather AI

Weather AI turns the forecast into a calm, useful daily brief with location search, current conditions, hourly and seven-day outlooks, and practical weather-aware guidance.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/weather-ai/src/App.tsx` — the single-page weather experience and local forecast data
- `artifacts/weather-ai/src/index.css` — visual theme, typography, responsive layout, and motion
- `artifacts/weather-ai/vite.config.ts` — Vite app configuration and artifact routing
- `artifacts/api-server` — shared API service scaffold; not required by the first Weather AI build

## Architecture decisions

- The first release is frontend-only so the core experience works instantly without external weather credentials.
- Forecast data is local and structured by city to keep location switching and unit conversion deterministic.
- The interface treats AI as interpretation and practical guidance layered on top of forecast data, not as a separate chat surface.

## Product

- Search and switch between supported cities.
- View current conditions, feels-like temperature, wind, humidity, rain chance, and visibility.
- Read an AI-style day brief and contextual insight.
- Scan the next several hours and the seven-day outlook.
- Toggle Celsius/Fahrenheit and refresh the displayed forecast state.

## User preferences

No project-specific preferences recorded yet.

## Gotchas

- The web workflow must provide `PORT` and `BASE_PATH`; use the managed Weather AI workflow for previews.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
