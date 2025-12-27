import React from 'react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import StatCard from '../components/Dashboard/StatCard';
import ActionCard from '../components/Dashboard/ActionCard';
import HeatmapSection from '../components/Dashboard/HeatmapSection';
import TrendChart from '../components/Dashboard/TrendChart';
import AlertsList from '../components/Dashboard/AlertsList';
import { CloudUpload, Search } from 'lucide-react';
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
                    <div className="flex flex-col gap-6">
                        <div className="flex-1">
                            <ActionCard
                                icon={CloudUpload}
                                image={uploadHealthDataImage}
                                label="Upload Health Data"
                                color="bg-gray-100"
                                iconColor="text-gray-600"
                            />
                        </div>
                        <div className="flex-1">
                            <ActionCard
                                icon={Search}
                                image={riskForecastImage}
                                label="View Risk Forcast"
                                color="bg-blue-100"
                                iconColor="text-blue-500"
                            />
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
