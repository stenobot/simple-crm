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
import { IconButton, PencilIcon, TrashIcon } from "./icons";

export const LeadOpportunities: React.FC<{
    lead: Lead;
}> = ({ lead }) => {
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
                <button
                    onClick={openAdd}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm">
                    Add Opportunity
                </button>
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
                            <div className="flex gap-1">
                                <IconButton
                                    onClick={() => openEdit(opp)}
                                    label="Edit opportunity">
                                    <PencilIcon />
                                </IconButton>
                                <IconButton
                                    onClick={() => deleteMutation.mutate(opp.id)}
                                    label="Delete opportunity"
                                    variant="danger">
                                    <TrashIcon />
                                </IconButton>
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
