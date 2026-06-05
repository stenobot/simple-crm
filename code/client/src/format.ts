export const formatCurrency = (value: number): string =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
        value,
    );

export const formatPercent = (value: number): string =>
    `${(value * 100).toFixed(0)}%`;

// Keep only digits and at most one decimal point (with up to 2 decimals).
export const normalizeMoneyInput = (raw: string): string => {
    const stripped = raw.replace(/[^0-9.]/g, "");
    const parts = stripped.split(".");
    if (parts.length === 1) return parts[0];
    return parts[0] + "." + parts.slice(1).join("").slice(0, 2);
};

// Display a raw numeric string as "$1,234" or "$1,234.5" preserving the
// user's partial input (so they can type "1234." and see "$1,234.").
export const formatMoneyForInput = (raw: string): string => {
    if (!raw) return "";
    const [intPart, decPart] = raw.split(".");
    const intFormatted = (intPart === "" ? 0 : parseInt(intPart, 10)).toLocaleString(
        "en-US",
    );
    return decPart === undefined ? `$${intFormatted}` : `$${intFormatted}.${decPart}`;
};
