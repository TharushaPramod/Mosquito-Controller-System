import React from 'react';
import { Bell, Calendar, ChevronDown, User } from 'lucide-react';

const Header = ({ title }) => {
    return (
        <header className="flex items-center justify-between px-8 py-4 bg-[#F0F7F5]">
            {/* Left side */}
            <div>
                {title && <h1 className="text-xl font-bold text-gray-800">{title}</h1>}
            </div>

            {/* Right side - Profile, Notifications, Date */}
            <div className="flex items-center gap-6">
                {/* User Profile */}
                <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                        <User size={18} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold text-gray-800 leading-tight">Dr. Silva</span>
                        <span className="text-xs text-gray-500 leading-tight">Cheif Medical Officer</span>
                    </div>
                    <ChevronDown size={16} className="text-gray-400 ml-1" />
                </div>

                {/* Notification */}
                <div className="relative">
                    <button className="p-2 bg-[#FFE4E4] rounded-lg text-[#FF4D4D] hover:bg-[#FFD1D1] transition-colors">
                        <Bell size={20} />
                    </button>
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-[#F0F7F5]"></span>
                </div>

                {/* Date */}
                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200 text-gray-600 text-sm font-medium shadow-sm">
                    <Calendar size={16} className="text-[#2F6A5F]" />
                    <span>Sat, Dec 13, 2025 1.18 PM</span>
                </div>
            </div>
        </header>
    );
};

export default Header;
