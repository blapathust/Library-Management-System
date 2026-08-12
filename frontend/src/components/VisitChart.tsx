import { useEffect, useState } from "react";
import api from "../api/axios";
import {
    LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer
} from "recharts";

interface TimeRangeOption {
    label: string;
    value: { from: string; until: string };
}

interface ChartDataPoint {
    timestamp: string;
    value: number;
}

// Time range options
const timeRangeOptions: TimeRangeOption[] = [
    { label: "Last 10 minutes", value: { from: "-10mins", until: "now" } },
    { label: "Last 30 minutes", value: { from: "-30mins", until: "now" } },
    { label: "Last hour", value: { from: "-1hours", until: "now" } },
    { label: "Last 6 hours", value: { from: "-6hours", until: "now" } },
    { label: "Last 24 hours", value: { from: "-24hours", until: "now" } },
];

const VisitChart = () => {
    const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [timeRange, setTimeRange] = useState(timeRangeOptions[0].value);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await api.get('/api/metrics/visits', {
                    params: {
                        from: timeRange.from,
                        until: timeRange.until,
                    }
                });
                
                // Transform the data into a format that recharts can use
                const rawData = response.data;
                const formattedData: ChartDataPoint[] = Array.isArray(rawData) && rawData[0]?.datapoints
                    ? rawData[0].datapoints.map((point: [number | null, number]) => ({
                        timestamp: new Date(point[1] * 1000).toLocaleTimeString(),
                        value: point[0] || 0
                    }))
                    : [];
                
                setChartData(formattedData);
                setError(null);
            } catch {
                setError('Failed to load chart data');
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
        
        // Set up interval to refresh data every 60 seconds
        const intervalId = setInterval(fetchData, 60000);
        
        return () => clearInterval(intervalId);
    }, [timeRange]);

    const handleTimeRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedOption = timeRangeOptions.find(option => 
            option.value.from === e.target.value.split("|")[0] && 
            option.value.until === e.target.value.split("|")[1]
        );
        if (selectedOption) {
            setTimeRange(selectedOption.value);
        }
    };

    return (
        <div className="visit-chart">
            <div className="chart-header">
                <div className="time-range-selector">
                    <label className="font-semibold text-purple-700 mb-4" htmlFor="timeRange">Time Range: </label>
                    
                    <select 
                        id="timeRange" 
                        value={`${timeRange.from}|${timeRange.until}`}
                        onChange={handleTimeRangeChange}
                    >
                        {timeRangeOptions.map((option, index) => (
                            <option 
                                key={index} 
                                value={`${option.value.from}|${option.value.until}`}
                            >
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            {loading && <p>Loading chart data...</p>}
            {error && <p className="error">{error}</p>}
            {!loading && !error && (
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="timestamp" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />
                    </LineChart>
                </ResponsiveContainer>
            )}
        </div>
    );
};

export default VisitChart;
