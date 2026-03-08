import React from 'react';

const ActionCard = ({ icon: Icon, image, label, color, iconColor, onClick }) => {
    return (
        <button
            onClick={onClick}
            className="bg-[#DDEDE7] rounded-xl px-3 py-5 shadow-sm flex flex-col items-center justify-center gap-2 hover:shadow-md transition-all hover:bg-[#dbece9] w-full"
        >
            <div className={`w-11 h-11 rounded-lg ${color} flex items-center justify-center ${iconColor} overflow-hidden shadow-inner`}>
                {image ? (
                    <img src={image} alt={label} className="w-full h-full object-cover" />
                ) : (
                    Icon ? <Icon size={18} /> : null
                )}
            </div>
            <span className="text-gray-700 font-bold text-center text-[11px] tracking-tight uppercase">{label}</span>
        </button>
    );
};

export default ActionCard;
