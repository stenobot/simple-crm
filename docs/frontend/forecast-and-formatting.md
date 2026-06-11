# Forecast & Formatting

The frontend keeps a few tested pure-logic helpers outside React components. The forecast
helpers turn opportunities into the buckets shown on the Forecast page, and the formatting
helpers keep money and percentage display consistent across the UI.

## Forecast bucketing

`code/client/src/forecast-buckets.ts` exports two helpers used by the Forecast page (see
[Pages & routing](./pages-and-routing.md#forecast)).

### `hasNonEmptyCustomField(opp, fieldName)`

This predicate is used when the Forecast page filters opportunities by a selected
[custom field](./custom-fields.md):

- If `fieldName` is `null`, `undefined`, or an empty string, it returns `true`. No selected
  field means no custom-field filter is applied.
- If the field is missing, `null`, or `undefined`, it returns `false`.
- If the field value is an empty string or only whitespace, it returns `false`.
- Otherwise it returns `true`, after coercing non-string values with `String(value)`.

That means a numeric custom field value like `0` counts as present, while `"   "` does not.

### `buildForecast(opportunities, opts)`

`buildForecast` returns exactly eight buckets in a fixed order:

1. `past`
2. the current calendar month
3. the next five calendar months
4. `future`

The month bucket keys use `YYYY-MM`; labels use short US month names such as `Jun 2026`.
The caller can pass `opts.now` to anchor the current month, which is how the unit tests make
month math deterministic. The caller can also pass `opts.customFieldName` to keep only
opportunities where `hasNonEmptyCustomField` is true for that field.

| Bucket | Which opportunity close dates fall in it |
| --- | --- |
| `past` | Any valid `closeDate` before the current month |
| current month bucket (`YYYY-MM`) | Any valid `closeDate` in the same month as `opts.now` or the current date |
| next 1-5 month buckets (`YYYY-MM`) | Any valid `closeDate` in one of the next five months |
| `future` | Any valid `closeDate` after the last generated month bucket |

A few details matter for correctness:

- Dates are parsed from `YYYY-MM-DD` as **local calendar dates**, not UTC dates. This avoids
  timezone drift where `2026-06-01` could otherwise appear as May 31 in negative-offset
  timezones.
- Opportunities with no `closeDate` are skipped.
- Opportunities with malformed `closeDate` values are skipped.
- Each included opportunity increments the target bucket's `count` by 1 and adds its
  `expectedValue` to the bucket's `expectedValue` sum. Missing expected values contribute 0.

## Formatting helpers

`code/client/src/format.ts` centralizes display formatting that is shared across pages and
forms.

| Helper | Behavior | Main uses |
| --- | --- | --- |
| `formatCurrency(value)` | Formats a number as an en-US USD currency string, for example `$1,234.00`. | Pipeline totals and cards, Forecast buckets and opportunity rows, lead opportunity lists |
| `formatPercent(value)` | Formats a fractional number as a whole percent, for example `0.7` becomes `70%`. | Pipeline stage conversion likelihoods |
| `normalizeMoneyInput(raw)` | Removes all characters except digits and decimal points, keeps at most one decimal point, and caps the decimal portion at two digits. | Opportunity value form input normalization |
| `formatMoneyForInput(raw)` | Displays a normalized numeric string with `$` and comma grouping while preserving partial input such as `1234.` or `1234.5`. Empty input stays empty. | Opportunity value form input display |

The money-input pair deliberately separates storage from display: the form stores the
normalized raw value, then formats it for the text box so users can keep typing partial
amounts without losing the trailing decimal point.

## Tests

Both modules are covered by Vitest unit tests:

- `code/client/src/forecast-buckets.test.ts` asserts bucket count and ordering, month
  placement for past/current/month+5/future dates, local-date parsing, skipping missing or
  malformed close dates, custom-field filtering, and summing `count`/`expectedValue`.
- `code/client/src/format.test.ts` asserts money-input edge cases: stripping currency
  symbols and commas, preserving a trailing decimal, preserving up to two decimals, capping
  decimal precision, merging extra decimal points, comma formatting, and treating `.5` as
  `$0.5`.

Run the client tests from the repo root with:

```
npm run test -w @simple-crm/client
```

## See also

- [Frontend README](./README.md)
- [Pages & routing](./pages-and-routing.md)
- [Custom fields](./custom-fields.md)
