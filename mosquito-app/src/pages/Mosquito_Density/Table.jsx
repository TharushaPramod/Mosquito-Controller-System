import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Mosquito_Density/Navbar';
import AllLayout from '../../Components/Layout/AllLayout';


export const Table = () => {
  const [kelaniyaData, setKelaniyaData] = useState([]);
  const [negomboData, setNegomboData] = useState([]);
  const [cumYear, setCumYear] = useState("2023");
  const [cumLoading, setCumLoading] = useState(true);

  // ================= Prediction Data =================
  const [kelaniyaPred, setKelaniyaPred] = useState([]);
  const [negomboPred, setNegomboPred] = useState([]);
  const [predYear, setPredYear] = useState("2026");
  const [predLoading, setPredLoading] = useState(true);

  // ================= Weather Data =================
  const [kelaniyaWeather, setKelaniyaWeather] = useState([]);
  const [negomboWeather, setNegomboWeather] = useState([]);
  const [weatherYear, setWeatherYear] = useState("2023");
  const [weatherLoading, setWeatherLoading] = useState(true);

  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  // ================= Fetch Cumulative =================
  useEffect(() => {
    const fetchCumulative = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/users/get");
        const data = await res.json();

        const kelData = data.data.filter(d => d.location === "Kelaniya")
          .sort((a,b) => a.year===b.year ? a.month-b.month : a.year-b.year);
        const negData = data.data.filter(d => d.location === "Negombo")
          .sort((a,b) => a.year===b.year ? a.month-b.month : a.year-b.year);

        setKelaniyaData(kelData);
        setNegomboData(negData);
      } catch(err) {
        console.error("Error fetching cumulative data:", err);
      } finally {
        setCumLoading(false);
      }
    };
    fetchCumulative();
  }, []);

  // ================= Fetch Predictions =================
  useEffect(() => {
    const fetchPrediction = async () => {
      try {
        const kelRes = await fetch("http://localhost:5000/api/predict/Kelaniya");
        const kelData = await kelRes.json();
        const negRes = await fetch("http://localhost:5000/api/predict/Negombo");
        const negData = await negRes.json();

        setKelaniyaPred(formatPrediction(kelData.predictions, 2026));
        setNegomboPred(formatPrediction(negData.predictions, 2026));
      } catch(err) {
        console.error("Error fetching prediction data:", err);
      } finally {
        setPredLoading(false);
      }
    };
    fetchPrediction();
  }, []);

  // ================= Fetch Weather =================
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/users/getWeather");
        const data = await res.json();

        const kelWeather = data.data.filter(d => d.location === "Kelaniya")
          .sort((a,b) => a.year===b.year ? a.month-b.month : a.year-b.year);
        const negWeather = data.data.filter(d => d.location === "Negombo")
          .sort((a,b) => a.year===b.year ? a.month-b.month : a.year-b.year);

        setKelaniyaWeather(kelWeather);
        setNegomboWeather(negWeather);
      } catch(err) {
        console.error("Error fetching weather data:", err);
      } finally {
        setWeatherLoading(false);
      }
    };
    fetchWeather();
  }, []);

  const formatPrediction = (predictions, startYear) => {
    let year = startYear;
    let month = 0;
    return predictions.map(value => {
      const obj = { year, month: months[month], prediction: Math.round(value) };
      month++;
      if(month>11){month=0; year++;}
      return obj;
    });
  };

  // ================= Filtered Data =================
  const filteredKelaniyaCum = kelaniyaData.filter(d => d.year.toString()===cumYear);
  const filteredNegomboCum = negomboData.filter(d => d.year.toString()===cumYear);
  const filteredKelaniyaPred = kelaniyaPred.filter(d => d.year.toString()===predYear);
  const filteredNegomboPred = negomboPred.filter(d => d.year.toString()===predYear);
  const filteredKelaniyaWeather = kelaniyaWeather.filter(d => d.year.toString()===weatherYear);
  const filteredNegomboWeather = negomboWeather.filter(d => d.year.toString()===weatherYear);

  const tableClass = "w-full border border-gray-200 text-sm rounded-lg overflow-hidden shadow-sm";
  const thClass = "bg-gray-50 text-gray-600 px-3 py-2 text-left uppercase tracking-wide text-xs";
  const tdClass = "px-3 py-2 text-gray-700 text-center";
    return (
        <>
        <AllLayout >
            <Navbar />
          <div className="min-h-screen p-8 space-y-10 bg-gray-100">

      {/* ================= CUMULATIVE ================= */}
      <div>
        <h1 className="mb-6 text-2xl font-bold text-center text-gray-800 md:text-3xl">
          Actual Cumulative Mosquito Data ({cumYear})
        </h1>
        <div className="flex justify-center mb-6">
          <label className="mr-4 font-semibold text-gray-700">Select Year:</label>
          <select value={cumYear} onChange={e=>setCumYear(e.target.value)} className="px-3 py-1 border border-gray-300 rounded-lg shadow-sm">
            <option value="2023">2023</option>
            <option value="2024">2024</option>
            <option value="2025">2025</option>
          </select>
        </div>
        {cumLoading ? <div className="p-10 text-center text-gray-600">Loading cumulative data...</div> :
        <div className="grid gap-6 md:grid-cols-2">
          {/* Kelaniya */}
          <div className="p-4 bg-white rounded-lg shadow">
            <h2 className="mb-3 text-lg font-semibold text-blue-600">Kelaniya</h2>
            <table className={tableClass}>
              <thead>
                <tr>
                  <th className={thClass}>Year</th>
                  <th className={thClass}>Month</th>
                  <th className={thClass}>Cumulative</th>
                </tr>
              </thead>
              <tbody>
                {filteredKelaniyaCum.map((item, idx)=>(
                  <tr key={idx} className={idx%2===0?"bg-gray-50":"bg-white"}>
                    <td className={tdClass}>{item.year}</td>
                    <td className={tdClass}>{months[item.month-1]}</td>
                    <td className={tdClass}>{item.cumulative}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Negombo */}
          <div className="p-4 bg-white rounded-lg shadow">
            <h2 className="mb-3 text-lg font-semibold text-green-600">Negombo</h2>
            <table className={tableClass}>
              <thead>
                <tr>
                  <th className={thClass}>Year</th>
                  <th className={thClass}>Month</th>
                  <th className={thClass}>Cumulative</th>
                </tr>
              </thead>
              <tbody>
                {filteredNegomboCum.map((item, idx)=>(
                  <tr key={idx} className={idx%2===0?"bg-gray-50":"bg-white"}>
                    <td className={tdClass}>{item.year}</td>
                    <td className={tdClass}>{months[item.month-1]}</td>
                    <td className={tdClass}>{item.cumulative}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>}
      </div>

      {/* ================= PREDICTION ================= */}
      <div>
        <h1 className="mb-6 text-2xl font-bold text-center text-gray-800 md:text-3xl">
          Mosquito Predictions ({predYear})
        </h1>
        <div className="flex justify-center mb-6">
          <label className="mr-4 font-semibold text-gray-700">Select Year:</label>
          <select value={predYear} onChange={e=>setPredYear(e.target.value)} className="px-3 py-1 border border-gray-300 rounded-lg shadow-sm">
            <option value="2026">2026</option>
            <option value="2027">2027</option>
            <option value="2028">2028</option>
          </select>
        </div>
        {predLoading ? <div className="p-10 text-center text-gray-600">Loading prediction data...</div> :
        <div className="grid gap-6 md:grid-cols-2">
          {/* Kelaniya */}
          <div className="p-4 bg-white rounded-lg shadow">
            <h2 className="mb-3 text-lg font-semibold text-blue-600">Kelaniya</h2>
            <table className={tableClass}>
              <thead>
                <tr>
                  <th className={thClass}>Year</th>
                  <th className={thClass}>Month</th>
                  <th className={thClass}>Prediction Cumulative</th>
                </tr>
              </thead>
              <tbody>
                {filteredKelaniyaPred.map((item, idx)=>(
                  <tr key={idx} className={idx%2===0?"bg-gray-50":"bg-white"}>
                    <td className={tdClass}>{item.year}</td>
                    <td className={tdClass}>{item.month}</td>
                    <td className={tdClass}>{item.prediction}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Negombo */}
          <div className="p-4 bg-white rounded-lg shadow">
            <h2 className="mb-3 text-lg font-semibold text-green-600">Negombo</h2>
            <table className={tableClass}>
              <thead>
                <tr>
                  <th className={thClass}>Year</th>
                  <th className={thClass}>Month</th>
                  <th className={thClass}>Prediction Cumulative</th>
                </tr>
              </thead>
              <tbody>
                {filteredNegomboPred.map((item, idx)=>(
                  <tr key={idx} className={idx%2===0?"bg-gray-50":"bg-white"}>
                    <td className={tdClass}>{item.year}</td>
                    <td className={tdClass}>{item.month}</td>
                    <td className={tdClass}>{item.prediction}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>}
      </div>

      {/* ================= WEATHER ================= */}
      <div>
        <h1 className="mb-6 text-2xl font-bold text-center text-gray-800 md:text-3xl">
          Weather Details ({weatherYear})
        </h1>
        <div className="flex justify-center mb-6">
          <label className="mr-4 font-semibold text-gray-700">Select Year:</label>
          <select value={weatherYear} onChange={e=>setWeatherYear(e.target.value)} className="px-3 py-1 border border-gray-300 rounded-lg shadow-sm">
            <option value="2023">2023</option>
            <option value="2024">2024</option>
            <option value="2025">2025</option>
          </select>
        </div>
        {weatherLoading ? <div className="p-10 text-center text-gray-600">Loading weather data...</div> :
        <div className="grid gap-6 md:grid-cols-2">
          {/* Kelaniya */}
          <div className="p-4 bg-white rounded-lg shadow">
            <h2 className="mb-3 text-lg font-semibold text-blue-600">Kelaniya</h2>
            <table className={tableClass}>
              <thead>
                <tr>
                  <th className={thClass}>Year</th>
                  <th className={thClass}>Month</th>
                  <th className={thClass}>Rainfall (mm)</th>
                  <th className={thClass}>Humidity (%)</th>
                  <th className={thClass}>Temperature (°C)</th>
                </tr>
              </thead>
              <tbody>
                {filteredKelaniyaWeather.map((item, idx)=>(
                  <tr key={idx} className={idx%2===0?"bg-gray-50":"bg-white"}>
                    <td className={tdClass}>{item.year}</td>
                    <td className={tdClass}>{months[item.month-1]}</td>
                    <td className={tdClass}>{item.rainfall}</td>
                    <td className={tdClass}>{item.humidity}</td>
                    <td className={tdClass}>{item.temperature}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Negombo */}
          <div className="p-4 bg-white rounded-lg shadow">
            <h2 className="mb-3 text-lg font-semibold text-green-600">Negombo</h2>
            <table className={tableClass}>
              <thead>
                <tr>
                  <th className={thClass}>Year</th>
                  <th className={thClass}>Month</th>
                  <th className={thClass}>Rainfall (mm)</th>
                  <th className={thClass}>Humidity (%)</th>
                  <th className={thClass}>Temperature (°C)</th>
                </tr>
              </thead>
              <tbody>
                {filteredNegomboWeather.map((item, idx)=>(
                  <tr key={idx} className={idx%2===0?"bg-gray-50":"bg-white"}>
                    <td className={tdClass}>{item.year}</td>
                    <td className={tdClass}>{months[item.month-1]}</td>
                    <td className={tdClass}>{item.rainfall}</td>
                    <td className={tdClass}>{item.humidity}</td>
                    <td className={tdClass}>{item.temperature}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>}
      </div>

    </div>
    </AllLayout>
        </>
    );
};