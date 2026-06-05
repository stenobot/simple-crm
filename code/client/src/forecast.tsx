import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    queryKeys,
    fetchOpportunities,
    fetchCustomFields,
} from "./api";
import { formatCurrency } from "./format";
import { buildForecast } from "./forecast-buckets";

const ALL = "__all__";

export const Forecast: React.FC = () => {
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

    const buckets = useMemo(
        () =>
            buildForecast(opportunities, {
                customFieldName: selectedField === ALL ? null : selectedField,
            }),
        [opportunities, selectedField],
    );

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
        </div>
    );
};
