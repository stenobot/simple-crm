interface OrderedOpportunity {
    id: number;
    closeDate?: string | null;
    sortOrder?: number | null;
}

export function compareOpportunities(a: OrderedOpportunity, b: OrderedOpportunity): number {
    const aHasSortOrder = a.sortOrder != null;
    const bHasSortOrder = b.sortOrder != null;

    if (aHasSortOrder && bHasSortOrder) {
        return a.sortOrder - b.sortOrder;
    }

    if (aHasSortOrder) {
        return -1;
    }

    if (bHasSortOrder) {
        return 1;
    }

    const aHasCloseDate = a.closeDate != null;
    const bHasCloseDate = b.closeDate != null;

    if (aHasCloseDate && bHasCloseDate && a.closeDate !== b.closeDate) {
        return a.closeDate < b.closeDate ? -1 : 1;
    }

    if (aHasCloseDate && !bHasCloseDate) {
        return -1;
    }

    if (!aHasCloseDate && bHasCloseDate) {
        return 1;
    }

    return a.id - b.id;
}
