# API Reference

Every endpoint returns JSON. Routes are defined in `code/server/src/routes/`, one router
per feature, and all are mounted at the root of the server (no `/api` prefix — the Vite
dev proxy strips that; see the [overview](./README.md#how-a-request-flows)).

Base URL in development: `http://localhost:3000` (the client reaches it via `/api/*`).

## Leads

Router: `routes/leads.ts`.

| Method | Path | Description |
| --- | --- | --- |
| GET | `/leads` | List all leads |
| POST | `/leads` | Create a lead |
| PUT | `/leads/:id` | Update a lead |

**Request body (POST / PUT):**

```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "age": 42,
  "phoneNumber": "555-0100",
  "customFields": { "industry": "Healthcare" }
}
```

`customFields` is optional and defaults to `{}`. Responds with the saved lead.

## Opportunities

Router: `routes/opportunities.ts`.

| Method | Path | Description |
| --- | --- | --- |
| GET | `/opportunities` | List all opportunities (each includes its lead and stage) |
| POST | `/opportunities` | Create an opportunity |
| PUT | `/opportunities/:id` | Update an opportunity |
| DELETE | `/opportunities/:id` | Delete an opportunity |

**Request body (POST):**

```json
{
  "leadId": 1,
  "stageId": 3,
  "value": 25000,
  "name": "Enterprise Deal",
  "closeDate": "2026-09-01",
  "customFields": { "region": "EMEA" }
}
```

- `closeDate` and `customFields` are optional.
- The server computes `expectedValue` automatically from `value` and the stage's
  likelihood (see [Business logic](./business-logic.md)).
- If `value` is below the configured `minimumOpportunityValue`, the request is rejected
  with **400** and `{ "error": "Value must be at least <n>" }`.

**Request body (PUT):** all fields are optional; only the ones provided are updated
(`stageId`, `value`, `name`, `closeDate`, `customFields`). `expectedValue` is recomputed
on every update. The same minimum-value check applies when `value` is provided.

**DELETE** responds with `{ "success": true }`.

## Stages

Router: `routes/stages.ts`.

| Method | Path | Description |
| --- | --- | --- |
| GET | `/stages` | List all stages, ordered by `order` ascending |
| POST | `/stages` | Create a stage |
| PUT | `/stages/:id` | Update a stage |
| DELETE | `/stages/:id` | Delete a stage |

**Request body (POST):**

```json
{
  "name": "Negotiation",
  "status": "pending",
  "conversionLikelihood": 0.7
}
```

On create, the server assigns `order` automatically as the current maximum `order` plus
one. On **PUT**, `name`, `status`, and `conversionLikelihood` are updated, and `order` is
updated only if provided. **DELETE** responds with `{ "success": true }`.

## Custom fields

Router: `routes/custom-fields.ts`.

| Method | Path | Description |
| --- | --- | --- |
| GET | `/custom-fields` | List all custom-field definitions |
| POST | `/custom-fields` | Create a custom-field definition |
| DELETE | `/custom-fields/:id` | Delete a custom-field definition |

**Request body (POST):**

```json
{
  "name": "region",
  "label": "Region",
  "entity": "opportunity",
  "type": "text"
}
```

`entity` defaults to `"lead"` and `type` defaults to `"text"`. `name` must be unique;
a duplicate name is rejected with **400** and `{ "error": "Field name already exists" }`.
**DELETE** responds with `{ "success": true }`.

## Settings

Router: `routes/settings.ts`.

| Method | Path | Description |
| --- | --- | --- |
| GET | `/settings` | List all settings as `{ key, value }` rows |
| PUT | `/settings/:key` | Create or update one setting (upsert) |

**Request body (PUT):**

```json
{ "value": "1000" }
```

If the key doesn't exist yet it's created; otherwise its value is overwritten. See
[Business logic](./business-logic.md) for the recognized keys and their meanings.

## Pipeline

Router: `routes/pipeline.ts`.

| Method | Path | Description |
| --- | --- | --- |
| GET | `/pipeline` | Pipeline report: opportunities rolled up by stage |

**Response shape:**

```json
{
  "totalValue": 125000,
  "expectedValue": 64250,
  "byStage": [
    {
      "stage": { "id": 1, "name": "Cold Lead", "status": "pending", "...": "..." },
      "count": 4,
      "totalValue": 30000,
      "expectedValue": 1500
    }
  ]
}
```

`byStage` is ordered by the stage `order`. For each stage it reports the opportunity
`count`, the summed raw `totalValue`, and the summed `expectedValue`; the top-level
`totalValue` and `expectedValue` are the overall totals. See
[Business logic](./business-logic.md) for how these numbers are derived.
