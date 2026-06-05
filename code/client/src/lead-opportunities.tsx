import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    queryKeys,
    fetchOpportunities,
    deleteOpportunity as deleteOpportunityApi,
} from "./api";
import { Lead, Opportunity } from "./types";

const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
        value,
    );

export const LeadOpportunities: React.FC<{ lead: Lead }> = ({ lead }) => {
    const queryClient = useQueryClient();
    const { data: allOpps = [] } = useQuery({
        queryKey: queryKeys.opportunities,
        queryFn: fetchOpportunities,
    });
    const opportunities = allOpps.filter(
        (opp: Opportunity) => opp.lead.id === lead.id,
    );

    const deleteMutation = useMutation({
        mutationFn: (oppId: number) => deleteOpportunityApi(oppId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.opportunities });
            queryClient.invalidateQueries({ queryKey: queryKeys.pipeline });
            queryClient.invalidateQueries({ queryKey: queryKeys.stages });
        },
    });

    return (
        <div className="space-y-4">
            <h3 className="font-bold">Opportunities</h3>
            {opportunities.length === 0 ? (
                <p className="text-gray-500">No opportunities</p>
            ) : (
                <div className="space-y-2">
                    {opportunities.map(opp => (
                        <div
                            key={opp.id}
                            className="flex justify-between items-center p-2 bg-white border rounded">
                            <div>
                                <span className="font-medium">
                                    {opp.name || "Unnamed"}
                                </span>
                                <span className="text-sm text-gray-600 ml-2">
                                    {opp.stage.name}
                                </span>
                                <span className="text-sm text-gray-600 ml-2">
                                    {formatCurrency(opp.value)}
                                </span>
                                <span className="text-sm text-gray-500 ml-2">
                                    Expected:{" "}
                                    {formatCurrency(
                                        opp.value * opp.stage.conversionLikelihood,
                                    )}
                                </span>
                            </div>
                            <button
                                onClick={() => deleteMutation.mutate(opp.id)}
                                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm">
                                Delete
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
