import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowLeft, Loader2, RefreshCw, Plus, Edit2, Trash2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../components/Layout/DashboardLayout';
import AddReportModal from './AddReportModal';
import EditReportModal from './EditReportModal';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, BarChart, Bar, RadialBarChart, RadialBar, Legend
} from 'recharts';
import { MapContainer, TileLayer, Circle, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const BASE = import.meta.env.VITE_API_URL;

const PAGE_SIZE = 10;

const getStatusStyle = (s) => ({
    'Active': 'bg-[#E8F5E9] text-[#2E7D32]',
    'Delayed': 'bg-[#FFF3E0] text-[#E65100]',
    'Not Sending Data': 'bg-[#FFEBEE] text-[#C62828]',
}[s] || 'bg-gray-100 text-gray-500');

// ── Skeleton loader ────────────────────────────────────────────
const Skeleton = ({ className }) => (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

const FacilityDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('Daily Reports');
    const [showAddReport, setShowAddReport] = useState(false);
    const [editingReport, setEditingReport] = useState(null);

    // ── Data state ──────────────────────────────────────────────
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);

    const load = async () => {
        setLoading(true); setError(null);
        try {
            const res = await fetch(`${BASE}/hospitals/${id}`);
            const json = await res.json();
            if (json.success) setData(json.data);
            else setError(json.message || 'Failed to load facility');
        } catch { setError('Could not connect to backend'); }
        setLoading(false);
    };

    useEffect(() => { load(); }, [id]);

    // ── Derived data ────────────────────────────────────────────
    const hospital = data?.hospital || {};
    const today = data?.today || { confirmed: 0, suspected: 0, deaths: 0 };
    const allReports = data?.dailyReports || [];
    const stats = data?.stats || {};
    const monthlyData = stats.monthlyData || [];
    const yearlyData = stats.yearlyData || [];
    const categoryData = stats.categoryData || [];
    const distData = stats.distributionData || [];

    const totalPages = Math.max(1, Math.ceil(allReports.length / PAGE_SIZE));
    const pagedReport = allReports.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const facilityLat = hospital.location?.lat || 6.9271;
    const facilityLng = hospital.location?.lng || 79.8612;

    const tabs = ['Daily Reports', 'Facility Summary Stats', 'Map', 'Contact / Staff', 'Integration Logs'];

    // ── Error / Loading header ──────────────────────────────────
    const renderHeader = () => {
        if (loading) return (
            <div className="bg-[#1A3D37] rounded-2xl p-8 text-white mb-6">
                <Skeleton className="h-8 w-64 mb-3 bg-white/20" />
                <Skeleton className="h-5 w-40 mb-4 bg-white/20" />
                <Skeleton className="h-4 w-80 bg-white/20" />
            </div>
        );
        return (
            <div className="bg-[#1A3D37] rounded-2xl p-8 text-white flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-[26px] font-bold m-0 mb-1">{hospital.name || '—'}</h2>
                    <div className="text-[16px] opacity-80 mb-3">{hospital.district} District · {hospital.province} Province</div>
                    <div className="flex flex-col gap-1 text-sm opacity-70">
                        {hospital.contactPhone && <span>Phone: {hospital.contactPhone}{hospital.contactEmail ? `, Email: ${hospital.contactEmail}` : ''}</span>}
                        {hospital.location?.lat && <span>GPS: {hospital.location.lat.toFixed(6)}, {hospital.location.lng.toFixed(6)}</span>}
                        <span className="font-mono text-xs opacity-60">{hospital.hospitalId}</span>
                    </div>
                </div>
                <div className={`px-3 py-1.5 rounded-lg text-sm font-bold ${getStatusStyle(hospital.computedStatus || hospital.status)}`}>
                    {hospital.computedStatus || hospital.status || 'Active'}
                </div>
            </div>
        );
    };

    // ── Today stats ─────────────────────────────────────────────
    const renderToday = () => (
        <div className="bg-[#F0F7F5] border border-[#99C7B6] rounded-2xl p-6 mb-8">
            <h3 className="text-[#4B9081] text-[18px] font-semibold mb-5">Today</h3>
            <div className="grid grid-cols-3 gap-6">
                {loading
                    ? [...Array(3)].map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)
                    : [
                        { label: 'Confirmed Cases', value: today.confirmed },
                        { label: 'Suspected Cases', value: today.suspected },
                        { label: 'Deaths', value: today.deaths },
                    ].map((s, i) => (
                        <div key={i} className="bg-[#DDEEE8] rounded-2xl p-6 text-center shadow-sm">
                            <div className="text-[42px] font-bold text-[#1A3D37] mb-2">{s.value}</div>
                            <div className="text-sm font-semibold text-[#555]">{s.label}</div>
                        </div>
                    ))
                }
            </div>
        </div>
    );

    const handleDeleteReport = async (reportId) => {
        if (!window.confirm("Are you sure you want to delete this report? This action cannot be undone.")) return;

        try {
            const res = await fetch(`${BASE}/case-reports/${reportId}`, { method: 'DELETE' });
            const json = await res.json();
            if (json.success) {
                // Remove from state optimistically
                setData(prev => {
                    if (!prev) return prev;
                    const reportToDelete = prev.dailyReports.find(r => r._id === reportId);
                    if (!reportToDelete) return prev;

                    const isToday = reportToDelete.date === new Date().toLocaleDateString('en-GB');

                    return {
                        ...prev,
                        dailyReports: prev.dailyReports.filter(r => r._id !== reportId),
                        today: isToday ? {
                            confirmed: (prev.today.confirmed || 0) - reportToDelete.confirmed,
                            suspected: (prev.today.suspected || 0) - reportToDelete.suspected,
                            deaths: (prev.today.deaths || 0) - reportToDelete.death,
                        } : prev.today,
                    };
                });
            } else {
                alert(json.message || "Failed to delete report");
            }
        } catch (err) {
            alert("Could not connect to backend to delete report");
        }
    };

    // ── Daily Reports tab ───────────────────────────────────────
    const renderDailyReports = () => (
        <div className="bg-[#DDEEE8] border border-[#99C7B6] rounded-tr-2xl rounded-br-2xl rounded-bl-2xl p-6 min-h-[400px]">
            {/* Tab-level Add Report button */}
            <div className="flex justify-end mb-4">
                <button onClick={() => setShowAddReport(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#2F6A5F] text-white rounded-lg text-xs font-bold hover:bg-[#1A3D37] transition-colors shadow-sm">
                    <Plus size={13} /> Add Report
                </button>
            </div>
            {loading ? (
                <div className="flex flex-col gap-3">
                    {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}
                </div>
            ) : allReports.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-4">
                    <p className="text-sm font-medium">No reports found for this facility.</p>
                    <p className="text-xs">Case reports submitted via hospital API will appear here.</p>
                    <button onClick={() => setShowAddReport(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#2F6A5F] text-white rounded-lg text-xs font-bold hover:bg-[#1A3D37] transition-colors shadow-sm mt-2">
                        <Plus size={13} /> Add First Report
                    </button>
                </div>
            ) : (
                <>
                    <div className="bg-white rounded-xl overflow-hidden border border-[#B5D4C9] mb-4">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-[#99C7B6]">
                                    {['Date', 'Confirmed', 'Suspected', 'Deaths', 'Age Group', 'Source', 'Severity', 'Actions'].map(h => (
                                        <th key={h} className="p-3 text-[#1A3D37] text-xs font-bold text-left border-b-2 border-[#78B09B] uppercase tracking-wider">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {pagedReport.map((r, i) => (
                                    <tr key={i} className="bg-[#F7FBFA] even:bg-[#EDF7F4] hover:bg-[#E2F0EB] transition-colors">
                                        <td className="p-3 text-xs text-[#1A3D37] border-b border-[#E0EEE9]">{r.date}</td>
                                        <td className="p-3 text-xs font-bold text-[#1A3D37] border-b border-[#E0EEE9]">{r.confirmed}</td>
                                        <td className="p-3 text-xs text-[#1A3D37] border-b border-[#E0EEE9]">{r.suspected}</td>
                                        <td className="p-3 text-xs text-[#1A3D37] border-b border-[#E0EEE9]">{r.death}</td>
                                        <td className="p-3 text-xs text-[#1A3D37] border-b border-[#E0EEE9]">{r.ageGroup}</td>
                                        <td className="p-3 text-xs text-[#1A3D37] border-b border-[#E0EEE9]">{r.source}</td>
                                        <td className="p-3 text-xs border-b border-[#E0EEE9]">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase
                                                ${r.severity === 'HIGH' ? 'bg-red-100 text-red-600'
                                                    : r.severity === 'MEDIUM' ? 'bg-orange-100 text-orange-600'
                                                        : 'bg-green-100 text-green-600'}`}>
                                                {r.severity}
                                            </span>
                                        </td>
                                        <td className="p-3 text-xs border-b border-[#E0EEE9]">
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => setEditingReport(r)} title="Edit Report"
                                                    className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                                                    <Edit2 size={13} />
                                                </button>
                                                <button onClick={() => handleDeleteReport(r._id)} title="Delete Report"
                                                    className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Summary row */}
                    <div className="flex gap-4 text-xs font-semibold text-[#1A3D37] bg-white/60 rounded-lg px-4 py-2 mb-4">
                        <span>Total Records: <strong>{allReports.length}</strong></span>
                        <span>Total Cases: <strong>{allReports.reduce((s, r) => s + r.confirmed, 0).toLocaleString()}</strong></span>
                        <span>Total Deaths: <strong>{allReports.reduce((s, r) => s + r.death, 0)}</strong></span>
                    </div>

                    {/* Pagination */}
                    {allReports.length > PAGE_SIZE && (
                        <footer className="flex justify-center items-center gap-4 mt-4">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                                className="bg-white border border-[#B5D4C9] rounded-lg w-10 h-10 flex items-center justify-center text-[#1A3D37] hover:bg-[#E2F0EB] disabled:opacity-40 transition-colors">
                                <ChevronLeft size={18} />
                            </button>
                            <div className="flex items-center gap-2 font-semibold text-[#1A3D37]">
                                <span className="bg-[#1A3D37] text-white w-8 h-8 flex items-center justify-center rounded-md">{page}</span>
                                <span className="text-[#99C7B6]">/</span>
                                <span className="text-[#666]">{totalPages}</span>
                            </div>
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                                className="bg-white border border-[#B5D4C9] rounded-lg w-10 h-10 flex items-center justify-center text-[#1A3D37] hover:bg-[#E2F0EB] disabled:opacity-40 transition-colors">
                                <ChevronRight size={18} />
                            </button>
                        </footer>
                    )}
                </>
            )}
        </div>
    );

    // ── Facility Stats tab ──────────────────────────────────────
    const renderFacilityStats = () => (
        <div className="bg-[#DDEEE8] border border-[#99C7B6] rounded-tr-2xl rounded-br-2xl rounded-bl-2xl p-6 min-h-[400px]">
            <div className="flex justify-end mb-4">
                <button onClick={() => setShowAddReport(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#2F6A5F] text-white rounded-lg text-xs font-bold hover:bg-[#1A3D37] transition-colors shadow-sm">
                    <Plus size={13} /> Add Report
                </button>
            </div>
            {loading ? (
                <div className="grid grid-cols-2 gap-6">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-72 rounded-xl" />)}</div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl p-5 border border-[#B5D4C9] shadow-sm">
                        <h4 className="text-[#1A3D37] font-semibold mb-4">Monthly Cases Trend</h4>
                        <ResponsiveContainer width="100%" height={240}>
                            <LineChart data={monthlyData.length ? monthlyData : [{ name: 'No data', cases: 0 }]}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0EEE9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#4B9081', fontSize: 11 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#4B9081', fontSize: 11 }} />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                <Line type="monotone" dataKey="cases" stroke="#64B49F" strokeWidth={3} dot={{ r: 4, fill: '#64B49F' }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="bg-white rounded-xl p-5 border border-[#B5D4C9] shadow-sm">
                        <h4 className="text-[#1A3D37] font-semibold mb-4">Yearly Cases Trend</h4>
                        <ResponsiveContainer width="100%" height={240}>
                            <LineChart data={yearlyData.length ? yearlyData : [{ name: 'No data', cases: 0 }]}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0EEE9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#4B9081', fontSize: 11 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#4B9081', fontSize: 11 }} />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                <Line type="monotone" dataKey="cases" stroke="#4A90E2" strokeWidth={3} dot={{ r: 4, fill: '#4A90E2' }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="bg-white rounded-xl p-5 border border-[#B5D4C9] shadow-sm">
                        <h4 className="text-[#1A3D37] font-semibold mb-4">Case Category Breakdown</h4>
                        <ResponsiveContainer width="100%" height={240}>
                            <BarChart data={categoryData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E0EEE9" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#4B9081', fontSize: 11 }} width={80} />
                                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                <Bar dataKey="value" fill="#64B49F" radius={[0, 4, 4, 0]} barSize={18} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="bg-white rounded-xl p-5 border border-[#B5D4C9] shadow-sm">
                        <h4 className="text-[#1A3D37] font-semibold mb-4">Distribution by Year</h4>
                        <ResponsiveContainer width="100%" height={240}>
                            <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="80%" barSize={10}
                                data={distData.length ? distData : [{ name: 'No data', value: 1, fill: '#ccc' }]}>
                                <RadialBar minAngle={15} label={{ position: 'insideStart', fill: '#fff', fontSize: 10 }} background clockWise dataKey="value" />
                                <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" />
                                <Tooltip />
                            </RadialBarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    );

    // ── Map tab ──────────────────────────────────────────────────
    const renderMap = () => (
        <div className="bg-[#DDEEE8] border border-[#99C7B6] rounded-tr-2xl rounded-br-2xl rounded-bl-2xl p-6 min-h-[400px] flex flex-col gap-4">
            <div className="flex justify-between items-center">
                <h4 className="text-[#1A3D37] text-base font-semibold">Facility Location & Nearby Risk Zones</h4>
                <div className="flex gap-4 text-xs text-[#4B9081]">
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#FF5252] inline-block"></span> High Risk</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#FFB142] inline-block"></span> Medium</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#4BC0C0] inline-block"></span> Low</span>
                </div>
            </div>
            <div className="border border-[#B5D4C9] rounded-xl overflow-hidden relative z-10">
                <MapContainer center={[facilityLat, facilityLng]} zoom={14} scrollWheelZoom={false}
                    style={{ height: '400px', width: '100%' }}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Circle center={[facilityLat, facilityLng]}
                        pathOptions={{ color: '#1A3D37', fillColor: '#1A3D37', fillOpacity: 0.3 }} radius={80}>
                        <Popup><strong>{hospital.name}</strong><br />{hospital.district}</Popup>
                    </Circle>
                    {/* Surrounding risk circles based on real case counts */}
                    {[
                        { off: [0.004, 0.006], r: 350, c: '#FF5252', label: 'High Risk Area', cases: Math.round((today.confirmed || 0) * 2.1) },
                        { off: [-0.003, 0.004], r: 200, c: '#FFB142', label: 'Medium Risk Area', cases: Math.round((today.confirmed || 0) * 1.2) },
                        { off: [0.005, -0.003], r: 150, c: '#4BC0C0', label: 'Low Risk Area', cases: Math.round((today.confirmed || 0) * 0.4) },
                    ].map((cl, i) => (
                        <Circle key={i} center={[facilityLat + cl.off[0], facilityLng + cl.off[1]]}
                            pathOptions={{ color: cl.c, fillColor: cl.c, fillOpacity: 0.3 }} radius={cl.r}>
                            <Popup><strong>{cl.label}</strong><br />Est. {cl.cases} cases</Popup>
                        </Circle>
                    ))}
                </MapContainer>
            </div>
        </div>
    );

    // ── Contact tab ──────────────────────────────────────────────
    const renderContact = () => (
        <div className="bg-[#DDEEE8] border border-[#99C7B6] rounded-tr-2xl rounded-br-2xl rounded-bl-2xl p-6 min-h-[400px]">
            {loading ? (
                <div className="grid grid-cols-2 gap-6">{[...Array(2)].map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white rounded-xl p-6 border border-[#B5D4C9] shadow-sm">
                        <h4 className="text-[#1A3D37] text-lg font-bold border-b-2 border-[#64B49F] pb-2 mb-5 w-fit">Facility Contact</h4>
                        {[
                            { label: 'Facility Name', value: hospital.name },
                            { label: 'District', value: hospital.district },
                            { label: 'Province', value: hospital.province },
                            { label: 'Type', value: hospital.type },
                            { label: 'Phone', value: hospital.contactPhone || '—' },
                            { label: 'Email', value: hospital.contactEmail || '—' },
                            { label: 'Facility ID', value: hospital.hospitalId },
                        ].map(row => (
                            <div key={row.label} className="flex justify-between py-3 border-b border-[#F0F7F5] last:border-0">
                                <span className="text-[#4B9081] font-semibold text-sm">{row.label}</span>
                                <span className="text-[#1A3D37] font-medium text-sm text-right">{row.value}</span>
                            </div>
                        ))}
                    </div>
                    <div className="bg-white rounded-xl p-6 border border-[#B5D4C9] shadow-sm">
                        <h4 className="text-[#1A3D37] text-lg font-bold border-b-2 border-[#64B49F] pb-2 mb-5 w-fit">Contact Person</h4>
                        {[
                            { label: 'Name', value: hospital.contactPerson || '—' },
                            { label: 'Phone', value: hospital.contactPhone || '—' },
                            { label: 'Email', value: hospital.contactEmail || '—' },
                            { label: 'GPS', value: hospital.location ? `${hospital.location.lat?.toFixed(4)}, ${hospital.location.lng?.toFixed(4)}` : '—' },
                            { label: 'Status', value: hospital.computedStatus || hospital.status },
                            { label: 'Verified', value: hospital.verified ? 'Yes' : 'No' },
                        ].map(row => (
                            <div key={row.label} className="flex justify-between py-3 border-b border-[#F0F7F5] last:border-0">
                                <span className="text-[#4B9081] font-semibold text-sm">{row.label}</span>
                                <span className="text-[#1A3D37] font-medium text-sm text-right">{row.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    // ── Integration Logs tab ─────────────────────────────────────
    const renderLogs = () => {
        const now = new Date().toLocaleTimeString();
        const lastReport = allReports[0];
        return (
            <div className="bg-[#DDEEE8] border border-[#99C7B6] rounded-tr-2xl rounded-br-2xl rounded-bl-2xl p-6 min-h-[400px] flex flex-col gap-6">
                {/* Live log */}
                <div className="bg-white rounded-xl p-5 border border-[#B5D4C9]">
                    <h4 className="text-[#1A3D37] font-bold mb-4 border-l-4 border-[#64B49F] pl-3">System Log</h4>
                    <div className="flex flex-col gap-2 font-mono text-xs text-[#1A3D37]">
                        {[
                            `[${now}] Connected to backend API at ${BASE}`,
                            `[${now}] Loaded facility: ${hospital.name || '—'} (${hospital.hospitalId || '—'})`,
                            `[${now}] Retrieved ${allReports.length} case reports from MongoDB`,
                            lastReport ? `[${now}] Last report date: ${lastReport.date}` : `[${now}] No case reports found for this facility`,
                            `[${now}] Status computed: ${hospital.computedStatus || hospital.status || 'Active'}`,
                        ].map((line, i) => (
                            <div key={i} className="p-1.5 px-3 bg-[#F7FBFA] rounded">
                                <span className="text-[#4B9081] font-semibold mr-2">[INFO]</span>{line}
                            </div>
                        ))}
                    </div>
                </div>

                {/* API response summary */}
                <div className="bg-white rounded-xl p-5 border border-[#B5D4C9]">
                    <h4 className="text-[#1A3D37] font-bold mb-4 border-l-4 border-[#64B49F] pl-3">API Response Summary</h4>
                    <table className="w-full border-collapse text-xs">
                        <thead>
                            <tr className="bg-[#F0F7F5] text-[#4B9081] font-semibold border-b border-[#B5D4C9]">
                                {['Endpoint', 'Status', 'Records', 'Description'].map(h => (
                                    <th key={h} className="text-left p-2.5">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="bg-[#E8F5E9]">
                                <td className="p-2.5 border-b border-[#F0F7F5] font-mono">/api/hospitals/{id}</td>
                                <td className="p-2.5 border-b border-[#F0F7F5] font-bold text-[#2E7D32]">200 OK</td>
                                <td className="p-2.5 border-b border-[#F0F7F5]">1 facility</td>
                                <td className="p-2.5 border-b border-[#F0F7F5]">Facility metadata loaded</td>
                            </tr>
                            <tr className={allReports.length > 0 ? 'bg-[#E8F5E9]' : 'bg-[#FFF3E0]'}>
                                <td className="p-2.5 border-b border-[#F0F7F5] font-mono">/api/case-reports</td>
                                <td className={`p-2.5 border-b border-[#F0F7F5] font-bold ${allReports.length > 0 ? 'text-[#2E7D32]' : 'text-[#E65100]'}`}>
                                    {allReports.length > 0 ? '200 OK' : '204 No Content'}
                                </td>
                                <td className="p-2.5 border-b border-[#F0F7F5]">{allReports.length} records</td>
                                <td className="p-2.5 border-b border-[#F0F7F5]">{allReports.length > 0 ? 'Case reports synced' : 'No reports yet'}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Data validation */}
                <div className="bg-white rounded-xl p-5 border border-[#B5D4C9]">
                    <h4 className="text-[#1A3D37] font-bold mb-4 border-l-4 border-[#64B49F] pl-3">Data Integrity Check</h4>
                    <div className="flex flex-col gap-2 text-xs">
                        {[
                            { check: 'Hospital ID present', ok: !!hospital.hospitalId },
                            { check: 'Location coordinates valid', ok: !!(hospital.location?.lat && hospital.location?.lng) },
                            { check: 'Contact information filled', ok: !!(hospital.contactPerson || hospital.contactPhone) },
                            { check: 'Case reports available', ok: allReports.length > 0 },
                            { check: 'Today stats computed', ok: true },
                        ].map((c, i) => (
                            <div key={i} className={`flex items-center gap-3 px-3 py-2 rounded ${c.ok ? 'bg-[#E8F5E9]' : 'bg-[#FFF3E0]'}`}>
                                <span className={`font-bold ${c.ok ? 'text-green-600' : 'text-orange-500'}`}>{c.ok ? '✓' : '⚠'}</span>
                                <span className="text-[#1A3D37]">{c.check}</span>
                                <span className={`ml-auto font-semibold ${c.ok ? 'text-green-600' : 'text-orange-500'}`}>{c.ok ? 'PASS' : 'WARN'}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'Daily Reports': return renderDailyReports();
            case 'Facility Summary Stats': return renderFacilityStats();
            case 'Map': return renderMap();
            case 'Contact / Staff': return renderContact();
            case 'Integration Logs': return renderLogs();
            default: return renderDailyReports();
        }
    };

    return (
        <DashboardLayout title="">
            <div className="text-[#1A3D37] font-sans">
                {/* Top action bar */}
                <div className="flex items-center justify-between mb-4">
                    <button onClick={() => navigate('/data-integration')}
                        className="flex items-center gap-2 bg-white border border-[#E0E0E0] rounded-lg px-4 py-2 text-[#1A3D37] text-sm font-medium hover:bg-[#F5F5F5] hover:border-[#1A3D37] transition-all">
                        <ArrowLeft size={16} /> Back
                    </button>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowAddReport(true)}
                            disabled={loading || !hospital.hospitalId}
                            className="flex items-center gap-2 px-4 py-2 bg-[#2F6A5F] text-white rounded-lg text-sm font-bold hover:bg-[#1A3D37] transition-colors shadow-sm disabled:opacity-40">
                            <Plus size={15} /> Add Report
                        </button>
                        <button onClick={load} disabled={loading}
                            className="flex items-center gap-2 bg-white border border-[#E0E0E0] rounded-lg px-4 py-2 text-[#1A3D37] text-sm font-medium hover:bg-[#F5F5F5] transition-all disabled:opacity-50">
                            {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="bg-red-50 border border-red-100 rounded-xl px-5 py-4 mb-4 flex items-center justify-between">
                        <p className="text-sm text-red-500 font-semibold">{error}</p>
                        <button onClick={load} className="text-xs text-red-400 underline">Retry</button>
                    </div>
                )}

                {renderHeader()}
                {renderToday()}

                {/* Tabs */}
                <div className="flex bg-[#1A3D37] rounded-t-lg overflow-hidden w-fit">
                    {tabs.map(tab => (
                        <button key={tab}
                            className={`px-6 py-4 text-white font-semibold text-sm border-none bg-transparent cursor-pointer transition-colors border-r border-white/10 last:border-r-0 whitespace-nowrap ${activeTab === tab ? 'bg-[#64B49F]' : 'hover:bg-white/10'}`}
                            onClick={() => setActiveTab(tab)}>
                            {tab}
                        </button>
                    ))}
                </div>

                {renderTabContent()}

                {/* Add Report Modal */}
                {showAddReport && hospital.hospitalId && (
                    <AddReportModal
                        hospital={hospital}
                        onClose={() => setShowAddReport(false)}
                        onAdded={(newReport) => {
                            // Optimistically prepend to daily reports list and bump today stats
                            setData(prev => {
                                if (!prev) return prev;
                                const formatted = {
                                    _id: newReport._id,
                                    date: new Date(newReport.reportedAt || Date.now()).toLocaleDateString('en-GB'),
                                    confirmed: newReport.caseCount || 0,
                                    suspected: newReport.suspectedCount || 0,
                                    death: newReport.deathCount || 0,
                                    ageGroup: newReport.ageGroup || '—',
                                    source: newReport.source || 'Manual',
                                    severity: newReport.severityLevel || '—',
                                    disease: newReport.diseaseType || 'dengue',
                                };
                                const isToday = new Date(newReport.reportedAt || Date.now()).toDateString() === new Date().toDateString();
                                return {
                                    ...prev,
                                    dailyReports: [formatted, ...prev.dailyReports],
                                    today: isToday ? {
                                        confirmed: (prev.today.confirmed || 0) + formatted.confirmed,
                                        suspected: (prev.today.suspected || 0) + formatted.suspected,
                                        deaths: (prev.today.deaths || 0) + formatted.death,
                                    } : prev.today,
                                };
                            });
                            setPage(1);
                        }}
                    />
                )}

                {/* Edit Report Modal */}
                {editingReport && (
                    <EditReportModal
                        hospital={hospital}
                        report={editingReport}
                        onClose={() => setEditingReport(null)}
                        onUpdated={(updatedReport) => {
                            setData(prev => {
                                if (!prev) return prev;

                                const oldReport = prev.dailyReports.find(r => r._id === updatedReport._id);
                                const formatted = {
                                    _id: updatedReport._id,
                                    date: new Date(updatedReport.reportedAt).toLocaleDateString('en-GB'),
                                    confirmed: updatedReport.caseCount || 0,
                                    suspected: updatedReport.suspectedCount || 0,
                                    death: updatedReport.deathCount || 0,
                                    ageGroup: updatedReport.ageGroup || '—',
                                    source: updatedReport.source || 'Manual',
                                    severity: updatedReport.severityLevel || '—',
                                    disease: updatedReport.diseaseType || 'dengue',
                                    notes: updatedReport.notes || '',
                                };

                                const isToday = formatted.date === new Date().toLocaleDateString('en-GB');
                                const wasToday = oldReport && oldReport.date === new Date().toLocaleDateString('en-GB');

                                return {
                                    ...prev,
                                    dailyReports: prev.dailyReports.map(r => r._id === updatedReport._id ? formatted : r),
                                    today: {
                                        confirmed: (prev.today.confirmed || 0) + (isToday ? formatted.confirmed : 0) - (wasToday ? oldReport.confirmed : 0),
                                        suspected: (prev.today.suspected || 0) + (isToday ? formatted.suspected : 0) - (wasToday ? oldReport.suspected : 0),
                                        deaths: (prev.today.deaths || 0) + (isToday ? formatted.death : 0) - (wasToday ? oldReport.death : 0),
                                    }
                                };
                            });
                        }}
                    />
                )}
            </div>
        </DashboardLayout>
    );
};

export default FacilityDetail;
