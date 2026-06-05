import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Lead } from "./types";
import { LeadRow } from "./lead-row";
import { Drawer } from "./drawer";
import { LeadForm } from "./lead-form";
import { queryKeys, fetchLeads } from "./api";
import { PlusIcon } from "./icons";

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
            <div className="flex justify-between items-center mb-2 pl-6">
                <h2 className="text-xl font-bold">Leads</h2>
                <button
                    onClick={openAdd}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm inline-flex items-center gap-1">
                    <PlusIcon />
                    Add Lead
                </button>
            </div>
            <table className="table-auto w-full border-collapse">
                <thead>
                    <tr>
                        <th className="w-6"></th>
                        <th className="border border-gray-300 bg-gray-100 p-2 text-left">First Name</th>
                        <th className="border border-gray-300 bg-gray-100 p-2 text-left">Last Name</th>
                        <th className="border border-gray-300 bg-gray-100 p-2 text-right">Age</th>
                        <th className="border border-gray-300 bg-gray-100 p-2 text-left">Phone Number</th>
                        <th className="w-10"></th>
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
