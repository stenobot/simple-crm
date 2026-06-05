import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    queryKeys,
    fetchStages,
    createStage,
    updateStage,
    deleteStage as deleteStageApi,
} from "./api";
import { Stage } from "./types";
import { IconButton, PencilIcon, TrashIcon } from "./icons";

export const ManageStages: React.FC = () => {
    const queryClient = useQueryClient();
    const { data: stages = [] } = useQuery({
        queryKey: queryKeys.stages,
        queryFn: fetchStages,
    });

    const [newName, setNewName] = useState("");
    const [newStatus, setNewStatus] = useState<"pending" | "won" | "lost">(
        "pending",
    );
    const [newLikelihood, setNewLikelihood] = useState("0.5");
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editName, setEditName] = useState("");
    const [editStatus, setEditStatus] = useState<"pending" | "won" | "lost">(
        "pending",
    );
    const [editLikelihood, setEditLikelihood] = useState("0.5");

    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.stages });
        queryClient.invalidateQueries({ queryKey: queryKeys.pipeline });
    };

    const addMutation = useMutation({
        mutationFn: createStage,
        onSuccess: () => {
            setNewName("");
            setNewStatus("pending");
            setNewLikelihood("0.5");
            invalidate();
        },
        onError: () => alert("Failed to add stage"),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, input }: { id: number; input: Parameters<typeof updateStage>[1] }) =>
            updateStage(id, input),
        onSuccess: () => {
            setEditingId(null);
            invalidate();
        },
        onError: () => alert("Failed to update stage"),
    });

    const deleteMutation = useMutation({
        mutationFn: deleteStageApi,
        onSuccess: invalidate,
    });

    const addStage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName) return;
        addMutation.mutate({
            name: newName,
            status: newStatus,
            conversionLikelihood: parseFloat(newLikelihood),
        });
    };

    const startEdit = (stage: Stage) => {
        setEditingId(stage.id);
        setEditName(stage.name);
        setEditStatus(stage.status);
        setEditLikelihood(stage.conversionLikelihood.toString());
    };

    const saveEdit = () => {
        if (!editingId) return;
        updateMutation.mutate({
            id: editingId,
            input: {
                name: editName,
                status: editStatus,
                conversionLikelihood: parseFloat(editLikelihood),
            },
        });
    };

    const onDelete = (id: number) => {
        if (confirm("Delete this stage?")) deleteMutation.mutate(id);
    };

    return (
        <div className="border-t pt-8">
            <h2 className="text-xl font-bold mb-4">Manage Stages</h2>
            <div className="mb-6">
                <h3 className="font-bold mb-2">Existing Stages</h3>
                {stages.length === 0 ? (
                    <p className="text-gray-500">No stages</p>
                ) : (
                    <ul className="space-y-2">
                        {stages.map(stage => (
                            <li key={stage.id} className="p-3 bg-gray-100 rounded">
                                {editingId === stage.id ? (
                                    <div className="space-y-2">
                                        <input
                                            type="text"
                                            value={editName}
                                            onChange={e => setEditName(e.target.value)}
                                            className="block w-full p-2 border rounded"
                                        />
                                        <select
                                            value={editStatus}
                                            onChange={e =>
                                                setEditStatus(
                                                    e.target.value as
                                                        | "pending"
                                                        | "won"
                                                        | "lost",
                                                )
                                            }
                                            className="block w-full p-2 border rounded">
                                            <option>pending</option>
                                            <option>won</option>
                                            <option>lost</option>
                                        </select>
                                        <input
                                            type="number"
                                            min="0"
                                            max="1"
                                            step="0.05"
                                            value={editLikelihood}
                                            onChange={e =>
                                                setEditLikelihood(e.target.value)
                                            }
                                            className="block w-full p-2 border rounded"
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                onClick={saveEdit}
                                                className="bg-green-500 text-white px-3 py-1 rounded">
                                                Save
                                            </button>
                                            <button
                                                onClick={() => setEditingId(null)}
                                                className="bg-gray-500 text-white px-3 py-1 rounded">
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <span className="font-medium">
                                                {stage.name}
                                            </span>
                                            <span className="text-xs text-gray-600 ml-2">
                                                ({stage.status})
                                            </span>
                                            <span className="text-xs text-gray-600 ml-2">
                                                {(
                                                    stage.conversionLikelihood * 100
                                                ).toFixed(0)}
                                                %
                                            </span>
                                        </div>
                                        <div className="flex gap-1">
                                            <IconButton
                                                onClick={() => startEdit(stage)}
                                                label="Edit stage">
                                                <PencilIcon />
                                            </IconButton>
                                            <IconButton
                                                onClick={() => onDelete(stage.id)}
                                                label="Delete stage"
                                                variant="danger">
                                                <TrashIcon />
                                            </IconButton>
                                        </div>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <form onSubmit={addStage} className="space-y-3">
                <h3 className="font-bold">Add New Stage</h3>
                <input
                    type="text"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    placeholder="Stage name"
                    className="block w-full p-2 border rounded"
                />
                <select
                    value={newStatus}
                    onChange={e =>
                        setNewStatus(e.target.value as "pending" | "won" | "lost")
                    }
                    className="block w-full p-2 border rounded">
                    <option value="pending">Pending</option>
                    <option value="won">Won</option>
                    <option value="lost">Lost</option>
                </select>
                <div>
                    <label className="text-sm block mb-1">
                        Conversion Likelihood:{" "}
                        {(parseFloat(newLikelihood) * 100).toFixed(0)}%
                    </label>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={newLikelihood}
                        onChange={e => setNewLikelihood(e.target.value)}
                        className="w-full"
                    />
                </div>
                <button
                    type="submit"
                    className="block w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                    Add Stage
                </button>
            </form>
        </div>
    );
};
