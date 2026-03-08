import React from "react";
import Navbar from "../../components/Mosquito_Density/Navbar";
import AllLayout from "../../Components/Layout/AllLayout";
import { AlertTriangle, ShieldAlert, Siren, CheckCircle2 } from "lucide-react";

const instructionData = [
  {
    level: "Low Density",
    color: "border-green-200 bg-green-50 text-green-700",
    icon: CheckCircle2,
    actions: [
      "Continue routine mosquito surveillance in identified locations.",
      "Inspect drains, gutters, stagnant water containers, and nearby breeding places.",
      "Educate residents on household mosquito prevention methods.",
      "Maintain weekly monitoring and record mosquito density data.",
    ],
  },
  {
    level: "Medium Density",
    color: "border-yellow-200 bg-yellow-50 text-yellow-700",
    icon: AlertTriangle,
    actions: [
      "Increase field inspections in moderate-risk areas.",
      "Issue public awareness notices to surrounding communities.",
      "Remove standing water sources and conduct environmental cleaning campaigns.",
      "Prepare targeted larvicide or fogging operations if density continues to rise.",
      "Monitor high-risk zones more frequently and report updates to health officers.",
    ],
  },
  {
    level: "High Density",
    color: "border-red-200 bg-red-50 text-red-700",
    icon: Siren,
    actions: [
      "Immediately deploy vector control teams to high-risk locations.",
      "Start urgent fogging and larval source reduction activities.",
      "Notify local public health officers and municipal authorities.",
      "Conduct door-to-door awareness programs in affected communities.",
      "Increase daily monitoring and submit emergency situation reports.",
      "Prioritize hospitals, schools, markets, and residential clusters for rapid action.",
    ],
  },
];

const MosquitoInstructions = () => {
  return (
    <AllLayout>
      <Navbar />

      <div className="min-h-screen p-8 bg-gray-100">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold text-gray-800">
              Mosquito Density Action Instructions
            </h1>
            <p className="text-gray-600">
              Guidance for health officers based on mosquito density level.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {instructionData.map(({ level, color, icon: Icon, actions }) => (
              <div
                key={level}
                className={`rounded-2xl border p-6 shadow-md ${color}`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-white/70">
                    <Icon className="w-7 h-7" />
                  </div>
                  <h2 className="text-xl font-bold">{level}</h2>
                </div>

                <ul className="space-y-3 text-sm leading-6">
                  {actions.map((action, index) => (
                    <li
                      key={index}
                      className="px-4 py-3 text-gray-800 bg-white/70 rounded-xl"
                    >
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="p-6 mt-8 bg-white border border-gray-200 shadow-md rounded-2xl">
            <div className="flex items-center gap-3 mb-3">
              <ShieldAlert className="w-6 h-6 text-[#2F6A5F]" />
              <h3 className="text-lg font-semibold text-gray-800">
                Recommended Response Note
              </h3>
            </div>
            <p className="leading-7 text-gray-600">
              These instructions help public health officers decide the level of
              intervention required when mosquito density increases. The response
              should always be supported by field inspection data, local health
              guidelines, and environmental risk conditions.
            </p>
          </div>
        </div>
      </div>
    </AllLayout>
  );
};

export default MosquitoInstructions;