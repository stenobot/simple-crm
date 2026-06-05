import { useState } from "react";
import { Lead } from "./types";
import { LeadOpportunities } from "./lead-opportunities";

export const LeadRow: React.FC<{
    lead: Lead;
    onEdit: (lead: Lead) => void;
}> = ({ lead, onEdit }) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <>
            <tr
                onClick={() => setExpanded(!expanded)}
                className="cursor-pointer hover:bg-gray-50 select-none focus:outline-none"
                style={{ WebkitTapHighlightColor: "transparent" }}
                aria-expanded={expanded}>
                <td className="w-6 pr-2 text-center bg-white">
                    <span
                        className={`inline-block transition-transform ${expanded ? "rotate-90" : ""}`}
                        style={{
                            width: 0,
                            height: 0,
                            borderTop: "5px solid transparent",
                            borderBottom: "5px solid transparent",
                            borderLeft: "6px solid currentColor",
                        }}
                        aria-hidden="true"
                    />
                </td>
                <td className="border border-gray-300 p-2">{lead.firstName}</td>
                <td className="border border-gray-300 p-2">{lead.lastName}</td>
                <td className="border border-gray-300 p-2 text-right font-mono">{lead.age}</td>
                <td className="border border-gray-300 p-2">{lead.phoneNumber}</td>
            </tr>
            {expanded && (
                <tr>
                    <td className="bg-white"></td>
                    <td colSpan={4} className="border border-gray-300 p-4 bg-gray-50">
                        <LeadOpportunities
                            lead={lead}
                            onEditLead={() => onEdit(lead)}
                        />
                    </td>
                </tr>
            )}
        </>
    );
};
