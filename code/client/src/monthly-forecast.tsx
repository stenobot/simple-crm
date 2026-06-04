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
        //TODO: implement API endpoint and update this call
        const result = await axios.get("/api/pipeline");
        setReport(result.data);
        setLoading(false);
    };

    if (loading) return <p>Loading monthly forecast...</p>;
    if (!report) return <p>No monthly forecast data</p>;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Monthly Forecast</h2>

            <div className="p-4 bg-yellow-50 rounded border border-yellow-200">
                <p className="text-sm text-gray-600">Feature coming soon...</p>
            </div>
        </div>
    );
};
