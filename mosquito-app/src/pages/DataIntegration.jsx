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
            <div className="flex flex-col gap-8">
                {/* Outbreak Filter Panel */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 bg-white p-6 rounded-2xl border border-[#E0E0E0] shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
                    <div className="flex flex-col gap-2 min-w-0">
                        <label className="text-[13px] font-semibold text-[#4A635F] uppercase tracking-[0.5px]">District</label>
                        <div className="relative">
                            <button className="flex items-center justify-between w-full px-4 py-2.5 bg-white border border-[#E0E0E0] rounded-xl text-[#1A3D37] text-sm font-medium cursor-pointer whitespace-nowrap transition-colors duration-200 hover:border-[#1A3D37]" onClick={() => setIsDistrictDropdownOpen(!isDistrictDropdownOpen)}>
                                <span>{selectedDistrict}</span>
                                <ChevronDown size={14} />
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
                        <label className="text-[13px] font-semibold text-[#4A635F] uppercase tracking-[0.5px]">Disease Type</label>
                        <div className="relative">
                            <button className="flex items-center justify-between w-full px-4 py-2.5 bg-white border border-[#E0E0E0] rounded-xl text-[#1A3D37] text-sm font-medium cursor-pointer whitespace-nowrap transition-colors duration-200 hover:border-[#1A3D37]" onClick={() => setIsDiseaseDropdownOpen(!isDiseaseDropdownOpen)}>
                                <span>{selectedDisease}</span>
                                <ChevronDown size={14} />
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
                        <label className="text-[13px] font-semibold text-[#4A635F] uppercase tracking-[0.5px]">Date Range</label>
                        <div className="flex items-center gap-2 flex-nowrap">
                            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="flex-1 min-w-0 px-2.5 py-2 border border-[#E0E0E0] rounded-lg text-[13px] text-[#1A3D37] outline-none transition-colors duration-200 focus:border-[#2D6A5D]" />
                            <span className="text-sm">to</span>
                            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="flex-1 min-w-0 px-2.5 py-2 border border-[#E0E0E0] rounded-lg text-[13px] text-[#1A3D37] outline-none transition-colors duration-200 focus:border-[#2D6A5D]" />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 min-w-0">
                        <label className="text-[13px] font-semibold text-[#4A635F] uppercase tracking-[0.5px]">Severity</label>
                        <div className="relative">
                            <button className="flex items-center justify-between w-full px-4 py-2.5 bg-white border border-[#E0E0E0] rounded-xl text-[#1A3D37] text-sm font-medium cursor-pointer whitespace-nowrap transition-colors duration-200 hover:border-[#1A3D37]" onClick={() => setIsSeverityDropdownOpen(!isSeverityDropdownOpen)}>
                                <span>{selectedSeverity}</span>
                                <ChevronDown size={14} />
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
                        <label className="text-[13px] font-semibold text-[#4A635F] uppercase tracking-[0.5px]">Source</label>
                        <div className="relative">
                            <button className="flex items-center justify-between w-full px-4 py-2.5 bg-white border border-[#E0E0E0] rounded-xl text-[#1A3D37] text-sm font-medium cursor-pointer whitespace-nowrap transition-colors duration-200 hover:border-[#1A3D37]" onClick={() => setIsSourceDropdownOpen(!isSourceDropdownOpen)}>
                                <span>{selectedSource}</span>
                                <ChevronDown size={14} />
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
                                <th className="p-4 text-sm font-semibold text-[#1A3D37] border-b border-[#EEF2F0]">Outbreak ID</th>
                                <th className="p-4 text-sm font-semibold text-[#1A3D37] border-b border-[#EEF2F0]">District</th>
                                <th className="p-4 text-sm font-semibold text-[#1A3D37] border-b border-[#EEF2F0]">Start Date</th>
                                <th className="p-4 text-sm font-semibold text-[#1A3D37] border-b border-[#EEF2F0]">End Date</th>
                                <th className="p-4 text-sm font-semibold text-[#1A3D37] border-b border-[#EEF2F0]">Total Reported Cases</th>
                                <th className="p-4 text-sm font-semibold text-[#1A3D37] border-b border-[#EEF2F0]">Severity Rating</th>
                                <th className="p-4 text-sm font-semibold text-[#1A3D37] border-b border-[#EEF2F0]">Download Report</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOutbreaks.map((ob) => (
                                <tr key={ob.id}>
                                    <td className="p-4 text-sm text-[#1A3D37] border-b border-[#EEF2F0] bg-[#F1F8F5]/30 font-mono">{ob.id}</td>
                                    <td className="p-4 text-sm text-[#1A3D37] border-b border-[#EEF2F0] bg-[#F1F8F5]/30">{ob.district}</td>
                                    <td className="p-4 text-sm text-[#1A3D37] border-b border-[#EEF2F0] bg-[#F1F8F5]/30">{ob.startDate}</td>
                                    <td className="p-4 text-sm text-[#1A3D37] border-b border-[#EEF2F0] bg-[#F1F8F5]/30">{ob.endDate}</td>
                                    <td className="p-4 text-sm text-[#1A3D37] border-b border-[#EEF2F0] bg-[#F1F8F5]/30 font-bold">{ob.cases}</td>
                                    <td className="p-4 text-sm text-[#1A3D37] border-b border-[#EEF2F0] bg-[#F1F8F5]/30">
                                        <span className={`px-[14px] py-[6px] rounded-full text-[12px] font-semibold inline-block ${getSeverityClass(ob.severity)}`}>
                                            {ob.severity}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-[#1A3D37] border-b border-[#EEF2F0] bg-[#F1F8F5]/30">
                                        <button className="flex items-center gap-1.5 px-4 py-2 bg-[#F1F1F1] text-[#1A3D37] border border-[#E0E0E0] rounded-lg text-[12px] font-semibold cursor-pointer transition-all duration-200 hover:bg-[#2D6A5D] hover:text-white hover:border-[#2D6A5D]">
                                            <Download size={16} />
                                            <span>PDF</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Visual Analysis Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl p-6 border border-[#E0E0E0] shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
                        <div className="flex items-center gap-3 mb-5">
                            <FileText size={18} className="text-teal-600" />
                            <h4 className="m-0 text-base font-semibold text-[#1A3D37]">Outbreak Timeline Graph</h4>
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

                    <div className="bg-white rounded-2xl p-6 border border-[#E0E0E0] shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
                        <div className="flex items-center gap-3 mb-5">
                            <Calendar size={18} className="text-teal-600" />
                            <h4 className="m-0 text-base font-semibold text-[#1A3D37]">Seasonal Trend Line (Yearly)</h4>
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
                <div className="flex items-center gap-4 mb-6 w-full">
                    <div className="relative">
                        <button
                            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E0E0E0] rounded-xl text-[#1A3D37] text-sm font-medium cursor-pointer whitespace-nowrap transition-colors duration-200 hover:border-[#1A3D37]"
                            onClick={() => setIsDistrictDropdownOpen(!isDistrictDropdownOpen)}
                        >
                            <span>{selectedDistrict === 'All' ? 'Filter By District' : selectedDistrict}</span>
                            <ChevronDown size={16} />
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
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#666]" size={18} />
                        <input
                            type="text"
                            className="w-full pl-11 pr-4 py-2.5 bg-white border border-[#E0E0E0] rounded-full text-sm outline-none transition-colors duration-200 focus:border-[#1A3D37]"
                            placeholder="Search Here"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="relative">
                        <button
                            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E0E0E0] rounded-xl text-[#1A3D37] text-sm font-medium cursor-pointer whitespace-nowrap transition-colors duration-200 hover:border-[#1A3D37]"
                            onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                        >
                            <span>{selectedStatus === 'All' ? 'Filter By Status' : selectedStatus}</span>
                            <ChevronDown size={16} />
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
                <div className="flex justify-end gap-3 mb-4">
                    <button className="bg-[#00796B] text-white border-none px-5 py-2.5 rounded-xl font-medium text-sm cursor-pointer transition-opacity duration-200 hover:opacity-90">
                        <Plus size={18} className="inline-block mr-2 align-middle" />
                        Add New Facility
                    </button>
                    <button className="bg-transparent border border-[#1A3D37] text-[#1A3D37] px-5 py-2.5 rounded-xl font-medium text-sm cursor-pointer flex items-center gap-2 transition-colors duration-200 hover:bg-[#1A3D37]/[0.05]">
                        <Download size={18} />
                        Export List
                    </button>
                </div>

                {/* Data Table */}
                <div className="bg-[#DDEDE7] rounded-2xl overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.03)] mb-6">
                    <table className="w-full border-collapse text-left">
                        <thead className="bg-[#99C7B6]">
                            <tr>
                                <th className="p-4 text-sm font-semibold text-[#1A3D37] border-b border-[#EEF2F0]">Facility Name</th>
                                <th className="p-4 text-sm font-semibold text-[#1A3D37] border-b border-[#EEF2F0]">District</th>
                                <th className="p-4 text-sm font-semibold text-[#1A3D37] border-b border-[#EEF2F0]">Facility Type</th>
                                <th className="p-4 text-sm font-semibold text-[#1A3D37] border-b border-[#EEF2F0]">Last Update</th>
                                <th className="p-4 text-sm font-semibold text-[#1A3D37] border-b border-[#EEF2F0]">Contact Person</th>
                                <th className="p-4 text-sm font-semibold text-[#1A3D37] border-b border-[#EEF2F0]">Status</th>
                                <th className="p-4 text-sm font-semibold text-[#1A3D37] border-b border-[#EEF2F0]">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.map((facility) => (
                                <tr key={facility.id}>
                                    <td className="p-4 text-sm text-[#1A3D37] border-b border-[#EEF2F0] bg-[#F1F8F5]/30 font-medium">{facility.name}</td>
                                    <td className="p-4 text-sm text-[#1A3D37] border-b border-[#EEF2F0] bg-[#F1F8F5]/30">{facility.district}</td>
                                    <td className="p-4 text-sm text-[#1A3D37] border-b border-[#EEF2F0] bg-[#F1F8F5]/30">{facility.type}</td>
                                    <td className="p-4 text-sm text-[#1A3D37] border-b border-[#EEF2F0] bg-[#F1F8F5]/30">{facility.lastUpdate}</td>
                                    <td className="p-4 text-sm text-[#1A3D37] border-b border-[#EEF2F0] bg-[#F1F8F5]/30">{facility.contact}</td>
                                    <td className="p-4 text-sm text-[#1A3D37] border-b border-[#EEF2F0] bg-[#F1F8F5]/30">
                                        <span className={`px-3 py-1 rounded-full text-[12px] font-medium inline-block ${getStatusClass(facility.status)}`}>
                                            {facility.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-[#1A3D37] border-b border-[#EEF2F0] bg-[#F1F8F5]/30">
                                        <div className="flex items-center gap-2">
                                            <button
                                                className="w-[70px] h-[36px] bg-[#00796B] text-white border-none rounded-lg flex items-center justify-center gap-1 text-[13px] font-medium cursor-pointer transition-opacity duration-200 hover:opacity-90"
                                                onClick={() => navigate(`/facility/${facility.id}`)}
                                            >
                                                <Eye size={16} />
                                                <span>View</span>
                                            </button>
                                            <button className="w-8 h-8 rounded-lg border-none flex items-center justify-center cursor-pointer transition-opacity duration-200 hover:opacity-80 bg-[#E0F2F1] text-[#00796B]">
                                                <Edit2 size={16} />
                                            </button>
                                            <button className="w-8 h-8 rounded-lg border-none flex items-center justify-center cursor-pointer transition-opacity duration-200 hover:opacity-80 bg-[#FFEBEE] text-[#D32F2F]">
                                                <Trash2 size={16} />
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
                            className={`px-8 py-3 rounded-full border-none cursor-pointer font-medium text-base text-white transition-all duration-300 ease-in-out whitespace-nowrap ${activeTab === 'health-facility' ? 'bg-[#2D6A5D] shadow-[inset_0_2px_4px_rgba(0,0,0,0.1),4px_0_15px_rgba(0,0,0,0.15)] z-[1]' : 'bg-transparent hover:bg-white/10'}`}
                            onClick={() => setActiveTab('health-facility')}
                        >
                            Health Facility List
                        </button>
                        <button
                            className={`px-8 py-3 rounded-full border-none cursor-pointer font-medium text-base text-white transition-all duration-300 ease-in-out whitespace-nowrap ${activeTab === 'past-outbreak' ? 'bg-[#2D6A5D] shadow-[inset_0_2px_4px_rgba(0,0,0,0.1),4px_0_15px_rgba(0,0,0,0.15)] z-[1]' : 'bg-transparent hover:bg-white/10'}`}
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
