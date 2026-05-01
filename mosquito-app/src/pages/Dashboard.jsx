import React from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/Layout/DashboardLayout';
import StatCard from '../components/Dashboard/StatCard';
import ActionCard from '../components/Dashboard/ActionCard';
import HeatmapSection from '../components/Dashboard/HeatmapSection';
import TrendChart from '../components/Dashboard/TrendChart';
import AlertsList from '../components/Dashboard/AlertsList';
import ForecastChart from '../components/Dashboard/ForecastChart';
import UploadHealthDataModal from './UploadHealthDataModal';

import { CloudUpload, Search, ShieldCheck, Database, Zap, Activity, Info } from 'lucide-react';
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

    const [systemStatus, setSystemStatus] = React.useState({
        sync: 'Stable',
        api: 'Checking...',
        encryption: 'Active',
        lastChecked: 'Never'
    });

    const [forecastDistrict, setForecastDistrict] = React.useState('COLOMBO');
    const DISTRICTS = [
        'COLOMBO', 'GAMPAHA', 'KALUTHARA', 'KANDY', 'GALLE', 'MATARA',
        'HAMBANTHOTA', 'JAFFNA', 'AMPARA', 'TRINCOMALEE', 'BATTICALOA',
        'KALMUNAI', 'RATNAPURA', 'KEGALLE', 'KURUNAGALA', 'PUTTALAM',
        'ANURADHAPURA', 'POLONNARUWA', 'BADULLA', 'MONARAGALA',
        'NUWARA ELIYA', 'MATALE', 'MANNAR', 'VAVUNIYA', 'KILINOCHCHI', 'MULAITIVU'
    ];

    React.useEffect(() => {
        const checkHealth = async () => {
            try {
                const res = await fetch(`${BASE}/health`);
                const data = await res.json();
                if (data.status === "ok") {
                    setSystemStatus(prev => ({
                        ...prev,
                        api: 'Online',
                        lastChecked: new Date().toLocaleTimeString()
                    }));
                } else {
                    setSystemStatus(prev => ({ ...prev, api: 'Error' }));
                }
            } catch (error) {
                setSystemStatus(prev => ({ ...prev, api: 'Offline' }));
            }
        };

        checkHealth();
        const interval = setInterval(checkHealth, 30000);
        return () => clearInterval(interval);
    }, []);

    React.useEffect(() => { fetchStats(); }, [showUploadModal]);

    return (
        <DashboardLayout title="Dashboard">
            <div className="flex flex-col gap-6 max-w-[1600px] mx-auto px-2">

                {/* --- Row 1: Key Performance Metrics --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Today Cases"
                        value={statsLoading ? '—' : (stats?.todayCases ?? 0)}
                        trend="up"
                        trendValue={statsLoading ? '—' : (stats?.weekChange ?? 0) + '%'}
                        trendLabel="last week"
                        linkText="Open Live Map"
                        onClick={() => navigate('/map')}
                        loading={statsLoading}
                    />
                    <StatCard
                        title="Weekly Total"
                        value={statsLoading ? '—' : (stats?.thisWeekCases ?? 0)}
                        trend={stats?.weekChange >= 0 ? 'up' : 'down'}
                        trendValue={statsLoading ? '—' : (stats?.weekChange ?? 0) + '%'}
                        trendLabel="last week"
                        linkText="Download Report"
                        onClick={() => navigate('/reports')}
                        loading={statsLoading}
                    />
                    <StatCard
                        title="Active Clusters"
                        value={statsLoading ? '—' : (stats?.activeOutbreaks ?? 0)}
                        trend="down"
                        trendValue="-1%"
                        trendLabel="from peak"
                        linkText="View Hotspots"
                        onClick={() => navigate('/map')}
                        loading={statsLoading}
                    />
                    <StatCard
                        title="Total Deaths"
                        value={statsLoading ? '—' : (stats?.totalDeaths ?? 0)}
                        trend="down"
                        trendValue="Sri Lanka"
                        trendLabel="all time"
                        linkText="View Reports"
                        onClick={() => navigate('/reports')}
                        loading={statsLoading}
                    />
                </div>

                {/* --- Row 2: Heatmap & Actions & System Status --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Map Section Wrapper */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-5 min-h-[500px] flex flex-col">
                        <HeatmapSection />
                    </div>

                    {/* Action Column */}
                    <div className="flex flex-col gap-6">
                        <div className="grid grid-cols-1 gap-4">
                            <ActionCard
                                icon={CloudUpload}
                                image={uploadHealthDataImage}
                                label="Upload Health Data"
                                color="bg-gray-50 border border-gray-100"
                                iconColor="text-[#2F6A5F]"
                                onClick={() => setShowUploadModal(true)}
                            />
                            <ActionCard
                                icon={Search}
                                image={riskForecastImage}
                                label="View Risk Forecast"
                                color="bg-blue-50/50 border border-blue-100"
                                iconColor="text-blue-500"
                                onClick={() => navigate('/map')}
                            />
                        </div>

                        {/* Integrated Status Widget Card */}
                        <div className="bg-[#DDEDE7] rounded-xl p-5 shadow-sm flex flex-col justify-between flex-1 border border-[#2F6A5F]/5">
                            <div className="flex items-center justify-between border-b border-[#2F6A5F]/10 pb-3 mb-4">
                                <h4 className="text-[10px] font-extrabold text-[#2F6A5F] uppercase tracking-widest flex items-center gap-2">
                                    <ShieldCheck size={14} /> Live System Infrastructure
                                </h4>
                                <div className="flex gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#2F6A5F] animate-pulse"></div>
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#2F6A5F]/20"></div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-2.5 bg-white/50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#2F6A5F] shadow-sm">
                                            <Zap size={14} />
                                        </div>
                                        <span className="text-[#2F6A5F]/70 font-bold uppercase text-[10px] tracking-wider">Data Pipeline</span>
                                    </div>
                                    <span className="text-[#2F6A5F] font-black text-[10px] bg-white px-2 py-1 rounded-md uppercase tracking-wider shadow-sm">{systemStatus.sync}</span>
                                </div>

                                <div className="flex justify-between items-center p-2.5 bg-white/50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#2F6A5F] shadow-sm">
                                            <Database size={14} />
                                        </div>
                                        <span className="text-[#2F6A5F]/70 font-bold uppercase text-[10px] tracking-wider">Gateway API</span>
                                    </div>
                                    <span className={`font-black text-[10px] bg-white px-2 py-1 rounded-md uppercase tracking-wider shadow-sm ${systemStatus.api === 'Online' ? 'text-[#2F6A5F]' : 'text-red-500'}`}>
                                        {systemStatus.api}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center p-2.5 bg-white/50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#2F6A5F] shadow-sm">
                                            <ShieldCheck size={14} />
                                        </div>
                                        <span className="text-[#2F6A5F]/70 font-bold uppercase text-[10px] tracking-wider">RSA-256 Auth</span>
                                    </div>
                                    <span className="text-[#2F6A5F] font-black text-[10px] bg-white px-2 py-1 rounded-md uppercase tracking-wider shadow-sm">{systemStatus.encryption}</span>
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-[#2F6A5F]/10 flex items-center gap-2">
                                <Activity size={12} className="text-[#2F6A5F]/40" />
                                <span className="text-[9px] font-bold text-[#2F6A5F]/50 uppercase tracking-tighter">Backend Heartbeat: {systemStatus.lastChecked}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- Row 3: ML Forecast & Alerts --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Forecast Chart Card */}
                    <div className="lg:col-span-2 bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                    <Zap size={20} />
                                </div>
                                <div>
                                    <h3 className="text-gray-900 font-extrabold text-sm uppercase tracking-tight leading-none mb-1">AI Risk Projection</h3>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none">XGBoost ML Algorithm</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 bg-gray-50 p-1.5 rounded-xl border border-gray-100">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">Focus District:</span>
                                <select
                                    value={forecastDistrict}
                                    onChange={(e) => setForecastDistrict(e.target.value)}
                                    className="bg-white border border-gray-100 rounded-lg px-3 py-1.5 text-[11px] font-bold text-gray-700 outline-none focus:ring-2 focus:ring-[#2F6A5F]/20 shadow-sm"
                                >
                                    {DISTRICTS.map(d => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="flex-1 bg-gray-50/30 rounded-xl p-4 min-h-[300px]">
                            <ForecastChart district={forecastDistrict} />
                        </div>
                    </div>

                    {/* Alerts Card Wrapper */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
                        <AlertsList />
                        <div className="p-5 border-t border-gray-50 mt-auto">
                            <button onClick={() => navigate('/alerts')} className="w-full py-3 bg-gray-50 text-gray-500 text-[10px] font-extrabold uppercase tracking-[0.2em] rounded-xl border border-gray-100 hover:bg-gray-100 transition-all">
                                View All System Alerts
                            </button>
                        </div>
                    </div>
                </div>

                {/* --- Row 4: Detailed Trends --- */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 overflow-hidden">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <Activity size={24} />
                        </div>
                        <div>
                            <h3 className="text-gray-900 font-extrabold text-lg tracking-tight">Disease Temporal Trends</h3>
                            <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">Comparing Active, Recovered, and New Cases</p>
                        </div>
                    </div>
                    <div className="h-[400px]">
                        <TrendChart />
                    </div>
                </div>

            </div>

            {/* Modals */}
            {showUploadModal && <UploadHealthDataModal onClose={() => setShowUploadModal(false)} />}
        </DashboardLayout>
    );
};

export default Dashboard;
