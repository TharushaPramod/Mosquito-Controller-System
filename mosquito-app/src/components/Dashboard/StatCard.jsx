import React from "react";
import { ArrowUp, ArrowDown, Activity, TrendingUp, AlertCircle, ShieldCheck } from "lucide-react";
import clsx from "clsx";

const ICONS = {
    "Today's Caseload": Activity,
    "Weekly Cumulative": TrendingUp,
    "Transmission Clusters": AlertCircle,
    "Total Fatalities": ShieldCheck
};

const StatCard = ({ title, value, trend, trendValue, trendLabel, onClick, loading }) => {
    const isPositive = trend === "up";
    const Icon = ICONS[title] || Activity;

    if (loading) return (
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm animate-pulse">
            <div className="h-4 w-24 bg-gray-100 rounded-lg mb-4" />
            <div className="h-10 w-32 bg-gray-200 rounded-xl" />
        </div>
    );

    return (
        <button 
            onClick={onClick}
            className="bg-white rounded-[2rem] p-6 border border-gray-50 shadow-xl shadow-gray-200/20 flex flex-col gap-4 text-left hover:scale-[1.02] hover:shadow-2xl transition-all group overflow-hidden relative"
        >
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-gray-50 rounded-full group-hover:bg-[#2F6A5F]/5 transition-colors"></div>
            
            <div className="flex items-center justify-between relative z-10">
                <div className={clsx(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                    isPositive ? "bg-red-50 text-red-500" : "bg-[#2F6A5F]/10 text-[#2F6A5F]"
                )}>
                    <Icon size={20} />
                </div>
                {trendValue && (
                    <div className={clsx(
                        "flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black tracking-tight",
                        isPositive ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
                    )}>
                        {isPositive ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
                        {trendValue}
                    </div>
                )}
            </div>

            <div className="relative z-10">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{title}</p>
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-[#1A3D37] tracking-tight">{value}</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{trendLabel}</span>
                </div>
            </div>
        </button>
    );
};

export default StatCard;
