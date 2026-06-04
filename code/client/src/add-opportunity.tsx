import { useState, useEffect } from "react";
import axios from "axios";
import { CustomField, Stage } from "./types";

interface AddOpportunityProps {
    triggerRefresh?: number;
    leadId?: number;
    stages?: Stage[];
    onOpportunityChanged?: () => void;
}

export const AddOpportunity: React.FC<AddOpportunityProps> = ({
    triggerRefresh = 0,
    leadId,
    stages = [],
    onOpportunityChanged,
}) => {
    const [name, setName] = useState("");
    const [stageId, setStageId] = useState<string>("");
    const [value, setValue] = useState("");
    const [closeDate, setCloseDate] = useState("");
    const [customFields, setCustomFields] = useState<CustomField[]>([]);
    const [customFieldValues, setCustomFieldValues] = useState<Record<string, string>>({});
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchCustomFields();
    }, [triggerRefresh]);

    const fetchCustomFields = async () => {
        const result = await axios.get("/api/custom-fields");
        setCustomFields(result.data);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            await axios.post("/api/opportunities", {
                leadId,
                stageId: stageId ? parseInt(stageId) : undefined,
                name,
                value: value ? parseFloat(value) : undefined,
                closeDate,
                customFields: customFieldValues,
            });
            setSuccess(true);
            setName("");
            setStageId("");
            setValue("");
            setCloseDate("");
            setCustomFieldValues({});
            setTimeout(() => setSuccess(false), 3000);
            onOpportunityChanged?.();
        } catch (error) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setError((error as any).response.data);
        }
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 rounded bg-gray-100 w-96">
            <h2 className="text-xl font-fold">Add Opportunity</h2>
            {error && <p className="text-red-500">{error}</p>}
            {success && <p className="text-green-500">Opportunity added successfully</p>}
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
                Add Opportunity
            </button>
        </form>
    );
};
