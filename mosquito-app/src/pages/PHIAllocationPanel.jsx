import React, { useState, useEffect, useCallback } from 'react';
import {
    MapPin, Users, AlertTriangle, CheckCircle, Download,
    RefreshCw, Bell, Filter, ChevronDown, X
} from 'lucide-react';

const BASE = import.meta.env.VITE_API_URL;

/* ─── helpers ──────────────────────────────────────────────────────────── */
const getRisk = (cases) => {
    if (cases > 100) return 'HIGH';
    if (cases >= 30) return 'MEDIUM';
    return 'LOW';
};

const getRiskConfig = (risk) => ({
    HIGH: { badge: 'bg-red-100 text-red-700 border border-red-200', btn: 'bg-red-600 hover:bg-red-700', label: 'HIGH', recommended: '6+', min: 6 },
    MEDIUM: { badge: 'bg-orange-100 text-orange-700 border border-orange-200', btn: 'bg-orange-500 hover:bg-orange-600', label: 'MEDIUM', recommended: '3–5', min: 3 },
    LOW: { badge: 'bg-green-100 text-green-700 border border-green-200', btn: 'bg-green-600 hover:bg-green-700', label: 'LOW', recommended: '1–2', min: 1 },
}[risk]);

const isoWeek = (date = new Date()) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
};

/* ─── Toast ────────────────────────────────────────────────────────────── */
const Toast = ({ toasts, dismiss }) => (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
            <div
                key={t.id}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-sm font-semibold
                    pointer-events-auto transition-all duration-300
                    ${t.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}
            >
                {t.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                <span>{t.message}</span>
                <button onClick={() => dismiss(t.id)} className="ml-2 opacity-70 hover:opacity-100">
                    <X size={14} />
                </button>
            </div>
        ))}
    </div>
);

/* ─── Skeleton ─────────────────────────────────────────────────────────── */
const Skeleton = () => (
    <div className="animate-pulse space-y-3">
        {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-xl h-14" />
        ))}
    </div>
);

/* ═══════════════════════════════════════════════════════════════════════ */
export default function PHIAllocationPanel() {
    const [districts, setDistricts] = useState([]);   // merged prediction + phi data
    const [phiUnits, setPhiUnits] = useState([]);
    const [allocations, setAllocations] = useState({});   // { district: allocation }
    const [selected, setSelected] = useState({});   // { district: phiUnit }
    const [filter, setFilter] = useState('ALL');
    const [toasts, setToasts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [predError, setPredError] = useState(null);
    const [hospError, setHospError] = useState(null);
    const [assigning, setAssigning] = useState({});   // { district: bool }
    const [notifying, setNotifying] = useState({});

    /* toast helpers */
    const addToast = (message, type = 'success') => {
        const id = Date.now() + Math.random();
        setToasts(p => [...p, { id, message, type }]);
        setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
    };
    const dismissToast = (id) => setToasts(p => p.filter(t => t.id !== id));

    /* ── fetch predictions ── */
    const fetchPredictions = useCallback(async () => {
        try {
            const res = await fetch(`${BASE}/predictions/all`);
            const json = await res.json();
            if (!json.success) throw new Error(json.message);

            // Map the actual data structure to what the component expects
            const mapped = json.data.map(r => ({
                district: r.district,
                predicted_cases: r.week_1_cases || r.week_2_cases || 0,
                iso_week: r.iso_week || r.week_1_week || isoWeek(),
                data_type: 'predicted'
            }));

            setPredError(null);
            return mapped.sort((a, b) => b.predicted_cases - a.predicted_cases);
        } catch (e) {
            setPredError(e.message || 'Could not load predictions');
            return [];
        }
    }, []);

    /* ── fetch PHI units ── */
    const fetchPHI = useCallback(async () => {
        try {
            const res = await fetch(`${BASE}/hospitals?type=PHI`);
            const json = await res.json();
            if (!json.success) throw new Error(json.message);
            const units = json.data.filter(h => h.type === 'PHI');
            setHospError(null);
            return units;
        } catch (e) {
            setHospError(e.message || 'Could not load PHI units');
            return [];
        }
    }, []);

    /* ── fetch existing allocations ── */
    const fetchAllocations = useCallback(async () => {
        try {
            const res = await fetch(`${BASE}/phi-allocations?weekNumber=${isoWeek()}`);
            const json = await res.json();
            if (!json.success) return;
            const map = {};
            json.data.forEach(a => { map[a.district.toUpperCase()] = a; });
            setAllocations(map);
        } catch (_) { /* silent */ }
    }, []);

    /* ── bootstrap ── */
    const load = useCallback(async () => {
        setLoading(true);
        const [preds, hospitals] = await Promise.all([fetchPredictions(), fetchPHI()]);
        setPhiUnits(hospitals);
        setDistricts(preds.sort((a, b) => b.predicted_cases - a.predicted_cases));
        await fetchAllocations();
        setLoading(false);
    }, [fetchPredictions, fetchPHI, fetchAllocations]);

    useEffect(() => { load(); }, [load]);

    /* ── assign handler ── */
    const handleAssign = async (district) => {
        const unit = selected[district.district];
        if (!unit) { addToast('Please select a PHI unit first.', 'error'); return; }

        setAssigning(p => ({ ...p, [district.district]: true }));
        try {
            const risk = getRisk(district.predicted_cases);
            const cfg = getRiskConfig(risk);
            const body = {
                district: district.district,
                predictedCases: district.predicted_cases,
                assignedPHIId: unit.hospitalId,
                assignedPHIName: unit.name,
                weekNumber: district.iso_week ?? isoWeek(),
                assignedBy: 'Dr. Silva',
                recommendedCount: cfg.recommended,
            };
            const res = await fetch(`${BASE}/phi-allocations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            const json = await res.json();
            if (!json.success) throw new Error(json.message);
            setAllocations(p => ({ ...p, [district.district]: json.data }));
            addToast(`PHI unit assigned to ${district.district}`, 'success');
        } catch (e) {
            addToast(e.message || 'Assignment failed', 'error');
        }
        setAssigning(p => ({ ...p, [district.district]: false }));
    };

    /* ── MOH notify handler ── */
    const handleNotifyMOH = async (district) => {
        setNotifying(p => ({ ...p, [district.district]: true }));
        try {
            const body = {
                type: 'PHI_DEPLOYMENT',
                district: district.district,
                message: `HIGH risk alert: ${district.predicted_cases} predicted dengue cases in ${district.district}. Immediate PHI deployment recommended.`,
                severity: 'HIGH',
            };
            await fetch(`${BASE}/notifications/alerts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            addToast(`District MOH notified for ${district.district}`, 'success');
        } catch (_) {
            addToast('Could not send MOH notification', 'error');
        }
        setNotifying(p => ({ ...p, [district.district]: false }));
    };

    /* ── CSV export ── */
    const exportCSV = () => {
        const rows = [
            ['District', 'Predicted Cases', 'Risk Level', 'Recommended PHI', 'Assigned PHI', 'Status', 'Week'],
            ...filteredDistricts.map(d => {
                const risk = getRisk(d.predicted_cases);
                const alloc = allocations[d.district];
                return [
                    d.district,
                    d.predicted_cases,
                    risk,
                    getRiskConfig(risk).recommended,
                    alloc ? alloc.assignedPHIName : 'Pending',
                    alloc ? 'Assigned' : 'Pending',
                    d.iso_week ?? isoWeek(),
                ];
            }),
        ];
        const csv = rows.map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `phi_allocations_week${isoWeek()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    /* ── filtered view ── */
    const filteredDistricts = districts.filter(d => {
        const risk = getRisk(d.predicted_cases);
        const alloc = allocations[d.district];
        if (filter === 'HIGH') return risk === 'HIGH';
        if (filter === 'UNASSIGNED') return !alloc;
        return true;
    });

    /* ── summary stats ── */
    const totalHigh = districts.filter(d => getRisk(d.predicted_cases) === 'HIGH').length;
    const totalPHIUnits = phiUnits.length;
    const deploymentsToday = Object.values(allocations).filter(a => {
        const d = new Date(a.createdAt);
        const today = new Date();
        return d.toDateString() === today.toDateString();
    }).length;

    /* ════════════════════ RENDER ════════════════════════════════════════ */
    return (
        <>
            <Toast toasts={toasts} dismiss={dismissToast} />

            <div className="flex flex-col gap-6">

                {/* ── Summary Bar ───────────────────────────────────────── */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        { icon: <AlertTriangle size={18} />, label: 'High Risk Districts', value: totalHigh, color: 'text-red-600', bg: 'bg-red-50' },
                        { icon: <Users size={18} />, label: 'PHI Units Available', value: totalPHIUnits, color: 'text-[#2F6A5F]', bg: 'bg-emerald-50' },
                        { icon: <CheckCircle size={18} />, label: 'Deployments Today', value: deploymentsToday, color: 'text-blue-600', bg: 'bg-blue-50' },
                    ].map(({ icon, label, value, color, bg }) => (
                        <div key={label} className={`rounded-2xl ${bg} p-4 flex items-center gap-4 border border-white shadow-sm`}>
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg} ${color} shadow-inner`}>
                                {icon}
                            </div>
                            <div>
                                <p className="text-2xl font-extrabold text-gray-800">{loading ? '—' : value}</p>
                                <p className="text-[11px] text-gray-500 font-semibold">{label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Filter + Export row ────────────────────────────────── */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                        <Filter size={14} className="text-gray-400" />
                        {[
                            { key: 'ALL', label: 'All Risk Levels' },
                            { key: 'HIGH', label: 'High Only' },
                            { key: 'UNASSIGNED', label: 'Unassigned Only' },
                        ].map(({ key, label }) => (
                            <button
                                key={key}
                                onClick={() => setFilter(key)}
                                className={`px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider transition-all
                                    ${filter === key
                                        ? 'bg-[#2F6A5F] text-white shadow-md shadow-[#2F6A5F]/20'
                                        : 'bg-white text-gray-400 hover:bg-gray-50 border border-gray-100'}`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={load}
                            className="p-2 rounded-lg bg-white border border-gray-100 text-gray-400 hover:bg-gray-50 transition-all shadow-sm"
                            title="Refresh"
                        >
                            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                        </button>
                        <button
                            onClick={exportCSV}
                            disabled={loading || filteredDistricts.length === 0}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2F6A5F] text-white text-[11px] font-bold hover:bg-[#1A3D37] transition-all shadow-md shadow-[#2F6A5F]/25 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <Download size={14} />
                            Export CSV
                        </button>
                    </div>
                </div>

                {/* ── Predictions error banner ───────────────────────────── */}
                {predError && (
                    <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center justify-between">
                        <span className="text-red-600 text-sm font-semibold">
                            ⚠ Could not load predictions — {predError}
                        </span>
                        <button onClick={load} className="text-xs text-red-500 underline font-semibold">Retry</button>
                    </div>
                )}

                {/* ── Hospitals error banner ─────────────────────────────── */}
                {hospError && (
                    <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3">
                        <span className="text-orange-600 text-sm font-semibold">
                            ⚠ No PHI units found — {hospError}
                        </span>
                    </div>
                )}

                {/* ── Main table / states ────────────────────────────────── */}
                {loading ? (
                    <Skeleton />
                ) : filteredDistricts.length === 0 ? (
                    /* Empty state */
                    <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-14 flex flex-col items-center gap-4 text-center">
                        <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                            <MapPin size={28} className="text-[#2F6A5F]" />
                        </div>
                        <h3 className="font-bold text-gray-700 text-lg">No districts found</h3>
                        <p className="text-sm text-gray-400">
                            {filter === 'HIGH' ? 'No high-risk districts detected this week.' : 'No prediction data available yet.'}
                        </p>
                    </div>
                ) : (
                    /* Table card */
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        <th className="text-left px-5 py-3 text-[11px] font-extrabold text-gray-400 uppercase tracking-wider">District</th>
                                        <th className="text-left px-5 py-3 text-[11px] font-extrabold text-gray-400 uppercase tracking-wider">Predicted Cases</th>
                                        <th className="text-left px-5 py-3 text-[11px] font-extrabold text-gray-400 uppercase tracking-wider">Rec. PHI Count</th>
                                        <th className="text-left px-5 py-3 text-[11px] font-extrabold text-gray-400 uppercase tracking-wider">Assign PHI Unit</th>
                                        <th className="text-left px-5 py-3 text-[11px] font-extrabold text-gray-400 uppercase tracking-wider">Action</th>
                                        <th className="text-left px-5 py-3 text-[11px] font-extrabold text-gray-400 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredDistricts.map(d => {
                                        const risk = getRisk(d.predicted_cases);
                                        const cfg = getRiskConfig(risk);
                                        const alloc = allocations[d.district];
                                        const isAssigned = !!alloc;
                                        const districtPHI = phiUnits.filter(p =>
                                            p.district?.toUpperCase() === d.district?.toUpperCase()
                                        );

                                        return (
                                            <tr key={d.district} className="hover:bg-gray-50/60 transition-colors group">

                                                {/* District */}
                                                <td className="px-5 py-3.5">
                                                    <div className="flex items-center gap-2">
                                                        <MapPin size={13} className="text-[#2F6A5F]" />
                                                        <span className="font-bold text-gray-800 text-[13px]">{d.district}</span>
                                                    </div>
                                                    <p className="text-[10px] text-gray-400 ml-5">Week {d.iso_week ?? isoWeek()}</p>
                                                </td>

                                                {/* Predicted cases + badge */}
                                                <td className="px-5 py-3.5">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-extrabold text-gray-800">{d.predicted_cases?.toFixed(0)}</span>
                                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide ${cfg.badge}`}>
                                                            {cfg.label}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Recommended count */}
                                                <td className="px-5 py-3.5">
                                                    <div className="flex items-center gap-1.5">
                                                        <Users size={12} className="text-gray-400" />
                                                        <span className="font-bold text-gray-700 text-[13px]">{cfg.recommended} officers</span>
                                                    </div>
                                                </td>

                                                {/* PHI Unit dropdown */}
                                                <td className="px-5 py-3.5">
                                                    {isAssigned ? (
                                                        <span className="text-[12px] text-gray-500 font-medium">{alloc.assignedPHIName}</span>
                                                    ) : hospError ? (
                                                        <select disabled className="w-44 border border-gray-200 rounded-lg px-2 py-1.5 text-[11px] bg-gray-50 text-gray-400 cursor-not-allowed">
                                                            <option>No PHI units found</option>
                                                        </select>
                                                    ) : districtPHI.length === 0 ? (
                                                        <select
                                                            value={selected[d.district]?.hospitalId || ''}
                                                            onChange={e => {
                                                                const unit = phiUnits.find(p => p.hospitalId === e.target.value);
                                                                setSelected(prev => ({ ...prev, [d.district]: unit }));
                                                            }}
                                                            className="w-52 border border-gray-200 rounded-lg px-2 py-1.5 text-[11px] bg-white outline-none focus:ring-2 focus:ring-[#2F6A5F]/20 focus:border-[#2F6A5F]"
                                                        >
                                                            <option value="">— Any available PHI —</option>
                                                            {phiUnits.map(p => (
                                                                <option key={p.hospitalId} value={p.hospitalId}>{p.name}</option>
                                                            ))}
                                                        </select>
                                                    ) : (
                                                        <select
                                                            value={selected[d.district]?.hospitalId || ''}
                                                            onChange={e => {
                                                                const unit = districtPHI.find(p => p.hospitalId === e.target.value)
                                                                    || phiUnits.find(p => p.hospitalId === e.target.value);
                                                                setSelected(prev => ({ ...prev, [d.district]: unit }));
                                                            }}
                                                            className="w-52 border border-gray-200 rounded-lg px-2 py-1.5 text-[11px] bg-white outline-none focus:ring-2 focus:ring-[#2F6A5F]/20 focus:border-[#2F6A5F]"
                                                        >
                                                            <option value="">— Select PHI Unit —</option>
                                                            {districtPHI.map(p => (
                                                                <option key={p.hospitalId} value={p.hospitalId}>{p.name}</option>
                                                            ))}
                                                        </select>
                                                    )}
                                                </td>

                                                {/* Assign + MOH notify buttons */}
                                                <td className="px-5 py-3.5">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        {!isAssigned && (
                                                            <button
                                                                onClick={() => handleAssign(d)}
                                                                disabled={assigning[d.district] || !!hospError}
                                                                className="px-3 py-1.5 rounded-lg bg-[#2F6A5F] text-white text-[11px] font-bold hover:bg-[#1A3D37] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                                            >
                                                                {assigning[d.district] ? 'Assigning…' : 'Assign'}
                                                            </button>
                                                        )}
                                                        {(risk === 'HIGH') && (
                                                            <button
                                                                onClick={() => handleNotifyMOH(d)}
                                                                disabled={notifying[d.district]}
                                                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-600 text-white text-[11px] font-bold hover:bg-red-700 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                                            >
                                                                <Bell size={11} />
                                                                {notifying[d.district] ? 'Notifying…' : 'Notify MOH'}
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Status badge */}
                                                <td className="px-5 py-3.5">
                                                    {isAssigned ? (
                                                        <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 w-fit">
                                                            <CheckCircle size={11} />
                                                            Assigned
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1.5 text-[11px] font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-100 w-fit">
                                                            <AlertTriangle size={11} />
                                                            Pending
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Table footer */}
                        <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                            <span className="text-[11px] text-gray-400">
                                Showing {filteredDistricts.length} district{filteredDistricts.length !== 1 ? 's' : ''}
                            </span>
                            <span className="text-[11px] text-gray-400">
                                ISO Week {isoWeek()} · XGBoost model
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
