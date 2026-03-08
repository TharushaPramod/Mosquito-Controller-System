import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, FileText, Trash2 } from 'lucide-react';

const BASE = import.meta.env.VITE_API_URL;

const DISEASE_TYPES = ['dengue', 'chikungunya'];
const SEVERITY_LEVELS = ['LOW', 'MEDIUM', 'HIGH'];
const AGE_GROUPS = ['0-10', '11-20', '21-30', '31-40', '41-50', '51-60', '60+', 'Mixed'];
const SOURCES = ['Manual', 'API', 'MOH Reports', 'PHI Reports'];

const FIELD = ({ label, required, error, children }) => (
    <div className="flex flex-col gap-1">
        <label className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest">
            {label} {required && <span className="text-red-400">*</span>}
        </label>
        {children}
        {error && <p className="text-[10px] text-red-500">{error}</p>}
    </div>
);

const INPUT = "w-full border border-gray-200 rounded-lg px-3 py-2 text-xs font-medium outline-none focus:ring-2 focus:ring-[#2F6A5F]/20 focus:border-[#2F6A5F] transition-all";
const SELECT = INPUT + " bg-white";

const EditReportModal = ({ hospital, report, onClose, onUpdated }) => {
    const today = new Date().toISOString().split('T')[0];

    // Convert date "DD/MM/YYYY" to "YYYY-MM-DD" if needed, 
    // or just use the report object's raw date if we had it.
    // The report prop from FacilityDetail.jsx has: 
    // date: "DD/MM/YYYY"
    // So we need to parse it or just assume we'll pass the whole original object.

    const parseDate = (d) => {
        if (!d) return today;
        const [day, month, year] = d.split('/');
        return `${year}-${month}-${day}`;
    };

    const [form, setForm] = useState({
        reportedAt: parseDate(report.date),
        diseaseType: report.disease || 'dengue',
        caseCount: report.confirmed,
        suspectedCount: report.suspected,
        deathCount: report.death,
        severityLevel: report.severity || 'MEDIUM',
        ageGroup: report.ageGroup || 'Mixed',
        source: report.source || 'Manual',
        notes: report.notes || '',
    });

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);
    const [errors, setErrors] = useState({});

    const set = (k, v) => {
        setForm(f => ({ ...f, [k]: v }));
        setErrors(e => ({ ...e, [k]: null }));
        setError(null);
    };

    const validate = () => {
        const e = {};
        if (!form.reportedAt) e.reportedAt = 'Date is required';
        if (form.caseCount === '' || isNaN(form.caseCount) || +form.caseCount < 0)
            e.caseCount = 'Enter a valid case count';
        if (form.suspectedCount !== '' && isNaN(form.suspectedCount))
            e.suspectedCount = 'Must be a number';
        if (isNaN(form.deathCount) || +form.deathCount < 0)
            e.deathCount = 'Must be 0 or more';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setLoading(true); setError(null);

        const reportDate = new Date(form.reportedAt);
        const payload = {
            diseaseType: form.diseaseType,
            caseCount: parseInt(form.caseCount) || 0,
            suspectedCount: parseInt(form.suspectedCount) || 0,
            deathCount: parseInt(form.deathCount) || 0,
            severityLevel: form.severityLevel,
            ageGroup: form.ageGroup,
            source: form.source,
            notes: form.notes,
            reportedAt: reportDate.toISOString(),
        };

        try {
            const res = await fetch(`${BASE}/case-reports/${report._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (data.success) {
                setSuccess(true);
                if (onUpdated) onUpdated(data.data);
                setTimeout(onClose, 1200);
            } else {
                setError(data.message || 'Failed to update report');
            }
        } catch {
            setError('Could not connect to backend');
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[92vh] overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-[#F0F7F5] rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#64B49F] flex items-center justify-center text-white">
                            <FileText size={18} />
                        </div>
                        <div>
                            <h2 className="text-sm font-extrabold text-[#1A3D37] uppercase tracking-wider">Edit Case Report</h2>
                            <p className="text-[10px] text-gray-400 truncate max-w-[280px]">{hospital?.name}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-400 transition-colors">
                        <X size={16} />
                    </button>
                </div>

                {/* Form */}
                <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">

                    {/* Date + Disease */}
                    <div className="grid grid-cols-2 gap-3">
                        <FIELD label="Report Date" required error={errors.reportedAt}>
                            <input type="date" value={form.reportedAt} max={today}
                                onChange={e => set('reportedAt', e.target.value)}
                                className={INPUT + (errors.reportedAt ? ' border-red-300' : '')} />
                        </FIELD>
                        <FIELD label="Disease Type" required>
                            <select value={form.diseaseType} onChange={e => set('diseaseType', e.target.value)} className={SELECT}>
                                {DISEASE_TYPES.map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
                            </select>
                        </FIELD>
                    </div>

                    {/* Cases row */}
                    <div className="grid grid-cols-3 gap-3">
                        <FIELD label="Confirmed Cases" required error={errors.caseCount}>
                            <input type="number" min="0" placeholder="0"
                                value={form.caseCount} onChange={e => set('caseCount', e.target.value)}
                                className={INPUT + (errors.caseCount ? ' border-red-300' : '')} />
                        </FIELD>
                        <FIELD label="Suspected Cases" error={errors.suspectedCount}>
                            <input type="number" min="0" placeholder="0"
                                value={form.suspectedCount} onChange={e => set('suspectedCount', e.target.value)}
                                className={INPUT} />
                        </FIELD>
                        <FIELD label="Deaths" error={errors.deathCount}>
                            <input type="number" min="0" placeholder="0"
                                value={form.deathCount} onChange={e => set('deathCount', e.target.value)}
                                className={INPUT + (errors.deathCount ? ' border-red-300' : '')} />
                        </FIELD>
                    </div>

                    {/* Severity + Age + Source */}
                    <div className="grid grid-cols-3 gap-3">
                        <FIELD label="Severity">
                            <select value={form.severityLevel} onChange={e => set('severityLevel', e.target.value)} className={SELECT}>
                                {SEVERITY_LEVELS.map(s => <option key={s}>{s}</option>)}
                            </select>
                        </FIELD>
                        <FIELD label="Age Group">
                            <select value={form.ageGroup} onChange={e => set('ageGroup', e.target.value)} className={SELECT}>
                                {AGE_GROUPS.map(a => <option key={a}>{a}</option>)}
                            </select>
                        </FIELD>
                        <FIELD label="Source">
                            <select value={form.source} onChange={e => set('source', e.target.value)} className={SELECT}>
                                {SOURCES.map(s => <option key={s}>{s}</option>)}
                            </select>
                        </FIELD>
                    </div>

                    {/* Notes */}
                    <FIELD label="Notes (optional)">
                        <textarea rows={2} placeholder="Any additional observations..."
                            value={form.notes} onChange={e => set('notes', e.target.value)}
                            className={INPUT + " resize-none"} />
                    </FIELD>

                    {error && <p className="text-xs text-red-500 font-semibold bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
                    {success && (
                        <div className="bg-green-50 border border-green-100 rounded-lg px-4 py-3 text-xs text-green-700 font-semibold text-center">
                            ✅ Report updated successfully!
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end bg-gray-50 rounded-b-2xl">
                    <button onClick={onClose}
                        className="px-4 py-2 rounded-lg border border-gray-200 text-gray-500 text-xs font-bold hover:bg-gray-100 transition-colors">
                        Cancel
                    </button>
                    <button onClick={handleSubmit} disabled={loading || success}
                        className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[#64B49F] text-white text-xs font-bold hover:bg-[#1A3D37] transition-colors disabled:opacity-60">
                        {loading
                            ? <><Loader2 size={14} className="animate-spin" /> Updating...</>
                            : <><Save size={14} /> Update Report</>
                        }
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditReportModal;
