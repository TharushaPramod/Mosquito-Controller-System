// components/Dashboard/ForecastChart.jsx
// Drop-in replacement / companion to TrendChart.jsx
// Shows actual history + 2-week XGBoost forecast with confidence band

import { useEffect, useState } from "react";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ReferenceLine, ResponsiveContainer, Area, ComposedChart
} from "recharts";
import { predictionApi } from "../../services/api";

const RISK_COLORS = { high: "#ef4444", medium: "#f97316", low: "#22c55e" };

export default function ForecastChart({ district = "COLOMBO" }) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        predictionApi.getTimeline(district, 20)
            .then((res) => {
                const formatted = res.data.map((r) => ({
                    week: "W" + r.iso_week,
                    date: new Date(r.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
                    cases: Math.round(r.predicted_cases),
                    lower: r.lower_bound ? Math.round(r.lower_bound) : null,
                    upper: r.upper_bound ? Math.round(r.upper_bound) : null,
                    type: r.data_type,
                    risk: r.risk_level,
                }));
                setData(formatted);
                setLoading(false);
            })
            .catch((e) => { setError(e.message); setLoading(false); });
    }, [district]);

    if (loading) return (
        <div className="flex items-center justify-center h-48 text-gray-400">
            Loading forecast...
        </div>
    );
    if (error) return (
        <div className="flex items-center justify-center h-48 text-red-400">
            {error}
        </div>
    );

    // Find the split point between actual and predicted
    const splitIdx = data.findIndex((d) => d.type !== "actual");

    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-700">
                    Dengue Forecast — {district}
                </h3>
                <span className="text-xs text-gray-400">XGBoost Model</span>
            </div>

            <ResponsiveContainer width="100%" height={280}>
                <ComposedChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                        content={({ active, payload, label }) => {
                            if (!active || !payload?.length) return null;
                            const d = payload[0]?.payload;
                            return (
                                <div className="bg-white border rounded shadow p-2 text-xs">
                                    <p className="font-semibold">{label}</p>
                                    <p>Cases: <b>{d.cases}</b></p>
                                    {d.lower ? <p>Range: {d.lower} – {d.upper}</p> : null}
                                    <p>Type: <span className={
                                        d.type === "actual" ? "text-blue-500" : "text-orange-500"
                                    }>{d.type}</span></p>
                                    <p>Risk: <span style={{ color: RISK_COLORS[d.risk] }}>{d.risk}</span></p>
                                </div>
                            );
                        }}
                    />
                    <Legend />

                    {/* Confidence band (predicted only) */}
                    <Area
                        type="monotone" dataKey="upper"
                        stroke="none" fill="#fed7aa" fillOpacity={0.4}
                        name="Upper bound" legendType="none"
                    />
                    <Area
                        type="monotone" dataKey="lower"
                        stroke="none" fill="#ffffff" fillOpacity={1}
                        name="Lower bound" legendType="none"
                    />

                    {/* Actual line */}
                    <Line
                        type="monotone" dataKey="cases"
                        stroke="#3b82f6" strokeWidth={2}
                        dot={(props) => {
                            const { cx, cy, payload } = props;
                            if (payload.type !== "actual") return null;
                            return <circle key={cx} cx={cx} cy={cy} r={3} fill="#3b82f6" />;
                        }}
                        name="Cases"
                    />

                    {/* Split line */}
                    {splitIdx > 0 && (
                        <ReferenceLine
                            x={data[splitIdx]?.date}
                            stroke="#9ca3af" strokeDasharray="4 4"
                            label={{ value: "Forecast →", position: "top", fontSize: 10, fill: "#9ca3af" }}
                        />
                    )}
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
}
