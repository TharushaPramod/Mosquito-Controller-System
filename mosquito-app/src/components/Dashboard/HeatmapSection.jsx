import React from 'react';
import SriLankaMap from './SriLankaMap';

const HeatmapSection = ({ selectedDistrict = 'All', diseaseType = 'All' }) => {
    return (
        <div className="h-full flex flex-col">
            <div className="flex-1 bg-white rounded-[1.5rem] relative min-h-[400px] overflow-hidden">
                <SriLankaMap selectedDistrict={selectedDistrict} diseaseType={diseaseType} />
            </div>
        </div>
    );
};

export default HeatmapSection;
