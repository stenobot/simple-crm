# Frontend Pages & Routing

The SimpleCRM frontend uses **React Router** for client-side navigation. `App.tsx`
owns the top-level layout: a header, a small nav bar, and the route table that swaps
between the page components.

This page covers page ownership and routing. For lower-level component details, see
[components](./components.md). For query and mutation helpers, see the
[data layer](./data-layer.md). For forecast bucket and formatting logic, see
[forecast & formatting](./forecast-and-formatting.md). For the frontend entry point,
see the [frontend overview](./README.md).

## Routing overview

Routes are defined in `code/client/src/App.tsx` with `Routes`, `Route`, and
`NavLink` from `react-router-dom`. The nav has text links for Home, Pipeline, and
Forecast, plus a gear-icon link for Settings. Active nav items are styled through
`NavLink`'s `isActive` state.

| Path | Component | Source |
| --- | --- | --- |
| `/` | `Leads` | `code/client/src/leads.tsx` |
| `/pipeline` | `Pipeline` | `code/client/src/pipeline.tsx` |
| `/forecast` | `Forecast` | `code/client/src/forecast.tsx` |
| `/settings` | `Settings` | `code/client/src/settings.tsx` |
| `*` | redirect to `/` | `Navigate` in `App.tsx` |

## Leads

Source: `code/client/src/leads.tsx`.

The Leads page is the Home route. It shows a lead table with first name, last name,
age, and phone number, plus an edit action. The "Add Lead" button opens a drawer for
creating a lead, and each row can be expanded to show that lead's opportunities.

Child components rendered by the page:

- `LeadRow` — one per lead. The row owns its expanded/collapsed state and renders
  `LeadOpportunities` when expanded.
- `Drawer` — wraps the add/edit form.
- `LeadForm` — used for both adding and editing a lead. It is keyed by the current
  lead id, or `"new"`, so switching modes remounts the form.

Data access:

- Reads leads with `fetchLeads`.
- Uses query key `queryKeys.leads` (`["leads"]`).

## Pipeline

Source: `code/client/src/pipeline.tsx`.

The Pipeline page shows a high-level pipeline report. At the top, two summary cards
display total pipeline value and expected close value. Below that, a by-stage table
shows stage name/status, opportunity count, raw pipeline dollars, conversion
likelihood, and expected dollars.

Child components rendered by the page:

- None. The page renders the summary cards and table directly.

Data access:

- Reads the pipeline report with `fetchPipeline`.
- Uses query key `queryKeys.pipeline` (`["pipeline"]`).
- Formats values with `formatCurrency` and `formatPercent` from `format.ts`.

## Forecast

Source: `code/client/src/forecast.tsx`.

The Forecast page builds a monthly expected-value forecast from opportunities. It
shows forecast bucket cards, can filter the forecast by an opportunity custom field,
and has a "Show All Opportunities" toggle for a detailed opportunities table. That
table includes edit and delete actions.

Forecast-specific logic lives outside the page:

- `buildForecast` from `forecast-buckets.ts` groups opportunities into forecast
  buckets.
- `hasNonEmptyCustomField` from `forecast-buckets.ts` applies the custom-field
  filter.
- `formatCurrency` from `format.ts` formats bucket and opportunity values.

Child components rendered by the page:

- `Drawer` — wraps the opportunity edit form.
- `OpportunityForm` — edits the selected opportunity from the detailed table.
- `IconButton`, `PencilIcon`, and `TrashIcon` — render row actions in the detailed
  table.

Data access:

- Reads opportunities with `fetchOpportunities` and query key
  `queryKeys.opportunities` (`["opportunities"]`).
- Reads custom-field definitions with `fetchCustomFields` and query key
  `queryKeys.customFields` (`["customFields"]`), then filters those definitions to
  opportunity fields.
- Deletes opportunities with `deleteOpportunity`.
- On successful delete, invalidates `queryKeys.opportunities` and
  `queryKeys.pipeline`.

## Settings

Source: `code/client/src/settings.tsx`.

The Settings page is a composition point for the admin panels. It does not own query
state directly; each panel fetches and mutates the data it manages.

Child components rendered by the page:

- `ManageFields` — lists, creates, and deletes custom-field definitions.
- `ManageStages` — lists, creates, edits, and deletes pipeline stages.
- `ManageSettings` — lists app settings and saves edited setting values.

Data access through child panels:

- `ManageFields` uses `fetchCustomFields`, `createCustomField`, and
  `deleteCustomField` with query key `queryKeys.customFields`
  (`["customFields"]`).
- `ManageStages` uses `fetchStages`, `createStage`, `updateStage`, and
  `deleteStage` with query key `queryKeys.stages` (`["stages"]`), and invalidates
  `queryKeys.pipeline` after stage changes.
- `ManageSettings` uses `fetchSettings` and `updateSetting` with query key
  `queryKeys.settings` (`["settings"]`), and invalidates settings,
  opportunities, stages, and pipeline after a setting is saved.
