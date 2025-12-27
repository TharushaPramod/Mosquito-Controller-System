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
    ChevronRight
} from 'lucide-react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import './DataIntegration.css';

const DataIntegration = () => {
    const [activeTab, setActiveTab] = useState('health-facility');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('All');
    const [selectedStatus, setSelectedStatus] = useState('All');
    const [isDistrictDropdownOpen, setIsDistrictDropdownOpen] = useState(false);
    const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

    const navigate = useNavigate();

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

    const districts = ['All', 'Gampaha', 'Kurunegala', 'Colombo', 'Kalutara', 'Galle'];
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
                            <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-2">
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
            </div>
        </DashboardLayout>
    );
};

export default DataIntegration;
