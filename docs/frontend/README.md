# Frontend Overview

The SimpleCRM frontend is a small **single-page React app**: users navigate between
pages in the browser, and each page reads from or writes to the backend API as JSON.
It's written in **TypeScript**, runs as an **ESM** Vite app, and uses **Tailwind CSS**
for styling.

The client talks to the API with axios under `/api/*`. In development, Vite forwards
those calls to the Express server; see [Dev networking](#dev-networking) below.

For more details see
[pages and routing](./pages-and-routing.md), [components](./components.md),
[data layer](./data-layer.md), [forecast and formatting](./forecast-and-formatting.md),
or [custom fields](./custom-fields.md) docs.

## Technology stack

| Tool | Version | Job |
| --- | --- | --- |
| React | 19 (`react`, `react-dom`) | Component model and UI rendering. |
| Vite | 6 | Development server and production build pipeline. |
| Tailwind CSS | 4 (`tailwindcss`, `@tailwindcss/vite`) | Utility-first styling. |
| React Router | 7 (`react-router-dom`) | Browser routing and navigation links. |
| TanStack Query | 5 (`@tanstack/react-query`) | Server-state caching, loading states, and mutation refetching. |
| axios | 1.7 | HTTP client for `/api/*` requests. |

## How it boots

Startup begins in `code/client/src/main.tsx`:

1. A single `QueryClient` is created with shared query defaults:

   ```ts
   staleTime: 30_000
   refetchOnWindowFocus: false
   ```

2. React mounts into the root DOM node.
3. `<App />` is wrapped in `<BrowserRouter>` for routing and
   `<QueryClientProvider>` for TanStack Query access.

That means every route can use React Router primitives and TanStack Query hooks
without creating its own router or query client.

## App shell and navigation

`code/client/src/App.tsx` is the top-level shell. It renders the SimpleCRM header and
a navigation bar with four destinations:

| Link | Route | Page component |
| --- | --- | --- |
| Home | `/` | `Leads` |
| Pipeline | `/pipeline` | `Pipeline` |
| Forecast | `/forecast` | `Forecast` |
| Settings | `/settings` | `Settings` |

The navigation uses `NavLink`, so each link can style itself differently when its
route is active. Settings is shown as a gear icon, but it still links to the normal
`/settings` route.

Below the header, a `<Routes>` switch chooses the page component. Unknown URLs fall
through to a catch-all route that redirects back to `/`.

## Dev networking

The client calls endpoints such as `/api/leads` and `/api/pipeline`. During local
development, the Vite dev server proxies `/api/*` to `http://localhost:3000` and
**strips the `/api` prefix**:

```ts
rewrite: path => path.replace(/^\/api/, "")
```

So a browser request to `/api/leads` becomes a server request to `/leads`. This
matches the backend overview's [request-flow](../backend/README.md#how-a-request-flows)
description, and is why server routes are registered without an `/api` prefix.

## Request flow at a glance

Most data flow follows the same pattern:

1. A page or component calls a function from `code/client/src/api.ts`.
2. That function uses axios to call a `/api/*` endpoint.
3. Components wrap reads in TanStack Query `useQuery` hooks.
4. Writes use `useMutation`, then invalidate query keys so affected data is refetched.

The detailed data-layer conventions live in [Data layer](./data-layer.md).

## Map of these docs

- [Frontend docs index](./README.md) — this overview.
- [Pages and routing](./pages-and-routing.md) — routes, page components, and navigation.
- [Components](./components.md) — shared UI patterns and component organization.
- [Data layer](./data-layer.md) — API functions, query keys, queries, and mutations.
- [Forecast and formatting](./forecast-and-formatting.md) — forecast UI and display helpers.
- [Custom fields](./custom-fields.md) — how configurable fields appear in the UI.
- [Documentation home](../README.md) — the top-level docs map.
- [Backend overview](../backend/README.md) — API server overview and request flow.
