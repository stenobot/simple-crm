import axios from "axios";
import { useEffect, useState } from "react";
import { CustomField, MonthlyForecastReport } from "./types";

export const MonthlyForecast: React.FC = () => {
    const [report, setReport] = useState<MonthlyForecastReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [customFields, setCustomFields] = useState<CustomField[]>([]);
    const [selectedField, setSelectedField] = useState("");

    useEffect(() => {
        fetchCustomFields();
    }, []);

    useEffect(() => {
        fetchMonthlyForecast();
    }, [selectedField]);

    const fetchCustomFields = async () => {
        const result = await axios.get("/api/custom-fields");
        setCustomFields(result.data.filter((f: CustomField) => f.entity === "opportunity"));
    };

    const fetchMonthlyForecast = async () => {
        setLoading(true);
        const result = await axios.get("/api/monthly-forecast", {
            params: selectedField ? { customField: selectedField } : {},
        });
        setReport(result.data);
        setLoading(false);
    };

    const formatCurrency = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Monthly Forecast</h2>
            <select
                value={selectedField}
                onChange={e => setSelectedField(e.target.value)}
                className="block w-64 p-2 border border-gray-300 rounded"
            >
                <option value="">All</option>
                {customFields.map(field => (
                    <option key={field.id} value={field.name}>
                        {field.label}
                    </option>
                ))}
            </select>
            {loading || !report ? (
                <p>Loading monthly forecast...</p>
            ) : (
                <>
                    <div className="grid grid-cols-3 gap-4">
                        {report.byMonth.map(item => (
                            <div key={item.month} className="p-4 bg-green-50 rounded border border-green-200">
                                <h3 className="font-bold">{item.month}</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Count</p>
                                        <p className="text-2xl font-bold">{item.count}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Total Expected Value</p>
                                        <p className="text-2xl font-bold">{formatCurrency(item.expectedValue)}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-yellow-50 rounded border border-yellow-200">
                            <h3 className="font-bold">Past Opportunities</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">Count</p>
                                    <p className="text-2xl font-bold">{report.closeDatePastCount}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Total Expected Value</p>
                                    <p className="text-2xl font-bold">{formatCurrency(report.closeDatePastExpectedValue)}</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-blue-50 rounded border border-blue-200">
                            <h3 className="font-bold">Future Opportunities</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">Count</p>
                                    <p className="text-2xl font-bold">{report.closeDateFutureCount}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Total Expected Value</p>
                                    <p className="text-2xl font-bold">{formatCurrency(report.closeDateFutureExpectedValue)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
