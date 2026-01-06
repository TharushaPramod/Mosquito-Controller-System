import React, { useState, useEffect } from 'react';
import { ForecastLineChart } from '../../components/Mosquito_Density/LineChartComponent';
import { Loader2 } from 'lucide-react';
import Navbar from '../../components/Mosquito_Density/Navbar';


export const ForecastChart = () => {
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- FETCH DATA FROM PYTHON BACKEND ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`http://127.0.0.1:5001/api/predict?t=${new Date().getTime()}`);
                const data = await response.json();
                setChartData(data); // Save the data to state
                setLoading(false);
            } catch (error) {
                console.error("Error fetching forecast:", error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <>
            <Navbar />
            <div className="max-w-5xl min-h-screen p-8 mx-auto bg-[#F0F7F5]">
            <h1 className="mb-2 text-3xl font-bold text-gray-900">7-Day Dengue Density Forecast</h1>
            <p className="mb-8 text-gray-600">Detailed AI prediction model output based on recent Gampaha MOH data.</p>

            <div className="grid grid-cols-1 gap-8 mb-10 lg:grid-cols-3">
                {/* Chart Area - Takes up 2/3 width on large screens */}
                <div className="p-6 bg-white border border-gray-100 shadow-lg lg:col-span-2 rounded-xl">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-800">Visual Projection</h3>
                        {!loading && <span className="text-sm font-medium text-green-600">● Live Data</span>}
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-[400px] text-gray-400">
                            <Loader2 className="w-10 h-10 mb-4 text-blue-500 animate-spin" />
                            <p>Running Prediction Model...</p>
                        </div>
                    ) : (
                        <div className="h-[400px] w-full">
                            <ForecastLineChart data={chartData} />
                        </div>
                    )}
                </div>

                {/* Data List Area - Takes up 1/3 width */}
                <div className="bg-white border border-gray-100 shadow-lg rounded-xl flex flex-col h-[500px]">
                    <div className="p-5 border-b border-gray-100 bg-gray-50 rounded-t-xl">
                        <h3 className="font-bold text-gray-800">Forecast Values</h3>
                        <p className="text-xs text-gray-500">Predicted Mosquito Density Index</p>
                    </div>

                    <div className="flex-1 p-3 overflow-y-auto">
                        {loading ? (
                            <div className="flex items-center justify-center h-full text-gray-400">Loading...</div>
                        ) : (
                            <div className="space-y-3">
                                {chartData.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between p-4 transition-all border border-gray-100 rounded-lg cursor-default hover:shadow-md hover:border-blue-100 group">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center justify-center w-8 h-8 text-sm font-bold text-blue-600 transition-colors bg-blue-100 rounded-full group-hover:bg-blue-600 group-hover:text-white">
                                                {item.day.substring(0, 1)}
                                            </div>
                                            <span className="text-sm font-medium text-gray-700">{item.day}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="block text-lg font-bold text-gray-900 transition-colors group-hover:text-blue-600">
                                                {Math.round(item.predicted)}
                                            </span>
                                            <span className="text-[10px] text-gray-400">Density</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            </div>
        </>
    );
};