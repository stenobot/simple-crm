import { describe, it, expect } from "vitest";
import { compareOpportunities } from "./opportunity-order";

describe("compareOpportunities", () => {
    it("sorts by sortOrder ascending when both opportunities have sortOrder", () => {
        expect(
            compareOpportunities(
                { id: 1, closeDate: "2026-01-01", sortOrder: 2 },
                { id: 2, closeDate: "2026-01-02", sortOrder: 5 },
            ),
        ).toBeLessThan(0);
    });

    it("sorts the first opportunity first when only it has sortOrder", () => {
        expect(
            compareOpportunities(
                { id: 1, closeDate: null, sortOrder: 0 },
                { id: 2, closeDate: "2026-01-01", sortOrder: null },
            ),
        ).toBeLessThan(0);
    });

    it("sorts the second opportunity first when only it has sortOrder", () => {
        expect(
            compareOpportunities(
                { id: 1, closeDate: "2026-01-01", sortOrder: undefined },
                { id: 2, closeDate: null, sortOrder: 0 },
            ),
        ).toBeGreaterThan(0);
    });

    it("sorts by closeDate ascending when neither opportunity has sortOrder", () => {
        expect(
            compareOpportunities(
                { id: 1, closeDate: "2026-02-01", sortOrder: null },
                { id: 2, closeDate: "2026-01-01", sortOrder: undefined },
            ),
        ).toBeGreaterThan(0);
    });

    it("sorts null closeDate last when the other opportunity has closeDate", () => {
        expect(
            compareOpportunities(
                { id: 1, closeDate: null, sortOrder: null },
                { id: 2, closeDate: "2026-01-01", sortOrder: null },
            ),
        ).toBeGreaterThan(0);
    });

    it("sorts by id ascending when both opportunities have null closeDate", () => {
        expect(
            compareOpportunities(
                { id: 2, closeDate: null, sortOrder: null },
                { id: 1, closeDate: null, sortOrder: null },
            ),
        ).toBeGreaterThan(0);
    });

    it("sorts an array into the expected overall order", () => {
        const opportunities = [
            { id: 4, closeDate: null, sortOrder: null },
            { id: 2, closeDate: "2026-01-15", sortOrder: 1 },
            { id: 5, closeDate: "2026-01-01", sortOrder: null },
            { id: 1, closeDate: "2026-01-01", sortOrder: 0 },
            { id: 3, closeDate: null, sortOrder: null },
        ];

        expect(opportunities.sort(compareOpportunities).map(opp => opp.id)).toEqual([
            1,
            2,
            5,
            3,
            4,
        ]);
    });
});
