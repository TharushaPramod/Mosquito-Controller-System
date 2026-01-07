import React, { useState } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    Eye,
    ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/Layout/DashboardLayout';

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
        <div className="bg-[#DDEEE8] border border-[#99C7B6] rounded-tr-2xl rounded-br-2xl rounded-bl-2xl p-6 min-h-[400px]">
            <div className="bg-white rounded-xl overflow-hidden border border-[#B5D4C9]">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-[#99C7B6]">
                            <th className="p-4 text-[#1A3D37] text-sm font-bold text-left border-b-2 border-[#78B09B]">Date</th>
                            <th className="p-4 text-[#1A3D37] text-sm font-bold text-left border-b-2 border-[#78B09B]">Confirmed Cases</th>
                            <th className="p-4 text-[#1A3D37] text-sm font-bold text-left border-b-2 border-[#78B09B]">Suspected Cases</th>
                            <th className="p-4 text-[#1A3D37] text-sm font-bold text-left border-b-2 border-[#78B09B]">Deaths</th>
                            <th className="p-4 text-[#1A3D37] text-sm font-bold text-left border-b-2 border-[#78B09B]">Age Groups</th>
                            <th className="p-4 text-[#1A3D37] text-sm font-bold text-left border-b-2 border-[#78B09B]">Upload Source (Manual or API)</th>
                            <th className="p-4 text-[#1A3D37] text-sm font-bold text-left border-b-2 border-[#78B09B]">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reportData.map((report, index) => (
                            <tr key={index} className="bg-[#F7FBFA] even:bg-[#EDF7F4] hover:bg-[#E2F0EB]">
                                <td className="p-4 text-left text-sm text-[#1A3D37] border-b border-[#E0EEE9]">{report.date}</td>
                                <td className="p-4 text-left text-sm text-[#1A3D37] border-b border-[#E0EEE9]">{report.confirmed}</td>
                                <td className="p-4 text-left text-sm text-[#1A3D37] border-b border-[#E0EEE9]">{report.suspected}</td>
                                <td className="p-4 text-left text-sm text-[#1A3D37] border-b border-[#E0EEE9]">{report.death}</td>
                                <td className="p-4 text-left text-sm text-[#1A3D37] border-b border-[#E0EEE9]">{report.ageGroup}</td>
                                <td className="p-4 text-left text-sm text-[#1A3D37] border-b border-[#E0EEE9]">{report.source}</td>
                                <td className="p-4 text-left text-sm text-[#1A3D37] border-b border-[#E0EEE9]">
                                    <button className="bg-[#2D6A5D] text-white px-6 py-2 rounded-full border-none text-[13px] font-semibold cursor-pointer shadow-[0_4px_10px_rgba(0,0,0,0.1)] transition-transform duration-200 hover:scale-105 hover:bg-[#23544a]">View</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <footer className="flex justify-center items-center gap-4 mt-8">
                <button className="bg-white border border-[#B5D4C9] rounded-lg w-10 h-10 flex items-center justify-center cursor-pointer text-[#1A3D37] transition-all duration-200 hover:bg-[#E2F0EB] hover:border-[#1A3D37]">
                    <ChevronLeft size={20} />
                </button>
                <div className="flex items-center gap-2 font-semibold text-[#1A3D37]">
                    <span className="bg-[#1A3D37] text-white w-8 h-8 flex items-center justify-center rounded-md">1</span>
                    <span className="text-[#99C7B6]">/</span>
                    <span className="text-[#666]">10</span>
                </div>
                <button className="bg-white border border-[#B5D4C9] rounded-lg w-10 h-10 flex items-center justify-center cursor-pointer text-[#1A3D37] transition-all duration-200 hover:bg-[#E2F0EB] hover:border-[#1A3D37]">
                    <ChevronRight size={20} />
                </button>
            </footer>
        </div>
    );

    const renderFacilityStats = () => (
        <div className="bg-[#DDEEE8] border border-[#99C7B6] rounded-tr-2xl rounded-br-2xl rounded-bl-2xl p-6 min-h-[400px]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-5 border border-[#B5D4C9] shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
                    <h4 className="m-0 mb-4 text-[#1A3D37] text-base font-semibold">Total Cases (Monthly)</h4>
                    <div className="w-full">
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

                <div className="bg-white rounded-xl p-5 border border-[#B5D4C9] shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
                    <h4 className="m-0 mb-4 text-[#1A3D37] text-base font-semibold">Total Cases (Yearly)</h4>
                    <div className="w-full">
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

                <div className="bg-white rounded-xl p-5 border border-[#B5D4C9] shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
                    <h4 className="m-0 mb-4 text-[#1A3D37] text-base font-semibold">Case Category Comparison</h4>
                    <div className="w-full">
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

                <div className="bg-white rounded-xl p-5 border border-[#B5D4C9] shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
                    <h4 className="m-0 mb-4 text-[#1A3D37] text-base font-semibold">Cases by Year (Distribution)</h4>
                    <div className="w-full">
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
        <div className="bg-[#DDEEE8] border border-[#99C7B6] rounded-tr-2xl rounded-br-2xl rounded-bl-2xl p-6 min-h-[400px] flex flex-col gap-4">
            <div className="flex justify-between items-center">
                <h4 className="m-0 text-[#1A3D37] text-base font-semibold">Nearby Outbreak Clusters (within 1 km radius)</h4>
                <div className="flex gap-4">
                    <span className="flex items-center gap-1.5 text-[13px] text-[#4B9081]"><span className="w-3 h-3 rounded-full bg-[#FF5252]"></span> High Risk</span>
                    <span className="flex items-center gap-1.5 text-[13px] text-[#4B9081]"><span className="w-3 h-3 rounded-full bg-[#FFB142]"></span> Medium Risk</span>
                    <span className="flex items-center gap-1.5 text-[13px] text-[#4B9081]"><span className="w-3 h-3 rounded-full bg-[#4BC0C0]"></span> Low Risk</span>
                </div>
            </div>
            <div className="border border-[#B5D4C9] rounded-xl overflow-hidden relative z-10">
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
        <div className="bg-[#DDEEE8] border border-[#99C7B6] rounded-tr-2xl rounded-br-2xl rounded-bl-2xl p-6 min-h-[400px]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white rounded-xl p-6 border border-[#B5D4C9] shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
                    <h4 className="m-0 mb-5 text-[#1A3D37] text-[18px] font-bold border-b-2 border-[#64B49F] pb-2 w-fit">Primary Contact</h4>
                    <div className="flex justify-between py-3 border-b border-[#F0F7F5]">
                        <span className="text-[#4B9081] font-semibold text-sm">Name</span>
                        <span className="text-[#1A3D37] font-medium text-sm text-right">Dr. Anura Perera</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-[#F0F7F5]">
                        <span className="text-[#4B9081] font-semibold text-sm">Address</span>
                        <span className="text-[#1A3D37] font-medium text-sm text-right">Regent St, Colombo 01000</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-[#F0F7F5]">
                        <span className="text-[#4B9081] font-semibold text-sm">Email</span>
                        <span className="text-[#1A3D37] font-medium text-sm text-right">anura.p@health.gov.lk</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-[#F0F7F5] last:border-b-0">
                        <span className="text-[#4B9081] font-semibold text-sm">Phone Number</span>
                        <span className="text-[#1A3D37] font-medium text-sm text-right">0112-12-1234</span>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-[#B5D4C9] shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
                    <h4 className="m-0 mb-5 text-[#1A3D37] text-[18px] font-bold border-b-2 border-[#64B49F] pb-2 w-fit">Officer Assigned</h4>
                    <div className="flex justify-between py-3 border-b border-[#F0F7F5]">
                        <span className="text-[#4B9081] font-semibold text-sm">Officer Name</span>
                        <span className="text-[#1A3D37] font-medium text-sm text-right">Saman Kumara</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-[#F0F7F5] last:border-b-0">
                        <span className="text-[#4B9081] font-semibold text-sm">Role</span>
                        <span className="text-[#1A3D37] font-medium text-sm text-right">PHI (Public Health Inspector)</span>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderIntegrationLogs = () => (
        <div className="bg-[#DDEEE8] border border-[#99C7B6] rounded-tr-2xl rounded-br-2xl rounded-bl-2xl p-6 min-h-[400px] flex flex-col gap-8">
            <div className="bg-white rounded-xl p-5 border border-[#B5D4C9]">
                <h4 className="m-0 mb-4 text-[#1A3D37] text-base font-bold border-l-4 border-[#64B49F] pl-3">Log File</h4>
                <div className="flex flex-col gap-2 font-mono text-[13px] text-[#1A3D37]">
                    <div className="p-1 px-2 bg-[#F7FBFA] rounded">
                        <span className="text-[#4B9081] font-semibold mr-3">[2025-11-23 10:20:15]</span>
                        <span>System started data synchronization sequence...</span>
                    </div>
                    <div className="p-1 px-2 bg-[#F7FBFA] rounded">
                        <span className="text-[#4B9081] font-semibold mr-3">[2025-11-23 10:20:18]</span>
                        <span>Establishing connection with Facility API...</span>
                    </div>
                    <div className="p-1 px-2 bg-[#F7FBFA] rounded">
                        <span className="text-[#4B9081] font-semibold mr-3">[2025-11-23 10:20:25]</span>
                        <span>Scanning for new case entries in local database.</span>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl p-5 border border-[#B5D4C9]">
                <h4 className="m-0 mb-4 text-[#1A3D37] text-base font-bold border-l-4 border-[#64B49F] pl-3">API Response History</h4>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-[13px]">
                        <thead>
                            <tr className="bg-[#F0F7F5] text-[#4B9081] font-semibold border-b border-[#B5D4C9]">
                                <th className="text-left p-2.5">Timestamp</th>
                                <th className="text-left p-2.5">Endpoint</th>
                                <th className="text-left p-2.5">Status</th>
                                <th className="text-left p-2.5">Message</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="bg-[#E8F5E9]">
                                <td className="p-2.5 border-b border-[#F0F7F5]">10:21:05</td>
                                <td className="p-2.5 border-b border-[#F0F7F5]">/cases/sync</td>
                                <td className="p-2.5 border-b border-[#F0F7F5] font-bold text-[#2E7D32]">Success</td>
                                <td className="p-2.5 border-b border-[#F0F7F5]">15 records updated successfully</td>
                            </tr>
                            <tr className="bg-[#FFEBEE]">
                                <td className="p-2.5 border-b border-[#F0F7F5]">10:25:30</td>
                                <td className="p-2.5 border-b border-[#F0F7F5]">/health/status</td>
                                <td className="p-2.5 border-b border-[#F0F7F5] font-bold text-[#C62828]">Failed</td>
                                <td className="p-2.5 border-b border-[#F0F7F5]">Connection timeout</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-white rounded-xl p-5 border border-[#B5D4C9]">
                <h4 className="m-0 mb-4 text-[#1A3D37] text-base font-bold border-l-4 border-[#64B49F] pl-3">Error Log</h4>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-[13px]">
                        <thead>
                            <tr className="bg-[#F0F7F5] text-[#4B9081] font-semibold border-b border-[#B5D4C9]">
                                <th className="text-left p-2.5">Timestamp</th>
                                <th className="text-left p-2.5">Error Type</th>
                                <th className="text-left p-2.5">Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="bg-[#FFEBEE]">
                                <td className="p-2.5 border-b border-[#F0F7F5]">10:26:12</td>
                                <td className="p-2.5 border-b border-[#F0F7F5]">NetworkError</td>
                                <td className="p-2.5 border-b border-[#F0F7F5]">DNS resolution failed for api.mosquito.control</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-white rounded-xl p-5 border border-[#B5D4C9]">
                <h4 className="m-0 mb-4 text-[#1A3D37] text-base font-bold border-l-4 border-[#64B49F] pl-3">Data Validation Failure</h4>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-[13px]">
                        <thead>
                            <tr className="bg-[#F0F7F5] text-[#4B9081] font-semibold border-b border-[#B5D4C9]">
                                <th className="text-left p-2.5">Timestamp</th>
                                <th className="text-left p-2.5">Field</th>
                                <th className="text-left p-2.5">Expected</th>
                                <th className="text-left p-2.5">Received</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="bg-[#FFEBEE]">
                                <td className="p-2.5 border-b border-[#F0F7F5]">10:21:05</td>
                                <td className="p-2.5 border-b border-[#F0F7F5]">case_date</td>
                                <td className="p-2.5 border-b border-[#F0F7F5]">YYYY-MM-DD</td>
                                <td className="p-2.5 border-b border-[#F0F7F5]">23/11/2025</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
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
            <div className="text-[#1A3D37] font-sans">
                {/* Back Button */}
                <button
                    className="flex items-center gap-2 bg-white border border-[#E0E0E0] rounded-lg px-4 py-2 text-[#1A3D37] text-sm font-medium cursor-pointer mb-4 transition-all duration-200 w-fit hover:bg-[#F5F5F5] hover:border-[#1A3D37]"
                    onClick={() => navigate('/data-integration')}
                >
                    <ArrowLeft size={18} />
                    <span>Back</span>
                </button>

                {/* Top Info Card */}
                <div className="bg-[#1A3D37] rounded-2xl p-8 text-white flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-[28px] font-bold m-0 mb-2">{facilityInfo.name}</h2>
                        <div className="text-[18px] opacity-90 mb-4">{facilityInfo.district}</div>
                        <div className="flex flex-col gap-1 text-sm opacity-80">
                            <span>Phone: {facilityInfo.phone}, Email: {facilityInfo.email}</span>
                            <span>GPS Location: {facilityInfo.gps}.</span>
                        </div>
                    </div>
                    <div className="bg-[#E8F5E9] text-[#2E7D32] px-3 py-1 rounded-md text-sm font-semibold">
                        {facilityInfo.status}
                    </div>
                </div>

                {/* Today Summary */}
                <div className="bg-[#F0F7F5] border border-[#99C7B6] rounded-2xl p-6 mb-8">
                    <h3 className="text-[#4B9081] text-[20px] font-semibold mb-5">Today</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {todayStats.map((stat, index) => (
                            <div key={index} className="bg-[#DDEEE8] rounded-2xl p-6 text-center shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
                                <div className="text-[48px] font-bold text-[#1A3D37] mb-2">{stat.value}</div>
                                <div className="text-sm font-semibold text-[#555]">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex bg-[#1A3D37] rounded-t-lg overflow-hidden mb-0 w-fit">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            className={`px-6 py-4 text-white font-semibold text-base border-none bg-transparent cursor-pointer transition-colors duration-200 border-r border-white/10 last:border-r-0 ${activeTab === tab ? 'bg-[#64B49F]' : ''}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Dynamic Tab Content */}
                {renderTabContent()}
            </div>
        </DashboardLayout>
    );
};

export default FacilityDetail;
