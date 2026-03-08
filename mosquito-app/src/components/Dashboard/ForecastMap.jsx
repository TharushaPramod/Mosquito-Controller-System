// components/Dashboard/ForecastMap.jsx
// Overlays ML risk colors on your existing SriLankaMap
// Pass forecasts prop from parent, or fetch internally

import { useEffect, useState } from "react";
import { predictionApi } from "../../services/api";

const RISK_COLORS = {
    high: { bg: "#fca5a5", border: "#ef4444", text: "High Risk" },
    medium: { bg: "#fdba74", border: "#f97316", text: "Medium Risk" },
    low: { bg: "#86efac", border: "#22c55e", text: "Low Risk" },
    unknown: { bg: "#e5e7eb", border: "#9ca3af", text: "No Data" },
};

export default function ForecastMap() {
    const [forecasts, setForecasts] = useState({});
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        predictionApi.getAllForecasts()
            .then((res) => {
                // Build a district → forecast lookup
                const map = {};
                res.data.forEach((d) => {
                    map[d.district] = d;
                });
                setForecasts(map);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    // Returns the fill color for a district name (used by SriLankaMap)
    const getDistrictColor = (districtName) => {
        const key = districtName.toUpperCase();
        const fc = forecasts[key];
        const risk = fc?.week_1_risk || "unknown";
        return RISK_COLORS[risk]?.bg || RISK_COLORS.unknown.bg;
    };

    const getBorderColor = (districtName) => {
        const key = districtName.toUpperCase();
        const fc = forecasts[key];
        const risk = fc?.week_1_risk || "unknown";
        return RISK_COLORS[risk]?.border || RISK_COLORS.unknown.border;
    };

    if (loading) return (
        <div className="flex items-center justify-center h-48 text-gray-400">
            Loading risk map...
        </div>
    );

    return (
        <div className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-700">District Risk Map</h3>
                <div className="flex gap-3 text-xs">
                    {Object.entries(RISK_COLORS).filter(([k]) => k !== "unknown").map(([k, v]) => (
                        <span key={k} className="flex items-center gap-1">
                            <span className="w-3 h-3 rounded-full inline-block" style={{ background: v.bg, border: `2px solid ${v.border}` }} />
                            {v.text}
                        </span>
                    ))}
                </div>
            </div>

            {/* Pass getDistrictColor to your existing SriLankaMap */}
            {/* <SriLankaMap getDistrictColor={getDistrictColor} getBorderColor={getBorderColor} onDistrictClick={setSelected} /> */}

            {/* District grid fallback (works without map) */}
            <div className="grid grid-cols-4 gap-2 mt-2">
                {Object.entries(forecasts)
                    .sort((a, b) => (b[1].week_1_cases || 0) - (a[1].week_1_cases || 0))
                    .map(([dist, fc]) => {
                        const risk = fc.week_1_risk || "unknown";
                        const colors = RISK_COLORS[risk];
                        return (
                            <button
                                key={dist}
                                onClick={() => setSelected(dist === selected ? null : dist)}
                                className="rounded p-2 text-xs font-medium text-center transition-transform hover:scale-105"
                                style={{ background: colors.bg, border: `2px solid ${colors.border}` }}
                            >
                                <div className="font-semibold truncate">{dist}</div>
                                <div>{Math.round(fc.week_1_cases || 0)} cases</div>
                            </button>
                        );
                    })}
            </div>

            {/* Detail popup */}
            {selected && forecasts[selected] && (
                <div className="mt-3 p-3 border rounded-lg bg-gray-50 text-sm">
                    <h4 className="font-semibold text-gray-700 mb-1">{selected}</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                        <div>Week 1: <b>{Math.round(forecasts[selected].week_1_cases)} cases</b></div>
                        <div>Week 2: <b>{Math.round(forecasts[selected].week_2_cases)} cases</b></div>
                        <div>Risk: <span style={{ color: RISK_COLORS[forecasts[selected].week_1_risk]?.border }}>
                            {forecasts[selected].week_1_risk?.toUpperCase()}
                        </span></div>
                        <div>Model: {forecasts[selected].model_used}</div>
                    </div>
                </div>
            )}
        </div>
    );
}
