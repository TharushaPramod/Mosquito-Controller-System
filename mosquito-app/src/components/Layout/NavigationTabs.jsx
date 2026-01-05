import React from 'react';
import { LayoutDashboard, Layers, AlertCircle, FileText, Map as MapIcon } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import clsx from 'clsx';

const NavigationTabs = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
        { label: 'Data Integration', icon: Layers, path: '/data-integration' },
        { label: 'Alerts', icon: AlertCircle, path: '/alerts' },
        { label: 'Reports', icon: FileText, path: '/reports' },
        { label: 'Map', icon: MapIcon, path: '/map' },
    ];

    const getActiveItem = () => {
        if (location.pathname === '/') return 'Dashboard';
        if (location.pathname.startsWith('/data-integration') || location.pathname.startsWith('/facility')) return 'Data Integration';
        if (location.pathname.startsWith('/alerts')) return 'Alerts';
        if (location.pathname.startsWith('/reports')) return 'Reports';
        if (location.pathname.startsWith('/map')) return 'Map';
        return 'Dashboard';
    };

    const activeItem = getActiveItem();

    return (
        <div className="bg-[#F0F7F5] px-8 border-b border-[#2F6A5F]/10">
            <div className="flex justify-center gap-8">
                {menuItems.map((item) => {
                    const isActive = activeItem === item.label;
                    return (
                        <button
                            key={item.label}
                            onClick={() => navigate(item.path)}
                            className={clsx(
                                "flex items-center gap-2 px-1 py-4 border-b-2 transition-all duration-300 font-medium text-sm relative",
                                isActive
                                    ? "border-[#2F6A5F] text-[#2F6A5F]"
                                    : "border-transparent text-[#4A635F] hover:text-[#2F6A5F] hover:border-[#2F6A5F]/30"
                            )}
                        >
                            <item.icon size={18} className={isActive ? "text-[#2F6A5F]" : "text-[#4A635F]"} />
                            <span>{item.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default NavigationTabs;
