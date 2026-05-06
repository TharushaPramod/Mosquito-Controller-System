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
    <div className="h-20 p-4 mb-6 border border-gray-200 rounded-xl bg-gray-50 animate-pulse" />
  );

  if (error || !trapData) return (
    <div className="p-4 mb-6 text-sm text-red-600 border border-red-200 rounded-xl bg-red-50">
      ⚠ {error || "No recommendation available"}
    </div>
  );

  return (
    <div className={`p-4 rounded-xl border ${colorMap[trapData.statusColor] || colorMap.green} mb-6`}>
      <h3 className="mb-3 text-sm font-bold tracking-wider uppercase">
        🤖 ML Prediction Based Trap Recommendation
      </h3>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-3xl font-black">{trapData.co2Level}% CO₂</p>
          <p className="mt-1 text-sm font-semibold">{trapData.trapStatus}</p>
          <p className="mt-1 text-xs opacity-70">{trapData.recommendedAction}</p>
        </div>
        <div className="space-y-1 text-xs text-right">
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
        <div className="absolute inset-0 z-0 bg-transparent pointer-events-none" />

        <div className="mx-auto space-y-6 max-w-7xl">

          {/* Header */}
          <header className="flex flex-col justify-between gap-4 mb-8 md:flex-row md:items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-[var(--navbar)] tracking-tight">
                Mosquito Terminator
              </h1>
              <p className="text-[var(--foreground)] opacity-70 mt-1 font-medium">
                Advanced AI Insect Elimination System
              </p>
            </div>
            <div className="flex items-center gap-3 bg-[var(--navbar)] py-2 px-4 rounded-full border border-white/10 shadow-lg">
              <span className="relative flex w-3 h-3">
                <span className="absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping bg-emerald-400"></span>
                <span className="relative inline-flex w-3 h-3 rounded-full bg-emerald-500"></span>
              </span>
              <span className="text-sm font-medium text-white">System Online</span>
            </div>
          </header>

          {/* AI Recommendation */}
          <AIRecommendation />

          {/* Status Grid */}
          <div className="grid items-stretch grid-cols-1 gap-6 md:grid-cols-2">
            <div className="bg-[var(--card-bg)] p-6 rounded-xl border border-white/20 shadow-sm flex flex-col justify-center">
              <h2 className="text-xl font-bold text-[var(--foreground)] mb-4">System Status</h2>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Connection</span>
                <span className="font-bold text-emerald-600">Active</span>
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

          <footer className="py-8 text-xs text-center text-gray-600">
            Mosquito Terminator System v2.0 • Raspberry Pi 4 GPIO Control • Powered by YOLOv8
          </footer>

        </div>
      </main>
    </AllLayout>
  );
}

export default DeviceControll;