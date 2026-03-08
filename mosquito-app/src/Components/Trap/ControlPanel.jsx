

import React, { useState, useEffect } from 'react';
import { cn } from "../../lib/utils";
import { Fan, Zap, Wind, ShieldAlert, Clock } from 'lucide-react';
import { api } from "../../lib/api";

export const ControlPanel = ({ className }) => {
    const [loading, setLoading] = useState(false);
    const [settings, setSettings] = useState(null);

    // Dummy states for UI feedback
    const [fanState, setFanState] = useState(false);
    const [netState, setNetState] = useState(false);
    const [valveState, setValveState] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const s = await api.getSettings();
            setSettings(s);
        } catch (e) {
            console.error("Using mock settings:", e);
            setSettings({
                mode: 'auto',
                co2_enabled: true,
                co2_on_duration: 10,
                co2_off_interval: 10,
                net_duration: 5,
                fan_duration: 5,
                confidence_threshold: 0.5
            });
        }
    }

    const toggleComponent = async (component, currentState, setter) => {
        try {
            setLoading(true);
            const action = currentState ? "off" : "on";
            await api.controlComponent(component, action);
            setter(!currentState);
        } catch (error) {
            console.error(error);
            alert(`Failed to toggle ${component}`);
        } finally {
            setLoading(false);
        }
    };

    const setMode = async (newMode) => {
        if (!settings) return;
        // Optimistic update for instant feedback
        setSettings(prev => ({ ...prev, mode: newMode }));

        try {
            await api.updateSettings({ mode: newMode });
        } catch (e) {
            console.error("API failed, using local state", e);
            // Optionally revert here if strictly needed, but better to keep UI responsive
        }
    }

    const updateSetting = async (key, value) => {
        if (!settings) return;
        try {
            await api.updateSettings({ [key]: value });
        } catch (e) { console.error("API failed, using local state", e); }
        setSettings({ ...settings, [key]: value });
    }

    // Automation Logic (Real-time)
    useEffect(() => {
        if (!settings || settings.mode !== 'auto') return;

        const checkTimeAndAdjust = () => {
            const now = new Date();
            const hour = now.getHours();

            // Peak Mosquito Times: 6am-8am and 6pm-7pm (18:00-19:00)
            const isMorningPeak = hour >= 6 && hour < 8;
            const isEveningPeak = hour >= 18 && hour < 19;
            const isPeakTime = isMorningPeak || isEveningPeak;

            // Define Release Strategies
            const peakSettings = {
                co2_on_duration: 30,
                co2_off_interval: 5,
                fan_duration: 120
            };
            const normalSettings = {
                co2_on_duration: 5,
                co2_off_interval: 30,
                fan_duration: 30
            };

            const targetSettings = isPeakTime ? peakSettings : normalSettings;

            if (settings.co2_on_duration !== targetSettings.co2_on_duration ||
                settings.fan_duration !== targetSettings.fan_duration) {
                setSettings(prev => ({ ...prev, ...targetSettings }));
                api.updateSettings(targetSettings).catch(e => console.error("Auto sync failed:", e));
            }
        };

        checkTimeAndAdjust();
        const timer = setInterval(checkTimeAndAdjust, 10000); // Check every 10s
        return () => clearInterval(timer);
    }, [settings?.mode]);

    return (
        <div className="space-y-6">
            {/* Main Controls */}
            <div className={cn("bg-[var(--card-bg)] rounded-xl p-6 border border-white/40 shadow-sm", className)}>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-[var(--foreground)] flex items-center gap-2">
                        <ShieldAlert className="text-[var(--navbar)]" />
                        System Control
                    </h2>
                    {/* Mode Toggle Buttons */}
                    <div className="flex bg-gray-100 p-1 rounded-full border border-gray-200">
                        <button
                            onClick={() => setMode('auto')}
                            className={cn(
                                "px-6 py-2 text-sm font-bold rounded-full transition-all uppercase tracking-wide",
                                settings?.mode === "auto"
                                    ? "bg-emerald-500 text-white shadow-md"
                                    : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            AUTO MODE
                        </button>
                        <button
                            onClick={() => setMode('manual')}
                            className={cn(
                                "px-6 py-2 text-sm font-bold rounded-full transition-all uppercase tracking-wide",
                                settings?.mode === "manual"
                                    ? "bg-emerald-500 text-white shadow-md"
                                    : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            MANUAL MODE
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <ControlButton
                        label="Ejection Fans"
                        icon={<Fan className={cn("w-6 h-6", fanState && "animate-spin")} />}
                        active={fanState}
                        onClick={() => toggleComponent('fan', fanState, setFanState)}
                        disabled={settings?.mode === 'auto'}
                        color="blue"
                    />
                    <ControlButton
                        label="Electric Net"
                        icon={<Zap className="w-6 h-6" />}
                        active={netState}
                        onClick={() => toggleComponent('net', netState, setNetState)}
                        disabled={settings?.mode === 'auto'}
                        color="red"
                    />
                    <ControlButton
                        label="CO₂ Valve"
                        icon={<Wind className="w-6 h-6" />}
                        active={valveState}
                        onClick={() => toggleComponent('valve', valveState, setValveState)}
                        disabled={settings?.mode === 'auto'}
                        color="purple"
                    />
                    <div className="p-4 bg-white/40 rounded-xl border border-white/50 flex flex-col items-center justify-center text-center shadow-sm">
                        <span className="text-xs text-[var(--foreground)] opacity-70 uppercase font-semibold mb-2">Detection</span>
                        <div className="text-2xl font-bold text-[var(--navbar)]">READY</div>
                    </div>
                </div>
            </div>

            {/* Timer Config */}
            <div className="bg-[var(--card-bg)] rounded-xl p-6 border border-white/40 shadow-sm">
                <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
                    <Clock className="text-[var(--navbar)]" />
                    Automation Settings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* CO2 Logic */}
                    <div className="p-4 rounded-lg bg-white/40 border border-white/40">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-bold text-[var(--table-heading)]">CO₂ Cycle</span>
                            <div
                                onClick={() => updateSetting('co2_enabled', !settings?.co2_enabled)}
                                className={cn("w-10 h-5 rounded-full relative cursor-pointer transition-colors shadow-inner", settings?.co2_enabled ? "bg-emerald-500" : "bg-gray-400")}
                            >
                                <div className={cn("w-3 h-3 bg-white rounded-full absolute top-1 transition-all shadow-sm", settings?.co2_enabled ? "left-6" : "left-1")} />
                            </div>
                        </div>

                        <div className="space-y-4">
                            {/* Schedule Slots (Visible in Auto Mode) */}
                            {settings?.mode === 'auto' && (
                                <div className="bg-white/50 rounded-lg p-3">
                                    <label className="text-xs text-[var(--foreground)] opacity-70 block mb-2 font-bold uppercase">Schedule Configuration</label>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-xs bg-white p-2 rounded border border-emerald-100">
                                            <div className="font-mono text-gray-600">06:00 - 07:00</div>
                                            <div className="font-bold text-emerald-600">100% Release</div>
                                        </div>
                                        <div className="flex items-center justify-between text-xs bg-white p-2 rounded border border-gray-200">
                                            <div className="font-mono text-gray-600">07:00 - 16:00</div>
                                            <div className="font-bold text-blue-600">50% Release</div>
                                        </div>
                                        <div className="flex items-center justify-between text-xs bg-white p-2 rounded border border-gray-200">
                                            <div className="font-mono text-gray-600">16:00 - 18:00</div>
                                            <div className="font-bold text-gray-500">Standby</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Manual Intensities (Visible in Manual Mode) */}
                            {settings?.mode === 'manual' && (
                                <div className="border-t border-black/5 pt-4">
                                    <label className="text-xs text-[var(--foreground)] opacity-70 block mb-3 font-bold uppercase">Manual Intensities</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-xs text-[var(--foreground)] opacity-70 block mb-1">ON Duration (s)</label>
                                            <input
                                                type="number"
                                                value={settings?.co2_on_duration || 0}
                                                onChange={(e) => updateSetting('co2_on_duration', parseInt(e.target.value))}
                                                className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-[var(--foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--navbar)]"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-[var(--foreground)] opacity-70 block mb-1">OFF Interval (s)</label>
                                            <input
                                                type="number"
                                                value={settings?.co2_off_interval || 0}
                                                onChange={(e) => updateSetting('co2_off_interval', parseInt(e.target.value))}
                                                className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-[var(--foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--navbar)]"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Kill Logic */}
                    <div className="p-4 rounded-lg bg-white/40 border border-white/40">
                        <span className="text-sm font-bold text-[var(--table-heading)] block mb-4">Detection Response</span>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-[var(--foreground)] opacity-70 block mb-1">Net Zap Duration (s)</label>
                                <input
                                    type="number"
                                    value={settings?.net_duration || 0}
                                    onChange={(e) => updateSetting('net_duration', parseInt(e.target.value))}
                                    className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-[var(--foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--navbar)]"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-[var(--foreground)] opacity-70 block mb-1">Fan Eject Duration (s)</label>
                                <input
                                    type="number"
                                    value={settings?.fan_duration || 0}
                                    onChange={(e) => updateSetting('fan_duration', parseInt(e.target.value))}
                                    className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-[var(--foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--navbar)]"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ControlButton = ({ label, icon, active, onClick, disabled, color }) => {
    // Adjusted for light theme compatibility but keeping distinct colors
    const colorStyles = {
        blue: active ? "bg-blue-600 text-white border-blue-500 shadow-md ring-2 ring-blue-300" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-sm",
        red: active ? "bg-red-600 text-white border-red-500 shadow-md ring-2 ring-red-300" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-sm",
        purple: active ? "bg-purple-600 text-white border-purple-500 shadow-md ring-2 ring-purple-300" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-sm",
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={cn(
                "relative group p-4 rounded-xl border transition-all duration-300 flex flex-col items-center justify-center gap-3",
                colorStyles[color],
                disabled && "opacity-50 cursor-not-allowed grayscale",
            )}
        >
            <div className={cn("p-2 rounded-full transition-transform group-hover:scale-110", active ? "bg-white/20" : "bg-gray-100")}>
                {icon}
            </div>
            <span className="text-sm font-bold">{label}</span>
        </button>
    )
}
