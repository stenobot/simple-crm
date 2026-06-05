import { describe, it, expect } from "vitest";
import { normalizeMoneyInput, formatMoneyForInput } from "./format";

describe("normalizeMoneyInput", () => {
    it("strips non-digit characters", () => {
        expect(normalizeMoneyInput("$1,234")).toBe("1234");
    });
    it("preserves a single trailing decimal", () => {
        expect(normalizeMoneyInput("1234.")).toBe("1234.");
    });
    it("preserves up to two decimal places", () => {
        expect(normalizeMoneyInput("1234.56")).toBe("1234.56");
    });
    it("caps decimal precision at 2", () => {
        expect(normalizeMoneyInput("1234.5678")).toBe("1234.56");
    });
    it("merges multiple decimal points by collapsing extras into the decimal portion", () => {
        expect(normalizeMoneyInput("12.34.56")).toBe("12.34");
    });
});

describe("formatMoneyForInput", () => {
    it("formats whole numbers with $ and commas", () => {
        expect(formatMoneyForInput("1234")).toBe("$1,234");
    });
    it("preserves trailing decimal point so users can finish typing", () => {
        expect(formatMoneyForInput("1234.")).toBe("$1,234.");
    });
    it("preserves a partial decimal digit", () => {
        expect(formatMoneyForInput("1234.5")).toBe("$1,234.5");
    });
    it("treats empty integer part as zero", () => {
        expect(formatMoneyForInput(".5")).toBe("$0.5");
    });
});
