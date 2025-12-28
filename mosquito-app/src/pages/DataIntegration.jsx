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
import './DataIntegration.css';

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
            case 'Active': return 'status-active';
            case 'Not Sending Data': return 'status-not-sending';
            case 'Delayed': return 'status-delayed';
            default: return '';
        }
    };

    const diseases = ['All', 'Dengue', 'Chikungunya', 'Zika', 'Malaria'];
    const severities = ['All', 'Low', 'Medium', 'High'];
    const sources = ['All', 'Hospital Data', 'MOH Reports', 'PHI Reports', 'Automated Prediction'];

    const getSeverityClass = (severity) => {
        switch (severity) {
            case 'High': return 'sev-high';
            case 'Medium': return 'sev-medium';
            case 'Low': return 'sev-low';
            default: return '';
        }
    };

    const renderPastOutbreak = () => {
        return (
            <div className="past-outbreak-container">
                {/* Outbreak Filter Panel */}
                <div className="outbreak-filter-panel">
                    <div className="filter-group">
                        <label>District</label>
                        <div className="relative">
                            <button className="di-filter-btn" onClick={() => setIsDistrictDropdownOpen(!isDistrictDropdownOpen)}>
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

                    <div className="filter-group">
                        <label>Disease Type</label>
                        <div className="relative">
                            <button className="di-filter-btn" onClick={() => setIsDiseaseDropdownOpen(!isDiseaseDropdownOpen)}>
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

                    <div className="filter-group">
                        <label>Date Range</label>
                        <div className="date-range-inputs">
                            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="date-input" />
                            <span>to</span>
                            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="date-input" />
                        </div>
                    </div>

                    <div className="filter-group">
                        <label>Severity</label>
                        <div className="relative">
                            <button className="di-filter-btn" onClick={() => setIsSeverityDropdownOpen(!isSeverityDropdownOpen)}>
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

                    <div className="filter-group">
                        <label>Source</label>
                        <div className="relative">
                            <button className="di-filter-btn" onClick={() => setIsSourceDropdownOpen(!isSourceDropdownOpen)}>
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
                <div className="di-table-container outbreak-table">
                    <table className="di-table">
                        <thead>
                            <tr>
                                <th>Outbreak ID</th>
                                <th>District</th>
                                <th>Start Date</th>
                                <th>End Date</th>
                                <th>Total Reported Cases</th>
                                <th>Severity Rating</th>
                                <th>Download Report</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOutbreaks.map((ob) => (
                                <tr key={ob.id}>
                                    <td className="font-mono">{ob.id}</td>
                                    <td>{ob.district}</td>
                                    <td>{ob.startDate}</td>
                                    <td>{ob.endDate}</td>
                                    <td className="font-bold">{ob.cases}</td>
                                    <td>
                                        <span className={`severity-tag ${getSeverityClass(ob.severity)}`}>
                                            {ob.severity}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="download-report-btn">
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
                <div className="outbreak-analytics-grid">
                    <div className="analytics-card">
                        <div className="card-header">
                            <FileText size={18} className="text-teal-600" />
                            <h4>Outbreak Timeline Graph</h4>
                        </div>
                        <div className="chart-container">
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

                    <div className="analytics-card">
                        <div className="card-header">
                            <Calendar size={18} className="text-teal-600" />
                            <h4>Seasonal Trend Line (Yearly)</h4>
                        </div>
                        <div className="chart-container">
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
                <div className="di-filters-section">
                    <div className="relative">
                        <button
                            className="di-filter-btn"
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

                    <div className="di-search-container">
                        <Search className="di-search-icon" size={18} />
                        <input
                            type="text"
                            className="di-search-input"
                            placeholder="Search Here"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="relative">
                        <button
                            className="di-filter-btn"
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
                <div className="di-actions">
                    <button className="di-btn-primary">
                        <Plus size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                        Add New Facility
                    </button>
                    <button className="di-btn-outline">
                        <Download size={18} />
                        Export List
                    </button>
                </div>

                {/* Data Table */}
                <div className="di-table-container">
                    <table className="di-table">
                        <thead>
                            <tr>
                                <th>Facility Name</th>
                                <th>District</th>
                                <th>Facility Type</th>
                                <th>Last Update</th>
                                <th>Contact Person</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.map((facility) => (
                                <tr key={facility.id}>
                                    <td style={{ fontWeight: '500' }}>{facility.name}</td>
                                    <td>{facility.district}</td>
                                    <td>{facility.type}</td>
                                    <td>{facility.lastUpdate}</td>
                                    <td>{facility.contact}</td>
                                    <td>
                                        <span className={`status-pill ${getStatusClass(facility.status)}`}>
                                            {facility.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="di-action-icons" style={{ alignItems: 'center' }}>
                                            <button
                                                className="di-view-btn"
                                                onClick={() => navigate(`/facility/${facility.id}`)}
                                            >
                                                <Eye size={16} />
                                                <span>View</span>
                                            </button>
                                            <button className="di-icon-btn edit">
                                                <Edit2 size={16} />
                                            </button>
                                            <button className="di-icon-btn delete">
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
                <footer className="di-footer">
                    <button className="di-pagination-btn">
                        <ChevronLeft size={20} />
                    </button>
                    <span className="di-page-info">Page 1 of 10</span>
                    <button className="di-pagination-btn">
                        <ChevronRight size={20} />
                    </button>
                </footer>
            </>
        );
    };

    return (
        <DashboardLayout title="Data Integration">
            <div className="data-integration-content">
                {/* Tab Switcher */}
                <div className="di-tab-switcher">
                    <div className="di-tabs">
                        <button
                            className={`di-tab ${activeTab === 'health-facility' ? 'active' : 'inactive'}`}
                            onClick={() => setActiveTab('health-facility')}
                        >
                            Health Facility List
                        </button>
                        <button
                            className={`di-tab ${activeTab === 'past-outbreak' ? 'active' : 'inactive'}`}
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
