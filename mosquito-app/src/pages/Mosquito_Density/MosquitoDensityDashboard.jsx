import React from "react";
import { Link } from "react-router-dom";
import { LayoutDashboard, Table2, Map, FileText, ShieldAlert } from "lucide-react";
import Navbar from "../../components/Mosquito_Density/Navbar";
import AllLayout from "../../Components/Layout/AllLayout";

const cardItems = [
    {
    title: "Reports upload",
    description: "Upload mosquito and weather CSV reports.",
    path: "/m_reports",
    icon: FileText,
  },
  {
    title: "Analysis",
    description: "View mosquito density charts and prediction comparison.",
    path: "/analysis",
    icon: LayoutDashboard,
  },
  {
    title: "Table",
    description: "View cumulative, prediction, and weather tables.",
    path: "/forecast",
    icon: Table2,
  },
  {
    title: "Spatial Map",
    description: "View mosquito density risk map by location.",
    path: "/spatialmap",
    icon: Map,
  },
  {
    title: "Instructions",
    description: "View health officer actions for low, medium, and high mosquito density.",
    path: "/mosquito-instructions",
    icon: ShieldAlert,
  },
];

export const MosquitoDensityDashboard = () => {
  return (
    <AllLayout>
      <Navbar />

      <div className="min-h-screen p-8 bg-gray-100">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold text-gray-800">
              Mosquito Density Prediction System
            </h1>
            <p className="text-gray-600">
              Select a module to continue
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-5">
            {cardItems.map(({ title, description, path, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className="p-6 transition-all duration-200 bg-white border border-gray-200 shadow-md rounded-2xl hover:shadow-xl hover:-translate-y-1"
              >
                <div className="w-14 h-14 rounded-xl bg-[#2F6A5F]/10 text-[#2F6A5F] flex items-center justify-center mb-4">
                  <Icon className="w-7 h-7" />
                </div>

                <h2 className="mb-2 text-xl font-semibold text-gray-800">
                  {title}
                </h2>

                <p className="mb-5 text-sm text-gray-600">
                  {description}
                </p>

                <div className="inline-flex items-center text-sm font-medium text-[#2F6A5F]">
                  Open Page →
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AllLayout>
  );
};

export default MosquitoDensityDashboard;