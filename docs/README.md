# SimpleCRM Documentation

Welcome to the SimpleCRM docs. This folder explains how the app is built and how its
pieces fit together.

## Backend

The server-side API — Express + TypeORM + SQLite.

- [Backend overview](./backend/README.md) — the big picture, a primer on the tech, how
  a request flows through the system, and startup.
- [Data model](./backend/data-model.md) — the entities, their fields, and how they relate.
- [API reference](./backend/api-reference.md) — every endpoint, grouped by feature.
- [Business logic](./backend/business-logic.md) — expected value, likelihoods, settings,
  and the pipeline report.
- [Database & seeding](./backend/database-and-seeding.md) — how the SQLite database is
  managed and seeded.

## Frontend

The React client — React 19 + Vite 6 + Tailwind v4, using React Router and TanStack
Query.

- [Frontend overview](./frontend/README.md) — the stack, how the app boots, the nav
  shell, dev proxy, and request flow at a glance.
- [Pages & routing](./frontend/pages-and-routing.md) — the routes and what each top-level
  page does.
- [Components](./frontend/components.md) — inventory of pages, feature components, and
  shared UI primitives.
- [Data layer](./frontend/data-layer.md) — the axios API module, TanStack Query patterns,
  cache invalidation, and a request sequence diagram.
- [Forecast & formatting](./frontend/forecast-and-formatting.md) — the tested
  forecast-bucketing and formatting helpers.
- [Custom fields](./frontend/custom-fields.md) — how custom fields are defined and edited
  on the client.

## See also

- [Root README](../README.md) — install and run instructions.
