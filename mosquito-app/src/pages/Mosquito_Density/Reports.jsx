import React, { useState } from 'react';
import { FileText, Settings, Trash2, Download, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import Navbar from '../../components/Mosquito_Density/Navbar';
import 'jspdf-autotable';

export const Reports = () => {
    const [generating, setGenerating] = useState(false);

    // --- FUNCTION: Generate Official PDF Report ---
    const generatePDF = async () => {
        setGenerating(true);

        try {
            // 1. Fetch latest data from your Python backend
            const response = await fetch('http://localhost:5000/api/predict');
            const data = await response.json();

            // 2. Initialize PDF
            const doc = new jsPDF();
            const today = new Date().toLocaleDateString();

            // 3. Header Section
            doc.setFillColor(30, 64, 175); // Blue color (bg-blue-800)
            doc.rect(0, 0, 210, 40, 'F'); // Blue header banner

            doc.setTextColor(255, 255, 255);
            doc.setFontSize(22);
            doc.text("Gampaha MOH - Dengue Surveillance", 14, 20);

            doc.setFontSize(12);
            doc.text(`Weekly Intelligence Report • Generated: ${today}`, 14, 32);

            // 4. Executive Summary
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(14);
            doc.text("1. Executive Summary", 14, 55);

            doc.setFontSize(11);
            doc.setTextColor(80, 80, 80);
            const summaryText = "Based on the latest Machine Learning analysis using Random Forest Regression, the predicted mosquito density for the upcoming week shows a HIGH RISK trend. Immediate vector control measures are recommended in identified zones.";
            doc.splitTextToSize(summaryText, 180).forEach((line, i) => {
                doc.text(line, 14, 65 + (i * 6));
            });

            // 5. Prediction Data Table
            doc.setFontSize(14);
            doc.setTextColor(0, 0, 0);
            doc.text("2. 7-Day Density Forecast", 14, 95);

            // Create table columns and rows from your data
            const tableColumn = ["Day", "Predicted Density Index (BI)", "Risk Status"];
            const tableRows = data.map(item => [
                item.day,
                item.predicted,
                item.predicted > 70 ? "CRITICAL" : (item.predicted > 50 ? "High" : "Moderate")
            ]);

            doc.autoTable({
                head: [tableColumn],
                body: tableRows,
                startY: 100,
                theme: 'grid',
                headStyles: { fillColor: [30, 64, 175] }, // Match header blue
                styles: { fontSize: 10, cellPadding: 3 },
            });

            // 6. Signature Area
            const finalY = doc.lastAutoTable.finalY + 30;
            doc.line(14, finalY, 80, finalY); // Line for signature
            doc.setFontSize(10);
            doc.text("Authorized Signature", 14, finalY + 5);
            doc.text("Regional Epidemiologist", 14, finalY + 10);

            // 7. Save File
            doc.save(`MOH_Gampaha_Report_${today.replace(/\//g, '-')}.pdf`);

        } catch (error) {
            console.error("Report Generation Failed:", error);
            alert("Failed to fetch data for the report. Is the backend running?");
        } finally {
            setGenerating(false);
        }
    };

    return (
        <>
            <Navbar />
            <div className="min-h-screen p-8 bg-[#F0F7F5]">
            <h1 className="mb-2 text-3xl font-bold text-gray-900">Reports & Intelligence</h1>
            <p className="mb-8 text-gray-600">Export official surveillance documents for the Ministry of Health.</p>

            {/* --- ACTION CARD --- */}
            <div className="p-8 bg-white border border-blue-100 shadow-lg rounded-xl">
                <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
                    <div>
                        <h3 className="text-xl font-bold text-blue-900">Weekly Forecast Report</h3>
                        <p className="max-w-lg mt-2 text-gray-600">
                            Generates a complete PDF dossier including the executive summary,
                            7-day prediction table, and risk assessment signatures.
                        </p>
                    </div>

                    <button
                        onClick={generatePDF}
                        disabled={generating}
                        className={`flex items-center gap-3 px-6 py-4 font-bold text-white rounded-xl shadow-md transition-all ${generating ? 'bg-blue-400 cursor-wait' : 'bg-blue-600 hover:bg-blue-700 hover:scale-105'
                            }`}
                    >
                        {generating ? <Loader2 className="w-6 h-6 animate-spin" /> : <Download className="w-6 h-6" />}
                        {generating ? "Generating..." : "Download Official PDF"}
                    </button>
                </div>

                {/* Divider */}
                <hr className="my-8 border-gray-100" />

                <h3 className="mb-4 text-sm font-bold tracking-wider text-gray-400 uppercase">Archived Reports</h3>
                <ul className="space-y-3">
                    <li className="flex items-center justify-between p-4 transition-colors border border-gray-100 rounded-lg cursor-pointer hover:bg-blue-50 group">
                        <div className="flex items-center gap-3">
                            <FileText className="text-gray-400 group-hover:text-blue-500" />
                            <span className="font-medium text-gray-700">Week 52 - Dec 2025.pdf</span>
                        </div>
                        <span className="text-xs text-gray-400">2.4 MB</span>
                    </li>
                    <li className="flex items-center justify-between p-4 transition-colors border border-gray-100 rounded-lg cursor-pointer hover:bg-blue-50 group">
                        <div className="flex items-center gap-3">
                            <FileText className="text-gray-400 group-hover:text-blue-500" />
                            <span className="font-medium text-gray-700">Week 51 - Dec 2025.pdf</span>
                        </div>
                        <span className="text-xs text-gray-400">2.1 MB</span>
                    </li>
                </ul>
            </div>

            {/* --- ADMIN ZONE --- */}
            <div className="p-8 mt-8 bg-white border border-red-100 shadow-lg rounded-xl">
                <h3 className="flex items-center gap-2 mb-4 text-xl font-semibold text-gray-800">
                    <Settings className="w-5 h-5" /> Admin Configuration
                </h3>
                <p className="mb-6 text-sm text-gray-500">Restricted access area for system calibration.</p>

                <div className="flex gap-4">
                    <button className="px-5 py-3 font-medium text-gray-700 transition-colors bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200">
                        Configure Model Parameters
                    </button>
                    <button className="flex items-center gap-2 px-5 py-3 font-medium text-white transition-colors bg-red-600 rounded-lg shadow-sm hover:bg-red-700">
                        <Trash2 className="w-4 h-4" /> Reset Historical Data
                    </button>
                </div>
            </div>
        </div>
    </>
    );
};