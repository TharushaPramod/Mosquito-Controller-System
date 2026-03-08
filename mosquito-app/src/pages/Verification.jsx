import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import {
    CheckCircle2, XCircle, Clock, AlertCircle,
    Search, Filter, RefreshCw, Loader2, Info
} from 'lucide-react';
import clsx from 'clsx';

const BASE = import.meta.env.VITE_API_URL;

const PendingCard = ({ report, onVerify, onReject }) => {
    const [actionLoading, setActionLoading] = useState(null); // 'verify' | 'reject'

    const handleVerify = async () => {
        setActionLoading('verify');
        await onVerify(report._id);
        setActionLoading(null);
    };

    const handleReject = async () => {
        if (!window.confirm('Are you sure you want to delete this pending report?')) return;
        setActionLoading('reject');
        await onReject(report._id);
        setActionLoading(null);
    };

    return (
        <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all flex flex-col gap-3">
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-orange-50 text-orange-500">
                        <Clock size={18} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800 text-xs">{report.district}</h3>
                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">{report.hospitalName}</p>
                    </div>
                </div>
                <div className="px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 text-[9px] font-extrabold uppercase tracking-tight flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-orange-500 animate-pulse" />
                    Pending
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2 bg-gray-50 rounded-lg p-3">
                <div className="flex flex-col">
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Cases</span>
                    <span className="text-sm font-extrabold text-[#2F6A5F]">{report.caseCount}</span>
                </div>
                <div className="flex flex-col border-l border-gray-200 pl-3">
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Deaths</span>
                    <span className="text-sm font-extrabold text-red-500">{report.deathCount || 0}</span>
                </div>
                <div className="flex flex-col mt-1">
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Disease</span>
                    <span className="text-[10px] font-bold text-gray-600 uppercase">{report.diseaseType}</span>
                </div>
                <div className="flex flex-col mt-1 border-l border-gray-200 pl-3">
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Date</span>
                    <span className="text-[10px] font-bold text-gray-600">{new Date(report.reportedAt).toLocaleDateString()}</span>
                </div>
            </div>

            {report.notes && (
                <div className="flex items-start gap-1.5 p-2 rounded-lg bg-blue-50/50 text-blue-600">
                    <Info size={12} className="shrink-0 mt-0.5" />
                    <p className="text-[10px] italic line-clamp-2">{report.notes}</p>
                </div>
            )}

            <div className="flex gap-2 pt-1">
                <button
                    onClick={handleVerify}
                    disabled={!!actionLoading}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-[#2F6A5F] text-white text-[10px] font-extrabold uppercase tracking-wider hover:bg-[#26534a] transition-all disabled:opacity-50"
                >
                    {actionLoading === 'verify' ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                    Verify
                </button>
                <button
                    onClick={handleReject}
                    disabled={!!actionLoading}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-red-50 text-red-500 text-[10px] font-extrabold uppercase tracking-wider hover:bg-red-100 transition-all disabled:opacity-50 border border-red-100"
                >
                    {actionLoading === 'reject' ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={12} />}
                    Reject
                </button>
            </div>
        </div>
    );
};

const Verification = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchPending = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${BASE}/case-reports?verified=false&limit=50`);
            const data = await res.json();
            if (data.success) setReports(data.data);
            else setError('Failed to load pending reports');
        } catch (e) {
            setError('Could not connect to backend');
        }
        setLoading(false);
    };

    useEffect(() => { fetchPending(); }, []);

    const verifyReport = async (id) => {
        try {
            const res = await fetch(`${BASE}/case-reports/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ verified: true })
            });
            const data = await res.json();
            if (data.success) {
                setReports(prev => prev.filter(r => r._id !== id));
            } else {
                alert('Verification failed: ' + data.message);
            }
        } catch (e) {
            alert('Error connecting to backend');
        }
    };

    const rejectReport = async (id) => {
        try {
            const res = await fetch(`${BASE}/case-reports/${id}`, {
                method: 'DELETE'
            });
            const data = await res.json();
            if (data.success) {
                setReports(prev => prev.filter(r => r._id !== id));
            } else {
                alert('Rejection failed: ' + data.message);
            }
        } catch (e) {
            alert('Error connecting to backend');
        }
    };

    const filteredReports = reports.filter(r =>
        r.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.hospitalName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <DashboardLayout title="Data Verification Center">
            <div className="flex flex-col gap-6 max-w-6xl mx-auto">

                {/* Header Stats */}
                <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 shadow-inner">
                            <AlertCircle size={28} />
                        </div>
                        <div>
                            <h2 className="text-lg font-extrabold text-gray-800">Pending Approvals</h2>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                                {reports.length} reports awaiting review
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Filter results..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="pl-9 pr-4 py-2 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-[#2F6A5F] text-[11px] font-bold outline-none transition-all w-full md:w-64"
                            />
                        </div>
                        <button
                            onClick={fetchPending}
                            className="p-2.5 rounded-xl bg-gray-50 text-gray-400 hover:bg-[#2F6A5F] hover:text-white transition-all shadow-sm"
                        >
                            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>
                </div>

                {/* Info Alert */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 text-blue-700">
                    <Info size={18} className="shrink-0" />
                    <p className="text-xs font-semibold leading-relaxed">
                        Uploaded health data (CSV/Bulk) is held here for 48 hours. Once verified, these figures will
                        be added to the <strong>Public Dashboard</strong> and <strong>Mobile App Overview</strong>.
                        Carefully check case counts before approving.
                    </p>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 h-64 animate-pulse">
                                <div className="flex justify-between mb-4">
                                    <div className="flex gap-2">
                                        <div className="w-8 h-8 rounded bg-gray-100" />
                                        <div className="flex flex-col gap-1">
                                            <div className="w-20 h-2 bg-gray-100 rounded" />
                                            <div className="w-32 h-2 bg-gray-50 rounded" />
                                        </div>
                                    </div>
                                    <div className="w-16 h-4 bg-gray-50 rounded-full" />
                                </div>
                                <div className="h-20 bg-gray-50 rounded-lg mb-4" />
                                <div className="flex gap-2">
                                    <div className="flex-1 h-8 bg-gray-100 rounded-lg" />
                                    <div className="flex-1 h-8 bg-gray-100 rounded-lg" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredReports.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredReports.map(report => (
                            <PendingCard
                                key={report._id}
                                report={report}
                                onVerify={verifyReport}
                                onReject={rejectReport}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center shadow-sm">
                        <div className="w-20 h-20 bg-green-50 text-[#2F6A5F] rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 size={40} />
                        </div>
                        <h3 className="text-lg font-extrabold text-gray-800">Clear Inbox!</h3>
                        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                            No pending reports require verification at this time.
                        </p>
                    </div>
                )}

            </div>
        </DashboardLayout>
    );
};

export default Verification;
