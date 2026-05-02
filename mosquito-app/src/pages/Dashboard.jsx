import React from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/Layout/DashboardLayout';
import StatCard from '../components/Dashboard/StatCard';
import HeatmapSection from '../components/Dashboard/HeatmapSection';

import ForecastChart from '../components/Dashboard/ForecastChart';
import UploadHealthDataModal from './UploadHealthDataModal';

import { CloudUpload, Search, Zap, Info, Activity, Map as MapIcon, Calendar, Filter } from 'lucide-react';
import riskForecastImage from '../assets/images/risk-forecast.png';
import uploadHealthDataImage from '../assets/images/upload-health-data.png';

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5002/api';

const Dashboard = () => {
    const navigate = useNavigate();
    const [showUploadModal, setShowUploadModal] = React.useState(false);
    const [stats, setStats] = React.useState(null);
    const [statsLoading, setStatsLoading] = React.useState(true);

    const fetchStats = async () => {
        try {
            const res = await fetch(`${BASE}/heatmap/dashboard-stats`);
            const data = await res.json();
            if (data.success) { setStats(data.data); }
        } catch (e) { }
        setStatsLoading(false);
    };

    const [mapDistrict, setMapDistrict] = React.useState('All');
    const [forecastDistrict, setForecastDistrict] = React.useState('COLOMBO');
    
    const DISTRICTS = [
        'COLOMBO', 'GAMPAHA', 'KALUTHARA', 'KANDY', 'GALLE', 'MATARA',
        'HAMBANTHOTA', 'JAFFNA', 'AMPARA', 'TRINCOMALEE', 'BATTICALOA',
        'KALMUNAI', 'RATNAPURA', 'KEGALLE', 'KURUNAGALA', 'PUTTALAM',
        'ANURADHAPURA', 'POLONNARUWA', 'BADULLA', 'MONARAGALA',
        'NUWARA ELIYA', 'MATALE', 'MANNAR', 'VAVUNIYA', 'KILINOCHCHI', 'MULAITIVU'
    ];

    React.useEffect(() => { fetchStats(); }, [showUploadModal]);

    return (
        <DashboardLayout title="Operational Dashboard" hideHeaderTitle hideHeaderDateTime>
            <div className="flex flex-col gap-8 max-w-[1800px] mx-auto px-6 pb-20">
                
                {/* --- Header --- */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mt-2">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-[#2F6A5F] rounded-xl text-white shadow-lg shadow-[#2F6A5F]/20">
                                <Activity size={20} />
                            </div>
                            <h1 className="text-2xl font-black text-[#1A3D37] tracking-tight uppercase">Operational Overview</h1>
                        </div>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-[0.2em] ml-11">Surveillance Network Status: <span className="text-green-500">Active</span></p>
                    </div>
                    <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-gray-100 shadow-sm">
                        <Calendar size={16} className="text-[#2F6A5F]" />
                        <span className="text-[11px] font-black text-[#1A3D37] uppercase tracking-widest">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                </div>

                {/* --- Performance Grid --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title="Today's Caseload" value={statsLoading ? '—' : (stats?.todayCases ?? 0)} trend="up" trendValue={statsLoading ? '—' : (stats?.weekChange ?? 0) + '%'} trendLabel="vs last week" onClick={() => navigate('/map')} loading={statsLoading} />
                    <StatCard title="Weekly Cumulative" value={statsLoading ? '—' : (stats?.thisWeekCases ?? 0)} trend={stats?.weekChange >= 0 ? 'up' : 'down'} trendValue={statsLoading ? '—' : (stats?.weekChange ?? 0) + '%'} trendLabel="vs last week" onClick={() => navigate('/reports')} loading={statsLoading} />
                    <StatCard title="Transmission Clusters" value={statsLoading ? '—' : (stats?.activeOutbreaks ?? 0)} trend="down" trendValue="-1.2%" trendLabel="active threat" onClick={() => navigate('/map')} loading={statsLoading} />
                    <StatCard title="Total Fatalities" value={statsLoading ? '—' : (stats?.totalDeaths ?? 0)} trend="down" trendValue="Sri Lanka" trendLabel="all time" onClick={() => navigate('/reports')} loading={statsLoading} />
                </div>

                {/* --- Main Command Center --- */}
                <div className="bg-white rounded-[2.5rem] shadow-2xl border border-white/40 overflow-hidden flex flex-col lg:flex-row min-h-[700px]">
                    
                    {/* Left: Map Intelligence */}
                    <div className="flex-1 p-10 relative flex flex-col gap-6 bg-gray-50/30">
                        <div className="flex items-center justify-between relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#2F6A5F] shadow-sm border border-gray-100">
                                    <MapIcon size={24} />
                                </div>
                                <div>
                                    <h3 className="text-[#1A3D37] font-black text-lg tracking-tight uppercase">Geospatial Intelligence</h3>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Live Risk Density Mapping</p>
                                </div>
                            </div>

                            {/* MAP FILTER */}
                            <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl border border-gray-200 shadow-sm">
                                <div className="p-2 bg-gray-50 rounded-xl text-gray-400">
                                    <Filter size={14} />
                                </div>
                                <div className="flex flex-col pr-4">
                                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Filter Region</span>
                                    <select
                                        value={mapDistrict}
                                        onChange={(e) => setMapDistrict(e.target.value)}
                                        className="bg-transparent text-[11px] font-black text-[#1A3D37] outline-none cursor-pointer uppercase"
                                    >
                                        <option value="All">All Districts</option>
                                        {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Contained Map Box */}
                        <div className="flex-1 bg-white rounded-[2rem] overflow-hidden border-4 border-white shadow-2xl relative group">
                            <HeatmapSection selectedDistrict={mapDistrict} />
                        </div>
                    </div>

                    {/* Right: Analytical Intelligence */}
                    <div className="lg:w-[520px] bg-white border-l border-gray-100 p-10 flex flex-col gap-8">
                        
                        {/* Control Operations */}
                        <div className="flex flex-col gap-4">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Rapid Response Hub</p>
                            <div className="grid grid-cols-2 gap-4">
                                <button onClick={() => setShowUploadModal(true)} className="flex flex-col items-start gap-4 bg-gray-50/50 p-5 rounded-[2rem] border border-gray-100 hover:border-[#2F6A5F]/30 hover:bg-white hover:shadow-xl transition-all group">
                                    <div className="w-10 h-10 rounded-2xl bg-[#2F6A5F] text-white flex items-center justify-center shadow-lg shadow-[#2F6A5F]/20">
                                        <CloudUpload size={18} />
                                    </div>
                                    <div className="space-y-0.5 text-left">
                                        <span className="block text-[11px] font-black text-[#1A3D37] uppercase tracking-tight">Sync Health Data</span>
                                        <span className="block text-[9px] text-gray-400 font-bold uppercase tracking-widest leading-none">Manual Integration</span>
                                    </div>
                                </button>
                                <button onClick={() => navigate('/map')} className="flex flex-col items-start gap-4 bg-gray-50/50 p-5 rounded-[2rem] border border-gray-100 hover:border-blue-200 hover:bg-white hover:shadow-xl transition-all group">
                                    <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
                                        <Search size={18} />
                                    </div>
                                    <div className="space-y-0.5 text-left">
                                        <span className="block text-[11px] font-black text-[#1A3D37] uppercase tracking-tight">Risk Analytics</span>
                                        <span className="block text-[9px] text-gray-400 font-bold uppercase tracking-widest meta-none">Deep Scan</span>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Intelligence Panel */}
                        <div className="flex-1 flex flex-col gap-6">
                            <div className="space-y-5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-700 text-white flex items-center justify-center shadow-xl shadow-blue-500/20">
                                            <Zap size={22} />
                                        </div>
                                        <div>
                                            <h3 className="text-[#1A3D37] font-black text-sm uppercase tracking-tight">Predictive Insights</h3>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">ML Forecast Engine</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col items-end">
                                        <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1 pr-1">Target District</label>
                                        <select
                                            value={forecastDistrict}
                                            onChange={(e) => setForecastDistrict(e.target.value)}
                                            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-xs font-black text-[#1A3D37] outline-none focus:ring-4 focus:ring-[#2F6A5F]/5 focus:border-[#2F6A5F]/20 transition-all appearance-none cursor-pointer text-right min-w-[140px]"
                                        >
                                            {DISTRICTS.map(d => (
                                                <option key={d} value={d}>{d}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="bg-gray-50/30 p-6 rounded-[2.5rem] border border-gray-100/50 shadow-inner">
                                    <div className="h-[320px] flex flex-col">
                                        <ForecastChart district={forecastDistrict} />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-auto p-6 bg-gradient-to-br from-[#1A3D37] to-[#2F6A5F] rounded-[2rem] text-white relative overflow-hidden shadow-2xl shadow-[#2F6A5F]/30 group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-white/10 transition-colors"></div>
                                <div className="relative z-10 flex flex-col gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-white/10 rounded-lg">
                                            <Info size={14} className="text-green-400" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Strategy Advisory</span>
                                    </div>
                                    <p className="text-[11px] font-medium leading-relaxed text-white/80 tracking-tight">
                                        High probability of transmission surge in <span className="text-white font-black">{forecastDistrict}</span>. Recommend immediate source reduction protocols.
                                    </p>
                                    <button onClick={() => navigate('/alerts')} className="mt-2 w-full py-3 bg-white text-[#1A3D37] rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#EEF7F4] transition-all shadow-lg">
                                        Execute Protocols
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Modals */}
            {showUploadModal && <UploadHealthDataModal onClose={() => setShowUploadModal(false)} />}
        </DashboardLayout>
    );
};

export default Dashboard;
