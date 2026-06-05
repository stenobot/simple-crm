import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    queryKeys,
    fetchCustomFields,
    fetchStages,
    fetchSettings,
    createOpportunity,
    updateOpportunity,
    OpportunityInput,
} from "./api";
import { Opportunity } from "./types";
import { normalizeMoneyInput, formatMoneyForInput } from "./format";

const formatMinHint = (n: number): string => `$${n.toLocaleString("en-US")}`;

export const OpportunityForm: React.FC<{
    opportunity?: Opportunity;
    leadId: number;
    onSuccess?: () => void;
}> = ({ opportunity, leadId, onSuccess }) => {
    const isEdit = !!opportunity;
    const queryClient = useQueryClient();

    const { data: allFields = [] } = useQuery({
        queryKey: queryKeys.customFields,
        queryFn: fetchCustomFields,
    });
    const { data: stages = [] } = useQuery({
        queryKey: queryKeys.stages,
        queryFn: fetchStages,
    });
    const { data: settings = [] } = useQuery({
        queryKey: queryKeys.settings,
        queryFn: fetchSettings,
    });
    const oppFields = allFields.filter(f => f.entity === "opportunity");
    const minValue = parseFloat(
        settings.find(s => s.key === "minimumOpportunityValue")?.value ?? "1000",
    );

    const [name, setName] = useState(opportunity?.name ?? "");
    const [stageId, setStageId] = useState<number | "">(
        opportunity?.stage?.id ?? "",
    );
    const [value, setValue] = useState(
        opportunity ? String(opportunity.value) : "",
    );
    const [closeDate, setCloseDate] = useState(opportunity?.closeDate ?? "");
    const [customFieldValues, setCustomFieldValues] = useState<
        Record<string, string>
    >(() => {
        const initial: Record<string, string> = {};
        if (opportunity?.customFields) {
            for (const [k, v] of Object.entries(opportunity.customFields)) {
                initial[k] = v == null ? "" : String(v);
            }
        }
        return initial;
    });
    const [error, setError] = useState("");

    const mutation = useMutation({
        mutationFn: (input: OpportunityInput) =>
            isEdit
                ? updateOpportunity(opportunity!.id, input)
                : createOpportunity(input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.opportunities });
            queryClient.invalidateQueries({ queryKey: queryKeys.pipeline });
            onSuccess?.();
        },
        onError: (err: unknown) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const data = (err as any).response?.data;
            setError(
                typeof data === "string"
                    ? data
                    : (data?.error ?? "Something went wrong"),
            );
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (stageId === "") {
            setError("Stage is required");
            return;
        }
        const parsedValue = parseFloat(value);
        if (!Number.isFinite(parsedValue)) {
            setError("Value must be a number");
            return;
        }
        mutation.mutate({
            leadId,
            stageId: Number(stageId),
            value: parsedValue,
            name,
            closeDate: closeDate || null,
            customFields: customFieldValues,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-red-500">{error}</p>}
            <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={e => setName(e.target.value)}
                className="block w-full p-2 border border-gray-300 rounded"
            />
            <select
                value={stageId}
                onChange={e =>
                    setStageId(e.target.value === "" ? "" : Number(e.target.value))
                }
                className="block w-full p-2 border border-gray-300 rounded">
                <option value="">Select stage…</option>
                {stages.map(s => (
                    <option key={s.id} value={s.id}>
                        {s.name} ({s.status})
                    </option>
                ))}
            </select>
            <input
                type="text"
                inputMode="decimal"
                placeholder={`Value (min ${formatMinHint(minValue)})`}
                value={formatMoneyForInput(value)}
                onChange={e => setValue(normalizeMoneyInput(e.target.value))}
                className="block w-full p-2 border border-gray-300 rounded"
            />
            <label className="block">
                <span className="text-sm text-gray-600">Close Date</span>
                <input
                    type="date"
                    value={closeDate ?? ""}
                    onChange={e => setCloseDate(e.target.value)}
                    className="block w-full p-2 border border-gray-300 rounded"
                />
            </label>
            {oppFields.map(field => (
                <input
                    key={field.id}
                    type={field.type === "number" ? "number" : "text"}
                    placeholder={field.label}
                    value={customFieldValues[field.name] || ""}
                    onChange={e =>
                        setCustomFieldValues({
                            ...customFieldValues,
                            [field.name]: e.target.value,
                        })
                    }
                    className="block w-full p-2 border border-gray-300 rounded"
                />
            ))}
            <button
                type="submit"
                disabled={mutation.isPending}
                className="block w-full p-2 bg-blue-500 text-white rounded disabled:bg-gray-300">
                {isEdit ? "Update Opportunity" : "Add Opportunity"}
            </button>
        </form>
    );
};
