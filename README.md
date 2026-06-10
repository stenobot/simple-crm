# SimpleCRM

A small CRM app: leads, opportunities, pipeline stages, custom fields.

## Requirements

- Node.js 20+
- npm 10+

## Install

```sh
npm install
```

## Run

```sh
npm run dev
```

That single command starts both processes:

- **API server** on http://localhost:3000 (Express + TypeORM + SQLite, via `nodemon` + `ts-node`)
- **Web client** on http://localhost:5173 (React + Vite, proxies `/api/*` to the server)

Open http://localhost:5173 in your browser.

## Other scripts

| From the repo root | What it does |
| --- | --- |
| `npm run build` | Builds both packages |
| `npm run typecheck` | Type-checks both packages |
| `npm run lint` | Lints the client |

## Layout

```
code/
  client/   React + Vite frontend
  server/   Express + TypeORM API
```

## Documentation

Detailed docs live in [`docs/`](./docs/README.md). The backend is documented in depth:

- [Backend overview](./docs/backend/README.md)
- [Data model](./docs/backend/data-model.md)
- [API reference](./docs/backend/api-reference.md)
- [Business logic](./docs/backend/business-logic.md)
- [Database & seeding](./docs/backend/database-and-seeding.md)
