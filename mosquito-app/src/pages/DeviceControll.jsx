import React, { useEffect, useState } from 'react';
import { ControlPanel } from '../Components/Trap/ControlPanel';
import { CpuTempDisplay } from '../Components/Trap/CpuTempDisplay';
import AllLayout from '../Components/Layout/AllLayout';

const AIRecommendation = () => {
  const [trapData, setTrapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5002/api/traps/control/Colombo")
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data?.length > 0) {
          setTrapData(d.data[0]);
        }
        setLoading(false);
      })
      .catch(e => {
        setError("Could not load recommendation");
        setLoading(false);
      });
  }, []);

  const colorMap = {
    red: "bg-red-50 border-red-300 text-red-700",
    orange: "bg-orange-50 border-orange-300 text-orange-700",
    yellow: "bg-yellow-50 border-yellow-300 text-yellow-700",
    green: "bg-green-50 border-green-300 text-green-700",
    blue: "bg-blue-50 border-blue-300 text-blue-700",
  };

  if (loading) return (
    <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 mb-6 animate-pulse h-20" />
  );

  if (error || !trapData) return (
    <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-600 text-sm mb-6">
      ⚠ {error || "No recommendation available"}
    </div>
  );

  return (
    <div className={`p-4 rounded-xl border ${colorMap[trapData.statusColor] || colorMap.green} mb-6`}>
      <h3 className="font-bold text-sm uppercase tracking-wider mb-3">
        🤖 ML Prediction Based Trap Recommendation
      </h3>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-3xl font-black">{trapData.co2Level}% CO₂</p>
          <p className="text-sm font-semibold mt-1">{trapData.trapStatus}</p>
          <p className="text-xs mt-1 opacity-70">{trapData.recommendedAction}</p>
        </div>
        <div className="text-right text-xs space-y-1">
          <p>Dengue Risk: <strong>{trapData.dengueRisk}</strong></p>
          <p>District: <strong>{trapData.district}</strong></p>
          <p>Week: <strong>{trapData.weekNumber}</strong></p>
        </div>
      </div>
    </div>
  );
};

function DeviceControll() {
  return (
    <AllLayout title="Mosquito-Controller-System">
      <main className="min-h-screen p-4 md:p-8 bg-[var(--background)] relative overflow-auto">
        <div className="absolute inset-0 z-0 bg-transparent" />

        <div className="max-w-7xl mx-auto space-y-6">

          {/* Header */}
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-[var(--navbar)] tracking-tight">
                Mosquito Terminator
              </h1>
              <p className="text-[var(--foreground)] opacity-70 mt-1 font-medium">
                Advanced AI Insect Elimination System
              </p>
            </div>
            <div className="flex items-center gap-3 bg-[var(--navbar)] py-2 px-4 rounded-full border border-white/10 shadow-lg">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-sm font-medium text-white">System Online</span>
            </div>
          </header>

          {/* AI Recommendation */}
          <AIRecommendation />

          {/* Status Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            <div className="bg-[var(--card-bg)] p-6 rounded-xl border border-white/20 shadow-sm flex flex-col justify-center">
              <h2 className="text-xl font-bold text-[var(--foreground)] mb-4">System Status</h2>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Connection</span>
                <span className="text-emerald-600 font-bold">Active</span>
              </div>
            </div>
            <div className="h-full">
              <CpuTempDisplay className="w-full h-full min-h-[140px]" />
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col gap-6">
            <ControlPanel />
          </div>

          <footer className="text-center text-gray-600 text-xs py-8">
            Mosquito Terminator System v2.0 • Raspberry Pi 4 GPIO Control • Powered by YOLOv8
          </footer>

        </div>
      </main>
    </AllLayout>
  );
}

export default DeviceControll;