import React, { useState, useEffect } from 'react';
import { Calendar, Activity, ArrowUpRight } from 'lucide-react';
import { RiskCard } from '../../components/Mosquito_Density/RiskCard';
import { UploadSection } from '../../components/Mosquito_Density/UploadSection';
import { Link } from 'react-router-dom';
import { ForecastLineChart } from '../../components/Mosquito_Density/LineChartComponent';
import { Loader2 } from 'lucide-react';
import Navbar from '../../components/Mosquito_Density/Navbar';

export const DashboardHome = () => {
    // 1. State to hold the dynamic data
    const [peakDay, setPeakDay] = useState("Loading...");
    const [peakValue, setPeakValue] = useState(0);
    const [riskLevel, setRiskLevel] = useState("LOADING..."); // New State for Risk
    const [loading, setLoading] = useState(true);
    const [forecastData, setForecastData] = useState([]); // Store full forecast data

    // Function to refresh predictions (called after model upload)
    const refreshPredictions = async () => {
        setLoading(true);
        try {
            // Connect to your backend with cache-busting
            const response = await fetch(`http://127.0.0.1:5001/api/predict?t=${new Date().getTime()}`);
            const data = await response.json();

            if (Array.isArray(data)) {
                setForecastData(data); // Save full data for chart
            } else {
                console.warn("Forecast data is not an array:", data);
                setForecastData([]); // Reset to empty if invalid
            }

            // Logic to find the "Peak" (Highest Predicted Value)
            if (data && data.length > 0) {
                // Reduce the array to find the object with the highest 'predicted' value
                const maxDay = data.reduce((prev, current) =>
                    (prev.predicted > current.predicted) ? prev : current
                );

                const maxVal = Math.round(maxDay.predicted); // Clean up the number

                setPeakDay(maxDay.day);      // e.g., "Wednesday"
                setPeakValue(maxVal);        // e.g., 85

                // Determine Risk Level based on Density
                if (maxVal >= 75) {
                    setRiskLevel("HIGH");
                } else if (maxVal >= 40) {
                    setRiskLevel("MEDIUM");
                } else {
                    setRiskLevel("LOW");
                }
            }
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch backend data:", error);
            setPeakDay("N/A");
            setRiskLevel("N/A");
            setLoading(false);
        }
    };

    // 2. Fetch Data on mount
    useEffect(() => {
        refreshPredictions();
    }, []);

    return (
        <>
            <Navbar />
            <div className="w-full min-h-screen px-4 py-8 bg-[#F0F7F5] sm:px-6 lg:px-12">
                {/* Header */}
                <h1 className="mb-2 text-3xl font-bold text-gray-900">Predictive Analytics Engine</h1>
                <p className="mb-10 text-lg text-gray-600">Gampaha MOH Area • Dengue Density Forecasting Module</p>

                {/* Key Metrics Cards */}
                <div className="grid grid-cols-1 gap-6 mb-10 md:grid-cols-3">

                {/* --- 1. DYNAMIC RISK CARD (Updated) --- */}
                {/* Now passing the calculated State to the component */}
                <RiskCard
                    riskLevel={loading ? "LOADING..." : riskLevel}
                    probability={peakValue}
                />

                {/* --- 2. DYNAMIC PEAK CARD --- */}
                <div className="p-6 border border-orange-200 bg-orange-50 rounded-xl">
                    <div className="flex items-center gap-3 mb-4">
                        <Calendar className="w-8 h-8 text-orange-600" />
                        <h3 className="text-lg font-semibold text-orange-900">Expected Peak</h3>
                    </div>

                    {loading ? (
                        <div className="w-1/2 h-10 bg-orange-200 rounded animate-pulse"></div>
                    ) : (
                        <div>
                            <p className="text-3xl font-bold text-orange-600">{peakDay}</p>
                            <div className="flex items-center mt-2 text-orange-700">
                                <ArrowUpRight className="w-4 h-4 mr-1" />
                                <span className="text-sm font-medium">
                                    Peak Density Index: {peakValue}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* --- 3. ACCURACY CARD (Static for now) --- */}
                <div className="p-6 border border-green-200 bg-green-50 rounded-xl">
                    <div className="flex items-center gap-3 mb-4">
                        <Activity className="w-8 h-8 text-green-600" />
                        <h3 className="text-lg font-semibold text-green-900">Model Accuracy</h3>
                    </div>
                    <p className="text-4xl font-bold text-green-600">92.4%</p>
                    <p className="mt-2 text-sm text-gray-600">Based on Random Forest Regressor</p>
                </div>

                {/* --- CHART REMOVED FROM DASHBOARD --- */}
                {/* Data is still fetched to power the cards above */}
                </div>

                {/* Main Content: Navigation Cards + Upload Section */}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    {/* Left: Quick Navigation Links */}
                    <div className="space-y-6 lg:col-span-2">
                        <Link
                            to="/forecast"
                            className="block p-8 transition-all duration-300 bg-white border border-gray-100 shadow-sm rounded-xl hover:shadow-lg hover:border-[#2F6A5F] group"
                        >
                            <h3 className="text-2xl font-semibold text-gray-800 transition-colors group-hover:text-[#2F6A5F]">
                                Go to Full 7-Day Forecast →
                            </h3>
                            <p className="mt-2 text-gray-600">View detailed line chart with actual vs predicted density</p>
                        </Link>

                        <Link
                            to="/map"
                            className="block p-8 transition-all duration-300 bg-white border border-gray-100 shadow-sm rounded-xl hover:shadow-lg hover:border-[#2F6A5F] group"
                        >
                            <h3 className="text-2xl font-semibold text-gray-800 transition-colors group-hover:text-[#2F6A5F]">
                                View Spatial Prediction Map →
                            </h3>
                            <p className="mt-2 text-gray-600">Interactive heatmap of dengue risk across Gampaha district</p>
                        </Link>

                        <Link
                            to="/reports"
                            className="block p-8 transition-all duration-300 bg-white border border-gray-100 shadow-sm rounded-xl hover:shadow-lg hover:border-[#2F6A5F] group"
                        >
                            <h3 className="text-2xl font-semibold text-gray-800 transition-colors group-hover:text-[#2F6A5F]">
                                Generate & View Reports →
                            </h3>
                            <p className="mt-2 text-gray-600">Export weekly PDF reports and manage historical data</p>
                        </Link>
                    </div>

                    {/* Right: Upload & Run Section */}
                    <div className="lg:sticky lg:top-8">
                        <UploadSection onModelDeployed={refreshPredictions} />
                    </div>
                </div>
            </div>
        </>
    );
};