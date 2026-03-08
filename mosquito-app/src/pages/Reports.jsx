import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import {
    FileText, Download, Filter, Calendar, Search,
    ChevronRight, PieChart, BarChart3, FileSpreadsheet,
    Printer, Mail, RefreshCw, Loader2
} from 'lucide-react';
import clsx from 'clsx';
import { generateReportPDF } from '../components/Utils/generateReportPDF';
import CustomReportModal from './CustomReportModal';

const BASE = import.meta.env.VITE_API_URL;

const CATEGORY_COLORS = {
    Epidemiology: 'text-red-500 bg-red-50',
    Operations: 'text-blue-500 bg-blue-50',
    Analytics: 'text-purple-500 bg-purple-50',
    Resources: 'text-green-500 bg-green-50',
};

const ReportCard = ({ report, onDownload }) => {
    const [downloading, setDownloading] = useState(false);

    const handleDownload = async () => {
        setDownloading(true);
        await onDownload(report);
        setDownloading(false);
    };

    return (
        <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-lg transition-all group flex flex-col gap-4">
            <div className="flex justify-between items-start">
                <div className="p-2.5 rounded-xl bg-[#F0F7F5] text-[#2F6A5F]">
                    <FileText size={20} />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={handleDownload}
                        disabled={downloading}
                        className="p-2 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-[#2F6A5F] transition-colors disabled:opacity-50"
                        title="Download CSV"
                    >
                        {downloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                    </button>
                    <button className="p-2 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition-colors" title="Print">
                        <Printer size={16} />
                    </button>
                </div>
            </div>

            <div>
                <h3 className="font-bold text-gray-800 text-xs mb-1 group-hover:text-[#2F6A5F] transition-colors leading-snug">
                    {report.title}
                </h3>
                <span className={clsx('text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full', CATEGORY_COLORS[report.category] || 'text-gray-400 bg-gray-50')}>
                    {report.category}
                </span>
            </div>

            {/* Case info if available */}
            {report.cases > 0 && (
                <div className="flex gap-3 text-[10px]">
                    <span className="text-gray-500">Cases: <strong className="text-gray-700">{report.cases}</strong></span>
                    {report.deaths > 0 && <span className="text-gray-500">Deaths: <strong className="text-red-500">{report.deaths}</strong></span>}
                    <span className="text-gray-400">{report.province}</span>
                </div>
            )}

            <div className="flex items-center gap-3 pt-2 border-t border-gray-50">
                <div className="flex items-center gap-1.5 text-gray-500 text-[10px]">
                    <Calendar size={10} />
                    <span>{report.date}</span>
                </div>
                <div className="px-2 py-0.5 rounded-full bg-gray-50 text-gray-400 text-[9px] font-extrabold">
                    {report.fileSize}
                </div>
            </div>
        </div>
    );
};

// Skeleton card for loading
const SkeletonCard = () => (
    <div className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col gap-4 animate-pulse">
        <div className="w-10 h-10 rounded-xl bg-gray-100" />
        <div>
            <div className="h-3 bg-gray-100 rounded w-3/4 mb-2" />
            <div className="h-2 bg-gray-50 rounded w-1/4" />
        </div>
        <div className="h-2 bg-gray-50 rounded w-1/2 mt-auto" />
    </div>
);

const Reports = () => {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showCustomModal, setShowCustomModal] = useState(false);
    const [error, setError] = useState(null);

    const fetchStats = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${BASE}/heatmap/report-stats`);
            const data = await res.json();
            if (data.success) setStats(data.data);
            else setError('Failed to load reports');
        } catch (e) {
            setError('Could not connect to backend');
        }
        setLoading(false);
    };

    useEffect(() => { fetchStats(); }, []);

    const categories = ['All', 'Epidemiology', 'Operations', 'Analytics', 'Resources'];

    const allReports = stats?.reports || [];
    const filteredReports = allReports.filter(r => {
        const matchCat = selectedCategory === 'All' || r.category === selectedCategory;
        const matchSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.district?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchCat && matchSearch;
    });

    const totalReports = stats?.totalReports ?? 0;
    const automatedLogs = stats?.automatedLogs ?? 0;
    const logChange = stats?.logChange ?? 0;
    const dataAccuracy = stats?.dataAccuracy ?? 0;


    // Download a single report card as styled PDF
    const downloadReport = async (report) => {
        try {
            const params = new URLSearchParams({
                ...(report.district && report.district !== 'All Districts' && { district: report.district }),
            });
            const res = await fetch(`${BASE}/heatmap/outbreak-history?${params}`);
            const data = await res.json();
            const rows = data.data || [];
            await generateReportPDF(report, rows);
        } catch (e) {
            alert('PDF generation failed. Please try again.');
        }
    };

    // Export all filtered reports summary as CSV
    const handleExportCSV = () => {
        const rows = [
            ['Title', 'Category', 'District', 'Province', 'Cases', 'Deaths', 'Date'],
            ...filteredReports.map(r => [r.title, r.category, r.district, r.province, r.cases, r.deaths, r.date])
        ];
        const csv = rows.map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'health_reports.csv'; a.click();
    };

    return (
        <DashboardLayout title="Health Data Reports & Analytics">
            <div className="flex flex-col gap-6 max-w-6xl mx-auto">

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Total Reports */}
                    <div className="bg-[#2F6A5F] rounded-xl p-4 text-white shadow-lg shadow-[#2F6A5F]/20 relative overflow-hidden group">
                        <div className="relative z-10">
                            <h4 className="text-white/70 text-[9px] uppercase font-bold tracking-widest mb-1">Total Reports</h4>
                            <div className="text-2xl font-extrabold mb-3">
                                {loading ? <span className="animate-pulse">—</span> : totalReports}
                            </div>
                            <button
                                onClick={fetchStats}
                                className="flex items-center gap-2 text-[10px] font-bold bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-all uppercase tracking-wider"
                            >
                                <RefreshCw size={10} className={loading ? 'animate-spin' : ''} />
                                Refresh
                            </button>
                        </div>
                        <FileText size={60} className="absolute -right-2 -bottom-2 text-white/10 group-hover:scale-110 transition-transform duration-500" />
                    </div>

                    {/* Automated Logs */}
                    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center gap-5">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0 shadow-inner">
                            <BarChart3 size={20} />
                        </div>
                        <div>
                            <h4 className="text-gray-400 text-[9px] uppercase font-extrabold tracking-widest mb-0.5">Automated Logs</h4>
                            <div className="text-xl font-extrabold text-gray-800 leading-tight">
                                {loading ? <span className="animate-pulse text-gray-300">—</span> : automatedLogs.toLocaleString()}
                            </div>
                            <p className={clsx('text-[9px] font-bold uppercase tracking-tight', logChange >= 0 ? 'text-green-500' : 'text-red-500')}>
                                {loading ? '' : `${logChange >= 0 ? '+' : ''}${logChange}% LAST MONTH`}
                            </p>
                        </div>
                    </div>

                    {/* Data Accuracy */}
                    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center gap-5">
                        <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0 shadow-inner">
                            <PieChart size={20} />
                        </div>
                        <div>
                            <h4 className="text-gray-400 text-[9px] uppercase font-extrabold tracking-widest mb-0.5">Data Accuracy</h4>
                            <div className="text-xl font-extrabold text-gray-800 leading-tight">
                                {loading ? <span className="animate-pulse text-gray-300">—</span> : `${dataAccuracy}%`}
                            </div>
                            <p className="text-[9px] text-blue-500 font-bold uppercase tracking-tight">VERIFIED BY MOH</p>
                        </div>
                    </div>
                </div>

                {/* Filters & Search */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={clsx(
                                    "px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wide transition-all whitespace-nowrap",
                                    selectedCategory === cat
                                        ? "bg-[#2F6A5F] text-white shadow-sm"
                                        : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                                )}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1 md:flex-none">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search reports..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="pl-9 pr-4 py-1.5 rounded-lg bg-gray-50 border-transparent focus:bg-white focus:border-[#2F6A5F] text-[10px] font-bold outline-none transition-all w-full md:w-64"
                            />
                        </div>
                        <button className="p-2 rounded-lg bg-gray-50 text-gray-400 hover:bg-[#2F6A5F] hover:text-white transition-all">
                            <Filter size={14} />
                        </button>
                    </div>
                </div>

                {/* Error state */}
                {error && (
                    <div className="bg-red-50 rounded-xl p-4 text-center border border-red-100">
                        <p className="text-red-500 text-sm font-semibold">{error}</p>
                        <button onClick={fetchStats} className="mt-2 text-xs text-red-400 underline">Try again</button>
                    </div>
                )}

                {/* Reports Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {loading
                        ? [...Array(6)].map((_, i) => <SkeletonCard key={i} />)
                        : filteredReports.map(report => <ReportCard key={report.id} report={report} onDownload={downloadReport} />)
                    }

                    {/* Custom Report placeholder */}
                    {!loading && (
                        <button
                            onClick={() => setShowCustomModal(true)}
                            className="border-2 border-dashed border-gray-100 rounded-xl p-6 flex flex-col items-center justify-center gap-2 text-gray-300 hover:border-[#2F6A5F] hover:text-[#2F6A5F] hover:bg-[#F0F7F5] transition-all group">
                            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-[#2F6A5F]/10 transition-colors">
                                <Download className="rotate-180" size={16} />
                            </div>
                            <span className="text-[10px] font-extrabold uppercase tracking-wider">Custom Report</span>
                        </button>
                    )}
                </div>

                {/* Export Options */}
                <div className="flex justify-center gap-3 mt-2">
                    <button
                        onClick={handleExportCSV}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white border border-gray-100 text-gray-500 font-extrabold text-[10px] uppercase tracking-wider hover:bg-gray-50 transition-all shadow-sm"
                    >
                        <FileSpreadsheet size={14} className="text-green-600" />
                        Export CSV
                    </button>
                    <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white border border-gray-100 text-gray-500 font-extrabold text-[10px] uppercase tracking-wider hover:bg-gray-50 transition-all shadow-sm">
                        <Mail size={14} className="text-blue-500" />
                        Email Summary
                    </button>
                </div>

            </div>
            {
                showCustomModal && (
                    <CustomReportModal
                        onClose={() => setShowCustomModal(false)}
                        onReportGenerated={(newReport) => {
                            setStats(prev => prev ? {
                                ...prev,
                                reports: [newReport, ...prev.reports],
                                totalReports: (prev.totalReports || 0) + 1,
                            } : prev);
                        }}
                    />
                )
            }
        </DashboardLayout>
    );
};

export default Reports;
