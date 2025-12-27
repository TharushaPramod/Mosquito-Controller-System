import React, { useState } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    Eye,
    ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/Layout/DashboardLayout';
import './FacilityDetail.css';

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    RadialBarChart,
    RadialBar,
    Legend
} from 'recharts';

import { MapContainer, TileLayer, Circle, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const FacilityDetail = () => {
    const [activeTab, setActiveTab] = useState('Daily Reports');
    const navigate = useNavigate();

    const facilityLocation = [6.9270786, 79.861243]; // Colombo National Hospital

    const outbreakClusters = [
        { position: [6.930, 79.865], radius: 300, color: '#FF5252', level: 'High Risk', density: '24 Cases' },
        { position: [6.925, 79.858], radius: 200, color: '#FFB142', level: 'Medium Risk', density: '12 Cases' },
        { position: [6.920, 79.868], radius: 400, color: '#FF5252', level: 'High Risk', density: '31 Cases' },
        { position: [6.935, 79.860], radius: 150, color: '#4BC0C0', level: 'Low Risk', density: '5 Cases' },
    ];

    const monthlyData = [
        { name: 'Jan', cases: 400 },
        { name: 'Feb', cases: 300 },
        { name: 'Mar', cases: 600 },
        { name: 'Apr', cases: 800 },
        { name: 'May', cases: 500 },
        { name: 'Jun', cases: 900 },
    ];

    const yearlyData = [
        { name: '2020', cases: 4000 },
        { name: '2021', cases: 3000 },
        { name: '2022', cases: 2000 },
        { name: '2023', cases: 2780 },
        { name: '2024', cases: 1890 },
        { name: '2025', cases: 2390 },
    ];

    const categoryData = [
        { name: 'Confirmed', value: 400 },
        { name: 'Suspected', value: 300 },
        { name: 'Recovered', value: 200 },
        { name: 'Deaths', value: 50 },
    ];

    const distributionData = [
        { name: '2022', value: 25, fill: '#8884d8' },
        { name: '2023', value: 35, fill: '#83a6ed' },
        { name: '2024', value: 20, fill: '#8dd1e1' },
        { name: '2025', value: 20, fill: '#82ca9d' },
    ];

    const facilityInfo = {
        name: 'National Hospital Colombo',
        district: 'Colombo District',
        phone: '0112-12-1234',
        email: 'nhc@gmail.com',
        gps: '6.9270786, 79.861243',
        status: 'Active'
    };

    const todayStats = [
        { label: 'Confirmed Cases', value: 4 },
        { label: 'Suspected Cases', value: 2 },
        { label: 'Death', value: 0 }
    ];

    const reportData = [
        { date: '23/11/2025', confirmed: 11, suspected: 2, death: 0, ageGroup: '20-30', source: 'Manual' },
        { date: '23/11/2025', confirmed: 12, suspected: 3, death: 0, ageGroup: '20-30', source: 'Manual' },
        { date: '23/11/2025', confirmed: 14, suspected: 4, death: 0, ageGroup: '20-30', source: 'Manual' },
        { date: '23/11/2025', confirmed: 15, suspected: 6, death: 0, ageGroup: '20-30', source: 'Manual' },
        { date: '23/11/2025', confirmed: 16, suspected: 4, death: 0, ageGroup: '20-30', source: 'Manual' },
        { date: '23/11/2025', confirmed: 8, suspected: 12, death: 0, ageGroup: '20-30', source: 'Manual' },
        { date: '23/11/2025', confirmed: 8, suspected: 12, death: 0, ageGroup: '20-30', source: 'Manual' },
        { date: '23/11/2025', confirmed: 8, suspected: 12, death: 0, ageGroup: '20-30', source: 'Manual' },
        { date: '23/11/2025', confirmed: 8, suspected: 12, death: 0, ageGroup: '20-30', source: 'Manual' },
    ];

    const tabs = [
        'Daily Reports',
        'Facility Summary Stats',
        'Map',
        'Contact / Staff',
        'Integration Logs'
    ];

    const renderDailyReports = () => (
        <div className="tab-content">
            <div className="fd-table-container">
                <table className="fd-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Confirmed Cases</th>
                            <th>Suspected Cases</th>
                            <th>Deaths</th>
                            <th>Age Groups</th>
                            <th>Upload Source (Manual or API)</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reportData.map((report, index) => (
                            <tr key={index}>
                                <td>{report.date}</td>
                                <td>{report.confirmed}</td>
                                <td>{report.suspected}</td>
                                <td>{report.death}</td>
                                <td>{report.ageGroup}</td>
                                <td>{report.source}</td>
                                <td>
                                    <button className="fd-view-btn">View</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <footer className="fd-footer">
                <button className="di-pagination-btn">
                    <ChevronLeft size={20} />
                </button>
                <div className="di-page-info">
                    <span className="current-page">1</span>
                    <span className="page-separator">/</span>
                    <span className="total-pages">10</span>
                </div>
                <button className="di-pagination-btn">
                    <ChevronRight size={20} />
                </button>
            </footer>
        </div>
    );

    const renderFacilityStats = () => (
        <div className="tab-content stats-tab">
            <div className="stats-grid">
                <div className="stat-chart-card">
                    <h4>Total Cases (Monthly)</h4>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0EEE9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#4B9081', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#4B9081', fontSize: 12 }} />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                <Line type="monotone" dataKey="cases" stroke="#64B49F" strokeWidth={3} dot={{ r: 4, fill: '#64B49F' }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="stat-chart-card">
                    <h4>Total Cases (Yearly)</h4>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={yearlyData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0EEE9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#4B9081', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#4B9081', fontSize: 12 }} />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                <Line type="monotone" dataKey="cases" stroke="#4A90E2" strokeWidth={3} dot={{ r: 4, fill: '#4A90E2' }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="stat-chart-card">
                    <h4>Case Category Comparison</h4>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={categoryData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E0EEE9" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#4B9081', fontSize: 12 }} width={80} />
                                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                <Bar dataKey="value" fill="#64B49F" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="stat-chart-card">
                    <h4>Cases by Year (Distribution)</h4>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height={250}>
                            <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="80%" barSize={10} data={distributionData}>
                                <RadialBar
                                    minAngle={15}
                                    label={{ position: 'insideStart', fill: '#fff', fontSize: 10 }}
                                    background
                                    clockWise
                                    dataKey="value"
                                />
                                <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" />
                                <Tooltip />
                            </RadialBarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderMap = () => (
        <div className="tab-content map-tab">
            <div className="map-header">
                <h4>Nearby Outbreak Clusters (within 1 km radius)</h4>
                <div className="map-legend">
                    <span className="legend-item"><span className="dot high"></span> High Risk</span>
                    <span className="legend-item"><span className="dot medium"></span> Medium Risk</span>
                    <span className="legend-item"><span className="dot low"></span> Low Risk</span>
                </div>
            </div>
            <div className="map-container-wrapper">
                <MapContainer center={facilityLocation} zoom={15} scrollWheelZoom={false} style={{ height: '400px', width: '100%', borderRadius: '12px' }}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Circle
                        center={facilityLocation}
                        pathOptions={{ color: '#1A3D37', fillColor: '#1A3D37', fillOpacity: 0.2 }}
                        radius={50}
                    >
                        <Popup>Facility: {facilityInfo.name}</Popup>
                    </Circle>

                    {outbreakClusters.map((cluster, index) => (
                        <Circle
                            key={index}
                            center={cluster.position}
                            pathOptions={{ color: cluster.color, fillColor: cluster.color, fillOpacity: 0.4 }}
                            radius={cluster.radius}
                        >
                            <Popup>
                                <strong>{cluster.level}</strong><br />
                                {cluster.density}
                            </Popup>
                        </Circle>
                    ))}
                </MapContainer>
            </div>
        </div>
    );

    const renderContactStaff = () => (
        <div className="tab-content contact-tab">
            <div className="contact-grid">
                <div className="contact-section">
                    <h4 className="section-title">Primary Contact</h4>
                    <div className="info-row">
                        <span className="info-label">Name</span>
                        <span className="info-value">Dr. Anura Perera</span>
                    </div>
                    <div className="info-row">
                        <span className="info-label">Address</span>
                        <span className="info-value">Regent St, Colombo 01000</span>
                    </div>
                    <div className="info-row">
                        <span className="info-label">Email</span>
                        <span className="info-value">anura.p@health.gov.lk</span>
                    </div>
                    <div className="info-row">
                        <span className="info-label">Phone Number</span>
                        <span className="info-value">0112-12-1234</span>
                    </div>
                </div>

                <div className="contact-section">
                    <h4 className="section-title">Officer Assigned</h4>
                    <div className="info-row">
                        <span className="info-label">Officer Name</span>
                        <span className="info-value">Saman Kumara</span>
                    </div>
                    <div className="info-row">
                        <span className="info-label">Role</span>
                        <span className="info-value">PHI (Public Health Inspector)</span>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderIntegrationLogs = () => (
        <div className="tab-content logs-tab">
            <div className="logs-sections">
                <section className="log-section">
                    <h4 className="log-title">Log File</h4>
                    <div className="log-list">
                        <div className="log-item">
                            <span className="log-time">[2025-11-23 10:20:15]</span>
                            <span className="log-msg">System started data synchronization sequence...</span>
                        </div>
                        <div className="log-item">
                            <span className="log-time">[2025-11-23 10:20:18]</span>
                            <span className="log-msg">Establishing connection with Facility API...</span>
                        </div>
                        <div className="log-item">
                            <span className="log-time">[2025-11-23 10:20:25]</span>
                            <span className="log-msg">Scanning for new case entries in local database.</span>
                        </div>
                    </div>
                </section>

                <section className="log-section">
                    <h4 className="log-title">API Response History</h4>
                    <div className="log-table-wrapper">
                        <table className="mini-log-table">
                            <thead>
                                <tr>
                                    <th>Timestamp</th>
                                    <th>Endpoint</th>
                                    <th>Status</th>
                                    <th>Message</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="status-success">
                                    <td>10:21:05</td>
                                    <td>/cases/sync</td>
                                    <td className="status-tag">Success</td>
                                    <td>15 records updated successfully</td>
                                </tr>
                                <tr className="status-failed">
                                    <td>10:25:30</td>
                                    <td>/health/status</td>
                                    <td className="status-tag">Failed</td>
                                    <td>Connection timeout</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="log-section">
                    <h4 className="log-title">Error Log</h4>
                    <div className="log-table-wrapper">
                        <table className="mini-log-table">
                            <thead>
                                <tr>
                                    <th>Timestamp</th>
                                    <th>Error Type</th>
                                    <th>Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="status-failed">
                                    <td>10:26:12</td>
                                    <td>NetworkError</td>
                                    <td>DNS resolution failed for api.mosquito.control</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="log-section">
                    <h4 className="log-title">Data Validation Failure</h4>
                    <div className="log-table-wrapper">
                        <table className="mini-log-table">
                            <thead>
                                <tr>
                                    <th>Timestamp</th>
                                    <th>Field</th>
                                    <th>Expected</th>
                                    <th>Received</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="status-failed">
                                    <td>10:21:05</td>
                                    <td>case_date</td>
                                    <td>YYYY-MM-DD</td>
                                    <td>23/11/2025</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </div>
    );

    const renderTabContent = () => {
        switch (activeTab) {
            case 'Daily Reports':
                return renderDailyReports();
            case 'Facility Summary Stats':
                return renderFacilityStats();
            case 'Map':
                return renderMap();
            case 'Contact / Staff':
                return renderContactStaff();
            case 'Integration Logs':
                return renderIntegrationLogs();
            default:
                return renderDailyReports();
        }
    };

    return (
        <DashboardLayout title="">
            <div className="facility-detail-container">
                <div className="facility-detail-content">
                    {/* Back Button */}
                    <button
                        className="fd-back-btn"
                        onClick={() => navigate('/data-integration')}
                    >
                        <ArrowLeft size={18} />
                        <span>Back</span>
                    </button>

                    {/* Top Info Card */}
                    <div className="fd-info-card">
                        <div className="fd-info-left">
                            <h2>{facilityInfo.name}</h2>
                            <div className="fd-info-district">{facilityInfo.district}</div>
                            <div className="fd-info-details">
                                <span>Phone: {facilityInfo.phone}, Email: {facilityInfo.email}</span>
                                <span>GPS Location: {facilityInfo.gps}.</span>
                            </div>
                        </div>
                        <div className="fd-status-tag active">
                            {facilityInfo.status}
                        </div>
                    </div>

                    {/* Today Summary */}
                    <div className="fd-today-section">
                        <h3 className="fd-today-title">Today</h3>
                        <div className="fd-stats-grid">
                            {todayStats.map((stat, index) => (
                                <div key={index} className="fd-stat-card">
                                    <div className="fd-stat-value">{stat.value}</div>
                                    <div className="fd-stat-label">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="fd-tabs-nav">
                        {tabs.map((tab) => (
                            <button
                                key={tab}
                                className={`fd-tab-item ${activeTab === tab ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Dynamic Tab Content */}
                    {renderTabContent()}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default FacilityDetail;
