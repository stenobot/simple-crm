import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    queryKeys,
    fetchOpportunities,
    fetchCustomFields,
    deleteOpportunity,
} from "./api";
import { formatCurrency } from "./format";
import { buildForecast, hasNonEmptyCustomField } from "./forecast-buckets";
import { Drawer } from "./drawer";
import { OpportunityForm } from "./opportunity-form";
import { Opportunity } from "./types";
import { IconButton, PencilIcon, TrashIcon } from "./icons";

const ALL = "__all__";

export const Forecast: React.FC = () => {
    const queryClient = useQueryClient();
    const { data: opportunities = [] } = useQuery({
        queryKey: queryKeys.opportunities,
        queryFn: fetchOpportunities,
    });
    const { data: allFields = [] } = useQuery({
        queryKey: queryKeys.customFields,
        queryFn: fetchCustomFields,
    });
    const oppFields = allFields.filter(f => f.entity === "opportunity");

    const [selectedField, setSelectedField] = useState<string>(ALL);
    const [showAll, setShowAll] = useState(false);
    const [drawerOpp, setDrawerOpp] = useState<Opportunity | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

    const filterName = selectedField === ALL ? null : selectedField;

    const buckets = useMemo(
        () => buildForecast(opportunities, { customFieldName: filterName }),
        [opportunities, filterName],
    );

    const filteredOpps = useMemo(
        () => opportunities.filter(o => hasNonEmptyCustomField(o, filterName)),
        [opportunities, filterName],
    );

    const deleteMutation = useMutation({
        mutationFn: (id: number) => deleteOpportunity(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.opportunities });
            queryClient.invalidateQueries({ queryKey: queryKeys.pipeline });
        },
    });

    const openEdit = (opp: Opportunity) => {
        setDrawerOpp(opp);
        setDrawerOpen(true);
    };
    const close = () => setDrawerOpen(false);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Monthly Forecast</h2>
                <label className="flex items-center gap-2 text-sm">
                    <span>Filter by Custom Field:</span>
                    <select
                        value={selectedField}
                        onChange={e => setSelectedField(e.target.value)}
                        className="border rounded px-2 py-1">
                        <option value={ALL}>All</option>
                        {oppFields.map(f => (
                            <option key={f.id} value={f.name}>
                                {f.label}
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {buckets.map(b => {
                    const isEdge = b.key === "past" || b.key === "future";
                    return (
                        <div
                            key={b.key}
                            className={`p-4 rounded border ${
                                isEdge
                                    ? "bg-gray-50 border-gray-300"
                                    : "bg-blue-50 border-blue-200"
                            }`}>
                            <p className="text-sm text-gray-600">{b.label}</p>
                            <p className="text-2xl font-bold">
                                {formatCurrency(b.expectedValue)}
                            </p>
                            <p className="text-sm text-gray-500">
                                {b.count} {b.count === 1 ? "opp" : "opps"}
                            </p>
                        </div>
                    );
                })}
            </div>

            <div className="border-t pt-4">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={showAll}
                        onChange={e => setShowAll(e.target.checked)}
                    />
                    <span className="font-medium">
                        Show All Opportunities (including ones without a Close Date)
                    </span>
                </label>
                {showAll && (
                    <table className="table-auto w-full mt-4 border-collapse border border-gray-300">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border p-2 text-left">Name</th>
                                <th className="border p-2 text-left">Lead</th>
                                <th className="border p-2 text-left">Stage</th>
                                <th className="border p-2 text-right">Value</th>
                                <th className="border p-2 text-right">Expected</th>
                                <th className="border p-2 text-left">Close Date</th>
                                <th className="border p-2"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOpps.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="border p-2 text-center text-gray-500">
                                        No opportunities match this filter
                                    </td>
                                </tr>
                            ) : (
                                filteredOpps.map(opp => (
                                    <tr key={opp.id}>
                                        <td className="border p-2">
                                            {opp.name || "Unnamed"}
                                        </td>
                                        <td className="border p-2">
                                            {opp.lead.firstName} {opp.lead.lastName}
                                        </td>
                                        <td className="border p-2">
                                            {opp.stage.name}
                                        </td>
                                        <td className="border p-2 text-right font-mono">
                                            {formatCurrency(opp.value)}
                                        </td>
                                        <td className="border p-2 text-right font-mono">
                                            {formatCurrency(opp.expectedValue ?? 0)}
                                        </td>
                                        <td className="border p-2">
                                            {opp.closeDate || (
                                                <span className="text-gray-400">
                                                    —
                                                </span>
                                            )}
                                        </td>
                                        <td className="border p-2">
                                            <div className="flex gap-1 justify-end">
                                                <IconButton
                                                    onClick={() => openEdit(opp)}
                                                    label="Edit opportunity">
                                                    <PencilIcon />
                                                </IconButton>
                                                <IconButton
                                                    onClick={() =>
                                                        deleteMutation.mutate(
                                                            opp.id,
                                                        )
                                                    }
                                                    label="Delete opportunity"
                                                    variant="danger">
                                                    <TrashIcon />
                                                </IconButton>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            <Drawer
                open={drawerOpen}
                onClose={close}
                title="Edit Opportunity">
                {drawerOpp && (
                    <OpportunityForm
                        key={drawerOpp.id}
                        opportunity={drawerOpp}
                        leadId={drawerOpp.lead.id}
                        onSuccess={close}
                    />
                )}
            </Drawer>
        </div>
    );
};
