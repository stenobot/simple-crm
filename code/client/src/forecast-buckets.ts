import { Opportunity } from "./types";

export interface ForecastBucket {
    key: string;
    label: string;
    count: number;
    expectedValue: number;
}

export interface BuildForecastOptions {
    now?: Date;
    customFieldName?: string | null;
}

// Parse "YYYY-MM-DD" as a local calendar date (NOT UTC), so a closeDate
// of "2026-08-15" lands in August in every timezone.
const parseLocalDate = (iso: string): Date | null => {
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
    if (!m) return null;
    return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
};

const monthLabel = (date: Date): string =>
    date.toLocaleString("en-US", { month: "short", year: "numeric" });

const monthKey = (year: number, month: number): string =>
    `${year}-${String(month + 1).padStart(2, "0")}`;

export const hasNonEmptyCustomField = (
    opp: Opportunity,
    fieldName: string | null | undefined,
): boolean => {
    if (!fieldName) return true;
    const raw = opp.customFields?.[fieldName];
    if (raw === undefined || raw === null) return false;
    return String(raw).trim() !== "";
};

export const buildForecast = (
    opportunities: Opportunity[],
    opts: BuildForecastOptions = {},
): ForecastBucket[] => {
    const now = opts.now ?? new Date();
    const anchorYear = now.getFullYear();
    const anchorMonth = now.getMonth();

    // 6 month buckets: current + next 5
    const monthBuckets: ForecastBucket[] = [];
    for (let i = 0; i < 6; i++) {
        const d = new Date(anchorYear, anchorMonth + i, 1);
        monthBuckets.push({
            key: monthKey(d.getFullYear(), d.getMonth()),
            label: monthLabel(d),
            count: 0,
            expectedValue: 0,
        });
    }
    const firstMonthKey = monthBuckets[0].key;
    const lastMonthKey = monthBuckets[monthBuckets.length - 1].key;
    const monthByKey = new Map(monthBuckets.map(b => [b.key, b]));

    const past: ForecastBucket = {
        key: "past",
        label: "Past",
        count: 0,
        expectedValue: 0,
    };
    const future: ForecastBucket = {
        key: "future",
        label: "Future",
        count: 0,
        expectedValue: 0,
    };

    for (const opp of opportunities) {
        if (!opp.closeDate) continue;
        if (!hasNonEmptyCustomField(opp, opts.customFieldName ?? null)) continue;
        const d = parseLocalDate(opp.closeDate);
        if (!d) continue;
        const k = monthKey(d.getFullYear(), d.getMonth());
        const expected = opp.expectedValue ?? 0;
        let target: ForecastBucket;
        if (k < firstMonthKey) target = past;
        else if (k > lastMonthKey) target = future;
        else target = monthByKey.get(k)!;
        target.count += 1;
        target.expectedValue += expected;
    }

    return [past, ...monthBuckets, future];
};
