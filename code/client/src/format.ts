export const formatCurrency = (value: number): string =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
        value,
    );

export const formatPercent = (value: number): string =>
    `${(value * 100).toFixed(0)}%`;
