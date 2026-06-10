# Database & Seeding

## SQLite: a single-file database

The backend stores everything in **SQLite**, a lightweight database that lives in one file
on disk: `code/server/database.sqlite`. There's no separate database server to install or
run — opening that file _is_ connecting to the database. This keeps local development
friction-free.

The connection is configured in `code/server/src/data-source.ts`:

```ts
export const AppDataSource = new DataSource({
    type: "sqlite",
    database: "database.sqlite",
    synchronize: true,
    logging: false,
    entities: [Lead, CustomField, Stage, Opportunity, AppSetting],
    migrations: [],
    subscribers: [],
});
```

## How the schema is created: `synchronize: true`

TypeORM runs with **`synchronize: true`**. On startup, TypeORM inspects the entity classes
and automatically reshapes the database tables to match them. Add a field to an entity, and
the matching column appears on the next start — no manual schema steps. (`migrations` is
intentionally empty.)

If a schema change ever fails to sync cleanly, delete `database.sqlite` and let it be
recreated, or re-seed (below).

## Seeding

The seed routine in `code/server/src/seed.ts` populates demo data so the app is usable
immediately:

- **App settings** — the four keys described in [Business logic](./business-logic.md),
  with `minimumOpportunityValue` seeded to `1000`.
- **Custom fields** — `industry` (lead), `region` (opportunity), `headcount` (opportunity).
- **Stages** — seven stages from "Cold Lead" through "Deal Signed" (`won`) and
  "Ghosted Me" (`lost`), each with an `order` and a `conversionLikelihood`.
- **Leads** — 20 leads with generated names, ages, and phone numbers.
- **Opportunities** — 1–3 per lead, with random values, stages, close dates, and custom
  fields. Each opportunity's `expectedValue` is computed during seeding.

### When seeding runs

- On a normal `npm run dev` start, `seedDatabase()` is called but **skips seeding if any
  stages already exist** — so your data isn't wiped on every restart.
- Running the seed script directly **clears all tables first**, then reseeds, giving a
  clean, known dataset.

## Relevant scripts

Run from the repo root unless noted.

| Command | Effect |
| --- | --- |
| `npm run dev` | Starts the server (and client). Seeds only if the database is empty. |
| `npm run seed -w @simple-crm/server` | Wipes and reseeds `database.sqlite`. |
| `npm run build -w @simple-crm/server` | Compiles the server TypeScript. |
| `npm run typecheck -w @simple-crm/server` | Type-checks the server. |

To start completely fresh, delete `code/server/database.sqlite` and run the seed script
(or just start the app, which recreates the schema and seeds an empty database).
