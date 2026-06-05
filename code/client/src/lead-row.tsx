import { useState } from "react";
import { Lead } from "./types";
import { LeadOpportunities } from "./lead-opportunities";

export const LeadRow: React.FC<{
    lead: Lead;
    onEdit: (lead: Lead) => void;
}> = ({ lead, onEdit }) => {
    const [showOpps, setShowOpps] = useState(false);

    return (
        <>
            <tr>
                <td>
                    <button onClick={() => onEdit(lead)} className="mr-2">
                        Edit
                    </button>
                    <button onClick={() => setShowOpps(!showOpps)}>
                        {showOpps ? "Hide" : "Show"} Opps
                    </button>
                </td>
                <td>{lead.firstName}</td>
                <td>{lead.lastName}</td>
                <td>{lead.age}</td>
                <td>{lead.phoneNumber}</td>
            </tr>
            {showOpps && (
                <tr>
                    <td colSpan={5} className="p-4 bg-gray-50">
                        <LeadOpportunities lead={lead} />
                    </td>
                </tr>
            )}
        </>
    );
};
