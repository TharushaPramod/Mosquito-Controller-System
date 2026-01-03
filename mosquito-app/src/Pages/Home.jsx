import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Activity, Cpu, Brain, ShieldCheck } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen font-sans bg-slate-50">
      
      {/* 1. HERO SECTION (Main Banner) */}
      <div className="pt-20 pb-24 text-white bg-gradient-to-r from-blue-900 to-blue-800">
        <div className="px-4 mx-auto text-center max-w-7xl sm:px-6 lg:px-8">
          <h1 className="mb-6 text-4xl font-extrabold tracking-tight md:text-6xl">
            Smart Vector Surveillance <br/> & Prediction System
          </h1>
          <p className="max-w-3xl mx-auto mb-10 text-xl text-blue-100">
            An AI-powered IoT solution to detect, classify, and predict mosquito density in real-time. 
            Designed to prevent Dengue & Malaria outbreaks using Deep Learning.
          </p>
          
          <div className="flex justify-center gap-4">
            <Link to="/dashboard" className="flex items-center gap-2 px-8 py-4 text-lg font-bold text-blue-900 transition-all transform bg-yellow-500 rounded-full shadow-lg hover:bg-yellow-400 hover:scale-105">
              Launch Dashboard <ArrowRight size={20}/>
            </Link>
            <Link to="/device" className="flex items-center gap-2 px-8 py-4 text-lg font-bold text-white transition-all bg-blue-700 rounded-full shadow-lg hover:bg-blue-600">
              Manage Device
            </Link>
          </div>
        </div>
      </div>

      {/* 2. FEATURES GRID */}
      <div className="px-4 mx-auto -mt-16 max-w-7xl sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          
          {/* Feature 1 */}
          <div className="p-8 bg-white border-b-4 border-blue-600 shadow-xl rounded-2xl">
            <div className="flex items-center justify-center mb-4 bg-blue-100 rounded-full w-14 h-14">
              <Cpu className="text-blue-600" size={32}/>
            </div>
            <h3 className="mb-2 text-xl font-bold text-slate-800">Edge Computing</h3>
            <p className="text-slate-600">
              Powered by Raspberry Pi. Image processing happens locally on the device for real-time responsiveness without internet latency.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-8 bg-white border-b-4 border-purple-600 shadow-xl rounded-2xl">
            <div className="flex items-center justify-center mb-4 bg-purple-100 rounded-full w-14 h-14">
              <Brain className="text-purple-600" size={32}/>
            </div>
            <h3 className="mb-2 text-xl font-bold text-slate-800">YOLOv8 AI Model</h3>
            <p className="text-slate-600">
              Advanced computer vision algorithm trained to identify Aedes, Culex, and Anopheles mosquitoes with high accuracy.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-8 bg-white border-b-4 border-green-600 shadow-xl rounded-2xl">
            <div className="flex items-center justify-center mb-4 bg-green-100 rounded-full w-14 h-14">
              <Activity className="text-green-600" size={32}/>
            </div>
            <h3 className="mb-2 text-xl font-bold text-slate-800">Predictive Analytics</h3>
            <p className="text-slate-600">
              Analyzes historical data patterns to forecast future mosquito density peaks and trigger early warning alerts.
            </p>
          </div>

        </div>
      </div>

      {/* 3. HOW IT WORKS SECTION */}
      <div className="py-20">
        <div className="px-4 mx-auto text-center max-w-7xl">
          <h2 className="mb-12 text-3xl font-bold text-slate-800">System Architecture</h2>
          <div className="grid grid-cols-1 gap-4 text-center md:grid-cols-4">
            
            <div className="p-4">
              <div className="mb-2 text-4xl font-black text-slate-200">01</div>
              <h4 className="text-lg font-bold text-slate-700">Image Capture</h4>
              <p className="text-sm text-slate-500">Camera captures live feed</p>
            </div>
             <div className="self-center hidden md:block text-slate-300">---------</div>
            <div className="p-4">
              <div className="mb-2 text-4xl font-black text-slate-200">02</div>
              <h4 className="text-lg font-bold text-slate-700">AI Processing</h4>
              <p className="text-sm text-slate-500">Pi detects & counts vectors</p>
            </div>
            <div className="self-center hidden md:block text-slate-300">---------</div>
            <div className="p-4">
              <div className="mb-2 text-4xl font-black text-slate-200">03</div>
              <h4 className="text-lg font-bold text-slate-700">Data Visualization</h4>
              <p className="text-sm text-slate-500">Dashboard updates instantly</p>
            </div>
             <div className="self-center hidden md:block text-slate-300">---------</div>
             <div className="p-4">
              <div className="mb-2 text-4xl font-black text-slate-200">04</div>
              <h4 className="text-lg font-bold text-slate-700">Risk Alert</h4>
              <p className="text-sm text-slate-500">System warns authorities</p>
            </div>

          </div>
        </div>
      </div>

      {/* 4. FOOTER */}
      <footer className="py-8 text-center bg-slate-900 text-slate-400">
        <p className="mb-2">Final Year Research Project | 2025</p>
        <p className="text-sm">Developed by <span className="font-bold text-white">Gihan & Nisadi</span></p>
      </footer>

    </div>
  );
};

export default Home;