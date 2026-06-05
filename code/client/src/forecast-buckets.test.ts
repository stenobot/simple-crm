import { describe, it, expect } from "vitest";
import { buildForecast, hasNonEmptyCustomField } from "./forecast-buckets";
import type { Opportunity } from "./types";

const makeOpp = (overrides: Partial<Opportunity> = {}): Opportunity =>
    ({
        id: 1,
        name: "Test",
        value: 1000,
        expectedValue: 500,
        closeDate: null,
        customFields: {},
        lead: { id: 1, firstName: "A", lastName: "B", age: 30, phoneNumber: "x" },
        stage: { id: 1, name: "Stage", status: "pending", conversionLikelihood: 0.5 },
        ...overrides,
    }) as unknown as Opportunity;

describe("hasNonEmptyCustomField", () => {
    it("returns true when no field name is given", () => {
        expect(hasNonEmptyCustomField(makeOpp(), null)).toBe(true);
        expect(hasNonEmptyCustomField(makeOpp(), undefined)).toBe(true);
        expect(hasNonEmptyCustomField(makeOpp(), "")).toBe(true);
    });
    it("returns false when the field is missing", () => {
        expect(hasNonEmptyCustomField(makeOpp({ customFields: {} }), "region")).toBe(
            false,
        );
    });
    it("returns false when the field is null or undefined", () => {
        expect(
            hasNonEmptyCustomField(
                makeOpp({ customFields: { region: null } }),
                "region",
            ),
        ).toBe(false);
        expect(
            hasNonEmptyCustomField(
                makeOpp({ customFields: { region: undefined } }),
                "region",
            ),
        ).toBe(false);
    });
    it("returns false when the field is empty or whitespace", () => {
        expect(
            hasNonEmptyCustomField(makeOpp({ customFields: { region: "" } }), "region"),
        ).toBe(false);
        expect(
            hasNonEmptyCustomField(
                makeOpp({ customFields: { region: "   " } }),
                "region",
            ),
        ).toBe(false);
    });
    it("returns true when the field has a value", () => {
        expect(
            hasNonEmptyCustomField(
                makeOpp({ customFields: { region: "West" } }),
                "region",
            ),
        ).toBe(true);
    });
    it("coerces non-string values to string before checking", () => {
        expect(
            hasNonEmptyCustomField(makeOpp({ customFields: { count: 0 } }), "count"),
        ).toBe(true);
    });
});

describe("buildForecast", () => {
    // Fix "now" to mid-month so month math is unambiguous.
    const now = new Date(2026, 5, 15); // June 15, 2026 (month is 0-indexed)

    it("returns 8 buckets in [past, m0..m5, future] order with zero counts", () => {
        const buckets = buildForecast([], { now });
        expect(buckets).toHaveLength(8);
        expect(buckets[0].key).toBe("past");
        expect(buckets[7].key).toBe("future");
        expect(buckets[1].key).toBe("2026-06");
        expect(buckets[6].key).toBe("2026-11");
        expect(buckets.every(b => b.count === 0 && b.expectedValue === 0)).toBe(true);
    });

    it("excludes opportunities without a closeDate", () => {
        const buckets = buildForecast(
            [makeOpp({ closeDate: null, expectedValue: 999 })],
            { now },
        );
        expect(buckets.every(b => b.count === 0)).toBe(true);
    });

    it("places an opp in the current month into the first month bucket", () => {
        const buckets = buildForecast(
            [makeOpp({ closeDate: "2026-06-20", expectedValue: 100 })],
            { now },
        );
        const june = buckets.find(b => b.key === "2026-06")!;
        expect(june.count).toBe(1);
        expect(june.expectedValue).toBe(100);
    });

    it("places an opp in month +5 into the last month bucket", () => {
        const buckets = buildForecast(
            [makeOpp({ closeDate: "2026-11-01", expectedValue: 200 })],
            { now },
        );
        const nov = buckets.find(b => b.key === "2026-11")!;
        expect(nov.count).toBe(1);
        expect(nov.expectedValue).toBe(200);
    });

    it("places opps before the current month into the past bucket", () => {
        const buckets = buildForecast(
            [makeOpp({ closeDate: "2026-05-31", expectedValue: 50 })],
            { now },
        );
        const past = buckets[0];
        expect(past.key).toBe("past");
        expect(past.count).toBe(1);
        expect(past.expectedValue).toBe(50);
    });

    it("places opps after month +5 into the future bucket", () => {
        const buckets = buildForecast(
            [makeOpp({ closeDate: "2026-12-01", expectedValue: 75 })],
            { now },
        );
        const future = buckets[buckets.length - 1];
        expect(future.key).toBe("future");
        expect(future.count).toBe(1);
        expect(future.expectedValue).toBe(75);
    });

    it("filters by customFieldName, excluding opps without the field set", () => {
        const opps = [
            makeOpp({
                id: 1,
                closeDate: "2026-07-15",
                expectedValue: 100,
                customFields: { region: "West" },
            }),
            makeOpp({
                id: 2,
                closeDate: "2026-07-15",
                expectedValue: 200,
                customFields: { region: "" },
            }),
            makeOpp({
                id: 3,
                closeDate: "2026-07-15",
                expectedValue: 300,
                customFields: {},
            }),
        ];
        const buckets = buildForecast(opps, { now, customFieldName: "region" });
        const july = buckets.find(b => b.key === "2026-07")!;
        expect(july.count).toBe(1);
        expect(july.expectedValue).toBe(100);
    });

    it("sums expected values and counts within a bucket", () => {
        const opps = [
            makeOpp({ id: 1, closeDate: "2026-06-10", expectedValue: 100 }),
            makeOpp({ id: 2, closeDate: "2026-06-20", expectedValue: 250 }),
        ];
        const buckets = buildForecast(opps, { now });
        const june = buckets.find(b => b.key === "2026-06")!;
        expect(june.count).toBe(2);
        expect(june.expectedValue).toBe(350);
    });

    it("parses YYYY-MM-DD as local date (no UTC shift)", () => {
        // 2026-06-01 at UTC midnight would shift to May 31 in negative-offset TZs.
        // Our parser must always land in June regardless of TZ.
        const buckets = buildForecast(
            [makeOpp({ closeDate: "2026-06-01", expectedValue: 10 })],
            { now },
        );
        const june = buckets.find(b => b.key === "2026-06")!;
        expect(june.count).toBe(1);
    });

    it("ignores opportunities with malformed closeDate", () => {
        const buckets = buildForecast(
            [makeOpp({ closeDate: "not-a-date" as unknown as string })],
            { now },
        );
        expect(buckets.every(b => b.count === 0)).toBe(true);
    });
});
