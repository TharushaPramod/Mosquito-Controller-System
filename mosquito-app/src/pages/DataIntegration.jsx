import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    ChevronDown,
    Download,
    Plus,
    Eye,
    Edit2,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Calendar,
    Filter,
    FileText
} from 'lucide-react';
import DashboardLayout from '../components/Layout/DashboardLayout';

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    Legend
} from 'recharts';

const DataIntegration = () => {
    const [activeTab, setActiveTab] = useState('health-facility');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('All');
    const [selectedStatus, setSelectedStatus] = useState('All');

    // Outbreak Specific State
    const [selectedDisease, setSelectedDisease] = useState('All');
    const [selectedSeverity, setSelectedSeverity] = useState('All');
    const [selectedSource, setSelectedSource] = useState('All');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const [isDistrictDropdownOpen, setIsDistrictDropdownOpen] = useState(false);
    const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
    const [isDiseaseDropdownOpen, setIsDiseaseDropdownOpen] = useState(false);
    const [isSeverityDropdownOpen, setIsSeverityDropdownOpen] = useState(false);
    const [isSourceDropdownOpen, setIsSourceDropdownOpen] = useState(false);

    const navigate = useNavigate();

    const outbreakData = [
        { id: 'OB-2025-001', district: 'Colombo', disease: 'Dengue', startDate: '2025-01-15', endDate: '2025-02-20', cases: 450, severity: 'High', source: 'Hospital Data' },
        { id: 'OB-2024-045', district: 'Gampaha', disease: 'Dengue', startDate: '2024-11-02', endDate: '2024-12-15', cases: 210, severity: 'Medium', source: 'MOH Reports' },
        { id: 'OB-2024-032', district: 'Kalutara', disease: 'Chikungunya', startDate: '2024-08-10', endDate: '2024-09-05', cases: 85, severity: 'Low', source: 'Automated Prediction' },
        { id: 'OB-2025-004', district: 'Kandy', disease: 'Dengue', startDate: '2025-03-01', endDate: 'Active', cases: 320, severity: 'High', source: 'Hospital Data' },
        { id: 'OB-2024-012', district: 'Galle', disease: 'Zika', startDate: '2024-04-20', endDate: '2024-05-15', cases: 45, severity: 'Low', source: 'PHI Reports' },
    ];

    const timelineData = [
        { name: 'Week 1', cases: 50 },
        { name: 'Week 2', cases: 120 },
        { name: 'Week 3', cases: 280 },
        { name: 'Week 4', cases: 450 },
        { name: 'Week 5', cases: 380 },
        { name: 'Week 6', cases: 200 },
        { name: 'Week 7', cases: 80 },
    ];

    const seasonalData = [
        { name: '2021', cases: 1200 },
        { name: '2022', cases: 1800 },
        { name: '2023', cases: 1400 },
        { name: '2024', cases: 2400 },
        { name: '2025', cases: 900 },
    ];

    const filteredOutbreaks = outbreakData.filter(ob => {
        const matchesDistrict = selectedDistrict === 'All' || ob.district === selectedDistrict;
        const matchesDisease = selectedDisease === 'All' || ob.disease === selectedDisease;
        const matchesSeverity = selectedSeverity === 'All' || ob.severity === selectedSeverity;
        const matchesSource = selectedSource === 'All' || ob.source === selectedSource;

        let matchesDate = true;
        if (startDate) matchesDate = matchesDate && ob.startDate >= startDate;
        if (endDate) matchesDate = matchesDate && (ob.endDate === 'Active' || ob.endDate <= endDate);

        return matchesDistrict && matchesDisease && matchesSeverity && matchesSource && matchesDate;
    });

    const facilityData = [
        {
            id: 1,
            name: 'General Hospital Gampaha',
            district: 'Gampaha',
            type: 'General Hospital',
            lastUpdate: '2025-12-26 14:30',
            contact: 'Dr. Priyantha Silva',
            status: 'Active'
        },
        {
            id: 2,
            name: 'Teaching Hospital Kurunegala',
            district: 'Kurunegala',
            type: 'Teaching Hospital',
            lastUpdate: '2025-12-25 09:15',
            contact: 'Dr. Sarath Perera',
            status: 'Delayed'
        },
        {
            id: 3,
            name: 'Base Hospital Mulleriyawa',
            district: 'Colombo',
            type: 'Base Hospital',
            lastUpdate: 'No Data Recently',
            contact: 'Dr. Kumudu Fernando',
            status: 'Not Sending Data'
        },
        {
            id: 4,
            name: 'District Hospital Kalutara',
            district: 'Kalutara',
            type: 'District Hospital',
            lastUpdate: '2025-12-26 11:20',
            contact: 'Dr. Amal Rajapaksha',
            status: 'Active'
        },
        {
            id: 5,
            name: 'Base Hospital Balapitiya',
            district: 'Galle',
            type: 'Base Hospital',
            lastUpdate: '2025-12-26 16:45',
            contact: 'Dr. Nimal Siriwardena',
            status: 'Active'
        }
    ];

    const districts = [
        'All',
        'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo',
        'Galle', 'Gampaha', 'Hambantota', 'Jaffna', 'Kalutara',
        'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala', 'Mannar',
        'Matale', 'Matara', 'Moneragala', 'Mullaitivu', 'Nuwara Eliya',
        'Polonnaruwa', 'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya'
    ];
    const statuses = ['All', 'Active', 'Delayed', 'Not Sending Data'];

    const filteredData = facilityData.filter(facility => {
        const matchesSearch = facility.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            facility.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
            facility.contact.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesDistrict = selectedDistrict === 'All' || facility.district === selectedDistrict;
        const matchesStatus = selectedStatus === 'All' || facility.status === selectedStatus;

        return matchesSearch && matchesDistrict && matchesStatus;
    });

    const getStatusClass = (status) => {
        switch (status) {
            case 'Active': return 'bg-[#E8F5E9] text-[#2E7D32]';
            case 'Not Sending Data': return 'bg-[#FFFDE7] text-[#FBC02D]';
            case 'Delayed': return 'bg-[#FFEBEE] text-[#D32F2F]';
            default: return '';
        }
    };

    const diseases = ['All', 'Dengue', 'Chikungunya', 'Zika', 'Malaria'];
    const severities = ['All', 'Low', 'Medium', 'High'];
    const sources = ['All', 'Hospital Data', 'MOH Reports', 'PHI Reports', 'Automated Prediction'];

    const getSeverityClass = (severity) => {
        switch (severity) {
            case 'High': return 'bg-[#FFEBEE] text-[#C62828]';
            case 'Medium': return 'bg-[#FFF3E0] text-[#EF6C00]';
            case 'Low': return 'bg-[#E8F5E9] text-[#2E7D32]';
            default: return '';
        }
    };

    const renderPastOutbreak = () => {
        return (
            <div className="flex flex-col gap-6">
                {/* Outbreak Filter Panel */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 bg-white p-4 rounded-xl border border-[#E0E0E0] shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
                    <div className="flex flex-col gap-2 min-w-0">
                        <label className="text-[11px] font-bold text-[#4A635F] uppercase tracking-wider">District</label>
                        <div className="relative">
                            <button className="flex items-center justify-between w-full px-3 py-2 bg-white border border-[#E0E0E0] rounded-lg text-[#1A3D37] text-xs font-semibold cursor-pointer whitespace-nowrap transition-colors duration-200 hover:border-[#1A3D37]" onClick={() => setIsDistrictDropdownOpen(!isDistrictDropdownOpen)}>
                                <span>{selectedDistrict}</span>
                                <ChevronDown size={12} />
                            </button>
                            {isDistrictDropdownOpen && (
                                <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-30 py-1 max-h-48 overflow-y-auto">
                                    {districts.map(d => (
                                        <div key={d} className="px-4 py-2 hover:bg-teal-50 cursor-pointer text-sm" onClick={() => { setSelectedDistrict(d); setIsDistrictDropdownOpen(false); }}>{d}</div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 min-w-0">
                        <label className="text-[11px] font-bold text-[#4A635F] uppercase tracking-wider">Disease Type</label>
                        <div className="relative">
                            <button className="flex items-center justify-between w-full px-3 py-2 bg-white border border-[#E0E0E0] rounded-lg text-[#1A3D37] text-xs font-semibold cursor-pointer whitespace-nowrap transition-colors duration-200 hover:border-[#1A3D37]" onClick={() => setIsDiseaseDropdownOpen(!isDiseaseDropdownOpen)}>
                                <span>{selectedDisease}</span>
                                <ChevronDown size={12} />
                            </button>
                            {isDiseaseDropdownOpen && (
                                <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-30 py-1">
                                    {diseases.map(d => (
                                        <div key={d} className="px-4 py-2 hover:bg-teal-50 cursor-pointer text-sm" onClick={() => { setSelectedDisease(d); setIsDiseaseDropdownOpen(false); }}>{d}</div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 min-w-0">
                        <label className="text-[11px] font-bold text-[#4A635F] uppercase tracking-wider">Date Range</label>
                        <div className="flex items-center gap-2 flex-nowrap">
                            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="flex-1 min-w-0 px-2 py-1.5 border border-[#E0E0E0] rounded-lg text-[11px] font-medium text-[#1A3D37] outline-none transition-colors duration-200 focus:border-[#2D6A5D]" />
                            <span className="text-xs text-gray-400">to</span>
                            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="flex-1 min-w-0 px-2 py-1.5 border border-[#E0E0E0] rounded-lg text-[11px] font-medium text-[#1A3D37] outline-none transition-colors duration-200 focus:border-[#2D6A5D]" />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 min-w-0">
                        <label className="text-[11px] font-bold text-[#4A635F] uppercase tracking-wider">Severity</label>
                        <div className="relative">
                            <button className="flex items-center justify-between w-full px-3 py-2 bg-white border border-[#E0E0E0] rounded-lg text-[#1A3D37] text-xs font-semibold cursor-pointer whitespace-nowrap transition-colors duration-200 hover:border-[#1A3D37]" onClick={() => setIsSeverityDropdownOpen(!isSeverityDropdownOpen)}>
                                <span>{selectedSeverity}</span>
                                <ChevronDown size={12} />
                            </button>
                            {isSeverityDropdownOpen && (
                                <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-30 py-1">
                                    {severities.map(s => (
                                        <div key={s} className="px-4 py-2 hover:bg-teal-50 cursor-pointer text-sm" onClick={() => { setSelectedSeverity(s); setIsSeverityDropdownOpen(false); }}>{s}</div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 min-w-0">
                        <label className="text-[11px] font-bold text-[#4A635F] uppercase tracking-wider">Source</label>
                        <div className="relative">
                            <button className="flex items-center justify-between w-full px-3 py-2 bg-white border border-[#E0E0E0] rounded-lg text-[#1A3D37] text-xs font-semibold cursor-pointer whitespace-nowrap transition-colors duration-200 hover:border-[#1A3D37]" onClick={() => setIsSourceDropdownOpen(!isSourceDropdownOpen)}>
                                <span>{selectedSource}</span>
                                <ChevronDown size={12} />
                            </button>
                            {isSourceDropdownOpen && (
                                <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-30 py-1">
                                    {sources.map(s => (
                                        <div key={s} className="px-4 py-2 hover:bg-teal-50 cursor-pointer text-sm" onClick={() => { setSelectedSource(s); setIsSourceDropdownOpen(false); }}>{s}</div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Outbreak History Table */}
                <div className="bg-[#DDEDE7] rounded-2xl overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.03)] mb-6">
                    <table className="w-full border-collapse text-left">
                        <thead className="bg-[#99C7B6]">
                            <tr>
                                <th className="p-3 text-xs font-bold text-[#1A3D37] border-b border-[#EEF2F0] uppercase tracking-wider">Outbreak ID</th>
                                <th className="p-3 text-xs font-bold text-[#1A3D37] border-b border-[#EEF2F0] uppercase tracking-wider">District</th>
                                <th className="p-3 text-xs font-bold text-[#1A3D37] border-b border-[#EEF2F0] uppercase tracking-wider">Start Date</th>
                                <th className="p-3 text-xs font-bold text-[#1A3D37] border-b border-[#EEF2F0] uppercase tracking-wider">End Date</th>
                                <th className="p-3 text-xs font-bold text-[#1A3D37] border-b border-[#EEF2F0] uppercase tracking-wider">Reported Cases</th>
                                <th className="p-3 text-xs font-bold text-[#1A3D37] border-b border-[#EEF2F0] uppercase tracking-wider text-center">Severity</th>
                                <th className="p-3 text-xs font-bold text-[#1A3D37] border-b border-[#EEF2F0] uppercase tracking-wider text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOutbreaks.map((ob) => (
                                <tr key={ob.id}>
                                    <td className="p-3 text-[11px] text-[#1A3D37] border-b border-[#EEF2F0] bg-[#F1F8F5]/30 font-mono">{ob.id}</td>
                                    <td className="p-3 text-[11px] text-[#1A3D37] border-b border-[#EEF2F0] bg-[#F1F8F5]/30 font-medium">{ob.district}</td>
                                    <td className="p-3 text-[11px] text-[#1A3D37] border-b border-[#EEF2F0] bg-[#F1F8F5]/30">{ob.startDate}</td>
                                    <td className="p-3 text-[11px] text-[#1A3D37] border-b border-[#EEF2F0] bg-[#F1F8F5]/30">{ob.endDate}</td>
                                    <td className="p-3 text-[11px] text-[#1A3D37] border-b border-[#EEF2F0] bg-[#F1F8F5]/30 font-bold">{ob.cases}</td>
                                    <td className="p-3 text-[11px] text-[#1A3D37] border-b border-[#EEF2F0] bg-[#F1F8F5]/30 text-center">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${getSeverityClass(ob.severity)}`}>
                                            {ob.severity}
                                        </span>
                                    </td>
                                    <td className="p-3 text-[11px] text-[#1A3D37] border-b border-[#EEF2F0] bg-[#F1F8F5]/30 text-center">
                                        <button className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-[#1A3D37] border border-[#E0E0E0] rounded-lg text-[10px] font-bold cursor-pointer transition-all duration-200 hover:bg-[#2D6A5D] hover:text-white hover:border-[#2D6A5D] shadow-sm">
                                            <Download size={12} />
                                            <span>EXCEL</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Visual Analysis Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-xl p-4 border border-[#E0E0E0] shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
                        <div className="flex items-center gap-2 mb-4">
                            <FileText size={16} className="text-teal-600" />
                            <h4 className="m-0 text-xs font-bold text-[#1A3D37] uppercase tracking-wider">Outbreak Timeline Graph</h4>
                        </div>
                        <div className="w-full">
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={timelineData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="cases" stroke="#2D6A5D" strokeWidth={3} dot={{ r: 4, fill: '#2D6A5D' }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-4 border border-[#E0E0E0] shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
                        <div className="flex items-center gap-2 mb-4">
                            <Calendar size={16} className="text-teal-600" />
                            <h4 className="m-0 text-xs font-bold text-[#1A3D37] uppercase tracking-wider">Seasonal Trend Line (Yearly)</h4>
                        </div>
                        <div className="w-full">
                            <ResponsiveContainer width="100%" height={250}>
                                <AreaChart data={seasonalData}>
                                    <defs>
                                        <linearGradient id="colorCases" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#2D6A5D" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#2D6A5D" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="cases" stroke="#2D6A5D" fillOpacity={1} fill="url(#colorCases)" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderHealthFacilityTable = () => {
        return (
            <>
                {/* Filters and Search */}
                <div className="flex items-center gap-3 mb-5 w-full">
                    <div className="relative">
                        <button
                            className="flex items-center gap-2 px-3 py-2 bg-white border border-[#E0E0E0] rounded-lg text-[#1A3D37] text-xs font-semibold cursor-pointer whitespace-nowrap transition-colors duration-200 hover:border-[#1A3D37]"
                            onClick={() => setIsDistrictDropdownOpen(!isDistrictDropdownOpen)}
                        >
                            <span>{selectedDistrict === 'All' ? 'Filter District' : selectedDistrict}</span>
                            <ChevronDown size={12} />
                        </button>
                        {isDistrictDropdownOpen && (
                            <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-2 max-h-60 overflow-y-auto">
                                {districts.map(district => (
                                    <div
                                        key={district}
                                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm font-medium text-gray-700"
                                        onClick={() => {
                                            setSelectedDistrict(district);
                                            setIsDistrictDropdownOpen(false);
                                        }}
                                    >
                                        {district}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666]" size={14} />
                        <input
                            type="text"
                            className="w-full pl-9 pr-4 py-2 bg-white border border-[#E0E0E0] rounded-lg text-xs outline-none transition-colors duration-200 focus:border-[#1A3D37]"
                            placeholder="Search facility..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="relative">
                        <button
                            className="flex items-center gap-2 px-3 py-2 bg-white border border-[#E0E0E0] rounded-lg text-[#1A3D37] text-xs font-semibold cursor-pointer whitespace-nowrap transition-colors duration-200 hover:border-[#1A3D37]"
                            onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                        >
                            <span>{selectedStatus === 'All' ? 'Filter Status' : selectedStatus}</span>
                            <ChevronDown size={12} />
                        </button>
                        {isStatusDropdownOpen && (
                            <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-2">
                                {statuses.map(status => (
                                    <div
                                        key={status}
                                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm font-medium text-gray-700"
                                        onClick={() => {
                                            setSelectedStatus(status);
                                            setIsStatusDropdownOpen(false);
                                        }}
                                    >
                                        {status}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-2 mb-4">
                    <button className="bg-[#00796B] text-white border-none px-4 py-2 rounded-lg font-bold text-xs cursor-pointer transition-opacity duration-200 hover:opacity-90 shadow-sm">
                        <Plus size={14} className="inline-block mr-1.5 align-middle" />
                        Add Facility
                    </button>
                    <button className="bg-white border border-[#E0E0E0] text-[#1A3D37] px-4 py-2 rounded-lg font-bold text-xs cursor-pointer flex items-center gap-2 transition-colors duration-200 hover:bg-gray-50 shadow-sm">
                        <Download size={14} />
                        Export
                    </button>
                </div>

                {/* Data Table */}
                <div className="bg-[#DDEDE7] rounded-2xl overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.03)] mb-6">
                    <table className="w-full border-collapse text-left">
                        <thead className="bg-[#99C7B6]">
                            <tr>
                                <th className="p-3 text-xs font-bold text-[#1A3D37] border-b border-[#EEF2F0] uppercase tracking-wider">Facility Name</th>
                                <th className="p-3 text-xs font-bold text-[#1A3D37] border-b border-[#EEF2F0] uppercase tracking-wider">District</th>
                                <th className="p-3 text-xs font-bold text-[#1A3D37] border-b border-[#EEF2F0] uppercase tracking-wider">Type</th>
                                <th className="p-3 text-xs font-bold text-[#1A3D37] border-b border-[#EEF2F0] uppercase tracking-wider">Updated</th>
                                <th className="p-3 text-xs font-bold text-[#1A3D37] border-b border-[#EEF2F0] uppercase tracking-wider text-center">Status</th>
                                <th className="p-3 text-xs font-bold text-[#1A3D37] border-b border-[#EEF2F0] uppercase tracking-wider text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.map((facility) => (
                                <tr key={facility.id}>
                                    <td className="p-3 text-[11px] text-[#1A3D37] border-b border-[#EEF2F0] bg-[#F1F8F5]/30 font-bold">{facility.name}</td>
                                    <td className="p-3 text-[11px] text-[#1A3D37] border-b border-[#EEF2F0] bg-[#F1F8F5]/30 font-medium">{facility.district}</td>
                                    <td className="p-3 text-[11px] text-[#1A3D37] border-b border-[#EEF2F0] bg-[#F1F8F5]/30">{facility.type}</td>
                                    <td className="p-3 text-[11px] text-[#1A3D37] border-b border-[#EEF2F0] bg-[#F1F8F5]/30">{facility.lastUpdate}</td>
                                    <td className="p-3 text-[11px] text-[#1A3D37] border-b border-[#EEF2F0] bg-[#F1F8F5]/30 text-center">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${getStatusClass(facility.status)}`}>
                                            {facility.status}
                                        </span>
                                    </td>
                                    <td className="p-3 text-[11px] text-[#1A3D37] border-b border-[#EEF2F0] bg-[#F1F8F5]/30">
                                        <div className="flex items-center justify-center gap-1.5">
                                            <button
                                                className="w-[54px] h-[28px] bg-[#00796B] text-white border-none rounded-lg flex items-center justify-center gap-1 text-[10px] font-bold cursor-pointer transition-opacity duration-200 hover:opacity-90 shadow-sm"
                                                onClick={() => navigate(`/facility/${facility.id}`)}
                                            >
                                                <Eye size={12} />
                                                <span>VIEW</span>
                                            </button>
                                            <button className="w-7 h-7 rounded-lg border-none flex items-center justify-center cursor-pointer transition-opacity duration-200 hover:opacity-80 bg-teal-50 text-[#00796B] shadow-sm">
                                                <Edit2 size={12} />
                                            </button>
                                            <button className="w-7 h-7 rounded-lg border-none flex items-center justify-center cursor-pointer transition-opacity duration-200 hover:opacity-80 bg-red-50 text-red-600 shadow-sm">
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer Pagination */}
                <footer className="flex justify-center items-center gap-4 mt-6">
                    <button className="bg-transparent border border-[#E0E0E0] rounded-lg p-2 cursor-pointer flex items-center justify-center text-[#1A3D37] transition-colors duration-200 hover:bg-[#F5F5F5]">
                        <ChevronLeft size={20} />
                    </button>
                    <span className="text-sm font-medium">Page 1 of 10</span>
                    <button className="bg-transparent border border-[#E0E0E0] rounded-lg p-2 cursor-pointer flex items-center justify-center text-[#1A3D37] transition-colors duration-200 hover:bg-[#F5F5F5]">
                        <ChevronRight size={20} />
                    </button>
                </footer>
            </>
        );
    };

    return (
        <DashboardLayout title="Data Integration">
            <div className="text-[#1A3D37] font-sans">
                {/* Tab Switcher */}
                <div className="flex justify-center mb-8">
                    <div className="bg-[#79B0A3] p-0 rounded-full flex overflow-hidden shadow-[0_4px_10px_rgba(0,0,0,0.1)] w-fit">
                        <button
                            className={`px-6 py-2 rounded-full border-none cursor-pointer font-bold text-xs text-white transition-all duration-300 ease-in-out whitespace-nowrap uppercase tracking-wider ${activeTab === 'health-facility' ? 'bg-[#2D6A5D] shadow-[inset_0_2px_4px_rgba(0,0,0,0.1),4px_0_15px_rgba(0,0,0,0.15)] z-[1]' : 'bg-transparent hover:bg-white/10'}`}
                            onClick={() => setActiveTab('health-facility')}
                        >
                            Health Facility List
                        </button>
                        <button
                            className={`px-6 py-2 rounded-full border-none cursor-pointer font-bold text-xs text-white transition-all duration-300 ease-in-out whitespace-nowrap uppercase tracking-wider ${activeTab === 'past-outbreak' ? 'bg-[#2D6A5D] shadow-[inset_0_2px_4px_rgba(0,0,0,0.1),4px_0_15px_rgba(0,0,0,0.15)] z-[1]' : 'bg-transparent hover:bg-white/10'}`}
                            onClick={() => setActiveTab('past-outbreak')}
                        >
                            Past Outbreak History
                        </button>
                    </div>
                </div>

                {activeTab === 'health-facility' ? renderHealthFacilityTable() : renderPastOutbreak()}
            </div>
        </DashboardLayout>
    );
};

export default DataIntegration;
