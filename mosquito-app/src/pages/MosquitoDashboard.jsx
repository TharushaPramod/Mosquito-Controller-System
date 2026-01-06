import React, { useState, useEffect, useRef } from 'react';
import { database } from '../firebase'; 
import { ref, onValue } from "firebase/database";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import AllLayout from '../Components/Layout/AllLayout';

const MosquitoDashboard = () => {
  const [liveData, setLiveData] = useState(null);
  const [hourlyData, setHourlyData] = useState([]);
  
  // --- 🔔 Notification States ---
  const [notifications, setNotifications] = useState([]); 
  const [showDropdown, setShowDropdown] = useState(false); 
  const [unreadCount, setUnreadCount] = useState(0); 
  
  const lastAlertHour = useRef(null);

  // --- 1. DATA FETCHING EFFECT ---
  useEffect(() => {
    const dbRef = ref(database, '/');
    
    onValue(dbRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Live Data Set
        if (data.live) {
            setLiveData(data.live);
        }

        // Hourly Data Process & Set
        if (data.hourly) {
          const formattedData = Object.keys(data.hourly).map(key => ({
            id: key,
            ...data.hourly[key]
          }));
          formattedData.sort((a, b) => a.id.localeCompare(b.id));
          setHourlyData(formattedData);
        }
      }
    });
  }, []);

  // --- 2. 🔥 ALERT CHECKING EFFECT (Separated Logic) ---
  // මේක රන් වෙන්නේ liveData හෝ hourlyData වෙනස් වුනොත් විතරයි
  useEffect(() => {
    if (!liveData || hourlyData.length === 0) return;

    // 1. දැනට දුවන පැය ගන්නවා (Live Time එකෙන්)
    const currentHourStr = liveData.timestamp.split(':')[0]; // "10"

    // 2. Hourly Data එකෙන් ඒ පැයේ විස්තරය හොයාගන්නවා
    const currentHourStats = hourlyData.find(item => item.id === currentHourStr);

    if (currentHourStats) {
        const aedesCount = currentHourStats.aedes;

        // 3. Condition Check: >= 2 ද? සහ කලින් Alert යැව්වේ නැද්ද?
        if (aedesCount >= 2 && lastAlertHour.current !== currentHourStr) {
            
            // Alert Sound Play කරන්න (Optional - ඕන නම් විතරක් තියාගන්න)
            // const audio = new Audio('/alert.mp3'); 
            // audio.play().catch(e => console.log(e));

            const newAlert = {
                id: Date.now(),
                time: liveData.timestamp,
                title: "Dengue Risk Alert!",
                message: `Critical Aedes count detected: ${aedesCount}`,
                type: "critical"
            };

            setNotifications(prev => [newAlert, ...prev]);
            setUnreadCount(prev => prev + 1);
            
            // මේ පැයේ ආයේ Alert එවන්න එපා කියලා ලොක් කරනවා
            lastAlertHour.current = currentHourStr;
            
            console.log("🚨 ALERT TRIGGERED: ", aedesCount); // Console එකෙත් බලන්න පුලුවන්
        }
    }
  }, [liveData, hourlyData]); // Data වෙනස් වෙන හැම වෙලේම මේක දුවනවා

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
    if (!showDropdown) {
        setUnreadCount(0); 
    }
  };

  const getTimeRange = (timeStr, durationMinutes = 60) => {
    if (!timeStr) return "--";
    let [hourStr] = timeStr.toString().split(':'); 
    let hour = parseInt(hourStr);
    const startTime = `${hour.toString().padStart(2, '0')}:00`;
    const nextHour = (hour + 1) % 24;
    const endTime = `${nextHour.toString().padStart(2, '0')}:00`;
    return `${startTime} - ${endTime}`;
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
     <AllLayout title="">
    <div className="relative min-h-screen p-6 font-sans bg-gray-50" onClick={() => showDropdown && setShowDropdown(false)}>
      
      <header className="relative flex items-center justify-between pb-4 mb-6 border-b">
        <div>
            <h1 className="text-3xl font-bold text-gray-900">🦟 Smart Mosquito Trap</h1>
            <p className="mt-1 text-sm text-gray-500">Real-time Classification & Forecasting System</p>
        </div>

        <div className="flex items-center gap-4">
            <div className="hidden px-4 py-2 text-sm font-bold text-gray-700 bg-white rounded shadow md:block">
                CURRENT PERIOD: <span className="text-blue-600">
                  {getTimeRange(liveData?.timestamp, 60)}
                </span>
            </div>

            {/* --- BELL ICON --- */}
            <div className="relative cursor-pointer" onClick={(e) => {
                e.stopPropagation(); 
                toggleDropdown();
            }}>
                <div className={`p-2 transition rounded-full shadow hover:bg-gray-100 ${unreadCount > 0 ? 'bg-red-50 ring-2 ring-red-100' : 'bg-white'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${unreadCount > 0 ? 'text-red-600' : 'text-gray-600'}`}>
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                    </svg>
                    
                    {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                            {unreadCount}
                        </span>
                    )}
                </div>

                {/* --- DROPDOWN --- */}
                {showDropdown && (
                    <div className="absolute right-0 z-50 mt-3 overflow-hidden bg-white border border-gray-100 shadow-2xl w-80 rounded-xl">
                        <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
                            <h3 className="font-bold text-gray-700">Notifications</h3>
                            <span className="text-xs text-gray-400">Recent Alerts</span>
                        </div>
                        <div className="overflow-y-auto max-h-64">
                            {notifications.length === 0 ? (
                                <div className="p-6 text-sm text-center text-gray-400">
                                    No new alerts. System is safe.
                                </div>
                            ) : (
                                notifications.map((note) => (
                                    <div key={note.id} className="flex gap-3 px-4 py-3 transition-colors border-b hover:bg-red-50">
                                        <div className="mt-1">
                                            <span className="text-xl">⚠️</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-800">{note.title}</p>
                                            <p className="mt-1 text-xs text-gray-600">{note.message}</p>
                                            <p className="text-[10px] text-gray-400 mt-2 text-right">{note.time}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        {notifications.length > 0 && (
                            <div className="px-4 py-2 text-center border-t bg-gray-50">
                                <button 
                                    onClick={() => setNotifications([])} 
                                    className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                                >
                                    Clear All
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
      </header>
      
      {/* --- CARDS --- */}
      <div className="grid grid-cols-2 gap-4 mb-6 md:grid-cols-5">
        <StatCard title="Aedes (Dengue)" count={liveData?.aedes} color="border-red-500" />
        <StatCard title="Anopheles (Malaria)" count={liveData?.anopheles} color="border-orange-500" />
        <StatCard title="Culex (Nuisance)" count={liveData?.culex} color="border-blue-500" />
        <StatCard title="Other Mosquitoes" count={liveData?.other} color="border-gray-500" />
        <StatCard title="Insects (Non-Target)" count={liveData?.insects} color="border-green-500" />
      </div>

      {/* --- GRAPH --- */}
      <div className="p-6 mb-6 bg-white shadow rounded-xl">
        <h3 className="mb-4 text-lg font-bold text-gray-800">📈 Prediction vs Actual</h3>
        <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="time" tick={{fontSize: 12}} />
                    <YAxis />
                    <Tooltip contentStyle={{borderRadius: '8px'}} />
                    <Legend />
                    <Line type="monotone" dataKey="predicted" stroke="#8884d8" strokeWidth={2} strokeDasharray="5 5" name="Expected" dot={false} />
                    <Line type="monotone" dataKey="total_actual" stroke="#0088FE" strokeWidth={3} name="Actual" activeDot={{ r: 8 }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
      </div>

      {/* --- TABLE --- */}
      <div className="p-6 bg-white shadow rounded-xl">
        <h3 className="mb-4 text-lg font-bold text-gray-800">📋 Hourly Classification</h3>
        <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left whitespace-nowrap">
                <thead className="font-semibold tracking-wider text-gray-500 uppercase border-b-2 border-gray-100 bg-gray-50">
                    <tr>
                        <th className="px-4 py-3">Time</th>
                        <th className="px-4 py-3 text-center">Pred</th>
                        <th className="px-4 py-3 text-center text-blue-700 bg-blue-50">Total</th>
                        <th className="px-4 py-3 text-center text-red-600">Aedes</th>
                        <th className="px-4 py-3 text-center text-orange-600">Anopheles</th>
                        <th className="px-4 py-3 text-center text-blue-600">Culex</th>
                        <th className="px-4 py-3 text-center text-gray-600">Other</th>
                        <th className="px-4 py-3 text-center text-green-600 border-l">Insects</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {hourlyData.map((row) => (
                        <tr key={row.id} className={`transition-colors ${row.aedes >= 2 ? 'bg-red-50' : 'hover:bg-gray-50'}`}>
                            <td className="px-4 py-3 font-medium text-gray-900">{getTimeRange(row.time, 60)}</td>
                            <td className="px-4 py-3 font-mono text-center text-gray-400">{row.predicted}</td>
                            <td className="px-4 py-3 font-bold text-center text-blue-700 bg-blue-50">{row.total_actual}</td>
                            
                            {/* Alert එක 2 හෝ ඊට වැඩි නම් රතු වෙනවා */}
                            <td className={`px-4 py-3 text-center font-medium ${row.aedes >= 2 ? 'text-red-700 font-bold' : 'text-red-600'}`}>{row.aedes}</td>
                            
                            <td className="px-4 py-3 font-medium text-center text-orange-600">{row.anopheles}</td>
                            <td className="px-4 py-3 font-medium text-center text-blue-600">{row.culex}</td>
                            <td className="px-4 py-3 font-medium text-center text-gray-600">{row.other}</td>
                            <td className="px-4 py-3 text-center text-green-600 border-l">{row.insects}</td>
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