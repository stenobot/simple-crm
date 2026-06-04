import axios from "axios";
import { useEffect, useState } from "react";
import { MonthlyForecastReport } from "./types";

export const MonthlyForecast: React.FC = () => {
    const [report, setReport] = useState<MonthlyForecastReport | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMonthlyForecast();
    }, []);

    const fetchMonthlyForecast = async () => {
        setLoading(true);
        const result = await axios.get("/api/monthly-forecast");
        setReport(result.data);
        setLoading(false);
    };

    if (loading) return <p>Loading monthly forecast...</p>;
    if (!report) return <p>No monthly forecast data</p>;

    const formatCurrency = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Monthly Forecast</h2>
            <div className="grid grid-cols-3 gap-4">
                {report.byMonth.map(item => {
                    return (
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
                    );
                })}
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
        </div>
    );
};
