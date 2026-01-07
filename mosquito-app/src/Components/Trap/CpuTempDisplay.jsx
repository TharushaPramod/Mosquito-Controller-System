

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { Cpu, Activity } from 'lucide-react';

export const CpuTempDisplay = ({ className }) => {
    const [temp, setTemp] = useState(0);
    const [status, setStatus] = useState("normal");

    useEffect(() => {
        const fetchStatus = async () => {
            // Mock data if API fails or for dev
            try {
                const data = await api.getSystemStatus();
                setTemp(data.cpu_temp);
                setStatus(data.status);
            } catch (e) {
                console.error(e);
                // Fallback for demo/dev if backend not reachable immediately
                setTemp(42);
                setStatus("normal");
            }
        };

        fetchStatus();
        const interval = setInterval(fetchStatus, 2000);
        return () => clearInterval(interval);
    }, []);

    const getStatusColor = () => {
        if (status === "critical") return "text-red-600";
        if (status === "warning") return "text-amber-600";
        return "text-[var(--navbar)]";
    }

    return (
        <div className={cn("bg-[var(--card-bg)] rounded-xl p-3 border border-white/40 shadow-sm flex flex-col items-center justify-center relative overflow-hidden", className)}>

            <div className={cn("absolute inset-0 opacity-10 blur-xl",
                status === "critical" ? "bg-red-500" :
                    status === "warning" ? "bg-amber-500" : "bg-emerald-500"
            )} />

            <div className="flex items-center gap-2 text-[var(--foreground)] opacity-70 text-xs font-bold uppercase tracking-wider mb-1 z-10">
                <Cpu className="w-3 h-3" />
                CPU Temp
            </div>

            <div className={cn("text-4xl font-mono font-bold z-10 transition-colors duration-500", getStatusColor())}>
                {temp}°C
            </div>

            <div className="mt-1 text-[10px] text-gray-500 z-10 flex items-center gap-1 font-semibold uppercase">
                <Activity className="w-3 h-3" />
                <span>{status}</span>
            </div>
        </div>
    );
};

