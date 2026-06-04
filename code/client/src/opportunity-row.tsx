import { useState, useEffect } from "react";
import { CustomField, Opportunity, Stage } from "./types";
import axios from "axios";

interface OpportunityRowProps {
    opp: Opportunity;
    onUpdate: () => void;
    stages?: Stage[];
    fieldsRefresh?: number;
}

export const OpportunityRow: React.FC<OpportunityRowProps> = ({ opp, onUpdate, stages = [], fieldsRefresh = 0 }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [stageId, setStageId] = useState<string>(`${opp.stage.id}`);
    const [value, setValue] = useState(`${opp.value}`);
    const [closeDate, setCloseDate] = useState(opp.closeDate ? opp.closeDate.split("T")[0] : "");
    const [name, setName] = useState(opp.name);
    const [customFields, setCustomFields] = useState<CustomField[]>([]);
    const [customFieldValues, setCustomFieldValues] = useState<Record<string, string>>(opp.customFields || {});
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isEditing) {
            fetchCustomFields();
        }
    }, [isEditing, fieldsRefresh]);

    const fetchCustomFields = async () => {
        const result = await axios.get("/api/custom-fields");
        setCustomFields(result.data);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            await axios.put(`/api/opportunities/${opp.id}`, {
                name,
                stageId: stageId ? parseInt(stageId) : undefined,
                value: value ? parseFloat(value) : undefined,
                closeDate,
                customFields: customFieldValues,
            });
            setSuccess(true);
            setIsEditing(false);
            onUpdate();
        } catch (error) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setError((error as any).response.data);
        }
        setLoading(false);
    };

    const deleteOpportunity = async () => {
        await axios.delete(`/api/opportunities/${opp.id}`);
        onUpdate();
    };

    const formatCurrency = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

    if (isEditing) {
        return (
            <div>
                <form onSubmit={handleSubmit} className="space-y-4 p-4 rounded bg-gray-100 w-96">
                    <h2 className="text-xl font-fold">Edit Opportunity</h2>
                    {error && <p className="text-red-500">{error}</p>}
                    {success && <p className="text-green-500">Opportunity updated successfully</p>}
                    <input
                        type="text"
                        placeholder="Opportunity Name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="block w-full p-2 border border-gray-300 rounded"
                    />
                    <select
                        value={stageId}
                        onChange={e => setStageId(e.target.value)}
                        className="block w-full p-2 border border-gray-300 rounded"
                    >
                        <option value="">Select a stage...</option>
                        {stages.map(stage => (
                            <option key={stage.id} value={stage.id}>
                                {stage.name}
                            </option>
                        ))}
                    </select>
                    <input
                        type="text"
                        placeholder="Value"
                        value={value}
                        onChange={e => setValue(e.target.value)}
                        className="block w-full p-2 border border-gray-300 rounded"
                    />
                    <input
                        type="date"
                        placeholder="Close Date"
                        value={closeDate}
                        onChange={e => setCloseDate(e.target.value)}
                        className="block w-full p-2 border border-gray-300 rounded"
                    />
                    {customFields.map(field => (
                        <input
                            key={field.id}
                            type="text"
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
                    <button type="submit" disabled={loading} className="block w-full p-2 bg-blue-500 text-white rounded">
                        Update Opportunity
                    </button>
                </form>
            </div>
        );
    }

    return (
        <>
            <div key={opp.id} className="flex justify-between items-center p-2 bg-white border rounded">
                <div>
                    <span className="font-medium">{opp.name || "Unnamed"}</span>
                    <span className="text-sm text-gray-600 ml-2">{opp.stage.name}</span>
                    <span className="text-sm text-gray-600 ml-2">{formatCurrency(opp.value)}</span>
                    <span className="text-sm text-gray-500 ml-2">
                        Expected: {formatCurrency(opp.value * opp.stage.conversionLikelihood)}
                    </span>
                    {opp.closeDate && (
                        <span className="text-sm text-gray-500 ml-2">
                            Close Date: {opp.closeDate}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsEditing(true)}
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
                    >
                        Edit
                    </button>
                    <button
                        onClick={deleteOpportunity}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </>
    );
};
