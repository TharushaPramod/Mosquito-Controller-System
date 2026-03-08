import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertCircle, Search, Loader2, Building2, MapPin } from 'lucide-react';
import clsx from 'clsx';

const BASE = import.meta.env.VITE_API_URL;

export default function SubmissionStatusModal({ onClose }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('pending'); // 'submitted' | 'pending'
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`${BASE}/heatmap/submission-status`);
                const json = await res.json();
                if (json.success) setData(json.data);
            } catch (e) {
                console.error("Error fetching submission status:", e);
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    const list = activeTab === 'submitted' ? data?.submitted || [] : data?.pending || [];
    const filtered = list.filter(h =>
        h.name.toLowerCase().includes(search.toLowerCase()) ||
        h.district.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden border border-gray-100">

                {/* Header */}
                <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div>
                        <h2 className="text-base font-extrabold text-[#1A3D37]">Facility Submission Tracker</h2>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                            Status for {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
                        </p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-colors">
                        <X size={16} className="text-gray-500" />
                    </button>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <Loader2 size={32} className="text-[#2F6A5F] animate-spin" />
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading status...</span>
                    </div>
                ) : (
                    <>
                        {/* Tabs & Search */}
                        <div className="p-4 border-b border-gray-50 flex flex-col gap-4">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex bg-gray-100 p-1 rounded-xl flex-1">
                                    <button
                                        onClick={() => setActiveTab('pending')}
                                        className={clsx(
                                            "flex-1 py-2 text-[10px] font-extrabold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2",
                                            activeTab === 'pending' ? "bg-white text-red-500 shadow-sm" : "text-gray-400 hover:text-gray-600"
                                        )}
                                    >
                                        <AlertCircle size={14} />
                                        Pending ({data?.pendingCount || 0})
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('submitted')}
                                        className={clsx(
                                            "flex-1 py-2 text-[10px] font-extrabold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2",
                                            activeTab === 'submitted' ? "bg-white text-[#2F6A5F] shadow-sm" : "text-gray-400 hover:text-gray-600"
                                        )}
                                    >
                                        <CheckCircle2 size={14} />
                                        Submitted ({data?.submittedCount || 0})
                                    </button>
                                </div>
                                <div className="relative w-48">
                                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs outline-none focus:border-[#2F6A5F] transition-all"
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-1 bg-red-50/50 border border-red-100 rounded-xl p-3 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                                        <AlertCircle size={16} />
                                    </div>
                                    <div>
                                        <div className="text-[9px] font-bold text-red-400 uppercase tracking-tighter">Missing Reports</div>
                                        <div className="text-base font-black text-red-600 leading-none">{data?.pendingCount}</div>
                                    </div>
                                </div>
                                <div className="flex-1 bg-green-50/50 border border-green-100 rounded-xl p-3 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-green-100 text-[#2F6A5F] flex items-center justify-center">
                                        <CheckCircle2 size={16} />
                                    </div>
                                    <div>
                                        <div className="text-[9px] font-bold text-[#2F6A5F]/60 uppercase tracking-tighter">Received Today</div>
                                        <div className="text-base font-black text-[#2F6A5F] leading-none">{data?.submittedCount}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                            <div className="grid grid-cols-1 gap-2">
                                {filtered.length > 0 ? filtered.map(h => (
                                    <div key={h.id} className="bg-white border border-gray-100 p-3 rounded-xl flex items-center justify-between hover:border-gray-200 transition-all group">
                                        <div className="flex items-center gap-3">
                                            <div className={clsx(
                                                "w-10 h-10 rounded-xl flex items-center justify-center shadow-inner",
                                                activeTab === 'submitted' ? "bg-green-50 text-[#2F6A5F]" : "bg-red-50 text-red-500"
                                            )}>
                                                <Building2 size={20} />
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-bold text-gray-800 leading-tight group-hover:text-[#2F6A5F] transition-colors">{h.name}</h4>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <div className="flex items-center gap-1 text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                                                        <MapPin size={10} />
                                                        {h.district}
                                                    </div>
                                                    <div className="w-1 h-1 rounded-full bg-gray-200" />
                                                    <div className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">{h.type}</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className={clsx(
                                            "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                                            activeTab === 'submitted'
                                                ? "bg-green-50 text-[#2F6A5F] border-green-100"
                                                : "bg-red-50 text-red-500 border-red-100"
                                        )}>
                                            {activeTab === 'submitted' ? 'RECEIVED' : 'NOT SENT'}
                                        </div>
                                    </div>
                                )) : (
                                    <div className="py-20 flex flex-col items-center justify-center text-gray-300 gap-3">
                                        <Search size={40} strokeWidth={1} />
                                        <p className="text-[10px] font-bold uppercase tracking-widest">No facilities found</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                                Total Monitored: {data?.totalFacilities} Facilities
                            </p>
                            <button
                                onClick={onClose}
                                className="px-5 py-2 bg-[#2F6A5F] text-white text-[10px] font-extrabold uppercase tracking-widest rounded-lg shadow-sm hover:opacity-90 transition-opacity"
                            >
                                Close Tracker
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
