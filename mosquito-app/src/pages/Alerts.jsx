import React, { useState, useEffect } from 'react';
import DashboardLayout from '../Components/Layout/DashboardLayout';
import {
    AlertTriangle, Bell, Search, Filter, Calendar,
    ChevronRight, CheckCircle2, Info, AlertCircle, RefreshCw, Users
} from 'lucide-react';
import clsx from 'clsx';
import PHIAllocationPanel from './PHIAllocationPanel';

const BASE = import.meta.env.VITE_API_URL;

const AlertRow = ({ alert }) => {
    const getStatusStyles = (status) => {
        switch (status) {
            case 'Critical': return 'bg-red-50 text-red-600 border-red-100';
            case 'High': return 'bg-orange-50 text-orange-600 border-orange-100';
            case 'Medium': return 'bg-yellow-50 text-yellow-600 border-yellow-100';
            default: return 'bg-blue-50 text-blue-600 border-blue-100';
        }
    };

    const getIcon = (status) => {
        switch (status) {
            case 'Critical': return <AlertCircle size={16} />;
            case 'High': return <AlertTriangle size={16} />;
            case 'Medium': return <AlertTriangle size={16} />;
            default: return <Info size={16} />;
        }
    };

    return (
        <div className="bg-white rounded-xl border border-gray-100 p-3 flex items-center gap-5 hover:shadow-md transition-all group cursor-pointer">
            <div className={clsx("w-10 h-10 rounded-xl border flex items-center justify-center shrink-0", getStatusStyles(alert.severity))}>
                {getIcon(alert.severity)}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-0.5">
                    <h3 className="font-bold text-gray-800 text-xs truncate">{alert.title}</h3>
                    <span className={clsx("px-2 py-0.5 rounded-full text-[9px] font-bold uppercase shrink-0", getStatusStyles(alert.severity))}>
                        {alert.severity}
                    </span>
                </div>
                <p className="text-[11px] text-gray-500 line-clamp-1">{alert.description}</p>
            </div>
            <div className="flex flex-col items-end gap-0.5 shrink-0">
                <div className="flex items-center gap-1.5 text-gray-400 text-[9px]">
                    <Calendar size={10} />
                    <span>{alert.date}</span>
                </div>
                <div className="text-[9px] font-bold text-gray-400">{alert.time}</div>
            </div>
            <div className="pl-3 border-l border-gray-50 group-hover:translate-x-1 transition-transform">
                <ChevronRight size={16} className="text-gray-300" />
            </div>
        </div>
    );
};

const Alerts = () => {
    const [pageTab, setPageTab] = useState('alerts'); // 'alerts' | 'deployment'
    const [activeTab, setActiveTab] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [alertsData, setAlertsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastRefreshed, setLastRefreshed] = useState(null);

    const fetchAlerts = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${BASE}/alerts`);
            const data = await res.json();
            if (data.success) {
                setAlertsData(data.data);
                setLastRefreshed(new Date().toLocaleTimeString());
            } else {
                setError('Failed to load alerts');
            }
        } catch (e) {
            setError('Could not connect to backend');
        }
        setLoading(false);
    };

    // Fetch on mount, refresh every 60 seconds
    useEffect(() => {
        fetchAlerts();
        const interval = setInterval(fetchAlerts, 60000);
        return () => clearInterval(interval);
    }, []);

    const tabs = ['All', 'Outbreak', 'Facility', 'Prediction', 'System'];

    const filteredAlerts = alertsData.filter(alert => {
        const matchesTab = activeTab === 'All' || alert.type === activeTab;
        const matchesSearch = alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            alert.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTab && matchesSearch;
    });

    // Count by severity for summary
    const counts = { Critical: 0, High: 0, Medium: 0, Low: 0 };
    alertsData.forEach(a => { if (counts[a.severity] !== undefined) counts[a.severity]++; });

    return (
        <DashboardLayout title="Health Notifications & Alerts">
            <div className="flex flex-col gap-6 max-w-5xl mx-auto">

                {/* ── Page-level tab switcher ──────────────────────── */}
                <div className="flex items-center gap-2 bg-white rounded-2xl p-1.5 border border-gray-100 shadow-sm w-fit">
                    <button
                        onClick={() => setPageTab('alerts')}
                        className={clsx(
                            'flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-extrabold uppercase tracking-wider transition-all',
                            pageTab === 'alerts'
                                ? 'bg-[#2F6A5F] text-white shadow-md shadow-[#2F6A5F]/20'
                                : 'text-gray-400 hover:text-gray-600'
                        )}
                    >
                        <Bell size={13} />
                        Alerts
                    </button>
                    <button
                        onClick={() => setPageTab('deployment')}
                        className={clsx(
                            'flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-extrabold uppercase tracking-wider transition-all',
                            pageTab === 'deployment'
                                ? 'bg-[#2F6A5F] text-white shadow-md shadow-[#2F6A5F]/20'
                                : 'text-gray-400 hover:text-gray-600'
                        )}
                    >
                        <Users size={13} />
                        Field Deployment
                    </button>
                </div>

                {/* ── FIELD DEPLOYMENT tab ─────────────────────────── */}
                {pageTab === 'deployment' && (
                    <PHIAllocationPanel />
                )}

                {/* ── ALERTS tab ───────────────────────────────────── */}
                {pageTab === 'alerts' && (<>

                {/* Summary badges */}
                {!loading && alertsData.length > 0 && (
                    <div className="flex gap-3 flex-wrap">
                        {[
                            { label: 'Critical', color: 'bg-red-50 text-red-600 border-red-100' },
                            { label: 'High', color: 'bg-orange-50 text-orange-600 border-orange-100' },
                            { label: 'Medium', color: 'bg-yellow-50 text-yellow-600 border-yellow-100' },
                            { label: 'Low', color: 'bg-blue-50 text-blue-600 border-blue-100' },
                        ].map(({ label, color }) => counts[label] > 0 && (
                            <span key={label} className={clsx('px-3 py-1 rounded-full text-[10px] font-bold border', color)}>
                                {counts[label]} {label}
                            </span>
                        ))}
                        {lastRefreshed && (
                            <span className="ml-auto text-[10px] text-gray-400 flex items-center gap-1">
                                <RefreshCw size={10} /> Last updated: {lastRefreshed}
                            </span>
                        )}
                    </div>
                )}

                {/* Filter + Search row */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                        {tabs.map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={clsx(
                                    "px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider transition-all whitespace-nowrap",
                                    activeTab === tab
                                        ? "bg-[#2F6A5F] text-white shadow-md shadow-[#2F6A5F]/20"
                                        : "bg-white text-gray-400 hover:bg-gray-50 border border-gray-100"
                                )}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search alerts..."
                                className="pl-9 pr-4 py-1.5 rounded-lg bg-white border border-gray-100 text-[11px] font-medium outline-none focus:ring-2 focus:ring-[#2F6A5F]/20 focus:border-[#2F6A5F] transition-all w-full md:w-64"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={fetchAlerts}
                            title="Refresh alerts"
                            className="p-2 rounded-lg bg-white border border-gray-100 text-gray-400 hover:bg-gray-50 transition-all shadow-sm"
                        >
                            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>
                </div>

                {/* Alerts List */}
                <div className="flex flex-col gap-3">
                    {loading ? (
                        [...Array(4)].map((_, i) => (
                            <div key={i} className="bg-white rounded-xl border border-gray-100 p-3 flex items-center gap-5 animate-pulse">
                                <div className="w-10 h-10 rounded-xl bg-gray-100" />
                                <div className="flex-1">
                                    <div className="h-3 bg-gray-100 rounded w-48 mb-2" />
                                    <div className="h-2 bg-gray-50 rounded w-72" />
                                </div>
                            </div>
                        ))
                    ) : error ? (
                        <div className="bg-red-50 rounded-xl p-6 text-center border border-red-100">
                            <p className="text-red-500 text-sm font-semibold">{error}</p>
                            <button onClick={fetchAlerts} className="mt-3 text-xs text-red-400 underline">Try again</button>
                        </div>
                    ) : filteredAlerts.length > 0 ? (
                        filteredAlerts.map(alert => (
                            <AlertRow key={alert.id} alert={alert} />
                        ))
                    ) : (
                        <div className="bg-white rounded-2xl p-12 flex flex-col items-center justify-center border border-dashed border-gray-200 text-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
                                <Bell size={32} />
                            </div>
                            <h3 className="text-gray-800 font-bold mb-1">No alerts found</h3>
                            <p className="text-xs text-gray-500">Try adjusting your filters or search query.</p>
                        </div>
                    )}
                </div>

                {/* Mark all as read */}
                {!loading && filteredAlerts.length > 0 && (
                    <div className="flex justify-center mt-2">
                        <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white border border-gray-100 text-gray-500 font-bold text-[11px] hover:bg-gray-50 transition-all shadow-sm">
                            <CheckCircle2 size={14} className="text-green-500" />
                            Mark all as read
                        </button>
                    </div>
                )}

                </>)}

            </div>
        </DashboardLayout>
    );
};

export default Alerts;
