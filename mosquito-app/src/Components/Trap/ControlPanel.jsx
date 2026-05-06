import React, { useState, useEffect } from 'react';
import { cn } from "../../lib/utils";
import { Fan, Zap, Wind, ShieldAlert, Clock } from 'lucide-react';
import { api } from "../../lib/api";

export const ControlPanel = ({ className }) => {
    const [loading, setLoading] = useState(false);
    // mode is kept SEPARATE so fetchSettings never overwrites the user's choice
    const [mode, setModeState] = useState('auto');
    const [settings, setSettings] = useState({
        co2_enabled: true,
        co2_on_duration: 0,
        co2_off_interval: 60,
        net_duration: 5,
        fan_duration: 0,
        confidence_threshold: 0.5
    });

    // Component on/off states
    const [fanState, setFanState] = useState(false);
    const [netState, setNetState] = useState(false);
    const [valveState, setValveState] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const s = await api.getSettings();
            // Only sync non-mode settings — mode is controlled by the user buttons only
            const { mode: _ignore, ...rest } = s;
            setSettings(prev => ({ ...prev, ...rest }));
        } catch (e) {
            console.error("Using default settings (backend unavailable):", e);
        }
    }

    const toggleComponent = async (component, currentState, setter) => {
        // Update UI immediately — don't wait for API
        setter(!currentState);
        setLoading(true);
        try {
            const action = currentState ? "off" : "on";
            await api.controlComponent(component, action);
        } catch (error) {
            // Log error but keep UI state — don't block the user
            console.error(`Failed to send ${component} command to Pi:`, error);
        } finally {
            setLoading(false);
        }
    };

    const setMode = async (newMode) => {
        // Update mode state immediately — fully independent from settings
        setModeState(newMode);
        try {
            await api.updateSettings({ mode: newMode });
        } catch (e) {
            console.error("Settings API failed (UI already updated):", e);
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
        if (mode !== 'auto') return;

        const checkTimeAndAdjust = () => {
            const now = new Date();
            const hour = now.getHours();

            // Define Time Periods (24h logical coverage)
            const isPeakTime = (hour >= 5 && hour < 8) || (hour >= 17 && hour < 20); // 5 AM - 8 AM and 5 PM - 8 PM
            const isNight = hour >= 20 || hour < 5; // 8 PM to 5 AM

            // Define Release Strategies
            const peakSettings = {
                co2_on_duration: 30,
                co2_off_interval: 5,
                fan_duration: 120
            };
            const nightSettings = {
                co2_on_duration: 15,
                co2_off_interval: 15,
                fan_duration: 60
            };
            const standbySettings = {
                co2_on_duration: 0,
                co2_off_interval: 60,
                fan_duration: 0
            };

            let targetSettings = standbySettings;
            if (isPeakTime) targetSettings = peakSettings;
            else if (isNight) targetSettings = nightSettings;

            if (settings.co2_on_duration !== targetSettings.co2_on_duration ||
                settings.fan_duration !== targetSettings.fan_duration ||
                settings.co2_off_interval !== targetSettings.co2_off_interval) {
                setSettings(prev => ({ ...prev, ...targetSettings }));
                api.updateSettings(targetSettings).catch(e => console.error("Auto sync failed:", e));
            }
        };

        checkTimeAndAdjust();
        const timer = setInterval(checkTimeAndAdjust, 10000); // Check every 10s
        return () => clearInterval(timer);
    }, [mode]);

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
                    <div className="flex p-1 bg-gray-100 border border-gray-200 rounded-full">
                        <button
                            onClick={() => {
                                setModeState('auto');
                                api.updateSettings({ mode: 'auto' }).catch(() => {});
                            }}
                            className={cn(
                                "px-6 py-2 text-sm font-bold rounded-full transition-all uppercase tracking-wide",
                                mode === "auto"
                                    ? "bg-emerald-500 text-white shadow-md"
                                    : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            AUTO MODE
                        </button>
                        <button
                            onClick={() => {
                                setModeState('manual');
                                api.updateSettings({ mode: 'manual' }).catch(() => {});
                            }}
                            className={cn(
                                "px-6 py-2 text-sm font-bold rounded-full transition-all uppercase tracking-wide",
                                mode === "manual"
                                    ? "bg-emerald-500 text-white shadow-md"
                                    : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            MANUAL MODE
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <ControlButton
                        label="Ejection Fans"
                        icon={<Fan className={cn("w-6 h-6", fanState && "animate-spin")} />}
                        active={fanState}
                        onClick={() => toggleComponent('fan', fanState, setFanState)}
                        disabled={mode === 'auto'}
                        color="blue"
                    />
                    <ControlButton
                        label="Electric Net"
                        icon={<Zap className="w-6 h-6" />}
                        active={netState}
                        onClick={() => toggleComponent('net', netState, setNetState)}
                        disabled={mode === 'auto'}
                        color="red"
                    />
                    <ControlButton
                        label="CO₂ Valve"
                        icon={<Wind className="w-6 h-6" />}
                        active={valveState}
                        onClick={() => toggleComponent('valve', valveState, setValveState)}
                        disabled={mode === 'auto'}
                        color="purple"
                    />
                    <div className="flex flex-col items-center justify-center p-4 text-center border shadow-sm bg-white/40 rounded-xl border-white/50">
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
                <div className="grid grid-cols-1 gap-6 md:grid-cols-1">
                    {/* CO2 Logic */}
                    <div className="p-4 border rounded-lg bg-white/40 border-white/40">
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
                            {mode === 'auto' && (
                                <div className="p-3 rounded-lg bg-white/50">
                                    <label className="text-xs text-[var(--foreground)] opacity-70 block mb-2 font-bold uppercase">Schedule Configuration</label>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between p-2 text-xs bg-white border rounded border-emerald-100">
                                            <div className="font-mono text-gray-600">05:00 AM - 08:00 AM</div>
                                            <div className="font-bold text-emerald-600">100% Release</div>
                                        </div>
                                        <div className="flex items-center justify-between p-2 text-xs bg-white border border-gray-200 rounded">
                                            <div className="font-mono text-gray-600">08:00 AM - 05:00 PM</div>
                                            <div className="font-bold text-gray-500">Standby</div>
                                        </div>
                                        <div className="flex items-center justify-between p-2 text-xs bg-white border rounded border-emerald-100">
                                            <div className="font-mono text-gray-600">05:00 PM - 08:00 PM</div>
                                            <div className="font-bold text-emerald-600">100% Release</div>
                                        </div>
                                        <div className="flex items-center justify-between p-2 text-xs bg-white border border-blue-100 rounded">
                                            <div className="font-mono text-gray-600">08:00 PM - 05:00 AM</div>
                                            <div className="font-bold text-blue-600">50% Release</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Manual Intensities (Visible in Manual Mode) */}
                            {mode === 'manual' && (
                                <div className="pt-4 border-t border-black/5">
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