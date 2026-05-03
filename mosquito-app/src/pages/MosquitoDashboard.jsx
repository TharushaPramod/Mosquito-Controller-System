import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebase'; 
import { ref, onValue } from "firebase/database";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import AllLayout from '../Components/Layout/AllLayout';

const MosquitoDashboard = () => {
  const [todayHourlyData, setTodayHourlyData] = useState([]); // Graph එකට (අද දවස)
  const [tableHourlyData, setTableHourlyData] = useState([]); // Table එකට (තෝරපු දවස)
  const [currentMetrics, setCurrentMetrics] = useState({ aedes: 0, anopheles: 0, culex: 0, other: 0, insects: 0 });
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Date Filter State (Table එකට විතරයි)
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });

  const lastAlertHour = useRef(null);

  useEffect(() => {
    const detectionsRef = ref(db, 'detections');

    onValue(detectionsRef, (snapshot) => {
      const data = snapshot.val();
      
      if (data) {
        const rawList = Object.values(data);
        const now = new Date();
        const currentHour = now.getHours();
        
        // අද දවස
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const todayDate = `${year}-${month}-${day}`; 

        // =========================================================
        // 1. අද දවසේ Data (KPIs සහ Graph එක සඳහා පමණි - ALWAYS REALTIME)
        // =========================================================
        const todayMap = {};
        for (let i = 0; i < 24; i++) {
          todayMap[i] = { 
            hour: i, 
            displayTime: `${i.toString().padStart(2, '0')}:00`,
            aedes: 0, anopheles: 0, culex: 0, other: 0, insects: 0, 
            total_actual: 0, predicted: 0 
          };
        }

        const todayDetections = rawList.filter(item => item && item.date === todayDate);
        todayDetections.forEach(item => {
          const h = item.hour;
          const speciesKey = item.species ? item.species.toLowerCase() : 'other'; 
          
          if (todayMap[h]) {
            if (todayMap[h].hasOwnProperty(speciesKey)) todayMap[h][speciesKey]++;
            else todayMap[h].other++;
            todayMap[h].total_actual++;
          }
        });

        const pastDataForToday = rawList.filter(item => item && item.date && item.date !== todayDate);
        const uniquePastDaysForToday = [...new Set(pastDataForToday.map(item => item.date))].length || 1;

        for (let i = 0; i < 24; i++) {
          const pastHourCount = pastDataForToday.filter(item => item.hour === i).length;
          todayMap[i].predicted = Math.round(pastHourCount / uniquePastDaysForToday);
        }

        // උඩ තියෙන KPI සහ Graph එක අද දවසට update කිරීම
        setTodayHourlyData(Object.values(todayMap)); 
        setCurrentMetrics(todayMap[currentHour]); 

        // Alert System එක දුවන්නෙත් අද දවසට විතරයි
        if (todayMap[currentHour].aedes >= 2 && lastAlertHour.current !== currentHour) {
          triggerAlert(currentHour, todayMap[currentHour].aedes);
          lastAlertHour.current = currentHour;
        }

        // =========================================================
        // 2. තෝරපු දවසේ Data (Table එක සඳහා පමණි)
        // =========================================================
        const tableMap = {};
        for (let i = 0; i < 24; i++) {
          tableMap[i] = { 
            hour: i, 
            displayTime: `${i.toString().padStart(2, '0')}:00`,
            aedes: 0, anopheles: 0, culex: 0, other: 0, insects: 0, 
            total_actual: 0, predicted: 0 
          };
        }

        const selectedDateDetections = rawList.filter(item => item && item.date === selectedDate);
        selectedDateDetections.forEach(item => {
          const h = item.hour;
          const speciesKey = item.species ? item.species.toLowerCase() : 'other'; 
          
          if (tableMap[h]) {
            if (tableMap[h].hasOwnProperty(speciesKey)) tableMap[h][speciesKey]++;
            else tableMap[h].other++;
            tableMap[h].total_actual++;
          }
        });

        const pastDataForTable = rawList.filter(item => item && item.date && item.date !== selectedDate);
        const uniquePastDaysForTable = [...new Set(pastDataForTable.map(item => item.date))].length || 1;

        for (let i = 0; i < 24; i++) {
          const pastHourCount = pastDataForTable.filter(item => item.hour === i).length;
          tableMap[i].predicted = Math.round(pastHourCount / uniquePastDaysForTable);
        }

        // Table එක තෝරපු දවසට update කිරීම
        setTableHourlyData(Object.values(tableMap)); 

      } else {
         setTodayHourlyData([]);
         setTableHourlyData([]);
         setCurrentMetrics({ aedes: 0, anopheles: 0, culex: 0, other: 0, insects: 0 });
      }
    }, (error) => {
        console.error("Firebase read error:", error);
    });
  }, [selectedDate]); // selectedDate වෙනස් වුනාම Table එක වෙනස් වෙයි, හැබැයි onValue එකෙන් live data ආවාමත් ඔක්කොම update වෙනවා.

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
    const next = `${((parseInt(hour) + 1) % 24).toString().padStart(2, '0')}:00`;
    return `${start} - ${next}`;
  };

  const StatCard = ({ title, count, color }) => (
    <div className={`bg-white p-5 rounded-xl shadow border-l-4 ${color} flex flex-col justify-between h-full`}>
       <h3 className="text-xs font-bold tracking-wider text-gray-500 uppercase">{title}</h3>
       <div className="mt-3">
          <p className={`text-5xl font-bold ${color.replace('border-', 'text-')}`}>{count}</p>
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
              {/* මේක හැමතිස්සෙම අද දවසේ දැන් දුවන පැය පෙන්නනවා */}
              CURRENT PERIOD: <span className="text-blue-600">{getTimeRange(new Date().getHours())}</span>
            </div>
            
            {/* Notification Bell */}
            <div className="relative cursor-pointer" onClick={(e) => { e.stopPropagation(); setShowDropdown(!showDropdown); if(!showDropdown) setUnreadCount(0); }}>
                <div className={`p-2 rounded-full shadow ${unreadCount > 0 ? 'bg-red-50 ring-2 ring-red-100 animate-pulse' : 'bg-white'}`}>
                    <span className={unreadCount > 0 ? 'text-red-600' : 'text-gray-600'}>🔔</span>
                </div>
                {/* Dropdown menu */}
                {showDropdown && (
                  <div className="absolute right-0 z-50 w-64 mt-2 bg-white border border-gray-200 rounded-md shadow-lg top-full">
                    <div className="px-4 py-2 font-bold text-gray-700 border-b bg-gray-50">Notifications</div>
                    <div className="overflow-y-auto max-h-64">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-sm text-center text-gray-500">No new alerts</div>
                      ) : (
                        notifications.map(alert => (
                          <div key={alert.id} className="p-3 border-b hover:bg-gray-50">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-bold text-red-600">{alert.title}</span>
                              <span className="text-xs text-gray-400">{alert.time}</span>
                            </div>
                            <p className="text-xs text-gray-600">{alert.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
            </div>
          </div>
        </header>

        {/* --- KPI Cards (ALWAYS REALTIME TODAY) --- */}
        <div className="grid grid-cols-2 gap-4 mb-6 md:grid-cols-5">
          <StatCard title="Aedes (Dengue)" count={currentMetrics.aedes} color="border-red-500" />
          <StatCard title="Anopheles (Malaria)" count={currentMetrics.anopheles} color="border-orange-500" />
          <StatCard title="Culex (Nuisance)" count={currentMetrics.culex} color="border-blue-500" />
          <StatCard title="Other Mosquitoes" count={currentMetrics.other} color="border-gray-500" />
          <StatCard title="Non-Mosquitoes (Non-Target)" count={currentMetrics.insects} color="border-green-500" />
        </div>

        {/* --- Chart (ALWAYS REALTIME TODAY) --- */}
        <div className="p-6 mb-6 bg-white shadow rounded-xl">
          <h3 className="mb-4 text-lg font-bold text-gray-800">📈 Prediction vs Actual (Today's Real-time)</h3>
          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              {/* Graph එකට දෙන්නේ todayHourlyData එක */}
              <LineChart data={todayHourlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="displayTime" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="predicted" stroke="#8884d8" name="Expected (Historical Avg)" strokeDasharray="5 5" dot={false} />
                <Line type="monotone" dataKey="total_actual" stroke="#0088FE" name="Actual Detections" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* --- Table (Date Filtered) --- */}
        <div className="p-6 bg-white shadow rounded-xl">
          <div className="flex flex-col items-center justify-between mb-4 md:flex-row">
            <h3 className="text-lg font-bold text-gray-800">📋 Hourly Classification ({selectedDate})</h3>
            
            {/* Date Filter */}
            <div className="flex items-center gap-3 mt-4 md:mt-0">
              <label htmlFor="dateFilter" className="text-sm font-medium text-gray-600">
                Check History:
              </label>
              <input 
                type="date" 
                id="dateFilter"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={
                  new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000)
                    .toISOString()
                    .split('T')[0]
                }
                className="px-3 py-2 text-sm text-gray-700 border border-gray-300 rounded-md shadow-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button 
                onClick={() => {
                  const now = new Date();
                  const year = now.getFullYear();
                  const month = String(now.getMonth() + 1).padStart(2, '0');
                  const day = String(now.getDate()).padStart(2, '0');
                  setSelectedDate(`${year}-${month}-${day}`);
                }}
                className="px-3 py-2 text-sm font-medium text-blue-600 transition-colors rounded-md bg-blue-50 hover:bg-blue-100"
              >
                Today
              </button>
            </div>
          </div>

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
                {/* Table එකට දෙන්නේ tableHourlyData එක */}
                {tableHourlyData.length > 0 && tableHourlyData.some(row => row.total_actual > 0) ? (
                  tableHourlyData.map((row) => (
                    <tr key={row.hour} className={row.aedes >= 2 ? 'bg-red-50' : 'hover:bg-gray-50'}>
                      <td className="px-4 py-3 font-medium">{getTimeRange(row.hour)}</td>
                      <td className="px-4 py-3 text-center text-gray-400">{row.predicted}</td>
                      <td className="px-4 py-3 font-bold text-center bg-blue-50">{row.total_actual}</td>
                      <td className={`px-4 py-3 text-center ${row.aedes >= 2 ? 'text-red-700 font-bold' : 'text-gray-700'}`}>{row.aedes}</td>
                      <td className="px-4 py-3 text-center">{row.anopheles}</td>
                      <td className="px-4 py-3 text-center">{row.culex}</td>
                      <td className="px-4 py-3 text-center">{row.other}</td>
                      <td className="px-4 py-3 text-center border-l">{row.insects}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                      No detections recorded for {selectedDate}.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </AllLayout>
  );
};

export default MosquitoDashboard;