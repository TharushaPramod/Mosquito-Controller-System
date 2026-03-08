// components/Dashboard/AlertsList.jsx
import React, { useEffect, useState } from "react";
import { CloudRain, FileText, AlertTriangle, Bell } from "lucide-react";

const ICONS = { weather: CloudRain, lab: FileText, outbreak: AlertTriangle, general: Bell };
const COLORS = {
    high: { bg: "bg-red-100", icon: "text-red-500" },
    medium: { bg: "bg-orange-100", icon: "text-orange-500" },
    low: { bg: "bg-green-100", icon: "text-green-600" },
};

const BASE = import.meta.env.VITE_API_URL;

const AlertsList = () => {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(BASE + "/notifications/alerts?limit=3")
            .then(r => r.json())
            .then(res => { setAlerts(res.data || []); setLoading(false); })
            .catch(() => { setLoading(false); });
    }, []);

    // Fallback static alerts when no backend data yet
    const displayAlerts = alerts.length > 0 ? alerts : [
        { _id: 1, title: "High Risk Weather Conditions", message: "Heavy rainfall & humidity in Western Province.", severity: "high", type: "weather" },
        { _id: 2, title: "Dengue Positive Lab Results", message: "15 labs confirm positive cases in Gampaha.", severity: "medium", type: "lab" },
        { _id: 3, title: "School Outbreak Risk", message: "Five students in Colombo school tested positive.", severity: "low", type: "outbreak" },
    ];

    return (
        <div className="h-full flex flex-col p-5">
            <h3 className="text-gray-400 text-[10px] uppercase tracking-widest font-bold mb-6 text-center tracking-[0.2em]">Latest Alerts</h3>
            {loading ? (
                <div className="flex flex-col gap-3">
                    {[1, 2, 3].map(i => <div key={i} className="h-16 bg-white/50 rounded-lg animate-pulse" />)}
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {displayAlerts.map((alert) => {
                        const Icon = ICONS[alert.type] || Bell;
                        const colors = COLORS[alert.severity] || COLORS.low;
                        return (
                            <div key={alert._id} className="flex items-start gap-4 p-2.5 bg-white/50 rounded-lg hover:bg-white transition-all border border-transparent hover:border-gray-100 shadow-sm hover:shadow-md group">
                                <div className={`p-2 rounded-xl ${colors.bg} ${colors.icon} flex-shrink-0 transition-transform group-hover:scale-110`}>
                                    <Icon size={16} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-800 text-[11px] tracking-tight">{alert.title}</h4>
                                    <p className="text-[9px] text-gray-500 mt-0.5 leading-snug">{alert.message || alert.description}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default AlertsList;
