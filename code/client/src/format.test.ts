import { describe, it, expect } from "vitest";
import {
    formatCurrency,
    formatPercent,
    normalizeMoneyInput,
    formatMoneyForInput,
} from "./format";

describe("formatCurrency", () => {
    it("formats zero", () => {
        expect(formatCurrency(0)).toBe("$0.00");
    });
    it("formats a round value", () => {
        expect(formatCurrency(1000)).toBe("$1,000.00");
    });
    it("formats decimals", () => {
        expect(formatCurrency(1234.5)).toBe("$1,234.50");
    });
    it("formats negative", () => {
        expect(formatCurrency(-99)).toBe("-$99.00");
    });
    it("formats large numbers with commas", () => {
        expect(formatCurrency(1234567.89)).toBe("$1,234,567.89");
    });
});

describe("formatPercent", () => {
    it("formats zero", () => {
        expect(formatPercent(0)).toBe("0%");
    });
    it("formats one half", () => {
        expect(formatPercent(0.5)).toBe("50%");
    });
    it("formats one", () => {
        expect(formatPercent(1)).toBe("100%");
    });
    it("rounds fractional percents", () => {
        expect(formatPercent(0.123)).toBe("12%");
    });
});

describe("normalizeMoneyInput", () => {
    it("returns empty for empty input", () => {
        expect(normalizeMoneyInput("")).toBe("");
    });
    it("strips non-digit characters", () => {
        expect(normalizeMoneyInput("$1,234")).toBe("1234");
    });
    it("strips letters", () => {
        expect(normalizeMoneyInput("1a2b3")).toBe("123");
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
    it("merges multiple decimal points into one", () => {
        expect(normalizeMoneyInput("12.34.56")).toBe("12.3456".slice(0, 5));
    });
});

describe("formatMoneyForInput", () => {
    it("returns empty for empty input", () => {
        expect(formatMoneyForInput("")).toBe("");
    });
    it("formats whole numbers with $ and commas", () => {
        expect(formatMoneyForInput("1234")).toBe("$1,234");
    });
    it("formats large numbers with commas", () => {
        expect(formatMoneyForInput("1234567")).toBe("$1,234,567");
    });
    it("preserves trailing decimal point", () => {
        expect(formatMoneyForInput("1234.")).toBe("$1,234.");
    });
    it("preserves one decimal digit", () => {
        expect(formatMoneyForInput("1234.5")).toBe("$1,234.5");
    });
    it("preserves two decimal digits", () => {
        expect(formatMoneyForInput("1234.56")).toBe("$1,234.56");
    });
    it("treats empty integer part as zero", () => {
        expect(formatMoneyForInput(".5")).toBe("$0.5");
    });
});
