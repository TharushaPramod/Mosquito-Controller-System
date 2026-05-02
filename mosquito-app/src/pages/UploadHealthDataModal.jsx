import React, { useState } from 'react';
import { X, Upload, CheckCircle, AlertCircle, Loader, Activity, Users, Shield, FileText } from 'lucide-react';


const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5002/api';

const DISTRICTS = [
    'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo', 'Galle', 'Gampaha',
    'Hambantota', 'Jaffna', 'Kalutara', 'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala',
    'Mannar', 'Matale', 'Matara', 'Moneragala', 'Mullaitivu', 'Nuwara Eliya',
    'Polonnaruwa', 'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya', 'Kalmunai',
];

const HOSPITAL_MAP = {
    'Colombo': 'Colombo National Hospital',
    'Gampaha': 'Gampaha General Hospital',
    'Kalutara': 'Kalutara District Hospital',
    'Kandy': 'Kandy Teaching Hospital',
    'Matale': 'Matale District Hospital',
    'Nuwara Eliya': 'Nuwara Eliya District Hospital',
    'Galle': 'Galle Base Hospital',
    'Matara': 'Matara General Hospital',
    'Hambantota': 'Hambantota District Hospital',
    'Jaffna': 'Jaffna Teaching Hospital',
    'Kilinochchi': 'Kilinochchi District Hospital',
    'Mannar': 'Mannar District Hospital',
    'Vavuniya': 'Vavuniya General Hospital',
    'Mullaitivu': 'Mullaitivu District Hospital',
    'Batticaloa': 'Batticaloa Teaching Hospital',
    'Ampara': 'Ampara District Hospital',
    'Trincomalee': 'Trincomalee District Hospital',
    'Kurunegala': 'Kurunegala Teaching Hospital',
    'Puttalam': 'Puttalam District Hospital',
    'Anuradhapura': 'Anuradhapura Teaching Hospital',
    'Polonnaruwa': 'Polonnaruwa District Hospital',
    'Badulla': 'Badulla District Hospital',
    'Moneragala': 'Moneragala District Hospital',
    'Ratnapura': 'Ratnapura District Hospital',
    'Kegalle': 'Kegalle District Hospital',
    'Kalmunai': 'Kalmunai District Hospital',
};

const PROVINCE_MAP = {
    'Colombo': 'Western', 'Gampaha': 'Western', 'Kalutara': 'Western',
    'Kandy': 'Central', 'Matale': 'Central', 'Nuwara Eliya': 'Central',
    'Galle': 'Southern', 'Matara': 'Southern', 'Hambantota': 'Southern',
    'Jaffna': 'Northern', 'Kilinochchi': 'Northern', 'Mannar': 'Northern', 'Vavuniya': 'Northern', 'Mullaitivu': 'Northern',
    'Batticaloa': 'Eastern', 'Ampara': 'Eastern', 'Trincomalee': 'Eastern', 'Kalmunai': 'Eastern',
    'Kurunegala': 'North Western', 'Puttalam': 'North Western',
    'Anuradhapura': 'North Central', 'Polonnaruwa': 'North Central',
    'Badulla': 'Uva', 'Moneragala': 'Uva',
    'Ratnapura': 'Sabaragamuwa', 'Kegalle': 'Sabaragamuwa',
};

const COORDS_MAP = {
    'Colombo': [6.9271, 79.8612], 'Gampaha': [7.0873, 80.0144], 'Kalutara': [6.5854, 79.9607],
    'Kandy': [7.2906, 80.6337], 'Matale': [7.4675, 80.6234], 'Nuwara Eliya': [6.9497, 80.7891],
    'Galle': [6.0535, 80.2210], 'Matara': [5.9549, 80.5550], 'Hambantota': [6.1429, 81.1212],
    'Jaffna': [9.6615, 80.0255], 'Kilinochchi': [9.3803, 80.4006], 'Mannar': [8.9810, 79.9044],
    'Vavuniya': [8.7514, 80.4971], 'Mullaitivu': [9.2671, 80.8128], 'Batticaloa': [7.7170, 81.7004],
    'Ampara': [7.3004, 81.6738], 'Trincomalee': [8.5874, 81.2152], 'Kurunegala': [7.4867, 80.3647],
    'Puttalam': [8.0362, 79.8283], 'Anuradhapura': [8.3114, 80.4037], 'Polonnaruwa': [7.9403, 81.0188],
    'Badulla': [6.9934, 81.0550], 'Moneragala': [6.8727, 81.3506], 'Ratnapura': [6.6828, 80.3992],
    'Kegalle': [7.2513, 80.3464], 'Kalmunai': [7.4148, 81.8261],
};

const EMPTY = {
    source: 'Hospital Facility',
    district: 'Colombo',
    diseaseType: 'dengue',
    caseCount: '', // Total for MOH
    suspectedCount: '', // For Hospital
    deathCount: '0',
    severityLevel: 'moderate',
    reportedAt: new Date().toISOString().split('T')[0],

    // Hospital Specifics
    admissions: '',
    warningSignsCount: '',

    // MOH Specifics
    dfCount: '',
    dhfCount: '',
    maleCount: '',
    femaleCount: '',

    hospitalId: '',
    hospitalName: '',
    notes: '',
};

const SectionHeader = ({ icon: Icon, title }) => (
    <div className="flex items-center gap-2 mb-3 pb-1 border-b border-gray-100">
        <div className="p-1.5 bg-gray-50 rounded-lg text-[#2F6A5F]">
            <Icon size={14} />
        </div>
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{title}</h3>
    </div>
);

const Field = ({ label, required, children, helper }) => (
    <div className="flex flex-col gap-1">
        <label className="text-[10px] font-extrabold text-[#1A3D37]/70 uppercase tracking-widest flex justify-between items-center">
            <span>{label}{required && <span className="text-red-500 ml-0.5">*</span>}</span>
            {helper && <span className="text-[8px] font-bold text-gray-400 normal-case">{helper}</span>}
        </label>
        {children}
    </div>
);

const inputCls = "px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-lg text-xs text-[#1A3D37] font-bold outline-none focus:border-[#2D6A5D] focus:bg-white focus:ring-4 focus:ring-[#2D6A5D]/5 transition-all w-full placeholder:text-gray-300";
const selectCls = inputCls + " cursor-pointer appearance-none";

export default function UploadHealthDataModal({ onClose }) {
    const [form, setForm] = useState({ ...EMPTY });
    const [status, setStatus] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');

    const [hospitals, setHospitals] = useState([]);
    const [filteredFacilities, setFilteredFacilities] = useState([]);
    const [loadingFacilities, setLoadingFacilities] = useState(false);

    // Fetch all facilities once
    React.useEffect(() => {
        const fetchHospitals = async () => {
            try {
                const res = await fetch(`${BASE}/hospitals`);
                const data = await res.json();
                if (data.success) setHospitals(data.data);
            } catch (e) { console.error('Failed to fetch hospitals', e); }
        };
        fetchHospitals();
    }, []);

    // Filter facilities based on district and source
    React.useEffect(() => {
        const typeFilter = form.source === 'Hospital Facility'
            ? ['National Hospital', 'Teaching Hospital', 'General Hospital', 'Base Hospital', 'District Hospital', 'Divisional Hospital']
            : ['PHI'];

        const filtered = hospitals.filter(h =>
            h.district.toLowerCase() === form.district.toLowerCase() &&
            typeFilter.includes(h.type)
        );

        setFilteredFacilities(filtered);

        // Auto-select first facility if none selected or if list changed
        if (filtered.length > 0) {
            const currentSelectedExists = filtered.find(f => f.hospitalId === form.hospitalId);
            if (!currentSelectedExists) {
                setForm(prev => ({
                    ...prev,
                    hospitalId: filtered[0].hospitalId,
                    hospitalName: filtered[0].name
                }));
            }
        } else {
            setForm(prev => ({ ...prev, hospitalId: '', hospitalName: '' }));
        }
    }, [form.district, form.source, hospitals]);

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const handleSourceChange = (src) => {
        setForm({ ...EMPTY, source: src, district: form.district, reportedAt: form.reportedAt, hospitalId: '', hospitalName: '' });
    };

    const validate = () => {
        if (!form.district) return 'District is required';
        if (!form.hospitalId) return form.source === 'Hospital Facility' ? 'Please select a hospital' : 'Please select a PHI Unit';
        if (form.source === 'Hospital Facility' && !form.admissions) return 'Total admissions is required for hospital data';
        if (form.source === 'MOH Epidemiological' && !form.caseCount) return 'Total registered cases is required for MOH report';
        if (!form.reportedAt) return 'Report date is required';
        return null;
    };

    const handleSubmit = async () => {
        const err = validate();
        if (err) { setErrorMsg(err); return; }
        setErrorMsg('');
        setStatus('loading');

        const activeHospital = hospitals.find(h => h.hospitalId === form.hospitalId);
        const lat = activeHospital?.location?.lat || COORDS_MAP[form.district][0];
        const lng = activeHospital?.location?.lng || COORDS_MAP[form.district][1];

        const d = new Date(form.reportedAt);
        const week = Math.ceil(((d - new Date(d.getFullYear(), 0, 1)) / 86400000 + 1) / 7);

        // Map UI values to backend CaseReport schema
        const payload = {
            hospitalId: form.hospitalId,
            hospitalName: form.hospitalName,
            district: form.district,
            province: PROVINCE_MAP[form.district] || 'Unknown',
            location: { lat: Number(lat), lng: Number(lng) },
            diseaseType: form.diseaseType,

            // Unified Case Counts
            caseCount: Number(form.caseCount || form.admissions || 0),
            suspectedCount: Number(form.suspectedCount || 0),
            confirmedCount: 0,
            confirmedNS1: 0,
            confirmedIgM: 0,
            deathCount: Number(form.deathCount) || 0,

            // Clinical
            dfCount: Number(form.dfCount || 0),
            dhfCount: Number(form.dhfCount || 0),
            severeDengueCount: 0,
            warningSignsCount: Number(form.warningSignsCount || 0),

            // Demographics
            maleCount: Number(form.maleCount || 0),
            femaleCount: Number(form.femaleCount || 0),
            ageGroup: form.maleCount ? "Categorized" : "Mixed",

            severityLevel: form.severityLevel.toUpperCase(),
            weekNumber: Number(week),
            month: Number(d.getMonth() + 1),
            year: Number(d.getFullYear()),
            reportedAt: d.toISOString(),
            source: form.source,
            notes: form.notes,
            verified: form.source === 'MOH Epidemiological',
        };

        try {
            const res = await fetch(`${BASE}/case-reports`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (data.success) {
                setStatus('success');
                setTimeout(() => { onClose(); }, 2000);
            } else {
                setErrorMsg(data.message || 'Submission failed');
                setStatus('error');
            }
        } catch (e) {
            setErrorMsg('Network error — check backend connection');
            setStatus('error');
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-white/20">

                {/* Header Section */}
                <div className="bg-gradient-to-r from-[#2F6A5F] to-[#1A3D37] p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                    <div className="relative z-10 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-3">
                                <Activity className="text-green-400" size={24} /> Health Data Integration
                            </h2>
                            <p className="text-white/60 text-xs font-medium mt-1 uppercase tracking-widest">Formal Reporting Gateway</p>
                        </div>
                        <button onClick={onClose} className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all text-white backdrop-blur-md">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <div className="flex flex-col gap-8">

                        {/* Source Configuration */}
                        <div className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
                            <SectionHeader icon={Shield} title="Reporting Authority" />
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { label: 'Hospital Facility', icon: Activity, desc: 'Clinical patient data' },
                                    { label: 'MOH Epidemiological', icon: Users, desc: 'Community notification' }
                                ].map(src => (
                                    <button key={src.label}
                                        onClick={() => handleSourceChange(src.label)}
                                        className={`p-4 rounded-2xl border transition-all flex flex-col text-left gap-1 group ${form.source === src.label
                                            ? 'bg-white border-[#2D6A5D] shadow-xl shadow-[#2D6A5D]/10 ring-2 ring-[#2D6A5D]/5'
                                            : 'bg-white/50 border-gray-200 hover:border-[#2D6A5D]/30'
                                            }`}>
                                        <div className={`p-2 w-fit rounded-xl mb-1 transition-colors ${form.source === src.label ? 'bg-[#2D6A5D] text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-[#2D6A5D]/10 group-hover:text-[#2D6A5D]'}`}>
                                            <src.icon size={18} />
                                        </div>
                                        <span className={`text-xs font-black uppercase tracking-tight ${form.source === src.label ? 'text-[#1A3D37]' : 'text-gray-400'}`}>{src.label}</span>
                                        <span className="text-[10px] text-gray-400 font-medium">{src.desc}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Row 1 — District + Facility Selection */}
                        <div className="grid grid-cols-2 gap-6">
                            <Field label="Reporting District" required>
                                <select className={selectCls} value={form.district} onChange={e => set('district', e.target.value)}>
                                    {DISTRICTS.map(d => <option key={d}>{d}</option>)}
                                </select>
                            </Field>
                            <Field
                                label={form.source === 'Hospital Facility' ? 'Target Hospital' : 'PHI Unit'}
                                required
                                helper={filteredFacilities.length === 0 ? "No units defined for this district" : ""}
                            >
                                <select
                                    className={selectCls}
                                    value={form.hospitalId}
                                    onChange={e => {
                                        const h = filteredFacilities.find(f => f.hospitalId === e.target.value);
                                        setForm(prev => ({ ...prev, hospitalId: e.target.value, hospitalName: h?.name || '' }));
                                    }}
                                    disabled={filteredFacilities.length === 0}
                                >
                                    {filteredFacilities.map(f => (
                                        <option key={f.hospitalId} value={f.hospitalId}>{f.name}</option>
                                    ))}
                                    {filteredFacilities.length === 0 && <option value="">N/A</option>}
                                </select>
                            </Field>
                        </div>

                        {/* Row 2 — Date & Disease Type */}
                        <div className="grid grid-cols-2 gap-6">
                            <Field label="Reporting Date" required helper="Date symptoms appeared or notified">
                                <input type="date" className={inputCls} value={form.reportedAt} onChange={e => set('reportedAt', e.target.value)} />
                            </Field>
                            <Field label="Infection Category" required>
                                <select className={selectCls} value={form.diseaseType} onChange={e => set('diseaseType', e.target.value)}>
                                    <option value="dengue">Dengue Fever</option>
                                    <option value="chikungunya">Chikungunya Virus</option>
                                </select>
                            </Field>
                        </div>

                        {/* Conditional Fields: Hospital Facility */}
                        {form.source === 'Hospital Facility' && (
                            <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-400">
                                <div className="bg-[#EEF7F4] p-6 rounded-3xl space-y-6">
                                    <SectionHeader icon={FileText} title="Clinical Metrics" />
                                    <div className="grid grid-cols-2 gap-6">
                                        <Field label="Total Admissions" required helper="In-patient admissions today">
                                            <input type="number" className={inputCls} placeholder="0" value={form.admissions} onChange={e => set('admissions', e.target.value)} />
                                        </Field>
                                        <Field label="Suspected Cases" helper="Symptoms without lab confirmation">
                                            <input type="number" className={inputCls} placeholder="0" value={form.suspectedCount} onChange={e => set('suspectedCount', e.target.value)} />
                                        </Field>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6 pt-2">
                                        <Field label="Fatalities" helper="Dengue related deaths">
                                            <input type="number" className={inputCls} placeholder="0" value={form.deathCount} onChange={e => set('deathCount', e.target.value)} />
                                        </Field>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Conditional Fields: MOH Epidemiological */}
                        {form.source === 'MOH Epidemiological' && (
                            <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-400">
                                <div className="bg-[#F4F5F9] p-6 rounded-3xl space-y-6">
                                    <SectionHeader icon={Users} title="Epidemiological Summary" />
                                    <div className="grid grid-cols-2 gap-6">
                                        <Field label="Registered Cases" required helper="Total H-399 forms received">
                                            <input type="number" className={inputCls} placeholder="0" value={form.caseCount} onChange={e => set('caseCount', e.target.value)} />
                                        </Field>
                                        <Field label="Clinical Type (DF)" helper="Simple Dengue Fever">
                                            <input type="number" className={inputCls} placeholder="0" value={form.dfCount} onChange={e => set('dfCount', e.target.value)} />
                                        </Field>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6 pt-2">
                                        <Field label="Categorization (Male)">
                                            <input type="number" className={inputCls} placeholder="0" value={form.maleCount} onChange={e => set('maleCount', e.target.value)} />
                                        </Field>
                                        <Field label="Categorization (Female)">
                                            <input type="number" className={inputCls} placeholder="0" value={form.femaleCount} onChange={e => set('femaleCount', e.target.value)} />
                                        </Field>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Severity & Remarks */}
                        <div className="grid grid-cols-1 gap-6">
                            <Field label="Localized Status Assessment">
                                <div className="flex gap-4 p-2 bg-gray-50 rounded-2xl border border-gray-100">
                                    {['Mild', 'Moderate', 'Severe'].map(lvl => (
                                        <button key={lvl}
                                            onClick={() => set('severityLevel', lvl.toLowerCase())}
                                            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${form.severityLevel === lvl.toLowerCase()
                                                ? 'bg-[#2D6A5D] text-white shadow-lg shadow-[#2D6A5D]/20'
                                                : 'text-gray-400 hover:text-gray-600'
                                                }`}>
                                            {lvl}
                                        </button>
                                    ))}
                                </div>
                            </Field>
                            <Field label="Internal Remarks / Notes">
                                <textarea rows={3} className={inputCls + ' resize-none'} placeholder="Document any cluster sightings or specific area feedback..." value={form.notes} onChange={e => set('notes', e.target.value)} />
                            </Field>
                        </div>

                        {/* Feedbacks */}
                        {errorMsg && (
                            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-[11px] text-red-600 font-bold animate-in bounce-in duration-300">
                                <AlertCircle size={16} /> {errorMsg}
                            </div>
                        )}

                        {status === 'success' && (
                            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-100 rounded-2xl text-[11px] text-green-700 font-bold animate-in zoom-in duration-300">
                                <CheckCircle size={16} /> Data integrated successfully into backend.
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="p-8 bg-gray-50/80 border-t border-gray-100 flex gap-4">
                    <button onClick={onClose} className="flex-1 py-4 px-6 rounded-2xl border border-gray-200 text-xs font-black text-[#1A3D37]/50 hover:bg-white hover:text-[#1A3D37] hover:border-[#2D6A5D]/10 tracking-widest uppercase transition-all">
                        Discard Draft
                    </button>
                    <button onClick={handleSubmit} disabled={status === 'loading'} className="flex-[2] py-4 px-8 bg-[#2F6A5F] text-white rounded-2xl text-xs font-black tracking-widest uppercase hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-[#2F6A5F]/20 flex items-center justify-center gap-3 disabled:opacity-60 disabled:scale-100">
                        {status === 'loading'
                            ? <><Loader size={16} className="animate-spin" /> Verifying Payload...</>
                            : <><Upload size={16} /> Authorize Integration</>}
                    </button>
                </div>
            </div>
        </div>
    );
}
