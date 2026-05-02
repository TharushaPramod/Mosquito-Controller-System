import React, { useState } from 'react';
import DashboardLayout from '../Components/Layout/DashboardLayout';
import SriLankaMap from '../Components/Dashboard/SriLankaMap';
import ForecastMap from '../Components/Dashboard/ForecastMap'; // ← NEW
import districtData from '/src/assets/data/sri-lanka-districts.json';
import {
    Locate,
    Filter,
    Layers,
    Info,
    Navigation2,
    Search,
    HeartPulse,
    AlertTriangle,
    Activity,
    BrainCircuit,
    Sparkles,
    ChevronRight,
    Zap
} from 'lucide-react';
import clsx from 'clsx';

const Map = () => {
    const [selectedDistrict, setSelectedDistrict] = useState('All');
    const [viewMode, setViewMode] = useState('Health Facilities');

    const districts = ['All', ...districtData.features.map(feature => feature.properties.shapeName).sort()];

    // ── NEW: show/hide ML risk overlay ──
    const [showForecastOverlay, setShowForecastOverlay] = useState(false);

    const mapStats = [
        { label: 'Total Facilities', value: '42', icon: HeartPulse, color: 'text-blue-500', bg: 'bg-blue-50' },
        { label: 'High Risk Zones', value: '08', icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50' },
        { label: 'Active Reporting', value: '92%', icon: Activity, color: 'text-green-500', bg: 'bg-green-50' },
    ];

    const modes = ['Health Facilities', 'Outbreak Clusters', 'Risk Risk Heatmap'];

    return (
        <DashboardLayout title="Health Spatial Analytics">
            <div className="flex flex-col gap-6">

                {/* Top Control Bar — Compact Flex Layout */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-xl p-3 flex items-center justify-between gap-4 overflow-hidden">

                    {/* Section 1: Quick Stats — Grid for better wrapping */}
                    <div className="hidden xl:flex items-center gap-4 border-r border-gray-100 pr-4 shrink-0">
                        {mapStats.map(stat => (
                            <div key={stat.label} className="flex items-center gap-2">
                                <div className={clsx("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", stat.bg, stat.color)}>
                                    <stat.icon size={14} />
                                </div>
                                <div>
                                    <div className="text-[7px] uppercase tracking-widest text-gray-400 font-extrabold">{stat.label}</div>
                                    <div className="text-[11px] font-black text-[#1A3D37]">{stat.value}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Section 2: Primary Filters — Flexible width */}
                    <div className="flex flex-1 items-center gap-4 min-w-0">
                        <div className="flex-1 min-w-[120px]">
                            <label className="text-[7px] font-black text-gray-400 uppercase tracking-widest mb-1 block">District</label>
                            <select
                                value={selectedDistrict}
                                onChange={(e) => setSelectedDistrict(e.target.value)}
                                className="w-full bg-gray-50/80 border border-gray-100 rounded-lg px-2 py-1.5 text-[10px] font-bold text-gray-700 outline-none focus:ring-2 focus:ring-[#2F6A5F]/20 focus:bg-white transition-all appearance-none cursor-pointer"
                                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' fill='none' stroke='%239CA3AF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m4 6 4 4 4-4'/%3E%3C/svg%3E")`, backgroundPosition: 'right 8px center', backgroundRepeat: 'no-repeat' }}
                            >
                                {districts.map(d => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex-1 min-w-[150px]">
                            <label className="text-[7px] font-black text-gray-400 uppercase tracking-widest mb-1 block">View Layer</label>
                            <div className="flex bg-gray-50 p-0.5 rounded-lg border border-gray-100">
                                {modes.map(mode => (
                                    <button
                                        key={mode}
                                        onClick={() => setViewMode(mode)}
                                        className={clsx(
                                            "flex-1 px-2 py-1 rounded-md text-[8px] font-black transition-all uppercase tracking-tighter whitespace-nowrap",
                                            viewMode === mode
                                                ? "bg-[#1A3D37] text-white shadow-sm"
                                                : "text-gray-400 hover:text-gray-600"
                                        )}
                                    >
                                        {mode.split(' ')[0]}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Section 3: ML Toggle — Compact but Highlighted */}
                    <div className="pl-4 border-l border-gray-100 shrink-0">
                        <button
                            onClick={() => setShowForecastOverlay(v => !v)}
                            className={clsx(
                                "flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-500 border group h-[42px]",
                                showForecastOverlay
                                    ? "bg-orange-500 border-orange-400 text-white shadow-md shadow-orange-100"
                                    : "bg-white border-gray-200 text-gray-600 hover:border-orange-200"
                            )}
                        >
                            <BrainCircuit size={16} className={showForecastOverlay ? "text-white" : "text-orange-500"} />
                            <div className="text-left hidden sm:block">
                                <div className="text-[8px] font-black uppercase tracking-widest leading-none mb-0.5">ML Forecast</div>
                                <div className={clsx("text-[7px] font-bold uppercase tracking-tighter", showForecastOverlay ? "text-orange-100" : "text-gray-400")}>
                                    {showForecastOverlay ? 'ACTIVE' : 'OFFLINE'}
                                </div>
                            </div>
                            <div className={clsx(
                                "w-1 h-1 rounded-full",
                                showForecastOverlay ? "bg-white animate-pulse" : "bg-gray-200"
                            )} />
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex gap-6 h-[calc(100vh-180px)]">

                    {/* Map Display — Now occupies full width */}
                    <div className="flex-1 bg-white rounded-3xl border border-gray-100 shadow-xl relative overflow-hidden group">
                        <SriLankaMap selectedDistrict={selectedDistrict} />

                        {/* Floating Controls */}
                        <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-20">
                            <button className="w-8 h-8 rounded-lg bg-white shadow-lg flex items-center justify-center text-gray-600 hover:text-[#2F6A5F] border border-gray-100 transition-all">
                                <Layers size={16} />
                            </button>
                            <button className="w-8 h-8 rounded-lg bg-white shadow-lg flex items-center justify-center text-gray-600 hover:text-[#2F6A5F] border border-gray-100 transition-all">
                                <Navigation2 size={16} />
                            </button>
                        </div>

                        <div className="absolute top-4 right-4 z-20">
                            <div className="relative">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search location..."
                                    className="pl-9 pr-4 py-2 rounded-lg bg-white shadow-lg border border-white text-[10px] font-bold outline-none w-56 focus:ring-2 focus:ring-[#2F6A5F]/20"
                                />
                            </div>
                        </div>

                        {/* Info Tooltip */}
                        <div className="absolute bottom-6 right-6 bg-[#1A3D37] px-4 py-3 rounded-2xl shadow-2xl border border-white/10 max-w-[220px] z-20">
                            <div className="flex items-center gap-2 mb-1">
                                <Info size={12} className="text-green-400" />
                                <h4 className="text-[10px] font-black text-white uppercase tracking-widest">{selectedDistrict === 'All' ? 'Colombo' : selectedDistrict} Insights</h4>
                            </div>
                            <p className="text-[9px] font-medium text-gray-300 leading-tight">Elevated risk detected in southern clusters. 12 facilities active.</p>
                        </div>
                    </div>
                </div>

                {/* ── NEW: ML Forecast district grid (shown below map when toggled ON) ── */}
                {showForecastOverlay && (
                    <div>
                        <h3 className="text-sm font-bold text-[#1A3D37] mb-4 uppercase tracking-widest flex items-center gap-3">
                            <span className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-100">
                                <Sparkles size={16} />
                            </span>
                            XGBoost 2-Week Risk Forecast — All Districts
                        </h3>
                        <ForecastMap />
                    </div>
                )}

            </div>
        </DashboardLayout>
    );
};

export default Map;
