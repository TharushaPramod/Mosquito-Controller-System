import React from 'react';

const ActionCard = ({ icon: Icon, image, label, color = "bg-blue-100", iconColor = "text-blue-500", onClick }) => {
    return (
        <button
            onClick={onClick}
            className="bg-[#DDEDE7] rounded-xl p-4 shadow-sm flex flex-col items-center justify-center gap-3 hover:shadow-md transition-all hover:bg-[#dbece9] h-full w-full"
        >
            <div className={`w-20 h-20 rounded-lg ${color} flex items-center justify-center ${iconColor} overflow-hidden`}>
                {image ? (
                    <img src={image} alt={label} className="w-full h-full object-cover" />
                ) : (
                    <Icon size={32} />
                )}
            </div>
            <span className="text-gray-700 font-medium text-center text-sm">{label}</span>
        </button>
    );
};

export default ActionCard;
