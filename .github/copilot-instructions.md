# SimpleCRM — Copilot Instructions

# Description

A tiny CRM (leads, opportunities, pipeline stages, custom fields) built as an npm
workspaces monorepo. React + Vite client and Express + TypeORM + SQLite server.

## Special instructions for Copilot

This is a fake codebase that I'm working on as a coding exercise. So, it doesn't need 
to be production ready, but the code changes need to be clean and consistent. 
In addition to building features that I specify, please call out inconsistencies, 
dead code, or potential optimizations to existing code and structure. Before writing 
any non-trivial code, (>30 lines of code, data model or server changes with wide 
implications, etc) pause and explicitly write down: (a) what's the smallest possible 
solution? (b) what approach would a senior engineer with deep familiarity with this 
codebase take? If the answers are not obvious, search first, then run your preferred 
approach by me.

## Taxonomy
- **Lead**: A potential customer tracked by sales reps. Includes customer's personal info and opportunities.
- **Opportunity**: A deal that sales reps are working on for a lead. A lead can have none or many opportunities.
- **Pipeline Report**: A report showing opportunities by stage.
- **Custom Field**: Can apply to either a lead or an opportunity. Both leads and opportunities can each have multiple custom fields.
- **Stage**: Which stage of the sale's pipeline an opportunity is currently in. Each opportunity can only be in one stage at a time. 	

## Layout

```
code/
  client/   React 19 + Vite 6 + Tailwind v4 (TypeScript)
  server/   Express 5 + TypeORM 0.3 + SQLite (TypeScript, CommonJS)
```

Both packages are npm workspaces (`@simple-crm/client`, `@simple-crm/server`) declared
in the root `package.json`. Always run commands from the repo root unless noted.

## Commands (run from repo root)

| Command | Effect |
| --- | --- |
| `npm install` | Install all workspace deps |
| `npm run dev` | Runs client (Vite, :5173) **and** server (nodemon + ts-node, :3000) concurrently |
| `npm run build` | `npm run build` in each workspace (`tsc -b && vite build` / `tsc -p .`) |
| `npm run typecheck` | Type-checks both workspaces |
| `npm run lint` | Lints client only (server has no lint script) |
| `npm run test` | No tests exist; the script is a no-op via `--if-present` |

Workspace-scoped runs: `npm run <script> -w @simple-crm/server` (or `-w @simple-crm/client`).
There is no single-test runner because there is no test suite.

Reset/reseed the database: `npm run seed -w @simple-crm/server`. This wipes and reseeds
`code/server/database.sqlite`. On a normal `dev` start, `seedDatabase()` runs but
**skips seeding if any stages already exist** (see `code/server/src/seed.ts`).

## Architecture essentials

- **Dev networking**: The client calls `/api/*` (axios). Vite proxies `/api/*` to
  `http://localhost:3000` and **strips the `/api` prefix** (`code/client/vite.config.ts`).
  The Express server therefore mounts routes at the root (`/leads`, `/stages`, etc.) —
  do not add an `/api` prefix server-side.
- **Persistence**: TypeORM with `synchronize: true` against a local SQLite file
  (`code/server/src/data-source.ts`). Schema changes happen automatically from entity
  edits; there are no migrations. Delete `database.sqlite` (or re-seed) if a schema
  change ever fails to sync cleanly.
- **Entities** live in `code/server/src/entity/`: `Lead`, `Opportunity`, `Stage`,
  `CustomField`, `AppSetting`. Relations use `eager: true` (Opportunity → Lead, Stage),
  so `find()` returns them without `relations:` options.
- **Custom fields** are stored as `simple-json` columns (`Lead.customFields`,
  `Opportunity.customFields`) — arbitrary key/value bags driven by rows in the
  `CustomField` table (which has an `entity` discriminator: `"lead"` or `"opportunity"`).
- **Expected value bookkeeping**: `Opportunity.expectedValue = value * likelihood`,
  where likelihood is `wonStageLikelihood` / `lostStageLikelihood` / the stage's own
  `conversionLikelihood` depending on `stage.status` (`"won" | "lost" | "pending"`).
  `Stage.expectedValue` is a **denormalized rolling sum** maintained by the POST/PUT/
  DELETE `/opportunities` handlers and by PUT `/settings/:key` when the won/lost
  likelihood settings change. Any new code that creates, moves, deletes, or revalues
  opportunities must keep this sum in sync — the `/pipeline` report and UI rely on it.
- **App settings** (`AppSetting`) are a key/value table seeded with
  `wonStageLikelihood`, `lostStageLikelihood`, `minimumOpportunityValue`,
  `defaultStageConversionLikelihood`. Read via `GET /settings`, upserted via
  `PUT /settings/:key` with `{ value }`.
- **Client structure**: `code/client/src/App.tsx` is a simple page switcher
  (`home | pipeline | settings`) — no router. Each top-level feature is a single
  `.tsx` file (`leads.tsx`, `pipeline.tsx`, `manage-fields.tsx`, etc.). Shared API
  types live in `code/client/src/types.ts` and are hand-mirrored from server entities.

## Conventions

- **TypeScript everywhere.** Server is CommonJS (`"type": "commonjs"`,
  `import * as express from "express"`); client is ESM. Don't mix them up.
- **Prettier** (`.prettierrc.json`): 4-space indent, double quotes, semicolons,
  `printWidth: 90`, `arrowParens: "avoid"`, `trailingComma: "all"`,
  `bracketSameLine: true`. JSON files use 2-space indent.
- **File naming**: client components use `kebab-case.tsx`; server entities use
  `PascalCase.ts`.
- **Error handling on the server is intentionally minimal** — most handlers assume the
  record exists and write directly. Match the existing style for small changes; only
  add validation when it's genuinely needed for the feature you're building.
- **No auth, no tests, no migrations.** Don't invent these unless explicitly asked.

## Browser automation (Playwright MCP)

The Playwright MCP server is available for end-to-end interaction with the running
app. When verifying a UI change or reproducing a bug, prefer driving the real app
over reasoning about it: start `npm run dev`, then use Playwright MCP tools to
navigate to http://localhost:5173, exercise the flow, and snapshot/inspect the DOM.
The Vite dev server proxies `/api/*` to the server on :3000, so a single browser
session covers both tiers.
