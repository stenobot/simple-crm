# Business Logic

Most of the backend is straightforward read/write CRUD. The one piece of genuine business
logic is how an opportunity's **expected value** is calculated and rolled up into the
**pipeline** report.

## Expected value

Every opportunity has two money figures:

- **`value`** — the raw size of the deal.
- **`expectedValue`** — the value weighted by how likely the deal is to close.

The formula is:

```
expectedValue = value × likelihood
```

This lives in `code/server/src/services/opportunity-value.ts` and is recomputed every time
an opportunity is created or updated.

## Where the likelihood comes from

The likelihood is chosen based on the opportunity's current **stage status**
(`likelihoodFor` in the same service):

| Stage `status` | Likelihood used |
| --- | --- |
| `won` | the `wonStageLikelihood` setting (default `1.0` — 100%) |
| `lost` | the `lostStageLikelihood` setting (default `0.0`) |
| `pending` | that stage's own `conversionLikelihood` |

So a $25,000 opportunity in a `pending` stage with a `conversionLikelihood` of `0.7` has
an expected value of `25000 × 0.7 = 17,500`. The same opportunity moved into a `won` stage
would be `25000 × 1.0 = 25,000`.

## Settings

Global tuning values live in the `AppSetting` table (key/value rows) and are read through
`code/server/src/services/settings.ts`, which falls back to defaults when a key is missing
or unparseable.

| Setting key | Meaning | Default |
| --- | --- | --- |
| `wonStageLikelihood` | Likelihood applied to opportunities in `won` stages | `1.0` |
| `lostStageLikelihood` | Likelihood applied to opportunities in `lost` stages | `0.0` |
| `minimumOpportunityValue` | Opportunities below this `value` are rejected with a 400 | `0` |
| `defaultStageConversionLikelihood` | Default conversion likelihood suggested for new stages | `0.5` |

Settings are read via `GET /settings` and changed via `PUT /settings/:key` (see the
[API reference](./api-reference.md#settings)).

> The seeded defaults set `minimumOpportunityValue` to `1000`, so out of the box new
> opportunities must be worth at least 1000. See [Database & seeding](./database-and-seeding.md).

## The pipeline report

`GET /pipeline` (`routes/pipeline.ts`) produces the rolled-up view used by the UI. It:

1. Loads all stages ordered by `order`, and all opportunities.
2. For each stage, gathers the opportunities currently in it and sums two things:
   - `totalValue` — the sum of raw `value`.
   - `expectedValue` — the sum of each opportunity's stored `expectedValue`.
3. Accumulates those per-stage sums into overall `totalValue` and `expectedValue` totals.

The result is `{ totalValue, expectedValue, byStage }`, where `byStage` has one entry per
stage with its `count`, `totalValue`, and `expectedValue`. The report is computed fresh on
each request directly from the current opportunities, so it always reflects the latest
data.
