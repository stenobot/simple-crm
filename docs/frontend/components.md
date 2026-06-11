# Frontend Components

The client UI lives in `code/client/src/`. Components use kebab-case `.tsx` file names,
with exported React component names in PascalCase. This inventory focuses on the main
pages, feature-specific components, and shared UI primitives; see also
[Pages and routing](./pages-and-routing.md), [Data layer](./data-layer.md),
[Custom fields](./custom-fields.md), and the [frontend README](./README.md).

## Pages

Top-level route components rendered by the app shell.

| Component | File | Role |
| --- | --- | --- |
| `App` | `App.tsx` | Shell with the SimpleCRM header, primary navigation, and route switch for leads, pipeline, forecast, settings, and fallback redirects. |
| `Leads` | `leads.tsx` | Leads page that fetches leads, renders the lead table, and opens the lead create/edit drawer. |
| `Pipeline` | `pipeline.tsx` | Pipeline report page that fetches stage rollups and displays total value, expected value, and per-stage metrics. |
| `Forecast` | `forecast.tsx` | Monthly forecast page that buckets opportunities by close date, filters by opportunity custom field, and supports editing/deleting opportunities. |
| `Settings` | `settings.tsx` | Settings page that composes custom-field, stage, and app-setting management sections. |

## Feature components

Components tied to a specific CRM workflow.

| Component | File | Role |
| --- | --- | --- |
| `LeadRow` | `lead-row.tsx` | Expandable lead table row that reveals the lead's opportunities and exposes lead editing. |
| `LeadOpportunities` | `lead-opportunities.tsx` | Per-lead opportunity list with add/edit/delete actions in a drawer. |
| `LeadForm` | `lead-form.tsx` | Create/edit lead form, including inputs for lead custom fields. |
| `OpportunityForm` | `opportunity-form.tsx` | Create/edit opportunity form with stage selection, opportunity custom fields, close date, and a settings-driven minimum-value hint. |
| `ManageFields` | `manage-fields.tsx` | CRUD UI for custom-field definitions, including target entity and field type. |
| `ManageStages` | `manage-stages.tsx` | CRUD UI for pipeline stages, including status and conversion likelihood. |
| `ManageSettings` | `manage-settings.tsx` | Inline editor for app settings that refreshes dependent opportunity, stage, and pipeline data after saves. |

## Shared UI primitives

Small reusable pieces used across pages and feature components.

| Component | File | Role |
| --- | --- | --- |
| `Drawer` | `drawer.tsx` | Slide-in dialog shell with backdrop click, ESC close, body-scroll locking, and a scrollable content area. |
| `PencilIcon`, `TrashIcon`, `PlusIcon`, `GearIcon`, `IconButton` | `icons.tsx` | SVG icons plus a reusable accessible `IconButton` wrapper with default and danger variants. |
