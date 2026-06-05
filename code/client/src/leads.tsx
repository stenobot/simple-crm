import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Lead } from "./types";
import { LeadRow } from "./lead-row";
import { Drawer } from "./drawer";
import { LeadForm } from "./lead-form";
import { queryKeys, fetchLeads } from "./api";

export const Leads: React.FC = () => {
    const { data: leads = [] } = useQuery({
        queryKey: queryKeys.leads,
        queryFn: fetchLeads,
    });

    const [drawerLead, setDrawerLead] = useState<Lead | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

    const openAdd = () => {
        setDrawerLead(null);
        setDrawerOpen(true);
    };
    const openEdit = (lead: Lead) => {
        setDrawerLead(lead);
        setDrawerOpen(true);
    };
    const close = () => setDrawerOpen(false);

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-bold">Leads</h2>
                <button
                    onClick={openAdd}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm">
                    Add Lead
                </button>
            </div>
            <table className="table-auto w-full">
                <thead>
                    <tr>
                        <th></th>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Age</th>
                        <th>Phone Number</th>
                    </tr>
                </thead>
                <tbody>
                    {leads.map(lead => (
                        <LeadRow lead={lead} key={lead.id} onEdit={openEdit} />
                    ))}
                </tbody>
            </table>
            <Drawer
                open={drawerOpen}
                onClose={close}
                title={drawerLead ? "Edit Lead" : "Add Lead"}>
                <LeadForm
                    // remount when switching between add/edit or between different leads
                    key={drawerLead?.id ?? "new"}
                    lead={drawerLead ?? undefined}
                    onSuccess={close}
                />
            </Drawer>
        </div>
    );
};
