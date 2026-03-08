import React, { useState } from 'react';

import Navbar from '../../components/Mosquito_Density/Navbar';
import AllLayout from '../../Components/Layout/AllLayout';


export const M_Reports = () => {
   const [mosquitoFile, setMosquitoFile] = useState(null);
  const [weatherFile, setWeatherFile] = useState(null);

  const [mosquitoMessage, setMosquitoMessage] = useState("");
  const [weatherMessage, setWeatherMessage] = useState("");

  const [processing, setProcessing] = useState(false);

  // ================= MOSQUITO UPLOAD =================
  const handleMosquitoUpload = async () => {
    if (!mosquitoFile) return alert("Please select a Mosquito CSV file.");

    const formData = new FormData();
    formData.append("file", mosquitoFile);

    try {
      setProcessing(true);
      const res = await fetch("http://localhost:5000/api/users/upload-csv", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload failed ❌");

      setMosquitoMessage(data.message);
      setMosquitoFile(null); // Clear file state after success
      document.getElementById("mosquitoInput").value = ""; // Reset file input
    } catch (err) {
      setMosquitoMessage(err.message || "Upload failed ❌");
    } finally {
      setProcessing(false);
    }
  };

  // ================= WEATHER UPLOAD =================
  const handleWeatherUpload = async () => {
    if (!weatherFile) return alert("Please select a Weather CSV file.");

    const formData = new FormData();
    formData.append("file", weatherFile);

    try {
      setProcessing(true);
      const res = await fetch("http://localhost:5000/api/weather/upload-weather-csv", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload failed ❌");

      setWeatherMessage(data.message);
      setWeatherFile(null); // Clear file state after success
      document.getElementById("weatherInput").value = ""; // Reset file input
    } catch (err) {
      setWeatherMessage(err.message || "Upload failed ❌");
    } finally {
      setProcessing(false);
    }
  };

    return (
        <AllLayout>
            <Navbar />
          <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-100">
      {/* ================= UPLOAD CARDS ================= */}
      <div className="grid w-full max-w-4xl grid-cols-1 gap-8 mb-10 md:grid-cols-2">
        {/* Mosquito Upload */}
        <div className="p-6 bg-white shadow-lg rounded-xl">
          <h2 className="mb-4 text-xl font-bold text-center text-green-600">
            Upload Mosquito CSV
          </h2>

          <input
            id="mosquitoInput"
            type="file"
            accept=".csv"
            onChange={(e) => setMosquitoFile(e.target.files[0])}
            className="w-full p-2 mb-4 border rounded"
          />

          <button
            onClick={handleMosquitoUpload}
            disabled={processing}
            className="w-full py-2 text-white bg-green-500 rounded hover:bg-green-600 disabled:opacity-50"
          >
            {processing ? "Processing..." : "Upload Mosquito Data"}
          </button>

          {mosquitoMessage && (
            <p className="mt-3 text-sm text-center text-green-700">
              {mosquitoMessage}
            </p>
          )}
        </div>

        {/* Weather Upload */}
        <div className="p-6 bg-white shadow-lg rounded-xl">
          <h2 className="mb-4 text-xl font-bold text-center text-blue-600">
            Upload Weather CSV
          </h2>

          <input
            id="weatherInput"
            type="file"
            accept=".csv"
            onChange={(e) => setWeatherFile(e.target.files[0])}
            className="w-full p-2 mb-4 border rounded"
          />

          <button
            onClick={handleWeatherUpload}
            disabled={processing}
            className="w-full py-2 text-white bg-blue-500 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {processing ? "Processing..." : "Upload Weather Data"}
          </button>

          {weatherMessage && (
            <p className="mt-3 text-sm text-center text-blue-700">
              {weatherMessage}
            </p>
          )}
        </div>
      </div>

      {/* ================= CSV GUIDELINES ================= */}
      <div className="w-full max-w-4xl p-6 bg-white shadow-lg rounded-xl">
        <h2 className="mb-4 text-lg font-bold text-gray-800">
          CSV Upload Guidelines
        </h2>
        <ul className="space-y-2 text-gray-700 list-disc list-inside">
          <li>
            <strong>Mosquito CSV:</strong> Include columns <code>Location, Year, Month, Cumulative</code>.
          </li>
          <li>
            <strong>Weather CSV:</strong> Include columns <code>Year, Month, Rainfall, Humidity, Temperature</code>.
          </li>
          <li>
            <strong>Filename conventions:</strong>
            <ul className="ml-6 list-disc list-inside">
              <li>For Kelaniya: <code>Kelaniya_weather_clean.csv</code></li>
              <li>For Negombo: <code>Negombo_weather_clean.csv</code></li>
            </ul>
          </li>
          <li>
            Ensure CSV does not contain empty rows or invalid values. Missing location or year/month will cause upload errors.
          </li>
          <li>
            After upload, data will be immediately processed and saved to the database.
          </li>
        </ul>
      </div>
    </div>
        </AllLayout>
    );
};