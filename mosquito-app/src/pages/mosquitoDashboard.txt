import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebase'; // database initialize karapu nama danna
import { ref, onValue } from "firebase/database";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import AllLayout from '../Components/Layout/AllLayout';

const MosquitoDashboard = () => {
  const [hourlyData, setHourlyData] = useState([]);
  const [currentMetrics, setCurrentMetrics] = useState({ aedes: 0, anopheles: 0, culex: 0, other: 0, insects: 0 });
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const lastAlertHour = useRef(null);

  useEffect(() => {
    // 1. Reference to the 'detections' node in Firebase
    const detectionsRef = ref(db, 'detections');

    onValue(detectionsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const rawList = Object.values(data);
        const now = new Date();
        const currentHour = now.getHours();
        const today = now.toISOString().split('T')[0];

        // 2. INITIALIZE 24-HOUR MAP FOR AGGREGATION
        const hourlyMap = {};
        for (let i = 0; i < 24; i++) {
          hourlyMap[i] = { 
            hour: i, 
            displayTime: `${i.toString().padStart(2, '0')}:00`,
            aedes: 0, anopheles: 0, culex: 0, other: 0, insects: 0, 
            total_actual: 0, predicted: 0 
          };
        }

        // 3. PROCESS ACTUAL DATA (Filter for Today)
        const todayDetections = rawList.filter(item => item.date === today);
        todayDetections.forEach(item => {
          const h = item.hour;
          const speciesKey = item.species.toLowerCase(); // aedes, culex, etc.
          
          if (hourlyMap[h]) {
            // Species count increment
            if (hourlyMap[h].hasOwnProperty(speciesKey)) {
              hourlyMap[h][speciesKey]++;
            } else {
              hourlyMap[h].other++;
            }
            hourlyMap[h].total_actual++;
          }
        });

        // 4. PREDICTION LOGIC (Historical Average)
        // Filter out today's data to calculate averages from the past
        const pastData = rawList.filter(item => item.date !== today);
        const uniquePastDays = [...new Set(pastData.map(item => item.date))].length || 1;

        for (let i = 0; i < 24; i++) {
          const pastHourCount = pastData.filter(item => item.hour === i).length;
          // Prediction = Total past count for this hour / number of days
          hourlyMap[i].predicted = Math.round(pastHourCount / uniquePastDays);
        }

        const formattedHourly = Object.values(hourlyMap);
        setHourlyData(formattedHourly);

        // 5. UPDATE LIVE KPI CARDS (Only for the Current Hour)
        setCurrentMetrics(hourlyMap[currentHour]);

        // 6. DENGUE RISK ALERT SYSTEM
        if (hourlyMap[currentHour].aedes >= 2 && lastAlertHour.current !== currentHour) {
          triggerAlert(currentHour, hourlyMap[currentHour].aedes);
          lastAlertHour.current = currentHour;
        }
      }
    });
  }, []);

  const triggerAlert = (hour, count) => {
    const newAlert = {
      id: Date.now(),
      time: `${hour}:00`,
      title: "Dengue Risk Alert!",
      message: `Critical Aedes count (${count}) detected in the current period.`,
      type: "critical"
    };
    setNotifications(prev => [newAlert, ...prev]);
    setUnreadCount(prev => prev + 1);
  };

  const getTimeRange = (hour) => {
    if (hour === undefined) return "--:--";
    const start = `${hour.toString().padStart(2, '0')}:00`;
    const next = `${((hour + 1) % 24).toString().padStart(2, '0')}:00`;
    return `${start} - ${next}`;
  };

  const StatCard = ({ title, count, color }) => (
    <div className={`bg-white p-5 rounded-xl shadow border-l-4 ${color} flex flex-col justify-between h-full`}>
       <h3 className="text-xs font-bold tracking-wider text-gray-500 uppercase">{title}</h3>
       <div className="mt-3">
          <p className={`text-5xl font-bold ${color.replace('border-', 'text-')}`}>{count || 0}</p>
       </div>
    </div>
  );

  return (
    <AllLayout title="Mosquito-Controller-System">
      <div className="relative min-h-screen p-6 font-sans bg-gray-50" onClick={() => showDropdown && setShowDropdown(false)}>
        
        <header className="flex items-center justify-between pb-4 mb-6 border-b">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mosquito Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">Real-time Classification & Forecasting System</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden px-4 py-2 text-sm font-bold text-gray-700 bg-white rounded shadow md:block">
              CURRENT PERIOD: <span className="text-blue-600">{getTimeRange(currentMetrics.hour)}</span>
            </div>
            
            {/* Notification Bell (Same logic as your original code) */}
            <div className="relative cursor-pointer" onClick={(e) => { e.stopPropagation(); setShowDropdown(!showDropdown); if(!showDropdown) setUnreadCount(0); }}>
                <div className={`p-2 rounded-full shadow ${unreadCount > 0 ? 'bg-red-50 ring-2 ring-red-100 animate-pulse' : 'bg-white'}`}>
                    <span className={unreadCount > 0 ? 'text-red-600' : 'text-gray-600'}>🔔</span>
                </div>
                {/* Notification Dropdown rendering logic... */}
            </div>
          </div>
        </header>
        
        {/* --- KPI Cards --- */}
        <div className="grid grid-cols-2 gap-4 mb-6 md:grid-cols-5">
          <StatCard title="Aedes (Dengue)" count={currentMetrics.aedes} color="border-red-500" />
          <StatCard title="Anopheles (Malaria)" count={currentMetrics.anopheles} color="border-orange-500" />
          <StatCard title="Culex (Nuisance)" count={currentMetrics.culex} color="border-blue-500" />
          <StatCard title="Other Mosquitoes" count={currentMetrics.other} color="border-gray-500" />
          <StatCard title="Non-Mosquitoes (Non-Target)" count={currentMetrics.insects} color="border-green-500" />
        </div>

        {/* --- Chart --- */}
        <div className="p-6 mb-6 bg-white shadow rounded-xl">
          <h3 className="mb-4 text-lg font-bold text-gray-800">📈 Prediction vs Actual</h3>
          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="displayTime" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="predicted" stroke="#8884d8" name="Expected (7-Day Avg)" strokeDasharray="5 5" dot={false} />
                <Line type="monotone" dataKey="total_actual" stroke="#0088FE" name="Actual Detections" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* --- Table --- */}
        <div className="p-6 bg-white shadow rounded-xl">
          <h3 className="mb-4 text-lg font-bold text-gray-800">📋 Hourly Classification</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
              <thead className="text-xs font-bold text-gray-500 uppercase bg-gray-50">
                <tr>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3 text-center">Pred</th>
                  <th className="px-4 py-3 text-center bg-blue-50">Total</th>
                  <th className="px-4 py-3 text-center">Aedes</th>
                  <th className="px-4 py-3 text-center">Anopheles</th>
                  <th className="px-4 py-3 text-center">Culex</th>
                  <th className="px-4 py-3 text-center">Other</th>
                  <th className="px-4 py-3 text-center border-l">Insects</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {hourlyData.map((row) => (
                  <tr key={row.hour} className={row.aedes >= 2 ? 'bg-red-50' : 'hover:bg-gray-50'}>
                    <td className="px-4 py-3 font-medium">{getTimeRange(row.hour)}</td>
                    <td className="px-4 py-3 text-center text-gray-400">{row.predicted}</td>
                    <td className="px-4 py-3 font-bold text-center bg-blue-50">{row.total_actual}</td>
                    <td className={`px-4 py-3 text-center ${row.aedes >= 2 ? 'text-red-700 font-bold' : 'text-red-600'}`}>{row.aedes}</td>
                    <td className="px-4 py-3 text-center">{row.anopheles}</td>
                    <td className="px-4 py-3 text-center">{row.culex}</td>
                    <td className="px-4 py-3 text-center">{row.other}</td>
                    <td className="px-4 py-3 text-center border-l">{row.insects}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </AllLayout>
  );
};

export default MosquitoDashboard;