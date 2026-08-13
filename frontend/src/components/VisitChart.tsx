import { useEffect, useState } from "react";
import api from "../api/axios";
import {
    LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer
} from "recharts";

interface TimeRangeOption {
    label: string;
    value: { from: string; until: string; interval: string };
}

interface ChartDataPoint {
    timestamp: string;
    views: number;
    logins: number;
}

// Time range options
const timeRangeOptions: TimeRangeOption[] = [
    { label: "Real-time (Last 30 mins)", value: { from: "-30mins", until: "now", interval: "" } },
    { label: "By Hour (Last 24 hours)", value: { from: "-24hours", until: "now", interval: "1hour" } },
    { label: "By Date (Last 30 days)", value: { from: "-30days", until: "now", interval: "1day" } },
    { label: "By Month (Last 12 months)", value: { from: "-12months", until: "now", interval: "1month" } },
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
                        interval: timeRange.interval
                    }
                });
                
                // Transform the data into a format that recharts can use
                const rawData = response.data;
                const dataMap = new Map<number, ChartDataPoint>();

                if (Array.isArray(rawData)) {
                    rawData.forEach((targetData: any) => {
                        const isLogin = targetData.target.toLowerCase().includes('login');
                        const dataKey = isLogin ? 'logins' : 'views';

                        if (Array.isArray(targetData.datapoints)) {
                            targetData.datapoints.forEach((point: [number | null, number]) => {
                                const val = point[0] || 0;
                                const ts = point[1];
                                if (!dataMap.has(ts)) {
                                    dataMap.set(ts, { 
                                        timestamp: new Date(ts * 1000).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }), 
                                        views: 0, 
                                        logins: 0 
                                    });
                                }
                                dataMap.get(ts)![dataKey] = val;
                            });
                        }
                    });
                }
                
                // Sort by timestamp just in case
                const formattedData = Array.from(dataMap.entries())
                    .sort((a, b) => a[0] - b[0])
                    .map(entry => entry[1]);
                
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
        const [from, until, interval] = e.target.value.split("|");
        const selectedOption = timeRangeOptions.find(option => 
            option.value.from === from && 
            option.value.until === until &&
            option.value.interval === interval
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
                        value={`${timeRange.from}|${timeRange.until}|${timeRange.interval}`}
                        onChange={handleTimeRangeChange}
                    >
                        {timeRangeOptions.map((option, index) => (
                            <option 
                                key={index} 
                                value={`${option.value.from}|${option.value.until}|${option.value.interval}`}
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
                        <Line type="monotone" dataKey="views" name="Page Views" stroke="#8884d8" activeDot={{ r: 8 }} />
                        <Line type="monotone" dataKey="logins" name="User Logins" stroke="#82ca9d" activeDot={{ r: 8 }} />
                    </LineChart>
                </ResponsiveContainer>
            )}
        </div>
    );
};

export default VisitChart;
