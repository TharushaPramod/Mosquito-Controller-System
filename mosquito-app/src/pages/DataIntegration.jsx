import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search, ChevronDown, Download, Plus, Eye, Edit2, Trash2,
    ChevronLeft, ChevronRight, Calendar, FileText, RefreshCw, Loader2
} from 'lucide-react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import AddFacilityModal from './AddFacilityModal';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, AreaChart, Area
} from 'recharts';

const BASE = import.meta.env.VITE_API_URL;

const getSeverityClass = (s) => ({
    High: 'bg-[#FFEBEE] text-[#C62828]', HIGH: 'bg-[#FFEBEE] text-[#C62828]',
    Medium: 'bg-[#FFF3E0] text-[#EF6C00]', MEDIUM: 'bg-[#FFF3E0] text-[#EF6C00]',
    Low: 'bg-[#E8F5E9] text-[#2E7D32]', LOW: 'bg-[#E8F5E9] text-[#2E7D32]',
}[s] || 'bg-gray-100 text-gray-500');

const getStatusClass = (s) => ({
    'Active': 'bg-[#E8F5E9] text-[#2E7D32]',
    'Delayed': 'bg-[#FFEBEE] text-[#D32F2F]',
    'Not Sending Data': 'bg-[#FFFDE7] text-[#FBC02D]',
}[s] || 'bg-gray-100 text-gray-500');

const ALL_DISTRICTS = ['All', 'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo', 'Galle',
    'Gampaha', 'Hambantota', 'Jaffna', 'Kalutara', 'Kandy', 'Kegalle', 'Kilinochchi',
    'Kurunegala', 'Mannar', 'Matale', 'Matara', 'Moneragala', 'Mullaitivu', 'Nuwara Eliya',
    'Polonnaruwa', 'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya'];

const Dropdown = ({ label, value, options, open, setOpen, onChange }) => (
    <div className="flex flex-col gap-2 min-w-0">
        {label && <label className="text-[11px] font-bold text-[#4A635F] uppercase tracking-wider">{label}</label>}
        <div className="relative">
            <button className="flex items-center justify-between w-full px-3 py-2 bg-white border border-[#E0E0E0] rounded-lg text-[#1A3D37] text-xs font-semibold cursor-pointer hover:border-[#1A3D37] transition-colors"
                onClick={() => setOpen(o => !o)}>
                <span>{value}</span><ChevronDown size={12} />
            </button>
            {open && (
                <div className="absolute top-full left-0 mt-1 w-52 bg-white border border-gray-200 rounded-lg shadow-xl z-30 py-1 max-h-52 overflow-y-auto">
                    {options.map(opt => (
                        <div key={opt} className="px-4 py-2 hover:bg-teal-50 cursor-pointer text-xs font-medium text-gray-700"
                            onClick={() => { onChange(opt); setOpen(false); }}>{opt}</div>
                    ))}
                </div>
            )}
        </div>
    </div>
);

// ══════════════════════════════════════════════════════════════
// PAST OUTBREAK HISTORY
// ══════════════════════════════════════════════════════════════
const PastOutbreakHistory = () => {
    const [outbreaks, setOutbreaks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [timelineData, setTimeline] = useState([]);
    const [seasonalData, setSeasonal] = useState([]);
    const [district, setDistrict] = useState('All');
    const [disease, setDisease] = useState('All');
    const [severity, setSeverity] = useState('All');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [dOpen, setDOpen] = useState(false);
    const [disOpen, setDisOpen] = useState(false);
    const [sevOpen, setSevOpen] = useState(false);
    const [page, setPage] = useState(1);
    const PG = 10;

    useEffect(() => {
        fetch(`${BASE}/heatmap/yearly-stats`).then(r => r.json())
            .then(res => { if (res.data?.yearly) setSeasonal(res.data.yearly); }).catch(() => { });
    }, []);

    const fetch_ = useCallback(() => {
        setLoading(true);
        const p = new URLSearchParams();
        if (district !== 'All') p.set('district', district);
        if (disease !== 'All') p.set('diseaseType', disease.toLowerCase());
        if (severity !== 'All') p.set('severity', severity.toUpperCase());
        if (startDate) p.set('startDate', startDate);
        if (endDate) p.set('endDate', endDate);
        fetch(`${BASE}/heatmap/outbreak-history?${p}`).then(r => r.json()).then(res => {
            const data = res.data || [];
            setOutbreaks(data);
            const mo = {};
            data.forEach(o => {
                if (!o.startDate) return;
                const k = new Date(o.startDate).toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });
                mo[k] = (mo[k] || 0) + (o.reportedCases || 0);
            });
            setTimeline(Object.entries(mo).sort((a, b) => new Date('01 ' + a[0]) - new Date('01 ' + b[0])).slice(-8).map(([name, cases]) => ({ name, cases })));
            setLoading(false);
        }).catch(() => setLoading(false));
    }, [district, disease, severity, startDate, endDate]);

    useEffect(() => { fetch_(); }, []);
    useEffect(() => { setPage(1); }, [outbreaks.length]);

    const totalPg = Math.max(1, Math.ceil(outbreaks.length / PG));
    const rows = outbreaks.slice((page - 1) * PG, page * PG);
    const dlCSV = () => {
        const h = ['ID', 'District', 'Disease', 'Start', 'End', 'Cases', 'Severity'];
        const r = outbreaks.map(o => [o.id, o.district, o.diseaseType, o.startDate, o.endDate || 'Active', o.reportedCases, o.severity]);
        const a = document.createElement('a'); a.href = 'data:text/csv,' + encodeURIComponent([h, ...r].map(x => x.join(',')).join('\n')); a.download = 'outbreak_history.csv'; a.click();
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 bg-white p-4 rounded-xl border border-[#E0E0E0] shadow-sm">
                <Dropdown label="District" value={district} options={ALL_DISTRICTS} open={dOpen} setOpen={setDOpen} onChange={setDistrict} />
                <Dropdown label="Disease" value={disease} options={['All', 'Dengue', 'Chikungunya']} open={disOpen} setOpen={setDisOpen} onChange={setDisease} />
                <div className="flex flex-col gap-2">
                    <label className="text-[11px] font-bold text-[#4A635F] uppercase tracking-wider">Date Range</label>
                    <div className="flex items-center gap-2">
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                            className="flex-1 min-w-0 px-2 py-1.5 border border-[#E0E0E0] rounded-lg text-[11px] outline-none focus:border-[#2D6A5D]" />
                        <span className="text-xs text-gray-400">to</span>
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                            className="flex-1 min-w-0 px-2 py-1.5 border border-[#E0E0E0] rounded-lg text-[11px] outline-none focus:border-[#2D6A5D]" />
                    </div>
                </div>
                <Dropdown label="Severity" value={severity} options={['All', 'High', 'Medium', 'Low']} open={sevOpen} setOpen={setSevOpen} onChange={setSeverity} />
                <div className="flex flex-col gap-2">
                    <label className="text-[11px] font-bold text-[#4A635F] uppercase tracking-wider opacity-0">Go</label>
                    <button onClick={fetch_} className="px-4 py-2 bg-[#2D6A5D] text-white rounded-lg text-xs font-bold uppercase hover:opacity-90 flex items-center justify-center gap-2 shadow-sm">
                        <RefreshCw size={12} /> Apply
                    </button>
                </div>
            </div>

            <div className="flex justify-end">
                <button onClick={dlCSV} className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E0E0E0] text-[#1A3D37] rounded-lg text-xs font-bold uppercase hover:bg-gray-50 shadow-sm">
                    <Download size={14} /> Export CSV
                </button>
            </div>

            <div className="bg-[#DDEDE7] rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full border-collapse text-left">
                    <thead className="bg-[#99C7B6]">
                        <tr>{['Outbreak ID', 'District', 'Start Date', 'End Date', 'Cases', 'Severity', 'Actions'].map(h => (
                            <th key={h} className="p-3 text-xs font-bold text-[#1A3D37] border-b border-[#EEF2F0] uppercase tracking-wider">{h}</th>
                        ))}</tr>
                    </thead>
                    <tbody>
                        {loading ? [...Array(5)].map((_, i) => (
                            <tr key={i} className="animate-pulse">{[...Array(7)].map((_, j) => (
                                <td key={j} className="p-3 border-b border-[#EEF2F0] bg-[#F1F8F5]/30"><div className="h-3 bg-gray-200 rounded" /></td>
                            ))}</tr>
                        )) : outbreaks.length === 0 ? (
                            <tr><td colSpan={7} className="p-8 text-center text-gray-400 text-sm bg-white/50">No outbreaks found for the selected filters.</td></tr>
                        ) : rows.map((ob, i) => (
                            <tr key={i} className="hover:bg-white/40 transition-colors">
                                <td className="p-3 text-[11px] border-b border-[#EEF2F0] bg-[#F1F8F5]/30 font-mono text-[#1A3D37]">{ob.id}</td>
                                <td className="p-3 text-[11px] border-b border-[#EEF2F0] bg-[#F1F8F5]/30 font-medium">{ob.district}</td>
                                <td className="p-3 text-[11px] border-b border-[#EEF2F0] bg-[#F1F8F5]/30">{ob.startDate}</td>
                                <td className="p-3 text-[11px] border-b border-[#EEF2F0] bg-[#F1F8F5]/30">{ob.endDate || 'Active'}</td>
                                <td className="p-3 text-[11px] border-b border-[#EEF2F0] bg-[#F1F8F5]/30 font-bold">{(ob.reportedCases || 0).toLocaleString()}</td>
                                <td className="p-3 text-[11px] border-b border-[#EEF2F0] bg-[#F1F8F5]/30 text-center">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${getSeverityClass(ob.severity)}`}>{ob.severity}</span>
                                </td>
                                <td className="p-3 text-[11px] border-b border-[#EEF2F0] bg-[#F1F8F5]/30 text-center">
                                    <button onClick={() => { const r = [ob.id, ob.district, ob.diseaseType, ob.startDate, ob.endDate || 'Active', ob.reportedCases, ob.severity]; const a = document.createElement('a'); a.href = 'data:text/csv,' + encodeURIComponent(r.join(',')); a.download = ob.id + '.csv'; a.click(); }}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-[#1A3D37] border border-[#E0E0E0] rounded-lg text-[10px] font-bold hover:bg-[#2D6A5D] hover:text-white hover:border-[#2D6A5D] transition-all shadow-sm">
                                        <Download size={12} /> CSV
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {outbreaks.length > PG && (
                <div className="flex justify-center items-center gap-3">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#E0E0E0] bg-white text-[#1A3D37] hover:bg-[#F5F5F5] disabled:opacity-40">
                        <ChevronLeft size={16} />
                    </button>
                    <span className="text-xs font-semibold text-[#1A3D37]">Page {page} of {totalPg}</span>
                    <button onClick={() => setPage(p => Math.min(totalPg, p + 1))} disabled={page === totalPg}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#E0E0E0] bg-white text-[#1A3D37] hover:bg-[#F5F5F5] disabled:opacity-40">
                        <ChevronRight size={16} />
                    </button>
                </div>
            )}

            {!loading && outbreaks.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                    {[
                        { label: 'Total Outbreaks', value: outbreaks.length },
                        { label: 'Total Cases', value: outbreaks.reduce((s, o) => s + (o.reportedCases || 0), 0).toLocaleString() },
                        { label: 'High Severity', value: outbreaks.filter(o => ['High', 'HIGH'].includes(o.severity)).length },
                    ].map(s => (
                        <div key={s.label} className="bg-white rounded-xl border border-[#E0E0E0] shadow-sm p-4 text-center">
                            <div className="text-2xl font-extrabold text-gray-800">{s.value}</div>
                            <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mt-1">{s.label}</div>
                        </div>
                    ))}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl p-4 border border-[#E0E0E0] shadow-sm">
                    <div className="flex items-center gap-2 mb-4"><FileText size={16} className="text-teal-600" />
                        <h4 className="text-xs font-bold text-[#1A3D37] uppercase tracking-wider">Outbreak Timeline</h4>
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={timelineData.length ? timelineData : [{ name: 'No data', cases: 0 }]}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#666' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#666' }} />
                            <Tooltip />
                            <Line type="monotone" dataKey="cases" stroke="#2D6A5D" strokeWidth={3} dot={{ r: 4, fill: '#2D6A5D' }} activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-white rounded-xl p-4 border border-[#E0E0E0] shadow-sm">
                    <div className="flex items-center gap-2 mb-4"><Calendar size={16} className="text-teal-600" />
                        <h4 className="text-xs font-bold text-[#1A3D37] uppercase tracking-wider">Seasonal Trend (Yearly)</h4>
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={seasonalData.length ? seasonalData : [{ name: 'No data', cases: 0 }]}>
                            <defs>
                                <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#2D6A5D" stopOpacity={0.15} />
                                    <stop offset="95%" stopColor="#2D6A5D" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#666' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#666' }} />
                            <Tooltip />
                            <Area type="monotone" dataKey="cases" stroke="#2D6A5D" fillOpacity={1} fill="url(#cg)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

// ══════════════════════════════════════════════════════════════
// HEALTH FACILITY LIST — live backend data
// ══════════════════════════════════════════════════════════════
const HealthFacilityList = () => {
    const navigate = useNavigate();
    const [facilities, setFacilities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [district, setDistrict] = useState('All');
    const [status, setStatus] = useState('All');
    const [dOpen, setDOpen] = useState(false);
    const [stOpen, setStOpen] = useState(false);
    const [showAdd, setShowAdd] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [page, setPage] = useState(1);
    const PG = 8;

    const load = useCallback(async () => {
        setLoading(true); setError(null);
        try {
            const p = new URLSearchParams();
            if (district !== 'All') p.set('district', district);
            if (status !== 'All') p.set('status', status);
            if (search.trim()) p.set('search', search.trim());
            const res = await fetch(`${BASE}/hospitals?${p}`);
            const data = await res.json();
            if (data.success) setFacilities(data.data);
            else setError('Failed to load facilities');
        } catch { setError('Could not connect to backend'); }
        setLoading(false);
    }, [district, status, search]);

    useEffect(() => { load(); }, [district, status]);
    useEffect(() => { setPage(1); }, [facilities.length]);

    const del = async (id, name) => {
        if (!window.confirm(`Delete "${name}"?`)) return;
        setDeletingId(id);
        try {
            await fetch(`${BASE}/hospitals/${id}`, { method: 'DELETE' });
            setFacilities(prev => prev.filter(f => f._id !== id));
        } catch { alert('Delete failed.'); }
        setDeletingId(null);
    };

    const exportCSV = () => {
        const h = ['ID', 'Name', 'District', 'Province', 'Type', 'Contact', 'Phone', 'Status', 'Last Report'];
        const r = facilities.map(f => [f.hospitalId, f.name, f.district, f.province, f.type, f.contactPerson, f.contactPhone, f.computedStatus || f.status, f.lastUpdate]);
        const a = document.createElement('a');
        a.href = 'data:text/csv,' + encodeURIComponent([h, ...r].map(x => x.join(',')).join('\n'));
        a.download = 'facilities.csv'; a.click();
    };

    const totalPg = Math.max(1, Math.ceil(facilities.length / PG));
    const paged = facilities.slice((page - 1) * PG, page * PG);

    return (
        <>
            {/* Filters */}
            <div className="flex items-center gap-3 mb-5 w-full">
                <div className="relative">
                    <button className="flex items-center gap-2 px-3 py-2 bg-white border border-[#E0E0E0] rounded-lg text-[#1A3D37] text-xs font-semibold cursor-pointer hover:border-[#1A3D37] transition-colors"
                        onClick={() => setDOpen(o => !o)}>
                        <span>{district === 'All' ? 'Filter District' : district}</span><ChevronDown size={12} />
                    </button>
                    {dOpen && (
                        <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-2 max-h-60 overflow-y-auto">
                            {ALL_DISTRICTS.map(d => (
                                <div key={d} className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-xs font-medium text-gray-700"
                                    onClick={() => { setDistrict(d); setDOpen(false); }}>{d}</div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666]" size={14} />
                    <input type="text" placeholder="Search facility, district, contact..."
                        className="w-full pl-9 pr-4 py-2 bg-white border border-[#E0E0E0] rounded-lg text-xs outline-none focus:border-[#1A3D37] transition-colors"
                        value={search} onChange={e => setSearch(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && load()} />
                </div>

                <div className="relative">
                    <button className="flex items-center gap-2 px-3 py-2 bg-white border border-[#E0E0E0] rounded-lg text-[#1A3D37] text-xs font-semibold cursor-pointer hover:border-[#1A3D37] transition-colors"
                        onClick={() => setStOpen(o => !o)}>
                        <span>{status === 'All' ? 'Filter Status' : status}</span><ChevronDown size={12} />
                    </button>
                    {stOpen && (
                        <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-2">
                            {['All', 'Active', 'Delayed', 'Not Sending Data'].map(s => (
                                <div key={s} className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-xs font-medium text-gray-700"
                                    onClick={() => { setStatus(s); setStOpen(false); }}>{s}</div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 mb-4">
                <button onClick={() => setShowAdd(true)}
                    className="bg-[#00796B] text-white px-4 py-2 rounded-lg font-bold text-xs hover:bg-[#00695C] shadow-sm flex items-center gap-1.5 transition-colors">
                    <Plus size={14} /> Add Facility
                </button>
                <button onClick={exportCSV}
                    className="bg-white border border-[#E0E0E0] text-[#1A3D37] px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 hover:bg-gray-50 shadow-sm">
                    <Download size={14} /> Export
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-100 rounded-lg px-4 py-3 mb-4 flex items-center justify-between">
                    <p className="text-xs text-red-500 font-semibold">{error}</p>
                    <button onClick={load} className="text-xs text-red-400 underline">Retry</button>
                </div>
            )}

            {/* Table */}
            <div className="bg-[#DDEDE7] rounded-2xl overflow-hidden shadow-sm mb-6">
                <table className="w-full border-collapse text-left">
                    <thead className="bg-[#99C7B6]">
                        <tr>{['Facility Name', 'District', 'Type', 'Updated', 'Status', 'Actions'].map(h => (
                            <th key={h} className="p-3 text-xs font-bold text-[#1A3D37] border-b border-[#EEF2F0] uppercase tracking-wider">{h}</th>
                        ))}</tr>
                    </thead>
                    <tbody>
                        {loading ? [...Array(5)].map((_, i) => (
                            <tr key={i} className="animate-pulse">{[...Array(6)].map((_, j) => (
                                <td key={j} className="p-3 border-b border-[#EEF2F0] bg-[#F1F8F5]/30"><div className="h-3 bg-gray-200 rounded" /></td>
                            ))}</tr>
                        )) : facilities.length === 0 ? (
                            <tr><td colSpan={6} className="p-10 text-center text-gray-400 text-sm bg-white/50">
                                No facilities found. Click <strong>+ Add Facility</strong> to register one.
                            </td></tr>
                        ) : paged.map(f => (
                            <tr key={f._id} className="hover:bg-white/50 transition-colors">
                                <td className="p-3 text-[11px] border-b border-[#EEF2F0] bg-[#F1F8F5]/30">
                                    <div className="font-bold text-[#1A3D37]">{f.name}</div>
                                    {f.hospitalId && <div className="text-[9px] text-gray-400 font-mono mt-0.5">{f.hospitalId}</div>}
                                </td>
                                <td className="p-3 text-[11px] border-b border-[#EEF2F0] bg-[#F1F8F5]/30 font-medium text-[#1A3D37]">{f.district}</td>
                                <td className="p-3 text-[11px] border-b border-[#EEF2F0] bg-[#F1F8F5]/30 text-[#1A3D37]">{f.type}</td>
                                <td className="p-3 text-[11px] border-b border-[#EEF2F0] bg-[#F1F8F5]/30 text-[#1A3D37]">{f.lastUpdate || 'No Data'}</td>
                                <td className="p-3 text-[11px] border-b border-[#EEF2F0] bg-[#F1F8F5]/30 text-center">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${getStatusClass(f.computedStatus || f.status)}`}>
                                        {f.computedStatus || f.status}
                                    </span>
                                </td>
                                <td className="p-3 text-[11px] border-b border-[#EEF2F0] bg-[#F1F8F5]/30">
                                    <div className="flex items-center justify-center gap-1.5">
                                        <button onClick={() => navigate(`/facility/${f._id}`)}
                                            className="w-[54px] h-[28px] bg-[#00796B] text-white rounded-lg flex items-center justify-center gap-1 text-[10px] font-bold hover:opacity-90 shadow-sm">
                                            <Eye size={12} /> VIEW
                                        </button>
                                        <button className="w-7 h-7 rounded-lg bg-teal-50 text-[#00796B] flex items-center justify-center hover:opacity-80 shadow-sm">
                                            <Edit2 size={12} />
                                        </button>
                                        <button onClick={() => del(f._id, f.name)} disabled={deletingId === f._id}
                                            className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center hover:opacity-80 shadow-sm disabled:opacity-40">
                                            {deletingId === f._id ? <Loader2 size={11} className="animate-spin" /> : <Trash2 size={12} />}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {facilities.length > PG && (
                <div className="flex justify-center items-center gap-4 mt-2">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                        className="bg-transparent border border-[#E0E0E0] rounded-lg p-2 text-[#1A3D37] hover:bg-[#F5F5F5] disabled:opacity-40">
                        <ChevronLeft size={18} />
                    </button>
                    <span className="text-xs font-semibold text-[#1A3D37]">Page {page} of {totalPg}</span>
                    <button onClick={() => setPage(p => Math.min(totalPg, p + 1))} disabled={page === totalPg}
                        className="bg-transparent border border-[#E0E0E0] rounded-lg p-2 text-[#1A3D37] hover:bg-[#F5F5F5] disabled:opacity-40">
                        <ChevronRight size={18} />
                    </button>
                </div>
            )}

            {/* Add Modal */}
            {showAdd && (
                <AddFacilityModal
                    onClose={() => setShowAdd(false)}
                    onAdded={newF => setFacilities(prev => [newF, ...prev])}
                />
            )}
        </>
    );
};

// ══════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════
const DataIntegration = () => {
    const [activeTab, setActiveTab] = useState('health-facility');
    return (
        <DashboardLayout title="Data Integration">
            <div className="text-[#1A3D37] font-sans">
                <div className="flex justify-center mb-8">
                    <div className="bg-[#79B0A3] rounded-full flex overflow-hidden shadow-[0_4px_10px_rgba(0,0,0,0.1)] w-fit">
                        {[{ key: 'health-facility', label: 'Health Facility List' }, { key: 'past-outbreak', label: 'Past Outbreak History' }].map(tab => (
                            <button key={tab.key}
                                className={`px-6 py-2 rounded-full font-bold text-xs text-white transition-all duration-300 uppercase tracking-wider whitespace-nowrap ${activeTab === tab.key ? 'bg-[#2D6A5D] shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]' : 'bg-transparent hover:bg-white/10'}`}
                                onClick={() => setActiveTab(tab.key)}>{tab.label}
                            </button>
                        ))}
                    </div>
                </div>
                {activeTab === 'past-outbreak' && <PastOutbreakHistory />}
                {activeTab === 'health-facility' && <HealthFacilityList />}
            </div>
        </DashboardLayout>
    );
};

export default DataIntegration;
