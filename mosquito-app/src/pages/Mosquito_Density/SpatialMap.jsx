import React, { useEffect, useState } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Circle, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import Navbar from '../../Components/Mosquito_Density/Navbar';
import AllLayout from '../../Components/Layout/AllLayout';

export const SpatialMap = () => {
  const [kelaniyaData, setKelaniyaData] = useState([]);
  const [negomboData, setNegomboData] = useState([]);
  const [selectedYear, setSelectedYear] = useState("2026");
  const [loading, setLoading] = useState(true);

  const startYear = 2025;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  useEffect(() => {
    fetchPredictions();
  }, []);

  const fetchPredictions = async () => {
    try {
      // Get actual mosquito data
      const actualRes = await axios.get("http://localhost:5002/api/users/get");
      const kelActual = actualRes.data.data.filter(d => d.location === "Kelaniya");
      const negActual = actualRes.data.data.filter(d => d.location === "Negombo");

      // Get weather data
      const weatherRes = await axios.get("http://localhost:5002/api/users/getWeather");
      const kelWeather = weatherRes.data.data.filter(d => d.location === "Kelaniya");
      const negWeather = weatherRes.data.data.filter(d => d.location === "Negombo");

      // Merge mosquito + weather
      const mergeData = (mosquito, weather) =>
        mosquito.map(m => {
          const w = weather.find(w => w.year === m.year && w.month === m.month) || {};
          return {
            year: m.year,
            month: m.month,
            cumulative: m.cumulative,
            rainfall: w.rainfall || 0,
            humidity: w.humidity || 0,
            temperature: w.temperature || 0,
          };
        });

      const kelMerged = mergeData(kelActual, kelWeather);
      const negMerged = mergeData(negActual, negWeather);

      // Call Flask ML API
      const kelRes = await axios.post("http://localhost:5001/predict", kelMerged);
      const negRes = await axios.post("http://localhost:5001/predict", negMerged);

      setKelaniyaData(formatData(kelRes.data.predictions));
      setNegomboData(formatData(negRes.data.predictions));
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const formatData = (predictions) => {
    let data = [];
    let year = startYear;
    let monthIndex = 0;
    predictions.forEach((value) => {
      data.push({ year, month: months[monthIndex], density: value });
      monthIndex++;
      if (monthIndex > 11) { monthIndex = 0; year++; }
    });
    return data;
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading map data...</div>;
  }

  const filteredKelaniya = kelaniyaData.filter(item => item.year.toString() === selectedYear);
  const filteredNegombo = negomboData.filter(item => item.year.toString() === selectedYear);

  const getMaxDensity = (data) => data.length ? Math.max(...data.map(item => item.density)) : 0;
  const maxKelaniya = getMaxDensity(filteredKelaniya);
  const maxNegombo = getMaxDensity(filteredNegombo);

  const allValues = kelaniyaData.concat(negomboData).map(d => d.density);
  const minDensity = Math.min(...allValues);
  const maxDensity = Math.max(...allValues);

  const getColor = (value) => {
    if (value >= minDensity + 2 * (maxDensity - minDensity) / 3) return "red";
    if (value >= minDensity + (maxDensity - minDensity) / 3) return "orange";
    return "green";
  };

  return (
    <AllLayout>
      <Navbar />
      <div className="p-6 bg-white shadow-lg rounded-2xl">
        <h2 className="mb-4 text-xl font-semibold">
          Mosquito Density Risk Map - {selectedYear}
        </h2>
        <select
          className="p-2 mb-4 border rounded-lg"
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
        >
          <option value="2026">2026</option>
          <option value="2027">2027</option>
          <option value="2028">2028</option>
        </select>

        <div className="w-full h-[500px] rounded-xl overflow-hidden">
          <MapContainer center={[7.1, 79.88]} zoom={11} style={{ height: "100%", width: "100%" }}>
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Circle center={[6.9553, 79.9220]} radius={5000}
              pathOptions={{ color: getColor(maxKelaniya), fillOpacity: 0.5 }}>
              <Popup>
                <h3 className="text-lg font-bold">Kelaniya</h3>
                <p>Year: {selectedYear}</p>
                <p>Max Density: {maxKelaniya}</p>
              </Popup>
            </Circle>
            <Circle center={[7.2083, 79.8358]} radius={5000}
              pathOptions={{ color: getColor(maxNegombo), fillOpacity: 0.5 }}>
              <Popup>
                <h3 className="text-lg font-bold">Negombo</h3>
                <p>Year: {selectedYear}</p>
                <p>Max Density: {maxNegombo}</p>
              </Popup>
            </Circle>
          </MapContainer>
        </div>

        <div className="flex gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <span>Low Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
            <span>Medium Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
            <span>High Risk</span>
          </div>
        </div>
      </div>
    </AllLayout>
  );
};