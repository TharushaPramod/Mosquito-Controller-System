import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Navbar from "../../components/Mosquito_Density/Navbar.jsx";
import AllLayout from "../../Components/Layout/AllLayout.jsx";

export const Analysis = () => {
  const [kelaniyaData, setKelaniyaData] = useState([]);
  const [negomboData, setNegomboData] = useState([]);
  const [kelaniyaPred, setKelaniyaPred] = useState([]);
  const [negomboPred, setNegomboPred] = useState([]);
  const [selectedYear, setSelectedYear] = useState("2026");
  const [downloadFormat, setDownloadFormat] = useState("pdf");
  const [loading, setLoading] = useState(true);

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const actualRes = await fetch("http://localhost:5002/api/users/get");
      const actualData = await actualRes.json();
      const kelActual = actualData.data.filter((d) => d.location === "Kelaniya");
      const negActual = actualData.data.filter((d) => d.location === "Negombo");

      setKelaniyaData(formatActual(kelActual));
      setNegomboData(formatActual(negActual));

      // Fetch weather data
      const weatherRes = await fetch("http://localhost:5002/api/users/getWeather");
      const weatherData = await weatherRes.json();
      const kelWeather = weatherData.data.filter((d) => d.location === "Kelaniya");
      const negWeather = weatherData.data.filter((d) => d.location === "Negombo");

      // Merge mosquito + weather by year/month
      const mergeData = (mosquito, weather) =>
        mosquito.map((m) => {
          const w = weather.find((w) => w.year === m.year && w.month === m.month) || {};
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

      // Send merged data to Flask
      const kelPredRes = await fetch("http://localhost:5001/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(kelMerged),
      });
      const kelPredData = await kelPredRes.json();

      const negPredRes = await fetch("http://localhost:5001/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(negMerged),
      });
      const negPredData = await negPredRes.json();

      setKelaniyaPred(formatPrediction(kelPredData.predictions, 2026));
      setNegomboPred(formatPrediction(negPredData.predictions, 2026));

      setLoading(false);
    } catch (err) {
      console.error("Fetch error:", err);
      setLoading(false);
    }
  };

  const formatActual = (data) => {
    return data
      .sort((a, b) => (a.year === b.year ? a.month - b.month : a.year - b.year))
      .map((item) => ({
        date: `${item.year}-${months[item.month - 1]}`,
        actual: item.cumulative,
        prediction: null,
      }));
  };

  const formatPrediction = (predictions, startYear) => {
    let year = startYear;
    let month = 0;

    return predictions.map((value) => {
      const obj = {
        date: `${year}-${months[month]}`,
        actual: null,
        prediction: Math.round(value),
      };
      month++;
      if (month > 11) {
        month = 0;
        year++;
      }
      return obj;
    });
  };

  const downloadCSVFile = (rows, filename) => {
    const csvContent = rows
      .map((row) =>
        row
          .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const kelCombined = [...kelaniyaData, ...kelaniyaPred];
  const negCombined = [...negomboData, ...negomboPred];

  if (loading) return <div className="p-10">Loading...</div>;

  const allMergedData = kelCombined.map((item, index) => ({
    year: item.date.split("-")[0],
    month: item.date.split("-")[1],
    Kelaniya: item.prediction || item.actual || 0,
    Negombo: negCombined[index]?.prediction || negCombined[index]?.actual || 0,
  }));

  const filteredKelaniya =
    selectedYear === "all"
      ? kelCombined
      : kelCombined.filter((d) => d.date.startsWith(selectedYear));

  const filteredNegombo =
    selectedYear === "all"
      ? negCombined
      : negCombined.filter((d) => d.date.startsWith(selectedYear));

  const mergedData =
    selectedYear === "all"
      ? allMergedData
      : filteredKelaniya.map((item, index) => ({
        year: item.date.split("-")[0],
        month: item.date.split("-")[1],
        Kelaniya: item.prediction || item.actual || 0,
        Negombo: filteredNegombo[index]?.prediction || filteredNegombo[index]?.actual || 0,
      }));

  const downloadPDF = () => {
    const doc = new jsPDF();
    const title =
      selectedYear === "all"
        ? "Mosquito Density Prediction Report - All Years"
        : `Mosquito Density Prediction Report - ${selectedYear}`;

    const fileName =
      selectedYear === "all"
        ? "Mosquito_Prediction_All_Years.pdf"
        : `Mosquito_Prediction_${selectedYear}.pdf`;

    const tableData = mergedData.map((item) => [
      item.year,
      item.month,
      item.Kelaniya,
      item.Negombo,
    ]);

    doc.setFontSize(16);
    doc.text(title, 14, 20);
    autoTable(doc, {
      startY: 30,
      head: [["Year", "Month", "Kelaniya", "Negombo"]],
      body: tableData,
    });
    doc.save(fileName);
  };

  const downloadMainCSV = () => {
    const rows = [
      ["Year", "Month", "Kelaniya", "Negombo"],
      ...mergedData.map((item) => [
        item.year,
        item.month,
        item.Kelaniya,
        item.Negombo,
      ]),
    ];

    const fileName =
      selectedYear === "all"
        ? "Mosquito_Prediction_All_Years.csv"
        : `Mosquito_Prediction_${selectedYear}.csv`;

    downloadCSVFile(rows, fileName);
  };

  const downloadLocationPDF = (location) => {
    const doc = new jsPDF();
    doc.setFontSize(16);

    const data =
      location === "Kelaniya"
        ? selectedYear === "all"
          ? kelCombined
          : kelCombined.filter((item) => item.date.startsWith(selectedYear))
        : selectedYear === "all"
          ? negCombined
          : negCombined.filter((item) => item.date.startsWith(selectedYear));

    const title =
      selectedYear === "all"
        ? `${location} - Actual + Predicted Report (All Years)`
        : `${location} - Actual + Predicted Report (${selectedYear})`;

    const fileName =
      selectedYear === "all"
        ? `${location}_Mosquito_Report_All_Years.pdf`
        : `${location}_Mosquito_Report_${selectedYear}.pdf`;

    doc.text(title, 14, 20);

    const tableData = data.map((item) => [
      item.date,
      item.actual !== null ? item.actual : "-",
      item.prediction !== null ? item.prediction : "-",
    ]);

    autoTable(doc, {
      startY: 30,
      head: [["Date", "Actual", "Predicted"]],
      body: tableData,
    });

    doc.save(fileName);
  };

  const downloadLocationCSV = (location) => {
    const data =
      location === "Kelaniya"
        ? selectedYear === "all"
          ? kelCombined
          : kelCombined.filter((item) => item.date.startsWith(selectedYear))
        : selectedYear === "all"
          ? negCombined
          : negCombined.filter((item) => item.date.startsWith(selectedYear));

    const rows = [
      ["Date", "Actual", "Predicted"],
      ...data.map((item) => [
        item.date,
        item.actual !== null ? item.actual : "-",
        item.prediction !== null ? item.prediction : "-",
      ]),
    ];

    const fileName =
      selectedYear === "all"
        ? `${location}_Mosquito_Report_All_Years.csv`
        : `${location}_Mosquito_Report_${selectedYear}.csv`;

    downloadCSVFile(rows, fileName);
  };

  const handleMainDownload = () => {
    if (downloadFormat === "csv") {
      downloadMainCSV();
    } else {
      downloadPDF();
    }
  };

  const handleLocationDownload = (location) => {
    if (downloadFormat === "csv") {
      downloadLocationCSV(location);
    } else {
      downloadLocationPDF(location);
    }
  };

  return (
    <AllLayout>
      <Navbar />

      <div className="min-h-screen p-8 bg-gray-100">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-gray-800">
              Mosquito Density Analysis Dashboard
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-4 mb-8">
            <button
              onClick={() => handleLocationDownload("Kelaniya")}
              className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Download Kelaniya
            </button>

            <button
              onClick={() => handleLocationDownload("Negombo")}
              className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
            >
              Download Negombo
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 mb-10 lg:grid-cols-2">
          <div className="flex-1 p-6 bg-white border border-gray-200 shadow-lg rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  Kelaniya - Actual + Predicted
                </h2>
                <p className="text-sm text-gray-500">
                  Historical and forecast mosquito density trend
                </p>
              </div>
              <div className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
                Kelaniya
              </div>
            </div>

            <ResponsiveContainer width="100%" height={260}>
              <LineChart
                data={kelCombined}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "#6b7280" }}
                  tickLine={false}
                  axisLine={false}
                  minTickGap={20}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#6b7280" }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="#2563eb"
                  strokeWidth={3.5}
                  dot={{ r: 4, strokeWidth: 3, fill: "#ffffff" }}
                  activeDot={{ r: 6, strokeWidth: 2, fill: "#ffffff" }}
                  name="Actual"
                />
                <Line
                  type="monotone"
                  dataKey="prediction"
                  stroke="#ef4444"
                  strokeWidth={3.5}
                  strokeDasharray="6 6"
                  dot={{ r: 4, strokeWidth: 3, fill: "#ffffff" }}
                  activeDot={{ r: 6, strokeWidth: 2, fill: "#ffffff" }}
                  name="Predicted"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="flex-1 p-6 bg-white border border-gray-200 shadow-lg rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  Negombo - Actual + Predicted
                </h2>
                <p className="text-sm text-gray-500">
                  Historical and forecast mosquito density trend
                </p>
              </div>
              <div className="px-3 py-1 text-xs font-medium rounded-full text-emerald-700 bg-emerald-100">
                Negombo
              </div>
            </div>

            <ResponsiveContainer width="100%" height={260}>
              <LineChart
                data={negCombined}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "#6b7280" }}
                  tickLine={false}
                  axisLine={false}
                  minTickGap={20}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#6b7280" }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="#10b981"
                  strokeWidth={3.5}
                  dot={{ r: 4, strokeWidth: 3, fill: "#ffffff" }}
                  activeDot={{ r: 6, strokeWidth: 2, fill: "#ffffff" }}
                  name="Actual"
                />
                <Line
                  type="monotone"
                  dataKey="prediction"
                  stroke="#ef4444"
                  strokeWidth={3.5}
                  strokeDasharray="6 6"
                  dot={{ r: 4, strokeWidth: 3, fill: "#ffffff" }}
                  activeDot={{ r: 6, strokeWidth: 2, fill: "#ffffff" }}
                  name="Predicted"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 mb-8">
          <button
            onClick={handleMainDownload}
            className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Download Report
          </button>

          <select
            className="px-4 py-2 border rounded-lg"
            value={downloadFormat}
            onChange={(e) => setDownloadFormat(e.target.value)}
          >
            <option value="pdf">PDF</option>
            <option value="csv">CSV</option>
          </select>

          <select
            className="px-4 py-2 border rounded-lg"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            <option value="2026">2026</option>
            <option value="2027">2027</option>
            <option value="2028">2028</option>
            <option value="all">All Years</option>
          </select>
        </div>

        <div className="p-6 mb-8 bg-white shadow-lg rounded-2xl">
          <h2 className="mb-4 text-xl font-semibold">
            Monthly Trend Comparison
            {selectedYear === "all" ? " - All Years" : ` - ${selectedYear}`}
          </h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={mergedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="Kelaniya"
                stroke="#3b82f6"
                strokeWidth={3.5}
                dot={{ r: 4, strokeWidth: 3, fill: "#ffffff" }}
                activeDot={{ r: 6, strokeWidth: 2, fill: "#ffffff" }}
              />
              <Line
                type="monotone"
                dataKey="Negombo"
                stroke="#10b981"
                strokeWidth={3.5}
                dot={{ r: 4, strokeWidth: 3, fill: "#ffffff" }}
                activeDot={{ r: 6, strokeWidth: 2, fill: "#ffffff" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="p-6 bg-white shadow-lg rounded-2xl">
          <h2 className="mb-4 text-xl font-semibold">
            Monthly Comparison (Bar Chart)
            {selectedYear === "all" ? " - All Years" : ` - ${selectedYear}`}
          </h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={mergedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Kelaniya" fill="#3b82f6" />
              <Bar dataKey="Negombo" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </AllLayout>
  );
};