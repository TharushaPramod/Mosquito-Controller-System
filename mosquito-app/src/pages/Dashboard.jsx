import React from 'react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import StatCard from '../components/Dashboard/StatCard';
import ActionCard from '../components/Dashboard/ActionCard';
import HeatmapSection from '../components/Dashboard/HeatmapSection';
import TrendChart from '../components/Dashboard/TrendChart';
import AlertsList from '../components/Dashboard/AlertsList';
import { CloudUpload, Search, ShieldCheck, Database, Zap, Activity } from 'lucide-react';
import riskForecastImage from '../assets/images/risk-forecast.png';
import uploadHealthDataImage from '../assets/images/upload-health-data.png';

const Dashboard = () => {
    return (
        <DashboardLayout title="Dashboard">
            <div className="flex flex-col gap-6">

                {/* Top Row: Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Today Reported Cases"
                        value="112"
                        trend="up"
                        trendValue="15%"
                        trendLabel="from yesterday"
                        linkText="View Details"
                    />
                    <StatCard
                        title="This week Total Cases"
                        value="232"
                        trend="up"
                        trendValue="12%"
                        trendLabel="from last week"
                        linkText="View Report"
                    />
                    <StatCard
                        title="Active Outbreaks"
                        value="3"
                        trend="down"
                        trendValue="-1%"
                        trendLabel="from last week"
                        linkText="View Map"
                    />
                    <StatCard
                        title="Pending Facility Reports"
                        value="15"
                        trend="up"
                        trendValue="+3%"
                        trendLabel="from yesterday"
                        linkText="View List"
                    />
                </div>

                {/* Middle Row: Heatmap & Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Heatmap - Takes up 2 columns */}
                    <div className="lg:col-span-2">
                        <HeatmapSection />
                    </div>

                    {/* Actions - Takes up 1 column */}
                    <div className="flex flex-col gap-4">
                        <ActionCard
                            icon={CloudUpload}
                            image={uploadHealthDataImage}
                            label="Upload Health Data"
                            color="bg-gray-100"
                            iconColor="text-gray-600"
                        />
                        <ActionCard
                            icon={Search}
                            image={riskForecastImage}
                            label="View Risk Forecast"
                            color="bg-blue-100"
                            iconColor="text-blue-500"
                        />

                        {/* Enhanced Status Widget */}
                        <div className="bg-[#DDEDE7] rounded-xl p-4 shadow-sm flex-1 flex flex-col justify-between">
                            <div className="flex items-center justify-between border-b border-[#2F6A5F]/10 pb-2 mb-2">
                                <h4 className="text-[9px] font-extrabold text-[#2F6A5F] uppercase tracking-widest">Live System Status</h4>
                                <div className="flex gap-1">
                                    <div className="w-1 h-1 rounded-full bg-[#2F6A5F] animate-pulse"></div>
                                    <div className="w-1 h-1 rounded-full bg-[#2F6A5F]/40"></div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center group">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded bg-white/50 flex items-center justify-center text-[#2F6A5F]">
                                            <Zap size={12} />
                                        </div>
                                        <span className="text-[#2F6A5F]/70 font-bold uppercase text-[9px] tracking-tight">Data Sync</span>
                                    </div>
                                    <span className="text-[#2F6A5F] font-extrabold text-[9px] bg-white/80 px-1.5 py-0.5 rounded uppercase tracking-wider">Stable</span>
                                </div>

                                <div className="flex justify-between items-center group">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded bg-white/50 flex items-center justify-center text-[#2F6A5F]">
                                            <Database size={12} />
                                        </div>
                                        <span className="text-[#2F6A5F]/70 font-bold uppercase text-[9px] tracking-tight">Facility API</span>
                                    </div>
                                    <span className="text-[#2F6A5F] font-extrabold text-[9px] bg-white/80 px-1.5 py-0.5 rounded uppercase tracking-wider">Online</span>
                                </div>

                                <div className="flex justify-between items-center group">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded bg-white/50 flex items-center justify-center text-[#2F6A5F]">
                                            <ShieldCheck size={12} />
                                        </div>
                                        <span className="text-[#2F6A5F]/70 font-bold uppercase text-[9px] tracking-tight">Encryption</span>
                                    </div>
                                    <span className="text-[#2F6A5F] font-extrabold text-[9px] bg-white/80 px-1.5 py-0.5 rounded uppercase tracking-wider">Active</span>
                                </div>
                            </div>

                            <div className="mt-2 pt-2 border-t border-[#2F6A5F]/10 flex items-center gap-2">
                                <Activity size={10} className="text-[#2F6A5F]/40" />
                                <span className="text-[8px] font-bold text-[#2F6A5F]/40 uppercase tracking-tighter">Last Checked: Just Now</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Row: Trends & Alerts */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Trends - Takes up 2 columns */}
                    <div className="lg:col-span-2">
                        <TrendChart />
                    </div>

                    {/* Alerts - Takes up 1 column */}
                    <div>
                        <AlertsList />
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
};

export default Dashboard;
