import React from 'react';
import { CloudRain, FileText, AlertTriangle } from 'lucide-react';

const AlertItem = ({ icon: Icon, title, description, color, iconColor }) => {
    return (
        <div className="flex items-start gap-4 p-2.5 bg-white/50 rounded-lg hover:bg-white transition-all border border-transparent hover:border-gray-100 shadow-sm hover:shadow-md group">
            <div className={`p-2 rounded-xl ${color} ${iconColor} flex-shrink-0 transition-transform group-hover:scale-110`}>
                <Icon size={16} />
            </div>
            <div>
                <h4 className="font-bold text-gray-800 text-[11px] tracking-tight">{title}</h4>
                <p className="text-[9px] text-gray-500 mt-0.5 leading-snug">{description}</p>
            </div>
        </div>
    );
};

const AlertsList = () => {
    const alerts = [
        {
            icon: CloudRain,
            title: "High Risk Weather Conditions",
            description: "Heavy rainfall & humidity recorded in the Western Province.",
            color: "bg-red-100",
            iconColor: "text-red-500"
        },
        {
            icon: FileText,
            title: "Dengue positive lab results",
            description: "15 labs confirm a positive cases around Gampaha District.",
            color: "bg-orange-100",
            iconColor: "text-orange-500"
        },
        {
            icon: AlertTriangle, // Using AlertTriangle as a substitute for the clipboard icon in the image
            title: "School Or Public Place Outbreak Risk",
            description: "Five students in Colombo school tested positive.",
            color: "bg-green-100",
            iconColor: "text-green-600" // The image has a green icon for the last one
        }
    ];

    return (
        <div className="bg-[#DDEDE7] rounded-xl p-4 shadow-sm h-full flex flex-col">
            <h3 className="text-gray-500 text-[9px] uppercase tracking-widest font-bold mb-4 text-center">Latest Alerts</h3>

            <div className="flex flex-col gap-3">
                {alerts.map((alert, index) => (
                    <AlertItem
                        key={index}
                        icon={alert.icon}
                        title={alert.title}
                        description={alert.description}
                        color={alert.color}
                        iconColor={alert.iconColor}
                    />
                ))}
            </div>
        </div>
    );
};

export default AlertsList;
