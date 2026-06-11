# Custom Fields

Custom fields are user-defined fields that the client renders without changing the
Lead or Opportunity forms for each new field.

The definitions come from rows in the server `CustomField` table. Each definition has
an `entity` discriminator (`"lead"` or `"opportunity"`) and a `type` such as `"text"` or
`"number"`. The values themselves are stored on each Lead or Opportunity in its
`customFields` JSON bag. See [Backend data model](../backend/data-model.md#custom-fields)
for the storage details.

## Defining fields

`code/client/src/manage-fields.tsx` provides the client UI for custom field
definitions.

The page fetches all definitions with `fetchCustomFields()` and displays each field's:

- `label` — the human-readable label shown in forms
- `name` — the machine name used as the key in the `customFields` bag
- `entity` — which form should render it (`"lead"` or `"opportunity"`)
- `type` — currently `"text"` or `"number"`

The add form collects the same values. It requires both `name` and `label`, defaults to
`entity: "lead"` and `type: "text"`, and calls `createCustomField()`. On success it
clears the form and invalidates the custom-fields query so forms and lists refetch the
latest definitions.

Deleting a definition calls `deleteCustomField(id)` and invalidates the same query.
Deleting the definition does not edit existing Lead or Opportunity JSON bags; it only
removes the definition that causes the client to render the field.

Field names are unique on the server. If a duplicate name is submitted, the server
returns `400` with `Field name already exists`, and the client shows a generic alert:
`Failed to add field. Field name might already exist.`

## Rendering and editing values

The client treats field definitions as rendering metadata. Form state keeps a
`Record<string, string>` keyed by `CustomField.name`, and save requests include that
record as the entity's `customFields` bag.

### Lead form

`code/client/src/lead-form.tsx` fetches all custom field definitions and filters them
to lead-scoped fields:

```ts
const leadFields = allFields.filter(f => (f.entity ?? "lead") === "lead");
```

The fallback keeps older definitions with no `entity` value behaving like lead fields.
For each lead field, the form renders a text input:

- `placeholder` comes from `field.label`
- `value` comes from `customFieldValues[field.name] || ""`
- `onChange` writes the input value back under `[field.name]`

On submit, `createLead()` or `updateLead()` receives the standard lead fields plus
`customFields: customFieldValues`.

### Opportunity form

`code/client/src/opportunity-form.tsx` follows the same pattern for opportunity fields:

```ts
const oppFields = allFields.filter(f => f.entity === "opportunity");
```

When editing an existing opportunity, the component copies `opportunity.customFields`
into string-based form state. For each opportunity field, it renders an input bound to
`customFieldValues[field.name] || ""`.

Unlike the lead form, the opportunity form uses the field `type` to choose the HTML input
type:

```ts
type={field.type === "number" ? "number" : "text"}
```

The saved request includes `customFields: customFieldValues` along with the opportunity's
lead, stage, value, name, and close date.

## Filtering by custom field

The Forecast page can filter opportunities by the presence of an opportunity-scoped
custom field.

`code/client/src/forecast.tsx` fetches custom field definitions, filters them to
`entity === "opportunity"`, and uses those definitions to populate the
**Filter by Custom Field** select. The selected value is a field `name`; `All` maps to
no custom-field filter.

Filtering is implemented in `code/client/src/forecast-buckets.ts` by
`hasNonEmptyCustomField(opp, fieldName)`. If no field is selected, every opportunity is
included. If a field is selected, an opportunity is included only when:

- `opp.customFields?.[fieldName]` is not `undefined`
- the value is not `null`
- `String(value).trim() !== ""`

`buildForecast()` applies this check before assigning opportunities with close dates to
monthly buckets. The Forecast table uses the same helper for its filtered opportunity
list. See [Forecast and formatting](./forecast-and-formatting.md) for the rest of the
Forecast page behavior.

## See also

- [Frontend overview](./README.md)
- [Components](./components.md)
- [Pages and routing](./pages-and-routing.md)
- [Forecast and formatting](./forecast-and-formatting.md)
- [Backend data model](../backend/data-model.md)
