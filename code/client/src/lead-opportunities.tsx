import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    queryKeys,
    fetchOpportunities,
    deleteOpportunity as deleteOpportunityApi,
} from "./api";
import { Lead, Opportunity } from "./types";
import { formatCurrency } from "./format";
import { Drawer } from "./drawer";
import { OpportunityForm } from "./opportunity-form";

export const LeadOpportunities: React.FC<{
    lead: Lead;
    onEditLead?: () => void;
}> = ({ lead, onEditLead }) => {
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
        },
    });

    const [drawerOpp, setDrawerOpp] = useState<Opportunity | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const openAdd = () => {
        setDrawerOpp(null);
        setDrawerOpen(true);
    };
    const openEdit = (opp: Opportunity) => {
        setDrawerOpp(opp);
        setDrawerOpen(true);
    };
    const close = () => setDrawerOpen(false);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-bold">Opportunities</h3>
                <div className="flex gap-2">
                    {onEditLead && (
                        <button
                            onClick={onEditLead}
                            className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 text-sm">
                            Edit Lead
                        </button>
                    )}
                    <button
                        onClick={openAdd}
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm">
                        Add Opportunity
                    </button>
                </div>
            </div>
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
                                {opp.closeDate && (
                                    <span className="text-sm text-gray-500 ml-2">
                                        Close: {opp.closeDate}
                                    </span>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => openEdit(opp)}
                                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm">
                                    Edit
                                </button>
                                <button
                                    onClick={() => deleteMutation.mutate(opp.id)}
                                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm">
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <Drawer
                open={drawerOpen}
                onClose={close}
                title={drawerOpp ? "Edit Opportunity" : "Add Opportunity"}>
                <OpportunityForm
                    key={drawerOpp?.id ?? "new"}
                    opportunity={drawerOpp ?? undefined}
                    leadId={lead.id}
                    onSuccess={close}
                />
            </Drawer>
        </div>
    );
};
