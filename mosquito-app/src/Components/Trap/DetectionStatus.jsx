import React, { useEffect, useState } from 'react';
import { cn } from "../../lib/utils";
import { api } from "../../lib/api";
import { Camera, Activity, AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react';

export const DetectionStatus = ({ className }) => {
    const [detection, setDetection] = useState({ label: "none", confidence: 0, motion: true });

    // Fallback to polling for detection and motion events
    useEffect(() => {
        const pollStatus = async () => {
            try {
                // Manually fetch the new detection status endpoint we just added to app.py
                const res = await fetch(`http://192.168.31.135:5001/detection-status`);
                if (res.ok) {
                    const data = await res.json();
                    setDetection(data);
                }
            } catch (error) {
                // Backend might be offline
            }
        };

        const timer = setInterval(pollStatus, 2000);
        pollStatus();

        return () => clearInterval(timer);
    }, []);

    // Helper functions for UI mapping
    const getStatusUI = () => {
        if (detection.label === "mosquito") {
            return {
                text: "MOSQUITO DETECTED",
                icon: <AlertCircle className="w-8 h-8 text-red-500 animate-pulse" />,
                bg: "bg-red-500/10 border-red-500/50",
                textCol: "text-red-500"
            };
        } else if (detection.label === "other") {
            return {
                text: "OTHER CREATURE",
                icon: <AlertTriangle className="w-8 h-8 text-yellow-500" />,
                bg: "bg-yellow-500/10 border-yellow-500/50",
                textCol: "text-yellow-500"
            };
        }
        return {
            text: "AREA CLEAR",
            icon: <CheckCircle2 className="w-8 h-8 text-emerald-500" />,
            bg: "bg-emerald-500/10 border-emerald-500/50",
            textCol: "text-emerald-500"
        };
    };

    const ui = getStatusUI();

    return (
        <div className={cn("bg-[var(--card-bg)] rounded-xl p-6 border border-white/40 shadow-sm", className)}>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[var(--foreground)] flex items-center gap-2">
                    <Camera className="text-[var(--navbar)]" />
                    Live Detection Status
                </h2>
                <div className="flex items-center gap-2">
                    <div className={cn("flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold", detection.motion ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500")}>
                        <Activity className="w-3.5 h-3.5" />
                        {detection.motion ? "MOTION DETECTED" : "NO MOTION"}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Primary Camera Status */}
                <div className={cn("p-6 rounded-2xl border-2 flex flex-col items-center justify-center text-center transition-colors duration-300", ui.bg)}>
                    {ui.icon}
                    <h3 className={cn("mt-4 text-xl font-black tracking-wider uppercase", ui.textCol)}>
                        {ui.text}
                    </h3>
                    <p className="mt-2 text-sm text-[var(--foreground)] opacity-70">
                        Confidence: {(detection.confidence * 100).toFixed(1)}%
                    </p>
                </div>

                {/* Additional Stats */}
                <div className="space-y-4">
                    <div className="bg-white/40 border border-white/50 p-4 rounded-xl">
                        <span className="text-xs text-[var(--foreground)] opacity-70 uppercase font-bold block mb-1">AI Camera Logic</span>
                        <div className="text-sm font-medium">Model: int8 Quantized</div>
                        <div className="text-sm font-medium">Input: 640x640 FPS</div>
                    </div>

                    <div className="bg-white/40 border border-white/50 p-4 rounded-xl">
                        <span className="text-xs text-[var(--foreground)] opacity-70 uppercase font-bold block mb-1">Hardware Automations</span>
                        <ul className="text-xs space-y-2 mt-2 font-medium bg-white/30 p-2 rounded">
                            <li className="flex items-center gap-2">
                                <span className="inline-block w-2 h-2 rounded-full bg-red-500"></span>
                                Mosquito ➜ Electric Net ON
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="inline-block w-2 h-2 rounded-full bg-yellow-500"></span>
                                Other ➜ Ejection Fan ON
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="inline-block w-2 h-2 rounded-full bg-blue-500"></span>
                                No Motion ➜ Safety Shutdown
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};
