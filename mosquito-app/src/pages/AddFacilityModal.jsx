import React, { useState } from 'react';
import { X, Plus, Loader2, Building2 } from 'lucide-react';

const BASE = import.meta.env.VITE_API_URL;

const DISTRICTS = [
    'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
    'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
    'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
    'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
    'Moneragala', 'Ratnapura', 'Kegalle', 'Kalmunai',
];

const HOSPITAL_TYPES = [
    'National Hospital', 'Teaching Hospital', 'General Hospital',
    'Base Hospital', 'District Hospital', 'Divisional Hospital', 'PHI',
];

const FIELD = ({ label, required, children }) => (
    <div className="flex flex-col gap-1">
        <label className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest">
            {label} {required && <span className="text-red-400">*</span>}
        </label>
        {children}
    </div>
);

const INPUT_CLS = "w-full border border-gray-200 rounded-lg px-3 py-2 text-xs font-medium outline-none focus:ring-2 focus:ring-[#2F6A5F]/20 focus:border-[#2F6A5F] transition-all";
const SELECT_CLS = INPUT_CLS + " bg-white";

const AddFacilityModal = ({ onClose, onAdded }) => {
    const [form, setForm] = useState({
        name: '',
        district: '',
        type: 'District Hospital',
        contactPerson: '',
        contactPhone: '',
        contactEmail: '',
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);
    const [errors, setErrors] = useState({});

    const set = (k, v) => {
        setForm(f => ({ ...f, [k]: v }));
        setErrors(e => ({ ...e, [k]: null }));
    };

    const validate = () => {
        const e = {};
        if (!form.name.trim()) e.name = 'Facility name is required';
        if (!form.district) e.district = 'Please select a district';
        if (!form.type) e.type = 'Please select a facility type';
        if (form.contactEmail && !/\S+@\S+\.\S+/.test(form.contactEmail))
            e.contactEmail = 'Invalid email address';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${BASE}/hospitals`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (data.success) {
                setSuccess(true);
                if (onAdded) onAdded(data.data);
                setTimeout(onClose, 1800);
            } else {
                setError(data.message || 'Failed to add facility');
            }
        } catch (e) {
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
                        <div className="w-9 h-9 rounded-xl bg-[#2F6A5F] flex items-center justify-center text-white">
                            <Building2 size={18} />
                        </div>
                        <div>
                            <h2 className="text-sm font-extrabold text-[#1A3D37] uppercase tracking-wider">Add Health Facility</h2>
                            <p className="text-[10px] text-gray-400">Register a new hospital or health centre</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-400 transition-colors">
                        <X size={16} />
                    </button>
                </div>

                {/* Form */}
                <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">

                    {/* Facility Name */}
                    <FIELD label="Facility Name" required>
                        <input
                            type="text"
                            placeholder="e.g. Colombo National Hospital"
                            value={form.name}
                            onChange={e => set('name', e.target.value)}
                            className={INPUT_CLS + (errors.name ? ' border-red-300' : '')}
                        />
                        {errors.name && <p className="text-[10px] text-red-500">{errors.name}</p>}
                    </FIELD>

                    {/* District + Type row */}
                    <div className="grid grid-cols-2 gap-3">
                        <FIELD label="District" required>
                            <select
                                value={form.district}
                                onChange={e => set('district', e.target.value)}
                                className={SELECT_CLS + (errors.district ? ' border-red-300' : '')}
                            >
                                <option value="">Select district</option>
                                {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                            {errors.district && <p className="text-[10px] text-red-500">{errors.district}</p>}
                        </FIELD>

                        <FIELD label="Facility Type" required>
                            <select
                                value={form.type}
                                onChange={e => set('type', e.target.value)}
                                className={SELECT_CLS}
                            >
                                {HOSPITAL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </FIELD>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-100 pt-2">
                        <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-3">Contact Information</p>
                    </div>

                    {/* Contact Person */}
                    <FIELD label="Contact Person">
                        <input
                            type="text"
                            placeholder="e.g. Dr. Priyantha Silva"
                            value={form.contactPerson}
                            onChange={e => set('contactPerson', e.target.value)}
                            className={INPUT_CLS}
                        />
                    </FIELD>

                    {/* Phone + Email row */}
                    <div className="grid grid-cols-2 gap-3">
                        <FIELD label="Phone Number">
                            <input
                                type="tel"
                                placeholder="e.g. 011-2345678"
                                value={form.contactPhone}
                                onChange={e => set('contactPhone', e.target.value)}
                                className={INPUT_CLS}
                            />
                        </FIELD>

                        <FIELD label="Email Address">
                            <input
                                type="email"
                                placeholder="e.g. info@hospital.lk"
                                value={form.contactEmail}
                                onChange={e => set('contactEmail', e.target.value)}
                                className={INPUT_CLS + (errors.contactEmail ? ' border-red-300' : '')}
                            />
                            {errors.contactEmail && <p className="text-[10px] text-red-500">{errors.contactEmail}</p>}
                        </FIELD>
                    </div>

                    {/* Info note */}
                    <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 text-[10px] text-blue-600 leading-relaxed">
                        ℹ️ The facility will be assigned an auto-generated ID and added with <strong>Active</strong> status.
                        Province and coordinates are auto-filled based on the selected district.
                    </div>

                    {error && <p className="text-xs text-red-500 font-semibold bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
                    {success && (
                        <div className="bg-green-50 border border-green-100 rounded-lg px-4 py-3 text-xs text-green-700 font-semibold text-center">
                            ✅ Facility added successfully!
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end bg-gray-50 rounded-b-2xl">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg border border-gray-200 text-gray-500 text-xs font-bold hover:bg-gray-100 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || success}
                        className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[#2F6A5F] text-white text-xs font-bold hover:bg-[#1A3D37] transition-colors disabled:opacity-60"
                    >
                        {loading
                            ? <><Loader2 size={14} className="animate-spin" /> Adding...</>
                            : <><Plus size={14} /> Add Facility</>
                        }
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddFacilityModal;
