import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    queryKeys,
    fetchCustomFields,
    createLead,
    updateLead,
    LeadInput,
} from "./api";
import { Lead } from "./types";

export const LeadForm: React.FC<{
    lead?: Lead;
    onSuccess?: () => void;
}> = ({ lead, onSuccess }) => {
    const isEdit = !!lead;
    const queryClient = useQueryClient();

    const [firstName, setFirstName] = useState(lead?.firstName ?? "");
    const [lastName, setLastName] = useState(lead?.lastName ?? "");
    const [age, setAge] = useState(lead ? `${lead.age}` : "");
    const [phoneNumber, setPhoneNumber] = useState(lead?.phoneNumber ?? "");
    const [customFieldValues, setCustomFieldValues] = useState<
        Record<string, string>
    >(lead?.customFields ?? {});
    const [error, setError] = useState("");

    const { data: allFields = [] } = useQuery({
        queryKey: queryKeys.customFields,
        queryFn: fetchCustomFields,
    });
    const leadFields = allFields.filter(f => (f.entity ?? "lead") === "lead");

    const mutation = useMutation({
        mutationFn: (input: LeadInput) =>
            isEdit ? updateLead(lead!.id, input) : createLead(input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.leads });
            onSuccess?.();
        },
        onError: (err: unknown) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setError((err as any).response?.data ?? "Something went wrong");
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        mutation.mutate({
            firstName,
            lastName,
            age,
            phoneNumber,
            customFields: customFieldValues,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-red-500">{error}</p>}
            <input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                className="block w-full p-2 border border-gray-300 rounded"
            />
            <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                className="block w-full p-2 border border-gray-300 rounded"
            />
            <input
                type="text"
                placeholder="Age"
                value={age}
                onChange={e => setAge(e.target.value)}
                className="block w-full p-2 border border-gray-300 rounded"
            />
            <input
                type="text"
                placeholder="Phone Number"
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
                className="block w-full p-2 border border-gray-300 rounded"
            />
            {leadFields.map(field => (
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
            <button
                type="submit"
                disabled={mutation.isPending}
                className="block w-full p-2 bg-blue-500 text-white rounded disabled:bg-gray-300">
                {isEdit ? "Update Lead" : "Add Lead"}
            </button>
        </form>
    );
};
