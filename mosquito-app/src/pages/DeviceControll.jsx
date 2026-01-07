
import React from 'react';
import { ControlPanel } from '../Components/Trap/ControlPanel';
import { CpuTempDisplay } from '../Components/Trap/CpuTempDisplay';
import { SensorDisplay } from '../Components/Trap/SensorDisplay';
import AllLayout from '../Components/Layout/AllLayout';

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
            <p className="text-[var(--foreground)] opacity-70 mt-1 font-medium">Advanced AI Insect Elimination System</p>
          </div>
          <div className="flex items-center gap-3 bg-[var(--navbar)] py-2 px-4 rounded-full border border-white/10 shadow-lg">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-sm font-medium text-white">System Online</span>
          </div>
        </header>

        {/* Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
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
          <div className="h-full">
            <SensorDisplay className="w-full h-full min-h-[140px]" />
          </div>
        </div>

        {/* Bottom Grid: Controls */}
        <div className="grid grid-cols-1">
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
