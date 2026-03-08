

import React, { useEffect, useState } from 'react';
import { cn } from "../../lib/utils";
import { api } from "../../lib/api";
import { Thermometer, Droplets, Activity, Gauge } from 'lucide-react';

export const SensorDisplay = ({ className }) => {
    const [sensorData, setSensorData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSensorData = async () => {
            try {
                const response = await api.getSensorData();
                if (response.status === "success") {
                    setSensorData(response.data);
                    setError(null);
                } else {
                    // Mock data fallback instead of error
                    setSensorData({ temperature: 28.5, humidity: 65.0, sensor_type: 'DHT22 (Mock)' });
                    setError(null);
                }
            } catch (e) {
                console.error("Sensor read error, using mock:", e);
                // Mock data fallback
                setSensorData({ temperature: 28.5, humidity: 65.0, sensor_type: 'DHT22 (Mock)' });
                setError(null);
            } finally {
                setLoading(false);
            }
        };

        fetchSensorData();
        const interval = setInterval(fetchSensorData, 2000); // Poll every 2 seconds
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className={cn("bg-[var(--card-bg)] rounded-xl p-6 border border-white/40 shadow-sm", className)}>
                <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--navbar)]"></div>
                </div>
            </div>
        );
    }

    // Error block removed intentionally to suppress errors
    if (error) return null;

    // Render based on sensor type
    const renderSensorData = () => {
        if (!sensorData) return null;

        // DHT22/DHT11 sensor (temperature + humidity)
        if (sensorData.temperature !== undefined && sensorData.humidity !== undefined) {
            return (
                <>
                    <div className="flex items-center justify-between p-4 bg-white/40 rounded-lg border border-white/40">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-100 rounded-full">
                                <Thermometer className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                                <div className="text-xs text-gray-600 font-semibold">Temperature</div>
                                <div className="text-2xl font-bold text-[var(--navbar)]">{sensorData.temperature}°C</div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white/40 rounded-lg border border-white/40">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-full">
                                <Droplets className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <div className="text-xs text-gray-600 font-semibold">Humidity</div>
                                <div className="text-2xl font-bold text-[var(--navbar)]">{sensorData.humidity}%</div>
                            </div>
                        </div>
                    </div>


                </>
            );
        }

        // Digital sensor (simple on/off)
        if (sensorData.value !== undefined) {
            return (
                <div className="flex items-center justify-center p-6">
                    <div className="text-center">
                        <Gauge className={cn("w-12 h-12 mx-auto mb-2", sensorData.value ? "text-green-600" : "text-gray-400")} />
                        <div className="text-xl font-bold text-[var(--navbar)]">
                            {sensorData.value ? "ACTIVE" : "INACTIVE"}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">Digital Sensor</div>
                    </div>
                </div>
            );
        }

        // Unknown or error
        return (
            <div className="text-center text-gray-600 p-4">
                <p className="text-sm">No sensor data available</p>
                {sensorData.error && (
                    <p className="text-xs text-red-600 mt-2">{sensorData.error}</p>
                )}
            </div>
        );
    };

    return (
        <div className={cn("bg-[var(--card-bg)] rounded-xl p-6 border border-white/40 shadow-sm", className)}>
            <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
                <Activity className="text-[var(--navbar)]" />
                Sensor Data
            </h3>
            <div className="space-y-3">
                {renderSensorData()}
            </div>
        </div>
    );
};
