import React, { useState } from 'react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import SriLankaMap from '../components/Dashboard/SriLankaMap';
import districtData from '/src/assets/data/sri-lanka-districts.json';
import {
    Locate2,
    Filter,
    Layers,
    Info,
    Navigation2,
    Search,
    HeartPulse,
    AlertTriangle,
    Activity
} from 'lucide-react';
import clsx from 'clsx';

const Map = () => {
    const [selectedDistrict, setSelectedDistrict] = useState('All');
    const [viewMode, setViewMode] = useState('Health Facilities');

    const districts = ['All', ...districtData.features.map(feature => feature.properties.shapeName).sort()];

    const mapStats = [
        { label: 'Total Facilities', value: '42', icon: HeartPulse, color: 'text-blue-500', bg: 'bg-blue-50' },
        { label: 'High Risk Zones', value: '08', icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50' },
        { label: 'Active Reporting', value: '92%', icon: Activity, color: 'text-green-500', bg: 'bg-green-50' },
    ];

    const modes = ['Health Facilities', 'Outbreak Clusters', 'Risk Risk Heatmap'];

    return (
        <DashboardLayout title="Health Spatial Analytics">
            <div className="flex h-[calc(100vh-200px)] gap-6">

                {/* Sidebar Controls */}
                <div className="w-72 flex flex-col gap-6">
                    {/* Stats */}
                    <div className="grid grid-cols-1 gap-3">
                        {mapStats.map(stat => (
                            <div key={stat.label} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
                                <div className={clsx("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", stat.bg, stat.color)}>
                                    <stat.icon size={18} />
                                </div>
                                <div>
                                    <div className="text-[9px] uppercase tracking-wider text-gray-400 font-extrabold">{stat.label}</div>
                                    <div className="text-lg font-extrabold text-gray-800 leading-tight">{stat.value}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Filter Panel */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex-1 overflow-y-auto">
                        <div className="flex items-center gap-2 mb-4">
                            <Filter size={14} className="text-[#2F6A5F]" />
                            <h3 className="text-[10px] font-bold text-gray-800 uppercase tracking-widest">Map Filters</h3>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-[9px] font-bold text-gray-400 uppercase mb-2 block tracking-wider">District Filter</label>
                                <select
                                    value={selectedDistrict}
                                    onChange={(e) => setSelectedDistrict(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-1.5 text-[10px] font-bold text-gray-600 outline-none focus:ring-2 focus:ring-[#2F6A5F]/20"
                                >
                                    {districts.map(d => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-[9px] font-bold text-gray-400 uppercase mb-2 block tracking-wider">Overlay Layer</label>
                                <div className="space-y-1.5">
                                    {modes.map(mode => (
                                        <button
                                            key={mode}
                                            onClick={() => setViewMode(mode)}
                                            className={clsx(
                                                "w-full text-left px-3 py-2 rounded-lg text-[10px] font-bold transition-all flex items-center justify-between uppercase tracking-tight",
                                                viewMode === mode
                                                    ? "bg-[#2F6A5F] text-white shadow-md shadow-[#2F6A5F]/20"
                                                    : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                                            )}
                                        >
                                            {mode}
                                            {viewMode === mode && <Locate2 size={14} />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-50">
                            <div className="flex items-center gap-2 mb-3 text-gray-400">
                                <Info size={14} />
                                <span className="text-[10px] font-bold uppercase">Legend</span>
                            </div>
                            <div className="space-y-2.5">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">High Risk Zone</span>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">Health Facility</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Map Display */}
                <div className="flex-1 bg-white rounded-3xl border border-gray-100 shadow-xl relative overflow-hidden group">
                    <SriLankaMap selectedDistrict={selectedDistrict} />

                    {/* Floating Controls */}
                    <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                        <button className="w-8 h-8 rounded-lg bg-white shadow-lg flex items-center justify-center text-gray-600 hover:text-[#2F6A5F] border border-gray-100 transition-all">
                            <Layers size={16} />
                        </button>
                        <button className="w-8 h-8 rounded-lg bg-white shadow-lg flex items-center justify-center text-gray-600 hover:text-[#2F6A5F] border border-gray-100 transition-all">
                            <Navigation2 size={16} />
                        </button>
                    </div>

                    <div className="absolute top-4 right-4">
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search location..."
                                className="pl-9 pr-4 py-2 rounded-lg bg-white/90 backdrop-blur shadow-lg border border-white text-[10px] font-bold outline-none w-56 focus:ring-2 focus:ring-[#2F6A5F]/20"
                            />
                        </div>
                    </div>

                    <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur px-3 py-2.5 rounded-xl shadow-lg border border-white max-w-[200px] transition-opacity duration-300 group-hover:opacity-100 opacity-60">
                        <h4 className="text-[10px] font-bold text-gray-800 mb-0.5 uppercase tracking-tight">Colombo Overview</h4>
                        <p className="text-[9px] font-medium text-gray-500 leading-tight">12 facilities reporting high activity. Outbreak identified in suburbs.</p>
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
};

export default Map;
