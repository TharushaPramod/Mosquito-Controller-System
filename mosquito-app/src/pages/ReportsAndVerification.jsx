import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../Components/Layout/DashboardLayout';
import {
    FileText, Clock, BarChart3, Search, Filter, RefreshCw, Loader2, Download,
    CheckCircle2, XCircle, Info, PieChart, Activity
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import clsx from 'clsx';

const BASE = import.meta.env.VITE_API_URL;

export default function ReportsAndVerification() {
    const [activeTab, setActiveTab] = useState('REPORTS');
    const [stats, setStats] = useState(null);
    const [loadingStats, setLoadingStats] = useState(true);

    const [reports, setReports] = useState([]);
    const [loadingReports, setLoadingReports] = useState(true);
    const [reportsError, setReportsError] = useState(null);
    const [reportFilter, setReportFilter] = useState('ALL');
    const [reportSearch, setReportSearch] = useState('');

    const [pending, setPending] = useState([]);
    const [loadingPending, setLoadingPending] = useState(true);
    const [pendingError, setPendingError] = useState(null);
    const [pendingSearch, setPendingSearch] = useState('');

    const [toasts, setToasts] = useState([]);

    const fetchStats = useCallback(async () => {
        setLoadingStats(true);
        try {
            const res = await fetch(`${BASE}/case-reports/stats`);
            const data = await res.json();
            if (data.success) setStats(data.data);
        } catch (e) {
            console.error(e);
        }
        setLoadingStats(false);
    }, []);

    const fetchReports = useCallback(async () => {
        setLoadingReports(true);
        setReportsError(null);
        try {
            const res = await fetch(`${BASE}/case-reports`);
            const data = await res.json();
            if (data.success) {
                // Map API data into expected structure
                setReports(data.data.map(r => ({
                    id: r._id,
                    title: `${r.district} District Outbreak Report — ${new Date(r.reportedAt).toLocaleString('default', { month: 'long', year: 'numeric' })}`,
                    category: 'EPIDEMIOLOGY', // Could map dynamically based on disease type
                    cases: r.caseCount,
                    deaths: r.deathCount,
                    province: r.province || 'Unknown',
                    date: new Date(r.reportedAt).toLocaleDateString(),
                    fileSize: '12 KB', // dummy size
                    raw: r
                })));
            } else throw new Error();
        } catch (e) {
            setReportsError('Could not connect — Retry');
        }
        setLoadingReports(false);
    }, []);

    const fetchPending = useCallback(async () => {
        setLoadingPending(true);
        setPendingError(null);
        try {
            const res = await fetch(`${BASE}/case-reports?verified=false&source=Hospital Facility`);
            const data = await res.json();
            if (data.success) setPending(data.data);
            else throw new Error();
        } catch (e) {
            setPendingError('Could not connect — Retry');
        }
        setLoadingPending(false);
    }, []);

    useEffect(() => {
        fetchStats();
        fetchReports();
        fetchPending();
    }, [fetchStats, fetchReports, fetchPending]);

    // Toast helper
    const addToast = (msg, type = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, msg, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
    };

    // Actions
    const handleVerify = async (id) => {
        try {
            const res = await fetch(`${BASE}/case-reports/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ verified: true })
            });
            if (res.ok) {
                setPending(prev => prev.filter(p => p._id !== id));
                addToast('Report verified successfully');
                fetchStats(); // Update stats
            }
        } catch (e) {
            addToast('Action failed', 'error');
        }
    };

    const handleReject = async (id) => {
        try {
            const res = await fetch(`${BASE}/case-reports/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                setPending(prev => prev.filter(p => p._id !== id));
                addToast('Report rejected', 'neutral');
                fetchStats(); // Update stats
            }
        } catch (e) {
            addToast('Action failed', 'error');
        }
    };

    const handleExportCSV = () => {
        const rows = [
            ['Title', 'Category', 'Cases', 'Deaths', 'Province', 'Date'],
            ...filteredReports.map(r => [r.title, r.category, r.cases, r.deaths, r.province, r.date])
        ];
        const csv = rows.map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'reports.csv'; a.click();
    };

    // Filters
    const filteredReports = reports.filter(r => {
        const matchCat = reportFilter === 'ALL' || r.category === reportFilter;
        const matchSearch = r.title.toLowerCase().includes(reportSearch.toLowerCase());
        return matchCat && matchSearch;
    });

    const filteredPending = pending.filter(p =>
        p.district?.toLowerCase().includes(pendingSearch.toLowerCase()) ||
        p.hospitalName?.toLowerCase().includes(pendingSearch.toLowerCase())
    );

    return (
        <DashboardLayout title="Reports & Verification Center">
            <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-10">

                {/* STAT BAR */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-[#2F6A5F] rounded-2xl p-5 text-white shadow-lg relative overflow-hidden group">
                        <div className="relative z-10">
                            <h4 className="text-white/70 text-[10px] uppercase font-bold tracking-widest mb-1">Total Reports</h4>
                            <div className="text-3xl font-extrabold">
                                {loadingStats ? <span className="animate-pulse">—</span> : (stats?.totalReports || reports.length)}
                            </div>
                        </div>
                        <FileText size={80} className="absolute -right-4 -bottom-4 text-white/10 group-hover:scale-110 transition-transform duration-500" />
                    </div>

                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                            <BarChart3 size={24} />
                        </div>
                        <div>
                            <h4 className="text-gray-400 text-[10px] uppercase font-bold tracking-widest mb-0.5">Automated Logs</h4>
                            <div className="text-2xl font-extrabold text-gray-800">
                                {loadingStats ? <span className="animate-pulse">—</span> : (stats?.mlRecords || 0).toLocaleString()}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
                            <PieChart size={24} />
                        </div>
                        <div>
                            <h4 className="text-gray-400 text-[10px] uppercase font-bold tracking-widest mb-0.5">Data Accuracy</h4>
                            <div className="text-2xl font-extrabold text-gray-800">
                                {loadingStats ? <span className="animate-pulse">—</span> : `${stats?.dataAccuracy || 0}%`}
                            </div>
                            <p className="text-[10px] text-blue-500 font-bold uppercase tracking-tight">VERIFIED</p>
                        </div>
                    </div>
                </div>

                {/* TABS */}
                <div className="flex bg-white p-1.5 rounded-xl border border-gray-100 shadow-sm w-fit">
                    <button
                        onClick={() => setActiveTab('REPORTS')}
                        className={clsx("flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition-all", activeTab === 'REPORTS' ? 'bg-[#2F6A5F] text-white' : 'text-gray-500 hover:bg-gray-50')}
                    >
                        <FileText size={16} /> REPORTS
                    </button>
                    <button
                        onClick={() => setActiveTab('PENDING')}
                        className={clsx("flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition-all", activeTab === 'PENDING' ? 'bg-[#2F6A5F] text-white' : 'text-gray-500 hover:bg-gray-50')}
                    >
                        <Clock size={16} /> PENDING APPROVAL
                        {pending.length > 0 && (
                            <span className="ml-1 flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold">
                                {pending.length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('ANALYTICS')}
                        className={clsx("flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition-all", activeTab === 'ANALYTICS' ? 'bg-[#2F6A5F] text-white' : 'text-gray-500 hover:bg-gray-50')}
                    >
                        <BarChart3 size={16} /> ANALYTICS
                    </button>
                </div>

                {/* TAB 1: REPORTS */}
                {activeTab === 'REPORTS' && (
                    <div className="flex flex-col gap-4 animate-in fade-in duration-300">
                        {reportsError && (
                            <div className="bg-red-50 p-4 rounded-xl flex items-center justify-between border border-red-100">
                                <span className="text-red-600 text-sm font-semibold">{reportsError}</span>
                                <button onClick={fetchReports} className="text-sm text-red-700 bg-red-100 px-3 py-1 rounded-lg">Retry</button>
                            </div>
                        )}
                        <div className="flex flex-col md:flex-row justify-between gap-4 bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
                                {['ALL', 'EPIDEMIOLOGY', 'OPERATIONS', 'ANALYTICS', 'RESOURCES'].map(cat => (
                                    <button
                                        key={cat} onClick={() => setReportFilter(cat)}
                                        className={clsx("px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase whitespace-nowrap", reportFilter === cat ? "bg-[#2F6A5F] text-white" : "bg-gray-50 text-gray-500 hover:bg-gray-100")}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input type="text" placeholder="Search reports..." value={reportSearch} onChange={e => setReportSearch(e.target.value)} className="pl-9 pr-4 py-2 rounded-xl bg-gray-50 outline-none text-xs w-full md:w-64" />
                                </div>
                                <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-100">
                                    <Download size={14} /> CSV
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {loadingReports ? [...Array(6)].map((_, i) => <div key={i} className="h-32 bg-white rounded-3xl animate-pulse border border-gray-100" />) :
                                filteredReports.length === 0 ? <div className="col-span-3 text-center p-10 text-gray-400 font-medium">No reports found.</div> :
                                    filteredReports.map(r => (
                                        <div key={r.id} className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3 group">
                                            <div className="flex justify-between items-start">
                                                <div className="p-3 rounded-2xl bg-[#F0F7F5] text-[#2F6A5F]">
                                                    <FileText size={20} />
                                                </div>
                                                <button onClick={() => {}} className="p-2 rounded-lg bg-gray-50 hover:bg-[#2F6A5F] hover:text-white text-gray-400 transition-colors opacity-0 group-hover:opacity-100">
                                                    <Download size={16} />
                                                </button>
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-800 text-sm leading-tight mb-2">{r.title}</h3>
                                                <span className="text-[9px] font-extrabold uppercase px-2 py-1 rounded-full bg-blue-50 text-blue-600">{r.category}</span>
                                            </div>
                                            <div className="flex gap-4 text-xs mt-2">
                                                <span className="text-gray-500">Cases: <strong className="text-gray-800">{r.cases}</strong></span>
                                                <span className="text-gray-500">Deaths: <strong className="text-red-500">{r.deaths}</strong></span>
                                                <span className="text-gray-500">{r.province}</span>
                                            </div>
                                            <div className="flex justify-between items-center mt-2 pt-3 border-t border-gray-50 text-xs text-gray-400">
                                                <span>{r.date}</span>
                                                <span className="font-bold">{r.fileSize}</span>
                                            </div>
                                        </div>
                                    ))}
                        </div>
                    </div>
                )}

                {/* TAB 2: PENDING APPROVAL */}
                {activeTab === 'PENDING' && (
                    <div className="flex flex-col gap-4 animate-in fade-in duration-300">
                        {pendingError && (
                            <div className="bg-red-50 p-4 rounded-xl flex items-center justify-between border border-red-100">
                                <span className="text-red-600 text-sm font-semibold">{pendingError}</span>
                                <button onClick={fetchPending} className="text-sm text-red-700 bg-red-100 px-3 py-1 rounded-lg">Retry</button>
                            </div>
                        )}
                        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3 text-blue-700">
                            <Info size={20} className="shrink-0" />
                            <p className="text-sm font-medium">Uploaded health data is held here for 48 hours. Once verified, figures will be added to the Public Dashboard.</p>
                        </div>
                        <div className="flex justify-between items-center bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="font-extrabold text-gray-800 px-3">{pending.length} Reports Awaiting Review</h2>
                            <div className="relative">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input type="text" placeholder="Filter results..." value={pendingSearch} onChange={e => setPendingSearch(e.target.value)} className="pl-9 pr-4 py-2 rounded-xl bg-gray-50 outline-none text-xs w-64" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {loadingPending ? [...Array(6)].map((_, i) => <div key={i} className="h-48 bg-white rounded-3xl animate-pulse border border-gray-100" />) :
                                filteredPending.length === 0 ? (
                                    <div className="col-span-3 bg-white rounded-3xl border border-gray-100 p-12 text-center shadow-sm">
                                        <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle2 size={32} /></div>
                                        <h3 className="text-lg font-extrabold text-gray-800">All reports verified ✅</h3>
                                    </div>
                                ) :
                                    filteredPending.map(p => (
                                        <div key={p._id} className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm flex flex-col gap-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-bold text-gray-800 text-sm">{p.district}</h3>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase">{p.hospitalName}</p>
                                                </div>
                                                <span className="px-2 py-1 rounded-full bg-orange-50 text-orange-600 text-[9px] font-extrabold uppercase flex items-center gap-1">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" /> PENDING
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 bg-gray-50 rounded-xl p-3 text-xs">
                                                <div><span className="block text-[9px] text-gray-400 font-bold uppercase">Cases</span><span className="font-extrabold text-[#2F6A5F]">{p.caseCount}</span></div>
                                                <div><span className="block text-[9px] text-gray-400 font-bold uppercase">Deaths</span><span className="font-extrabold text-red-500">{p.deathCount || 0}</span></div>
                                                <div><span className="block text-[9px] text-gray-400 font-bold uppercase">Disease</span><span className="font-bold text-gray-600 uppercase">{p.diseaseType}</span></div>
                                                <div><span className="block text-[9px] text-gray-400 font-bold uppercase">Date</span><span className="font-bold text-gray-600">{new Date(p.reportedAt).toLocaleDateString()}</span></div>
                                            </div>
                                            <div className="flex gap-2 mt-auto">
                                                <button onClick={() => handleVerify(p._id)} className="flex-1 flex justify-center items-center gap-2 py-2.5 rounded-xl bg-green-50 text-green-600 text-[10px] font-extrabold uppercase hover:bg-green-100 transition-colors">
                                                    <CheckCircle2 size={14} /> Verify
                                                </button>
                                                <button onClick={() => handleReject(p._id)} className="flex-1 flex justify-center items-center gap-2 py-2.5 rounded-xl bg-red-50 text-red-500 text-[10px] font-extrabold uppercase hover:bg-red-100 transition-colors">
                                                    <XCircle size={14} /> Reject
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                        </div>
                    </div>
                )}

                {/* TAB 3: ANALYTICS */}
                {activeTab === 'ANALYTICS' && (
                    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
                        {/* Summary Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: 'Verified Reports', value: stats?.verifiedReports || 0, icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50' },
                                { label: 'ML Generated', value: stats?.mlRecords || 0, icon: Activity, color: 'text-blue-500', bg: 'bg-blue-50' },
                                { label: 'Avg Cases / Week', value: stats?.avgCasesPerWeek || 0, icon: BarChart3, color: 'text-purple-500', bg: 'bg-purple-50' },
                                { label: 'Most Affected', value: stats?.mostAffected || 'N/A', icon: Info, color: 'text-orange-500', bg: 'bg-orange-50' },
                            ].map((s, i) => (
                                <div key={i} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-3">
                                    <div className={`w-10 h-10 rounded-2xl ${s.bg} ${s.color} flex items-center justify-center`}><s.icon size={20} /></div>
                                    <div>
                                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{s.label}</h4>
                                        <p className="text-lg font-extrabold text-gray-800">{s.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Bar Chart */}
                            <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm h-80">
                                <h3 className="font-bold text-gray-800 mb-4">Cases by District (Top 10)</h3>
                                {stats?.top10Districts?.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={stats.top10Districts}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                            <XAxis dataKey="district" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                                            <Tooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                            <Bar dataKey="cases" fill="#2F6A5F" radius={[4, 4, 0, 0]} barSize={32} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : <div className="flex items-center justify-center h-full text-sm text-gray-400">Not enough data</div>}
                            </div>

                            {/* Line Chart */}
                            <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm h-80">
                                <h3 className="font-bold text-gray-800 mb-4">Data Accuracy Timeline (%)</h3>
                                {stats?.accuracyTimeline?.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={stats.accuracyTimeline}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} domain={[0, 100]} />
                                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                            <Line type="monotone" dataKey="accuracy" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4, fill: '#3B82F6', strokeWidth: 0 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                ) : <div className="flex items-center justify-center h-full text-sm text-gray-400">Not enough data</div>}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Toasts */}
            <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-50">
                {toasts.map(t => (
                    <div key={t.id} className={clsx("px-4 py-3 rounded-xl text-white text-sm font-bold shadow-lg flex items-center gap-2", t.type === 'error' ? 'bg-red-500' : t.type === 'neutral' ? 'bg-gray-800' : 'bg-[#2F6A5F]')}>
                        {t.type === 'success' && <CheckCircle2 size={16} />}
                        {t.msg}
                    </div>
                ))}
            </div>
        </DashboardLayout>
    );
}
