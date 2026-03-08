// components/Dashboard/StatCard.jsx
import React from "react";
import { ArrowUp, ArrowDown } from "lucide-react";
import clsx from "clsx";

const StatCard = ({ title, value, trend, trendValue, trendLabel, linkText, onClick, loading }) => {
    const isPositive = trend === "up";

    if (loading) return (
        <div className="bg-[#DDEDE7] rounded-xl p-4 shadow-sm flex flex-col items-center text-center animate-pulse">
            <div className="h-3 w-24 bg-gray-300 rounded mb-3" />
            <div className="h-8 w-16 bg-gray-300 rounded mb-2" />
            <div className="h-3 w-20 bg-gray-200 rounded mb-4" />
            <div className="w-full border-t border-gray-300 my-2" />
            <div className="h-3 w-16 bg-gray-200 rounded" />
        </div>
    );

    // Strip any existing +/- signs then format cleanly
    const rawNum = parseFloat(String(trendValue).replace(/[^0-9.-]/g, ''));
    const displayTrend = isNaN(rawNum)
        ? trendValue
        : `${rawNum > 0 ? '+' : ''}${rawNum}%`;

    return (
        <div className="bg-[#DDEDE7] rounded-xl py-3 px-4 shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow">
            <h3 className="text-gray-500 text-[9px] uppercase tracking-widest font-bold mb-1.5">{title}</h3>
            <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl font-extrabold text-gray-800 tracking-tight">{value}</span>
                {trend && (
                    <div className={clsx("p-1 rounded-md", isPositive ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600")}>
                        {isPositive ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                    </div>
                )}
            </div>
            <div className="text-xs text-gray-500 mb-4 flex items-center gap-1">
                <span className={clsx("font-medium", isPositive ? "text-green-600" : "text-red-600")}>
                    {displayTrend}
                </span>
                <span>{trendLabel}</span>
            </div>
            <div className="w-full border-t border-gray-300 my-2" />
            <button onClick={onClick} className="text-sm text-gray-600 hover:text-[#2F6A5F] font-medium transition-colors">
                {linkText}
            </button>
        </div>
    );
};

export default StatCard;
