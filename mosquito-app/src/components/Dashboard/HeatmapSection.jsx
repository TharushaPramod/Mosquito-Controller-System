import React from 'react';
import SriLankaMap from './SriLankaMap';
import districtData from '../../assets/data/sri-lanka-districts.json';

const HeatmapSection = () => {
    const [selectedDistrict, setSelectedDistrict] = React.useState('All');

    // Extract district names from the JSON data
    const districts = ['All', ...districtData.features.map(feature => feature.properties.shapeName).sort()];

    return (
        <div className="bg-[#DDEDE7] rounded-xl p-4 shadow-sm h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-gray-500 text-[10px] uppercase tracking-widest font-bold">Regional Heatmap</h3>
                <select
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    className="bg-white border border-gray-100 text-gray-700 text-[11px] font-bold rounded-lg focus:ring-[#2F6A5F] focus:border-[#2F6A5F] block px-3 py-1.5 shadow-sm outline-none"
                >
                    {districts.map((district) => (
                        <option key={district} value={district}>
                            {district}
                        </option>
                    ))}
                </select>
            </div>
            <div className="flex-1 bg-white rounded-lg p-2 relative min-h-[400px] overflow-hidden">
                <SriLankaMap selectedDistrict={selectedDistrict} />
            </div>
        </div>
    );
};

export default HeatmapSection;
