import React, { useState } from 'react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import {
    FileText,
    Download,
    Filter,
    Calendar,
    Search,
    ChevronRight,
    PieChart,
    BarChart3,
    FileSpreadsheet,
    Printer,
    Mail
} from 'lucide-react';
import clsx from 'clsx';

const ReportCard = ({ report }) => {
    return (
        <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-lg transition-all group flex flex-col gap-4">
            <div className="flex justify-between items-start">
                <div className="p-2.5 rounded-xl bg-[#F0F7F5] text-[#2F6A5F]">
                    <FileText size={20} />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition-colors" title="Download">
                        <Download size={16} />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition-colors" title="Print">
                        <Printer size={16} />
                    </button>
                </div>
            </div>

            <div>
                <h3 className="font-bold text-gray-800 text-xs mb-1 group-hover:text-[#2F6A5F] transition-colors">{report.title}</h3>
                <p className="text-[9px] text-gray-400 font-extrabold uppercase tracking-wider">{report.category}</p>
            </div>

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

const Reports = () => {
    const [selectedCategory, setSelectedCategory] = useState('All');

    const reports = [
        {
            id: 1,
            title: "District Outbreak Summary - Dec 2025",
            category: "Epidemiology",
            date: "Jan 02, 2026",
            fileSize: "2.4 MB",
            type: "PDF"
        },
        {
            id: 2,
            title: "Hospital Reporting Compliance Q4",
            category: "Operations",
            date: "Jan 01, 2026",
            fileSize: "1.8 MB",
            type: "Excel"
        },
        {
            id: 3,
            title: "Mosquito Density vs Case Correlation",
            category: "Analytics",
            date: "Dec 28, 2025",
            fileSize: "4.2 MB",
            type: "PDF"
        },
        {
            id: 4,
            title: "Western Province Health Facility Inventory",
            category: "Resources",
            date: "Dec 20, 2025",
            fileSize: "3.1 MB",
            type: "CSV"
        },
        {
            id: 5,
            title: "Vaccine Distribution Impact Report",
            category: "Epidemiology",
            date: "Dec 15, 2025",
            fileSize: "1.2 MB",
            type: "PDF"
        },
        {
            id: 6,
            title: "MOH Daily Field Surveillance Logs",
            category: "Operations",
            date: "Dec 10, 2025",
            fileSize: "5.5 MB",
            type: "ZIP"
        }
    ];

    const categories = ['All', 'Epidemiology', 'Operations', 'Analytics', 'Resources'];

    const filteredReports = reports.filter(r =>
        selectedCategory === 'All' || r.category === selectedCategory
    );

    return (
        <DashboardLayout title="Health Data Reports & Analytics">
            <div className="flex flex-col gap-6 max-w-6xl mx-auto">

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-[#2F6A5F] rounded-xl p-4 text-white shadow-lg shadow-[#2F6A5F]/20 relative overflow-hidden group">
                        <div className="relative z-10">
                            <h4 className="text-white/70 text-[9px] uppercase font-bold tracking-widest mb-1">Total Reports</h4>
                            <div className="text-2xl font-extrabold mb-3">128</div>
                            <button className="flex items-center gap-2 text-[10px] font-bold bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-all uppercase tracking-wider">
                                New Report
                                <ChevronRight size={12} />
                            </button>
                        </div>
                        <FileText size={60} className="absolute -right-2 -bottom-2 text-white/10 group-hover:scale-110 transition-transform duration-500" />
                    </div>

                    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center gap-5">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0 shadow-inner">
                            <BarChart3 size={20} />
                        </div>
                        <div>
                            <h4 className="text-gray-400 text-[9px] uppercase font-extrabold tracking-widest mb-0.5">Automated Logs</h4>
                            <div className="text-xl font-extrabold text-gray-800 leading-tight">2,450</div>
                            <p className="text-[9px] text-green-500 font-bold uppercase tracking-tight">+12% LAST MONTH</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center gap-5">
                        <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0 shadow-inner">
                            <PieChart size={20} />
                        </div>
                        <div>
                            <h4 className="text-gray-400 text-[9px] uppercase font-extrabold tracking-widest mb-0.5">Data Accuracy</h4>
                            <div className="text-xl font-extrabold text-gray-800 leading-tight">98.2%</div>
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
                                className="pl-9 pr-4 py-1.5 rounded-lg bg-gray-50 border-transparent focus:bg-white focus:border-[#2F6A5F] text-[10px] font-bold outline-none transition-all w-full md:w-64"
                            />
                        </div>
                        <button className="p-2 rounded-lg bg-gray-50 text-gray-400 hover:bg-[#2F6A5F] hover:text-white transition-all">
                            <Filter size={14} />
                        </button>
                    </div>
                </div>

                {/* Reports Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredReports.map(report => (
                        <ReportCard key={report.id} report={report} />
                    ))}

                    {/* Upload/Custom Card */}
                    <button className="border-2 border-dashed border-gray-100 rounded-xl p-6 flex flex-col items-center justify-center gap-2 text-gray-300 hover:border-[#2F6A5F] hover:text-[#2F6A5F] hover:bg-[#F0F7F5] transition-all group">
                        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-[#2F6A5F]/10 transition-colors">
                            <Download className="rotate-180" size={16} />
                        </div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider">Custom Report</span>
                    </button>
                </div>

                {/* Export Options */}
                <div className="flex justify-center gap-3 mt-2">
                    <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white border border-gray-100 text-gray-500 font-extrabold text-[10px] uppercase tracking-wider hover:bg-gray-50 transition-all shadow-sm">
                        <FileSpreadsheet size={14} className="text-green-600" />
                        Export CSV
                    </button>
                    <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white border border-gray-100 text-gray-500 font-extrabold text-[10px] uppercase tracking-wider hover:bg-gray-50 transition-all shadow-sm">
                        <Mail size={14} className="text-blue-500" />
                        Email Summary
                    </button>
                </div>

            </div>
        </DashboardLayout>
    );
};

export default Reports;
