# Backend Overview

The SimpleCRM backend is a small **REST API**: the client sends HTTP requests (like
"give me all leads") and the server answers with JSON. It's written in **TypeScript** and
runs as a single Node.js process listening on **port 3000**.

This page is the friendly introduction. For specifics, jump to the
[data model](./data-model.md), [API reference](./api-reference.md),
[business logic](./business-logic.md), or [database & seeding](./database-and-seeding.md).

## The three technology layers

The backend is built from three layers, each with a clear job:

- **Express 5** — the web server framework. It receives incoming HTTP requests, matches
  each one to a handler based on its URL and method, and sends back a JSON response.
- **TypeORM 0.3** — an **ORM** ("Object-Relational Mapper"). This is a translation layer
  between code and the database. Instead of writing raw SQL, the code works with ordinary
  TypeScript classes (`Lead`, `Opportunity`, etc.), and TypeORM turns operations on those
  objects into the right database reads and writes. For example, "save this `Lead`
  object" becomes the appropriate `INSERT` or `UPDATE` behind the scenes.
- **SQLite** — the actual database. It's a lightweight database that lives in a **single
  file on disk** (`code/server/database.sqlite`) rather than running as a separate server
  process. There's nothing to install or host — the file _is_ the database.

> New to ORMs and SQLite? The mental model: TypeORM lets you treat database rows as
> TypeScript objects, and SQLite stores those rows in one local file. Together they remove
> almost all database boilerplate for a small app.

## How a request flows

1. The React client calls an endpoint such as `/api/leads` (using axios).
2. In development, the Vite dev server **proxies** `/api/*` to the API server on
   `http://localhost:3000` and **strips the `/api` prefix**. So the server actually
   receives `/leads`. (This is why routes are registered without an `/api` prefix on the
   server — see `code/client/vite.config.ts`.)
3. Express matches the URL + HTTP method to a **route handler**.
4. The handler asks TypeORM for the relevant **repository** (e.g. the `Lead` repository)
   and reads from or writes to the SQLite file.
5. The result is serialized to JSON and returned to the client.

## Startup sequence

Startup is short and linear (`code/server/src/index.ts`):

1. **Initialize the data source** — connect to SQLite and load the entity definitions
   (`AppDataSource.initialize()`).
2. **Seed the database** — `seedDatabase()` populates demo data, but skips if data
   already exists (see [Database & seeding](./database-and-seeding.md)).
3. **Build the Express app** — enable JSON body parsing and register each feature's
   router (settings, custom fields, leads, stages, opportunities, pipeline).
4. **Listen on port 3000.**

## Source layout

```
code/server/src/
  index.ts            # startup: init DB, seed, register routes, listen
  data-source.ts      # TypeORM connection config (SQLite + entities)
  seed.ts             # demo-data seeding routine
  entity/             # the data model — one class per table
    Lead.ts
    Opportunity.ts
    Stage.ts
    CustomField.ts
    AppSetting.ts
  routes/             # one Express router per feature
    leads.ts
    opportunities.ts
    stages.ts
    custom-fields.ts
    settings.ts
    pipeline.ts
  services/           # shared logic used by routes
    opportunity-value.ts   # expected-value calculation
    settings.ts            # reads app settings with defaults
```

## What the API does, in one paragraph

Sales reps track **leads** (potential customers). Each lead can have any number of
**opportunities** (deals). Every opportunity sits in one pipeline **stage** (Cold Lead,
Negotiation, Deal Signed, etc.). The system computes an **expected value** for each
opportunity by weighting its dollar value against how likely that stage is to close, and
the **pipeline** report rolls those numbers up by stage. **Custom fields** let users
attach extra data to leads and opportunities, and **settings** tune a few global numbers.
