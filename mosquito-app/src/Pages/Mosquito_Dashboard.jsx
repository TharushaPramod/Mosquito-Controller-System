import React, { useState, useEffect, useRef } from 'react';
import { ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Clock, AlertTriangle, Bug, TrendingUp, Zap, Activity, Calendar, BarChart3 } from 'lucide-react';

const Mosquito_Dashboard = () => {
  // --- STATE ---
  const [chartData, setChartData] = useState([]); 
  
  // KPI Stats
  const [currentMinuteStats, setCurrentMinuteStats] = useState({
    timeLabel: "--:--",
    aedes: 0, culex: 0, anopheles: 0, otherMosquitoes: 0, insects: 0,
    totalMosquitoes: 0, riskLevel: "WAITING",
  });

  // --- STORE STATIC PREDICTIONS (WONT CHANGE) ---
  // මේකෙන් තමයි Prediction එක හොලවන්නේ නැතුව තියාගන්නේ
  const predictionBaseline = useRef([]);

  // --- INIT: GENERATE FIXED PREDICTION ON LOAD ---
  useEffect(() => {
    const baseData = [];
    
    const getBasePrediction = (hour) => {
      if (hour >= 6 && hour <= 9) return 40 + Math.random() * 10;
      if (hour >= 17 && hour <= 20) return 60 + Math.random() * 15;
      if (hour >= 0 && hour <= 5) return 5 + Math.random() * 2;
      return 20 + Math.random() * 5;
    };

    for (let i = 0; i < 24; i++) {
      baseData.push({
        hourLabel: `${i}:00`,
        hourIndex: i,
        predicted: Math.floor(getBasePrediction(i)), // Fixed Value
        actual: null // Will fill this later
      });
    }
    
    // Store in Ref (Memory) so it never changes
    predictionBaseline.current = baseData;
    
    // Initial Render
    updateChartWithActuals();
  }, []);


  // --- HELPER: MERGE PREDICTION + ACTUALS ---
  const updateChartWithActuals = () => {
    const now = new Date();
    const currentHour = now.getHours();
    
    // Create a COPY of the static baseline
    const updatedData = predictionBaseline.current.map(item => {
      let actualVal = null;

      // Only generate actuals for Past and Current hours
      if (item.hourIndex <= currentHour) {
        // NOTE: In a real app, you would fetch this from DB.
        // For simulation, we create a consistent random number based on hour
        // so it doesn't jump wildly every second.
        const consistentRandom = Math.sin(item.hourIndex * 999) * 10; 
        actualVal = Math.floor(item.predicted + consistentRandom);
        if (actualVal < 0) actualVal = 0;
      }

      return {
        ...item, // Keep original predicted value
        actual: actualVal // Update only actual
      };
    });

    setChartData(updatedData);
  };


  // --- ENGINE 1: UPDATE ACTUALS (EVERY MINUTE) ---
  useEffect(() => {
    // Prediction වෙනස් කරන්නේ නෑ, Actual විතරක් Update කරනවා
    const interval = setInterval(updateChartWithActuals, 60000); 
    return () => clearInterval(interval);
  }, []);


  // --- ENGINE 2: KPI CARDS (LAST MINUTE) ---
  useEffect(() => {
    const updateMinuteTick = () => {
      const now = new Date();
      const timeLabel = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
      const newAedes = Math.floor(Math.random() * 3); 
      const newAnopheles = Math.floor(Math.random() * 2); 
      const newCulex = Math.floor(Math.random() * 5); 
      const newOtherMosq = Math.floor(Math.random() * 3); 
      const newInsects = Math.floor(Math.random() * 4); 
      const totalVectorCount = newAedes + newAnopheles + newCulex + newOtherMosq;

      setCurrentMinuteStats({
        timeLabel: timeLabel,
        aedes: newAedes, culex: newCulex, anopheles: newAnopheles, 
        otherMosquitoes: newOtherMosq, insects: newInsects, 
        totalMosquitoes: totalVectorCount,
        riskLevel: (newAedes > 1 || newAnopheles > 1) ? "HIGH" : "LOW"
      });
    };

    updateMinuteTick(); 
    const interval = setInterval(updateMinuteTick, 5000); 
    return () => clearInterval(interval);
  }, []);

  // Calculate Total for Badge
  const todayTotal = chartData.reduce((acc, item) => {
    return acc + (item.actual !== null ? item.actual : 0);
  }, 0);

  return (
    <div className="min-h-screen p-6 font-sans bg-slate-100 text-slate-800">
      
      {/* HEADER */}
      <header className="flex flex-col items-start justify-between pb-4 mb-6 border-b border-slate-300 md:flex-row md:items-end">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-bold text-slate-900">
            <Bug className="w-8 h-8 text-blue-700" /> Real-Time Vector Surveillance
          </h1>
          <p className="mt-2 text-sm text-slate-500">Minute-by-Minute Detection & Daily Forecasting System</p>
        </div>
        <div className="mt-4 text-right md:mt-0">
           <div className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-blue-900 rounded-lg shadow-md">
             <Calendar size={16}/> View: {new Date().toLocaleDateString()}
           </div>
        </div>
      </header>

      {/* KPI CARDS */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="flex items-center gap-2 text-xl font-bold text-slate-700">
            <Zap className="text-yellow-600"/> Last Minute Detection ({currentMinuteStats.timeLabel})
          </h2>
          <span className="px-3 py-1 text-xs font-bold text-blue-800 bg-blue-100 rounded-full">
            Total Count: {currentMinuteStats.totalMosquitoes}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5 md:grid-cols-3">
          <div className={`p-4 rounded-xl shadow border-t-4 bg-white ${currentMinuteStats.aedes > 0 ? 'border-red-600' : 'border-slate-300'}`}>
            <span className="text-[10px] font-bold uppercase text-slate-400">Dengue Risk</span>
            <h3 className="text-lg font-bold text-slate-700">Aedes</h3>
            <span className="block mt-1 text-3xl font-extrabold text-red-600">{currentMinuteStats.aedes}</span>
          </div>
          <div className={`p-4 rounded-xl shadow border-t-4 bg-white ${currentMinuteStats.anopheles > 0 ? 'border-orange-500' : 'border-slate-300'}`}>
            <span className="text-[10px] font-bold uppercase text-slate-400">Malaria Risk</span>
            <h3 className="text-lg font-bold text-slate-700">Anopheles</h3>
            <span className="block mt-1 text-3xl font-extrabold text-orange-600">{currentMinuteStats.anopheles}</span>
          </div>
          <div className="p-4 bg-white border-t-4 border-blue-500 shadow rounded-xl">
            <span className="text-[10px] font-bold uppercase text-slate-400">Nuisance</span>
            <h3 className="text-lg font-bold text-slate-700">Culex</h3>
            <span className="block mt-1 text-3xl font-extrabold text-blue-600">{currentMinuteStats.culex}</span>
          </div>
          <div className="p-4 bg-white border-t-4 shadow border-cyan-500 rounded-xl">
            <span className="text-[10px] font-bold uppercase text-slate-400">Non-Vector</span>
            <h3 className="text-lg font-bold text-slate-700">Other Mosq.</h3>
            <span className="block mt-1 text-3xl font-extrabold text-cyan-600">{currentMinuteStats.otherMosquitoes}</span>
          </div>
           <div className="p-4 bg-white border-t-4 border-gray-400 shadow rounded-xl">
            <span className="text-[10px] font-bold uppercase text-slate-400">Non-Target</span>
            <h3 className="text-lg font-bold text-slate-700">Insects</h3>
            <span className="block mt-1 text-3xl font-extrabold text-slate-600">{currentMinuteStats.insects}</span>
          </div>
        </div>
      </div>

      {/* GRAPH */}
      <div className="p-6 bg-white border shadow-sm rounded-xl border-slate-200">
        <div className="flex flex-col items-start justify-between mb-6 md:flex-row md:items-center">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-bold text-slate-700">
              <TrendingUp className="text-blue-600"/> 24-Hour Density Forecast
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Hourly comparison of <span className="font-bold text-purple-500">Predicted Baseline</span> vs <span className="font-bold text-blue-600">Actual Hourly Count</span>.
            </p>
          </div>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
             <div className="flex items-center gap-3 px-5 py-3 border border-blue-100 shadow-sm rounded-xl bg-blue-50">
                <div className="p-2 text-blue-600 bg-white rounded-full shadow-sm">
                  <BarChart3 size={24} />
                </div>
                <div className="text-right">
                   <p className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Total Accumulated (Today)</p>
                   <p className="text-3xl font-black leading-none text-slate-800">{todayTotal}</p>
                </div>
             </div>
          </div>
        </div>

        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="hourLabel" stroke="#64748b" fontSize={12} interval={2} />
              <YAxis stroke="#64748b" fontSize={12} label={{ value: 'Hourly Count', angle: -90, position: 'insideLeft' }}/>
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none' }} />
              <Legend verticalAlign="top" height={36}/>
              <ReferenceLine x={`${new Date().getHours()}:00`} stroke="red" strokeDasharray="3 3" label="NOW" />
              <Line type="monotone" dataKey="predicted" stroke="#a855f7" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Baseline Prediction" />
              <Line type="monotone" dataKey="actual" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Actual Hourly Count" connectNulls={false} />
              <Area type="monotone" dataKey="actual" fill="#3b82f6" fillOpacity={0.1} stroke="none" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Mosquito_Dashboard;


