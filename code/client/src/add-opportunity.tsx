import { useState, useEffect } from "react";
import axios from "axios";
import { CustomField } from "./types";

export const AddOpportunity: React.FC<{ triggerRefresh?: number }> = ({ triggerRefresh = 0 }) => {
    const [name, setName] = useState("");
    const [stage, setStage] = useState("");
    const [expectedValue, setExpectedValue] = useState("");
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
                name,
                stage,
                expectedValue,
                closeDate,
                customFields: customFieldValues,
            });
            setSuccess(true);
            setName("");
            setStage("");
            setExpectedValue("");
            setCloseDate("");
            setCustomFieldValues({});
            setTimeout(() => setSuccess(false), 3000);
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
            <input
                type="text"
                placeholder="Stage"
                value={stage}
                onChange={e => setStage(e.target.value)}
                className="block w-full p-2 border border-gray-300 rounded"
            />
            <input
                type="text"
                placeholder="Expected Value"
                value={expectedValue}
                onChange={e => setExpectedValue(e.target.value)}
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
