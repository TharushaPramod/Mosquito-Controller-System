import React, { useState } from 'react';
import { X, FileText, Download, Loader2 } from 'lucide-react';
import { generateReportPDF } from '../Components/Utils/generateReportPDF';
import clsx from 'clsx';

const BASE = import.meta.env.VITE_API_URL;

const DISTRICTS = [
    'All Districts', 'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
    'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar', 'Vavuniya',
    'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee', 'Kurunegala', 'Puttalam',
    'Anuradhapura', 'Polonnaruwa', 'Badulla', 'Moneragala', 'Ratnapura', 'Kegalle', 'Kalmunai',
];

const CATEGORIES = ['Epidemiology', 'Operations', 'Analytics', 'Resources'];
const DISEASE_TYPES = ['All', 'Dengue', 'Chikungunya'];

const CustomReportModal = ({ onClose, onReportGenerated }) => {
    const [form, setForm] = useState({
        title: '',
        category: 'Epidemiology',
        district: 'All Districts',
        diseaseType: 'All',
        startDate: '',
        endDate: '',
        notes: '',
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);
    const [preview, setPreview] = useState(null);

    const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

    // Fetch a preview of the data that would go into the report
    const fetchPreview = async () => {
        if (!form.startDate || !form.endDate) return;
        try {
            const params = new URLSearchParams({
                ...(form.district !== 'All Districts' && { district: form.district }),
                ...(form.diseaseType !== 'All' && { diseaseType: form.diseaseType }),
                startDate: form.startDate,
                endDate: form.endDate,
            });
            const res = await fetch(`${BASE}/heatmap/outbreak-history?${params}`);
            const data = await res.json();
            if (data.success) {
                const rows = data.data || [];
                const totalCases = rows.reduce((s, r) => s + r.reportedCases, 0);
                const totalDeaths = rows.reduce((s, r) => s + r.deaths, 0);
                setPreview({ rows: rows.length, totalCases, totalDeaths });
            }
        } catch (_) { }
    };

    const handleGenerate = async () => {
        if (!form.title.trim()) { setError('Please enter a report title.'); return; }
        if (!form.startDate || !form.endDate) { setError('Please select a date range.'); return; }
        if (new Date(form.endDate) < new Date(form.startDate)) { setError('End date must be after start date.'); return; }

        setLoading(true);
        setError(null);

        try {
            // Fetch the actual data
            const params = new URLSearchParams({
                ...(form.district !== 'All Districts' && { district: form.district }),
                ...(form.diseaseType !== 'All' && { diseaseType: form.diseaseType }),
                startDate: form.startDate,
                endDate: form.endDate,
            });
            const res = await fetch(`${BASE}/heatmap/outbreak-history?${params}`);
            const data = await res.json();
            const rows = data.data || [];

            // Generate styled PDF
            const reportMeta = {
                title: form.title,
                category: form.category,
                district: form.district !== 'All Districts' ? form.district : 'All Districts',
                province: '',
                notes: form.notes,
            };
            await generateReportPDF(reportMeta, rows);

            setSuccess(true);
            // Notify parent to refresh report list
            if (onReportGenerated) onReportGenerated({
                id: Date.now(),
                title: form.title,
                category: form.category,
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
                fileSize: (rows.length * 0.05 + 0.5).toFixed(1) + ' MB',
                cases: rows.reduce((s, r) => s + r.reportedCases, 0),
                deaths: rows.reduce((s, r) => s + r.deaths, 0),
                district: form.district,
                province: '',
                type: 'CSV',
            });

            setTimeout(onClose, 1800);
        } catch (e) {
            setError('Failed to generate report. Please try again.');
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#F0F7F5] flex items-center justify-center text-[#2F6A5F]">
                            <FileText size={16} />
                        </div>
                        <h2 className="text-sm font-extrabold text-gray-800 uppercase tracking-wider">Custom Report</h2>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                        <X size={16} />
                    </button>
                </div>

                {/* Form */}
                <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4">

                    {/* Title */}
                    <div>
                        <label className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest mb-1 block">
                            Report Title <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. Colombo Dengue Summary Q1 2026"
                            value={form.title}
                            onChange={e => set('title', e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs font-medium outline-none focus:ring-2 focus:ring-[#2F6A5F]/20 focus:border-[#2F6A5F] transition-all"
                        />
                    </div>

                    {/* Category + Disease row */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest mb-1 block">Category</label>
                            <select
                                value={form.category}
                                onChange={e => set('category', e.target.value)}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs font-medium outline-none focus:ring-2 focus:ring-[#2F6A5F]/20 focus:border-[#2F6A5F] transition-all bg-white"
                            >
                                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest mb-1 block">Disease Type</label>
                            <select
                                value={form.diseaseType}
                                onChange={e => set('diseaseType', e.target.value)}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs font-medium outline-none focus:ring-2 focus:ring-[#2F6A5F]/20 focus:border-[#2F6A5F] transition-all bg-white"
                            >
                                {DISEASE_TYPES.map(d => <option key={d}>{d}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* District */}
                    <div>
                        <label className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest mb-1 block">District</label>
                        <select
                            value={form.district}
                            onChange={e => set('district', e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs font-medium outline-none focus:ring-2 focus:ring-[#2F6A5F]/20 focus:border-[#2F6A5F] transition-all bg-white"
                        >
                            {DISTRICTS.map(d => <option key={d}>{d}</option>)}
                        </select>
                    </div>

                    {/* Date range */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest mb-1 block">
                                Start Date <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="date"
                                value={form.startDate}
                                onChange={e => { set('startDate', e.target.value); }}
                                onBlur={fetchPreview}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs font-medium outline-none focus:ring-2 focus:ring-[#2F6A5F]/20 focus:border-[#2F6A5F] transition-all"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest mb-1 block">
                                End Date <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="date"
                                value={form.endDate}
                                onChange={e => set('endDate', e.target.value)}
                                onBlur={fetchPreview}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs font-medium outline-none focus:ring-2 focus:ring-[#2F6A5F]/20 focus:border-[#2F6A5F] transition-all"
                            />
                        </div>
                    </div>

                    {/* Data preview */}
                    {preview && (
                        <div className="bg-[#F0F7F5] rounded-lg px-4 py-3 flex gap-6 text-xs">
                            <div><span className="text-gray-500">Records:</span> <strong className="text-[#2F6A5F]">{preview.rows}</strong></div>
                            <div><span className="text-gray-500">Total Cases:</span> <strong className="text-[#2F6A5F]">{preview.totalCases}</strong></div>
                            <div><span className="text-gray-500">Deaths:</span> <strong className="text-red-500">{preview.totalDeaths}</strong></div>
                        </div>
                    )}

                    {/* Notes */}
                    <div>
                        <label className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest mb-1 block">Notes (optional)</label>
                        <textarea
                            rows={2}
                            placeholder="Additional notes or context for this report..."
                            value={form.notes}
                            onChange={e => set('notes', e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs font-medium outline-none focus:ring-2 focus:ring-[#2F6A5F]/20 focus:border-[#2F6A5F] transition-all resize-none"
                        />
                    </div>

                    {error && <p className="text-xs text-red-500 font-semibold">{error}</p>}

                    {success && (
                        <div className="bg-green-50 border border-green-100 rounded-lg px-4 py-3 text-xs text-green-700 font-semibold text-center">
                            ✅ Report generated and downloaded successfully!
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg border border-gray-200 text-gray-500 text-xs font-bold hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleGenerate}
                        disabled={loading || success}
                        className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[#2F6A5F] text-white text-xs font-bold hover:bg-[#1A3D37] transition-colors disabled:opacity-60"
                    >
                        {loading
                            ? <><Loader2 size={14} className="animate-spin" /> Generating...</>
                            : <><Download size={14} /> Generate & Download</>
                        }
                    </button>
                </div>

            </div>
        </div>
    );
};

export default CustomReportModal;
