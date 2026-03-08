// components/Dashboard/TrendChart.jsx
import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const BASE = import.meta.env.VITE_API_URL;

const TrendChart = ({ district }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        const url = BASE + "/heatmap/trend" + (district ? "?district=" + district : "");
        fetch(url)
            .then(r => r.json())
            .then(res => { setData(res.data || []); setLoading(false); })
            .catch(() => { setLoading(false); });
    }, [district]);

    return (
        <div className="h-full flex flex-col">
            <h3 className="text-gray-400 text-[10px] uppercase tracking-widest font-bold mb-4 text-center tracking-[0.2em]">
                Past 14 Weeks Trends {district ? "— " + district : ""}
            </h3>
            {loading ? (
                <div className="flex-1 flex items-center justify-center text-gray-400 text-sm animate-pulse">Loading trend data...</div>
            ) : data.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">No case data yet</div>
            ) : (
                <div className="flex-1 w-full min-h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 25 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                            <XAxis dataKey="date" label={{ value: "Weeks", position: "insideBottom", offset: -10 }} tick={{ fontSize: 11 }} />
                            <YAxis label={{ value: "Number of Cases", angle: -90, position: "insideLeft" }} tick={{ fontSize: 11 }} />
                            <Tooltip />
                            <Legend verticalAlign="top" height={36} />
                            <Line type="monotone" dataKey="cases" name="Reported Cases" stroke="#8884d8" strokeWidth={2} dot={{ r: 3 }} />
                            <Line type="monotone" dataKey="recovered" name="Recovered" stroke="#82ca9d" strokeWidth={2} dot={{ r: 3 }} />
                            <Line type="monotone" dataKey="active" name="Active Cases" stroke="#ffc658" strokeWidth={2} dot={{ r: 3 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
};

export default TrendChart;
